# Nectaris remake — agent notes

JavaScript remake of the TG-16 hex-tactics game (Nectaris / Military
Madness). Start with `README.md` (usage, deployment, modding) and
`MECHANICS.md` (rules reconstruction with sources).

Facts wei need across sessions:

- **No build step, no dependencies.** Plain scripts with globals, loaded in
  order by `index.html` / `editor.html`. Files are dual-environment: every
  logic module ends with `if (typeof module !== "undefined") module.exports`
  so the node test suite loads them.
- **Tests:** `node test/run-tests.js` — map validation, rule unit-tests, and
  AI-vs-AI self-play on all 16 campaign + 12 Lunar Frontiers maps. Run it
  after any engine, data, or map change.
- **Deploy target:** none written yet. It is a static folder; any web host
  works. When youi picks a live target, record it here (per the pdeploy
  rule).
- **Public home:** [ernop/nectaris-remake](https://github.com/ernop/nectaris-remake),
  published on 2026-08-26. Development lives only in this standalone repo;
  the former nested copy in `mybrowser` was removed after its newest changes
  were transferred here.
- **IP posture (keep it this way):** mechanics/stat tables are functional
  game data reimplemented from community documentation; art, music, and the
  28 campaign + Lunar Frontiers map layouts are original. Do not import
  original assets, sounds, ripped map data, or community archive files
  without explicit redistribution permission. The one archive-derived
  exception is the Base Nectaris terrain pack, which rests on a specific
  written grant covering only the unit-free terrain files — the boundary of
  what that grant does and does not cover is tabulated in
  `LEVEL_SOURCES.md`. Read that table before adding anything else from an
  archive. Hudson/Konami sprite and tile bitmaps remain off-limits: the
  pixel visual style imitates the era's idiom with original art.
- **Rules are sourced, not guessed** (since 2026-09-01): movement costs,
  per-domain attack ranges (`rngG`/`rngA`, indirect band 2..range),
  `moveOrFire`, surround (defender-only, never at the map edge), counter
  eligibility, the 999 power ceiling, the experience table, and the factory
  model (store-to-repair, adjacent-exit deployment, no stopping on unowned
  factories) all follow the published documentation, each with tests. Do not
  "simplify" them back. The one remaining reconstruction is the casualty
  roll (formula never published). Open design question: whether to retune
  the campaign maps, which were built against the old reconstructed rules.
- **Rule constants live in data files**, not code: terrain costs/defense in
  `js/data-terrain.js`, roster in `js/data-units.js`, experience tiers in
  `js/combat.js` (top). The damage roll (`AP/(AP+DA)` per strength die) is a
  reconstruction — if youi tunes it after play, update `MECHANICS.md` too.
