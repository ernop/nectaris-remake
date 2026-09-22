"use strict";
module.exports = function(ok) {
  var maps=require("../js/data-ai-maps.js"), HEX=require("../js/hex.js"), ENGINE=require("../js/engine.js");
  var extras=["BISON","HADRIAN","POLAR"], original=["CHARLIE","PANTHER","RABBIT"];
  [6,7,8,9].forEach(function(index) {
    var map=maps[index], width=map.grid[0].length, height=map.grid.length;
    function opposite(p) {return {col:width-1-p.col,row:index===6 || index===9 ? height-1-p.row : p.row};}
    var army=map.units.filter(function(u){return u.o===0;});
    ok(JSON.stringify(army.filter(function(u){return !original.includes(u.t);}).map(function(u){return u.t;}).sort())===JSON.stringify(index===9 ? ["OCTOPUS","SLAGGER","TITAN"] : extras),
      map.name+": exactly three fixed reinforcements in the authored roster");
    army.forEach(function(u) {
      var p=opposite({col:u.x,row:u.y});
      ok(map.units.some(function(v){return v.o===1 && v.t===u.t && v.x===p.col && v.y===p.row;}),
        map.name+": both sides have the same unit in the corresponding formation position");
      ok(map.grid[u.y][u.x]===map.grid[p.row][p.col], map.name+": paired starting units have identical terrain");
    });
  });

  [7,8,9].forEach(function(index){
  var map=maps[index], game=new ENGINE.Game(map,{seed:8});
  function mirror(p) {return {col:game.width-1-p.col,row:index===9 ? game.height-1-p.row : p.row};}
  function key(p) {return HEX.key(p.col,p.row);}
  map.grid.forEach(function(row,r){row.split("").forEach(function(ch,c){
    var p=mirror({col:c,row:r});
    ok(map.grid[p.row][p.col]===ch, map.name+": every terrain hex matches its symmetric counterpart");
    var actual=HEX.neighbors(p.col,p.row).filter(function(n){return game.inBounds(n.col,n.row);}).map(key).sort();
    var expected=HEX.neighbors(c,r).filter(function(n){return game.inBounds(n.col,n.row);}).map(mirror).map(key).sort();
    ok(JSON.stringify(actual)===JSON.stringify(expected), map.name+": symmetry preserves hex adjacency even at the map edges");
  });});
  map.buildings.forEach(function(b){
    var p=mirror(b), mate=map.buildings.find(function(n){return n.col===p.col && n.row===p.row;});
    ok(mate && mate.owner===(b.owner<0 ? -1 : 1-b.owner) &&
      JSON.stringify(mate.stored)===JSON.stringify(b.stored) && mate.inventoryTheme===b.inventoryTheme,
      map.name+": paired buildings match ownership, inventory order and team theme");
  });
  var shared=map.buildings.filter(function(b){return b.col===Math.floor(game.width/2) && b.owner===-1 && index!==9;});
  ok(shared.length===(index===9 ? 0 : 3), map.name+": the authored paired or shared factory arrangement");
  shared.forEach(function(b){
    var camps=map.buildings.filter(function(n){return n.owner>=0;});
    ok(HEX.distance(b.col,b.row,camps[0].col,camps[0].row)===HEX.distance(b.col,b.row,camps[1].col,camps[1].row),
      map.name+": shared factories are equally distant from both home camps");
  });
  // Verify gameplay costs and destinations, not only the visual terrain.
  function moves(unit, transform) {
    return Object.values(game.movementRange(unit)).map(function(p){
      var target=transform ? mirror(p) : p;
      return [key(target),p.cost,p.stop,p.canStop,!!p.load,!!p.enterBuilding];
    }).sort(function(a,b){return a[0].localeCompare(b[0]);});
  }
  game.units.filter(function(u){return u.player===0;}).forEach(function(u){
    var p=mirror(u), mate=game.units.find(function(v){return v.player===1 && v.col===p.col && v.row===p.row;});
    ok(mate && JSON.stringify(moves(u,true))===JSON.stringify(moves(mate,false)),
      map.name+": "+u.typeId+" has identical opening movement costs and destinations on both sides");
  });
  });
};
