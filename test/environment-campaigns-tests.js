/* Physical campaign contracts: real routes and exits, not just valid JSON. */
"use strict";
module.exports = function (ok) {
  const fs = require("node:fs"), path = require("node:path");
  const campaigns = require("../js/data-environment-campaigns.js");
  const catalog = require("../tools/environment-campaign-specs.js");
  const HEX = require("../js/hex.js"), ENGINE = require("../js/engine.js");
  const {UNIT_TYPES: types} = require("../js/data-units.js");
  const {terrainCost, TERRAIN_BY_CHAR: terrain} = require("../js/data-terrain.js");
  const allTypes = new Set(), signatures = new Set();
  ok(campaigns.length === 3 && campaigns.every(c => c.levels.length === 16), "three separate 16-mission campaigns");
  ok(JSON.stringify(require("../tools/build-environment-campaigns.js")()) === JSON.stringify(campaigns),
    "all campaign assets rebuild deterministically from the authored catalog");
  campaigns.forEach((campaign, ci) => {
    const bundle = JSON.parse(fs.readFileSync(path.join(__dirname, "../levels", campaign.id + ".json")));
    ok(bundle.name === campaign.name && JSON.stringify(bundle.levels) === JSON.stringify(campaign.levels),
      campaign.name + ": the import bundle contains the same sixteen missions");
    ok(campaign.levels.some(m => m.units.filter(u => u.o === 0).length <= 4), campaign.name + ": includes very small forces");
    ok(campaign.levels.some(m => new Set(m.units.map(u => u.t).concat(m.buildings.flatMap(b => b.stored || []))).size <= 3),
      campaign.name + ": includes a genuinely restricted roster, including reserves");
    campaign.levels.forEach((map, index) => {
      const label = campaign.name + " " + (index + 1) + ": ";
      const w = map.grid[0].length, h = map.grid.length, game = new ENGINE.Game(map, {seed: 37});
      const cells = Array.from({length:w*h}, (_, i) => ({col:i%w, row:Math.floor(i/w)}));
      const key = p => HEX.key(p.col, p.row), at = p => map.grid[p.row][p.col];
      const ns = p => HEX.neighbors(p.col, p.row).filter(n => game.inBounds(n.col, n.row));
      const rotate = p => ({col:w-1-p.col, row:h-1-p.row});
      function flood(start, passable) {
        const queue = [start], seen = new Set([key(start)]);
        for (let i=0; i<queue.length; i++) ns(queue[i]).forEach(p => {
          if (!seen.has(key(p)) && passable(p)) {seen.add(key(p)); queue.push(p);}
        });
        return seen;
      }
      ok(!signatures.has(map.grid.join("\n")), label + "unique physical layout");
      signatures.add(map.grid.join("\n"));
      ok(map.campaignId === campaign.id && map.mission === index+1 &&
        map.description === catalog[ci].levels[index].idea, label + "stable identity and individual tactical briefing");
      ok(JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, "..", map.source)))) === JSON.stringify(map),
        label + "downloadable level and built-in data agree");
      ok(cells.every(p => at(p) === at(rotate(p))), label + "terrain uses a true hex-preserving half-turn");
      ok(map.buildings.every(b => {
        const mate = map.buildings.find(p => key(p) === key(rotate(b)));
        return mate && mate.owner === (b.owner < 0 ? -1 : 1-b.owner) &&
          JSON.stringify(mate.stored) === JSON.stringify(b.stored);
      }), label + "paired camps and matched neutral inventories");
      const base = map.buildings.find(b => b.owner === 0);
      const floor = p => !["M", "v", "F"].includes(at(p));
      const connected = flood(base, floor);
      ok(cells.filter(floor).every(p => connected.has(key(p))), label + "ground passages stay connected without crossing neutral factories");
      const cache = new Map();
      map.units.forEach(u => {
        const t = types[u.t]; allTypes.add(u.t);
        ok(!["HUNTER", "FALCON", "EAGLE"].includes(u.t), label + "field roster excludes unwanted combat aircraft");
        if (t.move === 0) {
          const carrier = game.units.find(c => c.player === u.o && c.type.cargo &&
            HEX.distance(c.col, c.row, u.x, u.y) === 1 && game.canLoad(c, game.unitAt(u.x,u.y), false));
          ok(!!carrier, label + "an immobile field unit has an adjacent compatible carrier");
          return;
        }
        const cacheKey = u.t+":"+u.o;
        if (!cache.has(cacheKey)) cache.set(cacheKey, flood(map.buildings.find(b => b.owner === u.o),
          p => at(p) !== "F" && terrainCost(terrain[at(p)], t.moveType, t) !== null));
        ok(cache.get(cacheKey).has(HEX.key(u.x,u.y)), label + u.t + " can travel between its starting position and camp");
      });
      [0,1].forEach(owner => ok(map.units.some(u => u.o === owner && types[u.t].capture), label + "both sides have capturers"));
      // Test the engine's legal exits after capture with the field vacated;
      // initial traffic must not be mistaken for an intrinsically sealed arsenal.
      game.units = [];
      Object.values(game.buildings).filter(b => b.kind === "factory").forEach(b => {
        b.owner = 0;
        ok(b.stored.length >= 4 && b.stored.length <= 8, label + "small, focused factory inventory");
        b.stored.forEach((u, i) => {
          u.player = 0; allTypes.add(u.typeId);
          ok(!["HUNTER", "FALCON", "EAGLE"].includes(u.typeId), label + "reserves exclude unwanted combat aircraft");
          ok(game.deployTargets(b,u).length > 0, label + u.typeId + " has a legal factory exit");
          if (u.type.placeByTransport) {
            const carrier = b.stored[i-1];
            ok(carrier && game.canLoad(carrier,u,true), label + "immobile reserve immediately follows its compatible carrier");
          }
        });
      });
      const fraction = pred => cells.filter(pred).length / cells.length;
      if (ci === 0) ok(fraction(p => [".","-","F","B"].includes(at(p))) > .65,
        label + "open ground dominates the sea of land");
      if (ci === 1) {
        const center = cells.filter(p => p.col/(w-1)>.22 && p.col/(w-1)<.78 && p.row/(h-1)>.13 && p.row/(h-1)<.87);
        const outside = cells.filter(p => !center.includes(p));
        ok(center.filter(p => at(p) === "M").length / center.length > .4 &&
          outside.filter(p => at(p) === "M").length / outside.length < .1,
          label + "the dense interior is materially different from its spacious outskirts");
      }
      if (ci === 2) {
        ok(fraction(p => ["h","w","v"].includes(at(p))) > .25, label + "difficult terrain materially affects movement");
        if ([3,9,14,15].includes(index)) ok(map.grid.join("").includes("="), label + "valley mission includes actual bridge terrain");
      }
      const restored = ENGINE.Game.restore(new ENGINE.Game(map,{seed:37}).snapshot());
      ok(restored.units.length === map.units.length && restored.map.campaignId === campaign.id,
        label + "campaign identity and authored army survive save/restore");
    });
  });
  Object.keys(types).filter(id => !["HUNTER","FALCON","EAGLE"].includes(id)).forEach(id =>
    ok(allTypes.has(id), "the overall campaign collection uses the full permitted stock roster: " + id));
};
