import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { bootstrapSchema, passwordChangeSchema, signInSchema } from "../contracts.js";
import type { AppBindings } from "../app.js";
import type { DbClient } from "../db/client.js";

export type AdminRecord = {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicAdmin = {
  id: number;
  username: string;
  createdAt: string;
};

const cookieName = "mexion_session";
const oneWeek = 60 * 60 * 24 * 7;

function jwtSecret(): string {
  return process.env.MEXION_JWT_SECRET ?? "mexion-local-development-secret";
}

export function publicAdmin(admin: AdminRecord): PublicAdmin {
  return {
    id: admin.id,
    username: admin.username,
    createdAt: admin.createdAt,
  };
}

export function hasAdmin(db: DbClient): boolean {
  const row = db.sqlite.prepare("SELECT id FROM admins LIMIT 1").get();
  return Boolean(row);
}

export function findAdminByUsername(db: DbClient, username: string): AdminRecord | null {
  const row = db.sqlite
    .prepare("SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM admins WHERE username = ?")
    .get(username);
  return row ? (row as AdminRecord) : null;
}

export function findAdminById(db: DbClient, id: number): AdminRecord | null {
  const row = db.sqlite
    .prepare("SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM admins WHERE id = ?")
    .get(id);
  return row ? (row as AdminRecord) : null;
}

export async function createAdmin(db: DbClient, username: string, password: string): Promise<PublicAdmin> {
  if (hasAdmin(db)) {
    throw new HTTPException(409, { message: "Administrator already initialized" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const createdAt = new Date().toISOString();
  const result = db.sqlite
    .prepare("INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)")
    .run(username, passwordHash, createdAt);
  return {
    id: Number(result.lastInsertRowid),
    username,
    createdAt,
  };
}

export async function issueSession(c: Context<AppBindings>, admin: PublicAdmin): Promise<void> {
  const token = await sign(
    {
      sub: String(admin.id),
      username: admin.username,
      exp: Math.floor(Date.now() / 1000) + oneWeek,
    },
    jwtSecret(),
  );
  setCookie(c, cookieName, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneWeek,
  });
}

export function clearSession(c: Context<AppBindings>): void {
  setCookie(c, cookieName, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function adminFromCookie(c: Context<AppBindings>): Promise<PublicAdmin | null> {
  const token = getCookie(c, cookieName);
  if (!token) {
    return null;
  }
  try {
    const payload = await verify(token, jwtSecret(), "HS256");
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    const admin = findAdminById(c.get("db"), id);
    return admin ? publicAdmin(admin) : null;
  } catch (error) {
    console.warn("Invalid admin session", error);
    return null;
  }
}

export async function bootstrap(c: Context<AppBindings>): Promise<Response> {
  const body = bootstrapSchema.parse(await c.req.json());
  const admin = await createAdmin(c.get("db"), body.username, body.password);
  await issueSession(c, admin);
  return c.json({ ok: true, data: { admin } }, 201);
}

export async function signIn(c: Context<AppBindings>): Promise<Response> {
  const body = signInSchema.parse(await c.req.json());
  const admin = findAdminByUsername(c.get("db"), body.username);
  if (!admin) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(body.password, admin.passwordHash);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  const safeAdmin = publicAdmin(admin);
  await issueSession(c, safeAdmin);
  return c.json({ ok: true, data: { admin: safeAdmin } });
}

export async function me(c: Context<AppBindings>): Promise<Response> {
  const admin = await adminFromCookie(c);
  return c.json({ ok: true, data: { bootstrapped: hasAdmin(c.get("db")), admin } });
}

export function signOut(c: Context<AppBindings>): Response {
  clearSession(c);
  return c.json({ ok: true, data: { signedOut: true } });
}

export async function changePassword(c: Context<AppBindings>, adminId: number): Promise<Response> {
  const body = passwordChangeSchema.parse(await c.req.json());
  const admin = findAdminById(c.get("db"), adminId);
  if (!admin) {
    throw new HTTPException(404, { message: "Administrator not found" });
  }
  const valid = await bcrypt.compare(body.currentPassword, admin.passwordHash);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  const passwordHash = await bcrypt.hash(body.nextPassword, 12);
  c.get("db").sqlite.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(passwordHash, adminId);
  return c.json({ ok: true, data: { changed: true } });
}


