import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { idParamSchema, routeCreateSchema, routeUpdateSchema } from "../contracts.js";
import type { DbClient } from "../db/client.js";
import type { AppBindings } from "../app.js";
import { recordLog } from "./logs.js";

export type RouteRecord = {
  id: number;
  alias: string;
  upstream: string;
  enabled: boolean;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
};

function rowToRoute(row: unknown): RouteRecord | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") {
    return null;
  }
  return {
    id: value.id,
    alias: String(value.alias ?? ""),
    upstream: String(value.upstream ?? ""),
    enabled: Boolean(value.enabled),
    latencyMs: value.latencyMs === null || value.latencyMs === undefined ? null : Number(value.latencyMs),
    lastCheckedAt: value.lastCheckedAt === null || value.lastCheckedAt === undefined ? null : String(value.lastCheckedAt),
    createdAt: String(value.createdAt ?? ""),
  };
}

export function getRouteRecord(db: DbClient, id: number): RouteRecord {
  const row = db.sqlite
    .prepare(
      `SELECT id, alias, upstream, enabled, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt, created_at AS createdAt
       FROM routes WHERE id = ?`,
    )
    .get(id);
  const route = rowToRoute(row);
  if (!route) {
    throw new HTTPException(404, { message: "Route not found" });
  }
  return route;
}

export function getRouteByAlias(db: DbClient, alias: string): RouteRecord {
  const row = db.sqlite
    .prepare(
      `SELECT id, alias, upstream, enabled, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt, created_at AS createdAt
       FROM routes WHERE alias = ?`,
    )
    .get(alias);
  const route = rowToRoute(row);
  if (!route) {
    throw new HTTPException(404, { message: "Route alias not found" });
  }
  return route;
}

export function listRoutes(c: Context<AppBindings>): Response {
  const rows = c
    .get("db")
    .sqlite.prepare(
      `SELECT id, alias, upstream, enabled, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt, created_at AS createdAt
       FROM routes ORDER BY id DESC`,
    )
    .all();
  const routes = rows.flatMap((row) => {
    const route = rowToRoute(row);
    return route ? [route] : [];
  });
  return c.json({ ok: true, data: { routes } });
}

export async function createRoute(c: Context<AppBindings>): Promise<Response> {
  const input = routeCreateSchema.parse(await c.req.json());
  const now = new Date().toISOString();
  const result = c
    .get("db")
    .sqlite.prepare("INSERT INTO routes (alias, upstream, enabled, created_at) VALUES (?, ?, ?, ?)")
    .run(input.alias, input.upstream, input.enabled ? 1 : 0, now);
  const route = getRouteRecord(c.get("db"), Number(result.lastInsertRowid));
  return c.json({ ok: true, data: { route } }, 201);
}

export async function updateRoute(c: Context<AppBindings>): Promise<Response> {
  const { id } = idParamSchema.parse(c.req.param());
  const input = routeUpdateSchema.parse(await c.req.json());
  const current = getRouteRecord(c.get("db"), id);
  const next = {
    alias: input.alias ?? current.alias,
    upstream: input.upstream ?? current.upstream,
    enabled: input.enabled ?? current.enabled,
  };
  c.get("db").sqlite.prepare("UPDATE routes SET alias = ?, upstream = ?, enabled = ? WHERE id = ?").run(
    next.alias,
    next.upstream,
    next.enabled ? 1 : 0,
    id,
  );
  return c.json({ ok: true, data: { route: getRouteRecord(c.get("db"), id) } });
}

export function deleteRoute(c: Context<AppBindings>): Response {
  const { id } = idParamSchema.parse(c.req.param());
  getRouteRecord(c.get("db"), id);
  c.get("db").sqlite.prepare("DELETE FROM routes WHERE id = ?").run(id);
  return c.json({ ok: true, data: { deleted: true } });
}

export async function probeRoute(c: Context<AppBindings>): Promise<Response> {
  const { id } = idParamSchema.parse(c.req.param());
  const route = getRouteRecord(c.get("db"), id);
  await probeRouteLatency(c.get("db"), route);
  return c.json({ ok: true, data: { route: getRouteRecord(c.get("db"), id) } });
}
export function routeLatency(c: Context<AppBindings>): Response {
  const { id } = idParamSchema.parse(c.req.param());
  const route = getRouteRecord(c.get("db"), id);
  return c.json({ ok: true, data: { routeId: route.id, latency: [{ ms: route.latencyMs, checkedAt: route.lastCheckedAt }] } });
}

function joinTarget(upstream: string, rest: string, search: string): string {
  const url = new URL(upstream);
  const basePath = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
  const restPath = rest ? `/${rest.replace(/^\/+/, "")}` : "";
  url.pathname = `${basePath}${restPath}` || "/";
  url.search = search;
  return url.toString();
}

function relayHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  headers.delete("host");
  headers.delete("cookie");
  headers.delete("content-length");
  return headers;
}

function responseHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  return headers;
}

export async function relayRoute(c: Context<AppBindings>): Promise<Response> {
  const alias = c.req.param("alias");
  if (!alias) {
    throw new HTTPException(404, { message: "Route alias not found" });
  }
  const requestUrl = new URL(c.req.url);
  const prefix = `/api/r/${alias}`;
  const rest = requestUrl.pathname.startsWith(prefix) ? decodeURIComponent(requestUrl.pathname.slice(prefix.length).replace(/^\//, "")) : "";
  const route = getRouteByAlias(c.get("db"), alias);
  if (!route.enabled) {
    throw new HTTPException(404, { message: "Route disabled" });
  }
  const target = joinTarget(route.upstream, rest, requestUrl.search);
  const started = performance.now();
  const method = c.req.method;
  const init: RequestInit = {
    method,
    headers: relayHeaders(c.req.raw.headers),
    redirect: "manual",
  };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await c.req.raw.arrayBuffer();
  }
  const upstreamResponse = await fetch(target, init);
  const buffer = await upstreamResponse.arrayBuffer();
  const bytes = buffer.byteLength;
  const durationMs = Math.max(0, Math.round(performance.now() - started));
  recordLog(c.get("db"), {
    tokenPrefix: null,
    source: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
    target,
    bytes,
    durationMs,
    status: upstreamResponse.status,
  });
  return new Response(buffer, {
    status: upstreamResponse.status,
    headers: responseHeaders(upstreamResponse.headers),
  });
}

export async function probeRouteLatency(db: DbClient, route: RouteRecord): Promise<void> {
  if (!route.enabled) {
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const started = performance.now();
  try {
    await fetch(route.upstream, { method: "HEAD", signal: controller.signal });
    const latencyMs = Math.max(0, Math.round(performance.now() - started));
    db.sqlite
      .prepare("UPDATE routes SET latency_ms = ?, last_checked_at = ? WHERE id = ?")
      .run(latencyMs, new Date().toISOString(), route.id);
  } catch (error) {
    console.warn("Route latency probe failed", error);
    db.sqlite.prepare("UPDATE routes SET latency_ms = NULL, last_checked_at = ? WHERE id = ?").run(new Date().toISOString(), route.id);
  } finally {
    clearTimeout(timeout);
  }
}

export async function probeAllRoutes(db: DbClient): Promise<void> {
  const rows = db.sqlite
    .prepare(
      `SELECT id, alias, upstream, enabled, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt, created_at AS createdAt
       FROM routes WHERE enabled = 1`,
    )
    .all();
  for (const row of rows) {
    const route = rowToRoute(row);
    if (route) {
      await probeRouteLatency(db, route);
    }
  }
}

export function startLatencyProbe(db: DbClient): NodeJS.Timeout {
  void probeAllRoutes(db);
  const timer = setInterval(() => {
    void probeAllRoutes(db);
  }, 60_000);
  timer.unref();
  return timer;
}






