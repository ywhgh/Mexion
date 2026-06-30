import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { DbClient } from "./db/client.js";
import { openDb } from "./db/client.js";
import { migrate } from "./db/migrate.js";

export type AppBindings = {
  Variables: {
    db: DbClient;
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
