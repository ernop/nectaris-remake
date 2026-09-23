"use strict";
(function(){
  var $=function(id){return document.getElementById(id);},T=AI_TOURNAMENT,store,run=null,pool=[],pending=new Map(),assigned=new Set(),saving=false,page=0,lease=null,operation=Promise.resolve();
  function serialize(fn){operation=operation.then(fn,fn);return operation;}
  $("lab-start").disabled=true;
  var rows=[],chosen=new Set(["normal:0"]),replayData=null,replayGame=null,renderer=null,replayAt=0,playTimer=null;
  var groups=[{id:"normal",name:"Normal campaign",maps:CAMPAIGN},{id:"advanced",name:"Advanced campaign",maps:ADVANCED_CAMPAIGN},
    {id:"frontiers",name:"Lunar Frontiers",maps:EXPANSION_LEVELS},{id:"base",name:"Base Nectaris",maps:BASE_NECTARIS_LEVELS},{id:"ai",name:"AI-made",maps:AI_MADE_LEVELS}];
  try{var custom=JSON.parse(localStorage.getItem("nectaris-custom-levels")||"[]");if(Array.isArray(custom)&&custom.length)groups.push({id:"custom",name:"Custom boards",maps:custom});}catch(e){}
  groups.forEach(function(group){group.maps.forEach(function(map,i){rows.push({key:group.id+":"+i,group:group.id,map:map});});});
  function error(e){$("lab-error").hidden=false;$("lab-error").textContent=e.message||String(e);}
  function clearError(){$("lab-error").hidden=true;}
  function label(id){return AI_SEARCH.get(id).label;}
  function cell(row,text){var td=document.createElement("td");td.textContent=text;row.appendChild(td);return td;}
  function option(select,value,text){var o=document.createElement("option");o.value=value;o.textContent=text;select.appendChild(o);}
  function duration(ms){return ms<1000?Math.round(ms)+" ms":ms<60000?(ms/1000).toFixed(1)+" s":(ms/60000).toFixed(1)+" min";}
  function config(){return T.normalize({opponents:Array.from(document.querySelectorAll("#lab-opponents input:checked")).map(function(e){return e.value;}),
    maps:rows.filter(function(r){return chosen.has(r.key);}).map(function(r){return r.map;}),cycles:Number($("lab-cycles").value),
    maxRounds:Number($("lab-rounds").value),seed:Number($("lab-seed").value),workers:Number($("lab-workers").value),k:Number($("lab-k").value),selfPlay:$("lab-self").checked});}
  function estimate(){try{var c=config();$("lab-estimate").textContent=c.total.toLocaleString()+" games · "+c.pairs.length+" matchups × "+c.maps.length+" boards × "+c.cycles+" cycles × both sides";}
    catch(e){$("lab-estimate").textContent=e.message;}$("lab-board-count").textContent=chosen.size+" boards selected across collections";}
  function boards(){var group=$("lab-collection").value,select=$("lab-boards");select.replaceChildren();rows.filter(function(r){return r.group===group;}).forEach(function(r){
    option(select,r.key,r.map.name+" · "+r.map.grid[0].length+"×"+r.map.grid.length+" · "+r.map.units.length+" units");select.lastChild.selected=chosen.has(r.key);
  });estimate();}
  AI_SEARCH.modes.forEach(function(m){var l=document.createElement("label"),i=document.createElement("input"),text=document.createElement("div"),note=document.createElement("span");
    i.type="checkbox";i.value=m.id;i.checked=true;text.textContent=m.label;note.textContent=m.description;text.appendChild(note);l.append(i,text);$("lab-opponents").appendChild(l);});
  groups.forEach(function(g){option($("lab-collection"),g.id,g.name);});boards();
  $("lab-workers").value=Math.min(4,Math.max(1,(navigator.hardwareConcurrency||4)-1));
  $("lab-form").oninput=estimate;$("lab-collection").onchange=boards;
  $("lab-boards").onchange=function(){Array.from(this.options).forEach(function(o){if(o.selected)chosen.add(o.value);else chosen.delete(o.value);});estimate();};
  $("lab-all").onclick=function(){rows.filter(function(r){return r.group===$("lab-collection").value;}).forEach(function(r){chosen.add(r.key);});boards();};
  $("lab-none").onclick=function(){chosen.clear();boards();};

  async function refreshRuns(){var list=await store.list(),select=$("lab-runs");select.replaceChildren();
    list.sort(function(a,b){return b.created.localeCompare(a.created);}).forEach(function(r){option(select,r.id,new Date(r.created).toLocaleString()+" · "+r.completed+"/"+r.config.total+" · "+r.status);});
    if(!list.length)option(select,"","No tournaments yet");if(run)select.value=run.id;
  }
  function active(){return run&&(run.status==="running"||run.status==="pausing");}
  function render(){
    $("lab-run").hidden=!run;if(!run)return;
    var count=run.completed,total=run.config.total;
    $("lab-status").textContent=run.status+" · "+count.toLocaleString()+" / "+total.toLocaleString()+" games"+(run.errors?" · "+run.errors+" errors":"");
    $("lab-progress").max=total;$("lab-progress").value=count;
    $("lab-pause").disabled=run.status!=="running";$("lab-stop").disabled=!active();
    $("lab-resume").disabled=active()||count>=total||run.version!==T.version;
    $("lab-start").disabled=active()||saving;$("lab-runs").disabled=active()||saving;$("lab-delete").disabled=active()||saving;
    $("lab-settings").textContent="v"+run.version+" · seed "+run.config.seed+" · "+run.config.maps.length+" boards · "+run.config.workers+" workers · K "+run.config.k+" · "+(run.config.maxRounds?run.config.maxRounds+"-round lab cap":"original map limits")+" · "+duration(run.elapsed||0)+" recorded compute time";
    $("lab-live").textContent=pool.filter(function(w){return w.job!==null;}).map(function(w){return "Game "+(w.job+1)+(w.progress?": round "+w.progress.turn+", "+(w.progress.side?"Xenon":"Union"):" starting…");}).join(" · ")||"No active games";
    var tbody=$("lab-ratings");tbody.replaceChildren();Object.values(run.ratings).sort(function(a,b){return b.elo-a.elo;}).forEach(function(r){
      var tr=document.createElement("tr");[label(r.id),r.elo.toFixed(1),r.games,r.wins+" / "+r.draws+" / "+r.losses,r.games?(100*(r.wins+r.draws/2)/r.games).toFixed(1)+"%":"—",r.union+" / "+r.xenon,r.games?duration(r.ms/r.games):"—"].forEach(function(v){cell(tr,v);});tbody.appendChild(tr);
    });
    var pairs=$("lab-pairs");pairs.replaceChildren();Object.values(run.pairs||{}).forEach(function(p){var tr=document.createElement("tr");
      [label(p.a)+" / "+label(p.b),p.games,p.wins+" / "+p.draws+" / "+p.losses,(100*(p.wins+p.draws/2)/p.games).toFixed(1)+"%"].forEach(function(v){cell(tr,v);});pairs.appendChild(tr);
    });
  }
  async function games(){if(!run)return;var id=run.id,start=page*25,list=await store.games(id,start,25);if(!run||run.id!==id)return;
    var tbody=$("lab-games");tbody.replaceChildren();list.forEach(function(g){var tr=document.createElement("tr");
      [g.index+1,g.map,label(g.players[0]),label(g.players[1]),g.error?"Error: "+g.error:g.winner===null?"Draw · "+g.reason:(g.winner?"Xenon":"Union")+" · "+g.reason,g.rounds||"—",duration(g.ms||0)].forEach(function(v){cell(tr,v);});
      var td=cell(tr,""),button=document.createElement("button");button.textContent="Watch";button.disabled=!!g.error;button.onclick=function(){openReplay(g).catch(error);};td.appendChild(button);tbody.appendChild(tr);
    });$("lab-page").textContent=run.completed?start+1+"–"+Math.min(start+25,run.completed)+" of "+run.completed:"No finished games";
    $("lab-prev").disabled=page===0;$("lab-next").disabled=(page+1)*25>=run.completed;
  }
  function stopWorkers(){pool.forEach(function(w){w.worker.onmessage=null;w.worker.onerror=null;w.worker.terminate();w.job=null;});pool=[];assigned.clear();}
  function release(){stopWorkers();if(lease){lease();lease=null;}}
  async function acquire(){
    if(!navigator.locks)throw new Error("This browser needs Web Locks to safely resume tournaments. Use a current Chrome, Edge, Firefox or Safari.");
    return new Promise(function(resolve,reject){navigator.locks.request("nectaris-tournament:"+run.id,{ifAvailable:true},async function(lock){
      if(!lock){reject(new Error("This tournament is already running in another tab."));return;}
      await new Promise(function(done){lease=done;resolve();});
    }).catch(reject);});
  }
  function persistFinished(){return serialize(flushFinished);}
  async function flushFinished(){
    if(saving)return;saving=true;
    try{
      while(pending.has(run.completed)){
        var result=pending.get(run.completed),next=JSON.parse(JSON.stringify(run));
        T.rate(next.ratings,result,next.config.k);next.completed++;next.elapsed+=(result.ms||0);if(result.error)next.errors++;
        if(!result.error){var ids=result.players.slice().sort(),key=ids.join("|"),p=next.pairs[key]||(next.pairs[key]={a:ids[0],b:ids[1],games:0,wins:0,draws:0,losses:0});
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
      slot.job=index;slot.progress=null;assigned.add(index);slot.worker.postMessage({spec:T.fixture(run.config,index),types:run.types});
    });render();
  }
  async function launch(){
    clearError();await acquire();pending.clear();assigned.clear();run.status="running";await store.save(run);
    for(var i=0;i<run.config.workers;i++){
      var worker=new Worker("js/tournament-worker.js?v=20260923-search-2"),slot={worker:worker,job:null,progress:null};pool.push(slot);
      (function(s){worker.onmessage=function(event){var data=event.data;
        if(data.type==="progress"){s.progress=data.progress;render();return;}
        if(data.type!=="result"||data.result.index!==s.job)return;
        pending.set(s.job,data.result);assigned.delete(s.job);s.job=null;s.progress=null;persistFinished().catch(error);
      };
      worker.onerror=function(e){var index=s.job;if(index===null)return;var spec=T.fixture(run.config,index);
        pending.set(index,{index:index,players:spec.players,map:spec.map.name,mapIndex:spec.mapIndex,seed:spec.seed,error:e.message||"Worker failed"});assigned.delete(index);s.job=null;
        run.status="pausing";persistFinished().catch(error);
      };})(slot);
    }dispatch();
  }
  $("lab-form").onsubmit=async function(event){event.preventDefault();if(active()||saving)return;
    try{clearError();var c=config(),types={};try{types=JSON.parse(localStorage.getItem("nectaris-custom-units")||"{}");}catch(e){}
      run={id:crypto.randomUUID(),created:new Date().toISOString(),version:T.version,config:c,types:types,status:"paused",completed:0,elapsed:0,errors:0,ratings:T.standings(c.opponents),pairs:{}};
      page=0;await store.save(run);await refreshRuns();await launch();await games();
    }catch(e){if(run&&!pool.length)run.status="paused";release();render();error(e);}
  };
  $("lab-pause").onclick=function(){serialize(async function(){run.status="pausing";render();await store.save(run);await flushFinished();}).catch(error);};
  $("lab-stop").onclick=function(){serialize(async function(){run.status="stopped";stopWorkers();await flushFinished();await store.save(run);release();render();}).catch(error);};
  $("lab-resume").onclick=async function(){try{if(saving)return;run=await store.get(run.id);await launch();}catch(e){release();if(run)run.status="paused";render();error(e);}};
  $("lab-runs").onchange=async function(){if(active()||saving)return;run=await store.get(this.value);if(active())run.status="interrupted";page=0;render();await games();};
  $("lab-prev").onclick=function(){page=Math.max(0,page-1);games().catch(error);};$("lab-next").onclick=function(){page++;games().catch(error);};
  $("lab-delete").onclick=async function(){if(active()||saving||!confirm("Delete this tournament and all its saved replays?"))return;
    try{await acquire();await store.remove(run.id);release();run=null;await refreshRuns();var list=await store.list();if(list.length){run=list[list.length-1];if(active())run.status="interrupted";page=0;}render();await games();}
    catch(e){release();error(e);}};
  function download(blob,name){var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(url);},10000);}
  async function exportRun(archive){
    if(!run)return;var selected=JSON.parse(JSON.stringify(run)),name="nectaris-"+selected.id+(archive?".ndjson":".csv"),stream=null,chunks=[];
    try{
      if(archive&&window.showSaveFilePicker){var handle=await window.showSaveFilePicker({suggestedName:name});stream=await handle.createWritable();}
      // File System Access streams huge archives directly to disk. Else use
      // a bounded Blob export; individual game downloads remain available.
      if(!stream&&archive&&selected.completed>2000)throw new Error("For archives over 2,000 games, use a browser with streaming file saves (Chrome/Edge), or the Node tournament runner. CSV export and individual replays remain available.");
      async function write(s){if(stream)await stream.write(s);else chunks.push(s);}
      var quote=function(s){return '"'+String(s).replace(/"/g,'""')+'"';};
      await write(archive?JSON.stringify({type:"run",run:selected})+"\n":"game,board,union,xenon,seed,winner,reason,rounds,ms,error\n");
      for(var offset=0;offset<selected.completed;offset+=100){var batch=await store.games(selected.id,offset,Math.min(100,selected.completed-offset));
        for(var g of batch)await write(archive?JSON.stringify({type:"game",game:g})+"\n":[g.index+1,g.map,g.players[0],g.players[1],g.seed,g.winner===null?"draw":g.players[g.winner],g.reason,g.rounds,g.ms,g.error||""].map(quote).join(",")+"\n");
      }
      if(stream)await stream.close();else download(new Blob(chunks,{type:archive?"application/x-ndjson":"text/csv"}),name);
    }catch(e){if(stream)await stream.abort();if(e.name!=="AbortError")error(e);}
  }
  $("lab-export").onclick=function(){exportRun(false);};$("lab-archive").onclick=function(){exportRun(true);};

  function stopPlayback(){if(playTimer)clearTimeout(playTimer);playTimer=null;$("replay-play").textContent="Play";}
  function drawReplay(){
    if(!renderer)return;var canvas=$("replay-canvas"),rect=canvas.getBoundingClientRect();canvas.width=Math.max(300,Math.round(rect.width));canvas.height=Math.max(250,Math.round(rect.height));
    renderer.game=replayGame;renderer.orientation="auto";renderer.fitToMap();renderer.draw();$("replay-seek").value=replayAt;
    var last=replayAt?replayData.commands[replayAt-1][0]:"initial position";
    $("replay-position").textContent="Action "+replayAt+" / "+replayData.commands.length+" · round "+replayGame.turn+" · "+(replayGame.currentPlayer?"Xenon":"Union")+" · "+last+(replayGame.winner!==null?" · "+replayGame.winReason:"");
  }
  function seek(at){if(!replayData)return;at=Math.max(0,Math.min(replayData.commands.length,at));
    try{if(at<replayAt){replayGame=ENGINE.Game.restore(replayData.initial);replayAt=0;}
      while(replayAt<at)T.command(replayGame,replayData.commands[replayAt++]);drawReplay();
    }catch(e){stopPlayback();error(new Error("Replay could not advance: "+e.message));}
  }
  async function openReplay(game){stopPlayback();replayData=game;replayAt=0;replayGame=ENGINE.Game.restore(game.initial);renderer=new RENDER.Renderer($("replay-canvas"),replayGame);
    $("lab-viewer").hidden=false;$("replay-title").textContent="Game "+(game.index+1)+" · "+game.map;
    $("replay-detail").textContent=label(game.players[0])+" (Union) vs "+label(game.players[1])+" (Xenon) · seed "+game.seed+" · "+game.reason+(game.version!==T.version?" · recorded with older engine/search version "+game.version:"");
    $("replay-seek").max=game.commands.length;drawReplay();$("lab-viewer").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("replay-seek").oninput=function(){stopPlayback();seek(Number(this.value));};
  $("replay-first").onclick=function(){stopPlayback();seek(0);};$("replay-last").onclick=function(){stopPlayback();seek(replayData.commands.length);};
  $("replay-back").onclick=function(){stopPlayback();seek(replayAt-1);};$("replay-forward").onclick=function(){stopPlayback();seek(replayAt+1);};
  $("replay-play").onclick=function(){if(playTimer){stopPlayback();return;}if(replayAt===replayData.commands.length)seek(0);
    function tick(){seek(replayAt+1);if(replayAt===replayData.commands.length){stopPlayback();return;}playTimer=setTimeout(tick,Number($("replay-speed").value));}
    $("replay-play").textContent="Pause";playTimer=setTimeout(tick,Number($("replay-speed").value));
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
    var u=p&&replayGame.unitAt(p.col,p.row);$("replay-hover").textContent=u?(u.player?"Xenon":"Union")+" · "+u.type.name+" · "+u.strength+" machines · experience "+u.exp+(u.cargo.length?" · cargo "+u.cargo.map(function(c){return c.type.name;}).join(", "):""):"";
  };
  window.addEventListener("resize",drawReplay);
  window.addEventListener("beforeunload",function(event){if(active()||saving){event.preventDefault();event.returnValue="";}});
  TOURNAMENT_STORE.open().then(async function(s){store=s;$("lab-start").disabled=false;await refreshRuns();var list=await store.list();list.sort(function(a,b){return b.created.localeCompare(a.created);});
    if(list.length){run=list[0];if(active())run.status="interrupted";$("lab-runs").value=run.id;render();await games();}
    if(navigator.storage&&navigator.storage.estimate){var space=await navigator.storage.estimate();$("lab-storage").textContent="Browser storage: "+Math.round((space.usage||0)/1048576)+" / "+Math.round((space.quota||0)/1048576)+" MB";}
  }).catch(function(e){$("lab-start").disabled=true;error(e);});
})();
