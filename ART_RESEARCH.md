# Pixel-art dimensions and terrain research

Research date: 2026-09-20. Historical research and initial alternatives.
**The subsequent decision is in [ART_DIRECTION.md](ART_DIRECTION.md): 32×32
unit frames on 48×32 flattened hexes, with 32×32 pitch and 16-pixel stagger.
Icons display at native size only and their visible artwork is centered horizontally.**
The alternatives below are research history, not active choices. Runtime art
and rendering behavior have not yet changed in this planning pass.

## Current remake: verified in code

- Pixel is the default; classic and neon are also selectable. Terrain and
  buildings do not have a separate pixel rendering path.
- All 23 stock unit matrices are exactly **22×18** cells, including transparent
  padding (`SPRITE_W`, `SPRITE_H`, `UNIT_SPRITES` in `js/render.js`). Their
  visible bounds vary: Bison is 17×10, Polar 19×14, Giant 20×14, and Charlie
  11×12 cells. These are map icons, not battle-scene illustrations.
- At zoom 1, each sprite cell is drawn at 2.1 canvas pixels. The nominal
  matrix envelope is therefore **46.2×37.8**, before the extra 0.5-pixel
  overdraw on each colored rectangle. Arbitrary zoom and fractional placement
  mean this is not a pixel-exact display pipeline.
- Terrain has **no fixed raster tile size**. Hex radius is 34, yielding a
  **68×58.8897…** bounding box at zoom 1. Column pitch is 51; row pitch is
  58.8897…; odd columns shift down 29.4448… pixels.
- Plains use a solid fill, ten faint circular speckles and an elliptical
  crater. Hills repeat the same smooth mound curves in every hill hex.
  Valley marks also repeat without consulting adjacent valley cells.
- Roads consult neighbors, but still use smooth canvas strokes. Terrain
  curves, buildings, grid strokes and fractional scaling conflict with the
  unit matrices' intended pixel aesthetic.

## Original game: source and measurement limits

The reference is Hudson's **Nectaris (PC Engine, 1989)**, released in North
America as **Military Madness (TurboGrafx-16, 1990)**. Konami's official
[game listing](https://www.konami.com/games/pcemini/lineup/jp/en/) identifies
both releases. Do not mix measurements from later ports, Neo Nectaris, or
battle scenes into the map-art specification.

Primary visual evidence is the original game's output:

- [Konami's official map screenshot](https://www.konami.com/games/pcemini/s/img/package/jp_Nectaris_ss02.jpg)
  is a resized 600×450 JPEG. Its hex outlines have a 30-pixel vertical repeat,
  30-pixel column pitch and 15-pixel stagger. At 1.875× the original map
  image, these correspond to 16, 16 and 8 source pixels. A hex spans about
  45×30 screenshot pixels, corresponding to **24×16** source pixels.
- [Lossless original map capture, REVOLT](https://www.pcengine.co.uk/Images-Screenshots_L-R/Nectaris_02.gif)
  and [another map capture](https://www.pcengine.co.uk/Images-Screenshots_L-R/Nectaris_06.gif),
  hosted by the PC Engine Software Bible, are **320×239** captured images.
  They corroborate the 16-pixel center spacing and compact unit envelopes.
  Capture size includes interface/cropping and is not an asset size.
- The repository's `inspiration/nectaris-original/` images are useful visual
  references, but several are resized web crops. They are not reliable rulers.

These are **measurements/inferences from screenshots**, not a recovered
Hudson asset specification or a ROM sprite-table audit:

| Map measurement | Original nominal dimensions | Literal 2× |
| --- | --- | --- |
| Logical hex bounding footprint | 24×16 | 48×32 |
| Horizontal column pitch | 16 | 32 |
| Vertical row pitch | 16 | 32 |
| Odd-column vertical stagger | 8 | 16 |
| Map-unit envelope | Approximately 16×16; visible ink varies | Approximately 32×32 |

The original hex is deliberately flattened. Its idealized vertices are
`(0,8), (8,0), (16,0), (24,8), (16,16), (8,16)`. A stroked outline may include
boundary pixels beyond the nominal dimensions. The logical footprint is not
a claim about the original hardware's background-tile or sprite storage.

Visually, ordinary ground is a continuous dark reddish surface with discrete
pixel texture. Grey hills have clustered highlights and shadows; adjacent
landforms connect. Pale pink plateaus belong to the mountain treatment. The
current remake uses a similar pale pink for ordinary plains, making a very
different visual hierarchy. These observations describe appearance, not a
reverse-engineered original terrain-joining algorithm.

## Choices to settle before art regeneration

### A. Literal 2× original proportions

- Terrain footprint **48×32**, pitch **32×32**, odd-column stagger **16**.
- Unit frame **32×32**, with transparent padding and shared anchors.
- This preserves the flattened original map geometry.
- Decide separately whether to author new detail at these dimensions or draw
  at original resolution and enlarge by nearest neighbor. The latter adds
  display size but no additional detail.

### B. Larger, near-regular hexes — initial proposal, not selected

- Terrain asset frame **64×64 RGBA**.
- Visible pixel hex **64×56**, padded by four transparent rows above and below.
- Column pitch **48**, row pitch **56**, odd-column stagger **28**.
- Hex boundary coordinates within the frame:
  `(0,32), (16,4), (48,4), (64,32), (48,60), (16,60)`.
  Define a shared discrete edge mask when implementing so adjacent raster
  tiles partition the grid without holes or conflicting edge ownership.
- Unit asset frame **64×64 RGBA**, sharing the tile's `(32,32)` anchor.
  Target ordinary vehicle artwork around **44×36** visible pixels, allowing
  deliberate silhouette variation and transparent corners; do not stretch
  every vehicle to fill its frame. Test all silhouettes against the hex mask.
- This is a new remake standard, **not** literal 2× original dimensions.
- It retains proportions close to the current map while giving terrain and
  units one consistent, explicit source-pixel grid.

## Requirements shared by either choice

1. Author and validate final art at its exact native dimensions. Large images
   that merely resemble pixel art do not satisfy the specification.
2. Use a small documented palette, discrete pixel clusters, consistent
   lighting, hard edges, and binary transparency for base assets. No smooth
   curves, gradients, blurred shadows, or antialiased silhouette edges.
3. Render terrain, units and buildings on the same source-pixel grid. Use
   nearest-neighbor presentation, integer physical-pixel scaling and snapped
   positions, with an explicit policy for browser/device scaling. Disabling
   image smoothing alone does not fix fractional geometry or zoom.
4. Replace arbitrary zoom with crisp integer steps for normal tactical play.
   If a reduced overview is retained, label it as a separate overview mode.
5. Build multiple restrained plain-ground variants. Keep ground continuous
   and lower in contrast than units; a crater centered in every cell is not
   necessary. Keep the grid subtle or show it on demand.
6. Make hills, mountains, valley banks, roads and bridges connect using their
   six neighboring cells. Start with a base terrain layer, then shared edge
   and corner pieces or curated connection variants. A six-bit neighbor mask
   identifies 64 combinations; it does not require 64 hand-drawn full tiles
   for every terrain type.
7. Review joins in all six directions, isolated features, long ridges,
   concave corners, bridge crossings, and units over each terrain at native
   scale before producing the complete art set.

The user subsequently selected 64×64 unit frames and original flattened map
geometry. See `ART_DIRECTION.md` and `PRODUCT.md` for the settled target and
regeneration plan; neither alternative above is the adopted specification.
