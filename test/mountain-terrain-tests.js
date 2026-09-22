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

  // The board ends the plateau; it is not low ground beyond a cliff.
  // Check every combination of exposed edges with real low ground on the
  // remaining sides, including isolated edge peaks and corner mountains.
  var midpoints=[[16,8],[16,-8],[0,-16],[-16,-8],[-16,8],[0,16]];
  for(var mask=1;mask<64;mask++) {
    var ns=T.offsets.map(function(_,i){return mask&(1<<i)?null:"plain";});
    var tile=T.tile("mountain",ns,0,-1),solid=true;
    midpoints.forEach(function(p,i){if(!(mask&(1<<i)))return;
      // Follow the plateau to each exposed side; no ground or transparency
      // may suggest a way around the mountain within the playable hex.
      for(var step=.5;step<1;step+=.05) {
        var x=Math.floor(24+p[0]*step),y=Math.floor(16+p[1]*step);
        if(tile.pixels[y*48+x]<13)solid=false;
      }
    });
    ok(solid,"plateau reaches every exposed edge for boundary mask "+mask);
  }
  var R=require("../js/render.js"),oldStyle=R.getStyle(),oldSet=R.getIconSet();
  R.setStyle("pixel");R.setIconSet("legacy");
  ctx.save=function(){};ctx.restore=function(){};
  [1,2,5,6].forEach(function(width){[1,4].forEach(function(height){
    var g={width:width,height:height,
      inBounds:function(c,r){return c>=0&&r>=0&&c<width&&r<height;},
      terrainAt:function(){return {id:"mountain"};},buildingAt:function(){return null;}};
    var renderer=new R.Renderer({width:300,height:220,getContext:function(){return ctx;}},g);
    renderer.originX=40;renderer.originY=40;
    raster={};
    renderer.drawTerrainLayer({minCol:0,maxCol:width-1,minRow:0,maxRow:height-1});
    var visible=Object.keys(raster).filter(function(p){return raster[p]!=="#181510";});
    ok(visible.length>0&&visible.every(function(p){var v=T.palette.indexOf(raster[p]);return v===13||v===14;}),
      width+"x"+height+" mountain board has no outer slope, ground strip or tapered corners");
    ok(visible.every(function(p){var xy=p.split(",").map(Number);
      return renderer.pixelToHex(xy[0]+.5,xy[1]+.5)!==null;
    }),"mountain art ends at the actual board boundary on "+width+"x"+height);
    ok(H.neighbors(0,0).filter(function(n){return !g.inBounds(n.col,n.row);}).every(function(n){
      var p=renderer.hexCenter(n.col,n.row);return renderer.pixelToHex(p.x,p.y)===null;
    }),"plateau continuation adds no selectable hexes on "+width+"x"+height);
  });});
  ok(!T.tile("void",Array(6).fill(null),0,-1).pixels.some(Boolean),"empty board border remains transparent");
  R.setIconSet(oldSet);R.setStyle(oldStyle);
};
