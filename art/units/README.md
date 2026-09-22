# Native military unit roster

Revision 5, 2026-09-20: all **23 stock units** use the approved angular military
direction. These are original constructions, not traced or extracted assets.
This is **1 · Remake**, the first/default registered set. The separate
[Legacy set](../legacy/README.md) is an explicitly requested chart import.

- One **32×32 transparent frame**. Map icons scale with terrain zoom, preserving
  their footprint within the hex (2026-09-21 correction). Factories, inspectors
  and review pages show the native frame.
- **46 directional frames**, separately shaded for fixed upper-left light.
  The visible art, including weapons and shadows, is horizontally centered.
- Low hulls, flat turrets, straight wings, charcoal recesses and broad pale
  armor highlights. Yellow denotes carried missiles, rockets and bombs.
- Distinct silhouettes for every type: scout turrets, hover gap, heavy skirts,
  twin barrels, launcher mouths, outriggers, missile rails, radar, cargo and rotor.
- Small infantry: Charlie **18×17**, Kilroy **22×17**, Panther **22×14** visible
  pixels inside the common frame. Helmets and rider bodies stay small.
- Union blue, Xenon green, attacker red, spent greyscale, neutral grey.

Review the [complete roster](http://nectaris.localhost/tools/unit-sheet.html)
on light/dark ground, with frame or silhouette guides. The
[map fixture](http://nectaris.localhost/tools/art-pilot.html) lets you select
any roster type for the selected position. Both show native-size icons only.

## Editing and export

`pixel-art.js` is the editable indexed source. From the repository root run:

```sh
node tools/build-unit-art.js
node tools/build-art-pilot.js
node test/run-tests.js
```

The exporter produces `js/data-unit-art.js` for the shared game/editor renderer,
plus **184 transparent PNGs** (23 × 2 directions × 4 review states) and three
native contact sheets in `output/`. `manifest.json` records exact visible bounds.
The checked-in data loads as a normal script, so playing requires no build step.
PNG export uses Node's standard library. Custom sprite overrides and class
fallbacks still use the corresponding stock art.

The exporter and regression tests enforce exact dimensions, palette indices,
safe fit in the planned flattened hex, equal horizontal padding and small
infantry. Tests also check unique opaque silhouettes, generated-source parity,
both facings and every state through the real renderer, and proportional, crisp rendering
at fractional/whole map zoom levels with native frames in UI slots.

Validation on 2026-09-20: all 184 PNGs passed dimension, binary-alpha, palette
and centering checks; the full suite passed **41,256 checks with zero failures**.
Browser review covered native faction/state previews on light and dark ground,
Pelican in the map fixture, the ARATUS game map and REVOLT in the editor.

The 48×32 flattened terrain and domed base in the map fixture are review art.
Production terrain, building regeneration and geometry migration remain separate
work; this roster is already integrated into the existing game/editor maps.
