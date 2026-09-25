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
 * Random coefficients follow Anka's published weighted table, checked by
 * its author against PCE, Windows and PS battles (nectaris/d5.html).
 * The original PRNG and any correlation between opposing rolls are unknown.
 *
 * Experience awards (published table):
 *   attacking:  no damage dealt +0 · damage dealt +1 · target destroyed +2
 *   defending:  no damage taken +2 · damage taken +1
 * Infantry additionally gains +4 for capturing a factory (engine's job).
 */
"use strict";

var COMBAT = (function () {
  // Damage coefficients as integer percentages for experience levels 0..8.
  var EXP_DAMAGE = [100, 105, 110, 120, 130, 140, 160, 200, 200];
  var MAX_EXP = 8;
  var MAX_STRENGTH = 8;
  var STAT_CAP = 100;
  // [damage percentage, probability percentage]. Integer buckets avoid
  // floating-point boundary drift; resolution, forecasts and AI share them.
  var RANDOM_WEIGHTS = [[20,3], [50,7], [60,8], [70,9], [80,6], [90,9],
    [100,10], [110,10], [120,6], [130,9], [140,10], [150,6], [200,5], [400,2]];
  var RANDOM_BUCKETS = [], RANDOM_INDICES = [];
  RANDOM_WEIGHTS.forEach(function (entry, index) {
    for (var i = 0; i < entry[1]; i++) {
      RANDOM_BUCKETS.push(entry[0]); RANDOM_INDICES.push(index);
    }
  });

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
    var rng = function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.getState = function () { return s; };
    return rng;
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
      modifiers: { supportAttack: supportAttack, supportDefense: supportDefense,
        terrain: terrain, surrounded: surrounded, attackDisabled: attackDisabled },
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
    return { attacker: a, defender: d, ranged: ranged, counter: counter, dist: dist,
      surrounded: surrounded, attackerTerrain: game.terrainAt(attacker.col, attacker.row).name,
      defenderTerrain: game.terrainAt(defender.col, defender.row).name,
      tactical: {
        attackerInZOC: game.inEnemyZOC(attacker.col, attacker.row, attacker.player),
        defenderInZOC: game.inEnemyZOC(defender.col, defender.row, defender.player),
        attackSupporters: ranged ? [] : game.adjacentAllies(defender.col, defender.row, attacker.player, attacker).map(function (u) {
          return {name: u.type.name, typeId:u.typeId, player:u.player, exp:u.exp, strength: u.strength, value: atkStat(u.type, isAir(defender))};
        }),
        defenseSupporters: ranged ? [] : game.adjacentAllies(attacker.col, attacker.row, defender.player, defender).map(function (u) {
          return {name: u.type.name, typeId:u.typeId, player:u.player, exp:u.exp, strength: u.strength, value: u.type.def};
        }),
      } };
  }

  function randomCoefficient(rng) {
    var roll = rng();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
      throw new Error("Combat RNG must return a number from 0 up to but not including 1");
    }
    return RANDOM_BUCKETS[Math.floor(roll * RANDOM_BUCKETS.length)];
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
      coefficientPercent: coefficient,
    };
  }

  function expectedCasualties(shooter, target, modifiedAttack, modifiedDefense) {
    var total = 0;
    for (var i = 0; i < RANDOM_WEIGHTS.length; i++) {
      total += damageResult(
        shooter, target, modifiedAttack, modifiedDefense, RANDOM_WEIGHTS[i][0]
      ).casualties * RANDOM_WEIGHTS[i][1];
    }
    return total / RANDOM_BUCKETS.length;
  }

  /* The match's actual roll, read against the published 100-row table.
   * `shooter` and `target` must be the pre-battle squads: experience awards
   * and casualties are applied before a battle result reaches the UI. */
  function shotReport(shooter, target, attack, defense, damage, enabled) {
    if (!enabled) {
      return {enabled: false, losses: 0, expected: 0, exact: 100, tail: 100,
        coefficientPercent: null, weight: 0, rollTail: 100, verdict: "no roll",
        unitDamage: 0, totalDamage: 0, gap: 0};
    }
    if (!damage || !Number.isInteger(damage.coefficientPercent)) {
      throw new Error("Battle roll is missing its table percentage");
    }
    var coeff = damage.coefficientPercent, weight = 0, rollTail = 0, exact = 0, tail = 0, found = false;
    for (var i = 0; i < RANDOM_WEIGHTS.length; i++) {
      var entry = RANDOM_WEIGHTS[i];
      var loss = damageResult(shooter, target, attack, defense, entry[0]).casualties;
      if (entry[0] === coeff) { weight = entry[1]; found = true; }
      if (entry[0] >= coeff) rollTail += entry[1];
      if (loss === damage.casualties) exact += entry[1];
      if (loss >= damage.casualties) tail += entry[1];
    }
    if (!found) throw new Error("Battle roll " + coeff + "% is not in the damage table");
    if (damage.casualties !== damageResult(shooter, target, attack, defense, coeff).casualties) {
      throw new Error("Battle losses do not match the recorded roll");
    }
    var expected = expectedCasualties(shooter, target, attack, defense);
    var gap = damage.casualties - expected;
    return {enabled: true, losses: damage.casualties, expected: expected, exact: exact, tail: tail,
      coefficientPercent: coeff, weight: weight, rollTail: rollTail,
      verdict: Math.abs(gap) < 0.5 ? "near the average" : gap > 0 ? "above the average" : "below the average",
      unitDamage: damage.unitDamage, totalDamage: damage.totalDamage, gap: gap};
  }

  /* Exact public chance model for planners. No match RNG access, sampling or
   * duplicated combat arithmetic. Merge roll buckets with identical losses. */
  function distribution(game, attacker, defender) {
    var pv = preview(game, attacker, defender);
    function marginal(shooter, target, ap, da, enabled) {
      var losses = {};
      if (!enabled) return [{loss: 0, probability: 1}];
      RANDOM_WEIGHTS.forEach(function (entry) {
        var loss = damageResult(shooter, target, ap, da, entry[0]).casualties;
        losses[loss] = (losses[loss] || 0) + entry[1] / 100;
      });
      return Object.keys(losses).map(function (loss) { return {loss: +loss, probability: losses[loss]}; });
    }
    var outgoing = marginal(attacker, defender, pv.attacker.ap, pv.defender.da, true);
    var incoming = marginal(defender, attacker, pv.defender.ap, pv.attacker.da, pv.counter);
    var outcomes = [], out = 0, in_ = 0, kill = 0, death = 0;
    outgoing.forEach(function (a) {
      out += a.loss * a.probability;
      if (a.loss === defender.strength) kill += a.probability;
      incoming.forEach(function (d) {
        outcomes.push({defenderLoss: a.loss, attackerLoss: d.loss, probability: a.probability * d.probability});
      });
    });
    incoming.forEach(function (d) {
      in_ += d.loss * d.probability;
      if (d.loss === attacker.strength) death += d.probability;
    });
    return {out: out, in_: in_, kill: kill, death: death, outcomes: outcomes, preview: pv};
  }

  // The seeds and coefficient weights do not depend on either squad. Count
  // each sampled pair once, then map the 14 x 14 counts onto battle losses.
  // This preserves every simulated outcome, including finite-sample noise;
  // it is not an analytic probability approximation. Keep at most two tables.
  var defaultRollCounts = null, otherRollCounts = null;
  function forecastRollCounts(samples) {
    var cached = samples === 100000 ? defaultRollCounts : otherRollCounts;
    if (cached && cached.samples === samples) return cached.counts;
    var size = RANDOM_WEIGHTS.length, counts = new Uint32Array(size * size);
    for (var i = 0; i < samples; i++) {
      var rng = makeRng(Math.imul(i + 1, 0x9e3779b9) ^ 0xa341316c);
      var attack = RANDOM_INDICES[Math.floor(rng() * RANDOM_BUCKETS.length)];
      var counter = RANDOM_INDICES[Math.floor(rng() * RANDOM_BUCKETS.length)];
      counts[attack * size + counter]++;
    }
    cached = { samples: samples, counts: counts };
    if (samples === 100000) defaultRollCounts = cached;
    else otherRollCounts = cached;
    return counts;
  }

  /* A joint casualty forecast, deliberately accepting no game or match RNG.
   * Each trial has its own fixed simulation seed, independent of actual play.
   * Precomputed damage uses the same formula and pre-battle strengths as resolve. */
  function forecast(attacker, defender, pv, samples) {
    samples = samples === undefined ? 100000 : samples;
    if (!Number.isInteger(samples) || samples < 1 || samples > 1000000) {
      throw new Error("Forecast sample count must be between 1 and 1000000");
    }
    var attackLosses = [], counterLosses = [], bins = [];
    for (var a = 0; a <= attacker.strength; a++) bins.push(new Array(defender.strength + 1).fill(0));
    for (var bucket = 0; bucket < RANDOM_WEIGHTS.length; bucket++) {
      var c = RANDOM_WEIGHTS[bucket][0];
      attackLosses.push(damageResult(attacker, defender, pv.attacker.ap, pv.defender.da, c).casualties);
      counterLosses.push(pv.counter ? damageResult(defender, attacker, pv.defender.ap, pv.attacker.da, c).casualties : 0);
    }
    var totalA = 0, totalD = 0, lostA = 0, lostD = 0, mutual = 0;
    var coefficients = RANDOM_WEIGHTS.length, counts = forecastRollCounts(samples);
    for (var i = 0; i < coefficients; i++) {
      for (var j = 0; j < coefficients; j++) {
        var count = counts[i * coefficients + j];
        var dLoss = attackLosses[i], aLoss = counterLosses[j];
        bins[aLoss][dLoss] += count;
        totalA += aLoss * count; totalD += dLoss * count;
        if (aLoss === attacker.strength) lostA += count;
        if (dLoss === defender.strength) lostD += count;
        if (aLoss === attacker.strength && dLoss === defender.strength) mutual += count;
      }
    }
    return { samples: samples, bins: bins,
      meanAttackerLoss: totalA / samples, meanDefenderLoss: totalD / samples,
      attackerDestroyed: lostA / samples, defenderDestroyed: lostD / samples,
      mutualDestruction: mutual / samples };
  }

  /* Resolve a battle. Mutates unit strengths/experience; removal of dead
   * units is the engine's job. Returns a result record for UI/log. */
  function resolve(game, attacker, defender, rng) {
    var pv = preview(game, attacker, defender);
    var aStr0 = attacker.strength, dStr0 = defender.strength;
    var aExp0 = attacker.exp, dExp0 = defender.exp;

    // Both damage totals use pre-battle strengths.
    var attackDamage = damageResult(
      attacker, defender, pv.attacker.ap, pv.defender.da, randomCoefficient(rng)
    );
    var counterDamage = pv.counter ? damageResult(
      defender, attacker, pv.defender.ap, pv.attacker.da, randomCoefficient(rng)
    ) : { casualties: 0, unitDamage: 0, totalDamage: 0, coefficient: null, coefficientPercent: null };
    var dmgToDefender = attackDamage.casualties;
    var dmgToAttacker = counterDamage.casualties;

    defender.strength = dStr0 - dmgToDefender;
    attacker.strength = aStr0 - dmgToAttacker;

    // Published experience awards. Attacking: +0 for no damage, +1 for
    // damage, +2 for a kill. Defending: +2 when unhurt, +1 when hurt.
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
      attackDamage: attackDamage,
      counterDamage: counterDamage,
      attackerDead: attacker.strength === 0,
      defenderDead: defender.strength === 0,
      attackerExpBefore: aExp0,
      defenderExpBefore: dExp0,
    };
  }

  return {
    preview: preview, resolve: resolve, makeRng: makeRng,
    atkStat: atkStat, isAir: isAir,
    rangeBand: rangeBand, canAttackAt: canAttackAt,
    experienceBonus: experienceBonus, expectedCasualties: expectedCasualties, shotReport: shotReport, distribution: distribution,
    forecast: forecast,
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
