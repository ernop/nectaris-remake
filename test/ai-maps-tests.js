"use strict";
module.exports = function (ok) {
  var maps = require("../js/data-ai-maps.js"), HEX = require("../js/hex.js");
  var ENGINE = require("../js/engine.js"), types = require("../js/data-units.js").UNIT_TYPES;
  ok(maps.length === 10 && new Set(maps.map(function (m) {return JSON.stringify(m.grid);})).size === 10,
    "all ten fjord maps have distinct layouts");
  require("./arsenal-map-tests.js")(ok);
  require("./scarce-fjords-tests.js")(ok);
  require("./symmetric-fjords-tests.js")(ok);
  require("./laced-fjords-tests.js")(ok);
  require("./turning-fjords-tests.js")(ok);
  ok(maps[2].grid.length === 40 && maps[2].grid.every(function (row) {return row.length === 40;}),
    "Part 3 is exactly 40 by 40 hexes");
  maps.slice(0,3).forEach(function (map, mapIndex) {
  var game = new ENGINE.Game(map, {seed: 7});
  var factories = Object.values(game.buildings).filter(function (b) { return b.kind === "factory"; });
  var bases = Object.values(game.buildings).filter(function (b) { return b.kind === "base"; });
  ok(map.pack === "AI-made" && factories.length === 15, "fjords has fifteen factories in the AI-made pack");
  ok(JSON.stringify(map) === JSON.stringify(require("../" + map.source)),
    "downloadable level exactly matches the built-in battlefield");

  function flood(start, passable) {
    var visited = new Set([HEX.key(start.col, start.row)]), queue = [start];
    for (var i = 0; i < queue.length; i++) {
      HEX.neighbors(queue[i].col, queue[i].row).forEach(function (p) {
        var key = HEX.key(p.col, p.row);
        if (game.inBounds(p.col, p.row) && !visited.has(key) && passable(p)) {
          visited.add(key); queue.push(p);
        }
      });
    }
    return visited;
  }
  var open = flood(bases[0], function (p) { return map.grid[p.row][p.col] !== "M"; });
  var walls = flood({col: 0, row: 0}, function (p) { return map.grid[p.row][p.col] === "M"; });
  var floorCount = 0, mountainCount = 0, hillCount = 0, roadCount = 0;
  map.grid.forEach(function (row) { row.split("").forEach(function (ch) {
    if (ch === "M") mountainCount++; else floorCount++;
    if (ch === "h") hillCount++;
    if (ch === "-") roadCount++;
  }); });
  ok(open.size === floorCount, "all fjords, factories and bases connect without crossing mountains");
  if (mapIndex === 0) ok(walls.size === mountainCount, "first map's warped tree arms never join into loops around mountain islands");
  else {
    var islands = [], visited = new Set(walls);
    map.grid.forEach(function (row, r) { row.split("").forEach(function (ch, c) {
      if (ch !== "M" || visited.has(HEX.key(c, r))) return;
      var island = flood({col: c, row: r}, function (p) { return map.grid[p.row][p.col] === "M"; });
      island.forEach(function (k) { visited.add(k); }); islands.push(island.size);
    }); });
    ok(islands.filter(function (size) { return size >= 10; }).length >= (mapIndex === 1 ? 4 : 2),
      "linked maps have multiple substantial mountain islands encircled by connected fjords");
    var narrowRows = 0;
    map.grid.forEach(function (row) { narrowRows += (row.match(/M[^M]{2}(?=M)/g) || []).length; });
    ok(narrowRows >= (mapIndex === 1 ? 20 : 8) && map.grid.join("").split("w").length > (mapIndex === 1 ? 100 : 50),
      "linked maps have many two-hex pinches and substantial wasteland terrain");
    var tips = factories.map(function (b) {
      var count = 0;
      for (var r = b.row-3; r <= b.row+3; r++) for (var c = b.col-3; c <= b.col+3; c++) {
        if (game.inBounds(c, r) && map.grid[r][c] !== "M" && HEX.distance(c,r,b.col,b.row) <= 3) count++;
      }
      return count;
    });
    ok(tips.filter(function (n) {return n >= 10;}).length >= 6 && tips.filter(function (n) {return n <= 9;}).length >= 6,
      "factory ends alternate between flared bowls and tapered approaches");
  }
  ok(hillCount > 80 && roadCount > 200 && mountainCount > floorCount,
    "a mountain massif surrounds substantial roads, plains and +20 hill cover");
  ["MULE", "GIANT"].forEach(function (id) {
    var reachable = flood(bases[0], function (p) {
      return terrainCost(game.terrainAt(p.col, p.row), types[id].moveType, types[id]) !== null;
    });
    ok(Object.values(game.buildings).every(function (b) { return reachable.has(HEX.key(b.col,b.row)); }),
      id + " can reach every base and factory despite terrain variation");
  });

  var reserveTypes = new Set();
  factories.forEach(function (factory, index) {
    var label = "fjord factory " + (index + 1);
    ok(factory.owner === -1 && factory.stored.length === 12, label + " begins neutral with twelve reserves");
    var ns = HEX.neighbors(factory.col, factory.row);
    var mouths = ns.filter(function (p) { return game.terrainAt(p.col, p.row).id !== "mountain"; });
    ok(mouths.length === 1 && game.terrainAt(mouths[0].col, mouths[0].row).id === "road",
      label + " has five mountain walls and exactly one road mouth");
    factory.owner = 0;
    factory.stored.forEach(function (unit) {
      reserveTypes.add(unit.typeId); unit.player = 0;
      ok(unit.type.moveType !== "air" && unit.type.cls !== "air", label + " contains only ground forces");
      var exits = game.deployTargets(factory, unit);
      ok(exits.length === 1 && exits[0].col === mouths[0].col && exits[0].row === mouths[0].row,
        label + ": " + unit.typeId + " can use only the single road exit");
    });
    var tank = factory.stored.find(function (u) { return u.type.cls === "tank"; });
    game.deployFromFactory(factory, tank, mouths[0].col, mouths[0].row);
    ok(tank.moved && tank.movePointsLeft === 0 && factory.stored.every(function (u) {
      return game.deployTargets(factory, u).length === 0;
    }), label + " stops further field deployment when this turn's unit occupies the mouth");
  });
  Object.keys(types).filter(function (id) { return types[id].cls === "tank"; }).forEach(function (id) {
    ok(reserveTypes.has(id), "factory mix includes " + id);
  });
  ["HADRIAN", "OCTOPUS", "RABBIT", "LYNX", "CHARLIE", "KILROY", "PANTHER", "MULE", "SEEKER"].forEach(function (id) {
    ok(reserveTypes.has(id), "ground roles include " + id);
  });
  bases.forEach(function (base) {
    var army = map.units.filter(function (u) { return u.o === base.owner; });
    ok(army.length === 8 && army.filter(function (u) { return types[u.t].cls === "tank"; }).length === 5 &&
      army.filter(function (u) { return types[u.t].cls === "infantry"; }).length === 3,
      "player " + base.owner + " starts with five tanks and three infantry");
    ok(army.every(function (u) { return HEX.distance(u.x, u.y, base.col, base.row) <= 2; }),
      "player " + base.owner + " starts together at its home camp");
  });
  ok(bases[0].col < 5 && bases[0].row < 5 && bases[1].col >= game.width-5 && bases[1].row >= game.height-5 &&
    HEX.distance(bases[0].col, bases[0].row, bases[1].col, bases[1].row) > game.width * 0.9,
    "home camps sit far apart in opposite corners");

  // On the following turn, moving the deployed tank frees the same exit.
  game.endTurn(); game.endTurn();
  var first = factories[0], deployed = game.units.find(function (u) {
    return HEX.distance(u.col, u.row, first.col, first.row) === 1;
  });
  var destination = Object.values(game.movementRange(deployed)).find(function (p) {
    return p.canStop && !game.buildingAt(p.col, p.row) && (p.col !== deployed.col || p.row !== deployed.row);
  });
  ok(!!destination, "a deployed tank can leave the factory mouth on its next turn");
  if (destination) {
    game.moveUnit(deployed, destination.col, destination.row);
    ok(game.deployTargets(first, first.stored[0]).length === 1, "clearing the mouth allows the next reinforcement");
  }
  var restored = ENGINE.Game.restore(game.snapshot());
  ok(restored.map.pack === "AI-made" && restored.width === game.width &&
    Object.values(restored.buildings).filter(function (b) { return b.kind === "factory"; }).length === 15,
    "large AI-made map and factory inventories survive saving and restoration");
  });

  var dense = maps[3], denseGame = new ENGINE.Game(dense, {seed:19});
  ok(dense.grid.length === 28 && dense.grid.every(function(row){return row.length === 28;}),
    "Part 4 is a smaller 28 by 28 battlefield");
  ok(JSON.stringify(dense) === JSON.stringify(require("../levels/honeycomb-fjords.json")),
    "Part 4 download matches the game");
  var denseFactories = Object.values(denseGame.buildings).filter(function(b){return b.kind === "factory";});
  ok(denseFactories.length === 8 && denseFactories.every(function(b){return b.owner === -1 && b.stored.length === 10;}),
    "Part 4 scales down to eight neutral factories with ten units each");
  denseFactories.forEach(function(b){
    b.owner = 0;
    b.stored.forEach(function(u){u.player = 0;});
    var neighbors = HEX.neighbors(b.col,b.row);
    ok(neighbors.filter(function(p){return dense.grid[p.row][p.col] === "M";}).length === 5 &&
      b.stored.every(function(u){return u.type.moveType !== "air" && denseGame.deployTargets(b,u).length === 1;}),
      "dense pocket factory has five mountain walls and a single ground exit");
  });
  [0,1].forEach(function(owner){
    var army = dense.units.filter(function(u){return u.o === owner;});
    ok(army.filter(function(u){return types[u.t].cls === "tank";}).length === 4 &&
      army.filter(function(u){return types[u.t].cls === "infantry";}).length === 3,
      "Part 4 starts each side with four tanks and three infantry");
  });
  var visited = new Set(), pockets = [], floors = [];
  dense.grid.forEach(function(row,r){row.split("").forEach(function(ch,c){
    if (visited.has(HEX.key(c,r))) return;
    var mountain = ch === "M", queue = [{col:c,row:r}]; visited.add(HEX.key(c,r));
    for (var i=0;i<queue.length;i++) HEX.neighbors(queue[i].col,queue[i].row).forEach(function(p){
      var k = HEX.key(p.col,p.row);
      if (denseGame.inBounds(p.col,p.row) && !visited.has(k) && (dense.grid[p.row][p.col] === "M") === mountain) {
        visited.add(k); queue.push(p);
      }
    });
    (mountain ? pockets : floors).push(queue.length);
  });});
  ok(pockets.length >= 12 && Math.max.apply(null,pockets) <= 19,
    "Part 4 has only small isolated mountain pockets, never a contiguous massif");
  ok(floors.length === 1 && floors[0] > 500, "dense tunnels form one interconnected network throughout the board");

  var R = require("../js/render.js"), oldStyle = R.getStyle(), oldSet = R.getIconSet();
  ["pixel", "neon", "classic"].forEach(function (style) {
    R.setStyle(style);
    ["remake", "legacy"].forEach(function (art) {
      R.setIconSet(art);
      [[940, 590], [320, 400]].forEach(function (size) {
        var renderer = new R.Renderer({width:size[0],height:size[1],getContext:function(){return {}; }},
          {width:65,height:49,inBounds:function(c,r){return c>=0&&r>=0&&c<65&&r<49;}});
        renderer.fitToMap();
        ok(!renderer.panAxes().x && !renderer.panAxes().y && renderer.minimumZoom() < renderer.zoom,
          style + "/" + art + " fits the entire fjord map with further zoom-out room at " + size);
        var zoom = renderer.zoom;
        renderer.zoom *= 0.8; renderer.constrainView();
        ok(renderer.zoom < zoom && !renderer.panAxes().x && !renderer.panAxes().y,
          "overview zoom stays below fit after view constraints");
        var p = renderer.hexCenter(61,45), hit = renderer.pixelToHex(p.x,p.y);
        ok(hit && hit.col === 61 && hit.row === 45, "distant base remains selectable at overview zoom");
      });
    });
  });
  R.setIconSet(oldSet); R.setStyle(oldStyle);
};
