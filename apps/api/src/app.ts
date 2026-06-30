import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { DbClient } from "./db/client.js";
import { openDb } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { authRoutes } from "./routes/auth.js";
import { routeRoutes } from "./routes/routes.js";
import { subRoutes } from "./routes/subs.js";
import { tokenRoutes } from "./routes/tokens.js";
import { relayRoute } from "./services/routes.js";
import { renderPublicSubscription } from "./services/subscriptions.js";
import type { PublicAdmin } from "./services/auth.js";

export type AppBindings = {
  Variables: {
    db: DbClient;
    admin: PublicAdmin;
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
  app.route("/api/subs", subRoutes);
  app.route("/api/tokens", tokenRoutes);
  app.route("/api/routes", routeRoutes);
  app.all("/api/r/:alias/*", relayRoute);
  app.get("/v1/sub", renderPublicSubscription);

  app.get("/api/health", (c) =>
    c.json({
      ok: true,
      data: {
        status: "ok",
        service: "axion-api",
      },
    }),
  );

  app.onError((error, c) => {
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
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Axion internal fault" } },
      500,
    );
  });

  app.notFound((c) => c.json({ ok: false, error: { code: "NOT_FOUND", message: "No such plate" } }, 404));

  return app;
}
