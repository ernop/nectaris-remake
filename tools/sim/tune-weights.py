#!/usr/bin/env python3
"""Coordinate-descent tuning of the scoring weights (sim/src/model.rs `Weights`).

  python3 tools/sim/tune-weights.py --opponents='tactical@3;classic@2' \
      --player=greedy --boards=set:train --seed=tune1 --sweeps=3 [--late] [--start=best.json]

Opponents are separated by `;`. `NAME@N` plays N cycles against NAME (default
--cycles); NAME is any `nectaris-sim match` spec, e.g. `greedy:u.advance=1.5`.
Each candidate multiplies one weight of one seat by 0.6 or 1.5 and is kept if
its mean score against the opponents rises by more than --margin points.
Every sweep plays with a fresh seed derived from --seed, and the incumbent is
measured again under it, so a candidate cannot win only by fitting one set of
dice. With --late the parameters are the late-game (`u.l.NAME`, `x.l.NAME`)
values instead of the whole-game ones; the start file supplies the rest.
The best set is written to --out after every accepted step as the spec
`nectaris-sim match` reads (`greedy:u.danger=0.5,x.l.advance=0.6`).
Requires `cargo build --release` in sim/. Scores are on the boards given, so
validate on boards that were not used here (BOTS.md).
"""
import argparse, json, re, subprocess, sys
from pathlib import Path

BASE = dict(danger=0.6, danger_scale=0.085, advance=1.0, terrain=0.1, support=1.0, move_cost=0.35,
            trade_out=1.0, trade_in=1.0, kill=1.0, death=1.0, base_worth=160.0, hunt_worth=65.0)
BIN = Path(__file__).resolve().parents[2] / "sim/target/release/nectaris-sim"

a = argparse.ArgumentParser()
a.add_argument("--opponents", required=True)
a.add_argument("--player", default="greedy", help="greedy, beam-w, apex-w or mc-w")
a.add_argument("--boards", default="set:train")
a.add_argument("--cycles", type=int, default=3)
a.add_argument("--sweeps", type=int, default=3)
a.add_argument("--margin", type=float, default=1.0)
a.add_argument("--seed", required=True)
a.add_argument("--late", action="store_true")
a.add_argument("--seats", default="ux", help="only tune these seats, u and/or x")
a.add_argument("--start", help="JSON {key: value} of spec entries, e.g. {\"u.advance\": 1.5}")
a.add_argument("--out", default="tuned-weights.json")
args = a.parse_args()

cur = json.load(open(args.start)) if args.start else {}
cache = {}

def spec(c):
    # Whole-game entries first so a late-only entry is never overwritten by one.
    keys = sorted(c, key=lambda k: ".l." in k)
    return args.player + ":" + ",".join(f"{k}={c[k]}" for k in keys)

def fitness(c, seed):
    sp = spec(c)
    if (sp, seed) not in cache:
        total = 0.0
        opponents = args.opponents.split(";")
        for o in opponents:
            name, _, cycles = o.rpartition("@") if "@" in o else (o, "", str(args.cycles))
            out = subprocess.run([BIN, "match", f"--a={sp}", f"--b={name}", f"--boards={args.boards}", f"--cycles={cycles}",
                                  f"--seed={seed}"], capture_output=True, text=True)
            m = re.search(r"score ([\d.]+)%", out.stdout)
            if not m:
                sys.exit(out.stderr + out.stdout)
            total += float(m.group(1))
        cache[(sp, seed)] = total / len(opponents)
    return cache[(sp, seed)]

def value(c, key):
    if key in c:
        return c[key]
    seat, _, name = key.replace(".l.", ".").partition(".")
    return c.get(f"{seat}.{name}", BASE[name])

keys = [f"{seat}.{'l.' if args.late else ''}{name}" for seat in args.seats for name in BASE]
for sweep in range(args.sweeps):
    seed = f"{args.seed}-{sweep}"
    best = fitness(cur, seed)
    print(f"sweep{sweep} incumbent {best:.1f}", flush=True)
    improved = False
    for key in keys:
        v0 = value(cur, key)
        for factor in (0.6, 1.5):
            cand = dict(cur)
            cand[key] = round(v0 * factor, 4)
            score = fitness(cand, seed)
            if score > best + args.margin:
                best, cur, improved = score, cand, True
                print(f"sweep{sweep} {key}={cand[key]} -> {score:.1f}", flush=True)
                json.dump(cur, open(args.out, "w"))
                break
    if not improved:
        break
print("final", spec(cur))
