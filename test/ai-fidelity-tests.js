/* Observable CPU tactics documented by Anka l5/d6, TG-16 guides and the
 * user's factory-exit correction (2026-09-20).
 * These test the behaviors, not exact original decision traces. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), AI = require("../js/ai.js");
  function game(units, buildings, grid) {
    return new ENGINE.Game({ name: "CPU tactics", turnLimit: 50,
      grid: grid || ["....................", "B..................B", "...................."],
      buildings: buildings || [{col:0,row:1,owner:0},{col:19,row:1,owner:1}], units: units }, {seed:17});
  }
  function nextRound(g) { g.endTurn(); g.endTurn(); }

  function factoryGame(stored, units, col) {
    col = col === undefined ? 2 : col;
    var grid = ["....................", "....................", "....................",
      "....................", "B..................B"];
    grid[2] = grid[2].slice(0,col) + "F" + grid[2].slice(col+1);
    return game(units || [], [{col:0,row:4,owner:1},{col:19,row:4,owner:0},
      {col:col,row:2,owner:0,stored:stored}], grid);
  }

  // Explicit screen coordinates catch parity errors and goal-based sorting.
  [
    {col:2, exits:[[1,1],[2,1],[3,1],[3,2],[2,3],[1,2]]},
    {col:3, exits:[[2,2],[3,1],[4,2],[4,3],[3,3],[2,3]]},
    {col:0, exits:[[0,1],[1,1],[1,2],[0,3]]},
  ].forEach(function (fixture) {
    var g = factoryGame(["BISON","BISON","BISON","BISON","BISON","BISON","BISON"], [], fixture.col);
    var runner = AI.createTurn(g,0), actual = [], event;
    while ((event = runner.next())) {
      if (event.t === "deploy") actual.push([event.to.col,event.to.row]);
    }
    ok(JSON.stringify(actual) === JSON.stringify(fixture.exits),
      "CPU factory at column " + fixture.col + " fills exits clockwise from upper-left, skipping off-map hexes");
    ok(g.buildingAt(fixture.col,2).stored.length === 7-fixture.exits.length,
      "CPU keeps excess reserves when every exit is occupied");
  });

  ["MULE", "PELICAN"].forEach(function (type) {
    var g = factoryGame(["CHARLIE","PANTHER"], [{t:type,o:0,x:1,y:1}]);
    var factory = g.buildingAt(2,2), passenger = factory.stored[1], carrier = g.units[0];
    carrier.moved = true; carrier.movePointsLeft = 0;
    var runner = AI.createTurn(g,0), first = runner.next(), second = runner.next();
    ok(first && first.reason === "load" && first.unit === passenger &&
      passenger.carriedBy === carrier.id && carrier.cargo[0] === passenger && !passenger.inFactory,
      type + ": first available factory exit boards a compatible used carrier even with a nearby objective");
    ok(passenger.moved && !g.unloadTargets(carrier,passenger).length,
      type + ": factory boarding spends the passenger activation and forbids same-turn unloading");
    ok(second && second.t === "deploy" && second.to.col === 2 && second.to.row === 1,
      type + ": next reserve skips the now-full carrier and takes the next clockwise hex");
  });

  [
    {passenger:"BISON", occupant:"MULE", owner:0, reason:"incompatible Mule cargo"},
    {passenger:"FALCON", occupant:"PELICAN", owner:0, reason:"aircraft cannot board"},
    {passenger:"CHARLIE", occupant:"PELICAN", owner:1, reason:"enemy carrier"},
    {passenger:"CHARLIE", occupant:"BISON", owner:0, reason:"ordinary friendly unit"},
  ].forEach(function (fixture) {
    var g = factoryGame([fixture.passenger], [{t:fixture.occupant,o:fixture.owner,x:1,y:1}]);
    var event = AI.createTurn(g,0).next();
    ok(event && event.t === "deploy" && event.to.col === 2 && event.to.row === 1 && !g.units[0].cargo.length,
      "CPU skips the first factory hex for " + fixture.reason);
  });

  var laterCarrier = factoryGame(["CHARLIE"], [{t:"PELICAN",o:0,x:2,y:1}]);
  laterCarrier.buildingAt(0,4).owner = 0; laterCarrier.buildingAt(19,4).owner = 1;
  var earlierExit = AI.createTurn(laterCarrier,0).next();
  ok(earlierExit && earlierExit.t === "deploy" && earlierExit.to.col === 1 && earlierExit.to.row === 1 &&
    !laterCarrier.units[0].cargo.length,
    "CPU takes an earlier open hex before a later transport, even when transport would help reach the enemy base");

  var blockedExit = factoryGame(["BISON"]);
  blockedExit.terrain[1][1] = TERRAIN_BY_CHAR.h;
  var afterTerrain = AI.createTurn(blockedExit,0).next();
  ok(afterTerrain && afterTerrain.t === "deploy" && afterTerrain.to.col === 2 && afterTerrain.to.row === 1,
    "CPU skips non-deployable terrain in the factory scan");

  var overMountain = factoryGame(["BISON"], [{t:"PELICAN",o:0,x:1,y:1}]);
  overMountain.terrain[1][1] = TERRAIN_BY_CHAR.M;
  var mountainBoard = AI.createTurn(overMountain,0).next();
  ok(mountainBoard && mountainBoard.reason === "load" && overMountain.units[0].cargo[0] === mountainBoard.unit,
    "CPU boards a legal Pelican over terrain that forbids a direct factory exit");

  var newCarrier = factoryGame(["TRIGGER","PELICAN"]);
  var newCarrierTurn = AI.createTurn(newCarrier,0), carrierExit = newCarrierTurn.next(), mineExit = newCarrierTurn.next();
  ok(carrierExit && carrierExit.t === "deploy" && mineExit && mineExit.reason === "load" &&
    carrierExit.unit.cargo[0] === mineExit.unit && mineExit.unit.typeId === "TRIGGER",
    "CPU restarts the scan for each reserve and loads a mine into the carrier just deployed at the first hex");

  ["PELICAN", "MULE"].forEach(function (type) {
    var g = game([{t:type,o:0,x:2,y:1},{t:"CHARLIE",o:0,x:1,y:1}]);
    var carrier = g.units[0], passenger = g.units[1];
    var events = AI.playTurn(g,0);
    ok(events.some(function (e) { return e.reason === "load"; }) && passenger.carriedBy === carrier.id,
      type + ": CPU boards an infantry passenger");
    ok(!events.some(function(e) {return e.reason === "unload";}), type + ": loading and unloading cannot occur in one turn");
    var turn = 0;
    while (g.winner === null && turn++ < 15) { nextRound(g); AI.playTurn(g,0); }
    ok(g.winner === 0 && g.winReason === "base", type + ": airlift/convoy delivers infantry that subsequently captures the base");
    ok(!carrier.cargo.length && !passenger.carriedBy, type + ": delivered passenger has independent field identity");
  });

  var reserves = game([{t:"PELICAN",o:0,x:0,y:1}],
    [{col:0,row:1,owner:0},{col:19,row:1,owner:1},{col:1,row:1,owner:0,stored:["CHARLIE"]}],
    ["....................", "BF.................B", "...................."]);
  var reserve = reserves.buildingAt(1,1).stored[0];
  AI.playTurn(reserves,0);
  ok(reserve.carriedBy === reserves.units[0].id && reserve.moved,
    "CPU loads infantry directly from a factory and preserves the passenger delay");

  var captured = game([{t:"CHARLIE",o:0,x:2,y:1}],
    [{col:0,row:1,owner:0},{col:19,row:1,owner:1},{col:3,row:1,owner:-1,stored:["BISON","TRIGGER"]}],
    ["....................", "B..F...............B", "...................."]);
  var factory = captured.buildingAt(3,1);
  AI.playTurn(captured,0);
  ok(factory.owner === 0 && captured.playerUnits(0).some(function(u) {return u.typeId === "BISON";}) &&
    captured.playerUnits(0).some(function(u) {return u.typeId === "TRIGGER";}),
    "CPU deploys multiple ready reserves, including mines, after capturing a factory this turn");
  ok(factory.stored.length === 1 && factory.stored[0].typeId === "CHARLIE" && factory.stored[0].moved,
    "capturing infantry cannot redeploy along with the ready reserves");

  var blocked = game([{t:"PELICAN",o:0,x:1,y:0},{t:"CHARLIE",o:0,x:0,y:0}], [], ["..MMM"]);
  blocked.moveUnit(blocked.units[1],1,0); nextRound(blocked);
  blocked.units[0].movePointsLeft = 0;
  blocked.terrain[0][0] = TERRAIN_BY_CHAR.M;
  AI.playTurn(blocked,0);
  ok(blocked.units[0].cargo.length === 1 && blocked.units[0].cargo[0].carriedBy === blocked.units[0].id,
    "CPU retains cargo when there is no legal unloading destination");

  var crossing = game([{t:"PELICAN",o:0,x:2,y:1},{t:"PANTHER",o:0,x:1,y:1}], null,
    [".....MMMMM..........", "B....MMMMM.........B", ".....MMMMM.........."]);
  for (var turn = 0; crossing.winner === null && turn < 10; turn++) {
    AI.playTurn(crossing,0); if (crossing.winner === null) nextRound(crossing);
  }
  ok(crossing.winner === 0, "CPU airlift crosses a ground-impassable barrier and unloads on the reachable side");

  function atlasFixture(count) {
    var enemies = [];
    for (var i = 0; i < count; i++) enemies.push({t:i === 3 ? "FALCON" : "BISON",o:1,x:6+i,y:0});
    return game(enemies, [{col:0,row:1,owner:0},{col:19,row:1,owner:1},
      {col:3,row:1,owner:0,stored:["ATLAS"]}],
      ["....................", "B..F...............B", "...................."]);
  }
  var atlasLow = atlasFixture(3); AI.playTurn(atlasLow,0);
  ok(atlasLow.buildingAt(3,1).stored.length === 1, "CPU holds Atlas below the documented four-squad deployment condition");
  var atlasHigh = atlasFixture(4); AI.playTurn(atlasHigh,0);
  ok(atlasHigh.playerUnits(0).some(function(u) { return u.typeId === "ATLAS"; }),
    "CPU deploys Atlas when four enemies are in range, including aircraft");

  var defense = game([{t:"BISON",o:0,x:12,y:1},{t:"PELICAN",o:1,x:6,y:0},{t:"CHARLIE",o:1,x:7,y:0}]);
  defense.currentPlayer = 1;
  defense.moveUnit(defense.units[2],6,0);
  defense.endTurn();
  var tank = defense.units[0], before = HEX.distance(tank.col,tank.row,0,1);
  var events = AI.playTurn(defense,0);
  ok(events.some(function(e) { return e.reason === "defend"; }) && HEX.distance(tank.col,tank.row,0,1) < before,
    "CPU pulls a distant defender back toward its base when an infantry-loaded Pelican approaches");

  var guarded = game([{t:"CHARLIE",o:0,x:6,y:2},{t:"FALCON",o:1,x:9,y:1}],
    [{col:0,row:1,owner:0},{col:19,row:1,owner:1},{col:9,row:2,owner:-1},{col:1,row:2,owner:-1}],
    ["....................", "B..................B", ".F.......F.........."]) ;
  var foot = guarded.units[0]; AI.playTurn(guarded,0);
  ok(foot.col < 6, "CPU infantry diverts toward the unguarded factory");

  // Watching must consume exactly the same action stream as immediate play.
  var source = game([{t:"PELICAN",o:0,x:2,y:1},{t:"CHARLIE",o:0,x:1,y:1}]);
  var immediate = ENGINE.Game.restore(source.snapshot()), watched = ENGINE.Game.restore(source.snapshot());
  AI.playTurn(immediate,0);
  var runner = AI.createTurn(watched,0), eventCount = 0;
  while (runner.next()) { if (++eventCount > 100) throw new Error("CPU turn did not terminate"); }
  ok(JSON.stringify(immediate.snapshot()) === JSON.stringify(watched.snapshot()),
    "watched and immediate transport actions yield identical save state");
};
