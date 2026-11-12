import type { Match } from "#contracts";
import { Link, useNavigate } from "react-router";
import { useCreateMatch } from "../../data/matches.ts";
import { de } from "../../i18n/de.ts";
import { Button } from "../../ui/button.tsx";

export function MatchOver({ match, winner, onUndo }: { match: Match; winner: number; onUndo: () => void }) {
  const createMatch = useCreateMatch();
  const navigate = useNavigate();
  const ids = match.players.map((player) => player.id);

  const rematch = () =>
    createMatch.mutate(
      { mode: match.mode, config: match.config, playerIds: [...ids.slice(1), ...ids.slice(0, 1)] },
      { onSuccess: (next) => navigate(`/match/${next.id}`, { replace: true }) },
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ink/70 p-6">
      <div className="flex w-full max-w-md flex-col gap-4 bg-paper p-6">
        <p className="text-4xl font-black">
          {match.players[winner]!.name} {de.game.wins}
        </p>
        <Button onClick={rematch} disabled={createMatch.isPending}>
          {de.game.rematch}
        </Button>
        <Button variant="plain" onClick={onUndo}>
          {de.game.undo}
        </Button>
        <Link to="/" className="text-center text-lg underline underline-offset-4">
          {de.game.toHome}
        </Link>
      </div>
    </div>
  );
}
