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
    body: JSON.stringify({ username: "spark", email: "spark@example.test", password: "long-password" }),
  });
  expect(register.status).toBe(201);
  const login = await app.request("/api/user/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "spark", password: "long-password" }),
  });
  expect(login.status).toBe(200);
  return userCookie(login);
}

function utcDayOffset(offset: number): { day: string; iso: string } {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const date = new Date(today + offset * 86400000);
  return { day: date.toISOString().slice(0, 10), iso: date.toISOString() };
}

describe("user key usage endpoint", () => {
  it("returns a filled 7-day per-key usage series", async () => {
    const db = openDb(":memory:");
    const app = createApp({ db });
    const cookie = await loginUser(app);

    const create = await app.request("/api/user/keys", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ name: "Spark Key" }),
    });
    expect(create.status).toBe(201);
    const created = (await create.json()) as { data: { key: { id: number; prefix: string } } };
    const key = created.data.key;

    const twoDaysAgo = utcDayOffset(-2);
    const today = utcDayOffset(0);
    const insert = db.sqlite.prepare(
      `INSERT INTO request_logs (ts, request_id, user_id, key_prefix, method, path, model, provider, status, input_tokens, output_tokens, duration_ms, cost)
       VALUES (?, ?, ?, ?, 'POST', '/v1/chat/completions', 'gpt-4o', 'openai', ?, ?, ?, ?, ?)`,
    );
    insert.run(twoDaysAgo.iso, "usage-a", 1, key.prefix, 200, 11, 19, 120, 3);
    insert.run(today.iso, "usage-b", 1, key.prefix, 502, 7, 5, 240, 2);
    insert.run(today.iso, "usage-ignored-prefix", 1, "otherkey", 200, 100, 100, 10, 1);

    const usage = await app.request(`/api/user/keys/${key.id}/usage`, { headers: { cookie } });
    expect(usage.status).toBe(200);
    const payload = (await usage.json()) as {
      data: {
        days: Array<{ date: string; calls: number; tokens: number; cost: number; avgLatency: number; errors: number }>;
      };
    };
    expect(payload.data.days).toHaveLength(7);
    expect(payload.data.days[0]?.calls).toBe(0);

    const byDay = new Map(payload.data.days.map((day) => [day.date, day]));
    expect(byDay.get(twoDaysAgo.day)).toMatchObject({ calls: 1, tokens: 30, cost: 3, avgLatency: 120, errors: 0 });
    expect(byDay.get(today.day)).toMatchObject({ calls: 1, tokens: 12, cost: 2, avgLatency: 240, errors: 1 });
  });
});
