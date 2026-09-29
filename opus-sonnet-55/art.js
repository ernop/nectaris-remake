"use strict";
/* Fifteen 16x16 "art pixel" sprites in the Legacy idiom.
 *
 * Legacy rules this file follows (art/legacy/README.md):
 *   - seven colours only: k black, d dark, m mid, g gray, c cyan, l light, w white;
 *     d/m/c/l are the faction ramp, k/g/w are shared;
 *   - a sprite is at most 16x16 art pixels, each drawn later as an exact 2x2 block;
 *   - a black contour, a bright top edge (light from the upper left), a darker
 *     lower edge, gray running gear;
 *   - the silhouette is centered horizontally in the frame.
 *
 * Every sprite is composed from rectangles, lines and wheels, then the black
 * contour is generated around the finished shape so that no contour gap or
 * see-through hole can exist. All art is newly authored for this pack; none of
 * it is traced from, or copied out of, the Legacy chart.
 */

const SIZE = 16;

function sprite() {
  const px = Array.from({ length: SIZE }, () => Array(SIZE).fill("."));
  const api = {
    set(x, y, c) {
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) throw new Error(`pixel ${x},${y} is outside the sprite`);
      px[y][x] = c;
      return api;
    },
    erase(x, y) { return api.set(x, y, "."); },
    rect(x, y, w, h, c) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) api.set(x + i, y + j, c);
      return api;
    },
    hline(x0, x1, y, c) { return api.rect(x0, y, x1 - x0 + 1, 1, c); },
    vline(x, y0, y1, c) { return api.rect(x, y0, 1, y1 - y0 + 1, c); },
    // Lit top and left edges, shaded bottom and right edges, body between.
    box(x, y, w, h, o = {}) {
      const { body = "c", hi = "l", lo = "m" } = o;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          let c = body;
          if (j === 0 || (i === 0 && w > 2)) c = hi;
          if (j === h - 1 && h > 1) c = lo;
          if (i === w - 1 && w > 2 && j > 0) c = lo;
          api.set(x + i, y + j, c);
        }
      }
      return api;
    },
    // Bresenham line, one pixel wide.
    line(x0, y0, x1, y1, c) {
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      for (;;) {
        api.set(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
      return api;
    },
    // Two-pixel tube: lit line above/left, shaded line below/right.
    tube(x0, y0, x1, y1, hi, lo) {
      const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
      api.line(x0 + (steep ? 1 : 0), y0 + (steep ? 0 : 1), x1 + (steep ? 1 : 0), y1 + (steep ? 0 : 1), lo);
      api.line(x0, y0, x1, y1, hi);
      return api;
    },
    // Four wide, three tall: gray tyre with a lit hub.
    wheel(x, y) {
      api.hline(x + 1, x + 2, y, "g");
      api.set(x, y + 1, "g").set(x + 1, y + 1, "w").set(x + 2, y + 1, "l").set(x + 3, y + 1, "g");
      api.hline(x + 1, x + 2, y + 2, "g");
      return api;
    },
    // Running gear: mid top, road wheels between black gaps, dark skirt.
    tread(x, y, w) {
      api.rect(x, y, w, 1, "m");
      for (let i = 0; i < w; i++) api.set(x + i, y + 1, i % 3 === 2 ? "k" : "g");
      api.rect(x, y + 2, w, 1, "d");
      return api;
    },
    // Paint an ASCII picture (letters as above, "." or space transparent)
    // with its top-left corner at ox,oy. Transparent cells leave what is there.
    paint(ox, oy, picture) {
      picture.forEach((row, j) => [...row].forEach((c, i) => {
        if (c !== "." && c !== " ") api.set(ox + i, oy + j, c);
      }));
      return api;
    },
    cell(x, y) { return px[y][x]; },
    // Black contour around the finished shape (4-neighbourhood), then the
    // shape is centered horizontally and stood on a common ground line.
    finish(o = {}) {
      const { ground = 13, centerY = false } = o;
      const out = px.map((row) => row.slice());
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          if (px[y][x] !== ".") continue;
          const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            return nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && px[ny][nx] !== "." && px[ny][nx] !== "k";
          });
          if (near) out[y][x] = "k";
        }
      }
      // Sprites are painted inside x 1..14 / y 1..14, so the contour always fits.
      let minX = SIZE, maxX = -1, minY = SIZE, maxY = -1;
      out.forEach((row, y) => row.forEach((c, x) => {
        if (c === ".") return;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }));
      const width = maxX - minX + 1, height = maxY - minY + 1;
      const left = Math.floor((SIZE - width) / 2);
      // A tall sprite may not leave room for the common ground line; it then
      // rests as low as its own height allows.
      const top = centerY ? Math.floor((SIZE - height) / 2) : Math.max(0, ground - (maxY - minY));
      if (top + height > SIZE) throw new Error("sprite does not fit its frame");
      const rows = Array.from({ length: SIZE }, () => Array(SIZE).fill("."));
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) rows[top + y - minY][left + x - minX] = out[y][x];
      return rows.map((r) => r.join(""));
    },
  };
  return api;
}

const DRAW = {};

/* --- Foot weapons teams -------------------------------------------------- */

// Kneeling mortarman, tube braced on a baseplate.
DRAW.IBEX = () => {
  const s = sprite();
  s.paint(1, 2, [
    "..........ww..",
    "..........lg..",
    ".........lg...",
    "..llm....lg...",
    ".lcccm..lg....",
    ".lcdcm..lg....",
    ".lccm..lg.....",
    "lccccmmlg.....",
    "lcccmmmg......",
    "lcmmmddg.g....",
    ".mmmmdd...g...",
    "..dddgggggggg.",
  ]);
  return s.finish();
};

// Standing missile gunner, launch tube resting on the shoulder.
DRAW.NETTLE = () => {
  const s = sprite();
  s.paint(1, 1, [
    "...........ww.",
    "...........lg.",
    "..lll.....lg..",
    ".lcccm...lg...",
    ".lcdcm..lg....",
    ".lcccm.lg.....",
    "lccccmlg......",
    "lcccmlg.......",
    "lccmmmm.......",
    "lcmmmdd.......",
    ".mmm.mmd......",
    ".mmm.mmd......",
    ".ddg.ddg......",
  ]);
  return s.finish();
};

// Sprinting skirmisher with a short carbine and a pack.
DRAW.FERRET = () => {
  const s = sprite();
  s.paint(1, 2, [
    ".......llm....",
    "......lcccm...",
    "......lcdcm...",
    "...dd.lccm....",
    "..dddlcccmm...",
    "..ddlccmmgggw.",
    "...dlcmmm.....",
    "....mmmmm.....",
    "...mmm.mmm....",
    "..mmm...mmm...",
    ".mmd.....mmd..",
    "ggg.......ggg.",
  ]);
  return s.finish();
};

/* --- Wheels and tracks --------------------------------------------------- */

// Road-bound rocket truck, rack raised over the cab.
DRAW.LOCUST = () => {
  const s = sprite();
  s.box(1, 8, 14, 3, { body: "m", hi: "c", lo: "d" });         // chassis
  s.box(10, 4, 5, 5, { body: "c", hi: "l", lo: "m" });         // cab
  s.rect(12, 5, 2, 2, "l").set(12, 5, "w");                    // windscreen
  s.tube(2, 7, 9, 3, "l", "c");                                // rockets, lit
  s.tube(2, 5, 8, 1, "w", "l");
  s.tube(4, 9, 10, 5, "c", "m");
  s.set(8, 1, "w").set(9, 2, "w").set(10, 3, "w");             // warhead tips
  s.wheel(1, 10).wheel(6, 10).wheel(11, 10);
  return s.finish();
};

// Self-propelled battery with a raised gun and a missile cluster.
DRAW.CYCLONE = () => {
  const s = sprite();
  s.tread(1, 10, 14);
  s.box(2, 7, 12, 3, { body: "c", hi: "l", lo: "m" });         // hull
  s.box(4, 4, 6, 3, { body: "c", hi: "l", lo: "m" });          // turret
  s.tube(8, 5, 14, 1, "l", "g");                               // howitzer, raised
  s.vline(3, 1, 3, "l").vline(4, 1, 3, "c").vline(5, 1, 3, "l"); // missile cluster
  s.set(3, 0, "w").set(5, 0, "w");
  s.hline(3, 5, 4, "d");
  return s.finish();
};

// Flak tank: hull gun forward, twin rockets angled at the sky.
DRAW.WARDEN = () => {
  const s = sprite();
  s.tread(1, 10, 14);
  s.box(1, 7, 14, 3, { body: "c", hi: "l", lo: "m" });         // hull
  s.hline(12, 14, 8, "g");                                     // hull gun
  s.box(4, 4, 7, 3, { body: "c", hi: "l", lo: "m" });          // turret
  s.tube(8, 4, 13, 0 + 1, "l", "g");                           // upper missile rail
  s.tube(9, 6, 14, 3, "l", "g");                               // lower missile rail
  s.set(13, 0, "w").set(14, 2, "w");
  s.rect(4, 2, 2, 2, "g").set(4, 2, "w");                      // radar dish
  return s.finish();
};

// Turretless casemate hunter; netting on the roof, long low gun.
DRAW.STALKER = () => {
  const s = sprite();
  s.tread(1, 10, 12);
  s.box(1, 8, 12, 2, { body: "c", hi: "l", lo: "m" });         // lower hull
  s.hline(4, 9, 4, "l").hline(3, 10, 5, "c").hline(2, 11, 6, "c").hline(1, 12, 7, "c");
  for (let x = 3; x <= 10; x++) {                              // camouflage netting
    if (x % 2 === 1) s.set(x, 5, "d");
    if (x % 2 === 0) s.set(x, 6, "d");
  }
  s.rect(10, 6, 2, 2, "m");                                    // mantlet
  s.hline(12, 14, 6, "l").hline(12, 14, 7, "g");               // long gun
  s.vline(14, 5, 8, "w");                                      // muzzle brake
  s.rect(3, 2, 3, 2, "c").hline(3, 5, 2, "l").set(4, 1, "w");  // commander cupola with periscope
  s.rect(7, 3, 2, 1, "m");                                     // engine deck
  return s.finish();
};

// Armored carrier: boxed hull, roof hatch with a rifleman, roof gun.
DRAW.BADGER = () => {
  const s = sprite();
  s.tread(1, 11, 14);
  s.box(1, 5, 14, 6, { body: "c", hi: "l", lo: "m" });         // hull
  s.erase(14, 5).erase(13, 5).erase(14, 6);                    // sloped nose
  s.hline(12, 14, 7, "g");                                     // vision block
  s.box(5, 2, 4, 3, { body: "c", hi: "l", lo: "m" });          // hatch coaming
  s.rect(6, 1, 2, 2, "l").set(6, 1, "w");                      // rifleman's helmet
  s.hline(9, 12, 4, "g");                                      // roof gun
  s.vline(4, 6, 9, "d").vline(9, 6, 9, "d");                   // door seams
  s.rect(10, 8, 2, 1, "m");
  return s.finish();
};

// Armored capturer: dozer blade forward, pennant on a whip mast.
DRAW.RHINO = () => {
  const s = sprite();
  s.tread(2, 11, 11);
  s.box(2, 6, 10, 5, { body: "c", hi: "l", lo: "m" });         // hull
  s.box(4, 4, 5, 2, { body: "c", hi: "l", lo: "m" });          // cupola
  s.box(12, 3, 3, 9, { body: "l", hi: "w", lo: "c" });         // blade
  s.vline(13, 5, 10, "c");
  s.hline(9, 11, 8, "g");                                      // blade arm
  s.vline(3, 0, 4, "g");                                       // whip mast
  s.hline(4, 6, 1, "w").hline(4, 5, 2, "l");                   // pennant
  return s.finish();
};

/* --- Fixed positions ----------------------------------------------------- */

// Domed pillbox behind sandbags, gun poking from the slit.
DRAW.REDOUBT = () => {
  const s = sprite();
  s.hline(5, 10, 3, "l");                                      // dome, lit top
  s.hline(3, 12, 4, "c").hline(2, 13, 5, "c").hline(1, 14, 6, "c").hline(1, 14, 7, "c");
  s.hline(4, 6, 4, "l").hline(3, 5, 5, "l");
  s.hline(5, 7, 3, "w").hline(4, 5, 4, "w");                        // glint on the dome
  s.vline(5, 0, 2, "g").set(5, 0, "w");                        // periscope mast
  s.vline(9, 1, 2, "g");                                       // antenna
  s.hline(12, 13, 6, "m").hline(13, 14, 7, "m");
  s.rect(8, 6, 4, 2, "k");                                     // firing slit
  s.hline(11, 14, 6, "l").hline(11, 14, 7, "g");               // gun barrel
  for (let y = 8; y <= 11; y++) {                              // sandbags
    for (let x = 1; x <= 14; x++) {
      const off = y % 2 === 0 ? 0 : 2;
      s.set(x, y, (x + off) % 4 === 3 ? "k" : y === 8 ? "l" : y === 11 ? "d" : "g");
    }
  }
  return s.finish();
};

// SAM pad: concrete apron, drum radar, two missiles on a rail.
DRAW.JAVELIN = () => {
  const s = sprite();
  s.paint(1, 1, [
    ".........ww...",
    "........wc....",
    ".......wc.....",
    "......wc......",
    ".gg..wc.......",
    "gwlgwc....wc..",
    ".g.......wc...",
    ".g......wc....",
  ]);
  s.box(4, 9, 8, 2, { body: "m", hi: "c", lo: "d" });          // turntable
  s.box(1, 11, 14, 3, { body: "g", hi: "l", lo: "d" });        // concrete apron
  return s.finish();
};

/* --- Air ----------------------------------------------------------------- */

// Gunship: rotor, bubble canopy, stub wing with a rocket pod, skids.
DRAW.HORNET = () => {
  const s = sprite();
  s.hline(1, 14, 2, "g").hline(4, 11, 1, "w");                 // main rotor
  s.vline(8, 3, 4, "g");                                       // mast
  s.box(5, 4, 8, 5, { body: "c", hi: "l", lo: "m" });          // fuselage
  s.rect(10, 5, 3, 3, "l").set(10, 5, "w");                    // canopy
  s.erase(12, 4).erase(12, 8);
  s.hline(1, 5, 5, "m").hline(1, 5, 6, "d");                   // tail boom
  s.vline(1, 2, 6, "c");                                       // tail fin
  s.set(0, 3, "g").set(2, 3, "g");                             // tail rotor
  s.box(6, 9, 5, 2, { body: "g", hi: "l", lo: "d" });          // rocket pod
  s.set(11, 9, "w");
  s.hline(4, 13, 12, "g");                                     // skid
  s.vline(6, 11, 12, "g").vline(11, 11, 12, "g");
  return s.finish({ centerY: true });
};

// Stand-off striker: delta wing, twin fins, one large missile under the belly.
DRAW.LANCER = () => {
  const s = sprite();
  s.box(2, 5, 12, 3, { body: "c", hi: "l", lo: "m" });         // fuselage
  s.hline(12, 14, 6, "l").set(14, 5, "c").set(14, 7, "m");     // nose
  s.rect(9, 4, 3, 1, "l");                                     // canopy
  s.vline(2, 2, 5, "c").vline(3, 3, 5, "c");                   // tail fin
  s.hline(4, 10, 8, "c").hline(5, 9, 9, "m").hline(6, 8, 10, "d"); // delta wing
  s.hline(3, 13, 11, "w").hline(3, 13, 12, "g");               // missile body
  s.set(14, 11, "w").set(2, 11, "g");                          // warhead, motor
  s.vline(4, 10, 13, "d").vline(9, 10, 13, "d");               // pylons
  return s.finish({ centerY: true });
};

// Interceptor in plan view: swept wings with a slender missile at each tip.
DRAW.MERLIN = () => {
  const s = sprite();
  s.paint(1, 1, [
    ".gggw.........",
    "..lc..........",
    "..lcc.........",
    "..cccl........",
    "...ccclc......",
    "..ccccccclllw.",
    "..mmmmmmmmmmm.",
    "...mmmdm......",
    "..mmmm........",
    "..mmd.........",
    "..dm..........",
    ".gggw.........",
  ]);
  return s.finish({ centerY: true });
};

// Jump-pack trooper hanging under twin gliding vanes, carbine forward.
DRAW.DRAGONFLY = () => {
  const s = sprite();
  s.paint(1, 2, [
    "ww..wl........",
    ".lw.www.......",
    "..lw.lw..llm..",
    "...lw.lwlcccm.",
    "....ggg.lcdcm.",
    "....ggglccccm.",
    "....gwglcccmgw",
    "....ggglcmmm..",
    "....wlg.mmmm..",
    "...wl...mm.mm.",
    "..w.....dd.dd.",
  ]);
  return s.finish({ centerY: true });
};

const ORDER = ["IBEX", "NETTLE", "FERRET", "LOCUST", "CYCLONE", "WARDEN", "STALKER", "BADGER", "RHINO",
  "REDOUBT", "JAVELIN", "HORNET", "LANCER", "MERLIN", "DRAGONFLY"];

const ART = {};
ORDER.forEach((id) => { ART[id] = DRAW[id](); });

module.exports = { ART, ORDER, SIZE };
