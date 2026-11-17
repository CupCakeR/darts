import type { PointerEvent } from "react";
import { press } from "./motion.ts";

const animate = (event: PointerEvent<HTMLButtonElement>) => press(event.currentTarget);

export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const button = "min-h-14 w-14 text-2xl font-bold transition-opacity disabled:opacity-30";
  return (
    <div className="flex items-center border-2 border-ink">
      <button
        type="button"
        className={button}
        onPointerDown={animate}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span key={value} className="min-w-12 animate-pop text-center text-2xl font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={button}
        onPointerDown={animate}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
