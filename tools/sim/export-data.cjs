#!/usr/bin/env node
/* Export the game data the Rust simulator reads to sim/data/game-data.json.
 *   node tools/sim/export-data.cjs [--check]
 * The JavaScript data files stay the single source: terrain by letter, unit
 * types (each also as the exact JSON.stringify text the search seed hashes),
 * the built-in boards in tools/sim/boards.cjs order, the combat tables and
 * the match-length rules.
 * `math` fingerprints this engine's Math.log and Math.tanh, which search
 * uses, over generated inputs; sim/src/fdlibm.rs must reproduce every bit.
 * --check exits with an error when the committed export is out of date.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path");
const root = path.resolve(__dirname, "../..");
const TERRAIN = require(path.join(root, "js/data-terrain.js"));
const UNITS = require(path.join(root, "js/data-units.js"));
const COMBAT = require(path.join(root, "js/combat.js"));
const ENGINE = require(path.join(root, "js/engine.js"));
const boards = require("./boards.cjs");
const out = path.join(root, "sim/data/game-data.json");

const terrain = Object.values(TERRAIN.TERRAIN).map(t => ({
  id: t.id, ch: t.ch, def: t.def, cost: t.cost, deployable: !!t.deployable,
  building: !!t.building, costsAllMovement: !!t.costsAllMovement}));
const units = Object.values(UNITS.UNIT_TYPES).map(t => Object.assign({}, t, {json: JSON.stringify(t)}));

/* Inputs use only + - * / and floor, which both languages round the same way.
 * Keep in step with math_inputs in sim/src/fdlibm.rs. */
function mathFingerprint(samples, seed) {
  const rng = COMBAT.makeRng(seed), bits = new Float64Array(1), bytes = new Uint8Array(bits.buffer);
  let log = 2166136261, tanh = 2166136261;
  const add = (h, value) => {
    bits[0] = value;
    for (let i = 0; i < 8; i++) h = Math.imul(h ^ bytes[i], 16777619) >>> 0;
    return h;
  };
  for (let i = 0; i < samples; i++) {
    const a = rng(), b = rng();
    const t = i % 3 === 0 ? (a - 0.5) * 60 : i % 3 === 1 ? (a - 0.5) / (1 + Math.floor(b * 1e6)) : (a - 0.5) / (1 + Math.floor(b * 1e12));
    const l = i % 5 === 0 ? 2 + Math.floor(a * 1e5) : i % 5 === 1 ? (a + 1e-9) * 4 : i % 5 === 2 ? 1 + (a - 0.5) / (1 + Math.floor(b * 1e8)) :
      i % 5 === 3 ? (a + 1e-9) * 1e-310 : (a + 1e-9) * 1e300;
    tanh = add(tanh, Math.tanh(t));
    log = add(log, Math.log(l));
  }
  return {samples, seed, log, tanh};
}

const data = {
  terrain, units,
  boards: boards.map(b => ({name: b.name, grid: b.grid, buildings: b.buildings || [], units: b.units || []})),
  combat: {expDamage: COMBAT.EXP_DAMAGE, maxExp: COMBAT.MAX_EXP, maxStrength: COMBAT.MAX_STRENGTH,
    randomWeights: COMBAT.RANDOM_WEIGHTS},
  rules: {turnLimit: ENGINE.TURN_LIMIT, quietTurns: ENGINE.QUIET_TURNS},
  math: mathFingerprint(1000000, 20260927),
};
const text = JSON.stringify(data) + "\n";
if (process.argv.includes("--check")) {
  if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== text) {
    console.error("sim/data/game-data.json is out of date: run node tools/sim/export-data.cjs");
    process.exit(1);
  }
} else {
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, text);
  console.log("wrote " + out + ": " + terrain.length + " terrains, " + units.length + " unit types, " + boards.length + " boards");
}
