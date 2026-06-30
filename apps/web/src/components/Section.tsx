import type { PropsWithChildren } from "react";

export type SectionProps = PropsWithChildren<{
  title: string;
  plate?: string;
  lead?: string;
}>;

export function Section({ title, plate, lead, children }: SectionProps): JSX.Element {
  return (
    <section className="border border-rule bg-paper">
      <div className="flex flex-col gap-3 border-b border-rule px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {plate ? <div className="font-mono text-xs uppercase tracking-widest text-mute">{plate}</div> : null}
          <h1 className="font-serif text-2xl font-semibold tracking-wide sm:text-3xl">{title}</h1>
        </div>
        {lead ? <p className="max-w-[70ch] text-sm leading-6 text-mute">{lead}</p> : null}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
