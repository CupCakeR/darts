import { useEffect, useRef, useState, type ReactNode } from "react";
import { de } from "../i18n/de.ts";
import { press } from "./motion.ts";

function useDismiss(open: boolean, onDismiss: () => void, container: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onDismiss, container]);
}

function InfoPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLSpanElement>(null);
  useDismiss(open, () => setOpen(false), container);

  return (
    <span ref={container} className="relative inline-flex">
      <button
        type="button"
        aria-label={de.common.info}
        aria-expanded={open}
        onPointerDown={(event) => press(event.currentTarget)}
        onClick={() => setOpen((current) => !current)}
        className={`flex size-7 items-center justify-center rounded-full border-2 border-ink font-display text-sm leading-none transition-colors duration-150 ${
          open ? "bg-ink text-paper" : "bg-key text-ink"
        }`}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full left-1/2 z-20 mt-2 w-72 origin-top -translate-x-1/2 animate-pop rounded-xs bg-ink px-4 py-3 text-base font-normal normal-case text-paper italic tracking-normal"
        >
          {text}
        </span>
      )}
    </span>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-h-7 items-center gap-3">
        <h2 className="label-caps opacity-70">{label}</h2>
        {hint && <InfoPopover text={hint} />}
      </div>
      {children}
    </section>
  );
}
