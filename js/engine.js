/* Nectaris remake — rules engine.
 *
 * Owns all game state and legal-move logic. No rendering, no DOM: the same
 * file runs in the browser and under node for tests.
 *
 * Movement rules implemented:
 *   - Per-terrain, per-movement-class costs (see data-terrain.js).
 *   - Zone of Control: the six hexes around every field unit. Entering an
 *     enemy ZOC hex ends the move immediately (no passing through). Leaving
 *     ZOC permits normal movement until another controlled hex is entered.
 *   - Friendly units may be passed through but not stopped on.
 *   - One unit per hex, air and ground alike.
 *
 * Turn structure: each unit may act once per turn (move+attack, or the
 * type-specific variants: ranged units move OR attack; buggies may spend
 * leftover movement after attacking). Units ending movement at an owned
 * factory go into storage, repair, and end their turn. Bases permit parking.
 *
 * Factories: hold stored units (the original's "hidden reinforcements").
 * Infantry capture factories/bases by moving onto them. Capturing the enemy
 * base wins the map instantly; so does eliminating every enemy unit,
 * including reserves, except mines and stored Atlas guns (PCE). Turn limit default
 * 50; if it expires, player 0 (the attacker/Union side) loses.
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

  /* Stable minimum-cost heap for both movement and AI walking distances.
   * FIFO ties retain the old searches' path and AI tie-breaking order. */
  function CostQueue() { this.items = []; this.order = 0; }
  function precedes(a, b) {
    return a.value.cost < b.value.cost ||
      (a.value.cost === b.value.cost && a.order < b.order);
  }
  CostQueue.prototype.push = function (value) {
    var item = { value: value, order: this.order++ }, items = this.items;
    var i = items.length;
    items.push(item);
    while (i > 0) {
      var parent = (i - 1) >> 1;
      if (!precedes(item, items[parent])) break;
      items[i] = items[parent]; i = parent;
    }
    items[i] = item;
  };
  CostQueue.prototype.pop = function () {
    var items = this.items;
    if (!items.length) return null;
    var first = items[0], last = items.pop(), i = 0;
    if (items.length) {
      while (i * 2 + 1 < items.length) {
        var child = i * 2 + 1;
        if (child + 1 < items.length && precedes(items[child + 1], items[child])) child++;
        if (!precedes(items[child], last)) break;
        items[i] = items[child]; i = child;
      }
      items[i] = last;
    }
    return first.value;
  };

  /* Per-map tables for movement search, keyed by the terrain array that AI
   * copies of a match share. Neighbour cells, keys and building cells never
   * change after construction. Unit positions are read afresh on every call,
   * and the scratch arrays are cleared after each search. */
  var TABLES = new WeakMap();
  function tablesFor(game) {
    var t = TABLES.get(game.terrain);
    if (t) return t;
    var w = game.width, size = w * game.height;
    t = { width: w, size: size, neighbors: new Int32Array(size * 6), keys: new Array(size),
      building: new Uint8Array(size), cells: new Array(size), drains: new Uint8Array(size), costs: new Map(),
      occupant: new Int32Array(size), zone: new Int8Array(size), best: new Float64Array(size).fill(Infinity),
      flags: new Uint8Array(size), prev: new Int32Array(size) };
    for (var row = 0; row < game.height; row++) for (var col = 0; col < w; col++) {
      var at = row * w + col, ns = HEX.neighbors(col, row);
      t.keys[at] = HEX.key(col, row);
      for (var i = 0; i < 6; i++) {
        var n = ns[i];
        t.neighbors[at * 6 + i] = n.col >= 0 && n.col < w && n.row >= 0 && n.row < game.height ? n.row * w + n.col : -1;
      }
    }
    Object.values(game.buildings).forEach(function (b) { t.building[b.row * w + b.col] = 1; });
    refreshTerrain(game, t);
    TABLES.set(game.terrain, t);
    return t;
  }
  // `version` is unique to one terrain as rebuilt, across every map in the process.
  var terrainVersion = 0;
  function refreshTerrain(game, t) {
    for (var at = 0; at < t.size; at++) {
      var terr = game.terrain[(at / t.width) | 0][at % t.width];
      t.cells[at] = terr;
      t.drains[at] = terr.costsAllMovement ? 1 : 0;
    }
    t.costs.clear();
    t.version = ++terrainVersion;
  }
  // The tables with terrain costs matching the terrain as it is now. Tests and
  // tools edit terrain cells in place, so every search checks the cells first.
  function terrainTables(game) {
    var t = tablesFor(game), cells = t.cells, w = t.width;
    for (var row = 0, at = 0; row < game.height; row++) {
      var line = game.terrain[row];
      for (var col = 0; col < w; col++, at++) {
        if (cells[at] !== line[col]) { refreshTerrain(game, t); return t; }
      }
    }
    return t;
  }
  // Entry cost of every hex for one chassis; -1 where it cannot enter.
  function stepCosts(game, t, type) {
    var id = type.moveType + "|" + (type.cannotEnter ? type.cannotEnter.join(",") : "");
    var costs = t.costs.get(id);
    if (costs) return costs;
    costs = new Float64Array(t.size);
    for (var at = 0; at < t.size; at++) {
      var c = terrainCost(t.cells[at], type.moveType, type);
      costs[at] = c === null ? -1 : c;
    }
    t.costs.set(id, costs);
    return costs;
  }

  function wholeNumber(value, min, max) {
    return Number.isInteger(value) && value >= min && value <= max;
  }
  function requireWhole(value, min, max, what) {
    if (!wholeNumber(value, min, max)) {
      throw new Error(what + " must be a whole number from " + min + " to " + max + ".");
    }
  }

  /* Levels also arrive from files, web addresses and recorded games, and the
   * interface writes unit and building numbers into its markup, so every
   * field the engine reads must have its expected type before play. */
  function checkLevel(mapDef) {
    var grid = mapDef && mapDef.grid;
    if (!Array.isArray(grid) || !grid.length || !grid.every(function (row) {
      return typeof row === "string" && row.length > 0 && row.length === grid[0].length;
    })) {
      throw new Error("The level's grid must be rows of terrain letters, all the same length.");
    }
    var width = grid[0].length, height = grid.length;
    function list(value, what) {
      if (value !== undefined && !Array.isArray(value)) throw new Error(what + " must be a list.");
      return value || [];
    }
    function checkUnitNumbers(entry, what) {
      if (entry.str !== undefined) requireWhole(entry.str, 1, COMBAT.MAX_STRENGTH, what + " strength (str)");
      if (entry.exp !== undefined) requireWhole(entry.exp, 0, COMBAT.MAX_EXP, what + " experience (exp)");
    }
    list(mapDef.units, "The level's units").forEach(function (u, i) {
      var what = "Unit " + (i + 1);
      if (!u || typeof u.t !== "string") throw new Error(what + " must name its unit type (t).");
      requireWhole(u.o, 0, 1, what + " side (o)");
      requireWhole(u.x, 0, width - 1, what + " column (x)");
      requireWhole(u.y, 0, height - 1, what + " row (y)");
      checkUnitNumbers(u, what);
    });
    list(mapDef.buildings, "The level's buildings").forEach(function (b, i) {
      var what = "Building " + (i + 1);
      if (!b) throw new Error(what + " must be an object.");
      requireWhole(b.col, 0, width - 1, what + " column (col)");
      requireWhole(b.row, 0, height - 1, what + " row (row)");
      if (b.owner !== undefined) requireWhole(b.owner, -1, 1, what + " owner");
      list(b.stored, what + " stored units").forEach(function (entry, s) {
        if (typeof entry === "string") return;
        var stored = what + " stored unit " + (s + 1);
        if (!entry || typeof entry.t !== "string") throw new Error(stored + " must name its unit type (t).");
        checkUnitNumbers(entry, stored);
      });
    });
    if (mapDef.turnLimit !== undefined && !wholeNumber(mapDef.turnLimit, 1, Number.MAX_SAFE_INTEGER)) {
      throw new Error("The level's turn limit must be a whole number of 1 or more.");
    }
  }

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
    checkLevel(mapDef);
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
      if (terr.id === "base" && b.stored && b.stored.length) throw new Error("Base at " + b.col + "," + b.row + " stores units; only factories can.");
      var owner = b.owner === undefined ? -1 : b.owner;
      var stored = [];
      for (var s = 0; s < (b.stored || []).length; s++) {
        var st = b.stored[s];
        var su = makeUnit(typeof st === "string" ? st : st.t, owner, b.col, b.row,
                          (st && st.str) || undefined, (st && st.exp) || 0);
        su.inFactory = true;
        stored.push(su);
      }
      this.buildings[HEX.key(b.col, b.row)] = {
        col: b.col, row: b.row, kind: terr.id, owner: owner, stored: stored,
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

    this.firstPlayer = options.firstPlayer === 1 ? 1 : 0;
    this.currentPlayer = this.firstPlayer;
    this.turn = 1;
    this.turnLimit = mapDef.turnLimit || 50;
    this.winner = null;
    this.winReason = null;
    this.rng = COMBAT.makeRng(options.seed !== undefined ? options.seed : (Date.now() & 0xffffffff));
    this.log = [];
  }

  /* Versioned saves use IDs for cargo/factory membership, preserving shared
   * unit identities and the exact random stream across a browser restart. */
  Game.prototype.snapshot = function () {
    var all = {}, types = Object.assign({}, UNIT_TYPES);
    function collect(unit) {
      if (all[unit.id]) return;
      var copy = Object.assign({}, unit);
      delete copy.type;
      copy.cargo = unit.cargo.map(function (cargo) { return cargo.id; });
      all[unit.id] = copy;
      types[unit.typeId] = unit.type;
      unit.cargo.forEach(collect);
    }
    this.units.forEach(collect);
    var buildings = {};
    Object.keys(this.buildings).forEach(function (key) {
      var b = this.buildings[key];
      b.stored.forEach(collect);
      buildings[key] = Object.assign({}, b, {stored: b.stored.map(function (u) { return u.id; })});
    }, this);
    return JSON.parse(JSON.stringify({version: 1, map: this.map, types: types,
      units: Object.values(all), field: this.units.map(function (u) { return u.id; }),
      buildings: buildings, turn: this.turn, currentPlayer: this.currentPlayer, firstPlayer: this.firstPlayer,
      balance: this.balance || null,
      turnLimit: this.turnLimit, winner: this.winner, winReason: this.winReason,
      rngState: this.rng.getState(), log: this.log}));
  };

  Game.restore = function (snapshot) {
    var data = JSON.parse(JSON.stringify(snapshot));
    if (!data || data.version !== 1 || !Array.isArray(data.units) ||
        !Array.isArray(data.field) || !data.types || !data.buildings ||
        !Number.isInteger(data.rngState) || !Number.isInteger(data.turn) || data.turn < 1 ||
        !wholeNumber(data.turnLimit, 1, Number.MAX_SAFE_INTEGER) ||
        (data.winner !== null && data.winner !== 0 && data.winner !== 1) ||
        (data.currentPlayer !== 0 && data.currentPlayer !== 1) ||
        (data.firstPlayer !== 0 && data.firstPlayer !== 1) ||
        (data.types.MULE && !Array.isArray(data.types.MULE.cargoTypes))) {
      throw new Error("This saved match is invalid or from an older version and cannot be loaded.");
    }
    mergeUnitTypes(data.types);
    var game = new Game(data.map, {seed: data.rngState, firstPlayer:data.firstPlayer});
    if(data.balance)game.balance=data.balance;
    var byId = {};
    data.units.forEach(function (u) {
      if (!Number.isInteger(u.id) || u.id < 1 || byId[u.id] || !data.types[u.typeId] || !Array.isArray(u.cargo) ||
          !wholeNumber(u.player, -1, 1) || !wholeNumber(u.strength, 0, COMBAT.MAX_STRENGTH) ||
          !wholeNumber(u.exp, 0, COMBAT.MAX_EXP) || !Number.isInteger(u.col) || !Number.isInteger(u.row) ||
          !Number.isFinite(u.movePointsLeft)) {
        throw new Error("Saved match contains invalid units.");
      }
      u.type = data.types[u.typeId];
      byId[u.id] = u;
      nextUnitId = Math.max(nextUnitId, u.id + 1);
    });
    function resolve(id) {
      if (!byId[id]) throw new Error("Saved match contains a missing unit.");
      return byId[id];
    }
    data.units.forEach(function (u) { u.cargo = u.cargo.map(resolve); });
    Object.keys(data.buildings).forEach(function (key) {
      var building = data.buildings[key];
      if (!building || !wholeNumber(building.owner, -1, 1) || !Array.isArray(building.stored) ||
          (building.kind === "base" && building.stored.length)) {
        throw new Error("Saved match contains invalid buildings.");
      }
      building.stored = building.stored.map(resolve);
    });
    game.units = data.field.map(resolve);
    game.buildings = data.buildings;
    ["turn", "currentPlayer", "turnLimit", "winner", "winReason", "log"].forEach(function (key) {
      game[key] = data[key];
    });
    return game;
  };

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
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return null;
    var t = tablesFor(this), at = row * this.width + col;
    return t.building[at] ? this.buildings[t.keys[at]] || null : null;
  };

  Game.prototype.inBounds = function (col, row) {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  };

  /* --- Zone of Control ------------------------------------------------ */

  /* Hex (col,row) is in the ZOC of `player`'s enemies? (i.e. adjacent to at
   * least one unit not belonging to `player`). Cross-domain per the original:
   * air units project ZOC over ground units and vice versa. */
  Game.prototype.inEnemyZOC = function (col, row, player) {
    if (!this.inBounds(col, row)) return false;
    var ns = HEX.neighbors(col, row);
    for (var i = 0; i < ns.length; i++) {
      var u = this.unitAt(ns[i].col, ns[i].row);
      if (u && u.player !== player) return true;
    }
    return false;
  };

  /* The six hexes around `unit`, each controlled when occupied by an enemy of
   * `unit` or adjacent to one. Off-map hexes carry no ZOC, so a unit against
   * the map edge can never be surrounded (the original is explicit about this). */
  Game.prototype.surroundRing = function (unit) {
    return HEX.neighbors(unit.col, unit.row).map(function (n) {
      var onMap = this.inBounds(n.col, n.row), occupant = onMap ? this.unitAt(n.col, n.row) : null;
      return { col: n.col, row: n.row, onMap: onMap, controlled: onMap &&
        (!!occupant && occupant.player !== unit.player || this.inEnemyZOC(n.col, n.row, unit.player)) };
    }, this);
  };

  // surroundRing's rule, stopping at the first uncontrolled hex.
  Game.prototype.isSurrounded = function (unit) {
    var ns = HEX.neighbors(unit.col, unit.row);
    for (var i = 0; i < 6; i++) {
      var n = ns[i];
      if (!this.inBounds(n.col, n.row)) return false;
      var occupant = this.unitAt(n.col, n.row);
      if (!(occupant && occupant.player !== unit.player) && !this.inEnemyZOC(n.col, n.row, unit.player)) return false;
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

  /* Bases allow parking. Unowned factories allow aircraft or capturers;
   * owned factories store every chassis, including loaded transports. */
  Game.prototype.canStopAtBuilding = function (unit, col, row) {
    var building = this.buildingAt(col, row);
    if (!building || building.kind === "base" || unit.type.moveType === "air") return true;
    if (building.owner !== unit.player) return !!unit.type.capture;
    return true;
  };

  Game.prototype.canLoad = function (transport, passenger, fromFactory) {
    if (!transport || transport === passenger || transport.player !== passenger.player ||
        !transport.type.cargo || transport.transferUsed || transport.cargo.length >= transport.type.cargo ||
        passenger.type.moveType === "air" || passenger.cargo.length) return false;
    var allowed = transport.type.cargoTypes;
    return !allowed || allowed.indexOf(passenger.typeId) >= 0 ||
      !!(fromFactory && transport.type.cargoFactoryTypes &&
        transport.type.cargoFactoryTypes.indexOf(passenger.typeId) >= 0);
  };

  Game.prototype.entersBuilding = function (unit, col, row) {
    var b = this.buildingAt(col, row);
    return !!b && ((b.kind === "factory" && b.owner === unit.player) ||
      (unit.type.capture && b.owner !== unit.player));
  };

  /* Dijkstra over terrain costs with ZOC stops.
   * Returns { key -> {col,row,cost,stop,canStop,load,enterBuilding} } for all reachable
   * hexes, including the start. `load` marks a friendly transport hex the
   * unit could board; `enterBuilding` ends the activation in storage/capture.
   * Execution may supply a destination key to stop once its cheapest route is
   * settled. Previews omit it and get the complete range. */
  Game.prototype.movementRange = function (unit, destinationKey) {
    return searchMoves(this, unit, destinationKey, function (t, order, start) {
      var result = {}, w = t.width, keys = t.keys;
      result[keys[start]] = { col: unit.col, row: unit.row, cost: 0, canStop: true, prev: null };
      for (var i = 1; i < order.length; i++) {
        var n = order[i], f = t.flags[n];
        result[keys[n]] = {
          col: n % w, row: (n / w) | 0, cost: t.best[n],
          stop: (f & STOP) !== 0,                  // move ends here
          canStop: (f & CAN_STOP) !== 0,           // can end move on hex
          load: (f & LOAD) !== 0,
          enterBuilding: f & ENTER ? true : f & ENTER_UNSET ? undefined : false,
          prev: keys[t.prev[n]],
        };
      }
      return result;
    });
  };

  /* The cells of movementRange's records that allow stopping without boarding
   * or entering a building, in the same order, without building the records. */
  Game.prototype.stoppingCells = function (unit) {
    return searchMoves(this, unit, undefined, function (t, order) {
      var out = [];
      for (var i = 0; i < order.length; i++) {
        var f = t.flags[order[i]];
        if ((f & CAN_STOP) && !(f & (LOAD | ENTER))) out.push(order[i]);
      }
      return out;
    });
  };

  // ENTER_UNSET keeps entersBuilding's undefined result for a unit that cannot
  // capture, on a building other than its own factory.
  var STOP = 1, CAN_STOP = 2, LOAD = 4, ENTER = 8, ENTER_UNSET = 16;
  /* The search behind movementRange. Reached cells are listed in the order
   * they were first reached, the start first; each keeps its cheapest cost,
   * record flags and predecessor. `read` sees them before the scratch tables
   * are cleared. Occupancy is indexed only for this synchronous search. Units
   * are also moved directly during AI simulations/editor operations, so a
   * persistent index could silently use stale positions after a move, undo,
   * deployment or load. Cells are numbered row * width + col. */
  function searchMoves(game, unit, destinationKey, read) {
    var t = terrainTables(game), w = game.width, h = game.height, nbr = t.neighbors, keys = t.keys;
    if (unit.col < 0 || unit.col >= w || unit.row < 0 || unit.row >= h) {
      throw new Error("Unit at " + unit.col + "," + unit.row + " is outside the map");
    }
    var occupant = t.occupant, zone = t.zone, best = t.best, flags = t.flags, prev = t.prev, drainsAt = t.drains;
    var units = game.units, player = unit.player, start = unit.row * w + unit.col, filled = [], order = [start];
    function enemyZOC(cell) {
      if (zone[cell]) return zone[cell] === 2;
      for (var j = cell * 6, end = j + 6; j < end; j++) {
        var nb = nbr[j];
        if (nb >= 0 && occupant[nb] && units[occupant[nb] - 1].player !== player) { zone[cell] = 2; return true; }
      }
      zone[cell] = 1;
      return false;
    }
    try {
      best[start] = 0; flags[start] = CAN_STOP;
      if (unit.shifted || unit.movePointsLeft <= 0) return read(t, order, start);
      var costs = stepCosts(game, t, unit.type), air = unit.type.moveType === "air", budget = unit.movePointsLeft;
      for (var i = 0; i < units.length; i++) {
        var u = units[i];
        if (u.carriedBy || u.inFactory || u.col < 0 || u.col >= w || u.row < 0 || u.row >= h) continue;
        var at = u.row * w + u.col;
        if (!occupant[at]) { occupant[at] = i + 1; filled.push(at); }
      }

      // The origin is exempt from a ZOC stop, not from terrain costs on entry
      // to the next hex. Confirmed by the original Windows movement routine;
      // see ORIGINAL_EXECUTABLE_NOTES.md and the recorded ZOC fixtures.
      var frontier = new CostQueue();
      frontier.push({ cell: start, cost: 0 });
      var cur;
      while ((cur = frontier.pop()) !== null) {
        var c = cur.cell;
        if (cur.cost !== best[c]) continue;
        if (keys[c] === destinationKey) break;
        if ((flags[c] & STOP) && c !== start) continue; // ZOC: no expansion past
        for (var s = c * 6, last = s + 6; s < last; s++) {
          var n = nbr[s];
          if (n < 0) continue;
          var stepCost = costs[n];
          if (stepCost < 0) continue; // impassable for this chassis
          /* Valley: a unit that can enter at all does so by spending everything
           * it has left, so it always ends its move there. Air is unaffected —
           * terrainCost already flattens every hex to 1 for aircraft. */
          var drains = drainsAt[n] === 1 && !air;
          if (drains) {
            stepCost = budget - cur.cost;
            if (stepCost < 1) continue;
          }
          var newCost = cur.cost + stepCost;
          if (newCost > budget || newCost >= best[n]) continue;
          var occ = occupant[n] ? units[occupant[n] - 1] : null;
          var isLoad = false;
          if (occ) {
            if (occ.player !== player) continue;                  // enemies block
            if (game.canLoad(occ, unit, false)) isLoad = true;    // can board
            // friendly non-transport: can pass through, not stop
          }
          var col = n % w, row = (n / w) | 0;
          var enteringZOC = enemyZOC(n);
          var canStopHere = !occ || isLoad;
          if (!isLoad && t.building[n] && !game.canStopAtBuilding(unit, col, row)) canStopHere = false;
          var enters = canStopHere && !isLoad && (t.building[n] === 1 ? game.entersBuilding(unit, col, row) : false);
          if (best[n] === Infinity) order.push(n);
          best[n] = newCost; prev[n] = c;
          flags[n] = (enteringZOC || drains ? STOP : 0) | (canStopHere ? CAN_STOP : 0) | (isLoad ? LOAD : 0) |
            (enters ? ENTER : enters === undefined ? ENTER_UNSET : 0);
          if (!isLoad) frontier.push({ cell: n, cost: newCost });
        }
      }
      return read(t, order, start);
    } finally {
      for (i = 0; i < filled.length; i++) occupant[filled[i]] = 0;
      for (i = 0; i < order.length; i++) { var k = order[i]; best[k] = Infinity; flags[k] = 0; zone[k] = 0; }
    }
  }

  /* Hexes the unit could attack from its current position. A planner that
   * tries many positions on an unchanged board may pass `among`, the units in
   * board order that could be targets, and gets the same result. */
  Game.prototype.attackTargets = function (unit, among) {
    var out = [], units = among || this.units;
    if (!unit.type.rngG && !unit.type.rngA) return out;
    for (var i = 0; i < units.length; i++) {
      var e = units[i];
      if (e.player === unit.player || e.carriedBy || e.inFactory) continue;
      var d = HEX.distance(unit.col, unit.row, e.col, e.row);
      if (!COMBAT.canAttackAt(unit.type, COMBAT.isAir(e), d)) continue;
      out.push(e);
    }
    return out;
  };

  /* --- Actions ---------------------------------------------------------- */

  // Availability and execution share these live-state predicates. Geometry
  // previews alone are not permission to act: spent/stored units can still
  // have movement budgets or enemies within their weapon range.
  Game.prototype.canMoveNow = function (unit) {
    return this.winner === null && unit.player === this.currentPlayer &&
      !unit.moved && !unit.shifted && !unit.carriedBy && !unit.inFactory &&
      this.unitAt(unit.col, unit.row) === unit;
  };

  // A loaded transport cannot start a battle ("搭載中は攻撃できません" in the
  // original); it still counterattacks when attacked.
  Game.prototype.canAttackNow = function (unit) {
    return this.winner === null && unit.player === this.currentPlayer &&
      !unit.moved && !unit.attacked && !unit.carriedBy && !unit.inFactory && !unit.cargo.length &&
      !(unit.type.moveOrFire && unit.attackSpent) && this.unitAt(unit.col, unit.row) === unit;
  };

  Game.prototype.legalAttackTargets = function (unit, among) {
    return this.canAttackNow(unit) ? this.attackTargets(unit, among) : [];
  };

  /* Cells, numbered row * width + col, from which `unit` could fire on at least
   * one of `among`; attackTargets finds nothing from any other cell. */
  Game.prototype.attackCells = function (unit, among) {
    var w = this.width, h = this.height, cells = new Uint8Array(w * h);
    for (var i = 0; i < among.length; i++) {
      var e = among[i];
      if (e.player === unit.player || e.carriedBy || e.inFactory) continue;
      var band = COMBAT.rangeBand(unit.type, COMBAT.isAir(e));
      if (!band) continue;
      for (var r = Math.max(0, e.row - band.max - 1); r <= Math.min(h - 1, e.row + band.max + 1); r++) {
        for (var c = Math.max(0, e.col - band.max); c <= Math.min(w - 1, e.col + band.max); c++) {
          var d = HEX.distance(c, r, e.col, e.row);
          if (d >= band.min && d <= band.max) cells[r * w + c] = 1;
        }
      }
    }
    return cells;
  };

  Game.prototype.availableActions = function (unit) {
    var actions = { moves: [], attacks: [], unloads: [], store: false };
    if (this.winner !== null || unit.player !== this.currentPlayer ||
        this.unitAt(unit.col, unit.row) !== unit) return actions;
    if (this.canMoveNow(unit)) actions.moves = Object.values(this.movementRange(unit)).filter(function (rec) {
      return rec.cost > 0 && rec.canStop;
    });
    actions.attacks = this.legalAttackTargets(unit);
    actions.store = !unit.moved && this.entersBuilding(unit, unit.col, unit.row);
    unit.cargo.forEach(function (cargo) {
      var targets = this.unloadTargets(unit, cargo);
      if (targets.length) actions.unloads.push({ cargo: cargo, targets: targets });
    }, this);
    return actions;
  };

  Game.prototype.remainingTurnActions = function () {
    var result = { field: [], reserves: [] };
    this.playerUnits(this.currentPlayer).forEach(function (unit) {
      var actions = this.availableActions(unit);
      if (actions.moves.length || actions.attacks.length || actions.unloads.length || actions.store)
        result.field.push({ unit: unit, actions: actions });
    }, this);
    this.playerFactories(this.currentPlayer).forEach(function (building) {
      building.stored.forEach(function (unit) {
        var exits = this.deployTargets(building, unit), transports = this.transportDeployTargets(building, unit);
        if (exits.length || transports.length) result.reserves.push({unit: unit, building: building,
          exits: exits, transports: transports});
      }, this);
    }, this);
    return result;
  };

  /* Every command the side to move may issue now, as [method, arguments], in
   * a fixed order any player can index: each field unit in board order (its
   * moves in search order, attacks, unloads, then finishing its activation),
   * then each owned building's reserves (exits, then transports), then ending
   * the turn. The Rust simulator lists the same commands in the same order. */
  Game.prototype.legalCommands = function () {
    var out = [];
    if (this.winner !== null) return out;
    this.playerUnits(this.currentPlayer).forEach(function (unit) {
      if (this.canMoveNow(unit)) {
        var range = this.movementRange(unit);
        Object.keys(range).forEach(function (key) {
          var rec = range[key];
          if (rec.cost > 0 && rec.canStop) out.push(["moveUnit", [unit, rec.col, rec.row]]);
        });
      }
      this.legalAttackTargets(unit).forEach(function (target) { out.push(["attack", [unit, target]]); });
      unit.cargo.forEach(function (cargo) {
        this.unloadTargets(unit, cargo).forEach(function (n) { out.push(["unload", [unit, cargo, n.col, n.row]]); });
      }, this);
      if (!unit.moved) out.push(["finishUnit", [unit]]);
    }, this);
    this.playerFactories(this.currentPlayer).forEach(function (building) {
      building.stored.forEach(function (unit) {
        this.deployTargets(building, unit).forEach(function (n) { out.push(["deployFromFactory", [building, unit, n.col, n.row]]); });
        this.transportDeployTargets(building, unit).forEach(function (transport) { out.push(["loadFromFactory", [building, unit, transport]]); });
      }, this);
    }, this);
    out.push(["endTurn", []]);
    return out;
  };

  Game.prototype.moveUnit = function (unit, col, row, range) {
    if (!this.canMoveNow(unit)) throw new Error("Unit cannot move now");
    // A supplied preview may predate a move, casualty, load, deployment or
    // editor change. Recompute legality and cost from the current board;
    // retain the optional argument only for compatibility with existing callers.
    range = this.movementRange(unit, HEX.key(col, row));
    var rec = range[HEX.key(col, row)];
    if (!rec || !rec.canStop) throw new Error("Illegal move");
    if (!rec.load && !this.canStopAtBuilding(unit, col, row)) throw new Error("Cannot stop on an unowned factory");
    // Preserve the exact route selected by the live legality search for display.
    var path = [], step = rec;
    while (step) {
      path.push({col: step.col, row: step.row});
      step = step.prev === null ? null : range[step.prev];
    }
    path.reverse();
    var transport = rec.load ? this.unitAt(col, row) : null;
    if (rec.load && !this.canLoad(transport, unit, false)) throw new Error("Cannot board this transport");
    if (unit.type.moveOrFire && rec.cost > 0) unit.attackSpent = true; // SP guns/Hawkeye: move OR fire
    unit.movePointsLeft -= rec.cost;
    if (rec.load) {
      transport.cargo.push(unit);
      transport.transferUsed = true;
      unit.carriedBy = transport.id;
      unit.col = col; unit.row = row;
      unit.moved = true;
      unit.movePointsLeft = 0;
      this.log.push({ t: "load", unit: unit.id, into: transport.id });
      return { loaded: true, path: path };
    }
    unit.col = col; unit.row = row;
    // ZOC ends this move, but a buggy can use its unspent allowance after
    // attacking. Recalculate ZOC for that second move after casualties.
    // Terrain that drains movement already charged the full budget above.
    if (rec.stop && (!unit.type.moveAfterAttack || unit.attacked)) unit.movePointsLeft = 0;
    this.log.push({ t: "move", unit: unit.id, col: col, row: row });
    return { loaded: false, path: path };
  };

  /* Commit the movement phase without consuming a legal follow-up shot.
   * Buggies retain their unused allowance, unlocked only after their attack. */
  Game.prototype.finishMovement = function (unit) {
    unit.shifted = true;
    if (!unit.type.moveAfterAttack || unit.attacked) unit.movePointsLeft = 0;
    if (unit.moved || unit.carriedBy || unit.inFactory) return [];
    if (this.entersBuilding(unit, unit.col, unit.row) || !this.legalAttackTargets(unit).length) {
      return this.finishUnit(unit);
    }
    return [];
  };

  /* Factory storage repairs the carrier and passenger separately. Entering
   * and redeploying each spend an activation; bases never repair. */
  Game.prototype.finishUnit = function (unit) {
    if (unit.inFactory) return []; // already stored, including after deployment
    var b = this.buildingAt(unit.col, unit.row);
    var events = [];
    if (b) {
      // Capture: infantry only, on enemy/neutral buildings.
      if (unit.type.capture && b.owner !== unit.player) {
        b.owner = unit.player;
        // Stored units belong to the new owner once the factory is captured.
        for (var i = 0; i < b.stored.length; i++) b.stored[i].player = unit.player;
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
      if (b.kind === "factory" && b.owner === unit.player && this.winner === null) {
        var storing = [unit].concat(unit.cargo);
        unit.cargo = [];
        for (var si = 0; si < storing.length; si++) {
          var storedUnit = storing[si], ui = this.units.indexOf(storedUnit);
          if (ui >= 0) this.units.splice(ui, 1);
          storedUnit.inFactory = true;
          storedUnit.carriedBy = null;
          storedUnit.col = b.col; storedUnit.row = b.row;
          storedUnit.strength = COMBAT.MAX_STRENGTH;
          storedUnit.moved = true;
          storedUnit.movePointsLeft = 0;
          b.stored.push(storedUnit);
        }
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
    if (this.legalAttackTargets(attacker).indexOf(defender) < 0)
      throw new Error(attacker.attacked ? "Unit already attacked this turn" : "Illegal attack target or unit cannot attack now");
    var result = COMBAT.resolve(this, attacker, defender, this.rng);
    this.log.push({
      t: "battle", a: attacker.id, d: defender.id,
      dmgD: result.dmgToDefender, dmgA: result.dmgToAttacker,
    });
    // A damaged transport also loses passengers down to its remaining
    // strength. Loading a larger squad is legal; undamaged cargo is unchanged.
    [attacker, defender].forEach(function (unit, i) {
      if ((i === 0 ? result.dmgToAttacker : result.dmgToDefender) > 0) {
        unit.cargo.forEach(function (cargo) {
          cargo.strength = Math.min(cargo.strength, unit.strength);
        });
      }
    });
    if (result.defenderDead) this.removeUnit(defender);
    if (result.attackerDead) this.removeUnit(attacker);
    if (!result.attackerDead) {
      attacker.attacked = true;
      if (attacker.type.moveAfterAttack && attacker.movePointsLeft > 0) {
        // The activation remains open so the remaining movement can be spent.
        attacker.shifted = false;
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
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].typeId !== "TRIGGER") alive[this.units[i].player]++;
    }
    // PCE excludes mines everywhere and Atlas guns still in storage.
    // Other owned reserves count, including those with blocked exits.
    for (var k in this.buildings) {
      var b = this.buildings[k];
      if (b.owner === 0 || b.owner === 1) {
        alive[b.owner] += b.stored.filter(function (u) {
          return u.typeId !== "TRIGGER" && u.typeId !== "ATLAS";
        }).length;
      }
    }
    if (alive[0] === 0) { this.winner = 1; this.winReason = "elimination"; }
    else if (alive[1] === 0) { this.winner = 0; this.winReason = "elimination"; }
  };

  /* Unload one cargo unit from a transport to an adjacent hex. */
  Game.prototype.unloadTargets = function (transport, cargoUnit) {
    var self = this;
    if (this.winner !== null || transport.player !== this.currentPlayer ||
        transport.transferUsed || cargoUnit.moved || cargoUnit.carriedBy !== transport.id ||
        transport.cargo.indexOf(cargoUnit) < 0 ||
        this.unitAt(transport.col, transport.row) !== transport) return [];
    return HEX.neighbors(transport.col, transport.row).filter(function (n) {
      var terr = self.terrainAt(n.col, n.row);
      var b = self.buildingAt(n.col, n.row);
      return terr && !self.unitAt(n.col, n.row) &&
        terrainCost(terr, cargoUnit.type.moveType, cargoUnit.type) !== null &&
        terr.deployable && (!b || (b.kind === "factory" && b.owner === cargoUnit.player));
    });
  };

  Game.prototype.unload = function (transport, cargoUnit, col, row) {
    if (!this.unloadTargets(transport, cargoUnit).some(function (n) {
      return n.col === col && n.row === row;
    })) throw new Error("Cargo cannot unload here or has already acted this turn");
    cargoUnit.carriedBy = null;
    cargoUnit.col = col; cargoUnit.row = row;
    cargoUnit.moved = true; cargoUnit.movePointsLeft = 0;
    transport.cargo.splice(transport.cargo.indexOf(cargoUnit), 1);
    transport.transferUsed = true;
    this.log.push({ t: "unload", unit: cargoUnit.id, col: col, row: row });
    this.finishUnit(cargoUnit);
  };

  Game.prototype.canDeployNow = function (building, unit) {
    return this.winner === null && building && this.buildingAt(building.col, building.row) === building &&
      building.owner === this.currentPlayer && unit.player === building.owner &&
      unit.inFactory && !unit.carriedBy && !unit.moved && building.stored.indexOf(unit) >= 0;
  };

  Game.prototype.canDeployAt = function (building, unit, col, row) {
    if (!this.canDeployNow(building, unit) || !this.inBounds(col, row) ||
        HEX.distance(building.col, building.row, col, row) !== 1 || this.unitAt(col, row)) return false;
    var terr = this.terrainAt(col, row);
    return !!terr.deployable && terrainCost(terr, unit.type.moveType, unit.type) !== null &&
      this.canStopAtBuilding(unit, col, row);
  };

  Game.prototype.canDeployInto = function (building, unit, transport) {
    return this.canDeployNow(building, unit) && this.canLoad(transport, unit, true) &&
      this.unitAt(transport.col, transport.row) === transport &&
      HEX.distance(building.col, building.row, transport.col, transport.row) === 1;
  };

  /* Empty hexes a stored unit could deploy to: one of the six around the
   * factory, on terrain explicitly marked as deployable. Shared by the UI's
   * exit picker and the AI. */
  Game.prototype.deployTargets = function (building, storedUnit) {
    if (!this.canDeployNow(building, storedUnit)) return [];
    var out = [];
    var ns = HEX.neighbors(building.col, building.row);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      if (!this.canDeployAt(building, storedUnit, n.col, n.row)) continue;
      out.push(n);
    }
    return out;
  };

  /* Adjacent transports a stored unit can deploy directly into. */
  Game.prototype.transportDeployTargets = function (building, storedUnit) {
    if (!this.canDeployNow(building, storedUnit)) return [];
    var out = [];
    var ns = HEX.neighbors(building.col, building.row);
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      if (!this.inBounds(n.col, n.row)) continue;
      var transport = this.unitAt(n.col, n.row);
      if (!this.canDeployInto(building, storedUnit, transport)) continue;
      out.push(transport);
    }
    return out;
  };

  /* Deploy a stored unit from a factory to a chosen adjacent hex. Units
   * exit only onto open terrain marked as deployable. Deploying costs the
   * unit its whole turn, and a unit stored this turn cannot leave until the
   * next. Mines and Atlas may also deploy directly, becoming immobile. */
  Game.prototype.deployFromFactory = function (building, storedUnit, col, row) {
    if (!this.canDeployAt(building, storedUnit, col, row)) throw new Error("Unit cannot deploy to this hex now");
    var idx = building.stored.indexOf(storedUnit);
    building.stored.splice(idx, 1);
    storedUnit.inFactory = false;
    storedUnit.player = building.owner;
    storedUnit.col = col; storedUnit.row = row;
    storedUnit.moved = true; storedUnit.movePointsLeft = 0;
    this.units.push(storedUnit);
    this.log.push({ t: "deploy", unit: storedUnit.id, col: col, row: row });
    if (this.buildingAt(col, row)) this.finishUnit(storedUnit);
    return storedUnit;
  };

  /* Load a stored ground unit directly onto an eligible adjacent transport. */
  Game.prototype.loadFromFactory = function (building, storedUnit, transport) {
    if (!this.canDeployInto(building, storedUnit, transport)) throw new Error("Unit cannot deploy into this transport now");
    var idx = building.stored.indexOf(storedUnit);
    building.stored.splice(idx, 1);
    storedUnit.inFactory = false;
    storedUnit.player = building.owner;
    storedUnit.col = transport.col; storedUnit.row = transport.row;
    storedUnit.carriedBy = transport.id;
    storedUnit.moved = true;
    storedUnit.movePointsLeft = 0;
    transport.cargo.push(storedUnit);
    transport.transferUsed = true;
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
      delete u.transferUsed;
      delete u.shifted;
      u.movePointsLeft = u.type.move;
    }
    // Stored units refresh too, so anything stored last turn may deploy.
    for (var k in this.buildings) {
      var stored = this.buildings[k].stored;
      for (var j = 0; j < stored.length; j++) {
        stored[j].moved = false;
        stored[j].attacked = false;
        stored[j].attackSpent = false;
        delete stored[j].transferUsed;
        delete stored[j].shifted;
        stored[j].movePointsLeft = stored[j].type.move;
      }
    }
    if (this.currentPlayer !== (this.firstPlayer || 0)) {
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

  return { Game: Game, makeUnit: makeUnit, CostQueue: CostQueue, gridTables: tablesFor, terrainTables: terrainTables,
    stepCosts: stepCosts };
})();

if (typeof module !== "undefined") module.exports = ENGINE;
