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
    CAMPAIGN:[{name:"Test mission",grid:[".."],units:[]}],EXPANSION_LEVELS:[],BASE_NECTARIS_LEVELS:[]};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/main.js"),"utf8"),context);
  listeners.DOMContentLoaded();
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
