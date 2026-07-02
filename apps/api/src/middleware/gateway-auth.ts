import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import type { AppBindings } from "../app.js";
import { sourceIpFromHeaders } from "./ip-allow.js";
import { findAdminById, publicAdmin } from "../services/auth.js";
import { verifyUserKey, type UserKeyRecord } from "../services/user-keys.js";

export type GatewayVariables = {
  gatewayKey: UserKeyRecord | null;
};

function jwtSecret(): string {
  return process.env.MEXION_JWT_SECRET ?? "mexion-local-development-secret";
}

async function tryAdminJwt(c: Parameters<Parameters<typeof createMiddleware<AppBindings>>[0]>[0], token: string): Promise<boolean> {
  try {
    const payload = await verify(token, jwtSecret(), "HS256");
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0) return false;
    const admin = findAdminById(c.get("db"), id);
    if (!admin) return false;
    c.set("admin", publicAdmin(admin));
    const synthetic = {
      id: 0,
      username: admin.username,
      email: `${admin.username}@admin.local`,
      displayName: admin.username,
      balance: Number.MAX_SAFE_INTEGER,
      quotaLimit: Number.MAX_SAFE_INTEGER,
      quotaUsed: 0,
      role: "admin" as const,
      status: "active" as const,
      checkinStreak: 0,
      lastCheckinAt: null,
      createdAt: admin.createdAt,
      updatedAt: admin.createdAt,
      display_name: admin.username,
      quota: Number.MAX_SAFE_INTEGER,
      used_quota: 0,
    };
    c.set("gatewayUser", synthetic);
    c.set("gatewayKey", null);
    return true;
  } catch {
    return false;
  }
}

function bearerToken(header: string | undefined): string {
  if (!header) return "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

export const gatewayAuth = createMiddleware<AppBindings>(async (c, next) => {
  const url = new URL(c.req.url);
  if (url.searchParams.has("key") || url.searchParams.has("api_key") || url.searchParams.has("auth_token")) {
    throw new HTTPException(400, { message: "Query string API keys are not allowed" });
  }
  const token = bearerToken(c.req.header("authorization")) || c.req.header("x-api-key") || "";
  if (!token) throw new HTTPException(401, { message: "Gateway API key required" });
  if (token.startsWith("mx_")) {
    const verified = await verifyUserKey(c.get("db"), token, sourceIpFromHeaders(c.req.raw.headers));
    c.set("gatewayUser", verified.user);
    c.set("gatewayKey", verified.key);
    await next();
    return;
  }
  if (await tryAdminJwt(c, token)) {
    await next();
    return;
  }
  throw new HTTPException(401, { message: "Gateway API key required" });
});
