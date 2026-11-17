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
- Check the new animations on the iPad: tap feedback on the pads, the board hit marker, the score count-down, the bust shake and the 180 stamp. Tune durations in `src/web/styles.css` and `src/web/ui/motion.ts`
- Check the new vintage look on the iPad: font sizes on the chalkboard, key legibility, the wood frame at portrait width. The pad keys use `double-rule`, which iOS renders as box-shadow, so verify no flicker on tap
- Milestone 4: PWA manifest + icons, wake lock, layout polish

## Notes for the next session

- Game screen: `src/web/features/game/`. Engine state is replayed on the client from `match.throws`. Changes are optimistic and serialized per match through a TanStack mutation scope (`src/web/data/matches.ts`)
- The server rejects a throw unless `seq` equals the current throw count (409 `stale-seq`), which guards against double submits and a second device
- Editing: tap a dart chip (current turn, or each player's last turn in this leg), then enter the replacement on the pad. Total turns are edited with the total keypad
- Motion: keyframes are theme tokens (`--animate-*` in `styles.css`), and pointer-down press feedback comes from `src/web/ui/motion.ts` (Web Animations API). Both respect `prefers-reduced-motion`. Use `key={value}` together with `animate-pop` to replay an animation when a value changes
- Rematch rotates the player order so someone else starts
- UI direction is implemented, see `docs/ui.md`. Visual decisions live in `src/web/styles.css` (tokens, textures, `surface-*`, `double-rule`, `label-caps`) and `src/web/ui/` (`Key`, `Board`, `Button`, `Segmented`)
- Verify the first CI image build (better-sqlite3 prebuilds) and the first run on the server (PUID/PGID handling on Unraid)
