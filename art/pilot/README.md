# Native 32-pixel art-direction pilot

Revision 4, 2026-09-20: **Bison and Polar tanks, Eagle aircraft, Charlie infantry
and Hadrian artillery** have been redrawn with straight military forms after
the user rejected rounded/chibi proportions. Flat armor and sharp bevels retain
the white highlights and dark recesses. The existing domed base remains in the scene for context.

Open [the interactive preview](http://nectaris.localhost/tools/art-pilot.html).
Select units or bases, toggle the grid/frame guides, and inspect faction,
attacking or completed colors. Every icon, including the inspector, is shown
at **32×32**. There are no enlarged views or icon zoom controls.

## Decisions reflected in this revision

- All sources are authored directly on a 32×32 pixel grid.
- Hexes are flattened 48×32, with 32-pixel row/column pitch and 16-pixel stagger.
- Opaque bounds are horizontally centered, with equal transparent padding on
  the left and right in both facings. Guns and shadows count toward the bounds.
- Bison has a long welded hull, flat turret and extended narrow gun; visible
  bounds are 28×15.
- Polar has slab side skirts and a low offset rectangular turret; visible
  bounds are 28×19.
- Hadrian has a flat tracked carriage, box breech and long raised gun; visible
  bounds are 28×20.
- Charlie is only 18×17 including outline, with a four-pixel helmet, straight
  vest and proportionate legs.
- Eagle has a narrow fuselage, straight wings with squared tips and a tiny
  canopy slit; visible bounds are 28×17.
- The base is a low domed compound with an irregular perimeter, open service
  yard, short mast and access apron, rather than a boxy shed.
- Screen-upper-left light uses broad white/pale armor clusters and deep dark
  recesses. Selected lit contour pixels inherit the highlights; the shadow
  edges stay charcoal. There is no continuous white halo.
- Shapes/facets are authored for both facings; faction colors use shared ramps.

## Source and output

- `../units/pixel-art.js`: shared editable pixel constructions and constants.
- Run `node tools/build-art-pilot.js` from the repository root. The exporter
  uses Node's standard library; production needs no new dependencies.
- `output/`: 44 exact 32×32 transparent PNGs: five units × two facings ×
  four states, plus one base × four states.
- `output/map-context.png`: native 548×310 composition. Both map icons and
  inspector use the same native 32×32 source without enlargement.
- `output/pilot-units-native.png`: native-size samples in flattened hexes.
- `output/manifest.json`: source dimensions, opaque bounds and placement data.

The map is an original **art review fixture**, not a campaign mission. Its
continuous hills, valley, road and bridge establish contrast and scale.
Production terrain connection rules are still pending. The complete unit roster
now uses this source in the game/editor renderer; see `../units/README.md`.
The interactive map supports substituting any of the 23 types and shows the
full roster sheet below it. The fixed pilot PNGs retain the original five types.

## Validation

The exporter rejects empty frames, incorrect dimensions, out-of-palette
indices, unsafe pixels and unequal horizontal padding. All 44 sprite PNGs
are checked for 32×32 dimensions, binary alpha and at most 15 opaque colors.
Review the page at native size; no enlarged contact sheets are generated.

The revised page is checked in the browser at native size, including Eagle
selection and its inspector. PNG validation passed for
all 44 exports. The original Polar's stronger armor highlights informed this
pass; all constructions remain original project artwork.
