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
