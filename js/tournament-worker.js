"use strict";
importScripts.apply(self,["hex.js","data-terrain.js","data-units.js","combat.js","engine.js","ai.js","ai-model.js","ai-search.js","ai-tournament.js"].map(function(f){return f+"?v=20260923-search-3";}));
var baseRoster=Object.assign({},UNIT_TYPES);
self.onmessage=function(event){
  var job=event.data;
  // Workers process many maps. Custom overrides cannot leak into the next one.
  Object.keys(UNIT_TYPES).forEach(function(k){delete UNIT_TYPES[k];});Object.assign(UNIT_TYPES,baseRoster,job.types||{});
  var last=0;
  try{
    var result=AI_TOURNAMENT.playSync(job.spec,function(progress){
      if(Date.now()-last<250)return;last=Date.now();self.postMessage({type:"progress",index:job.spec.index,progress:progress});
    });
    self.postMessage({type:"result",result:result});
  }catch(error){self.postMessage({type:"result",result:{index:job.spec.index,players:job.spec.players,map:job.spec.map.name,
    mapIndex:job.spec.mapIndex,seed:job.spec.seed,error:error.message,version:AI_TOURNAMENT.version}});}
};
