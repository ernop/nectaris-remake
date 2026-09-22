# Product decisions

Settled product and UI decisions for this remake. Mechanics reconstruction
(with sources) lives in `MECHANICS.md`. Link this file from `agents.md` and
the README so later sessions load it.

## Optional inspector and full map height (2026-09-22)

The left inspector starts closed. **Details** in the top bar toggles it, and
its close button returns the space to the map. Remember the choice across
matches and reloads. Selection and hovering never force it open. Hover cards
remain available on the map; the Details button highlights when a combat
forecast is ready to inspect. **Undo last** stays accessible in the top bar.

The top bar stays one fixed-height row, including when button labels or counts
change. Match information and settings scroll horizontally when necessary;
Details, Undo and End Turn stay together at the right. Never wrap controls onto
a second row or truncate information to fit.

Attack, End, Cancel and transport commands always occupy the same bottom-left
action strip, outside the battlefield. Keep the menu to one row; scroll long
command lists horizontally. Allocate its space only while commands are visible,
then reclaim it when they close. Keep the camera stable as the strip opens;
refit for window and inspector size changes. This replaces nearby-unit and
map-edge placement.

## Enemy movement inspection (2026-09-20)

During your turn, click an enemy to inspect its details and orange movement
range. This previews a full next-turn movement budget on the current board,
respecting terrain, occupancy and ZOC, without changing the unit or match.
Clicking a destination clears inspection; it never moves the enemy. Escape
also clears it, and clicking another unit selects or inspects that unit.
While choosing an attack, red targets retain their attack-click behavior;
cancel the current action first to inspect enemy movement.

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
proportionally with zoom. Grab with the left, middle or right mouse button to
pan at any zoom level, including when the entire map fits (2026-09-22).
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

## Mission-card force totals (2026-09-03)

Every campaign, expansion and custom-level choice shows the initial Union and
Xenon squad totals. Each side's number includes fielded squads and units stored
in factories already owned by that side; neutral-factory inventory belongs to
neither side and is excluded. The numbers are larger than their labels and use
tabular figures so force size can be compared before choosing a mission.

## AI-made fjord levels (2026-09-22)

The AI-made category preserves seven separate original maps, with stable
`aiMadeIndex` values 0–6 in the menu, map selector and profile records.
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
equal proportions. Each side starts with exactly one Charlie, one Panther
motorcycle infantry and one Rabbit missile buggy. Pelicans remain permitted,
and every Atlas or mine follows its own compatible carrier in the roster.

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

## Building capture, storage and deployment (updated 2026-09-21)

Each ready inventory row is a full-width native Deploy button, including its
icon and name. Unavailable and unowned rows remain non-actionable. Experience
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

Clicking any unoccupied base or factory presents every stored unit, including
neutral and enemy buildings before capture. Ownership and inventory count appear above
the unit icons, names, damage and experience. Unowned inventories explain that
infantry must capture the factory to deploy; they offer no deployment controls.
Empty buildings explicitly say there are no stored units. Hovering a building
also lists its contents in the sidebar, even when a unit occupies its hex or
another unit is selected. A valid movement click still moves the selected unit;
an unreachable building opens for inspection on the same click.

At an owned base or factory, a ready unit's entire row is its
**Deploy** button; a unit that cannot deploy states either **AVAILABLE NEXT
TURN** or **NO DESTINATION**. Choosing a ready unit highlights all valid
destinations among the six neighboring hexes:

- Green: an unoccupied hex whose terrain is marked `deployable`
- Blue: an adjacent friendly Mule or Pelican with an empty cargo slot

The player clicks one highlighted destination. Ground units may use compatible
transports; aircraft cannot board, Mule has its original passenger restrictions,
and Atlas/Trigger may deploy directly or aboard a carrier. Deployment spends the unit's activation, including deployment into
a transport. This flow exposes the factory inventory as soon as capture is
complete and makes the destination a player choice rather than selecting a
transport automatically.

## Local development endpoint (2026-09-03)

The permanent local backend port is **8001**, bound to `127.0.0.1` by
`serve.sh`. The machine's shared Caddy setup registers the project as
`nectaris-remake` and exposes it at <http://nectaris.localhost>. The fixed port
prevents unrelated temporary servers from changing the project URL, while the
Caddy hostname removes the need to remember the port during normal use.

## Shift, target inspection and combat controls (updated 2026-09-21)

Stopping a loaded transport offers **Unload [unit]** beside the map controls
and in the sidebar. Ending the carrier's activation keeps eligible passenger
actions open, with Close to dismiss them. Cargo that already acted (including
boarding this turn) must wait; the sidebar explains this or a lack of legal exits.

Selecting a ready mobile unit immediately opens its legal movement destinations
and boardable transports. **Attack** switches to targets from its current hex;
it is disabled if no target exists. A deployed Atlas aims immediately, Trigger
has no movement/attack, and Pelican cannot attack. This 2026-09-21 speed-flow
correction supersedes the earlier separate Shift-selection step.

A destination click commits the movement immediately. With a legal shot, show
red targets and **End**. Without a legal shot, end the unit automatically and
return to the map. Shift-or-fire units therefore end immediately after moving.
A unit with a remaining shot can be reselected to fire, but cannot move again.
Surviving buggies immediately show their remaining movement after attacking.
Enemy clicks during movement still inspect; never add automatic move-and-attack.

After choosing Attack or a Shift destination, only enemies attackable from that position turn
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
Escape clears selection. Unload remains available for eligible passengers.
Results close automatically after the casualty animation and lock input while
resolving.

### Undo history (2026-09-21; moved to top bar 2026-09-22)

**Undo last** reverses noncombat actions across units, with no fixed step limit.
Movement (including subsequent End), boarding, unloading, deployment, storage,
repair and factory capture restore the entire previous board and action state.
History persists with the saved match. Each record holds dynamic state once;
map/roster definitions are shared by the save. Undo clears stale targeting and
selection state and preserves cargo/factory identity relationships.

Combat clears all earlier history immediately, before its result animation.
Later moves may be undone only back to that postbattle state, never across the
battle. Turn changes and match completion also clear history. Undo is disabled
during combat/AI processing. There is no redo or way to reroll a battle.

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
