import type { ButtonHTMLAttributes, PointerEvent } from "react";
import { press, strike } from "./motion.ts";

type Tone = "number" | "red" | "green" | "action" | "active-red" | "active-green" | "active";

const tones: Record<Tone, string> = {
  number: "bg-key text-ink border-ink",
  action: "bg-paper text-ink border-ink [--rule-gap:var(--color-paper)]",
  red: "bg-key text-board-red border-board-red",
  green: "bg-key text-board-green border-board-green",
  "active-red": "bg-board-red text-white border-board-red [--rule-gap:var(--color-board-red)]",
  "active-green": "bg-board-green text-white border-board-green [--rule-gap:var(--color-board-green)]",
  active: "bg-ink text-paper border-ink [--rule-gap:var(--color-ink)]",
};

type Size = "number" | "label";

const sizes: Record<Size, string> = {
  number: "font-display text-2xl",
  label: "label-caps",
};

export function Key({
  tone = "number",
  size = "number",
  className = "",
  onPointerDown,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size }) {
  const animate = (event: PointerEvent<HTMLButtonElement>) => {
    if (tone === "number") strike(event.currentTarget);
    else press(event.currentTarget);
    onPointerDown?.(event);
  };

  return (
    <button
      type="button"
      className={`double-rule flex min-h-14 items-center justify-center rounded-xs px-2 tabular-nums transition-[background-color,color,border-color,opacity] duration-150 select-none disabled:opacity-30 ${tones[tone]} ${sizes[size]} ${className}`}
      onPointerDown={animate}
      {...props}
    />
  );
}
