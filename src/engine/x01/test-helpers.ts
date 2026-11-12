import { dartLabel, type Dart, type Multiplier } from "../darts.ts";
import type { Throw } from "../game-mode.ts";

export function dart(label: string): Dart {
  if (label === "Bull") return { segment: 25, multiplier: 2 };
  const match = /^([DT]?)(\d+)$/.exec(label);
  if (!match) throw new Error(`bad dart label ${label}`);
  const multiplier: Multiplier = match[1] === "D" ? 2 : match[1] === "T" ? 3 : 1;
  return { segment: Number(match[2]), multiplier };
}

export const darts = (labels: string): Throw[] =>
  labels.split(" ").map((label) => ({ kind: "dart", dart: dart(label) }));

export const labels = (route: Dart[] | null): string | null => route && route.map(dartLabel).join(" ");
