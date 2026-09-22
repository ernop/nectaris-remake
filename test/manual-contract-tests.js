/* Independently transcribed from the original Japanese PCE booklet, pp. 8-10.
 * https://dds.konami.com/games/manual/pcemini/jp_Nectaris.pdf
 * US names are mapped by designation. Columns: ground attack/range, air
 * attack/range, Shift, defense. Slashes in the printed chart mean zero.
 * This fixture must be reviewed against that source, not regenerated from data-units.
 */
"use strict";
module.exports = function (ok) {
  var types = require("../js/data-units.js").UNIT_TYPES;
  var expected = {
    CHARLIE: [10,1,10,1,3,4], KILROY: [40,1,10,1,2,10], PANTHER: [10,1,10,1,9,8],
    BISON: [50,1,0,0,6,40], LENET: [45,1,0,0,5,30], POLAR: [60,1,0,0,4,60],
    GRIZZLY: [70,1,0,0,4,50], SLAGGER: [50,1,0,0,7,50], TITAN: [60,1,0,0,5,50],
    GIANT: [90,1,40,1,2,80], EAGLE: [70,1,20,1,10,30], FALCON: [0,0,90,1,12,30],
    HUNTER: [70,1,70,1,11,50], HADRIAN: [45,5,0,0,4,30], OCTOPUS: [60,4,0,0,4,30],
    ATLAS: [90,6,0,0,0,20], RABBIT: [70,1,10,1,8,20], LYNX: [40,2,10,1,6,20],
    SEEKER: [30,1,65,1,6,30], HAWKEYE: [0,0,85,5,5,30], MULE: [10,1,10,1,6,10],
    PELICAN: [0,0,0,0,9,10], TRIGGER: [0,0,0,0,0,80],
  };
  Object.keys(expected).forEach(function (id) {
    var t = types[id];
    ok(JSON.stringify([t.atkG,t.rngG,t.atkA,t.rngA,t.move,t.def]) === JSON.stringify(expected[id]),
      id + " matches all six numerical fields in the PCE manual");
    ok(!!t.capture === ["CHARLIE","KILROY","PANTHER"].includes(id), id + " manual capture capability");
    ok(!!t.moveAfterAttack === ["RABBIT","LYNX"].includes(id), id + " manual post-attack Shift capability");
    // d2's special-abilities section explicitly resolves the booklet's broad
    // indirect-fire wording: Lynx retains buggy movement, unlike these four.
    // https://anka.sakura.ne.jp/nectaris/d2.html
    ok(!!t.moveOrFire === ["HADRIAN","OCTOPUS","ATLAS","HAWKEYE"].includes(id),
      id + " documented Shift-or-Attack restriction");
  });
};
