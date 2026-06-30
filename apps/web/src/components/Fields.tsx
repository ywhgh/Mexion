import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

const controlBase =
  "w-full border border-rule bg-vellum px-3 py-2 text-sm text-ink transition-colors duration-200 placeholder:text-mute hover:border-cinnabar focus:border-cinnabar focus:outline-none disabled:border-mute disabled:text-mute";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, className, id, ...props }: TextFieldProps): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label className="grid gap-2 text-sm" htmlFor={fieldId}>
      <span className="font-mono text-xs uppercase tracking-widest text-mute">{label}</span>
      <input id={fieldId} className={cx(controlBase, className)} {...props} />
      {hint ? <span className="text-xs leading-5 text-mute">{hint}</span> : null}
    </label>
  );
}

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function TextArea({ label, hint, className, id, ...props }: TextAreaProps): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label className="grid gap-2 text-sm" htmlFor={fieldId}>
      <span className="font-mono text-xs uppercase tracking-widest text-mute">{label}</span>
      <textarea id={fieldId} className={cx(controlBase, "min-h-32 resize-y font-mono", className)} {...props} />
      {hint ? <span className="text-xs leading-5 text-mute">{hint}</span> : null}
    </label>
  );
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
};

export function Select({ label, hint, className, id, children, ...props }: SelectProps): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label className="grid gap-2 text-sm" htmlFor={fieldId}>
      <span className="font-mono text-xs uppercase tracking-widest text-mute">{label}</span>
      <select id={fieldId} className={cx(controlBase, className)} {...props}>
        {children}
      </select>
      {hint ? <span className="text-xs leading-5 text-mute">{hint}</span> : null}
    </label>
  );
}
