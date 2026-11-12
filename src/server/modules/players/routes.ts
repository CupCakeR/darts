import { createPlayerSchema, listPlayersQuerySchema, updatePlayerSchema } from "#contracts";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { PlayerService } from "./service.ts";

const idParams = z.object({ id: z.string() });

export const playerRoutes: FastifyPluginAsync<{ players: PlayerService }> = async (app, { players }) => {
  app.get("/", async (request) => {
    const { archived } = listPlayersQuerySchema.parse(request.query);
    return players.list(archived);
  });

  app.post("/", async (request, reply) => {
    const player = await players.create(createPlayerSchema.parse(request.body));
    return reply.code(201).send(player);
  });

  app.patch("/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    return players.update(id, updatePlayerSchema.parse(request.body));
  });
};
