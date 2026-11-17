import type { ReactNode } from "react";
import { Link } from "react-router";
import { de } from "../i18n/de.ts";

export function BackLink({ to, label = de.common.back }: { to: string; label?: string }) {
  return (
    <Link to={to} className="text-base italic underline decoration-1 underline-offset-4">
      {label}
    </Link>
  );
}

export function Screen({ title, back, children }: { title: string; back?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl animate-enter flex-col gap-6 p-6">
      <header className="flex items-baseline gap-4">
        {back && <BackLink to={back} />}
        <h1 className="font-display text-3xl">{title}</h1>
      </header>
      {children}
    </main>
  );
}
