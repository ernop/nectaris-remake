/* Exercise real engine endings through profile saves and repeated callbacks. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var PROFILES = require("../js/profiles.js");
  function memory() {
    var data = {};
    return {getItem: function (k) { return data[k] || null; },
      setItem: function (k,v) { data[k] = String(v); }, removeItem: function (k) { delete data[k]; },
      key: function (i) { return Object.keys(data)[i]; }, get length() { return Object.keys(data).length; }};
  }
  var storage = memory(), store = new PROFILES.Store(storage), p = store.create("Outcomes");
  var cases = [];
  [0,1].forEach(function (winner) {
    var base = new ENGINE.Game({name: "Base " + winner, grid: [".B..", "...."],
      buildings: [{col: 1,row: 0,owner: 1-winner}],
      units: [{t:"CHARLIE",o:winner,x:0,y:0}, {t:"BISON",o:1-winner,x:3,y:1}]}, {seed: 3});
    base.currentPlayer = winner;
    base = ENGINE.Game.restore(base.snapshot());
    base.moveUnit(base.units[0],1,0); base.finishUnit(base.units[0]);
    cases.push({game:base,winner:winner,reason:"base"});
    var elimination = new ENGINE.Game({name:"Elimination " + winner, grid:["...."],
      units:[{t:"POLAR",o:winner,x:0,y:0},{t:"CHARLIE",o:1-winner,x:1,y:0,str:1}]},{seed:2});
    elimination.currentPlayer = winner;
    elimination = ENGINE.Game.restore(elimination.snapshot());
    elimination.attack(elimination.units[0], elimination.units[1]);
    cases.push({game:elimination,winner:winner,reason:"elimination"});
  });
  // Both sides only end their turns: nothing is damaged or captured.
  var quiet = new ENGINE.Game({name:"Quiet",grid:["...."],
    units:[{t:"CHARLIE",o:0,x:0,y:0},{t:"CHARLIE",o:1,x:3,y:0}]},{seed:1});
  for (var half = 0; half < 2 * ENGINE.QUIET_TURNS; half++) {
    if (half === ENGINE.QUIET_TURNS) quiet = ENGINE.Game.restore(quiet.snapshot());
    quiet.endTurn();
  }
  cases.push({game:quiet,winner:null,reason:"no-progress"});
  var last = new ENGINE.Game({name:"Last turn",grid:["...."],
    units:[{t:"CHARLIE",o:0,x:0,y:0},{t:"CHARLIE",o:1,x:3,y:0}]},{seed:1}).snapshot();
  last.turn = last.progressTurn = ENGINE.TURN_LIMIT; last.currentPlayer = 1;
  last = ENGINE.Game.restore(last); last.endTurn();
  cases.push({game:last,winner:null,reason:"turnlimit"});
  cases.forEach(function (entry,index) {
    var game = entry.game;
    ok(game.winner === entry.winner && game.winReason === entry.reason, "real engine ending: " + game.map.name);
    var match = {id:"ending-"+index,key:"campaign:"+index,options:{campaignIndex:index},state:game.snapshot()};
    store.checkpoint(p.id,match);
    store = new PROFILES.Store(storage);
    store.checkpoint(p.id,match);
    var result = store.active().results[index];
    ok(result.winner === entry.winner && result.reason === entry.reason &&
      result.outcome === (entry.winner === null ? "draw" : entry.winner === 0 ? "win" : "loss"), "ending survives reopen with correct outcome and reason");
    ok(store.active().results.length === index + 1 && !store.sessions(p.id).length, "repeated completion is idempotent");
  });
  ok(store.active().results[4].turn === ENGINE.QUIET_TURNS && store.active().results[5].turn === ENGINE.TURN_LIMIT,
    "draw results report the last turn played");
  var drawRecord = PROFILES.levelRecord(store.active(),quiet.map,{campaignIndex:4});
  ok(drawRecord.draws === 1 && drawRecord.wins === 0 && drawRecord.losses === 0, "per-mission record counts a draw as neither win nor loss");
  ok(PROFILES.outcomeLabel(store.active().results[4]) === "Draw", "a drawn match is labelled a draw");
  // A newer match on the board of an already finished one.
  var newMatch = {id:"new-match",key:"campaign:0",options:{campaignIndex:0},state:quiet.snapshot()};
  newMatch.state.winner = null; newMatch.state.winReason = null;
  store.checkpoint(p.id,newMatch);
  var old = {id:"ending-0",key:"campaign:0",options:{campaignIndex:0},state:cases[0].game.snapshot()};
  store.checkpoint(p.id,old);
  ok(store.session(p.id,"campaign:0").id === "new-match", "late old completion does not clear a newer save");
  old.state.winner = null; old.state.winReason = null;
  store.checkpoint(p.id,old);
  ok(store.session(p.id,"campaign:0").id === "new-match", "old pre-victory checkpoint cannot resurrect a completed match");
  var invalid = {id:"bad",key:"campaign:0",options:{},state:Object.assign({},newMatch.state,{winner:7})};
  var rejected = false;
  try { store.checkpoint(p.id,invalid); } catch (e) { rejected = true; }
  ok(rejected && store.session(p.id,"campaign:0").id === "new-match", "invalid winner cannot fabricate a loss or erase a save");
  var rec = PROFILES.levelRecord(store.active(),cases[0].game.map,{campaignIndex:0});
  ok(rec.wins === 1 && rec.losses === 0, "per-mission record shows victories");
  ok(PROFILES.levelRecord(store.active(),cases[0].game.map,{expansionIndex:0}).latest === null,
    "same-named levels in separate packs do not share outcomes");
  ok(PROFILES.outcomeLabel({hotseat:true,winner:1,outcome:"loss"}) === "Xenon victory", "hotseat does not label the shared profile a loser");
  ok(PROFILES.reasonLabel("turnlimit") === "Turn limit reached" &&
    PROFILES.reasonLabel("no-progress") === "No damage or factory capture in 100 turns", "draw reasons are readable");
  var other = store.create("Other");
  ok(PROFILES.levelRecord(other,cases[0].game.map,{campaignIndex:0}).latest === null,
    "mission outcomes are isolated by profile");
  // More than one page of history is retained through a storage round trip.
  for (var i=0;i<15;i++) store.checkpoint(other.id,{id:"history-"+i,key:"custom:history",options:{},state:cases[0].game.snapshot()});
  ok(new PROFILES.Store(storage).active().results.length === 15, "all outcome history is retained beyond ten matches");
};
