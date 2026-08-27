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
  var currentOptions = {};

  function startGame(mapDef, opts) {
    opts = opts || {};
    if (currentUI) currentUI.destroy();
    currentUI = null;
    currentOptions = opts;
    $("menu-screen").classList.add("hidden");
    $("game-screen").classList.remove("hidden");
    $("gameover-panel").classList.add("hidden");
    $("map-title").textContent = mapDef.name;
    $("map-jump").value = opts.campaignIndex !== undefined ? "c:" + opts.campaignIndex :
      (opts.expansionIndex !== undefined ? "e:" + opts.expansionIndex : "");

    var game = new ENGINE.Game(mapDef, { seed: opts.seed });
    currentUI = new UI.GameUI($("game-canvas"), game, {
      hotseat: !!opts.hotseat,
      onMenu: showMenu,
      onGameOver: function (winner) {
        if (winner === 0 && opts.campaignIndex !== undefined) {
          var p = getProgress();
          if (opts.campaignIndex + 1 > p.cleared) { p.cleared = opts.campaignIndex + 1; setProgress(p); }
        }
        $("gameover-again").onclick = function () { startGame(mapDef, opts); };
        $("gameover-menu").onclick = function () { showMenu(); };
        var next = $("gameover-next");
        if (opts.campaignIndex !== undefined && opts.campaignIndex + 1 < CAMPAIGN.length) {
          next.classList.remove("hidden");
          next.onclick = function () {
            var ni = opts.campaignIndex + 1;
            startGame(CAMPAIGN[ni], { campaignIndex: ni, hotseat: !!opts.hotseat });
          };
        } else {
          next.classList.add("hidden");
          next.onclick = null;
        }
      },
    });
    currentUI.resize();
  }

  function showMenu() {
    if (currentUI) currentUI.destroy();
    currentUI = null;
    $("game-screen").classList.add("hidden");
    $("menu-screen").classList.remove("hidden");
    buildMenu();
  }

  function buildMenu() {
    var p = getProgress();
    var list = $("mission-list");
    list.innerHTML = "";
    CAMPAIGN.forEach(function (m, i) {
      var div = document.createElement("div");
      div.className = "mission" + (i < p.cleared ? " cleared" : "");
      div.innerHTML = "<span class='mnum'>" + String(i + 1).padStart(2, "0") + "</span>" +
        "<span class='mname'>" + m.name + "</span>" +
        (i < p.cleared ? "<span class='mstar'>★</span>" : "");
      div.title = m.blurb || "";
      div.onclick = function () {
        startGame(m, { campaignIndex: i, hotseat: $("chk-hotseat").checked });
      };
      list.appendChild(div);
    });

    var expansion = $("expansion-list");
    expansion.innerHTML = "";
    EXPANSION_LEVELS.forEach(function (lv, i) {
      var card = document.createElement("article");
      card.className = "level-card";
      var heading = document.createElement("div");
      heading.className = "level-card-heading";
      heading.textContent = String(i + 1).padStart(2, "0") + " · " + lv.name;
      var description = document.createElement("p");
      description.textContent = lv.description;
      var special = document.createElement("p");
      special.className = "level-special";
      special.textContent = "Special: " + lv.special;
      var footer = document.createElement("div");
      footer.className = "level-card-footer";
      var tags = document.createElement("span");
      tags.textContent = lv.tags.join(" · ");
      var source = document.createElement("a");
      source.href = lv.source;
      source.target = "_blank";
      source.rel = "noopener";
      source.textContent = "Source";
      source.onclick = function (event) { event.stopPropagation(); };
      footer.appendChild(tags);
      footer.appendChild(source);
      card.appendChild(heading);
      card.appendChild(description);
      card.appendChild(special);
      card.appendChild(footer);
      card.onclick = function () {
        startGame(lv, { expansionIndex: i, hotseat: $("chk-hotseat").checked });
      };
      expansion.appendChild(card);
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

  function installOnlineLevels(url) {
    var status = $("online-import-status");
    status.className = "";
    status.textContent = "Downloading…";
    fetch(url).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status + " " + response.statusText + " from " + url);
      }
      return response.json();
    }).then(function (payload) {
      var levels = Array.isArray(payload) ? payload :
        (payload.levels && Array.isArray(payload.levels) ? payload.levels : [payload]);
      if (!levels.length) throw new Error("The file contains no levels.");
      var customs = getCustomLevels();
      levels.forEach(function (lv) {
        if (!lv.name) throw new Error("Every online level needs a name.");
        if (lv.customUnits) mergeUnitTypes(lv.customUnits);
        new ENGINE.Game(lv, { seed: 1 });
        lv.source = lv.source || url;
        var replaced = false;
        for (var i = 0; i < customs.length; i++) {
          if (customs[i].name === lv.name) {
            customs[i] = lv;
            replaced = true;
            break;
          }
        }
        if (!replaced) customs.push(lv);
      });
      localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(customs));
      status.className = "success";
      status.textContent = "Installed " + levels.length + " level" + (levels.length === 1 ? "" : "s") + ".";
      buildMenu();
    }).catch(function (error) {
      status.className = "error";
      status.textContent = error.message;
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    loadCustomUnits();
    MUSIC.init();
    var jump = $("map-jump");
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Jump to map…";
    jump.appendChild(placeholder);
    var campaignGroup = document.createElement("optgroup");
    campaignGroup.label = "Campaign";
    CAMPAIGN.forEach(function (m, i) {
      var option = document.createElement("option");
      option.value = "c:" + i;
      option.textContent = String(i + 1).padStart(2, "0") + " · " + m.name;
      campaignGroup.appendChild(option);
    });
    jump.appendChild(campaignGroup);
    var expansionGroup = document.createElement("optgroup");
    expansionGroup.label = "Lunar Frontiers";
    EXPANSION_LEVELS.forEach(function (m, i) {
      var option = document.createElement("option");
      option.value = "e:" + i;
      option.textContent = String(i + 1).padStart(2, "0") + " · " + m.name;
      expansionGroup.appendChild(option);
    });
    jump.appendChild(expansionGroup);
    jump.onchange = function () {
      if (this.value === "") return;
      var parts = this.value.split(":");
      var i = +parts[1];
      if (parts[0] === "c") {
        startGame(CAMPAIGN[i], { campaignIndex: i, hotseat: !!currentOptions.hotseat });
      } else {
        startGame(EXPANSION_LEVELS[i], { expansionIndex: i, hotseat: !!currentOptions.hotseat });
      }
    };
    $("file-import").onchange = function (e) {
      if (e.target.files[0]) importLevelFile(e.target.files[0]);
      e.target.value = "";
    };
    $("btn-online-import").onclick = function () {
      var url = $("online-level-url").value.trim();
      if (!url) {
        $("online-import-status").className = "error";
        $("online-import-status").textContent = "Enter a level JSON URL.";
        return;
      }
      installOnlineLevels(url);
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
