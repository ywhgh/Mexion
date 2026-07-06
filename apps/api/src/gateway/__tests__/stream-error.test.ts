import { describe, expect, it } from "vitest";
import { isResponsesProtocol, writeChatErrorSSE, writeResponsesFailedSSE } from "../stream-error.js";

async function collectWrite(fn: (writer: WritableStreamDefaultWriter<Uint8Array>) => Promise<void>): Promise<string> {
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  const stream = new WritableStream<Uint8Array>({
    write(chunk) {
      chunks.push(decoder.decode(chunk));
    },
  });
  const writer = stream.getWriter();
  await fn(writer);
  writer.releaseLock();
  return chunks.join("");
}

describe("stream error compensation", () => {
  it("writes Responses response.failed event", async () => {
    const output = await collectWrite((writer) => writeResponsesFailedSSE(writer, { model: "gpt-4o", errorType: "upstream_error", message: "Upstream disconnected" }));
    expect(output).toContain("event: response.failed");
    expect(output).toContain('"type":"response.failed"');
    expect(output).toContain('"status":"failed"');
    expect(output).toContain('"model":"gpt-4o"');
    expect(output).toContain('"code":"upstream_error"');
  });

  it("writes Chat Completions error and DONE chunks", async () => {
    const output = await collectWrite((writer) => writeChatErrorSSE(writer, "Upstream disconnected"));
    expect(output).toContain('"error"');
    expect(output).toContain('"message":"Upstream disconnected"');
    expect(output).toContain("data: [DONE]");
  });

  it("detects Responses-compatible protocols", () => {
    expect(isResponsesProtocol("openai-responses")).toBe(true);
    expect(isResponsesProtocol("codex")).toBe(true);
    expect(isResponsesProtocol("openai-chat")).toBe(false);
  });
});
