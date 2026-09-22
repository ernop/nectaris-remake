# Art direction and regeneration plan

**Selectable sets:** These authoring rules govern the first/default **1 · Remake**
set. **Legacy** is the user-requested exception: JPEG-derived unit-chart art
with mirrored source shading, plus reconstructed original-style terrain and
buildings. Legacy's 48×32 flattened geometry is integrated in production;
Remake's terrain migration remains pending. Both sets retain native 32×32
unit display, horizontal centering and small infantry. See `art/legacy/README.md`.


**Complete unit roster implemented:** all 23 stock types now use the approved
angular military direction, with 46 separately shaded directional frames and
184 palette PNGs. The game, editor and factories use the native 32×32 data.
Review the full set in `tools/unit-sheet.html` or substitute any type on
`tools/art-pilot.html`. Source, exports and validation are in `art/units/README.md`.

Decided 2026-09-20. The user approved the angular pilot and requested the full
roster, with distinct silhouettes and small infantry. Production terrain,
buildings and flattened geometry migration remain pending. Supersedes the size
alternatives in `ART_RESEARCH.md`.

## Resolution and flattened geometry

**Every unit uses one native 32×32-pixel transparent frame.** There are no
alternate native sizes for classes, factions, UI contexts or zoom levels.
Author new detail on this grid; enlarging the old 22×18 art is not regeneration.
Visible silhouette sizes vary intentionally within the common frame.

Follow the layout in the
[official Nectaris map screenshot](https://www.konami.com/games/pcemini/s/img/package/jp_Nectaris_ss02.jpg).
These dimensions are exactly 2× the nominal original grid measured in
`ART_RESEARCH.md`, with newly authored pixels rather than replicated pixels.

| Constant | Native pixels |
| --- | ---: |
| Unit frame | 32×32 |
| Unit anchor from its upper left | 16, 16 |
| Terrain frame / hex bounding box | 48×32 |
| Terrain anchor | 24, 16 |
| Horizontal column pitch | 32 |
| Vertical row pitch | 32 |
| Odd-column downward stagger | 16 |

Hex boundary vertices in the terrain frame:
`(0,16), (16,0), (32,0), (48,16), (32,32), (16,32)`.
Top and bottom edges are 16 pixels long. Do not substitute a regular hexagon
or the earlier 64×56 proposal. Rectangular terrain frames and square unit
frames use the same native pixel scale.

With the origin at the center of cell (0,0):

```text
centerX = originX + 32 * col
centerY = originY + 32 * row + 16 * (col & 1)
unitUpperLeft = (centerX - 16, centerY - 16)
terrainUpperLeft = (centerX - 24, centerY - 16)
mapWidth = 48 + 32 * (columns - 1)
mapHeight = 32 * rows + (columns > 1 ? 16 : 0)
```

**The transparent frame and visible art are different.** An opaque 32×32
square does not fit in this hex; its corners must stay transparent. Keep two
transparent pixels at frame boundaries, plus clearance from the hex edges.
For a source pixel center, let `dx = x + 0.5 - 16`, `dy = y + 0.5 - 16`.
All opaque art, including outline and shadow, must satisfy:

```text
abs(dx) <= 14
abs(dy) <= 14
abs(dx) + abs(dy) <= 22
```

This leaves approximately 1.5 pixels of diagonal clearance and two at the top
and bottom. The Bison pilot occupies 28×15 visible pixels. Larger bounding
boxes need transparent corners; never crop a gun or rotor to enforce the mask.
Change its construction instead. Every frame has the same anchor, including
aircraft: their visual lift is authored inside the frame, not a runtime offset.

## Display, picking and map integration

- **Map icons scale with their hexes** (2026-09-21 user correction). Render the
  32×32 source at `32 × map zoom` so its footprint stays proportional to terrain.
  This supersedes the old prohibition against enlarging map icons. Inspector,
  factory and review icons remain native 32×32.
- Use pixel-aligned placement and nearest-neighbor sampling with smoothing
  disabled. Account for device pixel ratio without changing the icon's
  intended proportions. Test fractional browser/device scaling.
- **Horizontally center the visible artwork**, including its outline, gun and
  contact shadow, within the frame and therefore within its hex. Equal left
  and right transparent padding is mandatory in each facing. Author an even
  visible width so this is exact on integer pixels; never use a half-pixel
  translation. The exporter checks this invariant.
- Charlie is deliberately small: the revised visible silhouette is **18×17**
  inside its 32×32 frame. Use a small field helmet, straight vest and proportionate
  legs; do not fill the available height or enlarge the head.
- Factory, inspector and review icons reuse the same native source at 1:1.
- Retain odd-column adjacency, gameplay distances and all map data. Update
  projection, picking, bounds, road anchors, pan and overlays in game and editor
  together. Optional classic/neon modes share the flattened geometry.
- The new polygon is not a regular hex, and its edges are not the Euclidean
  Voronoi boundaries of its centers. Neither existing `HEX.fromPixel` nor
  nearest-center selection is sufficient. Estimate a lattice candidate and
  test it and its neighbors against the actual polygon. Centered containment
  is `abs(dy) <= 16 && abs(dx) + abs(dy) <= 24`; give shared edges a consistent
  half-open ownership rule and apply the same rule to raster masks.
- Check every interior raster pixel is covered once, including at both column
  parities. A hex grid is an overlay, not a baked border or crack between tiles.

## View, lighting and border decision

**Use the angular military vocabulary of traditional Japanese hex strategy.**
The user explicitly rejected chibi, toy-like and super-deformed proportions.
Author long low hulls, continuous straight tread runs, welded slab armor,
flat rectangular turrets and extended narrow gun barrels. Aircraft use a
slender fuselage, straight wing edges, squared tips and a tiny cockpit slit.
Infantry uses a small helmet and proportionate limbs. Treat white highlights
as flat planes and straight bevels; avoid rounded shine and swollen central
forms. Unit bodies and contact shadows use straight constructions; domed
base architecture remains a separate, previously requested building motif.

Use the reference's elevated three-quarter view: visible top planes,
substantial front-facing sides, and readable tracks/wheels. Keep a common
camera and east/west vehicle axis. Infantry remain upright; aircraft show
their planform. No photographic noise or perspective size changes within a unit.

**Light comes from screen upper left**, consistently on units, terrain and
buildings. Top and upper-left facets are brightest, lower-right facets and
recesses darkest. Use discrete color clusters, no gradients or antialiasing.
A small hard-edged contact shadow sits approximately one pixel down/right,
within the safe envelope. Aircraft may use a small detached shadow. No blur
and no circular backing plate.

**Use selective one-native-pixel charcoal outlines, `#14151F`.** Shadow-facing
contours stay dark; selected upper/left lit edges inherit white or pale faction
highlights. Up to two dark pixels are allowed at track undersides/contact joins.
Use connected near-white clusters on upper armor, not only tiny specular dots.
Interior panels use material shadows instead of black lines around every part.

| Treatment considered | Decision and reason |
| --- | --- |
| White outer stroke | Reject for normal units: resembles a sticker or selection halo and competes with bright ground. |
| Pure black outer stroke | Use slightly colored charcoal instead for a less harsh transition into lunar shadows. |
| No stroke | Reject as default: narrow guns, limbs and tracks lose separation on rocky or light ground. |
| Selective charcoal contour | Adopt on shadow-facing edges; interrupt lit edges with pale highlights for contrast and weight. |

White describes prominent lit armor planes, small metal accents and temporary
selection/target indicators. Selection uses a separate pixel-stepped hex overlay,
never a permanent halo.

**Reference finding after the 32-pixel review:** original map captures and the
[archived Polar icon](https://nectaris.tg-16.com/weapon_guide/zpolar.gif) use
substantial near-white/pale-cyan armor highlights alongside black/deep-blue
shadow edges. The earlier "sparse specular pixels" prescription understated
that contrast. The current five-unit pilot uses connected bright clusters on
turret roofs, hull shoulders and barrel edges, retains dark tracks/recesses,
and allows selected lit edges to interrupt the dark contour. A continuous white
outer halo is still inappropriate. This is a visual reference observation,
not an assertion about exact original palette RGB values. The current 32-pixel
pilot applies this contrast pass to all five unit types. Revision 4 also
rebuilds their silhouettes after the user rejected the rounded proportions;
the base is unchanged.

Union faces right; Xenon faces left. **Mirror shape, then relight facets** for
the same screen-upper-left light. Do not mirror the final shaded bitmap or
its shadow. Bake two matching 32×32 directional index frames per unit, using
material/facet masks and explicit pixel corrections. Faction color is a
palette substitution independent of facing.

## Palette and gameplay states

One shared 16-entry indexed palette per state: transparent plus at most 15
opaque colors. Base asset alpha is exactly 0 or 255. This exact initial palette
is the pilot baseline; tune shared values during native-size visual review,
not by adding unexplained per-unit colors.

| Index / role | Initial value |
| --- | --- |
| 0: transparent | Alpha 0 |
| 1: outline | `#14151F` |
| 2: metal shadow | `#303440` |
| 3: metal middle | `#626B78` |
| 4: metal light | `#A9B6C4` |
| 5: specular | `#ECF4F0` |
| 6–10: faction dark to light | Five-color ramps below |
| 11: glass shadow | `#183D52` |
| 12: glass light | `#91D0D8` |
| 13: ordnance shadow | `#9C6A25` |
| 14: ordnance light | `#F2CB58` |
| 15: contact shadow | `#241C26` |

| State | Body ramp, dark to light |
| --- | --- |
| Union | `#15335A`, `#24578B`, `#397EC0`, `#73B5E8`, `#C0E4F6` |
| Xenon | `#183C28`, `#28653B`, `#419450`, `#80C17A`, `#CCE8AE` |
| Attacking | `#501C28`, `#832C37`, `#BE4448`, `#EE8276`, `#FFD1AC` |

Retain blue/green armies and red attackers. Precompute a bright greyscale
version of the entire palette for completed activations; preserve alpha and
contrast, do not fade opacity. Yellow continues to identify carried missiles,
rockets or bombs. Gun barrels use steel, not yellow.

No unit-name badges. Full-strength 8 stays hidden. Damaged strength, experience,
cargo and interaction indicators remain separate pixel-aligned overlays.
Review their placement against long guns and rotor tips; do not bake UI into art.

## Terrain and buildings

- Continuous dark reddish/brown plains with restrained pixel clusters and
  occasional craters. Start with six stable texture variants, without putting
  a crater or other large symbol in every cell.
- Grey hills connect into rounded ridges. Pale layered plateaus denote
  mountains; dense broken stone denotes wasteland. Use the references' visual
  hierarchy and lighting, while authoring original pixels.
- Valley interiors, banks and end caps connect continuously. Road edges meet
  exact shared endpoints; bridge decks agree with both road and valley joins.
- Use six-neighbor masks, reusable edge/corner pieces and curated variants.
  Coordinate-seeded variation stays stable while moving the camera. Review
  concave joins, junctions, isolated features and long runs.
- Terrain frames are 48×32. Buildings are original 32×32 objects with the
  common anchor, pixel lighting and faction colors, above continuous ground.
  Bases use low domed bunkers, uneven service blocks, perimeter walls and an
  open courtyard/ramp, inspired by the original installations. Avoid large
  box-shaped sheds. Center the visible compound horizontally within its hex.
- No permanent full-map grid in normal view. Provide a grid toggle and
  movement/attack/selection overlays with exact geometry when useful.
- Start with a documented terrain palette capped at 24 opaque colors across
  the set; keep terrain contrast and detail subordinate to units.

## Regeneration method and deliverables

Continue this project's editable **code-native pixel artwork**, rebuilt at
32×32. Author integer-coordinate silhouettes, material/facet regions and
explicit pixel clusters, with per-unit cleanup. Rasterize using deterministic
hard pixel fills; do not create assets with antialiased canvas polygons.
Material/facet masks allow mirrored shapes to be relit consistently.

Neither stretched old matrices nor generic class silhouettes count as new
art. Generative raster imagery is not the production source for this pass:
pixel-like appearance alone does not guarantee a uniform grid, exact palette,
matched facing or readable silhouettes. A concept-image stage is optional and
not needed to execute this plan. This method extends the existing code art.

Implemented unit outputs:

- `art/units/`: editable per-unit integer geometry, material/facet masks and
  cleanup pixels, plus shared palette, frame and anchor metadata.
- `tools/build-unit-art.js`: dependency-free authoring/export command producing
  two indexed 32×32 frames per stock ID and rejecting invalid results.
- `js/data-unit-art.js`: checked-in generated data for all **46 directional
  frames**, loaded as a normal script; production still needs no build step.
- Cache palette-decoded horizontal pixel runs once, then draw at integer
  coordinates with smoothing disabled. PNG previews are exported separately.
- Preserve custom `sprite` overrides, class fallbacks and stock unit IDs.
- `tools/unit-sheet.html` provides native-size previews, both directions,
  state palettes, light/dark terrain backdrops, frame guides and silhouette view.

## Per-unit art briefs

These are visual briefs, not changes to capabilities. Approximate bounds include
outlines and remain subject to the safe envelope; they are not solid rectangles.

| Unit | Identifying construction | Maximum target bounds |
| --- | --- | --- |
| Charlie | Upright helmeted rifleman, rifle separated from torso | 18×18 |
| Kilroy | Small rifleman with shoulder launcher and readable warhead | 22×17 |
| Panther | Small rider and low motorcycle, two clear wheels | 22×14 |
| Bison | Low rectangular turret, straight tracks, long single gun | 28×15 |
| Lenet | Compact scout hull, two staggered turrets and short guns | 22×16 |
| Polar | Slab armor, segmented skirts, low offset turret | 28×19 |
| Grizzly | Longer gun and distinctive angular turret | 28×18 |
| Slagger | Low hover wedge and underside gap, no tracks | 26×16 |
| Titan | Armored chassis and unmistakable missile rack | 28×20 |
| Giant | Wide heavy hull and separated twin barrels | 28×20 |
| Eagle | Narrow fuselage, straight wing edges, small cockpit and bombs | 28×17 |
| Falcon | Narrow interceptor, swept delta wings | 26×22 |
| Hunter | Twin engines and wingtip missiles | 28×24 |
| Hadrian | Long raised diagonal gun, flat tracked carriage | 28×20 |
| Octopus | Box launcher with multiple tube mouths | 26×20 |
| Atlas | Heavy cannon on stationary outriggers | 28×20 |
| Rabbit | Small wheeled buggy and twin short missiles | 24×16 |
| Lynx | Longer missile and offset radar on distinct buggy | 28×18 |
| Seeker | Two elevated barrels separated from hull | 26×22 |
| Hawkeye | Large dish and missile rack | 26×22 |
| Mule | Cargo box, forward cab and three wheel pairs | 26×18 |
| Pelican | Cargo fuselage, tail, large crossed rotor | 28×24 |
| Trigger | Low pressure plate and perimeter spikes | 18×14 |

## Implementation status and remaining checks

1. **Unit pilot and roster complete.** All 23 units × 2 directions = 46 frames,
   plus 184 state/direction PNGs. Distinct opaque silhouettes, small infantry,
   exact centering and safe hex fit are enforced by the exporter and tests.
2. **Unit integration complete.** Game/editor maps and factories use generated
   native data. Map sprites scale proportionally at fractional and whole map
   zooms, with shared pixel boundaries rounded for crisp rendering. Larger maps scroll. Classic/neon retain their existing vector artwork.
3. **Geometry and terrain pending.** The review fixture uses the planned 48×32
   geometry, connected hills/valley/roads and domed base. Production still uses
   its earlier terrain and regular hex projection. Centralize flattened map
   geometry, picking, bounds, editor projection and road anchors before replacing
   all terrain/building art and connection rules.
4. **Broader terrain verification pending.** Review campaign/expansion maps,
   narrow/wide viewports and device/browser scaling with the final terrain.
   Validate overlays, seams, raster coverage and hit testing as part of that work.

Unit automated checks: all 23 IDs and 46 nonempty 32×32 frames; valid
palette indices/binary alpha; padding and safe fit; anchor invariance;
generated-source parity and actual renderer output for both facings and states.
Remaining geometry checks: center-to-cell round trips; shared-edge/corner ownership for both parities;
single-column bounds; exactly-once raster coverage; unchanged logical neighbors.
Exercise all 64 six-neighbor combinations for each connected terrain type's
connection validity. This does not require 64 separately painted full tiles.

Required visual checks: correct upper-left lighting for both directions;
silhouette readability without labels; contrast on all terrain and state
palettes; square equal-size pixels at native display size; no clipped weapons,
floating units, gaps, mismatched roads/bridges, or status-overlay collisions.
No fractional sprite dimensions or half-pixel overdraw remains in pixel mode.

## Decision status

The user selected 32×32 unit frames, original flattened geometry, smaller
infantry, original-style bases and exact horizontal centering. The 2026-09-21
correction scales map icons with zoom; standalone previews remain native-sized. These replace the first 64-pixel pilot and enlarged review views.
Angular military proportions replace the rejected rounded/chibi construction.
Upper-left lighting, selective charcoal contours and native pixel authoring remain.

The user approved the revised angular pilot. All 23 unit types are now rebuilt
and integrated; Charlie and Kilroy are 17 visible pixels tall, Panther 14.
The full roster has 46 directional frames and 184 state PNGs. Production
terrain, building regeneration and flattened geometry remain the next art phase.
