/* Linear movement search, with the verified ZOC exit rule. Kept as an
 * independent algorithmic oracle for costs, stop flags and path ties.
 * Original-executable fixtures separately verify the shared rule. */
"use strict";
module.exports = function (unit) {
    var self = this;
    var result = {};
    var startKey = HEX.key(unit.col, unit.row);
    var budget = unit.movePointsLeft;

    var frontier = [{ col: unit.col, row: unit.row, cost: 0 }];
    result[startKey] = { col: unit.col, row: unit.row, cost: 0, canStop: true, prev: null };
    if (unit.shifted) return result;

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
        var stepCost = baseCost;
        /* Valley: a unit that can enter at all does so by spending everything
         * it has left, so it always ends its move there. Air is unaffected —
         * terrainCost already flattens every hex to 1 for aircraft. */
        var drains = !!terr.costsAllMovement && unit.type.moveType !== "air";
        if (drains) {
          stepCost = budget - cur.cost;
          if (stepCost < 1) continue;
        }
        var occ = this.unitAt(n.col, n.row);
        var isLoad = false;
        if (occ) {
          if (occ.player !== unit.player) continue;             // enemies block
          if (this.canLoad(occ, unit, false)) {
            isLoad = true;                                       // can board
          }
          // friendly non-transport: can pass through, not stop
        }
        var newCost = cur.cost + stepCost;
        if (newCost > budget) continue;
        var k = HEX.key(n.col, n.row);
        var enteringZOC = this.inEnemyZOC(n.col, n.row, unit.player);
        var canStopHere = !occ || isLoad;
        if (!isLoad && !this.canStopAtBuilding(unit, n.col, n.row)) canStopHere = false;
        var rec = result[k];
        if (!rec || newCost < rec.cost) {
          result[k] = {
            col: n.col, row: n.row, cost: newCost,
            stop: enteringZOC || drains,             // move ends here
            canStop: canStopHere,                    // can end move on hex
            load: isLoad,
            enterBuilding: canStopHere && !isLoad && this.entersBuilding(unit, n.col, n.row),
            prev: curKey,
          };
          if (!isLoad) frontier.push({ col: n.col, row: n.row, cost: newCost });
        }
      }
    }
    return result;
  };
