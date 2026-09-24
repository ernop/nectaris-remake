'use strict';
/* Asserts every statement the pack makes against the engine and the files on
 * disk: generated files match a fresh build, sprite contract and mirroring,
 * definitions and placeholder sprites, the engine rules each unit relies on,
 * the AI behaviour the notes describe, CPU games with every new unit, the
 * review's statements about tools/design-space, names, and the HTML rules.
 * build.outputs() itself re-asserts every gap test, exchange claim,
 * comparison and the dominance screen.
 * Usage: node opus55/verify.js */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const build = require('./build.js');
const analyze = require('./analyze.js');
const icons = require('./icons.js');
const { UNITS, FOOT_TEAMS, customUnits } = require('./units.js');

const HERE = __dirname, ROOT = analyze.ROOT;
const AI = require(path.join(ROOT, 'js', 'ai.js'));
const NEW = UNITS.map(u => u.id);
const SHADOW = 15;
const results = [];
function section(name, fn) {
  const started = Date.now();
  const detail = fn();
  const line = name + (detail ? ': ' + detail : '') + ' (' + (Date.now() - started) + ' ms)';
  results.push(line);
  console.log('ok  ' + line);
}

/* ---------- boards ---------- */

function board(width, height, fill = '.') {
  return Array.from({ length: height }, () => fill.repeat(width).split(''));
}
function newGame(grid, units, buildings = [], seed = 7) {
  return new ENGINE.Game({ name: 'verify', grid: grid.map(r => r.join('')), units, buildings, turnLimit: 99 }, { seed });
}
function hexesAt(grid, col, row, distance) {
  const out = [];
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) {
    if (HEX.distance(col, row, c, r) === distance) out.push({ col: c, row: r });
  }
  return out;
}
const unitOf = (game, typeId, player = 0) => {
  const u = game.units.find(x => x.typeId === typeId && x.player === player);
  if (!u) throw new Error('No ' + typeId + ' for player ' + player + ' on the test board');
  return u;
};

const ALL_SIDE = [...NEW, 'CHARLIE', 'KILROY', 'BISON', 'SEEKER', 'HADRIAN', 'EAGLE', 'HUNTER'];
const HILL_START = new Set(['YETI', 'MEERKAT', 'HOWLER', 'GECKO', 'CHARLIE', 'KILROY', 'WOMBAT', 'STORK']);
/* Two-sided 24x14 map: a mountain range cut by a road pass, hills, wasteland,
 * bases, owned factories holding a Snapper and a Giant, a neutral factory in
 * the mountains, and the listed units on each side. */
function smokeMap(side = ALL_SIDE) {
  const W = 24, H = 14, grid = board(W, H);
  for (let r = 0; r < H; r++) for (let c = 10; c <= 13; c++) grid[r][c] = 'M';
  for (let c = 0; c < W; c++) grid[6][c] = '-';
  for (const [c0, r0] of [[6, 1], [15, 10]]) for (let r = r0; r < r0 + 3; r++) for (let c = c0; c < c0 + 2; c++) grid[r][c] = 'h';
  for (const [c0, r0] of [[5, 10], [17, 1]]) for (let r = r0; r < r0 + 2; r++) for (let c = c0; c < c0 + 2; c++) grid[r][c] = 'w';
  const buildings = [
    { col: 1, row: 6, owner: 0 }, { col: 22, row: 6, owner: 1 },
    { col: 3, row: 2, owner: 0, stored: ['SNAPPER', 'GIANT'] }, { col: 20, row: 11, owner: 1, stored: ['SNAPPER', 'GIANT'] },
    { col: 11, row: 2 },
  ];
  grid[6][1] = 'B'; grid[6][22] = 'B'; grid[2][3] = 'F'; grid[11][20] = 'F'; grid[2][11] = 'F';
  const taken = new Set(buildings.map(b => HEX.key(b.col, b.row)));
  const units = [];
  const place = (id, o, anchor) => {
    const t = UNIT_TYPES[id], spots = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) spots.push({ col: c, row: r, d: HEX.distance(c, r, anchor.col, anchor.row) });
    spots.sort((a, b) => a.d - b.d || a.row - b.row || a.col - b.col);
    const spot = spots.find(s => {
      const terr = TERRAIN_BY_CHAR[grid[s.row][s.col]];
      if (taken.has(HEX.key(s.col, s.row)) || terr.building) return false;
      if (!t.move) return !!terr.deployable;
      return t.moveType === 'air' || terrainCost(terr, t.moveType, t) !== null;
    });
    if (!spot) throw new Error('smoke map has no hex for ' + id);
    taken.add(HEX.key(spot.col, spot.row));
    units.push({ t: id, o, x: spot.col, y: spot.row });
  };
  const sides = [
    { o: 0, front: { col: 8, row: 6 }, hills: { col: 9, row: 3 }, factory: { col: 3, row: 2 } },
    { o: 1, front: { col: 15, row: 6 }, hills: { col: 14, row: 9 }, factory: { col: 20, row: 11 } },
  ];
  for (const s of sides) {
    for (const id of side) place(id, s.o, id === 'CAMEL' ? s.factory : HILL_START.has(id) ? s.hills : s.front);
  }
  return { name: 'verify smoke', grid: grid.map(r => r.join('')), buildings, units, turnLimit: 30 };
}

/* ---------- sections ---------- */

function main() {
let BUILT;
section('generated files match a fresh build', () => {
  BUILT = build.outputs();
  const { art, files } = BUILT;
  for (const [file, content] of Object.entries(files)) {
    assert.strictEqual(fs.readFileSync(path.join(HERE, file), 'utf8'), content, file + ' differs from a fresh build; run node ' + build.REL + '/build.js');
  }
  assert.deepStrictEqual(fs.readdirSync(path.join(HERE, 'icons')).sort(), build.iconFiles(), 'icons/ does not hold exactly the generated icon files');
  for (const u of UNITS) {
    for (const [name, image] of Object.entries(art[u.id].images)) {
      const file = path.join(HERE, 'icons', u.id + '-' + name + '.png');
      assert(fs.readFileSync(file).equals(build.pngBytes(image)), file + ' differs from a fresh build');
    }
  }
  assert(fs.readFileSync(path.join(HERE, 'sheet.png')).equals(build.pngBytes(build.nativeSheet(art))), 'sheet.png differs from a fresh build');
  assert(fs.readFileSync(path.join(HERE, 'sheet-x4.png')).equals(build.pngBytes(build.largeSheet(art))), 'sheet-x4.png differs from a fresh build');
  const claims = BUILT.model.units.reduce((n, u) => n + u.claims.length, 0);
  const comparisons = BUILT.model.units.reduce((n, u) => n + u.comparisons.length, 0);
  return build.iconFiles().length + ' icons, ' + NEW.length + ' gap tests, ' + claims + ' exchange claims, ' + comparisons + ' comparisons, dominance screen empty';
});

section('sprites', () => {
  for (const u of UNITS) {
    const right = icons.sprite(u.id, 'right'), left = icons.sprite(u.id, 'left');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const a = right.get(x, y), b = left.get(31 - x, y);
      assert.strictEqual(!!a && a !== SHADOW, !!b && b !== SHADOW, u.id + ': the facings differ in shape at ' + x + ',' + y);
    }
  }
  return 'contract and mirrored shape hold in both facings for all ' + NEW.length;
});

section('definitions', () => {
  const R = require(path.join(ROOT, 'js', 'render.js'));
  const defs = customUnits();
  for (const id of NEW) {
    assert(!analyze.STOCK.includes(id), id + ' collides with a stock unit ID');
    for (const [key, value] of Object.entries(defs[id])) assert.deepStrictEqual(UNIT_TYPES[id][key], value, id + '.' + key + ' did not merge as defined');
    assert.strictEqual(R.spriteIdFor(UNIT_TYPES[id]), defs[id].sprite, id + ' does not render with its placeholder sprite');
  }
  const camel = UNIT_TYPES.CAMEL.cargoTypes.slice().sort();
  const heavy = Object.keys(UNIT_TYPES).filter(id => {
    const t = UNIT_TYPES[id];
    return t.moveType !== 'air' && !t.cargo && (t.move === 0 || (t.moveType === 'treads' && t.move <= 4));
  }).sort();
  assert.deepStrictEqual(camel, heavy, 'Camel cargo is described as tracked units with move 4 or less plus the emplacements');
  const deployable = Object.values(TERRAIN).filter(t => t.deployable);
  assert.strictEqual(UNIT_TYPES.SNAPPER.def + Math.max(...deployable.map(t => t.def)), 65, 'Snapper maximum defense in play');
  assert.strictEqual(UNIT_TYPES.SNAPPER.def + TERRAIN.waste.def, 90);
  return 'merged fields, placeholder sprites, Camel cargo rule, Snapper defense 65 at most';
});

section('carriers accept exactly their cargo', () => {
  const game = newGame(board(3, 3), []);
  const make = id => ENGINE.makeUnit(id, 0, 0, 0);
  const can = (carrier, passenger, fromFactory = false) => game.canLoad(make(carrier), make(passenger), fromFactory);
  for (const carrier of ['WOMBAT', 'STORK']) {
    for (const p of FOOT_TEAMS) assert(can(carrier, p), carrier + ' should carry ' + p);
    for (const p of ['BISON', 'GIANT', 'SNAPPER', 'HOUND', 'YETI', 'PANTHER']) assert(!can(carrier, p), carrier + ' should refuse ' + p);
  }
  for (const p of UNIT_TYPES.CAMEL.cargoTypes) assert(can('CAMEL', p), 'CAMEL should carry ' + p);
  for (const p of ['PIKE', 'BISON', 'KILROY', 'MANTIS', 'SQUID', 'WOMBAT']) assert(!can('CAMEL', p), 'CAMEL should refuse ' + p);
  for (const p of ['SNAPPER', 'MEERKAT', 'HOWLER', 'GECKO', 'YETI']) assert(!can('MULE', p) && !can('MULE', p, true), 'MULE should refuse ' + p);
  assert(can('MULE', 'KILROY'), 'MULE carries Kilroy');
  for (const p of ['SNAPPER', 'YETI', 'GIANT', 'PIKE']) assert(can('PELICAN', p), 'PELICAN should carry ' + p);
  for (const p of ['WASP', 'STORK']) assert(!can('PELICAN', p), 'PELICAN never carries aircraft');
  return 'Wombat, Stork, Camel, Mule and Pelican';
});

section('turn rules', () => {
  const grid = board(13, 13), C = 6, R = 6;
  // Move-or-fire: in band from where it stands, silent after any move.
  for (const [id, target, distance] of [['PIKE', 'BISON', 1], ['SQUID', 'BISON', 3], ['HOWLER', 'KILROY', 2]]) {
    const spot = hexesAt(grid, C, R, distance)[0];
    let game = newGame(grid, [{ t: id, o: 0, x: C, y: R }, { t: target, o: 1, x: spot.col, y: spot.row }]);
    assert.strictEqual(game.legalAttackTargets(unitOf(game, id)).length, 1, id + ' should fire without moving');
    game = newGame(grid, [{ t: id, o: 0, x: C, y: R }, { t: target, o: 1, x: spot.col, y: spot.row }]);
    const unit = unitOf(game, id);
    const step = HEX.neighbors(C, R).find(n => {
      const d = HEX.distance(n.col, n.row, spot.col, spot.row);
      return d >= 1 && d <= Math.max(unit.type.rngG, 1) && !(n.col === spot.col && n.row === spot.row) &&
        COMBAT.canAttackAt(unit.type, false, d);
    });
    assert(step, id + ' test board has no one-hex move that keeps the target in band');
    game.moveUnit(unit, step.col, step.row);
    assert(!game.canAttackNow(unit) && game.legalAttackTargets(unit).length === 0, id + ' must not fire after moving');
  }
  // Move and fire in one turn: Mantis at aircraft, Vulture at ground units.
  for (const [id, target] of [['MANTIS', 'EAGLE'], ['VULTURE', 'HADRIAN']]) {
    const spot = hexesAt(grid, C, R, 4)[0];
    const game = newGame(grid, [{ t: id, o: 0, x: C, y: R }, { t: target, o: 1, x: spot.col, y: spot.row }]);
    const unit = unitOf(game, id), enemy = unitOf(game, target, 1);
    assert.strictEqual(game.legalAttackTargets(unit).length, 0, id + ' target starts out of band');
    const step = HEX.neighbors(C, R).find(n => HEX.distance(n.col, n.row, spot.col, spot.row) === 3);
    game.moveUnit(unit, step.col, step.row);
    assert(game.legalAttackTargets(unit).includes(enemy), id + ' should fire after moving');
    const before = unit.strength;
    game.attack(unit, enemy);
    assert.strictEqual(unit.strength, before, id + ' must take no counter at distance 3');
  }
  // The Vulture fires over a screen: a Bison beside it, the Hadrian two hexes out behind the Bison.
  {
    const screen = HEX.neighbors(C, R)[0];
    const behind = HEX.neighbors(screen.col, screen.row).find(n => HEX.distance(n.col, n.row, C, R) === 2);
    const game = newGame(grid, [{ t: 'VULTURE', o: 0, x: C, y: R }, { t: 'BISON', o: 1, x: screen.col, y: screen.row },
      { t: 'HADRIAN', o: 1, x: behind.col, y: behind.row }]);
    const vulture = unitOf(game, 'VULTURE'), hadrian = unitOf(game, 'HADRIAN', 1), bison = unitOf(game, 'BISON', 1);
    const targets = game.legalAttackTargets(vulture);
    assert(targets.includes(hadrian) && !targets.includes(bison), 'Vulture should reach the Hadrian over the Bison and not the adjacent Bison');
  }
  // Move after attacking: Gecko and Wasp keep their activation; Kilroy and Eagle do not.
  for (const [id, target, stock] of [['GECKO', 'HADRIAN', 'KILROY'], ['WASP', 'BISON', 'EAGLE']]) {
    const spot = HEX.neighbors(C, R)[0];
    for (const [typeId, keeps] of [[id, true], [stock, false]]) {
      const game = newGame(grid, [{ t: typeId, o: 0, x: C, y: R }, { t: target, o: 1, x: spot.col, y: spot.row }]);
      const unit = unitOf(game, typeId);
      game.attack(unit, unitOf(game, target, 1));
      assert.strictEqual(game.canMoveNow(unit), keeps, typeId + (keeps ? ' should' : ' should not') + ' move after attacking');
      if (keeps) {
        const away = Object.values(game.movementRange(unit)).find(rec => rec.cost > 0 && rec.canStop &&
          HEX.distance(rec.col, rec.row, spot.col, spot.row) >= 3);
        assert(away, typeId + ' has no hex to withdraw to after attacking');
        game.moveUnit(unit, away.col, away.row);
      }
    }
  }
  return 'move-or-fire (Pike, Squid, Howler), move and fire (Mantis, Vulture), fire over a screen, move after attack (Gecko, Wasp)';
});

section('Snapper placement', () => {
  const grid = board(9, 9), F = { col: 4, row: 4 };
  grid[F.row][F.col] = 'F';
  const around = HEX.neighbors(F.col, F.row);
  const camelHex = around[0], factoryWaste = around[3];
  grid[factoryWaste.row][factoryWaste.col] = 'w';
  const camelWaste = HEX.neighbors(camelHex.col, camelHex.row).find(n =>
    HEX.distance(n.col, n.row, F.col, F.row) === 2 && grid[n.row] && grid[n.row][n.col] === '.');
  grid[camelWaste.row][camelWaste.col] = 'w';
  const game = newGame(grid, [{ t: 'CAMEL', o: 0, x: camelHex.col, y: camelHex.row }, { t: 'BISON', o: 1, x: 8, y: 8 }],
    [{ col: F.col, row: F.row, owner: 0, stored: ['SNAPPER'] }]);
  const factory = game.buildingAt(F.col, F.row), snapper = factory.stored[0], camel = unitOf(game, 'CAMEL');
  const exits = game.deployTargets(factory, snapper).map(n => HEX.key(n.col, n.row));
  assert.strictEqual(exits.length, 4, 'Snapper should deploy to the four open plains exits');
  assert(!exits.includes(HEX.key(factoryWaste.col, factoryWaste.row)), 'Snapper must not deploy onto wasteland');
  assert(game.transportDeployTargets(factory, snapper).includes(camel), 'Snapper should load straight into an adjacent Camel');
  game.loadFromFactory(factory, snapper, camel);
  game.endTurn(); game.endTurn();
  const drops = game.unloadTargets(camel, snapper).map(n => HEX.key(n.col, n.row));
  assert(drops.length > 0, 'Camel should be able to set the Snapper down');
  assert(!drops.includes(HEX.key(camelWaste.col, camelWaste.row)), 'Camel must not set the Snapper down on wasteland');
  const drop = game.unloadTargets(camel, snapper).find(n => !game.buildingAt(n.col, n.row));
  assert(drop, 'Camel has no open plains hex to set the Snapper down on');
  game.unload(camel, snapper, drop.col, drop.row);
  game.endTurn(); game.endTurn();
  assert.deepStrictEqual(Object.keys(game.movementRange(snapper)), [HEX.key(drop.col, drop.row)], 'Snapper must have no move stops');
  assert.strictEqual(game.availableActions(snapper).moves.length, 0);
  return 'deploys and unloads onto plains only, never moves';
});

section('AI notes match js/ai.js', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'ai.js'), 'utf8');
  const fn = name => {
    const m = src.match(new RegExp('\\n  function ' + name + '\\([\\s\\S]*?\\n  }\\n'));
    if (!m) throw new Error('js/ai.js no longer defines ' + name + '; update the AI notes');
    return m[0];
  };
  assert(fn('threatenedBase').includes('carrier.typeId !== "PELICAN"'), 'threatenedBase changed: update the Pelican-only AI note');
  const deploy = fn('deployOneFactory');
  assert(deploy.includes('su.typeId === "ATLAS"') && !/SNAPPER|TRIGGER/.test(deploy), 'deployOneFactory changed: update the emplacement AI note');
  assert(fn('wantsTransport').includes('if (!passenger.type.move) return fromFactory;'), 'wantsTransport changed: update the stationary-cargo note');
  assert(fn('boardOnePassenger').includes('!passenger.type.move'), 'boardOnePassenger changed: update the stationary-cargo note');
  assert(fn('bestPostAttackStep').includes('nearest'), 'bestPostAttackStep changed: update the Gecko and Wasp CPU notes');
  assert(src.includes('bestStepToward(game, unit, range, goal, unit.type.moveOrFire)'), 'move-or-fire advance changed: update the Howler and Pike CPU notes');
  assert(src.includes('if (u.type.moveOrFire || isRangedType(u.type)) return 0;'), 'activation order changed: update the CPU notes');

  // The CPU boards foot teams into the new carriers and heavy units into the Camel with no carrier-specific code.
  const boarded = [];
  for (const [carrier, passenger] of [['WOMBAT', 'KILROY'], ['STORK', 'CHARLIE'], ['CAMEL', 'GIANT']]) {
    const grid = board(18, 5);
    grid[2][17] = 'B'; grid[2][0] = 'B';
    const game = newGame(grid, [{ t: passenger, o: 0, x: 3, y: 2 }, { t: carrier, o: 0, x: 4, y: 2 }, { t: 'BISON', o: 1, x: 16, y: 0 }],
      [{ col: 0, row: 2, owner: 0 }, { col: 17, row: 2, owner: 1 }]);
    AI.playTurn(game, 0, { id: 'classic' });
    const into = unitOf(game, carrier).id;
    assert(game.log.some(e => e.t === 'load' && e.into === into), 'classic CPU did not board ' + passenger + ' into ' + carrier);
    boarded.push(passenger + ' into ' + carrier);
  }
  return 'source checks; CPU boards ' + boarded.join(', ');
});

section('CPU games with every new unit', () => {
  // Apex search time grows steeply with unit count, so apex plays two smaller
  // maps that together field all fifteen; classic plays the full map.
  const games = [
    { side: ALL_SIDE, ids: ['classic', 'classic'], seed: 1, rounds: 12 },
    { side: ['YETI', 'MEERKAT', 'HOWLER', 'GECKO', 'WOMBAT', 'STORK', 'CAMEL', 'CHARLIE', 'BISON'], ids: ['apex', 'classic'], seed: 2, rounds: 1 },
    { side: ['WASP', 'VULTURE', 'SHRIKE', 'MANTIS', 'SNAPPER', 'PIKE', 'HOUND', 'SQUID', 'KILROY', 'SEEKER'], ids: ['classic', 'apex'], seed: 3, rounds: 1 },
  ];
  const acted = { classic: {}, apex: {} }, attacked = {};
  let carried = 0;
  const lines = [];
  for (const g of games) {
    const game = new ENGINE.Game(smokeMap(g.side), { seed: g.seed });
    const typeOf = new Map();
    for (const u of game.units) typeOf.set(u.id, u.typeId);
    for (const b of Object.values(game.buildings)) for (const u of b.stored) typeOf.set(u.id, u.typeId);
    let turns = 0, slowest = 0;
    while (game.winner === null && turns < g.rounds * 2) {
      const id = g.ids[game.currentPlayer], from = game.log.length, started = Date.now();
      AI.playTurn(game, game.currentPlayer, { id });
      if (id === 'apex') slowest = Math.max(slowest, Date.now() - started);
      for (const e of game.log.slice(from)) {
        const t = typeOf.get(e.t === 'battle' ? e.a : e.unit);
        if (['move', 'battle', 'unload', 'load', 'deploy', 'loadFromFactory'].includes(e.t)) acted[id][t] = (acted[id][t] || 0) + 1;
        if (e.t === 'battle') attacked[t] = (attacked[t] || 0) + 1;
        if ((e.t === 'load' || e.t === 'loadFromFactory') && NEW.includes(typeOf.get(e.into))) carried++;
      }
      turns++;
      if (game.winner === null) game.endTurn();
    }
    lines.push(g.ids.join(' v ') + ' ' + turns + ' turns' + (slowest ? ' (slowest apex turn ' + (slowest / 1000).toFixed(1) + ' s)' : ''));
  }
  const idle = NEW.filter(id => id !== 'SNAPPER' && !acted.classic[id] && !acted.apex[id]);
  assert.deepStrictEqual(idle, [], 'new units the CPU never used: ' + idle.join(', '));
  const apexUsed = NEW.filter(id => acted.apex[id]);
  assert(apexUsed.length >= 7, 'apex acted with only ' + apexUsed.join(', '));
  const attackers = NEW.filter(id => attacked[id]);
  assert(attackers.length >= 8, 'only ' + attackers.length + ' new unit types attacked in the CPU games');
  return lines.join('; ') + '. All 14 mobile types acted; apex used ' + apexUsed.length + ' types; ' + attackers.length +
    ' types attacked; ' + carried + ' boardings into new carriers';
});

section('review statements about tools/design-space', () => {
  const earlier = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'design-space', 'custom-units.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(ROOT, 'tools', 'design-space', 'README.md'), 'utf8').replace(/\s+/g, ' ');
  const DS = require(path.join(ROOT, 'tools', 'design-space', 'analyze.js'));
  const ids = Object.keys(earlier);
  assert.strictEqual(ids.length, 15);
  for (const phrase of ['240,000-draw', 'firepower (25%), armor (15%), actual firing bands (20%), terrain reach/access (20%) and turn/mission rules (20%)',
    'assigned after selection', 'conservative dominance screen', 'existing project\'s `Surface` primitive and palette',
    'tends to select unusual boundary cases', 'the weak Midge may not justify a scenario slot', 'one-point wheeled Badger is mostly road-bound',
    'the 80-defense designs can reach the defense cap with terrain', 'emphasizing rules selects', 'none is in Mule\'s whitelist',
    'does not infer actual usage frequency from campaign maps', 'unit synergy', 'combat outcomes']) {
    assert(readme.includes(phrase), 'tools/design-space/README.md no longer says "' + phrase + '"; update the review');
  }
  assert.deepStrictEqual(DS.weights, [0.25, 0.15, 0.2, 0.2, 0.2]);
  assert.strictEqual(ids.filter(id => earlier[id].move <= 1).length, 7, 'seven designs with move 0 or 1');
  assert.deepStrictEqual(analyze.STOCK.filter(id => UNIT_TYPES[id].move <= 1).sort(), ['ATLAS', 'TRIGGER']);
  assert.deepStrictEqual(ids.filter(id => earlier[id].def === 80).sort(), ['RAMPART', 'TORTOISE']);
  assert(!ids.some(id => earlier[id].cargo) && !ids.some(id => earlier[id].moveType === 'air'), 'no carrier and no aircraft in the earlier set');
  assert(!ids.some(id => UNIT_TYPES.MULE.cargoTypes.includes(id)));
  const m = earlier.MARTEN;
  assert(m.moveType === 'wheels' && m.capture && m.moveAfterAttack && m.atkA === 85 && m.rngA === 2, 'Marten description');
  assert(!analyze.STOCK_TYPES.some(t => t.capture && t.moveAfterAttack) && !analyze.STOCK_TYPES.some(t => t.rngA === 2), 'Marten combination is new');
  const base = Object.assign({}, earlier.TORTOISE), budgetAt = def => DS.budget(Object.assign({}, base, { def }));
  assert(Math.abs((budgetAt(40) - budgetAt(20)) - (budgetAt(80) - budgetAt(60))) < 1e-12, 'the power screen counts defense linearly');
  const passes = def => (100 - Math.min(100, def + TERRAIN.plain.def)) / 100;
  const cutLow = 1 - passes(40) / passes(20), cutHigh = 1 - passes(80) / passes(60);
  assert(cutLow > 0.2 && cutLow < 0.3 && cutHigh > 0.5, 'defense 20 to 40 cuts about a quarter, 60 to 80 more than half');

  mergeUnitTypes(JSON.parse(JSON.stringify(earlier)));
  assert.strictEqual(analyze.reach('BADGER', 'plain'), 0, 'Badger cannot enter plains');
  assert.strictEqual(analyze.reach('BADGER', 'road'), 1);
  const shooters = analyze.STOCK.filter(id => UNIT_TYPES[id].atkG > 0);
  for (const id of ['TORTOISE', 'RAMPART']) {
    assert.strictEqual(earlier[id].moveType, 'treads');
    for (const a of shooters) {
      const r = analyze.duel(a, id, 'waste');
      assert(r && r.out === 0, a + ' damages ' + id + ' on wasteland');
    }
  }
  return 'phrases, counts, Badger reach, Tortoise and Rampart take 0 from all ' + shooters.length + ' stock ground attackers on wasteland';
});

section('names', () => {
  const earlier = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'design-space', 'custom-units.json'), 'utf8')));
  const official = ['GIRUMOA', 'FAKUTA', 'TEKNIK', 'KANON', 'RAPPURU', 'KRAZEE', 'MAITO', 'GAADIN', 'MAJUU', 'BURENAA', 'ARMADILLO', 'YAMAARASHI'];
  // Unit IDs of the parallel packs in grok4.7/, gemini38/ and museSpark1.3/ as of 2026-09-23.
  const parallel = ['IBEX', 'HARRIER', 'PIPIT', 'ORYX', 'COYOTE', 'JACKAL', 'OX', 'AEGIS', 'BULLDOG', 'MAMMOTH', 'HERON', 'REDOUBT', 'MERLIN',
    'CITADEL', 'BURRO', 'PHALANX', 'SENTINEL', 'DART', 'STORM', 'CYCLOPS', 'BUNKER', 'RANGER', 'HOPLITE', 'MORTAR', 'CHEETAH', 'RHINO', 'BUFFALO',
    'CORSAIR', 'TALON', 'GADFLY', 'ARGUS', 'BREACHER', 'LONGBOW', 'JAVELIN', 'PAVISE', 'TRENCH', 'DUSTER', 'WHIPPET', 'CONDOR', 'TICK', 'HAULER', 'SLOGGER'];
  const taken = new Set([...analyze.STOCK, ...earlier, ...official, ...parallel]);
  const seen = new Set();
  for (const u of UNITS) {
    assert.strictEqual(u.id, u.name.toUpperCase(), u.id + ' name and ID differ');
    assert(!taken.has(u.id), u.id + ' is already used');
    assert(!seen.has(u.id), u.id + ' appears twice');
    seen.add(u.id);
    assert(/^[A-Z]{2}-\d$/.test(u.designation), u.id + ' designation ' + u.designation);
  }
  const designations = UNITS.map(u => u.designation);
  assert.strictEqual(new Set(designations).size, designations.length, 'designations must be unique');
  return taken.size + ' reserved names avoided';
});

section('index.html', () => {
  const html = BUILT.files['index.html'];
  assert(!/<script/i.test(html), 'index.html must work without scripts');
  for (const m of html.matchAll(/\ssrc="([^"]*)"/g)) assert(m[1].startsWith('data:image/png;base64,'), 'external image ' + m[1].slice(0, 60));
  for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
    assert(/^(#[A-Z]+|README\.md|custom-units\.json|analysis\.json)$/.test(m[1]), 'unexpected link ' + m[1]);
    if (m[1].startsWith('#')) assert(html.includes('id="' + m[1].slice(1) + '"'), 'dangling anchor ' + m[1]);
  }
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  for (const m of css.matchAll(/(?:^|[;{\s])color:\s*([^;}\s]+)/g)) {
    assert(['#fff', '#000', '#9fd9ff'].includes(m[1]), 'text color ' + m[1] + ' is neither pure white, pure black nor the link color');
  }
  assert(!/opacity|max-width|#[0-9a-f]{3,6}\s*;\s*\/\*\s*gray/i.test(css), 'no opacity or fixed maximum widths');
  const images = (html.match(/<img /g) || []).length;
  assert.strictEqual(images, NEW.length * 4, 'overview and cards show two icons each per unit');
  return images + ' embedded icons, no scripts or external assets, text colors pure white or black';
});

console.log('verify: all ' + results.length + ' sections passed');
}

if (require.main === module) main();
module.exports = { smokeMap };
