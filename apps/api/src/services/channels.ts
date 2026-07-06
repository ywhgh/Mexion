import net from "node:net";
import { HTTPException } from "hono/http-exception";
import type { DbClient } from "../db/client.js";
import { decryptSecret, encryptSecret } from "../lib/crypto.js";
import { isBlockedIp, validateSafeUrlFormat } from "../lib/safe-http.js";

export type Provider = "openai" | "anthropic" | "gemini" | "azure" | "custom";
export type ChannelStatus = "active" | "disabled" | "error";

export type GroupRecord = {
  id: number;
  name: string;
  description: string;
  rateMultiplier: number;
  isDefault: boolean;
  createdAt: string;
};

export type ChannelRecord = {
  id: number;
  name: string;
  provider: Provider;
  baseUrl: string;
  modelList: string[] | null;
  groupId: number | null;
  priority: number;
  status: ChannelStatus;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  errorCount: number;
  createdAt: string;
};

export type ModelAliasRecord = {
  id: number;
  sourceModel: string;
  targetModel: string;
  channelId: number | null;
  enabled: boolean;
  createdAt: string;
};

export type CreateGroupInput = { name: string; description?: string | undefined; rateMultiplier?: number | undefined };
export type UpdateGroupInput = { name?: string | undefined; description?: string | undefined; rateMultiplier?: number | undefined; isDefault?: boolean | undefined };
export type CreateChannelInput = {
  name: string;
  provider: Provider;
  baseUrl: string;
  secretValue: string;
  modelList?: string[] | null | undefined;
  groupId?: number | null | undefined;
  priority?: number | undefined;
};
export type UpdateChannelInput = {
  name?: string | undefined;
  provider?: Provider | undefined;
  baseUrl?: string | undefined;
  secretValue?: string | undefined;
  modelList?: string[] | null | undefined;
  groupId?: number | null | undefined;
  priority?: number | undefined;
  status?: ChannelStatus | undefined;
};
export type CreateModelAliasInput = { sourceModel: string; targetModel: string; channelId?: number | null | undefined };
export type UpdateModelAliasInput = { enabled?: boolean | undefined; targetModel?: string | undefined };

function parseProvider(value: unknown): Provider {
  if (value === "anthropic" || value === "gemini" || value === "azure" || value === "custom") return value;
  return "openai";
}

function parseStatus(value: unknown): ChannelStatus {
  if (value === "disabled" || value === "error") return value;
  return "active";
}

function parseModelList(value: unknown): string[] | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    const parsed = JSON.parse(String(value)) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return null;
  }
}

export function rowToGroup(row: unknown): GroupRecord | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") return null;
  return {
    id: value.id,
    name: String(value.name ?? ""),
    description: String(value.description ?? ""),
    rateMultiplier: Number(value.rateMultiplier ?? 100),
    isDefault: Boolean(value.isDefault),
    createdAt: String(value.createdAt ?? ""),
  };
}

export function rowToChannel(row: unknown): ChannelRecord | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") return null;
  return {
    id: value.id,
    name: String(value.name ?? ""),
    provider: parseProvider(value.provider),
    baseUrl: String(value.baseUrl ?? ""),
    modelList: parseModelList(value.modelList),
    groupId: value.groupId === null || value.groupId === undefined ? null : Number(value.groupId),
    priority: Number(value.priority ?? 0),
    status: parseStatus(value.status),
    latencyMs: value.latencyMs === null || value.latencyMs === undefined ? null : Number(value.latencyMs),
    lastCheckedAt: value.lastCheckedAt === null || value.lastCheckedAt === undefined ? null : String(value.lastCheckedAt),
    errorCount: Number(value.errorCount ?? 0),
    createdAt: String(value.createdAt ?? ""),
  };
}

export function rowToModelAlias(row: unknown): ModelAliasRecord | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "number") return null;
  return {
    id: value.id,
    sourceModel: String(value.sourceModel ?? ""),
    targetModel: String(value.targetModel ?? ""),
    channelId: value.channelId === null || value.channelId === undefined ? null : Number(value.channelId),
    enabled: Boolean(value.enabled),
    createdAt: String(value.createdAt ?? ""),
  };
}

export function validateChannelBaseUrl(baseUrl: string): string {
  const parsed = validateSafeUrlFormat(baseUrl.trim());
  if (net.isIP(parsed.hostname) !== 0 && isBlockedIp(parsed.hostname)) throw new HTTPException(400, { message: "Channel base URL is not allowed" });
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function getGroup(db: DbClient, id: number): GroupRecord {
  const row = db.sqlite
    .prepare("SELECT id, name, description, rate_multiplier AS rateMultiplier, is_default AS isDefault, created_at AS createdAt FROM groups WHERE id = ?")
    .get(id);
  const group = rowToGroup(row);
  if (!group) throw new HTTPException(404, { message: "Group not found" });
  return group;
}

export function createGroup(db: DbClient, input: CreateGroupInput): GroupRecord {
  const name = input.name.trim();
  if (!name) throw new HTTPException(400, { message: "Group name required" });
  const now = new Date().toISOString();
  const result = db.sqlite
    .prepare("INSERT INTO groups (name, description, rate_multiplier, is_default, created_at) VALUES (?, ?, ?, 0, ?)")
    .run(name, input.description ?? "", input.rateMultiplier ?? 100, now);
  return getGroup(db, Number(result.lastInsertRowid));
}

export function listGroups(db: DbClient): GroupRecord[] {
  const rows = db.sqlite
    .prepare("SELECT id, name, description, rate_multiplier AS rateMultiplier, is_default AS isDefault, created_at AS createdAt FROM groups ORDER BY is_default DESC, id ASC")
    .all();
  return rows.flatMap((row) => {
    const group = rowToGroup(row);
    return group ? [group] : [];
  });
}

export function updateGroup(db: DbClient, id: number, input: UpdateGroupInput): GroupRecord {
  const current = getGroup(db, id);
  const next = {
    name: input.name === undefined ? current.name : input.name.trim(),
    description: input.description === undefined ? current.description : input.description,
    rateMultiplier: input.rateMultiplier === undefined ? current.rateMultiplier : input.rateMultiplier,
    isDefault: input.isDefault === undefined ? current.isDefault : input.isDefault,
  };
  if (!next.name) throw new HTTPException(400, { message: "Group name required" });
  db.sqlite.prepare("UPDATE groups SET name = ?, description = ?, rate_multiplier = ?, is_default = ? WHERE id = ?").run(
    next.name,
    next.description,
    next.rateMultiplier,
    next.isDefault ? 1 : 0,
    id,
  );
  return getGroup(db, id);
}

export function deleteGroup(db: DbClient, id: number): void {
  const group = getGroup(db, id);
  if (group.isDefault) throw new HTTPException(400, { message: "Default group cannot be deleted" });
  db.sqlite.prepare("UPDATE channels SET group_id = NULL WHERE group_id = ?").run(id);
  db.sqlite.prepare("UPDATE user_api_keys SET group_id = NULL WHERE group_id = ?").run(id);
  db.sqlite.prepare("DELETE FROM groups WHERE id = ?").run(id);
}

function getChannel(db: DbClient, id: number): ChannelRecord {
  const row = db.sqlite
    .prepare(
      `SELECT id, name, provider, base_url AS baseUrl, model_list AS modelList, group_id AS groupId,
        priority, status, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt,
        error_count AS errorCount, created_at AS createdAt FROM channels WHERE id = ?`,
    )
    .get(id);
  const channel = rowToChannel(row);
  if (!channel) throw new HTTPException(404, { message: "Channel not found" });
  return channel;
}

export function getChannelById(db: DbClient, id: number): ChannelRecord {
  return getChannel(db, id);
}

function assertGroupExists(db: DbClient, groupId: number | null | undefined): void {
  if (groupId === null || groupId === undefined) return;
  getGroup(db, groupId);
}

export function createChannel(db: DbClient, input: CreateChannelInput): ChannelRecord {
  const name = input.name.trim();
  if (!name) throw new HTTPException(400, { message: "Channel name required" });
  if (!input.secretValue.trim()) throw new HTTPException(400, { message: "Channel secret required" });
  const baseUrl = validateChannelBaseUrl(input.baseUrl);
  assertGroupExists(db, input.groupId);
  const now = new Date().toISOString();
  const tx = db.sqlite.transaction(() => {
    const result = db.sqlite
      .prepare(
        `INSERT INTO channels (name, provider, base_url, model_list, group_id, priority, status, error_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', 0, ?)`,
      )
      .run(name, input.provider, baseUrl, input.modelList ? JSON.stringify(input.modelList) : null, input.groupId ?? null, input.priority ?? 0, now);
    const channelId = Number(result.lastInsertRowid);
    db.sqlite
      .prepare("INSERT INTO channel_secrets (channel_id, secret_type, encrypted_value, key_version, created_at) VALUES (?, 'api_key', ?, 1, ?)")
      .run(channelId, encryptSecret(input.secretValue), now);
    return channelId;
  });
  return getChannel(db, tx());
}

export function listChannels(db: DbClient): ChannelRecord[] {
  const rows = db.sqlite
    .prepare(
      `SELECT id, name, provider, base_url AS baseUrl, model_list AS modelList, group_id AS groupId,
        priority, status, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt,
        error_count AS errorCount, created_at AS createdAt FROM channels ORDER BY priority DESC, id ASC`,
    )
    .all();
  return rows.flatMap((row) => {
    const channel = rowToChannel(row);
    return channel ? [channel] : [];
  });
}



export type FetchModelsInput = {
  baseUrl: string;
  apiKey: string;
  provider?: 'openai' | 'anthropic' | 'gemini' | 'azure' | 'custom' | undefined;
};

export type FetchModelsResult = {
  provider: string;
  baseUrl: string;
  endpoint: string;
  models: string[];
  rawCount: number;
};

function joinUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/$/, '');
  const trimmedPath = path.replace(/^\//, '');
  return trimmedBase + '/' + trimmedPath;
}

function trimModelId(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function uniqSorted(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  out.sort();
  return out;
}

export async function fetchUpstreamModels(_db: DbClient, input: FetchModelsInput): Promise<FetchModelsResult> {
  const provider = input.provider ?? 'openai';
  const endpoint = provider === 'anthropic'
    ? joinUrl(input.baseUrl, 'v1/models')
    : provider === 'gemini'
      ? joinUrl(input.baseUrl, 'v1beta/models')
      : provider === 'azure'
        ? joinUrl(input.baseUrl, 'openai/deployments')
        : joinUrl(input.baseUrl, 'v1/models');
  const { safeFetch } = await import('../lib/safe-http.js');
  const headers: Record<string, string> = { Accept: 'application/json' };
  const apiKey = input.apiKey ?? '';
  if (provider === 'anthropic') {
    if (apiKey) headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else if (provider === 'gemini') {
    if (apiKey) headers['x-goog-api-key'] = apiKey;
  } else {
    if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
  }
  const response = await safeFetch(endpoint, {
    method: 'GET',
    headers,
    timeoutMs: 15_000,
    firstByteTimeoutMs: 10_000,
  });
  const text = await response.text();
  let rawList: string[] = [];
  try {
    const json = JSON.parse(text);
    if (provider === 'gemini') {
      if (Array.isArray(json?.models)) {
        rawList = json.models.map(function (m: { name?: string; id?: string }) { return trimModelId(m.name || m.id); }).filter(Boolean);
        rawList = rawList.map(function (name) { return name.replace(/^models\//, ''); });
      }
    } else if (provider === 'azure') {
      if (Array.isArray(json?.value)) rawList = json.value.map(function (m: { id?: string; name?: string }) { return trimModelId(m.id || m.name); });
      else if (Array.isArray(json?.data)) rawList = json.data.map(function (m: { id?: string; name?: string }) { return trimModelId(m.id || m.name); });
    } else if (Array.isArray(json?.data)) {
      rawList = json.data.map(function (m: { id?: string; name?: string; model?: string }) { return trimModelId(m.id || m.name || m.model); });
    } else if (Array.isArray(json?.models)) {
      rawList = json.models.map(function (m: { id?: string; name?: string }) { return trimModelId(m.id || m.name); });
    } else if (Array.isArray(json)) {
      rawList = json.map(function (m: unknown) {
        if (typeof m === 'string') return trimModelId(m);
        if (m && typeof m === 'object') {
          const model = m as { id?: unknown; name?: unknown };
          return trimModelId(model.id || model.name);
        }
        return '';
      });
    }
  } catch {
    rawList = [];
  }
  rawList = rawList.filter(Boolean);
  return {
    provider,
    baseUrl: input.baseUrl,
    endpoint,
    models: uniqSorted(rawList),
    rawCount: rawList.length,
  };
}

export function updateChannel(db: DbClient, id: number, input: UpdateChannelInput): ChannelRecord {
  const current = getChannel(db, id);
  const next = {
    name: input.name === undefined ? current.name : input.name.trim(),
    provider: input.provider ?? current.provider,
    baseUrl: input.baseUrl === undefined ? current.baseUrl : validateChannelBaseUrl(input.baseUrl),
    modelList: input.modelList === undefined ? current.modelList : input.modelList,
    groupId: input.groupId === undefined ? current.groupId : input.groupId,
    priority: input.priority ?? current.priority,
    status: input.status ?? current.status,
  };
  if (!next.name) throw new HTTPException(400, { message: "Channel name required" });
  assertGroupExists(db, next.groupId);
  const tx = db.sqlite.transaction(() => {
    db.sqlite
      .prepare("UPDATE channels SET name = ?, provider = ?, base_url = ?, model_list = ?, group_id = ?, priority = ?, status = ? WHERE id = ?")
      .run(next.name, next.provider, next.baseUrl, next.modelList ? JSON.stringify(next.modelList) : null, next.groupId, next.priority, next.status, id);
    if (input.secretValue !== undefined) {
      if (!input.secretValue.trim()) throw new HTTPException(400, { message: "Channel secret required" });
      db.sqlite
        .prepare("UPDATE channel_secrets SET encrypted_value = ?, rotated_at = ? WHERE channel_id = ?")
        .run(encryptSecret(input.secretValue), new Date().toISOString(), id);
    }
  });
  tx();
  return getChannel(db, id);
}

export function deleteChannel(db: DbClient, id: number): void {
  getChannel(db, id);
  db.sqlite.prepare("DELETE FROM channels WHERE id = ?").run(id);
}

export function getChannelSecret(db: DbClient, channelId: number): string {
  const row = db.sqlite.prepare("SELECT encrypted_value AS encryptedValue FROM channel_secrets WHERE channel_id = ? ORDER BY id DESC LIMIT 1").get(channelId);
  if (!row || typeof row !== "object" || typeof (row as { encryptedValue?: unknown }).encryptedValue !== "string") {
    throw new HTTPException(404, { message: "Channel secret not found" });
  }
  return decryptSecret((row as { encryptedValue: string }).encryptedValue);
}

function getEnabledAliasMap(db: DbClient): Map<string, ModelAliasRecord> {
  const rows = db.sqlite
    .prepare("SELECT id, source_model AS sourceModel, target_model AS targetModel, channel_id AS channelId, enabled, created_at AS createdAt FROM model_aliases WHERE enabled = 1")
    .all();
  const map = new Map<string, ModelAliasRecord>();
  for (const row of rows) {
    const alias = rowToModelAlias(row);
    if (alias) map.set(alias.sourceModel, alias);
  }
  return map;
}

export function resolveModelAlias(db: DbClient, model: string): { model: string; alias: ModelAliasRecord | null } {
  const aliases = getEnabledAliasMap(db);
  const seen = new Set<string>();
  let current = model;
  let lastAlias: ModelAliasRecord | null = null;
  for (let hop = 0; hop < 5; hop += 1) {
    if (seen.has(current)) throw new HTTPException(400, { message: "Model alias cycle detected" });
    seen.add(current);
    const alias = aliases.get(current);
    if (!alias) return { model: current, alias: lastAlias };
    lastAlias = alias;
    current = alias.targetModel;
  }
  throw new HTTPException(400, { message: "Model alias chain too deep" });
}

export function selectChannelCandidates(db: DbClient, model: string, groupId?: number | null): ChannelRecord[] {
  const resolved = resolveModelAlias(db, model);
  if (resolved.alias?.channelId) {
    const channel = getChannel(db, resolved.alias.channelId);
    if (channel.status !== "active") throw new HTTPException(503, { message: "No available channel" });
    return [channel];
  }
  const params: Array<number | string> = [];
  let where = "WHERE status = 'active'";
  if (groupId !== null && groupId !== undefined) {
    where += " AND (group_id = ? OR group_id IS NULL)";
    params.push(groupId);
  }
  const rows = db.sqlite
    .prepare(
      `SELECT id, name, provider, base_url AS baseUrl, model_list AS modelList, group_id AS groupId,
        priority, status, latency_ms AS latencyMs, last_checked_at AS lastCheckedAt,
        error_count AS errorCount, created_at AS createdAt FROM channels ${where} ORDER BY priority DESC, id ASC`,
    )
    .all(...params);
  const now = Date.now();
  const candidates: ChannelRecord[] = [];
  for (const row of rows) {
    const channel = rowToChannel(row);
    if (!channel) continue;
    if (channel.errorCount > 5 && channel.lastCheckedAt && now - Date.parse(channel.lastCheckedAt) < 5 * 60_000) continue;
    if (channel.modelList && channel.modelList.length > 0 && !channel.modelList.includes(resolved.model)) continue;
    candidates.push(channel);
  }
  if (candidates.length === 0) throw new HTTPException(503, { message: "No available channel" });
  return candidates;
}

type SessionAffinityEntry = {
  channelId: number;
  updatedAt: string;
};
type SessionAffinityMap = Record<string, SessionAffinityEntry>;

const SESSION_AFFINITY_KEY = "session_channel_map";
const SESSION_AFFINITY_TTL_MS = 3_600_000;
const SESSION_AFFINITY_CLEANUP_MS = 24 * 3_600_000;

function normalizeSessionId(sessionId: string | null | undefined): string | null {
  const value = String(sessionId ?? "").trim();
  if (!value) return null;
  return value.slice(0, 160);
}

function loadSessionAffinityMap(db: DbClient): SessionAffinityMap {
  const row = db.sqlite.prepare("SELECT value FROM settings WHERE key = ?").get(SESSION_AFFINITY_KEY) as { value?: string } | undefined;
  if (!row?.value) return {};
  try {
    const parsed = JSON.parse(row.value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: SessionAffinityMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const entry = value as Record<string, unknown>;
      const channelId = Number(entry.channelId);
      const updatedAt = typeof entry.updatedAt === "string" ? entry.updatedAt : "";
      if (Number.isInteger(channelId) && channelId > 0 && updatedAt) out[key] = { channelId, updatedAt };
    }
    return out;
  } catch {
    return {};
  }
}

function saveSessionAffinityMap(db: DbClient, map: SessionAffinityMap): void {
  const now = new Date().toISOString();
  db.sqlite
    .prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .run(SESSION_AFFINITY_KEY, JSON.stringify(map), now);
}

function pruneSessionAffinityMap(map: SessionAffinityMap, nowMs: number, maxAgeMs: number): boolean {
  let changed = false;
  for (const [key, entry] of Object.entries(map)) {
    const updated = Date.parse(entry.updatedAt);
    if (!Number.isFinite(updated) || nowMs - updated > maxAgeMs) {
      delete map[key];
      changed = true;
    }
  }
  return changed;
}

export function cleanupSessionAffinityMap(db: DbClient, now = new Date()): number {
  const map = loadSessionAffinityMap(db);
  const before = Object.keys(map).length;
  const changed = pruneSessionAffinityMap(map, now.getTime(), SESSION_AFFINITY_CLEANUP_MS);
  if (changed) saveSessionAffinityMap(db, map);
  return before - Object.keys(map).length;
}

export function selectChannelWithAffinity(db: DbClient, model: string, groupId: number | null | undefined, sessionId: string | null): ChannelRecord[] {
  const candidates = selectChannelCandidates(db, model, groupId);
  const normalized = normalizeSessionId(sessionId);
  if (!normalized) return candidates;
  const now = new Date();
  const nowMs = now.getTime();
  const map = loadSessionAffinityMap(db);
  pruneSessionAffinityMap(map, nowMs, SESSION_AFFINITY_CLEANUP_MS);
  const entry = map[normalized];
  if (entry && nowMs - Date.parse(entry.updatedAt) <= SESSION_AFFINITY_TTL_MS) {
    const index = candidates.findIndex((channel) => channel.id === entry.channelId && channel.status === "active" && channel.errorCount < 5);
    if (index >= 0) {
      map[normalized] = { channelId: candidates[index]?.id ?? entry.channelId, updatedAt: now.toISOString() };
      saveSessionAffinityMap(db, map);
      return [candidates[index] as ChannelRecord, ...candidates.slice(0, index), ...candidates.slice(index + 1)];
    }
  }
  const selected = candidates[0];
  if (!selected) return candidates;
  map[normalized] = { channelId: selected.id, updatedAt: now.toISOString() };
  saveSessionAffinityMap(db, map);
  return candidates;
}

export function selectChannel(db: DbClient, model: string, groupId?: number | null): ChannelRecord {
  const channel = selectChannelCandidates(db, model, groupId)[0];
  if (!channel) throw new HTTPException(503, { message: "No available channel" });
  return channel;
}

function assertAliasNoCycle(db: DbClient, sourceModel: string, targetModel: string): void {
  const aliases = getEnabledAliasMap(db);
  aliases.set(sourceModel, { id: 0, sourceModel, targetModel, channelId: null, enabled: true, createdAt: new Date().toISOString() });
  const seen = new Set<string>();
  let current = sourceModel;
  for (let hop = 0; hop < 5; hop += 1) {
    if (seen.has(current)) throw new HTTPException(400, { message: "Model alias cycle detected" });
    seen.add(current);
    const alias = aliases.get(current);
    if (!alias) return;
    current = alias.targetModel;
  }
  throw new HTTPException(400, { message: "Model alias chain too deep" });
}

export function createModelAlias(db: DbClient, input: CreateModelAliasInput): ModelAliasRecord {
  const sourceModel = input.sourceModel.trim();
  const targetModel = input.targetModel.trim();
  if (!sourceModel || !targetModel) throw new HTTPException(400, { message: "Model alias source and target required" });
  if (sourceModel === targetModel) throw new HTTPException(400, { message: "Model alias cannot target itself" });
  if (input.channelId !== null && input.channelId !== undefined) getChannel(db, input.channelId);
  assertAliasNoCycle(db, sourceModel, targetModel);
  const now = new Date().toISOString();
  const result = db.sqlite
    .prepare("INSERT INTO model_aliases (source_model, target_model, channel_id, enabled, created_at) VALUES (?, ?, ?, 1, ?)")
    .run(sourceModel, targetModel, input.channelId ?? null, now);
  const alias = rowToModelAlias(
    db.sqlite
      .prepare("SELECT id, source_model AS sourceModel, target_model AS targetModel, channel_id AS channelId, enabled, created_at AS createdAt FROM model_aliases WHERE id = ?")
      .get(Number(result.lastInsertRowid)),
  );
  if (!alias) throw new HTTPException(500, { message: "Model alias creation failed" });
  return alias;
}

export function listModelAliases(db: DbClient): ModelAliasRecord[] {
  const rows = db.sqlite
    .prepare("SELECT id, source_model AS sourceModel, target_model AS targetModel, channel_id AS channelId, enabled, created_at AS createdAt FROM model_aliases ORDER BY id DESC")
    .all();
  return rows.flatMap((row) => {
    const alias = rowToModelAlias(row);
    return alias ? [alias] : [];
  });
}

function getModelAlias(db: DbClient, id: number): ModelAliasRecord {
  const alias = rowToModelAlias(
    db.sqlite
      .prepare("SELECT id, source_model AS sourceModel, target_model AS targetModel, channel_id AS channelId, enabled, created_at AS createdAt FROM model_aliases WHERE id = ?")
      .get(id),
  );
  if (!alias) throw new HTTPException(404, { message: "Model alias not found" });
  return alias;
}

export function updateModelAlias(db: DbClient, id: number, input: UpdateModelAliasInput): ModelAliasRecord {
  const current = getModelAlias(db, id);
  const targetModel = input.targetModel === undefined ? current.targetModel : input.targetModel.trim();
  if (!targetModel) throw new HTTPException(400, { message: "Model alias target required" });
  if (current.sourceModel === targetModel) throw new HTTPException(400, { message: "Model alias cannot target itself" });
  if (input.targetModel !== undefined) assertAliasNoCycle(db, current.sourceModel, targetModel);
  db.sqlite
    .prepare("UPDATE model_aliases SET target_model = ?, enabled = ? WHERE id = ?")
    .run(targetModel, input.enabled === undefined ? (current.enabled ? 1 : 0) : (input.enabled ? 1 : 0), id);
  return getModelAlias(db, id);
}

export function deleteModelAlias(db: DbClient, id: number): void {
  const result = db.sqlite.prepare("DELETE FROM model_aliases WHERE id = ?").run(id);
  if (result.changes === 0) throw new HTTPException(404, { message: "Model alias not found" });
}

export function markChannelFailure(db: DbClient, channelId: number): void {
  db.sqlite
    .prepare("UPDATE channels SET error_count = error_count + 1, status = CASE WHEN error_count + 1 >= 5 THEN 'error' ELSE status END, last_checked_at = ? WHERE id = ?")
    .run(new Date().toISOString(), channelId);
}

export function markChannelSuccess(db: DbClient, channelId: number, latencyMs: number): void {
  db.sqlite.prepare("UPDATE channels SET error_count = 0, status = 'active', latency_ms = ?, last_checked_at = ? WHERE id = ?").run(latencyMs, new Date().toISOString(), channelId);
}

