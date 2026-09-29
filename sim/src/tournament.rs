//! `AI_TOURNAMENT.normalize` and `fixture` with normal openings, and a runner
//! that plays the games on every thread. The same settings give the same
//! games, seeds and seats as `tools/ai-research/run.cjs`.

use crate::data::Data;
use crate::dice::{sha256, Seed};
use crate::play::{self, Outcome};
use serde_json::json;
use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::Instant;

pub const OPPONENTS: [&str; 5] = ["classic", "tactical", "beam", "monte-carlo", "apex"];

pub struct Config {
    pub opponents: Vec<String>,
    /// Built-in board indices (`tools/sim/boards.cjs` order).
    pub boards: Vec<usize>,
    pub cycles: u32,
    pub max_rounds: i32,
    pub work: String,
    /// The run's root seed; every game's seed derives from it.
    pub seed: Seed,
    pub self_play: bool,
    pub pairs: Vec<(String, String)>,
    pub total: usize,
}

impl Config {
    pub fn new(opponents: &[String], boards: Vec<usize>, cycles: u32, max_rounds: i32, work: &str, seed: Seed, self_play: bool) -> Result<Config, String> {
        let mut ids: Vec<String> = Vec::new();
        for o in opponents {
            if !ids.contains(o) {
                ids.push(o.clone());
            }
        }
        if ids.is_empty() || ids.iter().any(|id| !OPPONENTS.contains(&id.as_str())) {
            return Err("Select at least one known opponent.".into());
        }
        let self_play = self_play || ids.len() == 1;
        if boards.is_empty() {
            return Err("Select at least one board.".into());
        }
        if !(1..=100000).contains(&cycles) {
            return Err("Cycles must be an integer from 1 to 100000.".into());
        }
        if !(0..=1000).contains(&max_rounds) {
            return Err("Round cap must be an integer from 0 to 1000.".into());
        }
        if !["fast", "standard", "deep"].contains(&work) {
            return Err("Search work must be fast, standard or deep.".into());
        }
        let mut pairs = Vec::new();
        for (i, a) in ids.iter().enumerate() {
            for b in &ids[if self_play { i } else { i + 1 }..] {
                pairs.push((a.clone(), b.clone()));
            }
        }
        let total = cycles as usize * boards.len() * pairs.len() * 2;
        if total > 1_000_000 {
            return Err("Limit each tournament to 1,000,000 games; reduce cycles or boards.".into());
        }
        Ok(Config { opponents: ids, boards, cycles, max_rounds, work: work.into(), seed, self_play, pairs, total })
    }
}

/// `AI_TOURNAMENT`'s per-fixture seed: SHA-256 of "<root hex>:cycle:map:pair".
pub fn seed_for(root: &Seed, cycle: u32, map: u32, pair: u32) -> Seed {
    Seed(sha256(format!("{}:{cycle}:{map}:{pair}", root.hex()).as_bytes()))
}

pub struct Fixture {
    pub index: usize,
    pub cycle: u32,
    /// Position in the selected boards, as the JavaScript `mapIndex`.
    pub map_index: usize,
    pub board: usize,
    pub seed: Seed,
    pub leg: usize,
    pub players: [String; 2],
}

/// `AI_TOURNAMENT.fixture` with two legs, one per seat order.
pub fn fixture(c: &Config, index: usize) -> Fixture {
    assert!(index < c.total, "Game index must be an integer from 0 to {}.", c.total - 1);
    let leg = index % 2;
    let mut n = index / 2;
    let pair = n % c.pairs.len();
    n /= c.pairs.len();
    let map = n % c.boards.len();
    let cycle = (n / c.boards.len()) as u32;
    let (a, b) = &c.pairs[pair];
    let players = if leg % 2 == 1 { [b.clone(), a.clone()] } else { [a.clone(), b.clone()] };
    Fixture { index, cycle, map_index: map, board: c.boards[map], seed: seed_for(&c.seed, cycle, map as u32, pair as u32), leg, players }
}

fn record(d: &Data, c: &Config, f: &Fixture, out: &Outcome, ms: f64) -> serde_json::Value {
    let commands: Vec<serde_json::Value> = out.commands.iter().map(|cmd| {
        let (name, args) = cmd.to_json();
        json!([name, args])
    }).collect();
    json!({
        "index": f.index, "board": f.board, "name": d.boards[f.board].name, "mapIndex": f.map_index, "cycle": f.cycle,
        "leg": f.leg, "seed": f.seed.hex(), "players": f.players, "maxRounds": c.max_rounds, "work": c.work,
        "winner": if out.winner < 0 { serde_json::Value::Null } else { json!(out.winner) },
        "reason": out.reason, "rounds": out.rounds, "halfTurns": out.half_turns,
        "hash": out.final_hash, "ms": ms, "thinkingMs": out.thinking_ms, "commands": commands,
    })
}

/// Plays every game of the tournament on `threads` threads and writes
/// `rust-run.json` and one `rust-games/BATCH/INDEX.json` per game.
pub fn run(d: &Data, c: &Config, threads: usize, dir: &Path) -> Result<(), String> {
    if dir.join("rust-run.json").exists() {
        return Err(format!("{} already holds a Rust tournament; choose a new --out directory", dir.display()));
    }
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let next = AtomicUsize::new(0);
    let done = AtomicUsize::new(0);
    let tally = Mutex::new((std::collections::BTreeMap::<String, [u32; 3]>::new(), [0u32; 3]));
    let started = Instant::now();
    std::thread::scope(|scope| {
        for _ in 0..threads {
            scope.spawn(|| loop {
                let i = next.fetch_add(1, Ordering::Relaxed);
                if i >= c.total {
                    return;
                }
                let f = fixture(c, i);
                let t = Instant::now();
                let out = play::play(d, f.board, &f.seed, [&f.players[0], &f.players[1]], c.max_rounds, &c.work);
                let ms = t.elapsed().as_secs_f64() * 1000.0;
                let path = dir.join("rust-games").join(format!("{:04}", i / 1000)).join(format!("{i:07}.json"));
                std::fs::create_dir_all(path.parent().unwrap()).expect("create the game directory");
                std::fs::write(&path, record(d, c, &f, &out, ms).to_string() + "\n").unwrap_or_else(|e| panic!("write {}: {e}", path.display()));
                {
                    let mut t = tally.lock().unwrap();
                    let seat = if out.winner < 0 { 2 } else { out.winner as usize };
                    t.1[seat] += 1;
                    for (side, id) in f.players.iter().enumerate() {
                        let row = t.0.entry(id.clone()).or_insert([0; 3]);
                        row[if out.winner < 0 { 2 } else if out.winner as usize == side { 0 } else { 1 }] += 1;
                    }
                }
                let n = done.fetch_add(1, Ordering::Relaxed) + 1;
                if n % 100 == 0 || n == c.total {
                    let s = started.elapsed().as_secs_f64();
                    eprintln!("{n}/{} games, {:.1} s, {:.2} games/s", c.total, s, n as f64 / s);
                }
            });
        }
    });
    let elapsed = started.elapsed().as_secs_f64();
    let (by_bot, by_seat) = tally.into_inner().unwrap();
    let summary = json!({
        "protocol": play::PROTOCOL, "opponents": c.opponents, "boards": c.boards, "cycles": c.cycles,
        "maxRounds": c.max_rounds, "work": c.work, "seed": c.seed.hex(), "selfPlay": c.self_play, "total": c.total,
        "threads": threads, "elapsedSeconds": elapsed,
        "wins": by_bot.iter().map(|(k, v)| (k.clone(), json!({"won": v[0], "lost": v[1], "drawn": v[2]}))).collect::<serde_json::Map<_, _>>(),
        "seats": {"union": by_seat[0], "xenon": by_seat[1], "drawn": by_seat[2]},
    });
    std::fs::write(dir.join("rust-run.json"), serde_json::to_string_pretty(&summary).unwrap() + "\n").map_err(|e| e.to_string())?;
    println!("{}", serde_json::to_string_pretty(&summary).unwrap());
    Ok(())
}
