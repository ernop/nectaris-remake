/* Nectaris remake — hex grid math.
 * Flat-top hexagons, odd-q offset layout (columns; odd columns shifted down),
 * with cube coordinates used internally for neighbors/distance so parity
 * bugs are impossible.
 */
"use strict";

var HEX = (function () {
  // offset (col,row) -> cube {x,y,z}
  function toCube(col, row) {
    var x = col;
    var z = row - ((col - (col & 1)) >> 1);
    return { x: x, y: -x - z, z: z };
  }

  function toOffset(cube) {
    var col = cube.x;
    var row = cube.z + ((cube.x - (cube.x & 1)) >> 1);
    return { col: col, row: row };
  }

  var CUBE_DIRS = [
    { x: 1, y: -1, z: 0 }, { x: 1, y: 0, z: -1 }, { x: 0, y: 1, z: -1 },
    { x: -1, y: 1, z: 0 }, { x: -1, y: 0, z: 1 }, { x: 0, y: -1, z: 1 },
  ];

  // All 6 neighbors of an offset coordinate, as offset coordinates.
  function neighbors(col, row) {
    var c = toCube(col, row);
    var out = [];
    for (var i = 0; i < 6; i++) {
      var d = CUBE_DIRS[i];
      out.push(toOffset({ x: c.x + d.x, y: c.y + d.y, z: c.z + d.z }));
    }
    return out;
  }

  function distance(c1, r1, c2, r2) {
    var a = toCube(c1, r1), b = toCube(c2, r2);
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
  }

  // Pixel placement for flat-top hexes of circumradius `size`.
  function toPixel(col, row, size) {
    return {
      x: size * 1.5 * col,
      y: size * Math.sqrt(3) * (row + 0.5 * (col & 1)),
    };
  }

  // Inverse of toPixel: pixel -> nearest hex offset coordinate.
  function fromPixel(px, py, size) {
    // fractional cube via axial for flat-top
    var q = (2 / 3) * px / size;
    var r = (-1 / 3) * px / size + (Math.sqrt(3) / 3) * py / size;
    // cube round
    var x = q, z = r, y = -x - z;
    var rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
    var dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
    if (dx > dy && dx > dz) rx = -ry - rz;
    else if (dy > dz) ry = -rx - rz;
    else rz = -rx - ry;
    return toOffset({ x: rx, y: ry, z: rz });
  }

  // Corner points of a flat-top hex centered at (cx,cy).
  function corners(cx, cy, size) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var ang = (Math.PI / 180) * (60 * i);
      pts.push({ x: cx + size * Math.cos(ang), y: cy + size * Math.sin(ang) });
    }
    return pts;
  }

  function key(col, row) { return col + "," + row; }

  return {
    toCube: toCube, toOffset: toOffset, neighbors: neighbors,
    distance: distance, toPixel: toPixel, fromPixel: fromPixel,
    corners: corners, key: key,
  };
})();

if (typeof module !== "undefined") module.exports = HEX;
