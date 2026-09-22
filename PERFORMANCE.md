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
