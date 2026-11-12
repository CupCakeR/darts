# Decisions

Append-only. One line of decision, one line of reason.

- **React SPA + Fastify, no Next.js.** SSR adds nothing for a LAN tablet app
- **SQLite via Drizzle + better-sqlite3.** Single-file persistence, simple backups, typed queries
- **Event-sourced throws.** Only config + throws are stored and state is replayed. Undo/edit is trivial and state can't drift
- **Single package, folder boundaries enforced by ESLint.** Workspaces add config and build-order overhead with no benefit for one app in one container
- **Shared engine module.** The client gets instant feedback and the server validates with the same code
- **Manual DI with a composition root.** Fastify has no container. Factories + plugin options are enough and stay explicit
- **Shared PIN auth, signed cookie (1 year).** Home use. Accounts would be overkill
- **German UI only.** Strings are still centralized in `de.ts`
- **Subdomain hosting.** Vite base stays `/`
- **Players are archive-only.** History and stats must never lose references
- **X01 default 501 double-out, fully configurable.**
- **Checkout % only from per-dart turns.** Turn-total entries don't record attempts at a double
- **Node 24 runs the server's TypeScript directly.** No server bundler, so dev and prod run the same files
- **Contracts may import engine types.** API responses expose engine state, so the types come from one place
- **Throws store no player/leg/turn.** Those are derived. Editing an earlier dart can shift whose turn it is, so stored values would go stale
- **Checkout routes are computed with a cost heuristic, not a lookup table.** That covers every out rule and darts-left case. Tune the weights in `checkout.ts` and add a test for the route
- **TypeScript 6, not 7.** typescript-eslint doesn't support 7 yet
- **`no-non-null-assertion` is off.** `noUncheckedIndexedAccess` is on, and the engine indexes players by position
- **Deployment is a GHCR image built by GitHub Actions.** The server pulls it. Reverse proxy and compose config are not part of this repo
