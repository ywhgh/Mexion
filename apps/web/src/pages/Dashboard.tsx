import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FadeIn, PageHead } from "../components/page";
import { Button, Card, Heatmap, Pill, Spark } from "../components/ui";
import { apiFetch } from "../lib/api";

type HeatCell = { date: string; value: number };
type LogRecord = {
  id: number;
  ts: string;
  tokenPrefix: string | null;
  source: string;
  target: string;
  bytes: number;
  durationMs: number;
  status: number;
};

type Stats = {
  totals: {
    requests: number;
    subs: number;
    tokens: number;
    activeTokens: number;
    routes: number;
    enabledRoutes: number;
    avgLatencyMs: number;
  };
  heatmap: HeatCell[];
  sparks: {
    calls: number[];
    tokens: number[];
    latency: number[];
  };
  formats: Array<{ target: string; count: number; percent: number }>;
  liveLogs: LogRecord[];
};

function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => apiFetch<{ stats: Stats }>("/api/stats"),
  });
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(new Date());
}

function numberText(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function HStat({ label, value, hint, spark }: { label: string; value: string; hint: string; spark: number[] }) {
  return (
    <div className="hstat rounded-lg border border-border bg-surface p-5 shadow-s1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute-2">{label}</p>
          <div className="mt-2 font-display text-[42px] font-normal leading-none tracking-[-0.04em] text-ink">{value}</div>
        </div>
        <Spark values={spark.length > 0 ? spark : [0, 0]} label={`${label} spark`} />
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-mute-2">{hint}</p>
    </div>
  );
}

function statusTone(status: number): "ok" | "err" | "warn" {
  if (status >= 500) return "err";
  if (status >= 400) return "warn";
  return "ok";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 104857.6) / 10} MB`;
}

export function Dashboard() {
  const statsQuery = useStats();
  const stats = statsQuery.data?.stats;
  const totals = stats?.totals ?? { requests: 0, subs: 0, tokens: 0, activeTokens: 0, routes: 0, enabledRoutes: 0, avgLatencyMs: 0 };
  const formats = stats?.formats.length ? stats.formats : [
    { target: "clash-meta", count: 0, percent: 0 },
    { target: "sing-box", count: 0, percent: 0 },
    { target: "shadowrocket", count: 0, percent: 0 },
  ];

  return (
    <>
      <PageHead
        crumb={[<Link key="overview" to="/">Overview</Link>, <span key="today">{todayLabel()}</span>]}
        title={<>控制台 <em>总览</em></>}
        sub="订阅拉取、凭证配额与中转路由的实时案卷。"
        actions={<Button type="button" variant="primary" onClick={() => { void statsQuery.refetch(); }}>刷新</Button>}
      />

      <FadeIn step={2} className="grid gap-4 lg:grid-cols-3">
        <HStat label="Calls" value={numberText(totals.requests)} hint="total audited requests" spark={stats?.sparks.calls ?? [0, 0]} />
        <HStat label="Tokens" value={`${numberText(totals.activeTokens)}/${numberText(totals.tokens)}`} hint="active credentials" spark={stats?.sparks.tokens ?? [0, 0]} />
        <HStat label="Latency" value={`${numberText(totals.avgLatencyMs)}ms`} hint="mean response time" spark={stats?.sparks.latency ?? [0, 0]} />
      </FadeIn>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_.8fr]">
        <FadeIn step={3}>
          <Card title="Activity" eyebrow="13 weeks">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <Heatmap cells={stats?.heatmap ?? []} />
              <div className="grid gap-3 sm:grid-cols-3 lg:w-80 lg:grid-cols-1">
                <div className="rounded-md border border-border bg-surface-2 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute-2">Q</p>
                  <p className="mt-2 text-sm text-muted">最近 13 周调用热度，按日聚合。</p>
                </div>
                <div className="rounded-md border border-border bg-surface-2 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute-2">M</p>
                  <p className="mt-2 text-sm text-muted">颜色越深代表请求越集中。</p>
                </div>
                <div className="rounded-md border border-border bg-surface-2 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute-2">Y</p>
                  <p className="mt-2 text-sm text-muted">无 ECharts，只有可读数据痕迹。</p>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn step={3}>
          <Card title="Balance" eyebrow="service status">
            <dl className="grid gap-3">
              <div className="flex items-end justify-between border-b border-border-2 pb-3">
                <dt className="text-sm text-muted">总请求数</dt>
                <dd className="font-display text-3xl text-ink">{numberText(totals.requests)}</dd>
              </div>
              <div className="flex items-end justify-between border-b border-border-2 pb-3">
                <dt className="text-sm text-muted">平均延迟</dt>
                <dd className="font-display text-3xl text-ink">{numberText(totals.avgLatencyMs)}ms</dd>
              </div>
              <div className="flex items-center justify-between pt-1">
                <dt className="text-sm text-muted">启用路由</dt>
                <dd><Pill tone={totals.enabledRoutes > 0 ? "ok" : "warn"}>{totals.enabledRoutes}/{totals.routes}</Pill></dd>
              </div>
            </dl>
          </Card>
        </FadeIn>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <FadeIn step={4}>
          <Card title="Model mix" eyebrow="output format">
            <div className="space-y-4">
              {formats.map((format) => (
                <div key={format.target}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-ink">{format.target}</span>
                    <span className="font-mono text-[11px] text-mute-2">{format.count} · {format.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-2">
                    <div className="h-full rounded-full bg-verm transition-all" style={{ width: `${format.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        <FadeIn step={5}>
          <Card title="Live logs" eyebrow="latest 8" actions={<Link className="font-mono text-xs text-verm" to="/logs">OPEN</Link>}>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {(stats?.liveLogs ?? []).length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">暂无调用记录，拉取订阅或访问中转路由后会出现墨迹。</div>
              ) : stats?.liveLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-[92px_1fr_auto] items-center gap-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">
                  <span className="font-mono text-[11px] text-mute-2">{new Date(log.ts).toLocaleTimeString()}</span>
                  <span className="min-w-0 truncate font-mono text-xs text-ink">{log.target}</span>
                  <div className="flex items-center gap-2">
                    <Pill tone={statusTone(log.status)}>{log.status}</Pill>
                    <span className="font-mono text-[11px] text-mute-2">{formatBytes(log.bytes)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}

