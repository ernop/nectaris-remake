# Nectaris remake — agent notes

Use [PROJECT_GUIDE.md](PROJECT_GUIDE.md) to find each guidance/decision record,
its status and the procedure for recording changes. `AGENTS.md` links here as
the repository instruction entry point.

JavaScript remake of the TG-16 hex-tactics game (Nectaris / Military
Madness). Start with `README.md` (usage, deployment, modding),
`PRODUCT.md` (settled UI/product decisions), and `MECHANICS.md`
(rules reconstruction with sources). Before regenerating unit icons, also read
`ART_DIRECTION.md` (settled 32×32-unit / 48×32-flattened-hex specification),
`inspiration/nectaris-original/README.md` and open
`inspiration/nectaris-original/index.html` to inspect its local reference PNGs.

Facts we need across sessions:

- **No build step, no dependencies.** Plain scripts with globals, loaded in
  order by `index.html` / `editor.html`. Files are dual-environment: every
  logic module ends with `if (typeof module !== "undefined") module.exports`
  so the node test suite loads them.
- **Tests:** `node test/run-tests.js` — map validation, rule unit-tests, and
  AI-vs-AI self-play on all 32 normal/advanced campaign + 24 extra-pack + 15 AI-made + 48 terrain-campaign maps (119 total). Run it
  after any engine, data, or map change.
- **Terrain campaigns (2026-09-23):** Open Horizons, The Knotted Heart and Broken
  Ground each have 16 independent missions. Explicitly label all three campaigns
  AI-made in headings/navigation and credit each map as AI-made by Codex.
  Rebuild only these 48 with
  `node tools/build-environment-campaigns.js`; authored briefs/rosters live in
  `tools/environment-campaign-specs.js`. No Hunters/Falcons/Eagles; Pelicans are
  permitted. Existing maps must remain intact. Menu/save keys pair campaign ID
  with mission index; Next mission stops at 16. These new physical families are
  not bound to the old fjord-specific counts. See `ENVIRONMENT_CAMPAIGNS.md` and
  PRODUCT for the implemented scope and playtesting limits.
- **Local development:** `./serve.sh` serves the repo on fixed backend port
  `127.0.0.1:8001`; do not substitute a random port. The machine's shared
  Caddy registry exposes it at `http://nectaris.localhost` and the local
  dashboard can start/stop it under project name `nectaris-remake`.
- **Map navigation (2026-09-23):** only Ctrl+left-drag pans, at every zoom level,
  including during movement selection. Ordinary left/middle/right drags never
  pan; Ctrl-click never issues a unit command. Never recenter merely because
  the map is smaller than the viewport. Show grab while Ctrl is held and
  grabbing during panning; use a crosshair for normal map actions.
- **Board layout (2026-09-23):** game view offers Auto / Normal / Sideways
  orientation and Auto / Top / Left controls, persisted across matches and reloads.
  Both default to Auto, jointly choosing the larger full-board fit on map,
  window, inspector or art changes. Keep the dock stable for near-ties and
  during selection/panning. Fit resets the camera. Left mode
  docks unit commands and the range legend too, preserving full board height
  even during selection. Keep units, counts and popups upright; rotate terrain,
  highlights and hit testing consistently. See PRODUCT's board-layout record.
- **Deploy target:** none selected in the records. It is a static folder; any
  static web host works. Record the target and deployment procedure when chosen.
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
  Connected mountains must not form repeating hex-tip notches. Legacy's outer
  board now uses a thin rounded frame with decorative terrain in the edge gaps;
  it adds no playable cells, roads, buildings or route around boundary mountains.
  See `PRODUCT.md` for the border requirements and implementation choice.
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

- **Classic CPU factory exits (2026-09-20):** the user corrected the scan to start
  upper-left and run clockwise, choosing the first available legal destination
  for each reserve. A friendly
  compatible Mule/Pelican with room counts as available at its position in that
  scan, even if already used. Restart the scan for each reserve. This follows
  the user's recollection; see `MECHANICS.md` and
  `test/ai-fidelity-tests.js`. Keep this ordering instead of scoring exits by
  distance to an objective or requiring a tactical reason to board a carrier.

- **Search opponents and tournaments (2026-09-23):** the user authorized
  progressively more sophisticated, strength-focused algorithms and explicitly
  excluded personalities. New policies use numerical capabilities and ENGINE
  legality, with no stock unit-name handlers or live-RNG inspection. The classic
  fidelity policy remains separate. See [AI_OPPONENTS.md](AI_OPPONENTS.md) for
  architecture, budgets, custom hybrids, worker cancellation and replay/Elo
  invariants. Bump the tournament protocol version when algorithm/rule changes
  invalidate a comparison; do not mix versions or label smoke-test Elo as human
  strength. `tools/ai-research/run.cjs` provides reproducible multi-core matches.

- **Profiles/save state:** `js/profiles.js` stores browser-local profiles; engine
  snapshots preserve cargo identity and RNG state. UI checkpoints committed human
  actions and complete AI turns; unfinished AI turns resume from their start.
  Tests in `test/profiles-tests.js` run through the main suite. See `PRODUCT.md`.

- **Compensation offers (2026-09-23):** implemented by user request, with 32
  cumulative mixed packages and fixed numbered, previewable ground sites near
  each base. Keep earlier choices, private simultaneous responses, random
  both-accept tie-breaks and explicit no-deal handling. `firstPlayer` must survive
  saves and AI copies; rounds advance after both sides act. Imported campaigns
  default to original play, other battlefields to offers. Preserve separate
  compensated results and original map data. The CPU bidding heuristic is not
  evidence of balance. See PRODUCT's compensation record and `test/balance-tests.js`.

- **Unit labels and factory hovers (updated 2026-09-23):** use `UNIT_VIEW` for short
  unit names and accompanying icons. Omit serial/model designations in the UI.
  Factory hovers list every reserve individually with that unit's experience
  stars; never aggregate identical types. Inspection lives in hover cards.
  Neutral/enemy, empty and fully blocked factory clicks never open a popup.
  Owned factories open only an actionable deployment picker. These pickers
  reuse the two-column roster, anchor next to the factory,
  and reopen after deployment only if another reserve has a legal exit or
  compatible carrier, otherwise auto-close. Ready tiles are whole Deploy buttons; blocked
  tiles explain why. End Turn confirmation has both buttons inside its popup.
  Readiness must come from engine legal-action queries shared with execution,
  never a separate UI interpretation of movement points or nominal ranges.
- **Transport and End Turn clarification (2026-09-22):** each transport may
  load OR unload once per turn; movement does not consume that allowance.
  Cargo already aboard can unload after moving. End Turn warns about available
  movement, attacks, unloading and reserves; the popup's End turn anyway button confirms.
  **Transport UI (2026-09-23):** moving/ending a loaded carrier or reselecting a
  moved carrier automatically opens legal orange unloading hexes. Ready carriers
  retain movement-first selection and orange Unload controls. Right-click/Esc/
  Cancel dismisses unloading without undoing movement; selecting the carrier
  again reopens it. Use the engine's unloadTargets, including transfer, passenger,
  occupancy and terrain restrictions. Apply this to Pelican, Mule and custom carriers.

- **Combat UI (2026-09-23, latest correction):** selecting a unit shows blue
  moves plus firing ranges and red legal attack targets from its current hex.
  The requested firing-border trial outlines only the outer area and inner
  blind spots, replacing per-hex firing outlines; see `PRODUCT.md`.
  Click a red target to fire directly; Attack can still isolate aiming.
  Atlas aims immediately. After moving, attack or End
  if a shot exists; otherwise finish automatically. **Unit activation correction
  (2026-09-23):** switching away or clearing selection after moving forfeits the
  unused attack; returning later in the player turn never reopens it. Leaving
  a buggy's post-attack retreat likewise ends its activation. Cancelling a ready,
  unacted selection spends nothing. This supersedes the old permission to
  reselect moved units and attack later; keep save/reload and Undo consistent.
  See `PRODUCT.md` and `MECHANICS.md`. This supersedes the separate
  Shift-selection/confirmation flow. Top-bar **Undo / Redo** always appear as a
  linked pair, enabled at full opacity. They restore whole noncombat states,
  including factory/cargo changes, and both histories survive saves. New actions
  clear redo. Right-click cancels menus or undoes a just-completed/idle move.
  Battle, turn and match-end boundaries clear history; never undo/redo combat.
  Buggies retain their remaining movement only after attacking. Keep action
  controls clear of target hexes. The left inspector is optional (Details,
  initially closed); commands sit beside the selected unit, clear of other units
  and selectable destinations in Top mode. A temporary bottom rail is only a fallback when
  no nearby space fits (2026-09-22 correction). Enemy inspection shows both orange
  movement fill and separate ground/air firing outlines from the current hex,
  including indirect blind spots. The top bar never wraps: keep its
  height fixed and let settings scroll beside the persistent Details/Undo/Redo/End
  Turn controls (2026-09-22). The 2026-09-23 Left mode supersedes top-only
  placement and keeps unit commands in the left dock, with no bottom rail.
  Never restore permanent empty chrome or
  automatic move-and-attack shortcuts. `PRODUCT.md` records the current flow;
  `MANUAL_AUDIT.md` is the historical booklet review.
  `COMBAT.forecast` uses 100,000 independent simulation seeds and must never
  read or advance the match RNG. `js/combat-view.js` renders the joint casualty
  heatmap. See `PRODUCT.md`, `test/combat-ui-tests.js`, and `test/forecast-tests.js`.

- **Level menu (2026-09-23):** restore its scroll position after leaving a level.
  All campaigns, packs and custom maps share dense, internally single-line entries:
  name, number, size, normal-size Union/Xenon/Neutral totals in that order, and any
  result. Align the numeric totals vertically in shared right-aligned columns.
  Aim for three complete entries across per row on wide screens (two or one
  on narrower screens); never stack or wrap fields
  inside one listing. Scroll horizontally when needed, without truncating text. The main
  entry is a large click-to-play target; omit turn limits and the tiny Play button.
  Details open only from small edge `?` controls (intentional hover, focus or
  click/tap), never whole-card mouseovers. Keep briefings, making-of notes and
  provenance there; preserve numbering, result keys and import controls.
  Mouseout closes help immediately (0 ms), even after a click or with lingering
  button focus. No dismissal timer or fade. The panel touches its button so
  source links remain reachable. Click-to-pin and the proposed 60 ms delay are superseded.
  See `PRODUCT.md` for the full content and dismissal behavior.

- **UI contrast (2026-09-23):** never fade lettering toward a dark or light
  background. Keep campaign numbers, secondary text and disabled labels opaque
  and readable. Use saturated Union blue and Xenon green, not washed-out colors.
  Use spacing/weight for hierarchy. See `PRODUCT.md`; this does not alter terrain
  shading or the established spent-unit palette.
