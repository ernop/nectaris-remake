# Three AI-made terrain campaigns

Created 2026-09-23 from the user's request for three campaigns of sixteen maps.
These are AI-made physical/tactical designs created by Codex, with a fresh army each mission.
The inspiration is concentration, dispersed fronts, turning movements, interior
routes, friction and the gap between impressive equipment and useful positions.
They are not historical battle reconstructions and add no new movement or victory rules.

All 48 missions are available in the mission library, each with a briefing behind
its small **?** control. **Next mission** stays within the selected campaign and
stops after mission 16. Saves and win records distinguish all three campaigns.

For the exact authored small-force or restricted-roster puzzles, select
**Opening → Original opening**. The optional compensation-offer mode may add
units to the side that goes second. Both modes use the ordinary capture or
elimination conditions and draw rules
([MECHANICS.md](MECHANICS.md#victory-and-limits)). Until 2026-09-30 each
mission had its own turn limit, and Xenon won when it ran out.

Hunters, Falcons and Eagles are excluded from both deployments and factories.
Across the collection, all other 20 stock types appear; individual missions may
use only two or three. Pelicans appear where transport is part of the problem.
Immobile factory units immediately follow a compatible Mule or Pelican; field
mines start beside their Mule. Inventories are small, focused teams of four.
Terrain and neutral stock pairs have half-turn symmetry. Several battles
deliberately give the two armies different compositions or numbers.

**Edge barriers (user, 2026-09-30).** The user found the open borders hurt
play: every region could be left for one open ring around the board, and an
army could circle the map along its edge. He asked for at least two
symmetrical barriers on every board of Open Horizons, The Knotted Heart,
Broken Ground and Bridgeheads, to slow or stop that. The builder now draws
them after each board's own terrain, as half-turn pairs from the top and
bottom edges: one pair on boards narrower than 34 hexes, two pairs on wider
ones, near the middle columns.

- **Open Horizons:** mountain headlands about a third of the board deep. One
  that meets an island stops a hex short, and that hex becomes a hill pass.
- **The Knotted Heart:** ridges from the edge to the knot, ending in a one-hex
  hill pass beside it. The long way round survives, as the briefs require,
  but only through these defended passes.
- **Broken Ground:** valley gullies, which stop vehicles and cost infantry a
  whole move. Missions 4, 10, 15 and 16 get none, because their valley seams
  already cross both edges.

No road or connecting route is carved through a barrier; a road may cross a
pass but leaves it a hill. The build fails, and so does the test suite, if a
vehicle can drive from the left edge to the right edge on open ground (plain,
road, bridge or camp) within three hexes of the top or bottom edge
([tools/edge-barriers.js](tools/edge-barriers.js)).

Board sizes range from 24×16 to 42×28. Each campaign mixes small encounters,
limited rosters, mobile forces, artillery positions and larger concluding battles.
The order expands the problems rather than promising a measured difficulty curve.

Forces below count field squads before optional compensation; each squad begins
at normal strength. The factory column counts neutral buildings, not stored units.

<a id="open-horizons"></a>

## AI-made: Open Horizons

A sea of maneuvering ground around mountain islands: space, concentration and exposed flanks. Ridges run in from the top and bottom edges, so no army can circle the rim.

[Import the whole campaign](levels/open-horizons.json).

| # | Mission | Board | Union / Xenon | Factories | Physical / tactical problem |
| --- | --- | --- | --- | --- | --- |
| 1 | [THREE AGAINST THREE](levels/open-horizons/01-three-against-three.json) | 24×16 | 3 / 3 | 0 | Three squads per side and no replacements. Six small mountain islands break up a broad plain; every supporting position costs a third of your army. |
| 2 | [THE LONG HOOK](levels/open-horizons/02-the-long-hook.json) | 32×18 | 6 / 6 | 2 | Crescent ridges shelter the direct approach. Fast Lenets and a Rabbit can take the long outside route, but the infantry must still reach a camp or arsenal. |
| 3 | [TWO COLORS OF STEEL](levels/open-horizons/03-two-colors-of-steel.json) | 28×18 | 5 / 5 | 2 | Only Charlie and Bison exist here. A diagonal chain of islands makes positioning and mutual support the entire problem. |
| 4 | [DIVIDED WEIGHT](levels/open-horizons/04-divided-weight.json) | 36×20 | 8 / 8 | 4 | Two large mountain formations divide the approach into three wide lanes. Your separated detachments can concentrate quickly only if you keep the middle passage usable. |
| 5 | [THE INVITING BOWL](levels/open-horizons/05-the-inviting-bowl.json) | 30×20 | 7 / 7 | 4 | A horseshoe of mountains wraps a tempting central arsenal. The straight road enters its mouth; the spacious outside flanks let the opponent approach its sides. |
| 6 | [RINGS WITHOUT WALLS](levels/open-horizons/06-rings-without-walls.json) | 34×22 | 7 / 7 | 4 | Broken mountain atolls enclose useful staging areas. Several gaps make each enclosure permeable; a force inside must watch more than the entrance it used. |
| 7 | [NO HEAVY ANSWER](levels/open-horizons/07-no-heavy-answer.json) | 28×18 | 6 / 6 | 2 | Capturers and missile buggies only. Scattered small islands provide turning points for hit-and-retreat movement, with very little armor to absorb mistakes. |
| 8 | [FINGER COUNTRY](levels/open-horizons/08-finger-country.json) | 38×20 | 9 / 9 | 6 | Long mountain fingers project into open ground. Their tips are turning points, while gaps between the fingers shelter artillery and isolated detachments. |
| 9 | [A NARROW ADVANTAGE](levels/open-horizons/09-a-narrow-advantage.json) | 30×20 | 5 / 7 | 2 | Two Giants give Union impressive local strength but few bodies. The hourglass formations invite a frontal stand while lighter forces can use the wide outer lanes. |
| 10 | [GUNS NEED COMPANY](levels/open-horizons/10-guns-need-company.json) | 32×20 | 7 / 7 | 4 | Offset mountain ribbons put neighboring lanes within artillery reach. Your gun-heavy army still needs infantry and a small mobile screen to occupy the ground. |
| 11 | [EMPTY MILES](levels/open-horizons/11-empty-miles.json) | 42×22 | 4 / 4 | 0 | Four squads each on a very wide field. Elongated shoals interrupt pursuit; committing two units to one side leaves enormous areas unguarded. |
| 12 | [THE CROWN'S TEETH](levels/open-horizons/12-the-crown-s-teeth.json) | 34×22 | 9 / 9 | 6 | A broken crown of mountains offers several protected approaches to the center. The gaps face different directions, so one supporting group cannot cover them all. |
| 13 | [DISTANT NEIGHBORS](levels/open-horizons/13-distant-neighbors.json) | 40×24 | 8 / 8 | 6 | Two island clusters face each other across an open gulf. Pelicans can shift cargo across the gulf, while unsupported ground units spend several turns crossing it. |
| 14 | [THE BRIGHT ROAD](levels/open-horizons/14-the-bright-road.json) | 36×20 | 8 / 8 | 4 | A conspicuous straight road passes through a crooked reef. Its speed comes with no terrain defense; the surrounding plain leaves room to approach on a wider frontage. |
| 15 | [MANY SMALL FRONTS](levels/open-horizons/15-many-small-fronts.json) | 38×24 | 10 / 10 | 8 | A loose field of irregular islands creates many small fronts. Four arsenals per side of the map reward local captures, but scattering every squad leaves no reserve. |
| 16 | [HORIZON CONVERGENCE](levels/open-horizons/16-horizon-convergence.json) | 42×26 | 16 / 16 | 10 | Several island chains converge around a wide central gulf. Large mixed armies must choose where to concentrate while keeping distant factory approaches and their own camp covered. |

<a id="knotted-heart"></a>

## AI-made: The Knotted Heart

Dense interior routes surrounded by spacious flanks: short paths through trouble or long paths around it. The long way round climbs through hill passes where ridges from the edge meet the knot.

[Import the whole campaign](levels/knotted-heart.json).

| # | Mission | Board | Union / Xenon | Factories | Physical / tactical problem |
| --- | --- | --- | --- | --- | --- |
| 1 | [THE CROSS AND THE FIELD](levels/knotted-heart/01-the-cross-and-the-field.json) | 26×18 | 4 / 4 | 2 | A compact mountain knot has a cross-shaped interior route. The center is short and restrictive; the open outer field lets units maneuver around its arms. |
| 2 | [SPOKES](levels/knotted-heart/02-spokes.json) | 30×20 | 6 / 6 | 4 | Radial passages meet at a small hub. A central force can change fronts rapidly, but several entrances lead into it and the spacious rim remains available. |
| 3 | [THE LADDER](levels/knotted-heart/03-the-ladder.json) | 28×22 | 5 / 5 | 2 | Two close interior lanes are joined by short rungs. Forces on the open flanks can enter at different heights, turning a seemingly simple corridor into several possible fights. |
| 4 | [FOOTPATH MAJORITY](levels/knotted-heart/04-footpath-majority.json) | 30×20 | 6 / 6 | 2 | Infantry and Mules only. The serpentine center is a road problem for the carriers, while Charlie and Kilroy can climb directly across the surrounding mountains. |
| 5 | [THE SHORT WAY](levels/knotted-heart/05-the-short-way.json) | 34×20 | 6 / 6 | 4 | Braided interior passages offer the shortest route to the enemy. The defenders bring more guns; the attacker brings speed and enough open flank to refuse the central fight. |
| 6 | [INNER OR OUTER](levels/knotted-heart/06-inner-or-outer.json) | 34×22 | 7 / 7 | 4 | Nested interior loops contrast with a broad outer circuit. Taking the inside saves distance, while the outside provides room to bring several units alongside one another. |
| 7 | [THREE IN THE KNOT](levels/knotted-heart/07-three-in-the-knot.json) | 24×18 | 3 / 3 | 0 | One Charlie, one Hadrian and one Rabbit per side. Diagonal interior cuts offer gun positions, but every detached unit leaves only two to defend the rest of the board. |
| 8 | [ZIPPER](levels/knotted-heart/08-zipper.json) | 36×22 | 8 / 8 | 6 | Offset openings interlock through the central ridge. A force can change lanes at some points and must backtrack at others; the open margins remain a longer escape route. |
| 9 | [THE COMFORTABLE COURT](levels/knotted-heart/09-the-comfortable-court.json) | 32×22 | 7 / 8 | 4 | Small protected courts look ideal for heavy tanks. Their narrow connections make it hard to bring that weight to bear against mobile units working around the outside. |
| 10 | [A LOOP AND A NEEDLE](levels/knotted-heart/10-a-loop-and-a-needle.json) | 36×24 | 8 / 8 | 6 | A roomy interior loop is cut by one narrow direct tunnel. Guns can cover nearby sectors, while moving the supporting vehicles between those sectors takes a different route. |
| 11 | [BETWEEN THE TEETH](levels/knotted-heart/11-between-the-teeth.json) | 34×20 | 6 / 6 | 2 | Only capturers and missile buggies. A comb of narrow mouths opens onto two broad flanks, giving retreating buggies many positions but few places to hide a careless capturer. |
| 12 | [FAN OUT](levels/knotted-heart/12-fan-out.json) | 38×24 | 10 / 10 | 6 | Several passages fan away from an off-center meeting point. Occupying that point shortens transfers between fronts, but moving too much through it creates traffic. |
| 13 | [TWO HEARTS](levels/knotted-heart/13-two-hearts.json) | 40×24 | 9 / 9 | 8 | Two dense knots share a small central connection. Armies can contest one knot, divide between both, or use the broad outside field to bypass either concentration. |
| 14 | [THE OFF-CENTER PRIZE](levels/knotted-heart/14-the-off-center-prize.json) | 36×22 | 7 / 7 | 6 | Unevenly placed spokes lead toward valuable central factories. The fastest-looking entry turns your force away from the route it must take to continue toward the enemy camp. |
| 15 | [OUTSIDE THE FORTRESS](levels/knotted-heart/15-outside-the-fortress.json) | 40×26 | 9 / 10 | 8 | The defender has an imposing heavy force beside a dense central fortress. The attacker has more flexible movement around its spacious outskirts; the strongest local position need not control the whole map. |
| 16 | [HEART OF THE MATTER](levels/knotted-heart/16-heart-of-the-matter.json) | 42×28 | 15 / 15 | 12 | A large interlocking center has several rooms, loops and narrow transfers. Twelve neutral factories pull the armies in different directions while the outer field leaves room for a major turning movement. |

<a id="broken-ground"></a>

## AI-made: Broken Ground

Roads, hills, wasteland and valleys give different units different maps to fight on. Gullies or valley seams cut the top and bottom edges, so no army can circle the rim.

[Import the whole campaign](levels/broken-ground.json).

| # | Mission | Board | Union / Xenon | Factories | Physical / tactical problem |
| --- | --- | --- | --- | --- | --- |
| 1 | [THE PRICE OF A HILL](levels/broken-ground/01-the-price-of-a-hill.json) | 24×18 | 3 / 3 | 0 | Three squads each cross a field of hill belts. Charlie, Bison and Panther pay different movement costs for the same terrain; a short route on the map can be a slow route for the unit. |
| 2 | [THE GILDED CAGE](levels/broken-ground/02-the-gilded-cage.json) | 30×20 | 5 / 6 | 2 | Giants dominate nearby ground but cannot enter wasteland. A winding road threads the waste fields; the lighter opposing army has more ways to approach the queue. |
| 3 | [MOTORCYCLE COUNTRY](levels/broken-ground/03-motorcycle-country.json) | 28×20 | 5 / 5 | 2 | Capturers and Rabbits share a road network across broad wasteland shoals. Panthers cannot leave the firm routes into wasteland, even where a Rabbit can cross. |
| 4 | [THE LONG CAUSEWAY](levels/broken-ground/04-the-long-causeway.json) | 34×20 | 7 / 7 | 4 | Valley seams interrupt the difficult ground. Bridges carry the vehicle routes, while Pelicans can move cargo to legal landing hexes beyond a crowded crossing. |
| 5 | [WALKING THE RIDGE](levels/broken-ground/05-walking-the-ridge.json) | 28×22 | 6 / 6 | 2 | Infantry and Mules only. Connected hill belts are cheap for foot soldiers and costly for their carriers; the road around the edge offers a different kind of shortcut. |
| 6 | [THE ROAD IS NOT COVER](levels/broken-ground/06-the-road-is-not-cover.json) | 32×20 | 6 / 6 | 4 | A fast exposed road crosses alternating hill and waste banks. Leaving it gives better terrain defense but spends movement, and the motorcycle capturer has fewer off-road choices. |
| 7 | [GUNS IN THE MUD](levels/broken-ground/07-guns-in-the-mud.json) | 30×22 | 6 / 7 | 4 | Your artillery-heavy force must relocate through broken waste and hill patches. An attractive firing position may take a full turn to leave and another to make useful again. |
| 8 | [FIRM GROUND](levels/broken-ground/08-firm-ground.json) | 34×22 | 8 / 8 | 4 | Mine teams compete over the few firm routes between large waste fields. Each mine has its own Mule, but transport unloading still needs plain, road, bridge or an owned factory. |
| 9 | [FOUR MACHINES](levels/broken-ground/09-four-machines.json) | 26×20 | 4 / 4 | 0 | Four squads each, no replacement stock. A quilt of hills and wasteland makes the Lenet's speed, Polar's weight and Hadrian's firing position matter in different ways. |
| 10 | [BROKEN LADDER](levels/broken-ground/10-broken-ladder.json) | 36×24 | 9 / 9 | 6 | Two valley cuts cross a ladder of firm routes. Some rungs are fast and exposed, others bend through hills; committing to a rung can leave the army on the wrong side of the next cut. |
| 11 | [THE PATIENT GIANT](levels/broken-ground/11-the-patient-giant.json) | 34×22 | 7 / 8 | 4 | A slow heavy group faces a broad diagonal waste belt. The long firm route keeps the Giant mobile, while mobile opponents can choose when to cross closer to it. |
| 12 | [RIDGES AND RUNWAYS](levels/broken-ground/12-ridges-and-runways.json) | 38×22 | 8 / 8 | 6 | Long hill ridges alternate with flat landing strips and waste depressions. Pelican cargo needs those firm strips; flying over a good defensive hill does not make it a legal unloading site. |
| 13 | [THE FALSE SHORTCUT](levels/broken-ground/13-the-false-shortcut.json) | 36×24 | 8 / 8 | 6 | A visually short route cuts straight through deep wasteland. The road bends away from the objective but can be faster, especially for a Panther or a heavy vehicle with little movement. |
| 14 | [TWO SPEEDS](levels/broken-ground/14-two-speeds.json) | 40×24 | 10 / 10 | 8 | Fast patrols and a slower core begin together on a patchwork of firm and difficult ground. Keeping them mutually supporting takes more care than sending every unit its maximum distance. |
| 15 | [THE ISLAND ROAD](levels/broken-ground/15-the-island-road.json) | 40×26 | 10 / 10 | 8 | Road-linked plateaus sit between valley seams and waste basins. Transports can shorten transfers, but ground escorts must choose among bridges, rough cuts and the long outer route. |
| 16 | [EVERY YARD COUNTS](levels/broken-ground/16-every-yard-counts.json) | 42×28 | 16 / 16 | 12 | Hill belts, wasteland basins, broken valleys and several firm routes meet on one large board. The army is broad enough to solve each terrain problem, but its different units cannot all use the same approach. |

## Rebuilding and validation

The briefs, rosters and settings live in
[tools/environment-campaign-specs.js](tools/environment-campaign-specs.js).
The individual geometry recipes live in
[tools/build-environment-campaigns.js](tools/build-environment-campaigns.js).

Run:

```sh
node tools/build-environment-campaigns.js
node test/run-tests.js
```

The builder writes the runtime library, the individual JSON levels and one
import bundle per campaign, for these three campaigns, the three balance
studies and the teaching campaign below. Rebuilding leaves these 48 missions byte-identical.

Checks cover reproducibility, unique layouts, source agreement, terrain legality,
reachable starting positions, connected ground routes without factory transit,
edge barriers (above), real factory exits, carrier compatibility, roster restrictions and the defining
terrain proportions of each campaign. The menu fixture exercises starting, saving,
continuing, next-mission boundaries and independent progress. The full suite runs
CPU self-play to completion on all 183 included maps. This verifies execution and
termination; difficulty and human-versus-human balance still need playtesting.

# Three balance-study campaigns

Approved 2026-09-28 by the user: three more 16-mission campaigns, AI-made by
Claude Opus 5.5, whose missions are measured with the simulator bots so that
the results confirm or refute ideas about what makes a map balanced.

- **Bridgeheads**: valleys split every board; bridges and a few footpaths are
  the only fast crossings. Hunters and Falcons are mostly absent; Eagles and
  Pelicans are allowed.
- **Siege Lines**: Xenon holds a fortified base and Union must break in before
  the turn limit (since 2026-09-30 a siege that stalls is a draw instead).
  Normal air, occasionally more.
- **Arsenal**: neutral factories whose reserves decide games, so capture
  timing matters. Normal air, occasionally more.
- Each mission tests one stated idea about balance. Bot results confirm or
  refute it, and the findings accumulate in a written guide to balanced maps.
- Symmetry varies: half-turn (even widths), left-right mirror (odd widths; the
  only other mirror that preserves this hex grid) and deliberately unequal maps.
  Moving first already makes every map unequal.
- Each campaign has an arc from small skirmishes to a large final battle, on
  boards from about 20×14 to 40×26. No new rules; a fresh army each mission.
- Balance standard, settled 2026-09-29 and restated by the user on 2026-09-30:
  each map is a game where "you playing well matters", and neither side,
  first or second, should have "a way to win with very high chances". Three
  tests: Marshal self-play gives Union 40–60% (wins at the turn limit reported
  separately); Classic and Tactical, the two weakest bots, each lose more than
  half their games to Marshal in each seat; and no bot in either seat wins 90%
  or more against each of the four bots. The best bot is the one that scores
  highest against the others over these boards: Marshal since master
  `479292c`, which scored 66% against Apex over the 48 boards. The 2026-09-29
  version used self-play alone; its missions passed all three tests on 23 of
  48 ([MAP_BALANCE.md](MAP_BALANCE.md), finding 13), while each board had its
  own turn limit. The user decided on 2026-09-30 to keep the missions as they
  are.
- Playable by people first: readable layouts, one clear problem per mission,
  briefings in the existing style, lunar place names.
- New boards are appended after the existing 119, so existing board numbers
  and the simulator's lock corpus stay unchanged. Paired variants of one map
  were proposed and rejected.

**Results.** All 48 missions gave Union 40–60% of Marshal self-play games on
dice seeds that no tuning run used: 150 games for 32 missions, 450 for 15 and
600 for one. Missions that first finished within two points of an edge were
re-tuned or measured again; none was that close, and the nearest were five at
43% or 57%, measured on 150 games each. Humans have not played them yet. How the missions were measured and tuned,
what the measurements showed about balanced maps, and each mission's numbers
are in [MAP_BALANCE.md](MAP_BALANCE.md).

**Unmeasured since 2026-09-30.** These results were measured while each mission
had its own turn limit (9 to 48 rounds) and Xenon won when it ran out; the
limits are in the level files as of commit `78f746a`. The
[draw rules](PRODUCT.md#fixed-turn-limit-and-draws-2026-09-30) that replaced
them turn every such Xenon win into a longer game or a draw, so the missions'
balance under the current rules has not been measured.

The briefs, rosters and settings live in
[tools/balance-campaign-specs.js](tools/balance-campaign-specs.js); the
geometry and placement rules in
[tools/build-balance-campaigns.js](tools/build-balance-campaigns.js). Union /
Xenon counts the units on the board at the start, and Factories counts factory
buildings of either owner or neutral.

<a id="bridgeheads"></a>

## AI-made: Bridgeheads

Rilles split every board. Bridges and a few footpaths are the only fast crossings, and holding the far end of one is the campaign's recurring problem. Rilles, and on two boards mountain ridges, cut the top and bottom edges, so no army can circle the rim.

Edge barriers (2026-09-30, the request above): on 13 boards a rille already ran
from edge to edge, and those boards are unchanged. Three let vehicles drive
along an edge. RIMA HYGINUS's bridges now stand one row further from the edges,
so its rille closes them. RIMA HADLEY has a mirrored pair of mountain ridges
from the bottom edge of the plain between its rilles. VALLIS SCHROTERI has
ridges from both edges on each side (`rims()` in the specs). A first version
put ridges on each bank of all 16 boards; Marshal self-play then gave Union
40-60% on only 4 of them, and the user chose this smaller change
([MAP_BALANCE.md](MAP_BALANCE.md#bridgeheads)).

[Import the whole campaign](levels/bridgeheads.json).

| # | Mission | Board | Union / Xenon | Factories | Symmetry | Physical / tactical problem |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [RIMA BODE](levels/bridgeheads/01-rima-bode.json) | 20×14 | 5 / 5 | 0 | half-turn | A single bridge spans the rille. Your vanguard waits a few hexes short of its near end; the Xenon garrison beyond is under strength. Infantry can climb down anywhere, but a squad in the valley floor ends its move there with no cover. |
| 2 | [RIMA HYGINUS](levels/bridgeheads/02-rima-hyginus.json) | 24×14 | 8 / 7 | 0 | half-turn | A crater sits in the middle of the rille, and the only bridges are at its two ends. An army that crosses at one end leaves the other bridge to the enemy. The Xenon camp stands nearer the rille than yours, and you bring one more Bison. |
| 3 | [RIMA HESIODUS](levels/bridgeheads/03-rima-hesiodus.json) | 25×16 | 6 / 6 | 0 | mirror | The camps face each other across the north end of the rille, where a footpath lets infantry cross in two moves. Tanks must go the long way, over the southern bridge. Every Xenon unit is under strength, most of them badly. |
| 4 | [VALLIS SNELLIUS](levels/bridgeheads/04-vallis-snellius.json) | 24×16 | 10 / 9 | 0 | half-turn | No bridge crosses this valley. Tanks can only hold their own bank; any attack must walk through the valley floor or fly. You have three Pelicans to Xenon's two, a Hawkeye guards each camp, and the Xenon ground forces are under strength. |
| 5 | [RIMAE TRIESNECKER](levels/bridgeheads/05-rimae-triesnecker.json) | 28×18 | 5 / 5 | 2 | half-turn | Two rilles cross at right angles and divide the ground into four fields. Each camp's field has two bridges to the neutral fields, where small factories hold a Charlie each. |
| 6 | [RIMA HADLEY](levels/bridgeheads/06-rima-hadley.json) | 27×17 | 7 / 6 | 0 | mirror | Each camp sits behind its own winding rille with a bridge at each end. The open plain between the rilles belongs to whoever crosses first. You bring one extra Kilroy, and the Xenon Lenet starts damaged. |
| 7 | [VALLIS ALPES](levels/bridgeheads/07-vallis-alpes.json) | 28×16 | 7 / 7 | 0 | half-turn | A deep valley cuts through the mountain wall, and one long bridge carries the road across. Pelicans can lift a tank over the wall anywhere. The Xenon tanks and infantry are under strength. |
| 8 | [RIMA SIRSALIS](levels/bridgeheads/08-rima-sirsalis.json) | 28×18 | 6 / 6 | 0 | half-turn | Guns on either rim can reach across the rille. Your guns start in firing position; Xenon's are damaged and farther back, and its Bison is damaged too. Two bridges carry the tanks, and the artillery decides which of them is usable. |
| 9 | [RIMA MARIUS](levels/bridgeheads/09-rima-marius.json) | 27×17 | 6 / 6 | 0 | unequal | The rille runs close to your camp. You defend a narrow bank and Xenon has room to form up, but its camp stands nearer the centre than yours and its army is slightly under strength. |
| 10 | [RIMA PRINZ](levels/bridgeheads/10-rima-prinz.json) | 30×18 | 7 / 7 | 2 | half-turn | Eagles fly over the rille as if it were not there. Each side has one Hawkeye to keep the sky over its bridge, and a small factory waits on each far bank. |
| 11 | [RIMA BIRT](levels/bridgeheads/11-rima-birt.json) | 30×20 | 5 / 5 | 2 | half-turn | Two parallel rilles enclose a strip of plain with two factories. Each camp is one bridge from the strip and two from the enemy. |
| 12 | [VALLIS SCHROTERI](levels/bridgeheads/12-vallis-schroteri.json) | 32×20 | 5 / 5 | 0 | unequal | The Xenon camp stands inside a loop of the valley, reachable by tanks over one bridge. The armies are equal: the loop is Xenon's advantage, the first move is yours. |
| 13 | [RIMA MAIRAN](levels/bridgeheads/13-rima-mairan.json) | 30×20 | 10 / 9 | 0 | half-turn | Each side's Mules start at its bridgeheads, carrying mines. A mine on a bridge closes it to tanks, but a closed bridge also stops your own attack. You bring one more Charlie. |
| 14 | [RIMAE LITTROW](levels/bridgeheads/14-rimae-littrow.json) | 34×22 | 7 / 7 | 4 | half-turn | Three rilles run between the camps with their bridges staggered, so every crossing turns the advance sideways. Both armies start between the rilles beside factories; your force is under strength. |
| 15 | [RIMA CAUCHY](levels/bridgeheads/15-rima-cauchy.json) | 36×22 | 12 / 11 | 0 | half-turn | A long diagonal rille separates distant camps. Mules carry infantry along the roads; the bridges are far apart and far from home. The Xenon camp stands nearer the rille than yours, and you bring one more Bison, badly damaged. |
| 16 | [RIMA ARIADAEUS](levels/bridgeheads/16-rima-ariadaeus.json) | 40×26 | 10 / 10 | 4 | half-turn | The great straight rille cuts the whole board, with branches, footpaths and bridges along its length. Eagles, Pelicans and factories on both banks. |

<a id="siege-lines"></a>

## AI-made: Siege Lines

Xenon holds a fortified crater in every battle. Union must break in and take the camp; walls, gates and guns decide how long that takes.

[Import the whole campaign](levels/siege-lines.json).

| # | Mission | Board | Union / Xenon | Factories | Symmetry | Physical / tactical problem |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [PLATO](levels/siege-lines/01-plato.json) | 22×14 | 6 / 6 | 0 | unequal | Plato's wall is unbroken except for two gates facing you. Six Xenon units hold the crater, as many as you bring; your Hadrian is the only gun on either side. |
| 2 | [ARCHIMEDES](levels/siege-lines/02-archimedes.json) | 24×14 | 7 / 6 | 0 | unequal | A single gate breaks Archimedes' wall. Whatever holds it holds the crater; infantry can climb the wall anywhere, slowly. Your Hadrian can shell the gate from outside. |
| 3 | [ARZACHEL](levels/siege-lines/03-arzachel.json) | 24×16 | 8 / 8 | 0 | unequal | Two guns inside the wall cover both gates. The last few hexes before a gate are under their fire and the wall shields them from direct attack; your own Hadrian can answer them. |
| 4 | [ALPHONSUS](levels/siege-lines/04-alphonsus.json) | 26×16 | 7 / 8 | 0 | unequal | Three gates, two of them mined. A mine closes its gate to tanks until it is destroyed, and it is very hard to destroy. |
| 5 | [PTOLEMAEUS](levels/siege-lines/05-ptolemaeus.json) | 28×18 | 7 / 4 | 1 | unequal | The great walled plain holds a Xenon factory. Damaged defenders fall back to it for repairs, and its reserves can refill a gate. You bring one Hadrian. |
| 6 | [COPERNICUS](levels/siege-lines/06-copernicus.json) | 28×18 | 8 / 7 | 0 | unequal | Two walls: an outer terrace of broken ground open to the north and south, and an inner rim with a single western gate. Getting in means going around. |
| 7 | [TYCHO](levels/siege-lines/07-tycho.json) | 26×18 | 6 / 5 | 0 | unequal | The camp sits on Tycho's central peak. One narrow road climbs it; infantry can scramble up the slopes, where every defender has mountain cover. |
| 8 | [CLAVIUS](levels/siege-lines/08-clavius.json) | 30×18 | 7 / 4 | 2 | unequal | Two small outpost craters guard the approaches, each with an unguarded Xenon factory. Taking an outpost gives you its reserve and a place to repair. |
| 9 | [GRIMALDI](levels/siege-lines/09-grimaldi.json) | 30×20 | 7 / 6 | 0 | unequal | The garrison is small, but a Xenon relief column is marching along the northern edge. Take the camp before it arrives, or turn to meet it. |
| 10 | [WARGENTIN](levels/siege-lines/10-wargentin.json) | 28×18 | 6 / 8 | 0 | unequal | Wargentin is a crater filled to the brim: a plateau of hills with no wall at all. One Eagle supports your attack; a Hawkeye and a Seeker defend the sky. |
| 11 | [GASSENDI](levels/siege-lines/11-gassendi.json) | 30×20 | 8 / 4 | 0 | unequal | Gassendi's wall has one gate, but walls do not stop Pelicans. Each can carry a squad over the rim into the crater, where a single Seeker guards the sky. |
| 12 | [POSIDONIUS](levels/siege-lines/12-posidonius.json) | 30×20 | 9 / 6 | 0 | unequal | A rille runs in front of Posidonius with a single bridge. Tanks must cross it and then find a gate; infantry can climb down and up anywhere, and your Pelican can lift one unit over both. |
| 13 | [THEOPHILUS](levels/siege-lines/13-theophilus.json) | 32×20 | 8 / 5 | 1 | unequal | Two craters: the camp in Theophilus and a Xenon factory in its neighbor. The factory's reserves can reinforce the camp unless you take it first. |
| 14 | [MAUROLYCUS](levels/siege-lines/14-maurolycus.json) | 32×20 | 7 / 6 | 0 | unequal | A fast Xenon Rabbit starts outside the walls, on the road to your camp. Chase it or ignore it: every unit you leave behind to watch it is one fewer at the gate. |
| 15 | [PETAVIUS](levels/siege-lines/15-petavius.json) | 34×22 | 10 / 10 | 1 | unequal | A huge crater with four gates and a rille across its floor. The camp lies beyond the rille; the gates are easy, the rille is not. Your Eagle faces two Hawkeyes and a Seeker. |
| 16 | [MARE ORIENTALE](levels/siege-lines/16-mare-orientale.json) | 40×26 | 9 / 12 | 1 | unequal | Three concentric rings of mountains surround the Xenon camp, the innermost two hexes thick, their gates offset so each ring turns the attack sideways. Xenon has more units; it also has more wall to hold. |

<a id="arsenal"></a>

## AI-made: Arsenal

Neutral factories hold the reserves that decide these battles. Which factory to take, and when, matters more than the army you start with.

[Import the whole campaign](levels/arsenal.json).

| # | Mission | Board | Union / Xenon | Factories | Symmetry | Physical / tactical problem |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [SINUS MEDII](levels/arsenal/01-sinus-medii.json) | 21×14 | 4 / 4 | 1 | mirror | One factory stands at the exact centre, holding a Charlie, a Bison and a Kilroy. You move first, but your capturers are slow Kilroys starting farther back than Xenon's Charlies. |
| 2 | [MARE VAPORUM](levels/arsenal/02-mare-vaporum.json) | 24×16 | 4 / 5 | 2 | half-turn | Two factories lie in the open middle, each a little closer to one camp. Take yours, and decide whether to reach for theirs. Your camp stands farther forward than Xenon's, but you bring one Charlie fewer, and the Xenon tanks start damaged. |
| 3 | [LACUS SOMNIORUM](levels/arsenal/03-lacus-somniorum.json) | 26×16 | 5 / 5 | 6 | half-turn | Six small factories are scattered across the lake bed, each holding a squad or two. There are more prizes than capturers, and the Xenon camp stands nearer the middle than yours. |
| 4 | [MARE CRISIUM](levels/arsenal/04-mare-crisium.json) | 27×17 | 6 / 5 | 2 | mirror | The factories on the rim of Crisium hold aircraft, a Hunter and a Falcon each. Whoever takes one owns the sky over the basin; you bring a second Hawkeye, but one of your Charlies is at half strength. |
| 5 | [PALUS PUTREDINIS](levels/arsenal/05-palus-putredinis.json) | 28×18 | 6 / 5 | 2 | half-turn | The marsh factories hold Atlas guns and the Mules to carry them. An Atlas can shell anything within six hexes, but only where a Mule puts it. You bring one more Charlie, and the Xenon force is under strength. |
| 6 | [MARE NUBIUM](levels/arsenal/06-mare-nubium.json) | 28×18 | 5 / 5 | 4 | half-turn | A rich factory stands a few hexes from each camp, closer to the enemy's army than to its owner's. A quick capturer can take it; the camp's defenders can hold it. |
| 7 | [SINUS IRIDUM](levels/arsenal/07-sinus-iridum.json) | 29×18 | 6 / 6 | 3 | mirror | The richest factory sits inside a horseshoe of mountains with one entrance to the south. Taking it is a race; keeping it is a siege. |
| 8 | [MARE FECUNDITATIS](levels/arsenal/08-mare-fecunditatis.json) | 30×20 | 4 / 4 | 4 | half-turn | An island factory sits inside a ring of valleys that tanks cannot cross. The Pelican in your nearer factory can fly a squad over. The Xenon Lenet starts damaged. |
| 9 | [MARE HUMORUM](levels/arsenal/09-mare-humorum.json) | 30×20 | 6 / 5 | 4 | half-turn | Near your camp, a factory holds one squad. Far out on the flank, another holds a tank company. Send your capturers near or far; you have one more Charlie than Xenon. |
| 10 | [OCEANUS PROCELLARUM](levels/arsenal/10-oceanus-procellarum.json) | 34×22 | 9 / 9 | 8 | half-turn | An ocean of open ground with eight scattered factories. Every capture draws a response, and no front holds still for long. Your army arrives worn: every unit starts at strength six. |
| 11 | [MARE COGNITUM](levels/arsenal/11-mare-cognitum.json) | 30×20 | 8 / 8 | 4 | half-turn | These factories hold only a squad each, but any damaged unit can repair in one. Holding them keeps your army whole. Your Hadrian starts damaged. |
| 12 | [MARE SERENITATIS](levels/arsenal/12-mare-serenitatis.json) | 31×20 | 4 / 4 | 5 | unequal | Xenon's factories are many but far from its army; Union's are few but close. Whichever side arms faster decides the battle. |
| 13 | [MARE TRANQUILLITATIS](levels/arsenal/13-mare-tranquillitatis.json) | 32×20 | 4 / 4 | 6 | half-turn | Both sides land with infantry only; your landing parties are under strength, and Xenon lands nearer the middle. The factories hold the tanks, and every tank you field is one the enemy does not. |
| 14 | [MARE INSULARUM](levels/arsenal/14-mare-insularum.json) | 34×22 | 7 / 7 | 4 | half-turn | Islands of firm ground stand in a sea of valleys, and the factories on them can be reached on foot, slowly, or by Pelican. Each side has one Pelican, and a Hawkeye to shoot the other's down. |
| 15 | [LACUS MORTIS](levels/arsenal/15-lacus-mortis.json) | 36×22 | 4 / 4 | 4 | half-turn | Each camp owns a deep reserve of eight units, released from its factory a few at a time. The neutral factories between them decide who runs out first. |
| 16 | [MARE NECTARIS](levels/arsenal/16-mare-nectaris.json) | 40×26 | 10 / 10 | 8 | half-turn | The Sea of Nectar: the final battle, with factories of every kind across a wide field. Aircraft, armour and artillery are all waiting to be claimed. |

<a id="training-ground"></a>

# AI-made: Training Ground

Approved 2026-09-30 by the user as the test of a campaign designed around a
difficulty curve ([decision](PRODUCT.md#campaign-design-a-difficulty-curve-2026-09-30)).
Sixteen missions, AI-made by Claude Opus 5.5, each introducing one thing a new
player needs, on boards that grow from 14×10 to 30×20. Every board has edge
barriers. The armies are often unequal: the early advantage comes from a
larger or fresher army, not from a weaker opponent.

When Marshal, the best bot, plays both sides, Union wins 94-100% of games on
missions 1-5, falling to 61% on mission 16. Tactical and Classic win less often
as Union against Marshal than Marshal does, and under a quarter of their games
on missions 13-16. Humans have not played it yet. The method and each
mission's numbers are in [MAP_BALANCE.md](MAP_BALANCE.md#designing-a-campaign).

The briefs, armies and terrain seeds live in
[tools/teaching-campaign-specs.js](tools/teaching-campaign-specs.js), built by
[tools/build-teaching-campaign.js](tools/build-teaching-campaign.js) with the
balance-study builder. Most boards start from a seeded layer of clustered
hills, wasteland and mountains (`texture()` in the specs); the bot results
belong to those exact boards, so changing the seed, the function or an army
means measuring again.

[Import the whole campaign](levels/training-ground.json).

| # | Mission | Board | Union / Xenon | Factories | Lesson | Setup |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [MONS PICO](levels/training-ground/01-mons-pico.json) | 14×10 | 5 / 4 | 0 | capture the camp | Charlies and Bisons only; you have one more Bison. |
| 2 | [MONS PITON](levels/training-ground/02-mons-piton.json) | 16×10 | 6 / 4 | 0 | terrain defense | The Xenon waits on wasteland in the middle. |
| 3 | [MONS LA HIRE](levels/training-ground/03-mons-la-hire.json) | 16×12 | 6 / 4 | 0 | zones of control | A mountain wall with a pass at each end. |
| 4 | [MONS HUYGENS](levels/training-ground/04-mons-huygens.json) | 18×12 | 6 / 5 | 0 | support and surround | One more Bison than the Xenon. |
| 5 | [MONS BRADLEY](levels/training-ground/05-mons-bradley.json) | 18×12 | 4 / 4 | 2 | factories | Two neutral factories hold two Bisons each; the Xenon Bisons start damaged. |
| 6 | [MONS WOLFF](levels/training-ground/06-mons-wolff.json) | 18×14 | 7 / 5 | 0 | Kilroy | Two Kilroys to the Xenon's one, and a damaged extra Bison. |
| 7 | [MONS AMPERE](levels/training-ground/07-mons-ampere.json) | 20×14 | 6 / 6 | 0 | artillery | Two Hadrians to one; the Xenon has a third Charlie instead. |
| 8 | [MONS ARGAEUS](levels/training-ground/08-mons-argaeus.json) | 20×14 | 8 / 7 | 0 | buggies | A Rabbit and a Lynx; one of your Bisons is damaged. |
| 9 | [MONS VINOGRADOV](levels/training-ground/09-mons-vinogradov.json) | 22×14 | 7 / 7 | 0 | aircraft | Your weakened Eagle squad against a Rabbit. |
| 10 | [MONS GRUITHUISEN](levels/training-ground/10-mons-gruithuisen.json) | 22×16 | 8 / 7 | 0 | anti-air | A Seeker and a Hawkeye against one Xenon Eagle. |
| 11 | [MONS RUMKER](levels/training-ground/11-mons-rumker.json) | 24×16 | 9 / 8 | 2 | transports and roads | Mules, Panthers and roads; one more Bison. |
| 12 | [MONTES JURA](levels/training-ground/12-montes-jura.json) | 24×16 | 9 / 8 | 0 | valleys and the Pelican | A valley crossed by two bridges; one Pelican each. |
| 13 | [MONTES CAUCASUS](levels/training-ground/13-montes-caucasus.json) | 26×16 | 9 / 9 | 0 | heavy armor | Giant and Grizzly against Polar and two Slaggers. |
| 14 | [MONTES HAEMUS](levels/training-ground/14-montes-haemus.json) | 26×18 | 9 / 10 | 2 | experience | Your main squads start with a star; the Xenon has more units. |
| 15 | [MONTES TAURUS](levels/training-ground/15-montes-taurus.json) | 28×18 | 12 / 12 | 0 | mines and fixed guns | Unequal sides: two Trigger mines, an Atlas and an Octopus hold the Xenon line. |
| 16 | [MONTES APENNINUS](levels/training-ground/16-montes-apenninus.json) | 30×20 | 15 / 13 | 2 | all arms | Every arm, including Hunters and Falcons; you have two more Bisons. |
