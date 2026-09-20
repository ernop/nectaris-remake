/* Original native 32-pixel unit constructions. Export with tools/build-unit-art.js. */
(function (root) {
  'use strict';
  const RAMPS = {
    union: ['#15335a','#24578b','#397ec0','#73b5e8','#c0e4f6'],
    xenon: ['#183c28','#28653b','#419450','#80c17a','#cce8ae'],
    attack: ['#501c28','#832c37','#be4448','#ee8276','#ffd1ac'],
    neutral: ['#242b35','#414b58','#677788','#a7b4c0','#e0e7ea']
  };
  function palette(faction) {
    return [null,'#14151f','#303440','#626b78','#a9b6c4','#ecf4f0',
      ...RAMPS[faction || 'union'],'#183d52','#91d0d8','#9c6a25','#f2cb58','#241c26'];
  }
  function rgb(hex) { return parseInt(hex.slice(1),16); }
  class Surface {
    constructor(w,h) { this.w=w;this.h=h;this.p=new Uint32Array(w*h); }
    set(x,y,color) { x=Math.floor(x);y=Math.floor(y);if(x>=0&&y>=0&&x<this.w&&y<this.h)this.p[y*this.w+x]=color; }
    get(x,y) { return x>=0&&y>=0&&x<this.w&&y<this.h?this.p[y*this.w+x]:0; }
    rect(x,y,w,h,color) { for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)this.set(i,j,color); }
    poly(points,color) {
      const minY=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1]))));
      const maxY=Math.min(this.h-1,Math.ceil(Math.max(...points.map(p=>p[1]))));
      for(let y=minY;y<=maxY;y++) {
        const hits=[];
        for(let i=0;i<points.length;i++) {
          const a=points[i],b=points[(i+1)%points.length];
          if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))hits.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));
        }
        hits.sort((a,b)=>a-b);
        for(let i=0;i<hits.length;i+=2)for(let x=Math.ceil(hits[i]-.5);x<hits[i+1]-.5;x++)this.set(x,y,color);
      }
    }
    line(x0,y0,x1,y1,color,width=1) {
      x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
      const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
      for(;;) {this.rect(x0-Math.floor(width/2),y0-Math.floor(width/2),width,width,color);if(x0===x1&&y0===y1)break;
        const e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}
    }
    ellipse(cx,cy,rx,ry,color) { for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1)this.set(x,y,color); }
    blit(src,x,y,scale=1) { for(let j=0;j<src.h;j++)for(let i=0;i<src.w;i++){const p=src.get(i,j);if(p)this.rect(x+i*scale,y+j*scale,scale,scale,p);} }
  }
  // One source grid for every class; silhouette size deliberately varies.
  const FRAME=32, GEOMETRY={frame:FRAME,width:48,height:32,pitch:32,stagger:16};
  function sprite(id, facing='right') {
    const s=new Surface(FRAME,FRAME),shadow=new Surface(FRAME,FRAME),left=facing==='left'&&id!=='BASE';
    const tx=x=>left?FRAME-x:x;
    const poly=(p,c)=>s.poly(p.map(([x,y])=>[tx(x),y]),c);
    const rect=(x,y,w,h,c)=>s.rect(left?FRAME-x-w:x,y,w,h,c);
    const line=(x,y,x1,y1,c,w=1)=>s.line(left?FRAME-1-x+(w%2===0?1:0):x,y,left?FRAME-1-x1+(w%2===0?1:0):x1,y1,c,w);
    const ellipse=(x,y,rx,ry,c)=>s.ellipse(tx(x),y,rx,ry,c);
    const facet=(normalX,normalY)=>Math.max(6,Math.min(10,8-Math.round(normalX*(left?-1:1)+normalY)));
    if(id==='BISON') {
      shadow.rect(6,23,20,1,15);
      // Long rectangular tread runs and a low, welded hull.
      rect(3,12,21,3,2);line(4,12,22,12,4);
      rect(3,19,22,4,2);line(4,19,23,19,3);
      for(let x=5;x<24;x+=4){rect(x,20,2,1,3);rect(x,22,2,1,4);}
      poly([[4,14],[20,14],[24,17],[24,20],[4,20]],7);
      poly([[4,14],[20,14],[24,17],[8,17]],9);
      line(4,14,12,14,5);line(8,17,23,17,10);
      poly([[8,17],[24,17],[24,20],[8,20]],6);
      line(9,18,20,18,8);
      poly([[4,14],[8,17],[8,20],[4,18]],facet(-1,0));
      rect(5,15,4,2,2);line(5,15,8,15,3);
      rect(5,18,2,1,5);rect(22,18,2,1,4);
      // Flat turret roof and a long narrow barrel, with no rounded dome.
      poly([[10,10],[18,10],[21,12],[21,15],[10,15]],7);
      poly([[10,10],[18,10],[21,12],[13,12]],10);
      line(10,10,17,10,5);
      poly([[13,12],[21,12],[21,15],[13,15]],8);
      poly([[10,10],[13,12],[13,15],[10,13]],facet(-1,0));
      rect(13,11,3,1,6);line(14,14,18,14,6);
      rect(19,12,10,2,3);line(20,12,28,12,5);
      rect(28,13,1,1,2);
    } else if(id==='POLAR') {
      shadow.rect(6,25,20,1,15);
      // Continuous slab skirts: extra armor adds length and depth, not a head.
      rect(3,11,22,3,2);line(4,11,23,11,4);
      rect(3,21,23,4,2);line(5,24,24,24,3);
      for(let x=6;x<24;x+=4)rect(x,23,2,1,4);
      poly([[4,13],[20,13],[25,16],[25,22],[4,22]],7);
      poly([[4,13],[20,13],[25,16],[8,16]],9);
      line(4,13,19,13,10);line(4,13,11,13,5);
      poly([[8,16],[25,16],[25,22],[8,22]],6);
      // Straight plate joints and a white upper fender, dark lower armor.
      line(8,16,24,16,5);
      for(let x=9;x<24;x+=5){rect(x,18,4,3,8);rect(x,18,4,1,9);rect(x,21,4,1,7);}
      poly([[4,13],[8,16],[8,22],[4,20]],facet(-1,0));
      rect(5,17,2,3,left?7:9);
      // Low offset rectangular turret with an extended mantlet.
      poly([[8,8],[18,8],[22,10],[22,14],[8,14]],7);
      poly([[8,8],[18,8],[22,10],[12,10]],10);
      line(8,8,17,8,5);rect(9,9,3,1,5);
      poly([[12,10],[22,10],[22,14],[12,14]],8);
      poly([[8,8],[12,10],[12,14],[8,12]],facet(-1,0));
      rect(13,9,4,1,6);line(13,13,18,13,6);
      rect(20,10,3,3,7);rect(21,10,2,1,10);
      rect(23,10,6,2,3);line(23,10,28,10,5);rect(28,11,1,1,2);
    } else if(id==='HADRIAN') {
      shadow.rect(5,25,19,1,15);
      rect(3,16,19,3,2);line(4,16,20,16,4);
      rect(3,21,22,4,2);line(4,21,23,21,3);
      for(let x=5;x<24;x+=4){rect(x,23,2,1,3);rect(x,24,2,1,4);}
      poly([[4,18],[18,18],[23,20],[23,22],[4,22]],7);
      poly([[4,18],[18,18],[23,20],[8,20]],9);
      line(4,18,17,18,10);line(4,18,10,18,5);
      rect(8,20,15,2,6);line(9,20,20,20,9);
      rect(5,19,4,1,2);rect(21,21,2,1,4);
      // An exposed box breech and long straight gun, not a tank-like turret.
      poly([[11,14],[15,12],[19,15],[16,18],[11,18]],7);
      poly([[11,14],[15,12],[17,14],[13,16]],10);
      line(11,14,14,12,5);rect(12,16,5,3,6);
      rect(13,16,3,2,2);line(13,16,15,16,4);
      line(15,18,27,8,3,3);
      line(15,17,26,7,5);line(16,19,28,9,2);
      line(18,16,25,10,4);
      rect(26,7,3,3,2);rect(26,7,3,1,5);rect(26,8,2,1,4);
    } else if(id==='CHARLIE') {
      shadow.rect(12,24,9,1,15);
      // Small field helmet, straight vest, longer legs and a level rifle.
      // The head stays four pixels wide before the contour is added.
      rect(12,18,2,5,7);rect(17,18,2,5,6);
      rect(12,19,1,3,9);rect(17,19,1,3,8);
      rect(11,23,3,1,2);rect(17,23,4,1,2);
      rect(11,23,2,1,4);rect(18,23,2,1,3);
      rect(10,13,3,5,6);line(10,13,10,16,8);
      rect(13,12,5,6,8);rect(13,13,5,2,9);
      line(13,13,16,13,10);rect(13,17,5,1,6);
      rect(11,13,2,4,facet(-1,0));rect(11,13,2,1,left?9:10);
      rect(18,13,2,3,7);rect(18,13,2,1,left?10:9);
      rect(14,9,4,2,8);line(14,9,17,9,10);
      rect(13,11,5,1,2);rect(16,11,2,1,11);
      rect(16,12,1,1,4);
      rect(15,15,11,1,2);line(16,14,25,14,3);
      rect(15,15,2,1,9);rect(21,15,2,1,9);rect(19,16,1,2,2);
    } else if(id==='EAGLE') {
      // Long narrow fuselage, squared wing tips and small nacelles. No bulbous
      // canopy, round nose, arched tail or thick clustered central body.
      shadow.rect(9,19,14,1,15);
      poly([[5,15],[4,11],[7,11],[10,15]],8);
      poly([[5,17],[10,17],[7,21],[4,21]],7);
      line(4,11,6,11,10);line(4,20,7,20,9);
      // Swept straight edges, parallel wing-tip cuts and planar panel shading.
      poly([[12,15],[11,9],[15,9],[19,15]],8);
      poly([[12,15],[11,9],[13,9],[16,15]],9);
      line(11,9,14,9,5);line(11,10,12,14,10);
      line(14,11,16,14,6);
      poly([[12,17],[19,17],[15,24],[11,24]],7);
      poly([[12,18],[15,18],[13,23],[11,23]],9);
      line(11,23,14,23,10);line(16,19,14,22,6);
      // Straight narrow engine pods and two small carried bombs.
      for(const y of [12,19]){
        rect(12,y,7,2,7);line(13,y,18,y,10);rect(12,y,1,2,2);
      }
      rect(15,10,4,1,13);rect(18,10,1,1,14);
      rect(15,21,4,1,13);rect(18,21,1,1,14);
      // Fuselage is four pixels deep before outline; cockpit is a tiny slit.
      poly([[5,14],[22,14],[29,16],[22,18],[5,18]],8);
      poly([[5,14],[22,14],[26,15],[7,15]],10);
      line(8,14,19,14,5);line(8,17,23,17,6);
      rect(21,14,3,1,11);rect(21,14,1,1,12);
      rect(28,15,1,2,4);rect(3,15,3,2,2);
      rect(6,13,3,1,9);line(6,13,8,13,10);
    } else if(id==='KILROY') {
      shadow.rect(12,24,9,1,15);
      rect(12,19,2,4,7);rect(18,20,2,3,6);
      rect(11,23,4,1,2);rect(17,23,4,1,2);
      rect(12,20,1,2,9);rect(18,21,1,2,9);
      rect(12,14,6,5,8);rect(12,14,5,1,10);rect(12,18,6,1,6);
      rect(11,14,2,4,7);rect(18,15,2,2,9);
      rect(14,9,3,2,9);line(14,9,16,9,10);rect(13,11,5,1,2);
      // Shoulder launcher runs behind the small helmet; yellow marks its tip.
      rect(6,12,18,2,3);line(7,12,22,12,4);
      rect(6,12,2,2,2);rect(23,11,3,3,13);rect(24,11,2,2,14);
      rect(14,14,2,1,9);rect(20,14,2,1,9);
    } else if(id==='PANTHER') {
      shadow.rect(8,24,17,1,15);
      // Small rider above two exposed square-pixel wheels.
      rect(6,21,4,3,2);rect(22,21,4,3,2);
      rect(7,21,2,1,4);rect(23,21,2,1,4);
      line(9,21,13,18,3);line(13,18,21,21,3);line(21,21,9,21,6);
      line(21,17,24,21,4);line(18,17,22,17,4);
      rect(10,18,9,2,8);line(11,18,17,18,10);
      rect(12,14,3,4,8);rect(12,14,2,1,10);rect(14,12,3,2,9);
      line(14,12,16,12,10);rect(16,14,1,1,11);
      line(14,15,19,17,9);line(14,18,17,20,6);rect(16,20,3,1,2);
    } else if(id==='LENET') {
      shadow.rect(8,23,15,1,15);
      rect(6,13,16,3,2);line(7,13,20,13,4);
      rect(6,20,17,3,2);
      for(let x=8;x<22;x+=4)rect(x,21,2,1,4);
      poly([[7,16],[19,16],[23,18],[23,20],[7,20]],7);
      line(7,16,18,16,10);line(8,19,21,19,8);
      // Two small staggered turrets, unlike Giant's common twin-gun turret.
      rect(9,10,6,4,7);rect(9,10,5,1,10);rect(10,10,3,1,5);
      rect(13,16,6,3,8);rect(13,16,5,1,10);
      rect(14,12,12,1,4);line(15,12,25,12,5);
      rect(18,17,7,1,4);
    } else if(id==='GRIZZLY') {
      shadow.rect(6,24,18,1,15);
      rect(3,14,20,3,2);line(4,14,21,14,4);
      rect(3,20,21,4,2);for(let x=5;x<23;x+=4)rect(x,22,2,1,4);
      poly([[4,16],[18,14],[24,18],[23,21],[4,21]],7);
      poly([[4,16],[18,14],[23,17],[9,18]],9);
      line(5,16,15,14,10);line(9,18,22,17,5);
      poly([[9,18],[24,18],[23,21],[9,21]],6);
      poly([[6,12],[10,8],[16,10],[16,15],[8,15]],7);
      poly([[6,12],[10,8],[15,10],[12,12]],10);
      line(7,11,10,8,5);rect(10,10,3,1,6);
      rect(12,12,5,3,8);rect(15,10,14,2,3);line(16,10,28,10,5);
      rect(27,11,2,1,2);
    } else if(id==='SLAGGER') {
      shadow.rect(9,25,14,1,15);
      // A low hover wedge with an open gap under the skirt, no tread texture.
      poly([[5,14],[20,12],[28,17],[23,21],[5,21],[4,17]],7);
      poly([[5,14],[20,12],[26,16],[10,17],[4,17]],9);
      line(6,14,19,12,10);line(10,17,24,16,5);
      poly([[10,17],[27,17],[23,21],[5,21],[5,19]],6);
      rect(7,20,4,1,12);rect(19,20,4,1,12);rect(7,21,16,1,2);
      poly([[11,13],[16,11],[21,13],[18,16],[11,16]],8);
      line(12,13,16,11,10);rect(18,14,10,1,4);
      rect(4,17,2,2,facet(-1,0));
    } else if(id==='TITAN') {
      shadow.rect(6,25,20,1,15);
      rect(3,12,23,3,2);line(4,12,24,12,4);
      rect(3,21,23,4,2);for(let x=5;x<25;x+=4)rect(x,23,2,1,4);
      poly([[4,15],[20,13],[26,17],[26,22],[4,22]],7);
      poly([[4,15],[20,13],[25,16],[9,18]],9);line(5,15,13,14,10);
      rect(9,18,16,4,6);line(10,18,24,18,10);
      rect(11,20,5,1,3);rect(19,20,5,1,3);
      rect(11,8,10,7,7);rect(11,8,9,2,10);line(11,8,18,8,5);
      rect(13,10,3,1,6);rect(13,12,7,2,8);
      // Tall square mantlet and a small two-tube side pod.
      rect(20,10,4,4,8);rect(23,11,6,2,3);line(24,11,28,11,5);
      rect(5,12,5,5,6);rect(5,12,5,1,10);
      rect(6,14,1,2,14);rect(8,14,1,2,14);
    } else if(id==='GIANT') {
      shadow.rect(6,26,20,1,15);
      rect(3,12,24,4,2);line(4,12,25,12,4);
      rect(3,20,25,5,2);for(let x=5;x<27;x+=4)rect(x,23,2,1,4);
      poly([[4,15],[22,13],[27,16],[27,22],[4,22]],7);
      poly([[4,15],[22,13],[26,16],[9,18]],9);
      line(4,15,17,13,10);line(9,18,25,16,5);
      rect(9,18,17,4,6);rect(10,19,6,2,8);rect(19,19,6,2,8);
      rect(8,9,13,7,7);rect(8,9,12,2,10);line(8,9,18,9,5);
      rect(11,11,4,2,6);rect(15,12,7,4,8);
      // Parallel twin main guns; small rear secondary cupola is separate.
      rect(18,11,11,2,3);line(19,11,28,11,5);
      rect(20,15,9,2,3);line(21,15,28,15,4);
      rect(5,7,5,3,7);rect(5,7,4,1,10);line(8,8,13,6,4);
    } else if(id==='FALCON') {
      shadow.rect(9,20,13,1,15);
      // Broad rear delta and long bare nose: no external ordnance.
      poly([[8,15],[8,7],[12,7],[21,15]],8);
      poly([[8,8],[10,8],[16,14],[8,14]],9);line(8,7,11,7,5);
      poly([[8,17],[21,17],[12,26],[8,26]],7);
      line(8,18,8,24,9);line(10,24,17,18,6);
      poly([[4,14],[21,14],[29,16],[21,18],[4,18]],8);
      line(6,14,22,14,10);line(9,14,19,14,5);line(8,17,21,17,6);
      rect(21,15,3,1,11);rect(21,15,1,1,12);
      rect(28,15,1,2,4);rect(3,15,3,2,2);
    } else if(id==='HUNTER') {
      shadow.rect(9,22,14,1,15);
      poly([[13,15],[14,7],[17,7],[20,15]],8);
      poly([[13,17],[20,17],[17,25],[14,25]],7);
      line(14,8,14,13,10);line(14,20,14,24,9);
      for(const y of [11,19]){
        rect(8,y,15,2,8);line(9,y,22,y,10);rect(8,y,2,2,2);
        rect(20,y,3,1,5);
      }
      // Twin nacelles and isolated wing-tip missiles define the interceptor.
      for(const y of [7,24]){rect(14,y,9,1,13);rect(21,y,2,1,14);}
      poly([[4,14],[22,14],[29,16],[22,18],[4,18]],8);
      line(7,14,20,14,5);line(8,17,22,17,6);
      rect(22,15,2,1,11);rect(22,15,1,1,12);
      rect(28,15,1,2,4);rect(3,15,3,2,2);
      rect(5,12,3,2,9);line(5,12,7,12,10);
    } else if(id==='OCTOPUS') {
      shadow.rect(7,25,18,1,15);
      rect(4,15,21,3,2);line(5,15,23,15,4);
      rect(4,21,22,4,2);for(let x=6;x<25;x+=4)rect(x,23,2,1,4);
      rect(5,18,20,4,7);line(5,18,23,18,10);
      // A single rectangular launch box with six recessed mouths.
      poly([[7,9],[19,9],[25,13],[25,19],[13,19],[7,15]],7);
      poly([[7,9],[19,9],[25,13],[13,13]],9);line(8,9,18,9,5);
      poly([[7,9],[13,13],[13,19],[7,15]],facet(-1,0));
      rect(14,13,11,6,6);line(14,13,24,13,10);
      for(const x of [15,18,21])for(const y of [14,17]){
        rect(x,y,2,2,2);rect(x,y,1,1,13);
      }
    } else if(id==='ATLAS') {
      shadow.rect(8,25,17,1,15);
      // Open four-legged static mount, no hull or treads.
      line(14,19,4,24,3,2);line(17,19,26,24,3,2);
      line(13,18,6,15,3,2);line(18,18,25,15,3,2);
      rect(3,23,4,2,2);rect(24,23,4,2,2);
      line(4,23,6,23,4);line(24,23,26,23,4);
      rect(12,17,7,4,7);line(12,17,18,17,10);
      poly([[10,13],[14,10],[19,13],[17,17],[10,17]],8);
      line(11,13,14,10,5);rect(12,14,4,2,6);
      line(16,16,27,9,3,3);line(16,15,27,8,5);
      rect(26,8,3,3,2);line(26,8,28,8,5);
    } else if(id==='RABBIT') {
      shadow.rect(8,24,17,1,15);
      rect(6,21,4,3,2);rect(22,21,4,3,2);
      rect(7,21,2,1,4);rect(23,21,2,1,4);
      rect(8,18,15,3,7);line(8,18,22,18,10);
      rect(9,15,5,4,8);rect(10,15,3,2,11);rect(10,15,2,1,12);
      // Two short horizontal missiles above a low, open wheeled chassis.
      for(const y of [11,15]){
        rect(14,y,10,2,13);line(14,y,20,y,4);rect(22,y,2,2,14);
      }
      rect(16,17,2,2,3);
    } else if(id==='LYNX') {
      shadow.rect(6,24,19,1,15);
      rect(3,21,4,3,2);rect(21,21,4,3,2);
      rect(4,21,2,1,4);rect(22,21,2,1,4);
      rect(5,18,20,3,7);line(6,18,23,18,10);
      rect(7,16,5,3,8);rect(8,16,3,1,11);
      line(17,14,19,18,3,2);
      // One long missile and a small separate rear sensor.
      rect(10,11,18,2,13);line(11,11,23,11,4);
      rect(26,10,3,3,14);rect(27,11,2,1,13);
      line(6,14,6,17,3);rect(4,12,5,2,7);line(4,12,8,12,10);
    } else if(id==='SEEKER') {
      shadow.rect(6,24,19,1,15);
      rect(3,16,21,3,2);line(4,16,22,16,4);
      rect(3,21,23,3,2);for(let x=5;x<25;x+=4)rect(x,22,2,1,4);
      rect(4,18,21,3,7);line(5,18,24,18,10);
      rect(11,15,8,5,8);line(11,15,17,15,10);rect(13,17,5,2,6);
      // Thin parallel elevated AA barrels, with a clear gap between them.
      line(12,16,22,6,3,2);line(12,15,21,6,5);
      line(17,18,27,8,3,2);line(17,17,26,8,5);
      rect(27,8,2,1,4);
    } else if(id==='HAWKEYE') {
      shadow.rect(6,24,19,1,15);
      rect(3,16,23,3,2);line(4,16,24,16,4);
      rect(3,21,23,3,2);for(let x=5;x<25;x+=4)rect(x,22,2,1,4);
      rect(4,18,21,3,7);line(5,18,24,18,10);
      line(10,13,10,18,3,2);
      // Angular radar dish on the rear and a separate paired missile bank.
      poly([[7,8],[12,8],[15,11],[12,14],[7,14],[5,11]],8);
      poly([[7,8],[11,8],[13,10],[9,12],[6,11]],10);
      line(7,8,11,8,5);rect(9,10,2,2,6);
      line(18,17,24,10,13,2);line(22,18,28,11,13,2);
      rect(23,9,2,2,14);rect(27,10,2,2,14);
      rect(16,17,8,2,6);
    } else if(id==='MULE') {
      shadow.rect(7,25,18,1,15);
      // Cargo box, separate forward cab and three visible axle groups.
      for(const x of [5,12,22]){rect(x,22,4,3,2);rect(x+1,22,2,1,4);}
      rect(6,19,20,3,6);
      rect(5,11,13,9,7);rect(5,11,12,2,9);line(5,11,16,11,10);
      for(const x of [8,12,16])line(x,14,x,19,6);
      rect(6,14,1,5,left?7:9);
      poly([[19,15],[24,15],[27,18],[27,22],[19,22]],8);
      line(19,15,23,15,10);rect(20,16,4,2,11);rect(20,16,3,1,12);
      rect(25,20,2,1,5);line(19,21,25,21,6);
    } else if(id==='PELICAN') {
      shadow.rect(10,24,14,1,15);
      rect(3,16,11,2,7);rect(4,13,3,4,8);line(4,13,6,13,10);
      poly([[12,14],[22,14],[27,17],[27,21],[21,23],[11,21],[9,18]],7);
      poly([[12,14],[22,14],[25,16],[13,16],[10,18]],9);
      line(12,14,21,14,5);rect(13,17,7,4,8);line(14,20,19,20,6);
      rect(23,16,3,2,11);rect(23,16,2,1,12);
      line(12,23,24,23,3);line(14,21,14,23,3);line(22,21,22,23,3);
      line(16,11,16,15,3,2);
      // Long crossed rotor and cargo fuselage separate it from all fixed wings.
      line(4,9,28,18,3);line(5,20,26,7,4);
      line(5,9,13,12,5);line(18,12,25,8,5);
      rect(15,12,3,2,2);
    } else if(id==='TRIGGER') {
      // Low pressure plate, perimeter prongs; no vehicle chassis.
      shadow.rect(10,22,13,1,15);
      for(const p of [[7,14,11,17],[24,14,20,17],[7,22,11,19],[24,22,20,19]])
        line(...p,3);
      poly([[11,14],[20,14],[23,17],[23,20],[11,21],[9,18]],6);
      poly([[11,14],[20,14],[22,16],[12,17],[9,17]],9);
      line(11,14,19,14,10);rect(12,17,8,2,8);line(13,17,19,17,10);
      rect(10,17,1,1,4);rect(21,18,1,1,4);
    } else if(id==='BASE') {
      shadow.ellipse(17,24,10,2,15);
      // Low fortified compound: broken perimeter, open yard and stepped apron.
      // The rounded bunker, rear utility blocks and antenna make an irregular
      // silhouette inspired by the original installation, not a cuboid house.
      poly([[6,12],[10,8],[21,8],[25,12],[25,23],[21,26],[8,26],[5,22],[5,16]],2);
      poly([[7,13],[10,10],[21,10],[23,13],[23,22],[20,24],[9,24],[7,21]],6);
      line(8,12,10,10,10);line(10,10,19,10,9);
      line(7,13,7,20,9);line(8,21,10,23,9);
      line(10,24,17,24,8);line(24,14,24,22,7);
      // Recessed courtyard and an open entrance/ramp at the lower right.
      rect(15,13,7,9,2);rect(17,14,5,6,6);
      rect(18,20,5,4,3);rect(18,21,6,1,4);rect(19,23,7,1,3);
      rect(19,24,8,1,4);
      // Three uneven low service blocks; no enormous enclosing box.
      rect(18,10,3,3,8);rect(18,10,3,1,10);
      rect(21,12,2,5,7);rect(21,12,2,1,9);
      rect(10,21,6,3,8);rect(10,21,6,1,10);rect(11,23,4,1,7);
      // Armored dome: hard stepped value bands and an offset access neck.
      ellipse(12,17,6,4,7);ellipse(12,14,5,5,8);
      poly([[8,13],[10,10],[13,10],[15,12],[16,15],[14,17],[9,17],[7,15]],9);
      poly([[8,13],[10,10],[12,10],[12,12],[10,14],[8,14]],10);
      line(8,17,14,18,7);rect(14,17,3,3,8);rect(15,18,2,2,6);
      // Short mast with a crosspiece, anchored to a rear equipment pad.
      rect(18,7,4,3,7);rect(18,7,3,1,9);line(20,6,20,11,4);
      line(18,6,21,6,4);rect(19,5,2,1,5);
    } else throw new Error('Unknown unit artwork '+id);
    const out=new Surface(FRAME,FRAME);out.blit(shadow,0,0);
    for(let y=0;y<FRAME;y++)for(let x=0;x<FRAME;x++)if(s.get(x,y)) {
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(!s.get(x+dx,y+dy))out.set(x+dx,y+dy,1);
    }
    out.blit(s,0,0);
    // Selective outlining: lit upper/left contours inherit a pale edge. The
    // shadow-facing outline remains dark; never wrap the unit in a white halo.
    if(id!=='BASE')for(let y=0;y<FRAME;y++)for(let x=0;x<FRAME;x++) {
      const value=s.get(x,y);
      if(value===5||value===10) {
        if(!s.get(x,y-1)&&out.get(x,y-1)===1)out.set(x,y-1,value);
        if(value===5&&!s.get(x-1,y)&&out.get(x-1,y)===1)out.set(x-1,y,10);
      }
    }
    // Center the complete visible silhouette (including gun and shadow),
    // rather than merely centering its transparent source rectangle.
    let minX=FRAME,maxX=-1;
    out.p.forEach((p,i)=>{if(p){minX=Math.min(minX,i%FRAME);maxX=Math.max(maxX,i%FRAME);}});
    const shift=(FRAME-minX-maxX-1)/2;
    if(!Number.isInteger(shift))throw Error(id+'/'+facing+': author an even-width silhouette for exact horizontal centering');
    const centered=new Surface(FRAME,FRAME);centered.blit(out,shift,0);
    return centered;
  }
  function colorize(indexed,faction='union',spent=false) {
    const colors=palette(faction).map(v=>v?rgb(v):0), s=new Surface(indexed.w,indexed.h);
    indexed.p.forEach((index,i)=>{if(index){let color=colors[index];if(spent){const lum=Math.round(((color>>16)*.2126+((color>>8)&255)*.7152+(color&255)*.0722));color=lum*0x10101;}s.p[i]=0xff000000|color;}});
    return s;
  }
  const API={Surface,sprite,palette,colorize,rgb,RAMPS,FRAME,GEOMETRY};
  if(typeof module!=='undefined')module.exports=API;else root.UNIT_PIXEL_ART=API;
})(typeof globalThis!=='undefined'?globalThis:this);
