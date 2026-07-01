import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-ink bg-ink text-on-ink hover:border-verm hover:bg-verm hover:shadow-s2 hover:-translate-y-px",
  secondary: "border-border bg-surface text-ink hover:border-mute-3 hover:bg-bg-2",
  danger: "border-verm bg-verm text-on-ink hover:border-verm-2 hover:bg-verm-2 hover:shadow-s2 hover:-translate-y-px",
  ghost: "border-transparent bg-transparent text-muted hover:bg-bg-2 hover:text-ink",
};

export function Button({ variant = "secondary", loading = false, icon, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cx(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        className,
      )}
    >
      {icon}
      <span>{loading ? "处理中" : children}</span>
    </button>
  );
}
