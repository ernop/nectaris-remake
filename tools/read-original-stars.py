#!/usr/bin/env python3
"""Print the experience star box of the identified 1997 Windows Nec.exe.

Optional research tool behind RANK_STAR, RANK_STAR_AT and RANK_GENERAL in
js/render.js. Install pefile in a temporary environment, then run:
  python tools/read-original-stars.py /path/to/Nec.exe

Nothing executes: the tool reads the star-tile table at 0x46ba68 (four tile
slots per star count, used by the EXP box routine at 0x41d4f0), unpacks the
battle-header tile block that scene entry 30 loads at VRAM tile 0x480 (block
53; LZSS as in 0x418bb0/0x418bf0, pixels as the port's tile cache 0x412680
reads them) and palette 2 of the battle palette set 5 (0x41be90, 0x41bdc0).
The executable and its data are not copied into the repo.
"""
import argparse
import hashlib
import struct

import pefile

EXPECTED_SHA256 = "d3c62eee07e7df1ad9b53ac46b3c69c38e6648ad045710fc4687aa20d10d9f92"
LEVELS = [0, 7, 11, 15, 19, 23, 27, 31]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("executable")
    data = open(parser.parse_args().executable, "rb").read()
    if hashlib.sha256(data).hexdigest() != EXPECTED_SHA256:
        raise SystemExit("Unexpected executable SHA-256; refusing unidentified version")
    pe = pefile.PE(data=data)
    image, base = pe.get_memory_mapped_image(), pe.OPTIONAL_HEADER.ImageBase

    def at(va, n=1):
        return image[va - base:va - base + n]

    entry = at(0x4324d0 + 53 * 4, 4)
    tiles = unpack(image, base, 0x444348 + (entry[1] << 16 | entry[2] << 8 | entry[3]), (entry[0] or 256) * 32)
    source, count = struct.unpack("<II", at(0x46c8d0 + 5 * 8, 8))
    colors = palette(image, base, source, count)[0x20:0x30]
    table = at(0x46ba68, 36)
    for stars in range(9):
        box = [["-"] * 16 for _ in range(16)]
        for slot, (dx, dy) in enumerate([(0, 0), (8, 0), (0, 8), (8, 8)]):
            tile = table[stars * 4 + slot]
            if tile == 0xff:
                continue
            for y in range(8):
                row = tiles[tile * 32 + y * 4:tile * 32 + y * 4 + 4]
                pixels = [b >> 4 for b in row] + [b & 15 for b in row]
                for x, index in enumerate(pixels):
                    box[dy + y][dx + x] = "%x" % index
        print("%d stars (tiles %s)" % (stars, " ".join("%02x" % t for t in table[stars * 4:stars * 4 + 4])))
        print("\n".join("  " + "".join(row) for row in box))
    print("palette 2 of set 5:", " ".join("%x=#%02x%02x%02x" % ((i,) + rgb(c)) for i, c in enumerate(colors)))


def unpack(image, base, source, size):
    ring, write, pos = bytearray(b" " * 256), 0xef, source - base
    state = {"byte": image[pos], "left": 8, "pos": pos + 1}

    def bits(n):
        value = 0
        for _ in range(n):
            value = value << 1 | state["byte"] >> 7
            state["byte"] = state["byte"] << 1 & 0xff
            state["left"] -= 1
            if not state["left"]:
                state["byte"], state["left"] = image[state["pos"]], 8
                state["pos"] += 1
        return value
    out = bytearray()
    while len(out) < size:
        if bits(1):
            run = [bits(8)]
        else:
            start, length = bits(8), bits(4) + 2
            run = []
            for i in range(length):
                run.append(ring[start + i & 0xff])
                ring[write] = run[-1]
                write = write + 1 & 0xff
            out += bytes(run)
            continue
        ring[write] = run[0]
        write = write + 1 & 0xff
        out += bytes(run)
    return bytes(out[:size])


def palette(image, base, source, count):
    colors, pos = [], source - base
    while count > 0:
        group, mask = min(8, count), image[pos]
        for i in range(group):
            colors.append(image[pos + 1 + i] | (mask << (i + 1)) & 0x100)
        pos += group + 1
        count -= group
    return colors


def rgb(color):
    def level(v):
        return (LEVELS[v] << 3) | (LEVELS[v] << 3) >> 5
    return level(color >> 3 & 7), level(color >> 6 & 7), level(color & 7)


if __name__ == "__main__":
    main()
