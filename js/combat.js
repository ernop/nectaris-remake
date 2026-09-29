/* Nectaris remake — combat resolution.
 *
 * Implements the Japanese community reconstruction of the original combat
 * arithmetic, confirmed against the 1997 Windows executable
 * (test/fixtures/windows-combat.json). Support is divided by twice the
 * attacker's strength; terrain adds directly to per-machine defense; surround
 * halves the defender after support and terrain; modified attack and defense
 * cap at 100. Damage is:
 *
 *   unit damage = attack × (100 - defense) / 100
 *   total damage = unit damage × experience × strength × random coefficient
 *
 * Squads use strength × 100 temporary HP, plus 50 HP at strengths 2–8.
 * Intermediate fractions are discarded. Indirect fire receives no support
 * or surround effects and draws no counterattack.
 *
 * Random coefficients follow Anka's published weighted table, checked by
 * its author against PCE, Windows and PS battles (nectaris/d5.html).
 * The original PRNG and any correlation between opposing rolls are unknown.
 *
 * Experience awards (published table):
 *   attacking:  no damage dealt +0 · damage dealt +1 · target destroyed +2
 *   defending:  no damage taken +2 · damage taken +1
 * Infantry additionally gains +4 for capturing a factory (engine's job).
 */
"use strict";

var COMBAT = (function () {
  // Damage coefficients as integer percentages for experience levels 0..8.
  var EXP_DAMAGE = [100, 105, 110, 120, 130, 140, 160, 200, 200];
  var MAX_EXP = 8;
  var MAX_STRENGTH = 8;
  var STAT_CAP = 100;
  // [damage percentage, probability percentage]. Integer buckets avoid
  // floating-point boundary drift; resolution, forecasts and AI share them.
  var RANDOM_WEIGHTS = [[20,3], [50,7], [60,8], [70,9], [80,6], [90,9],
    [100,10], [110,10], [120,6], [130,9], [140,10], [150,6], [200,5], [400,2]];
  var RANDOM_BUCKETS = [], RANDOM_INDICES = [];
  RANDOM_WEIGHTS.forEach(function (entry, index) {
    for (var i = 0; i < entry[1]; i++) {
      RANDOM_BUCKETS.push(entry[0]); RANDOM_INDICES.push(index);
    }
  });

  function experienceBonus(level) {
    if (!Number.isInteger(level) || level < 0 || level > MAX_EXP) {
      throw new Error("Experience level must be an integer from 0 to " + MAX_EXP);
    }
    return {
      damage: EXP_DAMAGE[level] - 100,
      general: level === MAX_EXP,
    };
  }

  /* Mulberry32: the bots' own look-ahead generator (imagined battles, search
   * sampling) and the forecast's. Never the match's dice. */
  function makeRng(seed) {
    var s = seed >>> 0;
    var rng = function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.getState = function () { return s; };
    return rng;
  }

  /* SHA-256 of a text's UTF-8 bytes, as 64 lowercase hex digits. */
  var SHA_K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function sha256(text) {
    var bytes = Array.from(new TextEncoder().encode(String(text))), i, j;
    var bits = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bits >>> (8 * i)) & 0xff);
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    function rotr(v, n) { return (v >>> n) | (v << (32 - n)); }
    for (var off = 0; off < bytes.length; off += 64) {
      for (i = 0; i < 16; i++) {
        w[i] = (bytes[off + 4 * i] << 24) | (bytes[off + 4 * i + 1] << 16) | (bytes[off + 4 * i + 2] << 8) | bytes[off + 4 * i + 3];
      }
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
      for (j = 0; j < 64; j++) {
        var t1 = (k + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + SHA_K[j] + w[j]) | 0;
        var t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        k = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + k) | 0;
    }
    return h.map(function (v) { return ("00000000" + (v >>> 0).toString(16)).slice(-8); }).join("");
  }

  /* The ChaCha20 block function (RFC 8439) with a 256-bit key as 8 words. */
  function chachaBlock(key, counter, nonce) {
    var s = new Uint32Array(16), x = new Uint32Array(16), out = new Uint32Array(16), i;
    s[0] = 0x61707865; s[1] = 0x3320646e; s[2] = 0x79622d32; s[3] = 0x6b206574;
    for (i = 0; i < 8; i++) s[4 + i] = key[i];
    s[12] = counter; s[13] = nonce[0]; s[14] = nonce[1]; s[15] = nonce[2];
    x.set(s);
    function quarter(a, b, c, d) {
      x[a] += x[b]; x[d] ^= x[a]; x[d] = (x[d] << 16) | (x[d] >>> 16);
      x[c] += x[d]; x[b] ^= x[c]; x[b] = (x[b] << 12) | (x[b] >>> 20);
      x[a] += x[b]; x[d] ^= x[a]; x[d] = (x[d] << 8) | (x[d] >>> 24);
      x[c] += x[d]; x[b] ^= x[c]; x[b] = (x[b] << 7) | (x[b] >>> 25);
    }
    for (i = 0; i < 10; i++) {
      quarter(0, 4, 8, 12); quarter(1, 5, 9, 13); quarter(2, 6, 10, 14); quarter(3, 7, 11, 15);
      quarter(0, 5, 10, 15); quarter(1, 6, 11, 12); quarter(2, 7, 8, 13); quarter(3, 4, 9, 14);
    }
    for (i = 0; i < 16; i++) out[i] = x[i] + s[i];
    return out;
  }

  /* A match's 256-bit dice seed as 64 hex digits. 64 hex digits are used as
   * they are; any other seed (a number or text) is stretched with SHA-256; no
   * seed draws 32 fresh bytes from the operating system. */
  var HEX_SEED = /^[0-9a-f]{64}$/;
  function diceSeed(seed) {
    if (seed === undefined) {
      var fresh = crypto.getRandomValues(new Uint8Array(32)), hex = "";
      for (var i = 0; i < 32; i++) hex += ("0" + fresh[i].toString(16)).slice(-2);
      return hex;
    }
    if (typeof seed === "string" && HEX_SEED.test(seed)) return seed;
    if (typeof seed !== "string" && !Number.isSafeInteger(seed)) throw new Error("A dice seed must be a whole number, a text or 64 hex digits.");
    return sha256("nectaris-seed:" + seed);
  }

  /* The match's dice: ChaCha20 keyed by the seed, nonce zero, read as 32-bit
   * words in order, each divided by 2^32. However many rolls one has seen,
   * the next cannot be predicted without the seed. `state()` gives
   * "<seed>/<block counter>/<next word>", which `makeDice` resumes from. */
  var NONCE = [0, 0, 0];
  function makeDice(seed, counter, index) {
    if (!HEX_SEED.test(seed)) throw new Error("Dice need a 64-hex-digit seed.");
    var key = new Uint32Array(8), block = null;
    for (var i = 0; i < 8; i++) {
      // RFC 8439 reads the key's bytes as little-endian words.
      var at = 8 * i;
      key[i] = (parseInt(seed.slice(at + 6, at + 8), 16) << 24 | parseInt(seed.slice(at + 4, at + 6), 16) << 16 |
        parseInt(seed.slice(at + 2, at + 4), 16) << 8 | parseInt(seed.slice(at, at + 2), 16)) >>> 0;
    }
    counter = counter === undefined ? 0 : counter;
    index = index === undefined ? 16 : index;
    if (!Number.isInteger(counter) || counter < 0 || counter > 0xffffffff || !Number.isInteger(index) || index < 0 || index > 16 ||
        (index < 16 && counter === 0)) {
      throw new Error("Invalid dice state " + counter + "/" + index);
    }
    if (index < 16) block = chachaBlock(key, counter - 1, NONCE);
    var dice = function () {
      if (index === 16) {
        block = chachaBlock(key, counter, NONCE);
        counter++;
        index = 0;
      }
      return block[index++] / 4294967296;
    };
    dice.state = function () { return seed + "/" + counter + "/" + index; };
    return dice;
  }
  function restoreDice(state) {
    var parts = typeof state === "string" ? state.split("/") : [];
    if (parts.length !== 3 || !/^\d+$/.test(parts[1]) || !/^\d+$/.test(parts[2])) throw new Error("Invalid dice state.");
    return makeDice(parts[0], Number(parts[1]), Number(parts[2]));
  }

  /* Relevant per-strength attack stat of `unit` against `target`. */
  function atkStat(unitType, targetIsAir) {
    return targetIsAir ? (unitType.atkA || 0) : (unitType.atkG || 0);
  }

  function isAir(unit) { return unit.type.moveType === "air"; }

  /* Attack range band against one target domain, or null when the unit
   * cannot attack that domain. Indirect fire (range above 1) cannot hit an
   * adjacent hex, so its band starts at 2. */
  function rangeBand(unitType, targetIsAir) {
    var max = targetIsAir ? (unitType.rngA || 0) : (unitType.rngG || 0);
    if (max < 1 || atkStat(unitType, targetIsAir) <= 0) return null;
    return { min: max > 1 ? 2 : 1, max: max };
  }

  // rangeBand's rule without allocating a band; attack scans call this per target.
  function canAttackAt(unitType, targetIsAir, dist) {
    var max = targetIsAir ? (unitType.rngA || 0) : (unitType.rngG || 0);
    if (max < 1 || atkStat(unitType, targetIsAir) <= 0) return false;
    return dist >= (max > 1 ? 2 : 1) && dist <= max;
  }

  function capStat(value) {
    return Math.min(STAT_CAP, Math.max(0, Math.floor(value)));
  }

  function terrainValue(game, unit) {
    return isAir(unit) ? 0 : game.terrainAt(unit.col, unit.row).def;
  }

  function attackSupport(game, attacker, defender) {
    var allies = game.adjacentAllies(
      defender.col, defender.row, attacker.player, attacker
    );
    var total = 0;
    for (var i = 0; i < allies.length; i++) {
      total += atkStat(allies[i].type, isAir(defender)) * allies[i].strength;
    }
    return Math.floor(total / (attacker.strength * 2));
  }

  function defenseSupport(game, attacker, defender) {
    var allies = game.adjacentAllies(
      attacker.col, attacker.row, defender.player, defender
    );
    var total = 0;
    for (var i = 0; i < allies.length; i++) {
      total += allies[i].type.def * allies[i].strength;
    }
    return Math.floor(total / (attacker.strength * 2));
  }

  function sideRecord(baseAttack, baseDefense, supportAttack, supportDefense,
                      terrain, surrounded, attackDisabled) {
    var supportedAttack = baseAttack + supportAttack;
    var supportedDefense = baseDefense + supportDefense;
    var terrainDefense = supportedDefense + terrain;
    var steps = [
      { ap: baseAttack, da: baseDefense, label: "BASE" },
      { ap: supportedAttack, da: supportedDefense, label: "SUPPORT" },
      { ap: supportedAttack, da: terrainDefense, label: "TERRAIN" },
    ];
    var attack = supportedAttack, defense = terrainDefense;
    if (surrounded) {
      attack = Math.floor(baseAttack / 2);
      defense = Math.floor(terrainDefense / 2);
      steps.push({ ap: attack, da: defense, label: "SURROUNDED" });
    }
    var finalAttack = attackDisabled ? 0 : capStat(attack);
    var finalDefense = capStat(defense);
    steps.push({ ap: finalAttack, da: finalDefense, label: "FINAL" });
    return {
      steps: steps,
      ap: finalAttack,
      da: finalDefense,
      modifiers: { supportAttack: supportAttack, supportDefense: supportDefense,
        terrain: terrain, surrounded: surrounded, attackDisabled: attackDisabled },
    };
  }

  /* Per-machine modified attack and defense: the numbers every battle uses. */
  function battleStats(game, attacker, defender) {
    var dist = HEX.distance(attacker.col, attacker.row, defender.col, defender.row);
    var ranged = dist > 1;
    var counter = !ranged && canAttackAt(defender.type, isAir(attacker), dist);
    var aSupport = ranged ? 0 : attackSupport(game, attacker, defender);
    var dSupport = ranged ? 0 : defenseSupport(game, attacker, defender);
    var surrounded = !ranged && game.isSurrounded(defender);
    var a = sideRecord(
      atkStat(attacker.type, isAir(defender)), attacker.type.def,
      aSupport, 0, terrainValue(game, attacker), false, false
    );
    var d = sideRecord(
      atkStat(defender.type, isAir(attacker)), defender.type.def,
      0, dSupport, terrainValue(game, defender), surrounded, !counter
    );
    return { attacker: a, defender: d, ranged: ranged, counter: counter, dist: dist, surrounded: surrounded };
  }

  /* Full battle preview: the battle numbers plus what the forecast displays. */
  function preview(game, attacker, defender) {
    var pv = battleStats(game, attacker, defender), ranged = pv.ranged;
    pv.attackerTerrain = game.terrainAt(attacker.col, attacker.row).name;
    pv.defenderTerrain = game.terrainAt(defender.col, defender.row).name;
    pv.tactical = {
      attackerInZOC: game.inEnemyZOC(attacker.col, attacker.row, attacker.player),
      defenderInZOC: game.inEnemyZOC(defender.col, defender.row, defender.player),
      attackSupporters: ranged ? [] : game.adjacentAllies(defender.col, defender.row, attacker.player, attacker).map(function (u) {
        return {name: u.type.name, typeId:u.typeId, player:u.player, exp:u.exp, strength: u.strength,
          value: atkStat(u.type, isAir(defender)), col: u.col, row: u.row};
      }),
      defenseSupporters: ranged ? [] : game.adjacentAllies(attacker.col, attacker.row, defender.player, defender).map(function (u) {
        return {name: u.type.name, typeId:u.typeId, player:u.player, exp:u.exp, strength: u.strength,
          value: u.type.def, col: u.col, row: u.row};
      }),
      ring: ranged ? [] : game.surroundRing(defender),
    };
    return pv;
  }

  function randomCoefficient(rng) {
    var roll = rng();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
      throw new Error("Combat RNG must return a number from 0 up to but not including 1");
    }
    return RANDOM_BUCKETS[Math.floor(roll * RANDOM_BUCKETS.length)];
  }

  function damageResult(shooter, target, modifiedAttack, modifiedDefense,
                        coefficient) {
    var unitDamage = Math.floor(
      modifiedAttack * (STAT_CAP - modifiedDefense) / STAT_CAP
    );
    var experiencedDamage = Math.floor(
      unitDamage * EXP_DAMAGE[shooter.exp] / 100
    );
    var totalDamage = Math.floor(
      experiencedDamage * shooter.strength * coefficient / 100
    );
    var hitPoints = target.strength * 100 + (target.strength > 1 ? 50 : 0);
    var remaining = Math.floor(Math.max(0, hitPoints - totalDamage) / 100);
    return {
      casualties: target.strength - remaining,
      unitDamage: unitDamage,
      totalDamage: totalDamage,
      coefficient: coefficient / 100,
      coefficientPercent: coefficient,
    };
  }

  function expectedCasualties(shooter, target, modifiedAttack, modifiedDefense) {
    var total = 0;
    for (var i = 0; i < RANDOM_WEIGHTS.length; i++) {
      total += damageResult(
        shooter, target, modifiedAttack, modifiedDefense, RANDOM_WEIGHTS[i][0]
      ).casualties * RANDOM_WEIGHTS[i][1];
    }
    return total / RANDOM_BUCKETS.length;
  }

  /* The match's actual roll, read against the published 100-row table.
   * `shooter` and `target` must be the pre-battle squads: experience awards
   * and casualties are applied before a battle result reaches the UI. */
  function shotReport(shooter, target, attack, defense, damage, enabled) {
    if (!enabled) {
      return {enabled: false, losses: 0, expected: 0, exact: 100, tail: 100,
        coefficientPercent: null, weight: 0, rollTail: 100, verdict: "no roll",
        unitDamage: 0, totalDamage: 0, gap: 0};
    }
    if (!damage || !Number.isInteger(damage.coefficientPercent)) {
      throw new Error("Battle roll is missing its table percentage");
    }
    var coeff = damage.coefficientPercent, weight = 0, rollTail = 0, exact = 0, tail = 0, found = false;
    for (var i = 0; i < RANDOM_WEIGHTS.length; i++) {
      var entry = RANDOM_WEIGHTS[i];
      var loss = damageResult(shooter, target, attack, defense, entry[0]).casualties;
      if (entry[0] === coeff) { weight = entry[1]; found = true; }
      if (entry[0] >= coeff) rollTail += entry[1];
      if (loss === damage.casualties) exact += entry[1];
      if (loss >= damage.casualties) tail += entry[1];
    }
    if (!found) throw new Error("Battle roll " + coeff + "% is not in the damage table");
    if (damage.casualties !== damageResult(shooter, target, attack, defense, coeff).casualties) {
      throw new Error("Battle losses do not match the recorded roll");
    }
    var expected = expectedCasualties(shooter, target, attack, defense);
    var gap = damage.casualties - expected;
    return {enabled: true, losses: damage.casualties, expected: expected, exact: exact, tail: tail,
      coefficientPercent: coeff, weight: weight, rollTail: rollTail,
      verdict: Math.abs(gap) < 0.5 ? "near the average" : gap > 0 ? "above the average" : "below the average",
      unitDamage: damage.unitDamage, totalDamage: damage.totalDamage, gap: gap};
  }

  /* Exact public chance model for planners. No match RNG access, sampling or
   * duplicated combat arithmetic. Merge roll buckets with identical losses. */
  // One shooter's loss distribution depends only on these five numbers.
  // Callers read the arrays and never change them.
  var marginals = new Map(), NO_SHOT = [{loss: 0, probability: 1}];
  function marginal(shooter, target, ap, da, enabled) {
    if (!enabled) return NO_SHOT;
    if (!(shooter.exp >= 0 && shooter.exp <= MAX_EXP && shooter.strength >= 0 && shooter.strength <= MAX_STRENGTH &&
        target.strength >= 0 && target.strength <= MAX_STRENGTH && ap >= 0 && ap <= STAT_CAP && da >= 0 && da <= STAT_CAP)) {
      throw new Error("Battle values out of range: exp " + shooter.exp + ", strengths " + shooter.strength + "/" +
        target.strength + ", attack " + ap + ", defense " + da);
    }
    var key = (((shooter.exp * 9 + shooter.strength) * 9 + target.strength) * 101 + ap) * 101 + da;
    var cached = marginals.get(key);
    if (cached) return cached;
    var losses = {};
    RANDOM_WEIGHTS.forEach(function (entry) {
      var loss = damageResult(shooter, target, ap, da, entry[0]).casualties;
      losses[loss] = (losses[loss] || 0) + entry[1] / 100;
    });
    cached = Object.keys(losses).map(function (loss) { return {loss: +loss, probability: losses[loss]}; });
    if (marginals.size >= 65536) marginals.clear();
    marginals.set(key, cached);
    return cached;
  }
  function distribution(game, attacker, defender) {
    var pv = battleStats(game, attacker, defender);
    var outgoing = marginal(attacker, defender, pv.attacker.ap, pv.defender.da, true);
    var incoming = marginal(defender, attacker, pv.defender.ap, pv.attacker.da, pv.counter);
    var outcomes = [], out = 0, in_ = 0, kill = 0, death = 0;
    outgoing.forEach(function (a) {
      out += a.loss * a.probability;
      if (a.loss === defender.strength) kill += a.probability;
      incoming.forEach(function (d) {
        outcomes.push({defenderLoss: a.loss, attackerLoss: d.loss, probability: a.probability * d.probability});
      });
    });
    incoming.forEach(function (d) {
      in_ += d.loss * d.probability;
      if (d.loss === attacker.strength) death += d.probability;
    });
    return {out: out, in_: in_, kill: kill, death: death, outcomes: outcomes, preview: pv};
  }

  // The seeds and coefficient weights do not depend on either squad. Count
  // each sampled pair once, then map the 14 x 14 counts onto battle losses.
  // This preserves every simulated outcome, including finite-sample noise;
  // it is not an analytic probability approximation. Keep at most two tables.
  var defaultRollCounts = null, otherRollCounts = null;
  function forecastRollCounts(samples) {
    var cached = samples === 100000 ? defaultRollCounts : otherRollCounts;
    if (cached && cached.samples === samples) return cached.counts;
    var size = RANDOM_WEIGHTS.length, counts = new Uint32Array(size * size);
    for (var i = 0; i < samples; i++) {
      var rng = makeRng(Math.imul(i + 1, 0x9e3779b9) ^ 0xa341316c);
      var attack = RANDOM_INDICES[Math.floor(rng() * RANDOM_BUCKETS.length)];
      var counter = RANDOM_INDICES[Math.floor(rng() * RANDOM_BUCKETS.length)];
      counts[attack * size + counter]++;
    }
    cached = { samples: samples, counts: counts };
    if (samples === 100000) defaultRollCounts = cached;
    else otherRollCounts = cached;
    return counts;
  }

  /* A joint casualty forecast, deliberately accepting no game or match RNG.
   * Each trial has its own fixed simulation seed, independent of actual play.
   * Precomputed damage uses the same formula and pre-battle strengths as resolve. */
  function forecast(attacker, defender, pv, samples) {
    samples = samples === undefined ? 100000 : samples;
    if (!Number.isInteger(samples) || samples < 1 || samples > 1000000) {
      throw new Error("Forecast sample count must be between 1 and 1000000");
    }
    var attackLosses = [], counterLosses = [], bins = [];
    for (var a = 0; a <= attacker.strength; a++) bins.push(new Array(defender.strength + 1).fill(0));
    for (var bucket = 0; bucket < RANDOM_WEIGHTS.length; bucket++) {
      var c = RANDOM_WEIGHTS[bucket][0];
      attackLosses.push(damageResult(attacker, defender, pv.attacker.ap, pv.defender.da, c).casualties);
      counterLosses.push(pv.counter ? damageResult(defender, attacker, pv.defender.ap, pv.attacker.da, c).casualties : 0);
    }
    var totalA = 0, totalD = 0, lostA = 0, lostD = 0, mutual = 0;
    var coefficients = RANDOM_WEIGHTS.length, counts = forecastRollCounts(samples);
    for (var i = 0; i < coefficients; i++) {
      for (var j = 0; j < coefficients; j++) {
        var count = counts[i * coefficients + j];
        var dLoss = attackLosses[i], aLoss = counterLosses[j];
        bins[aLoss][dLoss] += count;
        totalA += aLoss * count; totalD += dLoss * count;
        if (aLoss === attacker.strength) lostA += count;
        if (dLoss === defender.strength) lostD += count;
        if (aLoss === attacker.strength && dLoss === defender.strength) mutual += count;
      }
    }
    return { samples: samples, bins: bins,
      meanAttackerLoss: totalA / samples, meanDefenderLoss: totalD / samples,
      attackerDestroyed: lostA / samples, defenderDestroyed: lostD / samples,
      mutualDestruction: mutual / samples };
  }

  /* Resolve a battle. Mutates unit strengths/experience; removal of dead
   * units is the engine's job. Returns a result record for UI/log. */
  function resolve(game, attacker, defender, rng) {
    var pv = preview(game, attacker, defender);
    var aStr0 = attacker.strength, dStr0 = defender.strength;
    var aExp0 = attacker.exp, dExp0 = defender.exp;

    // Both damage totals use pre-battle strengths.
    var attackDamage = damageResult(
      attacker, defender, pv.attacker.ap, pv.defender.da, randomCoefficient(rng)
    );
    var counterDamage = pv.counter ? damageResult(
      defender, attacker, pv.defender.ap, pv.attacker.da, randomCoefficient(rng)
    ) : { casualties: 0, unitDamage: 0, totalDamage: 0, coefficient: null, coefficientPercent: null };
    var dmgToDefender = attackDamage.casualties;
    var dmgToAttacker = counterDamage.casualties;

    defender.strength = dStr0 - dmgToDefender;
    attacker.strength = aStr0 - dmgToAttacker;

    // Published experience awards. Attacking: +0 for no damage, +1 for
    // damage, +2 for a kill. Defending: +2 when unhurt, +1 when hurt.
    if (defender.strength === 0) {
      attacker.exp = Math.min(MAX_EXP, attacker.exp + 2);
    } else if (dmgToDefender > 0) {
      attacker.exp = Math.min(MAX_EXP, attacker.exp + 1);
      defender.exp = Math.min(MAX_EXP, defender.exp + 1);
    } else {
      defender.exp = Math.min(MAX_EXP, defender.exp + 2);
    }

    return {
      preview: pv,
      dmgToDefender: dmgToDefender,
      dmgToAttacker: dmgToAttacker,
      attackDamage: attackDamage,
      counterDamage: counterDamage,
      attackerDead: attacker.strength === 0,
      defenderDead: defender.strength === 0,
      attackerExpBefore: aExp0,
      defenderExpBefore: dExp0,
    };
  }

  return {
    preview: preview, resolve: resolve, makeRng: makeRng,
    sha256: sha256, chachaBlock: chachaBlock, diceSeed: diceSeed, makeDice: makeDice, restoreDice: restoreDice,
    atkStat: atkStat, isAir: isAir,
    rangeBand: rangeBand, canAttackAt: canAttackAt,
    experienceBonus: experienceBonus, expectedCasualties: expectedCasualties, shotReport: shotReport, distribution: distribution,
    marginal: marginal,
    forecast: forecast,
    MAX_EXP: MAX_EXP, MAX_STRENGTH: MAX_STRENGTH,
    EXP_DAMAGE: EXP_DAMAGE, RANDOM_WEIGHTS: RANDOM_WEIGHTS,
    /* Full strength is the default squad size; UI must not print it. */
    strengthCaption: function (n) { return n < MAX_STRENGTH ? String(n) : null; },
  };
})();

if (typeof module !== "undefined") {
  if (typeof HEX === "undefined") global.HEX = require("./hex.js");
  module.exports = COMBAT;
}
