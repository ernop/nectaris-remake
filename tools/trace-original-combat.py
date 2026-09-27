#!/usr/bin/env python3
"""Record battle-effect and casualty observations from the identified 1997
Windows Nec.exe.

Optional research tool; the game and Node tests have no Python dependencies.
Install pefile and unicorn in a temporary environment, then run:
  python tools/trace-original-combat.py /path/to/Nec.exe > test/fixtures/windows-combat.json

Only isolated rule code executes, inside Unicorn with an address guard: the
ZOC rebuild, the battle-effect routine with its stat/board helpers, the damage
scaling and survivor fragment with supplied roll multipliers, and the carrier
loss routine. No Windows APIs, rendering, animation, random generator or
process entry point run. The executable and its code/assets are not copied into
the repo. These are Windows observations, not a PCE hardware trace.
"""
import argparse
import hashlib
import json
import struct

import pefile
from unicorn import Uc, UC_ARCH_X86, UC_MODE_32, UC_HOOK_CODE
from unicorn.x86_const import UC_X86_REG_EAX, UC_X86_REG_EBX, UC_X86_REG_ESP, UC_X86_REG_EIP

EXPECTED_SHA256 = "d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92"
UNIT_IDS = ["TRIGGER", "FALCON", "EAGLE", "HUNTER", "GRIZZLY", "POLAR", "BISON",
            "SLAGGER", "TITAN", "GIANT", "LENET", "HADRIAN", "OCTOPUS", "RABBIT",
            "LYNX", "SEEKER", "HAWKEYE", "ATLAS", "CHARLIE", "KILROY", "PANTHER",
            "MULE", "PELICAN"]
TERRAIN_IDS = {".": 0, "-": 1, "h": 2, "w": 3, "v": 4, "M": 5, "=": 6}
# Executed code: neighbour step, battle effects plus helpers, damage scaling,
# survivors, strength write-back with carrier losses, and the ZOC rebuild.
ROUTINES = [(0x403490, 0x4034c4), (0x41b810, 0x41bdb7), (0x420cfb, 0x420d0e),
            (0x420d13, 0x420daa), (0x420e20, 0x420ea5), (0x420ff0, 0x421086),
            (0x423a80, 0x423c22)]
STOP, STACK = 0x10000000, 0x101f0000
GRID = ["..........."] * 7


class Original:
    def __init__(self, pe, case):
        self.case = case
        self.uc = Uc(UC_ARCH_X86, UC_MODE_32)
        base, size = pe.OPTIONAL_HEADER.ImageBase, pe.OPTIONAL_HEADER.SizeOfImage
        self.uc.mem_map(base, (size + 4095) & ~4095)
        self.uc.mem_write(base, pe.get_memory_mapped_image())
        self.uc.mem_map(STOP, 0x200000)
        self.uc.hook_add(UC_HOOK_CODE, self.guard)
        grid, units = case["grid"], case["units"]
        width, height = len(grid[0]), len(grid)
        assert 1 <= width <= 30 and 1 <= height <= 20 and len(units) <= 56
        attacker = units[case["attacker"]]
        self.write(0x495c02, [width, height])
        self.write(0x495c63, [attacker["o"] * 128])  # the attacker's side is to move
        self.write(0x495af0, [255] * 56)  # absent unit Y/status
        self.write(0x495ab0, [255] * 56)  # absent unit X/storage
        self.write(0x495820, [255] * 640)  # empty occupancy map
        for y, row in enumerate(grid):
            assert len(row) == width
            for x, terrain in enumerate(row):
                self.write(0x481a80 + y * 32 + x, [TERRAIN_IDS[terrain]])
        carriers = {u["in"] for u in units if "in" in u}
        for i, unit in enumerate(units):
            kind, owner, x, y = UNIT_IDS.index(unit["t"]), unit["o"], unit["x"], unit["y"]
            exp = unit.get("exp", 0)
            points = 31 if exp == 8 else exp * 4  # 4 points per star, capped at 31
            self.write(0x4957a0 + i, [kind + owner * 128])
            self.write(0x4957e0 + i, [points << 3 | (unit.get("str", 8) - 1)])
            self.write(0x495ab0 + i, [x])
            if "in" in unit:
                self.write(0x495af0 + i, [0x40 | unit["in"]])  # carried: carrier index
            else:
                self.write(0x495af0 + i, [y | (0x20 if i in carriers else 0)])
                self.write(0x495820 + y * 32 + x, [i + owner * 128])

    def write(self, address, values):
        self.uc.mem_write(address, bytes(values))

    def byte(self, address):
        return self.uc.mem_read(address, 1)[0]

    def word(self, address):
        return struct.unpack("<h", self.uc.mem_read(address, 2))[0]

    @staticmethod
    def guard(uc, address, size, context):
        if not any(start <= address < end for start, end in ROUTINES):
            raise RuntimeError("Unexpected execution outside the rule routines: " + hex(address))

    def run(self, start, end, eax=0, ebx=0, args=()):
        self.uc.mem_write(STACK, struct.pack("<" + "I" * (len(args) + 1), STOP, *args))
        self.uc.reg_write(UC_X86_REG_ESP, STACK)
        self.uc.reg_write(UC_X86_REG_EAX, eax)
        self.uc.reg_write(UC_X86_REG_EBX, ebx)
        self.uc.emu_start(start, end, count=5000000)
        if self.uc.reg_read(UC_X86_REG_EIP) != end:
            raise RuntimeError("Original routine exceeded instruction limit")

    def neighbours(self, index):
        unit = self.case["units"][index]
        return [step(unit["x"], unit["y"], d) for d in range(6)]

    def unit_at(self, point):
        for i, unit in enumerate(self.case["units"]):
            if "in" not in unit and (unit["x"], unit["y"]) == point:
                return i
        raise AssertionError("support mask names an empty hex")

    def record(self):
        case, a, d = self.case, self.case["attacker"], self.case["defender"]
        self.run(0x423a80, STOP)  # rebuild both sides' ZOC flags
        self.run(0x41b810, STOP, args=(a, d, int(case["indirect"])))
        attack_mask, defense_mask = self.byte(0x481e54), self.byte(0x481e56)
        ring = self.byte(0x481e4a) if not case["indirect"] else 0
        effects = dict(
            attackSupport=self.word(0x481e58), defenseSupport=self.word(0x481e5c),
            attackSupporters=sorted(self.unit_at(p) for i, p in enumerate(self.neighbours(d))
                                    if attack_mask >> i & 1),
            defenseSupporters=sorted(self.unit_at(p) for i, p in enumerate(self.neighbours(a))
                                     if defense_mask >> i & 1),
            ring=[list(p) for i, p in enumerate(self.neighbours(d)) if ring >> i & 1],
            surrounded=ring == 0x3f, counterAttack=self.word(0x481e50),
            totals=[self.word(0x481e52), self.word(0x481e60)])
        attack_roll, counter_roll = case["rolls"]
        self.run(0x420cfb, 0x420d0e, eax=attack_roll, ebx=10)
        self.run(0x420d13, 0x420daa, eax=counter_roll, ebx=10)
        damage = [self.word(0x481e52), self.word(0x481e60)]
        survivors = [self.byte(0x481db6), self.byte(0x481db2)]
        self.write(0x48327b, [a])
        self.write(0x483274, [d])
        self.run(0x420e20, 0x420ea5)  # strength write-back and carrier losses
        cargo = {}
        for i, unit in enumerate(case["units"]):
            if "in" in unit:
                removed = self.byte(0x4957a0 + i) == 255
                cargo[str(i)] = None if removed else (self.byte(0x4957e0 + i) & 7) + 1
        return dict(case, effects=effects, damage=damage, survivors=survivors, cargo=cargo)


STEP_X = [0, 1, 1, 0, -1, -1]
STEP_Y = [[-1, -1, 0, 1, 0, -1], [-1, 0, 1, 1, 1, 0]]


def step(x, y, direction):
    # 0x403490; directions run clockwise from north. main() checks the tables.
    return (x + STEP_X[direction], y + STEP_Y[x & 1][direction])


def check_step_tables(pe):
    image, base = pe.get_memory_mapped_image(), pe.OPTIONAL_HEADER.ImageBase
    signed = [b - 256 if b > 127 else b for b in image[0x42a228 - base:0x42a23e - base]]
    if signed[16:22] != STEP_X or [signed[0:6], signed[6:12]] != STEP_Y:
        raise SystemExit("Neighbour tables at 0x42a228/0x42a238 differ from the recorded layout")


def unit(kind, owner, x, y, **extra):
    return dict(t=kind, o=owner, x=x, y=y, **extra)


def battle(name, units, grid=GRID, attacker=0, defender=1, indirect=False, rolls=(10, 10)):
    return dict(name=name, grid=grid, units=units, attacker=attacker, defender=defender,
                indirect=indirect, rolls=list(rolls))


def cases():
    # Target T at (5,3). Attacker A at (4,3). Both touch (5,2) and (4,4);
    # only T touches (6,3), (6,4) and (5,4); only A touches (4,2), (3,3), (3,2).
    # (6,4) is opposite A, so a unit there also encloses T.
    a, t = unit("BISON", 0, 4, 3), unit("BISON", 1, 5, 3)
    hills = ["..........."] * 3 + [".....h....."] + ["..........."] * 3
    edge = [unit("BISON", 0, 4, 0), unit("BISON", 1, 5, 0), unit("BISON", 0, 6, 1)]
    return [
        battle("plain duel without effects", [a, t]),
        battle("attack supporter touching only the target", [a, t, unit("BISON", 0, 6, 3)]),
        battle("a supporter opposite the attacker also encloses the target",
               [a, t, unit("BISON", 0, 6, 4)]),
        battle("attack supporter touching both combatants", [a, t, unit("BISON", 0, 5, 2)]),
        battle("defense supporter touching only the attacker", [a, t, unit("BISON", 1, 3, 3)]),
        battle("defense supporter touching both combatants", [a, t, unit("BISON", 1, 4, 4)]),
        battle("English guide layout: one defense supporter on each side",
               [a, t, unit("BISON", 1, 4, 4), unit("BISON", 1, 4, 2)]),
        battle("Base Nectaris figure 1: Seeker attacks Hunter beside two Hawkeyes",
               [unit("SEEKER", 0, 4, 3), unit("HUNTER", 1, 5, 3),
                unit("HAWKEYE", 0, 5, 2), unit("HAWKEYE", 0, 4, 4)]),
        battle("Base Nectaris figure 1: Hunter attacks the Hawkeye-backed Seeker",
               [unit("HUNTER", 0, 4, 3), unit("SEEKER", 1, 5, 3),
                unit("HAWKEYE", 1, 5, 2), unit("HAWKEYE", 1, 4, 4)]),
        battle("Base Nectaris figure 2: Bisons have no anti-air support",
               [unit("SEEKER", 0, 4, 3), unit("HUNTER", 1, 5, 3),
                unit("BISON", 0, 5, 2), unit("BISON", 0, 4, 4)]),
        battle("Base Nectaris figure 2: Bisons defend the attacked Seeker",
               [unit("HUNTER", 0, 4, 3), unit("SEEKER", 1, 5, 3),
                unit("BISON", 1, 5, 2), unit("BISON", 1, 4, 4)]),
        battle("a weakened attacker enlarges both supports",
               [unit("BISON", 0, 4, 3, str=4), t, unit("BISON", 0, 6, 3), unit("BISON", 1, 3, 3)]),
        battle("weakened supporters contribute per machine",
               [a, t, unit("BISON", 0, 6, 3, str=3), unit("BISON", 1, 3, 3, str=5)]),
        battle("loaded transports support with their own stats",
               [a, t, unit("MULE", 0, 6, 3), unit("CHARLIE", 0, 0, 6, **{"in": 2}),
                unit("PELICAN", 1, 3, 3), unit("GIANT", 1, 1, 6, **{"in": 4})]),
        battle("mines give defense support and no attack support",
               [a, t, unit("TRIGGER", 0, 6, 3), unit("TRIGGER", 1, 3, 3)]),
        battle("artillery beside the target still supports", [a, t, unit("HADRIAN", 0, 6, 3)]),
        battle("aircraft without ground attack add only defense",
               [a, t, unit("FALCON", 0, 6, 3), unit("FALCON", 1, 3, 3)]),
        battle("manual page 11: two infantry on opposite sides enclose a tank",
               [unit("CHARLIE", 0, 5, 2), t, unit("CHARLIE", 0, 5, 4)]),
        battle("the other diagonal pair also encloses",
               [unit("BISON", 0, 6, 3), t, unit("BISON", 0, 4, 4)]),
        battle("one uncovered ring hex breaks the surround",
               [unit("BISON", 0, 5, 2), t, unit("BISON", 0, 6, 4)]),
        battle("the map edge prevents surround", edge),
        battle("the target's own ally inside the ring does not break the surround",
               [unit("CHARLIE", 0, 5, 2), t, unit("CHARLIE", 0, 5, 4), unit("BISON", 1, 6, 3)]),
        battle("a mine closes the ring", [unit("BISON", 0, 5, 2), t, unit("TRIGGER", 0, 5, 4)]),
        battle("a loaded Pelican closes the ring",
               [unit("BISON", 0, 5, 2), t, unit("PELICAN", 0, 5, 4), unit("GIANT", 0, 0, 6, **{"in": 2})]),
        battle("surround halves defense after support and hills",
               [unit("BISON", 0, 5, 2), t, unit("BISON", 0, 5, 4), unit("BISON", 1, 5, 1)], grid=hills),
        battle("a surrounded attacker keeps full attack and defense",
               [unit("BISON", 0, 5, 3), unit("BISON", 1, 5, 2), unit("BISON", 1, 5, 4)]),
        battle("mine on hills reaches the defense cap",
               [a, unit("TRIGGER", 1, 5, 3)], grid=hills),
        battle("indirect fire ignores support and surround",
               [unit("HADRIAN", 0, 2, 3), t, unit("CHARLIE", 0, 5, 2), unit("CHARLIE", 0, 5, 4),
                unit("BISON", 1, 2, 2)], indirect=True),
        battle("Lynx cannot counter an adjacent ground attacker", [a, unit("LYNX", 1, 5, 3)]),
        battle("Lynx counters an adjacent aircraft", [unit("EAGLE", 0, 4, 3), unit("LYNX", 1, 5, 3)]),
        battle("experience: three-star attacker, General defender",
               [unit("BISON", 0, 4, 3, exp=3), unit("BISON", 1, 5, 3, exp=8)]),
        battle("single machines have no 50 HP bonus",
               [unit("BISON", 0, 4, 3, str=1), unit("BISON", 1, 5, 3, str=1)], rolls=(5, 5)),
        battle("two machines keep the 50 HP bonus",
               [unit("BISON", 0, 4, 3, str=2), unit("BISON", 1, 5, 3, str=2)], rolls=(5, 5)),
        battle("a 4.0 roll against an enclosed squad",
               [unit("CHARLIE", 0, 5, 2), t, unit("CHARLIE", 0, 5, 4)], rolls=(40, 2)),
        battle("misfire and critical counter", [a, t], rolls=(2, 40)),
        battle("one lost Pelican cuts eight Giants to two",
               [unit("CHARLIE", 0, 4, 3), unit("PELICAN", 1, 5, 3, str=3),
                unit("GIANT", 1, 0, 6, **{"in": 1})], rolls=(15, 10)),
        battle("a destroyed Pelican takes its Giants with it",
               [unit("FALCON", 0, 4, 3), unit("PELICAN", 1, 5, 3, str=3),
                unit("GIANT", 1, 0, 6, **{"in": 1})]),
        battle("an unhurt Pelican keeps its oversized cargo",
               [unit("CHARLIE", 0, 4, 3), unit("PELICAN", 1, 5, 3, str=3),
                unit("GIANT", 1, 0, 6, **{"in": 1})], rolls=(2, 10)),
        battle("cargo smaller than the surviving carrier is unchanged",
               [unit("FALCON", 0, 4, 3, str=1), unit("PELICAN", 1, 5, 3),
                unit("GIANT", 1, 0, 6, str=2, **{"in": 1})]),
        battle("an attacked loaded Mule counterattacks and loses passengers",
               [unit("POLAR", 0, 4, 3), unit("MULE", 1, 5, 3), unit("CHARLIE", 1, 0, 6, **{"in": 1})]),
    ]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("executable")
    args = parser.parse_args()
    with open(args.executable, "rb") as source:
        data = source.read()
    if hashlib.sha256(data).hexdigest() != EXPECTED_SHA256:
        raise SystemExit("Unexpected executable SHA-256; refusing unidentified version")
    pe = pefile.PE(data=data)
    check_step_tables(pe)
    output = dict(source=dict(release="Hudson Windows freeware, 1997-11-05", sha256=EXPECTED_SHA256,
                              effectsRoutine="0x41b810", survivorFragment="0x420cfb-0x420daa",
                              carrierLossRoutine="0x420ff0", zocRoutine="0x423a80",
                              rolls="multipliers in tenths, as returned by 0x421170",
                              note="Isolated executable observations; not PCE hardware traces."),
                  cases=[Original(pe, case).record() for case in cases()])
    print("{\n  \"source\": " + json.dumps(output["source"], separators=(",", ":")) + ",\n  \"cases\": [")
    print(",\n".join("    " + json.dumps(case, separators=(",", ":")) for case in output["cases"]))
    print("  ]\n}")


if __name__ == "__main__":
    main()
