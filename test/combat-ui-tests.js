/* Default movement, direct attack, committed moves, undo barriers and map controls. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js"), UI = require("../js/ui.js");
  var savedDocument = global.document, savedView = global.COMBAT_VIEW, savedRender = global.RENDER;
  var nodes = {};
  function element() {
    var classes = new Set(["hidden"]), html = "";
    return { style: {}, children: [], textContent: "", offsetWidth: 108, offsetHeight: 26,
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
    ui.game = game; ui.canvas = { width: 800, height: 600, parentElement: { clientWidth: 800, clientHeight: 600 } }; ui.renderer = {
      hexSize: 34, zoom: 1,
      hexCenter: function (col, row) { var p = HEX.toPixel(col, row, 34); return {x: p.x + 200, y: p.y + 100}; },
      pixelToHex: function (col, row) { return { col: col, row: row }; },
    };
    ui.draw = ui.showUnitInfo = ui.refreshStatus = ui.checkGameOver = ui.updateHoverInfo = function () {};
    ui.animateBattleResult = function (event, detail, done) { ui.battleEvent = event; ui.animationDone = done; };
    ui.selectUnit(game.units[0]);
    return ui;
  }
  function action(label) { return nodes["action-menu"].children.find(function (button) { return button.textContent === label; }); }
  try {
    Object.keys(UNIT_TYPES).forEach(function (type) {
      if (["ATLAS", "TRIGGER"].indexOf(type) >= 0) return;
      var ready = fixture(type, ["HADRIAN","OCTOPUS","HAWKEYE"].includes(type) ? 4 : type === "LYNX" ? 3 : 2);
      ok(ready.mode === "unitSelected" && ready.renderer.highlights && !action("Shift") && !ready.pickTargets.length,
        type + " selection immediately opens movement without spending an action");
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
    ok(!nodes["btn-undo"].disabled && nodes["btn-undo"].textContent === "Undo last (1)",
      "the sidebar button exposes the pending move history");
    var saved = JSON.parse(JSON.stringify(ui.snapshotForSave()));
    ok(saved.units[0].col === 2 && saved.units[0].moved && saved.undoHistory.length === 1 &&
      !saved.undoHistory[0].state.map && !saved.undoHistory[0].state.types,
      "save keeps the committed move and compact undo history");
    ui.game = ENGINE.Game.restore(saved); ui.undoHistory = saved.undoHistory;
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === before && !ui.canUndo(), "Undo works after save/reload and restores flags, log and RNG");

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
    ok(nodes["combat-inspector"].innerHTML.includes("Polar PT-6") &&
      nodes["combat-inspector"].innerHTML.includes("100,000") &&
      nodes["combat-inspector"].innerHTML.includes("Joint casualty probabilities") &&
      JSON.stringify(ui.game.snapshot()) === committed && ui.game.rng.getState() === seed,
      "hover forecast uses 100k independent trials without changing the committed board or RNG");
    var secondTarget = ENGINE.makeUnit("CHARLIE",1,2,0,5,4);
    ui.game.units.push(secondTarget); ui.pickTargets = ui.previewTargets(unit);
    ui.onMouseMove({offsetX:2,offsetY:0});
    ok(nodes["combat-inspector"].innerHTML.includes("Charlie GX-77") &&
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

    // A battle is a hard boundary, even while its animation is still running.
    unit = ui.game.units[0]; ui.onHexClick(1,1); ui.onHexClick(2,1);
    var baseline = ENGINE.Game.restore(ui.game.snapshot()); baseline.attack(baseline.units[0],baseline.units[1]);
    ui.onHexClick(3,1);
    ok(ui.mode === "battle" && ui.busy && !ui.canUndo() && !ui.undoHistory.length &&
      JSON.stringify(ui.game.snapshot()) === JSON.stringify(baseline.snapshot()),
      "combat clears all earlier moves and preserves the actual seeded result");
    var battleState = JSON.stringify(ui.game.snapshot());
    ui.undoLast(); ui.onCancel(); ui.endTurn();
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
    });

    ui = fixture("BISON",7); ui.onHexClick(2,1); ui.options = {hotseat:true}; ui.endTurn();
    ok(!ui.canUndo() && !ui.undoHistory.length && ui.game.currentPlayer === 1,
      "ending the turn prevents undoing the other player's turn");

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
    ui.onHexClick(1,1); ui.onHexClick(1,0);
    ok(unit.moved && action("Unload " + unit.cargo[0].type.name), "moving a carrier ends immediately and keeps passenger unloading available");
    var movedCarrier = JSON.stringify(ui.game.snapshot());
    action("Unload " + unit.cargo[0].type.name).onclick(); ui.onHexClick(2,0);
    ok(!unit.cargo.length && ui.game.unitAt(2,0).moved && ui.undoHistory.length === 2,
      "unloading records a separate reversible action");
    ui.undoLast(); unit = ui.game.units[0];
    ok(JSON.stringify(ui.game.snapshot()) === movedCarrier && unit.cargo[0] === ui.game.units.find(function (u) { return u.id === unit.cargo[0].id; }),
      "undo unloading reattaches the exact passenger object to the moved carrier");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === before, "undo carrier movement restores both carrier and cargo state");

    ui = fixture("BISON",4); before = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(4,1);
    ok(ui.mode === "enemyInspect" && JSON.stringify(ui.game.snapshot()) === before, "clicking an enemy while moving inspects it without a move-and-attack shortcut");
    ui.game.units[1].shifted = true; ui.game.units[1].moved = true; ui.game.units[1].movePointsLeft = 0;
    ui.inspectEnemy(ui.game.units[1]);
    ok(Object.keys(ui.renderer.highlights).length > 1, "enemy inspection previews its next turn despite completed movement");
    ui.onCancel();
    ok(ui.mode === "idle" && !ui.selected, "Escape clears enemy inspection");

    // Commands keep a fixed location across units, zoom and aiming modes.
    ui = fixture("BISON", 3);
    ui.renderer.originX = 40; ui.renderer.originY = 50;
    [0.2, 0.5, 1, 2, 4].forEach(function (zoom) {
      ui.renderer.zoom = zoom;
      ui.renderer.hexCenter = function () { return {x: 790 * zoom, y: 590 * zoom}; };
      ui.positionActionMenu();
      ok(ui.canvas.height === 564 && !nodes["map-action-rail"].classList.contains("hidden") &&
        nodes["action-menu"].style.left === "8px" && nodes["action-menu"].style.top === "569px",
        "commands stay below all map hexes at the same position at zoom " + zoom);
    });
    ui.selected = ui.game.units[1]; ui.mode = "moved"; ui.pickTargets = [ui.game.units[0]];
    ui.positionActionMenu();
    ok(ui.canvas.height === 564 && ui.renderer.originX === 40 && ui.renderer.originY === 50 &&
      nodes["action-menu"].style.left === "8px" && nodes["action-menu"].style.top === "569px",
      "changing the selected unit and aiming mode keeps commands and the camera stable");
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
    ok(!hover.classList.contains("hidden") && hover.innerHTML.includes("Polar PT-6") &&
      hover.innerHTML.includes(RENDER.PLAYER_COLORS[1].light) && !hover.innerHTML.includes("<span>Strength</span>") &&
      !hover.innerHTML.includes("hover-faction") && !hover.innerHTML.includes("<table"),
      "hover inspects an enemy while retaining the selected unit and hides full strength");
    ui.game.units[1].strength = 5;
    ui.updateHoverInfo();
    ok(hover.innerHTML.includes("aria-label='5 machines remaining'>5</span>") && !hover.innerHTML.includes(">Strength<"),
      "hover refreshes the remaining-unit number on the icon without a Strength label");
    ui.game.units[1].strength = 8;
    ui.onMouseMove({offsetX: 1, offsetY: 1});
    ok(hover.innerHTML.includes("Bison S-61") && !hover.innerHTML.includes("Polar PT-6"),
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
    // Real camera bounds plus real input dispatch: dragging must never act on a unit.
    ui = fixture("BISON", 3);
    ui.canvas = { width: 260, height: 150, style: {}, getContext: function () { return {}; } };
    ui.renderer = new RENDER.Renderer(ui.canvas, ui.game);
    ui.renderer.zoom = 3; ui.renderer.constrainView();
    ui.mode = "idle";
    var clicks = 0, cancels = 0;
    ui.onHexClick = function () { clicks++; };
    ui.onCancel = function () { cancels++; };
    ui.updateHoverInfo = ui.showHexInfo = ui.showUnitInfo = function () {};
    function pointer(button, x, y) { return { button: button, offsetX: x, offsetY: y, preventDefault: function () {} }; }
    var cameraX = ui.renderer.originX, cameraY = ui.renderer.originY;
    var state = JSON.stringify(ui.game.snapshot());
    ui.onMouseDown(pointer(0, 130, 75));
    ui.onMouseMove(pointer(0, 90, 45));
    ui.updateMapCursor();
    ok(ui.renderer.originX === cameraX - 40 && ui.renderer.originY === cameraY - 30 &&
      ui.canvas.style.cursor === "grabbing", "left drag pans clipped terrain and displays the grabbing cursor");
    ui.onMouseUp(pointer(0, 90, 45)); ui.updateMapCursor();
    ok(!clicks && !cancels && JSON.stringify(ui.game.snapshot()) === state && ui.canvas.style.cursor === "grab",
      "releasing a left drag performs no gameplay action and restores the grab cursor");
    ui.onMouseDown(pointer(0, 100, 70)); ui.onMouseMove(pointer(0, 102, 70)); ui.onMouseUp(pointer(0, 102, 70));
    ok(clicks === 1, "a slight hand movement below the drag threshold still selects normally while zoomed");
    ui.renderer.panBy(100000, 100000);
    ui.onMouseDown(pointer(0, 100, 70)); ui.onMouseMove(pointer(0, 150, 110)); ui.onMouseUp(pointer(0, 150, 110));
    ok(clicks === 1 && !cancels, "dragging against the camera limit cannot become a unit command on release");
    ui.onMouseDown(pointer(2, 100, 70)); ui.onMouseUp(pointer(2, 100, 70));
    ok(cancels === 1, "a plain right click still cancels");
    ui.onMouseDown(pointer(2, 100, 70)); ui.onMouseMove(pointer(2, 150, 110)); ui.onMouseUp(pointer(2, 150, 110));
    ok(cancels === 1, "right dragging against the camera limit does not cancel the active command");
    ui.onMouseDown(pointer(1, 100, 70)); ui.onMouseUp(pointer(1, 100, 70));
    ok(clicks === 1 && cancels === 1, "middle click has no gameplay action");
    ui.canvas.width = 1400; ui.canvas.height = 900; ui.renderer.fitToMap();
    ui.updateMapCursor();
    cameraX = ui.renderer.originX; cameraY = ui.renderer.originY;
    ui.onMouseDown(pointer(0, 100, 70));
    ok(ui.dragging.pan && ui.canvas.style.cursor === "grab", "a fully visible map still offers grab panning");
    ui.onMouseMove(pointer(0, 220, 110)); ui.onMouseUp(pointer(0, 220, 110));
    ok(ui.renderer.originX === cameraX + 120 && ui.renderer.originY === cameraY + 40 &&
      clicks === 1 && cancels === 1 && JSON.stringify(ui.game.snapshot()) === state,
      "dragging a fitted map moves both axes without issuing a unit command");
    var unitCenter = ui.renderer.hexCenter(1, 1);
    ui.onMouseDown(pointer(0, unitCenter.x, unitCenter.y));
    ui.onMouseMove(pointer(0, unitCenter.x + 2, unitCenter.y));
    ui.onMouseUp(pointer(0, unitCenter.x + 2, unitCenter.y));
    ok(clicks === 2, "a small hand movement still counts as a click on a fitted map");
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
  } finally {
    if (savedDocument === undefined) delete global.document; else global.document = savedDocument;
    if (savedView === undefined) delete global.COMBAT_VIEW; else global.COMBAT_VIEW = savedView;
    if (savedRender === undefined) delete global.RENDER; else global.RENDER = savedRender;
  }
};
