import type { Dart, Multiplier } from "#engine";
import { useState } from "react";
import { de } from "../../i18n/de.ts";
import { Key } from "../../ui/key.tsx";

const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);
const PREFIX: Record<Multiplier, string> = { 1: "", 2: "D", 3: "T" };

export function DartPad({ onDart, disabled }: { onDart: (dart: Dart) => void; disabled: boolean }) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);

  const send = (dart: Dart) => {
    onDart(dart);
    setMultiplier(1);
  };

  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        <Key
          size="label"
          tone={multiplier === 1 ? "active" : "number"}
          onClick={() => setMultiplier(1)}
          disabled={disabled}
        >
          {de.game.single}
        </Key>
        <Key
          size="label"
          tone={multiplier === 2 ? "active-red" : "red"}
          onClick={() => setMultiplier(2)}
          disabled={disabled}
        >
          {de.game.double}
        </Key>
        <Key
          size="label"
          tone={multiplier === 3 ? "active-green" : "green"}
          onClick={() => setMultiplier(3)}
          disabled={disabled}
        >
          {de.game.triple}
        </Key>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-[repeat(5,minmax(3.5rem,1fr))] gap-1.5">
        {NUMBERS.map((segment) => (
          <Key key={segment} onClick={() => send({ segment, multiplier })} disabled={disabled}>
            <span key={multiplier} className={multiplier === 1 ? "" : "animate-pop"}>
              {PREFIX[multiplier]}
              {segment}
            </span>
          </Key>
        ))}
        <Key
          tone="green"
          onClick={() => send({ segment: 25, multiplier: 1 })}
          disabled={disabled || multiplier === 3}
        >
          25
        </Key>
        <Key tone="red" onClick={() => send({ segment: 25, multiplier: 2 })} disabled={disabled}>
          Bull
        </Key>
        <Key
          className="col-span-3"
          tone="action"
          size="label"
          onClick={() => send({ segment: 0, multiplier: 1 })}
          disabled={disabled}
        >
          {de.game.miss}
        </Key>
      </div>
    </div>
  );
}
