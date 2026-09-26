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
boards. Offers use private switch-point answers. The 2026-09-25 follow-up
supersedes the shared material/capture opening heuristic: each bot now simulates
both roles with its own playing algorithm. The level picker selects the bot for
both opening offers and moves; solo analysis runs in a cancellable worker and
never receives the human's answers. Human answers may proceed while it thinks;
settlement waits for both commitments.

`ai-opening.js` tries the retained packages in order until one is acceptable.
For each, it compares going first while the opponent receives that package with
going second and receiving it itself. Both simulated sides use the evaluating
bot's policy (a self-play opponent model). Classic uses its fidelity move selector;
Tactical, Sequence, Simulation and Apex use their greedy, beam, Monte Carlo and
hybrid selectors. All use the existing numerical position evaluator to score the
result. These are bounded estimates, not equal-odds guarantees or win probabilities.
Fast / Standard / Deep opening work allows 4 / 8 / 12 visible non-preview events
per side, for 1 / 1 / 2 rounds, ending at a completed activation/battle. Each move
uses a reduced deterministic search budget (see `AI_OPENING.budget`); the opening
process never runs a whole match. Public-position simulation seeds are independent
of the real combat RNG. Exact equal role scores accept second. Each survey records
its policy, budgets and first/second scores; earlier packages remain available.

Protocol **2026-09-25.2** records those analyses, requested/effective opening,
switch points, questions, exact bonus, first player and fixture leg. Unavailable
placements or no deal skip the fixture without changing ratings unless the setup
explicitly selects normal fallback. Prior offer runs remain viewable but cannot
resume with changed bidding policies. Version 2026-09-25.1 **normal** runs can
resume and retain their version because normal move selection and rules are
unchanged. The disk runner still enforces its full source hash.

**Repeats per matchup** replaces the unclear “paired cycles” label. Each repeat
covers every selected pairing and map with a new seed. Normal opening uses two
games, swapping Union/Xenon so both bots start once. Offers use four games: both
faction assignments with each possible equal-bid tie recipient. Responses are
private, so response order has no advantage. Unequal preferences still determine
who starts; the schedule does not force a bot to accept a rejected deal. All legs
share a combat seed. One selected opponent automatically self-plays; the checkbox
adds same-policy pairings when several opponents are selected. The exact total
appears before launch, up to 1,000,000 games. **Randomize** supplies a uint32 seed;
the same settings and seed reproduce outcomes independently of worker speed.

**Maximum rounds per game** gives both armies a turn per round. Zero preserves
the map's own limit and its normal Xenon timeout win. An earlier lab cutoff is a
draw. **Parallel workers** are simultaneous background games, not teams inside a
game. More workers use more CPU. **Search work** changes move budgets as before:
Standard uses normal in-game budgets, Fast halves sampling/branch budgets and
uses depth 2, Deep doubles them and uses depth 4, subject to minimums. Classic
and Tactical move selection is unchanged; opening horizons vary for all bots.
**Elo update size (K)** controls rating sensitivity: K=24 moves two equally rated
bots by +12/−12 for a decisive game. Ratings belong to the run and its settings.

Start scrolls and focuses the live run. Worker cards show map, pairing, opening
analysis or current round/side and recorded action count. Saved progress, elapsed
time, rough remaining time, standings and head-to-head results update as it runs.
A single expensive move can still take time between worker messages.

**Pause** finishes active games; **Stop now** terminates unfinished games.
Every finished game first saves to IndexedDB, including out-of-order completions.
Then each contiguous result and its Elo update commit atomically in schedule
order. The in-memory reorder buffer is bounded to twice the worker count; saved
pending results are recovered on Resume and never rated twice. Reload keeps the
configuration, committed standings and all saved games, shows a recovery message,
and offers **Resume**; interrupted unfinished games restart with their original
seeds. “Saved through game…” identifies the rated prefix. Computing requires an
open tab. Web Locks prevent two tabs from running/deleting one experiment.
**Protect saved results** requests persistent browser storage; export archives
for a separate backup regardless of whether the browser grants it.

**Saved game history** filters by map and pairing through indexed lightweight
summaries. Only Watch loads a complete replay. IndexedDB v2 migrates v1 data
without removing games. Replays open with the board filling the window and offer
true fullscreen, Fit, zoom, Ctrl+left-drag pan, unit hovers, turn jumps, action
steps, scrubber and playback speed. Each step can stop on the selection, then
on the committed action. Moves animate the exact legal hex route. A fixed left
panel shows who attacked whom,
machines destroyed and lost, the match's damage-table roll, and whether those
casualties were above, near, or below the table average. A ledger sums each
side's gap from that average. An original-style battle view shows opposing
formations, counts, experience, attack/defense and terrain stats. Map/battle
toggles and changing reports never resize the board. Previous/next battle, hold and follow are
included. Following starts off: playback preserves the camera unless **Follow
action** is explicitly enabled. Wheel zoom, Fit and Ctrl+drag disable following
again. Back to tournament leaves a running job alone.
A compact checkpoint every 128 commands makes arbitrary seeking require at most
127 commands after restore. Static maps, rosters and growing logs are not copied
into every checkpoint. Older archives are indexed once when opened. Watching
runs recorded engine commands, never AI search; full state and dice are retained.
Opening decisions disclose each policy's role scores. Node game JSON imports
use the same viewer.

**Export results CSV** exports compact results. **Export full archive** produces
NDJSON with settings, ratings and all saved replay records, including results
awaiting earlier fixtures. File System Access streams large archives directly
to disk; other browsers use a Blob limited to 2,000 games. Individual JSON replay
downloads remain available. Quota failures stop the run and retain already saved
results; very large disk archives can use the Node runner. Clearing site data
still removes local results. Ratings are not silently pooled across runs.

Validation (2026-09-25): the main suite passes 146,866 checks, including selected
policy execution, distinct role valuations, public-RNG isolation, four-leg
symmetry and exact checkpoint replay at boundary positions. The process recovery
suite recovers 80 games exactly once after interruption. Open
`test/tournament-storage.html` for 12 browser IndexedDB checks covering v1 migration,
map/pair indexes, bounded pagination, out-of-order recovery and atomic records.
A 40-game worker smoke run covered all five offer policies without errors; browser
checks covered full-window seeking, solo offers, a 4,000-game archive after reload,
and an interrupted run recovering its saved 11/160 games.

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
