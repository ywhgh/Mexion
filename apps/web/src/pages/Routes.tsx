import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { Button, Section, TableLedger, TextField } from "@/components";

type RouteView = {
  id: number;
  alias: string;
  upstream: string;
  enabled: boolean;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
};

export function RoutesPage(): JSX.Element {
  const [draftOpen, setDraftOpen] = useState(false);
  const queryClient = useQueryClient();
  const routes = useQuery({ queryKey: ["routes"], queryFn: () => apiFetch<{ routes: RouteView[] }>("/api/routes") });

  const create = useMutation({
    mutationFn: (form: FormData) =>
      apiFetch<{ route: RouteView }>("/api/routes", {
        method: "POST",
        body: JSON.stringify({
          alias: String(form.get("alias") ?? ""),
          upstream: String(form.get("upstream") ?? ""),
          enabled: true,
        }),
      }),
    onSuccess: async () => {
      setDraftOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const update = useMutation({
    mutationFn: (route: RouteView) =>
      apiFetch<{ route: RouteView }>(`/api/routes/${route.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !route.enabled }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch<{ deleted: boolean }>(`/api/routes/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  return (
    <Section lead="将外部上游刻成稳定别名路径，所有转发都会留下用时与状态码。" plate="PL. III" title="§ 中转 · PL. III">
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setDraftOpen((value) => !value)} variant="ink">
          新增映射
        </Button>
      </div>
      {draftOpen ? (
        <form
          className="mb-5 grid gap-4 border border-rule bg-vellum p-4 lg:grid-cols-[1fr_2fr_auto] lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate(new FormData(event.currentTarget));
          }}
        >
          <TextField label="别名路径" name="alias" placeholder="demo" required />
          <TextField label="上游 URL" name="upstream" placeholder="https://httpbin.org/anything" required type="url" />
          <Button disabled={create.isPending} type="submit" variant="ink">
            刻写
          </Button>
        </form>
      ) : null}
      <TableLedger
        columns={[
          {
            key: "map",
            label: "MAPPING",
            render: (row) => (
              <div className="grid gap-1 font-mono text-sm">
                <span>{row.upstream}</span>
                <span className="text-mute">⟶ /api/r/{row.alias}/*</span>
              </div>
            ),
          },
          {
            key: "latency",
            label: "LATENCY",
            render: (row) => <span className="font-mono text-sm">{row.latencyMs === null ? "未测" : `${row.latencyMs}ms`}</span>,
          },
          {
            key: "state",
            label: "STATE",
            render: (row) => <span className="font-mono text-xs uppercase tracking-widest">{row.enabled ? "ENABLED" : "DISABLED"}</span>,
          },
          {
            key: "action",
            label: "ACTION",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button disabled={update.isPending} onClick={() => update.mutate(row)} variant="ghost">
                  {row.enabled ? "停用" : "启用"}
                </Button>
                <Button disabled={remove.isPending} onClick={() => remove.mutate(row.id)} variant="ghost">
                  删除
                </Button>
              </div>
            ),
          },
        ]}
        empty="尚未刻写任何上游映射。"
        getRowKey={(row) => row.id}
        rows={routes.data?.routes ?? []}
      />
    </Section>
  );
}
