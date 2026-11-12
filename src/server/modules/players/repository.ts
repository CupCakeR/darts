export interface PlayerRecord {
  id: string;
  name: string;
  color: string;
  archivedAt: Date | null;
  createdAt: Date;
}

export interface PlayerRepository {
  list(options: { includeArchived: boolean }): Promise<PlayerRecord[]>;
  findById(id: string): Promise<PlayerRecord | undefined>;
  findByIds(ids: readonly string[]): Promise<PlayerRecord[]>;
  findActiveByName(name: string): Promise<PlayerRecord | undefined>;
  insert(record: PlayerRecord): Promise<void>;
  update(id: string, patch: Partial<Omit<PlayerRecord, "id" | "createdAt">>): Promise<PlayerRecord>;
}
