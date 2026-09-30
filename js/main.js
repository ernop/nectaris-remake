/* Nectaris remake — boot, mission menu, play history, custom-level loading, progress. */
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
  // The match on screen: {id, profileId, key, mapDef, resumed, acted, baseline}.
  // A match is saved and enters the history only once the player changes it;
  // opening a level to look at it leaves no trace. `baseline` is the position
  // when the player first had control, so any later difference is play.
  var visit = null;
  var HISTORY_PAGE = 200;
  var historyLimit = HISTORY_PAGE;
  var historyProfileId = null;

  function reportSaveError(error) {
    $("save-error").textContent = error.message;
    $("save-error").classList.remove("hidden");
  }

  function playerHasControl(state) {
    return state.winner === null && (!!currentOptions.hotseat || state.currentPlayer === currentOptions.humanSide);
  }
  function playEntry(event, turn) {
    return {at: new Date().toISOString(), event: event, match: visit.id, key: visit.key, name: visit.mapDef.name,
      side: currentOptions.humanSide, hotseat: !!currentOptions.hotseat, opponent: currentOptions.opponent, turn: turn};
  }
  function logEvent(event, turn) { profiles.record(visit.profileId, playEntry(event, turn)); }

  function saveMatch(ui) {
    if (!visit || ui !== currentUI) return true;
    try {
      var state = ui.snapshotForSave();
      if (!state) return true;
      if (!visit.acted) {
        var position = JSON.stringify(state);
        if (visit.baseline === null) { if (playerHasControl(state)) visit.baseline = position; }
        else if (position !== visit.baseline) {
          visit.acted = true;
          logEvent(visit.resumed ? "resume" : "start", state.turn);
        }
      }
      if (visit.acted || visit.resumed || state.winner !== null) {
        profiles.checkpoint(visit.profileId, {id: visit.id, key: visit.key, options: currentOptions,
          savedAt: new Date().toISOString(), state: state});
      }
      $("save-error").classList.add("hidden");
      return true;
    } catch (error) { reportSaveError(error); return false; }
  }

  // Save the match on screen and end its visit. False when saving failed, so
  // the player stays in the match instead of losing it.
  function leaveMatch() {
    if (!visit) return true;
    if (!saveMatch(currentUI)) return false;
    try { if (visit.acted && currentUI.game.winner === null) logEvent("leave", currentUI.game.turn); }
    catch (error) { reportSaveError(error); return false; }
    visit = null;
    return true;
  }

  // The options that open a board's slot afresh: the same side, players and
  // Mode. A match whose offers ended without a deal still belongs to the
  // Offer for first slot it was opened from.
  function freshOptions(key, options) {
    var fresh = Object.assign({}, options, {opening: /:offers(:xenon)?(:hotseat)?$/.test(key) ? "offers" : "original"});
    delete fresh.balance;
    return fresh;
  }

  // Start the match on screen again from the level's opening position. A match
  // already under way asks first and stays in the history as abandoned.
  function restartMatch() {
    if (!visit || !currentUI) return;
    var game = currentUI.game, begun = (visit.acted || visit.resumed) && game.winner === null;
    if (begun && !window.confirm("Restart " + visit.mapDef.name + " from turn 1? This match ends here and stays in your history as abandoned.")) return;
    var mapDef = visit.mapDef, fresh = freshOptions(visit.key, currentOptions);
    if (begun) {
      try { profiles.abandon(visit.profileId, {id: visit.id, key: visit.key}, playEntry("abandon", game.turn)); }
      catch (error) { reportSaveError(error); return; }
    }
    visit = null;
    startGame(mapDef, fresh);
  }

  var renamingProfile = false;
  function openProfileForm(rename) {
    renamingProfile = !!(rename && activeProfile);
    $("profile-menu").open = false;
    $("profile-error").textContent = "";
    $("profile-dialog-title").textContent = renamingProfile ? "Rename profile" : "New profile";
    $("profile-submit").textContent = renamingProfile ? "Save" : "Create";
    $("profile-name").value = renamingProfile ? activeProfile.name : "";
    $("profile-cancel").classList.toggle("hidden", !activeProfile);
    $("profile-dialog").showModal();
    $("profile-name").focus();
    if (renamingProfile) $("profile-name").select();
  }

  function renderProfile() {
    activeProfile = profiles.ensureDefault();
    var select = $("profile-select"), all = profiles.read().profiles;
    select.replaceChildren();
    all.forEach(function (p) {
      var option = document.createElement("option");
      option.value = p.id; option.textContent = p.name;
      select.appendChild(option);
    });
    select.value = activeProfile ? activeProfile.id : "";
    $("profile-switch").classList.toggle("hidden", all.length < 2);
    $("profile-current").textContent = activeProfile ? activeProfile.name : "no profile";
    $("profile-rename").disabled = !activeProfile;
    var results = activeProfile ? activeProfile.results : [];
    var solo = results.filter(function (r) { return !r.hotseat; });
    var wins = solo.filter(function (r) { return r.outcome === "win"; }).length;
    var losses = solo.length - wins, hotseatCount = results.length - solo.length;
    $("profile-record").textContent = wins + (wins === 1 ? " win · " : " wins · ") +
      losses + (losses === 1 ? " loss · " : " losses · ") + hotseatCount +
      (hotseatCount === 1 ? " hotseat match" : " hotseat matches");
    if (historyProfileId !== (activeProfile && activeProfile.id)) historyLimit = HISTORY_PAGE;
    historyProfileId = activeProfile && activeProfile.id;
  }

  // Text whose numbers stand out from their words: numbers become <strong>.
  function addFigures(node, pieces) {
    pieces.forEach(function (piece) {
      node.appendChild(menuText(typeof piece === "number" ? "strong" : "span", "", String(piece)));
    });
    return node;
  }
  function figures(tag, className, pieces) { return addFigures(menuText(tag, className, ""), pieces); }
  function sideName(options) {
    return options.hotseat ? "Hotseat" : PROFILES.humanSide(options) === 1 ? "Xenon" : "Union";
  }

  // Every unfinished match, newest first, one click from the menu.
  function renderContinue(open) {
    var list = $("continue-list");
    list.replaceChildren();
    open.forEach(function (match) {
      var chip = menuText("button", "continue-chip", "");
      chip.type = "button";
      chip.appendChild(menuText("span", "continue-name", match.state.map.name));
      chip.appendChild(figures("span", "continue-turn", ["turn ", match.state.turn]));
      var side = sideName(match.options), offers = /:offers(:xenon)?(:hotseat)?$/.test(match.key);
      if (side !== "Union" || offers) {
        chip.appendChild(menuText("span", "continue-mode", [side === "Union" ? "" : side, offers ? "Offers" : ""].filter(Boolean).join(" · ")));
      }
      chip.setAttribute("aria-label", "Continue " + match.state.map.name + ", turn " + match.state.turn);
      chip.onclick = function () { closeMenuHelp(); startGame(match.state.map, match.options, match); };
      list.appendChild(chip);
    });
    $("continue-match").classList.toggle("hidden", !open.length);
  }

  // Where each board sits in the menu, for naming it in the history.
  function levelIndex() {
    var index = {};
    levelGroups().forEach(function (group) {
      group.levels.forEach(function (lv, i) {
        index[PROFILES.boardKey(lv, levelOptions(group, i))] = {campaign: group.title, number: i + 1 + (group.offset || 0)};
      });
    });
    return index;
  }
  var HISTORY_EVENTS = {start: "Started", resume: "Resumed", leave: "Left", abandon: "Abandoned", win: "Won", loss: "Lost"};
  function historyTime(at) {
    var date = new Date(at);
    return date.toLocaleString(undefined, {year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"});
  }
  // Every start, resume, exit, restart and result of the profile, newest first.
  function renderHistory(open) {
    var list = $("history-list"), summary = $("history-summary");
    list.replaceChildren(); summary.replaceChildren();
    if (!activeProfile) return;
    var entries = PROFILES.history(activeProfile), where = levelIndex(), count = PROFILES.summary(activeProfile, open);
    addFigures(summary, [count.attempts, count.attempts === 1 ? " attempt · " : " attempts · ",
      count.wins, " won · ", count.losses, " lost · ", count.hotseat, " hotseat · ",
      count.abandoned, " abandoned · ", count.open, " in progress"]);
    entries.slice(0, historyLimit).forEach(function (entry) {
      var row = document.createElement("tr");
      row.className = "history-" + entry.event;
      var place = entry.key && where[PROFILES.boardOf(entry.key)];
      var level = menuText("td", "history-level", "");
      if (place) {
        level.appendChild(menuText("span", "history-campaign", place.campaign + " "));
        level.appendChild(menuText("strong", "history-number", String(place.number).padStart(2, "0") + " "));
      }
      level.appendChild(menuText("span", "history-name", entry.name));
      row.appendChild(menuText("td", "history-time", historyTime(entry.at)));
      row.appendChild(menuText("td", "history-event", entry.event === "hotseat" ?
        (entry.winner === 0 ? "Union won" : "Xenon won") : HISTORY_EVENTS[entry.event]));
      row.appendChild(level);
      var side = sideName({hotseat: entry.hotseat, humanSide: entry.side});
      var sideCell = menuText("td", "history-side", side);
      sideCell.setAttribute("data-side", side.toLowerCase());
      row.appendChild(sideCell);
      row.appendChild(figures("td", "history-turn", ["turn ", entry.turn]));
      var result = entry.event === "win" || entry.event === "loss" || entry.event === "hotseat";
      var detail = result ? PROFILES.reasonLabel(entry.reason) :
        entry.event === "start" && !entry.hotseat ? "vs " + AI_SEARCH.get(entry.opponent).label : "";
      row.appendChild(menuText("td", "history-detail", detail));
      list.appendChild(row);
    });
    $("history-empty").classList.toggle("hidden", entries.length > 0);
    $("history-table").classList.toggle("hidden", !entries.length);
    $("history-count").textContent = entries.length > historyLimit ?
      "Showing the latest " + historyLimit + " of " + entries.length + " events" : "";
    $("history-more").classList.toggle("hidden", historyLimit >= entries.length);
  }

  // Campaigns and History share this page; #history in the address picks the view.
  function showView() {
    var history = location.hash === "#history";
    $("campaigns-view").classList.toggle("hidden", history);
    $("history-view").classList.toggle("hidden", !history);
    $("tab-campaigns").setAttribute("aria-current", history ? "false" : "page");
    $("tab-history").setAttribute("aria-current", history ? "page" : "false");
    fitLevelTiles();
  }
  function switchView() {
    var toHistory = location.hash === "#history";
    if (toHistory === $("campaigns-view").classList.contains("hidden")) return;
    if (toHistory) menuScrollTop = window.scrollY || 0;
    closeMenuHelp();
    showView();
    window.scrollTo(0, toHistory ? 0 : menuScrollTop);
  }

  function openMatch(open, level, options) {
    var key = PROFILES.sessionKey(level, options);
    return open.find(function (match) { return match.key === key; }) || null;
  }
  // Attempts on the board (either side, any Mode), then this entry's own
  // record; null before the first attempt.
  function recordCell(level, options, attempts) {
    var record = PROFILES.levelRecord(activeProfile, level, options), pieces = [];
    function add(number, label) { if (pieces.length) pieces[pieces.length - 1] += " · "; pieces.push(number, label); }
    if (attempts) add(attempts, attempts === 1 ? " attempt" : " attempts");
    if (record.wins || record.losses) { add(record.wins, "W / "); pieces.push(record.losses, "L"); }
    if (record.hotseat) add(record.hotseat, " hotseat");
    if (!pieces.length && levelWasWon(level, options)) return menuText("span", "mission-record", "Cleared");
    return pieces.length ? figures("span", "mission-record", pieces) : null;
  }

  // Caption lines of the menu's level tiles, by collection list.
  var menuTiles = [];
  // Every tile in a collection is as wide as the collection's longest caption,
  // so each caption keeps one line and the map picture fills the rest. All
  // widths are read before any is set, so the page lays out once.
  function fitLevelTiles() {
    if ($("campaigns-view").classList.contains("hidden")) return;
    var widths = menuTiles.map(function (collection) {
      return collection.captions.reduce(function (width, caption) { return Math.max(width, caption.offsetWidth); }, 0);
    });
    menuTiles.forEach(function (collection, i) { collection.list.style.setProperty("--caption-width", widths[i] + "px"); });
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
    return options.opening || $("opening-select").value;
  }

  function preferredOpponent() {
    var id = $("menu-opponent").value || "classic";
    try { id = localStorage.getItem("nectaris-opponent") || id; } catch (e) { /* optional preference */ }
    return id;
  }

  // Open a level. Each board has one unfinished match per side, Mode and
  // number of players; opening the level again resumes it. `saved` resumes a
  // particular match (from Continue).
  function startGame(mapDef, opts, saved) {
    if (!activeProfile) { openProfileForm(); return; }
    if (!leaveMatch()) return;
    opts = Object.assign({}, opts || {});
    var profile, game, key;
    try {
      profile = profiles.active();
      if (!profile || profile.id !== activeProfile.id) throw new Error("Profile changed. Return to the menu and choose your profile.");
      if (!saved) {
        opts.opening = openingMode(opts); delete opts.balance;
        // Every launch states its side; a hotseat match is Union's by convention.
        opts.humanSide = PROFILES.humanSide(opts);
        key = PROFILES.sessionKey(mapDef, opts);
        saved = profiles.session(profile.id, key);
      }
    } catch (error) { reportSaveError(error); return; }
    var chosen = opts;
    try {
      if (saved) {
        key = saved.key;
        opts = Object.assign({}, saved.options);
        if (!opts.opponent || (opts.opening !== "original" && opts.opening !== "offers")) {
          throw new Error("This saved match is from an older version and cannot be loaded.");
        }
        opts.humanSide = PROFILES.humanSide(opts);
      }
      opts.opponent = AI_SEARCH.get(saved ? opts.opponent : opts.opponent || preferredOpponent()).id;
      if (mapDef.customUnits) mergeUnitTypes(mapDef.customUnits);
      game = saved ? ENGINE.Game.restore(saved.state) : new ENGINE.Game(mapDef, { seed: opts.seed, firstPlayer: opts.humanSide });
    } catch (error) {
      // A save this version cannot open would block its board for good; the
      // player may give it up and start the level again.
      if (saved && window.confirm(error.message + " Give up this saved match and start " + mapDef.name + " again?")) {
        try {
          profiles.abandon(profile.id, saved, {at: new Date().toISOString(), event: "abandon", match: saved.id, key: saved.key,
            name: mapDef.name, side: PROFILES.humanSide(saved.options), hotseat: !!saved.options.hotseat,
            opponent: saved.options.opponent, turn: saved.state.turn});
        } catch (abandonError) { reportSaveError(abandonError); return; }
        startGame(mapDef, freshOptions(saved.key, chosen));
        return;
      }
      reportSaveError(error); return;
    }
    if (currentSetup) currentSetup.destroy();
    currentSetup = null;
    if (currentUI) currentUI.destroy();
    currentUI = null;
    if (!$("menu-screen").classList.contains("hidden")) menuScrollTop = window.scrollY || 0;
    $("menu-screen").classList.add("hidden");
    $("game-screen").classList.add("hidden");
    // `negotiated`: the Offer for first questions have been answered, which
    // already counts as starting the match.
    function launchGame(negotiated) {
      if (currentSetup) currentSetup.destroy();
      currentSetup = null;
      if (currentUI) currentUI.destroy();
      currentUI = null;
      currentOptions = opts;
      visit = {id: saved ? saved.id : PROFILES.newId(), profileId: profile.id, key: key, mapDef: mapDef,
        resumed: !!saved, acted: false, baseline: null};
      if (!$("menu-screen").classList.contains("hidden")) menuScrollTop = window.scrollY || 0;
      $("menu-screen").classList.add("hidden");
      $("game-screen").classList.remove("hidden");
      $("gameover-panel").classList.add("hidden");
      var mission = missionInfo(mapDef, opts);
      $("status-campaign").textContent = mission.campaign;
      $("status-mission-number").textContent = mission.number === null ? "" : String(mission.number).padStart(2, "0");
      $("map-title").textContent = mapDef.name;
      $("map-title").title = mapDef.name;
      var balanceLabel=$("balance-match-label");
      balanceLabel.classList.toggle("hidden",!game.balance);
      balanceLabel.textContent=game.balance ? (game.firstPlayer===0?"Union":"Xenon")+" first · "+
        (game.balance.secondPlayer===0?"Union":"Xenon")+" bonus: "+game.balance.label : "";

      currentUI = new UI.GameUI($("game-canvas"), game, {
        hotseat: !!opts.hotseat,
        humanSide: opts.humanSide,
        opponent: opts.opponent,
        undoHistory: saved && saved.state.undoHistory,
        redoHistory: saved && saved.state.redoHistory,
        onMenu: showMenu,
        onStateChange: saveMatch,
        onGameOver: function (winner) {
          var recorded = saveMatch(currentUI);
          $("gameover-record").textContent = (opts.hotseat ?
            (winner === 0 ? "Union victory" : "Xenon victory") : (winner === opts.humanSide ? "Victory" : "Defeat")) +
            (recorded ? " · Recorded for " + profile.name : " · Not saved yet — keep this page open");
          // Replay and Next mission stay in this match's side, players and Mode;
          // a board with an unfinished match in that slot resumes it.
          var slot = freshOptions(key, opts);
          $("gameover-again").onclick = function () { startGame(mapDef, slot); };
          $("gameover-menu").onclick = function () { showMenu(); };
          var next = $("gameover-next");
          var terrain = terrainCampaign(opts.environmentCampaign);
          if (terrain && opts.environmentIndex + 1 < terrain.levels.length) {
            next.classList.remove("hidden");
            next.onclick = function () {
              var ni = opts.environmentIndex + 1;
              startGame(terrain.levels[ni], {environmentCampaign:terrain.id, environmentIndex:ni,
                hotseat:!!opts.hotseat, humanSide:opts.humanSide, opponent:opts.opponent, opening:slot.opening});
            };
          } else if (opts.campaignIndex !== undefined && opts.campaignIndex + 1 < ORIGINAL_CAMPAIGN.length) {
            next.classList.remove("hidden");
            next.onclick = function () {
              var ni = opts.campaignIndex + 1;
              startGame(ORIGINAL_CAMPAIGN[ni], { campaignIndex: ni, hotseat: !!opts.hotseat, humanSide: opts.humanSide, opening:slot.opening });
            };
          } else {
            next.classList.add("hidden");
            next.onclick = null;
          }
        },
      });
      currentUI.resize();
      if (negotiated) {
        visit.acted = true;
        try { logEvent("start", game.turn); } catch (error) { reportSaveError(error); }
      }
      saveMatch(currentUI);
      if (game.winner !== null) currentUI.checkGameOver();
      else if (!opts.hotseat && game.currentPlayer !== opts.humanSide) currentUI.beginAITurn();
    }
    if (!saved && opts.opening==="offers") {
      currentSetup=new BALANCE_UI.Setup(game,{hotseat:!!opts.hotseat,humanSide:opts.humanSide,opponent:opts.opponent,onCancel:showMenu,onStart:function(result,plan){
        try {
          if(result)opts.balance=BALANCE.apply(game,plan,result);
          else opts.opening="original";
          launchGame(true);
        } catch(error) {reportSaveError(error);}
      }});
    } else launchGame(false);
  }

  function showMenu() {
    if (!leaveMatch()) return;
    if (currentSetup) currentSetup.destroy();
    currentSetup = null;
    if (currentUI) currentUI.destroy();
    currentUI = null;
    $("game-screen").classList.add("hidden");
    $("menu-screen").classList.remove("hidden");
    try {$("menu-opponent").value=AI_SEARCH.get(localStorage.getItem("nectaris-opponent")||"classic").id;}catch(e){}
    buildMenu();
    showView();
    window.scrollTo(0, $("campaigns-view").classList.contains("hidden") ? 0 : menuScrollTop);
  }

  var LABELS = {
    source: "Level source ↗", collectionSource: "Collection notes ↗", play: "Play",
    briefing: "Briefing", design: "Design notes", author: "Made by", sourceFile: "Terrain file",
    lastMatch: "Last match", collection: "About this collection",
  };

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
  function safeSource(source) {
    if (!source) return false;
    try { var url = new URL(source, document.baseURI); } catch (error) { return false; }
    return url.protocol === "https:" || url.protocol === "http:" ||
      (url.protocol === "file:" && location.protocol === "file:");
  }
  function addHelpSource(panel, source, label) {
    if (!safeSource(source)) return;
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
  // Campaign name and menu number for the match panel, resolved from the same
  // options the menu builds so a resumed match names itself identically.
  function missionInfo(mapDef, opts) {
    var group = levelGroups().find(function (candidate) {
      if (candidate.environmentCampaign) return candidate.environmentCampaign === opts.environmentCampaign;
      if (!candidate.pack || opts[candidate.pack] === undefined) return false;
      var index = opts[candidate.pack] - (candidate.offset || 0);
      return index >= 0 && index < candidate.levels.length;
    });
    if (group) return {campaign: group.title, number: opts[group.pack] + 1};
    var at = getCustomLevels().findIndex(function (level) { return level.name === mapDef.name; });
    return at >= 0 ? {campaign: "Custom levels", number: at + 1} : {campaign: "Play test", number: null};
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
      !!(activeProfile && options.opening!=="offers" && options.campaignIndex !== undefined && PROFILES.humanSide(options) === 0 &&
        activeProfile.cleared.indexOf(options.campaignIndex) >= 0);
  }
  // The original game's campaigns had no briefings, so they show no help at all.
  function levelGroups() {
    return [
      {id:"normal", list:"mission-list", title:"Normal campaign", intro:"From the PC Engine campaign.",
        levels:CAMPAIGN, pack:"campaignIndex", originalGame:true},
      {id:"advanced", list:"advanced-mission-list", title:"Advanced campaign",
        levels:ADVANCED_CAMPAIGN, pack:"campaignIndex", offset:CAMPAIGN.length, originalGame:true},
      {id:"basenec", list:"basenec-list", title:"Base Nectaris",
        intro:"Community terrain, with new forces and briefings for this remake.",
        levels:BASE_NECTARIS_LEVELS, pack:"baseNecIndex",
        notes:"Terrain by Crescent (BASE NECTARIS), from the unit-free Windows map files whose download page permits placing units and reposting the result. Rosters, deployments and briefings are this project's. Other archive scenarios and commentary are not part of this import.",
        source:"LEVEL_SOURCES.md#included-pack-base-nectaris-terrain-added-2026-09-01"},
    ].concat(ENVIRONMENT_CAMPAIGNS.map(function (campaign) {
      return {id:campaign.id, list:campaign.id+"-list", title:campaign.name,
        levels:campaign.levels, pack:"environmentIndex", environmentCampaign:campaign.id,
        notes:campaign.description+" "+campaign.notes,
        source:"ENVIRONMENT_CAMPAIGNS.md#"+campaign.id};
    }), [
      {id:"ai-made", list:"ai-made-list", title:"AI-made",
        levels:AI_MADE_LEVELS, pack:"aiMadeIndex",
        notes:"Original battlefields made to the project owner's specifications. Each part keeps its own layout, starting forces and factory inventories. Later maps explore different route structures rather than replacing earlier levels.",
        source:"PRODUCT.md#ai-made-fjord-levels-2026-09-22"},
      {id:"expansion", list:"expansion-list", title:"Lunar Frontiers",
        levels:EXPANSION_LEVELS, pack:"expansionIndex",
        notes:"Original maps by Nectaris Remake contributors. Each level's notes explain its design focus and link to the source data; these layouts do not reproduce the original campaign or community archive maps.",
        source:"LEVEL_SOURCES.md#included-online-expansion-lunar-frontiers"},
      {id:"custom", list:"custom-list", title:"Custom levels", levels:getCustomLevels(),
        notes:"Create a map in the editor, import a JSON file, or install a level from a URL. Custom maps can include their own units and rules data. Briefings and attribution appear here when provided by their author.",
        source:"LEVEL_SOURCES.md#installing-levels-from-the-web"}
    ]);
  }
  function levelHasHelp(group, lv) {
    return !group.originalGame && !!(lv.description || lv.blurb || lv.special ||
      (lv.tags && lv.tags.length) || lv.author || lv.sourceFile || safeSource(lv.source));
  }
  // The same level from the other side: the player commands Xenon and moves
  // first; the AI plays Union. A small mark over the picture's corner, since
  // the tile itself plays Union. It has its own record and unfinished match,
  // and hotseat has no "other side".
  function sideButton(level, options, name, open) {
    var xenon = Object.assign({}, options, {humanSide: 1, hotseat: false});
    var won = PROFILES.levelRecord(activeProfile, level, xenon).wins > 0, match = openMatch(open, level, xenon);
    var button = menuText("button", "level-play-xenon", "");
    button.appendChild(menuText("span", "xenon-mark", ""));
    if (won) button.appendChild(menuText("span", "xenon-won", "✓"));
    if (match) button.appendChild(figures("span", "xenon-turn", ["turn ", match.state.turn]));
    button.type = "button";
    button.setAttribute("aria-label", (match ? "Resume " : LABELS.play + " ") + name + " as Xenon" + (won ? ", already won" : ""));
    button.title = (match ? "Resume as Xenon, turn " + match.state.turn : "Play as Xenon") + (won ? " (won as Xenon)" : "");
    button.onclick = function () { closeMenuHelp(); startGame(level, xenon); };
    return button;
  }
  // One tile per level: the map picture over one caption line. Returns the
  // captions, which set the collection's tile width.
  function renderLevelCards(host, group, open, attempts) {
    var L = LABELS, hotseat = $("chk-hotseat").checked;
    return group.levels.map(function (lv, i) {
      var options = levelOptions(group, i), name = lv.name, help = levelHasHelp(group, lv);
      var match = openMatch(open, lv, Object.assign({}, options, {hotseat: hotseat, humanSide: 0}));
      var card = document.createElement("article");
      card.className = "level-card";
      var play = menuText("button", "level-play", "");
      play.type = "button"; play.setAttribute("aria-label", (match ? "Resume " : L.play + " ") + name);
      play.title = hotseat ? (match ? "Resume hotseat match" : "Play hotseat") : (match ? "Resume as Union" : "Play as Union");
      play.onclick = function () {
        closeMenuHelp(); startGame(lv, Object.assign({}, options, {hotseat: $("chk-hotseat").checked, humanSide: 0}));
      };
      var picture = menuText("span", "level-thumb", "");
      picture.appendChild(MAP_THUMBNAIL.picture(lv));
      var caption = menuText("span", "level-caption", "");
      var title = menuText("span", "level-card-heading", name);
      title.id = group.id + "-level-" + i;
      card.setAttribute("aria-labelledby", title.id);
      caption.appendChild(menuText("span", "level-number", String(i + 1 + (group.offset || 0)).padStart(2, "0")));
      caption.appendChild(title);
      if (match) caption.appendChild(figures("span", "level-resume", ["Resume turn ", match.state.turn]));
      var record = recordCell(lv, options, attempts ? attempts(lv, options) : 0);
      if (record) caption.appendChild(record);
      play.appendChild(picture); play.appendChild(caption);
      card.appendChild(play);
      if (!hotseat) card.appendChild(sideButton(lv, options, name, open));
      if (help) card.appendChild(createMenuHelp(title.id + "-details", name, function (panel) {
        addHelpText(panel, L.briefing, lv.description || lv.blurb);
        addHelpText(panel, L.design, lv.special);
        if (lv.tags && lv.tags.length) panel.appendChild(menuText("p", "level-tags", lv.tags.join(" · ")));
        addHelpText(panel, L.author, lv.author);
        if (lv.sourceFile) addHelpText(panel, L.sourceFile, lv.sourceFile);
        var record = PROFILES.levelRecord(activeProfile, lv, options);
        if (record.latest) addHelpText(panel, L.lastMatch, PROFILES.outcomeLabel(record.latest) +
          " · " + PROFILES.reasonLabel(record.latest.reason) + " · Turn " + record.latest.turn);
        addHelpSource(panel, lv.source || group.source, lv.source ? L.source : L.collectionSource);
      }));
      host.appendChild(card);
      return caption;
    });
  }
  function buildMenu() {
    closeMenuHelp();
    var open = [], attempts = null;
    try {
      renderProfile();
      open = profiles.sessions(activeProfile.id);
      attempts = PROFILES.attemptCounts(activeProfile, open);
    } catch (error) { reportSaveError(error); }
    renderContinue(open);
    try { renderHistory(open); } catch (error) { reportSaveError(error); }
    // Detach import controls before replacing their collection, preserving events and entered URLs.
    var customTools = $("custom-level-tools");
    customTools.remove();
    var host = $("level-groups"), nav = $("level-groups-nav");
    host.replaceChildren(); nav.replaceChildren();
    menuTiles = [];
    levelGroups().forEach(function (group) {
      var section = document.createElement("section");
      section.className = "level-group"; section.id = group.id + "-section";
      section.setAttribute("aria-labelledby", group.id + "-heading");
      var heading = document.createElement("header"); heading.className = "level-group-header";
      var title = menuText("h2", "", group.title); title.id = group.id + "-heading";
      heading.appendChild(title);
      var won = group.levels.filter(function (lv,i) { return levelWasWon(lv, levelOptions(group,i)); }).length;
      heading.appendChild(menuText("span", "group-progress", group.levels.length ? won + " / " + group.levels.length + " won" : "No levels yet"));
      if (group.intro) heading.appendChild(menuText("p", "level-group-intro", group.intro));
      if (group.notes) heading.appendChild(createMenuHelp(group.id + "-details", group.title, function (panel) {
        addHelpText(panel, LABELS.collection, group.notes);
        addHelpSource(panel, group.source, LABELS.collectionSource);
      }));
      section.appendChild(heading);
      var list = document.createElement("div"); list.id = group.list;
      list.className = "level-library";
      list.addEventListener("scroll", closeMenuHelp);
      menuTiles.push({list: list, captions: renderLevelCards(list, group, open, attempts)});
      section.appendChild(list);
      if (!group.levels.length) list.appendChild(menuText("p", "empty-levels", "No levels yet. Create a battlefield or import one below."));
      if (group.id === "custom") section.appendChild(customTools);
      host.appendChild(section);
      var jump = menuText("a", "", group.title);
      jump.href = "#" + section.id;
      jump.appendChild(menuText("span", "", String(group.levels.length)));
      nav.appendChild(jump);
    });
    fitLevelTiles();
  }

  function showImportStatus(className, text) {
    var status = $("level-import-status");
    status.className = className;
    status.textContent = text;
  }

  function importLevelFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var lv = JSON.parse(reader.result);
        if (lv.customUnits) mergeUnitTypes(lv.customUnits);
        // Validate by constructing a game; a bad file throws with a clear message.
        new ENGINE.Game(lv, { dice: null });
        var customs = getCustomLevels();
        var replaced = false;
        for (var i = 0; i < customs.length; i++) {
          if (customs[i].name === lv.name) { customs[i] = lv; replaced = true; }
        }
        if (!replaced) customs.push(lv);
        localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(customs));
        showImportStatus("success", "Installed 1 level.");
        buildMenu();
      } catch (error) {
        showImportStatus("error", file.name + ": " + error.message);
      }
    };
    reader.onerror = function () { showImportStatus("error", file.name + ": " + reader.error.message); };
    reader.readAsText(file);
  }

  function installOnlineLevels(url) {
    showImportStatus("", "Downloading…");
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
        new ENGINE.Game(lv, { dice: null });
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
      showImportStatus("success", "Installed " + levels.length + " level" + (levels.length === 1 ? "" : "s") + ".");
      buildMenu();
    }).catch(function (error) {
      showImportStatus("error", error.message);
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    var opponent=$("menu-opponent");
    AI_SEARCH.modes.forEach(function(mode){var option=document.createElement("option");option.value=mode.id;option.textContent=mode.label;opponent.appendChild(option);});
    opponent.value="classic";
    try{opponent.value=AI_SEARCH.get(localStorage.getItem("nectaris-opponent")||"classic").id;}catch(e){}
    opponent.onchange=function(){try{localStorage.setItem("nectaris-opponent",opponent.value);}catch(e){}};
    // Hotseat matches are their own slot, so the tiles show that slot's records.
    $("chk-hotseat").onchange=function(){
      opponent.disabled=this.checked;
      buildMenu();
    };
    var openingSelect=$("opening-select"),opening=null;
    try {opening=localStorage.getItem("nectaris-opening");} catch(e) { /* optional preference */ }
    // Unset preferences and the removed "auto" map-default mode start Normal.
    openingSelect.value=opening==="offers" ? "offers" : "original";
    openingSelect.onchange=function(){
      try {localStorage.setItem("nectaris-opening",openingSelect.value);} catch(e) { /* optional preference */ }
      buildMenu();
    };
    window.addEventListener("scroll", closeMenuHelp);
    window.addEventListener("resize", closeMenuHelp);
    var profileMenu = $("profile-menu");
    document.addEventListener("pointerdown", function (event) {
      if (activeMenuHelp && !activeMenuHelp.wrap.contains(event.target)) closeMenuHelp();
      if (profileMenu.open && !profileMenu.contains(event.target)) profileMenu.open = false;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && activeMenuHelp) {
        activeMenuHelp.button.focus();
        closeMenuHelp(); event.stopPropagation();
      } else if (event.key === "Escape" && profileMenu.open) {
        profileMenu.open = false; event.stopPropagation();
      }
    });
    try { profiles = new PROFILES.Store(localStorage); activeProfile = profiles.ensureDefault(); }
    catch (error) { reportSaveError(error); }
    $("profile-form").onsubmit = function (event) {
      event.preventDefault();
      try {
        if (!profiles) profiles = new PROFILES.Store(localStorage);
        if (renamingProfile) profiles.rename(activeProfile.id, $("profile-name").value);
        else activeProfile = profiles.create($("profile-name").value);
        $("profile-dialog").close();
        $("save-error").classList.add("hidden");
        buildMenu();
      } catch (error) { $("profile-error").textContent = error.message; }
    };
    $("profile-dialog").addEventListener("cancel", function (event) {
      if (!activeProfile) event.preventDefault();
    });
    $("profile-cancel").onclick = function () { $("profile-dialog").close(); };
    $("profile-new").onclick = function () { openProfileForm(false); };
    $("profile-rename").onclick = function () { openProfileForm(true); };
    $("history-more").onclick = function () {
      historyLimit += HISTORY_PAGE;
      try { renderHistory(profiles.sessions(activeProfile.id)); } catch (error) { reportSaveError(error); }
    };
    $("profile-select").onchange = function () {
      try { profiles.switchTo(this.value); profileMenu.open = false; buildMenu(); }
      catch (error) { reportSaveError(error); }
    };
    $("btn-restart").onclick = restartMatch;
    // The History tab changes only the address's #history; Campaigns clears it
    // without reloading the page.
    $("tab-campaigns").onclick = function (event) {
      if (location.hash !== "#history") return;
      event.preventDefault();
      window.history.pushState(null, "", location.pathname + location.search);
      switchView();
    };
    window.addEventListener("hashchange", switchView);
    window.addEventListener("popstate", switchView);
    // Closing the page is leaving the match. The browser may restore the page
    // from its cache, and carrying on from there is a resume.
    window.addEventListener("pagehide", function () {
      if (!visit || !saveMatch(currentUI)) return;
      try { if (visit.acted && currentUI.game.winner === null) logEvent("leave", currentUI.game.turn); }
      catch (error) { reportSaveError(error); return; }
      if (visit.acted) visit.resumed = true;
      visit.acted = false;
      var state = currentUI.snapshotForSave();
      visit.baseline = state && playerHasControl(state) ? JSON.stringify(state) : null;
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") saveMatch(currentUI);
    });
    window.addEventListener("storage", function (event) {
      try {
        var mine = !!visit && (event.key === null || event.key === PROFILES.sessionName(visit.profileId, visit.key) ||
          (event.key === PROFILES.KEY && profiles.read().activeId !== visit.profileId));
        if (mine) {
          // Another tab owns the newest save of this match: stop here without overwriting it.
          visit = null;
          showMenu();
          reportSaveError(new Error("This match changed in another tab. Open it again to continue from the latest save."));
        } else if (!$("menu-screen").classList.contains("hidden") &&
            (event.key === null || event.key === PROFILES.KEY || event.key.indexOf(PROFILES.SESSION_PREFIX) === 0)) {
          buildMenu();
        }
      } catch (error) { reportSaveError(error); }
    });
    loadCustomUnits();
    MUSIC.init();
    SFX.init();
    $("file-import").onchange = function (e) {
      if (e.target.files[0]) importLevelFile(e.target.files[0]);
      e.target.value = "";
    };
    $("btn-online-import").onclick = function () {
      var url = $("online-level-url").value.trim();
      if (!url) {
        showImportStatus("error", "Enter a level JSON URL.");
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
