"use strict";
var assert=require("node:assert/strict");
module.exports=function(ok){
  var ENGINE=require("../js/engine.js"),AI=require("../js/ai.js"),UI=require("../js/ui.js");
  var saved={AI:global.AI,RENDER:global.RENDER,document:global.document,setTimeout:global.setTimeout,now:Date.now};
  var tasks=[],clock=0,delays=[],slices=0;
  global.AI=AI;global.RENDER=require("../js/render.js");
  global.document={getElementById:function(){
    var classes=new Set(["hidden"]);
    return {textContent:"", innerHTML:"", classList:{add:function(c){classes.add(c);}, remove:function(c){classes.delete(c);}, contains:function(c){return classes.has(c);}}};
  }};
  global.setTimeout=function(fn,delay){tasks.push(fn);delays.push(delay);return tasks.length;};
  Date.now=function(){clock+=9;return clock;};
  try{
    var maps=require("../js/data-maps.js").concat(require("../js/data-ai-maps.js"));
    maps.forEach(function(map){
      var original=new ENGINE.Game(map,{seed:83}),snapshot=original.snapshot();
      var expected=ENGINE.Game.restore(snapshot),actual=ENGINE.Game.restore(snapshot);
      AI.playTurn(expected,expected.currentPlayer);if(expected.winner===null)expected.endTurn();
      var ui=Object.create(UI.GameUI.prototype),finished=false;
      ui.game=actual;ui.watchAI=false;ui.clearUndo=function(){};
      ui.finishAITurn=function(){if(actual.winner===null)actual.endTurn();this._aiTurn=null;finished=true;};
      ui.beginAITurn();assert.equal(delays[delays.length-1],0,"fast mode starts without 300 ms delay");
      while(tasks.length){tasks.shift()();slices++;assert.ok(slices<20000,"AI must complete");}
      assert.ok(finished);assert.deepEqual(actual.snapshot(),expected.snapshot(),map.name+" sliced AI outcome");
    });
    assert.ok(slices>maps.length);assert.ok(delays.every(function(delay){return delay===0;}));
    ok(true,"time-sliced fast AI preserves complete match/log/RNG states and removes the fixed start delay");
    var ui=Object.create(UI.GameUI.prototype),events=0;
    ui._aiTurn={next:function(){events++;return {};}};ui.destroyed=true;ui.runFastAITurn();assert.equal(events,0);
    ui.destroyed=false;ui.watchAI=true;var watched=0;ui.runNextAIEvent=function(){watched++;};ui.runFastAITurn();assert.equal(watched,1);assert.equal(events,0);
    ok(true,"fast AI stops when destroyed and hands back to watched playback when enabled");
  }finally{global.AI=saved.AI;global.RENDER=saved.RENDER;global.document=saved.document;global.setTimeout=saved.setTimeout;Date.now=saved.now;}
};
if(require.main===module)module.exports(function(condition,message){assert.ok(condition);console.log("PASS: "+message);});
