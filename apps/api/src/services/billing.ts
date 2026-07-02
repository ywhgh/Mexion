import { HTTPException } from "hono/http-exception";
import type { DbClient } from "../db/client.js";

export type BillingSessionRecord = {
  id: number;
  requestId: string;
  userId: number;
  keyId: number | null;
  preCharge: number;
  settled: number;
  refunded: number;
  status: "pending" | "settled" | "refunded" | "failed";
  createdAt: string;
  settledAt: string | null;
};

export type PrechargeInput = { requestId: string; userId: number; keyId?: number | null | undefined; estimatedCost: number };
export type SettleInput = { actualCost: number; inputTokens: number; outputTokens: number; durationMs: number; ttftMs?: number | null | undefined; model?: string | null | undefined; provider?: string | null | undefined; channelId?: number | null | undefined; bodyHash?: string | null | undefined; bodyLength?: number | null | undefined; keyPrefix?: string | null | undefined; status?: string | undefined };

function numberValue(row: unknown, key: string): number {
  if (!row || typeof row !== "object") return 0;
  const value = (row as Record<string, unknown>)[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function rowToBilling(row: unknown): BillingSessionRecord | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") return null;
  return {
    id: value.id,
    requestId: String(value.requestId ?? ""),
    userId: Number(value.userId ?? 0),
    keyId: value.keyId === null || value.keyId === undefined ? null : Number(value.keyId),
    preCharge: Number(value.preCharge ?? 0),
    settled: Number(value.settled ?? 0),
    refunded: Number(value.refunded ?? 0),
    status: value.status === "settled" || value.status === "refunded" || value.status === "failed" ? value.status : "pending",
    createdAt: String(value.createdAt ?? ""),
    settledAt: value.settledAt === null || value.settledAt === undefined ? null : String(value.settledAt),
  };
}

function getBilling(db: DbClient, requestId: string): BillingSessionRecord {
  const row = db.sqlite
    .prepare(
      `SELECT id, request_id AS requestId, user_id AS userId, key_id AS keyId, pre_charge AS preCharge,
        settled, refunded, status, created_at AS createdAt, settled_at AS settledAt
       FROM billing_sessions WHERE request_id = ?`,
    )
    .get(requestId);
  const session = rowToBilling(row);
  if (!session) throw new HTTPException(404, { message: "Billing session not found" });
  return session;
}

function availableSubscriptionQuota(db: DbClient, userId: number): number {
  return numberValue(
    db.sqlite
      .prepare("SELECT COALESCE(SUM(quota_total - quota_used), 0) AS value FROM user_subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > ? AND quota_used < quota_total")
      .get(userId, new Date().toISOString()),
    "value",
  );
}

function userBalance(db: DbClient, userId: number): number {
  return numberValue(db.sqlite.prepare("SELECT balance AS value FROM users WHERE id = ?").get(userId), "value");
}

function applySubscriptionDebit(db: DbClient, userId: number, amount: number): number {
  let remaining = amount;
  const rows = db.sqlite
    .prepare("SELECT id, quota_total AS quotaTotal, quota_used AS quotaUsed FROM user_subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > ? AND quota_used < quota_total ORDER BY expires_at ASC, id ASC")
    .all(userId, new Date().toISOString()) as Array<{ id: number; quotaTotal: number; quotaUsed: number }>;
  for (const sub of rows) {
    if (remaining <= 0) break;
    const free = Math.max(0, sub.quotaTotal - sub.quotaUsed);
    const take = Math.min(free, remaining);
    if (take > 0) {
      db.sqlite.prepare("UPDATE user_subscriptions SET quota_used = quota_used + ? WHERE id = ?").run(take, sub.id);
      remaining -= take;
    }
  }
  return amount - remaining;
}

function refundSubscription(db: DbClient, userId: number, amount: number): number {
  let remaining = amount;
  const rows = db.sqlite
    .prepare("SELECT id, quota_used AS quotaUsed FROM user_subscriptions WHERE user_id = ? AND quota_used > 0 ORDER BY expires_at DESC, id DESC")
    .all(userId) as Array<{ id: number; quotaUsed: number }>;
  for (const sub of rows) {
    if (remaining <= 0) break;
    const refund = Math.min(sub.quotaUsed, remaining);
    db.sqlite.prepare("UPDATE user_subscriptions SET quota_used = quota_used - ? WHERE id = ?").run(refund, sub.id);
    remaining -= refund;
  }
  return amount - remaining;
}

function chargeUser(db: DbClient, userId: number, amount: number, allowPartial = false): number {
  if (amount <= 0) return 0;
  const totalAvailable = availableSubscriptionQuota(db, userId) + userBalance(db, userId);
  if (!allowPartial && totalAvailable < amount) throw new HTTPException(402, { message: "Insufficient quota" });
  const target = allowPartial ? Math.min(amount, totalAvailable) : amount;
  const subscriptionCharged = applySubscriptionDebit(db, userId, target);
  const remaining = target - subscriptionCharged;
  if (remaining > 0) db.sqlite.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(remaining, userId);
  db.sqlite.prepare("UPDATE users SET quota_used = quota_used + ? WHERE id = ?").run(target, userId);
  return target;
}

function refundUser(db: DbClient, userId: number, amount: number): number {
  if (amount <= 0) return 0;
  const subscriptionRefunded = refundSubscription(db, userId, amount);
  const remaining = amount - subscriptionRefunded;
  if (remaining > 0) db.sqlite.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(remaining, userId);
  db.sqlite.prepare("UPDATE users SET quota_used = MAX(quota_used - ?, 0) WHERE id = ?").run(amount, userId);
  return amount;
}

export function prechargeBilling(db: DbClient, input: PrechargeInput): BillingSessionRecord {
  const estimatedCost = Math.max(1, Math.ceil(input.estimatedCost));
  const now = new Date().toISOString();
  const tx = db.sqlite.transaction(() => {
    const charged = chargeUser(db, input.userId, estimatedCost);
    db.sqlite
      .prepare("INSERT INTO billing_sessions (request_id, user_id, key_id, pre_charge, settled, refunded, status, created_at) VALUES (?, ?, ?, ?, 0, 0, 'pending', ?)")
      .run(input.requestId, input.userId, input.keyId ?? null, charged, now);
  });
  tx();
  return getBilling(db, input.requestId);
}

export function settleBilling(db: DbClient, requestId: string, input: SettleInput): void {
  const actualCost = Math.max(0, Math.ceil(input.actualCost));
  const now = new Date().toISOString();
  const tx = db.sqlite.transaction(() => {
    const session = getBilling(db, requestId);
    if (session.status !== "pending") return;
    if (actualCost <= session.preCharge) {
      const refund = session.preCharge - actualCost;
      refundUser(db, session.userId, refund);
      db.sqlite.prepare("UPDATE billing_sessions SET settled = ?, refunded = ?, status = 'settled', settled_at = ? WHERE request_id = ?").run(actualCost, refund, now, requestId);
    } else {
      const extra = chargeUser(db, session.userId, actualCost - session.preCharge, true);
      db.sqlite.prepare("UPDATE billing_sessions SET settled = ?, status = 'settled', settled_at = ? WHERE request_id = ?").run(session.preCharge + extra, now, requestId);
    }
    db.sqlite
      .prepare(
        `INSERT INTO usage_events (ts, request_id, user_id, key_prefix, channel_id, model, provider, input_tokens, output_tokens, duration_ms, ttft_ms, cost, status, body_hash, body_length)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(now, requestId, session.userId, input.keyPrefix ?? null, input.channelId ?? null, input.model ?? null, input.provider ?? null, input.inputTokens, input.outputTokens, input.durationMs, input.ttftMs ?? null, actualCost, input.status ?? "ok", input.bodyHash ?? null, input.bodyLength ?? null);
  });
  tx();
}

export function rollbackBilling(db: DbClient, requestId: string): void {
  const now = new Date().toISOString();
  const tx = db.sqlite.transaction(() => {
    const session = getBilling(db, requestId);
    if (session.status !== "pending") return;
    refundUser(db, session.userId, session.preCharge);
    db.sqlite.prepare("UPDATE billing_sessions SET refunded = ?, status = 'refunded', settled_at = ? WHERE request_id = ?").run(session.preCharge, now, requestId);
  });
  tx();
}

export function getBillingSummary(db: DbClient, userId: number): Record<string, unknown> {
  const user = db.sqlite.prepare("SELECT balance, quota_limit AS quotaLimit, quota_used AS quotaUsed FROM users WHERE id = ?").get(userId) as { balance: number; quotaLimit: number; quotaUsed: number };
  const subscriptions = db.sqlite
    .prepare("SELECT id, plan_id AS planId, quota_total AS quotaTotal, quota_used AS quotaUsed, starts_at AS startsAt, expires_at AS expiresAt, status FROM user_subscriptions WHERE user_id = ? ORDER BY id DESC")
    .all(userId);
  const recentUsage = db.sqlite
    .prepare("SELECT substr(ts,1,10) AS day, COALESCE(SUM(cost),0) AS cost, COALESCE(SUM(input_tokens + output_tokens),0) AS tokens, COUNT(*) AS calls FROM usage_events WHERE user_id = ? AND ts >= datetime('now','-7 days') GROUP BY day ORDER BY day")
    .all(userId);
  return { ...user, subscriptions, recentUsage };
}

export function getUsageSummary(db: DbClient, userId: number): Record<string, unknown> {
  const totals = db.sqlite
    .prepare("SELECT COUNT(*) AS totalCalls, COALESCE(SUM(input_tokens + output_tokens),0) AS totalTokens, COALESCE(SUM(cost),0) AS totalCost FROM usage_events WHERE user_id = ?")
    .get(userId) as { totalCalls: number; totalTokens: number; totalCost: number };
  const dailyStats = db.sqlite
    .prepare("SELECT substr(ts,1,10) AS day, COUNT(*) AS calls, COALESCE(SUM(input_tokens + output_tokens),0) AS tokens, COALESCE(SUM(cost),0) AS cost FROM usage_events WHERE user_id = ? AND ts >= datetime('now','-30 days') GROUP BY day ORDER BY day")
    .all(userId);
  const modelStats = db.sqlite
    .prepare("SELECT model, COUNT(*) AS calls, COALESCE(SUM(input_tokens + output_tokens),0) AS tokens, COALESCE(SUM(cost),0) AS cost FROM usage_events WHERE user_id = ? GROUP BY model ORDER BY calls DESC LIMIT 20")
    .all(userId);
  return { ...totals, dailyStats, modelStats };
}

export function listSubscriptionPlans(db: DbClient): unknown[] {
  return db.sqlite
    .prepare("SELECT id, name, description, quota, price, period_days AS periodDays, features, is_active AS isActive, created_at AS createdAt FROM subscription_plans WHERE is_active = 1 ORDER BY price ASC, id ASC")
    .all();
}

export function activateSubscriptionPlan(db: DbClient, userId: number, planId: number): Record<string, unknown> {
  const plan = db.sqlite.prepare("SELECT id, quota, period_days AS periodDays FROM subscription_plans WHERE id = ? AND is_active = 1").get(planId) as { id: number; quota: number; periodDays: number } | undefined;
  if (!plan) throw new HTTPException(404, { message: "Subscription plan not found" });
  const starts = new Date();
  const expires = new Date(starts.getTime() + plan.periodDays * 24 * 60 * 60 * 1000);
  const result = db.sqlite
    .prepare("INSERT INTO user_subscriptions (user_id, plan_id, quota_total, quota_used, starts_at, expires_at, status, created_at) VALUES (?, ?, ?, 0, ?, ?, 'active', ?)")
    .run(userId, plan.id, plan.quota, starts.toISOString(), expires.toISOString(), starts.toISOString());
  return db.sqlite
    .prepare("SELECT id, user_id AS userId, plan_id AS planId, quota_total AS quotaTotal, quota_used AS quotaUsed, starts_at AS startsAt, expires_at AS expiresAt, status, created_at AS createdAt FROM user_subscriptions WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as Record<string, unknown>;
}
