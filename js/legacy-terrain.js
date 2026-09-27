/* Original-style terrain, authored on a 48x32 pixel grid from visual references.
 * A turned board draws the same art upright on a 32x48 grid. This is a
 * reconstruction, not an extracted original-game tile atlas. */
"use strict";
var LEGACY_TERRAIN = (function () {
  var palette = [null,"#390a12","#551d26","#71343b","#93545a",
    "#302a2c","#50504c","#747770","#969a90","#c3c7bc","#e2e5d8",
    "#624348","#876164","#a88081","#c39c9b","#100c12",
    "#28212a","#49404a","#7a6268","#fff9e5",
    // Building shades, light to dark: Union, Xenon, neutral factory.
    "#c8ccff","#8088e8","#303880","#c8e4b4","#78a868","#2c4a2a",
    "#f8f070","#e0c020","#705c10"];
  // Buildings seen from above, after the original's tiles: the base is a
  // walled prison camp with a watchtower annex; the factory has two round
  // tanks, a piped hall and two sheds. L, M and D are the owner's light, mid
  // and dark shades, K the yard floor and W a highlight; "." keeps the ground.
  var BUILDINGS = {
    base: [
      "DDDDDDDDDDDDDDDDDDDD........",
      "DLLLLLLLLLLLLLLLLLLD........",
      "DLLLLLLLLLLLLLLLLLLDDDDDDDDD",
      "DLLDDDDDDDDDDDDDDMMDLLLLLLLD",
      "DLLDKKKKKKKKKKKKDMMDLMMMMMMD",
      "DLLDKLLLLLLLLLLKDMMDLMMKKMMD",
      "DLLDKLMKMMKMMKMKDMMDLMMKKMMD",
      "DLLDKLMKKKKKKKKKDMMDLMMMMMMD",
      "DLLDKLMKKKKKKKKKDMMDLMDDDMMD",
      "DLLDKLMKKKKKKKKKDMMDLDLLLDMD",
      "DLLDKLMKLLLLLLLKDMMDDLLLLLDD",
      "DLLDKLMKKMMMMMMKDMMDDLLLLMDD",
      "DLLDKLMKKKKKKKKKDMMDDLLLMMDD",
      "DLLDKLMKKKKKKKKKDMMDDLLMMMDD",
      "DLLDKLMKKKKKKKKKDMMDLDMMMDMD",
      "DLLDKKKKKKKKKKKKDMMDLMDDDMMD",
      "DLLDDDDDDKKKDDDDDMMDLMMMMMMD",
      "DLLMMMMMMKKKMMMMMMMDDDDDDDDD",
      "DLLMMMMMMKKKMMMMMMMD........",
      "DDDDDDDDDKKKDDDDDDDD........"],
    factory: [
      "...DDDDD...DDDDDDDDDDDDDDDDD",
      ".DDLLLLLDD.DLLLLLLLLLLLLLLLD",
      ".DLWLLLLLD.DLMMMMMMMMMMMMMMD",
      "DLLLLLLLMMDDLLLLLLLLLLLLLLMD",
      "DLLLLLLMMMDLLMDDDDDDDDDDDDMD",
      "DLLLLLMMMMDDLMMMMMMMMMMMMMMD",
      "DLLLLMMMMMDDLLLLLLLLLLLLLLMD",
      ".DLLMMMMMD.DLMDDDDDDDDDDDDMD",
      ".DDMDDDDDD.DLMMMMMMMMMMMMMMD",
      "..DDLLLLLDDDDDDDDDDDDDDDDDDD",
      "..DLWLLLLLD..DDDDDDDDDDDDDD.",
      ".DLLLLLLLMMD.DLLLLLDDLLLLLD.",
      ".DLLLLLLMMMD.DLLLLMDDLLLLMD.",
      ".DLLLLLMMMMD.DLLLMMDDLLLMMD.",
      ".DLLLLMMMMMD.DLKKMMDDLKKMMD.",
      "..DLLMMMMMD..DLKKMMDDLKKMMD.",
      "..DDMMMMMDD..DDKKDDDDDKKDDD.",
      "DLLLDDDDDLLLLLLLLLLLLLLLLLLL",
      "DMMMMMMMMMMMMMMMMMMMMMMMMMMM",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDD"]
  };
  var cache = new Map(), mountainShapes = new Map(), terrainShapes = new Map();
  // Interpret RGBA bytes through a Uint32 view so this also works on a
  // big-endian host. Each run writes one opaque palette color at a time.
  var colorWords = {}, paletteWords = new Uint32Array(palette.length);
  palette.concat(["#181510"]).forEach(function (color) {
    if (!color) return;
    var rgb = parseInt(color.slice(1), 16);
    colorWords[color] = new Uint32Array(new Uint8Array([rgb >> 16, rgb >> 8 & 255, rgb & 255, 255]).buffer)[0];
  });
  palette.forEach(function(color,index){paletteWords[index]=colorWords[color]||0;});
  // Neighbor directions in HEX.neighbors order, in screen pixels. "turned" is
  // the board after a clockwise quarter turn; its art stays upright.
  var layouts = {
    flat: {id:"flat",w:48,h:32,offsets:[[32,16],[32,-16],[0,-32],[-32,-16],[-32,16],[0,32]]},
    turned: {id:"turned",w:32,h:48,offsets:[[-16,32],[16,32],[32,0],[16,-32],[-16,-32],[-32,0]]}
  };
  Object.keys(layouts).forEach(function(k){layouts[k].peaks=layouts[k].offsets.concat([[0,0]]);});
  var offsets = layouts.flat.offsets;
  function hash(x,y,seed) {
    var h=Math.imul(x+seed*17,374761393)^Math.imul(y+seed*43,668265263);
    h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;
  }
  function segmentDistance(x,y,dx,dy) {
    var t=Math.max(0,Math.min(1,(x*dx+y*dy)/(dx*dx+dy*dy)));
    return Math.hypot(x-t*dx,y-t*dy);
  }
  function connects(id) {return ["road","bridge","base","factory"].indexOf(id)>=0;}
  function terrainShape(L,id,mask) {
    var key=L.id+"/"+id+"/"+mask,found=terrainShapes.get(key);
    if(found)return found;
    var shape=new Uint8Array(L.w*L.h);
    function relief(x,y) {
      var d=Math.hypot(x*.8,y*1.15);
      for(var i=0;i<6;i++)if(mask&(1<<i)) {
        var p=L.offsets[i];d=Math.min(d,segmentDistance(x*.8,y*1.15,p[0]*.8,p[1]*1.15));
      }
      return d;
    }
    // Connection geometry does not depend on a tile's texture variant.
    // Encode its palette value and a high-bit flag for variant-dependent
    // highlights, then reuse it across all eight textures and mountain masks.
    for(var y=0;y<L.h;y++)for(var x=0;x<L.w;x++) {
      var dx=x+.5-L.w/2,dy=y+.5-L.h/2,value=0,i,p;
      if(Math.abs(dx)+Math.abs(dy)>24)continue;
      if(id==="hill") {
        var d=relief(dx,dy)+(hash(Math.floor(x/2),Math.floor(y/2),9)%3-1)*.6;
        if(d<14) {
          var slope=d<=10?relief(dx+1,dy+1)-relief(dx-1,dy-1):0;
          value=d>12?5:d>10?6:slope>1.1?9:slope>.1?8:slope>-.8?7:6;
          if(d<9) {
            if(Math.abs(dx+dy*.7)%11<1||Math.abs(dx-dy)%17<1)value=Math.min(10,value+1);
            value|=128;
          }
        }
      } else {
        var distance=mask?Infinity:Math.abs(dy);
        for(i=0;i<6;i++)if(mask&(1<<i)){p=L.offsets[i];distance=Math.min(distance,segmentDistance(dx,dy,p[0],p[1]));}
        value=distance<2.5?8:distance<4?9:distance<6?5:0;
        if(distance<4)value|=128;
      }
      shape[y*L.w+x]=value;
    }
    terrainShapes.set(key,shape);return shape;
  }
  function inTriangle(x,y,a,b,c) {
    function side(p,q){return (q[0]-p[0])*(y-p[1])-(q[1]-p[1])*(x-p[0]);}
    var s1=side(a,b),s2=side(b,c),s3=side(c,a);
    return (s1>=0&&s2>=0&&s3>=0)||(s1<=0&&s2<=0&&s3<=0);
  }
  // A ravine follows the lines between connected valley cells (bit 6 is the
  // tile's own cell) and fills the triangle three mutual neighbors enclose.
  // Neighboring tiles draw its banks too, so it stays one continuous channel
  // instead of a chain of hexagons. Banks facing the upper-left light are pale.
  function valleyShape(L,mask) {
    var key=L.id+"/valley/"+mask,found=terrainShapes.get(key);
    if(found)return found;
    var ids=[],parts=[],triangles=[],shape=new Uint8Array(L.w*L.h);
    for(var i=0;i<7;i++)if(mask&(1<<i)){ids.push(i);parts.push([L.peaks[i],L.peaks[i]]);}
    ids.forEach(function(a,n){ids.slice(n+1).forEach(function(b){
      var ex=L.peaks[b][0]-L.peaks[a][0],ey=L.peaks[b][1]-L.peaks[a][1];
      if(L.offsets.some(function(o){return o[0]===ex&&o[1]===ey;}))parts.push([L.peaks[a],L.peaks[b]]);
    });});
    if(mask&64)for(var k=0;k<6;k++)if(mask&(1<<k)&&mask&(1<<(k+1)%6))triangles.push([L.peaks[6],L.peaks[k],L.peaks[(k+1)%6]]);
    for(var y=0;y<L.h&&parts.length;y++)for(var x=0;x<L.w;x++) {
      var dx=x+.5-L.w/2,dy=y+.5-L.h/2,d=Infinity,near=null;
      if(Math.abs(dx)+Math.abs(dy)>24)continue;
      for(var s=0;s<parts.length;s++) {
        var a=parts[s][0],ex=parts[s][1][0]-a[0],ey=parts[s][1][1]-a[1];
        var t=Math.max(0,Math.min(1,((dx-a[0])*ex+(dy-a[1])*ey)/(ex*ex+ey*ey||1)));
        var qx=a[0]+t*ex,qy=a[1]+t*ey,e=Math.hypot((dx-qx)*.8,(dy-qy)*1.15);
        if(e<d){d=e;near=[qx,qy];}
      }
      for(s=0;s<triangles.length;s++)if(inTriangle(dx,dy,triangles[s][0],triangles[s][1],triangles[s][2]))d=0;
      d+=(hash(x,y>>1,7)%3)*.6;
      if(d<8.8)shape[y*L.w+x]=d<4.4&&hash(x,y,8)%5?15:16;
      else if(d<13.2)shape[y*L.w+x]=(dx-near[0])+(dy-near[1])>0?18:17;
      else if(d<14.8)shape[y*L.w+x]=3;
    }
    terrainShapes.set(key,shape);return shape;
  }
  var mountainFields=new Map();
  function mountainField(L,i,j) {
    // Keep the original center-first pair orientation for identical rounding.
    if(j!==undefined && (j===6 || i!==6 && j<i)){var swap=i;i=j;j=swap;}
    var key=L.id+"/"+i+"/"+j,field=mountainFields.get(key);
    if(field)return field;
    field=new Uint8Array(L.w*L.h);
    var a=L.peaks[i],b=j===undefined?null:L.peaks[j];
    for(var y=0;y<L.h;y++)for(var x=0;x<L.w;x++) {
      var dx=x+.5-L.w/2,dy=y+.5-L.h/2;
      if(Math.abs(dx)+Math.abs(dy)>24)continue;
      var d=b?segmentDistance((dx-a[0])*.8,(dy-a[1])*1.15,(b[0]-a[0])*.8,(b[1]-a[1])*1.15):Math.hypot((dx-a[0])*.8,(dy-a[1])*1.15);
      if(d<17)field[y*L.w+x]=d>14?11:d>11?12:d>8?13:14;
    }
    mountainFields.set(key,field);return field;
  }
  function mountainShape(L,mask) {
    var key=L.id+"/"+mask;
    if(mountainShapes.has(key))return mountainShapes.get(key);
    var bit=mask&64?64:mask&-mask,index=bit?Math.log2(bit):0;
    var pixels=mask?new Uint8Array(mountainShape(L,mask^bit)):new Uint8Array(L.w*L.h);
    function overlay(field){for(var p=0;p<pixels.length;p++)if(field[p]>pixels[p])pixels[p]=field[p];}
    if(mask) {
      overlay(mountainField(L,index));
      var a=L.peaks[index];
      for(var j=0;j<7;j++)if((mask^bit)&(1<<j)) {
        var b=L.peaks[j];
        if(L.offsets.some(function(p){return b[0]-a[0]===p[0]&&b[1]-a[1]===p[1];}))overlay(mountainField(L,index,j));
      }
    }
    // Minimum distance is maximum shade. Reuse seven peak fields and twelve
    // ridge fields instead of recomputing their distances for every mask.
    mountainShapes.set(key,pixels);return pixels;
  }
  function tile(id, neighbors, variant, owner, turned) {
    var L=turned?layouts.turned:layouts.flat,w=L.w,h=L.h;
    // Only visual connections belong in the key. A plain next to a road
    // has the same pixels as a plain next to a factory, for example. Full
    // neighbor names exceeded the old cache on the large fjord maps.
    var mountainMask=id==="mountain"?64:0, hillMask=0, roadMask=0, edgeMask=0;
    var valleyMask=id==="valley"||id==="bridge"?64:0;
    neighbors.forEach(function(n,i) {
      if(n==="mountain")mountainMask|=1<<i;
      if(id==="mountain"&&n===null)edgeMask|=1<<i;
      if(id==="hill"&&n==="hill")hillMask|=1<<i;
      if(id!=="void"&&(n==="valley"||n==="bridge"))valleyMask|=1<<i;
      if((id==="road"||id==="bridge")&&connects(n))roadMask|=1<<i;
    });
    var key=[L.id,id,mountainMask,hillMask,valleyMask,roadMask,edgeMask,id==="void"?0:variant,
      id==="base"||id==="factory"?owner:-1].join("/");
    if(cache.has(key)) {
      var cached=cache.get(key);
      cache.delete(key);cache.set(key,cached);return cached;
    }
    var pixels=new Uint8Array(w*h);
    function put(x,y,v) {if(x>=0&&x<w&&y>=0&&y<h&&pixels[y*w+x])pixels[y*w+x]=v;}
    var hills=id==="hill"?terrainShape(L,"hill",hillMask):null;
    var valleys=valleyMask?valleyShape(L,valleyMask):null;
    var roads=id==="road"||id==="bridge"?terrainShape(L,"road",roadMask):null;
    // Missing neighbors are the end of the board, not low ground. Continue
    // a perimeter plateau through those edges instead of drawing an outer
    // slope (or trimming its ground-colored tips to transparency).
    var mountains=mountainShape(L,mountainMask|edgeMask);
    for(var y=0;y<h;y++)for(var x=0;x<w;x++) {
      var dx=x+.5-w/2,dy=y+.5-h/2,at=y*w+x;
      if(Math.abs(dx)+Math.abs(dy)>24)continue;
      if(mountains[at] && !roads){pixels[at]=mountains[at];continue;}
      // Border tiles contribute only mountain skirts, with no off-board ground.
      var n=hash(x,y,variant),v=id==="void"?0:n%47===0?4:n%19===0?3:n%9===0?2:1;
      if(id==="waste") {
        var chunk=hash(Math.floor(x/3),Math.floor(y/2),variant+13)%13;
        v=chunk<4?1:chunk<7?11:chunk<10?13:14;
        if(n%7===0)v=chunk<7?2:12;
      }else if(id==="hill") {
        var hill=hills[at];
        if(hill)v=Math.min(10,(hill&127)+((hill&128)&&n%13===0?1:0));
      }
      if(valleys&&valleys[at])v=valleys[at];
      if(mountains[at])v=mountains[at];
      if(roads) {
        var road=roads[at];
        if(road)v=road&127;
        if(id==="bridge"&&(road&128)&&n%3===0)v=7;
      }
      pixels[at]=v;
    }
    if(id==="base"||id==="factory") {
      // Union blue and Xenon green, as in the original; a neutral factory is
      // yellow and a neutral base grey.
      var ramp=owner===0?[20,21,22]:owner===1?[23,24,25]:id==="factory"?[26,27,28]:[10,8,6];
      var shade={L:ramp[0],M:ramp[1],D:ramp[2],K:15,W:19};
      // Positions are the flat tile's; a turned tile centers the same art.
      var left=w/2-14,top=h/2-10;
      BUILDINGS[id].forEach(function(row,by){
        for(var bx=0;bx<row.length;bx++)if(row[bx]!==".")put(left+bx,top+by,shade[row[bx]]);
      });
    }
    var result={width:w,height:h,pixels:pixels};
    // The software frame needs indexed pixels, not thousands of small run
    // arrays. Build those only for non-browser/fallback rectangle rendering.
    Object.defineProperty(result,"runs",{configurable:true,enumerable:true,get:function(){
      var runs=[];
      for(var ry=0;ry<h;ry++)for(var rx=0;rx<w;) {
        var value=pixels[ry*w+rx],start=rx;while(rx<w&&pixels[ry*w+rx]===value)rx++;
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
  // Board geometry for the rounded frame, normal or turned.
  function boardCells(layout) {
    var turned=!!layout.turned,columns=layout.columns,rows=layout.rows,stagger=columns>1?16:0;
    var width=turned?rows*32+stagger:columns*32+16,height=turned?columns*32+16:rows*32+stagger;
    var L=turned?layouts.turned:layouts.flat;
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
        if(sx>=0&&sx<L.w&&sy>=0&&sy<L.h&&Math.abs(sx+.5-L.w/2)+Math.abs(sy+.5-L.h/2)<=24)return true;
      }
      return false;
    }
    function nearest(x,y){var c=clamp(column(x,y),columns);return [c,clamp(row(x,y,c),rows)];}
    return {width:width,height:height,corner:corner,covers:covers,nearest:nearest,L:L};
  }
  function drawBoardBorder(ctx, layout, tileAt) {
    var geo=boardCells(layout),scale=layout.scale,width=geo.width,height=geo.height,radius=8;
    var left=layout.left,top=layout.top,tiles=new Map(),L=geo.L;
    var minX=Math.max(0,Math.floor(-left/scale)-1),maxX=Math.min(width,Math.ceil((layout.screenWidth-left)/scale)+1);
    var minY=Math.max(0,Math.floor(-top/scale)-1),maxY=Math.min(height,Math.ceil((layout.screenHeight-top)/scale)+1);
    function reflect(v,lo,hi){if(v<lo)v=2*lo-v-1;else if(v>hi)v=2*hi-v+1;return Math.max(lo,Math.min(hi,v));}
    function colorAt(x,y) {
      var qx=Math.max(radius-x-.5,0,x+.5-(width-radius));
      var qy=Math.max(radius-y-.5,0,y+.5-(height-radius));
      var edge=radius-Math.hypot(qx,qy);
      if(edge<0)return null;
      if(edge<1)return "#55463f";
      if(geo.covers(x,y))return null;
      // Bleed only the edge's terrain into the rectangular margin. Reflect
      // texture inward within the hex's span so it continues naturally
      // without stretched stripes.
      var cell=geo.nearest(x,y),p=geo.corner(cell[0],cell[1]),sx=x-p[0],sy=y-p[1],inset;
      if(layout.turned){
        sx=reflect(sx,0,L.w-1);inset=Math.ceil(Math.abs(sx+.5-L.w/2)-.5);sy=reflect(sy,inset,L.h-1-inset);
      }else{
        sy=reflect(sy,0,L.h-1);inset=Math.ceil(Math.abs(sy+.5-L.h/2)-.5);sx=reflect(sx,inset,L.w-1-inset);
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
