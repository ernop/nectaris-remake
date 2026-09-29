# Bot identity, Marshal, and the AlphaGo-style plan

Written 2026-09-29 from the user's request to reconsider the bots: (1) the
classic TG-16 bot, (2) whether other versions had different bots, (3) a new
strong bot built with ordinary (non-machine-learning) AI techniques, (4) a
design-only plan for a bot in the style of AlphaGo. Implementation of the
existing five policies is in [AI_OPPONENTS.md](AI_OPPONENTS.md); the
simulator, corpus lock and fair dice are in
[AI_TRAINING_PLAN.md](AI_TRAINING_PLAN.md#rust-simulator).

## 1. The classic TG-16 bot

- The menu's **Classic** is a reconstruction ("original-inspired role
  ordering and immediate heuristics; original factory scan retained"), not the
  TG-16 program. No TG-16 CPU source or disassembly is in this repository.
- The only original CPU code that can be read is the 1997 Windows freeware
  `Nec.exe` ([ORIGINAL_EXECUTABLE_NOTES.md](ORIGINAL_EXECUTABLE_NOTES.md)
  says how to obtain it). Its CPU routines cluster around 0x415d40, 0x418c80,
  0x417fc0 and 0x4164b0. Reading them out is a reverse-engineering job of
  several sessions; it recovers the Windows CPU, which may or may not equal the
  TG-16 CPU. **Decision pending (user):** start that job, or keep Classic as
  the reconstruction and say so in the menu.
- Measured strength of the current Classic (Rust simulator, boards 71-118, both
  seats, fair dice): default-weight Tactical beats it 65.9% [61.0, 70.4] in 384
  games; its games last 13 rounds on average and end at the turn limit 2% of
  the time. In an earlier 240-game five-bot league Classic scored 35% and
  Apex 61%.

## 2. Did other versions have different bots?

No source found says so. Evidence:

| Version | What is documented |
| --- | --- |
| PC Engine / TG-16 1989 | The original. No public CPU documentation. |
| PC-98, X68000 (SystemSoft 1993) | Ports by another company; nothing published on the CPU. |
| MS-DOS German (Sunflowers 1995), Windows 95/98 freeware (1997/1999) | `Nec.exe` is disassemblable. Earlier notes found a Windows-specific artillery weakness; treated as a Windows quirk. |
| PlayStation (Hudson 1998, Jaleco 1999) | [Release FAQ](https://nectaris.tg-16.com/nectaris-military_madness-FAQ-playstation-intro.html): "remains resolutely faithful to the original 1989 PC-Engine version"; only the battle scenes changed. Game Boy and PlayStation share 44 contest maps. |
| Wii / Xbox 360 remakes (2009–10) | Reviews describe the same behaviors: retreating to factories for repair, targeting infantry and capture threats first, uses starting advantages ([Nintendo Life](https://www.nintendolife.com/reviews/2010/03/military_madness_nectaris), [Flickcast](https://theflickcast.com/2009/10/06/xbla-review-military-madness-nectaris/)). |
| Neo Nectaris, Earth Light, Game Boy | Different rule sets or cousins; not this game's rules. |

Conclusion: one AI lineage across ports, with the Windows executable as the
only recoverable copy. Nothing to add to the bot list from other versions
unless the `Nec.exe` job above is approved.

## 3. Marshal

**Method.** Marshal is Apex search (beam guides Monte Carlo tree search, then
paired full-turn verification) with the evaluation constants replaced by values
tuned by self-play, one set per seat. No neural network, no training data, no
access to dice. Where the search bots share one hand-picked position score,
Marshal's score is `model.rs` `Weights` (12 numbers per seat):

| Weight | Shipped | Marshal Union | Marshal Xenon |
| --- | --- | --- | --- |
| danger (reward for lowering own danger) | 0.6 | 0.54 | 0.6 |
| danger_scale (expected-loss scale of threats) | 0.085 | 0.051 | 0.051 |
| advance (progress toward objectives) | 1.0 | 1.5 | 0.6 |
| terrain | 0.1 | 0.06 | 0.1 |
| support | 1.0 | 1.0 | 1.5 |
| move_cost | 0.35 | 0.35 | 0.21 |
| base_worth (enemy base for a capturer) | 160 | 240 | 160 |
| hunt_worth (hunting an enemy) | 65 | 65 | 39 |

The other four (trade_out, trade_in, kill, death) stayed at 1.0.

**Reading the result.** Union (moving first, must win before the turn limit,
which Xenon wins) is pushed to advance faster and fear less; Xenon is pushed to
hold ground and support neighbors. This matches the measured asymmetry in
section 4.

**Tuning procedure** (`tools/sim/tune-weights.py`; `cargo run --release --
match --a=SPEC --b=SPEC --boards=… --cycles=…`). Boards were split by number:
71-118 for tuning, 32–55 to check candidates, 0–31 for one final measurement.
Each candidate multiplied one weight of one seat by 0.6 or 1.5 and was kept
when its mean score against Tactical (default weights) and Classic rose by
more than 0.4 points. The greedy planner was tuned (about 25× cheaper than
Apex); the tuned weights were then attached to Apex search. A 2 h Apex-opponent
tuning run improved only within noise and was stopped, so the shipped set is
the greedy-tuned one.

**Twin.** JavaScript (`js/ai-model.js` `setWeights`, `js/ai-search.js` mode
`marshal`) and Rust (`marshal.rs`, `search.rs`) choose identical commands on
the recorded games (`cargo run --release -- decide`, corpus game set "d"
Marshal v Apex on two boards, both seats). Stock bots are unchanged: the
original 54-game corpus still passed before regeneration.

## 4. Measurements

All with fair dice, both seats on every board; score = wins / games, 95%
Wilson interval.

| Test | Result |
| --- | --- |
| Tuned greedy vs default greedy, tuning boards (71-118) | 59% → 78% mean score vs Tactical+Classic while tuning |
| Same set, validation boards 32–55, vs Tactical | 63.5% [57.8, 68.9] |
| Same set, validation boards 32–55, vs Classic | 75.3% [70.1, 80.0] |
| Marshal (Apex + weights) vs stock Apex, validation boards, 144 games | 68.1% [60.1, 75.1] |
| Marshal vs Classic, validation boards | 88.2% [81.9, 92.5] |
| **Test boards 0–31, 128 games each, seed final1** | |
| Marshal vs Classic | 78.1% [70.2, 84.4] |
| Marshal vs Tactical | 69.5% [61.1, 76.8] |
| Marshal vs Sequence | 60.9% [52.3, 69.0] |
| Marshal vs Simulation | 58.6% [49.9, 66.8] |
| Marshal vs Apex | 57.0% [48.4, 65.3] (interval includes 50%) |

Seat asymmetry (why Union is the open problem): in the test-board games
Marshal wins 56–8 as Xenon but 17–47 as Union against Apex. In default-weight
greedy mirror games on tuning boards, 44% of games reach the turn limit
(Xenon wins) and Union wins 34%. A stronger Union play style is the largest
remaining lever, ahead of more search.

Baseline facts that shaped the design: base capture ends 65% of bot games,
turn limit 18%, and Xenon wins 58% of bot-vs-bot games.

## 4b. Board sets (2026-09-29 revision)

The first split (boards 71-118 / 32-55 / 0-31) was by number. Survey with
`tools/sim/board-survey.py` (seat-swapped pairs on all 119 boards, 8 cycles,
Tactical v Classic and a tuned greedy v Tactical) showed why that is weak: with
both seats played, a board separates two bots only when one wins both games of
a pair. On boards 0-31 only 30% of pairs were decisive and Xenon won both games
of 57% of pairs; on 56-70, 82% were decisive. Boards where the seat decides
most pairs (33 of 119) are now excluded, and the remaining 86 are split
deterministically into `sim/data/board-sets.json`: 44 train, 21 validation, 21
test (`--boards=set:train|validation|test`). The test set is for one final
measurement per design. Marshal v1 was tuned on the old split, so its numbers
in section 4 stand as measured there; the new sets are clean for future work.

Measured on the new test set (21 boards, 6 cycles, both seats): the tuned
greedy weights (Marshal's evaluation without search) score 65.9% [59.8, 71.4]
against default Tactical and 81.0% [75.7, 85.3] against Classic.

Attempts this round that did not ship:

- Union-only retune against the tuned greedy on the new train set (danger 0.32,
  base_worth 144, hunt_worth 97.5): 54.8% [48.6, 60.8] against v1 on validation
  in the greedy proxy, but only 42.9% (42 games) for the Apex-based bot against v1
  on the test set. Weights tuned on the greedy proxy did not transfer; not
  shipped.
- Late-game weights (`Profile.late`, blended by turns used): built in both
  languages; hand-set late Union profiles moved the mirror score by 2 to 5
  points inside the noise. Marshal ships with early = late.
- `marshal/deep` (Apex search work doubled) against standard: 24-18, 57.1%
  [42.2, 70.9] on 42 games at about twice the time; not adopted.
- The Apex-based bot is too slow to tune directly: 42 validation games take 3 to
  8 minutes. Tuning uses the greedy planner as a proxy, which is why transfer
  is the weak point.

## 5. Not yet done for Marshal

- Layers proposed but not built or measured: exact win-now / mate search using
  kill probabilities, base-safety verification, clock-and-role posture (weights
  changing with turns left), focus-fire kill planner. Each is added only if the
  laboratory shows a gain on validation boards.
- Union-specific breakthrough behavior (see section 4).
- The final test-board result was measured once; further changes to Marshal
  need a new held-out set (boards 0–31 were used once for v1).
- Pruning the older bots from the menu: not done, pending the user.

## 6. AlphaGo-style bot: design only

GPU check (2026-09-29): NVIDIA RTX 3090, 24 GB, driver 595.91, CUDA 13.2, on a
32-thread, 60 GB machine. It does not speed up Marshal or the current bots:
their search is branching game logic on CPU threads. It would help this plan:
training the policy and value networks and batch-evaluating search leaves.

Not built. It does not change the product until the user approves it.

**Playstyle.** Such a bot maximizes probability of winning, not material. In
this game that shows as:

- Trades that lose units but open the base lane, and refusal of even trades
  when the clock favors the holder.
- As Xenon, deliberate stalling (the turn limit is its win condition) with
  exact accounting of which enemy capturers can reach the base next turn.
- As Union, concentrating on one lane with a decoy elsewhere, spending the
  whole army on the 1–2 turns where the capture race is decided.
- Quiet moves when ahead (lower variance), aggressive moves when behind.
- Exact use of combat odds: focus fire to convert damage into kills.

**Components.**

1. *Policy network*: scores each macro action (the existing one-unit
   activation) from board planes (unit types, strength, experience, terrain,
   base ownership, turns left). Used as a prior in tree search.
2. *Value network*: probability that the side to move wins, from the same
   planes.
3. *Search*: PUCT tree search over macro actions with chance nodes for combat
   (the exact loss distributions already exist), the policy prior narrowing
   branches and the value network replacing rollouts. Reuses `search.rs`
   structure and the Rust simulator.
4. *Training*: (a) imitation of Marshal/Apex decisions to start; (b)
   self-play with search-improved targets over the 100+ maps, both seats, a
   league of past versions to prevent cycling; (c) promotion only if the new
   version beats the previous one on validation boards at p<0.05.

**Constraints and open decisions (user).**

- *Determinism*: JS and Rust must choose the same action, so inference uses
  integer or fixed-order float arithmetic; the corpus lock covers it.
- *Runtime*: the network must run in a browser worker within the turn-time
  target; small (about a million weights) convolution-plus-MLP models
  written in plain JS/Rust, no new dependency without approval.
- *Compute*: self-play needs the Rust simulator's games/s times a network
  call per node; the plan needs a machine-time budget. A GPU is available (see above), so training is
  feasible locally; browser inference still has to run on CPU.
- *Evaluation*: same boards split as Marshal (tuning 71-118, validation
  32–55, final-only 0–31 spent; a fresh set must be created, for example by
  generating new maps).
- *Risk*: the Union-seat disadvantage means self-play may converge to Xenon
  stalling; the league needs seat-balanced reward or seat-specific value
  targets.
