"use strict";
var assert = require("node:assert/strict");
var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js");
var referenceMovement = require("./reference-movement.js");

function run(ok) {
  var rng = COMBAT.makeRng(76391), types = Object.keys(UNIT_TYPES);
  var chars = ".-whMv=FB", searches = 0;
  // Mixed terrain, both offset parities, edges, blockers, cross-domain ZOC,
  // transport boarding, factories, zero budgets and shortened buggy moves.
  for (var trial = 0; trial < 80; trial++) {
    var grid = [], deployments = [], seen = new Set();
    for (var row = 0; row < 15; row++) {
      var line = "";
      for (var col = 0; col < 19; col++) line += chars[Math.floor(rng() * chars.length)];
      grid.push(line);
    }
    types.forEach(function (type) {
      var x, y, key;
      do { x = Math.floor(rng() * 19); y = Math.floor(rng() * 15); key = x + "," + y; } while (seen.has(key));
      seen.add(key);
      deployments.push({t: type, o: Math.floor(rng() * 2), x: x, y: y});
    });
    var game = new ENGINE.Game({grid: grid, units: deployments}, {seed: trial});
    Object.values(game.buildings).forEach(function (b) { b.owner = Math.floor(rng() * 3) - 1; });
    game.units.forEach(function (unit, index) {
      unit.movePointsLeft = index % 3 ? unit.type.move : Math.floor(rng() * (unit.type.move + 1));
      if (index === trial % types.length && trial % 2) unit.carriedBy = 999;
      if (index === (trial + 3) % types.length && trial % 3) unit.inFactory = true;
      // Include long-range custom movement to exercise decreased heap costs.
      if (index === 0 && trial % 4 === 0) unit.movePointsLeft = 30;
      var expected = referenceMovement.call(game, unit), actual = game.movementRange(unit);
      assert.equal(JSON.stringify(actual), JSON.stringify(expected), "movement parity: seed " + trial + " " + unit.typeId);
      searches++;
    });
    // Reindex after a direct position change, just like hypothetical AI moves.
    game.units[0].col = 18; game.units[0].row = 14;
    assert.deepEqual(game.movementRange(game.units[1]), referenceMovement.call(game, game.units[1]));
  }
  ok(searches === 1840, "1,840 randomized movement searches preserve records, path ties and iteration order");

  var queue = new ENGINE.CostQueue(), ordered = [];
  for (var i = 0; i < 2000; i++) {
    var item = {cost: Math.floor(rng() * 25) / 2, order: i};
    queue.push(item); ordered.push(item);
  }
  ordered.sort(function (a, b) { return a.cost - b.cost || a.order - b.order; });
  ordered.forEach(function (item) { assert.equal(queue.pop(), item); });
  assert.equal(queue.pop(), null);
  queue.push({cost: 0}); assert.equal(queue.pop().cost, 0);
  ok(true, "minimum-cost heap preserves FIFO ties, fractional costs and reuse after draining");

  var battle = new ENGINE.Game({grid: [".....", "..h..", "....."], units: [
    {t: "BISON", o: 0, x: 1, y: 1, str: 3, exp: 8},
    {t: "POLAR", o: 1, x: 2, y: 1, str: 7, exp: 4}
  ]}, {seed: 123});
  [1, 101, 4096, 101].forEach(function (samples, index) {
    var attacker = battle.units[0], defender = battle.units[1];
    attacker.type = index % 2 ? UNIT_TYPES.HADRIAN : UNIT_TYPES.BISON;
    attacker.col = index % 2 ? 0 : 1;
    var before = battle.snapshot(), pv = COMBAT.preview(battle, attacker, defender);
    var forecast = COMBAT.forecast(attacker, defender, pv, samples);
    var bins = forecast.bins.map(function (row) { return row.map(function () { return 0; }); });
    for (var trial = 0; trial < samples; trial++) {
      var result = COMBAT.resolve(battle, attacker, defender,
        COMBAT.makeRng(Math.imul(trial + 1, 0x9e3779b9) ^ 0xa341316c));
      bins[result.dmgToAttacker][result.dmgToDefender]++;
      attacker.strength = 3; attacker.exp = 8; defender.strength = 7; defender.exp = 4;
    }
    assert.deepEqual(forecast.bins, bins);
    assert.deepEqual(battle.snapshot(), before);
  });
  ok(true, "forecast sample-cache replacement preserves exact direct/indirect outcomes and match state");
  require("./terrain-performance-tests.js")(ok);
  require("./fast-ai-tests.js")(ok);
}

module.exports = run;
if (require.main === module) run(function (condition, message) { assert.ok(condition, message); console.log("PASS: " + message); });
