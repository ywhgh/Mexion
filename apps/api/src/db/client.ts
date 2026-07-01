import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema.js";

export type DbClient = {
  sqlite: Database.Database;
  orm: ReturnType<typeof drizzle<typeof schema>>;
};

export function defaultDbPath(): string {
  return process.env.MEXION_DB_PATH ?? path.resolve(process.cwd(), "data", "mexion.db");
}

export function openDb(dbPath = defaultDbPath()): DbClient {
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return { sqlite, orm: drizzle(sqlite, { schema }) };
}
