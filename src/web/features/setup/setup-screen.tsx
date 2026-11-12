import type { Player } from "#contracts";
import type { Rule, X01Config } from "#engine";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCreateMatch } from "../../data/matches.ts";
import { usePlayers } from "../../data/queries.ts";
import { de } from "../../i18n/de.ts";
import { Button } from "../../ui/button.tsx";
import { Field } from "../../ui/field.tsx";
import { Screen } from "../../ui/screen.tsx";
import { Segmented } from "../../ui/segmented.tsx";
import { Stepper } from "../../ui/stepper.tsx";
import { loadLastSetup, saveLastSetup } from "./last-setup.ts";

const START_SCORES = [301, 501, 701].map((value) => ({ value, label: String(value) }));
const ruleOptions = (rules: Rule[]) => rules.map((value) => ({ value, label: de.setup.rules[value] }));

function PlayerPicker({
  players,
  selected,
  onChange,
}: {
  players: Player[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((other) => other !== id) : [...selected, id]);

  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player) => {
        const position = selected.indexOf(player.id);
        return (
          <button
            key={player.id}
            type="button"
            onClick={() => toggle(player.id)}
            className={`flex min-h-14 items-center gap-3 border-2 px-4 text-lg font-semibold ${
              position >= 0 ? "border-ink bg-ink text-paper" : "border-ink/30"
            }`}
          >
            <span className="size-4" style={{ backgroundColor: player.color }} />
            {player.name}
            {position >= 0 && <span className="tabular-nums">{position + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function SetupScreen() {
  const players = usePlayers();
  const createMatch = useCreateMatch();
  const navigate = useNavigate();
  const [initial] = useState(loadLastSetup);
  const [config, setConfig] = useState<X01Config>(initial.config);
  const [selected, setSelected] = useState(initial.playerIds);

  const activeIds = new Set(players.data?.map((player) => player.id));
  const playerIds = selected.filter((id) => activeIds.has(id));
  const update = (patch: Partial<X01Config>) => setConfig((current) => ({ ...current, ...patch }));

  const start = () => {
    saveLastSetup({ config, playerIds });
    createMatch.mutate(
      { mode: "x01", config, playerIds },
      { onSuccess: (match) => navigate(`/match/${match.id}`, { replace: true }) },
    );
  };

  return (
    <Screen title={de.setup.title} back="/">
      <Field label={de.setup.players}>
        {players.data?.length === 0 ? (
          <Link to="/players" className="text-lg underline underline-offset-4">
            {de.setup.noPlayers}
          </Link>
        ) : (
          <PlayerPicker players={players.data ?? []} selected={playerIds} onChange={setSelected} />
        )}
      </Field>
      <Field label={de.setup.startScore}>
        <Segmented
          options={START_SCORES}
          value={config.startScore}
          onChange={(startScore) => update({ startScore })}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={de.setup.inRule}>
          <Segmented
            options={ruleOptions(["straight", "double"])}
            value={config.inRule}
            onChange={(inRule) => update({ inRule })}
          />
        </Field>
        <Field label={de.setup.outRule}>
          <Segmented
            options={ruleOptions(["straight", "double", "master"])}
            value={config.outRule}
            onChange={(outRule) => update({ outRule })}
          />
        </Field>
        <Field label={de.setup.legs}>
          <Stepper
            value={config.legsPerSet}
            min={1}
            max={11}
            onChange={(legsPerSet) => update({ legsPerSet })}
          />
        </Field>
        <Field label={de.setup.sets}>
          <Stepper value={config.sets} min={1} max={7} onChange={(sets) => update({ sets })} />
        </Field>
      </div>
      <Button className="mt-auto" disabled={playerIds.length === 0 || createMatch.isPending} onClick={start}>
        {de.setup.start}
      </Button>
    </Screen>
  );
}
