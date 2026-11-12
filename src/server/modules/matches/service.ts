import { modeConfigSchema, type CreateMatch, type Match, type MatchSummary } from "#contracts";
import { getGameMode, replay, type Throw } from "#engine";
import { conflict, invalid, notFound, rejected } from "../../errors.ts";
import type { PlayerService } from "../players/service.ts";
import type { MatchOutcome, MatchRecord, MatchRepository, MatchWithThrows } from "./repository.ts";

interface Deps {
  repo: MatchRepository;
  players: PlayerService;
  newId: () => string;
  now: () => Date;
}

const ACTIVE: MatchOutcome = { status: "active", winnerId: null, finishedAt: null };

export function createMatchService({ repo, players, newId, now }: Deps) {
  async function load(id: string): Promise<MatchWithThrows> {
    const match = await repo.findById(id);
    if (!match) throw notFound("match");
    return match;
  }

  async function loadPlayable(id: string): Promise<MatchWithThrows> {
    const match = await load(id);
    if (match.status === "abandoned") throw conflict("match-abandoned");
    return match;
  }

  function outcomeOf(match: MatchRecord, throws: readonly Throw[]): MatchOutcome {
    const mode = getGameMode(match.mode);
    if (!mode) throw invalid("unknown-mode");
    const result = replay(mode, match.config, match.playerIds.length, throws);
    if (!result.ok) throw rejected(result.error);
    const winner = mode.winner(result.state);
    if (winner === null) return ACTIVE;
    return { status: "finished", winnerId: match.playerIds[winner]!, finishedAt: match.finishedAt ?? now() };
  }

  async function toSummary(match: MatchRecord): Promise<MatchSummary> {
    return {
      ...modeConfigSchema.parse({ mode: match.mode, config: match.config }),
      id: match.id,
      status: match.status,
      players: await players.getMany(match.playerIds),
      winnerId: match.winnerId,
      startedAt: match.startedAt.toISOString(),
      finishedAt: match.finishedAt?.toISOString() ?? null,
    };
  }

  async function toMatch(id: string): Promise<Match> {
    const match = await load(id);
    return { ...(await toSummary(match)), throws: match.throws };
  }

  return {
    get: toMatch,

    async list(status?: MatchRecord["status"]): Promise<MatchSummary[]> {
      return Promise.all((await repo.list({ status })).map(toSummary));
    },

    async create({ mode, config, playerIds }: CreateMatch): Promise<Match> {
      const participants = await players.getMany(playerIds);
      if (participants.some((player) => player.archived)) throw invalid("player-archived");
      const id = newId();
      await repo.insert({ id, mode, config, ...ACTIVE, startedAt: now(), playerIds });
      return toMatch(id);
    },

    async addThrow(id: string, seq: number, input: Throw): Promise<Match> {
      const match = await loadPlayable(id);
      if (seq !== match.throws.length) throw conflict("stale-seq");
      const outcome = outcomeOf(match, [...match.throws, input]);
      await repo.appendThrow(id, seq, input, now(), outcome);
      return toMatch(id);
    },

    async replaceThrow(id: string, seq: number, input: Throw): Promise<Match> {
      const match = await loadPlayable(id);
      if (seq >= match.throws.length) throw notFound("throw");
      const outcome = outcomeOf(match, match.throws.with(seq, input));
      await repo.replaceThrow(id, seq, input, outcome);
      return toMatch(id);
    },

    async undo(id: string): Promise<Match> {
      const match = await loadPlayable(id);
      if (match.throws.length === 0) throw conflict("nothing-to-undo");
      await repo.removeLastThrow(id, outcomeOf(match, match.throws.slice(0, -1)));
      return toMatch(id);
    },

    async abandon(id: string): Promise<Match> {
      const match = await load(id);
      if (match.status !== "active") throw conflict("match-not-active");
      await repo.setOutcome(id, { ...ACTIVE, status: "abandoned", finishedAt: now() });
      return toMatch(id);
    },
  };
}

export type MatchService = ReturnType<typeof createMatchService>;
