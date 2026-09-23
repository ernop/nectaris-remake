/* Read-only AI research probe, not a strength rating or regression suite.
 * Run: node tools/ai-research/baseline.cjs [output.json]
 * Optional output goes only to the explicitly supplied path.
 */
const fs = require('node:fs');
const {performance} = require('node:perf_hooks');
const path = require('node:path');
const root = path.resolve(__dirname, '../..') + path.sep;
global.HEX = require(root + 'js/hex.js');
Object.assign(global, require(root + 'js/data-terrain.js'));
Object.assign(global, require(root + 'js/data-units.js'));
global.COMBAT = require(root + 'js/combat.js');
const ENGINE = require(root + 'js/engine.js');
const AI = require(root + 'js/ai.js');
const packs = [
 ['normal',require(root+'js/data-maps.js')],
 ['advanced',require(root+'js/data-advanced-maps.js')],
 ['frontiers',require(root+'js/data-expansion-maps.js')],
 ['base',require(root+'js/data-basenectaris-maps.js').BASE_NECTARIS_LEVELS],
 ['original',require(root+'js/data-ai-maps.js')]
];
const census = packs.flatMap(([pack,maps])=> maps.map(map=> {
 const g = new ENGINE.Game(map,{seed:42});
 const stops = g.playerUnits(0).map(u=>Object.values(g.movementRange(u)).filter(r=>r.canStop).length);
 return {pack,name:map.name,width:g.width,height:g.height,field:g.units.length,reserves:Object.values(g.buildings).reduce((a,b)=>a+b.stored.length,0),factories:Object.values(g.buildings).filter(b=>b.kind==='factory').length,turnLimit:g.turnLimit,unionUnits:stops.length,unionOpeningStops:stops.reduce((a,b)=>a+b,0),maxUnitStops:Math.max(...stops)};
}));
const fixture={name:'Research probe: immediate capture versus attack',grid:['.......','.......','B.....B','.......','.......'],buildings:[{col:0,row:2,owner:0},{col:6,row:2,owner:1}],units:[{t:'CHARLIE',o:0,x:5,y:2},{t:'CHARLIE',o:1,x:6,y:3},{t:'BISON',o:1,x:1,y:0}]};
const captureGame=new ENGINE.Game(fixture,{seed:42});
const captureRange=captureGame.movementRange(captureGame.units[0]);
const legalCapture=!!captureRange['6,2']?.canStop;
const aiEvents=AI.playTurn(captureGame,0).map(e=>e.t);
const directGame=new ENGINE.Game(fixture,{seed:42});
directGame.moveUnit(directGame.units[0],6,2);directGame.finishUnit(directGame.units[0]);
const probe={legalCapture,aiEvents,aiWinner:captureGame.winner,aiReason:captureGame.winReason,directWinner:directGame.winner,directReason:directGame.winReason};
console.log(JSON.stringify({censusSummary:{count:census.length,maxCells:Math.max(...census.map(x=>x.width*x.height)),maxReserves:Math.max(...census.map(x=>x.reserves))},selected:census.filter(x=>['REVOLT','NECTOR','TWISTED FJORDS','MIRROR FJORDS','DELTA CROSSINGS','POCKET SIEGE'].includes(x.name)),probe},null,2));
const chosen=[packs[0][1][0],packs[0][1][15],packs[1][1][15],packs[4][1][7],packs[4][1][11],packs[4][1][14]];
const games=[];
for(const map of chosen) for(const seed of [42,43,44]){
 const g=new ENGINE.Game(map,{seed});let halfTurns=0;const durations=[];const t=performance.now();
 while(g.winner===null && halfTurns<2*g.turnLimit+2){const start=performance.now();AI.playTurn(g,g.currentPlayer);durations.push(performance.now()-start);halfTurns++;if(g.winner===null)g.endTurn();}
 durations.sort((a,b)=>a-b);
 const out={name:map.name,seed,winner:g.winner,reason:g.winReason,round:g.turn,halfTurns,ms:Math.round(performance.now()-t),medianTurnMs:+durations[Math.floor(durations.length/2)].toFixed(2),maxTurnMs:+durations.at(-1).toFixed(2)};
 games.push(out);console.log(JSON.stringify(out));
}
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({date:new Date().toISOString(),node:process.version,census,fixture,probe,games},null,2) + '\n');
