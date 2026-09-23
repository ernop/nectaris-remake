'use strict';
// museSpark1.3 icon builder — original 32x32 indexed pixel constructions.
// Upper-left light, selective charcoal outline, faction ramp 6-10,
// glass 11/12, ordnance 13/14, contact shadow 15. Node stdlib only.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, 'icons');
const IDS = ['AEGIS','GADFLY','ARGUS','BREACHER','LONGBOW','REDOUBT','JAVELIN',
  'PAVISE','TRENCH','DUSTER','WHIPPET','CONDOR','TICK','HAULER','SLOGGER'];

const PAL = {
  union:  [null,'#14151F','#303440','#626B78','#A9B6C4','#ECF4F0','#15335A','#24578B','#397EC0','#73B5E8','#C0E4F6','#183D52','#91D0D8','#9C6A25','#F2CB58','#241C26'],
  xenon:  [null,'#14151F','#303440','#626B78','#A9B6C4','#ECF4F0','#183C28','#28653B','#419450','#80C17A','#CCE8AE','#183D52','#91D0D8','#9C6A25','#F2CB58','#241C26'],
};

function grid() { return new Uint8Array(32 * 32); }
function draw(id, left) {
  const g = grid();
  const X = (x, w) => left ? 32 - x - (w || 1) : x;
  const set = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < 32 && y < 32 && !g[y * 32 + x]) g[y * 32 + x] = c; };
  // px mirrors geometry for the left facing; top-light accents keep working
  // because they are horizontal edges, unaffected by horizontal mirroring.
  const px = (x, y, c) => set(left ? 31 - x : x, y, c);
  const R = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c); };
  const line = (x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  };
  const poly = (pts, c) => {
    const ys = pts.map(p => p[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(31, Math.ceil(Math.max(...ys))); y++) {
      const hits = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= y + .5 && b[1] > y + .5) || (b[1] <= y + .5 && a[1] > y + .5)) hits.push(a[0] + (y + .5 - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      hits.sort((a, b) => a - b);
      for (let i = 0; i + 1 < hits.length; i += 2) for (let x = Math.ceil(hits[i] - .5); x < hits[i + 1] - .5; x++) px(x, y, c);
    }
  };
  const shadow = (x, y, w) => R(x, y, w, 1, 15);
  const tracks = (x, y, w) => { R(x, y, w, 4, 2); R(x + 1, y, w - 2, 1, 4); for (let n = x + 2; n < x + w - 1; n += 4) { R(n, y + 2, 2, 1, 4); } };
  const wheel = (x, y) => { R(x, y, 4, 4, 2); R(x + 1, y, 2, 1, 4); R(x + 1, y + 3, 2, 1, 3); };
  const gun = (x, y, len) => { R(x, y, len, 2, 3); R(x, y, 1, 1, 5); };
  const aagun = (x0, y0, x1, y1) => { line(x0, y0, x1, y1, 3); line(x0, y0 - 1, x1, y1 - 1, 5); };
  const missile = (x, y, len) => { R(x, y, len, 2, 13); R(x + len - 2, y, 2, 2, 14); R(x, y, 1, 1, 5); };
  const dish = (x, y) => { poly([[x, y], [x + 6, y - 1], [x + 8, y + 2], [x + 5, y + 5], [x, y + 4]], 8); line(x, y, x + 6, y - 1, 10); R(x + 2, y + 1, 2, 2, 6); };
  const soldier = (x, y, pose) => {
    R(x + 1, y, 5, 2, 10); R(x + 1, y, 4, 1, 5); R(x, y + 2, 7, 1, 9); R(x + 2, y + 3, 3, 2, 4);
    R(x + 1, y + 5, 5, 5, 8); R(x + 2, y + 5, 3, 1, 5);
    if (pose === 'run') { line(x + 2, y + 10, x - 1, y + 13, 7); line(x + 5, y + 10, x + 8, y + 12, 6); R(x - 2, y + 13, 4, 1, 3); R(x + 7, y + 12, 4, 1, 3); }
    else if (pose === 'kneel') { R(x + 1, y + 10, 3, 2, 7); R(x + 4, y + 10, 5, 2, 6); R(x, y + 12, 4, 1, 3); R(x + 7, y + 12, 3, 1, 3); }
    else { R(x + 1, y + 10, 2, 3, 7); R(x + 5, y + 10, 2, 3, 6); R(x, y + 13, 4, 1, 3); R(x + 5, y + 13, 4, 1, 3); }
  };
  const hullSlab = (x, y, w, h) => { poly([[x, y], [x + w - 4, y], [x + w, y + 3], [x + w, y + h], [x, y + h]], 7); poly([[x, y], [x + w - 4, y], [x + w, y + 3], [x + 3, y + 3]], 9); R(x, y, w - 5, 1, 5); };

  switch (id) {
    case 'AEGIS': // armored AA anchor: slab hull, twin raised barrels, small radar
      shadow(5, 24, 21); tracks(4, 21, 24);
      hullSlab(4, 14, 24, 8); R(8, 17, 14, 3, 6);
      R(9, 10, 10, 5, 7); R(9, 10, 9, 1, 10);
      aagun(12, 10, 7, 2); aagun(16, 10, 15, 1); aagun(18, 10, 22, 3);
      R(20, 12, 3, 3, 8); line(20, 12, 22, 12, 5); R(21, 13, 1, 1, 12);
      R(5, 18, 2, 2, 10); break;
    case 'GADFLY': // fast wheeled AA truck: open bed, gun shield, single barrel
      shadow(6, 24, 20);
      wheel(5, 20); wheel(12, 20); wheel(20, 20);
      R(4, 17, 24, 3, 7); R(4, 17, 23, 1, 9);
      R(16, 12, 6, 6, 8); R(16, 12, 5, 1, 10);
      aagun(19, 12, 24, 3);
      R(6, 13, 6, 5, 7); R(6, 13, 5, 1, 10); R(7, 14, 3, 2, 11); R(7, 14, 2, 1, 12);
      R(24, 18, 2, 2, 14); break;
    case 'ARGUS': // static AA mast: braced legs, tall vane, dish, missile pair
      shadow(8, 24, 16);
      line(13, 22, 7, 24, 3); line(13, 21, 7, 23, 3); line(18, 22, 24, 24, 3); line(18, 21, 24, 23, 3);
      line(12, 22, 9, 17, 3); line(11, 22, 8, 17, 3); line(19, 22, 22, 17, 3); line(20, 22, 23, 17, 3);
      R(9, 18, 14, 4, 7); R(9, 18, 13, 1, 10); R(10, 20, 4, 1, 6);
      R(13, 6, 4, 12, 8); R(13, 6, 1, 12, 10); R(14, 8, 2, 8, 6);
      poly([[17, 5], [26, 4], [26, 13], [17, 14]], 9); line(17, 5, 26, 4, 5); R(18, 7, 5, 3, 8);
      dish(3, 11);
      missile(19, 19, 8); missile(18, 21, 7); break;
    case 'BREACHER': // assault gun: turretless casemate, short thick gun
      shadow(5, 24, 22); tracks(4, 21, 24);
      poly([[4, 13], [20, 11], [27, 15], [27, 22], [4, 22]], 7);
      poly([[4, 13], [20, 11], [25, 14], [8, 15]], 9); line(5, 13, 18, 11, 5);
      R(8, 15, 18, 6, 6); R(9, 16, 4, 2, 8);
      R(20, 13, 9, 4, 3); R(20, 13, 8, 1, 5); R(28, 14, 2, 2, 2);
      R(10, 11, 6, 2, 10); break;
    case 'LONGBOW': // mobile AT gun: light carriage, very long thin barrel
      shadow(4, 24, 23); tracks(5, 21, 16);
      R(6, 17, 16, 5, 7); R(6, 17, 15, 1, 9);
      R(10, 12, 7, 6, 8); R(10, 12, 6, 1, 10); R(11, 14, 3, 2, 6);
      line(17, 13, 29, 13, 3); line(17, 12, 29, 12, 5); R(28, 12, 2, 2, 2);
      wheel(23, 20);
      R(7, 19, 2, 2, 12); break;
    case 'REDOUBT': // armored pillbox: gray concrete mass, steel gun, faction roof plate
      shadow(7, 24, 18);
      poly([[8, 15], [13, 12], [19, 12], [24, 15], [24, 20], [19, 23], [13, 23], [8, 20]], 3);
      line(9, 14, 13, 12, 4); line(13, 12, 18, 12, 4);
      poly([[10, 16], [14, 14], [19, 14], [22, 16], [22, 19], [19, 21], [14, 21], [10, 19]], 7);
      R(10, 16, 12, 1, 10);
      R(12, 13, 6, 2, 8); R(12, 13, 5, 1, 10);
      R(19, 16, 10, 2, 2); R(19, 16, 10, 1, 4); R(28, 16, 1, 2, 2);
      R(11, 18, 3, 2, 2); R(22, 20, 2, 1, 13); break;
    case 'JAVELIN': // foot tank-hunters: runner + long shoulder tube, yellow tip
      shadow(9, 24, 15);
      soldier(9, 11, 'run');
      R(6, 9, 20, 3, 3); line(6, 9, 25, 9, 5);
      R(24, 8, 4, 4, 13); R(25, 8, 3, 3, 14); R(24, 8, 2, 1, 5);
      R(12, 15, 2, 3, 7); R(7, 16, 3, 4, 7); break;
    case 'PAVISE': // shield infantry: holder + tall rectangular shield
      shadow(9, 24, 14);
      soldier(13, 11, 'stand');
      R(5, 9, 8, 12, 7); R(5, 9, 7, 1, 10); R(5, 9, 1, 12, 9);
      R(6, 11, 6, 1, 8); R(6, 14, 6, 3, 6); R(7, 20, 4, 1, 2);
      R(6, 10, 2, 2, 12); break;
    case 'TRENCH': // mortar capturer: kneeler + tube + baseplate
      shadow(9, 24, 14);
      soldier(8, 11, 'kneel');
      line(17, 20, 22, 10, 3); line(18, 20, 23, 10, 5); R(21, 9, 3, 2, 2);
      R(14, 21, 8, 2, 7); R(14, 21, 7, 1, 10);
      R(23, 14, 3, 4, 8); R(23, 14, 2, 1, 12); break;
    case 'DUSTER': // wheeled gun car: armored body, small turret, gun
      shadow(5, 24, 22);
      wheel(4, 20); wheel(12, 20); wheel(20, 20);
      hullSlab(4, 14, 24, 6); R(6, 20, 20, 1, 6);
      R(10, 9, 8, 6, 7); R(10, 9, 7, 1, 10);
      gun(18, 11, 11);
      R(11, 11, 3, 2, 11); R(11, 11, 2, 1, 12); break;
    case 'WHIPPET': // recon buggy: light frame, tall antenna, small missile
      shadow(6, 24, 19);
      wheel(5, 20); wheel(20, 20);
      R(4, 17, 22, 3, 7); R(4, 17, 21, 1, 9);
      R(8, 13, 6, 5, 8); R(8, 13, 5, 1, 10); R(9, 14, 3, 2, 11); R(9, 14, 2, 1, 12);
      line(20, 17, 20, 6, 3); R(19, 5, 3, 1, 14);
      missile(14, 15, 7); break;
    case 'CONDOR': // armed lift: cargo box, cockpit glass, tandem rotors
      shadow(8, 24, 16);
      R(9, 15, 14, 6, 7); R(9, 15, 13, 1, 9);
      R(10, 17, 5, 3, 8); line(11, 21, 11, 23, 3); line(20, 21, 20, 23, 3); R(10, 23, 11, 1, 2);
      R(21, 16, 4, 3, 11); R(21, 16, 3, 1, 12);
      R(6, 17, 3, 2, 2);
      line(4, 10, 16, 13, 3); line(15, 13, 28, 9, 3); line(5, 10, 13, 12, 5);
      R(15, 12, 3, 2, 2);
      gun(8, 19, 5); break;
    case 'TICK': // walking mine: lit dome, six thick legs, spikes
      shadow(8, 23, 16);
      line(11, 20, 6, 23, 3); line(11, 19, 6, 22, 3); line(20, 20, 25, 23, 3); line(20, 19, 25, 22, 3);
      line(11, 20, 6, 17, 3); line(11, 19, 6, 16, 3); line(20, 20, 25, 17, 3); line(20, 19, 25, 16, 3);
      line(14, 21, 13, 24, 3); line(15, 21, 14, 24, 3); line(17, 21, 18, 24, 3); line(18, 21, 19, 24, 3);
      poly([[9, 15], [15, 11], [22, 14], [23, 20], [8, 20]], 7);
      poly([[9, 15], [15, 11], [21, 14], [14, 16]], 9); line(10, 14, 15, 11, 5);
      R(13, 17, 5, 2, 8); R(14, 17, 3, 1, 14);
      R(8, 12, 2, 3, 3); R(22, 12, 2, 3, 3); R(8, 12, 2, 1, 5); R(22, 12, 2, 1, 5); break;
    case 'HAULER': // gun truck: cab + cargo bed + six wheels, bed gun
      shadow(5, 25, 22);
      wheel(5, 21); wheel(12, 21); wheel(21, 21);
      R(4, 18, 24, 3, 6);
      R(4, 12, 12, 7, 7); R(4, 12, 11, 1, 9);
      R(17, 13, 10, 6, 8); R(17, 13, 9, 1, 10);
      R(19, 15, 6, 3, 6);
      R(21, 16, 5, 2, 11); R(21, 16, 4, 1, 12);
      gun(24, 14, 5);
      R(5, 19, 2, 2, 10); break;
    case 'SLOGGER': // siege tank: extra-wide hull, skirts, short thick gun
      shadow(4, 25, 24); tracks(3, 22, 26);
      poly([[3, 15], [19, 13], [28, 17], [28, 23], [3, 23]], 7);
      poly([[3, 15], [19, 13], [27, 17], [8, 18]], 9); line(4, 15, 17, 13, 5);
      for (let x = 6; x < 26; x += 5) { R(x, 19, 4, 3, 8); R(x, 19, 4, 1, 9); }
      R(9, 9, 12, 6, 7); R(9, 9, 11, 1, 10); R(11, 11, 4, 2, 6);
      R(21, 11, 9, 3, 3); R(21, 11, 8, 1, 5); R(29, 12, 1, 1, 2);
      break;
    default: throw new Error('unknown ' + id);
  }
  // outline + centering
  const out = grid();
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (g[y * 32 + x]) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < 32 && ny < 32 && !g[ny * 32 + nx]) out[ny * 32 + nx] = 1;
    }
  }
  for (let i = 0; i < 1024; i++) if (g[i]) out[i] = g[i];
  let min = 32, max = -1;
  out.forEach((p, i) => { if (p) { min = Math.min(min, i % 32); max = Math.max(max, i % 32); } });
  const shift = Math.round((31 - min - max) / 2);
  const centered = grid();
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const nx = x + shift;
    if (nx >= 0 && nx < 32) centered[y * 32 + nx] = out[y * 32 + x];
  }
  return { idx: centered, odd: ((max - min + 1) % 2) === 1 };
}

function hex(h) { return parseInt(h.slice(1), 16); }
function colorize(idx, faction) {
  const pal = PAL[faction].map(v => v ? hex(v) : 0);
  const out = Buffer.alloc(32 * 32 * 4);
  for (let i = 0; i < 1024; i++) {
    const c = pal[idx[i]] || 0;
    out[i * 4] = (c >> 16) & 255; out[i * 4 + 1] = (c >> 8) & 255; out[i * 4 + 2] = c & 255;
    out[i * 4 + 3] = idx[i] ? 255 : 0;
  }
  return out;
}

// minimal PNG writer (8-bit RGBA, filter 0)
const CRC_T = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const t = Buffer.from(type), len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
}
function png(rgba, w, h, scale) {
  w = w || 32; h = h || 32; scale = scale || 1;
  const raw = Buffer.alloc((w * scale * 4 + 1) * h * scale);
  let o = 0;
  for (let y = 0; y < h; y++) for (let sy = 0; sy < scale; sy++) {
    raw[o++] = 0;
    for (let x = 0; x < w; x++) for (let sx = 0; sx < scale; sx++) {
      const s = (y * w + x) * 4;
      raw[o++] = rgba[s]; raw[o++] = rgba[s + 1]; raw[o++] = rgba[s + 2]; raw[o++] = rgba[s + 3];
    }
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w * scale, 0); head.writeUInt32BE(h * scale, 4);
  head[8] = 8; head[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const odd = [];
  const cells = [];
  for (const id of IDS) {
    const r = draw(id, false), l = draw(id, true);
    if (r.odd) odd.push(id);
    const file = id.toLowerCase();
    fs.writeFileSync(path.join(OUT, file + '-union.png'), png(colorize(r.idx, 'union')));
    fs.writeFileSync(path.join(OUT, file + '-xenon.png'), png(colorize(l.idx, 'xenon')));
    cells.push({ id, rgba: colorize(r.idx, 'union') });
  }
  // contact sheet: 5 x 3, 2x scale, dark cells
  const cols = 5, cw = 72, ch = 80, S = 2;
  const W = cols * cw, H = 3 * ch;
  const sheet = Buffer.alloc(W * H * 4);
  const bg = [16, 21, 30, 255];
  for (let i = 0; i < W * H; i++) { sheet[i * 4] = bg[0]; sheet[i * 4 + 1] = bg[1]; sheet[i * 4 + 2] = bg[2]; sheet[i * 4 + 3] = 255; }
  cells.forEach((c, n) => {
    const ox = (n % cols) * cw + 4, oy = Math.floor(n / cols) * ch + 4;
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const s = (y * 32 + x) * 4;
      if (!c.rgba[s + 3]) continue;
      for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
        const dx = ox + x * S + sx, dy = oy + y * S + sy, d = (dy * W + dx) * 4;
        sheet[d] = c.rgba[s]; sheet[d + 1] = c.rgba[s + 1]; sheet[d + 2] = c.rgba[s + 2]; sheet[d + 3] = 255;
      }
    }
  });
  fs.writeFileSync(path.join(__dirname, 'sheet.png'), png(sheet, W, H, 1));
  if (odd.length) console.log('odd-width silhouettes (rounded 1px): ' + odd.join(', '));
  console.log('wrote ' + IDS.length * 2 + ' icons + sheet.png');
}
if (require.main === module) main();
module.exports = { draw, IDS };
