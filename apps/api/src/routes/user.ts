import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import type { AppBindings } from "../app.js";
import { requireUser } from "../middleware/require-user.js";
import { adminFromCookie, findAdminByUsername, issueSession, publicAdmin } from "../services/auth.js";
import { listGroups } from "../services/channels.js";
import { dailyCheckin, getSessionUser, getUserSetting, loginUser, logoutUser, registerUser, updateUserSetting } from "../services/users.js";
import bcrypt from "bcryptjs";

export const userRoutes = new Hono<AppBindings>();

const loginSchema = z.object({
  email: z.string().trim().optional(),
  username: z.string().trim().optional(),
  emailOrUsername: z.string().trim().optional(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.string().trim().email(),
  password: z.string().min(8),
  displayName: z.string().trim().max(80).optional(),
  inviteCode: z.string().trim().optional(),
});

const settingsSchema = z.object({
  lang: z.enum(["zh", "en"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  notifyEmail: z.boolean().optional(),
  quotaAlertThreshold: z.number().int().min(1).max(100).optional(),
});

const oneWeek = 60 * 60 * 24 * 7;

function setUserCookie(c: Parameters<typeof setCookie>[0], token: string): void {
  setCookie(c, "mexion_user_session", token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneWeek,
  });
}

function clearUserCookie(c: Parameters<typeof setCookie>[0]): void {
  setCookie(c, "mexion_user_session", "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

userRoutes.post("/register", async (c) => {
  const input = registerSchema.parse(await c.req.json());
  const user = await registerUser(c.get("db"), {
    username: input.username,
    email: input.email,
    password: input.password,
    displayName: input.displayName ?? input.username,
  });
  return c.json({ ok: true, data: user }, 201);
});

userRoutes.post("/login", async (c) => {
  const input = loginSchema.parse(await c.req.json());
  const emailOrUsername = input.emailOrUsername || input.email || input.username || "";
  try {
    const { user, sessionToken } = await loginUser(c.get("db"), { emailOrUsername, password: input.password });
    setUserCookie(c, sessionToken);
    return c.json({ ok: true, data: { user, sessionToken } });
  } catch (error) {
    const admin = findAdminByUsername(c.get("db"), emailOrUsername);
    if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) throw error;
    const safeAdmin = publicAdmin(admin);
    await issueSession(c, safeAdmin);
    const user = {
      id: safeAdmin.id,
      username: safeAdmin.username,
      email: "",
      displayName: safeAdmin.username,
      display_name: safeAdmin.username,
      balance: 0,
      quota: 0,
      used_quota: 0,
      role: "admin",
      status: "active",
      createdAt: safeAdmin.createdAt,
      updatedAt: safeAdmin.createdAt,
    };
    return c.json({ ok: true, data: { user, sessionToken: "" } });
  }
});

userRoutes.post("/logout", (c) => {
  const token = getCookie(c, "mexion_user_session") || "";
  logoutUser(c.get("db"), token);
  clearUserCookie(c);
  return c.json({ ok: true, data: { signedOut: true } });
});

userRoutes.get("/self", async (c, next) => {
  const admin = await adminFromCookie(c);
  if (admin) {
    const user = {
      id: admin.id,
      username: admin.username,
      email: "",
      displayName: admin.username,
      display_name: admin.username,
      balance: 0,
      quota: 0,
      used_quota: 0,
      role: "admin",
      status: "active",
      createdAt: admin.createdAt,
      updatedAt: admin.createdAt,
    };
    return c.json({ ok: true, data: { user, sessionToken: "" } });
  }
  await next();
}, requireUser, (c) => {
  const user = c.get("user");
  return c.json({ ok: true, data: { user, sessionToken: "" } });
});
userRoutes.post("/checkin", requireUser, (c) => c.json({ ok: true, data: dailyCheckin(c.get("db"), c.get("user").id) }));
userRoutes.get("/setting", requireUser, (c) => c.json({ ok: true, data: getUserSetting(c.get("db"), c.get("user").id) }));
userRoutes.patch("/setting", requireUser, async (c) => {
  const input = settingsSchema.parse(await c.req.json());
  return c.json({ ok: true, data: updateUserSetting(c.get("db"), c.get("user").id, input) });
});


const LEVELS = [
  { id: 1, name: "探索者", minQuota: 0 },
  { id: 2, name: "建造者", minQuota: 100000 },
  { id: 3, name: "先锋", minQuota: 1000000 },
  { id: 4, name: "精英", minQuota: 10000000 },
];

userRoutes.get("/levels", (c) => {
  const token = getCookie(c, "mexion_user_session") || "";
  const user = token ? getSessionUser(c.get("db"), token) : null;
  const quotaUsed = user?.quotaUsed ?? 0;
  const currentLevel = LEVELS.reduce((current, level) => (quotaUsed >= level.minQuota ? level : current), LEVELS[0]);
  return c.json({ ok: true, data: { levels: LEVELS, currentLevel, quotaUsed } });
});

userRoutes.get("/groups", requireUser, (c) => {
  const groups = listGroups(c.get("db")).map((group) => ({
    id: group.id,
    name: group.name,
    rateMultiplier: group.rateMultiplier,
    isDefault: group.isDefault,
  }));
  return c.json({ ok: true, data: { groups } });
});
