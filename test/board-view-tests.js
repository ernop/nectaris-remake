/* Board orientation is presentation only: fit, hits and camera motion agree. */
"use strict";
module.exports = function (ok) {
  var R = require("../js/render.js"), UI = require("../js/ui.js");
  var oldStyle = R.getStyle(), oldSet = R.getIconSet();
  function near(a, b) { return Math.abs(a - b) < 1e-7; }
  try {
    [["pixel", "remake"], ["pixel", "legacy"], ["classic", "remake"], ["neon", "remake"]].forEach(function (look) {
      R.setStyle(look[0]); R.setIconSet(look[1]);
      [[15, 20], [30, 10], [65, 49], [1, 12], [1, 1]].forEach(function (size) {
        var game = {width: size[0], height: size[1], inBounds: function (c, r) {
          return c >= 0 && c < this.width && r >= 0 && r < this.height;
        }};
        [[1280, 720], [720, 1280], [320, 240]].forEach(function (view) {
          var canvas = {width: view[0], height: view[1], getContext: function () { return {}; }};
          var renderer = new R.Renderer(canvas, game), zooms = {};
          ["normal", "sideways", "auto"].forEach(function (orientation) {
            var label = look.join("/") + " " + size + " " + view + " " + orientation;
            renderer.orientation = orientation; renderer.fitToMap(); zooms[orientation] = renderer.zoom;
            var bounds = renderer.viewBounds(), z = renderer.zoom;
            var left = renderer.originX + bounds.left * z, top = renderer.originY + bounds.top * z;
            ok(left >= 8 - 1e-7 && top >= 8 - 1e-7 &&
              left + bounds.width * z <= canvas.width - 8 + 1e-7 &&
              top + bounds.height * z <= canvas.height - 8 + 1e-7, label + " fits the complete board");
            ok(near(left, (canvas.width - bounds.width * z) / 2) &&
              near(top, (canvas.height - bounds.height * z) / 2), label + " centers exact board bounds");
            var hits = true;
            for (var row = 0; row < game.height; row++) for (var col = 0; col < game.width; col++) {
              var p = renderer.hexCenter(col, row), hit = renderer.pixelToHex(p.x, p.y);
              if (!hit || hit.col !== col || hit.row !== row) hits = false;
            }
            ok(hits, label + " every visible cell remains selectable");
            var center = renderer.hexCenter(0, 0);
            renderer.panBy(23, -17);
            var moved = renderer.hexCenter(0, 0);
            ok(near(moved.x, center.x + 23) && near(moved.y, center.y - 17), label + " pans in screen directions");
            // The existing wheel handler must keep the cell beneath the cursor.
            var ui = Object.create(UI.GameUI.prototype);
            ui.renderer = renderer; ui.canvas = canvas; ui.draw = ui.updateHoverInfo = function () {};
            ui.onWheel({offsetX: moved.x, offsetY: moved.y, deltaY: 120, preventDefault: function () {}});
            var zoomed = renderer.hexCenter(0, 0);
            ok(near(zoomed.x, moved.x) && near(zoomed.y, moved.y), label + " wheel zoom anchors the cursor");
            renderer.panBy(-100000, 100000);
            bounds = renderer.viewBounds(); z = renderer.zoom;
            left = renderer.originX + bounds.left * z; top = renderer.originY + bounds.top * z;
            ok(left < canvas.width && left + bounds.width * z > 0 &&
              top < canvas.height && top + bounds.height * z > 0, label + " retains a visible patch at pan limits");
          });
          ok(zooms.auto >= Math.max(zooms.normal, zooms.sideways) / 1.02,
            look.join("/") + " auto chooses the larger usable board for " + size + " in " + view);

        });
      });
    });

    // Render the board through the transformed viewport, then restore screen
    // coordinates for upright units, labels, and DOM popup anchors.
    var turns = 0, saves = 0, restores = 0;
    var ctx = {save: function () { saves++; }, restore: function () { restores++; },
      translate: function () {}, rotate: function (angle) { turns += angle; }};
    var canvas = {width: 1200, height: 700, getContext: function () { return ctx; }};
    var renderer = new R.Renderer(canvas, {width: 15, height: 20});
    renderer.orientation = "sideways"; renderer.fitToMap();
    var before = renderer.hexCenter(5, 8), x = renderer.originX, y = renderer.originY;
    var outsideBounds = renderer.visibleTileBounds();
    renderer.withBoardView(function () {
      var inside = this.hexCenter(5, 8);
      ok(near(canvas.width - inside.y, before.x) && near(inside.x, before.y),
        "terrain transform agrees with screen-space unit and popup anchors");
      ok(JSON.stringify(this.visibleTileBounds()) === JSON.stringify(outsideBounds),
        "sideways terrain culling agrees inside and outside the draw pass");
    });
    ok(renderer.canvas === canvas && renderer.originX === x && renderer.originY === y &&
      !renderer._boardSpace && turns === Math.PI / 2 && saves === restores,
      "terrain pass restores the upright foreground and camera");
    try { renderer.withBoardView(function () { throw new Error("paint interrupted"); }); } catch (e) { /* expected */ }
    ok(renderer.canvas === canvas && !renderer._boardSpace && saves === restores,
      "failed terrain paint also restores screen-space coordinates");
  } finally { R.setIconSet(oldSet); R.setStyle(oldStyle); }
};
