import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("relay routes", () => {
  it("creates, proxies, records a log, toggles, and deletes a route", async () => {
    const db = openDb(":memory:");
    const app = createApp({ db });
    const cookie = await bootstrapCookie(app);
    const create = await app.request("/api/routes", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ alias: "demo", upstream: "https://1.1.1.1/anything", enabled: true }),
    });
    expect(create.status).toBe(201);
    const created = (await create.json()) as { ok: true; data: { route: { id: number; alias: string } } };
    expect(created.data.route.alias).toBe("demo");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => new Response(`relay:${String(input)}`, { status: 202 })),
    );
    const relayed = await app.request("/api/r/demo/node?q=1", { headers: { "x-forwarded-for": "198.51.100.2" } });
    expect(relayed.status).toBe(202);
    expect(await relayed.text()).toContain("https://1.1.1.1/anything/node?q=1");
    const log = db.sqlite.prepare("SELECT source, target, status FROM logs ORDER BY id DESC LIMIT 1").get() as {
      source: string;
      target: string;
      status: number;
    };
    expect(log.source).toBe("198.51.100.2");
    expect(log.target).toContain("/anything/node?q=1");
    expect(log.status).toBe(202);

    const latency = await app.request(`/api/routes/${created.data.route.id}/latency`, { headers: { cookie } });
    await expect(latency.json()).resolves.toMatchObject({ ok: true, data: { routeId: created.data.route.id } });

    const patch = await app.request(`/api/routes/${created.data.route.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ enabled: false }),
    });
    expect(patch.status).toBe(200);
    const disabled = await app.request("/api/r/demo/node");
    expect(disabled.status).toBe(404);

    const remove = await app.request(`/api/routes/${created.data.route.id}`, { method: "DELETE", headers: { cookie } });
    expect(remove.status).toBe(200);
  });
});

