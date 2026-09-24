'use strict';
/* Build the grok4.7 review pack and refuse to write it if a check fails. */
const fs = require('fs');
const path = require('path');
const S = require('../tools/design-space/analyze.js');
const { UNIT_TYPES, mergeUnitTypes } = require('../js/data-units.js');
const { TERRAIN, terrainCost } = require('../js/data-terrain.js');
const HEX = require('../js/hex.js');
const ENGINE = require('../js/engine.js');
const COMBAT = require('../js/combat.js');
const { Surface, colorize } = require('../art/units/pixel-art.js');
const { png, text } = require('../tools/pixel-art-export.js');
const { sprite } = require('./icons.js');
const { intro, method, groups, units } = require('./units.js');

const root = __dirname;
const iconDir = path.join(root, 'icons');
const BLACK = 0xff000000;
const WHITE = 0xffffffff;
const terrains = ['road', 'plain', 'hill', 'waste', 'mountain', 'valley'];
const terrainName = { road: 'Road', plain: 'Plain', hill: 'Hill', waste: 'Waste', mountain: 'Mtn', valley: 'Valley' };
const FOOT = new Set(['IBEX', 'HARRIER', 'PIPIT']);

function fail(msg) { throw new Error(msg); }
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function chassis(t) { return t === 'foot' ? 'Foot' : t === 'wheels' ? 'Wheels' : t === 'treads' ? 'Treads' : fail('chassis ' + t); }
function rulesOf(u) {
  const out = [];
  if (!u.move) out.push('Placed');
  else if (u.moveOrFire) out.push('Move or fire');
  else if (u.moveAfterAttack) out.push('Fire, then move');
  else out.push('Move and fire');
  if (u.capture) out.push('Captures');
  if (u.cargo) out.push('Carries foot');
  return out;
}
function bandText(r) {
  if (!r) return null;
  if (r === 1) return 'hex 1';
  if (r === 2) return 'hex 2';
  return 'hex 2–' + r;
}
function reachOf(u, t) {
  const c = terrainCost(TERRAIN[t], u.moveType, u);
  if (!u.move) return '0';
  if (c === null) return '—';
  if (TERRAIN[t].costsAllMovement) return '1';
  return String(Math.floor(u.move / c));
}
function rings(def, air) {
  const out = [];
  for (let d = 0; d <= 7; d++) if (COMBAT.canAttackAt(def, air, d)) out.push(d);
  return out;
}
function ringLabel(list) {
  if (!list.length) return 'none';
  if (list.length === 1) return String(list[0]);
  const span = list.every((n, i) => n === list[0] + i);
  return span ? list[0] + '–' + list[list.length - 1] : list.join(', ');
}
function bounds(s) {
  let minX = 32, maxX = -1, minY = 32, maxY = -1, n = 0;
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (s.get(x, y)) {
    n++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { n, minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}
function inHex(x, y) {
  const dx = x + 0.5 - 16, dy = y + 0.5 - 16;
  return Math.abs(dx) <= 14 && Math.abs(dy) <= 14 && Math.abs(dx) + Math.abs(dy) <= 22;
}
function mask(s) {
  let bits = '';
  for (let i = 0; i < s.p.length; i++) bits += s.p[i] ? '1' : '0';
  return bits;
}
function definition(u) {
  const d = {
    name: u.name, cls: u.cls, move: u.move, moveType: u.moveType,
    atkG: u.atkG, atkA: u.atkA, def: u.def, rngG: u.rngG, rngA: u.rngA
  };
  if (u.capture) d.capture = true;
  if (u.moveOrFire) d.moveOrFire = true;
  if (u.moveAfterAttack) d.moveAfterAttack = true;
  if (u.placeByTransport) d.placeByTransport = true;
  if (u.cargo) { d.cargo = u.cargo; d.cargoTypes = u.cargoTypes.slice(); }
  return d;
}

if (units.length !== 15) fail('expected 15 units, got ' + units.length);
const ids = new Set();
for (const u of units) {
  if (ids.has(u.id)) fail('duplicate id ' + u.id);
  ids.add(u.id);
  if (UNIT_TYPES[u.id]) fail(u.id + ' collides with a stock id');
  if (!S.feasible(u)) fail(u.id + ' is outside the declared design bounds');
  if (S.budget(u) > S.budget(UNIT_TYPES.GIANT) + 1e-9) fail(u.id + ' exceeds Giant on the stacking screen');
}
const stock = Object.values(UNIT_TYPES).filter(s => s.moveType !== 'air');
if (stock.length !== 19) fail('stock ground count ' + stock.length);

const frames = {};
const silhouettes = new Map();
for (const u of units) {
  frames[u.id] = {};
  for (const facing of ['right', 'left']) {
    const s = sprite(u.id, facing);
    if (s.w !== 32 || s.h !== 32) fail(u.id + ' frame');
    const bad = [];
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const p = s.get(x, y);
      if (!p) continue;
      if (p < 1 || p > 15) fail(u.id + ' palette ' + p);
      if (!inHex(x, y)) bad.push(x + ',' + y);
    }
    if (bad.length) fail(u.id + '/' + facing + ' outside the hex: ' + bad.slice(0, 12).join(' '));
    const b = bounds(s);
    if (b.w % 2) fail(u.id + '/' + facing + ' odd width ' + b.w);
    const shift = (32 - b.minX - b.maxX - 1) / 2;
    if (shift !== 0) fail(u.id + '/' + facing + ' not centered, shift ' + shift);
    if (FOOT.has(u.id) && (b.h > 18 || b.w > 22)) fail(u.id + ' infantry silhouette ' + b.w + '×' + b.h);
    frames[u.id][facing] = s;
  }
  const key = mask(frames[u.id].right);
  if (silhouettes.has(key)) fail(u.id + ' shares a silhouette with ' + silhouettes.get(key));
  silhouettes.set(key, u.id);
  if (mask(frames[u.id].left) === key) fail(u.id + ' facings are identical');
}

const custom = {};
for (const u of units) custom[u.id] = definition(u);
mergeUnitTypes(JSON.parse(JSON.stringify(custom)));

const nearest = {};
for (const u of units) {
  const ranked = stock.map(s => ({ id: s.id, name: s.name, d: S.distance(S.vector(s), S.vector(u)) }))
    .sort((a, b) => a.d - b.d);
  if (ranked[0].d < 1e-9) fail(u.id + ' matches ' + ranked[0].id);
  nearest[u.id] = ranked.slice(0, 3);
  for (const s of stock) {
    if (S.dominates(S.vector(s), S.vector(u)) || S.dominates(S.vector(u), S.vector(s))) {
      fail(u.id + ' dominates or is dominated by ' + s.id);
    }
  }
}
for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) {
  const a = units[i], b = units[j];
  if (S.dominates(S.vector(a), S.vector(b)) || S.dominates(S.vector(b), S.vector(a))) {
    fail(a.id + ' dominates or is dominated by ' + b.id);
  }
}

const engineNotes = [];
for (const u of units) {
  const def = custom[u.id];
  const g = rings(def, false), a = rings(def, true);
  const expectG = S.band(u.rngG).filter(d => u.atkG > 0);
  const expectA = S.band(u.rngA).filter(d => u.atkA > 0);
  if (g.join() !== expectG.join() || a.join() !== expectA.join()) fail(u.id + ' ring mismatch');
  for (const t of terrains) {
    const field = new ENGINE.Game({
      name: t, grid: Array(30).fill(TERRAIN[t].ch.repeat(30)), units: []
    }, { seed: 1 });
    const unit = ENGINE.makeUnit(u.id, 0, 15, 15);
    const range = Object.values(field.movementRange(unit));
    const furthest = Math.max(...range.map(p => HEX.distance(15, 15, p.col, p.row)));
    if (furthest !== S.reach(def, t)) fail(u.id + ' reach ' + t + ' engine ' + furthest + ' analysis ' + S.reach(def, t));
  }
  const board = new ENGINE.Game({ name: 'load', grid: Array(8).fill('.'.repeat(8)), units: [] }, { seed: 1 });
  const unit = ENGINE.makeUnit(u.id, 0, 4, 4);
  const pelican = ENGINE.makeUnit('PELICAN', 0, 3, 4);
  const mule = ENGINE.makeUnit('MULE', 0, 5, 4);
  if (!board.canLoad(pelican, unit, false)) fail(u.id + ' refused by Pelican');
  if (board.canLoad(mule, unit, false)) fail(u.id + ' accepted by Mule');
  engineNotes.push(u.id + ' rings G ' + ringLabel(g) + ' / A ' + ringLabel(a));
}
const burro = ENGINE.makeUnit('BURRO', 0, 2, 2);
const board = new ENGINE.Game({ name: 'burro', grid: Array(8).fill('.'.repeat(8)), units: [] }, { seed: 1 });
for (const id of ['CHARLIE', 'KILROY', 'IBEX', 'HARRIER', 'PIPIT']) {
  if (!board.canLoad(burro, ENGINE.makeUnit(id, 0, 3, 2), false)) fail('Burro refused ' + id);
}
for (const id of ['ORYX', 'OX', 'COYOTE', 'ATLAS', 'TRIGGER', 'BISON', 'JACKAL']) {
  if (board.canLoad(burro, ENGINE.makeUnit(id, 0, 3, 2), false)) fail('Burro accepted ' + id);
}

function statCells(u) {
  const g = u.atkG ? '<b class="num">' + u.atkG + '</b><span class="sub">' + esc(bandText(u.rngG)) + '</span>' : '<b class="num">—</b>';
  const a = u.atkA ? '<b class="num">' + u.atkA + '</b><span class="sub">' + esc(bandText(u.rngA)) + '</span>' : '<b class="num">—</b>';
  const reach = terrains.map(t => '<div><b>' + esc(reachOf(u, t)) + '</b><span>' + terrainName[t] + '</span></div>').join('');
  return '<td><img src="icons/' + u.id + '-union-right.png" width="64" height="64" alt="' + esc(u.name) + '"></td>'
    + '<td><a class="name" href="#' + u.id + '">' + esc(u.name.split(' ')[0]) + '</a><span class="code">' + esc(u.name.split(' ').slice(1).join(' ')) + '</span><span class="role">' + esc(u.role) + '</span></td>'
    + '<td data-label="Move"><b class="num">' + u.move + '</b><span class="sub">' + chassis(u.moveType) + '</span></td>'
    + '<td data-label="Ground">' + g + '</td><td data-label="Air">' + a + '</td>'
    + '<td data-label="Defense"><b class="num">' + u.def + '</b></td>'
    + '<td data-label="Reach"><div class="reach">' + reach + '</div></td>'
    + '<td data-label="Rules">' + rulesOf(u).map(r => '<span class="rules">' + esc(r) + '</span>').join('') + '</td>'
    + '<td data-label="What it is"><p class="blurb">' + esc(u.blurb) + '</p></td>';
}

function dossier(u) {
  const def = custom[u.id];
  const pics = [
    ['union', 'right', 'Union, right'],
    ['xenon', 'right', 'Xenon, right'],
    ['union', 'left', 'Union, left'],
    ['xenon', 'left', 'Xenon, left']
  ].map(([f, face, cap]) => '<figure><img src="icons/' + u.id + '-' + f + '-' + face + '.png" width="96" height="96" alt="' + esc(u.name + ', ' + cap) + '"><figcaption>' + esc(cap) + '</figcaption></figure>').join('');
  const near = nearest[u.id].map(n => esc(n.name) + ' (' + (n.d * 100).toFixed(1) + ')').join(', ');
  const screen = S.budget(u).toFixed(2) + ' against Giant’s ' + S.budget(UNIT_TYPES.GIANT).toFixed(2);
  const blocks = [
    ['Decision', u.decision],
    ['Use', u.use],
    ['Payment', u.pay],
    ['Trial', u.trial],
    ['Beside', u.beside],
    ['Picture', u.art]
  ].map(([h, p]) => '<h4>' + h + '</h4><p>' + esc(p) + '</p>').join('');
  return '<article id="' + u.id + '"><h3>' + esc(u.name) + '</h3><p class="roleline">' + esc(u.role) + '</p>'
    + '<div class="strip">' + pics
    + '<div class="bigstats">'
    + '<div><b>' + u.move + '</b><span>' + chassis(u.moveType) + '</span></div>'
    + '<div><b>' + (u.atkG || '—') + '</b><span>Ground ' + esc(bandText(u.rngG) || 'none') + '</span></div>'
    + '<div><b>' + (u.atkA || '—') + '</b><span>Air ' + esc(bandText(u.rngA) || 'none') + '</span></div>'
    + '<div><b>' + u.def + '</b><span>Defense</span></div>'
    + '</div></div>'
    + blocks
    + '<h4>Engine</h4><p>Ground hexes ' + esc(ringLabel(rings(def, false))) + '. Air hexes ' + esc(ringLabel(rings(def, true))) + '. '
    + terrains.map(t => terrainName[t] + ' ' + reachOf(u, t)).join(', ') + '.</p>'
    + '<h4>Nearest stock shapes</h4><p>' + near + '. The figure is the design-space distance times 100. It is a shape comparison, not a win rate. Stacking screen ' + esc(screen) + '.</p>'
    + '</article>';
}

const rows = groups.map(g => {
  const body = units.filter(u => u.group === g.id).map(u => '<tr>' + statCells(u) + '</tr>').join('');
  if (!body) fail('empty group ' + g.id);
  return '<tr class="group"><td colspan="9">' + esc(g.title) + ' <span>' + esc(g.note) + '</span></td></tr>' + body;
}).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fifteen ground units</title>
<style>
  html, body { background: #fff; color: #000; }
  body { margin: 0; font-family: "Liberation Sans", "DejaVu Sans", sans-serif; font-size: 18px; line-height: 1.45; }
  header.top { background: #15335a; color: #fff; padding: 1.2rem 1.5rem 1.35rem; }
  header.top p, header.top h1 { color: #fff; font-weight: 800; margin: 0; }
  header.top h1 { font-size: 2.3rem; line-height: 1.15; }
  header.top p { font-size: 1.15rem; margin-top: 0.35rem; }
  main { padding: 0.4rem 1.25rem 3rem; }
  h2 { font-size: 1.75rem; font-weight: 800; margin: 1.5rem 0 0.45rem; color: #000; }
  h3 { font-size: 1.55rem; font-weight: 800; margin: 0 0 0.15rem; color: #000; }
  h4 { font-size: 1.15rem; font-weight: 800; margin: 0.9rem 0 0.15rem; color: #000; }
  p { margin: 0.35rem 0 0.7rem; color: #000; font-weight: 500; }
  a { color: #000; font-weight: 800; }
  .key { font-weight: 500; max-width: none; }
  .table-wrap { overflow-x: auto; border: 2px solid #000; }
  table { width: 100%; min-width: 1180px; border-collapse: collapse; }
  th { background: #15335a; color: #fff; font-weight: 800; font-size: 1rem; text-align: left; padding: 0.5rem; position: sticky; top: 0; }
  td { background: #fff; color: #000; border-top: 1px solid #000; vertical-align: top; padding: 0.45rem 0.5rem; }
  tr.group td { background: #15335a; color: #fff; font-size: 1.2rem; font-weight: 800; }
  tr.group td span { color: #fff; font-size: 1rem; font-weight: 800; margin-left: 0.75rem; }
  td img, figure img { image-rendering: pixelated; image-rendering: crisp-edges; background: #14151f; border: 2px solid #000; display: block; }
  .num, .bigstats b, .reach b { font-variant-numeric: tabular-nums; font-weight: 800; color: #000; line-height: 1.05; }
  .num { font-size: 1.5rem; display: block; }
  .sub, .code, .role, .rules { display: block; font-weight: 800; color: #000; }
  .sub, .code { font-size: 1rem; }
  .role { font-size: 1rem; margin-top: 0.12rem; }
  .name { font-size: 1.25rem; }
  .blurb { font-size: 1rem; font-weight: 500; margin: 0.28rem 0 0; }
  .rules { font-size: 1rem; }
  .reach { display: grid; grid-template-columns: repeat(3, minmax(2.4rem, 1fr)); gap: 0.2rem 0.35rem; }
  .reach b { font-size: 1.2rem; display: block; }
  .reach span { font-size: 0.75rem; font-weight: 800; color: #000; display: block; }
  article { border-top: 2px solid #000; padding: 1.1rem 0 0.4rem; }
  .roleline { font-size: 1.15rem; font-weight: 800; margin: 0 0 0.7rem; }
  .strip { display: flex; flex-wrap: wrap; gap: 0.8rem 1rem; align-items: flex-start; }
  figure { margin: 0; }
  figcaption { color: #000; font-weight: 800; font-size: 0.9rem; margin-top: 0.25rem; text-align: center; }
  .bigstats { display: flex; flex-wrap: wrap; gap: 0.8rem 1.4rem; align-items: flex-end; }
  .bigstats b { font-size: 2rem; display: block; }
  .bigstats span { font-size: 1rem; font-weight: 800; color: #000; display: block; }
  .sheet { width: 100%; height: auto; image-rendering: pixelated; image-rendering: crisp-edges; border: 2px solid #000; background: #fff; }
  @media (max-width: 860px) {
    .table-wrap { overflow: visible; border: 0; }
    table { min-width: 0; }
    thead { display: none; }
    table, tbody, tr, td { display: block; width: 100%; }
    tr { border: 2px solid #000; margin: 0 0 0.85rem; }
    td { border-top: 0; }
    td[data-label]::before { content: attr(data-label); display: block; color: #000; font-weight: 800; font-size: 1rem; margin-bottom: 0.12rem; }
    tr.group { border: 0; margin: 0.4rem 0 0; }
  }
  footer { margin-top: 1.5rem; }
  footer p { font-weight: 500; }
</style>
</head>
<body>
<header class="top"><h1>Fifteen ground units</h1><p>Proposals for the 1989 rules. Not part of the playable roster.</p></header>
<main>
  ${intro.map(p => '<p>' + esc(p) + '</p>').join('')}
  <h2>Overview</h2>
  <p class="key">Move is the point value, then the chassis. Ground and Air are attack, then the hexes that weapon reaches. Hex 1 is adjacent and can counter. Hex 2–N cannot touch the adjacent hex. Defense is the base value, before terrain. Reach is how many hexes of that terrain one activation can enter. A dash means the chassis cannot enter. 0 means the points are not enough, including a placed unit whose move is 0.</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Icon</th><th>Unit</th><th>Move</th><th>Ground</th><th>Air</th><th>Def</th><th>Reach</th><th>Rules</th><th>What it is</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <h2>Full design</h2>
  ${units.map(dossier).join('')}
  <h2>How this set was chosen</h2>
  ${method.map(p => '<p>' + esc(p) + '</p>').join('')}
  <h2>Contact sheet</h2>
  <p>Union and Xenon, both facings, native pixels at 2×. Upper-left light on both facings.</p>
  <img class="sheet" src="sheet.png" alt="Contact sheet of all fifteen units, both factions and both facings">
  <h2>Checks</h2>
  <p>The build compared every proposal with the stock 19 ground units under the design-space dominance test, including the proposals against each other. It loaded them through the engine, matched firing rings to combat.js, matched reach on six uniform terrains, confirmed Pelican can carry each one, and confirmed Mule’s whitelist rejects each one. Burro carries Charlie, Kilroy, Ibex, Harrier, and Pipit, and rejects Oryx, Ox, Coyote, Jackal, Bison, Atlas, and Trigger. Icons are 32×32, inside the hex mask, horizontally centered, and silhouettes differ.</p>
  <footer><p>Source: grok4.7/units.js and grok4.7/icons.js. Regenerate with node grok4.7/build.js. Editor definitions are in units.json. Stock rules: js/data-units.js, js/data-terrain.js, js/combat.js, MECHANICS.md.</p></footer>
</main>
</body>
</html>
`;

fs.mkdirSync(iconDir, { recursive: true });
for (const u of units) for (const facing of ['right', 'left']) for (const faction of ['union', 'xenon']) {
  png(colorize(frames[u.id][facing], faction, false), path.join(iconDir, u.id + '-' + faction + '-' + facing + '.png'));
}

const scale = 2, cell = 32 * scale, gap = 8, labelH = 18;
const sheetW = units.length * (cell + gap) + gap;
const sheetH = labelH + 4 * (cell + gap) + gap;
const sheet = new Surface(sheetW, sheetH);
sheet.p.fill(WHITE);
units.forEach((u, i) => {
  const x = gap + i * (cell + gap);
  text(sheet, u.id, x, 2, BLACK, 1);
  ['right', 'left'].forEach((facing, fi) => ['union', 'xenon'].forEach((faction, fa) => {
    const colored = colorize(frames[u.id][facing], faction, false);
    const y = labelH + (fi * 2 + fa) * (cell + gap);
    for (let row = 0; row < cell; row++) for (let col = 0; col < cell; col++) {
      sheet.set(x + col, y + row, 0xff14151f);
    }
    for (let row = 0; row < 32; row++) for (let col = 0; col < 32; col++) {
      const p = colored.get(col, row);
      if (!p) continue;
      for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) sheet.set(x + col * scale + sx, y + row * scale + sy, p);
    }
  }));
});
png(sheet, path.join(root, 'sheet.png'));
fs.writeFileSync(path.join(root, 'units.json'), JSON.stringify(custom, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'index.html'), html);

function mdReach(u) {
  return terrains.map(t => terrainName[t] + ' ' + reachOf(u, t)).join(', ');
}
const mdTable = [
  '| | Unit | Move | Ground | Air | Def | Rules | What it is |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...units.map(u => '| ![' + u.name + '](icons/' + u.id + '-union-right.png) | **' + u.name + '** — ' + u.role
    + ' | ' + u.move + ' ' + chassis(u.moveType)
    + ' | ' + (u.atkG ? u.atkG + ' ' + bandText(u.rngG) : '—')
    + ' | ' + (u.atkA ? u.atkA + ' ' + bandText(u.rngA) : '—')
    + ' | ' + u.def
    + ' | ' + rulesOf(u).join(', ')
    + ' | ' + u.blurb + ' |')
];
const mdUnits = units.map(u => {
  const near = nearest[u.id].map(n => n.name + ' (' + (n.d * 100).toFixed(1) + ')').join(', ');
  return [
    '## ' + u.name,
    '',
    u.role + '.',
    '',
    '![Union, right](icons/' + u.id + '-union-right.png) ![Xenon, right](icons/' + u.id + '-xenon-right.png) ![Union, left](icons/' + u.id + '-union-left.png) ![Xenon, left](icons/' + u.id + '-xenon-left.png)',
    '',
    '**Decision.** ' + u.decision,
    '',
    '**Use.** ' + u.use,
    '',
    '**Payment.** ' + u.pay,
    '',
    '**Trial.** ' + u.trial,
    '',
    '**Beside.** ' + u.beside,
    '',
    '**Picture.** ' + u.art,
    '',
    'Engine rings: ground ' + ringLabel(rings(custom[u.id], false)) + ', air ' + ringLabel(rings(custom[u.id], true)) + '. Reach: ' + mdReach(u) + '.',
    '',
    'Nearest stock shapes: ' + near + '. Stacking screen ' + S.budget(u).toFixed(2) + ', Giant ' + S.budget(UNIT_TYPES.GIANT).toFixed(2) + '.',
    ''
  ].join('\n');
}).join('\n');
const readme = [
  '# Fifteen ground units',
  '',
  'Generated from `units.js` by `node grok4.7/build.js`. Edit `units.js` or `icons.js`, then rebuild. The readable overview with the stat table is [index.html](index.html).',
  '',
  ...intro,
  '',
  '## Overview',
  '',
  'Hex 1 is adjacent and can counter. Hex 2–N cannot touch the adjacent hex. A dash in a longer write-up means the chassis cannot enter; 0 means the movement points are not enough.',
  '',
  ...mdTable,
  '',
  '## Full design',
  '',
  mdUnits,
  '## How this set was chosen',
  '',
  ...method.flatMap(p => [p, '']),
  '## Checks',
  '',
  'This build passed: 15 units inside the declared bounds and under Giant on the stacking screen; no dominance either way against the stock 19 or against each other; engine firing rings; engine reach on road, plain, hill, waste, mountain, and valley; Pelican accepts every proposal; Mule accepts none; Burro accepts only Charlie, Kilroy, Ibex, Harrier, and Pipit. Icons are original 32×32 frames, both facings, Union and Xenon, inside the hex mask, with distinct silhouettes and small foot soldiers.',
  '',
  '## Files',
  '',
  '- `index.html` — overview table, dossiers, contact sheet',
  '- `units.json` — editor custom-definition object',
  '- `icons/` — 60 PNGs, 32×32',
  '- `sheet.png` — contact sheet',
  '- `units.js`, `icons.js`, `build.js` — sources',
  ''
].join('\n');
fs.writeFileSync(path.join(root, 'README.md'), readme);

const summary = units.map(u => {
  const n = nearest[u.id][0];
  const b = bounds(frames[u.id].right);
  return u.id + ' ' + b.w + 'x' + b.h + ' screen ' + S.budget(u).toFixed(2) + ' near ' + n.id + ' ' + (n.d * 100).toFixed(1);
});
console.log(summary.join('\n'));
console.log('Wrote 60 icons, sheet, units.json, index.html, README.md');
console.log(engineNotes.join('\n'));
