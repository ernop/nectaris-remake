# Project guidance and decision index

Audited 2026-09-23. This is a map of the records, not a second specification.
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
military pixel art with small infantry, pale armor, upper-left light and domed
bases; Remake and Legacy have distinct provenance and implementation status.
Original map families and their route, symmetry, roster and inventory choices
are recorded in PRODUCT, separately from imported campaigns that must not be
retuned. These themes do not authorize extra features or unsourced rule changes.

## Status, pending work and ideas

| Item | Status and record |
| --- | --- |
| Remake stock unit roster | Implemented: 23 types, two native 32×32 facings. Map icons scale with zoom; panel/review icons remain native. [Unit record](art/units/README.md). |
| Mission library | Implemented shared layout for all collections. Whole-card hovers are superseded by small edge help controls; the compact content selection is recorded as an implementation choice. [Content and interactions](PRODUCT.md#mission-library-and-deliberate-help-controls-2026-09-23). |
| Legacy terrain and borders | Implemented: flattened geometry, connected relief, continuous mountain runs and a rounded board frame. The user requested better borders; the frame shape was an implementation choice, not an explicitly selected user preference. [Border requirements](PRODUCT.md#connected-terrain-and-board-borders-2026-09-23). |
| Remake production terrain/buildings and flattened geometry | Planned, still pending. The art review fixture is not production completion. Classic/neon retain their existing vector rendering and projection. [Art status](ART_DIRECTION.md#implementation-status-and-remaining-checks). |
| Fifteen numerical ground-unit concepts | Experimental proposals, not additions to the playable roster. Numerical coverage is not evidence of balance; artwork is a separate review pack. [Study, assumptions and playtesting needs](tools/design-space/README.md). |
| Exact original CPU, random stream and PCE boundary cases | Unverified research gaps, not established rules or a claim of full fidelity. [Remaining gaps](FIDELITY_AUDIT.md#remaining-gaps-in-priority-order). |
| Original battle presentation, soundtrack, Manual and Surrender | Excluded from the recorded fidelity implementation pass; do not silently turn them into scheduled work. [Scope](FIDELITY_AUDIT.md#requested-implementation-pass--2026-09-20). |
| Public deployment target | Not selected in the records. The repository and local endpoint exist; neither establishes a hosted production site. [Working notes](agents.md). |

## Evidence and history

| Record | How to use it |
| --- | --- |
| [FIDELITY_AUDIT.md](FIDELITY_AUDIT.md) | Dated comparison, remaining differences and scope; current adopted rules live in MECHANICS and controls in PRODUCT. |
| [MANUAL_AUDIT.md](MANUAL_AUDIT.md) | Page-by-page source review and coverage at the time of the audit, with subsequent corrections. |
| [ORIGINAL_EXECUTABLE_NOTES.md](ORIGINAL_EXECUTABLE_NOTES.md) | Windows executable observations and explicit limits on extrapolating them to PCE. |
| [ART_RESEARCH.md](ART_RESEARCH.md) | Historical measurements and alternatives, superseded by ART_DIRECTION where decisions were made. |
| [art/pilot/README.md](art/pilot/README.md) | Native-size art review fixture and its validation, not the production map display policy. |
| [inspiration/nectaris-original/README.md](inspiration/nectaris-original/README.md) | Local reference manifest; captures are gitignored and not runtime/distributable assets. |
| [PERFORMANCE.md](PERFORMANCE.md) | Dated measurements and reproduction methods; recorded counts/timings describe their tested snapshots. |

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
