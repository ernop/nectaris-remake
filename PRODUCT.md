# Product decisions

Settled product and UI decisions for this remake. Mechanics reconstruction
(with sources) lives in `MECHANICS.md`. Link this file from `agents.md` and
the README so later sessions load it.

## Strength chrome (2026-08-30)

Full-strength units do **not** show `8`. Squad size 8 is the default, so
printing it on every healthy unit is redundant. The remaining count is shown
only when damaged (1–7):

- Map unit chrome (bottom-left badge)
- Sidebar unit inspector (Strength row omitted when full)
- Factory stored-unit list
- Battle-preview name line

`COMBAT.strengthCaption` is the single check. Combat still uses 1–8 internally.

## No two-letter unit badges (2026-09-03)

Map units do **not** carry the two-letter stencil badge ("BI", "LY", …). The
silhouettes are the identification, as in the original, and the sidebar names
the unit under the cursor. Together with the hidden full-strength `8` and the
mirrored enemy facing (player units face right, enemy units face left —
`drawUnitBody`'s `ctx.scale(-1, 1)`), this keeps unit-name text off the map.

## Completed-unit appearance (2026-09-02)

Once a unit has fully completed its activation during its player's current
turn, its map silhouette and remaining-status chrome are fully desaturated
without changing opacity. A unit with an open activation remains at full color,
including a Rabbit or Lynx that has attacked but still has movement available.

`unit.moved` is the state signal. Only completed units belonging to the current
player receive this treatment, so the opposing army does not remain greyed
during the next turn.

## Unit icon set, faction colours and attacker red (2026-09-03)

Adopted from the original's presentation after reviewing the local captures
in `inspiration/nectaris-original/`:

- **One silhouette per unit type.** The pixel style has a hand-drawn 22×18
  top-down sprite for each of the 23 stock units (`UNIT_SPRITES` in
  `js/render.js`), so types are distinguished by shape: hull width, turret
  form, gun length and count, missile racks, dishes, wings, rotor. Yellow is
  used only for missiles, rockets and bombs, so a yellow accent itself means
  "carries ordnance". Custom unit types render as their class's base chassis
  or as a stock sprite named by `sprite: "GRIZZLY"`; an unknown name is an
  error. Sprites are drawn at 2.1 cells per hex unit (46×38 of the 68×59
  hex) so they fill the hex the way the original's do.
- **Pixel is the default style.** The storage key moved to
  `nectaris-style-v2` so every existing browser sees the new set once instead
  of its saved neon; neon and classic remain selectable.
- **Faction colours follow the original: Union blue, Xenon green** in all
  three styles (neon keeps violet for Union). This frees red.
- **The attacking unit is deep red** (`attackColors` per theme) from the
  moment an attack is previewed — the human combat calculator or the AI's
  "XENON ATTACK" panel — until the result animation ends. The defender gets a
  white ring. The attacker is exempt from the completed-activation greyscale
  so its red is never greyed. `Renderer.attackingUnitId` is the single
  signal; `ui.js` sets and clears it.
- **Completed units stay bright greyscale** (unchanged from 2026-09-02): the
  pixel palette keeps mid and light tones luminous so `grayscale(1)` leaves a
  clearly visible unit, not a dark one.

Review tool: `tools/unit-sheet.html` shows every unit as Union, Xenon,
attacking and spent in any style.

## Opposing unit facing (2026-09-02)

Union/player-0 unit silhouettes face right. Xenon/player-1 silhouettes face
left. This applies to every chassis, including mines, in neon, pixel and
classic styles, on the map and in factory icons. Labels and numerical chrome
remain readable rather than being mirrored.

## Local visual references (2026-09-02)

`inspiration/nectaris-original/` contains gitignored local screenshots of
original-game/reference material plus a checked-in source manifest. Future
icon regeneration should consult them for silhouettes, opposing facing,
information density and terrain readability while continuing to produce
original procedural artwork. The captured PNGs are references, not runtime
assets and not files for redistribution.

`inspiration/nectaris-original/index.html` is the local viewer for those
captures: one full-width page, jump links, each filename as the section
heading. It is not linked from the game menu. A missing PNG fails the page
instead of rendering an empty slot.

## Mission-card force totals (2026-09-03)

Every campaign, expansion and custom-level choice shows the initial Union and
Xenon squad totals. Each side's number includes fielded squads and units stored
in factories already owned by that side; neutral-factory inventory belongs to
neither side and is excluded. The numbers are larger than their labels and use
tabular figures so force size can be compared before choosing a mission.

## Official normal campaign (2026-09-03)

The main campaign reproduces the normal campaign built into Hudson's official
1997 Windows PC Engine remake rather than using substitute maps. All 16
missions retain its dimensions, terrain types, building ownership, field
deployments and factory inventories. English unit IDs use the TurboGrafx-16
names; the PC Engine passwords are retained, including `GALOIS`, `APPOLO` and
`NECTOR`.

The data is generated by `tools/extract-original-campaign.js` from Hudson's
official 1997 Windows freeware port, which carries the PC Engine campaign.
The project owner confirmed redistribution permission on 2026-09-03. Original
tile and unit bitmaps are not included; the remake continues to render its own
terrain and unit art.

## Factory capture and deployment flow (2026-09-03)

Capturing infantry enters the factory immediately instead of remaining on its
map hex. The factory becomes unoccupied and clickable, its existing inventory
changes to the captor's side, and the capturing infantry joins that inventory
with its deployment locked until its next turn.

Clicking an owned factory presents every stored unit. A ready unit has a
**Deploy** action; a unit that cannot deploy states either **AVAILABLE NEXT
TURN** or **NO DESTINATION**. Choosing a ready unit highlights all valid
destinations among the six neighboring hexes:

- Green: an unoccupied hex whose terrain is marked `deployable`
- Blue: an adjacent friendly Mule or Pelican with an empty cargo slot

The player clicks one highlighted destination. Ground units may use either
kind; aircraft cannot enter transports, and Atlas and Trigger require a
transport. Deployment spends the unit's activation, including deployment into
a transport. This flow exposes the factory inventory as soon as capture is
complete and makes the destination a player choice rather than selecting a
transport automatically.

## Local development endpoint (2026-09-03)

The permanent local backend port is **8001**, bound to `127.0.0.1` by
`serve.sh`. The machine's shared Caddy setup registers the project as
`nectaris-remake` and exposes it at <http://nectaris.localhost>. The fixed port
prevents unrelated temporary servers from changing the project URL, while the
Caddy hostname removes the need to remember the port during normal use.

## Direct combat controls and heavier tanks (2026-09-05)

Clicking a highlighted enemy commits combat immediately. After choosing a move,
valid enemies remain clickable beside the Finish / Cancel / Unload controls;
there is no Attack menu step. Clicking the selected unit again finishes.
Shift-clicking an enemy opens the optional calculator with Fight / Cancel.
Cancel restores the provisional movement and its movement allowance. Results
return automatically after the casualty animation; combat locks input until
that animation completes. Mobile missile units retain their remaining movement.

The six tracked tank sprites now use deeper hulls, tread shoes, engine grilles,
raised beveled turrets and recessed hatches. Polar has the widest single-turret
armor envelope and segmented skirts; Giant retains its twin guns, Titan its
missile rack, and Lenet a small scout chassis. These original pixel constructions
use the local captures as visual references only.
