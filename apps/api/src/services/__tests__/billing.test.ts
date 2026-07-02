import { describe, expect, it } from "vitest";
import { openDb } from "../../db/client.js";
import { migrate } from "../../db/migrate.js";
import { activateSubscriptionPlan, prechargeBilling, rollbackBilling, settleBilling } from "../billing.js";
import { registerUser } from "../users.js";

async function fixture() {
  const db = openDb(":memory:");
  migrate(db);
  const user = await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
  db.sqlite.prepare("UPDATE users SET balance = ? WHERE id = ?").run(1000, user.id);
  return { db, user };
}

function quotaUsed(db: ReturnType<typeof openDb>, userId: number): number {
  return (db.sqlite.prepare("SELECT quota_used AS value FROM users WHERE id = ?").get(userId) as { value: number }).value;
}

function balance(db: ReturnType<typeof openDb>, userId: number): number {
  return (db.sqlite.prepare("SELECT balance AS value FROM users WHERE id = ?").get(userId) as { value: number }).value;
}

describe("billing service", () => {
  it("precharges successfully", async () => {
    const { db, user } = await fixture();
    const session = prechargeBilling(db, { requestId: "r1", userId: user.id, estimatedCost: 100 });
    expect(session.preCharge).toBe(100);
    expect(quotaUsed(db, user.id)).toBe(100);
  });

  it("rejects insufficient balance", async () => {
    const { db, user } = await fixture();
    await expect(Promise.resolve().then(() => prechargeBilling(db, { requestId: "r1", userId: user.id, estimatedCost: 5000 }))).rejects.toMatchObject({ status: 402 });
  });

  it("settles with refund", async () => {
    const { db, user } = await fixture();
    prechargeBilling(db, { requestId: "r1", userId: user.id, estimatedCost: 100 });
    settleBilling(db, "r1", { actualCost: 40, inputTokens: 1, outputTokens: 2, durationMs: 10 });
    expect(quotaUsed(db, user.id)).toBe(40);
    const session = db.sqlite.prepare("SELECT status, settled, refunded FROM billing_sessions WHERE request_id = ?").get("r1") as { status: string; settled: number; refunded: number };
    expect(session).toMatchObject({ status: "settled", settled: 40, refunded: 60 });
  });

  it("rolls back pending billing", async () => {
    const { db, user } = await fixture();
    prechargeBilling(db, { requestId: "r1", userId: user.id, estimatedCost: 100 });
    rollbackBilling(db, "r1");
    expect(quotaUsed(db, user.id)).toBe(0);
    expect(balance(db, user.id)).toBe(1000);
  });

  it("uses subscription quota before wallet", async () => {
    const { db, user } = await fixture();
    activateSubscriptionPlan(db, user.id, 1);
    prechargeBilling(db, { requestId: "r1", userId: user.id, estimatedCost: 500 });
    expect(balance(db, user.id)).toBe(1000);
    const sub = db.sqlite.prepare("SELECT quota_used AS used FROM user_subscriptions WHERE user_id = ?").get(user.id) as { used: number };
    expect(sub.used).toBe(500);
  });
});
