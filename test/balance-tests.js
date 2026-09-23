"use strict";
module.exports=function(ok){
  var B=require("../js/balance.js"),E=require("../js/engine.js"),H=require("../js/hex.js"),P=require("../js/profiles.js");
  var maps=require("../js/data-ai-maps.js"),T=require("../js/data-terrain.js"),types=require("../js/data-units.js").UNIT_TYPES;
  function copy(v){return JSON.parse(JSON.stringify(v));}
  function fails(fn){try{fn();return false;}catch(e){return true;}}
  maps.forEach(function(map){
    var g=new E.Game(map,{seed:147}),before=JSON.stringify(g.snapshot()),source=JSON.stringify(map),p=B.plan(g),q=B.plan(g);
    ok(!p.error && p.offers.length===32,map.name+": complete expanded offer list is placeable");
    ok(JSON.stringify(p.sites)===JSON.stringify(q.sites),map.name+": reinforcement positions are fixed before choices");
    p.sites.forEach(function(sites,side){
      var keys=new Set();
      sites.forEach(function(at){
        keys.add(H.key(at.col,at.row));
        ok(!g.unitAt(at.col,at.row) && !g.buildingAt(at.col,at.row) &&
          H.distance(at.col,at.row,p.homes[side].col,p.homes[side].row)<=B.MAX_DISTANCE,
          map.name+": reinforcements are on empty nonbuilding hexes near their own base");
      });
      ok(keys.size===sites.length,map.name+": reinforcement slots never overlap");
      p.offers.forEach(function(offer,i){
        var placements=B.placements(p,side,i);
        ok(placements.length===offer.units.length && placements.every(function(at){
          return T.terrainCost(g.terrainAt(at.col,at.row),types[at.typeId].moveType,types[at.typeId])!==null;
        }),map.name+": all previewed packages have legal terrain");
      });
    });
    if(p.symmetric)ok(p.sites[0].every(function(at,i){var other=p.sites[1][i];
      return other.col===g.width-1-at.col && other.row===(g.width%2?at.row:g.height-1-at.row);
    }),map.name+": matched slots preserve map symmetry");
    for(var step=0;step<p.offers.length;step++){
      var choice=B.cpuChoice(p,step,1);
      ok(choice===null || Number.isInteger(choice)&&choice>=0&&choice<=step,map.name+": CPU chooses only available packages");
    }
    ok(JSON.stringify(g.snapshot())===before && JSON.stringify(map)===source,map.name+": previews and CPU bidding leave state, source map and combat RNG untouched");
  });
  var g=new E.Game(maps[9],{seed:51}),p=B.plan(g);
  ok(B.resolve(p,0,[null,null]).status==="next","both declines reveal the next offer");
  ok(B.resolve(p,31,[null,null]).status==="no-deal","declining the maximum ends negotiation without forced terms");
  var a=B.resolve(p,6,[2,null]),b=B.resolve(p,6,[null,3]);
  ok(a.secondPlayer===0&&a.firstPlayer===1&&a.offer===2,"human can accept an earlier package and goes second");
  ok(b.secondPlayer===1&&b.firstPlayer===0&&b.offer===3,"other participant's chosen package follows that participant");
  ok(B.resolve(p,6,[2,3],function(){return 0;}).offer===2 &&
    B.resolve(p,6,[2,3],function(){return 0.99;}).offer===3,"both-accept tie preserves the selected winner's own package");
  ok(fails(function(){B.resolve(p,1,[3,null]);})&&fails(function(){B.resolve(p,NaN,[null,null]);}),"future and invalid offers cannot be accepted");
  var initial=g.units.length,rng=g.rng.getState(),expected=B.placements(p,0,2),mapBefore=JSON.stringify(g.map);
  B.apply(g,p,a);
  ok(g.currentPlayer===1&&g.firstPlayer===1&&g.units.length===initial+1,"acceptance adds exactly the chosen package and starts the opposite army");
  var added=g.units.slice(initial);
  ok(added.every(function(u,i){return u.player===0&&u.col===expected[i].col&&u.row===expected[i].row&&u.typeId===expected[i].typeId&&u.strength===8&&u.exp===0&&!u.moved;}),
    "actual unit type, ownership, strength, readiness and location exactly match the preview");
  ok(g.rng.getState()===rng&&JSON.stringify(g.map)===mapBefore,"applying a bonus never retunes map data or consumes combat dice");
  ok(fails(function(){B.apply(g,p,a);}),"a package cannot be applied twice");
  var restored=E.Game.restore(g.snapshot());
  ok(restored.firstPlayer===1&&restored.balance.label===g.balance.label&&restored.units.length===g.units.length,"save/resume preserves the accepted opening and bonus once");
  restored.endTurn();ok(restored.turn===1&&restored.currentPlayer===0,"Xenon's first move does not prematurely increment the round");
  restored.endTurn();ok(restored.turn===2&&restored.currentPlayer===1,"a reversed opening increments the round after both armies act");
  var legacy=g.snapshot();delete legacy.firstPlayer;delete legacy.balance;
  ok(E.Game.restore(legacy).firstPlayer===0,"older saves retain the original Union-first order");
  var short=new E.Game(maps[9],{firstPlayer:1});short.turnLimit=1;short.endTurn();
  ok(short.winner===null,"turn limit waits until both sides receive the final round");short.endTurn();
  ok(short.winner===1&&short.winReason==="turnlimit","original Xenon timeout rule remains explicit and unchanged");
  var model=require("../js/ai-model.js"),search=require("../js/ai-search.js");
  var simulated=model.clone(g);simulated.endTurn();
  var worker=E.Game.restore(search.publicSnapshot(g));worker.endTurn();
  ok(simulated.turn===1&&worker.turn===1&&worker.firstPlayer===1,"AI copies and worker snapshots retain the reversed opening order");
  var explicit=copy(maps[9]);explicit.balanceSpawns=copy(p.sites);
  var ep=B.plan(new E.Game(explicit));ok(JSON.stringify(ep.sites)===JSON.stringify(p.sites),"map authors can prescribe exact visible spawn slots");
  explicit.balanceSpawns[0][1]=copy(explicit.balanceSpawns[0][0]);
  ok(!!B.plan(new E.Game(explicit)).error,"duplicate authored slots fail before negotiation");
  var blocked=new E.Game({name:"Blocked homes",grid:["BMMM","MMMM","MMMB"],buildings:[{col:0,row:0,owner:0},{col:3,row:2,owner:1}],units:[]});
  ok(!!B.plan(blocked).error,"isolated bases cannot receive phantom or inaccessible reinforcements");
  var limited=copy(maps[9]);limited.balanceSpawns=p.sites.map(function(s){return s.slice(0,1);});
  var lp=B.plan(new E.Game(limited));ok(lp.offers.length>1&&lp.offers.every(function(o){return o.units.length<=1;}),"tight maps omit unplaceable packages without losing earlier options");
  var atomic=new E.Game(maps[9]),ap=B.plan(atomic),last=B.resolve(ap,31,[31,null]);
  var at=ap.sites[0][5];atomic.units.push(E.makeUnit("LENET",0,at.col,at.row));var count=atomic.units.length;
  ok(fails(function(){B.apply(atomic,ap,last);})&&atomic.units.length===count&&!atomic.balance,"a blocked slot rejects the entire package without partial additions");
  var storeData={},store=new P.Store({getItem:function(k){return storeData[k]||null;},setItem:function(k,v){storeData[k]=v;}}),profile=store.create("Offers test");
  g.winner=0;g.winReason="base";store.checkpoint(profile.id,{id:"balanced",options:{campaignIndex:0,opening:"offers",balance:g.balance},state:g.snapshot()});
  var record=store.active();
  ok(record.results[0].balance.label===g.balance.label && record.results[0].firstPlayer===1 && record.cleared.length===0,
    "balanced results record the opening without awarding an original-campaign clear");
  ok(P.levelKey(g.map,{campaignIndex:0})!==record.results[0].levelKey,"original and compensated results have separate identities");
};
