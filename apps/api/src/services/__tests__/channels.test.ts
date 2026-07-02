import { describe, expect, it } from "vitest";
import { openDb } from "../../db/client.js";
import { migrate } from "../../db/migrate.js";
import { createChannel, createGroup, createModelAlias, getChannelSecret, selectChannel } from "../channels.js";

function memoryDb() {
  const db = openDb(":memory:");
  migrate(db);
  return db;
}

describe("channels service", () => {
  it("rejects loopback baseUrl", () => {
    const db = memoryDb();
    expect(() => createChannel(db, { name: "bad", provider: "openai", baseUrl: "http://127.0.0.1", secretValue: "sk" })).toThrow();
  });

  it("creates public channel and encrypts secret", () => {
    const db = memoryDb();
    const group = createGroup(db, { name: "pro" });
    const channel = createChannel(db, { name: "openai", provider: "openai", baseUrl: "https://api.openai.com", secretValue: "sk-secret", groupId: group.id, modelList: ["gpt-4o"] });
    expect(channel.id).toBeGreaterThan(0);
    expect(getChannelSecret(db, channel.id)).toBe("sk-secret");
    const row = db.sqlite.prepare("SELECT encrypted_value AS encryptedValue FROM channel_secrets WHERE channel_id = ?").get(channel.id) as { encryptedValue: string };
    expect(row.encryptedValue).not.toContain("sk-secret");
  });

  it("detects alias cycle", () => {
    const db = memoryDb();
    createModelAlias(db, { sourceModel: "a", targetModel: "b" });
    expect(() => createModelAlias(db, { sourceModel: "b", targetModel: "a" })).toThrow();
  });

  it("selects active matching channel", () => {
    const db = memoryDb();
    const channel = createChannel(db, { name: "openai", provider: "openai", baseUrl: "https://api.openai.com", secretValue: "sk", modelList: ["gpt-4o"], priority: 10 });
    expect(selectChannel(db, "gpt-4o").id).toBe(channel.id);
  });
});
