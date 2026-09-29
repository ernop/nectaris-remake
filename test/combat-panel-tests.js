/* The combat board's counted-up numbers end on the values the battle uses. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js"), PANEL = require("../js/combat-panel.js");
  var types = Object.keys(UNIT_TYPES).filter(function (id) { return ["ATLAS", "TRIGGER", "PELICAN"].indexOf(id) < 0; });
  var shown = 0;
  types.forEach(function (attackerType) {
    types.forEach(function (defenderType) {
      var game = new ENGINE.Game({name: "Panel", grid: Array(7).fill("..........."), units: [
        {t: attackerType, o: 0, x: 5, y: 2, str: 6, exp: 3}, {t: defenderType, o: 1, x: 5, y: 3, str: 7, exp: 6},
        {t: "BISON", o: 0, x: 5, y: 4, str: 5}, {t: "BISON", o: 1, x: 5, y: 1, str: 3},
        {t: "POLAR", o: 0, x: 4, y: 3}, {t: "POLAR", o: 1, x: 6, y: 3}]}, {seed: 1});
      var a = game.units[0], d = game.units[1];
      if (game.legalAttackTargets(a).indexOf(d) < 0) return;
      shown++;
      var pv = COMBAT.preview(game, a, d), m = PANEL.build(a, d, pv);
      var end = PANEL.state(m, Infinity), rows = m.sides.map(function (s, i) { return end.sides[i].rows.final; });
      ok(rows[0].atk === pv.attacker.ap * a.strength && rows[0].def === pv.attacker.da &&
        rows[1].def === pv.defender.da && rows[1].atk === (pv.counter ? pv.defender.ap * d.strength : null) &&
        end.supportersShown === m.supporters.length,
        attackerType + " vs " + defenderType + ": the final row is the battle's attack total and defense");
      var boost = function (unit) { return COMBAT.EXP_DAMAGE[unit.exp]; };
      var bonus = end.sides.map(function (side) { return side.rows.experience; });
      ok(bonus[0].atk === Math.floor(pv.attacker.ap * boost(a) / 100) * a.strength && bonus[0].def === pv.attacker.da &&
        bonus[1].def === pv.defender.da && bonus[1].atk === (pv.counter ? Math.floor(pv.defender.ap * boost(d) / 100) * d.strength : null),
        attackerType + " vs " + defenderType + ": the experience row is the final attack times the damage multiplier, defense unchanged");
      ok(PANEL.previewHtml(m, null).includes("Experience ×1.20") && PANEL.previewHtml(m, null).includes("Experience ×1.60"),
        attackerType + " vs " + defenderType + ": each side's row names its own multiplier");
      var last = -1;
      [0, m.time.baseEnd - 1, m.time.baseEnd, m.time.supportEnd, m.time.terrainEnd, m.time.ringEnd, m.time.finalAt, m.time.experienceEnd].forEach(function (t) {
        var atk = PANEL.state(m, t).sides[0].rows, count = Object.keys(atk).length;
        ok(count >= last, attackerType + " vs " + defenderType + ": rows only appear, never vanish, as the count runs");
        last = count;
      });
    });
  });
  var plain = new ENGINE.Game({name: "Plain", grid: ["....", "....", "...."], units: [
    {t: "BISON", o: 0, x: 1, y: 1}, {t: "POLAR", o: 1, x: 2, y: 1}]}, {seed: 1});
  var quiet = PANEL.build(plain.units[0], plain.units[1], COMBAT.preview(plain, plain.units[0], plain.units[1]));
  ok(!PANEL.previewHtml(quiet, null).includes("Experience") && quiet.time.experienceEnd === quiet.time.finalAt,
    "squads without experience have no experience row and no extra time");
  ok(shown > 100, "the sweep covers the roster's attacking pairs");
};
