/* One matchup's numbers, shown in two places from one model.
 *   Hover (over the map): every step at once (base, support, terrain, surround,
 *          final, experience) and each side's projected losses, in the colour
 *          of its faction.
 *   Battle screen (inside the popup): two face-off rows, Union's attack
 *          against Xenon's defense and Xenon's attack against Union's, each
 *          total counted up in the true order of the calculation from a short
 *          equation of its parts. Under each side, a minimap of the hexes
 *          that fed its numbers and the chart of its own possible losses. The
 *          popup's pause and skip controls therefore work on the count.
 *
 * Attack is shown as a unit total: machines x per-machine attack, the sum the
 * original displays. Defense stays per machine, because the engine caps it at
 * 100 and uses it as the share of each hit it stops, and the number of machines
 * never multiplies it (combat.js). Every total is the engine's own per-machine
 * number times a machine count, and the final row equals the values the battle
 * uses.
 *
 * Experience is the last row, after the 100 cap, because the engine applies it
 * to the damage a machine deals, after defense: it shows that multiplier and
 * the attack it amounts to, floor(final attack x multiplier), so it can pass
 * 100. It never changes defense. Exact damage floors once more after defense,
 * so this attack figure can differ from the battle's by rounding.
 *
 * Support adds floor(sum of supporter value x strength / (2 x attacker
 * strength)) per machine, for attack and defense alike. Each supporter's own
 * share is the change in that floor, so the shares always add up to the
 * engine's support number. */
"use strict";
var COMBAT_PANEL = (function () {
  var unitView = typeof module !== "undefined" ? require("./unit-view.js") : UNIT_VIEW;
  var combat = typeof module !== "undefined" ? require("./combat.js") : COMBAT;
  var hex = typeof module !== "undefined" ? require("./hex.js") : HEX;
  var terrains = typeof module !== "undefined" ? require("./data-terrain.js").TERRAIN : TERRAIN;

  var TICK_MS = 30, SUPPORT_MS = 170, TERRAIN_MS = 260, RING_MS = 90, FINAL_MS = 150, EXPERIENCE_MS = 220, HOLD_MS = 500;
  var ROW_LABEL = {base: "Base", support: "+ Support", terrain: "+ Terrain", surround: "Surrounded ½", final: "Final", experience: "Experience"};

  function faction(player) { return player ? "Xenon" : "Union"; }

  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function percent(value) {
    return value > 0 && value < 0.01 ? "<1" : String(Math.round(value * 100));
  }
  function step(calc, label) {
    return calc.steps.filter(function (s) { return s.label === label; })[0] || null;
  }

  /* Numbers and timing for one matchup. `attacker` and `defender` carry their
   * pre-battle strength; `pv` is COMBAT.preview's record. */
  function build(attacker, defender, pv) {
    var attackerStrength = attacker.strength;
    var supporters = [], cumulative = {attack: 0, defense: 0}, applied = {attack: 0, defense: 0};
    function add(list, side) {
      list.filter(function (u) { return u.value > 0; }).forEach(function (u) {
        cumulative[side] += u.value * u.strength;
        var perMachine = Math.floor(cumulative[side] / (2 * attackerStrength));
        var gain = perMachine - applied[side];
        applied[side] = perMachine;
        supporters.push({col: u.col, row: u.row, side: side, player: u.player, gain: gain,
          typeId: u.typeId, name: u.name, strength: u.strength,
          label: "+" + (side === "attack" ? gain * attackerStrength + " ATK" : gain + " DEF")});
      });
    }
    add(pv.tactical.attackSupporters, "attack");
    add(pv.tactical.defenseSupporters, "defense");
    if (applied.attack !== pv.attacker.modifiers.supportAttack || applied.defense !== pv.defender.modifiers.supportDefense) {
      throw new Error("Supporter shares do not add up to the battle's support numbers");
    }
    var ringCount = pv.tactical.ring.filter(function (hex) { return hex.onMap; }).length;
    var baseEnd = TICK_MS * Math.max(attacker.strength, defender.strength) + 40;
    var supportEnd = baseEnd + supporters.length * SUPPORT_MS;
    var terrainEnd = supportEnd + TERRAIN_MS;
    var ringEnd = terrainEnd + ringCount * RING_MS;
    var finalAt = ringEnd + (pv.surrounded ? FINAL_MS : 0);
    var boosted = attacker.exp > 0 || defender.exp > 0;
    function side(unit, calc, role, canFire) {
      var multiplier = combat.EXP_DAMAGE[unit.exp], last = step(calc, "FINAL");
      var s = {unit: unit, role: role, machines: unit.strength, canFire: canFire,
        base: step(calc, "BASE"), support: step(calc, "SUPPORT"), terrain: step(calc, "TERRAIN"),
        surround: step(calc, "SURROUNDED"), final: last, multiplier: multiplier,
        experience: {ap: Math.floor(last.ap * multiplier / 100), da: last.da}};
      s.keys = ["base"].concat(supporters.length ? ["support"] : [], ["terrain"], s.surround ? ["surround"] : [], ["final"],
        multiplier > 100 ? ["experience"] : []);
      return s;
    }
    return {
      attacker: attacker, defender: defender, pv: pv, supporters: supporters, ringCount: ringCount,
      sides: [side(attacker, pv.attacker, "attacking", true), side(defender, pv.defender, "defending", pv.counter)],
      time: {baseEnd: baseEnd, supportEnd: supportEnd, terrainEnd: terrainEnd, ringEnd: ringEnd,
        finalAt: finalAt, experienceEnd: finalAt + (boosted ? EXPERIENCE_MS : 0),
        duration: finalAt + (boosted ? EXPERIENCE_MS : 0) + HOLD_MS},
    };
  }

  /* What is on screen `elapsed` ms into the count; Infinity is the finished
   * calculation. A row not reached yet is absent, and the row being counted
   * carries live: true. Attack values are squad totals, defense per machine. */
  function state(m, elapsed) {
    var t = m.time, gains = {attack: 0, defense: 0};
    var out = {sides: [], supportersShown: 0, ringShown: 0, surroundShown: elapsed >= t.ringEnd, done: elapsed >= t.finalAt};
    m.supporters.forEach(function (sup, i) {
      if (elapsed >= t.baseEnd + i * SUPPORT_MS) { out.supportersShown = i + 1; gains[sup.side] += sup.gain; }
    });
    if (elapsed >= t.terrainEnd) out.ringShown = Math.min(m.ringCount, Math.floor((elapsed - t.terrainEnd) / RING_MS) + 1);
    var reachedAt = {base: 0, support: t.baseEnd, terrain: t.supportEnd, surround: t.ringEnd, final: t.finalAt, experience: t.finalAt};
    m.sides.forEach(function (side, index) {
      var attacking = index === 0, rows = {}, lit = side.machines;
      side.keys.forEach(function (key) {
        if (elapsed < reachedAt[key]) return;
        var s = side[key], row = {atk: side.canFire ? s.ap * side.machines : null, def: s.da, live: false};
        if (key === "base" && elapsed < t.baseEnd) {
          lit = Math.min(side.machines, Math.floor(elapsed / TICK_MS) + 1);
          row.atk = side.canFire ? side.base.ap * lit : null;
          row.def = Math.round(s.da * elapsed / t.baseEnd);
          row.live = true;
        } else if (key === "support" && elapsed < t.supportEnd) {
          if (side.canFire) row.atk = (side.base.ap + (attacking ? gains.attack : 0)) * side.machines;
          row.def = side.base.da + (attacking ? 0 : gains.defense);
          row.live = true;
        } else if (key === "terrain" && elapsed < t.terrainEnd) {
          var from = side.support.da;
          row.def = from + Math.floor((s.da - from) * (elapsed - t.supportEnd) / TERRAIN_MS);
          row.live = true;
        } else if (key === "experience" && elapsed < t.experienceEnd) {
          var fin = side.final, progress = (elapsed - t.finalAt) / EXPERIENCE_MS;
          row.atk = side.canFire ? (fin.ap + Math.floor((s.ap - fin.ap) * progress)) * side.machines : null;
          row.live = true;
        }
        rows[key] = row;
      });
      out.sides.push({rows: rows, lit: lit});
    });
    return out;
  }

  /* The map overlay: supporters and ring hexes, with their numbers. */
  function effects(defender, m) {
    return {target: {col: defender.col, row: defender.row}, ring: m.pv.tactical.ring, surrounded: m.pv.surrounded,
      attackerPlayer: m.attacker.player, supporters: m.supporters,
      shownSupporters: Infinity, shownRing: Infinity, surroundShown: true};
  }

  function cell(value, note) {
    if (value === null) return "<td class='cp-none'><strong>—</strong></td>";
    return "<td>" + (note ? "<small>" + note + "</small>" : "") + "<strong>" + value + "</strong></td>";
  }
  function delta(value, prior) {
    var change = value - prior;
    return change === 0 ? "" : (change > 0 ? "+" : "−") + Math.abs(change);
  }
  function rowLabel(side, key) {
    return key === "experience" ? "Experience ×" + (side.multiplier / 100).toFixed(2) : ROW_LABEL[key];
  }
  function stepsHtml(side, sideState) {
    var previous = null, html = "";
    side.keys.forEach(function (key) {
      var row = sideState.rows[key];
      if (!row) {
        html += "<tr class='cp-row cp-row-hidden'><th>" + rowLabel(side, key) + "</th><td></td><td></td></tr>";
        return;
      }
      var atkNote = "", defNote = "";
      if (key === "base") atkNote = side.canFire ? side.machines + "×" + side.base.ap : "";
      else if (key === "surround") { atkNote = "½"; defNote = "½"; }
      else if (previous) {
        atkNote = row.atk === null ? "" : delta(row.atk, previous.atk);
        defNote = delta(row.def, previous.def);
      }
      html += "<tr class='cp-row cp-row-" + key + (row.live ? " cp-row-live" : "") + "'><th>" + rowLabel(side, key) + "</th>" +
        cell(row.atk, atkNote) + cell(row.def, defNote) + "</tr>";
      previous = row;
    });
    return "<table class='cp-steps'><thead><tr><th>Step</th><th>Attack</th><th>Defense</th></tr></thead><tbody>" +
      html + "</tbody></table>";
  }

  function headHtml(side, lit) {
    var pips = "";
    for (var i = 0; i < side.machines; i++) pips += "<i" + (i < lit ? " class='cp-lit'" : "") + "></i>";
    return "<header class='cp-head'>" + unitView.html(side.unit) +
      "<span class='cp-role'>" + side.role + "</span>" +
      "<span class='cp-count'><strong>" + side.machines + "</strong> machine" + (side.machines === 1 ? "" : "s") + "</span>" +
      "<span class='cp-pips' role='img' aria-label='" + side.machines + " machines'>" + pips + "</span></header>";
  }

  // One squad's chance of losing 0..N machines, from the joint bins.
  function marginal(bins, samples, rowsAreOwn, machines) {
    var totals = new Array(machines + 1).fill(0);
    bins.forEach(function (row, a) {
      row.forEach(function (count, d) { totals[rowsAreOwn ? a : d] += count; });
    });
    return totals.map(function (count) { return count / samples; });
  }

  function lossesHtml(distribution, mean, wiped) {
    var max = Math.max.apply(null, distribution), likely = distribution.indexOf(max);
    var bars = distribution.map(function (p, lost) {
      return "<div class='cp-bar" + (lost === likely ? " cp-likely" : "") + "' role='img' aria-label='" + lost +
        " lost: " + percent(p) + " percent'><span class='cp-pct'>" + (p >= 0.005 ? percent(p) : "") + "</span>" +
        "<span class='cp-col'><i style='height:" + (p > 0 ? Math.max(3, p / max * 100) : 0).toFixed(1) + "%'></i></span>" +
        "<span class='cp-lost'>" + lost + "</span></div>";
    }).join("");
    return "<div class='cp-losses'><div class='cp-chart'>" + bars + "</div>" +
      "<div class='cp-summary'><span><strong>" + mean.toFixed(1) + "</strong> average</span>" +
      "<span><strong>" + percent(wiped) + "%</strong> all lost</span></div></div>";
  }

  function factsHtml(m, title) {
    var pv = m.pv, tactical = pv.tactical, facts = [pv.dist + " hex" + (pv.dist === 1 ? "" : "es")];
    if (pv.ranged) facts.push("indirect fire: no support, surround or counterattack");
    else {
      facts.push(pv.counter ? "counterattack" : "no counterattack");
      var edge = tactical.ring.some(function (hex) { return !hex.onMap; });
      var covered = tactical.ring.filter(function (hex) { return hex.controlled; }).length;
      facts.push(pv.surrounded ? "target surrounded: attack and defense halved" :
        "ZOC " + covered + " of 6" + (edge ? ", map edge blocks surround" : ""));
    }
    return "<div class='cp-title'><strong>" + title + "</strong> " + esc(facts.join(" · ")) + "</div>";
  }

  function boardHtml(m, st, title, projection) {
    var cards = m.sides.map(function (side, index) { return {side: side, state: st.sides[index], attacking: index === 0}; })
      .sort(function (a, b) { return a.side.unit.player - b.side.unit.player; });
    var body = cards.map(function (card) {
      var side = card.side, losses = "";
      if (projection && (!card.attacking || m.pv.counter)) {
        losses = lossesHtml(marginal(projection.bins, projection.samples, card.attacking, side.machines),
          card.attacking ? projection.meanAttackerLoss : projection.meanDefenderLoss,
          card.attacking ? projection.attackerDestroyed : projection.defenderDestroyed);
      }
      return "<section class='cp-side cp-side-" + side.unit.player + "' aria-label='" +
        faction(side.unit.player) + " " + side.role + "'>" + headHtml(side, card.state.lit) +
        "<div class='cp-body'>" + stepsHtml(side, card.state) + losses + "</div></section>";
    }).join("");
    return factsHtml(m, title) + "<div class='cp-sides'>" + body + "</div>" +
      (projection ? "<p class='cp-note'>" + projection.samples.toLocaleString("en-US") +
        " simulated battles. The two units' rolls are independent.</p>" : "");
  }

  /* Hover: the whole calculation plus each side's projected losses. */
  function previewHtml(m, projection) {
    return boardHtml(m, state(m, Infinity), "ATTACK PREVIEW", projection);
  }

  /* ---- The battle screen's numbers ----------------------------------------
   * `elapsed` ms into the count (Infinity is the finished calculation);
   * `report` is BATTLE_REPORT.assess's {attack, counter}, given once the match
   * has rolled; `area` is BATTLE_REPORT.battleArea's hexes for the minimaps. */

  // One total and the terms that build it, as far as the count has got. Attack
  // is the unit total, defense per machine; a side that cannot fire has no
  // attack. The term being counted is live. A lone term equal to its total is
  // dropped, so an unmodified defense reads "20", not "20 = 20".
  function statParts(m, st, index, stat) {
    var side = m.sides[index], rows = st.sides[index].rows, attacking = index === 0, terms = [], total;
    function term(key, value, label, live) {
      terms.push({key: key, value: value, label: label || "", live: live === undefined ? !!(rows[key] && rows[key].live) : live});
    }
    if (stat === "atk") {
      if (!side.canFire) return {terms: [], total: null, live: false};
      term("base", st.sides[index].lit + "×" + side.base.ap);
      total = rows.base.atk;
      if (rows.support) {
        var support = rows.support.atk - side.base.ap * side.machines;
        if (support > 0) term("support", "+" + support, "support");
        total = rows.support.atk;
      }
      if (rows.surround) { term("surround", "½", "surrounded"); total = rows.surround.atk; }
      if (rows.final) {
        if (side.final.ap < (side.surround || side.support).ap) term("final", "cap");
        total = rows.final.atk;
      }
      if (rows.experience) { term("experience", "×" + (side.multiplier / 100).toFixed(2), "exp"); total = rows.experience.atk; }
    } else {
      term("base", String(side.base.da), "", false);
      total = side.base.da;
      if (rows.support) {
        var guard = rows.support.def - side.base.da;
        if (guard > 0) term("support", "+" + guard, "support");
        total = rows.support.def;
      }
      if (rows.terrain) {
        var ground = side.terrain.da - side.support.da;
        if (ground > 0) term("terrain", "+" + ground, attacking ? m.pv.attackerTerrain : m.pv.defenderTerrain);
        total = rows.terrain.def;
      }
      if (rows.surround) { term("surround", "½", "surrounded"); total = rows.surround.def; }
      if (rows.final) {
        if (side.final.da < (side.surround || side.terrain).da) term("final", "cap");
        total = rows.final.def;
      }
    }
    var live = terms.some(function (t) { return t.live; });
    if (terms.length === 1 && terms[0].value === String(total)) terms = [];
    return {terms: terms, total: total, live: live};
  }

  function termHtml(t) {
    return "<span class='bn-term bn-term-" + t.key + (t.live ? " bn-live" : "") + "'><b>" + t.value + "</b>" +
      (t.label ? "<small>" + esc(t.label) + "</small>" : "") + "</span>";
  }
  // Left of the arrows the equation ends in "=" beside its total; right of
  // them it starts with "=", so both read left to right.
  function eqHtml(parts, pos, player) {
    var terms = parts.terms.map(termHtml).join(""), equals = parts.terms.length ? "<span class='bn-equals'>=</span>" : "";
    return "<span class='bn-eq bn-eq-" + pos + "' data-player='" + player + "'>" + (pos === "left" ? terms + equals : equals + terms) + "</span>";
  }
  function totalHtml(parts, stat, pos, player) {
    var number = "<b>" + (parts.total === null ? "—" : parts.total) + "</b>", label = "<i>" + stat.toUpperCase() + "</i>";
    return "<span class='bn-total bn-total-" + pos + (parts.live ? " bn-live" : "") + "' data-player='" + player +
      "' data-stat='" + stat + "'>" + (pos === "left" ? number + label : label + number) + "</span>";
  }
  // A roll is a table percentage; 130 reads "×1.3".
  function arrowHtml(shooter, dir, shot) {
    if (!shooter.canFire) return "<span class='bn-arrow bn-arrow-none'></span>";
    return "<span class='bn-arrow bn-arrow-" + dir + "' data-player='" + shooter.unit.player + "'>" +
      (shot ? "<em class='bn-roll'>roll ×" + shot.coefficientPercent / 100 + "</em>" : "") + "</span>";
  }
  // Row one is Union's shot, row two Xenon's, whoever attacked: Union's attack
  // and defense stay on the left, each facing the Xenon number it meets.
  function faceoffHtml(m, st, report, union, xenon, ready) {
    var cells = "";
    [[union, "atk", "def", "ltr"], [xenon, "def", "atk", "rtl"]].forEach(function (row) {
      var shooter = row[0], left = statParts(m, st, union, row[1]), right = statParts(m, st, xenon, row[2]);
      var shot = report ? report[shooter === 0 ? "attack" : "counter"] : null;
      cells += eqHtml(left, "left", 0) + totalHtml(left, row[1], "left", 0) +
        arrowHtml(m.sides[shooter], row[3], shot) +
        totalHtml(right, row[2], "right", 1) + eqHtml(right, "right", 1);
    });
    return "<div class='bn-faceoff" + (ready ? " bn-ready" : "") + "'>" + cells + "</div>";
  }

  // The minimap, in hex radii. An adjacent pair is drawn points up and turned
  // (never mirrored) so the Union unit sits left of the Xenon unit on one row,
  // as on the battle screen, with the eight hexes touching either one around
  // them. Indirect fire shows only the two units' hexes.
  var SQ3 = Math.sqrt(3);
  var MAP = {x: -1.5 * SQ3 - 0.1, y: -2.6, w: 4 * SQ3 + 0.2, h: 5.2};
  function hexKey(place) { return place.col + "," + place.row; }
  function cubeFrom(origin, col, row) {
    var c = hex.toCube(col, row);
    return {x: c.x - origin.x, y: c.y - origin.y, z: c.z - origin.z};
  }
  function turnClockwise(c) { return {x: -c.z, y: -c.x, z: -c.y}; }
  function mapLayout(m, area) {
    var union = m.attacker.player === 0 ? m.attacker : m.defender, xenon = union === m.attacker ? m.defender : m.attacker;
    var at = {};
    if (m.pv.ranged) {
      at[hexKey(union)] = {x: -SQ3, y: 0};
      at[hexKey(xenon)] = {x: 2 * SQ3, y: 0};
      return at;
    }
    var origin = hex.toCube(union.col, union.row), toward = cubeFrom(origin, xenon.col, xenon.row), turns = 0;
    while (toward.x !== 1 || toward.z !== 0) {
      if (turns === 5) throw new Error("The battle minimap needs two adjacent units");
      toward = turnClockwise(toward);
      turns++;
    }
    area.forEach(function (h) {
      var c = cubeFrom(origin, h.col, h.row);
      for (var i = 0; i < turns; i++) c = turnClockwise(c);
      at[hexKey(h)] = {x: SQ3 * (c.x + c.z / 2), y: 1.5 * c.z};
    });
    return at;
  }
  function placeAt(p) {
    return "left:" + ((p.x - MAP.x) / MAP.w * 100).toFixed(2) + "%;top:" + ((p.y - MAP.y) / MAP.h * 100).toFixed(2) + "%";
  }
  function hexPoints(p, radius) {
    var points = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 3 * i - Math.PI / 2;
      points.push((p.x + radius * Math.cos(a)).toFixed(3) + "," + (p.y + radius * Math.sin(a)).toFixed(3));
    }
    return points.join(" ");
  }
  // Clockwise from straight up, around `center`.
  function bearing(p, center) {
    return (Math.atan2(p.x - center.x, center.y - p.y) + 2 * Math.PI) % (2 * Math.PI);
  }

  // One side's minimap: both units, the side's supporters with their shares,
  // its terrain bonus, and for the attacker the ring of hexes around the
  // target, lit in the count's clockwise sweep. Everything counted appears
  // with its step, as in the numbers above.
  function minimapHtml(m, st, index, layout, area) {
    var side = m.sides[index], rows = st.sides[index].rows, attacking = index === 0, kind = attacking ? "attack" : "defense";
    var own = layout[hexKey(side.unit)], target = layout[hexKey(m.defender)];
    var ground = "", marks = "", units = "", tags = "";
    function place(where, what) {
      if (!where) throw new Error("A hex in the battle minimap has no place in its layout");
      return " style='" + placeAt(where) + "'>" + what;
    }
    function tag(where, value, unit, high) {
      tags += "<span class='bn-tag" + (high ? " bn-tag-high" : "") + "'" + place(where, "<b>" + value + "</b>" +
        (unit ? "<small>" + unit + "</small>" : "")) + "</span>";
    }
    function unitAt(where, unit) {
      units += "<span class='bn-map-unit'" + place(where, unitView.iconHtml({typeId: unit.typeId, player: unit.player, strength: unit.strength})) + "</span>";
    }
    area.forEach(function (h) {
      if (h.terrain) ground += "<polygon points='" + hexPoints(layout[hexKey(h)], 0.95) + "' fill='" + terrains[h.terrain].color + "'/>";
    });
    if (m.pv.ranged) {
      marks += "<line class='bn-range' x1='" + (-SQ3 / 2 + 0.2).toFixed(3) + "' y1='0' x2='" + (1.5 * SQ3 - 0.2).toFixed(3) + "' y2='0'/>";
      tags += "<span class='bn-range-label'" + place({x: SQ3 / 2, y: -0.45}, m.pv.dist + " hexes") + "</span>";
    } else if (attacking) {
      m.pv.tactical.ring.filter(function (h) { return h.onMap; })
        .map(function (h) { return {controlled: h.controlled, at: layout[hexKey(h)]}; })
        .sort(function (a, b) { return bearing(a.at, target) - bearing(b.at, target); })
        .forEach(function (h, i) {
          if (h.controlled && i < st.ringShown) marks += "<polygon class='bn-ring-lit' points='" + hexPoints(h.at, 0.86) + "'/>";
          else if (!h.controlled && st.surroundShown) marks += "<polygon class='bn-ring-open' points='" + hexPoints(h.at, 0.86) + "'/>";
        });
    }
    if (!m.pv.ranged && m.pv.surrounded && st.surroundShown) tag(target, "½", "", true);
    m.supporters.forEach(function (sup, i) {
      if (sup.side !== kind) return;
      var at = layout[hexKey(sup)];
      unitAt(at, sup);
      if (i >= st.supportersShown) return;
      marks += "<polygon class='bn-support' points='" + hexPoints(at, 0.86) + "'/>";
      var share = sup.label.split(" ");
      tag(at, share[0], share[1]);
    });
    marks += "<polygon class='bn-own' points='" + hexPoints(own, 0.9) + "'/>";
    unitAt(layout[hexKey(m.attacker)], m.attacker);
    unitAt(target, m.defender);
    var bonus = side.terrain.da - side.support.da;
    if (rows.terrain && bonus > 0) tag(own, "+" + bonus, "DEF");
    return "<div class='bn-map' role='img' aria-label='" + faction(side.unit.player) + ": where support and terrain come from'>" +
      "<svg viewBox='" + [MAP.x, MAP.y, MAP.w, MAP.h].map(function (v) { return v.toFixed(3); }).join(" ") +
      "' aria-hidden='true'>" + ground + marks + "</svg>" + units + tags + "</div>";
  }

  // One unit's chance of losing 0..N machines to one shot, exactly, from the
  // published 100-row roll table (never the match's dice).
  function lossDistribution(shooter, target) {
    var shots = combat.marginal({exp: shooter.unit.exp, strength: shooter.machines}, {strength: target.machines},
      shooter.final.ap, target.final.da, shooter.canFire);
    var chances = new Array(target.machines + 1).fill(0);
    shots.forEach(function (shot) { chances[shot.loss] += shot.probability; });
    return chances;
  }

  // A side's own losses: every possible count with its chance, the average
  // marked under the axis, and once rolled the actual count in yellow with
  // whether this side was lucky. Nothing is drawn when nothing shoots at it.
  // Every state keeps the same boxes, so the panel never changes size.
  function lossChartHtml(side, shooter, actual, shown) {
    if (!shooter.canFire) return "<div class='bn-chart bn-chart-none'></div>";
    var chances = lossDistribution(shooter, side), max = Math.max.apply(null, chances), likely = chances.indexOf(max), mean = 0;
    chances.forEach(function (p, lost) { mean += p * lost; });
    // Bars share the width with 2% gaps; the marker sits where `mean` falls between them.
    var width = (100 - 2 * (chances.length - 1)) / chances.length;
    var bars = chances.map(function (p, lost) {
      return "<div class='cp-bar" + (lost === likely ? " cp-likely" : "") + (lost === actual ? " cp-actual" : "") +
        "' role='img' aria-label='" + lost + " lost: " + percent(p) + " percent" + (lost === actual ? ", the result" : "") + "'>" +
        "<span class='cp-pct'>" + (p >= 0.005 ? percent(p) : "") + "</span>" +
        "<span class='cp-col'><i style='height:" + (p > 0 ? Math.max(3, p / max * 100) : 0).toFixed(1) + "%'></i></span>" +
        "<span class='cp-lost'>" + lost + "</span></div>";
    }).join("");
    var foot = "<span>avg <b>" + mean.toFixed(1) + "</b></span>";
    if (actual !== undefined) {
      var gap = actual - mean;
      foot += "<span class='bn-luck'>" + (Math.abs(gap) < 0.5 ? "as expected" : gap < 0 ? "lucky" : "unlucky") + "</span>";
    }
    return "<div class='bn-chart" + (shown ? "" : " bn-hidden") + "' aria-label='" + faction(side.unit.player) +
      ": chance of losing 0 to " + side.machines + " machines'><div class='cp-chart'>" + bars + "</div>" +
      "<div class='bn-mean-strip'><i class='bn-mean' style='left:" + (mean * (width + 2) + width / 2).toFixed(1) + "%'></i></div>" +
      "<p class='bn-foot'>" + foot + "</p></div>";
  }

  function numbersHtml(m, elapsed, report, area) {
    if (!Array.isArray(area)) throw new Error("The battle screen's numbers need the battle's hexes (BATTLE_REPORT.battleArea)");
    var st = state(m, elapsed), ready = elapsed >= m.time.experienceEnd, layout = mapLayout(m, area);
    var union = m.sides[0].unit.player === 0 ? 0 : 1, xenon = 1 - union;
    return "<div class='battle-numbers'>" + faceoffHtml(m, st, report, union, xenon, ready) +
      "<div class='bn-detail'>" + [union, xenon].map(function (index) {
        // The attacker's losses come from the counter, the defender's from the attack.
        var actual = report ? report[index === 0 ? "counter" : "attack"].losses : undefined;
        return "<section class='bn-half' data-player='" + m.sides[index].unit.player + "'>" + minimapHtml(m, st, index, layout, area) +
          lossChartHtml(m.sides[index], m.sides[1 - index], actual, ready) + "</section>";
      }).join("") + "</div></div>";
  }

  return {build: build, state: state, effects: effects, previewHtml: previewHtml, numbersHtml: numbersHtml,
    TICK_MS: TICK_MS, SUPPORT_MS: SUPPORT_MS, TERRAIN_MS: TERRAIN_MS, RING_MS: RING_MS, HOLD_MS: HOLD_MS};
})();
if (typeof module !== "undefined") module.exports = COMBAT_PANEL;
