import type { ChannelRecord } from "../services/channels.js";
import { getChannelSecret } from "../services/channels.js";
import type { DbClient } from "../db/client.js";
import { safeFetch } from "../lib/safe-http.js";

export type GatewayProtocol = "openai-chat" | "openai-responses" | "anthropic" | "gemini" | "codex" | "embeddings";

export type RelayProviderInput = {
  db: DbClient;
  channel: ChannelRecord;
  protocol: GatewayProtocol;
  requestBody: unknown;
  rawBody: Uint8Array;
  model: string;
  path: string;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function providerPath(protocol: GatewayProtocol, model: string, path: string): string {
  if (protocol === "openai-responses" || protocol === "codex") return "/v1/responses";
  if (protocol === "anthropic") return "/v1/messages";
  if (protocol === "gemini") return path || `/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  if (protocol === "embeddings") return "/v1/embeddings";
  return "/v1/chat/completions";
}

function bodyBuffer(body: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(body.byteLength);
  copy.set(body);
  return copy.buffer;
}

function withGeminiKey(url: string, secret: string): string {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("key")) parsed.searchParams.set("key", secret);
  return parsed.toString();
}

export async function relayToProvider(input: RelayProviderInput): Promise<Response> {
  const secret = getChannelSecret(input.db, input.channel.id);
  const headers = new Headers({ "content-type": "application/json" });
  let url = input.channel.provider === "custom"
    ? `${trimSlash(input.channel.baseUrl)}${input.path}`
    : `${trimSlash(input.channel.baseUrl)}${providerPath(input.protocol, input.model, input.path)}`;
  if (input.channel.provider === "anthropic") {
    headers.set("x-api-key", secret);
    headers.set("anthropic-version", "2023-06-01");
  } else if (input.channel.provider === "gemini") {
    url = withGeminiKey(url, secret);
  } else if (input.channel.provider === "azure") {
    headers.set("api-key", secret);
    const parsed = new URL(`${trimSlash(input.channel.baseUrl)}/openai/deployments/${encodeURIComponent(input.model)}/chat/completions`);
    if (!parsed.searchParams.has("api-version")) parsed.searchParams.set("api-version", "2024-10-21");
    url = parsed.toString();
  } else {
    headers.set("authorization", `Bearer ${secret}`);
  }
  return safeFetch(url, { method: "POST", headers, body: bodyBuffer(input.rawBody) });
}



