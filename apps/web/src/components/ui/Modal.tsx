import type { ReactNode } from "react";
import { Button } from "./Button";

export type ModalProps = {
  open: boolean;
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, sub, children, footer, onClose }: ModalProps) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-s2">
        <header className="flex items-start justify-between gap-4 border-b border-border-2 bg-surface-2 px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-verm">Axion Plate</p>
            <h2 id="modal-title" className="mt-1 font-display text-2xl font-normal tracking-[-0.025em] text-ink">{title}</h2>
            {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
          </div>
          <button type="button" aria-label="关闭" onClick={onClose} className="rounded-md border border-border bg-surface p-2 text-muted transition hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="px-5 py-5">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-border-2 bg-surface-2 px-5 py-4">
          {footer ?? <Button onClick={onClose}>关闭</Button>}
        </footer>
      </section>
    </div>
  );
}
