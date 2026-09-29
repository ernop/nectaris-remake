/* Shared battle scene and the match's actual roll, for play and replay.
 * Forecasts elsewhere never read the match RNG. This report does: it explains
 * the coefficient that battle already drew. */
"use strict";
var BATTLE_REPORT = (function () {
  var combat = typeof module !== "undefined" ? require("./combat.js") : COMBAT;
  var unitView = typeof module !== "undefined" ? require("./unit-view.js") : UNIT_VIEW;
  var combatPanel = typeof module !== "undefined" ? require("./combat-panel.js") : COMBAT_PANEL;

  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  var terrains = typeof module !== "undefined" ? require("./data-terrain.js").TERRAIN : TERRAIN;

  function faction(player) { return player ? "Xenon" : "Union"; }

  function signed(value) {
    var text = (Math.round(value * 100) / 100).toFixed(2);
    return value > 0 ? "+" + text : text;
  }

  function emptyLedger() {
    return [0, 1].map(function () {
      return {attacks: 0, destroyed: 0, lost: 0, attackGap: 0, counterGap: 0};
    });
  }

  function cloneLedger(ledger) {
    return ledger.map(function (row) {
      return {attacks: row.attacks, destroyed: row.destroyed, lost: row.lost,
        attackGap: row.attackGap, counterGap: row.counterGap};
    });
  }

  function squad(unit, strength, exp) {
    return {type: unit.type, typeId: unit.typeId, player: unit.player, strength: strength, exp: exp};
  }

  function assess(attacker, defender, result, attackerBefore, defenderBefore) {
    if (!result || !result.preview || !Number.isInteger(result.attackerExpBefore) ||
        !Number.isInteger(result.defenderExpBefore)) {
      throw new Error("Battle result is missing its pre-battle calculation");
    }
    var pv = result.preview;
    var attack = combat.shotReport(
      squad(attacker, attackerBefore, result.attackerExpBefore),
      squad(defender, defenderBefore, result.defenderExpBefore),
      pv.attacker.ap, pv.defender.da, result.attackDamage, true);
    var counter = combat.shotReport(
      squad(defender, defenderBefore, result.defenderExpBefore),
      squad(attacker, attackerBefore, result.attackerExpBefore),
      pv.defender.ap, pv.attacker.da, result.counterDamage, !!pv.counter);
    return {attack: attack, counter: counter, preview: pv};
  }

  // The board around a battle, which the battle screen's hex map paints:
  // terrain as one map character per hex, row by row, building owners, and
  // every unit on the map within AREA_MARGIN hexes of either combatant. The
  // combatants are recorded as passed, so callers pass them at their
  // pre-battle strength; a replayed battle then shows the board as it was.
  // The margin covers the hexes the map shows plus the neighbours the
  // renderer reads to join terrain across them.
  var AREA_MARGIN = 8;
  function battleArea(game, attacker, defender) {
    var c0 = Math.max(0, Math.min(attacker.col, defender.col) - AREA_MARGIN);
    var c1 = Math.min(game.width - 1, Math.max(attacker.col, defender.col) + AREA_MARGIN);
    var r0 = Math.max(0, Math.min(attacker.row, defender.row) - AREA_MARGIN);
    var r1 = Math.min(game.height - 1, Math.max(attacker.row, defender.row) + AREA_MARGIN);
    var rows = [], owners = {};
    for (var row = r0; row <= r1; row++) {
      var line = "";
      for (var col = c0; col <= c1; col++) {
        line += game.terrainAt(col, row).ch;
        var building = game.buildingAt(col, row);
        if (building) owners[col + "," + row] = building.owner;
      }
      rows.push(line);
    }
    var units = game.units.filter(function (u) {
      return !u.carriedBy && !u.inFactory && u.id !== attacker.id && u.id !== defender.id &&
        u.col >= c0 && u.col <= c1 && u.row >= r0 && u.row <= r1;
    }).concat([attacker, defender]).map(function (u) { return [u.typeId, u.player, u.strength, u.col, u.row]; });
    return {width: game.width, height: game.height, c0: c0, r0: r0, rows: rows, owners: owners, units: units};
  }

  // The rank a unit is shown ending the battle on. The engine still awards a
  // destroyed attacker its points, but a unit that is gone earns no stars on
  // screen (user, 2026-09-29).
  function shownRank(before, after, survivors) {
    return survivors > 0 ? after : before;
  }

  function snapshot(attacker, defender, result, attackerBefore, defenderBefore, game) {
    var assessed = assess(attacker, defender, result, attackerBefore, defenderBefore);
    var pv = assessed.preview, aAfter = attackerBefore - result.dmgToAttacker, dAfter = defenderBefore - result.dmgToDefender;
    return {
      assessed: assessed,
      aPlayer: attacker.player, dPlayer: defender.player,
      aType: attacker.typeId, dType: defender.typeId,
      aExp: result.attackerExpBefore, dExp: result.defenderExpBefore,
      aExpAfter: shownRank(result.attackerExpBefore, attacker.exp, aAfter),
      dExpAfter: shownRank(result.defenderExpBefore, defender.exp, dAfter),
      aBefore: attackerBefore, dBefore: defenderBefore,
      aAfter: aAfter, dAfter: dAfter,
      aCol: attacker.col, aRow: attacker.row, dCol: defender.col, dRow: defender.row,
      apA: pv.attacker.ap, daA: pv.attacker.da, apD: pv.defender.ap, daD: pv.defender.da,
      hasCounter: !!pv.counter, ranged: !!pv.ranged,
      area: battleArea(game, Object.assign({}, attacker, {strength: attackerBefore}), Object.assign({}, defender, {strength: defenderBefore})),
    };
  }

  function record(ledger, attackerPlayer, assessed) {
    var attack = assessed.attack, counter = assessed.counter;
    var a = ledger[attackerPlayer], d = ledger[1 - attackerPlayer];
    a.attacks += 1;
    a.destroyed += attack.losses;
    a.lost += counter.losses;
    a.attackGap += attack.losses - attack.expected;
    d.lost += attack.losses;
    d.destroyed += counter.losses;
    if (counter.enabled) d.counterGap += counter.losses - counter.expected;
  }

  function shown(typeId, player, strength, exp) {
    var types = typeof module !== "undefined" ? require("./data-units.js").UNIT_TYPES : UNIT_TYPES;
    var type = types[typeId];
    if (!type) throw new Error("Battle report has no unit type " + typeId);
    return {type: type, typeId: typeId, player: player, strength: strength, exp: exp};
  }

  function sceneHtml(attacker, defender, aBefore, dBefore, aNow, dNow) {
    var lost = aBefore - aNow, destroyed = dBefore - dNow;
    function side(unit, before, now, word) {
      var icon = {type: unit.type, typeId: unit.typeId, player: unit.player, strength: now, exp: unit.exp};
      return "<div class='war-side war-" + word + "'>" + unitView.html(icon) +
        "<span class='war-faction war-faction-" + unit.player + "'>" + faction(unit.player) + "</span>" +
        "<strong class='war-count'>" + (before - now) + "</strong>" +
        "<span class='war-count-label'>" + word + "</span>" +
        "<span class='war-left'><strong>" + now + "</strong> left of " + before + "</span></div>";
    }
    return "<div class='war-scene'>" +
      "<div class='war-headline'><strong>" + destroyed + "</strong> destroyed, <strong>" + lost + "</strong> lost</div>" +
      side(attacker, aBefore, aNow, "lost") +
      "<div class='war-verb'>" + esc(unitView.name(attacker)) + " attacked " + esc(unitView.name(defender)) + "</div>" +
      side(defender, dBefore, dNow, "destroyed") + "</div>";
  }

  function formula(shooterExp, shooterStrength, targetStrength, attack, defense, percent) {
    var base = Math.floor(attack * (100 - defense) / 100);
    var experienced = Math.floor(base * combat.EXP_DAMAGE[shooterExp] / 100);
    var total = Math.floor(experienced * shooterStrength * percent / 100);
    var hp = targetStrength * 100 + (targetStrength > 1 ? 50 : 0);
    var left = Math.floor(Math.max(0, hp - total) / 100);
    return "floor(" + attack + " × (100 − " + defense + ") / 100) = <strong>" + base + "</strong>" +
      " · damage multiplier ×" + (combat.EXP_DAMAGE[shooterExp] / 100).toFixed(2) + " → <strong>" + experienced + "</strong>" +
      " · floor(" + experienced + " × " + shooterStrength + " × " + (percent / 100).toFixed(2) + ") = <strong>" + total + "</strong> damage" +
      " · " + hp + " HP − " + total + " → <strong>" + left + "</strong> left";
  }

  function shotHtml(title, report, shooterExp, shooterStrength, targetStrength, attack, defense) {
    if (!report.enabled) {
      return "<p class='war-math-line'><span class='war-math-label'>" + title + "</span> No counterattack. Losses <strong>0</strong>.</p>";
    }
    return "<p class='war-math-line'><span class='war-math-label'>" + title + "</span> destroyed <strong>" +
      report.losses + "</strong> · average <strong>" + report.expected.toFixed(2) + "</strong>" +
      " · exactly " + report.losses + " on <strong>" + report.exact + "</strong> of 100" +
      " · " + report.losses + " or more on <strong>" + report.tail + "</strong> of 100" +
      " · " + report.verdict +
      "<br>Roll <strong>" + report.coefficientPercent + "%</strong>" +
      " · <strong>" + report.weight + "</strong> of 100 table rows" +
      " · this high or higher on <strong>" + report.rollTail + "</strong> of 100" +
      "<br>" + formula(shooterExp, shooterStrength, targetStrength, attack, defense, report.coefficientPercent) +
      "</p>";
  }

  function mathFrom(snap) {
    return shotHtml("Attack", snap.assessed.attack, snap.aExp, snap.aBefore, snap.dBefore, snap.apA, snap.daD) +
      shotHtml("Counter", snap.assessed.counter, snap.dExp, snap.dBefore, snap.aBefore, snap.apD, snap.daA);
  }

  // Original code-authored terrain scenery, shared by play and replay. Each
  // relief is drawn in a 400 x 260 box whose ground starts at y = 100.
  var RELIEF = {
    plain: "<path d='M0 100L70 94L150 103L240 92L320 98L400 90V260H0Z' fill='#b8b09a'/>",
    road: "<path d='M165 80H210L340 260H35Z' fill='#77746d'/><path d='M185 92L190 110M200 125L208 145M224 168L236 198M250 220L267 256' stroke='#dbcfac' stroke-width='5'/>",
    waste: "<path d='M0 115L22 89L50 111L95 97L129 120L160 88L196 116L234 105L271 91L310 116L354 82L400 109V260H0Z' fill='#8f7b5b'/><path d='M24 177l16 -16l23 9l-6 16zM277 226l21 -21l28 13l-5 17zM187 140l9 -10l19 7l-3 8z' fill='#625a4b'/>",
    hill: "<path d='M0 109Q40 32 101 108Q169 15 249 105Q337 24 400 98V260H0Z' fill='#8b794e'/><path d='M0 123Q77 80 145 135Q243 74 306 132Q367 91 400 122V260H0Z' fill='#ae9b6a'/>",
    mountain: "<path d='M0 130L72 18L142 113L214 5L291 115L350 35L400 124V260H0Z' fill='#645847'/><path d='M72 18L91 102L142 113L104 130L38 88ZM214 5L242 108L291 115L244 142L160 95ZM350 35L369 116L400 124L350 147L309 93Z' fill='#a18b65'/>",
    valley: "<path d='M0 0H115L142 91L101 190L56 260H0ZM400 0H292L259 98L299 181L348 260H400Z' fill='#514a3e'/><path d='M115 0L125 90L84 186L35 260H56L101 190L142 91ZM292 0L280 95L321 182L371 260H348L299 181L259 98Z' fill='#9e8864'/>",
    bridge: "<path d='M0 90L400 70V260H0Z' fill='#49443d'/><path d='M128 78H250L380 260H0Z' fill='#97918a'/><path d='M128 78L0 260M250 78L380 260' stroke='#d2c8a6' stroke-width='9'/><path d='M110 110H272M88 142H295M65 175H320M38 214H348' stroke='#66645e' stroke-width='4'/>",
    factory: "<path d='M0 105V67H39V39H55V67H86V49L116 67V43L146 67H171V107ZM220 107V61H257V17H271V61H301V43L337 61H380V107Z' fill='#7c796e'/><path d='M14 82H63V108H14ZM101 82H151V108H101ZM239 80H285V108H239ZM312 80H362V108H312Z' fill='#3e4846'/><path d='M0 144H400M0 210H400M70 110L26 260M184 110L184 260M300 110L354 260' stroke='#9e9886' stroke-width='3'/>",
    base: "<path d='M19 111V97a54 54 0 0 1 108 0v14ZM167 112V81a45 45 0 0 1 90 0v31ZM290 111V97a46 46 0 0 1 92 0v14Z' fill='#c8c2b4' stroke='#837d70' stroke-width='5'/><path d='M62 86H84V111H62ZM204 82H223V112H204ZM327 87H346V111H327Z' fill='#445052'/><path d='M0 162H400M0 216H400' stroke='#a69f8b' stroke-width='3'/>",
  };
  var PEBBLES = "<path d='M12 231h13m84 -35h10m46 49h18m97 -87h12m55 85h13m-177 -94h9' stroke='#514a3b' stroke-opacity='.35' stroke-width='3'/>";
  function terrainId(name) {
    var id = Object.keys(terrains).find(function (key) { return terrains[key].name === name; });
    if (!id) throw new Error("Battle scenery has no terrain named " + name);
    return id;
  }
  // `scenery`: the half draws its own terrain (fire from range); otherwise
  // the field's one continuous ground shows through.
  function groundHtml(side, position, scenery) {
    var id = terrainId(side.terrain);
    return "<div class='battle-ground battle-ground-" + id + "' aria-label='" + faction(side.unit.player) + " on " + esc(side.terrain) + "'>" +
      (scenery ? "<svg class='battle-terrain' viewBox='0 0 400 260' preserveAspectRatio='none' aria-hidden='true'>" +
        "<path fill='#393c40' d='M0 0H400V260H0Z'/><path fill='" + terrains[id].color + "' d='M0 100H400V260H0Z'/>" + RELIEF[id] + PEBBLES + "</svg>" : "") +
      formationHtml(side.unit, side.before, side.now, position, side.fresh, side.aim) + "</div>";
  }
  // Adjacent units fight on one piece of ground (user, 2026-09-29: "the land
  // between the two sides shall be flat visibly and not cut"). One horizon runs
  // across the field; each side's relief stands behind its own formation and
  // fades out before the middle, where the two terrain colours blend on flat
  // ground. Only one battle screen exists per page, so the ids are unique.
  function joinedGroundHtml(left, right) {
    var l = terrainId(left.terrain), r = terrainId(right.terrain);
    return "<svg class='battle-terrain' viewBox='0 0 800 260' preserveAspectRatio='none' aria-hidden='true'><defs>" +
      "<linearGradient id='battle-joined-ground'><stop offset='.4' stop-color='" + terrains[l].color + "'/>" +
      "<stop offset='.6' stop-color='" + terrains[r].color + "'/></linearGradient>" +
      "<linearGradient id='battle-joined-fade-l'><stop offset='.55' stop-color='#fff'/><stop offset='.92' stop-color='#000'/></linearGradient>" +
      "<linearGradient id='battle-joined-fade-r'><stop offset='.08' stop-color='#000'/><stop offset='.45' stop-color='#fff'/></linearGradient>" +
      "<mask id='battle-joined-mask-l' maskContentUnits='userSpaceOnUse'><rect width='400' height='260' fill='url(#battle-joined-fade-l)'/></mask>" +
      "<mask id='battle-joined-mask-r' maskContentUnits='userSpaceOnUse'><rect x='400' width='400' height='260' fill='url(#battle-joined-fade-r)'/></mask></defs>" +
      "<path fill='#393c40' d='M0 0H800V260H0Z'/><path fill='url(#battle-joined-ground)' d='M0 100H800V260H0Z'/>" +
      "<g mask='url(#battle-joined-mask-l)'>" + RELIEF[l] + "</g>" +
      "<g mask='url(#battle-joined-mask-r)'><g transform='translate(400 0)'>" + RELIEF[r] + "</g></g>" +
      PEBBLES + "<g transform='translate(400 0)'>" + PEBBLES + "</g></svg>";
  }
  function formationHtml(unit, before, now, side, fresh, aim) {
    var html = "<div class='battle-formation battle-formation-" + side + "' aria-label='" +
      faction(unit.player) + ": " + now + " machines remaining'>";
    for (var i = 0; i < before; i++) {
      var icon = Object.assign({}, unit, {strength: 8, exp: 0});
      html += "<span class='battle-machine" + (i >= now ? " battle-casualty" + (fresh ? " battle-casualty-new" : "") : "") + "'>" +
        (i < now ? unitView.iconHtml(icon) + (aim ? barrelHtml(aim, side === "left" ? "ltr" : "rtl", i) : "") :
          "<span aria-hidden='true'>✹</span>") + "</span>";
    }
    return html + "</div>";
  }

  // Indirect fire. The gun (artillery) or launcher (a missile buggy such as
  // the Lynx) tilts up toward the enemy, every machine fires in turn, and the
  // shell climbs out of the top of the field, then falls onto a machine of the
  // target formation. The sprites are flat pictures, so the barrel is drawn
  // over each machine. Lengths are in machine-cell widths. All timings are
  // here; the stylesheet reads them from the elements' custom properties.
  var TILT_DEG = 55, TILT_MS = 300, FLIGHT_MS = 800, STAGGER_MS = 30, SPLASH_MS = 180;
  var LAUNCH = {artillery: {len: 0.55, thick: 0.12}, launcher: {len: 0.45, thick: 0.2}};
  var BARREL_TOP = 0.42; // barrel's top edge as a fraction of the machine cell
  // A squad has at most 8 machines; the last splash ends as the volley does.
  var ARC_VOLLEY_MS = TILT_MS + 7 * STAGGER_MS + FLIGHT_MS + SPLASH_MS;
  // Which launcher a shooter uses when it fires from beyond an adjacent hex.
  function launchKind(type, ranged) {
    if (!ranged) return null;
    if (type.cls === "artillery") return "artillery";
    return type.cls === "buggy" && type.rngG > 1 ? "launcher" : null;
  }
  function fireDelay(i) { return TILT_MS + i * STAGGER_MS; }
  function barrelHtml(kind, dir, i) {
    var spec = LAUNCH[kind];
    return "<i class='battle-barrel battle-barrel-" + kind + " battle-barrel-" + dir + "' style='--len:" + spec.len +
      ";--thick:" + spec.thick + ";--top:" + BARREL_TOP + ";--tilt-deg:" + TILT_DEG + "deg;--tilt-ms:" + TILT_MS +
      "ms;--fire:" + fireDelay(i) + "ms'></i>";
  }
  // Where machine `i` of an `n`-machine formation stands, as CSS expressions
  // in the battle field's own coordinates: x in cqw, y as a share of the
  // field's height. Mirrors .battle-formation: three columns filling the
  // ground's padded width, rows centred vertically, tilted by its skewY.
  var SKEW = Math.tan(8 * Math.PI / 180);
  function slotAt(n, ground, i) {
    var k = (i % 3 - 1) / 3, rows = Math.ceil(n / 3), row = Math.floor(i / 3) - (rows - 1) / 2;
    var span = "(50cqw - 2 * var(--pad))";
    return {
      x: (ground ? 75 : 25) + "cqw + (" + k.toFixed(4) + ") * " + span,
      y: "50% + (var(--pad-top) - var(--pad-bot)) / 2 + (" + row + ") * (var(--cell) + var(--gap)) + (" +
        ((ground ? 1 : -1) * SKEW * k).toFixed(4) + ") * " + span,
    };
  }
  function arcHtml(kind, ground, i, fromN, toN) {
    var spec = LAUNCH[kind], sign = ground ? -1 : 1, rad = TILT_DEG * Math.PI / 180;
    var from = slotAt(fromN, ground, i), to = slotAt(toN, 1 - ground, (i * 3 + 1) % toN);
    var pivotY = spec.thick / 2 + BARREL_TOP - 0.5;
    var x0 = from.x + " + (" + (sign * Math.cos(rad) * spec.len).toFixed(4) + ") * var(--cell)";
    var y0 = from.y + " + (" + (pivotY - Math.sin(rad) * spec.len).toFixed(4) + ") * var(--cell)";
    var style = "--x0:calc(" + x0 + ");--y0:calc(" + y0 + ");--x1:calc(" + to.x + ");--y1:calc(" + to.y +
      ");--a0:" + -sign * TILT_DEG + "deg;--a1:" + sign * TILT_DEG + "deg;--flight:" + FLIGHT_MS + "ms;--fire:" + fireDelay(i) + "ms";
    return "<i class='battle-" + (kind === "launcher" ? "rocket" : "shell") + " battle-arc-" + (ground ? "rtl" : "ltr") +
      "' style='" + style + "'></i><i class='battle-splash' style='--x1:calc(" + to.x + ");--y1:calc(" + to.y +
      ");--land:" + (fireDelay(i) + FLIGHT_MS) + "ms;--splash:" + SPLASH_MS + "ms'></i>";
  }
  // Every firing machine sends one bullet across at once; both sides fire from
  // their pre-battle strength, as the calculation does. A side with an `aim`
  // (see launchKind) lobs shells instead.
  function volleyHtml(left, right) {
    var html = "<span class='battle-volley' aria-hidden='true'>";
    [[left, right, "ltr"], [right, left, "rtl"]].forEach(function (pair) {
      var from = pair[0], to = pair[1];
      if (!from.canFire) return;
      for (var i = 0; i < from.before; i++) {
        if (from.aim) {
          html += arcHtml(from.aim, pair[2] === "rtl" ? 1 : 0, i, from.before, to.before);
        } else {
          html += "<i class='battle-bullet battle-bullet-" + pair[2] + "' style='top:" + (18 + (i % 4) * 20) +
            "%;animation-delay:" + i * 25 + "ms'></i>";
        }
      }
    });
    return html + "</span>";
  }

  // Earned ranks are revealed one per STAR_MS; each then fades in, glows and
  // settles to the normal star colour over STAR_GLOW_MS.
  var STAR_MS = 350, STAR_GLOW_MS = 1200;

  // Original-style opposing formations, recreated with the selected remake art.
  // Stats describe the pre-battle units; casualties and earned stars animate.
  // `numbers` = {count, report, area}: `count` is how many ms into the
  // calculation the numbers panel is (default: finished); `report` is
  // assess()'s rolled shots, given once the battle has rolled; `area` is
  // battleArea()'s record of the board, which the hex map paints.
  function screenHtml(attacker, defender, preview, aBefore, dBefore, aNow, dNow, aExp, dExp, aExpAfter, dExpAfter, phase, numbers) {
    phase = phase || "result";
    numbers = numbers || {};
    // The unit's mark carries its remaining machines on the icon's corner,
    // exactly as the map sprite does, so the count drops as machines fall.
    // A new star's delay is its age on the reward clock, so rebuilding the
    // screen for the next rank continues earlier stars mid-glow.
    function head(side, position) {
      var shown = side.after === undefined ? side.exp : side.after;
      return "<div class='battle-combatant battle-combatant-" + position + (side.fresh && side.now < side.before ? " battle-combatant-hit" : "") +
        "' data-player='" + side.unit.player + "'><h3><span class='unit-label'>" +
        unitView.markHtml(Object.assign({}, side.unit, {strength: side.now}),
          {before: side.exp, shown: shown, stepMs: STAR_MS, count: combat.strengthCaption(side.now)}) +
        "<span>" + esc(unitView.name(side.unit)) + "</span></span></h3></div>";
    }
    var sides = [
      {unit:attacker,before:aBefore,now:aNow,exp:aExp === undefined ? attacker.exp : aExp,
        after:aExpAfter,role:"attacking",stats:preview.attacker,terrain:preview.attackerTerrain,canFire:true},
      {unit:defender,before:dBefore,now:dNow,exp:dExp === undefined ? defender.exp : dExp,
        after:dExpAfter,role:"defending",stats:preview.defender,terrain:preview.defenderTerrain,canFire:preview.counter},
    ].sort(function (a, b) { return a.unit.player - b.unit.player; });
    var left = sides[0], right = sides[1];
    sides.forEach(function (side) {
      side.fresh = phase === "impact";
      side.aim = phase === "fighting" && side.role === "attacking" ? launchKind(side.unit.type, preview.ranged) : null;
    });
    // Formations tilt only when something fires upward: a shot from range or
    // an aircraft in the fight (user, 2026-09-29). Adjacent ground units stand level.
    var lofted = preview.ranged || combat.isAir(attacker) || combat.isAir(defender);
    return "<div class='battle-screen' data-battle-phase='" + phase + "'><div class='battle-heading'>" +
      head(left, "left") + head(right, "right") +
      "</div><div class='battle-field" + (lofted ? " battle-field-lofted" : "") + "'>" +
      (preview.ranged ? "" : joinedGroundHtml(left, right)) + (phase === "fighting" ? volleyHtml(left, right) : "") +
      groundHtml(left, "left", preview.ranged) + groundHtml(right, "right", preview.ranged) +
      "</div>" + combatPanel.numbersHtml(combatPanel.build(
        Object.assign({}, attacker, {strength: aBefore, exp: aExp === undefined ? attacker.exp : aExp}),
        Object.assign({}, defender, {strength: dBefore, exp: dExp === undefined ? defender.exp : dExp}), preview),
        numbers.count === undefined ? Infinity : numbers.count, numbers.report, numbers.area) + "</div>";
  }

  // The battle's one-line status. It sits in the control bar under the screen
  // rather than in the screen, to leave the screen's height to the numbers.
  // The finished battle used to add "N destroyed · N lost" here. Callers still
  // pass the before and after strengths; the result line no longer uses them.
  function outcomeText(attacker, aBefore, dBefore, aNow, dNow, phase) {
    if (phase === "ready") return faction(attacker.player) + " preparing to attack";
    if (phase === "fighting" || phase === "impact") return faction(attacker.player) + " attacking";
    return "";
  }

  function earnedExperience(before, after, elapsed) {
    if (after === undefined || elapsed === undefined) return after;
    return Math.min(after, before + Math.floor(elapsed / STAR_MS));
  }
  // The screen closes as the last star's glow settles.
  function rewardHoldMs(stars) {
    return stars ? stars * STAR_MS + STAR_GLOW_MS : 500;
  }
  // Time from the start of the result until every earned star is shown.
  function rewardRevealMs(stars) {
    return stars * STAR_MS;
  }
  function rewardDuration(snap) {
    return rewardHoldMs(Math.max((snap.aExpAfter || 0) - snap.aExp, (snap.dExpAfter || 0) - snap.dExp, 0));
  }
  // One volley, then every loss at once, however many machines fall. A volley
  // with artillery in it lasts long enough for the shells to go up and come down.
  var VOLLEY_MS = 500, IMPACT_MS = 450;
  // `snap` needs aType and ranged, as a snapshot has. Only the attacker can
  // fire from range: a counterattack needs an adjacent target.
  function volleyMs(snap) {
    if (!snap || snap.aType === undefined || typeof snap.ranged !== "boolean") {
      throw new Error("volleyMs needs the attacker's unit type and whether the shot is ranged");
    }
    var types = typeof module !== "undefined" ? require("./data-units.js").UNIT_TYPES : UNIT_TYPES;
    return launchKind(types[snap.aType], snap.ranged) ? ARC_VOLLEY_MS : VOLLEY_MS;
  }
  function fightingDuration(snap) {
    return volleyMs(snap) + IMPACT_MS;
  }
  function animate(snap, elapsed) {
    var duration = fightingDuration(snap), hit = elapsed >= volleyMs(snap);
    return present(snap, Math.max(0, elapsed - duration), {aNow: hit ? snap.aAfter : snap.aBefore,
      dNow: hit ? snap.dAfter : snap.dBefore, phase: !hit ? "fighting" : elapsed < duration ? "impact" : "result"});
  }
  function present(snap, rewardElapsed, frame) {
    var aExp = earnedExperience(snap.aExp, snap.aExpAfter, rewardElapsed), dExp = earnedExperience(snap.dExp, snap.dExpAfter, rewardElapsed);
    var attacker = Object.assign(shown(snap.aType, snap.aPlayer, snap.aAfter, aExp === undefined ? snap.aExp : aExp), {col: snap.aCol, row: snap.aRow});
    var defender = Object.assign(shown(snap.dType, snap.dPlayer, snap.dAfter, dExp === undefined ? snap.dExp : dExp), {col: snap.dCol, row: snap.dRow});
    var aNow=frame?frame.aNow:snap.aAfter,dNow=frame?frame.dNow:snap.dAfter,phase=frame?frame.phase:"result";
    return {outcome: outcomeText(attacker, snap.aBefore, snap.dBefore, aNow, dNow, phase),
      scene: sceneHtml(attacker, defender, snap.aBefore, snap.dBefore, aNow, dNow), math: phase === "result" ? mathFrom(snap) : "",
      screen: screenHtml(attacker, defender, snap.assessed.preview, snap.aBefore, snap.dBefore, aNow, dNow, snap.aExp, snap.dExp, aExp, dExp, phase,
        {report: phase === "result" || phase === "impact" ? snap.assessed : undefined, area: snap.area})};
  }

  function resultParts(attacker, defender, result, attackerBefore, defenderBefore, game) {
    var snap = snapshot(attacker, defender, result, attackerBefore, defenderBefore, game);
    var view = present(snap);
    return {assessed: snap.assessed, snapshot: snap, outcome: view.outcome, scene: view.scene, math: view.math, screen: view.screen};
  }

  function previewHtml(attacker, defender, preview, game) {
    var expectedD = combat.expectedCasualties(attacker, defender, preview.attacker.ap, preview.defender.da);
    var expectedA = preview.counter ? combat.expectedCasualties(defender, attacker, preview.defender.ap, preview.attacker.da) : 0;
    var scene = "<div class='war-scene'><div class='war-headline'>" + faction(attacker.player) + " selected an attack</div>" +
      "<div class='war-side'>" + unitView.html(attacker) +
      "<span class='war-faction war-faction-" + attacker.player + "'>" + faction(attacker.player) + "</span></div>" +
      "<div class='war-verb'>" + esc(unitView.name(attacker)) + " attacking " + esc(unitView.name(defender)) + "</div>" +
      "<div class='war-side'>" + unitView.html(defender) +
      "<span class='war-faction war-faction-" + defender.player + "'>" + faction(defender.player) + "</span></div></div>";
    var math = "<p class='war-math-line'><span class='war-math-label'>Before the roll</span> " +
      "Average destroyed <strong>" + expectedD.toFixed(2) + "</strong> · average lost <strong>" + expectedA.toFixed(2) + "</strong>" +
      " · attack <strong>" + preview.attacker.ap + "</strong> vs defense <strong>" + preview.defender.da + "</strong>" +
      (preview.counter ? " · counter attack <strong>" + preview.defender.ap + "</strong> vs defense <strong>" + preview.attacker.da + "</strong>" :
        " · no counterattack") +
      "<br>The match draws its roll when the attack resolves. The result names that table row and whether the casualties beat this average.</p>";
    return {outcome: outcomeText(attacker, attacker.strength, defender.strength, attacker.strength, defender.strength, "ready"),
      scene: scene, math: math, screen: screenHtml(attacker, defender, preview,
      attacker.strength, defender.strength, attacker.strength, defender.strength, attacker.exp, defender.exp, undefined, undefined, "ready",
      {area: battleArea(game, attacker, defender)})};
  }

  function ledgerHtml(ledger) {
    return "<div class='war-ledger'>" + ledger.map(function (row, side) {
      return "<div class='war-ledger-side'><span class='war-faction war-faction-" + side + "'>" + faction(side) + "</span>" +
        "<strong>" + row.attacks + "</strong><span>attacks</span>" +
        "<strong>" + row.destroyed + "</strong><span>destroyed</span>" +
        "<strong>" + row.lost + "</strong><span>lost</span>" +
        "<strong>" + signed(row.attackGap) + "</strong><span>attack vs average</span>" +
        "<strong>" + signed(row.counterGap) + "</strong><span>counter vs average</span></div>";
    }).join("") +
      "<p class='war-ledger-note'>A plus means more machines destroyed than the published 100-row average for those fights. Zero is the expected war.</p></div>";
  }

  function noteHtml(text) {
    return {scene: "<div class='war-scene'><div class='war-verb'>" + esc(text) + "</div></div>", math: ""};
  }

  return {faction: faction, emptyLedger: emptyLedger, cloneLedger: cloneLedger, assess: assess,
    battleArea: battleArea, shownRank: shownRank, snapshot: snapshot, outcomeText: outcomeText, animate: animate, fightingDuration: fightingDuration, volleyMs: volleyMs, earnedExperience: earnedExperience, rewardDuration: rewardDuration, rewardHoldMs: rewardHoldMs, rewardRevealMs: rewardRevealMs, record: record, sceneHtml: sceneHtml, screenHtml: screenHtml, present: present, resultParts: resultParts,
    previewHtml: previewHtml, ledgerHtml: ledgerHtml, noteHtml: noteHtml};
})();
if (typeof module !== "undefined") module.exports = BATTLE_REPORT;
