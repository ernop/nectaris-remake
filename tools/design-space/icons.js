'use strict';
// Original pixel constructions, extending the project's native code-authored art.
// 32×32 frame, upper-left light, no traced/imported source pixels.
const {Surface,palette,colorize}=require('../../art/units/pixel-art.js');
function sprite(id,facing='right') {
  const s=new Surface(32,32), left=facing==='left';
  const rect=(x,y,w,h,c)=>s.rect(left?32-x-w:x,y,w,h,c);
  const poly=(p,c)=>s.poly(p.map(([x,y])=>[left?32-x:x,y]),c);
  const line=(x,y,x1,y1,c)=>s.line(left?31-x:x,y,left?31-x1:x1,y1,c);
  const top=(x,y,w)=>{rect(x,y,w,2,10);rect(x,y,w-2,1,5);};
  const slab=(x,y,w,h)=>{
    poly([[x,y],[x+w-4,y],[x+w,y+3],[x+w,y+h],[x+3,y+h],[x,y+h-2]],7);
    poly([[x,y],[x+w-4,y],[x+w,y+3],[x+3,y+3]],10);
    line(x,y,x+w-5,y,5);rect(x+3,y+3,w-3,h-3,8);
    line(x+3,y+h-1,x+w-1,y+h-1,6);
    rect(x,y+2,3,h-3,left?6:9);
  };
  const tracks=(x,y,w)=>{
    rect(x,y-6,w-2,3,2);line(x+1,y-6,x+w-4,y-6,4);
    rect(x,y,w,4,2);line(x+1,y,x+w-2,y,3);
    for(let n=x+2;n<x+w-1;n+=4){rect(n,y+2,2,1,4);rect(n,y+3,1,1,3);}
  };
  const gun=(x,y,len)=>{rect(x,y,len,2,3);line(x,y,x+len-1,y,5);rect(x+len-1,y+1,1,1,2);};
  const missile=(x,y,len)=>{line(x,y,x+len,y-len,2);line(x+1,y,x+len+1,y-len,14);line(x,y-1,x+len,y-len-1,5);};
  const wheel=(x,y)=>{rect(x,y,4,4,2);rect(x+1,y,2,1,4);rect(x+1,y+2,2,1,3);};
  const feet=(wide=false)=>{
    line(wide?5:8,22,12,17,4);line(wide?27:24,22,20,17,3);
    line(wide?5:8,12,12,16,4);line(wide?27:24,12,20,16,3);
    rect(wide?4:7,22,4,2,2);rect(wide?25:22,22,4,2,2);
    rect(wide?4:7,21,4,1,5);rect(wide?25:22,21,4,1,4);
  };
  const person=(x,y,pose='stand')=>{
    // Small helmet and limbs within a <=17-pixel-tall silhouette.
    rect(x+1,y,5,2,10);rect(x+1,y,4,1,5);rect(x,y+2,7,1,9);
    rect(x+2,y+3,3,2,4);rect(x+4,y+3,2,1,11);
    rect(x+1,y+5,5,5,8);rect(x,y+5,2,3,left?7:10);rect(x+2,y+5,3,1,5);
    rect(x+5,y+6,3,2,9);rect(x+7,y+7,2,1,4);
    if(pose==='run'){line(x+2,y+10,x-1,y+13,7);line(x+5,y+10,x+8,y+12,6);rect(x-2,y+13,4,1,3);rect(x+7,y+12,4,1,3);}
    else if(pose==='kneel'){rect(x+1,y+10,3,2,7);rect(x+4,y+10,5,2,6);rect(x,y+12,4,1,3);rect(x+7,y+12,3,1,3);}
    else {rect(x+1,y+10,2,3,7);rect(x+5,y+10,2,3,6);rect(x,y+13,4,1,3);rect(x+5,y+13,4,1,3);}
  };
  switch(id){
    case 'BASTION':
      feet(true);slab(10,13,13,8);slab(11,9,10,6);
      missile(7,16,5);missile(22,17,5);rect(14,11,4,2,11);rect(14,11,3,1,12);break;
    case 'HYDRA':
      tracks(5,22,19);slab(6,17,17,5);
      slab(6,12,9,5);slab(15,8,9,5);
      for(const [x,y] of [[8,13],[11,13],[17,9],[20,9]]){rect(x,y,2,2,14);rect(x,y,1,1,5);}
      line(15,17,18,13,3);missile(22,17,5);break;
    case 'TORTOISE':
      tracks(3,22,25);slab(4,12,24,11);slab(8,9,15,5);
      for(let x=9;x<26;x+=5){rect(x,17,4,4,7);top(x,17,4);}
      rect(14,11,5,2,2);rect(15,11,3,1,14);rect(5,17,2,3,5);break;
    case 'WATCHMAN':
      feet();slab(10,17,13,5);line(13,9,13,16,4);
      poly([[7,8],[15,6],[18,9],[10,11]],10);line(7,8,14,6,5);line(10,11,18,9,6);
      missile(19,16,5);missile(23,17,4);gun(20,19,6);break;
    case 'MARTEN':
      wheel(6,22);wheel(15,22);wheel(23,21);slab(7,18,19,5);
      person(10,12,'kneel');rect(19,14,7,2,14);line(19,14,27,14,5);rect(18,16,9,2,7);break;
    case 'MIDGE':
      person(10,11,'kneel');missile(17,18,6);rect(8,17,3,4,7);top(8,17,3);break;
    case 'GORGON':
      tracks(4,22,23);slab(5,14,21,9);slab(10,10,12,5);
      rect(7,8,3,6,3);top(6,7,5);gun(20,12,8);
      for(let x=10;x<23;x+=4)rect(x,19,3,2,9);missile(5,15,5);break;
    case 'BADGER':
      wheel(5,23);wheel(23,23);person(9,12,'kneel');
      slab(16,15,9,8);gun(20,16,8);rect(13,20,5,2,7);missile(5,18,5);break;
    case 'RAMPART':
      tracks(3,21,25);slab(3,12,25,10);
      poly([[6,11],[19,11],[26,16],[9,16]],10);line(6,11,19,11,5);
      for(let x=10;x<25;x+=5){rect(x,17,4,4,7);line(x,17,x+3,17,9);}
      rect(19,10,2,3,3);rect(19,9,4,1,5);rect(6,17,2,2,12);break;
    case 'HORNET':
      person(10,11);slab(5,15,7,7);slab(16,11,9,6);
      rect(19,12,4,2,14);rect(19,12,3,1,5);line(25,12,25,19,4);break;
    case 'ANVIL':
      feet(true);slab(9,15,15,8);slab(11,11,10,7);
      line(17,13,24,6,3);line(18,13,25,6,5);rect(24,6,2,2,4);
      gun(20,17,8);rect(12,13,4,1,12);break;
    case 'BASILISK':
      tracks(3,22,24);slab(4,14,23,9);slab(9,10,14,6);gun(19,11,10);
      missile(5,14,6);missile(9,15,5);rect(12,19,7,2,7);top(12,19,7);break;
    case 'LANCER':
      person(9,11,'kneel');missile(17,18,7);line(21,20,23,17,3);
      rect(20,21,6,2,3);line(20,20,25,20,5);rect(7,17,3,3,7);break;
    case 'STOAT':
      person(10,11,'run');rect(14,15,12,2,14);line(14,14,26,14,5);
      rect(25,15,2,1,4);rect(8,16,3,5,7);rect(8,16,3,1,10);break;
    case 'KESTREL':
      tracks(4,23,23);slab(5,17,21,6);slab(20,14,6,5);
      missile(7,17,7);missile(12,17,7);rect(5,9,2,7,3);
      poly([[4,7],[9,8],[9,11],[4,10]],9);line(4,7,8,8,5);rect(22,16,3,1,12);break;
    default:throw Error('Unknown prototype '+id);
  }
  const out=new Surface(32,32);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(s.get(x,y)) {
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(!s.get(x+dx,y+dy))out.set(x+dx,y+dy,1);
  }
  out.blit(s,0,0);
  // Keep highlights tied to screen upper-left for both facings.
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(s.get(x,y)===5){
    if(!s.get(x,y-1))out.set(x,y-1,5);
    if(!s.get(x-1,y))out.set(x-1,y,10);
  }
  let min=32,max=-1;
  out.p.forEach((p,i)=>{if(p){min=Math.min(min,i%32);max=Math.max(max,i%32);}});
  // Extend a lit horizontal contour by one pixel when its width is odd.
  if((max-min+1)%2){const y=Array.from({length:32},(_,y)=>y).find(y=>out.get(min,y)&&y>=10&&y<=21);out.set(min-1,y,3);min--;}
  const centered=new Surface(32,32);centered.blit(out,(31-min-max)/2,0);
  return centered;
}
module.exports={sprite,palette,colorize};
