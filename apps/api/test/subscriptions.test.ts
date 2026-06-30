import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

function vmessLink(name: string, host: string): string {
  return `vmess://${Buffer.from(
    JSON.stringify({
      v: "2",
      ps: name,
      add: host,
      port: "443",
      id: "11111111-1111-4111-8111-111111111111",
      aid: "0",
      net: "tcp",
      type: "none",
      host: "",
      path: "",
      tls: "tls",
    }),
    "utf8",
  ).toString("base64")}`;
}

async function bootstrapCookie(app: ReturnType<typeof createApp>): Promise<string> {
  const res = await app.request("/api/auth/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "operator", password: "long-password" }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0] ?? "";
  expect(cookie).toContain("axion_session=");
  return cookie;
}

describe("subscription converter", () => {
  it("creates a subscription and serves clash meta output via public token", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const cookie = await bootstrapCookie(app);
    const create = await app.request("/api/subs", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        name: "Journal Nodes",
        rawSources: [vmessLink("HK Line", "hk.example.test"), vmessLink("HK Line", "hk.example.test")],
        target: "clash-meta",
        ruleSet: "acl4ssr",
        renamePrefix: "AXION",
        filterRegex: "HK",
      }),
    });
    expect(create.status).toBe(201);
    const payload = (await create.json()) as {
      ok: true;
      data: { outputUrl: string; secret: string; sub: { id: number; rawSources: string[] } };
    };
    expect(payload.data.outputUrl).toContain("/v1/sub?token=ax_");
    expect(payload.data.sub.rawSources).toHaveLength(2);

    const list = await app.request("/api/subs", { headers: { cookie } });
    await expect(list.json()).resolves.toMatchObject({ ok: true, data: { subs: [{ name: "Journal Nodes" }] } });

    const pull = await app.request(`/v1/sub?token=${encodeURIComponent(payload.data.secret)}`);
    expect(pull.status).toBe(200);
    const text = await pull.text();
    expect(text).toContain("mixed-port: 7890");
    expect(text).toContain('name: "AXION 1. HK Line"');
    expect(text).toContain("hk.example.test");
    expect(text).toContain("GEOIP,CN,DIRECT");
  });

  it("serves sing-box JSON when requested", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const cookie = await bootstrapCookie(app);
    const create = await app.request("/api/subs", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        name: "Sing Box",
        rawSources: ["vless://22222222-2222-4222-8222-222222222222@sg.example.test:8443?security=tls#SG"],
        target: "sing-box",
        ruleSet: "none",
      }),
    });
    const payload = (await create.json()) as { ok: true; data: { secret: string; sub: { id: number } } };
    const pull = await app.request(`/v1/sub?token=${encodeURIComponent(payload.data.secret)}`);
    expect(pull.headers.get("content-type")).toContain("application/json");
    const json = (await pull.json()) as { outbounds: Array<{ tag?: string; type: string }> };
    expect(json.outbounds.some((outbound) => outbound.tag === "SG" && outbound.type === "vless")).toBe(true);

    const update = await app.request(`/api/subs/${payload.data.sub.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ renamePrefix: "VOL" }),
    });
    expect(update.status).toBe(200);

    const remove = await app.request(`/api/subs/${payload.data.sub.id}`, { method: "DELETE", headers: { cookie } });
    expect(remove.status).toBe(200);
  });
});
