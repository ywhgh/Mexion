import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/api/client";
import { Button, MonoCode, Section, Select, TableLedger, TextArea, TextField } from "@/components";

type TargetFormat = "clash-meta" | "sing-box" | "shadowrocket";
type RuleSet = "none" | "acl4ssr";

type TokenView = {
  id: number;
  name: string;
  prefix: string;
  usedBytes: number;
  quotaBytes: number | null;
};

export type SubView = {
  id: number;
  name: string;
  rawSources: string[];
  target: TargetFormat;
  ruleSet: RuleSet;
  renamePrefix: string;
  filterRegex: string;
  createdAt: string;
  updatedAt: string;
  tokens: TokenView[];
};

type SubPayload = {
  sub: SubView;
  token?: TokenView;
  secret?: string;
  outputUrl?: string;
};

function splitSources(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function targetLabel(target: TargetFormat): string {
  if (target === "clash-meta") {
    return "Clash Meta";
  }
  if (target === "sing-box") {
    return "Sing-box";
  }
  return "Shadowrocket";
}

export function SubsListPage(): JSX.Element {
  const subs = useQuery({
    queryKey: ["subs"],
    queryFn: () => apiFetch<{ subs: SubView[] }>("/api/subs"),
  });

  return (
    <Section
      lead="将散落的节点订阅整理为面向客户端的公理化终点。"
      plate="PL. I"
      title="§ 订阅 · PL. I"
    >
      <div className="mb-5 flex justify-end">
        <Link to="/subs/new">
          <Button variant="ink">新建订阅</Button>
        </Link>
      </div>
      <TableLedger
        columns={[
          {
            key: "name",
            label: "CONFIG",
            render: (row) => (
              <div className="grid gap-1">
                <Link className="font-serif text-lg tracking-wide hover:text-cinnabar" to={`/subs/${row.id}`}>
                  {row.name}
                </Link>
                <span className="font-mono text-xs uppercase tracking-widest text-mute">
                  {targetLabel(row.target)} · {row.ruleSet}
                </span>
              </div>
            ),
          },
          {
            key: "sources",
            label: "SOURCES",
            render: (row) => <span className="font-mono text-sm">{row.rawSources.length}</span>,
          },
          {
            key: "tokens",
            label: "TOKENS",
            render: (row) => (
              <span className="font-mono text-sm">{row.tokens.map((token) => token.prefix).join(", ") || "未钤"}</span>
            ),
          },
        ]}
        empty="尚无订阅案卷，先录入一组原始节点。"
        getRowKey={(row) => row.id}
        rows={subs.data?.subs ?? []}
      />
    </Section>
  );
}

export function SubsNewPage(): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (form: FormData) =>
      apiFetch<SubPayload>("/api/subs", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          rawSources: splitSources(String(form.get("rawSources") ?? "")),
          target: String(form.get("target") ?? "clash-meta"),
          ruleSet: String(form.get("ruleSet") ?? "none"),
          renamePrefix: String(form.get("renamePrefix") ?? ""),
          filterRegex: String(form.get("filterRegex") ?? ""),
        }),
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["subs"] });
      window.history.replaceState(null, "", `/subs/${data.sub.id}`);
    },
  });

  return (
    <Section lead="输入原始订阅或节点链接，Axion 将去重、命名并发行可拉取终点。" plate="PL. I" title="§ 新建订阅">
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate(new FormData(event.currentTarget));
        }}
      >
        <TextField label="案卷名称" name="name" placeholder="Daily Routes" required />
        <TextArea
          hint="每行一条 vmess、vless、ss、trojan、hysteria2 或 HTTP 订阅。"
          label="原始链接"
          name="rawSources"
          placeholder="vmess://..."
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="目标客户端" name="target">
            <option value="clash-meta">Clash Meta</option>
            <option value="sing-box">Sing-box</option>
            <option value="shadowrocket">Shadowrocket</option>
          </Select>
          <Select label="规则策略" name="ruleSet">
            <option value="none">无分流</option>
            <option value="acl4ssr">ACL4SSR</option>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="自定义命名前缀" name="renamePrefix" placeholder="AXION" />
          <TextField label="节点过滤正则" name="filterRegex" placeholder="HK|SG" />
        </div>
        {create.error ? <p className="border border-cinnabar p-3 text-sm text-cinnabar">{create.error.message}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button disabled={create.isPending} type="submit" variant="ink">
            生成公理化终点
          </Button>
          <Button onClick={() => navigate("/subs")} variant="ghost">
            返回目录
          </Button>
        </div>
      </form>
      {create.data?.outputUrl ? (
        <div className="mt-6">
          <MonoCode value={create.data.outputUrl} />
        </div>
      ) : null}
    </Section>
  );
}

export function SubDetailPage(): JSX.Element {
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const sub = useQuery({
    queryKey: ["subs", id],
    queryFn: () => apiFetch<{ sub: SubView }>(`/api/subs/${id}`),
    enabled: Number.isInteger(id),
  });
  const update = useMutation({
    mutationFn: (form: FormData) =>
      apiFetch<{ sub: SubView }>(`/api/subs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          rawSources: splitSources(String(form.get("rawSources") ?? "")),
          target: String(form.get("target") ?? "clash-meta"),
          ruleSet: String(form.get("ruleSet") ?? "none"),
          renamePrefix: String(form.get("renamePrefix") ?? ""),
          filterRegex: String(form.get("filterRegex") ?? ""),
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subs", id] });
      await queryClient.invalidateQueries({ queryKey: ["subs"] });
    },
  });
  const remove = useMutation({
    mutationFn: () => apiFetch<{ deleted: boolean }>(`/api/subs/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subs"] });
      navigate("/subs");
    },
  });

  if (!sub.data) {
    return <Section plate="PL. I" title="§ 订阅读取中" />;
  }

  const value = sub.data.sub;
  const prefix = value.tokens[0]?.prefix ?? "ax_xxxxx";

  return (
    <Section lead="编辑原始链接与输出格式。完整 Token 只在创建瞬间展示，后续以 prefix 辨识。" plate="PL. I" title="§ 订阅 · 详情">
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate(new FormData(event.currentTarget));
        }}
      >
        <TextField defaultValue={value.name} label="案卷名称" name="name" required />
        <TextArea defaultValue={value.rawSources.join("\n")} label="原始链接" name="rawSources" required />
        <div className="grid gap-4 md:grid-cols-2">
          <Select defaultValue={value.target} label="目标客户端" name="target">
            <option value="clash-meta">Clash Meta</option>
            <option value="sing-box">Sing-box</option>
            <option value="shadowrocket">Shadowrocket</option>
          </Select>
          <Select defaultValue={value.ruleSet} label="规则策略" name="ruleSet">
            <option value="none">无分流</option>
            <option value="acl4ssr">ACL4SSR</option>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField defaultValue={value.renamePrefix} label="自定义命名前缀" name="renamePrefix" />
          <TextField defaultValue={value.filterRegex} label="节点过滤正则" name="filterRegex" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button disabled={update.isPending} type="submit" variant="ink">
            保存订阅
          </Button>
          <Button disabled={remove.isPending} onClick={() => remove.mutate()} variant="ghost">
            删除订阅
          </Button>
        </div>
      </form>
      <div className="mt-6">
        <MonoCode label="TOKEN_PREFIX" value={`${window.location.origin}/v1/sub?token=${prefix}…`} />
      </div>
    </Section>
  );
}
