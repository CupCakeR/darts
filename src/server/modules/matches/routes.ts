import { addThrowSchema, createMatchSchema, listMatchesQuerySchema, throwSchema } from "#contracts";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { MatchService } from "./service.ts";

const idParams = z.object({ id: z.string() });
const throwParams = idParams.extend({ seq: z.coerce.number().int().min(0) });

export const matchRoutes: FastifyPluginAsync<{ matches: MatchService }> = async (app, { matches }) => {
  app.get("/", async (request) => matches.list(listMatchesQuerySchema.parse(request.query).status));

  app.post("/", async (request, reply) => {
    const match = await matches.create(createMatchSchema.parse(request.body));
    return reply.code(201).send(match);
  });

  app.get("/:id", async (request) => matches.get(idParams.parse(request.params).id));

  app.post("/:id/throws", async (request) => {
    const { id } = idParams.parse(request.params);
    const body = addThrowSchema.parse(request.body);
    return matches.addThrow(id, body.seq, body.throw);
  });

  app.put("/:id/throws/:seq", async (request) => {
    const { id, seq } = throwParams.parse(request.params);
    return matches.replaceThrow(id, seq, throwSchema.parse(request.body));
  });

  app.delete("/:id/throws/last", async (request) => matches.undo(idParams.parse(request.params).id));

  app.post("/:id/abandon", async (request) => matches.abandon(idParams.parse(request.params).id));
};
