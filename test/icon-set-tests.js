"use strict";
module.exports = function (ok) {
  var fs = require("fs"), vm = require("vm");
  var native = require("../js/data-unit-art.js"), legacy = require("../js/data-unit-art-legacy.js");
  var code = fs.readFileSync(require.resolve("../js/unit-icon-sets.js"), "utf8");
  var KEY = "nectaris-unit-icon-set-v1";
  function fixture(saved, blocked) {
    var values = {}, events = {};
    if (saved !== undefined) values[KEY] = saved;
    var context = {
      NATIVE_UNIT_ART: native, LEGACY_UNIT_ART: legacy, module: { exports: {} },
      localStorage: {
        getItem: function (key) { if (blocked) throw Error("Storage unavailable"); return values[key] || null; },
        setItem: function (key, value) { if (blocked) throw Error("Storage unavailable"); values[key] = value; },
      },
      window: { addEventListener: function (name, listener) { events[name] = listener; } },
    };
    vm.runInNewContext(code, context);
    return { sets: context.module.exports, values: values, storage: events.storage };
  }
  var f=fixture(),sets=f.sets;
  ok(sets.list().map(function (p) { return p.id; }).join(",")==="remake,legacy", "Remake is the first set and Legacy is second");
  ok(sets.list()[0].label==="1 · Remake" && sets.list()[1].label==="Legacy", "icon set labels match the requested choices");
  ok(sets.getId()==="remake", "fresh browsers keep the existing remake art by default");
  ok(fixture("legacy").sets.current().art===legacy, "Legacy preference survives reloading a game or editor");
  ok(fixture("removed-pack").sets.getId()==="remake", "stale icon preferences fall back to the first set");
  var notifications=[];var unsubscribe=sets.onChange(function (id) { notifications.push(id); });
  sets.set("legacy");sets.set("legacy");
  ok(f.values[KEY]==="legacy" && notifications.join(",")==="legacy", "selection persists and redraws once per change");
  f.storage({key:KEY,newValue:"remake"});
  ok(sets.getId()==="remake" && notifications.length===2, "other tabs can update the visible icon set");
  f.storage({key:"unrelated-preference",newValue:"legacy"});
  ok(sets.getId()==="remake", "unrelated storage changes leave the icon set alone");
  unsubscribe();sets.set("legacy");
  ok(notifications.length===2, "disposed game views unsubscribe from icon redraws");
  f.storage({key:null,newValue:null});
  ok(sets.getId()==="remake", "clearing browser settings restores the default set");
  var rejected=false;
  try { sets.set("unknown"); } catch(e) { rejected=true; }
  ok(rejected && sets.getId()==="remake", "invalid selections cannot replace the active set");
  var locked=fixture("legacy",true);locked.sets.set("legacy");
  ok(locked.sets.getId()==="legacy", "icon sets remain usable when browser storage is blocked");
  sets.register({id:"future-set",label:"Future set",art:native});sets.set("future-set");
  ok(sets.list().length===3 && sets.current().art===native, "additional complete icon sets can be registered without renderer changes");
  rejected=false;
  try { sets.register({id:"legacy",label:"Duplicate",art:legacy}); } catch(e) { rejected=true; }
  ok(rejected,"duplicate set identifiers are rejected");
  var incomplete=JSON.parse(JSON.stringify(native));delete incomplete.frames.PELICAN.left;
  rejected=false;
  try { sets.register({id:"incomplete",label:"Incomplete",art:incomplete}); } catch(e) { rejected=true; }
  ok(rejected && sets.list().length===3,"partial sets are rejected instead of silently mixing unit art");
};
