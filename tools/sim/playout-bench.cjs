#!/usr/bin/env node
/* Engine speed on random play, and a lockstep check of the legal-command list.
 *   node tools/sim/playout-bench.cjs [--boards=all|0,1] [--games=20] [--seed=1]
 * Plays tools/sim/playout.cjs games; the fingerprint must equal
 * `nectaris-sim playout` with the same options.
 */
"use strict";
const playouts = require("./playout.cjs"), boards = require("./boards.cjs");
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.length ? v.join("=") : true]; }));
Object.keys(args).forEach(k => { if (!["boards", "games", "seed"].includes(k)) throw new Error("Unknown option --" + k); });
const list = !args.boards || args.boards === "all" ? boards.map((_, i) => i) : String(args.boards).split(",").map(Number);
list.forEach(i => { if (!boards[i]) throw new Error("--boards: " + i + " is not a board index"); });
const games = Number(args.games || 20), seed = Number(args.seed || 1) >>> 0;
const started = process.hrtime.bigint(), r = playouts(games, seed, list);
const seconds = Number(process.hrtime.bigint() - started) / 1e9;
console.log(games + " random games, " + r.commands + " commands in " + seconds.toFixed(2) + " s on 1 thread: " + (games / seconds).toFixed(2) +
  " games/s, " + Math.round(r.commands / seconds) + " commands/s; fingerprint " + r.fingerprint);
