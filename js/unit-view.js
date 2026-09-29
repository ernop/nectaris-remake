/* Shared unit names, icons and the standard unit mark for interface labels. */
"use strict";
var UNIT_VIEW = (function () {
  function esc(value) {
    return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function name(unit) {
    var type = unit && (unit.type || unit);
    var text = typeof type === "string" ? type : type && type.name || "Unit";
    return text.replace(/\s+[A-Z]+[A-Z0-9]*-?\d+$/, "");
  }
  function renderer() { return typeof module !== "undefined" ? require("./render.js") : RENDER; }
  function rankLabel(unit) {
    return unit.exp >= 8 ? "General" : unit.exp ? ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven"][unit.exp] + " experience star" + (unit.exp === 1 ? "" : "s") : "No experience stars";
  }
  // `state` repeats the map sprite's look: {spent: true} greys a finished
  // activation, {attacking: true} uses the attack palette.
  function iconHtml(unit, state) {
    var type = unit.type || unit, id = unit.typeId || type.id;
    return "<canvas class='unit-label-icon' width='32' height='32' aria-hidden='true' data-unit-type='" + esc(id) +
      "' data-player='" + (unit.player === undefined ? -1 : unit.player) + "' data-strength='" +
      (unit.strength === undefined ? 8 : unit.strength) + "'" + (state && state.spent ? " data-spent='1'" : "") +
      (state && state.attacking ? " data-attacking='1'" : "") + "></canvas>";
  }
  // Stars at the original's places in a box the icon's size. Stars above
  // `before` are new and glow; each starts `stepMs` per rank later.
  var MAX_EXP = 8, starArt = null;
  function pixelSvg(pattern) {
    var r = renderer(), paths = {};
    r.rankRuns(pattern).forEach(function (run) {
      paths[run[3]] = (paths[run[3]] || "") + "M" + run[0] + " " + run[1] + "h" + run[2] + "v1h-" + run[2] + "z";
    });
    return "<svg viewBox='0 0 " + pattern[0].length + " " + pattern.length +
      "' preserveAspectRatio='none' shape-rendering='crispEdges' aria-hidden='true' focusable='false'>" +
      Object.keys(paths).map(function (code) { return "<path fill='" + r.RANK_COLORS[code] + "' d='" + paths[code] + "'/>"; }).join("") +
      "</svg>";
  }
  function starsInner(before, shown, stepMs) {
    var r = renderer(), html = "";
    if (!starArt) starArt = {star: pixelSvg(r.RANK_STAR), general: pixelSvg(r.RANK_GENERAL)};
    function star(value, className, place, art) {
      var fresh = value > before, style = place + (fresh ? "animation-delay:-" + (shown - value) * stepMs + "ms" : "");
      return "<span class='" + className + (fresh ? " unit-star-new" : "") + "'" +
        (style ? " style='" + style + "'" : "") + ">" + art + "</span>";
    }
    if (shown >= MAX_EXP) return star(MAX_EXP, "unit-general", "", starArt.general);
    for (var rank = 1; rank <= shown; rank++) {
      var at = r.RANK_STAR_AT[rank - 1];
      html += star(rank, "unit-star", "left:" + at[0] / 16 * 100 + "%;top:" + at[1] / 16 * 100 + "%;", starArt.star);
    }
    return html;
  }
  function starsLabel(before, shown) {
    return rankLabel({exp: shown}) + (shown > before ? ", " + (shown - before) + " newly earned" : "");
  }
  function starsHtml(before, shown, stepMs) {
    return "<span class='unit-stars' role='img' aria-label='" + starsLabel(before, shown) + "' data-exp='" + shown + "'" +
      (shown > before ? " data-exp-glow-from='" + before + "'" : "") + ">" + starsInner(before, shown, stepMs) + "</span>";
  }
  // The standard unit mark: the icon, then its stars in a box of the same size.
  // The box stays when empty, so names line up and a first earned star moves
  // nothing. `opts`: `state` for the icon; `count`, a damaged squad's caption
  // to print on the icon's corner as the map sprite does; `before`, `shown` and
  // `stepMs` for earned stars.
  function markHtml(unit, opts) {
    opts = opts || {};
    var shown = opts.shown === undefined ? unit.exp || 0 : opts.shown;
    return "<span class='unit-mark'>" + iconHtml(unit, opts.state) +
      starsHtml(opts.before === undefined ? shown : opts.before, shown, opts.stepMs || 0) +
      (opts.count ? "<span class='unit-strength' role='img' aria-label='" + esc(opts.count) + " machines remaining'>" +
        esc(opts.count) + "</span>" : "") + "</span>";
  }
  function html(unit, state) {
    return "<span class='unit-label'>" + markHtml(unit, {state: state}) + "<span>" + esc(name(unit)) + "</span></span>";
  }
  // Draws every canvas the HTML describes: unit icons, and the battle screen's
  // hex map (a crop of the board, see RENDER.paintScene).
  function paint(container) {
    if (!container.querySelectorAll) return;
    var types = typeof module !== "undefined" ? require("./data-units.js").UNIT_TYPES : UNIT_TYPES;
    container.querySelectorAll("canvas[data-scene]").forEach(function (canvas) {
      renderer().paintScene(canvas, JSON.parse(canvas.getAttribute("data-scene")),
        canvas.getAttribute("data-crop").split(" ").map(Number));
    });
    container.querySelectorAll("canvas[data-unit-type]").forEach(function (canvas) {
      var id = canvas.getAttribute("data-unit-type"), type = types[id];
      if (!type) return;
      renderer().drawUnitIcon(canvas, {typeId:id,type:type,player:+canvas.getAttribute("data-player"),
        strength:+canvas.getAttribute("data-strength"),cargo:[]},
        {spent: canvas.getAttribute("data-spent") === "1", attacking: canvas.getAttribute("data-attacking") === "1"});
    });
  }
  // Adds the standard mark to a button or label. A unit type (editor palette)
  // has no experience and gets its icon alone.
  function addIcon(parent, unit) {
    var canvas = document.createElement("canvas");
    canvas.className = "unit-label-icon"; canvas.width = canvas.height = 32;
    canvas.setAttribute("aria-hidden", "true");
    parent.classList.add("unit-label");
    if (unit.type) {
      var mark = document.createElement("span"), stars = document.createElement("span"), exp = unit.exp || 0;
      mark.className = "unit-mark"; stars.className = "unit-stars";
      stars.setAttribute("role", "img"); stars.setAttribute("aria-label", starsLabel(exp, exp));
      stars.setAttribute("data-exp", exp); stars.innerHTML = starsInner(exp, exp, 0);
      mark.appendChild(canvas); mark.appendChild(stars); parent.appendChild(mark);
    } else parent.appendChild(canvas);
    renderer().drawUnitIcon(canvas, unit.type ? unit : {type:unit,typeId:unit.id,player:0,strength:8,exp:0,cargo:[]});
    return canvas;
  }
  return {name:name,rankLabel:rankLabel,html:html,iconHtml:iconHtml,markHtml:markHtml,starsHtml:starsHtml,
    paint:paint,addIcon:addIcon};
})();
if (typeof module !== "undefined") module.exports = UNIT_VIEW;
