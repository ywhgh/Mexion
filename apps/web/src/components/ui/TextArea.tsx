import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  num?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, num = "01", id, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className="field relative block" htmlFor={inputId}>
      <span className="mb-1.5 flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted before:font-semibold before:text-verm before:content-[attr(data-num)]" data-num={num}>{label}</span>
      <textarea
        ref={ref}
        id={inputId}
        {...props}
        className={cx("min-h-32 w-full rounded-md border border-border bg-surface px-3 py-3 font-mono text-sm text-ink outline-none transition focus:border-verm", className)}
      />
    </label>
  );
});
