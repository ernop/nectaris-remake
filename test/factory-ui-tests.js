/* Hover inspection and actionable factory deployment through the real UI. */
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
      attributes: {},
      setAttribute: function (name, value) { this.attributes[name] = value; },
      querySelector: function () { return element("canvas"); },
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
    return node.textContent + node.innerHTML.replace(/<[^>]*>/g, " ") + node.children.map(textContent).join(" ");
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
    ui.animateMovement = function (unit, path, done) { if (done) done(); return 0; };
    ui.game = game; ui.mode = "idle"; ui.canvas = {style:{}};
    ui.renderer = { pixelToHex: function (col, row) { return { col: col, row: row }; } };
    // Factory behavior uses no canvas; action layout is covered by combat-ui-tests.
    ui.positionFactoryPanel = ui.positionActionMenu = ui.draw = ui.refreshStatus = ui.checkGameOver = ui.toast = ui.updateHoverInfo = function () {};
    return ui;
  }
  function click(ui, col, row) { ui.onMouseUp({ button: 0, offsetX: col, offsetY: row }); }
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
        ok(ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden") && !ui.inspectedFactory,
          style + ": unowned factory click never opens an inspection-only popup (owner " + owner + ")");
        var hover = document.getElementById("unit-hover");
        ui.renderFactoryInfo(hover, building);
        var contents = textContent(hover);
        ok(contents.includes("Bison") && contents.includes("Lynx") && contents.includes("5/8") &&
          !contents.includes("Strength") && !contents.includes("8/8") && hover.innerHTML.includes("data-exp='3'"),
          "hover retains individual reserves, damage, icons and experience without a click popup");
        ok(contents.includes(owner === 1 ? "Xenon" : "Neutral") && contents.includes("2 stored units") &&
          JSON.stringify(ui.game.snapshot()) === before,
          "hover retains ownership and inventory totals without changing the match");
        ok(building.stored.every(function (unit) { return unit.player === building.owner; }),
          "omitting a factory owner also creates neutral stored units");
        click(ui, 4, 1);
        ok(ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden") &&
          !ui.inspectedFactory && JSON.stringify(ui.game.snapshot()) === before,
          "clicking an empty factory stays silent and leaves the board unchanged");
      });
    });

    ["spent", "blocked", "empty"].forEach(function (reason) {
      var ui = fixture(0), building = ui.game.buildingAt(2, 1);
      if (reason === "spent") building.stored.forEach(function (unit) { unit.moved = true; });
      if (reason === "empty") building.stored = [];
      if (reason === "blocked") HEX.neighbors(2, 1).forEach(function (hex) {
        if (!ui.game.unitAt(hex.col, hex.row)) ui.game.units.push(ENGINE.makeUnit("BISON", 0, hex.col, hex.row));
      });
      var before = JSON.stringify(ui.game.snapshot());
      click(ui, 2, 1);
      ok(ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden") &&
        JSON.stringify(ui.game.snapshot()) === before,
        reason + " owned factory stays hover-only when no reserve can deploy");
      var hover = document.getElementById("unit-hover");
      ui.renderFactoryInfo(hover, building);
      ok(hover.innerHTML.includes(reason === "empty" ? "Empty" : "2 stored units"),
        reason + " factory inventory remains available in the hover card");
    });

    var ui = fixture(-1, "BISON"), tank = ui.game.units[0];
    ui.selectUnit(tank);
    var before = JSON.stringify(ui.game.snapshot());
    click(ui, 2, 1);
    ok(ui.mode === "idle" && ui.selected === null && JSON.stringify(ui.game.snapshot()) === before &&
      nodes["factory-panel"].classList.contains("hidden"),
      "an unreachable unowned factory does not interrupt play with an inspection popup");
    ui.onCancel();
    ui.showHexInfo(2, 1);
    ok(nodes["hex-info"].innerHTML.includes("Bison") && nodes["hex-info"].innerHTML.includes("Lynx") && nodes["hex-info"].innerHTML.includes("data-unit-type"), "hover reveals neutral inventory names");
    tank.col = 2; tank.row = 1;
    ui.showHexInfo(2, 1);
    ok(nodes["hex-info"].innerHTML.includes("Bison") && nodes["hex-info"].innerHTML.includes("Lynx") && nodes["hex-info"].innerHTML.includes("data-unit-type"), "hover reveals inventory even under a unit");
    click(ui, 2, 1);
    ok(ui.mode === "unitSelected" && ui.selected === tank, "an occupying unit still receives the normal selection click");

    ui = fixture(-1);
    var infantry = ui.game.units[0], building = ui.game.buildingAt(2, 1), reserve = building.stored[0];
    var beforeCapture = JSON.stringify(ui.game.snapshot());
    click(ui, 1, 1); click(ui, 2, 1);
    ok(building.owner === 0 && infantry.inFactory && ui.mode === "idle",
      "a valid infantry movement click still captures and enters the factory");
    click(ui, 2, 1);
    var afterCapture = JSON.stringify(ui.game.snapshot());
    var deployButtons = buttons(nodes["factory-list"]);
    ok(deployButtons.length === 2 && textContent(nodes["factory-list"]).includes("Next turn"),
      "captured reserves offer deployment while capturing infantry waits until next turn");
    ok(deployButtons[0] === nodes["factory-list"].children[0] &&
      deployButtons[0].innerHTML.includes("unit-label-icon"),
      "the entire ready tile, including the shared hover icon and name, is a native deploy button");
    deployButtons[0].onclick();
    ok(ui.mode === "deployPick" && ui.renderer.highlights, "owned factory Deploy opens destination selection");
    var exit = ui.game.deployTargets(building, reserve)[0];
    click(ui, exit.col, exit.row);
    ok(ui.game.unitAt(exit.col, exit.row) === reserve && reserve.moved && !reserve.inFactory,
      "deploying a captured reserve places it at the chosen exit and spends its turn");
    ok(ui.mode === "factory" && !nodes["factory-panel"].classList.contains("hidden") &&
      !nodes["factory-list"].children.some(function (row) { return row.attributes["data-unit-id"] === reserve.id; }),
      "the remaining roster reopens immediately after deploying without offering the deployed unit again");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === afterCapture,
      "undo deployment returns the reserve to inventory with its experience, damage and ready state");
    ui.undoLast();
    ok(JSON.stringify(ui.game.snapshot()) === beforeCapture,
      "undo capture restores the owner, all reserves, infantry experience and pre-repair damage");
    ui.redoLast();
    ok(JSON.stringify(ui.game.snapshot()) === afterCapture,"redo capture restores the owner and the complete repaired reserve identities");
    ui.redoLast();
    ok(ui.game.unitAt(exit.col,exit.row).id===reserve.id && ui.game.unitAt(exit.col,exit.row).moved,
      "redo deployment restores the same reserve on the same exit with its spent activation");

    [false,true].forEach(function(withTransport){
      ui=fixture(0);building=ui.game.buildingAt(2,1);reserve=building.stored[0];
      if(withTransport){
        var passenger=ENGINE.makeUnit("CHARLIE",0,2,1);passenger.inFactory=true;
        building.stored[1]=passenger;
      }
      var exits=ui.game.deployTargets(building,reserve);
      exits.slice(1).forEach(function(space,index){ui.game.units.push(ENGINE.makeUnit(withTransport && index===0?"MULE":"BISON",0,space.col,space.row));});
      ui.openFactoryPanel(building);ui.beginDeployment(building,reserve);click(ui,exits[0].col,exits[0].row);
      ok(withTransport ? ui.mode==="factory" && buttons(nodes["factory-list"]).length===1 :
        ui.mode==="idle" && nodes["factory-panel"].classList.contains("hidden") && building.stored.length===1,
        withTransport ? "factory stays open when the only remaining deployment is into a compatible carrier" :
        "factory auto-closes after deployment fills its final legal exit despite reserves remaining");
      var after=JSON.stringify(ui.game.snapshot());
      ui.onCancel(true);
      if(withTransport)ok(ui.mode==="idle" && JSON.stringify(ui.game.snapshot())===after,"right-click closes the factory without undoing deployment");
      else ok(ui.canRedo() && ui.game.buildingAt(2,1).stored.length===2,"right-click on the idle board undoes the last deployment");
    });

    ui = fixture(0);
    ui.options = { hotseat: true };
    click(ui, 2, 1);
    ui.endTurn(); ui.endTurn(true);
    ok(ui.game.currentPlayer === 1 && ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden"),
      "ending the turn closes the old owner's deployment controls");
    click(ui, 2, 1);
    ok(ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden"),
      "the previous owner’s factory is hover-only after switching players");

    ui = fixture(0, "BISON", "B");
    ui.positionActionMenu = function () {};
    var baseTank = ui.game.units[0];
    click(ui,1,1); click(ui,2,1);
    ok(ui.mode === "idle" && baseTank.moved && !baseTank.inFactory && ui.game.unitAt(2,1) === baseTank,
      "base movement with no shot ends immediately without storage");
    ok(ui.game.unitAt(2,1) === baseTank && baseTank.moved, "base defender remains visible on its hex");

    ["F"].forEach(function (kind) {
      ui = fixture(0, "BISON", kind);
      var tank = ui.game.units[0], enemy = ui.game.units[1];
      tank.strength = 3; tank.exp = 5;
      enemy.col = 3; enemy.row = 1; // entering storage must not offer a shot here
      var beforeStorage = JSON.stringify(ui.game.snapshot());
      click(ui, 1, 1); click(ui, 2, 1);
      ok(tank.inFactory && !ui.game.unitAt(2, 1) && ui.mode === "idle" && !tank.attacked && !ui.pendingMoveFrom,
        kind + ": clicking a friendly building immediately stores a tank even beside an enemy");
      ui.renderer.hoverHex = { col: 2, row: 1 };
      UI.GameUI.prototype.refreshStatus.call(ui);
      ok(nodes["hex-info"].innerHTML.includes("3 stored"), kind + ": sidebar inventory refreshes immediately after storage");
      click(ui, 2, 1);
      ok(ui.mode === "factory" && textContent(nodes["factory-list"]).includes("Next turn"),
        kind + ": stored tank is visible in the building inventory");
      ui.onCancel();
      ui.undoLast();
      ok(JSON.stringify(ui.game.snapshot()) === beforeStorage,
        "undo storage restores the damaged field unit, not the repaired reserve");
      [-1, 1].forEach(function (owner) {
        ui = fixture(owner, "BISON", kind);
        tank = ui.game.units[0];
        click(ui, 1, 1); click(ui, 2, 1);
        ok(tank.col === 1 && tank.row === 1 && !tank.moved && ui.mode === "idle" && nodes["factory-panel"].classList.contains("hidden"),
          kind + ": tank click on an unowned building neither moves nor opens a popup");
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
