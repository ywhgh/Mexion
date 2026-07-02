import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "../app.js";

export const DEFAULT_BODY_LIMIT_BYTES = 4 * 1024 * 1024;

export function bodyLimit(maxBytes = DEFAULT_BODY_LIMIT_BYTES) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const contentLength = c.req.header("content-length");
    if (contentLength && Number.parseInt(contentLength, 10) > maxBytes) {
      throw new HTTPException(413, { message: "Request body too large" });
    }
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      const clone = c.req.raw.clone();
      await readLimitedBody(clone, maxBytes);
    }
    await next();
  });
}

export async function readLimitedBody(request: Request, maxBytes = DEFAULT_BODY_LIMIT_BYTES): Promise<Uint8Array> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > maxBytes) {
    throw new HTTPException(413, { message: "Request body too large" });
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > maxBytes) {
          throw new HTTPException(413, { message: "Request body too large" });
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

