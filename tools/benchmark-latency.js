"use strict";
(async function () {
  var output=document.getElementById("results"),iframe=document.querySelector("iframe");
  var params=new URLSearchParams(location.search),root=new URL(params.get("root")||"../",location.href);
  if(root.origin!==location.origin)throw new Error("Use a same-origin source tree");
  var source=await(await fetch(new URL("index.html",root))).text();
  source=source.replace(/<script src="js\/main\.js[^\"]*"><\/script>/,"")
    .replace("<head>",'<head><base href="'+root.href+'">');
  function yieldTask(){return new Promise(function(resolve){setTimeout(resolve,0);});}
  function stats(values){var s=values.slice().sort(function(a,b){return a-b;});return {
    median:+s[Math.floor(s.length/2)].toFixed(2),p95:+s[Math.min(s.length-1,Math.floor(s.length*.95))].toFixed(2),max:+s[s.length-1].toFixed(2)};}
  async function load(){var ready=new Promise(function(resolve){iframe.onload=resolve;});iframe.srcdoc=source;await ready;return iframe.contentWindow;}
  document.getElementById("run").onclick=async function(){
    this.disabled=true;var report={source:root.pathname,cases:[]},w,ui,savedArt,savedStyle;
    try {
      w=await load();savedArt=w.RENDER.getIconSet();savedStyle=w.RENDER.getStyle();
      var maps=w.AI_MADE_LEVELS.map(function(map){return map.name;});
      if(params.has("map"))maps=maps.filter(function(name){return name===params.get("map");});
      for(var art of ["legacy","remake"])for(var mapName of maps){
        if(ui)ui.destroy();
        var loadStart=performance.now();w=await load();var loadMs=performance.now()-loadStart,doc=w.document;
        doc.getElementById("menu-screen").classList.add("hidden");doc.getElementById("game-screen").classList.remove("hidden");
        w.RENDER.setStyle("pixel");w.RENDER.setIconSet(art);
        var start=performance.now(),map=w.AI_MADE_LEVELS.find(function(m){return m.name===mapName;}),game=new w.ENGINE.Game(map,{seed:914});
        var gameMs=performance.now()-start;start=performance.now();
        ui=new w.UI.GameUI(doc.getElementById("game-canvas"),game,{hotseat:true});
        if(ui._layoutObserver)ui._layoutObserver.disconnect();w.removeEventListener("resize",ui.handlers.resize);
        ui.resize();ui.renderer.fitToMap();w.cancelAnimationFrame(ui._drawFrame);ui._drawPending=false;
        var uiMs=performance.now()-start,r=ui.renderer,drawTimes=[];
        var draw=r.draw;r.draw=function(){var t=performance.now();draw.call(this);drawTimes.push(performance.now()-t);};
        ui.draw=function(){if(this.destroyed)return;this.updateMapCursor();this.renderer.selected=this.selected;this.positionActionMenu();this.renderer.draw();this.updateHoverInfo();};
        var item={map:mapName,art:art,viewport:[ui.canvas.width,ui.canvas.height],loadMs:+loadMs.toFixed(2),gameMs:+gameMs.toFixed(2),uiMs:+uiMs.toFixed(2),phases:[]};
        start=performance.now();ui.draw();item.coldDrawMs=+(performance.now()-start).toFixed(2);
        async function phase(name,action){
          drawTimes.length=0;var times=[];
          for(var i=0;i<24;i++){var t=performance.now();action(i);times.push(performance.now()-t);await yieldTask();}
          item.phases.push({name:name,total:stats(times),draw:drawTimes.length?stats(drawTimes):null,draws:drawTimes.length});
        }
        await phase("fit hover",function(i){ui.onMouseMove({offsetX:300+i*8,offsetY:250+i*3});});
        await phase("fit pan",function(){r.panBy(-3,-1);ui.draw();});
        r.zoom=1;r.originX=-300;r.originY=-250;r.constrainView();
        await phase("native pan",function(){r.panBy(-3,-1);ui.draw();});
        await phase("wheel zoom",function(i){ui.onWheel({deltaY:i%8<4?1:-1,offsetX:450,offsetY:320,preventDefault:function(){}});});
        var unit=game.units.find(function(u){return u.player===game.currentPlayer;});
        r.zoom=1;r.originX=0;r.originY=0;var point=r.hexCenter(unit.col,unit.row);r.originX=450-point.x;r.originY=320-point.y;
        await phase("unit hover",function(i){ui.onMouseMove({offsetX:450+i%2,offsetY:320});});
        await phase("select cancel",function(i){if(i%2)ui.deselect();else ui.selectUnit(unit);});
        var building=Object.values(game.buildings).find(function(b){return b.stored.length;});
        if(building){var at=r.hexCenter(building.col,building.row);r.originX+=600-at.x;r.originY+=320-at.y;
          await phase("factory hover",function(i){ui.onMouseMove({offsetX:600+i%2,offsetY:320});});}
        await phase("remaining actions",function(){ui.remainingActions();});
        await phase("save snapshot serialize",function(){JSON.stringify(ui.snapshotForSave());});
        if(params.has("stress")) {
          game.units.forEach(function(u){if(u.player===game.currentPlayer)u.moved=true;});
          await phase("spent units redraw",function(){ui.draw();});
          var deployments=[];
          for(var row=0;row<10;row++)for(var col=0;col<16;col++)deployments.push({t:"BISON",o:col%2,x:col+2,y:row+2});
          var dense=new w.ENGINE.Game({grid:Array(16).fill(".".repeat(22)),units:deployments},{seed:73});
          r.game=dense;r.zoom=1;r.originX=50;r.originY=50;r.highlights=null;r.selected=null;
          r.draw();
          await phase("160 active units redraw",function(){r.draw();});
          dense.units.forEach(function(u){u.moved=true;});
          await phase("160 units half spent redraw",function(){r.draw();});
          r.game=game;
        }
        report.cases.push(item);output.textContent=JSON.stringify(report,null,2);await yieldTask();
      }
      output.textContent="PASS\n"+JSON.stringify(report,null,2);
    }catch(error){output.textContent="FAIL: "+error.stack+"\n"+JSON.stringify(report,null,2);}
    finally{if(ui)ui.destroy();if(w){w.RENDER.setStyle(savedStyle);w.RENDER.setIconSet(savedArt);}this.disabled=false;}
  };
})();
