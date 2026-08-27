/* Nectaris remake — rules engine.
 *
 * Owns all game state and legal-move logic. No rendering, no DOM: the same
 * file runs in the browser and under node for tests.
 *
 * Movement rules implemented:
 *   - Per-terrain, per-movement-class costs (see data-terrain.js).
 *   - Zone of Control: the six hexes around every unit. A unit that starts
 *     its move inside an enemy ZOC may move only 1 hex. Entering an enemy
 *     ZOC hex ends the move immediately (no passing through).
 *   - Friendly units may be passed through but not stopped on.
 *   - One unit per hex, air and ground alike.
 *
 * Turn structure: each unit may act once per turn (move+attack, or the
 * type-specific variants: ranged units move OR attack; buggies may spend
 * leftover movement after attacking). Entering a factory or base you own (or
 * a neutral/own factory) repairs the unit to full strength and ends its turn.
 *
 * Factories: hold stored units (the original's "hidden reinforcements").
 * Infantry capture factories/bases by moving onto them. Capturing the enemy
 * base wins the map instantly; so does destroying every enemy unit
 * (including units still stored in enemy factories? — no: stored units only
 * count once deployed, matching the original). Turn limit default 50; if it
 * expires, player 0 (the attacker/Union side) loses.
 */
"use strict";

if (typeof module !== "undefined") {
  global.HEX = require("./hex.js");
  var _t = require("./data-terrain.js");
  global.TERRAIN = _t.TERRAIN; global.TERRAIN_BY_CHAR = _t.TERRAIN_BY_CHAR; global.terrainCost = _t.terrainCost;
  var _u = require("./data-units.js");
  global.UNIT_TYPES = _u.UNIT_TYPES; global.mergeUnitTypes = _u.mergeUnitTypes;
  global.COMBAT = require("./combat.js");
}

var ENGINE = (function () {
  var nextUnitId = 1;

  function makeUnit(typeId, player, col, row, strength, exp) {
    var type = UNIT_TYPES[typeId];
    if (!type) throw new Error("Unknown unit type: " + typeId);
    return {
      id: nextUnitId++,
      typeId: typeId,
      type: type,
      player: player,
      col: col, row: row,
      strength: strength === undefined ? COMBAT.MAX_STRENGTH : strength,
      exp: exp || 0,
      moved: false,      // acted this turn (done)
      movePointsLeft: type.move,
      cargo: [],         // units being carried (transport)
      carriedBy: null,   // transport unit id, if loaded
    };
  }

  function Game(mapDef, options) {
    options = options || {};
    this.map = mapDef;
    this.width = mapDef.grid[0].length;
    this.height = mapDef.grid.length;
    this.terrain = [];
    for (var r = 0; r < this.height; r++) {
      var rowArr = [];
      for (var c = 0; c < this.width; c++) {
        var ch = mapDef.grid[r][c];
        var t = TERRAIN_BY_CHAR[ch];
        if (!t) throw new Error("Bad terrain char '" + ch + "' at " + c + "," + r);
        rowArr.push(t);
      }
      this.terrain.push(rowArr);
    }

    // Buildings: {col,row,kind:"factory"|"base",owner:0|1|-1,stored:[units]}
    this.buildings = {};
    var bdefs = mapDef.buildings || [];
    for (var i = 0; i < bdefs.length; i++) {
      var b = bdefs[i];
      var terr = this.terrain[b.row] && this.terrain[b.row][b.col];
      if (!terr || !terr.building) throw new Error("Building at " + b.col + "," + b.row + " is not on F/B terrain");
      var stored = [];
      for (var s = 0; s < (b.stored || []).length; s++) {
        var st = b.stored[s];
        var su = makeUnit(typeof st === "string" ? st : st.t, b.owner, b.col, b.row,
                          (st && st.str) || undefined, (st && st.exp) || 0);
        su.inFactory = true;
        stored.push(su);
      }
      this.buildings[HEX.key(b.col, b.row)] = {
        col: b.col, row: b.row, kind: terr.id, owner: b.owner === undefined ? -1 : b.owner, stored: stored,
      };
    }
    // Any F/B terrain hex without an explicit entry becomes a neutral building.
    for (r = 0; r < this.height; r++) {
      for (c = 0; c < this.width; c++) {
        if (this.terrain[r][c].building && !this.buildings[HEX.key(c, r)]) {
          this.buildings[HEX.key(c, r)] = { col: c, row: r, kind: this.terrain[r][c].id, owner: -1, stored: [] };
        }
      }
    }

    this.units = [];
    var udefs = mapDef.units || [];
    for (i = 0; i < udefs.length; i++) {
      var u = udefs[i];
      this.units.push(makeUnit(u.t, u.o, u.x, u.y, u.str, u.exp));
    }

    this.currentPlayer = 0;
    this.turn = 1;
    this.turnLimit = mapDef.turnLimit || 50;
    this.winner = null;
    this.winReason = null;
    this.rng = COMBAT.makeRng(options.seed !== undefined ? options.seed : (Date.now() & 0xffffffff));
    this.log = [];
  }

  Game.prototype.terrainAt = function (col, row) {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return null;
    return this.terrain[row][col];
  };

  Game.prototype.unitAt = function (col, row) {
    for (var i = 0; i < this.units.length; i++) {
      var u = this.units[i];
      if (!u.carriedBy && !u.inFactory && u.col === col && u.row === row) return u;
    }
    return null;
  };

  Game.prototype.buildingAt = function (col, row) {
    return this.buildings[HEX.key(col, row)] || null;
  };

  Game.prototype.inBounds = function (col, row) {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  };

  /* --- Zone of Control ------------------------------------------------ */

  /* Hex (col,row) is in the ZOC of `player`'s enemies? (i.e. adjacent to at
   * least one unit not belonging to `player`). Cross-domain per the original:
   * air units project ZOC over ground units and vice versa. */
  Game.prototype.inEnemyZOC = function (col, row, player) {
    var ns = HEX.neighbors(col, row);
    for (var i = 0; i < ns.length; i++) {
      var u = this.unitAt(ns[i].col, ns[i].row);
      if (u && u.player !== player) return true;
    }
    return false;
  };

  /* Surround check (combat step 2): every adjacent hex is either occupied by
   * an enemy of `unit` or itself adjacent to an enemy of `unit`. Off-map
   * hexes count as satisfying the condition (walls help the surrounder),
   * matching observed original behavior at map edges. */
  Game.prototype.isSurrounded = function (unit) {
    var ns = HEX.neighbors(unit.col, unit.row);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      // Off-map hexes carry no ZOC, so a unit against the map edge can
      // never be surrounded (the original is explicit about this).
      if (!this.inBounds(n.col, n.row)) return false;
      var occ = this.unitAt(n.col, n.row);
      if (occ && occ.player !== unit.player) continue;
      if (this.inEnemyZOC(n.col, n.row, unit.player)) continue;
      return false;
    }
    return true;
  };

  Game.prototype.adjacentAllies = function (col, row, player, exclude) {
    var out = [];
    var ns = HEX.neighbors(col, row);
    for (var i = 0; i < ns.length; i++) {
      var u = this.unitAt(ns[i].col, ns[i].row);
      if (u && u.player === player && u !== exclude) out.push(u);
    }
    return out;
  };

  /* --- Movement --------------------------------------------------------- */

  /* Dijkstra over terrain costs with ZOC stops.
   * Returns { key -> {col,row,cost,stop,canStop,load} } for all reachable
   * hexes, including the start. `load` marks a friendly transport hex the
   * unit could board. */
  Game.prototype.movementRange = function (unit) {
    var self = this;
    var result = {};
    var startKey = HEX.key(unit.col, unit.row);
    var startInZOC = this.inEnemyZOC(unit.col, unit.row, unit.player);
    var budget = startInZOC ? Math.min(1, unit.movePointsLeft) : unit.movePointsLeft;

    // For a 1-hex-in-ZOC move we still honor terrain passability but charge 1.
    var frontier = [{ col: unit.col, row: unit.row, cost: 0 }];
    result[startKey] = { col: unit.col, row: unit.row, cost: 0, canStop: true, prev: null };

    while (frontier.length) {
      // small maps: linear extract-min is fine
      var bi = 0;
      for (var i = 1; i < frontier.length; i++) if (frontier[i].cost < frontier[bi].cost) bi = i;
      var cur = frontier.splice(bi, 1)[0];
      var curKey = HEX.key(cur.col, cur.row);
      if (result[curKey].stop && curKey !== startKey) continue; // ZOC: no expansion past
      var ns = HEX.neighbors(cur.col, cur.row);
      for (i = 0; i < ns.length; i++) {
        var n = ns[i];
        if (!this.inBounds(n.col, n.row)) continue;
        var terr = this.terrainAt(n.col, n.row);
        var baseCost = terrainCost(terr, unit.type.moveType, unit.type);
        if (baseCost === null) continue; // impassable for this chassis
        var stepCost = startInZOC ? 1 : baseCost;
        /* Valley: a unit that can enter at all does so by spending everything
         * it has left, so it always ends its move there. Air is unaffected —
         * terrainCost already flattens every hex to 1 for aircraft. */
        var drains = !!terr.costsAllMovement && unit.type.moveType !== "air" && !startInZOC;
        if (drains) {
          stepCost = budget - cur.cost;
          if (stepCost < 1) continue;
        }
        var occ = this.unitAt(n.col, n.row);
        var isLoad = false;
        if (occ) {
          if (occ.player !== unit.player) continue;             // enemies block
          if (occ.type.cargo && occ.cargo.length < occ.type.cargo &&
              unit.type.moveType !== "air" && !unit.type.cargo) {
            isLoad = true;                                       // can board
          }
          // friendly non-transport: can pass through, not stop
        }
        var newCost = cur.cost + stepCost;
        if (newCost > budget) continue;
        var k = HEX.key(n.col, n.row);
        var enteringZOC = this.inEnemyZOC(n.col, n.row, unit.player);
        var canStopHere = !occ || isLoad;
        if (canStopHere && unit.type.moveType !== "air") {
          var bld = this.buildingAt(n.col, n.row);
          if (bld && bld.kind === "factory") {
            // A factory you do not own can be passed through but never
            // stopped on, except by infantry (which captures by stopping).
            if (bld.owner !== unit.player && !unit.type.capture) canStopHere = false;
            // Stopping on your own factory stores the unit; a transport
            // with cargo aboard cannot fit and so cannot stop there.
            if (bld.owner === unit.player && unit.cargo && unit.cargo.length) canStopHere = false;
          }
        }
        var rec = result[k];
        if (!rec || newCost < rec.cost) {
          result[k] = {
            col: n.col, row: n.row, cost: newCost,
            stop: enteringZOC || drains,             // move ends here
            canStop: canStopHere,                    // can end move on hex
            load: isLoad,
            prev: curKey,
          };
          if (!isLoad) frontier.push({ col: n.col, row: n.row, cost: newCost });
        }
      }
    }
    return result;
  };

  /* Hexes the unit could attack from its current position. */
  Game.prototype.attackTargets = function (unit) {
    var out = [];
    if (!unit.type.rngG && !unit.type.rngA) return out;
    for (var i = 0; i < this.units.length; i++) {
      var e = this.units[i];
      if (e.player === unit.player || e.carriedBy || e.inFactory) continue;
      var d = HEX.distance(unit.col, unit.row, e.col, e.row);
      if (!COMBAT.canAttackAt(unit.type, COMBAT.isAir(e), d)) continue;
      out.push(e);
    }
    return out;
  };

  /* --- Actions ---------------------------------------------------------- */

  Game.prototype.moveUnit = function (unit, col, row, range) {
    range = range || this.movementRange(unit);
    var rec = range[HEX.key(col, row)];
    if (!rec || !rec.canStop) throw new Error("Illegal move");
    if (unit.type.moveOrFire && rec.cost > 0) unit.attackSpent = true; // SP guns/Hawkeye: move OR fire
    unit.movePointsLeft -= rec.cost;
    if (rec.load) {
      var transport = this.unitAt(col, row);
      transport.cargo.push(unit);
      unit.carriedBy = transport.id;
      unit.col = col; unit.row = row;
      unit.moved = true;
      this.log.push({ t: "load", unit: unit.id, into: transport.id });
      return { loaded: true };
    }
    unit.col = col; unit.row = row;
    if (rec.stop) unit.movePointsLeft = 0;
    this.log.push({ t: "move", unit: unit.id, col: col, row: row });
    return { loaded: false };
  };

  /* Finish a unit's activation: captures and factory storage happen on
   * "wait". There is no on-hex repair — the original repairs by storing:
   * stop a ground unit on a factory you already own and it goes inside,
   * comes out at full strength on a later turn, and loses the two turns of
   * entering and leaving. Bases never store or repair. */
  Game.prototype.finishUnit = function (unit) {
    var b = this.buildingAt(unit.col, unit.row);
    var events = [];
    if (b && unit.type.moveType !== "air") {
      var captured = false;
      // Capture: infantry only, on enemy/neutral buildings.
      if (unit.type.capture && b.owner !== unit.player) {
        b.owner = unit.player;
        // Stored units belong to the new owner once the factory is captured.
        for (var i = 0; i < b.stored.length; i++) b.stored[i].player = unit.player;
        captured = true;
        events.push({ t: "capture", kind: b.kind });
        this.log.push({ t: "capture", unit: unit.id, col: unit.col, row: unit.row });
        // Published rule: capturing a factory earns the infantry +4 EXP.
        // (Base capture wins the map outright, so no award matters there.)
        if (b.kind !== "base") {
          unit.exp = Math.min(COMBAT.MAX_EXP, unit.exp + 4);
        }
        if (b.kind === "base" && this.enemyBaseCaptured(unit.player, b)) {
          this.winner = unit.player;
          this.winReason = "base";
        }
      }
      // Storage: stopping on a factory that was already yours takes the
      // unit off the field into the stored list, repaired to full. (A
      // capturer stays on the hex it just took; loaded transports are kept
      // off the hex by movementRange.)
      if (!captured && b.kind === "factory" && b.owner === unit.player &&
          this.winner === null && (!unit.cargo || unit.cargo.length === 0)) {
        var ui = this.units.indexOf(unit);
        if (ui >= 0) this.units.splice(ui, 1);
        unit.inFactory = true;
        unit.strength = COMBAT.MAX_STRENGTH;
        unit.moved = true; // stored this turn: cannot come back out until next turn
        b.stored.push(unit);
        events.push({ t: "store" });
        this.log.push({ t: "store", unit: unit.id, col: unit.col, row: unit.row });
      }
    }
    unit.moved = true;
    unit.movePointsLeft = 0;
    return events;
  };

  Game.prototype.enemyBaseCaptured = function (player, b) {
    // The captured base must have belonged to the enemy side originally:
    // find map def for that hex.
    var defs = this.map.buildings || [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      if (d.col === b.col && d.row === b.row) return d.owner !== undefined && d.owner !== -1 && d.owner !== player;
    }
    return true; // undeclared base: treat capture as decisive
  };

  Game.prototype.attack = function (attacker, defender) {
    if (attacker.type.moveOrFire && attacker.attackSpent) throw new Error("Move-or-fire unit already moved");
    var result = COMBAT.resolve(this, attacker, defender, this.rng);
    this.log.push({
      t: "battle", a: attacker.id, d: defender.id,
      dmgD: result.dmgToDefender, dmgA: result.dmgToAttacker,
    });
    if (result.defenderDead) this.removeUnit(defender);
    if (result.attackerDead) this.removeUnit(attacker);
    if (!result.attackerDead) {
      if (attacker.type.moveAfterAttack && attacker.movePointsLeft > 0) {
        attacker.attacked = true; // may still move; UI decides when to finish
      } else {
        this.finishUnit(attacker);
      }
    }
    this.checkElimination();
    return result;
  };

  Game.prototype.removeUnit = function (unit) {
    // Cargo dies with its transport.
    for (var i = 0; i < unit.cargo.length; i++) {
      var c = unit.cargo[i];
      var ci = this.units.indexOf(c);
      if (ci >= 0) this.units.splice(ci, 1);
    }
    var idx = this.units.indexOf(unit);
    if (idx >= 0) this.units.splice(idx, 1);
  };

  Game.prototype.checkElimination = function () {
    if (this.winner !== null) return;
    var alive = [0, 0];
    for (var i = 0; i < this.units.length; i++) alive[this.units[i].player]++;
    // Stored units in owned factories still count as forces in being only
    // once deployable; the original ends the map when fielded units hit 0.
    if (alive[0] === 0) { this.winner = 1; this.winReason = "elimination"; }
    else if (alive[1] === 0) { this.winner = 0; this.winReason = "elimination"; }
  };

  /* Unload one cargo unit from a transport to an adjacent hex. */
  Game.prototype.unload = function (transport, cargoUnit, col, row) {
    if (cargoUnit.carriedBy !== transport.id) throw new Error("Not carried by this transport");
    if (HEX.distance(transport.col, transport.row, col, row) !== 1) throw new Error("Must unload adjacent");
    if (this.unitAt(col, row)) throw new Error("Hex occupied");
    var terr = this.terrainAt(col, row);
    if (!terr || terrainCost(terr, cargoUnit.type.moveType, cargoUnit.type) === null) {
      throw new Error("Impassable for cargo");
    }
    /* Mines and the Atlas gun are set down rather than driven off, so they
     * need firm ground: plains, road, bridge or a factory floor. */
    if (cargoUnit.type.placeByTransport && !terr.deployable) {
      throw new Error(cargoUnit.type.name + " cannot be set down on " + terr.name);
    }
    cargoUnit.carriedBy = null;
    cargoUnit.col = col; cargoUnit.row = row;
    cargoUnit.moved = true; cargoUnit.movePointsLeft = 0;
    transport.cargo.splice(transport.cargo.indexOf(cargoUnit), 1);
    this.log.push({ t: "unload", unit: cargoUnit.id, col: col, row: row });
    this.finishUnit(cargoUnit);
  };

  /* Hexes a stored unit could deploy to: the six around the factory, open,
   * outside any building, on terrain the unit can be set down on and stand
   * on. Aircraft ignore the ground-terrain restriction. Shared by the UI's
   * exit picker and the AI. */
  Game.prototype.deployTargets = function (building, storedUnit) {
    var out = [];
    if (storedUnit.type.placeByTransport) return out; // transport-only exits
    var ns = HEX.neighbors(building.col, building.row);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      if (!this.inBounds(n.col, n.row)) continue;
      if (this.unitAt(n.col, n.row)) continue;
      if (this.buildingAt(n.col, n.row)) continue;
      var terr = this.terrainAt(n.col, n.row);
      if (storedUnit.type.moveType !== "air" && !terr.deployable) continue;
      if (terrainCost(terr, storedUnit.type.moveType, storedUnit.type) === null) continue;
      out.push(n);
    }
    return out;
  };

  /* Deploy a stored unit from a factory to a chosen adjacent hex. Units
   * never stand on the factory hex itself — stopping there is what stores
   * them — and ground units exit only onto open plains, road or bridge.
   * Deploying costs the unit its whole turn, and a unit stored this turn
   * cannot leave until the next. Mines and the Atlas only leave aboard a
   * transport (loadFromFactory). */
  Game.prototype.deployFromFactory = function (building, storedUnit, col, row) {
    if (building.owner !== this.currentPlayer) throw new Error("Not your factory");
    var idx = building.stored.indexOf(storedUnit);
    if (idx < 0) throw new Error("Unit not stored here");
    if (storedUnit.moved) throw new Error(storedUnit.type.name + " was stored this turn");
    if (storedUnit.type.placeByTransport) {
      throw new Error(storedUnit.type.name + " can only leave by transport");
    }
    if (HEX.distance(building.col, building.row, col, row) !== 1) {
      throw new Error("Units deploy to a hex adjacent to the factory");
    }
    if (this.unitAt(col, row)) throw new Error("Hex occupied");
    if (this.buildingAt(col, row)) throw new Error("Cannot deploy into another building");
    var terr = this.terrainAt(col, row);
    if (storedUnit.type.moveType !== "air" && !terr.deployable) {
      throw new Error("Can only deploy onto plains, a road or a bridge");
    }
    if (terrainCost(terr, storedUnit.type.moveType, storedUnit.type) === null) throw new Error("Impassable");
    building.stored.splice(idx, 1);
    storedUnit.inFactory = false;
    storedUnit.player = building.owner;
    storedUnit.col = col; storedUnit.row = row;
    storedUnit.moved = true; storedUnit.movePointsLeft = 0;
    this.units.push(storedUnit);
    this.log.push({ t: "deploy", unit: storedUnit.id, col: col, row: row });
    return storedUnit;
  };

  /* Load a stored ground unit directly onto an eligible adjacent transport. */
  Game.prototype.loadFromFactory = function (building, storedUnit, transport) {
    if (building.owner !== this.currentPlayer) throw new Error("Not your factory");
    if (storedUnit.moved) throw new Error(storedUnit.type.name + " was stored this turn");
    var d = HEX.distance(building.col, building.row, transport.col, transport.row);
    if (d > 1) throw new Error("Transport must be on or adjacent to factory");
    if (!transport.type.cargo || transport.cargo.length >= transport.type.cargo) throw new Error("Transport full");
    var idx = building.stored.indexOf(storedUnit);
    building.stored.splice(idx, 1);
    storedUnit.inFactory = false;
    storedUnit.player = building.owner;
    storedUnit.col = transport.col; storedUnit.row = transport.row;
    storedUnit.carriedBy = transport.id;
    storedUnit.moved = true;
    transport.cargo.push(storedUnit);
    this.units.push(storedUnit);
    this.log.push({ t: "loadFromFactory", unit: storedUnit.id, into: transport.id });
    return storedUnit;
  };

  Game.prototype.endTurn = function () {
    for (var i = 0; i < this.units.length; i++) {
      var u = this.units[i];
      u.moved = false;
      u.attacked = false;
      u.attackSpent = false;
      u.movePointsLeft = u.type.move;
    }
    // Stored units refresh too, so anything stored last turn may deploy.
    for (var k in this.buildings) {
      var stored = this.buildings[k].stored;
      for (var j = 0; j < stored.length; j++) {
        stored[j].moved = false;
        stored[j].attacked = false;
        stored[j].attackSpent = false;
        stored[j].movePointsLeft = stored[j].type.move;
      }
    }
    if (this.currentPlayer === 1) {
      this.turn++;
      if (this.winner === null && this.turn > this.turnLimit) {
        this.winner = 1;
        this.winReason = "turnlimit";
      }
    }
    this.currentPlayer = 1 - this.currentPlayer;
    this.log.push({ t: "endturn", player: this.currentPlayer, turn: this.turn });
  };

  Game.prototype.playerUnits = function (player) {
    var out = [];
    for (var i = 0; i < this.units.length; i++) {
      var u = this.units[i];
      if (u.player === player && !u.carriedBy && !u.inFactory) out.push(u);
    }
    return out;
  };

  /* Factories owned by player that still hold stored units. */
  Game.prototype.playerFactories = function (player) {
    var out = [];
    for (var k in this.buildings) {
      var b = this.buildings[k];
      if (b.owner === player) out.push(b);
    }
    return out;
  };

  return { Game: Game, makeUnit: makeUnit };
})();

if (typeof module !== "undefined") module.exports = ENGINE;
