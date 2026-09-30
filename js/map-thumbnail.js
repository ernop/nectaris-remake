/* Nectaris remake — small pixel pictures of a level's starting position for the
 * mission menu: terrain in the Legacy tiles' colors, bases and factories in
 * their owner's colors, and every starting unit as a dot in its army's color.
 * Hexes sit as on the Legacy board: one pitch apart in both directions, odd
 * columns half a pitch lower, each hex 1.5 pitches wide with slanted sides. */
"use strict";
var MAP_THUMBNAIL = (function () {
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
  var TERRAIN = {".": rgb("#521b26"), "-": rgb("#b5b9ad"), "=": rgb("#d6d9cc"), w: rgb("#6e3a44"),
    h: rgb("#80837a"), M: rgb("#97787a"), v: rgb("#130d15")};
  // By owner: Union, Xenon, neutral.
  var BASE = [rgb("#c8ccff"), rgb("#c8e4b4"), rgb("#eef0e4")];
  var FACTORY = [rgb("#8088e8"), rgb("#78a868"), rgb("#e0c020")];
  var UNIT = [rgb("#4a90e8"), rgb("#3cb44b")];
  var UNIT_EDGE = [rgb("#0c1d3a"), rgb("#0b2e12")];

  function hash(col, row) {
    var h = Math.imul(col + 71, 374761393) ^ Math.imul(row + 43, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  // Pixel size of the whole board within width × height, keeping its shape.
  function fit(level, width, height) {
    var cols = level.grid[0].length + 0.5, rows = level.grid.length + 0.5;
    var pitch = Math.min(width / cols, height / rows);
    return {width: Math.max(1, Math.round(cols * pitch)), height: Math.max(1, Math.round(rows * pitch))};
  }

  // RGBA bytes, row by row, of the level drawn width × height pixels.
  function paint(level, width, height) {
    var grid = level.grid, cols = grid[0].length, rows = grid.length;
    var pitch = Math.min(width / (cols + 0.5), height / (rows + 0.5));
    var ox = (width - pitch * (cols + 0.5)) / 2, oy = (height - pitch * (rows + 0.5)) / 2;
    var owners = {};
    (level.buildings || []).forEach(function (b) { owners[b.col + "," + b.row] = b.owner === 0 || b.owner === 1 ? b.owner : 2; });
    function building(col, row) {
      var ch = grid[row][col], owner = owners[col + "," + row];
      if (ch !== "B" && ch !== "F") return null;
      return (ch === "B" ? BASE : FACTORY)[owner === undefined ? 2 : owner];
    }
    // One color per hex, with a slight per-hex variation like the Legacy speckle.
    var fill = [], relief = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var ch = grid[r][c], own = building(c, r), vary = 0.9 + 0.2 * hash(c, r);
      if (!own && !TERRAIN[ch]) throw new Error("Bad terrain char '" + ch + "' at " + c + "," + r);
      fill.push(own || TERRAIN[ch].map(function (v) { return v * vary; }));
      relief.push(ch === "M" || ch === "h");
    }
    var out = new Uint8ClampedArray(width * height * 4);
    // Relief lit from the upper left once a hex spans a few pixels; hex outlines
    // once it spans enough to keep its fill.
    var lit = pitch >= 3, edge = pitch >= 6 ? 1.2 / pitch : 0;
    for (var y = 0; y < height; y++) {
      var by = (y + 0.5 - oy) / pitch;
      for (var x = 0; x < width; x++) {
        var bx = (x + 0.5 - ox) / pitch, col = Math.floor(bx), hit = -1, dx = 0, dy = 0;
        // The point lies in hex column floor(bx) or in the slanted side of the one before.
        for (var k = 0; k < 2 && hit < 0; k++, col--) {
          if (col < 0 || col >= cols) continue;
          var shift = (col & 1) / 2, row = Math.floor(by - shift);
          if (row < 0 || row >= rows) continue;
          dx = bx - col - 0.75; dy = by - row - 0.5 - shift;
          if (Math.abs(dx) + Math.abs(dy) <= 0.75) hit = row * cols + col;
        }
        if (hit < 0) continue;
        var shade = lit && relief[hit] ? 1 - 0.3 * (dx + dy) / 0.75 : 1;
        if (edge && (0.75 - Math.abs(dx) - Math.abs(dy) < edge || 0.5 - Math.abs(dy) < edge * 0.7)) shade *= 0.8;
        var color = fill[hit], at = (y * width + x) * 4;
        out[at] = color[0] * shade; out[at + 1] = color[1] * shade; out[at + 2] = color[2] * shade; out[at + 3] = 255;
      }
    }
    // A disc at a hex's center. Its radius never drops below the distance to the
    // nearest pixel center, so every unit and building stays visible on large maps.
    function disc(col, row, radius, color, rim) {
      var cx = ox + (col + 0.75) * pitch, cy = oy + (row + 0.5 + (col & 1) / 2) * pitch;
      radius = Math.max(0.72, radius);
      var outer = rim ? radius + 1 : radius;
      for (var py = Math.max(0, Math.floor(cy - outer)); py <= Math.min(height - 1, Math.ceil(cy + outer)); py++) {
        for (var px = Math.max(0, Math.floor(cx - outer)); px <= Math.min(width - 1, Math.ceil(cx + outer)); px++) {
          var d = Math.hypot(px + 0.5 - cx, py + 0.5 - cy), paintWith = d <= radius ? color : d <= outer ? rim : null;
          if (!paintWith) continue;
          var at = (py * width + px) * 4;
          out[at] = paintWith[0]; out[at + 1] = paintWith[1]; out[at + 2] = paintWith[2]; out[at + 3] = 255;
        }
      }
    }
    if (pitch < 1.5) for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
      var small = building(c, r);
      if (small) disc(c, r, 0, small, null);
    }
    (level.units || []).forEach(function (unit) {
      disc(unit.x, unit.y, 0.3 * pitch, UNIT[unit.o], pitch >= 5 ? UNIT_EDGE[unit.o] : null);
    });
    return out;
  }

  // Levels keep their object identity for the page's lifetime, so each is
  // painted once per size and pixel density.
  var painted = new WeakMap();
  // A canvas at most maxWidth × height CSS pixels, sharp at the display's density.
  function canvas(level, maxWidth, height) {
    var ratio = window.devicePixelRatio, size = fit(level, maxWidth * ratio, height * ratio);
    var key = size.width + "x" + size.height, cached = painted.get(level);
    if (!cached || cached.key !== key) {
      cached = {key: key, pixels: paint(level, size.width, size.height)};
      painted.set(level, cached);
    }
    var node = document.createElement("canvas");
    node.width = size.width; node.height = size.height;
    node.style.width = size.width / ratio + "px"; node.style.height = size.height / ratio + "px";
    node.className = "map-thumbnail";
    node.setAttribute("aria-hidden", "true");
    var context = node.getContext("2d"), image = context.createImageData(size.width, size.height);
    image.data.set(cached.pixels);
    context.putImageData(image, 0, 0);
    return node;
  }

  return {fit: fit, paint: paint, canvas: canvas};
})();
if (typeof module !== "undefined") module.exports = MAP_THUMBNAIL;
