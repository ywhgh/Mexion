import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { DbClient } from "./db/client.js";
import { openDb } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { billingRoutes } from "./routes/billing.js";
import { gatewayRoutes } from "./routes/gateway.js";
import { logRoutes } from "./routes/logs.js";
import { publicRoutes } from "./routes/public.js";
import { settingsRoutes } from "./routes/settings.js";
import { statsRoutes } from "./routes/stats.js";
import { statusRoutes } from "./routes/status.js";
import { routeRoutes } from "./routes/routes.js";
import { subRoutes } from "./routes/subs.js";
import { tokenRoutes } from "./routes/tokens.js";
import { userRoutes } from "./routes/user.js";
import { userKeyRoutes } from "./routes/user-keys.js";
import type { PublicAdmin } from "./services/auth.js";
import type { UserPublic } from "./services/users.js";
import type { UserKeyRecord } from "./services/user-keys.js";
import { HTTPTimeoutError, SsrfBlockedError } from "./lib/safe-http.js";


function webDistAbsolute(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../web/dist");
}

function webDistRoot(): string {
  const relative = path.relative(process.cwd(), webDistAbsolute()).replace(/\\/g, "/");
  return relative || ".";
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api") || pathname.startsWith("/v1");
}
export type AppBindings = {
  Variables: {
    db: DbClient;
    admin: PublicAdmin;
    user: UserPublic;
    gatewayUser: UserPublic;
    gatewayKey: UserKeyRecord | null;
  };
};

export type CreateAppOptions = {
  dbPath?: string;
  db?: DbClient;
};

export function createApp(options: CreateAppOptions = {}): Hono<AppBindings> {
  const db = options.db ?? openDb(options.dbPath);
  migrate(db);

  const app = new Hono<AppBindings>();

  app.use("*", async (c, next) => {
    c.set("db", db);
    await next();
  });

  app.route("/api/auth", authRoutes);
  app.route("/api/admin", adminRoutes);
  app.route("/api/status", statusRoutes);
  app.route("/api", billingRoutes);
  app.route("/api/user/keys", userKeyRoutes);
  app.route("/api/user", userRoutes);
  app.route("/api/subs", subRoutes);
  app.route("/api/tokens", tokenRoutes);
  app.route("/api/routes", routeRoutes);
  app.route("/api/logs", logRoutes);
  app.route("/api/stats", statsRoutes);
  app.route("/api/settings", settingsRoutes);
  app.route("/", publicRoutes);
  app.route("/", gatewayRoutes);

  app.get("/api/health", (c) =>
    c.json({
      ok: true,
      data: {
        status: "ok",
        service: "mexion-api",
      },
    }),
  );

  if (fs.existsSync(webDistAbsolute())) {
    const root = webDistRoot();
    const staticAssets = serveStatic<AppBindings>({ root });
    const staticIndex = serveStatic<AppBindings>({ root, path: "index.html" });
    app.use("/*", async (c, next) => {
      if (isApiPath(c.req.path)) {
        await next();
        return;
      }
      return staticAssets(c, next);
    });
    app.get("*", async (c, next) => {
      if (isApiPath(c.req.path)) {
        await next();
        return;
      }
      return staticIndex(c, next);
    });
  }

  app.onError((error, c) => {
    if (error instanceof SsrfBlockedError) {
      return c.json({ ok: false, error: { code: "SSRF_BLOCKED", message: "SSRF Blocked" } }, 400);
    }
    if (error instanceof HTTPTimeoutError) {
      return c.json({ ok: false, error: { code: "UPSTREAM_TIMEOUT", message: "Upstream request timed out" } }, 504);
    }
    if (error instanceof ZodError) {
      return c.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Invalid input" } },
        400,
      );
    }
    if (error instanceof HTTPException) {
      return c.json(
        { ok: false, error: { code: `HTTP_${error.status}`, message: error.message } },
        error.status,
      );
    }
    console.error(error);
    return c.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Mexion internal fault" } },
      500,
    );
  });

  app.notFound((c) => c.json({ ok: false, error: { code: "NOT_FOUND", message: "No such plate" } }, 404));

  return app;
}









