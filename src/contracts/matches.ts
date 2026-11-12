import type { Throw } from "#engine";
import { z } from "zod";
import { playerSchema } from "./players.ts";
import { x01ConfigSchema } from "./x01.ts";

export const dartSchema = z.object({
  segment: z.union([z.int().min(0).max(20), z.literal(25)]),
  multiplier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const throwSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("dart"), dart: dartSchema }),
  z.object({
    kind: z.literal("total"),
    score: z.int().min(0).max(180),
    darts: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
]) satisfies z.ZodType<Throw>;

export const matchStatusSchema = z.enum(["active", "finished", "abandoned"]);
export type MatchStatus = z.infer<typeof matchStatusSchema>;

export const modeConfigSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("x01"), config: x01ConfigSchema }),
]);

export const createMatchSchema = modeConfigSchema.and(
  z.object({
    playerIds: z
      .array(z.string())
      .min(1)
      .max(8)
      .refine((ids) => new Set(ids).size === ids.length, "duplicate players"),
  }),
);
export type CreateMatch = z.infer<typeof createMatchSchema>;

export const matchSummarySchema = modeConfigSchema.and(
  z.object({
    id: z.string(),
    status: matchStatusSchema,
    players: z.array(playerSchema),
    winnerId: z.string().nullable(),
    startedAt: z.iso.datetime(),
    finishedAt: z.iso.datetime().nullable(),
  }),
);
export type MatchSummary = z.infer<typeof matchSummarySchema>;

export const matchSchema = matchSummarySchema.and(z.object({ throws: z.array(throwSchema) }));
export type Match = z.infer<typeof matchSchema>;

export const listMatchesQuerySchema = z.object({ status: matchStatusSchema.optional() });

export const addThrowSchema = z.object({ seq: z.int().min(0), throw: throwSchema });
export type AddThrow = z.infer<typeof addThrowSchema>;
