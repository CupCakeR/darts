import type { ReactNode } from "react";

export function Stamp({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
      <span className="double-rule animate-stamp border-board-red bg-paper px-8 font-display text-[10rem] leading-none text-board-red tabular-nums [--rule-gap:var(--color-paper)]">
        {children}
      </span>
    </div>
  );
}
