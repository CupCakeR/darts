import { Link } from "react-router";
import { de } from "../../i18n/de.ts";

export function HomeScreen() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 p-6">
      <h1 className="text-5xl font-black">{de.appName}</h1>
      <span className="min-h-14 border-2 border-dashed border-ink/40 px-5 py-3 text-lg text-ink/50">
        {de.home.newGame} · {de.home.comingSoon}
      </span>
      <Link to="/players" className="min-h-14 bg-ink px-5 py-3 text-lg font-semibold text-paper">
        {de.home.players}
      </Link>
    </main>
  );
}
