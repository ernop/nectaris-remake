# Mechanics reconstruction

How this remake implements the original's rules, and where each rule comes
from. "Documented" means published community documentation of the original
game's behavior (StrategyWiki's *Military Madness/Combat* page, player-written
FAQs, the game's published manual, and Japanese community ROM analysis).
Everything here is data-driven: the tables live in
`js/data-*.js` and the pipeline in `js/combat.js` / `js/engine.js`.

## Version provenance policy (2026-09-03)

Nectaris releases may differ in mechanics as well as maps and campaigns.
Accordingly, “the original game” is not sufficient provenance for a rule.
Every adopted mechanic must identify the platform, region and release when the
source provides them. Evidence from the 1989 PC Engine release, TurboGrafx-16
localization, 1997 Windows remake, PlayStation release and later ports must not
be treated as interchangeable.

The current remake is a documented composite: English unit names come from the
TurboGrafx-16 localization; campaign data comes from Hudson's 1997 Windows PC
Engine remake; individual mechanics cite their own evidence below. When two
versions disagree, preserve both findings in this document and make the chosen
behavior an explicit product decision rather than silently replacing one
version's rule with another. A source from an unidentified version remains
unresolved evidence, not confirmation of the implemented behavior.

## Units

Each unit is a squad with a **strength** of 1–8 (the original's sub-unit
count). Combat power scales linearly with strength. The UI omits the
number at 8 (the default); damaged units show 1–7. Roster and stats are in
`js/data-units.js` — 22 types: 3 infantry (the only capturers), 7 tanks,
3 aircraft, 3 artillery, 2 missile buggies, 2 anti-air, 2 transports, 1 mine.

Special behaviors (all documented):

- **Infantry** capture factories and bases by moving onto them.
- **Ranged units** (artillery, Hawkeye): may move *or* fire each turn, never
  both; their attacks receive no counterattack, and they cannot counterattack.
  Minimum range 2 — adjacent enemies are safe from them.
- **Missile buggies** (Rabbit, Lynx) may split one movement allowance around
  one attack: move, attack once, then spend any remaining movement. A second
  attack in the same turn is rejected. The enemy AI uses its remaining
  movement to increase distance from the nearest opposing unit.
- **Transports** (Mule ground, Pelican air) carry one ground unit. Loading:
  the passenger moves onto the transport's hex. Unloading: to an adjacent
  passable, empty hex; the passenger's turn is spent.
- **Atlas and Trigger** are immobile; they only leave a factory by deploying
  directly into an empty Mule or Pelican on one of the six adjacent hexes. A
  level file may also place them directly.
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
penalizes only the defender and never at the map edge; defender experience
awards +2 when its counterattack destroys the attacker; infantry earns +4
experience for capturing a factory.

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

## Combat: community-recovered original formula

The remake uses the arithmetic reconstructed by contributors to a 2ch
Nectaris thread and summarized in
[戦闘結果計算式](http://anka.sakura.ne.jp/nectaris/d3.html). Every intermediate
fraction is discarded:

1. **Support** (direct combat only). Attack support is the sum of each
   supporting squad's relevant base attack times its strength, divided by
   twice the attacker's strength. Defense support uses each supporting
   squad's base defense and the same denominator. Consequently, defense
   support becomes stronger when a damaged squad initiates the attack.
2. **Modified values.** The attacker's attack is base attack plus attack
   support. Defense is base defense plus the terrain's additive defense value
   and, for the defender, defense support. Attack and defense each cap at 100.
   Air units receive no terrain defense.
3. **Surround** (direct combat, defender only). A surrounded defender's base
   attack is halved. Its defense is halved after support and terrain have been
   added. A surrounded squad that initiates combat is not penalized, and a
   squad against the map edge cannot be surrounded because off-map hexes
   carry no ZOC.
4. **Damage.** Per-machine damage is
   `attack × (100 − defense) / 100`. Total damage is per-machine damage times
   attacker experience, attacker strength, and one random coefficient.
   Experience coefficients are 1.00, 1.05, 1.10, 1.20, 1.30, 1.40, 1.60,
   2.00 and 2.00; experience does not increase defense.
5. **Casualties.** Temporary HP is `strength × 100 + 50` for squads at
   strength 2–8 and exactly 100 for a one-machine squad. Remaining strength
   is `(temporary HP − total damage) / 100`, floored at zero. This makes a
   one-machine squad die from any positive damage.

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

The recovered source gives the random coefficient's 0.2–4.0 bounds but not
the original lookup-table distribution. The executable implementation samples
the 381 integer hundredths from 0.20 through 4.00 uniformly. This preserves
the documented range and shared battle-level multiplier without claiming the
unknown original probabilities. Direct attacks compute both sides from their
pre-battle strengths; ranged attacks receive no counterattack.

**Experience awards (published table):** attacking — no damage +0, damage +1,
kill +2. Defending — unhurt +2, hurt +1, counterattack destroys the attacker
+2. Infantry earns +4 for capturing a factory. Max 8; the 7→8 step adds no
stats, so 7 is the effective ceiling.

The map groups levels 1–7 into 3/2/3 star columns; level 8 replaces the
columns with the General star. The selected-unit panel and battle preview
state each level's damage bonus.

One naming note: the Japanese unit page designates the heavy infantry GX-78
(ダーベック); the US release, whose English names this remake uses, prints
GX-87 Kilroy. We follow the US designation to match the names.

## Factories and bases

(Corrected 2026-09-02 against the published factory rules — the terrain page's
「工場の上にユニットを停止させれば自動的に格納されます」 and the TG-16 FAQ's
"deploy the unit onto the space the transport occupies".)

- Factories hold **stored units**. Clicking an owned factory with ready stored
  units opens the stored-unit list. After choosing one unit, choose its
  destination from the highlighted hexes surrounding the factory.
- A terrain destination must be one of the six adjacent hexes, unoccupied, and
  marked `deployable` by its terrain type. Alternatively, a stored ground unit
  can deploy directly into an adjacent friendly Mule or Pelican with an empty
  cargo slot. Atlas and Trigger have only the transport option. Deploying by
  either method spends the stored unit's turn, so it cannot move or attack
  immediately.
- **Stopping a ground unit on a factory you already own stores it**: it
  leaves the field, is repaired to full (experience kept), and can deploy
  again from your next turn on — so a repair costs the two turns of entering
  and leaving, as in the original. There is no on-hex repair, and bases never
  store or repair.
- A factory you do not own can be passed through but not stopped on —
  except by infantry, whose stopping there *is* the capture. The capturer
  goes inside the newly owned factory and disappears from the map. It is
  repaired, keeps its experience, and cannot redeploy until its next turn.
  Capturing also transfers every unit already stored there to the new owner
  and awards the infantry +4 experience. Previously stored units that have
  not acted are immediately eligible to deploy.
- A transport carrying cargo cannot stop on its own factory (it will not
  fit); unloading cargo onto your factory hex stores the cargo directly.

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
- **Original assets.** All art is procedural and original. The 16 campaign
  missions reproduce the terrain, deployments and factory inventories built
  into Hudson's official 1997 Windows PC Engine remake; no original bitmap or
  audio asset is included.
