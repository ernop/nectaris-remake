/* Hit-and-run regressions: approach, attack, then spend the same allowance. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), AI = require("../js/ai.js");
  function fixture(type, strength) {
    return new ENGINE.Game({ name: "Hit and run", grid: ["F..............."],
      buildings: [{ col: 0, row: 0, owner: 0 }],
      units: [{ t: type, o: 0, x: 1, y: 0 },
        { t: "HADRIAN", o: 1, x: 5, y: 0, str: strength },
        { t: "POLAR", o: 1, x: 15, y: 0 }],
    }, { seed: 7 });
  }
  function rejected(fn, pattern) {
    try { fn(); return false; } catch (err) { return pattern.test(err.message); }
  }
  ["RABBIT", "LYNX"].forEach(function (type) {
    var game = fixture(type, 1), unit = game.units[0], target = game.units[1];
    var firingCol = 5 - unit.type.rngG;
    var range = game.movementRange(unit), approach = range[HEX.key(firingCol, 0)];
    var remaining = unit.type.move - approach.cost;
    if (type === "RABBIT") {
      ok(approach.stop && !range[HEX.key(6, 0)], "Rabbit approach still stops at enemy ZOC");
    }
    game.moveUnit(unit, firingCol, 0, range);
    ok(unit.movePointsLeft === remaining, type + " approach preserves unspent movement, including at enemy ZOC");
    var result = game.attack(unit, target);
    ok(result.defenderDead && unit.attacked && !unit.moved && unit.movePointsLeft === remaining,
      type + " can move, attack once, then reposition with its original remainder");
    range = game.movementRange(unit);
    ok(range[HEX.key(firingCol + remaining, 0)] && !range[HEX.key(firingCol + remaining + 1, 0)],
      type + " post-kill range uses exactly the remaining allowance");
    ok(rejected(function () { game.attack(unit, game.units[1]); }, /already attacked/),
      type + " cannot attack twice");

    var restored = ENGINE.Game.restore(game.snapshot()), resumed = restored.units[0];
    ok(resumed.attacked && !resumed.moved && resumed.movePointsLeft === remaining &&
      restored.movementRange(resumed)[HEX.key(0, 0)], type + " can resume its retreat after saving");
    if (restored.movementRange(resumed)[HEX.key(0, 0)]) {
      restored.moveUnit(resumed, 0, 0);
      restored.finishUnit(resumed);
      ok(resumed.inFactory && resumed.moved && resumed.strength === COMBAT.MAX_STRENGTH,
        type + " can finish its post-attack move in an owned factory for repairs");
    }

    game = fixture(type, 8); unit = game.units[0]; target = game.units[1];
    game.moveUnit(unit, firingCol, 0);
    result = game.attack(unit, target);
    range = game.movementRange(unit);
    ok(!result.defenderDead && !unit.moved && range[HEX.key(firingCol - 1, 0)],
      type + " may retreat even when its target survives");
    if (type === "RABBIT") {
      ok(range[HEX.key(0, 0)] && range[HEX.key(0, 0)].cost === firingCol,
        "Rabbit can leave a surviving enemy's ZOC with its remaining movement");
    }

    // Spending the entire allowance on the approach grants no free retreat.
    game = new ENGINE.Game({ name: "Spent buggy", grid: ["...................."],
      units: [{ t: type, o: 0, x: 0, y: 0 },
        { t: "HADRIAN", o: 1, x: unit.type.move + unit.type.rngG, y: 0, str: 1 },
        { t: "POLAR", o: 1, x: 19, y: 0 }],
    });
    unit = game.units[0]; target = game.units[1];
    game.moveUnit(unit, unit.type.move, 0);
    game.rng = function () { return 0; };
    game.attack(unit, target);
    ok(unit.moved && unit.movePointsLeft === 0 && Object.keys(game.movementRange(unit)).length === 1,
      type + " finishes after attacking when its approach used all movement");

    game = fixture(type, 1); unit = game.units[0];
    game.rng = function () { return 0; };
    var turn = AI.createTurn(game, 0), events = [], event;
    while ((event = turn.next())) events.push(event);
    var battleIndex = events.findIndex(function (e) { return e.t === "battle"; });
    ok(events[0].t === "move" && battleIndex > 0 && events[battleIndex + 1] &&
      events[battleIndex + 1].reason === "post-attack" && unit.moved,
      "AI " + type + " approaches, attacks, retreats and ends its activation");
  });

  var game = fixture("BISON", 1), tank = game.units[0];
  game.moveUnit(tank, 4, 0);
  game.rng = function () { return 0; };
  game.attack(tank, game.units[1]);
  ok(tank.moved && tank.movePointsLeft === 0, "ordinary tank cannot retreat after its attack");
};
