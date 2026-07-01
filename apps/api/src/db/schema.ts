import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const subs = sqliteTable("subs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  rawSources: text("raw_sources").notNull(),
  target: text("target", { enum: ["clash-meta", "sing-box", "shadowrocket"] }).notNull(),
  ruleSet: text("rule_set", { enum: ["none", "acl4ssr"] }).notNull(),
  renamePrefix: text("rename_prefix").notNull().default(""),
  filterRegex: text("filter_regex").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  note: text("note").notNull().default(""),
  hash: text("hash").notNull(),
  prefix: text("prefix").notNull(),
  subId: integer("sub_id")
    .notNull()
    .references(() => subs.id, { onDelete: "cascade" }),
  quotaBytes: integer("quota_bytes"),
  usedBytes: integer("used_bytes").notNull().default(0),
  ipAllow: text("ip_allow"),
  expiresAt: text("expires_at"),
  revokedAt: text("revoked_at"),
  createdAt: text("created_at").notNull(),
});

export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alias: text("alias").notNull().unique(),
  upstream: text("upstream").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  latencyMs: integer("latency_ms"),
  lastCheckedAt: text("last_checked_at"),
  createdAt: text("created_at").notNull(),
});

export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ts: text("ts").notNull(),
  tokenPrefix: text("token_prefix"),
  source: text("source").notNull(),
  target: text("target").notNull(),
  bytes: integer("bytes").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  status: integer("status").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const subRelations = relations(subs, ({ many }) => ({
  tokens: many(tokens),
}));

export const tokenRelations = relations(tokens, ({ one }) => ({
  sub: one(subs, {
    fields: [tokens.subId],
    references: [subs.id],
  }),
}));
