#!/usr/bin/env node
/* Original, reproducible level design. Run: node tools/build-ai-fjords.js
 * A warped spanning tree supplies the fjords: a road centerline plus one
 * hex on each side. Only junction clearings and the two camps widen it.
 * This generator writes ordinary level data; the game needs no generator.
 */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const HEX = require("../js/hex.js");
const { UNIT_TYPES } = require("../js/data-units.js");
const key = p => HEX.key(p.col, p.row);
const distance = (a, b) => HEX.distance(a.col, a.row, b.col, b.row);
const neighbors = p => HEX.neighbors(p.col, p.row);
function random(seed) {
  return function () {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function line(a, b) {
  const out = [a];
  while (distance(out[out.length - 1], b)) {
    const here = out[out.length - 1];
    // Follow the straight line in screen space while staying on real hexes.
    const ap = HEX.toPixel(a.col, a.row, 1), bp = HEX.toPixel(b.col, b.row, 1);
    const candidates = neighbors(here).filter(p => distance(p, b) < distance(here, b));
    candidates.sort((p, q) => {
      const error = n => {
        const np = HEX.toPixel(n.col, n.row, 1);
        return Math.abs((bp.x-ap.x)*(ap.y-np.y) - (ap.x-np.x)*(bp.y-ap.y));
      };
      return error(p) - error(q);
    });
    out.push(candidates[0]);
  }
  return out;
}
function design(seed, linked, compact) {
  const WIDTH = compact ? 40 : 65, HEIGHT = compact ? 40 : 49;
  const columns = compact ? 6 : 8, count = columns * 6, last = count-1, spacing = compact ? 6 : 8;
  const inside = p => p.col > 0 && p.row > 0 && p.col < WIDTH-1 && p.row < HEIGHT-1;
  const rng = random(seed), jitter = () => Math.floor(rng() * 3) - 1;
  const nodes = Array.from({length: count}, (_, i) => ({
    col: 4 + (i % columns) * spacing + jitter(), row: 4 + Math.floor(i / columns) * spacing + jitter()
  }));
  nodes[0] = {col: 3, row: 3}; nodes[last] = {col: WIDTH-4, row: HEIGHT-4};
  const candidates = [];
  nodes.forEach((_, i) => {
    if (i % columns < columns-1) candidates.push({a: i, b: i+1, weight: rng()});
    if (i < count-columns) candidates.push({a: i, b: i+columns, weight: rng()});
  });
  candidates.sort((a, b) => a.weight - b.weight);
  const roots = nodes.map((_, i) => i), degree = nodes.map(() => 0), edges = [];
  function root(i) { while (roots[i] !== i) i = roots[i]; return i; }
  candidates.forEach(e => {
    if ((e.a === 0 && degree[0]) || (e.b === last && degree[last])) return;
    const a = root(e.a), b = root(e.b);
    if (a === b) return;
    roots[a] = b; degree[e.a]++; degree[e.b]++; edges.push(e);
  });
  const leaves = nodes.map((_, i) => i).filter(i => degree[i] === 1 && i !== 0 && i !== last);
  if (edges.length !== last || leaves.length !== 15) return null;
  if (linked) {
    // Retain all fifteen factory tips while joining internal branches in
    // four places. This is a fresh graph, generated from a different seed.
    const links = candidates.filter(e => degree[e.a] > 1 && degree[e.b] > 1 && !edges.includes(e)).slice(0, 4);
    if (links.length !== 4) return null;
    links.forEach(e => { edges.push(e); degree[e.a]++; degree[e.b]++; });
  }
  const grid = Array.from({length: HEIGHT}, () => Array(WIDTH).fill("M"));
  const roads = new Set();
  function paint(p, ch) { if (inside(p)) grid[p.row][p.col] = ch; }
  function disk(p, radius, ch) {
    for (let row = p.row-radius-1; row <= p.row+radius+1; row++) {
      for (let col = p.col-radius; col <= p.col+radius; col++) {
        const n = {col, row};
        if (distance(p, n) <= radius) paint(n, ch);
      }
    }
  }
  edges.forEach((e, edgeIndex) => {
    const a = nodes[e.a], b = nodes[e.b];
    const bend = {col: Math.round((a.col+b.col)/2) + jitter(), row: Math.round((a.row+b.row)/2) + jitter()};
    if (linked) {
      // Offset elbows create pronounced angular doglegs instead of soft
      // mid-line waviness. Alternate the narrow bank along different arms.
      if (Math.abs(a.col-b.col) > Math.abs(a.row-b.row)) bend.row += edgeIndex % 2 ? 1 : -1;
      else bend.col += edgeIndex % 2 ? 1 : -1;
    }
    e.path = line(a, bend).concat(line(bend, b).slice(1));
    e.path.forEach((p, step) => {
      if (linked && edgeIndex % 3 === 0 && step > 1 && step < e.path.length-2) {
        paint(p, ".");
        paint(neighbors(p)[Math.abs(a.col-b.col) > Math.abs(a.row-b.row) ? 2 : 0], ".");
      } else disk(p, 1, ".");
      roads.add(key(p));
    });
  });
  if (linked) leaves.forEach((i, tipIndex) => {
    const e = edges.find(e => e.a === i || e.b === i);
    const route = e.a === i ? e.path.slice().reverse() : e.path;
    if (tipIndex % 2 === 0) disk(route[Math.max(0, route.length-4)], 2, ".");
  });
  // Five separated, asymmetrical rooms, each five to six hexes across.
  const rooms = nodes.map((p, i) => ({p, i})).filter(n => degree[n.i] >= 3 &&
    distance(n.p, nodes[0]) > 8 && distance(n.p, nodes[last]) > 8);
  const clearings = [];
  rooms.sort((a, b) => degree[b.i] - degree[a.i]);
  rooms.forEach(n => {
    if (clearings.length === 5 || clearings.some(p => distance(p, n.p) < (compact ? 8 : 10))) return;
    disk(n.p, 2, ".");
    const lobe = neighbors(n.p)[clearings.length % 6];
    disk(lobe, 2, ".");
    clearings.push(n.p);
  });
  if (clearings.length !== 5) return null;
  [nodes[0], nodes[last]].forEach(p => disk(p, 2, "."));
  roads.forEach(k => { const [col, row] = k.split(",").map(Number); paint({col, row}, "-"); });
  const buildings = [0, last].map((i, owner) => {
    paint(nodes[i], "B"); return {...nodes[i], owner};
  });
  leaves.forEach(i => {
    const e = edges.find(e => e.a === i || e.b === i);
    const route = e.a === i ? e.path.slice().reverse() : e.path;
    const door = route[route.length-2], factory = nodes[i];
    neighbors(factory).forEach(p => paint(p, key(p) === key(door) ? "-" : "M"));
    paint(factory, "F");
    buildings.push({...factory, owner: -1, stored: []});
  });
  // Remove any tiny pocket outside a capped factory nose.
  const open = new Set([key(nodes[0])]), queue = [nodes[0]];
  for (let i = 0; i < queue.length; i++) neighbors(queue[i]).forEach(p => {
    if (inside(p) && grid[p.row][p.col] !== "M" && !open.has(key(p))) {
      open.add(key(p)); queue.push(p);
    }
  });
  if (buildings.some(b => !open.has(key(b)))) return null;
  grid.forEach((row, r) => row.forEach((ch, c) => {
    if (ch !== "M" && !open.has(HEX.key(c, r))) row[c] = "M";
  }));
  // A tree of broad corridors must leave the mountain walls connected to
  // the outer massif. Reject accidental loops where warped arms touch.
  const walls = new Set(["0,0"]), wallQueue = [{col: 0, row: 0}];
  for (let i = 0; i < wallQueue.length; i++) neighbors(wallQueue[i]).forEach(p => {
    if (grid[p.row] && grid[p.row][p.col] === "M" && !walls.has(key(p))) {
      walls.add(key(p)); wallQueue.push(p);
    }
  });
  if (!linked && grid.some((row, r) => row.some((ch, c) => ch === "M" && !walls.has(HEX.key(c, r))))) return null;
  // Hills are the game's +20 defense terrain; keep a continuous road spine.
  grid.forEach((row, r) => row.forEach((ch, c) => {
    if (ch !== ".") return;
    const roll = rng();
    if (roll < (linked ? 0.35 : 0.28)) row[c] = "h";
    else if (linked && roll < 0.52 && !roads.has(HEX.key(c, r))) row[c] = "w";
  }));
  const tanks = ["BISON", "LENET", "POLAR", "GRIZZLY", "SLAGGER", "TITAN", "GIANT"];
  buildings.slice(2).forEach((b, i) => {
    b.stored = ["CHARLIE", tanks[i%7], "HADRIAN", "MULE", "KILROY",
      tanks[(i+2)%7], "OCTOPUS", i%2 ? "LYNX" : "RABBIT", "PANTHER",
      tanks[(i+4)%7], "SEEKER", tanks[(i+6)%7]];
  });
  const units = [];
  const startRoster = ["BISON", "LENET", "POLAR", "GRIZZLY", "SLAGGER", "CHARLIE", "CHARLIE", "KILROY"];
  [nodes[0], nodes[last]].forEach((base, owner) => {
    const spots = queue.filter(p => distance(base, p) > 0 && distance(base, p) <= 2);
    spots.sort((a, b) => distance(a, nodes[owner ? 0 : last]) - distance(b, nodes[owner ? 0 : last]) || a.row-b.row || a.col-b.col);
    startRoster.forEach((t, i) => {
      const p = spots[i]; paint(p, "."); units.push({t, o: owner, x: p.col, y: p.row});
    });
  });
  return {map: {
    name: compact ? "FRACTURED FJORDS" : linked ? "SHATTERED FJORDS" : "TWISTED FJORDS", pack: "AI-made", author: "Codex · original level",
    source: compact ? "levels/fractured-fjords.json" : linked ? "levels/shattered-fjords.json" : "levels/twisted-fjords.json",
    description: compact ? "Part 3 compresses the fjord war into a fresh 40×40 mountain maze. Angular two- and three-hex passages reconnect around mountain islands, with five small battlefields and widening or tapering factory approaches. Each distant corner camp starts with five tanks and three infantry." : linked ? "A fresh mountain labyrinth: angular fjords pinch to two hexes, open into small battlefields and reconnect through four cross-routes. Alternating factory approaches flare into bowls or taper into narrow necks. Opposite corner camps each begin with five tanks and three infantry." : "Fifteen twisting, three-hex-wide fjords branch through a mountain massif. Five irregular clearings open into small battlefields. Union and Xenon start at opposite corner camps, each with five tanks and three infantry.",
    special: linked ? "Fifteen neutral factories hold 12 ground units apiece, each behind a single road exit and five mountain walls. Plains, roads, +20 hills and +30 wasteland vary the fighting ground. No aircraft. Vehicles can take alternate routes; infantry can cross the mountains." : "Capture the 15 neutral factories: each holds 12 ground units and has one road exit, enclosed by five mountain hexes. Plains, roads and +20 hills fill the fjords. No aircraft. Infantry can cross mountains; keep the factory mouths clear for reinforcements.",
    tags: compact ? ["part 3", "40×40", "linked branches", "ground only"] : linked ? ["15 fjords", "linked branches", "2-hex narrows", "ground only"] : ["15 fjords", "180 reserves", "ground only", "large"],
    turnLimit: 180, grid: grid.map(row => row.join("")), buildings, units
  }, clearings, seed};
}

function denseDesign() {
  // Part 4 starts from tightly spaced, separate mountain pockets. Their
  // surrounding floor is a mesh of tunnels, rather than a solid massif.
  const size = 28, rng = random(9137), grid = Array.from({length:size}, () => Array(size).fill("."));
  const inside = p => p.col >= 0 && p.row >= 0 && p.col < size && p.row < size;
  const paint = (p, ch) => { if (inside(p)) grid[p.row][p.col] = ch; };
  function disk(p, radius, ch) {
    for (let row = p.row-radius-1; row <= p.row+radius+1; row++) {
      for (let col = p.col-radius; col <= p.col+radius; col++) {
        if (distance(p, {col,row}) <= radius) paint({col,row}, ch);
      }
    }
  }
  const pockets = [];
  for (let r=0; r<4; r++) for (let c=0; c<4; c++) {
    const p = {col:3+c*7+(r%2 ? -1 : 0), row:3+r*7+(c%2 ? 1 : 0)};
    pockets.push(p); disk(p,2,"M");
    // Cut a small notch in alternate pockets for angled, unequal banks.
    if ((c+r)%2) {
      const n = neighbors(p)[(c+r)%6];
      paint(neighbors(n)[(c+r)%6], ".");
    }
  }
  const bases = [{col:1,row:1},{col:26,row:26}];
  bases.forEach(p => disk(p,2,"."));
  // Three compact staging spaces between pockets, never a broad empty plain.
  const clearings = [{col:7,row:7},{col:19,row:13},{col:13,row:21}];
  clearings.forEach(p => disk(p,1,"."));
  const buildings = bases.map((p,owner) => ({...p,owner}));
  const tips = [1,3,4,6,9,11,12,14];
  const tanks = ["BISON","LENET","POLAR","GRIZZLY","SLAGGER","TITAN","GIANT"];
  tips.forEach((index, i) => {
    const p = pockets[index], direction = (i*2+1)%6;
    // Re-form the five mountain walls after clearing any nearby staging room.
    neighbors(p).forEach(n => paint(n,"M"));
    let door = p;
    for (let step=0; step<3; step++) { door = neighbors(door)[direction]; paint(door,"-"); }
    paint(p,"F");
    buildings.push({...p,owner:-1,stored:["CHARLIE",tanks[i%7],"HADRIAN","MULE","KILROY",
      tanks[(i+2)%7],"OCTOPUS",i%2 ? "LYNX" : "RABBIT","PANTHER",tanks[(i+4)%7]]});
  });
  bases.forEach(p => paint(p,"B"));
  // Route a connected road supply net through the actual open mesh.
  const queue = [bases[0]], previous = new Map([[key(bases[0]), null]]);
  for (let i=0; i<queue.length; i++) neighbors(queue[i]).forEach(p => {
    if (inside(p) && grid[p.row][p.col] !== "M" && !previous.has(key(p))) {
      previous.set(key(p),queue[i]); queue.push(p);
    }
  });
  buildings.slice(1).concat(clearings).forEach(target => {
    if (!previous.has(key(target))) throw new Error("Isolated pocket factory");
    let p = target;
    while (p) {
      if (grid[p.row][p.col] === ".") paint(p,"-");
      p = previous.get(key(p));
    }
  });
  grid.forEach(row => row.forEach((ch,c) => {
    if (ch !== ".") return;
    const roll = rng(); row[c] = roll < .28 ? "h" : roll < .4 ? "w" : ".";
  }));
  const units = [];
  bases.forEach((base,owner) => {
    const spots = queue.filter(p => distance(p,base)>0 && distance(p,base)<=2 && grid[p.row][p.col] !== "F");
    spots.sort((a,b) => distance(a,bases[1-owner])-distance(b,bases[1-owner]) || a.row-b.row || a.col-b.col);
    ["BISON","LENET","POLAR","GRIZZLY","CHARLIE","CHARLIE","KILROY"].forEach((t,i) => {
      const p=spots[i]; paint(p,"."); units.push({t,o:owner,x:p.col,y:p.row});
    });
  });
  return {seed:9137,clearings,map:{
    name:"HONEYCOMB FJORDS",pack:"AI-made",author:"Codex · original level",source:"levels/honeycomb-fjords.json",
    description:"Part 4 is a dense 28×28 web of angled tunnels and fjords around small mountain pockets. Two-hex narrows, branching passages and three small staging spaces cover the board. Opposite corner camps each start with four tanks and three infantry.",
    special:"Eight neutral factories hold ten ground units each, with one road mouth and five mountain walls. Every mountain pocket is small; alternate routes run throughout the map. Plains, roads, +20 hills and +30 wasteland; no aircraft.",
    tags:["part 4","28×28","8 factories","dense tunnels"],turnLimit:120,
    grid:grid.map(row=>row.join("")),buildings,units
  }};
}

let first, second, third;
for (let seed = 1; seed < 100000 && !first; seed++) first = design(seed, false);
for (let seed = 2000; seed < 100000 && !second; seed++) second = design(seed, true);
for (let seed = 4000; seed < 100000 && !third; seed++) third = design(seed, true, true);
if (!first || !second || !third) throw new Error("No valid fjord design found");
const root = path.join(__dirname, "..");
fs.mkdirSync(path.join(root, "levels"), {recursive: true});
const results = [first, second, third, denseDesign()];
results.forEach(result => {
  const map = result.map;
  if (map.buildings.some(b => (b.stored || []).some(t => UNIT_TYPES[t].moveType === "air"))) throw new Error("Aircraft in ground-only map");
  fs.writeFileSync(path.join(root, map.source), JSON.stringify(map, null, 2) + "\n");
  console.log(JSON.stringify({name: map.name, seed: result.seed, size: [map.grid[0].length, map.grid.length], factories: map.buildings.length-2, clearings: result.clearings}));
});
fs.writeFileSync(path.join(root, "js/data-ai-maps.js"),
  "/* Original AI-made levels. Rebuild with node tools/build-ai-fjords.js. */\n\"use strict\";\n\nvar AI_MADE_LEVELS = " +
  JSON.stringify(results.map(result => result.map), null, 2) + ";\n\nif (typeof module !== \"undefined\") module.exports = AI_MADE_LEVELS;\n");
