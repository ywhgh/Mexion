import type { DbClient } from "../db/client.js";

export type AuditLogRecord = {
  id: number;
  ts: string;
  adminId: number;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown | null;
  after: unknown | null;
  ip: string | null;
  note: string | null;
};

export type RecordAuditLogInput = {
  adminId: number;
  action: string;
  targetType: string;
  targetId: string | number;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  note?: string | null;
};

export type ListAuditLogsOptions = {
  limit?: number | undefined;
  action?: string | null | undefined;
};

function serialize(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function parseJson(value: unknown): unknown | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return JSON.parse(String(value)) as unknown;
  } catch {
    return String(value);
  }
}

function rowToAuditLog(row: unknown): AuditLogRecord | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") return null;
  return {
    id: value.id,
    ts: String(value.ts ?? ""),
    adminId: Number(value.adminId ?? value.admin_id ?? 0),
    action: String(value.action ?? ""),
    targetType: String(value.targetType ?? value.target_type ?? ""),
    targetId: String(value.targetId ?? value.target_id ?? ""),
    before: parseJson(value.before),
    after: parseJson(value.after),
    ip: value.ip === null || value.ip === undefined ? null : String(value.ip),
    note: value.note === null || value.note === undefined ? null : String(value.note),
  };
}

export function recordAuditLog(db: DbClient, input: RecordAuditLogInput): void {
  db.sqlite
    .prepare(
      `INSERT INTO audit_logs (ts, admin_id, action, target_type, target_id, "before", "after", ip, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      new Date().toISOString(),
      input.adminId,
      input.action,
      input.targetType,
      String(input.targetId),
      serialize(input.before),
      serialize(input.after),
      input.ip ?? null,
      input.note ?? null,
    );
}

export function listAuditLogs(db: DbClient, options: ListAuditLogsOptions = {}): AuditLogRecord[] {
  const limit = Math.min(100, Math.max(1, Math.floor(options.limit ?? 50)));
  const params: Array<string | number> = [];
  let where = "";
  if (options.action) {
    where = "WHERE action = ?";
    params.push(options.action);
  }
  params.push(limit);
  const rows = db.sqlite
    .prepare(
      `SELECT id, ts, admin_id AS adminId, action, target_type AS targetType, target_id AS targetId,
        "before" AS before, "after" AS after, ip, note
       FROM audit_logs ${where}
       ORDER BY id DESC
       LIMIT ?`,
    )
    .all(...params);
  return rows.flatMap((row) => {
    const log = rowToAuditLog(row);
    return log ? [log] : [];
  });
}
