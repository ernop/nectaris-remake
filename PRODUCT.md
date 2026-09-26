# Product decisions

Settled product and UI decisions for this remake, with implementation choices
identified where relevant. Mechanics reconstruction (with sources) lives in
`MECHANICS.md`. [PROJECT_GUIDE.md](PROJECT_GUIDE.md) indexes current guidance,
pending work, experiments and historical evidence.

## Search opponents and tournament lab (2026-09-23)

The user requested maximum-strength AI development, several distinct algorithms,
a map-view opponent picker, support for combinations of existing numerical unit
capabilities, and large configurable self-play tournaments with Elo and replays.
Personality presets are explicitly excluded. Implemented policies are Classic,
Tactical (greedy), Sequence (beam), Simulation (MCTS) and Apex (hybrid search
with complete-turn verification). The new-match default is Apex; older saves
without a policy retain Classic. All play under the same engine rules and cannot
read future match randomness.

The **Opponent** dropdown applies changes to the next enemy turn, saves the
selection and records mid-match changes. It is disabled during combat, AI turns,
finished matches and hotseat. Search runs in a cancellable background worker;
Watch AI controls animation without changing decisions. Failures preserve the
turn-start checkpoint and show an actionable error.

**Tournaments** opens a separate lab with opponent and board selection, paired
cycles, round limits, seed, worker count and Elo K. Each matchup swaps faction
assignments at a common seed. An earlier lab cutoff is a draw; original map
timeouts retain their ordinary winner. The lab has pause/stop/resume, ordered
per-run Elo, W/D/L and faction counts, head-to-head tables, saved game replays,
CSV and archive export, and individual replay import/download. Large disk runs
are available through the dependency-free Node worker runner. Profiles and
ordinary human match saves remain separate.

Algorithm sophistication is not a guaranteed difficulty ordering. Elo is
relative to the recorded experiment, not a human rating or a claim of superhuman
play. [AI_OPPONENTS.md](AI_OPPONENTS.md) owns the technical details, resource and
storage limits, generic-unit scope and validation record.

## Battle review (2026-09-25)

The latest user correction restores an original-style battle screen: opposing
formations, machine counts, experience, attack/defense totals and terrain bonus.
It uses the existing selected unit art in a code-authored scene; no original
battle artwork is imported. The local Bison/Munks capture is a layout reference.
Stats describe the pre-battle squads, with the per-machine values shown too.
Live matches animate casualties and hold the result briefly before returning
to the map. Replay selection previews the fight and the next action shows its
recorded result. **Show map / Show battle** switches views without changing the
map's viewport or camera. This supersedes the earlier dock-only presentation.

The fixed left panel retains **N destroyed, M lost**, who attacked whom and the
arithmetic for the coefficient actually drawn. Each shot reports its share of
the published 100-row damage table, this-roll-or-higher share, mean casualties,
exact-loss and loss-or-more shares. Within half a machine counts as near the
average. A disabled counter has no roll. Attack and counter remain separate draws.
The per-side ledger and opening decisions also remain in the left panel.

Replay steps selection then action. Previous/next battle jump to an attack's
selection; Hold battles keeps results visible for at least 2.4 seconds.
The user's 2026-09-26 correction keeps the chosen camera still during opponent
playback: watched moves, deployments, battles, captures and repairs never pan
or zoom. Replays open with **Follow action** off; explicitly enabling it frames
the acted hexes. Fit, wheel zoom and Ctrl+drag turn following off again. This
supersedes automatic live action framing and following by default in replays.
The scrubber shows 0,
midpoint and final command. Seeking or closing cancels visual movement safely.

## Optional inspector and full map height (updated 2026-09-25)

All match controls, contextual commands, status, optional Details, forecasts,
battle reports and replay metadata occupy a fixed-width left panel with its
own vertical scroll. The board owns the remaining width and full window height.
Opening, closing or growing metadata must never resize, refit or move the board.
This user correction supersedes top/bottom bars, nearby unit-command popups,
temporary action rails and automatic control-position switching.
Details still starts closed and remembers its preference. Hover cards remain
available by map hexes. Undo / Redo stay paired; End Turn remains the side-wide
command and is distinct from the removed per-unit End choice.

## Board orientation and control docking (2026-09-23)

Updated by the user's 2026-09-25 fixed-left-panel correction above. The previous
Auto / Top / Left control-placement selector is removed; stored old preferences
no longer move the controls. Panel contents may scroll without changing its width.

**Board: Auto / Normal / Sideways** remains available and persisted. Auto
compares both orientations against the fixed board viewport and uses a clockwise
quarter turn when that fits better. Normal and Sideways are explicit overrides.
Units, counts and labels stay upright; terrain, highlights and hit testing rotate
together. This is presentation only and the editor retains normal orientation.
**Fit** restores the complete board. Window, explicit orientation, art or style
changes may refit; metadata and selection changes may not. Keep the 8-pixel fit
margin, up to 4× zoom, Ctrl+left-drag pan and cursor-anchored wheel zoom.

## Movement presentation and automatic attacks (2026-09-25)

The user corrected the interaction: moving flows straight into legal attack
targets if an unused attack exists. Otherwise the unit finishes automatically.
There is no per-unit **End** button anywhere on the map or in the action panel.
Choosing the current hex commits staying in place under the same attack/finish rule.
Clicking away/Escape may decline a pending shot; ordinary activation, buggy
retreat, move-or-fire, transport and Undo rules remain unchanged.

Human moves, watched AI moves and replays show the unit traversing every hex of
the engine's live legal route. Render-only motion never changes authoritative
coordinates, RNG or saves: the action commits once, then the display catches up.
Commands stay locked during human movement; watched AI/replay playback waits
for movement to finish. Slow frames cannot skip intermediate hexes. Boarding
and storage can draw the moving unit even after it leaves the engine's field list.
Fast, unwatched AI and tournament computation retain their immediate execution.
`test/board-playback.html` checks real-browser board bounds, camera stability,
move-to-attack, auto-completion, save/RNG preservation and battle presentation.

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

## Compensation offers before play (2026-09-23)

Updated 2026-09-25 from the user’s request for visible opening choices, a linked
bot tournament setup and guided questions that find the changeover point.
Implemented; this supersedes the original one-step-at-a-time acceptance UI.

The user approved implementing the automatic second-player compensation
proposal with a longer list and predefined, visible locations near each base.
`js/balance.js` supplies 32 mixed ground-unit packages, starting at zero and
ending at four Polars plus two Charlies. Their ordering expands the available
menu; it does not assert universal unit prices. Every question includes the
cumulative menu through its numbered package,
with earlier packages still selectable. A player may preview the entire finite
schedule before answering. The binary search of these nested menus is an
implementation choice; individual mixed packages are not assumed to have
universally increasing value.

The setup shows the unplayed battlefield, both conditional bonuses, fixed
numbered hexes and exact one-based column/row coordinates. Zoom, base focus,
whole-map fit, Ctrl+left-drag and unit/factory inspection support evaluation.
Units are fielded on those exact empty ground hexes at full strength and zero
experience, ready on their first turn. Sites are deterministic, within five
hexes of the player's owned base, reachable by all offered ground types, closer
to home than the other base, and not adjacent to enemy field units. Building
tiles are excluded. Complete rotational/reflection symmetry detected by the
planner gets corresponding sites. Map authors can instead declare validated
`balanceSpawns` arrays. Use equal slot capacity on both sides, up to six; filter
out packages that cannot fit. No suitable sites means an explained fallback,
not a silently relocated bonus.

Each player privately answers “Would you accept this package to go second?”
They may choose any earlier package in the current menu. Yes brackets downward;
No rejects the whole current menu and brackets upward. Search ends at adjacent
rejected/accepted menu boundaries (or no acceptable package). There are at most
six questions for consistent answers across the 32-package schedule; accepting
an earlier package can shorten the search. Change previous answer restores the
prior question. Accepting a previously rejected package revises that rejection
and rechecks the lower boundary. The final screen permits starting over.

Both players finish before any result is revealed. The lower switch point sets
the deal: that player goes second with the package they accepted, and the other
gets first, as preferred at that menu. Matching switch points use a random
tie-break. If both refuse the entire menu, there is no forced deal: retry, return
to the library, or explicitly choose the normal opening. Hotseat hides the first
player’s completed survey during device handoff. Solo launches independent bot
analysis before accepting input and can collect human answers while the worker
thinks. Neither side sees the other's responses; settlement waits for both.
The selected bot evaluates both roles using its own playing algorithm, as
requested in the 2026-09-25 follow-up, superseding the shared material heuristic.
Neither surveying nor tie-breaking reads or advances combat randomness. The final screen shows
both switch points and the exact bonus; no army acts before Start match.

A prominent **How should the match open?** panel above the campaign/level lists
has **Use normal opening** and **Use offer for first**, plus the retained map-default
choice (original on the 32 imported campaign missions, offers elsewhere). The
choice persists and applies to new levels; Continue keeps the saved agreement.
The panel links directly to tournament setup, which links back to it. Tournament
opening preferences are independent of human-match preferences, and each run
freezes its own opening and no-deal policy. Imported map data stays unchanged.
Human/CPU factions remain Union/Xenon; only initiative changes. A round ends
after both factions act, including Xenon-first matches. Existing timeout
victory for Xenon is stated during negotiation and remains unchanged.

Cancelling setup preserves the previous saved match. Negotiation drafts are
not persisted. Started matches save the chosen package, exact placements and
first-player identity, both switch points and the question history; Continue
does not renegotiate, while playing a level again does. Older saved agreements
remain valid.
Compensated results use separate level keys and never award original campaign
completion stars. Match history and the game toolbar identify the accepted
compensation. Balance needs playtesting across maps, player skill and opening
choices; the feature implements negotiation, not an established 50/50 outcome.

Tournament protocol 2026-09-25.2 uses each bot's actual move selector in bounded
hypothetical openings, with common independent simulation seeds and the existing
numerical position evaluator. The bot models both hypothetical armies using its
own policy. Scores estimate preferences, not winning odds. Normal opening remains
the default. Unplaceable offers/no-deal skip ratings by default, with an explicit
normal fallback option. Normal repeats swap factions in two games; offer repeats
use four games covering both faction assignments and both equal-offer tie
recipients. Private commitments remove response-order advantage; unequal bids
still decide roles. Seeds are shared within the mirrored set and change by repeat.
Saved results include policies, role scores, both switch points, questions, bonus
and first player. CSV and archives identify effective/requested openings. Prior
normal runs from 2026-09-25.1 can resume with unchanged rules/move selection;
prior offer runs remain reviewable but cannot mix the updated bidding policies.

The same follow-up requires durable long runs, visible progress, intelligible
controls, map/pair history, efficient replay and a fullscreen board for review.
Implemented: Randomize seed, help for repeats/rounds/workers/K, immediate focus
on live worker cards, progress and rough ETA, saved-through status, local Elo and
replay persistence. Completed out-of-order games are saved before ordered atomic
rating updates; reload offers Resume without discarding those records. Unfinished
games restart from their fixed seeds. Persistent-storage requests and archive
exports support longer experiments. Ratings stay per run. Indexed history filters
avoid loading replay payloads, and old browser records migrate intact. Replays
fill the window, optionally enter true fullscreen, support normal zoom/Ctrl-drag
pan, turn jumps and cached seeking every 128 commands. Old replays are indexed
once on opening. See [AI_OPPONENTS.md](AI_OPPONENTS.md#browser-tournaments) for
precise search budgets, persistence boundaries, exports and validation.

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
The user reaffirmed on 2026-09-26 that a missing-star mouseover is a rendering
bug to investigate within this design, not authorization to add separate badges
or numeric experience labels. Preserve the existing compact roster.
The reported case is not yet reproduced: browser checks show the existing
stars in both live factory mouseovers across owners and visual styles. The
exact affected view/map is still needed; the defect is not recorded as fixed.


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
inside that popup. The side-wide End Turn button never changes into a confirmation.
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
red targets directly, with no per-unit **End** choice. Without a legal shot, end the unit automatically and
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
earlier permission to reselect a moved unit and fire later. Implicit
deselection remains part of the move's Undo step. Saves preserve the finished
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

Keep unit controls in the fixed left panel, clear of attack/destination hexes.
After a committed move there is no Cancel confirmation or per-unit **End** button.
Escape clears selection and ends a started activation. Right-click backs out of the active menu, closes the
End Turn confirmation, or undoes a just-committed move. With no selection it
undoes the last noncombat action. This also works over popup controls, without
opening the browser context menu. Unload remains available for eligible passengers.
Results close automatically after the casualty animation and lock input while
resolving.

### Undo and redo history (2026-09-23)

**Undo** reverses noncombat actions across units, with no fixed step limit.
Movement (including implicit completion), boarding, unloading, deployment, storage,
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

## Grok 4.7 15 tactical gap-filling units study (2026-09-23)

Review of the experimental outline item "design 15 gap-filling units" recorded in
`PROJECT_GUIDE.md` and `tools/design-space/README.md`. While the prior mathematical
study used an unconstrained maximin distance search that yielded degenerate boundary
extremes (e.g., 1-move wheeled units pinned to roads, 0-attack 80-defense tanks, and
defense-cap overflow), this study establishes an alternative 15-unit tactical set
grounded in operational wargame doctrine, combined-arms roles, and tempo tradeoffs:

- **Directory:** `grok4.7/`
- **Data & engine compatibility:** `grok4.7/custom-units.json` adheres to `mergeUnitTypes`
  schema without duplicate stock statlines, verified by `grok4.7/validate.js`.
- **Art assets:** 30 native 32×32 pixel sprites (15 Union, 15 Xenon) with upper-left lighting
  and centered silhouettes generated via `grok4.7/icons.js` into `grok4.7/icons/` and
  `grok4.7/sheet.png`.
- **Visual interface:** `grok4.7/gallery.html` and `grok4.7/index.html` deliver a high-contrast
  fluid overview (100% pure white `#ffffff` text on dark surfaces, prominent bold tabular stats,
  no gray text, fluid fraction-based card grid, and class filtering).
- **Roster scope:** 15 functional roles across 7 classes:
  1. `AEGIS` (Aegis AA-60, antiair, move 3 treads, 20/70, def 60, rngA 2 indirect AA anchor)
  2. `GADFLY` (Gadfly AD-31, antiair, move 8 wheels, 10/55, def 15, road AA interceptor)
  3. `ARGUS` (Argus AD-77, antiair, move 0, 0/60, def 30, rngA 4 deployable air umbrella)
  4. `BREACHER` (Breacher SG-9, artillery, move 4 treads, 55/0, def 35, rngG 3 move-and-fire assault gun)
  5. `LONGBOW` (Longbow AT-22, artillery, move 5 treads, 75/0, def 25, rngG 2 stand-off tank destroyer)
  6. `REDOUBT` (Redoubt FP-80, artillery, move 0, 60/0, def 70, rngG 2 deployable armored pillbox)
  7. `JAVELIN` (Javelin GX-90, infantry, move 3 foot, 85/0, def 10, foot anti-armor hit-and-run)
  8. `PAVISE` (Pavise GX-55, infantry, move 2 foot, 20/10, def 30, heavy shield capturer)
  9. `TRENCH` (Trench GX-41, infantry, move 2 foot, 35/0, def 10, rngG 3 mortar capturer)
  10. `DUSTER` (Duster AC-12, tank, move 7 wheels, 45/30, def 20, wheeled combat gun car)
  11. `WHIPPET` (Whippet MB-7, buggy, move 10 wheels, 20/20, def 10, high-speed recon scout)
  12. `CONDOR` (Condor CA-9, transport, move 7 air, 20/20, def 30, cargo 1 armed airlift)
  13. `TICK` (Tick M-3, mine, move 3 treads, 0/0, def 70, mobile obstacle and ZOC drone)
  14. `HAULER` (Hauler NC-7, transport, move 5 wheels, 30/20, def 30, cargo 1 foot combat transport)
  15. `SLOGGER` (Slogger HMB-9, tank, move 3 treads, 80/0, def 60, waste-capable breakthrough tank)

## Gemini 3.8 15 tactical gap-filling units study (2026-09-23)

Dedicated proposal and review pack designed by Gemini 3.8 reviewing the project outline
item "design 15 gap-filling units". The design addresses operational dilemmas
and combined-arms roles missing from the stock 23-unit roster without degenerating into
boundary-sampling statistical extremes:

- **Directory:** `gemini38/`
- **Data & engine compatibility:** `gemini38/custom-units.json` adheres to the `mergeUnitTypes`
  schema, loaded without errors and verified by `gemini38/validate.js` (valid range bands,
  Pelican loading compatibility, and zero duplicate statlines).
- **Art assets:** 30 native 32×32 pixel art sprites (15 Union right-facing, 15 Xenon left-facing)
  authored with upper-left illumination and centered silhouettes via `gemini38/icons.js` into
  `gemini38/icons/` and a 3×5 contact sheet at `gemini38/sheet.png`.
- **Visual interface:** `gemini38/gallery.html` and `gemini38/index.html` deliver a high-contrast
  fluid overview (100% pure white `#ffffff` text on dark surfaces, prominent bold tabular stats,
  no gray text, fluid fraction-based card grid, and class filtering).
- **Roster scope:** 15 functional roles across 7 classes:
  1. `PHALANX` (Phalanx AA-50, antiair, move 5 treads, 35/75, def 50, armored frontline flak tank)
  2. `SENTINEL` (Sentinel AD-80, antiair, move 0 treads, 0/80, def 25, rngA 5 static SAM battery)
  3. `DART` (Dart MB-6, buggy, move 7 treads, 25/50, def 20, rngA 2 hit-and-run anti-air buggy)
  4. `STORM` (Storm SG-50, artillery, move 4 treads, 50/0, def 35, rngG 3 move-and-fire assault gun)
  5. `CYCLOPS` (Cyclops MR-75, artillery, move 3 treads, 75/0, def 25, rngG 5 heavy siege rocket launcher)
  6. `BUNKER` (Bunker FB-70, artillery, move 0 treads, 65/30, def 70, deployable direct-fire cupola)
  7. `RANGER` (Ranger GX-35, infantry, move 4 foot, 35/25, def 16, mountain commando skirmisher)
  8. `HOPLITE` (Hoplite GX-25, infantry, move 2 foot, 25/15, def 26, heavy armored capturer)
  9. `MORTAR` (Mortar GX-40, infantry, move 3 foot, 40/0, def 12, rngG 3 mountain mortar squad)
  10. `CHEETAH` (Cheetah AC-8, tank, move 8 wheels, 50/0, def 30, wheeled cavalry tank)
  11. `RHINO` (Rhino AT-85, tank, move 3 treads, 85/0, def 45, heavy casemate tank destroyer)
  12. `MAMMOTH` (Mammoth HMB-5, tank, move 3 treads, 80/0, def 65, waste-capable breakthrough tank)
  13. `BUFFALO` (Buffalo NC-5, transport, move 5 treads, 25/15, def 35, cargo 1 armored combat APC)
  14. `CORSAIR` (Corsair AX-80, air, move 8 air, 80/30, def 40, heavy anti-tank attack gunship)
  15. `TALON` (Talon MB-9, buggy, move 9 wheels, 35/20, def 15, high-speed wheeled recon buggy)

## Claude Opus 5.5 gap-filling units study (2026-09-23)

Proposal pack in `opus55/` for the outline item "design 15 gap-filling units",
produced by a Claude Opus 5.5 session. It does not change the playable roster,
maps, renderer or AI; nothing outside that folder is generated.

- **Design rule:** each unit fills one empty cell of the stock rule matrix (chassis,
  firing band, turn rule, carrier role) with at most one special rule, using only
  engine fields that exist today. Each gap is a test over `js/data-units.js`; the
  build fails if any stock unit contradicts it.
- **Units:** foot units for ground that tracks cannot enter (Yeti walker, Meerkat
  anti-air team, Howler mortar team, Gecko raiders); carriers (Wombat armored
  carrier, Stork assault helicopter, Camel heavy transporter); air rules (Wasp attack
  helicopter, Vulture stand-off drone, Shrike missile interceptor); ground rule
  combinations (Mantis mobile SAM, Snapper pillbox, Pike tank destroyer, Hound
  armored car, Squid rocket truck).
- **Source and outputs:** `units.js` holds the prose, definitions, gap tests and
  exchange claims; `build.js` writes the icons, sheets, `custom-units.json`,
  `analysis.json`, `README.md` and the self-contained `index.html`, and refuses to
  write them if an exchange claim, prose comparison, gap test or the dominance screen
  fails. `verify.js` also checks the engine rules each unit relies on, classic and
  apex CPU games with all fifteen, the review's statements about
  `tools/design-space`, and that the files on disk match a fresh build.
- **Open items if a unit enters play:** in-game art stays the stock placeholder named
  by each unit's `sprite` field; `threatenedBase` in `js/ai.js` reacts only to a
  Pelican, so a Stork airlift toward a base does not trigger base defense; the CPU
  can deploy a Snapper where it blocks one of its own factory exits; apex turn time
  grows with unit count (one apex turn on the 42-unit verify map took 143 s, and
  126 s with stock units of the same chassis, measured once).


## Three terrain campaigns (2026-09-23)

The user requested three new campaigns of sixteen levels each around **open sea
of land**, **dense center / spacious outskirts**, and **difficult terrain**.
The focus is physical map design and tactical situations, with permission for
small forces, limited unit types and apparently strong but awkward positions.
Hunters, Falcons and Eagles should generally be avoided. Implemented as **Open
Horizons**, **The Knotted Heart**, and **Broken Ground**, with all three aircraft
excluded entirely. Pelicans and all other stock types are used across the set.

The user's follow-up explicitly requires clear AI-made attribution. All three
campaign display names are prefixed **AI-made:** in the library, navigation and
map selector; their collection category is **AI-made campaign**, and every
individual level credits **AI-made by Codex**, including downloadable JSON.
Campaign IDs, map names, progress keys and gameplay data remain unchanged.

These are 48 new missions in three separate menu collections, with their own
01–16 numbering, profile result keys, map-jump groups, saved-match identity and
Next mission progression. Mission 16 ends its own campaign. Existing map packs,
numbering and source data are preserved. Each mission starts with fresh forces;
there is no army carryover or new campaign economy.

Implementation choices: boards range from 24×16 to 42×28, terrain and stock
placements use half-turn symmetry, and some starting armies are deliberately
asymmetric. Factories carry focused four-unit teams; immobile reserves follow
a compatible carrier. The old fjord-specific factory-count, mouth-count and
mountain-thickness constraints do not apply to these newly requested physical
families. Routes are checked for the units that actually use them, and factories
have genuine legal deployment terrain. The normal movement, capture, elimination
and turn-limit rules remain in force. The existing opening selector still applies;
Original opening preserves the exact authored roster puzzles, while compensation
offers may add units. The briefs describe tactical problems, not hidden objectives.

[Campaign catalog and import bundles](ENVIRONMENT_CAMPAIGNS.md) record every
mission. The deterministic builder, physical-route tests, menu/save/progression
tests and all-map CPU self-play cover integration and execution. These are new
scenarios whose difficulty and multiplayer balance still need human playtesting.
