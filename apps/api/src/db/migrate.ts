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
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    balance INTEGER NOT NULL DEFAULT 0,
    quota_limit INTEGER NOT NULL DEFAULT 0,
    quota_used INTEGER NOT NULL DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    checkin_streak INTEGER NOT NULL DEFAULT 0,
    last_checkin_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    rate_multiplier INTEGER NOT NULL DEFAULT 100,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    hash TEXT NOT NULL,
    prefix TEXT NOT NULL,
    group_id INTEGER REFERENCES groups(id),
    quota_limit INTEGER,
    quota_used INTEGER NOT NULL DEFAULT 0,
    model_allow TEXT,
    ip_allow TEXT,
    expires_at TEXT,
    revoked_at TEXT,
    last_used_at TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    base_url TEXT NOT NULL,
    model_list TEXT,
    group_id INTEGER REFERENCES groups(id),
    priority INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    latency_ms INTEGER,
    last_checked_at TEXT,
    error_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS channel_secrets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    secret_type TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    rotated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS model_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_model TEXT NOT NULL,
    target_model TEXT NOT NULL,
    channel_id INTEGER REFERENCES channels(id),
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS usage_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    request_id TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    key_prefix TEXT,
    channel_id INTEGER REFERENCES channels(id),
    model TEXT,
    provider TEXT,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    ttft_ms INTEGER,
    cost INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_code TEXT,
    body_hash TEXT,
    body_length INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS billing_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    key_id INTEGER REFERENCES user_api_keys(id),
    pre_charge INTEGER NOT NULL DEFAULT 0,
    settled INTEGER NOT NULL DEFAULT 0,
    refunded INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    settled_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quota INTEGER NOT NULL,
    price INTEGER NOT NULL,
    period_days INTEGER NOT NULL DEFAULT 30,
    features TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    quota_total INTEGER NOT NULL,
    quota_used INTEGER NOT NULL DEFAULT 0,
    starts_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    request_id TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    key_prefix TEXT,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    model TEXT,
    provider TEXT,
    group_id INTEGER REFERENCES groups(id),
    channel_id INTEGER REFERENCES channels(id),
    status INTEGER NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    duration_ms INTEGER,
    ttft_ms INTEGER,
    cost INTEGER,
    error_code TEXT,
    body_hash TEXT,
    body_length INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
  `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)`,
  `CREATE INDEX IF NOT EXISTS idx_user_keys_prefix ON user_api_keys(prefix)`,
  `CREATE INDEX IF NOT EXISTS idx_user_keys_user ON user_api_keys(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_channels_group_status ON channels(group_id, status, priority)`,
  `CREATE INDEX IF NOT EXISTS idx_model_aliases_source ON model_aliases(source_model)`,
  `CREATE INDEX IF NOT EXISTS idx_usage_events_user_ts ON usage_events(user_id, ts)`,
  `CREATE INDEX IF NOT EXISTS idx_request_logs_user_ts ON request_logs(user_id, ts)`,
  `CREATE INDEX IF NOT EXISTS idx_billing_sessions_request ON billing_sessions(request_id)`,
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
    db.sqlite
      .prepare("INSERT OR IGNORE INTO groups (name, description, rate_multiplier, is_default, created_at) VALUES (?, ?, ?, ?, ?)")
      .run("default", "Default relay group", 100, 1, now);
    db.sqlite
      .prepare("INSERT OR IGNORE INTO subscription_plans (id, name, description, quota, price, period_days, features, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(1, "免费体验", "Demo free trial quota", 100000, 0, 30, JSON.stringify(["100k quota", "30 days"]), 1, now);
  });
  run();
}

