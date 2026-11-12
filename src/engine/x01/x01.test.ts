import { describe, expect, it } from "vitest";
import { replay, type Throw } from "../game-mode.ts";
import { darts, labels } from "./test-helpers.ts";
import { DEFAULT_X01_CONFIG, suggestCheckout, x01, type X01Config, type X01State } from "./x01.ts";

const play = (throws: Throw[], config: Partial<X01Config> = {}, players = 2): X01State => {
  const result = replay(x01, { ...DEFAULT_X01_CONFIG, ...config }, players, throws);
  if (!result.ok) throw new Error(result.error);
  return result.state;
};

const total = (score: number, count: 1 | 2 | 3 = 3): Throw => ({ kind: "total", score, darts: count });

describe("x01 scoring", () => {
  it("subtracts darts and passes the turn after three", () => {
    const state = play(darts("T20 T20 T20"));
    expect(state.players[0]!.remaining).toBe(321);
    expect(state.current).toBe(1);
    expect(state.turns[0]).toMatchObject({ player: 0, scored: 180, dartCount: 3, bust: false });
  });

  it("updates remaining live during a turn", () => {
    const state = play(darts("T20"));
    expect(state.players[0]!.remaining).toBe(441);
    expect(state.current).toBe(0);
  });

  it("accepts a turn total", () => {
    const state = play([total(100)]);
    expect(state.players[0]!.remaining).toBe(401);
    expect(state.turns[0]).toMatchObject({ darts: null, scored: 100 });
  });

  it("rejects impossible totals and totals mid-turn", () => {
    expect(replay(x01, DEFAULT_X01_CONFIG, 2, [total(179)])).toEqual({
      ok: false,
      error: "impossible-score",
    });
    expect(replay(x01, DEFAULT_X01_CONFIG, 2, [...darts("20"), total(60)])).toEqual({
      ok: false,
      error: "turn-in-progress",
    });
  });
});

describe("x01 busts", () => {
  const config = { startScore: 40 };

  it("busts below zero and restores the turn start score", () => {
    const state = play(darts("20 T20"), config);
    expect(state.players[0]!.remaining).toBe(40);
    expect(state.turns[0]).toMatchObject({ bust: true, dartCount: 2, scored: 0 });
    expect(state.current).toBe(1);
  });

  it("busts on 1 and on a non-double finish with double out", () => {
    expect(play(darts("19 20"), config).turns[0]!.bust).toBe(true);
    expect(play(darts("20 20"), config).turns[0]!.bust).toBe(true);
  });

  it("allows a single finish with straight out", () => {
    const state = play(darts("20 20"), { ...config, outRule: "straight" });
    expect(state.turns[0]!.checkout).toBe(true);
  });

  it("treats an overshooting total as a bust", () => {
    expect(play([total(60)], config).turns[0]).toMatchObject({ bust: true, scored: 0 });
  });
});

describe("x01 double in", () => {
  it("ignores darts until a double is hit", () => {
    const state = play(darts("T20 D10 20"), { inRule: "double" });
    expect(state.players[0]!.remaining).toBe(501 - 40);
  });

  it("rejects totals before the player is in", () => {
    expect(replay(x01, { ...DEFAULT_X01_CONFIG, inRule: "double" }, 2, [total(60)])).toEqual({
      ok: false,
      error: "total-before-in",
    });
  });
});

describe("x01 legs and sets", () => {
  const config = { startScore: 40, legsPerSet: 2, sets: 2 };

  it("rotates the leg starter and resets scores", () => {
    const state = play(darts("D20"), config);
    expect(state.players[0]).toMatchObject({ legs: 1, remaining: 40 });
    expect(state.leg).toBe(2);
    expect(state.current).toBe(1);
  });

  it("counts a checkout total with its dart count", () => {
    const state = play([total(40, 1)], config);
    expect(state.turns[0]).toMatchObject({ checkout: true, dartCount: 1 });
    expect(replay(x01, { ...DEFAULT_X01_CONFIG, startScore: 99 }, 2, [total(99, 1)])).toEqual({
      ok: false,
      error: "impossible-checkout",
    });
  });

  it("wins sets and the match", () => {
    const leg = (starterLoses: boolean) => (starterLoses ? darts("0 0 0 D20") : darts("D20"));
    const state = play([...leg(false), ...leg(true), ...darts("D20"), ...darts("0 0 0 D20")], config);
    expect(state.players[0]!.sets).toBe(2);
    expect(x01.winner(state)).toBe(0);
    expect(x01.apply(state, darts("20")[0]!)).toEqual({ ok: false, error: "match-finished" });
  });
});

describe("suggestCheckout", () => {
  it("suggests a route for the darts left", () => {
    const state = play(darts("T20 T20"), { startScore: 160 });
    expect(labels(suggestCheckout(state))).toBe("D20");
  });
});
