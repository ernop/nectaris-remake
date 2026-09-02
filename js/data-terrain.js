/* Nectaris remake — terrain definitions.
 *
 * Additive defense values follow the published manual (plain 5, road 0,
 * wasteland 30, valley 0, mountain 40, hill 20, bridge 0, factory 0
 * (repairs instead), base 35).
 *
 * Movement costs follow the per-chassis table published on BASE NECTARIS's
 * terrain page (tactics/chikei/), adopted 2026-09-01 in place of the earlier
 * reconstruction. That page's defense column matches ours exactly, which is
 * what made its movement column worth trusting; see MECHANICS.md.
 *
 * There are three ground movement classes, plus air. The key names are
 * historical — they describe the original's chassis groupings, not literal
 * running gear, and a unit's `cls` is independent of them:
 *
 *   foot    the two capturing infantry (Charlie, Kilroy)
 *   treads  the fighting vehicles: tanks, missile buggies, self-propelled
 *           guns and anti-air vehicles. The buggies ride on wheels but pay
 *           the vehicle rates.
 *   wheels  the two carriers, Panther and Mule, which pay much more off-road
 *           and cannot enter wasteland at all.
 *
 * `null` = impassable for that class. Air always pays 1 and gets no terrain
 * defense. `costsAllMovement` terrain can be entered only by spending every
 * remaining movement point. `deployable` terrain is where a transport may
 * set down a unit that can only be positioned by transport (mines, Atlas).
 * All of it is plain data so custom rule sets can override it.
 */
"use strict";

var TERRAIN = {
  plain:    { ch: ".", name: "Plains",    def: 5,  cost: { foot: 1, wheels: 2, treads: 1 }, color: "#b8b09a", deployable: true },
  road:     { ch: "-", name: "Road",      def: 0,  cost: { foot: 1, wheels: 1, treads: 1 }, color: "#8d8578", deployable: true },
  waste:    { ch: "w", name: "Wasteland", def: 30, cost: { foot: 2, wheels: null, treads: 3 }, color: "#9a8a6e" },
  hill:     { ch: "h", name: "Hills",     def: 20, cost: { foot: 1, wheels: 4, treads: 2 }, color: "#a5946a" },
  mountain: { ch: "M", name: "Mountains", def: 40, cost: { foot: 2, wheels: null, treads: null }, color: "#7d6b52" },
  valley:   { ch: "v", name: "Valley",    def: 0,  cost: { foot: 1, wheels: null, treads: null }, color: "#5c5548", costsAllMovement: true },
  bridge:   { ch: "=", name: "Bridge",    def: 0,  cost: { foot: 1, wheels: 1, treads: 1 }, color: "#97918a", deployable: true },
  factory:  { ch: "F", name: "Factory",   def: 0,  cost: { foot: 1, wheels: 1, treads: 1 }, color: "#c8c2b4", building: true, repairs: true, deployable: true },
  base:     { ch: "B", name: "Base",      def: 35, cost: { foot: 1, wheels: 1, treads: 1 }, color: "#c8c2b4", building: true, repairs: true },
};

var TERRAIN_BY_CHAR = {};
(function () {
  for (var k in TERRAIN) { TERRAIN[k].id = k; TERRAIN_BY_CHAR[TERRAIN[k].ch] = TERRAIN[k]; }
})();

/* Movement cost for a unit's movement class on a terrain. Air = always 1.
 * `unitType` is optional and only consulted for per-unit exceptions to its
 * chassis rate — the Giant is too heavy for wasteland even though every other
 * tracked vehicle can cross it. Returns null when the hex cannot be entered. */
function terrainCost(terr, moveType, unitType) {
  if (unitType && unitType.cannotEnter && unitType.cannotEnter.indexOf(terr.id) >= 0) return null;
  if (moveType === "air") return 1;
  var c = terr.cost[moveType];
  return (c === undefined || c === null) ? null : c;
}

if (typeof module !== "undefined") module.exports = { TERRAIN: TERRAIN, TERRAIN_BY_CHAR: TERRAIN_BY_CHAR, terrainCost: terrainCost };
