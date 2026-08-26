# Nectaris — JavaScript hex-tactics remake

A from-scratch, dependency-free JavaScript remake of the classic lunar
hex-based tactics game (TG-16 / PC Engine, 1989: *Nectaris* in Japan,
*Military Madness* in the US). Faithful to the mechanics — ZOC, the 4-step
combat calculator with support and surround fire, experience, terrain
defense, factories with stored units, transports — while dropping the pure
hardware limitations: the whole map is visible at once, with free zoom and
pan, at any map size.

## What's what

| File | Purpose |
|---|---|
| `index.html` | The game: mission menu, campaign, custom levels, hotseat |
| `editor.html` | Level editor: terrain, units, factories, custom unit types |
| `MECHANICS.md` | Full rules reconstruction, with sources |
| `js/hex.js` | Hex math (flat-top, odd-q offset, cube internals) |
| `js/data-terrain.js` | Terrain data: defense %, per-chassis movement costs |
| `js/data-units.js` | The 22-unit roster (documented original stats) |
| `js/combat.js` | The 4-step combat calculator + damage roll |
| `js/engine.js` | Game state, movement/ZOC, actions, victory |
| `js/ai.js` | Computer opponent |
| `js/data-maps.js` | 16-mission campaign (original layouts, classic structure) |
| `js/render.js` | Canvas renderer (all art procedural and original) |
| `js/ui.js`, `js/main.js` | Game UI and boot/menu |
| `js/editor.js` | Editor logic |
| `test/run-tests.js` | Node test suite (`node test/run-tests.js`) |

## Deployment

Static files, no build step, no dependencies. Copy the folder to any web
server (or open `index.html` from disk — no modules, plain scripts). All
state (campaign progress, custom levels, custom units) lives in
`localStorage`.

## Controls

- Click a unit: shows movement range (white), boardable transports (blue),
  attackable enemies (red).
- Click a destination: the unit steps there and the action menu opens
  (Attack / Unload / Wait / Cancel). Clicking a red enemy attacks directly,
  auto-stepping to the best adjacent hex first.
- Right-click or Esc: cancel. Mouse wheel: zoom. Drag: pan. `E`: end turn.
- Click an own factory (with stored units, unoccupied): deploy panel.
- Battle preview shows the original-style calculator: EXP → SURROUND →
  SUPPORT → TERRAIN rows for both sides, before you commit to the attack.

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
`0` Union (blue, human by default), `1` Xenon (red, AI), `-1` neutral.

## Custom units

New unit types are plain data — no code needed. Define them in the editor's
"Custom unit types" box (or in a level file's `customUnits`); they appear in
the palette and work everywhere: `cls` picks the drawn silhouette
(`infantry`, `tank`, `air`, `artillery`, `buggy`, `antiair`, `transport`,
`mine`), `moveType` picks movement costs (`foot`, `wheels`, `treads`,
`air`), and flags (`capture`, `moveAfterAttack`, `cargo`,
`placeByTransport`) enable the special behaviors. Ranged units (`rmax` > 1)
automatically get the artillery rules: move or fire, no counters.

## Fidelity and originality

- **Mechanics** are reimplemented from community documentation of the
  original (StrategyWiki's combat page, player FAQs, the published manual's
  terrain table) — see `MECHANICS.md` for the details and the one place
  where reconstruction was necessary (the damage roll, whose exact formula
  was never published).
- **Unit names and stats** follow the documented original tables
  (functional game data).
- **Art, sounds, and map layouts are original to this project.** The 16
  campaign missions are new designs that follow the original campaign's
  structure and difficulty curve, not copies of its map data.
