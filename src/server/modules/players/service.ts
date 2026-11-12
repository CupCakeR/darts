import type { CreatePlayer, Player, UpdatePlayer } from "#contracts";
import { conflict, notFound } from "../../errors.ts";
import type { PlayerRecord, PlayerRepository } from "./repository.ts";

interface Deps {
  repo: PlayerRepository;
  newId: () => string;
  now: () => Date;
}

const toPlayer = (record: PlayerRecord): Player => ({
  id: record.id,
  name: record.name,
  color: record.color,
  archived: record.archivedAt !== null,
  createdAt: record.createdAt.toISOString(),
});

export function createPlayerService({ repo, newId, now }: Deps) {
  async function assertNameFree(name: string, exceptId?: string) {
    const existing = await repo.findActiveByName(name);
    if (existing && existing.id !== exceptId) throw conflict("player-name-taken");
  }

  return {
    async list(includeArchived: boolean): Promise<Player[]> {
      return (await repo.list({ includeArchived })).map(toPlayer);
    },

    async getMany(ids: readonly string[]): Promise<Player[]> {
      const byId = new Map((await repo.findByIds(ids)).map((record) => [record.id, record]));
      return ids.map((id) => {
        const record = byId.get(id);
        if (!record) throw notFound("player");
        return toPlayer(record);
      });
    },

    async create(input: CreatePlayer): Promise<Player> {
      await assertNameFree(input.name);
      const record = { id: newId(), ...input, archivedAt: null, createdAt: now() };
      await repo.insert(record);
      return toPlayer(record);
    },

    async update(id: string, { archived, ...patch }: UpdatePlayer): Promise<Player> {
      const current = await repo.findById(id);
      if (!current) throw notFound("player");
      const willBeActive = archived === undefined ? current.archivedAt === null : !archived;
      if (willBeActive) await assertNameFree(patch.name ?? current.name, id);
      const archivedAt = archived === undefined ? current.archivedAt : archived ? now() : null;
      return toPlayer(await repo.update(id, { ...patch, archivedAt }));
    },
  };
}

export type PlayerService = ReturnType<typeof createPlayerService>;
