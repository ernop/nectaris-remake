"use strict";
/* Prints the sprites as text so a silhouette can be judged without an image
 * viewer: node opus-sonnet-55/preview.js [ID ...] */
const { ART, ORDER } = require("./art.js");
const GLYPH = { ".": " ", k: "#", d: "o", m: "+", g: ":", c: "=", l: "-", w: "W" };
const wanted = process.argv.slice(2).map((s) => s.toUpperCase());
for (const id of ORDER) {
  if (wanted.length && !wanted.includes(id)) continue;
  console.log(id);
  console.log(ART[id].map((r) => "|" + [...r].map((c) => GLYPH[c] + GLYPH[c]).join("") + "|").join("\n"));
}
