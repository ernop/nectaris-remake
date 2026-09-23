# First-player advantage: options and tradeoffs

Researched 2026-09-23 in response to the user's report that the first player
often has a large advantage, particularly on symmetric maps with equal armies.
**Status: research and proposals only.** No balancing rule, map edit or feature
in this document is approved or implemented. The size of the reported advantage
has not been measured in this investigation. Imported campaigns retain their
recorded fidelity requirements; potential experiments belong in separately
identified original/custom competitive variants.

## What appears relevant to this remake

Equal terrain and armies do not remove the timing difference between two
whole-army turns. The following are observations from the current
[mechanics](MECHANICS.md) and engine, followed by design inferences:

- Capturing a factory transfers its reserves immediately. Ready reserves can
  deploy in the same turn, although deployment spends their activation. Capturing
  infantry receives four experience levels and enters storage. A one-turn lead
  can therefore acquire substantial forces, block exits and enable further
  expansion. This is a candidate mechanism for snowballing, not a measured cause.
- Entering enemy zones of control stops movement. Occupying a narrow pass first
  may determine the frontline before the other army gets to respond.
- Support and defender-only surround use the live board. A whole-army turn gives
  the active side opportunities to build combinations before the opponent can
  reposition. This benefits the active side generally; opening control may make
  the first such combination especially valuable.
- Adjacent exchanges already use both pre-battle strengths when a counterattack
  is legal. They do not use the common model in which the first hit weakens that
  same exchange's return fire. However, damage still weakens later actions,
  destroyed units lose their future activations, and indirect fire has no counter.
- There is no money, production or income economy. An Advance Wars cash bonus
  cannot transfer directly; deployment, position, squad strength and experience
  are the available equivalents.
- Player 0 starts. Expiration after player 1's turn awards player 1/Xenon the win.
  That is an existing campaign asymmetry, not evidence that a symmetric battle
  is balanced. Battlefield wins and timeout wins must be reported separately.

Recent original fjord maps have identical small starting formations and
factories holding four to eight reserve units, sometimes including another
capturing infantry unit. This makes capture timing worth investigating first.
Symmetric layouts can still offer meaningful counterplay: an exposed central
capture can be punishable rather than a guaranteed advantage. Moving first and
initiating the first attack are different things.

## Options

Effort labels estimate relative implementation and design work, not elapsed time.
All suggested effects on this remake require playtesting. Precedents establish
that a mechanism is used elsewhere, not that it yields a particular win rate here.

| Option | Adaptation to this game | Benefits | Costs and risks | Effort |
| --- | --- | --- | --- | --- |
| 1. Tune objectives and routes | Give each army secure access to its first reserve factory; spread contested value across several routes; provide a way to contest or bypass a pass. Reduce the reward concentrated in a single shared factory. | Preserves normal rules; can preserve exact map and army symmetry; targets factory races and territorial lockouts. | Every map needs testing. More distance merely postpones the same race; stronger defensive terrain can entrench the first occupier. Excessive safety can cause stalemates. | Low code; medium ongoing map work. |
| 2. Give the second player a small positional or material bonus | Move one existing capturing unit slightly forward; alternatively add a small reserve or adjust selected starting strength/experience. | Simple and visible; map-specific tuning; normal turns and combat remain intact. Position-only compensation keeps the same roster. | Breaks exact starting symmetry. Extra infantry can win several factories, so its value is highly nonlinear; a full extra squad may overcompensate. Experience has uneven tier effects. | Low for a variant map; medium for a general configurable mode. |
| 3. Limit the first opening turn | Give the first player a configurable opening movement budget or limit which units can activate, then use normal turns. | Keeps equal armies and symmetric terrain; directly reduces the initial timing lead. | Exceptions must cover factory deployments and transports. One unrestricted infantry might still win the decisive race, while halving slow units' movement may punish them excessively. It can simply reverse the advantage. | Medium. |
| 4. Give the second player a limited opening preparation | Before ordinary play, allow a specified noncombat reposition or deployment within a bounded home area. | Keeps equal force totals; compensation is something the player chooses; can prepare a response to an early rush. | If unrestricted it is simply a new first turn for the second player. Must limit distance, area, captures and other consequential actions; it may not address later contested factories. | Medium. |
| 5. Delay access to newly captured neutral reserves | Transfer the factory, but make its original reserves unavailable until the capturer's next turn, after an opponent reply. | Directly reduces the immediate capture-to-deployment swing; applies equally to both sides; preserves initial symmetry. | Does not remove the ownership lead. Requires explicit recapture/readiness rules, UI feedback and save support. Existing reserve and infantry interactions change; defensive races may remain. | Medium. |
| 6. Swap/pie opening | Player A makes a specified opening, then B chooses which army to control; play continues with the army whose turn is next. | Discourages an excessively strong opening without a designer choosing an exact handicap; starting armies can remain equal. | Strange for players attached to a faction. Whole-turn openings are harder to evaluate than one Hex move. A winning opening must not end the match before the choice; revealing combat randomness before swapping changes the incentive. Needs a carefully bounded opening phase and competent AI evaluation. | Medium for human play; higher including AI. |
| 7. Bid for initiative | Players bid the compensation they will give the opponent for the right to move first, using a defined opening-handicap scale. | Can adapt to map and player knowledge; useful for competitive communities; makes the perceived value of initiative observable. | No existing currency or reliable universal unit prices. A new handicap scale and setup interface are required; novices can lose in the bidding phase. Agreement does not prove objective balance. | Medium–high. |
| 8. Score compensation (komi) | Add objective scoring and give the second player a calibrated score allowance, or use compensation in an agreed adjudication system. | A potentially fine-grained balancing parameter; keeps equal starting armies and ordinary turns. | Current victory is capture/elimination, not accumulated points. A tie-break bonus cannot compensate when games end decisively; meaningful komi requires a scoring mode and may encourage stalling. | High for meaningful use here. |
| 9. Two-game matches with sides exchanged | Play the same scenario twice, each person controlling each army/turn position once; combine results under declared match rules. | Immediately equalizes exposure to the opening role; preserves all single-game mechanics and maps; useful for testing. | Approximately doubles play time; individual games can remain frustrating. Two first-player wins produce a tied match unless a fair extra procedure exists. Learning from game one and combat luck remain. | None for an agreed manual format; low–medium for integrated match tracking. |
| 10. Alternate unit or small-group activations | A acts with one unit, then B, continuing until both armies have acted; optionally use small fixed groups. | Allows responses between threats; reduces the amount of an army that can attack unanswered; less waiting. | Changes support/surround tactics, factory timing and AI substantially. Unequal unit counts create activation advantages; need pass rules, transport handling and protection against last-then-first activation combinations. Does not automatically remove initiative advantage. | High. |
| 11. Reaction/overwatch actions | Let eligible defenders reserve a limited shot or other response for enemy movement. | Gives the inactive army agency and makes crossing exposed ground more contestable; can preserve whole-army turns. | Existing adjacent counterattacks already provide some response. New reaction fire needs trigger/order/ammunition or action limits and useful previews; can reward camping and entrench the first player to secure a choke. | High. |
| 12. Simultaneous orders (WEGO) | Both sides commit orders privately, then the game resolves movement and combat together. | Removes the whole-army sequential response gap; keeps initial symmetry and emphasizes prediction. | Major redesign of path collisions, targets that move, captures, support, ZOC, simultaneous deaths, AI, undo and presentation. Hidden intentions change the nature of tactics. Resolution tie-breakers can reintroduce bias. | Very high. |

## What the online sources actually establish

**Advance Wars By Web is the closest precedent for modest starting compensation.**
Its own FAQ identifies first-turn advantage and says a predeployed infantry for
the second player counters it on many maps, while explicitly noting that the
solution is not always that simple. The lesson for this remake is to tune a
small opening offset against the map, not to assume that one extra Charlie is
the correct amount. [AWBW FAQ](https://awbw.amarriner.com/guide.php).

**Second-player compensation need not be a permanent combat buff.** Blizzard
documents a larger opening hand plus The Coin for Hearthstone's second player.
This illustrates one-time compensation, but its value cannot be converted
directly into movement or units here.
[Blizzard: Opening Moves—Mulligans](https://hearthstone.blizzard.com/en-us/blog/21363040).

**Map placement is a balance parameter.** Wesnoth's development wiki explains
how terrain, villages, starting resources and reinforcement capacity change a
scenario; it gives a concrete example of moving a village one hex closer to
the player. This is scenario-design guidance, not controlled evidence about
Nectaris's first-player advantage.
[Wesnoth scenario balancing](https://wiki.wesnoth.org/BuildingScenariosBalancing).

**Pie rules make the opening proposer consider both sides.** Hex's swap rule
allows the second player to take the first player's color after the initial
move. The community's detailed explanation also discusses the limits of exact
fairness; this is a practical balancing mechanism, not a general guarantee of
a 50% outcome. The proposed multi-unit adaptation above is our own design idea.
[HexWiki: Swap rule](https://www.hexwiki.net/index.php/Swap_rule).

**Bidding is an established optional side-selection mechanism.** Axis & Allies:
North Africa's published rulebook includes reinforcement-point bidding for two
players who want the same side, with a first-round resource award to the other
side. Nectaris would need to define its own compensation unit.
[North Africa rulebook, p. 38](https://www.axisandallies.org/files/rules/A-A_NorthAfrica_Rulebook_v9_WEB.pdf#page=38).

**Komi works naturally when a game has a score.** The American Go Association's
US Open rules award White 7.5 points in even games. This establishes the scoring
compensation precedent; neither that number nor Go's scoring translates directly
to a capture/elimination game.
[AGA US Open rules](https://usgo.org/content.aspx?club_id=454497&module_id=563507&page_id=22).

**Alternating activations still need supporting balance rules.** Kill Team's
June 2025 Lite Rules alternate operative activations. They also include a
counteract mechanism when one player's units are exhausted and, after the first
turning point, more command points for the player without initiative. Those
extra mechanisms are a useful warning against assuming that alternation alone
solves all action-count and initiative issues.
[Kill Team Lite Rules](https://assets.warhammer-community.com/eng_jun25_kt_lite_rules-5yqs3aeeud-r6homxqjvf.pdf).

**Simultaneous orders are a proven format, not a small patch.** The publisher
describes Combat Mission: Shock Force 2's WEGO mode as both players planning
60 seconds of combat, followed by simultaneous execution and replay. Our
prospective hex-game version would require its own resolution rules.
[Matrix Games: Combat Mission Shock Force 2](https://www.matrixgames.com/game/combat-mission-shock-force-2).

## Attractive shortcuts that do not solve the whole problem

- **Randomly choose who starts.** Fair access to an advantage is useful, but
  does not make an individual match's starting roles equally strong.
- **Simply alternate the first player each round.** Whole-army order becomes
  `A B | B A | A B`, giving consecutive full turns across round boundaries.
  Randomizing round initiative has the same risk. Age of Sigmar's 2024 design
  explicitly attached a scoring opportunity cost to choosing a double turn;
  this is a dated design precedent, not a statement of all current AoS rules.
  [Designer explanation](https://www.warhammer-community.com/en-gb/articles/mDgZvpSL/battle-tactics-are-the-key-to-winning-in-warhammer-age-of-sigmar-heres-how-they-work-in-newaos/).
- **Ban attacks on the first turn.** Helps only if immediate attacks are the
  problem. Factory capture, positioning and ZOC can decide an opening without
  a shot, and first contact may occur much later.
- **Increase starting distance.** May provide preparation time, but both
  players reaching the decisive tile on their own turn three still lets the
  first player arrive first.
- **Give a permanent blanket defense bonus.** Could change outcomes, but changes
  all subsequent combat matchups to repair an opening issue. It risks making
  defending or waiting too attractive and requires broad rebalancing.
- **Add more randomness.** Can obscure a repeatable advantage while leaving
  its expected value intact, and makes skill less decisive.

## Recommended experiment sequence

Start with representative original/custom maps and determine whether advantage
comes primarily from reserve acquisition, choke occupation or early combat.
Do not assume that all maps need the same compensation.

1. **Map-only variant:** secure first-factory access for both players, and reduce
   any single uncontestable central reserve jackpot. Preserve symmetry where
   possible. Check the actual move-cost paths for Charlie, Panther and carriers,
   including ZOC and unloading, rather than measuring geometric distance alone.
2. **Small opening-offset variant:** if asymmetric placement is acceptable, try
   one existing second-player capturing unit one legal hex farther forward.
   This is a starting hypothesis, not a selected balance value; compare it with
   the unmodified opening. An extra infantry is a separate, potentially much
   stronger experiment.
3. **If equal placement is essential:** test a clearly displayed first-turn
   movement restriction, or delayed neutral-factory reserve readiness when the
   observed problem is immediate reserve deployment. Test these separately.
4. **Use sides-exchanged matches** for human evaluation and competitive sessions.
   Consider alternating activations only if the goal includes a substantial
   change to the game's tactical rhythm.

Suggested measurement plan (not executed):

- Cross player/AI identity, starting map side and initiative, rather than always
  letting the same controller play player 0. Keep turn counting and timeout
  conditions fair in the experimental harness when changing who starts.
- Run several hundred games per map/variant as an initial screen, across many
  seeds and more than one policy/opening. Near 50%, 400 independent decisive
  games give an approximate 95% sampling margin of ±5 percentage points. This
  does not include AI bias or establish human balance. For correlated paired
  games, uncertainty must respect the pairing rather than treating every game
  as independent.
- Reuse seed sets for controlled comparisons, but do not claim identical seeds
  produce identical individual battle rolls once action orders diverge.
- Record starting-player wins, draws and timeouts separately, along with first
  contested-factory captures, reserve ownership, survivors after first contact,
  match length and no-progress/stalemate rates. An aggregate 50/50 result can
  conceal severely biased individual maps or an undesirable mix of rush wins
  and second-player timeout wins.
- Validate promising settings with people switching sides, especially players
  capable of exploiting factory chains and waiting for favorable engagements.

The existing self-play in `test/run-tests.js` runs one seeded game per included
map as a crash/termination check. It is not a first-player balance experiment.
No gameplay tests were run for this documentation-only research task.
