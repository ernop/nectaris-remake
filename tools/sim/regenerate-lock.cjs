#!/usr/bin/env node
/* Regenerate test/fixtures/sim-corpus.json.gz after a deliberate rule or AI
 * change. The Rust simulator (sim/) must then be updated to match it in the
 * same change.
 *   node tools/sim/regenerate-lock.cjs
 * Plays three fixed tournaments (tools/ai-research/run.cjs) into a temporary
 * directory and converts them with tools/sim/make-corpus.cjs:
 * Classic v Tactical full games on 22 boards from every family, Sequence v
 * Simulation for 4 rounds on 3 small boards, Apex v Tactical for 3 rounds on 2.
 */
"use strict";
const {execFileSync} = require("node:child_process"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const root = path.resolve(__dirname, "../..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "nectaris-lock-"));
const runs = [
  ["a", "classic,tactical", "0,2,7,12,17,27,32,34,39,40,44,49,53,60,63,71,79,88,103,105,109,113", 0, 10],
  ["b", "beam,monte-carlo", "0,44,32", 4, 4],
  ["c", "apex,tactical", "0,44", 3, 2]];
for (const [name, opponents, boards, rounds, workers] of runs) {
  execFileSync(process.execPath, [path.join(root, "tools/ai-research/run.cjs"), "--opponents=" + opponents, "--boards=" + boards,
    "--cycles=1", "--rounds=" + rounds, "--workers=" + workers, "--seed=2026", "--out=" + path.join(out, name)], {stdio: ["ignore", "ignore", "inherit"]});
}
execFileSync(process.execPath, [path.join(__dirname, "make-corpus.cjs"), "--out=" + path.join(root, "test/fixtures/sim-corpus.json.gz"),
  ...runs.map(r => path.join(out, r[0]))], {stdio: "inherit"});
fs.rmSync(out, {recursive: true});
