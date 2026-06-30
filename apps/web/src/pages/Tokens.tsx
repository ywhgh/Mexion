import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { Button, Modal, MonoCode, Section, Select, TableLedger, TextArea, TextField } from "@/components";
import type { SubView } from "./Subs";

type TokenView = {
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

function bytesLabel(bytes: number | null): string {
  if (bytes === null) {
    return "∞";
  }
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${bytes} B`;
}

function usageLabel(token: TokenView): string {
  if (token.quotaBytes === null) {
    return `${bytesLabel(token.usedBytes)} / ∞`;
  }
  const percent = Math.min(100, Math.round((token.usedBytes / token.quotaBytes) * 100));
  return `${percent}% · ${bytesLabel(token.usedBytes)} / ${bytesLabel(token.quotaBytes)}`;
}

function datetimeLocalToIso(value: string): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toISOString();
}

function ipRules(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TokensPage(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const tokens = useQuery({ queryKey: ["tokens"], queryFn: () => apiFetch<{ tokens: TokenView[] }>("/api/tokens") });
  const subs = useQuery({ queryKey: ["subs"], queryFn: () => apiFetch<{ subs: SubView[] }>("/api/subs") });
  const subNames = useMemo(() => new Map((subs.data?.subs ?? []).map((sub) => [sub.id, sub.name])), [subs.data?.subs]);

  const create = useMutation({
    mutationFn: (form: FormData) => {
      const quotaGb = String(form.get("quotaGb") ?? "").trim();
      const quotaBytes = quotaGb ? Math.round(Number(quotaGb) * 1024 * 1024 * 1024) : null;
      return apiFetch<{ token: TokenView; secret: string }>("/api/tokens", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          note: String(form.get("note") ?? ""),
          subId: Number(form.get("subId") ?? 0),
          quotaBytes,
          expiresAt: datetimeLocalToIso(String(form.get("expiresAt") ?? "")),
          ipAllow: ipRules(String(form.get("ipAllow") ?? "")),
        }),
      });
    },
    onSuccess: async (data) => {
      setSecret(data.secret);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const revoke = useMutation({
    mutationFn: (id: number) => apiFetch<{ revoked: boolean }>(`/api/tokens/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  return (
    <Section lead="凭证只在创建瞬间显露完整明文，其后只保留 bcrypt 散列与八位前缀。" plate="PL. II" title="§ 凭证 · PL. II">
      <div className="mb-5 flex flex-wrap justify-end gap-3">
        <Button onClick={() => setOpen(true)} variant="ink">
          新建凭证
        </Button>
      </div>
      {secret ? (
        <div className="mb-5">
          <MonoCode label="TOKEN_SECRET" value={secret} />
        </div>
      ) : null}
      <TableLedger
        columns={[
          {
            key: "name",
            label: "CREDENTIAL",
            render: (row) => (
              <div className="grid gap-1">
                <span className="font-serif text-lg tracking-wide">{row.name}</span>
                <span className="text-sm text-mute">{row.note || "无旁注"}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-mute">{row.prefix}</span>
              </div>
            ),
          },
          {
            key: "quota",
            label: "USAGE",
            render: (row) => <span className="font-mono text-sm">{usageLabel(row)}</span>,
          },
          {
            key: "bound",
            label: "BOUND SUB",
            render: (row) => <span className="font-mono text-sm">{subNames.get(row.subId) ?? `#${row.subId}`}</span>,
          },
          {
            key: "status",
            label: "STATE",
            render: (row) => (
              <div className="grid gap-1 font-mono text-xs uppercase tracking-widest">
                <span>{row.revokedAt ? "REVOKED" : "ACTIVE"}</span>
                <span className="text-mute">{row.expiresAt ? new Date(row.expiresAt).toLocaleString() : "NO EXPIRY"}</span>
              </div>
            ),
          },
          {
            key: "actions",
            label: "ACTION",
            render: (row) => (
              <Button disabled={Boolean(row.revokedAt) || revoke.isPending} onClick={() => revoke.mutate(row.id)} variant="ghost">
                吊销
              </Button>
            ),
          },
        ]}
        empty="凭证簿空白，尚未给任何订阅钤印。"
        getRowKey={(row) => row.id}
        rows={tokens.data?.tokens ?? []}
      />
      <Modal onClose={() => setOpen(false)} open={open} title="§ 新建凭证">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate(new FormData(event.currentTarget));
          }}
        >
          <TextField label="凭证名称" name="name" required />
          <TextField label="备注" name="note" />
          <Select label="绑定订阅" name="subId" required>
            {(subs.data?.subs ?? []).map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="流量上限 GB" min="0.001" name="quotaGb" step="0.001" type="number" />
            <TextField label="过期时间" name="expiresAt" type="datetime-local" />
          </div>
          <TextArea hint="每行一个 IPv4 或 CIDR，留空表示不限制。" label="IP 白名单" name="ipAllow" />
          {create.error ? <p className="border border-cinnabar p-3 text-sm text-cinnabar">{create.error.message}</p> : null}
          <Button disabled={create.isPending || (subs.data?.subs ?? []).length === 0} type="submit" variant="ink">
            钤发凭证
          </Button>
        </form>
      </Modal>
    </Section>
  );
}
