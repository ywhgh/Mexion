import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../app.js";
import { idParamSchema } from "../contracts.js";
import { requireUser } from "../middleware/require-user.js";
import { createUserKey, listUserKeys, revokeUserKey, updateUserKey } from "../services/user-keys.js";
import { getUsageSummary } from "../services/billing.js";
import { listGroups } from "../services/channels.js";

export const compatRoutes = new Hono<AppBindings>();

const createTokenSchema = z.object({
  name: z.string().trim().min(1).max(120).default("API Key"),
  note: z.string().max(240).optional(),
  remain_quota: z.number().int().positive().optional(),
  unlimited_quota: z.boolean().optional(),
  models: z.array(z.string()).optional(),
  group: z.string().optional(),
  expired_time: z.number().optional(),
});

const updateTokenSchema = createTokenSchema.partial().extend({ id: z.number().int().positive(), status: z.union([z.string(), z.number()]).optional() });

function tokenPublicToCompat(key: ReturnType<typeof listUserKeys>[number]): Record<string, unknown> {
  return {
    id: key.id,
    name: key.name,
    remain_quota: key.quotaLimit === null ? 0 : Math.max(0, key.quotaLimit - key.quotaUsed),
    used_quota: key.quotaUsed,
    unlimited_quota: key.quotaLimit === null,
    key: `${key.prefix}****`,
    key_prefix: key.prefix,
    status: key.status === "active" ? 1 : 2,
    expired_time: key.expiresAt ? Math.floor(Date.parse(key.expiresAt) / 1000) : -1,
    created_time: Math.floor(Date.parse(key.createdAt) / 1000),
    accessed_time: key.lastUsedAt ? Math.floor(Date.parse(key.lastUsedAt) / 1000) : 0,
    models: key.modelAllow ?? [],
    group: key.groupId ? String(key.groupId) : "default",
    note: key.note,
  };
}

compatRoutes.use("/token/*", requireUser);
compatRoutes.get("/token/", (c) => {
  const keys = listUserKeys(c.get("db"), c.get("user").id).map(tokenPublicToCompat);
  return c.json({ ok: true, data: { items: keys, data: keys, total: keys.length, page: Number(c.req.query("p") ?? 0) } });
});
compatRoutes.post("/token/", async (c) => {
  const body = createTokenSchema.parse(await c.req.json().catch(() => ({})));
  const created = await createUserKey(c.get("db"), c.get("user").id, {
    name: body.name,
    note: body.note ?? "",
    quotaLimit: body.unlimited_quota ? null : body.remain_quota ?? null,
    modelAllow: body.models && body.models.length > 0 ? body.models : null,
    expiresAt: body.expired_time && body.expired_time > 0 ? new Date(body.expired_time * 1000).toISOString() : null,
  });
  return c.json({ ok: true, data: { ...tokenPublicToCompat(created.key), key: created.secret, secret: created.secret } }, 201);
});
compatRoutes.put("/token/", async (c) => {
  const body = updateTokenSchema.parse(await c.req.json());
  const key = updateUserKey(c.get("db"), c.get("user").id, body.id, {
    name: body.name,
    note: body.note,
    status: body.status === 1 || body.status === "1" || body.status === "active" ? "active" : body.status === undefined ? undefined : "disabled",
  });
  return c.json({ ok: true, data: tokenPublicToCompat(key) });
});
compatRoutes.post("/token/:id/key", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const key = listUserKeys(c.get("db"), c.get("user").id).find((item) => item.id === id);
  if (!key) return c.json({ ok: false, error: { code: "HTTP_404", message: "API key not found" } }, 404);
  return c.json({ ok: true, data: { key: `${key.prefix}****`, prefix: key.prefix } });
});
compatRoutes.delete("/token/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  revokeUserKey(c.get("db"), c.get("user").id, id);
  return c.json({ ok: true, data: { deleted: true } });
});

compatRoutes.get("/user/groups", requireUser, (c) => {
  const groups = listGroups(c.get("db"));
  return c.json({ ok: true, data: { groups, items: groups, default: "default" } });
});
compatRoutes.get("/user/group-access", requireUser, (c) => c.json({ ok: true, data: { unlocked: ["default"], locked: [] } }));
compatRoutes.get("/status", (c) => c.json({ ok: true, data: { status: "ok", service: "mexion", timestamp: new Date().toISOString() } }));
compatRoutes.get("/log/self", requireUser, (c) => {
  const limit = Math.min(200, Math.max(1, Number.parseInt(c.req.query("size") ?? c.req.query("page_size") ?? "100", 10) || 100));
  const rows = c
    .get("db")
    .sqlite.prepare("SELECT id, ts, request_id AS requestId, key_prefix AS token_name, method, path, model, provider, status, input_tokens AS prompt_tokens, output_tokens AS completion_tokens, duration_ms AS duration, cost FROM request_logs WHERE user_id = ? ORDER BY id DESC LIMIT ?")
    .all(c.get("user").id, limit);
  return c.json({ ok: true, data: { items: rows, data: rows, total: rows.length } });
});
compatRoutes.get("/log/self/stat", requireUser, (c) => c.json({ ok: true, data: getUsageSummary(c.get("db"), c.get("user").id) }));
compatRoutes.get("/log/self/error_summary", requireUser, (c) => c.json({ ok: true, data: { total: 0, items: [] } }));
compatRoutes.get("/log/self/trace", requireUser, (c) => c.json({ ok: true, data: { trace: [] } }));
compatRoutes.get("/subscription/self", requireUser, (c) => {
  const rows = c.get("db").sqlite.prepare("SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY id DESC").all(c.get("user").id);
  return c.json({ ok: true, data: { items: rows, subscriptions: rows } });
});
