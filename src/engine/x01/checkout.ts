import { ALL_SCORING_DARTS, BULL, dartScore, isDouble, isTreble, type Dart } from "../darts.ts";
import { qualifies, type Rule } from "./rules.ts";

const PREFERRED_DOUBLES = [20, 16, 8, 18, 12, 10, 4, 14, 6, 2, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1, BULL];

function finishCost(dart: Dart): number {
  if (isDouble(dart)) return PREFERRED_DOUBLES.indexOf(dart.segment);
  if (isTreble(dart)) return 25;
  return dart.segment === BULL ? 30 : 20;
}

function setupCost(dart: Dart): number {
  if (dart.segment === BULL) return dart.multiplier === 2 ? 8 : 6;
  if (isTreble(dart)) return 2 + (20 - dart.segment) / 2;
  if (isDouble(dart)) return 10;
  return 1;
}

function routeCost(route: Dart[]): number {
  const setup = route.slice(0, -1).reduce((sum, dart) => sum + setupCost(dart), 0);
  return route.length * 100 + setup + finishCost(route.at(-1)!);
}

const dartsByScore = new Map<number, Dart[]>();
for (const dart of ALL_SCORING_DARTS) {
  dartsByScore.set(dartScore(dart), [...(dartsByScore.get(dartScore(dart)) ?? []), dart]);
}

function setups(score: number, darts: number): Dart[][] {
  if (score === 0) return [[]];
  if (darts === 0) return [];
  if (darts === 1) return (dartsByScore.get(score) ?? []).map((dart) => [dart]);
  return ALL_SCORING_DARTS.filter((first) => dartScore(first) <= score).flatMap((first) =>
    setups(score - dartScore(first), darts - 1).map((rest) => [first, ...rest]),
  );
}

function bySetupScoreDesc(route: Dart[]): Dart[] {
  const finish = route.at(-1)!;
  const setup = route.slice(0, -1).sort((a, b) => dartScore(b) - dartScore(a) || b.multiplier - a.multiplier);
  return [...setup, finish];
}

const cache = new Map<string, Dart[] | null>();

export function findCheckout(remaining: number, dartsLeft: number, outRule: Rule): Dart[] | null {
  const key = `${remaining}:${dartsLeft}:${outRule}`;
  if (!cache.has(key)) cache.set(key, computeCheckout(remaining, dartsLeft, outRule));
  return cache.get(key) ?? null;
}

function computeCheckout(remaining: number, dartsLeft: number, outRule: Rule): Dart[] | null {
  if (remaining <= 0 || remaining > 180 || dartsLeft < 1) return null;
  const finishers = ALL_SCORING_DARTS.filter(
    (dart) => qualifies(dart, outRule) && dartScore(dart) <= remaining,
  );

  let best: Dart[] | null = null;
  for (let setupDarts = 0; setupDarts < dartsLeft && !best; setupDarts++) {
    for (const finish of finishers) {
      for (const setup of setups(remaining - dartScore(finish), setupDarts)) {
        if (setup.length !== setupDarts) continue;
        const route = [...setup, finish];
        if (!best || routeCost(route) < routeCost(best)) best = route;
      }
    }
  }
  return best && bySetupScoreDesc(best);
}
