import type { InputHTMLAttributes } from "react";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-14 rounded-xs border-2 border-ink bg-key px-4 text-lg outline-none transition-colors duration-150 focus:border-board-green ${className}`}
      {...props}
    />
  );
}
