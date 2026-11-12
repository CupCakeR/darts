import type { ReactNode } from "react";
import { Link } from "react-router";
import { de } from "../i18n/de.ts";

export function Screen({ title, back, children }: { title: string; back?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center gap-4">
        {back && (
          <Link to={back} className="text-lg underline underline-offset-4">
            {de.common.back}
          </Link>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
      </header>
      {children}
    </main>
  );
}
