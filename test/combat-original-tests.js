/* Support, surround, casualties and carrier losses against recorded
 * original-game evidence (tools/trace-original-combat.py). */
"use strict";
var assert = require("node:assert/strict");
var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js");
var original = require("./fixtures/windows-combat.json");

function run(ok) {
  function test(label, body) {
    try { body(); ok(true, label); }
    catch (error) { ok(false, label + ": " + error.message); }
  }
  function ascending(a, b) { return a - b; }
  // Roll for each table percentage, found through the public resolver so the
  // weights are not copied here.
  var rollFor = {};
  var probe = new ENGINE.Game({name: "Roll probe", grid: ["..."],
    units: [{t: "BISON", o: 0, x: 0, y: 0}, {t: "BISON", o: 1, x: 1, y: 0}]});
  for (var bucket = 0; bucket < 100; bucket++) {
    var roll = (bucket + 0.5) / 100;
    probe.units[0].strength = probe.units[1].strength = 8;
    var percent = COMBAT.resolve(probe, probe.units[0], probe.units[1],
      function () { return roll; }).attackDamage.coefficientPercent;
    if (!(percent in rollFor)) rollFor[percent] = roll;
  }
  function build(fixture) {
    var g = new ENGINE.Game({name: fixture.name, grid: fixture.grid, units: fixture.units.map(function (u) {
      return {t: u.t, o: u.o, x: u.x, y: u.y, str: u.str};
    })}, {seed: 1});
    fixture.units.forEach(function (definition, i) {
      var u = g.units[i];
      u.exp = definition.exp || 0;
      if (definition.in !== undefined) {
        var carrier = g.units[definition.in];
        carrier.cargo.push(u);
        u.carriedBy = carrier.id; u.col = carrier.col; u.row = carrier.row;
      }
    });
    return g;
  }

  original.cases.forEach(function (fixture) {
    test("original Windows combat: " + fixture.name, function () {
      var g = build(fixture), units = g.units.slice();
      var attacker = units[fixture.attacker], defender = units[fixture.defender];
      var effects = fixture.effects, pv = COMBAT.preview(g, attacker, defender);
      assert.equal(pv.ranged, fixture.indirect, "direct or indirect fire");
      assert.equal(pv.attacker.modifiers.supportAttack, effects.attackSupport, "attack support");
      assert.equal(pv.defender.modifiers.supportDefense, effects.defenseSupport, "defense support");
      assert.equal(pv.surrounded, effects.surrounded, "surround");
      assert.equal(pv.counter, effects.counterAttack > 0, "counterattack eligibility");
      if (!fixture.indirect) {
        var index = function (u) { return units.indexOf(u); };
        var byPosition = function (a, b) { return a[0] - b[0] || a[1] - b[1]; };
        assert.deepEqual(g.adjacentAllies(defender.col, defender.row, attacker.player, attacker)
          .map(index).sort(ascending), effects.attackSupporters, "attack supporters");
        assert.deepEqual(g.adjacentAllies(attacker.col, attacker.row, defender.player, defender)
          .map(index).sort(ascending), effects.defenseSupporters, "defense supporters");
        assert.deepEqual(pv.tactical.ring.filter(function (hex) { return hex.controlled; })
          .map(function (hex) { return [hex.col, hex.row]; }).sort(byPosition),
          effects.ring.slice().sort(byPosition), "surrounding hexes inside the attacker's ZOC");
      }
      [pv.attacker, pv.defender].forEach(function (side) {
        var labels = side.steps.map(function (step) { return step.label; }), last = side.steps[side.steps.length - 1];
        assert.deepEqual(labels, ["BASE", "SUPPORT", "TERRAIN"].concat(side.modifiers.surrounded ? ["SURROUNDED"] : [], ["FINAL"]),
          "displayed steps follow the calculation order");
        assert.deepEqual([last.ap, last.da], [side.ap, side.da], "the final displayed step is the value used");
      });
      var sequence = fixture.rolls.map(function (tenths) { return rollFor[tenths * 10]; });
      g.currentPlayer = attacker.player;
      g.rng = function () { return sequence.shift(); };
      var result = g.attack(attacker, defender);
      assert.deepEqual([result.attackDamage.totalDamage, result.counterDamage.totalDamage],
        fixture.damage, "damage after rolls");
      assert.deepEqual([attacker.strength, defender.strength], fixture.survivors, "survivors");
      Object.keys(fixture.cargo).forEach(function (key) {
        var cargo = units[+key], expected = fixture.cargo[key];
        if (expected === null) {
          assert.equal(g.units.indexOf(cargo), -1, "cargo destroyed with its carrier");
        } else {
          assert.ok(g.units.indexOf(cargo) >= 0, "cargo survives");
          assert.equal(cargo.strength, expected, "cargo strength");
        }
      });
    });
  });
}
module.exports = run;
if (require.main === module) {
  var checks = 0, failures = 0;
  run(function (condition, message) { checks++; if (!condition) failures++; console.log((condition ? "PASS: " : "FAIL: ") + message); });
  console.log(checks + " checks, " + failures + " failures");
  process.exitCode = failures ? 1 : 0;
}
