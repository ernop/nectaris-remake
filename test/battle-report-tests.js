"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var COMBAT = require("../js/combat.js");
  var REPORT = require("../js/battle-report.js");

  var game = new ENGINE.Game({name: "Report", grid: ["........", "........", "........"],
    units: [{t: "BISON", o: 0, x: 1, y: 1, str: 6, exp: 3}, {t: "POLAR", o: 1, x: 2, y: 1, str: 7, exp: 2}]}, {seed: 7});
  var attacker = game.units[0], defender = game.units[1];
  var aBefore = attacker.strength, dBefore = defender.strength, aExp = attacker.exp, dExp = defender.exp;
  var result = game.attack(attacker, defender);
  ok(result.attackerExpBefore === aExp && result.defenderExpBefore === dExp, "result keeps pre-battle experience");
  var parts = REPORT.resultParts(attacker, defender, result, aBefore, dBefore);
  ok(parts.assessed.attack.losses === result.dmgToDefender, "destroyed count is the defender's casualties");
  ok(parts.assessed.counter.losses === result.dmgToAttacker, "lost count is the attacker's casualties");
  ok(parts.assessed.attack.weight >= 2 && parts.assessed.attack.weight <= 10, "the roll is one published table row");
  ok(parts.assessed.attack.exact >= 1 && parts.assessed.attack.tail >= parts.assessed.attack.exact &&
    parts.assessed.attack.rollTail >= parts.assessed.attack.weight && parts.assessed.attack.rollTail <= 100,
    "exact, casualty-tail and roll-tail shares come from the 100-row table");
  var gap = parts.assessed.attack.losses - parts.assessed.attack.expected;
  var verdict = Math.abs(gap) < 0.5 ? "near the average" : gap > 0 ? "above the average" : "below the average";
  ok(parts.assessed.attack.verdict === verdict, "casualty verdict compares this roll with the table average");
  ok(parts.scene.indexOf(parts.assessed.attack.losses + "</strong> destroyed") >= 0 &&
    parts.scene.indexOf(parts.assessed.counter.losses + "</strong> lost") >= 0, "scene states destroyed and lost");
  ok(parts.math.indexOf("Roll <strong>" + parts.assessed.attack.coefficientPercent + "%</strong>") >= 0,
    "math shows the match's actual roll");
  ok(parts.screen.includes("battle-formation-left") && parts.screen.includes("battle-formation-right") &&
    parts.screen.includes("EXP " + aExp + " / 8") && parts.screen.includes("Terrain") &&
    parts.screen.includes(String(result.preview.attacker.ap * aBefore)),
    "battle screen renders opposing formations, pre-battle experience, terrain and total attack");
  var ledger = REPORT.emptyLedger();
  REPORT.record(ledger, attacker.player, parts.assessed);
  ok(ledger[0].attacks === 1 && ledger[0].destroyed === result.dmgToDefender && ledger[0].lost === result.dmgToAttacker &&
    ledger[1].lost === result.dmgToDefender, "ledger gives the attack to the attacker and the losses to the defender");

  var mismatched = false;
  try {
    COMBAT.shotReport({type: attacker.type, strength: aBefore, exp: aExp},
      {type: defender.type, strength: dBefore, exp: dExp}, result.preview.attacker.ap, result.preview.defender.da,
      Object.assign({}, result.attackDamage, {casualties: 99}), true);
  } catch (error) { mismatched = /do not match/.test(error.message); }
  ok(mismatched, "a roll report rejects casualties that disagree with the recorded coefficient");
  var silent = COMBAT.shotReport({type: defender.type, strength: dBefore, exp: dExp},
    {type: attacker.type, strength: aBefore, exp: aExp}, 0, 0, {casualties: 0, coefficientPercent: null}, false);
  ok(!silent.enabled && silent.losses === 0 && silent.verdict === "no roll", "a disabled counter is not a roll");

  var far = new ENGINE.Game({name: "Indirect", grid: ["........", "........", "........"],
    units: [{t: "HADRIAN", o: 0, x: 1, y: 1}, {t: "POLAR", o: 1, x: 4, y: 1}]}, {seed: 3});
  var gun = far.units[0], target = far.units[1], gunBefore = gun.strength, targetBefore = target.strength;
  var ranged = far.attack(gun, target);
  var rangedParts = REPORT.resultParts(gun, target, ranged, gunBefore, targetBefore);
  ok(!ranged.preview.counter && !rangedParts.assessed.counter.enabled && rangedParts.math.indexOf("No counterattack") >= 0,
    "indirect fire reports no counter roll");
  var again = REPORT.present(rangedParts.snapshot);
  ok(again.scene.indexOf("destroyed") >= 0 && again.math.indexOf(rangedParts.assessed.attack.coefficientPercent + "%") >= 0,
    "a stored battle snapshot renders the same roll without the live squads");
};
