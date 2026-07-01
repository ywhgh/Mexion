import type { Context } from "hono";
import type { AppBindings } from "../app.js";
import type { DbClient } from "../db/client.js";
import { queryLogRecords, type LogRecord } from "./logs.js";

export type HeatCell = { date: string; value: number };
export type StatPayload = {
  totals: {
    requests: number;
    subs: number;
    tokens: number;
    activeTokens: number;
    routes: number;
    enabledRoutes: number;
    avgLatencyMs: number;
  };
  heatmap: HeatCell[];
  sparks: {
    calls: number[];
    tokens: number[];
    latency: number[];
  };
  formats: Array<{ target: string; count: number; percent: number }>;
  liveLogs: LogRecord[];
};

function numberValue(row: unknown, key: string): number {
  if (!row || typeof row !== "object") return 0;
  const value = (row as Record<string, unknown>)[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function heatmap(db: DbClient): HeatCell[] {
  const rows = db.sqlite.prepare(
    `SELECT substr(ts, 1, 10) AS day, COUNT(*) AS value
     FROM logs
     WHERE ts >= datetime('now', '-91 days')
     GROUP BY day`,
  ).all() as Array<{ day: string; value: number }>;
  const map = new Map(rows.map((row) => [row.day, row.value]));
  return Array.from({ length: 91 }, (_, index) => {
    const date = isoDate(90 - index);
    return { date, value: map.get(date) ?? 0 };
  });
}

function sparkFromHeat(cells: HeatCell[], step: number): number[] {
  const result: number[] = [];
  for (let index = Math.max(0, cells.length - 28); index < cells.length; index += step) {
    result.push(cells.slice(index, index + step).reduce((sum, cell) => sum + cell.value, 0));
  }
  return result.length > 0 ? result : [0, 0];
}

function formatMix(db: DbClient): Array<{ target: string; count: number; percent: number }> {
  const rows = db.sqlite.prepare("SELECT target, COUNT(*) AS count FROM subs GROUP BY target ORDER BY count DESC").all() as Array<{
    target: string;
    count: number;
  }>;
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
  return rows.map((row) => ({ target: row.target, count: row.count, percent: Math.round((row.count / total) * 100) }));
}

export function collectStats(db: DbClient): StatPayload {
  const requests = numberValue(db.sqlite.prepare("SELECT COUNT(*) AS value FROM logs").get(), "value");
  const subs = numberValue(db.sqlite.prepare("SELECT COUNT(*) AS value FROM subs").get(), "value");
  const tokens = numberValue(db.sqlite.prepare("SELECT COUNT(*) AS value FROM tokens").get(), "value");
  const activeTokens = numberValue(db.sqlite.prepare("SELECT COUNT(*) AS value FROM tokens WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > datetime('now'))").get(), "value");
  const routes = numberValue(db.sqlite.prepare("SELECT COUNT(*) AS value FROM routes").get(), "value");
  const enabledRoutes = numberValue(db.sqlite.prepare("SELECT COUNT(*) AS value FROM routes WHERE enabled = 1").get(), "value");
  const avgLatencyMs = Math.round(numberValue(db.sqlite.prepare("SELECT COALESCE(AVG(duration_ms), 0) AS value FROM logs WHERE duration_ms > 0").get(), "value"));
  const cells = heatmap(db);
  return {
    totals: { requests, subs, tokens, activeTokens, routes, enabledRoutes, avgLatencyMs },
    heatmap: cells,
    sparks: {
      calls: sparkFromHeat(cells, 2),
      tokens: [0, activeTokens, tokens],
      latency: queryLogRecords(db, { limit: 14 }).map((log) => log.durationMs).reverse(),
    },
    formats: formatMix(db),
    liveLogs: queryLogRecords(db, { limit: 8 }),
  };
}

export function getStats(c: Context<AppBindings>): Response {
  return c.json({ ok: true, data: { stats: collectStats(c.get("db")) } });
}
