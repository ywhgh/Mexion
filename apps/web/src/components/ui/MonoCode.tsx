import { useState } from "react";
import { Button } from "./Button";
import { cx } from "../../lib/cx";

export type MonoCodeProps = {
  value: string;
  label?: string;
  multiline?: boolean;
  className?: string;
};

export function MonoCode({ value, label = "复制", multiline = false, className }: MonoCodeProps) {
  const [copied, setCopied] = useState(false);
  async function copy(): Promise<void> {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }
  return (
    <div className={cx("rounded-md border border-border bg-bg-2 p-3", className)}>
      <div className="flex items-start gap-3">
        <code className={cx("flex-1 break-all font-mono text-xs leading-6 text-ink", multiline && "whitespace-pre-wrap")}>{value}</code>
        <Button type="button" variant="secondary" onClick={() => { void copy(); }}>
          {copied ? "已复制" : label}
        </Button>
      </div>
    </div>
  );
}
