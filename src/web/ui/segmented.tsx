import { press } from "./motion.ts";

interface Option<T> {
  value: T;
  label: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex overflow-hidden rounded-xs border-2 border-ink bg-key ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onPointerDown={(event) => press(event.currentTarget)}
          onClick={() => onChange(option.value)}
          className={`label-caps min-h-14 flex-1 border-r-2 border-ink px-3 transition-colors duration-150 last:border-r-0 ${
            option.value === value ? "bg-ink text-paper" : "text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
