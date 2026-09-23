/* Independent opponent algorithms over the same capability-based action model.
 * Search uses public-state seeds, never the match random stream. Fixed work
 * budgets make saved-turn replay reproducible on different machines.
 */
"use strict";
var AI_SEARCH = (function () {
  var model = typeof module !== "undefined" ? require("./ai-model.js") : AI_MODEL;
  var combat = typeof module !== "undefined" ? require("./combat.js") : COMBAT;
  var modes = [
    {id:"classic",label:"Classic",description:"Original-inspired heuristic CPU",algorithm:"classic"},
    {id:"tactical",label:"Tactical · greedy",description:"Exact combat odds, objectives and threat-aware moves",algorithm:"greedy"},
    {id:"beam",label:"Sequence · beam search",description:"Coordinated activation sequences with enemy replies",algorithm:"beam",width:4,depth:3,branches:5},
    {id:"monte-carlo",label:"Simulation · Monte Carlo",description:"Chance-sampled tree search and adversarial continuations",algorithm:"mcts",iterations:36,horizon:8,branches:10},
    {id:"apex",label:"Apex · hybrid search",description:"Beam-guided Monte Carlo search with paired full-turn verification",algorithm:"hybrid",width:5,depth:3,branches:12,iterations:64,horizon:12,verification:4}
  ];
  function get(id) { return modes.find(function (m) { return m.id===id; }) || modes[0]; }
  function randomSeed(rng) { return Math.floor(rng()*4294967296)>>>0; }
  function readyCount(g) {
    return g.playerUnits(g.currentPlayer).filter(function(u){return !u.moved;}).length+
      g.playerFactories(g.currentPlayer).reduce(function(s,b){return s+b.stored.filter(function(u){return !u.moved;}).length;},0);
  }
  function quiet(game,roots){
    if(roots.some(function(r){return r.action.target;}))return false;
    var enemies=game.playerUnits(1-game.currentPlayer),units=game.playerUnits(game.currentPlayer).filter(function(u){return !u.moved;});
    game.playerFactories(game.currentPlayer).forEach(function(b){b.stored.filter(function(u){return !u.moved;}).forEach(function(u){units.push(Object.assign({},u,{col:b.col,row:b.row}));});});
    return !units.some(function(u){return enemies.some(function(e){
      var reach=Math.max(u.type.move||0,e.type.move||0)+Math.max(u.type.rngG||0,u.type.rngA||0,e.type.rngG||0,e.type.rngA||0)+2;
      return HEX.distance(u.col,u.row,e.col,e.row)<=reach;
    });});
  }
  function normalized(score) { return Math.abs(score)>=90000 ? Math.sign(score) : Math.tanh(score/500); }
  function shortlist(game,ctx,limit,unitLimit) {
    var actions=model.candidates(game,ctx,{limit:limit,perUnit:3,unitLimit:unitLimit||0});
    // A stationary activation already expresses passing with one unit. An
    // early whole-turn pass is redundant and creates a shorter, incomparable
    // search horizon. End the turn only after all legal activations finish.
    return actions.length>1?actions.filter(function(a){return a.kind!=="end";}):actions;
  }
  function orderRoot(game,actions,ctx,rng) {
    // Protect against one-move base losses even in the inexpensive opponent.
    // These probes use independent simulated combat, not actual future rolls.
    var before=model.baseDanger(game,game.currentPlayer);
    return actions.map(function(action){
      if(action.target)return {action:action,score:action.score};
      var child=model.simulate(game,action,ctx,randomSeed(rng));
      var safety=action.target ? 0 : before-model.baseDanger(child,game.currentPlayer);
      var score=action.score+safety;
      // A sampled combat victory is not a guaranteed win. Terminal bonuses
      // here apply only to deterministic actions; stochastic wins are valued
      // by repeated tree-search samples and exact tactical kill probabilities.
      if(!action.target && child.winner===game.currentPlayer)score+=100000;
      if(!action.target && child.winner===1-game.currentPlayer)score-=100000;
      return {action:action,score:score};
    }).sort(function(a,b){return b.score-a.score;});
  }
  function rollout(game,player,ctx,rng,horizon) {
    var g=game, seen=new Set(), startTurn=g.turn, switches=0, previous=g.currentPlayer;
    for(var i=0;i<horizon && g.winner===null;i++){
      var sig=model.signature(g);
      if(seen.has(sig))break;
      seen.add(sig);
      var options=shortlist(g,ctx,5,3);
      var action=options[0];
      // A small policy mixture exposes alternatives without uniformly random
      // blunders. Greedy actions dominate; only near-ties can be diversified.
      if(options.length>1 && options[1].kind!=="end" && options[0].score-options[1].score<8 && rng()<0.2)action=options[1];
      model.apply(g,action,ctx);
      if(g.currentPlayer!==previous){switches++;previous=g.currentPlayer;}
      if(switches>=2 || g.turn>startTurn+1)break;
      // Do not spend the entire evaluation on a large friendly army. Unplayed
      // actions remain a horizon approximation, shared across candidates.
      if(i===Math.floor(horizon/2)-1 && g.currentPlayer===player){g.endTurn();ctx.analysis.delete(g);previous=g.currentPlayer;switches++;}
    }
    return model.evaluate(g,player,ctx);
  }

  function* beam(game,root,ctx,config,rng) {
    var player=game.currentPlayer, values=new Map(), width=config.width, depth=config.depth;
    var initial=root.filter(function(r){return r.action.kind!=="end";}).slice(0,config.branches);
    var nodes=initial.map(function(r){
      var state=model.simulate(game,r.action,ctx,randomSeed(rng),true);
      return {game:state,root:r.action,progress:r.score,score:model.evaluate(state,player,ctx)+r.score*0.15};
    });
    yield;
    for(var level=1;level<depth;level++){
      var next=[], transpositions=new Map();
      for(var n=0;n<nodes.length;n++){
        var node=nodes[n];
        if(node.game.winner!==null||node.game.currentPlayer!==player){next.push(node);continue;}
        var actions=shortlist(node.game,ctx,config.branches,0).slice(0,config.branches);
        for(var a=0;a<actions.length;a++){
          var action=actions[a], child=model.simulate(node.game,action,ctx,randomSeed(rng),true);
          var progress=node.progress+action.score, score=model.evaluate(child,player,ctx)+progress*0.15;
          var sig=model.key(node.root)+model.signature(child), old=transpositions.get(sig);
          if(!old||score>old.score)transpositions.set(sig,{game:child,root:node.root,progress:progress,score:score});
        }
        yield;
      }
      next=next.concat(Array.from(transpositions.values())).sort(function(a,b){return b.score-a.score;});
      // Retain at least one continuation of each initial alternative. Otherwise
      // a lucky first battle can erase competing roots before enemy replies.
      var kept=[], roots=new Set();
      next.forEach(function(node){var k=model.key(node.root);if(!roots.has(k)){roots.add(k);kept.push(node);}});
      nodes=kept.concat(next.filter(function(n){return kept.indexOf(n)<0;}).slice(0,width)).slice(0,initial.length+width);
    }
    for(var i=0;i<nodes.length;i++){
      var node=nodes[i], sum=0;
      for(var sample=0;sample<2;sample++){
        var response=model.clone(node.game,randomSeed(rng));
        response.rng=function(){return 0.5;};
        if(response.winner===null && response.currentPlayer===player)response.endTurn();
        sum+=rollout(response,player,ctx,rng,3);
      }
      var score=sum/2+node.progress*0.12, k=model.key(node.root);
      if(!values.has(k)||score>values.get(k))values.set(k,score);
      yield;
    }
    return values;
  }

  function* treeSearch(game,root,ctx,config,rng,beamValues) {
    var player=game.currentPlayer, table=new Map(), rootKey=model.signature(game);
    var rootChoices=root.slice(0,config.branches).map(function(r){
      var prior=beamValues&&beamValues.has(model.key(r.action))?normalized(beamValues.get(model.key(r.action))):0;
      return {action:r.action,visits:0,total:0,square:0,prior:prior,order:r.score};
    });
    table.set(rootKey,{visits:0,choices:rootChoices});
    for(var iteration=0;iteration<config.iterations;iteration++){
      var g=model.clone(game,randomSeed(rng)), path=[], depth=0;
      var budget=config.horizon, treeDepth=config.algorithm==="hybrid"?6:4;
      while(g.winner===null && depth<treeDepth){
        var sig=model.signature(g), node=table.get(sig), newlyExpanded=false;
        if(!node){
          var acts=shortlist(g,ctx,config.branches,depth>1?4:0);
          node={visits:0,choices:acts.map(function(a){return {action:a,visits:0,total:0,square:0,prior:0,order:a.score};})};
          table.set(sig,node);newlyExpanded=true;
        }
        if(!node.choices.length)break;
        var sign=g.currentPlayer===player?1:-1;
        var width=Math.min(node.choices.length,2+Math.floor(Math.sqrt(node.visits+1)*1.5));
        // Root alternatives all receive samples; deeper nodes widen with visits.
        if(depth===0)width=Math.min(node.choices.length,Math.max(width,Math.min(8,node.choices.length)));
        var best=null, bestScore=-Infinity;
        for(var j=0;j<width;j++){
          var choice=node.choices[j], mean=choice.visits?choice.total/choice.visits:choice.prior;
          var explore=choice.visits?0.65*Math.sqrt(Math.log(node.visits+2)/choice.visits):2;
          var prior=0.18*choice.prior/(1+choice.visits)+0.025*(width-j)/width;
          var score=sign*mean+explore+prior;
          if(score>bestScore){bestScore=score;best=choice;}
        }
        path.push({node:node,choice:best});
        // Each traversal independently samples chance. The transposition key
        // identifies the resulting board, not a privileged RNG continuation.
        model.apply(g,best.action,ctx);depth++;ctx.stats.nodes++;
        if(newlyExpanded)break;
      }
      var result=normalized(rollout(g,player,ctx,rng,Math.max(2,budget-depth)));
      path.forEach(function(step){step.node.visits++;step.choice.visits++;step.choice.total+=result;step.choice.square+=result*result;});
      yield;
    }
    var scored=rootChoices.map(function(c){
      var mean=c.visits?c.total/c.visits:-2;
      // Shrink noisy estimates toward the independent sequence/reply analysis.
      var estimate=beamValues?(c.total+c.prior*16)/(c.visits+16):mean;
      return {action:c.action,score:estimate,visits:c.visits,mean:mean};
    }).sort(function(a,b){return b.score-a.score||b.visits-a.visits;});
    ctx.stats.root=scored.map(function(r){return {action:model.key(r.action),visits:r.visits,mean:r.mean,score:r.score};});
    return scored[0].action;
  }

  function* verify(game,actions,ctx,config,rng) {
    // Policy improvement over full remaining turns avoids the activation-
    // horizon bias of a short tactical tree. Common random seeds make the
    // alternatives' estimates less noisy. No opponent future RNG is read.
    var unique=new Map();actions.forEach(function(a){unique.set(model.key(a),a);});
    var choices=Array.from(unique.values()),seeds=[],player=game.currentPlayer;
    var samples=Math.max(2,config.verification||4),values=[];
    for(var s=0;s<samples;s++)seeds.push(randomSeed(rng));
    for(var c=0;c<choices.length;c++){
      var total=0,worst=Infinity;
      for(var sample=0;sample<samples;sample++){
        var g=model.clone(game,seeds[sample]),start=g.currentPlayer,switches=0;
        model.apply(g,choices[c],ctx);
        // Allow enough activations for reserves, unloads and both complete
        // armies. The hard bound remains independent of processor speed.
        var cap=Math.max(24,game.units.length*3+Object.values(game.buildings).reduce(function(n,b){return n+b.stored.length*3;},0));
        for(var step=0;step<cap&&g.winner===null&&switches<2;step++){
          var action=shortlist(g,ctx,6,0)[0];model.apply(g,action,ctx);
          if(g.currentPlayer!==start){switches++;start=g.currentPlayer;}
          if(step%4===3)yield;
        }
        var score=model.evaluate(g,player,ctx);total+=score;worst=Math.min(worst,score);yield;
      }
      // Expected result dominates. A small worst-sample term breaks fragile
      // near-ties; it is not a separate personality or a hidden handicap.
      values.push({action:choices[c],score:total/samples*0.9+worst*0.1});
    }
    values.sort(function(a,b){return b.score-a.score;});
    ctx.stats.verification=values.map(function(v){return {action:model.key(v.action),score:v.score};});
    return values[0].action;
  }

  function* decide(game,id,options,shared) {
    var config=Object.assign({},get(id),options||{}), ctx=shared||model.context(game);
    var rootGame=model.clone(game,0), rng=combat.makeRng(model.seedFor(game));
    model.prepareEvaluation(rootGame,ctx);
    var actions=shortlist(rootGame,ctx,config.algorithm==="greedy"?24:32,0);
    if(actions[0].kind==="end")return actions[0];
    // A legal immediate base capture dominates every heuristic/search budget.
    if(actions[0].score>=1000000)return actions[0];
    var roots=orderRoot(rootGame,actions,ctx,rng);
    var greedy=roots[0].action;
    yield;
    if(config.algorithm==="greedy"||roots.length===1)return roots[0].action;
    // No contact inside the tactical horizon: use terrain-route progress and
    // exact legal deployment scoring directly. Large quiet reserve armies
    // should not spend tactical simulations rediscovering the same march.
    if(!config.forceSearch&&quiet(rootGame,roots)){ctx.stats.quiet=true;return greedy;}
    var beamValues=null;
    if(config.algorithm==="beam"||config.algorithm==="hybrid"){
      beamValues=yield* beam(rootGame,roots,ctx,config,rng);
      // Never compare a raw move heuristic with a searched board evaluation.
      // In a losing position an unsearched alternative's neutral prior would
      // otherwise look better simply because it was never evaluated.
      roots=roots.filter(function(r){return beamValues.has(model.key(r.action));});
      if(config.algorithm==="beam"){
        roots.sort(function(a,b){return (beamValues.has(model.key(b.action))?beamValues.get(model.key(b.action)):-Infinity)-
          (beamValues.has(model.key(a.action))?beamValues.get(model.key(a.action)):-Infinity);});
        return roots[0].action;
      }
      roots.sort(function(a,b){
        var av=beamValues.get(model.key(a.action)),bv=beamValues.get(model.key(b.action));
        return (bv===undefined?b.score:bv)-(av===undefined?a.score:av);
      });
    }
    // Scale work down only with very large armies, never change the algorithm.
    // There are still at least two visits for each of the widest root choices.
    var scale=Math.max(1,Math.sqrt(readyCount(rootGame)/12));
    config.iterations=Math.max(config.branches*2,Math.floor(config.iterations/scale));
    var searched=yield* treeSearch(rootGame,roots,ctx,config,rng,beamValues);
    if(config.algorithm==="hybrid")return yield* verify(rootGame,[searched,roots[0].action,roots[Math.min(1,roots.length-1)].action,greedy],ctx,config,rng);
    return searched;
  }
  function choose(game,id,options,ctx){var it=decide(game,id,options,ctx),step;do{step=it.next();}while(!step.done);return step.value;}

  function publicSnapshot(game) {
    // Build directly instead of calling snapshot(), which reads the match RNG.
    var units={},types={};
    function add(u){if(units[u.id])return;var copy=Object.assign({},u);delete copy.type;
      copy.cargo=u.cargo.map(function(c){return c.id;});units[u.id]=copy;types[u.typeId]=u.type;u.cargo.forEach(add);}
    game.units.forEach(add);var buildings={};
    Object.keys(game.buildings).forEach(function(k){var b=game.buildings[k];b.stored.forEach(add);
      buildings[k]=Object.assign({},b,{stored:b.stored.map(function(u){return u.id;})});});
    return {version:1,map:game.map,types:types,units:Object.values(units),field:game.units.map(function(u){return u.id;}),
      buildings:buildings,turn:game.turn,currentPlayer:game.currentPlayer,firstPlayer:game.firstPlayer,balance:game.balance||null,turnLimit:game.turnLimit,
      winner:game.winner,winReason:game.winReason,rngState:0,log:[]};
  }

  function createTurn(game,player,options) {
    options=options||{};var id=get(options.id).id,ctx=model.context(game),active=null,answer=null,
      pending=false,ended=false,error=null,worker=null,timer=null,sequence=0;
    var async=!!options.async;
    function fallback(){
      var iterator=decide(game,id,options.search,ctx);
      function pump(){
        if(ended)return;
        try{var deadline=Date.now()+8,step;do{step=iterator.next();}while(!step.done&&Date.now()<deadline);
          if(step.done){answer=step.value;pending=false;}else timer=setTimeout(pump,0);
        }catch(e){error=e;pending=false;}
      }
      timer=setTimeout(pump,0);
    }
    if(async&&typeof Worker!=="undefined"){
      try{
        worker=new Worker("js/ai-worker.js?v=20260923-search-3");
        worker.onmessage=function(e){
          if(ended||e.data.sequence!==sequence)return;
          if(e.data.error){error=new Error(e.data.error);pending=false;return;}
          answer=e.data.action;ctx.stats=e.data.stats;pending=false;
        };
        worker.onerror=function(){worker.terminate();worker=null;if(pending&&!ended)fallback();};
      }catch(e){worker=null;}
    }
    function destroy(){ended=true;if(worker)worker.terminate();worker=null;if(timer!==null)clearTimeout(timer);}
    return {
      stats: function(){return ctx.stats;}, destroy:destroy,
      next:function(){
        if(error){var err=error;destroy();throw err;}
        while(!ended && game.winner===null && game.currentPlayer===player){
          if(active){var event=active.next();if(!event.done)return event.value;active=null;ctx.analysis.delete(game);}
          if(answer){var action=answer;answer=null;if(action.kind==="end"){destroy();return null;}active=model.execute(game,action,ctx);continue;}
          if(pending)return {t:"thinking"};
          if(!async){answer=choose(game,id,options.search,ctx);continue;}
          pending=true;sequence++;
          if(worker)worker.postMessage({sequence:sequence,state:publicSnapshot(game),id:id,options:options.search});
          else fallback();
          return {t:"thinking"};
        }
        destroy();return null;
      }
    };
  }
  return {modes:modes,get:get,choose:choose,decide:decide,createTurn:createTurn,publicSnapshot:publicSnapshot};
})();
if(typeof module!=="undefined")module.exports=AI_SEARCH;
