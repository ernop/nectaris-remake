/* Reproducible, dependency-free algorithm benchmarks.
 * node tools/benchmark-performance.js > /tmp/nectaris-performance.json
 * NECTARIS_BENCH_ROOT can point at a saved source tree for before/after runs.
 * Times are medians, not test assertions. Checksums must match across versions.
 */
"use strict";
var path = require("node:path"), crypto = require("node:crypto");
var performance = require("node:perf_hooks").performance;
var root = process.env.NECTARIS_BENCH_ROOT || path.join(__dirname, "..");
var ENGINE = require(path.join(root, "js/engine.js"));
var AI = require(path.join(root, "js/ai.js"));
var maps = require(path.join(root, "js/data-maps.js"))
  .concat(require(path.join(root, "js/data-advanced-maps.js")),
    require(path.join(root, "js/data-expansion-maps.js")),
    require(path.join(root, "js/data-basenectaris-maps.js")).BASE_NECTARIS_LEVELS);
var extraMaps = path.join(root, "js/data-ai-maps.js");
if (require("node:fs").existsSync(extraMaps)) maps = maps.concat(require(extraMaps));

function digest(value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function benchmark(name, run) {
  var checksum = run(), times = [];
  for (var i = 0; i < 5; i++) {
    var start = performance.now(), next = run();
    times.push(performance.now() - start);
    if (next !== checksum) throw new Error(name + " is nondeterministic");
  }
  times.sort(function (a, b) { return a - b; });
  return { name: name, medianMs: +times[2].toFixed(3), checksum: checksum };
}
function state(game, firstId) {
  // Unit IDs increase between games. Normalize IDs, retaining log/RNG/cargo.
  return JSON.parse(JSON.stringify(game.snapshot(), function (key, value) {
    if (["id", "unit", "into", "a", "d", "attacker", "defender", "carriedBy"].includes(key) && typeof value === "number") return value - firstId;
    if (["field", "cargo", "stored"].includes(key) && Array.isArray(value)) {
      return value.map(function (v) { return typeof v === "number" ? v - firstId : v; });
    }
    return value;
  }));
}
var results = [];
results.push(benchmark("AI: four half-turns on every included map", function () {
  return digest(maps.map(function (map, index) {
    var game = new ENGINE.Game(map, { seed: 1000 + index });
    var firstId = Math.min.apply(null, game.snapshot().units.map(function (u) { return u.id; }));
    for (var turn = 0; turn < 4 && game.winner === null; turn++) {
      AI.playTurn(game, game.currentPlayer); game.endTurn();
    }
    return state(game, firstId);
  }));
}));
var games = maps.map(function (map) { return new ENGINE.Game(map, { seed: 42 }); });
results.push(benchmark("Movement: every initial field unit on every map", function () {
  return digest(games.map(function (g) {
    return g.units.map(function (u) { return g.movementRange(u); });
  }));
}));
var forecastGame = new ENGINE.Game({grid: ["....", "....", "...."], units: [
  {t: "BISON", o: 0, x: 1, y: 1}, {t: "POLAR", o: 1, x: 2, y: 1}
]}, {seed: 42});
var attacker = forecastGame.units[0], defender = forecastGame.units[1];
var preview = COMBAT.preview(forecastGame, attacker, defender);
var coldStart = performance.now();
COMBAT.forecast(attacker, defender, preview);
var coldForecastMs = +(performance.now() - coldStart).toFixed(3);
results.push(benchmark("Forecast: 64 distinct strength matchups, 100,000 seeds each", function () {
  var projections = [];
  for (var a = 1; a <= 8; a++) for (var d = 1; d <= 8; d++) {
    attacker.strength = a; defender.strength = d;
    projections.push(COMBAT.forecast(attacker, defender, preview));
  }
  return digest(projections);
}));
console.log(JSON.stringify({node: process.version, maps: maps.length, coldForecastMs: coldForecastMs, results: results}, null, 2));
