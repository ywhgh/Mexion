import crypto from "node:crypto";

export type StreamErrorType = "server_error" | "rate_limit_exceeded" | "upstream_error";

const encoder = new TextEncoder();

function randomId(): string {
  return crypto.randomBytes(12).toString("hex");
}

function mapErrorCode(errorType: StreamErrorType): string {
  if (errorType === "rate_limit_exceeded") return "rate_limit_exceeded";
  if (errorType === "upstream_error") return "upstream_error";
  return "server_error";
}

async function writeSse(writer: WritableStreamDefaultWriter<Uint8Array>, payload: string): Promise<void> {
  await writer.write(encoder.encode(payload));
}

export async function writeResponsesFailedSSE(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  opts: { model: string; errorType: StreamErrorType; message: string },
): Promise<void> {
  const data = {
    type: "response.failed",
    response: {
      id: `resp_${randomId()}`,
      object: "response",
      model: opts.model,
      status: "failed",
      output: [],
      error: {
        code: mapErrorCode(opts.errorType),
        message: opts.message,
      },
    },
  };
  await writeSse(writer, `event: response.failed\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function writeChatErrorSSE(writer: WritableStreamDefaultWriter<Uint8Array>, message: string): Promise<void> {
  await writeSse(writer, `data: ${JSON.stringify({ error: { type: "server_error", message } })}\n\n`);
  await writeSse(writer, "data: [DONE]\n\n");
}

export function isResponsesProtocol(protocol: string): boolean {
  return protocol === "openai-responses" || protocol === "codex";
}
