import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FadeIn, PageHead } from "../../components/page";
import { Button, Card, Ledger, Modal, MonoCode, Pill } from "../../components/ui";
import { apiFetch } from "../../lib/api";
import type { SubPublic, TokenPublic } from "../../lib/types";

function tokenUrl(token: TokenPublic | undefined): string | null {
  if (!token) return null;
  return `${window.location.origin}/v1/sub?token=${token.prefix}********`;
}

export function SubsDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const id = Number(params.id);
  const query = useQuery({ queryKey: ["sub", id], queryFn: async () => apiFetch<{ sub: SubPublic }>(`/api/subs/${id}`), enabled: Number.isInteger(id) && id > 0 });
  const sub = query.data?.sub;
  const firstToken = sub?.tokens[0];
  const url = tokenUrl(firstToken);

  async function remove(): Promise<void> {
    await apiFetch<{ deleted: true }>(`/api/subs/${id}`, { method: "DELETE" });
    navigate("/subs", { replace: true });
  }

  return (
    <>
      <PageHead
        crumb={[<Link key="subs" to="/subs">Subs</Link>, <span key="id">#{id}</span>]}
        title={<>{sub?.name ?? "订阅"} <em>详情</em></>}
        sub="公开订阅 URL、关联凭证与源节点摘要。"
        actions={<Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>删除订阅</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
        <FadeIn step={2}>
          <Card title="Endpoint" eyebrow={sub?.target ?? "loading"}>
            {url ? <MonoCode value={url} label="复制示例" /> : <div className="rounded-md border border-dashed border-border p-6 text-center text-muted">未签发凭证</div>}
            <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">规则</dt><dd className="mt-1 font-mono">{sub?.ruleSet ?? "..."}</dd></div>
              <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">前缀</dt><dd className="mt-1 font-mono">{sub?.renamePrefix || "none"}</dd></div>
              <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">过滤</dt><dd className="mt-1 font-mono">{sub?.filterRegex || "none"}</dd></div>
              <div className="rounded-md bg-surface-2 p-3"><dt className="text-muted">源数量</dt><dd className="mt-1 font-mono">{sub?.rawSources.length ?? 0}</dd></div>
            </dl>
          </Card>
        </FadeIn>
        <FadeIn step={3}>
          <Card title="Sources" eyebrow="raw">
            <div className="space-y-2">
              {(sub?.rawSources ?? []).map((source, index) => <MonoCode key={`${source}-${index}`} value={source} label="复制" />)}
              {!sub && <p className="text-muted">载入中</p>}
            </div>
          </Card>
        </FadeIn>
      </div>
      <FadeIn step={4} className="mt-4">
        <Card title="Tokens" eyebrow="bound credentials">
          <Ledger
            rows={sub?.tokens ?? []}
            getRowKey={(row) => row.id}
            empty="未签发凭证"
            columns={[
              { key: "prefix", label: "PREFIX", render: (row) => <span className="font-mono">{row.prefix}</span> },
              { key: "name", label: "名称", render: (row) => row.name },
              { key: "status", label: "状态", render: (row) => <Pill tone={row.revokedAt ? "err" : "ok"}>{row.revokedAt ? "revoked" : "active"}</Pill> },
              { key: "used", label: "用量", render: (row) => <span className="font-mono text-xs">{row.usedBytes}/{row.quotaBytes ?? "∞"}</span> },
              { key: "created", label: "创建", render: (row) => <span className="text-muted">{new Date(row.createdAt).toLocaleString()}</span> },
            ]}
          />
        </Card>
      </FadeIn>
      <Modal open={confirmDelete} title="删除订阅" sub="此操作会连带移除绑定凭证。" onClose={() => setConfirmDelete(false)} footer={<><Button type="button" onClick={() => setConfirmDelete(false)}>取消</Button><Button type="button" variant="danger" onClick={() => { void remove(); }}>确认删除</Button></>}>
        <p className="text-sm text-muted">确认删除 {sub?.name ?? `#${id}`}？</p>
      </Modal>
    </>
  );
}
