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
  var parts = REPORT.resultParts(attacker, defender, result, aBefore, dBefore, game);
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
  var pvNow = result.preview, screenText = parts.screen, count = function (html, word) { return html.split(word).length - 1; };
  function has(text) { return screenText.includes(text); }
  var attackTotal = Math.floor(pvNow.attacker.ap * COMBAT.EXP_DAMAGE[aExp] / 100) * aBefore;
  ok(has("battle-formation-left") && has("battle-formation-right") && has("data-exp='" + attacker.exp + "'") &&
    has("<b>" + attackTotal + "</b><i>ATK</i>") && has("<i>DEF</i><b>" + pvNow.defender.da + "</b>") && has("<b>×1.20</b><small>exp</small>"),
    "the face-off ends on the battle's attack total, experience included, against the target's defense per machine");
  ok(has("roll ×" + parts.assessed.attack.coefficientPercent / 100 + "</em>") && has("roll ×" + parts.assessed.counter.coefficientPercent / 100 + "</em>") &&
    count(screenText, "cp-actual") === 2,
    "once rolled, each arrow names its roll and each side's loss chart marks the losses it took");
  var shownText = screenText.slice(screenText.indexOf("battle-numbers")).replace(/<[^>]+>/g, " ");
  ok(!has("battle-count") && !has("· attacking") && !/Union|Xenon|Machines lost|Per machine|Squad|no counterattack/.test(shownText) &&
    parts.outcome === REPORT.faction(attacker.player) + " attack · " + result.dmgToDefender + " destroyed · " + result.dmgToAttacker + " lost",
    "no role label, machine-count box, team name, per-machine or squad line on the screen; the status line lives in the control bar");
  var counting = REPORT.screenHtml(attacker, defender, pvNow, aBefore, dBefore, aBefore, dBefore, aExp, dExp, undefined, undefined,
    "ready", {count: 0, area: REPORT.battleArea(game, attacker, defender)});
  ok(counting.includes("bn-term-base") && !counting.includes("bn-term-terrain") && !counting.includes("bn-term-experience") &&
    count(counting, "bn-chart bn-hidden") === 2, "at the start of the count only the base is shown and the loss charts are held back");
  var readyScreen = REPORT.previewHtml(attacker, defender, pvNow, game).screen;
  ok(count(readyScreen, "avg <b>") === 2 && !readyScreen.includes("roll ×") && !readyScreen.includes("cp-actual"),
    "before the roll each loss chart shows its chances and average, and no roll or result");
  var ring = new ENGINE.Game({name: "Effects", grid: Array(7).fill("..........."), units: [
    {t: "BISON", o: 0, x: 5, y: 2}, {t: "BISON", o: 1, x: 5, y: 3}, {t: "BISON", o: 0, x: 5, y: 4},
    {t: "BISON", o: 1, x: 5, y: 1}]}, {seed: 7});
  var ringPreview = COMBAT.preview(ring, ring.units[0], ring.units[1]);
  ok(ringPreview.surrounded && ringPreview.defender.da === Math.floor((40 + 20 + 5) / 2),
    "a surrounded target's defense is (40 + 20 support + 5 terrain) halved");
  [0,1].forEach(function (initiator) {
    var fight = new ENGINE.Game({name:"Faction sides",grid:["....",".h-.","...."],units:[
      {t:"BISON",o:0,x:1,y:1,str:6,exp:3},{t:"POLAR",o:1,x:2,y:1,str:7,exp:7}]},{seed:7});
    fight.currentPlayer=initiator;
    var a=fight.units[initiator],d=fight.units[1-initiator],a0=a.strength,d0=d.strength;
    var before=REPORT.previewHtml(a,d,COMBAT.preview(fight,a,d),fight).screen;
    var out=fight.attack(a,d),report=REPORT.resultParts(a,d,out,a0,d0,fight),screen=report.screen,area=REPORT.battleArea(fight,a,d);
    [before,screen].forEach(function (html) {
      var heads=html.slice(html.indexOf("battle-heading"),html.indexOf("battle-field"));
      var left=html.slice(html.indexOf("battle-formation-left"),html.indexOf("battle-formation-right"));
      var right=html.slice(html.indexOf("battle-formation-right"),html.indexOf("battle-numbers"));
      var stats=html.slice(html.indexOf("bn-detail"));
      ok(heads.indexOf("data-player='0'")<heads.indexOf("data-player='1'")&&left.includes("Union:")&&!left.includes("data-player='1'")&&
        right.includes("Xenon:")&&!right.includes("data-player='0'")&&stats.indexOf("data-player='0'")<stats.indexOf("data-player='1'"),
        "Union stays left and Xenon right, including stats and surviving icons, when side "+initiator+" attacks");
      ok(!heads.includes("attacking")&&!heads.includes("battle-count"),"headings carry only the unit mark and name");
      ok(html.indexOf("battle-ground-hill")<html.indexOf("battle-ground-road")&&
        html.includes("Union on Hills")&&html.includes("Xenon on Road")&&!html.includes("per machine")&&
        count(html,"class='battle-terrain'")===1&&!html.includes("battle-field-lofted"),
        "each faction keeps its terrain; adjacent ground units stand level on one continuous ground");
    });
    var aRank=a.strength>0?a.exp:out.attackerExpBefore,dRank=d.strength>0?d.exp:out.defenderExpBefore;
    ok(report.snapshot.aExpAfter===aRank&&report.snapshot.dExpAfter===dRank&&
      screen.includes("data-exp='"+aRank+"'")&&screen.includes("data-exp='"+dRank+"'")&&!screen.includes("EXP "),
      "experience gains use the battle's actual awards, including the General cap, and none for a destroyed unit");
    var start=REPORT.present(report.snapshot,0).screen,end=REPORT.present(report.snapshot,REPORT.rewardDuration(report.snapshot)).screen;
    ok(start.includes("data-exp='"+out.attackerExpBefore+"'")&&end===screen&&
      REPORT.earnedExperience(3,7,350)===4&&REPORT.earnedExperience(7,8,9999)===8,
      "earned stars reveal one at a time from the original rank, ending at the actual awarded rank");
    ok(!before.includes("unit-star-new"),"a battle preview never claims experience before the attack occurs");
    function headsOf(html){return html.slice(html.indexOf("battle-heading"),html.indexOf("battle-field")).split("class='battle-combatant ").slice(1);}
    function fresh(html){return (html.match(/unit-star-new/g)||[]).length;}
    function pips(html){return (html.match(/class='unit-star(?: |')/g)||[]).length;}
    function places(html){
      var out=[];
      html.replace(/class='unit-star[^']*' style='left:([^%]+)%;top:([^%]+)%/g,function(_,x,y){
        out.push(Math.round(parseFloat(x)/100*16)+","+Math.round(parseFloat(y)/100*16));
      });
      return out.join(" ");
    }
    var at=[[0,1],[0,6],[0,11],[5,3],[5,8],[10,1],[10,6]];
    var heads=headsOf(screen);
    var earned=[0,1].map(function(p){return p===a.player ? aRank-out.attackerExpBefore : dRank-out.defenderExpBefore;});
    var rank=[0,1].map(function(p){return p===a.player ? aRank : dRank;});
    ok(heads.length===2 && [0,1].every(function(p){
        return heads[p].includes("<span class='unit-mark'><canvas") && heads[p].includes("unit-stars") &&
          (rank[p]>=8 ? heads[p].includes("unit-general") && !pips(heads[p]) : pips(heads[p])===rank[p]) &&
          fresh(heads[p])===(rank[p]>=8 && earned[p] ? 1 : earned[p]);
      }) && !screen.includes("Experience gained"),
      "each header shows the unit mark, its whole rank beside the icon; only the earned stars glow");
    ok([0,1,3,4,5,6,7].every(function(n){
      var head=headsOf(REPORT.screenHtml(a,d,out.preview,a0,d0,a.strength,d.strength,+n,0,undefined,undefined,"ready",{area:area}))[a.player];
      return places(head)===at.slice(0,+n).map(function(p){return p.join(",");}).join(" ") &&
        !head.includes("unit-general") && !fresh(head);
    }),"header stars sit at the original box coordinates");
    var most=Math.max(earned[0],earned[1]),at0=REPORT.present(report.snapshot,0).screen;
    ok(!at0.includes("unit-star-new") && (!most || REPORT.present(report.snapshot,350).screen===REPORT.present(report.snapshot,699).screen),
      "new stars follow the reward clock, one rank per 350 ms, and the screen is unchanged between ranks");
    var two=headsOf(REPORT.screenHtml(a,d,out.preview,a0,d0,a.strength,d.strength,5,2,7,2,"result",{area:area}))[a.player];
    ok(fresh(two)===2 && places(two)===at.map(function(p){return p.join(",");}).join(" ") &&
      two.indexOf("animation-delay:-350ms")<two.indexOf("animation-delay:-0ms"),
      "a second new star joins without restarting the first star's glow");
    var promoted=headsOf(REPORT.screenHtml(a,d,out.preview,a0,d0,a.strength,d.strength,6,2,8,2,"result",{area:area}));
    ok(promoted[a.player].includes("unit-general unit-star-new") && !pips(promoted[a.player]) &&
      promoted[a.player].includes("General, 2 newly earned") && !fresh(promoted[d.player]),
      "reaching rank 8 replaces the small stars with the glowing General star");
    var models=screen.slice(screen.indexOf("battle-field"),screen.indexOf("battle-numbers"));
    ok(!models.includes("unit-stars")&&screen.includes("data-exp-glow-from"),
      "formation machines have no stars; earned stars glow only in the header marks");
    var fighting=REPORT.animate(report.snapshot,0),summary=REPORT.animate(report.snapshot,REPORT.fightingDuration(report.snapshot)+REPORT.rewardDuration(report.snapshot));
    var gun={aType:"HADRIAN",ranged:true},lynx={aType:"LYNX",ranged:true},flat={aType:"CHARLIE",ranged:true};
    ok(REPORT.volleyMs(gun)>REPORT.volleyMs(flat)&&REPORT.volleyMs(lynx)===REPORT.volleyMs(gun)&&
      REPORT.volleyMs({aType:"HADRIAN",ranged:false})===REPORT.volleyMs(flat)&&REPORT.fightingDuration(gun)===REPORT.volleyMs(gun)+450,
      "ranged artillery and Lynx volleys last longer than a bullet volley, and the hit waits for the last shell");
    ok(before.includes("data-battle-phase='ready'")&&fighting.screen.includes("data-battle-phase='fighting'")&&
      !fighting.screen.includes("unit-star-new")&&fighting.math===""&&summary.screen===screen&&summary.math===report.math,
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
  var rangedParts = REPORT.resultParts(gun, target, ranged, gunBefore, targetBefore, far);
  ok(!ranged.preview.counter && !rangedParts.assessed.counter.enabled && rangedParts.math.indexOf("No counterattack") >= 0,
    "indirect fire reports no counter roll");
  var shellScreen=REPORT.animate(rangedParts.snapshot,0).screen,count=function(html,word){return html.split(word).length-1;};
  ok(count(shellScreen,"battle-barrel ")===gunBefore&&count(shellScreen,"class='battle-shell")===gunBefore&&
    count(shellScreen,"class='battle-splash")===gunBefore&&!shellScreen.includes("battle-bullet")&&
    !REPORT.animate(rangedParts.snapshot,REPORT.volleyMs(rangedParts.snapshot)).screen.includes("battle-barrel"),
    "ranged artillery fighting shows one tilted barrel, one shell and one splash per machine, and no barrels after the volley");
  var lynxGame=new ENGINE.Game({name:"Lynx",grid:[".....",".....","....."],units:[{t:"LYNX",o:0,x:1,y:1},{t:"BISON",o:1,x:3,y:1}]},{seed:3});
  var lynx=lynxGame.units[0],lynxTarget=lynxGame.units[1],lynxBefore=lynx.strength,lynxTargetBefore=lynxTarget.strength;
  var lynxShot=lynxGame.attack(lynx,lynxTarget),rocketScreen=REPORT.animate(REPORT.resultParts(lynx,lynxTarget,lynxShot,lynxBefore,lynxTargetBefore,lynxGame).snapshot,0).screen;
  ok(count(rocketScreen,"class='battle-rocket")===lynxBefore&&count(rocketScreen,"battle-barrel-launcher")===lynxBefore,
    "a Lynx firing from two hexes launches rockets from tilted launchers");
  // The numbers panel is premade: every state has the same boxes and rows.
  var early=REPORT.animate(rangedParts.snapshot,0).screen,late=REPORT.animate(rangedParts.snapshot,REPORT.fightingDuration(rangedParts.snapshot)+REPORT.rewardDuration(rangedParts.snapshot)).screen;
  var boxes=function(html){return ["class='bn-eq ","class='bn-total ","class='bn-arrow ","class='bn-half'","class='bn-map'","class='bn-chart"].map(function(box){return count(html,box);}).join(":");};
  ok(boxes(early)===boxes(late)&&boxes(late)==="4:4:2:2:2:2",
    "the numbers panel has the same face-off cells, minimaps and chart boxes before and after the roll");
  ok(count(late,"cp-actual")===1&&count(early,"cp-actual")===0&&count(late,"cp-bar")>count(late,"cp-actual"),
    "the rolled loss is marked on exactly one bar of the loss chart, and on none before the roll");
  var chart=late.slice(late.indexOf("class='bn-chart'")),chance=0;
  chart.replace(/cp-pct'>(\d+)</g,function(m,v){chance+=+v;});
  ok(chance>=97&&chance<=103,"a loss chart's percentages add up to 100, allowing for rounding");
  [0,1].forEach(function (side) {
    ["HADRIAN","LYNX"].forEach(function (type) {
      var indirect=new ENGINE.Game({name:"One-way",grid:[".....",".....","....."],units:[
        {t:type,o:side,x:1,y:1},{t:"BISON",o:1-side,x:3,y:1}]},{seed:3});
      var a=indirect.units[0],d=indirect.units[1],html=REPORT.previewHtml(a,d,COMBAT.preview(indirect,a,d),indirect).screen;
      ok(count(html,"bn-arrow-"+(side?"rtl":"ltr"))===1&&count(html,"bn-arrow-none")===1&&count(html,"class='bn-chart bn-chart-none'")===1&&
        !html.includes("no counterattack")&&count(html,"class='battle-terrain'")===2&&html.includes("battle-field-lofted"),
        type+" remote fire: one arrow toward its target, no counter chart, split ground and tilted formations for faction "+side);
    });
  });
  // The engine still awards a destroyed attacker its points; the screen shows none.
  for (var seed = 1, duel, doomed, foe, duelShot; seed < 400; seed++) {
    duel = new ENGINE.Game({name: "Duel", grid: ["....", "....", "...."], units: [
      {t: "GRIZZLY", o: 0, x: 1, y: 1, str: 1}, {t: "GRIZZLY", o: 1, x: 2, y: 1}]}, {seed: seed});
    doomed = duel.units[0]; foe = duel.units[1];
    duelShot = duel.attack(doomed, foe);
    if (doomed.strength === 0 && duelShot.dmgToDefender > 0) break;
  }
  var duelSnap = REPORT.resultParts(doomed, foe, duelShot, 1, 8, duel).snapshot;
  ok(doomed.strength === 0 && doomed.exp > 0 && duelSnap.aExpAfter === 0 &&
    !REPORT.present(duelSnap, REPORT.rewardDuration(duelSnap)).screen.split("battle-combatant-right")[0].includes("unit-star-new"),
    "a unit destroyed in its own attack shows no newly earned stars");
  var again = REPORT.present(rangedParts.snapshot);
  ok(again.scene.indexOf("destroyed") >= 0 && again.math.indexOf(rangedParts.assessed.attack.coefficientPercent + "%") >= 0,
    "a stored battle snapshot renders the same roll without the live squads");
};
