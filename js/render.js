/* Nectaris remake — canvas renderer.
 *
 * All artwork is original, procedurally drawn geometry (no assets from the
 * original game). The whole map renders at once; zoom (wheel) and pan (drag)
 * are unlimited — the original's one-screen viewport is deliberately not
 * reproduced.
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
  }

  Renderer.prototype.fitToMap = function () {
    var g = this.game, s = this.hexSize;
    var mapW = (1.5 * (g.width - 1) + 2) * s;
    var mapH = (Math.sqrt(3) * (g.height + 0.5)) * s;
    var zx = (this.canvas.width - 40) / mapW;
    var zy = (this.canvas.height - 40) / mapH;
    this.zoom = Math.min(zx, zy, 1.6);
    this.originX = (this.canvas.width - mapW * this.zoom) / 2 + s * this.zoom;
    this.originY = (this.canvas.height - mapH * this.zoom) / 2 + s * this.zoom;
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
    var ctr = this.hexCenter(c, r);
    var s = this.hexSize * this.zoom;

    pathHex(ctx, ctr.x, ctr.y, s);
    ctx.fillStyle = terr.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(40,35,25,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Terrain decoration — simple original iconography.
    ctx.save();
    ctx.translate(ctr.x, ctr.y);
    var u = s / 34; // unit scale
    switch (terr.id) {
      case "road":
        ctx.strokeStyle = "#6b655c"; ctx.lineWidth = 8 * u;
        ctx.beginPath(); ctx.moveTo(-s * 0.75, 0); ctx.lineTo(s * 0.75, 0); ctx.stroke();
        ctx.strokeStyle = "#d8d2c4"; ctx.lineWidth = 1.2 * u;
        ctx.setLineDash([4 * u, 4 * u]);
        ctx.beginPath(); ctx.moveTo(-s * 0.7, 0); ctx.lineTo(s * 0.7, 0); ctx.stroke();
        ctx.setLineDash([]);
        break;
      case "waste":
        ctx.fillStyle = "rgba(90,75,50,0.5)";
        var spots = [[-9, -6, 4], [7, -9, 3], [2, 6, 5], [-7, 8, 3], [11, 3, 2.5]];
        for (var i = 0; i < spots.length; i++) {
          ctx.beginPath(); ctx.arc(spots[i][0] * u, spots[i][1] * u, spots[i][2] * u, 0, 7); ctx.fill();
        }
        break;
      case "hill":
        ctx.fillStyle = "#8d7a50";
        ctx.beginPath(); ctx.moveTo(-12 * u, 8 * u); ctx.quadraticCurveTo(-4 * u, -8 * u, 4 * u, 8 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#9d8a5e";
        ctx.beginPath(); ctx.moveTo(-2 * u, 9 * u); ctx.quadraticCurveTo(7 * u, -4 * u, 14 * u, 9 * u); ctx.closePath(); ctx.fill();
        break;
      case "mountain":
        ctx.fillStyle = "#665744";
        ctx.beginPath(); ctx.moveTo(-14 * u, 10 * u); ctx.lineTo(-2 * u, -12 * u); ctx.lineTo(8 * u, 10 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#7d6b52";
        ctx.beginPath(); ctx.moveTo(0, 10 * u); ctx.lineTo(9 * u, -6 * u); ctx.lineTo(16 * u, 10 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#e8e2d4";
        ctx.beginPath(); ctx.moveTo(-5 * u, -6 * u); ctx.lineTo(-2 * u, -12 * u); ctx.lineTo(1 * u, -6 * u); ctx.closePath(); ctx.fill();
        break;
      case "valley":
        ctx.strokeStyle = "#3d382f"; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(-12 * u, -6 * u); ctx.quadraticCurveTo(0, 2 * u, 12 * u, -4 * u); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10 * u, 6 * u); ctx.quadraticCurveTo(2 * u, 12 * u, 12 * u, 5 * u); ctx.stroke();
        break;
      case "bridge":
        ctx.fillStyle = "#4a453c";
        ctx.fillRect(-s * 0.8, -7 * u, s * 1.6, 14 * u);
        ctx.fillStyle = "#a89e8e";
        ctx.fillRect(-s * 0.8, -5 * u, s * 1.6, 10 * u);
        ctx.strokeStyle = "#6b655c"; ctx.lineWidth = 1.5 * u;
        for (i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 8 * u, -5 * u); ctx.lineTo(i * 8 * u, 5 * u); ctx.stroke(); }
        break;
      case "factory": case "base":
        var b = g.buildingAt(c, r);
        var col2 = PLAYER_COLORS[b && b.owner >= 0 ? b.owner : 2];
        if (terr.id === "factory") {
          ctx.fillStyle = "#7a756a";
          ctx.fillRect(-13 * u, -4 * u, 26 * u, 14 * u);
          ctx.fillStyle = col2.body;
          ctx.beginPath();
          ctx.moveTo(-13 * u, -4 * u); ctx.lineTo(-13 * u, -12 * u); ctx.lineTo(-5 * u, -4 * u);
          ctx.lineTo(-5 * u, -12 * u); ctx.lineTo(3 * u, -4 * u); ctx.lineTo(3 * u, -12 * u); ctx.lineTo(11 * u, -4 * u);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#3d382f";
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

  /* --- units ------------------------------------------------------------ */

  /* Original military silhouettes. Every role has a distinct profile plus a
   * two-letter stencil badge (drawn below), so units remain readable when
   * zoomed out without using any original-game artwork. Both styles share
   * the same geometry per role; only the rendering treatment differs. */
  function drawUnitBody(ctx, unit, u, colors) {
    if (theme.id === "classic") drawUnitBodyClassic(ctx, unit, u, colors);
    else drawUnitBodyNeon(ctx, unit, u, colors);
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

    function trackedHull(heavy) {
      ctx.fillStyle = "#22221f";
      roundRect(ctx, -12 * u, 2 * u, 24 * u, 8 * u, 3 * u); ctx.fill(); ctx.stroke();
      for (var wi = -8; wi <= 8; wi += 4) wheel(wi, 6, 2.1);
      ctx.fillStyle = colors.body;
      ctx.beginPath();
      ctx.moveTo(-10 * u, 2 * u); ctx.lineTo(-7 * u, -4 * u);
      ctx.lineTo((heavy ? 8 : 7) * u, -4 * u); ctx.lineTo(11 * u, 2 * u);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    switch (cls) {
      case "infantry":
        // Helmet, field pack, torso and shouldered rifle.
        ctx.fillStyle = colors.body;
        ctx.beginPath(); ctx.arc(-1 * u, -7 * u, 4 * u, Math.PI, 0); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(-1 * u, -6 * u, 2.8 * u, 0, Math.PI); ctx.fill(); ctx.stroke();
        roundRect(ctx, -5 * u, -3 * u, 8 * u, 10 * u, 2 * u); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.dark; roundRect(ctx, -8 * u, -2 * u, 4 * u, 7 * u, 1 * u); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 2.1 * u;
        ctx.beginPath(); ctx.moveTo(1 * u, -2 * u); ctx.lineTo(10 * u, -9 * u); ctx.stroke();
        ctx.strokeStyle = "#171714"; ctx.lineWidth = 2.5 * u;
        ctx.beginPath(); ctx.moveTo(-2 * u, 6 * u); ctx.lineTo(-6 * u, 12 * u);
        ctx.moveTo(1 * u, 6 * u); ctx.lineTo(6 * u, 12 * u); ctx.stroke();
        break;
      case "tank":
        trackedHull(id === "GIANT");
        ctx.fillStyle = colors.body;
        ctx.beginPath(); ctx.ellipse(-1 * u, -5 * u, id === "GIANT" ? 7 * u : 5.5 * u, 4 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(3 * u, -6 * u); ctx.lineTo(14 * u, -9 * u); ctx.stroke();
        if (id === "GIANT") {
          ctx.beginPath(); ctx.moveTo(3 * u, -3 * u); ctx.lineTo(14 * u, -5 * u); ctx.stroke();
        }
        ctx.fillStyle = colors.light; ctx.beginPath(); ctx.arc(-2 * u, -6 * u, 1.5 * u, 0, Math.PI * 2); ctx.fill();
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
        trackedHull(false);
        ctx.fillStyle = colors.body;
        ctx.beginPath(); ctx.moveTo(-7 * u, 0); ctx.lineTo(-4 * u, -6 * u);
        ctx.lineTo(5 * u, -6 * u); ctx.lineTo(8 * u, 1 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 2.6 * u;
        ctx.beginPath(); ctx.moveTo(1 * u, -5 * u); ctx.lineTo(13 * u, -14 * u); ctx.stroke();
        ctx.strokeStyle = "#171714"; ctx.lineWidth = 1.3 * u;
        ctx.beginPath(); ctx.moveTo(9 * u, -11 * u); ctx.lineTo(12 * u, -8 * u); ctx.stroke();
        break;
      case "buggy":
        // Armored scout car with a four-tube missile rack.
        ctx.fillStyle = colors.body;
        ctx.beginPath(); ctx.moveTo(-10 * u, 4 * u); ctx.lineTo(-7 * u, -3 * u);
        ctx.lineTo(5 * u, -3 * u); ctx.lineTo(10 * u, 4 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        wheel(-7, 6, 3.2); wheel(7, 6, 3.2);
        ctx.fillStyle = colors.light;
        for (var tube = 0; tube < 4; tube++) {
          roundRect(ctx, (-7 + tube * 3.5) * u, -10 * u, 3 * u, 6 * u, 1 * u); ctx.fill(); ctx.stroke();
        }
        break;
      case "antiair":
        trackedHull(false);
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

  var UNIT_MARKS = {
    CHARLIE: "CH", KILROY: "KI", PANTHER: "PA",
    BISON: "BI", LENET: "LE", POLAR: "PO", GRIZZLY: "GR",
    SLAGGER: "SL", TITAN: "TI", GIANT: "GI",
    EAGLE: "EA", FALCON: "FA", HUNTER: "HU",
    HADRIAN: "HA", OCTOPUS: "OC", ATLAS: "AT",
    RABBIT: "RA", LYNX: "LY", SEEKER: "SE", HAWKEYE: "HW",
    MULE: "MU", PELICAN: "PE", TRIGGER: "TR",
  };

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

    if (unit.moved && this.game.currentPlayer === unit.player) ctx.globalAlpha = 0.55;

    // flash overlay ring during battles
    var flash = this.flashUnits[unit.id];

    drawUnitBody(ctx, unit, u, colors);

    ctx.globalAlpha = 1;
    // Two-letter stencil makes individual chassis identifiable at a glance.
    ctx.fillStyle = theme.chrome.stencilBg;
    ctx.fillRect(-15 * u, -16 * u, 11 * u, 7 * u);
    ctx.fillStyle = theme.chrome.stencilText;
    ctx.font = "bold " + Math.max(5, Math.round(5.5 * u)) + "px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(UNIT_MARKS[unit.typeId] || unit.typeId.slice(0, 2), -9.5 * u, -12.5 * u);

    // Strength is omitted at 8 (the default). Damaged 1–7 stay bottom-left.
    var strCap = COMBAT.strengthCaption(unit.strength);
    if (strCap) {
      ctx.fillStyle = theme.chrome.strengthBg;
      ctx.fillRect(-15 * u, 5 * u, 10 * u, 11 * u);
      ctx.fillStyle = unit.strength <= 2 ? theme.chrome.strengthLow : theme.chrome.strengthOk;
      ctx.font = "bold " + Math.round(9 * u) + "px monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(strCap, -10 * u, 10.5 * u);
    }

    // experience pips (top-right)
    if (unit.exp > 0) {
      ctx.fillStyle = theme.chrome.pip;
      if (unit.exp >= 8) {
        drawStar(ctx, 11 * u, -11 * u, 4.5 * u);
      } else {
        for (var i = 0; i < unit.exp; i++) {
          ctx.beginPath();
          ctx.arc(14 * u - (i % 4) * 4 * u, -13 * u + Math.floor(i / 4) * 4 * u, 1.5 * u, 0, 7);
          ctx.fill();
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

  /* --- frame ------------------------------------------------------------ */

  Renderer.prototype.draw = function () {
    var ctx = this.ctx, g = this.game;
    ctx.fillStyle = "#181510";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var r, c;
    for (r = 0; r < g.height; r++) for (c = 0; c < g.width; c++) this.drawTerrainHex(c, r);

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

  return { Renderer: Renderer, PLAYER_COLORS: PLAYER_COLORS, setStyle: setStyle, getStyle: getStyle };
})();
