/* Nectaris remake — boot, mission menu, custom-level loading, progress. */
"use strict";

(function () {
  function $(id) { return document.getElementById(id); }

  var PROGRESS_KEY = "nectaris-progress";
  var CUSTOM_LEVELS_KEY = "nectaris-custom-levels";
  var CUSTOM_UNITS_KEY = "nectaris-custom-units";

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || { cleared: 0 }; }
    catch (e) { return { cleared: 0 }; }
  }
  function setProgress(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }

  function getCustomLevels() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_LEVELS_KEY)) || []; }
    catch (e) { return []; }
  }

  function loadCustomUnits() {
    try {
      var cu = JSON.parse(localStorage.getItem(CUSTOM_UNITS_KEY));
      if (cu) mergeUnitTypes(cu);
    } catch (e) { /* no custom units stored */ }
  }

  var currentUI = null;

  function startGame(mapDef, opts) {
    opts = opts || {};
    $("menu-screen").classList.add("hidden");
    $("game-screen").classList.remove("hidden");
    $("gameover-panel").classList.add("hidden");
    $("map-title").textContent = mapDef.name;

    var game = new ENGINE.Game(mapDef, { seed: opts.seed });
    currentUI = new UI.GameUI($("game-canvas"), game, {
      hotseat: !!opts.hotseat,
      onGameOver: function (winner) {
        if (winner === 0 && opts.campaignIndex !== undefined) {
          var p = getProgress();
          if (opts.campaignIndex + 1 > p.cleared) { p.cleared = opts.campaignIndex + 1; setProgress(p); }
        }
        $("gameover-again").onclick = function () { startGame(mapDef, opts); };
        $("gameover-menu").onclick = function () { showMenu(); };
      },
    });
    currentUI.resize();
  }

  function showMenu() {
    $("game-screen").classList.add("hidden");
    $("menu-screen").classList.remove("hidden");
    buildMenu();
  }

  function buildMenu() {
    var p = getProgress();
    var list = $("mission-list");
    list.innerHTML = "";
    var allOpen = $("chk-unlock").checked;
    CAMPAIGN.forEach(function (m, i) {
      var unlocked = allOpen || i <= p.cleared;
      var div = document.createElement("div");
      div.className = "mission" + (unlocked ? "" : " locked") + (i < p.cleared ? " cleared" : "");
      div.innerHTML = "<span class='mnum'>" + String(i + 1).padStart(2, "0") + "</span>" +
        "<span class='mname'>" + m.name + "</span>" +
        (i < p.cleared ? "<span class='mstar'>★</span>" : "");
      div.title = m.blurb || "";
      if (unlocked) {
        div.onclick = function () {
          startGame(m, { campaignIndex: i, hotseat: $("chk-hotseat").checked });
        };
      }
      list.appendChild(div);
    });

    var clist = $("custom-list");
    clist.innerHTML = "";
    var customs = getCustomLevels();
    customs.forEach(function (lv) {
      var div = document.createElement("div");
      div.className = "mission";
      div.innerHTML = "<span class='mname'>" + lv.name + "</span><span class='mstar'>✎</span>";
      div.onclick = function () { startGame(lv, { hotseat: $("chk-hotseat").checked }); };
      clist.appendChild(div);
    });
    if (!customs.length) clist.innerHTML = "<em>None yet — build one in the editor, or import JSON below.</em>";
  }

  function importLevelFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var lv = JSON.parse(reader.result);
      if (lv.customUnits) mergeUnitTypes(lv.customUnits);
      // Validate by constructing a game; a bad file throws with a clear message.
      new ENGINE.Game(lv, { seed: 1 });
      var customs = getCustomLevels();
      var replaced = false;
      for (var i = 0; i < customs.length; i++) {
        if (customs[i].name === lv.name) { customs[i] = lv; replaced = true; }
      }
      if (!replaced) customs.push(lv);
      localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(customs));
      buildMenu();
    };
    reader.readAsText(file);
  }

  window.addEventListener("DOMContentLoaded", function () {
    loadCustomUnits();
    $("chk-unlock").onchange = buildMenu;
    $("file-import").onchange = function (e) {
      if (e.target.files[0]) importLevelFile(e.target.files[0]);
      e.target.value = "";
    };
    // Editor play-test handoff: ?playtest=1 reads the level from localStorage.
    if (location.search.indexOf("playtest=1") >= 0) {
      var lv = JSON.parse(localStorage.getItem("nectaris-playtest"));
      if (lv && lv.customUnits) mergeUnitTypes(lv.customUnits);
      if (lv) { startGame(lv, { hotseat: false }); return; }
    }
    showMenu();
  });
})();
