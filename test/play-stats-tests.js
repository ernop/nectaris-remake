/* Play statistics (PRODUCT "Play statistics"): every published page loads the
 * module, and an AI-only match sends no game event. The events of matches
 * played through the menu are checked in outcome-menu-tests.js. */
"use strict";
module.exports = function (ok) {
  var fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
  var root = path.join(__dirname, ".."), stats = {module: {exports: {}}};
  vm.runInNewContext(fs.readFileSync(path.join(root, "js/fuseki-stats.js"), "utf8"), stats);
  ok(stats.module.exports.ENDPOINTS["nectaris-remake.fuseki.net"] === "/_event",
    "the statistics module sends from the hosted site to that site's own /_event");
  var pages = JSON.parse(fs.readFileSync(path.join(root, "deploy/runtime-files.json"), "utf8"))
    .filter(function (name) { return /\.html$/.test(name); });
  ok(pages.length >= 5 && pages.every(function (name) {
    return /<script src="js\/fuseki-stats\.js\?v=[^"]+"><\/script>/.test(fs.readFileSync(path.join(root, name), "utf8"));
  }), "every published page loads the play statistics module");

  var T = require("../js/ai-tournament.js"), calls = 0, saved = {window: global.window, FusekiStats: global.FusekiStats};
  var tiny = {name: "Immediate capture", grid: ["B....B", "......", "......"],
    buildings: [{col: 0, row: 0, owner: 0}, {col: 5, row: 0, owner: 1}],
    units: [{t: "CHARLIE", o: 0, x: 4, y: 0}, {t: "BISON", o: 1, x: 0, y: 2}]};
  global.FusekiStats = {game: function () { calls++; }};
  global.window = {FusekiStats: global.FusekiStats};
  try {
    var result = T.playSync(T.fixture(T.normalize({opponents: ["classic"], maps: [tiny]}), 0));
    ok(result.winner !== null && calls === 0, "an AI-only tournament match ends without sending a game event");
  } finally {
    Object.keys(saved).forEach(function (key) {
      if (saved[key] === undefined) delete global[key]; else global[key] = saved[key];
    });
  }
};
