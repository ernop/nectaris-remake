/* Nectaris remake — pictures of each level's starting position for the
 * mission menu. The match's own renderer draws the board in the player's
 * current style and art, and the drawing is reduced to the tile like a shrunk
 * screenshot. Pictures are drawn one per task as their tiles come near the
 * window, then kept as compressed images for the visit: drawing all ~170
 * levels at once would stall the menu for seconds, and keeping a canvas per
 * level would hold 40-160 MB. */
"use strict";
var MAP_THUMBNAIL = (function () {
  // The largest picture box, in CSS pixels: boxes are at most 200 px tall, and
  // a wide map in a wide tile is about 480 px across.
  var MAX_WIDTH = 480, MAX_HEIGHT = 200;

  // The board's pixel art is crisp only at whole zooms, so it is drawn at the
  // smallest whole zoom at least as large as the picture and then reduced.
  function size(width, height, ratio) {
    var scale = Math.min(MAX_WIDTH * ratio / width, MAX_HEIGHT * ratio / height);
    return {zoom: Math.max(1, Math.ceil(scale)), width: Math.round(width * scale), height: Math.round(height * scale)};
  }

  // Resolves to an object URL of the level's picture.
  function draw(level) {
    if (level.customUnits) mergeUnitTypes(level.customUnits);
    var board = document.createElement("canvas");
    var renderer = new RENDER.Renderer(board, new ENGINE.Game(level, {dice: null}));
    var bounds = renderer.viewBounds(), fit = size(bounds.width, bounds.height, window.devicePixelRatio);
    board.width = Math.ceil(bounds.width * fit.zoom);
    board.height = Math.ceil(bounds.height * fit.zoom);
    renderer.zoom = fit.zoom;
    renderer.originX = -bounds.left * fit.zoom;
    renderer.originY = -bounds.top * fit.zoom;
    renderer.draw();
    var picture = document.createElement("canvas");
    picture.width = fit.width;
    picture.height = fit.height;
    var context = picture.getContext("2d");
    context.imageSmoothingQuality = "high";
    context.drawImage(board, 0, 0, fit.width, fit.height);
    return new Promise(function (resolve, reject) {
      picture.toBlob(function (blob) {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject(new Error("the browser could not encode it"));
      }, "image/webp", 0.9);
    });
  }

  // Drawn pictures by level content, since custom levels are read afresh for
  // every menu, each with the style, art and pixel density it was drawn in.
  var drawn = new Map(), jobs = new Map(), queue = [], busy = false, observer = null;
  function look() {
    return [RENDER.getStyle(), RENDER.getIconSet(), window.devicePixelRatio].join(" ");
  }
  function cached(key) {
    var entry = drawn.get(key);
    return entry && entry.look === look() ? entry.url : null;
  }
  function show(box, url) {
    var image = document.createElement("img");
    image.className = "map-thumbnail";
    image.alt = "";
    image.src = url;
    box.replaceChildren(image);
  }

  function drawNext() {
    if (busy || !queue.length) return;
    busy = true;
    var job = queue.shift();
    setTimeout(function () {
      var url = cached(job.key), drawnLook = look();
      var picture = url ? Promise.resolve(url) : new Promise(function (resolve) { resolve(draw(job.level)); }).then(function (made) {
        var old = drawn.get(job.key);
        if (old) URL.revokeObjectURL(old.url);
        drawn.set(job.key, {look: drawnLook, url: made});
        return made;
      });
      picture.then(function (made) { show(job.box, made); }, function (error) {
        job.box.classList.add("thumb-error");
        job.box.textContent = "Map picture failed: " + error.message;
        console.error(error);
      }).finally(function () { busy = false; drawNext(); });
    });
  }

  // Shows the level's picture in the box, drawing it when the box nears the window.
  function watch(box, level) {
    var key = JSON.stringify([level.grid, level.units, level.buildings, level.customUnits]), url = cached(key);
    if (url) { show(box, url); return; }
    if (!observer) observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        queue.push(jobs.get(entry.target));
        jobs.delete(entry.target);
      });
      drawNext();
    }, {rootMargin: "400px 0px"});
    jobs.set(box, {box: box, level: level, key: key});
    observer.observe(box);
  }

  // Stops drawing for the tiles on screen, which a rebuilt or hidden menu no
  // longer shows, and drops pictures drawn in another look.
  function reset() {
    if (observer) observer.disconnect();
    jobs.clear();
    queue.length = 0;
    var now = look();
    drawn.forEach(function (entry, key) {
      if (entry.look !== now) { URL.revokeObjectURL(entry.url); drawn.delete(key); }
    });
  }

  return {watch: watch, reset: reset};
})();
if (typeof module !== "undefined") module.exports = MAP_THUMBNAIL;
