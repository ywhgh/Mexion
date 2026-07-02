import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../app.js";
import { idParamSchema } from "../contracts.js";
import { requireUser } from "../middleware/require-user.js";
import { createUserKey, listUserKeys, revokeUserKey, updateUserKey } from "../services/user-keys.js";

export const userKeyRoutes = new Hono<AppBindings>();

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  note: z.string().max(240).optional(),
  groupId: z.number().int().positive().nullable().optional(),
  quotaLimit: z.number().int().positive().nullable().optional(),
  modelAllow: z.array(z.string().trim().min(1)).nullable().optional(),
  ipAllow: z.array(z.string().trim().min(1)).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  note: z.string().max(240).optional(),
  status: z.enum(["active", "disabled", "exhausted"]).optional(),
});

userKeyRoutes.use("*", requireUser);

userKeyRoutes.get("/", (c) => c.json({ ok: true, data: { keys: listUserKeys(c.get("db"), c.get("user").id) } }));

userKeyRoutes.post("/", async (c) => {
  const input = createSchema.parse(await c.req.json());
  const created = await createUserKey(c.get("db"), c.get("user").id, input);
  return c.json({ ok: true, data: created }, 201);
});

userKeyRoutes.patch("/:id", async (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  const input = updateSchema.parse(await c.req.json());
  const key = updateUserKey(c.get("db"), c.get("user").id, id, input);
  return c.json({ ok: true, data: { key } });
});

userKeyRoutes.delete("/:id", (c) => {
  const { id } = idParamSchema.parse(c.req.param());
  revokeUserKey(c.get("db"), c.get("user").id, id);
  return c.json({ ok: true, data: { deleted: true } });
});
