# Mechanics reconstruction

How this remake implements the original's rules, and where each rule comes
from. "Documented" means published community documentation of the original
game's behavior (StrategyWiki's *Military Madness/Combat* page, player-written
FAQs, and the game's published manual); "reconstructed" means the original's
exact internals were never published and this project supplies a formula tuned
to observed behavior. Everything here is data-driven: the tables live in
`js/data-*.js` and the pipeline in `js/combat.js` / `js/engine.js`.

## Units

Each unit is a squad with a **strength** of 1–8 (the original's sub-unit
count). Combat power scales linearly with strength. Roster and stats are in
`js/data-units.js` — 22 types: 3 infantry (the only capturers), 7 tanks,
3 aircraft, 3 artillery, 2 missile buggies, 2 anti-air, 2 transports, 1 mine.

Special behaviors (all documented):

- **Infantry** capture factories and bases by moving onto them.
- **Ranged units** (artillery, Hawkeye): may move *or* fire each turn, never
  both; their attacks receive no counterattack, and they cannot counterattack.
  Minimum range 2 — adjacent enemies are safe from them.
- **Missile buggies** (Rabbit, Lynx) may spend leftover movement after
  attacking.
- **Transports** (Mule ground, Pelican air) carry one ground unit. Loading:
  the passenger moves onto the transport's hex. Unloading: to an adjacent
  passable, empty hex; the passenger's turn is spent.
- **Atlas and Trigger** are immobile; they only leave a factory by being
  loaded onto a transport on/adjacent to it (or deployed onto the factory hex
  itself). A level file may also place them directly.
- **Air units** pay 1 movement per hex regardless of terrain, receive no
  terrain defense, and can only be attacked with air-attack values.

## Movement

- Per-terrain, per-chassis costs (`js/data-terrain.js`). The defense
  percentages are the manual's published values (plains 5%, road 0%,
  wasteland 30%, hills 20%, mountains 40%, valley/bridge 0%, base 35%).
  Mountains are foot/air only; valleys can be entered on foot only by
  spending every remaining movement point. The cost numbers are the published
  per-chassis table (below) and are plain data for modders to override.

### Movement costs are now sourced, not reconstructed (2026-09-01)

The costs were a reconstruction until a per-chassis table turned up on BASE
NECTARIS's [terrain page](http://www.max.hi-ho.ne.jp/summoner/nectaris/tactics/chikei/index.htm)
during the archive-map research. Two things made it worth trusting: its
defense column matches ours value for value, and its
[unit page](http://www.max.hi-ho.ne.jp/summoner/nectaris/tactics/unit/index.htm)
lists all 23 units with model codes (GX-77, S-61, MB-4 …) that match our
roster one for one, so its chassis groupings map onto ours without guesswork.

Those groupings turned out to be *our* groupings, with one unit-level error on
our side. The original has three ground classes: the two capturing infantry;
the fighting vehicles (tanks, missile buggies, self-propelled guns, anti-air);
and the two carriers, Panther and Mule. Our `foot`/`treads`/`wheels` already
matched that, except that the missile buggies were filed with the carriers.

Adopted:

| Rule | Was | Now |
|---|---|---|
| Buggies (Rabbit, Lynx) | carrier rates | fighting-vehicle rates |
| Wasteland, carriers | 4 | cannot enter |
| Wasteland, vehicles | 2 | 3 |
| Wasteland, Giant | 2 | cannot enter (`cannotEnter`, per-unit) |
| Hills, foot | 2 | 1 |
| Hills, carriers | 3 | 4 |
| Mountains, foot | 3 | 2 |
| Valley, foot | 2 | spends all remaining movement (`costsAllMovement`) |
| Setting down a mine or Atlas | any passable hex | plains, road, bridge or factory (`deployable`) |

Also corrected from the unit page: Kilroy's designation is GX-78, not GX-87.

Each row above has a test in `test/run-tests.js` under "per-chassis terrain
costs". The change moved AI-vs-AI self-play from 17/40 to 11/40 wins for
player 0 — see "Balance after the cost change" below.

### Adopted: per-domain ranges and the Lynx (2026-09-01, same day)

The Lynx item above was adopted the same day, on the instruction that the
original's behavior is the spec. The single `rmin`/`rmax` pair was replaced
with per-domain maximum ranges `rngG`/`rngA` (band 2..range when above 1),
"move or fire" became the explicit `moveOrFire` flag on the three
self-propelled guns and the Hawkeye, and counterattack eligibility now falls
out of the defender's own band — no special artillery case remains. Verified
against BASE NECTARIS's unit page, StrategyWiki's US tables, and the TG-16
and PlayStation FAQs, which agree with each other. Custom units written
against the old `rmin`/`rmax` schema still load: `mergeUnitTypes` translates
the legacy fields.

Adopted from the same sweep (special-effects and EXP pages): surround
penalizes only the defender and never at the map edge; combat powers ceiling
at 999; defender experience awards +2 when its counterattack destroys the
attacker; infantry earns +4 experience for capturing a factory.

### Balance after the cost change

Self-play is one deterministic AI-vs-AI game per map with a fixed seed and the
same AI on both sides, so per-map results mostly reflect starting-position
asymmetry rather than skill. Adopting the table moved the totals from 17/40 to
11/40 for player 0, and the shift is concentrated in the older maps, which were
tuned against the reconstructed costs:

| Group | Before | After |
|---|---|---|
| Campaign (16) | 8 / 8 | 4 / 12 |
| Lunar Frontiers (12) | 3 / 9 | 2 / 10 |
| Base Nectaris (12) | 6 / 6 | 5 / 7 |

Turn-limit stalls went from 3 to 2. Nothing became unplayable and no map
validation broke, but the campaign is now noticeably friendlier to player 1
under AI play. Whether to retune those maps against the corrected costs is an
open design question, deliberately left alone here: the rules are the thing
with a source, the maps are ours to tune.
- **Zone of Control** (documented): the six hexes around every unit. A unit
  starting inside an enemy ZOC may move only 1 hex; entering an enemy-ZOC hex
  ends the move. ZOC is cross-domain: aircraft block tanks and vice versa.
- Friendly units can be moved through, not stopped on. One unit per hex.

## Combat: the 4-step calculator

Both sides' values are computed through four steps, flooring after each step
(documented; the in-game battle preview shows the same four rows):

1. **Experience.** Per-strength base attack/defense are raised by the tier
   table: +4%/+5% (level 1), +10%, +20%, +30%, +40%, +60%, +100% (levels 7
   and 8). Attack Power = strength × modified base attack.
2. **Surround** (direct combat only, defender only — corrected 2026-09-01
   against the published special-effects page). A unit is surrounded when
   all six adjacent hexes are occupied by, or adjacent to, enemy units; when
   *attacked* in that state its attack and defense are halved. A surrounded
   unit that itself attacks suffers nothing, and a unit against the map edge
   can never be surrounded, because off-map hexes carry no ZOC.
3. **Support** (direct combat only). The attacker adds 50% of each adjacent
   ally-of-the-attacker-next-to-the-defender's attack power; the defender
   adds 50% of each ally-next-to-the-attacker's defense power, capped at 2×
   the defender's post-experience defense. Attack support uses the ally's
   relevant stat (an ally with no air attack contributes nothing against an
   air target); defense support flows from any adjacent ally. The published
   page's worked examples (Seeker +680 from two Hawkeyes, +320 from two
   Bisons) reproduce exactly under these formulas.
4. **Terrain.** The defender's defense rises by the terrain percentage
   (ground units only). If the bonus rounds down to zero, nothing is added.

Both final powers ceiling at 999, the original calculator's three-digit top.

**Ranges are per target domain** (corrected 2026-09-01): `rngG` hexes against
ground targets, `rngA` against air, and any range above 1 is indirect fire
with a band of 2..range — it cannot hit an adjacent hex. So the Lynx (ground
2 / air 1) shoots ground targets only at exactly two hexes yet must be
adjacent to hit aircraft, and it keeps its move-after-attack; the Hawkeye
(air 2–5) cannot shoot an adjacent aircraft. "Move or fire, never both" is a
separate flag (`moveOrFire`) carried by the three self-propelled guns and the
Hawkeye — it is not implied by being ranged, which is exactly the Lynx's
trick. A defender counterattacks only in adjacent combat and only when its
own band against the attacker's domain includes distance 1, which is why
indirect exchanges involve no counterattack at all, in either direction.

**Damage roll (reconstructed).** The original's exact casualty formula was
never published. This remake rolls one die per attacker strength point with
kill probability `AP / (AP + DA)`; both sides fire simultaneously in direct
combat, computed from pre-battle strengths.
The result matches the original's observed feel: even fights at full strength
cost the defender ~3–5 points, outmatched attacks bounce off. Seedable RNG
(`COMBAT.makeRng`) keeps tests and replays deterministic.

**Experience awards (published table):** attacking — no damage +0, damage +1,
kill +2. Defending — unhurt +2, hurt +1, counterattack destroys the attacker
+2. Infantry earns +4 for capturing a factory. Max 8; the 7→8 step adds no
stats, so 7 is the effective ceiling.

One naming note: the Japanese unit page designates the heavy infantry GX-78
(ダーベック); the US release, whose English names this remake uses, prints
GX-87 Kilroy. We follow the US designation to match the names.

## Factories and bases

- Factories hold **stored units** — the original's hidden reinforcements.
  Deploy one to the factory hex (if empty); immobile units need a transport.
- Capturing a factory or base (infantry only) transfers it *and its stored
  units* to the captor.
- Moving onto an own building repairs the unit to full strength (its turn is
  spent). Experience is kept.

## Victory

- Capture the enemy base with infantry → instant win.
- Destroy all fielded enemy units → win.
- Turn limit (default 50, per-map override): if it expires, the defender
  (player 2 / Xenon) wins — the original's "complete each scenario within 50
  turns, otherwise you lose."

## Deliberately not reproduced

- **Screen-size limits.** The whole map renders at once; zoom and pan freely;
  maps up to 60×60 in the editor.
- **Fixed roster and level set.** Units, terrain and maps are data; custom
  levels can carry custom unit types inside their JSON.
- **Original assets and map data.** All art is procedural and original; the
  16 campaign missions are original layouts following the original campaign's
  teaching structure (tanks → factories → artillery → air → AA → transports →
  mines → mountains → combined arms).
