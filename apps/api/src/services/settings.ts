import type { Context } from "hono";
import { settingsPatchSchema } from "../contracts.js";
import type { SettingsPatchInput } from "../contracts.js";
import type { AppBindings } from "../app.js";
import type { DbClient } from "../db/client.js";

export type SettingsPublic = {
  instanceName: string;
  theme: "light" | "dark";
  lang: "zh" | "en";
  updatedAt: string;
};

const defaults: SettingsPublic = {
  instanceName: "Mexion",
  theme: "light",
  lang: "zh",
  updatedAt: new Date(0).toISOString(),
};

function isTheme(value: string): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

function isLang(value: string): value is "zh" | "en" {
  return value === "zh" || value === "en";
}

export function readSettings(db: DbClient): SettingsPublic {
  const rows = db.sqlite.prepare("SELECT key, value, updated_at AS updatedAt FROM settings").all() as Array<{
    key: string;
    value: string;
    updatedAt: string;
  }>;
  const next = { ...defaults };
  for (const row of rows) {
    if (row.key === "instanceName") {
      next.instanceName = row.value;
      next.updatedAt = row.updatedAt;
    }
    if (row.key === "theme" && isTheme(row.value)) {
      next.theme = row.value;
      next.updatedAt = row.updatedAt;
    }
    if (row.key === "lang" && isLang(row.value)) {
      next.lang = row.value;
      next.updatedAt = row.updatedAt;
    }
  }
  return next;
}

export function writeSettings(db: DbClient, input: SettingsPatchInput): SettingsPublic {
  const now = new Date().toISOString();
  const upsert = db.sqlite.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  );
  const run = db.sqlite.transaction(() => {
    if (input.instanceName !== undefined) upsert.run("instanceName", input.instanceName, now);
    if (input.theme !== undefined) upsert.run("theme", input.theme, now);
    if (input.lang !== undefined) upsert.run("lang", input.lang, now);
  });
  run();
  return readSettings(db);
}

export function getSettings(c: Context<AppBindings>): Response {
  return c.json({ ok: true, data: { settings: readSettings(c.get("db")) } });
}

export async function patchSettings(c: Context<AppBindings>): Promise<Response> {
  const input = settingsPatchSchema.parse(await c.req.json());
  return c.json({ ok: true, data: { settings: writeSettings(c.get("db"), input) } });
}
