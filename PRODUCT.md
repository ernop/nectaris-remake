# Product decisions

Settled product and UI decisions for this remake, with implementation choices
identified where relevant. Mechanics reconstruction (with sources) lives in
`MECHANICS.md`. [PROJECT_GUIDE.md](PROJECT_GUIDE.md) indexes current guidance,
pending work, experiments and historical evidence.

## Optional inspector and full map height (updated 2026-09-23)

The left inspector starts closed. **Details** in the control area toggles it, and
its close button returns the space to the map. Remember the choice across
matches and reloads. Selection and hovering never force it open. Hover cards
remain available on the map; the Details button highlights when a combat
forecast is ready to inspect. **Undo / Redo** stay accessible as an adjacent pair in the control area.

When controls are at the top, the bar stays one compact fixed-height row, including when button labels or counts
change. Match information and settings scroll horizontally when necessary;
Details, Undo, Redo and End Turn stay together at the right. Never wrap controls onto
a second row or truncate information to fit.

Attack, End, Cancel and transport commands sit beside the selected unit
(2026-09-22 correction). Flip to an open side at viewport edges and avoid units
and selectable destinations. Keep one row; scroll long command lists horizontally.
Only use a temporary strip below the map when nearby controls cannot fit, aligned
with the unit horizontally. Keep the camera stable and reclaim the strip when
it closes; refit for window and inspector size changes. With controls on the
left, put unit commands and the range legend in that column instead; selection
must not create a bottom strip or consume any board height.

## Board orientation and control docking (2026-09-23)

Implemented from the user's request to rotate tall boards for wide monitors,
move the control area to the left on demand, and reduce wasted screen space.
This supersedes the requirement that match controls always occupy the top row.

**Board: Auto / Normal / Sideways** selects the view. Auto is the game default:
compare both orientations against the available canvas and use a clockwise
quarter turn when it allows a larger full-board fit. Normal and Sideways are
explicit overrides. Rotation affects presentation only, keeping logical cells,
rules, saved games and movement costs unchanged. Unit sprites, strength and
reserve counts, hover cards and controls stay upright. Terrain and its border,
roads, movement highlights and firing contours rotate together. Click targets,
wheel zoom around the cursor and Ctrl+left-drag use the displayed orientation.
The editor retains its existing normal orientation.

**Controls: Top / Left** moves the same controls into a compact 184-pixel left
column on demand, leaving the entire right section at full window height.
Keep view controls and Details / Undo / Redo / End Turn accessible; settings
scroll vertically in a short window. Left mode also docks contextual unit
commands and the range legend. Details remains optional. Top mode retains its
single-row scrolling settings and nearby unit commands.

Remember orientation and control position across maps and browser reloads.
**Fit** restores the complete board after zooming or panning. Refit when the
window, controls, inspector, art set or visual style changes. Auto reevaluates
orientation only on those explicit fits, never while dragging or choosing a
destination. Use the actual board bounds and an 8-pixel fit margin; small maps
may enlarge to the existing 4× wheel-zoom limit instead of stopping at 1.6×.
The exact column width, margin, clockwise direction and 2% Auto tie tolerance
are implementation choices, not separately requested product constraints.

## Enemy movement and firing range inspection (updated 2026-09-22)

During your turn, click an enemy to inspect its details and orange movement
range. This previews a full next-turn movement budget on the current board,
respecting terrain, occupancy and ZOC, without changing the unit or match.
Also show firing range from its current hex: solid red outlines for ground fire,
dashed violet for air fire. Keep movement fill visible inside firing outlines.
Use the real per-domain bands, including indirect fire's adjacent blind spot;
show immobile Atlas range and omit unsupported domains. A compact on-map legend
identifies each range even with Details closed. These are separate movement and
current-position firing areas, never a combined move-and-fire threat projection.
Clicking a destination clears inspection; it never moves the enemy. Escape
also clears it, and clicking another unit selects or inspects that unit.
While choosing an attack, red targets retain their attack-click behavior;
cancel the current action first to inspect enemy movement.

### Firing-area border trial (2026-09-23)

The user requested trying only the inner and outer borders of the firing area
after finding Hawkeye's individual dashed target hexes too busy. Implemented
for friendly selection and enemy inspection in all art styles: join covered
hexes into one area per attack domain and draw only its exposed edges, including
minimum-range holes and board boundaries. This replaces the per-hex firing
outlines; movement destinations and red legal enemy targets retain their fills.
Ground borders stay solid red and air borders dashed violet. A wider ground
stroke under the air dashes keeps both visible on a shared boundary (an
implementation choice). Hawkeye's air-only 2–5 band still excludes its own
hex and all adjacent hexes; the firing area always uses the current position.
This is the requested visual trial, pending the user's assessment, with no
change to ranges, movement or attack eligibility.

## Selectable art sets (2026-09-20)

The **Art set** selector offers **1 · Remake** first/default and **Legacy**
second. Legacy unit icons are adapted from the user-selected ユニットデータ
chart; source provenance and the JPEG limitations are in `art/legacy/README.md`.
Both sets provide all 23 units in native 32×32 frames and all game states.

Legacy also selects reconstructed original-style terrain and buildings, with
48×32 flattened hexes, 32×32 pitch, 16-pixel odd-column stagger, connected roads
and relief, integer pixel drawing and no permanent grid. Minimum zoom now adapts
to the map and viewport, allowing a full overview in every style and art set
(2026-09-22); unit icons scale with map zoom. Remake keeps its existing production terrain
until its separate terrain migration is complete. Classic/neon keep their
existing vector appearance and disable the art-set picker.

Selection persists independently of saves/profiles and synchronizes across
same-origin game, editor and review pages. Adding a set uses the validated
registry in `js/unit-icon-sets.js`. Switching sets updates open inventories
and refits the map without changing game data.

## Connected terrain and board borders (2026-09-23)

The user requested smoother vertical mountain ranges, then better outside
edges and borders across the board. Legacy mountains form continuous plateaus
across shared edges and corners: avoid repeating triangular cutouts, isolated
hex outlines and seams in long vertical runs. Keep layered cliffs where actual
on-board low ground meets a range, including bends and concave joins.

At the board boundary, mountain plateaus continue to the outer edge. Missing
neighbors must not create a low-ground strip or an outer cliff suggesting a
route around the mountain. This supersedes the earlier decorative outer cliff
and skirt treatment.

The implemented response uses a thin rounded rectangular frame for every
Legacy terrain type. Small gaps outside the edge hexes carry reflected nearby
terrain, without copied buildings or roads continuing outside the map. The
frame shape was selected during implementation; the user requested the border
improvement but did not explicitly choose between frame shapes.

This is decorative rendering only: preserve map bounds, logical cells,
adjacency, movement, picking and editor painting. Interior terrain pixels stay
unchanged. Keep the border crisp at map zoom, clip work to the viewport and
include it in the existing terrain cache. Classic/neon and Remake retain their
current rendering. Implementation/provenance is in `art/legacy/README.md`;
regressions live in `test/mountain-terrain-tests.js` and
`test/board-border-tests.js`.

## Native pixel art and flattened geometry (2026-09-20)

The settled specification is documented in
[ART_DIRECTION.md](ART_DIRECTION.md). Every unit has one **32×32** native
transparent frame, centered at (16,16). Planned terrain hexes have a **48×32** footprint,
**32×32** center pitch and **16-pixel** odd-column stagger, following the
original's flattened geometry. Sprite corners remain transparent so visible
art fits the hex; see the explicit safe mask in that specification.

Map icons scale from their 32×32 frame with hex zoom (2026-09-21 correction,
superseding the old prohibition on enlarging them). Inspector, factory and
review icons remain native 32×32. Center the visible silhouette horizontally with equal
left/right transparent padding in every facing. Infantry stays smaller within
its frame (Charlie 18×17, Kilroy 22×17, Panther 22×14 visible). Bases are low domed compounds with
open service areas, following the original art's structure.

Use angular military proportions inspired by traditional Japanese hex strategy:
long low hulls, flat rectangular turrets, straight wing edges, narrow fuselages
and small infantry helmets. The user explicitly rejected chibi, toy-like and
super-deformed shapes. Keep domed base architecture as its own building motif.

Use screen-upper-left lighting, selective one-pixel charcoal contours, a shared
indexed palette and integer pixel rendering. Upper armor uses connected white
and pale faction highlights; shadow-facing edges, tracks and recesses stay dark. Opposite-facing shapes must be relit
rather than mirroring the finished shaded image. All 23 units have been rebuilt
at native resolution using editable pixel construction. Terrain, buildings and connections follow
the same pixel density and light. Normal terrain has no permanent hex borders.

All 46 directional unit frames are now integrated into pixel mode in the game,
editor and factory. Review all states in `tools/unit-sheet.html` or substitute
any unit on the native map fixture in `tools/art-pilot.html`. Map sprites scale
proportionally with zoom. **Ctrl+left-drag** is the only map-pan gesture
(2026-09-23), at any zoom and even while choosing a movement destination.
Plain left, middle and right drags never pan. Ctrl-click without dragging never
selects a unit or destination. Show a grab cursor while Ctrl is held and a
grabbing cursor during the gesture; otherwise show a crosshair for map actions.
Do not snap a dragged map back to center; keep a patch visible at the pan limits.
Click without dragging retains normal selection and command behavior. Production
terrain, buildings and flattened map geometry for Remake remain to be migrated.

## Nearby unit inspection (updated 2026-09-22)

Hovering a unit immediately shows a compact card beside its hex, including
when another unit is selected; leaving it immediately hides the card. The card
and sidebar share a compact layout: unit icon and bold faction-colored
name; one stat row for ground attack, supported air attack, defense and Shift.
Omit the air attack cell entirely when that domain cannot be attacked. Ground
attack remains explicit, including zero for air-only and noncombat units.
Range 1 is the default: omit it and all unavailable-range placeholders. Show
longer exact bands directly beneath their attack value; when ground range is
longer, retain an aircraft range of 1 to make mixed ranges unambiguous (Lynx).
Keep terrain and its defense bonus in the footer, adding damage bonus only
when experience grants one. Show remaining/total Shift only when a friendly
buggy has spent movement. Experience has its own readable header badge: 1–7
small stars in the traditional 3/2/3 arrangement, replaced by one large star
for General (8); no badge at zero experience. Reuse the map's star renderer.
Damaged units show only the remaining-unit number on their icon, without a
“Strength” label. Names and terrain text wrap without
truncation. No faction heading,
stats table, movement chassis, capture explanation or action-rule reminders.
The card stays anchored to the hex. Placement
flips at viewport edges and favors space with fewer units underneath.
The card never covers its own hex and passes pointer events through to the map.
It clears on empty terrain, map exit, Escape, panning, combat and modal panels.
The sidebar remains available for persistent selection and detailed forecasts.

## Strength chrome (2026-08-30)

The map corner strength numeral and its backing are 1.6× their previous size
(2026-09-21), and the inspector corner numeral is similarly enlarged.
Full-strength units do **not** show `8`. Squad size 8 is the default, so
printing it on every healthy unit is redundant. The remaining count is shown
only when damaged (1–7):

- Map unit chrome (bottom-left badge)
- Sidebar and nearby hover unit inspectors (unlabelled icon numeral omitted when full)
- Factory stored-unit list
- Battle-preview name line

`COMBAT.strengthCaption` is the single check. Combat still uses 1–8 internally.

Factory reserve counts use separate, high-contrast map badges: bold white
numbers on an opaque dark backing, outlined in the owner's color (neutral
included). They remain readable at overview zoom, support multiple digits,
and draw above movement highlights in every art style. Empty factories omit
the badge. These numbers count stored units, not squad strength.

## No two-letter unit badges (2026-09-03)

Map units do **not** carry the two-letter stencil badge ("BI", "LY", …). The
silhouettes are the identification, as in the original, and the sidebar names
the unit under the cursor. Together with the hidden full-strength `8` and the
opposing enemy facing (player units face right, enemy units face left), this keeps unit-name text off the map.

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

- **One silhouette per unit type.** The pixel style has two original 32×32
  directional frames for each of the 23 stock units (`js/data-unit-art.js`),
  so types are distinguished by shape: hull width, turret
  form, gun length and count, missile racks, dishes, wings, rotor. Yellow is
  used only for missiles, rockets and bombs, so a yellow accent itself means
  "carries ordnance". Custom unit types render as their class's base chassis
  or as a stock sprite named by `sprite: "GRIZZLY"`; an unknown name is an
  error. Map sprites scale with hex zoom using crisp integer pixel boundaries;
  standalone icons use one native pixel per canvas pixel.
- **Pixel is the default style.** The storage key moved to
  `nectaris-style-v2` so every existing browser sees the new set once instead
  of its saved neon; neon and classic remain selectable.
- **Faction colours follow the original: Union blue, Xenon green** in all
  three styles (neon keeps violet for Union). This frees red.
- **The attacking unit is deep red** (`attackColors` per theme) from the
  moment an attack is previewed — the human hover inspector or the AI's
  "XENON ATTACK" panel — until the result animation ends. The defender gets a
  white ring. The attacker is exempt from the completed-activation greyscale
  so its red is never greyed. `Renderer.attackingUnitId` is the single
  signal; `ui.js` sets and clears it.
- **Completed units stay bright greyscale** (unchanged from 2026-09-02): the
  pixel palette keeps mid and light tones luminous so `grayscale(1)` leaves a
  clearly visible unit, not a dark one.

Review tool: `tools/unit-sheet.html` shows every unit as Union, Xenon,
attacking and spent in pixel mode, with native frames and contrast controls.

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

## Mission-list force totals (updated 2026-09-23)

Every campaign, expansion and custom-level entry lists total squads in this
order: **Union, Xenon, Neutral**. Include fielded units and each side's stored
reserves; unowned factory inventories count as Neutral, never as either army.
Use normal, equal-size labels and numbers with tabular figures. The user
explicitly rejected oversized army counts; this supersedes the earlier larger
numbers and omission of neutral reserves. Put the three totals in shared,
right-aligned columns so each side's digits line up vertically between levels.
Column headings can supply the faction labels without repeating them in every entry.

## Single-line comparison entries (2026-09-23 clarification)

Each individual listing in a comparison list must occupy one text line. Never
stack a name, metadata, numbers or result on multiple lines inside that entry;
stacking breaks comparability even when every card has the same height. Multiple
complete listings may sit side by side in columns when there is room. The latest
user preference is **three levels across per row** on wide screens, with two or
one on narrower screens. This supersedes the two-column desktop maximum; it is
not a requirement for only one listing across the entire page.

Keep corresponding fields aligned down each column. In the mission library,
names, dimensions, faction totals and results remain on the same line. Use
horizontal scrolling when necessary, preserving full text rather than wrapping,
fading or truncating it. The earlier two-line dense cards are superseded.
This comparison rule does not prohibit paragraphs in deliberate detail popups.

## Readable interface colors (2026-09-23)

The user requires strong contrast throughout the interface. Never fade text
toward its background, on dark or light surfaces; secondary labels and campaign
numbers must stay readable. Use spacing, size and weight for hierarchy instead
of reduced opacity. Disabled controls retain opaque, readable text and indicate
their state with styling and behavior rather than fading the whole control.
Use saturated Union blue and Xenon green, not washed-out substitutes. The level
list uses the Pixel faction body colors (`#4a90e8` and `#3cb44b`) and bright,
opaque neutral text. Apply this guidance to future UI work; terrain shading and
the spent-unit art palette retain their separate gameplay/art requirements.

## AI-made fjord levels (2026-09-22)

The AI-made category preserves fifteen separate original maps, with stable
`aiMadeIndex` values 0–14 in the menu, map selector and profile records.
Twisted Fjords (65×49) is a winding tree; Shattered Fjords (65×49) and
Fractured Fjords (40×40) introduce angular, variable-width passages and
connections between branches. Each has fifteen neutral factories with twelve
ground units, five small clearings, and corner armies of five tanks and three
infantry. Honeycomb Fjords (28×28) scales down to eight factories with ten units,
three staging spaces, and four tanks plus three infantry per side. Its passage
mesh covers the board, separating sixteen mountain pockets of at most nineteen
hexes. The first four maps' factories have exactly one road exit and five
mountain neighbors; these maps exclude aircraft. Arsenal Fjords (Part 5, 28×28)
has nine neutral factories split equally between one, two and three road exits.
Its inventories range from one to twelve units (51 total), with deliberate
infantry, armor, patrol, artillery, engineer and mixed teams. Each inventory
uses at most five unit types and two artillery units. Every immobile Atlas or
Trigger immediately follows a compatible Mule or Pelican, with a separate
carrier for each passenger. Pelicans are the only aircraft. The starting armies
remain four tanks and three infantry each; normal transport rules apply.

Needle Fjords (Part 6, 34×34) and Labyrinth Fjords (Part 7, 30×30) restore
narrow branching fjords after the user found Part 5 too open. Approximately 38%
of each map is floor; the two- and three-hex channels have only two/three small
junction clearings. Factory mouths form a contiguous fan facing down the fjord,
with mountain walls behind them. Part 6 has nine neutral factories; Part 7 has
twenty-one, packed into terminal branches and short wall alcoves in its smaller
channel network. Each inventory has 4–8 units, no infantry or other capturing types,
and at most two artillery units. One-, two- and three-exit factories occur in
equal proportions. Part 6 starts each side with exactly one Charlie, one Panther
motorcycle infantry and one Rabbit missile buggy. Part 7 adds one Bison, one
Polar and one Hadrian to each side in corresponding positions around the camps;
this is a fixed roster, chosen once. Pelicans remain permitted,
and every Atlas or mine follows its own compatible carrier in the roster.

Mirror Fjords (Part 8, 31×30) keeps 21 neutral factories with 4–8 reserves and
the same six-unit starting roster as Part 7. Every terrain hex, building,
inventory and unit placement is reflected left-to-right, including the map
boundary. An odd column count preserves hex adjacency under that reflection.
Nine matched factory pairs and three shared center-line factories give seven
factories with each exit count. The central two-exit factory uses north/south
mouths so both approaches remain symmetrical; other mouths are contiguous.
Both players have identical opening movement costs and routes. Factory stocks
still exclude infantry, and every immobile unit has a preceding carrier.

Laced Fjords (Part 9, 31×30) adds narrow connections, a perimeter passage,
eight isolated plain hexes, and a sparse connected road network. Mountain
depth is at most two hexes. Eleven of its 21 factories contain one Charlie or
Kilroy; inventories remain 4–8 units, seven factories per exit count. It keeps
Part 8's mirrored six-unit formation and remains separately selectable.

Turning Fjords (Part 10, 42×20) is a new map, not a resize of Part 9. A true
180-degree rotation preserves hex adjacency, terrain, inventories and opening
movement. The even-sized board has no fixed center hex: 24 factories form
twelve pairs, allowing eight factories per exit count. Half have one Charlie
or Kilroy, with 4–8 total units each. Focused teams span every tank, artillery,
anti-air and missile vehicle; only Pelicans are permitted aircraft, and each
Atlas/mine follows its own carrier. Both armies start with Charlie, Panther,
Rabbit, Slagger, Titan and Octopus in rotated positions. Interior mountain
islands are at least five hexes, isolated plain clearings are four groups of
five, and edge mountains are at most three thick. Roads connect every factory
approach and camp while covering less than 30% of the main valley floor.

Parts 11–15 are five deliberately different 42×20 route designs, authored in
`tools/build-curiosity-maps.js` and included by the main builder. All retain
180-degree symmetry, matched six-unit starts, 4–8 reserves in focused teams,
exactly half the factories with one Charlie/Kilroy, and equal exit-count groups.
Every map covers the complete permitted reserve roster (all tanks, artillery,
missile and anti-air vehicles, carriers, mines, Charlie and Kilroy). Only Pelicans
fly. Mountain depth and edge bands are at most three hexes; interior mountain
islands are at least five. Roads connect both camps and all factory mouths.

- Part 11, **Switchback Fjords**, has 12 factories along folded lanes and
  hairpins, with two diagonal shortcuts. Extras: Lenet, Slagger, Hadrian.
- Part 12, **Delta Crossings**, has 24 factories around branching tributaries
  and a central valley river. Exactly three bridge crossings carry ground units;
  starting Pelicans offer another approach. Extras: Polar, Lynx, Pelican.
- Part 13, **Caldera Circuit**, has 24 factories on concentric circuits joined
  by radial passes. Wasteland discourages cutting across country; an isolated
  ten-hex plain sits inside the central ridge. Extras: Grizzly, Octopus, Mule.
- Part 14, **Faultline Steps**, has 12 factories among diagonal ridges and
  hill-heavy stepped passes. Extras: Giant, Titan, Seeker.
- Part 15, **Pocket Siege**, has 12 factories supplying four small chambers
  joined by dogleg throats, plus an outer route and two isolated five-hex
  clearings. Extras: Polar, Hadrian, Pelican.

Importable JSON lives under `levels/`; `tools/build-ai-fjords.js` rebuilds it and
the runtime data deterministically. Earlier layouts remain intact when a new
part is added.

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

The user requested the advanced campaign on 2026-09-20. A separate Advanced
section now contains missions 17–32 from the same official executable, with
stable campaign indices 16–31. Normal mission indices, saves, extra packs,
forecasts and all other modern features remain unchanged. The next-mission flow
continues from NECTOR into TLOVER and ends at ROTCEN. Provenance and the two
cross-source roster discrepancies are documented in `LEVEL_SOURCES.md`.

## Building capture, storage and deployment (updated 2026-09-23)

The inventory popup uses the same two-column icon/name roster as factory
mouseovers. Each ready tile is a native Deploy button, including its icon and
name. Unavailable tiles say Next turn or No open exit. This is a deployment
picker only: open it for the current player's building only when at least one
reserve has a legal exit or compatible carrier. The panel anchors beside its factory, flips at map edges, and
scrolls its roster while keeping the heading and close button visible.
Selecting a tile hides the panel and highlights legal exits; Back to factory
and Cancel sit near the factory, falling back to the bottom strip when exits
leave no clear space nearby. After deployment the remaining
roster reopens only if a remaining reserve has a legal deployment destination,
including a compatible carrier. Otherwise close it immediately, even if reserves
remain. Clicking again while all reserves are blocked, spent or absent stays
silent; inspect them through the hover card. Experience
uses the map's traditional 3/2/3 star overlay (General at 8) on the icon, with
an accessible label; there is no separate numeric experience row.


The latest maximum-fidelity request restores the 1989 PCE distinction:
owned factories store and repair every chassis, including aircraft and loaded
transports; prison bases allow parking and provide ground defense without
repairing. This supersedes the earlier same-day base-storage extension.
Unowned factories cannot be ground stopping points except for capturing infantry.
Loaded carrier entry separates its passenger into storage; both are repaired.
Factory entry ends the activation immediately and is not a firing position.

Capturing infantry enters the factory immediately instead of remaining on its
map hex. The factory becomes unoccupied and clickable, its existing inventory
changes to the captor's side, and the capturing infantry joins that inventory
with its deployment locked until its next turn.

The user removed redundant click-to-inspect inventory popups on 2026-09-23.
Neutral/enemy, empty and fully blocked buildings use hover inspection without
opening a dialog. The hover card retains ownership, inventory count, every
unit's icon/name, damage and experience; the sidebar also lists contents even
when a unit occupies the hex or another unit is selected. A valid movement click
still captures or stores the selected unit. An unreachable owned building may
offer deployment if reserves can act, but an unreachable unowned building never
opens a popup. This supersedes the earlier any-building inspection dialog.

Unit names use the short name (Pelican, Grizzly, Atlas), without the model
designation. Every visible unit name is paired with its icon, including cargo,
inventory, action controls and combat previews. Factory hovers use the same
anchored card as unit hovers for neutral and owned factories. List each reserve
separately, even when types match; each icon shows that unit's experience stars
and General emblem. Never combine reserves into a quantity label.

Loaded transports show their passengers and icons in the shared hover/detail card. The
action strip keeps unavailable Unload controls visible, explaining whether the
passenger must wait until next turn or has no legal landing space. A finished
transport remains selectable to inspect its cargo even when unloading is blocked.

Each transport has one passenger transfer per turn: loading or unloading.
Movement does not consume it. Cargo aboard at the start of the turn may be
unloaded before or after moving; loading then moving is allowed, but unloading
must wait until next turn. Unloading then loading a different unit is also
forbidden. Apply this equally to Pelican, Mule and custom transports.

End Turn warns only about legal actions returned by the engine's live-state
availability queries. A nearby popup lists the specific units and reserves;
its Keep playing and End turn anyway buttons perform cancellation/confirmation
inside that popup. The top-bar button never changes into a confirmation.
Reserve deployment is described separately because deployment spends the unit's
turn. Escape or a map click cancels the warning; a changed board requires fresh
confirmation. Blocked, stale and spent units are excluded by the same predicates
that validate actual commands. Button hover colors apply without transitions.

At an owned base or factory, a ready unit's entire tile is its
**Deploy** button; a unit that cannot deploy states either **Next turn**
or **No open exit**. Choosing a ready unit highlights all valid
destinations among the six neighboring hexes:

- Green: an unoccupied hex whose terrain is marked `deployable`
- Blue: an adjacent friendly Mule or Pelican with an empty cargo slot

The player clicks one highlighted destination. Ground units may use compatible
transports; aircraft cannot board, Mule has its original passenger restrictions,
and Atlas/Trigger may deploy directly or aboard a carrier. Deployment spends the unit's activation, including deployment into
a transport. After capture, hover reveals the inventory and a click offers any
legal reserve deployments. The destination is a player choice rather than selecting a
transport automatically.

## Local development endpoint (2026-09-03)

The permanent local backend port is **8001**, bound to `127.0.0.1` by
`serve.sh`. The machine's shared Caddy setup registers the project as
`nectaris-remake` and exposes it at <http://nectaris.localhost>. The fixed port
prevents unrelated temporary servers from changing the project URL, while the
Caddy hostname removes the need to remember the port during normal use.

## Shift, target inspection and combat controls (updated 2026-09-21)

Stopping a loaded transport automatically opens its legal passenger-unloading
hexes in orange (2026-09-23), without a second Unload click. Reselecting a moved
carrier or ending its activation opens those choices whenever unloading is legal.
An orange passenger prompt names the cargo, and available Unload buttons use the
same orange accent. This applies to Pelican, Mule and custom transports; all
hexes come from the engine's legal unloading query. With multiple passengers,
open the first eligible passenger and keep controls for choosing another.

Before movement, selecting a ready carrier still shows movement destinations;
its orange **Unload [unit]** control can open unloading first. A Move control
returns to movement if it is still legal. Right-click, Esc or Cancel dismisses
the orange choices without spending an action or undoing the carrier's move;
a subsequent right-click on the idle map can undo that move. Keep controls clear
of the orange landing hexes and hide hover cards while choosing a landing. Cargo that already acted (including boarding this
turn), a spent transfer allowance or blocked landing terrain never opens an
illegal unloading choice; unavailable controls explain the reason.

Selecting a ready mobile unit immediately opens its legal movement destinations,
boardable transports, firing-range outlines and red legal attack targets from
its current hex (2026-09-23). Clicking a red enemy attacks immediately without
moving; clicking a blue destination moves. **Attack** can still isolate targeting;
it is disabled if no target exists. A deployed Atlas aims immediately, Trigger
has no movement/attack, and Pelican cannot attack. This 2026-09-21 speed-flow
correction supersedes the earlier separate Shift-selection step.

A destination click commits the movement immediately. With a legal shot, show
red targets and **End**. Without a legal shot, end the unit automatically and
return to the map. Shift-or-fire units therefore end immediately after moving.
Surviving buggies immediately show their remaining movement after attacking.
Enemy clicks outside the legal attack targets still inspect; never add automatic move-and-attack.

**Uninterrupted unit activations (2026-09-23 user correction, implemented):**
after moving, finish that unit's attack or choose to end it before using another
unit. Switching units, inspecting an enemy, clicking away or pressing Escape
ends a started activation; its unused attack cannot be saved for later in the
same player turn. Leaving a buggy after combat also forfeits its remaining
retreat. Merely selecting/cancelling a unit before it acts spends nothing, and
clicking the active unit again keeps its current choices. This supersedes the
earlier permission to reselect a moved unit and fire later. End and implicit
deselection remain part of the move's Undo step. Saves preserve the finished
state; a saved or undone activation that is still open can continue only until
the player leaves it. The separately recorded passenger-transfer allowance
still governs unloading.

On selection and after a Shift destination, only enemies attackable from that position turn
red. Hovering one shows its identity, both units' combat stats, support, terrain,
surround, experience, counterattack eligibility and the resulting calculation
in the sidebar, outside the map. The last hovered matchup remains readable
while moving into the sidebar; hovering another target replaces it. Clicking
a red target commits the attack from the chosen position.
Sidebar target buttons also preview on focus or click, so the details remain
available with a keyboard or touch input.

The sidebar includes a two-dimensional casualty probability heatmap from
100,000 independent simulation seeds: enemy losses on the horizontal axis and
our losses on the vertical axis. Show cell rates, mean losses and destruction
probabilities. Simulations use the current combat formula and the documented weighted
14-outcome damage model. Opposing rolls are independently sampled; original
PRNG correlation remains unverified. They must never read, reveal, advance or derive their
seeds from the match RNG. Hovering and cancelling must leave combat state and
the future real result unchanged. Cache projections for the current activation.

Keep unit controls clear of attack/destination hexes, using a temporary strip
below the map only if no on-map position fits. Reposition on pan, zoom and resize.
After a committed move there is no Cancel confirmation; **End** finishes without attacking.
Escape clears selection and ends a started activation. Right-click backs out of the active menu, closes the
End Turn confirmation, or undoes a just-committed move. With no selection it
undoes the last noncombat action. This also works over popup controls, without
opening the browser context menu. Unload remains available for eligible passengers.
Results close automatically after the casualty animation and lock input while
resolving.

### Undo and redo history (2026-09-23)

**Undo** reverses noncombat actions across units, with no fixed step limit.
Movement (including subsequent End), boarding, unloading, deployment, storage,
repair and factory capture restore the entire previous board and action state.
**Redo** restores undone actions in order. Both buttons always appear as a linked
pair; available actions have full opacity and unavailable ones are disabled and
faded. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redoes. A new committed
action discards the abandoned redo branch. Both histories persist with the saved match. Each record holds dynamic state once;
map/roster definitions are shared by the save. Undo clears stale targeting and
selection state and preserves cargo/factory identity relationships.

Combat clears all earlier history immediately, before its result animation.
Later moves may be undone only back to that postbattle state, never across the
battle. Turn changes and match completion also clear history. Undo is disabled
during combat/AI processing, as is Redo. Both histories stop at these boundaries;
combat cannot be undone or rerolled.

## Mission library and deliberate help controls (2026-09-23)

The user rejected aggressive, whole-card mouseovers and requested a consistent
structure across every campaign and level group, with extra detail behind a
subtle edge `?` control. This supersedes the earlier AI-made-only hover layout.

The implemented content layout is:

| Location | Visible content |
| --- | --- |
| Collection header | Category, title, one-line introduction, number of levels won and a small help button |
| Every level entry | One line containing number, name, map dimensions, aligned Union/Xenon/Neutral totals and any personal result; the entry itself is the Play target |
| Level help | Briefing, design/special notes, tags, author/terrain attribution, source link and last-match detail, where supplied |
| Collection help | Making-of context, provenance and links to the detailed collection record |

The user subsequently rejected the large cards, tiny Play buttons, turn-budget
labels, oversized army totals and faded colors. Restore dense entries, omit
turn limits from the list, and make the main entry area a native click-to-play
button. Keep the edge `?` a separate action. This correction supersedes the
initial card layout; retain the shared structure for normal, advanced, AI-made,
Lunar Frontiers, Base Nectaris and custom collections. Preserve campaign numbering and saved result keys.
Count solo victories once per level for group progress; keep legacy campaign
clearance and separate hotseat result records. Show the three faction totals
according to the force-count rule above. Results never add a second line.

Clicking anywhere in the main entry area launches its match; focusing or hovering
that area never opens details. Hovering the small help button deliberately opens its panel after a
short delay; keyboard focus opens it immediately. Click/tap toggles it. The latest
explicit correction requires **0 ms mouseout dismissal**: no timeout, fade or
click/focus exemption may keep it open after the pointer leaves the help button
and panel. This supersedes click-to-pin behavior and the proposed 60 ms grace
period. The panel touches its button so the pointer can enter its text or links
directly without a gap. A second click, outside click, focus leaving the help
region or Escape also dismisses it. Constrain it to the viewport, and close it
when the page or list scrolls or resizes. Only one panel may be open. It must not
change the entry's height or show missing metadata as `undefined`.

Use responsive columns of individually single-line entries and collection jump links. Keep profile selection,
Continue, history, hotseat, briefing language and custom imports accessible.
Remember the menu's scroll position when starting a match and restore it after
rebuilding the list on return. Language/profile changes must preserve entered
import URLs and handlers. Custom text is plain text; source links use safe web
URLs (or local files when running the app from disk).

## Heavier tanks (2026-09-05)

The six tracked tank sprites now use deeper hulls, tread shoes, engine grilles,
raised beveled turrets and recessed hatches. Polar has the widest single-turret
armor envelope and segmented skirts; Giant retains its twin guns, Titan its
missile rack, and Lenet a small scout chassis. These original pixel constructions
use the local captures as visual references only.

## Player profiles and resumable matches (2026-09-20)

First visit asks for a username (1–24 characters, unique ignoring case).
The last-used profile stays selected; the mission menu offers Switch profile
and New profile. Each browser-local profile has its own campaign stars, complete
match-result history (ten per page, with Show older matches), and one unfinished match. Solo results
are wins/losses from Union's perspective; hotseat records name the winning side
and are counted separately. A later campaign win marks only that mission.
The first profile inherits old `nectaris-progress` stars once.

Committed human actions save automatically, including during combat animation.
Save & Menu, page hiding, and navigation also checkpoint. Uncommitted moves are
rolled back in the saved copy. Animated AI turns retain their start checkpoint
until completion; resuming replays that turn deterministically. Snapshots preserve
unit identities, cargo, factory inventory/ownership, action flags, movement
budgets, custom types, turn/player and the random generator state. The menu's
Continue match restores the save; starting another match asks before replacing
it. Match IDs make recording outcomes idempotent.

`js/profiles.js` owns versioned localStorage data under `nectaris-profiles-v1`.
These are local profiles without accounts or cloud sync. The browser and origin
must match; clearing site data removes profiles. Storage failures are visible;
corrupt data is never silently overwritten. A storage change from another tab
stops this tab's match and returns to the menu without writing stale state.


## Outcome history (2026-09-20)

Match history exposes all recorded results, ten at a time, newest first. Each
entry shows victory/defeat (or the hotseat winning faction), ending reason,
turn and timestamp. Mission cards show the profile's solo win/loss totals,
hotseat count and latest result. New entries identify their campaign/pack and
mission index; custom map keys include the title and layout. Old entries without
keys remain readable and match by title.

The result screen confirms which profile recorded the outcome. Completed match
IDs are immutable: repeated callbacks cannot duplicate a result, resurrect a
finished match, or clear a newer save. Turn-limit records show the last playable
turn. Regression tests cover actual engine wins and losses by base capture and
elimination, turn-limit defeat, reloads, history pagination and profile switching.

## Per-battle hover information (2026-09-20)

After choosing a firing position, moving over each red target updates one
inspector with that target's class, movement type, ground/air power and range,
defense, damage and experience. The joint casualty plot uses enemy losses on X
and your losses on Y; each cell is a percentage from 100,000 independent seeds.
The plot precedes the mean-loss summary to keep it closer to the target details.
The calculation section names support contributors and their weighted values,
shows the support divisor, terrain, experience, caps, counterattack eligibility
and ZOC/surround status. Ordinary ZOC restricts movement; it is not a separate
combat bonus. Forecasting never reads or advances the live match RNG.

## Maximum-fidelity rule baseline (2026-09-20)

See `FIDELITY_AUDIT.md` and `MECHANICS.md`. The PCE rules supersede earlier
custom behavior where it conflicts: bases no longer repair/store incoming
units, mines do not prevent elimination, and Atlas still in storage does not
prevent elimination. Other owned reserves count even when exits are blocked.
Existing custom or saved base inventories remain accessible. Loading and
unloading consume the passenger's turn; unloading a ready passenger remains
available after its carrier acts. Modern profiles, saves, editor and forecasts
remain product features and are identified as extras, not original PCE rules.
