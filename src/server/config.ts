import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().default(3000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_PATH: z.string().default("./data/darts.db"),
  APP_PIN: z.string().min(4),
  COOKIE_SECRET: z.string().min(32),
  WEB_ROOT: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export interface Config {
  port: number;
  host: string;
  databasePath: string;
  appPin: string;
  cookieSecret: string;
  webRoot: string | undefined;
  logLevel: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.parse(env);
  return {
    port: parsed.PORT,
    host: parsed.HOST,
    databasePath: parsed.DATABASE_PATH,
    appPin: parsed.APP_PIN,
    cookieSecret: parsed.COOKIE_SECRET,
    webRoot: parsed.WEB_ROOT,
    logLevel: parsed.LOG_LEVEL,
  };
}
