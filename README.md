# Nectaris — JavaScript hex-tactics remake

A from-scratch, dependency-free JavaScript remake of the classic lunar
hex-based tactics game (TG-16 / PC Engine, 1989: *Nectaris* in Japan,
*Military Madness* in the US). Faithful to the mechanics — ZOC, the recovered
combat calculation with support and surround fire, experience, terrain
defense, factories with stored units, transports — while dropping the pure
hardware limitations: the whole map is visible at once, with free zoom and
pan, at any map size. It includes 16 campaign maps, a 12-map online expansion,
an original procedural chiptune score, and a level editor with URL sharing.

## What's what

| File | Purpose |
|---|---|
| `index.html` | The game: mission menu, campaign, custom levels, hotseat |
| `editor.html` | Level editor: terrain, units, factories, custom unit types |
| `PRODUCT.md` | Settled UI/product decisions |
| `MECHANICS.md` | Full rules reconstruction, with sources |
| `inspiration/nectaris-original/README.md` | Manifest for local, gitignored visual references |
| `inspiration/nectaris-original/index.html` | Local full-page viewer for those captures |
| `js/hex.js` | Hex math (flat-top, odd-q offset, cube internals) |
| `js/data-terrain.js` | Terrain data: additive defense, per-chassis movement costs |
| `js/data-units.js` | The 23-unit roster (documented original stats) |
| `js/combat.js` | Recovered per-machine damage and squad-casualty calculation |
| `js/engine.js` | Game state, movement/ZOC, actions, victory |
| `js/ai.js` | Computer opponent |
| `js/data-maps.js` | Official 16-map normal campaign from Hudson's 1997 PC Engine remake |
| `js/data-expansion-maps.js` | 12-map Lunar Frontiers online expansion |
| `js/data-basenectaris-maps.js` | 12-map Base Nectaris terrain pack (bilingual briefings) |
| `tools/nmd-to-level.js` | Converts a Windows-edition `.nmd` map file to a level |
| `js/render.js` | Canvas renderer with selectable Remake/Legacy art |
| `js/data-unit-art.js` | Generated native 32×32 Remake art for all 23 unit types |
| `js/unit-icon-sets.js` | Validated art-set registry and saved selection |
| `js/data-unit-art-legacy.js` | Imported Legacy unit-chart frames |
| `js/legacy-terrain.js` | Original-style pixel terrain and connected tile variants |
| `art/units/pixel-art.js` | Editable indexed unit art; export with `node tools/build-unit-art.js` |
| `js/music.js` | Original synthesized military chiptune (Web Audio; no audio files) |
| `js/ui.js`, `js/main.js` | Game UI and boot/menu |
| `js/profiles.js` | Local player profiles, match saves and result history |
| `js/editor.js` | Editor logic |
| `test/run-tests.js` | Node test suite (`node test/run-tests.js`) |
| `tools/unit-sheet.html` | Native roster review: Union, Xenon, attacking, spent, contrast and silhouette checks |
| `tools/art-pilot.html` | Native map fixture with a selector for all 23 unit types |
| `serve.sh` | Local server on the fixed development port |

## Run locally

```bash
./serve.sh
```

Open <http://nectaris.localhost>. The machine's local Caddy proxy routes that
name to <http://127.0.0.1:8001> and lists it on the local dashboard. Port
**8001** is canonical; if another process has it, the server exits with the
bind error rather than selecting a different port.

## Deployment

Static files, no build step, no dependencies. Copy the folder to any web
server (or open `index.html` from disk — no modules, plain scripts). All
state (campaign progress, custom levels, custom units) lives in
`localStorage`.

## Player profiles and saved games

On your first visit, choose a username. The menu remembers your profile and
lets you switch players or create another profile. Each has independent campaign
stars, win/loss history, and one unfinished match. Mission cards show your record;
**Match history** includes why each match ended, when, and on which turn.
Use **Show older matches** to browse beyond the latest ten results.

Progress saves automatically after actions. **Save & Menu** leaves the match;
**Continue match** restores it, including after closing and reopening the page.
Starting a different match asks before replacing your current save. An interrupted
AI turn resumes from its start; unconfirmed movement is cancelled on resume.
Hotseat results record the winning faction separately from solo wins/losses.

Profiles stay in this browser at the same address—there is no cloud sync.
Clearing site data removes them. Existing campaign stars migrate to your first
profile. Storage problems display an error instead of claiming progress is saved.

## Controls

- Click a unit to see its movement destinations and boardable transports.
  Choose a destination, or click its current hex to stay and aim.
- After choosing the position, attackable enemies turn red. Hover a target for
  its identity, both sides' calculations and a casualty probability heatmap
  based on 100,000 independent simulations. The forecast never uses the match's
  actual random state. Click the red target to attack; there is no automatic
  approach to a distant enemy.
- **Cancel** beneath the unit undoes the provisional move. **End** commits that
  unit without attacking. These controls move to the strip below the map when
  necessary to keep red targets clear. Unload controls appear in the sidebar.
  Ordinary moves can be cancelled even when no attack is available; storage,
  capture and boarding commit immediately. Battle results close automatically.
- Right-click or Esc: cancel. Mouse wheel: zoom. Middle/right-drag pans only
  when the zoomed map extends beyond the viewport.
  `E`: end turn.
- Unit chrome shows remaining strength only when damaged (1–7). Full
  strength (8) is omitted — see `PRODUCT.md`.
- Click any unoccupied base or factory to inspect its stored units: yours,
  neutral, or enemy, including empty buildings. Hovering also lists the contents
  in the sidebar. Capture with infantry to gain control of the reserves.
  At an owned building, choose a ready unit and click
  **Deploy**, then choose a highlighted destination among the six surrounding
  hexes: an unoccupied deployable terrain hex, or an adjacent friendly Mule or
  Pelican with an empty cargo slot. Capturing infantry goes inside the factory
  and leaves the map; it can deploy again from the next turn. Stop a damaged
  unit on your own base or factory to store and repair it under the same delay.
  Ground units may pass through buildings but cannot park on them: friendly
  destinations store the unit, while enemy and neutral destinations require
  capturing infantry. This also applies to unloading and deployment.
- **Watch AI: On** shows every Xenon move, combat matchup, and before/after
  squad strength. Turn it off for immediate AI turns.
- The factory panel shows each stored unit's map icon, damage when present,
  experience, and deployment control.
- Experience appears on units in three star columns holding 3, 2, and 3 stars.
  Selecting a unit shows the exact damage bonus; level 8 replaces
  the columns with the large **GENERAL** star.
- Union silhouettes face right and Xenon silhouettes face left, so opposing
  units visibly confront one another.
- Units that have completed their activation this turn appear fully greyscale
  at unchanged opacity; units with movement or an action remaining stay at
  full color.
- While an attack is previewed or resolving, the attacking unit is drawn in
  deep red and the defender gets a white ring, whichever side is attacking.
- The hover inspector shows BASE → SUPPORT → TERRAIN → FINAL attack and defense
  for both sides, plus surround, experience, damage arithmetic and outcome rates.
- Every campaign and expansion map is available immediately. Use the map
  selector in the top bar to move directly between them.
- Mission choices show the initial Union and Xenon squad totals, including
  reserves already stored in each side's factories.
- **Music: On/Off** starts an original square-wave/triangle/noise military
  chiptune. Browsers require the button press before audio may begin.

## Custom levels

The editor exports self-contained JSON. Schema:

```json
{
  "name": "MY LEVEL",
  "turnLimit": 50,
  "grid": ["..hh..", "B-...F", "......"],
  "buildings": [
    { "col": 0, "row": 1, "owner": 0 },
    { "col": 5, "row": 1, "owner": -1, "stored": ["BISON", "KILROY"] }
  ],
  "units": [
    { "t": "CHARLIE", "o": 0, "x": 1, "y": 1 },
    { "t": "GRIZZLY", "o": 1, "x": 4, "y": 2, "str": 6, "exp": 2 }
  ],
  "customUnits": { "HOVER": { "name": "Hover MK-1", "cls": "tank", "move": 8,
    "moveType": "treads", "rmin": 1, "rmax": 1, "atkG": 55, "atkA": 20, "def": 35 } }
}
```

Terrain characters: `.` plains, `-` road, `w` wasteland, `h` hills,
`M` mountains, `v` valley, `=` bridge, `F` factory, `B` base. Owners:
`0` Union (human by default), `1` Xenon (AI), `-1` neutral.
Road tiles choose their path from adjacent road/building tiles: same-row runs
stay horizontal, while turns and junctions meet at their shared hex edges.

### Online levels

Paste a raw level-JSON URL into **Install from URL** on the mission menu.
Single levels, arrays, and `{ "levels": [...] }` packs are accepted. Every
level is engine-validated before it is installed. Raw GitHub and Gist links
work. See [`LEVEL_SOURCES.md`](LEVEL_SOURCES.md) for the twelve included
Lunar Frontiers maps, historical Nectaris map archives, their redistribution
status, and the sharing procedure.

## Custom units

New unit types are plain data — no code needed. Define them in the editor's
"Custom unit types" box (or in a level file's `customUnits`); they appear in
the palette and work everywhere: `cls` picks the drawn silhouette
(`infantry`, `tank`, `air`, `artillery`, `buggy`, `antiair`, `transport`,
`mine`), `moveType` picks movement costs (`foot`, `wheels`, `treads`,
`air`), and flags (`capture`, `moveAfterAttack`, `moveOrFire`, `cargo`,
`placeByTransport`) enable the special behaviors. Attack ranges are per
target domain: `rngG` hexes against ground, `rngA` against air, and a range
above 1 is indirect fire (band 2..range — it cannot hit an adjacent hex,
and draws no counterattack). `moveOrFire` is a separate flag, not implied
by range: the stock Lynx fires indirectly and still re-moves. Older custom
units that specify a single `rmax` keep working; it is translated to both
domains the unit can attack.

## Art style

The first/default set, **1 · Remake**, gives all 23 unit types original native **32×32** art in pixel mode: angular
military silhouettes, upper-left lighting, bright flat armor and selective
charcoal contours. Both directions are separately shaded and horizontally
centered. Infantry stays small. Icons stay native-sized at every map zoom and
in factory panels. See [art/units/README.md](art/units/README.md) for source,
exports and review tools. The flattened 48×32 terrain geometry specified in
[ART_DIRECTION.md](ART_DIRECTION.md) is present in the review fixture; production
terrain and building migration for Remake are still pending.

Choose **Art set → Legacy** in the game or editor to use all 23 unit icons
adapted from [ユニットデータ](https://anka.sakura.ne.jp/nectaris/d2.html), together
with original-style pixel terrain: maroon plains, gray ridges, pink plateaus,
pale connected roads and domed installations. Legacy uses 48×32 flattened
hexes, 32×32 pitch and a 16-pixel column stagger. Units always stay 32×32.
The terrain is a reconstruction; the icons are JPEG-derived adaptations,
not a bit-exact ROM atlas. Provenance and rebuilding: [art/legacy/README.md](art/legacy/README.md).

The art-set choice is stored under `nectaris-unit-icon-set-v1`, shared by
the game, editor and review tools. It applies in Pixel style. New sets can
be registered through `js/unit-icon-sets.js`; every set must cover all 23 units.

Three selectable visual styles, switched with the dropdown in the game's top
bar and persisted in `localStorage` under `nectaris-style-v2` (decision
2026-08-30, extended 2026-09-01, pixel made default 2026-09-03; the editor
follows the stored choice on load):

- **Pixel** (default): two 32×32 directional frames per stock unit type,
  supplied by the selected art set. Remake is generated from editable indexed
  pixel constructions in `art/units/`.
  Late-80s console strategy proportions, selective charcoal contours, pale armor,
  steel barrels, yellow reserved for missiles, rockets and bombs. Every unit
  has its own silhouette (see `tools/unit-sheet.html`). Legacy instead uses
  the user-selected imported chart and matching reconstructed map style.
- **Neon**: procedural neon wireframes — dark plates with glowing
  faction-colored outlines, rib hatching, dashed pale details, and shared
  neon-yellow accents on weapons/canopies. Union = violet/magenta.
- **Classic**: the remake's first look — solid painted silhouettes with
  dark outlines.

Faction colours follow the original in every style: Union blue (violet in
neon), Xenon green, neutral gray. Red is reserved for the unit currently
attacking. Native unit palettes live in `art/units/pixel-art.js` and generated
`js/data-unit-art.js`; other styles use `js/render.js` (`THEMES` + `NEON`).
Buildings tint from the same faction entries so ownership reads
consistently in every style.

`tools/unit-sheet.html` (serve the repo, then open
`http://nectaris.localhost/tools/unit-sheet.html`) shows every stock unit in
pixel mode as Union, Xenon, attacking and spent, always at native size.

## Briefing language

Level cards render in English or Japanese, chosen with the **Briefing
language / 表示言語** selector on the mission menu and stored under
`nectaris-lang`. A level supplies Japanese by adding `nameJa`,
`descriptionJa`, `specialJa` and `tagsJa` beside the English fields; a level
without them shows its English text in either setting.

## Fidelity and originality

- **Mechanics** are reimplemented from community documentation of the
  original, including the Japanese community-recovered damage and casualty
  formula. See `MECHANICS.md` for sources and the documented uniform sampling
  used because the original random-coefficient lookup probabilities remain
  unavailable.
- **Unit names, stats, ranges and per-chassis movement costs** follow the
  documented original tables (functional game data). The movement costs,
  per-domain attack ranges, surround/counterattack rules and experience
  awards are documented original behavior. See `MECHANICS.md`.
- **Remake art, reconstructed terrain and sounds are original to this project.**
  Legacy unit icons are third-party-derived, imported from the chart explicitly
  selected by the user on 2026-09-20. The source JPEG and provenance are in
  `art/legacy/`; this user instruction is not a separate third-party license.
- **Campaign maps** reproduce the 16 normal-campaign layouts, deployments and
  factory inventories built into Hudson's official 1997 Windows freeware PC
  Engine remake. The data was extracted deterministically after the project
  owner confirmed redistribution permission; that campaign extraction includes
  no bitmap artwork. The Base Nectaris terrain pack comes from unit-free
  `.nmd` files published with a separate reposting grant. The 12-map Lunar
  Frontiers expansion remains original. See
  [`LEVEL_SOURCES.md`](LEVEL_SOURCES.md).
