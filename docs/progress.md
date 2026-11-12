# Progress

## Status

Milestones 1 and 2 are done. `pnpm check` is green (41 tests). The Docker image has not been built yet, because Docker isn't installed on the dev machine.

## Milestones

- [x] 1. Skeleton: single package + lint boundaries, dev setup, Drizzle schema + migrations, Dockerfile + CI image build, PIN auth, players API + minimal players screen
- [x] 2. Engine X01 + checkout calculation, with tests
- [ ] 3. Matches API (create, throw, undo, edit, resume), game setup, game screen (X01)
- [ ] 4. Tablet polish + PWA (manifest, icons, wake lock)
- [ ] 5. Stats
- [ ] 6. Practice modes
- [ ] 7. Later: Cricket, live scoreboard, voice caller, export, nightly `VACUUM INTO` backups

## Next

- Agree on a UI direction (`docs/ui.md`), ideally with mockups of the game screen at iPad size
- Milestone 3: `src/server/modules/matches/` (replay throws through `#engine`, map player index → id), then setup + game screens

## Notes for the next session

- The web UI is a functional, unstyled placeholder (PIN, home, players). Restyle it once `docs/ui.md` is agreed
- The `matches`, `match_players` and `throws` tables already exist in the first migration but are unused
- Verify the first CI image build (better-sqlite3 prebuilds) and the first run on the server (uid 1000 on the data volume)
