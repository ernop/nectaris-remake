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
  AI-vs-AI self-play on all 32 normal/advanced campaign + 24 extra-pack + 15 AI-made + 48 terrain-campaign + 48 balance-study maps (167 total). Run it
  after any engine, data, or map change.
- **Terrain campaigns (2026-09-23):** Open Horizons, The Knotted Heart and Broken
  Ground each have 16 independent missions. Explicitly label all three campaigns
  AI-made in headings/navigation and credit each map as AI-made by Codex.
  Rebuild them (with the balance studies below) with
  `node tools/build-environment-campaigns.js`; authored briefs/rosters live in
  `tools/environment-campaign-specs.js`. No Hunters/Falcons/Eagles; Pelicans are
  permitted. Existing maps must remain intact. Menu/save keys pair campaign ID
  with mission index; Next mission stops at 16. These new physical families are
  not bound to the old fjord-specific counts. See `ENVIRONMENT_CAMPAIGNS.md` and
  PRODUCT for the implemented scope and playtesting limits. Since 2026-09-30
  (user) these three and Bridgeheads carry symmetric barriers across the top
  and bottom edges (on most Bridgeheads boards, the rilles) so no army can
  circle the board along its rim; `tools/edge-barriers.js` fails the build and
  the suite otherwise. Bridgeheads ridges on every bank broke its balance
  (`MAP_BALANCE.md`), so add barriers there only where a rille leaves an edge open.
- **Balance-study campaigns (2026-09-28):** Bridgeheads, Siege Lines and
  Arsenal, 16 missions each (boards 119-166), labelled AI-made and credited
  AI-made by Claude Opus 5.5. The same command rebuilds them from
  `tools/balance-campaign-specs.js` (briefs, armies) and
  `tools/build-balance-campaigns.js` (terrain and placement). Their armies,
  strengths, stocks and (then) turn limits were tuned so that Marshal playing
  itself gave Union 40-60% (`MAP_BALANCE.md`), while Xenon won at each
  mission's limit; under the 2026-09-30 draw rule their balance is
  unmeasured. After changing a mission, a rule or a bot,
  run `node tools/sim/export-data.cjs`, then remeasure in `sim/` with
  `cargo run --release --bin balance -- --a=marshal --boards=119-166 --games=150`.
- **Local development:** `./serve.sh` serves the repo on fixed backend port
  `127.0.0.1:8001`; do not substitute a random port. The machine's shared
  Caddy registry exposes it at `http://nectaris.localhost` and the local
  dashboard can start/stop it under project name `nectaris-remake`.
- **Browser checks in Cursor's built-in browser:** open a new tab and pass its
  `viewId` to every browser call. A call without one runs in the last-used tab,
  which can be the user's own site (2026-09-26: a `localStorage.clear()` meant
  for the test tab cleared the user's Minesweeper tab). Background tabs fire no
  `requestAnimationFrame`, so animation-driven fixtures such as
  `test/battle-replay.html` time out there unless the iframe gets a timer-based
  frame shim. The pane does not paint a tab it is not showing: `browser_take_screenshot`
  times out and a plain `Page.captureScreenshot` returns an old frame; pass
  `captureBeyondViewport: true` to get a fresh one. Tool calls sent in one batch
  run concurrently, so never batch an edit with the command that checks it.
- **Where the user reads (2026-09-26):** Cursor greys out and collapses some
  earlier agent messages, and a question form can hide the text shown before it.
  Put everything the user needs in the final message, and the facts a decision
  depends on inside the question itself.
- **Release first, verify later (user instruction, 2026-09-26, 8:49 PM):**
  finish a requested change and push it; the user reports problems.
  - No browser checks, fixture pages or screenshots unless he asks.
  - No test runs between edits.
  - Add tests only for rule or engine logic, where failures are silent, and
    keep them short; none for presentation.
  - Run `node test/run-tests.js` once right before each push (about 35 s),
    because a failure there blocks the deploy. Do not wait on CI after pushing.
  - Anything worth a closer look goes in
    [Deferred checks](PROJECT_GUIDE.md#deferred-checks-2026-09-26); the user
    runs them together later. This replaces the earlier "one suite run and one
    browser look per change" rule.
- **Behaviour lock (user instruction, 2026-09-27):** the game as the AI sees
  it (rules, randomness and every bot decision) is locked for the Rust
  simulator in `sim/`. `test/fixtures/sim-corpus.json.gz` holds 58 recorded
  games; `test/sim-lock-tests.js` fails if any command replays to a different
  state or a recorded bot chooses differently.
  - Players use the JavaScript game; the Rust simulator is for testing and AI
    experiments on this machine. Both stay in lockstep (user, 2026-09-27: "in
    terms of perf/levels/etc."): every bot, level and budget in both, playing
    identically. Rust speed target: about 1000× one JavaScript thread, using
    every thread here.
  - Speed work must keep the corpus passing unchanged, and caches key on
    what JavaScript already defines (`signature`, `stopSignature`), never on
    hand-kept dependency lists (user, 2026-09-28: "principled and
    maintainable"). A Rust-only exact speedup that JavaScript lacks is
    allowed when every answer it reuses is recomputed by `--verify-caches` in
    CI and it measures faster (user, 2026-09-29). Profile with `tools/sim/gdb-profile.py` and
    `tools/sim/profile-report.py`: `perf` is not allowed on this machine.
    Time a change against the build before it, alternating runs, and keep
    only what measures faster. Long runs on this machine use the
    profile-guided binary from `tools/sim/build-pgo.sh` (about 7% faster;
    rustup's `llvm-tools`, installed with the user's approval 2026-09-29).
    CI checks the plain release build.
  - The corpus also locks `Game.legalCommands()` at every recorded position
    and 12 random games over it. A new AI player needs a JavaScript twin that
    decides identically, locked by corpus games, before the browser offers it.
  - `simulator.html` shows readers the speed figures and lists every
    lockstep check in plain English; update it when either changes.
  - A deliberate rule or AI change runs `node tools/sim/regenerate-lock.cjs`
    and updates the Rust simulator to match in the same change.
  - `tools/sim/state-hash.cjs` defines the state fingerprint both sides compute.
  - **Judging a bot change (user, 2026-09-29: "match verdicts ... for every
    bot change"):** `cd sim && cargo run --release --bin verdict --
    --a=NEW --b=OLD --boards=…` plays seat-swapped pairs on boards not used
    to tune the change and stops when its sequential test decides. A change
    counts as stronger only on a "IS at least … stronger" verdict; state the
    Elo range with it. Details: AI_TRAINING_PLAN.md, "Match verdicts".
  - **Fair dice (user, 2026-09-28):** a match rolls ChaCha20 dice keyed by a
    256-bit seed. The seed is fresh from the operating system when none is
    given, and a given seed is stretched with SHA-256. Only the engine's
    attack rolls them. Bots imagine battles with their own look-ahead
    generator and must never read or roll the match's dice:
    `test/dice-tests.js` fails a bot that does, and in Rust the dice field is
    private with a state key only the fingerprint can construct. Details:
    AI_TRAINING_PLAN.md, "Fair dice".
  - The Rust simulator must replay the corpus exactly, checked in `sim/` with
    `cargo run --release -- replay`, and its bots must choose every recorded
    command, checked with `cargo run --release -- decide` (Rust from rustup,
    `~/.cargo/bin`). The Tests workflow runs both, so a mismatch holds the
    release (user, 2026-09-27). The user allowed its crates.io libraries:
    serde, serde_json and flate2, for the tool only.
  - After a data change, `node tools/sim/export-data.cjs` rewrites
    `sim/data/game-data.json`; the suite fails while it is stale.
- **Map navigation (2026-09-23):** only Ctrl+left-drag pans, at every zoom level,
  including during movement selection. Ordinary left/middle/right drags never
  pan; Ctrl-click never issues a unit command. Never recenter merely because
  the map is smaller than the viewport. Show grab while Ctrl is held and
  grabbing during panning; use a crosshair for normal map actions.
- **Board layout (updated 2026-09-26):** Auto / Normal / Sideways orientation
  remains persisted. All controls, metadata, forecasts and battle
  reports now live in a fixed left panel in matches and replays. It scrolls
  independently: changing its content must never resize/refit the board.
  This supersedes Auto / Top / Left control placement, on-map action menus
  and temporary bottom rails. Opponent playback never pans or zooms the camera.
  Replay Follow action starts off and requires explicit opt-in. Fit resets the
  camera. See PRODUCT.
- **Deploy target (live 2026-09-26):** https://nectaris-remake.fuseki.net/
  (entry link `https://fuseki.net/nectaris-remake/`). Every `main` commit that
  passes the Tests workflow is released by `.github/workflows/hosting.yml`;
  a manual run of that workflow releases main's tip. The only branch is `main`:
  it was `master` until 2026-09-30, when the user asked for one name so nobody
  is confused; a GitHub ruleset rejects any push that would create `master`,
  and the `production-fuseki` environment deploys only from `main`. Only the files in
  `deploy/runtime-files.json` are published: add every new runtime file there
  (a page, script, worker, stylesheet, level, or linked document), or the
  release build fails. Server allows only `css/`, `js/`, `levels/` and
  root files of type css/html/js/json/md. See PRODUCT "Fuseki hosting".
- **Imported data is untrusted (2026-09-26):** levels, custom units and
  recorded games come from files and web addresses, and the UI builds much
  of its markup with `innerHTML`. `checkLevel` and `Game.restore` in
  `js/engine.js` and `checkUnitType` in `js/data-units.js` type-check every
  field that reaches markup; a new such field joins those checks and
  `test/import-validation-tests.js`. See PRODUCT "Imported data is checked".
- **Public home:** [ernop/nectaris-remake](https://github.com/ernop/nectaris-remake),
  published on 2026-08-26. Development lives only in this standalone repo;
  the former nested copy in `mybrowser` was removed after its newest changes
  were transferred here.
- **Thanks page (2026-09-27):** `thanks.html` thanks everyone who made Nectaris,
  in English and Japanese; the menu and tournament page link to it and it links
  back. `NECTARIS_CREDITS.md` is its research record: update both together.
  Nobody is to be contacted: the user is only preparing the information
  (2026-09-27), and any outreach will be his own.
  Pictures are freely licensed Wikimedia Commons files only, embedded by
  `tools/build-thanks-images.py`, because the server and its CSP allow no image
  files and no outside images. No box art, screenshots, or photographs of people
  without a free license or the person's consent. See PRODUCT "Thanks page".
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
  The registry `js/unit-icon-sets.js` lists Remake first and Legacy second;
  Legacy is the default since 2026-09-26 (key `nectaris-unit-icon-set-v2`);
  the shared persisted choice covers game, editor and review pages.
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
  factories and review sheets use the native 32×32 frame. Remake Charlie must
  stay small within its frame; Remake bases use original-style domed compounds.
  Legacy buildings follow the original's top-down tiles: the base is a walled
  prison camp, the factory round tanks, a piped hall and sheds, and the two
  must differ in shape (user, 2026-09-27). Legacy
  units, infantry included, keep the chart's pixels as exact 2×2 blocks, with no
  resampling and no safe-hex shrink (user decision, 2026-09-26; see
  `art/legacy/README.md`). Review changes in
  `tools/unit-sheet.html`. Union is blue, Xenon green, red means "attacking".
- **Rules are sourced, not guessed** (since 2026-09-01): movement costs,
  per-domain attack ranges (`rngG`/`rngA`, indirect band 2..range),
  `moveOrFire`, surround (defender-only, never at the map edge), counter
  eligibility, the experience table, and the factory
  model (store-to-repair, adjacent-exit deployment, no stopping on unowned
  factories except by capturing infantry, aircraft included since 2026-09-29;
  since 2026-09-30 the entering move itself stores or captures)
  all follow the published documentation, each with tests. Do not
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

- **Profiles/save state:** `js/profiles.js` stores browser-local profiles; a first
  visit starts as **Wilson** (no username prompt) and Rename keeps the profile's
  records. Engine snapshots preserve cargo identity and the dice state. UI checkpoints
  committed human actions and complete AI turns; unfinished AI turns resume from
  their start. Since 2026-09-30 (profile data version 2): one unfinished match
  per board, side, Mode and hotseat, each under its own `nectaris-session-v1:`
  key (`sessionKey`); a profile's `log` holds the play events (start, resume,
  leave, abandon) shown with its results in the History tab. `main.js` saves
  and logs a match only after the player changes the position (`visit`), and
  a finished or abandoned match can never be reopened by a late save. Tests in
  `test/profiles-tests.js`, `test/outcome-tests.js` and
  `test/outcome-menu-tests.js` run through the main suite. See `PRODUCT.md`.

- **Campaign menu (2026-09-26):** the first page exists to get new players into a
  campaign; keep it short. One header row: large **NECTARIS**, **Campaigns** /
  **Bot tournament** tabs (since 2026-09-30 also **History**, `index.html#history`),
  and "You are logged in as Wilson" in the corner (menu: Rename, New profile,
  Switch to, record). One settings row: **AI opponent** (first and larger since
  2026-09-30), **Mode** (Normal default / Offer for first), then hotseat in small
  type (rarely used). No language option, no
  map-default mode, no explanatory paragraphs. Order: Normal, Advanced, Base
  Nectaris, then the other packs. Match defaults: Pixel + Legacy, Watch AI on,
  and a separate **Move animation** toggle. See PRODUCT's campaign menu record.

- **Compensation offers (updated 2026-09-25):** the menu's **Mode** dropdown offers
  Normal (default) and Offer for first; since 2026-09-26 there is no map-default
  choice, and tournament setup has its own tab.
  Guided private questions narrow each player's first acceptable cumulative menu
  of up to 32 mixed packages; earlier choices stay available. Lower switch point
  gets second with its accepted bonus; ties are random, no-deal is explicit.
  Fixed numbered sites near each base remain previewable. `firstPlayer` survives
  saves and AI copies; rounds advance after both sides. Tournament protocol
  2026-09-25.2 uses each bot’s own move policy to evaluate both opening roles,
  records openings in replays and excludes skipped offers from ratings. Explicit
  normal fallback is configurable. Offer fixtures mirror both factions and both
  equal-bid tie recipients in four games; normal fixtures use two. Preferences
  are bounded search estimates, not measured balance. Long browser runs persist
  out-of-order results before rating, recover on Resume, and offer indexed map/pair
  history plus full-window replays with compact 128-command checkpoints. Preserve
  separate compensated results and original map data. See PRODUCT's compensation record and `test/balance-tests.js`.

- **Battle presentation (2026-09-26, redesigned 2026-09-29):** Union always left,
  Xenon always right, each on its own terrain; adjacent units share one level,
  continuous ground, and only fire from range splits the field and tilts the
  formations (aircraft tilt too). Headings are the unit mark and name, with the
  remaining machines on the icon's corner as on the map; no role label or count
  box. The popup is sized to its contents over the dimmed board, never
  stretched to fill it. The numbers panel gives each side, laid out the same,
  its attack row over its defense row ("equation = total LABEL roll"), big
  totals counting up; every value is a unit total, and only the first term
  shows the per-machine value ("6×40 +30 Plains = 270 DEF"). Between the two
  nine-column loss charts, a crop of the real board (`RENDER.paintScene` from
  `BATTLE_REPORT.battleArea`) lights where support, terrain and the surround
  ring come from as they are counted. No luck words, "avg" line, "Machines
  lost", "no counterattack", per-machine or squad text; the interface says
  unit, never squad. An equation is never cut: the panel's type shrinks to fit
  a narrow board. Ready / Fighting / Result stages, a
  brief approach, and a pausable clock cover live play, watched AI and replay;
  controls read Stop at result, Skip, Pause at the lower right. Replay defaults:
  pause before battles on, skip scenes off; click a paused scene to resume.
  Experience ranks are stars on unit icons everywhere, never numeric or separate
  badges. Only battle header icons have stars, not individual formation machines,
  and a unit destroyed in the battle shows no new stars. The header mark (64 px)
  has the original's star box beside it (pixel copy in `js/render.js`,
  re-derived by `tools/read-original-stars.py`; see PRODUCT); newly earned stars
  fade in, glow, then settle to the normal colour. No "Experience gained" row
  (2026-09-26). The opponent's last unit is deselected when its turn ends. See
  PRODUCT's battle review and "Battle screen redesign" records and
  `test/board-playback.html` / `test/battle-replay.html` browser fixtures.

- **Unit labels and factory hovers (updated 2026-09-23):** use `UNIT_VIEW` for short
  unit names and accompanying icons. Omit serial/model designations in the UI.
  Factory hovers list every reserve individually with that unit's experience
  stars; never aggregate identical types. The 2026-09-26 clarification keeps
  this design: fix missing stars in place, without new badges or numeric rows.
  Inspection lives in hover cards.
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

- **Battle review (2026-09-25; match panel emptied 2026-09-29):** matches and
  tournament replays share original-style opposing battle formations with stats.
  Only the replay's fixed left panel reports who attacked whom, machines
  destroyed and lost, the match's actual table roll, whether those casualties
  were above, near, or below the 100-row average, and a ledger of each side's
  attacks and its gap from the average. Replay steps selection, then the action.
  During a match's battle the left panel shows only Show map; the user judged
  the battle data there not useful (2026-09-29). See PRODUCT.

- **Combat UI (2026-09-23, latest correction):** selecting a unit shows blue
  moves plus firing ranges and red legal attack targets from its current hex.
  The requested firing-border trial outlines only the outer area and inner
  blind spots, replacing per-hex firing outlines; see `PRODUCT.md`.
  Click a red target to fire directly; Attack can still isolate aiming.
  Atlas aims immediately. After moving, target an unused legal attack
  directly; otherwise finish automatically. No per-unit End button. Moves animate
  every hex in the legal route without changing saves, RNG or engine outcomes;
  **Move animation: Off** (separate from Watch AI) places units directly. **Unit activation correction
  (2026-09-23):** switching away or clearing selection after moving forfeits the
  unused attack; returning later in the player turn never reopens it. Leaving
  a buggy's post-attack retreat likewise ends its activation. Cancelling a ready,
  unacted selection spends nothing. This supersedes the old permission to
  reselect moved units and attack later; keep save/reload and Undo consistent.
  See `PRODUCT.md` and `MECHANICS.md`. This supersedes the separate
  Shift-selection/confirmation flow. Left-panel **Undo / Redo** always appear as a
  linked pair, enabled at full opacity. They restore whole noncombat states,
  including factory/cargo changes, and both histories survive saves. New actions
  clear redo. Right-click cancels menus or undoes a just-completed/idle move.
  Battle, turn and match-end boundaries clear history; never undo/redo combat.
  Buggies retain their remaining movement only after attacking. Keep action
  controls clear of target hexes. Commands and changing readouts stay in the
  fixed left panel. There is no Details panel (removed 2026-09-26): the map hover
  card carries unit, terrain-under-unit and building contents. Empty-hex terrain
  is shown nowhere; the user chose to leave that gap, so do not add it unasked.
  Hovering an attackable enemy opens the combat board over the map (user,
  2026-09-29), not in the left panel; see the combat board record in
  `PRODUCT.md`. Status lines, Undo/Redo
  and End Turn stay fixed at the top of the panel and settings at its foot;
  anything that appears or resizes during play (action strip, legend, Show map,
  the watched opponent's action line) lives in the middle section, which scrolls by itself, and must
  never push the commands (user, 2026-09-26). The side line stays one line.
  Enemy inspection retains orange movement and ground/air firing contours.
  Never restore automatic layout changes from metadata or
  automatic move-and-attack shortcuts. `PRODUCT.md` records the current flow;
  `MANUAL_AUDIT.md` is the historical booklet review.
  `COMBAT.forecast` uses 100,000 independent simulation seeds and must never
  read or advance the match RNG. `js/combat-panel.js` builds the combat board's
  numbers and loss charts and the battle popup's numbers panel (the battle
  screen counts the calculation up inside the popup; the left panel carries no
  calculation). See `PRODUCT.md`, `test/combat-ui-tests.js`,
  `test/combat-panel-tests.js` and `test/forecast-tests.js`.

- **Level menu (2026-09-23, entries changed 2026-09-30):** restore its scroll position after leaving a level.
  All campaigns, packs and custom maps share tiles: the map picture (the match
  renderer's drawing of the starting position, shrunk and drawn as the tile
  nears the window; `js/map-thumbnail.js`) over one caption line of number, name, "Resume turn N"
  for an unfinished match and "N attempts · xW / yL". Every tile in a collection
  is as wide as its longest caption (`fitLevelTiles`), as many across as fit, so
  no caption has empty space in its middle (user: "we definitely never want to
  have useless garbage like that"). As Xenon is a small mark over the picture's
  top right corner, help `?` the top left. No map size, army totals, column
  headings or gold border for won levels (user, 2026-09-30). Never stack or wrap
  fields inside a caption. Scroll horizontally when needed, without truncating text. The main
  entry is a large click-to-play target; omit turn limits and the tiny Play button.
  Details open only from small edge `?` controls (intentional hover, focus or
  click/tap), never whole-card mouseovers. Keep briefings, making-of notes and
  provenance there; preserve numbering, result keys and import controls.
  Since 2026-09-26 the Normal and Advanced campaigns show no `?` (the original
  game had no briefings) and other levels show `?` only when they have notes.
  Mouseout closes help immediately (0 ms), even after a click or with lingering
  button focus. No dismissal timer or fade. The panel touches its button so
  source links remain reachable. Click-to-pin and the proposed 60 ms delay are superseded.
  See `PRODUCT.md` for the full content and dismissal behavior.

- **UI contrast (2026-09-23):** never fade lettering toward a dark or light
  background. Keep campaign numbers, secondary text and disabled labels opaque
  and readable. Use saturated Union blue and Xenon green, not washed-out colors.
  Use spacing/weight for hierarchy. See `PRODUCT.md`; this does not alter terrain
  shading or the established spent-unit palette.
