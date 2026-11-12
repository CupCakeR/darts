import { z } from "zod";

export const loginSchema = z.object({ pin: z.string().min(1).max(64) });
export type Login = z.infer<typeof loginSchema>;

export const sessionSchema = z.object({ authenticated: z.boolean() });
export type Session = z.infer<typeof sessionSchema>;
