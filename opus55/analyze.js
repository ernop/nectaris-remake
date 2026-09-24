'use strict';
/* Measurements against the real engine: combat exchanges, reach per terrain,
 * the bundled-map census and the dominance screen. build.js prints these
 * numbers and verify.js asserts the claims made about them, so every figure
 * in the pack is recomputed from js/ rather than typed by hand. */
const path = require('path');
const ROOT = path.join(__dirname, '..');
const js = file => require(path.join(ROOT, 'js', file));

global.HEX = js('hex.js');
Object.assign(global, js('data-terrain.js'));
Object.assign(global, js('data-units.js'));
global.COMBAT = js('combat.js');
global.ENGINE = js('engine.js');

const STOCK = Object.keys(UNIT_TYPES);
const STOCK_TYPES = STOCK.map(id => Object.assign({}, UNIT_TYPES[id]));
const TERRAINS = ['road', 'plain', 'hill', 'waste', 'mountain'];
let NEW = null;

/* Merge the pack's engine definitions exactly as a level's customUnits block is merged. */
function load(definitions) {
  if (NEW) throw new Error('analyze.load() may run once per process');
  mergeUnitTypes(JSON.parse(JSON.stringify(definitions)));
  NEW = Object.keys(definitions);
  return { STOCK, NEW };
}
function loaded() { if (!NEW) throw new Error('call analyze.load(definitions) first'); return NEW; }
function type(id) {
  const t = UNIT_TYPES[id];
  if (!t) throw new Error('Unknown unit type ' + id);
  return t;
}
function legal(t, terrain) {
  if (!TERRAIN[terrain]) throw new Error('Unknown terrain ' + terrain);
  return t.moveType === 'air' || terrainCost(TERRAIN[terrain], t.moveType, t) !== null;
}
/* The strongest legal defensive ground for a unit, in the order a player would pick it. */
function bestGround(t) {
  if (t.moveType === 'air') return 'plain';
  return ['mountain', 'waste', 'hill'].find(terrain => legal(t, terrain)) || 'plain';
}

/* One full-strength attack at the shortest legal distance, on a 9x9 plains board.
 * Returns expected kills (out), expected losses (in) and whether a counter exists,
 * or null when the attacker has no band against the defender's domain. */
function duel(attackerId, defenderId, defenderTerrain = 'plain', attackerTerrain = 'plain') {
  loaded();
  const A = type(attackerId), D = type(defenderId);
  if (!legal(D, defenderTerrain)) throw new Error(defenderId + ' cannot stand on ' + defenderTerrain);
  if (!legal(A, attackerTerrain)) throw new Error(attackerId + ' cannot stand on ' + attackerTerrain);
  const band = COMBAT.rangeBand(A, D.moveType === 'air');
  if (!band) return null;
  const grid = Array.from({ length: 9 }, () => '.'.repeat(9).split(''));
  const ac = 4, row = 4, dc = band.min === 1 ? 5 : 6;
  grid[row][dc] = TERRAIN[defenderTerrain].ch;
  grid[row][ac] = TERRAIN[attackerTerrain].ch;
  const game = new ENGINE.Game({ name: 'duel', grid: grid.map(r => r.join('')),
    units: [{ t: attackerId, o: 0, x: ac, y: row }, { t: defenderId, o: 1, x: dc, y: row }] }, { seed: 1 });
  const [a, d] = game.units;
  const distance = HEX.distance(a.col, a.row, d.col, d.row);
  if (distance !== band.min) throw new Error('duel board placed ' + attackerId + ' at distance ' + distance);
  const r = COMBAT.distribution(game, a, d);
  return { out: r.out, in: r.in_, distance, counter: !!r.preview.counter };
}

/* Farthest hex a unit can stop on after one move across uniform terrain. */
function reach(id, terrain) {
  loaded();
  const t = type(id);
  if (!t.move) return 0;
  if (!legal(t, terrain)) return null;
  const n = 25, grid = Array.from({ length: n }, () => TERRAIN[terrain].ch.repeat(n));
  const game = new ENGINE.Game({ name: 'reach', grid, units: [{ t: id, o: 0, x: 12, y: 12 }] }, { seed: 1 });
  const unit = game.units[0], range = game.movementRange(unit);
  let far = 0;
  for (const key in range) {
    const rec = range[key];
    if (rec.canStop) far = Math.max(far, HEX.distance(12, 12, rec.col, rec.row));
  }
  return far;
}
function reachRow(id) { return Object.fromEntries(TERRAINS.map(terrain => [terrain, reach(id, terrain)])); }

/* Terrain shares and unit presence across every bundled map set. */
const MAP_SETS = [
  ['Campaign (normal)', () => js('data-maps.js')],
  ['Campaign (advanced)', () => js('data-advanced-maps.js')],
  ['Base Nectaris', () => js('data-basenectaris-maps.js').BASE_NECTARIS_LEVELS],
  ['Lunar Frontiers', () => js('data-expansion-maps.js')],
  ['AI-made', () => js('data-ai-maps.js')],
  ['Environment campaigns', () => [].concat(...js('data-environment-campaigns.js').map(c => c.levels))],
];
const COMBAT_AIR = ['EAGLE', 'FALCON', 'HUNTER'];
function census() {
  return MAP_SETS.map(([name, read]) => {
    const maps = read();
    if (!Array.isArray(maps) || !maps.length) throw new Error('Map set ' + name + ' did not load as a non-empty array');
    const counts = {};
    let hexes = 0, noTreads = 0, noWheels = 0;
    const present = { combatAir: 0, pelican: 0, mule: 0, heavy: 0, artillery: 0 };
    for (const map of maps) {
      if (!Array.isArray(map.grid)) throw new Error('Map ' + map.name + ' in ' + name + ' has no grid');
      for (const row of map.grid) for (const ch of row) {
        const terrain = TERRAIN_BY_CHAR[ch];
        if (!terrain) throw new Error('Map ' + map.name + ' uses unknown terrain ' + ch);
        counts[terrain.id] = (counts[terrain.id] || 0) + 1;
        hexes++;
        if (terrainCost(terrain, 'treads') === null) noTreads++;
        if (terrainCost(terrain, 'wheels') === null) noWheels++;
      }
      const ids = (map.units || []).map(u => u.t);
      for (const b of map.buildings || []) for (const s of b.stored || []) ids.push(typeof s === 'string' ? s : s.t);
      if (ids.some(id => COMBAT_AIR.includes(id))) present.combatAir++;
      if (ids.includes('PELICAN')) present.pelican++;
      if (ids.includes('MULE')) present.mule++;
      if (ids.some(id => ['GIANT', 'POLAR', 'GRIZZLY'].includes(id))) present.heavy++;
      if (ids.some(id => ['HADRIAN', 'OCTOPUS', 'ATLAS'].includes(id))) present.artillery++;
    }
    const pct = n => Math.round(1000 * n / hexes) / 10;
    return {
      name, maps: maps.length, hexes,
      share: Object.fromEntries(Object.keys(TERRAIN).map(id => [id, pct(counts[id] || 0)])),
      closedToTreads: pct(noTreads), closedToWheels: pct(noWheels), present,
    };
  });
}

/* Claim expectations: attacker/defender wins (with a counter), even (within a quarter point),
 * noCounter (the defender cannot fire back) or cannot (no band against that domain). */
const EXPECTATIONS = ['attacker', 'defender', 'even', 'noCounter', 'cannot'];
function judge(result, expect) {
  if (!EXPECTATIONS.includes(expect)) throw new Error('Unknown claim expectation ' + expect);
  if (expect === 'cannot') return result === null;
  if (!result) return false;
  if (expect === 'noCounter') return !result.counter && result.out > 0;
  if (!result.counter) return false;
  if (expect === 'attacker') return result.out > result.in;
  if (expect === 'defender') return result.in > result.out;
  return Math.abs(result.out - result.in) < 0.25;
}
function evaluateClaim(claim) {
  const result = duel(claim.a, claim.d, claim.dt || 'plain', claim.at || 'plain');
  return Object.assign({}, claim, { dt: claim.dt || 'plain', at: claim.at || 'plain', result, holds: judge(result, claim.expect) });
}
/* Prose that compares two rows ("about half as much") is a ratio of their kills,
 * named by 'ATTACKER>DEFENDER' keys that must each match exactly one claim. */
function evaluateComparison(evaluated, cmp) {
  const kills = key => {
    const hits = evaluated.filter(c => c.a + '>' + c.d === key);
    if (hits.length !== 1) throw new Error('Comparison key ' + key + ' matches ' + hits.length + ' claims');
    if (!hits[0].result) throw new Error('Comparison key ' + key + ' names a claim where no attack is possible');
    return hits[0].result.out;
  };
  if (!Array.isArray(cmp.ratio) || cmp.ratio.length !== 2) throw new Error('Comparison ' + cmp.kills + ' needs a [min, max] ratio');
  const ratio = kills(cmp.kills) / kills(cmp.of);
  return Object.assign({}, cmp, { value: ratio, holds: ratio >= cmp.ratio[0] && ratio <= cmp.ratio[1] });
}

/* Same chassis and firing bands, at least as good in every number and rule, and not identical. */
function bands(t) {
  const band = (atk, rng) => atk > 0 && rng > 0 ? (rng > 1 ? '2-' + rng : '1') : '';
  return band(t.atkG, t.rngG) + '|' + band(t.atkA, t.rngA);
}
function dominates(a, b) {
  const A = type(a), B = type(b);
  if (A.moveType !== B.moveType || bands(A) !== bands(B)) return false;
  const atLeast = A.move >= B.move && A.atkG >= B.atkG && A.atkA >= B.atkA && A.def >= B.def &&
    !!A.capture >= !!B.capture && !!A.moveAfterAttack >= !!B.moveAfterAttack && !A.moveOrFire >= !B.moveOrFire &&
    (A.cargo || 0) >= (B.cargo || 0);
  if (!atLeast) return false;
  if (B.cargo && A.cargoTypes && (!B.cargoTypes || B.cargoTypes.some(id => !A.cargoTypes.includes(id)))) return false;
  if ((A.cannotEnter || []).some(t => !(B.cannotEnter || []).includes(t))) return false;
  const key = t => JSON.stringify([t.move, t.atkG, t.atkA, t.def, !!t.capture, !!t.moveAfterAttack, !!t.moveOrFire,
    t.cargo || 0, t.cargoTypes || null]);
  return key(A) !== key(B);
}
function dominance() {
  const ids = STOCK.concat(loaded()), found = [];
  for (const a of ids) for (const b of ids) {
    if (a !== b && (NEW.includes(a) || NEW.includes(b)) && dominates(a, b)) found.push({ better: a, worse: b });
  }
  return found;
}

module.exports = { ROOT, STOCK, STOCK_TYPES, TERRAINS, load, type, legal, bestGround, duel, reach, reachRow, census,
  judge, evaluateClaim, evaluateComparison, dominance };
