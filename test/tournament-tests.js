"use strict";
module.exports=function(ok){
  var T=require("../js/ai-tournament.js"),S=require("../js/ai-search.js"),M=require("../js/ai-model.js"),E=require("../js/engine.js");
  var maps=require("../js/data-maps.js"),tiny={name:"Immediate capture",grid:["B....B","......","......"],buildings:[{col:0,row:0,owner:0},{col:5,row:0,owner:1}],units:[{t:"CHARLIE",o:0,x:4,y:0},{t:"BISON",o:1,x:0,y:2}]};
  var config=T.normalize({opponents:S.modes.map(function(m){return m.id;}),maps:[tiny,maps[0]],cycles:3,workers:2});
  ok(config.total===120,"round robin schedules all pairs, boards, cycles and both factions");
  for(var i=0;i<config.total;i+=2){var a=T.fixture(config,i),b=T.fixture(config,i+1);
    ok(a.seed===b.seed&&a.map===b.map&&a.players[0]===b.players[1]&&a.players[1]===b.players[0],"paired fixtures swap factions and preserve board/seed "+i);
  }
  ok(T.fixture(config,0).seed!==T.fixture(config,40).seed,"cycles use distinct reproducible seeds");
  var invalid=[{opponents:[]},{opponents:["bogus"]},{maps:[]},{cycles:0},{cycles:1.1},{workers:17},{seed:-1},{maxRounds:-1},{k:0}];
  invalid.forEach(function(v){var threw=false;try{T.normalize(Object.assign({opponents:["classic"],maps:[tiny]},v));}catch(e){threw=true;}ok(threw,"invalid tournament setting is rejected: "+JSON.stringify(v));});
  var elo=T.standings(["classic","tactical"]),r={players:["classic","tactical"],winner:0,thinkingMs:[1,2]};T.rate(elo,r,32);
  ok(elo.classic.elo===1516&&elo.tactical.elo===1484,"equal Elo win changes ratings by K/2 symmetrically");
  T.rate(elo,{players:["classic","tactical"],winner:null},32);
  ok(elo.classic.elo<1516&&elo.classic.elo+elo.tactical.elo===3000,"draw regresses unequal Elo without creating rating points");
  var before=JSON.stringify(elo);T.rate(elo,{players:["classic","tactical"],error:"failed"},32);
  ok(JSON.stringify(elo)===before,"failed games are not rated or counted as losses");
  var same=T.standings(["classic"]);T.rate(same,{players:["classic","classic"],winner:0},32);
  ok(same.classic.elo===1500&&same.classic.wins===1&&same.classic.losses===1,"same-algorithm self-play tracks both seats without changing Elo");
  config=T.normalize({opponents:["classic","tactical"],maps:[maps[0]],cycles:1,maxRounds:3});
  for(i=0;i<2;i++){
    var result=T.playSync(T.fixture(config,i)),restored=T.replay(result);
    ok(JSON.stringify(restored.snapshot())===JSON.stringify(result.final),"complete recorded game replays to the exact final state and RNG, side "+i);
    var mid=Math.floor(result.commands.length/2),partial=T.replay(result,mid);
    for(var j=mid;j<result.commands.length;j++)T.command(partial,result.commands[j]);
    ok(JSON.stringify(partial.snapshot())===JSON.stringify(result.final),"seeking and advancing preserves exact replay "+i);
    ok(!T.summary(result).commands&&!T.summary(result).initial,"summary omits large replay payloads");
    if(result.winner===null)ok(result.reason==="round-cap"&&result.final.turnLimit===maps[0].turnLimit,"early lab cutoff records a draw without changing map rules");
  }
  var unexpected=false;try{T.command(restored,["constructor",[]]);}catch(e){unexpected=true;}
  ok(unexpected,"replay accepts only the explicit engine-command allowlist");
  // Regression: unsearched neutral priors used to win in negative positions,
  // causing the expensive AI to pass while it still had valuable actions.
  var losing=new E.Game({name:"Outnumbered",grid:[".......","B.....B","......."],buildings:[{col:0,row:1,owner:0},{col:6,row:1,owner:1}],
    units:[{t:"BISON",o:0,x:1,y:1},{t:"BISON",o:1,x:3,y:0},{t:"BISON",o:1,x:3,y:1},{t:"CHARLIE",o:1,x:5,y:2}]},{seed:1});
  var action=S.choose(losing,"apex",{iterations:8,branches:4,width:2,depth:2,horizon:4,verification:2});
  ok(action.kind!=="end","hybrid search does not compare an unevaluated turn pass against losing searched scores");
  var old=JSON.stringify(losing.snapshot());M.simulate(losing,action,M.context(losing),1,true);
  ok(JSON.stringify(losing.snapshot())===old,"representative beam outcomes cannot alter real combat or state");
  var airlift=new E.Game({name:"Airlift ridge",grid:["......M.......","B.....M......B","......M......."],
    buildings:[{col:0,row:1,owner:0},{col:13,row:1,owner:1}],
    units:[{t:"PELICAN",o:0,x:1,y:1},{t:"CHARLIE",o:0,x:0,y:2},{t:"CHARLIE",o:1,x:12,y:1}]},{seed:1});
  airlift.moveUnit(airlift.units[1],1,1);airlift.endTurn();airlift.endTurn();
  var lift=S.choose(airlift,"tactical");
  ok(lift.to&&lift.to[0]>6&&(!lift.before||lift.drop[0]>6),"delivery planning crosses an impassable ridge instead of unloading on the wrong side");
  var one=T.normalize({opponents:["classic"],maps:[tiny],cycles:4});
  ok(one.selfPlay&&one.total===8,"one selected opponent automatically produces repeated self-play");
  var savedWorker=global.Worker,workers=[];
  try{
    global.Worker=function(){this.terminated=false;this.postMessage=function(m){this.message=m;};this.terminate=function(){this.terminated=true;};workers.push(this);};
    var runner=S.createTurn(losing,0,{id:"apex",async:true}),thinking=runner.next();
    ok(thinking.t==="thinking"&&workers[0].message.state.rngState===0,"asynchronous search starts with sanitized public state");
    runner.destroy();workers[0].onmessage({data:{sequence:1,action:action}});
    ok(workers[0].terminated&&runner.next()===null&&JSON.stringify(losing.snapshot())===old,"cancelling a worker ignores late replies and leaves the match untouched");
  }finally{if(savedWorker===undefined)delete global.Worker;else global.Worker=savedWorker;}
  var doc=global.document,UI=require("../js/ui.js"),elements={"opponent-select":{},"status-player":{}},changes=0,saves=0;
  try{
    global.document={getElementById:function(id){return elements[id];}};
    var ui=Object.create(UI.GameUI.prototype);ui.game=losing;ui.mode="idle";ui.opponent="classic";
    ui.options={onOpponentChange:function(){changes++;},onStateChange:function(){saves++;}};
    ui.setOpponent("beam");
    ok(ui.opponent==="beam"&&elements["opponent-select"].value==="beam"&&changes===1&&saves===1,"opponent picker updates the match and checkpoints the selection");
    ui.mode="aiTurn";ui.setOpponent("apex");
    ok(ui.opponent==="beam"&&elements["opponent-select"].disabled,"opponent cannot change during an AI turn");
    ui.mode="idle";ui.options.hotseat=true;ui.setOpponent("apex");
    ok(ui.opponent==="beam"&&elements["opponent-select"].disabled,"hotseat never accepts a computer-opponent change");
    var terminated=false;ui.mode="aiTurn";ui.toast=function(){};ui._aiTurn={next:function(){throw new Error("Search failed");},destroy:function(){terminated=true;}};
    ok(ui.nextAIEvent().t==="error"&&terminated&&ui.snapshotForSave()===null&&losing.currentPlayer===0,"search errors preserve the checkpoint instead of passing the side's turn");
  }finally{if(doc===undefined)delete global.document;else global.document=doc;}
};
