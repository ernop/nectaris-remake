/* Behaviour lock shared with the Rust simulator (sim/): recorded games must
 * replay to the same state after every command, and the recorded bots must
 * choose the same commands. A deliberate rule or AI change regenerates
 * test/fixtures/sim-corpus.json.gz (see tools/sim/make-corpus.cjs) and
 * updates the Rust simulator in the same change. */
"use strict";
var fs = require("node:fs"), path = require("node:path"), zlib = require("node:zlib"), child = require("node:child_process");
module.exports = function (ok) {
  /* A separate process: earlier tests merge extra unit types into this one. */
  var exported = child.spawnSync(process.execPath, [path.join(__dirname, "../tools/sim/export-data.cjs"), "--check"], {encoding: "utf8"});
  ok(exported.status === 0, "sim/data/game-data.json matches the JavaScript data" + (exported.status === 0 ? "" : ": " + exported.stderr.trim()));
  var ENGINE = require("../js/engine.js"), T = require("../js/ai-tournament.js");
  var H = require("../tools/sim/state-hash.cjs"), boards = require("../tools/sim/boards.cjs");
  var corpus = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, "fixtures/sim-corpus.json.gz"))));
  ok(corpus.tournament === T.version, "the lock corpus was recorded under tournament protocol " + T.version);
  function shift(command, by) {
    return [command[0], command[1].map(function (a) { return a && typeof a === "object" && a.unit !== undefined ? {unit: a.unit + by} : a; })];
  }
  function fresh(game) {
    var map = boards[game.board];
    if (map.name !== game.name) throw new Error("Board " + game.board + " is " + map.name + ", not " + game.name);
    if (map.customUnits) mergeUnitTypes(map.customUnits);
    return new ENGINE.Game(map, {seed: game.seed});
  }
  var drift = null, commands = 0;
  corpus.games.forEach(function (game, n) {
    var g = fresh(game), base = H.firstId(g) - 1;
    if (!drift && H.stateHash(g, base) !== game.hashes[0]) drift = "game " + n + " (" + game.name + ") starts differently";
    game.commands.forEach(function (c, i) {
      if (drift) return;
      T.command(g, shift(c, base));
      commands++;
      if (H.stateHash(g, base) !== game.hashes[i + 1]) drift = "game " + n + " (" + game.name + ") differs after command " + i + " " + JSON.stringify(c);
    });
  });
  ok(!drift, corpus.games.length + " recorded games replay to the recorded state after every one of " + commands + " commands" + (drift ? ": " + drift : ""));
  var decided = corpus.games.filter(function (g) { return g.decide; }), changed = null;
  decided.forEach(function (game) {
    if (changed) return;
    var played = T.playSync({map: boards[game.board], seed: game.seed, players: game.players, maxRounds: game.maxRounds,
      work: game.work, opening: "original"});
    var base = H.firstId(ENGINE.Game.restore(played.initial)) - 1;
    var got = played.commands.map(function (c) { return JSON.stringify(shift(c, -base)); });
    for (var i = 0; i < Math.max(got.length, game.commands.length); i++) {
      if (got[i] !== JSON.stringify(game.commands[i])) {
        changed = game.players.join(" v ") + " on " + game.name + " chose " + got[i] + " at command " + i + ", recorded " + JSON.stringify(game.commands[i]);
        break;
      }
    }
  });
  ok(decided.length === 3 && !changed, "the recorded bots choose every recorded command again (" +
    decided.map(function (g) { return g.players.join(" v "); }).join(", ") + ")" + (changed ? ": " + changed : ""));
};
