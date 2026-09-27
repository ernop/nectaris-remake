/* Search correctness: public information, real rules, arbitrary capabilities,
 * complete activation sequences, reproducibility and worker parity. */
"use strict";
module.exports = function (ok) {
  var ENGINE=require("../js/engine.js"), COMBAT=require("../js/combat.js"), AI=require("../js/ai.js");
  var M=require("../js/ai-model.js"), S=require("../js/ai-search.js");
  var fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
  var roster=Object.assign({},UNIT_TYPES);
  function game(units,grid,buildings){return new ENGINE.Game({name:"AI search test",grid:grid||["........","........","B......B","........","........"],
    buildings:buildings||[{col:0,row:2,owner:0},{col:7,row:2,owner:1}],units:units},{seed:42});}
  function copyAction(a){var b=Object.assign({},a);delete b.score;return JSON.stringify(b);}
  var capture=game([{t:"CHARLIE",o:0,x:6,y:2},{t:"CHARLIE",o:1,x:7,y:3},{t:"BISON",o:1,x:1,y:0}]);
  S.modes.filter(function(m){return m.id!=="classic";}).forEach(function(mode){
    var g=M.clone(capture,42), rngBefore=g.rng.getState();
    var action=S.choose(g,mode.id);
    ok(action.to&&action.to[0]===7&&action.to[1]===2&&!action.target,mode.id+" selects a guaranteed base victory over a distracting attack");
    AI.playTurn(g,0,{id:mode.id});
    ok(g.winner===0&&g.winReason==="base"&&g.rng.getState()===rngBefore,mode.id+" executes the capture without consuming combat randomness");
  });

  var original=game([{t:"BISON",o:0,x:2,y:2},{t:"CHARLIE",o:0,x:1,y:2},{t:"POLAR",o:1,x:4,y:2},{t:"CHARLIE",o:1,x:6,y:1}]);
  var snapshot=JSON.stringify(original.snapshot());
  S.modes.filter(function(m){return m.id!=="classic";}).forEach(function(mode){
    var savedRng=original.rng;
    original.rng=function(){throw new Error("Planner tried to consume real randomness");};
    original.rng.getState=function(){throw new Error("Planner tried to inspect real randomness");};
    var action,err=null;
    try{action=S.choose(original,mode.id,{iterations:8,width:2,depth:2,branches:4,horizon:4});
      ok(S.publicSnapshot(original).rngState===0,mode.id+" worker input masks RNG without reading it");
    }catch(e){err=e;}finally{original.rng=savedRng;}
    ok(!err,mode.id+" plans using only public information"+(err?": "+err.message:""));
    ok(JSON.stringify(original.snapshot())===snapshot,mode.id+" leaves live state and identities untouched");
    var restored=ENGINE.Game.restore(original.snapshot());
    ok(copyAction(action)===copyAction(S.choose(restored,mode.id,{iterations:8,width:2,depth:2,branches:4,horizon:4})),mode.id+" decision survives save/restore deterministically");
  });

  try{
    mergeUnitTypes({
      HYBRID55:{name:"Hybrid 55",move:7,moveType:"air",atkG:55,atkA:37,def:29,rngG:1,rngA:2,cargo:2,capture:true},
      FLEX55:{name:"Flexible 55",move:4,moveType:"treads",atkG:55,atkA:23,def:41,rngG:3,rngA:1,moveAfterAttack:true},
      FOOT55:{name:"Foot 55",move:4,moveType:"foot",atkG:55,atkA:0,def:13,rngG:1,rngA:0,capture:true},
      TOWER55:{name:"Tower 55",move:0,moveType:"treads",atkG:55,atkA:55,def:55,rngG:4,rngA:4,moveOrFire:true}
    });
    var hybrid=game([{t:"HYBRID55",o:0,x:2,y:2},{t:"FOOT55",o:0,x:1,y:2},{t:"BISON",o:1,x:4,y:2},{t:"CHARLIE",o:1,x:6,y:1}]);
    var carrier=hybrid.units[0],cargo=hybrid.units[1];
    hybrid.moveUnit(cargo,carrier.col,carrier.row);hybrid.endTurn();hybrid.endTurn();
    var ctx=M.context(hybrid),before=JSON.stringify(hybrid.snapshot()),choices=M.candidates(M.clone(hybrid,0),ctx,{limit:10000,perUnit:10000});
    ok(choices.some(function(a){return a.unit===carrier.id&&a.target;}),"an armed custom carrier considers attacks");
    ok(choices.some(function(a){return a.unit===carrier.id&&a.cargo;}),"the same custom carrier considers legal unloading");
    ok(choices.some(function(a){return a.target&&a.cargo;}),"armed transport can unload and fire in one activation");
    ok(choices.some(function(a){return a.before&&a.to;}),"transport search includes unload-before-move sequences");
    var errors=[];
    choices.forEach(function(a){try{M.simulate(hybrid,a,M.context(hybrid),123);}catch(e){errors.push(M.key(a)+": "+e.message);}});
    ok(!errors.length,"all hybrid action combinations execute legally"+(errors.length?": "+errors.slice(0,3).join("; "):""));
    ok(JSON.stringify(hybrid.snapshot())===before,"hybrid candidate simulations cannot mutate cargo or the live board");
    var copied=M.clone(hybrid,1);
    ok(copied.units[0]!==carrier && copied.units[0].cargo[0]===copied.units[1],"search copies preserve cargo sharing without sharing mutable units");
    copied.units[1].strength=1;
    ok(cargo.strength===8,"search cargo casualties cannot leak into the live match");

    var shooting=game([{t:"FLEX55",o:0,x:2,y:2},{t:"BISON",o:1,x:4,y:2},{t:"CHARLIE",o:1,x:6,y:1}]);
    var dist=COMBAT.distribution(shooting,shooting.units[0],shooting.units[1]);
    ok(Math.abs(dist.outcomes.reduce(function(s,o){return s+o.probability;},0)-1)<1e-12,"arbitrary 55 attack produces a normalized exact chance distribution");
    ok(Math.abs(dist.out-COMBAT.expectedCasualties(shooting.units[0],shooting.units[1],dist.preview.attacker.ap,dist.preview.defender.da))<1e-12,
      "search probabilities share the engine's arbitrary-stat damage calculation");
    ok(dist.in_===0&&dist.outcomes.every(function(o){return o.attackerLoss===0;}),"custom indirect attacks have no invented counterattack");

    var factory=game([{t:"FOOT55",o:0,x:1,y:1},{t:"BISON",o:1,x:6,y:3}],
      ["........","..F.....","B......B","........","........"],
      [{col:0,row:2,owner:0},{col:7,row:2,owner:1},{col:2,row:1,owner:-1,stored:["TOWER55","HYBRID55","FLEX55"]}]);
    var fc=S.choose(factory,"tactical");
    ok(fc.to&&fc.to[0]===2&&fc.to[1]===1,"custom capturer values a factory's actual reserve inventory");
    M.apply(factory,fc,M.context(factory));
    var deployments=M.candidates(factory,M.context(factory),{limit:1000});
    ok(deployments.some(function(a){return a.kind==="deploy"&&M.find(factory,a.unit).typeId==="TOWER55";}),"custom immobile artillery deploys without stock unit handlers");
    deployments.filter(function(a){return a.kind==="deploy";}).forEach(function(a){
      var sim=M.simulate(factory,a,M.context(factory),1);var unit=M.find(sim,a.unit);
      ok(unit.moved&&!sim.canAttackNow(unit),"new reserve deployment consumes its activation");
    });

    // Multiple types with unusual combinations exercise actual engine gates,
    // including move-or-fire, post-attack moves, cargo and factories.
    [hybrid,shooting,factory].forEach(function(g,gi){
      S.modes.filter(function(m){return m.id!=="classic";}).forEach(function(mode){
        var sim=M.clone(g,77),error=null;
        try{AI.playTurn(sim,sim.currentPlayer,{id:mode.id,search:{iterations:8,width:2,depth:2,branches:4,horizon:4}});}catch(e){error=e;}
        ok(!error,mode.id+" completes custom capability fixture "+gi+(error?": "+error.stack:""));
      });
    });

    var messages=[], sandbox={console:console,postMessage:function(m){messages.push(m);}};
    sandbox.self=sandbox;
    var context=vm.createContext(sandbox);
    sandbox.importScripts=function(){Array.from(arguments).forEach(function(file){
      vm.runInContext(fs.readFileSync(path.join(__dirname,"../js",file.split("?")[0]),"utf8"),context,{filename:file});
    });};
    vm.runInContext(fs.readFileSync(path.join(__dirname,"../js/ai-worker.js"),"utf8"),context);
    sandbox.onmessage({data:{sequence:7,state:S.publicSnapshot(hybrid),id:"tactical"}});
    ok(messages.length===1&&!messages[0].error&&messages[0].sequence===7,"browser worker loads the plain-script engine and custom roster");
    ok(copyAction(messages[0].action)===copyAction(S.choose(hybrid,"tactical")),"worker and headless planners choose the same custom-unit action");
  }finally{
    Object.keys(UNIT_TYPES).forEach(function(k){delete UNIT_TYPES[k];});Object.assign(UNIT_TYPES,roster);
  }
};
