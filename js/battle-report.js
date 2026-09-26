/* Shared battle scene and the match's actual roll, for play and replay.
 * Forecasts elsewhere never read the match RNG. This report does: it explains
 * the coefficient that battle already drew. */
"use strict";
var BATTLE_REPORT = (function () {
  var combat = typeof module !== "undefined" ? require("./combat.js") : COMBAT;
  var unitView = typeof module !== "undefined" ? require("./unit-view.js") : UNIT_VIEW;

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

  function snapshot(attacker, defender, result, attackerBefore, defenderBefore) {
    var assessed = assess(attacker, defender, result, attackerBefore, defenderBefore);
    var pv = assessed.preview;
    return {
      assessed: assessed,
      aPlayer: attacker.player, dPlayer: defender.player,
      aType: attacker.typeId, dType: defender.typeId,
      aExp: result.attackerExpBefore, dExp: result.defenderExpBefore,
      aExpAfter: attacker.exp, dExpAfter: defender.exp,
      aBefore: attackerBefore, dBefore: defenderBefore,
      aAfter: attackerBefore - result.dmgToAttacker,
      dAfter: defenderBefore - result.dmgToDefender,
      aCol: attacker.col, aRow: attacker.row, dCol: defender.col, dRow: defender.row,
      apA: pv.attacker.ap, daA: pv.attacker.da, apD: pv.defender.ap, daD: pv.defender.da,
      hasCounter: !!pv.counter,
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

  // Original code-authored terrain scenery, shared by play and replay.
  function groundHtml(side, position) {
    var id = Object.keys(terrains).find(function (key) { return terrains[key].name === side.terrain; }) || "plain";
    var relief = {
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
    return "<div class='battle-ground battle-ground-" + id + "' aria-label='" + faction(side.unit.player) + " on " + esc(side.terrain) + "'>" +
      "<svg class='battle-terrain' viewBox='0 0 400 260' preserveAspectRatio='none' aria-hidden='true'>" +
      "<path fill='#393c40' d='M0 0H400V260H0Z'/><path fill='" + terrains[id].color + "' d='M0 100H400V260H0Z'/>" + relief[id] +
      "<path d='M12 231h13m84 -35h10m46 49h18m97 -87h12m55 85h13m-177 -94h9' stroke='#514a3b' stroke-opacity='.35' stroke-width='3'/></svg>" +
      formationHtml(side.unit, side.before, side.now, position) + "</div>";
  }
  function formationHtml(unit, before, now, side) {
    var html = "<div class='battle-formation battle-formation-" + side + "' aria-label='" +
      faction(unit.player) + ": " + now + " machines remaining'>";
    for (var i = 0; i < before; i++) {
      var icon = Object.assign({}, unit, {strength: 8, exp: 0});
      html += "<span class='battle-machine" + (i >= now ? " battle-casualty" : "") + "'>" +
        (i < now ? unitView.iconHtml(icon) : "<span aria-hidden='true'>✹</span>") + "</span>";
    }
    return html + "</div>";
  }

  // Original-style opposing formations, recreated with the selected remake art.
  // Stats describe the pre-battle squads; casualties and earned stars animate.
  function screenHtml(attacker, defender, preview, aBefore, dBefore, aNow, dNow, aExp, dExp, aExpAfter, dExpAfter, phase) {
    phase = phase || "result";
    function head(unit, now, exp, role, after) {
      var shownUnit=Object.assign({},unit,{strength:now,exp:after === undefined ? exp : after});
      return "<div class='battle-combatant' data-player='" + unit.player + "'><span class='war-faction war-faction-" + unit.player + "'>" +
        faction(unit.player) + " · " + role + "</span><h3>" + unitView.html(shownUnit, after > exp ? {experienceGlowFrom:exp} : null) + "</h3>" +
        "<div class='battle-count'><strong>" + now + "</strong><span>machines</span></div>" +
        (after > exp ? "<div class='battle-exp-gain'>Experience gained</div>" : "") + "</div>";
    }
    function stats(unit, side, strength, canFire) {
      return "<div class='battle-stats' data-player='" + unit.player + "'><dl><div><dt>Attack</dt><dd>" + (canFire ? side.ap * strength : "—") +
        "</dd></div><div><dt>Defense</dt><dd>" + side.da * strength + "</dd></div>" +
        "<div><dt>Terrain</dt><dd>+" + side.modifiers.terrain + "%</dd></div></dl>" +
        (side.modifiers.surrounded ? "<p>Surrounded</p>" : "") +
        (!canFire ? "<p>No counterattack</p>" : "") + "</div>";
    }
    var sides = [
      {unit:attacker,before:aBefore,now:aNow,exp:aExp === undefined ? attacker.exp : aExp,
        after:aExpAfter,role:"attacking",stats:preview.attacker,terrain:preview.attackerTerrain,canFire:true},
      {unit:defender,before:dBefore,now:dNow,exp:dExp === undefined ? defender.exp : dExp,
        after:dExpAfter,role:"defending",stats:preview.defender,terrain:preview.defenderTerrain,canFire:preview.counter},
    ].sort(function (a, b) { return a.unit.player - b.unit.player; });
    var left = sides[0], right = sides[1];
    return "<div class='battle-screen' data-battle-phase='" + phase + "'><div class='battle-phases' aria-label='Battle stages'>" +
      ["ready", "fighting", "result"].map(function (step) { return "<span" + (phase === step ? " aria-current='step'" : "") + ">" +
        {ready:"Ready",fighting:"Fighting",result:"Result"}[step] + "</span>"; }).join("<span aria-hidden='true'>·</span>") +
      "</div><div class='battle-heading'>" +
      sides.map(function (side) { return head(side.unit, side.now, side.exp, side.role, side.after); }).join("") +
      "</div><div class='battle-field'>" + groundHtml(left, "left") +
      "<span class='battle-crossfire" + (preview.counter ? "" : " battle-one-way") + "' role='img' aria-label='" +
      (preview.counter ? "Attack and counterattack" : "One-way attack · no counterattack") + "' title='" +
      (preview.counter ? "Attack and counterattack" : "One-way attack · no counterattack") + "'>" +
      (preview.counter ? "↔" : attacker.player ? "←" : "→") + "</span>" + groundHtml(right, "right") +
      "</div><div class='battle-stat-panels'>" + sides.map(function (side) {
        return stats(side.unit, side.stats, side.before, side.canFire);
      }).join("") + "</div><p class='battle-outcome'>" + (phase === "ready" ? faction(attacker.player) + " preparing to attack" :
        phase === "fighting" ? faction(attacker.player) + " attacking" : faction(attacker.player) + " attack · " +
        (dBefore - dNow) + " destroyed · " + (aBefore - aNow) + " lost") + "</p></div>";
  }

  function earnedExperience(before, after, elapsed) {
    if (after === undefined || elapsed === undefined) return after;
    return Math.min(after, before + Math.floor(elapsed / 350));
  }
  function rewardDuration(snap) {
    return Math.max((snap.aExpAfter || 0) - snap.aExp, (snap.dExpAfter || 0) - snap.dExp, 0) * 350 + 700;
  }
  function fightingDuration(snap) {
    return Math.max(1600, Math.min(2600, Math.max(snap.aBefore-snap.aAfter, snap.dBefore-snap.dAfter)*360));
  }
  function animate(snap, elapsed) {
    var duration=fightingDuration(snap),progress=Math.min(1,Math.max(0,elapsed/duration));
    function remaining(before,after){return before-Math.min(before-after,Math.floor(progress*(before-after)+0.38));}
    return present(snap,Math.max(0,elapsed-duration),{aNow:remaining(snap.aBefore,snap.aAfter),
      dNow:remaining(snap.dBefore,snap.dAfter),phase:progress<1?"fighting":"result"});
  }
  function present(snap, rewardElapsed, frame) {
    var aExp = earnedExperience(snap.aExp, snap.aExpAfter, rewardElapsed), dExp = earnedExperience(snap.dExp, snap.dExpAfter, rewardElapsed);
    var attacker = shown(snap.aType, snap.aPlayer, snap.aAfter, aExp === undefined ? snap.aExp : aExp);
    var defender = shown(snap.dType, snap.dPlayer, snap.dAfter, dExp === undefined ? snap.dExp : dExp);
    var aNow=frame?frame.aNow:snap.aAfter,dNow=frame?frame.dNow:snap.dAfter,phase=frame?frame.phase:"result";
    return {scene: sceneHtml(attacker, defender, snap.aBefore, snap.dBefore, aNow, dNow), math: phase === "result" ? mathFrom(snap) : "",
      screen: screenHtml(attacker, defender, snap.assessed.preview, snap.aBefore, snap.dBefore, aNow, dNow, snap.aExp, snap.dExp, aExp, dExp, phase)};
  }

  function resultParts(attacker, defender, result, attackerBefore, defenderBefore) {
    var snap = snapshot(attacker, defender, result, attackerBefore, defenderBefore);
    var view = present(snap);
    return {assessed: snap.assessed, snapshot: snap, scene: view.scene, math: view.math, screen: view.screen};
  }

  function previewHtml(attacker, defender, preview) {
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
    return {scene: scene, math: math, screen: screenHtml(attacker, defender, preview,
      attacker.strength, defender.strength, attacker.strength, defender.strength, attacker.exp, defender.exp, undefined, undefined, "ready")};
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
    snapshot: snapshot, animate: animate, fightingDuration: fightingDuration, earnedExperience: earnedExperience, rewardDuration: rewardDuration, record: record, sceneHtml: sceneHtml, screenHtml: screenHtml, present: present, resultParts: resultParts,
    previewHtml: previewHtml, ledgerHtml: ledgerHtml, noteHtml: noteHtml};
})();
if (typeof module !== "undefined") module.exports = BATTLE_REPORT;
