#!/usr/bin/env bash
# Builds the Rust simulator with profile-guided optimization, for speed runs
# on this machine (about 7% faster than the plain release build, 2026-09-29).
# An instrumented build plays training games on boards the speed benchmarks
# do not use, llvm-profdata merges the counts, the final build uses them, and
# the result must pass the behaviour lock before it is printed.
#   tools/sim/build-pgo.sh        prints the binary: sim/target/pgo/release/nectaris-sim
# Needs rustup's llvm-tools component: rustup component add llvm-tools
# CI builds and checks the plain release build; PGO never changes behaviour,
# and the lock run below confirms it for each build.
set -euo pipefail
cd "$(dirname "$0")/../../sim"
host=$(rustc -vV | sed -n 's/^host: //p')
profdata="$(rustc --print sysroot)/lib/rustlib/$host/bin/llvm-profdata"
if [ ! -x "$profdata" ]; then
  echo "llvm-profdata is missing ($profdata); install it with: rustup component add llvm-tools" >&2
  exit 1
fi
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
RUSTFLAGS="-Cprofile-generate=$work/counts" CARGO_TARGET_DIR=target/pgo-gen cargo build --release --locked --quiet
gen=target/pgo-gen/release/nectaris-sim
# The benchmarks use boards 0, 5, 10, ...; training uses the others. Few
# threads: the instrumented counters are shared, and contention slows them.
"$gen" tournament --out="$work/search" --opponents=beam,monte-carlo,apex --boards="$(seq -s, 1 10 118)" --rounds=3 --seed=5 --threads=4 >/dev/null
"$gen" tournament --out="$work/classic" --opponents=classic,tactical --boards="$(seq -s, 2 5 118)" --rounds=0 --seed=5 --threads=4 >/dev/null
"$gen" playout --games=200 --threads=1 >/dev/null
"$profdata" merge -o "$work/merged.profdata" "$work/counts"
RUSTFLAGS="-Cprofile-use=$work/merged.profdata" CARGO_TARGET_DIR=target/pgo cargo build --release --locked --quiet
bin=target/pgo/release/nectaris-sim
"$bin" replay | tail -2 >&2
"$bin" decide --verify-caches | tail -2 | head -1 >&2
echo "$(pwd)/$bin"
