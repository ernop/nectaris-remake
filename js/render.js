/* Nectaris remake — canvas renderer.
 *
 * All artwork is original, procedurally drawn geometry (no assets from the
 * original game). The whole map renders at once; zoom (wheel) and pan (drag)
 * are unlimited — the original's one-screen viewport is deliberately not
 * reproduced.
 */
"use strict";

var RENDER = (function () {

  var PLAYER_COLORS = [
    { body: "#3a6ea5", dark: "#274b70", light: "#7aa8d8", name: "Union (blue)" },
    { body: "#b04a3a", dark: "#763027", light: "#d88a7a", name: "Xenon (red)" },
    { body: "#8a8a8a", dark: "#5a5a5a", light: "#bcbcbc", name: "Neutral" },
  ];

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

  /* Original geometric silhouettes per unit class. */
  function drawUnitBody(ctx, unit, u, colors) {
    var cls = unit.type.cls;
    ctx.lineWidth = 1.2 * u;
    ctx.strokeStyle = colors.dark;
    ctx.fillStyle = colors.body;
    switch (cls) {
      case "infantry":
        ctx.beginPath(); ctx.arc(0, -6 * u, 3.4 * u, 0, 7); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -3 * u); ctx.lineTo(0, 5 * u);
        ctx.moveTo(-5 * u, 0); ctx.lineTo(5 * u, -1 * u);
        ctx.moveTo(0, 5 * u); ctx.lineTo(-4 * u, 11 * u);
        ctx.moveTo(0, 5 * u); ctx.lineTo(4 * u, 11 * u);
        ctx.lineWidth = 2.4 * u; ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 1.4 * u;
        ctx.beginPath(); ctx.moveTo(4 * u, -8 * u); ctx.lineTo(8 * u, 2 * u); ctx.stroke(); // rifle
        break;
      case "tank":
        ctx.fillStyle = colors.dark;
        roundRect(ctx, -10 * u, 2 * u, 20 * u, 7 * u, 3 * u); ctx.fill();
        ctx.fillStyle = colors.body;
        roundRect(ctx, -8 * u, -4 * u, 16 * u, 7 * u, 2 * u); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(-1 * u, -4 * u, 4 * u, 0, 7); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(2 * u, -5 * u); ctx.lineTo(12 * u, -7 * u); ctx.stroke(); // barrel
        break;
      case "air":
        ctx.beginPath();
        ctx.moveTo(0, -11 * u); ctx.lineTo(3.5 * u, -2 * u); ctx.lineTo(11 * u, 4 * u);
        ctx.lineTo(3 * u, 3 * u); ctx.lineTo(2 * u, 9 * u); ctx.lineTo(0, 7 * u);
        ctx.lineTo(-2 * u, 9 * u); ctx.lineTo(-3 * u, 3 * u); ctx.lineTo(-11 * u, 4 * u);
        ctx.lineTo(-3.5 * u, -2 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.light;
        ctx.beginPath(); ctx.arc(0, -4 * u, 2 * u, 0, 7); ctx.fill();
        break;
      case "artillery":
        ctx.fillStyle = colors.dark;
        roundRect(ctx, -9 * u, 3 * u, 18 * u, 6 * u, 3 * u); ctx.fill();
        ctx.fillStyle = colors.body;
        roundRect(ctx, -7 * u, -2 * u, 14 * u, 6 * u, 2 * u); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 2.6 * u;
        ctx.beginPath(); ctx.moveTo(-2 * u, -1 * u); ctx.lineTo(9 * u, -11 * u); ctx.stroke(); // high barrel
        break;
      case "buggy":
        ctx.fillStyle = colors.body;
        roundRect(ctx, -8 * u, -3 * u, 16 * u, 7 * u, 3 * u); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.dark;
        ctx.beginPath(); ctx.arc(-5 * u, 6 * u, 3.4 * u, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(5 * u, 6 * u, 3.4 * u, 0, 7); ctx.fill();
        ctx.fillStyle = colors.light;
        roundRect(ctx, -3 * u, -8 * u, 8 * u, 4 * u, 1 * u); ctx.fill(); // missile box
        break;
      case "antiair":
        ctx.fillStyle = colors.body;
        roundRect(ctx, -8 * u, 0, 16 * u, 7 * u, 2 * u); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 1.8 * u;
        ctx.beginPath(); ctx.moveTo(-2 * u, 0); ctx.lineTo(5 * u, -10 * u); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2 * u, 0); ctx.lineTo(9 * u, -8 * u); ctx.stroke();
        break;
      case "transport":
        ctx.fillStyle = colors.body;
        roundRect(ctx, -9 * u, -6 * u, 18 * u, 12 * u, 3 * u); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 1.4 * u;
        ctx.strokeRect(-5 * u, -3 * u, 10 * u, 6 * u);
        if (unit.type.moveType === "air") {
          ctx.beginPath(); ctx.moveTo(-13 * u, 0); ctx.lineTo(13 * u, 0); ctx.stroke(); // rotor
        }
        break;
      case "mine":
        ctx.fillStyle = colors.dark;
        ctx.beginPath(); ctx.arc(0, 0, 7 * u, 0, 7); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = colors.light; ctx.lineWidth = 1.6 * u;
        for (var a = 0; a < 6; a++) {
          var ang = a * Math.PI / 3;
          ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 7 * u, Math.sin(ang) * 7 * u);
          ctx.lineTo(Math.cos(ang) * 11 * u, Math.sin(ang) * 11 * u); ctx.stroke();
        }
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

    if (unit.moved && this.game.currentPlayer === unit.player) ctx.globalAlpha = 0.55;

    // flash overlay ring during battles
    var flash = this.flashUnits[unit.id];

    drawUnitBody(ctx, unit, u, colors);

    ctx.globalAlpha = 1;
    // strength number (bottom-left, like the original's squad count)
    ctx.fillStyle = "#111";
    ctx.fillRect(-15 * u, 5 * u, 10 * u, 11 * u);
    ctx.fillStyle = unit.strength <= 2 ? "#ff8f6f" : "#ffe9a0";
    ctx.font = "bold " + Math.round(9 * u) + "px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("" + unit.strength, -10 * u, 10.5 * u);

    // experience pips (top-right)
    if (unit.exp > 0) {
      ctx.fillStyle = "#ffd94a";
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
      ctx.strokeStyle = "#ffe9a0"; ctx.lineWidth = 2.5;
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

  return { Renderer: Renderer, PLAYER_COLORS: PLAYER_COLORS };
})();
