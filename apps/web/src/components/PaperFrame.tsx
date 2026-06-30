import type { PropsWithChildren } from "react";
import { Header } from "./Header";

export function PaperFrame({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className="min-h-screen bg-paper p-3 text-ink sm:p-6">
      <div className="mx-auto min-h-[calc(100vh-3rem)] max-w-7xl border border-rule bg-vellum">
        <Header />
        <main className="px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
