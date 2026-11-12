# Progress

## Status

Milestones 1–3 are done, but milestone 3 still needs testing on a real device. `pnpm check` is green (52 tests). The Docker image has not been built yet, because Docker isn't installed on the dev machine.

## Milestones

- [x] 1. Skeleton: single package + lint boundaries, dev setup, Drizzle schema + migrations, Dockerfile + CI image build, PIN auth, players API + minimal players screen
- [x] 2. Engine X01 + checkout calculation, with tests
- [x] 3. Matches API (create, throw, undo, edit, resume, abandon), game setup, game screen (X01)
- [ ] 4. Tablet polish + PWA (manifest, icons, wake lock)
- [ ] 5. Stats
- [ ] 6. Practice modes
- [ ] 7. Later: Cricket, live scoreboard, voice caller, export, nightly `VACUUM INTO` backups

## Next

- The user tests a real game on the iPad. Collect feedback on the input flow first, then on looks
- Agree on a UI direction (`docs/ui.md`). The current screens are functional placeholders
- Milestone 4: PWA manifest + icons, wake lock, layout polish

## Notes for the next session

- Game screen: `src/web/features/game/`. Engine state is replayed on the client from `match.throws`. Changes are optimistic and serialized per match through a TanStack mutation scope (`src/web/data/matches.ts`)
- The server rejects a throw unless `seq` equals the current throw count (409 `stale-seq`), which guards against double submits and a second device
- Editing: tap a dart chip (current turn, or each player's last turn in this leg), then enter the replacement on the pad. Total turns are edited with the total keypad
- Rematch rotates the player order so someone else starts
- Verify the first CI image build (better-sqlite3 prebuilds) and the first run on the server (uid 1000 on the data volume)
