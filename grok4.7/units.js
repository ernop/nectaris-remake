'use strict';
/* Fifteen ground-unit proposals for the 1989 rules.
 * Experimental. Not merged into the playable roster.
 * Edit this file, then run: node grok4.7/build.js
 */
const intro = [
  'Fifteen ground units for the 1989 rules. Each one is built around a decision the stock roster does not offer. They are proposals: the playable roster, the maps, and Mule’s whitelist stay as they are.',
  'The numbers are ones the roster already uses. Range 1 shoots the adjacent hex and can counter. Range 2 or more shoots from hex 2 through that number, and the adjacent hex is a blind spot with no counter. Every unit projects a zone of control. Squads are 1–8. Pelican can carry all fifteen. Mule can carry none of them.'
];

const method = [
  'The other proposal, in tools/design-space, draws stat lines and keeps the fifteen furthest from the occupied roster. Its own notes say that distance prefers boundaries, and they name four results that need a trial before a scenario slot: Midge at air attack 10, Badger at one wheeled movement point, Hydra at very high firepower on both domains, and the defense-80 designs, which meet the defense cap of 100 once terrain is added. No transport made that top fifteen. Names were assigned after the numbers.',
  'This set uses those notes as limits. Foot defense stays at 10, because a mountain already adds 40 and a higher base turns a team into a fort. No gun is given the specialist’s attack on both domains at once. No wheeled unit is given a single movement point. The carrier is here because getting infantry across wasteland is a missing decision, even though a carrier sits close to Mule in a pure stat distance.',
  'Jobs and numbers were chosen together. Each unit adds one privilege and pays with a limit the stock unit in that job does not have. The stacking screen from the numerical study is reported beside each unit as a comparison figure only. It is not a win rate, and it does not account for maps, pairing, or who shoots first.',
  'Defense is added to terrain, then capped at 100, and only then does surround halve it. Indirect fire still receives terrain defense. It does not receive support, surround, or a counterattack. Unloading still happens on plains, roads, bridges, and owned factories. Trigger and Atlas are left out of some elimination counts by their own ids; a placed proposal would count.',
  'Nothing here changes capture, zones of control, damage, experience, or transport rules. Air units are outside this set. The stock aircraft remain Eagle, Falcon, and Hunter.'
];

const groups = [
  {id: 'foot', title: 'Foot', note: 'Mountains, valleys, and the factory approach'},
  {id: 'road', title: 'Road', note: 'Wheels: fast on roads, taxed everywhere else'},
  {id: 'armor', title: 'Armor', note: 'Tracked vehicles whose job is the contact hex'},
  {id: 'guns', title: 'Guns', note: 'Indirect ground fire, with the adjacent hex blind'},
  {id: 'air', title: 'Air defense', note: 'The rings Seeker and Hawkeye do not share'},
  {id: 'carry', title: 'Carrier', note: 'Foot units across wasteland'}
];

const units = [
  {
    id: 'IBEX', name: 'Ibex GX-41', cls: 'infantry', group: 'foot',
    role: 'Mountain mortar',
    move: 3, moveType: 'foot', atkG: 40, atkA: 0, def: 10, rngG: 3, rngA: 0,
    blurb: 'Foot mortar for mountains and valleys. It fires at hexes 2–3 on the turn it arrives.',
    decision: 'Charlie and Kilroy are the only stock units that can stand on a mountain or in a valley, and both shoot only the adjacent hex. No gun in the roster can sit on that ground.',
    use: 'Ibex walks onto a mountain (cost 2, so a move of 3 still arrives) or spends its move entering a valley, then fires at hexes 2 and 3 in the same turn. Attack 40 is Kilroy’s number, aimed past the contact hex. It harasses a tank on the plain below and it does not take the factory.',
    pay: 'The adjacent hex is blind, so a unit that climbs up next to it receives no return fire. There is no anti-air weapon. Defense is 10; the mountain’s +40 is what keeps it alive, and that same +40 is why the base defense stays at Kilroy’s 10 instead of climbing. Capture stays with Charlie, Kilroy, Pipit, and Oryx.',
    trial: 'Park it on a mountain and shell a Bison on a road at hex 2. Defense on that mountain is 10+40. Then send an Eagle. The aircraft is the answer unless Harrier is on the next hex.',
    beside: 'Kilroy owns the adjacent hex and the factory. Ibex owns hexes 2 and 3 and owns neither the factory nor a countershot.',
    art: 'A small kneeling soldier with a short mortar tube and a bipod. No missile yellow: it is a gun.'
  },
  {
    id: 'HARRIER', name: 'Harrier GX-52', cls: 'infantry', group: 'foot',
    role: 'Mountain anti-air',
    move: 3, moveType: 'foot', atkG: 10, atkA: 50, def: 10, rngG: 1, rngA: 1,
    blurb: 'Foot anti-air for mountains and valleys. The shot is adjacent only, and it does not capture.',
    decision: 'Seeker cannot climb a mountain or enter a valley. Charlie’s air attack is 10, which does not threaten a Falcon. Aircraft strafe foot teams on high ground for almost nothing.',
    use: 'Stand Harrier beside Ibex, or on the mountain approach to a base. An aircraft that comes adjacent to strafe takes an air attack of 50. The ground gun is 10, a sidearm against infantry that walk up.',
    pay: 'It does not capture, so it is not a Kilroy with a better missile. Hexes past 1 are Merlin’s ring, not Harrier’s. Defense 10 means a tank that can reach the hex removes it; tanks cannot enter mountains, so the removal tool there is another gun or an aircraft.',
    trial: 'On a mountain, Harrier’s defense is 50. An adjacent Eagle trades into that. A Falcon has no ground gun; if Harrier shoots first, Falcon still counters, because Falcon’s air range includes hex 1 and its air attack is 90.',
    beside: 'Seeker is the vehicle that owns the adjacent air hex and can also fight on the flat. Harrier is the same ring on ground Seeker cannot enter.',
    art: 'A small standing soldier with two vertical shoulder missiles. Yellow on the warheads.'
  },
  {
    id: 'PIPIT', name: 'Pipit GX-44', cls: 'infantry', group: 'foot',
    role: 'Standoff capturer',
    move: 3, moveType: 'foot', atkG: 40, atkA: 0, def: 10, rngG: 2, rngA: 0,
    capture: true,
    blurb: 'Captures. The missile hits only at hex 2, so a garrison beside the factory is outside the shot.',
    decision: 'Every stock capturer has to stand next to a defender to hurt it, and then takes the counter. There is no capturer whose shot starts at hex 2.',
    use: 'From two hexes out, Pipit fires at attack 40, Kilroy’s gun, and the defender does not counter because the exchange is indirect. On a later turn it walks onto the factory or the enemy base. Foot movement still crosses hills, wasteland, mountains, and valleys.',
    pay: 'There is no retreat after the shot. The turn it stands on the factory, a garrison on an adjacent hex is at range 1 and the missile cannot see it. There is no air weapon. Defense is 10. One capturer gets this privilege; it does not also get the buggies’ escape.',
    trial: 'A defender stands on the factory. Pipit shoots from hex 2. Next turn Pipit enters the factory. If the defender stepped off to an adjacent hex, Pipit has no shot at it that turn. If the defender stayed two hexes from the factory, the missile still reaches.',
    beside: 'Kilroy captures and fights the hex he is touching, at move 2. Pipit captures and fights only hex 2, at move 3.',
    art: 'A small running soldier with one long horizontal missile. Yellow on the nose.'
  },
  {
    id: 'ORYX', name: 'Oryx CBX-3', cls: 'infantry', group: 'road',
    role: 'Road capturer',
    move: 6, moveType: 'wheels', atkG: 30, atkA: 10, def: 20, rngG: 1, rngA: 1,
    capture: true,
    blurb: 'Wheeled capturer with gun 30. Six road hexes; a plain costs 2.',
    decision: 'Panther is the only fast capturer, and its gun is 10. Kilroy can fight and capture, and he walks. A defended road factory has no capturer that both arrives on the road and hits harder than a sidearm.',
    use: 'Send Oryx down a road to a factory held by infantry. Six road hexes, then a direct shot at 30, and it can take the building. The air attack of 10 is the same pea-shooter Panther carries, enough to answer a strafing run with a scratch.',
    pay: 'Move is 6 against Panther’s 9, so Panther still arrives first. A plain costs 2, a hill costs 4, and wasteland, mountains, and valleys are closed. The shot is adjacent, so the defender counters. Defense 20 still loses to a tank. It is a motorcycle, and Burro does not carry it.',
    trial: 'One road, six hexes, a Charlie on the factory. Oryx arrives and shoots at 30. The same distance on plains takes two turns. Panther on that road still gets there with move 9 and shoots at 10.',
    beside: 'Panther is the courier. Oryx is the capturer you send when someone is standing on the building.',
    art: 'A motorcycle: two wheels, a small rider, a forward gun, and a short rear missile.'
  },
  {
    id: 'COYOTE', name: 'Coyote AC-8', cls: 'tank', group: 'road',
    role: 'Road tank',
    move: 8, moveType: 'wheels', atkG: 50, atkA: 0, def: 30, rngG: 1, rngA: 0,
    blurb: 'Wheeled tank. Eight road hexes, gun 50, armor 30. Wasteland is closed.',
    decision: 'Every stock tank is tracked. The only wheeled fighter is Panther, whose job is capture and whose gun is 10. The road net has no tank.',
    use: 'Coyote runs the highway: eight road hexes and a gun of 50, the same ground attack as Bison, and it does not capture, so it can be spent on a fight. On a plain it makes four hexes. On a hill it makes two.',
    pay: 'Wasteland, mountains, and valleys are closed. There is no anti-air gun, so an Eagle strafes it and receives nothing back. Armor is 30, under Slagger’s 50, and the chassis cannot follow a tracked fight off the road. Direct fire means it takes the counter.',
    trial: 'A road race against a Slagger toward a bridge. Coyote has eight hexes to Slagger’s seven, then has to stop being a tank the moment the ground turns to wasteland. An Eagle over the road is unanswered.',
    beside: 'Slagger is the fast tracked tank. Coyote is the fast tank that exists only while the road does. Lenet is the nearest shape on the distance score, because the gun and the armor sit close; the map difference is eight road hexes against five, and a closed wasteland.',
    art: 'An enclosed four-wheel armored car with a turret and a cannon. No missiles and no tracks.'
  },
  {
    id: 'JACKAL', name: 'Jackal MB-9', cls: 'buggy', group: 'road',
    role: 'Road raider',
    move: 9, moveType: 'wheels', atkG: 50, atkA: 10, def: 20, rngG: 1, rngA: 1,
    moveAfterAttack: true,
    blurb: 'Shoots, then spends whatever movement remains. Nine hexes on a road; a plain costs 2.',
    decision: 'Rabbit and Lynx shoot and keep moving, and both pay tracked costs, so the trick works in wasteland and on hills. The road version of that raid does not exist.',
    use: 'On a road, Jackal can spend part of nine hexes, fire at attack 50, and use the rest to leave. The air attack of 10 is Rabbit’s pea-shooter. It does not capture.',
    pay: 'A plain costs 2, so four hexes of approach leave one point, and the retreat is a single hex. A hill costs 4. Wasteland, mountains, and valleys are closed. Attack is 50 against Rabbit’s 70. Defense is 20. Off the road it is a slow buggy that cannot run away.',
    trial: 'Count the points left after the shot. On a road with the target three hexes out, six remain for the escape. On plains, with the target two hexes out, the cost is 4 and five remain — the escape is real but short. In wasteland there is no Jackal at all.',
    beside: 'Rabbit is the raid that crosses wasteland at attack 70. Jackal is the raid that lives on the highway at attack 50.',
    art: 'An open four-wheel frame with a roll bar, a forward gun, and a small missile. The hull is a cage, not an armored car.'
  },
  {
    id: 'OX', name: 'Ox T-55', cls: 'tank', group: 'armor',
    role: 'Tank with a roof gun',
    move: 4, moveType: 'treads', atkG: 50, atkA: 20, def: 40, rngG: 1, rngA: 1,
    blurb: 'Gun 50 and armor 40, movement 4, and a roof gun of 20.',
    decision: 'Giant is the only stock tank that can shoot an aircraft, and Giant moves 2, cannot enter wasteland, and attacks at 90. Every ordinary tank takes an Eagle’s strafe and fires nothing back.',
    use: 'Treat Ox as a Bison that answers the adjacent aircraft. Ground attack 50 and defense 40 match Bison. The roof gun is 20. Against an Eagle, defense 30 and no terrain, that is 14 damage per strength point before experience, squad size, and the random multiplier.',
    pay: 'Movement is 4. Bison’s is 6 and Lenet’s is 5. Two points of approach is the payment for the roof gun; one point would have been a straight improvement on Lenet, who already moves 5 with a smaller gun and thinner armor. The roof gun does not replace Seeker, whose air attack is 65. Direct fire, so tanks counter it and it counters them.',
    trial: 'One map with Eagles and one without. With aircraft, the roof gun is the reason to take the shorter move. Without aircraft, Bison’s two extra hexes are the better tank.',
    beside: 'Bison is the same gun and the same armor at move 6, with an empty sky. Ox spends two hexes of approach on a reply.',
    art: 'A low tracked tank, a turret, a cannon, and a small machine-gun stub on the roof. The stub is metal, not a missile.'
  },
  {
    id: 'AEGIS', name: 'Aegis T-50', cls: 'tank', group: 'armor',
    role: 'Mobile block',
    move: 6, moveType: 'treads', atkG: 0, atkA: 30, def: 50, rngG: 0, rngA: 1,
    blurb: 'Drives to a lane and holds it with armor 50. It has no ground weapon.',
    decision: 'Trigger blocks a hex and cannot move. Every tank that can move also kills. There is no unit whose product is a zone of control you can drive into place.',
    use: 'Move up to six hexes onto a bridge, a road, or a hill and stop the lane. Entering its zone of control ends a move, the same as any unit. Armor 50 is how long the block lasts. The air gun of 30 fires only at an adjacent aircraft, so an Eagle that lands on it takes a hit.',
    pay: 'A ground attack receives no return fire, because there is no ground weapon. It does not capture and it carries nothing. Armor 50 plus a hill is 70, plus wasteland is 80, plus a base is 85, all before defense support and all under the cap of 100. Defense 80 on a hill is already 100, which is why this is 50. Artillery and aircraft are how the block comes up. Surround still halves the total after terrain.',
    trial: 'Place it on a hill (defense 70) in a one-hex lane and send a Grizzly, attack 70. Then place it on a road (defense 50) and send the same Grizzly. The hill case is the one to time. A Hadrian shells it without a counter, because the exchange is indirect and Aegis has no ground gun anyway.',
    beside: 'Trigger is the block you drop and never move, at defense 80. Aegis is the block you can reposition, at defense 50, and it shoots back only at an adjacent aircraft.',
    art: 'A turretless tracked wedge, wide side skirts, a small upward gun, and no missiles.'
  },
  {
    id: 'BULLDOG', name: 'Bulldog SG-2', cls: 'artillery', group: 'guns',
    role: 'Assault gun',
    move: 4, moveType: 'treads', atkG: 60, atkA: 0, def: 40, rngG: 2, rngA: 0,
    blurb: 'Attack 60 at hex 2, armor 40. It can move and fire, and it stays where it fired.',
    decision: 'Lynx is the only stock unit that shoots a ground target at exactly two hexes and still acts in the same turn, and Lynx’s payment is attack 40, defense 20, and a retreat. The long guns hit harder and must choose between moving and firing.',
    use: 'Walk Bulldog into position and fire at hex 2 in that turn, at attack 60, Octopus’s punch, on a single ring. Armor is 40, so it can sit behind the unit it is supporting. Move 4 crosses a plain and still shoots, and it can enter wasteland (cost 3) with a point left over.',
    pay: 'A tank that steps adjacent receives no counter. There is no retreat, so the gun remains on the hex it revealed. There is no anti-air weapon. Range 2 is the whole reach: hexes 3 and beyond belong to Octopus, Hadrian, and Mammoth. Stock guns at range 4 and beyond are move-or-fire. This one is range 2, so it keeps an ordinary turn without borrowing the buggy escape.',
    trial: 'Support a Bison from the hex behind it. Then let a Grizzly step onto the Bison’s hex and continue onto Bulldog. The second step is the blind spot. Lynx, in the same geometry, would have shot and left.',
    beside: 'Lynx shoots hex 2 and leaves, at attack 40 and defense 20. Bulldog shoots hex 2 and holds, at attack 60 and defense 40.',
    art: 'A tracked casemate with a very short, thick barrel. No missiles.'
  },
  {
    id: 'MAMMOTH', name: 'Mammoth SG-70', cls: 'artillery', group: 'guns',
    role: 'Slow heavy gun',
    move: 2, moveType: 'treads', atkG: 70, atkA: 0, def: 40, rngG: 5, rngA: 0,
    moveOrFire: true,
    blurb: 'Movement 2, move or fire. Range 5, attack 70, armor 40.',
    decision: 'Hadrian and Octopus move 4. Atlas moves 0. There is no heavy gun on the rung between a self-propelled battery and a piece that has to be carried.',
    use: 'Fire at hexes 2 through 5 at attack 70, with armor 40. On a turn it does not fire, it can shift two road or plains hexes, or one hill. It is the gun you place near the fight when Atlas’s range of 6 is more than the map needs and Hadrian’s attack of 45 is less than the target deserves.',
    pay: 'Move or fire, and the move is 2. A hill spends the whole turn. Wasteland costs 3, so Mammoth cannot enter it. The adjacent hex is blind. There is no anti-air weapon. Atlas still outranges it and outhits it; Hadrian still repositions in half the time.',
    trial: 'A target five hexes away that will move. Mammoth fires, or it steps two hexes and is silent. Atlas, already placed, fires at 90 out to hex 6 and does not step at all. Hadrian steps four and gives up the shot, at attack 45.',
    beside: 'Hadrian is range 5 at attack 45, defense 30, move 4. Atlas is range 6 at attack 90, defense 20, move 0. Mammoth is range 5 at attack 70, defense 40, move 2.',
    art: 'A deep hull, a tall shield, and a long barrel. The barrel is the silhouette. No missiles.'
  },
  {
    id: 'HERON', name: 'Heron MR-4', cls: 'artillery', group: 'guns',
    role: 'Dual-domain battery',
    move: 4, moveType: 'treads', atkG: 40, atkA: 45, def: 30, rngG: 4, rngA: 2,
    moveOrFire: true,
    blurb: 'Ground 40 at hexes 2–4, and air 45 at hex 2. Both jobs, under the specialist at each.',
    decision: 'No stock battery can shoot ground and air. Hawkeye shoots air at hexes 2–5 and cannot touch a tank. Octopus shoots ground at hexes 2–4 and cannot touch an aircraft.',
    use: 'Bring Heron when the battle has both tanks and aircraft and the scenario gives you one gun slot. Ground attack 40 covers hexes 2, 3, and 4. Air attack 45 covers hex 2 only. Move 4, and the turn is move or fire, the same discipline as Hadrian and Hawkeye. Defense 30 matches those batteries.',
    pay: 'Octopus hits the same ground rings at 60. Hawkeye hits air at 85 out to hex 5. Heron is under both, and both of its weapons are blind at hex 1, so an adjacent tank or an adjacent Eagle takes no counter. It is one dual-domain gun, not a second Hawkeye welded to a second Octopus.',
    trial: 'A tank at hex 3 and an Eagle at hex 2, on different turns. Heron can engage each and will do less than the specialist you did not bring. Then walk a tank onto the adjacent hex: no counter from Heron.',
    beside: 'Octopus is the ground battery at these rings. Hawkeye is the air battery. Heron is the compromise when the scenario has room for one of them.',
    art: 'A tracked hull, a medium cannon pointed forward, and upward missiles at the rear. Yellow on the missiles only.'
  },
  {
    id: 'REDOUBT', name: 'Redoubt SG-40', cls: 'artillery', group: 'guns',
    role: 'Placed bunker gun',
    move: 0, moveType: 'treads', atkG: 50, atkA: 0, def: 50, rngG: 3, rngA: 0,
    moveOrFire: true, placeByTransport: true,
    blurb: 'A placed gun for a local fight. Hexes 2–3, attack 50, armor 50.',
    decision: 'Atlas is the only placed gun. It reaches hexes 2–6 at attack 90 and its defense is 20, so the counterbattery problem is the whole design. There is no placed gun you drop because the fight is close and you want the piece to last.',
    use: 'Unload Redoubt on a plain, a road, a bridge, or an owned factory, behind the hexes you mean to hold. It fires at hexes 2 and 3 at attack 50. Armor 50 is the reason to take the short range. On a plain that defense is 55. Relocation is another transport ride.',
    pay: 'Atlas still reaches hex 6 at attack 90. Redoubt cannot see hex 4 or beyond, and it cannot see aircraft; that is Citadel’s nest. An infantry unit that steps adjacent is safe from the gun. It never moves under its own power. Mule does not carry it. Pelican does, onto the usual unloading tiles.',
    trial: 'A three-hex approach to a factory. Redoubt behind the factory covers the approach and survives a Hadrian longer than Atlas would. The same piece on a wide map watches the enemy walk around hex 3.',
    beside: 'Atlas is the siege tube: range 6, attack 90, defense 20. Redoubt is the local piece: range 3, attack 50, defense 50.',
    art: 'A sandbag revetment, a thick shield, a medium gun, and a split trail. No missiles, no legs.'
  },
  {
    id: 'MERLIN', name: 'Merlin AD-2', cls: 'antiair', group: 'air',
    role: 'Second-ring anti-air',
    move: 6, moveType: 'treads', atkG: 20, atkA: 60, def: 30, rngG: 1, rngA: 2,
    blurb: 'Air attack 60 at exactly hex 2, and it may move and shoot in the same turn.',
    decision: 'Seeker shoots aircraft only when they are adjacent, and it can move and fire. Hawkeye shoots hexes 2–5 at attack 85, and the turn it moves it cannot fire. Hex 2 has no unit that can both reach it and still have moved this turn.',
    use: 'Merlin moves up to six hexes and fires at an aircraft on hex 2, at attack 60. The ground gun is 20 and adjacent, so infantry cannot simply stand on it, and it is not a tank. Defense 30 matches Seeker and Hawkeye.',
    pay: 'An aircraft on hex 1 is Seeker’s target, and Merlin’s missile cannot see it. An aircraft on hex 3 or beyond is Hawkeye’s, if Hawkeye has already set. Air attack 60 is under Seeker’s 65 and well under Hawkeye’s 85. The ground gun loses to any tank. Tracked movement, so it crosses hills at cost 2 and wasteland at cost 3, and it cannot climb a mountain; Harrier can.',
    trial: 'An Eagle orbiting at hex 2, with Merlin still out of position at the start of the turn. Merlin can move and shoot. Hawkeye in the same spot can move or shoot. Then have the Eagle drop to hex 1: Merlin goes silent and Seeker, if present, does not.',
    beside: 'Seeker owns hex 1 and a real ground gun. Hawkeye owns hexes 2–5 on a turn it does not move. Merlin owns hex 2 on a turn it does.',
    art: 'A tracked box launcher, a flat radar panel, and twin missiles at a shallow angle. Yellow on the missiles.'
  },
  {
    id: 'CITADEL', name: 'Citadel AD-0', cls: 'antiair', group: 'air',
    role: 'Placed air nest',
    move: 0, moveType: 'treads', atkG: 20, atkA: 50, def: 50, rngG: 1, rngA: 1,
    placeByTransport: true,
    blurb: 'A placed nest. Adjacent air attack 50, a light ground gun, armor 50.',
    decision: 'Trigger is the placed block, and it cannot shoot. Atlas is the placed gun, and it cannot see aircraft. A factory garrison has no nest that answers the Eagle on the adjacent hex.',
    use: 'Unload Citadel on a plain, a road, a bridge, or an owned factory. It shoots an adjacent aircraft at 50 and an adjacent ground unit at 20, and because both weapons include hex 1 it can counter. Armor 50 makes it a worse wall than Trigger and a better wall than Atlas. It stays where it was unloaded.',
    pay: 'Anything at hex 2 or beyond ignores it. Merlin and Hawkeye own those rings. Ground attack 20 does not stop a tank; it scratches infantry and it does answer. Defense 50 against Trigger’s 80 is the price of having a gun. Mule does not carry it. It cannot relocate without a transport, and it cannot climb onto a mountain by itself.',
    trial: 'A factory, a Charlie, and an Eagle. Citadel on the factory tile (terrain defense 0, so armor stays 50) shoots the Eagle that comes adjacent. An Eagle that stays at hex 2 is untouched. A Grizzly that walks up takes a ground attack of 20 and then dismantles the nest.',
    beside: 'Trigger blocks and never shoots, at defense 80. Citadel shoots the adjacent hex and blocks less, at defense 50.',
    art: 'Four braced feet, a low box, two vertical missiles, and a small ground barrel. Tall, where Redoubt is wide and bagged.'
  },
  {
    id: 'BURRO', name: 'Burro NC-2', cls: 'transport', group: 'carry',
    role: 'Wasteland carrier',
    move: 5, moveType: 'treads', atkG: 20, atkA: 10, def: 30, rngG: 1, rngA: 1,
    cargo: 1, cargoTypes: ['CHARLIE', 'KILROY', 'IBEX', 'HARRIER', 'PIPIT'],
    blurb: 'Tracked carrier for foot units. It crosses wasteland, which costs 3.',
    decision: 'Mule is wheeled, so wasteland, mountains, and valleys are closed to it, and its defense is 10. Pelican flies over wasteland and cannot land there. No carrier can walk a Kilroy across the ash.',
    use: 'Load Charlie, Kilroy, Ibex, Harrier, or Pipit and cross wasteland at cost 3, or a hill at cost 2. Armor 30 is there so the crossing is not free food. The gun is 20 ground and 10 air, adjacent, in the same band as a light truck: it shoots back, and it is not a fighting vehicle. On a road it makes five hexes to Mule’s six.',
    pay: 'It does not carry Oryx, tanks, guns, nests, Atlas, or Trigger. Those stay with Pelican, and Atlas and Trigger stay with Mule. Mountains and valleys are closed to tracks. Move 5 does not outrun Mule on a road. One passenger. Pelican remains the fast delivery onto plains, roads, bridges, and owned factories, and Pelican still cannot drop anyone into wasteland.',
    trial: 'A belt of wasteland between a factory and the fight, with a Kilroy that needs to be on the far side. Mule stops at the edge. Pelican cannot land in the ash. Burro spends 3 to enter and has 2 left. The same Kilroy on a road should still ride Mule, which is faster there and was built for that road.',
    beside: 'Mule is the road truck: move 6, wheels, defense 10, and it carries Charlie, Kilroy, Atlas, and Trigger. Burro is the ash truck: move 5, tracks, defense 30, and it carries foot teams.',
    art: 'A tracked cab with a windshield, an open cargo bay behind it, and a small gun. The hole in the hull is the load.'
  }
];

module.exports = { intro, method, groups, units };
