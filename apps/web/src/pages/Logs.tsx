import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FadeIn, PageHead } from "../components/page";
import { Button, Card, Field, Ledger, Pill, Select } from "../components/ui";
import { apiFetch } from "../lib/api";
import type { LogRecord } from "../lib/types";

function qs(token: string, status: string, limit: string): string {
  const params = new URLSearchParams();
  if (token.trim()) params.set("token", token.trim());
  if (status) params.set("status", status);
  if (limit) params.set("limit", limit);
  const text = params.toString();
  return text ? `?${text}` : "";
}

function statusTone(status: number): "ok" | "err" | "warn" {
  if (status >= 500) return "err";
  if (status >= 400) return "warn";
  return "ok";
}

export function Logs() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState("100");
  const queryText = qs(token, status, limit);
  const query = useQuery({ queryKey: ["logs", queryText], queryFn: async () => apiFetch<{ logs: LogRecord[] }>(`/api/logs${queryText}`) });
  const logs = query.data?.logs ?? [];
  return (
    <>
      <PageHead
        crumb={[<span key="root">Overview</span>, <span key="logs">Logs</span>]}
        title={<>调用 <em>附录</em></>}
        sub="订阅拉取、路由代理与 API 调用的学术 ledger。"
        actions={<a className="inline-flex min-h-9 items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-mute-3" href={`/api/logs/export${queryText}`}>CSV 导出</a>}
      />
      <FadeIn step={2}>
        <Card title="Filters" eyebrow="query">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_160px_auto] md:items-end">
            <Field label="token prefix" num="01" value={token} onChange={(event) => setToken(event.target.value)} />
            <Select label="status" num="02" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">all</option>
              <option value="200">200</option>
              <option value="401">401</option>
              <option value="402">402</option>
              <option value="404">404</option>
              <option value="500">500</option>
            </Select>
            <Field label="limit" num="03" value={limit} onChange={(event) => setLimit(event.target.value)} type="number" min="1" max="500" />
            <Button type="button" onClick={() => { void query.refetch(); }}>刷新</Button>
          </div>
        </Card>
      </FadeIn>
      <FadeIn step={3} className="mt-4">
        <Card title="Appendix ledger" eyebrow="traffic">
          <Ledger
            rows={logs}
            getRowKey={(row) => row.id}
            empty={query.isLoading ? "载入中" : "无日志"}
            columns={[
              { key: "ts", label: "TS", render: (row) => <span className="font-mono text-xs">{new Date(row.ts).toLocaleString()}</span> },
              { key: "token", label: "TOKEN", render: (row) => <span className="font-mono text-xs">{row.tokenPrefix ?? "public"}</span> },
              { key: "method", label: "METHOD", render: (row) => <span className="font-mono text-xs">{row.target.startsWith("/v1") ? "GET" : "ALL"}</span> },
              { key: "target", label: "TARGET", render: (row) => <span className="font-mono text-xs">{row.target}</span> },
              { key: "status", label: "STATUS", render: (row) => <Pill tone={statusTone(row.status)}>{row.status}</Pill> },
              { key: "bytes", label: "BYTES", render: (row) => <span className="font-mono text-xs">{row.bytes}</span> },
              { key: "ms", label: "MS", render: (row) => <span className="font-mono text-xs">{row.durationMs}</span> },
            ]}
          />
        </Card>
      </FadeIn>
    </>
  );
}
