import type { ReactNode } from "react";

export function Stamp({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
      <span className="animate-stamp border-8 border-board-red bg-paper px-8 text-[10rem] leading-none font-black text-board-red tabular-nums">
        {children}
      </span>
    </div>
  );
}
