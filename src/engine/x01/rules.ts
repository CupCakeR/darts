import { isDouble, isTreble, type Dart } from "../darts.ts";

export type Rule = "straight" | "double" | "master";

export function qualifies(dart: Dart, rule: Rule): boolean {
  if (rule === "straight") return true;
  if (rule === "double") return isDouble(dart);
  return isDouble(dart) || isTreble(dart);
}

export function isBust(remainingAfter: number, lastDart: Dart | null, outRule: Rule): boolean {
  if (remainingAfter < 0) return true;
  if (outRule === "straight") return false;
  if (remainingAfter === 1) return true;
  return remainingAfter === 0 && lastDart !== null && !qualifies(lastDart, outRule);
}
