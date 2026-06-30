import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";
import crypto from "node:crypto";
import type { DbClient } from "../db/client.js";

export type TokenRecord = {
  id: number;
  name: string;
  note: string;
  hash: string;
  prefix: string;
  subId: number;
  quotaBytes: number | null;
  usedBytes: number;
  ipAllow: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type TokenPublic = {
  id: number;
  name: string;
  note: string;
  prefix: string;
  subId: number;
  quotaBytes: number | null;
  usedBytes: number;
  ipAllow: string[];
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type CreatedToken = {
  token: TokenPublic;
  secret: string;
};

function rowToToken(row: unknown): TokenRecord | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number" || typeof value.hash !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: String(value.name ?? ""),
    note: String(value.note ?? ""),
    hash: value.hash,
    prefix: String(value.prefix ?? ""),
    subId: Number(value.subId ?? value.sub_id),
    quotaBytes: value.quotaBytes === null || value.quotaBytes === undefined ? null : Number(value.quotaBytes),
    usedBytes: Number(value.usedBytes ?? 0),
    ipAllow: value.ipAllow === null || value.ipAllow === undefined ? null : String(value.ipAllow),
    expiresAt: value.expiresAt === null || value.expiresAt === undefined ? null : String(value.expiresAt),
    revokedAt: value.revokedAt === null || value.revokedAt === undefined ? null : String(value.revokedAt),
    createdAt: String(value.createdAt ?? ""),
  };
}

export function publicToken(token: TokenRecord): TokenPublic {
  return {
    id: token.id,
    name: token.name,
    note: token.note,
    prefix: token.prefix,
    subId: token.subId,
    quotaBytes: token.quotaBytes,
    usedBytes: token.usedBytes,
    ipAllow: token.ipAllow ? (JSON.parse(token.ipAllow) as string[]) : [],
    expiresAt: token.expiresAt,
    revokedAt: token.revokedAt,
    createdAt: token.createdAt,
  };
}

export function generateTokenSecret(): string {
  return `ax_${crypto.randomBytes(24).toString("base64url")}`;
}

export async function createTokenForSub(
  db: DbClient,
  input: {
    name: string;
    note?: string;
    subId: number;
    quotaBytes?: number | null;
    expiresAt?: string | null;
    ipAllow?: string[];
  },
): Promise<CreatedToken> {
  const secret = generateTokenSecret();
  const hash = await bcrypt.hash(secret, 12);
  const prefix = secret.slice(0, 8);
  const createdAt = new Date().toISOString();
  const result = db.sqlite
    .prepare(
      `INSERT INTO tokens (name, note, hash, prefix, sub_id, quota_bytes, used_bytes, ip_allow, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.note ?? "",
      hash,
      prefix,
      input.subId,
      input.quotaBytes ?? null,
      JSON.stringify(input.ipAllow ?? []),
      input.expiresAt ?? null,
      createdAt,
    );
  const token: TokenRecord = {
    id: Number(result.lastInsertRowid),
    name: input.name,
    note: input.note ?? "",
    hash,
    prefix,
    subId: input.subId,
    quotaBytes: input.quotaBytes ?? null,
    usedBytes: 0,
    ipAllow: JSON.stringify(input.ipAllow ?? []),
    expiresAt: input.expiresAt ?? null,
    revokedAt: null,
    createdAt,
  };
  return { token: publicToken(token), secret };
}

export function listTokensForSub(db: DbClient, subId: number): TokenPublic[] {
  const rows = db.sqlite
    .prepare(
      `SELECT id, name, note, hash, prefix, sub_id AS subId, quota_bytes AS quotaBytes, used_bytes AS usedBytes,
        ip_allow AS ipAllow, expires_at AS expiresAt, revoked_at AS revokedAt, created_at AS createdAt
       FROM tokens WHERE sub_id = ? ORDER BY id DESC`,
    )
    .all(subId);
  return rows.flatMap((row) => {
    const token = rowToToken(row);
    return token ? [publicToken(token)] : [];
  });
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  return parts.reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
}

function ipMatchesRule(ip: string, rule: string): boolean {
  if (!rule.includes("/")) {
    return ip === rule;
  }
  const [base, prefixText] = rule.split("/");
  const prefix = Number(prefixText);
  const ipNum = ipToInt(ip);
  const baseNum = ipToInt(base ?? "");
  if (ipNum === null || baseNum === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipNum & mask) === (baseNum & mask);
}

function tokenAllowsIp(token: TokenRecord, sourceIp: string): boolean {
  const rules = token.ipAllow ? (JSON.parse(token.ipAllow) as string[]) : [];
  if (rules.length === 0) {
    return true;
  }
  return rules.some((rule) => ipMatchesRule(sourceIp, rule));
}

export async function verifyTokenSecret(db: DbClient, secret: string, sourceIp: string): Promise<TokenRecord> {
  const prefix = secret.slice(0, 8);
  const rows = db.sqlite
    .prepare(
      `SELECT id, name, note, hash, prefix, sub_id AS subId, quota_bytes AS quotaBytes, used_bytes AS usedBytes,
        ip_allow AS ipAllow, expires_at AS expiresAt, revoked_at AS revokedAt, created_at AS createdAt
       FROM tokens WHERE prefix = ? AND revoked_at IS NULL`,
    )
    .all(prefix);

  for (const row of rows) {
    const token = rowToToken(row);
    if (!token) {
      continue;
    }
    if (token.expiresAt && Date.parse(token.expiresAt) <= Date.now()) {
      continue;
    }
    if (!tokenAllowsIp(token, sourceIp)) {
      continue;
    }
    if (await bcrypt.compare(secret, token.hash)) {
      return token;
    }
  }

  throw new HTTPException(401, { message: "Invalid subscription token" });
}

export function consumeTokenQuota(db: DbClient, token: TokenRecord, bytes: number): TokenRecord {
  if (token.quotaBytes !== null && token.usedBytes + bytes > token.quotaBytes) {
    throw new HTTPException(402, { message: "Token quota exhausted" });
  }
  db.sqlite.prepare("UPDATE tokens SET used_bytes = used_bytes + ? WHERE id = ?").run(bytes, token.id);
  return { ...token, usedBytes: token.usedBytes + bytes };
}
