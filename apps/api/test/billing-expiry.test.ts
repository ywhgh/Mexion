import { describe, expect, it } from "vitest";
import { openDb } from "../src/db/client";
import { migrate } from "../src/db/migrate";
import { cleanupOldExpiredSubscriptions, expireDueSubscriptions, startSubscriptionExpiryTask } from "../src/services/billing";
import { registerUser } from "../src/services/users";

async function fixture() {
  const db = openDb(":memory:");
  migrate(db);
  const user = await registerUser(db, { username: "expiry", email: "expiry@example.test", password: "long-password" });
  return { db, user };
}

function isoDaysFrom(now: Date, days: number): string {
  return new Date(now.getTime() + days * 86400000).toISOString();
}

describe("subscription expiry task", () => {
  it("expires due subscriptions and cleans old expired rows", async () => {
    const { db, user } = await fixture();
    const now = new Date("2026-07-06T00:00:00.000Z");
    const insert = db.sqlite.prepare(
      `INSERT INTO user_subscriptions (user_id, plan_id, quota_total, quota_used, starts_at, expires_at, status, created_at)
       VALUES (?, 1, 1000, 0, ?, ?, ?, ?)`,
    );
    insert.run(user.id, isoDaysFrom(now, -31), isoDaysFrom(now, -1), "active", isoDaysFrom(now, -31));
    insert.run(user.id, isoDaysFrom(now, -1), isoDaysFrom(now, 5), "active", isoDaysFrom(now, -1));
    insert.run(user.id, isoDaysFrom(now, -130), isoDaysFrom(now, -100), "expired", isoDaysFrom(now, -130));

    expect(expireDueSubscriptions(db, now)).toBe(1);
    const active = db.sqlite.prepare("SELECT COUNT(*) AS count FROM user_subscriptions WHERE status = 'active'").get() as { count: number };
    const expired = db.sqlite.prepare("SELECT COUNT(*) AS count FROM user_subscriptions WHERE status = 'expired'").get() as { count: number };
    expect(active.count).toBe(1);
    expect(expired.count).toBe(2);

    expect(cleanupOldExpiredSubscriptions(db, now)).toBe(1);
    const remaining = db.sqlite.prepare("SELECT COUNT(*) AS count FROM user_subscriptions").get() as { count: number };
    expect(remaining.count).toBe(2);
  });

  it("runs once immediately and does not keep the process alive", async () => {
    const { db, user } = await fixture();
    const expiredAt = new Date(Date.now() - 86400000).toISOString();
    db.sqlite
      .prepare(
        `INSERT INTO user_subscriptions (user_id, plan_id, quota_total, quota_used, starts_at, expires_at, status, created_at)
         VALUES (?, 1, 1000, 0, ?, ?, 'active', ?)`,
      )
      .run(user.id, expiredAt, expiredAt, expiredAt);

    const timer = startSubscriptionExpiryTask(db);
    try {
      expect(timer.hasRef()).toBe(false);
      const row = db.sqlite.prepare("SELECT status FROM user_subscriptions WHERE user_id = ?").get(user.id) as { status: string };
      expect(row.status).toBe("expired");
    } finally {
      clearInterval(timer);
    }
  });
});
