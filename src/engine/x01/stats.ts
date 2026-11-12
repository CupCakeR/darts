import type { X01Turn } from "./x01.ts";

export function threeDartAverage(turns: readonly X01Turn[], player: number): number | null {
  const own = turns.filter((turn) => turn.player === player);
  const darts = own.reduce((sum, turn) => sum + turn.dartCount, 0);
  if (darts === 0) return null;
  return (own.reduce((sum, turn) => sum + turn.scored, 0) / darts) * 3;
}
