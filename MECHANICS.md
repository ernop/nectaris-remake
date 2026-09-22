# Mechanics reconstruction

The target is **1989 Japanese PC Engine Nectaris**, retaining the English
TurboGrafx-16 unit names. The latest maximum-fidelity request supersedes the
earlier custom base-storage rule. Campaign data comes from Hudson's official
1997 Windows port. See [FIDELITY_AUDIT.md](FIDELITY_AUDIT.md) for the complete
comparison, release differences, corrections and unresolved gaps.

“Documented” means supported by a manual or identified community research;
it does not mean verified against every original instruction. Never treat PCE,
TG-16, Windows and PlayStation evidence as interchangeable. Do not retune the
imported campaign to compensate for rule corrections.

## Units and actions

Clicking a mobile unit immediately opens movement destinations; **Attack** aims
from its current position. A move commits its movement phase: attack or End if
there is a shot, otherwise finish automatically. Top-bar undo reverses noncombat
actions up to the last battle or turn boundary. This is an intentional modern
control-flow change; the underlying movement/attack restrictions are preserved.
Atlas aims immediately and stationary units never offer movement.
See `PRODUCT.md` and the historical booklet review in `MANUAL_AUDIT.md`.

Action availability is evaluated against the live match, including current
ownership, unit identity, spent actions, occupancy, terrain and carrier transfer
allowance. Deployment target queries and deployment execution share
`canDeployNow`, `canDeployAt` and `canDeployInto`; field action summaries use
the same movement/attack gates as execution. Geometric reach or remaining
movement points alone do not establish a legal action. The factory roster and
End Turn warning consume these engine queries rather than reproducing rules.

There are **23 unit types**, each a squad of 1–8 machines. Full strength is
omitted from the map label. `js/data-units.js` follows the
[original PCE manual](https://dds.konami.com/games/manual/pcemini/jp_Nectaris.pdf)
and [Anka's table](https://anka.sakura.ne.jp/nectaris/d2.html); the former
confirms Giant air attack 40, Atlas ground attack 90 and Slagger defense 50.
English names/designations are localization choices, not evidence for different
stats. Charlie, Kilroy and Panther capture buildings.

Each ordinary unit may move and attack once. Combat ends its activation.
Hadrian, Octopus, Atlas and Hawkeye move **or** fire. Atlas and Trigger have no
movement once deployed; they may leave a factory onto an adjacent legal hex
or aboard a compatible transport.

**Rabbit (8 movement) and Lynx (6) may move, attack once, then spend the
remainder of the same allowance.** Attacking never refills it. Lynx attacks
ground targets exactly two hexes away and aircraft at distance one. The UI
and AI preserve the remaining allowance; undoing a completed retreat
cannot undo combat. Sources: [PCE supplement](https://anka.sakura.ne.jp/nectaris/d1.html)
and the [TG-16 FAQ](https://gamefaqs.gamespot.com/tg16/589030-military-madness/faqs/53871).

## Movement and terrain

`js/data-terrain.js` implements the published chassis costs:

| Chassis | Road/bridge | Plain | Hill | Waste | Mountain | Valley | Factory/base |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fighting vehicles, including buggies | 1 | 1 | 2 | 3 | — | — | 1 |
| Panther / Mule | 1 | 2 | 4 | — | — | — | 1 |
| Charlie / Kilroy | 1 | 1 | 1 | 2 | 2 | All remaining | 1 |
| Aircraft / Pelican | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Giant additionally cannot enter wasteland. Immobile units have zero movement.
Ground terrain defense is additive: road/bridge/valley/factory 0, plain 5,
hill 20, waste 30, base 35, mountain 40. Air receives no terrain defense.
Sources: PCE manual and [movement table](https://anka.sakura.ne.jp/nectaris/d2.html).

The 2026-09-22 terrain audit independently transcribes the movement table in
`test/terrain-movement-tests.js`: all 23 stock units, nine terrain types, both
column parities and both tested directions. Movement previews and execution
agree with the published terrain access/costs and each unit's allowance.
Panther captures buildings but uses light-vehicle movement: it cannot cross
mountains, wasteland or valley tiles. Charlie and Kilroy pay two for mountains;
entering a valley consumes their remaining movement. Giant's two movement points
cannot cover the fighting-vehicle wasteland cost of three; the data also retains
its explicit restriction. The editor now consults unit-specific restrictions
when placing units or painting terrain, fixing its omission of that metadata.
Unloading is checked separately: even Pelican cargo must land on plains,
roads/bridges or an owned factory, not hills, waste, mountains, valleys or bases.
That restriction follows [Anka's PCE supplement](https://anka.sakura.ne.jp/nectaris/d1.html).
These checks validate documented terrain behavior, not every original hardware
movement detail; the ZOC evidence and remaining limits are described below.

One unit occupies a hex. Friendly units permit pass-through; enemies block.
Every field unit projects cross-domain ZOC onto its six neighbors. Entering
hostile ZOC stops a move. **Starting inside ZOC does not cap the move at one
hex:** a unit can leave into uncontrolled hexes and continue with its normal
terrain costs and remaining allowance. Moving directly into another controlled
hex stops there. Friendly presence does not cancel enemy ZOC. Rabbit/Lynx keep
their unused allowance before attacking; their retreat follows the same rule
against the post-battle board. The former blanket one-hex limit and discounted
terrain cost were incorrect against the original Windows executable.

ZOC and surround reflect the current board throughout the turn. Moving,
destroying, loading, unloading, storing or deploying a unit changes its field
presence immediately. Units that have already acted still project ZOC; cargo
and stored units do not. Removing an enemy can free an unacted unit, but never
reopens a committed ordinary move. The engine revalidates movement at execution,
including when a caller supplies an older preview. Undo/save restoration derives
ZOC from the restored positions rather than retaining a cached turn-start map.

The stop-on-entry interpretation matches the manual's “at least one hex” wording
and 59 recorded Windows movement/ZOC fixtures, including every stock unit,
both sides/parities, terrain charging, encirclement and limited buggy retreats.
See [original executable evidence](ORIGINAL_EXECUTABLE_NOTES.md#zoc-and-movement--2026-09-22)
and `test/zoc-tests.js`. These are Windows execution observations, not PCE hardware
traces; direct PCE confirmation and the transient factory-capture bug remain open.

## Combat calculations

`js/combat.js` follows the
[community reconstruction](https://anka.sakura.ne.jp/nectaris/d3.html):

- Attack support sums relevant base attack × supporter strength; defense
  support sums base defense × supporter strength. Both divide by **twice the
  initiating squad's strength**. Supporters stand adjacent to the opposing unit.
- Attack receives attack support. Defense receives terrain and, on the defending
  side, defense support. Air terrain is zero.
- Surround halves the defender's base attack and its defense after terrain and
  support. Then modified stats cap at 100. Map edges prevent surround; an
  initiating squad is not penalized for being surrounded.
- Unit damage is `floor(attack × (100 − defense) / 100)`. Our implementation
  next floors the experience-adjusted unit damage, then floors multiplication
  by squad strength and the random coefficient.
- Temporary HP is `100 × strength + 50`, except strength 1 gets no extra 50.
  Remaining strength is `floor(max(0, HP − damage) / 100)`.

The published reconstruction suppresses some integer-operation ordering.
The 1997 Windows executable confirms these floor stages at `0x41bb32` and
`0x420cf6` (see `ORIGINAL_EXECUTABLE_NOTES.md`); direct PCE instruction-level
verification remains outstanding. Adjacent
exchanges use both pre-battle strengths. A counter requires the defender's
range band to include distance one against that target domain. Indirect bands
start at two; indirect exchanges have no support, surround or counterattack.

### Damage randomness

The former uniform 0.20–4.00 sampling was incorrect. Combat, AI expectations
and forecasts now share the [published weighted table](https://anka.sakura.ne.jp/nectaris/d5.html):

| Multiplier | .2 | .5 | .6 | .7 | .8 | .9 | 1 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5 | 2 | 4 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Probability % | 3 | 7 | 8 | 9 | 6 | 9 | 10 | 10 | 6 | 9 | 10 | 6 | 5 | 2 |

The source checks PCE, Windows and PS observations. This is stronger evidence
than using bounds alone, but does not recover the original PRNG. Mulberry32
and independent attack/counter rolls remain remake assumptions. Tests reproduce
the source's Falcon/Hunter survivor distributions.

### Experience and forecasts

The [experience table](https://anka.sakura.ne.jp/nectaris/d4.html) gives damage
coefficients `[1, 1.05, 1.10, 1.20, 1.30, 1.40, 1.60, 2, 2]` for levels 0–8.
It does not increase defense. Initiating combat earns +0 for no casualties,
+1 for damage, +2 for a kill; a surviving defender earns +2 when unhurt and +1
when hurt, including a counter-kill. Factory capture earns infantry +4. Cap 8.
The old additional counter-kill award was removed in this audit.

Forecasts use 100,000 independently seeded trials, the same weighted damage
model and simultaneous strengths. They never read or advance the match RNG.
Joint probabilities assume independent opposing rolls; they are estimates,
not knowledge of the next hidden outcome. See `PRODUCT.md` for controls.

## Transports, factories and bases

Mule carries Charlie, Kilroy, Atlas and Trigger. PCE permits Panther boarding
only from a factory. Pelican carries ground units, including an empty Mule;
loaded nested transports are forbidden. See the
[release comparison](https://anka.sakura.ne.jp/nectaris/d6.html).

Loading and unloading spend the passenger's activation. A transport may load
or unload once per turn, including with different passengers (user clarification,
2026-09-22). Moving does not consume that transfer allowance: cargo already
aboard at turn start may unload after moving, and unloading first leaves a ready
carrier free to move. Loading then moving is legal, but unloading must wait
until next turn. This applies to Pelican, Mule and custom transports. The limit
survives save/reload and is restored by undo. Unloading allows plains, roads and bridges,
plus direct storage in an owned factory in PCE. It never captures a prison base
by dropping onto it. Carrier casualties reduce cargo to at most the carrier's
remaining strength; cargo never increases. See the PCE supplement above.

Factories store and repair all chassis. Loaded carrier entry separates and
repairs both units; experience is retained. Storing and redeploying each spend
an activation. Infantry capture transfers reserves and stores the capturer.
Ready reserves can deploy immediately; the capturer must wait. Deployment
uses adjacent legal exits or compatible transports. There is no production
or resource economy. The TG-16 FAQ independently describes loaded-carrier repair.

Per the user's corrected original-game recollection (2026-09-20), CPU factory deployment
scans adjacent hexes clockwise from upper-left and chooses the first legal destination
for each ready reserve. A friendly compatible transport with cargo space counts
as an available destination at its place in that scan, including a used carrier
or one just deployed from the factory. The scan restarts for each reserve and
skips blocked, incompatible and off-map destinations. The order is upper-left,
up, upper-right, lower-right, down and lower-left. This follows the user's
recollection; an original execution trace remains outstanding.
The Atlas ground-deployment threshold still applies.

**Bases are prison camps, not repair factories.** Units may stand on them;
ground units receive +35 defense. Infantry capture of the enemy base wins.
The earlier remake extension that stored units in bases has been removed.
Explicit inventories already present in custom maps or historical saves remain
readable/deployable so this correction does not erase saved units.

## Victory and limits

Enemy-base capture wins. Elimination counts owned reserves but excludes Trigger
mines everywhere and, for PCE, Atlas still in storage. A deployed Atlas counts.
Default turn limit is 50 rounds; expiration awards Xenon the win. Custom maps
may override it. Exact victory-check timing in rare simultaneous/capture cases
still needs verification.

All 32 original normal/advanced missions are included. The CPU now performs
documented transport, guarded-factory and base-defense tactics, including the
four-enemy Atlas deployment condition. Exact CPU choices and the original
frame-dependent random stream remain unreproduced. Modern
UI, profiles, saves, hotseat, editor and forecasts are deliberate additions.
Read `FIDELITY_AUDIT.md` before describing the game as fully faithful.
