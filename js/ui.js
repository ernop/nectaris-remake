/* Nectaris remake — game UI: input handling, action flow, panels.
 *
 * Interaction model (mirrors the original's flow, minus its screen limits):
 *   click own unit  -> show legal movement and attack targets immediately
 *   Attack          -> aim from the current hex without moving
 *   click dest hex  -> unit steps there; enemies stay directly clickable
 *   hover red enemy -> inspect calculations and independent casualty forecast
 *   click red enemy -> resolve from the chosen position
 *   move destination -> commit movement; attack now or finish on deselection
 *   Undo last       -> reverse noncombat actions since the last battle/turn
 * Right-click cancels or undoes; Esc cancels. Wheel zooms; Ctrl+left-drag pans.
 */
"use strict";

var UI = (function () {
  var unitView = typeof module !== "undefined" ? require("./unit-view.js") : UNIT_VIEW;
  var timeline = typeof module !== "undefined" ? require("./playback-timeline.js") : PLAYBACK_TIMELINE;
  var movement = typeof module !== "undefined" ? require("./move-animation.js") : MOVE_ANIMATION;
  var battleReport = typeof module !== "undefined" ? require("./battle-report.js") : BATTLE_REPORT;
  var opponents = typeof module !== "undefined" ? require("./ai-search.js") : AI_SEARCH;

  function $(id) { return document.getElementById(id); }
  function factionTextColor(player) {
    return player === 0 ? "var(--union-color)" : player === 1 ? "var(--xenon-color)" : "var(--ui-text)";
  }
  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function actionButton(parent, label, fn, disabled) {
    var button = document.createElement("button");
    button.textContent = label;
    button.disabled = !!disabled;
    button.onclick = function () { if (!button.disabled) fn(); };
    parent.appendChild(button);
    return button;
  }

  /* Human-readable attack band vs one domain, e.g. "1", "2–5", or "—". */
  function bandText(unitType, targetIsAir) {
    var band = COMBAT.rangeBand(unitType, targetIsAir);
    if (!band) return "—";
    return band.min === band.max ? "" + band.max : band.min + "–" + band.max;
  }

  function GameUI(canvas, game, options) {
    var self = this;
    this.canvas = canvas;
    this.game = game;
    this.options = options || {};
    this.opponent = opponents.get(this.options.opponent || "apex").id;
    this.renderer = new RENDER.Renderer(canvas, game);
    this.renderer.orientation = "auto";
    this.controlsPosition = "left";
    try {
      var orientation = localStorage.getItem("nectaris-board-orientation");
      if (["auto", "normal", "sideways"].indexOf(orientation) >= 0) this.renderer.orientation = orientation;
    } catch (e) { /* optional view preferences */ }
    this.mode = "idle"; // idle | command | unitSelected (movement) | moved (aim) | unload | factory | deployPick | battle | aiTurn | over
    this.selected = null;
    this.range = null;
    this.undoHistory = JSON.parse(JSON.stringify(this.options.undoHistory || []));
    this.redoHistory = JSON.parse(JSON.stringify(this.options.redoHistory || []));
    this.busy = false;
    this.destroyed = false;
    this.watchAI = localStorage.getItem("nectaris-watch-ai") !== "off";
    this.animateMoves = localStorage.getItem("nectaris-animate-moves") !== "off";
    this.warLedger = battleReport.emptyLedger();
    this.onGameOver = this.options.onGameOver || function () {};
    this.refreshViewControls();

    // Keep exact function references so destroy() can remove every listener.
    // Starting a second map used to leave the first map's listeners alive;
    // both renderers then painted the same canvas, producing visible flashing.
    this.handlers = {
      resize: function () { self.resize(); },
      mousedown: function (e) { self.onMouseDown(e); },
      mousemove: function (e) { self.onMouseMove(e); },
      mouseleave: function () { self.onMouseLeave(); },
      mouseup: function (e) { self.onMouseUp(e); },
      windowMouseup: function () { self.dragging = null; self.updateMapCursor(); },
      windowMousemove: function (e) {
        if (!self.dragging || e.target === canvas) return;
        var rect = canvas.getBoundingClientRect();
        self.onMouseMove({ offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, ctrlKey: e.ctrlKey });
      },
      wheel: function (e) { self.onWheel(e); },
      contextmenu: function (e) { self.onContextMenu(e); },
      keydown: function (e) { self.onKey(e); },
      keyup: function (e) { self.ctrlDown = e.ctrlKey; self.updateMapCursor(); },
      blur: function () { self.ctrlDown = false; self.dragging = null; self.updateMapCursor(); },
    };

    this.resize();
    window.addEventListener("resize", this.handlers.resize);
    window.addEventListener("mouseup", this.handlers.windowMouseup);
    window.addEventListener("mousemove", this.handlers.windowMousemove);
    canvas.addEventListener("mousedown", this.handlers.mousedown);
    canvas.addEventListener("mousemove", this.handlers.mousemove);
    canvas.addEventListener("mouseleave", this.handlers.mouseleave);
    canvas.addEventListener("mouseup", this.handlers.mouseup);
    canvas.addEventListener("wheel", this.handlers.wheel, { passive: false });
    $("game-screen").addEventListener("contextmenu", this.handlers.contextmenu);
    document.addEventListener("keydown", this.handlers.keydown);
    document.addEventListener("keyup", this.handlers.keyup);
    window.addEventListener("blur", this.handlers.blur);
    // Keep canvas dimensions in sync when the inspector or action strip changes.
    if (typeof ResizeObserver !== "undefined") {
      this._layoutObserver = new ResizeObserver(function () {
        if (canvas.clientWidth && canvas.clientHeight &&
            (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight)) self.resize();
      });
      this._layoutObserver.observe(canvas.parentElement);
    }

    $("btn-battle-pause").onclick = function () { self.toggleBattlePause(); };
    $("battle-stage").onclick = function (e) {
      if (!e.target.closest("button")) self.advanceBattle();
    };
    $("btn-battle-map").onclick = function () {
      var stage = $("battle-stage"), hidden = stage.classList.contains("hidden");
      stage.classList[hidden ? "remove" : "add"]("hidden");
      this.textContent = hidden ? "Show map" : "Show battle";
    };
    $("board-orientation").onchange = function () {
      self.renderer.orientation = this.value;
      try { localStorage.setItem("nectaris-board-orientation", this.value); } catch (e) { /* optional preference */ }
      self.fitBoard();
    };
    $("btn-fit").onclick = function () { self.fitBoard(); };
    $("btn-undo").onclick = function () { self.undoLast(); };
    $("btn-redo").onclick = function () { self.redoLast(); };
    $("btn-endturn").onclick = function () { self.endTurn(); };
    $("btn-keep-playing").onclick = function () { self.cancelEndTurn(); };
    $("btn-confirm-endturn").onclick = function () { self.endTurn(true); };
    this.cancelEndTurn();
    $("btn-menu").onclick = this.options.onMenu || function () { location.reload(); };
    $("btn-watch").onclick = function () {
      self.watchAI = !self.watchAI;
      localStorage.setItem("nectaris-watch-ai", self.watchAI ? "on" : "off");
      self.refreshWatchButton();
    };
    $("btn-animate").onclick = function () {
      self.animateMoves = !self.animateMoves;
      localStorage.setItem("nectaris-animate-moves", self.animateMoves ? "on" : "off");
      self.refreshWatchButton();
    };

    // The opponent is chosen before the match and stays fixed until it ends.
    var opponentLabel = $("status-opponent");
    opponentLabel.textContent = this.options.hotseat ? "Two players (hotseat)" :
      "Opponent: " + opponents.get(this.opponent).label;
    opponentLabel.title = this.options.hotseat ? "" : opponents.get(this.opponent).description;

    var styleSel = $("style-select");
    var iconSel = $("icon-set-select");
    iconSel.innerHTML = "";
    RENDER.getIconSets().forEach(function (pack) {
      var option = document.createElement("option");
      option.value = pack.id; option.textContent = pack.label; iconSel.appendChild(option);
    });
    iconSel.value = RENDER.getIconSet();
    iconSel.disabled = RENDER.getStyle() !== "pixel";
    iconSel.onchange = function () { RENDER.setIconSet(iconSel.value); };
    this._unsubscribeIconSet = RENDER.onIconSetChange(function () {
      iconSel.value = RENDER.getIconSet();
      self.fitBoard();
      if (self.mode === "factory" && self.inspectedFactory) self.openFactoryPanel(self.inspectedFactory);
      self.draw();
    });
    styleSel.value = RENDER.getStyle();
    styleSel.onchange = function () {
      RENDER.setStyle(styleSel.value);
      iconSel.disabled = RENDER.getStyle() !== "pixel";
      self.fitBoard();
      if (self.mode === "factory" && self.inspectedFactory) self.openFactoryPanel(self.inspectedFactory);
      self.refreshStatus();   // faction names/colors differ per style
      self.draw();
    };

    this.refreshStatus();
    this.refreshWatchButton();
    this.renderer.fitToMap();
    this.draw();
  }

  GameUI.prototype.snapshotForSave = function () {
    // Animated AI iterators have private, half-completed actions. Keep the
    // pre-AI checkpoint until the complete turn has resolved.
    if (this.mode === "aiTurn") return null;
    var state = this.game.snapshot();
    if (this.undoHistory && this.undoHistory.length) state.undoHistory = this.undoHistory;
    if (this.redoHistory && this.redoHistory.length) state.redoHistory = this.redoHistory;
    return state;
  };

  GameUI.prototype.recordUndo = function (state, label) {
    // The map and roster are constant within a match. Store only dynamic state
    // so a long move history does not duplicate those definitions in the save.
    delete state.map; delete state.types;
    if (!this.undoHistory) this.undoHistory = [];
    this.undoHistory.push({ state: state, label: label });
    this.redoHistory = [];
    this.refreshUndoButton();
  };

  GameUI.prototype.canUndo = function () {
    return this.canRestoreHistory(this.undoHistory);
  };

  GameUI.prototype.canRedo = function () {
    return this.canRestoreHistory(this.redoHistory);
  };

  GameUI.prototype.canRestoreHistory = function (history) {
    var entry = history && history[history.length - 1];
    return !!entry && !this.busy && this.game.winner === null &&
      this.mode !== "aiTurn" && this.mode !== "battle" && this.mode !== "over" &&
      entry.state.turn === this.game.turn && entry.state.currentPlayer === this.game.currentPlayer;
  };

  GameUI.prototype.refreshUndoButton = function () {
    var self = this;
    ["undo", "redo"].forEach(function (action) {
      var button = $("btn-" + action), history = self[action + "History"];
      var enabled = self.canRestoreHistory(history), label = action === "undo" ? "Undo" : "Redo";
      button.disabled = !enabled;
      button.textContent = (action === "undo" ? "↶ " : "↷ ") + label;
      button.title = enabled ? label + " " + history[history.length - 1].label : "Nothing to " + action;
    });
  };

  GameUI.prototype.clearUndo = function () {
    this.undoHistory = [];
    this.redoHistory = [];
    this.refreshUndoButton();
  };

  GameUI.prototype.undoLast = function () {
    this.restoreHistory("undoHistory", "redoHistory");
  };

  GameUI.prototype.redoLast = function () {
    this.restoreHistory("redoHistory", "undoHistory");
  };

  GameUI.prototype.restoreHistory = function (from, to) {
    this.cancelEndTurn();
    if (!this.canRestoreHistory(this[from])) return;
    var entry = this[from][this[from].length - 1];
    var current = this.game.snapshot();
    var restored = ENGINE.Game.restore(Object.assign({}, entry.state, {map: current.map, types: current.types}));
    delete current.map; delete current.types;
    if (!this[to]) this[to] = [];
    this[to].push({state: current, label: entry.label});
    this[from].pop();
    this.closeFactoryPanel();
    this.deployPending = null; this.unloadCargo = null;
    // Keep the match object shared with main.js and the renderer; restore all
    // unit/cargo/building identities together, never individual coordinates.
    Object.assign(this.game, restored);
    this.renderer.game = this.game;
    this.clearSelection();
    this.refreshStatus();
    this.updateHoverInfo();
  };

  GameUI.prototype.syncBitmap = function (refit) {
    if (!this.canvas) return;
    var canvas = this.canvas, wrap = canvas.parentElement;
    var width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) {
      if (!wrap) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
    }
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    if (!this.renderer || typeof this.renderer.fitToMap !== "function") return;
    if (refit) this.renderer.fitToMap();
    else if (typeof this.renderer.constrainView === "function") this.renderer.constrainView();
    this.draw();
  };

  GameUI.prototype.resize = function () {
    if (this.controlsPosition) this.refreshViewControls();
    this.syncBitmap(true);
  };

  GameUI.prototype.refreshViewControls = function () {
    this.controlsDock = "left";
    $("game-screen").classList.add("controls-left");
    $("board-orientation").value = this.renderer.orientation;
    var parent = $("dock-unit-controls");
    ["range-legend", "action-menu"].forEach(function (id) {
      var el = $(id);
      if (el.parentElement !== parent) parent.appendChild(el);
    });
    this._actionRailHeight = 0;
    $("map-action-rail").classList.add("hidden");
  };

  GameUI.prototype.fitBoard = function () {
    this.renderer.hoverHex = null;
    $("unit-hover").classList.add("hidden");
    this.resize();
  };

  GameUI.prototype.draw = function () {
    var self = this;
    this.updateMapCursor();
    if (this.destroyed || this._drawPending) return;
    this._drawPending = true;
    this._drawFrame = requestAnimationFrame(function () {
      self._drawPending = false;
      if (self.destroyed) return;
      self.renderer.selected = self.selected;
      self.positionFactoryPanel();
      self.renderer.draw();
      self.updateHoverInfo();
    });
  };

  GameUI.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this._unsubscribeIconSet) this._unsubscribeIconSet();
    if (this._layoutObserver) this._layoutObserver.disconnect();
    var h = this.handlers;
    window.removeEventListener("resize", h.resize);
    window.removeEventListener("mouseup", h.windowMouseup);
    window.removeEventListener("mousemove", h.windowMousemove);
    this.canvas.removeEventListener("mousedown", h.mousedown);
    this.canvas.removeEventListener("mousemove", h.mousemove);
    this.canvas.removeEventListener("mouseleave", h.mouseleave);
    this.canvas.removeEventListener("mouseup", h.mouseup);
    this.canvas.removeEventListener("wheel", h.wheel);
    $("game-screen").removeEventListener("contextmenu", h.contextmenu);
    document.removeEventListener("keydown", h.keydown);
    document.removeEventListener("keyup", h.keyup);
    window.removeEventListener("blur", h.blur);
    cancelAnimationFrame(this._drawFrame);
    if (this._battlePlayback) this._battlePlayback.cancel();
    if (this._aftermath) this._aftermath.cancel();
    if (this._movement) this._movement.cancel();
    this.closeWarDock();
    this.hideBattleScreen();
    clearTimeout(this._toastT);
    $("toast").classList.add("hidden");
    clearTimeout(this._aiTimer);
    if (this._aiTurn && this._aiTurn.destroy) this._aiTurn.destroy();
    this._aiTurn = null;
    this.closeActionMenu();
    this.closeFactoryPanel();
    $("unit-hover").classList.add("hidden");
    $("range-legend").classList.add("hidden");
    $("battle-panel").classList.add("hidden");
    $("watch-panel").classList.add("hidden");
  };

  /* --- status / panels ------------------------------------------------- */

  GameUI.prototype.refreshStatus = function () {
    var g = this.game;
    this.refreshUndoButton();
    $("status-turn").textContent = "Turn " + g.turn + " / " + g.turnLimit;
    var pc = RENDER.PLAYER_COLORS[g.currentPlayer];
    var el = $("status-player");
    el.textContent = pc.name;
    el.style.color = factionTextColor(g.currentPlayer);
    var counts = [g.playerUnits(0).length, g.playerUnits(1).length];
    $("status-units").textContent = "Units " + counts[0] + " : " + counts[1];
    var hovered = this.renderer.hoverHex;
    if (hovered) this.updateHoverInfo();
    if (this.options && this.options.onStateChange) this.options.onStateChange(this);
  };

  GameUI.prototype.refreshWatchButton = function () {
    $("btn-watch").setAttribute("aria-pressed", this.watchAI ? "true" : "false");
    $("btn-animate").setAttribute("aria-pressed", this.animateMoves ? "true" : "false");
  };

  GameUI.prototype.openWarDock = function (scene, math) {
    var dock = $("war-dock");
    this._dockShowsSelection = false;
    $("war-scene").innerHTML = scene || "";
    $("war-math").innerHTML = math || "";
    unitView.paint(dock);
    dock.classList.remove("hidden");
    this.draw();
  };

  GameUI.prototype.closeWarDock = function () {
    var dock = $("war-dock");
    if (!dock || dock.classList.contains("hidden")) return;
    dock.classList.add("hidden");
    $("war-scene").innerHTML = "";
    $("war-math").innerHTML = "";
    this.hideBattleScreen();
  };

  GameUI.prototype.showBattleScreen = function (html) {
    var stage = $("battle-stage");
    $("battle-content").innerHTML = html; unitView.paint($("battle-content"));
    stage.classList.remove("hidden");
    $("btn-battle-map").classList.remove("hidden");
    $("btn-battle-map").textContent = "Show map";
  };

  GameUI.prototype.hideBattleScreen = function () {
    if (this._battlePlayback) this._battlePlayback.cancel();
    this._battlePlayback = null;
    $("battle-stage").classList.add("hidden");
    $("btn-battle-map").classList.add("hidden");
  };

  GameUI.prototype.refreshBattlePause = function () {
    var paused = this._battlePlayback && this._battlePlayback.paused, button = $("btn-battle-pause");
    button.textContent = paused ? "Resume" : "Pause";
    button.setAttribute("aria-pressed", paused ? "true" : "false");
    $("battle-stage").setAttribute("data-paused", paused ? "true" : "false");
  };

  GameUI.prototype.toggleBattlePause = function () {
    if (!this._battlePlayback) return;
    this._battlePlayback[this._battlePlayback.paused ? "resume" : "pause"]();
    this.refreshBattlePause();
  };

  GameUI.prototype.playBattleTimeline = function (duration, update, done) {
    if (this._battlePlayback) this._battlePlayback.cancel();
    this._battleResultAt = null;
    var self = this;
    this._battlePlayback = timeline.play({duration:duration, update:update, done:function () {
      self._battlePlayback = null;
      if (!self.destroyed && done) done();
    }});
    this.refreshBattlePause();
  };

  GameUI.prototype.animateMovement = function (unit, path, done) {
    if (this._movement) this._movement.cancel();
    var self = this;
    // A one-hex route draws no motion and still completes on the next frame.
    this._movement = movement.play(this.renderer, unit, this.animateMoves ? path : path.slice(-1), {
      draw: function () { self.draw(); },
      done: function () { self._movement = null; if (!self.destroyed && done) done(); },
    });
    return this._movement.duration;
  };

  GameUI.prototype.showWatchPanel = function (title, detail) {
    $("watch-panel").classList.add("hidden");
    this.openWarDock("<div class='war-scene'><div class='war-headline'>" + esc(title) + "</div>" + detail + "</div>", "");
    this._dockShowsSelection = true;
  };

  GameUI.prototype.hideWatchPanel = function () {
    $("watch-panel").classList.add("hidden");
    this.renderer.flashUnits = {};
    this.renderer.attackingUnitId = null;
  };

  GameUI.prototype.showWatchMove = function (event) {
    var reasons = {
      attack: "moving into firing position",
      repair: "retreating for repairs",
      advance: "advancing",
      "post-attack": "repositioning after its attack",
    };
    var action = event.t === "deploy" ? "deployed from a factory" : (reasons[event.reason] || "moving");
    if (event.effects && event.effects.length) {
      var effect = event.effects[0];
      action += effect.t === "capture" ? " and captured " + effect.kind : " and repaired to full strength";
    }
    var side = battleReport.faction(event.unit.player);
    this.showWatchPanel(
      event.t === "deploy" ? side + " deployment" : side + " selected",
      "<div class='war-verb'>" + unitView.html(event.unit) + " " + esc(action) + "</div>"
    );
    this.renderer.highlights = null;
    if (event.to) {
      this.renderer.highlights = {};
      this.renderer.highlights[HEX.key(event.to.col, event.to.row)] = "rgba(255,180,65,0.55)";
    }
  };

  GameUI.prototype.showWatchPreview = function (event) {
    // The attacker is identified by its deep-red body (as in the original);
    // the defender gets a white ring so the pair reads as one matchup.
    this.renderer.flashUnits = {};
    this.renderer.highlights = null;
    this.renderer.attackingUnitId = event.attacker.id;
    this.renderer.flashUnits[event.defender.id] = "#ffffff";
    var parts = battleReport.previewHtml(event.attacker, event.defender, event.preview);
    this.openWarDock(parts.scene, parts.math);
    this.showBattleScreen(parts.screen);
  };

  GameUI.prototype.showWatchResult = function (event, done) {
    this.renderer.flashUnits = {};
    this.renderer.highlights = null;
    this.renderer.attackingUnitId = event.attacker.id;
    this.renderer.flashUnits[event.defender.id] = "#ffffff";
    var parts = battleReport.resultParts(event.attacker, event.defender, event.result, event.attackerBefore, event.defenderBefore);
    battleReport.record(this.warLedger, event.attacker.player, parts.assessed);
    this.openWarDock(parts.scene, parts.math + battleReport.ledgerHtml(this.warLedger));
    this.showBattleScreen(parts.screen);
    return this.animateBattleResult(event, $("war-scene"), done, 2700, 0);
  };

  GameUI.prototype.animateBattleResult = function (event, detail, onComplete, holdMs, approachMs) {
    if (this._battlePlayback) this._battlePlayback.cancel();
    var self = this;
    var result = event.result;
    var attackerLosses = result.dmgToAttacker;
    var defenderLosses = result.dmgToDefender;
    if (!Number.isInteger(attackerLosses) || attackerLosses < 0 ||
        attackerLosses > event.attackerBefore ||
        !Number.isInteger(defenderLosses) || defenderLosses < 0 ||
        defenderLosses > event.defenderBefore) {
      throw new Error("Battle result casualties exceed the pre-battle squad count");
    }
    var largestLoss = Math.max(attackerLosses, defenderLosses);
    var duration = Math.max(1600, Math.min(2600, largestLoss * 360));
    var lastCounts = "", resultMath = $("war-math").innerHTML;
    if (holdMs === undefined) holdMs = 900;
    if (approachMs === undefined) approachMs = 800;
    var earned = Math.max(event.attacker.exp - result.attackerExpBefore, event.defender.exp - result.defenderExpBefore);
    holdMs = Math.max(holdMs, battleReport.rewardHoldMs(earned));
    this.renderer.battleGhosts = [event.attacker, event.defender];

    function casualtyState(before, losses, progress, unit, seed) {
      if (!losses || progress <= 0) return before;
      if (progress >= 1) return before - losses;
      var scaled = progress * losses;
      var completed = Math.floor(scaled);
      var phase = scaled - completed;
      var removed = Math.min(losses, completed + (phase >= 0.62 ? 1 : 0));
      if (phase < 0.86) {
        self.renderer.explosions.push({
          col: unit.col, row: unit.row,
          phase: phase / 0.86, seed: seed + completed,
        });
      }
      return before - removed;
    }

    function frame(elapsed) {
      if (self.destroyed) return;
      var progress = Math.max(0, Math.min(1, (elapsed - approachMs) / duration));
      $("battle-stage").style.setProperty("--battle-approach", approachMs ? Math.max(0, 1 - elapsed / approachMs) : 0);
      self.renderer.explosions = [];
      var attackerCurrent = casualtyState(
        event.attackerBefore, attackerLosses, progress, event.attacker, 11
      );
      var defenderCurrent = casualtyState(
        event.defenderBefore, defenderLosses, progress, event.defender, 29
      );
      self.renderer.strengthOverrides = {};
      self.renderer.strengthOverrides[event.attacker.id] = attackerCurrent;
      self.renderer.strengthOverrides[event.defender.id] = defenderCurrent;
      var rewardElapsed = Math.max(0, elapsed - approachMs - duration);
      var aExp = battleReport.earnedExperience(result.attackerExpBefore, event.attacker.exp, rewardElapsed);
      var dExp = battleReport.earnedExperience(result.defenderExpBefore, event.defender.exp, rewardElapsed);
      var phase = elapsed < approachMs ? "ready" : progress < 1 ? "fighting" : "result";
      var counts = attackerCurrent + ":" + defenderCurrent + ":" + aExp + ":" + dExp + ":" + phase;
      if (counts !== lastCounts) {
        lastCounts = counts;
        detail.innerHTML = battleReport.sceneHtml(
          Object.assign({}, event.attacker, {exp:aExp}), Object.assign({}, event.defender, {exp:dExp}),
          event.attackerBefore, event.defenderBefore, attackerCurrent, defenderCurrent);
        unitView.paint(detail);
        $("war-math").innerHTML = phase === "result" ? resultMath : "";
        var stage = $("battle-content");
        stage.innerHTML = battleReport.screenHtml(event.attacker, event.defender, result.preview,
          event.attackerBefore, event.defenderBefore, attackerCurrent, defenderCurrent,
          result.attackerExpBefore, result.defenderExpBefore,
          aExp, dExp, phase);
        unitView.paint(stage);
      }
      self.draw();

      if (progress < 1) return;
      self.renderer.strengthOverrides = {};
      self.renderer.battleGhosts = [];
      self.renderer.explosions = [];
      self.renderer.attackingUnitId = null;
      self.draw();
    }

    frame(0);
    this.playBattleTimeline(approachMs + duration + holdMs, frame, onComplete);
    this._battleResultAt = approachMs + duration + battleReport.rewardRevealMs(earned);
    if (this._advanceBattle) this.advanceBattle();
    return approachMs + duration + holdMs;
  };

  // A click during a battle jumps to its last stage: from the map effects or a
  // watched preview straight to the result with every earned star shown, and
  // from the result back to the map.
  GameUI.prototype.advanceBattle = function () {
    var playback = this._battlePlayback;
    if (!playback) return;
    if (this._battleResultAt === null) {
      this._advanceBattle = true;
      playback.seek(Infinity);
    } else {
      this._advanceBattle = false;
      playback.seek(playback.elapsed < this._battleResultAt ? this._battleResultAt : Infinity);
    }
    if (this._battlePlayback) this.refreshBattlePause();
  };

  function unitInfoHtml(game, unit) {
    if (!unit) return "";
    var t = unit.type;
    var terr = game.terrainAt(unit.col, unit.row);
    var strCap = COMBAT.strengthCaption(unit.strength);
    function stat(label, value, detail) {
      return "<div class='unit-stat'><span class='unit-stat-label'>" + label +
        "</span><strong>" + value + "</strong>" +
        (detail ? "<span class='unit-stat-detail'>" + detail + "</span>" : "") + "</div>";
    }
    var ground = COMBAT.rangeBand(t, false), air = COMBAT.rangeBand(t, true);
    var groundRange = ground && ground.max > 1 ? "Range " + bandText(t, false) : "";
    // Adjacency is the default. Spell out the air band when a mixed-range
    // unit could otherwise imply that its ground range also applies to air.
    var airRange = air && (air.max > 1 || groundRange) ? "Range " + bandText(t, true) : "";
    var remainingShift = t.moveAfterAttack && unit.player === game.currentPlayer && unit.movePointsLeft < t.move;
    var shift = remainingShift ? unit.movePointsLeft + "<small>/" + t.move + "</small>" : t.move;
    var experience = COMBAT.experienceBonus(unit.exp), damage = experience.damage;
    return "<div class='unit-card-head'><span class='unit-card-portrait'><canvas class='unit-card-icon' width='32' height='32' role='img' aria-label='" +
      esc(unitView.name(t) + " · " + unitView.rankLabel(unit)) + "'></canvas>" +
      (strCap ? "<span class='unit-strength' role='img' aria-label='" + strCap + " machines remaining'>" + strCap + "</span>" : "") + "</span>" +
      "<strong class='ui-name' style='color:" + factionTextColor(unit.player) + "'>" + esc(unitView.name(t)) + "</strong>" +
      "</div>" +
      "<div class='unit-combat-grid'>" + stat("Ground ATK", t.atkG || 0, groundRange) +
      (air ? stat("Air ATK", t.atkA, airRange) : "") + stat("Defense", t.def) +
      stat("Shift", shift, remainingShift ? "left" : "") + "</div>" +
      "<div class='unit-card-foot'><span>" + esc(terr.name) + " <strong>+" + (t.moveType === "air" ? 0 : terr.def) +
      " DEF</strong></span>" + (damage ? "<span>Damage <strong>+" + damage + "%</strong></span>" : "") +
      "</div>" + (unit.cargo && unit.cargo.length ? "<div class='unit-inventory'><div class='inventory-caption'>Cargo</div>" +
        inventoryHtml(unit.cargo) + "</div>" : "");
  }

  function inventoryEntryHtml(unit) {
    return unitView.html(unit) + (unit.strength < 8 ? "<small>" + unit.strength + "/8</small>" : "");
  }

  function inventoryHtml(units) {
    return "<div class='inventory-grid'>" + units.map(function (unit) {
      return "<div class='inventory-entry'>" + inventoryEntryHtml(unit) + "</div>";
    }).join("") + "</div>";
  }

  GameUI.prototype.renderFactoryInfo = function (container, building) {
    var faction = RENDER.PLAYER_COLORS[building.owner < 0 ? 2 : building.owner];
    var html = "<div class='unit-card-head'><strong class='ui-name' style='color:" + factionTextColor(building.owner) + "'>" +
      (building.kind === "base" ? "Base" : "Factory") + "</strong><span>" +
      (building.owner < 0 ? "Neutral" : faction.name) + "</span></div>" +
      "<div class='inventory-caption'>" + (building.stored.length ? building.stored.length +
        " stored unit" + (building.stored.length === 1 ? "" : "s") : "Empty") + "</div>" + inventoryHtml(building.stored);
    var key = html + RENDER.getStyle() + RENDER.getIconSet();
    if (container._unitCardKey === key) return;
    container._unitCardKey = key; container.innerHTML = html; unitView.paint(container);
  };

  GameUI.prototype.renderUnitInfo = function (container, unit, building) {
    var html = unitInfoHtml(this.game, unit) + (building && building.stored.length ?
      "<div class='unit-inventory'><div class='inventory-caption'>" + (building.kind === "base" ? "Base" : "Factory") +
      " · " + building.stored.length + " stored</div>" + inventoryHtml(building.stored) + "</div>" : "");
    var attacking = unit && this.renderer.attackingUnitId === unit.id;
    var spent = unit && !attacking && unit.moved && this.game.currentPlayer === unit.player;
    var key = html + (unit ? unit.exp : "") + RENDER.getStyle() + RENDER.getIconSet() + attacking + spent;
    if (container._unitCardKey === key) return;
    container._unitCardKey = key;
    container.innerHTML = html;
    unitView.paint(container);
    if (unit) {
      RENDER.drawUnitIcon(container.querySelector(".unit-card-icon"), unit,
        { attacking: attacking, spent: spent, experience: true });
    }
  };

  // Anchor to the hex, not the moving pointer. Prefer a side with fewer
  // covered units, and never cover the inspected hex or leave the viewport.
  function hoverPosition(center, radius, width, height, viewWidth, viewHeight, obstacles) {
    var margin = 8, gap = radius + 12;
    if (width > viewWidth - margin * 2 || height > viewHeight - margin * 2) return null;
    function clamp(value, max) { return Math.max(margin, Math.min(max - margin, value)); }
    var y = clamp(center.y - 32, viewHeight - height);
    var x = clamp(center.x - width / 2, viewWidth - width);
    var candidates = [
      { x: center.x + gap, y: y },
      { x: center.x - gap - width, y: y },
      { x: x, y: center.y + gap },
      { x: x, y: center.y - gap - height },
    ];
    var best = null, bestScore = Infinity;
    candidates.forEach(function (pos) {
      if (pos.x < margin || pos.y < margin || pos.x + width > viewWidth - margin ||
          pos.y + height > viewHeight - margin) return;
      var score = (obstacles || []).reduce(function (sum, rect) {
        var w = Math.max(0, Math.min(pos.x + width, rect.x + rect.width) - Math.max(pos.x, rect.x));
        var h = Math.max(0, Math.min(pos.y + height, rect.y + rect.height) - Math.max(pos.y, rect.y));
        return sum + w * h;
      }, 0);
      if (score < bestScore) { best = pos; bestScore = score; }
    });
    return best;
  }

  GameUI.prototype.updateHoverInfo = function () {
    var card = $("unit-hover"), r = this.renderer, hex = r.hoverHex;
    var unit = hex && this.game.unitAt(hex.col, hex.row);
    var building = hex && this.game.buildingAt(hex.col, hex.row);
    if ((!unit && !building) || this.busy || this.destroyed || (this.dragging && this.dragging.pan) ||
        ["aiTurn", "battle", "factory", "unload", "over"].indexOf(this.mode) >= 0) {
      card.classList.add("hidden");
      return;
    }
    var owner = unit ? unit.player : building.owner;
    if (unit) this.renderUnitInfo(card, unit, building);
    else this.renderFactoryInfo(card, building);
    card.setAttribute("aria-label", unit ? "Unit details" : "Factory inventory");
    card.style.borderColor = factionTextColor(owner);
    card.classList.remove("hidden");
    var radius = Math.max(18, r.hexSize * r.zoom);
    var obstacles = this.game.units.filter(function (other) {
      return other !== unit && !other.carriedBy && !other.inFactory;
    }).map(function (other) {
      var p = r.hexCenter(other.col, other.row);
      return { x: p.x - radius, y: p.y - radius, width: radius * 2, height: radius * 2 };
    });
    var pos = hoverPosition(r.hexCenter(hex.col, hex.row), radius,
      card.offsetWidth, card.offsetHeight, this.canvas.width, this.canvas.height, obstacles);
    if (!pos) { card.classList.add("hidden"); return; }
    card.style.left = Math.round(pos.x) + "px";
    card.style.top = Math.round(pos.y) + "px";
  };

  /* --- action menu ------------------------------------------------------ */

  // Map overlay for one matchup: the target's surrounding hexes and every unit
  // whose support changes the numbers. Supporters worth 0 are left unmarked.
  function combatEffects(defender, pv) {
    function marks(list, side) {
      return list.filter(function (u) { return u.value > 0; })
        .map(function (u) { return {col: u.col, row: u.row, side: side}; });
    }
    var t = pv.tactical;
    return {target: {col: defender.col, row: defender.row}, ring: t.ring, surrounded: pv.surrounded,
      supporters: marks(t.attackSupporters, "attack").concat(marks(t.defenseSupporters, "defense")),
      shownSupporters: Infinity, shownRing: Infinity, surroundShown: true};
  }

  GameUI.prototype.hideCombatPreview = function () {
    $("combat-inspector").classList.add("hidden");
    this._previewKey = null;
    this._forecastCache = {};
    this.renderer.attackingUnitId = null;
    this.renderer.flashUnits = {};
    this.renderer.combatEffects = null;
    this.renderer.battlePair = null;
  };

  GameUI.prototype.showCombatPreview = function (defender) {
    if ((this.mode !== "moved" && this.mode !== "unitSelected") || !this.selected || this.pickTargets.indexOf(defender) < 0) return;
    var attacker = this.selected;
    var pv = COMBAT.preview(this.game, attacker, defender);
    var key = JSON.stringify([attacker.id, defender.id, attacker.strength, defender.strength, attacker.exp, defender.exp, pv]);
    if (this._previewKey === key) return;
    this._previewKey = key;
    if (!this._forecastCache) this._forecastCache = {};
    var forecast = this._forecastCache[key];
    if (!forecast) forecast = this._forecastCache[key] = COMBAT.forecast(attacker, defender, pv);
    var inspector = $("combat-inspector"), panel = $("topbar");
    inspector.innerHTML = COMBAT_VIEW.html(attacker, defender, pv, forecast);
    unitView.paint(inspector);
    inspector.classList.remove("hidden");
    // The forecast sits in the left panel whether or not Details is open; scroll
    // the panel, never the board, when a short window hides it.
    if (inspector.getBoundingClientRect().top >= panel.getBoundingClientRect().bottom)
      panel.scrollTop += inspector.getBoundingClientRect().top - panel.getBoundingClientRect().top;
    this.renderer.attackingUnitId = attacker.id;
    this.renderer.flashUnits = {};
    this.renderer.flashUnits[defender.id] = "#ffffff";
    this.renderer.combatEffects = combatEffects(defender, pv);
    this.draw();
  };

  // Before the battle screen, the original lights each surrounding hex inside
  // the attacker's ZOC and then each supporter. This plays the same map
  // display in the true order of the calculation (support, terrain, then the
  // surround halving) beside the real per-machine steps.
  var EFFECT_SUPPORT_MS = 170, EFFECT_TERRAIN_MS = 260, EFFECT_RING_MS = 90, EFFECT_HOLD_MS = 500;
  GameUI.prototype.playCombatEffects = function (attacker, defender, pv, done) {
    var self = this, fx = combatEffects(defender, pv);
    this._advanceBattle = false;
    this.renderer.battlePair = {attacker: {col: attacker.col, row: attacker.row}, defender: {col: defender.col, row: defender.row}};
    var ringCount = fx.ring.filter(function (hex) { return hex.onMap; }).length;
    var supportEnd = fx.supporters.length * EFFECT_SUPPORT_MS, terrainEnd = supportEnd + EFFECT_TERRAIN_MS;
    var ringEnd = terrainEnd + ringCount * EFFECT_RING_MS, lastStage = null;
    this.renderer.combatEffects = fx;
    this.renderer.attackingUnitId = attacker.id;
    this.renderer.flashUnits = {};
    this.renderer.flashUnits[defender.id] = "#ffffff";
    function frame(elapsed) {
      if (self.destroyed) return;
      fx.shownSupporters = Math.min(fx.supporters.length, Math.floor(elapsed / EFFECT_SUPPORT_MS) + 1);
      fx.shownRing = elapsed < terrainEnd ? 0 :
        Math.min(ringCount, Math.floor((elapsed - terrainEnd) / EFFECT_RING_MS) + 1);
      fx.surroundShown = elapsed >= ringEnd;
      var stage = elapsed < supportEnd ? 0 : elapsed < terrainEnd ? 1 : elapsed < ringEnd ? 2 : 3;
      if (stage !== lastStage) {
        lastStage = stage;
        self.openWarDock(battleReport.effectsHtml(attacker, defender, pv, stage), "");
      }
      self.draw();
    }
    frame(0);
    this.playBattleTimeline(ringEnd + EFFECT_HOLD_MS, frame, function () {
      self.renderer.combatEffects = null;
      done();
    });
  };

  GameUI.prototype.openActionMenu = function (unit, skipUnload) {
    var passenger = !skipUnload && unit.cargo.find(function (cargo) {
      return this.hasUnloadDestination(unit, cargo);
    }, this);
    if (passenger) { this.enterUnload(unit, passenger); return; }
    var self = this;
    this.unloadCargo = null;
    this.mode = "moved";
    this.hideCombatPreview();
    var menu = $("action-menu");
    menu.innerHTML = "";
    this.pickTargets = this.previewTargets(unit);
    this.renderer.fireRange = null;
    $("range-legend").classList.add("hidden");
    this.renderer.highlights = {};
    this.pickTargets.forEach(function (target) {
      self.renderer.highlights[HEX.key(target.col, target.row)] = "rgba(255,80,60,0.55)";
    });
    if (unit.moved) actionButton(menu, "Close", function () { self.deselect(); });
    else {
      if (!unit.shifted) actionButton(menu, "Cancel", function () {
        if (unit.type.move) self.selectUnit(unit); else self.deselect();
      });
    }
    this.showTransportActions(unit, menu);
    menu.classList[menu.children.length ? "remove" : "add"]("hidden");
    this.draw();
  };

  GameUI.prototype.showTransportActions = function (unit, menu) {
    var self = this;
    (unit.cargo || []).forEach(function (cargo) {
      if (self.hasUnloadDestination(unit, cargo)) {
        if (self.mode !== "unload" || self.unloadCargo !== cargo) {
          var button = actionButton(menu, "Unload " + unitView.name(cargo), function () { self.enterUnload(unit, cargo); });
          button.className = "unload-available";
          unitView.addIcon(button, cargo);
        }
      } else {
        var unavailable = actionButton(menu, "Unload " + unitView.name(cargo) +
          ((unit.transferUsed || cargo.moved) ? " (next turn)" : " (no landing space)"), function () {}, true);
        unavailable.title = unitView.name(cargo) + (unit.transferUsed ?
          " cannot unload until next turn: this transport has already loaded or unloaded." : cargo.moved ?
          " cannot unload until next turn: it has already acted or boarded this turn." :
          " cannot unload here: no legal adjacent space is open.");
        unitView.addIcon(unavailable,cargo);
      }
    });
  };

  GameUI.prototype.closeActionMenu = function () {
    $("action-menu").classList.add("hidden");
    this.hideCombatPreview();
  };

  /* --- factory panel ----------------------------------------------------- */

  GameUI.prototype.openFactoryPanel = function (building) {
    var g = this.game;
    this.deselect();
    // Hover already provides inventory inspection. Clicking opens only a
    // deployment picker, and only when the current player can use it.
    var reserves = building.owner === g.currentPlayer ? building.stored.map(function (unit) {
      return {unit: unit, ready: !!(g.deployTargets(building, unit).length || g.transportDeployTargets(building, unit).length)};
    }) : [];
    var readyCount = reserves.filter(function (entry) { return entry.ready; }).length;
    if (!readyCount) { this.closeFactoryPanel(); return; }
    this.cancelEndTurn();
    this.closeActionMenu();
    this.deployPending = null;
    var self = this;
    this.inspectedFactory = building;
    var owner = RENDER.PLAYER_COLORS[building.owner].name;
    var panel = $("factory-panel"), list = $("factory-list");
    list.innerHTML = "";
    this.mode = "factory";
    $("factory-title").textContent = (building.kind === "base" ? "Base" : "Factory") + " — " + owner;
    reserves.forEach(function (entry) {
      var su = entry.unit, ready = entry.ready;
      var row = document.createElement(ready ? "button" : "div");
      row.className = "factory-row" + (ready ? " is-ready" : "");
      row.setAttribute("data-unit-id", su.id);
      row.setAttribute("aria-label", (ready ? "Deploy " : "") + unitView.name(su) +
        ", " + unitView.rankLabel(su));
      row.innerHTML = "<span class='inventory-entry'>" + inventoryEntryHtml(su) + "</span>" +
        "<span class='factory-unit-status'>" +
          (ready ? "Deploy →" : su.moved ? "Next turn" : "No open exit") + "</span>";
      if (ready) {
        row.type = "button";
        row.onclick = function () { self.beginDeployment(building, su); };
      } else row.setAttribute("aria-disabled", "true");
      list.appendChild(row);
    });
    unitView.paint(list);
    $("factory-summary").textContent = building.stored.length + " stored unit" + (building.stored.length === 1 ? "" : "s") +
      " · " + readyCount + " ready. Select a unit, then an exit.";
    $("factory-close").onclick = function () { self.closeFactoryPanel(); };
    panel.classList.remove("hidden");
    $("unit-hover").classList.add("hidden");
    this.positionFactoryPanel();
    var first = list.querySelector("button");
    if (first && first.focus) first.focus({ preventScroll: true });
  };

  GameUI.prototype.positionFactoryPanel = function () {
    if (this.mode !== "factory" || !this.inspectedFactory) return;
    var panel = $("factory-panel"), r = this.renderer;
    var center = r.hexCenter(this.inspectedFactory.col, this.inspectedFactory.row);
    var radius = Math.max(18, r.hexSize * r.zoom), w = this.canvas.width, h = this.canvas.height;
    var scrollTop = $("factory-list").scrollTop;
    panel.style.maxHeight = Math.max(1, Math.min(440, h - 16)) + "px";
    var pos = hoverPosition(center, radius, panel.offsetWidth, panel.offsetHeight, w, h, []);
    if (!pos) {
      // On narrow maps, shorten the scrollable roster to fit above/below its
      // factory. The heading and close control remain visible.
      panel.style.maxHeight = Math.max(1, Math.min(h - 16, 440,
        Math.max(100, center.y - radius - 20, h - center.y - radius - 20))) + "px";
      pos = hoverPosition(center, radius, panel.offsetWidth, panel.offsetHeight, w, h, []);
    }
    if (!pos) pos = {x: Math.max(8, Math.min(w - panel.offsetWidth - 8, center.x + radius + 12)),
      y: Math.max(8, Math.min(h - panel.offsetHeight - 8, center.y - 32))};
    panel.style.left = Math.round(pos.x) + "px";
    panel.style.top = Math.round(pos.y) + "px";
    $("factory-list").scrollTop = scrollTop;
  };

  GameUI.prototype.beginDeployment = function (building, unit) {
    var exits = this.game.deployTargets(building, unit), transports = this.game.transportDeployTargets(building, unit);
    if (!exits.length && !transports.length) { this.openFactoryPanel(building); return; }
    this.closeFactoryPanel();
    this.mode = "deployPick";
    this.deployPending = {building: building, unit: unit, transports: transports};
    var highlights = {};
    exits.forEach(function (exit) { highlights[HEX.key(exit.col, exit.row)] = "rgba(130,220,130,0.45)"; });
    transports.forEach(function (transport) { highlights[HEX.key(transport.col, transport.row)] = "rgba(80,180,255,0.6)"; });
    this.renderer.highlights = highlights;
    var self = this, menu = $("action-menu");
    menu.innerHTML = "";
    var prompt = document.createElement("span");
    prompt.className = "deploy-prompt";
    prompt.textContent = "Deploy " + unitView.name(unit) + ": choose a highlighted exit";
    unitView.addIcon(prompt, unit); menu.appendChild(prompt);
    actionButton(menu, "Back to factory", function () { self.cancelDeployment(true); });
    actionButton(menu, "Cancel", function () { self.cancelDeployment(false); });
    menu.classList.remove("hidden");
    this.draw();
  };

  GameUI.prototype.cancelDeployment = function (reopen) {
    var pending = this.deployPending;
    this.deployPending = null;
    this.deselect();
    if (reopen && pending) this.openFactoryPanel(pending.building);
  };

  GameUI.prototype.closeFactoryPanel = function () {
    $("factory-panel").classList.add("hidden");
    this.inspectedFactory = null;
    if (this.mode === "factory") this.mode = "idle";
  };

  /* --- battle preview ----------------------------------------------------- */

  GameUI.prototype.showBattle = function (attacker, defender, done) {
    var self = this, g = this.game;
    this.closeActionMenu();
    this.mode = "battle";
    this.busy = true;
    this.renderer.attackingUnitId = attacker.id;
    this.renderer.highlights = null;
    $("battle-panel").classList.add("hidden");
    var attackerBefore = attacker.strength, defenderBefore = defender.strength;
    var result = g.attack(attacker, defender);
    var parts = battleReport.resultParts(attacker, defender, result, attackerBefore, defenderBefore);
    battleReport.record(this.warLedger, attacker.player, parts.assessed);
    this.clearUndo(); // Combat is an irreversible boundary, including during animation.
    this.refreshStatus();
    // The map keeps both pre-battle squads, including a destroyed one, until the
    // battle screen shows the casualties.
    this.renderer.battleGhosts = [attacker, defender];
    this.renderer.strengthOverrides = {};
    this.renderer.strengthOverrides[attacker.id] = attackerBefore;
    this.renderer.strengthOverrides[defender.id] = defenderBefore;
    this.playCombatEffects(
      Object.assign({}, attacker, {strength: attackerBefore, exp: result.attackerExpBefore}),
      Object.assign({}, defender, {strength: defenderBefore, exp: result.defenderExpBefore}),
      result.preview, function () {
      self.openWarDock(parts.scene, parts.math + battleReport.ledgerHtml(self.warLedger));
      self.showBattleScreen(parts.screen);
      self.animateBattleResult({ attacker: attacker, defender: defender,
        attackerBefore: attackerBefore, defenderBefore: defenderBefore, result: result,
      }, $("war-scene"), function () {
        self.busy = false;
        self.hideBattleScreen();
        done(result);
        self.showAftermath(attacker, defender, result);
      });
    });
  };

  // Back on the map, the two units that fought stay faintly marked until the
  // next action. A destroyed squad also explodes at its hex a few more times,
  // and the unit that destroyed it keeps its battle highlight.
  var AFTERMATH_BURST_MS = 480, AFTERMATH_BURSTS = 3;
  GameUI.prototype.showAftermath = function (attacker, defender, result) {
    var self = this, renderer = this.renderer;
    var dead = [result.defenderDead && defender, result.attackerDead && attacker].filter(Boolean);
    if (this._aftermath) this._aftermath.cancel();
    this._aftermath = null;
    renderer.aftermath = [];
    renderer.attackingUnitId = null;
    renderer.flashUnits = {};
    renderer.battlePair = {attacker: {col: attacker.col, row: attacker.row}, defender: {col: defender.col, row: defender.row}};
    if (dead.length === 1 && result.defenderDead) renderer.attackingUnitId = attacker.id;
    if (dead.length === 1 && result.attackerDead) renderer.flashUnits[defender.id] = "#ffffff";
    if (!dead.length) { this.draw(); return; }
    this._aftermath = timeline.play({duration: AFTERMATH_BURST_MS * AFTERMATH_BURSTS, update: function (elapsed) {
      if (self.destroyed) return;
      var burst = Math.min(AFTERMATH_BURSTS - 1, Math.floor(elapsed / AFTERMATH_BURST_MS));
      renderer.aftermath = dead.map(function (unit, i) {
        return {col: unit.col, row: unit.row, phase: elapsed / AFTERMATH_BURST_MS - burst, seed: 41 + 13 * i + 7 * burst};
      });
      self.draw();
    }, done: function () {
      self._aftermath = null;
      renderer.aftermath = [];
      if (!self.destroyed) self.draw();
    }});
  };

  /* --- selection / movement flow ------------------------------------------- */

  GameUI.prototype.inspectEnemy = function (unit) {
    this.deselect();
    this.selected = unit;
    this.mode = "enemyInspect";
    // The enemy's last activation may be spent. Preview its next full turn
    // against the current board without resetting or mutating the real unit.
    var preview = Object.assign({}, unit, {
      moved: false, shifted: false, attacked: false, attackSpent: false, movePointsLeft: unit.type.move,
    });
    this.range = this.game.movementRange(preview);
    var highlights = {};
    for (var k in this.range) {
      if (this.range[k].canStop) highlights[k] = "rgba(255,180,65,0.38)";
    }
    this.renderer.highlights = highlights;
    this.showFiringRange(unit, true);
    this.draw();
  };

  GameUI.prototype.showFiringRange = function (unit, enemy) {
    var fireRange = {}, ground = COMBAT.rangeBand(unit.type, false), air = COMBAT.rangeBand(unit.type, true);
    if (!enemy && (unit.attacked || unit.attackSpent)) ground = air = null;
    var radius = Math.max(ground ? ground.max : 0, air ? air.max : 0);
    // Range depends on the weapon, not map size. A generous odd-q row bound
    // keeps selection work local even on large custom maps.
    for (var row = Math.max(0, unit.row - radius * 2); row <= Math.min(this.game.height - 1, unit.row + radius * 2); row++) {
      for (var col = Math.max(0, unit.col - radius); col <= Math.min(this.game.width - 1, unit.col + radius); col++) {
        var distance = HEX.distance(unit.col, unit.row, col, row);
        var hitsGround = !!ground && distance >= ground.min && distance <= ground.max;
        var hitsAir = !!air && distance >= air.min && distance <= air.max;
        if (hitsGround || hitsAir) fireRange[HEX.key(col, row)] = { ground: hitsGround, air: hitsAir };
      }
    }
    this.renderer.fireRange = fireRange;
    var legend = $("range-legend");
    legend.innerHTML = unitView.html(unit) +
      (unit.type.move ? '<span class="' + (enemy ? "range-move" : "range-own-move") + '">Move</span>' : "") +
      (ground ? '<span class="range-ground">Ground ' + bandText(unit.type, false) + "</span>" : "") +
      (air ? '<span class="range-air">Air ' + bandText(unit.type, true) + "</span>" : "") +
      (ground || air ? '<span class="range-note">Fire from current hex</span>' : "");
    unitView.paint(legend);
    legend.classList.remove("hidden");
  };

  GameUI.prototype.selectUnit = function (unit) {
    if (unit.player !== this.game.currentPlayer || unit.carriedBy || unit.inFactory) return;
    this.finishPendingActivations(unit);
    if (this.selected && this.selected !== unit) this.clearSelection();
    if (unit.moved || (unit.attacked && !unit.type.moveAfterAttack)) {
      if (unit.cargo.length) {
        this.selected = unit;
        this.openActionMenu(unit);
      }
      return;
    }
    this.closeActionMenu();
    this.selected = unit;
    this.pickTargets = [];
    this.mode = "command";
    this.range = this.game.movementRange(unit);
    this.renderer.highlights = null;
    if ((unit.shifted || !unit.type.move) && (unit.type.rngG || unit.type.rngA)) {
      this.openActionMenu(unit);
      return;
    }
    if (unit.type.move) { this.beginShift(unit); return; }
    var self = this, menu = $("action-menu");
    menu.innerHTML = "";
    actionButton(menu, "Close", function () { self.deselect(); });
    menu.classList.remove("hidden");
    this.draw();
  };

  GameUI.prototype.beginShift = function (unit) {
    if (this.mode !== "command" || this.selected !== unit || unit.moved || unit.shifted || !unit.type.move) return;
    this.closeActionMenu();
    this.unloadCargo = null;
    this.mode = "unitSelected";
    this.range = this.game.movementRange(unit);
    var hl = {};
    for (var k in this.range) {
      var rec = this.range[k];
      if (rec.load) hl[k] = "rgba(120,200,255,0.55)";
      else if (rec.canStop) hl[k] = "rgba(70,150,255,0.38)";
    }
    this.pickTargets = this.previewTargets(unit);
    this.pickTargets.forEach(function (target) {
      hl[HEX.key(target.col, target.row)] = "rgba(255,80,60,0.55)";
    });
    this.renderer.highlights = hl;
    this.showFiringRange(unit, false);
    var self = this, menu = $("action-menu");
    menu.innerHTML = "";
    var canAttack = this.pickTargets.length > 0;
    if (unit.type.rngG || unit.type.rngA) {
      var attack = actionButton(menu, "Attack", function () { self.openActionMenu(unit, true); }, !canAttack);
      attack.title = unit.attacked ? "Already attacked this turn" : canAttack ? "Attack from this hex" : "No targets in range";
    }
    actionButton(menu, "Cancel", function () { self.deselect(); });
    this.showTransportActions(unit, menu);
    menu.classList.remove("hidden");
    this.draw();
  };

  GameUI.prototype.previewTargets = function (unit) {
    return this.game.legalAttackTargets(unit);
  };

  // Find pending activations in the board state, including after save/reload
  // or Undo has cleared UI selection. Merely inspecting a ready unit spends
  // nothing; leaving a moved unit or a buggy's post-attack retreat ends it.
  GameUI.prototype.finishPendingActivations = function (keepUnit) {
    if (this.game.winner !== null) return;
    var pending = this.game.playerUnits(this.game.currentPlayer).filter(function (unit) {
      return unit !== keepUnit && !unit.moved && (unit.shifted || unit.attacked);
    });
    if (!pending.length) return;
    pending.forEach(function (unit) { this.finishActivation(unit); }, this);
    this.refreshStatus();
    this.checkGameOver();
  };

  GameUI.prototype.deselect = function () {
    this.finishPendingActivations();
    this.clearSelection();
  };

  // Internal UI transitions and history restoration keep an activation open.
  GameUI.prototype.clearSelection = function () {
    this.selected = null;
    this.mode = "idle";
    this.range = null;
    this.pickTargets = [];
    this.unloadCargo = null;
    this.renderer.highlights = null;
    this.renderer.fireRange = null;
    $("range-legend").classList.add("hidden");
    this.closeActionMenu();
    this.draw();
  };

  GameUI.prototype.tryMove = function (unit, col, row) {
    var rec = this.range && this.range[HEX.key(col, row)];
    if (!rec || !rec.canStop) return false;
    var before = this.game.snapshot();
    var moved = this.game.moveUnit(unit, col, row, this.range);
    var events = this.game.finishMovement(unit), self = this;
    this.recordUndo(before, unitView.name(unit) + " move");
    this.clearSelection();
    this.busy = true;
    this.refreshStatus(); // Save the committed destination, never a visual intermediate hex.
    this.animateMovement(unit, moved.path, function () {
      self.busy = false;
      self.refreshStatus();
      self.showMoveEffects(events);
      self.checkGameOver();
      if (self.game.winner === null && !unit.inFactory && !unit.carriedBy &&
          (self.previewTargets(unit).length || unit.cargo.some(function (cargo) {
            return self.hasUnloadDestination(unit, cargo);
          }))) {
        self.selected = unit;
        self.openActionMenu(unit);
      }
    });
    return true;
  };

  GameUI.prototype.hasUnloadDestination = function (transport, cargoUnit) {
    return this.game.unloadTargets(transport, cargoUnit).length > 0;
  };

  GameUI.prototype.finishActivation = function (unit) {
    var before = this.game.snapshot();
    this.redoHistory = [];
    var events = this.game.finishUnit(unit);
    if (!unit.shifted) this.recordUndo(before, unitView.name(unit) + " end");
    this.showMoveEffects(events);
  };

  GameUI.prototype.commitUnit = function (unit) {
    this.finishActivation(unit);
    this.closeActionMenu();
    this.deselect();
    this.refreshStatus();
    this.checkGameOver();
    if (this.game.winner === null && !unit.inFactory && unit.cargo.some(function (cargo) {
      return this.hasUnloadDestination(unit, cargo);
    }, this)) {
      this.selected = unit;
      this.openActionMenu(unit);
    }
  };

  GameUI.prototype.showMoveEffects = function (events) {
    for (var i = 0; i < events.length; i++) {
      if (events[i].t === "capture") this.toast("Captured " + events[i].kind + "!");
      if (events[i].t === "repair") this.toast("Repaired to full strength");
    }
  };

  GameUI.prototype.enterUnload = function (transport, cargoUnit) {
    var self = this, g = this.game;
    var ns = g.unloadTargets(transport, cargoUnit);
    if (!ns.length) return;
    this.cancelEndTurn();
    this.closeActionMenu();
    this.selected = transport;
    this.mode = "unload";
    this.range = null;
    this.pickTargets = [];
    this.renderer.fireRange = null;
    $("range-legend").classList.add("hidden");
    this.unloadCargo = cargoUnit;
    var hl = {};
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      hl[HEX.key(n.col, n.row)] = "rgba(255,155,45,0.62)";
    }
    this.renderer.highlights = hl;
    var menu = $("action-menu");
    menu.innerHTML = "";
    var prompt = document.createElement("span");
    prompt.className = "deploy-prompt unload-prompt";
    prompt.textContent = "Unload " + unitView.name(cargoUnit) + " · orange hex";
    unitView.addIcon(prompt, cargoUnit);
    menu.appendChild(prompt);
    this.showTransportActions(transport, menu);
    if (g.canMoveNow(transport) && transport.type.move) actionButton(menu, "Move", function () {
      self.mode = "command";
      self.beginShift(transport);
    });
    if (this.previewTargets(transport).length) actionButton(menu, "Attack", function () { self.openActionMenu(transport, true); });
    actionButton(menu, "Cancel", function () { self.deselect(); });
    menu.classList.remove("hidden");
    this.draw();
  };

  /* --- input -------------------------------------------------------------- */

  GameUI.prototype.updateMapCursor = function () {
    this.canvas.style.cursor = this.dragging && this.dragging.pan && this.dragging.moved ? "grabbing" :
      this.ctrlDown ? "grab" : this.mode === "unitSelected" || this.mode === "deployPick" ||
      this.mode === "moved" || this.mode === "unload" ? "crosshair" : "default";
  };

  GameUI.prototype.onMouseDown = function (e) {
    if (e.button > 2) return;
    e.preventDefault();
    this.ctrlDown = !!e.ctrlKey;
    this.dragging = { x: e.offsetX, y: e.offsetY, moved: false,
      pan: e.button === 0 && !!e.ctrlKey, button: e.button };
    this.updateMapCursor();
  };

  GameUI.prototype.onMouseMove = function (e) {
    this.ctrlDown = !!e.ctrlKey;
    this.updateMapCursor();
    if (this.dragging) {
      var dx = e.offsetX - this.dragging.x, dy = e.offsetY - this.dragging.y;
      if (this.dragging.pan && (this.dragging.moved || Math.abs(dx) + Math.abs(dy) > 4)) {
        // Once a drag is recognized, releasing at a map boundary is still a
        // drag, even if constraints prevented the last camera movement.
        this.dragging.moved = true;
        this.renderer.panBy(dx, dy);
        this.dragging.x = e.offsetX; this.dragging.y = e.offsetY;
        this.renderer.hoverHex = null;
        $("unit-hover").classList.add("hidden");
        this.draw();
        return;
      }
      if (this.dragging.pan || this.dragging.button !== 0) return;
    }
    var hex = this.renderer.pixelToHex(e.offsetX, e.offsetY);
    var changed = HEX.key((this.renderer.hoverHex || {}).col, (this.renderer.hoverHex || {}).row) !==
                  HEX.key((hex || {}).col, (hex || {}).row);
    this.renderer.hoverHex = hex;
    // Show/hide the card in this event, before forecast work.
    this.updateHoverInfo();
    if (hex) {
      var u = this.game.unitAt(hex.col, hex.row);
      if (u && (this.mode === "moved" || this.mode === "unitSelected")) this.showCombatPreview(u);
    }
    if (changed) this.draw();
  };

  GameUI.prototype.onMouseLeave = function () {
    this.renderer.hoverHex = null;
    $("unit-hover").classList.add("hidden");
    this.draw();
  };

  GameUI.prototype.onMouseUp = function (e) {
    var wasDrag = this.dragging && this.dragging.pan;
    var button = this.dragging ? this.dragging.button : e.button;
    this.dragging = null;
    this.ctrlDown = !!e.ctrlKey;
    this.updateMapCursor();
    if (wasDrag) return;
    if (button !== 0) return;
    if (this._battlePlayback) { this.advanceBattle(); return; }
    if (this.busy || this.mode === "aiTurn" || this.mode === "battle" ||
        this.mode === "factory" || this.mode === "over") return;
    var hex = this.renderer.pixelToHex(e.offsetX, e.offsetY);
    if (!hex) return;
    this.onHexClick(hex.col, hex.row);
  };

  GameUI.prototype.onContextMenu = function (e) {
    e.preventDefault();
    this.dragging = null;
    this.onCancel(true);
    this.updateMapCursor();
  };

  GameUI.prototype.onCancel = function (undoMovement) {
    var confirming = this._endTurnConfirmation;
    this.cancelEndTurn();
    if (confirming) return;
    if (this.busy || this.mode === "aiTurn" || this.mode === "over") return;
    if (this.mode === "battle") return;
    if (this.mode === "unload") this.deselect();
    else if (this.mode === "deployPick") this.cancelDeployment(true);
    else if (this.mode === "factory") this.closeFactoryPanel();
    else if (undoMovement && (this.mode === "idle" ||
      (this.mode === "moved" && this.selected && this.selected.shifted)) && this.canUndo()) this.undoLast();
    else this.deselect();
  };

  GameUI.prototype.onKey = function (e) {
    this.ctrlDown = !!e.ctrlKey;
    this.updateMapCursor();
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if ((e.ctrlKey || e.metaKey) && !e.altKey && /^(z|y)$/i.test(e.key)) {
      e.preventDefault();
      if (!e.repeat) {
        if (e.shiftKey || e.key.toLowerCase() === "y") this.redoLast(); else this.undoLast();
      }
      return;
    }
    if (e.key === "Escape") { this.onMouseLeave(); this.onCancel(); }
    if (e.key === "e" && !e.repeat && this.mode === "idle") this.endTurn();
  };

  GameUI.prototype.onWheel = function (e) {
    e.preventDefault();
    var r = this.renderer;
    var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    var nz = Math.min(4, Math.max(r.minimumZoom(), r.zoom * factor));
    // zoom about cursor
    r.originX = e.offsetX - (e.offsetX - r.originX) * (nz / r.zoom);
    r.originY = e.offsetY - (e.offsetY - r.originY) * (nz / r.zoom);
    r.zoom = nz;
    r.constrainView();
    r.hoverHex = r.pixelToHex(e.offsetX, e.offsetY);
    this.updateHoverInfo();
    this.draw();
  };

  GameUI.prototype.onHexClick = function (col, row) {
    if (this.busy) return;
    this.cancelEndTurn();
    this.closeWarDock();
    var g = this.game;
    var self = this;
    var unit = g.unitAt(col, row);
    if (this.mode === "enemyInspect") this.deselect();
    if (this.mode === "command") {
      if (unit === this.selected) return;
      this.deselect();
    }


    if (this.mode === "unload") {
      var t = this.selected;
      try {
        var before = g.snapshot();
        var cargoName = unitView.name(this.unloadCargo);
        g.unload(t, this.unloadCargo, col, row);
        this.recordUndo(before, cargoName + " unload");
        this.deselect();
        this.refreshStatus();
        this.checkGameOver();
      } catch (err) { this.toast(err.message); }
      return;
    }

    if (this.mode === "deployPick") {
      var pend = this.deployPending;
      var deployed = false;
      this.closeActionMenu();
      var chosen = this.renderer.highlights && this.renderer.highlights[HEX.key(col, row)];
      this.renderer.highlights = null;
      this.deployPending = null;
      this.mode = "idle";
      if (pend && chosen) {
        try {
          var transport = null;
          for (var j = 0; j < pend.transports.length; j++) {
            if (pend.transports[j].col === col && pend.transports[j].row === row) {
              transport = pend.transports[j];
              break;
            }
          }
          var before = g.snapshot();
          if (transport) g.loadFromFactory(pend.building, pend.unit, transport);
          else g.deployFromFactory(pend.building, pend.unit, col, row);
          this.recordUndo(before, unitView.name(pend.unit) + " deployment");
          deployed = true;
        }
        catch (err) { this.toast(err.message); }
        this.refreshStatus();
      }
      if (pend && pend.building.stored.length && (!deployed || pend.building.stored.some(function (reserve) {
        return g.deployTargets(pend.building, reserve).length || g.transportDeployTargets(pend.building, reserve).length;
      }))) this.openFactoryPanel(pend.building);
      else this.closeFactoryPanel();
      this.draw();
      return;
    }

    if (this.mode === "moved") {
      if (unit === this.selected) return;
      if (unit && this.pickTargets.indexOf(unit) >= 0) {
        this.closeActionMenu();
        this.quickAttack(this.selected, unit);
        return;
      }
      this.deselect();
    }

    if (this.mode === "unitSelected") {
      if (unit && this.pickTargets.indexOf(unit) >= 0) {
        this.quickAttack(this.selected, unit);
        return;
      }
      if (unit === this.selected) { this.tryMove(unit, col, row); return; }
      if (this.range && this.range[HEX.key(col, row)] && this.range[HEX.key(col, row)].load &&
          this.tryMove(this.selected, col, row)) return;
      if (unit && unit.player === g.currentPlayer) { this.deselect(); this.selectUnit(unit); return; }
      if (unit && unit.player !== g.currentPlayer) {
        this.inspectEnemy(unit); return;
      }
      if (this.tryMove(this.selected, col, row)) return;
      this.deselect();
      // An unreachable owned factory may still offer reserve deployment.
    }

    // idle
    if (unit && unit.player === g.currentPlayer) { this.selectUnit(unit); return; }
    if (unit) { this.inspectEnemy(unit); return; }
    this.deselect();
    var b = g.buildingAt(col, row);
    if (b) {
      this.openFactoryPanel(b);
      return;
    }
  };

  GameUI.prototype.quickAttack = function (unit, enemy) {
    var g = this.game, self = this;
    if ((this.mode !== "moved" && this.mode !== "unitSelected") || this.previewTargets(unit).indexOf(enemy) < 0) return;
    this.showBattle(unit, enemy, function () {
      if (g.units.indexOf(unit) >= 0 && unit.type.moveAfterAttack && unit.movePointsLeft > 0 && !unit.moved) self.selectUnit(unit);
      else self.deselect();
      self.refreshStatus(); self.checkGameOver();
    });
  };

  /* --- turns ---------------------------------------------------------------- */

  GameUI.prototype.finishAITurn = function () {
    if (this._aiTurn && this._aiTurn.destroy) this._aiTurn.destroy();
    this._aiTurn = null;
    this.selected = null;
    this.renderer.highlights = null;
    if (this._dockShowsSelection) this.closeWarDock();
    this.hideWatchPanel();
    this.hideBattleScreen();
    if (this.game.winner === null) this.game.endTurn();
    this.busy = false;
    this.mode = this.game.winner === null ? "idle" : "over";
    this.refreshStatus();
    this.draw();
    this.checkGameOver();
  };

  GameUI.prototype.nextAIEvent = function () {
    try { return this._aiTurn.next(); }
    catch (error) {
      if (this._aiTurn.destroy) this._aiTurn.destroy();
      this._aiTurn = null;
      // Preserve the turn-start checkpoint and leave Save & Menu available.
      // Never turn a failed search into a passed turn or a different opponent.
      this.busy = true;
      $("status-player").textContent = "AI stopped — Save & Menu to retry";
      this.toast("AI error: " + error.message);
      return {t:"error"};
    }
  };

  GameUI.prototype.runNextAIEvent = function () {
    if (this.destroyed || !this._aiTurn) return;
    if (!this.watchAI) { this.runFastAITurn(); return; }
    var event = this.nextAIEvent();
    if (event && event.t === "error") return;
    if (event && event.t === "thinking") {
      $("status-player").textContent = RENDER.PLAYER_COLORS[this.game.currentPlayer].name + " · " +
        opponents.get(this.opponent).label + " (thinking…)";
      var waiting = this;
      this._aiTimer = setTimeout(function () { waiting.runNextAIEvent(); }, 25);
      return;
    }
    if (!event) {
      this.finishAITurn();
      return;
    }

    var delay = 40;
    if (event.t === "deploy" || event.t === "move") {
      this.selected = event.unit;
      this.renderer.flashUnits = {};
      this.renderer.flashUnits[event.unit.id] = "#bfe95c";
      this.showWatchMove(event);
      this.hideBattleScreen();
      var path = event.path || [event.from || {col: event.building.col, row: event.building.row}, event.to];
      var moving = this;
      this.animateMovement(event.unit, path, function () {
        moving._aiTimer = setTimeout(function () { moving.runNextAIEvent(); }, 250);
      });
      this.refreshStatus(); this.draw();
      return;
    } else if (event.t === "battle-preview") {
      this.selected = event.attacker;
      var previewing = this;
      this.playCombatEffects(event.attacker, event.defender, event.preview, function () {
        previewing.showWatchPreview(event);
        $("battle-stage").style.setProperty("--battle-approach", 1);
        previewing.playBattleTimeline(1600, function (elapsed) {
          $("battle-stage").style.setProperty("--battle-approach", Math.max(0, 1 - elapsed / 800));
        }, function () { previewing.runNextAIEvent(); });
        if (previewing._advanceBattle) previewing.advanceBattle();
      });
      this.refreshStatus(); this.draw();
      return;
    } else if (event.t === "battle") {
      this.selected = event.result.attackerDead ? null : event.attacker;
      var fighting = this;
      this.showWatchResult(event, function () {
        fighting.hideBattleScreen();
        fighting.showAftermath(event.attacker, event.defender, event.result);
        fighting.runNextAIEvent();
      });
      this.refreshStatus(); this.draw();
      return;
    } else if (event.t === "finish") {
      this.selected = event.unit;
      var effect = event.effects[0];
      var text = effect.t === "capture" ? "captured " + effect.kind : "repaired to full strength";
      this.showWatchPanel(battleReport.faction(event.unit.player) + " selected", "<div class='war-verb'>" +
        unitView.html(event.unit) + " " + esc(text) + "</div>");
      delay = 900;
    }

    this.refreshStatus();
    this.draw();
    if (!this.watchAI) {
      this.hideWatchPanel();
      this.closeWarDock();
      delay = 0;
    }
    var self = this;
    this._aiTimer = setTimeout(function () { self.runNextAIEvent(); }, delay);
  };

  GameUI.prototype.cancelEndTurn = function () {
    this._endTurnConfirmation = null;
    $("end-turn-warning").classList.add("hidden");
    $("btn-endturn").textContent = "End Turn (E)";
  };

  GameUI.prototype.remainingActions = function () {
    var available = this.game.remainingTurnActions();
    return {field: available.field.length, reserves: available.reserves.length, available: available};
  };

  GameUI.prototype.endTurn = function (confirmed) {
    if (this.mode === "over" || this.mode === "battle" || this.busy) return;
    var g = this.game, self = this;
    var remaining = this.remainingActions(), total = remaining.field + remaining.reserves;
    if (total) {
      var state = JSON.stringify(g.snapshot());
      if (!confirmed || this._endTurnConfirmation !== state) {
        this._endTurnConfirmation = state;
        var messages = [];
        if (remaining.field) messages.push(remaining.field + " field unit" + (remaining.field === 1 ? " has" : "s have") + " a legal action.");
        if (remaining.reserves) messages.push(remaining.reserves + " reserve" + (remaining.reserves === 1 ? " has" : "s have") +
          " an open deployment destination. Deployment uses the unit’s turn.");
        $("end-turn-warning-text").textContent = messages.join(" ") + " Finish anyway?";
        var list = $("end-turn-available");
        list.innerHTML = "";
        remaining.available.field.concat(remaining.available.reserves).forEach(function (entry) {
          var label = (entry.building ? "Deploy " : "Inspect ") + unitView.name(entry.unit);
          var button = actionButton(list, label, function () {
            self.cancelEndTurn(); self.clearSelection();
            if (entry.building) self.openFactoryPanel(entry.building);
            else self.selectUnit(entry.unit);
          });
          unitView.addIcon(button, entry.unit);
        });
        $("end-turn-warning").classList.remove("hidden");
        var keep = $("btn-keep-playing");
        if (keep.focus) keep.focus({preventScroll: true});
        return;
      }
    }
    this.cancelEndTurn();
    this.closeFactoryPanel();
    this.deselect();
    this.clearUndo();
    g.endTurn();
    this.refreshStatus();
    this.checkGameOver();
    if (g.winner !== null) return;

    if (this.options.hotseat) { this.toast(RENDER.PLAYER_COLORS[g.currentPlayer].name + " — your turn"); this.draw(); return; }

    this.beginAITurn();
  };

  GameUI.prototype.beginAITurn = function () {
    var self = this, g = this.game;
    // A resumed AI turn starts from its saved turn-boundary checkpoint.
    this.mode = "aiTurn";
    this.busy = true;
    this.closeWarDock();
    this.hideBattleScreen();
    this.clearUndo();
    $("status-player").textContent = RENDER.PLAYER_COLORS[g.currentPlayer].name + " (thinking…)";
    this._aiTimer = setTimeout(function () {
      if (self.destroyed) return;
      self._aiTurn = AI.createTurn(g, g.currentPlayer, {id:self.opponent || "classic", async:true});
      if (self.watchAI) self.runNextAIEvent();
      else self.runFastAITurn();
    }, this.watchAI ? 300 : 0);
  };

  GameUI.prototype.runFastAITurn = function () {
    if (this.destroyed || !this._aiTurn) return;
    if (this.watchAI) { this.runNextAIEvent(); return; }
    // Consume the same deterministic actions without collecting animation
    // events. Long turns yield between actions so the browser stays usable.
    var deadline=Date.now()+8;
    do {
      var event = this.nextAIEvent();
      if (event && event.t === "error") return;
      if (!event) { this.finishAITurn(); return; }
      if (event.t === "thinking") break;
    } while (Date.now()<deadline);
    var self=this;
    this._aiTimer=setTimeout(function(){self.runFastAITurn();},event && event.t === "thinking" ? 16 : 0);
  };

  GameUI.prototype.checkGameOver = function () {
    var g = this.game;
    if (g.winner === null) return;
    this.mode = "over";
    this.clearUndo();
    var reasons = {
      base: "base captured",
      elimination: "all enemy forces destroyed",
      turnlimit: "turn limit reached",
    };
    var msg = RENDER.PLAYER_COLORS[g.winner].name + " wins — " + (reasons[g.winReason] || g.winReason);
    $("gameover-text").textContent = msg;
    $("gameover-panel").classList.remove("hidden");
    this.onGameOver(g.winner);
  };

  GameUI.prototype.toast = function (msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(this._toastT);
    this._toastT = setTimeout(function () { el.classList.add("hidden"); }, 2200);
  };

  return { GameUI: GameUI, hoverPosition: hoverPosition };
})();

if (typeof module !== "undefined") module.exports = UI;
