import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "plain";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper",
  plain: "border-2 border-ink text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-14 px-5 text-lg font-semibold active:translate-y-px disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
