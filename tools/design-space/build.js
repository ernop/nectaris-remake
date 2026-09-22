'use strict';
const fs=require('fs'),path=require('path'),os=require('os');
const {Surface}=require('../../art/units/pixel-art.js');
const {png,text,C}=require('../pixel-art-export.js');
const A=require('./icons.js'),concepts=require('./concepts.js');
const analysis=JSON.parse(fs.readFileSync(path.join(__dirname,'analysis.json'),'utf8'));
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'nectaris-prototypes-'));
const art={frame:32,anchor:[16,16],light:'screen-upper-left',palettes:{},frames:{},descriptions:{}};
for(const faction of ['union','xenon','attack','neutral'])art.palettes[faction]=A.palette(faction);
const custom={}, silhouettes=new Set();
const units=analysis.selected.map((u,i)=>{
  const c=concepts[i];if(!c||u.rank!==i+1)throw Error('Concept rank mismatch');
  const {gap:gapStory,...identity}=c;
  const result={...u,...identity,gapStory,images:{},terrain:analysis.method.terrains.map(t=>({id:t,reach:require('./analyze.js').reach(u,t)}))};
  const def={};for(const key of ['name','cls','move','moveType','atkG','atkA','def','rngG','rngA','capture','moveOrFire','moveAfterAttack','cargo','cargoTypes','cargoFactoryTypes','cannotEnter','placeByTransport'])if(result[key]!==undefined)def[key]=result[key];
  custom[c.id]=def;art.frames[c.id]={};art.descriptions[c.id]=c.art;
  for(const facing of ['right','left']){
    const s=A.sprite(c.id,facing);let minX=32,maxX=-1,minY=32,maxY=-1,count=0;
    for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(s.get(x,y)){
      if(Math.abs(x+.5-16)>14||Math.abs(y+.5-16)>14||Math.abs(x+.5-16)+Math.abs(y+.5-16)>22)throw Error(c.id+'/'+facing+' outside safe hex at '+x+','+y);
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;
    }
    if(minX!==31-maxX)throw Error(c.id+' is not centered');
    if(c.cls==='infantry'&&maxY-minY+1>17)throw Error(c.id+' infantry too tall: '+(maxY-minY+1));
    if(c.cls==='infantry'&&count>240)throw Error(c.id+' infantry too dense: '+count);
    const fingerprint=Array.from(s.p,p=>p?'1':'0').join('');
    if(facing==='right'){if(silhouettes.has(fingerprint))throw Error('Duplicate silhouette '+c.id);silhouettes.add(fingerprint);}
    art.frames[c.id][facing]=Array.from({length:32},(_,y)=>Array.from(s.p.slice(y*32,y*32+32),v=>v?v.toString(16):'.').join(''));
    for(const faction of ['union','xenon','attack','spent']){
      const file=path.join(scratch,c.id+'-'+faction+'-'+facing+'.png');
      png(A.colorize(s,faction==='spent'?'union':faction,faction==='spent'),file);
      result.images[faction+'-'+facing]='data:image/png;base64,'+fs.readFileSync(file).toString('base64');
    }
  }
  return result;
});
const named=id=>id.startsWith('PROTOTYPE_')?concepts[Number(id.slice(-2))-1].id:id;
for(const u of units)u.prior.id=named(u.prior.id);
const sheet=new Surface(580,370);sheet.rect(0,0,580,370,C('#121925'));
text(sheet,'NECTARIS / 15 GROUND PROTOTYPES',16,12,C('#f7d25c'));
units.forEach((u,i)=>{
  const x=16+(i%5)*114,y=38+Math.floor(i/5)*106;
  text(sheet,u.id,x,y,C('#e5f1ef'));
  for(const [j,facing,faction] of [[0,'right','union'],[1,'left','xenon']]){
    const cx=x+25,cy=y+28+j*34;
    sheet.poly([[cx-24,cy],[cx-8,cy-16],[cx+8,cy-16],[cx+24,cy],[cx+8,cy+16],[cx-8,cy+16]],C('#4b303b'));
    sheet.blit(A.colorize(A.sprite(u.id,facing),faction),cx-16,cy-16);
    text(sheet,j?'XENON':'UNION',x+52,cy-3,C(j?'#80c17a':'#73b5e8'));
  }
});
png(sheet,path.join(__dirname,'unit-sheet.png'));
fs.writeFileSync(path.join(__dirname,'custom-units.json'),JSON.stringify(custom,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'unit-art.json'),JSON.stringify(art,null,2)+'\n');
const data={...analysis,selected:units,custom,art};
const html=fs.readFileSync(path.join(__dirname,'page.html'),'utf8')
  .replace('/* INLINE_STYLE */',fs.readFileSync(path.join(__dirname,'page.css'),'utf8'))
  .replace('/* INLINE_DATA */','const DATA = '+JSON.stringify(data).replace(/</g,'\\u003c')+';')
  .replace('/* INLINE_APP */',fs.readFileSync(path.join(__dirname,'page.js'),'utf8'));
fs.writeFileSync(path.join(__dirname,'../unit-design-space.html'),html);
fs.rmSync(scratch,{recursive:true});
console.log('Built 15 dossiers, 30 directional frames, 120 embedded PNGs and a standalone HTML gallery.');
