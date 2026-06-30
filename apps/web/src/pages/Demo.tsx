import { Button, DataRow, MonoCode, Section, TextArea, TextField } from "@/components";

const tokens = [
  { name: "paper", className: "bg-paper" },
  { name: "vellum", className: "bg-vellum" },
  { name: "ink", className: "bg-ink" },
  { name: "mute", className: "bg-mute" },
  { name: "rule", className: "bg-rule" },
  { name: "cinnabar", className: "bg-cinnabar" },
  { name: "white", className: "bg-white" },
] as const;

export function Demo(): JSX.Element {
  return (
    <Section
      lead="宣纸底、墨黑字、朱砂点睛。此页作为 Axion 视觉基线，任何偏离都应回到这里校准。"
      plate="PL. 0"
      title="§ 一、Axion 设计样本"
    >
      <div className="grid gap-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tokens.map((token) => (
            <div className="border border-rule bg-vellum p-3" key={token.name}>
              <div className={`mb-3 h-12 border border-rule ${token.className}`} />
              <div className="font-mono text-xs uppercase tracking-widest">{token.name}</div>
            </div>
          ))}
        </div>
        <dl className="border border-rule px-4">
          <DataRow label="SERIF" value="Noto Serif SC · § 公理化终点" />
          <DataRow label="MONO" value="JetBrains Mono · ax_7fd9023a" />
          <DataRow label="SANS" value="系统正文 · 用最少词完成最明确的操作" />
        </dl>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="节点题名" placeholder="HK · Journal Line" />
          <TextArea label="原始订阅" placeholder="vmess://..." />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="cinnabar">朱砂主按钮</Button>
          <Button variant="ink">反白按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
        </div>
        <MonoCode value="https://example.local/v1/sub?token=ax_7fd9023a" />
      </div>
    </Section>
  );
}
