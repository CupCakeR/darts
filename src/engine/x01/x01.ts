import { ALL_SCORING_DARTS, dartScore, isValidDart, type Dart } from "../darts.ts";
import type { ApplyResult, GameMode, Throw } from "../game-mode.ts";
import { findCheckout } from "./checkout.ts";
import { isBust, qualifies, type Rule } from "./rules.ts";

export interface X01Config {
  startScore: number;
  inRule: Rule;
  outRule: Rule;
  legsPerSet: number;
  sets: number;
}

export const DEFAULT_X01_CONFIG: X01Config = {
  startScore: 501,
  inRule: "straight",
  outRule: "double",
  legsPerSet: 3,
  sets: 1,
};

export interface X01Player {
  remaining: number;
  isIn: boolean;
  legs: number;
  sets: number;
}

export interface X01Turn {
  player: number;
  firstThrow: number;
  set: number;
  leg: number;
  startRemaining: number;
  darts: Dart[] | null;
  dartCount: number;
  scored: number;
  bust: boolean;
  checkout: boolean;
}

export interface X01State {
  config: X01Config;
  players: X01Player[];
  set: number;
  leg: number;
  legsPlayed: number;
  current: number;
  turnDarts: Dart[];
  turnStart: { remaining: number; isIn: boolean };
  turns: X01Turn[];
  throwCount: number;
  winner: number | null;
}

const singleDartScores = [...new Set([0, ...ALL_SCORING_DARTS.map(dartScore)])];
const possibleTurnScores = new Set(
  singleDartScores.flatMap((a) => singleDartScores.flatMap((b) => singleDartScores.map((c) => a + b + c))),
);

export const isPossibleTurnScore = (score: number): boolean => possibleTurnScores.has(score);

const freshPlayer = (config: X01Config): X01Player => ({
  remaining: config.startScore,
  isIn: config.inRule === "straight",
  legs: 0,
  sets: 0,
});

function startTurn(state: X01State, player: number): void {
  state.current = player;
  state.turnDarts = [];
  const { remaining, isIn } = state.players[player]!;
  state.turnStart = { remaining, isIn };
}

function finishLeg(state: X01State, winner: number): void {
  const { config, players } = state;
  const player = players[winner]!;
  player.legs++;
  if (player.legs === config.legsPerSet) {
    player.sets++;
    if (player.sets === config.sets) {
      state.winner = winner;
      return;
    }
    for (const p of players) p.legs = 0;
    state.set++;
    state.leg = 1;
  } else {
    state.leg++;
  }
  state.legsPlayed++;
  for (const p of players) Object.assign(p, freshPlayer(config), { legs: p.legs, sets: p.sets });
  startTurn(state, state.legsPlayed % players.length);
}

function endTurn(state: X01State, turn: Pick<X01Turn, "darts" | "dartCount" | "bust" | "checkout">): void {
  const player = state.players[state.current]!;
  if (turn.bust) Object.assign(player, state.turnStart);
  state.turns.push({
    ...turn,
    player: state.current,
    firstThrow: state.throwCount - (turn.darts ? turn.darts.length : 1),
    set: state.set,
    leg: state.leg,
    startRemaining: state.turnStart.remaining,
    scored: state.turnStart.remaining - player.remaining,
  });
  if (turn.checkout) finishLeg(state, state.current);
  else startTurn(state, (state.current + 1) % state.players.length);
}

function applyDart(state: X01State, dart: Dart): string | null {
  if (!isValidDart(dart)) return "invalid-dart";
  const player = state.players[state.current]!;
  if (!player.isIn && qualifies(dart, state.config.inRule)) player.isIn = true;
  const scored = player.isIn ? dartScore(dart) : 0;
  const after = player.remaining - scored;
  state.turnDarts.push(dart);
  const darts = state.turnDarts;

  if (isBust(after, dart, state.config.outRule)) {
    endTurn(state, { darts, dartCount: darts.length, bust: true, checkout: false });
    return null;
  }
  player.remaining = after;
  if (after === 0) endTurn(state, { darts, dartCount: darts.length, bust: false, checkout: true });
  else if (darts.length === 3) endTurn(state, { darts, dartCount: 3, bust: false, checkout: false });
  return null;
}

function applyTotal(state: X01State, score: number, dartCount: number): string | null {
  const { config } = state;
  const player = state.players[state.current]!;
  if (state.turnDarts.length > 0) return "turn-in-progress";
  if (!player.isIn) return "total-before-in";
  if (!isPossibleTurnScore(score)) return "impossible-score";

  const after = player.remaining - score;
  if (after === 0 && !findCheckout(player.remaining, dartCount, config.outRule)) return "impossible-checkout";
  if (isBust(after, null, config.outRule)) {
    endTurn(state, { darts: null, dartCount: 3, bust: true, checkout: false });
    return null;
  }
  player.remaining = after;
  const checkout = after === 0;
  endTurn(state, { darts: null, dartCount: checkout ? dartCount : 3, bust: false, checkout });
  return null;
}

export const x01: GameMode<X01Config, X01State> = {
  id: "x01",

  init(config, playerCount) {
    const players = Array.from({ length: playerCount }, () => freshPlayer(config));
    return {
      config,
      players,
      set: 1,
      leg: 1,
      legsPlayed: 0,
      current: 0,
      turnDarts: [],
      turnStart: { remaining: config.startScore, isIn: players[0]!.isIn },
      turns: [],
      throwCount: 0,
      winner: null,
    };
  },

  apply(state, input: Throw): ApplyResult<X01State> {
    if (state.winner !== null) return { ok: false, error: "match-finished" };
    const next = structuredClone(state);
    next.throwCount++;
    const error =
      input.kind === "dart" ? applyDart(next, input.dart) : applyTotal(next, input.score, input.darts);
    return error ? { ok: false, error } : { ok: true, state: next };
  },

  winner: (state) => state.winner,
};

export function suggestCheckout(state: X01State): Dart[] | null {
  const player = state.players[state.current];
  if (!player?.isIn || state.winner !== null) return null;
  return findCheckout(player.remaining, 3 - state.turnDarts.length, state.config.outRule);
}

export const currentTurnFirstThrow = (state: X01State): number => state.throwCount - state.turnDarts.length;
