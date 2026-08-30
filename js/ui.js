/* Nectaris remake — game UI: input handling, action flow, panels.
 *
 * Interaction model (mirrors the original's flow, minus its screen limits):
 *   click own unit  -> show movement range + attackable targets
 *   click dest hex  -> unit steps there; menu opens only when an action remains
 *   Attack          -> pick highlighted target, battle preview, resolve
 *   Finish          -> commit without attacking (captures/repairs apply)
 *   Cancel          -> unit returns to where it was
 * Right-click / Esc cancels. Wheel zooms; middle/right-drag pans.
 */
"use strict";

var UI = (function () {

  function $(id) { return document.getElementById(id); }

  function GameUI(canvas, game, options) {
    var self = this;
    this.canvas = canvas;
    this.game = game;
    this.options = options || {};
    this.renderer = new RENDER.Renderer(canvas, game);
    this.mode = "idle"; // idle | unitSelected | moved | pickTarget | battle | aiTurn | over
    this.selected = null;
    this.range = null;
    this.pendingMoveFrom = null;   // {col,row,movePointsLeft,attackSpent}
    this.busy = false;
    this.destroyed = false;
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

    var styleSel = $("style-select");
    styleSel.value = RENDER.getStyle();
    styleSel.onchange = function () {
      RENDER.setStyle(styleSel.value);
      self.refreshStatus();   // faction names/colors differ per style
      self.draw();
    };

    this.refreshStatus();
    this.renderer.fitToMap();
    this.draw();
  }

  GameUI.prototype.resize = function () {
    var wrap = this.canvas.parentElement;
    this.canvas.width = wrap.clientWidth;
    this.canvas.height = wrap.clientHeight;
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
    });
  };

  GameUI.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
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
    clearTimeout(this._toastT);
    clearTimeout(this._aiTimer);
    this.closeActionMenu();
    this.closeFactoryPanel();
    $("battle-panel").classList.add("hidden");
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
  };

  GameUI.prototype.showUnitInfo = function (unit) {
    var el = $("unit-info");
    if (!unit) { el.innerHTML = ""; return; }
    var t = unit.type;
    var terr = this.game.terrainAt(unit.col, unit.row);
    el.innerHTML =
      "<div class='ui-name'>" + t.name + "</div>" +
      "<table class='ui-stats'>" +
      "<tr><td>Strength</td><td>" + unit.strength + " / 8</td></tr>" +
      "<tr><td>Experience</td><td>" + unit.exp + (unit.exp >= 8 ? " ★" : "") + "</td></tr>" +
      "<tr><td>Atk G / A</td><td>" + (t.atkG || "—") + " / " + (t.atkA || "—") + "</td></tr>" +
      "<tr><td>Defense</td><td>" + t.def + "</td></tr>" +
      "<tr><td>Move</td><td>" + (t.move || "—") + " (" + t.moveType + ")</td></tr>" +
      "<tr><td>Range</td><td>" + (t.rmax ? t.rmin + "–" + t.rmax : "—") + "</td></tr>" +
      "<tr><td>Terrain</td><td>" + terr.name + " +" + (t.moveType === "air" ? 0 : terr.def) + "%</td></tr>" +
      (t.capture ? "<tr><td colspan='2'>Can capture buildings</td></tr>" : "") +
      (t.moveAfterAttack ? "<tr><td colspan='2'>May move after attacking</td></tr>" : "") +
      (t.rmax > 1 ? "<tr><td colspan='2'>Ranged: move or fire, no counters</td></tr>" : "") +
      "</table>";
  };

  GameUI.prototype.showHexInfo = function (col, row) {
    var terr = this.game.terrainAt(col, row);
    var b = this.game.buildingAt(col, row);
    var el = $("hex-info");
    var txt = terr.name + " · defense +" + terr.def + "%";
    if (b) {
      var owner = b.owner < 0 ? "Neutral" : RENDER.PLAYER_COLORS[b.owner].name;
      txt += "<br>" + (b.kind === "base" ? "Base" : "Factory") + " — " + owner;
      if (b.stored.length) txt += " · " + b.stored.length + " stored";
    }
    el.innerHTML = txt;
  };

  /* --- action menu ------------------------------------------------------ */

  GameUI.prototype.openActionMenu = function (unit) {
    var self = this, g = this.game;
    var menu = $("action-menu");
    menu.innerHTML = "";
    var targets = g.attackTargets(unit);
    var canAttack = targets.length > 0 && !(unit.type.rmax > 1 && unit.attackSpent) && !unit.attacked;

    function add(label, enabled, fn) {
      var b = document.createElement("button");
      b.textContent = label;
      b.disabled = !enabled;
      b.onclick = fn;
      menu.appendChild(b);
    }

    add("Attack", canAttack, function () { self.enterPickTarget(unit, targets); });

    // Unload options
    if (unit.cargo && unit.cargo.length) {
      unit.cargo.forEach(function (c) {
        add("Unload " + c.type.name, true, function () { self.enterUnload(unit, c); });
      });
    }

    // Factory panel if standing on own factory with stored units
    var b0 = g.buildingAt(unit.col, unit.row);

    add("Finish", true, function () { self.commitUnit(unit); });
    add("Cancel", !!this.pendingMoveFrom || !unit.attacked, function () { self.cancelMove(unit); });

    var ctr = this.renderer.hexCenter(unit.col, unit.row);
    menu.style.left = Math.min(this.canvas.width - 150, ctr.x + 30) + "px";
    menu.style.top = Math.max(10, ctr.y - 20) + "px";
    menu.classList.remove("hidden");
  };

  GameUI.prototype.closeActionMenu = function () {
    $("action-menu").classList.add("hidden");
  };

  /* --- factory panel ----------------------------------------------------- */

  GameUI.prototype.openFactoryPanel = function (building) {
    var self = this, g = this.game;
    var panel = $("factory-panel");
    var list = $("factory-list");
    list.innerHTML = "";
    $("factory-title").textContent =
      (building.kind === "base" ? "Base" : "Factory") + " — stored units";
    building.stored.forEach(function (su) {
      var row = document.createElement("div");
      row.className = "factory-row";
      row.innerHTML = "<span>" + su.type.name + " (str " + su.strength + ")</span>";
      var btn = document.createElement("button");
      btn.textContent = "Deploy";
      var occupied = !!g.unitAt(building.col, building.row);
      var canDeployHere = !occupied;
      btn.disabled = !canDeployHere && !su.type.placeByTransport;
      btn.onclick = function () {
        try {
          if (su.type.placeByTransport) {
            // must load onto adjacent transport
            var tr = self.findAdjacentTransport(building);
            if (!tr) { self.toast(su.type.name + " needs a transport on/next to the factory"); return; }
            g.loadFromFactory(building, su, tr);
          } else {
            g.deployFromFactory(building, su, building.col, building.row);
          }
          self.closeFactoryPanel();
          self.refreshStatus();
          self.draw();
        } catch (err) { self.toast(err.message); }
      };
      row.appendChild(btn);
      list.appendChild(row);
    });
    if (!building.stored.length) list.innerHTML = "<em>empty</em>";
    $("factory-close").onclick = function () { self.closeFactoryPanel(); };
    panel.classList.remove("hidden");
  };

  GameUI.prototype.findAdjacentTransport = function (building) {
    var g = this.game;
    var spots = [{ col: building.col, row: building.row }].concat(HEX.neighbors(building.col, building.row));
    for (var i = 0; i < spots.length; i++) {
      var u = g.unitAt(spots[i].col, spots[i].row);
      if (u && u.player === g.currentPlayer && u.type.cargo && u.cargo.length < u.type.cargo) return u;
    }
    return null;
  };

  GameUI.prototype.closeFactoryPanel = function () { $("factory-panel").classList.add("hidden"); };

  /* --- battle preview ----------------------------------------------------- */

  GameUI.prototype.showBattle = function (attacker, defender, done) {
    var self = this, g = this.game;
    var pv = COMBAT.preview(g, attacker, defender);
    var panel = $("battle-panel");
    panel.classList.remove("hidden");
    this.mode = "battle";

    function sideHtml(unit, calc, label) {
      var rows = calc.steps.map(function (s) {
        return "<tr><td>" + s.label + "</td><td>" + s.ap + "</td><td>" + s.da + "</td></tr>";
      }).join("");
      return "<div class='battle-side'><div class='ui-name'>" + label + ": " + unit.type.name +
        " (str " + unit.strength + ")</div>" +
        "<table class='battle-steps'><tr><th></th><th>ATK</th><th>DEF</th></tr>" + rows + "</table></div>";
    }
    $("battle-detail").innerHTML =
      sideHtml(attacker, pv.attacker, "Attacker") + sideHtml(defender, pv.defender, "Defender") +
      "<div class='battle-note'>" + (pv.ranged ? "Ranged strike — no counterattack." :
        (pv.counter ? "Defender will counterattack." : "Defender cannot counterattack.")) + "</div>";

    $("battle-fight").onclick = function () {
      var result = g.attack(attacker, defender);
      var msg = "Defender −" + result.dmgToDefender +
        (result.defenderDead ? " (destroyed)" : "") +
        (result.preview.counter ? " · Attacker −" + result.dmgToAttacker + (result.attackerDead ? " (destroyed)" : "") : "");
      $("battle-detail").innerHTML += "<div class='battle-result'>" + msg + "</div>";
      $("battle-fight").classList.add("hidden");
      $("battle-cancel").textContent = "Close";
      self.renderer.flashUnits = {};
      self.draw(); self.refreshStatus();
      $("battle-cancel").onclick = function () {
        panel.classList.add("hidden");
        $("battle-fight").classList.remove("hidden");
        $("battle-cancel").textContent = "Cancel";
        done(result);
      };
    };
    $("battle-cancel").textContent = "Cancel";
    $("battle-cancel").onclick = function () {
      panel.classList.add("hidden");
      done(null);
    };
  };

  /* --- selection / movement flow ------------------------------------------- */

  GameUI.prototype.selectUnit = function (unit) {
    if (unit.moved || (unit.attacked && !unit.type.moveAfterAttack)) return;
    this.selected = unit;
    this.mode = "unitSelected";
    this.range = this.game.movementRange(unit);
    var hl = {};
    for (var k in this.range) {
      var rec = this.range[k];
      if (rec.load) hl[k] = "rgba(120,200,255,0.55)";
      else if (rec.canStop) hl[k] = "rgba(70,150,255,0.38)";
    }
    // attackable targets from anywhere reachable (direct) or from here (ranged)
    var targets = this.previewTargets(unit);
    for (var i = 0; i < targets.length; i++) {
      hl[HEX.key(targets[i].col, targets[i].row)] = "rgba(255,80,60,0.45)";
    }
    this.renderer.highlights = hl;
    this.showUnitInfo(unit);
    this.draw();
  };

  GameUI.prototype.previewTargets = function (unit) {
    // direct attackers: any enemy adjacent to a reachable stop hex
    var g = this.game, out = [], seen = {};
    if (unit.type.rmax > 1) {
      if (!unit.attackSpent && !unit.attacked) return g.attackTargets(unit);
      return [];
    }
    if (unit.attacked) return [];
    for (var k in this.range) {
      var rec = this.range[k];
      if (!rec.canStop || rec.load) continue;
      var occ = g.unitAt(rec.col, rec.row);
      if (occ && occ !== unit) continue;
      var ns = HEX.neighbors(rec.col, rec.row);
      for (var i = 0; i < ns.length; i++) {
        var e = g.unitAt(ns[i].col, ns[i].row);
        if (e && e.player !== unit.player && !seen[e.id] &&
            COMBAT.atkStat(unit.type, COMBAT.isAir(e)) > 0) {
          seen[e.id] = true; out.push(e);
        }
      }
    }
    return out;
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
    var targets = this.game.attackTargets(unit);
    var canAttack = targets.length > 0 &&
      !(unit.type.rmax > 1 && unit.attackSpent) && !unit.attacked;
    var canUnload = unit.cargo && unit.cargo.length &&
      this.hasUnloadDestination(unit, unit.cargo[0]);
    // No decision remains: commit immediately. This removes the redundant
    // "Wait" click after ranged movement and ordinary non-combat moves.
    if (!canAttack && !canUnload) {
      this.commitUnit(unit);
      return true;
    }
    this.mode = "moved";
    this.openActionMenu(unit);
    return true;
  };

  GameUI.prototype.hasUnloadDestination = function (transport, cargoUnit) {
    var ns = HEX.neighbors(transport.col, transport.row);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      if (!this.game.inBounds(n.col, n.row) || this.game.unitAt(n.col, n.row)) continue;
      if (terrainCost(this.game.terrainAt(n.col, n.row), cargoUnit.type.moveType) !== null) return true;
    }
    return false;
  };

  GameUI.prototype.cancelMove = function (unit) {
    if (this.pendingMoveFrom) {
      unit.col = this.pendingMoveFrom.col;
      unit.row = this.pendingMoveFrom.row;
      unit.movePointsLeft = this.pendingMoveFrom.movePointsLeft;
      unit.attackSpent = this.pendingMoveFrom.attackSpent;
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

  GameUI.prototype.enterPickTarget = function (unit, targets) {
    this.closeActionMenu();
    this.mode = "pickTarget";
    this.pickTargets = targets;
    var hl = {};
    for (var i = 0; i < targets.length; i++) hl[HEX.key(targets[i].col, targets[i].row)] = "rgba(255,80,60,0.55)";
    this.renderer.highlights = hl;
    this.draw();
  };

  GameUI.prototype.enterUnload = function (transport, cargoUnit) {
    var self = this, g = this.game;
    this.closeActionMenu();
    this.mode = "unload";
    this.unloadCargo = cargoUnit;
    var hl = {};
    var ns = HEX.neighbors(transport.col, transport.row);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      if (!g.inBounds(n.col, n.row) || g.unitAt(n.col, n.row)) continue;
      if (terrainCost(g.terrainAt(n.col, n.row), cargoUnit.type.moveType) === null) continue;
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
      if (this.dragging.pan && Math.abs(dx) + Math.abs(dy) > 4) this.dragging.moved = true;
      if (this.dragging.pan && this.dragging.moved) {
        this.renderer.originX += dx; this.renderer.originY += dy;
        this.dragging.x = e.offsetX; this.dragging.y = e.offsetY;
        this.draw();
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
    if (this.busy || this.mode === "aiTurn" || this.mode === "battle" || this.mode === "over") return;
    var hex = this.renderer.pixelToHex(e.offsetX, e.offsetY);
    if (!hex) return;
    this.onHexClick(hex.col, hex.row);
  };

  GameUI.prototype.onCancel = function () {
    if (this.mode === "moved" && this.selected) this.cancelMove(this.selected);
    else if (this.mode === "pickTarget" && this.selected) { this.openActionMenu(this.selected); this.mode = "moved"; this.renderer.highlights = null; this.draw(); }
    else if (this.mode === "unload" && this.selected) { this.openActionMenu(this.selected); this.mode = "moved"; this.renderer.highlights = null; this.draw(); }
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
    var nz = Math.min(4, Math.max(0.2, r.zoom * factor));
    // zoom about cursor
    r.originX = e.offsetX - (e.offsetX - r.originX) * (nz / r.zoom);
    r.originY = e.offsetY - (e.offsetY - r.originY) * (nz / r.zoom);
    r.zoom = nz;
    this.draw();
  };

  GameUI.prototype.onHexClick = function (col, row) {
    var g = this.game;
    var self = this;
    var unit = g.unitAt(col, row);

    if (this.mode === "pickTarget") {
      var tgt = null;
      for (var i = 0; i < this.pickTargets.length; i++) {
        if (this.pickTargets[i].col === col && this.pickTargets[i].row === row) tgt = this.pickTargets[i];
      }
      if (!tgt) { this.onCancel(); return; }
      var attacker = this.selected;
      this.renderer.highlights = null;
      this.showBattle(attacker, tgt, function (result) {
        self.pendingMoveFrom = null;
        if (result && g.units.indexOf(attacker) >= 0 && attacker.type.moveAfterAttack && attacker.movePointsLeft > 0 && !attacker.moved) {
          self.selectUnit(attacker); // buggy: keep moving
        } else {
          self.deselect();
        }
        self.refreshStatus();
        self.checkGameOver();
      });
      return;
    }

    if (this.mode === "unload") {
      var t = this.selected;
      try {
        g.unload(t, this.unloadCargo, col, row);
        this.commitUnit(t);
      } catch (err) { this.toast(err.message); }
      return;
    }

    if (this.mode === "moved") return; // must use menu

    if (this.mode === "unitSelected") {
      if (unit === this.selected) { this.mode = "moved"; this.openActionMenu(unit); return; }
      if (unit && unit.player === g.currentPlayer) { this.deselect(); this.selectUnit(unit); return; }
      if (unit && unit.player !== g.currentPlayer) {
        // direct-attack shortcut: adjacent enemy in highlight
        var hlk = HEX.key(col, row);
        if (this.renderer.highlights && this.renderer.highlights[hlk] && this.canQuickAttack(this.selected, unit)) {
          this.quickAttack(this.selected, unit);
          return;
        }
        this.deselect(); this.showUnitInfo(unit); return;
      }
      if (this.tryMove(this.selected, col, row)) return;
      this.deselect();
      return;
    }

    // idle
    if (unit && unit.player === g.currentPlayer && !unit.moved) { this.selectUnit(unit); return; }
    if (unit) { this.showUnitInfo(unit); return; }
    var b = g.buildingAt(col, row);
    if (b && b.owner === g.currentPlayer && b.stored.length && !g.unitAt(col, row)) {
      this.openFactoryPanel(b);
      return;
    }
  };

  /* If the selected unit can hit the enemy without moving (ranged, or already
   * adjacent), attack directly on click. Otherwise auto-step to the best
   * adjacent reachable hex then attack. */
  GameUI.prototype.canQuickAttack = function (unit, enemy) {
    return COMBAT.atkStat(unit.type, COMBAT.isAir(enemy)) > 0;
  };

  GameUI.prototype.quickAttack = function (unit, enemy) {
    var g = this.game, self = this;
    var d = HEX.distance(unit.col, unit.row, enemy.col, enemy.row);
    if (d >= unit.type.rmin && d <= unit.type.rmax) {
      this.renderer.highlights = null;
      this.showBattle(unit, enemy, function (result) {
        if (result && g.units.indexOf(unit) >= 0 && unit.type.moveAfterAttack && unit.movePointsLeft > 0 && !unit.moved) self.selectUnit(unit);
        else self.deselect();
        self.refreshStatus(); self.checkGameOver();
      });
      return;
    }
    if (unit.type.rmax !== 1) { this.toast("Out of range"); return; }
    // find cheapest reachable stop adjacent to the enemy
    var best = null;
    for (var k in this.range) {
      var rec = this.range[k];
      if (!rec.canStop || rec.load) continue;
      var occ = g.unitAt(rec.col, rec.row);
      if (occ && occ !== unit) continue;
      if (HEX.distance(rec.col, rec.row, enemy.col, enemy.row) === 1) {
        if (!best || rec.cost < best.cost) best = rec;
      }
    }
    if (!best) { this.toast("Can't reach a firing position"); return; }
    this.pendingMoveFrom = { col: unit.col, row: unit.row, movePointsLeft: unit.movePointsLeft, attackSpent: unit.attackSpent };
    g.moveUnit(unit, best.col, best.row, this.range);
    this.renderer.highlights = null;
    this.draw();
    this.showBattle(unit, enemy, function (result) {
      if (result === null) { self.cancelMove(unit); return; } // backed out pre-fight
      self.pendingMoveFrom = null;
      if (g.units.indexOf(unit) >= 0 && unit.type.moveAfterAttack && unit.movePointsLeft > 0 && !unit.moved) self.selectUnit(unit);
      else self.deselect();
      self.refreshStatus(); self.checkGameOver();
    });
  };

  /* --- turns ---------------------------------------------------------------- */

  GameUI.prototype.endTurn = function () {
    if (this.mode === "over" || this.busy) return;
    var g = this.game, self = this;
    this.deselect();
    g.endTurn();
    this.refreshStatus();
    this.checkGameOver();
    if (g.winner !== null) return;

    if (this.options.hotseat) { this.toast(RENDER.PLAYER_COLORS[g.currentPlayer].name + " — your turn"); this.draw(); return; }

    // AI turn
    this.mode = "aiTurn";
    this.busy = true;
    $("status-player").textContent = RENDER.PLAYER_COLORS[g.currentPlayer].name + " (thinking…)";
    this._aiTimer = setTimeout(function () {
      if (self.destroyed) return;
      AI.playTurn(g, g.currentPlayer);
      g.endTurn();
      self.busy = false;
      self.mode = "idle";
      self.refreshStatus();
      self.draw();
      self.checkGameOver();
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

  return { GameUI: GameUI };
})();
