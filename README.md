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
| `js/hex.js` | Hex math (flat-top, odd-q offset, cube internals) |
| `js/data-terrain.js` | Terrain data: additive defense, per-chassis movement costs |
| `js/data-units.js` | The 22-unit roster (documented original stats) |
| `js/combat.js` | Recovered per-machine damage and squad-casualty calculation |
| `js/engine.js` | Game state, movement/ZOC, actions, victory |
| `js/ai.js` | Computer opponent |
| `js/data-maps.js` | 16-mission campaign (original layouts, classic structure) |
| `js/data-expansion-maps.js` | 12-map Lunar Frontiers online expansion |
| `js/data-basenectaris-maps.js` | 12-map Base Nectaris terrain pack (bilingual briefings) |
| `tools/nmd-to-level.js` | Converts a Windows-edition `.nmd` map file to a level |
| `js/render.js` | Canvas renderer (all art procedural and original) |
| `js/music.js` | Original synthesized military chiptune (Web Audio; no audio files) |
| `js/ui.js`, `js/main.js` | Game UI and boot/menu |
| `js/editor.js` | Editor logic |
| `test/run-tests.js` | Node test suite (`node test/run-tests.js`) |
| `serve.sh` | Local server on the fixed development port |

## Run locally

```bash
./serve.sh
```

Open <http://127.0.0.1:8001>. Port **8001** is canonical; if another process
has it, the server exits with the bind error rather than selecting a different
port.

## Deployment

Static files, no build step, no dependencies. Copy the folder to any web
server (or open `index.html` from disk — no modules, plain scripts). All
state (campaign progress, custom levels, custom units) lives in
`localStorage`.

## Controls

- Click a unit: shows movement range (white), boardable transports (blue),
  attackable enemies (red).
- Click a destination: the unit steps there. If an attack or unload remains,
  the action menu opens (Attack / Unload / Finish / Cancel); otherwise the
  move completes immediately. Clicking a red enemy attacks directly,
  auto-stepping to the best adjacent hex first.
- Right-click or Esc: cancel. Mouse wheel: zoom. Middle/right-drag pans only
  when the zoomed map extends beyond the viewport.
  `E`: end turn.
- Unit chrome shows remaining strength only when damaged (1–7). Full
  strength (8) is omitted — see `PRODUCT.md`.
- Click an own factory (with stored units, unoccupied): deploy panel. Deploy
  then asks for an exit hex — pick one of the highlighted hexes next to the
  factory. Stop a damaged unit on your own factory to store and repair it;
  it can come back out from the next turn.
- **Watch AI: On** shows every Xenon move, combat matchup, and before/after
  squad strength. Turn it off for immediate AI turns.
- The factory panel shows each stored unit's map icon, damage when present,
  experience, and deployment control.
- Experience appears on units in three star columns holding 3, 2, and 3 stars.
  Selecting a unit shows the exact damage bonus; level 8 replaces
  the columns with the large **GENERAL** star.
- Union silhouettes face right and Xenon silhouettes face left, so opposing
  units visibly confront one another.
- Battle preview shows BASE → SUPPORT → TERRAIN → FINAL per-machine attack
  and defense for both sides before you commit to the attack.
- Every campaign and expansion map is available immediately. Use the map
  selector in the top bar to move directly between them.
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

Three selectable visual styles, switched with the dropdown in the game's top
bar and persisted in `localStorage` under `nectaris-style` (decision
2026-08-30, extended 2026-09-01; the editor follows the stored choice on
load):

- **Neon** (default): procedural neon wireframes from a reference palette
  image — dark plates with glowing faction-colored outlines, rib hatching,
  dashed pale details, and shared neon-yellow accents on weapons/canopies.
  Union = violet/magenta, Xenon = red, neutral = pale gray (the palette
  has no blue, so Union moved from blue to the magenta-violet band).
- **Pixel**: original 16-wide sprite matrices drawn in the idiom of late-80s
  console strategy art — hard outline, a three-tone ramp per faction, a white
  specular on upper surfaces, yellow weapons. The *idiom* is borrowed from the
  era; the sprites are ours, drawn as character matrices in `PIXEL_SPRITES`.
  No bitmap from any release of the original game is used, traced or extracted
  — see "Fidelity and originality" below.
- **Classic**: the remake's first look — solid painted silhouettes with
  dark outlines. Union = blue, Xenon = red.

The palettes live at the top of `js/render.js` (`THEMES` + `NEON`); buildings
tint from the same faction entries so ownership reads consistently in every
style.

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
- **Art and sounds are original to this project**, including every unit
  sprite in all three visual styles. No bitmap, tileset, or audio file from
  any release of the original game is bundled, traced, or extracted.
- **Map layouts** are original except for the Base Nectaris terrain pack,
  whose hex layouts come from the unit-free `.nmd` files that BASE NECTARIS
  published under an explicit grant to place units on them and repost the
  result. The 16 campaign missions are new designs that follow the original
  campaign's structure and difficulty curve, not copies of its map data; the
  12-map Lunar Frontiers expansion is original too. Other historical fan-map
  archives are linked but not copied where their terms prohibit republication
  or map-data rights are unclear. See
  [`LEVEL_SOURCES.md`](LEVEL_SOURCES.md).
