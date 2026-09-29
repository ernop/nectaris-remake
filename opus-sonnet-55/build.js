"use strict";
/* Generates every derived file of the pack from units.js, art.js and the
 * game engine. `node opus-sonnet-55/build.js` writes them; verify.js requires
 * this module and fails when the files on disk differ from `buildFiles()`, so
 * a hand edit to a generated file is caught instead of silently kept.
 *
 * Generated: icons/*.png, sheet.png, unit-art.json, custom-units.json,
 * analysis.json, page-data.js, README.md. Hand-written (not generated):
 * index.html, page.css, page.js, and the source modules. */
const fs = require("fs");
const path = require("path");
const { UNITS, FAMILIES } = require("./units.js");
const { ORDER } = require("./art.js");
const { analyze } = require("./analysis.js");
const render = require("./render.js");

const ROOT = __dirname;
const ICON_SCALE = 4;
const FAMILY_LABEL = { foot: "Foot", wheels: "Wheels", treads: "Tracked", fixed: "Fixed", air: "Air" };

const lower = (id) => id.toLowerCase();
const rangeLabel = (r) => (r > 1 ? `2-${r}` : r === 1 ? "1" : "-");
const num = (n) => (n ? String(n) : "-");

function rules(def) {
  const tags = [];
  if (def.move === 0) tags.push("Fixed");
  if (def.capture) tags.push("Captures");
  if (def.moveOrFire) tags.push("Move or fire");
  if (def.moveAfterAttack) tags.push("Move after attack");
  if (def.cargo) tags.push(`Carries ${def.cargo}`);
  return tags;
}

function reachLabel(plain, road) {
  if (plain === null) return "-";
  return road !== plain ? `${plain} (${road} road)` : String(plain);
}

/* One flat record per unit: everything the table, cards and JSON need. */
function records(result) {
  return UNITS.map((u) => {
    const m = result.metrics[u.id];
    const gapRow = result.gap.find((r) => r.id === u.id);
    return {
      id: u.id, name: u.name, code: u.code, family: u.family, familyLabel: FAMILY_LABEL[u.family],
      sprite: u.sprite, tagline: u.tagline,
      move: u.def.move, moveType: u.def.moveType, rngG: u.def.rngG, rngA: u.def.rngA,
      atkG: u.def.atkG, atkA: u.def.atkA, def: u.def.def,
      rangeG: rangeLabel(u.def.rngG), rangeA: rangeLabel(u.def.rngA),
      reachG: m.reachG, reachGRoad: m.reachGRoad, reachA: m.reachA, reachARoad: m.reachARoad,
      rules: rules(u.def),
      gap: u.gap.cell, gapStockMatches: gapRow.stockMatches, gapSetMatches: gapRow.setMatches,
      what: u.what, play: u.play, beatenBy: u.beatenBy, pairsWith: u.pairsWith, watch: u.watch,
      exhibits: result.exhibits[u.id],
      icons: { union: `icons/${lower(u.id)}-union.png`, xenon: `icons/${lower(u.id)}-xenon.png` },
    };
  });
}

/* --- Markdown ------------------------------------------------------------ */

function icon(r, faction, px) {
  return `<img src="${r.icons[faction]}" width="${px}" height="${px}" alt="${r.name} ${faction}">`;
}

function overviewTable(recs) {
  const head = "| Icon | Unit | Type | Move | Rng G | Rng A | Atk G | Atk A | Def | Reach G | Reach A | Rules | Description |\n" +
    "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|";
  const rows = recs.map((r) => [
    `${icon(r, "union", 64)} ${icon(r, "xenon", 64)}`,
    `**${r.name}** ${r.code}`, r.familyLabel, r.move || "-", r.rangeG, r.rangeA,
    num(r.atkG), num(r.atkA), r.def,
    reachLabel(r.reachG, r.reachGRoad), reachLabel(r.reachA, r.reachARoad),
    r.rules.join(", ") || "-", r.tagline,
  ].join(" | ")).map((x) => `| ${x} |`);
  return [head].concat(rows).join("\n");
}

function gapTable(recs) {
  const head = "| Empty cell in the stock roster | Unit | Stock units already there | Other new units there |\n|---|---|---|---|";
  const rows = recs.map((r) => `| ${r.gap} | ${r.name} | ${r.gapStockMatches.length ? r.gapStockMatches.join(", ") : "none"} | ${r.gapSetMatches.length ? r.gapSetMatches.join(", ") : "none"} |`);
  return [head].concat(rows).join("\n");
}

function unitSection(r) {
  const stats = `Move ${r.move || "-"} | Range ground ${r.rangeG}, air ${r.rangeA} | Attack ground ${num(r.atkG)}, air ${num(r.atkA)} | Defense ${r.def}`;
  const reach = `Reach on ground targets ${reachLabel(r.reachG, r.reachGRoad)}; on aircraft ${reachLabel(r.reachA, r.reachARoad)}`;
  return [
    `### ${r.name} ${r.code}`, "",
    `${icon(r, "union", 128)} ${icon(r, "xenon", 128)}`, "",
    `*${r.tagline}.*`, "",
    `${r.familyLabel} | ${stats} | ${r.rules.join(", ") || "no special rules"}`, "",
    reach + ".", "",
    `**Fills:** ${r.gap}.`, "",
    `**What it is.** ${r.what}`, "",
    `**How it plays.** ${r.play}`, "",
    `**Beaten by.** ${r.beatenBy}`, "",
    `**Pairs with.** ${r.pairsWith}`, "",
    `**Watch in play tests.** ${r.watch}`, "",
    "**Checked in the engine:**", "",
    ...r.exhibits.map((x) => `- ${x}`), "",
  ].join("\n");
}

function readme(recs, result) {
  const byFamily = FAMILIES.map((f) => `- **${f.label}** (${recs.filter((r) => r.family === f.id).length}): ${recs.filter((r) => r.family === f.id).map((r) => r.name).join(", ")}. ${f.note}.`).join("\n");
  return [
    "# Opus-Sonnet 5.5: fifteen gap-filling units", "",
    "Generated by `node opus-sonnet-55/build.js`; do not edit. Source: `units.js` (rules and prose), `art.js` (icons), `analysis.js` (engine checks). Interactive overview: [`index.html`](index.html).", "",
    "Status: **design study, not approved product requirements.** It answers the `PROJECT_GUIDE.md` item \"design 15 gap-filling units\" with one independent set. Nothing here is registered in the game.", "",
    "## Overview", "",
    "Range \"2-3\" means the unit fires at 2 or 3 hexes and cannot fire at 1; \"1\" means adjacent only. Reach is the farthest hex the unit can hit in one turn, from a full-move stop on open plains (and, in brackets, along roads), computed by the engine's own movement code. Union icon left, Xenon icon right.", "",
    overviewTable(recs), "",
    "## How the set was chosen", "",
    "The game has no purchase cost: a scenario lists what each side owns. A weaker copy of a stock unit is therefore not a gap, because nobody would field it. Every unit below opens a rule combination or a terrain access that no stock unit has, and is neither dominated by nor dominating any stock or new unit.", "",
    `- **Gap screen.** Each unit carries a predicate for its empty cell. \`analysis.js\` runs it over all ${result.stockCount} stock units and requires zero matches.`,
    `- **Dominance screen.** ${result.dominance.checked} ordered pairs were compared on move, defense, both attacks, firing band, capture, cargo, fire policy and terrain costs. Aircraft and ground units are never compared. No unit dominates another.`,
    "- **Engine facts.** Every number in the unit sections comes from the game's own engine (`js/engine.js`) driven by `analysis.js`, not from arithmetic done by hand.",
    "- **Icons.** 16x16 art pixels doubled to 32x32, the seven Legacy chart colours, a black contour, right-facing art mirrored for left. `unit-art.json` follows the `art/legacy` frame format.", "",
    "### The set by chassis", "", byFamily, "",
    "### Gap map", "", gapTable(recs), "",
    "## Units", "",
    ...recs.map(unitSection),
    "## Play-test flags", "",
    "- **Dragonfly** (flying capturer) and **Rhino** (armored capturer) change base-race timing in every scenario they join. Introduce them with explicit level text.",
    "- **Javelin** (95 attack, 2-4 hexes) can make aircraft unusable on small maps. Limit to one per side while testing.",
    "- **Redoubt** on a base has 85 defense; check placements near bases.",
    "- **Badger** is the only carrier for Redoubt and Javelin, so scenarios that place them by transport need a Badger.",
    "- **Merlin** and **Lancer** need anti-air on the opposing side to be counterable; the numbers assume Falcon, Hunter, Seeker, Hawkeye or a new anti-air unit is present.", "",
    "## Files", "",
    "| File | Purpose |", "|---|---|",
    "| `index.html` | Sortable overview and unit dossiers; open in a browser |",
    "| `custom-units.json` | The editor's custom-unit object (`customUnits`), `sprite` set to a stock icon |",
    "| `unit-art.json` | 32x32 Legacy-format frames, both facings, palettes |",
    "| `icons/*.png`, `sheet.png` | Icons at 4x, Union and Xenon; contact sheet |",
    "| `analysis.json` | Stats, reach, gap screen and engine facts as data |",
    "| `verify.js` | Runs every check: `node opus-sonnet-55/verify.js` |", "",
  ].join("\n");
}

/* --- Files ---------------------------------------------------------------- */

function unitArt() {
  const frames = {};
  for (const id of ORDER) frames[id] = { right: render.frame(id, "right"), left: render.frame(id, "left") };
  const palette = (list) => [null].concat(list, Array(8).fill("#ff00ff"));
  return {
    frame: 32, anchor: [16, 16], light: "art pixels doubled; left facing mirrored", codes: "1234567",
    palettes: Object.fromEntries(Object.entries(render.PALETTES).map(([k, v]) => [k, palette(v)])),
    descriptions: Object.fromEntries(UNITS.map((u) => [u.id, `${u.name} ${u.code} · ${u.tagline}`])),
    frames,
  };
}

function buildFiles() {
  const result = analyze();
  const recs = records(result);
  const files = {};
  for (const r of recs) {
    files[r.icons.union] = Buffer.from(render.framePng(r.id, "right", "union", ICON_SCALE));
    files[r.icons.xenon] = Buffer.from(render.framePng(r.id, "right", "xenon", ICON_SCALE));
  }
  files["sheet.png"] = Buffer.from(render.sheetPng(ICON_SCALE));
  files["unit-art.json"] = JSON.stringify(unitArt(), null, 1) + "\n";
  files["custom-units.json"] = JSON.stringify(
    Object.fromEntries(UNITS.map((u) => [u.id, Object.assign({}, u.def, { sprite: u.sprite })])), null, 2) + "\n";
  const data = {
    families: FAMILIES, units: recs, dominanceChecked: result.dominance.checked,
    stock: result.stockMetrics,
  };
  files["analysis.json"] = JSON.stringify(data, null, 2) + "\n";
  files["page-data.js"] = `/* Generated by build.js. */\nwindow.OPUS_SONNET_55 = ${JSON.stringify(data)};\n`;
  files["README.md"] = readme(recs, { dominance: result.dominance, stockCount: Object.keys(result.stockMetrics).length });
  return files;
}

function write() {
  const files = buildFiles();
  fs.mkdirSync(path.join(ROOT, "icons"), { recursive: true });
  for (const [rel, content] of Object.entries(files)) fs.writeFileSync(path.join(ROOT, rel), content);
  return Object.keys(files);
}

module.exports = { buildFiles, records, FAMILY_LABEL };

if (require.main === module) {
  const written = write();
  console.log(`wrote ${written.length} files`);
}
