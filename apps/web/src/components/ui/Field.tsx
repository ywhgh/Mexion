import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/cx";

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  num?: string;
  hint?: ReactNode;
  wrapperClassName?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, num = "01", hint, id, className, wrapperClassName, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className={cx("field relative block", wrapperClassName)} htmlFor={inputId}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        <span className="field__num inline-flex items-baseline gap-2 before:font-semibold before:text-verm before:content-[attr(data-num)] after:inline-block after:h-px after:w-4 after:bg-border" data-num={num}>
          {label}
        </span>
        {hint && <span className="font-display text-xs italic normal-case tracking-normal text-mute-2">{hint}</span>}
      </span>
      <input
        ref={ref}
        id={inputId}
        {...props}
        className={cx(
          "field__input w-full border-0 border-b border-border bg-transparent px-0 py-2.5 font-display text-base text-ink outline-none transition focus:border-verm focus:pl-2",
          className,
        )}
      />
      <span className="field__underline pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-verm transition-transform peer-focus:scale-x-100" />
    </label>
  );
});
