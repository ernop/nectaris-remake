"use strict";
importScripts.apply(self,["hex.js","data-terrain.js","data-units.js","combat.js","engine.js","balance.js","ai.js","ai-model.js","ai-search.js","ai-opening.js"].map(function(f){return f+"?v=20260929-marshal";}));
self.onmessage=function(event){
  try{
    var job=event.data;Object.assign(UNIT_TYPES,job.types||{});
    var game=ENGINE.Game.restore(job.state),plan=BALANCE.plan(game);
    var survey=AI_OPENING.survey(plan,job.player,job.id,{work:"standard"});
    self.postMessage({survey:survey});
  }catch(error){self.postMessage({error:error.message});}
};
