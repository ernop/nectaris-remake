'use strict';
/* Original 32×32 pixel constructions for the fifteen proposal units.
 * Same indexed palette, projection, light and outline rules as the stock
 * roster in art/units/pixel-art.js: the shape is mirrored for the left
 * facing, then relit for screen-upper-left light. Palette indices:
 * 1 outline, 2-4 metal dark-light, 5 specular, 6-10 faction dark-light,
 * 11-12 glass, 13-14 ordnance (carried missiles/rockets/shells only),
 * 15 contact shadow. */
const {Surface, palette, colorize} = require('../art/units/pixel-art.js');

const FRAME = 32;
const FOOT_TEAMS = ['MEERKAT', 'HOWLER', 'GECKO'];

function draw(id, facing, debug) {
  const s = new Surface(FRAME, FRAME), shadow = new Surface(FRAME, FRAME);
  const left = facing === 'left';
  // The epsilon keeps the half-open polygon fill rule pixel-exact under mirroring.
  const X = x => left ? FRAME - x + 1e-6 : x;
  const poly = (p, c) => s.poly(p.map(([x, y]) => [X(x), y]), c);
  const rect = (x, y, w, h, c) => s.rect(left ? FRAME - x - w : x, y, w, h, c);
  const line = (x, y, x1, y1, c, w = 1) => s.line(left ? FRAME - 1 - x + (w % 2 === 0 ? 1 : 0) : x, y,
    left ? FRAME - 1 - x1 + (w % 2 === 0 ? 1 : 0) : x1, y1, c, w);
  const px = (x, y, c) => rect(x, y, 1, 1, c);
  // End planes face the light when they point toward screen-left.
  const facet = (nx, ny) => Math.max(6, Math.min(10, 8 - Math.round(nx * (left ? -1 : 1) + ny)));
  const lit = (right, leftFacing) => left ? leftFacing : right;
  const shade = (x, y, w) => shadow.rect(x, y, w, 1, 15);

  const treads = (x, y, w) => {
    rect(x, y, w, 4, 2); line(x + 1, y, x + w - 2, y, 3);
    for (let n = x + 2; n < x + w - 1; n += 4) { rect(n, y + 1, 2, 1, 3); rect(n, y + 3, 2, 1, 4); }
  };
  const farTread = (x, y, w) => { rect(x, y, w, 3, 2); line(x + 1, y, x + w - 2, y, 4); };
  const wheel = (x, y) => { rect(x, y, 4, 4, 2); rect(x + 1, y, 2, 1, 4); rect(x + 1, y + 1, 2, 2, 3); px(x + 1, y + 1, 4); };
  const smallWheel = (x, y) => { rect(x, y, 3, 3, 2); px(x + 1, y, 4); px(x + 1, y + 1, 3); };
  const helmet = (x, y) => {
    rect(x, y, 4, 2, 8); line(x, y, x + 3, y, 10);
    rect(x - 1, y + 2, 5, 1, 2); rect(x + 2, y + 2, 2, 1, 11); px(x + 2, y + 3, 4);
  };

  switch (id) {
    case 'YETI': {
      shade(9, 26, 16);
      // Far leg: darker, one step up-left in depth.
      line(12, 16, 9, 20, 2, 2); line(9, 20, 11, 24, 2, 2);
      rect(8, 24, 6, 1, 2); line(9, 24, 12, 24, 3);
      // Near leg: reverse knee, armored thigh plate, broad foot.
      line(18, 16, 15, 20, 3, 2); line(15, 20, 18, 24, 3, 2);
      poly([[16, 16], [20, 16], [18, 20], [14, 20]], 7);
      line(16, 16, 19, 16, 9); px(14, 19, lit(9, 7));
      rect(15, 20, 3, 2, 2); px(15, 20, 4);
      rect(15, 24, 7, 2, 2); line(16, 24, 21, 24, 4); px(21, 25, 3);
      // Armored body: lit roof, near side, rear facet, glass slit.
      poly([[7, 8], [19, 8], [23, 11], [23, 17], [10, 17], [7, 14]], 7);
      poly([[7, 8], [19, 8], [22, 11], [10, 11]], 9);
      line(7, 8, 18, 8, 10); line(8, 8, 13, 8, 5); line(10, 11, 21, 11, 10);
      poly([[10, 11], [23, 11], [23, 17], [10, 17]], 8);
      line(11, 16, 22, 16, 6); rect(11, 12, 4, 3, 7); line(11, 12, 14, 12, 9);
      poly([[7, 8], [10, 11], [10, 17], [7, 14]], facet(-1, 0));
      rect(18, 12, 4, 2, 11); line(18, 12, 20, 12, 12);
      rect(13, 16, 6, 2, 2); line(13, 16, 18, 16, 3);
      // Short heavy cannon from the chest and a small roof gun.
      rect(23, 13, 6, 2, 3); line(23, 13, 28, 13, 4); px(28, 14, 2);
      rect(13, 6, 4, 2, 8); line(13, 6, 15, 6, 10); rect(17, 6, 4, 1, 3); line(17, 6, 20, 6, 4);
      break;
    }
    case 'MEERKAT': {
      shade(11, 24, 9);
      // Shouldered tube raised steeply at the sky, drawn first so the gunner overlaps it.
      line(9, 19, 19, 11, 3, 2); line(8, 18, 18, 10, 4);
      rect(7, 18, 2, 2, 2);
      // Only the seeker head is ordnance-colored.
      rect(19, 9, 2, 2, 14); px(20, 10, 13);
      // Upright sentry.
      rect(12, 19, 2, 4, 7); rect(16, 19, 2, 4, 6);
      rect(12, 20, 1, 2, 9); rect(11, 23, 3, 1, 2); rect(16, 23, 3, 1, 2); px(11, 23, 4);
      rect(12, 13, 6, 6, 8); rect(12, 14, 5, 2, 9); line(12, 14, 15, 14, 10); rect(12, 18, 6, 1, 6);
      rect(11, 14, 2, 4, facet(-1, 0));
      helmet(13, 10);
      rect(17, 13, 2, 2, 7);
      px(13, 18, 2);
      break;
    }
    case 'HOWLER': {
      shade(8, 24, 16);
      // Kneeling loader behind the tube.
      rect(8, 20, 3, 2, 7); rect(11, 21, 4, 1, 6); rect(6, 22, 5, 1, 2); rect(12, 22, 3, 1, 2);
      rect(8, 15, 5, 5, 8); rect(8, 16, 4, 1, 9); line(8, 16, 10, 16, 10); rect(8, 19, 5, 1, 6);
      rect(7, 16, 2, 3, facet(-1, 0));
      helmet(9, 12);
      // Shell held ready: ordnance colors.
      rect(13, 15, 2, 3, 13); px(13, 15, 14); line(12, 17, 13, 16, 7);
      // Heavy baseplate, thick steep tube and a short dark bipod.
      rect(15, 22, 8, 1, 2); line(16, 22, 21, 22, 3);
      line(20, 16, 24, 21, 2); rect(23, 21, 3, 2, 2); px(23, 21, 3);
      line(17, 21, 21, 12, 3, 2); line(18, 21, 22, 12, 3, 2);
      line(18, 21, 22, 12, 2); line(16, 20, 20, 11, 4);
      rect(20, 10, 3, 1, 4);
      break;
    }
    case 'GECKO': {
      shade(9, 24, 14);
      // Mid-stride raider: split legs, forward lean, tall mountain rucksack, carbine.
      line(13, 19, 9, 22, 7, 2); rect(8, 22, 3, 1, 2); px(8, 22, 4);
      line(16, 19, 19, 21, 6, 2); rect(19, 21, 3, 2, 2);
      // Rucksack and bedroll sit behind the torso.
      rect(8, 13, 4, 6, 7); rect(8, 14, 1, 5, facet(-1, 0)); line(8, 13, 11, 13, 9);
      rect(8, 11, 5, 2, 3); line(8, 11, 12, 11, 4); px(12, 12, 2);
      rect(12, 14, 6, 5, 8); rect(12, 15, 5, 1, 9); line(12, 15, 15, 15, 10); rect(13, 18, 5, 1, 6);
      helmet(15, 11);
      // Short carbine held forward.
      rect(17, 15, 6, 1, 2); line(18, 14, 22, 14, 3); px(23, 14, 4);
      rect(18, 16, 2, 1, 7);
      break;
    }
    case 'WOMBAT': {
      shade(6, 24, 21);
      farTread(4, 11, 19);
      treads(4, 19, 22);
      // Tall armored troop box: long lit roof, sloped glacis, rear ramp.
      poly([[5, 9], [20, 9], [23, 12], [28, 16], [28, 19], [8, 19], [5, 16]], 7);
      poly([[5, 9], [20, 9], [23, 12], [8, 12]], 9);
      line(5, 9, 19, 9, 10); line(6, 9, 13, 9, 5); line(8, 12, 22, 12, 10);
      poly([[8, 12], [23, 12], [23, 19], [8, 19]], 8);
      poly([[23, 12], [28, 16], [28, 19], [23, 19]], facet(1, -1));
      line(23, 12, 27, 16, 9);
      poly([[5, 9], [8, 12], [8, 19], [5, 16]], facet(-1, 0));
      line(6, 11, 6, 16, lit(10, 8));
      // Firing ports and the rear door seam; no turret gun.
      for (const x of [11, 15, 19]) { rect(x, 14, 2, 2, 2); px(x, 14, 12); }
      line(9, 13, 9, 18, 6); line(10, 18, 22, 18, 6);
      rect(16, 7, 4, 2, 8); line(16, 7, 18, 7, 10); rect(20, 7, 3, 1, 3); line(20, 7, 22, 7, 4);
      break;
    }
    case 'STORK': {
      shade(9, 26, 15);
      // Long boxy fuselage with a door gunner and two rotor pylons.
      poly([[4, 13], [23, 13], [27, 16], [27, 19], [24, 21], [6, 21], [4, 18]], 7);
      poly([[4, 13], [23, 13], [26, 15], [6, 15]], 9);
      line(4, 13, 22, 13, 10); line(5, 13, 12, 13, 5);
      rect(6, 16, 18, 4, 8); line(7, 19, 23, 19, 6);
      poly([[23, 15], [27, 16], [27, 19], [24, 20]], 11); line(24, 16, 26, 16, 12);
      for (const x of [9, 12, 15]) { rect(x, 16, 2, 1, 11); px(x, 16, 12); }
      rect(18, 16, 3, 3, 2); rect(21, 17, 3, 1, 3); line(21, 17, 23, 17, 4);
      rect(8, 22, 2, 2, 2); rect(21, 22, 2, 2, 2); line(8, 22, 22, 22, 3);
      rect(5, 9, 4, 4, 8); line(5, 9, 7, 9, 10); rect(20, 10, 4, 3, 8); line(20, 10, 22, 10, 10);
      // Two separate crossed rotors: the rear one sits higher.
      line(3, 9, 13, 7, 3); line(3, 7, 13, 9, 4);
      line(17, 10, 28, 8, 3); line(17, 8, 28, 10, 4);
      px(7, 7, 2); px(22, 8, 2);
      break;
    }
    case 'CAMEL': {
      shade(4, 24, 25);
      // Low flat deck with rear ramps; tie-down points; no box body.
      poly([[3, 16], [19, 16], [21, 18], [21, 20], [4, 20], [3, 19]], 7);
      poly([[3, 16], [19, 16], [21, 18], [5, 18]], 9);
      line(3, 16, 18, 16, 10); line(4, 16, 10, 16, 5);
      rect(5, 18, 16, 2, 8); line(6, 19, 20, 19, 6);
      for (const x of [7, 11, 15]) px(x, 17, 2);
      line(3, 18, 5, 21, 3); line(4, 17, 6, 21, 4);
      // Tractor cab with glass and twin exhaust stacks.
      poly([[19, 11], [25, 11], [28, 14], [28, 20], [19, 20]], 7);
      poly([[19, 11], [25, 11], [27, 13], [21, 13]], 9); line(19, 11, 24, 11, 10);
      rect(21, 13, 7, 7, 8); rect(24, 14, 4, 3, 11); line(24, 14, 26, 14, 12);
      poly([[19, 11], [21, 13], [21, 20], [19, 18]], facet(-1, 0));
      line(22, 18, 27, 18, 6);
      line(18, 8, 18, 12, 3); line(20, 8, 20, 10, 4); px(18, 8, 4);
      // Many small road wheels under the trailer, two axles on the tractor.
      for (const x of [4, 8, 12]) smallWheel(x, 21);
      wheel(20, 20); wheel(25, 20);
      break;
    }
    case 'WASP': {
      shade(10, 25, 13);
      // Single long rotor over a slim tandem gunship.
      line(5, 10, 28, 10, 3); line(5, 9, 16, 9, 4); line(16, 11, 27, 11, 2);
      line(15, 10, 15, 13, 3, 2);
      // Tail boom, fin and tail rotor.
      rect(4, 15, 10, 2, 7); line(4, 15, 13, 15, 9);
      poly([[3, 11], [6, 13], [6, 17], [3, 17]], facet(-1, 0)); line(3, 11, 5, 13, 10);
      line(3, 13, 6, 16, 4); line(3, 16, 6, 13, 3);
      // Stepped two-seat canopy and narrow body.
      poly([[12, 13], [22, 13], [27, 16], [25, 18], [12, 18]], 7);
      poly([[12, 13], [22, 13], [25, 15], [14, 15]], 9); line(12, 13, 21, 13, 10);
      rect(17, 12, 3, 2, 11); rect(21, 13, 3, 2, 11); px(17, 12, 12); px(21, 13, 12);
      rect(13, 16, 11, 2, 8); line(14, 17, 23, 17, 6);
      // Chin gun, stub wing and a steel rocket pod; only the rocket noses are ordnance.
      rect(24, 18, 4, 1, 3); line(24, 18, 27, 18, 4);
      line(14, 19, 21, 19, 2);
      rect(15, 20, 5, 2, 3); line(15, 20, 19, 20, 4); px(20, 20, 14); px(20, 21, 13);
      break;
    }
    case 'VULTURE': {
      shade(10, 29, 12);
      // Loitering drone planform: very long straight wing, slim body, V-tail.
      poly([[13, 5], [16, 5], [18, 15], [11, 15]], 9);
      line(13, 5, 15, 5, 10); line(13, 6, 12, 14, 10); line(14, 5, 14, 9, 5);
      poly([[11, 17], [18, 17], [16, 28], [13, 28]], 7);
      line(12, 18, 13, 27, 8); line(14, 27, 15, 27, 6);
      poly([[5, 15], [8, 15], [5, 11], [3, 11]], 9); line(3, 11, 4, 11, 10);
      poly([[5, 18], [8, 18], [5, 22], [3, 22]], 7);
      poly([[4, 15], [24, 15], [29, 16], [29, 17], [24, 18], [4, 18]], 8);
      line(4, 15, 23, 15, 10); line(6, 15, 12, 15, 5); line(5, 17, 24, 17, 6);
      rect(23, 16, 2, 2, 11); px(23, 16, 12);
      // Two heavy stand-off missiles on inboard pylons, noses well ahead of the wing.
      for (const y of [11, 20]) { rect(14, y, 8, 2, 13); line(14, y, 20, y, 14); px(22, y, 14); px(22, y + 1, 13); }
      break;
    }
    case 'SHRIKE': {
      shade(9, 25, 14);
      // Forward-swept wings: roots aft, tips ahead of the roots.
      poly([[9, 14], [13, 14], [18, 5], [15, 5]], 8);
      poly([[9, 14], [11, 14], [16, 6], [15, 5]], 10); line(15, 5, 17, 5, 5);
      poly([[9, 18], [13, 18], [18, 27], [15, 27]], 7);
      line(10, 19, 15, 26, 9);
      // Canards near the nose.
      poly([[21, 14], [24, 14], [23, 11], [22, 11]], 9);
      poly([[21, 18], [24, 18], [23, 21], [22, 21]], 7);
      // Long slim fuselage, tiny cockpit slit, twin fins.
      poly([[3, 14], [23, 14], [29, 16], [23, 18], [3, 18]], 8);
      poly([[3, 14], [23, 14], [27, 15], [5, 15]], 10); line(5, 14, 20, 14, 5);
      line(4, 17, 23, 17, 6);
      rect(22, 15, 3, 1, 11); px(22, 15, 12);
      rect(3, 11, 3, 3, facet(-1, 0)); line(3, 11, 4, 11, 10); rect(3, 18, 3, 3, 6);
      // Air-to-air missiles on wing rails, parallel to the fuselage.
      for (const y of [9, 22]) { rect(12, y, 8, 1, 13); line(13, y, 18, y, 14); px(20, y, 14); }
      break;
    }
    case 'MANTIS': {
      shade(6, 24, 20);
      farTread(4, 15, 20);
      treads(4, 20, 22);
      poly([[5, 16], [21, 16], [25, 18], [25, 21], [5, 21]], 7);
      poly([[5, 16], [21, 16], [24, 18], [7, 18]], 9); line(5, 16, 20, 16, 10); line(6, 16, 12, 16, 5);
      rect(7, 18, 18, 3, 8); line(8, 20, 24, 20, 6);
      poly([[5, 16], [7, 18], [7, 21], [5, 20]], facet(-1, 0));
      // Tall vertical-launch canister block erected at the rear; missile caps on the lid.
      rect(12, 14, 3, 2, 2);
      poly([[6, 7], [8, 4], [15, 4], [13, 7]], 9); line(8, 4, 14, 4, 10); line(9, 4, 11, 4, 5);
      rect(6, 7, 7, 10, 8); rect(6, 7, 1, 10, facet(-1, 0)); line(7, 7, 12, 7, 10);
      poly([[13, 7], [15, 4], [15, 14], [13, 17]], facet(1, 0));
      line(8, 8, 8, 16, 6); line(11, 8, 11, 16, 6); line(9, 8, 9, 16, 9);
      for (const [x, y] of [[9, 5], [12, 5], [10, 6]]) px(x, y, 14);
      px(13, 5, 13);
      // Driver cab with glass at the front of the hull.
      poly([[17, 13], [22, 13], [25, 16], [17, 16]], 8); line(17, 13, 21, 13, 10);
      rect(21, 14, 2, 2, 11); px(21, 14, 12);
      rect(20, 18, 2, 1, 2); rect(26, 20, 2, 1, 2);
      break;
    }
    case 'SNAPPER': {
      shade(6, 24, 21);
      // Earth berm and sandbags around the foot of the bunker.
      rect(3, 20, 24, 3, 3); line(4, 20, 25, 20, 4);
      for (const x of [6, 11, 16, 21]) { px(x, 21, 2); px(x + 2, 22, 2); }
      // Thick angular slab roof and faceted walls; no chassis.
      poly([[7, 11], [21, 11], [25, 14], [25, 20], [6, 20], [5, 15]], 7);
      poly([[7, 11], [21, 11], [24, 14], [9, 14]], 9);
      line(7, 11, 20, 11, 10); line(8, 11, 14, 11, 5); line(9, 14, 23, 14, 10);
      poly([[9, 14], [25, 14], [25, 20], [9, 20]], 8);
      poly([[7, 11], [9, 14], [9, 20], [6, 20], [5, 15]], facet(-1, 0));
      line(10, 19, 24, 19, 6);
      // Dark firing slit with the gun barrel through it.
      rect(15, 16, 10, 2, 1); rect(16, 16, 8, 1, 2);
      rect(22, 16, 7, 2, 3); line(23, 16, 28, 16, 5); px(28, 17, 2);
      // Periscope and vent block on the roof.
      rect(11, 8, 2, 3, 3); line(11, 8, 12, 8, 4); rect(15, 10, 4, 1, 8);
      break;
    }
    case 'PIKE': {
      shade(5, 24, 22);
      farTread(3, 13, 20);
      treads(3, 20, 22);
      // Low hull and a fixed casemate: sloped front plate, flat roof.
      poly([[4, 15], [22, 15], [25, 18], [25, 21], [4, 21]], 7);
      rect(8, 18, 17, 3, 6); line(9, 18, 24, 18, 8);
      poly([[5, 10], [15, 10], [22, 15], [22, 18], [8, 18], [5, 15]], 7);
      poly([[5, 10], [15, 10], [17, 12], [7, 12]], 9);
      line(5, 10, 14, 10, 10); line(6, 10, 10, 10, 5);
      poly([[15, 10], [22, 15], [22, 16], [17, 12]], 10);
      poly([[7, 12], [17, 12], [22, 16], [22, 18], [7, 18]], 8);
      line(8, 17, 21, 17, 6);
      poly([[5, 10], [7, 12], [7, 18], [5, 16]], facet(-1, 0));
      // Heavy box mantlet low in the front plate, longest barrel in the set.
      rect(19, 14, 4, 4, 7); line(19, 14, 22, 14, 9);
      rect(22, 15, 7, 2, 3); line(23, 15, 28, 15, 5); px(28, 16, 2);
      rect(9, 8, 3, 2, 3); line(9, 8, 10, 8, 4);
      rect(10, 14, 4, 2, 2);
      break;
    }
    case 'HOUND': {
      shade(6, 24, 21);
      // Boat-shaped armored hull on three exposed axles.
      poly([[4, 14], [21, 14], [26, 17], [24, 20], [6, 20], [4, 18]], 7);
      poly([[4, 14], [21, 14], [24, 16], [7, 16]], 9);
      line(4, 14, 20, 14, 10); line(5, 14, 11, 14, 5);
      poly([[7, 16], [24, 16], [26, 17], [24, 20], [7, 20]], 8);
      line(8, 19, 23, 19, 6);
      poly([[4, 14], [7, 16], [7, 20], [6, 20], [4, 18]], facet(-1, 0));
      rect(21, 16, 3, 1, 11); px(21, 16, 12);
      // Small flat turret with a short autocannon.
      poly([[10, 10], [16, 10], [18, 12], [18, 14], [10, 14]], 7);
      poly([[10, 10], [16, 10], [17, 11], [11, 11]], 10); line(10, 10, 15, 10, 5);
      rect(12, 12, 6, 2, 8);
      rect(18, 12, 7, 1, 3); line(18, 11, 24, 11, 4); px(25, 11, 2);
      for (const x of [6, 13, 20]) wheel(x, 20);
      break;
    }
    case 'SQUID': {
      shade(5, 24, 23);
      // Truck bed and cab.
      rect(4, 17, 17, 3, 7); line(4, 17, 20, 17, 9); line(5, 19, 20, 19, 6);
      poly([[20, 11], [25, 11], [28, 14], [28, 20], [20, 20]], 7);
      poly([[20, 11], [25, 11], [27, 13], [22, 13]], 9); line(20, 11, 24, 11, 10);
      rect(22, 13, 6, 7, 8); rect(24, 14, 4, 3, 11); line(24, 14, 26, 14, 12);
      poly([[20, 11], [22, 13], [22, 20], [20, 18]], facet(-1, 0));
      // Raised rocket pack: slab sides and six yellow tube mouths at the front.
      line(9, 16, 11, 13, 3, 2);
      poly([[3, 12], [16, 6], [19, 10], [6, 16]], 7);
      poly([[3, 12], [16, 6], [17, 7], [4, 13]], 10); line(4, 12, 13, 8, 5);
      line(6, 16, 19, 10, 6);
      poly([[16, 6], [19, 5], [21, 9], [19, 10]], facet(1, 0));
      for (const [x, y] of [[17, 6], [19, 6], [18, 8], [20, 8]]) px(x, y, 14);
      px(19, 5, 13);
      rect(28, 18, 1, 2, 2);
      for (const x of [4, 10]) wheel(x, 20);
      wheel(22, 20);
      break;
    }
    default: throw new Error('Unknown proposal unit artwork ' + id);
  }

  // Selective charcoal contour, identical to the stock pipeline.
  const body = new Surface(FRAME, FRAME);
  for (let y = 0; y < FRAME; y++) for (let x = 0; x < FRAME; x++) if (s.get(x, y)) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!s.get(x + dx, y + dy)) body.set(x + dx, y + dy, 1);
  }
  body.blit(s, 0, 0);
  for (let y = 0; y < FRAME; y++) for (let x = 0; x < FRAME; x++) {
    const value = s.get(x, y);
    if (value === 5 || value === 10) {
      if (!s.get(x, y - 1) && body.get(x, y - 1) === 1) body.set(x, y - 1, value);
      if (value === 5 && !s.get(x - 1, y) && body.get(x - 1, y) === 1) body.set(x - 1, y, 10);
    }
  }
  let minX = FRAME, maxX = -1;
  body.p.forEach((p, i) => { if (p) { minX = Math.min(minX, i % FRAME); maxX = Math.max(maxX, i % FRAME); } });
  // The shadow is not mirrored, so it must never decide the width of either facing.
  shadow.p.forEach((p, i) => {
    if (p && (i % FRAME < minX || i % FRAME > maxX)) {
      throw new Error(id + '/' + facing + ': contact shadow pixel ' + (i % FRAME) + ' lies outside body columns ' + minX + '..' + maxX);
    }
  });
  const out = new Surface(FRAME, FRAME);
  out.blit(shadow, 0, 0);
  out.blit(body, 0, 0);
  const shift = (FRAME - minX - maxX - 1) / 2;
  if (debug) return { out, minX, maxX };
  if (!Number.isInteger(shift)) {
    throw new Error(id + '/' + facing + ': visible width ' + (maxX - minX + 1) + ' is odd; author an even-width silhouette');
  }
  const centered = new Surface(FRAME, FRAME);
  centered.blit(out, shift, 0);
  return centered;
}

/* Same export contract as tools/build-unit-art.js: palette indices 1-15,
 * safe hex envelope, exact horizontal centering, small foot teams. */
function check(id, facing, s) {
  let minX = FRAME, minY = FRAME, maxX = -1, maxY = -1, count = 0;
  const used = new Set();
  for (let y = 0; y < FRAME; y++) for (let x = 0; x < FRAME; x++) {
    const v = s.get(x, y);
    if (!v) continue;
    const dx = Math.abs(x + .5 - 16), dy = Math.abs(y + .5 - 16);
    if (!Number.isInteger(v) || v < 1 || v > 15 || dx > 14 || dy > 14 || dx + dy > 22) {
      throw new Error(id + '/' + facing + ': pixel ' + x + ',' + y + ' (index ' + v + ') is outside the safe hex envelope');
    }
    used.add(v); count++;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (!count || minX !== 31 - maxX) throw new Error(id + '/' + facing + ': empty or horizontally uncentered');
  if (FOOT_TEAMS.includes(id) && (maxY - minY + 1 > 17 || count > 240)) {
    throw new Error(id + '/' + facing + ': infantry teams must stay small (' + (maxY - minY + 1) + ' rows, ' + count + ' pixels)');
  }
  return { visibleBounds: [minX, minY, maxX - minX + 1, maxY - minY + 1], opaquePixels: count, paletteEntries: used.size };
}

function sprite(id, facing = 'right') {
  const s = draw(id, facing);
  check(id, facing, s);
  return s;
}

module.exports = { sprite, draw, check, palette, colorize, FOOT_TEAMS };
