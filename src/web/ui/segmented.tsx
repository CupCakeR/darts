import { press } from "./motion.ts";

interface Option<T> {
  value: T;
  label: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex border-2 border-ink">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onPointerDown={(event) => press(event.currentTarget)}
          onClick={() => onChange(option.value)}
          className={`min-h-14 flex-1 px-3 text-lg font-semibold transition-colors duration-150 ${
            option.value === value ? "bg-ink text-paper" : "text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
