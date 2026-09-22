/* Save/resume and profile regression tests; invoked by run-tests.js. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var AI = require("../js/ai.js");
  var UI = require("../js/ui.js");
  var PROFILES = require("../js/profiles.js");
  var CAMPAIGN = require("../js/data-maps.js");
  var map = {name: "SAVE TEST", grid: ["F.......", "........", "........"],
    buildings: [{col: 0, row: 0, owner: 0, stored: ["ATLAS", "CHARLIE"]}],
    units: [{t: "MULE", o: 0, x: 1, y: 1}, {t: "CHARLIE", o: 0, x: 2, y: 1},
      {t: "RABBIT", o: 0, x: 4, y: 1}, {t: "POLAR", o: 1, x: 5, y: 1}]};
  var game = new ENGINE.Game(map, {seed: 123});
  var mule = game.units[0], cargo = game.units[1], rabbit = game.units[2];
  game.moveUnit(cargo, mule.col, mule.row);
  game.attack(rabbit, game.units[3]);
  var saved = game.snapshot();
  var restored = ENGINE.Game.restore(saved);
  ok(JSON.stringify(restored.snapshot()) === JSON.stringify(saved), "full snapshot round trips losslessly");
  ok(restored.units[0].cargo[0] === restored.units[1], "loaded cargo retains shared unit identity");
  ok(restored.units[1].carriedBy === restored.units[0].id, "transport ownership survives reload");
  var legacy = JSON.parse(JSON.stringify(saved));
  delete legacy.types.MULE.cargoTypes; delete legacy.types.MULE.cargoFactoryTypes;
  var migrated = ENGINE.Game.restore(legacy);
  ok(migrated.units[0].type.cargoTypes.join(",") === "CHARLIE,KILROY,ATLAS,TRIGGER" &&
    migrated.units[0].type.cargoFactoryTypes[0] === "PANTHER",
    "old saved Mule definitions acquire the original passenger restrictions");
  ok(restored.buildingAt(0,0).stored.length === 2, "factory inventories survive reload");
  ok(restored.units[2].attacked && restored.units[2].movePointsLeft === rabbit.movePointsLeft, "post-attack movement and spent attack survive reload");
  ok(restored.rng() === game.rng() && restored.rng() === game.rng(), "random stream resumes exactly");
  restored.endTurn(); restored.endTurn();
  restored.unload(restored.units[0], restored.units[1], 2, 1);
  ok(!restored.units[1].carriedBy && restored.units[0].cargo.length === 0, "restored transport can unload");
  restored.deployFromFactory(restored.buildingAt(0,0), restored.buildingAt(0,0).stored[1], 1,0);
  ok(restored.unitAt(1,0).typeId === "CHARLIE", "restored factory can deploy");
  ok(ENGINE.makeUnit("BISON",0,0,0).id > Math.max.apply(null, saved.units.map(function (u) {return u.id;})), "restored IDs cannot collide with new units");
  restored.units[0].strength = 2;
  ok(saved.units[0].strength !== 2, "restoration does not mutate the saved object");

  // Resume both human and AI turns and compare uninterrupted outcomes.
  var first = new ENGINE.Game(CAMPAIGN[0], {seed: 54});
  AI.playTurn(first, 0); first.endTurn();
  var second = ENGINE.Game.restore(first.snapshot());
  AI.playTurn(first, 1); first.endTurn();
  AI.playTurn(second, 1); second.endTurn();
  ok(JSON.stringify(first.snapshot()) === JSON.stringify(second.snapshot()), "AI checkpoint replay equals uninterrupted play");
  second = ENGINE.Game.restore(first.snapshot());
  AI.playTurn(first, 0); AI.playTurn(second, 0);
  ok(JSON.stringify(first.snapshot()) === JSON.stringify(second.snapshot()), "human-turn restore preserves all rule outcomes");

  var captureGame = new ENGINE.Game({name: "CAPTURE SAVE", grid: [".F..", "...."],
    units: [{t: "CHARLIE", o: 0, x: 0, y: 0}, {t: "BISON", o: 1, x: 3, y: 1}]}, {seed: 5});
  var capturer = captureGame.units[0];
  captureGame.moveUnit(capturer, 1,0); captureGame.finishUnit(capturer);
  var captured = ENGINE.Game.restore(captureGame.snapshot());
  var factory = captured.buildingAt(1,0);
  ok(factory.owner === 0 && factory.stored[0].moved && factory.stored[0].exp === 4,
    "capture ownership, experience and deployment lock survive resume");
  captured.endTurn(); captured.endTurn();
  ok(!factory.stored[0].moved, "restored factory inventory unlocks on the next turn");

  var customId = "SAVE_CUSTOM";
  global.mergeUnitTypes({SAVE_CUSTOM: Object.assign({}, global.UNIT_TYPES.BISON, {name: "Custom save tank"})});
  var customGame = new ENGINE.Game({name: "CUSTOM", grid: ["...."],
    units: [{t: customId, o: 0, x: 0, y: 0}, {t: "BISON", o: 1, x: 3, y: 0}]}, {seed: 9});
  var customSave = customGame.snapshot();
  delete global.UNIT_TYPES[customId];
  var customRestored = ENGINE.Game.restore(customSave);
  ok(customRestored.units[0].type.name === "Custom save tank", "custom type definitions travel with the match");
  delete global.UNIT_TYPES[customId];

  var ui = Object.create(UI.GameUI.prototype);
  ui.game = new ENGINE.Game({name: "MOVE", grid: ["......", "......"],
    units: [{t: "BISON", o: 0, x: 0, y: 0}, {t: "POLAR", o: 1, x: 3, y: 0}]}, {seed: 4});
  ui.selected = ui.game.units[0];
  ui.game.moveUnit(ui.selected, 1,0); ui.game.finishMovement(ui.selected); ui.mode = "moved";
  var provisional = ui.snapshotForSave();
  ok(provisional.units[0].col === 1 && provisional.units[0].shifted, "completed movement saves its actual position and movement phase");
  ui.mode = "battle"; ui.busy = true;
  ok(ui.snapshotForSave().units[0].col === 1, "committed combat keeps its firing position during animation");
  ui.mode = "aiTurn";
  ok(ui.snapshotForSave() === null, "partial AI animation cannot overwrite turn-boundary checkpoint");

  function memory() {
    var data = {};
    return {getItem: function (k) { return data[k] || null; }, setItem: function (k,v) { data[k] = v; }};
  }
  function throws(fn) { try { fn(); return false; } catch (e) { return true; } }
  var storage = memory(), store = new PROFILES.Store(storage);
  storage.setItem("nectaris-progress", JSON.stringify({cleared: 3}));
  ok(store.active() === null, "first visit has no selected profile");
  var alice = store.create(" Alice ");
  ok(alice.name === "Alice" && alice.cleared.length === 3, "first profile inherits legacy stars once");
  ok(throws(function () { store.create("alice"); }), "duplicate usernames are rejected case-insensitively");
  ok(throws(function () { store.create("   "); }), "blank usernames are rejected");
  var match = {id: "match-1", options: {campaignIndex: 5}, state: saved};
  store.checkpoint(alice.id, match);
  var bob = store.create("Bob");
  ok(!bob.savedMatch && !bob.results.length && !bob.cleared.length, "new profile has independent progress");
  ok(throws(function () { store.checkpoint(alice.id, match); }), "stale tab cannot save into a switched profile");
  store.switchTo(alice.id);
  store = new PROFILES.Store(storage);
  ok(store.active().savedMatch.id === "match-1", "profile choice and unfinished match survive reopening");
  match.state.winner = 0; match.state.winReason = "base";
  store.checkpoint(alice.id, match); store.checkpoint(alice.id, match);
  ok(store.active().results.length === 1 && !store.active().savedMatch, "victory recorded exactly once and clears continuation");
  ok(store.active().cleared.indexOf(5) >= 0 && store.active().cleared.indexOf(4) < 0, "winning a later mission only marks that mission cleared");
  match.id = "match-2"; match.state.winner = 1; match.state.winReason = "elimination";
  store.checkpoint(alice.id, match);
  ok(store.active().results[1].outcome === "loss", "defeats are recorded");
  match.id = "match-3"; match.options.hotseat = true;
  store.checkpoint(alice.id, match);
  ok(store.active().results[2].hotseat && store.active().results[2].winner === 1, "hotseat winner is recorded separately from solo results");
  store.switchTo(bob.id);
  ok(store.active().results.length === 0, "other player's history stays untouched");
  var before = storage.getItem(PROFILES.KEY);
  storage.setItem = function () { throw new Error("quota"); };
  ok(throws(function () { store.create("No space"); }) && storage.getItem(PROFILES.KEY) === before, "storage failure preserves previous data");
  var corrupt = memory(); corrupt.setItem(PROFILES.KEY, "{broken");
  ok(throws(function () { new PROFILES.Store(corrupt).create("Fresh"); }) && corrupt.getItem(PROFILES.KEY) === "{broken", "corrupt data is not silently overwritten");
  ok(throws(function () { ENGINE.Game.restore({version: 999}); }), "unknown save versions fail explicitly");
};
