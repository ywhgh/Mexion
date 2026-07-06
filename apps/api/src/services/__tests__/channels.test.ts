import { describe, expect, it } from "vitest";
import { openDb } from "../../db/client.js";
import { migrate } from "../../db/migrate.js";
import { cleanupSessionAffinityMap, createChannel, createGroup, createModelAlias, getChannelSecret, selectChannel, selectChannelWithAffinity } from "../channels.js";

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

  it("prefers a valid session-affinity channel and cleans stale mappings", () => {
    const db = memoryDb();
    const high = createChannel(db, { name: "primary", provider: "openai", baseUrl: "https://primary.example.test", secretValue: "sk", modelList: ["gpt-4o"], priority: 10 });
    const low = createChannel(db, { name: "sticky", provider: "openai", baseUrl: "https://sticky.example.test", secretValue: "sk", modelList: ["gpt-4o"], priority: 1 });
    const now = new Date().toISOString();
    db.sqlite
      .prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)")
      .run("session_channel_map", JSON.stringify({ sess: { channelId: low.id, updatedAt: now } }), now);

    expect(selectChannelWithAffinity(db, "gpt-4o", null, "sess")[0]?.id).toBe(low.id);
    const stored = JSON.parse((db.sqlite.prepare("SELECT value FROM settings WHERE key = 'session_channel_map'").get() as { value: string }).value) as Record<string, unknown>;
    stored.stale = { channelId: high.id, updatedAt: "2026-01-01T00:00:00.000Z" };
    db.sqlite
      .prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = ?")
      .run(JSON.stringify(stored), now, "session_channel_map");
    expect(cleanupSessionAffinityMap(db, new Date("2026-01-03T01:00:00.000Z"))).toBe(1);
    const map = JSON.parse((db.sqlite.prepare("SELECT value FROM settings WHERE key = 'session_channel_map'").get() as { value: string }).value) as Record<string, unknown>;
    expect(map.stale).toBeUndefined();
  });
});
