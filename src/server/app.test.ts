import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "./app.ts";
import { openDatabase } from "./db/client.ts";
import { createAuthService } from "./modules/auth/service.ts";
import { createPlayerService } from "./modules/players/service.ts";
import { createSqlitePlayerRepository } from "./modules/players/sqlite.ts";

let app: FastifyInstance;
let cookie: string;

beforeEach(async () => {
  let id = 0;
  const db = openDatabase(":memory:");
  app = await buildApp({
    config: { cookieSecret: "x".repeat(32), webRoot: undefined, logLevel: "silent" },
    auth: createAuthService({ pin: "1234" }),
    players: createPlayerService({
      repo: createSqlitePlayerRepository(db),
      newId: () => `p${++id}`,
      now: () => new Date("2026-11-12T10:00:00Z"),
    }),
  });
  const login = await app.inject({ method: "POST", url: "/api/auth", payload: { pin: "1234" } });
  cookie = login.headers["set-cookie"] as string;
});

afterEach(() => app.close());

const api = (method: "GET" | "POST" | "PATCH", url: string, payload?: object) =>
  app.inject({ method, url, payload, headers: { cookie } });

describe("auth", () => {
  it("keeps health public and guards everything else", async () => {
    expect((await app.inject({ url: "/api/health" })).statusCode).toBe(200);
    expect((await app.inject({ url: "/api/players" })).statusCode).toBe(401);
  });

  it("rejects a wrong pin", async () => {
    const response = await app.inject({ method: "POST", url: "/api/auth", payload: { pin: "0000" } });
    expect(response.statusCode).toBe(401);
  });

  it("reports the session state", async () => {
    expect((await api("GET", "/api/auth")).json()).toEqual({ authenticated: true });
    expect((await app.inject({ url: "/api/auth" })).json()).toEqual({ authenticated: false });
  });
});

describe("players", () => {
  it("creates and lists players", async () => {
    const created = await api("POST", "/api/players", { name: " Anna ", color: "#cc2222" });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({ id: "p1", name: "Anna", archived: false });
    expect((await api("GET", "/api/players")).json()).toHaveLength(1);
  });

  it("rejects invalid input and duplicate active names", async () => {
    expect((await api("POST", "/api/players", { name: "", color: "#cc2222" })).statusCode).toBe(400);
    await api("POST", "/api/players", { name: "Anna", color: "#cc2222" });
    const duplicate = await api("POST", "/api/players", { name: "anna", color: "#22cc22" });
    expect(duplicate.statusCode).toBe(409);
  });

  it("archives instead of deleting and frees the name", async () => {
    await api("POST", "/api/players", { name: "Anna", color: "#cc2222" });
    const archived = await api("PATCH", "/api/players/p1", { archived: true });
    expect(archived.json()).toMatchObject({ archived: true });
    expect((await api("GET", "/api/players")).json()).toEqual([]);
    expect((await api("GET", "/api/players?archived=true")).json()).toHaveLength(1);

    await api("POST", "/api/players", { name: "Anna", color: "#22cc22" });
    expect((await api("PATCH", "/api/players/p1", { archived: false })).statusCode).toBe(409);
  });

  it("returns 404 for unknown players", async () => {
    expect((await api("PATCH", "/api/players/nope", { name: "X" })).statusCode).toBe(404);
  });
});
