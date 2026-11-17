import type { ButtonHTMLAttributes, PointerEvent } from "react";
import { press, strike } from "./motion.ts";

type Tone = "number" | "red" | "green" | "action" | "active-red" | "active-green" | "active";

const tones: Record<Tone, string> = {
  number: "bg-white text-ink border-ink/15",
  action: "bg-paper text-ink border-ink",
  red: "bg-white text-board-red border-board-red",
  green: "bg-white text-board-green border-board-green",
  "active-red": "bg-board-red text-white border-board-red",
  "active-green": "bg-board-green text-white border-board-green",
  active: "bg-ink text-paper border-ink",
};

export function PadButton({
  tone = "number",
  className = "",
  onPointerDown,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  const animate = (event: PointerEvent<HTMLButtonElement>) => {
    if (tone === "number") strike(event.currentTarget);
    else press(event.currentTarget);
    onPointerDown?.(event);
  };

  return (
    <button
      type="button"
      className={`flex min-h-14 items-center justify-center border-2 text-2xl font-bold tabular-nums transition-[background-color,color,border-color,opacity] duration-150 select-none disabled:opacity-30 ${tones[tone]} ${className}`}
      onPointerDown={animate}
      {...props}
    />
  );
}
