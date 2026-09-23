/* Headless strength/latency evaluation. Both faction assignments, common seed
 * sets, real engine turns. No modifications to campaign definitions. */
"use strict";
const path=require("node:path"), fs=require("node:fs"), {performance}=require("node:perf_hooks");
const root=path.resolve(__dirname,"../..");
global.HEX=require(path.join(root,"js/hex.js"));
Object.assign(global,require(path.join(root,"js/data-terrain.js")));
Object.assign(global,require(path.join(root,"js/data-units.js")));
global.COMBAT=require(path.join(root,"js/combat.js"));
global.ENGINE=require(path.join(root,"js/engine.js"));
const AI=require(path.join(root,"js/ai.js"));
const maps=require(path.join(root,"js/data-maps.js")).concat(require(path.join(root,"js/data-advanced-maps.js")),require(path.join(root,"js/data-ai-maps.js")));
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const i=a.indexOf("=");return [a.slice(0,i),a.slice(i+1)];}));
const ids=(args.modes||"tactical,beam,monte-carlo,apex").split(","), indices=(args.maps||"0,1").split(",").map(Number), seeds=(args.seeds||"42,43").split(",").map(Number);
const opponent=args.against||"classic", results=[];
for(const id of ids)for(const mi of indices)for(const seed of seeds)for(const side of [0,1]){
  const game=new ENGINE.Game(maps[mi],{seed}), start=performance.now(), times=[];let actions=0;
  while(game.winner===null && actions<2*game.turnLimit+2){
    const method=game.currentPlayer===side?id:opponent,t=performance.now();
    AI.playTurn(game,game.currentPlayer,{id:method});times.push({id:method,ms:performance.now()-t});
    actions++;if(game.winner===null)game.endTurn();
  }
  const own=times.filter(t=>t.id===id).map(t=>t.ms).sort((a,b)=>a-b);
  const result={id,opponent,map:maps[mi].name,index:mi,seed,side,winner:game.winner,win:game.winner===side,
    reason:game.winReason,round:Math.min(game.turn,game.turnLimit),ms:Math.round(performance.now()-start),
    medianTurnMs:Math.round(own[Math.floor(own.length/2)]||0),maxTurnMs:Math.round(Math.max(0,...own))};
  results.push(result);console.log(JSON.stringify(result));
  if(args.out)fs.writeFileSync(args.out,JSON.stringify({date:new Date().toISOString(),node:process.version,args,results},null,2)+"\n");
}
console.log(JSON.stringify({summary:ids.map(id=>({id,games:results.filter(r=>r.id===id).length,wins:results.filter(r=>r.id===id&&r.win).length}))}));
