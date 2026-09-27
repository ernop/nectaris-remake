//! nectaris-sim replay [CORPUS]
//!   Checks the math port against V8's fingerprint, then replays every corpus
//!   game from its board and seed and compares the state fingerprint after
//!   every command with the recorded one.
//! nectaris-sim decide [CORPUS]
//!   Plays every corpus game again with its bots from its board and seed and
//!   compares every command they choose with the recorded one.
//! nectaris-sim bench [CORPUS]
//!   Times the rules alone: replays every game without per-command
//!   fingerprints, checking only each game's final state.

use nectaris_sim::{corpus, data::Data, fdlibm, game::Game, hash, play};
use std::path::PathBuf;
use std::time::Instant;

fn repo() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..")
}

fn replay(path: &str) -> bool {
    let data = Data::load(repo().join("sim/data/game-data.json").to_str().unwrap());
    let m = &data.math;
    let (log, tanh) = fdlibm::fingerprint(m.samples, m.seed);
    if (log, tanh) != (m.log, m.tanh) {
        println!("Math.log/Math.tanh port differs from V8: log {log} (V8 {}), tanh {tanh} (V8 {})", m.log, m.tanh);
        return false;
    }
    println!("log and tanh match V8 on {} generated inputs", m.samples);
    let corpus = corpus::load(path);
    let started = Instant::now();
    let (mut commands, mut failed) = (0usize, 0usize);
    for (n, game) in corpus.games.iter().enumerate() {
        assert_eq!(data.boards[game.board].name, game.name, "board {} is not {}", game.board, game.name);
        let mut g = Game::new(&data, game.board, game.seed, 0);
        let mut problem = None;
        if hash::state_hash(&g) != game.hashes[0] {
            problem = Some(format!("starts differently:\n  {}", hash::state_text(&g)));
        }
        for (i, (name, args)) in game.commands.iter().enumerate() {
            if problem.is_some() {
                break;
            }
            if let Err(e) = corpus::apply(&mut g, name, args) {
                problem = Some(format!("command {i} {name} {args:?} failed: {e}"));
                break;
            }
            commands += 1;
            if hash::state_hash(&g) != game.hashes[i + 1] {
                problem = Some(format!("differs after command {i} {name} {args:?}:\n  {}", hash::state_text(&g)));
            }
        }
        if let Some(p) = problem {
            failed += 1;
            println!("game {n} ({}, {}): {p}", game.name, game.players.join(" v "));
        }
    }
    println!(
        "{} games, {} commands replayed in {:.1} ms; {}",
        corpus.games.len(),
        commands,
        started.elapsed().as_secs_f64() * 1000.0,
        if failed == 0 { "every state matches".to_string() } else { format!("{failed} games DIFFER") }
    );
    failed == 0
}

fn decide(path: &str) -> bool {
    let data = Data::load(repo().join("sim/data/game-data.json").to_str().unwrap());
    let corpus = corpus::load(path);
    let started = Instant::now();
    let mut failed = 0;
    for (n, game) in corpus.games.iter().enumerate() {
        let t = Instant::now();
        let players = [game.players[0].as_str(), game.players[1].as_str()];
        let out = play::play(&data, game.board, game.seed, players, game.max_rounds, &game.work);
        let got: Vec<(String, Vec<serde_json::Value>)> = out.commands.iter().map(|c| c.to_json()).collect();
        let first = (0..got.len().max(game.commands.len())).find(|&i| got.get(i) != game.commands.get(i));
        let label = format!("game {n} ({}, {}, seed {})", game.name, game.players.join(" v "), game.seed);
        match first {
            Some(i) => {
                failed += 1;
                let show = |c: Option<&(String, Vec<serde_json::Value>)>| c.map_or("(none)".to_string(), |(name, args)| format!("{name} {}", serde_json::Value::from(args.clone())));
                println!("{label}: command {i} of {} chose {}, recorded {}", game.commands.len(), show(got.get(i)), show(game.commands.get(i)));
                for j in i.saturating_sub(3)..i {
                    println!("    before: {j} {}", show(game.commands.get(j)));
                }
            }
            None => {
                let winner = if out.winner < 0 { None } else { Some(out.winner) };
                if winner != game.winner || out.reason != game.reason || out.rounds != game.rounds {
                    failed += 1;
                    println!("{label}: same commands but ended {winner:?} {} round {} (recorded {:?} {} round {})", out.reason, out.rounds, game.winner, game.reason, game.rounds);
                } else {
                    println!("{label}: {} commands match in {:.2} s", got.len(), t.elapsed().as_secs_f64());
                }
            }
        }
    }
    println!(
        "{} games played in {:.1} s; {}",
        corpus.games.len(),
        started.elapsed().as_secs_f64(),
        if failed == 0 { "every command matches".to_string() } else { format!("{failed} games DIFFER") }
    );
    failed == 0
}

fn bench(path: &str) -> bool {
    let data = Data::load(repo().join("sim/data/game-data.json").to_str().unwrap());
    let corpus = corpus::load(path);
    let commands: usize = corpus.games.iter().map(|g| g.commands.len()).sum();
    let mut best = f64::INFINITY;
    for _ in 0..5 {
        let started = Instant::now();
        for (n, game) in corpus.games.iter().enumerate() {
            let mut g = Game::new(&data, game.board, game.seed, 0);
            for (name, args) in &game.commands {
                corpus::apply(&mut g, name, args).unwrap_or_else(|e| panic!("game {n}: {name} {args:?} failed: {e}"));
            }
            if hash::state_hash(&g) != *game.hashes.last().unwrap() {
                println!("game {n} ({}) ends in a different state", game.name);
                return false;
            }
        }
        best = best.min(started.elapsed().as_secs_f64());
    }
    println!(
        "{} games, {commands} commands: best of 5 passes {:.1} ms, {:.2} µs per command",
        corpus.games.len(),
        best * 1000.0,
        best * 1e6 / commands as f64
    );
    true
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let default = repo().join("test/fixtures/sim-corpus.json.gz");
    let path = args.get(2).map(String::as_str).unwrap_or(default.to_str().unwrap());
    let ok = match args.get(1).map(String::as_str) {
        Some("replay") => replay(path),
        Some("decide") => decide(path),
        Some("bench") => bench(path),
        _ => {
            eprintln!("usage: nectaris-sim replay|decide|bench [CORPUS]");
            false
        }
    };
    std::process::exit(if ok { 0 } else { 1 });
}
