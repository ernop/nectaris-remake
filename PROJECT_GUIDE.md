# Project guidance and decision index

Audited 2026-09-23; battle, camera, experience and campaign-menu records updated 2026-09-26. This is a map of the records, not a second specification.
Use the owning document below for details. A newer, explicit user correction
supersedes an older decision; update its record rather than leaving conflicting
instructions for the next session.

## Current guidance

| Topic | Owning record |
| --- | --- |
| Working rules, dependency-free runtime, fixed development endpoint, validation and asset boundaries | [agents.md](agents.md) |
| Running, controls, saves, editor, custom units and sharing | [README.md](README.md) |
| Product behavior, interaction requirements, UI presentation and individual map design choices | [PRODUCT.md](PRODUCT.md) |
| Adopted PCE gameplay rules, release distinctions, sources and known uncertainty | [MECHANICS.md](MECHANICS.md) |
| Visual theme, proportions, lighting, palette, geometry and art implementation status | [ART_DIRECTION.md](ART_DIRECTION.md) |
| Map provenance, import permissions and publishing levels | [LEVEL_SOURCES.md](LEVEL_SOURCES.md) |
| Original Remake unit source, export process and review tools | [art/units/README.md](art/units/README.md) |
| Legacy import provenance, reconstruction and rendering behavior | [art/legacy/README.md](art/legacy/README.md) |

The product retains lunar military tactics, sourced PCE rules with English unit
names, and the requested browser facilities. The visual direction is angular
military pixel art with small infantry, pale armor and upper-left light. Remake
bases are domed; Legacy buildings follow the original's top-down tiles. Remake
and Legacy have distinct provenance and implementation status.
Original map families and their route, symmetry, roster and inventory choices
are recorded in PRODUCT, separately from imported campaigns that must not be
retuned. These themes do not authorize extra features or unsourced rule changes.

## Status, pending work and ideas

| Item | Status and record |
| --- | --- |
| Fuseki hosting | Live 2026-09-26 at https://nectaris-remake.fuseki.net/; every master commit passing Tests is released. [Scope](PRODUCT.md#fuseki-hosting-2026-09-26). |
| Campaign menu for new players | Implemented from the user's 2026-09-26 request: one header row (large NECTARIS, Campaigns / Bot tournament tabs, "You are logged in as Wilson" profile menu), one settings row (Mode, hotseat, AI), default profile Wilson, no language option, Normal / Advanced / Base Nectaris first, no `?` on the original campaigns, denser entries. Match defaults: Pixel + Legacy, Watch AI on, separate Move animation toggle. [Record](PRODUCT.md#campaign-menu-for-new-players-2026-09-26). |
| Second-player compensation offers | Updated from the user's 2026-09-25 request, then simplified on 2026-09-26 into the menu's Mode dropdown (Normal default / Offer for first, no map-default choice; tournaments have their own tab); guided private switch-point questions, 32 cumulative menus, fixed previewable sites, explicit no-deal policies and saved/replayed initiative. Each bot uses its own move policy to assess opening roles. Offer fixtures mirror both factions and tie recipients; accepted offers are not measured equal odds. [Protocol and scope](PRODUCT.md#compensation-offers-before-play-2026-09-23). |
| Board orientation and control docking | Updated through the user's 2026-09-26 correction: fixed left controls/metadata, full-height board, no content-driven reflow and no opponent-driven camera movement. Replay following requires opt-in. Auto / Normal / Sideways orientation remains; since 2026-09-27 Legacy terrain stays upright on a turned board. The Details panel was removed on 2026-09-26; hover cards carry unit and building details (empty-hex terrain is a known gap the user left open), and the hover forecast sits under the unit's action strip. Since 2026-09-26 the panel prints the level name with no mission chooser, and its settings sit in one compact block at the bottom. Status lines and Undo/Redo/End Turn never move during play; changing content scrolls in the panel's middle section (user, 2026-09-26). [Layout behavior](PRODUCT.md#board-orientation-and-control-docking-2026-09-23), [Details removal](PRODUCT.md#optional-inspector-and-full-map-height-updated-2026-09-25). |
| Unit activation completion | Implemented from the user's 2026-09-23 original-game correction: leaving a started activation forfeits its remaining attack or buggy retreat; returning to the unit later cannot reopen it. Saves and Undo retain the correct action state. [Action rules](MECHANICS.md#units-and-actions), [controls](PRODUCT.md#shift-target-inspection-and-combat-controls-updated-2026-09-21). |
| Firing-area borders | User-requested visual trial implemented: outer and inner contours replace per-hex firing outlines; awaiting user assessment. [Trial scope](PRODUCT.md#firing-area-border-trial-2026-09-23). |
| Remake stock unit roster | Implemented: 23 types, two native 32×32 facings. Map icons scale with zoom; panel/review icons remain native. [Unit record](art/units/README.md). |
| Three AI-made terrain campaigns | Implemented with explicit AI-made labels and Codex attribution: Open Horizons, The Knotted Heart and Broken Ground, 16 new missions each, with separate progress and next-mission navigation. [48-map catalog](ENVIRONMENT_CAMPAIGNS.md), [scope and design decisions](PRODUCT.md#three-terrain-campaigns-2026-09-23). |
| Mission library | Each entry stays on one line; wide screens show three levels across per row, with two or one on narrower screens. Faction totals align vertically, the entry starts play, and edge help closes on mouseout with zero delay. Since 2026-09-26 help appears only where notes exist and never on the original campaigns. [Content and interactions](PRODUCT.md#mission-library-and-deliberate-help-controls-2026-09-23), [comparison rule](PRODUCT.md#single-line-comparison-entries-2026-09-23-clarification). |
| UI contrast | Explicit requirement: opaque readable text and saturated faction colors, including secondary labels and campaign numbers. [Color guidance](PRODUCT.md#readable-interface-colors-2026-09-23). |
| Factory inspection | Hover supplies contents; clicking opens only an owned building's actionable deployment picker. The 2026-09-26 clarification preserves the existing stars/layout; the reported missing-star mouseover still needs an exact reproducer. [Factory behavior](PRODUCT.md#building-capture-storage-and-deployment-updated-2026-09-23). |
| Legacy unit icons | Rebuilt 2026-09-26 after the user reported a broken Rabbit: all 46 frames had see-through holes and uneven pixels. The importer now reads the chart's 2×2 art-pixel grid; every unit, infantry included, is drawn at exactly 2× by user decision, and the Remake size limits no longer apply to Legacy. [Decision](PRODUCT.md#selectable-art-sets-2026-09-20), [method](art/legacy/README.md). |
| Legacy terrain and borders | Implemented: flattened geometry, connected relief, continuous mountain runs and a rounded board frame. The user requested better borders; the frame shape was an implementation choice, not an explicitly selected user preference. Turned boards draw the tiles upright instead of rotating them (user, 2026-09-27). A 2×2 art-grid redraw of the tiles was reverted the same day at the user's request; the prior tiles are back, with the redraw's continuous riverbeds kept. Also that day, at the user's request, the base and factory were redrawn after the original's tiles (walled prison camp; tanks, hall and sheds) so they no longer look alike. [Border requirements](PRODUCT.md#connected-terrain-and-board-borders-2026-09-23), [redraw](PRODUCT.md#legacy-terrain-redraw-and-upright-turned-boards-2026-09-27). |
| Remake production terrain/buildings and flattened geometry | Planned, still pending. The art review fixture is not production completion. Classic/neon retain their existing vector rendering and projection. [Art status](ART_DIRECTION.md#implementation-status-and-remaining-checks). |
| Fifteen numerical ground-unit concepts | Experimental proposals, not additions to the playable roster. Numerical coverage is not evidence of balance; artwork is a separate review pack. [Study, assumptions and playtesting needs](tools/design-space/README.md). |
| Fifteen designed ground-unit concepts | Experimental proposals, not additions to the playable roster. One missing decision per unit, drawn inside the 1989 rule grammar, separate from the numerical distance study. [Design and overview](grok4.7/README.md). |
| Grok 4.7 tactical gap-filling units | Experimental 15-unit proposal based on operational wargame doctrine, combined arms and tempo tradeoffs. Complete with 32×32 pixel art, verified engine definitions and fluid high-contrast viewer. [Dossiers and specifications](grok4.7/README.md), [interactive overview](grok4.7/gallery.html), [record](PRODUCT.md#grok-47-15-tactical-gap-filling-units-study-2026-09-23). |
| Gemini 3.8 tactical gap-filling units | Experimental 15-unit proposal designed by Gemini 3.8 addressing operational gaps (Alpine infantry, frontline flak, heavy assault guns, static SAMs, tank destroyers, and attack gunships). Complete with 30 native 32×32 sprites, verified engine definitions and fluid zero-gray UI. [Dossiers and specifications](gemini38/README.md), [interactive overview](gemini38/gallery.html), [record](PRODUCT.md#gemini-38-15-tactical-gap-filling-units-study-2026-09-23). |
| Claude Opus 5.5 gap-filling units | Experimental 15-unit proposal, not additions to the playable roster. Each unit fills one rule combination the stock roster leaves empty, checked as a test over the stock data; every printed exchange is computed by the engine and asserted by the pack's `verify.js`. In-game sprites remain stock placeholders. [Overview](opus55/index.html), [design and review](opus55/README.md), [record](PRODUCT.md#claude-opus-55-gap-filling-units-study-2026-09-23). |
| Exact original CPU, random stream and PCE boundary cases | Unverified research gaps, not established rules or a claim of full fidelity. [Remaining gaps](FIDELITY_AUDIT.md#remaining-gaps-in-priority-order). |
| Search opponents and self-play tournaments | Implemented from the subsequent 2026-09-23 request: opponent picker (since 2026-09-26 chosen in the menu and fixed for the whole match), greedy/beam/MCTS/hybrid algorithms, generic existing capabilities, background workers, mirrored tournaments, durable out-of-order results, per-run Elo, reload/Resume, indexed map/pair history and full-window replays with checkpoint seeking. No personalities. Protocol 2026-09-26.2 removed the factory-exit special rules: search bots use general methods, not invented rules (user, 2026-09-26). Their position score is still a sum of hand-picked constants; the user deferred replacing it with self-play tuning or deeper simulation, then asked the same day for a training plan: [proposal and measurements](AI_TRAINING_PLAN.md). On 2026-09-27 the user put self-play speed first and asked to lock the game's behaviour as the AI sees it, then build a Rust simulator: the lock and the Rust rules engine are done, the Rust bots are next, and the plan's other decisions wait. [Rust simulator status](AI_TRAINING_PLAN.md#rust-simulator). [Implementation, usage and limits](AI_OPPONENTS.md); [earlier analysis](AI_DESIGN_RESEARCH.md). |
| Battle review in matches and replays | Updated 2026-09-26: fixed faction sides, per-side terrain, one-way fire cues, Ready/Fighting/Result stages, glowing earned stars on header icons only, pause/resume, default replay battle pause and optional skip. Experience ranks use icon stars throughout. Fixed left reports and board camera, exact hex routes, and no per-unit End remain. [Readout and replay controls](PRODUCT.md#battle-review-2026-09-25). |
| Soundtrack, Manual and Surrender | Excluded from the recorded fidelity implementation pass; original-style battle presentation was subsequently requested and is covered above; do not silently turn them into scheduled work. [Scope](FIDELITY_AUDIT.md#requested-implementation-pass--2026-09-20). |
| Deferred checks | Release-first mode since 2026-09-26: items to verify later are collected below and run together in one careful session. |

## Deferred checks (2026-09-26)

Release first, verify later (user decision). Examine together later:

1. Support/surround overlay while aiming:
   - legibility of the white, dashed orange, green and yellow outlines on Pixel,
     Legacy, Neon and Classic;
   - sideways boards;
   - the "SURROUNDED ½" label at small zoom.
2. The pre-battle effects sequence (0.8–2 s per battle) during long watched AI
   turns: should it be shorter or optional?
3. Click to skip:
   - from the map effects, a watched preview, fighting and the result;
   - with Pause and with Show map;
   - the Pause button must never skip.
4. Aftermath explosions:
   - visible after AI kills while the AI keeps moving;
   - the killer highlight clears on the next selection and at turn end;
   - mutual destruction.
5. Per-machine battle stats and the war-dock step table on narrow windows.
6. Loaded Mules: no Attack in the action menu; AI transport behavior; saves
   made with a loaded Mule.
7. The forecast's surround sentence and map legend wording.
8. The compact in-game settings and the re-imported Legacy unit art, both made
   by another session on 2026-09-26.
9. The tournament replay viewer with the per-machine battle stats. It has no
   skip or aftermath.
10. CI after GitHub's `ubuntu-latest` move to Ubuntu 26 (from 2026-10-19).
11. Battle-pair marks:
    - subtle but findable on each art style;
    - they clear on the next action;
    - a watched AI turn's last battle stays marked into the player's turn.
12. Replay pacing:
    - whether 450 ms moves and 1.4 s trails read well at each Speed setting;
    - bursts of deployments;
    - one-press Next action for non-battle steps.
13. The battle volley: how the bullets look on narrow screens and at each
    squad size; the loss burst; the single map explosion per squad.
14. After the tournament compatibility removal:
    - storage opens empty in a browser that ran earlier tournaments;
    - `test/tournament-storage.html` passes;
    - importing an older replay file shows the version error;
    - map sprites show no stars while hover cards and factory lists do.
15. After the save compatibility removal and the factory-exit rule removal:
    - the 64 px hover-card portrait and its star overlay at 0, 3, 5 and 8
      stars;
    - "Continue" on a save made before this build shows the older-version
      error rather than a blank screen;
    - `test/board-playback.html` hover and factory star checks pass;
    - how often search bots now strand their own factory with a mine.
16. Left panel layout: Undo/Redo, End Turn and the settings stay put while
    selecting units, aiming, during AI turns and after battles; the middle
    section scrolls on short windows; the forecast's heatmap is visible
    without scrolling on a 1080-pixel screen.
17. The original's star art over icons:
    - ranks 0–8 on the map hover card, factory and cargo lists, battle headers
      and small list icons, on each art set and style;
    - whether the dark edge keeps stars legible on light unit art;
    - the glow of new stars, the General included;
    - a damaged cargo unit's count above its stars.
18. Legacy terrain after the 2026-09-27 changes, normal and turned:
    - the new riverbeds beside every other terrain type, bridges included;
    - the new base and factory for each owner, including under the stored-unit
      count badge and with a unit standing on them;
    - the prior tiles drawn upright on turned boards, at zoom 1–4;
    - tall maps such as RAMSEY under Board: Auto;
    - frame corners and margins.
19. The Fit board (F) button and key during AI turns, battles and replays.

Research rather than a check: direct PC Engine confirmation of the Windows
combat traces.

## Evidence and history

| Record | How to use it |
| --- | --- |
| [FIRST_PLAYER_BALANCE_RESEARCH.md](FIRST_PLAYER_BALANCE_RESEARCH.md) | 2026-09-23 research and alternatives. The later compensation-offer implementation is recorded in PRODUCT; other proposals remain unapproved. The reported initiative advantage and resulting balance remain unmeasured. |
| [FIDELITY_AUDIT.md](FIDELITY_AUDIT.md) | Dated comparison, remaining differences and scope; current adopted rules live in MECHANICS and controls in PRODUCT. |
| [MANUAL_AUDIT.md](MANUAL_AUDIT.md) | Page-by-page source review and coverage at the time of the audit, with subsequent corrections. |
| [ORIGINAL_EXECUTABLE_NOTES.md](ORIGINAL_EXECUTABLE_NOTES.md) | Windows executable observations and explicit limits on extrapolating them to PCE. How to obtain the executable; ZOC/movement and combat traces (`tools/trace-original-*.py`, fixtures in `test/fixtures/windows-*.json`); the original pre-battle surround/support presentation. |
| [ART_RESEARCH.md](ART_RESEARCH.md) | Historical measurements and alternatives, superseded by ART_DIRECTION where decisions were made. |
| [art/pilot/README.md](art/pilot/README.md) | Native-size art review fixture and its validation, not the production map display policy. |
| [inspiration/nectaris-original/README.md](inspiration/nectaris-original/README.md) | Local reference manifest; captures are gitignored and not runtime/distributable assets. |
| [PERFORMANCE.md](PERFORMANCE.md) | Dated measurements and reproduction methods; recorded counts/timings describe their tested snapshots. |
| [AI_DESIGN_RESEARCH.md](AI_DESIGN_RESEARCH.md) | 2026-09-23 analysis of the current opponent, rules affecting AI strength and enjoyment, primary research, and proposed alternatives. The baseline sample is not a human-strength rating or balance verdict. |

Superseded choices remain history: the 64-pixel pilot, rounded/chibi unit
proportions, native-only map icons, and mountain-edge skirts that suggested a
route outside the board. Follow the current art and border records instead.

## Recording changes

When a user changes a rule, requirement or product choice, update the owning
record in the same change. Include the date, scope (including art set or game
release), source, implementation status and any older choice it supersedes.
Distinguish a user requirement from an implementation choice, a proposal and an
unverified inference. Describe ideas with their assumptions and unresolved
questions; do not promote them into approved work merely by documenting them.

Keep README usage and agent notes consistent where they repeat the behavior.
Link to detailed records instead of copying them into another rulebook. Preserve
dated evidence and add a correction/status note when it becomes stale. Record
validation against the tested version without presenting old totals as current
guarantees. Review these links and statuses when completing related work.
