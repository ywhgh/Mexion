import { describe, expect, it } from "vitest";
import { openDb } from "../../db/client.js";
import { migrate } from "../../db/migrate.js";
import { createUserKey, listUserKeys, revokeUserKey, updateUserKey, verifyUserKey } from "../user-keys.js";
import { registerUser } from "../users.js";

async function fixture() {
  const db = openDb(":memory:");
  migrate(db);
  const user = await registerUser(db, { username: "alice", email: "a@example.com", password: "long-password" });
  return { db, user };
}

describe("user api keys", () => {
  it("creates key and returns secret once", async () => {
    const { db, user } = await fixture();
    const created = await createUserKey(db, user.id, { name: "main", modelAllow: ["gpt-4o"] });
    expect(created.secret).toMatch(/^mx_/);
    expect(created.key.prefix).toBe(created.secret.slice(0, 8));
    expect(Object.prototype.hasOwnProperty.call(created.key, "hash")).toBe(false);
    expect(listUserKeys(db, user.id)).toHaveLength(1);
  });

  it("verifies, updates last used, and enforces model/ip metadata", async () => {
    const { db, user } = await fixture();
    const created = await createUserKey(db, user.id, { name: "main", ipAllow: ["203.0.113.7"] });
    const verified = await verifyUserKey(db, created.secret, "203.0.113.7");
    expect(verified.user.id).toBe(user.id);
    expect(verified.key.lastUsedAt).toBeTruthy();
    await expect(verifyUserKey(db, created.secret, "203.0.113.8")).rejects.toMatchObject({ status: 401 });
  });

  it("updates and revokes own key", async () => {
    const { db, user } = await fixture();
    const created = await createUserKey(db, user.id, { name: "main" });
    const updated = updateUserKey(db, user.id, created.key.id, { name: "renamed", status: "disabled" });
    expect(updated.name).toBe("renamed");
    expect(updated.status).toBe("disabled");
    await expect(verifyUserKey(db, created.secret, "127.0.0.1")).rejects.toMatchObject({ status: 401 });
    const active = updateUserKey(db, user.id, created.key.id, { status: "active" });
    expect(active.status).toBe("active");
    revokeUserKey(db, user.id, created.key.id);
    await expect(verifyUserKey(db, created.secret, "127.0.0.1")).rejects.toMatchObject({ status: 401 });
  });
});
