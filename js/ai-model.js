/* Capability-based planning model. Legal actions and all real/simulated state
 * transitions use ENGINE. No stock unit IDs, match RNG reads, or roster tables.
 * Actions complete one activation; subsequent actions may choose another unit.
 */
"use strict";
var AI_MODEL = (function () {
  var engine = typeof module !== "undefined" ? require("./engine.js") : ENGINE;
  var combat = typeof module !== "undefined" ? require("./combat.js") : COMBAT;
  var ringCache = new Map();
  function offsets(band, parity) {
    var key=band.min+":"+band.max+":"+parity;
    if(ringCache.has(key))return ringCache.get(key);
    var out=[];
    for(var r=-band.max-1;r<=band.max+1;r++)for(var c=-band.max;c<=band.max;c++){
      var d=HEX.distance(parity,0,parity+c,r);
      if(d>=band.min&&d<=band.max)out.push([c,r]);
    }
    ringCache.set(key,out);return out;
  }

  function allUnits(game) {
    var units = {}, list = [];
    function add(u) { if (!units[u.id]) { units[u.id] = u; list.push(u); u.cargo.forEach(add); } }
    game.units.forEach(add);
    Object.values(game.buildings).forEach(function (b) { b.stored.forEach(add); });
    return list;
  }
  function find(game, id) { return allUnits(game).find(function (u) { return u.id === id; }); }
  function clone(game, seed) {
    var copy = Object.create(engine.Game.prototype), units = {};
    ["map", "width", "height", "terrain", "currentPlayer", "firstPlayer", "balance", "turn", "turnLimit", "winner", "winReason"].forEach(function (k) { copy[k] = game[k]; });
    allUnits(game).forEach(function (u) { units[u.id] = Object.assign({}, u); });
    Object.values(units).forEach(function (u) { u.cargo = u.cargo.map(function (c) { return units[c.id]; }); });
    copy.units = game.units.map(function (u) { return units[u.id]; });
    copy.buildings = {};
    Object.keys(game.buildings).forEach(function (key) {
      var b = game.buildings[key];
      copy.buildings[key] = Object.assign({}, b, {stored: b.stored.map(function (u) { return units[u.id]; })});
    });
    copy.rng = combat.makeRng(seed === undefined ? 0 : seed);
    copy.log = [];
    return copy;
  }
  function signature(game) {
    return JSON.stringify([game.currentPlayer, game.turn, game.winner,
      allUnits(game).map(function (u) { return [u.id, u.player, u.typeId, u.col, u.row, u.strength, u.exp, !!u.moved, !!u.shifted,
        !!u.attacked, !!u.attackSpent, u.movePointsLeft, !!u.transferUsed, u.carriedBy || 0, !!u.inFactory, u.cargo.map(function (c) { return c.id; })]; }),
      Object.values(game.buildings).map(function (b) { return [b.col, b.row, b.owner,
        b.stored.map(function (u) { return [u.id, u.strength, u.exp, !!u.moved]; })]; })]);
  }
  // Public-state seed deliberately excludes identity allocation and live RNG.
  function seedFor(game) {
    var text = JSON.stringify([game.turn, game.currentPlayer, game.map.grid,
      allUnits(game).map(function (u) { return [u.col, u.row, u.player, u.strength, u.exp,
        !!u.moved, !!u.inFactory, !!u.carriedBy, u.type]; }),
      Object.values(game.buildings).map(function (b) { return b.owner; })]);
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function context(game) {
    return {routes: new Map(), analysis: new WeakMap(), evaluationGoals: new Map(), stats: {generated: 0, simulations: 0, nodes: 0}, seed: seedFor(game)};
  }
  function prepareEvaluation(game,ctx){
    ctx.evaluationGoals.clear();
    game.units.forEach(function(u){
      if(!u.inFactory)ctx.evaluationGoals.set(u.id,objectives(game,u,ctx));
    });
  }
  function value(unit) {
    var t = unit.type, attack = Math.max(t.atkG || 0, t.atkA || 0);
    var base = 18 + Math.min(100, attack) * 0.7 + Math.min(100, t.def || 0) * 0.65 +
      Math.min(t.atkG || 0, t.atkA || 0, 100) * 0.15 + (t.move || 0) * 2 +
      Math.max(t.rngG || 0, t.rngA || 0) * 7 + (t.capture ? 65 : 0) + (t.cargo || 0) * 25;
    return unit.strength <= 0 ? 0 : base * (0.2 + 0.8 * unit.strength / combat.MAX_STRENGTH) *
      (0.75 + 0.25 * combat.EXP_DAMAGE[unit.exp] / 100);
  }
  function fullValue(u) { return value(Object.assign({}, u, {strength: combat.MAX_STRENGTH})); }
  function fresh(u) { return Object.assign({}, u, {moved: false, shifted: false, attacked: false,
    attackSpent: false, movePointsLeft: u.type.move}); }
  function routeKey(unit) { return JSON.stringify([unit.type.moveType, unit.type.move, unit.type.cannotEnter || []]); }

  /* Reverse multi-source Dijkstra over chassis terrain, independent of transient
   * occupancy. Actual moves still use movementRange with live ZOC and blockers. */
  function distances(game, unit, goals, ctx) {
    var key = routeKey(unit) + ":" + goals.map(function (g) { return g.col + "," + g.row; }).join(";");
    if (ctx.routes.has(key)) return ctx.routes.get(key);
    var result = new Float64Array(game.width * game.height); result.fill(Infinity);
    var open = new engine.CostQueue();
    goals.forEach(function (g) {
      var terrain = game.terrainAt(g.col, g.row);
      if (!terrain || terrainCost(terrain, unit.type.moveType, unit.type) === null) return;
      result[g.row * game.width + g.col] = 0; open.push({col: g.col, row: g.row, cost: 0});
    });
    var cur;
    while ((cur = open.pop()) !== null) {
      if (cur.cost !== result[cur.row * game.width + cur.col]) continue;
      var terrain = game.terrainAt(cur.col, cur.row);
      var cost = terrainCost(terrain, unit.type.moveType, unit.type);
      if (terrain.costsAllMovement && unit.type.moveType !== "air") cost = Math.max(1, unit.type.move);
      HEX.neighbors(cur.col, cur.row).forEach(function (n) {
        var terr = game.terrainAt(n.col, n.row);
        if (!terr || terrainCost(terr, unit.type.moveType, unit.type) === null) return;
        var at = n.row * game.width + n.col, next = cur.cost + cost;
        if (next < result[at]) { result[at] = next; open.push({col: n.col, row: n.row, cost: next}); }
      });
    }
    // Prevent a long search over moving targets from retaining unbounded fields.
    if (ctx.routes.size > 384) ctx.routes.delete(ctx.routes.keys().next().value);
    ctx.routes.set(key, result);
    return result;
  }
  function atDistance(game, u, goals, ctx, col, row) { return distances(game, u, goals, ctx)[row * game.width + col]; }
  function objectives(game, unit, ctx) {
    var player = unit.player, targets = [];
    if (unit.type.capture) {
      Object.values(game.buildings).forEach(function (b) {
        if (b.owner === player) return;
        var worth = b.kind === "base" ? 160 : 65 + b.stored.reduce(function (s, u) { return s + value(u) * 0.4; }, 0);
        targets.push({goals: [b], worth: worth});
      });
    }
    if (unit.type.atkG || unit.type.atkA) {
      var enemies = game.playerUnits(1 - player).filter(function (e) { return !!combat.rangeBand(unit.type, combat.isAir(e)); });
      enemies.sort(function (a, b) { return HEX.distance(unit.col, unit.row, a.col, a.row) - HEX.distance(unit.col, unit.row, b.col, b.row); });
      enemies.slice(0, 3).forEach(function (enemy) {
        var band = combat.rangeBand(unit.type, combat.isAir(enemy)), goals = [];
        for (var r = Math.max(0, enemy.row - band.max - 1); r <= Math.min(game.height - 1, enemy.row + band.max + 1); r++) {
          for (var c = Math.max(0, enemy.col - band.max); c <= Math.min(game.width - 1, enemy.col + band.max); c++) {
            var d = HEX.distance(c, r, enemy.col, enemy.row);
            if (d >= band.min && d <= band.max && game.canStopAtBuilding(unit, c, r)) goals.push({col:c,row:r});
          }
        }
        targets.push({goals: goals, worth: (unit.type.capture ? 15 : 65) + value(enemy) * 0.08});
      });
    }
    // Defend objectives against any capturing capability, including custom
    // aircraft/capturers. Chassis route cost detects threats across ridges.
    Object.values(game.buildings).forEach(function (b) {
      if (b.kind!=="base" || b.owner!==player) return;
      var urgency=0;
      game.playerUnits(1-player).forEach(function (enemy) {
        if(!enemy.type.capture || !enemy.type.move)return;
        var distance=atDistance(game,enemy,[b],ctx,enemy.col,enemy.row);
        var turns=distance/enemy.type.move;
        if(turns<=2)urgency=Math.max(urgency,180/(0.5+turns));
      });
      if(urgency)targets.push({goals:[b],worth:urgency});
    });
    if (!targets.length) {
      var allies = game.playerUnits(player).filter(function (u) { return u !== unit && u.type.capture; });
      allies.slice(0, 2).forEach(function (u) { targets.push({goals: HEX.neighbors(u.col, u.row), worth: 30}); });
    }
    targets.forEach(function (t) { t.field = distances(game, unit, t.goals, ctx); });
    return targets;
  }
  function potential(game, unit, targets, col, row) {
    var best = 0, move = Math.max(1, unit.type.move);
    targets.forEach(function (t) {
      var d = t.field[row * game.width + col];
      if (Number.isFinite(d)) best = Math.max(best, t.worth / (1.5 + d / move));
    });
    return best;
  }

  function deliveryPlans(game,carrier,cargo,ctx) {
    return objectives(game,cargo,ctx).map(function(target){
      var key="delivery:"+routeKey(carrier)+":"+routeKey(cargo)+":"+target.goals.map(function(g){return HEX.key(g.col,g.row);}).join(";");
      var field=ctx.routes.get(key);
      if(!field){
        field=new Float64Array(game.width*game.height);field.fill(Infinity);
        var queue=new engine.CostQueue(), speed=Math.max(1,carrier.type.move);
        for(var row=0;row<game.height;row++)for(var col=0;col<game.width;col++){
          if(terrainCost(game.terrainAt(col,row),carrier.type.moveType,carrier.type)===null)continue;
          var best=Infinity;
          HEX.neighbors(col,row).forEach(function(n){
            if(!game.inBounds(n.col,n.row)||game.buildingAt(n.col,n.row))return;
            best=Math.min(best,1+target.field[n.row*game.width+n.col]/Math.max(1,cargo.type.move));
          });
          if(Number.isFinite(best)){field[row*game.width+col]=best;queue.push({col:col,row:row,cost:best});}
        }
        var current;
        while((current=queue.pop())!==null){
          if(current.cost!==field[current.row*game.width+current.col])continue;
          var terr=game.terrainAt(current.col,current.row), cost=terrainCost(terr,carrier.type.moveType,carrier.type);
          if(terr.costsAllMovement&&carrier.type.moveType!=="air")cost=speed;
          HEX.neighbors(current.col,current.row).forEach(function(n){
            if(!game.inBounds(n.col,n.row)||terrainCost(game.terrainAt(n.col,n.row),carrier.type.moveType,carrier.type)===null)return;
            var at=n.row*game.width+n.col,next=current.cost+cost/speed;
            if(next<field[at]){field[at]=next;queue.push({col:n.col,row:n.row,cost:next});}
          });
        }
        if(ctx.routes.size>384)ctx.routes.delete(ctx.routes.keys().next().value);
        ctx.routes.set(key,field);
      }
      return {field:field,foot:target.field,worth:target.worth};
    });
  }
  function deliveryValue(game,plans,col,row,landed,cargo) {
    var best=0;
    plans.forEach(function(plan){
      var at=row*game.width+col,turns=landed?1+plan.foot[at]/Math.max(1,cargo.type.move):plan.field[at];
      if(Number.isFinite(turns))best=Math.max(best,plan.worth/(1.5+turns));
    });return best;
  }

  function analysis(game, ctx) {
    if (ctx.analysis.has(game)) return ctx.analysis.get(game);
    var size = game.width * game.height, info = {threat: [], occupied: {}, emergencies: []};
    game.units.forEach(function (u) { if (!u.carriedBy && !u.inFactory) info.occupied[HEX.key(u.col,u.row)] = u; });
    [1-game.currentPlayer].forEach(function (player) {
      var ground = new Float64Array(size), air = new Float64Array(size);
      game.playerUnits(player).forEach(function (enemy) {
        if (!enemy.type.atkG && !enemy.type.atkA) return;
        var positions = enemy.type.moveOrFire ? [{col:enemy.col,row:enemy.row,canStop:true}] :
          Object.values(game.movementRange(fresh(enemy))).filter(function (rec) { return rec.canStop && !rec.load && !rec.enterBuilding; });
        [false,true].forEach(function (isAir) {
          var band = combat.rangeBand(enemy.type, isAir); if (!band) return;
          var seen = new Uint8Array(size), array = isAir ? air : ground;
          var power = Math.min(100, combat.atkStat(enemy.type,isAir)) * enemy.strength / 8 * combat.EXP_DAMAGE[enemy.exp] / 100;
          positions.forEach(function (pos) {
            offsets(band,pos.col&1).forEach(function(offset){
              var c=pos.col+offset[0],r=pos.row+offset[1],at=r*game.width+c;
              if(c>=0&&c<game.width&&r>=0&&r<game.height&&!seen[at]){seen[at]=1;array[at]+=power;}
            });
          });
        });
      });
      info.threat[player] = [ground,air];
    });
    Object.values(game.buildings).forEach(function(b){
      if(b.kind!=="base"||b.owner!==game.currentPlayer)return;
      if(game.playerUnits(1-b.owner).some(function(e){return e.type.capture&&HEX.distance(e.col,e.row,b.col,b.row)<=e.type.move;}))info.emergencies.push(b);
    });
    ctx.analysis.set(game, info); return info;
  }
  function danger(game, unit, col, row, info) {
    var defense = Math.min(100, (unit.type.def || 0) + (combat.isAir(unit) ? 0 : game.terrainAt(col,row).def));
    var power = info.threat[1-unit.player][combat.isAir(unit)?1:0][row*game.width+col];
    var losses = Math.min(unit.strength, power * (100-defense) / 100 * 0.085);
    return fullValue(unit) * losses / 8;
  }
  function baseDanger(game, player) {
    var danger = 0;
    Object.values(game.buildings).forEach(function (b) {
      if (b.kind !== "base" || b.owner !== player || game.unitAt(b.col,b.row)) return;
      game.playerUnits(1-player).forEach(function (u) {
        if (!u.type.capture || HEX.distance(u.col,u.row,b.col,b.row)>u.type.move) return;
        var rec = game.movementRange(fresh(u), HEX.key(b.col,b.row))[HEX.key(b.col,b.row)];
        if (rec && rec.canStop) danger = 1800;
      });
    });
    return danger;
  }
  function evaluate(game, player, ctx) {
    if (game.winner !== null) return game.winner === player ? 100000 : -100000;
    var scores = [0,0], capturers = [[],[]];
    allUnits(game).forEach(function (u) {
      if (u.player < 0) return;
      scores[u.player] += value(u) * (u.inFactory ? 0.86 : u.carriedBy ? 0.9 : 1);
      if (u.type.capture && !u.inFactory && !u.carriedBy) capturers[u.player].push(u);
      if (!u.inFactory && !u.carriedBy && !combat.isAir(u)) scores[u.player] += game.terrainAt(u.col,u.row).def * 0.14 * u.strength/8;
      if(!u.inFactory && !u.carriedBy){
        var goals=ctx.evaluationGoals.get(u.id);
        if(goals&&!u.type.capture)scores[u.player]+=potential(game,u,goals,u.col,u.row)*0.9;
        u.cargo.forEach(function(cargo){
          var cargoGoals=ctx.evaluationGoals.get(cargo.id);
          if(cargoGoals)scores[u.player]+=potential(game,cargo,cargoGoals,u.col,u.row)*0.7;
        });
      }
    });
    Object.values(game.buildings).forEach(function (b) {
      if (b.kind === "factory" && b.owner >= 0) scores[b.owner] += 45;
      [0,1].forEach(function (p) {
        if (b.owner === p) return;
        var best = 0;
        capturers[p].forEach(function (u) {
          var d = atDistance(game,u,[b],ctx,u.col,u.row);
          var worth = b.kind === "base" ? 120 : 45 + b.stored.reduce(function (n,v) { return n+value(v)*0.35; },0);
          if (Number.isFinite(d)) best = Math.max(best, worth/(2+d/Math.max(1,u.type.move)));
        });
        scores[p] += best;
      });
    });
    scores[0] -= baseDanger(game,0); scores[1] -= baseDanger(game,1);
    // Remaining time changes the burden of attack. Terminal expiry is still
    // handled only by the engine, including its Xenon-specific rule.
    var left = game.turnLimit-game.turn;
    if (left < 8) scores[1] += (8-left)*35;
    return scores[player]-scores[1-player];
  }
  function key(action) {
    return JSON.stringify([action.kind,action.unit,action.to,action.target,action.cargo,action.drop,action.before,action.into,action.building]);
  }
  function supportScore(game,u,col,row,info) {
    var result=0;
    HEX.neighbors(col,row).forEach(function (n) {
      var e=info.occupied[HEX.key(n.col,n.row)];
      if(!e||e.player===u.player)return;
      HEX.neighbors(e.col,e.row).forEach(function (neighbor) {
        var ally=info.occupied[HEX.key(neighbor.col,neighbor.row)];
        if (ally&&ally.player===u.player&&ally!==u&&!ally.moved) result+=Math.min(12,combat.atkStat(u.type,combat.isAir(e))*u.strength/80);
      });
    });
    return result;
  }
  function scorePosition(game,u,rec,targets,info) {
    var score = potential(game,u,targets,rec.col,rec.row)-potential(game,u,targets,u.col,u.row);
    score += (danger(game,u,u.col,u.row,info)-danger(game,u,rec.col,rec.row,info))*0.6;
    if (!combat.isAir(u)) score += (game.terrainAt(rec.col,rec.row).def-game.terrainAt(u.col,u.row).def)*0.1;
    score += supportScore(game,u,rec.col,rec.row,info)-supportScore(game,u,u.col,u.row,info);
    if (rec.cost>0) score-=0.35;
    var b=game.buildingAt(rec.col,rec.row);
    if (b && u.type.capture && b.owner!==u.player) {
      if (b.kind==="base" && game.enemyBaseCaptured(u.player,b)) return 1000000;
      score+=65+b.stored.reduce(function (v,s) { return v+value(s)*0.9; },0);
    } else if (b && b.kind==="factory" && b.owner===u.player) {
      score += (fullValue(u)-value(u))*0.95 - 18;
      u.cargo.forEach(function (cargo) { score += (fullValue(cargo)-value(cargo))*0.9; });
    }
    info.emergencies.forEach(function(base){
      if(rec.col===base.col&&rec.row===base.row && (u.col!==base.col||u.row!==base.row))score+=800;
      if(u.col===base.col&&u.row===base.row && (rec.col!==base.col||rec.row!==base.row))score-=800;
    });
    return score;
  }
  function tradeScore(game,u,target) {
    var trade=combat.distribution(game,u,target), out=fullValue(target)*trade.out/8, incoming=fullValue(u)*trade.in_/8;
    // Destroyed squads lose their future repair, cargo and ZOC as well as HP.
    var killValue=25+value(target)*0.2+target.cargo.reduce(function (v,c) {return v+value(c);},0);
    var deathValue=20+value(u)*0.2+u.cargo.reduce(function (v,c) {return v+value(c);},0);
    var emergency=target.type.capture&&Object.values(game.buildings).some(function(b){return b.kind==="base"&&b.owner===u.player&&
      HEX.distance(target.col,target.row,b.col,b.row)<=Math.max(1,target.type.move);});
    return out-incoming+trade.kill*(killValue+(emergency?500:0))-trade.death*deathValue;
  }

  function unitActions(game,u,ctx,info,limit) {
    var actions=[], targets=objectives(game,u,ctx), origin={col:u.col,row:u.row};
    var cargoPlans=u.cargo.map(function(cargo){return {unit:cargo,targets:deliveryPlans(game,u,cargo,ctx)};});
    var ready=!u.moved, range=game.canMoveNow(u)?game.movementRange(u):{};
    if (ready && !Object.keys(range).length) range[HEX.key(u.col,u.row)]={col:u.col,row:u.row,cost:0,canStop:true};
    var recs=Object.values(range).filter(function (r) {return r.canStop;});
    function add(a,score) { a.score=score; actions.push(a); }
    recs.forEach(function (rec) {
      var moved=rec.col!==origin.col || rec.row!==origin.row;
      var base={kind:"act",unit:u.id,to:moved?[rec.col,rec.row]:null};
      var score=scorePosition(game,u,rec,targets,info);
      cargoPlans.forEach(function(plan){
        score+=(deliveryValue(game,plan.targets,rec.col,rec.row)-deliveryValue(game,plan.targets,origin.col,origin.row))*1.4;
      });
      if (rec.load) {
        var carrier=game.unitAt(rec.col,rec.row);
        var speed=carrier.type.move-u.type.move;
        // Terrain barriers can justify transport even without a speed increase.
        var here=potential(game,u,targets,u.col,u.row);
        add(base,Math.max(0,speed)*1.2+(here<1?12:0)-5);
        return;
      }
      add(base,score);
      if (rec.enterBuilding) return;
      var old={col:u.col,row:u.row,attackSpent:u.attackSpent};
      try {
        u.col=rec.col;u.row=rec.row;
        if (u.type.moveOrFire && moved) u.attackSpent=true;
        game.legalAttackTargets(u).forEach(function (enemy) {
          add(Object.assign({},base,{target:enemy.id}),score+tradeScore(game,u,enemy));
        });
        // A combat-capable carrier considers unloading and shooting together.
        // Transfer legality is exactly the same query used by the human UI.
        cargoPlans.forEach(function (plan) {
          var cargo=plan.unit,cargoTargets=plan.targets;
          game.unloadTargets(u,cargo).forEach(function (drop) {
            var gain=deliveryValue(game,cargoTargets,drop.col,drop.row,true,cargo);
            var carry=deliveryValue(game,cargoTargets,rec.col,rec.row);
            var unloadScore=2+(gain-carry)*1.4-danger(game,cargo,drop.col,drop.row,info)*0.5;
            var action=Object.assign({},base,{cargo:cargo.id,drop:[drop.col,drop.row]});
            add(action,score+unloadScore);
            game.legalAttackTargets(u).forEach(function (enemy) {
              add(Object.assign({},action,{target:enemy.id}),score+unloadScore+tradeScore(game,u,enemy));
            });
          });
        });
      } finally {u.col=old.col;u.row=old.row;u.attackSpent=old.attackSpent;}
    });
    // Unload-first remains available after the carrier has acted. For ready
    // carriers also consider moving/firing after unloading via a small set of
    // simulated transfer prefixes. No mutually exclusive carrier/weapon role.
    if (u.cargo.length && !u.transferUsed) {
      var prefixes=[];
      cargoPlans.forEach(function (plan) {
        var cargo=plan.unit,goals=plan.targets;
        game.unloadTargets(u,cargo).forEach(function (drop) {
          var s=2+(deliveryValue(game,goals,drop.col,drop.row,true,cargo)-deliveryValue(game,goals,u.col,u.row))*1.4-danger(game,cargo,drop.col,drop.row,info)*0.5;
          prefixes.push({kind:"act",unit:u.id,cargo:cargo.id,drop:[drop.col,drop.row],before:true,score:s});
        });
      });
      prefixes.sort(function(a,b){return b.score-a.score;});
      prefixes.slice(0,2).forEach(function(prefix){
        add(prefix,prefix.score);
        if(!ready)return;
        var sim=clone(game,0), carrier=find(sim,u.id);sim.unload(carrier,find(sim,prefix.cargo),prefix.drop[0],prefix.drop[1]);
        // transferUsed prevents recursive prefix expansion.
        unitActions(sim,carrier,ctx,info,3).slice(0,3).forEach(function(next){
          add(Object.assign({},next,{cargo:prefix.cargo,drop:prefix.drop,before:true}),prefix.score+next.score);
        });
      });
    }
    var unique=new Map();
    actions.forEach(function(a){var k=key(a);if(!unique.has(k)||unique.get(k).score<a.score)unique.set(k,a);});
    actions=Array.from(unique.values()).sort(function(a,b){return b.score-a.score;});
    return actions.slice(0,limit||6);
  }

  function candidates(game,ctx,options) {
    options=options||{}; if(game.winner!==null)return [];
    ctx.stats.generated++;
    var actions=[], info=analysis(game,ctx), units=game.playerUnits(game.currentPlayer).filter(function(u){
      return !u.moved || u.cargo.some(function(c){return game.unloadTargets(u,c).length;});
    });
    // Rollouts can reduce the number of units considered, while root search
    // always considers every field unit and reserve, including quiet captures.
    if(options.unitLimit && units.length>options.unitLimit){
      units.sort(function(a,b){
        function rank(u){
          var nearest=Infinity;
          game.playerUnits(1-u.player).forEach(function(e){nearest=Math.min(nearest,HEX.distance(u.col,u.row,e.col,e.row));});
          return (u.type.capture?15:0)+value(u)*0.06-nearest+(u.cargo.length?10:0);
        }
        return rank(b)-rank(a);
      });
      units=units.slice(0,options.unitLimit);
    }
    units.forEach(function(u){actions=actions.concat(unitActions(game,u,ctx,info,options.perUnit||4));});
    game.playerFactories(game.currentPlayer).forEach(function(b){
      b.stored.forEach(function(u){
        if(!game.canDeployNow(b,u))return;
        var goals=objectives(game,u,ctx);
        game.deployTargets(b,u).forEach(function(n){
          var score=6+value(u)*0.1+potential(game,u,goals,n.col,n.row)*0.2-danger(game,u,n.col,n.row,info)*0.45;
          // Immobile fire support needs a useful firing position, but a
          // deployment restriction specific to one stock ID is not imposed.
          if(!u.type.move && (u.type.atkG||u.type.atkA)){
            var firing=game.playerUnits(1-u.player).some(function(e){return combat.canAttackAt(u.type,combat.isAir(e),HEX.distance(n.col,n.row,e.col,e.row));});
            score+=firing?30:-10;
          }
          actions.push({kind:"deploy",building:[b.col,b.row],unit:u.id,to:[n.col,n.row],score:score});
        });
        game.transportDeployTargets(b,u).forEach(function(carrier){
          actions.push({kind:"deploy",building:[b.col,b.row],unit:u.id,into:carrier.id,
            score:5+value(u)*0.1+Math.max(0,carrier.type.move-u.type.move)*1.2});
        });
      });
    });
    actions.sort(function(a,b){return b.score-a.score;});
    if(!actions.length)return [{kind:"end",score:0}];
    var result=actions.slice(0,options.limit||16);
    // Ending the side's turn is a legal strategic alternative in search.
    result.push({kind:"end",score:-20});
    return result;
  }

  function retreat(game,u,ctx) {
    if(!game.canMoveNow(u)||!u.attacked)return null;
    var info=analysis(game,ctx), goals=objectives(game,u,ctx), best=null, score=0;
    Object.values(game.movementRange(u)).forEach(function(rec){
      if(!rec.canStop||rec.load||!rec.cost)return;
      var s=scorePosition(game,u,rec,goals,info);
      if(s>score){score=s;best=rec;}
    });
    return best;
  }

  /* The generator applies one visible mutation per next(). Simulations consume
   * exactly this same generator; no second implementation of the rules. */
  function* execute(game,action,ctx) {
    if(action.kind==="end"){game.endTurn();return;}
    var u=find(game,action.unit);
    if(!u)throw new Error("AI action references a missing unit");
    if(action.kind==="deploy"){
      var b=game.buildingAt(action.building[0],action.building[1]);
      if(action.into){
        var into=find(game,action.into);game.loadFromFactory(b,u,into);
        yield {t:"move",unit:u,from:{col:b.col,row:b.row},to:{col:into.col,row:into.row},reason:"load",effects:[]};
      }else{
        game.deployFromFactory(b,u,action.to[0],action.to[1]);
        yield {t:"deploy",unit:u,building:b,to:{col:u.col,row:u.row}};
      }
      return;
    }
    function unload(){
      var cargo=find(game,action.cargo),from={col:u.col,row:u.row};
      game.unload(u,cargo,action.drop[0],action.drop[1]);
      return {t:"move",unit:cargo,from:from,to:{col:cargo.col,row:cargo.row},reason:"unload",effects:[]};
    }
    if(action.cargo&&action.before)yield unload();
    if(action.to){
      var from={col:u.col,row:u.row}, moved=game.moveUnit(u,action.to[0],action.to[1]);
      // Commit capture/storage immediately, just as the human movement flow.
      var effects=!moved.loaded&&game.entersBuilding(u,u.col,u.row)?game.finishUnit(u):[];
      yield {t:"move",unit:u,from:from,to:{col:u.col,row:u.row},reason:moved.loaded?"load":action.target?"attack":"advance",effects:effects,path:moved.path};
      if(moved.loaded||u.inFactory||game.winner!==null)return;
    }
    if(action.cargo&&!action.before)yield unload();
    if(action.target && game.winner===null){
      var enemy=find(game,action.target),a=u.strength,d=enemy.strength;
      yield {t:"battle-preview",attacker:u,defender:enemy,attackerBefore:a,defenderBefore:d,preview:combat.preview(game,u,enemy)};
      var result=game.attack(u,enemy);
      yield {t:"battle",attacker:u,defender:enemy,attackerBefore:a,defenderBefore:d,result:result};
      if(game.winner!==null||game.units.indexOf(u)<0)return;
      // Chance changed the board; rebuild tactical analysis for the retreat.
      ctx.analysis.delete(game);
      var step=retreat(game,u,ctx);
      if(step){
        var before={col:u.col,row:u.row},retreated=game.moveUnit(u,step.col,step.row);
        yield {t:"move",unit:u,from:before,to:{col:u.col,row:u.row},reason:"post-attack",effects:game.finishUnit(u),path:retreated.path};
      }
    }
    if(!u.moved && !u.carriedBy && !u.inFactory){
      var finished=game.finishUnit(u);
      yield finished.length?{t:"finish",unit:u,effects:finished}:{t:"wait",unit:u};
    }
  }
  function apply(game,action,ctx) {
    var it=execute(game,action,ctx);while(!it.next().done){}ctx.analysis.delete(game);return game;
  }
  function simulate(game,action,ctx,seed,representative) {
    var state=clone(game,seed);
    // Beam ranking uses the central combat outcome; otherwise maximizing over
    // sampled branches would select lucky dice rather than better sequences.
    // Monte Carlo search uses independent rolls and correct weighted chance.
    if(representative)state.rng=function(){return 0.5;};
    ctx.stats.simulations++;return apply(state,action,ctx);
  }
  return {clone:clone,find:find,context:context,prepareEvaluation:prepareEvaluation,value:value,key:key,seedFor:seedFor,signature:signature,
    candidates:candidates,evaluate:evaluate,simulate:simulate,apply:apply,execute:execute,baseDanger:baseDanger};
})();
if(typeof module!=="undefined")module.exports=AI_MODEL;
