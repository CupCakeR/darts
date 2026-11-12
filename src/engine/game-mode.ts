import type { Dart } from "./darts.ts";

export type Throw = { kind: "dart"; dart: Dart } | { kind: "total"; score: number; darts: 1 | 2 | 3 };

export type ApplyResult<State> = { ok: true; state: State } | { ok: false; error: string };

export interface GameMode<Config, State> {
  readonly id: string;
  init(config: Config, playerCount: number): State;
  apply(state: State, input: Throw): ApplyResult<State>;
  winner(state: State): number | null;
}

export function replay<Config, State>(
  mode: GameMode<Config, State>,
  config: Config,
  playerCount: number,
  throws: readonly Throw[],
): ApplyResult<State> {
  let state = mode.init(config, playerCount);
  for (const input of throws) {
    const result = mode.apply(state, input);
    if (!result.ok) return result;
    state = result.state;
  }
  return { ok: true, state };
}
