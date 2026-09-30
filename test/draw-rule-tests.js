/* Every match is drawn when turn ENGINE.TURN_LIMIT ends, or after
 * ENGINE.QUIET_TURNS whole turns in which no unit lost a machine and no
 * factory was captured. */
"use strict";
module.exports = function (ok) {
  var E = require("../js/engine.js");
  var M = require("../js/ai-model.js");
  var S = require("../js/ai-search.js");
  function throws(fn, pattern, label) {
    try { fn(); } catch (e) { ok(pattern.test(e.message), label + ": wrong error " + JSON.stringify(e.message)); return; }
    ok(false, label + ": no error");
  }
  // The same position at turn `turn`, with progress last made in turn `progress`.
  function at(level, turn, progress) {
    var s = new E.Game(level, {seed: 5}).snapshot();
    s.turn = turn; s.progressTurn = progress;
    return E.Game.restore(s);
  }
  function endTurns(game) { while (!game.over()) game.endTurn(); return game; }
  function level(name, units, extra) {
    return Object.assign({name: name, grid: [".F...", ".....", ".B..."], units: units.concat([{t: "CHARLIE", o: 1, x: 4, y: 2}])}, extra);
  }
  var idle = level("Idle", [{t: "CHARLIE", o: 0, x: 0, y: 1}]);

  ok(E.TURN_LIMIT === 5000 && E.QUIET_TURNS === 100, "every match has a 5000-turn limit and a 100-turn no-progress draw");

  var quiet = new E.Game(idle, {seed: 1});
  for (var half = 1; half < 2 * E.QUIET_TURNS; half++) quiet.endTurn();
  ok(!quiet.over() && quiet.turn === E.QUIET_TURNS && quiet.currentPlayer === 1, "the hundredth quiet turn is played to its end");
  quiet.endTurn();
  ok(quiet.winner === null && quiet.winReason === "no-progress" && quiet.turn === E.QUIET_TURNS,
    "a hundred turns without a loss or a factory capture draw the match, which keeps the number of its last turn");
  ok(quiet.legalCommands().length === 0 && !quiet.canMoveNow(quiet.units[0]), "a drawn match offers no commands");
  throws(function () { quiet.endTurn(); }, /match is over/, "a drawn match has no turn to end");
  ok(M.evaluate(quiet, 0, M.context(quiet)) === 0 && M.evaluate(quiet, 1, M.context(quiet)) === 0, "bots score a drawn match as even");

  var fight = at(level("Fight", [{t: "POLAR", o: 0, x: 1, y: 1}, {t: "CHARLIE", o: 1, x: 2, y: 1}]), 150, 60);
  var hit = fight.attack(fight.units[0], fight.units[1]);
  ok(hit.dmgToDefender > 0 && fight.progressTurn === 150, "a unit losing a machine restarts the count");
  ok(E.Game.restore(fight.snapshot()).progressTurn === 150 && M.clone(fight).progressTurn === 150 &&
    E.Game.restore(S.publicSnapshot(fight)).progressTurn === 150, "saves, bot copies and worker snapshots keep the count");
  ok(endTurns(fight).winReason === "no-progress" && fight.turn === 250, "the draw comes a hundred turns after the last loss");

  var tap = at(level("Tap", [{t: "CHARLIE", o: 0, x: 1, y: 1, str: 2}, {t: "HADRIAN", o: 1, x: 2, y: 1}]), 150, 60);
  var miss = tap.attack(tap.units[0], tap.units[1]);
  ok(miss.dmgToDefender === 0 && miss.dmgToAttacker === 0 && tap.progressTurn === 60, "an attack that costs no machines does not restart the count");
  ok(endTurns(tap).winReason === "no-progress" && tap.turn === 160, "the draw still comes a hundred turns after the last progress");

  var grab = at(level("Grab", [{t: "CHARLIE", o: 0, x: 0, y: 0}, {t: "CHARLIE", o: 0, x: 0, y: 2}],
    {buildings: [{col: 1, row: 0}, {col: 1, row: 2}]}), 150, 60);
  var runner = grab.units[1];
  grab.moveUnit(runner, 1, 2); grab.finishUnit(runner);
  ok(grab.buildings["1,2"].owner === 0 && !grab.over() && grab.progressTurn === 60, "capturing a neutral base does not restart the count");
  var infantry = grab.units[0];
  grab.moveUnit(infantry, 1, 0); grab.finishUnit(infantry);
  ok(grab.buildings["1,0"].owner === 0 && grab.progressTurn === 150, "capturing a factory restarts the count");
  ok(endTurns(grab).winReason === "no-progress" && grab.turn === 250, "the draw comes a hundred turns after the capture");

  var last = endTurns(at(idle, E.TURN_LIMIT - 1, E.TURN_LIMIT - 1));
  ok(last.winner === null && last.winReason === "turnlimit" && last.turn === E.TURN_LIMIT, "the match is drawn when turn 5000 ends");

  var won = new E.Game(level("Won", [{t: "CHARLIE", o: 0, x: 0, y: 2}], {buildings: [{col: 1, row: 2, owner: 1}]}), {seed: 1});
  won.moveUnit(won.units[0], 1, 2); won.finishUnit(won.units[0]);
  ok(won.winner === 0 && won.winReason === "base", "a base capture still wins before any draw");
  throws(function () { won.endTurn(); }, /match is over/, "a won match has no turn to end");

  // The battle dock counts the turns left, the current one included.
  var UI = require("../js/ui.js"), RENDER = require("../js/render.js");
  var nodes = {}, previousDocument = global.document, previousRender = global.RENDER;
  function node() {
    var classes = new Set();
    return {textContent: "", setAttribute: function () {},
      classList: {add: function (c) { classes.add(c); }, remove: function (c) { classes.delete(c); }, contains: function (c) { return classes.has(c); }}};
  }
  global.RENDER = RENDER;
  global.document = {getElementById: function (id) { return nodes[id] || (nodes[id] = node()); }};
  try {
    var ui = Object.create(UI.GameUI.prototype);
    ui.refreshUndoButton = function () {}; ui.renderer = {}; ui.options = null; ui.mode = "idle";
    var status = function (game) {
      ui.game = game; ui.refreshStatus();
      return nodes["status-draw"].classList.contains("hidden") ? "hidden" :
        nodes["status-draw-turns"].textContent + " " + nodes["status-draw-unit"].textContent;
    };
    ok(status(new E.Game(idle, {seed: 1})) === "100 turns", "a new match shows 100 turns to the draw");
    ok(status(at(idle, 150, 60)) === "11 turns" && status(at(idle, 160, 60)) === "1 turn", "the count shrinks to the last quiet turn");
    ok(status(at(idle, E.TURN_LIMIT - 10, E.TURN_LIMIT - 11)) === "11 turns", "near the end the turn limit comes first");
    ok(status(quiet) === "hidden", "a finished match shows no count");
  } finally {
    global.document = previousDocument; global.RENDER = previousRender;
  }
};
