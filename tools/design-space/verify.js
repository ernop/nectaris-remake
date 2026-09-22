'use strict';
// Checks the scientific artifact against the real engine and source roster.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const S=require('./analyze.js'),data=require('./analysis.json'),concepts=require('./concepts.js');
const {UNIT_TYPES,mergeUnitTypes}=require('../../js/data-units.js');
const COMBAT=require('../../js/combat.js'),ENGINE=require('../../js/engine.js');
const {TERRAIN}=require('../../js/data-terrain.js'),HEX=require('../../js/hex.js');
const custom=require('./custom-units.json'),art=require('./unit-art.json');
const stock=Object.values(UNIT_TYPES).filter(u=>u.moveType!=='air');
assert.deepEqual(data.stock,stock,'snapshot must match current source, including Pelican exclusion');
assert.equal(stock.length,19);assert.equal(data.selected.length,15);assert.equal(Object.keys(custom).length,15);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);
near(S.weights.reduce((a,b)=>a+b,0),1);
// Distance must ignore a move-or-fire flag when there is no movement to give up.
near(S.distance(S.vector(UNIT_TYPES.ATLAS),S.vector({...UNIT_TYPES.ATLAS,moveOrFire:false})),0);
// A direct shot and an indirect exact-two shot must not collapse together.
assert.ok(S.distance(S.vector(UNIT_TYPES.LYNX),S.vector({...UNIT_TYPES.LYNX,rngG:1}))>0);
// Lack of enough points is different from permanent terrain exclusion.
assert.ok(S.distance(S.vector({...UNIT_TYPES.BISON,move:1}),S.vector({...UNIT_TYPES.BISON,move:1,moveType:'wheels'}))>0);
const occupied=[...stock];
for(const [i,u] of data.selected.entries()){
  const c=concepts[i],definition=custom[c.id];
  for(const k of ['moveType','move','atkG','atkA','def','rngG','rngA','capture','moveAfterAttack','moveOrFire','placeByTransport','cargo','cannotEnter'])assert.deepEqual(definition[k],u[k],`${c.id}: authored layer changed ${k}`);
  const distances=stock.map(s=>({id:s.id,distance:S.distance(S.vector(s),S.vector(u))})).sort((a,b)=>a.distance-b.distance);
  near(distances[0].distance,u.baselineGap);
  near(Math.min(...occupied.map(s=>S.distance(S.vector(s),S.vector(u)))),u.gap);
  assert.deepEqual(distances.slice(0,3).map(d=>d.id),u.nearest.map(d=>d.id));
  for(const s of occupied){near(S.distance(S.vector(s),S.vector(u)),S.distance(S.vector(u),S.vector(s)));assert.ok(!S.dominates(S.vector(s),S.vector(u))&&!S.dominates(S.vector(u),S.vector(s)));}
  for(const air of [false,true])for(let d=0;d<=7;d++)assert.equal(S.band(air?u.rngA:u.rngG).includes(d),COMBAT.canAttackAt(definition,air,d),`${c.id}: analytical rings differ from actual combat engine`);
  occupied.push(u);
  for(const f of ['left','right']){
    const rows=art.frames[c.id][f];assert.equal(rows.length,32);rows.forEach(r=>assert.match(r,/^[.1-9a-f]{32}$/));
  }
}
for(const key of Object.keys(data.distributions)){
  const counts={};for(const u of stock)counts[u[key]]=(counts[u[key]]||0)+1;
  assert.deepEqual(counts,data.distributions[key]);
}
mergeUnitTypes(structuredClone(custom));
const game=new ENGINE.Game({name:'Prototype validation',grid:Array(30).fill('.'.repeat(30)),units:[]},{seed:1});
for(const id of Object.keys(custom)){
  const unit=ENGINE.makeUnit(id,0,15,15),pelican=ENGINE.makeUnit('PELICAN',0,14,15),mule=ENGINE.makeUnit('MULE',0,14,15);
  assert.equal(unit.strength,8);assert.equal(unit.movePointsLeft,custom[id].move);
  assert.equal(game.canLoad(pelican,unit),true,id+' Pelican compatibility');
  assert.equal(game.canLoad(mule,unit),false,id+' must not silently extend Mule whitelist');
  for(const terrain of data.method.terrains){
    const field=new ENGINE.Game({name:'Uniform '+terrain,grid:Array(30).fill(TERRAIN[terrain].ch.repeat(30)),units:[]},{seed:1});
    const range=Object.values(field.movementRange(unit));
    const furthest=Math.max(...range.map(p=>HEX.distance(unit.col,unit.row,p.col,p.row)));
    assert.equal(furthest,S.reach(custom[id],terrain),id+' analytical reach differs from engine on '+terrain);
  }
}
const html=fs.readFileSync(path.join(__dirname,'../unit-design-space.html'),'utf8');
assert.ok(!html.includes('INLINE_'),'unfinished HTML template');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1],{filename:'unit-design-space.html'});
assert.ok(!/<(?:script|link|img)[^>]+(?:src|href)="https?:/.test(html),'gallery must remain self-contained');
console.log('Verified source snapshot, 15 unchanged numerical designs, sequential gaps, non-dominance, engine firing bands, 90 engine terrain-reach cases, custom-unit loading, transport rules, 30 indexed frames and standalone script syntax.');
