/* Terrain fixture transcribed from Anka's original movement research:
 * https://anka.sakura.ne.jp/nectaris/d2.html (movement types/costs)
 * https://anka.sakura.ne.jp/nectaris/d1.html (unloading restrictions)
 * Expected chassis membership and costs must not be generated from game data.
 */
"use strict";
module.exports=function(ok){
  var ENGINE=require("../js/engine.js"),HEX=require("../js/hex.js");
  var types=require("../js/data-units.js").UNIT_TYPES;
  var chars=["-","=",".","h","w","M","v","F","B"];
  var groups=[
    {ids:["CHARLIE","KILROY"],cost:[1,1,1,1,2,2,"all",1,1]},
    {ids:["PANTHER","MULE"],cost:[1,1,2,4,null,null,null,1,1]},
    {ids:["BISON","LENET","POLAR","GRIZZLY","SLAGGER","TITAN","GIANT","HADRIAN","OCTOPUS","RABBIT","LYNX","SEEKER","HAWKEYE"],cost:[1,1,1,2,3,null,null,1,1]},
    {ids:["EAGLE","FALCON","HUNTER","PELICAN"],cost:[1,1,1,1,1,1,1,1,1]},
    {ids:["ATLAS","TRIGGER"],cost:[null,null,null,null,null,null,null,null,null]}
  ];
  ok(groups.reduce(function(n,g){return n+g.ids.length;},0)===23,"terrain audit covers all 23 stock units");
  function fixture(id,ch,col,direction){
    var grid=Array.from({length:9},function(){return Array(9).fill("v");});
    var target=HEX.neighbors(col,4)[direction];grid[4][col]=".";grid[target.row][target.col]=ch;
    var g=new ENGINE.Game({name:"Terrain contract",grid:grid.map(function(r){return r.join("");}),
      buildings:["F","B"].includes(ch)?[{col:target.col,row:target.row,owner:0}]:[],
      units:[{t:id,o:0,x:col,y:4}]},{seed:9});
    return {game:g,unit:g.units[0],target:target};
  }
  groups.forEach(function(group){group.ids.forEach(function(id){chars.forEach(function(ch,i){
    [3,4].forEach(function(col){[0,3].forEach(function(direction){
      var f=fixture(id,ch,col,direction),g=f.game,u=f.unit,p=f.target;
      var charge=group.cost[i]==="all"?types[id].move:group.cost[i];
      var permitted=charge!==null&&charge<=types[id].move;
      var rec=g.movementRange(u)[HEX.key(p.col,p.row)];
      var label=id+" into "+ch+" (column "+col+", direction "+direction+")";
      ok(!!rec===permitted,label+": movement preview follows the source table and movement allowance");
      if(permitted)ok(rec.cost===charge&&!!rec.stop===(group.cost[i]==="all"),label+": exact cost and valley stop");
      var before=JSON.stringify(g.snapshot()),threw=false;
      try{g.moveUnit(u,p.col,p.row);}catch(e){threw=true;}
      ok(threw===!permitted,label+": executing movement enforces the same access rule");
      if(!permitted)ok(JSON.stringify(g.snapshot())===before,label+": forbidden movement leaves the game unchanged");
    });});
  });});});
  // Walking/flying onto terrain is different from unloading onto it.
  ["CHARLIE","PANTHER","BISON","ATLAS","TRIGGER"].forEach(function(id){
    chars.forEach(function(ch){
      var f=fixture("PELICAN",ch,3,0),g=f.game,carrier=f.unit;
      var cargo=ENGINE.makeUnit(id,0,carrier.col,carrier.row);
      cargo.carriedBy=carrier.id;carrier.cargo.push(cargo);g.units.push(cargo);
      var allowed=["-","=",".","F"].includes(ch);
      ok(g.unloadTargets(carrier,cargo).some(function(p){return p.col===f.target.col&&p.row===f.target.row;})===allowed,
        id+": transport unload into "+ch+" uses the documented firm-ground/owned-factory restriction");
    });
  });
};
