import type { ReactNode } from "react";

export type DataRowProps = {
  label: string;
  value: ReactNode;
};

export function DataRow({ label, value }: DataRowProps): JSX.Element {
  return (
    <div className="grid gap-2 border-b border-dashed border-mute py-3 sm:grid-cols-[14rem_1fr]">
      <dt className="font-mono text-xs uppercase tracking-widest text-mute">{label}</dt>
      <dd className="font-mono text-sm text-ink">{value}</dd>
    </div>
  );
}
