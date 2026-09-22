/* Nectaris remake — computer opponent.
 *
 * Plays one full turn for a player: deploys stored factory units, then
 * activates each fielded unit with a simple evaluate-attacks-else-advance
 * policy. Returns a list of visual events so the UI can animate the turn.
 *
 * Reconstructs documented transport, factory and base-defense tactics.
 * Scoring and tie-breaking remain a remake heuristic, not a disassembly of
 * the original CPU. Sources and the unresolved cases: FIDELITY_AUDIT.md.
 */
"use strict";

if (typeof module !== "undefined") {
  var ENGINE = require("./engine.js");
}

var AI = (function () {
  // Capture the stock policy before a restored/custom roster replaces types.
  var ATLAS_DEPLOYMENT_ENEMIES = UNIT_TYPES.ATLAS.aiDeploymentEnemies;

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
    var eDmgOut = COMBAT.expectedCasualties(
      attacker, defender, pv.attacker.ap, pv.defender.da
    );
    var eDmgIn = 0;
    if (pv.counter && pv.defender.ap > 0) {
      eDmgIn = COMBAT.expectedCasualties(
        defender, attacker, pv.defender.ap, pv.attacker.da
      );
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
        var weight = b.kind === "base" ? d * 0.7 : d;
        // Anka l5: infantry divert to another factory when an enemy has
        // secured the approaches, including with indirect weapons.
        if (b.kind === "factory" && guardedBuilding(game, b, unit.player)) weight += 20;
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

  function guardedBuilding(game, building, player) {
    return game.playerUnits(1 - player).some(function (enemy) {
      var distance = HEX.distance(enemy.col, enemy.row, building.col, building.row);
      return distance <= 1 || COMBAT.canAttackAt(enemy.type, false, distance);
    });
  }

  function threatenedBase(game, player) {
    var bases = Object.keys(game.buildings).map(function (key) { return game.buildings[key]; })
      .filter(function (b) { return b.kind === "base" && b.owner === player; });
    var enemies = game.playerUnits(1 - player);
    for (var i = 0; i < bases.length; i++) {
      for (var j = 0; j < enemies.length; j++) {
        var carrier = enemies[j];
        if (carrier.typeId !== "PELICAN" || !carrier.cargo.some(function (u) { return u.type.capture; })) continue;
        // The original responds before an infantry airlift reaches its base
        // (Anka l5). The exact detection radius has not been recovered.
        if (HEX.distance(carrier.col, carrier.row, bases[i].col, bases[i].row) <= carrier.type.move + 1) return bases[i];
      }
    }
    return null;
  }

  /* Terrain-aware remaining walking distance, used only for transport
   * planning. Actual actions always go through the engine's ZOC/legal moves. */
  function walkingDistances(game, passenger, goal) {
    var distances = {}, open = new ENGINE.CostQueue();
    open.push({ col: goal.col, row: goal.row, cost: 0 });
    distances[HEX.key(goal.col, goal.row)] = 0;
    var current;
    while ((current = open.pop()) !== null) {
      if (current.cost !== distances[HEX.key(current.col, current.row)]) continue;
      var terrain = game.terrainAt(current.col, current.row);
      var cost = terrainCost(terrain, passenger.type.moveType, passenger.type);
      if (cost === null) continue;
      if (terrain.costsAllMovement && passenger.type.moveType !== "air") cost = Math.max(1, passenger.type.move);
      HEX.neighbors(current.col, current.row).forEach(function (n) {
        var terr = game.terrainAt(n.col, n.row);
        if (!terr || terrainCost(terr, passenger.type.moveType, passenger.type) === null) return;
        var key = HEX.key(n.col, n.row), next = current.cost + cost;
        if (distances[key] === undefined || next < distances[key]) {
          distances[key] = next;
          open.push({ col: n.col, row: n.row, cost: next });
        }
      });
    }
    return distances;
  }

  function wantsTransport(game, passenger, carrier, fromFactory, range) {
    if (!game.canLoad(carrier, passenger, fromFactory)) return false;
    if (!passenger.type.move) return fromFactory;
    var goal = nearestGoal(game, passenger);
    if (!goal) return false;
    if (!fromFactory) {
      range = range || game.movementRange(passenger);
      var target = range[HEX.key(goal.col, goal.row)];
      if (target && target.canStop && !target.load) return false;
    }
    // Avoid spending an activation boarding for a destination already nearby.
    return HEX.distance(passenger.col, passenger.row, goal.col, goal.row) > passenger.type.move + 1;
  }

  function boardOnePassenger(game, player) {
    var units = game.playerUnits(player);
    var carriers = units.filter(function (u) {
      return u.type.cargo && !u.moved && u.cargo.length < u.type.cargo;
    });
    if (!carriers.length) return null;
    for (var i = 0; i < units.length; i++) {
      var passenger = units[i];
      if (passenger.moved || !passenger.type.move || passenger.type.cargo || passenger.type.moveType === "air") continue;
      var range = null;
      for (var j = 0; j < carriers.length; j++) {
        var carrier = carriers[j];
        if (!game.canLoad(carrier, passenger, false)) continue;
        range = range || game.movementRange(passenger);
        var destination = range[HEX.key(carrier.col, carrier.row)];
        if (!destination || !destination.load) continue;
        if (!wantsTransport(game, passenger, carrier, false, range)) continue;
        var from = { col: passenger.col, row: passenger.row };
        game.moveUnit(passenger, carrier.col, carrier.row, range);
        return { t: "move", unit: passenger, from: from,
          to: { col: carrier.col, row: carrier.row }, reason: "load", effects: [] };
      }
    }
    return null;
  }

  function planTransport(game, carrier, range) {
    if (!carrier.cargo.length) {
      // Rendezvous with a passenger, including reserves with no open exit.
      var candidates = game.playerUnits(carrier.player).filter(function (u) {
        return !u.moved && !u.type.cargo && wantsTransport(game, u, carrier, false);
      });
      game.playerFactories(carrier.player).forEach(function (b) {
        b.stored.forEach(function (u) {
          if (!u.moved && wantsTransport(game, u, carrier, true)) candidates.push(u);
        });
      });
      candidates.sort(function (a, b) {
        return Number(!!b.type.capture) - Number(!!a.type.capture) ||
          HEX.distance(carrier.col, carrier.row, a.col, a.row) - HEX.distance(carrier.col, carrier.row, b.col, b.row);
      });
      if (!candidates.length) return null;
      var passenger = candidates[0], best = null, distance = Infinity;
      Object.keys(range).forEach(function (key) {
        var rec = range[key];
        if (!rec.canStop || rec.load || rec.enterBuilding || game.unitAt(rec.col, rec.row) && game.unitAt(rec.col, rec.row) !== carrier) return;
        var d = HEX.distance(rec.col, rec.row, passenger.col, passenger.row);
        if (d < distance) { distance = d; best = rec; }
      });
      return best && (best.col !== carrier.col || best.row !== carrier.row) ?
        { kind: "move", dest: best, range: range, reason: "pickup" } : { kind: "finish" };
    }

    var cargo = carrier.cargo[0];
    var origin = { col: carrier.col, row: carrier.row };
    var goalUnit = Object.assign({}, cargo, origin);
    var goal = nearestGoal(game, goalUnit);
    if (!goal) return { kind: "finish" };
    var distances = walkingDistances(game, cargo, goal);
    var chosen = null, score = Infinity;
    Object.keys(range).forEach(function (key) {
      var rec = range[key], occupant = game.unitAt(rec.col, rec.row);
      if (!rec.canStop || rec.load || rec.enterBuilding || occupant && occupant !== carrier) return;
      var wasMoved = cargo.moved, transferUsed = carrier.transferUsed;
      try {
        carrier.col = rec.col; carrier.row = rec.row;
        // Newly boarded cargo waits until next turn, but its landing site
        // must still be planned now. No action flag escapes this simulation.
        cargo.moved = false;
        delete carrier.transferUsed;
        game.unloadTargets(carrier, cargo).forEach(function (drop) {
          if (game.buildingAt(drop.col, drop.row)) return;
          var remaining = distances[HEX.key(drop.col, drop.row)];
          if (remaining === undefined) return;
          if (!cargo.type.move) {
            var d = HEX.distance(drop.col, drop.row, goal.col, goal.row);
            remaining = Math.abs(d - Math.max(1, cargo.type.rngG || 1));
          }
          var value = remaining * 20 + rec.cost * 0.1;
          if (game.inEnemyZOC(drop.col, drop.row, cargo.player)) value += 5;
          // Leave a prison hex clear for the passenger's following turn.
          if (game.buildingAt(rec.col, rec.row)) value += 2;
          if (value < score) { score = value; chosen = { dest: rec, drop: drop, remaining: remaining }; }
        });
      } finally {
        carrier.col = origin.col; carrier.row = origin.row; cargo.moved = wasMoved;
        if (transferUsed === undefined) delete carrier.transferUsed;
        else carrier.transferUsed = transferUsed;
      }
    });
    if (!chosen) return { kind: "finish" };
    return { kind: "transport", dest: chosen.dest, range: range, cargo: cargo,
      drop: !carrier.transferUsed && !cargo.moved && chosen.remaining <= Math.max(1, cargo.type.move) ? chosen.drop : null };
  }

  function nearestOwnedRepair(game, unit) {
    // Only factories repair; prison bases are defensive terrain.
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

  /* Missile buggies use their remaining movement to increase separation from
   * the nearest enemy, breaking ties in favor of defensive terrain. */
  function bestPostAttackStep(game, unit, range) {
    var foes = game.playerUnits(1 - unit.player);
    var best = null, bestScore = -Infinity;
    for (var k in range) {
      var rec = range[k];
      if (!rec.canStop || rec.load) continue;
      if (rec.col === unit.col && rec.row === unit.row) continue;
      var occ = game.unitAt(rec.col, rec.row);
      if (occ && occ !== unit) continue;
      var nearest = Infinity;
      for (var i = 0; i < foes.length; i++) {
        nearest = Math.min(nearest,
          HEX.distance(rec.col, rec.row, foes[i].col, foes[i].row));
      }
      var terrainDefense = unit.type.moveType === "air" ?
        0 : game.terrainAt(rec.col, rec.row).def;
      var score = nearest * 10 + terrainDefense * 0.05;
      if (score > bestScore) {
        bestScore = score;
        best = rec;
      }
    }
    return best;
  }

  /* Best (destination, target) attack plan for a unit. Move-or-fire units
   * attack from where they stand; everything else (including the Lynx, whose
   * ground band is exactly 2) searches move destinations, with attackTargets
   * applying the per-domain range bands at each candidate hex. */
  function bestAttackPlan(game, unit, range) {
    var best = null;
    var i, t, targets, trade;
    if (unit.type.moveOrFire) {
      targets = game.attackTargets(unit);
      for (i = 0; i < targets.length; i++) {
        t = targets[i];
        trade = expectedTrade(game, unit, t);
        var score = scoreAttack(game, unit, t, trade);
        if (!best || score > best.score) best = { dest: null, target: t, score: score };
      }
    } else if (unit.type.rngG || unit.type.rngA) {
      for (var k in range) {
        var rec = range[k];
        if (!rec.canStop || rec.load || rec.enterBuilding) continue;
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
          if (!best || sc > best.score) best = { dest: rec, target: t, score: sc };
        }
        unit.col = oc; unit.row = orow;
      }
    }
    return best;
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

    if (unit.type.cargo) {
      var transportPlan = planTransport(game, unit, range);
      if (transportPlan) return transportPlan;
    }

    var base = !unit.type.capture && threatenedBase(game, unit.player);
    var plan = bestAttackPlan(game, unit, range);
    var captureGoal = unit.type.capture && nearestGoal(game, unit);
    if (captureGoal && plan && plan.dest &&
        HEX.distance(plan.dest.col, plan.dest.row, captureGoal.col, captureGoal.row) >
        HEX.distance(unit.col, unit.row, captureGoal.col, captureGoal.row)) {
      var captureStep = bestStepToward(game, unit, range, captureGoal, false);
      if (captureStep) return { kind: "move", dest: captureStep, range: range, reason: "advance" };
    }
    if (base && unit.type.move > 0 && (!plan ||
        HEX.distance(plan.target.col, plan.target.row, base.col, base.row) > 4)) {
      var defense = bestStepToward(game, unit, range, base, false);
      if (defense && HEX.distance(defense.col, defense.row, base.col, base.row) <
          HEX.distance(unit.col, unit.row, base.col, base.row)) {
        return { kind: "move", dest: defense, range: range, reason: "defend" };
      }
    }
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
    // Emit one deployment per animation step; revisit until no reserve has
    // a legal exit. Scan clockwise from upper-left for each reserve;
    // compatible carriers count as open destinations in that same scan.
    var neighbors = HEX.neighbors(building.col, building.row);
    // HEX.neighbors starts lower-right and runs counterclockwise.
    var exitOrder = [3, 2, 1, 0, 5, 4]; // upper-left, up, upper-right, lower-right, down, lower-left
    for (var s = building.stored.length - 1; s >= 0; s--) {
      var su = building.stored[s];
      if (su.moved) continue;
      var carriers = game.transportDeployTargets(building, su);
      var exits = game.deployTargets(building, su);
      if (su.typeId === "ATLAS") {
        // Anka d6 documents four enemy squads in the prospective firing
        // band, counting aircraft too. A separate infantry trigger is still
        // undocumented and is deliberately not guessed here.
        exits = exits.filter(function (exit) {
          return game.playerUnits(1 - building.owner).filter(function (enemy) {
            var d = HEX.distance(exit.col, exit.row, enemy.col, enemy.row);
            return d >= 2 && d <= su.type.rngG;
          }).length >= (su.type.aiDeploymentEnemies === undefined ?
            ATLAS_DEPLOYMENT_ENEMIES : su.type.aiDeploymentEnemies);
        });
      }
      for (var i = 0; i < neighbors.length; i++) {
        var exit = neighbors[exitOrder[i]];
        var carrier = game.unitAt(exit.col, exit.row);
        if (carriers.indexOf(carrier) >= 0) {
          game.loadFromFactory(building, su, carrier);
          return { t: "move", unit: su, from: { col: building.col, row: building.row },
            to: { col: exit.col, row: exit.row }, reason: "load", effects: [] };
        }
        if (!exits.some(function (n) { return n.col === exit.col && n.row === exit.row; })) continue;
        game.deployFromFactory(building, su, exit.col, exit.row);
        return {
          t: "deploy", unit: su, building: building,
          to: { col: exit.col, row: exit.row },
        };
      }
    }
    return null;
  }

  function activationOrder(game, player) {
    var units = game.playerUnits(player).slice();
    units.sort(function (a, b) {
      function rank(u) {
        if (u.type.cargo) return -1;
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
    var boardingDone = false;
    var finalFactoryScan = false;

    function queuePostAttackMove(unit) {
      pending.push(function () {
        var range = game.movementRange(unit);
        var dest = bestPostAttackStep(game, unit, range);
        if (!dest) {
          var finishEffects = game.finishUnit(unit);
          return finishEffects.length ?
            { t: "finish", unit: unit, effects: finishEffects } :
            { t: "wait", unit: unit };
        }
        var from = { col: unit.col, row: unit.row };
        game.moveUnit(unit, dest.col, dest.row, range);
        var effects = game.finishUnit(unit);
        return {
          t: "move", unit: unit, from: from,
          to: { col: dest.col, row: dest.row },
          reason: "post-attack", effects: effects,
        };
      });
    }

    function queueAction(unit, action) {
      if (action.kind === "transport") {
        if (action.dest.col !== unit.col || action.dest.row !== unit.row) {
          queueAction(unit, { kind: "move", dest: action.dest, range: action.range, reason: "transport" });
        } else {
          queueAction(unit, { kind: "finish" });
        }
        if (action.drop) pending.push(function () {
          var from = { col: unit.col, row: unit.row };
          game.unload(unit, action.cargo, action.drop.col, action.drop.row);
          return { t: "move", unit: action.cargo, from: from, to: action.drop, reason: "unload", effects: [] };
        });
        return;
      }
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
        if (game.units.indexOf(unit) >= 0 && !unit.moved) {
          if (unit.type.moveAfterAttack && unit.movePointsLeft > 0 &&
              game.winner === null) {
            queuePostAttackMove(unit);
          } else {
            game.finishUnit(unit);
          }
        }
        return {
          t: "battle", attacker: unit, defender: action.target,
          attackerBefore: attackerBefore, defenderBefore: defenderBefore,
          result: result,
        };
      });
    }

    function next() {
      while (true) {
        if (game.winner !== null) return null;
        if (pending.length) return pending.shift()();

        if (factoryIndex < factories.length) {
          var deployed = deployOneFactory(game, factories[factoryIndex]);
          if (deployed) return deployed;
          factoryIndex++;
          continue;
        }

        if (!boardingDone) {
          var boarded = boardOnePassenger(game, player);
          if (boarded) return boarded;
          boardingDone = true;
        }

        if (!units) units = activationOrder(game, player);
        if (unitIndex >= units.length) {
          // Captures and carrier rendezvous can create deployment options
          // during the turn. Spend those ready reserves in this same phase.
          if (!finalFactoryScan) {
            finalFactoryScan = true;
            factories = game.playerFactories(player);
            factoryIndex = 0;
            continue;
          }
          return null;
        }
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
