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

  // Neighbour order is the cube directions (+x−y), (+x−z), (+y−z), (−x+y),
  // (−x+z), (−y+z), as offset steps (col, row pairs) for even and odd columns.
  // Search calls these constantly, so they avoid cube objects.
  var NEIGHBOR_STEPS = [[1, 0, 1, -1, 0, -1, -1, -1, -1, 0, 0, 1], [1, 1, 1, 0, 0, -1, -1, 0, -1, 1, 0, 1]];

  // All 6 neighbors of an offset coordinate, as offset coordinates.
  function neighbors(col, row) {
    var s = NEIGHBOR_STEPS[col & 1];
    return [{ col: col + s[0], row: row + s[1] }, { col: col + s[2], row: row + s[3] },
      { col: col + s[4], row: row + s[5] }, { col: col + s[6], row: row + s[7] },
      { col: col + s[8], row: row + s[9] }, { col: col + s[10], row: row + s[11] }];
  }

  function distance(c1, r1, c2, r2) {
    var dx = c1 - c2, dz = r1 - ((c1 - (c1 & 1)) >> 1) - (r2 - ((c2 - (c2 & 1)) >> 1));
    return Math.max(Math.abs(dx), Math.abs(dx + dz), Math.abs(dz));
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
