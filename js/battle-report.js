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
      " · experience ×" + (combat.EXP_DAMAGE[shooterExp] / 100).toFixed(2) + " → <strong>" + experienced + "</strong>" +
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

  // Original-style opposing formations, recreated with the selected remake art.
  // Stats always describe the pre-battle squads; only casualties animate.
  function screenHtml(attacker, defender, preview, aBefore, dBefore, aNow, dNow, aExp, dExp) {
    function head(unit, now, exp, role) {
      return "<div class='battle-combatant'><span class='war-faction war-faction-" + unit.player + "'>" +
        faction(unit.player) + " · " + role + "</span><h3>" + esc(unitView.name(unit)) + "</h3>" +
        "<div class='battle-count'><strong>" + now + "</strong><span>machines</span></div>" +
        "<div class='battle-exp'>EXP " + exp + " / " + combat.MAX_EXP + "</div></div>";
    }
    function formation(unit, before, now, side) {
      var html = "<div class='battle-formation battle-formation-" + side + "' aria-label='" +
        faction(unit.player) + ": " + now + " machines remaining'>";
      for (var i = 0; i < before; i++) {
        var icon = Object.assign({}, unit, {strength: 8, exp: 0});
        html += "<span class='battle-machine" + (i >= now ? " battle-casualty" : "") + "'>" +
          (i < now ? unitView.iconHtml(icon) : "<span aria-hidden='true'>✹</span>") + "</span>";
      }
      return html + "</div>";
    }
    function stats(unit, side, terrain, strength, canFire) {
      return "<div class='battle-stats'><dl><div><dt>Attack</dt><dd>" + (canFire ? side.ap * strength : "—") +
        "</dd></div><div><dt>Defense</dt><dd>" + side.da * strength + "</dd></div>" +
        "<div><dt>Terrain</dt><dd>+" + side.modifiers.terrain + "%</dd></div></dl>" +
        "<p>" + esc(terrain) + " · " + side.ap + " attack / " + side.da + " defense per machine</p>" +
        (side.modifiers.surrounded ? "<p>Surrounded</p>" : "") +
        (!canFire ? "<p>No counterattack</p>" : "") + "</div>";
    }
    return "<div class='battle-screen'><div class='battle-heading'>" +
      head(attacker, aNow, aExp === undefined ? attacker.exp : aExp, "attacking") +
      head(defender, dNow, dExp === undefined ? defender.exp : dExp, "defending") +
      "</div><div class='battle-field'>" + formation(attacker, aBefore, aNow, "left") +
      "<span class='battle-crossfire' aria-hidden='true'>↔</span>" + formation(defender, dBefore, dNow, "right") +
      "</div><div class='battle-stat-panels'>" + stats(attacker, preview.attacker, preview.attackerTerrain, aBefore, true) +
      stats(defender, preview.defender, preview.defenderTerrain, dBefore, preview.counter) +
      "</div><p class='battle-outcome'>" + (dBefore - dNow) + " destroyed · " + (aBefore - aNow) +
      " lost</p></div>";
  }

  function present(snap) {
    var attacker = shown(snap.aType, snap.aPlayer, snap.aAfter, snap.aExp);
    var defender = shown(snap.dType, snap.dPlayer, snap.dAfter, snap.dExp);
    return {scene: sceneHtml(attacker, defender, snap.aBefore, snap.dBefore, snap.aAfter, snap.dAfter), math: mathFrom(snap),
      screen: screenHtml(attacker, defender, snap.assessed.preview, snap.aBefore, snap.dBefore, snap.aAfter, snap.dAfter, snap.aExp, snap.dExp)};
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
      attacker.strength, defender.strength, attacker.strength, defender.strength)};
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
    snapshot: snapshot, record: record, sceneHtml: sceneHtml, screenHtml: screenHtml, present: present, resultParts: resultParts,
    previewHtml: previewHtml, ledgerHtml: ledgerHtml, noteHtml: noteHtml};
})();
if (typeof module !== "undefined") module.exports = BATTLE_REPORT;
