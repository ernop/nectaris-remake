/* Private opening-role analysis. Each policy plays out both sides of each
 * hypothetical deal using its own move selector. Only public state enters;
 * simulation dice are independent of the real game's random stream. */
"use strict";
var AI_OPENING=(function(){
  var engine=typeof module!=="undefined"?require("./engine.js"):ENGINE;
  var ai=typeof module!=="undefined"?require("./ai.js"):AI;
  var search=typeof module!=="undefined"?require("./ai-search.js"):AI_SEARCH;
  var model=typeof module!=="undefined"?require("./ai-model.js"):AI_MODEL;
  var balance=typeof module!=="undefined"?require("./balance.js"):BALANCE;
  function budget(work){
    var deep=work==="deep",fast=work==="fast";
    return {events:fast?4:deep?12:8,rounds:deep?2:1,
      search:{forceSearch:true,width:deep?3:2,depth:2,branches:deep?5:3,
        iterations:fast?4:deep?12:8,horizon:fast?3:deep?6:4,verification:deep?2:1}};
  }
  function* role(plan,player,id,offer,second,limits,seed){
    var state=search.publicSnapshot(plan.game);state.rngState=seed>>>0;
    var g=engine.Game.restore(state);
    balance.apply(g,plan,{status:"agreed",firstPlayer:1-second,secondPlayer:second,offer:offer,step:offer,tied:false});
    var ctx=model.context(g);model.prepareEvaluation(g,ctx);
    for(var half=0;half<limits.rounds*2 && g.winner===null;half++){
      var runner=ai.createTurn(g,g.currentPlayer,{id:id,search:limits.search}),event,count=0;
      try{
        while((event=runner.next())!==null){
          // Finish a pending battle even at the horizon; never score a preview
          // as though the actual attack had already happened.
          if(event.t!=="battle-preview")count++;
          yield;
          if(count>=limits.events && event.t!=="battle-preview" && event.t!=="thinking" &&
             (event.t==="battle" || !event.unit || event.unit.moved))break;
        }
      }finally{if(runner.destroy)runner.destroy();}
      if(half+1<limits.rounds*2 && g.winner===null)g.endTurn();
    }
    return model.evaluate(g,player,ctx);
  }
  function* analyze(plan,player,id,options){
    options=options||{};id=search.get(id).id;
    var limits=budget(options.work),scores=[],threshold=plan.offers.length;
    // Public-position seed: changing the real combat seed cannot reveal its
    // future dice or change a bot's declared preferences.
    var seed=model.seedFor(plan.game),survey=balance.begin(plan);
    for(var offer=0;offer<plan.offers.length;offer++){
      if(options.onProgress)options.onProgress({phase:"opening",side:player,policy:id,offer:offer,total:plan.offers.length});
      var first=yield* role(plan,player,id,offer,1-player,limits,seed);
      var second=yield* role(plan,player,id,offer,player,limits,seed);
      scores.push({offer:offer,first:first,second:second});
      if(second>=first){threshold=offer;break;}
    }
    var step;while((step=balance.question(survey))!==null)balance.answer(plan,survey,step>=threshold?threshold:null);
    survey.policy=id;survey.analysis={work:options.work||"standard",eventsPerSide:limits.events,rounds:limits.rounds,scores:scores};
    return survey;
  }
  function survey(plan,player,id,options){var it=analyze(plan,player,id,options),step;do{step=it.next();}while(!step.done);return step.value;}
  return {analyze:analyze,survey:survey,budget:budget};
})();
if(typeof module!=="undefined")module.exports=AI_OPENING;
