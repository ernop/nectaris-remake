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

**Lockstep and the speed target (user, 2026-09-27):** "we must keep the js and
the rust version in lockstep in terms of perf/levels/etc. the goal is to keep
users on the js version at home/wherever, but here on this box we will be able
to run the rust version which should be say 1000x faster, for testing and
experimentation with ais." The user agreed to the lockdown plan.
- Players use the JavaScript game. The Rust simulator is for testing and AI
  experiments on this machine.
- Every bot, level and budget exists in both and plays identically. An AI
  change lands in both in the same change; the behaviour lock enforces it.
- Speed target: about 1000× the JavaScript game, measured as games per hour on
  this machine with every thread against one JavaScript thread, as the
  browser runs it.

## Rust simulator

**Requirement: identical behaviour, not just identical rules.** The Rust
simulator must reach the same state after every command. Its bots must choose
the same commands as the JavaScript bots for the same board and seed. Then each
implementation can check the other on every game, and weights trained in Rust
behave the same in the browser. This needs Rust to reproduce, exactly:
- **Randomness:** the match's ChaCha20 dice (`COMBAT.makeDice`) and the
  bots' own mulberry32 look-ahead generator (`COMBAT.makeRng`).
- **Math:** V8's results for `Math.log` and `Math.tanh` (search uses them), and
  JavaScript float arithmetic order.
- **Order:** insertion order where objects and maps are iterated, and stable
  sorting.
- **Search seed:** the JSON text behind `AI_MODEL.seedFor`, which includes each
  unit type's definition as `JSON.stringify` writes it.

**Fair dice (decided 2026-09-28).** The user: "we must not do things like use
the random seed values to change anything; infact we should change it so that
even if the original seed were something too small like a 16bit int, we should
chaneg that to some huge 64bit int or larger, and also make an option within
rust such that it tries its best while running ther game to either never
precalculate (obviously) results with any knowledge of the seed". Decisions
(user, 2026-09-28): ChaCha20 dice, fresh seeds, no online randomness source.
- **Dice:** ChaCha20 (RFC 8439) keyed by a 256-bit seed, nonce zero, read as
  32-bit words divided by 2^32 (`COMBAT.makeDice`, `sim/src/dice.rs`). The
  next roll cannot be predicted from earlier rolls without the seed.
- **Seeds:**
  - 64 lowercase hex digits are the key as they are.
  - Any other seed, a number or a text, becomes SHA-256("nectaris-seed:" +
    seed).
  - No seed draws 32 bytes from `crypto.getRandomValues` or `/dev/urandom`.
    Browser games and tournaments started without a seed are fresh.
  - A tournament records its root seed; game seeds are
    SHA-256("<root>:<cycle>:<map>:<pair>").
- **Saves** hold `dice: "<seed>/<block>/<word>"`. A save with the old
  `rngState` is refused with the older-version message, so a match saved in
  the browser before this change cannot be resumed.
- **Bots** keep their own mulberry32 look-ahead, seeded from the public
  position (`seedFor`); their decisions and speed did not change. Public
  copies (the AI worker's, the opening analysis's, editor validation) carry
  no dice (`dice: null`), and rolling them throws.
- **Enforcement:**
  - In Rust the dice field is private to `game.rs` and `ChaCha` cannot be
    copied. Reading the dice state needs a key that only `hash.rs` (the
    fingerprint) can construct.
  - In JavaScript, `test/dice-tests.js` plays a tournament game with every
    bot. It fails if anything other than the engine's attack on the match
    rolls its dice, or if anything reads the dice while a bot is thinking. A
    read or a roll planted in `AI_MODEL.clone` fails it.
- **No online source:** the bots cannot read the operating system's random
  bytes behind a seed, so for them the dice are unknown future values.
- **Costs accepted:** every game's dice changed; tournament protocol
  `2026-09-28.1`; archives from earlier protocols no longer resume or replay;
  the corpus was regenerated; seeded tests were updated.

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

  It converts them into `test/fixtures/sim-corpus.json.gz` (16,481 commands
  since the fair dice, a fingerprint after each). Regenerating gives a
  byte-identical file.
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

**Phase 4, second step (2026-09-27),** decisions again unchanged on all 674
games:
- **Candidate lists:** cached by the position's `signature` plus the
  request's limits. Candidate generation reads nothing about a position that
  the signature leaves out. The sample reuses 44% of its lists, for example
  when Apex's verification samples replay the same greedy moves until the
  first battle.
- **Occupancy grid:** answers `unitAt` directly, so battle forecasts cost a
  third of what they did.
- **Movement records:** a unit's records are cached under the same
  neighbourhood key as enemy stopping cells.
- **Verification:** `--verify-caches` also recomputes every reused list and
  movement result, and checks the grid against the unit list.
- Sample: 27.4 s → 15.7 s (14.9× JavaScript). The 144 search games: 185 s →
  109 s.
- Now almost all time is in rollouts, whose candidate lists are new
  positions; no single function dominates any more.

**The engine as the platform (user, 2026-09-28):** the simulator is the engine
for evaluating, developing and training many kinds of AI players, not only
today's five bots. "As long as they are done in a principled and maintainable
way, we should make the best and fastest game player system we have." Speed
work therefore keys caches on what JavaScript already defines (its
`signature` and `stopSignature`), never on hand-kept dependency lists. Since
2026-09-29 a Rust-only exact speedup is also allowed when CI's
`--verify-caches` recomputes every answer it reuses and it measures faster
(fourth step, below).
- **Engine:** rules, state, commands and fingerprints (`sim/src/game.rs`).
  - `Game::legal_commands` lists every legal command for the side to move in
    a fixed order, identical to JavaScript's `Game.legalCommands()`:
    - each field unit in board order: moves in search order, attacks,
      unloads, then finishing its activation;
    - then each owned building's reserves: exits, then transports;
    - then ending the turn.
  - The corpus locks this list at every recorded position. It also records
    12 random games over the list, which both languages must end
    identically.
- **Players** (`sim/src/play.rs`):
  - `Player` plays whole turns through the engine's recording commands.
  - `StepPlayer` picks one command at a time from the legal list.
  - The five bots are `Player`s; `Random` is the benchmark's step player.
- **Adding a player:** it plugs into Rust through either interface. To play
  in the browser it also needs a JavaScript twin that decides identically,
  locked by corpus games like today's bots.
- **Tools:** the multi-core tournament runner and its JavaScript import check
  (AI_OPPONENTS.md), and the random-playout benchmark: `nectaris-sim playout`
  and `node tools/sim/playout-bench.cjs` print equal fingerprints.
- **Speed (2026-09-29, after the fourth step, profile-guided build):**
  - Engine alone: 0.44 µs per command against JavaScript's 13.6 µs (31× per
    thread; 0.65–0.8 µs before).
  - Random play, listing the legal commands before every command:
    2.46 million commands/s on 32 threads against 13,100/s on one
    JavaScript thread (188×; 120× before).
  - Search bots: 400–407× one JavaScript thread (fourth step, below).

**Phase 4, third step (2026-09-28):**
- **Decisions (user, 2026-09-28):**
  - No mimalloc. It measured 6% faster at 32 threads, at the cost of a
    crate that compiles a C library on every build. Allocations are cut in
    our own code instead.
  - Build per-unit reuse.
- **Per-unit reuse, measured and removed:**
  - The cache was exact: a unit's action list, keyed on everything the list
    reads, and verified on every gate.
  - It reused only 18–20% of the sample's lists and made it slower
    (16.6 s against 15.7 s).
  - The reason: 55% of lists come out identical to the unit's previous one,
    but their inputs repeat far less often. The danger at the unit's hexes
    and the enemies' state change even when its best actions don't.
  - Reuse across such changes would need rescoring only the hexes whose
    inputs changed, a larger design.
- **Kept:**
  - Unit-limited candidate lists compute each unit's rank once. They
    recomputed it inside the sort, collecting the enemy list each time.
  - The best-action selection clones only the actions it returns.
  - Foes and firing hexes use reused buffers.
- **Where the 1000× target stands:** 1,152 three-round search games on
  24 boards.
  - Rust, 32 threads: 59.2 s, 19.5 games/s.
  - JavaScript, one thread: 0.085 games/s (144 such games in 1,687.6 s).
  - Rust is therefore 228× one JavaScript thread. On one thread it is 16.8×
    (the 144 games take 100 s).

**Phase 4, fourth step (2026-09-28), after the fair dice:** "really iterate
and think about the absolute fastest we can make the rust" (user). Every
decision is unchanged on the lock corpus and on all 620 wide games,
re-recorded on the new dice, with every cache verified.
- **Profiling:** `perf` is not allowed on this machine
  (`kernel.perf_event_paranoid` = 4; `sudo` needs a password), so
  `tools/sim/gdb-profile.py` samples call stacks under gdb on a CPU-time
  timer, and `tools/sim/profile-report.py` groups them by function, caller
  and line.
- **Kept**, each measured on the 14-game sample against the build before it
  (fastest of four alternating runs); the sample went from 14.2 s to 8.7 s,
  1.6× faster:
  - Walking distances on an integer bucket queue. Every step costs a whole
    number, so the fields equal JavaScript's float queue exactly
    (14.2 → 13.3 s).
  - The threat map on bitsets: an enemy's covered hexes are the OR of
    precomputed per-cell band masks (pure board geometry), and each enemy's
    `stopSignature` is built once per analysis (13.4 → 12.2 s).
  - Four-lane key hashing, unit lists iterated in place, each type's base
    value computed once, one position signature per rollout step
    (12.2 → 10.8 s).
  - Zone-of-control counts kept by the engine beside the occupancy grid, so
    entering an enemy zone is one lookup; verify mode rescans them at every
    search (10.6 → 9.8 s).
  - `potential` stops at the first target whose worth / 1.5 cannot beat the
    best (targets come most valuable first; every reader takes a maximum);
    firing hexes from the band masks; the unit's danger terms once per unit;
    a one-pass top-k for short action lists; cell coordinates from a table
    (9.8 → 8.6 s).
- **Measured and dropped:**
  - Search caches kept for the whole game instead of one turn: 4% slower.
    The candidate cache clears itself at 8,000 entries, at worse moments, and
    bigger tables cost memory traffic.
  - `potential` values cached by distance: the table work cost more than the
    divisions it saved.
  - Compiling for this CPU (`target-cpu=native`): under 1%.
  - Keys that carry their hash: under 1% to gain, since most hashing is on
    cache hits.
- **Where the time goes now** (sample profile): rollouts 68%; new candidate
  lists 80%; a unit's actions 45%; the threat map 21%; movement searches 22%,
  half of them for enemy stopping cells, of which 61% of lookups miss.
- **Where the 1000× target stands:** the same 1,152 three-round search games
  on 24 boards, re-recorded on the new dice.
  - Rust, 32 threads, plain build: 35.1–37.0 s, 31.1–32.8 games/s.
  - Rust, 32 threads, profile-guided build: 32.8–33.4 s over five runs,
    34.5–35.1 games/s.
  - JavaScript, one thread: 0.086 games/s (the 144 games in 1,668.9 s).
  - Rust is therefore 400–407× one JavaScript thread (228× before this
    round). On one thread it is 30× (the 144 games take 55.2 s; 17× before).
  - Whole tournaments still match: the 476 Classic/Tactical and 144 search
    games, played by `nectaris-sim tournament`, equal the JavaScript runner's
    archives game for game and pass `import-rust.cjs`.
- **Profile-guided optimization (user, 2026-09-29: "Try it: install,
  measure, keep it only if faster"):** kept.
  - `tools/sim/build-pgo.sh` builds an instrumented binary, trains it on
    boards the benchmarks do not use, merges the counts with rustup's
    `llvm-tools`, rebuilds, and runs the lock checks on the result.
  - 7–8% faster: the sample 8.55 s → 7.86 s; the 1,152 games on 32 threads
    35.1 s → 32.8–33.4 s. Every command identical, and both whole
    tournaments still equal the JavaScript archives.
  - CI keeps checking the plain release build.
- **Rust-only speedups (user, 2026-09-29):** allowed when exact, when CI's
  `--verify-caches` recomputes every reused answer, and when they measure
  faster.
- **Enemy stopping cells kept by what their search read, measured and
  removed (2026-09-29):**
  - Behind the `stopSignature` cache, each search recorded the cells it
    examined and what it saw on each (occupant, enemy zone, building owner).
    A later miss reused an earlier search from the same origin whose
    observations all still held.
  - It was exact on every gate. 37% of the stop-key misses (109,000 of
    292,794 on the sample) found such a search.
  - It was 5% slower (9.09 s against 8.64 s). A search reads about 178
    cells, and a lookup checked about six remembered searches, so checking
    cost more than the searches it saved.
  - Keeping occupancy and zones as engine bitsets might make the checks cheap
    enough for 1–2%, not enough for the added engine state.

**Phase 5, the self-play runner (done 2026-09-27):**
- `nectaris-sim tournament` plays `run.cjs` tournaments on every thread. The
  same settings give the same fixtures, seeds and seats.
- `node tools/sim/import-rust.cjs DIR` replays every game in JavaScript. It
  checks seeds, seats, legality, final positions and results, then writes the
  standard archive the replay viewer opens. Usage: AI_OPPONENTS.md.
- Two tournaments matched the JavaScript runner's archives game for game:
  - 476 full Classic/Tactical games on all 119 boards;
  - 144 three-round search games on 24 boards.
- Speed, 16 workers each, on the 144 search games: `run.cjs` 216 s wall
  (2,674 s CPU), Rust 15 s (216 s CPU), 14.5× faster.
- CI plays a small Rust tournament and imports it on every push.

**Phase 6:** **training** runs on it (the phases below).

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
  script. Self-play and training run in the Rust simulator (`sim/`), locked to
  the JavaScript bots ("write an ultrafast rust game sim tool and use that",
  user, 2026-09-27). Learned weights ship as a checked-in data file that both
  read, with their provenance.
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
the last normal-campaign board.

**Update 2026-09-27,** after the JavaScript speed steps: one side's whole turn
on NECTOR at round 6 of Classic self-play from seed 3 (`nectaris-sim turn-time
--board=15`). Both implementations reach the same position after the turn.

| Bot | JavaScript (the browser) | Rust |
| --- | --- | --- |
| Tactical | 0.09 s | 0.008 s |
| Sequence | 0.90 s | 0.107 s |
| Simulation | 2.26 s | 0.311 s |
| Apex | 14.2 s | 1.65 s |

This game thins out after round 6; the three-minute position above came from
another game. A profile of the Sequence turn puts about 40%
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
