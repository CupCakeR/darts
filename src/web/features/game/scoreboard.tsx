import type { Player } from "#contracts";
import { dartLabel, suggestCheckout, threeDartAverage, type X01State, type X01Turn } from "#engine";
import { de } from "../../i18n/de.ts";
import { AnimatedNumber } from "../../ui/animated-number.tsx";
import { formatAverage, formatRoute } from "./format.ts";

export interface EditTarget {
  seq: number;
  kind: "dart" | "total";
  startRemaining: number;
}

interface Chip {
  label: string;
  target: EditTarget;
}

function turnChips(turn: X01Turn): Chip[] {
  if (!turn.darts) {
    const target = { seq: turn.firstThrow, kind: "total" as const, startRemaining: turn.startRemaining };
    return [{ label: turn.bust ? de.game.bust : String(turn.scored), target }];
  }
  return turn.darts.map((dart, index) => ({
    label: dartLabel(dart),
    target: { seq: turn.firstThrow + index, kind: "dart", startRemaining: turn.startRemaining },
  }));
}

function currentChips(state: X01State): Chip[] {
  const first = state.throwCount - state.turnDarts.length;
  return state.turnDarts.map((dart, index) => ({
    label: dartLabel(dart),
    target: { seq: first + index, kind: "dart", startRemaining: state.turnStart.remaining },
  }));
}

function ChipRow({
  chips,
  slots,
  editing,
  onEdit,
  bust,
}: {
  chips: Chip[];
  slots: number;
  editing: number | null;
  onEdit: (target: EditTarget) => void;
  bust?: boolean;
}) {
  const empty = Math.max(0, slots - chips.length);
  return (
    <div className="flex items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.target.seq}
          type="button"
          onClick={() => onEdit(chip.target)}
          className={`min-h-10 min-w-14 animate-pop border-2 px-2 text-lg font-bold tabular-nums transition-colors ${
            editing === chip.target.seq ? "border-board-red bg-board-red text-white" : "border-current"
          }`}
        >
          {chip.label}
        </button>
      ))}
      {Array.from({ length: empty }, (_, index) => (
        <span key={index} className="min-h-10 min-w-14 border-2 border-dashed border-current opacity-30" />
      ))}
      {bust && (
        <span className="ml-2 animate-pop text-lg font-black text-board-red uppercase">{de.game.bust}</span>
      )}
    </div>
  );
}

function lastTurnInLeg(state: X01State, player: number) {
  return state.turns.findLast(
    (turn) => turn.player === player && turn.set === state.set && turn.leg === state.leg,
  );
}

export function Scoreboard({
  state,
  players,
  editing,
  onEdit,
}: {
  state: X01State;
  players: Player[];
  editing: number | null;
  onEdit: (target: EditTarget) => void;
}) {
  const checkout = formatRoute(suggestCheckout(state));
  const showSets = state.config.sets > 1;

  return (
    <ol className="flex flex-col gap-2">
      {state.players.map((score, index) => {
        const player = players[index]!;
        const active = index === state.current && state.winner === null;
        const lastTurn = lastTurnInLeg(state, index);
        const chips = active ? currentChips(state) : lastTurn ? turnChips(lastTurn) : [];
        const busted = !active && lastTurn?.bust;

        return (
          <li
            key={player.id}
            className={`flex flex-col gap-2 border-l-8 px-4 py-3 transition-colors duration-300 ${
              active ? "bg-ink text-paper" : "bg-white"
            } ${busted ? "animate-shake" : ""}`}
            style={{ borderLeftColor: player.color }}
          >
            <div className="flex items-baseline gap-4">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-2xl font-bold">{player.name}</span>
                <span className="text-base tabular-nums opacity-70">
                  {showSets && `${de.game.set} ${score.sets} · `}
                  {de.game.leg} {score.legs} · {de.game.average}{" "}
                  {formatAverage(threeDartAverage(state.turns, index))}
                </span>
              </div>
              <AnimatedNumber
                value={score.remaining}
                className="text-6xl leading-none font-black tabular-nums"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ChipRow chips={chips} slots={active ? 3 : 0} editing={editing} onEdit={onEdit} bust={busted} />
              {active && checkout && (
                <span key={checkout} className="animate-enter text-xl font-bold tabular-nums">
                  {checkout}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
