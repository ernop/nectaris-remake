/* ZOC rules, action-boundary validation and recorded original-game evidence. */
"use strict";
var assert = require("node:assert/strict");
var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js");
var HEX = require("../js/hex.js");
var original = require("./fixtures/windows-zoc.json");

function run(ok) {
  function test(label, body) {
    try { body(); ok(true, label); }
    catch (error) { ok(false, label + ": " + error.message); }
  }
  function game(units, grid, buildings) {
    return new ENGINE.Game({ name: "ZOC regression", grid: grid || ["...................."],
      units: units, buildings: buildings || [] }, {seed: 7});
  }
  function unit(type, player, col, row, strength) {
    return {t: type, o: player, x: col, y: row || 0, str: strength};
  }
  function rejectsUnchanged(g, body) {
    var before = g.snapshot();
    assert.throws(body, /Illegal move|cannot move/i);
    assert.deepEqual(g.snapshot(), before, "rejection must not spend movement, alter flags, log or RNG");
  }
  function destinations(g, u) {
    return Object.values(g.movementRange(u)).filter(function (r) { return r.canStop; })
      .sort(function (a, b) { return a.row - b.row || a.col - b.col; })
      .map(function (r) { return [r.col, r.row, r.cost]; });
  }

  original.cases.forEach(function (fixture) {
    test("original Windows: " + fixture.name, function () {
      var g = new ENGINE.Game(fixture), u = g.units[0];
      if (fixture.remaining !== undefined) u.movePointsLeft = fixture.remaining;
      fixture.units.forEach(function (definition, i) { g.units[i].moved = !!definition.moved; });
      assert.deepEqual(destinations(g, u), fixture.reachable);
      var full = g.movementRange(u);
      fixture.reachable.forEach(function (entry) {
        var key = HEX.key(entry[0], entry[1]);
        assert.deepEqual(g.movementRange(u, key)[key], full[key],
          "execution cutoff preserves the cheapest cost and path at " + key);
      });
      var zones = [];
      for (var row = 0; row < g.height; row++) for (var col = 0; col < g.width; col++) {
        var occupant = g.unitAt(col, row);
        if ((!occupant || occupant.player === u.player) && g.inEnemyZOC(col, row, u.player)) zones.push([col, row]);
      }
      assert.deepEqual(zones, fixture.zoc);
    });
  });

  test("an old range cannot stack units after a friendly move", function () {
    var g = game([unit("BISON", 0, 0), unit("BISON", 0, 7)]), a = g.units[0], b = g.units[1];
    var old = g.movementRange(a);
    g.moveUnit(b, 4, 0); g.finishMovement(b);
    rejectsUnchanged(g, function () { g.moveUnit(a, 4, 0, old); });
  });
  test("an old range cannot pass through newly introduced enemy ZOC", function () {
    var g = game([unit("BISON", 0, 0, 1), unit("FALCON", 1, 9, 0)],
      ["MMMMMMMMMM", "..........", "MMMMMMMMMM"]), a = g.units[0];
    var old = g.movementRange(a);
    assert.ok(old["5,1"].canStop);
    g.units[1].col = 3; // editor/hypothetical move: no mutation hooks
    assert.equal(g.inEnemyZOC(2, 1, 0), true);
    rejectsUnchanged(g, function () { g.moveUnit(a, 5, 1, old); });
  });
  test("an old range expands after the controlling enemy is removed", function () {
    var g = game([unit("BISON", 0, 0), unit("BISON", 1, 2)]), a = g.units[0];
    var old = g.movementRange(a);
    assert.equal(old["5,0"], undefined);
    g.removeUnit(g.units[1]);
    g.moveUnit(a, 5, 0, old);
    assert.equal(a.col, 5); assert.equal(a.movePointsLeft, 1);
  });
  test("an old range cannot use a larger previous movement budget", function () {
    var g = game([unit("RABBIT", 0, 0)]), a = g.units[0], old = g.movementRange(a);
    a.movePointsLeft = 1;
    rejectsUnchanged(g, function () { g.moveUnit(a, 3, 0, old); });
  });
  test("execution charges current terrain costs even with an old range", function () {
    var g = game([unit("RABBIT", 0, 0)]), a = g.units[0], old = g.movementRange(a);
    g.terrain[0][2] = TERRAIN.waste;
    g.moveUnit(a, 2, 0, old);
    assert.equal(a.movePointsLeft, 4);
  });
  test("a range from a different unit cannot grant extra movement", function () {
    var g = game([unit("BISON", 0, 0), unit("FALCON", 0, 1)]), a = g.units[0];
    var other = g.movementRange(g.units[1]);
    assert.ok(other["10,0"].canStop);
    rejectsUnchanged(g, function () { g.moveUnit(a, 10, 0, other); });
  });
  test("forged range records cannot supply free movement or illegal destinations", function () {
    var g = game([unit("RABBIT", 0, 0)]), a = g.units[0];
    rejectsUnchanged(g, function () { g.moveUnit(a, 19, 0, {"19,0": {cost: 0, canStop: true}}); });
    g.moveUnit(a, 2, 0, {"2,0": {cost: 0, canStop: true}});
    assert.equal(a.movePointsLeft, 6);
  });
  test("new factory deployments invalidate previously open destinations", function () {
    var g = game([unit("BISON", 0, 0)], [".....F.............."],
      [{col: 5, row: 0, owner: 0, stored: ["TRIGGER"]}]);
    var a = g.units[0], old = g.movementRange(a), factory = g.buildingAt(5, 0);
    g.deployFromFactory(factory, factory.stored[0], 4, 0);
    rejectsUnchanged(g, function () { g.moveUnit(a, 4, 0, old); });
  });
  test("a stale boarding record becomes an ordinary move when the carrier leaves", function () {
    var g = game([unit("CHARLIE", 0, 0), unit("MULE", 0, 1)]), a = g.units[0], carrier = g.units[1];
    var old = g.movementRange(a); assert.equal(old["1,0"].load, true);
    g.moveUnit(carrier, 2, 0); g.finishMovement(carrier);
    g.moveUnit(a, 1, 0, old);
    assert.equal(a.carriedBy, null); assert.equal(a.col, 1); assert.equal(a.movePointsLeft, 2);
  });
  test("a newly arrived compatible carrier is recognized during execution", function () {
    var g = game([unit("CHARLIE", 0, 0), unit("MULE", 0, 3)]), a = g.units[0], carrier = g.units[1];
    var old = g.movementRange(a); assert.equal(old["1,0"].load, false);
    g.moveUnit(carrier, 1, 0); g.finishMovement(carrier);
    g.moveUnit(a, 1, 0, old);
    assert.equal(a.carriedBy, carrier.id); assert.equal(carrier.cargo[0], a);
  });
  test("a kill opens movement for another unit in the same turn", function () {
    var g = game([unit("BISON", 0, 2), unit("HADRIAN", 1, 3, 0, 1),
      unit("BISON", 0, 4), unit("POLAR", 1, 19)]), waiting = g.units[0];
    var old = g.movementRange(waiting); assert.equal(old["8,0"], undefined);
    assert.equal(g.attack(g.units[2], g.units[1]).defenderDead, true);
    assert.equal(g.currentPlayer, 0); assert.equal(g.turn, 1);
    assert.equal(g.inEnemyZOC(2, 0, 0), false);
    g.moveUnit(waiting, 8, 0, old); assert.equal(waiting.col, 8);
  });
  test("removing one enemy preserves another enemy's overlapping ZOC", function () {
    var g = game([unit("BISON", 0, 1), unit("BISON", 1, 3), unit("BISON", 1, 5)]);
    g.removeUnit(g.units[1]);
    var range = g.movementRange(g.units[0]);
    assert.equal(range["4,0"].stop, true); assert.equal(range["6,0"], undefined);
  });
  test("removing ZOC cannot reopen a committed movement phase", function () {
    var g = game([unit("BISON", 0, 1), unit("HADRIAN", 1, 3, 0, 1),
      unit("BISON", 0, 4), unit("POLAR", 1, 19)]), waiting = g.units[0];
    var old = g.movementRange(waiting);
    g.moveUnit(waiting, 2, 0); g.finishMovement(waiting);
    g.attack(g.units[2], g.units[1]);
    assert.equal(g.inEnemyZOC(2, 0, 0), false);
    assert.equal(Object.keys(g.movementRange(waiting)).length, 1);
    rejectsUnchanged(g, function () { g.moveUnit(waiting, 1, 0, old); });
  });
  test("all field types project ZOC after acting, independent of strength or attack range", function () {
    Object.keys(UNIT_TYPES).forEach(function (type) {
      var g = game([unit(type, 1, 3, 0, 1)]), u = g.units[0];
      u.moved = true; u.movePointsLeft = 0;
      assert.equal(g.inEnemyZOC(2, 0, 0), true, type);
      u.inFactory = true; assert.equal(g.inEnemyZOC(2, 0, 0), false, type);
      u.inFactory = false; u.carriedBy = 999; assert.equal(g.inEnemyZOC(2, 0, 0), false, type);
    });
  });
  test("loading removes the passenger's ZOC; unloading restores it immediately", function () {
    var g = game([unit("CHARLIE", 0, 4, 1), unit("MULE", 0, 3, 1)], Array(3).fill("........."));
    var passenger = g.units[0], carrier = g.units[1];
    assert.equal(g.inEnemyZOC(5, 1, 1), true);
    g.moveUnit(passenger, 3, 1);
    assert.equal(g.inEnemyZOC(5, 1, 1), false);
    g.endTurn(); g.endTurn();
    g.unload(carrier, passenger, 4, 1);
    assert.equal(passenger.moved, true); assert.equal(g.inEnemyZOC(5, 1, 1), true);
  });
  test("factory storage removes ZOC; deployment restores it despite ending the action", function () {
    var g = game([unit("BISON", 0, 4, 1)], [".........", "...F.....", "........."],
      [{col: 3, row: 1, owner: 0}]), u = g.units[0], factory = g.buildingAt(3, 1);
    assert.equal(g.inEnemyZOC(5, 1, 1), true);
    g.moveUnit(u, 3, 1); g.finishMovement(u);
    assert.equal(g.inEnemyZOC(5, 1, 1), false);
    g.endTurn(); g.endTurn(); g.deployFromFactory(factory, u, 4, 1);
    assert.equal(u.moved, true); assert.equal(g.inEnemyZOC(5, 1, 1), true);
  });
  test("surround and combat previews update after friendly movement and snapshot undo", function () {
    var neighbors = HEX.neighbors(5, 4), front = neighbors[0], back = neighbors[3];
    var g = game([unit("BISON", 1, 5, 4), unit("BISON", 0, front.col, front.row),
      unit("BISON", 0, 0, 4)], Array(9).fill("..........."));
    var target = g.units[0], attacker = g.units[1], flanker = g.units[2], before = g.snapshot();
    assert.equal(COMBAT.preview(g, attacker, target).surrounded, false);
    g.moveUnit(flanker, back.col, back.row); g.finishMovement(flanker);
    assert.equal(COMBAT.preview(g, attacker, target).surrounded, true);
    var restored = ENGINE.Game.restore(g.snapshot()); assert.equal(restored.isSurrounded(restored.units[0]), true);
    restored = ENGINE.Game.restore(before); assert.equal(restored.isSurrounded(restored.units[0]), false);
  });
  test("off-map hexes never carry ZOC and edge units cannot be surrounded", function () {
    var g = game([unit("BISON", 0, 0, 0), unit("BISON", 1, 1, 0)], ["...", "...", "..."]);
    assert.equal(g.inEnemyZOC(0, -1, 1), false);
    assert.equal(g.inEnemyZOC(-1, 0, 1), false);
    assert.equal(g.isSurrounded(g.units[0]), false);
  });
}
module.exports = run;
if (require.main === module) {
  var checks = 0, failures = 0;
  run(function (condition, message) { checks++; if (!condition) failures++; console.log((condition ? "PASS: " : "FAIL: ") + message); });
  console.log(checks + " checks, " + failures + " failures");
  process.exitCode = failures ? 1 : 0;
}
