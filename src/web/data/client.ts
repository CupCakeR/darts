import {
  apiErrorSchema,
  matchSchema,
  matchSummarySchema,
  playerSchema,
  sessionSchema,
  type CreateMatch,
  type CreatePlayer,
  type MatchStatus,
  type UpdatePlayer,
} from "#contracts";
import type { Throw } from "#engine";
import { z } from "zod";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, schema: z.ZodType<T> | null, body?: unknown) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(await response.json().catch(() => null));
    throw new ApiError(response.status, parsed.success ? parsed.data.error : "unknown");
  }
  return schema ? schema.parse(await response.json()) : (undefined as T);
}

export const api = {
  session: () => request("GET", "/api/auth", sessionSchema),
  login: (pin: string) => request("POST", "/api/auth", null, { pin }),
  players: {
    list: (archived: boolean) => request("GET", `/api/players?archived=${archived}`, z.array(playerSchema)),
    create: (input: CreatePlayer) => request("POST", "/api/players", playerSchema, input),
    update: (id: string, patch: UpdatePlayer) => request("PATCH", `/api/players/${id}`, playerSchema, patch),
  },
  matches: {
    list: (status?: MatchStatus) =>
      request("GET", `/api/matches${status ? `?status=${status}` : ""}`, z.array(matchSummarySchema)),
    get: (id: string) => request("GET", `/api/matches/${id}`, matchSchema),
    create: (input: CreateMatch) => request("POST", "/api/matches", matchSchema, input),
    addThrow: (id: string, seq: number, input: Throw) =>
      request("POST", `/api/matches/${id}/throws`, matchSchema, { seq, throw: input }),
    replaceThrow: (id: string, seq: number, input: Throw) =>
      request("PUT", `/api/matches/${id}/throws/${seq}`, matchSchema, input),
    undo: (id: string) => request("DELETE", `/api/matches/${id}/throws/last`, matchSchema),
    abandon: (id: string) => request("POST", `/api/matches/${id}/abandon`, matchSchema),
  },
};
