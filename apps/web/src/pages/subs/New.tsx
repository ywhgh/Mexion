import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHead, FadeIn } from "../../components/page";
import { Button, Card, Field, MonoCode, Select, TextArea } from "../../components/ui";
import { apiFetch, jsonBody } from "../../lib/api";
import type { SubPublic, TokenPublic } from "../../lib/types";

type CreatedSub = {
  sub: SubPublic;
  token: TokenPublic;
  secret: string;
  outputUrl: string;
};

export function SubsNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rawSources, setRawSources] = useState("");
  const [target, setTarget] = useState<SubPublic["target"]>("clash-meta");
  const [ruleSet, setRuleSet] = useState<SubPublic["ruleSet"]>("none");
  const [renamePrefix, setRenamePrefix] = useState("");
  const [filterRegex, setFilterRegex] = useState("");
  const [created, setCreated] = useState<CreatedSub | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await apiFetch<CreatedSub>("/api/subs", {
        method: "POST",
        body: jsonBody({
          name,
          rawSources: rawSources.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
          target,
          ruleSet,
          renamePrefix,
          filterRegex,
        }),
      });
      setCreated(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead
        crumb={[<span key="subs">Subs</span>, <span key="new">New</span>]}
        title={<>新建 <em>订阅</em></>}
        sub="用编号字段录入原始节点、目标格式与过滤规则。"
        actions={<Button type="button" onClick={() => navigate("/subs")}>返回目录</Button>}
      />
      <FadeIn step={2}>
        <Card title="Source plate" eyebrow="create">
          <form className="grid gap-5" onSubmit={(event) => { void submit(event); }}>
            <Field label="案卷名称" num="01" value={name} onChange={(event) => setName(event.target.value)} required />
            <TextArea label="原始节点" num="02" placeholder="vmess://..." value={rawSources} onChange={(event) => setRawSources(event.target.value)} required />
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="目标客户端" num="03" value={target} onChange={(event) => setTarget(event.target.value as SubPublic["target"])}>
                <option value="clash-meta">clash-meta</option>
                <option value="sing-box">sing-box</option>
                <option value="shadowrocket">shadowrocket</option>
              </Select>
              <Select label="规则集" num="04" value={ruleSet} onChange={(event) => setRuleSet(event.target.value as SubPublic["ruleSet"])}>
                <option value="none">none</option>
                <option value="acl4ssr">acl4ssr</option>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="自定义命名前缀" num="05" value={renamePrefix} onChange={(event) => setRenamePrefix(event.target.value)} />
              <Field label="过滤正则" num="06" value={filterRegex} onChange={(event) => setFilterRegex(event.target.value)} />
            </div>
            <div className="flex justify-end"><Button type="submit" variant="primary" loading={saving}>生成公理化终点</Button></div>
          </form>
          {created && (
            <div className="mt-5 border-t border-border-2 pt-5">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-verm">Generated endpoint</p>
              <MonoCode value={created.outputUrl} label="复制终点" />
              <div className="mt-3 flex justify-end"><Button type="button" onClick={() => navigate(`/subs/${created.sub.id}`)}>打开详情</Button></div>
            </div>
          )}
        </Card>
      </FadeIn>
    </>
  );
}
