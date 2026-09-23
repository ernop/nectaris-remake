'use strict';
// museSpark1.3 validation: engine-loadable stats, value ranges, icon presence.
const fs = require('fs');
const path = require('path');
const { mergeUnitTypes, UNIT_TYPES } = require('../js/data-units.js');

const custom = JSON.parse(fs.readFileSync(path.join(__dirname, 'custom-units.json'), 'utf8'));
const ids = Object.keys(custom);
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL ' + m); };

if (ids.length !== 15) bad('expected 15 units, got ' + ids.length);
mergeUnitTypes(JSON.parse(JSON.stringify(custom)));
for (const id of ids) {
  const u = UNIT_TYPES[id];
  if (!u) { bad(id + ' missing after merge'); continue; }
  for (const k of ['move', 'atkG', 'atkA', 'def', 'rngG', 'rngA'])
    if (!Number.isInteger(u[k]) || u[k] < 0) bad(id + '.' + k + '=' + u[k]);
  if (u.move > 12 || u.def > 80 || u.atkG > 90 || u.atkA > 90 || u.rngG > 6 || u.rngA > 6)
    bad(id + ' exceeds stock maxima envelope');
  if (!['foot', 'wheels', 'treads', 'air'].includes(u.moveType)) bad(id + ' moveType');
  if (!u.move && !u.placeByTransport) bad(id + ' immobile without placeByTransport');
  if (!u.atkG && !u.atkA && u.cls !== 'mine') bad(id + ' unarmed non-mine');
  for (const f of ['union', 'xenon'])
    if (!fs.existsSync(path.join(__dirname, 'icons', id.toLowerCase() + '-' + f + '.png')))
      bad(id + ' missing ' + f + ' icon');
}
// stock overlap: no identical statline to a stock unit or sibling
const sig = (u) => [u.move, u.moveType, u.atkG, u.atkA, u.def, u.rngG, u.rngA,
  !!u.capture, !!u.moveOrFire, !!u.moveAfterAttack, u.cargo || 0].join('|');
const seen = {};
for (const id of Object.keys(UNIT_TYPES)) {
  const s = sig(UNIT_TYPES[id]);
  if (seen[s]) bad(id + ' duplicates statline of ' + seen[s]);
  seen[s] = id;
}
console.log(fail ? fail + ' FAILURES' : 'OK: 15 units, engine-loaded, icons present, no duplicate statlines');
process.exit(fail ? 1 : 0);
