import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, id, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className={cx("inline-flex cursor-pointer items-center gap-2 text-sm text-muted", className)} htmlFor={inputId}>
      <input ref={ref} id={inputId} type="checkbox" {...props} className="peer sr-only" />
      <span className="grid h-4 w-4 place-items-center rounded-xs border border-border bg-surface text-[10px] text-on-ink transition peer-checked:border-verm peer-checked:bg-verm" aria-hidden="true">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4.1 3.7 6.6 9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span>{label}</span>
    </label>
  );
});
