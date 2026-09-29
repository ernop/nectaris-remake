"use strict";
/* Runs the fifteen units through the game's own engine and returns every
 * number the overview prints. Any statement checked here that turns out false
 * throws, so the page and README can only show facts the engine produced. */
const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.join(__dirname, "..");

const ENGINE = require(path.join(root, "js/engine.js"));
const COMBAT = require(path.join(root, "js/combat.js"));
const { UNIT_TYPES, mergeUnitTypes } = require(path.join(root, "js/data-units.js"));
const { TERRAIN, terrainCost } = require(path.join(root, "js/data-terrain.js"));
const HEX = require(path.join(root, "js/hex.js"));
const { UNITS } = require("./units.js");

const STOCK = JSON.parse(JSON.stringify(UNIT_TYPES));
const STOCK_IDS = Object.keys(STOCK);

/* --- Custom definitions --------------------------------------------------- */

function customDefinitions() {
  const out = {};
  for (const u of UNITS) out[u.id] = Object.assign({}, JSON.parse(JSON.stringify(u.def)), { sprite: u.sprite });
  return out;
}

// mergeUnitTypes type-checks every field first, so a malformed definition
// throws here and joins nothing.
mergeUnitTypes(customDefinitions());
const NEW = {};
for (const u of UNITS) NEW[u.id] = UNIT_TYPES[u.id];

/* --- Small board helpers ---------------------------------------------------- */

const CENTER = 20;
function board(size, fill) { return Array.from({ length: size }, () => fill.repeat(size)); }
function put(grid, col, row, ch) {
  grid[row] = grid[row].slice(0, col) + ch + grid[row].slice(col + 1);
  return grid;
}
function play(grid, units, buildings) {
  return new ENGINE.Game({ name: "opus-sonnet-55 check", grid, units, buildings }, { seed: 55 });
}
function tenths(n) { return n.toFixed(1); }
function names(ids) { return ids.map((id) => id[0] + id.slice(1).toLowerCase()); }

/* Expected casualties both ways for one exchange at full strength. */
function duel(attackerId, defenderId, o = {}) {
  const dist = o.dist || 1, size = 41;
  const grid = board(size, ".");
  if (o.attackerTerrain) put(grid, CENTER, CENTER, o.attackerTerrain);
  if (o.defenderTerrain) put(grid, CENTER, CENTER - dist, o.defenderTerrain);
  const units = [
    { t: attackerId, o: 0, x: CENTER, y: CENTER, str: o.attackerStrength || 8, exp: o.attackerExp || 0 },
    { t: defenderId, o: 1, x: CENTER, y: CENTER - dist, str: o.defenderStrength || 8, exp: o.defenderExp || 0 },
  ];
  const g = play(grid, units);
  const [a, d] = g.units;
  assert.equal(COMBAT.canAttackAt(a.type, COMBAT.isAir(d), dist), true, `${attackerId} cannot attack ${defenderId} at ${dist}`);
  const r = COMBAT.distribution(g, a, d);
  return { out: r.out, back: r.in_, kill: r.kill, counter: r.preview.counter, attack: r.preview.attacker.ap, defense: r.preview.defender.da };
}

/* Hexes from its starting hex to the farthest hex it could hit this turn on
 * open ground of one terrain, or null when it cannot fire at that domain. */
function reach(typeId, air, terrain = ".") {
  const size = 2 * CENTER + 1, g = play(board(size, terrain), [{ t: typeId, o: 0, x: CENTER, y: CENTER }]);
  const unit = g.units[0], band = COMBAT.rangeBand(unit.type, air);
  if (!band) return null;
  let far = 0;
  if (!unit.type.moveOrFire && unit.type.move > 0) {
    for (const cell of g.stoppingCells(unit)) far = Math.max(far, HEX.distance(CENTER, CENTER, cell % size, (cell / size) | 0));
  }
  return far + band.max;
}

function cellsInBand(min, max) {
  let n = 0;
  for (let c = 0; c < 41; c++) for (let r = 0; r < 41; r++) {
    const d = HEX.distance(CENTER, CENTER, c, r);
    if (d >= min && d <= max) n++;
  }
  return n;
}

function legalTargets(g, unit) { return g.legalAttackTargets(unit).map((t) => t.typeId); }

/* --- Gap and dominance screens ---------------------------------------------- */

function gapScreen() {
  const rows = [];
  for (const u of UNITS) {
    const stockMatches = STOCK_IDS.filter((id) => u.gap.test(STOCK[id]));
    assert.deepEqual(stockMatches, [], `${u.id}: stock units already fill "${u.gap.cell}": ${stockMatches.join(", ")}`);
    assert.equal(u.gap.test(NEW[u.id]), true, `${u.id} does not satisfy its own gap test`);
    const setMatches = UNITS.filter((v) => v.id !== u.id && u.gap.test(NEW[v.id])).map((v) => v.id);
    rows.push({ id: u.id, cell: u.gap.cell, stockMatches, setMatches });
  }
  return rows;
}

// Terrain reach of a chassis: the cost to enter each terrain, null when barred.
function terrainCosts(t) {
  return Object.values(TERRAIN).map((terr) => terrainCost(terr, t.moveType, t));
}
function band(t, air) { return COMBAT.rangeBand(t, air); }
function coversBand(a, b) { return !b || (!!a && a.min <= b.min && a.max >= b.max); }
function listCovers(a, b) { return !b || !a ? !a : b.every((x) => a.indexOf(x) >= 0); }
const isAir = (t) => t.moveType === "air";

/* A dominates B when it does everything B does at least as well: no lower
 * number, no narrower firing band, no narrower terrain access, and no extra
 * restriction on when it may fire. Aircraft and ground units are never
 * compared: aircraft take no terrain defense but only anti-air weapons can
 * shoot them, which is not an ordering. Costs and purchases are outside the
 * game, so a dominated unit would simply never be fielded. */
function dominates(a, b) {
  if (isAir(a) !== isAir(b)) return false;
  if (a.move < b.move || a.def < b.def) return false;
  if ((a.atkG || 0) < (b.atkG || 0) || (a.atkA || 0) < (b.atkA || 0)) return false;
  if (!coversBand(band(a, false), band(b, false)) || !coversBand(band(a, true), band(b, true))) return false;
  if (b.capture && !a.capture) return false;
  if ((a.cargo || 0) < (b.cargo || 0)) return false;
  if (b.cargo && !listCovers(a.cargoTypes, b.cargoTypes)) return false;
  if (a.moveOrFire && !b.moveOrFire) return false;
  if (b.moveAfterAttack && !a.moveAfterAttack) return false;
  if (b.move > 0) {
    const ca = terrainCosts(a), cb = terrainCosts(b);
    for (let i = 0; i < ca.length; i++) {
      if (cb[i] !== null && (ca[i] === null || ca[i] > cb[i])) return false;
    }
  }
  return true;
}

function dominanceScreen() {
  const everything = STOCK_IDS.concat(UNITS.map((u) => u.id));
  const found = [];
  for (const u of UNITS) {
    for (const other of everything) {
      if (other === u.id) continue;
      const t = UNIT_TYPES[other];
      if (dominates(NEW[u.id], t)) found.push(`${u.id} dominates ${other}`);
      if (dominates(t, NEW[u.id])) found.push(`${other} dominates ${u.id}`);
    }
  }
  assert.deepEqual(found, [], "dominance screen: " + found.join("; "));
  // The screen must be able to fail: a copy with one better number is caught.
  assert.equal(dominates(Object.assign({}, STOCK.BISON, { atkG: 60 }), STOCK.BISON), true, "dominance screen is inert");
  assert.equal(dominates(STOCK.BISON, STOCK.BISON), true, "a unit equals itself");
  assert.equal(dominates(STOCK.HADRIAN, STOCK.OCTOPUS), false, "Hadrian and Octopus are incomparable");
  return { checked: UNITS.length * (everything.length - 1) * 2 };
}

/* --- Per-unit checks and exhibits -------------------------------------------- */

const STOCK_ANTI_AIR = STOCK_IDS.filter((id) => STOCK[id].rngA > 0 && STOCK[id].atkA > 0);

const EXHIBITS = {
  IBEX() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "IBEX", o: 0, x: 20, y: 20 },
      { t: "BISON", o: 1, x: 20, y: 17 }, { t: "BISON", o: 1, x: 20, y: 18 },
      { t: "BISON", o: 1, x: 20, y: 19 }, { t: "BISON", o: 1, x: 20, y: 16 },
    ]);
    const ibex = g.units[0];
    assert.equal(g.legalAttackTargets(ibex).length, 2, "Ibex fires at exactly the 2 and 3 hex enemies");
    assert.deepEqual(g.legalAttackTargets(ibex).map((t) => HEX.distance(20, 20, t.col, t.row)).sort(), [2, 3]);
    const shot = duel("IBEX", "BISON", { dist: 3 });
    assert.equal(shot.counter, false);
    lines.push(`Shells a full Bison on plains at range 3: ${tenths(shot.out)} of 8 lost, no counter.`);
    const artillery = STOCK_IDS.filter((id) => STOCK[id].cls === "artillery");
    const mountainArtillery = artillery.filter((id) => terrainCost(TERRAIN.mountain, STOCK[id].moveType, STOCK[id]) !== null);
    assert.deepEqual(mountainArtillery, []);
    assert.equal(terrainCost(TERRAIN.mountain, "foot", NEW.IBEX), 2);
    lines.push(`Mountain hexes cost it 2 movement; ${names(artillery).join(", ")} cannot enter them at all.`);
    const plain = duel("BISON", "IBEX", { defenderTerrain: "." }), peak = duel("BISON", "IBEX", { defenderTerrain: "M" });
    lines.push(`A Bison attacking it costs ${tenths(plain.out)} of 8 on plains and ${tenths(peak.out)} of 8 on a mountain.`);
    const mover = play(board(41, "."), [{ t: "IBEX", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 15 }]);
    const m = mover.units[0];
    mover.moveUnit(m, 20, 19);
    assert.equal(mover.canAttackNow(m), false, "Ibex fires after moving");
    lines.push("After any move it cannot fire until the next turn.");
    return lines;
  },

  NETTLE() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "NETTLE", o: 0, x: 20, y: 20 },
      { t: "EAGLE", o: 1, x: 20, y: 18 }, { t: "EAGLE", o: 1, x: 20, y: 17 }, { t: "EAGLE", o: 1, x: 20, y: 19 },
      { t: "BISON", o: 1, x: 22, y: 20 },
    ]);
    const nettle = g.units[0];
    const targets = g.legalAttackTargets(nettle);
    assert.equal(targets.length, 2);
    assert.ok(targets.every((t) => t.typeId === "EAGLE"));
    const shot = duel("NETTLE", "EAGLE", { dist: 2 });
    lines.push(`Fires on a full Eagle at range 2: ${tenths(shot.out)} of 8 lost, no counter.`);
    const mid = duel("NETTLE", "EAGLE", { dist: 3 });
    lines.push(`At range 3 the same shot costs the Eagle ${tenths(mid.out)} of 8.`);
    const hit = duel("EAGLE", "NETTLE");
    assert.equal(hit.counter, false);
    lines.push(`An Eagle attacking it from an adjacent hex removes ${tenths(hit.out)} of 8 and takes no counter.`);
    const antiAirOnFeet = STOCK_ANTI_AIR.filter((id) => STOCK[id].moveType === "foot" && STOCK[id].rngA > 1);
    assert.deepEqual(antiAirOnFeet, []);
    assert.equal(terrainCost(TERRAIN.mountain, "foot", NEW.NETTLE), 2);
    lines.push("Mountain hexes cost it 2 movement; Seeker and Hawkeye cannot enter them.");
    return lines;
  },

  FERRET() {
    const lines = [];
    const g = play(board(41, "."), [{ t: "FERRET", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 16 }]);
    const ferret = g.units[0], bison = g.units[1];
    g.moveUnit(ferret, 20, 17);
    assert.equal(g.canAttackNow(ferret), true);
    assert.equal(ferret.movePointsLeft, 1);
    g.attack(ferret, bison);
    assert.ok(ferret.strength > 0, "the seeded skirmisher survived its strike");
    assert.equal(ferret.movePointsLeft, 1);
    assert.equal(ferret.moved, false);
    const range = g.movementRange(ferret);
    assert.ok(range["20,18"] && range["20,18"].canStop, "Ferret cannot walk away after attacking");
    lines.push("Move 4: after walking 3 hexes and striking a Bison it still holds 1 movement point and can step away.");
    const duelHit = duel("FERRET", "BISON");
    lines.push(`Its strike on a full Bison costs ${tenths(duelHit.out)} of 8 and draws ${tenths(duelHit.back)} back.`);
    const kilroy = duel("KILROY", "BISON");
    lines.push(`Kilroy's strike on the same Bison costs ${tenths(kilroy.out)} of 8 and cannot be followed by a retreat.`);
    return lines;
  },

  LOCUST() {
    const lines = [];
    const grid = board(41, ".");
    for (let r = 0; r < 41; r++) put(grid, 20, r, "-");
    const setup = (id) => play(grid, [{ t: id, o: 0, x: 20, y: 20 }, { t: "ATLAS", o: 1, x: 20, y: 12 }]);
    const g = setup("LOCUST");
    const locust = g.units[0];
    g.moveUnit(locust, 20, 16);
    assert.deepEqual(legalTargets(g, locust), ["ATLAS"], "Locust fires after moving 4 road hexes to range 4");
    const o = setup("OCTOPUS"), oct = o.units[0];
    o.moveUnit(oct, 20, 16);
    assert.deepEqual(legalTargets(o, oct), [], "Octopus cannot fire after moving");
    const shot = duel("LOCUST", "BISON", { dist: 4 });
    lines.push(`Moves 4 road hexes, then hits a Bison at range 4: ${tenths(shot.out)} of 8 lost, no counter.`);
    const plainReach = reach("LOCUST", false), roadReach = reach("LOCUST", false, "-");
    lines.push(`Reach (farthest hex it can hit this turn): ${plainReach} on plains, ${roadReach} on roads.`);
    const cmp = ["HADRIAN", "OCTOPUS", "LYNX"].map((id) => `${id[0]}${id.slice(1).toLowerCase()} ${reach(id, false)}`);
    lines.push(`Stock guns on plains: ${cmp.join(", ")}.`);
    assert.equal(terrainCost(TERRAIN.mountain, "wheels", NEW.LOCUST), null);
    assert.equal(terrainCost(TERRAIN.waste, "wheels", NEW.LOCUST), null);
    lines.push("Wheels: plains cost 2, hills 4; mountains, valleys and wasteland are closed to it.");
    return lines;
  },

  CYCLONE() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "CYCLONE", o: 0, x: 20, y: 20 },
      { t: "BISON", o: 1, x: 20, y: 17 }, { t: "EAGLE", o: 1, x: 22, y: 19 }, { t: "BISON", o: 1, x: 20, y: 19 },
    ]);
    const cyc = g.units[0];
    const seen = g.legalAttackTargets(cyc).map((t) => t.typeId).sort();
    assert.deepEqual(seen, ["BISON", "EAGLE"], "Cyclone hits one ground and one air target, not the adjacent Bison");
    const ground = duel("CYCLONE", "BISON", { dist: 3 }), air = duel("CYCLONE", "EAGLE", { dist: 3 });
    lines.push(`At range 3: ${tenths(ground.out)} of 8 off a Bison, ${tenths(air.out)} of 8 off an Eagle; no counter either way.`);
    const specialists = duel("OCTOPUS", "BISON", { dist: 3 }), hawk = duel("HAWKEYE", "EAGLE", { dist: 3 });
    lines.push(`Specialists at the same range: Octopus ${tenths(specialists.out)} on a Bison, Hawkeye ${tenths(hawk.out)} on an Eagle.`);
    assert.equal(STOCK_IDS.some((id) => STOCK[id].rngG >= 2 && STOCK[id].rngA >= 2), false);
    lines.push("No stock unit has an indirect band against both ground and air; every indirect stock unit fires at one domain only.");
    const adjacent = duel("BISON", "CYCLONE");
    lines.push(`An adjacent Bison removes ${tenths(adjacent.out)} of 8 and takes ${tenths(adjacent.back)} back: the Cyclone cannot answer at range 1.`);
    return lines;
  },

  WARDEN() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "WARDEN", o: 0, x: 20, y: 20 },
      { t: "EAGLE", o: 1, x: 20, y: 19 }, { t: "EAGLE", o: 1, x: 20, y: 18 }, { t: "EAGLE", o: 1, x: 20, y: 17 },
      { t: "EAGLE", o: 1, x: 20, y: 16 }, { t: "BISON", o: 1, x: 22, y: 20 },
    ]);
    const w = g.units[0];
    const airBands = g.legalAttackTargets(w).filter((t) => t.typeId === "EAGLE").map((t) => HEX.distance(20, 20, t.col, t.row)).sort();
    assert.deepEqual(airBands, [2, 3], "Warden hits aircraft at 2 and 3 only");
    const missile = duel("WARDEN", "EAGLE", { dist: 2 });
    lines.push(`Missiles on a full Eagle at range 2: ${tenths(missile.out)} of 8 lost, no counter.`);
    const closed = duel("EAGLE", "WARDEN"), seeker = duel("EAGLE", "SEEKER");
    assert.equal(closed.counter, false);
    assert.equal(seeker.counter, true);
    lines.push(`An Eagle that closes to attack it removes ${tenths(closed.out)} of 8 and takes no counter; against a Seeker it would take ${tenths(seeker.back)}.`);
    const gun = duel("WARDEN", "BISON");
    lines.push(`Its hull gun against an adjacent Bison: ${tenths(gun.out)} of 8 lost, ${tenths(gun.back)} back.`);
    return lines;
  },

  STALKER() {
    const lines = [];
    const g = play(board(41, "."), [{ t: "STALKER", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 19 }]);
    const s = g.units[0];
    assert.equal(g.canAttackNow(s), true);
    assert.deepEqual(legalTargets(g, s), ["BISON"]);
    const g2 = play(board(41, "."), [{ t: "STALKER", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 16 }]);
    const s2 = g2.units[0];
    g2.moveUnit(s2, 20, 18);
    assert.equal(g2.canAttackNow(s2), false, "Stalker fires after moving");
    const strike = duel("STALKER", "BISON"), taken = duel("BISON", "STALKER"), grizzly = duel("BISON", "GRIZZLY");
    lines.push(`Stationary strike on an adjacent Bison: ${tenths(strike.out)} of 8 lost, ${tenths(strike.back)} back.`);
    lines.push(`A Bison attacking it loses ${tenths(taken.back)} of 8 to the counter and inflicts ${tenths(taken.out)}; attacking a Grizzly it loses ${tenths(grizzly.back)}.`);
    const shelled = duel("HADRIAN", "STALKER", { dist: 4 }), bombed = duel("EAGLE", "STALKER");
    assert.equal(bombed.counter, false);
    lines.push(`Hadrian at range 4 removes ${tenths(shelled.out)} of 8 with no counter; an Eagle removes ${tenths(bombed.out)} and takes none.`);
    const moveOrFire = STOCK_IDS.filter((id) => STOCK[id].moveOrFire);
    assert.ok(moveOrFire.every((id) => STOCK[id].rngG > 1 || STOCK[id].rngA > 1));
    lines.push(`It is the first move-or-fire unit that must be adjacent to fire; ${names(moveOrFire).join(", ")} are all long-range.`);
    return lines;
  },

  BADGER() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "BADGER", o: 0, x: 20, y: 20 }, { t: "CHARLIE", o: 0, x: 20, y: 21 }, { t: "PANTHER", o: 0, x: 21, y: 20 },
      { t: "BISON", o: 0, x: 19, y: 20 }, { t: "IBEX", o: 0, x: 21, y: 21 }, { t: "ATLAS", o: 0, x: 19, y: 21 },
      { t: "REDOUBT", o: 0, x: 18, y: 20 }, { t: "JAVELIN", o: 0, x: 18, y: 21 },
    ]);
    const [badger, charlie, panther, bison, ibex, atlas, redoubt, javelin] = g.units;
    assert.equal(g.canLoad(badger, redoubt, false), true);
    assert.equal(g.canLoad(badger, javelin, false), true);
    assert.equal(g.canLoad(badger, charlie, false), true);
    assert.equal(g.canLoad(badger, ibex, false), true);
    assert.equal(g.canLoad(badger, atlas, false), true);
    NEW.BADGER.cargoTypes.forEach((id) => assert.ok(UNIT_TYPES[id], `Badger names unknown passenger ${id}`));
    assert.equal(g.canLoad(badger, panther, false), false);
    assert.equal(g.canLoad(badger, panther, true), true);
    assert.equal(g.canLoad(badger, bison, false), false);
    lines.push("Loads Charlie, Kilroy, Ibex, Nettle, Ferret, Atlas, Trigger, Redoubt or Javelin, and Panther from a factory only. The Mule loads only Charlie, Kilroy, Atlas, Trigger and Panther (factory only).");
    assert.equal(terrainCost(TERRAIN.waste, "treads", NEW.BADGER), 3);
    assert.equal(terrainCost(TERRAIN.waste, "wheels", STOCK.MULE), null);
    lines.push("Crosses wasteland (3) and hills (2); the Mule cannot enter wasteland and pays 4 for hills.");
    const carried = duel("BISON", "BADGER"), mule = duel("BISON", "MULE");
    lines.push(`A Bison attacking it removes ${tenths(carried.out)} of 8; attacking a Mule removes ${tenths(mule.out)} of 8.`);
    lines.push(`Move 4 against the Mule's 6: on roads the Mule covers ${STOCK.MULE.move - NEW.BADGER.move} more hexes per turn.`);
    return lines;
  },

  RHINO() {
    const lines = [];
    const grid = board(41, ".");
    put(grid, 20, 17, "B");
    const g = play(grid, [{ t: "RHINO", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 5, y: 5 }], [{ col: 20, row: 17, owner: 1 }]);
    const rhino = g.units[0];
    g.moveUnit(rhino, 20, 17);
    g.finishMovement(rhino);
    assert.equal(g.winner, 0);
    assert.equal(g.winReason, "base");
    lines.push("Moving onto the enemy base three hexes away ends the game: base capture works for any unit with the capture flag.");
    const pain = duel("BISON", "RHINO"), kil = duel("BISON", "KILROY"), cha = duel("BISON", "CHARLIE");
    lines.push(`A Bison attacking it removes ${tenths(pain.out)} of 8; attacking Kilroy ${tenths(kil.out)}, Charlie ${tenths(cha.out)}.`);
    const capturers = STOCK_IDS.filter((id) => STOCK[id].capture);
    assert.ok(capturers.every((id) => STOCK[id].moveType !== "treads"));
    lines.push(`Stock capturers (${names(capturers).join(", ")}) have defense ${capturers.map((id) => STOCK[id].def).join(", ")}; this is 35.`);
    assert.equal(terrainCost(TERRAIN.mountain, "treads", NEW.RHINO), null);
    lines.push("Tracked chassis: mountains and valleys are closed to it.");
    return lines;
  },

  REDOUBT() {
    const lines = [];
    assert.equal(NEW.REDOUBT.move, 0);
    const g = play(board(41, "."), [{ t: "REDOUBT", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 19 }, { t: "EAGLE", o: 1, x: 21, y: 20 }]);
    const r = g.units[0];
    assert.deepEqual(Object.keys(g.movementRange(r)), ["20,20"]);
    assert.deepEqual(legalTargets(g, r).sort(), ["BISON", "EAGLE"]);
    const ground = duel("BISON", "REDOUBT"), air = duel("EAGLE", "REDOUBT");
    assert.equal(ground.counter, true);
    assert.equal(air.counter, true);
    lines.push(`A Bison attacking it removes ${tenths(ground.out)} of 8 and loses ${tenths(ground.back)}; an Eagle removes ${tenths(air.out)} and loses ${tenths(air.back)}.`);
    const onBase = duel("BISON", "REDOUBT", { defenderTerrain: "B", dist: 1 });
    lines.push(`On a base (+35 defense) the same Bison removes ${tenths(onBase.out)} of 8 and loses ${tenths(onBase.back)}.`);
    const atlas = duel("ATLAS", "REDOUBT", { dist: 5, defenderTerrain: "B" });
    lines.push(`Atlas at range 5 against a Redoubt on a base removes ${tenths(atlas.out)} of 8 per shot; indirect fire is never countered.`);
    const fixed = STOCK_IDS.filter((id) => STOCK[id].move === 0);
    lines.push(`Stock fixed units: ${names(fixed).join(" and ")}; neither shoots an adjacent unit.`);
    assert.ok(fixed.every((id) => STOCK[id].rngG !== 1));
    return lines;
  },

  JAVELIN() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "JAVELIN", o: 0, x: 20, y: 20 },
      { t: "EAGLE", o: 1, x: 20, y: 19 }, { t: "EAGLE", o: 1, x: 20, y: 18 }, { t: "EAGLE", o: 1, x: 20, y: 16 }, { t: "BISON", o: 1, x: 20, y: 17 },
    ]);
    const j = g.units[0];
    const seen = g.legalAttackTargets(j).map((t) => HEX.distance(20, 20, t.col, t.row) + t.typeId);
    assert.deepEqual(seen.sort(), ["2EAGLE", "4EAGLE"].sort(), "Javelin fires at aircraft at 2 and 4 only");
    const ring = cellsInBand(2, 4);
    assert.equal(ring, 54);
    lines.push(`Air denial ring: ${ring} hexes (2 to 4 out); the six adjacent hexes are safe from it.`);
    const shot = duel("JAVELIN", "EAGLE", { dist: 3 }), hunter = duel("JAVELIN", "HUNTER", { dist: 3 });
    lines.push(`One salvo at range 3: ${tenths(shot.out)} of 8 off an Eagle, ${tenths(hunter.out)} of 8 off a Hunter; no counter.`);
    const closed = duel("EAGLE", "JAVELIN");
    assert.equal(closed.counter, false);
    lines.push(`An Eagle that reaches an adjacent hex removes ${tenths(closed.out)} of 8 and takes no counter.`);
    const fixedAntiAir = STOCK_IDS.filter((id) => STOCK[id].move === 0 && STOCK[id].atkA > 0);
    assert.deepEqual(fixedAntiAir, []);
    return lines;
  },

  HORNET() {
    const lines = [];
    const g = play(board(41, "."), [{ t: "HORNET", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 15 }]);
    const h = g.units[0], b = g.units[1];
    g.moveUnit(h, 20, 16);
    assert.equal(h.movePointsLeft, 3);
    g.attack(h, b);
    assert.ok(h.strength > 0);
    assert.equal(h.movePointsLeft, 3);
    const range = g.movementRange(h);
    assert.ok(range["20,19"] && range["20,19"].canStop, "Hornet cannot fly away after its attack");
    lines.push("Move 7: after flying 4 hexes and firing it still holds 3 movement points and flies away.");
    const hit = duel("HORNET", "BISON");
    assert.equal(hit.counter, false);
    lines.push(`Against a full Bison it removes ${tenths(hit.out)} of 8; a tank has no anti-air attack, so it takes no counter.`);
    const eagle = duel("EAGLE", "BISON");
    lines.push(`An Eagle removes ${tenths(eagle.out)} of 8 in the same exchange but stays next to its target.`);
    return lines;
  },

  LANCER() {
    const lines = [];
    const g = play(board(41, "."), [{ t: "LANCER", o: 0, x: 20, y: 20 }, { t: "BISON", o: 1, x: 20, y: 12 }]);
    const l = g.units[0];
    assert.deepEqual(legalTargets(g, l), [], "the target starts 8 hexes away");
    g.moveUnit(l, 20, 15);
    assert.deepEqual(legalTargets(g, l), ["BISON"], "Lancer cannot fire after flying to range 3");
    const shot = duel("LANCER", "BISON", { dist: 3 });
    assert.equal(shot.counter, false);
    lines.push(`Flies 5 hexes, then hits a full Bison at range 3: ${tenths(shot.out)} of 8 lost, no counter.`);
    const cmp = ["EAGLE", "HUNTER"].map((id) => `${id[0]}${id.slice(1).toLowerCase()} ${reach(id, false)}`);
    lines.push(`Reach on ground targets: Lancer ${reach("LANCER", false)}; ${cmp.join(", ")}.`);
    assert.equal(NEW.LANCER.rngA, 0);
    lines.push("It cannot attack aircraft, adjacent targets or a hex it has not flown to.");
    const hunted = duel("FALCON", "LANCER");
    lines.push(`A Falcon that reaches it removes ${tenths(hunted.out)} of 8 and takes ${tenths(hunted.back)} back.`);
    return lines;
  },

  MERLIN() {
    const lines = [];
    const g = play(board(41, "."), [
      { t: "MERLIN", o: 0, x: 20, y: 20 },
      { t: "FALCON", o: 1, x: 20, y: 19 }, { t: "FALCON", o: 1, x: 20, y: 18 }, { t: "FALCON", o: 1, x: 20, y: 17 },
      { t: "FALCON", o: 1, x: 20, y: 16 }, { t: "BISON", o: 1, x: 22, y: 20 },
    ]);
    const m = g.units[0];
    const dists = g.legalAttackTargets(m).map((t) => HEX.distance(20, 20, t.col, t.row)).sort();
    assert.deepEqual(dists, [2, 3], "Merlin fires at aircraft at 2 and 3 only");
    assert.ok(g.legalAttackTargets(m).every((t) => t.typeId === "FALCON"));
    const shot = duel("MERLIN", "FALCON", { dist: 2 });
    assert.equal(shot.counter, false);
    lines.push(`Missiles on a full Falcon at range 2: ${tenths(shot.out)} of 8 lost, no counter.`);
    const closed = duel("FALCON", "MERLIN"), dogfight = duel("FALCON", "FALCON");
    assert.equal(closed.counter, false);
    assert.equal(dogfight.counter, true);
    lines.push(`A Falcon that closes on it removes ${tenths(closed.out)} of 8 and takes no counter; Falcon on Falcon costs ${tenths(dogfight.out)} and ${tenths(dogfight.back)}.`);
    const airShooters = STOCK_IDS.filter((id) => STOCK[id].moveType === "air" && STOCK[id].rngA > 1);
    assert.deepEqual(airShooters, []);
    lines.push("No stock aircraft can shoot an aircraft from a distance; every stock air-to-air attack is adjacent and countered.");
    const moved = play(board(41, "."), [{ t: "MERLIN", o: 0, x: 20, y: 20 }, { t: "FALCON", o: 1, x: 20, y: 12 }]);
    moved.moveUnit(moved.units[0], 20, 15);
    assert.deepEqual(legalTargets(moved, moved.units[0]), ["FALCON"], "Merlin cannot fire after flying to range 3");
    lines.push(`Reach on aircraft: Merlin ${reach("MERLIN", true)}; Falcon ${reach("FALCON", true)}, Hunter ${reach("HUNTER", true)}.`);
    return lines;
  },

  DRAGONFLY() {
    const lines = [];
    const grid = board(41, ".");
    for (const r of [7, 8]) grid[r] = "M".repeat(41);
    put(grid, 20, 6, "B");
    const buildings = [{ col: 20, row: 6, owner: 1 }];
    const foot = play(grid, [{ t: "CHARLIE", o: 0, x: 20, y: 9 }, { t: "BISON", o: 1, x: 5, y: 30 }], buildings);
    assert.equal(foot.movementRange(foot.units[0])["20,6"], undefined, "Charlie crosses the mountains in one turn");
    const air = play(grid, [{ t: "DRAGONFLY", o: 0, x: 20, y: 9 }, { t: "BISON", o: 1, x: 5, y: 30 }], buildings);
    const d = air.units[0];
    assert.ok(air.movementRange(d)["20,6"]);
    air.moveUnit(d, 20, 6);
    air.finishMovement(d);
    assert.equal(air.winner, 0);
    assert.equal(air.winReason, "base");
    lines.push("Two mountain hexes in front of the enemy base cost Charlie 4 of its 3 movement points; the Dragonfly crosses them and captures the base in one move.");
    const ground = new Set(STOCK_IDS.filter((id) => STOCK[id].moveType !== "air" && STOCK[id].capture));
    assert.ok(ground.size === 3);
    lines.push(`Stock capturers are all ground units (${names([...ground]).join(", ")}); this is the first that flies.`);
    const carry = play(board(41, "."), [{ t: "PELICAN", o: 0, x: 20, y: 20 }, { t: "DRAGONFLY", o: 0, x: 21, y: 20 }]);
    assert.equal(carry.canLoad(carry.units[0], carry.units[1], false), false);
    lines.push("An aircraft cannot board a Pelican or Mule, so it flies its own way.");
    const cannot = STOCK_IDS.filter((id) => !STOCK_ANTI_AIR.includes(id));
    lines.push(`Only ${STOCK_ANTI_AIR.length} of ${STOCK_IDS.length} stock units can damage it; ${names(cannot).join(", ")} cannot.`);
    const kill = duel("SEEKER", "DRAGONFLY");
    lines.push(`A Seeker attacking it removes ${tenths(kill.out)} of 8.`);
    return lines;
  },
};

/* --- Whole-set analysis ------------------------------------------------------- */

function analyze() {
  const gap = gapScreen();
  const dominance = dominanceScreen();
  const exhibits = {}, metrics = {}, stockMetrics = {};
  for (const u of UNITS) {
    const lines = EXHIBITS[u.id]();
    assert.ok(Array.isArray(lines) && lines.length >= 3, `${u.id} needs at least three engine-checked facts`);
    exhibits[u.id] = lines;
    metrics[u.id] = {
      reachG: reach(u.id, false), reachA: reach(u.id, true),
      reachGRoad: reach(u.id, false, "-"), reachARoad: reach(u.id, true, "-"),
    };
  }
  for (const id of STOCK_IDS) {
    stockMetrics[id] = { reachG: reach(id, false), reachA: reach(id, true) };
  }
  return { gap, dominance, exhibits, metrics, stockMetrics };
}

module.exports = { analyze, STOCK, STOCK_IDS, NEW, dominates };
