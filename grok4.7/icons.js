'use strict';
/* Original 32×32 constructions for the grok4.7 proposals.
 * Upper-left light, small infantry, no traced pixels.
 */
const {Surface} = require('../art/units/pixel-art.js');

function sprite(id, facing) {
  if (facing !== 'left' && facing !== 'right') throw new Error(id + ': facing must be left or right');
  const s = new Surface(32, 32);
  const left = facing === 'left';
  const rect = (x, y, w, h, c) => s.rect(left ? 32 - x - w : x, y, w, h, c);
  const poly = (p, c) => s.poly(p.map(([x, y]) => [left ? 31 - x : x, y]), c);
  const line = (x, y, x1, y1, c) => s.line(left ? 31 - x : x, y, left ? 31 - x1 : x1, y1, c);
  const tracks = (x, y, w) => {
    rect(x, y, w, 4, 2);
    line(x, y, x + w - 1, y, 4);
    line(x + 1, y + 3, x + w - 2, y + 3, 3);
    for (let n = x + 2; n < x + w - 2; n += 4) rect(n, y + 1, 2, 2, 3);
  };
  const slab = (x, y, w, h) => {
    poly([[x, y], [x + w - 4, y], [x + w, y + 3], [x + w, y + h], [x + 3, y + h], [x, y + h - 2]], 7);
    poly([[x, y], [x + w - 4, y], [x + w, y + 3], [x + 3, y + 3]], 10);
    line(x, y, x + w - 5, y, 5);
    rect(x + 3, y + 3, w - 4, h - 4, 8);
    line(x + 3, y + h - 1, x + w - 1, y + h - 1, 6);
    rect(x, y + 2, 3, h - 3, left ? 6 : 9);
  };
  const gun = (x, y, len) => {
    rect(x, y, len, 2, 3);
    line(x, y, x + len - 1, y, 5);
    rect(x + len - 2, y + 1, 2, 1, 2);
  };
  const fatGun = (x, y, len) => {
    rect(x, y, len, 3, 3);
    line(x, y, x + len - 1, y, 5);
    rect(x, y + 1, len, 1, 4);
    rect(x + len - 2, y + 2, 2, 1, 2);
  };
  const hMiss = (x, y, len) => {
    rect(x, y, len, 2, 3);
    line(x, y, x + len - 4, y, 5);
    rect(x + len - 3, y, 3, 2, 14);
  };
  const vMiss = (x, y, h) => {
    rect(x, y, 2, h, 3);
    rect(x, y, 2, 3, 14);
    line(x, y + 3, x, y + h - 1, 5);
  };
  const wheel = (x, y) => {
    rect(x, y, 4, 4, 2);
    rect(x + 1, y, 2, 1, 5);
    rect(x + 1, y + 1, 2, 2, 4);
    rect(x + 1, y + 2, 1, 1, 3);
  };
  const person = (x, y, pose) => {
    rect(x + 2, y, 4, 2, 10);
    rect(x + 2, y, 3, 1, 5);
    rect(x + 1, y + 2, 6, 1, 9);
    rect(x + 3, y + 3, 2, 2, 4);
    rect(x + 2, y + 5, 4, 4, 8);
    rect(x + 1, y + 5, 2, 3, 10);
    rect(x + 5, y + 6, 2, 2, 9);
    rect(x + 2, y + 5, 3, 1, 5);
    if (pose === 'kneel') {
      rect(x + 2, y + 9, 3, 2, 7);
      rect(x + 5, y + 9, 4, 2, 6);
      rect(x + 1, y + 11, 3, 1, 3);
      rect(x + 6, y + 11, 3, 1, 2);
    } else if (pose === 'run') {
      line(x + 3, y + 9, x, y + 12, 7);
      line(x + 5, y + 9, x + 8, y + 11, 6);
      rect(x - 1, y + 12, 3, 1, 3);
      rect(x + 7, y + 11, 3, 1, 2);
    } else {
      rect(x + 2, y + 9, 2, 3, 7);
      rect(x + 5, y + 9, 2, 3, 6);
      rect(x + 1, y + 12, 3, 1, 3);
      rect(x + 5, y + 12, 3, 1, 2);
    }
  };

  switch (id) {
    case 'IBEX':
      person(6, 8, 'kneel');
      rect(14, 14, 2, 2, 3);
      rect(15, 12, 2, 2, 4);
      rect(16, 10, 2, 2, 3);
      line(14, 14, 17, 10, 5);
      rect(17, 9, 2, 2, 2);
      line(14, 16, 12, 20, 3);
      line(16, 16, 19, 20, 2);
      rect(11, 20, 2, 2, 3);
      rect(18, 20, 2, 2, 3);
      break;
    case 'HARRIER':
      person(8, 8, 'stand');
      vMiss(15, 5, 10);
      vMiss(18, 6, 9);
      rect(14, 14, 7, 2, 7);
      rect(14, 14, 6, 1, 5);
      break;
    case 'PIPIT':
      person(7, 8, 'run');
      hMiss(14, 13, 11);
      rect(12, 15, 3, 3, 7);
      rect(12, 15, 3, 1, 10);
      break;
    case 'ORYX':
      wheel(6, 17);
      wheel(18, 17);
      rect(8, 16, 12, 2, 8);
      line(8, 16, 19, 16, 5);
      rect(11, 14, 4, 2, 7);
      person(9, 7, 'kneel');
      gun(16, 13, 6);
      hMiss(5, 14, 4);
      break;
    case 'COYOTE':
      wheel(5, 17);
      wheel(11, 17);
      wheel(18, 17);
      wheel(24, 17);
      rect(6, 16, 20, 2, 6);
      slab(7, 11, 16, 7);
      slab(12, 7, 8, 6);
      gun(18, 9, 8);
      rect(14, 8, 3, 2, 12);
      break;
    case 'JACKAL':
      wheel(4, 17);
      wheel(10, 17);
      wheel(18, 17);
      wheel(24, 17);
      rect(6, 16, 18, 2, 8);
      line(6, 16, 22, 16, 5);
      line(8, 10, 8, 16, 4);
      line(20, 9, 20, 16, 3);
      line(8, 10, 20, 9, 5);
      rect(9, 11, 4, 3, 9);
      gun(20, 12, 7);
      hMiss(5, 13, 5);
      rect(14, 14, 3, 2, 2);
      break;
    case 'OX':
      tracks(5, 18, 20);
      slab(6, 13, 18, 7);
      slab(10, 8, 9, 6);
      gun(17, 10, 9);
      rect(13, 6, 2, 3, 3);
      line(13, 6, 14, 6, 5);
      rect(12, 9, 3, 1, 12);
      break;
    case 'AEGIS':
      tracks(4, 18, 24);
      slab(4, 13, 22, 7);
      poly([[20, 12], [26, 12], [28, 16], [22, 16]], 10);
      line(20, 12, 26, 12, 5);
      poly([[22, 16], [28, 16], [28, 19], [24, 19]], 7);
      rect(8, 8, 2, 5, 3);
      rect(7, 7, 4, 2, 4);
      line(7, 7, 10, 7, 5);
      rect(10, 15, 6, 2, 6);
      break;
    case 'BULLDOG':
      tracks(6, 18, 16);
      slab(7, 10, 14, 10);
      fatGun(16, 12, 6);
      rect(10, 12, 4, 3, 6);
      line(10, 12, 13, 12, 9);
      rect(9, 16, 8, 2, 7);
      break;
    case 'MAMMOTH':
      tracks(5, 18, 14);
      slab(5, 12, 14, 8);
      slab(8, 8, 8, 6);
      gun(14, 9, 13);
      rect(8, 6, 3, 4, 3);
      line(8, 6, 10, 6, 5);
      rect(6, 15, 8, 2, 6);
      break;
    case 'HERON':
      tracks(5, 18, 20);
      slab(6, 13, 18, 7);
      gun(16, 11, 9);
      vMiss(7, 8, 7);
      vMiss(10, 9, 6);
      rect(8, 14, 5, 2, 7);
      line(8, 14, 12, 14, 5);
      break;
    case 'REDOUBT':
      for (let i = 0; i < 5; i++) {
        rect(6 + i * 4, 18, 4, 3, 13);
        rect(6 + i * 4, 18, 3, 1, 5);
        rect(7 + i * 4, 19, 2, 1, 8);
      }
      slab(8, 11, 12, 8);
      gun(16, 13, 10);
      rect(4, 16, 5, 2, 3);
      rect(4, 19, 6, 2, 2);
      rect(11, 12, 4, 2, 9);
      break;
    case 'MERLIN':
      tracks(6, 18, 18);
      slab(9, 13, 12, 7);
      rect(5, 7, 4, 8, 9);
      rect(6, 8, 2, 5, 12);
      line(5, 7, 8, 7, 5);
      hMiss(17, 11, 7);
      hMiss(17, 14, 6);
      rect(14, 12, 3, 4, 8);
      break;
    case 'CITADEL':
      rect(7, 20, 4, 2, 2);
      rect(19, 20, 4, 2, 2);
      rect(7, 19, 4, 1, 5);
      rect(19, 19, 3, 1, 4);
      line(9, 19, 13, 15, 4);
      line(21, 19, 17, 15, 3);
      slab(11, 13, 10, 7);
      vMiss(12, 5, 8);
      vMiss(15, 6, 7);
      gun(19, 15, 5);
      break;
    case 'BURRO':
      tracks(5, 18, 20);
      rect(5, 14, 11, 6, 7);
      rect(7, 15, 8, 3, 4);
      line(5, 14, 15, 14, 5);
      rect(5, 14, 2, 6, 9);
      slab(15, 11, 9, 9);
      rect(18, 13, 4, 3, 12);
      rect(18, 13, 3, 1, 5);
      gun(22, 14, 5);
      break;
    default:
      throw new Error('Unknown proposal ' + id);
  }

  const out = new Surface(32, 32);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (s.get(x, y)) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (!s.get(x + dx, y + dy)) out.set(x + dx, y + dy, 1);
    }
  }
  out.blit(s, 0, 0);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (s.get(x, y) === 5) {
    if (!s.get(x, y - 1) && out.get(x, y - 1) === 1) out.set(x, y - 1, 5);
    if (!s.get(x - 1, y) && out.get(x - 1, y) === 1) out.set(x - 1, y, 10);
  }
  let min = 32, max = -1;
  out.p.forEach((p, i) => { if (p) { min = Math.min(min, i % 32); max = Math.max(max, i % 32); } });
  if ((max - min + 1) % 2) {
    const rows = [];
    for (let row = 0; row < 32; row++) if (out.get(min, row)) rows.push(row);
    const y = rows.sort((a, b) => Math.abs(a - 16) - Math.abs(b - 16))[0];
    out.set(min - 1, y, 3);
    min--;
  }
  const shift = (32 - min - max - 1) / 2;
  if (!Number.isInteger(shift)) throw new Error(id + '/' + facing + ': shift ' + shift);
  const centered = new Surface(32, 32);
  centered.blit(out, shift, 0);
  return centered;
}

module.exports = { sprite };
