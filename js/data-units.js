/* Nectaris remake — unit roster.
 *
 * Stats (move / range / ground attack / air attack / defense) follow the
 * community-documented tables for the original TG-16 game. Stats are
 * functional game data; all art in this project is original and procedural.
 *
 * Fields:
 *   name       display name (designation)
 *   cls        infantry | tank | air | artillery | buggy | antiair | transport | mine
 *   move       movement points (0 = immobile)
 *   moveType   foot | wheels | treads | air
 *   rmin/rmax  attack range (hex distance). rmax 0 = cannot attack.
 *   atkG/atkA  per-strength-point attack vs ground / vs air (0 = cannot hit)
 *   def        per-strength-point defense
 *   capture    can capture factories and bases
 *   moveAfterAttack  may spend leftover movement after attacking (buggies)
 *   cargo      number of units this transport can carry (ground units only)
 *   placeByTransport  can only be positioned via transport (from a factory)
 *
 * Ranged units (rmax > 1) may move OR attack in a turn, never both, and they
 * neither give nor receive counterattacks. This whole table is data-driven:
 * the editor can merge user-defined unit types on top of it.
 */
"use strict";

var UNIT_TYPES = {
  // Infantry — the only capturers.
  CHARLIE: { name: "Charlie GX-77", cls: "infantry", move: 3, moveType: "foot",   rmin: 1, rmax: 1, atkG: 10, atkA: 10, def: 4,  capture: true },
  KILROY:  { name: "Kilroy GX-87",  cls: "infantry", move: 2, moveType: "foot",   rmin: 1, rmax: 1, atkG: 40, atkA: 10, def: 10, capture: true },
  PANTHER: { name: "Panther CBX-1", cls: "infantry", move: 9, moveType: "wheels", rmin: 1, rmax: 1, atkG: 10, atkA: 10, def: 8,  capture: true },

  // Tanks / armored ground.
  BISON:   { name: "Bison S-61",    cls: "tank", move: 6, moveType: "treads", rmin: 1, rmax: 1, atkG: 50, atkA: 0,  def: 40 },
  LENET:   { name: "Lenet TT-1",    cls: "tank", move: 5, moveType: "treads", rmin: 1, rmax: 1, atkG: 45, atkA: 0,  def: 30 },
  POLAR:   { name: "Polar PT-6",    cls: "tank", move: 4, moveType: "treads", rmin: 1, rmax: 1, atkG: 60, atkA: 0,  def: 60 },
  GRIZZLY: { name: "Grizzly T-79",  cls: "tank", move: 4, moveType: "treads", rmin: 1, rmax: 1, atkG: 70, atkA: 0,  def: 50 },
  SLAGGER: { name: "Slagger GS-81", cls: "tank", move: 7, moveType: "treads", rmin: 1, rmax: 1, atkG: 50, atkA: 0,  def: 50 },
  TITAN:   { name: "Titan GT-86",   cls: "tank", move: 5, moveType: "treads", rmin: 1, rmax: 1, atkG: 60, atkA: 0,  def: 50 },
  GIANT:   { name: "Giant HMB-2",   cls: "tank", move: 2, moveType: "treads", rmin: 1, rmax: 1, atkG: 90, atkA: 40, def: 80 },

  // Aircraft — cost 1 per hex, no terrain defense.
  EAGLE:   { name: "Eagle AX-87",   cls: "air", move: 10, moveType: "air", rmin: 1, rmax: 1, atkG: 70, atkA: 20, def: 30 },
  FALCON:  { name: "Falcon FX-1",   cls: "air", move: 12, moveType: "air", rmin: 1, rmax: 1, atkG: 0,  atkA: 90, def: 30 },
  HUNTER:  { name: "Hunter EF-88",  cls: "air", move: 11, moveType: "air", rmin: 1, rmax: 1, atkG: 70, atkA: 70, def: 50 },

  // Artillery — ranged, move or attack, no counters either way.
  HADRIAN: { name: "Hadrian SG-4",  cls: "artillery", move: 4, moveType: "treads", rmin: 2, rmax: 5, atkG: 45, atkA: 0, def: 30 },
  OCTOPUS: { name: "Octopus MR-22", cls: "artillery", move: 4, moveType: "treads", rmin: 2, rmax: 4, atkG: 60, atkA: 0, def: 30 },
  ATLAS:   { name: "Atlas SS-80",   cls: "artillery", move: 0, moveType: "treads", rmin: 2, rmax: 6, atkG: 90, atkA: 0, def: 20, placeByTransport: true },

  // Missile buggies — may keep moving after attacking.
  RABBIT:  { name: "Rabbit MB-5",   cls: "buggy", move: 8, moveType: "wheels", rmin: 1, rmax: 1, atkG: 70, atkA: 10, def: 20, moveAfterAttack: true },
  LYNX:    { name: "Lynx MB-4",     cls: "buggy", move: 6, moveType: "wheels", rmin: 1, rmax: 1, atkG: 40, atkA: 10, def: 20, moveAfterAttack: true },

  // Anti-air.
  SEEKER:  { name: "Seeker AAG-4",  cls: "antiair", move: 6, moveType: "treads", rmin: 1, rmax: 1, atkG: 30, atkA: 65, def: 30 },
  HAWKEYE: { name: "Hawkeye MM107", cls: "antiair", move: 5, moveType: "treads", rmin: 2, rmax: 5, atkG: 0,  atkA: 85, def: 30 },

  // Transports — carry one ground unit each.
  MULE:    { name: "Mule NC-1",     cls: "transport", move: 6, moveType: "wheels", rmin: 1, rmax: 1, atkG: 10, atkA: 10, def: 10, cargo: 1 },
  PELICAN: { name: "Pelican C-61",  cls: "transport", move: 9, moveType: "air",    rmin: 0, rmax: 0, atkG: 0,  atkA: 0,  def: 10, cargo: 1 },

  // Mines — immobile, no attack, hard to crack, project ZOC like anything else.
  TRIGGER: { name: "Trigger M-77",  cls: "mine", move: 0, moveType: "treads", rmin: 0, rmax: 0, atkG: 0, atkA: 0, def: 80, placeByTransport: true },
};

(function () { for (var k in UNIT_TYPES) UNIT_TYPES[k].id = k; })();

/* Merge user-defined unit types (from the editor / custom JSON) over the
 * stock roster. Unknown fields pass through untouched. */
function mergeUnitTypes(customObj) {
  for (var k in customObj) {
    var id = k.toUpperCase();
    var def = customObj[k];
    def.id = id;
    if (!def.name) def.name = id;
    if (!def.cls) def.cls = "tank";
    if (def.rmin === undefined) def.rmin = def.rmax > 0 ? 1 : 0;
    UNIT_TYPES[id] = def;
  }
}

if (typeof module !== "undefined") module.exports = { UNIT_TYPES: UNIT_TYPES, mergeUnitTypes: mergeUnitTypes };
