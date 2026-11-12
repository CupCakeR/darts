# Darts – Projektplan

A self-hosted helper that replaces the scoring part of a digital dartboard. You enter throws on a tablet; the app tracks scores, players, history and stats.

## Requirements (agreed)

| Topic       | Decision                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Hosting     | One Docker container behind the existing nginx                                                                             |
| Persistence | SQLite in a mounted volume                                                                                                 |
| Players     | Multiple player profiles, 1–n players per match                                                                            |
| Games v1    | **X01** (301/501/701, configurable) + **practice modes**. Pluggable engine so more games (e.g. Cricket) can be added later |
| X01 rules   | Configurable: start score, out rule (straight / **double** / master), in rule, legs/sets. Default **501 double-out**       |
| Input       | Per-dart input by default, plus a "turn total" keypad for fast X01                                                         |
| Extras      | Checkout suggestions, undo/edit throws                                                                                     |
| Stats       | Match history, 3-dart avg, first-9 avg, checkout %, 60+/100+/140+/180 counts, highest checkout, trends over time           |
| Auth        | One shared PIN, remembered per device                                                                                      |
| UI          | German, mobile first, **optimized for iPad (landscape and portrait)**                                                      |
| Stack       | React SPA + Node backend (no Next.js)                                                                                      |

## Tech stack

- **Single package**, pnpm, TypeScript everywhere. One `package.json`, one tsconfig
  - `src/engine`: pure game logic with no I/O. Shared by client and server. Unit-tested with Vitest
  - `src/contracts`: zod schemas + inferred types for every API request/response. This is the only coupling between web and server
  - `src/server`: Node 24 + **Fastify**, **zod** validation, **Drizzle ORM** + **better-sqlite3**. No server build step: Node runs the `.ts` files directly (type stripping), and cross-folder imports use the `#engine` / `#contracts` subpath imports from `package.json`
  - `src/web`: **Vite + React** SPA, React Router, TanStack Query, Tailwind CSS
- Boundaries are enforced by ESLint import rules (`eslint-plugin-boundaries`), not by package separation
- **PWA**: web manifest + "Add to Home Screen" on iPad, so it runs fullscreen without Safari's UI. Uses the Screen Wake Lock API so the screen doesn't turn off mid-game
- The production container serves the built SPA and `/api` from one Fastify process on one port

## Architecture

### Module boundaries

Each box can be replaced without touching the others, as long as its interface stays the same.

```
src/engine/          pure functions, imports nothing outside itself
src/contracts/       zod schemas (API shape), imports only zod
src/server/
  main.ts            composition root: config → db → repositories → services → app
  app.ts             buildApp(deps): FastifyInstance   (no globals, no imports of concrete adapters)
  config.ts          env parsing with zod
  db/                drizzle schema, client, migrations
  modules/<name>/
    routes.ts        Fastify plugin, receives its service via plugin options
    service.ts       createXService(deps) → business logic, depends on interfaces only
    repository.ts    interface (port)
    sqlite.ts        drizzle implementation (adapter)
src/web/
  data/              typed API client built on contracts + TanStack Query hooks (not `api/`: Vite proxies that path)
  features/<name>/   setup, game, players, stats, auth
  ui/                design primitives; the only place visual decisions live
  i18n/de.ts         all strings
```

Allowed imports (lint error otherwise):

| From        | May import              |
| ----------- | ----------------------- |
| `engine`    | nothing                 |
| `contracts` | `zod`, `engine` (types) |
| `server`    | `engine`, `contracts`   |
| `web`       | `engine`, `contracts`   |

### Dependency injection

Fastify has no DI container. It has encapsulated plugins with **plugin options** and **decorators**. The plan uses **plain constructor injection with a single composition root**, so there is no container library, no `reflect-metadata` and no decorators:

```ts
const db = openDatabase(config.databasePath);
const players = createPlayerService({ repo: createSqlitePlayerRepository(db) });
const matches = createMatchService({ repo: createSqliteMatchRepository(db), engine: modes });
const app = buildApp({ config, players, matches, auth: createAuthService(config) });
```

```ts
app.register(playerRoutes, { prefix: "/api/players", players: deps.players });
```

Tests call `buildApp` with in-memory fakes and use `app.inject()`, so no port or real database is needed. If wiring grows painful later, `@fastify/awilix` is the escape hatch, but it is not needed at this size.

### Event-sourced throws

The database stores the **match config + the ordered list of throws**. Game state (scores, whose turn, busts, leg/set wins) is never stored. It is always derived by replaying the throws through the engine.

- **Undo** = delete the last throw. **Edit** = replace a throw, then replay
- No inconsistent state is possible, and stats can be recomputed at any time
- The client runs the same engine for instant feedback. The server is the source of truth: it validates each throw by replaying, persists it, and returns the new state. After a reload or iPad sleep, the client resumes from the server

### Game engine interface (pluggable)

```ts
interface GameMode<Config, State> {
  id: string; // "x01", "atc", "bobs27", ...
  configSchema: ZodSchema<Config>;
  input: "dart" | "dart-or-total"; // which input pads are allowed
  init(config: Config, players: PlayerId[]): State;
  apply(state: State, t: Throw): State; // pure
  view(state: State): GameView; // what the UI renders
  isFinished(state: State): boolean;
}
```

Adding Cricket later means adding one file in `src/engine/modes/` plus a scoreboard component.

### Data model (SQLite)

- `players`: id, name, color/avatar, created_at, archived
- `matches`: id, mode, config (JSON), status (active/finished/abandoned), winner_id, started_at, finished_at
- `match_players`: match_id, player_id, order
- `throws`: id, match_id, seq, kind (`dart` | `total`), segment (1–20, 25, 0 = miss), multiplier (1/2/3), total + darts (for turn-total entries), created_at

Player, leg, set and turn are not stored per throw. They are derived by replaying, so editing an earlier throw (e.g. one that turns into a bust) can never leave stale values behind. A `settings` table gets added when it is first needed

Turn-total entries store one row per turn. When a total-entry turn finishes a leg, the app asks "how many darts?" so averages stay correct. Checkout % is only computed from per-dart turns, since only those record attempts at a double.

## Game modes v1

1. **X01**: 301/501/701/custom, straight/double/master out, optional double-in, first to N legs / best of N sets. Bust detection (below 0, landing on 1 with double-out, finishing without a double) resets the turn
2. **Around the Clock** (practice): hit 1 → 20 → bull in order. Option: doubles only / trebles only. Tracks darts needed
3. **Bob's 27** (doubles practice): start at 27. Each round, throw 3 darts at the next double (D1, D2, …, Bull): add for hits, subtract if you miss all three
4. **Checkout training**: random or fixed finish (e.g. 2–170 or "121 up"). Tracks success rate per finish
5. **Scoring practice**: N rounds at T20 (or a chosen target), tracks the average

## Checkout suggestions

Computed in the engine (not a hardcoded table) for every remaining score ≤ 170. The calculation respects the out rule and the darts left in the turn (3/2/1). It prefers standard routes (T20 → T19 → T18 …, D16/D20/D8 finishes, avoiding bull where possible). Shown next to the active player's score. Suggestions only update for per-dart input.

## UI / UX (German)

**Screens:** PIN → Home (new game, resume game, players, stats) → game setup (mode, players + order, options; remembers the last settings) → **game screen** → match summary → stats.

**Game screen, iPad landscape:**

```
┌──────────────────────────────┬─────────────────────────────┐
│  Scoreboard                  │  Input                      │
│  ▶ Anna     121   Ø 54.2     │  [Single][Double][Triple]   │
│    T20 T11 D14               │   1  2  3  4  5  6  7       │
│    Ben      301   Ø 41.0     │   8  9 10 11 12 13 14       │
│                              │  15 16 17 18 19 20          │
│  Current turn: T20 · 19 · _  │  [ 25 ][ Bull ][ Miss ]     │
│  Leg 2/3 · Set 1             │  [↶ Undo]   [⌨ Total]       │
└──────────────────────────────┴─────────────────────────────┘
```

- Portrait / phone: scoreboard on top (compact), input pad at the bottom within thumb reach
- Large touch targets (≥ 60 px), no double-tap zoom, haptic/visual feedback on each dart
- The multiplier resets to Single after each dart. Bust/leg win shows a short overlay, then advances automatically
- The turn-total keypad (0–9, presets like 26/41/45/60/81/85/100/140/180) can be toggled for X01
- Undo goes back across turns and legs. Tapping a past turn in the history lets you edit it
- Visual direction is worked out together with the user, see `docs/ui.md`. All strings live in one `de.ts` file

## Auth

- `APP_PIN` env var. `POST /api/auth` checks it (rate-limited) and sets a signed httpOnly cookie valid for 1 year
- All `/api/*` routes except `/api/auth` and `/api/health` require the cookie
- You can additionally restrict access to the LAN in the reverse proxy

## Deployment

- Multi-stage Dockerfile (`node:24-slim`; better-sqlite3 needs a glibc build): install → build the web app → slim runtime with production deps only, running as a non-root user
- GitHub Actions (`.github/workflows/image.yml`) runs `pnpm check`, then builds the image and pushes it to `ghcr.io/<owner>/<repo>`. Pushes to `master` become `latest` + `sha-…`, and `v*` tags become semver tags
- The server pulls the image and runs it with a volume on `/data` and the env vars `APP_PIN` and `COOKIE_SECRET`. Container port 3000. Reverse proxy and compose setup live on the server, not in this repo
- SQLite runs in WAL mode. Migrations run automatically at startup. A nightly `VACUUM INTO /data/backups/…` keeps the last N backups
- `GET /api/health` for the container healthcheck

## Milestones

1. **Skeleton**: single package with lint-enforced boundaries, Fastify + Vite dev setup, Drizzle schema + migrations, Docker build, PIN auth
2. **Engine X01**: rules, busts, legs/sets, checkout calculation, with thorough Vitest coverage (most of the correctness risk is here)
3. **Players + game setup + game screen (X01)**: per-dart and total input, undo/edit, resume an active match after reload
4. **Tablet polish + PWA**: landscape/portrait layouts, wake lock, home-screen install, feedback overlays
5. **Stats**: match history, player profile with averages/trends (charts), records
6. **Practice modes**: Around the Clock, Bob's 27, checkout training, scoring practice
7. **Later / optional**: Cricket, live scoreboard on a second screen (WebSocket), voice caller, CSV export

## Resolved decisions

- Hosted on its own subdomain, so the Vite `base` stays `/`
- Players can only be archived, never deleted. Archived players are hidden from setup but keep their history and stats
