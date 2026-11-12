import { join } from "node:path";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { Config } from "./config.ts";
import { DomainError } from "./errors.ts";
import { authRoutes, readSession } from "./modules/auth/routes.ts";
import type { AuthService } from "./modules/auth/service.ts";
import { healthRoutes } from "./modules/health/routes.ts";
import { matchRoutes } from "./modules/matches/routes.ts";
import type { MatchService } from "./modules/matches/service.ts";
import { playerRoutes } from "./modules/players/routes.ts";
import type { PlayerService } from "./modules/players/service.ts";

export interface AppDeps {
  config: Pick<Config, "cookieSecret" | "webRoot" | "logLevel">;
  auth: AuthService;
  players: PlayerService;
  matches: MatchService;
}

const PUBLIC_API_ROUTES = new Set(["/api/auth", "/api/health"]);

export async function buildApp({ config, auth, players, matches }: AppDeps) {
  const app = Fastify({ logger: { level: config.logLevel }, trustProxy: true });

  await app.register(cookie, { secret: config.cookieSecret });
  await app.register(rateLimit, { global: false });

  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0]!;
    if (!path.startsWith("/api/") || PUBLIC_API_ROUTES.has(path)) return;
    if (!auth.isValidSession(readSession(request))) return reply.code(401).send({ error: "unauthenticated" });
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError)
      return reply.code(400).send({ error: "invalid-request", issues: error.issues });
    if (error instanceof DomainError) return reply.code(error.status).send({ error: error.message });
    if (error.statusCode && error.statusCode < 500)
      return reply.code(error.statusCode).send({ error: error.code });
    request.log.error(error);
    return reply.code(500).send({ error: "internal" });
  });

  await app.register(healthRoutes, { prefix: "/api/health" });
  await app.register(authRoutes, { prefix: "/api/auth", auth });
  await app.register(playerRoutes, { prefix: "/api/players", players });
  await app.register(matchRoutes, { prefix: "/api/matches", matches });

  if (config.webRoot) await serveWeb(app, config.webRoot);
  return app;
}

async function serveWeb(app: FastifyInstance, root: string) {
  await app.register(fastifyStatic, {
    root,
    wildcard: false,
    setHeaders: (res, path) => {
      const immutable = path.includes(join(root, "assets"));
      res.header("Cache-Control", immutable ? "public, max-age=31536000, immutable" : "no-cache");
    },
  });
  app.setNotFoundHandler((request, reply) => {
    if (request.method !== "GET" || request.url.startsWith("/api/")) {
      return reply.code(404).send({ error: "not-found" });
    }
    return reply.sendFile("index.html");
  });
}
