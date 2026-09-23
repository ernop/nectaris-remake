/* Shared, deterministic tournament protocol for browser workers and Node.
 * Ratings belong to a run and its settings. Replays record engine commands,
 * so watching a game never runs either AI again. */
"use strict";
var AI_TOURNAMENT = (function () {
  var engine=typeof module!=="undefined"?require("./engine.js"):ENGINE;
  var ai=typeof module!=="undefined"?require("./ai.js"):AI;
  var search=typeof module!=="undefined"?require("./ai-search.js"):AI_SEARCH;
  var model=typeof module!=="undefined"?require("./ai-model.js"):AI_MODEL;
  var VERSION="2026-09-23.2";
  function integer(v,min,max,label){if(!Number.isInteger(v)||v<min||v>max)throw new Error(label+" must be an integer from "+min+" to "+max+".");return v;}
  function normalize(input){
    var c=Object.assign({cycles:1,seed:42,maxRounds:0,k:24,selfPlay:false,workers:2,work:"standard"},input);
    c.opponents=Array.from(new Set(c.opponents||[]));
    if(!c.opponents.length||c.opponents.some(function(id){return !search.modes.some(function(m){return m.id===id;});}))throw new Error("Select at least one known opponent.");
    if(c.opponents.length===1)c.selfPlay=true;
    if(!Array.isArray(c.maps)||!c.maps.length)throw new Error("Select at least one board.");
    c.maps.forEach(function(m){if(!m||!Array.isArray(m.grid)||!m.grid.length||!Array.isArray(m.units))throw new Error("Invalid board definition.");});
    integer(c.cycles,1,100000,"Cycles");integer(c.seed,0,4294967295,"Seed");
    integer(c.maxRounds,0,1000,"Round cap");integer(c.k,1,100,"Elo K");integer(c.workers,1,16,"Workers");
    if(["fast","standard","deep"].indexOf(c.work)<0)throw new Error("Search work must be fast, standard or deep.");
    c.pairs=[];
    c.opponents.forEach(function(a,i){c.opponents.slice(c.selfPlay?i:i+1).forEach(function(b){c.pairs.push([a,b]);});});
    c.total=c.cycles*c.maps.length*c.pairs.length*2;
    if(c.total>1000000)throw new Error("Limit each tournament to 1,000,000 games; reduce cycles or boards.");
    return c;
  }
  function seedFor(seed,cycle,map,pair){
    var n=(seed^Math.imul(cycle+1,0x9e3779b1)^Math.imul(map+1,0x85ebca6b)^Math.imul(pair+1,0xc2b2ae35))>>>0;
    n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0;
  }
  function fixture(c,index){
    integer(index,0,c.total-1,"Game index");
    var side=index%2,n=Math.floor(index/2),pair=n%c.pairs.length;
    n=Math.floor(n/c.pairs.length);var map=n%c.maps.length,cycle=Math.floor(n/c.maps.length),ids=c.pairs[pair];
    return {index:index,cycle:cycle,mapIndex:map,seed:seedFor(c.seed,cycle,map,pair),
      players:side?[ids[1],ids[0]]:ids.slice(),map:c.maps[map],maxRounds:c.maxRounds,work:c.work};
  }
  function searchOptions(id,work){
    if(!work||work==="standard"||id==="classic"||id==="tactical")return undefined;
    var base=search.get(id),factor=work==="fast"?0.5:2,options={};
    ["width","branches","iterations","horizon","verification"].forEach(function(key){
      if(base[key])options[key]=Math.max(key==="verification"?2:4,Math.round(base[key]*factor));
    });
    if(base.depth)options.depth=work==="fast"?2:4;
    return options;
  }
  function standings(ids){var out={};ids.forEach(function(id){out[id]={id:id,elo:1500,games:0,wins:0,draws:0,losses:0,union:0,xenon:0,ms:0};});return out;}
  function rate(table,result,k){
    if(result.error)return;
    var a=table[result.players[0]],b=table[result.players[1]],score=result.winner===null?0.5:result.winner===0?1:0;
    if(a!==b){var expected=1/(1+Math.pow(10,(b.elo-a.elo)/400)),change=k*(score-expected);a.elo+=change;b.elo-=change;}
    [a,b].forEach(function(row,side){
      var s=side?1-score:score;row.games++;row[side?"xenon":"union"]++;row.ms+=(result.thinkingMs||[0,0])[side];
      row[s===1?"wins":s===0?"losses":"draws"]++;
    });
  }
  function summary(result){var copy=Object.assign({},result);delete copy.initial;delete copy.commands;delete copy.final;return copy;}
  var methods={moveUnit:3,finishUnit:1,attack:2,unload:4,deployFromFactory:4,loadFromFactory:3,endTurn:0};
  function encode(arg){
    if(arg&&typeof arg==="object")return arg.id?{unit:arg.id}:{building:[arg.col,arg.row]};
    return arg;
  }
  function record(game){
    var commands=[],depth=0;
    Object.keys(methods).forEach(function(name){var original=game[name];game[name]=function(){
      var args=Array.prototype.slice.call(arguments,0,methods[name]),outer=depth===0;
      depth++;
      try{var result=original.apply(game,arguments);if(outer)commands.push([name,args.map(encode)]);return result;}
      finally{depth--;}
    };});return commands;
  }
  function command(game,entry){
    if(!entry||!Object.prototype.hasOwnProperty.call(methods,entry[0])||!Array.isArray(entry[1])||entry[1].length!==methods[entry[0]])throw new Error("Invalid replay command.");
    var args=entry[1].map(function(a){
      if(a&&a.unit)return model.find(game,a.unit);
      if(a&&a.building)return game.buildingAt(a.building[0],a.building[1]);
      return a;
    });game[entry[0]].apply(game,args);
  }
  function* play(spec,onProgress){
    if(spec.map.customUnits)mergeUnitTypes(spec.map.customUnits);
    var game=new engine.Game(spec.map,{seed:spec.seed}),initial=game.snapshot(),commands=record(game);
    var started=Date.now(),thinking=[0,0],turns=0;
    while(game.winner===null){
      var side=game.currentPlayer,t=Date.now();
      ai.playTurn(game,side,{id:spec.players[side],search:searchOptions(spec.players[side],spec.work)});thinking[side]+=Date.now()-t;turns++;
      if(onProgress)onProgress({turn:game.turn,side:side,halfTurns:turns,units:game.units.length});
      if(game.winner!==null)break;
      // A laboratory cutoff is a draw, distinct from the actual map's Xenon
      // timeout victory. Never silently edit the scenario's rules or budget.
      if(spec.maxRounds&&game.turn>=spec.maxRounds&&side===1&&game.turn<game.turnLimit)break;
      game.endTurn();yield;
      if(turns>2*game.turnLimit+2)throw new Error("Tournament game exceeded the engine turn budget.");
    }
    return {version:VERSION,index:spec.index,players:spec.players,map:spec.map.name,mapIndex:spec.mapIndex,
      seed:spec.seed,work:spec.work||"standard",winner:game.winner,reason:game.winner===null?"round-cap":game.winReason,
      rounds:Math.min(game.turn,game.turnLimit),halfTurns:turns,ms:Date.now()-started,thinkingMs:thinking,
      initial:initial,commands:commands,final:game.snapshot()};
  }
  function playSync(spec,onProgress){var it=play(spec,onProgress),step;do{step=it.next();}while(!step.done);return step.value;}
  function replay(result,index){
    var g=engine.Game.restore(result.initial),end=index===undefined?result.commands.length:index;
    integer(end,0,result.commands.length,"Replay position");
    for(var i=0;i<end;i++)command(g,result.commands[i]);return g;
  }
  return {version:VERSION,normalize:normalize,fixture:fixture,standings:standings,rate:rate,summary:summary,
    play:play,playSync:playSync,command:command,replay:replay};
})();
if(typeof module!=="undefined")module.exports=AI_TOURNAMENT;
