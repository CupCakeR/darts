import type { Dart, Multiplier } from "#engine";
import { useState } from "react";
import { de } from "../../i18n/de.ts";
import { PadButton } from "../../ui/pad-button.tsx";

const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);
const PREFIX: Record<Multiplier, string> = { 1: "", 2: "D", 3: "T" };

export function DartPad({ onDart, disabled }: { onDart: (dart: Dart) => void; disabled: boolean }) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const toggle = (value: Multiplier) => setMultiplier((current) => (current === value ? 1 : value));

  const send = (dart: Dart) => {
    onDart(dart);
    setMultiplier(1);
  };

  return (
    <div className="grid h-full grid-cols-5 grid-rows-[repeat(6,minmax(3.5rem,1fr))] gap-1.5">
      <PadButton
        className="col-span-2"
        tone={multiplier === 2 ? "active-red" : "red"}
        onClick={() => toggle(2)}
        disabled={disabled}
      >
        {de.game.double}
      </PadButton>
      <PadButton
        className="col-span-2"
        tone={multiplier === 3 ? "active-green" : "green"}
        onClick={() => toggle(3)}
        disabled={disabled}
      >
        {de.game.triple}
      </PadButton>
      <PadButton tone="action" onClick={() => send({ segment: 0, multiplier: 1 })} disabled={disabled}>
        {de.game.miss}
      </PadButton>
      {NUMBERS.map((segment) => (
        <PadButton key={segment} onClick={() => send({ segment, multiplier })} disabled={disabled}>
          <span key={multiplier} className={multiplier === 1 ? "" : "animate-pop"}>
            {PREFIX[multiplier]}
            {segment}
          </span>
        </PadButton>
      ))}
      <PadButton
        className="col-span-2"
        tone="green"
        onClick={() => send({ segment: 25, multiplier: 1 })}
        disabled={disabled || multiplier === 3}
      >
        25
      </PadButton>
      <PadButton
        className="col-span-3"
        tone="red"
        onClick={() => send({ segment: 25, multiplier: 2 })}
        disabled={disabled}
      >
        Bull
      </PadButton>
    </div>
  );
}
