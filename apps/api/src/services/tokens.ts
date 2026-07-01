import type { Context } from "hono";
import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";
import crypto from "node:crypto";
import { idParamSchema, tokenCreateSchema } from "../contracts.js";
import type { TokenCreateInput } from "../contracts.js";
import type { DbClient } from "../db/client.js";
import { requireIpAllowed } from "../middleware/ip-allow.js";
import { incrementTokenUsage } from "../middleware/quota.js";
import type { AppBindings } from "../app.js";

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

function parseIpAllow(value: string | null): string[] {
  if (!value) {
    return [];
  }
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
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
    ipAllow: parseIpAllow(token.ipAllow),
    expiresAt: token.expiresAt,
    revokedAt: token.revokedAt,
    createdAt: token.createdAt,
  };
}

export function generateTokenSecret(): string {
  return `ax_${crypto.randomBytes(24).toString("base64url")}`;
}

export async function createTokenForSub(db: DbClient, input: TokenCreateInput): Promise<CreatedToken> {
  const subExists = db.sqlite.prepare("SELECT id FROM subs WHERE id = ?").get(input.subId);
  if (!subExists) {
    throw new HTTPException(404, { message: "Bound subscription not found" });
  }
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
      input.note,
      hash,
      prefix,
      input.subId,
      input.quotaBytes,
      JSON.stringify(input.ipAllow),
      input.expiresAt,
      createdAt,
    );
  const token: TokenRecord = {
    id: Number(result.lastInsertRowid),
    name: input.name,
    note: input.note,
    hash,
    prefix,
    subId: input.subId,
    quotaBytes: input.quotaBytes,
    usedBytes: 0,
    ipAllow: JSON.stringify(input.ipAllow),
    expiresAt: input.expiresAt,
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

export function listAllTokens(db: DbClient): TokenPublic[] {
  const rows = db.sqlite
    .prepare(
      `SELECT id, name, note, hash, prefix, sub_id AS subId, quota_bytes AS quotaBytes, used_bytes AS usedBytes,
        ip_allow AS ipAllow, expires_at AS expiresAt, revoked_at AS revokedAt, created_at AS createdAt
       FROM tokens ORDER BY id DESC`,
    )
    .all();
  return rows.flatMap((row) => {
    const token = rowToToken(row);
    return token ? [publicToken(token)] : [];
  });
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
    try {
      requireIpAllowed(sourceIp, parseIpAllow(token.ipAllow));
    } catch {
      continue;
    }
    if (await bcrypt.compare(secret, token.hash)) {
      return token;
    }
  }

  throw new HTTPException(401, { message: "Invalid subscription token" });
}

export function consumeTokenQuota(db: DbClient, token: TokenRecord, bytes: number): TokenRecord {
  return incrementTokenUsage(db, token, bytes);
}

export function listTokens(c: Context<AppBindings>): Response {
  return c.json({ ok: true, data: { tokens: listAllTokens(c.get("db")) } });
}

export async function createToken(c: Context<AppBindings>): Promise<Response> {
  const input = tokenCreateSchema.parse(await c.req.json());
  const created = await createTokenForSub(c.get("db"), input);
  return c.json({ ok: true, data: { token: created.token, secret: created.secret } }, 201);
}

export function revokeToken(c: Context<AppBindings>): Response {
  const { id } = idParamSchema.parse(c.req.param());
  const now = new Date().toISOString();
  const result = c.get("db").sqlite.prepare("UPDATE tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL").run(now, id);
  if (result.changes === 0) {
    throw new HTTPException(404, { message: "Token not found" });
  }
  return c.json({ ok: true, data: { revoked: true } });
}
