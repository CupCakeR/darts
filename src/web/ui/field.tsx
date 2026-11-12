import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-bold tracking-wide uppercase">{label}</h2>
      {children}
    </section>
  );
}
