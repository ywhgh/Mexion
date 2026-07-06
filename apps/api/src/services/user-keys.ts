import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { HTTPException } from "hono/http-exception";
import type { DbClient } from "../db/client.js";
import { requireIpAllowed } from "../middleware/ip-allow.js";
import { getUserById, type UserPublic } from "./users.js";

export type UserKeyStatus = "active" | "disabled" | "exhausted";

export type UserKeyRecord = {
  id: number;
  userId: number;
  name: string;
  note: string;
  hash: string;
  prefix: string;
  groupId: number | null;
  quotaLimit: number | null;
  quotaUsed: number;
  modelAllow: string[] | null;
  ipAllow: string[];
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  status: UserKeyStatus;
  createdAt: string;
};

export type UserKeyPublic = Omit<UserKeyRecord, "hash" | "userId"> & { userId?: never };

export type UserKeyUsageDay = {
  date: string;
  calls: number;
  tokens: number;
  cost: number;
  avgLatency: number;
  errors: number;
};

export type CreateUserKeyInput = {
  name: string;
  note?: string | undefined;
  groupId?: number | null | undefined;
  quotaLimit?: number | null | undefined;
  modelAllow?: string[] | null | undefined;
  ipAllow?: string[] | undefined;
  expiresAt?: string | null | undefined;
};

export type UpdateUserKeyInput = {
  name?: string | undefined;
  note?: string | undefined;
  status?: UserKeyStatus | undefined;
};

function parseJsonStringArray(value: unknown, nullable: true): string[] | null;
function parseJsonStringArray(value: unknown, nullable?: false): string[];
function parseJsonStringArray(value: unknown, nullable = false): string[] | null {
  if (value === null || value === undefined || value === "") return nullable ? null : [];
  try {
    const parsed = JSON.parse(String(value)) as unknown;
    if (!Array.isArray(parsed)) return nullable ? null : [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return nullable ? null : [];
  }
}

function parseStatus(value: unknown): UserKeyStatus {
  if (value === "disabled" || value === "exhausted") return value;
  return "active";
}

function utcDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function recentUtcDays(length: number): { days: string[]; startIso: string } {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = today - (length - 1) * 86400000;
  const days = Array.from({ length }, (_item, index) => utcDay(new Date(start + index * 86400000)));
  return { days, startIso: new Date(start).toISOString() };
}

export function rowToUserKey(row: unknown): UserKeyRecord | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number" || typeof value.hash !== "string") return null;
  return {
    id: value.id,
    userId: Number(value.userId ?? value.user_id),
    name: String(value.name ?? ""),
    note: String(value.note ?? ""),
    hash: value.hash,
    prefix: String(value.prefix ?? ""),
    groupId: value.groupId === null || value.groupId === undefined ? null : Number(value.groupId),
    quotaLimit: value.quotaLimit === null || value.quotaLimit === undefined ? null : Number(value.quotaLimit),
    quotaUsed: Number(value.quotaUsed ?? 0),
    modelAllow: parseJsonStringArray(value.modelAllow, true),
    ipAllow: parseJsonStringArray(value.ipAllow),
    expiresAt: value.expiresAt === null || value.expiresAt === undefined ? null : String(value.expiresAt),
    revokedAt: value.revokedAt === null || value.revokedAt === undefined ? null : String(value.revokedAt),
    lastUsedAt: value.lastUsedAt === null || value.lastUsedAt === undefined ? null : String(value.lastUsedAt),
    status: parseStatus(value.status),
    createdAt: String(value.createdAt ?? ""),
  };
}

export function publicUserKey(key: UserKeyRecord): UserKeyPublic {
  return {
    id: key.id,
    name: key.name,
    note: key.note,
    prefix: key.prefix,
    groupId: key.groupId,
    quotaLimit: key.quotaLimit,
    quotaUsed: key.quotaUsed,
    modelAllow: key.modelAllow,
    ipAllow: key.ipAllow,
    expiresAt: key.expiresAt,
    revokedAt: key.revokedAt,
    lastUsedAt: key.lastUsedAt,
    status: key.status,
    createdAt: key.createdAt,
  };
}

export function generateUserKeySecret(): string {
  return `mx_${crypto.randomBytes(32).toString("base64url")}`;
}

export async function createUserKey(db: DbClient, userId: number, input: CreateUserKeyInput): Promise<{ key: UserKeyPublic; secret: string }> {
  const name = input.name.trim();
  if (!name) throw new HTTPException(400, { message: "Key name required" });
  const secret = generateUserKeySecret();
  const hash = await bcrypt.hash(secret, 12);
  const prefix = secret.slice(0, 8);
  const now = new Date().toISOString();
  const result = db.sqlite
    .prepare(
      `INSERT INTO user_api_keys (user_id, name, note, hash, prefix, group_id, quota_limit, quota_used, model_allow, ip_allow, expires_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'active', ?)`,
    )
    .run(
      userId,
      name,
      input.note ?? "",
      hash,
      prefix,
      input.groupId ?? null,
      input.quotaLimit ?? null,
      input.modelAllow ? JSON.stringify(input.modelAllow) : null,
      JSON.stringify(input.ipAllow ?? []),
      input.expiresAt ?? null,
      now,
    );
  const key = getUserKeyById(db, userId, Number(result.lastInsertRowid));
  return { key: publicUserKey(key), secret };
}

export function getUserKeyById(db: DbClient, userId: number, keyId: number): UserKeyRecord {
  const row = db.sqlite
    .prepare(
      `SELECT id, user_id AS userId, name, note, hash, prefix, group_id AS groupId, quota_limit AS quotaLimit,
        quota_used AS quotaUsed, model_allow AS modelAllow, ip_allow AS ipAllow, expires_at AS expiresAt,
        revoked_at AS revokedAt, last_used_at AS lastUsedAt, status, created_at AS createdAt
       FROM user_api_keys WHERE id = ? AND user_id = ?`,
    )
    .get(keyId, userId);
  const key = rowToUserKey(row);
  if (!key) throw new HTTPException(404, { message: "API key not found" });
  return key;
}

export function listUserKeys(db: DbClient, userId: number): UserKeyPublic[] {
  const rows = db.sqlite
    .prepare(
      `SELECT id, user_id AS userId, name, note, hash, prefix, group_id AS groupId, quota_limit AS quotaLimit,
        quota_used AS quotaUsed, model_allow AS modelAllow, ip_allow AS ipAllow, expires_at AS expiresAt,
        revoked_at AS revokedAt, last_used_at AS lastUsedAt, status, created_at AS createdAt
       FROM user_api_keys WHERE user_id = ? ORDER BY id DESC`,
    )
    .all(userId);
  return rows.flatMap((row) => {
    const key = rowToUserKey(row);
    return key ? [publicUserKey(key)] : [];
  });
}

export function revokeUserKey(db: DbClient, userId: number, keyId: number): void {
  getUserKeyById(db, userId, keyId);
  const result = db.sqlite
    .prepare("UPDATE user_api_keys SET revoked_at = ?, status = 'disabled' WHERE id = ? AND user_id = ?")
    .run(new Date().toISOString(), keyId, userId);
  if (result.changes === 0) throw new HTTPException(403, { message: "API key cannot be revoked" });
}

export function updateUserKey(db: DbClient, userId: number, keyId: number, input: UpdateUserKeyInput): UserKeyPublic {
  const current = getUserKeyById(db, userId, keyId);
  const next = {
    name: input.name === undefined ? current.name : input.name.trim(),
    note: input.note === undefined ? current.note : input.note,
    status: input.status === undefined ? current.status : input.status,
  };
  if (!next.name) throw new HTTPException(400, { message: "Key name required" });
  db.sqlite.prepare("UPDATE user_api_keys SET name = ?, note = ?, status = ? WHERE id = ? AND user_id = ?").run(
    next.name,
    next.note,
    next.status,
    keyId,
    userId,
  );
  return publicUserKey(getUserKeyById(db, userId, keyId));
}

export function getUserKeyUsage(db: DbClient, userId: number, keyId: number): { days: UserKeyUsageDay[] } {
  const key = getUserKeyById(db, userId, keyId);
  const window = recentUtcDays(7);
  const byDay = new Map<string, UserKeyUsageDay>();
  for (const day of window.days) {
    byDay.set(day, { date: day, calls: 0, tokens: 0, cost: 0, avgLatency: 0, errors: 0 });
  }

  const rows = db.sqlite
    .prepare(
      `SELECT substr(ts, 1, 10) AS day,
        COUNT(*) AS calls,
        COALESCE(SUM(COALESCE(input_tokens, 0) + COALESCE(output_tokens, 0)), 0) AS tokens,
        COALESCE(SUM(COALESCE(cost, 0)), 0) AS cost,
        COALESCE(AVG(NULLIF(duration_ms, 0)), 0) AS avgLatency,
        COALESCE(SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END), 0) AS errors
       FROM request_logs
       WHERE user_id = ? AND key_prefix = ? AND ts >= ?
       GROUP BY substr(ts, 1, 10)
       ORDER BY day ASC`,
    )
    .all(userId, key.prefix, window.startIso) as Array<{
    day: string;
    calls: number;
    tokens: number;
    cost: number;
    avgLatency: number;
    errors: number;
  }>;

  for (const row of rows) {
    if (!byDay.has(row.day)) continue;
    byDay.set(row.day, {
      date: row.day,
      calls: Number(row.calls ?? 0),
      tokens: Number(row.tokens ?? 0),
      cost: Number(row.cost ?? 0),
      avgLatency: Math.round(Number(row.avgLatency ?? 0)),
      errors: Number(row.errors ?? 0),
    });
  }

  return { days: window.days.map((day) => byDay.get(day) ?? { date: day, calls: 0, tokens: 0, cost: 0, avgLatency: 0, errors: 0 }) };
}

export async function verifyUserKey(db: DbClient, secret: string, sourceIp: string): Promise<{ user: UserPublic; key: UserKeyRecord }> {
  if (!secret.startsWith("mx_")) throw new HTTPException(401, { message: "Invalid API key" });
  const prefix = secret.slice(0, 8);
  const rows = db.sqlite
    .prepare(
      `SELECT id, user_id AS userId, name, note, hash, prefix, group_id AS groupId, quota_limit AS quotaLimit,
        quota_used AS quotaUsed, model_allow AS modelAllow, ip_allow AS ipAllow, expires_at AS expiresAt,
        revoked_at AS revokedAt, last_used_at AS lastUsedAt, status, created_at AS createdAt
       FROM user_api_keys WHERE prefix = ?`,
    )
    .all(prefix);
  for (const row of rows) {
    const key = rowToUserKey(row);
    if (!key) continue;
    if (key.status !== "active" || key.revokedAt) continue;
    if (key.expiresAt && Date.parse(key.expiresAt) <= Date.now()) continue;
    if (key.quotaLimit !== null && key.quotaUsed >= key.quotaLimit) continue;
    try {
      requireIpAllowed(sourceIp, key.ipAllow);
    } catch {
      continue;
    }
    if (await bcrypt.compare(secret, key.hash)) {
      const user = getUserById(db, key.userId);
      if (!user || user.status !== "active") break;
      db.sqlite.prepare("UPDATE user_api_keys SET last_used_at = ? WHERE id = ?").run(new Date().toISOString(), key.id);
      return { user, key: { ...key, lastUsedAt: new Date().toISOString() } };
    }
  }
  throw new HTTPException(401, { message: "Invalid API key" });
}

