"use strict";
module.exports = function (ok) {
  var E = require("../js/engine.js"), H = require("../js/hex.js"), R = require("../js/render.js");
  var M = require("../js/move-animation.js");
  var g = new E.Game({name:"Path",grid:[".......","..MM...",".......","......."],
    units:[{t:"BISON",o:0,x:0,y:1},{t:"CHARLIE",o:1,x:6,y:3}]},{seed:18});
  var unit=g.units[0],range=g.movementRange(unit),destination=Object.values(range).filter(function(r){return r.canStop&&r.cost>=3;}).pop();
  var expected=[],step=range[H.key(destination.col,destination.row)];
  while(step){expected.unshift({col:step.col,row:step.row});step=step.prev===null?null:range[step.prev];}
  var move=g.moveUnit(unit,destination.col,destination.row),state=JSON.stringify(g.snapshot());
  ok(JSON.stringify(move.path)===JSON.stringify(expected),"animation uses the live cheapest legal route around terrain");
  ok(move.path.every(function(p,i){return !i||H.distance(p.col,p.row,move.path[i-1].col,move.path[i-1].row)===1;}),"every movement step is one neighboring hex");
  var callbacks=new Map(),next=0,done=0;
  var renderer=new R.Renderer({width:800,height:600,getContext:function(){return {};}},g);renderer.draw=function(){};
  function request(fn){callbacks.set(++next,fn);return next;}
  function cancel(id){callbacks.delete(id);}
  function frame(time){var pending=Array.from(callbacks.values());callbacks.clear();pending.forEach(function(fn){fn(time);});}
  var animation=M.play(renderer,unit,move.path,{stepMs:100,requestFrame:request,cancelFrame:cancel,done:function(){done++;}});
  ok(renderer.motion.from.col===move.path[0].col&&renderer.motion.fraction===0,"unit appears at its origin before the first animation frame");
  frame(0);frame(50);
  ["normal","sideways"].forEach(function(orientation){
    renderer.orientation=orientation;renderer.fitToMap();
    var from=renderer.hexCenter(move.path[0].col,move.path[0].row),to=renderer.hexCenter(move.path[1].col,move.path[1].row),at=renderer.unitCenter(unit);
    ok(Math.abs(at.x-(from.x+to.x)/2)<1e-8&&Math.abs(at.y-(from.y+to.y)/2)<1e-8,"movement interpolation follows "+orientation+" board coordinates");
  });
  var frozen=JSON.stringify(renderer.motion);animation.pause();frame(50000);
  ok(JSON.stringify(renderer.motion)===frozen&&callbacks.size===0,"replay pause freezes a moving unit in its current hex segment");
  animation.resume();frame(50);
  ok(JSON.stringify(renderer.motion)===frozen,"replay resume continues from the paused segment without jumping");
  for(var i=1;i<move.path.length-1;i++) {frame(i*100);ok(renderer.motion.from.col===move.path[i].col&&renderer.motion.from.row===move.path[i].row,"animation visits intermediate hex "+i);}
  frame(animation.duration);
  ok(!renderer.motion&&done===1&&JSON.stringify(g.snapshot())===state,"finishing animation preserves the committed save, log, action flags and RNG");
  animation=M.play(renderer,unit,move.path,{requestFrame:request,cancelFrame:cancel,done:function(){done++;}});
  animation.cancel();frame(10000);
  ok(!renderer.motion&&callbacks.size===0&&done===1&&JSON.stringify(g.snapshot())===state,"canceling a replay seek or destroyed view cancels frames without replaying a move");
  var carrier=new E.Game({name:"Boarding",grid:[".......",".......","......."],units:[{t:"CHARLIE",o:0,x:0,y:1},{t:"PELICAN",o:0,x:2,y:1},{t:"BISON",o:1,x:6,y:2}]});
  var passenger=carrier.units[0],load=carrier.moveUnit(passenger,2,1);
  ok(load.loaded&&load.path[0].col===0&&load.path[load.path.length-1].col===2,"boarding retains the complete route after the passenger leaves the board");
  M.play(renderer,passenger,load.path,{requestFrame:request,cancelFrame:cancel});
  ok(renderer.motion.unit.id===passenger.id,"a boarded or stored unit remains drawable along its route");
};
