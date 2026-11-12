import type { GameMode } from "./game-mode.ts";
import { x01 } from "./x01/x01.ts";

export const gameModes = { x01 } as const;

export type GameModeId = keyof typeof gameModes;

export const getGameMode = (id: string): GameMode<unknown, unknown> | undefined =>
  (gameModes as Record<string, GameMode<unknown, unknown>>)[id];
