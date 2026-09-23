'use strict';
// gemini38 validation script
// Verifies engine loading, bounds, icon completeness, and non-duplication.
const fs = require('fs');
const path = require('path');
const { mergeUnitTypes, UNIT_TYPES } = require('../js/data-units.js');
const COMBAT = require('../js/combat.js');
const ENGINE = require('../js/engine.js');

const customPath = path.join(__dirname, 'custom-units.json');
const custom = JSON.parse(fs.readFileSync(customPath, 'utf8'));
const ids = Object.keys(custom);
let failures = 0;
const error = (msg) => { failures++; console.error('FAIL: ' + msg); };

if (ids.length !== 15) {
  error('Expected exactly 15 units, got ' + ids.length);
}

// Clone stock unit types before merging
const stockSnapshot = JSON.parse(JSON.stringify(UNIT_TYPES));

// Merge into UNIT_TYPES
try {
  mergeUnitTypes(JSON.parse(JSON.stringify(custom)));
} catch (e) {
  error('mergeUnitTypes threw error: ' + e.message);
}

for (const id of ids) {
  const u = UNIT_TYPES[id];
  if (!u) {
    error(id + ' not found in UNIT_TYPES after merge');
    continue;
  }

  // Integer and range checks
  for (const stat of ['move', 'atkG', 'atkA', 'def', 'rngG', 'rngA']) {
    if (!Number.isInteger(u[stat]) || u[stat] < 0) {
      error(`${id}.${stat} = ${u[stat]} is not a non-negative integer`);
    }
  }

  if (u.move > 12) error(`${id}.move exceeds 12 (${u.move})`);
  if (u.def > 80) error(`${id}.def exceeds 80 (${u.def})`);
  if (u.atkG > 90) error(`${id}.atkG exceeds 90 (${u.atkG})`);
  if (u.atkA > 90) error(`${id}.atkA exceeds 90 (${u.atkA})`);
  if (u.rngG > 6) error(`${id}.rngG exceeds 6 (${u.rngG})`);
  if (u.rngA > 6) error(`${id}.rngA exceeds 6 (${u.rngA})`);

  if (!['foot', 'wheels', 'treads', 'air'].includes(u.moveType)) {
    error(`${id}.moveType invalid: ${u.moveType}`);
  }

  if (u.move === 0 && !u.placeByTransport) {
    error(`${id} is immobile but missing placeByTransport`);
  }

  if (u.atkG === 0 && u.atkA === 0 && u.cls !== 'mine') {
    error(`${id} is unarmed and not a mine`);
  }

  // Check icons
  for (const fac of ['union', 'xenon']) {
    const iconFile = path.join(__dirname, 'icons', `${id.toLowerCase()}-${fac}.png`);
    if (!fs.existsSync(iconFile)) {
      error(`${id} missing icon: ${iconFile}`);
    }
  }

  // Range band check against combat engine
  for (let dist = 1; dist <= 6; dist++) {
    const canG = COMBAT.canAttackAt(u, false, dist);
    const expectedG = (u.rngG === 1 && dist === 1) || (u.rngG > 1 && dist >= 2 && dist <= u.rngG);
    if (canG !== expectedG) {
      error(`${id} ground range ${u.rngG} at distance ${dist} mismatch in combat engine (got ${canG}, expected ${expectedG})`);
    }

    const canA = COMBAT.canAttackAt(u, true, dist);
    const expectedA = (u.rngA === 1 && dist === 1) || (u.rngA > 1 && dist >= 2 && dist <= u.rngA);
    if (canA !== expectedA) {
      error(`${id} air range ${u.rngA} at distance ${dist} mismatch in combat engine (got ${canA}, expected ${expectedA})`);
    }
  }

  // Pelican loading check (all ground units must be Pelican-loadable)
  if (u.moveType !== 'air') {
    const game = new ENGINE.Game({ name: 'Validation', grid: Array(10).fill('..........'), units: [] }, { seed: 1 });
    const groundUnit = ENGINE.makeUnit(id, 0, 0, 0);
    const pelican = ENGINE.makeUnit('PELICAN', 0, 1, 0);
    if (!game.canLoad(pelican, groundUnit)) {
      error(`${id} ground unit cannot be loaded into Pelican transport`);
    }
  }
}

// Check for statline duplicates across stock and gemini38
const signature = (u) => [
  u.move, u.moveType, u.atkG, u.atkA, u.def, u.rngG, u.rngA,
  !!u.capture, !!u.moveOrFire, !!u.moveAfterAttack, u.cargo || 0
].join('|');

const seen = new Map();
for (const id of Object.keys(stockSnapshot)) {
  seen.set(signature(stockSnapshot[id]), id);
}

for (const id of ids) {
  const sig = signature(UNIT_TYPES[id]);
  if (seen.has(sig)) {
    error(`${id} duplicates statline of ${seen.get(sig)}`);
  }
  seen.set(sig, id);
}

if (failures === 0) {
  console.log('SUCCESS: All 15 gemini38 units passed engine validation, bounds checks, and icon verification.');
  process.exit(0);
} else {
  console.error(`FAILED: ${failures} validation errors found.`);
  process.exit(1);
}
