import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { DataRow, Section, TableLedger } from "@/components";
import type { SubView } from "./Subs";

type TokenView = {
  id: number;
  prefix: string;
  revokedAt: string | null;
  usedBytes: number;
};

type RouteView = {
  id: number;
  alias: string;
  enabled: boolean;
  latencyMs: number | null;
};

type LogRow = {
  id: number;
  ts: string;
  tokenPrefix: string | null;
  source: string;
  target: string;
  bytes: number;
  durationMs: number;
  status: number;
};

export function DashboardPage(): JSX.Element {
  const subs = useQuery({ queryKey: ["subs"], queryFn: () => apiFetch<{ subs: SubView[] }>("/api/subs") });
  const tokens = useQuery({ queryKey: ["tokens"], queryFn: () => apiFetch<{ tokens: TokenView[] }>("/api/tokens") });
  const routes = useQuery({ queryKey: ["routes"], queryFn: () => apiFetch<{ routes: RouteView[] }>("/api/routes") });
  const logs = useQuery({ queryKey: ["logs", "recent"], queryFn: () => apiFetch<{ logs: LogRow[] }>("/api/logs?limit=5") });

  const activeTokens = useMemo(() => (tokens.data?.tokens ?? []).filter((token) => !token.revokedAt).length, [tokens.data?.tokens]);
  const activeRoutes = useMemo(() => (routes.data?.routes ?? []).filter((route) => route.enabled).length, [routes.data?.routes]);
  const avgLatency = useMemo(() => {
    const values = (routes.data?.routes ?? []).flatMap((route) => (route.latencyMs === null ? [] : [route.latencyMs]));
    if (values.length === 0) {
      return "未测";
    }
    return `${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)}ms`;
  }, [routes.data?.routes]);

  return (
    <Section lead="以一页案头索引掌握订阅、凭证、中转与最近请求。" plate="VOL. I" title="§ 概览">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <dl className="border border-rule bg-vellum px-4">
          <DataRow label="SUBSCRIPTIONS" value={subs.data?.subs.length ?? "..."} />
          <DataRow label="ACTIVE TOKENS" value={activeTokens} />
        </dl>
        <dl className="border border-rule bg-vellum px-4">
          <DataRow label="ENABLED ROUTES" value={activeRoutes} />
          <DataRow label="AVG LATENCY" value={avgLatency} />
        </dl>
      </div>
      <div className="mt-6">
        <TableLedger
          columns={[
            {
              key: "time",
              label: "TIME",
              render: (row) => <span className="font-mono text-xs">{new Date(row.ts).toLocaleTimeString()}</span>,
            },
            {
              key: "source",
              label: "SOURCE",
              render: (row) => <span className="font-mono text-xs">{row.source}</span>,
            },
            {
              key: "token",
              label: "TOKEN",
              render: (row) => <span className="font-mono text-xs">{row.tokenPrefix ?? "PUBLIC"}</span>,
            },
            {
              key: "target",
              label: "TARGET",
              render: (row) => <span className="font-mono text-xs">{row.target}</span>,
            },
            {
              key: "status",
              label: "STATUS",
              render: (row) => <span className="font-mono text-xs">{row.status} · {row.durationMs}ms</span>,
            },
          ]}
          empty="风过纸面，尚无请求留下墨迹。"
          getRowKey={(row) => row.id}
          rows={logs.data?.logs ?? []}
        />
      </div>
    </Section>
  );
}
