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
    return text.replace(/\s+[A-Z]+[A-Z0-9]*-\d+$/, "");
  }
  function renderer() { return typeof module !== "undefined" ? require("./render.js") : RENDER; }
  function iconHtml(unit) {
    var type = unit.type || unit, id = unit.typeId || type.id;
    return "<canvas class='unit-label-icon' width='32' height='32' aria-hidden='true' data-unit-type='" + esc(id) +
      "' data-player='" + (unit.player === undefined ? -1 : unit.player) + "' data-strength='" +
      (unit.strength === undefined ? 8 : unit.strength) + "' data-exp='" + (unit.exp || 0) + "'></canvas>";
  }
  function html(unit) {
    return "<span class='unit-label'>" + iconHtml(unit) + "<span>" + esc(name(unit)) + "</span></span>";
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
  return {name:name,html:html,iconHtml:iconHtml,paint:paint,addIcon:addIcon};
})();
if (typeof module !== "undefined") module.exports = UNIT_VIEW;
