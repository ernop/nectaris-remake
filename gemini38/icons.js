'use strict';
// gemini38 icon builder — 15 original 32x32 indexed pixel constructions.
// Designed with upper-left illumination, selective outlines, faction ramps,
// centered horizontal silhouettes, and pure Node.js stdlib PNG generation.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, 'icons');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const IDS = [
  'PHALANX', 'SENTINEL', 'DART', 'STORM', 'CYCLOPS',
  'BUNKER', 'RANGER', 'HOPLITE', 'MORTAR', 'CHEETAH',
  'RHINO', 'MAMMOTH', 'BUFFALO', 'CORSAIR', 'TALON'
];

const PAL = {
  union: [
    null, '#14151F', '#303440', '#626B78', '#A9B6C4', '#ECF4F0',
    '#15335A', '#24578B', '#397EC0', '#73B5E8', '#C0E4F6',
    '#183D52', '#91D0D8', '#9C6A25', '#F2CB58', '#241C26'
  ],
  xenon: [
    null, '#14151F', '#303440', '#626B78', '#A9B6C4', '#ECF4F0',
    '#183C28', '#28653B', '#419450', '#80C17A', '#CCE8AE',
    '#183D52', '#91D0D8', '#9C6A25', '#F2CB58', '#241C26'
  ]
};

function grid() { return new Uint8Array(32 * 32); }

function draw(id, left) {
  const g = grid();
  const px = (x, y, c) => {
    x |= 0; y |= 0;
    const targetX = left ? 31 - x : x;
    if (targetX >= 0 && y >= 0 && targetX < 32 && y < 32 && !g[y * 32 + targetX]) {
      g[y * 32 + targetX] = c;
    }
  };
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c);
  };
  const line = (x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const poly = (pts, c) => {
    const ys = pts.map(p => p[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(31, Math.ceil(Math.max(...ys))); y++) {
      const hits = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= y + .5 && b[1] > y + .5) || (b[1] <= y + .5 && a[1] > y + .5)) {
          hits.push(a[0] + (y + .5 - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
      }
      hits.sort((a, b) => a - b);
      for (let i = 0; i + 1 < hits.length; i += 2) {
        for (let x = Math.ceil(hits[i] - .5); x < hits[i + 1] - .5; x++) px(x, y, c);
      }
    }
  };

  const shadow = (x, y, w) => R(x, y, w, 1, 15);
  const tracks = (x, y, w) => {
    R(x, y, w, 4, 2);
    R(x + 1, y, w - 2, 1, 4);
    for (let n = x + 2; n < x + w - 1; n += 4) { R(n, y + 2, 2, 1, 4); }
  };
  const wheel = (x, y) => {
    R(x, y, 4, 4, 2);
    R(x + 1, y, 2, 1, 4);
    R(x + 1, y + 3, 2, 1, 3);
  };
  const gun = (x, y, len) => { R(x, y, len, 2, 3); R(x, y, 1, 1, 5); };
  const missile = (x, y, len) => {
    R(x, y, len, 2, 13);
    R(x + len - 2, y, 2, 2, 14);
    R(x, y, 1, 1, 5);
  };
  const soldier = (x, y, pose) => {
    R(x + 1, y, 5, 2, 10);
    R(x + 1, y, 4, 1, 5);
    R(x, y + 2, 7, 1, 9);
    R(x + 2, y + 3, 3, 2, 4);
    R(x + 1, y + 5, 5, 5, 8);
    R(x + 2, y + 5, 3, 1, 5);
    if (pose === 'run') {
      line(x + 2, y + 10, x - 1, y + 13, 7);
      line(x + 5, y + 10, x + 8, y + 12, 6);
      R(x - 2, y + 13, 4, 1, 3);
      R(x + 7, y + 12, 4, 1, 3);
    } else if (pose === 'kneel') {
      R(x + 1, y + 10, 3, 2, 7);
      R(x + 4, y + 10, 5, 2, 6);
      R(x, y + 12, 4, 1, 3);
      R(x + 7, y + 12, 3, 1, 3);
    } else {
      R(x + 1, y + 10, 2, 3, 7);
      R(x + 5, y + 10, 2, 3, 6);
      R(x, y + 13, 4, 1, 3);
      R(x + 5, y + 13, 4, 1, 3);
    }
  };
  const hullSlab = (x, y, w, h) => {
    poly([[x, y], [x + w - 4, y], [x + w, y + 3], [x + w, y + h], [x, y + h]], 7);
    poly([[x, y], [x + w - 4, y], [x + w, y + 3], [x + 3, y + 3]], 9);
    R(x, y, w - 5, 1, 5);
  };

  switch (id) {
    case 'PHALANX': // Armored frontline flak tank
      shadow(4, 25, 24);
      tracks(3, 21, 26);
      hullSlab(4, 14, 24, 7);
      R(8, 17, 16, 3, 6);
      // Turret with twin high-elevation autocannons
      R(10, 9, 10, 6, 8);
      R(10, 9, 9, 1, 10);
      line(14, 9, 23, 2, 3); line(14, 8, 23, 1, 5); // upper gun
      line(17, 11, 26, 4, 3); line(17, 10, 26, 3, 5); // lower gun
      R(22, 2, 2, 2, 2); R(25, 4, 2, 2, 2);
      R(7, 11, 4, 4, 9); R(8, 12, 2, 2, 12); // radar / optronics
      break;

    case 'SENTINEL': // Deployable static heavy SAM battery
      shadow(6, 25, 20);
      // Outriggers
      line(8, 24, 13, 21, 3); line(24, 24, 19, 21, 3);
      R(6, 23, 4, 2, 2); R(22, 23, 4, 2, 2);
      // Base pad
      R(10, 18, 12, 4, 7); R(10, 18, 11, 1, 10);
      // Turret tower
      R(12, 13, 8, 6, 8); R(12, 13, 7, 1, 9);
      // Dual heavy missiles angled high
      line(14, 14, 24, 4, 13); line(15, 14, 25, 4, 14);
      line(11, 15, 21, 5, 13); line(12, 15, 22, 5, 14);
      R(23, 3, 3, 2, 5); R(20, 4, 3, 2, 5);
      // Search radar antenna
      line(8, 13, 8, 7, 3); line(6, 7, 10, 7, 4); R(7, 6, 3, 1, 10);
      break;

    case 'DART': // Tracked anti-air missile buggy
      shadow(5, 24, 21);
      tracks(4, 21, 23);
      hullSlab(4, 16, 22, 5);
      R(6, 12, 8, 5, 8); R(6, 12, 7, 1, 10);
      R(8, 13, 4, 2, 12); // windshield
      // Rear elevated missile rail with 2 missiles
      line(14, 16, 23, 11, 4);
      missile(16, 11, 8);
      missile(18, 9, 8);
      break;

    case 'STORM': // Mobile assault gun (move & fire indirect)
      shadow(4, 24, 24);
      tracks(3, 21, 25);
      // Sleek casemate hull
      poly([[3, 15], [18, 11], [25, 14], [26, 21], [3, 21]], 7);
      poly([[3, 15], [18, 11], [24, 14], [7, 15]], 9);
      line(4, 15, 17, 11, 5);
      R(7, 16, 17, 5, 6);
      // Low thick assault howitzer protruding from glacis
      R(19, 13, 8, 4, 3); R(19, 13, 7, 1, 5);
      R(27, 14, 2, 2, 2); R(8, 13, 4, 2, 10);
      break;

    case 'CYCLOPS': // Heavy siege rocket launcher
      shadow(4, 25, 24);
      tracks(3, 21, 26);
      hullSlab(3, 16, 26, 5);
      R(4, 12, 7, 5, 7); R(4, 12, 6, 1, 9); R(5, 13, 3, 2, 11); // cab
      // Massive multiple rocket launcher box
      poly([[11, 17], [22, 8], [27, 13], [16, 21]], 8);
      line(11, 17, 22, 8, 10);
      // Rocket tube nozzles
      R(21, 8, 2, 2, 14); R(24, 10, 2, 2, 14); R(26, 12, 2, 2, 14);
      R(20, 10, 2, 2, 2); R(23, 12, 2, 2, 2);
      break;

    case 'BUNKER': // Deployable armored cupola / strongpoint
      shadow(6, 24, 20);
      // Concrete skirt / base
      poly([[6, 23], [10, 17], [22, 17], [26, 23]], 3);
      line(6, 23, 10, 17, 4); line(10, 17, 22, 17, 5);
      // Steel dome
      poly([[9, 17], [13, 12], [19, 12], [23, 17]], 8);
      poly([[13, 12], [19, 12], [18, 14], [14, 14]], 10);
      R(10, 15, 12, 2, 2); // armored vision port
      // Heavy direct gun
      R(18, 14, 9, 3, 3); R(18, 14, 8, 1, 5); R(27, 15, 1, 2, 2);
      // Small top machine gun
      line(15, 11, 21, 9, 4); R(20, 8, 2, 1, 5);
      break;

    case 'RANGER': // Mountain commando skirmisher
      shadow(9, 24, 14);
      soldier(9, 11, 'run');
      // Long scoped marksman rifle
      line(6, 11, 23, 11, 3); line(6, 10, 22, 10, 5);
      R(22, 11, 2, 1, 2);
      R(13, 9, 4, 2, 12); // optical sight
      R(7, 14, 3, 4, 7); // mountain pack
      break;

    case 'HOPLITE': // Heavy shield infantry capturer
      shadow(8, 24, 16);
      soldier(13, 11, 'stand');
      // Heavy curved ballistic shield in front
      R(5, 8, 8, 14, 8); R(5, 8, 7, 1, 10); R(5, 8, 1, 14, 9);
      R(6, 10, 6, 2, 6); R(6, 15, 6, 4, 7);
      R(7, 12, 4, 2, 14); // faction emblem on shield
      R(18, 13, 5, 2, 3); // sidearm carbine
      break;

    case 'MORTAR': // Mountain mortar infantry squad
      shadow(8, 24, 16);
      soldier(7, 11, 'kneel');
      // Heavy bipod mortar
      line(16, 21, 23, 9, 3); line(17, 21, 24, 9, 5);
      R(22, 8, 3, 2, 2); // muzzle
      R(13, 22, 7, 2, 7); R(13, 22, 6, 1, 9); // baseplate
      line(18, 18, 19, 22, 4); // bipod leg
      R(23, 16, 4, 4, 8); // ammo crate
      break;

    case 'CHEETAH': // Wheeled cavalry tank
      shadow(4, 25, 24);
      wheel(4, 21); wheel(11, 21); wheel(18, 21); wheel(24, 21);
      hullSlab(3, 15, 26, 6);
      R(5, 21, 22, 1, 6);
      // Compact sleek turret with medium tank gun
      R(10, 10, 10, 5, 8); R(10, 10, 9, 1, 10);
      gun(19, 11, 9);
      R(12, 12, 3, 2, 11);
      break;

    case 'RHINO': // Heavy casemate tank destroyer
      shadow(4, 25, 24);
      tracks(3, 21, 26);
      // Heavy frontal casemate
      poly([[3, 14], [16, 11], [27, 15], [27, 22], [3, 22]], 7);
      poly([[3, 14], [16, 11], [25, 14], [6, 15]], 9);
      line(4, 14, 15, 11, 5);
      // Massive high-velocity AT cannon
      R(18, 13, 12, 3, 3); R(18, 13, 11, 1, 5);
      R(29, 13, 2, 3, 2); // muzzle brake
      R(7, 12, 5, 2, 10); // cupola
      break;

    case 'MAMMOTH': // Waste-capable siege tank
      shadow(3, 25, 26);
      tracks(2, 21, 28);
      // Thick heavy hull
      poly([[2, 14], [20, 12], [29, 16], [29, 23], [2, 23]], 7);
      poly([[2, 14], [20, 12], [28, 16], [7, 17]], 9);
      line(3, 14, 18, 12, 5);
      for (let x = 5; x < 27; x += 5) {
        R(x, 18, 4, 3, 8); R(x, 18, 4, 1, 10);
      }
      // Heavy beveled turret & short siege gun
      R(10, 8, 12, 6, 8); R(10, 8, 11, 1, 10);
      R(21, 10, 9, 4, 3); R(21, 10, 8, 1, 5); R(29, 11, 2, 2, 2);
      break;

    case 'BUFFALO': // Armored combat personnel carrier
      shadow(4, 25, 24);
      tracks(3, 21, 26);
      // Boxy APC chassis
      poly([[3, 12], [14, 11], [27, 15], [27, 22], [3, 22]], 7);
      poly([[3, 12], [14, 11], [25, 14], [5, 14]], 9);
      line(4, 12, 13, 11, 5);
      R(6, 14, 18, 6, 8);
      // Cupola and weapon
      R(7, 8, 5, 4, 9); R(7, 8, 4, 1, 10);
      gun(12, 9, 6);
      R(20, 13, 4, 2, 12); // vision block
      break;

    case 'CORSAIR': // Heavy anti-tank attack gunship
      shadow(7, 25, 18);
      // Main fuselage
      R(8, 14, 16, 6, 8); R(8, 14, 15, 1, 10);
      R(21, 15, 5, 4, 11); R(21, 15, 4, 1, 12); // canopy
      // Tail boom and fin
      R(3, 14, 6, 3, 7); R(3, 11, 2, 4, 6);
      // Rotor mast and blades
      R(14, 10, 3, 4, 3);
      line(4, 9, 27, 9, 3); line(5, 9, 26, 9, 5);
      // Stub wing with rocket pods
      R(12, 18, 6, 2, 6);
      missile(12, 19, 7);
      // Chin cannon
      gun(24, 19, 5);
      break;

    case 'TALON': // High-speed wheeled recon buggy
      shadow(5, 24, 22);
      wheel(5, 20); wheel(21, 20);
      R(4, 17, 23, 3, 7); R(4, 17, 22, 1, 9);
      // Roll cage cab
      line(9, 17, 13, 12, 3); line(18, 17, 15, 12, 3);
      R(12, 12, 4, 2, 8);
      // Antenna with pennant
      line(7, 17, 7, 6, 3); R(6, 5, 3, 1, 14);
      // Forward light weapon
      gun(18, 16, 8);
      break;

    default:
      throw new Error('Unknown unit ID: ' + id);
  }

  // Selective outline pass: charcoal (1) around all drawn pixels
  const out = grid();
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const v = g[y * 32 + x];
      if (v) {
        out[y * 32 + x] = v;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < 32 && ny < 32 && !g[ny * 32 + nx] && !out[ny * 32 + nx]) {
            out[ny * 32 + nx] = 1;
          }
        }
      }
    }
  }

  // Pale edge highlights for upper/left surfaces
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const v = g[y * 32 + x];
      if (v === 5 || v === 10) {
        if (y > 0 && out[(y - 1) * 32 + x] === 1) out[(y - 1) * 32 + x] = v;
        if (x > 0 && v === 5 && out[y * 32 + (x - 1)] === 1) out[y * 32 + (x - 1)] = 10;
      }
    }
  }

  // Horizontal centering
  let minX = 32, maxX = -1;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (out[y * 32 + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  const shift = Math.floor((32 - (maxX - minX + 1)) / 2) - minX;
  const centered = grid();
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const v = out[y * 32 + x];
      if (v) {
        const nx = x + shift;
        if (nx >= 0 && nx < 32) centered[y * 32 + nx] = v;
      }
    }
  }

  return centered;
}

// Minimal PNG writer using zlib
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function encodePng(w, h, rgba) {
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const rowOff = y * (1 + w * 4);
    raw[rowOff] = 0; // Filter: None
    for (let x = 0; x < w; x++) {
      const srcOff = (y * w + x) * 4;
      const dstOff = rowOff + 1 + x * 4;
      raw[dstOff] = rgba[srcOff];
      raw[dstOff + 1] = rgba[srcOff + 1];
      raw[dstOff + 2] = rgba[srcOff + 2];
      raw[dstOff + 3] = rgba[srcOff + 3];
    }
  }
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const c = crc(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(c, 8 + len);
    return buf;
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function renderRgba(pixels, faction) {
  const pal = PAL[faction];
  const rgba = Buffer.alloc(32 * 32 * 4);
  for (let i = 0; i < 32 * 32; i++) {
    const idx = pixels[i];
    if (idx && pal[idx]) {
      const [r, g, b] = hexToRgb(pal[idx]);
      rgba[i * 4] = r;
      rgba[i * 4 + 1] = g;
      rgba[i * 4 + 2] = b;
      rgba[i * 4 + 3] = 255;
    } else {
      rgba[i * 4 + 3] = 0; // Transparent
    }
  }
  return rgba;
}

// Build 30 standalone icons
for (const id of IDS) {
  for (const fac of ['union', 'xenon']) {
    const left = (fac === 'xenon'); // Right-facing for Union, left-facing for Xenon
    const pixels = draw(id, left);
    const rgba = renderRgba(pixels, fac);
    const png = encodePng(32, 32, rgba);
    const filename = `${id.toLowerCase()}-${fac}.png`;
    fs.writeFileSync(path.join(OUT, filename), png);
  }
}
console.log(`Generated 30 icons in ${OUT}`);

// Build 3x5 contact sheet (32x32 per icon, with border and background)
const SHEET_COLS = 5;
const SHEET_ROWS = 3;
const CELL_W = 36;
const CELL_H = 36;
const SHEET_W = SHEET_COLS * CELL_W + 4;
const SHEET_H = SHEET_ROWS * CELL_H + 4;
const sheetRgba = Buffer.alloc(SHEET_W * SHEET_H * 4);

// Background dark fill #0C1017
const [bgR, bgG, bgB] = hexToRgb('#0C1017');
for (let i = 0; i < SHEET_W * SHEET_H; i++) {
  sheetRgba[i * 4] = bgR;
  sheetRgba[i * 4 + 1] = bgG;
  sheetRgba[i * 4 + 2] = bgB;
  sheetRgba[i * 4 + 3] = 255;
}

IDS.forEach((id, idx) => {
  const col = idx % SHEET_COLS;
  const row = Math.floor(idx / SHEET_COLS);
  const startX = 4 + col * CELL_W + 2;
  const startY = 4 + row * CELL_H + 2;
  const pixels = draw(id, false); // Union facing
  const pal = PAL.union;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const colorIdx = pixels[y * 32 + x];
      if (colorIdx && pal[colorIdx]) {
        const [r, g, b] = hexToRgb(pal[colorIdx]);
        const dstIdx = ((startY + y) * SHEET_W + (startX + x)) * 4;
        sheetRgba[dstIdx] = r;
        sheetRgba[dstIdx + 1] = g;
        sheetRgba[dstIdx + 2] = b;
        sheetRgba[dstIdx + 3] = 255;
      }
    }
  }
});

const sheetPng = encodePng(SHEET_W, SHEET_H, sheetRgba);
fs.writeFileSync(path.join(__dirname, 'sheet.png'), sheetPng);
console.log(`Generated contact sheet: ${path.join(__dirname, 'sheet.png')}`);

module.exports = { draw, encodePng, renderRgba, PAL, IDS };
