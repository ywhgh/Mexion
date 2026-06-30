import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

function vmessLink(): string {
  return `vmess://${Buffer.from(
    JSON.stringify({
      v: "2",
      ps: "Log Line",
      add: "log.example.test",
      port: "443",
      id: "44444444-4444-4444-8444-444444444444",
      net: "tcp",
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
  return res.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("audit logs", () => {
  it("filters subscription pull logs by token prefix and exports CSV", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const cookie = await bootstrapCookie(app);
    const created = await app.request("/api/subs", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ name: "Logged", rawSources: [vmessLink()], target: "clash-meta", ruleSet: "none" }),
    });
    const payload = (await created.json()) as { ok: true; data: { secret: string; token: { prefix: string } } };
    const pull = await app.request(`/v1/sub?token=${encodeURIComponent(payload.data.secret)}`, {
      headers: { "x-forwarded-for": "203.0.113.8" },
    });
    expect(pull.status).toBe(200);

    const logs = await app.request(`/api/logs?token=${payload.data.token.prefix}&status=200&limit=10`, { headers: { cookie } });
    const logPayload = (await logs.json()) as {
      ok: true;
      data: { logs: Array<{ tokenPrefix: string; source: string; target: string; status: number }> };
    };
    expect(logPayload.data.logs[0]).toMatchObject({
      tokenPrefix: payload.data.token.prefix,
      source: "203.0.113.8",
      target: expect.stringContaining("/v1/sub"),
      status: 200,
    });

    const csv = await app.request(`/api/logs/export.csv?token=${payload.data.token.prefix}`, { headers: { cookie } });
    expect(csv.headers.get("content-type")).toContain("text/csv");
    const text = await csv.text();
    expect(text).toContain("token_prefix");
    expect(text).toContain(payload.data.token.prefix);
  });
});
