/* Nectaris remake — level editor.
 *
 * Paint terrain, place units and buildings for either side, stock factories
 * with stored units, define custom unit types (JSON), then export the level
 * as JSON, save it to the in-browser custom list, or play-test it directly.
 * Exported files are self-contained: custom unit types travel inside the
 * level file under `customUnits`.
 */
"use strict";

(function () {
  function $(id) { return document.getElementById(id); }

  var CUSTOM_LEVELS_KEY = "nectaris-custom-levels";
  var CUSTOM_UNITS_KEY = "nectaris-custom-units";

  var state = {
    name: "MY LEVEL",
    turnLimit: 50,
    width: 14,
    height: 10,
    grid: [],            // 2d array of terrain chars
    buildings: {},       // key -> {col,row,owner,stored:[typeIds]}
    units: {},           // key -> {t,o,x,y}
    tool: { kind: "terrain", value: "." },   // terrain char | unit type | erase
    owner: 0,
    customUnits: {},
  };

  function initGrid(w, h, keepOld) {
    var old = state.grid;
    state.grid = [];
    for (var r = 0; r < h; r++) {
      var row = [];
      for (var c = 0; c < w; c++) {
        row.push(keepOld && old[r] && old[r][c] ? old[r][c] : ".");
      }
      state.grid.push(row);
    }
    state.width = w; state.height = h;
    // drop out-of-bounds objects
    for (var k in state.units) {
      var u = state.units[k];
      if (u.x >= w || u.y >= h) delete state.units[k];
    }
    for (k in state.buildings) {
      var b = state.buildings[k];
      if (b.col >= w || b.row >= h) delete state.buildings[k];
    }
  }

  /* ---------- conversion to/from the level schema ---------- */

  function toLevel() {
    var lv = {
      name: state.name,
      turnLimit: state.turnLimit,
      grid: state.grid.map(function (row) { return row.join(""); }),
      buildings: [],
      units: [],
    };
    for (var k in state.buildings) {
      var b = state.buildings[k];
      lv.buildings.push({ col: b.col, row: b.row, owner: b.owner, stored: b.stored.slice() });
    }
    for (k in state.units) {
      var u = state.units[k];
      lv.units.push({ t: u.t, o: u.o, x: u.x, y: u.y });
    }
    if (Object.keys(state.customUnits).length) lv.customUnits = state.customUnits;
    return lv;
  }

  function fromLevel(lv) {
    state.name = lv.name || "IMPORTED";
    state.turnLimit = lv.turnLimit || 50;
    if (lv.customUnits) {
      state.customUnits = lv.customUnits;
      mergeUnitTypes(lv.customUnits);
      $("custom-units-json").value = JSON.stringify(lv.customUnits, null, 1);
    }
    state.grid = lv.grid.map(function (row) { return row.split(""); });
    state.height = state.grid.length;
    state.width = state.grid[0].length;
    state.buildings = {};
    (lv.buildings || []).forEach(function (b) {
      state.buildings[HEX.key(b.col, b.row)] = {
        col: b.col, row: b.row, owner: b.owner === undefined ? -1 : b.owner,
        stored: (b.stored || []).map(function (s) { return typeof s === "string" ? s : s.t; }),
      };
    });
    state.units = {};
    (lv.units || []).forEach(function (u) {
      state.units[HEX.key(u.x, u.y)] = u;
    });
    $("inp-name").value = state.name;
    $("inp-width").value = state.width;
    $("inp-height").value = state.height;
    $("inp-turns").value = state.turnLimit;
    draw();
  }

  function validate() {
    var lv = toLevel();
    new ENGINE.Game(lv, { seed: 1 }); // throws with a precise message on bad data
    // gameplay sanity: each side needs a unit or a deployable stored unit
    var counts = [0, 0];
    lv.units.forEach(function (u) { counts[u.o]++; });
    lv.buildings.forEach(function (b) { if (b.owner >= 0) counts[b.owner] += b.stored.length; });
    if (!counts[0] || !counts[1]) throw new Error("Both sides need at least one unit (fielded or stored).");
    return lv;
  }

  /* ---------- rendering (reuses the game renderer) ---------- */

  var canvas = $("editor-canvas");
  var renderer = null;

  function fakeGame() {
    // Adapter that lets RENDER.Renderer draw editor state.
    var lv = toLevel();
    var g;
    try {
      g = new ENGINE.Game(lv, { seed: 1 });
    } catch (e) {
      // While mid-edit the level may be transiently invalid (e.g. a building
      // entry pointing at repainted terrain); render terrain-only then.
      g = null;
    }
    if (g) return g;
    return {
      width: state.width, height: state.height,
      units: [],
      terrainAt: function (c, r) {
        if (r < 0 || r >= state.height || c < 0 || c >= state.width) return null;
        return TERRAIN_BY_CHAR[state.grid[r][c]];
      },
      unitAt: function () { return null; },
      buildingAt: function (c, r) { return state.buildings[HEX.key(c, r)] || null; },
      inBounds: function (c, r) { return c >= 0 && c < state.width && r >= 0 && r < state.height; },
      currentPlayer: -1,
    };
  }

  function draw() {
    var g = fakeGame();
    renderer = renderer || new RENDER.Renderer(canvas, g);
    renderer.game = g;
    renderer.draw();
  }

  /* ---------- tool palette ---------- */

  function buildPalette() {
    var tg = $("terrain-tools");
    tg.innerHTML = "";
    for (var k in TERRAIN) {
      (function (t) {
        var b = document.createElement("button");
        b.textContent = t.name;
        b.onclick = function () { setTool({ kind: "terrain", value: t.ch }, b); };
        tg.appendChild(b);
      })(TERRAIN[k]);
    }
    var ug = $("unit-tools");
    ug.innerHTML = "";
    for (k in UNIT_TYPES) {
      (function (t) {
        var b = document.createElement("button");
        b.textContent = t.id;
        b.title = t.name;
        b.onclick = function () { setTool({ kind: "unit", value: t.id }, b); };
        ug.appendChild(b);
      })(UNIT_TYPES[k]);
    }
    var eb = document.createElement("button");
    eb.textContent = "ERASE";
    eb.onclick = function () { setTool({ kind: "erase" }, eb); };
    ug.appendChild(eb);
  }

  function setTool(tool, btn) {
    state.tool = tool;
    document.querySelectorAll(".tool-grid button").forEach(function (b) { b.classList.remove("active"); });
    if (btn) btn.classList.add("active");
  }

  /* ---------- painting ---------- */

  function applyTool(col, row) {
    var k = HEX.key(col, row);
    var t = state.tool;
    if (t.kind === "terrain") {
      state.grid[row][col] = t.value;
      var terr = TERRAIN_BY_CHAR[t.value];
      if (terr.building) {
        if (!state.buildings[k]) state.buildings[k] = { col: col, row: row, owner: state.owner, stored: [] };
        else state.buildings[k].owner = state.owner;
      } else {
        delete state.buildings[k];
      }
      // repainting under a unit: drop the unit if terrain became impassable
      var u = state.units[k];
      if (u && terrainCost(terr, UNIT_TYPES[u.t].moveType) === null) delete state.units[k];
    } else if (t.kind === "unit") {
      var terr2 = TERRAIN_BY_CHAR[state.grid[row][col]];
      if (terrainCost(terr2, UNIT_TYPES[t.value].moveType) === null) {
        msg(UNIT_TYPES[t.value].name + " cannot stand on " + terr2.name);
        return;
      }
      state.units[k] = { t: t.value, o: state.owner, x: col, y: row };
    } else if (t.kind === "erase") {
      delete state.units[k];
      if (state.buildings[k]) {
        delete state.buildings[k];
        state.grid[row][col] = ".";
      }
    }
    draw();
  }

  /* Click a building with no tool active (or with shift) to edit stored units. */
  function editStored(col, row) {
    var b = state.buildings[HEX.key(col, row)];
    if (!b) return false;
    var cur = b.stored.join(",");
    var input = prompt(
      "Stored units for this " + (state.grid[row][col] === "B" ? "base" : "factory") +
      " (comma-separated type IDs, e.g. BISON,KILROY,ATLAS).\nOwner: " +
      (b.owner < 0 ? "neutral" : "player " + (b.owner + 1)), cur);
    if (input === null) return true;
    var ids = input.split(",").map(function (s) { return s.trim().toUpperCase(); }).filter(Boolean);
    for (var i = 0; i < ids.length; i++) {
      if (!UNIT_TYPES[ids[i]]) { msg("Unknown unit type: " + ids[i]); return true; }
    }
    b.stored = ids;
    draw();
    return true;
  }

  function msg(text) {
    $("editor-msg").textContent = text;
    clearTimeout(msg._t);
    msg._t = setTimeout(function () { $("editor-msg").textContent = ""; }, 3500);
  }

  /* ---------- wiring ---------- */

  var painting = false;

  window.addEventListener("DOMContentLoaded", function () {
    try {
      var cu = JSON.parse(localStorage.getItem(CUSTOM_UNITS_KEY));
      if (cu) { state.customUnits = cu; mergeUnitTypes(cu); $("custom-units-json").value = JSON.stringify(cu, null, 1); }
    } catch (e) { /* none stored */ }

    initGrid(state.width, state.height, false);
    buildPalette();

    function resize() {
      var wrap = canvas.parentElement;
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
      if (renderer) renderer.fitToMap();
      draw();
    }
    window.addEventListener("resize", resize);
    resize();
    renderer.fitToMap();
    draw();

    canvas.addEventListener("mousedown", function (e) {
      if (e.button === 2 || e.button === 1) { canvas._drag = { x: e.offsetX, y: e.offsetY }; return; }
      var hex = renderer.pixelToHex(e.offsetX, e.offsetY);
      if (!hex) return;
      if (e.shiftKey && editStored(hex.col, hex.row)) return;
      painting = true;
      applyTool(hex.col, hex.row);
    });
    canvas.addEventListener("mousemove", function (e) {
      if (canvas._drag) {
        renderer.originX += e.offsetX - canvas._drag.x;
        renderer.originY += e.offsetY - canvas._drag.y;
        canvas._drag = { x: e.offsetX, y: e.offsetY };
        draw(); return;
      }
      if (!painting) return;
      var hex = renderer.pixelToHex(e.offsetX, e.offsetY);
      if (hex && state.tool.kind === "terrain") applyTool(hex.col, hex.row);
    });
    window.addEventListener("mouseup", function () { painting = false; canvas._drag = null; });
    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      var nz = Math.min(4, Math.max(0.2, renderer.zoom * factor));
      renderer.originX = e.offsetX - (e.offsetX - renderer.originX) * (nz / renderer.zoom);
      renderer.originY = e.offsetY - (e.offsetY - renderer.originY) * (nz / renderer.zoom);
      renderer.zoom = nz;
      draw();
    }, { passive: false });

    $("inp-name").value = state.name;
    $("inp-name").oninput = function () { state.name = this.value.toUpperCase(); };
    $("inp-turns").value = state.turnLimit;
    $("inp-turns").oninput = function () { state.turnLimit = +this.value || 50; };
    $("inp-width").value = state.width;
    $("inp-height").value = state.height;
    $("btn-resize").onclick = function () {
      var w = Math.max(4, Math.min(60, +$("inp-width").value));
      var h = Math.max(4, Math.min(60, +$("inp-height").value));
      initGrid(w, h, true);
      renderer.fitToMap();
      draw();
    };

    document.querySelectorAll("input[name=owner]").forEach(function (radio) {
      radio.onchange = function () { state.owner = +this.value; };
    });

    $("btn-export").onclick = function () {
      try {
        var lv = validate();
        var blob = new Blob([JSON.stringify(lv, null, 1)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = state.name.toLowerCase().replace(/\s+/g, "-") + ".json";
        a.click();
      } catch (err) { msg(err.message); }
    };

    $("btn-save").onclick = function () {
      try {
        var lv = validate();
        var customs = JSON.parse(localStorage.getItem(CUSTOM_LEVELS_KEY) || "[]");
        var replaced = false;
        for (var i = 0; i < customs.length; i++) if (customs[i].name === lv.name) { customs[i] = lv; replaced = true; }
        if (!replaced) customs.push(lv);
        localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(customs));
        msg("Saved to custom levels" + (replaced ? " (replaced)" : "") + ".");
      } catch (err) { msg(err.message); }
    };

    $("btn-playtest").onclick = function () {
      try {
        var lv = validate();
        localStorage.setItem("nectaris-playtest", JSON.stringify(lv));
        window.open("index.html?playtest=1", "_blank");
      } catch (err) { msg(err.message); }
    };

    $("file-load").onchange = function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { fromLevel(JSON.parse(reader.result)); renderer.fitToMap(); draw(); msg("Loaded."); }
        catch (err) { msg("Bad level file: " + err.message); }
      };
      reader.readAsText(f);
      e.target.value = "";
    };

    $("btn-load-campaign").onclick = function () {
      var i = +$("sel-campaign").value;
      fromLevel(JSON.parse(JSON.stringify(CAMPAIGN[i])));
      renderer.fitToMap(); draw();
      msg("Loaded " + CAMPAIGN[i].name + " — edits won't touch the built-in campaign.");
    };
    var sel = $("sel-campaign");
    CAMPAIGN.forEach(function (m, i) {
      var o = document.createElement("option");
      o.value = i; o.textContent = (i + 1) + ". " + m.name;
      sel.appendChild(o);
    });

    $("btn-apply-units").onclick = function () {
      try {
        var cu = JSON.parse($("custom-units-json").value || "{}");
        // sanity: construct requires numeric core fields
        for (var k in cu) {
          var d = cu[k];
          ["move", "rmax", "rngG", "rngA", "atkG", "atkA", "def"].forEach(function (f) {
            if (d[f] !== undefined && typeof d[f] !== "number") throw new Error(k + "." + f + " must be a number");
          });
          if (!d.moveType) d.moveType = "treads";
        }
        state.customUnits = cu;
        mergeUnitTypes(cu);
        localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(cu));
        buildPalette();
        msg("Custom units applied (" + Object.keys(cu).length + ").");
      } catch (err) { msg("Custom units JSON: " + err.message); }
    };
  });
})();
