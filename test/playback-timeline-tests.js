"use strict";
module.exports = function (ok) {
  var timeline = require("../js/playback-timeline.js"), UI = require("../js/ui.js");
  var saved = {request:global.requestAnimationFrame,cancel:global.cancelAnimationFrame,document:global.document};
  var callbacks = new Map(), next = 0, elapsed = [], completed = 0;
  function request(fn) { callbacks.set(++next,fn); return next; }
  function cancel(id) { callbacks.delete(id); }
  function frame(time) { var pending=Array.from(callbacks.values()); callbacks.clear(); pending.forEach(function(fn){fn(time);}); }
  try {
    global.requestAnimationFrame=request;global.cancelAnimationFrame=cancel;
    var clock=timeline.play({duration:1000,update:function(ms){elapsed.push(ms);},done:function(){completed++;}});
    frame(0);frame(300);clock.pause();frame(50000);
    ok(clock.paused&&elapsed.join() === "0,300"&&completed===0&&callbacks.size===0,"pause freezes animation and its completion callback without spinning frames");
    clock.resume();frame(90000);frame(90699);
    ok(elapsed[elapsed.length-1]===999&&completed===0,"resuming excludes all paused time and preserves the remaining duration");
    clock.pause();clock.resume();frame(100000);frame(100001);frame(120000);
    ok(completed===1&&callbacks.size===0,"repeated pause/resume completes exactly once");
    clock=timeline.play({duration:1000,done:function(){completed++;}});clock.pause();clock.cancel();clock.resume();frame(200000);
    ok(completed===1&&callbacks.size===0,"closing a paused battle cancels its pending advance permanently");
    var button={textContent:"",setAttribute:function(name,value){this[name]=value;}};
    global.document={getElementById:function(){return button;}};
    var ui=Object.create(UI.GameUI.prototype),advanced=0,updates=0;
    ui.playBattleTimeline(1600,function(){updates++;},function(){advanced++;});frame(0);frame(500);
    ui.toggleBattlePause();frame(10000);
    ok(button.textContent==="Resume"&&button["aria-pressed"]==="true"&&advanced===0&&updates===2,"battle button pauses the watched preview before another AI event");
    ui.toggleBattlePause();frame(11000);frame(12099);
    ok(button.textContent==="Pause"&&advanced===0,"battle button resumes the remaining preview time");
    frame(12100);
    ok(advanced===1&&!ui._battlePlayback,"battle advances only once after the resumed time completes");

    var sought = 0; elapsed = [];
    clock = timeline.play({duration:1000,update:function(ms){elapsed.push(ms);},done:function(){sought++;}});
    frame(160000);frame(160100);clock.seek(600);
    ok(clock.elapsed===600&&elapsed[elapsed.length-1]===600&&sought===0,"seek jumps ahead and keeps playing");
    clock.pause();clock.seek(700);
    ok(!clock.paused&&clock.elapsed===700,"seeking resumes a paused clock");
    frame(170000);frame(170400);
    ok(sought===1&&elapsed[elapsed.length-1]===1000,"a sought clock still completes once at its duration");
    clock = timeline.play({duration:1000,done:function(){sought++;}});clock.seek(Infinity);
    ok(sought===2&&callbacks.size===0,"seeking past the end completes immediately without a pending frame");

    var shown = Object.create(UI.GameUI.prototype);
    shown.renderer = {aftermath:[], flashUnits:{}, attackingUnitId:null};
    shown.draw = function () {};
    var hunter = {id:1,col:2,row:3}, prey = {id:2,col:3,row:3};
    shown.showAftermath(hunter,prey,{defenderDead:true,attackerDead:false});frame(180000);
    ok(shown.renderer.attackingUnitId===1&&!Object.keys(shown.renderer.flashUnits).length&&
      shown.renderer.aftermath.length===1&&shown.renderer.aftermath[0].col===3&&shown.renderer.aftermath[0].row===3,
      "back on the map a destroyed defender explodes at its hex while its attacker keeps the battle highlight");
    frame(181500);
    ok(!shown.renderer.aftermath.length&&!shown._aftermath&&shown.renderer.attackingUnitId===1,
      "the explosion stops after one second; the highlight stays until the next action");
    shown.showAftermath(hunter,prey,{defenderDead:false,attackerDead:true});frame(190000);
    ok(shown.renderer.attackingUnitId===null&&shown.renderer.flashUnits[2]==="#ffffff"&&shown.renderer.aftermath[0].col===2,
      "a counterattack kill explodes at the attacker's hex and keeps the defender's ring");
    shown.showAftermath(hunter,prey,{defenderDead:true,attackerDead:true});frame(200000);
    ok(shown.renderer.attackingUnitId===null&&!Object.keys(shown.renderer.flashUnits).length&&shown.renderer.aftermath.length===2,
      "mutual destruction explodes at both hexes with no survivor highlighted");
    shown.showAftermath(hunter,prey,{defenderDead:false,attackerDead:false});
    ok(!shown._aftermath&&!shown.renderer.aftermath.length&&shown.renderer.attackingUnitId===null&&callbacks.size===0,
      "a battle without a destroyed squad leaves no aftermath and clears the battle highlight");
  } finally {
    global.requestAnimationFrame=saved.request;global.cancelAnimationFrame=saved.cancel;global.document=saved.document;
  }
};
