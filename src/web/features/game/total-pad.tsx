import { findCheckout, isPossibleTurnScore, type Rule } from "#engine";
import { useState } from "react";
import { de } from "../../i18n/de.ts";
import { PadButton } from "../../ui/pad-button.tsx";

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
      <div className="flex h-full flex-col gap-3">
        <p className="text-xl font-bold">{de.game.howManyDarts}</p>
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          {([1, 2, 3] as const).map((darts) => (
            <PadButton
              key={darts}
              disabled={!findCheckout(remaining, darts, outRule)}
              onClick={() => {
                setCheckoutScore(null);
                onTotal(checkoutScore, darts);
              }}
            >
              {darts}
            </PadButton>
          ))}
        </div>
        <PadButton tone="action" onClick={() => setCheckoutScore(null)}>
          {de.game.cancelEdit}
        </PadButton>
      </div>
    );
  }

  const type = (digit: string) => setDigits((current) => (current.length < 3 ? current + digit : current));

  return (
    <div className="grid h-full grid-cols-3 grid-rows-[auto_repeat(7,minmax(3rem,1fr))] gap-1.5">
      <output
        className={`col-span-3 border-2 border-ink bg-white px-4 text-right text-5xl font-black tabular-nums ${
          digits && !isPossibleTurnScore(score) ? "text-board-red" : ""
        }`}
      >
        {digits || "0"}
      </output>
      {PRESETS.map((preset) => (
        <PadButton key={preset} tone="action" disabled={disabled} onClick={() => submit(preset)}>
          {preset}
        </PadButton>
      ))}
      {DIGITS.map((digit) => (
        <PadButton key={digit} disabled={disabled} onClick={() => type(digit)}>
          {digit}
        </PadButton>
      ))}
      <PadButton
        tone="action"
        disabled={!digits}
        onClick={() => setDigits((current) => current.slice(0, -1))}
      >
        ⌫
      </PadButton>
      <PadButton disabled={disabled} onClick={() => type("0")}>
        0
      </PadButton>
      <PadButton
        tone="active"
        disabled={disabled || !isPossibleTurnScore(score)}
        onClick={() => submit(score)}
      >
        {de.game.enter}
      </PadButton>
    </div>
  );
}
