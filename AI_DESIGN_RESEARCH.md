# AI strength, playing styles and human experience

Research and proposals, 2026-09-23. Requested as an analysis and discussion;
this document does **not** approve a new opponent, change the rules, or
supersede the CPU fidelity requirements. No gameplay implementation changed.
The analysis concerns the present remake, not an exact reconstruction of the
original CPU. Source code, rules and current map data were inspected alongside
the primary research linked below.

## Assessment

Nectaris is well suited to a much stronger, fair computer opponent. Its state
is visible, legal actions are discrete, and the engine already simulates the
rules without rendering. Random combat does not prevent strong play. The
principal computational problem is coordinating many units and their action
order, with consequences extending through the opponent's next turn.

A stronger handcrafted planner with bounded search is the sensible first
experiment. It could offer a substantial increase over the existing policy
without model training or a server. Expert or superhuman performance is a
plausible longer-term research target, not a measured result or a promised
outcome. Playing strength, robustness, recognizable style and enjoyable
opposition are separate objectives.

## What exists, and what was measured

`js/ai.js` deploys reserves, handles some transport planning, orders activations
by broad unit role, and greedily chooses a unit's best scored attack or advance.
It evaluates possible firing positions and expected combat casualties using
the actual combat model. It retreats some battered units into factories,
uses buggy retreat movement and reacts to certain infantry airlifts.
Actions see the updated board, so the policy does benefit from earlier actions;
it does not search coordinated alternatives to those actions or enemy replies.

Important limits visible in the code:

- Most objective selection and ground advance use geometric hex distance,
  not a strategic route through the map. Terrain-aware distance is used in
  transport planning. Folded corridors can require initially moving away from
  the geometrically nearest objective.
- The activation order is substantially fixed: carriers, ranged units,
  ordinary combat units, then capturers, with value-based ordering within roles.
- Attack scoring emphasizes the immediate exchange. It does not simulate the
  enemy's following turn, a coordinated breakthrough or a full repair cycle.
- The material valuation includes strength and role bonuses but not experience
  or cargo. Experience does affect the combat expectation itself.
- There is no universal priority for an immediately available winning capture.
- The existing all-map self-play tests check crashes and termination, not
  human-relative strength or balance.

The reproducible [baseline probe](tools/ai-research/baseline.cjs) and
[dated output](tools/ai-research/baseline-2026-09-23.json) record these additional
observations:

1. A synthetic 7×5 position gives Union Charlie a legal one-step capture of
   Xenon's empty base. With seed 42 the AI attacks another Charlie instead and
   does not win that turn. Executing the legal capture on a fresh copy wins
   immediately. This establishes a concrete missed win, not its prevalence.
2. The current library has 71 maps. Twisted Fjords is 65×49, with 180 initial
   reserves; compact campaign maps and the original large maps present quite
   different workloads.
3. Eighteen self-play games on six selected maps, with seeds 42, 43 and 44,
   completed: seven base wins, nine eliminations and two turn-limit results.
   Both sides used the same existing AI. This sample cannot establish strength,
   side balance, or a general probability of stalemate.
4. The slowest measured AI half-turn in that single local Node v22.22.1 run was
   about 21 ms, excluding UI animation. That is evidence that this baseline is
   inexpensive on this machine; it does not measure search throughput or
   establish a browser performance budget.

Reproduce without modifying game data:

```sh
node tools/ai-research/baseline.cjs /tmp/nectaris-ai-baseline.json
```

## The features that determine the AI problem

| Game feature | Strategic effect | Human experience and AI implications |
| --- | --- | --- |
| Visible terrain, units, reserves and cargo | Decisions use a shared board state; future combat remains random | Fair AI can calculate very accurately without extra information. No bluff-reading or scouting problem is required by the current rules. |
| An entire army acts before the opponent | Order changes support, blockers, ZOC, captures and deployment | Satisfying combinations, but a large planning burden. A strong opponent can inflict a severe swing before the human can respond. |
| Support, surround and live ZOC | Positioning one squad changes another squad's value and legal routes | Combined-arms planning matters more than isolated damage scores. Threat displays must distinguish current fire from possible movement and attack. |
| Factories transfer their finite reserves | Capturing an objective can acquire an army and deny it to the enemy | A weak capturer can be strategically decisive. There is no purchasing economy, but there is a race for forces and positions. |
| Factory mouths and deployment costs | Reserve strength is constrained by exit availability and deployment tempo | A dozen stored squads are not a dozen immediately fighting squads. Blocking a mouth or choosing deployment order can be decisive. |
| Full repair with experience retained | A surviving veteran can regain strength; a destroyed one cannot | Retreat, finishing damaged squads, repair access and rotation matter. Attrition may become repetitive if no alternative route or objective breaks it. |
| Instant victory from base capture | Material advantage is insufficient if the base is vulnerable | Provides comebacks and sacrifices, but missed threats can feel like sudden, unexplained losses. |
| Terrain and specialized movement | A mountain is a barrier to tanks but an infantry route; aircraft bypass it | Map topology differs by chassis. Transport landing rules and activation delays require planning beyond straight-line distance. |
| Indirect fire and movement restrictions | Range bands, blind spots and move-or-fire commitments create timing problems | Artillery can make approach costly; a repositioning decision is an investment in a later turn. |
| Damage randomness and experience | The same action has several outcomes; small surviving forces may still matter | Good decisions can lose, and bad ones can win. Evaluate chances of kills and objective survival, not just mean casualties. |
| Xenon wins on the turn limit | The two factions have different burdens even with matched armies | Strong Xenon may rationally defend and delay. Geometric symmetry alone does not establish fair competitive conditions. |
| Noncombat undo, forecasts and saved play | Humans can inspect and reconsider without changing combat outcomes | Already useful supports for deliberation. Long-term threats remain harder to see than an individual battle's odds. |

Several features could amplify frustration at high strength: irreversible
combat, accumulating veteran advantage, single-move base losses, long periods
of repair and redeployment, and much time spent finishing an already lost
position. These are design hypotheses to test with players, not findings from
a Nectaris user study.

The existing large maps especially reward logistical understanding. A one-exit
factory, several connected factories, a transport route and a central crossing
are strategic systems, not just collections of nearby attack targets. A strong
AI might also discover unattractive but legal dominant strategies, such as
edge-based defenses that avoid surround or clock-preserving repair rotations.
They are possibilities to investigate, not established exploits.

## Where other games provide evidence

**Chess and Go:** visible positions and exact rules make reliable search and
learned evaluation effective. AlphaZero demonstrated a combination of self-play
learning and search across chess, shogi and Go. Nectaris shares these useful
properties, but adds chance and many same-player decisions per turn. There is
no defensible single number saying it is harder or easier than Go. Nor does
AlphaZero's success supply a training-cost estimate for this project.
[Primary report](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/alphazero-shedding-new-light-on-chess-shogi-and-go/alphazero_preprint.pdf).

**Backgammon:** the especially useful analogy for visible state plus chance.
TD-Gammon combined a value function learned through self-play with shallow
lookahead and achieved play reported above the best humans. Randomness permits
individual upsets while still allowing a large sustained skill advantage.
Nectaris needs a larger action representation, but it does not need randomness
removed to support strong AI.
[Tesauro, 2002](https://research.ibm.com/publications/programming-backgammon-using-self-teaching-neural-nets).

**Risk:** shares territorial objectives, force concentration and uncertain
attrition. Standard multiplayer Risk also has coalition incentives and
negotiation that are absent here. Those distinctions make Nectaris a cleaner
two-sided optimization problem. Research applying search to Risk territory
drafting is narrower evidence than a whole-game superhuman result; it should
not be advertised as the latter.
[Risk drafting research](https://ojs.aaai.org/index.php/AIIDE/article/view/12388).

**Poker:** Pluribus demonstrated strong performance against elite players in
six-player no-limit poker. That shows that randomness and hidden information
are not absolute barriers to AI. However, bluffing, private cards and
information-set strategy are not the central problems here; importing a poker
solver architecture would be a poor first choice.
[Brown and Sandholm, 2019](https://doi.org/10.1126/science.aay2400).

**StarCraft and tactical strategy research:** heterogeneous armies and
coordination are closer to this game's action problem. AlphaStar achieved
Grandmaster results using a league of strategies and counter-strategies.
Nectaris has neither its real-time execution burden nor its fog-of-war problem.
Research in microRTS also demonstrates why searching abstractions of large
action spaces can be useful. These are transferable architectural lessons,
not a direct strength comparison.
[AlphaStar](https://www.nature.com/articles/s41586-019-1724-z),
[action abstraction research](https://ojs.aaai.org/index.php/AIIDE/article/view/13018).

Two lessons concern what happens after AI becomes very strong:

- A study of 5.8 million professional Go decisions found improved estimated
  decision quality and increased novelty after superhuman AI appeared. The
  observational findings do not establish every causal link or imply that all
  players enjoy losing to a stronger opponent. They do support investigating
  AI as a tool for discovering and teaching new strategies.
  [Shin et al., 2023](https://www.pnas.org/doi/10.1073/pnas.2214840120).
- High average strength does not ensure robustness. Research found adversarial
  strategies that defeated tested superhuman Go agents. The lesson here is to
  test against varied opponents and deliberately awkward maps, not to rely on
  a self-play score alone. This is evidence about the evaluated systems, not a
  claim about every current Go engine.
  [Wang et al., 2023](https://arxiv.org/abs/2211.00241).

Human-like behavior is also a different training target from optimal behavior.
Maia learns moves made by humans at particular skill levels. That is a useful
model for calibrated opposition, but this project does not currently have
anything comparable to chess's human-game corpus.
[Project Maia](https://www.microsoft.com/en-us/research/project/project-maia/).

## Technical options

| Approach | What it would do here | Practical assessment |
| --- | --- | --- |
| Stronger rules and utility scoring | Prioritize wins and forced defense; assign objectives; route through terrain; value repair, cargo and reserve access | Low infrastructure cost and an excellent baseline. Will retain blind spots if it only scores one unit at a time. |
| Beam search over action sequences | Keep a limited number of promising partial plans; compare enemy replies | Best first search prototype. Controllable local computation, understandable candidate plans. Pruning can discard delayed combinations. |
| Monte Carlo tree search | Allocate simulations among actions and sample battle outcomes | Natural treatment of stochastic play. Needs strong candidate generation, useful rollout policies and control of the enormous branching factor. |
| Rolling-horizon evolutionary search | Mutate and compare candidate sequences of orders | Worth benchmarking for multi-unit turns. Must repair illegal sequences and replan after observed combat; a fixed script is not a contingency policy. |
| Learned value function plus search | Learn which positions tend to win, then use that estimate to guide shallow planning | A practical learning bridge after a good search baseline. Can bootstrap on generated games; must avoid learning only the baseline's weaknesses. |
| Learned policy and value through self-play | Learn action priorities and evaluation across a league of opponents | Highest plausible long-term ceiling, with significant training, evaluation and deployment work. Generalization to custom maps and unit definitions is a separate requirement. |
| LLM-assisted strategy or explanation | Propose high-level objectives or explain verified engine analysis | Potentially useful for coaching and scenario discussion. An LLM-only move selector has no demonstrated advantage here; legal actions and numerical claims should remain grounded in the engine. |

The current simulator is known. Learning a replacement dynamics model, as in a
MuZero-style approach, is unnecessary for a first system. Neural inference can
eventually run locally after offline training; it does not inherently require
a paid API. Conversely, a substantial neural runtime would need an explicit
decision about the project's dependency-free distribution constraint.

An appropriate first architecture:

1. **Global priorities:** detect available wins, immediate loss threats and
   high-value factory races; assign small groups to objectives with a stable
   plan so units do not repeatedly change their minds.
2. **Candidate generation:** use the engine's legal queries to propose a small
   set of purposeful choices: support placement, safe firing positions,
   blocker removal, captures, repairs, transport stages and mouth clearance.
3. **Sequence search:** compare choices of both the next unit and its action.
   Simulate enough of the rest of the turn and plausible enemy replies to
   expose tactical consequences. Extend urgent capture and combat sequences
   instead of stopping at an arbitrary shallow horizon.
4. **Chance handling:** use exact weighted battle outcomes for important local
   exchanges and sampled continuations for larger trees. Replan after observing
   the actual outcome; do not commit the entire turn to one imagined roll.
5. **Evaluation:** winning probability is the eventual target. Heuristic terms
   should account for objective safety, force roles and matchups, experience,
   cargo, capturers, repair access, time to deploy reserves, routes, support
   and the remaining turn budget. Raw casualty rewards can teach bad strategy.
6. **Presentation:** execute selected actions through the existing animated
   event model, and retain grounded reasons for optional explanations.

At each internal decision the same player may act again. A chess-style negamax
routine must not flip the evaluation sign after each squad action; ownership
changes only when the side ends its turn. The state must include spent-action
flags, transport transfer allowances and all other future-relevant details.

The combinatorial issue is serious even on moderate boards. An illustrative
20 units with 20 choices each gives 20^20 assignments before action ordering;
naively multiplying by 20! yields about 2.6×10^44 ordered sequences. This is
not a measured Nectaris branching factor: many sequences are illegal or
equivalent. Search must exploit that equivalence, meaningful candidate
selection and spatial locality. Distant fronts are often approximately
independent, but captures, reserves, air transport and shared roads can couple
them again.

The combat calculation has only 14 weighted coefficients for each firing side.
Under the current independent-roll model, an exchange has at most 196 roll
pairs, which can often be merged into fewer distinct successor states. AI
search can calculate exact local distributions without replacing the requested
100,000-trial human forecast UI. Mean damage alone loses kill thresholds and
whether a route becomes open after the battle.

Search also needs a separate treatment of simulation state. Existing snapshots
are useful for correctness prototypes, but include the live RNG state, map,
types and logs; restoration also touches global type definitions. A search
adapter should avoid exposing the live RNG state to the policy, supply
independent simulated chance, and eventually support cheap isolated copies or
make/unmake operations. Repeatedly restoring a real snapshot and playing its
actual next rolls would give the AI information the human does not have.

Local Web Worker execution and an interruptible node/time budget are natural
deployment choices. An initial budget such as 0.5–2 seconds per side turn is
an experiment to measure on representative browsers, not a performance promise.
Large maps may require assigning strategic objectives infrequently while
spending tactical computation near contested objectives.

## Styles, strength and play modes

These are proposed personalities, not claims that the AI already implements
them. They can share a core search engine while differing in candidate
priorities, evaluation preferences and selection among similarly valued plans.

| Personality | Likely play | Enjoyment and stress to test |
| --- | --- | --- |
| Raider | Fast capturers, bypasses, airlifts, threats to bases and factory access | Creates movement and comeback chances; can punish a single missed threat harshly. |
| Combined-arms commander | Support formations, screens, focus fire and coordinated breakthroughs | Makes the game's positional rules visible; can feel relentless when coordination is much better than the player's. |
| Logistician | Protect veterans and capturers, rotate repairs, manage factory exits | Rewards route planning and interdiction; may make games slow or attritional. |
| Artillery defender | Build protected firing areas, force approaches and exploit blind-spot coverage | Offers a siege puzzle; can become oppressive on a single-lane map or with Xenon's clock advantage. |
| Opportunist | Switch fronts after openings, trade material for objectives | Produces varied games; needs stable enough plans for the player to recognize a strategy. |
| Gambler | Accept volatile attacks and desperate breakthroughs | Can produce dramatic reversals. Fixed risk appetite is a style concession, not automatically better strategy. |

An optimal win-probability policy already adjusts risk to the position: a
long-shot attack can be correct when safer play loses. A style's risk setting
should therefore mean a deliberate preference among plausible alternatives,
not simply multiplying all attack scores.

Separate controls or named modes could serve different needs:

- **Classic-inspired:** preserve the adopted CPU behaviors, including corrected
  deployment ordering. Do not claim the current heuristic is the exact original.
- **Commander personalities:** adjustable skill with a visible, stable style.
- **Competitive:** strongest available search under a declared compute budget.
- **Coach:** ask for a threat, compare two plans, or review a completed battle
  and explain which decision mattered.
- **Puzzle or challenge:** a fixed position, transparent scenario handicap,
  or alternative objective in a separate original scenario.
- **Tournament and map analysis:** pit several policies against each other to
  expose one-sided factory races, blocked reinforcement flow and prolonged
  cleanup. Human playtesting remains necessary.

Difficulty should be coherent: fewer considered plans, shorter strategic
foresight, recognizable tactical omissions, or a transparent handicap.
Randomly throwing away a unit after several excellent turns can feel artificial.
A weak opponent can still take an obvious win and show a consistent intention.
Skill and personality should be measured separately; an aggressive bot is not
intrinsically stronger than a cautious one.

Select difficulty between matches, or make adaptation explicitly optional.
Secretly changing dice, granting extra moves or quietly throwing a won game
would undermine the value of the shared rules. If a player wants a dramatic
scenario director instead of a competitive opponent, that should be a clearly
different experience. Neither a universal 50% win-rate target nor constant
tension is established as the right design for these players.

## What happens if the AI gets very good

It may reveal new tactical ideas, evaluate maps more accurately and become a
useful tutor. It may also remove familiar opportunities to lure the old CPU
into a trap, expose campaign imbalances, or favor tedious but effective play.
Replacing the opponent changes the practical difficulty of an unchanged map.
Keep the imported campaigns intact and distinguish opponent versions in any
future performance comparisons or challenge records.

The most useful assistance would address the gap between local and global
understanding: which factory will become contested, whether the base can be
reached after a blocker dies, why finishing one damaged squad matters, and why
moving a supporter first improves the whole turn. A combined next-turn threat
overlay is necessarily an estimate because enemy actions interact; label
over-approximations instead of presenting them as simultaneous certainties.

In review, distinguish a poor decision from an unlucky result. Explain plans
and alternatives before displaying a supposed win probability, and only show
probabilities calibrated against an identified opponent/evaluation setting.
An uncalibrated heuristic score is not a percentage chance to win.

More routes and objectives can give a human meaningful choices against strong
defense, but they are not a guarantee of better balance or enjoyment. Larger
maps also increase memory load and the amount of routine movement. Small,
well-constructed positions may provide better tactical depth per minute.

## A bounded evaluation program before choosing an implementation

First compare the existing policy, a stronger utility planner, and a beam-search
prototype. Include immediate wins, forced base defense, support-before-fire,
clear-ZOC-then-capture, factory mouth clearance, transport timing, repair and
veteran preservation as explicit tactical probes.

Run matches across multiple seeds and map families, exchange which bot controls
each faction, and report results separately by side and scenario. Swapping bots
between factions measures their performance across roles; it does not remove
the underlying first-turn or timeout asymmetry. Use separate original test
scenarios if experimenting with a symmetric terminal rule. Do not retune the
imported campaign as a benchmarking shortcut.

Hold out maps and variants from tuning and training. Advanced campaigns reuse
normal-campaign terrain, and several original maps share generated structures;
split by related map family when testing generalization, not just map name.
Use an opponent pool, including previous versions and deliberately specialized
strategies, so improvement does not mean exploiting only the current heuristic.

Measure wins with uncertainty intervals and adequate independent maps/seeds;
terminal reasons; tactical probe success; milliseconds per turn; repeated
position or non-progress rates; meaningful captures; and game length. Equal
starting seeds are useful for reproducibility but do not guarantee equal luck
after policies consume different sequences of battle rolls. In human trials,
also measure perceived fairness, comprehension, stress, willingness to replay
and whether players can explain what they learned. Self-play cannot establish
those outcomes.

Possible acceptance targets must be named as targets: a large reproducible
improvement over the baseline on held-out families, no regressions on the
tactical probes, tolerable browser latency, and distinct styles people can
recognize. There is no measured human rating yet, and no valid conversion to
chess Elo. Even convincing expert-level results would not imply a solved game
or immunity to unusual tactics.
