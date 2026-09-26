"use strict";
module.exports = function (ok) {
  var ENGINE = require("../js/engine.js");
  var COMBAT = require("../js/combat.js");
  var REPORT = require("../js/battle-report.js");

  var game = new ENGINE.Game({name: "Report", grid: ["........", "........", "........"],
    units: [{t: "BISON", o: 0, x: 1, y: 1, str: 6, exp: 3}, {t: "POLAR", o: 1, x: 2, y: 1, str: 7, exp: 2}]}, {seed: 7});
  var attacker = game.units[0], defender = game.units[1];
  var aBefore = attacker.strength, dBefore = defender.strength, aExp = attacker.exp, dExp = defender.exp;
  var result = game.attack(attacker, defender);
  ok(result.attackerExpBefore === aExp && result.defenderExpBefore === dExp, "result keeps pre-battle experience");
  var parts = REPORT.resultParts(attacker, defender, result, aBefore, dBefore);
  ok(parts.assessed.attack.losses === result.dmgToDefender, "destroyed count is the defender's casualties");
  ok(parts.assessed.counter.losses === result.dmgToAttacker, "lost count is the attacker's casualties");
  ok(parts.assessed.attack.weight >= 2 && parts.assessed.attack.weight <= 10, "the roll is one published table row");
  ok(parts.assessed.attack.exact >= 1 && parts.assessed.attack.tail >= parts.assessed.attack.exact &&
    parts.assessed.attack.rollTail >= parts.assessed.attack.weight && parts.assessed.attack.rollTail <= 100,
    "exact, casualty-tail and roll-tail shares come from the 100-row table");
  var gap = parts.assessed.attack.losses - parts.assessed.attack.expected;
  var verdict = Math.abs(gap) < 0.5 ? "near the average" : gap > 0 ? "above the average" : "below the average";
  ok(parts.assessed.attack.verdict === verdict, "casualty verdict compares this roll with the table average");
  ok(parts.scene.indexOf(parts.assessed.attack.losses + "</strong> destroyed") >= 0 &&
    parts.scene.indexOf(parts.assessed.counter.losses + "</strong> lost") >= 0, "scene states destroyed and lost");
  ok(parts.math.indexOf("Roll <strong>" + parts.assessed.attack.coefficientPercent + "%</strong>") >= 0,
    "math shows the match's actual roll");
  ok(parts.screen.includes("battle-formation-left") && parts.screen.includes("battle-formation-right") &&
    parts.screen.includes("data-exp='" + attacker.exp + "'") && parts.screen.includes("Terrain") &&
    parts.screen.includes(String(result.preview.attacker.ap * aBefore)),
    "battle screen renders opposing formations, pre-battle experience, terrain and total attack");
  [0,1].forEach(function (initiator) {
    var fight = new ENGINE.Game({name:"Faction sides",grid:["....",".h-.","...."],units:[
      {t:"BISON",o:0,x:1,y:1,str:6,exp:3},{t:"POLAR",o:1,x:2,y:1,str:7,exp:7}]},{seed:7});
    fight.currentPlayer=initiator;
    var a=fight.units[initiator],d=fight.units[1-initiator],a0=a.strength,d0=d.strength;
    var before=REPORT.previewHtml(a,d,COMBAT.preview(fight,a,d)).screen;
    var out=fight.attack(a,d),report=REPORT.resultParts(a,d,out,a0,d0),screen=report.screen;
    [before,screen].forEach(function (html) {
      var heads=html.slice(html.indexOf("battle-heading"),html.indexOf("battle-field"));
      var left=html.slice(html.indexOf("battle-formation-left"),html.indexOf("battle-crossfire"));
      var right=html.slice(html.indexOf("battle-formation-right"),html.indexOf("battle-stat-panels"));
      var stats=html.slice(html.indexOf("battle-stat-panels"));
      ok(heads.indexOf("Union")<heads.indexOf("Xenon")&&left.includes("Union:")&&!left.includes("data-player='1'")&&
        right.includes("Xenon:")&&!right.includes("data-player='0'")&&stats.indexOf("data-player='0'")<stats.indexOf("data-player='1'"),
        "Union stays left and Xenon right, including stats and surviving icons, when side "+initiator+" attacks");
      ok(heads.includes((initiator?"Xenon":"Union")+" · attacking"),"fixed placement retains the true attacker role");
      ok(html.indexOf("battle-ground-hill")<html.indexOf("battle-ground-road")&&
        html.includes("Union on Hills")&&html.includes("Xenon on Road")&&!html.includes("per machine")&&
        !html.includes("battle-one-way"),"each faction keeps its terrain; direct exchanges are bidirectional and omit per-machine prose");
    });
    ok(report.snapshot.aExpAfter===a.exp&&report.snapshot.dExpAfter===d.exp&&
      screen.includes("data-exp='"+a.exp+"'")&&screen.includes("data-exp='"+d.exp+"'")&&!screen.includes("EXP "),
      "experience gains use the battle's actual awards, including the General cap");
    var start=REPORT.present(report.snapshot,0).screen,end=REPORT.present(report.snapshot,REPORT.rewardDuration(report.snapshot)).screen;
    ok(start.includes("data-exp='"+out.attackerExpBefore+"'")&&end===screen&&
      REPORT.earnedExperience(3,7,350)===4&&REPORT.earnedExperience(7,8,9999)===8,
      "earned stars reveal one at a time from the original rank, ending at the actual awarded rank");
    ok(!before.includes("battle-exp-gain"),"a battle preview never claims experience before the attack occurs");
    var models=screen.slice(screen.indexOf("battle-field"),screen.indexOf("battle-stat-panels"));
    ok(!/data-exp='[1-8]'/.test(models)&&screen.includes("data-exp-glow-from"),
      "formation machines have no rank overlays; earned stars glow only on the header icons");
    var fighting=REPORT.animate(report.snapshot,0),summary=REPORT.animate(report.snapshot,REPORT.fightingDuration(report.snapshot)+REPORT.rewardDuration(report.snapshot));
    ok(before.includes("data-battle-phase='ready'")&&fighting.screen.includes("data-battle-phase='fighting'")&&
      !fighting.screen.includes("battle-exp-gain")&&fighting.math===""&&summary.screen===screen&&summary.math===report.math,
      "ready, fighting and result are distinct stages; experience and final arithmetic appear after combat");
  });
  var ledger = REPORT.emptyLedger();
  REPORT.record(ledger, attacker.player, parts.assessed);
  ok(ledger[0].attacks === 1 && ledger[0].destroyed === result.dmgToDefender && ledger[0].lost === result.dmgToAttacker &&
    ledger[1].lost === result.dmgToDefender, "ledger gives the attack to the attacker and the losses to the defender");

  var mismatched = false;
  try {
    COMBAT.shotReport({type: attacker.type, strength: aBefore, exp: aExp},
      {type: defender.type, strength: dBefore, exp: dExp}, result.preview.attacker.ap, result.preview.defender.da,
      Object.assign({}, result.attackDamage, {casualties: 99}), true);
  } catch (error) { mismatched = /do not match/.test(error.message); }
  ok(mismatched, "a roll report rejects casualties that disagree with the recorded coefficient");
  var silent = COMBAT.shotReport({type: defender.type, strength: dBefore, exp: dExp},
    {type: attacker.type, strength: aBefore, exp: aExp}, 0, 0, {casualties: 0, coefficientPercent: null}, false);
  ok(!silent.enabled && silent.losses === 0 && silent.verdict === "no roll", "a disabled counter is not a roll");

  var far = new ENGINE.Game({name: "Indirect", grid: ["........", "........", "........"],
    units: [{t: "HADRIAN", o: 0, x: 1, y: 1}, {t: "POLAR", o: 1, x: 4, y: 1}]}, {seed: 3});
  var gun = far.units[0], target = far.units[1], gunBefore = gun.strength, targetBefore = target.strength;
  var ranged = far.attack(gun, target);
  var rangedParts = REPORT.resultParts(gun, target, ranged, gunBefore, targetBefore);
  ok(!ranged.preview.counter && !rangedParts.assessed.counter.enabled && rangedParts.math.indexOf("No counterattack") >= 0,
    "indirect fire reports no counter roll");
  [0,1].forEach(function (side) {
    ["HADRIAN","LYNX"].forEach(function (type) {
      var indirect=new ENGINE.Game({name:"One-way",grid:[".....",".....","....."],units:[
        {t:type,o:side,x:1,y:1},{t:"BISON",o:1-side,x:3,y:1}]},{seed:3});
      var a=indirect.units[0],d=indirect.units[1],html=REPORT.previewHtml(a,d,COMBAT.preview(indirect,a,d)).screen;
      ok(html.includes("battle-one-way")&&html.includes("no counterattack")&&html.includes(side?">←</span>":">→</span>"),
        type+" remote fire points only toward its target for faction "+side);
    });
  });
  var again = REPORT.present(rangedParts.snapshot);
  ok(again.scene.indexOf("destroyed") >= 0 && again.math.indexOf(rangedParts.assessed.attack.coefficientPercent + "%") >= 0,
    "a stored battle snapshot renders the same roll without the live squads");
};
