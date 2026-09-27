# Training plan for the search opponents

Status: **proposal, nothing trained yet.** Written 2026-09-26 at the user's
request: "plan a training run to really make the bots good ... test and
investigate step by step and plan a great one". The measurements below were
taken that day on this machine. The open decisions at the end are the user's.

**Speed first (user, 2026-09-27):** the user put optimizing self-play speed
ahead of every decision below ("let's optimize the speed of self-play games,
first"). Machine time, turn targets, held-out boards and milestones wait until
the simulation is much faster.

**Lock, then a Rust simulator (user, 2026-09-27):** "lock down the game
behavior from the pov of ai, fully, and then write an ultrafast rust game sim
tool and use that".

## Rust simulator

**Requirement: identical behaviour, not just identical rules.** The Rust
simulator must reach the same state after every command. Its bots must choose
the same commands as the JavaScript bots for the same board and seed. Then each
implementation can check the other on every game, and weights trained in Rust
behave the same in the browser. This needs Rust to reproduce, exactly:
- **Randomness:** the mulberry32-style generator (`COMBAT.makeRng`).
- **Math:** V8's results for `Math.log` and `Math.tanh` (search uses them), and
  JavaScript float arithmetic order.
- **Order:** insertion order where objects and maps are iterated, and stable
  sorting.
- **Search seed:** the JSON text behind `AI_MODEL.seedFor`, which includes each
  unit type's definition as `JSON.stringify` writes it.

The browser game stays plain JavaScript. Rust is a development tool
(installed with rustup on 2026-09-27; `~/.cargo/bin`).

**Phase 1, the lock (done 2026-09-27):**
- `tools/sim/state-hash.cjs` fingerprints every rule-relevant field. Unit ids
  are numbered from 1 in creation order, because JavaScript draws them from a
  process-wide counter.
- `tools/sim/regenerate-lock.cjs` records 54 games:
  - Classic v Tactical full games on 22 boards from every family;
  - Sequence v Simulation for 4 rounds on 3 small boards;
  - Apex v Tactical for 3 rounds on 2 small boards.

  It converts them into `test/fixtures/sim-corpus.json.gz` (14,959 commands,
  a fingerprint after each). Regenerating gives a byte-identical file.
- `test/sim-lock-tests.js`, in the main suite, replays every command and
  re-plays one game per pairing with its bots.

**Phase 2, the Rust rules engine (done 2026-09-27):**
- `sim/` holds the `nectaris-sim` crate. It ports `js/engine.js` and
  `js/combat.js` rule for rule: hex grid, terrain, units, randomness,
  movement, zones of control, buildings, transports, combat and the seven
  recorded commands.
- `tools/sim/export-data.cjs` writes `sim/data/game-data.json` from the
  JavaScript data files, which stay the single source. The main suite fails
  while the export is out of date.
- In `sim/`, `cargo run --release -- replay [CORPUS]` compares the fingerprint
  after every command; `bench [CORPUS]` times the rules alone.
- Every corpus game matches. A wider check matched too: 620 games, 365,780
  commands, every fingerprint equal:
  - Classic v Tactical on all 119 boards, two seeds each;
  - Sequence, Simulation and Apex for 3 rounds on 24 boards.

  It was recorded with `tools/ai-research/run.cjs --seed=77`
  (`--opponents=classic,tactical --boards=all --cycles=2 --rounds=0`, and
  `--opponents=beam,monte-carlo,apex --boards=0,5,…,115 --rounds=3`), then
  converted by `make-corpus.cjs`.
- Rules alone, before any Rust tuning: 1.2–1.6 µs per command against
  JavaScript's 13–20 µs, 8–16× faster. Bots take most of self-play time, so
  the self-play speed-up is measured in phase 3.

**Phase 3, the Rust bots (done 2026-09-27):**
- `sim/src/classic.rs`, `model.rs` and `search.rs` port `js/ai.js`,
  `js/ai-model.js` and `js/ai-search.js`: Classic, Tactical, Sequence,
  Simulation and Apex. `play.rs` is the tournament game loop.
- `sim/src/fdlibm.rs` ports V8's `Math.log` and `Math.tanh`. The export
  fingerprints V8's results on a million generated inputs; `replay` fails if
  the port differs in any bit.
- In `sim/`, `cargo run --release -- decide [CORPUS]` plays every game again
  from its board and seed and compares every command with the recording.
  - All 54 corpus games match.
  - The wider check matched too: all 620 games, every command.
- Speed of this first port, one thread, on 11 corpus games: 4.7 s against
  JavaScript's 17.8 s (3–6× faster). The port is still direct: it allocates
  freely and recomputes enemy stopping cells that JavaScript caches.

**Phase 4, faster Rust bots (first step done 2026-09-27):** every decision is
unchanged on all 674 games.
- **Tables:** board tables (terrain, neighbours, buildings, entry costs per
  unit type) are shared by every copy of a position.
- **Movement search:** reuses per-thread tables. Its frontier is a bucket per
  cost, which pops in exactly the heap's order.
- **Caches:**
  - Enemy stopping cells and the hexes each enemy threatens are cached by
    JavaScript's `stopSignature` key.
  - Origin terms are computed once per unit.
  - Keys use a word-at-a-time hasher.
- **Action lists:** only the unload-first actions, the one part that can
  repeat a key, are deduplicated; then the best actions are selected without
  sorting the rest.
- `decide --verify-caches` recomputes every cached result and repeats the full
  deduplication, and panics on any difference. CI runs it.
- The 14-game sample (four Apex games on large boards, ten small search
  games), one thread: JavaScript 233.5 s, Rust 27.4 s, 8.5× faster (7.6–9.6×
  per game). The 620-game wider check: 144 search games 549 s → 185 s, 476
  Classic v Tactical games 128 s → 89 s.

**Phases 5–6:**
5. **Self-play runner** on all cores, writing records that the tournament
   replay viewer opens. JavaScript replays samples of Rust-played games with
   equal fingerprints. Speed is measured against the JavaScript runner.
6. **Training** runs on it (the phases below); JavaScript re-checks samples.

## Speed work

`tools/ai-research/speed-bench.cjs` plays one side's turn for each bot from
fixed mid-game positions and fingerprints the resulting board and random state.
Every speed change must keep all fingerprints; only the time may change.

Step 1 (2026-09-27) kept every decision identical:
- **Movement search:** runs on per-map tables and typed arrays, with no string
  keys and no neighbour lists allocated per hex.
- **Hex helpers:** neighbours and distance no longer allocate objects.
- **Battle odds for the planner:** skip the forecast's display-only block.
- **Surround check:** stops at the first open hex.
- **Scoring:** unit values are cached per type; the threat map and support
  scoring reuse cell arrays.

| Bot | Speed-up on the benchmark |
| --- | --- |
| Tactical | 1.4–1.85× |
| Sequence | 1.9–2.7× |
| Simulation | 2.2–2.6× |
| Apex | 2.9–3.05× |

The mid-game NECTOR turn that took Sequence 10.0 s now takes 4.8 s.

Step 2 (2026-09-27), again with every decision identical:
- **Movement search:** records its flags in typed arrays and builds each
  record once.
- **Threat map:** reads each enemy's stopping cells through a lean engine
  query, and reuses them across search states whose signature matches. The
  signature covers the enemy, every unit within its reach plus one hex, the
  buildings within reach and the terrain version. A verification switch
  recomputes every reuse; a test and `speed-bench.cjs --verify` use it.
- **Attack checks:** skip positions from which no enemy can be hit.
- **Keys and odds:** loss distributions are cached on their five inputs; action
  and route keys are cheaper.

Benchmark against the original code: Tactical and Sequence 2.5×, Simulation
and Apex 4.0×. The mid-game NECTOR turn:

| Bot | Original | Now |
| --- | --- | --- |
| Tactical | 0.75 s | — |
| Sequence | 10.0 s | — |
| Simulation | 26.1 s | 3.4 s |

Whole self-play games with the same seeds end identically (winner, reason,
round). With 14 games in parallel on both sides:

| Board | Tactical | Sequence |
| --- | --- | --- |
| NECTOR | 6.6 s → 2.7 s | 174 s → 54 s |
| HIPPARCHUS | — | 6.7 s → 2.3 s |
| DELTA CROSSINGS (180 rounds) | 125 s → 62 s | — |

**Hardware for sizing runs:** a Ryzen 9 5950X has 16 cores with 2 threads
each. The first timing table above ran 30 games at once and was about 2×
slower per game from contention. About 16 parallel games use the machine;
more add little.

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

Apex needs about three minutes for one mid-game turn on
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
