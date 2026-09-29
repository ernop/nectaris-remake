/* One matchup's numbers, shown in two places from one model.
 *   Hover (over the map): every step at once (base, support, terrain, surround,
 *          final, experience) and each side's projected losses, in the colour
 *          of its faction.
 *   Battle screen (inside the popup): each side's attack on the first row and
 *          its defense on the second, laid out the same for both sides. Each
 *          total is counted up in the true order of the calculation from a
 *          short equation of its parts. Under them, a painted crop of the
 *          board that lights where each part comes from as it is counted, and
 *          each side's chart of its own possible losses. The popup's pause
 *          and skip controls therefore work on the count.
 *
 * Every number is a unit total (user, 2026-09-29: never show per-unit values
 * "except at the very beginning"). The per-machine value appears once, in the
 * first term ("6×60"); every later term and every total is times the
 * machines. The engine itself works per machine: attack, and defense as the
 * share of each hit it stops, capped at 100 (combat.js). A defense total is
 * therefore machines × that share, and the final rows are the battle's
 * per-machine values times the machines.
 *
 * Experience is the last row, after the 100 cap, because the engine applies it
 * to the damage a machine deals, after defense: it shows that multiplier and
 * the attack it amounts to, floor(final attack x multiplier), so it can pass
 * 100. It never changes defense. Exact damage floors once more after defense,
 * so this attack figure can differ from the battle's by rounding.
 *
 * Support adds floor(sum of supporter value x strength / (2 x attacker
 * strength)) to each machine, for attack and defense alike. Each supporter's
 * share is the change in that floor times the machines of the unit it
 * supports, so the shares add up to the support in the totals. */
"use strict";
var COMBAT_PANEL = (function () {
  var unitView = typeof module !== "undefined" ? require("./unit-view.js") : UNIT_VIEW;
  var combat = typeof module !== "undefined" ? require("./combat.js") : COMBAT;
  var hex = typeof module !== "undefined" ? require("./hex.js") : HEX;
  var render = typeof module !== "undefined" ? require("./render.js") : RENDER;

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
      var machines = side === "attack" ? attacker.strength : defender.strength;
      list.filter(function (u) { return u.value > 0; }).forEach(function (u) {
        cumulative[side] += u.value * u.strength;
        var perMachine = Math.floor(cumulative[side] / (2 * attackerStrength));
        var gain = perMachine - applied[side];
        applied[side] = perMachine;
        supporters.push({col: u.col, row: u.row, side: side, player: u.player, gain: gain,
          typeId: u.typeId, name: u.name, strength: u.strength,
          label: "+" + gain * machines + (side === "attack" ? " ATK" : " DEF")});
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
   * carries live: true. Every value is a unit total, and the base counts the
   * machines in one at a time (`lit`). supportLive, terrainLive and ringLive
   * name the step being counted, for the hex map's highlights. */
  function state(m, elapsed) {
    var t = m.time, gains = {attack: 0, defense: 0};
    var out = {sides: [], supportersShown: 0, ringShown: 0, surroundShown: elapsed >= t.ringEnd, done: elapsed >= t.finalAt,
      supportLive: elapsed >= t.baseEnd && elapsed < t.supportEnd,
      terrainLive: elapsed >= t.supportEnd && elapsed < t.terrainEnd,
      ringLive: elapsed >= t.terrainEnd && elapsed < t.ringEnd};
    m.supporters.forEach(function (sup, i) {
      if (elapsed >= t.baseEnd + i * SUPPORT_MS) { out.supportersShown = i + 1; gains[sup.side] += sup.gain; }
    });
    if (elapsed >= t.terrainEnd) out.ringShown = Math.min(m.ringCount, Math.floor((elapsed - t.terrainEnd) / RING_MS) + 1);
    var reachedAt = {base: 0, support: t.baseEnd, terrain: t.supportEnd, surround: t.ringEnd, final: t.finalAt, experience: t.finalAt};
    m.sides.forEach(function (side, index) {
      var attacking = index === 0, rows = {}, n = side.machines, lit = n;
      side.keys.forEach(function (key) {
        if (elapsed < reachedAt[key]) return;
        var s = side[key], row = {atk: side.canFire ? s.ap * n : null, def: s.da * n, live: false};
        if (key === "base" && elapsed < t.baseEnd) {
          lit = Math.min(n, Math.floor(elapsed / TICK_MS) + 1);
          row.atk = side.canFire ? side.base.ap * lit : null;
          row.def = side.base.da * lit;
          row.live = true;
        } else if (key === "support" && elapsed < t.supportEnd) {
          if (side.canFire) row.atk = (side.base.ap + (attacking ? gains.attack : 0)) * n;
          row.def = (side.base.da + (attacking ? 0 : gains.defense)) * n;
          row.live = true;
        } else if (key === "terrain" && elapsed < t.terrainEnd) {
          var from = side.support.da;
          row.def = (from + Math.floor((s.da - from) * (elapsed - t.supportEnd) / TERRAIN_MS)) * n;
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
      if (key === "base") {
        atkNote = side.canFire ? side.machines + "×" + side.base.ap : "";
        defNote = side.machines + "×" + side.base.da;
      } else if (key === "surround") { atkNote = "½"; defNote = "½"; }
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
   * has rolled; `scene` is BATTLE_REPORT.battleArea's record of the board. */

  // One total and the terms that build it, as far as the count has got. Both
  // are unit totals, and only the first term shows the per-machine value
  // ("6×60"). A side that cannot fire has no attack. The term being counted
  // is live.
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
      var n = side.machines;
      term("base", st.sides[index].lit + "×" + side.base.da);
      total = rows.base.def;
      if (rows.support) {
        var guard = rows.support.def - side.base.da * n;
        if (guard > 0) term("support", "+" + guard, "support");
        total = rows.support.def;
      }
      if (rows.terrain) {
        var ground = (side.terrain.da - side.support.da) * n;
        if (ground > 0) term("terrain", "+" + ground, attacking ? m.pv.attackerTerrain : m.pv.defenderTerrain);
        total = rows.terrain.def;
      }
      if (rows.surround) { term("surround", "½", "surrounded"); total = rows.surround.def; }
      if (rows.final) {
        if (side.final.da < (side.surround || side.terrain).da) term("final", "cap");
        total = rows.final.def;
      }
    }
    return {terms: terms, total: total, live: terms.some(function (t) { return t.live; })};
  }

  // `ghost` is the finished equation laid invisibly under the one being
  // counted: it sets the width, so nothing moves as terms arrive.
  function termHtml(t, ghost) {
    return "<span class='bn-term" + (ghost ? "" : " bn-term-" + t.key + (t.live ? " bn-live" : "")) + "'><b>" + t.value + "</b>" +
      (t.label ? "<small>" + esc(t.label) + "</small>" : "") + "</span>";
  }
  function eqHtml(parts, finished) {
    function line(p, ghost) {
      return p.terms.map(function (t) { return termHtml(t, ghost); }).join("") + (p.terms.length ? "<span class='bn-equals'>=</span>" : "");
    }
    return "<span class='bn-eq'><span class='bn-eq-size' aria-hidden='true'>" + line(finished, true) + "</span>" +
      "<span class='bn-eq-now'>" + line(parts, false) + "</span></span>";
  }
  // A roll is a table percentage; 130 reads "×1.3". It belongs to the shooter's
  // own attack.
  function rollOf(m, report, index) {
    if (!report || !m.sides[index].canFire) return null;
    var shot = report[index === 0 ? "attack" : "counter"];
    return shot && shot.coefficientPercent != null ? shot.coefficientPercent / 100 : null;
  }
  // Both sides read the same way (user, 2026-09-29): attack on the first row,
  // defense on the second, each total before its label, so a side's two
  // totals stand in one column. Union stays on the left.
  function faceoffHtml(m, st, finished, report, ready, union, xenon) {
    return "<div class='bn-faceoff" + (ready ? " bn-ready" : "") + "'>" + [union, xenon].map(function (index) {
      return "<div class='bn-stats' data-player='" + m.sides[index].unit.player + "'>" + ["atk", "def"].map(function (stat) {
        var parts = statParts(m, st, index, stat), roll = stat === "atk" ? rollOf(m, report, index) : null;
        return eqHtml(parts, statParts(m, finished, index, stat)) +
          "<b class='bn-num" + (parts.live ? " bn-live" : "") + "' data-stat='" + stat + "'>" + (parts.total === null ? "—" : parts.total) + "</b>" +
          "<i class='bn-unit'>" + stat.toUpperCase() + "</i><em class='bn-roll'>" + (roll === null ? "" : "roll ×" + roll) + "</em>";
      }).join("") + "</div>";
    }).join("") + "</div>";
  }

  // The hex map: a crop of the board as the map paints it (RENDER.paintScene,
  // from the scene record), in the board's own orientation, with the count's
  // highlights laid over it in zoom-1 board coordinates. It frames both units
  // and the hexes touching either (the supporters and the ring around the
  // target), plus, in an adjacent fight, every unit whose zone of control
  // covers a ring hex. The box keeps the crop's proportions, widened or
  // heightened to stay within MAP_ASPECT, at MAP_EM tall.
  var MAP_EM = 13.4, MAP_ASPECT = [1, 1.35];
  function hexKey(place) { return place.col + "," + place.row; }
  // Clockwise from straight up, around `center`.
  function bearing(p, center) {
    return (Math.atan2(p.x - center.x, center.y - p.y) + 2 * Math.PI) % (2 * Math.PI);
  }
  function attr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // Each controlled ring hex and the units that control it: any unit not on
  // the target's side standing on it or next to it (Game.surroundRing).
  function ringControllers(m, units) {
    var byHex = {};
    m.pv.tactical.ring.forEach(function (h) {
      if (!h.controlled) return;
      byHex[hexKey(h)] = units.filter(function (u) {
        return u.player !== m.defender.player && hex.distance(u.col, u.row, h.col, h.row) <= 1;
      });
    });
    return byHex;
  }
  function cropFor(m, scene, controllers) {
    var focus = [m.attacker, m.defender];
    [m.attacker, m.defender].forEach(function (u) { focus = focus.concat(hex.neighbors(u.col, u.row)); });
    Object.keys(controllers).forEach(function (key) { focus = focus.concat(controllers[key]); });
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    focus.filter(function (h) { return h.col >= 0 && h.col < scene.width && h.row >= 0 && h.row < scene.height; })
      .forEach(function (h) {
        render.boardCorners(h.col, h.row, 1).forEach(function (p) {
          x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
        });
      });
    var w = x1 - x0 + 8, h = y1 - y0 + 8;
    if (w / h > MAP_ASPECT[1]) h = w / MAP_ASPECT[1];
    if (w / h < MAP_ASPECT[0]) w = h * MAP_ASPECT[0];
    return [(x0 + x1 - w) / 2, (y0 + y1 - h) / 2, w, h].map(function (v) { return Math.round(v * 100) / 100; });
  }

  // Everything the count has reached, where it comes from, as it is counted:
  // each supporter's hex and its share (a line to the unit it helps while it
  // is being added), each unit's terrain on its own hex, and the ring around
  // the target checked clockwise, the hex being checked joined to the units
  // whose zone of control covers it. The step being counted is yellow;
  // afterwards each mark keeps its side's colour. Shares and bonuses are unit
  // totals, as in the equations.
  function minimapHtml(m, st, scene) {
    var units = scene.units.map(function (u) { return {typeId: u[0], player: u[1], strength: u[2], col: u[3], row: u[4]}; });
    var controllers = m.pv.ranged ? {} : ringControllers(m, units), crop = cropFor(m, scene, controllers);
    var half = Math.max.apply(null, render.boardCorners(0, 0, 1).map(function (p) { return Math.abs(p.y); }));
    var rings = "", marks = "", lines = "", tags = "";
    function shape(cls, place, scale) {
      return "<polygon class='" + cls + "' points='" + render.boardCorners(place.col, place.row, scale).map(function (p) {
        return p.x.toFixed(2) + "," + p.y.toFixed(2);
      }).join(" ") + "'/>";
    }
    function link(cls, a, b) {
      var p = render.boardCenter(a.col, a.row), q = render.boardCenter(b.col, b.row);
      lines += "<line class='" + cls + "' x1='" + p.x.toFixed(2) + "' y1='" + p.y.toFixed(2) + "' x2='" + q.x.toFixed(2) + "' y2='" + q.y.toFixed(2) + "'/>";
    }
    function at(point) {
      return "left:" + ((point.x - crop[0]) / crop[2] * 100).toFixed(2) + "%;top:" + ((point.y - crop[1]) / crop[3] * 100).toFixed(2) + "%";
    }
    // A tag sits on the lower edge of its hex, under the sprite, or at `point`.
    function tag(place, value, unit, tone, now, point) {
      var c = render.boardCenter(place.col, place.row);
      tags += "<span class='bn-tag " + tone + (now ? " bn-now" : "") + (point ? " bn-tag-at" : "") + "' style='" +
        at(point || {x: c.x, y: c.y + half}) + "'><b>" + value + "</b>" + (unit ? "<small>" + unit + "</small>" : "") + "</span>";
    }
    if (m.pv.ranged) {
      link("bn-range", m.attacker, m.defender);
      var a = render.boardCenter(m.attacker.col, m.attacker.row), d = render.boardCenter(m.defender.col, m.defender.row);
      tags += "<span class='bn-range-label' style='" + at({x: (a.x + d.x) / 2, y: (a.y + d.y) / 2 - half}) + "'>" + m.pv.dist + " hexes</span>";
    } else {
      var center = render.boardCenter(m.defender.col, m.defender.row), zone = "bn-p" + m.attacker.player;
      m.pv.tactical.ring.filter(function (h) { return h.onMap; })
        .map(function (h) { return {hex: h, at: render.boardCenter(h.col, h.row)}; })
        .sort(function (p, q) { return bearing(p.at, center) - bearing(q.at, center); })
        .forEach(function (r, i) {
          if (i >= st.ringShown) return;
          var now = st.ringLive && i === st.ringShown - 1;
          rings += shape(r.hex.controlled ? "bn-ring-lit " + zone + (now ? " bn-now" : "") : "bn-ring-open" + (now ? " bn-now" : ""), r.hex, 0.96);
          if (now && r.hex.controlled) controllers[hexKey(r.hex)].forEach(function (u) {
            marks += shape("bn-zoc-source", u, 0.8);
            link("bn-zoc", u, r.hex);
          });
        });
    }
    m.supporters.forEach(function (sup, i) {
      if (i >= st.supportersShown) return;
      var now = st.supportLive && i === st.supportersShown - 1, share = sup.label.split(" ");
      marks += shape("bn-support bn-p" + sup.player + (now ? " bn-now" : ""), sup, 0.84);
      if (now) link("bn-link", sup, sup.side === "attack" ? m.attacker : m.defender);
      tag(sup, share[0], share[1], "bn-p" + sup.player, now, false);
    });
    m.sides.forEach(function (side, index) {
      marks += shape("bn-own", side.unit, 0.92);
      var bonus = (side.terrain.da - side.support.da) * side.machines;
      if (st.sides[index].rows.terrain && bonus > 0) tag(side.unit, "+" + bonus, "DEF", "bn-p" + side.unit.player, st.terrainLive, false);
    });
    // The verdict sits on the target's edge square to the line from the
    // attacker, clear of both units' lower-edge tags.
    if (!m.pv.ranged && st.surroundShown) {
      var covered = m.pv.tactical.ring.filter(function (h) { return h.controlled; }).length;
      var from = render.boardCenter(m.attacker.col, m.attacker.row), dx = center.x - from.x, dy = center.y - from.y;
      var length = Math.sqrt(dx * dx + dy * dy), reach = Math.max.apply(null, render.boardCorners(0, 0, 1).map(function (p) { return Math.abs(p.x); }));
      var side = {x: center.x - dy / length * reach, y: center.y + dx / length * reach};
      if (m.pv.surrounded) tag(m.defender, "½", "", "bn-verdict", false, side);
      else tag(m.defender, covered + "/6", "ZOC", "bn-p" + m.attacker.player, false, side);
    }
    var width = Math.round(MAP_EM * crop[2] / crop[3] * 100) / 100;
    return {em: width, html: "<div class='bn-map' style='width:" + width + "em;height:" + MAP_EM + "em' role='img' " +
      "aria-label='The board around the battle, lighting where support, terrain and surround come from'>" +
      "<canvas class='bn-terrain' data-scene='" + attr(JSON.stringify(scene)) + "' data-crop='" + crop.join(" ") + "' aria-hidden='true'></canvas>" +
      "<svg viewBox='" + crop.join(" ") + "' preserveAspectRatio='none' aria-hidden='true'>" + rings + marks + lines + "</svg>" + tags + "</div>"};
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

  // Nine evenly spaced columns, 0 through 8, whatever the unit's strength. A
  // side nothing shoots at is certain to lose 0. The bar height is the chance
  // itself, so the axis is always 0% to 100%.
  var CHART_SLOTS = 9, CHART_BAR = 1.35, CHART_GAP = 0.32;
  function lossChances(shooter, target) {
    var chances = new Array(CHART_SLOTS).fill(0);
    if (!shooter.canFire) { chances[0] = 1; return chances; }
    lossDistribution(shooter, target).forEach(function (p, lost) {
      if (lost >= CHART_SLOTS) throw new Error("A unit cannot lose more than 8 machines");
      chances[lost] += p;
    });
    return chances;
  }
  function barCenter(i) {
    return i * (CHART_BAR + CHART_GAP) + CHART_BAR / 2;
  }
  // A side's own losses. The average is marked under the axis. Once rolled,
  // the actual count is yellow. Every state keeps the same nine columns.
  function lossChartHtml(side, shooter, actual, shown) {
    var chances = lossChances(shooter, side), likely = chances.indexOf(Math.max.apply(null, chances)), mean = 0;
    chances.forEach(function (p, lost) { mean += p * lost; });
    var width = barCenter(CHART_SLOTS - 1) + CHART_BAR / 2;
    var bars = chances.map(function (p, lost) {
      var style = "width:" + CHART_BAR + "em;flex:0 0 " + CHART_BAR + "em";
      return "<div class='cp-bar" + (lost === likely ? " cp-likely" : "") + (lost === actual ? " cp-actual" : "") +
        "' style='" + style + "' role='img' aria-label='" + lost + " lost: " + percent(p) + " percent" +
        (lost === actual ? ", the result" : "") + "'>" +
        "<span class='cp-pct'>" + (p >= 0.005 ? percent(p) : "") + "</span>" +
        "<span class='cp-col'><i style='height:" + (p * 100).toFixed(1) + "%'></i></span>" +
        "<span class='cp-lost'>" + lost + "</span></div>";
    }).join("");
    var at = mean <= 0 ? barCenter(0) : mean >= CHART_SLOTS - 1 ? barCenter(CHART_SLOTS - 1) : (function () {
      var i = Math.floor(mean);
      return barCenter(i) + (barCenter(i + 1) - barCenter(i)) * (mean - i);
    })();
    var axis = "<div class='bn-yaxis' aria-hidden='true'><span><b>100</b><small>%</small></span><span><b>50</b><small>%</small></span><span><b>0</b><small>%</small></span></div>";
    return "<div class='bn-chart" + (shown ? "" : " bn-hidden") + "' aria-label='Chance of losing 0 to 8 machines, average " + mean.toFixed(1) + "'>" +
      "<div class='bn-plot'>" + axis +
      "<div class='bn-series'><div class='cp-chart' style='gap:" + CHART_GAP + "em;width:" + width.toFixed(2) + "em'>" + bars + "</div>" +
      "<div class='bn-mean-strip' style='width:" + width.toFixed(2) + "em'><i class='bn-mean' style='left:" + at.toFixed(2) + "em'></i></div></div></div></div>";
  }

  // The panel's width in em of its own type, mirroring css/battle-dock.css,
  // so the stylesheet can shrink the type for a board narrower than this
  // before anything is laid out: each side's longest finished equation and
  // its "=" (terms 1.1em, labels .75em, gaps .45em), the total (4 digits at
  // 2.7em), its label, the roll column, the gaps and paddings, and below
  // them the two charts and the hex map. A monospace character is taken as
  // 0.62em, a little over the fonts in use, so an estimate never falls short.
  var CHAR = 0.62;
  function eqEm(parts) {
    if (!parts.terms.length) return 0;
    return parts.terms.reduce(function (sum, t) {
      return sum + String(t.value).length * 1.1 * CHAR + (t.label ? 0.2 + t.label.length * 0.75 * CHAR : 0) + 0.45;
    }, 1.1 * CHAR);
  }
  function panelEm(m, finished, mapEm) {
    var block = Math.max.apply(null, [0, 1].map(function (index) {
      return Math.max(eqEm(statParts(m, finished, index, "atk")), eqEm(statParts(m, finished, index, "def")));
    })) + 4 * 2.7 * CHAR + 3 * 1.1 * (CHAR + 0.05) + 5.4 + 3 * 0.5 + 2 * 0.5;
    var chart = (3 * 1.15 + 0.7) * CHAR + 0.4 + CHART_SLOTS * CHART_BAR + (CHART_SLOTS - 1) * CHART_GAP;
    return Math.ceil(Math.max(2 * block + 0.2, 2 * chart + mapEm + 2 * 1.2) + 1.2);
  }

  function numbersHtml(m, elapsed, report, scene) {
    if (!scene || !Array.isArray(scene.units)) throw new Error("The battle screen's numbers need the board around the battle (BATTLE_REPORT.battleArea)");
    var st = state(m, elapsed), finished = state(m, Infinity), ready = elapsed >= m.time.experienceEnd;
    var union = m.sides[0].unit.player === 0 ? 0 : 1, xenon = 1 - union, map = minimapHtml(m, st, scene);
    function chart(index) {
      // The attacker's losses come from the counter, the defender's from the attack.
      var actual = report ? report[index === 0 ? "counter" : "attack"].losses : undefined;
      return "<div class='bn-side' data-player='" + m.sides[index].unit.player + "'>" +
        lossChartHtml(m.sides[index], m.sides[1 - index], actual, ready) + "</div>";
    }
    return "<div class='battle-numbers' style='--need:" + panelEm(m, finished, map.em) + "'>" +
      faceoffHtml(m, st, finished, report, ready, union, xenon) +
      "<div class='bn-detail'>" + chart(union) + map.html + chart(xenon) + "</div></div>";
  }

  return {build: build, state: state, effects: effects, previewHtml: previewHtml, numbersHtml: numbersHtml,
    TICK_MS: TICK_MS, SUPPORT_MS: SUPPORT_MS, TERRAIN_MS: TERRAIN_MS, RING_MS: RING_MS, HOLD_MS: HOLD_MS};
})();
if (typeof module !== "undefined") module.exports = COMBAT_PANEL;
