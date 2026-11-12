import { z } from "zod";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  archived: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type Player = z.infer<typeof playerSchema>;

const name = z.string().trim().min(1).max(24);
const color = z.string().regex(/^#[0-9a-f]{6}$/i);

export const createPlayerSchema = z.object({ name, color });
export type CreatePlayer = z.infer<typeof createPlayerSchema>;

export const updatePlayerSchema = z
  .object({ name, color, archived: z.boolean() })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0);
export type UpdatePlayer = z.infer<typeof updatePlayerSchema>;

export const listPlayersQuerySchema = z.object({
  archived: z.stringbool().default(false),
});
