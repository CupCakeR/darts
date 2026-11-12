import type { X01Config } from "#engine";
import { DEFAULT_X01_CONFIG } from "#engine";

const STORAGE_KEY = "darts.lastSetup";

export interface LastSetup {
  config: X01Config;
  playerIds: string[];
}

export function loadLastSetup(): LastSetup {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<LastSetup> | null;
    return { config: { ...DEFAULT_X01_CONFIG, ...stored?.config }, playerIds: stored?.playerIds ?? [] };
  } catch {
    return { config: DEFAULT_X01_CONFIG, playerIds: [] };
  }
}

export const saveLastSetup = (setup: LastSetup) => localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
