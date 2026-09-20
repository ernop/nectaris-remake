/* Movement-first combat, reversible choices, hover forecasts and map controls. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), COMBAT = require("../js/combat.js"), UI = require("../js/ui.js");
  var savedDocument = global.document, savedView = global.COMBAT_VIEW;
  var nodes = {};
  function element() {
    var classes = new Set(["hidden"]), html = "";
    return { style: {}, children: [], textContent: "", offsetWidth: 108, offsetHeight: 26,
      set innerHTML(value) { html = value; this.children = []; }, get innerHTML() { return html; },
      appendChild: function (child) { this.children.push(child); }, setAttribute: function () {},
      classList: { add: function (c) { classes.add(c); }, remove: function (c) { classes.delete(c); },
        contains: function (c) { return classes.has(c); } },
    };
  }
  global.document = { getElementById: function (id) { return nodes[id] || (nodes[id] = element()); }, createElement: element };
  global.COMBAT_VIEW = require("../js/combat-view.js");
  function fixture(type, enemyX) {
    var game = new ENGINE.Game({name: "Combat UI", grid: ["........", "........", "........"],
      units: [{t: type, o: 0, x: 1, y: 1}, {t: "POLAR", o: 1, x: enemyX, y: 1}]}, {seed: 7});
    var ui = Object.create(UI.GameUI.prototype);
    ui.game = game; ui.canvas = { width: 800, height: 600 }; ui.renderer = {
      hexSize: 34, zoom: 1,
      hexCenter: function (col, row) { var p = HEX.toPixel(col, row, 34); return {x: p.x + 200, y: p.y + 100}; },
      pixelToHex: function (col, row) { return { col: col, row: row }; },
    };
    ui.draw = ui.showUnitInfo = ui.refreshStatus = ui.checkGameOver = function () {};
    ui.animateBattleResult = function (event, detail, done) { ui.battleEvent = event; ui.animationDone = done; };
    ui.selectUnit(game.units[0]);
    return ui;
  }
  function action(label) { return nodes["action-menu"].children.find(function (button) { return button.textContent === label; }); }
  try {
    var ui = fixture("BISON", 4), unit = ui.selected;
    var before = JSON.stringify(ui.game.snapshot());
    ok(!ui.renderer.highlights[HEX.key(4, 1)] && ui.pickTargets.length === 0,
      "selecting a tank never highlights a distant move-and-attack shortcut");
    ui.onHexClick(4, 1);
    ok(JSON.stringify(ui.game.snapshot()) === before && !ui.busy,
      "clicking a distant enemy cannot move or attack automatically");
    ok(ui.mode === "enemyInspect" && ui.selected === ui.game.units[1] &&
      Object.keys(ui.renderer.highlights).length > 1,
      "clicking an enemy displays its movement range in inspection mode");
    var enemy = ui.selected;
    enemy.moved = true; enemy.movePointsLeft = 0;
    before = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(enemy.col, enemy.row);
    ok(Object.keys(ui.renderer.highlights).length > 1 &&
      JSON.stringify(ui.game.snapshot()) === before,
      "spent enemies show next-turn movement without altering the saved game");
    ui.onHexClick(5, 1);
    ok(ui.mode === "idle" && !ui.renderer.highlights &&
      JSON.stringify(ui.game.snapshot()) === before,
      "clicking an inspected enemy destination clears inspection without moving it");
    ui.onHexClick(enemy.col, enemy.row);
    ui.onCancel();
    ok(ui.mode === "idle" && !ui.selected && !ui.renderer.highlights,
      "Escape clears enemy movement inspection");
    ui.onHexClick(enemy.col, enemy.row);
    ui.onHexClick(1, 1);
    ok(ui.mode === "unitSelected" && ui.selected.player === 0,
      "a friendly unit can be selected directly after enemy inspection");
    ui = fixture("BISON", 2); unit = ui.selected;
    ok(!ui.renderer.highlights[HEX.key(2, 1)], "even adjacent targets stay unhighlighted until a position is chosen");
    ui.onHexClick(1, 1);
    ok(ui.mode === "moved" && ui.pickTargets[0] === ui.game.units[1], "choosing the current hex allows stationary attacks");

    ui = fixture("BISON", 3); unit = ui.selected;
    before = JSON.stringify(ui.game.snapshot());
    ui.onHexClick(2, 1);
    ok(ui.mode === "moved" && !unit.moved && ui.renderer.highlights[HEX.key(3, 1)],
      "choosing a firing position exposes only its real attack targets");
    ok(nodes["action-menu"].children.map(function (button) { return button.textContent; }).join(",") === "Cancel,End",
      "map controls contain exactly Cancel and End");
    var provisional = JSON.stringify(ui.game.snapshot()), seed = ui.game.rng.getState();
    ui.onMouseMove({ offsetX: 3, offsetY: 1 });
    ok(!nodes["combat-inspector"].classList.contains("hidden") &&
      nodes["combat-inspector"].innerHTML.includes("Polar PT-6") && nodes["combat-inspector"].innerHTML.includes("100,000") &&
      nodes["combat-inspector"].innerHTML.includes("Joint casualty probabilities"),
      "hovering a red target shows identity, calculation and the 100k-seed heatmap");
    ok(JSON.stringify(ui.game.snapshot()) === provisional && ui.game.rng.getState() === seed,
      "hover projection cannot change the match, its units, or its hidden RNG");
    ok(nodes["combat-inspector"].innerHTML.includes("Target unit information") &&
      nodes["combat-inspector"].innerHTML.includes("Ground / air range") &&
      nodes["combat-inspector"].innerHTML.includes("ZOC &amp; support"),
      "hover includes the target's full statistics and explicit ZOC/support explanation");
    var secondTarget = ENGINE.makeUnit("CHARLIE", 1, 2, 0, 5, 4);
    ui.game.units.push(secondTarget);
    ui.pickTargets = ui.previewTargets(unit);
    var bothBefore = JSON.stringify(ui.game.snapshot());
    ui.onMouseMove({offsetX: 2, offsetY: 0});
    var secondHtml = nodes["combat-inspector"].innerHTML;
    ok(secondHtml.includes("Charlie GX-77") && secondHtml.includes("100,000") &&
      secondHtml.includes("5</dd>") && secondHtml.includes("+30% damage"),
      "hovering the second red enemy refreshes its identity, damage, experience and forecast");
    ui.onMouseMove({offsetX: 3, offsetY: 1});
    ok(nodes["combat-inspector"].innerHTML !== secondHtml &&
      nodes["combat-inspector"].innerHTML.includes("<h3>Polar PT-6</h3>") &&
      JSON.stringify(ui.game.snapshot()) === bothBefore,
      "switching back updates the matchup without mutating any match state");
    ui.game.units.pop(); ui.pickTargets = ui.previewTargets(unit);
    ui.onMouseMove({offsetX: 3, offsetY: 1});
    var cached = Object.values(ui._forecastCache)[0];
    ui.onMouseMove({ offsetX: 3, offsetY: 1 });
    ok(Object.values(ui._forecastCache)[0] === cached, "repeated hover reuses the current forecast");
    ui.onMouseMove({ offsetX: 5, offsetY: 2 });
    ok(!nodes["combat-inspector"].classList.contains("hidden"), "last matchup remains readable when moving off its hex");
    ok(JSON.stringify(ui.snapshotForSave()) === before, "saving a test move preserves the original position and log");
    action("Cancel").onclick();
    ok(ui.mode === "unitSelected" && JSON.stringify(ui.game.snapshot()) === before &&
      nodes["combat-inspector"].classList.contains("hidden") && !ui.renderer.attackingUnitId,
      "Cancel restores position, allowance, flags and log and clears the preview");
    ui.onHexClick(2, 1);
    var baseline = ENGINE.Game.restore(ui.game.snapshot());
    baseline.attack(baseline.units[0], baseline.units[1]);
    ui.onMouseMove({offsetX: 3, offsetY: 1});
    ui.onHexClick(3, 1);
    ok(unit.attacked && ui.busy && ui.mode === "battle", "clicking the chosen red target commits combat and locks input");
    ok(JSON.stringify(ui.game.snapshot()) === JSON.stringify(baseline.snapshot()),
      "the actual battle is identical with or without prior previews and cancelled test moves");
    var player = ui.game.currentPlayer;
    ui.onCancel(); ui.endTurn();
    ok(ui.mode === "battle" && ui.game.currentPlayer === player, "Cancel and End Turn cannot interrupt committed combat");
    ui.animationDone();
    ok(ui.mode === "idle" && !ui.busy && nodes["battle-panel"].classList.contains("hidden"), "battle results close automatically");

    ui = fixture("BISON", 7); unit = ui.selected;
    ui.onHexClick(2, 1);
    ok(ui.mode === "moved" && !ui.pickTargets.length && !unit.moved, "moves without a target still offer a reversible choice");
    action("End").onclick();
    ok(unit.col === 2 && unit.moved && !unit.attacked && ui.game.currentPlayer === 0 && ui.mode === "idle",
      "End commits this unit's move without attacking or ending the side's turn");

    ui = fixture("HADRIAN", 6); unit = ui.selected;
    ui.onHexClick(2, 1);
    ok(ui.mode === "moved" && !ui.pickTargets.length && unit.attackSpent && !unit.moved,
      "move-or-fire artillery can undo a move but cannot fire after moving");
    action("Cancel").onclick(); ui.onHexClick(1, 1);
    ok(ui.pickTargets.length === 1 && !unit.attackSpent, "cancelling restores artillery's option to fire in place");
    nodes["attack-targets"].children[0].onfocus();
    ok(nodes["combat-inspector"].innerHTML.includes("Indirect fire"), "keyboard target preview supports stationary artillery");

    ui = fixture("RABBIT", 2); unit = ui.selected;
    ui.onHexClick(1, 1); ui.onHexClick(2, 1); ui.animationDone();
    ok(ui.mode === "unitSelected" && ui.selected === unit && unit.attacked && unit.movePointsLeft > 0,
      "surviving missile buggy retains movement after attacking");
    before = JSON.stringify(ui.game.snapshot());
    var destination = Object.values(ui.range).find(function (rec) { return rec.cost > 0 && rec.canStop && !rec.load && !rec.enterBuilding; });
    ui.onHexClick(destination.col, destination.row);
    ok(!ui.pickTargets.length, "post-attack movement cannot offer a second attack");
    action("Cancel").onclick();
    ok(JSON.stringify(ui.game.snapshot()) === before && unit.attacked,
      "cancelling post-attack movement cannot undo the already committed battle");

    ["RABBIT", "LYNX"].forEach(function (type) {
      ui = fixture(type, 4); unit = ui.selected;
      var firingCol = 4 - unit.type.rngG, allowance = unit.movePointsLeft;
      var approachCost = ui.range[HEX.key(firingCol, 1)].cost;
      ui.onHexClick(firingCol, 1);
      ok(ui.pickTargets.length === 1, type + " can choose a firing position before attacking");
      ui.onHexClick(4, 1); ui.animationDone();
      ok(ui.mode === "unitSelected" && !unit.moved && unit.attacked &&
        unit.movePointsLeft === allowance - approachCost,
        type + " offers remaining movement after moving and attacking a surviving target");
      ok(nodes["action-status"].textContent.includes("Attack complete") &&
        nodes["action-status"].textContent.includes(unit.movePointsLeft + " movement points left"),
        type + " explains the remaining post-attack allowance");
      before = JSON.stringify(ui.game.snapshot());
      ui.onHexClick(firingCol - 1, 1);
      ok(ui.mode === "moved" && !ui.pickTargets.length &&
        nodes["action-status"].textContent.includes("Cancel reverts only this move"),
        type + " offers a retreat with no second attack");
      ok(JSON.stringify(ui.snapshotForSave()) === before,
        type + " saving a provisional retreat preserves the committed attack");
      action("Cancel").onclick();
      ok(JSON.stringify(ui.game.snapshot()) === before, type + " may cancel and choose another retreat");
      ui.onHexClick(firingCol - 1, 1); action("End").onclick();
      ok(unit.col === firingCol - 1 && unit.moved && unit.attacked && ui.mode === "idle",
        type + " End commits the retreat and spends its activation");
    });

    function transportUI() {
      var transportUI = fixture("MULE", 7);
      var passenger = ENGINE.makeUnit("CHARLIE",0,0,1);
      transportUI.game.units.push(passenger);
      transportUI.deselect();
      transportUI.onHexClick(0,1); transportUI.onHexClick(1,1);
      ok(passenger.carriedBy === transportUI.game.units[0].id && transportUI.mode === "idle",
        "clicking a highlighted friendly transport boards it instead of switching selection");
      transportUI.game.endTurn(); transportUI.game.endTurn();
      return transportUI;
    }
    ui = transportUI(); unit = ui.game.units[0];
    ui.onHexClick(1,1); ui.onHexClick(1,1);
    nodes["transport-actions"].children[0].onclick(); ui.onHexClick(2,1);
    ok(!unit.moved && !unit.cargo.length && ui.mode === "idle" && ui.game.unitAt(2,1).moved,
      "unloading in place spends the passenger's turn while leaving the transport ready");
    ui = transportUI(); unit = ui.game.units[0];
    ui.onHexClick(1,1); ui.onHexClick(1,0); action("End").onclick();
    ui.onHexClick(1,0);
    ok(unit.moved && ui.mode === "moved" && action("Close") && !action("End") && !ui.pickTargets.length,
      "used transport can reopen only its passenger actions without a second move or attack");
    nodes["transport-actions"].children[0].onclick(); ui.onHexClick(2,0);
    ok(!unit.cargo.length && unit.moved && ui.game.unitAt(2,0).moved,
      "ready passenger can unload after the carrier's movement was committed");
    ui = transportUI(); unit = ui.game.units[0];
    ui.onHexClick(1,1); ui.onHexClick(1,0);
    nodes["transport-actions"].children[0].onclick(); ui.onHexClick(2,0);
    ui.onCancel();
    ok(unit.moved && unit.col === 1 && unit.row === 0 && !unit.cargo.length && !ui.pendingMoveFrom,
      "unloading after a provisional move commits that move and cannot detach cargo by cancellation");

    // Conservative target bounds include the whole hex, not just the icon.
    [0.2, 0.5, 1, 2, 4].forEach(function (zoom) {
      var size = 34 * zoom, center = { x: 400, y: 280 };
      var targets = HEX.neighbors(4, 4).map(function (n) {
        var p = HEX.toPixel(n.col, n.row, size), origin = HEX.toPixel(4, 4, size);
        return { x: p.x - origin.x + center.x, y: p.y - origin.y + center.y };
      });
      var pos = UI.actionPosition(center, size, targets, 108, 26, 800, 560);
      ok(pos.y >= 560 || targets.every(function (target) {
        return pos.x + 108 < target.x - size || pos.x > target.x + size ||
          pos.y + 26 < target.y - size * Math.sqrt(3) / 2 || pos.y > target.y + size * Math.sqrt(3) / 2;
      }), "all six attack hexes remain clear at zoom " + zoom);
    });
    var edge = UI.actionPosition({ x: 790, y: 550 }, 34, [], 108, 26, 800, 560);
    ok(edge.y === 565 && edge.x + 108 <= 800, "edge placement uses the reserved rail inside viewport bounds");
  } finally {
    if (savedDocument === undefined) delete global.document; else global.document = savedDocument;
    if (savedView === undefined) delete global.COMBAT_VIEW; else global.COMBAT_VIEW = savedView;
  }
};
