import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { openDb } from "../src/db/client";

async function bootstrapCookie(app: ReturnType<typeof createApp>): Promise<string> {
  const res = await app.request("/api/auth/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "operator", password: "long-password" }),
  });
  return res.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("stats and settings", () => {
  it("reads stats and patches settings", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const cookie = await bootstrapCookie(app);
    const stats = await app.request("/api/stats", { headers: { cookie } });
    expect(stats.status).toBe(200);
    await expect(stats.json()).resolves.toMatchObject({ ok: true, data: { stats: { totals: { requests: 0 }, heatmap: expect.any(Array) } } });

    const settings = await app.request("/api/settings", { headers: { cookie } });
    await expect(settings.json()).resolves.toMatchObject({ ok: true, data: { settings: { instanceName: "Mexion", theme: "light", lang: "zh" } } });

    const patch = await app.request("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ instanceName: "Lab", theme: "dark", lang: "en" }),
    });
    await expect(patch.json()).resolves.toMatchObject({ ok: true, data: { settings: { instanceName: "Lab", theme: "dark", lang: "en" } } });
  });

  it("returns ops dashboard metrics", async () => {
    const db = openDb(":memory:");
    const app = createApp({ db });
    const cookie = await bootstrapCookie(app);
    const now = new Date().toISOString();
    const channel = db.sqlite
      .prepare("INSERT INTO channels (name, provider, base_url, priority, status, latency_ms, error_count, created_at) VALUES (?, ?, ?, 0, 'active', ?, ?, ?)")
      .run("Primary OpenAI", "openai", "https://upstream.example.test", 123, 2, now);
    const channelId = Number(channel.lastInsertRowid);
    const insertUsage = db.sqlite.prepare(
      `INSERT INTO usage_events (ts, request_id, user_id, key_prefix, channel_id, model, provider, input_tokens, output_tokens, duration_ms, ttft_ms, cost, status)
       VALUES (?, ?, NULL, 'mx_test', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    insertUsage.run(now, "ops-1", channelId, "gpt-4o", "openai", 10, 20, 100, 40, 3, "ok");
    insertUsage.run(now, "ops-2", channelId, "gpt-4o", "openai", 1, 2, 300, 200, 1, "stream_error");

    const stats = await app.request("/api/stats/overview", { headers: { cookie } });
    expect(stats.status).toBe(200);
    const payload = (await stats.json()) as {
      data: {
        stats: {
          channelHealth: Array<{ channelId: number; requestsLast1h: number; errorsLast1h: number }>;
          providerDistribution: Array<{ provider: string; requestCount: number; errorCount: number; avgLatencyMs: number }>;
          errorRateTrend: Array<{ totalRequests: number; errors: number; errorRate: number }>;
          ttftPercentiles: { p50: number; p90: number; p99: number };
          topModels: Array<{ model: string; requestCount: number }>;
        };
      };
    };

    expect(payload.data.stats.channelHealth).toEqual([
      expect.objectContaining({ channelId, requestsLast1h: 2, errorsLast1h: 1 }),
    ]);
    expect(payload.data.stats.providerDistribution[0]).toMatchObject({ provider: "openai", requestCount: 2, errorCount: 1, avgLatencyMs: 200 });
    expect(payload.data.stats.errorRateTrend).toHaveLength(24);
    expect(payload.data.stats.errorRateTrend.at(-1)).toMatchObject({ totalRequests: 2, errors: 1, errorRate: 50 });
    expect(payload.data.stats.ttftPercentiles).toMatchObject({ p50: 40, p90: 200, p99: 200 });
    expect(payload.data.stats.topModels[0]).toMatchObject({ model: "gpt-4o", requestCount: 2 });
  });
});
