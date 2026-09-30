/* Nectaris remake — small pictures of a level's starting position for the
 * mission menu: terrain in the Legacy tiles' colors, bases and factories in
 * their owner's colors, and every starting unit as a dot in its army's color.
 * Hexes sit as on the Legacy board: one pitch apart in both directions, odd
 * columns half a pitch lower, each hex 1.5 pitches wide with slanted sides.
 * Pictures are SVG, so they fill any box sharply at any pixel density without
 * keeping a bitmap for every level on the menu. */
"use strict";
var MAP_THUMBNAIL = (function () {
  // Three shades of each terrain color, picked per hex like the Legacy speckle.
  var TERRAIN = {".": "#521b26", "-": "#b5b9ad", "=": "#d6d9cc", w: "#6e3a44", h: "#80837a", M: "#97787a", v: "#130d15"};
  Object.keys(TERRAIN).forEach(function (ch) {
    var n = parseInt(TERRAIN[ch].slice(1), 16);
    TERRAIN[ch] = [0.9, 1, 1.1].map(function (k) {
      return "#" + [n >> 16, n >> 8 & 255, n & 255].map(function (v) {
        return Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
      }).join("");
    });
  });
  // By owner: Union, Xenon, neutral.
  var BASE = ["#c8ccff", "#c8e4b4", "#eef0e4"];
  var FACTORY = ["#8088e8", "#78a868", "#e0c020"];
  var UNIT = ["#4a90e8", "#3cb44b"];
  var UNIT_EDGE = ["#0c1d3a", "#0b2e12"];

  function hash(col, row) {
    var h = Math.imul(col + 71, 374761393) ^ Math.imul(row + 43, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // Shapes drawn from a start point, in eighths of a pitch so every
  // coordinate is a whole number. A hex starts at its left corner. Hills and
  // mountains are lit from the upper left: two halves either side of the line
  // through the center from upper right to lower left, both starting on it.
  var HEX = "l4-4h4l4 4-4 4h-4z";
  var LIT = "l-1-1h-4l-4 4 3 3z", SHADED = "l3 3-4 4h-4l-1-1z";
  var DOT = "a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0";
  // Every shape ends where it began, so each next one moves from there.
  function pathData(starts, shape) {
    var x = 0, y = 0;
    return starts.map(function (at) {
      var move = "m" + (at[0] - x) + " " + (at[1] - y);
      x = at[0]; y = at[1];
      return move + shape;
    }).join("");
  }

  // SVG markup of the level's starting position. Every value written into the
  // markup is a number or one of the colors above, so level data cannot add
  // markup of its own.
  function markup(level) {
    var grid = level.grid, cols = grid[0].length, rows = grid.length;
    var owners = {}, fills = {}, relief = [], dots = [[], []];
    (level.buildings || []).forEach(function (b) { owners[b.col + "," + b.row] = b.owner === 0 || b.owner === 1 ? b.owner : 2; });
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var ch = grid[r][c], y = 8 * r + 4 + 4 * (c & 1), owner = owners[c + "," + r], color;
      if (ch === "B" || ch === "F") color = (ch === "B" ? BASE : FACTORY)[owner === undefined ? 2 : owner];
      else if (TERRAIN[ch]) color = TERRAIN[ch][Math.floor(hash(c, r) * 3)];
      else throw new Error("Bad terrain char '" + ch + "' at " + c + "," + r);
      (fills[color] = fills[color] || []).push([8 * c, y]);
      if (ch === "h" || ch === "M") relief.push([8 * c + 9, y - 3]);
    }
    (level.units || []).forEach(function (u, i) {
      if ((u.o !== 0 && u.o !== 1) || !Number.isInteger(u.x) || !Number.isInteger(u.y)) {
        throw new Error("Unit " + (i + 1) + " needs a side of 0 or 1 and whole-number x and y.");
      }
      dots[u.o].push([8 * u.x + 3.5, 8 * u.y + 4 + 4 * (u.x & 1)]);
    });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (8 * cols + 4) + " " + (8 * rows + 4) +
      '" aria-hidden="true"><g stroke="#000" stroke-opacity=".3" stroke-width=".5">';
    Object.keys(fills).forEach(function (fill) { svg += '<path fill="' + fill + '" d="' + pathData(fills[fill], HEX) + '"/>'; });
    svg += "</g>";
    if (relief.length) {
      svg += '<path fill="#fff" fill-opacity=".2" d="' + pathData(relief, LIT) + '"/>' +
        '<path fill="#000" fill-opacity=".25" d="' + pathData(relief, SHADED) + '"/>';
    }
    dots.forEach(function (starts, side) {
      if (starts.length) svg += '<path fill="' + UNIT[side] + '" stroke="' + UNIT_EDGE[side] + '" stroke-width=".6" d="' + pathData(starts, DOT) + '"/>';
    });
    return svg + "</svg>";
  }

  // Levels keep their object identity for the page's lifetime, so each picture
  // is built once and moved into every rebuilt menu.
  var pictures = new WeakMap();
  function picture(level) {
    var svg = pictures.get(level);
    if (!svg) {
      var holder = document.createElement("div");
      holder.innerHTML = markup(level);
      svg = holder.firstChild;
      svg.setAttribute("class", "map-thumbnail");
      pictures.set(level, svg);
    }
    return svg;
  }

  return {markup: markup, picture: picture};
})();
if (typeof module !== "undefined") module.exports = MAP_THUMBNAIL;
