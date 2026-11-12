import { integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull(),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  mode: text("mode").notNull(),
  config: text("config", { mode: "json" }).notNull(),
  status: text("status", { enum: ["active", "finished", "abandoned"] }).notNull(),
  winnerId: text("winner_id").references(() => players.id),
  startedAt: timestamp("started_at").notNull(),
  finishedAt: timestamp("finished_at"),
});

export const matchPlayers = sqliteTable(
  "match_players",
  {
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id),
    position: integer("position").notNull(),
  },
  (table) => [primaryKey({ columns: [table.matchId, table.position] })],
);

export const throws = sqliteTable(
  "throws",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    seq: integer("seq").notNull(),
    kind: text("kind", { enum: ["dart", "total"] }).notNull(),
    segment: integer("segment"),
    multiplier: integer("multiplier"),
    total: integer("total"),
    darts: integer("darts"),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [unique().on(table.matchId, table.seq)],
);
