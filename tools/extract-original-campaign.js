#!/usr/bin/env node
/* Extract the 16 normal-campaign maps from Hudson's official 1997 Windows
 * PC Engine remake.
 *
 * Usage:
 *   node tools/extract-original-campaign.js path/to/Nec.exe > js/data-maps.js
 *
 * The tables below identify the built-in terrain, deployments and factory
 * inventories in the 1997-11-05 executable. The executable itself is not
 * bundled.
 */
"use strict";

var crypto = require("crypto");
var fs = require("fs");

var EXPECTED_SHA256 =
  "d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92";
var DATA_VA = 0x42a000;
var DATA_FILE_OFFSET = 0x27c00;
var WIDTHS = 0x42a9a0;
var HEIGHTS = 0x42a9b0;
var TERRAIN_DEFENSE = 0x42b160;
var TERRAIN_POINTERS = 0x47f750;
var FACTORY_COORDINATES = 0x47f7d0;
var UNIT_POINTERS = 0x46b988;

var NAMES = [
  "REVOLT", "ICARUS", "CYRANO", "RAMSEY",
  "NEWTON", "SENECA", "SABINE", "ARATUS",
  "GALOIS", "DARWIN", "PASCAL", "HALLEY",
  "BORMAN", "APPOLO", "KAISER", "NECTOR",
];

var BLURBS = [
  "The original opening battle: infantry and Bisons contest a bridge between two prison camps.",
  "A larger infantry-and-Bison engagement across broken lunar terrain.",
  "Xenon begins with a factory containing Kilroy infantry and Hadrian artillery.",
  "Aircraft, artillery and four factories widen the battle across a tall battlefield.",
  "Four neutral factories hold the weapons that decide this mobile engagement.",
  "Air power and troop carriers enter a race for three neutral factories.",
  "Both armies begin with factory reserves while two neutral arsenals divide the front.",
  "A broad east-west battlefield filled with aircraft, carriers and factory reserves.",
  "A large combined-arms battle with four neutral arsenals and extensive reserves.",
  "Seven factories spread aircraft and heavy weapons across a deep battlefield.",
  "Six factories and large reserves make control of deployment routes decisive.",
  "Three neutral arsenals anchor a dense combined-arms confrontation.",
  "Both armies begin entirely inside factories and must choose their opening deployments.",
  "Artillery, aircraft and heavy armour converge around six factories.",
  "Five factories distribute a large late-campaign force across the lunar front.",
  "The original normal campaign's final assault on the Xenon prison camp.",
];

var UNIT_IDS = {
  0: "TRIGGER",
  1: "FALCON",
  2: "EAGLE",
  3: "HUNTER",
  4: "GRIZZLY",
  5: "POLAR",
  6: "BISON",
  7: "SLAGGER",
  8: "TITAN",
  9: "GIANT",
  10: "LENET",
  11: "HADRIAN",
  12: "OCTOPUS",
  13: "RABBIT",
  14: "LYNX",
  15: "SEEKER",
  16: "HAWKEYE",
  17: "ATLAS",
  18: "CHARLIE",
  19: "KILROY",
  20: "PANTHER",
  21: "MULE",
  22: "PELICAN",
};

var TERRAIN = {
  0: ".", 1: "-", 2: "h", 3: "w", 4: "v", 5: "M", 6: "=",
  8: "B", 10: "B", 11: "F", 12: "F", 13: "F",
};
var BUILDING_OWNER = { 8: 0, 10: 1, 11: 0, 12: -1, 13: 1 };

function fail(message) {
  throw new Error(message);
}

function fileOffset(address) {
  return address - DATA_VA + DATA_FILE_OFFSET;
}

function readPointer(buffer, tableAddress, index) {
  return buffer.readUInt32LE(fileOffset(tableAddress) + index * 4);
}

function BitReader(buffer, start) {
  this.buffer = buffer;
  this.byte = start;
  this.mask = 0x80;
}
BitReader.prototype.read = function (count) {
  var value = 0;
  for (var i = 0; i < count; i++) {
    value = value * 2 + ((this.buffer[this.byte] & this.mask) ? 1 : 0);
    this.mask >>= 1;
    if (!this.mask) {
      this.mask = 0x80;
      this.byte++;
    }
  }
  return value;
};

function decompressTerrain(buffer, address, cellCount) {
  var bits = new BitReader(buffer, fileOffset(address));
  var history = new Array(256).fill(0x20);
  var writeAt = 0xef;
  var copyAt = 0;
  var copyLeft = 0;
  var output = [];

  while (output.length < cellCount) {
    var value;
    if (copyLeft) {
      value = history[copyAt];
      copyAt = (copyAt + 1) & 0xff;
      copyLeft--;
    } else if (bits.read(1)) {
      value = bits.read(8);
    } else {
      copyAt = bits.read(8);
      copyLeft = bits.read(4) + 2;
      value = history[copyAt];
      copyAt = (copyAt + 1) & 0xff;
      copyLeft--;
    }
    output.push(value);
    history[writeAt] = value;
    writeAt = (writeAt + 1) & 0xff;
  }
  return output;
}

function factoryCoordinates(buffer, mapIndex) {
  var coordinates = [];
  var start = fileOffset(FACTORY_COORDINATES) + mapIndex * 16;
  for (var i = 0; i < 8; i++) {
    var x = buffer[start + i * 2];
    var y = buffer[start + i * 2 + 1];
    if (x === 0xff && y === 0xff) break;
    coordinates.push([x, y]);
  }
  return coordinates;
}

function decodeMap(buffer, mapIndex) {
  var width = buffer[fileOffset(WIDTHS) + mapIndex];
  var height = buffer[fileOffset(HEIGHTS) + mapIndex];
  var terrain = decompressTerrain(
    buffer, readPointer(buffer, TERRAIN_POINTERS, mapIndex), width * height
  );
  var grid = [];
  var buildings = [];

  for (var y = 0; y < height; y++) {
    var row = "";
    for (var x = 0; x < width; x++) {
      var code = terrain[y * width + x];
      if (TERRAIN[code] === undefined) {
        fail("Unknown campaign terrain code " + code + " at " + x + "," + y);
      }
      row += TERRAIN[code];
      if (BUILDING_OWNER[code] !== undefined) {
        var building = { col: x, row: y, owner: BUILDING_OWNER[code] };
        if (code >= 11) building.stored = [];
        buildings.push(building);
      }
    }
    grid.push(row);
  }

  var byCell = {};
  buildings.forEach(function (building) {
    byCell[building.col + "," + building.row] = building;
  });
  var factoryCells = factoryCoordinates(buffer, mapIndex);
  var units = [];
  var record = fileOffset(readPointer(buffer, UNIT_POINTERS, mapIndex));

  while (buffer[record] !== 0xff) {
    var encodedType = buffer[record];
    var encodedX = buffer[record + 1];
    var encodedY = buffer[record + 2];
    var type = UNIT_IDS[encodedType & 0x1f];
    if (!type) fail("Unknown unit type " + (encodedType & 0x1f));

    if ((encodedX & 0xe0) === 0) {
      units.push({
        t: type,
        o: (encodedType & 0x80) ? 1 : 0,
        x: encodedX,
        y: encodedY,
      });
    } else {
      var slotCode = (encodedX & 0xef) >> 4;
      var slot = (slotCode - 2) / 2;
      if (!Number.isInteger(slot) || !factoryCells[slot]) {
        fail("Invalid factory slot code 0x" + encodedX.toString(16));
      }
      var cell = factoryCells[slot];
      var factory = byCell[cell[0] + "," + cell[1]];
      if (!factory || !factory.stored) {
        fail("Stored unit points to missing factory at " + cell.join(","));
      }
      factory.stored.push(type);
    }
    record += 3;
  }

  return {
    name: NAMES[mapIndex],
    blurb: BLURBS[mapIndex],
    turnLimit: 50,
    grid: grid,
    buildings: buildings,
    units: units,
  };
}

function mapLiteral(map) {
  var lines = [
    "  { name: " + JSON.stringify(map.name) +
      ", blurb: " + JSON.stringify(map.blurb) + ",",
    "    turnLimit: " + map.turnLimit + ",",
    "    grid: [",
  ];
  map.grid.forEach(function (row) {
    lines.push("      " + JSON.stringify(row) + ",");
  });
  lines.push("    ],", "    buildings: [");
  map.buildings.forEach(function (building) {
    lines.push("      " + JSON.stringify(building) + ",");
  });
  lines.push("    ],", "    units: [");
  map.units.forEach(function (unit) {
    lines.push("      " + JSON.stringify(unit) + ",");
  });
  lines.push("    ] }");
  return lines.join("\n");
}

var executable = process.argv[2];
if (!executable) fail("usage: node tools/extract-original-campaign.js path/to/Nec.exe");
var buffer = fs.readFileSync(executable);
var digest = crypto.createHash("sha256").update(buffer).digest("hex");
if (digest !== EXPECTED_SHA256) {
  fail("Unsupported Nec.exe: SHA-256 is " + digest + ", expected " + EXPECTED_SHA256);
}
var expectedDefense = [5, 0, 20, 30, 0, 40, 0];
expectedDefense.forEach(function (defense, code) {
  if (buffer[fileOffset(TERRAIN_DEFENSE) + code] !== defense) {
    fail("Unexpected defense value for terrain code " + code);
  }
});

var maps = NAMES.map(function (_, index) { return decodeMap(buffer, index); });
console.log("/* Nectaris remake — official Hudson normal campaign.");
console.log(" *");
console.log(" * Generated from Hudson's official 1997 Windows freeware port with:");
console.log(" *   node tools/extract-original-campaign.js path/to/Nec.exe > js/data-maps.js");
console.log(" * Terrain, buildings, deployments and factory inventories reproduce the");
console.log(" * Windows remake's built-in campaign. English unit IDs follow the");
console.log(" * TurboGrafx-16 release.");
console.log(" */");
console.log("\"use strict\";");
console.log("");
console.log("var CAMPAIGN = [");
console.log(maps.map(mapLiteral).join(",\n\n"));
console.log("];");
console.log("");
console.log("if (typeof module !== \"undefined\") module.exports = CAMPAIGN;");
