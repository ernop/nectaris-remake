/* Factory inspection through the click handler, using the real engine and icons. */
"use strict";

module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var RENDER = require("../js/render.js");
  var UI = require("../js/ui.js");
  var previousDocument = global.document, previousRender = global.RENDER;
  var previousStyle = RENDER.getStyle();
  var nodes = {};
  function element(tag) {
    var classes = new Set(["hidden"]), html = "";
    return {
      tagName: tag, children: [], style: {}, textContent: "",
      set innerHTML(value) { html = value; this.children = []; this.textContent = ""; },
      get innerHTML() { return html; },
      appendChild: function (child) { this.children.push(child); },
      setAttribute: function () {},
      getContext: function () { return new Proxy({}, {
        get: function (target, key) { return target[key] || function () {}; },
      }); },
      classList: {
        add: function (name) { classes.add(name); },
        remove: function (name) { classes.delete(name); },
        contains: function (name) { return classes.has(name); },
      },
    };
  }
  function textContent(node) {
    return node.textContent + node.children.map(textContent).join(" ");
  }
  function buttons(node) {
    return node.children.reduce(function (all, child) {
      return all.concat(buttons(child));
    }, node.tagName === "button" ? [node] : []);
  }
  function fixture(owner, type, kind) {
    var game = new ENGINE.Game({ name: "Factory inspection", grid: ["........", ".." + (kind || "F") + ".F...", "........"],
      buildings: [{ col: 2, row: 1, owner: owner, stored: ["BISON", { t: "LYNX", str: 5, exp: 3 }] }],
      units: [{ t: type || "CHARLIE", o: 0, x: 1, y: 1 }, { t: "POLAR", o: 1, x: 7, y: 2 }],
    }, { seed: 7 });
    var ui = Object.create(UI.GameUI.prototype);
    ui.game = game; ui.mode = "idle";
    ui.renderer = { pixelToHex: function (col, row) { return { col: col, row: row }; } };
    ui.draw = ui.refreshStatus = ui.checkGameOver = ui.toast = function () {};
    return ui;
  }
  function click(ui, col, row) { ui.onMouseUp({ offsetX: col, offsetY: row }); }
  global.RENDER = RENDER;
  global.document = {
    getElementById: function (id) { return nodes[id] || (nodes[id] = element("div")); },
    createElement: element,
  };
  try {
    ["pixel", "neon", "classic"].forEach(function (style) {
      RENDER.setStyle(style);
      [-1, 1, undefined].forEach(function (owner) {
        var ui = fixture(owner), before = JSON.stringify(ui.game.snapshot());
        var building = ui.game.buildingAt(2, 1);
        ui.game.deployTargets = ui.game.transportDeployTargets = function () {
          throw new Error("Inspecting an unowned factory must not calculate deployment actions");
        };
        click(ui, 2, 1);
        ok(ui.mode === "factory" && !nodes["factory-panel"].classList.contains("hidden"),
          style + ": unowned factory click opens inventory (owner " + owner + ")");
        var contents = textContent(nodes["factory-list"]);
        ok(contents.includes("Bison") && contents.includes("Lynx") && contents.includes("Strength 5") &&
          contents.includes("Experience 3") && !contents.includes("Strength 8"),
          "inspection shows every stored unit and its damage/experience");
        ok(nodes["factory-title"].textContent.includes(owner === 1 ? "Xenon" : "Neutral") &&
          nodes["factory-summary"].textContent.includes("2 stored units") &&
          nodes["factory-summary"].textContent.includes("Capture with infantry"),
          "inspection explains ownership, count and how to obtain the reserves");
        ok(buttons(nodes["factory-list"]).length === 0 && JSON.stringify(ui.game.snapshot()) === before,
          "inspection offers no deployment and does not change game state");
        ok(building.stored.every(function (unit) { return unit.player === building.owner; }),
          "omitting a factory owner also creates neutral stored units");
        ui.onCancel();
        ok(ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden"),
          "Escape closes the inventory and restores map input");
        click(ui, 4, 1);
        ok(ui.mode === "factory" && nodes["factory-summary"].textContent === "No stored units." &&
          nodes["factory-list"].children.length === 0, "empty factory opens an explicit empty inventory");
        nodes["factory-close"].onclick();
      });
    });

    var ui = fixture(-1, "BISON"), tank = ui.game.units[0];
    ui.selectUnit(tank);
    var before = JSON.stringify(ui.game.snapshot());
    click(ui, 2, 1);
    ok(ui.mode === "factory" && ui.selected === null && JSON.stringify(ui.game.snapshot()) === before,
      "clicking a factory the selected tank cannot enter opens inspection immediately");
    ui.onCancel();
    ui.showHexInfo(2, 1);
    ok(nodes["hex-info"].innerHTML.includes("Stored: Bison S-61, Lynx MB-4"), "hover reveals neutral inventory names");
    tank.col = 2; tank.row = 1;
    ui.showHexInfo(2, 1);
    ok(nodes["hex-info"].innerHTML.includes("Stored: Bison S-61, Lynx MB-4"), "hover reveals inventory even under a unit");
    click(ui, 2, 1);
    ok(ui.mode === "unitSelected" && ui.selected === tank, "an occupying unit still receives the normal selection click");

    ui = fixture(-1);
    var infantry = ui.game.units[0], building = ui.game.buildingAt(2, 1), reserve = building.stored[0];
    click(ui, 1, 1); click(ui, 2, 1);
    ok(building.owner === 0 && infantry.inFactory && ui.mode === "idle",
      "a valid infantry movement click still captures and enters the factory");
    click(ui, 2, 1);
    var deployButtons = buttons(nodes["factory-list"]);
    ok(deployButtons.length === 2 && textContent(nodes["factory-list"]).includes("AVAILABLE NEXT TURN"),
      "captured reserves offer deployment while capturing infantry waits until next turn");
    deployButtons[0].onclick();
    ok(ui.mode === "deployPick" && ui.renderer.highlights, "owned factory Deploy opens destination selection");
    var exit = ui.game.deployTargets(building, reserve)[0];
    click(ui, exit.col, exit.row);
    ok(ui.game.unitAt(exit.col, exit.row) === reserve && reserve.moved && !reserve.inFactory,
      "deploying a captured reserve places it at the chosen exit and spends its turn");

    ui = fixture(0);
    ui.options = { hotseat: true };
    click(ui, 2, 1);
    ui.endTurn();
    ok(ui.game.currentPlayer === 1 && ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden"),
      "ending the turn closes the old owner's deployment controls");
    click(ui, 2, 1);
    ok(ui.mode === "factory" && buttons(nodes["factory-list"]).length === 0,
      "a factory becomes inspectable enemy inventory after switching players");

    ["B", "F"].forEach(function (kind) {
      ui = fixture(0, "BISON", kind);
      var tank = ui.game.units[0], enemy = ui.game.units[1];
      enemy.col = 3; enemy.row = 1; // entering storage must not offer a shot here
      click(ui, 1, 1); click(ui, 2, 1);
      ok(tank.inFactory && !ui.game.unitAt(2, 1) && ui.mode === "idle" && !tank.attacked && !ui.pendingMoveFrom,
        kind + ": clicking a friendly building immediately stores a tank even beside an enemy");
      ui.renderer.hoverHex = { col: 2, row: 1 };
      UI.GameUI.prototype.refreshStatus.call(ui);
      ok(nodes["hex-info"].innerHTML.includes("3 stored"), kind + ": sidebar inventory refreshes immediately after storage");
      click(ui, 2, 1);
      ok(ui.mode === "factory" && textContent(nodes["factory-list"]).includes("AVAILABLE NEXT TURN"),
        kind + ": stored tank is visible in the building inventory");
      ui.onCancel();
      [-1, 1].forEach(function (owner) {
        ui = fixture(owner, "BISON", kind);
        tank = ui.game.units[0];
        click(ui, 1, 1); click(ui, 2, 1);
        ok(tank.col === 1 && tank.row === 1 && !tank.moved && ui.mode === "factory",
          kind + ": tank click on an unowned building only inspects its inventory");
        ui.onCancel();
      });
    });
  } finally {
    RENDER.setStyle(previousStyle);
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
    if (previousRender === undefined) delete global.RENDER;
    else global.RENDER = previousRender;
  }
};
