#!/usr/bin/env node
/* Check a tournament the Rust simulator played and write its standard archive.
 *   node tools/sim/import-rust.cjs DIR
 * DIR holds `nectaris-sim tournament --out=DIR` output: rust-run.json and
 * rust-games/BATCH/INDEX.json. Every game is replayed with the JavaScript
 * engine: each fixture's seed and seats must be the ones AI_TOURNAMENT gives,
 * every command must be legal, and the final position, winner, reason and
 * rounds must match what Rust recorded. The result is the archive
 * tools/ai-research/run.cjs writes (run.json and games/BATCH/INDEX.json, with
 * checkpoints and turn index), so the replay viewer opens each game. Bot
 * decisions are not re-derived here; the behaviour lock (test/sim-lock-tests.js
 * and `nectaris-sim decide`) keeps them equal.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const T = require(path.join(root, "js/ai-tournament.js")), ENGINE = require(path.join(root, "js/engine.js"));
const H = require("./state-hash.cjs"), boards = require("./boards.cjs");
const dir = process.argv[2];
if (!dir || process.argv.length > 3) { console.error("Usage: node tools/sim/import-rust.cjs DIR"); process.exit(1); }
const rust = JSON.parse(fs.readFileSync(path.join(dir, "rust-run.json"), "utf8"));
if (rust.protocol !== T.version) throw new Error("Rust played protocol " + rust.protocol + "; JavaScript is at " + T.version);
if (fs.existsSync(path.join(dir, "run.json"))) throw new Error(dir + " already holds an imported archive (run.json)");

const files = ["hex.js", "data-terrain.js", "data-units.js", "combat.js", "engine.js", "balance.js", "ai.js", "ai-model.js", "ai-search.js", "ai-opening.js", "ai-tournament.js"];
const hash = crypto.createHash("sha256");
files.forEach(f => hash.update(fs.readFileSync(path.join(root, "js", f))));
const config = T.normalize({opponents: rust.opponents, maps: rust.boards.map(i => boards[i]), cycles: rust.cycles, maxRounds: rust.maxRounds,
  work: rust.work, opening: "original", seed: rust.seed, selfPlay: rust.selfPlay, workers: 1});
if (config.total !== rust.total) throw new Error("JavaScript counts " + config.total + " games in this tournament; Rust played " + rust.total);
const run = {id: crypto.randomUUID(), created: new Date().toISOString(), version: T.version, sourceHash: hash.digest("hex"), node: process.version,
  config, types: {}, completed: 0, errors: 0, status: "running", ratings: T.standings(config.opponents), elapsed: 0,
  playedBy: {simulator: "sim/ (Rust)", threads: rust.threads, elapsedSeconds: rust.elapsedSeconds}};

function batch(index) { return String(Math.floor(index / 1000)).padStart(4, "0"); }
function write(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file + ".tmp", JSON.stringify(value) + "\n");
  fs.renameSync(file + ".tmp", file);
}
function shift(command, by) {
  return [command[0], command[1].map(a => a && typeof a === "object" && a.unit !== undefined ? {unit: a.unit + by} : a)];
}
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/* AI_TOURNAMENT.play's record of a game, rebuilt from its commands. */
function rebuild(spec, rec) {
  const game = new ENGINE.Game(spec.map, {seed: spec.seed}), base = H.firstId(game) - 1;
  const initial = game.snapshot(), commands = [], checkpoints = [];
  const turns = [{at: 0, turn: game.turn, side: game.currentPlayer}];
  rec.commands.forEach((c, i) => {
    const command = shift(c, base);
    try { T.command(game, command); } catch (e) { throw new Error("game " + spec.index + " command " + i + " " + JSON.stringify(c) + ": " + e.message); }
    commands.push(command);
    const at = commands.length;
    if (at % 128 === 0) {
      const state = game.snapshot(), logLength = state.log.length;
      delete state.map; delete state.types; delete state.log; delete state.balance;
      checkpoints.push({at, state, logLength});
    }
    if (command[0] === "endTurn") turns.push({at, turn: game.turn, side: game.currentPlayer});
  });
  const winner = game.winner, reason = game.over() ? game.winReason : "round-cap", rounds = game.turn;
  if (H.stateHash(game, base) !== rec.hash) throw new Error("game " + spec.index + " ends in another position than Rust's");
  if (winner !== rec.winner || reason !== rec.reason || rounds !== rec.rounds) {
    throw new Error("game " + spec.index + " ends " + [winner, reason, rounds].join(" ") + "; Rust recorded " + [rec.winner, rec.reason, rec.rounds].join(" "));
  }
  return {version: T.version, index: spec.index, players: spec.players, map: spec.map.name, mapIndex: spec.mapIndex, seed: spec.seed,
    cycle: spec.cycle, leg: spec.leg, tieSecond: spec.tieSecond, work: spec.work || "standard", opening: "original", requestedOpening: "original",
    negotiation: null, balance: game.balance || null, firstPlayer: game.firstPlayer, skipped: false, winner, reason, rounds,
    halfTurns: rec.halfTurns, ms: rec.ms, thinkingMs: rec.thinkingMs, initial, commands, checkpoints, turns, final: game.snapshot()};
}

const started = Date.now();
for (let i = 0; i < config.total; i++) {
  const rec = JSON.parse(fs.readFileSync(path.join(dir, "rust-games", batch(i), String(i).padStart(7, "0") + ".json"), "utf8"));
  const spec = T.fixture(config, i);
  if (rec.index !== i || rec.seed !== spec.seed || !same(rec.players, spec.players) || rec.mapIndex !== spec.mapIndex || boards[rec.board].name !== spec.map.name) {
    throw new Error("game " + i + " is not the fixture AI_TOURNAMENT schedules (seed " + spec.seed + ", " + spec.players.join(" v ") + " on " + spec.map.name + ")");
  }
  const result = rebuild(spec, rec);
  write(path.join(dir, "games", batch(i), String(i).padStart(7, "0") + ".json"), result);
  T.rate(run.ratings, result, config.k);
  run.completed++;
  run.elapsed += result.ms;
}
run.status = "complete";
write(path.join(dir, "run.json"), run);
console.log(JSON.stringify({imported: run.completed, checkedIn: ((Date.now() - started) / 1000).toFixed(1) + " s", ratings: run.ratings, archive: dir}, null, 2));
