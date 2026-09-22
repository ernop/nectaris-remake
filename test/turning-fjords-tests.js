"use strict";
module.exports=function(ok){
  var map=require("../js/data-ai-maps.js")[9],HEX=require("../js/hex.js");
  var types=require("../js/data-units.js").UNIT_TYPES,cells=[];
  var width=map.grid[0].length,height=map.grid.length;
  for(var r=0;r<height;r++)for(var c=0;c<width;c++)cells.push({col:c,row:r});
  function key(p){return HEX.key(p.col,p.row);}
  function at(p){return map.grid[p.row][p.col];}
  function ns(p){return HEX.neighbors(p.col,p.row).filter(function(n){return n.col>=0&&n.col<width&&n.row>=0&&n.row<height;});}
  function flood(start,passable){
    var q=[start],seen=new Set([key(start)]);
    for(var i=0;i<q.length;i++)ns(q[i]).forEach(function(p){if(!seen.has(key(p))&&passable(p)){seen.add(key(p));q.push(p);}});
    return q;
  }
  function components(mountain){
    var seen=new Set(),groups=[];
    cells.filter(function(p){return (at(p)==="M")===mountain;}).forEach(function(p){
      if(seen.has(key(p)))return;
      var group=flood(p,function(n){return (at(n)==="M")===mountain;});
      group.forEach(function(n){seen.add(key(n));});groups.push(group);
    });
    return groups.sort(function(a,b){return b.length-a.length;});
  }
  var factories=map.buildings.filter(function(b){return b.owner===-1;});
  var infantry=factories.filter(function(b){return b.stored.some(function(t){return ["CHARLIE","KILROY"].includes(t);});});
  ok(infantry.length===12&&infantry.every(function(b){return b.stored.filter(function(t){return ["CHARLIE","KILROY"].includes(t);}).length===1;}),
    "Part 10: exactly half the factories have one infantry reserve");
  ok(infantry.filter(function(b){return b.stored.includes("KILROY");}).length===4,
    "Part 10: eight Charlie reserves and four Kilroy reserves");
  var reserves=new Set(factories.flatMap(function(b){return b.stored;}));
  Object.keys(types).filter(function(id){return !["EAGLE","FALCON","HUNTER","PANTHER"].includes(id);}).forEach(function(id){
    ok(reserves.has(id),"Part 10: the factory teams include "+id);
  });
  var rays=[];
  for(c=0;c<width;c++)[0,height-4].forEach(function(start){rays.push([0,1,2,3].map(function(d){return {col:c,row:start+d};}));});
  for(r=0;r<height;r++)[0,width-4].forEach(function(start){rays.push([0,1,2,3].map(function(d){return {col:start+d,row:r};}));});
  ok(rays.every(function(ray){return ray.some(function(p){return at(p)!=="M";});}),
    "Part 10: mountain bands at every edge are at most three hexes thick");
  var depth=new Map(),queue=cells.filter(function(p){return at(p)!=="M";});
  queue.forEach(function(p){depth.set(key(p),0);});
  for(var i=0;i<queue.length;i++)ns(queue[i]).forEach(function(p){if(!depth.has(key(p))){depth.set(key(p),depth.get(key(queue[i]))+1);queue.push(p);}});
  ok(Math.max.apply(null,Array.from(depth.values()))<=3,"Part 10: mountain interiors remain within three steps of land");
  var islands=components(true).filter(function(group){return group.every(function(p){return p.col>0&&p.col<width-1&&p.row>0&&p.row<height-1;});});
  ok(islands.length>=4&&islands.every(function(group){return group.length>=5;}),
    "Part 10: every interior mountain island contains at least five hexes");
  var floors=components(false);
  ok(floors.length===5&&floors.slice(1).every(function(group){return group.length===5&&group.every(function(p){return at(p)===".";});}),
    "Part 10: four isolated five-hex plain clearings complement the connected fjords");
  var roads=cells.filter(function(p){return ["-","B"].includes(at(p));});
  ok(flood(roads[0],function(p){return ["-","B"].includes(at(p));}).length===roads.length&&roads.length<floors[0].length*.3,
    "Part 10: connected roads use less than 30% of the main valley floor");
  var triangles=0;
  roads.filter(function(p){return at(p)==="-";}).forEach(function(p){
    var around=HEX.neighbors(p.col,p.row);
    around.forEach(function(n,i){var next=around[(i+1)%6];if(map.grid[n.row]&&map.grid[n.row][n.col]==="-"&&map.grid[next.row]&&map.grid[next.row][next.col]==="-")triangles++;});
  });
  ok(triangles/3<=20,"Part 10: dense triangular road patches stay occasional");
};
