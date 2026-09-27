/* Levels, custom units and recorded games arrive from files and web addresses;
 * their numbers reach the page's markup, so malformed fields must be refused. */
"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var UNITS = require("../js/data-units.js");
  var UNIT_VIEW = require("../js/unit-view.js");
  var MARKUP = "0'><meta http-equiv='refresh' content='0;url=https://example.com/'>";

  function level(overrides) {
    return Object.assign({name: "Import check", grid: [".F..", "...."],
      buildings: [{col: 1, row: 0, owner: 0, stored: ["CHARLIE"]}],
      units: [{t: "CHARLIE", o: 0, x: 0, y: 0}, {t: "BISON", o: 1, x: 3, y: 1}]}, overrides);
  }
  function rejects(fn, pattern, label) {
    try { fn(); } catch (error) {
      ok(pattern.test(error.message), label + ": wrong error " + JSON.stringify(error.message));
      return;
    }
    ok(false, label + ": accepted");
  }

  var game = new ENGINE.Game(level({}), {seed: 1});
  ok(game.units.length === 2, "a well-formed level still constructs");
  ok(!/<meta/.test(UNIT_VIEW.html(game.units[0])), "unit labels of a checked level hold no injected markup");

  rejects(function () { new ENGINE.Game(level({units: [{t: "CHARLIE", o: MARKUP, x: 0, y: 0}]})); },
    /Unit 1 side \(o\)/, "markup in a unit's side");
  rejects(function () { new ENGINE.Game(level({units: [{t: "CHARLIE", o: 0, x: 0, y: 0, str: MARKUP}]})); },
    /Unit 1 strength \(str\)/, "markup in a unit's strength");
  rejects(function () { new ENGINE.Game(level({units: [{t: "CHARLIE", o: 0, x: 0, y: 0, exp: "8"}]})); },
    /Unit 1 experience \(exp\)/, "text in a unit's experience");
  rejects(function () { new ENGINE.Game(level({units: [{t: "CHARLIE", o: 0, x: 4, y: 0}]})); },
    /Unit 1 column \(x\)/, "a unit off the map");
  rejects(function () { new ENGINE.Game(level({units: [{t: ["CHARLIE"], o: 0, x: 0, y: 0}]})); },
    /Unit 1 must name its unit type/, "a unit type that is not a name");
  rejects(function () { new ENGINE.Game(level({buildings: [{col: 1, row: 0, owner: MARKUP}]})); },
    /Building 1 owner/, "markup in a building's owner");
  rejects(function () { new ENGINE.Game(level({buildings: [{col: "1", row: 0, owner: 0}]})); },
    /Building 1 column/, "a building column given as text");
  rejects(function () { new ENGINE.Game(level({buildings: [{col: 1, row: 0, owner: 0, stored: [{t: "CHARLIE", str: 0}]}]})); },
    /Building 1 stored unit 1 strength/, "a stored unit without strength");
  rejects(function () { new ENGINE.Game(level({grid: [[".", "B"], [".", "."]]})); },
    /grid must be rows of terrain letters/, "grid rows that are not text");
  rejects(function () { new ENGINE.Game(level({turnLimit: "50"})); },
    /turn limit/, "a turn limit given as text");
  rejects(function () { new ENGINE.Game(level({grid: [".B..", "...."]})); },
    /only factories can/, "units stored in a base");

  rejects(function () { UNITS.mergeUnitTypes({IMPORTGOOD: {name: "Good", move: 3}, IMPORTBAD: {def: "10<b>"}}); },
    /Custom unit IMPORTBAD field def must be a whole number/, "markup in a custom unit's defense");
  ok(!UNITS.UNIT_TYPES.IMPORTGOOD, "a rejected custom-unit file adds none of its units");
  rejects(function () { UNITS.mergeUnitTypes({IMPORTBAD: {cls: "tank' onclick='x"}}); },
    /unknown cls/, "an unknown custom unit class");
  rejects(function () { UNITS.mergeUnitTypes({IMPORTBAD: {cargoTypes: "CHARLIE"}}); },
    /cargoTypes must be a list of names/, "a cargo list given as text");
  rejects(function () { UNITS.mergeUnitTypes([{move: 3}]); },
    /Custom units must be an object/, "custom units given as a list");
  UNITS.mergeUnitTypes(JSON.parse('{"__proto__": {"name": "Proto", "move": 2}}'));
  ok(UNITS.UNIT_TYPES.__PROTO__ && ({}).move === undefined, "a __proto__ unit key stays an ordinary unit id");
  delete UNITS.UNIT_TYPES.__PROTO__;

  var snapshot = new ENGINE.Game(level({}), {seed: 1}).snapshot();
  ok(ENGINE.Game.restore(snapshot).units.length === 2, "a well-formed recorded game still restores");
  var tampered = JSON.parse(JSON.stringify(snapshot));
  tampered.units[0].player = MARKUP;
  rejects(function () { ENGINE.Game.restore(tampered); }, /Saved match contains invalid units/, "markup in a recorded unit's side");
  tampered = JSON.parse(JSON.stringify(snapshot));
  tampered.units[0].strength = MARKUP;
  rejects(function () { ENGINE.Game.restore(tampered); }, /Saved match contains invalid units/, "markup in a recorded unit's strength");
  tampered = JSON.parse(JSON.stringify(snapshot));
  tampered.buildings[Object.keys(tampered.buildings)[0]].owner = MARKUP;
  rejects(function () { ENGINE.Game.restore(tampered); }, /Saved match contains invalid buildings/, "markup in a recorded building's owner");
  tampered = JSON.parse(JSON.stringify(snapshot));
  tampered.turnLimit = MARKUP;
  rejects(function () { ENGINE.Game.restore(tampered); }, /invalid or from an older version/, "markup in a recorded turn limit");
};
