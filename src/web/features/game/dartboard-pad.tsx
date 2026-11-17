import { dartLabel, type Dart, type Multiplier } from "#engine";
import { useState, type MouseEvent } from "react";
import { de } from "../../i18n/de.ts";
import { flash } from "../../ui/motion.ts";
import { PadButton } from "../../ui/pad-button.tsx";

interface Hit {
  id: number;
  x: number;
  y: number;
  label: string;
}

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

function boardPoint(event: MouseEvent<SVGGraphicsElement>) {
  const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM()?.inverse();
  return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
}

function HitMarker({ hit, onDone }: { hit: Hit; onDone: () => void }) {
  return (
    <g transform={`translate(${hit.x.toFixed(1)} ${hit.y.toFixed(1)})`} className="pointer-events-none">
      <circle
        r={24}
        className="origin-center animate-ripple fill-none stroke-paper stroke-[4] [transform-box:fill-box]"
      />
      <text
        y={-20}
        textAnchor="middle"
        onAnimationEnd={onDone}
        className="origin-center animate-float fill-paper stroke-ink stroke-[8] text-[40px] font-black [paint-order:stroke] [transform-box:fill-box]"
      >
        {hit.label}
      </text>
    </g>
  );
}

function fill(index: number, multiplier: Multiplier) {
  const even = index % 2 === 0;
  if (multiplier === 1) return even ? "fill-ink" : "fill-paper";
  return even ? "fill-board-red" : "fill-board-green";
}

export function DartboardPad({ onDart, disabled }: { onDart: (dart: Dart) => void; disabled: boolean }) {
  const [hits, setHits] = useState<Hit[]>([]);

  const hit = (segment: number, multiplier: Multiplier) => (event: MouseEvent<SVGGraphicsElement>) => {
    const dart = { segment, multiplier };
    flash(event.currentTarget);
    const { x, y } = boardPoint(event);
    const label = dartLabel(dart);
    setHits((current) => [...current, { id: (current.at(-1)?.id ?? 0) + 1, x, y, label }]);
    onDart(dart);
  };
  const removeHit = (id: number) => setHits((current) => current.filter((other) => other.id !== id));
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
        {hits.map((current) => (
          <HitMarker key={current.id} hit={current} onDone={() => removeHit(current.id)} />
        ))}
      </svg>
      <PadButton tone="action" onClick={() => onDart({ segment: 0, multiplier: 1 })}>
        {de.game.miss}
      </PadButton>
    </div>
  );
}
