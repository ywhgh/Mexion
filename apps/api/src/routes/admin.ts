import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../app.js";
import { idParamSchema } from "../contracts.js";
import { requireAdmin } from "../middleware/require-admin.js";
import {
  createChannel,
  createGroup,
  createModelAlias,
  deleteChannel,
  deleteGroup,
  deleteModelAlias,
  listChannels,
  listGroups,
  listModelAliases,
  updateChannel,
  updateGroup,
} from "../services/channels.js";

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

const aliasCreateSchema = z.object({
  sourceModel: z.string().trim().min(1),
  targetModel: z.string().trim().min(1),
  channelId: z.number().int().positive().nullable().optional(),
});

adminRoutes.use("*", requireAdmin);

adminRoutes.get("/channels", (c) => c.json({ ok: true, data: { channels: listChannels(c.get("db")) } }));
adminRoutes.post("/channels", async (c) => c.json({ ok: true, data: { channel: createChannel(c.get("db"), channelCreateSchema.parse(await c.req.json())) } }, 201));
adminRoutes.patch("/channels/:id", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  return c.json({ ok: true, data: { channel: updateChannel(c.get("db"), id, channelUpdateSchema.parse(await c.req.json())) } });
});
adminRoutes.delete("/channels/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  deleteChannel(c.get("db"), id);
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
  deleteGroup(c.get("db"), id);
  return c.json({ ok: true, data: { deleted: true } });
});

adminRoutes.get("/model-aliases", (c) => c.json({ ok: true, data: { aliases: listModelAliases(c.get("db")) } }));
adminRoutes.post("/model-aliases", async (c) => c.json({ ok: true, data: { alias: createModelAlias(c.get("db"), aliasCreateSchema.parse(await c.req.json())) } }, 201));
adminRoutes.delete("/model-aliases/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  deleteModelAlias(c.get("db"), id);
  return c.json({ ok: true, data: { deleted: true } });
});
