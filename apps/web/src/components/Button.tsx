import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type ButtonVariant = "cinnabar" | "ink" | "ghost";

const variants: Record<ButtonVariant, string> = {
  cinnabar: "border-cinnabar bg-cinnabar text-white hover:border-ink hover:bg-ink hover:text-white",
  ink: "border-ink bg-ink text-white hover:border-cinnabar hover:bg-cinnabar hover:text-white",
  ghost: "border-rule bg-transparent text-ink hover:border-cinnabar hover:text-cinnabar",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "ghost", className, type = "button", ...props }: ButtonProps): JSX.Element {
  return (
    <button
      className={cx(
        "border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-200 focus:border-cinnabar focus:outline-none disabled:border-mute disabled:bg-paper disabled:text-mute",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
