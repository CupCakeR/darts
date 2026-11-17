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
  const button = "min-h-14 w-14 font-display text-2xl transition-opacity disabled:opacity-30";
  return (
    <div className="flex items-center self-start rounded-xs border-2 border-ink bg-key">
      <button
        type="button"
        className={button}
        onPointerDown={animate}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span
        key={value}
        className="min-w-14 animate-pop border-x-2 border-ink py-3 text-center font-display text-2xl tabular-nums"
      >
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
