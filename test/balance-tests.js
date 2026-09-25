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
    [0,1].forEach(function(side){
      var survey=B.cpuSurvey(p,side),high=survey.high;
      ok((high===p.offers.length || B.cpuChoice(p,high,side)!==null) &&
        (survey.low===-1 || B.cpuChoice(p,survey.low,side)===null),map.name+": bot switch point agrees with its own role evaluation");
    });
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
  function survey(threshold){
    var s=B.begin(p),step;
    while((step=B.question(s))!==null)B.answer(p,s,step>=threshold?step:null);
    return s;
  }
  var surveys=[];
  for(var threshold=0;threshold<=p.offers.length;threshold++){
    var s=survey(threshold);surveys.push(s);
    ok(s.high===threshold&&s.low===threshold-1&&s.answers.length<=6,
      "guided questions find exact switch boundary in at most six answers: "+threshold);
  }
  var validSettlements=true;
  surveys.forEach(function(left,i){surveys.forEach(function(right,j){
    var result=B.settle(p,[left,right],function(){return 0;});
    if(i===32&&j===32){if(result.status!=="no-deal")validSettlements=false;return;}
    if(result.offer!==Math.min(i,j)||result.secondPlayer!==(i<=j?0:1)||result.tied!==(i===j))validSettlements=false;
  });});
  ok(validSettlements,"every pair of switch points settles at the first acceptable menu, with no forced deal");
  ok(B.settle(p,[surveys[3],surveys[3]],function(){return .9;}).secondPlayer===1,"equal switch points use the independent random tie-break");
  var revised=B.begin(p);B.answer(p,revised,null);B.back(revised);
  ok(revised.answers.length===0&&B.question(revised)===15,"change previous answer restores the preceding bracket");
  B.answer(p,revised,null);B.answer(p,revised,2);
  ok(revised.low===-1&&revised.high===2,"accepting an earlier retained package revises its previous rejection");
  B.answer(p,revised,null);B.answer(p,revised,null);
  ok(B.question(revised)===null&&revised.choice===2,"revised answers still converge to a consistent boundary");
  ok(fails(function(){B.settle(p,[B.begin(p),surveys[3]]);})&&fails(function(){B.answer(p,B.begin(p),31);}),
    "unfinished surveys and answers outside the current menu cannot form an agreement");
  var draft=JSON.stringify(g.snapshot()),bot=B.cpuSurvey(p,1);
  ok(B.question(bot)===null&&JSON.stringify(g.snapshot())===draft,"CPU locks its full survey without changing map or combat randomness");
  var guidedGame=new E.Game(maps[9]),guidedPlan=B.plan(guidedGame),guidedResult=B.settle(guidedPlan,[surveys[2],surveys[8]]);
  B.apply(guidedGame,guidedPlan,guidedResult);
  ok(JSON.stringify(E.Game.restore(guidedGame.snapshot()).balance)===JSON.stringify(guidedGame.balance)&&guidedGame.balance.version===2,
    "switch points and private answer record survive the started match's save and restore");

  // Exercise the controller's real transitions without canvas rendering.
  var oldBalance=global.BALANCE,oldDocument=global.document;
  try{
    global.BALANCE=B;global.document={getElementById:function(){return {children:[]};}};
    var Setup=require("../js/balance-ui.js").Setup;
    function controller(hotseat){
      var ui=Object.create(Setup.prototype);ui.plan=p;ui.options={hotseat:hotseat};ui.render=function(){};ui.focus=function(){};
      ui.handoff=function(player){this.phase="handoff";this.handedTo=player;};ui.restart();return ui;
    }
    var solo=controller(false),locked=JSON.stringify(solo.surveys[1]);
    solo.submit(solo.step);
    ok(solo.phase==="vote"&&solo.step<15&&JSON.stringify(solo.surveys[1])===locked,"solo acceptance narrows the question while CPU answers remain committed");
    while(solo.phase==="vote")solo.submit(null);
    ok(solo.phase==="agreed"&&solo.result.thresholds.length===2,"solo agreement waits for the player's completed switch point");
    var hotseat=controller(true);
    ok(hotseat.phase==="handoff"&&hotseat.handedTo===0,"hotseat begins behind a private handoff");
    hotseat.phase="vote";hotseat.submit(0);
    ok(hotseat.phase==="handoff"&&hotseat.handedTo===1&&hotseat.responder===1&&!hotseat.result,"first player's completed answers stay hidden until the second player finishes");
    hotseat.phase="vote";
    while(hotseat.phase==="vote")hotseat.submit(null);
    ok(hotseat.phase==="agreed"&&hotseat.result.secondPlayer===0&&hotseat.result.offer===0,"hotseat settles after both independent surveys");
    hotseat.restart();hotseat.phase="vote";
    while(hotseat.phase==="vote")hotseat.submit(null);
    hotseat.phase="vote";while(hotseat.phase==="vote")hotseat.submit(null);
    ok(hotseat.phase==="no-deal","two complete refusals reach the explicit no-deal screen");
  }finally{
    if(oldBalance===undefined)delete global.BALANCE;else global.BALANCE=oldBalance;
    if(oldDocument===undefined)delete global.document;else global.document=oldDocument;
  }
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
