import { and, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "../../db/client.ts";
import { players } from "../../db/schema.ts";
import type { PlayerRepository } from "./repository.ts";

export function createSqlitePlayerRepository(db: Db): PlayerRepository {
  return {
    async list({ includeArchived }) {
      return db
        .select()
        .from(players)
        .where(includeArchived ? undefined : isNull(players.archivedAt))
        .orderBy(sql`${players.name} collate nocase`)
        .all();
    },

    async findById(id) {
      return db.select().from(players).where(eq(players.id, id)).get();
    },

    async findActiveByName(name) {
      return db
        .select()
        .from(players)
        .where(and(isNull(players.archivedAt), sql`lower(${players.name}) = lower(${name})`))
        .get();
    },

    async insert(record) {
      db.insert(players).values(record).run();
    },

    async update(id, patch) {
      return db.update(players).set(patch).where(eq(players.id, id)).returning().get()!;
    },
  };
}
