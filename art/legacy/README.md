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
lossless transparent sprite atlas. `tools/import-legacy-unit-art.py` records
each source rectangle, removes card backgrounds, quantizes JPEG color noise,
and centers the result inside a transparent **32×32** frame. Nearest-neighbor
normalization fits the existing hex envelope; infantry stays at most 17 pixels
tall. These are adaptations of the selected chart, not claimed bit-exact ROM
sprites or newly invented silhouettes.

The chart supplies one faction and facing. Green, red and neutral palettes are
derived for game states; spent icons use the normal greyscale treatment.
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

Both sets are registered in `js/unit-icon-sets.js`. A pack needs an id, label,
complete 32×32 left/right frames for all 23 stock units, and union/xenon/attack/
neutral palettes. `register()` validates this contract before exposing a pack.
The selected id is saved as `nectaris-unit-icon-set-v1`, independent of map
data and profiles. Game, editor, roster sheet and map preview share it.

## Legacy map style

The user's follow-up also requested the old map tile style. `js/legacy-terrain.js`
reconstructs that appearance with original code-authored pixels, based on the
local original-game terrain reference chart: maroon speckled plains, gray
ridged hills, pink stepped mountain plateaus, pale roads, dark valleys, rubble
and low white domed buildings with faction trim. These tiles are not extracted
bitmap assets. The reference captures remain local and gitignored.

The set selects production 48×32 flattened hexes with 32×32 center pitch and
16-pixel odd-column stagger. Roads, hills, mountains and valley banks use
neighbor-dependent variants. Terrain scales with integer raster boundaries;
units always retain their native 32×32 display. Picking, highlights, map bounds,
panning and editor painting use the same geometry. Classic/neon are unaffected.
