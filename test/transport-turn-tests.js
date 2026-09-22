"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js"), HEX = require("../js/hex.js");
  function fixture(type) {
    return new ENGINE.Game({name:"Transport transfers",grid:["..F........","...........","..........."],
      buildings:[{col:2,row:0,owner:0,stored:["ATLAS","CHARLIE"]}],
      units:[{t:type,o:0,x:2,y:1},{t:"CHARLIE",o:0,x:1,y:1},{t:"POLAR",o:1,x:10,y:2}]},{seed:4});
  }
  function rejects(fn) { try { fn(); return false; } catch (error) { return true; } }
  ["PELICAN","MULE"].forEach(function (type) {
    var g=fixture(type), carrier=g.units[0], factory=g.buildingAt(2,0), atlas=factory.stored[0];
    var before=g.snapshot();
    g.loadFromFactory(factory,atlas,carrier);
    g.moveUnit(carrier,4,1); g.finishMovement(carrier);
    ok(carrier.transferUsed && carrier.col===4 && carrier.cargo[0]===atlas,
      type+": loading then moving is allowed and preserves its passenger");
    ok(!g.unloadTargets(carrier,atlas).length && rejects(function(){g.unload(carrier,atlas,5,1);}),
      type+": loading, moving and unloading in the same turn is rejected");
    var restored=ENGINE.Game.restore(g.snapshot());
    ok(restored.units[0].transferUsed && !restored.unloadTargets(restored.units[0],restored.units[0].cargo[0]).length,
      type+": a save/reload cannot reset the transfer limit");
    var undone=ENGINE.Game.restore(before);
    ok(!undone.units[0].transferUsed && !undone.units[0].cargo.length,
      type+": undoing the load restores its transfer allowance");
    g.endTurn();g.endTurn();
    g.moveUnit(carrier,5,1);g.finishMovement(carrier);
    var target=g.unloadTargets(carrier,atlas)[0];
    ok(carrier.moved && !!target, type+": cargo aboard at turn start can unload after the carrier moves");
    g.unload(carrier,atlas,target.col,target.row);
    ok(carrier.transferUsed && !carrier.cargo.length && g.unitAt(target.col,target.row)===atlas,
      type+": moving then unloading succeeds");

    g=fixture(type);carrier=g.units[0];factory=g.buildingAt(2,0);atlas=factory.stored[0];
    g.loadFromFactory(factory,atlas,carrier);g.endTurn();g.endTurn();
    target=g.unloadTargets(carrier,atlas).find(function(p){return !g.buildingAt(p.col,p.row);});
    g.unload(carrier,atlas,target.col,target.row);
    var passenger=g.units[1];
    ok(!g.canLoad(carrier,passenger) && rejects(function(){g.moveUnit(passenger,carrier.col,carrier.row);}) &&
      rejects(function(){g.loadFromFactory(factory,factory.stored[0],carrier);}),
      type+": unloading forbids loading a different field or factory unit in the same turn");
    g.moveUnit(carrier,4,1);g.finishMovement(carrier);
    ok(carrier.col===4 && carrier.transferUsed,type+": unloading first still permits movement afterward");
    g.endTurn();g.endTurn();
    ok(g.canLoad(carrier,passenger),type+": the next turn restores the transfer allowance");

    g=fixture(type);carrier=g.units[0];factory=g.buildingAt(2,0);atlas=factory.stored[0];
    g.moveUnit(carrier,1,0);g.finishMovement(carrier);
    g.loadFromFactory(factory,atlas,carrier);
    ok(carrier.moved && carrier.transferUsed && carrier.cargo[0]===atlas && !g.unloadTargets(carrier,atlas).length,
      type+": moving first permits loading afterward, but never a second transfer");

    g=fixture(type);carrier=g.units[0];passenger=g.units[1];
    carrier.type=Object.assign({},carrier.type,{cargo:2});
    g.moveUnit(passenger,carrier.col,carrier.row);
    ok(carrier.cargo.length===1 && !g.canLoad(carrier,g.buildingAt(2,0).stored[0],true),
      type+": even a custom larger hold permits only one passenger transfer per turn");
  });
};
