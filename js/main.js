/* Nectaris remake — boot, mission menu, custom-level loading, progress. */
"use strict";

(function () {
  function $(id) { return document.getElementById(id); }

  var ORIGINAL_CAMPAIGN = CAMPAIGN.concat(ADVANCED_CAMPAIGN);
  function terrainCampaign(id) {
    return ENVIRONMENT_CAMPAIGNS.find(function (campaign) { return campaign.id === id; });
  }

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
        new Date(result.endedAt).toLocaleString() + (result.balance ? " · Offers: "+
          (result.balance.secondPlayer===0?"Union":"Xenon")+" second · "+result.balance.label : "") + (!result.hotseat && result.opponent ?
          " · " + AI_SEARCH.get(result.opponent).label + (result.opponentChanges && result.opponentChanges.length ? " (changed during match)" : "") : "");
      row.appendChild(title); row.appendChild(detail);
      history.appendChild(row);
    });
    $("history-count").textContent = "Showing " + Math.min(historyLimit, results.length) + " of " + results.length + " matches";
    $("history-more").classList.toggle("hidden", historyLimit >= results.length);
    $("history-section").classList.toggle("hidden", !results.length);
  }

  function appendLevelRecord(host, map, options) {
    var record = PROFILES.levelRecord(activeProfile, map, options);
    var status = document.createElement("span");
    status.className = "mission-record";
    status.textContent = record.latest ? PROFILES.outcomeLabel(record.latest) + " · " +
      record.wins + "W / " + record.losses + "L" + (record.hotseat ? " · " + record.hotseat + " hotseat" : "") :
      (levelWasWon(map, options) ? "Cleared" : "");
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
  var currentSetup = null;
  var currentOptions = {};
  var menuScrollTop = 0;

  function openingMode(options) {
    var selected=document.querySelector('input[name="opening"]:checked');
    var mode=options.opening || (selected && selected.value) || "auto";
    return mode==="auto" ? (options.campaignIndex===undefined ? "offers" : "original") : mode;
  }

  function startGame(mapDef, opts, saved) {
    opts = Object.assign({}, opts || {});
    opts.opening = saved ? (opts.opening || "original") : openingMode(opts);
    if (!saved) delete opts.balance;
    var preferredOpponent = "apex";
    try { preferredOpponent = localStorage.getItem("nectaris-opponent") || preferredOpponent; } catch (e) { /* optional preference */ }
    opts.opponent = AI_SEARCH.get(opts.opponent || (saved ? "classic" : preferredOpponent)).id;
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
    if (currentSetup) currentSetup.destroy();
    currentSetup = null;
    if (currentUI) currentUI.destroy();
    currentUI = null;
    if (!$("menu-screen").classList.contains("hidden")) menuScrollTop = window.scrollY || 0;
    $("menu-screen").classList.add("hidden");
    $("game-screen").classList.add("hidden");
    function launchGame() {
      if (currentSetup) currentSetup.destroy();
      currentSetup = null;
      currentMatchId = saved ? saved.id : PROFILES.newId();
      currentProfileId = profile.id;
      if (currentUI) currentUI.destroy();
      currentUI = null;
      currentOptions = opts;
      if (!$("menu-screen").classList.contains("hidden")) menuScrollTop = window.scrollY || 0;
      $("menu-screen").classList.add("hidden");
      $("game-screen").classList.remove("hidden");
      $("gameover-panel").classList.add("hidden");
      $("map-title").textContent = mapDef.name;
      var balanceLabel=$("balance-match-label");
      balanceLabel.classList.toggle("hidden",!game.balance);
      balanceLabel.textContent=game.balance ? (game.firstPlayer===0?"Union":"Xenon")+" first · "+
        (game.balance.secondPlayer===0?"Union":"Xenon")+" bonus: "+game.balance.label : "";
      $("map-jump").value = opts.environmentCampaign ?
        "t:" + opts.environmentCampaign + ":" + opts.environmentIndex : opts.campaignIndex !== undefined ? "c:" + opts.campaignIndex :
        (opts.expansionIndex !== undefined ? "e:" + opts.expansionIndex :
        (opts.baseNecIndex !== undefined ? "b:" + opts.baseNecIndex :
        (opts.aiMadeIndex !== undefined ? "a:" + opts.aiMadeIndex : "")));

      currentUI = new UI.GameUI($("game-canvas"), game, {
        hotseat: !!opts.hotseat,
        opponent: opts.opponent,
        onOpponentChange: function (id, turn) {
          if (!opts.opponentChanges) opts.opponentChanges = [];
          opts.opponentChanges.push({turn:turn, from:opts.opponent, to:id});
          opts.opponent = id;
        },
        undoHistory: saved && saved.state.undoHistory,
        redoHistory: saved && saved.state.redoHistory,
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
          var terrain = terrainCampaign(opts.environmentCampaign);
          if (terrain && opts.environmentIndex + 1 < terrain.levels.length) {
            next.classList.remove("hidden");
            next.onclick = function () {
              var ni = opts.environmentIndex + 1;
              startGame(terrain.levels[ni], {environmentCampaign:terrain.id, environmentIndex:ni,
                hotseat:!!opts.hotseat, opponent:opts.opponent, opening:opts.opening});
            };
          } else if (opts.campaignIndex !== undefined && opts.campaignIndex + 1 < ORIGINAL_CAMPAIGN.length) {
            next.classList.remove("hidden");
            next.onclick = function () {
              var ni = opts.campaignIndex + 1;
              startGame(ORIGINAL_CAMPAIGN[ni], { campaignIndex: ni, hotseat: !!opts.hotseat, opening:opts.opening });
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
    if (!saved && opts.opening==="offers") {
      currentSetup=new BALANCE_UI.Setup(game,{hotseat:!!opts.hotseat,onCancel:showMenu,onStart:function(result,plan){
        try {
          if(result)opts.balance=BALANCE.apply(game,plan,result);
          else opts.opening="original";
          launchGame();
        } catch(error) {reportSaveError(error);}
      }});
    } else launchGame();
  }

  function showMenu() {
    if (!saveMatch(currentUI)) return;
    readyToSave = false;
    if (currentSetup) currentSetup.destroy();
    currentSetup = null;
    if (currentUI) currentUI.destroy();
    currentUI = null;
    $("game-screen").classList.add("hidden");
    $("menu-screen").classList.remove("hidden");
    buildMenu();
    window.scrollTo(0, menuScrollTop);
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
      source: "Level source ↗", collectionSource: "Collection notes ↗", play: "Play",
      briefing: "Briefing", design: "Design notes", author: "Made by", sourceFile: "Terrain file",
      lastMatch: "Last match", collection: "About this collection", noNotes: "No briefing supplied by the author.",
      union: "Union", xenon: "Xenon", neutral: "Neutral",
      mission: "Level", size: "Size", result: "Result",
    },
    ja: {
      source: "出典 ↗", collectionSource: "コレクションの詳細 ↗", play: "開始",
      briefing: "作戦概要", design: "設計の特徴", author: "作者", sourceFile: "地形ファイル",
      lastMatch: "前回の結果", collection: "このコレクションについて", noNotes: "作戦概要はありません。",
      union: "連合軍", xenon: "ガイチ軍", neutral: "中立",
      mission: "マップ", size: "サイズ", result: "結果",
    },
  };

  function initialForceCounts(level) {
    var counts = [0, 0, 0];
    (level.units || []).forEach(function (unit) {
      if (unit.o === 0 || unit.o === 1) counts[unit.o]++;
      else if (unit.o === -1) counts[2]++;
    });
    (level.buildings || []).forEach(function (building) {
      var owner = building.owner === 0 || building.owner === 1 ? building.owner : 2;
      counts[owner] += (building.stored || []).length;
    });
    return counts;
  }

  function forceCountHtml(level, labels, className) {
    var counts = initialForceCounts(level);
    return ["union", "xenon", "neutral"].map(function (side, index) {
      return "<span class='" + className + " force-" + side + "' aria-label='" + labels[side] + " " + counts[index] +
        "'><span class='force-count'>" + counts[index] + "</span></span>";
    }).join("");
  }

  var menuHelpTimer = null, activeMenuHelp = null;
  function clearMenuHelpTimer() {
    if (menuHelpTimer !== null) clearTimeout(menuHelpTimer);
    menuHelpTimer = null;
  }
  function closeMenuHelp() {
    clearMenuHelpTimer();
    if (!activeMenuHelp) return;
    activeMenuHelp.panel.classList.add("hidden");
    activeMenuHelp.button.setAttribute("aria-expanded", "false");
    activeMenuHelp.clicked = false;
    activeMenuHelp = null;
  }
  function menuText(tag, className, value) {
    var node = document.createElement(tag);
    node.className = className || "";
    node.textContent = value;
    return node;
  }
  function addHelpText(panel, label, value) {
    if (!value) return;
    panel.appendChild(menuText("h4", "", label));
    panel.appendChild(menuText("p", "", value));
  }
  function addHelpSource(panel, source, label) {
    if (!source) return;
    try {
      var url = new URL(source, document.baseURI);
      if (url.protocol !== "https:" && url.protocol !== "http:" &&
          !(url.protocol === "file:" && location.protocol === "file:")) return;
    } catch (error) { return; }
    var link = menuText("a", "level-source", label);
    link.href = source; link.target = "_blank"; link.rel = "noopener";
    panel.appendChild(link);
  }
  function createMenuHelp(id, name, fill) {
    var wrap = document.createElement("div");
    wrap.className = "level-help-wrap";
    var button = menuText("button", "level-help", "?");
    button.type = "button";
    button.setAttribute("aria-label", "About " + name);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", id);
    var panel = document.createElement("div");
    panel.id = id; panel.className = "level-briefing hidden";
    panel.tabIndex = -1;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", name + " details");
    panel.appendChild(menuText("h3", "briefing-title", name));
    fill(panel);
    wrap.appendChild(button); wrap.appendChild(panel);
    var state = {wrap:wrap, button:button, panel:panel, clicked:false};
    function show() {
      if (activeMenuHelp !== state) closeMenuHelp();
      else clearMenuHelpTimer();
      activeMenuHelp = state;
      panel.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
      var rect = button.getBoundingClientRect();
      panel.style.left = Math.max(12, Math.min(rect.right - panel.offsetWidth,
        window.innerWidth - panel.offsetWidth - 12)) + "px";
      var top = rect.bottom;
      if (top + panel.offsetHeight > window.innerHeight - 12) top = rect.top - panel.offsetHeight;
      panel.style.top = Math.max(12, top) + "px";
    }
    // Only the small help button opens details; the card never owns a hover.
    button.onmouseenter = function () {
      clearMenuHelpTimer(); menuHelpTimer = setTimeout(show, 180);
    };
    button.onfocus = show;
    button.onclick = function () {
      if (activeMenuHelp === state && state.clicked) closeMenuHelp();
      else { show(); state.clicked = true; }
    };
    // The panel touches the button so its links remain reachable with no
    // dismissal delay. Clicks and lingering focus never pin it after mouseout.
    function leave(event) {
      clearMenuHelpTimer();
      var target = event && event.relatedTarget;
      if (target && (button.contains(target) || panel.contains(target))) return;
      if (activeMenuHelp === state) closeMenuHelp();
    }
    button.onmouseleave = panel.onmouseleave = wrap.onmouseleave = leave;
    panel.onmouseenter = clearMenuHelpTimer;
    wrap.addEventListener("focusout", function (event) {
      if (!wrap.contains(event.relatedTarget) && activeMenuHelp === state) closeMenuHelp();
    });
    return wrap;
  }
  function levelOptions(group, index) {
    var options = {};
    if (group.pack) options[group.pack] = index + (group.offset || 0);
    if (group.environmentCampaign) options.environmentCampaign = group.environmentCampaign;
    options.opening=openingMode(options);
    return options;
  }
  function levelWasWon(level, options) {
    return PROFILES.levelRecord(activeProfile, level, options).wins > 0 ||
      !!(activeProfile && options.opening!=="offers" && options.campaignIndex !== undefined &&
        activeProfile.cleared.indexOf(options.campaignIndex) >= 0);
  }
  function levelGroups() {
    return ENVIRONMENT_CAMPAIGNS.map(function (campaign) {
      return {id:campaign.id, list:campaign.id+"-list", title:campaign.name, kind:"AI-made campaign",
        intro:campaign.description, levels:campaign.levels, pack:"environmentIndex", environmentCampaign:campaign.id,
        notes:"Sixteen AI-made battles created by Codex, each with its own terrain, forces and tactical problem. Normal capture/elimination rules apply. No Hunters, Falcons or Eagles; some missions include Pelicans. Forces start fresh each mission.",
        source:"ENVIRONMENT_CAMPAIGNS.md#"+campaign.id};
    }).concat([
      {id:"ai-made", list:"ai-made-list", title:"AI-made", kind:"Original scenarios",
        intro:"Branching fjords, narrow passes and new routes to explore.",
        levels:AI_MADE_LEVELS, pack:"aiMadeIndex",
        notes:"Original battlefields made to the project owner's specifications. Each part keeps its own layout, starting forces and factory inventories. Later maps explore different route structures rather than replacing earlier levels.",
        source:"PRODUCT.md#ai-made-fjord-levels-2026-09-22"},
      {id:"normal", list:"mission-list", title:"Normal campaign", kind:"Original campaign",
        intro:"Sixteen original battles from the PC Engine campaign.",
        levels:CAMPAIGN, pack:"campaignIndex",
        notes:"Original normal-campaign layouts, deployments and factory inventories, extracted from Hudson's official 1997 Windows remake. English unit names follow the TurboGrafx-16 release. The imported battlefields are preserved without retuning.",
        source:"LEVEL_SOURCES.md#included-campaign-official-hudson-normal-campaign"},
      {id:"advanced", list:"advanced-mission-list", title:"Advanced campaign", kind:"Original campaign",
        intro:"Return to the original battlefields with advanced deployments and reserves.",
        levels:ADVANCED_CAMPAIGN, pack:"campaignIndex", offset:CAMPAIGN.length,
        notes:"Missions 17–32 preserve the official advanced deployments and factory inventories. They remain separate from the normal campaign and keep their original campaign numbering.",
        source:"LEVEL_SOURCES.md#included-advanced-campaign-2026-09-20"},
      {id:"expansion", list:"expansion-list", title:"Lunar Frontiers", kind:"Original expansion",
        intro:"Twelve original scenarios, each built around a different tactical idea.",
        levels:EXPANSION_LEVELS, pack:"expansionIndex",
        notes:"Original maps by Nectaris Remake contributors. Each level's notes explain its design focus and link to the source data; these layouts do not reproduce the original campaign or community archive maps.",
        source:"LEVEL_SOURCES.md#included-online-expansion-lunar-frontiers"},
      {id:"basenec", list:"basenec-list", title:lang() === "ja" ? "ベース・ネクタリス地形" : "Base Nectaris", kind:"Terrain pack",
        intro:"Community terrain, with new forces and briefings for this remake.",
        levels:BASE_NECTARIS_LEVELS, pack:"baseNecIndex",
        notes:"Terrain by Crescent (BASE NECTARIS), from the unit-free Windows map files whose download page permits placing units and reposting the result. Rosters, deployments and briefings are this project's. Other archive scenarios and commentary are not part of this import.",
        source:"LEVEL_SOURCES.md#included-pack-base-nectaris-terrain-added-2026-09-01"},
      {id:"custom", list:"custom-list", title:"Custom levels", kind:"Your collection",
        intro:"Battlefields you create or import, saved in this browser.", levels:getCustomLevels(),
        notes:"Create a map in the editor, import a JSON file, or install a level from a URL. Custom maps can include their own units and rules data. Briefings and attribution appear here when provided by their author.",
        source:"LEVEL_SOURCES.md#installing-levels-from-the-web"}
    ]);
  }
  function renderLevelCards(host, group) {
    var L = CARD_LABELS[lang()];
    if (group.levels.length) {
      [1, 2, 3].forEach(function (column) {
        var columns = menuText("div", "level-columns", "");
        columns.classList.add("level-columns-" + column);
        columns.appendChild(menuText("span", "level-number", "#"));
        columns.appendChild(menuText("span", "", L.mission));
        columns.appendChild(menuText("span", "level-card-meta", L.size));
        ["union", "xenon", "neutral"].forEach(function (side) {
          columns.appendChild(menuText("span", "level-force force-" + side, L[side]));
        });
        columns.appendChild(menuText("span", "", L.result));
        host.appendChild(columns);
      });
    }
    group.levels.forEach(function (lv, i) {
      var options = levelOptions(group, i), name = tr(lv, "name");
      var card = document.createElement("article");
      card.className = "level-card" + (levelWasWon(lv, options) ? " cleared" : "");
      var play = menuText("button", "level-play", "");
      play.type = "button"; play.setAttribute("aria-label", L.play + " " + name);
      play.onclick = function () {
        closeMenuHelp(); options.hotseat = $("chk-hotseat").checked; startGame(lv, options);
      };
      var heading = document.createElement("span"); heading.className = "level-card-top";
      var title = menuText("span", "level-card-heading", name);
      title.id = group.id + "-level-" + i;
      card.setAttribute("aria-labelledby", title.id);
      heading.appendChild(menuText("span", "level-number", String(i + 1 + (group.offset || 0)).padStart(2, "0")));
      heading.appendChild(title);
      heading.appendChild(menuText("span", "level-card-meta", lv.grid[0].length + " × " + lv.grid.length));
      play.appendChild(heading);
      var forces = document.createElement("span"); forces.className = "level-card-forces";
      forces.innerHTML = forceCountHtml(lv, L, "level-force"); play.appendChild(forces);
      appendLevelRecord(play, lv, options);
      card.appendChild(play);
      card.appendChild(createMenuHelp(title.id + "-details", name, function (panel) {
        addHelpText(panel, L.briefing, tr(lv, "description") || tr(lv, "blurb"));
        addHelpText(panel, L.design, tr(lv, "special"));
        var tags = tr(lv, "tags");
        if (tags && tags.length) panel.appendChild(menuText("p", "level-tags", tags.join(" · ")));
        addHelpText(panel, L.author, tr(lv, "author"));
        if (lv.sourceFile) addHelpText(panel, L.sourceFile, lv.sourceFile);
        var record = PROFILES.levelRecord(activeProfile, lv, options);
        if (record.latest) addHelpText(panel, L.lastMatch, PROFILES.outcomeLabel(record.latest) +
          " · " + PROFILES.reasonLabel(record.latest.reason) + " · Turn " + record.latest.turn);
        if (!tr(lv, "description") && !tr(lv, "blurb") && !tr(lv, "special"))
          panel.appendChild(menuText("p", "", L.noNotes));
        addHelpSource(panel, lv.source || group.source, lv.source ? L.source : L.collectionSource);
      }));
      host.appendChild(card);
    });
  }
  function buildMenu() {
    closeMenuHelp();
    var sel = $("lang-select");
    sel.value = lang();
    sel.onchange = function () { localStorage.setItem(LANG_KEY, sel.value); buildMenu(); };
    try { renderProfile(); } catch (error) { reportSaveError(error); }
    // Detach import controls before replacing their collection, preserving events and entered URLs.
    var customTools = $("custom-level-tools");
    customTools.remove();
    var host = $("level-groups"), nav = $("level-groups-nav");
    host.replaceChildren(); nav.replaceChildren();
    levelGroups().forEach(function (group) {
      var section = document.createElement("section");
      section.className = "level-group"; section.id = group.id + "-section";
      section.setAttribute("aria-labelledby", group.id + "-heading");
      var heading = document.createElement("header"); heading.className = "level-group-header";
      var intro = document.createElement("div"); intro.className = "level-group-intro";
      intro.appendChild(menuText("p", "level-group-kind", group.kind));
      var title = menuText("h2", "", group.title); title.id = group.id + "-heading";
      intro.appendChild(title); intro.appendChild(menuText("p", "section-note", group.intro));
      heading.appendChild(intro);
      var won = group.levels.filter(function (lv,i) { return levelWasWon(lv, levelOptions(group,i)); }).length;
      heading.appendChild(menuText("span", "group-progress", group.levels.length ? won + " / " + group.levels.length + " won" : "No levels yet"));
      heading.appendChild(createMenuHelp(group.id + "-details", group.title, function (panel) {
        addHelpText(panel, CARD_LABELS[lang()].collection, group.notes);
        addHelpSource(panel, group.source, CARD_LABELS[lang()].collectionSource);
      }));
      section.appendChild(heading);
      var list = document.createElement("div"); list.id = group.list; list.className = "level-library";
      list.addEventListener("scroll", closeMenuHelp);
      renderLevelCards(list, group); section.appendChild(list);
      if (!group.levels.length) list.appendChild(menuText("p", "empty-levels", "No levels yet. Create a battlefield or import one below."));
      if (group.id === "custom") section.appendChild(customTools);
      host.appendChild(section);
      var jump = menuText("a", "", group.title);
      jump.href = "#" + section.id;
      jump.appendChild(menuText("span", "", String(group.levels.length)));
      nav.appendChild(jump);
    });
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
    var openingSelect=$("opening-select"),opening="auto";
    try {opening=localStorage.getItem("nectaris-opening") || "auto";} catch(e) { /* optional preference */ }
    if(["original","offers","auto"].indexOf(opening)<0)opening="auto";
    document.querySelector('input[name="opening"][value="'+opening+'"]').checked=true;
    openingSelect.onchange=function(event){
      try {localStorage.setItem("nectaris-opening",event.target.value);} catch(e) { /* optional preference */ }
      buildMenu();
    };
    window.addEventListener("scroll", closeMenuHelp);
    window.addEventListener("resize", closeMenuHelp);
    document.addEventListener("pointerdown", function (event) {
      if (activeMenuHelp && !activeMenuHelp.wrap.contains(event.target)) closeMenuHelp();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && activeMenuHelp) {
        activeMenuHelp.button.focus();
        closeMenuHelp(); event.stopPropagation();
      }
    });
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
    ENVIRONMENT_CAMPAIGNS.forEach(function (campaign) {
      var group = document.createElement("optgroup"); group.label = campaign.name;
      campaign.levels.forEach(function (map, index) {
        var option = document.createElement("option");
        option.value = "t:"+campaign.id+":"+index;
        option.textContent = String(index+1).padStart(2,"0")+" · "+map.name;
        group.appendChild(option);
      });
      jump.appendChild(group);
    });
    jump.onchange = function () {
      if (this.value === "") return;
      var parts = this.value.split(":");
      var i = +parts[1];
      if (parts[0] === "t") {
        var terrain = terrainCampaign(parts[1]), ti = Number(parts[2]);
        if (terrain && Number.isInteger(ti) && terrain.levels[ti]) startGame(terrain.levels[ti],
          {environmentCampaign:terrain.id, environmentIndex:ti, hotseat:!!currentOptions.hotseat, opening:currentOptions.opening});
      } else if (parts[0] === "c") {
        startGame(ORIGINAL_CAMPAIGN[i], { campaignIndex: i, hotseat: !!currentOptions.hotseat, opening:currentOptions.opening });
      } else if (parts[0] === "b") {
        startGame(BASE_NECTARIS_LEVELS[i], { baseNecIndex: i, hotseat: !!currentOptions.hotseat, opening:currentOptions.opening });
      } else if (parts[0] === "a") {
        startGame(AI_MADE_LEVELS[i], { aiMadeIndex: i, hotseat: !!currentOptions.hotseat, opening:currentOptions.opening });
      } else {
        startGame(EXPANSION_LEVELS[i], { expansionIndex: i, hotseat: !!currentOptions.hotseat, opening:currentOptions.opening });
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
