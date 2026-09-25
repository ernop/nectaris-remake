/* Boot the real menu with isolated storage and a small DOM/event fixture. */
"use strict";
module.exports = function (ok) {
  var vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
  var PROFILES = require("../js/profiles.js"), campaign = require("../js/data-maps.js");
  var data = {}, nodes = {}, listeners = {}, documentListeners = {}, timers = new Map(), timerId = 0;
  var storage = {getItem:function(k){return data[k] || null;},setItem:function(k,v){data[k]=v;}};
  var store = new PROFILES.Store(storage), first = store.create("History player");
  for (var i=0;i<15;i++) store.checkpoint(first.id,{id:"menu-"+i,options:{campaignIndex:0},
    state:{map:campaign[0],winner:i%2,winReason:"base",turn:3}});
  var second = store.create("New player"); store.switchTo(first.id);
  var custom = {name:"<b>Custom field</b>",grid:["BF.","..B"],
    units:[{t:"CHARLIE",o:0,x:0,y:1},{t:"CHARLIE",o:1,x:2,y:0}],
    buildings:[{col:0,row:0,owner:0,stored:["BISON","BISON"]},
      {col:1,row:0,owner:-1,stored:["BISON","BISON","BISON"]},{col:2,row:1,owner:1}],
    source:"javascript:alert('not-a-source')"};
  storage.setItem("nectaris-custom-levels",JSON.stringify([custom]));
  function element(tag) {
    var classes = new Set(), html = "", text = "", id;
    var node = {tagName:tag,children:[],style:{},value:"",attributes:{},events:{},
      get id(){return id;},set id(value){id=value;nodes[value]=this;},
      get className(){return Array.from(classes).join(" ");},set className(value){classes=new Set(value.split(/\s+/));},
      get textContent(){return text+this.children.map(function(c){return c.textContent;}).join("");},
      set textContent(value){text=String(value);this.children=[];},
      get innerHTML(){return html;},set innerHTML(value){html=value;text="";this.children=[];},
      appendChild:function(child){child.remove();this.children.push(child);child.parentNode=this;return child;},
      remove:function(){if(this.parentNode){var list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}},
      replaceChildren:function(){this.children.forEach(function(c){c.parentNode=null;});this.children=[];text="";html="";},
      addEventListener:function(name,fn){this.events[name]=fn;},
      setAttribute:function(name,value){this.attributes[name]=String(value);},
      contains:function(other){return this===other || this.children.some(function(c){return c.contains(other);});},
      focus:function(){context.document.activeElement=this;if(this.onfocus)this.onfocus();},
      getBoundingClientRect:function(){return {left:20,right:46,top:200,bottom:226};},offsetWidth:360,offsetHeight:180,
      classList:{add:function(c){classes.add(c);},remove:function(c){classes.delete(c);},
        toggle:function(c,on){if(on)classes.add(c);else classes.delete(c);},contains:function(c){return classes.has(c);}}};
    return node;
  }
  function get(id){if(!nodes[id]){nodes[id]=element("div");nodes[id].id=id;}return nodes[id];}
  function all(node, cls){return (node.classList.contains(cls)?[node]:[]).concat(node.children.flatMap(function(c){return all(c,cls);}));}
  function find(node,cls){return all(node,cls)[0];}
  function flushTimers(){var pending=Array.from(timers.values());timers.clear();pending.forEach(function(fn){fn();});}
  function cards(id){return all(get(id),"level-card");}
  var openingInputs=["auto","original","offers"].map(function(value){return {value:value,checked:value==="auto"};});
  function selectOpening(value){
    openingInputs.forEach(function(input){input.checked=input.value===value;});
    get("opening-select").onchange({target:openingInputs.find(function(input){return input.checked;})});
  }
  var context = {document:{getElementById:get,createElement:element,baseURI:"http://nectaris.localhost/",activeElement:null,
      querySelector:function(selector){var value=selector.match(/\[value="([^"]+)"\]/);
        return openingInputs.find(function(input){return value?input.value===value[1]:input.checked;});},
      addEventListener:function(name,fn){documentListeners[name]=fn;}},
    localStorage:storage,PROFILES:PROFILES,AI_SEARCH:require("../js/ai-search.js"),URL:URL,
    setTimeout:function(fn){timers.set(++timerId,fn);return timerId;},clearTimeout:function(id){timers.delete(id);},
    window:{scrollY:0,innerWidth:1000,innerHeight:800,confirm:function(){return true;},
      scrollTo:function(x,y){this.scrollY=y;},addEventListener:function(name,fn){listeners[name]=fn;}},
    MUSIC:{init:function(){}},location:{search:"",protocol:"http:"},
    CAMPAIGN:campaign,ADVANCED_CAMPAIGN:require("../js/data-advanced-maps.js"),
    EXPANSION_LEVELS:require("../js/data-expansion-maps.js"),
    BASE_NECTARIS_LEVELS:require("../js/data-basenectaris-maps.js").BASE_NECTARIS_LEVELS,
    AI_MADE_LEVELS:require("../js/data-ai-maps.js"),
    ENVIRONMENT_CAMPAIGNS:require("../js/data-environment-campaigns.js")};
  var liveUI, liveSetup;
  context.ENGINE=require("../js/engine.js");
  context.BALANCE=require("../js/balance.js");
  context.BALANCE_UI={Setup:function(game,options){
    liveSetup=this;this.game=game;this.options=options;this.destroy=function(){this.destroyed=true;};
  }};
  context.UI={GameUI:function(canvas,game,options){
    liveUI=this;this.options=options;this.game=game;this.resize=this.destroy=function(){};
    this.snapshotForSave=function(){return game.snapshot();};
    this.beginAITurn=function(){this.aiStarted=true;};
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/main.js"),"utf8"),context);
  listeners.DOMContentLoaded();
  ok(cards("mission-list").length===16 && cards("advanced-mission-list").length===16,
    "both original campaigns use their complete sixteen-level collections");
  ok(get("map-jump").children[1].children.length===32,"map jump retains all original campaign indices");
  var aiLevels=context.AI_MADE_LEVELS;
  ok(cards("ai-made-list").length===aiLevels.length && aiLevels.every(function(level,i){
    return find(cards("ai-made-list")[i],"level-card-heading").textContent===level.name;
  }),"AI-made cards retain every separately named level in data order");
  var aiGroup=get("map-jump").children.find(function(g){return g.label==="AI-made";});
  ok(aiGroup.children.length===aiLevels.length && aiLevels.every(function(level,i){return aiGroup.children[i].value==="a:"+i;}),
    "map jump retains stable AI-made pack indices");
  ok(aiLevels.every(function(level,i){return PROFILES.levelKey(level,{aiMadeIndex:i})==="ai-made:"+i;}),
    "AI-made results retain their pack identity");
  context.ENVIRONMENT_CAMPAIGNS.forEach(function(campaign){
    var group=get("map-jump").children.find(function(g){return g.label===campaign.name;});
    ok(cards(campaign.id+"-list").length===16 && group.children.length===16 && campaign.levels.every(function(level,i){
      return find(cards(campaign.id+"-list")[i],"level-card-heading").textContent===level.name &&
        group.children[i].value==="t:"+campaign.id+":"+i &&
        PROFILES.levelKey(level,{environmentCampaign:campaign.id,environmentIndex:i})==="environment:"+campaign.id+":"+i;
    }),campaign.name+": sixteen ordered cards, jump options and independent progress keys");
  });
  ok(get("level-groups").children.length===9 && get("level-groups-nav").children.length===9,
    "one shared collection structure covers campaigns, packs and custom levels with jump navigation");
  ["mission-list","advanced-mission-list","ai-made-list","expansion-list","basenec-list","custom-list",
    "open-horizons-list","knotted-heart-list","broken-ground-list"].forEach(function(id){
    var card=cards(id)[0], columns=all(get(id),"level-columns");
    ok(columns.length===3 && columns.every(function(header){
      return header.children.slice(3,6).map(function(c){return c.textContent;}).join("/") === "Union/Xenon/Neutral";
    }), id+": all three listing columns identify their aligned numeric totals");
    ok(card.tagName==="article" && find(card,"level-card-heading") && find(card,"level-card-meta") &&
      find(card,"level-card-forces") && find(card,"mission-record") && find(card,"level-play") && find(card,"level-help"),
      id+": shared entry contains name, size, army totals, result, a large Play target and separate help");
    ok(!card.onclick && !card.onmouseenter && !card.onfocus && !card.title,
      id+": the wrapper never opens hover details or a native title tooltip");
    ok(find(card,"level-play").contains(find(card,"level-card-heading")) &&
      find(card,"level-play").contains(find(card,"level-card-forces")) &&
      !find(card,"level-play").contains(find(card,"level-help")) &&
      !find(card,"level-card-meta").textContent.includes("turn"),
      id+": name and counts are clickable, help is separate, and turn limits are omitted");
  });
  ok(find(get("normal-section"),"group-progress").textContent==="1 / 16 won" &&
    find(get("advanced-section"),"group-progress").textContent==="0 / 16 won",
    "collection progress counts won levels rather than wins or differently indexed campaigns");
  var normalCard=cards("mission-list")[0];
  ok(find(normalCard,"mission-record").textContent==="Victory · 8W / 7L",
    "cards retain the latest outcome and cumulative result counts");
  ok(get("profile-history").children.length===10 && get("history-count").textContent==="Showing 10 of 15 matches",
    "profile history initially exposes the ten most recent outcomes");
  var latest=get("profile-history").children[0];
  ok(latest.children[0].textContent==="REVOLT — Victory" && latest.children[1].textContent.startsWith("Base captured · Solo · Turn 3"),
    "history keeps the result, ending reason, mode and turn");
  get("history-more").onclick();
  ok(get("profile-history").children.length===15 && get("history-more").classList.contains("hidden"),"older outcomes stay accessible");
  get("profile-select").value=second.id;get("profile-select").onchange();
  ok(get("profile-history").children.length===0 && get("history-section").classList.contains("hidden") &&
    find(get("normal-section"),"group-progress").textContent==="0 / 16 won","profile switching resets history and collection progress");
  get("profile-select").value=first.id;get("profile-select").onchange();
  ok(get("profile-history").children.length===10 && get("profile-record").textContent.startsWith("8 wins · 7 losses"),
    "switching back restores independent results and resets history paging");
  var card=cards("ai-made-list")[0],help=find(card,"level-help"),panel=find(card,"level-briefing"),wrap=find(card,"level-help-wrap");
  ok(panel.classList.contains("hidden") && panel.textContent.includes(aiLevels[0].description) &&
    panel.textContent.includes(aiLevels[0].special) && panel.textContent.includes(aiLevels[0].tags[0]) &&
    panel.textContent.includes(aiLevels[0].author),"briefing, design notes, tags and credits are initially hidden behind help");
  help.onmouseenter();
  ok(panel.classList.contains("hidden"),"passing across the small help control does not immediately open details");
  wrap.onmouseleave();flushTimers();
  ok(panel.classList.contains("hidden"),"leaving before the hover delay cancels opening");
  help.onmouseenter();flushTimers();
  ok(!panel.classList.contains("hidden") && help.attributes["aria-expanded"]==="true","intentional help hover opens the associated details");
  help.onmouseleave({relatedTarget:panel});panel.onmouseenter();flushTimers();
  ok(!panel.classList.contains("hidden"),"moving into the panel keeps its source links reachable");
  panel.onmouseleave();
  ok(panel.classList.contains("hidden") && timers.size===0,"leaving help and its panel closes immediately without a dismissal timer");
  help.focus();
  ok(!panel.classList.contains("hidden"),"keyboard focus on the help button opens the same details");
  documentListeners.keydown({key:"Escape",stopPropagation:function(){}});
  ok(panel.classList.contains("hidden") && context.document.activeElement===help,"Escape closes details and retains focus at the help button");
  help.onclick();
  ok(!panel.classList.contains("hidden"),"click/touch opens details for reading");
  help.onmouseleave();
  ok(panel.classList.contains("hidden") && context.document.activeElement===help,
    "mouseout immediately closes clicked details even while the help button retains focus");
  help.onclick();
  documentListeners.pointerdown({target:card});
  ok(panel.classList.contains("hidden") && !liveUI,"outside click closes details without starting a match");
  help.onclick();help.onclick();
  ok(panel.classList.contains("hidden"),"a second click on help dismisses details");
  help.onclick();get("ai-made-list").events.scroll();
  ok(panel.classList.contains("hidden"),"horizontal list scrolling closes details");
  help.onclick();listeners.scroll();
  ok(panel.classList.contains("hidden"),"scrolling closes a detached help panel even if its button has focus");
  var otherHelp=find(cards("mission-list")[0],"level-help");help.onclick();otherHelp.focus();
  ok(panel.classList.contains("hidden") && otherHelp.attributes["aria-expanded"]==="true","only one help panel stays open across collections");
  listeners.resize();
  var customCard=cards("custom-list")[0];
  ok(find(customCard,"level-card-heading").textContent===custom.name && !find(customCard,"level-card-heading").innerHTML &&
    !find(find(customCard,"level-briefing"),"level-source"),"custom titles stay plain text and unsafe source schemes are omitted");
  ok(find(customCard,"level-card-meta").textContent==="3 × 2" &&
    find(customCard,"level-card-forces").innerHTML===
      "<span class='level-force force-union' aria-label='Union 3'><span class='force-count'>3</span></span>"+
      "<span class='level-force force-xenon' aria-label='Xenon 1'><span class='force-count'>1</span></span>"+
      "<span class='level-force force-neutral' aria-label='Neutral 3'><span class='force-count'>3</span></span>",
    "entries list Union, Xenon and Neutral in order, with field units plus each side’s stored reserves");
  ok(!find(customCard,"level-briefing").textContent.includes("undefined"),"missing custom metadata never displays undefined fields");
  var customTools=get("custom-level-tools");get("online-level-url").value="https://example.com/map.json";
  get("lang-select").value="ja";get("lang-select").onchange();
  ok(find(cards("basenec-list")[0],"level-card-heading").textContent===context.BASE_NECTARIS_LEVELS[0].nameJa &&
    find(cards("basenec-list")[0],"level-briefing").textContent.includes(context.BASE_NECTARIS_LEVELS[0].descriptionJa),
    "Japanese titles and briefings remain available in the common layout");
  ok(get("custom-level-tools")===customTools && customTools.parentNode.id==="custom-section" &&
    get("online-level-url").value==="https://example.com/map.json","menu rebuilds preserve import controls and the entered URL");
  get("lang-select").value="en";get("lang-select").onchange();
  context.window.scrollY=1460;get("chk-hotseat").checked=true;
  find(cards("advanced-mission-list")[0],"level-play").onclick();
  ok(get("menu-screen").classList.contains("hidden") && store.active().savedMatch.options.campaignIndex===16 && liveUI.options.hotseat,
    "Play starts the selected advanced mission with its original index and chosen mode");
  context.window.scrollY=0;liveUI.options.onMenu();
  ok(!get("menu-screen").classList.contains("hidden") && context.window.scrollY===1460,
    "returning from a match preserves the library scroll position after rebuilding cards");
  var previousSave=JSON.stringify(store.active().savedMatch),previousUI=liveUI;
  get("chk-hotseat").checked=false;
  find(cards("ai-made-list")[9],"level-play").onclick();
  ok(liveSetup && !liveSetup.options.hotseat && liveUI===previousUI &&
    JSON.stringify(store.active().savedMatch)===previousSave,
    "custom battles default to offers without starting play or replacing the existing checkpoint");
  ok(liveSetup.options.opponent==="apex","level picker passes the selected default algorithm into opening setup");
  liveSetup.options.onCancel();
  ok(liveSetup.destroyed && JSON.stringify(store.active().savedMatch)===previousSave &&
    !get("menu-screen").classList.contains("hidden"),"cancelling setup preserves the previous match and returns to the library");
  find(cards("ai-made-list")[9],"level-play").onclick();
  var plan=context.BALANCE.plan(liveSetup.game),decision=context.BALANCE.resolve(plan,1,[1,null]);
  liveSetup.options.onStart(decision,plan);
  var acceptedSave=store.active().savedMatch;
  ok(liveUI.aiStarted && liveUI.game.currentPlayer===1 && liveUI.game.firstPlayer===1 && liveSetup.destroyed,
    "accepting second launches the solo CPU first and closes the setup");
  ok(acceptedSave.options.balance.label==="1 × Charlie" && acceptedSave.state.balance.secondPlayer===0 &&
    get("balance-match-label").textContent==="Xenon first · Union bonus: 1 × Charlie",
    "the committed checkpoint and match toolbar retain the accepted compensation");
  liveUI.options.onMenu();var previousSetup=liveSetup;
  get("continue-button").onclick();
  ok(liveSetup===previousSetup && liveUI.aiStarted && liveUI.game.firstPlayer===1 &&
    liveUI.game.balance.label==="1 × Charlie", "continuing an agreed match preserves its opening without renegotiation");
  liveUI.options.onMenu();selectOpening("original");
  find(cards("ai-made-list")[9],"level-play").onclick();
  ok(liveSetup===previousSetup && !liveUI.game.balance && liveUI.game.firstPlayer===0,
    "Original opening bypasses offers even on a custom battle");
  liveUI.options.onMenu();selectOpening("offers");
  find(cards("mission-list")[0],"level-play").onclick();
  ok(liveSetup!==previousSetup && liveSetup.game.map.name===campaign[0].name,
    "explicit Compensation offers is available on an imported campaign without editing its source map");
  liveSetup.options.onStart(null);
  ok(!liveUI.game.balance && store.active().savedMatch.options.opening==="original",
    "the original-opening fallback starts a regular match with no compensation metadata");
  liveUI.options.onMenu();
  // Exercise real start/save/continue/next wiring, without changing browser storage.
  selectOpening("original");
  get("lang-select").onchange();get("chk-hotseat").checked=false;
  find(cards("open-horizons-list")[0],"level-play").onclick();
  var saved=store.active().savedMatch;
  ok(saved.options.environmentCampaign==="open-horizons" && saved.options.environmentIndex===0 &&
    saved.state.map.name===context.ENVIRONMENT_CAMPAIGNS[0].levels[0].name && get("map-jump").value==="t:open-horizons:0",
    "terrain campaign Play starts the selected mission and saves its campaign identity");
  liveUI.options.onMenu();get("continue-button").onclick();
  ok(store.active().savedMatch.id===saved.id && get("map-jump").value==="t:open-horizons:0",
    "Continue restores the same terrain-campaign match and map selector");
  liveUI.game.winner=0;liveUI.game.winReason="base";liveUI.options.onGameOver(0);
  ok(!get("gameover-next").classList.contains("hidden"),"terrain campaign completion offers the next mission");
  get("gameover-next").onclick();
  ok(store.active().savedMatch.options.environmentIndex===1 && store.active().savedMatch.options.environmentCampaign==="open-horizons",
    "Next mission advances inside its own sixteen-level campaign");
  liveUI.options.onMenu();
  ok(find(get("open-horizons-section"),"group-progress").textContent==="1 / 16 won" &&
    find(get("knotted-heart-section"),"group-progress").textContent==="0 / 16 won" &&
    find(get("broken-ground-section"),"group-progress").textContent==="0 / 16 won",
    "a terrain-campaign victory never leaks into another campaign's progress");
  get("map-jump").value="t:broken-ground:15";get("map-jump").onchange();
  ok(store.active().savedMatch.options.environmentCampaign==="broken-ground" && store.active().savedMatch.options.environmentIndex===15,
    "map jump switches directly to another terrain campaign's final mission");
  liveUI.game.winner=0;liveUI.game.winReason="base";liveUI.options.onGameOver(0);
  ok(get("gameover-next").classList.contains("hidden") && !get("gameover-next").onclick,
    "mission sixteen ends its campaign instead of advancing into an unrelated collection");
  liveUI.options.onMenu();
  storage.setItem("nectaris-custom-levels","[]");get("lang-select").onchange();
  ok(find(get("custom-list"),"empty-levels") && get("custom-level-tools").parentNode.id==="custom-section",
    "an empty custom collection still has a useful empty state and import controls");
};
