# Numerical ground-unit study

Open [the standalone gallery](../unit-design-space.html), or visit
<http://nectaris.localhost/tools/unit-design-space.html> while the normal project
server is running. It works directly from disk, with no external dependencies.

The gallery proposes 15 units; it does not modify the playable roster or maps.
`custom-units.json` contains the custom-definition object accepted by the editor.
The download button also includes the original indexed artwork and analysis.
The game currently draws custom definitions with their class's stock fallback;
the new artwork is a separate review pack, not automatically registered in the
production renderer. All proposals can use Pelican; none is in Mule's whitelist.

## Reproduce

```sh
node tools/design-space/analyze.js
node tools/design-space/build.js
node tools/design-space/verify.js
```

- `analyze.js`: a deterministic 240,000-draw, mixed-feature maximin search against
  all stock definitions whose movement type is not air (19, including Mule and
  Trigger, excluding Pelican). Names and class labels are not search features.
- `analysis.json`: the stock snapshot, exact occupancy counts, candidate counts,
  selected configurations, nearest neighbors, feature differences, sequential
  distances, sample coverage and first-choice weight sensitivity.
- `concepts.js`: names, roles, tactical interpretation and art briefs assigned
  after selection. No numerical stats are retuned by this layer.
- `icons.js`: original 32×32 indexed pixel constructions using the existing
  project's `Surface` primitive and palette. Both facings retain upper-left
  lighting, native infantry proportions and centered visible bounds. These are
  newly authored pixels, not extractions or traces of the legacy chart.
- `unit-art.json`: 30 indexed directional frames with Union, Xenon, attack and
  neutral palettes. Spent greyscale is derived by the existing colorizer.
- `unit-sheet.png`: native Union/Xenon contact sheet.
- `page.html`, `page.css`, `page.js`: readable source of the generated, fully
  self-contained `../unit-design-space.html` (120 embedded PNG variants).

## Interpretation

The model compares firepower (25%), armor (15%), actual firing bands (20%),
terrain reach/access (20%) and turn/mission rules (20%). Rule distance covers
capture, effective turn policy, passenger permissions and transport placement.
Constant shared rules add no distance. The gallery gives the exact formulas,
candidate bounds, explicit stacking budget and conservative dominance screen.

Candidates are sampled on a declared coarse grid, constrained for legibility
and power stacking, then selected by greatest nearest-neighbor distance. After
each selection, that proposal becomes occupied space. Obvious same-policy
upgrades/downgrades of stock units or earlier selections are rejected. Marginal
charts display empty bins as well as occupied ones; they are not the ranking.

The initial sample has 25,858 distinct admissible configurations with this
source snapshot. The 15 proposals lower its mean nearest-unit distance from
22.27 to 16.85 (24.34%). This describes sample coverage, not win rate or balance.
Ranges include their adjacent blind spots; mobility includes six terrain types
and passability. It does not infer actual usage frequency from campaign maps
or simulate player decisions, unit synergy, deployment bottlenecks or combat
outcomes. The lightweight power screen is a design assumption, not a fitted
balance model. The maximin procedure tends to select unusual boundary cases.

Increasing each feature block's weight by 50% leaves the first choice a fixed,
exact-two dual-domain weapon in four of five runs; emphasizing rules selects a
fragile capturing dual-domain launcher instead. This is a first-choice
sensitivity check, not proof that all 15 selections are stable.

Several results need deliberate playtesting: the weak Midge may not justify a
scenario slot; one-point wheeled Badger is mostly road-bound; Hydra has very
high dual-domain firepower; and the 80-defense designs can reach the defense
cap with terrain. Those weaknesses are retained and explained instead of
silently replacing numerical results with conventional equipment designs.

Source of truth: `js/data-units.js`, `js/data-terrain.js`, `js/engine.js`,
`js/combat.js` and `MECHANICS.md`. The experiment extends this repository's
1989 PCE rules model with US-style names; it does not assert historical units.
