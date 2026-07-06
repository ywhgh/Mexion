import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

async function adminCookie(app: ReturnType<typeof createApp>): Promise<string> {
  const res = await app.request("/api/auth/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "long-password" }),
  });
  expect(res.status).toBe(201);
  return res.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("admin channel probe", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("probes channel latency through the admin endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 })),
    );

    const app = createApp({ dbPath: ":memory:" });
    const cookie = await adminCookie(app);
    const create = await app.request("/api/admin/channels", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        name: "OpenAI primary",
        provider: "openai",
        baseUrl: "https://api.openai.com/v1",
        secretValue: "sk-test",
        modelList: ["gpt-4o-mini"],
      }),
    });
    expect(create.status).toBe(201);
    const created = (await create.json()) as { data: { channel: { id: number } } };

    const probe = await app.request(`/api/admin/channels/${created.data.channel.id}/probe`, {
      method: "POST",
      headers: { cookie },
    });
    expect(probe.status).toBe(200);
    await expect(probe.json()).resolves.toMatchObject({
      ok: true,
      data: { status: "active" },
    });

    const list = await app.request("/api/admin/channels", { headers: { cookie } });
    const body = (await list.json()) as { data: { channels: Array<{ id: number; latencyMs: number | null; errorCount: number; status: string }> } };
    const channel = body.data.channels.find((item) => item.id === created.data.channel.id);
    expect(channel?.status).toBe("active");
    expect(channel?.errorCount).toBe(0);
    expect(typeof channel?.latencyMs).toBe("number");
  });

  it("runs an upstream connectivity test for a channel", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "chatcmpl_test" }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const app = createApp({ dbPath: ":memory:" });
    const cookie = await adminCookie(app);
    const create = await app.request("/api/admin/channels", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        name: "OpenAI test",
        provider: "openai",
        baseUrl: "https://api.openai.com/v1",
        secretValue: "sk-test",
        modelList: ["gpt-4o-mini"],
      }),
    });
    const created = (await create.json()) as { data: { channel: { id: number } } };

    const test = await app.request(`/api/admin/channels/${created.data.channel.id}/test`, {
      method: "POST",
      headers: { cookie },
    });

    expect(test.status).toBe(200);
    await expect(test.json()).resolves.toMatchObject({
      ok: true,
      data: { ok: true, status: 200 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
