# Report on a tools/sim/gdb-profile.py profile.
#   python3 tools/sim/profile-report.py PROFILE.json [--top=30]
#       self time by simulator function (inlined library code counted toward
#       the function whose body runs it), inclusive time, hottest lines
#   python3 tools/sim/profile-report.py PROFILE.json --callers=REGEX
#       which simulator call chains lead into frames matching REGEX
import collections
import json
import re
import sys

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
unknown = set(opts) - {"top", "callers"}
if len(args) != 1 or unknown:
    sys.exit("usage: profile-report.py PROFILE.json [--top=N] [--callers=REGEX]")
data = json.load(open(args[0]))
top = int(opts.get("top", "30"))
total = sum(data["stacks"].values())
SOURCE = re.compile(r"@(\w+)\.rs:(\d+)$")
# Library and glue frames: their time belongs to the simulator function
# nearest above them.
LIBRARY = re.compile(r"^(core|alloc|std|hashbrown|<|\{closure|__|_int|unlink|malloc|free|realloc|cfree|mem|index|write|push|next|"
                     r"fold|any|all|max|min|abs|cmp|partial_cmp|eq|ne|hash|make_hash|add|clone|extend|collect|from_iter|map|filter|"
                     r"iter|get|contains|try_fold|spec|call|len|is_empty|swap|sort|insertion|choose|heap|sift|grow|finish|reserve|"
                     r"copy|drop|new|default|with|try_with|borrow|deref|as_|unwrap|expect|then|and_then|or_insert|entry|resize|"
                     r"truncate|clear|retain|position|find|sum|count|rev|zip|enumerate|take|skip|chain|range|into|from|to_|"
                     r"select_nth|partition|dealloc|allocate|try_allocate|do_reserve|box_new|bitor|bitand|typ|cell|in_bounds)")


def name(frame):
    return frame.split(" @")[0]


def ours(frame):
    return not LIBRARY.match(name(frame))


def pct(n):
    return "%6.1f%%" % (100.0 * n / total)


stacks = [(s.split(";"), n) for s, n in data["stacks"].items()]
print("%d samples at %d us of CPU time" % (total, data["interval_us"]))
if "callers" in opts:
    pattern = re.compile(opts["callers"])
    chains, hits = collections.Counter(), 0
    for frames, n in stacks:
        at = next((i for i, f in enumerate(frames) if pattern.search(f)), None)
        if at is None:
            continue
        hits += n
        chain = [name(f) for f in frames[:at] if ours(f)][-3:]
        chains[" < ".join(reversed(chain)) or "?"] += n
    print("%s: %s of samples" % (opts["callers"], pct(hits).strip()))
    for chain, n in chains.most_common(top):
        print(pct(n), chain[:160])
    sys.exit(0)

owner, inclusive, lines = collections.Counter(), collections.Counter(), collections.Counter()
for frames, n in stacks:
    m = SOURCE.search(frames[-1])
    if m:
        lines["%s.rs:%s" % m.groups()] += n
    owner[next((name(f) for f in reversed(frames) if ours(f)), "(library)")] += n
    for f in set(name(f) for f in frames if ours(f)):
        inclusive[f] += n
print("\nSELF, BY SIMULATOR FUNCTION")
for f, n in owner.most_common(top):
    print(pct(n), f[:120])
print("\nINCLUSIVE")
for f, n in inclusive.most_common(top):
    print(pct(n), f[:120])
print("\nHOTTEST LINES")
for f, n in lines.most_common(min(top, 25)):
    print(pct(n), f)
