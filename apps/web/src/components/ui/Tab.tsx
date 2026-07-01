import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
};

export function Tab({ pressed = false, children, className, ...props }: TabProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      {...props}
      className={cx("tab relative px-3 py-2 text-sm font-medium text-muted transition hover:text-ink aria-pressed:text-ink", className)}
    >
      {children}
    </button>
  );
}
