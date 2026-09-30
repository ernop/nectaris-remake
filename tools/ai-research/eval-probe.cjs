#!/usr/bin/env node
/* How well does AI_MODEL.evaluate predict the winner of recorded games?
 * Read-only research probe for AI_TRAINING_PLAN.md, not a strength rating.
 *   node tools/ai-research/eval-probe.cjs ARCHIVE_DIR [more archives...]
 * Archives come from tools/ai-research/run.cjs. Every decided game is replayed
 * to the start of each half-turn and scored for Union. The hand-tuned score
 * (only its logistic scale fitted) is compared, on maps held out of each fit,
 * with a logistic model over general board features. Lower log-loss is better.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path");
const root = path.resolve(__dirname, "../..");
const ENGINE = require(path.join(root, "js/engine.js"));
const T = require(path.join(root, "js/ai-tournament.js"));
const MODEL = require(path.join(root, "js/ai-model.js"));
const dirs = process.argv.slice(2);
if (!dirs.length) { console.error("Usage: node tools/ai-research/eval-probe.cjs ARCHIVE_DIR [...]"); process.exit(1); }
const files = [];
for (const dir of dirs) for (const batch of fs.readdirSync(path.join(dir, "games")))
  for (const f of fs.readdirSync(path.join(dir, "games", batch))) if (f.endsWith(".json")) files.push(path.join(dir, "games", batch, f));

function features(g) {
  const s = [0, 1].map(() => ({field: 0, reserve: 0, carried: 0, count: 0, capturers: 0, exp: 0, terrain: 0, factories: 0, baseRun: 8}));
  const all = [];
  g.units.forEach(u => { all.push(u); u.cargo.forEach(c => all.push(c)); });
  Object.values(g.buildings).forEach(b => b.stored.forEach(u => all.push(u)));
  all.forEach(u => {
    if (u.player < 0) return;
    const side = s[u.player], v = MODEL.value(u);
    if (u.inFactory) side.reserve += v; else if (u.carriedBy) side.carried += v; else side.field += v;
    side.count++; side.exp += u.exp * u.strength / 8;
    if (!u.inFactory && !u.carriedBy) side.terrain += g.terrainAt(u.col, u.row).def * u.strength / 8;
    if (u.type.capture && !u.inFactory) {
      side.capturers++;
      Object.values(g.buildings).forEach(b => {
        if (b.kind === "base" && b.owner === 1 - u.player)
          side.baseRun = Math.min(side.baseRun, HEX.distance(u.col, u.row, b.col, b.row) / Math.max(1, u.type.move));
      });
    }
  });
  Object.values(g.buildings).forEach(b => { if (b.kind === "factory" && b.owner >= 0) s[b.owner].factories++; });
  const d = k => s[0][k] - s[1][k];
  return [d("field") / 100, d("reserve") / 100, d("carried") / 100, d("count") / 5, d("capturers"), d("exp") / 5,
    d("terrain") / 50, d("factories"), s[1].baseRun - s[0].baseRun, (MODEL.baseDanger(g, 1) - MODEL.baseDanger(g, 0)) / 1800,
    g.currentPlayer === 0 ? 1 : -1, g.turn / ENGINE.TURN_LIMIT, 1];
}
const rows = [], reasons = {};
for (const file of files) {
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  reasons[r.reason] = (reasons[r.reason] || 0) + 1;
  if (r.error || r.skipped || r.winner === null) continue;
  r.turns.forEach((t, i) => {
    const g = T.replay(r, t.at);
    if (g.over()) return;
    const ctx = MODEL.context(g); MODEL.prepareEvaluation(g, ctx);
    rows.push({map: r.map, phase: i / r.turns.length, label: r.winner === 0 ? 1 : 0, score: MODEL.evaluate(g, 0, ctx), x: features(g)});
  });
}
if (!rows.length) { console.error("No decided games with positions in " + dirs.join(", ")); process.exit(1); }
const sigmoid = z => 1 / (1 + Math.exp(-z));
const dot = (w, x) => w.reduce((s, v, i) => s + v * x[i], 0);
function loss(ps, ys) {
  return ps.reduce((l, p, i) => { p = Math.min(1 - 1e-6, Math.max(1e-6, p)); return l - (ys[i] ? Math.log(p) : Math.log(1 - p)); }, 0) / ps.length;
}
function fit(train) {
  const w = new Array(train[0].x.length).fill(0);
  for (let it = 0; it < 800; it++) {
    const grad = w.map(() => 0);
    train.forEach(r => { const e = sigmoid(dot(w, r.x)) - r.label; r.x.forEach((v, j) => { grad[j] += e * v; }); });
    w.forEach((v, j) => { w[j] -= 0.5 * (grad[j] / train.length + 1e-3 * v); });
  }
  return w;
}
const maps = [...new Set(rows.map(r => r.map))].sort(), folds = Math.min(4, maps.length), learned = new Map(), tuned = new Map();
for (let k = 0; k < folds; k++) {
  const held = new Set(maps.filter((m, i) => i % folds === k)), train = rows.filter(r => !held.has(r.map));
  if (!train.length) continue;
  const w = fit(train);
  let scale = 1, best = Infinity;
  for (let s = 20; s < 4000; s *= 1.1) {
    const l = loss(train.map(r => sigmoid(r.score / s)), train.map(r => r.label));
    if (l < best) { best = l; scale = s; }
  }
  rows.filter(r => held.has(r.map)).forEach(r => { learned.set(r, sigmoid(dot(w, r.x))); tuned.set(r, sigmoid(r.score / scale)); });
}
function show(name, subset) {
  subset = subset.filter(r => learned.has(r));
  if (!subset.length) return;
  const ys = subset.map(r => r.label), base = ys.reduce((a, b) => a + b, 0) / ys.length;
  console.log(name.padEnd(15), "positions", String(subset.length).padStart(6), " hand-tuned", loss(subset.map(r => tuned.get(r)), ys).toFixed(3),
    " learned", loss(subset.map(r => learned.get(r)), ys).toFixed(3), " base rate", loss(subset.map(() => base), ys).toFixed(3),
    " union wins", (100 * base).toFixed(1) + "%");
}
console.log("games", files.length, "end reasons", JSON.stringify(reasons), "maps", maps.length, "(log-loss on held-out maps)");
show("whole game", rows);
[[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1.01]].forEach(([a, b]) => show("phase " + a + "-" + Math.min(1, b), rows.filter(r => r.phase >= a && r.phase < b)));
