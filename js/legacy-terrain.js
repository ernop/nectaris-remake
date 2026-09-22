/* Original-style terrain, authored on a 48x32 pixel grid from visual references.
 * This is a reconstruction, not an extracted original-game tile atlas. */
"use strict";
var LEGACY_TERRAIN = (function () {
  var palette = [null,"#390a12","#551d26","#71343b","#93545a",
    "#302a2c","#50504c","#747770","#969a90","#c3c7bc","#e2e5d8",
    "#624348","#876164","#a88081","#c39c9b","#100c12",
    "#28212a","#49404a","#7a6268","#fff9e5","#215783","#48a8c1",
    "#24562c","#77a753","#65716c"];
  var cache = new Map(), mountainShapes = new Map();
  // Interpret RGBA bytes through a Uint32 view so this also works on a
  // big-endian host. Each run writes one opaque palette color at a time.
  var colorWords = {};
  palette.concat(["#181510"]).forEach(function (color) {
    if (!color) return;
    var rgb = parseInt(color.slice(1), 16);
    colorWords[color] = new Uint32Array(new Uint8Array([rgb >> 16, rgb >> 8 & 255, rgb & 255, 255]).buffer)[0];
  });
  // Same order as HEX.neighbors, expressed on the flattened source grid.
  var offsets = [[32,16],[32,-16],[0,-32],[-32,-16],[-32,16],[0,32]];
  function hash(x,y,seed) {
    var h=Math.imul(x+seed*17,374761393)^Math.imul(y+seed*43,668265263);
    h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;
  }
  function segmentDistance(x,y,dx,dy) {
    var t=Math.max(0,Math.min(1,(x*dx+y*dy)/(dx*dx+dy*dy)));
    return Math.hypot(x-t*dx,y-t*dy);
  }
  function connects(id) {return ["road","bridge","base","factory"].indexOf(id)>=0;}
  function mountainShape(mask) {
    if(mountainShapes.has(mask))return mountainShapes.get(mask);
    // Sample the same mountain range on both sides of a tile boundary. Its
    // rounded skirt can reach into a neighboring tile's corner; clipping it
    // to mountain hexes cuts a triangular notch into every vertical join.
    var peaks=mask&64?[[0,0]]:[],ridges=[],pixels=new Uint8Array(48*32);
    offsets.forEach(function(p,i){if(mask&(1<<i))peaks.push(p);});
    peaks.forEach(function(a,i){peaks.slice(i+1).forEach(function(b){
      if(offsets.some(function(p){return b[0]-a[0]===p[0]&&b[1]-a[1]===p[1];}))ridges.push([a,b]);
    });});
    if(mask)for(var y=0;y<32;y++)for(var x=0;x<48;x++) {
      var dx=x+.5-24,dy=y+.5-16,d=Infinity;
      if(Math.abs(dx)+Math.abs(dy)>24)continue;
      peaks.forEach(function(p){d=Math.min(d,Math.hypot((dx-p[0])*.8,(dy-p[1])*1.15));});
      ridges.forEach(function(pair){var a=pair[0],b=pair[1];
        d=Math.min(d,segmentDistance((dx-a[0])*.8,(dy-a[1])*1.15,(b[0]-a[0])*.8,(b[1]-a[1])*1.15));
      });
      if(d<17)pixels[y*48+x]=d>14?11:d>11?12:d>8?13:14;
    }
    // Only 128 center/neighbor masks, reused across terrain types and textures.
    mountainShapes.set(mask,pixels);return pixels;
  }
  function tile(id, neighbors, variant, owner) {
    // Only visual connections belong in the key. A plain next to a road
    // has the same pixels as a plain next to a factory, for example. Full
    // neighbor names exceeded the old cache on the large fjord maps.
    var mountainMask=id==="mountain"?64:0, hillMask=0, valleyMask=0, roadMask=0, edgeMask=0;
    neighbors.forEach(function(n,i) {
      if(n==="mountain")mountainMask|=1<<i;
      if(id==="mountain"&&n===null)edgeMask|=1<<i;
      if(id==="hill"&&n==="hill")hillMask|=1<<i;
      if((id==="valley"||id==="bridge")&&(n==="valley"||n==="bridge"))valleyMask|=1<<i;
      if((id==="road"||id==="bridge")&&connects(n))roadMask|=1<<i;
    });
    var key=[id,mountainMask,hillMask,valleyMask,roadMask,edgeMask,id==="void"?0:variant,
      id==="base"||id==="factory"?owner:-1].join("/");
    if(cache.has(key)) {
      var cached=cache.get(key);
      cache.delete(key);cache.set(key,cached);return cached;
    }
    var pixels=new Uint8Array(48*32), runs=[];
    function put(x,y,v) {if(x>=0&&x<48&&y>=0&&y<32&&pixels[y*48+x])pixels[y*48+x]=v;}
    function rect(x,y,w,h,v){for(var yy=y;yy<y+h;yy++)for(var xx=x;xx<x+w;xx++)put(xx,yy,v);}
    function relief(x,y) {
      var d=Math.hypot(x*.8,y*1.15);
      offsets.forEach(function (p,i) {if(neighbors[i]===id)d=Math.min(d,segmentDistance(x*.8,y*1.15,p[0]*.8,p[1]*1.15));});
      return d;
    }
    var mountains=mountainShape(mountainMask);
    for(var y=0;y<32;y++)for(var x=0;x<48;x++) {
      var dx=x+.5-24,dy=y+.5-16;
      if(Math.abs(dx)+Math.abs(dy)>24)continue;
      // Border tiles contribute only mountain skirts, with no off-board ground.
      var n=hash(x,y,variant),v=id==="void"?0:n%47===0?4:n%19===0?3:n%9===0?2:1;
      if(id==="waste") {
        var chunk=hash(Math.floor(x/3),Math.floor(y/2),variant+13)%13;
        v=chunk<4?1:chunk<7?11:chunk<10?13:14;
        if(n%7===0)v=chunk<7?2:12;
      }else if(id==="hill") {
        var d=relief(dx,dy)+(hash(Math.floor(x/2),Math.floor(y/2),9)%3-1)*.6;
        if(d<14) {
          var slope=relief(dx+1,dy+1)-relief(dx-1,dy-1);
          v=d>12?5:d>10?6:slope>1.1?9:slope>.1?8:slope>-.8?7:6;
          if(d<9&&n%13===0)v=Math.min(10,v+1);
          if(d<9&&(Math.abs(dx+dy*.7)%11<1||Math.abs(dx-dy)%17<1))v=Math.min(10,v+1);
        }
      }else if(id==="valley"||id==="bridge") {
        v=n%17===0?16:15;
        var edge=Infinity;
        offsets.forEach(function(p,i){if(neighbors[i]!=="valley"&&neighbors[i]!=="bridge") {
          var len=Math.hypot(p[0],p[1]);edge=Math.min(edge,len/2-(dx*p[0]+dy*p[1])/len);
        }});
        if(edge<2)v=4;else if(edge<4)v=18;else if(edge<6)v=17;else if(edge<8)v=16;
      }
      if(mountains[y*48+x])v=mountains[y*48+x];
      else if(id==="mountain") {
        // Trim the tiny ground-colored hex tips outside a perimeter cliff.
        // Null means an actual board edge; ordinary neighboring ground stays.
        var nearest=Infinity,side=-1;
        offsets.forEach(function(p,i){
          var distance=p[0]?(24-Math.sign(p[0])*dx-Math.sign(p[1])*dy)/Math.SQRT2:16-Math.sign(p[1])*dy;
          if(distance<nearest){nearest=distance;side=i;}
        });
        if(neighbors[side]===null)v=0;
      }
      if(id==="road"||id==="bridge") {
        var roadDistance=Infinity,found=false;
        offsets.forEach(function(p,i){if(connects(neighbors[i])){found=true;roadDistance=Math.min(roadDistance,segmentDistance(dx,dy,p[0],p[1]));}});
        if(!found)roadDistance=Math.abs(dy);
        if(roadDistance<6)v=5;
        if(roadDistance<4)v=9;
        if(roadDistance<2.5)v=8;
        if(id==="bridge"&&roadDistance<4&&n%3===0)v=7;
      }
      pixels[y*48+x]=v;
    }
    if(id==="base"||id==="factory") {
      var color=owner===0?20:owner===1?22:24,light=owner===0?21:owner===1?23:9;
      // Low domes, open yard, dark entrances and pale exposed roofs.
      rect(10,20,28,5,5);rect(12,20,24,3,8);rect(16,21,16,2,9);
      function dome(cx,cy,rx,ry) {
        for(var yy=-ry;yy<=2;yy++)for(var xx=-rx;xx<=rx;xx++) {
          if(yy<0&&xx*xx/(rx*rx)+yy*yy/(ry*ry)>1)continue;
          put(cx+xx,cy+yy,yy>=0?color:xx>rx*.45?light:19);
        }
        rect(cx-3,cy-1,6,4,15);rect(cx-2,cy-2,4,1,5);
      }
      if(id==="base") {dome(19,16,9,8);dome(32,18,5,5);rect(26,13,2,8,8);}
      else {dome(16,16,6,6);dome(29,14,8,7);rect(24,20,10,2,color);}
    }
    for(var ry=0;ry<32;ry++)for(var rx=0;rx<48;) {
      var value=pixels[ry*48+rx],start=rx;while(rx<48&&pixels[ry*48+rx]===value)rx++;
      if(value)runs.push([start,ry,rx-start,palette[value]]);
    }
    var result={width:48,height:32,pixels:pixels,runs:runs};
    // Evict the least recently used tile, never the whole working set.
    if(cache.size>=1024)cache.delete(cache.keys().next().value);
    cache.set(key,result);return result;
  }
  // One viewport-sized buffer replaces hundreds of Canvas calls per tile.
  // Rounded run boundaries are identical to the original renderer, including
  // fractional zoom and camera offsets. Transparent pixels leave prior tiles.
  function Frame(ctx, width, height) {
    this.width=width;this.height=height;
    this.image=ctx.createImageData(width,height);
    this.words=new Uint32Array(this.image.data.buffer);
    this.xs=new Int32Array(49);this.ys=new Int32Array(33);
    this.sourceX=new Uint8Array(width);
  }
  Frame.prototype.clear=function() {this.words.fill(colorWords["#181510"]);};
  Frame.prototype.draw=function(data,left,top,scale) {
    var xs=this.xs,ys=this.ys,width=this.width,height=this.height,words=this.words,i;
    for(i=0;i<=48;i++)xs[i]=Math.max(0,Math.min(width,Math.round(left+i*scale)));
    for(i=0;i<=32;i++)ys[i]=Math.max(0,Math.min(height,Math.round(top+i*scale)));
    if(!data.colors) {
      data.colors=new Uint32Array(data.pixels.length);
      for(i=0;i<data.pixels.length;i++)data.colors[i]=colorWords[palette[data.pixels[i]]]||0;
    }
    var sourceX=this.sourceX,colors=data.colors,leftEdge=xs[0],rightEdge=xs[48];
    for(i=0;i<48;i++)sourceX.fill(i,xs[i],xs[i+1]);
    for(var sy=0;sy<32;sy++)for(var y=ys[sy];y<ys[sy+1];y++) {
      var row=y*width,sourceRow=sy*48;
      for(var x=leftEdge;x<rightEdge;x++) {
        var color=colors[sourceRow+sourceX[x]];
        if(color)words[row+x]=color;
      }
    }
  };
  Frame.prototype.text=function(ctx,text,x,y) {
    // Keep Canvas's exact font rasterization and original tile/text ordering.
    // Only synchronize the tiny label rectangle; later tiles may cover it.
    var metrics=ctx.measureText(text);
    var left=Math.max(0,Math.floor(x-metrics.actualBoundingBoxLeft)-1);
    var top=Math.max(0,Math.floor(y-metrics.actualBoundingBoxAscent)-1);
    var right=Math.min(this.width,Math.ceil(x+metrics.actualBoundingBoxRight)+1);
    var bottom=Math.min(this.height,Math.ceil(y+metrics.actualBoundingBoxDescent)+1);
    if(right<=left||bottom<=top)return;
    ctx.putImageData(this.image,0,0,left,top,right-left,bottom-top);
    ctx.fillText(text,x,y);
    var label=ctx.getImageData(left,top,right-left,bottom-top);
    var words=new Uint32Array(label.data.buffer),stride=right-left;
    for(var row=0;row<bottom-top;row++)this.words.set(words.subarray(row*stride,(row+1)*stride),(top+row)*this.width+left);
  };
  Frame.prototype.paint=function(ctx) {ctx.putImageData(this.image,0,0);};
  function draw(ctx,cx,cy,scale,id,neighbors,variant,owner,frame) {
    var data=tile(id,neighbors,variant,owner),left=cx-24*scale,top=cy-16*scale;
    if(frame){frame.draw(data,left,top,scale);return;}
    data.runs.forEach(function(run){
      var x=Math.round(left+run[0]*scale),y=Math.round(top+run[1]*scale);
      ctx.fillStyle=run[3];ctx.fillRect(x,y,Math.round(left+(run[0]+run[2])*scale)-x,Math.round(top+(run[1]+1)*scale)-y);
    });
  }
  return {tile:tile,draw:draw,Frame:Frame,palette:palette,offsets:offsets};
})();
if(typeof module!=="undefined")module.exports=LEGACY_TERRAIN;
