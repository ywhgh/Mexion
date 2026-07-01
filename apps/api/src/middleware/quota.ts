import { HTTPException } from "hono/http-exception";
import type { DbClient } from "../db/client.js";
import type { TokenRecord } from "../services/tokens.js";

export function assertTokenQuota(token: TokenRecord, bytes: number): void {
  if (token.quotaBytes !== null && token.usedBytes + bytes > token.quotaBytes) {
    throw new HTTPException(402, { message: "Token quota exhausted" });
  }
}

export function incrementTokenUsage(db: DbClient, token: TokenRecord, bytes: number): TokenRecord {
  assertTokenQuota(token, bytes);
  db.sqlite.prepare("UPDATE tokens SET used_bytes = used_bytes + ? WHERE id = ?").run(bytes, token.id);
  return { ...token, usedBytes: token.usedBytes + bytes };
}
