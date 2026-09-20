/* Source-based regression cases for the 1989 PCE fidelity audit.
 * Published Falcon/Hunter outcomes: https://anka.sakura.ne.jp/nectaris/d5.html
 * Transport/victory rules: d1.html, d6.html and the original printed manuals.
 */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js");
  function rejects(game, action, label) {
    var before = JSON.stringify(game.snapshot()), threw = false;
    try { action(); } catch (e) { threw = true; }
    ok(threw && before === JSON.stringify(game.snapshot()), label);
  }
  function has(targets, col, row) {
    return targets.some(function (p) { return p.col === col && p.row === row; });
  }
  var game = new ENGINE.Game({name: "Published air battle", grid: ["...."],
    units: [{t: "FALCON", o: 0, x: 1, y: 0}, {t: "HUNTER", o: 1, x: 2, y: 0}]});
  var falcon = game.units[0], hunter = game.units[1];
  var hunterRemaining = new Array(9).fill(0), falconRemaining = new Array(9).fill(0), coefficients = {};
  for (var bucket = 0; bucket < 100; bucket++) {
    falcon.strength = hunter.strength = 8; falcon.exp = hunter.exp = 0;
    var result = COMBAT.resolve(game, falcon, hunter, function () { return (bucket + 0.5) / 100; });
    hunterRemaining[hunter.strength]++; falconRemaining[falcon.strength]++;
    var coefficient = result.attackDamage.coefficient;
    coefficients[coefficient] = (coefficients[coefficient] || 0) + 1;
  }
  ok(JSON.stringify(hunterRemaining) === JSON.stringify([2,5,0,25,26,24,15,3,0]),
    "Hunter survivor distribution exactly matches the published independent example");
  ok(JSON.stringify(falconRemaining) === JSON.stringify([7,0,6,25,29,15,15,3,0]),
    "Falcon survivor distribution exactly matches the published independent example");
  ok(Object.keys(coefficients).length === 14 && coefficients[0.2] === 3 && coefficients[4] === 2,
    "combat uses fourteen weighted outcomes, including 3% misfire and 2% critical");
  falcon.strength = hunter.strength = 8; falcon.exp = hunter.exp = 0;
  ok(COMBAT.expectedCasualties(falcon, hunter, 90, 50) === 3.85 &&
    COMBAT.expectedCasualties(hunter, falcon, 70, 30) === 4.11,
    "AI expectations match the published average remaining strengths 4.15 and 3.89");
  var forecast = COMBAT.forecast(falcon, hunter, COMBAT.preview(game, falcon, hunter));
  ok(Math.abs(forecast.meanDefenderLoss - 3.85) < 0.02 && Math.abs(forecast.meanAttackerLoss - 4.11) < 0.02,
    "forecast agrees with independently published casualty means");
  ok(forecast.bins.every(function (row) { return row[6] === 0 && row[0] === 0; }) &&
    forecast.bins[7].every(function (n) { return n === 0; }),
    "forecast excludes the published impossible survivor counts");
  rejects(game, function () { COMBAT.resolve(game, falcon, hunter, function () { return NaN; }); },
    "invalid random samples cannot corrupt a battle");
  falcon.strength = 1;
  var rolls = [0.99, 0.5];
  result = COMBAT.resolve(game, falcon, hunter, function () { return rolls.shift(); });
  ok(result.attackerDead && result.dmgToDefender > 0 && hunter.exp === 1,
    "a damaged defender gets one experience point even when its counterattack kills");

  // Every roster type is checked against the PCE Mule passenger restriction.
  var mule = ENGINE.makeUnit("MULE", 0, 1, 1), pelican = ENGINE.makeUnit("PELICAN", 0, 1, 1);
  Object.keys(global.UNIT_TYPES).forEach(function (type) {
    var cargo = ENGINE.makeUnit(type, 0, 0, 1);
    var fieldAllowed = ["CHARLIE", "KILROY", "ATLAS", "TRIGGER"].indexOf(type) >= 0;
    ok(game.canLoad(mule, cargo, false) === fieldAllowed, "Mule field passenger rule: " + type);
    ok(game.canLoad(mule, cargo, true) === (fieldAllowed || type === "PANTHER"),
      "PCE Mule factory passenger rule: " + type);
    ok(game.canLoad(pelican, cargo, false) === (cargo.type.moveType !== "air"),
      "Pelican carries any empty ground unit: " + type);
  });
  mule.cargo.push(ENGINE.makeUnit("CHARLIE", 0, 1, 1));
  ok(!game.canLoad(pelican, mule, false), "loaded Mule cannot nest inside Pelican");

  function transportFixture(terrain, owner, passengerType) {
    var g = new ENGINE.Game({name: "Transport rules", grid: [".....", ".." + terrain + "..", "....."],
      buildings: terrain === "F" || terrain === "B" ? [{col:2,row:1,owner:owner}] : [],
      units: [{t:"PELICAN",o:0,x:1,y:1}, {t:passengerType || "CHARLIE",o:0,x:0,y:1},
        {t:"POLAR",o:1,x:4,y:2}]});
    g.moveUnit(g.units[1],1,1);
    return g;
  }
  [".", "-", "=", "h", "w", "M", "v", "B", "F"].forEach(function (terrain) {
    [-1,0,1].forEach(function (owner) {
      var g = transportFixture(terrain, owner), carrier = g.units[0], cargo = g.units[1];
      ok(g.unloadTargets(carrier,cargo).length === 0, "newly boarded passenger must wait: " + terrain + owner);
      rejects(g, function () { g.unload(carrier,cargo,2,1); }, "same-turn unloading rejected without mutation");
      g.endTurn(); g.endTurn();
      var allowed = ".-=".includes(terrain) || (terrain === "F" && owner === 0);
      ok(has(g.unloadTargets(carrier,cargo),2,1) === allowed, "unloading terrain and ownership: " + terrain + owner);
      if (allowed) {
        g.finishUnit(carrier); // carrier and passenger activations are independent
        g.unload(carrier,cargo,2,1);
        ok(cargo.moved && !cargo.carriedBy && !carrier.cargo.length,
          "a ready passenger can leave an already-used transport");
      } else rejects(g, function () { g.unload(carrier,cargo,2,1); }, "illegal unloading cannot mutate the match");
    });
  });
  ["TRIGGER","ATLAS"].forEach(function (type) {
    var g = new ENGINE.Game({name:"Direct immobile deployment",grid:[".F.."],
      buildings:[{col:1,row:0,owner:0,stored:[type]}]});
    var b = g.buildingAt(1,0), unit = b.stored[0];
    ok(has(g.deployTargets(b,unit),2,0), type + " can leave a factory without transport");
    g.deployFromFactory(b,unit,2,0); g.endTurn(); g.endTurn();
    ok(Object.keys(g.movementRange(unit)).length === 1, type + " stays immobile after deployment");
  });
  [-1,0,1].forEach(function (owner) {
    var g = new ENGINE.Game({name:"Base parking",grid:[".B.."],buildings:[{col:1,row:0,owner:owner}],
      units:[{t:"BISON",o:0,x:0,y:0,str:3}]});
    var tank = g.units[0]; g.moveUnit(tank,1,0); g.finishUnit(tank);
    ok(g.unitAt(1,0) === tank && tank.strength === 3 && !tank.inFactory &&
      g.buildingAt(1,0).owner === owner, "base permits parking without repair or tank capture: " + owner);
  });
  game = transportFixture("F",0,"BISON");
  var carrier = game.units[0], cargo = game.units[1], factory = game.buildingAt(2,1);
  carrier.strength = 2; cargo.strength = 3; cargo.exp = 4;
  game.moveUnit(carrier,2,1); game.finishUnit(carrier);
  ok(factory.stored.length === 2 && !carrier.cargo.length && !cargo.carriedBy &&
    carrier.strength === 8 && cargo.strength === 8 && cargo.exp === 4 && cargo.moved && carrier.moved,
    "factory entry repairs loaded aircraft and cargo separately, preserving experience");
  var saved = ENGINE.Game.restore(game.snapshot());
  ok(saved.buildingAt(2,1).stored.length === 2 && saved.units.length === 1,
    "factory cargo separation survives save and resume without duplicate field units");

  function cargoBattle(cargoStrength, roll, firingStrength) {
    var g = new ENGINE.Game({name:"Cargo casualties",grid:[".....","....."],
      units:[{t:"FALCON",o:0,x:1,y:0,str:firingStrength || 8},{t:"PELICAN",o:1,x:2,y:0,str:3},
        {t:"GIANT",o:1,x:2,y:1,str:cargoStrength}]});
    var carrier = g.units[1], cargo = g.units[2];
    carrier.cargo.push(cargo); cargo.carriedBy = carrier.id;
    g.rng = COMBAT.makeRng(7);
    var original = g.rng;
    g.rng = function () { return roll; };
    var res = g.attack(g.units[0],carrier); g.rng = original;
    return {g:g,carrier:carrier,cargo:cargo,result:res};
  }
  var battle = cargoBattle(8,0);
  ok(battle.carrier.strength === 2 && battle.cargo.strength === 2,
    "one transport casualty clamps a larger passenger squad to remaining carrier strength");
  battle = cargoBattle(1,0);
  ok(battle.cargo.strength === 1, "cargo never gains strength from transport damage");
  battle = cargoBattle(8,0,1);
  ok(battle.result.dmgToDefender === 0 && battle.cargo.strength === 8,
    "a transport that loses no machines keeps its oversized cargo intact");
  battle = cargoBattle(8,0.99);
  ok(battle.result.defenderDead && !battle.g.units.includes(battle.cargo), "destroyed transport also removes its cargo");

  game = new ENGINE.Game({name:"Attacking transport",grid:["....","...."],
    units:[{t:"MULE",o:0,x:0,y:0},{t:"POLAR",o:1,x:1,y:0},{t:"CHARLIE",o:0,x:0,y:1}]});
  carrier = game.units[0]; cargo = game.units[2];
  carrier.cargo.push(cargo); cargo.carriedBy = carrier.id;
  game.rng = function () { return 0.5; };
  result = game.attack(carrier,game.units[1]);
  ok(result.dmgToAttacker > 0 && cargo.strength === carrier.strength,
    "counterattack damage also reduces the initiating transport's cargo");

  game = new ENGINE.Game({name:"Illegal attacks",grid:["......."],
    units:[{t:"BISON",o:0,x:0,y:0},{t:"CHARLIE",o:0,x:1,y:0},{t:"FALCON",o:1,x:2,y:0},
      {t:"POLAR",o:1,x:6,y:0}]});
  [1,2,3].forEach(function (target) {
    rejects(game,function () { game.attack(game.units[0],game.units[target]); },
      "engine rejects friendly, incompatible-domain and distant targets: " + target);
  });

  ["CHARLIE","ATLAS","TRIGGER"].forEach(function (type) {
    [false,true].forEach(function (stored) {
      var g = new ENGINE.Game({name:"PCE elimination exceptions",grid:["..F."],
        buildings:[{col:2,row:0,owner:1,stored:stored ? [type] : []}],
        units:[{t:"BISON",o:0,x:0,y:0}].concat(stored ? [] : [{t:type,o:1,x:3,y:0}])});
      g.checkElimination();
      var excluded = type === "TRIGGER" || (stored && type === "ATLAS");
      ok(g.winner === (excluded ? 0 : null), "PCE elimination counts " + type + " in " + (stored ? "storage" : "field"));
    });
  });
};
