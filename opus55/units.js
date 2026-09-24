'use strict';
/* Single source of truth for the pack: prose, engine definitions, the stock
 * gap each unit fills (as a test over the stock roster), and the exchange
 * claims that build.js prints and verify.js asserts. README.md, index.html
 * and custom-units.json are generated from this file by build.js. */

const FOOT_TEAMS = ['CHARLIE', 'KILROY', 'MEERKAT', 'HOWLER', 'GECKO'];

const PACK = {
  title: 'Fifteen gap-filling units',
  author: 'Claude Opus 5.5',
  summary: 'Fifteen proposal units for this Nectaris remake. Each fills a combination the 23-unit stock roster ' +
    'leaves empty: a chassis, firing band or turn rule that no stock unit has, checked as a test over `js/data-units.js`. ' +
    'Every unit uses only rules the engine already implements, so the set loads today as custom units. ' +
    'Exchange numbers come from the real combat code and are recomputed on every build. ' +
    'This is a proposal: nothing here changes the playable roster, the maps or the renderer.',
  review: [
    ['What the earlier study did',
      '`tools/design-space` samples 240,000 ground-unit configurations, scores them in a weighted feature space ' +
      '(firepower 25%, armor 15%, firing bands 20%, terrain access 20%, rules 20%) and repeatedly picks the configuration ' +
      'farthest from every existing unit. Names, roles and fiction were assigned after the numbers were chosen. ' +
      'It is reproducible, states its own limits, screens for dominance and draws its sprites with the stock pipeline; ' +
      'this set keeps those four practices.'],
    ['Distance is not usefulness',
      'Distance from existing units measures novelty, not whether a map has a use for the unit; its README says the procedure ' +
      '\u201ctends to select unusual boundary cases\u201d. Seven of its fifteen designs have move 0 or 1, against two of the 23 stock ' +
      'units (Atlas and Trigger). Badger has wheels and move 1 and plains cost wheels 2, so it moves only along roads, bridges and ' +
      'buildings; the README lists it as mostly road-bound and says Midge may not justify a scenario slot.'],
    ['A linear budget misprices defense',
      'Its power screen counts defense linearly (def/80). Damage per point of attack is (100 \u2212 defense \u2212 terrain)%, with ' +
      'defense capped at 100, so on plains raising defense from 20 to 40 cuts damage taken by about a quarter while raising it ' +
      'from 60 to 80 cuts it by more than half. Tortoise and Rampart (defense 80, tracks) reach the cap on wasteland, where an attack ' +
      'that does not surround them does no damage. The README notes that the 80-defense designs can reach the cap; the budget ' +
      'prices them as if they could not.'],
    ['Weights and scope',
      'The block weights are declared, not derived from play, and the README\u2019s sensitivity check shows the first pick changes ' +
      'when the rule block is emphasized. The search covered ground units only and selected no carrier, and none of the fifteen ' +
      'is in the Mule\u2019s whitelist, so only a Pelican can lift them. The README states that map usage, unit synergy and combat ' +
      'outcomes were not modeled; this set measures map usage (census) and outcomes (exchange tables), and brings carriers for its own foot teams.'],
    ['Readability',
      'Marten combines three rules no stock unit combines: a wheeled capturer that moves after attacking and carries anti-air 85 ' +
      'at exactly two hexes. A player cannot read that from the map. Nine of the fifteen sprites share the same diagonal striped ' +
      'launcher rail, and Tortoise and Rampart are both long boxes on tracks.'],
  ],
  method: [
    ['Start from the maps', 'Count the terrain every bundled map set uses and where aircraft, carriers, heavy tanks and artillery appear (census below).'],
    ['List the empty cells', 'Lay the stock roster out by chassis (foot, wheels, tracks, air, emplacement), firing band (direct, indirect), ' +
      'turn rule (normal, move-or-fire, retreat after attack) and carrier role. Keep the empty cells that matter on those maps.'],
    ['One decision per unit', 'Each unit gets one sentence of identity and at most one special rule, so its role reads from the icon and the stat line.'],
    ['Existing rules only', 'Only fields the engine already reads. The set loads now through a level\u2019s `customUnits` block or the editor.'],
    ['Tune by exchanges', 'Numbers are set by fights computed with `js/combat.js`: each unit must win the fight it exists for and lose to a named counter. ' +
      'build.js recomputes every printed trade and refuses to write the pages if a claim or gap test fails; verify.js asserts them again with the engine rules.'],
    ['Screen for dominance', 'No unit may be at least as good as another unit of the same chassis and firing bands in every number and rule.'],
    ['Distinct names and silhouettes', 'Animal names in the stock manner (Bison, Lynx, Pelican), plus the Yeti for the mountain walker; none is used ' +
      'by the stock roster, the official sequels, the earlier study or the parallel packs. Each sprite has its own signature shape.'],
  ],
  families: {
    foot: { name: 'Foot units for ground that tracks cannot enter', tag: 'Foot',
      intro: 'Mountains and valleys are closed to tracks and wheels and make up {tracksClosedRange} of the hexes in each bundled map set (census below). ' +
        'Of the stock ground units, only Charlie and Kilroy can enter them.' },
    lift: { name: 'Carriers', tag: 'Carrier',
      intro: 'Both stock carriers have defense 10. A damaged carrier cuts its passengers to its own remaining strength, and cargo dies with its carrier (`js/engine.js`).' },
    air: { name: 'Air rules', tag: 'Air',
      intro: 'Every stock combat aircraft fights at range 1, never moves after attacking, and takes a counter from any direct-fire anti-air it attacks.' },
    ground: { name: 'Ground rule combinations', tag: 'Ground',
      intro: 'Rule combinations the stock ground roster never uses: indirect anti-air that moves and fires, direct fire that must stand still, ' +
        'a fixed gun, and armed wheeled vehicles.' },
  },
  aiNotes: [
    'Base defense only watches Pelicans. `threatenedBase` in `js/ai.js` reacts to an enemy `PELICAN` carrying a capturer; a Stork, Wombat or Mule airlift or ' +
      'drive toward a base does not trigger it. If Stork enters play, that test should look for any loaded carrier within reach instead of the Pelican ID.',
    'Stationary units deploy at the first open factory exit. `deployOneFactory` has a firing-band rule only for the Atlas; a Snapper, like the stock Trigger, ' +
      'can be deployed where it permanently blocks one of its own factory\u2019s six exits.',
    'Carrier planning is general. `planTransport` and `boardOnePassenger` accept any passenger that `canLoad` allows, capturers first, so Wombat, Stork and Camel ' +
      'need no AI code. The CPU boards stationary cargo (Atlas, Trigger, Snapper) only from factories.',
    'Mule and Pelican whitelists are unchanged. The Mule does not accept Meerkat, Howler or Gecko; the Pelican (no whitelist) accepts every non-air ground unit, including Snapper.',
    'Apex turn time grows with unit count. On a 42-unit test map one apex turn took 143 s with this set and 126 s with stock units of the same chassis ' +
      'in their places; on the largest stock maps (25 and 26 units) it took 13 to 29 s. Measured once on 2026-09-23 on the development machine, not ' +
      'recomputed by build.js. Keep maps that use this set near stock unit counts.',
  ],
  engineNotes: [
    'In-game art is a placeholder. The pack\u2019s sprites are review art; the renderer draws each unit with the stock sprite named in its `sprite` field ' +
      '(`spriteIdFor` in `js/render.js`), which shows the chassis a player must read: foot, vehicle, aircraft or emplacement. `cls` picks the classic and neon ' +
      'vector shape and the combat panel label, for example \u201ctank \u00b7 foot\u201d for the Yeti.',
    'Emplacements can only be unloaded or deployed onto plains, roads, bridges and owned factories (terrain flag `deployable`), so a Snapper in play stands at defense 65 at most. ' +
      'Level authors should not pre-place it on wasteland (defense 90) or hills.',
  ],
};

/* gap.test(stock) returns the stock units that would contradict the gap claim; verify.js requires an empty list. */
const UNITS = [
  {
    id: 'YETI', name: 'Yeti', designation: 'WK-5', family: 'foot', role: 'Armored walker',
    line: 'A light tank on two legs: tank-grade gun and armor on foot, so it can climb where no tracked unit follows.',
    engine: { cls: 'tank', sprite: 'KILROY', move: 4, moveType: 'foot', rngG: 1, rngA: 1, atkG: 55, atkA: 20, def: 35 },
    gap: {
      text: 'Tracks and wheels cannot enter mountains, so mountain fights are left to Charlie and Kilroy (defense 4 and 10). Nothing armored can hold a peak.',
      rule: 'No stock foot unit has ground attack of 50 or more, or defense of 20 or more.',
      test: stock => stock.filter(t => t.moveType === 'foot' && (t.atkG >= 50 || t.def >= 20)),
    },
    play: 'Walk it onto the ridge above a tank lane. On a mountain it adds 40 terrain defense and a Bison attacking it loses more than it kills. ' +
      'It moves 4 on open ground but only 2 hexes through mountains, so send it early. It cannot capture.',
    counters: 'The Giant still wins the exchange. Artillery and the Howler hit it without a counter, and its air attack (20) does little against bombers.',
    ai: 'Standard attack and advance planning.',
    art: 'Box body with a slit visor on two reverse-knee legs, short chest cannon, small roof gun.',
    claims: [
      { a: 'BISON', d: 'YETI', dt: 'mountain', expect: 'defender', note: 'A Bison cannot dislodge it from a mountain.' },
      { a: 'BISON', d: 'KILROY', dt: 'mountain', expect: 'attacker', note: 'The best stock mountain defender loses the same fight.' },
      { a: 'GIANT', d: 'YETI', dt: 'mountain', expect: 'attacker', note: 'The Giant remains its answer.' },
      { a: 'YETI', d: 'KILROY', dt: 'mountain', at: 'mountain', expect: 'attacker', note: 'It wins mountain infantry fights.' },
    ],
  },
  {
    id: 'MEERKAT', name: 'Meerkat', designation: 'IR-4', family: 'foot', role: 'Anti-air team',
    line: 'Shoulder-launched missiles on foot: the first anti-air that can stand on a mountain.',
    engine: { cls: 'antiair', sprite: 'CHARLIE', move: 3, moveType: 'foot', rngG: 1, rngA: 1, atkG: 10, atkA: 60, def: 10 },
    gap: {
      text: 'The Seeker and the Hawkeye run on tracks, so infantry in the mountains has no air cover. The best stock foot anti-air attack is 10.',
      rule: 'No stock foot unit has air attack above 10.',
      test: stock => stock.filter(t => t.moveType === 'foot' && t.atkA > 10),
    },
    play: 'Stand it on a peak beside the units it covers. An Eagle that attacks it there loses more than it kills. ' +
      'Its ground attack is 10, so keep it behind the line.',
    counters: 'Anything that shoots ground targets: tanks, artillery, the Howler, even a Gecko. A Hunter still wins the exchange.',
    ai: 'Standard attack and advance planning.',
    art: 'Upright gunner with a steel launcher tube shouldered steeply at the sky; only the seeker head is ordnance yellow.',
    claims: [
      { a: 'EAGLE', d: 'MEERKAT', dt: 'mountain', expect: 'defender', note: 'An Eagle loses the exchange.' },
      { a: 'EAGLE', d: 'CHARLIE', dt: 'mountain', expect: 'attacker', note: 'Stock mountain infantry against the same Eagle.' },
      { a: 'HUNTER', d: 'MEERKAT', dt: 'mountain', expect: 'attacker', note: 'The Hunter still wins.' },
      { a: 'BISON', d: 'MEERKAT', expect: 'attacker', note: 'Tanks crush it in the open.' },
    ],
  },
  {
    id: 'HOWLER', name: 'Howler', designation: 'IM-8', family: 'foot', role: 'Mortar team',
    line: 'A two-man mortar: indirect fire at 2\u20133 hexes from ground no gun carriage can reach.',
    engine: { cls: 'artillery', sprite: 'KILROY', move: 3, moveType: 'foot', rngG: 3, rngA: 0, atkG: 45, atkA: 0, def: 10, moveOrFire: true },
    gap: {
      text: 'Every stock unit with indirect fire (Hadrian, Octopus, Atlas, Lynx, Hawkeye) runs on tracks or sits still, so there is no indirect fire inside mountain terrain.',
      rule: 'No stock foot unit has an indirect band (range above 1).',
      test: stock => stock.filter(t => t.moveType === 'foot' && (t.rngG > 1 || t.rngA > 1)),
    },
    play: 'Keep it one ridge behind the front and shell what the enemy parks on the far slope; indirect fire draws no counter. ' +
      'It moves or fires in a turn, never both, so set it up a turn ahead.',
    counters: 'Anything that reaches it. Its band starts at 2, so an adjacent attacker takes no return fire, and it has no air attack.',
    ai: 'Handled as a ranged move-or-fire unit: it activates early, shoots only from where it stands, and its advance prefers hexes outside enemy zones of control.',
    art: 'Kneeling loader holding a shell beside a thick steel tube on a baseplate with a short bipod.',
    claims: [
      { a: 'HOWLER', d: 'KILROY', dt: 'mountain', at: 'mountain', expect: 'noCounter', note: 'Shells mountain infantry with no return fire.' },
      { a: 'HOWLER', d: 'YETI', dt: 'mountain', at: 'mountain', expect: 'noCounter', note: 'Also the answer to an entrenched Yeti.' },
      { a: 'KILROY', d: 'HOWLER', expect: 'noCounter', note: 'Defenseless when reached.' },
    ],
  },
  {
    id: 'GECKO', name: 'Gecko', designation: 'IL-3', family: 'foot', role: 'Mountain raiders',
    line: 'Fast light infantry that strikes and steps back: the buggy\u2019s hit-and-run rule on foot.',
    engine: { cls: 'infantry', sprite: 'CHARLIE', move: 5, moveType: 'foot', rngG: 1, rngA: 1, atkG: 40, atkA: 10, def: 10, moveAfterAttack: true },
    gap: {
      text: 'Only the Rabbit and the Lynx may move after attacking, and both run on tracks. Nothing can raid through mountains and withdraw.',
      rule: 'No stock foot unit may move after attacking.',
      test: stock => stock.filter(t => t.moveType === 'foot' && t.moveAfterAttack),
    },
    play: 'Attack from a ridge, then spend the remaining movement to step back onto a mountain or out of reach. ' +
      'Artillery cannot answer an adjacent attacker, so Geckos hunt Hadrians and Octopi parked at the foot of a range. They cannot capture.',
    counters: 'Tanks on open ground and any indirect fire; defense 10 does not survive a direct hit.',
    ai: 'After an attack the CPU spends the leftover movement on the reachable hex farthest from the nearest enemy, as for buggies.',
    art: 'Soldier in a forward lunge with a tall mountain rucksack and bedroll, carbine held low.',
    claims: [
      { a: 'GECKO', d: 'HADRIAN', expect: 'noCounter', note: 'Artillery cannot fire back at an adjacent raider.' },
      { a: 'GECKO', d: 'CHARLIE', expect: 'attacker', note: 'Beats stock infantry.' },
      { a: 'BISON', d: 'GECKO', expect: 'attacker', note: 'Loses to tanks in the open.' },
    ],
  },
  {
    id: 'WOMBAT', name: 'Wombat', designation: 'AP-6', family: 'lift', role: 'Armored carrier',
    line: 'A tracked troop carrier with armor, so foot teams arrive at strength.',
    engine: { cls: 'transport', sprite: 'MULE', move: 6, moveType: 'treads', rngG: 1, rngA: 1, atkG: 20, atkA: 10, def: 50, cargo: 1, cargoTypes: FOOT_TEAMS },
    gap: {
      text: 'Every shot at a Mule is a shot at its squad: damage to a carrier cuts its passengers to the carrier\u2019s remaining strength. ' +
        'Both stock carriers have defense 10 and neither runs on tracks.',
      rule: 'No stock ground carrier has defense above 10 or runs on tracks.',
      test: stock => stock.filter(t => t.cargo && t.moveType !== 'air' && (t.def > 10 || t.moveType === 'treads')),
    },
    play: 'Carry a Kilroy, Meerkat or Howler across open ground under fire and unload at the foot of the hills. ' +
      'Six moves on tracks keeps pace with a Bison. Its guns (20/10) finish damaged infantry; they are not for fighting.',
    counters: 'Heavy tanks and artillery still stop it. It carries one team and loads or unloads once per turn.',
    ai: 'Plans transport first, like the Mule, and uses normal attack planning only when it has no transport task.',
    art: 'Tall troop box on tracks with a sloped glacis, three firing ports and a small gun cupola; no turret.',
    claims: [
      { a: 'BISON', d: 'MULE', expect: 'attacker', note: 'A Bison against a loaded Mule.' },
      { a: 'BISON', d: 'WOMBAT', expect: 'attacker', note: 'The same Bison removes about half as much.' },
      { a: 'KILROY', d: 'WOMBAT', expect: 'even', note: 'A Kilroy attacking it trades about evenly.' },
    ],
    compare: [{ kills: 'BISON>WOMBAT', of: 'BISON>MULE', ratio: [0.4, 0.6], text: 'about half as much' }],
  },
  {
    id: 'STORK', name: 'Stork', designation: 'HT-2', family: 'lift', role: 'Assault helicopter',
    line: 'An armed, armored troop helicopter: airlift for foot teams with a door gun and defense 30.',
    engine: { cls: 'transport', sprite: 'PELICAN', move: 8, moveType: 'air', rngG: 1, rngA: 1, atkG: 30, atkA: 10, def: 30, cargo: 1, cargoTypes: FOOT_TEAMS },
    gap: {
      text: 'The Pelican is the only air carrier: unarmed, defense 10. An airlift into a defended landing zone loses the passenger with the carrier.',
      rule: 'No stock air carrier has any attack or defense above 10.',
      test: stock => stock.filter(t => t.cargo && t.moveType === 'air' && (t.atkG > 0 || t.atkA > 0 || t.def > 10)),
    },
    play: 'Lift a Charlie or a Kilroy over a mountain range to a thinly held factory. It carries foot teams only; heavy loads stay with the Pelican or the Camel.',
    counters: 'Anti-air of every kind and fighters; a Seeker still wins the exchange.',
    ai: 'Plans transport first. The CPU\u2019s base-defense trigger does not recognize it (see AI notes).',
    art: 'Long fuselage with a window row and door gunner under two separate crossed rotors, the rear one higher.',
    claims: [
      { a: 'SEEKER', d: 'PELICAN', expect: 'noCounter', note: 'A Seeker against a loaded Pelican.' },
      { a: 'SEEKER', d: 'STORK', expect: 'attacker', note: 'The same Seeker kills less and takes return fire.' },
      { a: 'KILROY', d: 'STORK', expect: 'defender', note: 'Infantry cannot contest its landing.' },
      { a: 'STORK', d: 'CHARLIE', expect: 'attacker', note: 'The door gun clears a landing zone.' },
    ],
    compare: [{ kills: 'SEEKER>STORK', of: 'SEEKER>PELICAN', ratio: [0, 0.95], text: 'kills less' }],
  },
  {
    id: 'CAMEL', name: 'Camel', designation: 'HX-8', family: 'lift', role: 'Heavy transporter',
    line: 'A road tractor with a low trailer: heavy tracked units and emplacements at road speed.',
    engine: { cls: 'transport', sprite: 'MULE', move: 8, moveType: 'wheels', rngG: 0, rngA: 0, atkG: 0, atkA: 0, def: 20, cargo: 1,
      cargoTypes: ['GIANT', 'POLAR', 'GRIZZLY', 'HADRIAN', 'OCTOPUS', 'ATLAS', 'TRIGGER', 'SNAPPER'] },
    gap: {
      text: 'The Giant moves 2 and the Polar and Grizzly 4, and no ground carrier accepts them. Only the Pelican can lift them: by air, at defense 10, in reach of every anti-air unit.',
      rule: 'No stock ground carrier accepts the Giant, Polar or Grizzly.',
      test: stock => stock.filter(t => t.cargo && t.moveType !== 'air' &&
        (!t.cargoTypes || ['GIANT', 'POLAR', 'GRIZZLY'].some(id => t.cargoTypes.includes(id)))),
    },
    play: 'Run a Giant or a Hadrian 8 hexes down a road and unload it one hex short of the front. Anti-air units cannot touch it. It has no guns; escort it. ' +
      'Its cargo list is tracked units with move 4 or less plus the three emplacements.',
    counters: 'Any ground attacker. Off the road it moves 4 on plains and cannot enter wasteland or mountains.',
    ai: 'Plans transport like any carrier; the CPU loads stationary cargo only from factories.',
    art: 'Long flat trailer with tie-down points and rear ramps behind a tall tractor cab with twin exhaust stacks; many small wheels.',
    claims: [
      { a: 'HAWKEYE', d: 'PELICAN', expect: 'noCounter', note: 'Today\u2019s only heavy lift against a Hawkeye.' },
      { a: 'HAWKEYE', d: 'CAMEL', expect: 'cannot', note: 'Anti-air cannot target it.' },
      { a: 'BISON', d: 'CAMEL', expect: 'noCounter', note: 'Unarmed against tanks.' },
    ],
  },
  {
    id: 'WASP', name: 'Wasp', designation: 'AH-4', family: 'air', role: 'Attack helicopter',
    line: 'A gunship that strikes and pulls back: the buggy\u2019s retreat rule in the air.',
    engine: { cls: 'air', sprite: 'EAGLE', move: 7, moveType: 'air', rngG: 1, rngA: 1, atkG: 55, atkA: 20, def: 25, moveAfterAttack: true },
    gap: {
      text: 'No stock aircraft may move after attacking, so every air strike ends parked next to its target, inside the enemy\u2019s anti-air.',
      rule: 'No stock air unit may move after attacking.',
      test: stock => stock.filter(t => t.moveType === 'air' && t.moveAfterAttack),
    },
    play: 'Hit tanks and artillery, which cannot fire at aircraft (the Giant is the exception), then fly back behind your own Seekers. It moves 7, so start close.',
    counters: 'Seekers and Meerkats at range 1, the Hawkeye and Mantis at range, fighters. Attacking a Seeker loses.',
    ai: 'Retreats after attacking like a buggy.',
    art: 'Slim two-seat gunship with a stepped canopy, one long rotor, chin gun and a stub-wing rocket pod.',
    claims: [
      { a: 'WASP', d: 'BISON', expect: 'noCounter', note: 'Tanks cannot answer it.' },
      { a: 'WASP', d: 'HADRIAN', expect: 'noCounter', note: 'Nor can artillery.' },
      { a: 'WASP', d: 'SEEKER', expect: 'defender', note: 'Attacking anti-air loses.' },
      { a: 'SEEKER', d: 'WASP', expect: 'attacker', note: 'Anti-air wins on its own turn.' },
    ],
  },
  {
    id: 'VULTURE', name: 'Vulture', designation: 'XM-3', family: 'air', role: 'Stand-off drone',
    line: 'A loitering missile carrier: ground attack at 2\u20133 hexes from the air, over any screen.',
    engine: { cls: 'air', sprite: 'HUNTER', move: 9, moveType: 'air', rngG: 3, rngA: 0, atkG: 45, atkA: 0, def: 25 },
    gap: {
      text: 'Every stock aircraft attacks at range 1. A ring of units around a target keeps bombers out, and every air attack on anti-air draws a counter.',
      rule: 'No stock air unit has an indirect ground band.',
      test: stock => stock.filter(t => t.moveType === 'air' && t.rngG > 1),
    },
    play: 'Fly in and fire over the enemy line at the artillery or anti-air behind it; nothing counters indirect fire. It may move and fire in one turn.',
    counters: 'Fighters (it has no air attack), the Hawkeye and Shrike at range, and any anti-air it ends next to.',
    ai: 'Standard planning; the planner scores attacks from every hex in range.',
    art: 'Planform drone with a very long straight wing, slim body, V-tail and two heavy missiles on inboard pylons.',
    claims: [
      { a: 'VULTURE', d: 'SEEKER', expect: 'noCounter', note: 'Strikes anti-air without a counter.' },
      { a: 'VULTURE', d: 'HAWKEYE', expect: 'noCounter', note: 'Including the Hawkeye.' },
      { a: 'FALCON', d: 'VULTURE', expect: 'noCounter', note: 'Fighters kill it.' },
    ],
  },
  {
    id: 'SHRIKE', name: 'Shrike', designation: 'XF-6', family: 'air', role: 'Missile interceptor',
    line: 'An interceptor with air-to-air missiles at 2\u20133 hexes: kills bombers without taking their return fire.',
    engine: { cls: 'air', sprite: 'FALCON', move: 10, moveType: 'air', rngG: 0, rngA: 3, atkG: 0, atkA: 60, def: 20 },
    gap: {
      text: 'The Falcon is the only dedicated fighter and fights at range 1, where a Hunter (air attack 70) shoots back and wins.',
      rule: 'No stock air unit has an indirect air band.',
      test: stock => stock.filter(t => t.moveType === 'air' && t.rngA > 1),
    },
    play: 'Pick off Hunters and Eagles from two hexes. A Falcon that reaches it wins easily, so keep ground units between them.',
    counters: 'Falcons and every direct-fire anti-air unit: it cannot shoot back at range 1. No ground attack.',
    ai: 'Standard planning.',
    art: 'Forward-swept wings, canards and twin fins; missiles on the wing rails.',
    claims: [
      { a: 'FALCON', d: 'HUNTER', expect: 'defender', note: 'The stock fighter loses to a Hunter.' },
      { a: 'SHRIKE', d: 'HUNTER', expect: 'noCounter', note: 'The Shrike takes nothing back.' },
      { a: 'FALCON', d: 'SHRIKE', expect: 'noCounter', note: 'A Falcon that reaches it wins.' },
    ],
  },
  {
    id: 'MANTIS', name: 'Mantis', designation: 'SM-5', family: 'ground', role: 'Mobile SAM',
    line: 'Surface-to-air missiles that fire on the move: 2\u20133 hex air defense that keeps pace with the tanks.',
    engine: { cls: 'antiair', sprite: 'HAWKEYE', move: 5, moveType: 'treads', rngG: 0, rngA: 3, atkG: 0, atkA: 60, def: 30 },
    gap: {
      text: 'The Hawkeye\u2019s 2\u20135 air band is move-or-fire, so it cannot advance and shoot in one turn; the Seeker fights only adjacent.',
      rule: 'No stock unit has an indirect air band without move-or-fire.',
      test: stock => stock.filter(t => t.rngA > 1 && t.atkA > 0 && !t.moveOrFire),
    },
    play: 'Advance one hex behind the tank line. Aircraft that come to strike the tanks are in its 2\u20133 band, and it may move and fire in the same turn; ' +
      'an aircraft that gets adjacent to it is unanswered.',
    counters: 'Anything on the ground: with no ground attack it never counters a ground attacker. It cannot hit an adjacent aircraft either.',
    ai: 'Handled as a ranged unit that may move and fire.',
    art: 'Tracked chassis with a tall vertical-launch canister block at the rear, missile caps on the lid, small driver cab.',
    claims: [
      { a: 'EAGLE', d: 'SEEKER', expect: 'even', note: 'Stock anti-air trades evenly with an Eagle.' },
      { a: 'MANTIS', d: 'EAGLE', expect: 'noCounter', note: 'The Mantis fires first and takes nothing back.' },
      { a: 'EAGLE', d: 'MANTIS', expect: 'noCounter', note: 'An Eagle that reaches it is unanswered.' },
      { a: 'BISON', d: 'MANTIS', expect: 'noCounter', note: 'Defenseless against ground attack.' },
    ],
  },
  {
    id: 'SNAPPER', name: 'Snapper', designation: 'PB-1', family: 'ground', role: 'Pillbox',
    line: 'A concrete gun emplacement that counter-punches at 60: it holds a road junction or a factory approach.',
    engine: { cls: 'tank', sprite: 'TRIGGER', move: 0, moveType: 'treads', rngG: 1, rngA: 1, atkG: 60, atkA: 30, def: 60, placeByTransport: true },
    gap: {
      text: 'The two stock emplacements are the Atlas (indirect fire, defense 20) and the Trigger (no weapon). Nothing fixed shoots back at an attacker.',
      rule: 'No stock stationary unit has a direct-fire band.',
      test: stock => stock.filter(t => !t.move && ((t.rngG === 1 && t.atkG > 0) || (t.rngA === 1 && t.atkA > 0))),
    },
    play: 'Carry it with a Camel or Pelican, or deploy it from a factory, and drop it where the enemy must pass. ' +
      'It can only be set down on plains, roads, bridges or an owned factory, and it never moves again.',
    counters: 'Artillery and the Vulture hit it without a counter; the Giant wins the exchange; any unit can go around it.',
    ai: 'Deployed at the first open factory exit and never moved (see AI notes).',
    art: 'Low faceted concrete slab with a dark firing slit and barrel, a periscope on the roof and a sandbag berm around its foot.',
    claims: [
      { a: 'BISON', d: 'SNAPPER', expect: 'defender', note: 'A medium tank loses the attack.' },
      { a: 'GRIZZLY', d: 'SNAPPER', expect: 'defender', note: 'So does a Grizzly.' },
      { a: 'GIANT', d: 'SNAPPER', expect: 'attacker', note: 'The Giant cracks it.' },
      { a: 'HADRIAN', d: 'SNAPPER', expect: 'noCounter', note: 'Artillery is the safe answer.' },
    ],
  },
  {
    id: 'PIKE', name: 'Pike', designation: 'TD-8', family: 'ground', role: 'Tank destroyer',
    line: 'A turretless ambush gun: the heaviest direct fire in the set, but only from where it already stands.',
    engine: { cls: 'tank', sprite: 'POLAR', move: 5, moveType: 'treads', rngG: 1, rngA: 0, atkG: 80, atkA: 0, def: 50, moveOrFire: true },
    gap: {
      text: 'Every stock direct-fire unit may move and fire; move-or-fire exists only on indirect guns and the Hawkeye. No ambusher trades mobility for a heavier gun.',
      rule: 'No stock unit combines a direct-fire band with move-or-fire.',
      test: stock => stock.filter(t => t.moveOrFire && ((t.rngG === 1 && t.atkG > 0) || (t.rngA === 1 && t.atkA > 0))),
    },
    play: 'Park it at a choke point before the enemy arrives. A tank that attacks it takes an 80-attack counter; one that stops next to it is shot on the next turn.',
    counters: 'Artillery and aircraft (it has no air attack). Flank it: it cannot move and attack in the same turn. The Giant still wins.',
    ai: 'Handled as a move-or-fire unit: it activates early, fires only at targets already adjacent, and its advance prefers hexes outside enemy zones of control.',
    art: 'Low hull on long tracks with a fixed casemate, sloped front plate, box mantlet and the longest barrel in the set.',
    claims: [
      { a: 'GRIZZLY', d: 'PIKE', expect: 'defender', note: 'A Grizzly attacking it loses.' },
      { a: 'TITAN', d: 'PIKE', expect: 'defender', note: 'So does a Titan.' },
      { a: 'GIANT', d: 'PIKE', expect: 'attacker', note: 'The Giant wins.' },
      { a: 'HADRIAN', d: 'PIKE', expect: 'noCounter', note: 'Artillery is the safe answer.' },
    ],
  },
  {
    id: 'HOUND', name: 'Hound', designation: 'AC-2', family: 'ground', role: 'Armored car',
    line: 'A six-wheeled armored car: ten road hexes per turn to screen flanks and catch soft targets.',
    engine: { cls: 'buggy', sprite: 'RABBIT', move: 10, moveType: 'wheels', rngG: 1, rngA: 1, atkG: 40, atkA: 20, def: 30 },
    gap: {
      text: 'The stock wheeled units are the Panther (infantry, defense 8) and the Mule (carrier). No armed wheeled vehicle uses the road network.',
      rule: 'No stock wheeled unit has ground attack above 10.',
      test: stock => stock.filter(t => t.moveType === 'wheels' && t.atkG > 10),
    },
    play: 'Race down roads to catch artillery, infantry and carriers, or close a gap in the line with its zone of control. Off the road it slows to 5 hexes on plains and 2 on hills.',
    counters: 'Any tank; the Rabbit wins the trade.',
    ai: 'Standard attack and advance planning.',
    art: 'Boat-shaped hull on three exposed axles with a small flat turret and short autocannon.',
    claims: [
      { a: 'HOUND', d: 'CHARLIE', expect: 'attacker', note: 'Catches infantry.' },
      { a: 'HOUND', d: 'HADRIAN', expect: 'noCounter', note: 'Catches artillery.' },
      { a: 'RABBIT', d: 'HOUND', expect: 'attacker', note: 'Loses to the Rabbit.' },
      { a: 'BISON', d: 'HOUND', expect: 'attacker', note: 'Loses to tanks.' },
    ],
  },
  {
    id: 'SQUID', name: 'Squid', designation: 'RT-7', family: 'ground', role: 'Rocket truck',
    line: 'Rocket artillery on a truck: a 2\u20134 hex salvo that relocates along roads at 7 hexes a turn.',
    engine: { cls: 'artillery', sprite: 'OCTOPUS', move: 7, moveType: 'wheels', rngG: 4, rngA: 0, atkG: 55, atkA: 0, def: 15, moveOrFire: true },
    gap: {
      text: 'The stock guns that reach 3 hexes or more (Hadrian, Octopus, Atlas) run on tracks at move 4 or sit still; the Lynx moves 6 but reaches only 2. ' +
        'No artillery can shift across a road network between salvos.',
      rule: 'No stock wheeled unit has an indirect band, and no stock unit whose ground band reaches 3 or more moves more than 4.',
      test: stock => stock.filter(t => (t.moveType === 'wheels' && (t.rngG > 1 || t.rngA > 1)) || (t.rngG >= 3 && t.atkG > 0 && t.move > 4)),
    },
    play: 'Fire one turn, drive to the next road junction the following turn. It fires or moves, never both.',
    counters: 'Anything that reaches it: defense 15, and its band starts at 2. The Octopus outguns it in a counter-battery duel.',
    ai: 'Handled as a ranged move-or-fire unit, like the Hadrian.',
    art: 'Truck with a raised, angled rocket pack whose front face shows yellow tube mouths.',
    claims: [
      { a: 'SQUID', d: 'HADRIAN', expect: 'noCounter', note: 'Salvo against artillery.' },
      { a: 'SQUID', d: 'BISON', expect: 'noCounter', note: 'Salvo against tanks.' },
      { a: 'HOUND', d: 'SQUID', expect: 'noCounter', note: 'Defenseless when reached.' },
      { a: 'OCTOPUS', d: 'SQUID', expect: 'noCounter', note: 'An Octopus salvo on it.' },
      { a: 'SQUID', d: 'OCTOPUS', expect: 'noCounter', note: 'Its salvo on an Octopus removes less: it loses a counter-battery duel.' },
    ],
    compare: [{ kills: 'SQUID>OCTOPUS', of: 'OCTOPUS>SQUID', ratio: [0, 0.95], text: 'removes less' }],
  },
];

/* Engine definition object keyed by ID, the exact shape a level's customUnits block takes. */
function customUnits() {
  const out = {};
  for (const u of UNITS) out[u.id] = Object.assign({ name: u.name + ' ' + u.designation }, JSON.parse(JSON.stringify(u.engine)));
  return out;
}

module.exports = { PACK, UNITS, FOOT_TEAMS, customUnits };
