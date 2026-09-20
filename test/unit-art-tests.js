"use strict";

module.exports = function (ok) {
  var RENDER = require("../js/render.js");
  var source = require("../art/units/pixel-art.js");
  var types = require("../js/data-units.js").UNIT_TYPES;
  var previousStyle = RENDER.getStyle();
  var previousSet = RENDER.getIconSet();
  RENDER.setStyle("pixel");
  RENDER.getIconSets().forEach(function (pack) {
  RENDER.setIconSet(pack.id);
  var art = pack.art;
  ok(art.frame === 32 && Object.keys(art.frames).length === 23, "all 23 stock units have native 32px art");
  var silhouettes = new Set();

  // Record actual integer raster coverage, including transforms and colours.
  function canvas(width, height) {
    var stack = [], ctx = {
      x: 0, y: 0, pixels: {}, filter: "none", fillStyle: "", imageSmoothingEnabled: true,
      save: function () { stack.push([this.x, this.y, this.fillStyle, this.filter]); },
      restore: function () { var s = stack.pop(); this.x=s[0]; this.y=s[1]; this.fillStyle=s[2]; this.filter=s[3]; },
      translate: function (x, y) { this.x+=x; this.y+=y; },
      scale: function () { throw new Error("Native art must never be scaled or mirrored"); },
      clearRect: function () { this.pixels={}; },
      fillRect: function (x, y, w, h) {
        x+=this.x; y+=this.y;
        if (![x,y,w,h].every(Number.isInteger)) throw new Error("Fractional native pixel");
        for (var j=y; j<y+h; j++) for (var i=x; i<x+w; i++) this.pixels[i+","+j]=this.fillStyle+"/"+this.filter;
      },
    };
    return { width:width, height:height, getContext:function () { return ctx; }, ctx:ctx };
  }
  function expected(rows, palette, dx, dy, filter) {
    var pixels={};
    rows.forEach(function (row,y) { row.split("").forEach(function (code,x) {
      if (code!==".") pixels[(x+dx)+","+(y+dy)]=palette[parseInt(code,16)]+"/"+(filter||"none");
    }); });
    return JSON.stringify(Object.entries(pixels).sort());
  }
  function raster(c) { return JSON.stringify(Object.entries(c.ctx.pixels).sort()); }

  Object.keys(types).forEach(function (id) {
    var mask=art.frames[id].right.join("").replace(/[^.]/g,"#");
    ok(!silhouettes.has(mask), id+" has a distinct opaque silhouette"); silhouettes.add(mask);
    ["right","left"].forEach(function (facing) {
      var rows=art.frames[id][facing], s=source.sprite(id,facing), xs=[],ys=[], count=0, safe=true;
      var regenerated=Array.from({length:32},function (_,y) {
        return Array.from(s.p.slice(y*32,y*32+32),function (v) { return v?v.toString(16):"."; }).join("");
      });
      if (pack.id === "remake") ok(JSON.stringify(rows)===JSON.stringify(regenerated), id+"/"+facing+" runtime data matches editable source");
      ok(rows.length===32 && rows.every(function (r) { return /^[.1-9a-f]{32}$/.test(r); }),id+"/"+facing+" has 32x32 valid indices");
      rows.forEach(function (row,y) { row.split("").forEach(function (v,x) {
        if (v===".") return;
        xs.push(x);ys.push(y);count++;
        var dx=Math.abs(x+.5-16),dy=Math.abs(y+.5-16);
        if (dx>14||dy>14||dx+dy>22) safe=false;
      }); });
      ok(count>0 && safe && Math.min.apply(null,xs)===31-Math.max.apply(null,xs),id+"/"+facing+" is centered with safe hex clearance");
      if (types[id].cls==="infantry") ok(Math.max.apply(null,ys)-Math.min.apply(null,ys)+1<=17 && count<=240,id+" stays small inside its frame");
      var player=facing==="left"?1:0, faction=player?"xenon":"union";
      var unit={id:id,typeId:id,type:types[id],player:player,col:1,row:1,strength:8,exp:0,cargo:[]};
      [32,96].forEach(function (size) {
        var c=canvas(size,size); RENDER.drawUnitIcon(c,unit);
        ok(raster(c)===expected(rows,art.palettes[faction],size/2-16,size/2-16),id+"/"+facing+" icon stays native in a "+size+"px slot");
      });
      var attack=canvas(32,32);RENDER.drawUnitIcon(attack,unit,{attacking:true});
      ok(raster(attack)===expected(rows,art.palettes.attack,0,0),id+"/"+facing+" uses attack palette");
      var spent=canvas(32,32);RENDER.drawUnitIcon(spent,unit,{spent:true});
      ok(raster(spent)===expected(rows,art.palettes[faction],0,0,"grayscale(1)"),id+"/"+facing+" desaturates completed icons");
      [0.65,1,1.25,1.5,2,4].forEach(function (zoom) {
        var c=canvas(800,600),r=new RENDER.Renderer(c,{currentPlayer:player});r.zoom=zoom;r.originX=40.3;r.originY=40.7;
        r.drawUnit(unit);var center=r.hexCenter(1,1);
        ok(raster(c)===expected(rows,art.palettes[faction],Math.round(center.x)-16,Math.round(center.y)-16),id+"/"+facing+" map art stays native and aligned at zoom "+zoom);
      });
    });
    var neutral=canvas(32,32);RENDER.drawUnitIcon(neutral,{typeId:id,type:types[id],player:-1});
    ok(raster(neutral)===expected(art.frames[id].right,art.palettes.neutral,0,0),id+" neutral factory inventory uses grey faction art");
  });
  var small=new RENDER.Renderer(canvas(240,160),{width:30,height:20});small.fitToMap();
  ok(small.zoom>=0.65 && small.panAxes().x && small.panAxes().y,"large maps scroll instead of overlapping fixed native units");
  });
  RENDER.setIconSet(previousSet);
  RENDER.setStyle(previousStyle);
};
