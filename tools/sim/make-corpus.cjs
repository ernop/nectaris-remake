#!/usr/bin/env node
/* Build a behaviour-lock corpus from tournament archives.
 *   node tools/sim/make-corpus.cjs --out=FILE.json.gz ARCHIVE_DIR [...]
 * Archives come from tools/ai-research/run.cjs with normal openings. Each game
 * keeps its board index (tools/sim/boards.cjs), seed, bots, round cap, search
 * work, its commands with unit ids numbered from 1 in creation order, and the
 * state hash (tools/sim/state-hash.cjs) after construction and after every
 * command. Replaying the commands from the board and seed must reproduce every
 * hash; the same bots playing the same board and seed must reproduce every
 * command. The shortest game of each pairing (fewest commands, then earliest)
 * is marked `decide` for the JavaScript suite; the Rust simulator checks
 * every game.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path"), zlib = require("node:zlib");
const root = path.resolve(__dirname, "../..");
const T = require(path.join(root, "js/ai-tournament.js")), ENGINE = require(path.join(root, "js/engine.js"));
const H = require("./state-hash.cjs"), boards = require("./boards.cjs");
const args = process.argv.slice(2), outArg = args.find(a => a.startsWith("--out="));
const dirs = args.filter(a => !a.startsWith("--"));
if (!outArg || !dirs.length) { console.error("Usage: node tools/sim/make-corpus.cjs --out=FILE.json.gz ARCHIVE_DIR [...]"); process.exit(1); }

function shift(command, from, to) {
  return [command[0], command[1].map(a => a && typeof a === "object" && a.unit !== undefined ? {unit: a.unit - from + to} : a)];
}
const games = [];
for (const dir of dirs) {
  const run = JSON.parse(fs.readFileSync(path.join(dir, "run.json"), "utf8")), files = [];
  if (run.version !== T.version) throw new Error(dir + " was recorded under protocol " + run.version + ", not " + T.version);
  for (const batch of fs.readdirSync(path.join(dir, "games")).sort())
    for (const f of fs.readdirSync(path.join(dir, "games", batch)).sort()) files.push(path.join(dir, "games", batch, f));
  for (const file of files) {
    const r = JSON.parse(fs.readFileSync(file, "utf8"));
    if (r.error) throw new Error(file + " failed: " + r.error);
    if (r.opening !== "original") throw new Error(file + ": only normal openings are locked");
    const board = boards.findIndex(m => m.name === r.map && JSON.stringify(m.grid) === JSON.stringify(r.initial.map.grid));
    if (board < 0) throw new Error(file + ": board " + r.map + " is not a built-in board");
    if (boards[board].customUnits) mergeUnitTypes(boards[board].customUnits);
    const recorded = ENGINE.Game.restore(r.initial), recordedBase = H.firstId(recorded) - 1;
    const g = new ENGINE.Game(boards[board], {seed: r.seed}), base = H.firstId(g) - 1;
    const hashes = [H.stateHash(g, base)];
    if (hashes[0] !== H.stateHash(recorded, recordedBase)) throw new Error(file + ": a fresh board differs from the recorded start");
    const commands = r.commands.map(c => shift(c, recordedBase, 0));
    commands.forEach(c => { T.command(g, shift(c, 0, base)); hashes.push(H.stateHash(g, base)); });
    if (hashes[hashes.length - 1] !== H.stateHash(ENGINE.Game.restore(r.final), recordedBase)) throw new Error(file + ": the replay differs from the recorded end");
    games.push({board, name: r.map, seed: r.seed, players: r.players, maxRounds: run.config.maxRounds, work: r.work,
      winner: r.winner, reason: r.reason, rounds: r.rounds, commands, hashes});
  }
}
const shortest = new Map();
games.forEach((game, i) => {
  const pair = game.players.slice().sort().join("/");
  if (!shortest.has(pair) || games[shortest.get(pair)].commands.length > game.commands.length) shortest.set(pair, i);
});
shortest.forEach(i => { games[i].decide = true; });
const corpus = {version: 1, tournament: T.version, games};
fs.writeFileSync(outArg.slice(6), zlib.gzipSync(JSON.stringify(corpus)));
const commands = games.reduce((n, g) => n + g.commands.length, 0);
console.log(games.length + " games, " + commands + " commands, " + games.filter(g => g.decide).length + " marked for decisions -> " + outArg.slice(6));
