/* Read-only battlefield preview and private pregame acceptance flow. */
"use strict";
var BALANCE_UI = (function () {
  function $(id) {return document.getElementById(id);}
  function faction(p) {return p===0 ? "Union" : "Xenon";}
  function hideChoices(hidden) {
    ["balance-body","balance-header"].forEach(function(id){$(id).inert=hidden;$(id).setAttribute("aria-hidden",String(hidden));});
  }
  function unitSummary(u) {
    return faction(u.player)+" "+UNIT_VIEW.name(u)+" · "+u.strength+"/8 · "+u.exp+" experience · Move "+u.type.move+
      " · Ground attack "+u.type.atkG+" · Air attack "+u.type.atkA+" · Defense "+u.type.def+(u.type.capture?" · Captures buildings":"");
  }
  function Setup(game,options) {
    var self=this;
    this.game=game;this.options=options;this.plan=BALANCE.plan(game);
    this.step=0;this.preview=0;this.viewer=0;this.responses=[];this.phase="vote";
    this.canvas=$("balance-canvas");this.renderer=new RENDER.Renderer(this.canvas,game);
    this.renderer.orientation="auto";this.drag=null;this.listeners=[];
    $("balance-screen").classList.remove("hidden");$("balance-handoff").classList.add("hidden");
    hideChoices(false);
    $("balance-map-name").textContent=game.map.name;
    $("balance-back").onclick=options.onCancel;
    $("balance-original").onclick=function(){options.onStart(null);};
    $("balance-fit").onclick=function(){self.renderer.fitToMap();self.draw();};
    $("balance-union").onclick=function(){self.focus(0);};
    $("balance-xenon").onclick=function(){self.focus(1);};
    $("balance-zoom-in").onclick=function(){self.zoom(1.3);};
    $("balance-zoom-out").onclick=function(){self.zoom(1/1.3);};
    $("balance-accept").onclick=function(){if(self.preview<=self.step)self.submit(self.preview);};
    $("balance-pass").onclick=function(){self.submit(null);};
    $("balance-ready").onclick=function(){
      hideChoices(false);
      self.phase="vote";$("balance-handoff").classList.add("hidden");self.render();self.focus(self.viewer);
      $("balance-accept").focus();
    };
    $("balance-start").onclick=function(){if(self.phase==="agreed")options.onStart(self.result,self.plan);};
    function listen(target,event,fn,settings){target.addEventListener(event,fn,settings);self.listeners.push([target,event,fn]);}
    listen(window,"resize",function(){self.resize();});
    listen(this.canvas,"wheel",function(e){e.preventDefault();self.zoom(e.deltaY<0?1.15:1/1.15,e.offsetX,e.offsetY);},{passive:false});
    listen(this.canvas,"mousedown",function(e){if(e.button===0 && e.ctrlKey){self.drag={x:e.clientX,y:e.clientY};self.canvas.style.cursor="grabbing";e.preventDefault();}});
    listen(window,"mousemove",function(e){if(self.drag){self.renderer.panBy(e.clientX-self.drag.x,e.clientY-self.drag.y);self.drag={x:e.clientX,y:e.clientY};self.draw();}});
    listen(window,"mouseup",function(){self.drag=null;self.canvas.style.cursor="crosshair";});
    listen(window,"blur",function(){self.drag=null;self.canvas.style.cursor="crosshair";});
    listen(document,"keydown",function(e){if(e.key==="Control"&&!self.drag)self.canvas.style.cursor="grab";});
    listen(document,"keyup",function(e){if(e.key==="Control"&&!self.drag)self.canvas.style.cursor="crosshair";});
    listen(this.canvas,"contextmenu",function(e){e.preventDefault();});
    listen(this.canvas,"mousemove",function(e){self.inspect(e);});
    if(this.plan.error){this.phase="unavailable";this.render();}
    else {this.prepareCPU();this.render();}
    this.resize();
    if(typeof ResizeObserver!=="undefined"){
      this.observer=new ResizeObserver(function(){self.resize(true);});this.observer.observe(this.canvas.parentElement);
    }
  }
  Setup.prototype.prepareCPU=function(){if(!this.options.hotseat)this.cpu=BALANCE.cpuChoice(this.plan,this.step,1);};
  Setup.prototype.destroy=function(){
    this.listeners.forEach(function(l){l[0].removeEventListener(l[1],l[2]);});this.listeners=[];
    if(this.observer)this.observer.disconnect();
    $("balance-screen").classList.add("hidden");$("balance-handoff").classList.add("hidden");
    hideChoices(false);
    ["back","original","fit","union","xenon","zoom-in","zoom-out","accept","pass","ready","start"].forEach(function(id){$("balance-"+id).onclick=null;});
  };
  Setup.prototype.resize=function(keepView){
    var wrap=this.canvas.parentElement,width=Math.max(1,wrap.clientWidth),height=Math.max(1,wrap.clientHeight);
    var dx=width-this.canvas.width,dy=height-this.canvas.height;
    if(keepView && !dx && !dy)return;
    this.canvas.width=width;this.canvas.height=height;
    if(keepView){this.renderer.originX+=dx/2;this.renderer.originY+=dy/2;}
    else this.renderer.fitToMap();
    this.draw();
  };
  Setup.prototype.focus=function(player){
    this.viewer=player;
    if(!this.plan.error){
      var r=this.renderer,home=this.plan.homes[player];
      r.zoom=Math.max(r.minimumZoom(),Math.min(this.canvas.width/460,this.canvas.height/440,2));
      var center=r.hexCenter(home.col,home.row);
      r.originX+=this.canvas.width/2-center.x;r.originY+=this.canvas.height/2-center.y;r.constrainView();
      this.draw();this.renderPlacement();
    }
  };
  Setup.prototype.zoom=function(factor,x,y){
    var r=this.renderer;x=x===undefined?this.canvas.width/2:x;y=y===undefined?this.canvas.height/2:y;
    var old=r.zoom;r.zoom=Math.max(r.minimumZoom(),Math.min(4,old*factor));
    r.originX=x-(x-r.originX)*r.zoom/old;r.originY=y-(y-r.originY)*r.zoom/old;r.constrainView();this.draw();
  };
  Setup.prototype.draw=function(){
    var r=this.renderer,p=this.plan,self=this;
    r.highlights={};
    if(!p.error)p.sites.forEach(function(sites,player){sites.forEach(function(at){r.highlights[HEX.key(at.col,at.row)]=player===0?"rgba(40,140,255,0.38)":"rgba(40,210,80,0.38)";});});
    r.draw();
    if(p.error)return;
    [0,1].forEach(function(player){
      var show=self.phase!=="agreed" || player===self.result.secondPlayer;
      var units=show?BALANCE.placements(p,player,self.preview):[];
      units.forEach(function(at,i){r.drawUnit({id:-1-player*10-i,typeId:at.typeId,type:UNIT_TYPES[at.typeId],player:player,
        col:at.col,row:at.row,strength:8,exp:0,cargo:[],moved:false});});
      p.sites[player].forEach(function(at,i){
        var c=r.hexCenter(at.col,at.row),ctx=r.ctx,y=c.y-Math.max(10,18*r.zoom);
        ctx.fillStyle="#15130e";ctx.fillRect(c.x-10,y-9,20,17);
        ctx.strokeStyle=player===0?"#4a90e8":"#3cb44b";ctx.lineWidth=2;ctx.strokeRect(c.x-10,y-9,20,17);
        ctx.fillStyle="#fff6d9";ctx.font="bold 12px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(i+1),c.x,y);
      });
    });
  };
  Setup.prototype.inspect=function(event){
    if(this.drag)return;
    var at=this.renderer.pixelToHex(event.offsetX,event.offsetY);
    if(!at)return;
    var g=this.game,u=g.unitAt(at.col,at.row),b=g.buildingAt(at.col,at.row),t=g.terrainAt(at.col,at.row);
    if(!u && !this.plan.error){
      for(var player=0;player<2;player++){
        if(this.phase==="agreed" && player!==this.result.secondPlayer)continue;
        var bonus=BALANCE.placements(this.plan,player,this.preview).find(function(v){return v.col===at.col && v.row===at.row;});
        if(bonus){u={type:UNIT_TYPES[bonus.typeId],player:player,strength:8,exp:0};break;}
      }
    }
    var text="Hex "+(at.col+1)+", "+(at.row+1)+" · "+t.name;
    if(u)text+=" · "+unitSummary(u);
    if(b)text+=" · "+(b.owner<0?"Neutral":faction(b.owner))+" "+b.kind+" · "+
      (b.stored.length?b.stored.map(function(v){return UNIT_VIEW.name(v)+" ("+v.exp+"★)";}).join(", "):"No reserves");
    $("balance-hex-info").textContent=text;
  };
  Setup.prototype.renderPlacement=function(){
    var p=this.plan,list=$("balance-placement-list"),self=this;list.replaceChildren();
    if(p.error)return;
    var offer=p.offers[this.preview],player=this.phase==="agreed"?this.result.secondPlayer:this.viewer;
    $("balance-package-name").textContent=offer.label;
    var caption=document.createElement("p");caption.textContent=faction(player)+" reinforcement hexes (column, row):";list.appendChild(caption);
    var placements=BALANCE.placements(p,player,this.preview);
    placements.forEach(function(at,i){
      var row=document.createElement("button");row.className="balance-location";
      row.textContent="#"+(i+1)+" · "+UNIT_VIEW.name(UNIT_TYPES[at.typeId])+" · ("+(at.col+1)+", "+(at.row+1)+")";
      var unit={type:UNIT_TYPES[at.typeId],typeId:at.typeId,player:player,strength:8,exp:0,cargo:[]};
      UNIT_VIEW.addIcon(row,unit);row.title=unitSummary(unit);
      row.onclick=function(){self.focus(player);var r=self.renderer,c=r.hexCenter(at.col,at.row);r.originX+=self.canvas.width/2-c.x;r.originY+=self.canvas.height/2-c.y;self.draw();
        $("balance-hex-info").textContent="Hex "+(at.col+1)+", "+(at.row+1)+" · "+unitSummary(unit);};
      list.appendChild(row);
    });
    if(!placements.length){var empty=document.createElement("p");empty.textContent="No extra units. Numbered hexes show where later offers will arrive.";list.appendChild(empty);}
    $("balance-preview-caption").textContent=this.phase==="agreed" ? faction(player)+" receives the highlighted units at these exact hexes." :
      "Preview: "+offer.label+" for either army. Only the player assigned second receives the bonus. Numbered hexes stay fixed throughout the offers.";
    $("balance-accept").disabled=this.preview>this.step || this.phase!=="vote";
    $("balance-accept").textContent=this.preview>this.step ? "Available at offer "+this.preview : "Take second with this package";
  };
  Setup.prototype.render=function(){
    var self=this,host=$("balance-offers"),scroll=host.scrollTop,p=this.plan,unavailable=this.phase==="unavailable",noDeal=this.phase==="no-deal",agreed=this.phase==="agreed";
    host.replaceChildren();
    $("balance-start").classList.toggle("hidden",!agreed);
    $("balance-accept").classList.toggle("hidden",agreed||unavailable||noDeal);
    $("balance-pass").classList.toggle("hidden",agreed||unavailable||noDeal);
    $("balance-original").classList.toggle("hidden",!unavailable&&!noDeal);
    $("balance-rules").classList.toggle("hidden",unavailable||agreed);
    $("balance-choice-note").classList.toggle("hidden",unavailable||noDeal);
    if(unavailable){
      $("balance-turn").textContent="Opening unavailable";$("balance-message").textContent=p.error;
      $("balance-placement-list").replaceChildren();$("balance-package-name").textContent="";
      $("balance-preview-caption").textContent="The original battlefield is shown. No units have been added.";return;
    }
    if(agreed){
      $("balance-turn").textContent=faction(this.result.firstPlayer)+" moves first";
      $("balance-message").textContent=(this.result.tied?"Both accepted; the random tie-break chose "+faction(this.result.secondPlayer)+" to go second":
        faction(this.result.secondPlayer)+" goes second")+" with "+p.offers[this.result.offer].label+". Nothing moves until you start.";
    }else if(noDeal){
      $("balance-turn").textContent="No agreement";$("balance-message").textContent="Both declined the final offer. Return to the library or choose the original opening.";
    }else{
      $("balance-turn").textContent="Offer "+this.step+" of "+(p.offers.length-1)+" · "+(this.options.hotseat?faction(this.responder||0):"Your choice");
      $("balance-message").textContent=(this.step?"Both declined the previous offer. ":"")+"Take second with any available package, or prefer the first move. "+
        "The map’s "+this.game.turnLimit+"-round limit still awards Xenon the win.";
    }
    p.offers.forEach(function(offer,i){
      var button=document.createElement("button");button.className="balance-offer";
      button.classList.toggle("selected",i===self.preview);button.classList.toggle("future",i>self.step);
      button.setAttribute("aria-pressed",i===self.preview?"true":"false");
      button.textContent=i+" · "+offer.label+(i>self.step?" · Preview":"");
      button.disabled=agreed;
      button.onclick=function(){self.preview=i;self.render();self.draw();};host.appendChild(button);
    });
    host.scrollTop=scroll;
    this.renderPlacement();this.draw();
  };
  Setup.prototype.submit=function(choice){
    if(this.phase!=="vote" || (choice!==null && (choice>this.step || !this.plan.offers[choice])))return;
    var responder=this.responder||0;
    this.responses[responder]=choice;
    if(this.options.hotseat && responder===0){
      this.responder=1;this.viewer=1;this.preview=this.step;this.handoff(1);return;
    }
    if(!this.options.hotseat)this.responses[1]=this.cpu;
    var result=BALANCE.resolve(this.plan,this.step,this.responses);
    this.responses=[];this.responder=0;
    if(result.status==="next"){
      this.step=result.step;this.preview=this.step;this.viewer=0;this.prepareCPU();
      if(this.options.hotseat){this.handoff(0);return;}
    }else if(result.status==="agreed"){
      this.result=result;this.phase="agreed";this.preview=result.offer;this.viewer=result.secondPlayer;
    }else this.phase="no-deal";
    this.render();
    if(result.status==="next"){
      var row=$("balance-offers").children[this.step];
      if(row && row.scrollIntoView)row.scrollIntoView({block:"nearest"});
    }
    if(result.status==="agreed")this.focus(result.secondPlayer);
  };
  Setup.prototype.handoff=function(player){
    this.phase="handoff";this.render();$("balance-handoff-title").textContent="Pass to the "+faction(player)+" player";
    $("balance-hex-info").textContent="Wheel to zoom · Ctrl+drag to pan · Hover a unit or factory to inspect.";
    $("balance-offers").scrollTop=0;hideChoices(true);
    $("balance-handoff").classList.remove("hidden");$("balance-ready").focus();
  };
  return {Setup:Setup};
})();
if(typeof module!=="undefined")module.exports=BALANCE_UI;
