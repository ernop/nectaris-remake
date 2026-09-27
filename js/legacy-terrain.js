/* Original-style terrain, authored from visual references on the original's
 * 24x16 hex: every art pixel is a 2x2 block, as for the Legacy units. This is a
 * reconstruction, not an extracted original-game tile atlas. */
"use strict";
var LEGACY_TERRAIN = (function () {
  var palette = [null,"#390a12","#551d26","#71343b","#93545a",
    "#302a2c","#50504c","#747770","#969a90","#c3c7bc","#e2e5d8",
    "#624348","#876164","#a88081","#c39c9b","#100c12",
    "#28212a","#49404a","#7a6268","#fff9e5","#215783","#48a8c1",
    "#24562c","#77a753","#65716c"];
  var cache = new Map(), shapes = new Map();
  // Interpret RGBA bytes through a Uint32 view so this also works on a
  // big-endian host. Each run writes one opaque palette color at a time.
  var colorWords = {}, paletteWords = new Uint32Array(palette.length);
  palette.concat(["#181510"]).forEach(function (color) {
    if (!color) return;
    var rgb = parseInt(color.slice(1), 16);
    colorWords[color] = new Uint32Array(new Uint8Array([rgb >> 16, rgb >> 8 & 255, rgb & 255, 255]).buffer)[0];
  });
  palette.forEach(function(color,index){paletteWords[index]=colorWords[color]||0;});
  // Neighbour directions in HEX.neighbors order, in art pixels on screen.
  // "turned" is the board after a clockwise quarter turn; its art stays upright.
  var layouts = {
    flat: {id:"flat",w:24,h:16,offsets:[[16,8],[16,-8],[0,-16],[-16,-8],[-16,8],[0,16]]},
    turned: {id:"turned",w:16,h:24,offsets:[[-8,16],[8,16],[16,0],[8,-16],[-8,-16],[-16,0]]}
  };
  var offsets = layouts.flat.offsets.map(function (p) { return [p[0]*2, p[1]*2]; });
  var CENTER = 6;
  function hash(x,y,seed) {
    var h=Math.imul(x+seed*17,374761393)^Math.imul(y+seed*43,668265263);
    h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;
  }
  function segmentDistance(x,y,dx,dy) {
    var t=Math.max(0,Math.min(1,(x*dx+y*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(x-t*dx,y-t*dy);
  }
  // The original's elevated view foreshortens height on screen, so relief
  // measures vertical distance longer than horizontal.
  function relief(x,y,a,b) {
    return segmentDistance((x-a[0])*.8,(y-a[1])*1.15,(b[0]-a[0])*.8,(b[1]-a[1])*1.15);
  }
  function inside(x,y) { return Math.abs(x)+Math.abs(y)<=12; }
  function eachPixel(L,fn) {
    for(var ay=0;ay<L.h;ay++)for(var ax=0;ax<L.w;ax++) {
      var x=ax+.5-L.w/2,y=ay+.5-L.h/2;
      if(inside(x,y))fn(ax,ay,x,y,ay*L.w+ax);
    }
  }
  // Inward distance from the hex edge that faces neighbour offset o.
  function edgeDistance(o,x,y) {
    if(!o[0])return 8-y*Math.sign(o[1]);
    if(!o[1])return 8-x*Math.sign(o[0]);
    return (12-x*Math.sign(o[0])-y*Math.sign(o[1]))/Math.SQRT2;
  }
  // Smooth minimum of the distances to unconnected edges rounds inner corners.
  function openEdgeDistance(L,mask,x,y) {
    var sum=0;
    L.offsets.forEach(function(o,i){if(!(mask&(1<<i)))sum+=Math.exp(-edgeDistance(o,x,y)/1.4);});
    return sum?-1.4*Math.log(sum):Infinity;
  }
  function skeleton(L,mask) {
    var parts=[];L.offsets.forEach(function(o,i){if(mask&(1<<i))parts.push(o);});
    return parts;
  }
  function inTriangle(x,y,a,b,c) {
    function side(p,q){return (q[0]-p[0])*(y-p[1])-(q[1]-p[1])*(x-p[0]);}
    var s1=side(a,b),s2=side(b,c),s3=side(c,a);
    return (s1>=0&&s2>=0&&s3>=0)||(s1<=0&&s2<=0&&s3<=0);
  }

  function memo(key,build){var found=shapes.get(key);if(!found){found=build();shapes.set(key,found);}return found;}
  // Plateau shade from its peaks, the ridges between adjacent peaks and the
  // triangles that three mutually adjacent peaks enclose. Every tile shares
  // the same world geometry, so ranges and skirts continue across edges.
  function mountainShape(L,mask) {
    return memo("mountain/"+L.id+"/"+mask,function(){
      var net=network(L,mask),shape=new Uint8Array(L.w*L.h);
      if(!net.points.length)return shape;
      eachPixel(L,function(ax,ay,x,y,at){
        var d=Infinity;
        net.points.forEach(function(p){d=Math.min(d,relief(x,y,p,p));});
        net.segments.forEach(function(s){d=Math.min(d,relief(x,y,s[0],s[1]));});
        if(net.triangles.some(function(t){return inTriangle(x,y,t[0],t[1],t[2]);}))d=0;
        if(d<8.5)shape[at]=d>7.3?11:d>6.1?12:d>4.9?13:14;
      });
      return shape;
    });
  }
  // Grey rocky mounds lit from the upper left. A hill is a smooth union of
  // round bumps at its centre and toward connected hills, so clusters read as
  // lumpy ridges rather than lines radiating from each centre.
  function hillShape(L,mask) {
    return memo("hill/"+L.id+"/"+mask,function(){
      var radius=L.id==="flat"?7.2:6.1,soft=2.2,bumps=[[0,0,radius]],shape=new Uint8Array(L.w*L.h);
      L.offsets.forEach(function(o,i){if(mask&(1<<i))bumps.push([o[0],o[1],radius],[o[0]/2,o[1]/2,radius*.95]);});
      function distance(x,y){
        var sum=0;
        bumps.forEach(function(b){sum+=Math.exp(-(relief(x,y,b,b)-b[2])/soft);});
        return -soft*Math.log(sum);
      }
      var BAYER=[0,.5,.75,.25];
      eachPixel(L,function(ax,ay,x,y,at){
        var d=distance(x,y)+(hash(ax>>1,ay,5)%3-1)*.3;
        if(d>=0)return;
        // Brightness follows the slope toward the light. An ordered dither
        // blends neighbouring greys only where the tone changes.
        var lit=distance(x-1,y-1)-distance(x+1,y+1),tone=d>-1?0:Math.max(d<-2.2?1.4:.6,Math.min(3.99,2+lit*1.7));
        var level=Math.min(4,Math.floor(tone+BAYER[(ay&1)*2+(ax&1)])),rock=hash(ax,ay,11)%23;
        if(level>1&&rock===0)level--;else if(level&&level<4&&rock===1)level++;
        shape[at]=[5,6,7,8,9][level];
      });
      return shape;
    });
  }
  function roadShape(L,mask) {
    return memo("road/"+L.id+"/"+mask,function(){
      var parts=skeleton(L,mask),shape=new Uint8Array(L.w*L.h);
      eachPixel(L,function(ax,ay,x,y,at){
        var d=parts.length?Infinity:Math.hypot(x,y)-.8;
        parts.forEach(function(o){d=Math.min(d,segmentDistance(x,y,o[0],o[1]));});
        if(d<2.5)shape[at]=8;else if(d<3.4)shape[at]=6;
      });
      return shape;
    });
  }
  // Skeleton through the cells in `mask` (neighbours 0-5 and centre 6): the
  // points, segments between adjacent cells and triangles three of them close.
  function network(L,mask) {
    var points=L.offsets.concat([[0,0]]),ids=[],segments=[],triangles=[];
    for(var i=0;i<7;i++)if(mask&(1<<i))ids.push(i);
    function adjacent(a,b){var dx=points[b][0]-points[a][0],dy=points[b][1]-points[a][1];
      return L.offsets.some(function(o){return o[0]===dx&&o[1]===dy;});}
    ids.forEach(function(a,n){ids.slice(n+1).forEach(function(b){if(adjacent(a,b))segments.push([points[a],points[b]]);});});
    if(mask&(1<<CENTER))for(var k=0;k<6;k++)if(mask&(1<<k)&&mask&(1<<(k+1)%6))triangles.push([points[CENTER],points[k],points[(k+1)%6]]);
    return {points:ids.map(function(i){return points[i];}),segments:segments,triangles:triangles};
  }
  // A ravine follows the line through connected valley cells. Neighbouring
  // tiles draw its banks too, so it stays one continuous channel instead of a
  // chain of hexagons. Banks facing the upper-left light are pale.
  function valleyShape(L,mask) {
    return memo("valley/"+L.id+"/"+mask,function(){
      var net=network(L,mask),shape=new Uint8Array(L.w*L.h);
      if(!net.points.length)return shape;
      eachPixel(L,function(ax,ay,x,y,at){
        var d=Infinity,near=null;
        function consider(a,b){
          var t=Math.max(0,Math.min(1,((x-a[0])*(b[0]-a[0])+(y-a[1])*(b[1]-a[1]))/(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2)||1)));
          var q=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])],e=Math.hypot((x-q[0])*.8,(y-q[1])*1.15);
          if(e<d){d=e;near=q;}
        }
        net.points.forEach(function(p){consider(p,p);});
        net.segments.forEach(function(s){consider(s[0],s[1]);});
        if(net.triangles.some(function(t){return inTriangle(x,y,t[0],t[1],t[2]);}))d=0;
        d+=(hash(ax,ay>>1,7)%3)*.3;
        if(d<4.4)shape[at]=d<2.2&&hash(ax,ay,8)%5?15:16;
        else if(d<6.6)shape[at]=near&&(x-near[0])+(y-near[1])>0?18:17;
        else if(d<7.4)shape[at]=3;
      });
      return shape;
    });
  }
  // Pebbles lit from the upper left thin out toward unconnected edges, so a
  // patch of rough ground has a ragged rim.
  function wasteShape(L,mask,variant) {
    return memo("waste/"+L.id+"/"+mask+"/"+variant,function(){
      var shape=new Uint8Array(L.w*L.h);
      // Pebbles sit at jittered spots of a 3x3 lattice, one to three pixels
      // wide, with a lit upper-left pixel and a shadow on the lower right.
      eachPixel(L,function(ax,ay,x,y,at){
        var edge=Math.min(1,Math.max(0,(openEdgeDistance(L,mask,x,y)-.5)/3.5)),best=0;
        for(var cy=Math.floor(ay/3)-1;cy<=Math.floor(ay/3);cy++)for(var cx=Math.floor(ax/3)-1;cx<=Math.floor(ax/3);cx++) {
          var n=hash(cx,cy,variant+13);
          if(n%100>=82*edge+10)continue;
          var px=cx*3+n%3,py=cy*3+(n>>3)%3,w=1+(n>>6)%3,h=1+(n>>11)%2;
          var dx=ax-px,dy=ay-py;
          if(dx>=0&&dy>=0&&dx<w&&dy<h)best=Math.max(best,dx+dy===0?13:12);
          else if(dx>=0&&dx<=w&&dy===h||dx===w&&dy>=0&&dy<h)best=Math.max(best,11);
        }
        shape[at]=best||(hash(ax,ay,variant+3)%6?1:2);
      });
      return shape;
    });
  }
  // The dot lattice's period divides the hex pitch in both layouts, so it
  // continues across tiles; sparse pebbles vary it per tile.
  function ground(ax,ay,variant) {
    var dot=!(ay&1)&&!((ax+(ay&2))&3), n=hash(ax,ay,variant);
    if(dot)return n%9===0?1:n%4===0?3:2;
    return n%61===0?3:1;
  }
  function building(pixels,L,id,owner) {
    var color=owner===0?20:owner===1?22:24,light=owner===0?21:owner===1?23:9;
    function put(x,y,v){var ax=Math.floor(x+L.w/2),ay=Math.floor(y+L.h/2);
      if(ax>=0&&ax<L.w&&ay>=0&&ay<L.h&&pixels[ay*L.w+ax])pixels[ay*L.w+ax]=v;}
    function rect(x,y,w,h,v){for(var yy=y;yy<y+h;yy++)for(var xx=x;xx<x+w;xx++)put(xx,yy,v);}
    // White domes lit from the upper left on a band of the owner's colour.
    function dome(cx,cy,rx,ry){
      for(var yy=-ry;yy<=1;yy++)for(var xx=-rx;xx<=rx;xx++){
        if(yy<0&&(xx*xx)/(rx*rx)+(yy*yy)/(ry*ry)>1.05)continue;
        put(cx+xx,cy+yy,yy>=0?(xx<0?light:color):xx+yy*.6<-rx*.35?19:xx>rx*.35?7:9);
      }
      rect(cx-1,cy,2,2,15);
    }
    // Low domes on an open yard; the art stays upright on a turned board.
    rect(-7,2,14,3,5);rect(-6,2,12,2,8);
    if(id==="base"){dome(-1,1,5,5);dome(4,2,2,2);rect(3,-6,1,4,6);put(3,-7,19);}
    else{dome(-3,1,3,4);dome(3,1,3,4);rect(0,-6,1,5,6);put(0,-7,19);}
  }
  function tile(id, neighbors, variant, owner, turned) {
    var L=turned?layouts.turned:layouts.flat;
    // Only visual connections belong in the key. A plain next to a road
    // has the same pixels as a plain next to a factory, for example.
    var mountainMask=id==="mountain"?1<<CENTER:0, valleyMask=id==="valley"||id==="bridge"?1<<CENTER:0;
    var hillMask=0, roadMask=0, edgeMask=0, wasteMask=0;
    neighbors.forEach(function(n,i) {
      if(n==="mountain")mountainMask|=1<<i;
      if(id==="mountain"&&n===null)edgeMask|=1<<i;
      if(id==="hill"&&n==="hill")hillMask|=1<<i;
      if(id==="waste"&&(n==="waste"||n===null))wasteMask|=1<<i;
      if(id!=="void"&&(n==="valley"||n==="bridge"))valleyMask|=1<<i;
      if((id==="road"||id==="bridge")&&["road","bridge","base","factory"].indexOf(n)>=0)roadMask|=1<<i;
    });
    var key=[L.id,id,mountainMask,hillMask,valleyMask,roadMask,edgeMask,wasteMask,id==="void"?0:variant,
      id==="base"||id==="factory"?owner:-1].join("/");
    if(cache.has(key)) {
      var cached=cache.get(key);
      cache.delete(key);cache.set(key,cached);return cached;
    }
    var art=new Uint8Array(L.w*L.h),mountains=mountainShape(L,mountainMask|edgeMask);
    // Void cells beyond the board contribute only neighbouring mountain skirts.
    if(id==="void")art.set(mountains);
    else {
      var layer=id==="hill"?hillShape(L,hillMask):id==="waste"?wasteShape(L,wasteMask,variant%4):null;
      var valleys=valleyShape(L,valleyMask),roads=id==="road"||id==="bridge"?roadShape(L,roadMask):null;
      eachPixel(L,function(ax,ay,x,y,at){
        var v=layer&&layer[at]||ground(ax,ay,variant);
        if(valleys[at])v=valleys[at];
        if(mountains[at])v=mountains[at];
        if(roads&&roads[at])v=id==="bridge"&&roads[at]===6?7:roads[at];
        art[at]=v;
      });
      if(id==="base"||id==="factory")building(art,L,id,owner);
    }
    var width=L.w*2,height=L.h*2,pixels=new Uint8Array(width*height);
    for(var y=0;y<height;y++)for(var x=0;x<width;x++)pixels[y*width+x]=art[(y>>1)*L.w+(x>>1)];
    var result={width:width,height:height,pixels:pixels};
    // The software frame needs indexed pixels, not thousands of small run
    // arrays. Build those only for non-browser/fallback rectangle rendering.
    Object.defineProperty(result,"runs",{configurable:true,enumerable:true,get:function(){
      var runs=[];
      for(var ry=0;ry<height;ry++)for(var rx=0;rx<width;) {
        var value=pixels[ry*width+rx],start=rx;while(rx<width&&pixels[ry*width+rx]===value)rx++;
        if(value)runs.push([start,ry,rx-start,palette[value]]);
      }
      Object.defineProperty(result,"runs",{value:runs,enumerable:true});return runs;
    }});
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
    this.xs=new Int32Array(49);this.ys=new Int32Array(49);
    this.sourceX=new Uint8Array(width);
  }
  Frame.prototype.clear=function() {this.words.fill(colorWords["#181510"]);};
  Frame.prototype.draw=function(data,left,top,scale) {
    var xs=this.xs,ys=this.ys,width=this.width,height=this.height,words=this.words,w=data.width,h=data.height,i;
    for(i=0;i<=w;i++)xs[i]=Math.max(0,Math.min(width,Math.round(left+i*scale)));
    for(i=0;i<=h;i++)ys[i]=Math.max(0,Math.min(height,Math.round(top+i*scale)));
    if(!data.colors) {
      data.colors=new Uint32Array(data.pixels.length);
      for(i=0;i<data.pixels.length;i++)data.colors[i]=paletteWords[data.pixels[i]];
    }
    var sourceX=this.sourceX,colors=data.colors,leftEdge=xs[0],rightEdge=xs[w];
    for(i=0;i<w;i++)sourceX.fill(i,xs[i],xs[i+1]);
    for(var sy=0;sy<h;sy++)for(var y=ys[sy];y<ys[sy+1];y++) {
      var row=y*width,sourceRow=sy*w;
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
  function draw(ctx,cx,cy,scale,id,neighbors,variant,owner,frame,turned) {
    var data=tile(id,neighbors,variant,owner,turned),left=cx-data.width/2*scale,top=cy-data.height/2*scale;
    if(frame){frame.draw(data,left,top,scale);return;}
    data.runs.forEach(function(run){
      var x=Math.round(left+run[0]*scale),y=Math.round(top+run[1]*scale);
      ctx.fillStyle=run[3];ctx.fillRect(x,y,Math.round(left+(run[0]+run[2])*scale)-x,Math.round(top+(run[1]+1)*scale)-y);
    });
  }
  // Native-pixel board geometry for the rounded frame, normal or turned.
  function boardCells(layout) {
    var turned=!!layout.turned,columns=layout.columns,rows=layout.rows,stagger=columns>1?16:0;
    var width=turned?rows*32+stagger:columns*32+16,height=turned?columns*32+16:rows*32+stagger;
    var L=turned?layouts.turned:layouts.flat,tw=L.w*2,th=L.h*2;
    // Upper-left corner of cell (c,r)'s tile inside the board rectangle.
    function corner(c,r){return turned?[width-32-32*r-16*(c&1),32*c]:[32*c,32*r+16*(c&1)];}
    function clamp(v,max){return Math.max(0,Math.min(max-1,v));}
    function column(x,y){return turned?Math.round((y+.5-24)/32):Math.round((x+.5-24)/32);}
    function row(x,y,c){return turned?Math.round((width-16-16*(c&1)-x-.5)/32):Math.round((y+.5-16-(c&1)*16)/32);}
    function covers(x,y){
      for(var c=column(x,y)-1;c<=column(x,y)+1;c++){
        var r=row(x,y,c);
        if(c<0||c>=columns||r<0||r>=rows)continue;
        var p=corner(c,r),sx=x-p[0],sy=y-p[1];
        if(sx>=0&&sx<tw&&sy>=0&&sy<th&&inside((sx>>1)+.5-L.w/2,(sy>>1)+.5-L.h/2))return true;
      }
      return false;
    }
    function nearest(x,y){var c=clamp(column(x,y),columns);return [c,clamp(row(x,y,c),rows)];}
    return {width:width,height:height,tw:tw,th:th,corner:corner,covers:covers,nearest:nearest,L:L};
  }
  function drawBoardBorder(ctx, layout, tileAt) {
    var geo=boardCells(layout),scale=layout.scale,width=geo.width,height=geo.height,radius=8;
    var left=layout.left,top=layout.top,tiles=new Map(),L=geo.L;
    var minX=Math.max(0,Math.floor(-left/scale)-1),maxX=Math.min(width,Math.ceil((layout.screenWidth-left)/scale)+1);
    var minY=Math.max(0,Math.floor(-top/scale)-1),maxY=Math.min(height,Math.ceil((layout.screenHeight-top)/scale)+1);
    function colorAt(x,y) {
      var qx=Math.max(radius-x-.5,0,x+.5-(width-radius));
      var qy=Math.max(radius-y-.5,0,y+.5-(height-radius));
      var edge=radius-Math.hypot(qx,qy);
      if(edge<0)return null;
      if(edge<1)return "#55463f";
      if(geo.covers(x,y))return null;
      // Bleed only the edge's terrain into the rectangular margin. Reflect
      // texture inward so it continues naturally without stretched stripes.
      var cell=geo.nearest(x,y),p=geo.corner(cell[0],cell[1]);
      var sx=x-p[0],sy=y-p[1],tw=geo.tw,th=geo.th;
      function reflect(v,lo,hi){if(v<lo)v=2*lo-v-1;else if(v>hi)v=2*hi-v+1;return Math.max(lo,Math.min(hi,v));}
      sx=reflect(sx,0,tw-1);sy=reflect(sy,0,th-1);
      // Mirror across the hex's span in art pixels, so the lattice and
      // rubble continue instead of repeating one pixel as a stripe.
      if(layout.turned){
        var ax=sx>>1,half=12-Math.abs(ax+.5-L.w/2),ay=reflect(sy>>1,Math.ceil(L.h/2-.5-half),Math.floor(L.h/2-.5+half));
        sy=ay*2+(sy&1);
      }else{
        var ry=sy>>1,span=12-Math.abs(ry+.5-L.h/2),rx=reflect(sx>>1,Math.ceil(L.w/2-.5-span),Math.floor(L.w/2-.5+span));
        sx=rx*2+(sx&1);
      }
      var key=cell[0]+","+cell[1],data=tiles.get(key);
      if(!data){data=tileAt(cell[0],cell[1]);tiles.set(key,data);}
      return palette[data.pixels[sy*data.width+sx]];
    }
    function strip(y,x0,x1) {
      var start=x0,color=null;
      for(var x=x0;x<=x1;x++) {
        var next=x<x1?colorAt(x,y):null;
        if(next===color)continue;
        if(color) {
          var px=Math.round(left+start*scale),py=Math.round(top+y*scale);
          ctx.fillStyle=color;ctx.fillRect(px,py,Math.round(left+x*scale)-px,Math.round(top+(y+1)*scale)-py);
        }
        start=x;color=next;
      }
    }
    // Only the outer 16 native pixels contain gaps. Work follows the visible
    // perimeter and is baked into the existing terrain cache, including pans.
    for(var y=minY;y<maxY;y++) {
      if(y<16||y>=height-16)strip(y,minX,maxX);
      else {
        strip(y,minX,Math.min(16,maxX));
        strip(y,Math.max(width-16,minX),maxX);
      }
    }
  }
  return {tile:tile,draw:draw,drawBoardBorder:drawBoardBorder,Frame:Frame,palette:palette,offsets:offsets,layouts:layouts};
})();
if(typeof module!=="undefined")module.exports=LEGACY_TERRAIN;
