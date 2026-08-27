/* Nectaris remake — computer opponent.
 *
 * Plays one full turn for a player: deploys stored factory units, then
 * activates each fielded unit with a simple evaluate-attacks-else-advance
 * policy. Returns a list of visual events so the UI can animate the turn.
 *
 * Not a clone of the original AI (never published); tuned for similar
 * behavior: aggressive on favorable trades, sends infantry at factories and
 * the base, retreats badly damaged units to repair, holds good terrain.
 */
"use strict";

if (typeof module !== "undefined") {
  var ENGINE = require("./engine.js");
}

var AI = (function () {

  function isRangedType(t) { return (t.rngG || 0) > 1 || (t.rngA || 0) > 1; }

  function unitValue(u) {
    var t = u.type;
    var v = (t.atkG + t.atkA + t.def) / 3 + t.move;
    if (t.capture) v += 25;                // capturers are precious
    if (isRangedType(t)) v += 15;
    return v * (u.strength / 8);
  }

  /* Expected kills for a battle, using deterministic expectation. */
  function expectedTrade(game, attacker, defender) {
    var pv = COMBAT.preview(game, attacker, defender);
    var pKill = pv.attacker.ap > 0 ? pv.attacker.ap / (pv.attacker.ap + pv.defender.da) : 0;
    var eDmgOut = pKill * attacker.strength;
    var eDmgIn = 0;
    if (pv.counter && pv.defender.ap > 0) {
      var pC = pv.defender.ap / (pv.defender.ap + pv.attacker.da);
      eDmgIn = pC * defender.strength;
    }
    return { out: eDmgOut, in_: eDmgIn, pv: pv };
  }

  function scoreAttack(game, attacker, defender, trade) {
    var defVal = unitValue(defender) / Math.max(1, defender.strength);
    var atkVal = unitValue(attacker) / Math.max(1, attacker.strength);
    var score = trade.out * defVal - trade.in_ * atkVal;
    if (trade.out >= defender.strength) score += defVal * 4; // likely kill
    if (defender.type.capture) score += 10;                  // stop captures
    if (isRangedType(defender.type)) score += 6;             // silence artillery
    return score;
  }

  function nearestGoal(game, unit) {
    // Infantry: nearest non-owned building (base > factory). Others: nearest
    // enemy unit; fall back to enemy base.
    var best = null, bestD = Infinity, k, b, d, i;
    if (unit.type.capture) {
      for (k in game.buildings) {
        b = game.buildings[k];
        if (b.owner === unit.player) continue;
        d = HEX.distance(unit.col, unit.row, b.col, b.row);
        var weight = b.kind === "base" ? d * 0.7 : d; // prefer the base
        if (weight < bestD) { bestD = weight; best = { col: b.col, row: b.row }; }
      }
      if (best) return best;
    }
    var foes = game.playerUnits(1 - unit.player);
    for (i = 0; i < foes.length; i++) {
      d = HEX.distance(unit.col, unit.row, foes[i].col, foes[i].row);
      if (d < bestD) { bestD = d; best = { col: foes[i].col, row: foes[i].row }; }
    }
    if (!best) {
      for (k in game.buildings) {
        b = game.buildings[k];
        if (b.kind === "base" && b.owner !== unit.player) return { col: b.col, row: b.row };
      }
    }
    return best;
  }

  function nearestOwnedRepair(game, unit) {
    // Only factories repair (by storing the unit for a turn); bases do not.
    var best = null, bestD = Infinity;
    for (var k in game.buildings) {
      var b = game.buildings[k];
      if (b.owner !== unit.player || b.kind !== "factory") continue;
      var d = HEX.distance(unit.col, unit.row, b.col, b.row);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  /* Choose the reachable hex that minimizes distance to goal, breaking ties
   * on terrain defense. */
  function bestStepToward(game, unit, range, goal, avoidFrontline) {
    var bestKey = null, bestScore = Infinity;
    for (var k in range) {
      var rec = range[k];
      if (!rec.canStop || rec.load) continue;
      if (rec.col === unit.col && rec.row === unit.row) continue;
      var occ = game.unitAt(rec.col, rec.row);
      if (occ && occ !== unit) continue;
      var d = HEX.distance(rec.col, rec.row, goal.col, goal.row);
      var terr = game.terrainAt(rec.col, rec.row);
      var s = d * 10 - (unit.type.moveType === "air" ? 0 : terr.def * 0.05);
      if (avoidFrontline && game.inEnemyZOC(rec.col, rec.row, unit.player)) s += 30;
      if (s < bestScore) { bestScore = s; bestKey = k; }
    }
    return bestKey ? range[bestKey] : null;
  }

  /* Best (destination, target) attack plan for a unit. Move-or-fire units
   * attack from where they stand; everything else (including the Lynx, whose
   * ground band is exactly 2) searches move destinations, with attackTargets
   * applying the per-domain range bands at each candidate hex. */
  function bestAttackPlan(game, unit) {
    var plans = [];
    var i, t, targets, trade;
    if (unit.type.moveOrFire) {
      targets = game.attackTargets(unit);
      for (i = 0; i < targets.length; i++) {
        t = targets[i];
        trade = expectedTrade(game, unit, t);
        plans.push({ dest: null, target: t, trade: trade, score: scoreAttack(game, unit, t, trade) });
      }
    } else if (unit.type.rngG || unit.type.rngA) {
      var range = game.movementRange(unit);
      for (var k in range) {
        var rec = range[k];
        if (!rec.canStop || rec.load) continue;
        var occ = game.unitAt(rec.col, rec.row);
        if (occ && occ !== unit) continue;
        // simulate standing there
        var oc = unit.col, orow = unit.row;
        unit.col = rec.col; unit.row = rec.row;
        targets = game.attackTargets(unit);
        for (i = 0; i < targets.length; i++) {
          t = targets[i];
          trade = expectedTrade(game, unit, t);
          var sc = scoreAttack(game, unit, t, trade);
          // prefer attacking from defensive terrain
          if (unit.type.moveType !== "air") sc += game.terrainAt(rec.col, rec.row).def * 0.05;
          plans.push({ dest: rec, target: t, trade: trade, score: sc });
        }
        unit.col = oc; unit.row = orow;
      }
    }
    if (!plans.length) return null;
    plans.sort(function (a, b) { return b.score - a.score; });
    return plans[0];
  }

  function planUnit(game, unit) {
    var range = game.movementRange(unit);

    // Retreat to repair when battered and a friendly building is near.
    if (unit.strength <= 3 && unit.type.move > 0) {
      var rb = nearestOwnedRepair(game, unit);
      if (rb) {
        var rec = range[HEX.key(rb.col, rb.row)];
        if (rec && rec.canStop && !game.unitAt(rb.col, rb.row)) {
          return { kind: "move", dest: rec, range: range, reason: "repair" };
        }
      }
    }

    var plan = bestAttackPlan(game, unit);
    if (plan && plan.score > -2) {
      return { kind: "attack", dest: plan.dest, target: plan.target, range: range };
    }

    // No good attack: advance.
    var goal = nearestGoal(game, unit);
    if (goal && unit.type.move > 0) {
      var step = bestStepToward(game, unit, range, goal, unit.type.moveOrFire);
      if (step) {
        return { kind: "move", dest: step, range: range, reason: "advance" };
      }
    }
    return { kind: "finish" };
  }

  function deployOneFactory(game, building) {
    // Deploy one stored mobile unit per factory and turn, choosing the exit
    // nearest the opposing base.
    for (var s = building.stored.length - 1; s >= 0; s--) {
      var su = building.stored[s];
      if (su.type.placeByTransport || su.moved) continue;
      var exits = game.deployTargets(building, su);
      if (!exits.length) return null;
      var goal = null;
      for (var k in game.buildings) {
        var enemyBuilding = game.buildings[k];
        if (enemyBuilding.kind === "base" &&
            enemyBuilding.owner === 1 - building.owner) {
          goal = enemyBuilding;
          break;
        }
      }
      exits.sort(function (a, b) {
        if (!goal) return 0;
        return HEX.distance(a.col, a.row, goal.col, goal.row) -
          HEX.distance(b.col, b.row, goal.col, goal.row);
      });
      var exit = exits[0];
      game.deployFromFactory(building, su, exit.col, exit.row);
      return {
        t: "deploy", unit: su, building: building,
        to: { col: exit.col, row: exit.row },
      };
    }
    return null;
  }

  function activationOrder(game, player) {
    var units = game.playerUnits(player).slice();
    units.sort(function (a, b) {
      function rank(u) {
        if (u.type.moveOrFire || isRangedType(u.type)) return 0;
        if (u.type.capture) return 2;
        return 1;
      }
      return rank(a) - rank(b) || unitValue(b) - unitValue(a);
    });
    return units;
  }

  /* A turn runner mutates one visible action per next() call. Movement,
   * battle preview and battle result are separate events, so the UI can
   * render each state before the next mutation. */
  function createTurn(game, player) {
    var factories = game.playerFactories(player);
    var factoryIndex = 0;
    var units = null;
    var unitIndex = 0;
    var pending = [];

    function queueAction(unit, action) {
      if (action.kind === "finish") {
        pending.push(function () {
          var effects = game.finishUnit(unit);
          return effects.length ? { t: "finish", unit: unit, effects: effects } : { t: "wait", unit: unit };
        });
        return;
      }

      if (action.kind === "move") {
        pending.push(function () {
          var from = { col: unit.col, row: unit.row };
          var moved = game.moveUnit(unit, action.dest.col, action.dest.row, action.range);
          var effects = moved.loaded ? [] : game.finishUnit(unit);
          return {
            t: "move", unit: unit, from: from,
            to: { col: action.dest.col, row: action.dest.row },
            reason: action.reason, effects: effects,
          };
        });
        return;
      }

      if (action.dest && (action.dest.col !== unit.col || action.dest.row !== unit.row)) {
        pending.push(function () {
          var from = { col: unit.col, row: unit.row };
          game.moveUnit(unit, action.dest.col, action.dest.row, action.range);
          return {
            t: "move", unit: unit, from: from,
            to: { col: action.dest.col, row: action.dest.row },
            reason: "attack",
          };
        });
      }

      var attackerBefore, defenderBefore, preview;
      pending.push(function () {
        attackerBefore = unit.strength;
        defenderBefore = action.target.strength;
        preview = COMBAT.preview(game, unit, action.target);
        return {
          t: "battle-preview", attacker: unit, defender: action.target,
          attackerBefore: attackerBefore, defenderBefore: defenderBefore,
          preview: preview,
        };
      });
      pending.push(function () {
        var result = game.attack(unit, action.target);
        if (game.units.indexOf(unit) >= 0 && !unit.moved) game.finishUnit(unit);
        return {
          t: "battle", attacker: unit, defender: action.target,
          attackerBefore: attackerBefore, defenderBefore: defenderBefore,
          result: result,
        };
      });
    }

    function next() {
      while (true) {
        if (pending.length) return pending.shift()();
        if (game.winner !== null) return null;

        if (factoryIndex < factories.length) {
          var deployed = deployOneFactory(game, factories[factoryIndex++]);
          if (deployed) return deployed;
          continue;
        }

        if (!units) units = activationOrder(game, player);
        if (unitIndex >= units.length) return null;
        var unit = units[unitIndex++];
        if (game.units.indexOf(unit) < 0 || unit.moved || unit.carriedBy) continue;
        queueAction(unit, planUnit(game, unit));
      }
    }

    return { next: next };
  }

  /* Immediate mode consumes the same event stream without display delays. */
  function playTurn(game, player) {
    var events = [];
    var turn = createTurn(game, player);
    var event;
    while ((event = turn.next()) !== null) events.push(event);
    return events;
  }

  return { createTurn: createTurn, playTurn: playTurn, expectedTrade: expectedTrade };
})();

if (typeof module !== "undefined") module.exports = AI;
