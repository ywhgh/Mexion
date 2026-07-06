import type { Context } from "hono";
import type { AppBindings } from "../app.js";
import type { DbClient } from "../db/client.js";
import { queryLogRecords, type LogRecord } from "./logs.js";

export type HeatCell = { date: string; value: number };
export type ChannelHealthItem = {
  channelId: number;
  name: string;
  provider: string;
  status: string;
  latencyMs: number | null;
  errorCount: number;
  requestsLast1h: number;
  errorsLast1h: number;
};
export type ProviderDistributionItem = {
  provider: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  totalCost: number;
};
export type ErrorRateTrendItem = {
  hour: string;
  totalRequests: number;
  errors: number;
  errorRate: number;
};
export type TtftPercentiles = { p50: number; p90: number; p99: number };
export type TopModelItem = {
  model: string;
  requestCount: number;
  totalCost: number;
  avgLatencyMs: number;
};
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
  channelHealth: ChannelHealthItem[];
  providerDistribution: ProviderDistributionItem[];
  errorRateTrend: ErrorRateTrendItem[];
  ttftPercentiles: TtftPercentiles;
  topModels: TopModelItem[];
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

function hourKey(date: Date): string {
  return date.toISOString().slice(0, 13);
}

function hourLabel(key: string): string {
  return `${key}:00`;
}

function recentHourWindow(hours: number): { keys: string[]; startIso: string } {
  const now = new Date();
  const currentHour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours());
  const start = currentHour - (hours - 1) * 3_600_000;
  const keys = Array.from({ length: hours }, (_item, index) => hourKey(new Date(start + index * 3_600_000)));
  return { keys, startIso: new Date(start).toISOString() };
}

function isUsageErrorSql(): string {
  return "status NOT IN ('ok', 'stream_estimated')";
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

function channelHealth(db: DbClient): ChannelHealthItem[] {
  const cutoff = new Date(Date.now() - 3_600_000).toISOString();
  return db.sqlite
    .prepare(
      `SELECT c.id AS channelId, c.name, c.provider, c.status, c.latency_ms AS latencyMs, c.error_count AS errorCount,
        COUNT(ue.id) AS requestsLast1h,
        COALESCE(SUM(CASE WHEN ue.status NOT IN ('ok', 'stream_estimated') THEN 1 ELSE 0 END), 0) AS errorsLast1h
       FROM channels c
       LEFT JOIN usage_events ue ON ue.channel_id = c.id AND ue.ts >= ?
       GROUP BY c.id
       ORDER BY c.status ASC, c.priority DESC, c.id ASC`,
    )
    .all(cutoff) as ChannelHealthItem[];
}

function providerDistribution(db: DbClient): ProviderDistributionItem[] {
  const cutoff = new Date(Date.now() - 24 * 3_600_000).toISOString();
  return db.sqlite
    .prepare(
      `SELECT COALESCE(provider, 'unknown') AS provider,
        COUNT(*) AS requestCount,
        COALESCE(SUM(CASE WHEN ${isUsageErrorSql()} THEN 1 ELSE 0 END), 0) AS errorCount,
        COALESCE(AVG(NULLIF(duration_ms, 0)), 0) AS avgLatencyMs,
        COALESCE(SUM(cost), 0) AS totalCost
       FROM usage_events
       WHERE ts >= ?
       GROUP BY COALESCE(provider, 'unknown')
       ORDER BY requestCount DESC, provider ASC`,
    )
    .all(cutoff)
    .map((row) => {
      const item = row as ProviderDistributionItem;
      return { ...item, avgLatencyMs: Math.round(Number(item.avgLatencyMs ?? 0)) };
    });
}

function errorRateTrend(db: DbClient): ErrorRateTrendItem[] {
  const range = recentHourWindow(24);
  const rows = db.sqlite
    .prepare(
      `SELECT substr(ts, 1, 13) AS hour,
        COUNT(*) AS totalRequests,
        COALESCE(SUM(CASE WHEN ${isUsageErrorSql()} THEN 1 ELSE 0 END), 0) AS errors
       FROM usage_events
       WHERE ts >= ?
       GROUP BY substr(ts, 1, 13)
       ORDER BY hour ASC`,
    )
    .all(range.startIso) as Array<{ hour: string; totalRequests: number; errors: number }>;
  const byHour = new Map(rows.map((row) => [row.hour, row]));
  return range.keys.map((key) => {
    const row = byHour.get(key);
    const totalRequests = Number(row?.totalRequests ?? 0);
    const errors = Number(row?.errors ?? 0);
    return {
      hour: hourLabel(key),
      totalRequests,
      errors,
      errorRate: totalRequests > 0 ? Math.round((errors / totalRequests) * 10000) / 100 : 0,
    };
  });
}

function ttftPercentiles(db: DbClient): TtftPercentiles {
  const values = db.sqlite
    .prepare("SELECT ttft_ms AS ttftMs FROM usage_events WHERE ttft_ms IS NOT NULL ORDER BY ts DESC LIMIT 1000")
    .all()
    .map((row) => numberValue(row, "ttftMs"))
    .filter((value) => value > 0);
  return {
    p50: percentile(values, 50),
    p90: percentile(values, 90),
    p99: percentile(values, 99),
  };
}

function topModels(db: DbClient): TopModelItem[] {
  const cutoff = new Date(Date.now() - 24 * 3_600_000).toISOString();
  return db.sqlite
    .prepare(
      `SELECT COALESCE(model, 'unknown') AS model,
        COUNT(*) AS requestCount,
        COALESCE(SUM(cost), 0) AS totalCost,
        COALESCE(AVG(NULLIF(duration_ms, 0)), 0) AS avgLatencyMs
       FROM usage_events
       WHERE ts >= ?
       GROUP BY COALESCE(model, 'unknown')
       ORDER BY requestCount DESC, totalCost DESC
       LIMIT 10`,
    )
    .all(cutoff)
    .map((row) => {
      const item = row as TopModelItem;
      return { ...item, avgLatencyMs: Math.round(Number(item.avgLatencyMs ?? 0)) };
    });
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
    channelHealth: channelHealth(db),
    providerDistribution: providerDistribution(db),
    errorRateTrend: errorRateTrend(db),
    ttftPercentiles: ttftPercentiles(db),
    topModels: topModels(db),
  };
}

export function getStats(c: Context<AppBindings>): Response {
  return c.json({ ok: true, data: { stats: collectStats(c.get("db")) } });
}
