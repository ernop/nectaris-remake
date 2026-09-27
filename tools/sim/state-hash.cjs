/* Canonical fingerprint of everything in a match that affects future play,
 * shared by the JavaScript lock test and the Rust simulator (sim/), which
 * must build the same text byte for byte.
 *
 * Text: "T<turn>;P<currentPlayer>;F<firstPlayer>;L<turnLimit>;W<winner or ->;
 * R<winReason or ->;G<rng state>", then every field unit in board order as
 * "u<unit>" followed by its cargo, each as "c<unit>", then every building in
 * insertion order as "b<col>,<row>,<owner>,<stored ids joined by +>" followed
 * by its stored units as "s<unit>". Parts are joined by ";".
 * <unit> is id,typeId,player,col,row,strength,exp,movePointsLeft, then the
 * flags moved, shifted, attacked, attackSpent, transferUsed, inFactory as 0/1,
 * then carriedBy (0 when not carried) and cargo ids joined by "+".
 * Unit ids are written minus `base`: a match numbers its units consecutively
 * from a process-wide counter, so base = (first unit id) - 1 numbers them
 * from 1 in creation order in every process and in the Rust simulator.
 * The event log is display-only and not included; replaying the commands in
 * JavaScript rebuilds it. The hash is 32-bit FNV-1a over the UTF-16 code
 * units of the text, as unsigned.
 */
"use strict";
function flag(value) { return value ? 1 : 0; }
function stateText(game, base) {
  base = base || 0;
  function id(n) { return n ? n - base : 0; }
  function unitText(u) {
    return [id(u.id), u.typeId, u.player, u.col, u.row, u.strength, u.exp, u.movePointsLeft, flag(u.moved), flag(u.shifted),
      flag(u.attacked), flag(u.attackSpent), flag(u.transferUsed), flag(u.inFactory), id(u.carriedBy),
      u.cargo.map(function (c) { return id(c.id); }).join("+")].join(",");
  }
  var parts = ["T" + game.turn, "P" + game.currentPlayer, "F" + game.firstPlayer, "L" + game.turnLimit,
    "W" + (game.winner === null ? "-" : game.winner), "R" + (game.winReason || "-"), "G" + game.rng.getState()];
  function cargo(u) { u.cargo.forEach(function (c) { parts.push("c" + unitText(c)); cargo(c); }); }
  game.units.forEach(function (u) { parts.push("u" + unitText(u)); cargo(u); });
  Object.keys(game.buildings).forEach(function (key) {
    var b = game.buildings[key];
    parts.push("b" + [b.col, b.row, b.owner, b.stored.map(function (s) { return id(s.id); }).join("+")].join(","));
    b.stored.forEach(function (s) { parts.push("s" + unitText(s)); cargo(s); });
  });
  return parts.join(";");
}
function stateHash(game, base) {
  var text = stateText(game, base), h = 2166136261;
  for (var i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
// Smallest unit id in a freshly built match; ids run consecutively from it.
function firstId(game) {
  var min = Infinity;
  function see(u) { min = Math.min(min, u.id); u.cargo.forEach(see); }
  game.units.forEach(see);
  Object.values(game.buildings).forEach(function (b) { b.stored.forEach(see); });
  return min;
}
module.exports = {stateText: stateText, stateHash: stateHash, firstId: firstId};
