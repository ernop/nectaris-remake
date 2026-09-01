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
count). Combat power scales linearly with strength. The UI omits the
number at 8 (the default); damaged units show 1–7. Roster and stats are in
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
  Mountains and valleys are foot/air only. The cost numbers themselves are
  reconstructed (the original's exact cost tables were not published) and are
  plain data for modders to override.
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
2. **Surround** (direct combat only). A unit is surrounded when all six
   adjacent hexes are occupied by, or adjacent to, enemy units; its attack
   and defense are halved. Off-map hexes count toward the surround (map
   edges help the surrounder).
3. **Support** (direct combat only). The attacker adds 50% of each adjacent
   ally-of-the-attacker-next-to-the-defender's attack power; the defender
   adds 50% of each ally-next-to-the-attacker's defense power, capped at 2×
   the defender's post-experience defense. Support uses the ally's relevant
   stat: an ally with no air attack contributes nothing against an air
   target.
4. **Terrain.** The defender's defense rises by the terrain percentage
   (ground units only). If the bonus rounds down to zero, nothing is added.

**Damage roll (reconstructed).** The original's exact casualty formula was
never published. This remake rolls one die per attacker strength point with
kill probability `AP / (AP + DA)`; both sides fire simultaneously in direct
combat, computed from pre-battle strengths. Ranged attacks draw no counter.
The result matches the original's observed feel: even fights at full strength
cost the defender ~3–5 points, outmatched attacks bounce off. Seedable RNG
(`COMBAT.makeRng`) keeps tests and replays deterministic.

**Experience awards (documented):** destroy the defender → attacker +2;
damage without destroying → both +1; fail to damage → defender +2. Max 8;
7–8 stars mean double stats.

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
