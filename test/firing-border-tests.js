/* Firing-area contours preserve covered cells and minimum-range holes. */
"use strict";
module.exports = function (ok) {
  var R = require("../js/render.js"), oldStyle = R.getStyle(), oldSet = R.getIconSet();
  var strokes = [], paths = [], current, dash;
  var ctx = {
    save: function () {}, restore: function () {},
    beginPath: function () { paths = []; },
    moveTo: function (x, y) { current = [{x:x, y:y}]; paths.push(current); },
    lineTo: function (x, y) { current.push({x:x, y:y}); }, closePath: function () {},
    setLineDash: function (value) { dash = value; },
    stroke: function () { strokes.push({paths:paths, dash:dash, color:this.strokeStyle, width:this.lineWidth}); },
  };
  var renderer = new R.Renderer({getContext:function () { return ctx; }}, {});
  function band(col, row, min, max, clip) {
    var range = {};
    for (var r = 0; r < 18; r++) for (var c = 0; c < 18; c++) {
      var distance = HEX.distance(col, row, c, r);
      if (distance >= min && distance <= max && (!clip || c < 7)) range[HEX.key(c,r)] = {air:true};
    }
    renderer.fireRange = range;
    return Object.keys(range).length;
  }
  function area(points) {
    return points.reduce(function (sum, p, i) {
      var q = points[(i + 1) % points.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0) / 2;
  }
  try {
    [["pixel","legacy"],["pixel","remake"],["classic","remake"],["neon","remake"]].forEach(function (style) {
      R.setStyle(style[0]); R.setIconSet(style[1]);
      [0.3, 1, 3.7].forEach(function (zoom) {
        renderer.zoom = zoom; renderer.originX = -15.3; renderer.originY = 23.6;
        [6,7].forEach(function (col) {
          band(col, 8, 2, 5);
          var loops = renderer.firingContours("air");
          ok(loops.length === 2 && loops.map(function (p) { return p.length; }).sort(function (a,b) { return a-b; }).join() === "18,66",
            style.join("/") + " Hawkeye has only a closed 18-edge blind spot and 66-edge outer border at zoom " + zoom);
          ok(loops.some(function (p) { return area(p) < 0; }) && loops.some(function (p) { return area(p) > 0; }),
            "blind spot and outer contour wind in opposite directions");
        });
        [[7,8,2,5,false], [0,0,2,5,false], [6,8,2,5,true], [7,8,1,1,false]].forEach(function (args) {
          var count = band.apply(null, args), loops = renderer.firingContours("air");
          var covered = loops.reduce(function (sum, p) { return sum + area(p); }, 0);
          var cellArea = style[0] === "pixel" && style[1] === "legacy" ? 1024 : 3 * Math.sqrt(3) * 34 * 34 / 2;
          ok(Math.abs(covered - count * cellArea * zoom * zoom) < 0.00001,
            style.join("/") + " contours enclose exactly the covered cells, including clipped bands");
        });
      });
    });
    band(7,8,1,1);
    Object.keys(renderer.fireRange).forEach(function (key) { renderer.fireRange[key].ground = true; });
    strokes = []; renderer.drawFiringRange();
    ok(strokes.length === 2 && strokes[0].dash.length === 0 && strokes[1].dash.length === 2 &&
      strokes[0].width > strokes[1].width && JSON.stringify(strokes[0].paths) === JSON.stringify(strokes[1].paths),
      "coincident ground and air borders remain visible as a wider solid line and thinner dashes");
    renderer.fireRange = {}; strokes = []; renderer.drawFiringRange();
    ok(strokes.length === 0, "unsupported attack domains draw no border");
  } finally { R.setIconSet(oldSet); R.setStyle(oldStyle); }
};
