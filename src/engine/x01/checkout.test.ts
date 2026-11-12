import { describe, expect, it } from "vitest";
import { dartScore } from "../darts.ts";
import { findCheckout } from "./checkout.ts";
import { labels } from "./test-helpers.ts";

describe("findCheckout", () => {
  it.each([
    [170, "T20 T20 Bull"],
    [167, "T20 T19 Bull"],
    [100, "T20 D20"],
    [40, "D20"],
    [32, "D16"],
    [50, "Bull"],
  ])("double out %i → %s", (remaining, route) => {
    expect(labels(findCheckout(remaining, 3, "double"))).toBe(route);
  });

  it.each([169, 168, 166, 165, 163, 162, 159, 1, 0, 171])("has no double-out finish for %i", (remaining) => {
    expect(findCheckout(remaining, 3, "double")).toBeNull();
  });

  it("respects the darts left in the turn", () => {
    expect(findCheckout(100, 1, "double")).toBeNull();
    expect(labels(findCheckout(100, 2, "double"))).toBe("T20 D20");
    expect(findCheckout(170, 2, "double")).toBeNull();
  });

  it("finds a valid double-out route for every finishable score", () => {
    for (let remaining = 2; remaining <= 170; remaining++) {
      const route = findCheckout(remaining, 3, "double");
      if (!route) continue;
      expect(route.reduce((sum, dart) => sum + dartScore(dart), 0)).toBe(remaining);
      expect(route.at(-1)!.multiplier).toBe(2);
    }
  });

  it("allows treble finishes with master out", () => {
    expect(labels(findCheckout(60, 1, "master"))).toBe("T20");
    expect(labels(findCheckout(180, 3, "master"))).toBe("T20 T20 T20");
  });

  it("allows any finish with straight out", () => {
    expect(labels(findCheckout(1, 1, "straight"))).toBe("1");
  });
});
