import { useState, type ReactNode } from "react";
import { de } from "../i18n/de.ts";
import { press } from "./motion.ts";

function InfoToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={de.common.info}
      aria-expanded={open}
      onPointerDown={(event) => press(event.currentTarget)}
      onClick={onToggle}
      className={`flex size-7 items-center justify-center rounded-full border-2 border-ink font-display text-sm leading-none transition-colors duration-150 ${
        open ? "bg-ink text-paper" : "bg-key text-ink"
      }`}
    >
      i
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-h-7 items-center gap-3">
        <h2 className="label-caps opacity-70">{label}</h2>
        {hint && <InfoToggle open={open} onToggle={() => setOpen((current) => !current)} />}
      </div>
      {hint && open && (
        <p className="animate-enter rounded-xs border-2 border-ink bg-key px-4 py-3 text-base italic">
          {hint}
        </p>
      )}
      {children}
    </section>
  );
}
