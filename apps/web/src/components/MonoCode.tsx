import { useState } from "react";
import { Button } from "./Button";

export type MonoCodeProps = {
  value: string;
  label?: string;
};

export function MonoCode({ value, label = "OUTPUT_URL" }: MonoCodeProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="border border-rule bg-vellum">
      <div className="border-b border-rule px-3 py-2 font-mono text-xs uppercase tracking-widest text-mute">
        {label}:
      </div>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <code className="break-all font-mono text-sm text-ink">{value}</code>
        <Button onClick={copy} variant="ghost">
          {copied ? "已钤印" : "复制凭证"}
        </Button>
      </div>
    </div>
  );
}
