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
  var legacyError = "";
  try { ENGINE.Game.restore(legacy); } catch (e) { legacyError = e.message; }
  ok(/older version/.test(legacyError), "a save whose Mule lacks passenger rules is refused, not migrated");
  var baseSave = JSON.parse(JSON.stringify(saved));
  Object.keys(baseSave.buildings).forEach(function (key) { if (baseSave.buildings[key].stored.length) baseSave.buildings[key].kind = "base"; });
  var baseError = "";
  try { ENGINE.Game.restore(baseSave); } catch (e) { baseError = e.message; }
  ok(/invalid buildings/.test(baseError), "a save with units stored in a base is refused");
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
    return {getItem: function (k) { return data[k] || null; }, setItem: function (k,v) { data[k] = String(v); },
      removeItem: function (k) { delete data[k]; }, key: function (i) { return Object.keys(data)[i]; },
      get length() { return Object.keys(data).length; }};
  }
  function throws(fn) { try { fn(); return false; } catch (e) { return true; } }
  var storage = memory(), store = new PROFILES.Store(storage);
  storage.setItem("nectaris-progress", JSON.stringify({cleared: 3}));
  ok(store.active() === null, "first visit has no selected profile");
  var alice = store.create(" Alice ");
  ok(alice.name === "Alice" && alice.cleared.length === 0, "the pre-profile progress record is not imported");
  ok(throws(function () { store.create("alice"); }), "duplicate usernames are rejected case-insensitively");
  ok(throws(function () { store.create("   "); }), "blank usernames are rejected");
  var match = {id: "match-1", key: "campaign:5", options: {campaignIndex: 5}, state: saved};
  store.checkpoint(alice.id, match);
  var bob = store.create("Bob");
  ok(!store.sessions(bob.id).length && !bob.results.length && !bob.cleared.length, "new profile has independent progress");
  ok(throws(function () { store.checkpoint(alice.id, match); }), "stale tab cannot save into a switched profile");
  store.switchTo(alice.id);
  store = new PROFILES.Store(storage);
  ok(store.sessions(alice.id)[0].id === "match-1", "profile choice and unfinished match survive reopening");
  match.state.winner = 0; match.state.winReason = "base";
  store.checkpoint(alice.id, match); store.checkpoint(alice.id, match);
  ok(store.active().results.length === 1 && !store.sessions(alice.id).length, "victory recorded exactly once and clears continuation");
  ok(store.active().cleared.indexOf(5) >= 0 && store.active().cleared.indexOf(4) < 0, "winning a later mission only marks that mission cleared");
  match.id = "match-2"; match.state.winner = 1; match.state.winReason = "elimination";
  store.checkpoint(alice.id, match);
  ok(store.active().results[1].outcome === "loss", "defeats are recorded");
  match.id = "match-3"; match.options.hotseat = true;
  store.checkpoint(alice.id, match);
  ok(store.active().results[2].hotseat && store.active().results[2].winner === 1, "hotseat winner is recorded separately from solo results");
  // Playing Xenon: Xenon's victory is the player's win, kept apart from Union records.
  match.id = "match-4"; match.options = {campaignIndex: 7, humanSide: 1}; match.state.winner = 1;
  store.checkpoint(alice.id, match);
  var xenonWin = store.active().results[3];
  ok(xenonWin.outcome === "win" && xenonWin.humanSide === 1 && store.active().cleared.indexOf(7) < 0,
    "a Xenon victory is a win for a Xenon player and does not clear the Union campaign entry");
  ok(PROFILES.levelRecord(store.active(), match.state.map, {campaignIndex: 7, humanSide: 1}).wins === 1 &&
    PROFILES.levelRecord(store.active(), match.state.map, {campaignIndex: 7}).wins === 0,
    "Xenon and Union records of one level are separate");
  store.switchTo(bob.id);
  ok(store.active().results.length === 0, "other player's history stays untouched");
  var before = storage.getItem(PROFILES.KEY);
  storage.setItem = function () { throw new Error("quota"); };
  ok(throws(function () { store.create("No space"); }) && storage.getItem(PROFILES.KEY) === before, "storage failure preserves previous data");
  var fresh = new PROFILES.Store(memory()), wilson = fresh.ensureDefault();
  ok(wilson.name === "Wilson" && fresh.active().id === wilson.id, "a first visit starts as the default profile Wilson");
  ok(fresh.ensureDefault().id === wilson.id && fresh.read().profiles.length === 1,
    "later visits keep the existing profile instead of adding another Wilson");
  fresh.checkpoint(wilson.id, {id: "wilson-match", key: PROFILES.sessionKey(map, {}), options: {},
    state: new ENGINE.Game(map, {seed: 1}).snapshot()});
  fresh.rename(wilson.id, "  Ada ");
  ok(fresh.active().id === wilson.id && fresh.active().name === "Ada" && fresh.sessions(wilson.id)[0].id === "wilson-match",
    "renaming keeps the same profile and its unfinished match");
  fresh.rename(wilson.id, "ADA");
  ok(fresh.active().name === "ADA", "a profile may change the case of its own name");
  var grace = fresh.create("Grace");
  ok(throws(function () { fresh.rename(grace.id, "ada"); }) && fresh.active().name === "Grace",
    "renaming refuses another profile's name case-insensitively");
  ok(throws(function () { fresh.rename(grace.id, " "); }) && throws(function () { fresh.rename("missing", "Zed"); }),
    "renaming rejects blank names and unknown profiles");
  var corrupt = memory(); corrupt.setItem(PROFILES.KEY, "{broken");
  ok(throws(function () { new PROFILES.Store(corrupt).create("Fresh"); }) && corrupt.getItem(PROFILES.KEY) === "{broken", "corrupt data is not silently overwritten");
  ok(throws(function () { ENGINE.Game.restore({version: 999}); }), "unknown save versions fail explicitly");

  // Version 1 kept one unfinished match inside each profile.
  var oldStorage = memory(), oldMatch = {id: "old-match", options: {campaignIndex: 2, opponent: "classic", opening: "original"},
    savedAt: "2026-09-29T10:00:00.000Z", state: new ENGINE.Game(map, {seed: 2}).snapshot()};
  oldStorage.setItem(PROFILES.KEY, JSON.stringify({version: 1, activeId: "p1",
    profiles: [{id: "p1", name: "Old", results: [], cleared: [4], savedMatch: oldMatch}]}));
  var upgraded = new PROFILES.Store(oldStorage), oldSessions = upgraded.sessions("p1");
  ok(upgraded.read().version === 2 && !("savedMatch" in upgraded.active()) && upgraded.active().log.length === 0 &&
    upgraded.active().cleared[0] === 4 && oldSessions.length === 1 && oldSessions[0].id === "old-match" &&
    oldSessions[0].key === "campaign:2", "a version 1 profile keeps its stars and moves its unfinished match to its own save");

  // Every board, side and Mode keeps its own unfinished match.
  var multi = new PROFILES.Store(memory()), player = multi.create("Many");
  function openMatch(id, options, savedAt) {
    return {id: id, key: PROFILES.sessionKey(map, options), options: options, savedAt: savedAt,
      state: new ENGINE.Game(map, {seed: 3}).snapshot()};
  }
  function playEvent(event, openedMatch, at) {
    return {at: at, event: event, match: openedMatch.id, key: openedMatch.key, name: map.name,
      side: PROFILES.humanSide(openedMatch.options), hotseat: false, opponent: "classic", turn: 1};
  }
  var first = openMatch("a", {campaignIndex: 0}, "2020-01-01T10:00:00.000Z");
  var second = openMatch("b", {campaignIndex: 1}, "2020-01-01T11:00:00.000Z");
  var xenon = openMatch("c", {campaignIndex: 0, humanSide: 1}, "2020-01-01T12:00:00.000Z");
  multi.record(player.id, playEvent("start", first, "2020-01-01T10:00:00.000Z"));
  [first, second, xenon].forEach(function (m) { multi.checkpoint(player.id, m); });
  ok(multi.sessions(player.id).map(function (m) { return m.id; }).join() === "c,b,a" &&
    multi.session(player.id, "campaign:0").id === "a" && multi.session(player.id, "campaign:0:xenon").id === "c",
    "unfinished matches on several boards and sides are kept side by side, newest first");
  second.state.winner = 0; second.state.winReason = "base";
  multi.checkpoint(player.id, second);
  ok(multi.sessions(player.id).length === 2 && multi.session(player.id, "campaign:1") === null && multi.active().results.length === 1,
    "finishing one match records it and removes only its own save");
  multi.abandon(player.id, first, playEvent("abandon", first, "2020-01-01T13:00:00.000Z"));
  multi.checkpoint(player.id, first);
  multi.record(player.id, playEvent("leave", first, "2020-01-01T14:00:00.000Z"));
  ok(multi.session(player.id, "campaign:0") === null && multi.active().log.length === 2,
    "an abandoned match stays in the history, and late saves or events cannot reopen it");
  var attemptsOn = PROFILES.attemptCounts(multi.active(), multi.sessions(player.id));
  ok(attemptsOn(map, {campaignIndex: 0}) === 2 && attemptsOn(map, {campaignIndex: 1}) === 1 && attemptsOn(map, {campaignIndex: 2}) === 0,
    "attempts count every match begun on a board, on either side, finished or not");
  ok(PROFILES.history(multi.active()).map(function (e) { return e.event + ":" + e.match; }).join() === "win:b,abandon:a,start:a",
    "the history lists results and play events newest first");
  var totals = PROFILES.summary(multi.active(), multi.sessions(player.id));
  ok(totals.attempts === 3 && totals.wins === 1 && totals.losses === 0 && totals.abandoned === 1 && totals.open === 1,
    "the history summary counts attempts, results, abandoned and unfinished matches");
  ok(throws(function () { multi.checkpoint(player.id, {id: "keyless", options: {}, state: xenon.state}); }) &&
    multi.sessions(player.id).length === 1, "a match without the key of its board cannot be saved");
};
