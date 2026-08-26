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
  AI-vs-AI self-play on all 16 campaign maps. Run it after any engine, data,
  or map change.
- **Deploy target:** none written yet. It is a static folder; any web host
  works. When youi picks a live target, record it here (per the pdeploy
  rule).
- **Public home:** intended standalone public repo is `ernop/nectaris-remake`.
  Initial publish: create the empty repo, then run `./publish-to-github.sh`
  (assembles the standalone tree per `docs/splitting-out-projects.md`, runs
  tests, pushes one initial commit). Cloud agents cannot do the publish: the
  Cursor GitHub App token is scoped to `mybrowser` only and cannot create
  repos ("Resource not accessible by integration", verified 2026-08-26) nor
  push elsewhere unless the app is granted access to the new repo. Once
  published, update this line with the repo URL and where development lives.
- **IP posture (keep it this way):** mechanics/stat tables are functional
  game data reimplemented from community documentation; art is procedural
  and original; the 16 campaign map layouts are original designs, not copies
  of the original game's map data. Do not import original assets, sounds, or
  ripped map data.
- **Rule constants live in data files**, not code: terrain costs/defense in
  `js/data-terrain.js`, roster in `js/data-units.js`, experience tiers in
  `js/combat.js` (top). The damage roll (`AP/(AP+DA)` per strength die) is a
  reconstruction — if youi tunes it after play, update `MECHANICS.md` too.
