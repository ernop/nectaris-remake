# Training plan for the search opponents

Status: **proposal, nothing trained yet.** Written 2026-09-26 at the user's
request: "plan a training run to really make the bots good ... test and
investigate step by step and plan a great one". The measurements below were
taken that day on this machine. The open decisions at the end are the user's.

## Goal and constraints

- **Goal:** Tactical, Sequence, Simulation and Apex win more often on every
  board family and from both sides. Strength is measured against a frozen copy
  of today's bots and Classic, not claimed from prediction scores.
- **Only general methods (user, 2026-09-26):** learned weights over general,
  capability-based features. No special-case rules or hand-picked penalties for
  particular situations.
- **Unchanged runtime:** the browser build stays dependency-free and plain
  script. Training code lives in `tools/` and runs on Node only. Learned weights
  ship as a checked-in data file with their provenance.
- **Reproducible:** search keeps fixed work budgets (no wall-clock cutoffs), so
  the same position and weights give the same decision on any machine.
- **Playable:** per-turn thinking time in the browser must meet agreed targets.

## What the investigation found (2026-09-26)

**Machine.** 32 cores, 60 GB RAM, Node 22. `tools/ai-research/run.cjs` already
plays games on worker threads, with resume, atomic writes and a source hash;
about 30 games run in parallel.

**Cost of one side's turn** (self-play, standard budgets, averaged over whole
games):

| Bot | REVOLT 15×10 | HIPPARCHUS 16×11 | NECTOR 30×20 | NECTOR mid-game turn, 21 decisions |
| --- | --- | --- | --- | --- |
| Classic | 0.005 s | 0.01 s | 0.02 s | — |
| Tactical | 0.02 s | 0.05 s | 0.6 s | 0.75 s |
| Sequence | 0.23 s | 0.9 s | 12.8 s | 10 s |
| Simulation | 0.85 s | 2.4 s | 20.4 s | 26 s |
| Apex | 1.9 s | — | over 9 min per game, unfinished | 176 s |

Apex, the default opponent, needs about three minutes for one mid-game turn on
the last normal-campaign board. A profile of the Sequence turn puts about 40%
of the time in movement ranges: `Game.movementRange` 20%, the enemy threat map
built from every enemy's range 11%, `enemyZOC` 10.5%.

**Strength.** Tactical beat Classic 140–84 (62.5%) in 224 games: 56 boards
(normal and advanced campaigns, Lunar Frontiers, Base Nectaris), both seats,
two seeds. Union won only 31.7% of those games, so every measurement must play
both seats.

**Stalls.** Tactical self-play on DELTA CROSSINGS (42×20) ran all 180 rounds to
the turn limit. Simulation self-play on REVOLT ran all 50. Not making progress
is a measured weakness.

**The position score.** `tools/ai-research/eval-probe.cjs` replays those 224
games to the start of each half-turn (4,574 positions) and compares prediction
of the winner on maps held out of each fit. Lower log-loss is better:

| Game phase | Hand-tuned score | Learned weights, 13 general features | Base rate |
| --- | --- | --- | --- |
| Whole game | 0.409 | 0.362 | 0.624 |
| First quarter | 0.711 | 0.618 | 0.632 |
| Second quarter | 0.439 | 0.392 | 0.632 |
| Third quarter | 0.273 | 0.248 | 0.616 |
| Last quarter | 0.182 | 0.162 | 0.615 |

With only its scale fitted, the hand-tuned score predicts results well once
material has diverged. Material alone scores nearly as well (AUC 0.886 against
0.898), so the positional terms add little. In the opening quarter the score is
worse than predicting the base rate. Learned weights over crude general
features beat it in every phase on held-out maps, from only 224 games.

**Hand-picked numbers.** About 25 in the position score (unit value, factory
and reserve worth, capture threats, base danger, time pressure). About 45 in
move ordering (danger, trades, support, capture, repair, unloading,
deployment). About 25 search settings in `js/ai-search.js`. Move ordering
decides which moves search considers at all, and it plays every rollout.

## Method

1. **Learned position score.** Score a position as learned weights times
   general features. Fit the weights to self-play results (logistic
   regression). This is the method the probe measured; it uses every position,
   not one result per game. Later generations can use temporal-difference
   targets to reduce noise.
2. **Learned move ordering by expert iteration.** At sampled positions, a
   deeper Apex search chooses a move. Move-ordering weights are fitted so the
   cheap ordering ranks that move first (softmax regression over the candidate
   features). This improves Tactical directly and the pruning and rollouts of
   every search bot. Repeating with the improved bots is the same loop
   AlphaZero uses, here with linear models.
3. **Search settings and budgets** are tuned by matches at agreed per-turn
   time targets.
4. **Why not a neural network first:** it needs a new runtime component, much
   more data and a decision about the dependency-free runtime. Revisit it only
   if held-out log-loss stops improving while matches still expose score errors.
5. **Why not tuning everything by match results alone (SPSA):** about 70 noisy
   parameters would need on the order of 10⁵ games. Fitting uses every position
   and every decision.

## How results are judged

- **Board split by family,** never by single board:
  - training: the 48 terrain-campaign boards and 15 fjord boards (63, all AI-made);
  - validation, for accepting each step: Lunar Frontiers and Base Nectaris (24);
  - test, for final reports only: normal and advanced campaigns (32; the
    advanced campaign reuses the normal terrain, so they are one family).
- **Every comparison plays both seats** with a shared seed, as tournament
  fixtures already do.
- **A step is accepted only if all of these hold:**
  - a sequential probability ratio test (SPRT) on validation boards shows the
    new version at least +20 Elo over the current one (α = β = 0.05);
  - no loss against Classic;
  - all tactical probes pass;
  - per-turn time stays within target.
- **Reports** give win rate with 95% intervals by side and family, end reasons,
  stall rate (turn-limit games), and the distribution of per-turn times.

## Phases

**0. Harness (agent work, little machine time)**

- **0.1 Weights table:** every hand-picked number moves into `js/ai-weights.js`
  with today's values. Gate: replaying a fixed set of games gives identical
  commands.
- **0.2 Linear score:** the score becomes features times weights, with the
  same values as today (gate: equal on sampled positions).
- **0.3 Linear move ordering:** the same treatment for candidate scores.
- **0.4 Per-seat weights:** each seat in a match can carry its own weights. A
  training runner in `tools/ai-training/` reuses the `run.cjs` mechanics and
  adds a weights hash.
- **0.5 Data recorder:**
  - it records per-position features and the final result, and per-decision
    candidate features and the choice;
  - self-play data gets its own randomness: a seed per game and a sampled
    choice among the top candidates early on, used only for training data.
- **0.6 Tactical probes:** 20–40 positions with known best moves. They cover
  immediate wins, forced base defense, support before fire, clearing ZOC then
  capturing, clearing a factory exit, transport timing, repair and veteran
  preservation.
- **0.7 Speed:** cache movement ranges and threat maps within a decision, and
  update them incrementally. Gate: identical choices on 200 recorded positions;
  target at least 2× on the NECTOR turn.

**1. Baseline league (about 3–4 h on 30 cores).** All five bots on the
validation and test boards, two seeds, both seats. Frozen as version 0.

**2. Learned score, generation 1 (about 3 h)**

- **Data:** about 20,000 self-play games on the training boards, capped at 60
  rounds, about 500,000 positions. Tactical with sampled choices plays Classic,
  Tactical and, on smaller boards, Sequence.
- **Fit and gate:** held-out log-loss at least 10% below the hand-tuned score,
  including the opening quarter.
- **Matches:** Tactical, about 2,000 games (40 min); Apex, 300–800 games on
  smaller validation boards (2–4 h).

**3. Learned move ordering (about 4–6 h)**

- **Labels:** 20,000 positions from phase 2 games, each labelled by an Apex
  choice at Deep budget.
- **Gate:** agreement with Apex on held-out positions above today's ordering.
- **Then** matches, as in phase 2.

**4. Iterate.** Repeat phases 2 and 3 with data from the improved bots until
the SPRT stops finding +20 Elo.

**5. Budgets.** Fixed work budgets per bot are scaled by board and army size to
meet the per-turn targets, then re-checked by matches. This includes the choice
of default opponent.

**6. Final test and release.**

- **Test:** held-out campaigns, both seats, against version 0 and Classic.
- **Release:** weights with a provenance record (data, seeds, results), a
  tournament protocol bump, updated `AI_OPPONENTS.md` and tests.

Phases 1–4 need roughly two nights of this machine at 30 workers. Most of that
is Apex validation matches.

## Risks and how the plan handles them

- **Learning the training opponents' weaknesses:** a pool with Classic and
  frozen versions, and boards held out by family.
- **Predicting results is not choosing moves:** matches decide acceptance;
  log-loss only screens candidates.
- **Side bias (Union 31.7%):** both seats in every comparison, reported per side.
- **Stalls:** stall rate is a reported metric; capped games are excluded from
  result labels.
- **Browser latency:** per-turn time is an acceptance gate.
- **Special-case rules creeping back:** every feature must be general and
  capability-based; the feature list is reviewed with each weights file.

## Decisions needed from the user

1. Machine time: how many hours or nights, and how many cores, the training may use.
2. Per-turn thinking targets in the browser for each bot, on a 30×20 board.
3. Whether the original campaigns stay held out as the final test (proposed)
   or join the training boards.
4. The first milestone: phases 0–2 (harness, baseline, learned score) before
   deciding on the rest (proposed).
