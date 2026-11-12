# Darts

Self-hosted scoring app for a non-digital dartboard. React SPA + Fastify, SQLite, one Docker container behind nginx on its own subdomain. UI is German and optimized for iPad.

## Read first

- `docs/progress.md`: current state, what's next. **Read at the start of every session, update at the end**
- `docs/plan.md`: scope, architecture, data model, milestones
- `docs/decisions.md`: why things are the way they are. Don't reverse an entry without asking
- `docs/ui.md`: agreed visual direction. Read before touching anything in `src/web`

## Code rules

- Clean, small, readable functions. Names over comments
- No comment noise. A comment only explains a non-obvious _why_. Never restate code, never leave commented-out code, no section banners
- Dependency injection via factory functions and one composition root (`src/server/main.ts`). No DI container, no decorators, no module-level singletons
- Modules depend on interfaces, not implementations. Respect the boundaries in `docs/plan.md#module-boundaries`
- `src/engine` stays pure: no I/O, no dates, no randomness passed in implicitly
- API shapes live only in `src/contracts`. Web and server never import from each other. Import boundaries are lint-enforced, see `docs/plan.md#module-boundaries`
- Validate at the edges with zod, trust types inside
- All UI strings go in `src/web/i18n/de.ts`
- Visual styling lives in `src/web/ui/` primitives and theme tokens, not ad hoc in features
- Engine changes need Vitest tests. Bugs get a regression test first

## Commands

- `pnpm dev`: server (:3000, watch mode) + Vite (:5173, proxies `/api`). Needs a `.env`, see `.env.example`
- `pnpm check`: typecheck + lint + tests. Must pass before you finish
- `pnpm test` / `pnpm test:watch`: Vitest
- `pnpm build`: builds the web app to `dist/web`. The server has no build step
- `pnpm db:generate`: after changing `src/server/db/schema.ts`, generates a migration. Migrations run on startup
- Production: CI builds the image and pushes it to GHCR (`.github/workflows/image.yml`). The container needs `APP_PIN`, `COOKIE_SECRET` and a volume on `/data` that uid 1000 can write to

## Conventions

- Relative imports use explicit `.ts`/`.tsx` extensions. Cross-folder imports use `#engine` and `#contracts`
- TypeScript is limited to erasable syntax (no enums, namespaces or parameter properties), because Node runs the server source directly
- Server modules follow `routes.ts` / `service.ts` / `repository.ts` / `sqlite.ts`. New dependencies get wired up in `main.ts` only
- Services throw `DomainError` (`src/server/errors.ts`). Routes parse input with contract schemas, and the error handler maps zod/domain errors to HTTP
- The engine works with player indices, never ids. The server maps indices to ids

## Workflow

- Work in small, verifiable steps that match the milestones
- At the end of a session: update `docs/progress.md` and add any new decision to `docs/decisions.md`
