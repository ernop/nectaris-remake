/* Nectaris remake — combat resolution.
 *
 * Reimplements the original 4-step combat calculator as documented by the
 * community (StrategyWiki "Military Madness/Combat" and player FAQs):
 *
 *   step 1  experience:  per-strength base attack (BuA) and defense (BuD)
 *           are raised by the experience tier table; results floored.
 *   step 2  surround:    direct combat only. A unit is "surrounded" when all
 *           six hexes adjacent to it are occupied by, or adjacent to, enemy
 *           units. A surrounded unit's BuA and BuD are halved (floored).
 *   step 3  support:     direct combat only. The attacker gains attack power
 *           equal to 50% of the (unmodified) relevant attack power of each
 *           of its allies adjacent to the defender; the defender gains
 *           defense power equal to 50% of the base defense power of each of
 *           its allies adjacent to the attacker. Defender's total defense is
 *           capped at 2x its post-experience value.
 *   step 4  terrain:     defender's defense is raised by the terrain defense
 *           percentage (ground units only; air units get no terrain bonus).
 *           If the bonus doesn't amount to a whole point, nothing is added.
 *
 * Final combat power:  Attack Power = strength x BuA (+support),
 *                      Defense Ability = strength x BuD (+support, terrain).
 *
 * Casualties: the exact original damage roll was never published. This
 * reconstruction rolls one die per attacker strength point with kill
 * probability AP / (AP + DA), which reproduces the original's observed feel
 * (even fights at full strength cost the defender 3-5 points; badly
 * outmatched attacks bounce off). Both sides fire simultaneously in direct
 * combat, computed from pre-battle strengths; ranged attacks draw no
 * counterattack.
 *
 * Experience awards (documented): attacker destroys defender -> attacker +2;
 * attacker damages defender -> both +1; attacker fails to damage -> defender +2.
 */
"use strict";

var COMBAT = (function () {
  // Experience tier table: [atk%, def%] added at each level 0..8.
  var EXP_ATK = [0, 4, 10, 20, 30, 40, 60, 100, 100];
  var EXP_DEF = [0, 5, 10, 20, 30, 40, 60, 100, 100];
  var MAX_EXP = 8;
  var MAX_STRENGTH = 8;

  /* Mulberry32 — small seedable PRNG so replays/tests are deterministic. */
  function makeRng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Relevant per-strength attack stat of `unit` against `target`. */
  function atkStat(unitType, targetIsAir) {
    return targetIsAir ? (unitType.atkA || 0) : (unitType.atkG || 0);
  }

  function isAir(unit) { return unit.type.moveType === "air"; }

  /* Compute one side's combat values through the 4 steps.
   * ctx: { game, attacker, defender, ranged }
   * side: "attacker" | "defender"
   * Returns { steps:[{ap,da,label}...], ap, da } — steps power the original-style
   * flashing battle preview. */
  function computeSide(ctx, side) {
    var game = ctx.game;
    var me = side === "attacker" ? ctx.attacker : ctx.defender;
    var foe = side === "attacker" ? ctx.defender : ctx.attacker;
    var t = me.type;
    var foeAir = isAir(foe);

    var steps = [];
    // Step 1: experience.
    var buA = Math.floor(atkStat(t, foeAir) * (1 + EXP_ATK[me.exp] / 100));
    var buD = Math.floor(t.def * (1 + EXP_DEF[me.exp] / 100));
    var ap = buA * me.strength;
    var da = buD * me.strength;
    steps.push({ ap: ap, da: da, label: "EXP" });

    // Step 2: surround (direct combat only).
    if (!ctx.ranged) {
      if (game.isSurrounded(me)) {
        buA = Math.floor(buA / 2);
        buD = Math.floor(buD / 2);
        ap = buA * me.strength;
        da = buD * me.strength;
      }
    }
    steps.push({ ap: ap, da: da, label: "SURROUND" });

    // Step 3: support (direct combat only).
    var expDa = da; // post-experience/surround defense: cap reference
    if (!ctx.ranged) {
      var i, ally;
      if (side === "attacker") {
        var allies = game.adjacentAllies(foe.col, foe.row, me.player, me);
        for (i = 0; i < allies.length; i++) {
          ally = allies[i];
          ap += Math.floor(0.5 * atkStat(ally.type, foeAir) * ally.strength);
        }
      } else {
        var backers = game.adjacentAllies(foe.col, foe.row, me.player, me);
        for (i = 0; i < backers.length; i++) {
          ally = backers[i];
          da += Math.floor(0.5 * ally.type.def * ally.strength);
        }
        if (da > expDa * 2) da = expDa * 2;
      }
    }
    steps.push({ ap: ap, da: da, label: "SUPPORT" });

    // Step 4: terrain (defense only; never for air units).
    if (!isAir(me)) {
      var terr = game.terrainAt(me.col, me.row);
      var bonus = Math.floor(da * terr.def / 100);
      da += bonus;
    }
    steps.push({ ap: ap, da: da, label: "TERRAIN" });

    return { steps: steps, ap: ap, da: da };
  }

  /* Full battle preview: both sides' step tables plus whether the defender
   * will counterattack. */
  function preview(game, attacker, defender) {
    var dist = HEX.distance(attacker.col, attacker.row, defender.col, defender.row);
    var ranged = dist > 1;
    var ctx = { game: game, attacker: attacker, defender: defender, ranged: ranged };
    var a = computeSide(ctx, "attacker");
    var d = computeSide(ctx, "defender");
    var counter = !ranged &&
      defender.type.rmax >= 1 && defender.type.rmin <= 1 &&
      atkStat(defender.type, isAir(attacker)) > 0;
    return { attacker: a, defender: d, ranged: ranged, counter: counter, dist: dist };
  }

  function rollKills(rng, shooters, ap, da) {
    if (ap <= 0) return 0;
    var p = ap / (ap + da);
    var kills = 0;
    for (var i = 0; i < shooters; i++) if (rng() < p) kills++;
    return kills;
  }

  /* Resolve a battle. Mutates unit strengths/experience; removal of dead
   * units is the engine's job. Returns a result record for UI/log. */
  function resolve(game, attacker, defender, rng) {
    var pv = preview(game, attacker, defender);
    var aStr0 = attacker.strength, dStr0 = defender.strength;

    // Simultaneous fire from pre-battle strengths.
    var dmgToDefender = rollKills(rng, aStr0, pv.attacker.ap, pv.defender.da);
    var dmgToAttacker = pv.counter ? rollKills(rng, dStr0, pv.defender.ap, pv.attacker.da) : 0;

    defender.strength = Math.max(0, dStr0 - dmgToDefender);
    attacker.strength = Math.max(0, aStr0 - dmgToAttacker);

    // Documented experience awards.
    if (defender.strength === 0) {
      attacker.exp = Math.min(MAX_EXP, attacker.exp + 2);
    } else if (dmgToDefender > 0) {
      attacker.exp = Math.min(MAX_EXP, attacker.exp + 1);
      defender.exp = Math.min(MAX_EXP, defender.exp + 1);
    } else {
      defender.exp = Math.min(MAX_EXP, defender.exp + 2);
    }

    return {
      preview: pv,
      dmgToDefender: dmgToDefender,
      dmgToAttacker: dmgToAttacker,
      attackerDead: attacker.strength === 0,
      defenderDead: defender.strength === 0,
    };
  }

  return {
    preview: preview, resolve: resolve, makeRng: makeRng,
    atkStat: atkStat, isAir: isAir,
    MAX_EXP: MAX_EXP, MAX_STRENGTH: MAX_STRENGTH,
    EXP_ATK: EXP_ATK, EXP_DEF: EXP_DEF,
    /* Full strength is the default squad size; UI must not print it. */
    strengthCaption: function (n) { return n < MAX_STRENGTH ? String(n) : null; },
  };
})();

if (typeof module !== "undefined") {
  if (typeof HEX === "undefined") global.HEX = require("./hex.js");
  module.exports = COMBAT;
}
