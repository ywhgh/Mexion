import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { openDb } from "../../db/client.js";
import { createChannel } from "../../services/channels.js";
import { createUserKey } from "../../services/user-keys.js";
import { activateSubscriptionPlan } from "../../services/billing.js";
import { registerUser } from "../../services/users.js";

async function fixture(options: { channel?: boolean; modelAllow?: string[] | null; balance?: number } = {}) {
  const db = openDb(":memory:");
  const app = createApp({ db });
  const user = await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
  db.sqlite.prepare("UPDATE users SET balance = ? WHERE id = ?").run(options.balance ?? 1000, user.id);
  activateSubscriptionPlan(db, user.id, 1);
  const key = await createUserKey(db, user.id, { name: "gateway", modelAllow: options.modelAllow ?? null });
  if (options.channel !== false) {
    createChannel(db, { name: "openai", provider: "openai", baseUrl: "https://api.openai.com", secretValue: "sk-upstream", modelList: ["gpt-4o"] });
  }
  return { db, app, user, secret: key.secret };
}

afterEach(() => vi.restoreAllMocks());

describe("gateway handler", () => {
  it("requires authorization", async () => {
    const { app } = await fixture();
    const res = await app.request("/v1/chat/completions", { method: "POST", body: JSON.stringify({ model: "gpt-4o" }) });
    expect(res.status).toBe(401);
  });

  it("rejects query string key", async () => {
    const { app } = await fixture();
    const res = await app.request("/v1/models?key=mx_bad", { headers: { authorization: "Bearer mx_bad" } });
    expect(res.status).toBe(400);
  });

  it("rejects model not allowed", async () => {
    const { app, secret } = await fixture({ modelAllow: ["claude"] });
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 503 when no channel", async () => {
    const { app, secret } = await fixture({ channel: false });
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [] }),
    });
    expect(res.status).toBe(503);
  });

  it("rejects oversized body", async () => {
    const { app, secret } = await fixture();
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json", "content-length": String(5 * 1024 * 1024) },
      body: "{}",
    });
    expect(res.status).toBe(413);
  });

  it("precharges, relays and settles", async () => {
    const { app, db, secret, user } = await fixture();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ id: "cmpl", usage: { prompt_tokens: 100, completion_tokens: 50 } }), { status: 200, headers: { "content-type": "application/json" } })),
    );
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: "hi" }] }),
    });
    expect(res.status).toBe(200);
    expect((db.sqlite.prepare("SELECT status FROM billing_sessions ORDER BY id DESC LIMIT 1").get() as { status: string }).status).toBe("settled");
    expect((db.sqlite.prepare("SELECT COUNT(*) AS c FROM usage_events WHERE user_id = ?").get(user.id) as { c: number }).c).toBe(1);
    expect((db.sqlite.prepare("SELECT COUNT(*) AS c FROM request_logs WHERE user_id = ?").get(user.id) as { c: number }).c).toBe(1);
  });

  it("captures streaming usage when settling", async () => {
    const { app, db, secret, user } = await fixture();
    const encoder = new TextEncoder();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"id":"chunk","choices":[{"delta":{"content":"hi"}}]}\n\n'));
            controller.enqueue(encoder.encode('data: {"response":{"usage":{"input_tokens":123,"output_tokens":45,"total_tokens":168}}}\n\n'));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      )),
    );
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: "hi" }], stream: true }),
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("[DONE]");
    expect((db.sqlite.prepare("SELECT status FROM billing_sessions ORDER BY id DESC LIMIT 1").get() as { status: string }).status).toBe("settled");
    expect(
      db.sqlite.prepare("SELECT input_tokens AS inputTokens, output_tokens AS outputTokens, status FROM usage_events WHERE user_id = ? ORDER BY id DESC LIMIT 1").get(user.id),
    ).toEqual({ inputTokens: 123, outputTokens: 45, status: "ok" });
    expect(
      db.sqlite.prepare("SELECT input_tokens AS inputTokens, output_tokens AS outputTokens FROM request_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1").get(user.id),
    ).toEqual({ inputTokens: 123, outputTokens: 45 });
  });

  it("rolls back provider 500", async () => {
    const { app, db, secret } = await fixture();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { message: "bad" } }), { status: 500, headers: { "content-type": "application/json" } })));
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [] }),
    });
    expect(res.status).toBe(502);
    expect((db.sqlite.prepare("SELECT status FROM billing_sessions ORDER BY id DESC LIMIT 1").get() as { status: string }).status).toBe("refunded");
  });
});
