#!/usr/bin/env node
/* Search speed benchmark with a decision fingerprint.
 *   node tools/ai-research/speed-bench.cjs --save=/tmp/bench-before.json
 *   node tools/ai-research/speed-bench.cjs --check=/tmp/bench-before.json
 * Each case plays Classic self-play from a fixed seed to a mid-game round, then
 * lets one bot play the whole side's turn. The fingerprint hashes the resulting
 * board and random-number state, so any changed decision or battle shows up.
 * --bots=tactical,beam limits the bots. --verify recomputes every cached
 * enemy stopping-cell list and stops on any difference. Optimizations must
 * keep every fingerprint; only the time may change.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const {performance} = require("node:perf_hooks");
const root = path.resolve(__dirname, "../..");
const ENGINE = require(path.join(root, "js/engine.js"));
const AI = require(path.join(root, "js/ai.js"));
const maps = [require(path.join(root, "js/data-maps.js")), require(path.join(root, "js/data-advanced-maps.js")),
  require(path.join(root, "js/data-expansion-maps.js")), require(path.join(root, "js/data-basenectaris-maps.js")).BASE_NECTARIS_LEVELS,
  require(path.join(root, "js/data-ai-maps.js"))].flat();
require(path.join(root, "js/data-environment-campaigns.js")).forEach(c => maps.push(...c.levels));
const POSITIONS = [
  {board: 0, seed: 3, round: 4}, {board: 44, seed: 3, round: 4}, {board: 15, seed: 3, round: 6},
  {board: 31, seed: 3, round: 6}, {board: 60, seed: 3, round: 8}, {board: 67, seed: 3, round: 10}];
const BOTS = {tactical: [0, 1, 2, 3, 4, 5], beam: [0, 1, 2, 3, 4, 5], "monte-carlo": [0, 1, 2], apex: [0, 1]};
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.length ? v.join("=") : true]; }));
const chosen = args.bots ? String(args.bots).split(",") : Object.keys(BOTS);
if (args.verify) require(path.join(root, "js/ai-model.js")).verifyCachedStops(true);
chosen.forEach(b => { if (!BOTS[b]) throw new Error("Unknown bot " + b + "; choose from " + Object.keys(BOTS).join(", ")); });

function start(p) {
  const g = new ENGINE.Game(maps[p.board], {seed: p.seed});
  while (!g.over() && g.turn < p.round) { AI.playTurn(g, g.currentPlayer); if (!g.over()) g.endTurn(); }
  if (g.over()) throw new Error(maps[p.board].name + " ended before round " + p.round);
  return g;
}
function fingerprint(g) {
  const s = g.snapshot();
  return crypto.createHash("sha256").update(JSON.stringify([s.units, s.field, s.buildings, s.winner, s.dice, s.currentPlayer])).digest("hex").slice(0, 16);
}
const results = [];
for (const bot of chosen) for (const i of BOTS[bot]) {
  const p = POSITIONS[i], g = start(p), side = g.currentPlayer, t = performance.now();
  const events = AI.playTurn(g, side, {id: bot});
  const ms = performance.now() - t;
  results.push({bot, board: maps[p.board].name, round: p.round, side, events: events.length, ms: Math.round(ms), fingerprint: fingerprint(g)});
}
const before = args.check ? JSON.parse(fs.readFileSync(String(args.check), "utf8")) : null;
let changed = 0, totalNow = 0, totalBefore = 0;
for (const r of results) {
  const old = before && before.find(b => b.bot === r.bot && b.board === r.board);
  let note = "";
  if (old) {
    totalNow += r.ms; totalBefore += old.ms;
    note = (old.fingerprint === r.fingerprint ? "same decisions" : "CHANGED DECISIONS") + "  " + (old.ms / Math.max(1, r.ms)).toFixed(2) + "x";
    if (old.fingerprint !== r.fingerprint) changed++;
  }
  console.log(r.bot.padEnd(12), r.board.padEnd(16), "round", String(r.round).padStart(2), "events", String(r.events).padStart(3), String(r.ms).padStart(8), "ms ", r.fingerprint, note);
}
if (before) console.log("total", totalBefore, "ms before,", totalNow, "ms now:", (totalBefore / Math.max(1, totalNow)).toFixed(2) + "x;", changed ? changed + " CHANGED" : "all decisions identical");
if (args.save) fs.writeFileSync(String(args.save), JSON.stringify(results, null, 1) + "\n");
if (changed) process.exitCode = 1;
