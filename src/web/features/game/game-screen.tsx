import type { Match } from "#contracts";
import { replay, x01, type Dart, type Throw } from "#engine";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../../data/client.ts";
import {
  applyChange,
  useAbandonMatch,
  useMatch,
  useThrowChanges,
  type ThrowChange,
} from "../../data/matches.ts";
import { de } from "../../i18n/de.ts";
import { PadButton } from "../../ui/pad-button.tsx";
import { Stamp } from "../../ui/stamp.tsx";
import { TABLET_QUERY, useMediaQuery } from "../../ui/use-media-query.ts";
import { DartboardPad } from "./dartboard-pad.tsx";
import { DartPad } from "./dart-pad.tsx";
import { MatchOver } from "./match-over.tsx";
import { Scoreboard, type EditTarget } from "./scoreboard.tsx";
import { TotalPad } from "./total-pad.tsx";

type InputMode = "board" | "dart" | "total";

const errorMessage = (code: string) => de.game.errors[code] ?? de.common.error;

function X01Game({ match }: { match: Match }) {
  const navigate = useNavigate();
  const changes = useThrowChanges(match.id);
  const abandon = useAbandonMatch();
  const isTablet = useMediaQuery(TABLET_QUERY);
  const [chosenMode, setInputMode] = useState<InputMode>(isTablet ? "board" : "dart");
  const inputMode = chosenMode === "board" && !isTablet ? "dart" : chosenMode;
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedThrows] = useState(match.throws.length);

  const replayed = useMemo(
    () => replay(x01, match.config, match.players.length, match.throws),
    [match.config, match.players.length, match.throws],
  );
  if (!replayed.ok) return <p className="p-6 text-board-red">{errorMessage(replayed.error)}</p>;
  const state = replayed.state;

  const submit = (change: ThrowChange) => {
    const check = replay(x01, match.config, match.players.length, applyChange(match.throws, change));
    if (!check.ok) return setError(errorMessage(check.error));
    setError(null);
    setEditing(null);
    changes.submit(change);
  };

  const submitThrow = (input: Throw) =>
    submit(editing ? { type: "replace", seq: editing.seq, input } : { type: "add", input });

  const startEdit = (target: EditTarget) => {
    setEditing((current) => (current?.seq === target.seq ? null : target));
    if (target.kind === "total") setInputMode("total");
    else if (inputMode === "total") setInputMode(isTablet ? "board" : "dart");
  };

  const undo = () => {
    if (editing) return setEditing(null);
    if (match.throws.length > 0) submit({ type: "undo" });
  };

  const end = () => {
    if (!window.confirm(de.game.confirmAbandon)) return;
    abandon.mutate(match.id, { onSuccess: () => navigate("/", { replace: true }) });
  };

  const serverError = changes.error instanceof ApiError ? errorMessage(changes.error.message) : null;
  const finished = state.winner !== null;
  const lastTurn = state.turns.at(-1);
  const celebrate = lastTurn?.scored === 180 && lastTurn.firstThrow >= loadedThrows;
  const totalRemaining =
    editing?.kind === "total" ? editing.startRemaining : state.players[state.current]!.remaining;

  return (
    <div className="grid h-dvh gap-3 overflow-hidden p-3 portrait:grid-rows-[auto_1fr] landscape:grid-cols-2">
      <section className="flex min-h-0 flex-col gap-3 overflow-y-auto">
        <header className="flex items-center gap-4 text-lg">
          <Link to="/" className="underline underline-offset-4">
            {de.common.back}
          </Link>
          <span className="flex-1 font-bold tabular-nums">
            {match.config.sets > 1 && `${de.game.set} ${state.set} · `}
            {de.game.leg} {state.leg} · {match.config.startScore}
          </span>
          <button type="button" onClick={end} className="underline underline-offset-4">
            {de.game.abandon}
          </button>
        </header>
        <Scoreboard state={state} players={match.players} editing={editing?.seq ?? null} onEdit={startEdit} />
        {(error ?? serverError) && (
          <p key={error ?? serverError} className="animate-shake text-lg font-bold text-board-red">
            {error ?? serverError}
          </p>
        )}
      </section>

      <section className="flex min-h-0 flex-col gap-1.5">
        <div className="grid auto-cols-fr grid-flow-col gap-1.5">
          {isTablet && (
            <PadButton
              tone={inputMode === "board" ? "active" : "action"}
              onClick={() => setInputMode("board")}
            >
              {de.game.boardMode}
            </PadButton>
          )}
          <PadButton tone={inputMode === "dart" ? "active" : "action"} onClick={() => setInputMode("dart")}>
            {de.game.dartMode}
          </PadButton>
          <PadButton tone={inputMode === "total" ? "active" : "action"} onClick={() => setInputMode("total")}>
            {de.game.totalMode}
          </PadButton>
          <PadButton tone="action" onClick={undo} disabled={!editing && match.throws.length === 0}>
            {editing ? de.game.cancelEdit : de.game.undo}
          </PadButton>
        </div>
        {editing && <p className="animate-enter font-bold text-board-red">{de.game.editing}</p>}
        <div key={inputMode} className="min-h-0 flex-1 animate-enter">
          {inputMode === "board" && (
            <DartboardPad
              disabled={finished && !editing}
              onDart={(dart: Dart) => submitThrow({ kind: "dart", dart })}
            />
          )}
          {inputMode === "dart" && (
            <DartPad
              disabled={finished && !editing}
              onDart={(dart: Dart) => submitThrow({ kind: "dart", dart })}
            />
          )}
          {inputMode === "total" && (
            <TotalPad
              remaining={totalRemaining}
              outRule={match.config.outRule}
              disabled={finished && !editing}
              onTotal={(score, darts) => submitThrow({ kind: "total", score, darts })}
            />
          )}
        </div>
      </section>

      {celebrate && <Stamp key={lastTurn.firstThrow}>180</Stamp>}
      {finished && !editing && <MatchOver match={match} winner={state.winner!} onUndo={undo} />}
    </div>
  );
}

export function GameScreen() {
  const { id } = useParams();
  const match = useMatch(id!);
  if (match.error) return <p className="p-6 text-board-red">{de.common.error}</p>;
  if (!match.data) return null;
  return <X01Game match={match.data} />;
}
