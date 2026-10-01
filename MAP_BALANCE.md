# Map balance: what the bots show

A guide to balanced Nectaris maps, built from measurements of the three
balance-study campaigns in
[ENVIRONMENT_CAMPAIGNS.md](ENVIRONMENT_CAMPAIGNS.md#three-balance-study-campaigns)
(Bridgeheads, Siege Lines, Arsenal). Each mission states one idea about balance.
The tables at the end record whether its measurements confirmed the idea and
how the mission was tuned; the findings collect what the 48 missions showed
together. Every claim names the board and the numbers behind it.
[Designing a campaign](#designing-a-campaign) records the method for a
campaign with a difficulty curve and its first test, Training Ground.

The numbers describe the rules and simulator bots of commit `2730eac`
(2026-09-29), under which aircraft can no longer stop on neutral or enemy
factories. Most tuning ran on the commit before it, `479292c`, where they
could; the last five rounds ran under `2730eac`. That rule can only matter on
the eight missions with both aircraft and factories: RIMA PRINZ, RIMA
ARIADAEUS, PETAVIUS, MARE ORIENTALE, MARE CRISIUM, MARE FECUNDITATIS, MARE
INSULARUM and MARE NECTARIS. On the other 40 every game replays identically
under both commits (the remeasurement reproduced them exactly). The eight were
remeasured under the new rule, drafts and quoted variants included, and the two
it pushed out of range were re-tuned: MARE INSULARUM fell from 53% to about
20%, RIMA ARIADAEUS rose from 47-49% to about 64%. Rule and bot changes move
these numbers, so remeasure before relying on one.

**Measured under a rule since removed.** Every number and finding here dates
from when each mission had its own turn limit and Xenon won when it ran out;
the limits are in the level files as of commit `78f746a`. On 2026-09-30 that
rule was replaced in every game by draws: after 100 turns in which no unit
lost a machine and no factory was captured, and when turn 5000 ends
([decision](PRODUCT.md#fixed-turn-limit-and-draws-2026-09-30)). The missions'
balance under the draw rules has not been measured. The "At limit" games,
Xenon wins then, now play on.

## How balance is measured

**The standard**, settled with the user on 2026-09-29 and restated by the user
on 2026-09-30: each map is a game, and it should be one where "you playing well
matters". If one side, first or second, "has a way to win with very high
chances", the map is not fun; the dice make every result a chance. In the
user's words, "this would mean that in self-play, both sides have a good chance
to win, and that bad bots would mostly lose". Three tests follow:

- **Self-play:** Marshal, the best bot, plays itself, and Union (moving first)
  wins 40-60% of games. Xenon's wins at the turn limit are reported
  separately, because that rule, not the fighting, decides them.
- **Weak bots lose:** Classic and Tactical, the two weakest bots, each play
  Marshal in both seats and lose more than half their games in each seat. A
  stricter bar would ask more than Marshal shows on the original game's 32
  maps, where it scores 78% against Classic and 69.5% against Tactical over
  both seats ([BOTS.md](BOTS.md)).
- **No sure win:** no bot, playing either seat, wins 90% or more of its games
  against each of the four bots (Marshal, Apex, Classic, Tactical) on the
  other side. The 90% is this guide's reading of "very high chances".

**The best bot** is the one that scores highest against the others over these
boards. Marshal (Apex search with separately tuned weights for each seat,
[BOTS.md](BOTS.md)) beat Apex 66% over the 48 drafts (1,536 games, both seats:
73% as Union, 59% as Xenon). Apex had scored 63% against the five other bots
before the current Marshal existed.

**Final numbers** pool every run of a mission's final map on dice seeds that no
tuning run used: 150 games for 32 missions; 450 (two seeds) for the 15
re-tuned or measured again after their first confirmation; and 600 (three
seeds) for RIMA BIRT. At 150 games the 95% interval is about ±8 points; at
450, about ±5.

**The four-bot grid** behind the last two tests: on each mission, every bot
plays every other in both seats, 64 seat-swapped pairs per pairing, and each
bot plays itself (Marshal as above; Apex, Classic and Tactical 100 games).
Tuning until 2026-09-29 used self-play alone; finding 13 shows what the other
two tests found on those missions.

The tool is `sim/src/bin/balance.rs`:

```sh
cd sim
# The standard: Marshal self-play on the 48 balance-study boards.
cargo run --release --bin balance -- --a=marshal --boards=119-166 --games=150
# Marshal against a weak bot, each in both seats (also --b=tactical, apex).
cargo run --release --bin balance -- --a=marshal --b=classic --boards=119-166 --games=64
```

`--boards` takes ranges and lists (`121,124,128-130`). `--data=PATH` measures
boards from another export, which is how map variants are compared before one
is written into a campaign.

### How the missions were tuned

1. Draft each mission from its idea and build it with
   `tools/build-balance-campaigns.js`.
2. Measure every draft: Marshal self-play, 100 games.
3. For each mission outside 40-60%, build variants that change one thing (a
   unit, a unit's starting strength, the turn limit, a factory's stock, a
   starting position) and measure each: 48 or 100 games in the early rounds,
   200 or 300 later.
4. Write the variant nearest 50% into the campaign, and check that the built
   board is identical to the one measured.
5. Confirm all 48 on a fresh seed; re-tune those outside the range and confirm
   them again on another fresh seed.
6. After the rule change of `2730eac`, rerun every confirmation seed on the new
   build, check that the 40 missions the rule cannot touch replay identically,
   and re-tune and confirm the two that the rule pushed out of range.
7. Re-tune every mission whose pooled result lay within two points of an edge,
   where the measurement cannot tell in from out: measure candidates on 300
   games each, write in the one nearest 50%, and confirm it on two more fresh
   seeds (450 games). Eight missions qualified. On seven a candidate came
   nearer 50%. RIMA BIRT had none: its 17 candidates gave 6-44% or 92%. It
   kept its setting and was measured on the same two seeds.

Tuning took 18 rounds measuring 539 variants and 11 unchanged controls; with
the drafts, the confirmations and the remeasurement under `2730eac`, about
98,000 Marshal games.

### Why one bot, and why the strongest

Every bot is deterministic: given a position it makes the same move, and only
the dice differ between games. Where the dice rarely matter, a bot plays much
the same game again and again, so its self-play reports its own habits as well
as the map, and different bots disagree about most boards. On the 48 drafts
(100 games per board each), Apex and Marshal self-play differed by 30 points
on average and by 40 or more on 13 boards. Each put 9 boards in range, but only
3 of them the same. Apex's games reached the turn limit 29% of the time and
lasted 18 rounds on average; Marshal's 3.5% and 11 rounds. The standard therefore
follows one bot, the strongest. It is not a measurement of human play, which
still needs playtesting.

The first tuning pass used a pool of five bots (Tactical, Apex, Beam,
Monte-Carlo and an earlier Marshal), with every ordered pair playing each
board. That pool contained no bot that attacks directly, and the omission
mattered. Classic, a reconstruction of the original game's direct heuristic
play, took most Siege Lines forts when it played Union: Classic self-play gave
Union 95-100% on 12 of the 16 first-draft sieges, in three to seven rounds on
average, including 8 of the 12 that the pool had rated 40-60%. A pool of
cautious bots makes defenses look stronger than they are against a player who
simply attacks.

A skill check between two fixed bots has a related limit: between them the dice
rarely change the outcome, so a seat-swapped pair mostly produces two games,
repeated. "Apex beats Classic from both seats" held on 13 of the first 24
boards of the original Nectaris campaigns, and "Apex beats the rest of the
pool from both seats" on 6.

### What the bots do not do

Neither Apex nor Marshal hurries as the turn limit nears. The evaluation's only
turn-limit term (`sim/src/model.rs`, twinned in `js/ai-model.js`; removed with
the limit on 2026-09-30) adds a bonus
to Xenon's score in the last eight rounds, the same for every move considered,
so it never makes an attack look better; and Marshal's weights do not change
from the first round to the last. Marshal's Union attacks because its weights
value advancing, not because time is short. A person playing Union would press
harder as time ran out, so missions where Xenon wins many games at the limit
(the "At limit" column) may be easier for a human Union than the bots show.

## Designing a campaign

Approved by the user on 2026-09-30 and tested on one new campaign,
[Training Ground](ENVIRONMENT_CAMPAIGNS.md#training-ground). Unlike the rest
of this guide, everything in this section was measured under the current
rules: draws instead of turn limits, factory entry within the move (commit
`abefc7e`).

**The model, in the user's words:** a campaign teaches, and the player moves
first. With "perfect play" on both sides the first player's chance is about
100% on the first maps and falls to about 60% on the hardest. "The best bot we
know about should define it, whatever we have done at the time": today that is
Marshal. No bot is made deliberately weak to produce a curve.

**Targets for a 16-mission campaign:**

- **Curve:** Union (moving first) wins 95-100% of Marshal self-play games on
  missions 1-3, falling evenly to about 60% on mission 16.
- **Playing well matters:** against Marshal's Xenon, Tactical's and Classic's
  Union each win less often than Marshal's Union on every mission, and under a
  quarter of their games on missions 13-16 (the user chose this tuning on
  2026-09-30).

Win rates count wins over games; a draw is not a win.

**Acceptance**, on pooled confirmation games: Marshal self-play within 5 points
of the mission's target (at least 95% on missions 1-3); each weak Union at
least 5 points below Marshal's Union; each weak Union under 25% on missions
13-16. Tuning used these 5 points throughout. At 300 games the 95% interval
of a 70% result is about ±5 points, so a mission 5 or 6 points off its target
may still be on it. The rule is stored as `checks` in the specs file, with
each mission's `target`, and `tools/measure-campaign.js` applies it.

**Measuring a campaign.** From a clean checkout, with Rust's cargo installed:

```sh
# Every mission as specified: build, play every ordered pairing of Marshal,
# Tactical and Classic 150 games per board, and check against the targets.
node tools/measure-campaign.js measure --specs=tools/teaching-campaign-specs.js \
  --out=/tmp/tg/run-a --games=150 --seed=any-new-text
# Variants of missions (a file exporting [{m, label, ...spec fields}]); a
# screen may use two bots and fewer games.
node tools/measure-campaign.js measure --specs=tools/teaching-campaign-specs.js \
  --variants=/tmp/tg/m11.js --out=/tmp/tg/m11-s1 --games=40 --pool=marshal,classic --seed=m11-s1
# Pool runs on different dice seeds by board label, and check the pooled numbers.
node tools/measure-campaign.js check /tmp/tg/run-a /tmp/tg/run-b
# Print the boards (units as roster codes, Union upper case).
node tools/measure-campaign.js view --specs=tools/teaching-campaign-specs.js --missions=11
```

`measure` refuses to run if `sim/data/game-data.json` is out of date, builds
`sim`'s balance binary (`--cargo=PATH` when cargo is not on the PATH,
`--target-dir=PATH` to reuse a build), and writes the export, a board list
and the balance output next to `--out`. It runs balance with
`--draws=pairs`, which adds a `pair-draws` line of drawn games per pairing
after each `pairs` line and changes nothing else in the output; the check
uses it to print each weak Union's score with draws counted half beside its
win rate. `check` refuses to pool two runs with the same dice seed. A board
fails `curve`, `gap` or `late` (the quarter rule on missions 13-16).

**Reference: the original campaign under the current rules.** Union's wins over
60 games on the 16 maps of the PC Engine campaign, REVOLT to NECTOR:

| Map | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Marshal self-play | 92 | 100 | 68 | 58 | 0 | 55 | 92 | 13 | 15 | 38 | 0 | 3 | 0 | 0 | 0 | 0 |
| Classic's Union vs Marshal's Xenon (draws half) | 41 | 100 | 50 | 0 | 0 | 66 | 25 | 0 | 34 | 0 | 0 | 0 | 9 | 0 | 0 | 0 |

The original falls far below the target curve from map 5 on, which suits a
human player against the original's weaker computer opponent, not against the
best bot. Marshal's Union beat Classic's Xenon in 78-100% of games on maps 1-10
and 44-94% on 11-16 (KAISER 6%). The same maps under the turn-limit rules of
`2e14241` gave nearly the same numbers.

**The process used for Training Ground:**

1. Draft 16 missions, each introducing one thing a new player needs, on boards
   that grow from 14×10 to 30×20, with edge barriers
   ([tools/teaching-campaign-specs.js](tools/teaching-campaign-specs.js)).
2. Screen variants that change one thing: the terrain seed of a clustered
   rough-ground layer (hills, wasteland, mountains placed from value noise,
   `texture()` in the specs), one unit more or less, or one squad's starting
   strength. Screens used Marshal and Classic, 20-60 games per pairing.
3. Confirm the best candidate per mission with Marshal, Tactical and Classic,
   every ordered pairing, 150 games each, on a dice seed no screen used; repeat
   on a second fresh seed and pool.
4. Write the confirmed variant into the specs and check that the built board
   (terrain, buildings, units) is identical to the one measured.

Nine screening rounds measured 226 boards (drafts and variants), and five
confirmation rounds 63 boards, some of them the same variant on a second seed;
about 126,000 bot games in all. Those rounds ran on scripts outside the
repository; `tools/measure-campaign.js` is their checked-in form.

**What the tuning showed:**

1. **Open boards let material decide.** On the open drafts, Classic's Union
   did as well as Marshal's: whichever army was larger won, however it was
   played. Choke points and cover created the skill gap.
2. **Terrain alone moves the result as much as the armies do.** With the same
   armies, changing only the rough-ground seed took Classic's Union from 100%
   to 50% on mission 2, and Marshal's Union from 95% to 25% on mission 8.
3. **Material steps are large and not monotone.** On mission 5, Xenon Bisons
   at strength 8, 7 and 6 gave Marshal's Union 80%, 45% and 100%, and
   Classic's 5%, 80% and 23%. On mission 10 one strength-2 Xenon Bison took
   Marshal's Union from about 90% to 5%. On mission 15 an extra Union Bison at
   strength 8, 4 and 2 gave 80%, 58% and 85%. Expect to search, not
   interpolate.
4. **Picks from noisy screens regress toward the middle.** A variant chosen as
   the best of many short screens usually confirms a few points worse; one
   mission-13 candidate went from 68% in its screen to 78% in confirmation.
   Two fresh seeds of 150 games sometimes differed by 13 points (78% and 65%),
   which is why picks are confirmed on two seeds.
5. **Moving first can be a disadvantage.** On the mission-16 draft, with equal
   armies, Union won 17% of Marshal self-play; it needed two extra Bisons to
   reach 61%.
6. **Tactical's Union stalls.** Against Marshal's Xenon it wins almost
   nothing, but with draws counted half it scores about 50% on most missions:
   neither side attacks for 100 turns. It meets the "wins less often" test
   only because a draw is not a win. Classic, which attacks directly, is the
   weak bot that limited the tuning.

**Results.** Union's wins in Marshal self-play (M), and Tactical's (T) and
Classic's (C) Union against Marshal's Xenon, pooled over two fresh seeds (300
games per pairing; mission 4, 450). The reproduction columns are one more
fresh seed, 150 games per pairing, run with `tools/measure-campaign.js` on the
shipped boards; "score" counts draws as half. Mission 11 was re-tuned after
the reproduction (below), so its row is its new confirmation, which recorded
draws.

| # | Mission | Target | M | T | C | Repro M | Repro T | T score | Repro C | C score |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | MONS PICO | 98 | 97 | 43 | 72 | 97 | 51 | 62 | 64 | 64 |
| 2 | MONS PITON | 97 | 100 | 0 | 49 | 100 | 0 | 50 | 49 | 51 |
| 3 | MONS LA HIRE | 96 | 100 | 64 | 27 | 100 | 63 | 80 | 21 | 44 |
| 4 | MONS HUYGENS | 93 | 96 | 8 | 73 | 95 | 9 | 52 | 69 | 69 |
| 5 | MONS BRADLEY | 90 | 94 | 0 | 15 | 93 | 0 | 50 | 21 | 21 |
| 6 | MONS WOLFF | 87 | 89 | 51 | 68 | 86 | 53 | 56 | 75 | 75 |
| 7 | MONS AMPERE | 84 | 84 | 0 | 29 | 84 | 0 | 50 | 29 | 29 |
| 8 | MONS ARGAEUS | 81 | 80 | 0 | 48 | 78 | 0 | 50 | 47 | 47 |
| 9 | MONS VINOGRADOV | 78 | 82 | 45 | 53 | 87 | 44 | 58 | 53 | 53 |
| 10 | MONS GRUITHUISEN | 76 | 80 | 2 | 2 | 76 | 3 | 4 | 1 | 1 |
| 11 | MONS RUMKER | 73 | 74 | 0 | 23 | - | - | 50 | - | 23 |
| 12 | MONTES JURA | 70 | 67 | 27 | 3 | 67 | 32 | 64 | 1 | 1 |
| 13 | MONTES CAUCASUS | 68 | 66 | 21 | 12 | 70 | 27 | 51 | 12 | 13 |
| 14 | MONTES HAEMUS | 65 | 67 | 3 | 11 | 67 | 9 | 34 | 7 | 7 |
| 15 | MONTES TAURUS | 62 | 68 | 8 | 5 | 69 | 8 | 50 | 2 | 2 |
| 16 | MONTES APENNINUS | 60 | 61 | 20 | 5 | 57 | 17 | 44 | 5 | 6 |

**Reproduction.** The checked-in tool reproduced the confirmations within
noise: the largest differences from the pooled 300 games were 8 points
(mission 1, Tactical up and Classic down), 6 (mission 13, Tactical) and 5
(mission 9, Marshal), each under two standard deviations of a 150-game
against 300-game comparison. On that single seed four missions failed the
check: 9 (+9), 11 (-10), 15 (+7) and 13 (Tactical 27%, over the quarter).

**Missions outside 5 points of their target.** Pooling the reproduction's wins
with the two confirmation seeds (450 games per pairing): mission 9 at 84%
(+6, target 78) and mission 15 at 68% (+6, target 62). Mission 11 was at 66%
(-7, target 73) and was re-tuned. Tactical's Union on mission 13 pools at 23%,
under the quarter. Missions 13-16 wait for the user's decision on how the
skill test counts Tactical's draws.

**Mission 11 re-tune (2026-09-30).** Screens of 40-60 games per pairing
(Marshal and Classic) tried eight other terrain seeds (8-90%), an extra Union
Bison at strengths 2-8 (62-95%, not monotone), the extra Xenon Bison at
strengths 1-7 (28-90%), a damaged Xenon Kilroy, Charlie or Panther, and an
extra Union Charlie. Two candidates passed confirmation: a Xenon Charlie at
strength 3 (79% and 69% on the two seeds; 74% pooled) and a Xenon Kilroy at
strength 5 (71% on both). The Charlie at strength 3 is in the campaign.

Missions 12-15 measured 66-68% against targets that fall from 70 to 62, so the
measured curve is flat there rather than falling evenly. Humans have not
played the campaign yet.

## Findings

Marshal self-play unless stated. "Draft" is a mission's first version, before
tuning.

1. **Most drafts were far from balanced, and their ideas rarely predicted the
   result.** Only 9 of the 48 drafts gave Union 40-60%; 21 went to one side in
   90% or more of games. Of the 48 ideas, 6 held under both bots, 11 failed, 10
   held for one bot but not the other, 8 were consistent with the results
   without being tested directly, 1 asked for a quantity that was measured, and
   12 cannot be answered by win rates (tables below). Reasoning about a layout
   did not replace measuring it.

2. **The first mover wins races for neutral factories, and layouts meant to
   even a map mostly did not.** All four ideas that predicted the first mover
   would win a race for a neutral prize held under both bots: RIMA BIRT (Union
   97% Marshal, 100% Apex), SINUS MEDII (98%, 96%), SINUS IRIDUM (96%, 88%) and
   MARE TRANQUILLITATIS (100%, 69%). Of the five ideas that expected a layout
   to even the result, one held under both bots: CLAVIUS (55%, 60%), where
   captured outposts feed the attack. MARE HUMORUM came out even under Apex
   only (53%; Marshal 17%). The other three missed under both: paired
   factories on MARE VAPORUM (100% Marshal, 9% Apex), scattered factories on
   OCEANUS PROCELLARUM (96%, 81%) and long approaches on RIMA CAUCHY (17%,
   30%). Tuning balanced the
   races with a shorter limit (RIMA BIRT, 13 rounds to 9), a smaller prize and
   a shorter limit (SINUS MEDII; SINUS IRIDUM, 24 rounds to 10) or Xenon
   starting nearer the prize (MARE TRANQUILLITATIS).

3. **Whether a defended crossing becomes a standoff depends on the bot.** Apex's
   draft games reached the turn limit on RIMA BODE 53% of the time, ARCHIMEDES
   91%, THEOPHILUS 85%, and RIMA MARIUS, LACUS SOMNIORUM and PALUS PUTREDINIS
   100%; Marshal's on the same boards 0%, 0%, 18%, 0%, 0% and 0%. VALLIS
   SNELLIUS went the other way: 60% of Marshal games reached the limit and 2%
   of Apex games, because Apex's Xenon flew infantry over in its Pelicans and
   took the Union camp (97% of games, in under five rounds on average). Of the
   four ideas that predicted standoffs, RIMA BODE's held for Apex only, VALLIS
   SNELLIUS's for Marshal only, and RIMA MAIRAN's (1% of Marshal games and 9%
   of Apex games at the limit) and RIMAE LITTROW's (0% and 2%) for neither.
   Whether a map stalls depends on how the players use it.

4. **Small changes move the result in large, irregular steps.** One unit, one
   strength point or one hex often moved Union's share by 30 points or more,
   and not always in the expected direction:
   - VALLIS SCHROTERI with five units a side: 43-56%. A sixth Union unit: a
     Charlie 88%, a Kilroy 8%.
   - RIMA MAIRAN, a sixth Union unit: a Bison 94%, a Charlie 54-57%, a
     Kilroy 32%.
   - RIMA BODE, Union's vanguard moved back from the bridge one hex at a time:
     85%, 33%, about 43%, 79%, 97%.
   - MARE VAPORUM with Union one Charlie short: Xenon at full strength 33%;
     both Xenon Lenets at strength 7, 57-65%; only one of them, 88%; the Bison
     and both Lenets, 50-56%.
   - SINUS MEDII's centre factory: a Kilroy 18%, a Charlie 37%, two Charlies
     29%, a Charlie and a Bison 66-71%, a Charlie and a Lenet 91%. One Rabbit
     added to Xenon's army took Union from about 60% to 0%.
   - RIMA PRINZ: a Kilroy added to Union's army took Union from about 44% to
     97%, a Rabbit to 15%. Both Xenon Charlies at strength 7 gave 91%, one of
     them 23%.
   - PLATO, five defenders against six attackers: with a Hadrian 17%, with a
     Charlie in its place 81%.
   - MARE CRISIUM, one Union Charlie at strength 7, 6, 5 and 4: 76%, 55-61%,
     70%, 49-55%.
   - RIMA BIRT, Union's army starting one row north and Xenon's, its mirror
     image, one row south: 92%; the reverse: 6%.
   - SINUS IRIDUM, Xenon's camp one hex farther back: 0%, against 49-59%.

   Strength (1-8, where 8 is full) was the finest lever, and one point on one
   or two units still moved the result by 20 points or more. A change has to be
   measured; its effect cannot be estimated from unit values.

5. **Measurements of 100 games scatter by about ±10 points, and choosing the
   best of several overstates the balance.** Identical boards measured
   repeatedly: RIMA BODE's final layout gave 42%, 40%, 38%, 47% and 47%; RIMA
   HESIODUS with all Xenon units at strength 5 gave 44% and then 65%, three
   standard errors apart. Of the 48 settings chosen during tuning, each measured
   in range, 9 fell outside on the first fresh confirmation seed, all within 7
   points of the range: among several noisy variants, the one nearest 50% is
   usually one whose measurement erred toward 50%. RIMA ARIADAEUS's setting,
   chosen at 47%, then gave 39% and 42% on two fresh seeds. Measuring each
   candidate on 300 games narrowed the gap: seven settings chosen that way at
   48-55% confirmed at 45-54% on 450 fresh games. Confirm on a seed the tuning
   did not use, with 150 games or more.

6. **A fort needs a garrison about the size of the attack, and the kind of
   defender matters as much as the number.** Ten of the 16 draft sieges fell to
   Marshal in 96-100% of games, in 4-9 rounds, with garrisons of 3-5 units
   against 6-9 attackers. In the balanced sieges the defenders, counting their
   factory's reserves, number 0.8 to 1.2 times the attackers in 12 of 16:
   PLATO 6 against 6, ARCHIMEDES 6 against 7, ARZACHEL 8 against 8,
   COPERNICUS 7 against 8, TYCHO 5 against 6, PTOLEMAEUS 4 plus 3 reserves
   against 7. The kind of defender: COPERNICUS's eighth defender as a Lenet
   gave Union 79%, as a Hadrian 19%, as an Octopus 13%; POSIDONIUS's six
   defenders with two Charlies gave 52-53%, with one Charlie and two Lenets
   98%. Guns inside the walls counted for more than tanks.

7. **The turn limit matters only where Union wins late.** There it moves the
   result steadily: RIMA BIRT at 13, 12, 11, 10 and 9 rounds gave Union 97%,
   96%, 85%, 81% and 50-59%; MARE COGNITUM at 36, 20, 16, 14, 13 and 12 rounds
   gave 83%, 77%, 71%, 56-62%, 32% and 20%; SINUS IRIDUM at 18, 14, 10 and 9
   rounds gave 100%, 98%, 80% and 37%. Where games end early it changes
   nothing: RIMA PRINZ gave Union 46% at 30 rounds and 44% at 26, with 2-7% of
   games reaching the limit. Limits decide a share of games on the final
   missions: on average Xenon won at the limit in 10% of a mission's final
   games, and in a quarter or more on eight missions (SINUS IRIDUM 55%,
   ARCHIMEDES 51%, VALLIS SNELLIUS 47%, RIMA BIRT 46%, PLATO and COPERNICUS
   35%, VALLIS ALPES 33%, POSIDONIUS 26%). On nine missions no final game
   reached the limit.

8. **Aircraft and anti-air decide missions built around transports.** On MARE
   INSULARUM a Hawkeye for each side, which shoots Pelicans down, took Union
   from 75-83% to 16-23%; one Pelican a side instead of two then gave 51%, and
   Xenon's two Pelicans at strength 4, 100%. On MARE CRISIUM Union won 59-61%
   of draft games with its second Hawkeye and 31% without it. Under Apex,
   Xenon Pelicans took the Union camp in 97% of VALLIS SNELLIUS draft games.

9. **In artillery duels the side that waits fires first.** A Hadrian or Octopus
   can move or fire in a turn, not both, so a gun moved into range is shot at
   before it can fire. RIMA SIRSALIS was built to reward Union's first volley;
   its draft gave Union 10% (Marshal) and 15% (Apex).

10. **Mountain walls one hex thick stop vehicles, not infantry.** A Charlie
    climbs onto a mountain hex in one move and down in the next, so a ring of
    single mountain hexes only funnels tanks through its gates.

11. **The order of a factory's list changes the bots' play.** SINUS MEDII's
    centre factory holding a Charlie then a Bison gave Union 66-71% (148
    games); a Bison then a Charlie, 87% (100 games). The rules treat both lists
    alike, but the bots consider stored units, and number all units, in list
    order (`sim/src/search.rs`, `sim/src/game.rs`). RIMA BIRT's factories
    hold a Charlie, a Bison and a Lenet: in that order Union won 54% (600
    games), in the other five orders 23-44% (300 games each). This is one more
    way the numbers describe the bots as well as the map.

12. **Balance for one bot is not balance for another.** On the final missions
    Apex self-play gave Union 40-60% on 6 of 48 (10% or less on 16), and
    Classic self-play on 9 (90% or more on 11, 10% or less on 10). Marshal
    beat Apex from both seats on 26 of 48, scoring 60% as Union and 71% as
    Xenon on average. On four missions one seat won more than 90% of mixed
    games whichever bot played it: Marshal scored 9% as Union and 95% as Xenon
    on RIMAE TRIESNECKER, 100% and 2% on SINUS MEDII, 3% and 92% on SINUS
    IRIDUM, and 5% and 92% on MARE HUMORUM.

13. **Even self-play does not make playing well matter.** On the 48 missions
    as tuned for self-play alone (commit `2e14241`), Classic and Tactical each
    played Marshal 64 seat-swapped pairs per mission. Both lost more than half
    their games to Marshal in each seat on 24 missions. On the other 24, a
    weak bot won at least half its games against Marshal in one seat or more:
    33 cases of a weak bot in a seat. In 22 of the 33,
    Apex lost from that seat to the same weak bot, so the map, not Marshal
    alone, let the weaker play win; Apex shares Marshal's search, so the two
    may also share blind spots. Two kinds recur. Classic playing Union beat
    both strong Xenons on the sieges of ALPHONSUS (Marshal won 11% as Xenon,
    Apex 5%), GRIMALDI (2% and 16%) and PTOLEMAEUS (38% and 28%), and on MARE
    CRISIUM (9% and 30%). Tactical playing Xenon beat both strong Unions on
    RIMA BIRT (Marshal won 3% as Union, Apex 0%), ARCHIMEDES (23% and 2%) and
    ARZACHEL (20% and 0%). The no-sure-win test failed on SINUS IRIDUM alone:
    Apex's Xenon beat each of the four Unions at least 97% of the times it
    met them, while Marshal's Xenon beat Marshal's Union 55% of the time.
    Self-play measures how two copies of one bot's habits meet; a weaker bot
    with different habits can find what those copies leave open.

## Per-mission results

Columns:

- **Change from the draft:** what tuning changed; strength runs 1-8, 8 full.
- **Draft:** Union's share of Marshal self-play on the draft (100 games).
- **Final:** Union's share of Marshal self-play on the final mission, over
  seeds no tuning run used: 150 games; where marked `*`, 450 games on two seeds
  (600 on three for RIMA BIRT), for missions re-tuned or measured again after
  their first confirmation.
- **At limit:** the share of those final games that Xenon won at the turn
  limit.
- **Apex, Classic:** Union's share of each bot's self-play on the final
  mission (100 games).
- **Marshal vs Apex:** Marshal's score against Apex on the final mission,
  playing Union / playing Xenon (64 games each).
- **Verdict** on the mission's idea: *Held* (both bots bear it out), *Failed*,
  *Apex only* or *Marshal only*, *Consistent* (in line with the results but not
  tested directly), *Measured* (the idea asked for a quantity), or *Not
  measured*, *Not isolated*, *Not tested*, *Not clear* and *No prediction*
  where win rates cannot answer it.

### Bridgeheads

| # | Mission | Change from the draft | Draft | Final | At limit | Apex | Classic | Marshal vs Apex |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | RIMA BODE | Union vanguard two hexes further back | 85% | 47% | 0% | 2% | 57% | 62% / 94% |
| 2 | RIMA HYGINUS | Union +1 Bison | 19% | 44% | 0% | 0% | 64% | 80% / 100% |
| 3 | RIMA HESIODUS | Xenon Kilroys at strength 6, the rest at 5 (draft: all 6) | 10% | 53%* | 0% | 82% | 62% | 52% / 100% |
| 4 | VALLIS SNELLIUS | Xenon ground units at strength 6 (draft: 7) | 32% | 44% | 47% | 21% | 6% | 3% / 31% |
| 5 | RIMAE TRIESNECKER | Xenon camp one hex back; the neutral factories hold one Charlie each (draft: Charlie, Bison, Lenet) | 98% | 56% | 3% | 0% | 9% | 9% / 95% |
| 6 | RIMA HADLEY | Union +1 Kilroy; Xenon Lenet at strength 7 | 33% | 48%* | 2% | 83% | 36% | 62% / 100% |
| 7 | VALLIS ALPES | Xenon ground units at strength 7, one Charlie at 6 (draft: all 6) | 78% | 53%* | 33% | 16% | 5% | 62% / 77% |
| 8 | RIMA SIRSALIS | Xenon Bison at strength 7 | 10% | 54% | 0% | 36% | 58% | 36% / 75% |
| 9 | RIMA MARIUS | Xenon at strength 7 | 40% | 51% | 1% | 40% | 58% | 98% / 86% |
| 10 | RIMA PRINZ | Limit 26 rounds (draft: 30) | 46% | 44%* | 6% | 57% | 82% | 88% / 50% |
| 11 | RIMA BIRT | Limit 9 rounds (draft: 13) | 97% | 54%* | 46% | 0% | 81% | 77% / 100% |
| 12 | VALLIS SCHROTERI | Union -1 Charlie: five units a side | 88% | 47% | 5% | 0% | 76% | 39% / 81% |
| 13 | RIMA MAIRAN | Union +1 Charlie | 24% | 57% | 1% | 45% | 0% | 81% / 20% |
| 14 | RIMAE LITTROW | Union at strength 6, its Kilroy 7; Xenon at full strength (draft: Union full, Xenon 6) | 94% | 53%* | 2% | 9% | 50% | 50% / 66% |
| 15 | RIMA CAUCHY | Union +1 Bison at strength 5 | 17% | 46%* | 0% | 38% | 21% | 41% / 62% |
| 16 | RIMA ARIADAEUS | The Pelican moved from each side's nearer factory to its middle one; limit 30 (draft: 40) | 71% | 50%* | 7% | 34% | 17% | 70% / 14% |

**Edge ridges (2026-09-30).** The user asked for barriers that stop armies
circling a board along its edge ([decision](PRODUCT.md#edge-barriers-on-four-campaigns-2026-09-30)),
and commit `fd10835` added mountain ridges from the top and bottom edges on
each bank of every Bridgeheads board. Marshal self-play, 150 games per board,
dice seed `cc1542ad…1035a` for both runs, current draw rules: *Before* is the
boards of commit `3c5e3e1` (no ridges), *After* those of `fd10835`.

| # | Mission | Before | After | # | Mission | Before | After |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| 1 | RIMA BODE | 45% | 54% | 9 | RIMA MARIUS | 49% | 76% |
| 2 | RIMA HYGINUS | 46% | 68% | 10 | RIMA PRINZ | 49% | 21% |
| 3 | RIMA HESIODUS | 57% | 81% | 11 | RIMA BIRT | 97% | 100% |
| 4 | VALLIS SNELLIUS | 54% | 49% | 12 | VALLIS SCHROTERI | 45% | 45% |
| 5 | RIMAE TRIESNECKER | 54% | 57% | 13 | RIMA MAIRAN | 53% | 64% |
| 6 | RIMA HADLEY | 49% | 79% | 14 | RIMAE LITTROW | 46% | 29% |
| 7 | VALLIS ALPES | 82% | 37% | 15 | RIMA CAUCHY | 44% | 94% |
| 8 | RIMA SIRSALIS | 43% | 15% | 16 | RIMA ARIADAEUS | 49% | 63% |

Without ridges, 14 of 16 boards passed the self-play test (40-60%) under the draw rules
(VALLIS ALPES and RIMA BIRT did not); with them, 4 of 16 do. Draws were rare
in both runs except on VALLIS SNELLIUS (43 and 58 of 150) and VALLIS ALPES
(11 and 24). The ridges, not the draw rule, moved the other boards out of range.

The user then chose the smallest change that still stops edge circling: the
13 boards whose rille already runs edge to edge went back to their earlier
terrain, so their numbers are the *Before* column. The other three, same seed:

| # | Mission | Edge barrier | No ridges | Final |
| --- | --- | --- | ---: | ---: |
| 2 | RIMA HYGINUS | bridges one row further from the edges, so the rille closes them | 47% | 47% |
| 6 | RIMA HADLEY | mirrored mountain ridges from the bottom edge of the middle plain | 50% | 54% |
| 12 | VALLIS SCHROTERI | ridges from both edges on each side | 45% | 45% |

Hyginus and Hadley: 300 games; Schroteri: 150. Ridges tried on Hyginus instead
gave Union 60% (corner ridges, 300 games), 69% and 76%. With the final boards,
14 of 16 missions pass the self-play test, as before the ridges; VALLIS ALPES
(82%) and RIMA BIRT (97%) do not. The weak-bot and no-sure-win tests were not
rerun.

| # | Mission | Idea | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | RIMA BODE | One crossing: the side that reaches the bridge first holds it, and a held bridge is a stalemate the turn limit awards to Xenon. | Apex only | Apex: 53% of games ended at the limit. Marshal: none did; Union won 85% by attacking over the bridge. |
| 2 | RIMA HYGINUS | Two distant crossings force a split or a gamble, which should make games more decisive than one bridge. | Apex only | Apex: 22% of games at the limit, against 53% on RIMA BODE. Marshal ends both boards before the limit (2% and 0%). |
| 3 | RIMA HESIODUS | Footpaths give capturers fast crossings, which should favor the infantry-heavy side and the first mover. | Failed | With Xenon already under strength, Union won 10% (Marshal) and 39% (Apex). |
| 4 | VALLIS SNELLIUS | Without a vehicle crossing the defender's tanks are never threatened, so the turn limit should decide most games for Xenon. | Marshal only | Marshal: 60% of games at the limit. Apex: 2%; Xenon Pelicans took the Union camp in 97%. |
| 5 | RIMAE TRIESNECKER | Four bridges spread the defense; each side can only guard two, which should make attacks succeed more often than on one-bridge maps. | Held | Captures ended the games: 0% (Marshal) and 3% (Apex) at the limit, against Apex's 53% on RIMA BODE. |
| 6 | RIMA HADLEY | Mirror symmetry puts both armies' mountain flanks on the same side, a head-on meeting unlike a half-turn's crossed flanks. | No prediction | The idea describes the layout; it predicts no result. |
| 7 | VALLIS ALPES | Air transport bypasses a single chokepoint, so it should reduce stalemates compared with a one-bridge map. | Apex only | Apex: 14% at the limit, against 53% on RIMA BODE. Marshal: 12%, against 0% on RIMA BODE. |
| 8 | RIMA SIRSALIS | Artillery across a chasm rewards the first volley, which should favor Union's first move. | Failed | Union won 10% (Marshal) and 15% (Apex): the side that waits fires first. |
| 9 | RIMA MARIUS | Moving the only obstacle toward one camp shifts the balance toward the side it shelters. | Not isolated | No board with a centred rille to compare. Union, the sheltered side, won 40% (Marshal) and 0% (Apex, every game at the limit). |
| 10 | RIMA PRINZ | Ground-attack aircraft remove the chokepoint's defensive value, which should make games more decisive. | Apex only | Apex: 26% at the limit, against 53% on RIMA BODE. Marshal: 2%, against 0%. |
| 11 | RIMA BIRT | A contested middle with factories rewards the first crossing, which should favor the first mover. | Held | Union won 97% (Marshal) and 100% (Apex). |
| 12 | VALLIS SCHROTERI | A strong defensive position can be balanced by numbers; this board measures how many extra units the loop is worth. | Measured | Marshal: less than one unit. Five against five gave Union 56%, 43% and 47% (three seeds); the draft's sixth Union unit, a Charlie, gave 88%. |
| 13 | RIMA MAIRAN | Mines turn crossings into walls; the more closable the crossings, the more games end at the turn limit. | Failed | 1% (Marshal) and 9% (Apex) of games reached the limit. |
| 14 | RIMAE LITTROW | Crossings in series multiply the defender's advantage, pushing the result toward the turn limit. | Failed | No Marshal game and 2% of Apex games reached the limit; Union won 94% under Marshal. |
| 15 | RIMA CAUCHY | Long approaches spread out the first mover's tempo; the longer the march, the closer the result should be to even. | Failed | Union won 17% (Marshal) and 30% (Apex). |
| 16 | RIMA ARIADAEUS | Many kinds of crossing at once: with several ways across, no single hold decides the game. | Apex only | Apex: 8% of games at the limit, against 53% on RIMA BODE. Marshal: 1%, against 0%. |

### Siege Lines

| # | Mission | Change from the draft | Draft | Final | At limit | Apex | Classic | Marshal vs Apex |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | PLATO | Garrison of 6 at full strength (draft: 3 at strength 7) | 100% | 52% | 35% | 11% | 30% | 53% / 72% |
| 2 | ARCHIMEDES | Garrison of 6 (draft: 3); limit 18 (draft: 16); one Union Lenet at strength 7 | 100% | 49%* | 51% | 0% | 92% | 23% / 100% |
| 3 | ARZACHEL | Garrison of 8 (draft: 4) | 100% | 51% | 4% | 0% | 97% | 73% / 100% |
| 4 | ALPHONSUS | None | 42% | 47% | 17% | 33% | 100% | 94% / 80% |
| 5 | PTOLEMAEUS | Union -1 Charlie, -1 Hadrian: 7 attackers | 96% | 43% | 2% | 39% | 92% | 25% / 75% |
| 6 | COPERNICUS | Garrison of 7 (draft: 5); limit 16 (draft: 26) | 99% | 53% | 35% | 0% | 93% | 97% / 100% |
| 7 | TYCHO | Garrison +1 Bison: 5 | 100% | 45% | 3% | 61% | 97% | 69% / 97% |
| 8 | CLAVIUS | None | 55% | 43% | 0% | 68% | 40% | 77% / 89% |
| 9 | GRIMALDI | Relief column starts nearer the fort, at half the board's width (draft: 35%) | 100% | 54% | 10% | 0% | 92% | 98% / 70% |
| 10 | WARGENTIN | Garrison of 8 with its two aircraft (draft: 5) | 100% | 49% | 1% | 38% | 3% | 80% / 75% |
| 11 | GASSENDI | Seeker at full strength (draft: 3) | 67% | 54% | 21% | 100% | 97% | 89% / 14% |
| 12 | POSIDONIUS | Garrison of 6 (draft: 4) | 100% | 55% | 26% | 3% | 86% | 100% / 92% |
| 13 | THEOPHILUS | Xenon factory -1 Bison; limit 22 (draft: 26) | 23% | 57% | 11% | 7% | 78% | 100% / 100% |
| 14 | MAUROLYCUS | Garrison of 5 (draft: 3) | 99% | 51% | 3% | 2% | 52% | 56% / 70% |
| 15 | PETAVIUS | Xenon factory without its Charlie | 35% | 54% | 3% | 75% | 0% | 91% / 61% |
| 16 | MARE ORIENTALE | Xenon factory without its Charlie | 60% | 51% | 21% | 72% | 3% | 12% / 31% |

| # | Mission | Idea | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | PLATO | The turn limit is a siege's balance dial; this board is measured at several limits to find how many rounds the attack needs. | Failed | The draft fort fell in 4 rounds on average (Marshal, 100%), so no limit could balance it; the garrison's size did. |
| 2 | ARCHIMEDES | One gate concentrates the defense, so the attack needs more force than against two gates. | Consistent | Apex: the one-gate draft held (9%) while two-gate PLATO fell (100%). Marshal: balance needed 7 attackers and 18 rounds against 6 defenders, PLATO 6 against 6 in 16. |
| 3 | ARZACHEL | Artillery behind walls multiplies the defense; this board measures how many extra tanks two guns are worth. | Not isolated | Balance came at 8 defenders, two of them guns, against 8 attackers; no variant removed the guns. |
| 4 | ALPHONSUS | Mined gates count as closed, so the number of open gates, not of gates, sets the balance. | Not isolated | In range as drafted (Marshal 42%, Apex 43%); no comparison board without mines. |
| 5 | PTOLEMAEUS | A factory inside the walls lets the defender repair and reinforce, so the attack must be faster or larger. | Consistent | The draft's 9 attackers won 96% (Marshal); balance came at 7 attackers against 4 defenders with 3 reserves. |
| 6 | COPERNICUS | Depth: two rings with offset gates cost the attack more rounds than one ring. | Held | The draft siege lasted 7.8 rounds (Marshal) and 23 (Apex); one-ring PLATO lasted 4.0 and 10.1. |
| 7 | TYCHO | When only infantry can reach the objective, the number of capturers decides, so the attack needs many infantry. | Not isolated | The draft fort fell in every game with or without one of Union's two Charlies (100% both). |
| 8 | CLAVIUS | Intermediate objectives feed the attacker; captured reserves should turn a failing siege into an even one. | Consistent | In range as drafted: Marshal 55%, Apex 60%. |
| 9 | GRIMALDI | Reinforcements create time pressure: the relief column's distance works like a second turn limit. | Failed | The column's start moved Union's share both ways: 100% at 35% of the width, 61% at 45%, 54-60% at 50%, 72% at 55%, 98% at 60%. |
| 10 | WARGENTIN | Air power against anti-air: Eagles should decide the siege unless the anti-air survives. | Not isolated | The draft fort fell in every Marshal game; no variant removed the Eagle or the anti-air. |
| 11 | GASSENDI | Air transport bypasses walls; the walls then matter only as much as the anti-air behind them. | Not clear | The Seeker's strength moved Union between 41% and 82% with no trend (strength 3: 67%; 5: 54% and 69%; 6: 82%; 8: 54%, 41% and 54%). |
| 12 | POSIDONIUS | Obstacles in series: a rille before the wall should act like a second ring. | Failed | The draft fort fell in 5.4 rounds (Marshal) and 8 (Apex), nearer one-ring PLATO (4.0, 10.1) than two-ring COPERNICUS (7.8, 23). |
| 13 | THEOPHILUS | Two objectives force a choice; taking the factory first should trade time for strength. | Not measured | The measurement does not record which objective was taken first. |
| 14 | MAUROLYCUS | The attacker's own camp is a liability; guarding it costs attacking strength. | Not measured | The measurement does not record how many units stayed to guard the camp. |
| 15 | PETAVIUS | Many gates do not help while the inner obstacle has a single crossing. | Consistent | The draft attack mostly failed: Union 35% (Marshal), 5% (Apex). |
| 16 | MARE ORIENTALE | Depth of three rings: the final siege needs the limit and the forces tuned together. | Failed | Neither the limit nor the armies needed tuning: the draft gave Union 60%, the final, with one Charlie fewer in Xenon's factory, 51%. |

### Arsenal

| # | Mission | Change from the draft | Draft | Final | At limit | Apex | Classic | Marshal vs Apex |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | SINUS MEDII | Centre factory holds Charlie, Bison, Kilroy (draft: Charlie, two Bisons, Lenet); limit 14 (draft: 16) | 98% | 52%* | 0% | 40% | 11% | 100% / 2% |
| 2 | MARE VAPORUM | Union -1 Charlie; Xenon tanks at strength 7 | 100% | 55%* | 1% | 1% | 0% | 91% / 52% |
| 3 | LACUS SOMNIORUM | Xenon camp one hex back; one factory pair holds a Charlie (draft: a Bison) | 72% | 47% | 0% | 19% | 42% | 52% / 50% |
| 4 | MARE CRISIUM | Limit 18 (draft: 26); one Union Charlie at strength 4 | 59% | 54%* | 9% | 27% | 89% | 50% / 56% |
| 5 | PALUS PUTREDINIS | Union +1 Charlie; Xenon at strength 6 | 3% | 47%* | 1% | 52% | 99% | 27% / 41% |
| 6 | MARE NUBIUM | None | 59% | 53% | 5% | 32% | 38% | 17% / 31% |
| 7 | SINUS IRIDUM | Horseshoe factory -2 Lenets; limit 10 (draft: 24) | 96% | 45%* | 55% | 0% | 34% | 3% / 92% |
| 8 | MARE FECUNDITATIS | Xenon Lenet at strength 7 | 16% | 48% | 5% | 25% | 0% | 69% / 72% |
| 9 | MARE HUMORUM | Union +1 Charlie | 17% | 51% | 1% | 48% | 100% | 5% / 92% |
| 10 | OCEANUS PROCELLARUM | Xenon camp one hex back, to the mirror position; Union at strength 6 | 96% | 48% | 1% | 25% | 19% | 48% / 81% |
| 11 | MARE COGNITUM | Limit 14 (draft: 36); Union Hadrian at strength 7 | 83% | 44%* | 20% | 23% | 58% | 31% / 88% |
| 12 | MARE SERENITATIS | One of Union's two near factories -1 Lenet | 78% | 50% | 0% | 0% | 98% | 53% / 83% |
| 13 | MARE TRANQUILLITATIS | Xenon lands nearer the middle | 100% | 56% | 0% | 23% | 8% | 66% / 86% |
| 14 | MARE INSULARUM | Each side +1 Hawkeye, -1 Pelican | 83% | 51%* | 0% | 34% | 41% | 53% / 69% |
| 15 | LACUS MORTIS | None | 54% | 55% | 1% | 21% | 25% | 56% / 92% |
| 16 | MARE NECTARIS | None | 45% | 57% | 1% | 61% | 75% | 86% / 64% |

| # | Mission | Idea | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | SINUS MEDII | A central prize rewards the first mover; this board measures how large that advantage is. | Held | Union won 98% (Marshal) and 96% (Apex) with slow Kilroys starting farther back; balance needed a smaller prize and a shorter limit. |
| 2 | MARE VAPORUM | Paired factories, one nearer each side, remove the race for a single prize, so the result should sit near even. | Failed | Union won 100% (Marshal) and 9% (Apex). |
| 3 | LACUS SOMNIORUM | Many small prizes spread the capture race, so the head start should matter less than with one large prize. | Marshal only | Marshal: 72%, against SINUS MEDII's 98%. Apex never attacked: all 100 games at the limit. |
| 4 | MARE CRISIUM | Air reserves raise the stakes of each capture; one captured air factory should swing the game more than a tank factory. | Not measured | No tank-factory version of the board to compare. |
| 5 | PALUS PUTREDINIS | Immobile reserves take turns to bring into action, which favors the side whose factory is nearer the fighting. | Not tested | Both sides' factories are equally far from the fighting; Union won 3% (Marshal) and 0% (Apex). |
| 6 | MARE NUBIUM | Factories near the enemy camp make raids decisive, and the first raid should favor the first mover. | Marshal only | Marshal: Union 59%. Apex: 34%. |
| 7 | SINUS IRIDUM | A defensible prize turns the first capture into a lasting advantage, so this board should favor the first mover. | Held | Union won 96% (Marshal) and 88% (Apex). |
| 8 | MARE FECUNDITATIS | A prize reachable only by transport rewards the side that captures the transport first. | Not measured | The measurement does not record who captured the transport. |
| 9 | MARE HUMORUM | Choosing between a near small prize and a far rich one is a timing gamble that should stay balanced while the far prizes are equidistant. | Apex only | Apex: Union 53%. Marshal: 17%. |
| 10 | OCEANUS PROCELLARUM | With many scattered factories the capture race averages out, so the result should be near even. | Failed | Union won 96% (Marshal) and 81% (Apex). |
| 11 | MARE COGNITUM | Repair stations near the front favor the side that holds them longer, which should be the side that reaches them first. | Marshal only | Marshal: Union 83%. Apex: 17%. |
| 12 | MARE SERENITATIS | Unequal factory layouts can balance when the reserves of each side reach the front at about the same time. | Consistent | One fewer Lenet in one of Union's two near factories took Union from 78% to 50%. |
| 13 | MARE TRANQUILLITATIS | When all combat power is in reserve, capture timing is the whole game, which should favor the first mover. | Held | Union won 100% (Marshal) and 69% (Apex) with its landing parties under strength. |
| 14 | MARE INSULARUM | When reserves are hard to reach, transports decide the tempo. | Consistent | The Pelicans set the result: with a Hawkeye each, two Pelicans a side gave Union 16-23%, one a side 51%, and Xenon's two at strength 4, 100%. |
| 15 | LACUS MORTIS | Large owned reserves near the camps favor the defender, so the neutral prizes in the middle must be worth fighting for. | Consistent | In range as drafted under Marshal (54%); Apex 23%. |
| 16 | MARE NECTARIS | Everything at once: with many kinds of reserve, no single capture should decide the game. | Consistent | In range as drafted under Marshal (45%); Apex 64%. |
