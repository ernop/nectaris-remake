/* Nectaris remake — terrain definitions.
 *
 * Defense percentages follow the published manual values (plain 5%, road 0%,
 * wasteland 30%, valley 0%, mountain 40%, hill 20%, bridge 0%, factory 0%
 * (repairs instead), base 35%).
 *
 * Movement costs are per movement class. `null` = impassable for that class.
 * Air units always pay 1 and receive no terrain defense bonus.
 * Costs are a reconstruction of observed original behavior; they live here as
 * plain data so custom rule sets can override them.
 */
"use strict";

var TERRAIN = {
  plain:    { ch: ".", name: "Plains",    def: 5,  cost: { foot: 1, wheels: 2, treads: 1 }, color: "#b8b09a" },
  road:     { ch: "-", name: "Road",      def: 0,  cost: { foot: 1, wheels: 1, treads: 1 }, color: "#8d8578" },
  waste:    { ch: "w", name: "Wasteland", def: 30, cost: { foot: 2, wheels: 4, treads: 2 }, color: "#9a8a6e" },
  hill:     { ch: "h", name: "Hills",     def: 20, cost: { foot: 2, wheels: 3, treads: 2 }, color: "#a5946a" },
  mountain: { ch: "M", name: "Mountains", def: 40, cost: { foot: 3, wheels: null, treads: null }, color: "#7d6b52" },
  valley:   { ch: "v", name: "Valley",    def: 0,  cost: { foot: 2, wheels: null, treads: null }, color: "#5c5548" },
  bridge:   { ch: "=", name: "Bridge",    def: 0,  cost: { foot: 1, wheels: 1, treads: 1 }, color: "#97918a" },
  factory:  { ch: "F", name: "Factory",   def: 0,  cost: { foot: 1, wheels: 1, treads: 1 }, color: "#c8c2b4", building: true, repairs: true },
  base:     { ch: "B", name: "Base",      def: 35, cost: { foot: 1, wheels: 1, treads: 1 }, color: "#c8c2b4", building: true, repairs: true },
};

var TERRAIN_BY_CHAR = {};
(function () {
  for (var k in TERRAIN) { TERRAIN[k].id = k; TERRAIN_BY_CHAR[TERRAIN[k].ch] = TERRAIN[k]; }
})();

/* Movement cost for a unit's movement class on a terrain. Air = always 1. */
function terrainCost(terr, moveType) {
  if (moveType === "air") return 1;
  var c = terr.cost[moveType];
  return (c === undefined || c === null) ? null : c;
}

if (typeof module !== "undefined") module.exports = { TERRAIN: TERRAIN, TERRAIN_BY_CHAR: TERRAIN_BY_CHAR, terrainCost: terrainCost };
