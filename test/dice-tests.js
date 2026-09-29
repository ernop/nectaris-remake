/* Match dice: SHA-256 and ChaCha20 against published vectors, the seed rule,
 * saved dice, and that no bot rolls or reads the match's dice. */
"use strict";
var crypto = require("node:crypto");
module.exports = function (ok) {
  var COMBAT = require("../js/combat.js"), ENGINE = require("../js/engine.js");
  var AI = require("../js/ai.js"), OPENING = require("../js/ai-opening.js"), S = require("../js/ai-search.js");
  var T = require("../js/ai-tournament.js"), maps = require("../js/data-maps.js");
  function throws(f) { try { f(); } catch (e) { return true; } return false; }

  [["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
   ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
   ["abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"],
   ["a".repeat(1000000), "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"]].forEach(function (v) {
    ok(COMBAT.sha256(v[0]) === v[1], "SHA-256 matches the NIST vector for a " + v[0].length + "-character message");
  });
  var text = "nectaris-seed:Évolution 進化 " + "x".repeat(70);
  ok(COMBAT.sha256(text) === crypto.createHash("sha256").update(text, "utf8").digest("hex"),
    "SHA-256 hashes multi-byte text as UTF-8 across block boundaries");

  var key = new Uint32Array(8);
  for (var i = 0; i < 8; i++) key[i] = (4 * i) | (4 * i + 1) << 8 | (4 * i + 2) << 16 | (4 * i + 3) << 24;
  var block = Array.from(COMBAT.chachaBlock(key, 1, [0x09000000, 0x4a000000, 0]), function (w) { return ("0000000" + w.toString(16)).slice(-8); });
  ok(block.join(" ") === "e4e7f110 15593bd1 1fdd0f50 c47120a3 c7f4d1c7 0368c033 9aaa2204 4e6cd4c3 " +
    "466482d2 09aa9f07 05d7c214 a2028bd9 d19c12b5 b94e16de e883d0cb 4e3c50a2", "ChaCha20 matches the RFC 8439 2.3.2 block vector");
  var zero = COMBAT.makeDice("0".repeat(64)), words = [];
  for (i = 0; i < 16; i++) words.push(zero() * 4294967296);
  var bytes = [];
  words.forEach(function (w) { bytes.push(w & 255, w >>> 8 & 255, w >>> 16 & 255, w >>> 24 & 255); });
  ok(Buffer.from(bytes).toString("hex") === "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7" +
    "da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586", "the dice read the RFC 8439 A.1 keystream word by word");

  var seed = COMBAT.diceSeed(42);
  ok(seed === COMBAT.sha256("nectaris-seed:42") && COMBAT.diceSeed("42") === seed && COMBAT.diceSeed(seed) === seed,
    "a number or its text is stretched with SHA-256; 64 hex digits are used as they are");
  var fresh = [COMBAT.diceSeed(), COMBAT.diceSeed()];
  ok(/^[0-9a-f]{64}$/.test(fresh[0]) && fresh[0] !== fresh[1], "no seed draws a fresh 256-bit seed");
  [1.5, NaN, null, true, {}].forEach(function (bad) {
    ok(throws(function () { COMBAT.diceSeed(bad); }), "a seed of " + String(bad) + " is rejected");
  });
  var dice = COMBAT.makeDice(seed), run = [];
  for (i = 0; i < 40; i++) run.push(dice());
  var part = COMBAT.makeDice(seed);
  for (i = 0; i < 23; i++) part();
  var resumed = COMBAT.restoreDice(part.state()), rest = [];
  for (i = 23; i < 40; i++) rest.push(resumed());
  ok(JSON.stringify(rest) === JSON.stringify(run.slice(23)), "dice resume mid-block from their saved state");
  ["", seed, seed + "/0/3", seed + "/1/17", "0123/1/1", seed + "/x/1"].forEach(function (bad) {
    ok(throws(function () { COMBAT.restoreDice(bad); }), "invalid dice state " + JSON.stringify(bad.slice(-6)) + " is rejected");
  });

  var board = {name: "Dice", grid: ["......"], units: [{t: "BISON", o: 0, x: 1, y: 0}, {t: "POLAR", o: 1, x: 2, y: 0}]};
  var game = new ENGINE.Game(board, {seed: 7}), saved = game.snapshot(), again = ENGINE.Game.restore(saved);
  var a = game.attack(game.units[0], game.units[1]), b = again.attack(again.units[0], again.units[1]);
  ok(typeof saved.dice === "string" && saved.rngState === undefined && a.dmgToDefender === b.dmgToDefender &&
    a.dmgToAttacker === b.dmgToAttacker && game.rng.state() === again.rng.state(), "a restored match rolls the same dice");
  var old = Object.assign({}, saved, {rngState: 7});
  delete old.dice;
  ok(throws(function () { ENGINE.Game.restore(old); }), "a save with the old 32-bit generator state is rejected");
  var copy = ENGINE.Game.restore(S.publicSnapshot(game));
  ok(copy.snapshot().dice === null && throws(function () { copy.rng(); }), "a public copy has no dice to read or roll");

  /* Whole tournament games: only the engine's attack on the match rolls its
   * dice, once per attack plus once per counterattack, and no bot reads them. */
  var makeDice = COMBAT.makeDice, attack = ENGINE.Game.prototype.attack, createTurn = AI.createTurn, analyze = OPENING.analyze;
  var thinking = 0, draws = 0, expected = 0, stray = [];
  COMBAT.makeDice = function () {
    var inner = makeDice.apply(null, arguments), state = inner.state;
    var counted = function () {
      if (!counted.rolling) stray.push("roll outside the match's attack");
      draws++;
      return inner();
    };
    counted.counted = true;
    counted.state = function () {
      if (thinking) stray.push("dice read while a bot was thinking");
      return state();
    };
    return counted;
  };
  ENGINE.Game.prototype.attack = function () {
    if (!this.rng.counted) return attack.apply(this, arguments);
    this.rng.rolling = true;
    try {
      var result = attack.apply(this, arguments);
      expected += result.preview.counter ? 2 : 1;
      return result;
    } finally { this.rng.rolling = false; }
  };
  AI.createTurn = function () {
    var runner = createTurn.apply(this, arguments), next = runner.next;
    runner.next = function () { thinking++; try { return next.apply(runner, arguments); } finally { thinking--; } };
    return runner;
  };
  OPENING.analyze = function* () { thinking++; try { return yield* analyze.apply(this, arguments); } finally { thinking--; } };
  try {
    S.modes.forEach(function (mode) {
      draws = expected = 0;
      stray = [];
      var config = T.normalize({opponents: mode.id === "classic" ? ["classic"] : ["classic", mode.id], maps: [maps[0]],
        maxRounds: 3, work: "fast", opening: mode.id === "tactical" ? "offers" : "original"});
      var result = T.playSync(T.fixture(config, 0));
      ok(!stray.length && expected > 0 && draws === expected,
        mode.id + " plays a tournament game without rolling or reading the match dice (" + draws + " rolls for " + expected + " expected" +
        (stray.length ? "; " + stray[0] : "") + ", " + result.commands.length + " commands)");
    });
  } finally {
    COMBAT.makeDice = makeDice;
    ENGINE.Game.prototype.attack = attack;
    AI.createTurn = createTurn;
    OPENING.analyze = analyze;
  }
};
