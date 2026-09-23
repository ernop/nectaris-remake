# gemini38 — 15 Tactical Gap-Filling Units (Proposal & Review Pack)

Status: experimental proposal and review pack. It does not modify the production playable roster or campaign maps. `custom-units.json` conforms to the engine's `mergeUnitTypes` custom unit schema and passes `validate.js` (loaded without errors, no statline duplication against stock or siblings, valid ranges and movement types). Icons are 30 original 32×32 indexed pixel art sprites in `icons/` (Union and Xenon facings). `gallery.html` and `index.html` provide an interactive visual overview.

---

## 1. Review of Project Outline: "Fifteen Numerical Ground-Unit Concepts"

In `PROJECT_GUIDE.md` (line 42), the project outline records the following research item:
> `Fifteen numerical ground-unit concepts | Experimental proposals, not additions to the playable roster. Numerical coverage is not evidence of balance; artwork is a separate review pack. [Study, assumptions and playtesting needs](tools/design-space/README.md).`

### Analysis of the Prior Design-Space Study (`tools/design-space/`)
1. **Methodology & Mathematical Premise:**
   The prior artifact used a deterministic 240,000-draw Monte Carlo maximin search across a 5-dimension feature vector: Firepower (25%), Armor (15%), Range bands (20%), Terrain reach/access (20%), and Turn/mission rules (20%). It screened candidates against an arbitrary power budget ceiling derived from stock units, then sequentially greedily picked configurations that maximized distance to the nearest existing unit.
2. **What the Numerical Study Revealed:**
   The 1989 PC Engine Nectaris roster (23 units, 19 ground units) clusters tightly around conventional archetypes. Across 25,858 admissible configurations, the mathematical study lowered mean nearest-unit distance from 22.27 to 16.85 (a 24.3% reduction).
3. **Critical Design Flaws of Pure Maximin Dispersion:**
   As the study's own `README.md` noted, maximin optimization inherently hunts extreme corners and boundary cases of the bounding box:
   - **Degenerate mobility:** Units like `Badger CBX-8` were assigned 1 movement point on wheels. Because entering plains on wheels costs 2 points and hills 4 points, a 1-move wheeled unit is physically trapped on roads and cannot traverse off-road terrain in a single activation.
   - **Tactical irrelevance:** `Midge GX-12` was assigned 10 air attack, 0 ground attack, and no capture ability. In a game without a purchase economy or reinforcement points, a scenario slot cannot justify a unit that deals negligible attrition.
   - **Artificial roadblocking:** `Rampart HV-90` gave up all ground attack for 80 defense and 9 tracked movement, functioning as an un-counterable movement sponge rather than a combat entity.
   - **Distorted damage ceilings:** `Hydra MR-90` combined 90 ground attack and 85 air attack at range 2–3 on a 1-move crawler, creating an un-interactive artillery piece that warped screening math.
   - **Defense-cap clipping:** Multiple 80-defense selections could reach the engine's 100-defense combat cap simply by parking on hills or receiving defensive support.

---

## 2. The Gemini 3.8 Tactical Reframe

A strategy wargame is not a coordinate-dispersion problem; it is an engine of operational trade-offs, tempo, and combined-arms doctrine. In Nectaris, units exist within strict system rules:
- **Terrain movement costs:** Foot (mountain access), Wheels (road sprint, rough ground penalty), Treads (balanced cross-country), and Air (flat 1 cost, no terrain defense).
- **Combat dynamics:** Zone of Control (ZOC), Surround defense reduction, Support fire bonuses from adjacent friendlies.
- **Indirect fire rules:** Firing bands at range $N > 1$ cannot attack adjacent hexes ($d=1$), and indirect attacks allow no counter-fire or support from the defender.
- **Action economy:** Move-then-fire, Move-or-fire, Move-after-attack (hit-and-run retreat), and Transport logistics (Pelican / Mule loading constraints).

The `gemini38` set replaces geometric boundary sampling with **operational role fulfillment**: 15 distinct, combat-viable units designed to answer real battlefield dilemmas that scenario designers and players encounter. Every unit has:
1. A specific operational mission absent from the stock 23-unit roster.
2. A direct counter already present in the stock roster.
3. A realistic transport integration story.
4. No degenerate mobility or defense cap exploitation.

---

## 3. Master Characteristics Table

Band notation: `1` = adjacent direct fire (allows counterfire and support); `2` = strictly distance 2 (indirect); `2–3`, `2–4`, `2–5` = indirect firing bands (blind spot at distance 1, no counterfire).
Turn policy: **THEN** = Move-then-fire; **OR** = Move-or-fire (requires setup); **RET** = Attack-then-retreat (hit-and-run); **ST** = Stationary deployable.

| # | Icon (U / X) | Name | ID | Class | Move | Chassis | Rng G | Rng A | Atk G | Atk A | Def | Turn Policy / Traits | Operational Role & Tactical Purpose |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ![Phalanx](icons/phalanx-union.png) | Phalanx AA-50 | `PHALANX` | antiair | 5 | Treads | 1 | 1 | 35 | 75 | 50 | THEN | **Armored Frontline Flak:** Survives in the tank line (50 def) where Seekers die; shreds aircraft (75 atkA) and counters light armor. |
| 2 | ![Sentinel](icons/sentinel-union.png) | Sentinel AD-80 | `SENTINEL` | antiair | 0 | Treads | 0 | 5 | 0 | 80 | 25 | ST (place) | **Static Heavy SAM Umbrella:** Pelican-deployed air denial battery (range 2–5, 80 atkA). Completely unarmed against ground units. |
| 3 | ![Dart](icons/dart-union.png) | Dart MB-6 | `DART` | buggy | 7 | Treads | 1 | 2 | 25 | 50 | 20 | RET | **Anti-Air Missile Buggy:** Strikes aircraft at exact distance 2 without counterfire, then spends leftover movement to retreat. |
| 4 | ![Storm](icons/storm-union.png) | Storm SG-50 | `STORM` | artillery | 4 | Treads | 3 | 0 | 50 | 0 | 35 | THEN | **Mobile Assault Gun:** Unique move-and-fire indirect howitzer. Advances 1–4 hexes and bombards at range 2–3 in the same turn. |
| 5 | ![Cyclops](icons/cyclops-union.png) | Cyclops MR-75 | `CYCLOPS` | artillery | 3 | Treads | 5 | 0 | 75 | 0 | 25 | OR | **Heavy Siege Rocket Launcher:** Bridges the gap between Octopus (60/4) and Atlas (90/6). Relocates on treads to bombard at range 2–5. |
| 6 | ![Bunker](icons/bunker-union.png) | Bunker FB-70 | `BUNKER` | artillery | 0 | Treads | 1 | 1 | 65 | 30 | 70 | ST (place) | **Deployable Combat Cupola:** Pelican-dropped fortified strongpoint with 70 defense and direct fire (65 ground, 30 air) at key bottlenecks. |
| 7 | ![Ranger](icons/ranger-union.png) | Ranger GX-35 | `RANGER` | infantry | 4 | Foot | 1 | 1 | 35 | 25 | 16 | THEN | **Mountain Commando Skirmisher:** Fast 4-move foot unit that scales peaks to spot, harass armor (35 atkG), and pick off damaged units. Does not capture. |
| 8 | ![Hoplite](icons/hoplite-union.png) | Hoplite GX-25 | `HOPLITE` | infantry | 2 | Foot | 1 | 1 | 25 | 15 | 26 | THEN (cap) | **Heavy Armored Capturer:** 26 defense (highest among capturers). Built to seize contested factories and survive the enemy armored counterattack. |
| 9 | ![Mortar](icons/mortar-union.png) | Mortar GX-40 | `MORTAR` | infantry | 3 | Foot | 3 | 0 | 40 | 0 | 12 | OR | **Mountain Mortar Squad:** Man-portable indirect fire (range 2–3, 40 atkG) capable of scaling high peaks where vehicles cannot enter. |
| 10 | ![Cheetah](icons/cheetah-union.png) | Cheetah AC-8 | `CHEETAH` | tank | 8 | Wheels | 1 | 0 | 50 | 0 | 30 | THEN | **Wheeled Cavalry Tank:** Fast 8-wheel responder. Dominates road corridors and plains to secure contested center ground before tracked armor arrives. |
| 11 | ![Rhino](icons/rhino-union.png) | Rhino AT-85 | `RHINO` | tank | 3 | Treads | 1 | 0 | 85 | 0 | 45 | THEN | **Heavy Tank Destroyer:** Direct-fire anti-tank specialist packing an 85-power high-velocity gun. Shatters heavy tanks in head-on clashes. |
| 12 | ![Mammoth](icons/mammoth-union.png) | Mammoth HMB-5 | `MAMMOTH` | tank | 3 | Treads | 1 | 0 | 80 | 0 | 65 | THEN | **Waste-Capable Breakthrough Tank:** Unlike Giant (barred from waste), Mammoth spends its full 3 move to traverse wasteland (cost 3) with 80/65 stats. |
| 13 | ![Buffalo](icons/buffalo-union.png) | Buffalo NC-5 | `BUFFALO` | transport | 5 | Treads | 1 | 1 | 25 | 15 | 35 | THEN (cargo: 1) | **Armored Combat APC:** Tracked battle taxi with 35 defense and 25/15 self-defense weapons. Delivers foot squads safely through artillery crossfire. |
| 14 | ![Corsair](icons/corsair-union.png) | Corsair AX-80 | `CORSAIR` | air | 8 | Air | 1 | 1 | 80 | 30 | 40 | THEN | **Heavy Attack Gunship:** Dedicated tank-busting VTOL packing 80 ground attack and 40 armor. Bypasses terrain to dismantle entrenched armor. |
| 15 | ![Talon](icons/talon-union.png) | Talon MB-9 | `TALON` | buggy | 9 | Wheels | 1 | 1 | 35 | 20 | 15 | RET | **Wheeled Recon Buggy:** High-speed 9-wheel scout with hit-and-run retreat. Exploits roads to probe enemy lines and eliminate soft rear echelons. |

Contact Sheet: ![contact sheet](sheet.png)

---

## 4. In-Depth Operational Dossiers

### 1. Phalanx AA-50 (`PHALANX`) — Armored Frontline Flak Tank
- **Gap:** Stock air defense is polarized between fragile direct flak (`Seeker`, 30 def) and fragile stationary indirect SAMs (`Hawkeye`, 30 def, move-or-fire). Neither can accompany an armored breakthrough; enemy tanks easily dismantle Seekers in the line.
- **Tactical Use:** Moves directly with Grizzly, Polar, and Slagger spearheads. Its 50 defense allows it to absorb tank shells and artillery splashes while its 75 air attack shreds loitering Eagles and Hunters. Its 35 ground attack provides capable self-defense against light armor and buggies.
- **Price & Counters:** Slower than Seeker (5 treads vs 6); modest 35 ground attack cannot beat real battle tanks alone; direct range 1 only. Heavy tanks (Grizzly, Polar) dismantle it in sustained close brawls.
- **Logistics:** Tracked mobility allows cross-country transit; Pelican-liftable for rapid repositioning.
- **Playtest Hypothesis:** Verify that 50 defense does not make armored pushes impervious to air counters; Falcon air-superiority fighters (90 atkA) should still deter it if unsupported.
- **Art Brief:** Low-slung armored hull with heavy tread tracks, beveled turret with twin high-elevation heavy autocannons, and optical targeting pod.

### 2. Sentinel AD-80 (`SENTINEL`) — Deployable Static Heavy SAM Battery
- **Gap:** The stock roster has a static ground gun (`Atlas SS-80`, range 6, 90 atkG) and a static mine (`Trigger M-77`), but zero static air defense. Securing rear factories against air raids requires tying up mobile Hawkeyes.
- **Tactical Use:** The air-defense counterpart to Atlas. Pelican-delivered into rear production facilities, supply hubs, or mountain passes. Projects an 80-power air denial zone across hexes 2 to 5, denying airspace to enemy bombers and transports.
- **Price & Counters:** Completely unarmed against ground units (atkG 0); immobile once placed; defense 25. Any ground unit, even a Charlie infantry squad, can walk up and destroy it without receiving counterfire.
- **Logistics:** Transport placement only (not in Mule whitelist; requires Pelican airlift).
- **Playtest Hypothesis:** Confirm that transport activation costs and ground vulnerability prevent players from creating impenetrable air-defense nets over every map quadrant.
- **Art Brief:** Four angular stabilizing ground pads, central launcher tower with twin heavy surface-to-air missiles angled upward, and a prominent rotating search-radar mast.

### 3. Dart MB-6 (`DART`) — Tracked Anti-Air Missile Buggy
- **Gap:** The stock buggy class has `Rabbit` (direct 70/10) and `Lynx` (indirect ground at range 2, 40/10). There is no buggy capable of indirect anti-air fire or hit-and-run anti-air strikes.
- **Tactical Use:** The air-defense sister to Lynx. Uses 7 tracked movement to maneuver into position, fires an indirect SAM strike at an aircraft at exact distance 2 (50 atkA) without receiving defensive counterfire, then spends leftover movement to retreat behind friendly armor.
- **Price & Counters:** Defense 20; blind to aircraft at distance 1; weak ground weapon (25 atkG). Easily pinned and destroyed if enemy armor catches it in Zone of Control.
- **Logistics:** Tracked chassis crosses hills; Pelican-liftable.
- **Playtest Hypothesis:** Test whether hit-and-run indirect AA is too frustrating for human players facing CPU air harassment; verify that 50 atkA forces multiple coordinated strikes to drop a Hunter.
- **Art Brief:** Sleek low-slung tracked chassis with forward cab and an elevating dual-missile launcher rail over the rear deck.

### 4. Storm SG-50 (`STORM`) — Mobile Assault Gun
- **Gap:** Every artillery piece in the stock game (`Hadrian`, `Octopus`, `Atlas`) has `moveOrFire: true`. Relocating artillery forfeits a turn of fire, creating a rigid front where advancing forces lose fire support.
- **Tactical Use:** An assault gun built for tempo. Storm can advance 1–4 hexes and immediately bombard ground targets at range 2–3 (50 atkG) in the same activation. Enables creeping barrages and immediate fire support during breakthrough operations.
- **Price & Counters:** Shorter range and lower damage (50 atkG at 2–3) than Octopus (60 atkG at 2–4) or Hadrian (45 atkG at 2–5); defense 35; zero anti-air defense.
- **Logistics:** Tracked mobility; Pelican-liftable.
- **Playtest Hypothesis:** Check for potential kiting exploits against 4-move standard artillery; verify that the blind spot at distance 1 and enemy Zone of Control prevent abuse.
- **Art Brief:** Turretless casemate tank chassis with a sloped frontal glacis plate and a heavy, short-barreled howitzer protruding directly from the front hull.

### 5. Cyclops MR-75 (`CYCLOPS`) — Heavy Siege Rocket Launcher
- **Gap:** A massive operational power gap exists between Octopus (60 atkG, range 4, move 4) and Atlas (90 atkG, range 6, immobile). There is no mobile heavy siege artillery in the game.
- **Tactical Use:** Moves 3 tracked hexes into a prepared firing position; on the following turn (`moveOrFire: true`), unleashes a devastating 75-power barrage at range 2–5. Cracks heavy defensive clusters, fortified tanks, and bunker positions.
- **Price & Counters:** Move-or-fire restriction; slow (3 treads); defense 25; blind at adjacent distance 1; zero air defense. A prime target for enemy air strikes and fast buggy flankers.
- **Logistics:** Slow tracked chassis; Pelican-liftable.
- **Playtest Hypothesis:** Test whether 75 attack at range 5 invalidates Hadrian (45 at range 5); Hadrian's superior mobility (4 vs 3) and defense (30 vs 25) must remain relevant.
- **Art Brief:** Elongated tracked carrier chassis with reinforced stabilizers and a massive elevated multiple-rocket-launcher box featuring staggered rocket tube nozzles.

### 6. Bunker FB-70 (`BUNKER`) — Deployable Combat Cupola / Strongpoint
- **Gap:** Trigger M-77 provides 80 defense but zero weapons (passive obstacle). Atlas SS-80 provides high indirect firepower but only 20 defense and cannot shoot adjacent enemies. There is no deployable armed fortress strongpoint.
- **Tactical Use:** Pelican-delivered directly into vital bottlenecks, factory entrances, or canyon passes. Provides 70 defense, 65 direct ground attack, and 30 direct air attack, projecting Zone of Control and locking down the hex against assault.
- **Price & Counters:** Immobile once placed; direct range 1 only (no indirect range); cannot retreat. Can be bypassed, surrounded to reduce its defense, or bombarded to death by heavy artillery from beyond range 1.
- **Logistics:** Transport placement only (requires Pelican airlift; not in Mule whitelist).
- **Playtest Hypothesis:** Verify that 70 defense does not cause endless stalemates in narrow canyons; confirm that surround penalties and indirect artillery reliably crack it.
- **Art Brief:** Heavy faceted steel cupola embedded in a reinforced concrete ring, featuring armored observation slits, a heavy dual gun mantlet, and a low-profile cupola roof.

### 7. Ranger GX-35 (`RANGER`) — Mountain Commando Skirmisher
- **Gap:** Foot units in Nectaris can climb mountains (cost 2 for foot; impassable for wheels and treads). However, Charlie and Kilroy are both slow, fragile capturers. There is no fast, combat-focused mountain scout.
- **Tactical Use:** Moves 4 foot hexes, easily traversing hills and scaling high mountain ranges. Packs 35 ground attack, 25 air attack, and 16 defense. Acts as a high-ground scout, sniper, and mountain interdiction unit, picking off damaged vehicles and harassing artillery.
- **Price & Counters:** Cannot capture factories or bases (`capture: false`); defense 16 dies quickly if caught in open plains by tanks; direct range 1 only.
- **Logistics:** Foot mobility across all terrain; Pelican air-drop capable; Buffalo APC transportable.
- **Playtest Hypothesis:** Verify that the lack of capture capability keeps Charlie and Kilroy necessary, while Ranger's 4 move provides genuine operational harassment on alpine maps.
- **Art Brief:** Agile running infantry operative carrying a long-barreled sniper/anti-materiel rifle with optical sight, wearing an alpine helmet and a compact mountain survival pack.

### 8. Hoplite GX-25 (`HOPLITE`) — Heavy Armored Capturer
- **Gap:** All stock capturers are fragile: Charlie (def 4), Kilroy (def 10), Panther (def 8). Capturing a contested frontline factory almost always results in the capturing squad being eliminated on the enemy's next turn.
- **Tactical Use:** Heavy armored infantry equipped with ballistic tower shields, delivering 26 defense (highest among capturers). Walks onto contested factories and survives the inevitable armored counterattack, allowing friendly armor time to reinforce the position.
- **Price & Counters:** Very slow (2 foot movement); modest combat attack (25 ground, 15 air). Cannot fight tanks head-on and is vulnerable to artillery bombardment.
- **Logistics:** Foot mobility; Pelican airliftable; Buffalo APC transportable.
- **Playtest Hypothesis:** Test whether 26 defense plus factory terrain bonus makes holding buildings too easy; ensure artillery and concentrated tank surround can still dislodge it.
- **Art Brief:** Armored infantryman standing behind a tall, curved ballistic pavise shield emblazoned with a faction insignia, armed with a compact personal defense carbine.

### 9. Mortar GX-40 (`MORTAR`) — Mountain Artillery Infantry Squad
- **Gap:** Tracked artillery cannot enter mountain hexes. Infantry can climb mountains but only possesses range 1 direct combat. There is no foot-mobile indirect artillery team.
- **Tactical Use:** Hikes into steep mountain peaks, crags, and ridges overlooking contested valleys. Sets up a heavy mortar (`moveOrFire: true`) to deliver indirect bombardment at range 2–3 with 40 attack power.
- **Price & Counters:** Move-or-fire setup restriction; defense 12; blind at adjacent distance 1; zero air defense; cannot capture buildings.
- **Logistics:** Foot mobility; Pelican-liftable; Buffalo APC transportable.
- **Playtest Hypothesis:** Confirm that 40 attack at range 2–3 from mountain positions provides meaningful fire support without overshadowing Hadrian or Octopus.
- **Art Brief:** Kneeling infantry squad member with an elevating bipod mortar tube, ground baseplate, and an open ammunition crate of mortar shells.

### 10. Cheetah AC-8 (`CHEETAH`) — Wheeled Cavalry Tank
- **Gap:** Slagger is 7 treads (50/50). Panther and Mule are wheeled non-combatants. There is no combat tank on wheels that can exploit highway systems for high-speed rapid deployment.
- **Tactical Use:** High-speed 8-wheel combat vehicle. Exploits paved roads and flat plains to rapidly secure contested center ground, reinforce collapsing flanks, or counter early enemy buggy pushes before tracked armor can arrive.
- **Price & Counters:** Severely hindered by rough terrain: cannot enter waste, mountains, or valleys, and pays 4 movement points per hill hex. Defense 30 and zero air defense mean it loses duels to heavy tracked tanks in close quarters.
- **Logistics:** Wheeled mobility; Pelican-liftable for off-road transit.
- **Playtest Hypothesis:** Verify that wheeled terrain restrictions prevent Cheetah from dominating off-road maps while giving it a decisive role on highway-connected scenarios.
- **Art Brief:** Long eight-wheeled armored chassis with angled side armor, low-profile turret, high-velocity medium tank cannon, and forward vision ports.

### 11. Rhino AT-85 (`RHINO`) — Heavy Casemate Tank Destroyer
- **Gap:** Main battle tanks engage in balanced direct combat (Grizzly is 70 atkG / 50 def; Polar is 60/60). There is no dedicated tank-hunter optimized purely for destroying heavy armor in direct confrontation.
- **Tactical Use:** Heavy tracked tank destroyer mounting a massive high-velocity cannon delivering 85 ground attack. Shatters Titan, Grizzly, and Polar tanks in direct head-on exchanges.
- **Price & Counters:** Slow (3 tracked movement); zero air defense; defense 45 requires screening; direct range 1 only. Vulnerable to airstrikes from Falcons/Hunters and indirect artillery fire.
- **Logistics:** Tracked cross-country mobility; Pelican-liftable.
- **Playtest Hypothesis:** Test whether 85 ground attack overpowers standard tank lines; confirm that its 3 movement and 45 defense force it to play as an ambush or defensive anchor.
- **Art Brief:** Heavy, wide-tracked casemate hull (no rotating turret) dominated by a massive long-barreled anti-tank cannon equipped with a perforated double-baffle muzzle brake.

### 12. Mammoth HMB-5 (`MAMMOTH`) — Waste-Capable Breakthrough Siege Tank
- **Gap:** The super-heavy Giant HMB-2 is explicitly banned from entering wasteland (`cannotEnter: ["waste"]`). Furthermore, 2-move tanks cannot traverse wasteland in a single turn because wasteland movement cost is 3. Fortified lines in wasteland are therefore nearly impossible to breach with armor.
- **Tactical Use:** Heavy siege tank with 3 tracked movement points, allowing it to spend its full allowance to enter wasteland hexes. Packs 80 ground attack and 65 defense, acting as a dedicated breakthrough vehicle through rough, cratered wasteland sectors.
- **Price & Counters:** Slow (3 treads); zero air defense; direct range 1 only. Highly vulnerable to air strikes from Falcons and Hunters and easily outflanked by fast armor on open ground.
- **Logistics:** Tracked mobility; Pelican-liftable for strategic deployment.
- **Playtest Hypothesis:** Verify that waste-crossing capability provides a distinct tactical identity on wasteland-heavy maps without breaking open-field balance.
- **Art Brief:** Extra-wide double-tracked chassis with reinforced side skirt armor, massive beveled turret, and a short-barreled heavy siege demolition gun.

### 13. Buffalo NC-5 (`BUFFALO`) — Armored Combat Personnel Carrier
- **Gap:** Stock `Mule` is wheeled (6 wheels), fragile (10 def), and lightly armed (10/10). Transporting infantry into contested factory zones often results in the transport being destroyed before unloading.
- **Tactical Use:** Tracked armored personnel carrier with 35 defense and self-defense weapons (25 ground, 15 air). Safely carries 1 foot unit (Charlie, Kilroy, Ranger, Hoplite, Mortar) across rough terrain and through artillery crossfire directly to an objective.
- **Price & Counters:** Slower than Mule on roads (5 treads vs 6 wheels); restricted passenger whitelist (foot infantry only; cannot carry Atlas or heavy tanks).
- **Logistics:** Tracked carrier; can be airlifted empty by Pelican.
- **Playtest Hypothesis:** Confirm that Buffalo makes mechanized infantry assaults viable while Mule maintains its monopoly on heavy artillery/mine transport.
- **Art Brief:** Angular tracked armored vehicle with an elevated troop compartment, side vision blocks, rear access doors, and a small commander cupola with a pintle-mounted autocannon.

### 14. Corsair AX-80 (`CORSAIR`) — Heavy Anti-Tank Attack Gunship
- **Gap:** The stock air force features high-speed air-superiority fighters (`Falcon`, 12 move, 90 atkA) and balanced fighter-bombers (`Hunter`, 11 move, 70/70/50). There is no heavy, dedicated close-air-support gunship built for tank-busting.
- **Tactical Use:** A dedicated ground-attack VTOL. Bypasses terrain to strike enemy heavy armor, artillery parks, and bunkers with a massive 80 ground attack and 40 armor. Provides immediate fire support where ground units cannot reach in time.
- **Price & Counters:** Slower than existing aircraft (8 air move vs 11/10); modest air defense (30 atkA). Easily hunted down and destroyed in air-to-air combat by Falcon fighters (90 atkA) and shredded by Seeker/Phalanx anti-air batteries.
- **Logistics:** Self-deploying aircraft; ignores terrain movement costs but receives no terrain defensive bonuses.
- **Playtest Hypothesis:** Test whether 80 ground attack creates uncounterable tank kills; verify that the stock air-defense envelope (Falcon, Hawkeye, Seeker) keeps it disciplined.
- **Art Brief:** Armored attack helicopter silhouette with tandem cockpit glass, heavy turbine exhausts, stub wings carrying anti-tank rocket pods, and a chin-mounted rotary cannon.

### 15. Talon MB-9 (`TALON`) — High-Speed Wheeled Recon Buggy
- **Gap:** Stock buggies (`Rabbit`, `Lynx`) are tracked. Panther (9 wheels) is the fastest wheeled unit, but it cannot retreat after attacking. There is no wheeled hit-and-run cavalry scout.
- **Tactical Use:** High-speed wheeled reconnaissance vehicle with 9 movement points. Strikes light units and soft rear transports (35 ground, 20 air attack) and uses remaining movement to retreat back into safety (`moveAfterAttack: true`).
- **Price & Counters:** Defense 15; wheeled terrain restrictions (cannot enter waste/mountains/valleys, 4 points per hill); light armor. If it ends its turn inside an enemy Zone of Control, it is quickly surrounded and destroyed.
- **Logistics:** Wheeled mobility; Pelican-liftable across impassable chasms.
- **Playtest Hypothesis:** Verify that 9 wheeled movement does not break opening turn factory races; confirm that its combat stats are tuned for scouting and harassment rather than frontline brawling.
- **Art Brief:** Lightweight tubular roll-cage desert buggy with two large off-road rear tires, high communications antenna with a signal pennant, and forward twin light machine guns.

---

## 5. Verification & Testing

To reproduce and verify the `gemini38` design artifacts:
```bash
# 1. Generate the 30 PNG icons and the contact sheet
node gemini38/icons.js

# 2. Validate all 15 units against Nectaris game engine rules and stock definitions
node gemini38/validate.js
```

Validation confirms:
- All 15 units load cleanly into the game engine via `mergeUnitTypes`.
- All numerical statistics fall within valid design bounds (move $\le 12$, defense $\le 80$, attack $\le 90$, range $\le 6$).
- Zero statline duplicates exist against any of the 23 stock units or sibling proposals.
- Every ground unit is compatible with Pelican transport loading rules (`ENGINE.canLoad`).
- Combat range calculations perfectly match the engine's distance formulas (`COMBAT.canAttackAt`).
- All 30 standalone icon files exist in `gemini38/icons/` with valid headers and data.
