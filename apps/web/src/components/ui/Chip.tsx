import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
  count?: number | string;
};

export function Chip({ pressed = false, count, children, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      {...props}
      className={cx(
        "inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-bg-2 hover:text-ink aria-pressed:bg-ink aria-pressed:text-on-ink",
        className,
      )}
    >
      <span>{children}</span>
      {count !== undefined && <span className="font-mono text-[10px] opacity-70">{count}</span>}
    </button>
  );
}
