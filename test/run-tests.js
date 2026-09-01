/* Nectaris remake — node test suite.
 * Run: node test/run-tests.js
 *
 * 1. Static validation of every campaign and expansion map.
 * 2. Rule unit-tests (hex math, movement/ZOC, combat calculator steps).
 * 3. AI-vs-AI self-play on every included map (crash + termination check).
 */
"use strict";

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
var CAMPAIGN = require(path.join(__dirname, "../js/data-maps.js"));
var EXPANSION_LEVELS = require(path.join(__dirname, "../js/data-expansion-maps.js"));
var ALL_MAPS = CAMPAIGN.concat(EXPANSION_LEVELS);

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
    var cost = terrainCost(t, UNIT_TYPES[u.t].moveType);
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
// starting inside enemy ZOC limits movement to 1 hex
var g2 = new ENGINE.Game({
  name: "T2", turnLimit: 50,
  grid: ["......", "......", "B....B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 5, row: 2, owner: 1 }],
  units: [{ t: "BISON", o: 0, x: 2, y: 0 }, { t: "BISON", o: 1, x: 3, y: 0 }],
}, { seed: 1 });
var b2 = g2.unitAt(2, 0);
var range2 = g2.movementRange(b2);
var maxDist = 0;
for (var k in range2) {
  var rec = range2[k];
  if (rec.canStop) maxDist = Math.max(maxDist, HEX.distance(2, 0, rec.col, rec.row));
}
ok(maxDist === 1, "unit starting in enemy ZOC moves at most 1 hex (got " + maxDist + ")");

section("combat calculator");
ok(COMBAT.strengthCaption(8) === null, "full strength is not captioned");
ok(COMBAT.strengthCaption(7) === "7", "damaged strength is captioned");
ok(COMBAT.strengthCaption(1) === "1", "1-strength is captioned");
// experience table endpoints from the documented tiers
ok(COMBAT.EXP_ATK[7] === 100 && COMBAT.EXP_DEF[8] === 100, "experience tiers cap at +100%");
// terrain bonus: BISON (def 40) at full strength on hills (+20%)
var g3 = new ENGINE.Game({
  name: "T3", turnLimit: 50,
  grid: ["......", ".h....", "B....B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 5, row: 2, owner: 1 }],
  units: [{ t: "BISON", o: 0, x: 2, y: 1 }, { t: "BISON", o: 1, x: 1, y: 1 }],
}, { seed: 1 });
var atk = g3.unitAt(2, 1), def = g3.unitAt(1, 1);
var pv = COMBAT.preview(g3, atk, def);
// defender: BuD 40 x 8 = 320, hills +20% => 384
ok(pv.defender.steps[3].da === 384, "hill terrain bonus: expected 384, got " + pv.defender.steps[3].da);
ok(pv.attacker.steps[0].ap === 400, "bison base AP 400, got " + pv.attacker.steps[0].ap);
ok(pv.counter === true, "tank vs tank direct combat draws counterattack");

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
// Support: ally adjacent to defender boosts attacker AP by 50% of ally power.
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
// support step: 400 + floor(0.5*50*8)=+200 => 600
ok(pv7.attacker.steps[2].ap === 600, "support fire adds 50% of ally power (600), got " + pv7.attacker.steps[2].ap);

// Surround: enemy on both sides + ZOC covering all adjacents halves defender.
var g8 = new ENGINE.Game({
  name: "T8", turnLimit: 50,
  grid: ["........", "........", "B......B"],
  buildings: [{ col: 0, row: 2, owner: 0 }, { col: 7, row: 2, owner: 1 }],
  units: [
    { t: "BISON", o: 1, x: 3, y: 0 },   // defender
    { t: "BISON", o: 0, x: 2, y: 0 },
    { t: "BISON", o: 0, x: 4, y: 0 },
    { t: "BISON", o: 0, x: 3, y: 1 },
    { t: "BISON", o: 0, x: 2, y: 1 },   // wait — need coverage of all six
    { t: "BISON", o: 0, x: 4, y: 1 },
  ],
}, { seed: 1 });
var def8 = g8.unitAt(3, 0);
ok(g8.isSurrounded(def8) === true, "defender with all adjacents covered is surrounded");
var pv8 = COMBAT.preview(g8, g8.unitAt(2, 0), def8);
ok(pv8.defender.steps[1].da === Math.floor(40 / 2) * 8, "surrounded defender DEF halved, got " + pv8.defender.steps[1].da);

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
// deploy blocked while captor stands on the factory
var threw = false;
try { g9.deployFromFactory(fac9, fac9.stored[0], 0, 0); } catch (e) { threw = true; }
ok(threw, "cannot deploy onto occupied factory hex");
// repair on entering own building
ch9.strength = 2;
ch9.moved = false; ch9.movePointsLeft = ch9.type.move;
g9.finishUnit(ch9);
ok(ch9.strength === 8, "unit repaired to full on own building");
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

/* ---------- 3. AI self-play ---------- */

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

/* ---------- summary ---------- */

console.log("\n" + checks + " checks, " + failures + " failures");
process.exit(failures ? 1 : 0);
