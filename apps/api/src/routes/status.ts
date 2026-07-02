import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { listChannels, listModelAliases } from "../services/channels.js";

export const statusRoutes = new Hono<AppBindings>();

statusRoutes.get("/models", (c) => {
  const channels = listChannels(c.get("db")).filter((channel) => channel.status === "active");
  const aliases = listModelAliases(c.get("db")).filter((alias) => alias.enabled);
  const models = Array.from(new Set([
    ...aliases.map((alias) => alias.sourceModel),
    ...channels.flatMap((channel) => channel.modelList ?? []),
  ])).sort();
  return c.json({
    ok: true,
    data: {
      models,
      channels: channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        provider: channel.provider,
        baseUrl: channel.baseUrl,
        modelList: channel.modelList,
        groupId: channel.groupId,
        priority: channel.priority,
        status: channel.status,
        latencyMs: channel.latencyMs,
        lastCheckedAt: channel.lastCheckedAt,
      })),
      aliases,
    },
  });
});
