import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestApp, type TestApp } from "../../testing.ts";

let app: TestApp["app"];
let api: TestApp["api"];

const config = { startScore: 40, inRule: "straight", outRule: "double", legsPerSet: 1, sets: 1 };
const dart = (segment: number, multiplier = 1) => ({ kind: "dart", dart: { segment, multiplier } });

beforeEach(async () => {
  ({ app, api } = await createTestApp());
  await api("POST", "/api/players", { name: "Anna", color: "#c8102e" });
  await api("POST", "/api/players", { name: "Ben", color: "#00843d" });
});

afterEach(() => app.close());

const createMatch = async () =>
  (await api("POST", "/api/matches", { mode: "x01", config, playerIds: ["p1", "p2"] })).json();

describe("matches", () => {
  it("creates a match with players in order", async () => {
    const match = await createMatch();
    expect(match).toMatchObject({ id: "m1", status: "active", throws: [] });
    expect(match.players.map((player: { name: string }) => player.name)).toEqual(["Anna", "Ben"]);
  });

  it("rejects unknown and archived players", async () => {
    const unknown = await api("POST", "/api/matches", { mode: "x01", config, playerIds: ["nope"] });
    expect(unknown.statusCode).toBe(404);
    await api("PATCH", "/api/players/p2", { archived: true });
    const archived = await api("POST", "/api/matches", { mode: "x01", config, playerIds: ["p1", "p2"] });
    expect(archived.statusCode).toBe(400);
  });

  it("appends throws in sequence and rejects stale ones", async () => {
    await createMatch();
    expect((await api("POST", "/api/matches/m1/throws", { seq: 0, throw: dart(20) })).statusCode).toBe(200);
    const stale = await api("POST", "/api/matches/m1/throws", { seq: 0, throw: dart(20) });
    expect(stale.statusCode).toBe(409);
  });

  it("rejects throws the engine refuses", async () => {
    await createMatch();
    const response = await api("POST", "/api/matches/m1/throws", {
      seq: 0,
      throw: { kind: "total", score: 179, darts: 3 },
    });
    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({ error: "impossible-score" });
  });

  it("finishes on checkout and reopens on undo", async () => {
    await createMatch();
    const finished = (await api("POST", "/api/matches/m1/throws", { seq: 0, throw: dart(20, 2) })).json();
    expect(finished).toMatchObject({ status: "finished", winnerId: "p1" });
    expect((await api("GET", "/api/matches?status=active")).json()).toEqual([]);

    const reopened = (await api("DELETE", "/api/matches/m1/throws/last")).json();
    expect(reopened).toMatchObject({ status: "active", winnerId: null, throws: [] });
  });

  it("edits an earlier throw and replays the result", async () => {
    await createMatch();
    await api("POST", "/api/matches/m1/throws", { seq: 0, throw: dart(20) });
    const edited = (await api("PUT", "/api/matches/m1/throws/0", dart(20, 2))).json();
    expect(edited).toMatchObject({ status: "finished", winnerId: "p1", throws: [dart(20, 2)] });
  });

  it("abandons a match and blocks further throws", async () => {
    await createMatch();
    expect((await api("POST", "/api/matches/m1/abandon")).json()).toMatchObject({ status: "abandoned" });
    expect((await api("POST", "/api/matches/m1/throws", { seq: 0, throw: dart(20) })).statusCode).toBe(409);
  });
});
