#!/usr/bin/env node
/* Export the game data the Rust simulator reads to sim/data/game-data.json.
 *   node tools/sim/export-data.cjs [--check]
 * The JavaScript data files stay the single source: terrain by letter, unit
 * types (each also as the exact JSON.stringify text the search seed hashes),
 * the built-in boards in tools/sim/boards.cjs order, and the combat tables.
 * --check exits with an error when the committed export is out of date.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path");
const root = path.resolve(__dirname, "../..");
const TERRAIN = require(path.join(root, "js/data-terrain.js"));
const UNITS = require(path.join(root, "js/data-units.js"));
const COMBAT = require(path.join(root, "js/combat.js"));
const boards = require("./boards.cjs");
const out = path.join(root, "sim/data/game-data.json");

const terrain = Object.values(TERRAIN.TERRAIN).map(t => ({
  id: t.id, ch: t.ch, def: t.def, cost: t.cost, deployable: !!t.deployable,
  building: !!t.building, costsAllMovement: !!t.costsAllMovement}));
const units = Object.values(UNITS.UNIT_TYPES).map(t => Object.assign({}, t, {json: JSON.stringify(t)}));
const data = {
  terrain, units,
  boards: boards.map(b => ({name: b.name, grid: b.grid, buildings: b.buildings || [], units: b.units || [],
    turnLimit: b.turnLimit || null})),
  combat: {expDamage: COMBAT.EXP_DAMAGE, maxExp: COMBAT.MAX_EXP, maxStrength: COMBAT.MAX_STRENGTH,
    randomWeights: COMBAT.RANDOM_WEIGHTS},
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
