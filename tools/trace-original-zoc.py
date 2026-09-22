#!/usr/bin/env python3
"""Record movement/ZOC observations from the identified 1997 Windows Nec.exe.

Optional research tool; the game and Node tests have no Python dependencies.
Install pefile and unicorn in a temporary environment, then run:
  python tools/trace-original-zoc.py /path/to/Nec.exe > test/fixtures/windows-zoc.json

Only the isolated ZOC and movement routines execute, inside Unicorn with an
instruction/address guard. No Windows APIs, graphics, RNG or process entry point
are executed. The executable and its code/assets are not copied into the repo.
These are Windows observations, not a PCE hardware trace.
"""
import argparse
import hashlib
import json
import struct

import pefile
from unicorn import Uc, UC_ARCH_X86, UC_MODE_32, UC_HOOK_CODE
from unicorn.x86_const import UC_X86_REG_ESP, UC_X86_REG_EIP

EXPECTED_SHA256 = "d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92"
UNIT_IDS = ["TRIGGER", "FALCON", "EAGLE", "HUNTER", "GRIZZLY", "POLAR", "BISON",
            "SLAGGER", "TITAN", "GIANT", "LENET", "HADRIAN", "OCTOPUS", "RABBIT",
            "LYNX", "SEEKER", "HAWKEYE", "ATLAS", "CHARLIE", "KILROY", "PANTHER",
            "MULE", "PELICAN"]
TERRAIN_IDS = {".": 0, "-": 1, "h": 2, "w": 3, "v": 4, "M": 5, "=": 6}


class Original:
    def __init__(self, pe, case):
        self.case = case
        self.uc = Uc(UC_ARCH_X86, UC_MODE_32)
        base, size = pe.OPTIONAL_HEADER.ImageBase, pe.OPTIONAL_HEADER.SizeOfImage
        self.uc.mem_map(base, (size + 4095) & ~4095)
        self.uc.mem_write(base, pe.get_memory_mapped_image())
        self.uc.mem_map(0x10000000, 0x200000)
        self.uc.hook_add(UC_HOOK_CODE, self.guard)
        grid, units = case["grid"], case["units"]
        self.width, self.height = len(grid[0]), len(grid)
        assert 1 <= self.width <= 30 and 1 <= self.height <= 20 and len(units) <= 56
        selected = units[0]
        self.write(0x495c02, [self.width, self.height])
        self.write(0x495c63, [selected["o"] * 128])
        self.write(0x495af0, [255] * 56)  # absent unit Y/status
        self.write(0x495ab0, [255] * 56)  # absent unit X/storage
        self.write(0x495820, [255] * 640)  # empty occupancy map
        for y, row in enumerate(grid):
            assert len(row) == self.width
            for x, terrain in enumerate(row):
                self.write(0x481a80 + y * 32 + x, [TERRAIN_IDS[terrain]])
        for i, unit in enumerate(units):
            kind, owner, x, y = UNIT_IDS.index(unit["t"]), unit["o"], unit["x"], unit["y"]
            self.write(0x4957a0 + i, [kind + owner * 128 + (64 if unit.get("moved") else 0)])
            self.write(0x495ab0 + i, [x])
            self.write(0x495af0 + i, [y])
            self.write(0x495820 + y * 32 + x, [i + owner * 128])
        self.write(0x48327b, [0, UNIT_IDS.index(selected["t"]), selected["x"], selected["y"]])
        self.write(0x495f30, [1])  # one movement phase, as in the human Shift command
        self.write(0x495ef8, [case.get("remaining", 0)])  # zero selects full type allowance
        self.write(0x495c6e, [0])  # disable optional rendering calls

    def write(self, address, values):
        self.uc.mem_write(address, bytes(values))

    @staticmethod
    def guard(uc, address, size, context):
        if not (0x4015d0 <= address < 0x401a31 or 0x423a80 <= address < 0x423c22):
            raise RuntimeError("Unexpected execution outside the rule routines: " + hex(address))

    def call(self, address):
        stack, stop = 0x101ffff0, 0x10000000
        self.uc.mem_write(stack, struct.pack("<I", stop))
        self.uc.reg_write(UC_X86_REG_ESP, stack)
        self.uc.emu_start(address, stop, count=5000000)
        if self.uc.reg_read(UC_X86_REG_EIP) != stop:
            raise RuntimeError("Original routine exceeded instruction limit")

    def record(self):
        self.call(0x423a80)  # rebuild both sides' ZOC flags from current field units
        self.call(0x4015d0)  # calculate the selected unit's range
        allowance = self.uc.mem_read(0x495f06, 1)[0] - 1
        occupied = {(u["x"], u["y"]): u for u in self.case["units"]}
        selected = self.case["units"][0]
        reachable, zones = [], []
        for y in range(self.height):
            for x in range(self.width):
                value = self.uc.mem_read(0x495c70 + y * 32 + x, 1)[0]
                terrain = self.uc.mem_read(0x481a80 + y * 32 + x, 1)[0]
                occupant = occupied.get((x, y))
                # The original mask also includes friendly transit hexes; these
                # fixtures compare empty endpoints plus the selected unit's origin.
                if value and (occupant is None or occupant is selected):
                    assert value & 0xf0 == 0x10
                    reachable.append([x, y, allowance + 1 - (value & 15)])
                # The original also flags each enemy's occupied hex. Occupancy
                # already forbids entry there; compare the six-neighbor ZOC only.
                if terrain & 128 and (occupant is None or occupant["o"] == selected["o"]):
                    zones.append([x, y])
        return dict(self.case, reachable=reachable, zoc=zones)


def unit(kind, owner, x, y, **extra):
    return dict(t=kind, o=owner, x=x, y=y, **extra)


def cases():
    result = []
    for kind in UNIT_IDS:
        for player in [0, 1]:
            x = 4 + player
            result.append(dict(name=f"{kind}: adjacent enemy, side {player}, column parity {x % 2}",
                               grid=["..........."] * 7,
                               units=[unit(kind, player, x, 3), unit("BISON", 1-player, x+1, 3)]))
    result.extend([
        dict(name="enter ZOC from outside", grid=["...................."],
             units=[unit("BISON", 0, 1, 0), unit("BISON", 1, 5, 0)]),
        dict(name="encircled: each adjacent destination is controlled", grid=["..........."] * 7,
             units=[unit("BISON", 0, 5, 3), unit("BISON", 1, 6, 4), unit("BISON", 1, 4, 3)]),
        dict(name="leaving ZOC charges hills normally", grid=["hhhhhhhhhhh"] * 7,
             units=[unit("BISON", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="leaving ZOC charges wasteland normally", grid=["wwwwwwwwwww"] * 7,
             units=[unit("RABBIT", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="Giant cannot leave ZOC into wasteland", grid=["wwwwwwwwwww"] * 7,
             units=[unit("GIANT", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="infantry leaving ZOC pays mountain costs", grid=["MMMMMMMMMMM"] * 7,
             units=[unit("CHARLIE", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="Rabbit retreat: surviving enemy, three points", grid=["..........."] * 7, remaining=3,
             units=[unit("RABBIT", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="Rabbit retreat: one point cannot pay hill cost", grid=["hhhhhhhhhhh"] * 7, remaining=1,
             units=[unit("RABBIT", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="Lynx retreat: adjacent aircraft, two points", grid=["..........."] * 7, remaining=2,
             units=[unit("LYNX", 0, 4, 3), unit("FALCON", 1, 5, 3)]),
        dict(name="spent mine still projects ZOC", grid=["..........."] * 7,
             units=[unit("BISON", 0, 4, 3), unit("TRIGGER", 1, 5, 3, moved=True)]),
        dict(name="friendly unit does not cancel enemy ZOC", grid=["..........."] * 7,
             units=[unit("BISON", 0, 2, 3), unit("BISON", 0, 4, 3), unit("BISON", 1, 5, 3)]),
        dict(name="another enemy still controls the retreat", grid=["..........."] * 7, remaining=3,
             units=[unit("RABBIT", 0, 4, 3), unit("BISON", 1, 5, 3), unit("BISON", 1, 2, 3)]),
        dict(name="range after adjacent enemy removal", grid=["..........."] * 7,
             units=[unit("BISON", 0, 4, 3)]),
    ])
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("executable")
    args = parser.parse_args()
    with open(args.executable, "rb") as source:
        data = source.read()
    if hashlib.sha256(data).hexdigest() != EXPECTED_SHA256:
        raise SystemExit("Unexpected executable SHA-256; refusing unidentified version")
    pe = pefile.PE(data=data)
    output = dict(source=dict(release="Hudson Windows freeware, 1997-11-05", sha256=EXPECTED_SHA256,
                              zocRoutine="0x423a80", movementRoutine="0x4015d0",
                              note="Isolated executable observations; not PCE hardware traces."),
                  cases=[Original(pe, case).record() for case in cases()])
    print("{\n  \"source\": " + json.dumps(output["source"], separators=(",", ":")) + ",\n  \"cases\": [")
    print(",\n".join("    " + json.dumps(case, separators=(",", ":")) for case in output["cases"]))
    print("  ]\n}")


if __name__ == "__main__":
    main()
