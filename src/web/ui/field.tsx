import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="label-caps opacity-70">{label}</h2>
      {children}
      {hint && <p className="text-sm italic opacity-70">{hint}</p>}
    </section>
  );
}
