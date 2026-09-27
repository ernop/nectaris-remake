"use strict";
var assert = require("node:assert/strict"), fs = require("node:fs");
var source = fs.readFileSync(require.resolve("../js/legacy-terrain.js"), "utf8");
var freshTerrain = new Function("module", source + "\nreturn LEGACY_TERRAIN;");

module.exports = function (ok) {
  var terrain = freshTerrain({exports: {}}), neighbors = ["plain", "road", "factory", "hill", "valley", null];
  // Captured 2026-09-27 from the original-style art with continuous
  // riverbeds and the original's base and factory, in the flat and turned
  // layouts. Any intended art change must
  // re-capture it; an optimization must not. Protects every mountain mask and
  // texture.
  var digest=require("node:crypto").createHash("sha256");
  [false,true].forEach(function(turned){
    ["plain","hill","mountain","road","valley","bridge","waste","base","factory","void"].forEach(function(id){
      for(var mask=0;mask<64;mask++)for(var variant=0;variant<8;variant++) {
        var ns=Array.from({length:6},function(_,i){return mask&(1<<i)?"mountain":["road","hill","bridge","valley",null,"factory"][(i+variant)%6];});
        digest.update(terrain.tile(id,ns,variant,variant%3-1,turned).pixels);
      }
    });
  });
  assert.equal(digest.digest("hex"),"d4babd8ac09cc38cf1d6f7cf476efaebcf3683bf8924cf7aaecc2ca672bc6d2e");
  ok(true,"10,240 flat and turned terrain samples exactly match the recorded pixel checksum");
  // Compare shared-cache output with independently generated tiles. Neighbor
  // names that share a cache entry must have identical visual connections.
  var rng = require("../js/combat.js").makeRng(90137);
  var types = ["plain", "waste", "mountain", "hill", "valley", "road", "bridge", "base", "factory", "void"];
  for (var trial = 0; trial < 160; trial++) {
    var ns = neighbors.map(function () { return rng() < .15 ? null : types[Math.floor(rng() * 9)]; });
    types.forEach(function (type) {
      var variant = trial % 8, owner = trial % 3 - 1, turned = trial % 2 === 1;
      var expected = freshTerrain({exports: {}}).tile(type, ns, variant, owner, turned);
      assert.deepEqual(terrain.tile(type, ns, variant, owner, turned).pixels, expected.pixels);
    });
  }
  var plain = terrain.tile("plain", neighbors, 2, -1);
  // Valley banks cross into neighbours, and a bridge spans a valley.
  assert.equal(plain, terrain.tile("plain", ["hill", "base", "road", "waste", "bridge", "plain"], 2, 1));
  var edge = terrain.tile("mountain", [null, null, null, null, null, null], 2, -1);
  assert.notDeepEqual(edge.pixels, terrain.tile("mountain", Array(6).fill("plain"), 2, -1).pixels);
  ok(true, "terrain cache preserves independently generated topology, border and ownership pixels");

  // Keep a hot tile alive while more than a full cache of other tiles passes.
  var hot = terrain.tile("plain", neighbors, 9999, -1);
  for (var i = 0; i < 1200; i++) {
    terrain.tile("plain", neighbors, i, -1);
    assert.equal(terrain.tile("plain", neighbors, 9999, -1), hot);
  }
  ok(true, "terrain LRU preserves hot tiles when capacity is exceeded");

  // Differential software raster tests: fractional boundaries, transparent
  // overlap, negative origins and clipping at all four viewport edges.
  var reference = new Uint32Array(180*140);
  var ctx = {createImageData: function(w,h) { return {data: new Uint8ClampedArray(w*h*4)}; },
    fillRect: function(x,y,width,height) {
      var rgb=parseInt(this.fillStyle.slice(1),16);
      var word=new Uint32Array(new Uint8Array([rgb>>16,rgb>>8&255,rgb&255,255]).buffer)[0];
      var x0=Math.max(0,Math.min(180,x)),x1=Math.max(0,Math.min(180,x+width));
      for(var row=Math.max(0,y);row<Math.min(140,y+height);row++)reference.fill(word,row*180+x0,row*180+x1);
    }
  };
  var frame=new terrain.Frame(ctx,180,140),buffer=frame.image;
  var scales=[.18,.25,.35,.5,.65,1,1.15,1.5,2,2.5,3.2];
  for(var scene=0;scene<200;scene++) {
    ctx.fillStyle="#181510";ctx.fillRect(0,0,180,140);frame.clear();
    for(var layer=0;layer<5;layer++) {
      var args=[ctx,rng()*280-50,rng()*240-50,scales[scene%scales.length],types[(scene+layer)%types.length],neighbors,scene%8,scene%3-1];
      var turned=(scene+layer)%2===1;
      terrain.draw.apply(null,args.concat(null,turned));
      terrain.draw.apply(null,args.concat(frame,turned));
    }
    assert.deepEqual(frame.words,reference,"pixel scene "+scene);
    assert.equal(frame.image,buffer,"reuse the viewport buffer between camera changes");
  }
  ok(true, "200 layered raster scenes preserve rounded pixels and clipping while reusing one viewport buffer");

};
if (require.main === module) module.exports(function (condition, message) { assert.ok(condition); console.log("PASS: " + message); });
