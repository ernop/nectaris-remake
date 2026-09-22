/* Reproducible constrained maximin search. No changes to the playable roster. */
'use strict';
const fs = require('fs');
const path = require('path');
const {UNIT_TYPES} = require('../../js/data-units.js');
const {TERRAIN, terrainCost} = require('../../js/data-terrain.js');
const stock = Object.values(UNIT_TYPES).filter(u => u.moveType !== 'air');
const SEED = 19890922, DRAWS = 240000;
const terrains = ['road','plain','hill','waste','mountain','valley'];
const weights = [0.25,0.15,0.20,0.20,0.20];
const groupNames = ['Firepower','Armor','Range bands','Terrain mobility','Turn / mission rules'];
const band = r => r === 0 ? [] : r === 1 ? [1] : Array.from({length:r-1},(_,i)=>i+2);
const mode = u => !u.move ? 'stationary' : u.moveOrFire ? 'set' : u.moveAfterAttack ? 'retreat' : 'normal';
function reach(u,t) {
  const c=terrainCost(TERRAIN[t],u.moveType,u);
  return !u.move || c===null ? 0 : TERRAIN[t].costsAllMovement ? 1 : Math.floor(u.move/c);
}
function passengers(u) {
  if(!u.cargo)return [];
  return u.cargoTypes || stock.map(s=>s.id);
}
function vector(u) {
  return {fire:[u.atkG/90,u.atkA/85], armor:u.def/80,
    bands:[band(u.rngG),band(u.rngA)], mobility:terrains.map(t=>reach(u,t)/(t==='valley'?1:9)),
    access:terrains.map(t=>!!u.move&&terrainCost(TERRAIN[t],u.moveType,u)!==null),
    capture:!!u.capture, mode:mode(u), cargo:passengers(u), factory:u.cargoFactoryTypes||[],
    placement:!!u.placeByTransport};
}
function jaccard(a,b) { const s=new Set([...a,...b]); return s.size ? 1-a.filter(x=>b.includes(x)).length/s.size : 0; }
function components(a,b) {
  return [(Math.abs(a.fire[0]-b.fire[0])+Math.abs(a.fire[1]-b.fire[1]))/2,
    Math.abs(a.armor-b.armor), (jaccard(a.bands[0],b.bands[0])+jaccard(a.bands[1],b.bands[1]))/2,
    .75*a.mobility.reduce((sum,x,i)=>sum+Math.abs(x-b.mobility[i]),0)/6+
      .25*a.access.reduce((sum,x,i)=>sum+(x!==b.access[i]),0)/6,
    ((a.capture!==b.capture)+(a.mode!==b.mode)+jaccard(a.cargo,b.cargo)*.75+jaccard(a.factory,b.factory)*.25+(a.placement!==b.placement))/4];
}
function distance(a,b,w=weights) { return components(a,b).reduce((sum,x,i)=>sum+x*w[i],0); }
// A deliberately simple screening budget, not a combat effectiveness model.
function budget(u) {
  return u.atkG/90+u.atkA/85+u.def/80+u.move/9+
    Math.max(0,u.rngG-1)/10+Math.max(0,u.rngA-1)/8+
    (u.capture?.3:0)+(u.cargo?.3:0)+(u.moveAfterAttack?.25:0)-(u.moveOrFire&&u.move?.25:0);
}
const budgetCeiling=Math.max(...stock.map(budget));
function dominates(a,b) {
  // Conservative partial order: action policies must match; all covered rings,
  // passenger rights, mobility values and abilities must be supersets.
  if(a.mode!==b.mode)return false;
  const contains=(x,y)=>y.every(v=>x.includes(v));
  if(a.fire.some((v,i)=>v<b.fire[i])||a.armor<b.armor||
    a.mobility.some((v,i)=>v<b.mobility[i])||b.access.some((v,i)=>v&&!a.access[i])||b.capture&&!a.capture||
    !contains(a.cargo,b.cargo)||!contains(a.factory,b.factory)||
    !a.bands.every((x,i)=>contains(x,b.bands[i])))return false;
  return JSON.stringify(a)!==JSON.stringify(b);
}
let seed=SEED;
function random(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;}
const pick=a=>a[Math.floor(random()*a.length)];
function draw() {
  const u={moveType:pick(['foot','wheels','treads']),move:pick([0,1,2,3,4,5,6,7,8,9]),
    atkG:pick([0,10,20,30,40,50,60,70,80,90]),atkA:pick([0,10,20,30,40,50,60,70,80,85]),
    def:pick([10,20,30,40,50,60,70,80]),rngG:0,rngA:0};
  if(u.atkG)u.rngG=pick([1,2,3,4,5,6]);
  if(u.atkA)u.rngA=pick([1,2,3,4,5]);
  const action=pick(['normal','set','retreat']);
  if(action==='set')u.moveOrFire=true;
  if(action==='retreat')u.moveAfterAttack=true;
  if(random()<.2)u.capture=true;
  if(random()<.18){u.cargo=1; const p=pick(['infantry','mule','all']);
    if(p==='infantry')u.cargoTypes=['CHARLIE','KILROY','PANTHER'];
    if(p==='mule'){u.cargoTypes=['CHARLIE','KILROY','ATLAS','TRIGGER'];u.cargoFactoryTypes=['PANTHER'];}}
  if(!u.move){u.placeByTransport=true;delete u.moveAfterAttack;delete u.moveOrFire;if(Math.max(u.rngG,u.rngA)>1)u.moveOrFire=true;}
  if(u.moveType==='treads'&&random()<.12)u.cannotEnter=['waste'];
  return u;
}
function feasible(u) {
  if(!u.move && (u.moveType!=='treads'||u.cargo||u.capture||u.moveAfterAttack))return false;
  if(u.moveType==='foot'&&(u.move>5||u.def>30||u.atkG+u.atkA>80||u.cargo))return false;
  if(u.moveType==='wheels'&&u.def>40)return false;
  if(u.capture&&(u.def>30||Math.max(u.rngG,u.rngA)>2||u.cargo))return false;
  if(u.cargo&&(!u.move||mode(u)!=='normal'||u.atkG>40||u.atkA>40||Math.max(u.rngG,u.rngA)>1))return false;
  if(u.moveAfterAttack&&(u.move<3||u.def>40||Math.max(u.rngG,u.rngA)>3))return false;
  if((u.rngG>=4||u.rngA>=4)&&!u.moveOrFire)return false;
  if(u.rngG===6&&u.move)return false;
  if(!u.atkG&&!u.atkA&&!(u.cargo||(!u.move&&u.def>=40)))return false;
  if(u.moveOrFire&&Math.max(u.rngG,u.rngA)<=1)return false;
  if(u.cannotEnter&&(!u.move||u.moveType!=='treads'))return false;
  return budget(u)<=budgetCeiling+1e-9;
}
function run() {
  seed=SEED;
  const sv=stock.map(vector), candidates=[], keys=new Set();
  let feasibleCount=0;
  for(let i=0;i<DRAWS;i++){
    const u=draw();if(!feasible(u))continue;feasibleCount++;
    const v=vector(u),key=JSON.stringify(v);if(keys.has(key))continue;keys.add(key);
    if(sv.some(s=>dominates(s,v)||dominates(v,s)))continue;
    const ds=sv.map(s=>distance(v,s)), initial=Math.min(...ds);
    if(initial<1e-9)continue;
    candidates.push({u,v,initial,min:initial,ds});
  }
  const selected=[], witnesses=[...stock];
  for(let rank=1;rank<=15;rank++) {
    let best=null; for(const c of candidates)if(!c.selected&&!c.excluded&&(!best||c.min>best.min))best=c;
    best.selected=true;
    const near=stock.map((s,i)=>({id:s.id,distance:best.ds[i],components:components(best.v,sv[i])})).sort((a,b)=>a.distance-b.distance).slice(0,3);
    const prior=witnesses.map(s=>({id:s.id,distance:distance(best.v,vector(s))})).sort((a,b)=>a.distance-b.distance)[0];
    const percentile=candidates.filter(c=>c.initial<=best.initial).length/candidates.length*100;
    const id='PROTOTYPE_'+String(rank).padStart(2,'0');
    selected.push({...best.u,id,rank,gap:best.min,baselineGap:best.initial,percentile,nearest:near,prior,budget:budget(best.u)});
    witnesses.push({...best.u,id});
    for(const c of candidates){
      c.min=Math.min(c.min,distance(c.v,best.v));
      if(dominates(c.v,best.v)||dominates(best.v,c.v))c.excluded=true;
    }
  }
  const distributions={};for(const k of ['atkG','atkA','def','move','rngG','rngA','moveType']){
    distributions[k]={};for(const u of stock)distributions[k][u[k]]=(distributions[k][u[k]]||0)+1;
  }
  const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const before=candidates.map(c=>c.initial), after=candidates.map(c=>c.min);
  const sensitivity=groupNames.map((name,i)=>{
    const w=weights.map((x,j)=>x*(i===j?1.5:1));const total=w.reduce((a,b)=>a+b,0);w.forEach((x,j)=>w[j]=x/total);
    let best=null;for(const c of candidates){const gap=Math.min(...sv.map(s=>distance(c.v,s,w)));if(!best||gap>best.gap)best={gap,u:c.u};}
    return {name,topGap:best.gap,top:best.u};
  });
  const data={method:{seed:SEED,draws:DRAWS,feasibleDraws:feasibleCount,candidates:candidates.length,
    weights,groupNames,budgetCeiling,terrains,coverage:{meanBefore:mean(before),meanAfter:mean(after),maxBefore:Math.max(...before),maxAfter:Math.max(...after)},sensitivity},stock,distributions,selected};
  fs.writeFileSync(path.join(__dirname,'analysis.json'),JSON.stringify(data,null,2)+'\n');
  console.log(JSON.stringify({method:data.method,selected},null,2));
  return data;
}
if(require.main===module)run();
module.exports={run,vector,distance,components,band,reach,budget,feasible,dominates,weights};
