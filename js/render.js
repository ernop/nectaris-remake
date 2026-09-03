/* Nectaris remake — canvas renderer.
 *
 * All artwork is original, procedurally drawn geometry (no assets from the
 * original game). The whole map renders at once; zoom (wheel) and constrained
 * pan (drag) replace the original's one-screen viewport.
 */
"use strict";

var RENDER = (function () {

  /* Two selectable visual styles (top-bar picker; persisted under the
   * localStorage key "nectaris-style"):
   *   classic — the remake's original look: solid painted silhouettes.
   *   neon    — wireframe glow, from the neon reference palette: dark
   *             plates, glowing faction outlines, yellow weapon accents.
   * Per faction, body/dark/light drive the classic icons and tint the
   * buildings in both styles; edge/rib/hot drive the neon linework. */

  /* Shared neon accents (faction-independent, neon style only). */
  var NEON = {
    ink: "#0e0b14",     // dark fill inside every silhouette
    yellow: "#eaff3d",  // weapons, canopies, tick marks
    pale: "#dcdce6",    // dashed structural details (rotors, radar, hubs)
  };

  var THEMES = {
    classic: {
      playerColors: [
        { body: "#3a6ea5", dark: "#274b70", light: "#7aa8d8", name: "Union (blue)" },
        { body: "#b04a3a", dark: "#763027", light: "#d88a7a", name: "Xenon (red)" },
        { body: "#8a8a8a", dark: "#5a5a5a", light: "#bcbcbc", name: "Neutral" },
      ],
      chrome: {
        stencilBg: "rgba(18,18,16,0.92)", stencilText: "#f2eddc",
        strengthBg: "#111", strengthLow: "#ff8f6f", strengthOk: "#ffe9a0",
        pip: "#ffd94a", select: "#ffe9a0",
      },
    },
    neon: {
      playerColors: [
        { body: "#9b4bd8", dark: "#5f2b8f", light: "#e06bff",
          edge: "#c455ff", rib: "#8038c0", hot: "#ff4fd8", name: "Union (violet)" },
        { body: "#e03a4a", dark: "#8f1f2c", light: "#ff8a94",
          edge: "#ff3d4d", rib: "#b3202f", hot: "#ff8c5a", name: "Xenon (red)" },
        { body: "#8a8a8a", dark: "#5a5a5a", light: "#c9c9d4",
          edge: "#d8d8e4", rib: "#84848f", hot: "#ffffff", name: "Neutral" },
      ],
      chrome: {
        stencilBg: "rgba(14,11,20,0.92)", stencilText: "#dcdce6",
        strengthBg: "#0e0b14", strengthLow: "#ff3d4d", strengthOk: "#eaff3d",
        pip: "#eaff3d", select: "#eaff3d",
      },
    },
    pixel: {
      playerColors: [
        { body: "#3a72c8", dark: "#1d3f7a", light: "#7fb8ff", name: "Union (blue)" },
        { body: "#c8402f", dark: "#7a1f22", light: "#ff9a72", name: "Xenon (red)" },
        { body: "#8a8a95", dark: "#4a4a52", light: "#d0d0da", name: "Neutral" },
      ],
      chrome: {
        stencilBg: "rgba(15,11,18,0.92)", stencilText: "#e8e4d8",
        strengthBg: "#0f0b12", strengthLow: "#ff6a4a", strengthOk: "#ffd23d",
        pip: "#ffd23d", select: "#ffffff",
      },
    },
  };
  (function () { for (var k in THEMES) THEMES[k].id = k; })();

  var STYLE_KEY = "nectaris-style";
  var theme;               // active THEMES entry
  var PLAYER_COLORS = [];  // exported by reference; repopulated on style change

  function setStyle(name) {
    if (!THEMES[name]) throw new Error("Unknown visual style: " + name);
    theme = THEMES[name];
    PLAYER_COLORS.length = 0;
    for (var i = 0; i < theme.playerColors.length; i++) PLAYER_COLORS.push(theme.playerColors[i]);
    if (typeof localStorage !== "undefined") localStorage.setItem(STYLE_KEY, name);
  }
  function getStyle() { return theme.id; }

  // Initial style: the stored preference when it names a known style
  // (an unset or stale preference is a valid state), otherwise neon.
  (function () {
    var saved = typeof localStorage !== "undefined" ? localStorage.getItem(STYLE_KEY) : null;
    setStyle(saved && THEMES[saved] ? saved : "neon");
  })();

  var TERRAIN_COLORS = {
    plain:    { base: "#a88b8c", dark: "#6d4d54", light: "#c2aaab", accent: "#d0bbba" },
    road:     { base: "#a88b8c", dark: "#4c4848", light: "#b8b7b0", accent: "#d3d0c4" },
    waste:    { base: "#4b252b", dark: "#2b1419", light: "#795259", accent: "#9b7476" },
    hill:     { base: "#8f7074", dark: "#583c44", light: "#b29294", accent: "#c2a7a5" },
    mountain: { base: "#665157", dark: "#36272d", light: "#9a8184", accent: "#c2a9a7" },
    valley:   { base: "#2c171c", dark: "#160b0e", light: "#5c3a42", accent: "#79555a" },
    bridge:   { base: "#2c171c", dark: "#494647", light: "#aaa8a2", accent: "#d1cec3" },
    factory:  { base: "#a88b8c", dark: "#4c4244", light: "#b9a6a5", accent: "#d2c1bd" },
    base:     { base: "#a88b8c", dark: "#4c4244", light: "#b9a6a5", accent: "#d2c1bd" },
  };

  function noise(col, row, index) {
    var x = Math.imul(col + 71, 374761393) ^ Math.imul(row + 43, 668265263) ^
      Math.imul(index + 17, 2246822519);
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
  }

  function shade(hex, factor) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * factor)));
    var g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * factor)));
    var b = Math.min(255, Math.max(0, Math.round((n & 255) * factor)));
    return "#" + [r, g, b].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("");
  }

  function Renderer(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.game = game;
    this.hexSize = 34;
    this.originX = 40;
    this.originY = 40;
    this.zoom = 1;
    this.highlights = null;   // {key -> css color}
    this.selected = null;     // unit
    this.hoverHex = null;
    this.attackables = null;  // array of units
    this.flashUnits = {};     // id -> color, battle flash
    this.strengthOverrides = {};
    this.battleGhosts = [];
    this.explosions = [];
  }

  Renderer.prototype.fitToMap = function () {
    var s = this.hexSize;
    var dims = this.mapDimensions();
    var mapW = dims.width, mapH = dims.height;
    var zx = (this.canvas.width - 40) / mapW;
    var zy = (this.canvas.height - 40) / mapH;
    this.zoom = Math.min(zx, zy, 1.6);
    this.originX = (this.canvas.width - mapW * this.zoom) / 2 + s * this.zoom;
    this.originY = (this.canvas.height - mapH * this.zoom) / 2 + s * this.zoom;
  };

  Renderer.prototype.mapDimensions = function () {
    return {
      width: (1.5 * (this.game.width - 1) + 2) * this.hexSize,
      height: Math.sqrt(3) * (this.game.height + 0.5) * this.hexSize,
    };
  };

  Renderer.prototype.panAxes = function () {
    var dims = this.mapDimensions();
    return {
      x: dims.width * this.zoom > this.canvas.width,
      y: dims.height * this.zoom > this.canvas.height,
    };
  };

  Renderer.prototype.constrainView = function () {
    var dims = this.mapDimensions();
    var axes = this.panAxes();
    var z = this.zoom, s = this.hexSize;
    var mapW = dims.width * z, mapH = dims.height * z;
    var margin = 16;

    if (!axes.x) {
      this.originX = (this.canvas.width - mapW) / 2 + s * z;
    } else {
      this.originX = Math.max(
        this.canvas.width - margin - mapW + s * z,
        Math.min(s * z + margin, this.originX)
      );
    }
    if (!axes.y) {
      this.originY = (this.canvas.height - mapH) / 2 + s * z;
    } else {
      this.originY = Math.max(
        this.canvas.height - margin - mapH + s * z,
        Math.min(s * z + margin, this.originY)
      );
    }
    return axes;
  };

  Renderer.prototype.panBy = function (dx, dy) {
    var beforeX = this.originX, beforeY = this.originY;
    var axes = this.panAxes();
    if (axes.x) this.originX += dx;
    if (axes.y) this.originY += dy;
    this.constrainView();
    return this.originX !== beforeX || this.originY !== beforeY;
  };

  Renderer.prototype.hexCenter = function (col, row) {
    var p = HEX.toPixel(col, row, this.hexSize);
    return { x: this.originX + p.x * this.zoom, y: this.originY + p.y * this.zoom };
  };

  Renderer.prototype.pixelToHex = function (px, py) {
    var x = (px - this.originX) / this.zoom;
    var y = (py - this.originY) / this.zoom;
    var off = HEX.fromPixel(x, y, this.hexSize);
    if (!this.game.inBounds(off.col, off.row)) return null;
    return off;
  };

  function pathHex(ctx, cx, cy, size) {
    var pts = HEX.corners(cx, cy, size);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
  }

  /* --- terrain ---------------------------------------------------------- */

  Renderer.prototype.drawTerrainHex = function (c, r) {
    var ctx = this.ctx, g = this.game;
    var terr = g.terrainAt(c, r);
    var pal = TERRAIN_COLORS[terr.id];
    var ctr = this.hexCenter(c, r);
    var s = this.hexSize * this.zoom;

    pathHex(ctx, ctr.x, ctr.y, s);
    ctx.fillStyle = pal.base;
    ctx.fill();
    ctx.strokeStyle = "rgba(30,14,18,0.22)";
    ctx.lineWidth = Math.max(0.6, this.zoom * 0.7);
    ctx.stroke();

    ctx.save();
    ctx.translate(ctr.x, ctr.y);
    var u = s / 34; // unit scale
    pathHex(ctx, 0, 0, s * 0.98);
    ctx.clip();

    // Stable coordinate-seeded marks keep the terrain textured without
    // shimmering between frames or repeating the same stamp in every hex.
    function speckles(count, color, radius) {
      ctx.fillStyle = color;
      for (var si = 0; si < count; si++) {
        var ang = noise(c, r, si * 3) * Math.PI * 2;
        var dist = Math.sqrt(noise(c, r, si * 3 + 1)) * s * 0.72;
        var rr = (0.35 + noise(c, r, si * 3 + 2) * radius) * u;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    switch (terr.id) {
      case "plain":
      case "road":
        speckles(10, "rgba(69,43,49,0.17)", 0.75);
        if (terr.id === "plain") {
          var craterX = (noise(c, r, 70) - 0.5) * 26 * u;
          var craterY = (noise(c, r, 71) - 0.5) * 20 * u;
          var craterR = (2.5 + noise(c, r, 72) * 3.5) * u;
          ctx.strokeStyle = pal.dark; ctx.globalAlpha = 0.34; ctx.lineWidth = 1.2 * u;
          ctx.beginPath(); ctx.ellipse(craterX, craterY, craterR, craterR * 0.58, -0.25, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = pal.light; ctx.globalAlpha = 0.28; ctx.lineWidth = 0.8 * u;
          ctx.beginPath(); ctx.arc(craterX - craterR * 0.2, craterY - craterR * 0.2, craterR * 0.62, Math.PI * 1.08, Math.PI * 1.82); ctx.stroke();
          ctx.globalAlpha = 1;
        }
        break;
      case "waste":
        speckles(26, pal.light, 1.15);
        ctx.strokeStyle = pal.accent; ctx.globalAlpha = 0.42; ctx.lineWidth = 1.2 * u;
        for (var wi = 0; wi < 5; wi++) {
          var wx = (noise(c, r, 90 + wi * 2) - 0.5) * 48 * u;
          var wy = (noise(c, r, 91 + wi * 2) - 0.5) * 34 * u;
          ctx.beginPath(); ctx.moveTo(wx - 2 * u, wy + 2 * u);
          ctx.lineTo(wx, wy - 2 * u); ctx.lineTo(wx + 3 * u, wy + 1 * u); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
      case "hill":
        ctx.fillStyle = pal.dark; ctx.globalAlpha = 0.48;
        ctx.beginPath(); ctx.moveTo(-24 * u, 14 * u);
        ctx.quadraticCurveTo(-8 * u, -17 * u, 8 * u, 14 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = pal.light; ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.moveTo(-9 * u, 15 * u);
        ctx.quadraticCurveTo(8 * u, -12 * u, 25 * u, 14 * u); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = pal.accent; ctx.lineWidth = 1.1 * u; ctx.globalAlpha = 0.58;
        for (var hi = 0; hi < 3; hi++) {
          ctx.beginPath(); ctx.ellipse((hi - 1) * 5 * u, 6 * u, (10 + hi * 4) * u,
            (4 + hi * 2) * u, -0.15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
      case "mountain":
        speckles(12, pal.dark, 1.0);
        ctx.fillStyle = pal.dark;
        ctx.beginPath(); ctx.moveTo(-20 * u, 14 * u); ctx.lineTo(-4 * u, -16 * u);
        ctx.lineTo(7 * u, 14 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = pal.light;
        ctx.beginPath(); ctx.moveTo(-4 * u, -16 * u); ctx.lineTo(-1 * u, 12 * u);
        ctx.lineTo(7 * u, 14 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = pal.base;
        ctx.beginPath(); ctx.moveTo(-2 * u, 14 * u); ctx.lineTo(11 * u, -9 * u);
        ctx.lineTo(22 * u, 14 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = pal.accent;
        ctx.beginPath(); ctx.moveTo(-8 * u, -9 * u); ctx.lineTo(-4 * u, -16 * u);
        ctx.lineTo(0, -7 * u); ctx.lineTo(-3 * u, -9 * u); ctx.closePath(); ctx.fill();
        break;
      case "valley":
      case "bridge":
        speckles(10, pal.light, 0.7);
        ctx.strokeStyle = pal.dark; ctx.lineWidth = 5 * u; ctx.globalAlpha = 0.72;
        ctx.beginPath(); ctx.moveTo(-28 * u, -8 * u);
        ctx.bezierCurveTo(-12 * u, 2 * u, 8 * u, -2 * u, 28 * u, 8 * u); ctx.stroke();
        ctx.strokeStyle = pal.accent; ctx.lineWidth = 1.2 * u; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(-28 * u, -14 * u);
        ctx.bezierCurveTo(-8 * u, -3 * u, 7 * u, -7 * u, 28 * u, 2 * u); ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      case "factory": case "base":
        speckles(10, "rgba(69,43,49,0.17)", 0.75);
        var b = g.buildingAt(c, r);
        var col2 = PLAYER_COLORS[b && b.owner >= 0 ? b.owner : 2];
        if (terr.id === "factory") {
          ctx.fillStyle = "#61575a";
          ctx.fillRect(-13 * u, -4 * u, 26 * u, 14 * u);
          ctx.fillStyle = col2.body;
          ctx.beginPath();
          ctx.moveTo(-13 * u, -4 * u); ctx.lineTo(-13 * u, -12 * u); ctx.lineTo(-5 * u, -4 * u);
          ctx.lineTo(-5 * u, -12 * u); ctx.lineTo(3 * u, -4 * u); ctx.lineTo(3 * u, -12 * u); ctx.lineTo(11 * u, -4 * u);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#2b2024";
          ctx.fillRect(-9 * u, 2 * u, 6 * u, 8 * u);
          if (b && b.stored.length) {
            ctx.fillStyle = "#ffe9a0";
            ctx.font = "bold " + (9 * u) + "px monospace"; ctx.textAlign = "center";
            ctx.fillText("" + b.stored.length, 7 * u, 9 * u);
          }
        } else {
          ctx.fillStyle = col2.body;
          ctx.beginPath(); ctx.arc(0, 2 * u, 12 * u, Math.PI, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = col2.dark;
          ctx.fillRect(-12 * u, 2 * u, 24 * u, 6 * u);
          ctx.fillStyle = "#f5f0e0";
          ctx.beginPath(); ctx.arc(0, 0, 4 * u, 0, 7); ctx.fill();
          // flag
          ctx.strokeStyle = "#e8e2d4"; ctx.lineWidth = 1.5 * u;
          ctx.beginPath(); ctx.moveTo(9 * u, 2 * u); ctx.lineTo(9 * u, -12 * u); ctx.stroke();
          ctx.fillStyle = col2.light;
          ctx.beginPath(); ctx.moveTo(9 * u, -12 * u); ctx.lineTo(17 * u, -9.5 * u); ctx.lineTo(9 * u, -7 * u); ctx.closePath(); ctx.fill();
        }
        break;
    }
    ctx.restore();
  };

  function connectsRoad(terr) {
    return terr && (terr.id === "road" || terr.id === "bridge" ||
      terr.id === "factory" || terr.id === "base");
  }

  Renderer.prototype.roadNeighbors = function (c, r) {
    var out = [];
    var ns = HEX.neighbors(c, r);
    for (var i = 0; i < ns.length; i++) {
      if (this.game.inBounds(ns[i].col, ns[i].row) &&
          connectsRoad(this.game.terrainAt(ns[i].col, ns[i].row))) out.push(ns[i]);
    }
    return out;
  };

  Renderer.prototype.roadHub = function (c, r, neighbors) {
    var center = this.hexCenter(c, r);
    var ns = neighbors || this.roadNeighbors(c, r);
    var sameRow = 0;
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].row === r) sameRow++;
    }
    // In an odd-column hex layout, same-row centers alternate vertically.
    // This tile variant moves its hub to the shared horizontal line.
    if (sameRow === 2 || (sameRow === 1 && ns.length === 1)) {
      center.y += (c & 1 ? -1 : 1) *
        this.hexSize * this.zoom * Math.sqrt(3) * 0.25;
    }
    return center;
  };

  Renderer.prototype.drawRoadNetwork = function () {
    var ctx = this.ctx, g = this.game;
    var segments = [], bridges = [];
    for (var r = 0; r < g.height; r++) {
      for (var c = 0; c < g.width; c++) {
        var terr = g.terrainAt(c, r);
        if (terr.id !== "road" && terr.id !== "bridge") continue;
        var center = this.hexCenter(c, r);
        var ns = this.roadNeighbors(c, r);
        var hub = this.roadHub(c, r, ns);
        if (!ns.length) {
          segments.push({ a: hub, b: hub });
        } else {
          for (var ni = 0; ni < ns.length; ni++) {
            var nc = this.hexCenter(ns[ni].col, ns[ni].row);
            segments.push({
              a: hub,
              b: { x: (center.x + nc.x) * 0.5,
                   y: (center.y + nc.y) * 0.5 },
            });
          }
        }
        if (terr.id === "bridge") bridges.push({ center: hub, neighbors: ns });
      }
    }

    function strokeSegments(color, width) {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        ctx.beginPath();
        if (seg.a.x === seg.b.x && seg.a.y === seg.b.y) {
          ctx.arc(seg.a.x, seg.a.y, width * 0.48, 0, Math.PI * 2);
        } else {
          ctx.moveTo(seg.a.x, seg.a.y); ctx.lineTo(seg.b.x, seg.b.y);
        }
        ctx.stroke();
      }
    }

    var scale = this.zoom;
    strokeSegments("#403b3d", 12 * scale);
    strokeSegments("#a9aaa6", 8 * scale);
    strokeSegments("rgba(222,220,209,0.42)", 1.1 * scale);

    for (var bi = 0; bi < bridges.length; bi++) {
      var br = bridges[bi], angle = 0;
      if (br.neighbors.length >= 2) {
        var p0 = this.hexCenter(br.neighbors[0].col, br.neighbors[0].row);
        var p1 = this.hexCenter(br.neighbors[br.neighbors.length - 1].col, br.neighbors[br.neighbors.length - 1].row);
        angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      } else if (br.neighbors.length === 1) {
        var pn = this.hexCenter(br.neighbors[0].col, br.neighbors[0].row);
        angle = Math.atan2(pn.y - br.center.y, pn.x - br.center.x);
      }
      var u = this.hexSize * scale / 34;
      ctx.save();
      ctx.translate(br.center.x, br.center.y); ctx.rotate(angle);
      ctx.fillStyle = "#494547"; ctx.fillRect(-34 * u, -8 * u, 68 * u, 16 * u);
      ctx.fillStyle = "#a9aaa6"; ctx.fillRect(-34 * u, -5.5 * u, 68 * u, 11 * u);
      ctx.strokeStyle = "#d3d0c4"; ctx.lineWidth = 1.2 * u;
      ctx.beginPath(); ctx.moveTo(-34 * u, -6 * u); ctx.lineTo(34 * u, -6 * u);
      ctx.moveTo(-34 * u, 6 * u); ctx.lineTo(34 * u, 6 * u); ctx.stroke();
      ctx.strokeStyle = "rgba(67,61,62,0.7)"; ctx.lineWidth = 1 * u;
      for (var tie = -28; tie <= 28; tie += 8) {
        ctx.beginPath(); ctx.moveTo(tie * u, -5 * u); ctx.lineTo(tie * u, 5 * u); ctx.stroke();
      }
      ctx.restore();
    }
  };

  /* --- units ------------------------------------------------------------ */

  /* Original military silhouettes. Every role has a distinct profile, so
   * units remain readable when zoomed out without any original-game artwork
   * and without text badges. */

  var TANK_ART = {
    BISON:   { hull: 23, turret: "round", turretW: 5.4, barrel: 13, barrelWidth: 2.1 },
    LENET:   { hull: 20, turret: "box", turretW: 4.8, barrel: 10, barrelWidth: 1.7, low: true },
    POLAR:   { hull: 27, turret: "round", turretW: 7.2, barrel: 11, barrelWidth: 3.0, skirts: true },
    GRIZZLY: { hull: 25, turret: "angular", turretW: 6.6, barrel: 17, barrelWidth: 2.5 },
    SLAGGER: { hull: 22, turret: "wedge", turretW: 5.2, barrel: 12, barrelWidth: 1.8, low: true },
    TITAN:   { hull: 26, turret: "box", turretW: 6.8, barrel: 15, barrelWidth: 2.6, pod: true },
    GIANT:   { hull: 29, turret: "angular", turretW: 8.4, barrel: 18, barrelWidth: 2.9, barrels: 2, skirts: true },
  };

  function drawUnitBody(ctx, unit, u, colors) {
    ctx.save();
    if (unit.player === 1) ctx.scale(-1, 1);
    if (theme.id === "classic") drawUnitBodyClassic(ctx, unit, u, colors);
    else if (theme.id === "pixel") drawUnitBodyPixel(ctx, unit, u, colors);
    else drawUnitBodyNeon(ctx, unit, u, colors);
    ctx.restore();
  }

  /* Pixel style: original 16-wide sprites drawn in the idiom of late-80s
   * console strategy art -- hard outline, a three-tone ramp per faction, a
   * white specular on the upper surfaces, and shared yellow for weapons.
   * The artwork is ours: these matrices were drawn for this project, not
   * traced or extracted from any release of the original game.
   *
   * Colour codes: o outline · d body dark · m body mid · l body light
   *               h specular · a weapon accent · g canopy glass
   *               t track · s wheel/steel
   */
  var PIXEL_SPRITES = {
    infantry: [
      "................",
      "......oooo......",
      ".....ohhhho.....",
      ".....ommmmo.....",
      "......oooo......",
      "....oommmmoo..a.",
      "...ommmmmmmo.a..",
      "...omllllllo.a..",
      "...ommmmmmmo....",
      "....oo.mm.oo....",
      "....o..oo..o....",
      "...oo......oo...",
    ],
    tank: [
      "................",
      "................",
      ".....oooooo.....",
      "....ommmmmmo....",
      "....omhmmmmoaaaa",
      "...oooooooooo...",
      "..ommmmmmmmmmo..",
      "..omllllllllmo..",
      "..otttttttttto..",
      "..osoosoosoosso.",
      "..oooooooooooo..",
      "................",
    ],
    air: [
      ".......oo.......",
      "......ohho......",
      "......oggo......",
      "......ommo......",
      ".....ommmmo.....",
      "oooooommmmoooooo",
      "ommmmmmmmmmmmmmo",
      "ollllmmmmmmllllo",
      "oooooommmmoooooo",
      ".....ommmmo.....",
      "......ommo......",
      ".....ommmmo.....",
      "....oo.oo.oo....",
      "................",
    ],
    artillery: [
      "..............aa",
      "............aa..",
      "..........aa....",
      ".....oooaa......",
      "....ommmmo......",
      "...ommhmmmo.....",
      "..oooooooooo....",
      ".ommmmmmmmmmo...",
      ".omllllllllmo...",
      ".otttttttttto...",
      ".osoosoosooso...",
      ".oooooooooooo...",
    ],
    buggy: [
      "................",
      "................",
      "...aa.aa.aa.aa..",
      "...oaooaooaooao.",
      "...oooooooooooo.",
      "..ommmmmmmmmmmo.",
      "..omhllllllllmo.",
      "..ommmmmmmmmmmo.",
      "..oooooooooooooo",
      "...oso.....oso..",
      "...oso.....oso..",
      "................",
    ],
    antiair: [
      "...........aa...",
      "..........aa....",
      ".......a.aa.....",
      "......aaa.......",
      ".....oooo.......",
      "....ommmmo......",
      "..oooooooooo....",
      ".ommmmmmmmmmo...",
      ".omhlllllllmo...",
      ".otttttttttto...",
      ".osoosoosooso...",
      ".oooooooooooo...",
    ],
    transport: [
      "................",
      "................",
      "...oooooo.......",
      "...ommmmoooooo..",
      "...omhlmommmmo..",
      "..ooooooommmmo..",
      "..ommmmmmmmmmo..",
      "..omllllllllmo..",
      "..oooooooooooo..",
      "...oso....oso...",
      "...oso....oso...",
      "................",
    ],
    helicopter: [
      "................",
      "..oooooooooooo..",
      "..ssssssssssss..",
      ".......oo.......",
      ".....oooooo.....",
      "....ommmmmmo....",
      "...ommggmmmmoooo",
      "...ommmmmmmmmmmo",
      "...ommllmmmmoooo",
      "....oooooooo....",
      "....o......o....",
      "...ooo....ooo...",
    ],
    mine: [
      "................",
      "......a..a......",
      "....oooooooo....",
      "...odddddddo....",
      "..odmmmmmmmdo...",
      "..odmmhhmmmdo...",
      "..odmmhhmmmdo...",
      "..odmmmmmmmdo...",
      "...odddddddo....",
      "....oooooooo....",
      "......a..a......",
      "................",
    ],
  };

  function pixelSpriteFor(unit) {
    var cls = unit.type.cls;
    if (cls === "transport" && unit.type.moveType === "air") return PIXEL_SPRITES.helicopter;
    return PIXEL_SPRITES[cls];
  }

  function drawUnitBodyPixel(ctx, unit, u, colors) {
    var art = pixelSpriteFor(unit);
    if (!art) {
      throw new Error("Pixel style has no sprite for unit class '" + unit.type.cls +
        "' (unit " + unit.typeId + "). Add one to PIXEL_SPRITES in js/render.js.");
    }
    var pal = {
      o: "#0f0b12", d: colors.dark, m: colors.body, l: colors.light,
      h: "#ffffff", a: "#ffd23d", g: "#9fe8ff", t: "#26262c", s: "#7a7a86",
    };
    var px = 1.95 * u;
    var w = art[0].length, h = art.length;
    var ox = -w * px / 2, oy = -h * px / 2;
    for (var r = 0; r < h; r++) {
      var row = art[r];
      for (var c = 0; c < row.length; c++) {
        var code = row.charAt(c);
        if (code === ".") continue;
        var fill = pal[code];
        if (!fill) {
          throw new Error("Unknown pixel-sprite colour code '" + code + "' at row " + r);
        }
        ctx.fillStyle = fill;
        // Half-pixel overdraw keeps the grid seam-free at fractional zoom.
        ctx.fillRect(ox + c * px, oy + r * px, px + 0.5, px + 0.5);
      }
    }
  }

  /* Neon style: every shape is a dark plate with a glowing faction-colored
   * outline, ribbed hatch lines for structure, dashed pale details, and
   * shared yellow accents on weapons and canopies. */
  function drawUnitBodyNeon(ctx, unit, u, colors) {
    var cls = unit.type.cls;
    var id = unit.typeId;
    var edge = colors.edge, rib = colors.rib, hot = colors.hot;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Fill the current path with the dark plate, then glow-stroke it.
    function shape(color, w) {
      ctx.fillStyle = NEON.ink; ctx.fill();
      ctx.shadowColor = color || edge; ctx.shadowBlur = 5 * u;
      ctx.strokeStyle = color || edge; ctx.lineWidth = (w || 1.4) * u;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function line(x0, y0, x1, y1, color, w, dash) {
      ctx.strokeStyle = color; ctx.lineWidth = w * u;
      if (dash) ctx.setLineDash([dash[0] * u, dash[1] * u]);
      ctx.beginPath(); ctx.moveTo(x0 * u, y0 * u); ctx.lineTo(x1 * u, y1 * u); ctx.stroke();
      ctx.setLineDash([]);
    }

    function dot(x, y, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x * u, y * u, r * u, 0, Math.PI * 2); ctx.fill();
    }

    // Hatch n-1 rib lines between edge A (x0,y0)-(x1,y1) and edge B.
    function ribs(x0, y0, x1, y1, x2, y2, x3, y3, n) {
      ctx.strokeStyle = rib; ctx.lineWidth = 0.9 * u;
      ctx.beginPath();
      for (var i = 1; i < n; i++) {
        var t = i / n;
        ctx.moveTo((x0 + (x1 - x0) * t) * u, (y0 + (y1 - y0) * t) * u);
        ctx.lineTo((x2 + (x3 - x2) * t) * u, (y2 + (y3 - y2) * t) * u);
      }
      ctx.stroke();
    }

    function wheel(x, y, r) {
      ctx.beginPath(); ctx.arc(x * u, y * u, r * u, 0, Math.PI * 2);
      shape(edge, 1.1);
      dot(x, y, r * 0.35, NEON.pale);
    }

    function trackedHull(heavy) {
      roundRect(ctx, -12 * u, 2 * u, 24 * u, 8 * u, 3 * u);
      shape(rib, 1.1);
      for (var wi = -8; wi <= 8; wi += 4) dot(wi, 6, 1.1, NEON.pale);
      ctx.beginPath();
      ctx.moveTo(-10 * u, 2 * u); ctx.lineTo(-7 * u, -4 * u);
      ctx.lineTo((heavy ? 8 : 7) * u, -4 * u); ctx.lineTo(11 * u, 2 * u);
      ctx.closePath();
      shape(edge, 1.4);
      ribs(-7, -4, (heavy ? 8 : 7), -4, -10, 2, 11, 2, 5);
    }

    switch (cls) {
      case "infantry":
        // Helmet with visor slit, field pack, torso and shouldered rifle.
        roundRect(ctx, -5 * u, -3 * u, 8 * u, 10 * u, 2 * u);
        shape(edge, 1.3);
        ribs(-5, 0, 3, 0, -5, 4, 3, 4, 3);
        ctx.beginPath(); ctx.arc(-1 * u, -7 * u, 4 * u, Math.PI, 0); ctx.closePath();
        shape(edge, 1.3);
        line(-4.4, -6.2, 2.4, -6.2, hot, 1.0);
        roundRect(ctx, -8 * u, -2 * u, 4 * u, 7 * u, 1 * u);
        shape(rib, 1.0);
        line(-2, 6, -6, 12, edge, 1.6); line(1, 6, 6, 12, edge, 1.6);
        line(1, -2, 10, -9, NEON.yellow, 1.6); dot(10, -9, 0.9, NEON.yellow);
        break;
      case "tank":
        trackedHull(id === "GIANT");
        ctx.beginPath();
        ctx.ellipse(-1 * u, -5 * u, (id === "GIANT" ? 7 : 5.5) * u, 4 * u, 0, 0, Math.PI * 2);
        shape(edge, 1.4);
        line(3, -6, 14, -9, NEON.yellow, 1.8); dot(14, -9, 1.0, NEON.yellow);
        if (id === "GIANT") {
          line(3, -3, 14, -5, NEON.yellow, 1.3); dot(14, -5, 0.8, NEON.yellow);
        }
        dot(-2, -6, 1.3, hot);
        break;
      case "air":
        // Fighter planform. Falcon has swept wings; Hunter has a broad delta.
        ctx.beginPath();
        ctx.moveTo(0, -14 * u);
        if (id === "HUNTER") {
          ctx.lineTo(4 * u, -2 * u); ctx.lineTo(13 * u, 8 * u); ctx.lineTo(3 * u, 4 * u);
        } else if (id === "FALCON") {
          ctx.lineTo(3 * u, -2 * u); ctx.lineTo(12 * u, 7 * u); ctx.lineTo(3 * u, 3 * u);
        } else {
          ctx.lineTo(3 * u, -2 * u); ctx.lineTo(13 * u, 2 * u); ctx.lineTo(3 * u, 4 * u);
        }
        ctx.lineTo(2 * u, 11 * u); ctx.lineTo(0, 8 * u); ctx.lineTo(-2 * u, 11 * u);
        ctx.lineTo(-3 * u, 4 * u);
        if (id === "HUNTER") ctx.lineTo(-13 * u, 8 * u);
        else if (id === "FALCON") ctx.lineTo(-12 * u, 7 * u);
        else ctx.lineTo(-13 * u, 2 * u);
        ctx.lineTo(-3 * u, -2 * u); ctx.closePath();
        shape(edge, 1.4);
        line(0, -13, 0, 10, rib, 0.9);
        var tipX = id === "EAGLE" ? 13 : (id === "FALCON" ? 12 : 13);
        var tipY = id === "EAGLE" ? 2 : (id === "FALCON" ? 7 : 8);
        dot(tipX, tipY, 0.9, hot); dot(-tipX, tipY, 0.9, hot);
        ctx.fillStyle = NEON.yellow;
        ctx.beginPath(); ctx.ellipse(0, -5 * u, 1.8 * u, 4 * u, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case "artillery":
        trackedHull(false);
        ctx.beginPath(); ctx.moveTo(-7 * u, 0); ctx.lineTo(-4 * u, -6 * u);
        ctx.lineTo(5 * u, -6 * u); ctx.lineTo(8 * u, 1 * u); ctx.closePath();
        shape(edge, 1.4);
        // Dotted elevation arc around the barrel pivot, then the gun itself.
        ctx.strokeStyle = NEON.pale; ctx.lineWidth = 0.8 * u;
        ctx.setLineDash([1.2 * u, 2 * u]);
        ctx.beginPath(); ctx.arc(1 * u, -5 * u, 7 * u, -1.7, -0.3); ctx.stroke();
        ctx.setLineDash([]);
        line(1, -5, 13, -14, NEON.yellow, 2.2);
        line(9, -11, 12, -8, hot, 1.2);
        break;
      case "buggy":
        // Armored scout car with a four-tube missile rack.
        ctx.beginPath(); ctx.moveTo(-10 * u, 4 * u); ctx.lineTo(-7 * u, -3 * u);
        ctx.lineTo(5 * u, -3 * u); ctx.lineTo(10 * u, 4 * u); ctx.closePath();
        shape(edge, 1.4);
        ribs(-7, -3, 5, -3, -10, 4, 10, 4, 4);
        wheel(-7, 6, 3.2); wheel(7, 6, 3.2);
        for (var tube = 0; tube < 4; tube++) {
          roundRect(ctx, (-7 + tube * 3.5) * u, -10 * u, 3 * u, 6 * u, 1 * u);
          shape(NEON.yellow, 1.0);
          dot(-5.5 + tube * 3.5, -10, 0.7, hot);
        }
        break;
      case "antiair":
        trackedHull(false);
        if (id === "HAWKEYE") {
          // Dashed radar sweep and a missile rail mark the ranged AA system.
          ctx.strokeStyle = NEON.pale; ctx.lineWidth = 1.0 * u;
          ctx.setLineDash([1.4 * u, 1.8 * u]);
          ctx.beginPath(); ctx.arc(-4 * u, -7 * u, 5 * u, -1.0, 1.0); ctx.stroke();
          ctx.setLineDash([]);
          line(-4, -7, -1, -5, rib, 1.0);
          line(-3, -3, 7, -12, NEON.yellow, 1.6); dot(7, -12, 0.9, hot);
        } else {
          line(-3, -2, 4, -13, NEON.yellow, 1.6); dot(4, -13, 0.9, hot);
          line(2, -2, 9, -11, NEON.yellow, 1.6); dot(9, -11, 0.9, hot);
        }
        break;
      case "transport":
        if (unit.type.moveType === "air") {
          // Pelican: unmistakable helicopter side profile, dashed rotor disc.
          ctx.beginPath(); ctx.moveTo(5 * u, -1 * u); ctx.lineTo(14 * u, -5 * u);
          ctx.lineTo(14 * u, 1 * u); ctx.lineTo(6 * u, 2 * u); ctx.closePath();
          shape(rib, 1.1);
          ctx.beginPath(); ctx.ellipse(-2 * u, 0, 9 * u, 6 * u, 0, 0, Math.PI * 2);
          shape(edge, 1.4);
          line(-1, -8, -1, -5, rib, 1.0);
          line(-14, -8, 12, -8, NEON.pale, 1.1, [3, 2]);
          ctx.strokeStyle = NEON.pale; ctx.lineWidth = 1.0 * u;
          ctx.setLineDash([1.4 * u, 1.6 * u]);
          ctx.beginPath(); ctx.arc(14 * u, -4 * u, 3 * u, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = NEON.yellow; ctx.fillRect(-8 * u, -3 * u, 5 * u, 3 * u);
        } else {
          // Mule: six-wheel armored cargo truck with ribbed box and cab.
          roundRect(ctx, -11 * u, -6 * u, 14 * u, 10 * u, 1 * u);
          shape(edge, 1.4);
          ribs(-11, -6, 3, -6, -11, 4, 3, 4, 4);
          ctx.beginPath(); ctx.moveTo(3 * u, -4 * u); ctx.lineTo(8 * u, -4 * u);
          ctx.lineTo(11 * u, 3 * u); ctx.lineTo(3 * u, 3 * u); ctx.closePath();
          shape(rib, 1.1);
          wheel(-7, 6, 2.8); wheel(0, 6, 2.8); wheel(8, 6, 2.8);
          ctx.fillStyle = NEON.yellow; ctx.fillRect(5 * u, -2 * u, 4 * u, 3 * u);
        }
        break;
      case "mine":
        // Raised anti-vehicle mine: dashed proximity ring, toothed body,
        // hot trigger cap.
        ctx.strokeStyle = NEON.pale; ctx.lineWidth = 0.9 * u;
        ctx.setLineDash([1.6 * u, 2.2 * u]);
        ctx.beginPath(); ctx.arc(0, 1 * u, 12.5 * u, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        for (var a = 0; a < 6; a++) {
          var ang = a * Math.PI / 3 + Math.PI / 6;
          line(Math.cos(ang) * 7, 1 + Math.sin(ang) * 7,
               Math.cos(ang) * 10.5, 1 + Math.sin(ang) * 10.5, edge, 1.3);
        }
        ctx.beginPath(); ctx.arc(0, 1 * u, 8 * u, 0, Math.PI * 2);
        shape(edge, 1.4);
        ctx.strokeStyle = NEON.yellow; ctx.lineWidth = 1.0 * u;
        ctx.beginPath(); ctx.arc(0, 1 * u, 4.6 * u, 0, Math.PI * 2); ctx.stroke();
        dot(0, 1, 2.6, hot);
        break;
      default:
        ctx.beginPath(); ctx.arc(0, 0, 8 * u, 0, Math.PI * 2);
        shape(edge, 1.4);
        dot(0, 0, 2, hot);
    }
  }

  /* Classic style: solid painted silhouettes with dark outlines. */
  function drawUnitBodyClassic(ctx, unit, u, colors) {
    var cls = unit.type.cls;
    var id = unit.typeId;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 1.6 * u;
    ctx.strokeStyle = "#171714";
    ctx.fillStyle = colors.body;

    function wheel(x, y, r) {
      ctx.fillStyle = "#22221f";
      ctx.beginPath(); ctx.arc(x * u, y * u, r * u, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = colors.light; ctx.lineWidth = 0.7 * u;
      ctx.beginPath(); ctx.arc(x * u, y * u, r * 0.45 * u, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#171714"; ctx.lineWidth = 1.6 * u;
    }

    function trackedHull(spec) {
      spec = spec || {};
      var half = (spec.hull || 23) / 2;
      var trackY = spec.low ? 3 : 2;
      ctx.fillStyle = "#22221f";
      roundRect(ctx, -half * u, trackY * u, half * 2 * u, (spec.skirts ? 9 : 8) * u, 3 * u); ctx.fill(); ctx.stroke();
      var wheelStart = -half + 4;
      for (var wi = wheelStart; wi <= half - 3; wi += 4) wheel(wi, trackY + 4, spec.skirts ? 2.3 : 2.0);
      ctx.fillStyle = colors.body;
      ctx.beginPath();
      ctx.moveTo((-half + 2) * u, trackY * u); ctx.lineTo((-half + 5) * u, (spec.low ? -2 : -4) * u);
      ctx.lineTo((half - 5) * u, (spec.low ? -2 : -4) * u); ctx.lineTo((half - 1) * u, trackY * u);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = colors.dark; ctx.lineWidth = 0.8 * u;
      ctx.beginPath();
      ctx.moveTo((-half + 4) * u, 0); ctx.lineTo((half - 3) * u, 0);
      ctx.stroke();
      ctx.strokeStyle = "#171714"; ctx.lineWidth = 1.6 * u;
    }

    switch (cls) {
      case "infantry":
        if (id === "PANTHER") {
          // Fast wheeled capturer: rider crouched over an armored motorcycle.
          wheel(-7, 7, 3.5); wheel(8, 7, 3.5);
          ctx.fillStyle = colors.body;
          ctx.beginPath(); ctx.moveTo(-8 * u, 5 * u); ctx.lineTo(-2 * u, -1 * u);
          ctx.lineTo(8 * u, 2 * u); ctx.lineTo(10 * u, 5 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = colors.light;
          ctx.beginPath(); ctx.arc(-1 * u, -7 * u, 3.6 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = colors.dark; ctx.lineWidth = 2 * u;
          ctx.beginPath(); ctx.moveTo(0, -3 * u); ctx.lineTo(5 * u, 2 * u);
          ctx.moveTo(4 * u, -1 * u); ctx.lineTo(11 * u, -5 * u); ctx.stroke();
          break;
        }
        // Helmet, field pack, torso and weapon; Kilroy is visibly heavier.
        ctx.fillStyle = colors.body;
        var heavyInf = id === "KILROY";
        ctx.beginPath(); ctx.arc(-1 * u, -7 * u, (heavyInf ? 4.7 : 4) * u, Math.PI, 0); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(-1 * u, -6 * u, (heavyInf ? 3.2 : 2.8) * u, 0, Math.PI); ctx.fill(); ctx.stroke();
        roundRect(ctx, (heavyInf ? -6 : -5) * u, -3 * u, (heavyInf ? 10 : 8) * u, 10 * u, 2 * u); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.dark; roundRect(ctx, (heavyInf ? -9 : -8) * u, -2 * u, (heavyInf ? 5 : 4) * u, 7 * u, 1 * u); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 2.1 * u;
        ctx.beginPath(); ctx.moveTo(1 * u, -2 * u); ctx.lineTo((heavyInf ? 13 : 10) * u, (heavyInf ? -4 : -9) * u); ctx.stroke();
        if (heavyInf) {
          ctx.fillStyle = colors.dark;
          roundRect(ctx, 7 * u, -7 * u, 7 * u, 5 * u, 1 * u); ctx.fill(); ctx.stroke();
        }
        ctx.strokeStyle = "#171714"; ctx.lineWidth = 2.5 * u;
        ctx.beginPath(); ctx.moveTo(-2 * u, 6 * u); ctx.lineTo(-6 * u, 12 * u);
        ctx.moveTo(1 * u, 6 * u); ctx.lineTo(6 * u, 12 * u); ctx.stroke();
        break;
      case "tank":
        var ta = TANK_ART[id] || TANK_ART.BISON;
        trackedHull(ta);
        var barrelCount = ta.barrels || 1;
        ctx.strokeStyle = colors.light; ctx.lineWidth = ta.barrelWidth * u;
        for (var barrel = 0; barrel < barrelCount; barrel++) {
          var by = (-7 + barrel * 4) * u;
          ctx.beginPath(); ctx.moveTo(2 * u, by); ctx.lineTo((2 + ta.barrel) * u, (by - 3 * u)); ctx.stroke();
        }
        ctx.fillStyle = colors.body;
        if (ta.turret === "box") {
          roundRect(ctx, -ta.turretW * u, -10 * u, ta.turretW * 2 * u, 8 * u, 1.4 * u); ctx.fill(); ctx.stroke();
        } else if (ta.turret === "angular") {
          ctx.beginPath(); ctx.moveTo(-ta.turretW * u, -4 * u);
          ctx.lineTo(-ta.turretW * 0.65 * u, -10 * u); ctx.lineTo(ta.turretW * 0.8 * u, -9 * u);
          ctx.lineTo(ta.turretW * u, -3 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (ta.turret === "wedge") {
          ctx.beginPath(); ctx.moveTo(-ta.turretW * u, -3 * u);
          ctx.lineTo(-2 * u, -10 * u); ctx.lineTo(ta.turretW * u, -5 * u);
          ctx.lineTo(ta.turretW * u, -2 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.ellipse(-1 * u, -6 * u, ta.turretW * u, 4 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        if (ta.skirts) {
          ctx.fillStyle = colors.dark;
          ctx.fillRect(-12 * u, 2 * u, 24 * u, 2.2 * u);
        }
        if (ta.pod) {
          ctx.fillStyle = colors.dark;
          roundRect(ctx, -11 * u, -10 * u, 5 * u, 7 * u, 1 * u); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = colors.light;
        ctx.beginPath(); ctx.arc(-2 * u, -7 * u, 1.5 * u, 0, Math.PI * 2); ctx.fill();
        break;
      case "air":
        // Fighter planform. Falcon has swept wings; Hunter has a broad delta.
        ctx.beginPath();
        ctx.moveTo(0, -14 * u);
        if (id === "HUNTER") {
          ctx.lineTo(4 * u, -2 * u); ctx.lineTo(13 * u, 8 * u); ctx.lineTo(3 * u, 4 * u);
        } else if (id === "FALCON") {
          ctx.lineTo(3 * u, -2 * u); ctx.lineTo(12 * u, 7 * u); ctx.lineTo(3 * u, 3 * u);
        } else {
          ctx.lineTo(3 * u, -2 * u); ctx.lineTo(13 * u, 2 * u); ctx.lineTo(3 * u, 4 * u);
        }
        ctx.lineTo(2 * u, 11 * u); ctx.lineTo(0, 8 * u); ctx.lineTo(-2 * u, 11 * u);
        ctx.lineTo(-3 * u, 4 * u);
        if (id === "HUNTER") ctx.lineTo(-13 * u, 8 * u);
        else if (id === "FALCON") ctx.lineTo(-12 * u, 7 * u);
        else ctx.lineTo(-13 * u, 2 * u);
        ctx.lineTo(-3 * u, -2 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.light;
        ctx.beginPath(); ctx.ellipse(0, -5 * u, 1.8 * u, 4 * u, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case "artillery":
        trackedHull({ hull: id === "ATLAS" ? 27 : 23, low: id === "HADRIAN" });
        if (id === "OCTOPUS") {
          // Multiple-rocket rack.
          ctx.fillStyle = colors.dark;
          roundRect(ctx, -7 * u, -12 * u, 15 * u, 9 * u, 1.5 * u); ctx.fill(); ctx.stroke();
          ctx.fillStyle = colors.light;
          for (var rocket = 0; rocket < 6; rocket++) {
            ctx.beginPath(); ctx.arc((-4 + (rocket % 3) * 4) * u,
              (-9 + Math.floor(rocket / 3) * 4) * u, 1.4 * u, 0, Math.PI * 2); ctx.fill();
          }
        } else if (id === "ATLAS") {
          // Immobile siege launcher with two elevated rails and rear brace.
          ctx.strokeStyle = colors.light; ctx.lineWidth = 2.8 * u;
          ctx.beginPath(); ctx.moveTo(-5 * u, -2 * u); ctx.lineTo(9 * u, -16 * u);
          ctx.moveTo(0, 0); ctx.lineTo(14 * u, -13 * u); ctx.stroke();
          ctx.fillStyle = colors.dark;
          roundRect(ctx, -9 * u, -7 * u, 9 * u, 8 * u, 1 * u); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = colors.body; ctx.lineWidth = 2 * u;
          ctx.beginPath(); ctx.moveTo(-8 * u, 0); ctx.lineTo(-13 * u, 8 * u); ctx.stroke();
        } else {
          // Hadrian: low enclosed self-propelled gun.
          ctx.fillStyle = colors.body;
          ctx.beginPath(); ctx.moveTo(-7 * u, 0); ctx.lineTo(-4 * u, -7 * u);
          ctx.lineTo(5 * u, -7 * u); ctx.lineTo(8 * u, 1 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = colors.light; ctx.lineWidth = 2.6 * u;
          ctx.beginPath(); ctx.moveTo(1 * u, -6 * u); ctx.lineTo(15 * u, -15 * u); ctx.stroke();
          ctx.strokeStyle = "#171714"; ctx.lineWidth = 1.3 * u;
          ctx.beginPath(); ctx.moveTo(10 * u, -12 * u); ctx.lineTo(13 * u, -9 * u); ctx.stroke();
        }
        break;
      case "buggy":
        // Rabbit is a tall four-tube striker; Lynx is a low twin-rail scout.
        ctx.fillStyle = colors.body;
        var rabbit = id === "RABBIT";
        ctx.beginPath(); ctx.moveTo((rabbit ? -11 : -9) * u, 4 * u); ctx.lineTo(-7 * u, (rabbit ? -4 : -2) * u);
        ctx.lineTo((rabbit ? 5 : 7) * u, -3 * u); ctx.lineTo((rabbit ? 11 : 10) * u, 4 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        wheel(-7, 6, rabbit ? 3.4 : 2.8); wheel(7, 6, rabbit ? 3.4 : 2.8);
        ctx.fillStyle = colors.light;
        var tubes = rabbit ? 4 : 2;
        for (var tube = 0; tube < tubes; tube++) {
          roundRect(ctx, (-6 + tube * (rabbit ? 3.5 : 7)) * u,
            (rabbit ? -11 : -8) * u, (rabbit ? 3 : 5) * u,
            (rabbit ? 7 : 4) * u, 1 * u); ctx.fill(); ctx.stroke();
        }
        break;
      case "antiair":
        trackedHull({ hull: id === "HAWKEYE" ? 25 : 22, low: id === "SEEKER" });
        ctx.strokeStyle = colors.light; ctx.lineWidth = 1.8 * u;
        if (id === "HAWKEYE") {
          // Radar dish and missile rail identify the ranged AA system.
          ctx.beginPath(); ctx.moveTo(-3 * u, -3 * u); ctx.lineTo(7 * u, -12 * u); ctx.stroke();
          ctx.beginPath(); ctx.arc(-4 * u, -7 * u, 5 * u, -1.0, 1.0); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(-3 * u, -2 * u); ctx.lineTo(4 * u, -13 * u); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(2 * u, -2 * u); ctx.lineTo(9 * u, -11 * u); ctx.stroke();
        }
        break;
      case "transport":
        if (unit.type.moveType === "air") {
          // Pelican: unmistakable helicopter side profile.
          ctx.fillStyle = colors.body;
          ctx.beginPath(); ctx.ellipse(-2 * u, 0, 9 * u, 6 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(5 * u, -1 * u); ctx.lineTo(14 * u, -5 * u);
          ctx.lineTo(14 * u, 1 * u); ctx.lineTo(6 * u, 2 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = "#171714"; ctx.lineWidth = 1.5 * u;
          ctx.beginPath(); ctx.moveTo(-14 * u, -8 * u); ctx.lineTo(12 * u, -8 * u); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-1 * u, -8 * u); ctx.lineTo(-1 * u, -5 * u); ctx.stroke();
          ctx.beginPath(); ctx.arc(14 * u, -4 * u, 3 * u, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = colors.light; ctx.fillRect(-8 * u, -3 * u, 5 * u, 3 * u);
        } else {
          // Mule: six-wheel armored cargo truck with cab and box.
          ctx.fillStyle = colors.body;
          roundRect(ctx, -11 * u, -6 * u, 14 * u, 10 * u, 1 * u); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(3 * u, -4 * u); ctx.lineTo(8 * u, -4 * u);
          ctx.lineTo(11 * u, 3 * u); ctx.lineTo(3 * u, 3 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
          wheel(-7, 6, 2.8); wheel(0, 6, 2.8); wheel(8, 6, 2.8);
          ctx.fillStyle = colors.light; ctx.fillRect(5 * u, -2 * u, 4 * u, 3 * u);
        }
        break;
      case "mine":
        // Raised anti-vehicle mine: toothed outer ring and pressure plate.
        ctx.fillStyle = colors.dark;
        ctx.beginPath(); ctx.arc(0, 1 * u, 8 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 1.6 * u;
        for (var a = 0; a < 6; a++) {
          var ang = a * Math.PI / 3;
          ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 7 * u, 1 * u + Math.sin(ang) * 7 * u);
          ctx.lineTo(Math.cos(ang) * 12 * u, 1 * u + Math.sin(ang) * 12 * u); ctx.stroke();
        }
        ctx.fillStyle = colors.light; ctx.beginPath(); ctx.arc(0, 1 * u, 3 * u, 0, Math.PI * 2); ctx.fill();
        break;
      default:
        ctx.beginPath(); ctx.arc(0, 0, 8 * u, 0, 7); ctx.fill(); ctx.stroke();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  Renderer.prototype.drawUnit = function (unit) {
    var ctx = this.ctx;
    var ctr = this.hexCenter(unit.col, unit.row);
    var s = this.hexSize * this.zoom;
    var u = s / 34;
    var colors = PLAYER_COLORS[unit.player];

    ctx.save();
    ctx.translate(ctr.x, ctr.y);

    if (unit.moved && this.game.currentPlayer === unit.player) {
      ctx.filter = "grayscale(1)";
    }

    // flash overlay ring during battles
    var flash = this.flashUnits[unit.id];

    drawUnitBody(ctx, unit, u, colors);

    // No stencil badge: the silhouettes are the identification, as in the
    // original, and the sidebar names the unit under the cursor.

    // Strength is omitted at 8 (the default). Damaged 1–7 stay bottom-left.
    var shownStrength = this.strengthOverrides[unit.id];
    if (shownStrength === undefined) shownStrength = unit.strength;
    var strCap = COMBAT.strengthCaption(shownStrength);
    if (strCap) {
      ctx.fillStyle = theme.chrome.strengthBg;
      ctx.fillRect(-15 * u, 5 * u, 10 * u, 11 * u);
      ctx.fillStyle = shownStrength <= 2 ? theme.chrome.strengthLow : theme.chrome.strengthOk;
      ctx.font = "bold " + Math.round(9 * u) + "px monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(strCap, -10 * u, 10.5 * u);
    }

    // Experience advances through 3/2/3 star columns; level 8 becomes General.
    if (unit.exp > 0) {
      ctx.fillStyle = theme.chrome.pip;
      if (unit.exp >= 8) {
        ctx.fillStyle = "#321a0d";
        drawStar(ctx, 10 * u, -10 * u, 7 * u);
        ctx.fillStyle = theme.chrome.pip;
        drawStar(ctx, 10 * u, -10 * u, 5.6 * u);
        ctx.fillStyle = theme.chrome.stencilText;
        ctx.beginPath(); ctx.arc(10 * u, -10 * u, 1.4 * u, 0, Math.PI * 2); ctx.fill();
      } else {
        var capacities = [3, 2, 3];
        var starIndex = 0;
        ctx.fillStyle = theme.chrome.pip;
        for (var column = 0; column < capacities.length; column++) {
          var count = capacities[column];
          var top = count === 3 ? -14 : -12;
          for (var row = 0; row < count && starIndex < unit.exp; row++, starIndex++) {
            drawStar(ctx, (6 + column * 4) * u, (top + row * 4) * u, 1.65 * u);
          }
        }
      }
    }

    // cargo marker
    if (unit.cargo && unit.cargo.length) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold " + Math.round(8 * u) + "px monospace";
      ctx.fillText("C", 12 * u, 12 * u);
    }

    if (flash) {
      ctx.strokeStyle = flash; ctx.lineWidth = 3 * u;
      ctx.beginPath(); ctx.arc(0, 0, 15 * u, 0, 7); ctx.stroke();
    }
    ctx.restore();
  };

  function drawUnitIcon(canvas, unit) {
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Factory unit icon requires a 2D canvas context");
    var base = PLAYER_COLORS[unit.player];
    if (!base) throw new Error("Factory unit icon has invalid player " + unit.player);
    var u = Math.min(canvas.width / 40, canvas.height / 38);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    drawUnitBody(ctx, unit, u, base);
    ctx.restore();
  }

  function drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 === 0 ? r : r * 0.45;
      var x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }

  Renderer.prototype.drawExplosion = function (effect) {
    var ctx = this.ctx;
    var ctr = this.hexCenter(effect.col, effect.row);
    var s = this.hexSize * this.zoom;
    var phase = Math.max(0, Math.min(1, effect.phase));
    var radius = s * (0.15 + Math.sin(phase * Math.PI) * 0.42);
    ctx.save();
    ctx.translate(ctr.x, ctr.y);
    ctx.globalAlpha = 1 - phase * 0.75;
    ctx.strokeStyle = "#fff0a0";
    ctx.lineWidth = Math.max(1.5, 2.5 * this.zoom);
    for (var i = 0; i < 10; i++) {
      var angle = i * Math.PI / 5 + effect.seed * 0.37;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.25, Math.sin(angle) * radius * 0.25);
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.fillStyle = phase < 0.45 ? "#fff4bd" : "#ff8b3d";
    ctx.beginPath(); ctx.arc(0, 0, radius * (0.5 - phase * 0.18), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#cf3d2e";
    ctx.lineWidth = Math.max(1, 2 * this.zoom);
    ctx.beginPath(); ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };

  /* --- frame ------------------------------------------------------------ */

  Renderer.prototype.draw = function () {
    var ctx = this.ctx, g = this.game;
    ctx.fillStyle = "#181510";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var r, c;
    for (r = 0; r < g.height; r++) for (c = 0; c < g.width; c++) this.drawTerrainHex(c, r);
    this.drawRoadNetwork();

    // movement / attack highlights (fill + bright outline for visibility)
    if (this.highlights) {
      for (var k in this.highlights) {
        var parts = k.split(",");
        var ctr = this.hexCenter(+parts[0], +parts[1]);
        pathHex(ctx, ctr.x, ctr.y, this.hexSize * this.zoom * 0.92);
        ctx.fillStyle = this.highlights[k];
        ctx.fill();
        ctx.strokeStyle = this.highlights[k].replace(/[\d.]+\)$/, "0.9)");
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // units (ground first, then air on top)
    var i, u;
    var list = [];
    for (i = 0; i < g.units.length; i++) {
      u = g.units[i];
      if (!u.carriedBy && !u.inFactory) list.push(u);
    }
    list.sort(function (a, b) { return (a.type.moveType === "air" ? 1 : 0) - (b.type.moveType === "air" ? 1 : 0); });
    for (i = 0; i < list.length; i++) this.drawUnit(list[i]);
    for (i = 0; i < this.battleGhosts.length; i++) {
      if (g.units.indexOf(this.battleGhosts[i]) < 0 &&
          this.strengthOverrides[this.battleGhosts[i].id] > 0) {
        this.drawUnit(this.battleGhosts[i]);
      }
    }
    for (i = 0; i < this.explosions.length; i++) this.drawExplosion(this.explosions[i]);

    // selected ring
    if (this.selected) {
      var sc = this.hexCenter(this.selected.col, this.selected.row);
      pathHex(ctx, sc.x, sc.y, this.hexSize * this.zoom);
      ctx.strokeStyle = theme.chrome.select; ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // hover outline
    if (this.hoverHex) {
      var hc = this.hexCenter(this.hoverHex.col, this.hoverHex.row);
      pathHex(ctx, hc.x, hc.y, this.hexSize * this.zoom);
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };

  return {
    Renderer: Renderer,
    PLAYER_COLORS: PLAYER_COLORS,
    drawUnitIcon: drawUnitIcon,
    setStyle: setStyle,
    getStyle: getStyle,
  };
})();

if (typeof module !== "undefined") module.exports = RENDER;
