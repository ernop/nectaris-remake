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
