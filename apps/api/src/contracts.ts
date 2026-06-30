import { z } from "zod";

export const bootstrapSchema = z.object({
  username: z.string().trim().min(3).max(64),
  password: z.string().min(8).max(256),
});

export const signInSchema = bootstrapSchema;

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  nextPassword: z.string().min(8).max(256),
});

export const targetFormatSchema = z.enum(["clash-meta", "sing-box", "shadowrocket"]);
export const ruleSetSchema = z.enum(["none", "acl4ssr"]);

export const subCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  rawSources: z.array(z.string().trim().min(1)).min(1),
  target: targetFormatSchema.default("clash-meta"),
  ruleSet: ruleSetSchema.default("none"),
  renamePrefix: z.string().trim().max(64).optional().default(""),
  filterRegex: z.string().trim().max(256).optional().default(""),
});

export const subUpdateSchema = subCreateSchema.partial().extend({
  rawSources: z.array(z.string().trim().min(1)).min(1).optional(),
});

export const tokenCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  note: z.string().trim().max(240).optional().default(""),
  subId: z.number().int().positive(),
  quotaBytes: z.number().int().positive().nullable().optional().default(null),
  expiresAt: z.string().datetime().nullable().optional().default(null),
  ipAllow: z.array(z.string().trim().min(1)).optional().default([]),
});

export const routeCreateSchema = z.object({
  alias: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/),
  upstream: z.string().url(),
  enabled: z.boolean().optional().default(true),
});

export const routeUpdateSchema = routeCreateSchema.partial();

export const logsQuerySchema = z.object({
  token: z.string().trim().optional(),
  status: z.coerce.number().int().min(100).max(599).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TargetFormat = z.infer<typeof targetFormatSchema>;
export type RuleSet = z.infer<typeof ruleSetSchema>;
export type SubCreateInput = z.infer<typeof subCreateSchema>;
export type SubUpdateInput = z.infer<typeof subUpdateSchema>;
export type TokenCreateInput = z.infer<typeof tokenCreateSchema>;
export type RouteCreateInput = z.infer<typeof routeCreateSchema>;
export type RouteUpdateInput = z.infer<typeof routeUpdateSchema>;
export type LogsQuery = z.infer<typeof logsQuerySchema>;

