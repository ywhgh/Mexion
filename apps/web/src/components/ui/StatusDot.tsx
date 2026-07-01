import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type StatusTone = "ok" | "err" | "warn" | "idle";
export type StatusDotProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
  label?: string;
};

const toneClass: Record<StatusTone, string> = {
  ok: "bg-green",
  err: "bg-verm",
  warn: "bg-amber",
  idle: "bg-mute-2",
};

export function StatusDot({ tone = "idle", label, className, ...props }: StatusDotProps) {
  return (
    <span {...props} className={cx("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <span className="relative inline-flex h-2 w-2" aria-hidden="true">
        <span className={cx("absolute inline-flex h-full w-full rounded-full opacity-40", toneClass[tone])} />
        <span className={cx("relative inline-flex h-2 w-2 rounded-full", toneClass[tone])} />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
