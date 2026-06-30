import type { Context } from "hono";
import { logsQuerySchema } from "../contracts.js";
import type { DbClient } from "../db/client.js";
import type { AppBindings } from "../app.js";

export type LogInput = {
  tokenPrefix?: string | null;
  source: string;
  target: string;
  bytes: number;
  durationMs: number;
  status: number;
};

export type LogRecord = {
  id: number;
  ts: string;
  tokenPrefix: string | null;
  source: string;
  target: string;
  bytes: number;
  durationMs: number;
  status: number;
};

function rowToLog(row: unknown): LogRecord | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") {
    return null;
  }
  return {
    id: value.id,
    ts: String(value.ts ?? ""),
    tokenPrefix: value.tokenPrefix === null || value.tokenPrefix === undefined ? null : String(value.tokenPrefix),
    source: String(value.source ?? ""),
    target: String(value.target ?? ""),
    bytes: Number(value.bytes ?? 0),
    durationMs: Number(value.durationMs ?? 0),
    status: Number(value.status ?? 0),
  };
}

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

export function queryLogRecords(db: DbClient, query: { token?: string | undefined; status?: number | undefined; limit: number }): LogRecord[] {
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  if (query.token) {
    clauses.push("token_prefix = ?");
    params.push(query.token);
  }
  if (query.status) {
    clauses.push("status = ?");
    params.push(query.status);
  }
  params.push(query.limit);
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db.sqlite
    .prepare(
      `SELECT id, ts, token_prefix AS tokenPrefix, source, target, bytes, duration_ms AS durationMs, status
       FROM logs ${where} ORDER BY id DESC LIMIT ?`,
    )
    .all(...params);
  return rows.flatMap((row) => {
    const log = rowToLog(row);
    return log ? [log] : [];
  });
}

export function getLogs(c: Context<AppBindings>): Response {
  const query = logsQuerySchema.parse(c.req.query());
  const logs = queryLogRecords(c.get("db"), query);
  return c.json({ ok: true, data: { logs } });
}

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportLogsCsv(c: Context<AppBindings>): Response {
  const query = logsQuerySchema.parse({ ...c.req.query(), limit: c.req.query("limit") ?? "500" });
  const logs = queryLogRecords(c.get("db"), query);
  const header = ["ts", "source", "token_prefix", "target", "bytes", "duration_ms", "status"];
  const rows = logs.map((log) =>
    [log.ts, log.source, log.tokenPrefix, log.target, log.bytes, log.durationMs, log.status].map(csvCell).join(","),
  );
  return new Response([header.join(","), ...rows, ""].join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=\"axion-logs.csv\"",
    },
  });
}

