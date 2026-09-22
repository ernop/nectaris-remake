# Nectaris remake — agent notes

JavaScript remake of the TG-16 hex-tactics game (Nectaris / Military
Madness). Start with `README.md` (usage, deployment, modding),
`PRODUCT.md` (settled UI/product decisions), and `MECHANICS.md`
(rules reconstruction with sources). Before regenerating unit icons, also read
`ART_DIRECTION.md` (settled 32×32-unit / 48×32-flattened-hex specification),
`inspiration/nectaris-original/README.md` and open
`inspiration/nectaris-original/index.html` to inspect its local reference PNGs.

Facts wei need across sessions:

- **No build step, no dependencies.** Plain scripts with globals, loaded in
  order by `index.html` / `editor.html`. Files are dual-environment: every
  logic module ends with `if (typeof module !== "undefined") module.exports`
  so the node test suite loads them.
- **Tests:** `node test/run-tests.js` — map validation, rule unit-tests, and
  AI-vs-AI self-play on all 32 normal/advanced campaign + 24 extra-pack + 10 AI-made maps. Run it
  after any engine, data, or map change.
- **Local development:** `./serve.sh` serves the repo on fixed backend port
  `127.0.0.1:8001`; do not substitute a random port. The machine's shared
  Caddy registry exposes it at `http://nectaris.localhost` and the local
  dashboard can start/stop it under project name `nectaris-remake`.
- **Map navigation (2026-09-22):** grabbing pans at every zoom level, even when
  the entire map fits. Preserve the drag threshold so clicks still select units;
  never recenter merely because the map is smaller than the viewport.
  Disable grabbing while actively choosing a unit's movement destination;
  show a crosshair and restore grabbing after moving or cancelling.
- **Deploy target:** none written yet. It is a static folder; any web host
  works. When youi picks a live target, record it here (per the pdeploy
  rule).
- **Public home:** [ernop/nectaris-remake](https://github.com/ernop/nectaris-remake),
  published on 2026-08-26. Development lives only in this standalone repo;
  the former nested copy in `mybrowser` was removed after its newest changes
  were transferred here.
- **IP posture (keep it this way):** mechanics/stat tables are functional
  game data reimplemented from community documentation. The project owner
  confirmed redistribution permission on 2026-09-03 for the 16 original PC
  Engine normal-campaign layouts, deployments and factory inventories now in
  `js/data-maps.js`; `tools/extract-original-campaign.js` records their
  deterministic provenance from Hudson's official 1997 Windows freeware port.
  The user explicitly requested the 16 advanced missions on 2026-09-20;
  `js/data-advanced-maps.js` and `LEVEL_SOURCES.md` record that import.
  Remake art, music, and the 12 Lunar Frontiers layouts remain original. Do not import
  other original assets, sounds, map data, or community archive files without
  explicit redistribution permission. The other archive-derived exception is
  the Base Nectaris terrain pack, which rests on a specific written grant
  covering only the unit-free terrain files — the boundary of what that grant
  does and does not cover is tabulated in
  `LEVEL_SOURCES.md`. Read that table before adding anything else from an
  archive. On 2026-09-20 the user explicitly requested a separate Legacy set
  from Anka’s ユニットデータ chart, then requested the old map tile style.
  That specific import is in `art/legacy/`; its README records provenance and
  distinguishes user authorization from a third-party license. The Legacy
  terrain is an original code-authored reconstruction in `js/legacy-terrain.js`.
  The registry `js/unit-icon-sets.js` keeps Remake first/default and Legacy
  second; the shared persisted choice covers game, editor and review pages.
  Other original sprite/tile imports still require explicit authorization. The
  gitignored captures under `inspiration/nectaris-original/` are local design
  references only and must never become runtime or redistributed assets.
  The pixel visual style (default) imitates the era's idiom with original
  art: all 23 units have two 32×32 directional frames, authored in
  `art/units/pixel-art.js` and exported by `tools/build-unit-art.js` into
  `js/data-unit-art.js`. Read `art/units/README.md` before edits. Unit art is
  integrated; Remake production terrain/geometry migration is still pending.
  Legacy already uses 48×32 flattened tiles and 32-pixel pitch in production.
  Follow `ART_DIRECTION.md`: 32×32 frames, 48×32 flattened hexes,
  fixed upper-left lighting, bright white/pale armor and selective charcoal
  contours on shadow-facing edges. Use angular military silhouettes: long low
  hulls, flat turrets, straight wings, narrow fuselages and small helmets.
  The user rejected chibi/toy proportions. Always horizontally
  center the visible unit silhouette in its tile. Map icons scale with hex zoom, preserving their intended proportions
  (updated 2026-09-21; supersedes the old no-enlargement rule). Inspectors,
  factories and review sheets use the native 32×32 frame. Charlie must
  stay small within its frame; bases use original-style domed compounds. Review changes in
  `tools/unit-sheet.html`. Union is blue, Xenon green, red means "attacking".
- **Rules are sourced, not guessed** (since 2026-09-01): movement costs,
  per-domain attack ranges (`rngG`/`rngA`, indirect band 2..range),
  `moveOrFire`, surround (defender-only, never at the map edge), counter
  eligibility, the experience table, and the factory
  model (store-to-repair, adjacent-exit deployment, no stopping on unowned
  factories) all follow the published documentation, each with tests. Do not
  "simplify" them back. Combat follows the community-recovered per-machine
  formula and temporary-HP casualty calculation. Damage rolls use the 14-outcome weighted table in Anka d5,
  empirically checked against PCE battles. The original PRNG/correlation and
  exact rounding remain unverified. See `FIDELITY_AUDIT.md` for the PCE
  baseline and remaining CPU, ZOC and campaign gaps. Bases permit parking
  without repair; factories also accept aircraft and loaded transports.
  Mule restricts passengers; same-turn loading/unloading is forbidden.
  Mines and stored Atlas do not prevent PCE elimination.
  The extracted official campaign maps must not be retuned; tuning changes
  belong in separate original levels.
- **Rule constants live in data files**, not code: terrain costs/defense in
  `js/data-terrain.js`, roster in `js/data-units.js`, experience tiers in
  `js/combat.js` (top). `MECHANICS.md` records the combat formula, source, and
  remaining exact-arithmetic and PRNG gaps.

- **CPU factory exits (2026-09-20):** the user corrected the scan to start
  upper-left and run clockwise, choosing the first available legal destination
  for each reserve. A friendly
  compatible Mule/Pelican with room counts as available at its position in that
  scan, even if already used. Restart the scan for each reserve. This follows
  the user's recollection; see `MECHANICS.md` and
  `test/ai-fidelity-tests.js`. Keep this ordering instead of scoring exits by
  distance to an objective or requiring a tactical reason to board a carrier.

- **Profiles/save state:** `js/profiles.js` stores browser-local profiles; engine
  snapshots preserve cargo identity and RNG state. UI checkpoints committed human
  actions and complete AI turns; unfinished AI turns resume from their start.
  Tests in `test/profiles-tests.js` run through the main suite. See `PRODUCT.md`.

- **Unit labels and factory hovers (2026-09-22):** use `UNIT_VIEW` for short
  unit names and accompanying icons. Omit serial/model designations in the UI.
  Factory hovers list every reserve individually with that unit's experience
  stars; never aggregate identical types. Empty factory clicks stay silent.
  Factory popups reuse that two-column roster, anchor next to the factory,
  and reopen after deployment. Ready tiles are whole Deploy buttons; blocked
  tiles explain why. End Turn confirmation has both buttons inside its popup.
  Readiness must come from engine legal-action queries shared with execution,
  never a separate UI interpretation of movement points or nominal ranges.
- **Transport and End Turn clarification (2026-09-22):** each transport may
  load OR unload once per turn; movement does not consume that allowance.
  Cargo already aboard can unload after moving. End Turn warns about available
  movement, attacks, unloading and reserves; the popup's End turn anyway button confirms.

- **Combat UI (2026-09-21, latest correction):** click a unit to move immediately;
  **Attack** aims in place. Atlas aims immediately. After moving, attack or End
  if a shot exists; otherwise finish automatically. This supersedes the separate
  Shift-selection/confirmation flow. Top-bar **Undo last** reverses noncombat
  actions across units, including factory/cargo changes, and survives saves.
  Battle, turn and match-end boundaries clear history; never undo/redo combat.
  Buggies retain their remaining movement only after attacking. Keep action
  controls clear of target hexes. The left inspector is optional (Details,
  initially closed); commands sit beside the selected unit, clear of other units
  and selectable destinations. A temporary bottom rail is only a fallback when
  no nearby space fits (2026-09-22 correction). Enemy inspection shows both orange
  movement fill and separate ground/air firing outlines from the current hex,
  including indirect blind spots. The top bar never wraps: keep its
  height fixed and let settings scroll beside the persistent Details/Undo/End
  Turn controls (2026-09-22). Never restore permanent empty chrome or
  automatic move-and-attack shortcuts. `PRODUCT.md` records the current flow;
  `MANUAL_AUDIT.md` is the historical booklet review.
  `COMBAT.forecast` uses 100,000 independent simulation seeds and must never
  read or advance the match RNG. `js/combat-view.js` renders the joint casualty
  heatmap. See `PRODUCT.md`, `test/combat-ui-tests.js`, and `test/forecast-tests.js`.
