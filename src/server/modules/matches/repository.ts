import type { MatchStatus } from "#contracts";
import type { Throw } from "#engine";

export interface MatchRecord {
  id: string;
  mode: string;
  config: unknown;
  status: MatchStatus;
  winnerId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  playerIds: string[];
}

export interface MatchWithThrows extends MatchRecord {
  throws: Throw[];
}

export type MatchOutcome = Pick<MatchRecord, "status" | "winnerId" | "finishedAt">;

export interface MatchRepository {
  insert(match: MatchRecord): Promise<void>;
  findById(id: string): Promise<MatchWithThrows | undefined>;
  list(filter: { status?: MatchStatus }): Promise<MatchRecord[]>;
  appendThrow(matchId: string, seq: number, input: Throw, at: Date, outcome: MatchOutcome): Promise<void>;
  replaceThrow(matchId: string, seq: number, input: Throw, outcome: MatchOutcome): Promise<void>;
  removeLastThrow(matchId: string, outcome: MatchOutcome): Promise<void>;
  setOutcome(matchId: string, outcome: MatchOutcome): Promise<void>;
}
