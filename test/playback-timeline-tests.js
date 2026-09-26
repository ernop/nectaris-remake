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
  } finally {
    global.requestAnimationFrame=saved.request;global.cancelAnimationFrame=saved.cancel;global.document=saved.document;
  }
};
