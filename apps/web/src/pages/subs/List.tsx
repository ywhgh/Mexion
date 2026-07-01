import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHead, FadeIn } from "../../components/page";
import { Button, Card, Ledger, Pill } from "../../components/ui";
import { apiFetch } from "../../lib/api";
import type { SubPublic } from "../../lib/types";

function fmt(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function SubsList() {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["subs"], queryFn: async () => apiFetch<{ subs: SubPublic[] }>("/api/subs") });
  const rows = query.data?.subs ?? [];
  return (
    <>
      <PageHead
        crumb={[<span key="root">Overview</span>, <span key="subs">Subs</span>]}
        title={<>订阅 <em>案卷</em></>}
        sub="原始节点集合、目标客户端格式与签发凭证的总目录。"
        actions={<Button type="button" variant="primary" onClick={() => navigate("/subs/new")}>新建订阅</Button>}
      />
      <FadeIn step={2}>
        <Card title="Ledger" eyebrow="subscriptions">
          <Ledger
            rows={rows}
            getRowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/subs/${row.id}`)}
            empty={query.isLoading ? "载入中" : "尚未建立订阅"}
            columns={[
              { key: "id", label: "#", render: (row) => <span className="font-mono text-mute-2">{row.id}</span> },
              { key: "name", label: "名称", render: (row) => <span className="font-medium text-ink">{row.name}</span> },
              { key: "target", label: "目标", render: (row) => <Pill tone="recovered">{row.target}</Pill> },
              { key: "rule", label: "规则", render: (row) => <span className="font-mono text-xs">{row.ruleSet}</span> },
              { key: "tokens", label: "Token 数", render: (row) => <span className="font-mono text-xs">{row.tokens.length}</span> },
              { key: "updated", label: "更新时间", render: (row) => <span className="text-muted">{fmt(row.updatedAt)}</span> },
            ]}
          />
        </Card>
      </FadeIn>
    </>
  );
}
