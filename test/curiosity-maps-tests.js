"use strict";
module.exports=function(ok){
  var maps=require("../js/data-ai-maps.js").slice(10),HEX=require("../js/hex.js"),ENGINE=require("../js/engine.js");
  var terrain=require("../js/data-terrain.js"),types=require("../js/data-units.js").UNIT_TYPES;
  var names=["SWITCHBACK FJORDS","DELTA CROSSINGS","CALDERA CIRCUIT","FAULTLINE STEPS","POCKET SIEGE"];
  var extras=[["LENET","SLAGGER","HADRIAN"],["POLAR","LYNX","PELICAN"],["GRIZZLY","OCTOPUS","MULE"],
    ["GIANT","TITAN","SEEKER"],["POLAR","HADRIAN","PELICAN"]];
  var counts=[];
  ok(maps.length===5,"five separate curiosity maps occupy AI-made slots 11–15");
  maps.forEach(function(map,index){
    var game=new ENGINE.Game(map,{seed:11}),label="Part "+(index+11)+": ",cells=[];
    var factories=Object.values(game.buildings).filter(function(b){return b.kind==="factory";});
    var expected=[12,24,24,12,12][index],stocked=0,exits=[0,0,0],reserveTypes=new Set();
    function key(p){return HEX.key(p.col,p.row);}
    function at(p){return map.grid[p.row][p.col];}
    function rotate(p){return {col:41-p.col,row:19-p.row};}
    function ns(p){return HEX.neighbors(p.col,p.row).filter(function(n){return game.inBounds(n.col,n.row);});}
    for(var r=0;r<20;r++)for(var c=0;c<42;c++)cells.push({col:c,row:r});
    function flood(start,passable){
      var q=[start],seen=new Set([key(start)]);
      for(var i=0;i<q.length;i++)ns(q[i]).forEach(function(n){if(!seen.has(key(n))&&passable(n)){seen.add(key(n));q.push(n);}});
      return q;
    }
    function components(passable){
      var seen=new Set(),groups=[];
      cells.filter(passable).forEach(function(p){if(seen.has(key(p)))return;
        var group=flood(p,passable);group.forEach(function(n){seen.add(key(n));});groups.push(group);
      });return groups.sort(function(a,b){return b.length-a.length;});
    }
    ok(map.name===names[index]&&map.pack==="AI-made"&&game.width===42&&game.height===20,label+"correct named 42×20 entry");
    ok(JSON.stringify(map)===JSON.stringify(require("../"+map.source)),label+"built-in and downloadable versions agree");
    ok(factories.length===expected&&factories.every(function(b){return b.owner===-1;}),label+expected+" neutral factories");
    cells.forEach(function(p){
      var mate=rotate(p);
      ok(at(p)===at(mate),label+"rotated terrain matches at "+key(p));
      ok(JSON.stringify(ns(p).map(rotate).map(key).sort())===JSON.stringify(ns(mate).map(key).sort()),label+"rotation preserves actual hex adjacency");
    });
    map.buildings.forEach(function(b){
      var p=rotate(b),mate=map.buildings.find(function(n){return key(n)===key(p);});
      ok(mate&&mate.owner===(b.owner<0?-1:1-b.owner)&&mate.inventoryTheme===b.inventoryTheme&&
        JSON.stringify(mate.stored)===JSON.stringify(b.stored),label+"paired buildings have identical ordered inventories");
    });
    var roster=["CHARLIE","PANTHER","RABBIT"].concat(extras[index]).sort();
    [0,1].forEach(function(player){
      var army=game.units.filter(function(u){return u.player===player;}),base=map.buildings.find(function(b){return b.owner===player;});
      ok(JSON.stringify(army.map(function(u){return u.typeId;}).sort())===JSON.stringify(roster),label+"authored six-unit starter roster");
      ok(army.every(function(u){return HEX.distance(u.col,u.row,base.col,base.row)===1;}),label+"formation surrounds its camp");
    });
    function moves(u,transform){return Object.values(game.movementRange(u)).map(function(p){return [key(transform?rotate(p):p),p.cost,p.stop,p.canStop,!!p.load,!!p.enterBuilding];}).sort(function(a,b){return a[0].localeCompare(b[0]);});}
    game.units.filter(function(u){return u.player===0;}).forEach(function(u){
      var p=rotate(u),mate=game.units.find(function(n){return n.player===1&&key(n)===key(p);});
      ok(mate&&mate.typeId===u.typeId&&JSON.stringify(moves(u,true))===JSON.stringify(moves(mate,false)),label+"paired starters have identical legal moves and costs");
    });
    factories.forEach(function(b){
      var dirs=[];HEX.neighbors(b.col,b.row).forEach(function(p,i){if(at(p)==="-")dirs.push(i);});
      exits[dirs.length-1]++;b.owner=0;
      ok(dirs.length>=1&&dirs.length<=3&&ns(b).every(function(p){return ["M","-"].includes(at(p));}),label+"real mouths are bounded by mountain caps");
      ok(dirs.some(function(start){return dirs.every(function(d){return (d-start+6)%6<dirs.length;});}),label+"mouths face into a single approach");
      ok(b.stored.length>=4&&b.stored.length<=8&&new Set(b.stored.map(function(u){return u.typeId;})).size<=5&&
        b.stored.filter(function(u){return u.type.cls==="artillery";}).length<=2,label+"focused 4–8-unit stocks with no excessive artillery");
      var infantry=b.stored.filter(function(u){return u.type.cls==="infantry";});
      if(infantry.length)stocked++;
      ok(infantry.length<=1&&infantry.every(function(u){return ["CHARLIE","KILROY"].includes(u.typeId);}),label+"only one Charlie or Kilroy may join a reserve team");
      b.stored.forEach(function(u,i){
        u.player=0;reserveTypes.add(u.typeId);
        ok(u.type.moveType!=="air"||u.typeId==="PELICAN",label+"only Pelicans may fly");
        ok(game.deployTargets(b,u).length===dirs.length,label+"every reserve has the actual advertised exit count");
        if(u.type.placeByTransport){var carrier=b.stored[i-1];ok(carrier&&["MULE","PELICAN"].includes(carrier.typeId)&&game.canLoad(carrier,u,true),label+"immobile reserve immediately follows its own compatible carrier");}
      });
    });
    ok(exits.every(function(n){return n===expected/3;})&&stocked===expected/2,label+"equal exit groups and infantry in exactly half the factories");
    Object.keys(types).filter(function(id){return !["EAGLE","FALCON","HUNTER","PANTHER"].includes(id);}).forEach(function(id){ok(reserveTypes.has(id),label+"factory coverage includes "+id);});
    ["PANTHER","MULE","GIANT"].forEach(function(id){
      var seen=new Set(flood(map.buildings[0],function(p){return at(p)!=="F"&&terrain.terrainCost(game.terrainAt(p.col,p.row),types[id].moveType,types[id])!==null;}).map(key));
      ok(map.buildings.every(function(b){return at(b)==="B"?seen.has(key(b)):ns(b).some(function(p){return at(p)==="-"&&seen.has(key(p));});}),label+id+" can reach every camp and factory mouth without crossing neutral factories");
    });
    var floor=components(function(p){return !["M","v","F"].includes(at(p));});
    var islands=components(function(p){return at(p)==="M";}).filter(function(g){return g.every(function(p){return p.col>0&&p.col<41&&p.row>0&&p.row<19;});});
    ok(islands.every(function(g){return g.length>=5;}),label+"interior mountain islands are at least five hexes");
    var pocketSizes=floor.slice(1).map(function(g){return g.length;});
    ok(JSON.stringify(pocketSizes)===JSON.stringify(index===2?[10]:index===4?[5,5]:[]),label+"only the intentional landing clearings are isolated");
    var rays=[];
    for(c=0;c<42;c++)[0,16].forEach(function(start){rays.push([0,1,2,3].map(function(d){return {col:c,row:start+d};}));});
    for(r=0;r<20;r++)[0,38].forEach(function(start){rays.push([0,1,2,3].map(function(d){return {col:start+d,row:r};}));});
    ok(rays.every(function(ray){return ray.some(function(p){return at(p)!=="M";});}),label+"edge mountains never exceed three hexes");
    var depth=new Map(),queue=cells.filter(function(p){return at(p)!=="M";});
    queue.forEach(function(p){depth.set(key(p),0);});
    for(var i=0;i<queue.length;i++)ns(queue[i]).forEach(function(p){if(!depth.has(key(p))){depth.set(key(p),depth.get(key(queue[i]))+1);queue.push(p);}});
    ok(Math.max.apply(null,Array.from(depth.values()))<=3,label+"no deep mountain masses remain");
    var roads=cells.filter(function(p){return ["-","=","B"].includes(at(p));});
    ok(flood(roads[0],function(p){return ["-","=","B"].includes(at(p));}).length===roads.length,label+"one road network joins both armies and every factory approach");
    var triangles=0;roads.forEach(function(p){var around=HEX.neighbors(p.col,p.row);around.forEach(function(n,i){var next=around[(i+1)%6];if(game.inBounds(n.col,n.row)&&game.inBounds(next.col,next.row)&&at(n)==="-"&&at(next)==="-"&&at(p)==="-")triangles++;});});
    ok(triangles/3<=20,label+"roads avoid dense two-dimensional patches");
    var tally={};cells.forEach(function(p){tally[at(p)]=(tally[at(p)]||0)+1;});counts.push(tally);
    if(index===1){
      var crossings=components(function(p){return at(p)==="=";});
      ok(crossings.length===3,label+"exactly three distinct bridge crossings");
      var noBridges=flood(map.buildings[0],function(p){return !["M","v","=","F"].includes(at(p));});
      ok(!noBridges.some(function(p){return key(p)===key(map.buildings[1]);}),label+"the river actually blocks ground travel except at bridges");
    }
    var restored=ENGINE.Game.restore(new ENGINE.Game(map,{seed:11}).snapshot());
    ok(restored.units.length===12&&Object.values(restored.buildings).filter(function(b){return b.kind==="factory";}).length===expected,label+"army and factory network survive save/restore");
  });
  ok(counts[2].w>counts[0].w*3&&counts[3].h>counts[0].h*1.5,"caldera wasteland and faultline hills create different movement tradeoffs");
  maps.forEach(function(a,i){maps.slice(i+1).forEach(function(b){
    var different=0;a.grid.forEach(function(row,r){row.split("").forEach(function(ch,c){if((ch==="M")!==(b.grid[r][c]==="M"))different++;});});
    ok(different>840*.2,a.name+" and "+b.name+" differ in at least 20% of mountain placement");
  });});
};
