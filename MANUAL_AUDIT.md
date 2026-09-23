# Original manual coverage review — 2026-09-21

This records coverage at the audit date. Later interaction choices, including
simultaneous movement/firing targets and top-bar Undo/Redo, are recorded in
[PRODUCT.md](PRODUCT.md); the sidebar-undo description below is historical.
Current adopted gameplay rules live in [MECHANICS.md](MECHANICS.md).

**Verdict: the Shift/Attack command gap is fixed. The remake is not a complete
reproduction of the original game.** Core documented actions have implementation
and regression coverage; several interfaces are missing or deliberately replaced,
and exact CPU, random-sequence and boundary behavior remains unverified.

## Subsequent control-flow decision (2026-09-21)

The user subsequently replaced the separate Shift-selection step with immediate
movement selection. Moves now commit immediately: attack or End when a shot is
available, otherwise finish automatically. Sidebar undo reverses noncombat
moves across units and stops at battles/turn boundaries. This deliberately
supersedes the command-flow assessment below; numerical rules and attack
restrictions remain in force. See `PRODUCT.md` for current behavior.

## Evidence and method

Reviewed every page of both publisher-hosted scans visually, including covers,
front matter, advertisements and the publisher's digitization notices (10 PDF
pages in each file). Page references below are the **printed booklet numbers**.

- [Japanese PCE manual](https://dds.konami.com/games/manual/pcemini/jp_Nectaris.pdf):
  the project's gameplay baseline. English unit names map by designation.
- [English TG-16 manual](https://dds.konami.com/games/manual/pcemini/en_Military.pdf):
  command terminology and corroboration; not a substitute for release-specific
  PCE evidence.
- Supplemental first-hand research: [unit data and abilities](https://anka.sakura.ne.jp/nectaris/d2.html),
  [manual supplement](https://anka.sakura.ne.jp/nectaris/d1.html) and
  [release differences](https://anka.sakura.ne.jp/nectaris/d6.html).

Each booklet section was compared with the corresponding code and tests below.
The numerical roster fixture was independently transcribed from the Japanese
chart; it is not generated from our runtime data. A browser fixture exercised
the actual DOM/canvas controls without modifying a saved player match.

## Why the action gap escaped review

The engine had `moveOrFire` and zero-movement Atlas data. The UI nevertheless
required every selected unit to enter movement selection and then click its own
hex to aim. The old UI tests explicitly required that flow, so a passing suite
could not reveal its missing command choice. The previous fidelity audit checked
attack legality but omitted an end-to-end comparison of the manual's commands.

The corrected flow exposes Shift and Attack before acting. Selecting Shift is
required before a destination can relocate a unit. Atlas aims immediately;
Trigger offers neither command and Pelican cannot attack. Unavailable actions
are disabled with an explanation. Artillery cannot combine shifting and firing;
ordinary units can shift then attack; buggies retain only their unspent allowance.
Provisional shifts remain cancellable, including restoration of artillery's shot.
The initial command choice itself does not consume an action or alter a save.

## Complete booklet coverage

“Covered” means implemented to the cited level of detail, not verified against
every original execution. “Equivalent UI” identifies a replacement explicitly.

| Printed pages, topic | Current code and evidence | Result |
|---|---|---|
| JP front matter–1; EN front matter–1: hardware, story | Browser runtime; remake briefings in map data. No original introduction cinematic. | Hardware instructions inapplicable; presentation differs. |
| JP 2; EN 2–3: modes, continuation, manual | `js/main.js` / `js/profiles.js`: new game, solo/hotseat, replay and saved match. | Play modes covered; passwords replaced; original Manual mode absent. |
| JP 3; EN 2–3: phases, capture/elimination objectives | `engine.endTurn`, `finishUnit`, `checkElimination`; `test/outcome-tests.js`. | Core objectives covered. Surrender absent; PCE elimination exceptions require supplemental evidence. |
| EN 3: normal/advanced progression | 16 normal + 16 advanced maps, Next Mission in `main.js`; campaign hashes in `run-tests.js`. | Campaign present; unlock/password gates and original ending sequence replaced. |
| JP 3; EN 4: displays and controls | `ui.refreshStatus`, unit inspector, renderer; UI tests. | Equivalent UI; mouse/keyboard, full-map view and damage-only strength labels are deliberate differences. |
| JP 4; EN 5, 10: hexes and terrain | `hex.js`, `data-terrain.js`, engine Dijkstra; hex/terrain tests. | Covered. Exact cost table comes from supplemental research, not the booklet alone. |
| JP 5; EN 5: Shift, transport, factory exits | `ui.selectUnit` / `beginShift`; engine loading/deployment/storage; combat/factory UI and fidelity tests. | Shift command fixed; transport and factory actions covered. Detailed timing exceptions are source-qualified below. |
| JP 6; EN 6: Attack, direct/indirect fire | `ui.openActionMenu`, `engine.attack`, `combat.rangeBand`; command tests. | Attack-in-place fixed; ordinary shift-then-attack and artillery exclusivity covered. Lynx exception resolved by supplemental research. |
| JP 7; EN 7: weapon inspection and phase end | Unit/hover inspector and End Turn; `unitInfoHtml`, `endTurn`. | Equivalent UI. Unit **End** is an additional per-unit control; **End Turn** ends the side's phase. |
| JP 7; EN 2, 7: pause/surrender | Save & Menu retains a resumable match. | Surrender is missing; saving/leaving does not concede. No original Fight/Surrender pause dialog. |
| JP 8–10; EN 8–9: all 23 weapons | `data-units.js`; `manual-contract-tests.js` checks all 138 numeric fields and action/capture flags. | Chart matches. Custom units remain an extension. |
| JP 11–12; EN 11: ZOC, experience, terrain, support/surround | `engine.js`, `combat.js`; core, buggy and fidelity tests. | Broad rules covered; exact arithmetic and boundary behavior need more than the manual. |
| JP 12; EN 6: combat-results graph | No turn-by-turn army-strength graph in `main.js`, `ui.js` or profiles. | **Missing; omitted from the previous audit.** Match-result history and forecast heatmaps serve different purposes. |
| JP 13; EN 12–13: strategy advice | Mechanics and inspectors support terrain, unit-matchup and support decisions. | Advice reviewed; no original tutorial/tip presentation. EN 13 is blank. |
| Back matter and digitization notices | No game behavior specified. | Reviewed; no implementation requirement. |

Two-player mode is documented in the **original PCE and TG-16 booklets**;
it is not merely a later-port feature. Our hotseat interface is different, but
two-player play itself is part of the original design.

## What the manuals cannot establish

The booklets describe play but do not specify complete algorithms. The existing
[fidelity audit](FIDELITY_AUDIT.md) and [executable notes](ORIGINAL_EXECUTABLE_NOTES.md)
remain necessary. In particular:

- The booklet's general prohibition on indirect fire after shifting has a Lynx
  exception. Anka's abilities section explicitly excludes Lynx from the four
  restricted guns. Buggy post-attack movement uses the remaining budget.
- Transport load/unload timing, PCE factory drops, Mule passengers, cargo
  casualties, and stored-Atlas elimination exceptions rely on the supplement
  and release comparisons. Their tests establish our adopted PCE behavior.
- Combat floors, temporary HP and weighted damage are reconstructed. Windows
  disassembly supports floor ordering; it is not direct proof of PCE instructions.
  Mulberry32 and independent opposing rolls do not reproduce the original stream.
- The CPU remains heuristic. Exact activation order, scoring, transport choices
  and the additional Atlas infantry deployment trigger are not established.
- Windows ZOC escape/terrain charging and buggy retreat ranges now have 59
  executable fixtures; the incorrect blanket one-hex-start rule was corrected.
  Direct PCE traces are still needed for those boundaries, adjacent-factory transfers, aircraft on hostile factories,
  carrier attack/unload timing, and victory-check timing.
- Anka describes factory inventory order by original unit ID. Our arrays preserve
  insertion order and imported maps do not retain those original identities.
  Exact original inventory ordering therefore cannot be claimed.
- The transient original factory-capture ZOC bug is not reproduced.

## Outstanding work and scope

The command change is complete. This review did not remove modern features or
silently implement the previously excluded Manual, Surrender, battle presentation
or soundtrack work. The newly recorded army-strength graph is also absent.
These are visible differences, regardless of whether individual combat rules
match. Completing a literal original-game interface would require addressing
them and deciding how password/progression presentation fits the existing menu.

For exact gameplay certification, the next evidence must be repeatable original
PCE traces with known map, unit state, action order and outcome. More self-play
alone cannot certify CPU or RNG fidelity.

## Verification

- `test/manual-contract-tests.js`: all 23 chart rows plus capture, buggy and
  artillery abilities, using an independent source fixture.
- `test/combat-ui-tests.js`: initial commands across the roster; no implicit
  shift; disabled-action handling; both artillery action orders; Atlas immediate
  targeting; Cancel/End; buggy retreat, forecast/save isolation and transports.
- `test/factory-ui-tests.js`: factory capture, storage and deployment through
  the new Shift command.
- Browser inspection: Hadrian command choice, in-place target display, Shift
  highlights, no attack after shifting, cancellation, Atlas direct targeting
  and completed attack, and Pelican's lack of Attack. No browser errors reported.
- Full `node test/run-tests.js`: includes map validation and self-play on all
  56 included maps, combat, transport, factory, saves and outcomes.
  Final result: **53,199 checks, zero failures**. JavaScript syntax checks and
  `git diff --check` also passed.

Passing these checks supports the listed implementation claims. It does not
change the overall verdict to “fully faithful.”
