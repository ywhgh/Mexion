import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

async function bootstrapCookie(app: ReturnType<typeof createApp>): Promise<string> {
  const res = await app.request("/api/auth/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "auditor", password: "long-password" }),
  });
  expect(res.status).toBe(201);
  return res.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("admin audit logs", () => {
  it("records dangerous admin operations and lists recent logs", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const cookie = await bootstrapCookie(app);
    const register = await app.request("/api/user/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "target", email: "target@example.test", password: "long-password" }),
    });
    const registered = (await register.json()) as { data: { id: number } };

    const patch = await app.request(`/api/admin/users/${registered.data.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie, "x-forwarded-for": "203.0.113.10" },
      body: JSON.stringify({ status: "banned", balance: 500 }),
    });
    expect(patch.status).toBe(200);

    const logs = await app.request("/api/admin/audit-logs?limit=10", { headers: { cookie } });
    expect(logs.status).toBe(200);
    await expect(logs.json()).resolves.toMatchObject({
      ok: true,
      data: {
        logs: [
          {
            action: "user.update",
            targetType: "user",
            targetId: String(registered.data.id),
            ip: "203.0.113.10",
            before: { status: "active" },
            after: { status: "banned", balance: 500 },
          },
        ],
      },
    });
  });
});
