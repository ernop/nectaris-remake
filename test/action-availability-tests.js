/* Every offered action must execute on the same live state. Blockers are
 * shared by reserve cards, end-turn warnings, AI and engine mutations. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), HEX = require("../js/hex.js");
  var types = require("../js/data-units.js").UNIT_TYPES;
  function fixture(type) {
    return new ENGINE.Game({name:"Availability", grid:[".....",".....","..F..",".....","....."],
      buildings:[{col:2,row:2,owner:0,stored:[type]}],
      units:[{t:"CHARLIE",o:1,x:4,y:4}]}, {seed:4});
  }
  function reserve(game) { return game.buildingAt(2,2).stored[0]; }
  function targets(game) {
    var b = game.buildingAt(2,2), u = reserve(game);
    return game.deployTargets(b,u).length + game.transportDeployTargets(b,u).length;
  }
  function rejects(fn) { try { fn(); return false; } catch (e) { return true; } }
  Object.keys(types).forEach(function (type) {
    var g = fixture(type), b = g.buildingAt(2,2), u = reserve(g);
    var before = JSON.stringify(g.snapshot());
    var exits = g.deployTargets(b,u);
    ok(exits.length === 6 && g.remainingTurnActions().reserves.length === 1, type+": open reserve has real exits");
    ok(JSON.stringify(g.snapshot()) === before, type+": checking availability leaves the match untouched");
    exits.forEach(function (exit) {
      var copy = ENGINE.Game.restore(g.snapshot()), unit = reserve(copy);
      copy.deployFromFactory(copy.buildingAt(2,2),unit,exit.col,exit.row);
      var actions = copy.availableActions(unit);
      ok(copy.unitAt(exit.col,exit.row) === unit && !actions.moves.length && !actions.attacks.length,
        type+": every offered exit executes and deployment grants no extra move/attack");
    });
    HEX.neighbors(2,2).forEach(function (n) { g.units.push(ENGINE.makeUnit("TRIGGER",0,n.col,n.row)); });
    ok(targets(g) === 0 && !g.remainingTurnActions().reserves.length,
      type+": occupied exits are absent from both deployment and end-turn availability");
    var blockedState = JSON.stringify(g.snapshot());
    ok(rejects(function () {g.deployFromFactory(b,u,exits[0].col,exits[0].row);}) &&
      JSON.stringify(g.snapshot()) === blockedState, type+": stale exit cannot mutate the board");
    var blocker = g.unitAt(exits[0].col,exits[0].row); g.units.splice(g.units.indexOf(blocker),1);
    ok(targets(g) === 1 && g.remainingTurnActions().reserves.length === 1,
      type+": clearing one exit immediately restores the same legal action everywhere");
    u.moved = true;
    ok(!targets(g) && !g.remainingTurnActions().reserves.length, type+": spent reserves never expose exits");
    u.moved = false; g.currentPlayer = 1;
    ok(!targets(g), type+": another player's reserves never expose actions");
    g.currentPlayer = 0;
    ok(!g.deployTargets(b,Object.assign({},u)).length, type+": stale unit identity cannot offer deployment");
    g.winner = 0;
    ok(!targets(g), type+": completed games offer no deployment");
  });

  var g = fixture("ATLAS"), b = g.buildingAt(2,2), u = reserve(g);
  HEX.neighbors(2,2).forEach(function(n){g.terrain[n.row][n.col]=TERRAIN.mountain;});
  var carrier = ENGINE.makeUnit("PELICAN",0,3,2); carrier.moved = true; g.units.push(carrier);
  ok(g.transportDeployTargets(b,u)[0] === carrier, "a spent carrier with an unused transfer can still accept factory cargo");
  carrier.transferUsed = true;
  ok(!targets(g) && !g.remainingTurnActions().reserves.length, "used carrier transfer blocks the only deployment route");
  carrier.transferUsed = false;
  carrier.cargo.push(ENGINE.makeUnit("CHARLIE",0,3,2));
  ok(!targets(g), "full carrier blocks the only deployment route");
  carrier.cargo = [];
  var copy = ENGINE.Game.restore(g.snapshot());
  copy.loadFromFactory(copy.buildingAt(2,2),reserve(copy),copy.units.find(function(unit){return unit.id===carrier.id;}));
  ok(!copy.buildingAt(2,2).stored.length, "every offered transport deployment executes");
  carrier.player = 1;
  ok(!targets(g), "enemy carrier cannot provide a deployment route");

  g = fixture("BISON");
  var buggy = ENGINE.makeUnit("RABBIT",0,0,0); g.units.push(buggy);
  buggy.shifted = true; buggy.movePointsLeft = 6;
  ok(!g.availableActions(buggy).moves.length, "unused buggy budget does not override a committed movement phase");
  buggy.shifted = false; buggy.moved = true;
  ok(!g.availableActions(buggy).moves.length && !g.legalAttackTargets(buggy).length,
    "spent units do not acquire actions from leftover stats");
  buggy.moved = false;
  var actions = g.availableActions(buggy);
  actions.moves.forEach(function (move) {
    var restored = ENGINE.Game.restore(g.snapshot()), unit = restored.units.find(function(x){return x.id===buggy.id;});
    restored.moveUnit(unit,move.col,move.row);
    ok(unit.col===move.col && unit.row===move.row, "every offered movement destination executes");
  });
};
