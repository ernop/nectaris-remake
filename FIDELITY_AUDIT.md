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

## Current differences only — clarification after the fixes

The table later in this document contains history, including bugs already fixed.
It must not be read as a list of current violations. Also, a feature present in
an official port is not an invented rule merely because the 1989 PCE edition
lacked it. “Unverified” is not the same as “incorrect.”

### Missing or replaced behavior

| Current difference | What our remake actually does | Why it remains |
|---|---|---|
| Original computer transport tactics are missing | AI never plans boarding, factory-to-carrier loading or unloading. Humans can use them. Original CPU infantry airlifts are described in firsthand TG-16 guides. | Transport legality/UI were implemented, but the AI only has move, attack, repair, deploy and wait plans. |
| Original CPU Atlas deployment is missing | The AI skips stored Atlas and Trigger entirely. Original CPU Atlas deployment conditions are documented. Its one-reserve-per-factory-per-turn routine is also our simplification; exact original CPU deployment tempo remains unverified. | The AI deployment routine still filters out immobile types and visits each factory once. Correcting human deployment did not reconstruct this routine. |
| Original tactical decision-making is replaced | New attack scoring, activation order and nearest-target movement; no specific response to an infantry-loaded Pelican threatening the base. | We wrote a heuristic opponent. The original CPU has not been reconstructed; stronger or weaker play is not proof of fidelity. |
| Advanced campaign is missing | Only 16 normal original missions; no original missions 17–32. | Only the normal campaign was extracted/imported; the recorded redistribution authorization is scoped to those maps. |
| Original random sequence generation is replaced | Mulberry32 with independent opposing rolls, rather than a recovered original generator. | Deterministic saves/tests were implemented without reverse-engineering the original RNG. This establishes an implementation difference, **not proof that the current documented outcome probabilities are wrong**. |
| Original audiovisual battle presentation is replaced | Map explosions and casualty counters, recreated terrain/art options and new procedural music. Legacy unit icons do not reproduce the entire original presentation. | The renderer and music were authored for this remake; full original combat scenes/audio were not implemented or imported. |
| Original in-game Manual and Surrender command are missing | Markdown help and Save & Menu; no original tutorial/manual mode or command to concede the match. | Those interfaces/actions were not implemented. Saving and leaving is not surrendering. |

Evidence for CPU transport attacks: [TG-16 firsthand strategy guide](https://gamefaqs.gamespot.com/tg16/589030-military-madness/faqs/30552).
For CPU response to loaded Pelicans: [Anka's factory tactics](https://anka.sakura.ne.jp/nectaris/l5.html).
For original surrender controls: [TG-16 walkthrough](https://gamefaqs.gamespot.com/tg16/589030-military-madness/faqs/53871).
PCE/Windows in-game manuals are identified in [Anka's supplement](https://anka.sakura.ne.jp/nectaris/d1.html).

### Extra capabilities / altered player experience

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

Exact intermediate combat rounding; original opposing-roll correlation; ZOC
escape/terrain charging and buggy retreat boundaries; adjacent-factory transfer;
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
| ZOC | Stop on entry; at most one hex when starting inside enemy ZOC | Basic documented model retained. Exact boundary behavior remains a trace requirement below. |
| Rabbit / Lynx | Shared movement budget and one attack, with recent ZOC fix | Retained: Rabbit 8, Lynx 6; no refill after attacking. Lynx ground range exactly 2, air range 1. |
| Ordinary attacks | Move then attack; attack ends activation | Retained. Added engine rejection of friendly, hidden/carried and out-of-range targets. |
| Indirect attacks | Minimum range 2; no counter, support or surround | Matches documentation. Hadrian/Octopus/Atlas/Hawkeye move **or** fire; Lynx is the exception. |
| Counterattacks | Adjacent only, matching target domain; pre-battle strength | Retained. Casualties do not reduce the simultaneous return shot. |
| Support | Strength-weighted relevant base stats / twice initiator strength | Matches combat reconstruction, including the unusual defense denominator. |
| Terrain / surround / caps | Add terrain; halve defender after support and terrain; cap 100 | Matches reconstruction. Edge units cannot be surrounded; initiating while surrounded has no penalty. |
| Damage and temporary HP | Integer damage stages; `100 × strength + 50`, except strength 1 | Matches published high-level formula. Exact intermediate rounding order remains unverified. |
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

1. **Original CPU behavior is not reproduced.** `js/ai.js` is a new heuristic.
   It deploys at most one mobile reserve per factory per turn, skips stored
   Atlas/Trigger and has no deliberate transport loading/unloading strategy.
   Target selection, sequencing, deployment triggers and retreats therefore
   change campaign difficulty. Fixing this requires observed PCE decision
   traces, not merely making our AI stronger. The documented PCE Atlas
   deployment threshold is incomplete when infantry are involved.
2. **Exact arithmetic and randomness.** The published formula suppresses the
   original multiply/divide instruction order. Fraction-sensitive experience
   and support cases need execution traces. The 14 weights are supported by
   published experiments, but the original PRNG, seeding, table implementation
   and correlation between opposing rolls have not been recovered. Our seeded
   Mulberry32 and independent rolls are approximations. The forecast's joint
   probabilities inherit that independence assumption.
3. **ZOC edges and original bugs.** Verify escape from ZOC, terrain charging
   on the guaranteed one-hex move, friendly occupied ZOC hexes, and buggy
   retreat after killing/non-killing attacks. The documented PCE/Windows
   capture bug temporarily removes hostile ZOC from the factory hex; we do
   not emulate it because its duration and exact trigger are not established.
4. **Rare action ordering.** Confirm aircraft stopping on hostile factories,
   adjacent-factory deployment/transfer, whether unloading allows a subsequent
   carrier attack, inventory ordering, and elimination timing after capture,
   storage, simultaneous destruction and the final turn. Normal UI action
   limits are enforced, but not every internal engine mutation is a hardened
   standalone command API (for example caller-supplied cached movement ranges).
5. **Campaign completeness.** PCE has 16 normal plus 16 advanced missions.
   We have the 16 normal maps extracted from the official 1997 Windows port;
   direct PCE binary equivalence has not been demonstrated. The advanced
   campaign is missing. Existing redistribution authorization covers only the
   imported normal campaign; no additional original maps were imported here.

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

`node test/run-tests.js` exercises all 40 maps, combat, transport timing and
terrain, factory/base behavior, victory exceptions, save/resume and UI actions.
Final result: **44,190 checks, zero failures**, including all 40 self-play maps.
The local browser also restored an existing match and exposed Atlas factory
deployment destinations; the preview was cancelled without changing the match.
`test/fidelity-tests.js` adds independent published battle examples rather than
only comparing the forecast to our own resolver. Other updated tests remove
the previous assumptions that tanks fit in Mule, passengers unload immediately,
and bases behave like factories.

For the next fidelity pass, capture reproducible original PCE inputs and outputs
for the five gaps above. Record release/region, map, initial state, action order
and resulting state. Matching those fixtures will be stronger evidence than
additional self-play runs.
