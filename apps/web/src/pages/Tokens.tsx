import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { FadeIn, PageHead } from "../components/page";
import { Button, Card, Field, Ledger, Modal, MonoCode, Pill, Select, TextArea } from "../components/ui";
import { apiFetch, jsonBody } from "../lib/api";
import type { SubPublic, TokenPublic } from "../lib/types";

type TokenCreated = { token: TokenPublic; secret: string };

function gb(value: number): number {
  return value * 1024 * 1024 * 1024;
}

function bytesLabel(value: number | null): string {
  if (value === null) return "∞";
  if (value < 1024 * 1024) return `${value} B`;
  if (value < 1024 * 1024 * 1024) return `${Math.round(value / 104857.6) / 10} MB`;
  return `${Math.round(value / 107374182.4) / 10} GB`;
}

function progress(token: TokenPublic): number {
  if (token.quotaBytes === null || token.quotaBytes <= 0) return 0;
  return Math.min(100, Math.round((token.usedBytes / token.quotaBytes) * 100));
}

export function Tokens() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState<TokenCreated | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [subId, setSubId] = useState("");
  const [quotaGb, setQuotaGb] = useState("10");
  const [unlimited, setUnlimited] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [ipAllow, setIpAllow] = useState("");
  const tokensQuery = useQuery({ queryKey: ["tokens"], queryFn: async () => apiFetch<{ tokens: TokenPublic[] }>("/api/tokens") });
  const subsQuery = useQuery({ queryKey: ["subs"], queryFn: async () => apiFetch<{ subs: SubPublic[] }>("/api/subs") });
  const tokens = tokensQuery.data?.tokens ?? [];
  const selected = tokens[0] ?? null;

  const createMutation = useMutation({
    mutationFn: async () => apiFetch<TokenCreated>("/api/tokens", {
      method: "POST",
      body: jsonBody({
        name,
        note,
        subId: Number(subId || subsQuery.data?.subs[0]?.id),
        quotaBytes: unlimited ? null : gb(Number(quotaGb || 0)),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        ipAllow: ipAllow.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      }),
    }),
    onSuccess: (data) => {
      setRevealed(data);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const subOptions = useMemo(() => subsQuery.data?.subs ?? [], [subsQuery.data?.subs]);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <>
      <PageHead
        crumb={[<span key="root">Overview</span>, <span key="tokens">Tokens</span>]}
        title={<>凭证 <em>密钥</em></>}
        sub="绑定订阅、设置配额、限制来源地址。明文只在创建后显示一次。"
        actions={<Button type="button" variant="primary" onClick={() => setOpen(true)}>创建凭证</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
        <FadeIn step={2}>
          <Card title="Key stream" eyebrow="api keys">
            <Ledger
              rows={tokens}
              getRowKey={(row) => row.id}
              empty={tokensQuery.isLoading ? "载入中" : "尚无凭证"}
              columns={[
                { key: "prefix", label: "PREFIX", render: (row) => <span className="font-mono text-ink">{row.prefix}</span> },
                { key: "name", label: "名称", render: (row) => <span className="font-medium">{row.name}</span> },
                { key: "sub", label: "SUB", render: (row) => <span className="font-mono text-xs">#{row.subId}</span> },
                { key: "status", label: "状态", render: (row) => <Pill tone={row.revokedAt ? "err" : "ok"}>{row.revokedAt ? "revoked" : "active"}</Pill> },
                { key: "quota", label: "配额", render: (row) => <span className="font-mono text-xs">{bytesLabel(row.usedBytes)} / {bytesLabel(row.quotaBytes)}</span> },
              ]}
            />
          </Card>
        </FadeIn>
        <FadeIn step={3}>
          <Card title="Detail" eyebrow={selected?.prefix ?? "select"}>
            {selected ? (
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-mute-2"><span>Usage</span><span>{progress(selected)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-2"><div className="h-full rounded-full bg-verm" style={{ width: `${progress(selected)}%` }} /></div>
                </div>
                <dl className="grid gap-3 text-sm">
                  <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">备注</dt><dd className="mt-1 text-ink">{selected.note || "none"}</dd></div>
                  <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">IP 白名单</dt><dd className="mt-1 font-mono text-xs">{selected.ipAllow.join(", ") || "any"}</dd></div>
                  <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">过期</dt><dd className="mt-1 font-mono text-xs">{selected.expiresAt ?? "never"}</dd></div>
                </dl>
              </div>
            ) : <p className="text-muted">创建或选择一个凭证。</p>}
          </Card>
        </FadeIn>
      </div>

      <Modal open={open} title="创建凭证" sub="明文只会在下一步出现一次。" onClose={() => setOpen(false)} footer={<><Button type="button" onClick={() => setOpen(false)}>取消</Button><Button type="submit" form="token-create" variant="primary" loading={createMutation.isPending}>创建</Button></>}>
        <form id="token-create" className="grid gap-4" onSubmit={submit}>
          <Field label="名称" num="01" value={name} onChange={(event) => setName(event.target.value)} required />
          <Field label="备注" num="02" value={note} onChange={(event) => setNote(event.target.value)} />
          <Select label="绑定订阅" num="03" value={subId} onChange={(event) => setSubId(event.target.value)} required>
            <option value="">选择订阅</option>
            {subOptions.map((sub) => <option key={sub.id} value={sub.id}>#{sub.id} · {sub.name}</option>)}
          </Select>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Field label="配额 GB" num="04" value={quotaGb} onChange={(event) => setQuotaGb(event.target.value)} type="number" min="1" disabled={unlimited} />
            <label className="flex items-end gap-2 pb-2 text-sm text-muted"><input type="checkbox" checked={unlimited} onChange={(event) => setUnlimited(event.target.checked)} />永不过量</label>
          </div>
          <Field label="过期日期" num="05" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} type="date" />
          <TextArea label="IP 白名单" num="06" value={ipAllow} onChange={(event) => setIpAllow(event.target.value)} placeholder="127.0.0.1/32" />
        </form>
      </Modal>

      <Modal open={revealed !== null} title="只显示一次" sub="关闭后无法再次查看明文 token。" onClose={() => setRevealed(null)}>
        <div className="space-y-4">
          <Pill tone="warn">one-time reveal</Pill>
          {revealed && <MonoCode value={revealed.secret} label="复制明文" />}
        </div>
      </Modal>
    </>
  );
}
