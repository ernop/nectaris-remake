#!/usr/bin/env node
/* Multi-core, resumable tournament runner. See AI_OPPONENTS.md for examples. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),crypto=require("node:crypto");
const {Worker,isMainThread,parentPort}=require("node:worker_threads");
const root=path.resolve(__dirname,"../.."),T=require(path.join(root,"js/ai-tournament.js"));
if(!isMainThread){
  const base=Object.assign({},global.UNIT_TYPES);
  parentPort.on("message",job=>{
    Object.keys(global.UNIT_TYPES).forEach(k=>delete global.UNIT_TYPES[k]);Object.assign(global.UNIT_TYPES,base,job.types||{});
    try{parentPort.postMessage(T.playSync(job.spec));}
    catch(error){parentPort.postMessage({index:job.spec.index,players:job.spec.players,map:job.spec.map.name,mapIndex:job.spec.mapIndex,seed:job.spec.seed,error:error.stack});}
  });
}else{
  const args=Object.fromEntries(process.argv.slice(2).map(a=>{let [key,...rest]=a.replace(/^--/,"").split("=");return [key,rest.length?rest.join("="):true];}));
  const allMaps=[require(path.join(root,"js/data-maps.js")),require(path.join(root,"js/data-advanced-maps.js")),require(path.join(root,"js/data-expansion-maps.js")),require(path.join(root,"js/data-basenectaris-maps.js")).BASE_NECTARIS_LEVELS,require(path.join(root,"js/data-ai-maps.js"))].flat();
  require(path.join(root,"js/data-environment-campaigns.js")).forEach(c=>allMaps.push(...c.levels));
  if(args.help){console.log("node tools/ai-research/run.cjs --opponents=classic,tactical,beam,monte-carlo,apex --boards=0,1 --cycles=10 --rounds=0 --workers=4 --seed=42 --work=standard --out=/tmp/nectaris-league\nUse --work=fast, standard or deep to control search budgets. Add --self-play to include same-AI games. One selected AI implies self-play. --boards=all selects all built-in boards; --list lists their indices. --config=file.json accepts a complete tournament config including custom maps. Resume with --out=PATH --resume. Archives contain run.json and games/BATCH/INDEX.json, each a replayable game.");process.exit(0);}
  if(args.list){allMaps.forEach((m,i)=>console.log(i+"\t"+m.name+"\t"+m.grid[0].length+"×"+m.grid.length));process.exit(0);}
  const files=["hex.js","data-terrain.js","data-units.js","combat.js","engine.js","ai.js","ai-model.js","ai-search.js","ai-tournament.js"];
  const hash=crypto.createHash("sha256");files.forEach(f=>hash.update(fs.readFileSync(path.join(root,"js",f))));const sourceHash=hash.digest("hex");
  const out=path.resolve(String(args.out||"/tmp/nectaris-tournament")),statePath=path.join(out,"run.json");
  let run;
  try{
    if(args.resume){run=JSON.parse(fs.readFileSync(statePath,"utf8"));if(run.sourceHash!==sourceHash)throw new Error("Code changed since this tournament began. Start a new run to keep ratings comparable.");}
    else{
      if(fs.existsSync(statePath))throw new Error("Output already contains a tournament. Use --resume or a new --out directory.");
      const input=args.config?JSON.parse(fs.readFileSync(String(args.config),"utf8")):{
        opponents:String(args.opponents||"classic,tactical,beam,monte-carlo,apex").split(","),
        maps:args.boards==="all"?allMaps:String(args.boards||"0,1").split(",").map(i=>allMaps[Number(i)]),cycles:Number(args.cycles||1),
        maxRounds:Number(args.rounds||0),workers:Number(args.workers||Math.min(4,Math.max(1,os.availableParallelism()-1))),work:String(args.work||"standard"),seed:Number(args.seed||42),k:Number(args.k||24),selfPlay:!!args["self-play"]};
      const config=T.normalize(input);run={id:crypto.randomUUID(),created:new Date().toISOString(),version:T.version,sourceHash,node:process.version,
        config,types:input.types||{},completed:0,errors:0,status:"running",ratings:T.standings(config.opponents),elapsed:0};
      fs.mkdirSync(out,{recursive:true});
    }
  }catch(error){console.error(error.message);process.exit(1);}
  function save(){const temp=statePath+".tmp";fs.writeFileSync(temp,JSON.stringify(run,null,2)+"\n");fs.renameSync(temp,statePath);}
  function gamePath(index){return path.join(out,"games",String(Math.floor(index/1000)).padStart(4,"0"),String(index).padStart(7,"0")+".json");}
  const pool=[],pending=new Map(),assigned=new Set();let stopping=false;
  function commit(result){
    const dest=gamePath(result.index);fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.writeFileSync(dest+".tmp",JSON.stringify(result)+"\n");fs.renameSync(dest+".tmp",dest);
    T.rate(run.ratings,result,run.config.k);run.completed++;run.elapsed+=result.ms||0;if(result.error)run.errors++;save();
    console.log(JSON.stringify(T.summary(result)));
  }
  // Recover an atomic game write that preceded an interrupted rating commit.
  while(run.completed<run.config.total&&fs.existsSync(gamePath(run.completed)))commit(JSON.parse(fs.readFileSync(gamePath(run.completed),"utf8")));
  function finish(){run.status="complete";save();pool.forEach(s=>s.worker.terminate());console.log(JSON.stringify({completed:run.completed,errors:run.errors,ratings:run.ratings,sourceHash,archive:out},null,2));if(run.errors)process.exitCode=1;}
  function drain(){
    while(pending.has(run.completed)){const r=pending.get(run.completed);pending.delete(run.completed);commit(r);}
    if(run.completed===run.config.total){finish();return;}dispatch();
  }
  function dispatch(){
    if(stopping)return;
    pool.forEach(s=>{
      if(s.index!==null)return;let i=run.completed;while(assigned.has(i)||pending.has(i))i++;
      if(i>=run.config.total||i-run.completed>=run.config.workers*2)return;
      s.index=i;assigned.add(i);s.worker.postMessage({spec:T.fixture(run.config,i),types:run.types});
    });
  }
  function stop(){if(stopping)return;stopping=true;pool.forEach(s=>s.worker.terminate());run.status="interrupted";save();console.error("Saved "+run.completed+" games. Resume with --out="+out+" --resume");}
  process.on("SIGINT",stop);process.on("SIGTERM",stop);
  run.status="running";save();
  if(run.completed===run.config.total)finish();else{
    for(let i=0;i<run.config.workers;i++){
      const worker=new Worker(__filename),slot={worker,index:null};pool.push(slot);
      worker.on("message",result=>{if(stopping)return;assigned.delete(slot.index);slot.index=null;pending.set(result.index,result);drain();});
      worker.on("error",error=>{console.error(error);stop();process.exitCode=1;});
    }dispatch();
  }
}
