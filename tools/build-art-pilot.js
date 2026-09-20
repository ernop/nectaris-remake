#!/usr/bin/env node
/* Export the review pilot using only Node's standard library. */
'use strict';
const fs=require('fs'),path=require('path');
const A=require('../art/units/pixel-art.js');
const {Surface}=A;
const OUT=path.join(__dirname,'../art/pilot/output');fs.mkdirSync(OUT,{recursive:true});
const {png:writePNG,text,C}=require('./pixel-art-export.js');
const png=(surface,file)=>writePNG(surface,path.join(OUT,file));
function hash(x,y,seed=0){let h=Math.imul(x+seed*17,374761393)^Math.imul(y+seed*43,668265263);h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;}
const {FRAME,GEOMETRY:G}=A;
const hex=(cx,cy)=>[[cx-24,cy],[cx-8,cy-16],[cx+8,cy-16],[cx+24,cy],[cx+8,cy+16],[cx-8,cy+16]];
const center=(c,r)=>[24+G.pitch*c,16+G.pitch*r+G.stagger*(c&1)];
const frames={}, report=[];
for(const id of ['BISON','POLAR','EAGLE','CHARLIE','HADRIAN','BASE'])for(const facing of id==='BASE'?['right']:['right','left']) {
 const s=A.sprite(id,facing);let colors=new Set(),count=0,minX=FRAME,minY=FRAME,maxX=0,maxY=0;
 if(s.w!==FRAME||s.h!==FRAME)throw Error('Wrong frame size');
 for(let i=0;i<s.p.length;i++)if(s.p[i]){
  count++;colors.add(s.p[i]);const x=i%FRAME,y=Math.floor(i/FRAME),dx=Math.abs(x+.5-FRAME/2),dy=Math.abs(y+.5-FRAME/2);
  if(s.p[i]>15||dx>14||dy>14||dx+dy>22)throw Error(id+'/'+facing+': invalid pixel at '+x+','+y);
  minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
 }
 if(!count)throw Error('Empty sprite');
 if(minX!==FRAME-1-maxX)throw Error(id+'/'+facing+': horizontal padding must match exactly');
 report.push({id,facing,width:FRAME,height:FRAME,visibleBounds:[minX,minY,maxX-minX+1,maxY-minY+1],opaquePixels:count,paletteEntries:colors.size});
 for(const faction of ['union','xenon','attack']){
  frames[id+'-'+facing+'-'+faction]=A.colorize(s,faction);
  png(frames[id+'-'+facing+'-'+faction],id.toLowerCase()+'-'+faction+'-'+facing+'.png');
 }
 png(A.colorize(s,'union',true),id.toLowerCase()+'-spent-'+facing+'.png');
}
const sheet=new Surface(548,148);sheet.rect(0,0,548,148,C('#14151f'));
text(sheet,'ANGULAR MILITARY / NATIVE 32 X 32',16,12,C('#c0e4f6'));
for(const [i,id] of ['BISON','POLAR','EAGLE','CHARLIE','HADRIAN','BASE'].entries()){
 const x=18+i*88;text(sheet,id,x+12,33,C('#ecf4f0'));
 for(const [row,facing,faction] of [[0,'right','union'],[1,id==='BASE'?'right':'left','xenon']]){
  const cx=x+32,cy=72+row*46;
  sheet.poly(hex(cx,cy),C('#482f36'));
  sheet.blit(frames[id+'-'+facing+'-'+faction],cx-16,cy-16);
 }
}
png(sheet,'pilot-units-native.png');

// Author the terrain directly at this grid; never resample the old 64px pilot.
const W=336,H=240,ground=new Surface(W,H),mask=new Surface(W,H);
for(let c=0;c<10;c++)for(let r=0;r<7;r++)mask.poly(hex(...center(c,r)),1);
const P=['#342029','#3d2630','#482f36','#53363e','#65444a','#77555a',
 '#1b1720','#251c27','#302530','#51414b','#75606a','#a18485',
 '#42444c','#535760','#656c70','#7f8888','#a3abaa','#c1c7bd',
 '#766264','#92797a','#af9290','#c6aaa2','#41404b','#74727a'].map(C);
const hills=[[57,47,27,17],[85,41,26,20],[108,50,26,17],[83,56,23,14],[274,176,28,19],[301,184,27,16],[296,164,22,16]];
function hillHeight(x,y){let h=0;for(const [cx,cy,rx,ry] of hills){const q=((x-cx)/rx)**2+((y-cy)/ry)**2;h=Math.max(h,Math.sqrt(Math.max(0,1-q)));}return h;}
function rockRelief(x,y){return Math.sin((x+y*.7)/4)*.028+Math.sin((x-y*.2)/1.5)*.012+Math.sin(y/2)*.012;}
function river(y){return 181+10*Math.sin((y-24)/44)+4*Math.sin(y/15);}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 if(!mask.get(x,y))continue;
 const n=hash(x,y),cluster=hash(Math.floor(x/3),Math.floor(y/2),2)%16;
 let v=1;if(n%100<7)v=0;else if(n%100<15)v=2;else if(n%100<17&&cluster<6)v=3;
 const mountain=Math.max(1-((x-7)/77)**2-((y-229)/46)**2,1-((x-329)/49)**2-((y-13)/38)**2);
 const rough=(hash(Math.floor(x/2),Math.floor(y/2),11)%7-3)*.01;
 if(mountain+rough>0){const t=mountain+rough;v=t<.08?4:t<.21?9:t<.36?18:t<.53?19:t<.65?20:21;if(n%37===0&&t>.5)v=20;}
 const hill=hillHeight(x,y);
 if(hill>0){
  const gx=hillHeight(x-1,y)-hillHeight(x+1,y),gy=hillHeight(x,y-1)-hillHeight(x,y+1);
  const light=(-gx*5-gy*7+hill*.6+rockRelief(x,y)*5);
  v=hill<.16?9:12+Math.max(0,Math.min(5,Math.floor(1.1+light*1.8)));
  const chunk=hash(Math.floor(x/2),Math.floor(y/2),12)%43;
  if(hill>.2&&chunk<3)v=Math.min(17,v+1);
  if(hill>.2&&chunk>40)v=Math.max(12,v-1);
 }
 const bank=x-river(y)+(hash(Math.floor(y/2),0,9)%3-1),d=Math.abs(bank);
 if(d<18){v=d>15?4:d>13?(bank<0?10:9):d>11?(bank<0?11:8):d>8?8:d>5?7:6;if(d>12&&n%23===0)v=5;}
 ground.set(x,y,P[v]);
}
for(let k=0;k<45;k++){
 const x=13+hash(k,0,3)%(W-26),y=10+hash(k,4,5)%(H-20);
 if(!mask.get(x,y)||hillHeight(x,y)>0||Math.abs(x-river(y))<24||y>194&&x<95||y<55&&x>285)continue;
 if(k%5===0){
  ground.ellipse(x+1,y+1,4,2,P[0]);ground.ellipse(x,y,4,2,P[3]);ground.ellipse(x+1,y-1,3,1,P[0]);ground.line(x-2,y-1,x,y-2,P[4]);
 }else{ground.rect(x,y,2,1,P[0]);ground.set(x,y-1,P[3]);}
}
const road=[[12,149],[52,149],[75,128],[162,128],[209,128],[285,128],[322,144]];
for(const [color,width] of [[P[0],10],[P[22],8],[P[23],6]])for(let i=1;i<road.length;i++)ground.line(...road[i-1],...road[i],color,width);
for(let x=77;x<285;x+=9)ground.line(x,126,x+3,126,P[17]);
ground.rect(168,123,34,11,P[6]);ground.rect(168,124,34,8,P[23]);
ground.rect(167,122,35,2,P[17]);ground.rect(167,132,35,2,P[12]);
for(let x=170;x<200;x+=3){ground.rect(x,125,1,6,P[22]);ground.rect(x+1,125,1,6,P[15]);}
// Bases occupy real cell centers, set beside the road with their own access ramp.
const bases=[{col:1,row:4,faction:'union'},{col:9,row:3,faction:'xenon'}];
for(const b of bases){const [x,y]=center(b.col,b.row);ground.blit(frames['BASE-right-'+b.faction],x-16,y-16);}
for(let i=0;i<ground.p.length;i++)if(!mask.p[i])ground.p[i]=0;
png(ground,'terrain-native.png');
const DEPLOY=[
 {id:'BISON',col:3,row:3,faction:'union',facing:'right',selected:true},
 {id:'CHARLIE',col:2,row:2,faction:'union',facing:'right'},
 {id:'EAGLE',col:3,row:1,faction:'union',facing:'right'},
 {id:'POLAR',col:2,row:1,faction:'union',facing:'right'},
 {id:'HADRIAN',col:1,row:2,faction:'union',facing:'right'},
 {id:'BISON',col:7,row:3,faction:'xenon',facing:'left'},
 {id:'CHARLIE',col:8,row:3,faction:'xenon',facing:'left'},
 {id:'EAGLE',col:7,row:1,faction:'xenon',facing:'left'},
 {id:'POLAR',col:8,row:1,faction:'xenon',facing:'left'},
 {id:'HADRIAN',col:8,row:5,faction:'xenon',facing:'left'}
];
function mapScene(grid=false){const map=new Surface(W,H);map.rect(0,0,W,H,C('#19171e'));map.blit(ground,0,0);
 if(grid)for(let c=0;c<10;c++)for(let r=0;r<7;r++){const pts=hex(...center(c,r));pts.forEach((p,i)=>map.line(...p,...pts[(i+1)%6],C('#6b525b')));}
 const reachable=[[2,3],[3,2],[3,4],[4,2],[4,3]];
 for(const [c,r] of reachable){const p=hex(...center(c,r));p.forEach((pt,i)=>map.line(...pt,...p[(i+1)%6],C('#64737a')));}
 const p=hex(...center(3,3));p.forEach((pt,i)=>map.line(...pt,...p[(i+1)%6],C('#e4e6cd')));
 for(const u of DEPLOY){const [x,y]=center(u.col,u.row);map.blit(frames[u.id+'-'+u.facing+'-'+u.faction],x-16,y-16);}
 return map;}
const map=mapScene();png(map,'map-native.png');png(mapScene(true),'map-grid-native.png');
const ui=new Surface(548,310),ink=C('#e4e6dc'),muted=C('#98999f'),accent=C('#8ac2ed');
ui.rect(0,0,548,310,C('#15161d'));ui.rect(0,0,548,38,C('#20222b'));
text(ui,'NECTARIS',12,12,ink,2);text(ui,'UNION TURN',190,16,accent);text(ui,'TURN 04',289,16,ink);text(ui,'32 X 32 PILOT',388,16,muted);
ui.blit(map,8,42);ui.line(354,42,354,282,C('#353740'));
text(ui,'SELECTED UNIT',372,49,muted);text(ui,'BISON',372,67,ink,2);text(ui,'S-61 / MEDIUM TANK',372,89,accent);
ui.blit(frames['BISON-right-union'],428,113);
const stats=[['MOVEMENT','6'],['GROUND ATTACK','50'],['DEFENSE','40'],['RANGE','1']];
stats.forEach(([a,b],i)=>{text(ui,a,372,171+i*17,muted);text(ui,b,512,171+i*17,ink);});
ui.line(371,238,530,238,C('#353740'));text(ui,'ROAD / DEFENSE 0',372,249,ink);
ui.rect(372,266,158,19,C('#314963'));text(ui,'MOVE',436,272,C('#d3eafa'));
ui.rect(0,290,548,20,C('#20222b'));text(ui,'LUNAR CROSSING',12,296,ink);text(ui,'NATIVE 1X / 48 X 32 HEXES',366,296,muted);
png(ui,'map-context.png');
fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify({revision:4,style:'angular military silhouettes with flat armor and narrow fuselages',nativeFrame:[FRAME,FRAME],hexFootprint:[G.width,G.height],pitch:[G.pitch,G.pitch],stagger:G.stagger,light:'screen-upper-left',displayScale:1,horizontalAlignment:'opaque-bounds-centered',frames:report,deployment:DEPLOY,bases},null,2)+'\n');
console.log('Exported '+report.length+' validated 32px frames, palette variants, contact sheet and map previews to '+OUT);
