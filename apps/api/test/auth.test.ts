import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

function sessionCookie(response: Response): string {
  const cookie = response.headers.get("set-cookie");
  expect(cookie).toContain("mexion_session=");
  return cookie?.split(";")[0] ?? "";
}

describe("admin auth", () => {
  it("bootstraps, reads current admin, signs out, and signs in", async () => {
    const app = createApp({ dbPath: ":memory:" });

    const before = await app.request("/api/auth/me");
    await expect(before.json()).resolves.toMatchObject({ ok: true, data: { bootstrapped: false, admin: null } });

    const bootstrap = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "operator", password: "long-password" }),
    });
    expect(bootstrap.status).toBe(201);
    const cookie = sessionCookie(bootstrap);
    await expect(bootstrap.json()).resolves.toMatchObject({ ok: true, data: { admin: { username: "operator" } } });

    const duplicate = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "another", password: "long-password" }),
    });
    expect(duplicate.status).toBe(409);

    const me = await app.request("/api/auth/me", { headers: { cookie } });
    await expect(me.json()).resolves.toMatchObject({ ok: true, data: { bootstrapped: true, admin: { username: "operator" } } });

    const signOut = await app.request("/api/auth/sign-out", { method: "POST", headers: { cookie } });
    expect(signOut.headers.get("set-cookie")).toContain("Max-Age=0");

    const denied = await app.request("/api/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "operator", password: "wrong-password" }),
    });
    expect(denied.status).toBe(401);

    const signIn = await app.request("/api/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "operator", password: "long-password" }),
    });
    expect(signIn.status).toBe(200);
    expect(sessionCookie(signIn)).toContain("mexion_session=");
  });

  it("requires an admin session before password changes", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const res = await app.request("/api/auth/password", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: "old", nextPassword: "new-password" }),
    });
    expect(res.status).toBe(401);
  });
});
