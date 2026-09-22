"use strict";
module.exports = function (ok) {
  var map = require("../js/data-ai-maps.js")[4], ENGINE = require("../js/engine.js");
  var HEX = require("../js/hex.js"), types = require("../js/data-units.js").UNIT_TYPES;
  var game = new ENGINE.Game(map, {seed:5});
  var factories = Object.values(game.buildings).filter(function (b) {return b.kind === "factory";});
  ok(map.name === "ARSENAL FJORDS" && game.width === 28 && game.height === 28,
    "Part 5 is the compact Arsenal Fjords map");
  ok(JSON.stringify(map) === JSON.stringify(require("../levels/arsenal-fjords.json")),
    "Part 5 downloadable JSON matches the game");
  ok(factories.length === 9, "nine factories allow an equal split of one, two and three exits");
  var buckets = [0,0,0], sizes = [], roster = new Set(), pairs = [];
  factories.forEach(function (factory) {
    var label = "Arsenal " + factory.col + "," + factory.row;
    var definition = map.buildings.find(function(b){return b.col === factory.col && b.row === factory.row;});
    ok(factory.owner === -1 && !!definition.inventoryTheme, label + " is neutral with an authored inventory theme");
    var ns = HEX.neighbors(factory.col,factory.row);
    var mouths = ns.filter(function(p){return game.terrainAt(p.col,p.row).id === "road";});
    ok(mouths.length >= 1 && mouths.length <= 3 && ns.every(function(p){
      return ["road","mountain"].includes(game.terrainAt(p.col,p.row).id);
    }), label + " has one to three road mouths, with mountain walls on every other side");
    buckets[mouths.length-1]++;
    sizes.push(factory.stored.length);
    ok(factory.stored.length >= 1 && factory.stored.length <= 12,
      label + " holds between one and twelve units");
    ok(new Set(definition.stored).size <= 5, label + " uses at most five unit types");
    ok(factory.stored.filter(function(u){return u.type.cls === "artillery";}).length <= 2,
      label + " contains at most two artillery units");
    factory.owner = 0;
    factory.stored.forEach(function (unit,index) {
      unit.player = 0; roster.add(unit.typeId);
      ok(unit.type.moveType !== "air" || unit.typeId === "PELICAN", "Part 5 only permits Pelican aircraft");
      ok(game.deployTargets(factory,unit).length === mouths.length,
        label + ": " + unit.typeId + " has exactly the authored number of real deployment areas");
      if (unit.type.placeByTransport) {
        var carrier = factory.stored[index-1];
        ok(carrier && ["MULE","PELICAN"].includes(carrier.typeId) && game.canLoad(carrier,unit,true),
          label + ": every immobile unit immediately follows its own compatible transport");
        pairs.push({col:factory.col,row:factory.row,index:index});
      }
    });
    // Occupying one mouth removes exactly that one output area, for air too.
    var first = factory.stored[0];
    game.deployFromFactory(factory,first,mouths[0].col,mouths[0].row);
    ok(game.deployTargets(factory,first).length === mouths.length-1,
      label + " loses one output area when a deployed unit occupies it");
  });
  ok(JSON.stringify(buckets) === "[3,3,3]", "exactly three factories each have one, two or three exits");
  ok(Math.min.apply(null,sizes) === 1 && Math.max.apply(null,sizes) === 12 && new Set(sizes).size >= 6,
    "inventory sizes vary from a single reserve to a twelve-unit arsenal");
  ok(roster.size <= 9 && roster.has("PELICAN") && roster.has("ATLAS") && roster.has("TRIGGER"),
    "the smaller roster includes Pelicans, Atlas guns and mines");
  ok(sizes.reduce(function(a,b){return a+b;},0) === 51, "Part 5 has 51 total factory reserves");

  pairs.forEach(function(pair) {
    var g = new ENGINE.Game(map,{seed:5}), b = g.buildingAt(pair.col,pair.row);
    b.owner=0; b.stored.forEach(function(u){u.player=0;});
    var carrier=b.stored[pair.index-1], cargo=b.stored[pair.index];
    var exit=g.deployTargets(b,carrier)[0];
    g.deployFromFactory(b,carrier,exit.col,exit.row);
    ok(g.transportDeployTargets(b,cargo).includes(carrier), cargo.typeId + " can board the preceding deployed carrier");
    g.loadFromFactory(b,cargo,carrier);
    ok(carrier.cargo[0] === cargo && cargo.carriedBy === carrier.id && cargo.moved,
      cargo.typeId + " loads inside the carrier without blocking a second exit");
    g.endTurn(); g.endTurn();
    var move=Object.values(g.movementRange(carrier)).find(function(p){
      return p.canStop && !g.buildingAt(p.col,p.row) && HEX.distance(p.col,p.row,b.col,b.row)>=3;
    });
    ok(!!move, carrier.typeId + " can carry its immobile passenger out of the factory approach");
    if (move) {
      g.moveUnit(carrier,move.col,move.row);
      var landing=g.unloadTargets(carrier,cargo)[0];
      ok(!!landing, carrier.typeId + " has legal terrain for unloading its gun or mine");
      if (landing) {
        g.unload(carrier,cargo,landing.col,landing.row);
        ok(!cargo.carriedBy && g.unitAt(landing.col,landing.row) === cargo,
          cargo.typeId + " reaches its firing or mine position through transport");
      }
    }
  });

  // The compact map must still be densely connected with small mountain pockets.
  var visited = new Set(), pockets = [], floors = [];
  map.grid.forEach(function(row,r){row.split("").forEach(function(ch,c){
    if (visited.has(HEX.key(c,r))) return;
    var mountain=ch === "M", queue=[{col:c,row:r}]; visited.add(HEX.key(c,r));
    for (var i=0;i<queue.length;i++) HEX.neighbors(queue[i].col,queue[i].row).forEach(function(p){
      var k=HEX.key(p.col,p.row);
      if (game.inBounds(p.col,p.row) && !visited.has(k) && (map.grid[p.row][p.col] === "M") === mountain) {
        visited.add(k); queue.push(p);
      }
    });
    (mountain ? pockets : floors).push(queue.length);
  });});
  ok(Math.max.apply(null,pockets)<=19 && floors.length === 1 && floors[0]>500,
    "Part 5 preserves the connected tunnel mesh without large mountain masses");
  [0,1].forEach(function(player){
    var army=map.units.filter(function(u){return u.o === player;});
    ok(army.length === 7 && army.filter(function(u){return types[u.t].cls === "tank";}).length === 4 &&
      army.filter(function(u){return types[u.t].cls === "infantry";}).length === 3,
      "Part 5 starts each player with four tanks and three infantry");
  });
};
