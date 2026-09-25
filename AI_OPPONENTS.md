# Search opponents and tournament lab

Implemented from the user's 2026-09-23 request. The objective is stronger
algorithms, with no personality system, stat bonuses or access to future dice.
This supersedes the implementation-proposal status of AI_DESIGN_RESEARCH.md;
that document remains the historical analysis and research bibliography.

## Playing

The map's **Opponent** dropdown offers five policies. A new match defaults to
**Apex** unless another choice was saved. An older saved match without this
field continues with Classic. Change opponents on a human turn; the setting is
disabled during combat, AI turns, finished games and hotseat. The choice and
mid-match changes are recorded with the match history.

| Opponent | Implemented method | Typical computational cost |
| --- | --- | --- |
| Classic | Existing original-inspired role ordering and immediate heuristics; original factory scan retained | Lowest |
| Tactical | Capability-based greedy planning; exact casualty probabilities, terrain routes, objectives and threat estimates | Low |
| Sequence | Beam search over activation sequences, transposition deduplication and short enemy continuations | Medium |
| Simulation | Chance-sampled Monte Carlo tree search, UCB selection, progressive widening and adversarial continuations | Higher |
| Apex | Wider beam search guides MCTS; a portfolio of resulting actions receives common-seed, full-turn rollout verification | Highest |

These are increasing algorithmic sophistication, not a mathematical guarantee
that each beats its predecessor on every board. Classic remains a useful
baseline. There is no trained neural model and no claim of expert or superhuman
strength. The strongest implemented design is Apex; use the laboratory to
measure the ranking for the particular boards and opponents you care about.

Search normally runs in a Web Worker. The same planner can cooperatively yield
if workers are unavailable. Watch AI animates the chosen actions; turning it
off removes animation delays without changing decisions. Leaving a match
cancels its worker. A failed search reports an error and preserves the
turn-start save rather than silently skipping a turn or changing algorithms.

## Rules and generic unit support

`js/ai-model.js` generates legal macro actions: complete one unit's activation,
including moving, attacking, unloading before or after movement, and a legal
post-attack retreat. It also generates deployment and factory loading actions.
Every real and simulated action goes through `ENGINE`; legality comes from
the same queries used by the human interface.

The new policies branch on capabilities and numerical data, never stock unit
names. Arbitrary valid attack/defense/movement/range values, attack 55, air units
with weapons and cargo, multi-slot cargo, capture, terrain restrictions,
move-or-fire, and post-attack movement are handled by the shared model. An
armed carrier can unload and shoot in one activation when the engine allows
both. Transport routes combine the carrier's terrain travel with a passenger's
route from possible landing zones, including crossing impassable ridges.

This flexibility costs additional candidate combinations, especially for
transports, but not a new learned vocabulary or a handler for each unit. Values
are calculated from stats, strength, experience and capabilities. The engine's
existing stat caps still apply. Unusual combinations can expose weaknesses in
the evaluation; being legal and supported does not prove optimal valuation.
An entirely new action/rule would still require engine and planner support.
Classic retains its historical stock-specific decisions for fidelity.

`COMBAT.distribution` enumerates the exact weighted joint casualty distribution
under the current remake's combat model, sharing its damage implementation.
It does not alter combat. Planning clones mutable state and cargo identities,
shares immutable terrain/types, and uses independent public-state random seeds.
Neither planning nor worker serialization reads or advances the match RNG.

## Search details and practical limits

- Reverse multi-source Dijkstra fields guide terrain routes and firing
  positions. Threat maps use reachable enemy firing areas. Objective values
  include factories' actual reserve contents, repairs and imminent base losses.
- Beam search uses a representative central combat outcome, avoiding the
  error of selecting the luckiest sampled branch as if it were a forced line.
  It retains competing root choices through sequence expansion.
- MCTS samples independent chance outcomes on every traversal. The maximizing
  side changes when the side's turn changes, not at every unit activation.
  Transpositions include action flags, ownership, factories and cargo states.
- Apex verifies a deduplicated portfolio: MCTS choice, leading beam choices
  and the greedy choice. Four common-seed samples play the remaining friendly
  activations and enemy reply, bounded by the army size, with a small penalty
  for a fragile worst sample.
- Tactical interactions receive the search budget; quiet positions outside
  the local contact horizon use the terrain-route planner directly. This
  prevents large rear-area reserve armies from spending tactical simulations
  on every uneventful march. There is no wall-clock cutoff in decision making.
- Default Sequence: depth 3, width 4, 5 branches. Simulation: 36 iterations,
  horizon 8, 10 branches. Apex: depth 3, width 5, 12 branches, 64 iterations,
  horizon 12, 4 verification samples. MCTS iterations scale down with very
  large ready armies, with at least two visits per root branch budget.

This is selective search with handcrafted evaluations and bounded rollouts.
Candidate pruning can miss a sacrifice or coordinated maneuver. Transport
scheduling, long sieges, repair cycles and the asymmetric timeout remain hard
strategic problems. More computation alone does not prove better play; test
algorithm changes on held-out maps and fresh seeds as well as regression cases.

## Browser tournaments

Open **Tournaments** from a map, or **AI tournament lab** from the mission menu.
The prominent opening panel above the campaign/level picker also links to this
setup, with a return link back. The separate page does not alter player profiles
or unfinished human matches.

Choose **Use normal opening** (default) or **Use offer for first** for all selected
boards. Offers run the same private switch-point search as human setup; all bots
currently share a material/capture-opportunity opening heuristic regardless of
playing algorithm. This is not measured equal-odds compensation. Unavailable
placements or no deal skip the fixture with no rating change unless you explicitly
choose **Play with the normal opening** as the fallback. These preferences persist
separately from the human opening choice, and every run freezes its own settings.

Protocol **2026-09-25.1** records requested/effective opening, both switch points,
question history, bonus placements and first player. Results, CSV exports and
replays identify the opening; replay starts after compensation is placed. The
tie-break is seeded separately from combat. A lab cap waits for both armies,
including Xenon-first matches. Prior-version replays remain viewable, but their
runs cannot resume under the changed protocol.

Choose opponents, multiple boards across collections, paired cycles, random
seed, round cap, parallel workers, search work and Elo K. **Standard** uses
the ordinary in-game budgets. **Fast** halves sampling/branch budgets and uses
depth 2; **Deep** doubles them and uses depth 4, subject to the planner's minimum
budgets. Classic and Tactical are unchanged. Search work is recorded with the
experiment, and ratings from different budgets should not be mixed. Dense
armies can still make Apex take tens of seconds per turn; parallelism and
removing animation do not eliminate its search cost. One selected opponent automatically
self-plays. With several opponents, use the optional same-AI checkbox to add
those pairings. A cycle schedules every selected matchup on every selected
board in both faction assignments, using the same seed for the pair. The
display shows the exact total before launch, up to 1,000,000 games per run.

Round cap **0** preserves each scenario's original limit and its normal timeout
winner. An earlier laboratory cap records a draw; it does not change the map
or award a spurious Xenon win. Games execute without render/animation waits.
Each worker runs a real engine instance and reloads the appropriate custom
roster between games. Hardware and search complexity determine throughput.

**Pause** finishes active games before stopping; **Stop now** terminates them.
**Resume** restarts unsaved games with the same seeds. Finished games and their
rating updates commit together in IndexedDB, in schedule order regardless of
worker completion order. The out-of-order buffer is bounded to twice the worker
count. Web Locks prevent two tabs from running or deleting the same experiment.
The tab must remain open to compute; a closed or reloaded run can be resumed.

Results include W/D/L, faction counts, per-opponent thinking time, final Elo,
head-to-head results, per-game outcomes and reasons, seeds and round counts.
Each saved game has its initial state, engine commands and final state. **Watch**
supports first/last, previous/next, a scrubber, playback speed and unit hover
details. It executes recorded commands, not AI search. Game JSON files from
the Node runner can also be opened in the viewer.

**Export results CSV** exports compact results. **Export full archive** produces
NDJSON with the run configuration, ratings and every replay. Browsers with
the File System Access API stream that archive directly to disk; the fallback
Blob export is bounded to 2,000 games. Individual replay downloads are also
available. Browser quota errors stop the run while retaining its committed
results; use the disk runner for very large archives. Browser storage can be
cleared or evicted, so export important experiments.

## Elo calculation

Every new experiment starts every opponent at 1500. For Union A and Xenon B:

```
expectedA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
change = K * (scoreA - expectedA)
ratingA += change
ratingB -= change
```

Score is 1 for a win, 0 for a loss and 0.5 for a draw. Updates follow fixture
index, so changing worker count cannot change Elo order. Same-algorithm games
record both seats without changing Elo; errors and skipped no-deal/unavailable
fixtures do not change ratings or W/D/L.
Ratings belong to that algorithm version, pool, board distribution and cap.
They are not calibrated to chess, Go, human players or other experiments.
Small samples and correlated scenarios should not be treated as precise ranks.

## Large disk runs

Node 22 or newer; no package installation. Use `--opening=offers` for guided
bot offers or `--opening=original` (default) for normal play. `--no-deal=skip`
(default) skips unavailable/refused offers; `--no-deal=original` explicitly
permits the normal fallback. The source hash includes the compensation code.
These fields also work in `--config` JSON:


```sh
node tools/ai-research/run.cjs --list
node tools/ai-research/run.cjs --opponents=classic,tactical,beam,monte-carlo,apex --boards=0,1,2 --cycles=10 --workers=4 --out=/tmp/nectaris-league
node tools/ai-research/run.cjs --out=/tmp/nectaris-league --resume
```

Use `--boards=all`, `--rounds=10`, `--seed=123`, `--work=fast`, `--k=24` and `--self-play`
as needed. `--config=experiment.json` accepts the full configuration with
embedded map definitions and optional custom `types`; `maps` is an array of
map objects. Use `--help` for all options. Board indices are listed explicitly;
the older `tournament.cjs` pilot used a smaller, differently indexed map list.

The runner uses Node worker threads and atomically writes `run.json` plus
`games/BATCH/INDEX.json`. Ctrl+C stops workers and checkpoints completed games.
Resume recovers any atomic game write that preceded a rating checkpoint. It
checks the engine/search source hash and refuses to mix changed algorithms
into an existing experiment. Archives contain the full map and unit definitions.
Do not edit an active archive or launch two CLI processes into the same output.

## Validation record

The correctness suite covers immediate wins, independent RNG, snapshot
isolation, custom capability combinations, all generated hybrid actions,
worker/headless parity, cancellation, picker persistence callbacks, hotseat
locks, failure checkpoints, paired scheduling, rating arithmetic and exact
replay state. `node test/run-tests.js` includes these tests and the existing
all-map Classic self-play suite.

During implementation, 1,000 full Classic/Tactical games on REVOLT and ICARUS
completed with no errors. Tactical scored 538–462. All 1,000 command replays
matched their final states and RNG exactly. A 142-game, three-round smoke run
covered all 71 boards then in the library, both sides, without errors. Six
one-round Apex self-play games covered NECTOR, ROTCEN and TWISTED FJORDS.
Single-worker and four-worker schedules produced identical results and Elo.
These are scoped tests, not a proof over every possible custom roster.
After the new terrain campaigns arrived, the lab's expanded 119-board catalog
also completed a 238-game, two-round smoke run without errors. Fast and Deep
search budgets each completed their paired smoke tests. A real child process
was killed after its first durable game checkpoint, then resumed to complete
all 80 fixtures exactly once. A second resume preserved Elo, and a mismatched
source hash was rejected. Run that integration check with
`node test/tournament-runner-tests.cjs`; CI runs it alongside the main suite.

Browser checks exercised all five policies in a 20-game short tournament,
pause/resume, saved results, replay seeking, and ordinary animated/fast AI play.
The opponent selection survived Save & Menu / Continue. Dated tournament
summaries and source hashes are recorded in
[tournament-validation-2026-09-23.json](tools/ai-research/tournament-validation-2026-09-23.json);
raw stress-test archives are intentionally not shipped with the game.

The final 60-game round robin used REVOLT, ICARUS and CYRANO, one paired cycle,
seed 42, original turn limits, four workers and K=24. Each policy played 24 games:

| Policy | Wins / losses | Final Elo within this run |
| --- | --- | --- |
| Apex | 16 / 8 | 1554 |
| Simulation | 14 / 10 | 1521 |
| Sequence | 12 / 12 | 1502 |
| Classic | 10 / 14 | 1464 |
| Tactical | 8 / 16 | 1459 |

No game in that comparison drew or failed. This supports Apex as the current
default, while showing that the simple Tactical policy is not uniformly stronger
than Classic. Its 1,000-game two-board result went the other way. Both are
evidence for keeping board selection, seeds and opponent pool attached to every
rating, and for testing more than one small sample before making strength claims.
