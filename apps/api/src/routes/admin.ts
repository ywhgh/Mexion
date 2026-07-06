import { Hono, type Context } from "hono";
import { z } from "zod";
import type { AppBindings } from "../app.js";
import { idParamSchema } from "../contracts.js";
import { safeFetch } from "../lib/safe-http.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { listAuditLogs, recordAuditLog } from "../services/audit.js";
import {
  createChannel,
  createGroup,
  createModelAlias,
  deleteChannel,
  deleteGroup,
  deleteModelAlias,
  fetchUpstreamModels,
  getChannelById,
  getChannelSecret,
  listChannels,
  listGroups,
  listModelAliases,
  updateChannel,
  updateGroup,
  updateModelAlias,
} from "../services/channels.js";
import { adminUpdateUser, listAllUsers } from "../services/users.js";

export const adminRoutes = new Hono<AppBindings>();

const providerSchema = z.enum(["openai", "anthropic", "gemini", "azure", "custom"]);
const channelStatusSchema = z.enum(["active", "disabled", "error"]);

const groupCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(240).optional(),
  rateMultiplier: z.number().int().positive().optional(),
});
const groupUpdateSchema = groupCreateSchema.partial().extend({ isDefault: z.boolean().optional() });

const channelCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  provider: providerSchema,
  baseUrl: z.string().trim().min(1),
  secretValue: z.string().min(1),
  modelList: z.array(z.string().trim().min(1)).nullable().optional(),
  groupId: z.number().int().positive().nullable().optional(),
  priority: z.number().int().optional(),
});

const channelUpdateSchema = channelCreateSchema.partial().extend({ status: channelStatusSchema.optional() });
const fetchModelsSchema = z.object({
  baseUrl: z.string().trim().min(1),
  apiKey: z.string().min(1),
  provider: providerSchema.optional(),
});


const aliasCreateSchema = z.object({
  sourceModel: z.string().trim().min(1),
  targetModel: z.string().trim().min(1),
  channelId: z.number().int().positive().nullable().optional(),
});
const aliasUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  targetModel: z.string().trim().min(1).optional(),
});
const userUpdateSchema = z.object({
  status: z.enum(["active", "banned"]).optional(),
  balance: z.number().optional(),
  role: z.enum(["user", "admin"]).optional(),
});
const auditListSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  action: z.string().trim().min(1).optional(),
});

function requestIp(c: Context<AppBindings>): string | null {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || null;
}

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function appendPath(baseUrl: string, path: string): string {
  return `${stripTrailingSlashes(baseUrl)}/${path.replace(/^\/+/, "")}`;
}

function channelModelsEndpoint(channel: { provider: string; baseUrl: string }): string {
  const base = stripTrailingSlashes(channel.baseUrl);
  if (channel.provider === "gemini") return base.endsWith("/v1beta") ? appendPath(base, "models") : appendPath(base, "v1beta/models");
  if (channel.provider === "azure") return base.includes("/openai") ? appendPath(base, "deployments") : appendPath(base, "openai/deployments");
  return base.endsWith("/v1") ? appendPath(base, "models") : appendPath(base, "v1/models");
}

function channelChatEndpoint(channel: { provider: string; baseUrl: string }): string {
  const base = stripTrailingSlashes(channel.baseUrl);
  if (channel.provider === "anthropic") return base.endsWith("/v1") ? appendPath(base, "messages") : appendPath(base, "v1/messages");
  if (channel.provider === "azure") {
    if (base.includes("/chat/completions")) return base;
    if (base.includes("/openai/deployments")) return appendPath(base, "chat/completions?api-version=2024-06-01");
    return appendPath(base, "openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-06-01");
  }
  return base.endsWith("/v1") ? appendPath(base, "chat/completions") : appendPath(base, "v1/chat/completions");
}

function channelAuthHeaders(provider: string, secret: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (provider === "anthropic") {
    headers["x-api-key"] = secret;
    headers["anthropic-version"] = "2023-06-01";
  } else if (provider === "gemini") {
    headers["x-goog-api-key"] = secret;
  } else if (provider === "azure") {
    headers["api-key"] = secret;
  } else {
    headers.Authorization = `Bearer ${secret}`;
  }
  return headers;
}

function channelTestBody(provider: string): unknown {
  if (provider === "anthropic") return { model: "claude-3-haiku-20240307", messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }], max_tokens: 5 };
  return { model: "gpt-4o-mini", messages: [{ role: "user", content: "hi" }], max_tokens: 5 };
}

adminRoutes.use("*", requireAdmin);

adminRoutes.get("/channels", (c) => c.json({ ok: true, data: { channels: listChannels(c.get("db")) } }));
adminRoutes.post("/channels/fetch-models", async (c) => {
  const input = fetchModelsSchema.parse(await c.req.json());
  const result = await fetchUpstreamModels(c.get("db"), { baseUrl: input.baseUrl, apiKey: input.apiKey, provider: input.provider });
  return c.json({ ok: true, data: result });
});
adminRoutes.post("/channels", async (c) => c.json({ ok: true, data: { channel: createChannel(c.get("db"), channelCreateSchema.parse(await c.req.json())) } }, 201));
adminRoutes.post("/channels/:id/probe", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const db = c.get("db");
  const channel = getChannelById(db, id);
  const started = performance.now();
  const now = new Date().toISOString();
  try {
    await safeFetch(channelModelsEndpoint(channel), {
      method: "HEAD",
      timeoutMs: 5000,
      firstByteTimeoutMs: 5000,
    });
    const latencyMs = Math.round(performance.now() - started);
    db.sqlite
      .prepare("UPDATE channels SET latency_ms = ?, last_checked_at = ?, error_count = 0, status = 'active' WHERE id = ?")
      .run(latencyMs, now, id);
    return c.json({ ok: true, data: { latencyMs, status: "active" } });
  } catch {
    db.sqlite
      .prepare("UPDATE channels SET latency_ms = NULL, last_checked_at = ?, error_count = error_count + 1, status = 'error' WHERE id = ?")
      .run(now, id);
    return c.json({ ok: true, data: { latencyMs: null, status: "error" } });
  }
});
adminRoutes.post("/channels/:id/test", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const db = c.get("db");
  const channel = getChannelById(db, id);
  const secret = getChannelSecret(db, channel.id);
  const started = performance.now();
  const readBody = async (response: Response): Promise<string> => {
    try {
      return (await response.text()).slice(0, 500);
    } catch {
      return "";
    }
  };
  try {
    const isModelProbe = channel.provider === "gemini" || channel.provider === "custom";
    const init: { method: string; headers: Record<string, string>; timeoutMs: number; firstByteTimeoutMs: number; body?: string } = {
      method: isModelProbe ? "GET" : "POST",
      headers: channelAuthHeaders(channel.provider, secret),
      timeoutMs: 15_000,
      firstByteTimeoutMs: 15_000,
    };
    if (!isModelProbe) init.body = JSON.stringify(channelTestBody(channel.provider));
    const response = await safeFetch(isModelProbe ? channelModelsEndpoint(channel) : channelChatEndpoint(channel), init);
    const durationMs = Math.round(performance.now() - started);
    const body = await readBody(response);
    if (response.ok) {
      db.sqlite.prepare("UPDATE channels SET latency_ms = ?, last_checked_at = ?, error_count = 0, status = 'active' WHERE id = ?").run(durationMs, new Date().toISOString(), id);
    } else {
      db.sqlite.prepare("UPDATE channels SET last_checked_at = ?, error_count = error_count + 1, status = 'error' WHERE id = ?").run(new Date().toISOString(), id);
    }
    return c.json({ ok: true, data: { status: response.status, ok: response.ok, durationMs, body } });
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    db.sqlite.prepare("UPDATE channels SET last_checked_at = ?, error_count = error_count + 1, status = 'error' WHERE id = ?").run(new Date().toISOString(), id);
    return c.json({ ok: true, data: { status: 0, ok: false, durationMs, body: "", message: error instanceof Error ? error.message : "Connection failed" } });
  }
});
adminRoutes.patch("/channels/:id", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  return c.json({ ok: true, data: { channel: updateChannel(c.get("db"), id, channelUpdateSchema.parse(await c.req.json())) } });
});
adminRoutes.delete("/channels/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const before = listChannels(c.get("db")).find((channel) => channel.id === id) ?? null;
  deleteChannel(c.get("db"), id);
  recordAuditLog(c.get("db"), { adminId: c.get("admin").id, action: "channel.delete", targetType: "channel", targetId: id, before, after: null, ip: requestIp(c) });
  return c.json({ ok: true, data: { deleted: true } });
});

adminRoutes.get("/groups", (c) => c.json({ ok: true, data: { groups: listGroups(c.get("db")) } }));
adminRoutes.post("/groups", async (c) => c.json({ ok: true, data: { group: createGroup(c.get("db"), groupCreateSchema.parse(await c.req.json())) } }, 201));
adminRoutes.patch("/groups/:id", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  return c.json({ ok: true, data: { group: updateGroup(c.get("db"), id, groupUpdateSchema.parse(await c.req.json())) } });
});
adminRoutes.delete("/groups/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const before = listGroups(c.get("db")).find((group) => group.id === id) ?? null;
  deleteGroup(c.get("db"), id);
  recordAuditLog(c.get("db"), { adminId: c.get("admin").id, action: "group.delete", targetType: "group", targetId: id, before, after: null, ip: requestIp(c) });
  return c.json({ ok: true, data: { deleted: true } });
});

adminRoutes.get("/model-aliases", (c) => c.json({ ok: true, data: { aliases: listModelAliases(c.get("db")) } }));

adminRoutes.post("/model-aliases", async (c) => c.json({ ok: true, data: { alias: createModelAlias(c.get("db"), aliasCreateSchema.parse(await c.req.json())) } }, 201));

adminRoutes.patch("/model-aliases/:id", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const alias = updateModelAlias(c.get("db"), id, aliasUpdateSchema.parse(await c.req.json()));
  return c.json({ ok: true, data: { alias } });
});

adminRoutes.delete("/model-aliases/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const before = listModelAliases(c.get("db")).find((alias) => alias.id === id) ?? null;
  deleteModelAlias(c.get("db"), id);
  recordAuditLog(c.get("db"), { adminId: c.get("admin").id, action: "alias.delete", targetType: "model_alias", targetId: id, before, after: null, ip: requestIp(c) });
  return c.json({ ok: true, data: { deleted: true } });
});

adminRoutes.get("/users", (c) => c.json({ ok: true, data: { users: listAllUsers(c.get("db")) } }));
adminRoutes.patch("/users/:id", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const before = listAllUsers(c.get("db")).find((user) => user.id === id) ?? null;
  const user = adminUpdateUser(c.get("db"), id, userUpdateSchema.parse(await c.req.json()), c.get("admin").id);
  recordAuditLog(c.get("db"), { adminId: c.get("admin").id, action: "user.update", targetType: "user", targetId: id, before, after: user, ip: requestIp(c) });
  return c.json({ ok: true, data: { user } });
});

adminRoutes.get("/audit-logs", (c) => {
  const input = auditListSchema.parse(c.req.query());
  return c.json({ ok: true, data: { logs: listAuditLogs(c.get("db"), input) } });
});
