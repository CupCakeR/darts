# UI direction

Status: **agreed and implemented for the game screen.** Needs a check on the real iPad. This file collects what we learn together. Agents: don't invent a style, follow this file and ask if it doesn't cover something.

## Goals

- Playful and useful, readable from a couple of meters away
- Must not look AI-generated

## Never

- Gradients (backgrounds, text, buttons)
- Glassmorphism, blur, glow, neon
- Default purple/indigo/violet accents
- Emoji as icons
- Cards inside cards. Every element in a rounded box with a soft shadow
- "Hero" sections, decorative blobs, sparkles
- Generic system-font-only look with grey text on grey

## Candidate direction (to validate with mockups)

- Palette taken from the board itself: black, cream/off-white, board red, board green. Red/green only carry meaning (e.g. the Double/Triple buttons mirror the ring colors)
- Flat solid colors and hard edges or small radii. Borders instead of shadows
- One characterful condensed display face for the big numbers (tabular figures), plus a plain text face
- Big, confident numbers as the main visual element. The score _is_ the design
- Playfulness through motion and feedback (a little shake on bust, a punchy 180 moment) rather than decoration

## Agreed

- Direction: **vintage pub scoreboard** (2026-11-17). Cream paper with a faint grain, near-black ink, board red/green only with meaning. Flat, hard edges or 2px radii, borders not shadows
- Scoreboard: chalkboard (slate with chalk noise) inside a wood frame with a thin brass line. The active player's row is inverted to chalk with slate text. Frame only around the scoreboard, never around the whole screen
- Typography: **Alfa Slab One** (wood-type slab, self-hosted via fontsource) for scores, pad keys, names and titles. **Libre Baskerville** for text: italic for meta lines and back links, letterspaced uppercase bold for labels and mode tabs (`label-caps`)
- Keys and buttons are printed labels: 2px border plus a thin inner rule (`double-rule`), warm white fill. Pressed or active inverts to a solid fill. Double/Triple fill solid red/green when active, 25 is green and Bull red like the rings
- Mode switch is one segmented bar, undo is a separate action key
- Textures are procedural SVG noise in `styles.css` (`--texture-*`), applied only through the `surface-*` utilities and `ui/` primitives. Features never reference textures directly
- Playfulness comes from motion (stamp, shake, count-down, hit marker), not decoration

## Rejected

- Modern condensed sans (Barlow Condensed, Big Shoulders, Oswald): too much like a sports broadcast dashboard
- Cork as the scoreboard surface: fights with the red/green player colors, weak contrast. Might still work behind the board pad later
- Plain paper scoreboard with only a textured frame: too quiet
- Chalk handwriting font (Fredericka the Great) for scores: on theme, but too thin and uneven to read fast
