import type { FastifyInstance, LightMyRequestResponse } from "fastify";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
import { buildApp } from "./app.ts";
import { openDatabase } from "./db/client.ts";
import { createAuthService } from "./modules/auth/service.ts";
import { createMatchService } from "./modules/matches/service.ts";
import { createSqliteMatchRepository } from "./modules/matches/sqlite.ts";
import { createPlayerService } from "./modules/players/service.ts";
import { createSqlitePlayerRepository } from "./modules/players/sqlite.ts";

export const TEST_PIN = "1234";

export interface TestApp {
  app: FastifyInstance;
  api: (method: Method, url: string, payload?: object) => Promise<LightMyRequestResponse>;
}

export async function createTestApp(): Promise<TestApp> {
  const db = openDatabase(":memory:");
  const ids = new Map<string, number>();
  const newId = (prefix: string) => () => {
    ids.set(prefix, (ids.get(prefix) ?? 0) + 1);
    return `${prefix}${ids.get(prefix)}`;
  };
  const now = () => new Date("2026-11-12T10:00:00Z");
  const players = createPlayerService({ repo: createSqlitePlayerRepository(db), newId: newId("p"), now });
  const matches = createMatchService({
    repo: createSqliteMatchRepository(db),
    players,
    newId: newId("m"),
    now,
  });

  const app = await buildApp({
    config: { cookieSecret: "x".repeat(32), webRoot: undefined, logLevel: "silent" },
    auth: createAuthService({ pin: TEST_PIN }),
    players,
    matches,
  });
  const login = await app.inject({ method: "POST", url: "/api/auth", payload: { pin: TEST_PIN } });
  const cookie = login.headers["set-cookie"] as string;

  return { app, api: (method, url, payload) => app.inject({ method, url, payload, headers: { cookie } }) };
}
