import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

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
    await expect(settings.json()).resolves.toMatchObject({ ok: true, data: { settings: { instanceName: "Axion", theme: "light", lang: "zh" } } });

    const patch = await app.request("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ instanceName: "Lab", theme: "dark", lang: "en" }),
    });
    await expect(patch.json()).resolves.toMatchObject({ ok: true, data: { settings: { instanceName: "Lab", theme: "dark", lang: "en" } } });
  });
});
