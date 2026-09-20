"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js");
  var game = new ENGINE.Game({name: "Forecast", grid: ["........", "..h.....", "........"],
    units: [{t: "BISON", o: 0, x: 1, y: 1, str: 6, exp: 3}, {t: "POLAR", o: 1, x: 2, y: 1, str: 7, exp: 2},
      {t: "BISON", o: 0, x: 2, y: 0}]}, {seed: 991});
  var attacker = game.units[0], defender = game.units[1], before = JSON.stringify(game.snapshot());
  var pv = COMBAT.preview(game, attacker, defender), projection = COMBAT.forecast(attacker, defender, pv);
  ok(projection.samples === 100000 && projection.bins.flat().reduce(function (sum, n) { return sum + n; }, 0) === 100000,
    "joint forecast accounts for all 100,000 independent trials");
  ok(JSON.stringify(game.snapshot()) === before, "forecast preserves strengths, experience, action flags, log and RNG");
  ok(JSON.stringify(projection) === JSON.stringify(COMBAT.forecast(attacker, defender, pv)), "independent forecasts are stable on repeated inspection");
  ok(Math.abs(projection.meanDefenderLoss - COMBAT.expectedCasualties(attacker, defender, pv.attacker.ap, pv.defender.da)) < 0.04 &&
    Math.abs(projection.meanAttackerLoss - COMBAT.expectedCasualties(defender, attacker, pv.defender.ap, pv.attacker.da)) < 0.04,
    "sampled casualty means agree with exhaustive damage expectations");
  ok(pv.attacker.modifiers.supportAttack > 0 && pv.defender.modifiers.terrain === 20,
    "forecast calculation exposes support and terrain modifiers");
  var reference = projection.bins.map(function (row) { return row.map(function () { return 0; }); });
  for (var sample = 0; sample < 100000; sample++) {
    var result = COMBAT.resolve(game, attacker, defender,
      COMBAT.makeRng(Math.imul(sample + 1, 0x9e3779b9) ^ 0xa341316c));
    reference[result.dmgToAttacker][result.dmgToDefender]++;
    attacker.strength = 6; attacker.exp = 3; defender.strength = 7; defender.exp = 2;
  }
  ok(JSON.stringify(reference) === JSON.stringify(projection.bins),
    "all joint bins match 100,000 real combat resolutions using the same independent seeds");
  ok(JSON.stringify(game.snapshot()) === before, "reference simulations leave the original match unchanged after resetting trial units");
  var jointKills = projection.bins[attacker.strength][defender.strength] / projection.samples;
  ok(jointKills === projection.mutualDestruction, "joint grid includes simultaneous destruction probability");
  game.rng(); game.rng();
  ok(JSON.stringify(projection) === JSON.stringify(COMBAT.forecast(attacker, defender, pv)),
    "changing the match's hidden RNG cannot change the forecast");
  attacker.type = global.UNIT_TYPES.HADRIAN; attacker.col = 0;
  pv = COMBAT.preview(game, attacker, defender);
  projection = COMBAT.forecast(attacker, defender, pv);
  ok(!pv.counter && projection.meanAttackerLoss === 0 && projection.attackerDestroyed === 0 &&
    projection.bins.slice(1).flat().every(function (count) { return count === 0; }),
    "indirect fire forecasts have no attacker casualties or counterattack");
  pv.attacker.ap = 0;
  projection = COMBAT.forecast(attacker, defender, pv);
  ok(projection.bins[0][0] === 100000, "zero-damage battle produces one certain outcome");
};
