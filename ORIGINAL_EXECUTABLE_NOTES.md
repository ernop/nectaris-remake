# Original executable evidence — 2026-09-20

These are functional observations from Hudson's 1997-11-05 Windows freeware
`Nec.exe`, SHA-256
`d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92`.
The executable is not distributed with this project. Reproduce inspection with
`objdump -d -Mintel path/to/Nec.exe`. Addresses below are virtual addresses,
not file offsets. This is **Windows evidence**, not a PCE execution trace.

## Campaign selection

- `0x405b24`: dimensions use the stage number at `0x495c52`.
- `0x423c4a`: terrain uses the same stage number and pointer table `0x47f750`.
- `0x40a4c0`: unit-pointer index is stage + 16 × campaign (`0x495c6a`),
  indexing the 32-entry pointer table at `0x46b988`.
- `0x42a9c8`: 32 names at eight-byte intervals, six letters each.
- Factory coordinates at `0x47f7d0` use the stage number, with 16-byte records.

This establishes the advanced campaign's shared terrain and separate rosters.
`tools/extract-original-campaign.js --advanced` implements that selection.

## ZOC and movement — 2026-09-22

Executed isolated routines from the identified binary with Unicorn, using
synthetic board/unit inputs. Only the two rule routines and their internal
helpers are permitted by the execution guard; no Windows APIs, rendering,
random generator or process entry point run.

- `0x423a80` clears and rebuilds the terrain array's ZOC bits from field-unit
  positions. Stored, carried and absent units are skipped. No chassis or
  already-acted filter excludes mines, aircraft, transports or spent units.
  `0x423bf0` clips writes to the board. The original also flags occupied
  unit hexes; comparisons exclude enemy-occupied endpoints, which occupancy
  already makes inaccessible.
- `0x4015d0` clears the movement mask and calls `0x4015f0`. The latter selects
  the unit's normal allowance, or an explicit remaining allowance, and enters
  the recursive search at `0x401680` with an origin flag of `0x80`.
- `0x401703` distinguishes the origin from destination hexes. Subsequent
  hexes pay ordinary terrain costs at `0x40171c–0x401749`; there is no blanket
  one-point terrain discount for starting beside an enemy.
- `0x4017e0–0x401810` exempts the origin from a ZOC stop. Each subsequent
  hostile-ZOC entry ends a one-phase search. Therefore a unit can leave ZOC
  and move normally through uncontrolled hexes; being adjacent to an enemy
  at the start does **not** impose a one-hex maximum.
- Human Shift setup at `0x401f2a–0x401f4c` selects the full or remaining
  allowance and requests one phase. The fixtures use the same settings,
  with only the optional drawing flag disabled.
- ZOC rebuilding is called after movement (`0x4022cb`, `0x40233e`) and battle
  resolution (`0x4210f5`), among other mutation paths. It is not turn-start-only.

`tools/trace-original-zoc.py` checks the executable SHA-256, maps it into an
isolated x86 emulator, and records 59 cases in `test/fixtures/windows-zoc.json`.
Each includes inputs, reachable empty endpoints/origin with exact costs, and
the enemy ZOC on non-enemy-occupied cells. Coverage includes all 23 stock types,
both sides and column parities, hill/waste/mountain costs, direct ZOC entry,
encirclement, overlapping zones, friendly occupancy, spent mines, and Rabbit/
Lynx ranges with explicitly supplied remaining movement. The latter validates
retreat range calculation, not every preceding battle/activation transition.
No original executable, machine code, maps or artwork are distributed here.

Reproduce in a temporary Python environment with `pefile` and `unicorn`:

```sh
python tools/trace-original-zoc.py /path/to/Nec.exe > /tmp/windows-zoc.json
cmp /tmp/windows-zoc.json test/fixtures/windows-zoc.json
node test/zoc-tests.js
```

Before the correction, 50/59 original cases disagreed. The full targeted suite
had 62 failures out of 77 checks, also exposing stale-range execution and off-map
ZOC queries. After correction all 77 pass. The heap search is additionally checked
against a separate linear search with the corrected rule. That algorithmic
comparison alone is not evidence of original fidelity; the executable fixtures
provide the independent reference.

This supports the manual's stop-on-entry wording and supersedes our previous
one-hex-start assumption. It remains **Windows evidence**, not proof that every
PCE boundary behaves identically. The factory-capture ZOC bug is still omitted;
its precise lifetime and direct PCE behavior require separate traces.

## Damage floors — existing implementation confirmed

`0x41bb32–0x41bb51` calculates attack × (100 − defense), integer-divides by
100, multiplies the integer result by the experience percentage, then
integer-divides by 100 again. `0x41bbd0–0x41bbff` multiplies by squad strength.
`0x420cf6–0x420d20` applies the random multiplier in tenths and divides by ten.
Temporary HP and survivor calculation follow at `0x420d26–0x420daa`.

For the official stat/strength ranges, these stages agree with our current
`damageResult`. No new floor-order change is justified by this executable.
This does not validate every support, counter or custom-stat boundary case.

## Randomness — located, but not transplanted as an alleged exact stream

The byte generator is at `0x40cb50`. Ignoring its fixed-return override, with
low byte L, high byte H, and third byte E, its state transition is:

```
feedback = ((H >> 6) XOR L) AND 1
word = (((H XOR L) << 8) OR (L XOR E))
word = ((word << 1) OR feedback) AND 65535
H = word >> 8
L = word AND 255
return H XOR L
```

`0x40c770` converts this byte to a percentile using floor(byte × 100 / 256).
`0x421170` maps percentile p to a multiplier in tenths:

- 20–24 → 15; 60–64 → 20; 80–82 → 2; 98–99 → 40.
- Otherwise floor((150 − p) / 10).

Treating the 100 percentile positions equally reproduces Anka's documented
14 weighted outcomes. The byte-to-percentile conversion itself is slightly
uneven, so those integer percentages are a nominal table, not proof of the
executable's complete empirical distribution.

Battle code at `0x420cf6` and `0x420d0e` makes two successive draws, with no
frame update between them. The generator also has many presentation callers;
`0x41310a` increments its low byte during the main update loop. `0x40cbd0`
advances it a variable number of times. Therefore a standalone seeded port
would not reproduce the original stream or prove independent opposing rolls.
PCE equivalence has not been established. Runtime randomness remains unchanged
pending a verified complete model; save/replay determinism remains intact.

## Atlas deployment

The deployment routine tests Atlas at `0x41606c`. Starting at `0x41608a`, it
skips the first six surrounding cells then scans 120 further cells: rings
2–6 (12 + 18 + 24 + 30 + 36). It counts enemies without a ground-only filter
and compares the count with four at `0x4160fb`, corroborating Anka d6.

The additional branch at `0x416104` depends on state byte `0x482028` and a
base-distance comparison with nine. That byte has several writers and its
complete meaning has not been established here. It is not enough evidence to
invent an infantry deployment rule or to declare PCE CPU equivalence.
