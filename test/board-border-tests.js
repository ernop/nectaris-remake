"use strict";
module.exports=function(ok) {
  var T=require("../js/legacy-terrain.js"),R=require("../js/render.js");
  var oldStyle=R.getStyle(),oldSet=R.getIconSet();R.setStyle("pixel");R.setIconSet("legacy");
  var pixels={},background="#181510",rim="#55463f";
  var ctx={save:function(){},restore:function(){},fillRect:function(x,y,w,h){
    for(var yy=y;yy<y+h;yy++)for(var xx=x;xx<x+w;xx++)pixels[xx+","+yy]=this.fillStyle;
  }};
  ["plain","waste","hill","mountain","valley","road","bridge","base","factory"].forEach(function(id){
    [1,2,5,6].forEach(function(width){[1,4].forEach(function(height){
      var g={width:width,height:height,
        inBounds:function(c,r){return c>=0&&r>=0&&c<width&&r<height;},
        terrainAt:function(){return {id:id};},buildingAt:function(){return null;}};
      var renderer=new R.Renderer({width:300,height:220,getContext:function(){return ctx;}},g);
      renderer.originX=40;renderer.originY=40;pixels={};
      renderer.drawTerrainLayer({minCol:0,maxCol:width-1,minRow:0,maxRow:height-1});
      var dims=renderer.mapDimensions(),shape=true,scenery=true;
      for(var y=0;y<dims.height;y++)for(var x=0;x<dims.width;x++) {
        var qx=Math.max(8-x-.5,0,x+.5-(dims.width-8));
        var qy=Math.max(8-y-.5,0,y+.5-(dims.height-8));
        var color=pixels[(16+x)+","+(24+y)];
        if((color!==background)!==(qx*qx+qy*qy<=64))shape=false;
        if((id==="road"||id==="base"||id==="factory")&&color!==background&&color!==rim&&
          !renderer.pixelToHex(16+x+.5,24+y+.5)) {
          var value=T.palette.indexOf(color);if(value<1||value>4)scenery=false;
        }
      }
      ok(shape,id+" "+width+"x"+height+" fills one continuous rounded board frame");
      ok(scenery,id+" margin never duplicates a building or invents a road exit");
    });});
  });
  // Nothing in the playable interior is resampled by the border pass.
  pixels={};var unchanged=true,calls=0;
  T.drawBoardBorder(ctx,{columns:6,rows:4,scale:1,left:0,top:0,screenWidth:300,screenHeight:220},
    function(){calls++;return T.tile("waste",[],0,-1);});
  Object.keys(pixels).forEach(function(p){var xy=p.split(",").map(Number);
    if(xy[0]>=16&&xy[0]<192&&xy[1]>=16&&xy[1]<128)unchanged=false;
  });
  ok(unchanged&&calls>0,"board edging paints only the perimeter, preserving interior terrain pixels");
  pixels={};calls=0;
  T.drawBoardBorder(ctx,{columns:65,rows:49,scale:1,left:-900,top:-700,screenWidth:300,screenHeight:220},
    function(){calls++;return T.tile("plain",[],0,-1);});
  ok(calls===0&&Object.keys(pixels).length===0,"off-screen board edges do no texture or canvas work");
  R.setIconSet(oldSet);R.setStyle(oldStyle);
};
