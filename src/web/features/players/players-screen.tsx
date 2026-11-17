import type { Player } from "#contracts";
import { useState, type FormEvent } from "react";
import { ApiError } from "../../data/client.ts";
import { useCreatePlayer, usePlayers, useUpdatePlayer } from "../../data/queries.ts";
import { de } from "../../i18n/de.ts";
import { Button } from "../../ui/button.tsx";
import { Screen } from "../../ui/screen.tsx";
import { TextInput } from "../../ui/text-input.tsx";
import { PLAYER_COLORS } from "./colors.ts";

function AddPlayerForm({ nextColor }: { nextColor: string }) {
  const [name, setName] = useState("");
  const create = useCreatePlayer();
  const nameTaken = create.error instanceof ApiError && create.error.status === 409;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({ name, color: nextColor }, { onSuccess: () => setName("") });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <TextInput
          className="flex-1"
          placeholder={de.players.namePlaceholder}
          maxLength={24}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          {de.players.add}
        </Button>
      </div>
      {nameTaken && <p className="italic text-board-red">{de.players.nameTaken}</p>}
    </form>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const update = useUpdatePlayer();
  const toggleArchived = () => update.mutate({ id: player.id, patch: { archived: !player.archived } });

  return (
    <li className="flex min-h-16 items-center gap-4 border-b border-dashed border-ink/30">
      <span className="size-6 shrink-0" style={{ backgroundColor: player.color }} />
      <span className={`flex-1 font-display text-xl ${player.archived ? "text-ink/40" : ""}`}>
        {player.name}
      </span>
      <Button variant="plain" onClick={toggleArchived} disabled={update.isPending}>
        {player.archived ? de.players.restore : de.players.archive}
      </Button>
    </li>
  );
}

export function PlayersScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const players = usePlayers(showArchived);
  const active = players.data?.filter((player) => !player.archived) ?? [];
  const nextColor = PLAYER_COLORS[active.length % PLAYER_COLORS.length]!;

  return (
    <Screen title={de.players.title} back="/">
      <AddPlayerForm nextColor={nextColor} />
      <label className="flex items-center gap-3 text-lg">
        <input
          type="checkbox"
          className="size-6"
          checked={showArchived}
          onChange={(event) => setShowArchived(event.target.checked)}
        />
        {de.players.showArchived}
      </label>
      {players.data?.length === 0 && <p className="italic text-ink/60">{de.players.empty}</p>}
      <ul>
        {players.data?.map((player) => (
          <PlayerRow key={player.id} player={player} />
        ))}
      </ul>
    </Screen>
  );
}
