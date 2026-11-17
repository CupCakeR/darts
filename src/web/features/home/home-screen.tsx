import type { MatchSummary } from "#contracts";
import { Link } from "react-router";
import { useMatches } from "../../data/matches.ts";
import { de } from "../../i18n/de.ts";
import { linkButton } from "../../ui/button.tsx";

const time = new Intl.DateTimeFormat("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" });

function ResumeList({ matches }: { matches: MatchSummary[] }) {
  if (matches.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="label-caps opacity-70">{de.home.resume}</h2>
      {matches.map((match) => (
        <Link
          key={match.id}
          to={`/match/${match.id}`}
          className="flex min-h-14 items-center justify-between gap-4 rounded-xs border-2 border-ink bg-key px-5 py-3 text-lg"
        >
          <span className="font-display">{match.players.map((player) => player.name).join(" · ")}</span>
          <span className="italic opacity-70 tabular-nums">
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
    <main className="mx-auto flex min-h-dvh max-w-3xl animate-enter flex-col justify-center gap-6 p-6">
      <h1 className="font-display text-6xl">{de.appName}</h1>
      <div className="flex flex-col gap-3">
        <Link to="/setup" className={linkButton("primary")}>
          {de.home.newGame}
        </Link>
        <Link to="/players" className={linkButton("plain")}>
          {de.home.players}
        </Link>
      </div>
      <ResumeList matches={active.data ?? []} />
    </main>
  );
}
