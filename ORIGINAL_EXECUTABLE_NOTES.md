# Original executable evidence — 2026-09-20

These are functional observations from Hudson's 1997-11-05 Windows freeware
`Nec.exe`, SHA-256
`d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92`.
The executable is not distributed with this project. Reproduce inspection with
`objdump -d -Mintel path/to/Nec.exe`. Addresses below are virtual addresses,
not file offsets. This is **Windows evidence**, not a PCE execution trace.

## Obtaining the executable

Hudson distributed the game as freeware. Its archived installer is
`https://web.archive.org/web/20030102120236id_/http://www.hudson.co.jp/gamenavi/gamedb/slg/data/winnec.exe`
(SHA-256 `bcd43e7dee31ccefac62d766f2b497245cebe0fed32ec5db2a004c4f12925a8c`).
It is an LHa self-extractor. Read `data.z` from the embedded archive with Python
`lhafile`, then extract `Nec.exe` with
[isextract](https://github.com/OmniBlade/isextract) (`isextract x data.z out/`).
Keep the installer, archive and executable outside the repository.

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

## Factory endpoints — 2026-09-29

Static reading of the same executable. Terrain codes 8 and 10 are the Union and
Xenon prison camps; 11, 12 and 13 are Union, neutral and Xenon factories
(`tools/extract-original-campaign.js`).

- The range search (`0x401680`) charges every chassis 1 for camps and factories
  (cost table `0x42b248`) and never tests ownership, so any unit may pass
  through any factory.
- The Shift confirmation state `0x401f90` checks the chosen hex at
  `0x401ff4–0x40202b`. A factory other than the mover's own is refused unless
  the unit's ability byte (`0x42b288`) has bit `0x80` without `0x10`. Only
  Charlie, Kilroy and Panther qualify; Falcon `0x52`, Eagle `0x51`, Hunter
  `0x53` and Pelican `0x61` do not. The refusal is message 4, string 99
  "味方の工場ではありません" ("not a friendly factory"; string table `0x435f28`).
  `0x495c04`, set from the side to move at `0x405c20`, holds that side's own
  factory code (11 or 13). Camps are not tested, so any unit may stand on one.
- After the move (`0x402230`), infantry capture a neutral or enemy factory
  (`0x4023df–0x402488`). Any unit ending on its own factory is stored
  (`0x402505` → `0x4025f0`, string 235 "工場に格納しました") and control returns
  to the map, not to the attack state.
- The built-in manual gives the same rule with no aircraft exception:
  "工場・・・敵、または中立の工場ヘックスで、移動を終えることはできません。"
  (`0x4342c8`); a unit ending on its own factory is stored automatically
  (`0x434318`).

Aircraft therefore cannot park on, block or attack from a neutral or enemy
factory in this release. [BASE NECTARIS's terrain page](http://www.max.hi-ho.ne.jp/summoner/nectaris/tactics/chikei/index.htm)
states the same general rule for the PCE game. Anka l5's reservation diagram
draws a Falco over neutral factory B; against this code that placement can only
be schematic. The CPU's own destination code was not traced.

The remake matches this since 2026-09-29 (user request). Until then
`canStopAtBuilding` (`js/engine.js`) and `can_stop_at_building`
(`sim/src/game.rs`) let aircraft stop on any building, an exemption carried
over on 2026-09-20 ("Aircraft retain their existing movement behavior") without
a source. Both now refuse aircraft and loaded Pelicans on neutral and enemy
factories, as endpoints and as deployment exits; `test/building-rules-tests.js`
covers the range, the refused move and deployment.

The same handler gates field boarding (`0x402050–0x4020c9`). A Mule passenger
needs ability bits `0x81`: Charlie and Kilroy (`0x81`) and Atlas (`0x99`)
qualify; Panther (`0x80`) is refused with string 105 "このユニットは搭載できません".
This conflicts with the 2026-09-26 statement in `MECHANICS.md` and
`FIDELITY_AUDIT.md` that this executable lets a Panther board anywhere. The
factory-deployment and CPU boarding paths were not traced.

```sh
objdump -d -Mintel --start-address=0x401f90 --stop-address=0x4025c3 Nec.exe
```

## Damage floors — existing implementation confirmed

`0x41bb32–0x41bb51` calculates attack × (100 − defense), integer-divides by
100, multiplies the integer result by the experience percentage, then
integer-divides by 100 again. `0x41bbd0–0x41bbff` multiplies by squad strength.
`0x420cf6–0x420d20` applies the random multiplier in tenths and divides by ten.
Temporary HP and survivor calculation follow at `0x420d26–0x420daa`.

For the official stat/strength ranges, these stages agree with our current
`damageResult`. No new floor-order change is justified by this executable.
Support, counter and surround cases are covered in the next section.

## Battle effects, casualties and cargo — 2026-09-26

`0x41b810(attacker, defender, indirect)` prepares every battle. Arguments are
unit-table indices; `0x495c63` is the side to move.

- Direct fire only: attack support scans the defender's six neighbours for the
  moving side's field units other than the attacker. Defense support scans the
  attacker's neighbours for the other side's units other than the defender.
  Carried units (status bit `0x40`) and stored units are skipped; their carriers
  are not.
- Each supporter adds its attack against the defender's domain (`0x41bc10`, no
  range check) or its defense (`0x41bc50`), times its strength. Each sum is
  divided by twice the attacker's strength. Supporting directions are recorded
  in `0x481e54`/`0x481e56`, including supporters worth 0.
- Surround reads the moving side's ZOC bit on all six defender neighbours
  (`0x41bd40`, which reports no bit off the map). `0x423a80` sets bit `0x40` for
  the moving side and `0x80` for the other on each field unit's hex and its
  neighbours. All six set means surrounded (`0x481e4a` = `0x3f`).
- The attacker's own attack is 0 unless its range against the defender's
  domain is 1. The counter uses the defender's base attack only when its range
  against the attacker's domain is 1.
- Attacker attack = base + support; attacker defense = base + terrain. Defender
  attack = base, halved if surrounded; defender defense = base + support +
  terrain, halved if surrounded. Both are capped at 100, then `0x41bb32` applies.

`0x420cd0` scales both totals by a roll in tenths and computes survivors.
`0x420e20` writes strengths back and calls `0x420ff0` for each combatant. If a
carrier (status bit `0x20`) lost machines, its cargo (status `0x40 | carrier`)
drops to the carrier's new strength when larger. A carrier at 0 erases its
cargo's records. The returned losses feed the per-turn loss tallies
(`0x495bd0`/`0x495c10`) behind the end-of-map results graph.

Experience lives in the strength byte `0x4957e0`: strength − 1 in bits 0–2,
points in bits 3–7. `0x40a460` adds points up to 31. `0x415850` awards the
attacker 4 points for damage and 8 for a kill, and a surviving defender 8 when
unhurt and 4 when hurt. Capture awards 16 (`0x402472`). Damage uses points ÷ 4
against the eight-entry table `0x42b158`; the display draws (points + 1) ÷ 4
stars.

A loaded transport cannot attack. State `0x4209e0` tests the selected unit's
carrying bit (`0x420a3e`) and shows "搭載中は攻撃できません" (`0x435c60`). The
Mule's description at `0x433920` says it "cannot attack while transporting".
Counterattacks do not check the bit.

`tools/trace-original-combat.py` runs only these routines (ZOC rebuild,
effects, roll scaling and survivors with supplied rolls, strength write-back,
carrier losses) under an address guard. It records 40 cases in
`test/fixtures/windows-combat.json`. Cases include:
- Every support geometry, including the English guides' disputed layouts and
  both Base Nectaris Seeker/Hunter figures.
- Loaded transports, mines, artillery and aircraft as supporters.
- Two-unit, edge-blocked and ally-occupied rings.
- Caps, indirect fire, Lynx counters, experience and single-machine squads.
- The cargo clamp and cascade.

Our engine matches every case, through survivors and cargo. Mutating the
defense-support geometry breaks 20 cases; requiring occupied rings breaks 8.

```sh
python tools/trace-original-combat.py /path/to/Nec.exe > /tmp/windows-combat.json
cmp /tmp/windows-combat.json test/fixtures/windows-combat.json
node test/combat-original-tests.js
```

### How the original presents the effects

Before the battle animation, the state chain `0x419060–0x4194d0` plays a timed
sequence. Indirect fire skips steps 2 and 3.

1. Each side starts with base attack and base defense, both multiplied by its
   experience percentage (`0x418d30`). Player 1's unit is always on the left.
   Each number is drawn as value × strength, capped at 999 (`0x419590`).
2. Surround: one direction per frame, each defender neighbour inside the
   attacker's ZOC lights up with a sound. When all six light, a second sound
   plays and the defender's shown attack and defense halve.
3. Support: attack supporters around the defender and defense supporters around
   the attacker light up one by one, each with a sound and a label on its side.
   The support values are then added to the shown attack and defense.
4. Terrain: both terrain percentages appear, and each shown defense grows by
   defense × terrain% ÷ 100.

So the screen differs from the calculation. Experience appears as attack and
defense, surround is shown before support and terrain, terrain multiplies, and
squad size scales defense. Magia Laboratory lists the same discrepancies.

## Experience stars — 2026-09-26

Read at the user's request to copy the original's stars. Bits 3–7 of the unit
byte at `0x4957e0` hold experience points: 4 per award, 8 for the doubled
awards (`0x415850`), capped at 31 (`0x40a460`). Routine `0x41d4f0` draws the EXP
box. It puts the two-tile "EXP" label (tiles base+0x0f and +0x10), then a 2×2
block of 8-pixel tiles under it: a 16×16-pixel box, the size of a unit sprite.
The star count is `(points + 1) >> 2` (0–8). It indexes a table at `0x46ba68`
holding four tile slots per count (top-left, top-right, bottom-left,
bottom-right; `0xff` is blank).

Callers:
- the battle header for both units (`0x419022`, `0x41903d`);
- the redraw after experience is awarded (`0x4158e8`, `0x415911`);
- the map's bottom bar for the unit under the cursor (`0x41d45e`);
- the factory panel for the selected reserve (`0x422305`).

No routine draws stars on a unit sprite. The battle tiles are graphics block 53
of the table at `0x4324d0`, which scene entry 30 (`0x42bb88`) loads at VRAM tile
`0x480`. The blocks use LZSS (`0x418bb0`/`0x418bf0`): a 256-byte ring filled
with spaces, writing from `0xef`; a 1 bit introduces an 8-bit literal, a 0 bit an
8-bit ring position and a 4-bit length plus 2. The port's VRAM holds 4-bit packed
rows: byte high nibbles are pixels 0–3 and low nibbles pixels 4–7 (`0x412680`,
which also draws every pixel 2×2). Colours are palette 2 of battle palette set
5 (`0x46c8d0`, loaded at `0x4155f4`). Its 9-bit values go through `0x41bdc0`
with the level table `0, 7, 11, 15, 19, 23, 27, 31`.

`tools/read-original-stars.py` prints all nine boxes and the palette. The
resulting geometry and colours are recorded in PRODUCT's battle review section
and copied in `js/render.js` (`RANK_STAR`, `RANK_STAR_AT`, `RANK_GENERAL`).
The remake keeps only the stars and shows them beside each unit icon in a
box the icon's size. It does not paint stars on the sprite.

```sh
python tools/read-original-stars.py /path/to/Nec.exe
```

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
