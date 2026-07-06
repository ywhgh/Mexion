import crypto from "node:crypto";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import type { AppBindings } from "../app.js";
import { DEFAULT_BODY_LIMIT_BYTES, readLimitedBody } from "../middleware/body-limit.js";
import { estimateCost, parseUsageFromResponse } from "../lib/pricing.js";
import { prechargeBilling, rollbackBilling, settleBilling } from "../services/billing.js";
import { markChannelFailure, markChannelSuccess, resolveModelAlias, selectChannelCandidates, type ChannelRecord } from "../services/channels.js";
import { relayToProvider, type GatewayProtocol } from "./providers.js";
import { isResponsesProtocol, writeChatErrorSSE, writeResponsesFailedSSE } from "./stream-error.js";

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

function downstreamStatus(upstream: Response): number {
  if (upstream.ok) return upstream.status;
  return upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502;
}

function usageHasTokens(usage: ReturnType<typeof parseUsageFromResponse>): boolean {
  return usage.inputTokens > 0 || usage.outputTokens > 0;
}

function parseStreamJsonLine(line: string): unknown | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed === "[DONE]") return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function createUsageTrackingStream(
  upstreamBody: ReadableStream<Uint8Array>,
  onDone: (usage: ReturnType<typeof parseUsageFromResponse> | null, streamErrored: boolean) => void,
  provider: string,
  opts: { protocol: GatewayProtocol; model: string },
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let lineBuffer = "";
  let streamUsage: ReturnType<typeof parseUsageFromResponse> | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let settled = false;

  function rememberUsage(parsed: unknown): void {
    const usage = parseUsageFromResponse(provider, parsed);
    if (!usageHasTokens(usage)) return;
    streamUsage = {
      inputTokens: Math.max(streamUsage?.inputTokens ?? 0, usage.inputTokens),
      outputTokens: Math.max(streamUsage?.outputTokens ?? 0, usage.outputTokens),
    };
  }

  function processLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("data:")) {
      rememberUsage(parseStreamJsonLine(trimmed.slice(5)));
      return;
    }
    if (trimmed.startsWith("{")) rememberUsage(parseStreamJsonLine(trimmed));
  }

  function processText(text: string): void {
    lineBuffer += text;
    let nextBreak = lineBuffer.search(/\r?\n/);
    while (nextBreak >= 0) {
      const line = lineBuffer.slice(0, nextBreak);
      lineBuffer = lineBuffer.slice(lineBuffer[nextBreak] === "\r" && lineBuffer[nextBreak + 1] === "\n" ? nextBreak + 2 : nextBreak + 1);
      processLine(line);
      nextBreak = lineBuffer.search(/\r?\n/);
    }
    if (lineBuffer.length > 65536) lineBuffer = lineBuffer.slice(-65536);
  }

  function settle(streamErrored: boolean): void {
    if (settled) return;
    settled = true;
    processText(decoder.decode());
    if (lineBuffer.trim()) processLine(lineBuffer);
    onDone(streamUsage, streamErrored);
  }

  async function writeCompensation(controller: ReadableStreamDefaultController<Uint8Array>): Promise<void> {
    const writer = new WritableStream<Uint8Array>({
      write(chunk) {
        controller.enqueue(chunk);
      },
    }).getWriter();
    if (isResponsesProtocol(opts.protocol)) {
      await writeResponsesFailedSSE(writer, { model: opts.model, errorType: "upstream_error", message: "Upstream disconnected" });
    } else {
      await writeChatErrorSSE(writer, "Upstream disconnected");
    }
    writer.releaseLock();
  }

  return new ReadableStream<Uint8Array>({
    start(controller) {
      reader = upstreamBody.getReader();
      void (async () => {
        let streamErrored = false;
        try {
          for (;;) {
            const result = await reader.read();
            if (result.done) break;
            const chunk = result.value;
            controller.enqueue(chunk);
            processText(decoder.decode(chunk, { stream: true }));
          }
        } catch {
          streamErrored = true;
          try {
            await writeCompensation(controller);
          } catch {
            // Downstream is already gone; nothing else can be written after headers/data were sent.
          }
        } finally {
          settle(streamErrored);
          try {
            controller.close();
          } catch {
            // Client may have closed while we were compensating.
          }
          reader?.releaseLock();
        }
      })();
    },
    cancel(reason) {
      settle(true);
      return reader?.cancel(reason);
    },
  });
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
  const candidates = selectChannelCandidates(c.get("db"), originalModel, key?.groupId ?? null).slice(0, 3);
  const firstChannel = candidates[0];
  if (!firstChannel) throw new HTTPException(503, { message: "No available channel" });
  const estimatedCost = estimateCost(firstChannel.provider, resolved.model, roughInputTokens(rawBody.byteLength), roughOutputTokens(body));
  prechargeBilling(c.get("db"), { requestId, userId: user.id, keyId: key?.id ?? null, estimatedCost });

  let lastError: unknown = null;
  let lastFailure: { upstream: Response; responseText: string; channel: ChannelRecord; durationMs: number; usage: ReturnType<typeof parseUsageFromResponse> } | null = null;

  function insertRequestLog(channel: ChannelRecord, status: number, durationMs: number, inputTokens?: number, outputTokens?: number, cost?: number | null, errorCode?: string | null): void {
    c.get("db")
      .sqlite.prepare(
        `INSERT INTO request_logs (ts, request_id, user_id, key_prefix, method, path, model, provider, group_id, channel_id, status, input_tokens, output_tokens, duration_ms, cost, error_code, body_hash, body_length)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        new Date().toISOString(),
        requestId,
        user.id,
        key?.prefix ?? null,
        c.req.method,
        c.req.path,
        resolved.model,
        channel.provider,
        key?.groupId ?? channel.groupId,
        channel.id,
        status,
        inputTokens ?? null,
        outputTokens ?? null,
        durationMs,
        cost ?? null,
        errorCode ?? null,
        bodyHash,
        rawBody.byteLength,
      );
  }

  for (const channel of candidates) {
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

      if (body.stream === true && upstream.ok && upstream.body) {
        const trackedBody = createUsageTrackingStream(
          upstream.body,
          (streamUsage, streamErrored) => {
            const durationMs = Math.max(0, Math.round(performance.now() - started));
            const hasRealUsage = !!streamUsage && usageHasTokens(streamUsage);
            const inputTokens = hasRealUsage ? (streamUsage.inputTokens || roughInputTokens(rawBody.byteLength)) : roughInputTokens(rawBody.byteLength);
            const outputTokens = hasRealUsage ? streamUsage.outputTokens : 0;
            const actualCost = hasRealUsage ? estimateCost(channel.provider, resolved.model, inputTokens, outputTokens) : estimatedCost;
            try {
              settleBilling(c.get("db"), requestId, {
                actualCost,
                inputTokens,
                outputTokens,
                durationMs,
                model: resolved.model,
                provider: channel.provider,
                channelId: channel.id,
                bodyHash,
                bodyLength: rawBody.byteLength,
                keyPrefix: key?.prefix ?? null,
                status: streamErrored ? "stream_error" : (hasRealUsage ? "ok" : "stream_estimated"),
              });
              if (streamErrored) markChannelFailure(c.get("db"), channel.id);
              else markChannelSuccess(c.get("db"), channel.id, durationMs);
              insertRequestLog(channel, streamErrored ? 502 : upstream.status, durationMs, inputTokens, outputTokens, actualCost, streamErrored ? "UPSTREAM_STREAM_DISCONNECTED" : null);
            } catch (error) {
              console.warn("Failed to settle streaming billing", error);
            }
          },
          channel.provider,
          { protocol: options.protocol, model: resolved.model },
        );
        return new Response(trackedBody, { status: upstream.status, headers: responseHeaders(upstream.headers) });
      }

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
        insertRequestLog(channel, upstream.status, durationMs, usage.inputTokens, usage.outputTokens, actualCost, null);
        return new Response(responseText, { status: upstream.status, headers: responseHeaders(upstream.headers) });
      }

      markChannelFailure(c.get("db"), channel.id);
      insertRequestLog(channel, downstreamStatus(upstream), durationMs, usage.inputTokens, usage.outputTokens, null, `UPSTREAM_${upstream.status}`);
      lastFailure = { upstream, responseText, channel, durationMs, usage };
    } catch (error) {
      lastError = error;
      markChannelFailure(c.get("db"), channel.id);
      const durationMs = Math.max(0, Math.round(performance.now() - started));
      insertRequestLog(channel, 502, durationMs, undefined, undefined, null, error instanceof Error ? error.name : "UPSTREAM_ERROR");
    }
  }

  rollbackBilling(c.get("db"), requestId);
  if (lastFailure) {
    return new Response(lastFailure.responseText, {
      status: downstreamStatus(lastFailure.upstream),
      headers: responseHeaders(lastFailure.upstream.headers),
    });
  }
  if (lastError) throw lastError;
  throw new HTTPException(502, { message: "Upstream request failed" });
}
