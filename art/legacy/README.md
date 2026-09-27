# Legacy unit icons

Imported on 2026-09-20 at the user's explicit request to offer the artwork from
[ユニットデータ](https://anka.sakura.ne.jp/nectaris/d2.html) as **Legacy**, alongside
the project's original **1 · Remake** set.

Source image: <https://anka.sakura.ne.jp/nectaris/image/d2-01.jpg>

SHA-256: `bcc5f5a34670a9b6049c738e6b0b6ade1157c99688bd482a2bbb0e178cd199f5`.

The unmodified source is `source/d2-01.jpg`. The guide covers PC Engine,
Windows and PlayStation; the chart does not identify its capture edition.
Credit the chart to Anka's Nectaris guide and underlying game artwork to
Hudson/Konami. This is third-party-derived art, not original remake artwork.
The user requested this import; no separate redistribution license was found
on the source page. That distinction must remain in provenance records.

## Adaptation

The JPEG contains 23 blue unit pictures on colored role cards. It is not a
lossless transparent sprite atlas, but every picture is an exact 2× enlargement:
each art pixel is a 2×2 block of chart pixels, and no sprite exceeds 16×16 art
pixels. `tools/import-legacy-unit-art.py` finds each sprite's block grid,
averages every block, removes the flat card color by flood fill from outside the
sprite, and gives each remaining block the nearest of the chart's seven colors:
black, dark teal, mid blue, gray, cyan, light cyan and white. JPEG stores
brightness at full resolution and color at half resolution, so the comparison
weights brightness. These are adaptations of the selected chart, not claimed
bit-exact ROM sprites or newly invented silhouettes.

**Every unit keeps the chart's 2×2 pixels, infantry included** (user decision,
2026-09-26). Frames place the sprite unscaled and centered in **32×32**, which
gives the original map's proportions on 48×32 hexes (sprites up to 32×32; corners
may reach past the hex's slanted edges, as in the original). The Remake safe-hex
envelope and 17-pixel infantry limit do not apply to Legacy. This supersedes the
first import (2026-09-20), which classified single JPEG pixels and shrank the
result with nearest-neighbor sampling to fit that envelope. That dropped every
mid-gray pixel, so terrain showed through holes in all 46 frames, and drew some
art pixels half-width. `test/unit-art-tests.js` checks that each Legacy frame is
intact 2×2 blocks, has no enclosed see-through pixel and uses only the seven
chart colors.

The chart supplies one faction and facing. Its dark teal, mid blue, cyan and
light cyan are the faction colors; green, red and neutral ramps replace them
for game states, while black, gray and white stay shared. Spent icons use the
normal greyscale treatment.
Left-facing art mirrors the extracted source, including its lighting. This is
a documented preservation exception to the separately relit Remake frames.

Japanese-to-US mappings follow the equipment identities. In particular:
Armadillo → Polar, Monster → Titan, Jabby → Eagle, Munks → Charlie,
Estoll/MR-22 → Octopus, Nashorn/SG-4 → Hadrian. No unit stats change.

## Rebuilding

```sh
python3 tools/import-legacy-unit-art.py
node test/run-tests.js
```

Pillow is needed only for rebuilding; playing still has no dependencies or
build step. Generated indexed data lives in `js/data-unit-art-legacy.js`.
`output/` contains 184 native PNGs, a contact sheet and the import manifest.

Palette codes 1–7 are the chart colors, darkest first; codes 8–f are unused and
filled with magenta so a stray reference is visible.

Both sets are registered in `js/unit-icon-sets.js`. A pack needs an id, label,
complete 32×32 left/right frames for all 23 stock units, and union/xenon/attack/
neutral palettes. `register()` validates this contract before exposing a pack.
Legacy is the default set since 2026-09-26. The selected id is saved as
`nectaris-unit-icon-set-v2`, independent of map data and profiles. Game, editor,
roster sheet and map preview share it.

## Legacy map style

The user's follow-up also requested the old map tile style. `js/legacy-terrain.js`
reconstructs that appearance with original code-authored pixels, based on the
local original-game terrain reference chart: maroon speckled plains, gray
ridged hills, pink stepped mountain plateaus, pale roads, dark valleys and
rubble. These tiles are not extracted bitmap assets. The reference captures
remain local and gitignored.

Since 2026-09-27 the buildings follow the original's top-down map tiles, so the
base and the factory no longer share one domed design. The base is the prison
camp: a square walled compound with maze-like inner walls, cell windows, a gate
and a watchtower annex. The factory has two round tanks, a long piped hall and
two sheds on an L-shaped footing. Both are Union blue or Xenon green; a neutral
factory is yellow and a neutral base grey. They are text pixel maps in
`BUILDINGS` in `js/legacy-terrain.js`, drawn for this project after studying
the screenshots on [Anka's factory page](https://anka.sakura.ne.jp/nectaris/l5.html)
and the local encirclement-quiz capture. No pixels were copied from them.

The set selects production 48×32 flattened hexes with 32×32 center pitch and
16-pixel odd-column stagger. Roads, hills, mountains and valley banks use
neighbor-dependent variants. Since 2026-09-27 a valley is a continuous ravine
along the lines between connected valley cells, and a tile next to a valley
draws the part of its bank that crosses the shared edge. Terrain and unit art
scale with the map using integer raster boundaries. The board uses a thin,
rounded rectangular frame. The small gaps outside the outer hexes carry
reflected edge terrain, without duplicating buildings or extending roads or
ravines. This decorative margin does not add selectable cells or alter
movement. Interior hexes keep their exact geometry and terrain pixels. The
border is clipped to the viewport and included in the shared terrain cache.
Picking, highlights, map bounds, panning and editor painting use the same hex
geometry. Classic/neon are unaffected.

On a turned board (Board: Auto or Sideways), the tiles are drawn upright in
screen space with a 32×48 turned layout: the same hex after the quarter turn,
with the picture's up direction kept. Review both orientations with
`tools/terrain-sheet.html` on the local development server.
