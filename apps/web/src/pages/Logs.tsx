import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { Button, Section, TableLedger, TextField } from "@/components";

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

function buildQuery(token: string, status: string): string {
  const params = new URLSearchParams();
  if (token.trim()) {
    params.set("token", token.trim());
  }
  if (status.trim()) {
    params.set("status", status.trim());
  }
  params.set("limit", "200");
  return params.toString();
}

export function LogsPage(): JSX.Element {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [queryText, setQueryText] = useState("limit=200");
  const logs = useQuery({
    queryKey: ["logs", queryText],
    queryFn: () => apiFetch<{ logs: LogRow[] }>(`/api/logs?${queryText}`),
  });
  const csvHref = useMemo(() => `/api/logs/export.csv?${queryText}`, [queryText]);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setQueryText(buildQuery(token, status));
  }

  return (
    <Section lead="按凭证前缀或状态码检索最近请求，保留纯文本附录风格。" plate="PL. IV" title="§ 附录 · PL. IV">
      <form className="mb-5 grid gap-4 border border-rule bg-vellum p-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end" onSubmit={submit}>
        <TextField label="Token Prefix" name="token" onChange={(event) => setToken(event.target.value)} value={token} />
        <TextField label="Status" name="status" onChange={(event) => setStatus(event.target.value)} type="number" value={status} />
        <Button type="submit" variant="ink">
          筛选
        </Button>
        <a
          className="border border-rule px-4 py-2 text-center font-mono text-xs uppercase tracking-widest transition-colors duration-200 hover:border-cinnabar hover:text-cinnabar focus:border-cinnabar focus:outline-none"
          href={csvHref}
        >
          导出 CSV
        </a>
      </form>
      <TableLedger
        columns={[
          {
            key: "ts",
            label: "TIME",
            render: (row) => <span className="font-mono text-xs">{new Date(row.ts).toLocaleString()}</span>,
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
            key: "meta",
            label: "BYTES · MS · STATUS",
            render: (row) => (
              <span className="font-mono text-xs">
                {row.bytes} · {row.durationMs} · {row.status}
              </span>
            ),
          },
        ]}
        empty="附录尚无条目，待请求穿过 Axion。"
        getRowKey={(row) => row.id}
        rows={logs.data?.logs ?? []}
      />
    </Section>
  );
}
