'use strict';
/* Builds every generated file of the pack from units.js and icons.js:
 * icons/*.png, sheet.png, sheet-x4.png, custom-units.json, analysis.json,
 * index.html and README.md. Any false exchange claim or failed gap test
 * throws, so no generated page can state a number the engine does not produce.
 * Usage: node opus55/build.js */
const fs = require('fs');
const path = require('path');
const { PACK, UNITS, FOOT_TEAMS, customUnits } = require('./units.js');
const icons = require('./icons.js');
const analyze = require('./analyze.js');
const { png, text, C } = require(path.join(analyze.ROOT, 'tools', 'pixel-art-export.js'));
const { Surface } = require(path.join(analyze.ROOT, 'art', 'units', 'pixel-art.js'));

const HERE = __dirname;
const REL = path.relative(analyze.ROOT, HERE).split(path.sep).join('/');
const DEFINITIONS = customUnits();
analyze.load(DEFINITIONS);

/* ---------- sprites ---------- */

const VARIANTS = [
  { name: 'union-right', faction: 'union', facing: 'right' },
  { name: 'union-left', faction: 'union', facing: 'left' },
  { name: 'xenon-right', faction: 'xenon', facing: 'right' },
  { name: 'xenon-left', faction: 'xenon', facing: 'left' },
  { name: 'attack-right', faction: 'attack', facing: 'right' },
  { name: 'spent-right', faction: 'union', facing: 'right', spent: true },
];
const SCALED = [['union-right', 2], ['union-right', 4], ['xenon-left', 4]];

function scaled(surface, k) {
  const out = new Surface(surface.w * k, surface.h * k);
  out.blit(surface, 0, 0, k);
  return out;
}
function drawSprites() {
  const art = {};
  for (const u of UNITS) {
    const indexed = {}, stats = {}, images = {};
    for (const facing of ['right', 'left']) {
      indexed[facing] = icons.sprite(u.id, facing);
      stats[facing] = icons.check(u.id, facing, indexed[facing]);
    }
    for (const v of VARIANTS) images[v.name] = icons.colorize(indexed[v.facing], v.faction, !!v.spent);
    for (const [name, k] of SCALED) images[name + '-x' + k] = scaled(images[name], k);
    art[u.id] = { stats, images };
  }
  return art;
}
function iconFiles() {
  const files = [];
  for (const u of UNITS) {
    for (const v of VARIANTS) files.push(u.id + '-' + v.name + '.png');
    for (const [name, k] of SCALED) files.push(u.id + '-' + name + '-x' + k + '.png');
  }
  return files.sort();
}

const SHEET_BG = C('#2a2330'), SHEET_CELL = C('#3a3040'), SHEET_TEXT = C('#ffffff');
/* Native contact sheet: one column per unit; rows are Union right, Xenon left, attack and spent. */
function nativeSheet(art) {
  const cell = 34, rows = ['union-right', 'xenon-left', 'attack-right', 'spent-right'];
  const s = new Surface(UNITS.length * cell + 2, rows.length * cell + 2);
  s.rect(0, 0, s.w, s.h, SHEET_BG);
  UNITS.forEach((u, c) => rows.forEach((name, r) => {
    s.rect(2 + c * cell, 2 + r * cell, 32, 32, SHEET_CELL);
    s.blit(art[u.id].images[name], 2 + c * cell, 2 + r * cell);
  }));
  return s;
}
/* Labeled 4x sheet: five columns, Union facing right beside Xenon facing left. */
function largeSheet(art) {
  const cols = 5, cw = 2 * 128 + 24, ch = 128 + 34, pad = 8;
  const s = new Surface(cols * cw + pad, Math.ceil(UNITS.length / cols) * ch + pad);
  s.rect(0, 0, s.w, s.h, SHEET_BG);
  UNITS.forEach((u, i) => {
    const x = pad + (i % cols) * cw, y = pad + Math.floor(i / cols) * ch;
    text(s, u.name + ' ' + u.designation, x, y, SHEET_TEXT, 2);
    for (const [k, name] of [[0, 'union-right'], [1, 'xenon-left']]) {
      s.rect(x + k * 136, y + 22, 128, 128, SHEET_CELL);
      s.blit(art[u.id].images[name], x + k * 136, y + 22, 4);
    }
  });
  return s;
}

/* ---------- model ---------- */

const MAX_STRENGTH = COMBAT.MAX_STRENGTH;
const CHASSIS = { foot: 'foot', wheels: 'wheels', treads: 'tracks', air: 'air' };
const TERRAIN_LABEL = { road: 'road', plain: 'plains', hill: 'hills', waste: 'wasteland', mountain: 'mountains', valley: 'valleys' };
const shortName = id => UNIT_TYPES[id].name.split(' ')[0];

function band(atk, rng) {
  if (!atk || !rng) return null;
  return { atk, range: rng === 1 ? 'range 1' : rng === 2 ? 'range 2' : 'range 2\u2013' + rng };
}
function cargoText(t) {
  const ids = t.cargoTypes;
  if (!ids) throw new Error(t.id + ' carries without a whitelist; the pack documents every carrier\u2019s list');
  const names = ids.map(shortName).join(', ');
  if (JSON.stringify(ids) === JSON.stringify(FOOT_TEAMS)) return 'foot teams (' + names + ')';
  return names;
}
function rules(t) {
  const out = [];
  if (!t.move) out.push('Stationary: set down by a carrier or factory');
  if (t.moveOrFire) out.push('Moves or fires, not both');
  if (t.moveAfterAttack) out.push('Moves after attacking');
  if (t.cargo) out.push('Carries ' + t.cargo + ': ' + cargoText(t));
  return out;
}
function buildModel() {
  const census = analyze.census();
  const dominance = analyze.dominance();
  if (dominance.length) throw new Error('Dominance screen failed: ' + dominance.map(d => d.better + ' over ' + d.worse).join(', '));
  const units = UNITS.map(u => {
    const t = analyze.type(u.id);
    const contradictions = u.gap.test(analyze.STOCK_TYPES).map(s => s.id);
    if (contradictions.length) throw new Error(u.id + ' gap test "' + u.gap.rule + '" is contradicted by ' + contradictions.join(', '));
    const claims = u.claims.map(analyze.evaluateClaim);
    const failed = claims.filter(c => !c.holds);
    if (failed.length) {
      throw new Error(u.id + ' claims do not hold: ' + failed.map(c => c.a + ' vs ' + c.d + ' expected ' + c.expect + ', got ' +
        JSON.stringify(c.result)).join('; '));
    }
    const comparisons = (u.compare || []).map(cmp => analyze.evaluateComparison(claims, cmp));
    const wrong = comparisons.filter(c => !c.holds);
    if (wrong.length) {
      throw new Error(u.id + ' comparisons do not hold: ' + wrong.map(c => c.kills + ' / ' + c.of + ' = ' + c.value.toFixed(2) +
        ', stated as "' + c.text + '" [' + c.ratio + ']').join('; '));
    }
    return {
      id: u.id, name: u.name, designation: u.designation, family: u.family, role: u.role, line: u.line,
      gap: { text: u.gap.text, rule: u.gap.rule, contradictions },
      play: u.play, counters: u.counters, ai: u.ai, art: u.art,
      engine: DEFINITIONS[u.id],
      chassis: t.move ? CHASSIS[t.moveType] : 'fixed',
      ground: band(t.atkG, t.rngG), air: band(t.atkA, t.rngA), rules: rules(t),
      reach: analyze.reachRow(u.id),
      claims: claims.map(c => ({ attacker: c.a, defender: c.d, defenderTerrain: c.dt, attackerTerrain: c.at, expect: c.expect,
        note: c.note, result: c.result && { kills: round(c.result.out), loses: round(c.result.in), counter: c.result.counter, distance: c.result.distance } })),
      comparisons: comparisons.map(c => ({ kills: c.kills, of: c.of, text: c.text, ratio: c.ratio, value: round(c.value) })),
    };
  });
  const families = {};
  for (const [key, f] of Object.entries(PACK.families)) {
    if (!f.name || !f.tag || !f.intro) throw new Error('Family ' + key + ' needs a name, tag and intro');
    families[key] = { name: f.name, tag: f.tag, intro: fillTokens(f.intro, census) };
  }
  return { maxStrength: MAX_STRENGTH, census, dominance, families, units };
}
const round = x => Math.round(x * 100) / 100;
/* Numbers quoted in family prose are computed from the census, never typed. */
function fillTokens(s, census) {
  return s.replace(/\{(\w+)\}/g, (token, key) => {
    if (key === 'tracksClosedRange') {
      const shares = census.map(set => set.closedToTreads);
      return Math.round(Math.min(...shares)) + '% to ' + Math.round(Math.max(...shares)) + '%';
    }
    throw new Error('Unknown text token ' + token);
  });
}

/* ---------- shared text helpers ---------- */

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* Prose is written with Markdown backticks for identifiers; HTML shows them as code. */
const prose = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const md = s => String(s).replace(/\|/g, '\\|');
const one = x => x.toFixed(1);
function fightLabel(c) {
  let label = shortName(c.attacker) + ' attacks ' + shortName(c.defender);
  const where = [];
  if (c.defenderTerrain !== 'plain') where.push(shortName(c.defender) + ' on ' + TERRAIN_LABEL[c.defenderTerrain]);
  if (c.attackerTerrain !== 'plain') where.push(shortName(c.attacker) + ' on ' + TERRAIN_LABEL[c.attackerTerrain]);
  return { label, where: where.length ? where.join(', ') : 'plains' };
}
function reachCells(u) {
  return analyze.TERRAINS.map(terrain => {
    const r = u.reach[terrain];
    return { terrain: TERRAIN_LABEL[terrain], value: u.chassis === 'fixed' ? '0' : r === null ? '\u2014' : String(r) };
  });
}
const CENSUS_COLUMNS = [
  ['Maps', s => s.maps], ['Plains %', s => s.share.plain], ['Roads %', s => s.share.road], ['Hills %', s => s.share.hill],
  ['Wasteland %', s => s.share.waste], ['Mountains %', s => s.share.mountain], ['Valleys %', s => s.share.valley],
  ['Closed to tracks %', s => s.closedToTreads], ['Closed to wheels %', s => s.closedToWheels],
  ['Maps with combat aircraft', s => s.present.combatAir], ['Maps with Pelican', s => s.present.pelican],
  ['Maps with Mule', s => s.present.mule], ['Maps with heavy tanks', s => s.present.heavy], ['Maps with artillery', s => s.present.artillery],
];
function censusTotals(census) {
  const maps = census.reduce((n, s) => n + s.maps, 0);
  const air = census.reduce((n, s) => n + s.present.combatAir, 0);
  const noAir = census.filter(s => s.present.combatAir === 0).map(s => s.name);
  return { maps, air, noAir };
}

/* ---------- README.md ---------- */

function renderReadme(model) {
  const L = [];
  const totals = censusTotals(model.census);
  L.push('# ' + PACK.title + ' \u2014 ' + PACK.author + ' set', '');
  L.push('<!-- Generated by build.js from units.js and icons.js. Edit those files, then run: node ' + REL + '/build.js -->', '');
  L.push(PACK.summary, '');
  L.push('This set was produced by a ' + PACK.author + ' session and lives in `' + REL + '/`. ' +
    'Open [index.html](index.html) for the visual overview; load [custom-units.json](custom-units.json) to play it.', '');
  L.push('## Overview', '');
  L.push('| Icon | Unit | Role | Move | Ground | Air | Defense | Special rule | What it is |');
  L.push('|:---:|---|---|---:|---:|---:|---:|---|---|');
  for (const u of model.units) {
    const cell = b => b ? '**' + b.atk + '** ' + b.range.replace('range ', 'r') : '\u2014';
    L.push('| <img src="icons/' + u.id + '-union-right-x2.png" width="64" height="64" alt="' + u.name + '"> | **' + u.name + '** ' + u.designation +
      ' | ' + u.role + ' | **' + u.engine.move + '** ' + u.chassis + ' | ' + cell(u.ground) + ' | ' + cell(u.air) + ' | **' + u.engine.def + '** | ' +
      md(u.rules.join('; ') || '\u2014') + ' | ' + md(u.line) + ' |');
  }
  L.push('', 'Ground and air columns give attack per strength point and firing band; a band starting at 2 cannot hit an adjacent unit. ' +
    'Move is movement points on the unit\u2019s chassis. Every unit plays in both factions:', '');
  L.push('![Union facing right beside Xenon facing left, 4x](sheet-x4.png)', '');
  L.push('Native size (Union right, Xenon left, attack, spent): ![native contact sheet](sheet.png)', '');

  L.push('## Why these fifteen', '', '### Review of the earlier study', '');
  for (const [head, body] of PACK.review) L.push('- **' + head + '.** ' + body);
  L.push('', '### Method', '');
  PACK.method.forEach(([head, body], i) => L.push((i + 1) + '. **' + head + '.** ' + body));
  L.push('', '### Map census', '');
  L.push('Computed from every bundled map by analyze.js. Combat aircraft (Eagle, Falcon, Hunter) appear in ' + totals.air + ' of ' + totals.maps +
    ' maps; none of the ' + totals.noAir.join(' or ') + ' maps field them, so the air and anti-air designs matter only where a map adds aircraft.', '');
  L.push('| Map set | ' + CENSUS_COLUMNS.map(c => c[0]).join(' | ') + ' |');
  L.push('|---|' + CENSUS_COLUMNS.map(() => '---:').join('|') + '|');
  for (const s of model.census) L.push('| ' + s.name + ' | ' + CENSUS_COLUMNS.map(c => c[1](s)).join(' | ') + ' |');
  L.push('');

  L.push('## The units', '');
  L.push('Exchange tables show one full-strength attack (' + model.maxStrength + ' strength points each) at the shortest legal distance, with the ' +
    'engine\u2019s expected strength points removed from the defender (kills) and from the attacker (loses). Reach is the farthest hex one move ' +
    'reaches across uniform terrain; \u2014 means the chassis cannot enter it.', '');
  for (const [key, family] of Object.entries(model.families)) {
    L.push('### ' + family.name, '', family.intro, '');
    for (const u of model.units.filter(x => x.family === key)) {
      const t = u.engine;
      L.push('#### ' + u.name + ' ' + u.designation + ' \u2014 ' + u.role, '');
      L.push('<img src="icons/' + u.id + '-union-right-x4.png" width="128" height="128" alt="' + u.name + ' Union"> ' +
        '<img src="icons/' + u.id + '-xenon-left-x4.png" width="128" height="128" alt="' + u.name + ' Xenon">', '');
      L.push('*' + u.line + '*', '');
      L.push('| Move | Ground attack | Air attack | Defense | Special rule | Engine `cls` / placeholder `sprite` |');
      L.push('|---:|---:|---:|---:|---|---|');
      const bandText = b => b ? b.atk + ', ' + b.range : '\u2014';
      L.push('| ' + t.move + ' ' + u.chassis + ' | ' + bandText(u.ground) + ' | ' + bandText(u.air) + ' | ' + t.def + ' | ' +
        md(u.rules.join('; ') || '\u2014') + ' | `' + t.cls + '` / `' + t.sprite + '` |', '');
      L.push('**Gap.** ' + u.gap.text, '', '**Stock check** (all ' + analyze.STOCK.length + ' stock units pass): ' + u.gap.rule, '');
      L.push('**Reach per move:** ' + reachCells(u).map(r => r.terrain + ' ' + r.value).join(' \u00b7 '), '');
      L.push('**How to use.** ' + u.play, '');
      L.push('**Counters.** ' + u.counters, '');
      L.push('| Exchange | Terrain | Kills | Loses | Counter | Shows |');
      L.push('|---|---|---:|---:|:---:|---|');
      for (const c of u.claims) {
        const f = fightLabel(c);
        if (!c.result) L.push('| ' + f.label + ' | ' + f.where + ' | \u2014 | \u2014 | no attack | ' + md(c.note) + ' |');
        else L.push('| ' + f.label + ' | ' + f.where + ' | ' + one(c.result.kills) + ' | ' + one(c.result.loses) + ' | ' +
          (c.result.counter ? 'yes' : 'no') + ' | ' + md(c.note) + ' |');
      }
      L.push('', '**CPU.** ' + u.ai + ' **Art.** ' + u.art, '');
    }
  }
  L.push('## Engine and AI notes', '');
  for (const note of PACK.engineNotes.concat(PACK.aiNotes)) L.push('- ' + note);
  L.push('', '## Loading the set', '');
  L.push('1. Open `editor.html`, paste the contents of [custom-units.json](custom-units.json) into **Custom unit types (JSON)** and press ' +
    '**Apply custom units**. The editor stores them and writes them into the `customUnits` block of each level it saves.');
  L.push('2. Or add the same object as `customUnits` in a level JSON file; `startGame` in `js/main.js` merges it before the game is built.', '');
  L.push('Mixed maps need a carrier that accepts the new foot teams: Wombat or Stork (the Mule\u2019s whitelist is unchanged).', '');
  L.push('## Reproduce', '', '```sh');
  L.push('node ' + REL + '/build.js    # icons, sheets, custom-units.json, analysis.json, index.html, README.md');
  L.push('node ' + REL + '/verify.js   # sprite contract, gap tests, exchanges, engine rules, CPU smoke games, generated files');
  L.push('```', '');
  L.push('## Files', '');
  L.push('| File | Contents |', '|---|---|');
  for (const [file, what] of [
    ['units.js', 'Source of truth: prose, engine definitions, gap tests and exchange claims.'],
    ['icons.js', 'Original 32\u00d732 indexed sprites in the stock palette, projection, light and outline rules.'],
    ['analyze.js', 'Engine-backed measurements: exchanges, reach, map census, dominance screen.'],
    ['build.js', 'Writes every generated file listed here.'],
    ['verify.js', 'Asserts every claim in this README against the engine and the files on disk.'],
    ['custom-units.json', 'The engine definitions, keyed by unit ID, ready for customUnits.'],
    ['analysis.json', 'All computed numbers: census, reach, exchanges, gap tests, sprite bounds.'],
    ['index.html', 'Self-contained visual overview with embedded icons.'],
    ['icons/', 'Per unit: Union and Xenon in both facings, attack and spent states at native size, plus 2x and 4x copies.'],
    ['sheet.png, sheet-x4.png', 'Contact sheets at native size and 4x.'],
  ]) L.push('| `' + file + '` | ' + what + ' |');
  L.push('');
  return L.join('\n');
}

/* ---------- index.html ---------- */

const FAMILY_COLOR = { foot: '#ffd166', lift: '#7bdff2', air: '#b8f2a0', ground: '#ffa987' };
const CSS = `
:root { color-scheme: dark; --bg: #121016; --panel: #1d1924; --line: #4b4358; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: #fff; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { width: 100%; padding: 2.5vw 3vw 5vw; }
h1 { font-size: 2.5rem; line-height: 1.15; font-weight: 800; margin: 0 0 .6rem; }
h2 { font-size: 1.9rem; font-weight: 800; margin: 3rem 0 1rem; border-bottom: 2px solid var(--line); padding-bottom: .3rem; }
h3 { font-size: 1.45rem; font-weight: 800; margin: 2.2rem 0 .4rem; }
h4 { font-size: 1.4rem; font-weight: 800; margin: 0; }
h5 { font-size: 1.05rem; font-weight: 800; margin: 1rem 0 .15rem; }
p, li { font-size: 1rem; margin: .35rem 0; }
.lede { font-size: 1.15rem; width: 100%; }
a { color: #9fd9ff; font-weight: 600; }
.scroll { width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { border-bottom: 1px solid var(--line); padding: .55rem .6rem; text-align: left; vertical-align: middle; }
th { font-size: .85rem; font-weight: 900; letter-spacing: .03em; text-transform: uppercase; white-space: nowrap; }
td.num, th.num { text-align: right; white-space: nowrap; }
.val { display: block; font-size: 1.55rem; font-weight: 700; line-height: 1.1; }
.unit small, td small, .stat small { display: block; font-size: .85rem; font-weight: 500; }
.none { font-size: 1.55rem; font-weight: 700; }
img.px { image-rendering: pixelated; image-rendering: crisp-edges; display: inline-block; vertical-align: middle; }
.icons { white-space: nowrap; }
.unit b { font-size: 1.3rem; font-weight: 800; }
.des { white-space: nowrap; }
.tag { display: inline-block; color: #000; font-weight: 800; font-size: .85rem; padding: .1rem .45rem; border-radius: .25rem; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 36rem), 1fr)); gap: 1.2rem; }
.card { background: var(--panel); border: 1px solid var(--line); border-left-width: .5rem; border-radius: .4rem; padding: 1rem 1.2rem 1.2rem; }
.card header { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
.card header .title { flex: 1 1 14rem; }
.card .line { font-size: 1.1rem; font-weight: 600; margin: .6rem 0; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr)); gap: .5rem; margin: .8rem 0; }
.stat { background: #000; border: 1px solid var(--line); border-radius: .3rem; padding: .4rem .6rem; }
.stat .label, .reach .label { display: block; font-size: .8rem; font-weight: 900; text-transform: uppercase; letter-spacing: .03em; }
.stat .val { font-size: 1.75rem; }
.rule { font-size: 1rem; font-weight: 700; margin: .3rem 0 .6rem; }
.reach { display: grid; grid-template-columns: repeat(5, 1fr); gap: .4rem; margin: .3rem 0 .6rem; }
.reach div { border: 1px solid var(--line); border-radius: .3rem; padding: .3rem .5rem; }
.reach .val { font-size: 1.4rem; }
.claims td, .claims th { padding: .4rem .45rem; }
.claims .fight { font-weight: 600; }
.claims .val { font-size: 1.2rem; }
.census td.num .val { font-size: 1.15rem; }
.notes li { margin: .5rem 0; }
code { font-size: .95em; color: #fff; background: #000; padding: 0 .25rem; border-radius: .2rem; }
`;

function renderHtml(model, art) {
  const img = (id, name, size) => '<img class="px" width="' + size + '" height="' + size + '" alt="' + esc(id + ' ' + name) +
    '" src="data:image/png;base64,' + pngBase64(art[id].images[name]) + '">';
  const valueCell = b => b ? '<td class="num"><span class="val">' + b.atk + '</span><small>' + b.range + '</small></td>' :
    '<td class="num"><span class="none">\u2014</span></td>';
  const tag = u => '<span class="tag" style="background:' + FAMILY_COLOR[u.family] + '">' + esc(model.families[u.family].tag) + '</span>';
  const totals = censusTotals(model.census);
  const H = [];
  H.push('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">');
  H.push('<title>' + esc(PACK.title + ' \u2014 ' + PACK.author + ' set') + '</title><style>' + CSS + '</style></head><body><main>');
  H.push('<h1>' + esc(PACK.title) + '</h1>');
  H.push('<p class="lede">' + prose(PACK.summary) + '</p>');
  H.push('<p>Set by ' + esc(PACK.author) + ', in <code>' + esc(REL) + '/</code>. <a href="README.md">README</a> \u00b7 ' +
    '<a href="custom-units.json">custom-units.json</a> \u00b7 <a href="analysis.json">analysis.json</a></p>');

  H.push('<h2 id="overview">Overview</h2><div class="scroll"><table><thead><tr><th>Icon</th><th>Unit</th><th class="num">Move</th>' +
    '<th class="num">Ground</th><th class="num">Air</th><th class="num">Defense</th><th>Special rule</th><th>What it is</th></tr></thead><tbody>');
  for (const u of model.units) {
    H.push('<tr><td class="icons">' + img(u.id, 'union-right', 64) + img(u.id, 'xenon-left', 64) + '</td>' +
      '<td class="unit"><b><a href="#' + u.id + '">' + esc(u.name) + '</a></b> <span class="des">' + esc(u.designation) + '</span><small>' +
      esc(u.role) + '</small></td>' +
      '<td class="num"><span class="val">' + u.engine.move + '</span><small>' + u.chassis + '</small></td>' +
      valueCell(u.ground) + valueCell(u.air) +
      '<td class="num"><span class="val">' + u.engine.def + '</span></td>' +
      '<td>' + esc(u.rules.join('; ') || '\u2014') + '</td><td>' + esc(u.line) + '</td></tr>');
  }
  H.push('</tbody></table></div>');
  H.push('<p>Attack is per strength point; a band that starts at 2 cannot hit an adjacent unit. Move is movement points on the unit\u2019s chassis.</p>');

  H.push('<h2 id="units">The units</h2>');
  H.push('<p>Exchange tables show one full-strength attack (' + model.maxStrength + ' strength points each) at the shortest legal distance: ' +
    'expected strength points the attacker removes (kills) and loses. Reach is the farthest hex one move reaches across uniform terrain; ' +
    '\u2014 means the chassis cannot enter it.</p>');
  for (const [key, family] of Object.entries(model.families)) {
    H.push('<h3>' + esc(family.name) + '</h3><p>' + prose(family.intro) + '</p><div class="cards">');
    for (const u of model.units.filter(x => x.family === key)) {
      const t = u.engine;
      H.push('<article class="card" id="' + u.id + '" style="border-left-color:' + FAMILY_COLOR[u.family] + '">');
      H.push('<header>' + img(u.id, 'union-right-x4', 128) + img(u.id, 'xenon-left-x4', 128) + '<div class="title"><h4>' +
        esc(u.name + ' ' + u.designation) + '</h4><p class="rule">' + esc(u.role) + '</p>' + tag(u) + '</div></header>');
      H.push('<p class="line">' + esc(u.line) + '</p>');
      const stat = (label, value, small) => '<div class="stat"><span class="label">' + label + '</span><span class="val">' + value + '</span>' +
        (small ? '<small>' + esc(small) + '</small>' : '') + '</div>';
      H.push('<div class="stats">' + stat('Move', t.move, u.chassis) +
        stat('Ground', u.ground ? u.ground.atk : '\u2014', u.ground && u.ground.range) +
        stat('Air', u.air ? u.air.atk : '\u2014', u.air && u.air.range) + stat('Defense', t.def) + '</div>');
      if (u.rules.length) H.push('<p class="rule">' + esc(u.rules.join('; ')) + '</p>');
      H.push('<h5>Reach per move</h5><div class="reach">' + reachCells(u).map(r =>
        '<div><span class="label">' + r.terrain + '</span><span class="val">' + r.value + '</span></div>').join('') + '</div>');
      H.push('<h5>Gap</h5><p>' + prose(u.gap.text) + '</p><p><b>Stock check (all ' + analyze.STOCK.length + ' stock units pass):</b> ' +
        prose(u.gap.rule) + '</p>');
      H.push('<h5>How to use</h5><p>' + prose(u.play) + '</p><h5>Counters</h5><p>' + prose(u.counters) + '</p>');
      H.push('<h5>Exchanges</h5><div class="scroll"><table class="claims"><thead><tr><th>Exchange</th><th class="num">Kills</th>' +
        '<th class="num">Loses</th><th>Counter</th><th>Shows</th></tr></thead><tbody>');
      for (const c of u.claims) {
        const f = fightLabel(c);
        H.push('<tr><td class="fight">' + esc(f.label) + '<small>' + esc(f.where) + '</small></td>' + (c.result ?
          '<td class="num"><span class="val">' + one(c.result.kills) + '</span></td><td class="num"><span class="val">' + one(c.result.loses) +
          '</span></td><td>' + (c.result.counter ? 'yes' : 'no') + '</td>' :
          '<td class="num"><span class="val">\u2014</span></td><td class="num"><span class="val">\u2014</span></td><td>no attack</td>') +
          '<td>' + prose(c.note) + '</td></tr>');
      }
      H.push('</tbody></table></div>');
      H.push('<h5>CPU</h5><p>' + prose(u.ai) + '</p><h5>Art</h5><p>' + prose(u.art) + '</p>');
      H.push('<p><b>Engine:</b> <code>cls ' + esc(t.cls) + '</code> <code>sprite ' + esc(t.sprite) + '</code> (placeholder)</p></article>');
    }
    H.push('</div>');
  }

  H.push('<h2 id="why">Why these fifteen</h2><h3>Review of the earlier study</h3><ul>');
  for (const [head, body] of PACK.review) H.push('<li><b>' + esc(head) + '.</b> ' + prose(body) + '</li>');
  H.push('</ul><h3>Method</h3><ol>');
  for (const [head, body] of PACK.method) H.push('<li><b>' + esc(head) + '.</b> ' + prose(body) + '</li>');
  H.push('</ol><h3>Map census</h3><p>Combat aircraft appear in ' + totals.air + ' of ' + totals.maps + ' bundled maps; none of the ' +
    esc(totals.noAir.join(' or ')) + ' maps field them.</p>');
  H.push('<div class="scroll"><table class="census"><thead><tr><th>Map set</th>' + CENSUS_COLUMNS.map(c => '<th class="num">' + esc(c[0]) + '</th>').join('') +
    '</tr></thead><tbody>');
  for (const s of model.census) {
    H.push('<tr><td><b>' + esc(s.name) + '</b></td>' + CENSUS_COLUMNS.map(c => '<td class="num"><span class="val">' + c[1](s) + '</span></td>').join('') + '</tr>');
  }
  H.push('</tbody></table></div>');

  H.push('<h2 id="notes">Engine and AI notes</h2><ul class="notes">');
  for (const note of PACK.engineNotes.concat(PACK.aiNotes)) H.push('<li>' + prose(note) + '</li>');
  H.push('</ul><h3>Loading the set</h3><p>Paste <a href="custom-units.json">custom-units.json</a> into <b>Custom unit types (JSON)</b> in ' +
    '<code>editor.html</code> and press <b>Apply custom units</b>, or add it as <code>customUnits</code> in a level file. ' +
    'Maps that mix the new foot teams with carriers need a Wombat or Stork.</p>');
  H.push('<h3>Reproduce</h3><p><code>node ' + esc(REL) + '/build.js</code> then <code>node ' + esc(REL) + '/verify.js</code></p>');
  H.push('</main></body></html>');
  return H.join('\n') + '\n';
}

function pngBytes(surface) {
  const tmp = path.join(require('os').tmpdir(), 'opus-pack-' + process.pid + '.png');
  png(surface, tmp);
  const bytes = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return bytes;
}
const pngBase64 = surface => pngBytes(surface).toString('base64');

/* ---------- analysis.json ---------- */

function renderAnalysis(model, art) {
  const units = {};
  for (const u of model.units) {
    units[u.id] = { engine: u.engine, reach: u.reach, gap: { rule: u.gap.rule, contradictions: u.gap.contradictions },
      claims: u.claims, comparisons: u.comparisons, sprite: art[u.id].stats };
  }
  return JSON.stringify({ generatedBy: REL + '/build.js', stockUnits: analyze.STOCK.length, maxStrength: model.maxStrength,
    census: model.census, dominance: model.dominance, units }, null, 2) + '\n';
}

function outputs() {
  const art = drawSprites();
  const model = buildModel();
  return {
    art, model,
    files: {
      'custom-units.json': JSON.stringify(DEFINITIONS, null, 2) + '\n',
      'analysis.json': renderAnalysis(model, art),
      'README.md': renderReadme(model),
      'index.html': renderHtml(model, art),
    },
  };
}

function write() {
  const { art, files } = outputs();
  fs.mkdirSync(path.join(HERE, 'icons'), { recursive: true });
  for (const u of UNITS) {
    for (const [name, image] of Object.entries(art[u.id].images)) png(image, path.join(HERE, 'icons', u.id + '-' + name + '.png'));
  }
  png(nativeSheet(art), path.join(HERE, 'sheet.png'));
  png(largeSheet(art), path.join(HERE, 'sheet-x4.png'));
  for (const [file, content] of Object.entries(files)) fs.writeFileSync(path.join(HERE, file), content);
  console.log('Wrote ' + iconFiles().length + ' icons, 2 sheets and ' + Object.keys(files).join(', ') + ' to ' + REL + '/');
}

if (require.main === module) write();
module.exports = { outputs, iconFiles, nativeSheet, largeSheet, pngBytes, DEFINITIONS, REL };
