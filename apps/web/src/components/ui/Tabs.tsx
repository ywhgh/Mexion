import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export function Tabs({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist" {...props} className={cx("inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1", className)}>
      {children}
    </div>
  );
}
