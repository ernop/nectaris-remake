/* Selectable unit artwork. Each pack supplies complete 32x32 directional frames. */
"use strict";
var UNIT_ICON_SETS = (function () {
  var native = typeof NATIVE_UNIT_ART !== "undefined" ? NATIVE_UNIT_ART : require("./data-unit-art.js");
  var legacy = typeof LEGACY_UNIT_ART !== "undefined" ? LEGACY_UNIT_ART : require("./data-unit-art-legacy.js");
  var KEY = "nectaris-unit-icon-set-v1", packs = Object.create(null), order = [], listeners = [];
  var selected = "remake", stockIds = Object.keys(native.frames);

  function register(pack) {
    if (!pack || !/^[a-z][a-z0-9-]*$/.test(pack.id) || packs[pack.id]) throw new Error("Invalid or duplicate icon set");
    var art = pack.art;
    if (!pack.label || !art || art.frame !== 32 || !art.anchor || art.anchor[0] !== 16 || art.anchor[1] !== 16)
      throw new Error("Icon sets require 32x32 frames anchored at 16,16");
    ["union", "xenon", "attack", "neutral"].forEach(function (faction) {
      var palette = art.palettes && art.palettes[faction];
      if (!palette || palette.length !== 16 || palette.slice(1).some(function (c) { return !/^#[0-9a-f]{6}$/i.test(c); }))
        throw new Error(pack.id + ": invalid " + faction + " palette");
    });
    stockIds.forEach(function (id) {
      ["right", "left"].forEach(function (facing) {
        var rows = art.frames && art.frames[id] && art.frames[id][facing];
        if (!rows || rows.length !== 32 || rows.some(function (r) { return !/^[.1-9a-f]{32}$/.test(r); }) || !/[1-9a-f]/.test(rows.join("")))
          throw new Error(pack.id + ": missing or invalid " + id + "/" + facing);
      });
    });
    packs[pack.id] = pack; order.push(pack.id);
  }
  register({ id: "remake", label: "1 · Remake", art: native,
    sheet: "../art/units/output/units-native.png", description: "Original angular military artwork" });
  register({ id: "legacy", label: "Legacy", art: legacy, terrain: "legacy",
    sheet: "../art/legacy/output/units-native.png", description: "Imported from ユニットデータ",
    source: "https://anka.sakura.ne.jp/nectaris/d2.html" });

  try {
    var stored = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (packs[stored]) selected = stored;
  } catch (e) { /* Storage can be unavailable; keep the default artwork. */ }

  function choose(id, persist) {
    if (!packs[id]) throw new Error("Unknown unit icon set: " + id);
    var changed = selected !== id; selected = id;
    if (persist !== false) try {
      if (typeof localStorage !== "undefined") localStorage.setItem(KEY, id);
    } catch (e) { /* The selection still works for this page. */ }
    if (changed) listeners.slice().forEach(function (listener) { listener(id); });
  }
  if (typeof window !== "undefined" && window.addEventListener) window.addEventListener("storage", function (event) {
    if (event.key === KEY || event.key === null) choose(packs[event.newValue] ? event.newValue : "remake", false);
  });
  return {
    register: register,
    list: function () { return order.map(function (id) { return packs[id]; }); },
    get: function (id) { if (!packs[id]) throw new Error("Unknown unit icon set: " + id); return packs[id]; },
    current: function () { return packs[selected]; },
    getId: function () { return selected; },
    set: choose,
    onChange: function (listener) {
      listeners.push(listener);
      return function () { var i = listeners.indexOf(listener); if (i >= 0) listeners.splice(i, 1); };
    },
  };
})();
if (typeof module !== "undefined") module.exports = UNIT_ICON_SETS;
