import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

function vmessLink(): string {
  return `vmess://${Buffer.from(
    JSON.stringify({
      v: "2",
      ps: "Quota Line",
      add: "quota.example.test",
      port: "443",
      id: "33333333-3333-4333-8333-333333333333",
      aid: "0",
      net: "tcp",
      tls: "tls",
    }),
    "utf8",
  ).toString("base64")}`;
}

async function prepareSub(app: ReturnType<typeof createApp>): Promise<{ cookie: string; subId: number }> {
  const bootstrap = await app.request("/api/auth/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "operator", password: "long-password" }),
  });
  const cookie = bootstrap.headers.get("set-cookie")?.split(";")[0] ?? "";
  const createSub = await app.request("/api/subs", {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ name: "Quota", rawSources: [vmessLink()], target: "clash-meta", ruleSet: "none" }),
  });
  const payload = (await createSub.json()) as { ok: true; data: { sub: { id: number } } };
  return { cookie, subId: payload.data.sub.id };
}

describe("tokens and quota", () => {
  it("creates a one-time token secret, stores only a hash, and revokes it", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const { cookie, subId } = await prepareSub(app);
    const create = await app.request("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        name: "Manual Token",
        note: "limited",
        subId,
        quotaBytes: 100000,
        expiresAt: null,
        ipAllow: ["127.0.0.1/32"],
      }),
    });
    expect(create.status).toBe(201);
    const payload = (await create.json()) as { ok: true; data: { secret: string; token: { id: number; prefix: string } } };
    expect(payload.data.secret.startsWith("ax_")).toBe(true);
    expect(payload.data.token.prefix).toBe(payload.data.secret.slice(0, 8));

    const db = app.request("/api/health");
    await expect(db).resolves.toBeDefined();

    const list = await app.request("/api/tokens", { headers: { cookie } });
    const listPayload = (await list.json()) as { ok: true; data: { tokens: Array<{ prefix: string }> } };
    expect(listPayload.data.tokens.some((token) => token.prefix === payload.data.token.prefix)).toBe(true);
    expect(JSON.stringify(listPayload)).not.toContain(payload.data.secret);

    const pull = await app.request(`/v1/sub?token=${encodeURIComponent(payload.data.secret)}`, {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    expect(pull.status).toBe(200);

    const revoke = await app.request(`/api/tokens/${payload.data.token.id}`, { method: "DELETE", headers: { cookie } });
    expect(revoke.status).toBe(200);
    const denied = await app.request(`/v1/sub?token=${encodeURIComponent(payload.data.secret)}`);
    expect(denied.status).toBe(401);
  });

  it("rejects over-quota and disallowed IP pulls", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const { cookie, subId } = await prepareSub(app);
    const blockedIp = await app.request("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ name: "IP Token", subId, quotaBytes: 100000, ipAllow: ["10.0.0.0/8"] }),
    });
    const blockedPayload = (await blockedIp.json()) as { ok: true; data: { secret: string } };
    const deniedIp = await app.request(`/v1/sub?token=${encodeURIComponent(blockedPayload.data.secret)}`, {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    expect(deniedIp.status).toBe(401);

    const lowQuota = await app.request("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ name: "Tiny Token", subId, quotaBytes: 10, ipAllow: [] }),
    });
    const lowPayload = (await lowQuota.json()) as { ok: true; data: { secret: string } };
    const over = await app.request(`/v1/sub?token=${encodeURIComponent(lowPayload.data.secret)}`);
    expect(over.status).toBe(402);
  });
});
