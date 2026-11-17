import { findCheckout, isPossibleTurnScore, type Rule } from "#engine";
import { useState } from "react";
import { de } from "../../i18n/de.ts";
import { Key } from "../../ui/key.tsx";

const PRESETS = [26, 41, 45, 60, 81, 85, 100, 140, 180];
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

interface Props {
  remaining: number;
  outRule: Rule;
  disabled: boolean;
  onTotal: (score: number, darts: 1 | 2 | 3) => void;
}

export function TotalPad({ remaining, outRule, disabled, onTotal }: Props) {
  const [digits, setDigits] = useState("");
  const [checkoutScore, setCheckoutScore] = useState<number | null>(null);
  const score = Number(digits || "0");

  const submit = (value: number) => {
    setDigits("");
    if (value !== remaining) return onTotal(value, 3);
    const dartOptions = ([1, 2, 3] as const).filter((darts) => findCheckout(remaining, darts, outRule));
    if (dartOptions.length === 1) return onTotal(value, dartOptions[0]!);
    setCheckoutScore(value);
  };

  if (checkoutScore !== null) {
    return (
      <div className="flex h-full animate-enter flex-col gap-3">
        <p className="font-display text-xl">{de.game.howManyDarts}</p>
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          {([1, 2, 3] as const).map((darts) => (
            <Key
              key={darts}
              disabled={!findCheckout(remaining, darts, outRule)}
              onClick={() => {
                setCheckoutScore(null);
                onTotal(checkoutScore, darts);
              }}
            >
              {darts}
            </Key>
          ))}
        </div>
        <Key tone="action" size="label" onClick={() => setCheckoutScore(null)}>
          {de.game.cancelEdit}
        </Key>
      </div>
    );
  }

  const type = (digit: string) => setDigits((current) => (current.length < 3 ? current + digit : current));

  return (
    <div className="grid h-full grid-cols-3 grid-rows-[auto_repeat(7,minmax(3rem,1fr))] gap-1.5">
      <output
        className={`col-span-3 overflow-hidden rounded-xs border-2 border-ink bg-key px-4 text-right font-display text-5xl tabular-nums transition-colors ${
          digits && !isPossibleTurnScore(score) ? "animate-shake text-board-red" : ""
        }`}
      >
        {digits.slice(0, -1)}
        <span key={digits} className="inline-block animate-pop">
          {digits.slice(-1) || "0"}
        </span>
      </output>
      {PRESETS.map((preset) => (
        <Key key={preset} tone="action" disabled={disabled} onClick={() => submit(preset)}>
          {preset}
        </Key>
      ))}
      {DIGITS.map((digit) => (
        <Key key={digit} disabled={disabled} onClick={() => type(digit)}>
          {digit}
        </Key>
      ))}
      <Key tone="action" disabled={!digits} onClick={() => setDigits((current) => current.slice(0, -1))}>
        ⌫
      </Key>
      <Key disabled={disabled} onClick={() => type("0")}>
        0
      </Key>
      <Key tone="active" disabled={disabled || !isPossibleTurnScore(score)} onClick={() => submit(score)}>
        {de.game.enter}
      </Key>
    </div>
  );
}
