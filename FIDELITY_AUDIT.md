# Original Nectaris fidelity audit — 2026-09-20

**Verdict: closer after the corrections below, but not an exact reproduction.**
The earlier implementation both omitted original behavior and allowed extra
actions. Passing our tests establishes consistency with the adopted rules;
it does not establish equivalence to the original executable.

The comparison target is **1989 Japanese PC Engine Nectaris**, with the
TurboGrafx-16 English names retained. This baseline follows the latest request
for maximum fidelity; it supersedes the earlier custom base-storage and
all-reserves-count decisions. Windows, PlayStation and TG-16 sources are
identified separately. This audit does not claim their releases are identical.

## Full booklet review and action correction — 2026-09-21

See [MANUAL_AUDIT.md](MANUAL_AUDIT.md) for the complete page-by-page review of
both original booklets, current code evidence and the limits of certification.
The previous audit missed the absent initial Shift/Attack choice: engine legality
was correct, while UI tests enforced movement-first selection. Selection now
offers **Shift / Attack**, and Atlas immediately exposes its stationary targets.
All player-facing command labels use Shift. Regression cases cover the actual
selection flow, and an independently transcribed fixture checks all 23 unit rows.

The original **combat-results army-strength graph** is also missing; this was
not identified in the earlier differences table. Profile history and forecast
heatmaps are not equivalent. The original PCE/TG-16 manuals also explicitly
document two-player play, so that capability is not solely a later-port feature.

## Requested implementation pass — 2026-09-20

Scope confirmed by the user: implement missing gameplay behavior and the advanced
campaign. **Leave every extra feature unchanged.** Soundtrack, battle
presentation, in-game Manual and Surrender are explicitly excluded. No Original
mode, restrictions, removals or changes to forecasts/profiles/custom packs were
requested or introduced by this pass.

Completed:

- CPU field boarding, direct factory boarding, transport rendezvous, delivery
  and legal unloading. Newly loaded passengers wait for their next activation.
  Landing selection considers the passenger's terrain access; carriers leave
  the prison hex free for the subsequent infantry capture.
- CPU Atlas deployment at the documented four-enemy threshold (aircraft count).
  Multiple reserve deployments and mine deployment already existed in the
  checkout at the start of this pass. The CPU now revisits factories after its
  field actions, so captures and transport rendezvous can release ready reserves.
- CPU factory exits follow the user's corrected recollection: start upper-left
  and scan clockwise for the first available destination, including compatible
  transports in the same scan. An original execution trace remains outstanding.
  Regression tests cover both column
  parities, map edges, blocked exits, carrier compatibility/capacity and boarding
  into a carrier just deployed from the factory.
- CPU diversion around guarded factories and a defensive response to an
  infantry-loaded Pelican approaching its base. These restore documented kinds
  of decisions; numerical priorities and tie-breaking remain reconstructed.
- All 16 advanced missions, TLOVER through ROTCEN, extracted from the same
  verified Hudson executable as the normal campaign. Normal data is unchanged.
  Missions 17–32 are wired into the menu, map jump, next mission and existing
  profile/save/result handling. See `LEVEL_SOURCES.md` for source discrepancies.

Still unresolved: exact original CPU decision order/scoring, the additional
Atlas infantry trigger, original frame-dependent RNG/call sequencing, and the
PCE boundary cases below. **This pass does not establish an exact CPU or RNG
clone.** The Windows executable confirms our ordinary damage-floor ordering;
see `ORIGINAL_EXECUTABLE_NOTES.md` for addresses and remaining limits.

## Current differences only — clarification after the fixes

The table later in this document contains history, including bugs already fixed.
It must not be read as a list of current violations. Also, a feature present in
an official port is not an invented rule merely because the 1989 PCE edition
lacked it. “Unverified” is not the same as “incorrect.”

### Missing or replaced behavior

| Current difference | What our remake actually does | Why it remains |
|---|---|---|
| Exact original transport choices remain unverified | CPU now boards, carries and unloads units, including factory reserves and infantry attacks on bases. | Pickup/landing priorities are reconstructed; original per-mission decision traces are unavailable. |
| Additional Atlas infantry deployment trigger remains unverified | CPU implements the documented four-enemy deployment condition and can deploy mines and multiple reserves. | The separate infantry condition is not specified by the PCE source. Windows disassembly identifies a further state-dependent branch but does not establish the PCE condition. |
| Original tactical decision-making is replaced | New attack scoring and activation order, with guarded-factory diversion and a response to infantry-loaded Pelicans threatening the base. | We wrote a heuristic opponent. The original CPU has not been reconstructed; stronger or weaker play is not proof of fidelity. |
| Original random sequence generation is replaced | Mulberry32 with independent opposing rolls, rather than a recovered original generator. | The Windows generator has now been located, but it shares state with frame activity and presentation calls. PCE equivalence and exact call sequencing remain unverified; transplanting the generator alone would not reproduce the original stream. |
| Original audiovisual battle presentation is replaced | Map explosions and casualty counters, recreated terrain/art options and new procedural music. Legacy unit icons do not reproduce the entire original presentation. | The renderer and music were authored for this remake; full original combat scenes/audio were not implemented or imported. |
| Original in-game Manual and Surrender command are missing | Markdown help and Save & Menu; no original tutorial/manual mode or command to concede the match. | Those interfaces/actions were not implemented. Saving and leaving is not surrendering. |
| Original combat-results graph is missing | Profiles record match outcomes; no turn-by-turn army-strength graph is shown. | The booklet's results display was not implemented; see `MANUAL_AUDIT.md`. |

Evidence for CPU transport attacks: [TG-16 firsthand strategy guide](https://gamefaqs.gamespot.com/tg16/589030-military-madness/faqs/30552).
For CPU response to loaded Pelicans: [Anka's factory tactics](https://anka.sakura.ne.jp/nectaris/l5.html).
For original surrender controls: [TG-16 walkthrough](https://gamefaqs.gamespot.com/tg16/589030-military-madness/faqs/53871).
PCE/Windows in-game manuals are identified in [Anka's supplement](https://anka.sakura.ne.jp/nectaris/d1.html).

### Extra capabilities / altered player experience — explicitly unchanged

| Current addition | How it differs | Why it exists |
|---|---|---|
| Statistical combat forecasts | Shows casualty distributions and kill probabilities from 100,000 trials, beyond the original attack/defense information. | Explicit modern combat-inspector feature; changes the player's available information. |
| All-mission access and map jumping | All installed missions are available immediately, without reproducing the original password/progression interface. | Deliberate mission-browser and testing convenience. |
| Custom unit statistics and arbitrary turn limits | Custom games can exceed the official 23-unit roster and 50-turn scenario limit. | Modding/data-driven level support. Stock original maps retain their ordinary roster and limit. |
| Additional scenario packs | Lunar Frontiers and the remake rosters on Base Nectaris terrain are not original campaign missions. | Added playable content; they do not replace the missing advanced campaign. |
| Profiles, detailed result history and per-action browser autosaves | Our particular persistence and reporting system is new. Saving itself is not inherently unofficial across all ports. | Explicit product features for continuing browser sessions and tracking results. |
| Modern control and display options | Mouse flow, zoom/pan, themes and AI animation controls differ from the original interface. | Browser usability and requested presentation choices. |
| Base inventories in old saves/custom maps | Those reserves can still be inspected and deployed even though fresh factory-style storage in bases is now disabled. | Compatibility preserves units already stored by the previous rule instead of deleting them. |

### Real release differences, not evidence of invented rules

- An editor is present in Windows and PlayStation releases. Two-player play is
  present in PlayStation Nectaris. They must not be labelled incompatible with
  *every* official version. [Release guide](https://nectaris.tg-16.com/nectaris-military_madness-FAQ-playstation-intro.html)
- Our Panther-to-Mule factory-only exception, direct unloading into an owned
  factory, and stored-Atlas elimination exception select documented PCE rules.
  Other ports differ; that does not make these choices unofficial.
- We omit the documented transient PCE/Windows factory-capture ZOC bug. This is
  a known difference from those releases, not a universal missing game rule.
  It remains omitted because the exact lifetime/trigger has not been established.

### Suspected differences that are not yet proven violations

Exact PCE intermediate arithmetic (Windows damage-floor order now checked); original opposing-roll correlation; direct PCE confirmation of ZOC
escape/terrain charging and buggy retreat boundaries (Windows range routines now traced); adjacent-factory transfer;
aircraft on hostile factories; carrier attack timing around unloading;
factory inventory order; and victory-check timing. Our current implementation
is concrete, but original execution traces are missing. For example, elimination
is currently checked after combat, not after every ownership change; whether
that matches an original release has not been established. Internal engine API
validation gaps likewise are not automatically player-accessible rule differences.

No remaining ordinary unit-stat, range or terrain-cost mismatch has been
demonstrated by this audit. The earlier uniform damage rolls, unrestricted Mule
cargo, same-turn passenger load/unload, illegal drops, missing cargo casualties,
repair omissions, base-storage extension and transport-only Atlas deployment
were corrected in the preceding work; they are not current defects.

## Evidence

- **[PCE manual](https://dds.konami.com/games/manual/pcemini/jp_Nectaris.pdf)**,
  Hudson's original Japanese booklet, officially scanned by Konami. Printed
  pages 4–11 cover commands, terrain, units and special abilities.
- **[TG-16 manual](https://dds.konami.com/games/manual/pcemini/en_Military.pdf)**,
  official scan of *Military Madness*. Used to cross-check the basic rules.
  Both are linked from [Konami's manual index](https://www.konami.com/games/pcemini/manual/jp/ja/).
- **[Anka's unit/movement tables](https://anka.sakura.ne.jp/nectaris/d2.html)**,
  **[combat reconstruction](https://anka.sakura.ne.jp/nectaris/d3.html)**,
  **[experience](https://anka.sakura.ne.jp/nectaris/d4.html)** and
  **[weighted randomness experiment](https://anka.sakura.ne.jp/nectaris/d5.html)**.
  Community evidence, not a Hudson specification. The experiment includes
  original PCE observations; the reconstruction explicitly discusses PCE/Windows.
- **[PCE/Windows manual supplement](https://anka.sakura.ne.jp/nectaris/d1.html)**
  and **[release differences](https://anka.sakura.ne.jp/nectaris/d6.html)**.
  Essential for rules that differ between ports.
- **[TG-16 firsthand FAQ](https://gamefaqs.gamespot.com/tg16/589030-military-madness/faqs/53871)**
  and **[BASE NECTARIS weapon guide](https://nectaris.tg-16.com/Universal_Weapon_Guide_01.html)**.
  Corroboration; the latter mixes releases and cannot alone establish PCE quirks.

## Comparison

“Matches documentation” means the behavior agrees with the cited evidence,
not that every boundary case has been observed on hardware.

| Rule family | Before audit | Current result / evidence |
|---|---|---|
| Roster and squad size | 23 types, strength 1–8 | Matches PCE manual. Documentation incorrectly said 22; corrected. |
| Attack, defense, move and range stats | PCE values | Retained. PCE manual confirms Giant air attack 40, Atlas ground attack 90 and Slagger defense 50. Some English FAQs disagree; these are not interchangeable evidence. |
| Terrain costs | Chassis costs, forbidden terrain, valley exhaustion | Matches published movement table. Rabbit/Lynx use fighting-vehicle costs. Giant cannot enter wasteland. |
| Air movement | Cost 1 on every terrain; no terrain defense | Matches manuals. Air still occupies a hex and projects ZOC. |
| Occupancy | Enemy blocks; friendly pass-through; no stacking | Retained. Transports are the boarding exception. |
| ZOC | Stop on entry; at most one hex when starting inside enemy ZOC | **Fixed 2026-09-22:** leaving ZOC permits normal movement and terrain costs until another ZOC is entered. All 59 isolated Windows fixtures match; direct PCE confirmation remains open. Execution revalidates stale previews. |
| Rabbit / Lynx | Shared movement budget and one attack, with recent ZOC fix | Retained: Rabbit 8, Lynx 6; no refill after attacking. Lynx ground range exactly 2, air range 1. |
| Ordinary attacks | Move then attack; attack ends activation | Retained. Added engine rejection of friendly, hidden/carried and out-of-range targets. |
| Indirect attacks | Minimum range 2; no counter, support or surround | Matches documentation. Hadrian/Octopus/Atlas/Hawkeye move **or** fire; Lynx is the exception. |
| Counterattacks | Adjacent only, matching target domain; pre-battle strength | Retained. Casualties do not reduce the simultaneous return shot. |
| Support | Strength-weighted relevant base stats / twice initiator strength | Matches combat reconstruction, including the unusual defense denominator. |
| Terrain / surround / caps | Add terrain; halve defender after support and terrain; cap 100 | Matches reconstruction. Edge units cannot be surrounded; initiating while surrounded has no penalty. |
| Damage and temporary HP | Integer damage stages; `100 × strength + 50`, except strength 1 | Windows floor ordering confirmed by disassembly; direct PCE verification remains outstanding. |
| Random damage | Uniform 381 values from 0.20 to 4.00 | **Fixed:** published 14-value weighted table. AI expectations, combat and forecasts now agree. |
| Experience | Correct coefficients; extra +2 for a damaged defender's counter-kill | **Fixed:** damaged surviving defender +1; unhurt +2. Attacker +0/+1/+2 and factory capture +4 retained. Anka's explicit table takes priority over ambiguous English prose. |
| Mule cargo | Any non-transport ground unit | **Fixed:** Charlie/Kilroy/Atlas/Trigger; PCE Panther exception only directly from a factory. |
| Pelican cargo | Rejected empty Mule | **Fixed:** any ground unit, including empty Mule; nested loaded transports forbidden. Squad strength is not cargo capacity. |
| Boarding controls | Map click switched selection | **Fixed:** highlighted carrier click boards the selected passenger. Used carriers can receive passengers. |
| Loading / unloading | Same-turn load-and-unload allowed; unloading consumed carrier action | **Fixed:** passenger activation controls unloading. Unload before moving or after a committed carrier move is possible; newly boarded passengers wait. |
| Unloading destination | Any passable terrain; infantry could drop onto enemy base | **Fixed:** plains/road/bridge, plus owned-factory storage in PCE. No hills, mountains, valleys, hostile factories or prison-base drops. |
| Transport casualties | Cargo survived intact until carrier destruction | **Fixed:** on carrier casualties, cargo strength clamps to remaining carrier strength. It never increases. |
| Immobile units | Atlas/Trigger could only leave in a transport | **Fixed:** direct adjacent factory deployment also allowed. Once placed they cannot move or reboard. |
| Factory repairs | Ground only; loaded transports rejected | **Fixed:** aircraft and loaded transports enter; passenger and carrier repair into separate stored units. Experience preserved. |
| Factory capture / deployment | Infantry capture, reserve transfer, adjacent exits, activation delay | Retained. Captured ready reserves may deploy; capturing infantry waits. No production, purchases or resource economy. |
| Bases | Custom storage/repair and ground parking prohibition | **Fixed:** prison bases permit parking and provide ground defense 35. No automatic storage/repair; enemy-base infantry capture wins. |
| Elimination | All mines and stored Atlas counted | **Fixed for PCE:** mines excluded; Atlas in storage excluded; other owned reserves count, even with blocked exits. |
| Turn limit | Default 50 rounds, Xenon wins timeout | Retained. Exact victory-check timing is a remaining trace item. |

The main gameplay correction is the random distribution: its mean damage
multiplier is **1.11**, versus the old **2.10**. This does not mean every battle
deals 47% less damage, because casualties are rounded and capped. It does mean
the old battles had a systematic lethality bias. The independent Falcon/Hunter
example now reproduces the published survivor probabilities exactly.

Implementation: `js/data-units.js`, `js/data-terrain.js`, `js/combat.js`,
`js/engine.js`, `js/ui.js`, and the factory repair target in `js/ai.js`.
See `MECHANICS.md` for the adopted rules and source links.

## Remaining gaps, in priority order

1. **Exact original CPU behavior.** Documented transport, factory and base-defense
   behaviors are implemented. Scoring, action order, exact threat thresholds and
   the additional PCE Atlas infantry trigger still require original traces.
2. **Original random stream.** The Windows byte generator, percentile conversion,
   damage mapping and two successive battle draws are identified. Frame activity
   also changes that state. PCE equivalence and full call/timing behavior remain
   unverified; the runtime generator is unchanged. Ordinary damage flooring is
   confirmed for Windows. See `ORIGINAL_EXECUTABLE_NOTES.md`.
3. **PCE edge cases.** Direct confirmation of ZOC escape/terrain charging and buggy retreat ranges (59 Windows fixtures now pass),
   adjacent-factory transfers, aircraft on hostile factories, inventory ordering,
   capture-ZOC bug lifetime and exact victory-check timing still need traces.
4. **Excluded by request.** Battle presentation, soundtrack, Manual and Surrender
   remain outside this implementation pass. All extra features remain in place.

## Remake facilities and compatibility

Profiles, browser saves, hotseat play, a mission selector, editor, custom units,
per-map turn limits, additional map packs, zoom, themes and statistical forecasts
are remake facilities. Their exact implementation is ours, but editors,
two-player modes and saves also exist in official ports; those capabilities
alone are not violations of every release. They remain available. Original campaign data was not
retuned. Modern controls and the forecast do not themselves grant additional
unit actions, but a 100,000-trial probability display gives information the PCE
interface did not provide. Historical saves may retain custom unit definitions
and inventories already placed in bases; those are preserved rather than
deleted. Missing old Mule passenger restrictions are migrated on restoration.

## Verification

`node test/run-tests.js` exercises all 56 maps, combat, transport timing and
terrain, factory/base behavior, victory exceptions, save/resume and UI actions.
The normal campaign extraction is byte-identical after adding the advanced
selector. All 56 maps undergo validation and AI self-play. Targeted CPU tests
cover boarding/delivery/capture, passenger timing, terrain barriers, Atlas
deployment, guarded factories and base defense. Browser smoke tests verified
TLOVER rendering and Save & Menu → Continue using isolated in-memory storage.
The local browser also restored an existing match and exposed Atlas factory
deployment destinations; the preview was cancelled without changing the match.
`test/fidelity-tests.js` adds independent published battle examples rather than
only comparing the forecast to our own resolver. Other updated tests remove
the previous assumptions that tanks fit in Mule, passengers unload immediately,
and bases behave like factories.

For the next fidelity pass, capture reproducible original PCE inputs and outputs
for the unresolved gaps above. Record release/region, map, initial state, action order
and resulting state. Matching those fixtures will be stronger evidence than
additional self-play runs.
