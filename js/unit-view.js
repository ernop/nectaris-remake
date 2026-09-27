/* Shared unit names and native-size icons for interface labels. */
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
  function iconHtml(unit) {
    var type = unit.type || unit, id = unit.typeId || type.id;
    return "<canvas class='unit-label-icon' width='32' height='32' aria-hidden='true' data-unit-type='" + esc(id) +
      "' data-player='" + (unit.player === undefined ? -1 : unit.player) + "' data-strength='" +
      (unit.strength === undefined ? 8 : unit.strength) + "' data-exp='" + (unit.exp || 0) + "'></canvas>";
  }
  function html(unit) {
    return "<span class='unit-label'>" + iconHtml(unit) + "<span>" + esc(name(unit)) + "</span></span>";
  }
  // The rank layout over a large icon, as in the original: stars fill the left
  // column up to 3, then the offset middle column up to 2, then the right
  // column up to 3; the eighth replaces them with one large General star.
  // Stars above `before` are new and glow; each starts `stepMs` per rank later.
  var MAX_EXP = 8;
  function rankHtml(before, shown, stepMs) {
    var html = "", rank = 0;
    function star(value, className) {
      var fresh = value > before;
      return "<span class='" + className + (fresh ? " battle-rank-new" : "") + "'" +
        (fresh ? " style='animation-delay:-" + (shown - value) * stepMs + "ms'" : "") + ">★</span>";
    }
    if (shown >= MAX_EXP) html = star(MAX_EXP, "battle-rank-general");
    else [3, 2, 3].forEach(function (capacity, column) {
      var stars = "";
      for (var row = 0; row < capacity && rank < shown; row++) stars += star(++rank, "battle-rank-star");
      if (stars) html += "<span class='battle-rank-col battle-rank-col-" + column + "'>" + stars + "</span>";
    });
    var label = rankLabel({exp: shown}) + (shown > before ? ", " + (shown - before) + " newly earned" : "");
    return "<span class='battle-rank' role='img' aria-label='" + label + "' data-exp='" + shown + "'" +
      (shown > before ? " data-exp-glow-from='" + before + "'" : "") + ">" + html + "</span>";
  }
  // A 64-pixel icon with the rank stars drawn over it, for inventories.
  function rankIconHtml(unit) {
    var exp = unit.exp || 0;
    return "<span class='battle-rank-icon rank-icon-inventory'>" + iconHtml(Object.assign({}, unit, {exp: 0})) +
      rankHtml(exp, exp, 0) + "</span>";
  }
  function paint(container) {
    if (!container.querySelectorAll) return;
    var types = typeof module !== "undefined" ? require("./data-units.js").UNIT_TYPES : UNIT_TYPES;
    container.querySelectorAll("canvas[data-unit-type]").forEach(function (canvas) {
      var id = canvas.getAttribute("data-unit-type"), type = types[id];
      if (!type) return;
      renderer().drawUnitIcon(canvas, {typeId:id,type:type,player:+canvas.getAttribute("data-player"),
        strength:+canvas.getAttribute("data-strength"),exp:+canvas.getAttribute("data-exp"),cargo:[]}, {experience:true});
    });
  }
  function addIcon(parent, unit) {
    var canvas = document.createElement("canvas");
    canvas.className = "unit-label-icon"; canvas.width = canvas.height = 32;
    canvas.setAttribute("aria-hidden", "true");
    parent.classList.add("unit-label"); parent.appendChild(canvas);
    renderer().drawUnitIcon(canvas, unit.type ? unit : {type:unit,typeId:unit.id,player:0,strength:8,exp:0,cargo:[]}, {experience:true});
    return canvas;
  }
  return {name:name,rankLabel:rankLabel,html:html,iconHtml:iconHtml,rankHtml:rankHtml,rankIconHtml:rankIconHtml,paint:paint,addIcon:addIcon};
})();
if (typeof module !== "undefined") module.exports = UNIT_VIEW;
