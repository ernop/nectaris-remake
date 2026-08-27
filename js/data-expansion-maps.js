/* Nectaris remake — online expansion library.
 *
 * Twelve original maps distributed with the public web edition. These do not
 * reproduce Hudson Soft or third-party archive map data. Each carries visible
 * provenance and a design note for the level browser.
 */
"use strict";

var EXPANSION_LEVELS = (function () {
  var SOURCE = "https://github.com/ernop/nectaris-remake/blob/main/js/data-expansion-maps.js";

  function level(meta, grid, bases, factories, blueUnits, redUnits) {
    var width = grid[0].length;
    var buildings = [
      { col: bases[0][0], row: bases[0][1], owner: 0 },
      { col: bases[1][0], row: bases[1][1], owner: 1 },
    ];
    (factories || []).forEach(function (f) {
      buildings.push({
        col: f[0], row: f[1], owner: f[2] === undefined ? -1 : f[2],
        stored: f[3] || [],
      });
    });
    var units = [];
    blueUnits.forEach(function (u) {
      units.push({ t: u[0], o: 0, x: u[1], y: u[2], exp: u[3] || 0 });
    });
    (redUnits || blueUnits.map(function (u) {
      return [u[0], width - 1 - u[1], u[2], u[3] || 0];
    })).forEach(function (u) {
      units.push({ t: u[0], o: 1, x: u[1], y: u[2], exp: u[3] || 0 });
    });
    return {
      name: meta.name,
      pack: "Lunar Frontiers",
      author: "Nectaris Remake contributors",
      source: SOURCE,
      description: meta.description,
      special: meta.special,
      tags: meta.tags,
      turnLimit: meta.turnLimit || 50,
      grid: grid,
      buildings: buildings,
      units: units,
    };
  }

  return [
    level({
      name: "BRIDGEHEAD",
      description: "Two narrow crossings turn every advance into a choice between concentration and a flank attack.",
      special: "Twin bridges; artillery controls the approaches while buggies can switch fronts quickly.",
      tags: ["bridges", "artillery", "medium"],
    }, [
      "....vv..vv....",
      ".hh.vv..vv.hh.",
      "....vv..vv....",
      "B---==--==---B",
      "....vv..vv....",
      "..wwvv..vvww..",
      "....vv..vv....",
      ".hh..........h",
      "..............",
    ], [[0, 3], [13, 3]], [], [
      ["BISON", 1, 2], ["POLAR", 2, 3], ["HADRIAN", 1, 4],
      ["RABBIT", 2, 5], ["CHARLIE", 1, 3],
    ]),

    level({
      name: "HIGH GROUND",
      description: "Armor owns the valley floor, but infantry can cross the mountain spine under 40% cover.",
      special: "A neutral summit factory rewards an infantry climb; wheeled and tracked units cannot follow.",
      tags: ["mountains", "infantry", "factory"],
    }, [
      "....MMMMMM....",
      "..hhMM..MMhh..",
      "....MMF.MM....",
      "B---MM..MM---B",
      "....MM..MM....",
      "..wwMM..MMww..",
      "....MM..MM....",
      ".hh........hh.",
      "..............",
    ], [[0, 3], [13, 3]], [[6, 2, -1, ["KILROY", "LYNX"]]], [
      ["CHARLIE", 1, 2], ["KILROY", 2, 3], ["PANTHER", 1, 4],
      ["BISON", 2, 5], ["HADRIAN", 1, 5],
    ]),

    level({
      name: "AIRLIFT",
      description: "The enemy bases sit behind impassable valleys. Infantry must ride Pelicans while fighters contest the route.",
      special: "Capture requires air transport; Falcons and Seekers create an escort-versus-interception battle.",
      tags: ["transport", "air", "capture"],
      turnLimit: 45,
    }, [
      "vvv........vvv",
      "vBv........vBv",
      "vvv........vvv",
      "....hh..hh....",
      "..............",
      "..ww......ww..",
      "..............",
      "....F....F....",
      "..............",
    ], [[1, 1], [12, 1]], [[4, 7, 0, ["HUNTER"]], [9, 7, 1, ["HUNTER"]]], [
      ["PELICAN", 3, 2], ["CHARLIE", 2, 3], ["KILROY", 3, 3],
      ["EAGLE", 2, 4], ["FALCON", 3, 5], ["SEEKER", 2, 6],
    ]),

    level({
      name: "FACTORY RACE",
      description: "Four neutral factories form a diamond. Initial forces are light; captured stock decides the battle.",
      special: "Every factory holds a different role, forcing an early route choice instead of one optimal center rush.",
      tags: ["factories", "capture", "fast"],
      turnLimit: 40,
    }, [
      "..............",
      "...F......F...",
      "..hh......hh..",
      "..............",
      "B-----..-----B",
      "..............",
      "..ww......ww..",
      "...F......F...",
      "..............",
    ], [[0, 4], [13, 4]], [
      [3, 1, -1, ["BISON"]], [10, 1, -1, ["HADRIAN"]],
      [3, 7, -1, ["SEEKER"]], [10, 7, -1, ["RABBIT"]],
    ], [
      ["CHARLIE", 1, 3], ["PANTHER", 2, 4], ["LYNX", 1, 5],
    ]),

    level({
      name: "LONG REACH",
      description: "Interlocking artillery ranges cover the center while hills provide staging positions just outside them.",
      special: "Atlas guns start immobile on both wings; transports can reposition one, but doing so abandons immediate fire.",
      tags: ["artillery", "transport", "range"],
    }, [
      "................",
      "..hh........hh..",
      "....ww....ww....",
      "................",
      "B--------------B",
      "................",
      "....ww....ww....",
      "..hh........hh..",
      "................",
    ], [[0, 4], [15, 4]], [], [
      ["ATLAS", 2, 1], ["MULE", 2, 2], ["HADRIAN", 1, 3],
      ["BISON", 2, 4], ["POLAR", 1, 5], ["CHARLIE", 2, 5],
    ]),

    level({
      name: "ENCIRCLEMENT",
      description: "Small forces begin close together around a defensible center, making support and surround geometry decisive.",
      special: "Compact map built to expose six-hex surround coverage and support-fire chains.",
      tags: ["surround", "support", "small"],
      turnLimit: 30,
    }, [
      "............",
      "...hh..hh...",
      "............",
      "B----ww----B",
      "............",
      "...hh..hh...",
      "............",
    ], [[0, 3], [11, 3]], [], [
      ["BISON", 2, 2], ["BISON", 2, 4], ["KILROY", 3, 3],
      ["LYNX", 1, 3],
    ]),

    level({
      name: "SCRAPYARD",
      description: "Wasteland slows every ground chassis and grants 30% cover, turning short advances into deliberate commitments.",
      special: "Road corridors are fast but exposed; leaving them trades speed for strong defensive terrain.",
      tags: ["wasteland", "roads", "attrition"],
    }, [
      "wwww....wwww....",
      "ww..----..ww....",
      "....wwww........",
      "B------ww------B",
      "....wwww........",
      "ww..----..ww....",
      "wwww....wwww....",
      "................",
      "................",
    ], [[0, 3], [15, 3]], [], [
      ["SLAGGER", 1, 2], ["POLAR", 2, 3], ["OCTOPUS", 1, 4],
      ["CHARLIE", 2, 4], ["RABBIT", 2, 5],
    ]),

    level({
      name: "SKYHOOK",
      description: "Ground columns cross open terrain beneath a dense fighter, interceptor and anti-air contest.",
      special: "Each air role has a distinct target priority: Falcon versus aircraft, Eagle versus ground, Hunter versus both.",
      tags: ["air", "anti-air", "combined arms"],
    }, [
      "vv............vv",
      "................",
      "...hh......hh...",
      "................",
      "B------..------B",
      "................",
      "...ww......ww...",
      "................",
      "vv............vv",
    ], [[0, 4], [15, 4]], [], [
      ["EAGLE", 2, 2], ["FALCON", 3, 3], ["HUNTER", 2, 4],
      ["SEEKER", 1, 5], ["HAWKEYE", 2, 6], ["BISON", 1, 4], ["CHARLIE", 1, 3],
    ]),

    level({
      name: "CONVOY",
      description: "An infantry column and a crated Atlas must cross a long map where the enemy can attack from either flank.",
      special: "Two transport types carry different tactical burdens; losing either closes a route to victory.",
      tags: ["convoy", "transport", "large"],
      turnLimit: 55,
    }, [
      "....vv......vv....",
      "..hhvv......vvhh..",
      "....==......==....",
      "..................",
      "B----------------B",
      "..................",
      "....==......==....",
      "..wwvv......vvww..",
      "....vv......vv....",
      "..................",
    ], [[0, 4], [17, 4]], [], [
      ["MULE", 2, 3], ["PELICAN", 2, 5], ["CHARLIE", 1, 4],
      ["KILROY", 3, 4], ["BISON", 2, 2], ["HADRIAN", 2, 6], ["EAGLE", 3, 5],
    ]),

    level({
      name: "CITADEL",
      description: "A ring of mountains protects each base, but two gates and an air corridor keep the defense from becoming static.",
      special: "Triggers block the ground gates; ranged guns can clear them while aircraft threaten the interior.",
      tags: ["siege", "mines", "fortress"],
      turnLimit: 55,
    }, [
      "MMM..........MMM",
      "MBM..........MBM",
      "M.M..hh..hh..M.M",
      "..M..........M..",
      "..=----------=..",
      "..M..........M..",
      "M.M..ww..ww..M.M",
      "MMM..........MMM",
      "................",
    ], [[1, 1], [14, 1]], [], [
      ["TRIGGER", 2, 4], ["ATLAS", 3, 2], ["KILROY", 2, 3],
      ["GRIZZLY", 3, 4], ["HAWKEYE", 3, 5], ["HUNTER", 2, 6],
    ]),

    level({
      name: "CROSSWINDS",
      description: "A broad road network gives missile buggies room to strike and keep moving before heavy armor can answer.",
      special: "Rabbit and Lynx movement-after-attack is the central mechanic; hills punish predictable escape routes.",
      tags: ["buggies", "mobility", "roads"],
      turnLimit: 40,
    }, [
      "................",
      "..hh........hh..",
      ".--------------.",
      "...hh......hh...",
      "B--------------B",
      "...ww......ww...",
      ".--------------.",
      "..hh........hh..",
      "................",
    ], [[0, 4], [15, 4]], [], [
      ["RABBIT", 2, 2], ["LYNX", 2, 4], ["RABBIT", 2, 6],
      ["BISON", 1, 3], ["CHARLIE", 1, 5], ["SEEKER", 3, 4],
    ]),

    level({
      name: "GRAND LUNAR",
      description: "A full-scale combined-arms battle across four fronts, with every major unit role represented.",
      special: "Four capturable factories, twin valleys, airspace, artillery lanes and transport objectives on one 20×12 map.",
      tags: ["combined arms", "factories", "large"],
      turnLimit: 60,
    }, [
      "MMhh............hhMM",
      "M..................M",
      "..F....vv..vv....F..",
      ".....ww......ww.....",
      "...hh..........hh...",
      "B--------..--------B",
      "...hh..........hh...",
      ".....ww......ww.....",
      "..F....vv..vv....F..",
      "M..................M",
      "MMhh............hhMM",
      "....................",
    ], [[0, 5], [19, 5]], [
      [2, 2, 0, ["HUNTER"]], [17, 2, 1, ["HUNTER"]],
      [2, 8, 0, ["GIANT"]], [17, 8, 1, ["ATLAS", "TRIGGER"]],
    ], [
      ["BISON", 1, 4], ["POLAR", 2, 5], ["TITAN", 2, 4], ["SLAGGER", 3, 5],
      ["HADRIAN", 1, 5], ["CHARLIE", 2, 6], ["KILROY", 1, 3], ["PANTHER", 2, 7],
      ["EAGLE", 3, 4], ["FALCON", 2, 3], ["SEEKER", 3, 3],
      ["MULE", 2, 9], ["PELICAN", 1, 7], ["RABBIT", 3, 6],
    ]),
  ];
})();

if (typeof module !== "undefined") module.exports = EXPANSION_LEVELS;
