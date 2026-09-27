"use strict";
module.exports = function(ok) {
  var R=require("../js/render.js"),T=require("../js/legacy-terrain.js"),H=require("../js/hex.js");
  var oldStyle=R.getStyle(),oldSet=R.getIconSet();R.setStyle("pixel");R.setIconSet("legacy");
  var g={width:9,height:8,inBounds:function(c,r){return c>=0&&c<9&&r>=0&&r<8;}};
  var raster={},ctx={fillRect:function(x,y,w,h){
    if(![x,y,w,h].every(Number.isInteger))throw Error("Terrain must draw on integer pixel boundaries");
    for(var yy=y;yy<y+h;yy++)for(var xx=x;xx<x+w;xx++)raster[xx+","+yy]=this.fillStyle;
  }};
  var renderer=new R.Renderer({width:800,height:600,getContext:function(){return ctx;}},g);
  [0.15,0.35,1,1.15,2,4].forEach(function(z){renderer.zoom=z;renderer.originX=40.3;renderer.originY=30.7;
    for(var c=0;c<9;c++)for(var r=0;r<8;r++) {
      var p=renderer.hexCenter(c,r);
      [[0,0],[20,0],[-20,0],[0,14],[0,-14],[8,12],[-8,-12]].forEach(function(d){
        var hit=renderer.pixelToHex(p.x+d[0]*z,p.y+d[1]*z);
        ok(hit&&hit.col===c&&hit.row===r,"Legacy hit testing agrees with flattened visible hex at "+z);
      });
    }
    ok(renderer.pixelToHex(-1000,-1000)===null,"outside map cannot select a cell");
  });
  ok(renderer.mapDimensions().width===304&&renderer.mapDimensions().height===272,"Legacy map bounds use 48x32 hexes with 32px pitch");
  ok(renderer.minimumZoom()<=0.2,"Legacy permits overview zoom below native size");
  var origin=renderer.hexCenter(2,2);
  H.neighbors(2,2).forEach(function(n,i){var p=renderer.hexCenter(n.col,n.row);
    ok((p.x-origin.x)/renderer.zoom===T.offsets[i][0]&&(p.y-origin.y)/renderer.zoom===T.offsets[i][1],"terrain edge direction matches logical neighbor "+i);
  });
  // The turned layout is the same hex after the board's quarter turn, with the
  // art kept upright.
  ["plain","road","waste","hill","mountain","valley","bridge","factory","base"].forEach(function(id){
    var t=T.tile(id,Array(6).fill(id),3,0),turned=T.tile(id,Array(6).fill(id),3,0,true);
    ok(t.width===48&&t.height===32&&t.pixels.some(Boolean),id+" uses native tile size");
    ok(t.pixels.every(function(v,i){var x=i%48+.5-24,y=Math.floor(i/48)+.5-16;return Boolean(v)===(Math.abs(x)+Math.abs(y)<=24);}),id+" exactly fills its flattened hex mask");
    ok(turned.width===32&&turned.height===48&&turned.pixels.every(function(v,i){
      var x=i%32+.5-16,y=Math.floor(i/32)+.5-24;return Boolean(v)===(Math.abs(x)+Math.abs(y)<=24);}),
      id+" turned tile exactly fills the quarter-turned hex");
    T.draw(ctx,50.3,50.7,1.15,id,Array(6).fill(id),3,0);
  });
  // Every interior pixel is covered: flattened tiles must meet without cracks.
  raster={};for(var c=0;c<5;c++)for(var r=0;r<5;r++)T.draw(ctx,24+c*32,16+r*32+(c&1)*16,1,"plain",[],0,-1);
  var gaps=0;for(var y=32;y<144;y++)for(var x=32;x<144;x++)if(!raster[x+","+y])gaps++;
  ok(gaps===0,"adjacent Legacy tiles cover the interior without cracks");
  raster={};for(c=0;c<5;c++)for(r=0;r<5;r++)T.draw(ctx,200-r*32-(c&1)*16,24+c*32,1,"plain",[],0,-1,null,true);
  gaps=0;for(y=56;y<128;y++)for(x=88;x<168;x++)if(!raster[x+","+y])gaps++;
  ok(gaps===0,"adjacent turned Legacy tiles cover the interior without cracks");
  // An isolated road exits toward each specified neighbor, never another edge.
  T.offsets.forEach(function(p,i){var ns=Array(6).fill("plain");ns[i]="road";
    var t=T.tile("road",ns,0,-1),x=Math.floor(24+p[0]*.47),y=Math.floor(16+p[1]*.47);
    x=Math.max(0,Math.min(47,x));y=Math.max(0,Math.min(31,y));
    ok([8,9].indexOf(t.pixels[y*48+x])>=0,"road reaches neighbor edge "+i);
  });
  T.layouts.turned.offsets.forEach(function(p,i){var ns=Array(6).fill("plain");ns[i]="road";
    var t=T.tile("road",ns,0,-1,true),x=Math.floor(16+p[0]*.47),y=Math.floor(24+p[1]*.47);
    x=Math.max(0,Math.min(31,x));y=Math.max(0,Math.min(47,y));
    ok([8,9].indexOf(t.pixels[y*32+x])>=0,"turned road reaches neighbor edge "+i);
  });
  // A turned board draws upright turned tiles; it never rotates the picture.
  var one={width:1,height:1,inBounds:function(c,r){return !c&&!r;},
    terrainAt:function(){return {id:"base"};},buildingAt:function(){return {owner:0};}};
  var upright=new R.Renderer({width:200,height:200,getContext:function(){return ctx;}},one);
  upright.sideways=true;upright.zoom=1;upright.originX=100;upright.originY=100;raster={};
  upright.drawTerrainHex(0,0);
  var base=T.tile("base",Array(6).fill(null),0,0,true),same=true;
  for(y=0;y<48;y++)for(x=0;x<32;x++)if(base.pixels[y*32+x]&&raster[(84+x)+","+(76+y)]!==T.palette[base.pixels[y*32+x]])same=false;
  ok(same,"a turned board draws the base's upright turned tile at its turned position");
  var blue=T.tile("base",[],0,0),green=T.tile("base",[],0,1);
  ok(blue.pixels.some(function(v,i){return v!==green.pixels[i];}),"capturing a Legacy building changes its ownership palette");
  // The base (a prison camp) and the factory are different buildings, not
  // one building in two colours.
  [-1,0,1].forEach(function(owner){[false,true].forEach(function(turned){
    var plain=T.tile("plain",Array(6).fill("plain"),0,-1,turned).pixels,painted=0,same=0;
    var base=T.tile("base",Array(6).fill("plain"),0,owner,turned).pixels,factory=T.tile("factory",Array(6).fill("plain"),0,owner,turned).pixels;
    plain.forEach(function(v,i){if(base[i]!==v||factory[i]!==v){painted++;if(base[i]===factory[i])same++;}});
    ok(painted>400&&same<painted/2,"base and factory differ in shape for owner "+owner+(turned?" on a turned board":""));
  });});
  function hasColor(t,c){return t.pixels.some(function(v){return T.palette[v]===c;});}
  ok(hasColor(T.tile("factory",[],0,-1),"#f8f070")&&!hasColor(T.tile("base",[],0,-1),"#f8f070"),
    "a neutral factory is yellow, as in the original, and a neutral base is not");
  R.setIconSet("remake");ok(renderer.minimumZoom()<=0.2,"Remake also permits the full-map overview");
  R.setIconSet(oldSet);R.setStyle(oldStyle);
};
