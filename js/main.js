/* Nectaris remake — boot, mission menu, custom-level loading, progress. */
"use strict";

(function () {
  function $(id) { return document.getElementById(id); }

  var ORIGINAL_CAMPAIGN = CAMPAIGN.concat(ADVANCED_CAMPAIGN);

  var CUSTOM_LEVELS_KEY = "nectaris-custom-levels";
  var CUSTOM_UNITS_KEY = "nectaris-custom-units";
  var profiles;
  var activeProfile = null;
  var currentMatchId = null;
  var currentProfileId = null;
  var readyToSave = false;
  var historyLimit = 10;
  var historyProfileId = null;

  function reportSaveError(error) {
    $("save-error").textContent = error.message;
    $("save-error").classList.remove("hidden");
  }

  function saveMatch(ui) {
    if (!readyToSave || !ui || !currentMatchId) return true;
    try {
      var state = ui.snapshotForSave();
      if (!state) return true;
      profiles.checkpoint(currentProfileId, {id: currentMatchId, options: currentOptions,
        savedAt: new Date().toISOString(), state: state});
      $("save-error").classList.add("hidden");
      return true;
    } catch (error) { reportSaveError(error); return false; }
  }

  function openProfileForm() {
    $("profile-error").textContent = "";
    $("profile-name").value = "";
    $("profile-cancel").classList.toggle("hidden", !activeProfile);
    $("profile-dialog").showModal();
    $("profile-name").focus();
  }

  function renderProfile() {
    activeProfile = profiles.active();
    var select = $("profile-select");
    select.replaceChildren();
    profiles.read().profiles.forEach(function (p) {
      var option = document.createElement("option");
      option.value = p.id; option.textContent = p.name;
      select.appendChild(option);
    });
    select.value = activeProfile ? activeProfile.id : "";
    select.disabled = !activeProfile;
    $("profile-heading").textContent = activeProfile ? "Welcome back, " + activeProfile.name : "Choose your player profile";
    var results = activeProfile ? activeProfile.results : [];
    var solo = results.filter(function (r) { return !r.hotseat; });
    var wins = solo.filter(function (r) { return r.outcome === "win"; }).length;
    var losses = solo.length - wins, hotseatCount = results.length - solo.length;
    $("profile-record").textContent = wins + (wins === 1 ? " win · " : " wins · ") +
      losses + (losses === 1 ? " loss · " : " losses · ") + hotseatCount +
      (hotseatCount === 1 ? " hotseat match" : " hotseat matches");
    var saved = activeProfile && activeProfile.savedMatch;
    $("continue-match").classList.toggle("hidden", !saved);
    $("continue-detail").textContent = saved ? saved.state.map.name + " · Turn " + saved.state.turn +
      " · " + (saved.options.hotseat ? "Hotseat" : "Solo") + " · Saved " + new Date(saved.savedAt).toLocaleString() : "";
    if (historyProfileId !== (activeProfile && activeProfile.id)) historyLimit = 10;
    historyProfileId = activeProfile && activeProfile.id;
    renderHistory();
  }

  function renderHistory() {
    var results = activeProfile ? activeProfile.results : [];
    var history = $("profile-history");
    history.replaceChildren();
    results.slice(-historyLimit).reverse().forEach(function (result) {
      var row = document.createElement("li");
      var title = document.createElement("strong");
      title.textContent = result.name + " — " + PROFILES.outcomeLabel(result);
      title.className = result.hotseat ? "outcome-hotseat" : "outcome-" + result.outcome;
      var detail = document.createElement("span");
      detail.textContent = PROFILES.reasonLabel(result.reason) + " · " +
        (result.hotseat ? "Hotseat" : "Solo") + " · Turn " + result.turn + " · " +
        new Date(result.endedAt).toLocaleString();
      row.appendChild(title); row.appendChild(detail);
      history.appendChild(row);
    });
    $("history-count").textContent = "Showing " + Math.min(historyLimit, results.length) + " of " + results.length + " matches";
    $("history-more").classList.toggle("hidden", historyLimit >= results.length);
    $("history-section").classList.toggle("hidden", !results.length);
  }

  function appendLevelRecord(host, map, options) {
    var record = PROFILES.levelRecord(activeProfile, map, options);
    if (!record.latest) return;
    var status = document.createElement("div");
    status.className = "mission-record";
    status.textContent = record.wins + "W / " + record.losses + "L" +
      (record.hotseat ? " · " + record.hotseat + " hotseat" : "") +
      " · Last: " + PROFILES.outcomeLabel(record.latest);
    status.title = PROFILES.reasonLabel(record.latest.reason);
    host.appendChild(status);
  }

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

  function startGame(mapDef, opts, saved) {
    opts = opts || {};
    if (!activeProfile) { openProfileForm(); return; }
    if (!saveMatch(currentUI)) return;
    var profile;
    var game;
    try {
      profile = profiles.active();
      if (!profile || profile.id !== activeProfile.id) throw new Error("Profile changed. Return to the menu and choose your profile.");
      if (!saved && profile.savedMatch && !window.confirm("Start a new match? This replaces " +
          profile.savedMatch.state.map.name + " in " + profile.name + "’s saved match. Your results are kept.")) return;
      if (mapDef.customUnits) mergeUnitTypes(mapDef.customUnits);
      game = saved ? ENGINE.Game.restore(saved.state) : new ENGINE.Game(mapDef, { seed: opts.seed });
    } catch (error) { reportSaveError(error); return; }
    readyToSave = false;
    currentMatchId = saved ? saved.id : PROFILES.newId();
    currentProfileId = profile.id;
    if (currentUI) currentUI.destroy();
    currentUI = null;
    currentOptions = opts;
    $("menu-screen").classList.add("hidden");
    $("game-screen").classList.remove("hidden");
    $("gameover-panel").classList.add("hidden");
    $("map-title").textContent = mapDef.name;
    $("map-jump").value = opts.campaignIndex !== undefined ? "c:" + opts.campaignIndex :
      (opts.expansionIndex !== undefined ? "e:" + opts.expansionIndex :
      (opts.baseNecIndex !== undefined ? "b:" + opts.baseNecIndex :
      (opts.aiMadeIndex !== undefined ? "a:" + opts.aiMadeIndex : "")));

    currentUI = new UI.GameUI($("game-canvas"), game, {
      hotseat: !!opts.hotseat,
      undoHistory: saved && saved.state.undoHistory,
      onMenu: showMenu,
      onStateChange: saveMatch,
      onGameOver: function (winner) {
        var recorded = saveMatch(currentUI);
        $("gameover-record").textContent = (opts.hotseat ?
          (winner === 0 ? "Union victory" : "Xenon victory") : (winner === 0 ? "Victory" : "Defeat")) +
          (recorded ? " · Recorded for " + profile.name : " · Not saved yet — keep this page open");
        $("gameover-again").onclick = function () { startGame(mapDef, opts); };
        $("gameover-menu").onclick = function () { showMenu(); };
        var next = $("gameover-next");
        if (opts.campaignIndex !== undefined && opts.campaignIndex + 1 < ORIGINAL_CAMPAIGN.length) {
          next.classList.remove("hidden");
          next.onclick = function () {
            var ni = opts.campaignIndex + 1;
            startGame(ORIGINAL_CAMPAIGN[ni], { campaignIndex: ni, hotseat: !!opts.hotseat });
          };
        } else {
          next.classList.add("hidden");
          next.onclick = null;
        }
      },
    });
    currentUI.resize();
    $("playing-profile").textContent = "PLAYER · " + profile.name;
    readyToSave = true;
    saveMatch(currentUI);
    if (game.winner !== null) currentUI.checkGameOver();
    else if (!opts.hotseat && game.currentPlayer === 1) currentUI.beginAITurn();
  }

  function showMenu() {
    if (!saveMatch(currentUI)) return;
    readyToSave = false;
    if (currentUI) currentUI.destroy();
    currentUI = null;
    $("game-screen").classList.add("hidden");
    $("menu-screen").classList.remove("hidden");
    buildMenu();
    if (!activeProfile && !$("profile-dialog").open) openProfileForm();
  }

  var LANG_KEY = "nectaris-lang";
  /* Briefing language. Levels may carry Japanese variants (nameJa, descriptionJa,
   * ...); a level without them shows its English text in either setting, which
   * is a real absence of a translation, not a failure. */
  function lang() {
    var v = localStorage.getItem(LANG_KEY);
    return v === "ja" ? "ja" : "en";
  }
  function tr(lv, field) {
    var ja = lv[field + "Ja"];
    return (lang() === "ja" && ja) ? ja : lv[field];
  }

  var CARD_LABELS = {
    en: {
      special: "Special: ", source: "Terrain source", turns: " turns",
      union: "UNION", xenon: "XENON",
    },
    ja: {
      special: "特徴: ", source: "地形の出典", turns: "ターン",
      union: "連合軍", xenon: "ガイチ軍",
    },
  };

  function initialForceCounts(level) {
    var counts = [0, 0];
    (level.units || []).forEach(function (unit) {
      if (unit.o === 0 || unit.o === 1) counts[unit.o]++;
    });
    (level.buildings || []).forEach(function (building) {
      if (building.owner === 0 || building.owner === 1) {
        counts[building.owner] += (building.stored || []).length;
      }
    });
    return counts;
  }

  function forceCountHtml(level, labels, className) {
    var counts = initialForceCounts(level);
    return "<span class='" + className + " force-union'><span>" +
      labels.union + "</span><strong>" + counts[0] + "</strong></span>" +
      "<span class='" + className + " force-xenon'><span>" +
      labels.xenon + "</span><strong>" + counts[1] + "</strong></span>";
  }

  function renderLevelCards(host, levels, onPick, pack) {
    var L = CARD_LABELS[lang()];
    host.innerHTML = "";
    levels.forEach(function (lv, i) {
      var card = document.createElement("article");
      card.className = "level-card";
      var heading = document.createElement("div");
      heading.className = "level-card-heading";
      heading.textContent = String(i + 1).padStart(2, "0") + " · " + tr(lv, "name");
      var meta = document.createElement("div");
      meta.className = "level-card-meta";
      meta.textContent = lv.grid[0].length + "×" + lv.grid.length + " · " +
        lv.turnLimit + L.turns;
      var forces = document.createElement("div");
      forces.className = "level-card-forces";
      forces.innerHTML = forceCountHtml(lv, L, "level-force");
      var description = document.createElement("p");
      description.textContent = tr(lv, "description");
      var special = document.createElement("p");
      special.className = "level-special";
      special.textContent = L.special + tr(lv, "special");
      var footer = document.createElement("div");
      footer.className = "level-card-footer";
      var tags = document.createElement("span");
      tags.textContent = (tr(lv, "tags") || []).join(" · ");
      var source = document.createElement("a");
      source.href = lv.source;
      source.target = "_blank";
      source.rel = "noopener";
      source.textContent = L.source;
      source.onclick = function (event) { event.stopPropagation(); };
      footer.appendChild(tags);
      footer.appendChild(source);
      card.appendChild(heading);
      card.appendChild(meta);
      card.appendChild(forces);
      card.appendChild(description);
      card.appendChild(special);
      card.appendChild(footer);
      var recordOptions = {}; recordOptions[pack] = i;
      appendLevelRecord(card, lv, recordOptions);
      card.onclick = function () { onPick(lv, i); };
      host.appendChild(card);
    });
  }

  function buildMenu() {
    var sel = $("lang-select");
    sel.value = lang();
    sel.onchange = function () {
      localStorage.setItem(LANG_KEY, sel.value);
      buildMenu();
    };
    try { renderProfile(); } catch (error) { reportSaveError(error); }
    var cleared = activeProfile ? activeProfile.cleared : [];
    var labels = CARD_LABELS[lang()];
    var list = $("mission-list");
    list.innerHTML = "";
    var advancedList = $("advanced-mission-list");
    advancedList.innerHTML = "";
    ORIGINAL_CAMPAIGN.forEach(function (m, i) {
      var div = document.createElement("div");
      div.className = "mission" + (cleared.indexOf(i) >= 0 ? " cleared" : "");
      div.innerHTML = "<span class='mnum'>" + String(i + 1).padStart(2, "0") + "</span>" +
        "<span class='mname'>" + m.name + "</span>" +
        "<span class='mission-forces'>" +
        forceCountHtml(m, labels, "mission-force") + "</span>" +
        (cleared.indexOf(i) >= 0 ? "<span class='mstar'>★</span>" : "");
      div.title = m.blurb || "";
      div.onclick = function () {
        startGame(m, { campaignIndex: i, hotseat: $("chk-hotseat").checked });
      };
      appendLevelRecord(div, m, {campaignIndex: i});
      (i < CAMPAIGN.length ? list : advancedList).appendChild(div);
    });

    renderLevelCards($("expansion-list"), EXPANSION_LEVELS, function (lv, i) {
      startGame(lv, { expansionIndex: i, hotseat: $("chk-hotseat").checked });
    }, "expansionIndex");
    renderLevelCards($("basenec-list"), BASE_NECTARIS_LEVELS, function (lv, i) {
      startGame(lv, { baseNecIndex: i, hotseat: $("chk-hotseat").checked });
    }, "baseNecIndex");
    renderLevelCards($("ai-made-list"), AI_MADE_LEVELS, function (lv, i) {
      startGame(lv, { aiMadeIndex: i, hotseat: $("chk-hotseat").checked });
    }, "aiMadeIndex");

    var clist = $("custom-list");
    clist.innerHTML = "";
    var customs = getCustomLevels();
    customs.forEach(function (lv) {
      var div = document.createElement("div");
      div.className = "mission";
      div.innerHTML = "<span class='mname'>" + lv.name + "</span>" +
        "<span class='mission-forces'>" +
        forceCountHtml(lv, labels, "mission-force") + "</span>" +
        "<span class='mstar'>✎</span>";
      div.onclick = function () { startGame(lv, { hotseat: $("chk-hotseat").checked }); };
      appendLevelRecord(div, lv, {});
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
    try { profiles = new PROFILES.Store(localStorage); activeProfile = profiles.active(); }
    catch (error) { reportSaveError(error); }
    $("profile-form").onsubmit = function (event) {
      event.preventDefault();
      try {
        if (!profiles) profiles = new PROFILES.Store(localStorage);
        activeProfile = profiles.create($("profile-name").value);
        $("profile-dialog").close();
        $("save-error").classList.add("hidden");
        buildMenu();
      } catch (error) { $("profile-error").textContent = error.message; }
    };
    $("profile-dialog").addEventListener("cancel", function (event) {
      if (!activeProfile) event.preventDefault();
    });
    $("profile-cancel").onclick = function () { $("profile-dialog").close(); };
    $("profile-new").onclick = openProfileForm;
    $("history-more").onclick = function () { historyLimit += 10; renderHistory(); };
    $("profile-select").onchange = function () {
      try { profiles.switchTo(this.value); buildMenu(); }
      catch (error) { reportSaveError(error); }
    };
    $("continue-button").onclick = function () {
      try {
        var saved = profiles.active().savedMatch;
        if (saved) startGame(saved.state.map, saved.options, saved);
      } catch (error) { reportSaveError(error); }
    };
    window.addEventListener("pagehide", function () { saveMatch(currentUI); });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") saveMatch(currentUI);
    });
    window.addEventListener("storage", function (event) {
      if (event.key !== PROFILES.KEY && event.key !== null) return;
      // Another tab owns the newest save: stop this view without overwriting it.
      readyToSave = false;
      showMenu();
      reportSaveError(new Error("Profiles changed in another tab. Choose Continue to use the latest saved match."));
    });
    loadCustomUnits();
    MUSIC.init();
    var jump = $("map-jump");
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Jump to map…";
    jump.appendChild(placeholder);
    var campaignGroup = document.createElement("optgroup");
    campaignGroup.label = "Campaign";
    ORIGINAL_CAMPAIGN.forEach(function (m, i) {
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
    var baseNecGroup = document.createElement("optgroup");
    baseNecGroup.label = "Base Nectaris Terrain";
    BASE_NECTARIS_LEVELS.forEach(function (m, i) {
      var option = document.createElement("option");
      option.value = "b:" + i;
      option.textContent = String(i + 1).padStart(2, "0") + " · " + m.name;
      baseNecGroup.appendChild(option);
    });
    jump.appendChild(baseNecGroup);
    var aiMadeGroup = document.createElement("optgroup");
    aiMadeGroup.label = "AI-made";
    AI_MADE_LEVELS.forEach(function (m, i) {
      var option = document.createElement("option");
      option.value = "a:" + i;
      option.textContent = String(i + 1).padStart(2, "0") + " · " + m.name;
      aiMadeGroup.appendChild(option);
    });
    jump.appendChild(aiMadeGroup);
    jump.onchange = function () {
      if (this.value === "") return;
      var parts = this.value.split(":");
      var i = +parts[1];
      if (parts[0] === "c") {
        startGame(ORIGINAL_CAMPAIGN[i], { campaignIndex: i, hotseat: !!currentOptions.hotseat });
      } else if (parts[0] === "b") {
        startGame(BASE_NECTARIS_LEVELS[i], { baseNecIndex: i, hotseat: !!currentOptions.hotseat });
      } else if (parts[0] === "a") {
        startGame(AI_MADE_LEVELS[i], { aiMadeIndex: i, hotseat: !!currentOptions.hotseat });
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
      if (lv && activeProfile) { startGame(lv, { hotseat: false }); return; }
    }
    showMenu();
  });
})();
