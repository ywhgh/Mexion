import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

export type IconBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconBtn({ label, children, className, ...props }: IconBtnProps) {
  return (
    <button
      aria-label={label}
      title={label}
      {...props}
      className={cx(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-border bg-surface px-2 text-muted transition hover:border-mute-3 hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
