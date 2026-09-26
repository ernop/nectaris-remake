/* A pausable presentation clock. Never advances game state or randomness. */
"use strict";
var PLAYBACK_TIMELINE = (function () {
  function play(options) {
    var request = options.requestFrame || requestAnimationFrame;
    var cancel = options.cancelFrame || cancelAnimationFrame;
    var previous = null, elapsed = 0, frameId = null, stopped = false, paused = false;
    function frame(time) {
      if (stopped || paused) return;
      if (previous !== null) elapsed += Math.max(0, time - previous);
      previous = time;
      elapsed = Math.min(elapsed, options.duration);
      if (options.update) options.update(elapsed);
      if (stopped || paused) return;
      if (elapsed >= options.duration) {
        stopped = true; frameId = null;
        if (options.done) options.done();
      } else frameId = request(frame);
    }
    frameId = request(frame);
    return {
      get paused() { return paused; },
      pause: function () {
        if (stopped || paused) return;
        paused = true; cancel(frameId); frameId = null;
      },
      resume: function () {
        if (stopped || !paused) return;
        paused = false; previous = null; frameId = request(frame);
      },
      cancel: function () { stopped = true; if (frameId !== null) cancel(frameId); frameId = null; },
    };
  }
  return {play: play};
})();
if (typeof module !== "undefined") module.exports = PLAYBACK_TIMELINE;
