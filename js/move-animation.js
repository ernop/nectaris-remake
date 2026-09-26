/* Visual movement only. The engine has already committed the legal action;
 * this overlay never mutates unit coordinates, action flags, saves or RNG. */
"use strict";
var MOVE_ANIMATION = (function () {
  function play(renderer, unit, path, options) {
    options = options || {};
    var request = options.requestFrame || requestAnimationFrame;
    var cancel = options.cancelFrame || cancelAnimationFrame;
    var stepMs = options.stepMs || 150, previous = null, elapsed = 0, frameId = null, stopped = false, paused = false;
    var duration = Math.max(0, path.length - 1) * stepMs;
    var visual = Object.assign({}, unit, {moved: false});
    function draw() { if (options.draw) options.draw(); else renderer.draw(); }
    function finish(notify) {
      if (stopped) return;
      stopped = true;
      if (frameId !== null) cancel(frameId);
      renderer.motion = null;
      draw();
      if (notify && options.done) options.done();
    }
    function position(elapsed) {
      var at = Math.min(path.length - 1, elapsed / stepMs);
      var segment = Math.min(path.length - 2, Math.floor(at));
      renderer.motion = {unit: visual, from: path[segment], to: path[segment + 1], fraction: at - segment};
    }
    function frame(time) {
      if (stopped || paused) return;
      // A busy or background tab may skip frames. Still show every hex.
      if (previous !== null) elapsed += Math.min(Math.max(0, time - previous), stepMs);
      previous = time;
      if (elapsed >= duration) { finish(true); return; }
      position(elapsed); draw(); frameId = request(frame);
    }
    if (path.length >= 2) { position(0); draw(); }
    frameId = request(frame);
    return {duration: duration, cancel: function () { finish(false); },
      pause: function () { if (!stopped && !paused) { paused = true; cancel(frameId); } },
      resume: function () { if (!stopped && paused) { paused = false; previous = null; frameId = request(frame); } },
    };
  }
  return {play: play};
})();
if (typeof module !== "undefined") module.exports = MOVE_ANIMATION;
