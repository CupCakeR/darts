import type { MatchSummary } from "#contracts";
import { Link } from "react-router";
import { useMatches } from "../../data/matches.ts";
import { de } from "../../i18n/de.ts";

const time = new Intl.DateTimeFormat("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" });

function ResumeList({ matches }: { matches: MatchSummary[] }) {
  if (matches.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-bold tracking-wide uppercase">{de.home.resume}</h2>
      {matches.map((match) => (
        <Link
          key={match.id}
          to={`/match/${match.id}`}
          className="flex min-h-14 items-center justify-between gap-4 border-2 border-ink px-5 py-3 text-lg"
        >
          <span className="font-semibold">{match.players.map((player) => player.name).join(" · ")}</span>
          <span className="tabular-nums opacity-70">
            {match.config.startScore} · {time.format(new Date(match.startedAt))}
          </span>
        </Link>
      ))}
    </section>
  );
}

export function HomeScreen() {
  const active = useMatches("active");

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 p-6">
      <h1 className="text-5xl font-black">{de.appName}</h1>
      <div className="flex flex-col gap-3">
        <Link to="/setup" className="min-h-14 bg-ink px-5 py-3 text-xl font-semibold text-paper">
          {de.home.newGame}
        </Link>
        <Link to="/players" className="min-h-14 border-2 border-ink px-5 py-3 text-xl font-semibold">
          {de.home.players}
        </Link>
      </div>
      <ResumeList matches={active.data ?? []} />
    </main>
  );
}
