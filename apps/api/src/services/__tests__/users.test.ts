import { describe, expect, it } from "vitest";
import { openDb } from "../../db/client.js";
import { migrate } from "../../db/migrate.js";
import { dailyCheckin, getSessionUser, loginUser, registerUser } from "../users.js";

function memoryDb() {
  const db = openDb(":memory:");
  migrate(db);
  return db;
}

describe("users service", () => {
  it("registers user without passwordHash", async () => {
    const db = memoryDb();
    const user = await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
    expect(user.id).toBeGreaterThan(0);
    expect(user.email).toBe("a@example.com");
    expect(Object.prototype.hasOwnProperty.call(user, "passwordHash")).toBe(false);
  });

  it("rejects duplicate email", async () => {
    const db = memoryDb();
    await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
    await expect(registerUser(db, { username: "bob", email: "a@example.com", password: "long-password" })).rejects.toMatchObject({ status: 409 });
  });

  it("logs in and resolves session", async () => {
    const db = memoryDb();
    await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
    const login = await loginUser(db, { emailOrUsername: "alice", password: "long-password" });
    expect(login.sessionToken).toMatch(/^mxs_/);
    expect(getSessionUser(db, login.sessionToken)?.username).toBe("alice");
  });

  it("rejects wrong password", async () => {
    const db = memoryDb();
    await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
    await expect(loginUser(db, { emailOrUsername: "alice", password: "bad-password" })).rejects.toMatchObject({ status: 401 });
  });

  it("returns null for expired sessions", async () => {
    const db = memoryDb();
    const user = await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
    db.sqlite.prepare("INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
      user.id,
      "mxs_expired",
      new Date(Date.now() - 1000).toISOString(),
      new Date().toISOString(),
    );
    expect(getSessionUser(db, "mxs_expired")).toBeNull();
  });

  it("prevents duplicate daily checkin", async () => {
    const db = memoryDb();
    const user = await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
    expect(dailyCheckin(db, user.id).granted).toBe(500);
    await expect(Promise.resolve().then(() => dailyCheckin(db, user.id))).rejects.toMatchObject({ status: 409 });
  });
});
