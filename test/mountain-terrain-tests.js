"use strict";
module.exports = function(ok) {
  var T=require("../js/legacy-terrain.js"),H=require("../js/hex.js"),raster={};
  var ctx={fillRect:function(x,y,w,h){
    for(var yy=y;yy<y+h;yy++)for(var xx=x;xx<x+w;xx++)raster[xx+","+yy]=this.fillStyle;
  }};
  // Include neighboring plains: cliff skirts cross their corners and must
  // not reset at each mountain hex boundary, for either column stagger.
  [2,3].forEach(function(column){
    raster={};
    function terrain(c,r){return c===column&&r>=1&&r<=5?"mountain":"plain";}
    for(var r=0;r<7;r++)for(var c=0;c<7;c++)T.draw(ctx,24+c*32,16+r*32+(c&1)*16,1,
      terrain(c,r),H.neighbors(c,r).map(function(n){return terrain(n.col,n.row);}),(c*3+r*7)%8,-1);
    function cliffRow(y){var row=[];for(var x=0;x<240;x++){
      var v=T.palette.indexOf(raster[x+","+y]);row.push(v>=11&&v<=14?v:0);
    }return row;}
    var expected=cliffRow(112),continuous=true;
    for(var y=80;y<160;y++)if(cliffRow(y).join(",")!==expected.join(","))continuous=false;
    ok(continuous,"vertical mountain silhouette and cliff bands stay continuous in column parity "+(column&1));
    ok([11,12,13,14].every(function(v){return expected.indexOf(v)>=0;}),"vertical range retains every stepped cliff shade");
  });
  // Skirts only decorate tile edges; even an enclosed plain keeps a clear
  // playable center. Check every neighbor mask, including isolated peaks.
  var clearCenters=true;
  for(var mask=0;mask<64;mask++){
    var ns=T.offsets.map(function(_,i){return mask&(1<<i)?"mountain":"plain";});
    var plain=T.tile("plain",ns,0,-1);
    for(var y=12;y<20;y++)for(var x=20;x<28;x++)if(plain.pixels[y*48+x]>4)clearCenters=false;
  }
  ok(clearCenters,"mountain skirts preserve neighboring plain centers for every connection mask");
  var roadNs=["road","mountain","mountain","road","mountain","mountain"];
  var withMountains=T.tile("road",roadNs,0,-1);
  var withoutMountains=T.tile("road",roadNs.map(function(n){return n==="mountain"?"plain":n;}),0,-1);
  ok(withoutMountains.pixels.every(function(v,i){return (v!==8&&v!==9)||withMountains.pixels[i]===v;}),"road surfaces remain visible above mountain skirts");
};
