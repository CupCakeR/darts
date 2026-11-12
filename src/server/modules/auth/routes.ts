import { loginSchema, type Session } from "#contracts";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import type { AuthService } from "./service.ts";

export const SESSION_COOKIE = "darts_session";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readSession(request: FastifyRequest): string | null {
  const raw = request.cookies[SESSION_COOKIE];
  if (!raw) return null;
  const unsigned = request.unsignCookie(raw);
  return unsigned.valid ? unsigned.value : null;
}

export const authRoutes: FastifyPluginAsync<{ auth: AuthService }> = async (app, { auth }) => {
  app.get("/", async (request): Promise<Session> => ({
    authenticated: auth.isValidSession(readSession(request)),
  }));

  app.post("/", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const { pin } = loginSchema.parse(request.body);
    if (!auth.verifyPin(pin)) return reply.code(401).send({ error: "invalid-pin" });
    return reply
      .setCookie(SESSION_COOKIE, auth.sessionToken, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: "auto",
        signed: true,
        maxAge: ONE_YEAR_SECONDS,
      })
      .code(204)
      .send();
  });

  app.delete("/", async (_request, reply) =>
    reply.clearCookie(SESSION_COOKIE, { path: "/" }).code(204).send(),
  );
};
