//! The bot laboratory: head-to-head matches between any two player specs, on
//! every thread, with both seats on every board and a shared dice seed per
//! pair of legs (the tournament's fixture design). A spec is a bot id, or
//! `greedy:name=value,...` for the greedy planner with its scoring weights
//! changed (see `model::Weights`), or `marshal:name=value,...`.

use crate::data::Data;
use crate::dice::Seed;
use crate::model::Weights;
use crate::play::{self, Player};
use crate::tournament;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;

/// Weights for both seats: `name=v` sets both, `u.name=v` Union's (side 0),
/// `x.name=v` Xenon's (side 1).
pub fn parse_seat_weights(text: &str) -> Result<[Weights; 2], String> {
    let mut w = [Weights::SHIPPED; 2];
    for part in text.split(',').filter(|p| !p.is_empty()) {
        let (k, v) = part.split_once('=').ok_or(format!("{part}: expected name=value"))?;
        match k.split_once('.') {
            Some(("u", name)) => apply_weight(&mut w[0], name, v)?,
            Some(("x", name)) => apply_weight(&mut w[1], name, v)?,
            _ => {
                apply_weight(&mut w[0], k, v)?;
                apply_weight(&mut w[1], k, v)?;
            }
        }
    }
    Ok(w)
}

pub fn parse_weights(text: &str) -> Result<Weights, String> {
    let both = parse_seat_weights(text)?;
    Ok(both[0])
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
struct Weighted {
    id: &'static str,
    work: String,
    w: [Weights; 2],
}
impl Player for Weighted {
    fn play_turn(&mut self, game: &mut crate::game::Game, side: i32) {
        let before = crate::model::set_weights(self.w[side as usize]);
        crate::search::play_turn(game, side, self.id, &self.work);
        crate::model::set_weights(before);
    }
}

pub fn make_player(spec: &str, work: &str) -> Result<Box<dyn Player>, String> {
    let (id, rest) = spec.split_once(':').unwrap_or((spec, ""));
    match id {
        "greedy" => Ok(Box::new(Weighted { id: "tactical", work: work.into(), w: parse_seat_weights(rest)? })),
        "beam-w" => Ok(Box::new(Weighted { id: "beam", work: work.into(), w: parse_seat_weights(rest)? })),
        "apex-w" => Ok(Box::new(Weighted { id: "apex", work: work.into(), w: parse_seat_weights(rest)? })),
        "mc-w" => Ok(Box::new(Weighted { id: "monte-carlo", work: work.into(), w: parse_seat_weights(rest)? })),
        "marshal" => crate::marshal::player(rest),
        "classic" | "tactical" | "beam" | "monte-carlo" | "apex" if rest.is_empty() => Ok(play::bot(id, work)),
        other => Err(format!("Unknown player spec {other}")),
    }
}

#[derive(Default, Clone, Copy, Debug)]
pub struct Score {
    /// Wins of the first spec as Union (side 0) and as Xenon (side 1).
    pub a_wins: [u32; 2],
    pub b_wins: [u32; 2],
    pub draws: u32,
    pub games: u32,
    pub base: u32,
    pub elimination: u32,
    pub turnlimit: u32,
    pub rounds: u64,
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
                let mut s = score.lock().unwrap();
                s.games += 1;
                s.rounds += out.rounds as u64;
                match out.reason {
                    "base" => s.base += 1,
                    "elimination" => s.elimination += 1,
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
    Ok(score.into_inner().unwrap())
}
