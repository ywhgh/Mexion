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

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TargetFormat = z.infer<typeof targetFormatSchema>;
export type RuleSet = z.infer<typeof ruleSetSchema>;
export type SubCreateInput = z.infer<typeof subCreateSchema>;
export type SubUpdateInput = z.infer<typeof subUpdateSchema>;
