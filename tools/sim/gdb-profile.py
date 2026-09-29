# Sampling profiler for the Rust simulator where perf is not allowed (this
# machine: kernel.perf_event_paranoid = 4). gdb runs the program, arms a
# CPU-time interval timer (ITIMER_PROF) in it, and records the call stack at
# every SIGPROF. Inlined frames appear when the build has line tables:
#
#   cd sim && CARGO_PROFILE_RELEASE_DEBUG=line-tables-only \
#     CARGO_TARGET_DIR=/tmp/nx-prof-target cargo build --release
#   PROF_OUT=/tmp/profile.json gdb -batch -x ../tools/sim/gdb-profile.py \
#     --args /tmp/nx-prof-target/release/nectaris-sim decide CORPUS
#   python3 ../tools/sim/profile-report.py /tmp/profile.json
#
# PROF_US sets the interval in microseconds of CPU time (default 4000).
# Profile a single-threaded command: the timer's signal stops one thread.
import collections
import json
import os

import gdb

interval = int(os.environ.get("PROF_US", "4000"))
out = os.environ.get("PROF_OUT", "/tmp/profile.json")
gdb.execute("set pagination off")
gdb.execute("set confirm off")
gdb.execute("set print frame-arguments none")
gdb.execute("set width 0")
# "noprint" would imply "nostop"; the printed text is discarded below.
gdb.execute("handle SIGPROF stop print nopass")
gdb.execute("break main")
gdb.execute("run")
gdb.execute("delete")
# The expressions below are C; gdb parses a Rust program's in Rust otherwise.
gdb.execute("set language c")
gdb.execute("set $it = (long*)malloc(32)")
gdb.execute("set $it[0] = 0")
gdb.execute("set $it[1] = %d" % interval)
gdb.execute("set $it[2] = 0")
gdb.execute("set $it[3] = %d" % interval)
armed = gdb.parse_and_eval("(int)setitimer(2, $it, 0)")
if int(armed) != 0:
    raise gdb.GdbError("setitimer failed; no samples would be taken")
gdb.execute("set language auto")

stacks = collections.Counter()
n = 0
while True:
    try:
        gdb.execute("continue", to_string=True)
        frame = gdb.newest_frame()
    except gdb.error:
        break
    names = []
    first = True
    while frame is not None:
        fn = frame.function()
        name = (fn.name if fn is not None else None) or frame.name() or "??"
        if first:
            sal = frame.find_sal()
            if sal.symtab is not None:
                name += " @%s:%d" % (os.path.basename(sal.symtab.filename), sal.line)
            first = False
        names.append(name)
        try:
            frame = frame.older()
        except gdb.error:
            break
    stacks[";".join(reversed(names))] += 1
    n += 1

json.dump({"samples": n, "interval_us": interval, "stacks": stacks}, open(out, "w"))
print("profile: %d samples -> %s" % (n, out))
