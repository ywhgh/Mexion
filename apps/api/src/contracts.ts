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
