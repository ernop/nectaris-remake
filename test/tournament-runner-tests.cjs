/* Real process/worker/atomic-file recovery, separate from the synchronous suite. */
"use strict";
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),assert=require("node:assert/strict"),{spawn}=require("node:child_process");
const script=path.resolve(__dirname,"../tools/ai-research/run.cjs"),dir=fs.mkdtempSync(path.join(os.tmpdir(),"nectaris-runner-test-"));
function run(args,interrupt){return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[script,...args],{stdio:["ignore","pipe","pipe"]});let output="",errors="",sent=false;
  child.stdout.on("data",chunk=>{output+=chunk;});
  // Observe the durable checkpoint, not stdout buffering (some hosts capture
  // subprocess output separately). Kill between committed games, mid-run.
  const timer=interrupt?setInterval(()=>{try{const r=JSON.parse(fs.readFileSync(path.join(dir,"run.json"),"utf8"));
    if(!sent&&r.completed>0){sent=true;child.kill("SIGKILL");}
  }catch(e){}},10):null;
  child.stderr.on("data",chunk=>{errors+=chunk;});child.on("error",reject);child.on("exit",code=>{if(timer)clearInterval(timer);resolve({code,output,errors});});
});}
(async()=>{
  try{
    const args=["--opponents=classic,tactical","--boards=0,1","--cycles=20","--rounds=3","--workers=2","--out="+dir];
    let result=await run(args,true);
    let state=JSON.parse(fs.readFileSync(path.join(dir,"run.json"),"utf8"));
    assert.notEqual(state.status,"complete");assert(state.completed>0&&state.completed<state.config.total);
    const prefix=state.completed;
    result=await run(["--out="+dir,"--resume"]);assert.equal(result.code,0,result.errors);
    state=JSON.parse(fs.readFileSync(path.join(dir,"run.json"),"utf8"));
    assert.equal(state.status,"complete");assert.equal(state.completed,80);assert.equal(state.errors,0);
    assert.equal(state.ratings.classic.games,80);assert.equal(state.ratings.tactical.games,80);
    const games=fs.readdirSync(path.join(dir,"games","0000"));assert.equal(games.filter(x=>x.endsWith(".json")).length,80);
    const before=JSON.stringify(state.ratings);
    // Simulate the other crash boundary: the final game rename succeeded but
    // its rating checkpoint did not. Resume must apply that game exactly once.
    const T=require("../js/ai-tournament.js"),partial={...state,status:"interrupted",completed:79,ratings:T.standings(state.config.opponents),elapsed:0};
    for(let i=0;i<79;i++){const g=JSON.parse(fs.readFileSync(path.join(dir,"games","0000",String(i).padStart(7,"0")+".json"),"utf8"));T.rate(partial.ratings,g,partial.config.k);partial.elapsed+=g.ms;}
    fs.writeFileSync(path.join(dir,"run.json"),JSON.stringify(partial));
    result=await run(["--out="+dir,"--resume"]);assert.equal(result.code,0,result.errors);
    state=JSON.parse(fs.readFileSync(path.join(dir,"run.json"),"utf8"));assert.equal(JSON.stringify(state.ratings),before);
    assert.equal(state.completed,80);
    result=await run(["--out="+dir,"--resume"]);assert.equal(result.code,0,result.errors);
    assert.equal(JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir,"run.json"),"utf8")).ratings),before);
    state.sourceHash="different source";fs.writeFileSync(path.join(dir,"run.json"),JSON.stringify(state));
    result=await run(["--out="+dir,"--resume"]);assert.equal(result.code,1);
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir,"run.json"),"utf8")).sourceHash,"different source");
    console.log("Tournament process checks passed: interrupted after "+prefix+" games, recovered all 80 exactly once, preserved completed Elo, rejected changed code.");
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
