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

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  balance: integer("balance").notNull().default(0),
  quotaLimit: integer("quota_limit").notNull().default(0),
  quotaUsed: integer("quota_used").notNull().default(0),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  status: text("status", { enum: ["active", "banned"] }).notNull().default("active"),
  checkinStreak: integer("checkin_streak").notNull().default(0),
  lastCheckinAt: text("last_checkin_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const userSessions = sqliteTable("user_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  rateMultiplier: integer("rate_multiplier").notNull().default(100),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const userApiKeys = sqliteTable("user_api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  note: text("note").notNull().default(""),
  hash: text("hash").notNull(),
  prefix: text("prefix").notNull(),
  groupId: integer("group_id").references(() => groups.id),
  quotaLimit: integer("quota_limit"),
  quotaUsed: integer("quota_used").notNull().default(0),
  modelAllow: text("model_allow"),
  ipAllow: text("ip_allow"),
  expiresAt: text("expires_at"),
  revokedAt: text("revoked_at"),
  lastUsedAt: text("last_used_at"),
  status: text("status", { enum: ["active", "disabled", "exhausted"] }).notNull().default("active"),
  createdAt: text("created_at").notNull(),
});

export const channels = sqliteTable("channels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  provider: text("provider", { enum: ["openai", "anthropic", "gemini", "azure", "custom"] }).notNull(),
  baseUrl: text("base_url").notNull(),
  modelList: text("model_list"),
  groupId: integer("group_id").references(() => groups.id),
  priority: integer("priority").notNull().default(0),
  status: text("status", { enum: ["active", "disabled", "error"] }).notNull().default("active"),
  latencyMs: integer("latency_ms"),
  lastCheckedAt: text("last_checked_at"),
  errorCount: integer("error_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const channelSecrets = sqliteTable("channel_secrets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  secretType: text("secret_type", { enum: ["api_key", "bearer_token", "oauth_refresh"] }).notNull(),
  encryptedValue: text("encrypted_value").notNull(),
  keyVersion: integer("key_version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  rotatedAt: text("rotated_at"),
});

export const modelAliases = sqliteTable("model_aliases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceModel: text("source_model").notNull(),
  targetModel: text("target_model").notNull(),
  channelId: integer("channel_id").references(() => channels.id),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const usageEvents = sqliteTable("usage_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ts: text("ts").notNull(),
  requestId: text("request_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  keyPrefix: text("key_prefix"),
  channelId: integer("channel_id").references(() => channels.id),
  model: text("model"),
  provider: text("provider"),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  ttftMs: integer("ttft_ms"),
  cost: integer("cost").notNull().default(0),
  status: text("status").notNull(),
  errorCode: text("error_code"),
  bodyHash: text("body_hash"),
  bodyLength: integer("body_length"),
});

export const billingSessions = sqliteTable("billing_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: text("request_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  keyId: integer("key_id").references(() => userApiKeys.id),
  preCharge: integer("pre_charge").notNull().default(0),
  settled: integer("settled").notNull().default(0),
  refunded: integer("refunded").notNull().default(0),
  status: text("status", { enum: ["pending", "settled", "refunded", "failed"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull(),
  settledAt: text("settled_at"),
});

export const subscriptionPlans = sqliteTable("subscription_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  quota: integer("quota").notNull(),
  price: integer("price").notNull(),
  periodDays: integer("period_days").notNull().default(30),
  features: text("features"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const userSubscriptions = sqliteTable("user_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  quotaTotal: integer("quota_total").notNull(),
  quotaUsed: integer("quota_used").notNull().default(0),
  startsAt: text("starts_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  status: text("status", { enum: ["active", "expired", "cancelled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull(),
});

export const requestLogs = sqliteTable("request_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ts: text("ts").notNull(),
  requestId: text("request_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  keyPrefix: text("key_prefix"),
  method: text("method").notNull(),
  path: text("path").notNull(),
  model: text("model"),
  provider: text("provider"),
  groupId: integer("group_id").references(() => groups.id),
  channelId: integer("channel_id").references(() => channels.id),
  status: integer("status").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  durationMs: integer("duration_ms"),
  ttftMs: integer("ttft_ms"),
  cost: integer("cost"),
  errorCode: text("error_code"),
  bodyHash: text("body_hash"),
  bodyLength: integer("body_length"),
});
