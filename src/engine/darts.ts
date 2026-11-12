export type Multiplier = 1 | 2 | 3;

export interface Dart {
  segment: number;
  multiplier: Multiplier;
}

export const MISS = 0;
export const BULL = 25;

export const dartScore = (dart: Dart): number => dart.segment * dart.multiplier;

export const isDouble = (dart: Dart): boolean => dart.multiplier === 2 && dart.segment !== MISS;

export const isTreble = (dart: Dart): boolean => dart.multiplier === 3;

export function isValidDart(dart: Dart): boolean {
  if (dart.segment === MISS) return dart.multiplier === 1;
  if (dart.segment === BULL) return dart.multiplier !== 3;
  return Number.isInteger(dart.segment) && dart.segment >= 1 && dart.segment <= 20;
}

export function dartLabel(dart: Dart): string {
  if (dart.segment === MISS) return "0";
  if (dart.segment === BULL) return dart.multiplier === 2 ? "Bull" : "25";
  const prefix = { 1: "", 2: "D", 3: "T" }[dart.multiplier];
  return `${prefix}${dart.segment}`;
}

const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

export const ALL_SCORING_DARTS: readonly Dart[] = [
  ...numbers.flatMap((segment) => [1, 2, 3].map((multiplier) => ({ segment, multiplier }) as Dart)),
  { segment: BULL, multiplier: 1 },
  { segment: BULL, multiplier: 2 },
];
