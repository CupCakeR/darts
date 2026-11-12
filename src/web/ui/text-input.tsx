import type { InputHTMLAttributes } from "react";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-14 border-2 border-ink bg-white px-4 text-lg outline-none focus:border-board-green ${className}`}
      {...props}
    />
  );
}
