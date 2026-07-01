import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type PillTone = "ok" | "err" | "warn" | "recovered" | "neutral";
export type PillProps = HTMLAttributes<HTMLSpanElement> & { tone?: PillTone };

const toneClass: Record<PillTone, string> = {
  ok: "bg-green-soft text-green",
  err: "bg-verm-soft text-verm",
  warn: "bg-amber-soft text-amber",
  recovered: "bg-blue-soft text-blue",
  neutral: "bg-bg-2 text-muted",
};

const dotClass: Record<PillTone, string> = {
  ok: "bg-green",
  err: "bg-verm",
  warn: "bg-amber",
  recovered: "bg-blue",
  neutral: "bg-mute-2",
};

export function Pill({ tone = "neutral", children, className, ...props }: PillProps) {
  return (
    <span {...props} className={cx("inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[10px] font-medium", toneClass[tone], className)}>
      <span className={cx("h-1.5 w-1.5 rounded-full", dotClass[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}
