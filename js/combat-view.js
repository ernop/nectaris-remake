/* Read-only combat inspector and joint casualty heatmap. */
"use strict";
var COMBAT_VIEW = (function () {
  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function percent(value) {
    if (value > 0 && value < 0.001) return "<0.1%";
    return (value * 100).toFixed(1) + "%";
  }
  function heatmap(projection, attackerStrength, defenderStrength) {
    var left = 34, top = 10, cell = 28, size = 9 * cell;
    var max = Math.max.apply(null, projection.bins.reduce(function (all, row) { return all.concat(row); }, []));
    var svg = "<svg class='outcome-map' viewBox='0 0 300 309' role='group' aria-label='Joint casualty probabilities'>";
    for (var a = 0; a <= 8; a++) {
      for (var d = 0; d <= 8; d++) {
        var available = a <= attackerStrength && d <= defenderStrength;
        var count = available ? projection.bins[a][d] : 0;
        var rate = count / projection.samples;
        var x = left + d * cell, y = top + (8 - a) * cell;
        var intensity = count ? Math.sqrt(count / max) : 0;
        var fill = count ? "rgb(" + Math.round(45 + 195 * intensity) + "," +
          Math.round(51 + 148 * intensity) + "," + Math.round(49 + 51 * intensity) + ")" : "#27251e";
        var label = "Your losses " + a + ", enemy losses " + d + ": " + (available ? percent(rate) : "impossible");
        svg += "<g" + (available ? " tabindex='0'" : "") + " role='img' aria-label='" + esc(label) + "'>" +
          "<title>" + esc(label) + "</title><rect x='" + x + "' y='" + y +
          "' width='27' height='27' fill='" + fill + "' opacity='" + (available ? 1 : 0.25) + "'/>";
        if (count) svg += "<text x='" + (x + 13.5) + "' y='" + (y + 16) + "' text-anchor='middle' fill='" +
          (intensity > 0.45 ? "#171811" : "#ece6cd") + "'>" + (rate < 0.01 ? "&lt;1" : Math.round(rate * 100)) + "</text>";
        svg += "</g>";
      }
    }
    for (var n = 0; n <= 8; n++) {
      svg += "<text class='axis-tick' x='" + (left + n * cell + 13.5) + "' y='277' text-anchor='middle'>" + n + "</text>" +
        "<text class='axis-tick' x='27' y='" + (top + (8 - n) * cell + 17) + "' text-anchor='end'>" + n + "</text>";
    }
    svg += "<text class='axis-label' x='" + (left + size / 2) + "' y='298' text-anchor='middle'>Enemy losses →</text>" +
      "<text class='axis-label' transform='translate(11 137) rotate(-90)' text-anchor='middle'>Your losses →</text></svg>";
    return svg;
  }
  function side(unit, calc, terrain, label) {
    var m = calc.modifiers, bonus = COMBAT.experienceBonus(unit.exp);
    var rows = calc.steps.map(function (step) {
      return "<tr><th>" + step.label + "</th><td>" + step.ap + "</td><td>" + step.da + "</td></tr>";
    }).join("");
    return "<section class='forecast-side'><h4>" + label + "</h4><strong>" + esc(unit.type.name) + "</strong>" +
      "<p>EXP " + unit.exp + " · damage +" + bonus.damage + "%" +
      (COMBAT.strengthCaption(unit.strength) ? " · strength " + unit.strength : "") + "</p>" +
      "<table><thead><tr><th>Per unit</th><th>ATK</th><th>DEF</th></tr></thead><tbody>" + rows + "</tbody></table>" +
      "<p>Support +" + m.supportAttack + " ATK / +" + m.supportDefense + " DEF<br>" +
      esc(terrain) + " +" + m.terrain + " DEF" + (COMBAT.isAir(unit) ? " (airborne)" : "") + "<br>" +
      (m.surrounded ? "Surrounded: attack and defense halved before cap." : "Surround: none.") +
      (m.attackDisabled ? "<br>Counterattack disabled." : "") + "</p></section>";
  }
  function damageLine(shooter, attack, defense, label) {
    var base = Math.floor(attack * (100 - defense) / 100);
    var experienced = Math.floor(base * COMBAT.EXP_DAMAGE[shooter.exp] / 100);
    return "<p><strong>" + label + "</strong>: floor(" + attack + " × (100 − " + defense + ") / 100) = " + base +
      "; EXP ×" + (COMBAT.EXP_DAMAGE[shooter.exp] / 100).toFixed(2) + " → " + experienced +
      ".<br>Squad damage: floor(" + experienced + " × " + shooter.strength + " machines × roll 0.2–4.0).</p>";
  }
  function band(type, air) {
    var range = COMBAT.rangeBand(type, air);
    return range ? (range.min === range.max ? "" + range.max : range.min + "–" + range.max) : "—";
  }
  function targetInfo(unit) {
    var t = unit.type;
    return "<section class='forecast-unit' aria-label='Target unit information'>" +
      "<div>" + esc(t.cls) + " · " + esc(t.moveType) + "</div>" +
      "<dl><dt>Power G / A · Defense</dt><dd>" + (t.atkG || 0) + " / " + (t.atkA || 0) + " · " + t.def + "</dd>" +
      "<dt>Move · Ground / air range</dt><dd>" + t.move + " · " + band(t, false) + " / " + band(t, true) + "</dd>" +
      (unit.strength < 8 ? "<dt>Strength</dt><dd>" + unit.strength + "</dd>" : "") +
      "<dt>Experience</dt><dd>" + unit.exp + " · +" + COMBAT.experienceBonus(unit.exp).damage + "% damage</dd></dl>" +
      (t.capture ? "<p>Can capture buildings.</p>" : "") +
      (t.moveOrFire ? "<p>May move or fire.</p>" : "") +
      (t.moveAfterAttack ? "<p>May move after attacking.</p>" : "") + "</section>";
  }
  function tactics(pv, attacker) {
    var tactical = pv.tactical;
    if (!tactical) return "";
    function support(units, label, total) {
      var terms = units.map(function (u) { return esc(u.name) + " (" + u.value + " × " + u.strength + ")"; });
      return "<p><strong>" + label + "</strong>: " + (terms.length ? terms.join(" + ") +
        "<br>floor(total / (2 × " + attacker.strength + ")) = +" + total : "none (+0)") + ".</p>";
    }
    return "<section class='forecast-tactics'><h4>ZOC &amp; support</h4><p>Your position: " +
      (tactical.attackerInZOC ? "inside enemy ZOC" : "outside enemy ZOC") + ". Target: " +
      (tactical.defenderInZOC ? "inside your ZOC" : "outside your ZOC") + ".<br>" +
      (pv.surrounded ? "Target surrounded: attack and defense are halved." : "Target is not surrounded.") +
      " ZOC restricts movement; it is not a separate damage bonus.</p>" +
      (pv.ranged ? "<p>Indirect fire ignores support and surround.</p>" :
        support(tactical.attackSupporters, "Your attack support", pv.attacker.modifiers.supportAttack) +
        support(tactical.defenseSupporters, "Target defense support", pv.defender.modifiers.supportDefense)) + "</section>";
  }
  function html(attacker, defender, pv, projection) {
    return "<div class='forecast-eyebrow'>ATTACK PREVIEW · " + pv.dist + " HEX" + (pv.dist === 1 ? "" : "ES") + "</div>" +
      "<h3>" + esc(defender.type.name) + "</h3>" + targetInfo(defender) + "<div class='forecast-matchup'>" + esc(attacker.type.name) + " → " + esc(defender.type.name) + "</div>" +
      "<p class='forecast-note'>" + (pv.ranged ? "Indirect fire · no counterattack, support or surround." :
        (pv.counter ? "Direct fire · both squads fire at pre-battle strength." : "Direct fire · target cannot counterattack.")) + "</p>" +
      "<div class='forecast-final'><span>Your ATK / DEF <strong>" + pv.attacker.ap + " / " + pv.attacker.da +
      "</strong></span><span>Target ATK / DEF <strong>" + pv.defender.ap + " / " + pv.defender.da + "</strong></span></div>" +
      "<div class='forecast-eyebrow forecast-chart-title'>OUTCOME RATES · " + projection.samples.toLocaleString("en-US") + " SIMULATIONS</div>" +
      heatmap(projection, attacker.strength, defender.strength) +
      "<div class='forecast-summary'><div><strong>" + projection.meanDefenderLoss.toFixed(2) + "</strong><span>Mean enemy losses</span></div>" +
      "<div><strong>" + projection.meanAttackerLoss.toFixed(2) + "</strong><span>Mean your losses</span></div>" +
      "<div><strong>" + esc(percent(projection.defenderDestroyed)) + "</strong><span>Enemy destroyed</span></div>" +
      "<div><strong>" + esc(percent(projection.attackerDestroyed)) + "</strong><span>Your squad lost</span></div></div>" +
      "<p class='forecast-note'>Cell labels are %. Brighter = more likely. Hover or focus a cell for its rate.<br>Independent seeds · mutual destruction " +
      esc(percent(projection.mutualDestruction)) + ".</p>" +
      "<details class='forecast-calculations' open><summary>Combat calculation</summary><div class='forecast-sides'>" +
      side(attacker, pv.attacker, pv.attackerTerrain, "Your squad") + side(defender, pv.defender, pv.defenderTerrain, "Target") + "</div>" + tactics(pv, attacker) +
      damageLine(attacker, pv.attacker.ap, pv.defender.da, "Attack") +
      (pv.counter ? damageLine(defender, pv.defender.ap, pv.attacker.da, "Counter") : "") +
      "<p>Stats cap at 100. Fractions are discarded at each step. Temporary HP = strength × 100, plus 50 for squads of 2–8. " +
      "Remaining machines = floor(max(0, HP − damage) / 100).</p></details>" +
      "<p class='forecast-note'>Estimate under the game's uniform roll model. The match's random state is never read or advanced.</p>";
  }
  return { html: html, heatmap: heatmap };
})();
if (typeof module !== "undefined") module.exports = COMBAT_VIEW;
