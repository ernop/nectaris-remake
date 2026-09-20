/* Nectaris remake — game UI: input handling, action flow, panels.
 *
 * Interaction model (mirrors the original's flow, minus its screen limits):
 *   click own unit  -> show movement destinations only
 *   click dest hex  -> unit steps there; enemies stay directly clickable
 *   hover red enemy -> inspect calculations and independent casualty forecast
 *   click red enemy -> resolve from the chosen position
 *   End             -> commit this unit without attacking
 *   Cancel          -> unit returns to where it was
 * Right-click / Esc cancels. Wheel zooms; middle/right-drag pans only on axes
 * where the zoomed map is larger than the viewport.
 */
"use strict";

var UI = (function () {

  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function experienceStarsHtml(level) {
    if (level === COMBAT.MAX_EXP) {
      return "<div class='exp-master' aria-label='General experience rank'>" +
        "<span class='exp-master-star'></span><strong>GENERAL</strong></div>";
    }
    var capacities = [3, 2, 3];
    var slot = 0;
    var columns = capacities.map(function (capacity) {
      var stars = "";
      for (var i = 0; i < capacity; i++, slot++) {
        stars += "<span class='exp-star-slot" + (slot < level ? " filled" : "") + "'></span>";
      }
      return "<span class='exp-star-column'>" + stars + "</span>";
    }).join("");
    return "<div class='exp-columns' aria-label='Experience " + level + " of 8'>" +
      columns + "</div>";
  }

  function experienceEffectHtml(level) {
    var bonus = COMBAT.experienceBonus(level);
    return "<div class='exp-effect'>Damage +" + bonus.damage + "%</div>";
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
    this.renderer = new RENDER.Renderer(canvas, game);
    this.mode = "idle"; // idle | unitSelected | moved | unload | factory | deployPick | battle | aiTurn | over
    this.selected = null;
    this.range = null;
    this.pendingMoveFrom = null;   // {col,row,movePointsLeft,attackSpent}
    this.busy = false;
    this.destroyed = false;
    this.watchAI = localStorage.getItem("nectaris-watch-ai") !== "off";
    this.onGameOver = this.options.onGameOver || function () {};

    // Keep exact function references so destroy() can remove every listener.
    // Starting a second map used to leave the first map's listeners alive;
    // both renderers then painted the same canvas, producing visible flashing.
    this.handlers = {
      resize: function () { self.resize(); },
      mousedown: function (e) { self.onMouseDown(e); },
      mousemove: function (e) { self.onMouseMove(e); },
      mouseup: function (e) { self.onMouseUp(e); },
      windowMouseup: function () { self.dragging = null; },
      wheel: function (e) { self.onWheel(e); },
      contextmenu: function (e) { e.preventDefault(); },
      keydown: function (e) { self.onKey(e); },
    };

    this.resize();
    window.addEventListener("resize", this.handlers.resize);
    window.addEventListener("mouseup", this.handlers.windowMouseup);
    canvas.addEventListener("mousedown", this.handlers.mousedown);
    canvas.addEventListener("mousemove", this.handlers.mousemove);
    canvas.addEventListener("mouseup", this.handlers.mouseup);
    canvas.addEventListener("wheel", this.handlers.wheel, { passive: false });
    canvas.addEventListener("contextmenu", this.handlers.contextmenu);
    document.addEventListener("keydown", this.handlers.keydown);

    $("btn-endturn").onclick = function () { self.endTurn(); };
    $("btn-menu").onclick = this.options.onMenu || function () { location.reload(); };
    $("btn-watch").onclick = function () {
      self.watchAI = !self.watchAI;
      localStorage.setItem("nectaris-watch-ai", self.watchAI ? "on" : "off");
      self.refreshWatchButton();
    };

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
      self.renderer.fitToMap();
      if (self.mode === "factory" && self.inspectedFactory) self.openFactoryPanel(self.inspectedFactory);
      self.draw();
    });
    styleSel.value = RENDER.getStyle();
    styleSel.onchange = function () {
      RENDER.setStyle(styleSel.value);
      iconSel.disabled = RENDER.getStyle() !== "pixel";
      self.renderer.constrainView();
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
    if (this.pendingMoveFrom && this.selected && !(this.mode === "battle" && this.busy)) {
      var id = this.selected.id;
      var unit = state.units.find(function (u) { return u.id === id; });
      if (unit) {
        var original = Object.assign({}, this.pendingMoveFrom);
        delete original.logLength;
        Object.assign(unit, original);
      }
      if (this.pendingMoveFrom.logLength !== undefined) state.log.length = this.pendingMoveFrom.logLength;
    }
    return state;
  };

  GameUI.prototype.resize = function () {
    var wrap = this.canvas.parentElement;
    this.canvas.width = wrap.clientWidth;
    this.canvas.height = Math.max(1, wrap.clientHeight - $("map-action-rail").offsetHeight);
    if (this.renderer) { this.renderer.fitToMap(); this.draw(); }
  };

  GameUI.prototype.draw = function () {
    var self = this;
    if (this.destroyed || this._drawPending) return;
    this._drawPending = true;
    this._drawFrame = requestAnimationFrame(function () {
      self._drawPending = false;
      if (self.destroyed) return;
      self.renderer.selected = self.selected;
      self.renderer.draw();
      self.positionActionMenu();
    });
  };

  GameUI.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this._unsubscribeIconSet) this._unsubscribeIconSet();
    var h = this.handlers;
    window.removeEventListener("resize", h.resize);
    window.removeEventListener("mouseup", h.windowMouseup);
    this.canvas.removeEventListener("mousedown", h.mousedown);
    this.canvas.removeEventListener("mousemove", h.mousemove);
    this.canvas.removeEventListener("mouseup", h.mouseup);
    this.canvas.removeEventListener("wheel", h.wheel);
    this.canvas.removeEventListener("contextmenu", h.contextmenu);
    document.removeEventListener("keydown", h.keydown);
    cancelAnimationFrame(this._drawFrame);
    cancelAnimationFrame(this._battleAnimationFrame);
    clearTimeout(this._toastT);
    clearTimeout(this._aiTimer);
    this._aiTurn = null;
    this.closeActionMenu();
    this.closeFactoryPanel();
    $("battle-panel").classList.add("hidden");
    $("watch-panel").classList.add("hidden");
  };

  /* --- status / panels ------------------------------------------------- */

  GameUI.prototype.refreshStatus = function () {
    var g = this.game;
    $("status-turn").textContent = "Turn " + g.turn + " / " + g.turnLimit;
    var pc = RENDER.PLAYER_COLORS[g.currentPlayer];
    var el = $("status-player");
    el.textContent = pc.name;
    el.style.color = pc.light;
    var counts = [g.playerUnits(0).length, g.playerUnits(1).length];
    $("status-units").textContent = "Units " + counts[0] + " : " + counts[1];
    var hovered = this.renderer.hoverHex;
    if (hovered) this.showHexInfo(hovered.col, hovered.row);
    if (this.options && this.options.onStateChange) this.options.onStateChange(this);
  };

  GameUI.prototype.refreshWatchButton = function () {
    var button = $("btn-watch");
    button.textContent = "Watch AI: " + (this.watchAI ? "On" : "Off");
    button.setAttribute("aria-pressed", this.watchAI ? "true" : "false");
  };

  GameUI.prototype.showWatchPanel = function (title, detail) {
    $("watch-title").textContent = title;
    $("watch-detail").innerHTML = detail;
    $("watch-panel").classList.remove("hidden");
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
    this.showWatchPanel(
      event.t === "deploy" ? "XENON DEPLOYMENT" : "XENON MOVEMENT",
      "<div class='watch-move'><strong>" + esc(event.unit.type.name) + "</strong> " +
        esc(action) +
      "</div>"
    );
  };

  GameUI.prototype.showWatchPreview = function (event) {
    // The attacker is identified by its deep-red body (as in the original);
    // the defender gets a white ring so the pair reads as one matchup.
    this.renderer.flashUnits = {};
    this.renderer.attackingUnitId = event.attacker.id;
    this.renderer.flashUnits[event.defender.id] = "#ffffff";
    this.showWatchPanel(
      "XENON ATTACK",
      "<div class='watch-matchup'>" +
        "<div class='watch-side'>" + esc(event.attacker.type.name) +
          "<div class='watch-strength'>strength " + event.attackerBefore + "</div></div>" +
        "<div class='watch-versus'>VERSUS</div>" +
        "<div class='watch-side'>" + esc(event.defender.type.name) +
          "<div class='watch-strength'>strength " + event.defenderBefore + "</div></div>" +
      "</div>"
    );
  };

  GameUI.prototype.showWatchResult = function (event) {
    this.renderer.flashUnits = {};
    this.renderer.attackingUnitId = event.attacker.id;
    $("watch-title").textContent = "BATTLE RESULT";
    $("watch-panel").classList.remove("hidden");
    return this.animateBattleResult(event, $("watch-detail"));
  };

  GameUI.prototype.animateBattleResult = function (event, detail, onComplete) {
    cancelAnimationFrame(this._battleAnimationFrame);
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
    var duration = Math.max(1000, Math.min(2000, largestLoss * 320));
    var start = null;
    this.renderer.battleGhosts = [event.attacker, event.defender];

    function sideHtml(unit, before, current, finished) {
      var status = "";
      if (finished) {
        status = current === 0 ?
          "<div class='watch-destroyed'>squad destroyed</div>" :
          "<div class='watch-survived'>" + current + " survived</div>";
      }
      return "<div class='watch-side'>" + esc(unit.type.name) +
        "<div class='watch-strength'>" + before + " =&gt; " + current + "</div>" +
        status + "</div>";
    }

    function casualtyState(before, losses, progress, unit, seed) {
      if (!losses) return before;
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

    function frame(timestamp) {
      if (self.destroyed) return;
      if (start === null) start = timestamp;
      var progress = Math.min(1, (timestamp - start) / duration);
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
      detail.innerHTML = "<div class='watch-matchup'>" +
        sideHtml(event.attacker, event.attackerBefore, attackerCurrent, progress === 1) +
        "<div class='watch-versus'>RESULT</div>" +
        sideHtml(event.defender, event.defenderBefore, defenderCurrent, progress === 1) +
        "</div>";
      self.draw();

      if (progress < 1) {
        self._battleAnimationFrame = requestAnimationFrame(frame);
        return;
      }
      self.renderer.strengthOverrides = {};
      self.renderer.battleGhosts = [];
      self.renderer.explosions = [];
      self.renderer.attackingUnitId = null;
      self.draw();
      if (onComplete) onComplete();
    }

    this._battleAnimationFrame = requestAnimationFrame(frame);
    return duration;
  };

  GameUI.prototype.showUnitInfo = function (unit) {
    var el = $("unit-info");
    if (!unit) { el.innerHTML = ""; return; }
    var t = unit.type;
    var terr = this.game.terrainAt(unit.col, unit.row);
    var strCap = COMBAT.strengthCaption(unit.strength);
    el.innerHTML =
      "<div class='ui-name'>" + t.name + "</div>" +
      "<div class='experience-card'>" + experienceStarsHtml(unit.exp) +
      experienceEffectHtml(unit.exp) + "</div>" +
      "<table class='ui-stats'>" +
      (strCap ? "<tr><td>Strength</td><td>" + strCap + "</td></tr>" : "") +
      "<tr><td>Atk G / A</td><td>" + (t.atkG || "—") + " / " + (t.atkA || "—") + "</td></tr>" +
      "<tr><td>Defense</td><td>" + t.def + "</td></tr>" +
      "<tr><td>Move</td><td>" + (t.move || "—") + " (" + t.moveType + ")</td></tr>" +
      "<tr><td>Range G / A</td><td>" + bandText(t, false) + " / " + bandText(t, true) + "</td></tr>" +
      "<tr><td>Terrain</td><td>" + terr.name + " +" + (t.moveType === "air" ? 0 : terr.def) + " DEF</td></tr>" +
      (t.capture ? "<tr><td colspan='2'>Can capture buildings</td></tr>" : "") +
      (t.moveAfterAttack ? "<tr><td>Movement left</td><td>" + unit.movePointsLeft + " / " + t.move +
        "</td></tr><tr><td colspan='2'>May spend remaining movement after one attack</td></tr>" : "") +
      (t.moveOrFire ? "<tr><td colspan='2'>May move or fire, never both</td></tr>" : "") +
      "</table>";
  };

  GameUI.prototype.showHexInfo = function (col, row) {
    var terr = this.game.terrainAt(col, row);
    var b = this.game.buildingAt(col, row);
    var el = $("hex-info");
    var txt = terr.name + " · defense +" + terr.def;
    if (b) {
      var owner = b.owner < 0 ? "Neutral" : RENDER.PLAYER_COLORS[b.owner].name;
      txt += "<br>" + (b.kind === "base" ? "Base" : "Factory") + " — " + owner;
      if (b.stored.length) txt += " · " + b.stored.length + " stored";
      txt += "<br>" + (b.stored.length ? "Stored: " + b.stored.map(function (su) {
        return esc(su.type.name);
      }).join(", ") : "No stored units.");
      if (!this.game.unitAt(col, row) && this.mode === "idle") txt += "<br>Click to inspect.";
    }
    el.innerHTML = txt;
  };

  /* --- action menu ------------------------------------------------------ */

  /* Keep the compact controls clear of every attackable hex. At tight zoom
   * or map edges, the reserved rail is preferable to covering a target. */
  function actionPosition(center, size, targetCenters, width, height, viewWidth, viewHeight) {
    var below = center.y + size * 0.55 + 5;
    var candidates = [
      { x: center.x - width / 2, y: below },
      { x: center.x - width / 2, y: center.y + size + 8 },
      { x: center.x - size - width - 6, y: below },
      { x: center.x + size + 6, y: below },
    ];
    function clear(pos) {
      if (pos.x < 4 || pos.y < 4 || pos.x + width > viewWidth - 4 || pos.y + height > viewHeight - 4) return false;
      return targetCenters.every(function (target) {
        var rx = size + 3, ry = size * Math.sqrt(3) / 2 + 3;
        return pos.x + width < target.x - rx || pos.x > target.x + rx ||
          pos.y + height < target.y - ry || pos.y > target.y + ry;
      });
    }
    for (var i = 0; i < candidates.length; i++) if (clear(candidates[i])) return candidates[i];
    return { x: Math.max(4, Math.min(viewWidth - width - 4, center.x - width / 2)), y: viewHeight + 5 };
  }

  GameUI.prototype.positionActionMenu = function () {
    var menu = $("action-menu"), renderer = this.renderer;
    if (!this.selected || menu.classList.contains("hidden")) return;
    var centers = (this.pickTargets || []).map(function (target) { return renderer.hexCenter(target.col, target.row); });
    var pos = actionPosition(renderer.hexCenter(this.selected.col, this.selected.row),
      renderer.hexSize * renderer.zoom, centers, menu.offsetWidth, menu.offsetHeight,
      this.canvas.width, this.canvas.height);
    menu.style.left = Math.round(pos.x) + "px";
    menu.style.top = Math.round(pos.y) + "px";
  };

  GameUI.prototype.hideCombatPreview = function () {
    $("combat-inspector").classList.add("hidden");
    $("unit-info").classList.remove("hidden");
    this._previewKey = null;
    this._forecastCache = {};
    this.renderer.attackingUnitId = null;
    this.renderer.flashUnits = {};
  };

  GameUI.prototype.showCombatPreview = function (defender) {
    if (this.mode !== "moved" || !this.selected || this.pickTargets.indexOf(defender) < 0) return;
    var attacker = this.selected;
    var pv = COMBAT.preview(this.game, attacker, defender);
    var key = JSON.stringify([attacker.id, defender.id, attacker.strength, defender.strength, attacker.exp, defender.exp, pv]);
    if (this._previewKey === key) return;
    this._previewKey = key;
    if (!this._forecastCache) this._forecastCache = {};
    var forecast = this._forecastCache[key];
    if (!forecast) forecast = this._forecastCache[key] = COMBAT.forecast(attacker, defender, pv);
    $("combat-inspector").innerHTML = COMBAT_VIEW.html(attacker, defender, pv, forecast);
    $("combat-inspector").classList.remove("hidden");
    $("unit-info").classList.add("hidden");
    $("sidebar").scrollTop = 0;
    this.renderer.attackingUnitId = attacker.id;
    this.renderer.flashUnits = {};
    this.renderer.flashUnits[defender.id] = "#ffffff";
    this.draw();
  };

  GameUI.prototype.openActionMenu = function (unit) {
    var self = this;
    this.mode = "moved";
    this.hideCombatPreview();
    var menu = $("action-menu");
    menu.innerHTML = "";
    this.pickTargets = this.previewTargets(unit);
    this.renderer.highlights = {};
    this.pickTargets.forEach(function (target) {
      self.renderer.highlights[HEX.key(target.col, target.row)] = "rgba(255,80,60,0.55)";
    });
    function add(parent, label, fn) {
      var button = document.createElement("button");
      button.textContent = label;
      button.onclick = fn;
      parent.appendChild(button);
    }
    if (unit.moved) add(menu, "Close", function () { self.deselect(); });
    else {
      add(menu, "Cancel", function () { self.cancelMove(unit); });
      add(menu, "End", function () { self.commitUnit(unit); });
    }
    var targetList = $("attack-targets");
    targetList.innerHTML = "";
    this.pickTargets.forEach(function (target) {
      var button = document.createElement("button");
      button.textContent = target.type.name;
      button.setAttribute("aria-label", "Preview " + target.type.name + " at " + target.col + ", " + target.row);
      button.onfocus = button.onmouseenter = button.onclick = function () { self.showCombatPreview(target); };
      targetList.appendChild(button);
    });
    targetList.classList.remove("hidden");
    var transport = $("transport-actions");
    transport.innerHTML = "";
    (unit.cargo || []).forEach(function (cargo) {
      if (self.hasUnloadDestination(unit, cargo)) {
        add(transport, "Unload " + cargo.type.name, function () { self.enterUnload(unit, cargo); });
      }
    });
    transport.classList.remove("hidden");
    $("action-status").textContent = unit.moved ?
      "Transport has acted. Its ready passenger may still unload." : unit.attacked ?
      "Attack complete. End confirms this position; Cancel reverts only this move." : this.pickTargets.length ?
      "Hover to compare. Click a red target to attack." :
      "No attack from this position. Cancel reverts the move; End finishes this unit.";
    $("action-status").classList.remove("hidden");
    this.showUnitInfo(unit);
    menu.classList.remove("hidden");
    this.positionActionMenu();
    this.draw();
  };

  GameUI.prototype.closeActionMenu = function () {
    $("action-menu").classList.add("hidden");
    $("transport-actions").classList.add("hidden");
    $("attack-targets").classList.add("hidden");
    $("action-status").classList.add("hidden");
    this.hideCombatPreview();
  };

  /* --- factory panel ----------------------------------------------------- */

  GameUI.prototype.openFactoryPanel = function (building) {
    var self = this, g = this.game;
    this.inspectedFactory = building;
    var canDeploy = building.owner === g.currentPlayer;
    var owner = building.owner < 0 ? "Neutral" : RENDER.PLAYER_COLORS[building.owner].name;
    var panel = $("factory-panel");
    var list = $("factory-list");
    list.innerHTML = "";
    this.mode = "factory";
    $("factory-title").textContent =
      (building.kind === "base" ? "Base" : "Factory") + " — " + owner;
    $("factory-summary").textContent = building.stored.length ?
      building.stored.length + " stored unit" + (building.stored.length === 1 ? "" : "s") + ". " +
      (canDeploy ? "Choose a ready unit to deploy." : "Capture with infantry to deploy.") :
      "No stored units.";
    building.stored.forEach(function (su) {
      var row = document.createElement("div");
      row.className = "factory-row";
      var storedCap = COMBAT.strengthCaption(su.strength);
      var unit = document.createElement("div");
      unit.className = "factory-unit";
      var icon = document.createElement("canvas");
      icon.className = "factory-unit-icon";
      icon.width = 32;
      icon.height = 32;
      icon.setAttribute("role", "img");
      icon.setAttribute("aria-label", su.type.name + " unit icon");
      var details = document.createElement("div");
      details.className = "factory-unit-details";
      var name = document.createElement("strong");
      name.textContent = su.type.name;
      var stats = document.createElement("span");
      stats.textContent = (storedCap ? "Strength " + storedCap + " · " : "") +
        "Experience " + su.exp;
      details.appendChild(name);
      details.appendChild(stats);
      unit.appendChild(icon);
      unit.appendChild(details);
      row.appendChild(unit);
      RENDER.drawUnitIcon(icon, su);
      if (!canDeploy) {
        list.appendChild(row);
        return;
      }
      var groundTargets = g.deployTargets(building, su);
      var transportTargets = g.transportDeployTargets(building, su);
      var btn;
      if (su.moved) {
        btn = document.createElement("span");
        btn.className = "factory-unit-status";
        btn.textContent = "AVAILABLE NEXT TURN";
      } else if (!groundTargets.length && !transportTargets.length) {
        btn = document.createElement("span");
        btn.className = "factory-unit-status";
        btn.textContent = "NO DESTINATION";
      } else {
        btn = document.createElement("button");
        btn.textContent = "Deploy";
        btn.onclick = function () {
          try {
            var exits = g.deployTargets(building, su);
            var transports = g.transportDeployTargets(building, su);
            if (!exits.length && !transports.length) {
              throw new Error("No available deployment destination");
            }
            self.closeFactoryPanel();
            self.mode = "deployPick";
            self.deployPending = {
              building: building,
              unit: su,
              transports: transports,
            };
            var highlights = {};
            exits.forEach(function (exit) {
              highlights[HEX.key(exit.col, exit.row)] = "rgba(130,220,130,0.45)";
            });
            transports.forEach(function (transport) {
              highlights[HEX.key(transport.col, transport.row)] = "rgba(80,180,255,0.6)";
            });
            self.renderer.highlights = highlights;
            self.toast("Choose an adjacent hex or transport for " + su.type.name);
            self.draw();
          } catch (err) {
            self.toast(err.message);
          }
        };
      }
      row.appendChild(btn);
      list.appendChild(row);
    });
    $("factory-close").onclick = function () { self.closeFactoryPanel(); };
    panel.classList.remove("hidden");
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
    var panel = $("battle-panel");
    $("battle-title").textContent = "Battle result";
    panel.classList.remove("hidden");
    var attackerBefore = attacker.strength, defenderBefore = defender.strength;
    var result = g.attack(attacker, defender);
    this.refreshStatus();
    this.animateBattleResult({ attacker: attacker, defender: defender,
      attackerBefore: attackerBefore, defenderBefore: defenderBefore, result: result,
    }, $("battle-detail"), function () {
      panel.classList.add("hidden");
      self.busy = false;
      self.renderer.attackingUnitId = null;
      self.renderer.flashUnits = {};
      done(result);
    });
  };

  /* --- selection / movement flow ------------------------------------------- */

  GameUI.prototype.inspectEnemy = function (unit) {
    this.deselect();
    this.selected = unit;
    this.mode = "enemyInspect";
    // The enemy's last activation may be spent. Preview its next full turn
    // against the current board without resetting or mutating the real unit.
    var preview = Object.assign({}, unit, {
      moved: false, attacked: false, attackSpent: false, movePointsLeft: unit.type.move,
    });
    this.range = this.game.movementRange(preview);
    var highlights = {};
    for (var k in this.range) {
      if (this.range[k].canStop) highlights[k] = "rgba(255,180,65,0.38)";
    }
    this.renderer.highlights = highlights;
    this.showUnitInfo(unit);
    $("action-status").textContent = "Enemy movement · Orange hexes show its next-turn range on the current board, including terrain and ZOC. Inspection only. Esc to clear.";
    $("action-status").classList.remove("hidden");
    this.draw();
  };

  GameUI.prototype.selectUnit = function (unit) {
    if (unit.moved || (unit.attacked && !unit.type.moveAfterAttack)) {
      var self = this;
      if (unit.cargo.some(function (cargo) { return self.hasUnloadDestination(unit, cargo); })) {
        this.selected = unit;
        this.pendingMoveFrom = null;
        this.openActionMenu(unit);
      }
      return;
    }
    this.closeActionMenu();
    this.selected = unit;
    this.pickTargets = [];
    this.mode = "unitSelected";
    this.range = this.game.movementRange(unit);
    var hl = {};
    for (var k in this.range) {
      var rec = this.range[k];
      if (rec.load) hl[k] = "rgba(120,200,255,0.55)";
      else if (rec.canStop) hl[k] = "rgba(70,150,255,0.38)";
    }
    this.renderer.highlights = hl;
    this.showUnitInfo(unit);
    $("action-status").textContent = unit.attacked ?
      "Attack complete. " + unit.movePointsLeft + " movement points left. Choose a blue destination, or click this unit to stay." :
      "Choose a blue destination, or click this unit again to aim without moving.";
    $("action-status").classList.remove("hidden");
    this.draw();
  };

  GameUI.prototype.previewTargets = function (unit) {
    if (unit.moved || unit.attacked || (unit.type.moveOrFire && unit.attackSpent)) return [];
    return this.game.attackTargets(unit);
  };

  GameUI.prototype.deselect = function () {
    this.selected = null;
    this.mode = "idle";
    this.range = null;
    this.pendingMoveFrom = null;
    this.renderer.highlights = null;
    this.closeActionMenu();
    this.showUnitInfo(null);
    this.draw();
  };

  GameUI.prototype.tryMove = function (unit, col, row) {
    var rec = this.range && this.range[HEX.key(col, row)];
    if (!rec || !rec.canStop) return false;
    this.pendingMoveFrom = {
      col: unit.col, row: unit.row,
      movePointsLeft: unit.movePointsLeft, attackSpent: unit.attackSpent,
      logLength: this.game.log.length,
    };
    var res = this.game.moveUnit(unit, col, row, this.range);
    this.renderer.highlights = null;
    this.draw();
    if (res.loaded) {
      this.pendingMoveFrom = null; // loading commits immediately
      this.deselect();
      this.refreshStatus();
      return true;
    }
    if (rec.enterBuilding) {
      this.commitUnit(unit);
      return true;
    }

    this.mode = "moved";
    this.openActionMenu(unit);
    return true;
  };

  GameUI.prototype.hasUnloadDestination = function (transport, cargoUnit) {
    return this.game.unloadTargets(transport, cargoUnit).length > 0;
  };

  GameUI.prototype.cancelMove = function (unit) {
    if (this.pendingMoveFrom) {
      unit.col = this.pendingMoveFrom.col;
      unit.row = this.pendingMoveFrom.row;
      unit.movePointsLeft = this.pendingMoveFrom.movePointsLeft;
      unit.attackSpent = this.pendingMoveFrom.attackSpent;
      if (this.pendingMoveFrom.logLength !== undefined) this.game.log.length = this.pendingMoveFrom.logLength;
      this.pendingMoveFrom = null;
    }
    this.closeActionMenu();
    this.selectUnit(unit);
  };

  GameUI.prototype.commitUnit = function (unit) {
    var events = this.game.finishUnit(unit);
    this.closeActionMenu();
    this.pendingMoveFrom = null;
    this.deselect();
    this.refreshStatus();
    for (var i = 0; i < events.length; i++) {
      if (events[i].t === "capture") this.toast("Captured " + events[i].kind + "!");
      if (events[i].t === "repair") this.toast("Repaired to full strength");
    }
    this.checkGameOver();
  };

  GameUI.prototype.enterUnload = function (transport, cargoUnit) {
    var self = this, g = this.game;
    this.closeActionMenu();
    this.mode = "unload";
    this.unloadCargo = cargoUnit;
    var hl = {};
    var ns = g.unloadTargets(transport, cargoUnit);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      hl[HEX.key(n.col, n.row)] = "rgba(120,200,255,0.5)";
    }
    this.renderer.highlights = hl;
    this.draw();
  };

  /* --- input -------------------------------------------------------------- */

  GameUI.prototype.onMouseDown = function (e) {
    if (e.button === 2 || e.button === 1) {
      this.dragging = { x: e.offsetX, y: e.offsetY, moved: false, pan: true };
      return;
    }
    this.dragging = { x: e.offsetX, y: e.offsetY, moved: false, pan: false };
  };

  GameUI.prototype.onMouseMove = function (e) {
    if (this.dragging) {
      var dx = e.offsetX - this.dragging.x, dy = e.offsetY - this.dragging.y;
      if (this.dragging.pan && Math.abs(dx) + Math.abs(dy) > 4) {
        var viewMoved = this.renderer.panBy(dx, dy);
        this.dragging.x = e.offsetX; this.dragging.y = e.offsetY;
        if (viewMoved) {
          this.dragging.moved = true;
          this.draw();
        }
      }
      if (this.dragging.pan) return;
    }
    var hex = this.renderer.pixelToHex(e.offsetX, e.offsetY);
    var changed = HEX.key((this.renderer.hoverHex || {}).col, (this.renderer.hoverHex || {}).row) !==
                  HEX.key((hex || {}).col, (hex || {}).row);
    this.renderer.hoverHex = hex;
    if (hex) {
      this.showHexInfo(hex.col, hex.row);
      var u = this.game.unitAt(hex.col, hex.row);
      if (u && this.mode === "idle") this.showUnitInfo(u);
      if (u && this.mode === "moved") this.showCombatPreview(u);
    }
    if (changed) this.draw();
  };

  GameUI.prototype.onMouseUp = function (e) {
    var wasDrag = this.dragging && this.dragging.moved;
    var wasPan = this.dragging && this.dragging.pan;
    this.dragging = null;
    if (wasDrag) return;
    if (wasPan) { // plain right-click = cancel
      this.onCancel();
      return;
    }
    if (this.busy || this.mode === "aiTurn" || this.mode === "battle" ||
        this.mode === "factory" || this.mode === "over") return;
    var hex = this.renderer.pixelToHex(e.offsetX, e.offsetY);
    if (!hex) return;
    this.onHexClick(hex.col, hex.row);
  };

  GameUI.prototype.onCancel = function () {
    if (this.busy || this.mode === "aiTurn" || this.mode === "over") return;
    if (this.mode === "battle") return;
    if (this.mode === "moved" && this.selected && this.selected.moved) this.deselect();
    else if (this.mode === "moved" && this.selected) this.cancelMove(this.selected);
    else if (this.mode === "unload" && this.selected) { this.openActionMenu(this.selected); this.mode = "moved"; this.draw(); }
    else if (this.mode === "deployPick") { this.deployPending = null; this.deselect(); }
    else if (this.mode === "factory") this.closeFactoryPanel();
    else this.deselect();
  };

  GameUI.prototype.onKey = function (e) {
    if (e.key === "Escape") this.onCancel();
    if (e.key === "e" && this.mode === "idle") this.endTurn();
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
    this.draw();
  };

  GameUI.prototype.onHexClick = function (col, row) {
    var g = this.game;
    var self = this;
    var unit = g.unitAt(col, row);
    if (this.mode === "enemyInspect") this.deselect();


    if (this.mode === "unload") {
      var t = this.selected;
      try {
        g.unload(t, this.unloadCargo, col, row);
        // Unloading is the passenger's action. A provisional carrier move
        // becomes committed, but unloading in place leaves a ready carrier
        // free to move afterwards. Never allow Cancel to undo only the carrier.
        if (this.pendingMoveFrom && (t.col !== this.pendingMoveFrom.col || t.row !== this.pendingMoveFrom.row)) {
          this.commitUnit(t);
        } else {
          this.pendingMoveFrom = null;
          this.deselect();
          this.refreshStatus();
          this.checkGameOver();
        }
      } catch (err) { this.toast(err.message); }
      return;
    }

    if (this.mode === "deployPick") {
      var pend = this.deployPending;
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
          if (transport) g.loadFromFactory(pend.building, pend.unit, transport);
          else g.deployFromFactory(pend.building, pend.unit, col, row);
        }
        catch (err) { this.toast(err.message); }
        this.refreshStatus();
      }
      this.draw();
      return;
    }

    if (this.mode === "moved") {
      if (unit && this.pickTargets.indexOf(unit) >= 0) {
        this.closeActionMenu();
        this.quickAttack(this.selected, unit);
      }
      return;
    }

    if (this.mode === "unitSelected") {
      if (unit === this.selected) { this.mode = "moved"; this.openActionMenu(unit); return; }
      if (this.range && this.range[HEX.key(col, row)] && this.range[HEX.key(col, row)].load &&
          this.tryMove(this.selected, col, row)) return;
      if (unit && unit.player === g.currentPlayer) { this.deselect(); this.selectUnit(unit); return; }
      if (unit && unit.player !== g.currentPlayer) {
        this.inspectEnemy(unit); return;
      }
      if (this.tryMove(this.selected, col, row)) return;
      this.deselect();
      // An unreachable factory can still be inspected on this click.
    }

    // idle
    if (unit && unit.player === g.currentPlayer) { this.showUnitInfo(unit); this.selectUnit(unit); return; }
    if (unit) { this.inspectEnemy(unit); return; }
    var b = g.buildingAt(col, row);
    if (b) {
      this.openFactoryPanel(b);
      return;
    }
  };

  GameUI.prototype.quickAttack = function (unit, enemy) {
    var g = this.game, self = this;
    if (this.mode !== "moved" || this.previewTargets(unit).indexOf(enemy) < 0) return;
    this.showBattle(unit, enemy, function () {
      self.pendingMoveFrom = null;
      if (g.units.indexOf(unit) >= 0 && unit.type.moveAfterAttack && unit.movePointsLeft > 0 && !unit.moved) self.selectUnit(unit);
      else self.deselect();
      self.refreshStatus(); self.checkGameOver();
    });
  };

  /* --- turns ---------------------------------------------------------------- */

  GameUI.prototype.finishAITurn = function () {
    this._aiTurn = null;
    this.selected = null;
    this.hideWatchPanel();
    if (this.game.winner === null) this.game.endTurn();
    this.busy = false;
    this.mode = this.game.winner === null ? "idle" : "over";
    this.refreshStatus();
    this.draw();
    this.checkGameOver();
  };

  GameUI.prototype.runNextAIEvent = function () {
    if (this.destroyed || !this._aiTurn) return;
    var event = this._aiTurn.next();
    if (!event) {
      this.finishAITurn();
      return;
    }

    var delay = 40;
    if (event.t === "deploy" || event.t === "move") {
      this.selected = event.unit;
      this.renderer.flashUnits = {};
      this.renderer.flashUnits[event.unit.id] = "#bfe95c";
      this.showUnitInfo(event.unit);
      this.showWatchMove(event);
      delay = event.t === "deploy" ? 900 : 800;
    } else if (event.t === "battle-preview") {
      this.selected = event.attacker;
      this.showUnitInfo(event.attacker);
      this.showWatchPreview(event);
      delay = 1100;
    } else if (event.t === "battle") {
      this.selected = event.result.attackerDead ? null : event.attacker;
      delay = this.watchAI ? this.showWatchResult(event) + 350 : 0;
    } else if (event.t === "finish") {
      this.selected = event.unit;
      var effect = event.effects[0];
      var text = effect.t === "capture" ? "captured " + effect.kind : "repaired to full strength";
      this.showWatchPanel("XENON ACTION", "<div class='watch-move'><strong>" +
        esc(event.unit.type.name) + "</strong> " + esc(text) + "</div>");
      delay = 900;
    }

    this.refreshStatus();
    this.draw();
    if (!this.watchAI) {
      this.hideWatchPanel();
      delay = 0;
    }
    var self = this;
    this._aiTimer = setTimeout(function () { self.runNextAIEvent(); }, delay);
  };

  GameUI.prototype.endTurn = function () {
    if (this.mode === "over" || this.mode === "battle" || this.busy) return;
    var g = this.game, self = this;
    if (this.pendingMoveFrom && this.selected) this.cancelMove(this.selected);
    this.closeFactoryPanel();
    this.deselect();
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
    $("status-player").textContent = RENDER.PLAYER_COLORS[g.currentPlayer].name + " (thinking…)";
    this._aiTimer = setTimeout(function () {
      if (self.destroyed) return;
      if (!self.watchAI) {
        AI.playTurn(g, g.currentPlayer);
        self.finishAITurn();
        return;
      }
      self._aiTurn = AI.createTurn(g, g.currentPlayer);
      self.runNextAIEvent();
    }, 300);
  };

  GameUI.prototype.checkGameOver = function () {
    var g = this.game;
    if (g.winner === null) return;
    this.mode = "over";
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

  return { GameUI: GameUI, actionPosition: actionPosition };
})();

if (typeof module !== "undefined") module.exports = UI;
