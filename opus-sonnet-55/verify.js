"use strict";
/* `node opus-sonnet-55/verify.js` runs every check on the pack and exits
 * non-zero on the first failure:
 *  1. gap, dominance and engine-behaviour checks (analysis.js)
 *  2. icon geometry: 32x32, Legacy colour codes, 2x2 pixels, no see-through
 *     holes, centred, mirrored, distinct silhouettes
 *  3. generated files on disk equal a fresh build
 *  4. banned words and emoji in all prose
 *  5. page.css follows the UI rules (no gray text, no opacity, single-line cells) */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { UNITS } = require("./units.js");
const { ORDER } = require("./art.js");
const { analyze } = require("./analysis.js");
const { buildFiles } = require("./build.js");
const render = require("./render.js");

const report = [];
const ok = (msg) => { report.push(msg); console.log("ok  " + msg); };

/* 1. Rules ---------------------------------------------------------------- */
const result = analyze();
ok(`gap screen: ${UNITS.length} units, each cell empty in the stock roster`);
ok(`dominance screen: ${result.dominance.checked} ordered pairs, none dominated`);
ok(`engine exhibits: ${Object.values(result.exhibits).reduce((n, l) => n + l.length, 0)} facts asserted`);

/* 2. Icons ---------------------------------------------------------------- */
assert.deepEqual([...ORDER].sort(), UNITS.map((u) => u.id).sort(), "art ids match unit ids");

function enclosedHoles(rows) {
  const seen = rows.map((r) => Array(r.length).fill(false));
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || y >= rows.length || x >= rows[0].length || seen[y][x] || rows[y][x] !== ".") return;
    seen[y][x] = true; stack.push([x, y]);
  };
  for (let i = 0; i < 32; i++) { push(i, 0); push(i, 31); push(0, i); push(31, i); }
  while (stack.length) {
    const [x, y] = stack.pop();
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  let holes = 0;
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "." && !seen[y][x]) holes++; }));
  return holes;
}

const masks = {};
for (const id of ORDER) {
  const right = render.frame(id, "right"), left = render.frame(id, "left");
  assert.equal(right.length, 32, `${id}: 32 rows`);
  for (const row of right.concat(left)) assert.match(row, /^[.1-7]{32}$/, `${id}: row uses only chart colours`);
  for (let y = 0; y < 32; y += 2) {
    for (let x = 0; x < 32; x += 2) {
      const block = [right[y][x], right[y][x + 1], right[y + 1][x], right[y + 1][x + 1]];
      assert.ok(block.every((c) => c === block[0]), `${id}: 2x2 block at ${x},${y} is uniform`);
    }
  }
  assert.equal(enclosedHoles(right), 0, `${id}: no see-through holes`);
  assert.equal(enclosedHoles(left), 0, `${id}: no see-through holes (left)`);
  assert.deepEqual(left, right.map((r) => [...r].reverse().join("")), `${id}: left is the mirror of right`);
  const xs = [], ys = [];
  right.forEach((r, y) => [...r].forEach((c, x) => { if (c !== ".") { xs.push(x); ys.push(y); } }));
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  assert.ok(Math.abs(minX - (31 - maxX)) <= 2, `${id}: centred horizontally (margins ${minX} and ${31 - maxX})`);
  assert.ok(minY >= 0 && maxY <= 31, `${id}: inside the frame`);
  assert.ok(right.join("").includes("1") && right.join("").includes("7"), `${id}: has black contour and white highlight`);
  masks[id] = right.map((r) => [...r].map((c) => (c === "." ? 0 : 1)));
}
let closest = { d: Infinity };
for (let i = 0; i < ORDER.length; i++) {
  for (let j = i + 1; j < ORDER.length; j++) {
    let d = 0;
    for (let y = 0; y < 32; y += 2) for (let x = 0; x < 32; x += 2) if (masks[ORDER[i]][y][x] !== masks[ORDER[j]][y][x]) d++;
    if (d < closest.d) closest = { d, a: ORDER[i], b: ORDER[j] };
  }
}
assert.ok(closest.d >= 30, `silhouettes ${closest.a} and ${closest.b} differ in only ${closest.d} art pixels`);
ok(`icons: ${ORDER.length} units, 32x32, 2x2 pixels, no holes, centred, mirrored; closest silhouettes ${closest.a}/${closest.b} differ by ${closest.d} art pixels`);

/* 3. Generated files -------------------------------------------------------- */
const files = buildFiles();
for (const [rel, content] of Object.entries(files)) {
  const file = path.join(__dirname, rel);
  assert.ok(fs.existsSync(file), `${rel} is missing; run node opus-sonnet-55/build.js`);
  const disk = fs.readFileSync(file);
  assert.ok(disk.equals(Buffer.isBuffer(content) ? content : Buffer.from(content)), `${rel} differs from a fresh build; run node opus-sonnet-55/build.js`);
}
ok(`generated files: ${Object.keys(files).length} match a fresh build`);
for (const rel of ["index.html", "page.css", "page.js"]) assert.ok(fs.existsSync(path.join(__dirname, rel)), `${rel} is missing`);

/* 4. Prose ------------------------------------------------------------------ */
const BANNED = [
  /\bhonest/i, /heads-up/i, /\bwrinkle/i, /\bgenuine/i, /\breally\b/i, /\btruly\b/i, /\bactually\b/i, /\bliterally\b/i,
  /\breal\b/i, /say the word/i, /walk (you|me) through/i, /worth flagging/i, /loose end/i, /circle back/i, /sidestep/i,
  /\bcruft/i, /\bsmell/i, /\bbloat/i, /\bhack/i, /\bgross\b/i, /\belegant/i, /\bergonomic/i, /\bopinionated/i,
  /\bidiomatic/i, /\bfootgun/i, /overengineer/i, /best practice/i, /\bstunning/i, /\bbeautiful/i, /\bincredible/i,
  /\bironclad/i, /belt and suspenders/i, /\byagni\b/i,
];
const EMOJI = /\p{Extended_Pictographic}/u;
const prose = [];
for (const u of UNITS) {
  for (const k of ["tagline", "what", "play", "beatenBy", "pairsWith", "watch"]) prose.push([`${u.id}.${k}`, u[k]]);
  prose.push([`${u.id}.gap`, u.gap.cell]);
  for (const line of result.exhibits[u.id]) prose.push([`${u.id} exhibit`, line]);
}
for (const rel of ["README.md", "index.html", "page.js", "page.css"]) prose.push([rel, fs.readFileSync(path.join(__dirname, rel), "utf8")]);
for (const [where, text] of prose) {
  for (const re of BANNED) assert.ok(!re.test(text), `${where}: banned wording ${re}`);
  assert.ok(!EMOJI.test(text), `${where}: emoji`);
}
ok(`prose: ${prose.length} passages free of banned wording and emoji`);

/* 5. Page rules -------------------------------------------------------------- */
const css = fs.readFileSync(path.join(__dirname, "page.css"), "utf8");
assert.ok(!/opacity\s*:/.test(css), "page.css: opacity can make text gray");
assert.ok(!/\bgr[ae]y\b/i.test(css), "page.css: names a gray colour");
for (const m of css.matchAll(/(^|[\s;{])color\s*:\s*(#[0-9a-f]{3,6})\b/gi)) {
  let h = m[2].slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 40;
  assert.ok(!neutral || h.toLowerCase() === "ffffff" || h.toLowerCase() === "000000", `page.css: neutral text colour #${h}`);
}
assert.match(css, /td[^{]*\{[^}]*white-space:\s*nowrap/, "page.css: table cells stay on one line");
assert.ok(!/(?<!\()max-width\s*:\s*\d+px/.test(css), "page.css: fixed pixel max-width");
ok("page.css: no gray or translucent text, single-line cells, fluid width");

console.log(`\nAll ${report.length} groups passed.`);
