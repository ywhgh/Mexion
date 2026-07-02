import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { bodyLimit } from "../middleware/body-limit.js";
import { gatewayAuth } from "../middleware/gateway-auth.js";
import { listChannels, listModelAliases } from "../services/channels.js";
import { handleGatewayRequest } from "../gateway/handler.js";

export const gatewayRoutes = new Hono<AppBindings>();

const startedAt = Date.now();
const version = "0.1.0";
const buildTime = new Date().toISOString();

gatewayRoutes.get("/healthz", (c) => c.json({ ok: true, uptime: Math.floor((Date.now() - startedAt) / 1000), version }));
gatewayRoutes.get("/version", (c) => c.json({ version, buildTime }));

gatewayRoutes.get("/v1/models", gatewayAuth, (c) => {
  const channels = listChannels(c.get("db")).filter((channel) => channel.status === "active");
  const aliases = listModelAliases(c.get("db")).filter((alias) => alias.enabled);
  const ids = Array.from(new Set([...aliases.map((alias) => alias.sourceModel), ...channels.flatMap((channel) => channel.modelList ?? [])])).sort();
  return c.json({ object: "list", data: ids.map((id) => ({ id, object: "model", owned_by: "mexion" })) });
});

gatewayRoutes.post("/v1/chat/completions", gatewayAuth, bodyLimit(), (c) => handleGatewayRequest(c, { protocol: "openai-chat" }));
gatewayRoutes.post("/v1/responses", gatewayAuth, bodyLimit(), (c) => handleGatewayRequest(c, { protocol: "openai-responses" }));
gatewayRoutes.post("/v1/messages", gatewayAuth, bodyLimit(), (c) => handleGatewayRequest(c, { protocol: "anthropic" }));
gatewayRoutes.post("/v1/embeddings", gatewayAuth, bodyLimit(), (c) => handleGatewayRequest(c, { protocol: "embeddings" }));
gatewayRoutes.post("/v1beta/models/:model/:action", gatewayAuth, bodyLimit(), (c) => handleGatewayRequest(c, { protocol: "gemini" }));
gatewayRoutes.post("/backend-api/codex/responses", gatewayAuth, bodyLimit(), (c) => handleGatewayRequest(c, { protocol: "codex" }));
