import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "./Button";

export type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}>;

export function Modal({ open, title, onClose, footer, children }: ModalProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" role="presentation">
      <section
        aria-modal="true"
        className="w-full max-w-2xl border border-rule bg-paper"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <h2 className="font-serif text-xl font-semibold tracking-wide">{title}</h2>
          <Button aria-label="关闭" onClick={onClose} variant="ghost">
            ×
          </Button>
        </div>
        <div className="p-4">{children}</div>
        {footer ? <div className="border-t border-rule px-4 py-3">{footer}</div> : null}
      </section>
    </div>
  );
}
