/* Boot the real menu with isolated storage and a small DOM/event fixture. */
"use strict";
module.exports = function (ok) {
  var vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
  var PROFILES = require("../js/profiles.js"), campaign = require("../js/data-maps.js");
  var data = {}, nodes = {}, listeners = {}, documentListeners = {}, timers = new Map(), timerId = 0, thumbnails = [];
  var storage = {getItem:function(k){return data[k] || null;},setItem:function(k,v){data[k]=String(v);},
    removeItem:function(k){delete data[k];},key:function(i){return Object.keys(data)[i];},get length(){return Object.keys(data).length;}};
  var store = new PROFILES.Store(storage), first = store.create("History player");
  for (var i=0;i<15;i++) store.checkpoint(first.id,{id:"menu-"+i,key:"campaign:0",options:{campaignIndex:0},
    state:{map:campaign[0],winner:i%2,winReason:"base",turn:3}});
  var second = store.create("New player"); store.switchTo(first.id);
  var custom = {name:"<b>Custom field</b>",grid:["FF.","..B"],
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
      showModal:function(){this.open=true;},close:function(){this.open=false;},select:function(){},
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
  function selectOpening(value){get("opening-select").value=value;get("opening-select").onchange();}
  function setHotseat(on){get("chk-hotseat").checked=on;get("chk-hotseat").onchange();}
  function lastEvent(){var log=store.active().log;return log[log.length-1].event;}
  var context = {document:{getElementById:get,createElement:element,baseURI:"http://nectaris.localhost/",activeElement:null,
      addEventListener:function(name,fn){documentListeners[name]=fn;}},
    localStorage:storage,PROFILES:PROFILES,AI_SEARCH:require("../js/ai-search.js"),URL:URL,
    MAP_THUMBNAIL:{canvas:function(level,width,height){thumbnails.push({level:level,width:width,height:height});return element("canvas");}},
    setTimeout:function(fn){timers.set(++timerId,fn);return timerId;},clearTimeout:function(id){timers.delete(id);},
    window:{scrollY:0,innerWidth:1000,innerHeight:800,confirm:function(){return true;},
      history:{pushState:function(){context.location.hash="";}},
      scrollTo:function(x,y){this.scrollY=y;},addEventListener:function(name,fn){listeners[name]=fn;}},
    MUSIC:{init:function(){}},SFX:{init:function(){}},location:{search:"",hash:"",pathname:"/index.html",protocol:"http:"},
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
  // A player move: the AI finishes its turn first when it is the AI's to play.
  function act(){
    var g=liveUI.game;
    if(!liveUI.options.hotseat && g.currentPlayer!==liveUI.options.humanSide){g.endTurn();liveUI.options.onStateChange(liveUI);}
    g.units.find(function(u){return u.player===g.currentPlayer;}).moved=true;
    liveUI.options.onStateChange(liveUI);
  }
  // The menu draws every level's picture as it opens, so one it cannot draw would stop the whole menu.
  var THUMB=require("../js/map-thumbnail.js"),letters=Object.keys(require("../js/data-terrain.js").TERRAIN_BY_CHAR).join("");
  ok(THUMB.paint({grid:[letters]},60,10).length===60*10*4,"map pictures have a color for every terrain letter");
  var shipped=[].concat(campaign,context.ADVANCED_CAMPAIGN,context.EXPANSION_LEVELS,context.BASE_NECTARIS_LEVELS,
    context.AI_MADE_LEVELS,[].concat.apply([],context.ENVIRONMENT_CAMPAIGNS.map(function(c){return c.levels;})));
  ok(shipped.every(function(level){
    var size=THUMB.fit(level,160,80);
    return size.width<=160 && size.height<=80 && THUMB.paint(level,size.width,size.height).length===size.width*size.height*4;
  }),"every shipped level's picture fits its box and paints");
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/main.js"),"utf8"),context);
  listeners.DOMContentLoaded();
  ok(cards("mission-list").length===16 && cards("advanced-mission-list").length===16,
    "both original campaigns use their complete sixteen-level collections");
  var aiLevels=context.AI_MADE_LEVELS;
  ok(cards("ai-made-list").length===aiLevels.length && aiLevels.every(function(level,i){
    return find(cards("ai-made-list")[i],"level-card-heading").textContent===level.name;
  }),"AI-made cards retain every separately named level in data order");
  ok(aiLevels.every(function(level,i){return PROFILES.levelKey(level,{aiMadeIndex:i})==="ai-made:"+i;}),
    "AI-made results retain their pack identity");
  context.ENVIRONMENT_CAMPAIGNS.forEach(function(campaign){
    ok(cards(campaign.id+"-list").length===16 && campaign.levels.every(function(level,i){
      return find(cards(campaign.id+"-list")[i],"level-card-heading").textContent===level.name &&
        PROFILES.levelKey(level,{environmentCampaign:campaign.id,environmentIndex:i})==="environment:"+campaign.id+":"+i;
    }),campaign.name+": sixteen ordered cards and independent progress keys");
  });
  ok(get("level-groups").children.map(function(s){return s.id;}).join(",")===
    "normal-section,advanced-section,basenec-section,open-horizons-section,knotted-heart-section,broken-ground-section,"+
    "bridgeheads-section,siege-lines-section,arsenal-section,"+
    "ai-made-section,expansion-section,custom-section" && get("level-groups-nav").children.length===12,
    "collections list Normal, Advanced and Base Nectaris first, then the remaining packs, with jump navigation");
  ok(get("level-groups").children.map(function(s){return (find(s,"level-group-intro")||{}).textContent||"";}).filter(Boolean).join("|")===
    "From the PC Engine campaign.|Community terrain, with new forces and briefings for this remake.",
    "only the Normal campaign and Base Nectaris keep a one-line introduction");
  ["mission-list","advanced-mission-list"].forEach(function(id){
    ok(!all(get(id).parentNode,"level-help").length && get(id).classList.contains("no-help") &&
      cards(id).every(function(card){return card.classList.contains("no-help");}),
      id+": original-game campaigns show no level or collection help");
  });
  ["mission-list","advanced-mission-list","ai-made-list","expansion-list","basenec-list","custom-list",
    "open-horizons-list","knotted-heart-list","broken-ground-list"].forEach(function(id){
    var card=cards(id)[0], original=/mission-list$/.test(id), custom=id==="custom-list";
    ok(!all(get(id),"level-columns").length && card.tagName==="article" && find(card,"level-thumb") &&
      find(card,"level-card-heading") && find(card,"level-resume") && find(card,"mission-record") && find(card,"level-play") &&
      !find(card,"level-card-meta") && !find(card,"level-card-forces") && !!find(card,"level-help")===!(original || custom),
      id+": one line of map picture, number, name, unfinished match and record, without a header row, size or army totals");
    ok(!card.onclick && !card.onmouseenter && !card.onfocus && !card.title,
      id+": the wrapper never opens hover details or a native title tooltip");
    ok(find(card,"level-play").contains(find(card,"level-thumb")) && find(card,"level-play").contains(find(card,"level-card-heading")) &&
      (!find(card,"level-help") || !find(card,"level-play").contains(find(card,"level-help"))),
      id+": the map picture and name are clickable, and help is separate");
  });
  ok(find(get("normal-section"),"group-progress").textContent==="1 / 16 won" &&
    find(get("advanced-section"),"group-progress").textContent==="0 / 16 won",
    "collection progress counts won levels rather than wins or differently indexed campaigns");
  var normalCard=cards("mission-list")[0];
  ok(find(normalCard,"mission-record").textContent==="15 attempts · 8W / 7L" &&
    find(normalCard,"mission-record").children.filter(function(c){return c.tagName==="strong";}).map(function(c){return c.textContent;}).join()==="15,8,7",
    "cards count every attempt and the result totals, with the numbers set apart from their words");
  ok(thumbnails.some(function(t){return t.level===campaign[0] && t.width===80 && t.height===40;}),
    "every entry draws its map picture at most 80 × 40");
  var newest=get("history-list").children[0];
  ok(get("history-list").children.length===15 && newest.children.slice(1).map(function(c){return c.textContent;}).join("|")===
    "Won|Normal campaign 01 REVOLT|Union|turn 3|Base captured" &&
    get("history-summary").textContent==="15 attempts · 8 won · 7 lost · 0 hotseat · 0 abandoned · 0 in progress",
    "the History view lists each result with its collection, number, side, turn and ending, under the profile's totals");
  get("profile-select").value=second.id;get("profile-select").onchange();
  ok(get("history-list").children.length===0 && !get("history-empty").classList.contains("hidden") &&
    find(get("normal-section"),"group-progress").textContent==="0 / 16 won","profile switching shows the other profile's history and progress");
  var pages=store.create("Pages");
  for (var e=0;e<201;e++) store.record(pages.id,{at:new Date(Date.UTC(2020,0,1,0,e)).toISOString(),event:"start",
    match:"page-"+e,key:"campaign:1",name:campaign[1].name,side:0,hotseat:false,opponent:"classic",turn:1});
  get("profile-select").value=pages.id;get("profile-select").onchange();
  ok(get("history-list").children.length===200 && !get("history-more").classList.contains("hidden") &&
    get("history-count").textContent==="Showing the latest 200 of 201 events","the History view shows 200 events at a time");
  get("history-more").onclick();
  ok(get("history-list").children.length===201 && get("history-more").classList.contains("hidden") &&
    find(get("history-list").children[200],"history-level").textContent==="Normal campaign 02 "+campaign[1].name,
    "Show older events adds the older ones");
  get("profile-select").value=first.id;get("profile-select").onchange();
  ok(get("history-list").children.length===15 && get("profile-record").textContent.startsWith("8 wins · 7 losses"),
    "switching back restores independent results");
  context.location.hash="#history";listeners.hashchange();
  ok(!get("history-view").classList.contains("hidden") && get("campaigns-view").classList.contains("hidden") &&
    get("tab-history").attributes["aria-current"]==="page" && get("tab-campaigns").attributes["aria-current"]==="false",
    "the History tab shows the play history in place of the level list");
  get("tab-campaigns").onclick({preventDefault:function(){}});
  ok(get("history-view").classList.contains("hidden") && !get("campaigns-view").classList.contains("hidden") &&
    context.location.hash==="" && get("tab-campaigns").attributes["aria-current"]==="page",
    "Campaigns returns to the level list without reloading the page");
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
  var otherHelp=find(cards("expansion-list")[0],"level-help");help.onclick();otherHelp.focus();
  ok(panel.classList.contains("hidden") && otherHelp.attributes["aria-expanded"]==="true","only one help panel stays open across collections");
  listeners.resize();
  var customCard=cards("custom-list")[0];
  ok(find(customCard,"level-card-heading").textContent===custom.name && !find(customCard,"level-card-heading").innerHTML &&
    !find(customCard,"level-help"),"custom titles stay plain text, and an unsafe source scheme alone never earns a help button");
  ok(!customCard.textContent.includes("undefined"),"missing custom metadata never displays undefined fields");
  var customTools=get("custom-level-tools");get("online-level-url").value="https://example.com/map.json";
  selectOpening("original");
  ok(find(cards("basenec-list")[0],"level-card-heading").textContent===context.BASE_NECTARIS_LEVELS[0].name &&
    find(cards("basenec-list")[0],"level-briefing").textContent.includes(context.BASE_NECTARIS_LEVELS[0].description),
    "Base Nectaris entries show their English names and briefings");
  ok(get("custom-level-tools")===customTools && customTools.parentNode.id==="custom-section" &&
    get("online-level-url").value==="https://example.com/map.json","menu rebuilds preserve import controls and the entered URL");

  // Opening a level only to look leaves nothing behind; the first move starts the match.
  var logBefore=store.active().log.length;
  context.window.scrollY=1460;setHotseat(true);
  find(cards("advanced-mission-list")[0],"level-play").onclick();
  ok(get("menu-screen").classList.contains("hidden") && liveUI.options.hotseat && !store.sessions(first.id).length &&
    store.active().log.length===logBefore,"opening a level shows it without saving a match or adding to the history");
  act();
  var hotseatSave=store.session(first.id,"campaign:16:hotseat");
  ok(hotseatSave && hotseatSave.options.campaignIndex===16 && lastEvent()==="start",
    "the first move saves the match in its board's hotseat slot and records the start");
  context.window.scrollY=0;liveUI.options.onMenu();
  ok(!get("menu-screen").classList.contains("hidden") && context.window.scrollY===1460,
    "returning from a match preserves the library scroll position after rebuilding cards");
  var advancedCard=cards("advanced-mission-list")[0];
  ok(lastEvent()==="leave" && find(advancedCard,"level-resume").textContent==="Resume turn 1" &&
    find(advancedCard,"mission-record").textContent==="1 attempt" && get("continue-list").children.length===1,
    "leaving records the exit, and the entry and the Continue line offer the unfinished match");
  var previousSave=JSON.stringify(store.sessions(first.id)),previousUI=liveUI;
  ok(get("opening-select").value==="original" && previousUI.game.firstPlayer===0 && !previousUI.game.balance,
    "Normal is the default Mode and starts play without offers");
  setHotseat(false);
  ok(find(cards("advanced-mission-list")[0],"level-resume").textContent==="",
    "a hotseat match is its own slot, apart from the solo match of the same level");
  selectOpening("offers");
  ok(data["nectaris-opening"]==="offers","the chosen Mode persists");
  find(cards("ai-made-list")[9],"level-play").onclick();
  ok(liveSetup && !liveSetup.options.hotseat && liveUI===previousUI &&
    JSON.stringify(store.sessions(first.id))===previousSave,
    "Offer for first opens setup without starting play or replacing the existing checkpoint");
  ok(liveSetup.options.opponent==="classic","level picker passes the selected default algorithm into opening setup");
  liveSetup.options.onCancel();
  ok(liveSetup.destroyed && JSON.stringify(store.sessions(first.id))===previousSave &&
    !get("menu-screen").classList.contains("hidden"),"cancelling setup preserves the previous match and returns to the library");
  find(cards("ai-made-list")[9],"level-play").onclick();
  var plan=context.BALANCE.plan(liveSetup.game),decision=context.BALANCE.resolve(plan,1,[1,null]);
  liveSetup.options.onStart(decision,plan);
  var acceptedSave=store.session(first.id,"ai-made:9:offers");
  ok(liveUI.aiStarted && liveUI.game.currentPlayer===1 && liveUI.game.firstPlayer===1 && liveSetup.destroyed,
    "accepting second launches the solo CPU first and closes the setup");
  ok(acceptedSave && acceptedSave.options.balance.label==="1 × Charlie" && acceptedSave.state.balance.secondPlayer===0 &&
    get("balance-match-label").textContent==="Xenon first · Union bonus: 1 × Charlie" && lastEvent()==="start",
    "answering the offers starts the match, and its save and toolbar retain the accepted compensation");
  liveUI.options.onMenu();var previousSetup=liveSetup;
  ok(store.sessions(first.id).length===2 && get("continue-list").children.length===2 &&
    store.session(first.id,"campaign:16:hotseat").id===hotseatSave.id,
    "starting another level keeps the first unfinished match; both are on the Continue line");
  get("continue-list").children.find(function(chip){return chip.textContent.indexOf(aiLevels[9].name)===0;}).onclick();
  ok(liveSetup===previousSetup && liveUI.aiStarted && liveUI.game.firstPlayer===1 &&
    liveUI.game.balance.label==="1 × Charlie", "continuing an agreed match preserves its opening without renegotiation");
  liveUI.options.onMenu();selectOpening("original");
  find(cards("ai-made-list")[9],"level-play").onclick();
  ok(liveSetup===previousSetup && !liveUI.game.balance && liveUI.game.firstPlayer===0,
    "Normal bypasses offers even on an AI-made battle");
  liveUI.options.onMenu();selectOpening("offers");
  find(cards("mission-list")[0],"level-play").onclick();
  ok(liveSetup!==previousSetup && liveSetup.game.map.name===campaign[0].name,
    "explicit Compensation offers is available on an imported campaign without editing its source map");
  liveSetup.options.onStart(null);
  ok(!liveUI.game.balance && store.session(first.id,"campaign:0:offers").options.opening==="original",
    "offers ending without a deal start a regular match, kept in the level's Offer for first slot");
  var setupBeforeRestart=liveSetup;
  get("btn-restart").onclick();
  ok(liveSetup!==setupBeforeRestart && liveSetup.game.map.name===campaign[0].name &&
    store.session(first.id,"campaign:0:offers")===null && lastEvent()==="abandon",
    "Restart gives the match up, keeps it in the history as abandoned and opens the level's questions again");
  liveSetup.options.onCancel();
  // Exercise real start/save/continue/next wiring, without changing browser storage.
  selectOpening("original");
  find(cards("open-horizons-list")[0],"level-play").onclick();act();
  var saved=store.session(first.id,"environment:open-horizons:0");
  ok(saved.options.environmentCampaign==="open-horizons" && saved.options.environmentIndex===0 &&
    saved.state.map.name===context.ENVIRONMENT_CAMPAIGNS[0].levels[0].name && get("map-title").textContent===saved.state.map.name,
    "terrain campaign Play starts the selected mission, names it in the panel and saves its campaign identity");
  liveUI.options.onMenu();
  ok(find(cards("open-horizons-list")[0],"level-resume").textContent==="Resume turn 1","the entry offers its unfinished match");
  find(cards("open-horizons-list")[0],"level-play").onclick();
  ok(liveUI.game.units.some(function(u){return u.moved;}) && get("map-title").textContent===saved.state.map.name,
    "opening the level again resumes the same match instead of starting another");
  liveUI.game.winner=0;liveUI.game.winReason="base";liveUI.options.onGameOver(0);
  ok(!get("gameover-next").classList.contains("hidden") && store.session(first.id,"environment:open-horizons:0")===null,
    "terrain campaign completion removes the finished match and offers the next mission");
  get("gameover-next").onclick();act();
  ok(store.session(first.id,"environment:open-horizons:1").options.environmentCampaign==="open-horizons",
    "Next mission advances inside its own sixteen-level campaign");
  liveUI.options.onMenu();
  ok(find(get("open-horizons-section"),"group-progress").textContent==="1 / 16 won" &&
    find(get("knotted-heart-section"),"group-progress").textContent==="0 / 16 won" &&
    find(get("broken-ground-section"),"group-progress").textContent==="0 / 16 won",
    "a terrain-campaign victory never leaks into another campaign's progress");
  find(cards("broken-ground-list")[15],"level-play").onclick();act();
  ok(store.session(first.id,"environment:broken-ground:15").options.environmentIndex===15,
    "another terrain campaign's final mission starts from its menu card");
  liveUI.game.winner=0;liveUI.game.winReason="base";liveUI.options.onGameOver(0);
  ok(get("gameover-next").classList.contains("hidden") && !get("gameover-next").onclick,
    "mission sixteen ends its campaign instead of advancing into an unrelated collection");
  liveUI.options.onMenu();
  var wonBefore=find(get("normal-section"),"group-progress").textContent;
  find(cards("mission-list")[0],"level-play-xenon").onclick();
  ok(liveUI.options.humanSide===1 && !liveUI.aiStarted && liveUI.game.firstPlayer===1 && liveUI.game.currentPlayer===1 &&
    get("status-campaign").textContent==="Normal campaign" && get("status-mission-number").textContent==="01",
    "As Xenon starts the solo match on Xenon's side with Xenon moving first and names the mission");
  act();
  ok(store.session(first.id,"campaign:0:xenon").options.humanSide===1,"the Xenon match has its own save");
  liveUI.options.onMenu();
  ok(find(cards("mission-list")[0],"level-play-xenon").textContent==="as Xenon · turn 1",
    "As Xenon shows the turn of its unfinished match");
  find(cards("mission-list")[0],"level-play-xenon").onclick();
  liveUI.game.winner=1;liveUI.game.winReason="base";liveUI.options.onGameOver(1);
  ok(get("gameover-record").textContent.indexOf("Victory")===0,"the Xenon player's win is reported as a victory");
  liveUI.options.onMenu();
  ok(find(get("normal-section"),"group-progress").textContent===wonBefore &&
    find(cards("mission-list")[0],"level-play-xenon").textContent==="as Xenon ✓",
    "a Xenon win marks As Xenon and does not count toward the campaign's won total");
  var rows=get("history-list").children;
  ok(rows.slice(0,4).map(function(row){return find(row,"history-event").textContent;}).join()==="Won,Resumed,Left,Started" &&
    find(rows[0],"history-side").textContent==="Xenon" &&
    find(rows[3],"history-detail").textContent==="vs "+context.AI_SEARCH.get("classic").label,
    "the history lists starts, exits, returns and results in order, newest first");
  storage.setItem("nectaris-custom-levels","[]");selectOpening("original");
  ok(find(get("custom-list"),"empty-levels") && get("custom-level-tools").parentNode.id==="custom-section",
    "an empty custom collection still has a useful empty state and import controls");
  var resultsBefore=JSON.stringify(store.active().results),profileId=store.active().id;
  get("profile-rename").onclick();
  ok(get("profile-dialog").open && get("profile-dialog-title").textContent==="Rename profile" &&
    get("profile-name").value==="History player","Rename opens the dialog with the current username");
  get("profile-name").value="Historian";get("profile-form").onsubmit({preventDefault:function(){}});
  ok(!get("profile-dialog").open && get("profile-current").textContent==="Historian" && store.active().id===profileId &&
    store.active().name==="Historian" && JSON.stringify(store.active().results)===resultsBefore,"renaming keeps the profile's results");
  get("profile-new").onclick();
  ok(get("profile-dialog-title").textContent==="New profile" && get("profile-name").value==="","New profile opens an empty dialog");
  get("profile-name").value="new PLAYER";get("profile-form").onsubmit({preventDefault:function(){}});
  ok(get("profile-dialog").open && get("profile-error").textContent.includes("already exists"),
    "New profile refuses an existing username without closing");
  get("profile-cancel").onclick();

  // A first visit: empty storage apart from the removed map-default Mode preference.
  data={"nectaris-opening":"auto"};nodes={};listeners={};documentListeners={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/main.js"),"utf8"),Object.assign({},context));
  listeners.DOMContentLoaded();
  var fresh=new PROFILES.Store(storage);
  ok(fresh.read().profiles.length===1 && fresh.active().name==="Wilson" && get("profile-current").textContent==="Wilson" &&
    !get("profile-dialog").open,"a first visit starts as Wilson without asking for a username");
  ok(get("profile-switch").classList.contains("hidden"),"Switch to stays hidden until a second profile exists");
  ok(get("opening-select").value==="original","a stored map-default preference opens as Normal");
};
