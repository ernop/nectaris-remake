"use strict";
(async function () {
  var iframe = document.querySelector("iframe"), output = document.getElementById("results");
  var source = await (await fetch("../index.html")).text();
  source = source.replace(/<script src="js\/main\.js[^\"]*"><\/script>/, "")
    .replace("<head>", '<head><base href="' + new URL("../", location.href).href + '">');
  var ready = new Promise(function (resolve) { iframe.onload = resolve; });
  iframe.srcdoc = source;
  await ready;
  var w = iframe.contentWindow, doc = iframe.contentDocument, ui = null;
  var Frame = w.LEGACY_TERRAIN.Frame;
  function drawRuns(ctx,cx,cy,scale,id,neighbors,variant,owner) {
    var data=w.LEGACY_TERRAIN.tile(id,neighbors,variant,owner),left=cx-24*scale,top=cy-16*scale;
    data.runs.forEach(function(run){
      var x=Math.round(left+run[0]*scale),y=Math.round(top+run[1]*scale);
      ctx.fillStyle=run[3];ctx.fillRect(x,y,Math.round(left+(run[0]+run[2])*scale)-x,Math.round(top+(run[1]+1)*scale)-y);
    });
  }
  var savedStyle = w.RENDER.getStyle(), savedArt = w.RENDER.getIconSet();
  var mapSelect = document.getElementById("map");
  w.AI_MADE_LEVELS.forEach(function (map, index) {
    var option = document.createElement("option"); option.value = index;
    option.textContent = map.name; mapSelect.appendChild(option);
  });
  document.getElementById("run").disabled = false;
  document.getElementById("raster").disabled = false;
  output.textContent = "Ready.";
  function frame() { return new Promise(function (resolve) { setTimeout(resolve, 16); }); }
  function stats(values) {
    var sorted = values.slice().sort(function(a,b){return a-b;});
    return {medianMs: +sorted[Math.floor(sorted.length / 2)].toFixed(2),
      p95Ms: +sorted[Math.min(sorted.length-1, Math.floor(sorted.length*.95))].toFixed(2)};
  }
  document.getElementById("run").onclick = async function () {
    this.disabled = true;
    try {
      if (ui) ui.destroy();
      doc.getElementById("menu-screen").classList.add("hidden");
      doc.getElementById("game-screen").classList.remove("hidden");
      w.RENDER.setStyle("pixel"); w.RENDER.setIconSet(document.getElementById("art").value);
      w.LEGACY_TERRAIN.Frame = document.getElementById("method").value === "runs" ? null : Frame;
      var game = new w.ENGINE.Game(w.AI_MADE_LEVELS[+mapSelect.value], {seed: 914});
      ui = new w.UI.GameUI(doc.getElementById("game-canvas"), game, {hotseat: true});
      // Settle the toolbar layout and keep unrelated window/observer events
      // out of this fixed-viewport CPU comparison.
      if(ui._layoutObserver)ui._layoutObserver.disconnect();
      w.removeEventListener("resize",ui.handlers.resize);
      ui.resize();ui.renderer.fitToMap();
      var r = ui.renderer, report = {map: game.map.name, art: w.RENDER.getIconSet(), method: document.getElementById("method").value,
        viewport: [ui.canvas.width, ui.canvas.height], phases: []};
      var drawTimes = [], originalDraw = r.draw;
      r.draw = function () { var start = performance.now(); originalDraw.call(this); drawTimes.push(performance.now() - start); };
      w.cancelAnimationFrame(ui._drawFrame); ui._drawPending = false;
      ui.draw = function () {
        if(this.destroyed)return;
        this.updateMapCursor();
        this.renderer.selected = this.selected;
        this.positionActionMenu(); this.renderer.draw(); this.updateHoverInfo();
      };
      ui.draw(); await frame();
      async function phase(name, action) {
        drawTimes.length = 0;
        var handlers = []; await frame();
        for (var i = 0; i < 24; i++) {
          var start = performance.now(); action(i); handlers.push(performance.now() - start);
          await frame();
        }
        report.phases.push({name: name, handler: stats(handlers), draw: drawTimes.length ? stats(drawTimes) : null,
          draws: drawTimes.length});
        output.textContent = JSON.stringify(report, null, 2);
      }
      // Fit zoom exercises the largest number of tiles, unlike the old zoom-1 fixture.
      await phase("fit-view hover", function (i) { ui.onMouseMove({offsetX: 300 + i*5, offsetY: 250 + i*2}); });
      r.zoom = 1; r.originX = -300; r.originY = -250; r.constrainView();
      ui.onMouseDown({button: 0, offsetX: 500, offsetY: 350, preventDefault: function () {}});
      await phase("continuous pan at zoom 1", function (i) { ui.onMouseMove({offsetX: 490 - i*8, offsetY: 345 - i*3}); });
      ui.dragging = null;
      await phase("wheel zoom", function (i) {
        ui.onWheel({deltaY: i % 8 < 4 ? 1 : -1, offsetX: 450, offsetY: 320, preventDefault: function () {}});
      });
      var unit = game.units[0];
      r.originX = 0; r.originY = 0; r.zoom = 1;
      var point = r.hexCenter(unit.col, unit.row);
      r.originX = 450 - point.x; r.originY = 320 - point.y;
      await phase("hover same unit", function (i) { ui.onMouseMove({offsetX: 450 + i%2, offsetY: 320}); });
      await phase("select and cancel", function (i) { if (i%2) ui.deselect(); else ui.selectUnit(unit); });
      output.textContent = "PASS: interaction sequence completed.\n" + JSON.stringify(report, null, 2);
    } catch (error) { output.textContent = "FAIL: " + error.stack; }
    finally { w.LEGACY_TERRAIN.Frame = Frame; w.RENDER.setStyle(savedStyle); w.RENDER.setIconSet(savedArt); this.disabled = false; }
  };
  document.getElementById("raster").onclick = async function () {
    this.disabled = true;
    // Compare every pixel with the original horizontal-run renderer,
    // including fractional scales, camera phases and viewport clipping.
    var a = doc.createElement("canvas"), b = doc.createElement("canvas");
    a.width = b.width = 180; a.height = b.height = 140;
    var ca = a.getContext("2d", {willReadFrequently:true}), cb = b.getContext("2d", {willReadFrequently:true});
    var raster = new Frame(cb,180,140);
    var checks = 0, differences = 0, first = null;
    for (var type of ["plain","waste","mountain","hill","road","valley","bridge","base","factory","void"]) {
      var neighbors = ["mountain","hill","plain","mountain","road","valley"];
      for (var scale of [.18,.25,.35,.5,.65,1,1.15,1.5,2,2.5,3.2]) for (var offset of [-90,-65.5,0,.13,.5,.87,75]) {
        ca.fillStyle="#181510";ca.fillRect(0,0,180,140);raster.clear();
        drawRuns(ca, 80+offset, 65+offset, scale, type, neighbors, 3, 1);
        w.LEGACY_TERRAIN.draw(cb, 80+offset, 65+offset, scale, type, neighbors, 3, 1,raster);
        raster.paint(cb);
        var ap = ca.getImageData(0,0,180,140).data, bp = cb.getImageData(0,0,180,140).data, diff = 0;
        for(var i=0;i<ap.length;i++)if(ap[i]!==bp[i])diff++;
        if(diff){differences++; if(!first)first={type:type,scale:scale,offset:offset,channels:diff};}
        checks++;
        if (checks % 12 === 0) {
          output.textContent = JSON.stringify({rasterChecks:checks,differingCases:differences,firstDifference:first},null,2);
          await new Promise(function(resolve) { setTimeout(resolve, 0); });
        }
      }
    }
    output.textContent = (differences ? "FAIL" : "PASS") + ": " + JSON.stringify({rasterChecks:checks,differingCases:differences,firstDifference:first},null,2);
    this.disabled = false;
  };
})();
