import { describe, expect, it } from "vitest";
import { replay } from "../game-mode.ts";
import { threeDartAverage } from "./stats.ts";
import { darts } from "./test-helpers.ts";
import { DEFAULT_X01_CONFIG, x01 } from "./x01.ts";

describe("threeDartAverage", () => {
  const turnsOf = (startScore: number, labels: string) => {
    const result = replay(x01, { ...DEFAULT_X01_CONFIG, startScore }, 1, darts(labels));
    if (!result.ok) throw new Error(result.error);
    return result.state.turns;
  };

  it("averages scored points per three darts", () => {
    expect(threeDartAverage(turnsOf(501, "T20 T20 T20 20 20 20"), 0)).toBe(120);
  });

  it("counts bust darts with zero points", () => {
    expect(threeDartAverage(turnsOf(101, "T20 T20 20 20 20"), 0)).toBe(36);
  });

  it("is null without completed turns", () => {
    expect(threeDartAverage([], 0)).toBeNull();
  });
});
