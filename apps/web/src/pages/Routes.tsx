import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { FadeIn, PageHead } from "../components/page";
import { Button, Card, Field, Ledger, Modal, Pill } from "../components/ui";
import { apiFetch, jsonBody } from "../lib/api";
import type { RoutePublic } from "../lib/types";

function latencyTone(ms: number | null): "ok" | "warn" | "err" | "neutral" {
  if (ms === null) return "neutral";
  if (ms < 250) return "ok";
  if (ms < 900) return "warn";
  return "err";
}

export function Routes() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState("");
  const [upstream, setUpstream] = useState("");
  const routesQuery = useQuery({ queryKey: ["routes"], queryFn: async () => apiFetch<{ routes: RoutePublic[] }>("/api/routes") });
  const routes = routesQuery.data?.routes ?? [];
  const createMutation = useMutation({
    mutationFn: async () => apiFetch<{ route: RoutePublic }>("/api/routes", { method: "POST", body: jsonBody({ alias, upstream, enabled: true }) }),
    onSuccess: () => { setOpen(false); setAlias(""); setUpstream(""); void queryClient.invalidateQueries({ queryKey: ["routes"] }); },
  });
  const probeMutation = useMutation({
    mutationFn: async (id: number) => apiFetch<{ route: RoutePublic }>(`/api/routes/${id}/probe`, { method: "POST" }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["routes"] }); },
  });

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <>
      <PageHead
        crumb={[<span key="root">Overview</span>, <span key="routes">Routes</span>]}
        title={<>中转 <em>路由</em></>}
        sub="alias 到 upstream 的印刷体映射，支持主动探测延迟。"
        actions={<Button type="button" variant="primary" onClick={() => setOpen(true)}>新建路由</Button>}
      />
      <FadeIn step={2}>
        <Card title="Relay mappings" eyebrow="alias to upstream">
          <div className="space-y-3">
            {routes.length === 0 && <div className="rounded-md border border-dashed border-border p-8 text-center text-muted">尚未建立中转路由</div>}
            {routes.map((route) => (
              <div key={route.id} className="grid gap-3 rounded-lg border border-border bg-surface-2 p-4 transition hover:border-verm md:grid-cols-[220px_1fr_auto] md:items-center">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute-2">alias</p>
                  <p className="mt-1 font-mono text-lg text-ink">/api/r/{route.alias}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute-2">upstream</p>
                  <p className="mt-1 truncate font-display text-2xl italic tracking-[-0.025em] text-ink">{route.upstream}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Pill tone={latencyTone(route.latencyMs)}>{route.latencyMs === null ? "unknown" : `${route.latencyMs}ms`}</Pill>
                  <Button type="button" onClick={() => probeMutation.mutate(route.id)} loading={probeMutation.isPending}>probe</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
      <FadeIn step={3} className="mt-4">
        <Card title="Route ledger" eyebrow="appendix">
          <Ledger
            rows={routes}
            getRowKey={(row) => row.id}
            empty="无路由"
            columns={[
              { key: "id", label: "#", render: (row) => <span className="font-mono">{row.id}</span> },
              { key: "alias", label: "ALIAS", render: (row) => <span className="font-mono">{row.alias}</span> },
              { key: "upstream", label: "UPSTREAM", render: (row) => <span className="font-mono text-xs">{row.upstream}</span> },
              { key: "enabled", label: "STATE", render: (row) => <Pill tone={row.enabled ? "ok" : "err"}>{row.enabled ? "enabled" : "disabled"}</Pill> },
              { key: "latency", label: "MS", render: (row) => <span className="font-mono text-xs">{row.latencyMs ?? "..."}</span> },
            ]}
          />
        </Card>
      </FadeIn>
      <Modal open={open} title="新建路由" onClose={() => setOpen(false)} footer={<><Button type="button" onClick={() => setOpen(false)}>取消</Button><Button type="submit" form="route-create" variant="primary" loading={createMutation.isPending}>创建</Button></>}>
        <form id="route-create" className="grid gap-4" onSubmit={submit}>
          <Field label="alias" num="01" value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="openai" required />
          <Field label="upstream" num="02" value={upstream} onChange={(event) => setUpstream(event.target.value)} placeholder="https://api.example.com" required />
        </form>
      </Modal>
    </>
  );
}
