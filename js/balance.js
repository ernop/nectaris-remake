/* Pregame compensation offers. No combat RNG, unit-price equivalences or map
 * mutations during negotiation. Earlier packages remain available. */
"use strict";
var BALANCE = (function () {
  var engine = typeof module !== "undefined" ? require("./engine.js") : ENGINE;
  var hex = typeof module !== "undefined" ? require("./hex.js") : HEX;
  var terrain = typeof module !== "undefined" ? require("./data-terrain.js") : {terrainCost:terrainCost};
  var types = typeof module !== "undefined" ? require("./data-units.js").UNIT_TYPES : UNIT_TYPES;
  var MAX_DISTANCE = 5;
  // Sequence order expands the menu; it never asserts that one composition
  // dominates another. All units are full strength, zero experience, ready.
  var PACKAGES = [[], ["CHARLIE"], ["LENET"], ["CHARLIE","CHARLIE"], ["BISON"],
    ["CHARLIE","LENET"], ["POLAR"], ["LENET","LENET"], ["KILROY","LENET"],
    ["CHARLIE","BISON"], ["BISON","BISON"], ["POLAR","CHARLIE"], ["POLAR","LENET"],
    ["GRIZZLY","CHARLIE"], ["POLAR","POLAR"], ["POLAR","BISON","CHARLIE"],
    ["LENET","LENET","CHARLIE","CHARLIE"], ["POLAR","POLAR","CHARLIE"],
    ["BISON","BISON","CHARLIE","CHARLIE"], ["POLAR","POLAR","LENET"],
    ["POLAR","POLAR","CHARLIE","CHARLIE"], ["POLAR","POLAR","POLAR"],
    ["POLAR","POLAR","LENET","LENET"], ["POLAR","POLAR","BISON","BISON"],
    ["POLAR","POLAR","POLAR","CHARLIE"], ["POLAR","POLAR","LENET","LENET","CHARLIE"],
    ["POLAR","POLAR","POLAR","LENET","CHARLIE"], ["POLAR","POLAR","POLAR","POLAR"],
    ["POLAR","POLAR","POLAR","CHARLIE","CHARLIE"], ["POLAR","POLAR","POLAR","LENET","LENET"],
    ["POLAR","POLAR","POLAR","POLAR","CHARLIE"], ["POLAR","POLAR","POLAR","POLAR","CHARLIE","CHARLIE"]];
  function name(id) { return types[id].name.replace(/\s+[A-Z]+[A-Z0-9]*-?\d+$/, ""); }
  function label(units) {
    if (!units.length) return "No bonus";
    var counts = {};
    units.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
    return Object.keys(counts).map(function (id) { return counts[id] + " × " + name(id); }).join(" + ");
  }
  function distance(a,b) { return hex.distance(a.col,a.row,b.col,b.row); }
  function bases(game) {
    return [0,1].map(function (p) {
      return Object.values(game.buildings).filter(function (b) { return b.kind === "base" && b.owner === p; })
        .sort(function (a,b) { return a.row-b.row || a.col-b.col; })[0];
    });
  }
  function passable(game, at) {
    var t = game.terrainAt(at.col,at.row);
    return !!t && ["CHARLIE","LENET","BISON","POLAR","KILROY","GRIZZLY"].every(function (id) {
      return types[id] && terrain.terrainCost(t,types[id].moveType,types[id]) !== null;
    });
  }
  function candidates(game, home, enemy) {
    // Connected ground sites only. Do not place beyond an impassable ridge,
    // through an unowned factory, on a building or in an occupied hex.
    var seen = {}, queue = [home], out = [];
    seen[hex.key(home.col,home.row)] = true;
    for (var i=0;i<queue.length;i++) {
      var at=queue[i], b=game.buildingAt(at.col,at.row), u=game.unitAt(at.col,at.row);
      if (!b && !u && distance(at,home)<distance(at,enemy) &&
          !game.units.some(function (e) { return e.player!==home.owner && distance(at,e)<=1; })) out.push(at);
      hex.neighbors(at.col,at.row).forEach(function (n) {
        var key=hex.key(n.col,n.row), building=game.buildingAt(n.col,n.row), unit=game.unitAt(n.col,n.row);
        if (seen[key] || distance(n,home)>MAX_DISTANCE || !passable(game,n) ||
            (building && building.owner!==home.owner) || (unit && unit.player!==home.owner)) return;
        seen[key]=true;queue.push(n);
      });
    }
    return out.sort(function (a,b) {
      return distance(a,home)-distance(b,home) || distance(b,enemy)-distance(a,enemy) || a.row-b.row || a.col-b.col;
    });
  }
  function symmetry(game, homes) {
    var transforms=[];
    if (game.width%2===0) transforms.push(function(p){return {col:game.width-1-p.col,row:game.height-1-p.row};});
    if (game.width%2===1) transforms.push(function(p){return {col:game.width-1-p.col,row:p.row};});
    function inventory(b) { return b.stored.map(function(u){return [u.typeId,u.strength,u.exp];}).sort().toString(); }
    return transforms.find(function (transform) {
      if (distance(transform(homes[0]),homes[1])) return false;
      for (var r=0;r<game.height;r++) for(var c=0;c<game.width;c++) {
        var at=transform({col:c,row:r}), a=game.buildingAt(c,r), b=game.buildingAt(at.col,at.row);
        if (game.terrainAt(c,r)!==game.terrainAt(at.col,at.row)) return false;
        if (!!a!==!!b || (a && ((a.owner<0 ? -1 : 1-a.owner)!==b.owner || inventory(a)!==inventory(b)))) return false;
        var u=game.unitAt(c,r), v=game.unitAt(at.col,at.row);
        if (!!u!==!!v || (u && (v.player!==1-u.player || v.typeId!==u.typeId || v.strength!==u.strength || v.exp!==u.exp))) return false;
      }
      return true;
    });
  }
  function plan(game) {
    var homes=bases(game);
    if (!homes[0] || !homes[1]) return {error:"Compensation offers need an owned base for each army."};
    var sites=homes.map(function(home,p){return candidates(game,home,homes[1-p]);});
    var declared=game.map.balanceSpawns, mirror=symmetry(game,homes);
    if (declared !== undefined) {
      if (!Array.isArray(declared) || declared.length!==2 || declared.some(function(list,p){
        var seen={};
        return !Array.isArray(list) || list.some(function(at){
          if(!at || !Number.isInteger(at.col) || !Number.isInteger(at.row))return true;
          var key=hex.key(at.col,at.row), valid=!seen[key] && sites[p].some(function(n){return n.col===at.col && n.row===at.row;});
          seen[key]=true;return !valid;
        });
      })) return {error:"The map’s reinforcement hexes must be distinct, empty, reachable ground hexes within five hexes of each army’s base."};
      sites=declared.map(function(list){return list.map(function(at){return {col:at.col,row:at.row};});});
    } else if (mirror) {
      sites[0]=sites[0].filter(function(at){var n=mirror(at);return sites[1].some(function(b){return b.col===n.col && b.row===n.row;});});
      sites[1]=sites[0].map(mirror);
    }
    var count=Math.min(6,sites[0].length,sites[1].length);
    sites=sites.map(function(list){return list.slice(0,count);});
    if (!count) return {error:"There are no suitable empty reinforcement hexes near both bases. Choose Original opening or edit this map’s starting positions."};
    var offers=PACKAGES.filter(function(ids){return ids.length<=count;}).map(function(ids,index){return {id:index,units:ids.slice(),label:label(ids)};});
    return {version:1,sites:sites,homes:homes.map(function(b){return {col:b.col,row:b.row};}),offers:offers,
      symmetric:!!mirror,game:game};
  }
  function validChoice(p, step, choice) { return Number.isInteger(choice) && choice>=0 && choice<=step && !!p.offers[choice]; }
  function resolve(p, step, responses, random) {
    if (!Number.isInteger(step) || !p.offers[step] || !Array.isArray(responses) || responses.length!==2 ||
        responses.some(function(c){return c!==null && !validChoice(p,step,c);})) throw new Error("Invalid compensation responses.");
    if (responses[0]===null && responses[1]===null) return {status:step+1<p.offers.length ? "next" : "no-deal",step:Math.min(step+1,p.offers.length-1)};
    var tied=responses[0]!==null && responses[1]!==null;
    var second=tied ? ((random || Math.random)()<0.5 ? 0 : 1) : responses[0]!==null ? 0 : 1;
    return {status:"agreed",secondPlayer:second,firstPlayer:1-second,offer:responses[second],step:step,tied:tied};
  }
  function placements(p, player, choice) {
    if ((player!==0 && player!==1) || !p.offers[choice]) throw new Error("Invalid compensation package.");
    return p.offers[choice].units.map(function(id,i){return {typeId:id,col:p.sites[player][i].col,row:p.sites[player][i].row};});
  }
  function apply(game,p,result) {
    if (!result || result.status!=="agreed" || result.firstPlayer!==1-result.secondPlayer ||
        !validChoice(p,result.step,result.offer) || game.turn!==1 || game.log.length || game.balance) throw new Error("Compensation can only be applied once, before play.");
    var units=placements(p,result.secondPlayer,result.offer);
    // Validate the whole package before changing any state.
    units.forEach(function(at){
      if (!passable(game,at) || game.unitAt(at.col,at.row) || game.buildingAt(at.col,at.row)) throw new Error("A reinforcement hex is no longer available.");
    });
    game.firstPlayer=result.firstPlayer;game.currentPlayer=result.firstPlayer;
    game.balance={version:1,firstPlayer:result.firstPlayer,secondPlayer:result.secondPlayer,offer:result.offer,
      step:result.step,tied:result.tied,label:p.offers[result.offer].label,placements:units};
    units.forEach(function(at){game.units.push(engine.makeUnit(at.typeId,result.secondPlayer,at.col,at.row,8,0));});
    return game.balance;
  }
  // Opening-role heuristic, not a proven price list or win-probability model.
  // It evaluates the best retained package for BOTH possible recipients before
  // seeing the human's response. It never reads the match random stream.
  function value(type) {return (type.atkG+type.atkA+type.def)/3+type.move+(type.capture?30:0);}
  function cpuChoice(p,step,player) {
    var g=p.game, best=[{choice:0,value:0},{choice:0,value:0}], material=[0,0];
    g.units.forEach(function(u){material[u.player]+=value(u.type)*u.strength/8;});
    Object.values(g.buildings).forEach(function(b){if(b.owner>=0)b.stored.forEach(function(u){material[b.owner]+=value(u.type)*u.strength/8;});});
    for(var side=0;side<2;side++) for(var i=1;i<=step;i++) {
      var v=placements(p,side,i).reduce(function(sum,at){
        var type=types[at.typeId], worth=value(type), target=p.homes[1-side];
        var travel=distance(at,target)/Math.max(1,type.move);
        if(type.capture){
          Object.values(g.buildings).forEach(function(b){
            if(b.kind!=="factory" || b.owner===side)return;
            var turns=distance(at,b)/Math.max(1,type.move);
            worth=Math.max(worth,value(type)+Math.min(90,b.stored.length*10)/(1+turns));
          });
        }
        return sum+worth/(1+travel*0.025);
      },0);
      if(v>best[side].value)best[side]={choice:i,value:v};
    }
    var contested=Object.values(g.buildings).filter(function(b){return b.owner<0 && Math.abs(distance(b,p.homes[0])-distance(b,p.homes[1]))<=2;})
      .reduce(function(sum,b){return sum+b.stored.length;},0);
    var initiative=12+0.16*Math.min(material[0],material[1])+Math.min(80,contested*3);
    return best[player].value+best[1-player].value>=2*initiative ? best[player].choice : null;
  }
  return {plan:plan,label:label,placements:placements,resolve:resolve,apply:apply,cpuChoice:cpuChoice,
    packages:PACKAGES,MAX_DISTANCE:MAX_DISTANCE};
})();
if(typeof module!=="undefined")module.exports=BALANCE;
