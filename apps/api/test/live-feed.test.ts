import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { openDb } from "../src/db/client";
import { broadcastLiveEvent, liveClientCount } from "../src/services/live-feed";

function userCookie(response: Response): string {
  const cookie = response.headers.get("set-cookie");
  expect(cookie).toContain("mexion_user_session=");
  return cookie?.split(";")[0] ?? "";
}

async function loginUser(app: ReturnType<typeof createApp>): Promise<string> {
  const register = await app.request("/api/user/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "live", email: "live@example.test", password: "long-password" }),
  });
  expect(register.status).toBe(201);
  const login = await app.request("/api/user/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "live", password: "long-password" }),
  });
  expect(login.status).toBe(200);
  return userCookie(login);
}

describe("live feed SSE", () => {
  it("streams request events to the logged-in user", async () => {
    const db = openDb(":memory:");
    const app = createApp({ db });
    const cookie = await loginUser(app);

    const response = await app.request("/api/stats/live-stream", { headers: { cookie } });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.body).toBeTruthy();

    const reader = response.body?.getReader();
    expect(reader).toBeTruthy();
    const decoder = new TextDecoder();
    const hello = await reader?.read();
    expect(decoder.decode(hello?.value)).toContain("connected");
    expect(liveClientCount()).toBe(1);

    broadcastLiveEvent({
      type: "request",
      userId: 1,
      ts: new Date().toISOString(),
      model: "gpt-4o",
      provider: "openai",
      status: 200,
      durationMs: 42,
      cost: 3,
      keyPrefix: "mx_test",
    });

    const event = await reader?.read();
    expect(decoder.decode(event?.value)).toContain('"model":"gpt-4o"');
    await reader?.cancel();
  });
});
