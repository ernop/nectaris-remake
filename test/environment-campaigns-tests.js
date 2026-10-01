/* Physical campaign contracts: real routes and exits, not just valid JSON. */
"use strict";
module.exports = function (ok) {
  const fs = require("node:fs"), path = require("node:path");
  const campaigns = require("../js/data-environment-campaigns.js");
  const catalog = require("../tools/environment-campaign-specs.js");
  const studies = require("../tools/balance-campaign-specs.js").concat(require("../tools/teaching-campaign-specs.js"));
  const HEX = require("../js/hex.js"), ENGINE = require("../js/engine.js");
  const {UNIT_TYPES: types} = require("../js/data-units.js");
  const {terrainCost, TERRAIN_BY_CHAR: terrain} = require("../js/data-terrain.js");
  const {edgeRun} = require("../tools/edge-barriers.js");
  const allTypes = new Set(), signatures = new Set();
  ok(campaigns.length === 7 && campaigns.every(c => c.levels.length === 16), "seven separate 16-mission campaigns");
  ok(JSON.stringify(require("../tools/build-environment-campaigns.js")()) === JSON.stringify(campaigns),
    "all campaign assets rebuild deterministically from the authored catalogs");
  // The first three campaigns (Codex); the balance studies follow, then the
  // teaching campaign (MAP_BALANCE.md).
  campaigns.forEach((campaign, ci) => {
    const study = ci >= 3, spec = study ? studies[ci - 3] : catalog[ci];
    const bundle = JSON.parse(fs.readFileSync(path.join(__dirname, "../levels", campaign.id + ".json")));
    ok(bundle.name === campaign.name && JSON.stringify(bundle.levels) === JSON.stringify(campaign.levels),
      campaign.name + ": the import bundle contains the same sixteen missions");
    ok(campaign.levels.every(m => campaign.notes.includes("created by " + m.author.replace(/^AI-made by /, "") + ",")),
      campaign.name + ": the collection notes credit the maps' own author");
    ok(campaign.levels.some(m => m.units.filter(u => u.o === 0).length <= 4) || study, campaign.name + ": includes very small forces");
    ok(campaign.levels.some(m => new Set(m.units.map(u => u.t).concat(m.buildings.flatMap(b => b.stored || []))).size <= 3) || study,
      campaign.name + ": includes a genuinely restricted roster, including reserves");
    campaign.levels.forEach((map, index) => {
      const label = campaign.name + " " + (index + 1) + ": ";
      const w = map.grid[0].length, h = map.grid.length, game = new ENGINE.Game(map, {seed: 37});
      const cells = Array.from({length:w*h}, (_, i) => ({col:i%w, row:Math.floor(i/w)}));
      const key = p => HEX.key(p.col, p.row), at = p => map.grid[p.row][p.col];
      const ns = p => HEX.neighbors(p.col, p.row).filter(n => game.inBounds(n.col, n.row));
      const symmetry = study ? map.design.symmetry : "half";
      const mate = p => symmetry === "mirror" ? {col:w-1-p.col, row:p.row} : {col:w-1-p.col, row:h-1-p.row};
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
        map.description === spec.levels[index].idea, label + "stable identity and individual tactical briefing");
      ok(JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, "..", map.source)))) === JSON.stringify(map),
        label + "downloadable level and built-in data agree");
      if (!study) {
        ok(cells.every(p => at(p) === at(mate(p))), label + "terrain uses a true hex-preserving half-turn");
      } else if (symmetry !== "none") {
        // A study may move one camp off the mirror image to offset the first move.
        const camps = new Set(map.buildings.filter(b => b.owner >= 0 && !b.stored).flatMap(b => [key(b), key(mate(b))]));
        ok(cells.every(p => camps.has(key(p)) || at(p) === at(mate(p))),
          label + "terrain has its declared " + symmetry + " symmetry");
      }
      if (symmetry !== "none") ok(map.buildings.filter(b => b.owner < 0).every(b => {
        const other = map.buildings.find(p => key(p) === key(mate(b)));
        return other && other.owner === -1 && JSON.stringify(other.stored) === JSON.stringify(b.stored);
      }), label + "neutral factories are matched with equal inventories");
      if (!study) ok(map.buildings.every(b => {
        const other = map.buildings.find(p => key(p) === key(mate(b)));
        return other && other.owner === (b.owner < 0 ? -1 : 1-b.owner) &&
          JSON.stringify(other.stored) === JSON.stringify(b.stored);
      }), label + "paired camps and matched neutral inventories");
      const base = map.buildings.find(b => b.owner === 0 && !b.stored), rival = map.buildings.find(b => b.owner === 1 && !b.stored);
      const floor = p => !["M", "v", "F"].includes(at(p));
      const connected = flood(base, floor);
      if (!study) ok(cells.filter(floor).every(p => connected.has(key(p))), label + "ground passages stay connected without crossing neutral factories");
      else ok(connected.has(key(rival)) === !spec.levels[index].split,
        label + (spec.levels[index].split ? "no vehicle route crosses the valley" : "a vehicle route joins the camps"));
      const cache = new Map();
      const unwanted = study ? (ci === 3 ? ["HUNTER", "FALCON"] : []) : ["HUNTER", "FALCON", "EAGLE"];
      map.units.forEach(u => {
        const t = types[u.t]; allTypes.add(u.t);
        ok(!unwanted.includes(u.t), label + "field roster excludes unwanted combat aircraft");
        if (t.move === 0) {
          const carrier = game.units.find(c => c.player === u.o && c.type.cargo &&
            HEX.distance(c.col, c.row, u.x, u.y) === 1 && game.canLoad(c, game.unitAt(u.x,u.y), false));
          ok(!!carrier || (study && u.t === "TRIGGER"), label + "an immobile field unit has an adjacent compatible carrier, or is a laid mine");
          return;
        }
        const cacheKey = u.t+":"+u.o;
        if (!cache.has(cacheKey)) cache.set(cacheKey, flood(map.buildings.find(b => b.owner === u.o && !b.stored),
          p => at(p) !== "F" && terrainCost(terrain[at(p)], t.moveType, t) !== null));
        ok(cache.get(cacheKey).has(HEX.key(u.x,u.y)), label + u.t + " can travel between its starting position and camp");
      });
      [0,1].forEach(owner => ok(map.units.some(u => u.o === owner && types[u.t].capture), label + "both sides have capturers"));
      // Test the engine's legal exits after capture with the field vacated;
      // initial traffic must not be mistaken for an intrinsically sealed arsenal.
      game.units = [];
      Object.values(game.buildings).filter(b => b.kind === "factory").forEach(b => {
        b.owner = 0;
        ok(study ? b.stored.length >= 1 && b.stored.length <= 8 : b.stored.length >= 4 && b.stored.length <= 8,
          label + "small, focused factory inventory");
        b.stored.forEach((u, i) => {
          u.player = 0; allTypes.add(u.typeId);
          ok(!unwanted.includes(u.typeId), label + "reserves exclude unwanted combat aircraft");
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
      if (ci <= 3 || ci === 6) ok(edgeRun(map.grid) === null, label + "barriers stop vehicles circling the board along its top and bottom edges");
      if (ci === 3) ok(map.grid.join("").includes("v"), label + "a rille divides the board");
      if (ci === 4) ok(rival && /[Mw]/.test(map.grid.join("")), label + "the Xenon camp has walls of mountains or broken ground");
      if (ci === 5) ok(map.buildings.some(b => b.owner === -1 && b.stored.length), label + "neutral factories hold reserves to fight for");
      if (ci === 6) {
        const prior = campaign.levels[index-1], target = spec.levels[index].target;
        ok(!prior || w*h >= prior.grid[0].length*prior.grid.length, label + "the board is no smaller than the mission before");
        ok(spec.levels[index].lesson && target <= (index ? spec.levels[index-1].target : 100) && target >= (index < 3 ? 95 : 55),
          label + "a named lesson, and a target on the falling difficulty curve");
      }
      const restored = ENGINE.Game.restore(new ENGINE.Game(map,{seed:37}).snapshot());
      ok(restored.units.length === map.units.length && restored.map.campaignId === campaign.id,
        label + "campaign identity and authored army survive save/restore");
    });
  });
  Object.keys(types).filter(id => !["HUNTER","FALCON","EAGLE"].includes(id)).forEach(id =>
    ok(allTypes.has(id), "the overall campaign collection uses the full permitted stock roster: " + id));
};
