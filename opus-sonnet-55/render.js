"use strict";
/* Turns the 16x16 art pixels into the Legacy pack's 32x32 frames and PNGs.
 *
 * Frame format matches art/legacy (js/data-unit-art-legacy.js): 32 strings of
 * 32 characters, "." transparent and "1".."7" the chart colours darkest first,
 * so a finished pack can be registered with js/unit-icon-sets.js as is. */
const { encodePng } = require("./png.js");
const { ART, ORDER } = require("./art.js");

// Letter -> Legacy palette code (art/legacy/README.md: black, dark teal, mid
// blue, gray, cyan, light cyan, white).
const CODE = { k: "1", d: "2", m: "3", g: "4", c: "5", l: "6", w: "7" };

// The Legacy pack's palettes, copied from js/data-unit-art-legacy.js so that a
// reader of this pack sees the exact colours the game would draw.
const PALETTES = {
  union: ["#060606", "#093a57", "#397a97", "#767b82", "#15b8ef", "#83fafb", "#ecfeff"],
  xenon: ["#060606", "#163b16", "#35661f", "#767b82", "#68a838", "#b0d46b", "#ecfeff"],
  attack: ["#060606", "#481319", "#81212e", "#767b82", "#c63745", "#eb7d80", "#ecfeff"],
  neutral: ["#060606", "#273138", "#4c6065", "#767b82", "#7a9599", "#bdcdd0", "#ecfeff"],
};

function frame(id, facing) {
  const art = ART[id];
  if (!art) throw new Error(`No art for ${id}`);
  const rows = [];
  for (const row of art) {
    const cells = [...row].map((c) => (c === "." ? "." : CODE[c]));
    const wide = cells.flatMap((c) => [c, c]).join("");
    rows.push(wide, wide);
  }
  // Left-facing art mirrors the right-facing art, lighting included, exactly
  // as the Legacy chart's left frames do.
  return facing === "left" ? rows.map((r) => [...r].reverse().join("")) : rows;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/* Draw frames into an RGBA canvas. `background` is a hex colour or null. */
function paint(canvas, width, frameRows, palette, x0, y0, scale) {
  frameRows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      const [r, g, b] = hexToRgb(palette[Number(c) - 1]);
      for (let j = 0; j < scale; j++) {
        for (let i = 0; i < scale; i++) {
          const at = ((y0 + y * scale + j) * width + x0 + x * scale + i) * 4;
          canvas[at] = r; canvas[at + 1] = g; canvas[at + 2] = b; canvas[at + 3] = 255;
        }
      }
    });
  });
}

function fill(canvas, width, x0, y0, w, h, hex) {
  const [r, g, b] = hexToRgb(hex);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const at = (y * width + x) * 4;
      canvas[at] = r; canvas[at + 1] = g; canvas[at + 2] = b; canvas[at + 3] = 255;
    }
  }
}

/* One transparent PNG of a single frame at an integer scale. */
function framePng(id, facing, faction, scale) {
  const size = 32 * scale;
  const canvas = new Uint8Array(size * size * 4);
  paint(canvas, size, frame(id, facing), PALETTES[faction], 0, 0, scale);
  return encodePng(size, size, canvas);
}

// Legacy plains colour (js/legacy-terrain.js) so the black contour is visible.
const GROUND = "#71343b", GROUND_DARK = "#551d26";

/* Contact sheet: every unit, Union above Xenon, right-facing, on plains
 * colour. `cell` is the number of pixels per art pixel pair (integer scale). */
function sheetPng(scale) {
  const pad = 8 * scale, cell = 32 * scale, cols = 5;
  const rowsOfUnits = Math.ceil(ORDER.length / cols);
  const tileW = cell + pad, tileH = cell * 2 + pad * 2;
  const width = cols * tileW + pad, height = rowsOfUnits * tileH + pad;
  const canvas = new Uint8Array(width * height * 4);
  fill(canvas, width, 0, 0, width, height, GROUND_DARK);
  ORDER.forEach((id, n) => {
    const x = pad + (n % cols) * tileW, y = pad + Math.floor(n / cols) * tileH;
    fill(canvas, width, x, y, cell, cell * 2 + pad, GROUND);
    paint(canvas, width, frame(id, "right"), PALETTES.union, x, y, scale);
    paint(canvas, width, frame(id, "right"), PALETTES.xenon, x, y + cell + pad, scale);
  });
  return encodePng(width, height, canvas);
}

module.exports = { frame, framePng, sheetPng, PALETTES, GROUND, GROUND_DARK, CODE };
