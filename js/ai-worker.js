/* Search worker: only sanitized public state crosses this boundary. */
"use strict";
importScripts.apply(self, ["hex.js", "data-terrain.js", "data-units.js", "combat.js", "engine.js", "ai-model.js", "ai-search.js"].map(function (file) {
  return file + "?v=20260923-search-2";
}));
var searchContext = null;
self.onmessage = function (event) {
  var message = event.data;
  try {
    var game = ENGINE.Game.restore(message.state);
    if (!searchContext) searchContext = AI_MODEL.context(game);
    var action = AI_SEARCH.choose(game, message.id, message.options, searchContext);
    self.postMessage({sequence:message.sequence, action:action, stats:searchContext.stats});
  } catch (error) {
    self.postMessage({sequence:message.sequence, error:error.message});
  }
};
