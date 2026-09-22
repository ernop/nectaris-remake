/* Boot the real menu against a small DOM/storage fixture. */
"use strict";
module.exports = function (ok) {
  var vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
  var PROFILES = require("../js/profiles.js");
  var data = {}, nodes = {}, listeners = {};
  var storage = {getItem: function (k) { return data[k] || null; }, setItem: function (k,v) { data[k] = v; }};
  var store = new PROFILES.Store(storage), first = store.create("History player");
  for (var i=0;i<15;i++) store.checkpoint(first.id,{id:"menu-"+i,options:{campaignIndex:0},
    state:{map:{name:"Test mission",grid:[".."]},winner:i%2,winReason:"base",turn:3}});
  var second = store.create("New player"); store.switchTo(first.id);
  function element() {
    var classes = new Set();
    return {children:[],style:{},value:"",textContent:"",className:"",
      appendChild:function (child) { this.children.push(child); },
      replaceChildren:function () { this.children=[]; },
      addEventListener:function () {},
      classList:{add:function (c) {classes.add(c);},remove:function(c){classes.delete(c);},
        toggle:function(c,on){if(on)classes.add(c);else classes.delete(c);},contains:function(c){return classes.has(c);}}};
  }
  function get(id) { return nodes[id] || (nodes[id]=element()); }
  var context = {document:{getElementById:get,createElement:element,addEventListener:function(){}},
    localStorage:storage,PROFILES:PROFILES,window:{addEventListener:function(name,fn){listeners[name]=fn;}},
    MUSIC:{init:function(){}}, location:{search:""},
    CAMPAIGN:[{name:"Test mission",grid:[".."],units:[]}],
    ADVANCED_CAMPAIGN:require("../js/data-advanced-maps.js"), EXPANSION_LEVELS:[],BASE_NECTARIS_LEVELS:[],
    AI_MADE_LEVELS:require("../js/data-ai-maps.js")};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/main.js"),"utf8"),context);
  listeners.DOMContentLoaded();
  ok(get("mission-list").children.length === 1 && get("advanced-mission-list").children.length === 16,
    "menu lists normal and all sixteen advanced missions in separate sections");
  ok(get("map-jump").children[1].children.length === 17,
    "map jump includes the advanced campaign without hiding other packs");
  ok(get("ai-made-list").children.length === 7 &&
    get("ai-made-list").children[0].children[0].textContent.includes("TWISTED FJORDS") &&
    get("ai-made-list").children[1].children[0].textContent.includes("SHATTERED FJORDS") &&
    get("ai-made-list").children[2].children[0].textContent.includes("FRACTURED FJORDS") &&
    get("ai-made-list").children[3].children[0].textContent.includes("HONEYCOMB FJORDS") &&
    get("ai-made-list").children[4].children[0].textContent.includes("ARSENAL FJORDS") &&
    get("ai-made-list").children[5].children[0].textContent.includes("NEEDLE FJORDS") &&
    get("ai-made-list").children[6].children[0].textContent.includes("LABYRINTH FJORDS"),
    "AI-made category keeps all seven independently named fjord levels");
  var aiGroup = get("map-jump").children.find(function(g) { return g.label === "AI-made"; });
  ok(aiGroup && aiGroup.children[0].value === "a:0" && aiGroup.children[1].value === "a:1" &&
    aiGroup.children[2].value === "a:2" && aiGroup.children[3].value === "a:3" &&
    aiGroup.children[4].value === "a:4" && aiGroup.children[5].value === "a:5" &&
    aiGroup.children[6].value === "a:6", "map jump offers all seven AI-made levels");
  ok(PROFILES.levelKey(context.AI_MADE_LEVELS[0], {aiMadeIndex: 0}) === "ai-made:0" &&
    PROFILES.levelKey(context.AI_MADE_LEVELS[0], {}) !== "ai-made:0",
    "AI-made results have their own stable pack identity");
  ok(get("profile-history").children.length === 10, "menu initially shows the newest ten outcomes");
  ok(get("history-count").textContent === "Showing 10 of 15 matches" && !get("history-more").classList.contains("hidden"),
    "older outcomes have a visible navigation control");
  var latest = get("profile-history").children[0];
  ok(latest.children[0].textContent === "Test mission — Victory" && latest.children[1].textContent.indexOf("Base captured · Solo · Turn 3") === 0,
    "history displays result, ending reason, mode and turn");
  get("history-more").onclick();
  ok(get("profile-history").children.length === 15 && get("history-more").classList.contains("hidden"), "older outcomes remain accessible");
  get("profile-select").value = second.id; get("profile-select").onchange();
  ok(get("profile-history").children.length === 0 && get("history-section").classList.contains("hidden"), "switching profile removes previous player's history");
  get("profile-select").value = first.id; get("profile-select").onchange();
  ok(get("profile-history").children.length === 10 && get("profile-record").textContent.indexOf("8 wins · 7 losses") === 0,
    "switching back restores independent totals and resets history page");
};
