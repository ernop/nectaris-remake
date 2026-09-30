//! The bot laboratory: head-to-head matches between any two player specs, on
//! every thread, with both seats on every board and a shared dice seed per
//! pair of legs (the tournament's fixture design). A spec is a bot id, or
//! `greedy:name=value,...` for the greedy planner with its scoring weights
//! changed (see `model::Weights`), or `marshal:name=value,...`.

use crate::data::Data;
use crate::dice::Seed;
use crate::model::{Profile, Weights};
use crate::play::{self, Player};
use crate::tournament;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;

/// Weights for both seats: `name=v` sets both seats' whole game, `u.name=v`
/// Union's (side 0), `x.name=v` Xenon's (side 1); `u.e.name` / `u.l.name`
/// (or `x.`) set only the early or the late end.
pub fn parse_seat_weights(base: [Profile; 2], text: &str) -> Result<[Profile; 2], String> {
    let mut w = base;
    for part in text.split(',').filter(|p| !p.is_empty()) {
        let (k, v) = part.split_once('=').ok_or(format!("{part}: expected name=value"))?;
        let mut path: Vec<&str> = k.split('.').collect();
        let name = path.pop().unwrap();
        let seats: Vec<usize> = match path.first() {
            Some(&"u") => vec![0],
            Some(&"x") => vec![1],
            None => vec![0, 1],
            Some(other) => return Err(format!("{part}: unknown seat {other}")),
        };
        let (early, late) = match path.get(1) {
            Some(&"e") => (true, false),
            Some(&"l") => (false, true),
            None => (true, true),
            Some(other) => return Err(format!("{part}: unknown end {other}")),
        };
        for s in seats {
            if early {
                apply_weight(&mut w[s].early, name, v)?;
            }
            if late {
                apply_weight(&mut w[s].late, name, v)?;
            }
        }
    }
    Ok(w)
}

fn apply_weight(w: &mut Weights, k: &str, v: &str) -> Result<(), String> {
    let v: f64 = v.parse().map_err(|_| format!("{k}={v}: the value is not a number"))?;
    {
        match k {
            "danger" => w.danger = v,
            "danger_scale" => w.danger_scale = v,
            "advance" => w.advance = v,
            "terrain" => w.terrain = v,
            "support" => w.support = v,
            "move_cost" => w.move_cost = v,
            "trade_out" => w.trade_out = v,
            "trade_in" => w.trade_in = v,
            "kill" => w.kill = v,
            "death" => w.death = v,
            "base_worth" => w.base_worth = v,
            "hunt_worth" => w.hunt_worth = v,
            other => return Err(format!("Unknown weight {other}")),
        }
    }
    Ok(())
}

/// A search bot (`id`, its `work` level) scoring with its own weights per seat.
struct Weighted(crate::search::Config);
impl Player for Weighted {
    fn play_turn(&mut self, game: &mut crate::game::Game, side: i32) {
        crate::search::play_turn_with(game, side, &self.0);
    }
}

fn weighted(id: &str, work: &str, base: [Profile; 2], text: &str) -> Result<Box<dyn Player>, String> {
    let mut c = crate::search::config(id, work);
    c.weights = Some(parse_seat_weights(base, text)?);
    Ok(Box::new(Weighted(c)))
}

/// `SPEC/fast|standard|deep` overrides the run's search work for that spec.
pub fn make_player(spec: &str, work: &str) -> Result<Box<dyn Player>, String> {
    let (spec, work) = spec.rsplit_once('/').unwrap_or((spec, work));
    let (id, rest) = spec.split_once(':').unwrap_or((spec, ""));
    match id {
        "greedy" => weighted("tactical", work, [Profile::SHIPPED; 2], rest),
        "beam-w" => weighted("beam", work, [Profile::SHIPPED; 2], rest),
        "apex-w" => weighted("apex", work, [Profile::SHIPPED; 2], rest),
        "mc-w" => weighted("monte-carlo", work, [Profile::SHIPPED; 2], rest),
        "marshal-w" => weighted("marshal", work, crate::marshal::SEAT_PROFILES, rest),
        "classic" | "tactical" | "beam" | "monte-carlo" | "apex" | "marshal" if rest.is_empty() => Ok(play::bot(id, work)),
        other => Err(format!("Unknown player spec {other}")),
    }
}

#[derive(Default, Clone, Debug)]
pub struct Score {
    /// Wins of the first spec as Union (side 0) and as Xenon (side 1).
    pub a_wins: [u32; 2],
    pub b_wins: [u32; 2],
    pub draws: u32,
    pub games: u32,
    pub base: u32,
    pub elimination: u32,
    /// Draws by the engine's rules; the other draws are round caps.
    pub no_progress: u32,
    pub turnlimit: u32,
    pub rounds: u64,
    /// One entry per board, in the order given.
    pub by_board: Vec<BoardTally>,
}

/// Outcomes of the seat-swapped pairs on one board. A pair is two games with
/// the same dice, each spec playing each seat once. `a_sweeps` and `b_sweeps`
/// carry skill information; `union_both` and `xenon_both` are pairs the seat
/// decided, which says nothing about the two specs.
#[derive(Default, Clone, Copy, Debug)]
pub struct BoardTally {
    pub pairs: u32,
    pub a_sweeps: u32,
    pub b_sweeps: u32,
    pub union_both: u32,
    pub xenon_both: u32,
    pub other: u32,
    pub rounds: u64,
    /// Games without a winner, whatever the reason.
    pub draws: u32,
}
impl Score {
    pub fn a_total(&self) -> u32 {
        self.a_wins[0] + self.a_wins[1]
    }
    pub fn b_total(&self) -> u32 {
        self.b_wins[0] + self.b_wins[1]
    }
    /// A's score fraction (draws count half) and the 95% Wilson interval.
    pub fn rate(&self) -> (f64, f64, f64) {
        let n = f64::from(self.games);
        let p = (f64::from(self.a_total()) + 0.5 * f64::from(self.draws)) / n;
        let z = 1.96f64;
        let centre = (p + z * z / (2.0 * n)) / (1.0 + z * z / n);
        let half = z * (p * (1.0 - p) / n + z * z / (4.0 * n * n)).sqrt() / (1.0 + z * z / n);
        (p, centre - half, centre + half)
    }
}

/// Plays `cycles` × `boards` × two seat orders between two specs.
pub fn run_match(d: &Data, a: &str, b: &str, boards: &[usize], cycles: u32, root: &Seed, threads: usize, work: &str, max_rounds: i32) -> Result<Score, String> {
    make_player(a, work)?;
    make_player(b, work)?;
    let total = boards.len() * cycles as usize * 2;
    let next = AtomicUsize::new(0);
    let score = Mutex::new(Score::default());
    // Winning seat (or -1) and rounds of every game by index.
    let results = Mutex::new(vec![(-1i32, 0i32); total]);
    std::thread::scope(|scope| {
        for _ in 0..threads.max(1) {
            scope.spawn(|| loop {
                let k = next.fetch_add(1, Ordering::Relaxed);
                if k >= total {
                    return;
                }
                let leg = k % 2;
                let n = k / 2;
                let map = n % boards.len();
                let cycle = (n / boards.len()) as u32;
                let seed = tournament::seed_for(root, cycle, map as u32, 0);
                let specs = if leg == 0 { [a, b] } else { [b, a] };
                let mut players = [make_player(specs[0], work).unwrap(), make_player(specs[1], work).unwrap()];
                let out = play::play_with(d, boards[map], &seed, &mut players, max_rounds);
                results.lock().unwrap()[k] = (out.winner, out.rounds);
                let mut s = score.lock().unwrap();
                s.games += 1;
                s.rounds += out.rounds as u64;
                match out.reason {
                    "base" => s.base += 1,
                    "elimination" => s.elimination += 1,
                    "no-progress" => s.no_progress += 1,
                    "turnlimit" => s.turnlimit += 1,
                    _ => {}
                }
                if out.winner < 0 {
                    s.draws += 1;
                } else {
                    // Seat `winner` of this game was spec `specs[winner]`.
                    let a_won = (out.winner as usize == 0) == (leg == 0);
                    if a_won {
                        s.a_wins[out.winner as usize] += 1;
                    } else {
                        s.b_wins[out.winner as usize] += 1;
                    }
                }
            });
        }
    });
    let mut score = score.into_inner().unwrap();
    let results = results.into_inner().unwrap();
    score.by_board = vec![BoardTally::default(); boards.len()];
    for n in 0..total / 2 {
        let (w0, r0) = results[2 * n];
        let (w1, r1) = results[2 * n + 1];
        let t = &mut score.by_board[n % boards.len()];
        t.pairs += 1;
        t.rounds += (r0 + r1) as u64;
        t.draws += u32::from(w0 < 0) + u32::from(w1 < 0);
        // Leg 0 seats a as Union, leg 1 seats a as Xenon.
        match (w0, w1) {
            (0, 1) => t.a_sweeps += 1,
            (1, 0) => t.b_sweeps += 1,
            (0, 0) => t.union_both += 1,
            (1, 1) => t.xenon_both += 1,
            _ => t.other += 1,
        }
    }
    Ok(score)
}
