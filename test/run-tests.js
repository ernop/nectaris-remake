/* Nectaris remake — node test suite.
 * Run: node test/run-tests.js
 *
 * 1. Static validation of every campaign and expansion map.
 * 2. Rule unit-tests (hex math, movement/ZOC, combat calculator steps).
 * 3. AI-vs-AI self-play on every included map (crash + termination check).
 */
"use strict";

var cryptoModule = require("node:crypto");
var path = require("path");
var HEX = require(path.join(__dirname, "../js/hex.js"));
global.HEX = HEX;
var terr = require(path.join(__dirname, "../js/data-terrain.js"));
global.TERRAIN = terr.TERRAIN; global.TERRAIN_BY_CHAR = terr.TERRAIN_BY_CHAR; global.terrainCost = terr.terrainCost;
var units = require(path.join(__dirname, "../js/data-units.js"));
global.UNIT_TYPES = units.UNIT_TYPES; global.mergeUnitTypes = units.mergeUnitTypes;
var COMBAT = require(path.join(__dirname, "../js/combat.js"));
global.COMBAT = COMBAT;
var ENGINE = require(path.join(__dirname, "../js/engine.js"));
global.ENGINE = ENGINE;
var AI = require(path.join(__dirname, "../js/ai.js"));
var RENDER = require(path.join(__dirname, "../js/render.js"));
var CAMPAIGN = require(path.join(__dirname, "../js/data-maps.js"));
var ADVANCED_CAMPAIGN = require(path.join(__dirname, "../js/data-advanced-maps.js"));
var EXPANSION_LEVELS = require(path.join(__dirname, "../js/data-expansion-maps.js"));
var BASE_NECTARIS_LEVELS = require(path.join(__dirname, "../js/data-basenectaris-maps.js")).BASE_NECTARIS_LEVELS;
var AI_MADE_LEVELS = require(path.join(__dirname, "../js/data-ai-maps.js"));
var ALL_MAPS = CAMPAIGN.concat(ADVANCED_CAMPAIGN, EXPANSION_LEVELS, BASE_NECTARIS_LEVELS, AI_MADE_LEVELS);

var failures = 0, checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error("  FAIL: " + msg); }
}
function section(name) { console.log("== " + name); }

/* ---------- 1. map validation ---------- */

section("campaign + expansion map validation");
ALL_MAPS.forEach(function (m, mi) {
  var label = "map " + (mi + 1) + " " + m.name;
  var w = m.grid[0].length;
  m.grid.forEach(function (row, ri) {
    ok(row.length === w, label + ": row " + ri + " length " + row.length + " != " + w);
    for (var c = 0; c < row.length; c++) {
      ok(!!TERRAIN_BY_CHAR[row[c]], label + ": bad char '" + row[c] + "' at " + c + "," + ri);
    }
  });
  // building declarations sit on F/B tiles
  (m.buildings || []).forEach(function (b) {
    var ch = m.grid[b.row] && m.grid[b.row][b.col];
    ok(ch === "F" || ch === "B", label + ": building decl at " + b.col + "," + b.row + " sits on '" + ch + "'");
    (b.stored || []).forEach(function (s) {
      var t = typeof s === "string" ? s : s.t;
      ok(!!UNIT_TYPES[t], label + ": unknown stored type " + t);
    });
  });
  // every base has an owner declared
  m.grid.forEach(function (row, ri) {
    for (var c = 0; c < row.length; c++) {
      if (row[c] === "B") {
        var found = (m.buildings || []).some(function (b) { return b.col === c && b.row === ri && b.owner !== undefined; });
        ok(found, label + ": base at " + c + "," + ri + " lacks an owner declaration");
      }
    }
  });
  // both sides own exactly one base
  var bases = [0, 0];
  (m.buildings || []).forEach(function (b) {
    if (m.grid[b.row][b.col] === "B" && b.owner >= 0) bases[b.owner]++;
  });
  ok(bases[0] >= 1 && bases[1] >= 1, label + ": needs a base per side, got " + bases);

  // units: known type, on-map, passable terrain, no stacking
  var seen = {};
  (m.units || []).forEach(function (u) {
    ok(!!UNIT_TYPES[u.t], label + ": unknown unit type " + u.t);
    ok(u.x >= 0 && u.x < w && u.y >= 0 && u.y < m.grid.length, label + ": " + u.t + " off-map at " + u.x + "," + u.y);
    var t = TERRAIN_BY_CHAR[m.grid[u.y][u.x]];
    var cost = terrainCost(t, UNIT_TYPES[u.t].moveType, UNIT_TYPES[u.t]);
    ok(cost !== null, label + ": " + u.t + " on impassable " + t.id + " at " + u.x + "," + u.y);
    var k = u.x + "," + u.y;
    ok(!seen[k], label + ": two units stacked at " + k);
    seen[k] = true;
  });

  // constructing the game must not throw
  try { new ENGINE.Game(m, { seed: 42 }); ok(true, ""); }
  catch (e) { ok(false, label + ": Game constructor threw: " + e.message); }
});
console.log("  " + ALL_MAPS.length + " maps checked");

section("AI-made fjord layout and factory bottlenecks");
require("./ai-maps-tests.js")(ok);

var campaignPayload = CAMPAIGN.map(function (m) {
  return { grid: m.grid, buildings: m.buildings, units: m.units };
});
ok(cryptoModule.createHash("sha256").update(JSON.stringify(campaignPayload))
  .digest("hex") === "54edc11e231ed865388d7b2e0371ad17971cdf8a96b683debb914cd0db1b991b",
  "campaign terrain, deployments and factory inventories match the extracted original data");

var expectedCampaign = [
  ["REVOLT", 15, 10, 5, 4, 0], ["ICARUS", 15, 10, 8, 6, 0],
  ["CYRANO", 15, 10, 6, 6, 0], ["RAMSEY", 15, 20, 9, 8, 2],
  ["NEWTON", 15, 20, 6, 5, 8], ["SENECA", 15, 20, 10, 7, 7],
  ["SABINE", 30, 10, 10, 11, 7], ["ARATUS", 30, 10, 19, 19, 8],
  ["GALOIS", 30, 20, 13, 16, 25], ["DARWIN", 30, 20, 16, 12, 28],
  ["PASCAL", 30, 20, 14, 16, 24], ["HALLEY", 30, 20, 17, 15, 23],
  ["BORMAN", 30, 20, 11, 11, 23], ["APPOLO", 30, 20, 13, 14, 19],
  ["KAISER", 30, 20, 12, 15, 27], ["NECTOR", 30, 20, 15, 18, 23],
];
CAMPAIGN.forEach(function (m, i) {
  var expected = expectedCampaign[i];
  var forces = [0, 0], neutral = 0;
  m.units.forEach(function (u) { forces[u.o]++; });
  m.buildings.forEach(function (building) {
    var stored = (building.stored || []).length;
    if (building.owner === 0 || building.owner === 1) forces[building.owner] += stored;
    else neutral += stored;
  });
  ok(m.name === expected[0] && m.grid[0].length === expected[1] &&
    m.grid.length === expected[2], m.name + ": original name and dimensions");
  ok(forces[0] === expected[3] && forces[1] === expected[4] &&
    neutral === expected[5], m.name + ": original initial force totals");
});

var advancedPayload = ADVANCED_CAMPAIGN.map(function (m) {
  return {grid:m.grid, buildings:m.buildings, units:m.units};
});
ok(ADVANCED_CAMPAIGN.length === 16 && cryptoModule.createHash("sha256")
  .update(JSON.stringify(advancedPayload)).digest("hex") ===
  "e0f11254f8afcb071143a0cc67cc8ef8f4f799e762d1d345db85051e7a26c593",
  "all sixteen advanced missions match the extracted official deployments and reserves");
var advancedTotals = [[9,8,0],[9,11,0],[13,15,0],[5,7,11],[6,15,24],[10,11,11],
  [13,16,21],[15,22,2],[9,9,35],[19,14,23],[14,19,18],[18,13,25],
  [14,19,23],[13,16,27],[18,18,18],[3,7,8]];
ADVANCED_CAMPAIGN.forEach(function(m,i) {
  var forces = [0,0,0];
  m.units.forEach(function(u) { forces[u.o]++; });
  m.buildings.forEach(function(b) { forces[b.owner < 0 ? 2 : b.owner] += (b.stored || []).length; });
  ok(m.name === CAMPAIGN[i].name.split("").reverse().join("") && m.turnLimit === 50,
    m.name + ": original advanced name and turn limit");
  ok(JSON.stringify(m.grid) === JSON.stringify(CAMPAIGN[i].grid), m.name + ": advanced campaign reuses its original battlefield");
  ok(JSON.stringify(forces) === JSON.stringify(advancedTotals[i]), m.name + ": advanced force totals cross-checked against the PCE stage guide");
  ok(JSON.stringify(m.units) !== JSON.stringify(CAMPAIGN[i].units), m.name + ": advanced deployment is distinct from normal");
});

/* ---------- 2. rules ---------- */

section("hex math");
ok(HEX.distance(0, 0, 0, 0) === 0, "distance self");
ok(HEX.distance(0, 0, 3, 0) === 3, "distance along row");
var ns = HEX.neighbors(4, 4);
ok(ns.length === 6, "6 neighbors");
ns.forEach(function (n) {
  ok(HEX.distance(4, 4, n.col, n.row) === 1, "neighbor at distance 1: " + n.col + "," + n.row);
});
// pixel round-trip
for (var c = 0; c < 8; c++) {
  for (var r = 0; r < 8; r++) {
    var p = HEX.toPixel(c, r, 20);
    var back = HEX.fromPixel(p.x, p.y, 20);
    ok(back.col === c && back.row === r, "pixel round-trip " + c + "," + r);
  }
}

section("renderer roads and viewport constraints");
var rendererGame = {
  width: 3,
  height: 3,
  inBounds: function (col, row) { return col >= 0 && row >= 0 && col < 3 && row < 3; },
  terrainAt: function (col, row) {
    var rows = ["...", "-=B", "..."];
    return TERRAIN_BY_CHAR[rows[row][col]];
  },
};
var rendererCanvas = { width: 800, height: 600, getContext: function () { return {}; } };
var renderer = new RENDER.Renderer(rendererCanvas, rendererGame);
renderer.fitToMap();
var fittedAxes = renderer.panAxes();
ok(!fittedAxes.x && !fittedAxes.y, "fitted map is fully visible on both axes");
var fittedX = renderer.originX, fittedY = renderer.originY;
ok(renderer.panBy(100, 100), "dragging a fully visible map changes its position");
ok(renderer.originX === fittedX + 100 && renderer.originY === fittedY + 100,
  "fully visible map follows the pointer without snapping to center");
renderer.zoom = 10;
renderer.constrainView();
var zoomedAxes = renderer.panAxes();
ok(zoomedAxes.x && zoomedAxes.y, "zoomed map can pan on both oversized axes");
ok(renderer.panBy(-100, -100), "dragging a zoomed map changes its origin");
ok(renderer.roadNeighbors(1, 1).length === 2, "bridge connects to adjacent road and base");
var roadHub = renderer.roadHub(0, 1);
var bridgeHub = renderer.roadHub(1, 1);
ok(Math.abs(roadHub.y - bridgeHub.y) < 0.0001,
  "same-row road tile variants align on one horizontal line");
var thumbnailOps = 0;
var thumbnailScales = [];
function recordingContext(assignments, scales) {
  return new Proxy({
    scale: function (x, y) {
      thumbnailOps++;
      if (scales) scales.push([x, y]);
    },
  }, {
    get: function (target, property) {
      if (!(property in target)) {
        target[property] = function () { thumbnailOps++; };
      }
      return target[property];
    },
    set: function (target, property, value) {
      if (assignments) assignments.push([property, value]);
      target[property] = value;
      return true;
    },
  });
}
var thumbnailContext = recordingContext(null, thumbnailScales);
RENDER.drawUnitIcon({
  width: 56, height: 44,
  getContext: function () { return thumbnailContext; },
}, { typeId: "BISON", type: UNIT_TYPES.BISON, player: 0 });
ok(thumbnailOps > 20, "factory thumbnail draws the stored unit silhouette");
ok(thumbnailScales.length === 0, "Union unit silhouettes retain their rightward facing");
RENDER.drawUnitIcon({
  width: 56, height: 44,
  getContext: function () { return thumbnailContext; },
}, { typeId: "BISON", type: UNIT_TYPES.BISON, player: 1 });
ok(thumbnailScales.length === 0,
  "pixel Xenon icons use an authored left-facing frame without reflecting its lighting");
var mapUnitDraws = true;
var mapFacingScales = [];
var mapRightFacingScales = [];
try {
  ["neon", "pixel", "classic"].forEach(function (style) {
    RENDER.setStyle(style);
    ["BISON", "TRIGGER"].forEach(function (typeId) {
      renderer.ctx = recordingContext(null, mapRightFacingScales);
      renderer.drawUnit({
        id: "renderer-union-" + style + "-" + typeId,
        typeId: typeId, type: UNIT_TYPES[typeId],
        player: 0, col: 1, row: 1, moved: false, strength: 8, exp: 0, cargo: [],
      });
      renderer.ctx = recordingContext(null, mapFacingScales);
      renderer.drawUnit({
        id: "renderer-xenon-" + style + "-" + typeId,
        typeId: typeId, type: UNIT_TYPES[typeId],
        player: 1, col: 1, row: 1, moved: false, strength: 8, exp: 0, cargo: [],
      });
    });
  });
} catch (err) {
  mapUnitDraws = false;
}
RENDER.setStyle("neon");
ok(mapUnitDraws, "map unit chrome renders in neon, pixel, and classic styles");
ok(mapFacingScales.filter(function (scale) {
  return scale[0] === -1 && scale[1] === 1;
}).length === 4, "classic and neon reflect enemy silhouettes; pixel uses directional frames");
ok(mapRightFacingScales.length === 0,
  "player tanks and mines face right in every visual style");

rendererGame.currentPlayer = 0;
var spentAssignments = [];
renderer.ctx = recordingContext(spentAssignments, null);
renderer.drawUnit({
  id: "spent-unit", typeId: "BISON", type: UNIT_TYPES.BISON,
  player: 0, col: 1, row: 1, moved: true, strength: 7, exp: 3, cargo: [],
});
ok(spentAssignments.some(function (assignment) {
  return assignment[0] === "filter" && assignment[1] === "grayscale(1)";
}) && !spentAssignments.some(function (assignment) {
  return assignment[0] === "globalAlpha" && assignment[1] === 0.45;
}), "a completed current-player unit is fully greyscale without reduced opacity");

var activeAssignments = [];
renderer.ctx = recordingContext(activeAssignments, null);
renderer.drawUnit({
  id: "active-unit", typeId: "RABBIT", type: UNIT_TYPES.RABBIT,
  player: 0, col: 1, row: 1, moved: false, strength: 8, exp: 0, cargo: [],
});
ok(!activeAssignments.some(function (assignment) {
  return assignment[0] === "filter";
}), "a unit with an open activation remains at full color");

var opponentAssignments = [];
renderer.ctx = recordingContext(opponentAssignments, null);
renderer.drawUnit({
  id: "opponent-unit", typeId: "BISON", type: UNIT_TYPES.BISON,
  player: 1, col: 1, row: 1, moved: true, strength: 8, exp: 0, cargo: [],
});
ok(!opponentAssignments.some(function (assignment) {
  return assignment[0] === "filter";
}), "the opposing army is not greyed during the current player's turn");

section("unit sprite set");
/* One native 32x32 right-facing sprite per stock unit, with indexed colours,
 * and no two stock units share artwork. */
var spriteIds = Object.keys(RENDER.UNIT_SPRITES);
Object.keys(UNIT_TYPES).forEach(function (typeId) {
  var art = RENDER.UNIT_SPRITES[typeId];
  ok(!!art, "stock unit " + typeId + " has its own sprite");
  if (!art) return;
  ok(art.length === RENDER.SPRITE_H, typeId + " sprite has " + RENDER.SPRITE_H + " rows (got " + art.length + ")");
  art.forEach(function (row, r) {
    ok(row.length === RENDER.SPRITE_W, typeId + " sprite row " + r + " is " + RENDER.SPRITE_W + " wide (got " + row.length + ")");
    for (var c = 0; c < row.length; c++) {
      var code = row.charAt(c);
      ok(code === "." || RENDER.SPRITE_CODES.indexOf(code) >= 0,
        typeId + " sprite row " + r + " col " + c + " uses unknown code " + JSON.stringify(code));
    }
  });
  ok(art.some(function (row) { return /[^.]/.test(row); }), typeId + " sprite is not blank");
});
spriteIds.forEach(function (a, i) {
  ok(!!UNIT_TYPES[a], "sprite " + a + " names a stock unit");
  for (var j = i + 1; j < spriteIds.length; j++) {
    ok(RENDER.UNIT_SPRITES[a].join("\n") !== RENDER.UNIT_SPRITES[spriteIds[j]].join("\n"),
      "sprites " + a + " and " + spriteIds[j] + " are distinct");
  }
});
ok(RENDER.spriteIdFor({ id: "CUSTOM_TANK", cls: "tank", moveType: "treads" }) === "BISON",
  "a custom tank without artwork renders as the class base chassis");
ok(RENDER.spriteIdFor({ id: "CUSTOM_HELI", cls: "transport", moveType: "air" }) === "PELICAN",
  "a custom air transport renders as the Pelican");
ok(RENDER.spriteIdFor({ id: "CUSTOM_MBT", cls: "tank", moveType: "treads", sprite: "GRIZZLY" }) === "GRIZZLY",
  "a custom unit may name a stock sprite");
var badSprite = false;
try { RENDER.spriteIdFor({ id: "X", cls: "tank", moveType: "treads", sprite: "NOPE" }); } catch (e) { badSprite = true; }
ok(badSprite, "naming an unknown sprite is an error, not a silent substitution");

section("native unit art and renderer integration");
require("./unit-art-tests.js")(ok);
require("./icon-set-tests.js")(ok);
require("./legacy-terrain-tests.js")(ok);
require("./mountain-terrain-tests.js")(ok);

section("attacker palette and faction colours");
RENDER.setStyle("pixel");
ok(RENDER.PLAYER_COLORS[0].name === "Union (blue)" && RENDER.PLAYER_COLORS[1].name === "Xenon (green)",
  "pixel style names the original faction colours: Union blue, Xenon green");
var attackAssignments = [];
renderer.attackingUnitId = "attacking-unit";
renderer.ctx = recordingContext(attackAssignments, null);
renderer.drawUnit({
  id: "attacking-unit", typeId: "GRIZZLY", type: UNIT_TYPES.GRIZZLY,
  player: 1, col: 1, row: 1, moved: true, strength: 8, exp: 0, cargo: [],
});
rendererGame.currentPlayer = 1;
ok(attackAssignments.some(function (assignment) {
  return assignment[0] === "fillStyle" && assignment[1] === "#be4448";
}), "the attacking unit is drawn in the deep-red attack body colour");
ok(!attackAssignments.some(function (assignment) {
  return assignment[0] === "fillStyle" && assignment[1] === RENDER.PLAYER_COLORS[1].body;
}), "the attacking unit shows no faction body colour");
ok(!attackAssignments.some(function (assignment) {
  return assignment[0] === "filter";
}), "the attacking unit is never greyed even after moving");
renderer.attackingUnitId = null;
rendererGame.currentPlayer = 0;
var bystanderAssignments = [];
renderer.ctx = recordingContext(bystanderAssignments, null);
renderer.drawUnit({
  id: "bystander", typeId: "GRIZZLY", type: UNIT_TYPES.GRIZZLY,
  player: 1, col: 1, row: 1, moved: false, strength: 8, exp: 0, cargo: [],
});
ok(!bystanderAssignments.some(function (assignment) {
  return assignment[0] === "fillStyle" && assignment[1] === "#be4448";
}), "a unit that is not attacking keeps its faction colours");
RENDER.setStyle("neon");

section("movement and ZOC");
var testMap = {
  name: "T", turnLimit: 50,
  grid: [
    "..........",
    "..........",
    "B.........",
    "..........",
    ".........B",
  ],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 9, row: 4, owner: 1 }],
  units: [
    { t: "BISON", o: 0, x: 2, y: 2 },
    { t: "BISON", o: 1, x: 5, y: 2 },
    { t: "CHARLIE", o: 0, x: 1, y: 1 },
  ],
};
var g = new ENGINE.Game(testMap, { seed: 7 });
var bison = g.unitAt(2, 2);
var range = g.movementRange(bison);
// plains cost 1 for treads: 6 movement reaches distance <= 6 barring ZOC
ok(!!range[HEX.key(2, 4)], "bison reaches (2,4)");
ok(!!range[HEX.key(0, 0)], "bison reaches (0,0)");
// hexes adjacent to the enemy at (5,2) must be terminal (stop) entries
var zocHex = range[HEX.key(4, 2)];
ok(!!zocHex && zocHex.stop === true, "entering enemy ZOC stops movement");
// cannot stop on a friendly unit's hex
var friendHex = range[HEX.key(1, 1)];
ok(!friendHex || !friendHex.canStop, "cannot stop on friendly hex");
// cannot enter the enemy hex itself
ok(!range[HEX.key(5, 2)], "cannot enter enemy hex");
// Starting inside enemy ZOC permits escape; entering another ZOC still stops.
var g2 = new ENGINE.Game({
  name: "T2", turnLimit: 50,
  grid: ["......", "......", "B....B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 5, row: 2, owner: 1 }],
  units: [{ t: "BISON", o: 0, x: 2, y: 0 }, { t: "BISON", o: 1, x: 3, y: 0 }],
}, { seed: 1 });
var b2 = g2.unitAt(2, 0);
var range2 = g2.movementRange(b2);
ok(range2[HEX.key(0, 0)].cost === 2, "unit starting in enemy ZOC can escape more than one hex");
ok(range2[HEX.key(2, 1)].stop, "moving directly from one enemy ZOC hex to another stops");

section("ZOC execution, same-turn changes and original Windows comparisons");
require("./zoc-tests.js")(ok);
require("./transport-turn-tests.js")(ok);

section("per-chassis terrain costs");
require("./terrain-movement-tests.js")(ok);
/* The published per-chassis table (see MECHANICS.md). Each row is checked
 * against a one-row map so a cost regression names the exact terrain. */
function costMap(grid, units) {
  return new ENGINE.Game({
    name: "C", turnLimit: 50, grid: grid,
    buildings: [{ col: 0, row: 0, owner: 0 }, { col: grid[0].length - 1, row: 0, owner: 1 }],
    units: units,
  }, { seed: 3 });
}
function costOf(game, unit, col, row) {
  var rec = game.movementRange(unit)[HEX.key(col, row)];
  return rec ? rec.cost : null;
}
var gc = costMap(["B.wh.Mv..B"], [{ t: "CHARLIE", o: 0, x: 1, y: 0 }]);
var foot = gc.unitAt(1, 0);
ok(costOf(gc, foot, 2, 0) === 2, "foot pays 2 for wasteland (got " + costOf(gc, foot, 2, 0) + ")");
ok(costOf(gc, foot, 3, 0) === 3, "foot pays 1 for hills (got " + costOf(gc, foot, 3, 0) + ")");

var gv = costMap(["B..v.....B"], [{ t: "CHARLIE", o: 0, x: 1, y: 0 }]);
var vfoot = gv.unitAt(1, 0);
var vrec = gv.movementRange(vfoot)[HEX.key(3, 0)];
ok(!!vrec, "foot can enter a valley");
ok(vrec && vrec.cost === vfoot.movePointsLeft,
   "entering a valley spends every remaining movement point");
ok(vrec && vrec.stop === true, "a unit entering a valley ends its move there");

var gt = costMap(["B.w......B"], [{ t: "BISON", o: 0, x: 1, y: 0 }, { t: "GIANT", o: 1, x: 8, y: 0 }]);
ok(costOf(gt, gt.unitAt(1, 0), 2, 0) === 3, "tracked vehicles pay 3 for wasteland");
ok(terrainCost(TERRAIN.waste, "treads", UNIT_TYPES.GIANT) === null, "the Giant cannot enter wasteland");
ok(terrainCost(TERRAIN.waste, "treads", UNIT_TYPES.BISON) === 3, "other tracked vehicles can");
ok(terrainCost(TERRAIN.waste, "wheels") === null, "carriers cannot enter wasteland");
ok(terrainCost(TERRAIN.hill, "wheels") === 4, "carriers pay 4 for hills");
ok(terrainCost(TERRAIN.mountain, "foot") === 2, "foot pays 2 for mountains");
ok(terrainCost(TERRAIN.mountain, "treads") === null, "vehicles cannot enter mountains");
ok(terrainCost(TERRAIN.waste, "air") === 1, "aircraft ignore terrain cost");
ok(UNIT_TYPES.RABBIT.moveType === "treads" && UNIT_TYPES.LYNX.moveType === "treads",
   "missile buggies use the fighting-vehicle rates");

// Mines and Atlas are set down, not driven off: firm ground only.
var gd = new ENGINE.Game({
  name: "D", turnLimit: 50, grid: ["BF.h..", "......", ".....B"],
  buildings: [
    { col: 0, row: 0, owner: 0 },
    { col: 5, row: 2, owner: 1 },
    { col: 1, row: 0, owner: 0, stored: ["TRIGGER"] },
  ],
  units: [{ t: "MULE", o: 0, x: 2, y: 0 }],
}, { seed: 3 });
var gdFactory = gd.buildingAt(1, 0);
var gdMule = gd.unitAt(2, 0);
var gdMine = gd.loadFromFactory(gdFactory, gdFactory.stored[0], gdMule);
gd.endTurn(); gd.endTurn(); // loading spends the passenger's activation
var threw = false;
try { gd.unload(gdMule, gdMine, 3, 0); } catch (e) { threw = true; }
ok(threw, "a mine cannot be set down on hills");
threw = false;
try { gd.unload(gdMule, gdMine, 2, 1); } catch (e) { threw = true; }
ok(!threw, "a mine can be set down on plains");

section("missile buggy move after attack");
require("./buggy-movement-tests.js")(ok);
ok(UNIT_TYPES.RABBIT.moveAfterAttack && UNIT_TYPES.LYNX.moveAfterAttack,
  "Rabbit and Lynx both declare move-after-attack");
var buggyGame = new ENGINE.Game({
  name: "Buggy movement", turnLimit: 20,
  grid: ["..........", "..........", "B........B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 9, row: 2, owner: 1 }],
  units: [
    { t: "RABBIT", o: 0, x: 2, y: 1 },
    { t: "HADRIAN", o: 1, x: 3, y: 1, str: 1 },
    { t: "BISON", o: 1, x: 9, y: 0 },
  ],
}, { seed: 1 });
buggyGame.rng = function () { return 0; };
var rabbit = buggyGame.unitAt(2, 1);
var buggyTarget = buggyGame.unitAt(3, 1);
var buggyResult = buggyGame.attack(rabbit, buggyTarget);
ok(buggyResult.defenderDead && rabbit.attacked && !rabbit.moved,
  "surviving Rabbit keeps its activation open after one attack");
ok(rabbit.movePointsLeft === UNIT_TYPES.RABBIT.move,
  "attacking before moving preserves Rabbit's full movement allowance");
var secondBuggyAttackRejected = false;
try { buggyGame.attack(rabbit, buggyGame.unitAt(9, 0)); }
catch (err) { secondBuggyAttackRejected = /already attacked/.test(err.message); }
ok(secondBuggyAttackRejected, "engine rejects a second Rabbit attack in the same turn");
var buggyRange = buggyGame.movementRange(rabbit);
var buggyStep = null;
for (var buggyKey in buggyRange) {
  var candidate = buggyRange[buggyKey];
  if (candidate.canStop && !candidate.load && !candidate.stop && candidate.cost > 0 &&
      (!buggyStep || candidate.cost > buggyStep.cost)) buggyStep = candidate;
}
ok(!!buggyStep, "Rabbit receives legal destinations after attacking");
var buggyMovementBefore = rabbit.movePointsLeft;
buggyGame.moveUnit(rabbit, buggyStep.col, buggyStep.row, buggyRange);
ok(rabbit.movePointsLeft === buggyMovementBefore - buggyStep.cost,
  "post-attack movement spends the same turn's remaining allowance");
buggyGame.finishUnit(rabbit);
ok(rabbit.moved && rabbit.movePointsLeft === 0,
  "finishing post-attack movement closes the Rabbit activation");

section("combat calculator");
ok(COMBAT.strengthCaption(8) === null, "full strength is not captioned");
ok(COMBAT.strengthCaption(7) === "7", "damaged strength is captioned");
ok(COMBAT.strengthCaption(1) === "1", "1-strength is captioned");
// Experience multiplies damage only; it does not change defense.
ok(COMBAT.EXP_DAMAGE[1] === 105 && COMBAT.EXP_DAMAGE[7] === 200,
  "experience coefficients run from 1.00 through 2.00");
ok(COMBAT.experienceBonus(3).damage === 20,
  "three stars expose their +20% damage effect");
ok(COMBAT.experienceBonus(8).general === true &&
  COMBAT.experienceBonus(8).damage === 100,
  "level eight exposes General rank and +100% damage");
var badExperienceRejected = false;
try { COMBAT.experienceBonus(9); } catch (err) { badExperienceRejected = true; }
ok(badExperienceRejected, "experience display rejects levels beyond General");
// Terrain adds directly to per-machine defense: Bison 40 + hills 20 = 60.
var g3 = new ENGINE.Game({
  name: "T3", turnLimit: 50,
  grid: ["......", ".h....", "B....B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 5, row: 2, owner: 1 }],
  units: [{ t: "BISON", o: 0, x: 2, y: 1 }, { t: "BISON", o: 1, x: 1, y: 1 }],
}, { seed: 1 });
var atk = g3.unitAt(2, 1), def = g3.unitAt(1, 1);
var pv = COMBAT.preview(g3, atk, def);
ok(pv.defender.da === 60, "hill defense is additive: expected 60, got " + pv.defender.da);
ok(pv.attacker.steps[0].ap === 50, "Bison per-machine attack is 50, got " + pv.attacker.steps[0].ap);
ok(pv.counter === true, "tank vs tank direct combat draws counterattack");
var lowRollResult = COMBAT.resolve(g3, atk, def, function () { return 0; });
ok(lowRollResult.attackDamage.coefficient === 0.2 &&
  lowRollResult.attackDamage.unitDamage === 20 &&
  lowRollResult.attackDamage.totalDamage === 32 &&
  lowRollResult.dmgToDefender === 0,
  "minimum coefficient preserves the documented 0.2 multiplier and 50 HP buffer");
var overkillGame = new ENGINE.Game({
  name: "Overkill clamp", turnLimit: 10,
  grid: ["......", "B....B"],
  buildings: [{ col: 0, row: 1, owner: 0 }, { col: 5, row: 1, owner: 1 }],
  units: [{ t: "BISON", o: 0, x: 2, y: 0 }, { t: "BISON", o: 1, x: 3, y: 0, str: 5 }],
}, { seed: 1 });
var overkillAttacker = overkillGame.unitAt(2, 0);
var overkillDefender = overkillGame.unitAt(3, 0);
var overkillResult = COMBAT.resolve(
  overkillGame, overkillAttacker, overkillDefender,
  function () { return 0.999999; }
);
ok(overkillResult.dmgToDefender === 5 && overkillDefender.strength === 0,
  "reported casualties stop at the defender's pre-battle strength");
ok(overkillResult.attackDamage.coefficient === 4 &&
  overkillResult.attackDamage.unitDamage === 27 &&
  overkillResult.attackDamage.totalDamage === 864,
  "maximum coefficient follows unit-damage × strength × random formula");

var invulnerableGame = new ENGINE.Game({
  name: "Defense cap", turnLimit: 10,
  grid: [".M....", "B....B"],
  buildings: [{ col: 0, row: 1, owner: 0 }, { col: 5, row: 1, owner: 1 }],
  units: [{ t: "BISON", o: 0, x: 2, y: 0 }, { t: "GIANT", o: 1, x: 1, y: 0 }],
}, { seed: 1 });
var invulnerableAttacker = invulnerableGame.unitAt(2, 0);
var invulnerableDefender = invulnerableGame.unitAt(1, 0);
var invulnerableResult = COMBAT.resolve(
  invulnerableGame, invulnerableAttacker, invulnerableDefender,
  function () { return 0.999999; }
);
ok(invulnerableResult.preview.defender.da === 100 &&
  invulnerableResult.attackDamage.totalDamage === 0 &&
  invulnerableResult.dmgToDefender === 0,
  "modified defense caps at 100 and prevents all damage");

// air unit gets no terrain bonus, cannot be hit by ground-only attacker
var g4 = new ENGINE.Game({
  name: "T4", turnLimit: 50,
  grid: ["......", ".h....", "B....B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 5, row: 2, owner: 1 }],
  units: [{ t: "EAGLE", o: 0, x: 2, y: 1 }, { t: "FALCON", o: 1, x: 1, y: 1 }, { t: "BISON", o: 1, x: 3, y: 1 }],
}, { seed: 1 });
var eagle = g4.unitAt(2, 1);
var targets = g4.attackTargets(eagle);
ok(targets.length === 2, "eagle (20 AA, 70 AG) can target falcon and bison, got " + targets.length);
var falcon = g4.unitAt(1, 1);
var pvAir = COMBAT.preview(g4, falcon, eagle);
ok(pvAir.defender.steps[3].da === pvAir.defender.steps[2].da, "air defender gets no terrain step change");
var bison4 = g4.unitAt(3, 1);
var bisonTargets = g4.attackTargets(bison4);
ok(bisonTargets.length === 1 && bisonTargets[0] === eagle ? false : bisonTargets.length === 0,
  "bison (no AA value) cannot target aircraft, got " + bisonTargets.length);

// ranged combat: no surround/support steps applied, no counter
var g5 = new ENGINE.Game({
  name: "T5", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [{ t: "HADRIAN", o: 0, x: 1, y: 0 }, { t: "BISON", o: 1, x: 4, y: 0 }],
}, { seed: 1 });
var had = g5.unitAt(1, 0);
var tgt5 = g5.attackTargets(had);
ok(tgt5.length === 1, "hadrian ranged target found at distance 3");
var pv5 = COMBAT.preview(g5, had, tgt5[0]);
ok(pv5.ranged === true && pv5.counter === false, "ranged strike draws no counter");
// adjacent enemy cannot be shelled (min range 2)
var g6 = new ENGINE.Game({
  name: "T6", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [{ t: "HADRIAN", o: 0, x: 1, y: 0 }, { t: "BISON", o: 1, x: 2, y: 0 }],
}, { seed: 1 });
ok(g6.attackTargets(g6.unitAt(1, 0)).length === 0, "artillery cannot hit adjacent enemy");

section("support and surround");
// Support is per machine and divided by twice the attacker's strength.
var g7 = new ENGINE.Game({
  name: "T7", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [
    { t: "BISON", o: 0, x: 2, y: 0 },   // attacker
    { t: "BISON", o: 0, x: 4, y: 0 },   // ally adjacent to defender
    { t: "BISON", o: 1, x: 3, y: 0 },   // defender
  ],
}, { seed: 1 });
var atk7 = g7.unitAt(2, 0), def7 = g7.unitAt(3, 0);
var pv7 = COMBAT.preview(g7, atk7, def7);
// floor((50 attack × 8 machines) / (8 attackers × 2)) = 25.
ok(pv7.attacker.ap === 75,
  "attack support raises Bison attack from 50 to 75, got " + pv7.attacker.ap);

var defenseSupportGame = new ENGINE.Game({
  name: "Defense support", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [
    { t: "BISON", o: 0, x: 2, y: 0, str: 4 },
    { t: "BISON", o: 1, x: 3, y: 0 },
    { t: "BISON", o: 1, x: 1, y: 0 },
  ],
}, { seed: 1 });
var defenseSupportPreview = COMBAT.preview(
  defenseSupportGame,
  defenseSupportGame.unitAt(2, 0),
  defenseSupportGame.unitAt(3, 0)
);
ok(defenseSupportPreview.defender.da === 85,
  "four attackers give an eight-Bison ally +40 defense support before plains +5");

// Surround: sandwiching so friendly ZOC covers every adjacent hex halves the
// defender — away from the map edge, since off-map hexes carry no ZOC.
var g8 = new ENGINE.Game({
  name: "T8", turnLimit: 50,
  grid: ["........", "........", "........", "B......B"],
  buildings: [{ col: 0, row: 3, owner: 0 }, { col: 7, row: 3, owner: 1 }],
  units: [
    { t: "BISON", o: 1, x: 3, y: 1 },   // defender, one row in from the edge
    { t: "BISON", o: 0, x: 2, y: 1 },
    { t: "BISON", o: 0, x: 4, y: 1 },
    { t: "BISON", o: 0, x: 3, y: 0 },
    { t: "BISON", o: 0, x: 3, y: 2 },
    { t: "BISON", o: 0, x: 2, y: 2 },
    { t: "BISON", o: 0, x: 4, y: 2 },
  ],
}, { seed: 1 });
var def8 = g8.unitAt(3, 1);
ok(g8.isSurrounded(def8) === true, "defender with all adjacents covered is surrounded");
var pv8 = COMBAT.preview(g8, g8.unitAt(2, 1), def8);
ok(pv8.defender.da === Math.floor((40 + 5) / 2),
  "surround halves defense after terrain, got " + pv8.defender.da);
ok(pv8.defender.ap === Math.floor(50 / 2),
  "surround halves the defender's counterattack, got " + pv8.defender.ap);
// Only the defender suffers: the same surrounded unit attacking loses nothing.
var pv8r = COMBAT.preview(g8, def8, g8.unitAt(2, 1));
ok(pv8r.attacker.ap >= pv8r.attacker.steps[0].ap,
   "a surrounded unit's own attack is not halved when it initiates combat");
// Map edge: an identical sandwich against the top edge is not a surround.
var g8e = new ENGINE.Game({
  name: "T8E", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [
    { t: "BISON", o: 1, x: 3, y: 0 },
    { t: "BISON", o: 0, x: 2, y: 0 },
    { t: "BISON", o: 0, x: 4, y: 0 },
    { t: "BISON", o: 0, x: 3, y: 1 },
    { t: "BISON", o: 0, x: 2, y: 1 },
    { t: "BISON", o: 0, x: 4, y: 1 },
  ],
}, { seed: 1 });
ok(g8e.isSurrounded(g8e.unitAt(3, 0)) === false,
   "a unit against the map edge can never be surrounded");

section("original manual roster contract");
require("./manual-contract-tests.js")(ok);

section("per-domain ranges and move-or-fire");
// Lynx: ground targets only at exactly two hexes, air only adjacent,
// re-move preserved; artillery may move or fire but not both.
var g9r = new ENGINE.Game({
  name: "T9R", turnLimit: 50,
  grid: ["..........", "..........", "B........B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 9, row: 2, owner: 1 }],
  units: [
    { t: "LYNX", o: 0, x: 2, y: 0 },
    { t: "BISON", o: 1, x: 3, y: 0 },    // adjacent ground: NOT attackable
    { t: "LENET", o: 1, x: 4, y: 0 },    // two hexes out: attackable
    { t: "HUNTER", o: 1, x: 2, y: 1 },   // adjacent air: attackable
    { t: "HADRIAN", o: 0, x: 6, y: 2 },
    { t: "GRIZZLY", o: 1, x: 8, y: 2 },
  ],
}, { seed: 5 });
var lynx = g9r.unitAt(2, 0);
var lynxTargets = g9r.attackTargets(lynx).map(function (u) { return u.typeId; }).sort();
ok(lynxTargets.join(",") === "HUNTER,LENET",
   "Lynx hits ground at 2 and air at 1, never adjacent ground (got " + lynxTargets.join(",") + ")");
ok(COMBAT.rangeBand(UNIT_TYPES.LYNX, false).min === 2, "Lynx ground band starts at 2");
var pvLynx = COMBAT.preview(g9r, lynx, g9r.unitAt(4, 0));
ok(pvLynx.counter === false, "no counterattack against Lynx indirect fire");
var pvOnLynx = COMBAT.preview(g9r, g9r.unitAt(3, 0), lynx);
ok(pvOnLynx.counter === false, "Lynx cannot counter an adjacent ground attack");
var pvAirOnLynx = COMBAT.preview(g9r, g9r.unitAt(2, 1), lynx);
ok(pvAirOnLynx.counter === true, "Lynx counters an adjacent air attack");
ok(!UNIT_TYPES.LYNX.moveOrFire && UNIT_TYPES.LYNX.moveAfterAttack,
   "Lynx keeps its move-after-attack despite firing indirectly");
// Artillery: firing after moving is rejected; artillery never counters.
var had = g9r.unitAt(6, 2);
var hadRange = g9r.movementRange(had);
g9r.moveUnit(had, 5, 2, hadRange);
ok(had.attackSpent === true, "artillery that moved cannot fire this turn");
var pvOnHad = COMBAT.preview(g9r, g9r.unitAt(8, 2), had);
ok(pvOnHad.counter === false, "artillery cannot counter adjacent attacks");
ok(COMBAT.canAttackAt(UNIT_TYPES.HAWKEYE, true, 2) && !COMBAT.canAttackAt(UNIT_TYPES.HAWKEYE, true, 1),
   "Hawkeye reaches air at 2-5 but never adjacent");

section("factories, capture, repair");
var g9 = new ENGINE.Game({
  name: "T9", turnLimit: 50,
  grid: ["F.......", "........", "B......B"],
  buildings: [
    { col: 0, row: 0, owner: -1, stored: ["LYNX"] },
    { col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 },
  ],
  units: [{ t: "CHARLIE", o: 0, x: 1, y: 0 }, { t: "BISON", o: 1, x: 7, y: 0 }],
}, { seed: 1 });
var ch9 = g9.unitAt(1, 0);
g9.moveUnit(ch9, 0, 0);
g9.finishUnit(ch9);
var fac9 = g9.buildingAt(0, 0);
ok(fac9.owner === 0, "infantry captured neutral factory");
ok(fac9.stored[0].player === 0, "stored unit defected to captor");
ok(!g9.unitAt(0, 0) && fac9.stored.indexOf(ch9) >= 0,
  "the capturer goes inside and leaves the factory hex empty");
ok(ch9.inFactory && ch9.moved,
  "the stored capturer cannot redeploy during the capture turn");
// deploying never targets the factory hex — an exit hex is chosen instead
var threw = false;
try { g9.deployFromFactory(fac9, fac9.stored[0], 0, 0); } catch (e) { threw = true; }
ok(threw, "cannot deploy onto the factory hex itself");
var lynx9 = fac9.stored[0];
g9.deployFromFactory(fac9, lynx9, 1, 0);
ok(g9.unitAt(1, 0) === lynx9 && lynx9.moved, "deploys to a chosen adjacent hex, turn spent");

// Storage: stopping on a factory you already own takes the unit inside,
// repairs it to full, and holds it until at least the next turn.
var g9b = new ENGINE.Game({
  name: "T9B", turnLimit: 50,
  grid: ["Fh......", "........", "B......B"],
  buildings: [
    { col: 0, row: 0, owner: 0 },
    { col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 },
  ],
  units: [{ t: "BISON", o: 0, x: 2, y: 0, str: 2 }, { t: "BISON", o: 1, x: 7, y: 0 }],
}, { seed: 1 });
var fac9b = g9b.buildingAt(0, 0);
var bi9 = g9b.unitAt(2, 0);
g9b.moveUnit(bi9, 0, 0);
g9b.finishUnit(bi9);
ok(!g9b.unitAt(0, 0), "unit stopping on its own factory goes inside");
ok(fac9b.stored.indexOf(bi9) >= 0 && bi9.strength === 8, "stored unit is repaired to full");
threw = false;
try { g9b.deployFromFactory(fac9b, bi9, 0, 1); } catch (e) { threw = true; }
ok(threw, "a unit stored this turn cannot come back out");
g9b.endTurn(); g9b.endTurn();  // back to player 0
threw = false;
try { g9b.deployFromFactory(fac9b, bi9, 1, 0); } catch (e) { threw = true; }
ok(threw, "cannot deploy onto hills — exits are plains, road or bridge");
g9b.deployFromFactory(fac9b, bi9, 0, 1);
ok(g9b.unitAt(0, 1) === bi9 && bi9.strength === 8, "repaired unit deploys the next turn");

// A ready stored ground unit may choose an adjacent transport instead of an
// empty terrain hex. Mule excludes tanks; Pelican accepts any ground unit.
var g9t = new ENGINE.Game({
  name: "T9 transport deployment", turnLimit: 50,
  grid: [".....", "..F..", "B...B"],
  buildings: [
    { col: 2, row: 1, owner: 0, stored: ["BISON", "KILROY", "HUNTER"] },
    { col: 0, row: 2, owner: 0 }, { col: 4, row: 2, owner: 1 },
  ],
  units: [
    { t: "MULE", o: 0, x: 1, y: 1 },
    { t: "PELICAN", o: 0, x: 3, y: 1 },
  ],
}, { seed: 1 });
var fac9t = g9t.buildingAt(2, 1);
var bison9t = fac9t.stored[0];
var kilroy9t = fac9t.stored[1];
var hunter9t = fac9t.stored[2];
var transports9t = g9t.transportDeployTargets(fac9t, bison9t);
ok(transports9t.length === 1 && transports9t[0].typeId === "PELICAN",
  "a tank may deploy into Pelican, but cannot board Mule");
var pelican9t = g9t.unitAt(3, 1);
g9t.loadFromFactory(fac9t, bison9t, pelican9t);
ok(bison9t.carriedBy === pelican9t.id && pelican9t.cargo[0] === bison9t &&
  bison9t.moved, "direct transport deployment loads the tank and spends its turn");
var mule9t = g9t.unitAt(1, 1);
g9t.loadFromFactory(fac9t, kilroy9t, mule9t);
ok(kilroy9t.carriedBy === mule9t.id,
  "another stored ground unit can choose the other adjacent transport");
ok(g9t.transportDeployTargets(fac9t, hunter9t).length === 0,
  "stored aircraft cannot deploy into transports");

// A non-capturing unit can pass through but never stop on a factory it
// does not own.
var g9c = new ENGINE.Game({
  name: "T9C", turnLimit: 50,
  grid: [".F......", "........", "B......B"],
  buildings: [
    { col: 1, row: 0, owner: -1 },
    { col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 },
  ],
  units: [{ t: "BISON", o: 0, x: 0, y: 0 }, { t: "CHARLIE", o: 0, x: 0, y: 1 }],
}, { seed: 1 });
var bi9c = g9c.unitAt(0, 0);
var range9c = g9c.movementRange(bi9c);
var recF = range9c[HEX.key(1, 0)];
ok(recF && !recF.canStop, "tank cannot stop on a factory it does not own");
ok(!!range9c[HEX.key(3, 0)], "…but passes through it freely");
var ch9c = g9c.unitAt(0, 1);
var rangeCh = g9c.movementRange(ch9c);
var recFCh = rangeCh[HEX.key(1, 0)];
ok(recFCh && recFCh.canStop, "infantry may stop there (that is the capture)");
// base capture wins
var g10 = new ENGINE.Game({
  name: "T10", turnLimit: 50,
  grid: ["B......B"],
  buildings: [{ col: 0, row: 0, owner: 0 }, { col: 7, row: 0, owner: 1 }],
  units: [{ t: "CHARLIE", o: 0, x: 6, y: 0 }, { t: "BISON", o: 1, x: 3, y: 0 }],
}, { seed: 1 });
var ch10 = g10.unitAt(6, 0);
g10.moveUnit(ch10, 7, 0);
g10.finishUnit(ch10);
ok(g10.winner === 0 && g10.winReason === "base", "capturing enemy base wins");

section("transports");
require("./fidelity-tests.js")(ok);
var g11 = new ENGINE.Game({
  name: "T11", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [{ t: "MULE", o: 0, x: 2, y: 0 }, { t: "KILROY", o: 0, x: 1, y: 0 }, { t: "BISON", o: 1, x: 7, y: 0 }],
}, { seed: 1 });
var mule = g11.unitAt(2, 0), kil = g11.unitAt(1, 0);
var r11 = g11.movementRange(kil);
var loadRec = r11[HEX.key(2, 0)];
ok(!!loadRec && loadRec.load === true, "infantry can board adjacent transport");
g11.moveUnit(kil, 2, 0, r11);
ok(kil.carriedBy === mule.id && mule.cargo.length === 1, "loading works");
g11.endTurn(); g11.endTurn();
g11.unload(mule, kil, 3, 0);
ok(kil.carriedBy === null && g11.unitAt(3, 0) === kil, "unloading works");

section("experience awards");
var g12 = new ENGINE.Game({
  name: "T12", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [{ t: "GRIZZLY", o: 0, x: 2, y: 0 }, { t: "CHARLIE", o: 1, x: 3, y: 0, str: 1 }],
}, { seed: 3 });
var gz = g12.unitAt(2, 0), chd = g12.unitAt(3, 0);
var res12 = g12.attack(gz, chd);
ok(res12.defenderDead, "grizzly kills 1-strength charlie");
ok(gz.exp === 2, "attacker gains 2 exp for a kill, got " + gz.exp);

// A defender earns +2 if unhurt, otherwise +1, even with a counterattack kill.
var g13 = new ENGINE.Game({
  name: "T13", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [{ t: "CHARLIE", o: 0, x: 2, y: 0, str: 1 }, { t: "POLAR", o: 1, x: 3, y: 0 }],
}, { seed: 11 });
var ch13 = g13.unitAt(2, 0), po13 = g13.unitAt(3, 0);
var res13 = g13.attack(ch13, po13);
ok(po13.exp === (res13.dmgToDefender > 0 ? 1 : 2),
  "defender exp follows damage taken, got " + po13.exp);

// Capturing a factory earns the infantry +4 EXP; the flag and repair still work.
var g14 = new ENGINE.Game({
  name: "T14", turnLimit: 50,
  grid: ["B.F....B"],
  buildings: [
    { col: 0, row: 0, owner: 0 },
    { col: 7, row: 0, owner: 1 },
    { col: 2, row: 0, owner: -1 },
  ],
  units: [{ t: "CHARLIE", o: 0, x: 1, y: 0, str: 2 }],
}, { seed: 2 });
var cap = g14.unitAt(1, 0);
var capRange = g14.movementRange(cap);
g14.moveUnit(cap, 2, 0, capRange);
g14.finishUnit(cap);
ok(g14.buildingAt(2, 0).owner === 0, "infantry captures the neutral factory");
ok(cap.exp === 4, "factory capture awards +4 exp, got " + cap.exp);
ok(cap.inFactory && !g14.unitAt(2, 0) && cap.strength === 8,
  "factory capture stores the capturing infantry off-map and repairs it");

section("observable AI turn steps");
var aiFactoryGame = new ENGINE.Game({
  name: "AI factory priority", turnLimit: 20,
  grid: [".....", ".....", "..F..", ".....", "B...B"],
  buildings: [
    { col: 2, row: 2, owner: 1, stored: ["LENET", "BISON"] },
    { col: 0, row: 4, owner: 0 }, { col: 4, row: 4, owner: 1 },
  ],
  units: [{ t: "CHARLIE", o: 0, x: 0, y: 0 }],
}, { seed: 31 });
aiFactoryGame.endTurn();
var aiFactoryTurn = AI.createTurn(aiFactoryGame, 1);
var firstFactoryDeploy = aiFactoryTurn.next();
ok(firstFactoryDeploy.t === "deploy" && firstFactoryDeploy.unit.typeId === "BISON",
  "AI deploys one eligible stored unit from the factory");
ok(aiFactoryGame.buildingAt(2, 2).stored.length === 1,
  "each observable AI step deploys only one reserve");
var secondFactoryDeploy = aiFactoryTurn.next();
ok(secondFactoryDeploy && secondFactoryDeploy.t === "deploy" &&
  secondFactoryDeploy.unit.typeId === "LENET" &&
  aiFactoryGame.buildingAt(2, 2).stored.length === 0,
  "AI deploys remaining ready reserves from the same factory this turn");
ok(firstFactoryDeploy.unit.moved && secondFactoryDeploy.unit.moved &&
  HEX.distance(firstFactoryDeploy.to.col, firstFactoryDeploy.to.row,
    secondFactoryDeploy.to.col, secondFactoryDeploy.to.row) > 0,
  "factory deployments occupy distinct exits and spend each unit's activation");
ok(aiFactoryTurn.next() === null, "AI finishes after exhausting ready reserves");

var crowdedFactoryGame = new ENGINE.Game({
  name: "AI full exits", turnLimit: 20,
  grid: [".....", ".....", "..F..", ".....", "B...B"],
  buildings: [
    { col: 2, row: 2, owner: 1,
      stored: ["BISON", "BISON", "BISON", "BISON", "BISON", "ATLAS", "TRIGGER"] },
    { col: 0, row: 4, owner: 0 }, { col: 4, row: 4, owner: 1 },
  ],
  units: [{ t: "CHARLIE", o: 0, x: 0, y: 0 }],
}, { seed: 31 });
crowdedFactoryGame.endTurn();
var crowdedTurn = AI.createTurn(crowdedFactoryGame, 1), deploymentCount = 0, factoryStep;
while ((factoryStep = crowdedTurn.next()) && deploymentCount < 10) {
  if (factoryStep.t === "deploy") deploymentCount++;
}
ok(deploymentCount === 6 && crowdedFactoryGame.buildingAt(2, 2).stored.length === 1,
  "AI fills all six legal exits, including Atlas and mines, and retains overflow");

var blockedFactoryGame = new ENGINE.Game({
  name: "AI chassis exits", turnLimit: 20,
  grid: [".....", ".....", "..F..", ".....", "B...B"],
  buildings: [
    { col: 2, row: 2, owner: 1, stored: ["FALCON", "BISON"] },
    { col: 0, row: 4, owner: 0 }, { col: 4, row: 4, owner: 1 },
  ],
  units: [{ t: "CHARLIE", o: 0, x: 0, y: 0 }],
}, { seed: 31 });
blockedFactoryGame.endTurn();
var originalDeployTargets = blockedFactoryGame.deployTargets;
blockedFactoryGame.deployTargets = function (building, unit) {
  return unit.typeId === "BISON" ? [] : originalDeployTargets.call(this, building, unit);
};
var unblockedDeployment = AI.createTurn(blockedFactoryGame, 1).next();
ok(unblockedDeployment && unblockedDeployment.t === "deploy" &&
  unblockedDeployment.unit.typeId === "FALCON",
  "a reserve without legal exits does not block another eligible chassis");

var watchMap = {
  name: "WATCH", turnLimit: 20,
  grid: [
    "......",
    "B....B",
    "......",
  ],
  buildings: [{ col: 0, row: 1, owner: 0 }, { col: 5, row: 1, owner: 1 }],
  units: [
    { t: "CHARLIE", o: 0, x: 4, y: 1 },
    { t: "BISON", o: 1, x: 1, y: 1 },
  ],
};
var watchedGame = new ENGINE.Game(watchMap, { seed: 77 });
watchedGame.endTurn();
var watchedTarget = watchedGame.playerUnits(0)[0];
var watchedTurn = AI.createTurn(watchedGame, 1);
var watchMove = watchedTurn.next();
ok(watchMove.t === "move", "watched AI emits movement before combat");
ok(watchedTarget.strength === 8, "movement step does not resolve later combat");
var watchPreview = watchedTurn.next();
ok(watchPreview.t === "battle-preview", "watched AI emits a readable battle preview");
ok(watchedTarget.strength === 8, "battle preview does not mutate either squad");
var watchBattle = watchedTurn.next();
ok(watchBattle.t === "battle", "watched AI resolves combat in a later step");
ok(watchedTarget.strength === 8 - watchBattle.result.dmgToDefender,
  "battle result damage matches the defender's new strength");

var buggyAIMap = {
  name: "BUGGY AI", turnLimit: 20,
  grid: [
    "....................",
    "B..................B",
    "....................",
  ],
  buildings: [{ col: 0, row: 1, owner: 0 }, { col: 19, row: 1, owner: 1 }],
  units: [
    { t: "BISON", o: 0, x: 0, y: 0 },
    { t: "HADRIAN", o: 0, x: 13, y: 1, str: 1 },
    { t: "RABBIT", o: 1, x: 14, y: 1 },
  ],
};
var buggyAIGame = new ENGINE.Game(buggyAIMap, { seed: 1 });
buggyAIGame.rng = function () { return 0; };
buggyAIGame.endTurn();
var aiRabbit = buggyAIGame.playerUnits(1)[0];
var buggyAITurn = AI.createTurn(buggyAIGame, 1);
var buggyAIEvent;
do { buggyAIEvent = buggyAITurn.next(); }
while (buggyAIEvent && buggyAIEvent.t !== "battle");
ok(buggyAIEvent && buggyAIEvent.t === "battle",
  "AI Rabbit completes its attack before repositioning");
var distanceBeforeReposition = HEX.distance(
  aiRabbit.col, aiRabbit.row,
  buggyAIGame.playerUnits(0)[0].col, buggyAIGame.playerUnits(0)[0].row
);
var buggyAIReposition = buggyAITurn.next();
ok(buggyAIReposition && buggyAIReposition.t === "move" &&
  buggyAIReposition.reason === "post-attack",
  "AI Rabbit emits a post-attack movement step");
var distanceAfterReposition = HEX.distance(
  aiRabbit.col, aiRabbit.row,
  buggyAIGame.playerUnits(0)[0].col, buggyAIGame.playerUnits(0)[0].row
);
ok(distanceAfterReposition > distanceBeforeReposition,
  "AI Rabbit uses leftover movement to increase enemy separation");
ok(aiRabbit.moved && aiRabbit.movePointsLeft === 0,
  "AI closes the Rabbit activation after post-attack movement");

/* ---------- 3. AI self-play ---------- */

section("documented CPU transport and defense tactics");
require("./ai-fidelity-tests.js")(ok);

section("AI self-play (all included maps)");
ALL_MAPS.forEach(function (m, mi) {
  var game = new ENGINE.Game(m, { seed: 1000 + mi });
  var guard = 0;
  try {
    while (game.winner === null && guard < 400) {
      AI.playTurn(game, game.currentPlayer);
      game.endTurn();
      guard++;
    }
    ok(game.winner !== null, "map " + (mi + 1) + " " + m.name + " terminated (winner " + game.winner + ", " + game.winReason + ", turn " + game.turn + ")");
    console.log("  map " + String(mi + 1).padStart(2) + " " + m.name.padEnd(9) +
      " -> winner P" + game.winner + " by " + game.winReason + " on turn " + game.turn);
  } catch (e) {
    ok(false, "map " + (mi + 1) + " " + m.name + " crashed: " + e.stack);
  }
});

section("building storage and stopping rules");
require("./building-rules-tests.js")(ok);

section("factory inventory inspection");
require("./factory-ui-tests.js")(ok);
require("./action-availability-tests.js")(ok);

section("independent combat forecasts");
require("./forecast-tests.js")(ok);

section("movement, direct attack and undo history");
require("./combat-ui-tests.js")(ok);

section("profiles and saved matches");
require("./profiles-tests.js")(ok);

section("completed match outcomes");
require("./outcome-tests.js")(ok);
require("./outcome-menu-tests.js")(ok);

/* ---------- summary ---------- */

section("performance algorithm equivalence");
require("./performance-tests.js")(ok);

console.log("\n" + checks + " checks, " + failures + " failures");
process.exit(failures ? 1 : 0);
