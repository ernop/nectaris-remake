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

  function actUnit(game, unit, events) {
    var range = game.movementRange(unit);

    // Retreat to repair when battered and a friendly building is near.
    if (unit.strength <= 3 && unit.type.move > 0) {
      var rb = nearestOwnedRepair(game, unit);
      if (rb) {
        var rec = range[HEX.key(rb.col, rb.row)];
        if (rec && rec.canStop && !game.unitAt(rb.col, rb.row)) {
          game.moveUnit(unit, rb.col, rb.row, range);
          events.push({ t: "move", unit: unit });
          game.finishUnit(unit);
          return;
        }
      }
    }

    var plan = bestAttackPlan(game, unit);
    if (plan && plan.score > -2) {
      if (plan.dest && (plan.dest.col !== unit.col || plan.dest.row !== unit.row)) {
        game.moveUnit(unit, plan.dest.col, plan.dest.row, range);
        events.push({ t: "move", unit: unit });
      }
      if (game.units.indexOf(plan.target) >= 0) {
        var result = game.attack(unit, plan.target);
        events.push({ t: "battle", attacker: unit, defender: plan.target, result: result });
        if (game.units.indexOf(unit) >= 0 && !unit.moved) game.finishUnit(unit);
        return;
      }
    }

    // No good attack: advance.
    var goal = nearestGoal(game, unit);
    if (goal && unit.type.move > 0) {
      var step = bestStepToward(game, unit, range, goal, unit.type.moveOrFire);
      if (step) {
        var res = game.moveUnit(unit, step.col, step.row, range);
        events.push({ t: "move", unit: unit });
        if (!res.loaded) {
          // capture / repair handled by finish
          game.finishUnit(unit);
          return;
        }
        return;
      }
    }
    game.finishUnit(unit);
  }

  function deployFromFactories(game, player, events) {
    var facs = game.playerFactories(player);
    for (var i = 0; i < facs.length; i++) {
      var b = facs[i];
      // Deploy one stored (mobile) unit per factory per turn, onto the
      // open exit hex nearest the enemy base.
      for (var s = b.stored.length - 1; s >= 0; s--) {
        var su = b.stored[s];
        if (su.type.placeByTransport) continue; // AI skips Atlas/Trigger logistics
        if (su.moved) continue;                 // stored this turn
        var exits = game.deployTargets(b, su);
        if (exits.length) {
          var goal = null;
          for (var k in game.buildings) {
            var eb = game.buildings[k];
            if (eb.kind === "base" && eb.owner === 1 - player) { goal = eb; break; }
          }
          exits.sort(function (p, q) {
            if (!goal) return 0;
            return HEX.distance(p.col, p.row, goal.col, goal.row) -
                   HEX.distance(q.col, q.row, goal.col, goal.row);
          });
          game.deployFromFactory(b, su, exits[0].col, exits[0].row);
          events.push({ t: "deploy", unit: su });
        }
        break; // one deployment per factory per turn
      }
    }
  }

  /* Play a whole turn. Returns events for animation. */
  function playTurn(game, player) {
    var events = [];
    deployFromFactories(game, player, events);

    // Activation order: artillery/AA first (soften), then combat units by
    // value, infantry last so captures happen after the field is shaped.
    var units = game.playerUnits(player).slice();
    units.sort(function (a, b) {
      function rank(u) {
        if (u.type.moveOrFire || isRangedType(u.type)) return 0;
        if (u.type.capture) return 2;
        return 1;
      }
      return rank(a) - rank(b) || unitValue(b) - unitValue(a);
    });

    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (game.winner !== null) break;
      if (game.units.indexOf(u) < 0 || u.moved || u.carriedBy) continue;
      actUnit(game, u, events);
    }
    return events;
  }

  return { playTurn: playTurn, expectedTrade: expectedTrade };
})();

if (typeof module !== "undefined") module.exports = AI;
