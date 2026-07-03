import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "../app.js";
import { adminFromCookie } from "../services/auth.js";
import { getSessionUser, type UserPublic } from "../services/users.js";

export type UserVariables = {
  user: UserPublic;
};

export function getUserSessionTokenFromRequest(c: { req: { header: (name: string) => string | undefined } }, cookieValue?: string): string {
  const auth = c.req.header("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return cookieValue ?? "";
}

function adminAsUser(admin: Awaited<ReturnType<typeof adminFromCookie>>): UserPublic | null {
  if (!admin) return null;
  return {
    id: -admin.id,
    username: admin.username,
    email: "",
    displayName: admin.username,
    balance: 0,
    quotaLimit: 0,
    quotaUsed: 0,
    role: "admin",
    status: "active",
    checkinStreak: 0,
    lastCheckinAt: null,
    createdAt: admin.createdAt,
    updatedAt: admin.createdAt,
    display_name: admin.username,
    quota: 0,
    used_quota: 0,
  };
}

export const requireUser = createMiddleware<AppBindings>(async (c, next) => {
  const token = getUserSessionTokenFromRequest(c, getCookie(c, "mexion_user_session"));
  const user = getSessionUser(c.get("db"), token) ?? adminAsUser(await adminFromCookie(c));
  if (!user) throw new HTTPException(401, { message: "User session required" });
  if (user.status === "banned") throw new HTTPException(403, { message: "User banned" });
  c.set("user", user);
  await next();
});
