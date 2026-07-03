import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { HTTPException } from "hono/http-exception";
import type { DbClient } from "../db/client.js";

export type UserPublic = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  balance: number;
  quotaLimit: number;
  quotaUsed: number;
  role: "user" | "admin";
  status: "active" | "banned";
  checkinStreak: number;
  lastCheckinAt: string | null;
  createdAt: string;
  updatedAt: string;
  display_name: string | null;
  quota: number;
  used_quota: number;
};

export type UserSettings = {
  lang: "zh" | "en";
  theme: "light" | "dark" | "system";
  notifyEmail: boolean;
  quotaAlertThreshold: number;
};

export type UserSettingsPatch = {
  lang?: "zh" | "en" | undefined;
  theme?: "light" | "dark" | "system" | undefined;
  notifyEmail?: boolean | undefined;
  quotaAlertThreshold?: number | undefined;
};

export type RegisterUserInput = {
  username: string;
  email: string;
  password: string;
  displayName?: string | null;
};

export type LoginUserInput = {
  emailOrUsername: string;
  password: string;
};

const SESSION_DAYS = 7;
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeUsername(username: string): string {
  return username.trim();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseRole(value: unknown): "user" | "admin" {
  return value === "admin" ? "admin" : "user";
}

function parseStatus(value: unknown): "active" | "banned" {
  return value === "banned" ? "banned" : "active";
}

export function rowToUserPublic(row: unknown): UserPublic | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") return null;
  const displayName = value.displayName === null || value.displayName === undefined ? null : String(value.displayName);
  const quotaLimit = Number(value.quotaLimit ?? 0);
  const quotaUsed = Number(value.quotaUsed ?? 0);
  return {
    id: value.id,
    username: String(value.username ?? ""),
    email: String(value.email ?? ""),
    displayName,
    balance: Number(value.balance ?? 0),
    quotaLimit,
    quotaUsed,
    role: parseRole(value.role),
    status: parseStatus(value.status),
    checkinStreak: Number(value.checkinStreak ?? 0),
    lastCheckinAt: value.lastCheckinAt === null || value.lastCheckinAt === undefined ? null : String(value.lastCheckinAt),
    createdAt: String(value.createdAt ?? ""),
    updatedAt: String(value.updatedAt ?? ""),
    display_name: displayName,
    quota: quotaLimit,
    used_quota: quotaUsed,
  };
}

function getUserByWhere(db: DbClient, where: string, value: string | number): UserPublic | null {
  const row = db.sqlite
    .prepare(
      `SELECT id, username, email, display_name AS displayName, balance, quota_limit AS quotaLimit,
        quota_used AS quotaUsed, role, status, checkin_streak AS checkinStreak,
        last_checkin_at AS lastCheckinAt, created_at AS createdAt, updated_at AS updatedAt
       FROM users WHERE ${where} = ?`,
    )
    .get(value);
  return rowToUserPublic(row);
}

function getUserPasswordRow(db: DbClient, emailOrUsername: string): { id: number; passwordHash: string } | null {
  const lookup = emailOrUsername.trim();
  const row = db.sqlite
    .prepare("SELECT id, password_hash AS passwordHash FROM users WHERE email = ? OR username = ?")
    .get(lookup.toLowerCase(), lookup);
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number" || typeof value.passwordHash !== "string") return null;
  return { id: value.id, passwordHash: value.passwordHash };
}

export function getUserById(db: DbClient, id: number): UserPublic | null {
  return getUserByWhere(db, "id", id);
}

export async function registerUser(db: DbClient, input: RegisterUserInput): Promise<UserPublic> {
  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);
  if (!USERNAME_RE.test(username)) throw new HTTPException(400, { message: "Username must be 3-32 letters, numbers, _ or -" });
  if (!EMAIL_RE.test(email)) throw new HTTPException(400, { message: "Invalid email" });
  if (input.password.length < 8) throw new HTTPException(400, { message: "Password must be at least 8 characters" });
  const existing = db.sqlite.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email);
  if (existing) throw new HTTPException(409, { message: "Username or email already exists" });
  const passwordHash = await bcrypt.hash(input.password, 12);
  const now = new Date().toISOString();
  const result = db.sqlite
    .prepare(
      `INSERT INTO users (username, email, password_hash, display_name, balance, quota_limit, quota_used, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, 0, 'user', 'active', ?, ?)`,
    )
    .run(username, email, passwordHash, input.displayName ?? username, now, now);
  const user = getUserById(db, Number(result.lastInsertRowid));
  if (!user) throw new HTTPException(500, { message: "User creation failed" });
  return user;
}

export function generateSessionToken(): string {
  return `mxs_${crypto.randomBytes(32).toString("base64url")}`;
}

export async function loginUser(db: DbClient, input: LoginUserInput): Promise<{ user: UserPublic; sessionToken: string }> {
  const row = getUserPasswordRow(db, input.emailOrUsername);
  if (!row) throw new HTTPException(401, { message: "Invalid credentials" });
  const valid = await bcrypt.compare(input.password, row.passwordHash);
  if (!valid) throw new HTTPException(401, { message: "Invalid credentials" });
  const user = getUserById(db, row.id);
  if (!user) throw new HTTPException(401, { message: "Invalid credentials" });
  if (user.status === "banned") throw new HTTPException(403, { message: "User banned" });
  const sessionToken = generateSessionToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.sqlite
    .prepare("INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(user.id, sessionToken, expires.toISOString(), now.toISOString());
  db.sqlite.prepare("UPDATE users SET updated_at = ? WHERE id = ?").run(now.toISOString(), user.id);
  const updated = getUserById(db, user.id) ?? user;
  return { user: updated, sessionToken };
}

export function logoutUser(db: DbClient, sessionToken: string): void {
  if (!sessionToken) return;
  db.sqlite.prepare("DELETE FROM user_sessions WHERE session_token = ?").run(sessionToken);
}

export function getSessionUser(db: DbClient, sessionToken: string): UserPublic | null {
  if (!sessionToken) return null;
  const row = db.sqlite
    .prepare(
      `SELECT u.id, u.username, u.email, u.display_name AS displayName, u.balance,
        u.quota_limit AS quotaLimit, u.quota_used AS quotaUsed, u.role, u.status,
        u.checkin_streak AS checkinStreak, u.last_checkin_at AS lastCheckinAt,
        u.created_at AS createdAt, u.updated_at AS updatedAt, s.expires_at AS expiresAt
       FROM user_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.session_token = ?`,
    )
    .get(sessionToken) as (Record<string, unknown> & { expiresAt?: string }) | undefined;
  if (!row) return null;
  if (!row.expiresAt || Date.parse(row.expiresAt) <= Date.now()) {
    db.sqlite.prepare("DELETE FROM user_sessions WHERE session_token = ?").run(sessionToken);
    return null;
  }
  return rowToUserPublic(row);
}

function utcDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function dailyCheckin(db: DbClient, userId: number): { granted: number; streak: number } {
  const user = getUserById(db, userId);
  if (!user) throw new HTTPException(404, { message: "User not found" });
  const now = new Date();
  const today = utcDay(now);
  if (user.lastCheckinAt && utcDay(new Date(user.lastCheckinAt)) === today) {
    throw new HTTPException(409, { message: "Already checked in today" });
  }
  let streak = 1;
  if (user.lastCheckinAt) {
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    streak = utcDay(new Date(user.lastCheckinAt)) === utcDay(yesterday) ? user.checkinStreak + 1 : 1;
  }
  let granted = 500;
  if (streak % 30 === 0) granted = 10_000;
  else if (streak % 7 === 0) granted = 2_000;
  db.sqlite
    .prepare("UPDATE users SET quota_limit = quota_limit + ?, checkin_streak = ?, last_checkin_at = ?, updated_at = ? WHERE id = ?")
    .run(granted, streak, now.toISOString(), now.toISOString(), userId);
  return { granted, streak };
}

const defaultSettings: UserSettings = {
  lang: "zh",
  theme: "light",
  notifyEmail: true,
  quotaAlertThreshold: 80,
};

function settingKey(userId: number, key: keyof UserSettings): string {
  return `user:${userId}:${key}`;
}

export function getUserSetting(db: DbClient, userId: number): UserSettings {
  const rows = db.sqlite.prepare("SELECT key, value FROM settings WHERE key LIKE ?").all(`user:${userId}:%`) as Array<{ key: string; value: string }>;
  const settings: UserSettings = { ...defaultSettings };
  for (const row of rows) {
    const key = row.key.replace(`user:${userId}:`, "") as keyof UserSettings;
    if (key === "lang" && (row.value === "zh" || row.value === "en")) settings.lang = row.value;
    if (key === "theme" && (row.value === "light" || row.value === "dark" || row.value === "system")) settings.theme = row.value;
    if (key === "notifyEmail") settings.notifyEmail = row.value === "true";
    if (key === "quotaAlertThreshold") settings.quotaAlertThreshold = Number.parseInt(row.value, 10) || defaultSettings.quotaAlertThreshold;
  }
  return settings;
}

export function updateUserSetting(
  db: DbClient,
  userId: number,
  settings: UserSettingsPatch,
): UserSettings {
  const now = new Date().toISOString();
  const upsert = db.sqlite.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
  if (settings.lang !== undefined) upsert.run(settingKey(userId, "lang"), settings.lang, now);
  if (settings.theme !== undefined) upsert.run(settingKey(userId, "theme"), settings.theme, now);
  if (settings.notifyEmail !== undefined) upsert.run(settingKey(userId, "notifyEmail"), String(settings.notifyEmail), now);
  if (settings.quotaAlertThreshold !== undefined) upsert.run(settingKey(userId, "quotaAlertThreshold"), String(settings.quotaAlertThreshold), now);
  return getUserSetting(db, userId);
}

export function listAllUsers(db: DbClient): UserPublic[] {
  const rows = db.sqlite
    .prepare(
      `SELECT id, username, email, display_name AS displayName, balance, quota_limit AS quotaLimit,
        quota_used AS quotaUsed, role, status, checkin_streak AS checkinStreak,
        last_checkin_at AS lastCheckinAt, created_at AS createdAt, updated_at AS updatedAt
       FROM users ORDER BY created_at DESC`,
    )
    .all();
  return rows.flatMap((row) => {
    const user = rowToUserPublic(row);
    return user ? [user] : [];
  });
}

export type AdminUpdateUserInput = {
  status?: "active" | "banned" | undefined;
  balance?: number | undefined;
  role?: "user" | "admin" | undefined;
};

export function adminUpdateUser(db: DbClient, id: number, input: AdminUpdateUserInput, currentAdminId?: number): UserPublic {
  const current = getUserById(db, id);
  if (!current) throw new HTTPException(404, { message: "User not found" });
  if (input.role !== undefined && currentAdminId === id) throw new HTTPException(400, { message: "Cannot change your own role" });
  const next = {
    status: input.status ?? current.status,
    balance: input.balance ?? current.balance,
    role: input.role ?? current.role,
  };
  db.sqlite
    .prepare("UPDATE users SET status = ?, balance = ?, role = ?, updated_at = ? WHERE id = ?")
    .run(next.status, next.balance, next.role, new Date().toISOString(), id);
  const updated = getUserById(db, id);
  if (!updated) throw new HTTPException(500, { message: "User update failed" });
  return updated;
}


