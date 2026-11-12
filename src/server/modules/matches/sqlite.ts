import type { Multiplier, Throw } from "#engine";
import { and, asc, desc, eq, inArray, max } from "drizzle-orm";
import type { Db } from "../../db/client.ts";
import { matches, matchPlayers, throws } from "../../db/schema.ts";
import type { MatchOutcome, MatchRecord, MatchRepository } from "./repository.ts";

type ThrowRow = typeof throws.$inferSelect;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

function toColumns(input: Throw) {
  return input.kind === "dart"
    ? {
        kind: input.kind,
        segment: input.dart.segment,
        multiplier: input.dart.multiplier,
        total: null,
        darts: null,
      }
    : { kind: input.kind, segment: null, multiplier: null, total: input.score, darts: input.darts };
}

function toThrow(row: ThrowRow): Throw {
  return row.kind === "dart"
    ? { kind: "dart", dart: { segment: row.segment!, multiplier: row.multiplier as Multiplier } }
    : { kind: "total", score: row.total!, darts: row.darts as 1 | 2 | 3 };
}

export function createSqliteMatchRepository(db: Db): MatchRepository {
  const setOutcome = (tx: Tx | Db, matchId: string, outcome: MatchOutcome) =>
    tx.update(matches).set(outcome).where(eq(matches.id, matchId)).run();

  function playerIdsByMatch(matchIds: string[]) {
    const rows = db
      .select()
      .from(matchPlayers)
      .where(inArray(matchPlayers.matchId, matchIds))
      .orderBy(asc(matchPlayers.position))
      .all();
    const byMatch = new Map<string, string[]>();
    for (const row of rows) byMatch.set(row.matchId, [...(byMatch.get(row.matchId) ?? []), row.playerId]);
    return byMatch;
  }

  function withPlayers(rows: (typeof matches.$inferSelect)[]): MatchRecord[] {
    const playerIds = playerIdsByMatch(rows.map((row) => row.id));
    return rows.map((row) => ({ ...row, playerIds: playerIds.get(row.id) ?? [] }));
  }

  return {
    async insert({ playerIds, ...match }) {
      db.transaction((tx) => {
        tx.insert(matches).values(match).run();
        tx.insert(matchPlayers)
          .values(playerIds.map((playerId, position) => ({ matchId: match.id, playerId, position })))
          .run();
      });
    },

    async findById(id) {
      const row = db.select().from(matches).where(eq(matches.id, id)).get();
      if (!row) return undefined;
      const throwRows = db.select().from(throws).where(eq(throws.matchId, id)).orderBy(asc(throws.seq)).all();
      return { ...withPlayers([row])[0]!, throws: throwRows.map(toThrow) };
    },

    async list({ status }) {
      const rows = db
        .select()
        .from(matches)
        .where(status ? eq(matches.status, status) : undefined)
        .orderBy(desc(matches.startedAt))
        .all();
      return withPlayers(rows);
    },

    async appendThrow(matchId, seq, input, at, outcome) {
      db.transaction((tx) => {
        tx.insert(throws)
          .values({ matchId, seq, createdAt: at, ...toColumns(input) })
          .run();
        setOutcome(tx, matchId, outcome);
      });
    },

    async replaceThrow(matchId, seq, input, outcome) {
      db.transaction((tx) => {
        tx.update(throws)
          .set(toColumns(input))
          .where(and(eq(throws.matchId, matchId), eq(throws.seq, seq)))
          .run();
        setOutcome(tx, matchId, outcome);
      });
    },

    async removeLastThrow(matchId, outcome) {
      db.transaction((tx) => {
        const last = tx
          .select({ seq: max(throws.seq) })
          .from(throws)
          .where(eq(throws.matchId, matchId))
          .get();
        if (last?.seq != null) {
          tx.delete(throws)
            .where(and(eq(throws.matchId, matchId), eq(throws.seq, last.seq)))
            .run();
        }
        setOutcome(tx, matchId, outcome);
      });
    },

    async setOutcome(matchId, outcome) {
      setOutcome(db, matchId, outcome);
    },
  };
}
