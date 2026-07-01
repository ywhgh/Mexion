import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

export type CardProps = HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
};

export function Card({ title, eyebrow, actions, children, className, ...props }: CardProps) {
  const labelled = typeof title === "string" ? title : undefined;
  return (
    <section
      aria-label={props["aria-label"] ?? labelled}
      {...props}
      className={cx("card rounded-lg border border-border bg-surface shadow-s1 transition", className)}
    >
      {(title || eyebrow || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-border-2 px-5 py-4">
          <div>
            {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute-2">{eyebrow}</p>}
            {title && <h2 className="mt-1 font-display text-[22px] font-normal leading-none tracking-[-0.025em] text-ink">{title}</h2>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
