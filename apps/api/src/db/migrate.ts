import type { DbClient } from "./client.js";

const statements = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    raw_sources TEXT NOT NULL,
    target TEXT NOT NULL,
    rule_set TEXT NOT NULL,
    rename_prefix TEXT NOT NULL DEFAULT '',
    filter_regex TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    hash TEXT NOT NULL,
    prefix TEXT NOT NULL,
    sub_id INTEGER NOT NULL REFERENCES subs(id) ON DELETE CASCADE,
    quota_bytes INTEGER,
    used_bytes INTEGER NOT NULL DEFAULT 0,
    ip_allow TEXT,
    expires_at TEXT,
    revoked_at TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT NOT NULL UNIQUE,
    upstream TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    latency_ms INTEGER,
    last_checked_at TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    token_prefix TEXT,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    bytes INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    status INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tokens_prefix ON tokens(prefix)`,
  `CREATE INDEX IF NOT EXISTS idx_tokens_sub ON tokens(sub_id)`,
  `CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(ts)`,
  `CREATE INDEX IF NOT EXISTS idx_logs_token ON logs(token_prefix)`,
  `CREATE INDEX IF NOT EXISTS idx_routes_alias ON routes(alias)`,
];

const settingDefaults = [
  ["instanceName", "Mexion"],
  ["theme", "light"],
  ["lang", "zh"],
] as const;

export function migrate(db: DbClient): void {
  const run = db.sqlite.transaction(() => {
    for (const statement of statements) {
      db.sqlite.prepare(statement).run();
    }
    const now = new Date().toISOString();
    const insert = db.sqlite.prepare("INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)");
    for (const [key, value] of settingDefaults) {
      insert.run(key, value, now);
    }
  });
  run();
}
