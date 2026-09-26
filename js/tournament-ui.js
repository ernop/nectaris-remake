"use strict";
(function(){
  var $=function(id){return document.getElementById(id);},T=AI_TOURNAMENT,store,run=null,pool=[],pending=new Map(),assigned=new Set(),saving=false,page=0,lease=null,operation=Promise.resolve();
  function serialize(fn){operation=operation.then(fn,fn);return operation;}
  $("lab-start").disabled=true;
  var rows=[],chosen=new Set(["normal:0"]),replayData=null,replayGame=null,renderer=null,replayAt=0,playTimer=null,downloadUrl=null,historyRun=null,historyRequest=0,sessionStart=0,sessionBase=0,replayToken=0,replayDrag=null,replayNeedsFit=false,replayPhase="done",replayFollow=false,replayFocus=[],replaySpec=null,actionRecord=null,replayMotion=null;
  var groups=[{id:"normal",name:"Normal campaign",maps:CAMPAIGN},{id:"advanced",name:"Advanced campaign",maps:ADVANCED_CAMPAIGN},
    {id:"frontiers",name:"Lunar Frontiers",maps:EXPANSION_LEVELS},{id:"base",name:"Base Nectaris",maps:BASE_NECTARIS_LEVELS},{id:"ai",name:"AI-made",maps:AI_MADE_LEVELS}];
  ENVIRONMENT_CAMPAIGNS.forEach(function(c){groups.push({id:"terrain:"+c.id,name:c.name,maps:c.levels});});
  try{var custom=JSON.parse(localStorage.getItem("nectaris-custom-levels")||"[]");if(Array.isArray(custom)&&custom.length)groups.push({id:"custom",name:"Custom boards",maps:custom});}catch(e){}
  groups.forEach(function(group){group.maps.forEach(function(map,i){rows.push({key:group.id+":"+i,group:group.id,map:map});});});
  function error(e){$("lab-error").hidden=false;$("lab-error").textContent=e.message||String(e);}
  function clearError(){$("lab-error").hidden=true;}
  function label(id){return AI_SEARCH.get(id).label;}
  function cell(row,text){var td=document.createElement("td");td.textContent=text;row.appendChild(td);return td;}
  function option(select,value,text){var o=document.createElement("option");o.value=value;o.textContent=text;select.appendChild(o);}
  function duration(ms){return ms<1000?Math.round(ms)+" ms":ms<60000?(ms/1000).toFixed(1)+" s":(ms/60000).toFixed(1)+" min";}
  function openingLabel(g){
    if(g.error)return "Opening not verified";
    if(g.skipped)return g.reason==="opening-unavailable"?"Offers unavailable":"Offers · no deal";
    if(g.balance)return "Offers · "+(g.firstPlayer?"Xenon":"Union")+" first · "+g.balance.label;
    return "Normal · Union first"+(g.requestedOpening==="offers"?" (fallback)":"");
  }
  function openingSettings(){
    var mode=document.querySelector('input[name="lab-opening"]:checked').value;
    $("lab-no-deal-label").hidden=mode!=="offers";$("lab-offers-note").hidden=mode!=="offers";
    try{localStorage.setItem("nectaris-tournament-opening",mode);localStorage.setItem("nectaris-tournament-no-deal",$("lab-no-deal").value);}catch(e){}
  }
  try{
    if(localStorage.getItem("nectaris-tournament-opening")==="offers")document.querySelector('input[name="lab-opening"][value="offers"]').checked=true;
    if(localStorage.getItem("nectaris-tournament-no-deal")==="original")$("lab-no-deal").value="original";
  }catch(e){}
  openingSettings();
  function config(){return T.normalize({opponents:Array.from(document.querySelectorAll("#lab-opponents input:checked")).map(function(e){return e.value;}),
    maps:rows.filter(function(r){return chosen.has(r.key);}).map(function(r){return r.map;}),cycles:Number($("lab-cycles").value),
    maxRounds:Number($("lab-rounds").value),seed:Number($("lab-seed").value),workers:Number($("lab-workers").value),work:$("lab-work").value,k:Number($("lab-k").value),selfPlay:$("lab-self").checked,
    opening:document.querySelector('input[name="lab-opening"]:checked').value,noDeal:$("lab-no-deal").value});}
  function estimate(){try{var c=config();$("lab-estimate").textContent=c.total.toLocaleString()+" games · "+c.pairs.length+" matchups × "+c.maps.length+" boards × "+c.cycles+" repeats × "+c.legs+" mirrored games";}
    catch(e){$("lab-estimate").textContent=e.message;}$("lab-board-count").textContent=chosen.size+" boards selected across collections";}
  function boards(){var group=$("lab-collection").value,select=$("lab-boards");select.replaceChildren();rows.filter(function(r){return r.group===group;}).forEach(function(r){
    var total=r.map.units.length+(r.map.buildings||[]).reduce(function(n,b){return n+(b.stored||[]).length;},0);
    option(select,r.key,r.map.name+" · "+r.map.grid[0].length+"×"+r.map.grid.length+" · "+total+" units");select.lastChild.selected=chosen.has(r.key);
  });estimate();}
  AI_SEARCH.modes.forEach(function(m){var l=document.createElement("label"),i=document.createElement("input"),text=document.createElement("div"),note=document.createElement("span");
    i.type="checkbox";i.value=m.id;i.checked=true;text.textContent=m.label;note.textContent=m.description;text.appendChild(note);l.append(i,text);$("lab-opponents").appendChild(l);});
  groups.forEach(function(g){option($("lab-collection"),g.id,g.name);});boards();
  $("lab-workers").value=Math.min(4,Math.max(1,(navigator.hardwareConcurrency||4)-1));
  $("lab-randomize").onclick=function(){var seed=new Uint32Array(1);crypto.getRandomValues(seed);$("lab-seed").value=seed[0];estimate();};
  $("lab-form").oninput=function(){openingSettings();estimate();};$("lab-collection").onchange=boards;
  $("lab-boards").onchange=function(){Array.from(this.options).forEach(function(o){if(o.selected)chosen.add(o.value);else chosen.delete(o.value);});estimate();};
  $("lab-all").onclick=function(){rows.filter(function(r){return r.group===$("lab-collection").value;}).forEach(function(r){chosen.add(r.key);});boards();};
  $("lab-none").onclick=function(){chosen.clear();boards();};

  async function refreshRuns(){var list=await store.list(),select=$("lab-runs");select.replaceChildren();
    list.sort(function(a,b){return b.created.localeCompare(a.created);}).forEach(function(r){option(select,r.id,new Date(r.created).toLocaleString()+" · "+r.completed+"/"+r.config.total+" · "+r.status);});
    if(!list.length)option(select,"","No tournaments yet");if(run)select.value=run.id;
  }
  function active(){return run&&(run.status==="running"||run.status==="pausing"||run.status==="starting");}
  function wallTime(){return sessionStart?sessionBase+Date.now()-sessionStart:run&&run.wallMs||0;}
  function render(){
    $("lab-run").hidden=!run;if(!run)return;
    var count=run.completed,total=run.config.total;
    $("lab-status").textContent=(run.status==="running"?"Running — results save automatically":run.status)+" · "+count.toLocaleString()+" / "+total.toLocaleString()+" games"+(run.errors?" · "+run.errors+" errors":"")+(run.skipped?" · "+run.skipped+" skipped":"");
    $("lab-progress").max=total;$("lab-progress").value=count;
    $("lab-pause").disabled=run.status!=="running";$("lab-stop").disabled=!active()||run.status==="starting";
    $("lab-resume").disabled=active()||count>=total||!T.canResume(run);
    $("lab-start").disabled=active()||saving;$("lab-runs").disabled=active()||saving;$("lab-delete").disabled=active()||saving;
    $("lab-settings").textContent="v"+run.version+" · "+(run.config.opening==="offers"?"Offer for first / "+(run.config.noDeal==="original"?"normal fallback":"skip no deal"):"Normal opening")+" · seed "+run.config.seed+" · "+run.config.maps.length+" boards · "+run.config.workers+" workers · "+(run.config.work||"standard")+" search · K "+run.config.k+" · "+(run.config.maxRounds?run.config.maxRounds+"-round lab cap":"original map limits")+" · "+duration(run.elapsed||0)+" recorded compute time";
    $("lab-saved").textContent="Saved through game "+count+" of "+total+(run.savedAt?" · "+new Date(run.savedAt).toLocaleTimeString():"")+". Reloading keeps these results, replays and Elo; unfinished games restart on Resume."+
      (run.status==="interrupted"?" Recovered this run after a reload — press Resume to continue.":"");
    var finished=count+pending.size,wall=wallTime(),remaining=finished?wall/finished*(total-finished):null;
    $("lab-pace").textContent=(100*count/total).toFixed(1)+"% saved · "+duration(wall)+" elapsed"+
      (active()?(remaining!==null?" · roughly "+duration(remaining)+" remaining":" · estimating time after the first result"):
        run.status==="complete"?" · all results saved":" · saved games are ready to watch")+
      (pending.size?" · "+pending.size+" finished and saved, waiting for earlier games before rating":"")+
      (!T.canResume(run)?" · older protocol: view/export this run; start a new tournament to use the updated bots":"");
    var live=$("lab-live");live.replaceChildren();
    pool.filter(function(w){return w.job!==null;}).forEach(function(w){
      var spec=T.fixture(run.config,w.job),card=document.createElement("div"),title=document.createElement("strong"),names=document.createElement("span"),status=document.createElement("span"),p=w.progress;
      card.className="live-game";title.textContent="Game "+(w.job+1)+" · "+spec.map.name;
      names.textContent=label(spec.players[0])+" (Union) / "+label(spec.players[1])+" (Xenon)";
      status.textContent=!p?"Starting worker…":p.phase==="opening"?
        label(p.policy)+" evaluating opening package "+p.offer+" · "+(p.side?"Xenon":"Union"):
        "Round "+p.turn+" · "+(p.side?"Xenon":"Union")+" thinking / playing · "+p.actions+" actions recorded";
      card.append(title,names,status);live.appendChild(card);
    });
    if(!live.children.length)live.textContent="No active games";
    var tbody=$("lab-ratings");tbody.replaceChildren();Object.values(run.ratings).sort(function(a,b){return b.elo-a.elo;}).forEach(function(r){
      var tr=document.createElement("tr");[label(r.id),r.elo.toFixed(1),r.games,r.wins+" / "+r.draws+" / "+r.losses,r.games?(100*(r.wins+r.draws/2)/r.games).toFixed(1)+"%":"—",r.union+" / "+r.xenon,r.games?duration(r.ms/r.games):"—"].forEach(function(v){cell(tr,v);});tbody.appendChild(tr);
    });
    var pairs=$("lab-pairs");pairs.replaceChildren();Object.values(run.pairs||{}).forEach(function(p){var tr=document.createElement("tr");
      [label(p.a)+" / "+label(p.b),p.games,p.wins+" / "+p.draws+" / "+p.losses,(100*(p.wins+p.draws/2)/p.games).toFixed(1)+"%"].forEach(function(v){cell(tr,v);});pairs.appendChild(tr);
    });
  }
  function historyFilters(){
    if(historyRun===run.id)return;historyRun=run.id;page=0;
    var maps=$("lab-history-map"),pairs=$("lab-history-pair");maps.replaceChildren();pairs.replaceChildren();
    option(maps,"","All boards");option(pairs,"","All pairings");
    run.config.maps.forEach(function(m,i){option(maps,String(i),m.name);});
    (run.config.pairs||[]).forEach(function(p){option(pairs,p.slice().sort().join("|"),label(p[0])+" / "+label(p[1]));});
  }
  async function games(){if(!run)return;historyFilters();var id=run.id,start=page*25,request=++historyRequest;
    var found=await store.history(id,{map:$("lab-history-map").value,pair:$("lab-history-pair").value},start,25);
    if(!run||run.id!==id||request!==historyRequest)return;
    var tbody=$("lab-games");tbody.replaceChildren();found.rows.forEach(function(g){var tr=document.createElement("tr");
      [g.index+1,g.map,label(g.players[0]),label(g.players[1]),openingLabel(g),g.error?"Error: "+g.error:g.skipped?"Skipped · "+g.reason:g.winner===null?"Draw · "+g.reason:(g.winner?"Xenon":"Union")+" · "+g.reason,g.rounds||"—",duration(g.ms||0)].forEach(function(v){cell(tr,v);});
      var td=cell(tr,""),button=document.createElement("button");button.textContent=g.skipped?"Inspect":"Watch";button.disabled=!!g.error;
      button.onclick=function(){store.game(id,g.index).then(openReplay).catch(error);};td.appendChild(button);tbody.appendChild(tr);
    });$("lab-page").textContent=found.total?start+1+"–"+Math.min(start+25,found.total)+" of "+found.total+" saved games":"No finished games match this selection";
    $("lab-prev").disabled=page===0;$("lab-next").disabled=(page+1)*25>=found.total;
  }
  ["lab-history-map","lab-history-pair"].forEach(function(id){$(id).onchange=function(){page=0;games().catch(error);};});
  function stopWorkers(){pool.forEach(function(w){w.worker.onmessage=null;w.worker.onerror=null;w.worker.terminate();w.job=null;});pool=[];assigned.clear();}
  function release(){if(run)run.wallMs=wallTime();sessionStart=0;stopWorkers();if(lease){lease();lease=null;}}
  async function acquire(){
    if(!navigator.locks)throw new Error("This browser needs Web Locks to safely resume tournaments. Use a current Chrome, Edge, Firefox or Safari.");
    return new Promise(function(resolve,reject){navigator.locks.request("nectaris-tournament:"+run.id,{ifAvailable:true},async function(lock){
      if(!lock){reject(new Error("This tournament is already running in another tab."));return;}
      await new Promise(function(done){lease=done;resolve();});
    }).catch(reject);});
  }
  function persistResult(slot,result){
    var id=run.id,index=slot.job;
    return serialize(async function(){
      if(!run||run.id!==id)return;
      try{await store.stage(id,result);}catch(e){run.status="storage error";release();render();throw new Error("Could not save a finished game. Saved results are safe; Resume will replay unsaved work. "+e.message);}
      pending.set(index,result);assigned.delete(index);slot.job=null;slot.progress=null;await flushFinished();
    });
  }
  async function flushFinished(){
    if(saving)return;saving=true;
    try{
      while(pending.has(run.completed)){
        var result=pending.get(run.completed),next=Object.assign({},run,{
          ratings:JSON.parse(JSON.stringify(run.ratings)),pairs:JSON.parse(JSON.stringify(run.pairs))});
        T.rate(next.ratings,result,next.config.k);next.wallMs=wallTime();next.completed++;next.elapsed+=(result.ms||0);if(result.error)next.errors++;
        if(result.skipped)next.skipped=(next.skipped||0)+1;
        if(!result.error&&!result.skipped){var ids=result.players.slice().sort(),key=ids.join("|"),p=next.pairs[key]||(next.pairs[key]={a:ids[0],b:ids[1],games:0,wins:0,draws:0,losses:0});
          p.games++;if(result.winner===null)p.draws++;else if(result.players[result.winner]===p.a)p.wins++;else p.losses++;
        }
        if(next.completed===next.config.total)next.status="complete";
        await store.save(next,result);pending.delete(result.index);run=next;
      }
    }catch(e){run.status="storage error";release();error(new Error("Saving failed. The run has stopped; already saved games are safe. Free storage and Resume to retry unsaved games. "+e.message));}
    finally{saving=false;}
    if(run.status==="complete")release();
    if(run.status==="pausing"&&!pool.some(function(w){return w.job!==null;})&&!pending.size){run.status="paused";await store.save(run);release();}
    render();await games();await refreshRuns();if(run.status==="running")dispatch();
  }
  function dispatch(){
    if(!run||run.status!=="running")return;
    pool.forEach(function(slot){
      if(slot.job!==null)return;var index=run.completed;while(index<run.config.total&&(assigned.has(index)||pending.has(index)))index++;
      // Bound out-of-order replay memory if one long game holds up Elo order.
      if(index>=run.config.total||index-run.completed>=run.config.workers*2)return;
      slot.job=index;slot.progress=null;assigned.add(index);var spec=T.fixture(run.config,index);spec.protocol=run.version;slot.worker.postMessage({spec:spec,types:run.types});
    });render();
  }
  async function launch(){
    clearError();if(!T.canResume(run))throw new Error("This opening policy changed. Start a new tournament; existing results remain viewable.");
    run.status="starting";render();await acquire();pending.clear();assigned.clear();
    var recovered=await store.games(run.id,run.completed,run.config.workers*2);
    recovered.forEach(function(g){pending.set(g.index,g);});run.status="running";sessionBase=run.wallMs||0;sessionStart=Date.now();await store.save(run);
    await flushFinished();if(run.status!=="running")return;
    for(var i=0;i<run.config.workers;i++){
      var worker=new Worker("js/tournament-worker.js?v=20260925-tournaments-2"),slot={worker:worker,job:null,progress:null};pool.push(slot);
      (function(s){worker.onmessage=function(event){var data=event.data;
        if(data.type==="progress"){if(data.index!==s.job)return;s.progress=data.progress;render();return;}
        if(data.type!=="result"||data.result.index!==s.job)return;
        persistResult(s,data.result).catch(error);
      };
      worker.onerror=function(e){var index=s.job;if(index===null)return;var spec=T.fixture(run.config,index);
        run.status="pausing";persistResult(s,{index:index,players:spec.players,map:spec.map.name,mapIndex:spec.mapIndex,seed:spec.seed,error:e.message||"Worker failed"}).catch(error);
      };})(slot);
    }dispatch();
  }
  $("lab-form").onsubmit=async function(event){event.preventDefault();if(active()||saving)return;
    try{clearError();var c=config(),types={};try{types=JSON.parse(localStorage.getItem("nectaris-custom-units")||"{}");}catch(e){}
      run={id:crypto.randomUUID(),created:new Date().toISOString(),version:T.version,config:c,types:types,status:"starting",completed:0,elapsed:0,errors:0,ratings:T.standings(c.opponents),pairs:{}};
      pending.clear();page=0;render();$("lab-games").replaceChildren();$("lab-results").scrollIntoView({behavior:"smooth",block:"start"});await store.save(run);await refreshRuns();await launch();await games();$("lab-results").scrollIntoView({behavior:"smooth",block:"start"});$("lab-results").focus({preventScroll:true});
    }catch(e){if(run&&!pool.length)run.status="paused";release();render();error(e);}
  };
  $("lab-pause").onclick=function(){serialize(async function(){run.status="pausing";render();await store.save(run);await flushFinished();}).catch(error);};
  $("lab-stop").onclick=function(){serialize(async function(){run.status="stopped";stopWorkers();await flushFinished();await store.save(run);release();render();}).catch(error);};
  $("lab-resume").onclick=async function(){try{if(saving)return;run=await store.get(run.id);await launch();}catch(e){release();if(run)run.status="paused";render();error(e);}};
  $("lab-runs").onchange=async function(){if(active()||saving)return;pending.clear();run=await store.get(this.value);if(active())run.status="interrupted";page=0;render();await games();};
  $("lab-prev").onclick=function(){page=Math.max(0,page-1);games().catch(error);};$("lab-next").onclick=function(){page++;games().catch(error);};
  $("lab-delete").onclick=async function(){if(active()||saving||!confirm("Delete this tournament and all its saved replays?"))return;
    try{await acquire();await store.remove(run.id);release();run=null;await refreshRuns();var list=await store.list();if(list.length){run=list[list.length-1];if(active())run.status="interrupted";page=0;}render();await games();}
    catch(e){release();error(e);}};
  function download(blob,name){
    if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=downloadUrl;a.download=name;a.textContent="Download "+name;
    var host=$("lab-download");host.hidden=false;host.replaceChildren("Export ready. If your download did not start, ",a);a.click();
  }
  async function exportRun(archive){
    if(!run)return;var selected=JSON.parse(JSON.stringify(run)),name="nectaris-"+selected.id+(archive?".ndjson":".csv"),stream=null,chunks=[];
    try{
      if(archive&&window.showSaveFilePicker){var handle=await window.showSaveFilePicker({suggestedName:name});stream=await handle.createWritable();}
      // File System Access streams huge archives directly to disk. Else use
      // a bounded Blob export; individual game downloads remain available.
      if(!stream&&archive&&selected.completed+pending.size>2000)throw new Error("For archives over 2,000 games, use a browser with streaming file saves (Chrome/Edge), or the Node tournament runner. CSV export and individual replays remain available.");
      async function write(s){if(stream)await stream.write(s);else chunks.push(s);}
      var quote=function(s){return '"'+String(s).replace(/"/g,'""')+'"';};
      await write(archive?JSON.stringify({type:"run",run:selected})+"\n":"game,board,union,xenon,seed,winner,reason,rounds,ms,error,opening,first_player,bonus,union_switch,xenon_switch\n");
      for(var offset=0;offset<selected.config.total;){var batch=await store.games(selected.id,offset,100);if(!batch.length)break;offset=batch[batch.length-1].index+1;
        for(var g of batch)await write(archive?JSON.stringify({type:"game",game:g})+"\n":[g.index+1,g.map,g.players[0],g.players[1],g.seed,g.error?"error":g.skipped?"skipped":g.winner===null?"draw":g.players[g.winner],g.reason,g.rounds,g.ms,g.error||"",openingLabel(g),g.skipped||g.error?"":g.firstPlayer===1?"Xenon":"Union",g.balance?g.balance.label:"",
          g.negotiation&&g.negotiation.thresholds?String(g.negotiation.thresholds[0]):"",g.negotiation&&g.negotiation.thresholds?String(g.negotiation.thresholds[1]):""].map(quote).join(",")+"\n");
      }
      if(stream)await stream.close();else download(new Blob(chunks,{type:archive?"application/x-ndjson":"text/csv"}),name);
    }catch(e){if(stream)await stream.abort();if(e.name!=="AbortError")error(e);}
  }
  async function storageStatus(){
    if(!navigator.storage)return;
    var space=navigator.storage.estimate?await navigator.storage.estimate():{};
    var protectedStore=navigator.storage.persisted?await navigator.storage.persisted():false;
    $("lab-storage").textContent="Browser storage: "+Math.round((space.usage||0)/1048576)+" / "+Math.round((space.quota||0)/1048576)+" MB · "+(protectedStore?"protected from automatic eviction":"export archives for backup; storage may be cleared by the browser");
    $("lab-protect").disabled=protectedStore||!navigator.storage.persist;
  }
  $("lab-protect").onclick=async function(){try{var granted=await navigator.storage.persist();await storageStatus();
    if(!granted)$("lab-storage").textContent+=" · Browser did not grant protection; saved results still work.";
  }catch(e){error(e);}};
  $("lab-export").onclick=function(){exportRun(false);};$("lab-archive").onclick=function(){exportRun(true);};

  function stopPlayback(){if(replayMotion){replayMotion.cancel();replayMotion=null;}if(playTimer)clearTimeout(playTimer);playTimer=null;$("replay-play").textContent="Play";}
  function setFollow(on){replayFollow=!!on;var button=$("replay-follow");button.setAttribute("aria-pressed",replayFollow?"true":"false");button.textContent=replayFollow?"Following":"Follow action";}
  function clearMarks(){if(!renderer)return;renderer.flashUnits={};renderer.attackingUnitId=null;renderer.highlights=null;renderer.selected=null;renderer.strengthOverrides={};renderer.battleGhosts=[];renderer.explosions=[];}
  function focusCells(cells){replayFocus=cells||[];if(replayFollow&&replayFocus.length)renderer.frameHexes(replayFocus);}
  function battleView(parts){
    var stage=$("replay-battle-stage"),button=$("replay-battle-toggle");
    stage.hidden=!parts.screen;button.hidden=!parts.screen;
    if(parts.screen){stage.innerHTML=parts.screen;UNIT_VIEW.paint(stage);button.textContent="Show map";}
  }
  $("replay-battle-toggle").onclick=function(){var stage=$("replay-battle-stage");stage.hidden=!stage.hidden;this.textContent=stage.hidden?"Show battle":"Show map";};
  function showDock(parts){battleView(parts);$("replay-scene").innerHTML=parts.scene||"";$("replay-math").innerHTML=parts.math||"";UNIT_VIEW.paint($("replay-war"));$("replay-war").hidden=!parts.scene&&!parts.math;}
  function showLedger(){var row=actionRecord&&actionRecord[replayAt];$("replay-ledger").innerHTML=BATTLE_REPORT.ledgerHtml(row?row.ledger:BATTLE_REPORT.emptyLedger());}
  function updateScale(){var n=replayData?replayData.commands.length:0;$("replay-seek-end").textContent=String(n);$("replay-seek-mid").textContent=String(Math.round(n/2));}
  function settle(game,entry){
    if(entry[0]!=="attack"){T.command(game,entry);return null;}
    var args=T.decode(game,entry),attacker=args[0],defender=args[1],beforeA=attacker.strength,beforeD=defender.strength;
    return BATTLE_REPORT.snapshot(attacker,defender,T.command(game,entry),beforeA,beforeD);
  }
  function describe(game,entry){
    var args=T.decode(game,entry),name=entry[0],side=BATTLE_REPORT.faction;
    if(name==="moveUnit"){var unit=args[0],dest={col:args[1],row:args[2]},who=side(unit.player)+" "+UNIT_VIEW.name(unit);
      return {kind:"move",select:who+" selected · moving",done:who+" moved",cells:[{col:unit.col,row:unit.row},dest],selected:unit,dest:dest};}
    if(name==="attack"){var attacker=args[0],defender=args[1];
      return {kind:"attack",select:side(attacker.player)+" "+UNIT_VIEW.name(attacker)+" selected · attacking "+UNIT_VIEW.name(defender),attacker:attacker,defender:defender,cells:[{col:attacker.col,row:attacker.row},{col:defender.col,row:defender.row}]};}
    if(name==="finishUnit"){var finished=args[0],whoF=side(finished.player)+" "+UNIT_VIEW.name(finished);
      return {kind:"finish",select:whoF+" selected · finishing",done:whoF+" finished",cells:[{col:finished.col,row:finished.row}],selected:finished};}
    if(name==="unload"){var carrier=args[0],cargo=args[1],drop={col:args[2],row:args[3]};
      return {kind:"unload",select:side(carrier.player)+" "+UNIT_VIEW.name(carrier)+" selected · unloading "+UNIT_VIEW.name(cargo),done:side(carrier.player)+" unloaded "+UNIT_VIEW.name(cargo),cells:[{col:carrier.col,row:carrier.row},drop],selected:cargo,dest:drop};}
    if(name==="deployFromFactory"){var building=args[0],deployed=args[1],at={col:args[2],row:args[3]},whoD=side(deployed.player)+" "+UNIT_VIEW.name(deployed);
      return {kind:"deploy",select:whoD+" selected · deploying",done:whoD+" deployed",cells:[{col:building.col,row:building.row},at],dest:at};}
    if(name==="loadFromFactory"){var factory=args[0],passenger=args[1],transport=args[2],whoL=side(passenger.player)+" "+UNIT_VIEW.name(passenger);
      return {kind:"load",select:whoL+" selected · boarding "+UNIT_VIEW.name(transport),done:whoL+" boarded "+UNIT_VIEW.name(transport),cells:[{col:factory.col,row:factory.row},{col:transport.col,row:transport.row}],selected:transport};}
    if(name==="endTurn"){var ending=side(game.currentPlayer);return {kind:"end",select:ending+" ending the turn",done:ending+" ended the turn",cells:[]};}
    throw new Error("Replay has no description for "+name);
  }
  function markIntent(spec){
    clearMarks();
    if(spec.attacker){renderer.attackingUnitId=spec.attacker.id;renderer.flashUnits[spec.defender.id]="#ffffff";renderer.selected=spec.attacker;}
    else if(spec.selected){renderer.selected=spec.selected;renderer.flashUnits[spec.selected.id]="#ffe9a0";}
    if(spec.dest){renderer.highlights={};renderer.highlights[HEX.key(spec.dest.col,spec.dest.row)]="rgba(255,180,65,0.55)";}
  }
  async function buildRecord(game,token){
    var sim=ENGINE.Game.restore(game.initial),ledger=BATTLE_REPORT.emptyLedger();
    var marks=[{ledger:BATTLE_REPORT.cloneLedger(ledger),battle:null,caption:"",cells:[]}];
    for(var i=0;i<game.commands.length;i++){
      var spec=describe(sim,game.commands[i]),snap=settle(sim,game.commands[i]);
      if(snap)BATTLE_REPORT.record(ledger,snap.aPlayer,snap.assessed);
      marks.push({ledger:BATTLE_REPORT.cloneLedger(ledger),battle:snap,caption:spec.done||spec.select||"",cells:spec.cells||[]});
      if((i+1)%160===0){await new Promise(function(resolve){setTimeout(resolve,0);});if(token!==replayToken)return null;}
    }
    return marks;
  }
  function showIntent(){
    replaySpec=describe(replayGame,replayData.commands[replayAt]);replayPhase="intent";markIntent(replaySpec);focusCells(replaySpec.cells);
    if(replaySpec.kind==="attack")showDock(BATTLE_REPORT.previewHtml(replaySpec.attacker,replaySpec.defender,COMBAT.preview(replayGame,replaySpec.attacker,replaySpec.defender)));
    else showDock(BATTLE_REPORT.noteHtml(replaySpec.select||replaySpec.done));
    drawReplay();
  }
  function showArrived(){
    replayPhase="done";replaySpec=null;clearMarks();showLedger();
    var row=actionRecord&&actionRecord[replayAt];
    if(row&&row.battle){showDock(BATTLE_REPORT.present(row.battle));focusCells([{col:row.battle.aCol,row:row.battle.aRow},{col:row.battle.dCol,row:row.battle.dRow}]);}
    else if(row&&row.caption){showDock(BATTLE_REPORT.noteHtml(row.caption));focusCells(row.cells);}
    else if(!actionRecord&&replayAt)showDock(BATTLE_REPORT.noteHtml("Reading battles…"));
    else{$("replay-war").hidden=true;battleView({});replayFocus=[];}
    drawReplay();
  }
  function commit(onDone){
    var entry=replayData.commands[replayAt],kind=entry[0],spec=replaySpec,live=null;
    if(kind==="attack"){var args=T.decode(replayGame,entry),a=args[0],d=args[1],as=a.strength,ds=d.strength;
      live=BATTLE_REPORT.snapshot(a,d,T.command(replayGame,entry),as,ds);}
    else {
      var args=T.decode(replayGame,entry),result=T.command(replayGame,entry),unit=null,path=null;
      if(kind==="moveUnit"){unit=args[0];path=result.path;}
      else if(kind==="deployFromFactory"||kind==="unload"){unit=args[1];path=[{col:args[0].col,row:args[0].row},{col:args[2],row:args[3]}];}
      else if(kind==="loadFromFactory"){unit=args[1];path=[{col:args[0].col,row:args[0].row},{col:args[2].col,row:args[2].row}];}
      if(unit&&path){
        focusCells(path);
        replayMotion=MOVE_ANIMATION.play(renderer,unit,path,{stepMs:Math.max(65,Math.min(200,Number($("replay-speed").value)/3)),draw:drawReplay,done:function(){replayMotion=null;if(onDone)onDone(kind);}});
      }
    }
    replayAt++;replayPhase="done";replaySpec=null;clearMarks();showLedger();
    var row=actionRecord&&actionRecord[replayAt],snap=(row&&row.battle)||live;
    if(snap){showDock(BATTLE_REPORT.present(snap));focusCells([{col:snap.aCol,row:snap.aRow},{col:snap.dCol,row:snap.dRow}]);}
    else if(row&&row.caption){showDock(BATTLE_REPORT.noteHtml(row.caption));focusCells(row.cells||(spec&&spec.cells)||[]);}
    else if(spec&&spec.done)showDock(BATTLE_REPORT.noteHtml(spec.done));
    drawReplay();if(!replayMotion&&onDone)onDone(kind);return kind;
  }
  function beatDelay(kind){var step=Number($("replay-speed").value);return kind==="attack"&&$("replay-hold").checked?Math.max(step,2400):step;}
  function drawReplay(){
    if(!renderer||$("lab-viewer").hidden)return;var canvas=$("replay-canvas"),rect=canvas.getBoundingClientRect(),width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));
    var resized=canvas.width!==width||canvas.height!==height;
    if(resized){canvas.width=width;canvas.height=height;}
    renderer.game=replayGame;renderer.orientation="auto";
    if(resized||replayNeedsFit){
      if(replayFollow&&replayFocus.length)renderer.frameHexes(replayFocus);else renderer.fitToMap();
      replayNeedsFit=false;
    }
    renderer.draw();$("replay-seek").value=replayAt;
    var currentTurn=(replayData.turns||[]).filter(function(t){return t.at<=replayAt;}).pop();if(currentTurn)$("replay-turn").value=String(currentTurn.at);
    var phase=replayPhase==="intent"?"Selecting "+(replayAt+1):"Action "+replayAt;
    var last=replayPhase==="intent"?(replaySpec&&(replaySpec.select||replaySpec.done)||replayData.commands[replayAt][0]):replayAt?replayData.commands[replayAt-1][0]:"initial position";
    $("replay-position").textContent=phase+" / "+replayData.commands.length+" · round "+replayGame.turn+" · "+(replayGame.currentPlayer?"Xenon":"Union")+" · "+last+(replayGame.winner!==null?" · "+replayGame.winReason:"");
    showLedger();
  }
  function seek(at){if(!replayData)return;at=Math.max(0,Math.min(replayData.commands.length,at));
    try{if(at<replayAt || at-replayAt>128){replayGame=T.replay(replayData,at);replayAt=at;}
      while(replayAt<at)T.command(replayGame,replayData.commands[replayAt++]);showArrived();
    }catch(e){stopPlayback();error(new Error("Replay could not advance: "+e.message));}
  }
  async function openReplay(game){stopPlayback();var token=++replayToken;
    // Older archives are indexed once on opening, with yields to keep the UI responsive.
    if(!game.turns||!game.checkpoints){
      var indexed=ENGINE.Game.restore(game.initial);game.checkpoints=[];game.turns=[{at:0,turn:indexed.turn,side:indexed.currentPlayer}];
      for(var i=0;i<game.commands.length;i++){
        T.command(indexed,game.commands[i]);
        if(game.commands[i][0]==="endTurn")game.turns.push({at:i+1,turn:indexed.turn,side:indexed.currentPlayer});
        if((i+1)%128===0){var state=indexed.snapshot(),logLength=state.log.length;delete state.map;delete state.types;delete state.log;delete state.balance;
          game.checkpoints.push({at:i+1,state:state,logLength:logLength});await new Promise(function(resolve){setTimeout(resolve,0);});if(token!==replayToken)return;}
      }
      if(!game.final)game.final=indexed.snapshot();
    }
    if(token!==replayToken)return;
    replayData=game;replayAt=0;replayPhase="done";replaySpec=null;replayFocus=[];actionRecord=null;replayGame=ENGINE.Game.restore(game.initial);renderer=new RENDER.Renderer($("replay-canvas"),replayGame);setFollow(false);
    $("lab-form").inert=true;$("lab-results").inert=true;document.querySelector("body>header").inert=true;
    document.body.classList.add("reviewing");replayNeedsFit=true;$("lab-viewer").hidden=false;$("replay-title").textContent="Game "+(game.index+1)+" · "+game.map;
    $("replay-detail").textContent=label(game.players[0])+" (Union) vs "+label(game.players[1])+" (Xenon) · seed "+game.seed+" · "+game.reason+" · "+openingLabel(game)+
      (game.negotiation&&game.negotiation.thresholds?" · Switch points (Union / Xenon): "+game.negotiation.thresholds.map(function(t){return t===null?"none":t;}).join(" / "):"")+
      (game.negotiation&&game.negotiation.message?" · "+game.negotiation.message:"")+(game.version!==T.version?" · recorded with older engine/search version "+game.version:"");
    var turns=$("replay-turn");turns.replaceChildren();game.turns.forEach(function(t){option(turns,String(t.at),"Round "+t.turn+" · "+(t.side?"Xenon":"Union"));});
    $("replay-offers").textContent=game.negotiation&&game.negotiation.policies?game.negotiation.policies.map(function(p,side){
      if(!p)return (side?"Xenon":"Union")+": human responses";
      return label(p.id)+" ("+(side?"Xenon":"Union")+") · "+p.analysis.work+" opening search\n"+
        p.analysis.scores.map(function(s){return "Package "+s.offer+": first "+s.first.toFixed(1)+" / second "+s.second.toFixed(1)+(s.second>=s.first?" · accepts second":" · prefers first");}).join("\n");
    }).join("\n\n"):"No policy analysis recorded for this opening.";
    $("replay-seek").max=game.commands.length;updateScale();drawReplay();$("replay-close").focus();
    buildRecord(game,token).then(function(marks){if(!marks||token!==replayToken)return;actionRecord=marks;showLedger();if(replayPhase==="done")showArrived();}).catch(function(e){if(token===replayToken)error(e);});
  }
  function closeReplay(){$("lab-form").inert=false;$("lab-results").inert=false;document.querySelector("body>header").inert=false;stopPlayback();replayToken++;$("lab-viewer").hidden=true;document.body.classList.remove("reviewing");
    if(document.fullscreenElement===$("lab-viewer"))document.exitFullscreen().catch(error);
    $("lab-results").focus({preventScroll:true});
  }
  $("replay-close").onclick=closeReplay;
  $("replay-fullscreen").onclick=function(){var host=$("lab-viewer");
    if(document.fullscreenElement)document.exitFullscreen().catch(error);else if(host.requestFullscreen)host.requestFullscreen().catch(error);
  };
  document.addEventListener("fullscreenchange",function(){$("replay-fullscreen").textContent=document.fullscreenElement?"Exit fullscreen":"Fullscreen";drawReplay();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("lab-viewer").hidden&&!document.fullscreenElement)closeReplay();
    if(e.key==="Control"&&renderer)$("replay-canvas").style.cursor="grab";});
  document.addEventListener("keyup",function(e){if(e.key==="Control"&&renderer)$("replay-canvas").style.cursor="crosshair";});
  $("replay-fit").onclick=function(){setFollow(false);replayNeedsFit=true;drawReplay();};
  function zoomReplay(factor,x,y){if(!renderer)return;setFollow(false);var r=renderer,canvas=$("replay-canvas");x=x===undefined?canvas.width/2:x;y=y===undefined?canvas.height/2:y;
    var old=r.zoom;r.zoom=Math.max(r.minimumZoom(),Math.min(4,old*factor));r.originX=x-(x-r.originX)*r.zoom/old;r.originY=y-(y-r.originY)*r.zoom/old;r.constrainView();drawReplay();}
  $("replay-zoom-in").onclick=function(){zoomReplay(1.3);};$("replay-zoom-out").onclick=function(){zoomReplay(1/1.3);};
  $("replay-canvas").addEventListener("wheel",function(e){e.preventDefault();zoomReplay(e.deltaY<0?1.15:1/1.15,e.offsetX,e.offsetY);},{passive:false});
  $("replay-canvas").onmousedown=function(e){if(e.button===0&&e.ctrlKey){replayDrag={x:e.clientX,y:e.clientY};this.style.cursor="grabbing";e.preventDefault();}};
  window.addEventListener("mousemove",function(e){if(!replayDrag)return;setFollow(false);renderer.panBy(e.clientX-replayDrag.x,e.clientY-replayDrag.y);replayDrag={x:e.clientX,y:e.clientY};drawReplay();});
  window.addEventListener("mouseup",function(){replayDrag=null;$("replay-canvas").style.cursor="crosshair";});
  window.addEventListener("blur",function(){replayDrag=null;});
  $("replay-canvas").oncontextmenu=function(e){e.preventDefault();};
  $("replay-turn").onchange=function(){stopPlayback();seek(Number(this.value));};
  $("replay-seek").oninput=function(){stopPlayback();seek(Number(this.value));};
  $("replay-first").onclick=function(){stopPlayback();seek(0);};$("replay-last").onclick=function(){stopPlayback();seek(replayData.commands.length);};
  $("replay-back").onclick=function(){stopPlayback();if(replayPhase==="intent"){replayPhase="done";replaySpec=null;clearMarks();showArrived();}else seek(replayAt-1);};
  $("replay-forward").onclick=function(){stopPlayback();if(replayPhase==="intent")commit();else if(replayData&&replayAt<replayData.commands.length)showIntent();};
  function jumpBattle(dir){if(!replayData)return;stopPlayback();
    var start=dir>0?(replayPhase==="intent"&&replayData.commands[replayAt][0]==="attack"?replayAt+1:replayAt):replayAt-1;
    if(dir<0&&replayPhase!=="intent"&&replayAt>0&&replayData.commands[replayAt-1][0]==="attack")start=replayAt-2;
    for(var i=start;dir>0?i<replayData.commands.length:i>=0;i+=dir)if(replayData.commands[i][0]==="attack"){seek(i);showIntent();return;}
  }
  $("replay-prev-battle").onclick=function(){jumpBattle(-1);};$("replay-next-battle").onclick=function(){jumpBattle(1);};
  $("replay-follow").onclick=function(){setFollow(!replayFollow);if(replayFollow&&replayFocus.length){renderer.frameHexes(replayFocus);drawReplay();}};
  $("replay-play").onclick=function(){if(playTimer){stopPlayback();return;}if(replayPhase!=="intent"&&replayAt===replayData.commands.length)seek(0);
    function tick(){try{
      if(replayPhase==="intent"){
        commit(function(kind){
          if(replayAt===replayData.commands.length){stopPlayback();return;}
          playTimer=setTimeout(tick,beatDelay(kind));
        });return;
      }
      if(replayAt===replayData.commands.length){stopPlayback();return;}
      showIntent();playTimer=setTimeout(tick,beatDelay("select"));
    }catch(e){stopPlayback();error(e);}}
    $("replay-play").textContent="Pause";tick();
  };
  $("replay-download").onclick=function(){if(replayData)download(new Blob([JSON.stringify(replayData)],{type:"application/json"}),"nectaris-game-"+(replayData.index+1)+".json");};
  $("replay-import").onchange=async function(){
    var file=this.files[0];if(!file)return;
    try{if(file.size>20*1024*1024)throw new Error("Select an individual game JSON under 20 MB.");
      var data=JSON.parse(await file.text());if(!data.initial||!Array.isArray(data.commands)||!Array.isArray(data.players)||data.players.length!==2)throw new Error("This is not a recorded tournament game.");
      await openReplay(data);clearError();
    }catch(e){error(e);}finally{this.value="";}
  };
  $("replay-canvas").onmousemove=function(event){if(!renderer)return;var rect=this.getBoundingClientRect(),p=renderer.pixelToHex((event.clientX-rect.left)*this.width/rect.width,(event.clientY-rect.top)*this.height/rect.height);
    var u=p&&replayGame.unitAt(p.col,p.row);$("replay-hover").textContent=u?(u.player?"Xenon":"Union")+" · "+u.type.name+" · "+u.strength+" machines · experience "+u.exp+(u.cargo.length?" · cargo "+u.cargo.map(function(c){return c.type.name;}).join(", "):""):"Wheel to zoom · Ctrl+drag to pan · Hover units to inspect";
  };
  setInterval(function(){if(active())render();},1000);
  window.addEventListener("resize",drawReplay);
  TOURNAMENT_STORE.open().then(async function(s){store=s;$("lab-start").disabled=false;await refreshRuns();var list=await store.list();list.sort(function(a,b){return b.created.localeCompare(a.created);});
    if(list.length){run=list[0];if(active())run.status="interrupted";$("lab-runs").value=run.id;render();await games();}
    await storageStatus();
  }).catch(function(e){$("lab-start").disabled=true;error(e);});
})();
