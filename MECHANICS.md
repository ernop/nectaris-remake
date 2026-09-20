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
and AI preserve the remaining allowance; cancelling a provisional retreat
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

One unit occupies a hex. Friendly units permit pass-through; enemies block.
Every field unit projects cross-domain ZOC onto its six neighbors. Entering
hostile ZOC stops a move. Our adopted starting-in-ZOC rule permits one adjacent
passable hex, charged as one point. For buggies, stopping before the attack
preserves the unused allowance and the second range is recalculated after
casualties. The exact ZOC/terrain and buggy boundary cases still need original
PCE traces; this is not a claim of an independently verified original exception.

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

Loading and unloading spend the passenger's activation. It cannot do both in
one turn. A ready passenger may leave a used carrier; unloading in place leaves
a ready carrier available to move. Unloading allows plains, roads and bridges,
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
