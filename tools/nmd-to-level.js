#!/usr/bin/env node
/* Nectaris remake — .nmd map converter.
 *
 * Reads a Nectaris "NEC MAP V1.01" map file (the format written by the unit
 * placement editor bundled with the 1997/1999 Windows release) and prints a
 * level JSON skeleton for this remake.
 *
 *   node tools/nmd-to-level.js path/to/map.nmd > level.json
 *
 * No map files are bundled with this repository. Point the tool at .nmd
 * files you downloaded or authored yourself, and respect the terms of
 * whoever published them -- see LEVEL_SOURCES.md.
 *
 * File layout (verified against 25 map files, and consistent with the
 * independent GPL-3.0 tool at SourceK78/nectaris_gb_map_converter):
 *
 *   0x00  16 bytes  magic "NEC MAP V1.01   "
 *   0x10   8 bytes  map name, NUL padded
 *   0x18   1 byte   width in hexes
 *   0x19   1 byte   height in hexes
 *   0x1a   w*h*2    tile indices, little-endian uint16, row-major
 *   ...    3 bytes  per placed unit, up to 56 units
 *   end    1 byte   0xff terminator
 *
 * A tile index selects scenery art, not a terrain type: the tileset carries
 * many edge-transition variants per terrain. TILE_TERRAIN below maps every
 * index to one of this game's nine terrain characters. It was derived by
 * rendering each distinct index from published map screenshots and reading
 * the terrain off the hex centre; see LEVEL_SOURCES.md for the method. An
 * index outside the table is a hard error rather than a guess, because
 * silently defaulting an unknown tile to plains would ship a wrong map.
 *
 * The .nmd hex layout raises odd columns; this remake lowers them. The
 * converter therefore mirrors the map vertically, which maps one layout
 * onto the other exactly and preserves every adjacency.
 */
"use strict";

var fs = require("fs");

var TILE_TERRAIN = {
    0x01: "h", 0x02: "h", 0x03: "h", 0x04: "h", 0x05: "h", 0x06: "h", 0x07: ".", 0x08: ".",
    0x09: ".", 0x0a: "h", 0x0b: ".", 0x0c: ".", 0x0d: "h", 0x0e: ".", 0x0f: "h", 0x10: ".",
    0x12: ".", 0x13: "h", 0x14: ".", 0x15: ".", 0x16: "h", 0x17: ".", 0x18: "h", 0x19: "h",
    0x1a: ".", 0x1b: ".", 0x1d: ".", 0x1e: ".", 0x1f: "h", 0x20: "h", 0x21: "h", 0x22: ".",
    0x24: ".", 0x26: "h", 0x27: ".", 0x28: "h", 0x29: ".", 0x2a: ".", 0x2b: "h", 0x2c: ".",
    0x2d: ".", 0x2e: "h", 0x2f: ".", 0x30: "h", 0x31: ".", 0x32: ".", 0x34: ".", 0x35: ".",
    0x36: "h", 0x37: ".", 0x39: ".", 0x3a: ".", 0x3b: ".", 0x3c: ".", 0x3d: ".", 0x3e: ".",
    0x3f: "h", 0x40: ".", 0x41: ".", 0x42: ".", 0x45: "M", 0x46: ".", 0x48: ".", 0x49: "h",
    0x4a: ".", 0x4b: "M", 0x4d: "M", 0x4e: ".", 0x50: ".", 0x51: ".", 0x52: ".", 0x54: "M",
    0x55: "M", 0x56: "w", 0x57: ".", 0x58: ".", 0x59: ".", 0x5c: "M", 0x5d: "M", 0x5e: "w",
    0x5f: "w", 0x60: "B", 0x61: "w", 0x62: "B", 0x63: "B", 0x64: ".", 0x65: "M", 0x66: "w",
    0x67: ".", 0x68: ".", 0x69: "v", 0x6b: ".", 0x6c: "B", 0x6d: "M", 0x6e: "M", 0x6f: ".",
    0x70: "F", 0x71: "F", 0x73: "w", 0x74: "M", 0x75: "B", 0x76: ".", 0x78: ".", 0x79: "F",
    0x7a: ".", 0x7b: "F", 0x7c: ".", 0x7e: "v", 0x7f: "h", 0x80: ".", 0x81: ".", 0x82: "h",
    0x83: ".", 0x84: ".", 0x85: ".", 0x88: ".", 0x8a: ".", 0x8b: "M", 0x90: "M", 0x91: "M",
    0x92: "M", 0x99: "v", 0x9a: "v", 0x9b: "-", 0x9c: "v", 0x9d: ".", 0x9f: "w", 0xa2: "v",
    0xa3: "v", 0xa4: "v", 0xa6: ".", 0xa7: "v", 0xa8: "v", 0xa9: ".", 0xaa: "v", 0xab: "v",
    0xac: "w", 0xad: "v", 0xae: "v", 0xaf: "-", 0xb0: "M", 0xb1: "-", 0xb2: "-", 0xb3: ".",
    0xb4: "-", 0xb5: "-", 0xb7: "v", 0xb8: "-", 0xb9: "-", 0xbb: "=", 0xbd: "-", 0xbe: "-",
    0xbf: "w", 0xc0: ".", 0xc1: "w", 0xc2: "-", 0xc3: "h", 0xc4: "h", 0xc5: "-", 0xc6: "-",
    0xc7: "w", 0xc9: "h", 0xcb: "w", 0xcc: ".", 0xce: "h", 0xd0: "h", 0xd1: "w", 0xd4: ".",
    0xd5: "h", 0xd6: "h", 0xd9: ".", 0xda: "w", 0xdb: ".", 0xdc: "w", 0xdd: ".", 0xde: "h",
    0xdf: "=", 0xe1: ".", 0xe2: ".", 0xe3: "v", 0xe4: "w", 0xe5: "w", 0xe7: "-", 0xe8: ".",
    0xe9: ".", 0xec: "h", 0xee: "h", 0xef: ".", 0xf3: "h", 0xf4: "w", 0xf6: ".", 0xfb: "h",
    0xfc: "w", 0xfe: "h",};

var MAGIC = "NEC MAP V1.01   ";

function parseNmd(buf) {
  var magic = buf.toString("latin1", 0, 16);
  if (magic !== MAGIC) {
    throw new Error("Not a Nectaris map file: magic is " + JSON.stringify(magic));
  }
  var name = buf.toString("latin1", 16, 24).replace(/\0.*$/, "").trim();
  var width = buf[0x18];
  var height = buf[0x19];
  var cells = width * height;
  var end = 0x1a + cells * 2;
  if (end > buf.length) {
    throw new Error("Truncated map: " + width + "x" + height + " needs " + end + " bytes, file has " + buf.length);
  }
  var tiles = new Array(cells);
  for (var i = 0; i < cells; i++) tiles[i] = buf.readUInt16LE(0x1a + i * 2);

  // Unit records: 3 bytes each, then a single 0xff terminator.
  var rest = buf.slice(end);
  if (rest.length && rest[rest.length - 1] === 0xff) rest = rest.slice(0, -1);
  var units = [];
  for (var u = 0; u + 3 <= rest.length; u += 3) {
    units.push([rest[u], rest[u + 1], rest[u + 2]]);
  }
  return { name: name, width: width, height: height, tiles: tiles, unitRecords: units };
}

function toGrid(map) {
  var rows = [];
  for (var r = 0; r < map.height; r++) {
    var line = "";
    for (var c = 0; c < map.width; c++) {
      var tile = map.tiles[r * map.width + c];
      var ch = TILE_TERRAIN[tile];
      if (ch === undefined) {
        throw new Error("Unknown tile index 0x" + tile.toString(16) +
          " at column " + c + ", row " + r + ". Add it to TILE_TERRAIN in " +
          "tools/nmd-to-level.js once you have identified its terrain.");
      }
      line += ch;
    }
    rows.push(line);
  }
  rows.reverse();   // odd-columns-up (.nmd) -> odd-columns-down (this game)
  return rows;
}

/* Structure art spans more than one hex, so several neighbouring indices can
 * decode to the same building. Keep one hex per connected clump. */
function consolidateBuildings(rows, ch) {
  var h = rows.length, w = rows[0].length;
  var g = rows.map(function (r) { return r.split(""); });
  var seen = {}, kept = [];
  for (var r = 0; r < h; r++) {
    for (var c = 0; c < w; c++) {
      if (g[r][c] !== ch || seen[c + "," + r]) continue;
      var stack = [[c, r]], clump = [];
      seen[c + "," + r] = true;
      while (stack.length) {
        var p = stack.pop();
        clump.push(p);
        for (var dx = -1; dx <= 1; dx++) {
          for (var dy = -1; dy <= 1; dy++) {
            var nx = p[0] + dx, ny = p[1] + dy, k = nx + "," + ny;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && !seen[k] && g[ny][nx] === ch) {
              seen[k] = true;
              stack.push([nx, ny]);
            }
          }
        }
      }
      clump.sort(function (a, b) { return (a[1] - b[1]) || (a[0] - b[0]); });
      var keep = clump[Math.floor(clump.length / 2)];
      clump.forEach(function (p) { if (p !== keep) g[p[1]][p[0]] = "."; });
      kept.push(keep);
    }
  }
  return { rows: g.map(function (r) { return r.join(""); }), cells: kept };
}

function convert(buf) {
  var map = parseNmd(buf);
  var rows = toGrid(map);
  var bases = consolidateBuildings(rows, "B");
  rows = bases.rows;
  var facts = consolidateBuildings(rows, "F");
  rows = facts.rows;

  var buildings = bases.cells.map(function (p, i) {
    return { col: p[0], row: p[1], owner: i < 2 ? i : -1 };
  }).concat(facts.cells.map(function (p) {
    return { col: p[0], row: p[1], owner: -1, stored: [] };
  }));

  return {
    name: map.name || "IMPORTED",
    turnLimit: 50,
    grid: rows,
    buildings: buildings,
    units: [],
    _note: "Unit placement is not imported: .nmd unit records are not decoded. " +
      "Place units in editor.html, or add a units array by hand.",
    _source: { file: map.name, size: map.width + "x" + map.height, placedUnits: map.unitRecords.length },
  };
}

if (require.main === module) {
  var path = process.argv[2];
  if (!path) {
    console.error("usage: node tools/nmd-to-level.js <map.nmd>");
    process.exit(2);
  }
  console.log(JSON.stringify(convert(fs.readFileSync(path)), null, 2));
}

module.exports = { parseNmd: parseNmd, convert: convert, TILE_TERRAIN: TILE_TERRAIN };
