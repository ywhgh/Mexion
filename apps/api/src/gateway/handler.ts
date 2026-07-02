import crypto from "node:crypto";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import type { AppBindings } from "../app.js";
import { DEFAULT_BODY_LIMIT_BYTES, readLimitedBody } from "../middleware/body-limit.js";
import { estimateCost, parseUsageFromResponse } from "../lib/pricing.js";
import { prechargeBilling, rollbackBilling, settleBilling } from "../services/billing.js";
import { markChannelFailure, markChannelSuccess, resolveModelAlias, selectChannel } from "../services/channels.js";
import { relayToProvider, type GatewayProtocol } from "./providers.js";

export type GatewayOptions = { protocol: GatewayProtocol };

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function extractModel(body: JsonObject, fallback = "gpt-4o"): string {
  const model = body.model;
  return typeof model === "string" && model.trim() ? model.trim() : fallback;
}

function roughInputTokens(rawLength: number): number {
  return Math.max(1, Math.ceil(rawLength / 4));
}

function roughOutputTokens(body: JsonObject): number {
  const maxTokens = body.max_tokens ?? body.max_completion_tokens ?? body.max_output_tokens;
  return typeof maxTokens === "number" && Number.isFinite(maxTokens) ? Math.max(1, Math.ceil(maxTokens)) : 1024;
}

async function readJsonBody(c: Context<AppBindings>): Promise<{ rawBody: Uint8Array; body: JsonObject; bodyHash: string }> {
  const rawBody = await readLimitedBody(c.req.raw, DEFAULT_BODY_LIMIT_BYTES);
  const text = new TextDecoder().decode(rawBody);
  let parsed: unknown = {};
  if (text.trim()) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new HTTPException(400, { message: "Invalid JSON body" });
    }
  }
  return { rawBody, body: asObject(parsed), bodyHash: crypto.createHash("sha256").update(rawBody).digest("hex") };
}

function maybeJson(text: string): unknown {
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function responseHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  return headers;
}

export async function handleGatewayRequest(c: Context<AppBindings>, options: GatewayOptions): Promise<Response> {
  const started = performance.now();
  const requestId = crypto.randomUUID();
  const { rawBody, body, bodyHash } = await readJsonBody(c);
  const originalModel = c.req.param("model") || extractModel(body);
  const key = c.get("gatewayKey");
  const user = c.get("gatewayUser");
  if (key?.modelAllow && key.modelAllow.length > 0 && !key.modelAllow.includes(originalModel)) {
    throw new HTTPException(403, { message: "Model not allowed by key" });
  }
  const resolved = resolveModelAlias(c.get("db"), originalModel);
  const providerBody = { ...body, model: resolved.model };
  const providerRawBody = new TextEncoder().encode(JSON.stringify(providerBody));
  const channel = selectChannel(c.get("db"), originalModel, key?.groupId ?? null);
  const estimatedCost = estimateCost(channel.provider, resolved.model, roughInputTokens(rawBody.byteLength), roughOutputTokens(body));
  prechargeBilling(c.get("db"), { requestId, userId: user.id, keyId: key?.id ?? null, estimatedCost });
  try {
    const upstream = await relayToProvider({
      db: c.get("db"),
      channel,
      protocol: options.protocol,
      requestBody: providerBody,
      rawBody: providerRawBody,
      model: resolved.model,
      path: new URL(c.req.url).pathname,
    });
    const responseText = await upstream.text();
    const parsed = maybeJson(responseText);
    const usage = parseUsageFromResponse(channel.provider, parsed);
    const actualCost = estimateCost(channel.provider, resolved.model, usage.inputTokens || roughInputTokens(rawBody.byteLength), usage.outputTokens);
    const durationMs = Math.max(0, Math.round(performance.now() - started));
    if (upstream.ok) {
      settleBilling(c.get("db"), requestId, {
        actualCost,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        durationMs,
        model: resolved.model,
        provider: channel.provider,
        channelId: channel.id,
        bodyHash,
        bodyLength: rawBody.byteLength,
        keyPrefix: key?.prefix ?? null,
        status: "ok",
      });
      markChannelSuccess(c.get("db"), channel.id, durationMs);
    } else {
      rollbackBilling(c.get("db"), requestId);
      markChannelFailure(c.get("db"), channel.id);
    }
    c.get("db")
      .sqlite.prepare(
        `INSERT INTO request_logs (ts, request_id, user_id, key_prefix, method, path, model, provider, group_id, channel_id, status, input_tokens, output_tokens, duration_ms, cost, error_code, body_hash, body_length)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(new Date().toISOString(), requestId, user.id, key?.prefix ?? null, c.req.method, c.req.path, resolved.model, channel.provider, key?.groupId ?? channel.groupId, channel.id, upstream.status, usage.inputTokens, usage.outputTokens, durationMs, upstream.ok ? actualCost : null, upstream.ok ? null : `UPSTREAM_${upstream.status}`, bodyHash, rawBody.byteLength);
    return new Response(responseText, { status: upstream.ok ? upstream.status : 502, headers: responseHeaders(upstream.headers) });
  } catch (error) {
    rollbackBilling(c.get("db"), requestId);
    markChannelFailure(c.get("db"), channel.id);
    c.get("db")
      .sqlite.prepare(
        `INSERT INTO request_logs (ts, request_id, user_id, key_prefix, method, path, model, provider, group_id, channel_id, status, duration_ms, error_code, body_hash, body_length)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(new Date().toISOString(), requestId, user.id, key?.prefix ?? null, c.req.method, c.req.path, resolved.model, channel.provider, key?.groupId ?? channel.groupId, channel.id, 502, Math.max(0, Math.round(performance.now() - started)), error instanceof Error ? error.name : "UPSTREAM_ERROR", bodyHash, rawBody.byteLength);
    throw error;
  }
}
