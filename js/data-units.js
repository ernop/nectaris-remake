/* Nectaris remake — unit roster.
 *
 * Stats (move / ranges / ground attack / air attack / defense) follow the
 * published tables for the original game: BASE NECTARIS's unit page
 * (tactics/unit/) and the US-release tables (StrategyWiki "Military
 * Madness/Units", the TG-16 and PlayStation FAQs), which agree with each
 * other stat for stat. Names and designations are the US release's. Stats
 * are functional game data; all art in this project is original.
 *
 * Fields:
 *   name       display name (designation)
 *   cls        infantry | tank | air | artillery | buggy | antiair | transport | mine
 *   move       movement points (0 = immobile)
 *   moveType   foot | wheels | treads | air  (see js/data-terrain.js for
 *              what the three ground classes mean)
 *   rngG/rngA  maximum attack range against ground / air targets
 *              (0 = cannot attack that domain). A range above 1 means
 *              indirect fire, which cannot hit an adjacent hex: the band is
 *              2..rng. So the Lynx (rngG 2) hits ground targets only at
 *              exactly two hexes, and the Hawkeye (rngA 5) cannot shoot an
 *              adjacent aircraft.
 *   atkG/atkA  per-strength-point attack vs ground / vs air
 *   def        per-strength-point defense
 *   capture    can capture factories and bases
 *   moveOrFire may either move or fire in a turn, never both (the
 *              self-propelled guns and the Hawkeye). Independent of range:
 *              the Lynx fires indirectly and may still re-move.
 *   moveAfterAttack  may spend leftover movement after attacking (buggies)
 *   cargo      number of units this transport can carry (ground units only)
 *   placeByTransport  can only be positioned via transport (from a factory)
 *   cannotEnter      terrain ids this specific unit may never enter
 *
 * No unit gives or receives a counterattack in an indirect exchange: a
 * defender counters only in adjacent combat, and only when its own range
 * band against the attacker's domain includes distance 1. This whole table
 * is data-driven: the editor can merge user-defined unit types on top of it.
 */
"use strict";

var UNIT_TYPES = {
  // Infantry — the only capturers. Capturing a factory awards +4 EXP.
  CHARLIE: { name: "Charlie GX-77", cls: "infantry", move: 3, moveType: "foot",   rngG: 1, rngA: 1, atkG: 10, atkA: 10, def: 4,  capture: true },
  KILROY:  { name: "Kilroy GX-87",  cls: "infantry", move: 2, moveType: "foot",   rngG: 1, rngA: 1, atkG: 40, atkA: 10, def: 10, capture: true },
  PANTHER: { name: "Panther CBX-1", cls: "infantry", move: 9, moveType: "wheels", rngG: 1, rngA: 1, atkG: 10, atkA: 10, def: 8,  capture: true },

  // Tanks / armored ground.
  BISON:   { name: "Bison S-61",    cls: "tank", move: 6, moveType: "treads", rngG: 1, rngA: 0, atkG: 50, atkA: 0,  def: 40 },
  LENET:   { name: "Lenet TT-1",    cls: "tank", move: 5, moveType: "treads", rngG: 1, rngA: 0, atkG: 45, atkA: 0,  def: 30 },
  POLAR:   { name: "Polar PT-6",    cls: "tank", move: 4, moveType: "treads", rngG: 1, rngA: 0, atkG: 60, atkA: 0,  def: 60 },
  GRIZZLY: { name: "Grizzly T-79",  cls: "tank", move: 4, moveType: "treads", rngG: 1, rngA: 0, atkG: 70, atkA: 0,  def: 50 },
  SLAGGER: { name: "Slagger GS-81", cls: "tank", move: 7, moveType: "treads", rngG: 1, rngA: 0, atkG: 50, atkA: 0,  def: 50 },
  TITAN:   { name: "Titan GT-86",   cls: "tank", move: 5, moveType: "treads", rngG: 1, rngA: 0, atkG: 60, atkA: 0,  def: 50 },
  GIANT:   { name: "Giant HMB-2",   cls: "tank", move: 2, moveType: "treads", rngG: 1, rngA: 1, atkG: 90, atkA: 40, def: 80, cannotEnter: ["waste"] },

  // Aircraft — cost 1 per hex, no terrain defense.
  EAGLE:   { name: "Eagle AX-87",   cls: "air", move: 10, moveType: "air", rngG: 1, rngA: 1, atkG: 70, atkA: 20, def: 30 },
  FALCON:  { name: "Falcon FX-1",   cls: "air", move: 12, moveType: "air", rngG: 0, rngA: 1, atkG: 0,  atkA: 90, def: 30 },
  HUNTER:  { name: "Hunter EF-88",  cls: "air", move: 11, moveType: "air", rngG: 1, rngA: 1, atkG: 70, atkA: 70, def: 50 },

  // Self-propelled guns — move or fire, never both.
  HADRIAN: { name: "Hadrian SG-4",  cls: "artillery", move: 4, moveType: "treads", rngG: 5, rngA: 0, atkG: 45, atkA: 0, def: 30, moveOrFire: true },
  OCTOPUS: { name: "Octopus MR-22", cls: "artillery", move: 4, moveType: "treads", rngG: 4, rngA: 0, atkG: 60, atkA: 0, def: 30, moveOrFire: true },
  ATLAS:   { name: "Atlas SS-80",   cls: "artillery", move: 0, moveType: "treads", rngG: 6, rngA: 0, atkG: 90, atkA: 0, def: 20, moveOrFire: true, placeByTransport: true },

  // Missile buggies — may keep moving after attacking. They ride on wheels
  // but the original rates them with the fighting vehicles, not the carriers.
  // The Lynx fires missiles at ground targets exactly two hexes out (never
  // adjacent) and still re-moves; against aircraft it must be adjacent.
  RABBIT:  { name: "Rabbit MB-5",   cls: "buggy", move: 8, moveType: "treads", rngG: 1, rngA: 1, atkG: 70, atkA: 10, def: 20, moveAfterAttack: true },
  LYNX:    { name: "Lynx MB-4",     cls: "buggy", move: 6, moveType: "treads", rngG: 2, rngA: 1, atkG: 40, atkA: 10, def: 20, moveAfterAttack: true },

  // Anti-air.
  SEEKER:  { name: "Seeker AAG-4",  cls: "antiair", move: 6, moveType: "treads", rngG: 1, rngA: 1, atkG: 30, atkA: 65, def: 30 },
  HAWKEYE: { name: "Hawkeye MM107", cls: "antiair", move: 5, moveType: "treads", rngG: 0, rngA: 5, atkG: 0,  atkA: 85, def: 30, moveOrFire: true },

  // Transports — carry one ground unit each.
  MULE:    { name: "Mule NC-1",     cls: "transport", move: 6, moveType: "wheels", rngG: 1, rngA: 1, atkG: 10, atkA: 10, def: 10, cargo: 1 },
  PELICAN: { name: "Pelican C-61",  cls: "transport", move: 9, moveType: "air",    rngG: 0, rngA: 0, atkG: 0,  atkA: 0,  def: 10, cargo: 1 },

  // Mines — immobile, no attack, hard to crack, project ZOC like anything else.
  TRIGGER: { name: "Trigger M-77",  cls: "mine", move: 0, moveType: "treads", rngG: 0, rngA: 0, atkG: 0, atkA: 0, def: 80, placeByTransport: true },
};

(function () { for (var k in UNIT_TYPES) UNIT_TYPES[k].id = k; })();

var MOVE_TYPES = ["foot", "wheels", "treads", "air"];

/* Merge user-defined unit types (from the editor / custom JSON) over the
 * stock roster. Unknown fields pass through untouched. Older custom units
 * carry a single rmin/rmax band instead of rngG/rngA; that documented legacy
 * spelling is translated here: the band applies to whichever domains the
 * unit has attack power for. */
function mergeUnitTypes(customObj) {
  for (var k in customObj) {
    var id = k.toUpperCase();
    var def = customObj[k];
    def.id = id;
    if (!def.name) def.name = id;
    if (!def.cls) def.cls = "tank";
    if (!def.moveType) def.moveType = "treads";
    // A misspelled movement class would otherwise produce a unit that can
    // enter no hex at all, which reads as a map bug rather than a typo.
    if (MOVE_TYPES.indexOf(def.moveType) < 0) {
      throw new Error("Custom unit " + id + ' has unknown moveType "' + def.moveType +
        '". Use one of: ' + MOVE_TYPES.join(", ") + ".");
    }
    if (def.rngG === undefined) {
      def.rngG = (def.atkG > 0) ? (def.rmax !== undefined ? def.rmax : 1) : 0;
    }
    if (def.rngA === undefined) {
      def.rngA = (def.atkA > 0) ? (def.rmax !== undefined ? def.rmax : 1) : 0;
    }
    UNIT_TYPES[id] = def;
  }
}

if (typeof module !== "undefined") module.exports = { UNIT_TYPES: UNIT_TYPES, mergeUnitTypes: mergeUnitTypes };
