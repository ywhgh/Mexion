import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  num?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, num = "01", id, className, children, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted before:font-semibold before:text-verm before:content-[attr(data-num)]" data-num={num}>{label}</span>
      <select
        ref={ref}
        id={inputId}
        {...props}
        className={cx("h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none transition focus:border-verm", className)}
      >
        {children}
      </select>
    </label>
  );
});
