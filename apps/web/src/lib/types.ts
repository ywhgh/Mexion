export type TokenPublic = {
  id: number;
  name: string;
  note: string;
  prefix: string;
  subId: number;
  quotaBytes: number | null;
  usedBytes: number;
  ipAllow: string[];
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type SubPublic = {
  id: number;
  name: string;
  rawSources: string[];
  target: "clash-meta" | "sing-box" | "shadowrocket";
  ruleSet: "none" | "acl4ssr";
  renamePrefix: string;
  filterRegex: string;
  createdAt: string;
  updatedAt: string;
  tokens: TokenPublic[];
};

export type RoutePublic = {
  id: number;
  alias: string;
  upstream: string;
  enabled: boolean;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
};

export type LogRecord = {
  id: number;
  ts: string;
  tokenPrefix: string | null;
  source: string;
  target: string;
  bytes: number;
  durationMs: number;
  status: number;
};

export type SettingsPublic = {
  instanceName: string;
  theme: "light" | "dark";
  lang: "zh" | "en";
  updatedAt: string;
};
