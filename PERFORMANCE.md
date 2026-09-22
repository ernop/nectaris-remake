# Performance analysis — 2026-09-22

Measured the existing algorithms before changing them, using a saved source
snapshot and identical map inputs for both versions. The Node CPU profile put
most sampled time in movement searches and their repeated AI callers. Browser
inspection also found that each hover redraw repainted terrain outside the view.

## Measurements

Node v22.22.1, one warm-up and median of five runs on the same machine. All 60
current maps were used in both runs; timing includes benchmark bookkeeping.

| Workload | Before | After | Speedup |
|---|---:|---:|---:|
| Four AI half-turns on every map | 1,920.825 ms | 388.926 ms | 4.9× |
| Movement ranges for all initial field units on every map | 375.167 ms | 108.011 ms | 3.5× |
| 64 different strength matchups, 100,000 forecast seeds each | 155.594 ms | 0.895 ms | 174× |

The first forecast still initializes the seed histogram: 9.33 ms measured,
versus 9.97 ms before. Later matchups reuse that histogram, not prior battle
results. Exact checksums matched for all three workloads, including normalized
AI snapshots/logs/RNG state, movement records and joint forecast bins.

Browser canvas benchmark: synthetic 65×49 mixed-terrain map, 960×640 viewport,
zoom 1, median of seven draws. Timings include pixel readback; these are render
workload measurements, not whole-application frame-rate claims.

| Style | Full-map repaint | Visible terrain rebuild | Cached hover redraw |
|---|---:|---:|---:|
| Remake | 35.6 ms | 13.9 ms | 1.9 ms |
| Legacy | 148.5 ms | 74.2 ms | 2.0 ms |
| Classic | 34.3 ms | 13.7 ms | 1.7 ms |
| Neon | 35.2 ms | 13.8 ms | 1.9 ms |

## Algorithm changes

- **Movement:** a stable binary min-heap replaces linear minimum extraction.
  A search-local occupancy index and memoized ZOC replace repeated scans of all
  units. For `R` reachable hexes and `U` units, the bounded-degree search moves
  from an `O(R² + RU)` upper bound to `O(U + R log R)`. Obsolete queue entries
  are skipped; FIFO cost ties preserve predecessor paths and AI tie-breaking.
  The index is rebuilt each search so hypothetical AI moves, loads, deployments
  and undo cannot leave stale occupancy data.
- **AI:** each activation reuses its movement range for attack planning.
  Movement execution now performs a fresh destination-limited search to validate
  that plan against the current board (see the ZOC correction below).
  Boarding skips searches when no eligible carrier exists, and shares the
  passenger's range across candidate carriers. Walking-distance planning uses
  the same heap instead of sorting its entire frontier at each step. Choosing
  the best of `P` attacks takes `O(P)` time and constant retained plan space,
  replacing a list and `O(P log P)` sort; equal scores still choose the first.
- **Combat:** expected casualties evaluate 14 weighted coefficients instead
  of 100 repeated buckets. Forecasts count the same independently seeded roll
  pairs once per sample count, then aggregate their 14×14 possibilities for
  each matchup. After `O(S)` initialization, each forecast takes `O(14²)` work
  instead of `O(S)` for `S` samples. Finite-sample noise, simultaneous damage,
  counterattack eligibility and match RNG isolation are preserved exactly.
  At most two 196-entry count tables are retained.
- **Rendering:** terrain and road loops visit viewport bounds with padding.
  A canvas caches the visible terrain; hover, selection and unit movement
  redraw only the dynamic content. The cache signature includes camera,
  dimensions, style, art set, visible terrain plus a neighbor ring, building
  ownership and reserve counts. This also detects editor changes and restored
  games without mutation hooks. Memory scales with viewport pixels, not map
  area. A software-backed terrain layer keeps rasterization consistent.

## Validation and reproduction

```sh
node test/run-tests.js
node test/performance-tests.js
node tools/benchmark-performance.js
```

To compare an older source snapshot with identical maps:

```sh
NECTARIS_BENCH_ROOT=/path/to/source-snapshot node tools/benchmark-performance.js
```

Open [the rendering benchmark](http://nectaris.localhost/tools/benchmark-render.html)
after starting the documented local server and select **Run benchmark**.
It compares full-map, viewport and cached images, then verifies cache refreshes
after captures, reserve changes, terrain edits, unit movement, resizing and map
replacement. The final browser run passed all 68 pixel comparisons across four
styles, three zoom levels and three camera positions.

The full suite passed **65,458 checks with zero failures**, including self-play
on every included map. Added differential tests compare 1,840 randomized
movement searches with the original search, including record order and path
ties; queue tests cover fractional costs and reuse; forecast tests compare
sample-cache replacement against actual seeded combat resolution.

Remaining costs: camera changes rebuild visible terrain (Legacy is still the
most expensive), while hover benefits from the cache. Large custom games can
still spend time in combat's linear unit lookups. Watch-AI mode retains its
intentional animation delays; this work changes computation, not pacing.

## ZOC correction and execution validation — 2026-09-22

The original Windows movement routines disproved the previous blanket one-hex
limit when starting in ZOC. Leaving ZOC now uses normal terrain costs and the
remaining allowance. This changes AI decisions and therefore match checksums.
`ORIGINAL_EXECUTABLE_NOTES.md` records the independent executable evidence.

Execution also recalculates legality even when given a cached preview. Its
Dijkstra search stops when the requested destination's cheapest path is settled;
preview searches still produce the entire range. Recorded original endpoints
check that both searches return identical costs and paths. No persistent cache
or mutation-version bookkeeping is needed for editor and hypothetical moves.

Node v22.22.1, median of five warmed runs, using the same saved set of 60 maps
for every variant (a separate map addition occurred during this work):

| Four AI half-turns on each map | Median |
|---|---:|
| Before the rule correction and validation | 387.071 ms |
| Corrected ZOC rules, still trusting cached ranges | 413.292 ms |
| Corrected rules with complete execution searches | 560.914 ms |
| Final: corrected rules with destination-limited execution searches | 519.172 ms |

The two execution-validation variants and corrected-rules-only version produce
the same normalized game/log/RNG checksum. Validation adds about 106 ms over
240 AI half-turns in this workload; this is a correctness cost, not a speedup.
Final initial-range searches take 107.333 ms and forecasts 0.862 ms, with their
checksums unchanged from the pre-correction benchmark. Those initial maps have
no affected starting-ZOC movement; the 59 executable fixtures exercise it.

## Interaction investigation — 2026-09-22

The stationary-hover benchmark missed the remaining severe lag: each camera
change still rebuilt the terrain with hundreds of Canvas `fillRect` calls per
Legacy tile. On the large fjord maps, full neighbor-name cache keys also
exceeded the 1,024-tile limit and cleared the entire tile cache repeatedly.

The second pass makes these changes:

- Terrain cache keys encode only visible connections, texture variant,
  mountain board-edge masks and relevant building ownership. The limit stays
  at 1,024 tiles, with least-recently-used eviction instead of wholesale clears.
  Including decorative border tiles, Twisted Fjords needs 709 distinct tiles
  and Shattered Fjords 922; both complete a second full scan with zero misses.
- Camera redraws write the visible Legacy terrain into one reusable RGBA
  buffer, then upload it to Canvas once. Source-column lookup tables preserve
  the original rounded pixel boundaries at every zoom. Transparent source
  pixels preserve prior tiles. Factory labels still use Canvas's font
  rasterization in the original drawing order, synchronizing only their small
  bounding rectangles. The viewport cache still handles stationary redraws.
- Buffer memory scales with viewport area, not map area: four bytes per
  viewport pixel plus a source-column lookup. Cached source color arrays add
  at most 6 MiB across 1,024 tiles. Resizing replaces the viewport buffer.
  Remake, Classic and Neon drawing paths are unchanged.

Matched browser CPU measurements on Twisted Fjords, Legacy art, 1,200×712
viewport, 24 events per phase. Both paths use the corrected tile cache and
identical production UI handlers. The harness renders synchronously to avoid
background-iframe animation-frame throttling; these are CPU redraw times,
not measured end-to-end FPS.

| Interaction | Rectangle runs, median / p95 | Shared buffer, median / p95 |
|---|---:|---:|
| Continuous pan at zoom 1 | 61.4 / 65.9 ms | 6.7 / 8.5 ms |
| Wheel zoom | 82.9 / 98.8 ms | 9.3 / 12.4 ms |
| Stationary fit-view hover | 1.2 / 2.0 ms | 1.2 / 1.6 ms |
| Select and cancel | 0.6 / 0.9 ms | 0.6 / 0.7 ms |

The synthetic 960×640 Legacy viewport rebuild also fell from the original
74.2 ms to 6.4 ms, including full pixel readback. Cached redraws remain 1.8 ms.

Validation: all 770 individual browser raster comparisons and all 68 full-scene
comparisons passed, including fractional zoom, negative/offscreen positions,
mountain borders, factory text, captures, inventories, map edits and resizing.
Node tests add 1,600 independently generated terrain comparisons, hot-cache
survival under eviction pressure and 200 layered raster scenes against the
original rectangle algorithm. The isolated commit's full suite passed 65,494
checks, zero failures; the active workspace suite also passed with concurrent
rule/UI changes included (66,729 checks).

Run `node test/terrain-performance-tests.js` for the focused regression tests.
Open [the interaction benchmark](http://nectaris.localhost/tools/benchmark-interaction.html)
and use **Run interactions** to compare **Original rectangle runs** with
**Shared pixel buffer** on the same map. **Compare tile rasterization** runs the
770 fractional-position/scale checks. The harness creates an isolated match
without writing profile saves. Run browser benchmarks sequentially so another
benchmark's synchronous work cannot inflate the interaction timings.

## Spent-unit stalls and complete latency audit — 2026-09-22

The third pass reproduced a much larger stall than the earlier terrain tests:
160 visible units, half spent, took **412 ms per Legacy redraw** (455.5 ms p95).
Each sprite issued hundreds of rectangle draws under Canvas's grayscale filter.
The same fixture now takes **1.1 ms** (1.3 ms p95), without changing its pixels.
The previous selection benchmark also missed the terrain rebuild caused by
opening and closing the action rail.

Changes in this pass:

- Rasterize each native unit sprite once per art set, faction, facing, rounded
  scale and spent state. Apply grayscale once to the completed bitmap. An LRU
  cache holds at most 512 surfaces / 8 MiB, and offscreen units are culled.
  Unsupported drawing transforms and contexts retain the original path.
- Reuse terrain across integer camera translations and action-rail resizes.
  After scrolling, a 128-pixel margin absorbs subsequent small pans; complete
  map coverage on an axis also permits scrolling into the empty background.
  Zoom changes avoid that extra margin. Terrain/building signatures continue
  detecting edits, captures, inventory changes and restored games.
- Share Legacy hill, road, valley and mountain geometry across texture variants
  and connection masks. Mountain overlays skip obscured ground calculations;
  rectangle runs are generated lazily because the RGBA renderer needs pixels.
  Geometry work is amortized across tiles without changing the generated art.
- Fast AI starts without the old fixed 300 ms wait and yields between actions
  after an 8 ms computation budget. An individual action can exceed that
  budget. Decisions, logs and RNG outcomes are unchanged; watched playback
  retains its deliberate animation pacing.

The interaction audit uses a fresh script context per map/art pair and a fixed
1,280×800 iframe. Both versions receive the same maps and 24 events per phase.
Measurements include production UI handlers and synchronous redraws, avoiding
background iframe scheduling. They measure CPU latency, **not FPS or cold
network loading**. Browser runs were sequential. The saved pre-change source
includes the current rule and UI work, so these comparisons isolate this pass.

All values below are milliseconds. Arrows show before → after medians, except
the first-draw column, which is one cold draw per fresh context. Zoom remains a
terrain rebuild and is shown explicitly rather than hidden by cached results.

| Map / art | First draw | Fit-view pan | Select/cancel | Final wheel zoom |
|---|---:|---:|---:|---:|
| Twisted / Legacy | 170.1 → 76.4 | 11.6 → 1.1 | 9.2 → 1.3 | 11.4 |
| Shattered / Legacy | 183.5 → 79.3 | 11.6 → 0.8 | 9.0 → 1.1 | 9.9 |
| Fractured / Legacy | 153.4 → 65.6 | 7.9 → 0.6 | 9.4 → 0.8 | 6.6 |
| Honeycomb / Legacy | 102.5 → 61.4 | 7.4 → 0.3 | 8.6 → 1.1 | 3.5 |
| Arsenal / Legacy | 106.9 → 49.7 | 5.2 → 0.3 | 9.4 → 1.1 | 3.9 |
| Needle / Legacy | 105.6 → 53.9 | 6.2 → 0.4 | 8.7 → 1.0 | 4.9 |
| Labyrinth / Legacy | 106.9 → 52.5 | 5.5 → 0.4 | 9.2 → 1.1 | 4.7 |
| Mirror / Legacy | 126.2 → 57.3 | 5.2 → 0.4 | 9.1 → 1.0 | 4.3 |
| Laced / Legacy | 139.2 → 65.9 | 6.0 → 0.4 | 10.8 → 1.2 | 4.2 |
| Turning / Legacy | 140.7 → 62.2 | 5.6 → 0.4 | 9.1 → 1.0 | 3.9 |
| Twisted / Remake | 99.2 → 112.4 | 87.7 → 0.9 | 14.9 → 1.2 | 25.9 |
| Shattered / Remake | 106.8 → 108.3 | 89.7 → 0.8 | 14.8 → 1.2 | 27.8 |
| Fractured / Remake | 63.9 → 69.8 | 47.3 → 0.7 | 15.9 → 0.8 | 28.3 |
| Honeycomb / Remake | 35.2 → 35.9 | 24.6 → 0.3 | 12.3 → 1.2 | 20.2 |
| Arsenal / Remake | 35.8 → 35.6 | 25.2 → 0.4 | 13.0 → 1.0 | 19.4 |
| Needle / Remake | 46.0 → 47.2 | 36.3 → 0.4 | 13.8 → 1.2 | 23.4 |
| Labyrinth / Remake | 38.2 → 44.7 | 30.1 → 0.4 | 14.1 → 0.8 | 23.1 |
| Mirror / Remake | 41.3 → 40.3 | 30.0 → 0.5 | 14.8 → 1.3 | 23.1 |
| Laced / Remake | 36.4 → 40.2 | 27.4 → 0.5 | 14.0 → 1.0 | 20.2 |
| Turning / Remake | 41.1 → 40.7 | 28.8 → 0.4 | 14.1 → 1.0 | 26.5 |

Native-scale panning has a 0.2–0.7 ms final median, but exhausting the margin
still rebuilds terrain: Twisted Legacy reached 18.7 ms maximum and Twisted
Remake 35.4 ms. Remake zoom remains 19.4–28.3 ms median, reaching 43.2 ms on
Shattered; its first draw remains 35.6–112.4 ms. Those vector terrain rebuilds
are the largest remaining interaction cost. This pass does not claim a zoom
speedup: Twisted Remake was 26.8 ms before and is 25.9 ms after, while Shattered
was 25.0 ms and is 27.8 ms. Rebuilds can now cover more pixels to enable reuse.

Stationary unit/factory hover is 0–0.1 ms median; the initial recenter can still
cost 5–38 ms. Remaining-action queries take 0.2–0.5 ms median and snapshot JSON
serialization 0.3–0.7 ms. Game construction takes 0.2–0.5 ms and UI construction
1.0–2.1 ms. Fresh script-context loading is usually 12–19 ms, with two outliers
of 41.9 and 47.5 ms. None includes a cold network connection or storage write.

The separate 160-unit stress fixture prewarms terrain and keeps every unit
visible:

| Art / unit state | Before median / p95 | After median / p95 |
|---|---:|---:|
| Legacy / all active | 6.0 / 7.6 ms | 1.2 / 2.0 ms |
| Legacy / half spent | 412.0 / 455.5 ms | 1.1 / 1.3 ms |
| Remake / all active | 2.7 / 3.8 ms | 1.0 / 1.8 ms |
| Remake / half spent | 20.0 / 225.2 ms | 1.0 / 1.2 ms |

Validation: 1,932 browser sprite comparisons are pixel-identical, covering all
23 units, both packs and factions, seven scales and three action states.
The terrain benchmark passes 88 scene checks, including fractional and long
pans, action-rail resizing, mutations and restores. Legacy comparisons remain
pixel-exact. Canvas vector edge antialiasing can differ with the larger raster
surface and translation: the maximum observed mean absolute channel error is
0.0123 out of 255. The test permits at most 32 for any channel and 0.025 mean;
94 individual comparisons were completely exact. A captured pre-optimization
SHA-256 over 5,120 terrain/mask/variant/owner samples guards the geometry changes.
Fast-AI tests compare complete match, log and RNG states and cover destruction
and switching back to watched playback.

The repeated Node workload covers all 66 maps (one warm-up, median of five
runs, Node v22.22.1). Final measurements were taken with the browser audit
finished. AI planning and movement were not changed in this pass; these numbers
show that their computation is separate from the rendering stalls. All three
before/after workload checksums match exactly.

| Node workload | Before | Final |
|---|---:|---:|
| Four AI half-turns on every map | 556.568 ms | 554.625 ms |
| Initial movement ranges on every map | 107.397 ms | 101.997 ms |
| 64 forecasts, 100,000 seeds each | 1.763 ms | 0.869 ms |
| First forecast initialization | 9.283 ms | 8.445 ms |

Reproduce with `node tools/benchmark-performance.js` and
`node test/performance-tests.js`, then run these browser tools sequentially:

- [Full latency audit](http://nectaris.localhost/tools/benchmark-latency.html)
  runs all ten fjord maps with both art packs. Add `?map=Twisted%20Fjords&stress=1` for
  the focused stress fixture. A `root` query parameter can point to a saved
  source tree served from the same origin for matched historical comparisons.
- [Sprite equivalence](http://nectaris.localhost/tools/benchmark-unit-raster.html)
  compares original rectangle draws with cached bitmaps.
- [Terrain validation](http://nectaris.localhost/tools/benchmark-render.html)
  checks viewport reuse against full drawing and reports rebuild timings.
