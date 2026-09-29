/* Random playouts: both sides pick uniformly from Game.legalCommands() with a
 * seeded generator until the game ends. Game k plays board list[k mod n] with
 * game seed (k+1) * 0x9e3779b1 XOR seed, which the engine stretches into the
 * dice's 256-bit seed, and picks with mulberry32 seeded by the game seed XOR
 * 0x9e3779b9. The fingerprint is FNV-1a over "stateHash,commands\n" per
 * game. sim/src/play.rs `random_game` plays the same games.
 */
"use strict";
const path = require("node:path"), root = path.resolve(__dirname, "../..");
const ENGINE = require(path.join(root, "js/engine.js")), COMBAT = require(path.join(root, "js/combat.js"));
const H = require("./state-hash.cjs"), boards = require("./boards.cjs");
module.exports = function playouts(games, seed, list) {
  let fingerprint = 2166136261, commands = 0;
  for (let k = 0; k < games; k++) {
    const gameSeed = (Math.imul(k + 1, 0x9e3779b1) ^ seed) >>> 0;
    const g = new ENGINE.Game(boards[list[k % list.length]], {seed: gameSeed}), base = H.firstId(g) - 1;
    const pick = COMBAT.makeRng((gameSeed ^ 0x9e3779b9) >>> 0);
    let n = 0;
    while (g.winner === null) {
      const legal = g.legalCommands(), c = legal[Math.floor(pick() * legal.length)];
      g[c[0]].apply(g, c[1]);
      n++;
    }
    commands += n;
    fingerprint = H.fnv(fingerprint, H.stateHash(g, base) + "," + n + "\n");
  }
  return {fingerprint, commands};
};
