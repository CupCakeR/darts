import type { ReactNode } from "react";

export function Board({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`surface-wood p-3 ${className}`}>
      <div className="surface-slate flex h-full flex-col p-2">{children}</div>
    </div>
  );
}
