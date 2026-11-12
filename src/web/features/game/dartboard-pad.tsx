import type { Dart, Multiplier } from "#engine";
import { de } from "../../i18n/de.ts";
import { PadButton } from "../../ui/pad-button.tsx";

const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const SEGMENT_ANGLE = 360 / ORDER.length;

const RADIUS = {
  bull: 14,
  outerBull: 30,
  innerSingle: 95,
  triple: 125,
  outerSingle: 160,
  double: 195,
  numbers: 228,
};

const RINGS: { multiplier: Multiplier; inner: number; outer: number }[] = [
  { multiplier: 1, inner: RADIUS.outerBull, outer: RADIUS.innerSingle },
  { multiplier: 3, inner: RADIUS.innerSingle, outer: RADIUS.triple },
  { multiplier: 1, inner: RADIUS.triple, outer: RADIUS.outerSingle },
  { multiplier: 2, inner: RADIUS.outerSingle, outer: RADIUS.double },
];

function point(radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  return `${(radius * Math.sin(radians)).toFixed(2)} ${(-radius * Math.cos(radians)).toFixed(2)}`;
}

function sector(inner: number, outer: number, from: number, to: number) {
  return [
    `M ${point(outer, from)}`,
    `A ${outer} ${outer} 0 0 1 ${point(outer, to)}`,
    `L ${point(inner, to)}`,
    `A ${inner} ${inner} 0 0 0 ${point(inner, from)}`,
    "Z",
  ].join(" ");
}

function fill(index: number, multiplier: Multiplier) {
  const even = index % 2 === 0;
  if (multiplier === 1) return even ? "fill-ink" : "fill-paper";
  return even ? "fill-board-red" : "fill-board-green";
}

export function DartboardPad({ onDart, disabled }: { onDart: (dart: Dart) => void; disabled: boolean }) {
  const hit = (segment: number, multiplier: Multiplier) => () => onDart({ segment, multiplier });
  const target = "cursor-pointer stroke-ink/40 active:opacity-60";

  return (
    <div className={`flex h-full flex-col gap-1.5 ${disabled ? "pointer-events-none opacity-30" : ""}`}>
      <svg
        viewBox={`${-RADIUS.numbers - 6} ${-RADIUS.numbers - 6} ${2 * RADIUS.numbers + 12} ${2 * RADIUS.numbers + 12}`}
        className="min-h-0 w-full flex-1 touch-manipulation select-none"
      >
        <circle r={RADIUS.numbers} className="fill-ink" />
        {ORDER.map((segment, index) => {
          const from = index * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
          const to = from + SEGMENT_ANGLE;
          return (
            <g key={segment}>
              {RINGS.map((ring) => (
                <path
                  key={ring.inner}
                  d={sector(ring.inner, ring.outer, from, to)}
                  className={`${fill(index, ring.multiplier)} ${target}`}
                  onClick={hit(segment, ring.multiplier)}
                />
              ))}
              <text
                transform={`translate(${point((RADIUS.double + RADIUS.numbers) / 2, index * SEGMENT_ANGLE)})`}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none fill-paper text-[26px] font-bold"
              >
                {segment}
              </text>
            </g>
          );
        })}
        <circle r={RADIUS.outerBull} className={`fill-board-green ${target}`} onClick={hit(25, 1)} />
        <circle r={RADIUS.bull} className={`fill-board-red ${target}`} onClick={hit(25, 2)} />
      </svg>
      <PadButton tone="action" onClick={hit(0, 1)}>
        {de.game.miss}
      </PadButton>
    </div>
  );
}
