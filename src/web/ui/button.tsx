import type { ButtonHTMLAttributes, PointerEvent } from "react";
import { press } from "./motion.ts";

type Variant = "primary" | "plain";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper border-ink [--rule-gap:var(--color-ink)]",
  plain: "bg-key text-ink border-ink",
};

const base =
  "double-rule label-caps flex min-h-14 items-center justify-center gap-2 rounded-xs px-5 transition-opacity duration-150 disabled:opacity-40";

export const linkButton = (variant: Variant) => `${base} ${variants[variant]}`;

export function Button({
  variant = "primary",
  className = "",
  onPointerDown,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const animate = (event: PointerEvent<HTMLButtonElement>) => {
    press(event.currentTarget);
    onPointerDown?.(event);
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} onPointerDown={animate} {...props} />
  );
}
