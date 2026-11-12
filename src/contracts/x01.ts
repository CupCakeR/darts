import type { X01Config } from "#engine";
import { z } from "zod";

const rule = z.enum(["straight", "double", "master"]);

export const x01ConfigSchema = z.object({
  startScore: z.int().min(2).max(1001),
  inRule: rule,
  outRule: rule,
  legsPerSet: z.int().min(1).max(11),
  sets: z.int().min(1).max(7),
}) satisfies z.ZodType<X01Config>;
