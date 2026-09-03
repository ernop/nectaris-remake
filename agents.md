# Nectaris remake — agent notes

JavaScript remake of the TG-16 hex-tactics game (Nectaris / Military
Madness). Start with `README.md` (usage, deployment, modding),
`PRODUCT.md` (settled UI/product decisions), and `MECHANICS.md`
(rules reconstruction with sources). Before regenerating unit icons, also read
`inspiration/nectaris-original/README.md` and inspect its local reference PNGs.

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
  Art, music, and the 12 Lunar Frontiers layouts remain original. Do not import
  other original assets, sounds, map data, or community archive files without
  explicit redistribution permission. The other archive-derived exception is
  the Base Nectaris terrain pack, which rests on a specific written grant
  covering only the unit-free terrain files — the boundary of what that grant
  does and does not cover is tabulated in
  `LEVEL_SOURCES.md`. Read that table before adding anything else from an
  archive. Hudson/Konami sprite and tile bitmaps remain off-limits. The
  gitignored captures under `inspiration/nectaris-original/` are local design
  references only and must never become runtime or redistributed assets.
  The pixel visual style imitates the era's idiom with original art.
- **Rules are sourced, not guessed** (since 2026-09-01): movement costs,
  per-domain attack ranges (`rngG`/`rngA`, indirect band 2..range),
  `moveOrFire`, surround (defender-only, never at the map edge), counter
  eligibility, the experience table, and the factory
  model (store-to-repair, adjacent-exit deployment, no stopping on unowned
  factories) all follow the published documentation, each with tests. Do not
  "simplify" them back. Combat follows the community-recovered per-machine
  formula and temporary-HP casualty calculation. Its documented random range
  is 0.2–4.0; because the original lookup-table probabilities remain
  unavailable, the implementation samples integer hundredths uniformly.
  The extracted official campaign maps must not be retuned; tuning changes
  belong in separate original levels.
- **Rule constants live in data files**, not code: terrain costs/defense in
  `js/data-terrain.js`, roster in `js/data-units.js`, experience tiers in
  `js/combat.js` (top). `MECHANICS.md` records the combat formula, source, and
  remaining random-distribution gap.
