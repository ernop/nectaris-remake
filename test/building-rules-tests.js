/* Factory storage, entry restrictions and reserves. Base parking is in fidelity-tests. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var HEX = require("../js/hex.js");
  function fixture(kind, owner, type) {
    return new ENGINE.Game({ name: "Building stops", grid: ["." + kind + "......", "........"],
      buildings: [{ col: 1, row: 0, owner: owner }],
      units: [{ t: type || "BISON", o: 0, x: 0, y: 0, str: 3, exp: 2 },
        { t: "BISON", o: 0, x: 0, y: 1 }, { t: "BISON", o: 1, x: 7, y: 1 }],
    }, { seed: 1 });
  }
  function rejectsWithoutMutation(game, action, message) {
    var before = JSON.stringify(game.snapshot()), rejected = false;
    try { action(); } catch (err) { rejected = true; }
    ok(rejected && JSON.stringify(game.snapshot()) === before, message);
  }
  function includesHex(targets, col, row) {
    return targets.some(function (n) { return n.col === col && n.row === row; });
  }

  ["F"].forEach(function (kind) {
    [-1, 0, 1].forEach(function (owner) {
      var game = fixture(kind, owner), tank = game.units[0], building = game.buildingAt(1, 0);
      var range = game.movementRange(tank), rec = range[HEX.key(1, 0)];
      ok(rec && rec.canStop === (owner === 0), kind + ": tank endpoint requires ownership " + owner);
      ok(range[HEX.key(2, 0)].prev === HEX.key(1, 0), kind + ": shortest route passes through the building " + owner);
      if (owner !== 0) {
        rejectsWithoutMutation(game, function () { game.moveUnit(tank, 1, 0); }, kind + ": tank cannot move onto unowned building");
      }
      game.moveUnit(tank, 2, 0, range);
      game.finishUnit(tank);
      ok(game.unitAt(2, 0) === tank && !tank.inFactory && building.owner === owner && !building.stored.length,
        kind + ": passing through never stores the tank or changes ownership");

      game = fixture(kind, owner, "CHARLIE");
      var infantry = game.units[0];
      game.moveUnit(infantry, 1, 0);
      ok(game.buildingAt(1, 0).owner === 0, kind + ": infantry capture or enter a building within the move");
      if (kind === "B" && owner === 1) {
        ok(game.winner === 0 && game.winReason === "base", "enemy base capture still wins the match");
      } else {
        ok(!game.unitAt(1, 0) && infantry.inFactory, kind + ": infantry enters storage after capture or friendly entry");
      }

      game = fixture(kind, owner, "EAGLE");
      var aircraft = game.units[0];
      building = game.buildingAt(1, 0);
      range = game.movementRange(aircraft); rec = range[HEX.key(1, 0)];
      ok(rec && rec.canStop === (owner === 0), kind + ": aircraft endpoint requires ownership " + owner);
      ok(range[HEX.key(2, 0)].canStop && range[HEX.key(2, 0)].prev === HEX.key(1, 0),
        kind + ": aircraft may fly over the building " + owner);
      if (owner === 0) {
        game.moveUnit(aircraft, 1, 0);
        ok(!game.unitAt(1, 0) && building.stored[0] === aircraft && aircraft.strength === 8 && building.owner === 0,
          kind + ": aircraft enter friendly factories for repair");
      } else {
        rejectsWithoutMutation(game, function () { game.moveUnit(aircraft, 1, 0); },
          kind + ": aircraft cannot stop on an unowned building");
      }

      game = fixture(kind, owner, "PELICAN");
      var transport = game.units[0], cargo = game.units[1];
      game.moveUnit(cargo, transport.col, transport.row);
      ok(game.movementRange(transport)[HEX.key(1, 0)].canStop === (owner === 0),
        kind + ": loaded aircraft may enter only friendly factories " + owner);
      if (owner !== 0) {
        rejectsWithoutMutation(game, function () { game.moveUnit(transport, 1, 0); },
          kind + ": loaded aircraft cannot stop on an unowned building");
      }
      game.endTurn(); game.endTurn();
      ok(includesHex(game.unloadTargets(transport, cargo), 1, 0) === (owner === 0),
        kind + ": unload destinations enforce tank ownership");
      if (owner === 0) {
        game.unload(transport, cargo, 1, 0);
        ok(!game.unitAt(1, 0) && cargo.inFactory && !transport.cargo.length,
          kind + ": unloading to friendly building stores the tank");
      } else {
        rejectsWithoutMutation(game, function () { game.unload(transport, cargo, 1, 0); },
          kind + ": unloading cannot park a tank on an unowned building");
      }
    });

    var game = fixture(kind, 0), tank = game.units[0], building = game.buildingAt(1, 0);
    game.moveUnit(tank, 1, 0);
    ok(!game.unitAt(1, 0) && building.stored[0] === tank && tank.moved && tank.strength === 8 && tank.exp === 2,
      kind + ": friendly entry stores, repairs and preserves experience within the move");
    game.finishUnit(tank);
    ok(building.stored.length === 1, kind + ": finishing an already stored unit cannot duplicate it");
    rejectsWithoutMutation(game, function () { game.deployFromFactory(building, tank, 2, 0); },
      kind + ": entered units cannot redeploy on the same turn");
    var restored = ENGINE.Game.restore(game.snapshot());
    var savedBuilding = restored.buildingAt(1, 0), savedTank = savedBuilding.stored[0];
    ok(savedTank.inFactory && savedTank.moved && !restored.unitAt(1, 0), kind + ": storage survives save and resume");
    restored.endTurn(); restored.endTurn();
    restored.deployFromFactory(savedBuilding, savedTank, 2, 0);
    ok(restored.unitAt(2, 0) === savedTank && savedTank.moved && !savedBuilding.stored.length,
      kind + ": stored tank deploys from the building on its next turn");
  });

  [[0, "EAGLE"], [1, "CHARLIE"]].forEach(function (entry) {
    var owner = entry[0], type = entry[1];
    var game = new ENGINE.Game({ name: "Entry ends the activation", grid: [".F......", "........"],
      buildings: [{ col: 1, row: 0, owner: owner }],
      units: [{ t: type, o: 0, x: 0, y: 0, str: 3 }, { t: "BISON", o: 1, x: 2, y: 0 }, { t: "BISON", o: 1, x: 7, y: 1 }],
    }, { seed: 1 });
    var unit = game.units[0], enemy = game.units[1];
    var moved = game.moveUnit(unit, 1, 0);
    ok(unit.inFactory && game.buildingAt(1, 0).owner === 0 && !game.unitAt(1, 0) &&
      moved.effects.map(function (e) { return e.t; }).join() === (owner === 0 ? "store" : "capture,store"),
      type + ": entering completes storage or capture within the move command");
    ok(!game.legalCommands().some(function (c) { return c[1].indexOf(unit) >= 0; }),
      type + ": no command for the unit follows its entering move");
    rejectsWithoutMutation(game, function () { game.attack(unit, enemy); },
      type + ": no attack from the building after entering it");
  });

  ["BISON", "EAGLE"].forEach(function (type) {
    [-1, 0, 1].forEach(function (owner) {
      var game = new ENGINE.Game({ name: "Adjacent factories", grid: [".FF.....", "........"],
        buildings: [{ col: 1, row: 0, owner: 0, stored: [type] }, { col: 2, row: 0, owner: owner }],
        units: [{ t: "CHARLIE", o: 0, x: 0, y: 1 }, { t: "BISON", o: 1, x: 7, y: 1 }],
      }, { seed: 1 });
      var source = game.buildingAt(1, 0), target = game.buildingAt(2, 0), unit = source.stored[0];
      ok(includesHex(game.deployTargets(source, unit), 2, 0) === (owner === 0),
        type + ": deployment endpoints enforce target factory ownership " + owner);
      if (owner === 0) {
        game.deployFromFactory(source, unit, 2, 0);
        ok(!game.unitAt(2, 0) && !source.stored.length && target.stored[0] === unit && unit.inFactory && unit.moved,
          type + ": deployment into an adjacent friendly factory transfers the unit inside");
      } else {
        rejectsWithoutMutation(game, function () { game.deployFromFactory(source, unit, 2, 0); },
          type + ": deployment cannot park on an unowned factory");
      }
    });
  });

  ["F"].forEach(function (kind) {
    [0, 1].forEach(function (owner) {
      var game = new ENGINE.Game({ name: "Stored forces survive", grid: ["....." + kind + "..", ".......F"],
        buildings: [{ col: 5, row: 0, owner: owner, stored: [{ t: "CHARLIE", str: 1 }] },
          { col: 7, row: 1, owner: -1, stored: ["TRIGGER"] }],
        units: [{ t: "HADRIAN", o: 1 - owner, x: 0, y: 0 },
          { t: "CHARLIE", o: owner, x: 2, y: 0, str: 1 }],
      }, { seed: 1 });
      if (game.currentPlayer !== 1 - owner) game.endTurn();
      var attacker = game.unitAt(0, 0), building = game.buildingAt(5, 0), reserve = building.stored[0];
      reserve.moved = true;
      var result = game.attack(attacker, game.unitAt(2, 0));
      ok(result.defenderDead && game.playerUnits(owner).length === 0,
        kind + ": combat destroys player " + owner + "'s last fielded unit");
      ok(game.winner === null && game.winReason === null,
        kind + ": stored reserves prevent elimination even before they can deploy for player " + owner);

      game.endTurn();
      game.deployFromFactory(building, reserve, 4, 0);
      game.endTurn();
      result = game.attack(attacker, reserve);
      ok(result.defenderDead && game.winner === 1 - owner && game.winReason === "elimination",
        kind + ": destroying the last deployed reserve wins despite empty owned buildings and neutral reserves");
    });
  });

  var storedOnly = new ENGINE.Game({ name: "Stored forces only", grid: ["F...F"],
    buildings: [{ col: 0, row: 0, owner: 0, stored: ["CHARLIE"] },
      { col: 4, row: 0, owner: 1, stored: ["TRIGGER"] }],
    units: [],
  }, { seed: 1 });
  storedOnly.checkElimination();
  ok(storedOnly.winner === 0, "mines in storage do not prevent elimination");
};
