/* One matchup's numbers, shown in two places from one model.
 *   Hover (over the map): every step at once (base, support, terrain, surround,
 *          final, experience) and each side's projected losses, in the colour
 *          of its faction.
 *   Battle screen (inside the popup): the same steps counted up in the true
 *          order of the calculation, under the two formations, then each
 *          side's damage per machine and the roll. The popup's pause and skip
 *          controls therefore work on the count.
 *
 * Attack is shown as a squad total: machines x per-machine attack, the sum the
 * original displays. Defense stays per machine, because the engine caps it at
 * 100 as a percentage and squad size never multiplies it (combat.js). Every
 * total is the engine's own per-machine number times a machine count, and the
 * final row equals the values the battle uses.
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
  function stepsHtml(side, sideState, teamLabel) {
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
    return "<table class='cp-steps'><thead><tr><th" + (teamLabel ? " class='cp-team'" : "") + ">" + (teamLabel || "Step") + "</th><th>Attack</th><th>Defense %</th></tr></thead><tbody>" +
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
    return "<div class='cp-losses'><h4>Machines lost</h4><div class='cp-chart'>" + bars + "</div>" +
      "<div class='cp-summary'><span><strong>" + mean.toFixed(1) + "</strong> average</span>" +
      "<span><strong>" + percent(wiped) + "%</strong> all lost</span></div></div>";
  }
  function noLossHtml() {
    return "<div class='cp-losses'><h4>Machines lost</h4><p class='cp-nofire'><strong>0</strong> no counterattack</p></div>";
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
      if (projection && card.attacking && !m.pv.counter) losses = noLossHtml();
      else if (projection) {
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
        " simulated battles. The two squads' rolls are independent.</p>" : "");
  }

  /* Hover: the whole calculation plus each side's projected losses. */
  function previewHtml(m, projection) {
    return boardHtml(m, state(m, Infinity), "ATTACK PREVIEW", projection);
  }

  /* The battle screen's numbers: both sides' steps side by side, counted up
   * `elapsed` ms in (Infinity is the finished calculation), then each side's
   * damage per machine and, once the match has rolled, the roll itself.
   * `report` is BATTLE_REPORT.assess's {attack, counter}; omit it before the roll. */
  function supportLine(m, index, shown) {
    var kind = index === 0 ? "attack" : "defense", items = "";
    m.supporters.forEach(function (sup, i) {
      if (sup.side !== kind || i >= shown) return;
      items += "<span class='bn-supporter' title='" + esc(sup.name) + "'>" +
        unitView.iconHtml({typeId: sup.typeId, player: sup.player, strength: sup.strength}) +
        "<strong>" + sup.label + "</strong></span>";
    });
    return "<p class='bn-line'><span class='bn-key'>Support from</span>" +
      (items || (shown >= m.supporters.length ? "<span class='bn-none'>none</span>" : "")) + "</p>";
  }
  function multiplierText(side) { return "×" + (side.multiplier / 100).toFixed(2); }
  function shotLines(m, index, ready, report) {
    var side = m.sides[index], target = m.sides[1 - index], blank = "<p class='bn-line bn-hidden'>&nbsp;</p>";
    if (!ready) return blank + blank;
    if (!side.canFire) return "<p class='bn-line'><span class='bn-key'>Shot</span><span class='bn-none'>no counterattack</span></p>" + blank;
    var ap = side.final.ap, da = target.final.da, base = Math.floor(ap * (100 - da) / 100);
    var each = Math.floor(base * side.multiplier / 100), squad = each * side.machines;
    var first = "<p class='bn-line'><span class='bn-key'>Per machine</span>" + ap + " × (100 − " + da + ")% = <strong>" + base + "</strong>" +
      (side.multiplier > 100 ? " " + multiplierText(side) + " = <strong>" + each + "</strong>" : "") + "</p>";
    var average = combat.expectedCasualties(side.unit, target.unit, ap, da);
    if (!report) {
      return first + "<p class='bn-line'><span class='bn-key'>Squad</span>" + side.machines + " × " + each + " = <strong>" + squad +
        "</strong> × roll · average <strong>" + average.toFixed(1) + "</strong> of " + target.machines + " destroyed</p>";
    }
    var shot = report[index === 0 ? "attack" : "counter"];
    return first + "<p class='bn-line'><span class='bn-key'>Roll</span><strong>" + shot.coefficientPercent + "%</strong> → <strong>" +
      shot.totalDamage + "</strong> damage → <strong>" + shot.losses + "</strong> of " + target.machines + " destroyed" +
      " · average " + average.toFixed(1) + ", " + shot.verdict + "</p>";
  }

  function numbersHtml(m, elapsed, report) {
    var st = state(m, elapsed), ready = elapsed >= m.time.experienceEnd;
    var cards = m.sides.map(function (side, index) { return {side: side, index: index}; })
      .sort(function (a, b) { return a.side.unit.player - b.side.unit.player; });
    return "<div class='battle-numbers'><div class='battle-stat-panels'>" + cards.map(function (card) {
      var side = card.side;
      return "<section class='cp-side cp-side-" + side.unit.player + " bn-side' data-player='" + side.unit.player + "'>" +
        stepsHtml(side, st.sides[card.index], faction(side.unit.player)) +
        supportLine(m, card.index, st.supportersShown) + shotLines(m, card.index, ready, report) + "</section>";
    }).join("") + "</div></div>";
  }

  return {build: build, state: state, effects: effects, previewHtml: previewHtml, numbersHtml: numbersHtml,
    TICK_MS: TICK_MS, SUPPORT_MS: SUPPORT_MS, TERRAIN_MS: TERRAIN_MS, RING_MS: RING_MS, HOLD_MS: HOLD_MS};
})();
if (typeof module !== "undefined") module.exports = COMBAT_PANEL;
