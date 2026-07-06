import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { openDb } from "../src/db/client";

function userCookie(response: Response): string {
  const cookie = response.headers.get("set-cookie");
  expect(cookie).toContain("mexion_user_session=");
  return cookie?.split(";")[0] ?? "";
}

async function loginUser(app: ReturnType<typeof createApp>): Promise<string> {
  const register = await app.request("/api/user/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "progress", email: "progress@example.test", password: "long-password" }),
  });
  expect(register.status).toBe(201);
  const login = await app.request("/api/user/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "progress", password: "long-password" }),
  });
  expect(login.status).toBe(200);
  return userCookie(login);
}

describe("subscription progress endpoints", () => {
  it("returns progress rows and aggregate summary for active subscriptions", async () => {
    const db = openDb(":memory:");
    const app = createApp({ db });
    const cookie = await loginUser(app);
    const create = await app.request("/api/user/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ planId: 1 }),
    });
    expect(create.status).toBe(201);
    const payload = (await create.json()) as { data: { subscription: { id: number; quotaTotal: number } } };
    db.sqlite.prepare("UPDATE user_subscriptions SET quota_used = ? WHERE id = ?").run(250, payload.data.subscription.id);

    const progress = await app.request("/api/user/subscriptions/progress", { headers: { cookie } });
    expect(progress.status).toBe(200);
    await expect(progress.json()).resolves.toMatchObject({
      ok: true,
      data: {
        progress: [
          {
            id: payload.data.subscription.id,
            remainingQuota: payload.data.subscription.quotaTotal - 250,
            quotaUsed: 250,
            status: "active",
          },
        ],
      },
    });

    const summary = await app.request("/api/user/subscriptions/summary", { headers: { cookie } });
    expect(summary.status).toBe(200);
    const summaryJson = (await summary.json()) as { data: { summary: { activePlans: number; totalUsed: number; totalRemaining: number; overallPercent: number } } };
    expect(summaryJson.data.summary.activePlans).toBe(1);
    expect(summaryJson.data.summary.totalUsed).toBe(250);
    expect(summaryJson.data.summary.totalRemaining).toBe(payload.data.subscription.quotaTotal - 250);
    expect(summaryJson.data.summary.overallPercent).toBeGreaterThan(0);
  });
});
