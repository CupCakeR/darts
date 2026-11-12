import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestApp, type TestApp } from "./testing.ts";

let app: TestApp["app"];
let api: TestApp["api"];

beforeEach(async () => {
  ({ app, api } = await createTestApp());
});

afterEach(() => app.close());

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
