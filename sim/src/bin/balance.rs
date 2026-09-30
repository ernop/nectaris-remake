//! balance --boards=LIST (--a=SPEC [--b=SPEC] | --pool=SPEC,SPEC,...)
//!     [--games=64] [--seed=TEXT] [--threads=N] [--work=standard] [--rounds=0]
//!   Measures map balance board by board. LIST holds board indices and
//!   ranges, as in `119-134,140`.
//!   Seat balance: with only --a (or --b equal to it), A plays itself `games`
//!   times per board, each game with its own dice, and the report gives
//!   Union's win rate with its 95% interval and how many of Xenon's wins came
//!   at the turn limit. With --pool, game g on a board seats pool member
//!   g mod n as Union and member (g / n) mod n as Xenon, so a multiple of n²
//!   games covers every ordered pair equally. Deterministic bots repeat the
//!   same game until dice intervene; a pool averages over several styles of
//!   play, so one bot's habits weigh less in the result.
//!   Skill: with a different --b, A and B play `games` seat-swapped pairs per
//!   board, and the report gives A's score as Union and as Xenon. A board
//!   rewards the stronger player when that player scores above one half from
//!   both seats.
//!   Specs are lab specs (`lab::make_player`). `--data=PATH` reads boards
//!   from another export in the sim/data/game-data.json format.

use nectaris_sim::data::Data;
use nectaris_sim::dice::Seed;
use nectaris_sim::{lab, play, tournament};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::Instant;

fn main() {
    if let Err(e) = run() {
        eprintln!("{e}");
        std::process::exit(1);
    }
}

/// One finished game: the winner (-1 for a round-cap draw), how it ended
/// and its length in rounds.
#[derive(Clone, Copy)]
struct Game {
    winner: i32,
    reason: &'static str,
    rounds: i32,
}

/// The 95% Wilson interval of `wins` out of `n`, as fractions.
fn wilson(wins: f64, n: f64) -> (f64, f64) {
    let (p, z) = (wins / n, 1.96f64);
    let centre = (p + z * z / (2.0 * n)) / (1.0 + z * z / n);
    let half = z * (p * (1.0 - p) / n + z * z / (4.0 * n * n)).sqrt() / (1.0 + z * z / n);
    (centre - half, centre + half)
}

fn parse_boards(list: &str, count: usize) -> Result<Vec<usize>, String> {
    let mut boards = Vec::new();
    for part in list.split(',') {
        let index = |s: &str| s.parse::<usize>().ok().filter(|&i| i < count).ok_or(format!("--boards: {s} is not a board index from 0 to {}", count - 1));
        match part.split_once('-') {
            Some((lo, hi)) => boards.extend(index(lo)?..=index(hi)?),
            None => boards.push(index(part)?),
        }
    }
    Ok(boards)
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
    let known = ["a", "b", "pool", "boards", "games", "seed", "threads", "work", "rounds", "data"];
    if let Some(k) = flags.keys().find(|k| !known.contains(&k.as_str())) {
        return Err(format!("Unknown option --{k}"));
    }
    let committed = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../sim/data/game-data.json");
    let data = Data::load(flags.get("data").map_or(committed.to_str().unwrap(), String::as_str));
    let pool: Vec<&str> = match (flags.get("pool"), flags.get("a")) {
        (Some(_), Some(_)) => return Err("Give --pool or --a, not both".into()),
        (Some(list), None) => list.split(',').collect(),
        (None, Some(a)) => vec![a.as_str()],
        (None, None) => return Err("--a=SPEC or --pool=SPEC,SPEC,... is required".into()),
    };
    let a = pool[0];
    let b = flags.get("b").map_or(a, String::as_str);
    if pool.len() > 1 && flags.contains_key("b") {
        return Err("--b applies to --a, not to --pool".into());
    }
    let work = flags.get("work").map_or("standard", String::as_str);
    for spec in pool.iter().chain([&b]) {
        lab::make_player(spec, work)?;
    }
    let boards = parse_boards(flags.get("boards").ok_or("--boards=LIST is required")?, data.boards.len())?;
    let whole = |k: &str, d: usize| -> Result<usize, String> { flags.get(k).map_or(Ok(d), |v| v.parse().map_err(|_| format!("--{k} must be a whole number"))) };
    let games = whole("games", 64)?;
    let rounds = whole("rounds", 0)? as i32;
    let threads = match flags.get("threads") {
        Some(v) => v.parse().map_err(|_| "--threads must be a whole number".to_string())?,
        None => std::thread::available_parallelism().map_err(|e| e.to_string())?.get(),
    };
    let seed = match flags.get("seed") {
        Some(text) => Seed::from_text(text),
        None => Seed::fresh(),
    };
    let skill = a != b;
    // A self-play game and its seat swap are the same game, so seat balance
    // plays one leg per dice seed; the skill test plays both.
    let legs = if skill { 2 } else { 1 };
    let jobs = boards.len() * games * legs;
    let results = Mutex::new(vec![None; jobs]);
    let next = AtomicUsize::new(0);
    let started = Instant::now();
    std::thread::scope(|scope| {
        for _ in 0..threads.clamp(1, jobs) {
            scope.spawn(|| loop {
                let job = next.fetch_add(1, Ordering::Relaxed);
                if job >= jobs {
                    return;
                }
                let (leg, game, board) = (job % legs, job / legs % games, job / legs / games);
                let seed = tournament::seed_for(&seed, game as u32, boards[board] as u32, 0);
                let n = pool.len();
                let specs = if skill {
                    if leg == 0 { [a, b] } else { [b, a] }
                } else {
                    [pool[game % n], pool[game / n % n]]
                };
                let mut players = [lab::make_player(specs[0], work).unwrap(), lab::make_player(specs[1], work).unwrap()];
                let r = play::play_with(&data, boards[board], &seed, &mut players, rounds);
                results.lock().unwrap()[job] = Some(Game { winner: r.winner, reason: r.reason, rounds: r.rounds });
            });
        }
    });
    let results: Vec<Game> = results.into_inner().unwrap().into_iter().map(|g| g.expect("every game was played")).collect();
    println!(
        "{} {} games per board on {} boards in {:.0} s; seed {}",
        if skill {
            format!("{a} against {b}:")
        } else if pool.len() > 1 {
            format!("pool {}:", pool.join(","))
        } else {
            format!("{a} self-play:")
        },
        games * legs,
        boards.len(),
        started.elapsed().as_secs_f64(),
        seed.hex()
    );
    let pct = |x: f64| format!("{:.0}%", 100.0 * x);
    if skill {
        println!("board  A as Union  A as Xenon  rounds  name");
    } else {
        println!("board  Union  interval    by camp  by elim  Xenon  by camp  by elim  at limit  draws  rounds  name");
    }
    let (mut inside, mut both) = (0, 0);
    for (i, &board) in boards.iter().enumerate() {
        let played = &results[i * games * legs..(i + 1) * games * legs];
        let rounds = played.iter().map(|g| f64::from(g.rounds)).sum::<f64>() / played.len() as f64;
        let name = &data.boards[board].name;
        if skill {
            // A's score from one seat: wins count 1 and round-cap draws half.
            let score = |leg: usize| {
                let seat = leg as i32;
                played.iter().skip(leg).step_by(2).map(|g| if g.winner < 0 { 0.5 } else if g.winner == seat { 1.0 } else { 0.0 }).sum::<f64>() / games as f64
            };
            let (union, xenon) = (score(0), score(1));
            if union > 0.5 && xenon > 0.5 {
                both += 1;
            }
            println!("{board:5}  {:>10}  {:>10}  {rounds:6.1}  {name}", pct(union), pct(xenon));
        } else {
            let count = |f: &dyn Fn(&Game) -> bool| played.iter().filter(|g| f(g)).count();
            let won = |side: i32, reason: &str| count(&|g| g.winner == side && g.reason == reason);
            let union = count(&|g| g.winner == 0);
            let xenon = count(&|g| g.winner == 1);
            let draws = count(&|g| g.winner < 0);
            let share = union as f64 / games as f64;
            if (0.4..=0.6).contains(&share) {
                inside += 1;
            }
            let (lo, hi) = wilson(union as f64, games as f64);
            if pool.len() > 1 {
                // Union wins by pairing, row = Union's bot, column = Xenon's.
                let n = pool.len();
                let mut wins = vec![0u32; n * n];
                let mut played_by = vec![0u32; n * n];
                for (g, game) in played.iter().enumerate() {
                    let cell = (g % n) * n + g / n % n;
                    played_by[cell] += 1;
                    wins[cell] += u32::from(game.winner == 0);
                }
                let rows: Vec<String> = (0..n).map(|r| (0..n).map(|c| format!("{}/{}", wins[r * n + c], played_by[r * n + c])).collect::<Vec<_>>().join(" ")).collect();
                println!("pairs {board} {}", rows.join(" | "));
            }
            println!(
                "{board:5}  {:>5}  [{:>3}, {:>3}]  {:7}  {:7}  {xenon:5}  {:7}  {:7}  {:8}  {draws:5}  {rounds:6.1}  {name}",
                pct(share),
                format!("{:.0}", 100.0 * lo),
                format!("{:.0}", 100.0 * hi),
                won(0, "base"),
                won(0, "elimination"),
                won(1, "base"),
                won(1, "elimination"),
                won(1, "turnlimit")
            );
        }
    }
    if skill {
        println!("A scored above one half from both seats on {both} of {} boards.", boards.len());
    } else {
        println!("Union won 40-60% of games on {inside} of {} boards.", boards.len());
    }
    Ok(())
}
