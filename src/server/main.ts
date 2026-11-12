import { randomUUID } from "node:crypto";
import { buildApp } from "./app.ts";
import { loadConfig } from "./config.ts";
import { openDatabase } from "./db/client.ts";
import { createAuthService } from "./modules/auth/service.ts";
import { createMatchService } from "./modules/matches/service.ts";
import { createSqliteMatchRepository } from "./modules/matches/sqlite.ts";
import { createSqlitePlayerRepository } from "./modules/players/sqlite.ts";
import { createPlayerService } from "./modules/players/service.ts";

const config = loadConfig();
const db = openDatabase(config.databasePath);
const now = () => new Date();

const players = createPlayerService({ repo: createSqlitePlayerRepository(db), newId: randomUUID, now });
const matches = createMatchService({
  repo: createSqliteMatchRepository(db),
  players,
  newId: randomUUID,
  now,
});

const app = await buildApp({
  config,
  auth: createAuthService({ pin: config.appPin }),
  players,
  matches,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await app.close();
    db.$client.close();
    process.exit(0);
  });
}

await app.listen({ port: config.port, host: config.host });
