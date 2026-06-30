import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import type { RuleSet, SubCreateInput, TargetFormat } from "../contracts.js";
import { idParamSchema, subCreateSchema, subUpdateSchema } from "../contracts.js";
import type { DbClient } from "../db/client.js";
import type { AppBindings } from "../app.js";
import { consumeTokenQuota, createTokenForSub, listTokensForSub, verifyTokenSecret } from "./tokens.js";

export type SubRecord = {
  id: number;
  name: string;
  rawSources: string;
  target: TargetFormat;
  ruleSet: RuleSet;
  renamePrefix: string;
  filterRegex: string;
  createdAt: string;
  updatedAt: string;
};

export type SubPublic = {
  id: number;
  name: string;
  rawSources: string[];
  target: TargetFormat;
  ruleSet: RuleSet;
  renamePrefix: string;
  filterRegex: string;
  createdAt: string;
  updatedAt: string;
  tokens: ReturnType<typeof listTokensForSub>;
};

type ProxyType = "vmess" | "vless" | "ss" | "trojan" | "hysteria2";

type ProxyNode = {
  type: ProxyType;
  name: string;
  server: string;
  port: number;
  uuid?: string;
  password?: string;
  cipher?: string;
  network?: string;
  tls?: boolean;
  raw: string;
};

function isTargetFormat(value: string): value is TargetFormat {
  return value === "clash-meta" || value === "sing-box" || value === "shadowrocket";
}

function isRuleSet(value: string): value is RuleSet {
  return value === "none" || value === "acl4ssr";
}

function rowToSub(row: unknown): SubRecord | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  const value = row as Record<string, unknown>;
  const target = String(value.target ?? "");
  const ruleSet = String(value.ruleSet ?? value.rule_set ?? "");
  if (typeof value.id !== "number" || !isTargetFormat(target) || !isRuleSet(ruleSet)) {
    return null;
  }
  return {
    id: value.id,
    name: String(value.name ?? ""),
    rawSources: String(value.rawSources ?? value.raw_sources ?? "[]"),
    target,
    ruleSet,
    renamePrefix: String(value.renamePrefix ?? value.rename_prefix ?? ""),
    filterRegex: String(value.filterRegex ?? value.filter_regex ?? ""),
    createdAt: String(value.createdAt ?? value.created_at ?? ""),
    updatedAt: String(value.updatedAt ?? value.updated_at ?? ""),
  };
}

function publicSub(db: DbClient, sub: SubRecord): SubPublic {
  return {
    ...sub,
    rawSources: JSON.parse(sub.rawSources) as string[],
    tokens: listTokensForSub(db, sub.id),
  };
}

export function getSubRecord(db: DbClient, id: number): SubRecord {
  const row = db.sqlite
    .prepare(
      `SELECT id, name, raw_sources AS rawSources, target, rule_set AS ruleSet, rename_prefix AS renamePrefix,
        filter_regex AS filterRegex, created_at AS createdAt, updated_at AS updatedAt
       FROM subs WHERE id = ?`,
    )
    .get(id);
  const sub = rowToSub(row);
  if (!sub) {
    throw new HTTPException(404, { message: "Subscription not found" });
  }
  return sub;
}

export function listSubs(c: Context<AppBindings>): Response {
  const db = c.get("db");
  const rows = db.sqlite
    .prepare(
      `SELECT id, name, raw_sources AS rawSources, target, rule_set AS ruleSet, rename_prefix AS renamePrefix,
        filter_regex AS filterRegex, created_at AS createdAt, updated_at AS updatedAt
       FROM subs ORDER BY id DESC`,
    )
    .all();
  const subs = rows.flatMap((row) => {
    const sub = rowToSub(row);
    return sub ? [publicSub(db, sub)] : [];
  });
  return c.json({ ok: true, data: { subs } });
}

export async function createSub(c: Context<AppBindings>): Promise<Response> {
  const input = subCreateSchema.parse(await c.req.json());
  const db = c.get("db");
  const now = new Date().toISOString();
  const result = db.sqlite
    .prepare(
      `INSERT INTO subs (name, raw_sources, target, rule_set, rename_prefix, filter_regex, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      JSON.stringify(input.rawSources),
      input.target,
      input.ruleSet,
      input.renamePrefix,
      input.filterRegex,
      now,
      now,
    );
  const id = Number(result.lastInsertRowid);
  const createdToken = await createTokenForSub(db, {
    name: `${input.name} endpoint`,
    note: "Auto-issued subscription endpoint",
    subId: id,
  });
  const sub = publicSub(db, getSubRecord(db, id));
  const origin = new URL(c.req.url).origin;
  const outputUrl = `${origin}/v1/sub?token=${encodeURIComponent(createdToken.secret)}`;
  return c.json({ ok: true, data: { sub, token: createdToken.token, secret: createdToken.secret, outputUrl } }, 201);
}

export function getSub(c: Context<AppBindings>): Response {
  const { id } = idParamSchema.parse(c.req.param());
  const sub = publicSub(c.get("db"), getSubRecord(c.get("db"), id));
  return c.json({ ok: true, data: { sub } });
}

export async function updateSub(c: Context<AppBindings>): Promise<Response> {
  const { id } = idParamSchema.parse(c.req.param());
  const input = subUpdateSchema.parse(await c.req.json());
  const db = c.get("db");
  const current = getSubRecord(db, id);
  const next: SubCreateInput = {
    name: input.name ?? current.name,
    rawSources: input.rawSources ?? (JSON.parse(current.rawSources) as string[]),
    target: input.target ?? current.target,
    ruleSet: input.ruleSet ?? current.ruleSet,
    renamePrefix: input.renamePrefix ?? current.renamePrefix,
    filterRegex: input.filterRegex ?? current.filterRegex,
  };
  db.sqlite
    .prepare(
      `UPDATE subs SET name = ?, raw_sources = ?, target = ?, rule_set = ?, rename_prefix = ?, filter_regex = ?, updated_at = ? WHERE id = ?`,
    )
    .run(
      next.name,
      JSON.stringify(next.rawSources),
      next.target,
      next.ruleSet,
      next.renamePrefix,
      next.filterRegex,
      new Date().toISOString(),
      id,
    );
  return c.json({ ok: true, data: { sub: publicSub(db, getSubRecord(db, id)) } });
}

export function deleteSub(c: Context<AppBindings>): Response {
  const { id } = idParamSchema.parse(c.req.param());
  getSubRecord(c.get("db"), id);
  c.get("db").sqlite.prepare("DELETE FROM subs WHERE id = ?").run(id);
  return c.json({ ok: true, data: { deleted: true } });
}

function decodeBase64(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    return decoded.trim().length > 0 ? decoded : null;
  } catch (error) {
    console.warn("Failed to decode subscription base64", error);
    return null;
  }
}

function maybeJsonObject(input: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch (error) {
    console.warn("Failed to parse vmess JSON", error);
    return null;
  }
}

function parseVmess(line: string): ProxyNode | null {
  const payload = line.slice("vmess://".length);
  const decoded = decodeBase64(payload);
  if (!decoded) {
    return null;
  }
  const json = maybeJsonObject(decoded);
  if (!json) {
    return null;
  }
  const server = String(json.add ?? "");
  const port = Number(json.port ?? 0);
  const uuid = String(json.id ?? "");
  if (!server || !Number.isInteger(port) || port <= 0 || !uuid) {
    return null;
  }
  return {
    type: "vmess",
    name: String(json.ps ?? server),
    server,
    port,
    uuid,
    network: String(json.net ?? "tcp"),
    tls: String(json.tls ?? "") === "tls",
    raw: line,
  };
}

function parseUrlNode(line: string): ProxyNode | null {
  try {
    const url = new URL(line);
    const type = url.protocol.replace(":", "");
    if (type !== "vless" && type !== "trojan" && type !== "hysteria2") {
      return null;
    }
    const port = Number(url.port || (url.protocol === "https:" ? "443" : "0"));
    if (!url.hostname || !Number.isInteger(port) || port <= 0) {
      return null;
    }
    const name = decodeURIComponent(url.hash.replace(/^#/, "")) || url.hostname;
    const node: ProxyNode = {
      type,
      name,
      server: url.hostname,
      port,
      network: url.searchParams.get("type") ?? "tcp",
      tls: url.searchParams.get("security") === "tls" || url.searchParams.get("sni") !== null,
      raw: line,
    };
    if (type === "vless") {
      node.uuid = decodeURIComponent(url.username);
    }
    if (type === "trojan" || type === "hysteria2") {
      node.password = decodeURIComponent(url.username);
    }
    return node;
  } catch (error) {
    console.warn("Failed to parse URL node", error);
    return null;
  }
}

function parseSs(line: string): ProxyNode | null {
  const fragment = line.includes("#") ? decodeURIComponent(line.slice(line.indexOf("#") + 1)) : "ss";
  const withoutScheme = line.slice("ss://".length).split("#")[0]?.split("?")[0] ?? "";
  const decoded = withoutScheme.includes("@") ? withoutScheme : decodeBase64(withoutScheme);
  if (!decoded) {
    return null;
  }
  const at = decoded.lastIndexOf("@");
  const colon = decoded.lastIndexOf(":");
  if (at <= 0 || colon <= at) {
    return null;
  }
  const methodPassword = decoded.slice(0, at);
  const server = decoded.slice(at + 1, colon);
  const port = Number(decoded.slice(colon + 1));
  const methodSplit = methodPassword.indexOf(":");
  if (methodSplit <= 0 || !server || !Number.isInteger(port) || port <= 0) {
    return null;
  }
  return {
    type: "ss",
    name: fragment || server,
    server,
    port,
    cipher: methodPassword.slice(0, methodSplit),
    password: methodPassword.slice(methodSplit + 1),
    raw: line,
  };
}

function parseLine(line: string): ProxyNode | null {
  if (line.startsWith("vmess://")) {
    return parseVmess(line);
  }
  if (line.startsWith("ss://")) {
    return parseSs(line);
  }
  if (line.startsWith("vless://") || line.startsWith("trojan://") || line.startsWith("hysteria2://")) {
    return parseUrlNode(line);
  }
  return null;
}

async function expandSource(source: string): Promise<string[]> {
  const trimmed = source.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const response = await fetch(trimmed);
    if (!response.ok) {
      throw new HTTPException(502, { message: `Source fetch failed: ${response.status}` });
    }
    return expandSource(await response.text());
  }
  const decoded = decodeBase64(trimmed);
  const text = decoded && /(vmess|vless|trojan|hysteria2|ss):\/\//.test(decoded) ? decoded : trimmed;
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function collectNodes(sub: SubRecord): Promise<ProxyNode[]> {
  const rawSources = JSON.parse(sub.rawSources) as string[];
  const lines = (await Promise.all(rawSources.map((source) => expandSource(source)))).flat();
  const unique = new Map<string, ProxyNode>();
  for (const line of lines) {
    const node = parseLine(line);
    if (!node) {
      continue;
    }
    const key = `${node.type}|${node.server}|${node.port}|${node.uuid ?? node.password ?? node.cipher ?? ""}`;
    if (!unique.has(key)) {
      unique.set(key, node);
    }
  }
  let nodes = [...unique.values()];
  if (sub.filterRegex) {
    const filter = new RegExp(sub.filterRegex, "i");
    nodes = nodes.filter((node) => filter.test(node.name) || filter.test(node.server));
  }
  return nodes.map((node, index) => ({
    ...node,
    name: sub.renamePrefix ? `${sub.renamePrefix} ${index + 1}. ${node.name}` : node.name,
  }));
}

function quoteYaml(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function renderClashNode(node: ProxyNode): string[] {
  const base = [`  - name: ${quoteYaml(node.name)}`, `    type: ${node.type}`, `    server: ${node.server}`, `    port: ${node.port}`];
  if (node.type === "vmess" || node.type === "vless") {
    base.push(`    uuid: ${node.uuid ?? ""}`);
    base.push("    alterId: 0");
    base.push(`    cipher: ${node.type === "vmess" ? "auto" : "none"}`);
    base.push(`    tls: ${node.tls ? "true" : "false"}`);
    base.push(`    network: ${node.network ?? "tcp"}`);
  }
  if (node.type === "ss") {
    base.push(`    cipher: ${node.cipher ?? "aes-128-gcm"}`);
    base.push(`    password: ${quoteYaml(node.password ?? "")}`);
  }
  if (node.type === "trojan" || node.type === "hysteria2") {
    base.push(`    password: ${quoteYaml(node.password ?? "")}`);
    base.push(`    sni: ${node.server}`);
  }
  return base;
}

function renderClash(nodes: ProxyNode[], ruleSet: RuleSet): string {
  const proxyNames = nodes.map((node) => `      - ${quoteYaml(node.name)}`).join("\n");
  const ruleLines = ruleSet === "acl4ssr" ? ["  - GEOIP,CN,DIRECT", "  - MATCH,AXION"] : ["  - MATCH,AXION"];
  return [
    "mixed-port: 7890",
    "allow-lan: false",
    "mode: rule",
    "log-level: info",
    "proxies:",
    ...nodes.flatMap(renderClashNode),
    "proxy-groups:",
    "  - name: AXION",
    "    type: select",
    "    proxies:",
    proxyNames || "      - DIRECT",
    "rules:",
    ...ruleLines,
    "",
  ].join("\n");
}

function singBoxOutbound(node: ProxyNode): Record<string, unknown> {
  const common: Record<string, unknown> = {
    type: node.type === "ss" ? "shadowsocks" : node.type,
    tag: node.name,
    server: node.server,
    server_port: node.port,
  };
  if (node.uuid) {
    common.uuid = node.uuid;
  }
  if (node.password) {
    common.password = node.password;
  }
  if (node.cipher) {
    common.method = node.cipher;
  }
  if (node.tls) {
    common.tls = { enabled: true, server_name: node.server };
  }
  return common;
}

function renderSingBox(nodes: ProxyNode[], ruleSet: RuleSet): string {
  const outbounds = [
    ...nodes.map(singBoxOutbound),
    { type: "direct", tag: "DIRECT" },
    { type: "selector", tag: "AXION", outbounds: nodes.map((node) => node.name) },
  ];
  return JSON.stringify(
    {
      log: { level: "info" },
      dns: { servers: [{ tag: "local", address: "local" }] },
      outbounds,
      route: {
        rules: ruleSet === "acl4ssr" ? [{ geosite: ["cn"], outbound: "DIRECT" }] : [],
        final: nodes[0]?.name ?? "DIRECT",
      },
    },
    null,
    2,
  );
}

function renderShadowrocket(nodes: ProxyNode[]): string {
  return Buffer.from(nodes.map((node) => node.raw).join("\n"), "utf8").toString("base64");
}

export async function renderPublicSubscription(c: Context<AppBindings>): Promise<Response> {
  const secret = c.req.query("token");
  if (!secret) {
    throw new HTTPException(401, { message: "Missing subscription token" });
  }
  const sourceIp = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const token = await verifyTokenSecret(c.get("db"), secret, sourceIp);
  const sub = getSubRecord(c.get("db"), token.subId);
  const nodes = await collectNodes(sub);
  const content =
    sub.target === "sing-box"
      ? renderSingBox(nodes, sub.ruleSet)
      : sub.target === "shadowrocket"
        ? renderShadowrocket(nodes)
        : renderClash(nodes, sub.ruleSet);
  const bytes = Buffer.byteLength(content, "utf8");
  consumeTokenQuota(c.get("db"), token, bytes);
  const contentType = sub.target === "sing-box" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8";
  return new Response(content, { status: 200, headers: { "content-type": contentType } });
}


