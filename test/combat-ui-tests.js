/* Default movement, direct attack, committed moves, undo barriers and map controls. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js"), UI = require("../js/ui.js");
  var unitView = require("../js/unit-view.js");
  var savedDocument = global.document, savedView = global.COMBAT_VIEW, savedRender = global.RENDER;
  var nodes = {};
  function element() {
    var classes = new Set(["hidden"]), html = "";
    return { getContext: function () { return new Proxy({}, {get:function(target,key) { return target[key] || function () {}; }}); }, style: {}, children: [], textContent: "", offsetWidth: 108, offsetHeight: 26,
      set innerHTML(value) { html = value; this.children = []; }, get innerHTML() { return html; },
      appendChild: function (child) { this.children.push(child); }, setAttribute: function () {},
      querySelector: function () { return { width: 32, height: 32, getContext: function () {
        return new Proxy({}, { get: function (target, key) { return target[key] || function () {}; } });
      } }; },
      classList: { add: function (c) { classes.add(c); }, remove: function (c) { classes.delete(c); },
        contains: function (c) { return classes.has(c); } },
    };
  }
  global.document = { getElementById: function (id) { return nodes[id] || (nodes[id] = element()); }, createElement: element };
  global.COMBAT_VIEW = require("../js/combat-view.js");
  global.RENDER = require("../js/render.js");
  function fixture(type, enemyX, commands) {
    var game = new ENGINE.Game({name: "Combat UI", grid: ["........", "........", "........"],
      units: [{t: type, o: 0, x: 1, y: 1}, {t: type === "HAWKEYE" || type === "FALCON" ? "EAGLE" : "POLAR", o: 1, x: enemyX, y: 1}]}, {seed: 7});
    var ui = Object.create(UI.GameUI.prototype);
    ui.game = game; ui.canvas = { width: 800, height: 600, style: {}, parentElement: { clientWidth: 800, clientHeight: 600 } }; ui.renderer = {
      hexSize: 34, zoom: 1,
      hexCenter: function (col, row) { var p = HEX.toPixel(col, row, 34); return {x: p.x + 200, y: p.y + 100}; },
      pixelToHex: function (col, row) { return { col: col, row: row }; },
    };
    ui.draw = ui.showUnitInfo = ui.refreshStatus = ui.checkGameOver = ui.updateHoverInfo = function () {};
    ui.warLedger = require("../js/battle-report.js").emptyLedger();
    ui.animateBattleResult = function (event, detail, done) { ui.battleEvent = event; ui.animationDone = done; };
    ui.selectUnit(game.units[0]);
    return ui;
  }
  function action(label) { return nodes["action-menu"].children.find(function (button) { return button.textContent === label; }); }
  try {
    Object.keys(UNIT_TYPES).forEach(function (type) {
      if (["ATLAS", "TRIGGER"].indexOf(type) >= 0) return;
      var ready = fixture(type, ["HADRIAN","OCTOPUS","HAWKEYE"].includes(type) ? 4 : type === "LYNX" ? 3 : 2);
      ok(ready.mode === "unitSelected" && ready.renderer.highlights && !action("Shift") &&
        ready.pickTargets.length === ready.game.legalAttackTargets(ready.selected).length,
        type + " selection immediately opens movement and legal attacks without spending an action");
      ok(type === "PELICAN" ? !action("Attack") : action("Attack") && !action("Attack").disabled,
        type + " offers its legal direct attack alongside default movement");
      var untouched = JSON.stringify(ready.game.snapshot());
      action("Cancel").onclick();
      ok(ready.mode === "idle" && JSON.stringify(ready.game.snapshot()) === untouched,
        type + " cancelling selection consumes no action");
    });
    ["HADRIAN", "OCTOPUS", "HAWKEYE"].forEach(function (type) {
      var ui = fixture(type, 4), unit = ui.selected;
      var untouched = JSON.stringify(ui.game.snapshot());
      action("Attack").onclick();
      ok(ui.mode === "moved" && ui.pickTargets.length === 1 && JSON.stringify(ui.game.snapshot()) === untouched,
        type + " Attack immediately aims in place without moving");
      action("Cancel").onclick();
      ok(ui.mode === "unitSelected" && !action("Attack").disabled, type + " cancelling aim returns to movement");
      ui.onHexClick(2,1);
      ok(ui.mode === "idle" && unit.moved && unit.attackSpent && ui.canUndo(),
        type + " moving immediately finishes its action and is undoable");
      var rejected = false;
      try { ui.game.attack(unit,ui.game.units[1]); } catch (error) { rejected = true; }
      ok(rejected, type + " cannot fire after moving");
      ui.undoLast(); unit = ui.game.units[0];
      ok(JSON.stringify(ui.game.snapshot()) === untouched, type + " Undo restores its complete ready state");
      ui.onHexClick(1,1); action("Attack").onclick(); ui.onHexClick(4,1);
      ok(unit.attacked && unit.moved && unit.col === 1 && unit.row === 1 && !ui.canUndo(),
        type + " direct attack consumes its action and cannot be undone");
      ui.animationDone();
    });
    var atlasUI = fixture("ATLAS",4), atlas = atlasUI.selected;
    ok(atlasUI.mode === "moved" && atlasUI.pickTargets.length === 1 && !action("Attack"),
      "Atlas immediately shows targets without a movement phase");
    atlasUI.onCancel();
    ok(atlasUI.mode === "idle" && !atlas.moved, "Atlas cancellation spends no action");
    atlasUI.selectUnit(atlas); atlasUI.onHexClick(4,1);
    ok(atlas.attacked && atlas.moved, "Atlas fires once and completes its activation");
    atlasUI.animationDone();
    var mineUI = fixture("TRIGGER",4);
    ok(!action("Attack") && action("End"), "Trigger offers no illegal attack or move");

    var ui = fixture("BISON",7), unit = ui.selected;
    var before = JSON.stringify(ui.game.snapshot());
    ok(action("Attack").disabled, "Attack is disabled when no targets are available");
    action("Attack").onclick();
    ok(ui.mode === "unitSelected" && JSON.stringify(ui.game.snapshot()) === before,
      "disabled Attack cannot consume an action");
    ui.onHexClick(2,1);
    ok(unit.col === 2 && unit.moved && unit.shifted && ui.mode === "idle" && !ui.selected && ui.canUndo(),
      "a move with no shot ends instantly and enables sidebar Undo");
    ui.refreshUndoButton();
    ok(!nodes["btn-undo"].disabled && nodes["btn-undo"].textContent === "↶ Undo" && nodes["btn-redo"].disabled,
      "the sidebar button exposes the pending move history");
    var saved = JSON.parse(JSON.stringify(ui.snapshotForSave()));
    ok(saved.units[0].col === 2 && saved.units[0].moved && saved.undoHistory.length === 1 &&
      !saved.undoHistory[0].state.map && !saved.undoHistory[0].state.types,
      "save keeps the committed move and compact undo history");
    ui.game = ENGINE.Game.restore(saved); ui.undoHistory = saved.undoHistory;
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === before && !ui.canUndo(), "Undo works after save/reload and restores flags, log and RNG");
    var undoneSave = JSON.parse(JSON.stringify(ui.snapshotForSave()));
    ui.refreshUndoButton();
    ok(ui.canRedo() && undoneSave.redoHistory.length === 1 && !undoneSave.redoHistory[0].state.map &&
      nodes["btn-undo"].disabled && !nodes["btn-redo"].disabled,
      "Undo enables the adjacent Redo button and saves compact redo state");
    ui.game = ENGINE.Game.restore(undoneSave); ui.redoHistory = undoneSave.redoHistory;
    ui.redoLast();
    var expectedMove = ENGINE.Game.restore(saved).snapshot();
    ok(JSON.stringify(ui.game.snapshot()) === JSON.stringify(expectedMove) && ui.canUndo() && !ui.canRedo(),
      "Redo after reload restores the exact move, flags, log and RNG");
    ui.undoLast(); ui.selectUnit(ui.game.units[0]); ui.onHexClick(1,0);
    ok(!ui.canRedo() && !ui.redoHistory.length,"a different committed action discards the abandoned redo branch");

    // More than one unit: no arbitrary stack limit, and End belongs to the move.
    ui = fixture("BISON",7);
    var second = ENGINE.makeUnit("BISON",0,0,2); ui.game.units.push(second);
    before = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(2,1);
    var firstMove = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(0,2); ui.onHexClick(1,2);
    ok(ui.undoHistory.length === 2 && second.moved, "moves across units share one undo stack");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === firstMove, "first undo restores only the most recent unit move");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === before, "second undo restores the earlier unit move");
    ui.redoLast();
    ok(JSON.stringify(ui.game.snapshot()) === firstMove,"redo replays multiple units' actions in original order");
    ui.redoLast();
    ok(ui.game.units[0].moved && ui.game.units[2].moved && !ui.canRedo(),"redo restores both completed unit moves");

    ui = fixture("BISON",3); unit = ui.selected;
    before = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(2,1);
    ok(ui.mode === "moved" && unit.shifted && !unit.moved && ui.pickTargets.length === 1 &&
      action("End") && !action("Cancel") && Object.keys(ui.game.movementRange(unit)).length === 1,
      "a committed move with a shot offers attack or End without another movement phase");
    var rejected = false;
    try { ui.game.moveUnit(unit,1,1); } catch (error) { rejected = true; }
    ok(rejected, "reselecting cannot grant a second ordinary movement phase");
    var committed = JSON.stringify(ui.game.snapshot()), seed = ui.game.rng.getState();
    ui.onMouseMove({offsetX:3,offsetY:1});
    ok(nodes["combat-inspector"].innerHTML.includes("Polar") &&
      nodes["combat-inspector"].innerHTML.includes("100,000") &&
      nodes["combat-inspector"].innerHTML.includes("Joint casualty probabilities") &&
      JSON.stringify(ui.game.snapshot()) === committed && ui.game.rng.getState() === seed,
      "hover forecast uses 100k independent trials without changing the committed board or RNG");
    var secondTarget = ENGINE.makeUnit("CHARLIE",1,2,0,5,4);
    ui.game.units.push(secondTarget); ui.pickTargets = ui.previewTargets(unit);
    ui.onMouseMove({offsetX:2,offsetY:0});
    ok(nodes["combat-inspector"].innerHTML.includes("Charlie") &&
      nodes["combat-inspector"].innerHTML.includes("+30% damage"), "hovering another target replaces its full forecast");
    ui.game.units.pop(); ui.pickTargets = ui.previewTargets(unit);
    ui.onMouseMove({offsetX:3,offsetY:1});
    var cached = ui._forecastCache;
    ui.onMouseMove({offsetX:3,offsetY:1});
    ok(ui._forecastCache === cached, "repeated hover reuses the forecast cache");
    ui.onMouseMove({offsetX:5,offsetY:2});
    ok(!nodes["combat-inspector"].classList.contains("hidden"), "last forecast remains readable away from its target");
    action("End").onclick();
    ok(unit.moved && ui.mode === "idle" && ui.undoHistory.length === 1, "End finishes the unit without adding a second undo step for the same move");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === before && nodes["combat-inspector"].classList.contains("hidden"),
      "one sidebar undo reverses the move plus End and clears stale forecast state");
    ui.redoLast();
    ok(ui.game.units[0].shifted && ui.game.units[0].moved,"redo preserves the End attached to a movement step");

    // A unit's move and follow-up attack are one uninterrupted activation.
    ui = fixture("BISON",3); unit = ui.selected;
    second = ENGINE.makeUnit("BISON",0,0,2); ui.game.units.push(second);
    ui.onHexClick(2,1);
    ui.onHexClick(2,1);
    ok(ui.selected === unit && !unit.moved && ui.pickTargets.length === 1,
      "clicking the active unit again keeps its immediate follow-up shot available");
    ui.onHexClick(0,2);
    ok(unit.moved && !unit.attacked && unit.movePointsLeft === 0 && ui.selected === second,
      "selecting another unit finishes the first unit's activation without attacking");
    var firstEnded = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(1,2); ui.onHexClick(2,1);
    ok(unit.moved && !ui.selected && !ui.previewTargets(unit).length &&
      !ui.game.remainingTurnActions().field.some(function (entry) { return entry.unit === unit; }),
      "move A, skip its attack, move B, reselect A cannot offer another action or End Turn reminder");
    rejected = false;
    try { ui.game.attack(unit,ui.game.units[1]); } catch (error) { rejected = true; }
    ok(rejected, "the engine rejects an attack by the unit whose activation was abandoned");
    saved = JSON.parse(JSON.stringify(ui.snapshotForSave()));
    ui.game = ENGINE.Game.restore(saved); ui.undoHistory = saved.undoHistory;
    ui.selectUnit(ui.game.units[0]);
    ok(!ui.selected && !ui.game.legalAttackTargets(ui.game.units[0]).length,
      "the finished activation stays finished after save/reload");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === firstEnded,
      "undoing the second unit's move keeps the first unit finished");
    ui.undoLast();
    ok(ui.game.units[0].col === 1 && !ui.game.units[0].moved && !ui.game.units[0].shifted,
      "undoing the first unit's move restores its ready activation");
    ui.redoLast();
    ok(JSON.stringify(ui.game.snapshot()) === firstEnded,
      "redo restores the first move together with its implicit End");

    ["escape", "empty", "enemy"].forEach(function (exit) {
      ui = fixture("BISON",3); unit = ui.selected;
      ui.onHexClick(2,1);
      if (exit === "escape") ui.onKey({key:"Escape"});
      else if (exit === "empty") ui.onHexClick(7,2);
      else ui.inspectEnemy(ui.game.units[1]);
      ok(unit.moved && !unit.attacked && ui.undoHistory.length === 1,
        exit + " finishes a started activation and keeps End grouped with the move");
    });

    ui = fixture("BISON",3); ui.onHexClick(2,1);
    ui.onCancel(true);
    ok(ui.game.units[0].col === 1 && !ui.game.units[0].moved && !ui.game.units[0].shifted,
      "right-click still undoes the just-committed move instead of ending it");
    ui.redoLast(); unit = ui.game.units[0];
    ui.selectUnit(unit);
    ok(!unit.moved && ui.pickTargets.length === 1,
      "redoing an unfinished move permits continuing that unit's activation");

    // Reload and history restoration clear selection, but not the activation rule.
    ["same", "other", "factory"].forEach(function (next) {
      ui = fixture("BISON",3); unit = ui.selected;
      second = ENGINE.makeUnit("BISON",0,0,2); ui.game.units.push(second);
      ui.onHexClick(2,1);
      saved = JSON.parse(JSON.stringify(ui.snapshotForSave()));
      ui.game = ENGINE.Game.restore(saved); ui.undoHistory = saved.undoHistory;
      ui.selected = null; ui.mode = "idle"; unit = ui.game.units[0];
      if (next === "same") ui.onHexClick(2,1);
      else if (next === "other") ui.selectUnit(ui.game.units[2]);
      else ui.openFactoryPanel({col:0,row:0,owner:0,kind:"factory",stored:[]});
      ok(next === "same" ? !unit.moved && ui.pickTargets.length === 1 : unit.moved,
        "after reload, choosing " + next + " respects the pending unit activation");
    });

    ui = fixture("HADRIAN",4); unit=ui.selected;
    var readySnapshot=JSON.stringify(ui.game.snapshot());
    ok(ui.pickTargets.length===1 && ui.renderer.highlights[HEX.key(4,1)]==="rgba(255,80,60,0.55)" &&
      Object.keys(ui.range).length>1 && ui.renderer.fireRange[HEX.key(4,1)].ground && !ui.renderer.fireRange[HEX.key(1,1)],
      "Hadrian immediately shows blue moves and red current-hex attacks with its indirect blind spot");
    ui.onMouseMove({offsetX:4,offsetY:1});
    ok(nodes["combat-inspector"].innerHTML.includes("100,000") && JSON.stringify(ui.game.snapshot())===readySnapshot,
      "hovering an immediate attack target previews without changing the board or RNG");
    ui.onHexClick(4,1);
    ok(ui.mode==="battle" && unit.attacked && unit.col===1 && unit.row===1,
      "clicking a highlighted enemy attacks from the current hex without an extra Attack command");
    ui.animationDone();

    ui=fixture("BISON",7);ui.onHexClick(2,1);ui.undoLast();
    ui.busy=true;ui.redoLast();
    ok(ui.game.units[0].col===1 && !ui.canRedo(),"redo is unavailable while actions are processing");
    ui.busy=false;ui.options={hotseat:true};ui.toast=function(){};ui.endTurn();ui.endTurn(true);
    ok(!ui.canRedo() && !ui.redoHistory.length,"turn boundaries clear redo as well as undo");

    ui=fixture("BISON",7);ui.onHexClick(2,1);var movedState=JSON.stringify(ui.game.snapshot());
    ui.inspectEnemy(ui.game.units[1]);ui.onCancel(true);
    ok(JSON.stringify(ui.game.snapshot())===movedState,"right-click dismisses a selection without undoing an earlier move");
    ui.onCancel(true);
    ok(ui.game.units[0].col===1 && ui.canRedo(),"right-click on the idle map undoes the previous noncombat action");

    // A battle is a hard boundary, even while its animation is still running.
    ui=fixture("BISON",3);ui.onCancel();
    unit = ui.game.units[0]; ui.onHexClick(1,1); ui.onHexClick(2,1);
    var baseline = ENGINE.Game.restore(ui.game.snapshot()); baseline.attack(baseline.units[0],baseline.units[1]);
    ui.onHexClick(3,1);
    ok(ui.mode === "battle" && ui.busy && !ui.canUndo() && !ui.undoHistory.length &&
      JSON.stringify(ui.game.snapshot()) === JSON.stringify(baseline.snapshot()),
      "combat clears all earlier moves and preserves the actual seeded result");
    var battleState = JSON.stringify(ui.game.snapshot());
    ui.undoLast(); ui.redoLast(); ui.onCancel(); ui.endTurn();
    ok(JSON.stringify(ui.game.snapshot()) === battleState, "Undo, Cancel and End Turn cannot interrupt or replay a battle");
    ui.animationDone();
    ok(ui.mode === "idle" && !ui.busy && !ui.canUndo(), "battle results close automatically with no prebattle undo history");

    ["RABBIT","LYNX"].forEach(function (type) {
      ui = fixture(type,4); unit = ui.selected;
      var firingCol = 4 - unit.type.rngG, allowance = unit.movePointsLeft;
      var approachCost = ui.range[HEX.key(firingCol,1)].cost;
      ui.onHexClick(firingCol,1);
      ok(unit.shifted && unit.movePointsLeft === allowance - approachCost && ui.pickTargets.length,
        type + " stores remaining allowance while preventing a second preattack move");
      ui.onHexClick(4,1); ui.animationDone();
      ok(ui.mode === "unitSelected" && unit.attacked && !unit.shifted && !unit.moved &&
        unit.movePointsLeft === allowance - approachCost && !ui.canUndo(),
        type + " unlocks remaining movement immediately after combat without undoing that battle");
      before = JSON.stringify(ui.game.snapshot());
      ui.onHexClick(firingCol-1,1);
      ok(ui.mode === "idle" && unit.moved && unit.attacked && ui.canUndo(), type + " retreat ends immediately");
      ui.undoLast();
      ok(JSON.stringify(ui.game.snapshot()) === before && !ui.canUndo(), type + " retreat undo stops at the completed battle");
      second = ENGINE.makeUnit("BISON",0,0,2); ui.game.units.push(second);
      ui.selectUnit(second);
      ok(ui.game.units[0].moved && ui.game.units[0].movePointsLeft === 0,
        type + " cannot bank its post-attack retreat while another unit acts");
    });

    ui = fixture("BISON",7); ui.onHexClick(2,1); ui.options = {hotseat:true}; ui.endTurn();
    ok(!ui.canUndo() && !ui.undoHistory.length && ui.game.currentPlayer === 1,
      "ending the turn prevents undoing the other player's turn");

    ui = fixture("BISON",7); ui.options={hotseat:true}; before=JSON.stringify(ui.game.snapshot());
    ui.endTurn();
    ok(ui.game.currentPlayer===0 && JSON.stringify(ui.game.snapshot())===before &&
      !nodes["end-turn-warning"].classList.contains("hidden") && !nodes["btn-endturn"].textContent.includes("anyway"),
      "first End Turn warns about a movable unit without changing the board or spending actions");
    ui.onKey({key:"e",repeat:true});
    ok(ui.game.currentPlayer===0,"holding E cannot accidentally confirm the end-turn warning");
    ui.endTurn(true);
    ok(ui.game.currentPlayer===1 && nodes["end-turn-warning"].classList.contains("hidden"),
      "the popup confirmation explicitly ends a turn with available actions");
    ui=fixture("BISON",7);ui.options={hotseat:true};ui.endTurn();ui.onHexClick(1,1);
    ok(!ui._endTurnConfirmation && nodes["end-turn-warning"].classList.contains("hidden"),
      "returning to unit controls cancels the pending end-turn confirmation");
    ui.endTurn();ui.game.units[0].moved=true;ui.game.units[0].moved=false;ui.game.units[0].col=2;ui.endTurn(true);
    ok(ui.game.currentPlayer===0,"a changed board requires a fresh end-turn confirmation");
    ui=fixture("ATLAS",7);
    ok(ui.remainingActions().field===1,"an immobile unit with an available shot still triggers the warning");
    ui=fixture("TRIGGER",7);ui.options={hotseat:true};ui.toast=function(){};ui.endTurn();
    ok(ui.game.currentPlayer===1 && !ui._endTurnConfirmation,"a unit with no legal action needs no confirmation");
    ui=fixture("MULE",7);ui.deselect();
    ui.game=new ENGINE.Game({name:"Blocked reserve",grid:["FMMMM","MMMMM","....."],
      buildings:[{col:0,row:0,owner:0,stored:["ATLAS"]}],
      units:[{t:"PELICAN",o:0,x:1,y:0},{t:"POLAR",o:1,x:4,y:2}]},{seed:2});
    ui.game.units[0].moved=true;
    ok(ui.remainingActions().reserves===1 && ui.remainingActions().field===0,
      "factory cargo that can board a spent carrier counts as a deployable action");
    ui.game.units[0].transferUsed=true;
    ok(ui.remainingActions().reserves===0,"blocked reserves with no available transport do not trigger the warning");
    delete ui.game.units[0].transferUsed;
    var reserveBuilding=ui.game.buildingAt(0,0);
    ui.game.loadFromFactory(reserveBuilding,reserveBuilding.stored[0],ui.game.units[0]);
    ui.game.endTurn();ui.game.endTurn();ui.game.units[0].moved=true;
    ok(ui.remainingActions().field===1,"a spent transport with unloadable cargo still counts as an available action");

    function transportUI() {
      var ui = fixture("MULE",7);
      var passenger = ENGINE.makeUnit("CHARLIE",0,0,1); ui.game.units.push(passenger);
      ui.deselect(); ui.onHexClick(0,1);
      var start = JSON.stringify(ui.game.snapshot());
      ui.onHexClick(1,1);
      ok(passenger.carriedBy === ui.game.units[0].id && ui.mode === "idle", "clicking a highlighted carrier boards it immediately");
      ui.undoLast();
      ok(JSON.stringify(ui.game.snapshot()) === start, "boarding undo restores cargo identity and the passenger's activation");
      ui.onHexClick(0,1); ui.onHexClick(1,1);
      ui.game.endTurn(); ui.game.endTurn(); ui.clearUndo();
      return ui;
    }
    ui = transportUI(); unit = ui.game.units[0];
    before = JSON.stringify(ui.game.snapshot());
    ui.selectUnit(unit);
    ok(ui.mode==="unitSelected" && action("Unload Charlie").className==="unload-available",
      "a ready carrier keeps movement first while visibly advertising unloading in orange");
    action("Unload Charlie").onclick();
    ok(ui.mode==="unload" && action("Move"),"manual unloading before movement offers a way back to movement");
    action("Move").onclick();
    ok(ui.mode==="unitSelected" && !ui.unloadCargo && JSON.stringify(ui.game.snapshot())===before,
      "switching between unloading and movement does not spend either allowance");
    ui.deselect();
    ui.onHexClick(1,1); ui.onHexClick(1,0);
    ok(unit.moved && ui.mode === "unload" && ui.unloadCargo === unit.cargo[0],
      "moving a carrier immediately opens passenger unloading without another command");
    var movedCarrier = JSON.stringify(ui.game.snapshot());
    var landingKeys=ui.game.unloadTargets(unit,unit.cargo[0]).map(function(n){return HEX.key(n.col,n.row);}).sort();
    ok(JSON.stringify(Object.keys(ui.renderer.highlights).sort())===JSON.stringify(landingKeys) &&
      Object.values(ui.renderer.highlights).every(function(color){return color==="rgba(255,155,45,0.62)";}),
      "automatic orange hexes match exactly the engine's legal unloading destinations");
    ui.renderer.hoverHex={col:unit.col,row:unit.row};document.getElementById("unit-hover").classList.remove("hidden");
    UI.GameUI.prototype.updateHoverInfo.call(ui);
    ok(nodes["unit-hover"].classList.contains("hidden"),"unloading hides the hover card so it cannot cover orange landing hexes");
    ok(nodes["action-menu"].children.some(function(node){return node.className==="deploy-prompt unload-prompt" && node.textContent.includes("Charlie");}) &&
      nodes["transport-actions"].children.some(function(node){return node.className==="unload-available";}),
      "orange passenger prompt and available Unload control explain the new highlight color");
    ui.onCancel(true);
    ok(ui.mode==="idle" && !ui.renderer.highlights && !ui.unloadCargo && JSON.stringify(ui.game.snapshot())===movedCarrier && ui.undoHistory.length===1,
      "right-click dismisses automatic unloading without undoing or spending an action");
    ui.selectUnit(unit);
    ok(ui.mode==="unload" && ui.unloadCargo===unit.cargo[0],"reselecting a moved carrier reopens its available unloading hexes");
    action("Cancel").onclick();
    ui.selectUnit(unit);
    ok(ui.mode==="unload" && JSON.stringify(ui.game.snapshot())===movedCarrier,
      "Cancel dismisses unloading and allows the same choices to reopen later");
    ui.onHexClick(2,0);
    ok(!unit.cargo.length && ui.game.unitAt(2,0).moved && ui.undoHistory.length === 2,
      "unloading records a separate reversible action");
    ui.undoLast(); unit = ui.game.units[0];
    ok(JSON.stringify(ui.game.snapshot()) === movedCarrier && unit.cargo[0] === ui.game.units.find(function (u) { return u.id === unit.cargo[0].id; }),
      "undo unloading reattaches the exact passenger object to the moved carrier");
    ui.redoLast();
    ok(!ui.game.units[0].cargo.length && ui.game.unitAt(2,0).moved && ui.game.units[0].transferUsed,
      "redo unloading restores both passenger placement and carrier transfer allowance");
    ui.undoLast();
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === before, "undo carrier movement restores both carrier and cargo state");

    // A loaded Atlas over mountains must remain visible even with Details closed.
    ui = fixture("PELICAN",7); ui.deselect();
    ui.game = new ENGINE.Game({name:"Atlas airlift", grid:["F.......","........","MMMMMMMM","MMMMMMMM","MMMMMMMM"],
      buildings:[{col:0,row:0,owner:0,stored:["ATLAS"]}],
      units:[{t:"PELICAN",o:0,x:1,y:0},{t:"POLAR",o:1,x:7,y:0}]}, {seed:19});
    var pelican = ui.game.units[0], atlasFactory = ui.game.buildingAt(0,0);
    var carriedAtlas = atlasFactory.stored[0];
    ui.game.loadFromFactory(atlasFactory,carriedAtlas,pelican);
    ui.selectUnit(pelican);
    ok(nodes["action-menu"].children.some(function (button) {
      return button.disabled && button.textContent.includes("Atlas") && button.textContent.includes("next turn");
    }) && ui.mode!=="unload", "newly loaded Atlas is visible but never opens illegal automatic unloading");
    ui.onHexClick(4,3);
    ui.game.endTurn(); require("../js/ai.js").playTurn(ui.game,1); ui.game.endTurn();
    ui.game = ENGINE.Game.restore(ui.game.snapshot());
    pelican = ui.game.units.find(function (u) { return u.typeId === "PELICAN"; });
    carriedAtlas = ui.game.units.find(function (u) { return u.typeId === "ATLAS"; });
    ok(pelican.cargo[0] === carriedAtlas && carriedAtlas.carriedBy === pelican.id && !carriedAtlas.moved,
      "factory-loaded Atlas remains aboard after carrier movement, an AI turn and save/reload");
    ui.deselect(); ui.selectUnit(pelican);
    ok(nodes["action-menu"].children.some(function (button) {
      return button.disabled && button.textContent.includes("Atlas") && button.textContent.includes("no landing space");
    }), "blocked Atlas unloading stays visible in the action strip with a reason");
    ui.renderUnitInfo(nodes["unit-info"],pelican);
    ok(nodes["unit-info"].innerHTML.includes("Cargo") && nodes["unit-info"].innerHTML.includes("Atlas"),
      "the shared hover and detail card names the passenger even when unloading is blocked");
    action("End").onclick(); ui.selectUnit(pelican);
    ok(ui.selected === pelican && nodes["action-menu"].children.some(function (button) {
      return button.disabled && button.textContent.includes("Atlas");
    }), "an already-finished loaded carrier still exposes its blocked passenger when selected");
    ui.game.endTurn(); ui.game.endTurn(); ui.deselect(); ui.selectUnit(pelican);
    ui.onHexClick(3,1);
    ok(ui.mode==="unload" && ui.unloadCargo===carriedAtlas && Object.keys(ui.renderer.highlights).length>0,
      "moving a Pelican from blocked mountains to legal terrain automatically opens orange Atlas unloading hexes");
    var atlasLanding = ui.game.unloadTargets(pelican,carriedAtlas)[0];
    ui.onHexClick(atlasLanding.col,atlasLanding.row);
    ok(!pelican.cargo.length && ui.game.unitAt(atlasLanding.col,atlasLanding.row) === carriedAtlas,
      "the same Atlas unloads successfully after moving away from the mountains");

    ui = fixture("BISON",4); before = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(4,1);
    ok(ui.mode === "enemyInspect" && JSON.stringify(ui.game.snapshot()) === before, "clicking an enemy while moving inspects it without a move-and-attack shortcut");
    ui.game.units[1].shifted = true; ui.game.units[1].moved = true; ui.game.units[1].movePointsLeft = 0;
    ui.inspectEnemy(ui.game.units[1]);
    ok(Object.keys(ui.renderer.highlights).length > 1, "enemy inspection previews its next turn despite completed movement");
    ui.onCancel();
    ok(ui.mode === "idle" && !ui.selected && !ui.renderer.fireRange &&
      nodes["range-legend"].classList.contains("hidden"), "Escape clears enemy inspection and both range overlays");

    ["HADRIAN", "OCTOPUS", "ATLAS", "HAWKEYE", "LYNX", "PELICAN"].forEach(function (type) {
      ui = fixture("BISON", 4);
      var enemy = ui.game.units[1];
      enemy.typeId = type; enemy.type = UNIT_TYPES[type];
      enemy.moved = enemy.shifted = enemy.attacked = true; enemy.movePointsLeft = 0;
      before = JSON.stringify(ui.game.snapshot());
      ui.inspectEnemy(enemy);
      var move = ui.renderer.highlights, fire = ui.renderer.fireRange;
      var bands = { HADRIAN: [2, 5, 0, 0], OCTOPUS: [2, 4, 0, 0], ATLAS: [2, 6, 0, 0],
        HAWKEYE: [0, 0, 2, 5], LYNX: [2, 2, 1, 1], PELICAN: [0, 0, 0, 0] }[type];
      for (var row = 0; row < ui.game.height; row++) {
        for (var col = 0; col < ui.game.width; col++) {
          var d = HEX.distance(enemy.col, enemy.row, col, row), band = fire[HEX.key(col, row)] || {};
          ok(!!band.ground === (d > 0 && d >= bands[0] && d <= bands[1]) &&
            !!band.air === (d > 0 && d >= bands[2] && d <= bands[3]),
            type + " inspection displays the correct ground/air firing band at " + col + "," + row);
        }
      }
      ok(JSON.stringify(ui.game.snapshot()) === before, type + " range inspection leaves the entire match unchanged");
      if (type === "HADRIAN") ok(Object.keys(move).some(function (key) { return fire[key] && fire[key].ground; }),
        "artillery shows movement and firing range simultaneously in overlapping hexes");
      if (type === "ATLAS") ok(Object.keys(move).length <= 1 && Object.keys(fire).length > 1 &&
        !nodes["range-legend"].innerHTML.includes('class="range-move"'), "emplaced Atlas shows firing range without a movement legend");
      ui.onCancel();
    });

    // Commands follow the selected unit, while crowded views get a safe rail.
    ui = fixture("ATLAS", 7);
    ui.renderer.originX = 40; ui.renderer.originY = 50;
    [0.2, 0.5, 1, 2, 4].forEach(function (zoom) {
      ui.renderer.zoom = zoom;
      ui.renderer.hexCenter = function (col) { return {x: col === 1 ? 400 : 750, y: 300}; };
      ui.positionActionMenu();
      var menuX = parseFloat(nodes["action-menu"].style.left), menuY = parseFloat(nodes["action-menu"].style.top);
      ok(ui.canvas.height === 600 && nodes["map-action-rail"].classList.contains("hidden") &&
        Math.abs(menuX + 54 - 400) < 220 && menuY >= 260 && menuY < 300 &&
        (menuX > 400 + 34 * zoom || menuX + 108 < 400 - 34 * zoom),
        "Atlas commands stay beside its hex at zoom " + zoom);
    });
    ui.renderer.zoom = 1;
    ui.renderer.hexCenter = function () { return {x: 790, y: 590}; };
    ui.selected = ui.game.units[1]; ui.mode = "moved"; ui.pickTargets = [ui.game.units[0]];
    ui.positionActionMenu();
    ok(parseFloat(nodes["action-menu"].style.left) + 108 <= 792 &&
      parseFloat(nodes["action-menu"].style.top) + 26 <= 592 &&
      ui.renderer.originX === 40 && ui.renderer.originY === 50,
      "commands flip at viewport edges without shifting the camera");
    if (nodes["war-dock"]) nodes["war-dock"].classList.add("hidden");
    ui.renderer.hexSize = 1000;
    ui.positionActionMenu();
    ok(ui.canvas.height === 564 && !nodes["map-action-rail"].classList.contains("hidden") &&
      nodes["action-menu"].style.top === "569px", "crowded views use a temporary rail without covering selectable hexes");
    ui.closeActionMenu();
    ok(ui.canvas.height === 600 && nodes["map-action-rail"].classList.contains("hidden"),
      "closing controls returns the entire bottom strip to the battlefield");

    var fits = 0;
    ui.renderer.fitToMap = function () { fits++; };
    Object.defineProperty(ui.canvas.parentElement, "clientWidth", { get: function () {
      return nodes.sidebar.classList.contains("hidden") ? 800 : 460;
    } });
    Object.defineProperty(nodes["map-action-rail"], "offsetHeight", { get: function () {
      return this.classList.contains("hidden") ? 0 : parseInt(this.style.height, 10);
    } });
    var layoutState = JSON.stringify(ui.game.snapshot());
    ui.setDetailsOpen(true);
    ok(ui.canvas.width === 460 && !nodes.sidebar.classList.contains("hidden"),
      "opening Details makes room for its readable inspector");
    ui.setDetailsOpen(false);
    ok(ui.canvas.width === 800 && ui.canvas.height === 600 && fits === 2 &&
      JSON.stringify(ui.game.snapshot()) === layoutState, "closing Details reclaims the full map without changing the match");

    // Hover details must stay near their hex even on the ultrawide SENECA
    // layout, and must not clip at any of the four viewport corners.
    [[3322, 1786], [940, 632], [620, 600]].forEach(function (viewport) {
      [20, viewport[0] / 2, viewport[0] - 20].forEach(function (x) {
        [20, viewport[1] / 2, viewport[1] - 20].forEach(function (y) {
          var pos = UI.hoverPosition({x: x, y: y}, 34, 260, 220, viewport[0], viewport[1], []);
          ok(pos && pos.x >= 8 && pos.y >= 8 && pos.x + 260 <= viewport[0] - 8 &&
            pos.y + 220 <= viewport[1] - 8, "hover card fits viewport " + viewport + " at " + x + "," + y);
          ok(pos && (pos.x >= x + 46 || pos.x + 260 <= x - 46 ||
            pos.y >= y + 46 || pos.y + 220 <= y - 46), "hover card leaves inspected hex clear");
        });
      });
    });
    var clearSide = UI.hoverPosition({x: 400, y: 200}, 34, 260, 220, 1000, 600,
      [{x: 450, y: 180, width: 70, height: 70}]);
    ok(clearSide.x < 400, "hover card prefers the empty side over covering a nearby unit");
    ok(UI.hoverPosition({x: 100, y: 50}, 34, 260, 220, 200, 100, []) === null,
      "a viewport too small for the card retains the sidebar instead of clipping the card");

    ui = fixture("BISON", 3);
    ui.updateHoverInfo = UI.GameUI.prototype.updateHoverInfo;
    before = JSON.stringify(ui.game.snapshot());
    ui.onMouseMove({offsetX: 3, offsetY: 1});
    var hover = nodes["unit-hover"];
    ok(!hover.classList.contains("hidden") && hover.innerHTML.includes("Polar") &&
      hover.innerHTML.includes("var(--xenon-color)") && !hover.innerHTML.includes("<span>Strength</span>") &&
      !hover.innerHTML.includes("hover-faction") && !hover.innerHTML.includes("<table"),
      "hover inspects an enemy while retaining the selected unit and hides full strength");
    ui.game.units[1].strength = 5;
    ui.updateHoverInfo();
    ok(hover.innerHTML.includes("aria-label='5 machines remaining'>5</span>") && !hover.innerHTML.includes(">Strength<"),
      "hover refreshes the remaining-unit number on the icon without a Strength label");
    ui.game.units[1].strength = 8;
    ui.onMouseMove({offsetX: 1, offsetY: 1});
    ok(hover.innerHTML.includes("Bison") && !hover.innerHTML.includes("Polar"),
      "moving between units replaces the local card's contents");
    ui.onMouseMove({offsetX: 6, offsetY: 1});
    ok(hover.classList.contains("hidden"), "hover card clears on empty terrain");
    ui.onMouseMove({offsetX: 1, offsetY: 1});
    ui.onMouseLeave();
    ok(hover.classList.contains("hidden") && !ui.renderer.hoverHex, "leaving the canvas clears hover state");
    ui.onMouseMove({offsetX: 1, offsetY: 1});
    ui.busy = true; ui.updateHoverInfo();
    ok(hover.classList.contains("hidden") && JSON.stringify(ui.game.snapshot()) === before,
      "committed combat hides hover details without changing game state");

    [-1,0,1].forEach(function(owner) {
      ui=fixture("BISON",7);ui.updateHoverInfo=UI.GameUI.prototype.updateHoverInfo;
      ui.game=new ENGINE.Game({name:"Factory hover",grid:["....F...","........","........"],
        buildings:[{col:4,row:0,owner:owner,stored:["BISON",{t:"BISON",exp:7},{t:"LYNX",str:5,exp:3}]}],
        units:[{t:"CHARLIE",o:0,x:1,y:1},{t:"POLAR",o:1,x:7,y:1}]},{seed:8});
      ui.deselect();before=JSON.stringify(ui.game.snapshot());ui.onMouseMove({offsetX:4,offsetY:0});
      hover=nodes["unit-hover"];
      ok(!hover.classList.contains("hidden") && hover.innerHTML.includes("Factory") &&
        hover.innerHTML.includes(owner<0 ? "Neutral" : RENDER.PLAYER_COLORS[owner].name) &&
        hover.innerHTML.includes("3 stored units") && !hover.innerHTML.includes("×2") &&
        hover.innerHTML.split("data-unit-type='BISON'").length===3 && hover.innerHTML.includes("data-unit-type='LYNX'") &&
        hover.innerHTML.includes("data-exp='7'") && hover.innerHTML.includes("data-exp='3'") &&
        !hover.innerHTML.includes("S-61") && !hover.innerHTML.includes("MB-4"),
        "factory hover shows every reserve separately with its own short name, icon and experience for owner "+owner);
      ok(JSON.stringify(ui.game.snapshot())===before && ui.mode==="idle",
        "factory hover is read-only and never opens the inventory dialog");
      ui.game.buildingAt(4,0).stored=[];ui.updateHoverInfo();
      ok(hover.innerHTML.includes("Empty") && !hover.innerHTML.includes("Bison"),
        "factory hover refreshes when its last reserve leaves");
    });
    ok(unitView.name({name:"Pelican C-61"})==="Pelican" && unitView.name({name:"Custom Heavy Tank"})==="Custom Heavy Tank",
      "short names remove stock designations while preserving multiword custom names");
    // Only Ctrl+left-drag pans; it never dispatches a gameplay click.
    ui = fixture("BISON", 3);
    ui.canvas = { width: 260, height: 150, style: {}, getContext: function () { return {}; } };
    ui.renderer = new RENDER.Renderer(ui.canvas, ui.game);
    ui.renderer.zoom = 3; ui.renderer.constrainView(); ui.mode = "idle";
    var clicks = 0, cancels = 0;
    ui.onHexClick = function () { clicks++; };
    ui.onCancel = function (undo) { if (undo) cancels++; };
    ui.updateHoverInfo = ui.showHexInfo = ui.showUnitInfo = function () {};
    function pointer(button, x, y, ctrl) { return { button: button, offsetX: x, offsetY: y, ctrlKey: !!ctrl, preventDefault: function () {} }; }
    var cameraX = ui.renderer.originX, cameraY = ui.renderer.originY;
    var state = JSON.stringify(ui.game.snapshot());
    ui.onMouseDown(pointer(0,130,75)); ui.onMouseMove(pointer(0,90,45)); ui.onMouseUp(pointer(0,90,45));
    ok(ui.renderer.originX === cameraX && ui.renderer.originY === cameraY && clicks === 1,
      "ordinary left drag never pans the map");
    ui.onMouseDown(pointer(0,130,75,true)); ui.onMouseMove(pointer(0,90,45,true)); ui.updateMapCursor();
    ok(ui.renderer.originX === cameraX-40 && ui.renderer.originY === cameraY-30 && ui.canvas.style.cursor === "grabbing",
      "Ctrl+left drag pans clipped terrain and displays the grabbing cursor");
    ui.onMouseUp(pointer(0,90,45,true));
    ok(clicks === 1 && JSON.stringify(ui.game.snapshot()) === state && ui.canvas.style.cursor === "grab",
      "releasing Ctrl+left drag performs no gameplay action");
    ui.onMouseDown(pointer(0,90,45,true)); ui.onMouseUp(pointer(0,90,45,true));
    ok(clicks === 1,"Ctrl+left click without dragging cannot select or move a unit");
    ui.renderer.panBy(100000,100000);
    ui.onMouseDown(pointer(0,100,70,true)); ui.onMouseMove(pointer(0,150,110,true)); ui.onMouseUp(pointer(0,150,110,true));
    ok(clicks === 1,"Ctrl drag at the camera limit never becomes a gameplay click");
    [1,2].forEach(function(button){
      cameraX=ui.renderer.originX;cameraY=ui.renderer.originY;
      ui.onMouseDown(pointer(button,100,70,true));ui.onMouseMove(pointer(button,150,110,true));ui.onMouseUp(pointer(button,150,110,true));
      ok(ui.renderer.originX===cameraX && ui.renderer.originY===cameraY && clicks===1,
        "middle/right buttons never pan or dispatch a left click");
    });
    ui.onContextMenu(pointer(2,100,70));
    ok(cancels===1,"context menu dispatches right-click cancellation exactly once");
    ui.canvas.width=1400;ui.canvas.height=900;ui.renderer.fitToMap();
    cameraX=ui.renderer.originX;cameraY=ui.renderer.originY;
    ui.onMouseDown(pointer(0,100,70,true));ui.onMouseMove(pointer(0,220,110,true));ui.onMouseUp(pointer(0,220,110));
    ok(ui.renderer.originX===cameraX+120 && ui.renderer.originY===cameraY+40 && clicks===1,
      "Ctrl dragging works on a fitted map even when Ctrl is released before the mouse");
    var oldStyle = RENDER.getStyle(), oldSet = RENDER.getIconSet();
    [["pixel", "remake"], ["pixel", "legacy"], ["classic", "remake"], ["neon", "remake"]].forEach(function (look) {
      RENDER.setStyle(look[0]); RENDER.setIconSet(look[1]);
      ui.renderer.fitToMap();
      ui.renderer.zoom = ui.renderer.minimumZoom(); ui.renderer.constrainView();
      cameraX = ui.renderer.originX; cameraY = ui.renderer.originY;
      ui.renderer.panBy(-80, 40);
      ok(ui.renderer.originX === cameraX - 80 && ui.renderer.originY === cameraY + 40,
        look.join("/") + " pans horizontally and vertically at minimum zoom");
      [-1, 1].forEach(function (direction) {
        ui.renderer.panBy(direction * 100000, direction * 100000);
        var dims = ui.renderer.mapDimensions(), z = ui.renderer.zoom;
        var left = ui.renderer.originX - (look[1] === "legacy" ? 24 : ui.renderer.hexSize) * z;
        var top = ui.renderer.originY - (look[1] === "legacy" ? 16 : ui.renderer.hexSize) * z;
        ok(left < ui.canvas.width && left + dims.width * z > 0 &&
          top < ui.canvas.height && top + dims.height * z > 0,
          look.join("/") + " keeps part of the map visible at the pan limit " + direction);
        cameraX = ui.renderer.originX; cameraY = ui.renderer.originY;
        ui.renderer.panBy(-direction * 20, -direction * 20);
        ok(ui.renderer.originX === cameraX - direction * 20 && ui.renderer.originY === cameraY - direction * 20,
          "map can be dragged back from each pan limit without snapping");
      });
    });
    RENDER.setIconSet(oldSet); RENDER.setStyle(oldStyle);
    ui = fixture("BISON", 3);
    ui.canvas = { width: 800, height: 600, style: {}, parentElement: { clientWidth: 800, clientHeight: 600 },
      getContext: function () { return {}; } };
    ui.renderer = new RENDER.Renderer(ui.canvas, ui.game);
    ui.showHexInfo = function () {};
    cameraX = ui.renderer.originX; cameraY = ui.renderer.originY;
    var destination = ui.renderer.hexCenter(2, 1);
    ui.updateMapCursor();
    ok(ui.canvas.style.cursor === "crosshair", "choosing a movement destination displays a crosshair");
    ui.onMouseDown(pointer(0,destination.x-30,destination.y,true));
    ui.onMouseMove(pointer(0,destination.x,destination.y,true));
    ui.onMouseUp(pointer(0,destination.x,destination.y));
    ok(ui.renderer.originX===cameraX+30 && ui.mode==="unitSelected" && ui.game.units[0].col===1,
      "explicit Ctrl pan preserves active movement selection without moving the unit");
    destination=ui.renderer.hexCenter(2,1);cameraX=ui.renderer.originX;
    ui.onMouseDown(pointer(0,destination.x-20,destination.y));
    ui.onMouseMove(pointer(0,destination.x,destination.y));
    ui.onMouseUp(pointer(0,destination.x,destination.y));
    ok(ui.game.units[0].col===2 && ui.mode==="moved" && ui.renderer.originX===cameraX,
      "normal destination click moves the unit without moving the camera");
    ui.onContextMenu(pointer(2,destination.x,destination.y));
    ok(ui.game.units[0].col===1 && ui.mode==="idle" && ui.canRedo(),
      "right-click after a committed move undoes it and enables redo");
  } finally {
    if (savedDocument === undefined) delete global.document; else global.document = savedDocument;
    if (savedView === undefined) delete global.COMBAT_VIEW; else global.COMBAT_VIEW = savedView;
    if (savedRender === undefined) delete global.RENDER; else global.RENDER = savedRender;
  }
};
