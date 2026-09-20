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
  AI-vs-AI self-play on all 16 campaign + 12 Lunar Frontiers maps. Run it
  after any engine, data, or map change.
- **Local development:** `./serve.sh` serves the repo on fixed backend port
  `127.0.0.1:8001`; do not substitute a random port. The machine's shared
  Caddy registry exposes it at `http://nectaris.localhost` and the local
  dashboard can start/stop it under project name `nectaris-remake`.
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
  center the visible unit silhouette in its tile. Never enlarge icons: maps,
  inspectors and review sheets all show the native 32×32 frame. Charlie must
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

- **Profiles/save state:** `js/profiles.js` stores browser-local profiles; engine
  snapshots preserve cargo identity and RNG state. UI checkpoints committed human
  actions and complete AI turns; unfinished AI turns resume from their start.
  Tests in `test/profiles-tests.js` run through the main suite. See `PRODUCT.md`.

- **Combat UI (2026-09-20):** select a unit, choose a position (click its own
  hex to stay), then choose among red targets. Never restore automatic
  move-and-attack enemy shortcuts. Hover forecasts and calculations live in
  the sidebar; the two map controls are Cancel / End, kept clear of target
  hexes with a reserved rail fallback. Ordinary moves stay reversible until
  End or combat; storage/capture/boarding still commit immediately.
  `COMBAT.forecast` uses 100,000 independent simulation seeds and must never
  read or advance the match RNG. `js/combat-view.js` renders the joint casualty
  heatmap. See `PRODUCT.md`, `test/combat-ui-tests.js`, and `test/forecast-tests.js`.
