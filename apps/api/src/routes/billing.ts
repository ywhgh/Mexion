import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../app.js";
import { requireUser } from "../middleware/require-user.js";
import { activateSubscriptionPlan, getBillingSummary, getSubscriptionProgress, getSubscriptionSummary, getUsageSummary, listSubscriptionPlans } from "../services/billing.js";

export const billingRoutes = new Hono<AppBindings>();

const subscriptionSchema = z.object({ planId: z.number().int().positive() });

billingRoutes.get("/subscription/plans", (c) => c.json({ ok: true, data: { plans: listSubscriptionPlans(c.get("db")) } }));

billingRoutes.use("/user/billing", requireUser);
billingRoutes.use("/user/usage", requireUser);
billingRoutes.use("/user/subscriptions", requireUser);
billingRoutes.use("/user/subscriptions/*", requireUser);
billingRoutes.use("/user/logs", requireUser);

billingRoutes.get("/user/billing", (c) => c.json({ ok: true, data: getBillingSummary(c.get("db"), c.get("user").id) }));
billingRoutes.get("/user/usage", (c) => c.json({ ok: true, data: getUsageSummary(c.get("db"), c.get("user").id) }));
billingRoutes.get("/user/subscriptions", (c) => {
  const rows = c
    .get("db")
    .sqlite.prepare("SELECT id, plan_id AS planId, quota_total AS quotaTotal, quota_used AS quotaUsed, starts_at AS startsAt, expires_at AS expiresAt, status, created_at AS createdAt FROM user_subscriptions WHERE user_id = ? ORDER BY id DESC")
    .all(c.get("user").id);
  return c.json({ ok: true, data: { subscriptions: rows } });
});
billingRoutes.get("/user/subscriptions/progress", (c) => c.json({ ok: true, data: { progress: getSubscriptionProgress(c.get("db"), c.get("user").id) } }));
billingRoutes.get("/user/subscriptions/summary", (c) => c.json({ ok: true, data: { summary: getSubscriptionSummary(c.get("db"), c.get("user").id) } }));
billingRoutes.post("/user/subscriptions", async (c) => {
  const input = subscriptionSchema.parse(await c.req.json());
  return c.json({ ok: true, data: { subscription: activateSubscriptionPlan(c.get("db"), c.get("user").id, input.planId) } }, 201);
});
billingRoutes.get("/user/logs", (c) => {
  const limit = Math.min(200, Math.max(1, Number.parseInt(c.req.query("limit") ?? "100", 10) || 100));
  const db = c.get("db");
  const userId = c.get("user").id;
  let rows = db.sqlite
    .prepare("SELECT id, ts, request_id AS requestId, key_prefix AS keyPrefix, method, path, model, provider, group_id AS groupId, channel_id AS channelId, status, input_tokens AS inputTokens, output_tokens AS outputTokens, duration_ms AS durationMs, ttft_ms AS ttftMs, cost, error_code AS errorCode, body_hash AS bodyHash, body_length AS bodyLength FROM request_logs WHERE user_id = ? ORDER BY id DESC LIMIT ?")
    .all(userId, limit);
  if (rows.length === 0) {
    rows = db.sqlite
      .prepare(
        `SELECT id, ts, request_id AS requestId, key_prefix AS keyPrefix,
          'POST' AS method, '/v1' AS path, model, provider, NULL AS groupId, channel_id AS channelId,
          CASE WHEN status IN ('ok', 'stream_estimated') THEN 200 ELSE 500 END AS status,
          input_tokens AS inputTokens, output_tokens AS outputTokens, duration_ms AS durationMs, ttft_ms AS ttftMs,
          cost, error_code AS errorCode, body_hash AS bodyHash, body_length AS bodyLength
         FROM usage_events
         WHERE user_id = ?
         ORDER BY id DESC
         LIMIT ?`,
      )
      .all(userId, limit);
  }
  return c.json({ ok: true, data: { logs: rows } });
});
