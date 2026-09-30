# Nectaris — JavaScript hex-tactics remake

A from-scratch, dependency-free JavaScript remake of the classic lunar
hex-based tactics game (TG-16 / PC Engine, 1989: *Nectaris* in Japan,
*Military Madness* in the US). Faithful to the mechanics — ZOC, the recovered
combat calculation with support and surround fire, experience, terrain
defense, factories with stored units, transports — while dropping the pure
hardware limitations: the whole map is visible at once, with free zoom and
pan, at any map size. It includes 119 maps: 32 official campaign missions,
24 extra-pack maps, 15 AI-made scenarios and 48 maps in three original terrain
campaigns. It also includes an original procedural chiptune score and a level
editor with URL sharing.

## What's what

| File | Purpose |
|---|---|
| [PROJECT_GUIDE.md](PROJECT_GUIDE.md) | Guidance and decision index: current requirements, pending work, experiments and historical evidence |
| [agents.md](agents.md) | Repository working rules and persistent constraints (entry point: `AGENTS.md`) |
| `index.html` | The game: mission menu, campaign, custom levels, hotseat |
| `editor.html` | Level editor: terrain, units, factories, custom unit types |
| `PRODUCT.md` | Settled UI/product decisions |
| `MECHANICS.md` | Full rules reconstruction, with sources |
| [ART_DIRECTION.md](ART_DIRECTION.md) | Current visual theme, art specification and implementation status |
| [tools/design-space/README.md](tools/design-space/README.md) | Fifteen experimental ground-unit concepts; separate from the production roster |
| `MANUAL_AUDIT.md` | Full original-manual review, implementation coverage and remaining gaps |
| `inspiration/nectaris-original/README.md` | Manifest for local, gitignored visual references |
| `inspiration/nectaris-original/index.html` | Local full-page viewer for those captures |
| `js/hex.js` | Hex math (flat-top, odd-q offset, cube internals) |
| `js/data-terrain.js` | Terrain data: additive defense, per-chassis movement costs |
| `js/data-units.js` | The 23-unit roster (documented original stats) |
| `js/combat.js` | Recovered per-machine damage and squad-casualty calculation |
| `js/engine.js` | Game state, movement/ZOC, actions, victory |
| `js/ai.js` | Computer opponent |
| [AI_OPPONENTS.md](AI_OPPONENTS.md) | Six opponent algorithms, custom capability support, tournament instructions and strength limits |
| [BOTS.md](BOTS.md) | Bot identity (Classic vs the original CPU, other versions), the Marshal bot and its measurements, and the design-only AlphaGo-style plan |
| `tournaments.html` | Parallel self-play, per-run Elo, saved games and replay viewer |
| `thanks.html` | Thanks, in English and Japanese, to everyone who made Nectaris and the fans who documented it |
| [NECTARIS_CREDITS.md](NECTARIS_CREDITS.md) | Research behind the thanks page: every documented person per version, public channels, letter drafts |
| `tools/build-thanks-images.py` | Rebuilds the thanks page's embedded Wikimedia Commons pictures and their credits |
| `tools/ai-research/run.cjs` | Multi-core disk tournaments, exact game archives and resumable ratings |
| `js/data-maps.js` / `js/data-advanced-maps.js` | Official normal and advanced campaigns, 16 missions each, from Hudson's 1997 PC Engine remake |
| `js/data-expansion-maps.js` | 12-map Lunar Frontiers online expansion |
| `js/data-basenectaris-maps.js` | 12-map Base Nectaris terrain pack (bilingual briefings) |
| `js/data-ai-maps.js` | Fifteen original AI-made maps, from branching fjords to bridge crossings, caldera circuits and siege chambers |
| `js/data-environment-campaigns.js` | Three original 16-map campaigns: Open Horizons, The Knotted Heart and Broken Ground |
| [ENVIRONMENT_CAMPAIGNS.md](ENVIRONMENT_CAMPAIGNS.md) | All 48 missions, tactical briefs, sizes, forces and import bundles |
| `tools/environment-campaign-specs.js` / `tools/build-environment-campaigns.js` | Authored mission catalog and reproducible terrain-campaign builder |
| `tools/build-ai-fjords.js` | Deterministic builder for the AI-made maps and importable JSON in `levels/` |
| `tools/nmd-to-level.js` | Converts a Windows-edition `.nmd` map file to a level |
| `js/render.js` | Canvas renderer with selectable Remake/Legacy art |
| `js/data-unit-art.js` | Generated native 32×32 Remake art for all 23 unit types |
| `js/unit-icon-sets.js` | Validated art-set registry and saved selection |
| `js/data-unit-art-legacy.js` | Imported Legacy unit-chart frames |
| `js/legacy-terrain.js` | Original-style pixel terrain and connected tile variants |
| `art/units/pixel-art.js` | Editable indexed unit art; export with `node tools/build-unit-art.js` |
| `js/music.js` | Original synthesized military chiptune (Web Audio; no audio files) |
| `js/sfx.js`, `js/sfx-bank-*.js` | Selectable original synthesized soundscapes with an off-by-default toggle (Web Audio; no audio files) |
| `js/ui.js`, `js/main.js` | Game UI and boot/menu |
| `js/profiles.js` | Local player profiles, unfinished-match saves, results and play history |
| `js/map-thumbnail.js` | Pictures of each level's starting position for the mission menu, drawn by the match renderer and shrunk |
| `js/editor.js` | Editor logic |
| `test/run-tests.js` | Node test suite (`node test/run-tests.js`) |
| `tools/unit-sheet.html` | Native roster review: Union, Xenon, attacking, spent, contrast and silhouette checks |
| `tools/art-pilot.html` | Native map fixture with a selector for all 23 unit types |
| `serve.sh` | Local server on the fixed development port |

## Three new AI-made terrain campaigns

**Open Horizons** explores broad plains around mountain islands. **The Knotted
Heart** pairs a dense center with spacious outskirts. **Broken Ground** makes
hills, wasteland and valleys create different routes for different units.
Each is explicitly labeled **AI-made** in the menu and has 16 distinct maps,
independent progress and a Next mission button.
Tiny forces, restricted rosters and awkward heavy-armor positions are mixed
with larger battles. No Hunters, Falcons or Eagles appear; Pelicans remain.

Keep **Mode: Normal** to play the exact authored roster puzzles;
compensation offers can add extra units. Read the [mission catalog](ENVIRONMENT_CAMPAIGNS.md)
or use each map's **?** briefing in the game.

## Run locally

```bash
./serve.sh
```

Open <http://nectaris.localhost>. The machine's local Caddy proxy routes that
name to <http://127.0.0.1:8001> and lists it on the local dashboard. Port
**8001** is canonical; if another process has it, the server exits with the
bind error rather than selecting a different port.

## Deployment

The menu's **AI opponent** setting selects Classic, Tactical, Sequence, Simulation
or Apex. A new match defaults to Classic unless another choice was saved; the opponent stays fixed for the whole match. The **Bot tournament** tab opens the self-play lab with
board, game-count, round-cap and worker controls, Elo tables and saved replays.
See [AI_OPPONENTS.md](AI_OPPONENTS.md) for algorithms and large disk runs.
Serve the lab over HTTP on localhost or HTTPS; it uses Web Workers, IndexedDB
and Web Locks. Ordinary match/profile saves remain in localStorage.

Hosted at https://nectaris-remake.fuseki.net/ (released automatically from
`main` after Tests pass; see PRODUCT "Fuseki hosting").

Static files, no build step, no dependencies. Copy the folder to any web
server (or open `index.html` from disk — no modules, plain scripts). Ordinary
game state (campaign progress, custom levels, custom units) lives in
`localStorage`.

## Player profiles and saved games

Your first visit starts as **Wilson**; nothing asks for a name. Click **You are
logged in as Wilson** in the upper-right corner to **Rename**, add a **New
profile** or **Switch to** another one. Each has its own campaign stars,
results, play history and unfinished matches.

Each level is a tile: a picture of its map above one line with its number and
name, **Resume turn N** when you have an unfinished match there, how many times
you have started it, and your wins, losses and draws. The small green mark on the
picture's corner plays the level as Xenon. Every level can have an unfinished match at the same time (separately
as Union, as Xenon, in each Mode and in hotseat): leave one with **Save &
Menu**, open another, and come back to either from its entry or the
**Continue** line. Opening a level only to look at it leaves no save and no
history entry; your first move starts the match. **Restart** in the match panel
begins the level again from turn 1 and records a match under way as abandoned.

The **History** tab lists every match you started, resumed, left, abandoned,
won, lost or drew, newest first, with its level, side and turn and how it ended.

A match is won by capturing the enemy base or eliminating its forces. It is
drawn after 100 turns in which no unit loses a machine and no factory is
captured, or when turn 5000 ends; the match panel shows **Draw in N turns**,
counting the current turn.

Progress saves automatically after actions and survives closing and reopening
the page. An interrupted AI turn resumes from its start. Completed moves and
their undo history survive a save or reload.
Hotseat results record the winning faction separately from solo wins/losses.

Profiles stay in this browser at the same address—there is no cloud sync.
Clearing site data removes them. Storage problems display an error instead of
claiming progress is saved.

## Choosing the opening

The **Mode** dropdown under the title offers **Normal** (the default: your
side moves first, so Xenon opens when you play **as Xenon**; hotseat starts
with Union; original armies) and **Offer for first** (guided second-player
compensation). Choose one, then click a level. Your choice persists; resuming
an unfinished match keeps its saved opening.

In the guided setup, inspect the battlefield and fixed numbered bonus sites,
then answer **“Would you accept X to go second?”** You can select any earlier
package in the current menu. **Yes** tests a smaller menu; **No** means none of
that menu’s packages is enough, so it tries a larger one. Normally this finds
your switch point in at most six questions. **Change previous answer** lets you
correct an answer. Mixed packages are alternatives, not universal unit prices.

The **AI opponent** dropdown picks the bot for both moves and opening offers. Both players
answer privately. Solo evaluates independently in the background; hotseat
uses a pass-the-device screen. Once both switch points are known, the lower one
sets the compensation and its accepting player goes second. Matching switch
points use a random tie-break. Review both boundaries, the first player and the
exact bonus, then **Start match**; you can restart the questions before playing.
Bonuses are full strength, zero experience and ready on their owner’s first turn.
Solo keeps the side you chose; the draw rules apply as in any match.

Up to 32 packages range from no bonus to four Polars plus two Charlies. Numbered
hexes and coordinates show exactly where they arrive near each base. **Union
base / Xenon base**, zoom, Ctrl+left-drag and hover inspection help you assess
them. Small sites shorten the list; unsuitable maps (including AIRLIFT) explain
why offers are unavailable and allow normal play. If neither player accepts any
package, retry or explicitly use normal play. Cancelling/reloading negotiation
preserves your previous saved match. Started agreements and turn order are saved;
compensated results have separate records. The bot tries both roles using its own playing algorithm; its bounded analysis
estimates preferences rather than proven equal winning chances.

The **Bot tournament** tab next to the title opens the tournament setup.
Choose normal opening or offers there too. Bots negotiate automatically. You can
skip unavailable/no-deal games (no rating change), or explicitly allow a normal
opening fallback. Each tournament stores its settings, and results/replays identify
the actual opening. Normal repeats use two swapped-faction games; offers use four,
mirroring equal-offer tie breaks too. Start shows live progress and Elo. Every
finished game saves in this browser; reload and Resume keep results and ratings,
restarting unfinished games. Filter history by map/pairing and Watch on a board
that fills the window, with turn jumps, fast seeking, zoom and pan. Use archive
export for a separate backup. See [tournament usage](AI_OPPONENTS.md#browser-tournaments).

Map authors can supply `balanceSpawns`, an array containing Union's and Xenon's
ordered `{col, row}` arrays, using zero-based coordinates. Supply up to six
distinct empty, reachable ground hexes per side, within five hexes of its owned
base and closer to it than the enemy base, away from enemy units and buildings.
Otherwise setup chooses deterministic legal sites and mirrors them on supported
symmetric layouts. No campaign source deployment or inventory is modified.

## Controls

The campaign list uses the same layout for campaigns, expansion packs and
custom levels: the Normal and Advanced campaigns and Base Nectaris first, then
the AI-made campaigns, AI-made maps, Lunar Frontiers and custom levels.
Collection links jump between groups; each header shows your progress. Each dense entry keeps its number/name, dimensions, Union/Xenon/
Neutral totals and any result on one line. Totals align vertically beneath their
column headings. Wide screens show three levels per row, reducing to two or one
on narrower screens. Lists scroll horizontally when needed instead of wrapping. **Click the entry to play**; the separate `?`
opens details. Returning to the library keeps your scroll position.

Hover or focus the small **?** beside a level or collection for its briefing,
design notes, credits and sources. Only entries with such notes have one; the
original Normal and Advanced campaigns have none. Click/tap **?** toggles it. Moving outside the
button and its popup closes it immediately, including after clicking. The popup
touches its button so its links remain reachable. Clicking outside or pressing Escape
also closes it. Moving across an entry does not open anything. Panels close when
the page or list scrolls or resizes.

- Hovering an attackable enemy opens the combat board over the map: the ZOC
  ring and support with their numbers, each side's attack and defense, and its
  projected losses in its faction's colour. There is no separate Details panel;
  the map hover card carries unit and building details, including the terrain
  under a unit.
- **Board: Auto / Normal / Sideways** rotates the view by 90° when useful.
  Auto picks the orientation that fits the board largest. Units and labels stay
  upright; clicking, wheel zoom and Ctrl+left-drag follow the displayed board.
  **Fit board (F)**, the large button above the view settings, or the F key
  restores the whole board after zooming or panning.
- Controls, unit actions, reports and replay metadata stay in a fixed left panel.
  That panel scrolls independently; changing details never resizes the board.
- Everywhere a unit appears, it is shown as its icon with its experience
  stars directly to the right, in a box the icon's size.
- Hover a unit for a compact stats card beside its hex. The card heading
  shows the icon with its stars and the name, above attack, defense and Shift;
  a damaged squad's remaining count sits on the icon's corner, as on the map.
  Factory and cargo lists show each unit on one line: icon with stars, name,
  and N/8 when damaged. Unit names use
  short names such as Pelican, without model numbers, and always have an icon.
  The card stays clear
  of the unit, flips at map edges, and lets clicks pass through. It appears and
  disappears immediately, with one compact row for attack, defense and Shift
  and a faction-colored bold name. Ranks are never numeric. Damaged units show only their remaining
  count on the icon, without a Strength label. Unsupported
  air attack, default adjacent ranges and zero experience bonuses are omitted;
  longer ranges sit under their attack value, with mixed ground/air bands explicit.
  Terrain defense, earned damage bonuses and damaged strength remain visible. A unit
  standing on a base or factory also lists the building's stored units. Move away
  or press Esc to dismiss it.
- Click a unit to immediately show blue legal moves, boardable transports,
  firing-area borders and red attack targets. Firing borders trace the outer
  limit and any inner blind spot, without outlining each covered hex.
  Click a red enemy to fire from the current hex.
  Unavailable commands are disabled and explained. Hadrian, Octopus and Hawkeye
  may shift or attack, never both in one turn. Atlas shows firing targets
  immediately and cannot shift once placed. Trigger has neither action;
  Pelican cannot attack. Rabbit and Lynx may use remaining Shift points after
  their one attack.
- Click an enemy to see its next-turn movement in orange plus firing range from
  its current hex: solid red for ground fire, dashed violet for air fire.
  Both stay visible where they overlap, with a compact legend on the map.
- On selection and after a Shift destination, attackable enemies turn red. Hover a target for
  its combat board (both sides' calculations and projected losses)
  based on 100,000 independent simulations. The forecast never uses the match's
  actual random state. Click the red target to attack; there is no automatic
  approach to a distant enemy.
- After a move, attack a red target; there is no per-unit **End** choice. If no attack is available,
  the unit ends immediately and you can choose the next unit. Switching to another
  unit or clearing selection ends a started activation: you cannot return later
  that turn to attack or use a buggy's remaining retreat. Selecting a unit without
  acting does not spend its turn. Controls stay clear
  of target hexes. A loaded carrier automatically shows orange legal unloading
  hexes after moving. Click orange to disembark; right-click, Esc or Cancel
  dismisses the choices while keeping the carrier's move. Reselect the carrier
  to reopen them. Before moving, its orange Unload control offers unloading first.
- The paired **Undo / Redo** buttons in the left panel reverse and restore noncombat actions in
  order: movement, factory deployment/capture/storage, boarding and unloading.
  A move plus implicit completion is one undo step. Both histories survive saving and reopening.
  Battles, turn changes and match completion clear it; combat can never be undone
  or replayed. A new action clears redo. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redoes.
- Right-click backs out of menus or undoes the last move when nothing is selected
  or a just-moved unit is aiming. Esc clears selection and ends a started activation. Mouse wheel: zoom.
  **Ctrl+left-drag** pans at any zoom level, even during movement selection;
  ordinary clicks and drags never move the map.
  `E`: end turn.
  If a unit can still move, attack, unload or deploy, the first End Turn warns;
  choose End turn anyway or Keep playing inside the confirmation popup. It lists
  only units with legal actions on the current board, with deployment counted separately.
- Unit chrome shows remaining strength only when damaged (1–7), with a 1.6×
  larger corner number. Full strength (8) is omitted — see `PRODUCT.md`.
- Hover a base or factory to inspect its contents. Neutral, enemy, empty and
  fully blocked buildings do not open a click-to-inspect popup. Capture with
  infantry to gain control of reserves. Clicking an owned building opens the
  deployment picker only when at least one reserve has a legal destination.
  It uses the mouseover's two-column roster; click a ready unit's tile to deploy,
  then choose a highlighted destination among the six surrounding
  hexes: an unoccupied deployable terrain hex, or an adjacent friendly Mule or
  Pelican with an empty cargo slot. The remaining roster reopens after deployment
  only while another reserve has a legal exit or carrier; otherwise it closes;
  Back to factory and Cancel stay in the left action panel. Capturing infantry goes inside the factory
  and leaves the map; it can deploy again from the next turn. Stop a damaged
  unit on your own factory to store and repair it under the same delay.
  Factories accept aircraft and loaded transports too. Only infantry may stop
  on a neutral or enemy factory; other units, aircraft included, can only pass
  over it. Bases permit parking
  and provide defense, without repair. Transport unloading is limited to
  plains, roads, bridges and direct storage in an owned factory. Each transport
  permits one load or unload per turn. Moving does not consume
  that allowance: cargo already aboard can unload after moving. Loaded passengers
  appear with their icons in the transport's hover card. Unavailable Unload buttons stay visible in
  the unit's action strip, with the reason on hover.
- **Watch AI** (checked by default) shows each Xenon selection, then the move or attack. A
  dedicated battle view, used for your own attacks too, shows opposing
  formations with Union on the left and Xenon on the right, each on its own
  terrain (one continuous ground when adjacent). Under them, each side's attack
  and defense unit totals count up from their parts, laid out the same for both
  sides; a crop of the real board between the two loss charts lights where
  support, terrain and the surround ring come from as they are counted, and
  each chart shows that side's possible losses (0 to 8) and the actual result.
  The popup is sized to its contents over the dimmed board. Ready, Fighting and
  Result mark the approach, combat and summary. Each side's unit icon in
  the battle header is enlarged, with its stars beside it at the same scale; newly
  earned stars fade in, glow brightly, then
  settle to the normal colour. Formation machines have no stars. **Pause / Resume** freezes the battle and its automatic advance.
  Replay **Pause on battle screens** starts on; click anywhere on the paused
  battle to continue. **Skip battle scenes** starts off and bypasses the scenes,
  automatic pauses and holds. Show map / Show battle switches views without
  changing the board; in a match it is all the left panel shows during a battle.
  The replay page's panel also writes out each result, its roll and a running
  tally. Units traverse each
  hex of their legal movement route in live play and replays. Turn Watch AI off for immediate
  AI turns. Unchecking **Move animation** separately places moving units straight on
  their destination while Watch AI still shows each AI step. Opponent actions preserve your chosen camera position and zoom.
  Replay **Follow action** starts off and only follows when you enable it.
- The factory panel shows each stored unit on one line: map icon with stars,
  name, damage when present, and a full-row deployment button.
- Experience appears as the original's star art beside the unit icon: up to 3
  small stars down the left of the star box, 2 in a lower middle column and 2
  in the right column. Level 8 replaces them with one large **GENERAL** star.
  Selecting a unit shows the exact damage bonus.
- Union silhouettes face right and Xenon silhouettes face left, so opposing
  units visibly confront one another.
- Units that have completed their activation this turn appear fully greyscale
  at unchanged opacity; units with movement or an action remaining stay at
  full color.
- While an attack is previewed or resolving, the attacking unit is drawn in
  deep red and the defender gets a white ring, whichever side is attacking.
- The hover inspector shows BASE → SUPPORT → TERRAIN → FINAL attack and defense
  for both sides, plus surround, experience, damage arithmetic and outcome rates.
- Every campaign and expansion map is available immediately. Use the map
  selector in the left panel to move directly between them.
- Mission choices list Union, Xenon and Neutral squad totals in that order,
  including fielded units and the reserves stored under each side's ownership.
  Labels and numbers use the same size, saturated faction colors and strong contrast.
- **Music** starts an original square-wave/triangle/noise military
  chiptune; its check mark shows when it plays. Browsers require the button press before audio may begin.
- **Sound** (off by default) enables original synthesized sound effects.
  **Sound by** chooses a creator's set and remembers the choice, including
  Grok 4.7 — Field calls and GPT-5.6 Sol — Selenographic Telemetry.
  Details in `PRODUCT.md` § Sound effects.

## Custom levels

The **AI-made** category contains fifteen original scenarios:

| Level | Size | Factories | Starting forces per side |
|---|---|---|---|
| 1 · Twisted Fjords | 65×49 | 15 × 12 reserves | 5 tanks, 3 infantry |
| 2 · Shattered Fjords | 65×49 | 15 × 12 reserves | 5 tanks, 3 infantry |
| 3 · Fractured Fjords | 40×40 | 15 × 12 reserves | 5 tanks, 3 infantry |
| 4 · Honeycomb Fjords | 28×28 | 8 × 10 reserves | 4 tanks, 3 infantry |
| 5 · Arsenal Fjords | 28×28 | 9 × 1–12 reserves (51 total) | 4 tanks, 3 infantry |
| 6 · Needle Fjords | 34×34 | 9 × 4–8 reserves (50 total) | 1 Charlie, 1 Panther, 1 Rabbit |
| 7 · Labyrinth Fjords | 30×30 | 21 × 4–8 reserves (123 total) | Charlie, Panther, Rabbit, Bison, Polar, Hadrian |
| 8 · Mirror Fjords | 31×30 | 21 × 4–8 reserves (118 total) | Charlie, Panther, Rabbit, Bison, Polar, Hadrian |
| 9 · Laced Fjords | 31×30 | 21 × 4–8 reserves (127 total) | Charlie, Panther, Rabbit, Bison, Polar, Hadrian |
| 10 · Turning Fjords | 42×20 | 24 × 4–8 reserves (138 total) | Charlie, Panther, Rabbit, Slagger, Titan, Octopus |
| 11 · Switchback Fjords | 42×20 | 12 × 4–8 reserves (64 total) | Charlie, Panther, Rabbit, Lenet, Slagger, Hadrian |
| 12 · Delta Crossings | 42×20 | 24 × 4–8 reserves (128 total) | Charlie, Panther, Rabbit, Polar, Lynx, Pelican |
| 13 · Caldera Circuit | 42×20 | 24 × 4–8 reserves (128 total) | Charlie, Panther, Rabbit, Grizzly, Octopus, Mule |
| 14 · Faultline Steps | 42×20 | 12 × 4–8 reserves (64 total) | Charlie, Panther, Rabbit, Giant, Titan, Seeker |
| 15 · Pocket Siege | 42×20 | 12 × 4–8 reserves (64 total) | Charlie, Panther, Rabbit, Polar, Hadrian, Pelican |

All factories start neutral. Parts 1–4 use one road exit surrounded by five
mountain hexes. Part 1 is a winding tree; Parts 2–3 add angular passages, two-hex
narrows, varied terminal approaches and connections between branches. Part 4
fills the board with an interconnected passage network around small mountain
pockets (at most 19 mountain hexes each). Plains, roads and hills fill the
fjords; Parts 2–5 also include wasteland. Part 5 has exactly three factories
with each of one, two and three road exits. Its smaller inventories are authored
teams (infantry caches, armor, patrols, escorted artillery, engineers and mixed
arsenals), with no more than five types or two artillery units in a factory.
Every Atlas or mine immediately follows its own Mule or Pelican in the roster:
deploy the carrier first, then load the immobile unit directly aboard.
Parts 6–7 return to narrow branching fjords: factory exits all face down
one approach, and mountain ridges separate the two- and three-hex channels.
Open terrain occupies about 38% of each map, with only two small clearings in
Part 6 and three in Part 7. Part 7 fits its 21 factories into a compact 30×30
network using terminal branches and short alcoves in the channel walls.
Part 6 starts each side with a Charlie, Panther motorcycle infantry and Rabbit
missile buggy. Part 7 adds one Bison, one Polar and one Hadrian to both sides in
matching formations. Their neutral factories hold
4–8 units with **no infantry or capturing units** among the reserves. Exit
counts remain evenly split: three factories per exit count in Part 6, seven
per exit count in Part 7. Immobile units retain their preceding carriers.
Part 8 mirrors every terrain hex, factory inventory and starting unit across
the vertical center line. Its extra column makes reflection preserve actual
hex adjacency, including at the map edges. Nine factory pairs flank three
shared center-line factories, retaining 21 factories and seven of each exit
count. The shared two-exit factory faces north/south; other factory mouths form
a single approach. Opening movement costs and positions match on both sides.
Part 9 preserves the reflected layout but thins the ridges, adds narrow back
routes and eight isolated plain hexes, and reduces roads to a connected spine.
Eleven factories hold one Charlie or Kilroy alongside their vehicle reserves.
Part 10 is a separate, wider battlefield with exact 180-degree rotation.
Its 24 factories form twelve pairs, eight with each exit count; twelve factories
contain one Charlie or Kilroy. Focused inventories collectively cover every tank,
artillery, anti-air and missile vehicle, with carriers before Atlas and mines.
Interior mountain islands contain at least five hexes, four isolated plain
clearings contain five hexes each, and edge mountains are at most three thick.
Roads occupy less than 30% of the connected valley floor in Parts 9–10.
Parts 11–15 use five separately authored route designs:

- **Switchback Fjords:** folded lanes and hairpins, with two diagonal shortcuts.
- **Delta Crossings:** branching tributaries divided by a valley river with three bridge crossings.
- **Caldera Circuit:** concentric routes, radial passes, abundant wasteland and an isolated ten-hex clearing.
- **Faultline Steps:** diagonal mountain fingers, hill-heavy approaches and slow heavy starting armor.
- **Pocket Siege:** four small combat chambers, narrow dogleg approaches and two isolated five-hex landing zones.

These five maps preserve 180-degree symmetry, matched six-unit formations,
4–8 reserves per factory, equal proportions of one/two/three exits, and one
Charlie or Kilroy in half the factories. Each map's focused teams collectively
include every permitted reserve type. Edge mountains stay at most three hexes
thick; interior mountain islands have at least five hexes. Their authored route
builder is `tools/build-curiosity-maps.js`, invoked by the main AI-made builder.

Parts 1–4 exclude aircraft; Parts 5–15 permit Pelicans only.
Charlie and Kilroy can cross mountains; Panther cannot. See the
[movement table and audit](MECHANICS.md#movement-and-terrain).
All maps are available in the menu, with
separate profile records and downloadable JSON from their source links.

Map zoom fits the entire battlefield in every style and art set, with
additional room to zoom out using the mouse wheel. Large maps no longer stop
at the old native-art minimum zoom.

The editor exports self-contained JSON. Schema:

```json
{
  "name": "MY LEVEL",
  "grid": ["..hh..", "B-...F", "......"],
  "buildings": [
    { "col": 0, "row": 1, "owner": 0 },
    { "col": 5, "row": 1, "owner": -1, "stored": ["BISON", "KILROY"] }
  ],
  "units": [
    { "t": "CHARLIE", "o": 0, "x": 1, "y": 1 },
    { "t": "GRIZZLY", "o": 1, "x": 4, "y": 2, "str": 6, "exp": 2 }
  ],
  "customUnits": { "HOVER": { "name": "Hover MK-1", "cls": "tank", "move": 8,
    "moveType": "treads", "rmin": 1, "rmax": 1, "atkG": 55, "atkA": 20, "def": 35 } }
}
```

Terrain characters: `.` plains, `-` road, `w` wasteland, `h` hills,
`M` mountains, `v` valley, `=` bridge, `F` factory, `B` base. Owners:
`0` Union (human by default), `1` Xenon (AI), `-1` neutral.
Levels have no turn limit of their own: every match is drawn after 100 turns
in which no unit loses a machine and no factory is captured, or when turn 5000
ends. A `turnLimit` field in an older level file is ignored.
Road tiles choose their path from adjacent road/building tiles: same-row runs
stay horizontal, while turns and junctions meet at their shared hex edges.

### Online levels

Paste a raw level-JSON URL into **Install from URL** on the mission menu.
Single levels, arrays, and `{ "levels": [...] }` packs are accepted. Every
level is engine-validated before it is installed. Raw GitHub and Gist links
work. See [`LEVEL_SOURCES.md`](LEVEL_SOURCES.md) for the twelve included
Lunar Frontiers maps, historical Nectaris map archives, their redistribution
status, and the sharing procedure.

## Custom units

New unit types are plain data — no code needed. Define them in the editor's
"Custom unit types" box (or in a level file's `customUnits`); they appear in
the palette and work everywhere: `cls` picks the drawn silhouette
(`infantry`, `tank`, `air`, `artillery`, `buggy`, `antiair`, `transport`,
`mine`), `moveType` picks movement costs (`foot`, `wheels`, `treads`,
`air`), and flags (`capture`, `moveAfterAttack`, `moveOrFire`, `cargo`,
`placeByTransport`) enable the special behaviors. Attack ranges are per
target domain: `rngG` hexes against ground, `rngA` against air, and a range
above 1 is indirect fire (band 2..range — it cannot hit an adjacent hex,
and draws no counterattack). `moveOrFire` is a separate flag, not implied
by range: the stock Lynx fires indirectly and still re-moves. Older custom
units that specify a single `rmax` keep working; it is translated to both
domains the unit can attack.

## Art style

New players start in **Pixel** style with the **Legacy** art set (the default
since 2026-09-26). The first-listed set, **1 · Remake**, gives all 23 unit types original native **32×32** art in pixel mode: angular
military silhouettes, upper-left lighting, bright flat armor and selective
charcoal contours. Both directions are separately shaded and horizontally
centered. Infantry stays small within its frame. Icons scale proportionally
with map zoom and use native 32×32 frames in factory panels and inspectors. See [art/units/README.md](art/units/README.md) for source,
exports and review tools. The flattened 48×32 terrain geometry specified in
[ART_DIRECTION.md](ART_DIRECTION.md) is present in the review fixture; production
terrain and building migration for Remake are still pending.

**Art set → Legacy** in the game or editor uses all 23 unit icons
adapted from [ユニットデータ](https://anka.sakura.ne.jp/nectaris/d2.html), together
with original-style pixel terrain: maroon plains, gray ridges, pink plateaus,
pale connected roads and continuous riverbeds. Its buildings follow the
original's: the base is a walled prison camp, the factory has round tanks and a
piped hall, and a neutral factory is yellow. Legacy uses 48×32 flattened
hexes, 32×32 pitch and a 16-pixel column stagger. The 32×32 unit frames scale with their hexes when zooming.
Mountain ranges join continuously across hex corners. A thin rounded board
frame fills exterior gaps with decorative terrain, without adding playable
cells, duplicating buildings or extending roads beyond the map.
The terrain is a reconstruction; the icons are JPEG-derived adaptations,
not a bit-exact ROM atlas. Each icon keeps the chart's pixels at exactly 2×,
infantry included, so units have the original map's proportions.
Provenance and rebuilding: [art/legacy/README.md](art/legacy/README.md).

The art-set choice is stored under `nectaris-unit-icon-set-v2`, shared by
the game, editor and review tools. It applies in Pixel style. New sets can
be registered through `js/unit-icon-sets.js`; every set must cover all 23 units.

Three selectable visual styles, switched with the dropdown in the game's top
bar and persisted in `localStorage` under `nectaris-style-v2` (decision
2026-08-30, extended 2026-09-01, pixel made default 2026-09-03; the editor
follows the stored choice on load):

- **Pixel** (default): two 32×32 directional frames per stock unit type,
  supplied by the selected art set. Remake is generated from editable indexed
  pixel constructions in `art/units/`.
  Late-80s console strategy proportions, selective charcoal contours, pale armor,
  steel barrels, yellow reserved for missiles, rockets and bombs. Every unit
  has its own silhouette (see `tools/unit-sheet.html`). Legacy instead uses
  the user-selected imported chart and matching reconstructed map style.
- **Neon**: procedural neon wireframes — dark plates with glowing
  faction-colored outlines, rib hatching, dashed pale details, and shared
  neon-yellow accents on weapons/canopies. Union = violet/magenta.
- **Classic**: the remake's first look — solid painted silhouettes with
  dark outlines.

Faction colours follow the original in every style: Union blue (violet in
neon), Xenon green, neutral gray. Red is reserved for the unit currently
attacking. Native unit palettes live in `art/units/pixel-art.js` and generated
`js/data-unit-art.js`; other styles use `js/render.js` (`THEMES` + `NEON`).
Buildings tint from the same faction entries so ownership reads
consistently in every style.

`tools/unit-sheet.html` (serve the repo, then open
`http://nectaris.localhost/tools/unit-sheet.html`) shows every stock unit in
pixel mode as Union, Xenon, attacking and spent, always at native size.

## Briefing language

The menu is English only. The 2026-09-26 simplification removed the **Briefing
language / 表示言語** selector and its `nectaris-lang` setting. The Base Nectaris
levels still carry `nameJa`, `descriptionJa`, `specialJa` and `tagsJa` fields,
which the game does not display.

## Fidelity and originality

- **Mechanics** are reimplemented from community documentation of the
  original, including the Japanese community-recovered damage and casualty
  formula and documented weighted damage rolls. See [the fidelity audit](FIDELITY_AUDIT.md)
  for corrections, source versions and remaining gaps; exact original CPU,
  PRNG and rounding behavior are not yet established.
- **Unit names, stats, ranges and per-chassis movement costs** follow the
  documented original tables (functional game data). The movement costs,
  per-domain attack ranges, surround/counterattack rules and experience
  awards are documented original behavior. See `MECHANICS.md`.
- **Remake art, reconstructed terrain and sounds are original to this project.**
  Legacy unit icons are third-party-derived, imported from the chart explicitly
  selected by the user on 2026-09-20. The source JPEG and provenance are in
  `art/legacy/`; this user instruction is not a separate third-party license.
- **Campaign maps** reproduce the 32 normal/advanced campaign layouts, deployments and
  factory inventories built into Hudson's official 1997 Windows freeware PC
  Engine remake. The normal campaign has the owner-confirmed redistribution
  permission recorded in 2026-09-03; the advanced import was explicitly requested
  on 2026-09-20. Both are extracted deterministically without bitmap artwork. The Base Nectaris terrain pack comes from unit-free
  `.nmd` files published with a separate reposting grant. The 12-map Lunar
  Frontiers expansion remains original. See
  [`LEVEL_SOURCES.md`](LEVEL_SOURCES.md).
