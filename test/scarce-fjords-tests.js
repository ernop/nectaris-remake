"use strict";
module.exports = function(ok) {
  var maps=require("../js/data-ai-maps.js"), ENGINE=require("../js/engine.js");
  var HEX=require("../js/hex.js"), terrain=require("../js/data-terrain.js");
  var types=require("../js/data-units.js").UNIT_TYPES;
  [5,6].forEach(function(index) {
    var map=maps[index], game=new ENGINE.Game(map,{seed:6}), expected=index===5 ? 9 : 21;
    var name=map.name, factories=Object.values(game.buildings).filter(function(b){return b.kind==="factory";});
    ok(game.width === (index===5 ? 34 : 58) && game.height===game.width, name+": expected map dimensions");
    ok(JSON.stringify(map)===JSON.stringify(require("../"+map.source)), name+": downloadable JSON matches the built-in map");
    ok(factories.length===expected && factories.every(function(b){return b.owner===-1;}),
      name+": exactly "+expected+" neutral factories");
    [0,1].forEach(function(player) {
      var army=map.units.filter(function(u){return u.o===player;});
      var base=map.buildings.find(function(b){return b.owner===player;});
      ok(JSON.stringify(army.map(function(u){return u.t;}).sort())==='["CHARLIE","PANTHER","RABBIT"]',
        name+": player "+player+" starts with only Charlie, Panther and Rabbit");
      ok(army.every(function(u){return HEX.distance(u.x,u.y,base.col,base.row)===1;}),
        name+": the three starters are beside their home camp");
    });
    var buckets=[0,0,0], sizes=[];
    factories.forEach(function(b) {
      sizes.push(b.stored.length); b.owner=0;
      var ns=HEX.neighbors(b.col,b.row), directions=[];
      ns.forEach(function(p,i){if(game.terrainAt(p.col,p.row).id==="road")directions.push(i);});
      buckets[directions.length-1]++;
      ok(directions.length>=1 && directions.length<=3 && ns.every(function(p){
        return ["road","mountain"].includes(game.terrainAt(p.col,p.row).id);
      }), name+": factory mouths are road hexes with mountains behind");
      ok(directions.some(function(start){return directions.every(function(d){return (d-start+6)%6<directions.length;});}),
        name+": all mouths face into a single fjord approach, never opposite sides");
      ok(b.stored.length>=4 && b.stored.length<=8, name+": every factory has four to eight reserves");
      ok(new Set(b.stored.map(function(u){return u.typeId;})).size<=5 &&
        b.stored.filter(function(u){return u.type.cls==="artillery";}).length<=2,
        name+": factory teams retain a limited variety and at most two artillery units");
      b.stored.forEach(function(u,i) {
        u.player=0;
        ok(u.type.cls!=="infantry" && !u.type.capture, name+": no infantry or other capturing units in factory reserves");
        ok(u.type.moveType!=="air" || u.typeId==="PELICAN", name+": Pelicans are the only aircraft");
        ok(game.deployTargets(b,u).length===directions.length, name+": every reserve has the real authored exit count");
        if (u.type.placeByTransport) {
          var carrier=b.stored[i-1];
          ok(carrier && ["MULE","PELICAN"].includes(carrier.typeId) && game.canLoad(carrier,u,true),
            name+": each immobile unit immediately follows its own compatible carrier");
        }
      });
    });
    ok(buckets.every(function(n){return n===expected/3;}), name+": equal numbers of one-, two- and three-exit factories");
    ok(Math.min.apply(null,sizes)===4 && Math.max.apply(null,sizes)===8, name+": stock sizes cover the four-to-eight range");

    // Classify actual terrain rather than trusting generation metadata.
    var open=[], broad=0, veryBroad=0;
    map.grid.forEach(function(row,r){row.split("").forEach(function(ch,c){
      if(ch==="M")return;
      open.push({col:c,row:r});
      [2,3].forEach(function(radius){
        var full=true;
        for(var y=r-radius-1;y<=r+radius+1;y++)for(var x=c-radius;x<=c+radius;x++) {
          if(HEX.distance(c,r,x,y)<=radius && (!game.inBounds(x,y)||map.grid[y][x]==="M"))full=false;
        }
        if(full){if(radius===2)broad++;else veryBroad++;}
      });
    });});
    ok(open.length/(game.width*game.height)<.45, name+": fjords occupy less than 45% of the map");
    ok(broad/open.length<.025 && veryBroad===0, name+": almost all floor is narrow; no seven-hex-wide open basins");
    function reachable(passable) {
      var base=map.buildings[0], queue=[base], visited=new Set([HEX.key(base.col,base.row)]);
      for(var i=0;i<queue.length;i++)HEX.neighbors(queue[i].col,queue[i].row).forEach(function(p){
        var key=HEX.key(p.col,p.row);
        if(game.inBounds(p.col,p.row)&&!visited.has(key)&&passable(p)) {visited.add(key);queue.push(p);}
      });
      return visited;
    }
    ok(reachable(function(p){return map.grid[p.row][p.col]!=="M";}).size===open.length,
      name+": every fjord and factory belongs to the connected valley network");
    ["PANTHER","MULE","BISON"].forEach(function(id){
      var seen=reachable(function(p){return terrain.terrainCost(game.terrainAt(p.col,p.row),types[id].moveType,types[id])!==null;});
      ok(map.buildings.every(function(b){return seen.has(HEX.key(b.col,b.row));}),
        name+": "+id+" can reach every base and factory without crossing mountains");
    });
    var restored=ENGINE.Game.restore(new ENGINE.Game(map,{seed:6}).snapshot());
    ok(restored.units.length===6 && Object.values(restored.buildings).filter(function(b){return b.kind==="factory";}).length===expected,
      name+": the small starting armies and full factory network survive saving");
  });
};
