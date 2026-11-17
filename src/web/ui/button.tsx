import type { ButtonHTMLAttributes, PointerEvent } from "react";
import { press } from "./motion.ts";

type Variant = "primary" | "plain";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper",
  plain: "border-2 border-ink text-ink",
};

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
    <button
      className={`min-h-14 px-5 text-lg font-semibold transition-opacity duration-150 disabled:opacity-40 ${variants[variant]} ${className}`}
      onPointerDown={animate}
      {...props}
    />
  );
}
