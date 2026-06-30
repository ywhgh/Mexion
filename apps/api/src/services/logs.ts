import type { DbClient } from "../db/client.js";

export type LogInput = {
  tokenPrefix?: string | null;
  source: string;
  target: string;
  bytes: number;
  durationMs: number;
  status: number;
};

export function recordLog(db: DbClient, input: LogInput): void {
  db.sqlite
    .prepare(
      `INSERT INTO logs (ts, token_prefix, source, target, bytes, duration_ms, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      new Date().toISOString(),
      input.tokenPrefix ?? null,
      input.source,
      input.target,
      input.bytes,
      input.durationMs,
      input.status,
    );
  db.sqlite.prepare("DELETE FROM logs WHERE id NOT IN (SELECT id FROM logs ORDER BY id DESC LIMIT 50000)").run();
}
