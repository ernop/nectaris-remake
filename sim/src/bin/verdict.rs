//! verdict --a=SPEC --b=SPEC [--elo0=0] [--elo1=20] [--alpha=0.05] [--beta=0.05]
//!     [--max-pairs=4000] [--boards=all|0,1,...] [--seed=TEXT] [--threads=N]
//!     [--work=standard] [--rounds=0]
//!   Is A at least `elo1` stronger than B, or at most `elo0` stronger? Plays
//!   seat-swapped pairs of games (`nectaris_sim::verdict`) between two lab
//!   specs (`lab::make_player`: a bot id, or a weighted spec) until the
//!   sequential test decides at error rates `alpha` (wrongly calling A
//!   stronger) and `beta` (wrongly calling it not stronger), or `max-pairs`
//!   pairs are played. Prints the evidence after every batch of pairs.

use nectaris_sim::data::Data;
use nectaris_sim::dice::Seed;
use nectaris_sim::verdict::{self, Outcome, Tally, Test};
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::Instant;

fn main() {
    if let Err(e) = run() {
        eprintln!("{e}");
        std::process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let flags: HashMap<String, String> = std::env::args()
        .skip(1)
        .map(|a| {
            let a = a.strip_prefix("--").ok_or(format!("{a}: options are --name=value"))?;
            let (k, v) = a.split_once('=').ok_or(format!("--{a} needs a value"))?;
            Ok((k.to_string(), v.to_string()))
        })
        .collect::<Result<_, String>>()?;
    let known = ["a", "b", "elo0", "elo1", "alpha", "beta", "max-pairs", "boards", "seed", "threads", "work", "rounds"];
    if let Some(k) = flags.keys().find(|k| !known.contains(&k.as_str())) {
        return Err(format!("Unknown option --{k}"));
    }
    let data = Data::load(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../sim/data/game-data.json").to_str().unwrap());
    let a = flags.get("a").ok_or("--a=SPEC is required")?;
    let b = flags.get("b").ok_or("--b=SPEC is required")?;
    let num = |k: &str, d: f64| -> Result<f64, String> { flags.get(k).map_or(Ok(d), |v| v.parse().map_err(|_| format!("--{k} must be a number"))) };
    let test = Test { elo0: num("elo0", 0.0)?, elo1: num("elo1", 20.0)?, alpha: num("alpha", 0.05)?, beta: num("beta", 0.05)?, max_pairs: num("max-pairs", 4000.0)? as usize };
    if test.elo1 <= test.elo0 {
        return Err("--elo1 must be above --elo0".into());
    }
    let boards: Vec<usize> = match flags.get("boards").map_or("all", String::as_str) {
        "all" => (0..data.boards.len()).collect(),
        list => list
            .split(',')
            .map(|s| s.parse::<usize>().ok().filter(|&i| i < data.boards.len()).ok_or(format!("--boards: {s} is not a board index from 0 to {}", data.boards.len() - 1)))
            .collect::<Result<_, _>>()?,
    };
    let seed = match flags.get("seed") {
        Some(text) => Seed::from_text(text),
        None => Seed::fresh(),
    };
    let threads = match flags.get("threads") {
        Some(v) => v.parse().map_err(|_| "--threads must be a whole number".to_string())?,
        None => std::thread::available_parallelism().map_err(|e| e.to_string())?.get(),
    };
    let work = flags.get("work").map_or("standard", String::as_str);
    let rounds = num("rounds", 0.0)? as i32;
    let (lo, hi) = test.bounds();
    println!(
        "{a} vs {b}: is A at least {:+} Elo stronger (H1) or at most {:+} (H0)? alpha {}, beta {}; LLR bounds [{lo:.2}, {hi:.2}]; {} boards; seed {}",
        test.elo1,
        test.elo0,
        test.alpha,
        test.beta,
        boards.len(),
        seed.hex()
    );
    let started = Instant::now();
    let line = |t: &Tally| {
        let (e, elo_lo, elo_hi) = t.elo();
        format!("{} pairs: Elo {e:+.1} [{elo_lo:+.1}, {elo_hi:+.1}], LLR {:.2}", t.count(), t.llr(test.elo0, test.elo1))
    };
    let (tally, outcome) = verdict::run(&data, a, b, &boards, &seed, threads, work, rounds, &test, |t| println!("  {}", line(t)))?;
    let games = 2 * tally.count();
    let wdl = |s: [u32; 3]| format!("{}-{}-{}", s[0], s[1], s[2]);
    println!(
        "{}: {}; {games} games in {:.1} s. Pairs by A's score 0 to 2: {:?}. A as Union {}, as Xenon {} (wins-draws-losses). Ends: base {}, elimination {}, turn limit {}, round cap {}; mean rounds {:.1}.",
        match outcome {
            Outcome::Stronger => format!("A IS at least {:+} Elo stronger", test.elo1),
            Outcome::NotStronger => format!("A is NOT {:+} Elo stronger (at most {:+})", test.elo1, test.elo0),
            Outcome::Undecided => format!("UNDECIDED after {} pairs", test.max_pairs),
        },
        line(&tally),
        started.elapsed().as_secs_f64(),
        tally.pairs,
        wdl(tally.union),
        wdl(tally.xenon),
        tally.ends[0],
        tally.ends[1],
        tally.ends[2],
        tally.ends[3],
        tally.rounds as f64 / f64::from(games.max(1))
    );
    Ok(())
}
