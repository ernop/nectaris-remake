/* Nectaris remake — combat resolution.
 *
 * Implements the Japanese community reconstruction of the original combat
 * arithmetic. Support is divided by twice the attacker's strength; terrain
 * adds directly to per-machine defense; surround halves the defender after
 * support and terrain; modified attack and defense cap at 100. Damage is:
 *
 *   unit damage = attack × (100 - defense) / 100
 *   total damage = unit damage × experience × strength × random coefficient
 *
 * Squads use strength × 100 temporary HP, plus 50 HP at strengths 2–8.
 * Intermediate fractions are discarded. Indirect fire receives no support
 * or surround effects and draws no counterattack.
 *
 * The source establishes random-coefficient bounds of 0.2–4.0 but omits the
 * original lookup-table distribution. This implementation samples every
 * integer hundredth in that documented interval uniformly.
 *
 * Experience awards (published table):
 *   attacking:  no damage dealt +0 · damage dealt +1 · target destroyed +2
 *   defending:  no damage taken +2 · damage taken +1 · counter destroys
 *               the attacker +2
 * Infantry additionally gains +4 for capturing a factory (engine's job).
 */
"use strict";

var COMBAT = (function () {
  // Damage coefficients as integer percentages for experience levels 0..8.
  var EXP_DAMAGE = [100, 105, 110, 120, 130, 140, 160, 200, 200];
  var MAX_EXP = 8;
  var MAX_STRENGTH = 8;
  var STAT_CAP = 100;
  var RANDOM_MIN = 20;
  var RANDOM_MAX = 400;

  function experienceBonus(level) {
    if (!Number.isInteger(level) || level < 0 || level > MAX_EXP) {
      throw new Error("Experience level must be an integer from 0 to " + MAX_EXP);
    }
    return {
      damage: EXP_DAMAGE[level] - 100,
      general: level === MAX_EXP,
    };
  }

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

  /* Attack range band against one target domain, or null when the unit
   * cannot attack that domain. Indirect fire (range above 1) cannot hit an
   * adjacent hex, so its band starts at 2. */
  function rangeBand(unitType, targetIsAir) {
    var max = targetIsAir ? (unitType.rngA || 0) : (unitType.rngG || 0);
    if (max < 1 || atkStat(unitType, targetIsAir) <= 0) return null;
    return { min: max > 1 ? 2 : 1, max: max };
  }

  function canAttackAt(unitType, targetIsAir, dist) {
    var band = rangeBand(unitType, targetIsAir);
    return !!band && dist >= band.min && dist <= band.max;
  }

  function capStat(value) {
    return Math.min(STAT_CAP, Math.max(0, Math.floor(value)));
  }

  function terrainValue(game, unit) {
    return isAir(unit) ? 0 : game.terrainAt(unit.col, unit.row).def;
  }

  function attackSupport(game, attacker, defender) {
    var allies = game.adjacentAllies(
      defender.col, defender.row, attacker.player, attacker
    );
    var total = 0;
    for (var i = 0; i < allies.length; i++) {
      total += atkStat(allies[i].type, isAir(defender)) * allies[i].strength;
    }
    return Math.floor(total / (attacker.strength * 2));
  }

  function defenseSupport(game, attacker, defender) {
    var allies = game.adjacentAllies(
      attacker.col, attacker.row, defender.player, defender
    );
    var total = 0;
    for (var i = 0; i < allies.length; i++) {
      total += allies[i].type.def * allies[i].strength;
    }
    return Math.floor(total / (attacker.strength * 2));
  }

  function sideRecord(baseAttack, baseDefense, supportAttack, supportDefense,
                      terrain, surrounded, attackDisabled) {
    var supportedAttack = baseAttack + supportAttack;
    var supportedDefense = baseDefense + supportDefense;
    var terrainDefense = supportedDefense + terrain;
    var finalAttack = attackDisabled ? 0 :
      (surrounded ? Math.floor(baseAttack / 2) : supportedAttack);
    var finalDefense = surrounded ?
      Math.floor(terrainDefense / 2) : terrainDefense;
    finalAttack = capStat(finalAttack);
    finalDefense = capStat(finalDefense);
    return {
      steps: [
        { ap: baseAttack, da: baseDefense, label: "BASE" },
        { ap: supportedAttack, da: supportedDefense, label: "SUPPORT" },
        { ap: supportedAttack, da: terrainDefense, label: "TERRAIN" },
        { ap: finalAttack, da: finalDefense, label: "FINAL" },
      ],
      ap: finalAttack,
      da: finalDefense,
    };
  }

  /* Full battle preview using per-machine modified attack and defense. */
  function preview(game, attacker, defender) {
    var dist = HEX.distance(attacker.col, attacker.row, defender.col, defender.row);
    var ranged = dist > 1;
    var counter = !ranged && canAttackAt(defender.type, isAir(attacker), dist);
    var aSupport = ranged ? 0 : attackSupport(game, attacker, defender);
    var dSupport = ranged ? 0 : defenseSupport(game, attacker, defender);
    var surrounded = !ranged && game.isSurrounded(defender);
    var a = sideRecord(
      atkStat(attacker.type, isAir(defender)), attacker.type.def,
      aSupport, 0, terrainValue(game, attacker), false, false
    );
    var d = sideRecord(
      atkStat(defender.type, isAir(attacker)), defender.type.def,
      0, dSupport, terrainValue(game, defender), surrounded, !counter
    );
    return { attacker: a, defender: d, ranged: ranged, counter: counter, dist: dist };
  }

  function randomCoefficient(rng) {
    var roll = rng();
    if (typeof roll !== "number" || roll < 0 || roll >= 1) {
      throw new Error("Combat RNG must return a number from 0 up to but not including 1");
    }
    return RANDOM_MIN + Math.floor(roll * (RANDOM_MAX - RANDOM_MIN + 1));
  }

  function damageResult(shooter, target, modifiedAttack, modifiedDefense,
                        coefficient) {
    var unitDamage = Math.floor(
      modifiedAttack * (STAT_CAP - modifiedDefense) / STAT_CAP
    );
    var experiencedDamage = Math.floor(
      unitDamage * EXP_DAMAGE[shooter.exp] / 100
    );
    var totalDamage = Math.floor(
      experiencedDamage * shooter.strength * coefficient / 100
    );
    var hitPoints = target.strength * 100 + (target.strength > 1 ? 50 : 0);
    var remaining = Math.floor(Math.max(0, hitPoints - totalDamage) / 100);
    return {
      casualties: target.strength - remaining,
      unitDamage: unitDamage,
      totalDamage: totalDamage,
      coefficient: coefficient / 100,
    };
  }

  function expectedCasualties(shooter, target, modifiedAttack, modifiedDefense) {
    var total = 0;
    for (var coefficient = RANDOM_MIN; coefficient <= RANDOM_MAX; coefficient++) {
      total += damageResult(
        shooter, target, modifiedAttack, modifiedDefense, coefficient
      ).casualties;
    }
    return total / (RANDOM_MAX - RANDOM_MIN + 1);
  }

  /* Resolve a battle. Mutates unit strengths/experience; removal of dead
   * units is the engine's job. Returns a result record for UI/log. */
  function resolve(game, attacker, defender, rng) {
    var pv = preview(game, attacker, defender);
    var aStr0 = attacker.strength, dStr0 = defender.strength;

    // Both damage totals use pre-battle strengths.
    var attackDamage = damageResult(
      attacker, defender, pv.attacker.ap, pv.defender.da, randomCoefficient(rng)
    );
    var counterDamage = pv.counter ? damageResult(
      defender, attacker, pv.defender.ap, pv.attacker.da, randomCoefficient(rng)
    ) : { casualties: 0, unitDamage: 0, totalDamage: 0, coefficient: null };
    var dmgToDefender = attackDamage.casualties;
    var dmgToAttacker = counterDamage.casualties;

    defender.strength = dStr0 - dmgToDefender;
    attacker.strength = aStr0 - dmgToAttacker;

    // Published experience awards. Attacking: +0 for no damage, +1 for
    // damage, +2 for a kill. Defending: +2 when unhurt, +1 when hurt, +2
    // when the counterattack destroys the attacker outright.
    if (defender.strength === 0) {
      attacker.exp = Math.min(MAX_EXP, attacker.exp + 2);
    } else if (dmgToDefender > 0) {
      attacker.exp = Math.min(MAX_EXP, attacker.exp + 1);
      defender.exp = Math.min(MAX_EXP, defender.exp + (attacker.strength === 0 ? 2 : 1));
    } else {
      defender.exp = Math.min(MAX_EXP, defender.exp + 2);
    }

    return {
      preview: pv,
      dmgToDefender: dmgToDefender,
      dmgToAttacker: dmgToAttacker,
      attackDamage: attackDamage,
      counterDamage: counterDamage,
      attackerDead: attacker.strength === 0,
      defenderDead: defender.strength === 0,
    };
  }

  return {
    preview: preview, resolve: resolve, makeRng: makeRng,
    atkStat: atkStat, isAir: isAir,
    rangeBand: rangeBand, canAttackAt: canAttackAt,
    experienceBonus: experienceBonus, expectedCasualties: expectedCasualties,
    MAX_EXP: MAX_EXP, MAX_STRENGTH: MAX_STRENGTH,
    EXP_DAMAGE: EXP_DAMAGE,
    /* Full strength is the default squad size; UI must not print it. */
    strengthCaption: function (n) { return n < MAX_STRENGTH ? String(n) : null; },
  };
})();

if (typeof module !== "undefined") {
  if (typeof HEX === "undefined") global.HEX = require("./hex.js");
  module.exports = COMBAT;
}
