"use strict";
module.exports=function(ok){
  var maps=require("../js/data-ai-maps.js"),HEX=require("../js/hex.js"),map=maps[8];
  var width=map.grid[0].length,height=map.grid.length,cells=[];
  for(var row=0;row<height;row++)for(var col=0;col<width;col++)cells.push({col:col,row:row});
  function key(p){return HEX.key(p.col,p.row);}
  function at(p){return map.grid[p.row][p.col];}
  function ns(p){return HEX.neighbors(p.col,p.row).filter(function(n){return n.col>=0&&n.col<width&&n.row>=0&&n.row<height;});}
  function flood(start,passable){
    var q=[start],seen=new Set([key(start)]);
    for(var i=0;i<q.length;i++)ns(q[i]).forEach(function(p){if(!seen.has(key(p))&&passable(p)){seen.add(key(p));q.push(p);}});
    return seen;
  }
  var factories=map.buildings.filter(function(b){return b.owner===-1;});
  var stocked=factories.filter(function(b){return b.stored.some(function(t){return ["CHARLIE","KILROY"].includes(t);});});
  ok(stocked.length===11,"Part 9: eleven of 21 factories contain an infantry reserve");
  ok(stocked.every(function(b){return b.stored.filter(function(t){return ["CHARLIE","KILROY"].includes(t);}).length===1;})&&
    stocked.filter(function(b){return b.stored.includes("KILROY");}).length===2,
    "Part 9: each infantry cache has one capturer, nine Charlies and two Kilroys in total");
  ok(cells.filter(function(p){return p.col===0||p.col===width-1||p.row===0||p.row===height-1;}).every(function(p){return at(p)!=="M";}),
    "Part 9: the perimeter passage removes thick mountain bands at every edge");
  var depth=new Map(),queue=cells.filter(function(p){return at(p)!=="M";});
  queue.forEach(function(p){depth.set(key(p),0);});
  for(var i=0;i<queue.length;i++)ns(queue[i]).forEach(function(p){if(!depth.has(key(p))){depth.set(key(p),depth.get(key(queue[i]))+1);queue.push(p);}});
  ok(Math.max.apply(null,Array.from(depth.values()))<=2,"Part 9: no mountain hex is more than two steps from open land");
  var seen=new Set(),groups=[];
  cells.filter(function(p){return at(p)!=="M";}).forEach(function(p){
    if(seen.has(key(p)))return;var group=flood(p,function(n){return at(n)!=="M";});
    group.forEach(function(k){seen.add(k);});groups.push(group);
  });
  groups.sort(function(a,b){return b.size-a.size;});
  ok(groups.length===9&&groups.slice(1).every(function(g){return g.size===1&&Array.from(g).every(function(k){
    var xy=k.split(",").map(Number);return map.grid[xy[1]][xy[0]]===".";
  });}),"Part 9: eight isolated plain clearings accompany one connected fjord network");
  ok(groups[0].size>540,"Part 9: the connected passages cover substantially more of the board");
  var roads=cells.filter(function(p){return ["-","B"].includes(at(p));});
  ok(flood(roads[0],function(p){return ["-","B"].includes(at(p));}).size===roads.length,
    "Part 9: the road spine connects without routing through neutral factories");
  ok(roads.length<groups[0].size*.3,"Part 9: roads occupy less than 30% of the connected valley floor");
  function roadTriangles(m){
    var total=0;m.grid.forEach(function(row,r){row.split("").forEach(function(ch,c){
      if(ch!=="-")return;var ns=HEX.neighbors(c,r);
      ns.forEach(function(n,i){var next=ns[(i+1)%6];if(m.grid[n.row]&&m.grid[n.row][n.col]==="-"&&m.grid[next.row]&&m.grid[next.row][next.col]==="-")total++;});
    });});return total/3;
  }
  ok(roadTriangles(map)<=roadTriangles(maps[7])*.3,"Part 9: triangular road clusters are reduced by at least 70% from Part 8");
};
