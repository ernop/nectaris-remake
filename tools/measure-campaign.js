#!/usr/bin/env node
/* Measure a campaign designed to a difficulty curve (MAP_BALANCE.md,
 * Designing a campaign) against the targets stored in its specs file.
 *
 *   node tools/measure-campaign.js measure --specs=PATH --out=PREFIX --games=N --seed=TEXT
 *       [--variants=PATH] [--pool=marshal,tactical,classic] [--threads=N]
 *       [--cargo=cargo] [--target-dir=PATH] [--draw-value=0]
 *     Builds the campaign's missions (or the variants) into PREFIX.json, a
 *     simulator data export, with PREFIX.boards.json naming each board's
 *     mission, target and label; builds sim's balance binary with cargo;
 *     plays every ordered pairing of the pool N games on every board into
 *     PREFIX.pool.txt; prints the check.
 *   node tools/measure-campaign.js check [--draw-value=0] PREFIX...
 *     Pools runs by board label (the same variant on several dice seeds)
 *     and prints the check.
 *   --draw-value is what a draw adds to a Union's rate in the checks: 0, the
 *   approved rule (a draw is not a win), or 0.5. The check also lists every
 *   pairing's wins, draws and losses, mean rounds and first-attack round.
 *   node tools/measure-campaign.js view --specs=PATH [--variants=PATH] [--missions=1,11]
 *     Prints each board: units as roster codes (Union upper case), camps @,
 *     factories &.
 *
 * The specs file exports one campaign in the format of
 * balance-campaign-specs.js, plus `checks` (the acceptance rule) and a
 * `target` per mission; teaching-campaign-specs.js is the example. A
 * variants file exports [{m, label, ...fields}]: mission m (1-based) with
 * those spec fields replaced. When the specs file exports `terrain(spec)`,
 * each board's `draw` is rebuilt from its fields, so a variant can name a
 * new `rough` seed alone. The pool's first bot must be marshal: the curve
 * is Marshal self-play, and each other bot's Union plays Marshal's Xenon.
 */
"use strict";
const fs = require("node:fs"), path = require("node:path"), {spawnSync} = require("node:child_process");
const root = path.resolve(__dirname, "..");
const {build} = require("./build-balance-campaigns.js");

function fail(text) { console.error("measure-campaign: " + text); process.exit(1); }

function parseFlags(args, known) {
  const flags = {}, rest = [];
  for (const a of args) {
    if (!a.startsWith("--")) { rest.push(a); continue; }
    const eq = a.indexOf("=");
    if (eq < 0) fail(a + " needs a value: --name=value");
    const k = a.slice(2, eq);
    if (!known.includes(k)) fail("unknown option --" + k);
    flags[k] = a.slice(eq + 1);
  }
  return {flags, rest};
}
const need = (flags, k) => { if (flags[k] === undefined) fail("--" + k + " is required"); return flags[k]; };
const whole = (text, k) => { if (!/^[1-9]\d*$/.test(text)) fail("--" + k + " must be a positive whole number"); return Number(text); };

function loadCampaign(specsPath) {
  const mod = require(path.resolve(specsPath));
  if (!Array.isArray(mod) || mod.length !== 1) fail(specsPath + " must export exactly one campaign");
  const campaign = mod[0];
  const c = campaign.checks;
  if (!c) fail(specsPath + ": the campaign has no `checks`");
  for (const k of ["curve", "early", "earlyMin", "gap", "lateFrom", "lateMax"])
    if (typeof c[k] !== "number") fail(specsPath + ": checks." + k + " must be a number");
  campaign.levels.forEach((s, i) => { if (typeof s.target !== "number") fail(specsPath + ": mission " + (i + 1) + " has no numeric target"); });
  return {campaign, terrain: mod.terrain};
}

// Each board: {m, label, spec}. Missions as specified unless a variants file is given.
function boardsOf(flags) {
  const {campaign, terrain} = loadCampaign(need(flags, "specs"));
  let list = campaign.levels.map((s, i) => ({m: i + 1, label: (i + 1) + " " + s.name}));
  if (flags.variants !== undefined) {
    list = require(path.resolve(flags.variants));
    if (!Array.isArray(list) || !list.length) fail(flags.variants + " must export a non-empty array of variants");
  }
  const labels = new Set();
  const boards = list.map(v => {
    const {m, label, ...fields} = v;
    if (!Number.isInteger(m) || m < 1 || m > campaign.levels.length) fail("variant " + JSON.stringify(label) + ": m must be a mission number from 1 to " + campaign.levels.length);
    if (typeof label !== "string" || !label) fail("variant of mission " + m + " has no label");
    if (/\s\|\s/.test(label)) fail("label " + JSON.stringify(label) + " contains ' | '");
    if (labels.has(label)) fail("two boards are labelled " + JSON.stringify(label));
    labels.add(label);
    const spec = Object.assign({}, campaign.levels[m - 1], fields);
    if (terrain && fields.draw === undefined) spec.draw = terrain(spec);
    return {m, label, spec, built: build(campaign, spec, m - 1)};
  });
  return {campaign, boards};
}

function measure(args) {
  const {flags} = parseFlags(args, ["specs", "variants", "out", "games", "seed", "pool", "threads", "cargo", "target-dir", "draw-value"]);
  const out = path.resolve(need(flags, "out")), games = whole(need(flags, "games"), "games"), seed = need(flags, "seed");
  const pool = (flags.pool === undefined ? "marshal,tactical,classic" : flags.pool).split(",");
  if (pool[0] !== "marshal" || pool.length < 2 || new Set(pool).size !== pool.length) fail("--pool must start with marshal and name two or more different bots");
  const check = spawnSync(process.execPath, [path.join(root, "tools/sim/export-data.cjs"), "--check"], {stdio: "inherit"});
  if (check.status !== 0) fail("the committed simulator export is stale; the boards would be measured under other rules or units");
  const {campaign, boards} = boardsOf(flags);
  const data = JSON.parse(fs.readFileSync(path.join(root, "sim/data/game-data.json"), "utf8"));
  data.boards = boards.map(b => ({name: b.label, grid: b.built.grid, buildings: b.built.buildings, units: b.built.units}));
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out + ".json", JSON.stringify(data) + "\n");
  fs.writeFileSync(out + ".boards.json", JSON.stringify({campaign: campaign.id, checks: campaign.checks, pool,
    boards: boards.map(b => ({mission: b.m, target: b.spec.target, label: b.label}))}, null, 1) + "\n");
  const cargo = flags.cargo === undefined ? "cargo" : flags.cargo;
  const targetArgs = flags["target-dir"] === undefined ? [] : ["--target-dir", path.resolve(flags["target-dir"])];
  const compiled = spawnSync(cargo, ["build", "--release", "--locked", "--bin", "balance", ...targetArgs], {cwd: path.join(root, "sim"), stdio: "inherit"});
  if (compiled.error) fail("cannot run cargo as " + JSON.stringify(cargo) + " (" + compiled.error.message + "); pass --cargo=PATH");
  if (compiled.status !== 0) fail("cargo build failed");
  const binary = path.join(flags["target-dir"] === undefined ? path.join(root, "sim/target") : path.resolve(flags["target-dir"]), "release/balance");
  if (!fs.existsSync(binary)) fail("cargo built, but " + binary + " does not exist");
  const n = pool.length;
  const run = spawnSync(binary, ["--data=" + out + ".json", "--pool=" + pool.join(","), "--boards=0-" + (boards.length - 1),
    "--games=" + n * n * games, "--seed=" + seed, "--draws=pairs", "--pair-rounds=yes", ...(flags.threads === undefined ? [] : ["--threads=" + whole(flags.threads, "threads")])],
    {stdio: ["ignore", "pipe", "inherit"], maxBuffer: 1 << 26, encoding: "utf8"});
  if (run.error) fail("balance did not run: " + run.error.message);
  if (run.status !== 0) fail("balance exited with status " + run.status);
  fs.writeFileSync(out + ".pool.txt", run.stdout);
  report([out], drawValueOf(flags));
}

// Per pairing, [row = Union's bot][column = Xenon's bot] = [Union wins, draws,
// games, sum of rounds, sum of first-attack rounds, games with an attack].
function readRun(prefix) {
  const meta = JSON.parse(fs.readFileSync(prefix + ".boards.json", "utf8"));
  const text = fs.readFileSync(prefix + ".pool.txt", "utf8"), cells = {}, kinds = ["pairs", "pair-draws", "pair-rounds", "pair-first"];
  const grid = s => s.split(" | ").map(r => r.split(" ").map(c => c.split("/").map(Number)));
  for (const line of text.split("\n")) {
    const p = line.match(/^(pairs|pair-draws|pair-rounds|pair-first) (\d+) (.*)$/);
    if (!p) continue;
    (cells[p[2]] = cells[p[2]] || {})[p[1]] = grid(p[3]);
  }
  const n = meta.pool.length, seed = (text.split("\n")[0].match(/; seed ([0-9a-f]+)$/) || [])[1];
  if (!seed) fail(prefix + ".pool.txt does not start with balance's header line");
  return {meta, seed, boards: meta.boards.map((b, i) => {
    const c = cells[i] || {};
    kinds.forEach(k => { if (!c[k]) fail(prefix + ".pool.txt has no " + k + " line for board " + i + " (" + b.label + "); measure with this tool's measure command"); });
    const r = Array.from({length: n}, (_, u) => Array.from({length: n}, (_, x) => {
      const [w, games] = c.pairs[u][x], [d, games2] = c["pair-draws"][u][x], [rounds] = c["pair-rounds"][u][x], [first, fought] = c["pair-first"][u][x];
      if (games !== games2) fail(prefix + ": board " + i + " pairs and pair-draws disagree on games played");
      return [w, d, games, rounds * games, first * fought, fought];
    }));
    return Object.assign({}, b, {r});
  })};
}

function report(prefixes, drawValue) {
  const runs = prefixes.map(readRun), first = runs[0].meta, seeds = new Set();
  for (const run of runs) {
    if (seeds.has(run.seed)) fail("two runs share the dice seed " + run.seed + "; pooling them would count the same games twice");
    seeds.add(run.seed);
    if (JSON.stringify(run.meta.checks) !== JSON.stringify(first.checks)) fail("the runs were checked against different rules");
    if (run.meta.pool.join() !== first.pool.join()) fail("the runs used different pools: " + run.meta.pool + " and " + first.pool);
  }
  const c = first.checks, pool = first.pool, weak = pool.slice(1), acc = new Map();
  for (const run of runs) for (const b of run.boards) {
    const a = acc.get(b.label);
    if (a && (a.mission !== b.mission || a.target !== b.target)) fail(b.label + ": the runs disagree on its mission or target");
    if (!a) { acc.set(b.label, {mission: b.mission, target: b.target, r: b.r.map(row => row.map(x => x.slice())), runs: 1}); continue; }
    b.r.forEach((row, u) => row.forEach((x, k) => x.forEach((v, j) => { a.r[u][k][j] += v; })));
    a.runs++;
  }
  const pct = (v, n) => Math.round(100 * v / n), pad = (x, w) => String(x).padStart(w);
  const rate = ([w, d, g]) => pct(w + drawValue * d, g), letter = bot => bot[0].toUpperCase();
  const boards = [...acc.entries()].sort((x, y) => x[1].mission - y[1].mission);
  console.log("Union rate % = (wins + " + drawValue + " x draws) / games" + (drawValue === 0 ? " (a draw is not a win)" : "") +
    "; draw % beside it. M = marshal; " + weak.map(w => letter(w) + " = " + w).join(", ") + ".");
  console.log("Checks on those rates: M self-play within " + c.curve + " of target (at least " + c.earlyMin + " on missions 1-" + c.early +
    "); each weak Union at least " + c.gap + " below M's against M's Xenon, and under " + c.lateMax + " from mission " + c.lateFrom + ".");
  console.log(" m  target    MvM  diff  draw  " + weak.map(w => `${letter(w)}vM  draw`).join("  ") + "  games  runs  verdict  board");
  let passed = 0;
  for (const [label, a] of boards) {
    const mm = rate(a.r[0][0]), ws = weak.map((w, i) => a.r[i + 1][0]);
    const bad = [];
    if (a.mission <= c.early ? mm < c.earlyMin : Math.abs(mm - a.target) > c.curve) bad.push("curve");
    if (ws.some(x => rate(x) > mm - c.gap)) bad.push("gap");
    if (a.mission >= c.lateFrom && ws.some(x => rate(x) >= c.lateMax)) bad.push("late");
    if (!bad.length) passed++;
    const diff = mm - a.target;
    console.log(`${pad(a.mission, 2)}  ${pad(a.target, 6)}  ${pad(mm, 5)}  ${pad((diff > 0 ? "+" : "") + diff, 4)}  ${pad(pct(a.r[0][0][1], a.r[0][0][2]), 4)}  ` +
      ws.map(x => `${pad(rate(x), 3)}  ${pad(pct(x[1], x[2]), 4)}`).join("  ") +
      `  ${pad(a.r[0][0][2], 5)}  ${pad(a.runs, 4)}  ${(bad.join(",") || "pass").padEnd(7)}  ${label}`);
  }
  console.log(passed + " of " + boards.length + " boards pass.");
  console.log("");
  console.log("Every pairing, Union's bot first: Union wins / draws / Union losses in %, mean rounds, mean round of the first attack (games with one).");
  for (const [label, a] of boards) pool.forEach((u, i) => {
    const cells = pool.map((x, k) => {
      const [w, d, g, rounds, firstSum, fought] = a.r[i][k];
      return `${letter(u)}v${letter(x)} ${pad(pct(w, g), 3)}/${pad(pct(d, g), 3)}/${pad(pct(g - w - d, g), 3)} ${pad((rounds / g).toFixed(1), 5)} ${pad(fought ? (firstSum / fought).toFixed(1) : "-", 4)}`;
    });
    console.log(`${pad(a.mission, 2)}  ${cells.join("   ")}   ${label}`);
  });
}

const drawValueOf = flags => {
  if (flags["draw-value"] === undefined) return 0;
  if (!["0", "0.5"].includes(flags["draw-value"])) fail("--draw-value is 0 (a draw is not a win) or 0.5 (a draw is half a win)");
  return Number(flags["draw-value"]);
};

function view(args) {
  const {flags} = parseFlags(args, ["specs", "variants", "missions"]);
  const only = flags.missions === undefined ? null : flags.missions.split(",").map(x => whole(x, "missions"));
  const code = {CHARLIE:"C",KILROY:"K",PANTHER:"P",BISON:"B",LENET:"L",POLAR:"O",GRIZZLY:"G",SLAGGER:"S",TITAN:"T",GIANT:"J",
    HADRIAN:"H",OCTOPUS:"U",ATLAS:"A",RABBIT:"R",LYNX:"X",MULE:"M",PELICAN:"Q",SEEKER:"E",HAWKEYE:"W",TRIGGER:"Z",EAGLE:"D",FALCON:"F",HUNTER:"N"};
  for (const b of boardsOf(flags).boards) {
    if (only && !only.includes(b.m)) continue;
    const g = b.built.grid.map(r => r.replace(/B/g, "@").replace(/F/g, "&").split(""));
    b.built.units.forEach(u => { g[u.y][u.x] = u.o ? code[u.t].toLowerCase() : code[u.t]; });
    const stock = b.built.buildings.filter(x => x.stored).map(x => x.col + "," + x.row + (x.owner < 0 ? " neutral " : x.owner ? " xenon " : " union ") + x.stored.map(t => code[t]).join(""));
    console.log(`${b.label}  ${b.built.grid[0].length}x${b.built.grid.length}  target ${b.spec.target}${stock.length ? "  | " + stock.join(" | ") : ""}`);
    // Odd columns sit half a hex lower: print them on alternate half-lines.
    g.forEach(r => {
      console.log(" " + r.map((ch, x) => x % 2 ? " " : ch).join(" "));
      console.log(" " + r.map((ch, x) => x % 2 ? ch : " ").join(" "));
    });
  }
}

const [command, ...args] = process.argv.slice(2);
if (command === "measure") measure(args);
else if (command === "check") {
  const {flags, rest} = parseFlags(args, ["draw-value"]);
  if (!rest.length) fail("check needs one or more run prefixes");
  report(rest.map(p => path.resolve(p)), drawValueOf(flags));
}
else if (command === "view") view(args);
else fail("the command is measure, check or view (see the header of tools/measure-campaign.js)");
