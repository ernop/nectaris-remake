//! Match verdicts: is player A at least `elo1` stronger than player B, or no
//! stronger than `elo0`? Games come in seat-swapped pairs on the same board
//! with the same dice (the lab's pairing), and each pair is one observation:
//! A's average score over its two games, 0, 1/4, 1/2, 3/4 or 1. Scoring pairs
//! rather than games cancels the seat advantage (Xenon wins most bot games
//! through the turn limit). A sequential probability ratio test on the pair
//! scores (the pentanomial test chess-engine testing uses) stops as soon as
//! either answer is reached at the chosen error rates, so a clear difference
//! needs few games and a close one gets as many as it takes.

use crate::data::Data;
use crate::dice::Seed;
use crate::lab;
use crate::play;
use crate::tournament;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;

/// Pairs are played and judged in batches of this many, whatever the thread
/// count, so a seed always stops at the same pair.
pub const BATCH: usize = 32;
/// No verdict before this many pairs: the test's normal approximation needs a
/// sample large enough to estimate the pair scores' variance.
pub const MIN_PAIRS: usize = 2 * BATCH;

/// The expected score of a player `elo` points stronger.
pub fn score_of(elo: f64) -> f64 {
    1.0 / (1.0 + 10f64.powf(-elo / 400.0))
}

/// The Elo difference behind an expected score.
pub fn elo_of(score: f64) -> f64 {
    -400.0 * (1.0 / score - 1.0).log10()
}

/// Pair outcomes and per-seat details, from A's side.
#[derive(Clone, Debug, Default)]
pub struct Tally {
    /// Pairs by A's two-game score in half points: 0 (lost both) to 4.
    pub pairs: [u32; 5],
    /// A's wins, draws and losses as Union and as Xenon.
    pub union: [u32; 3],
    pub xenon: [u32; 3],
    /// How games ended: base capture, elimination, turn limit, round cap.
    pub ends: [u32; 4],
    pub rounds: u64,
}

impl Tally {
    pub fn count(&self) -> u32 {
        self.pairs.iter().sum()
    }
    /// Mean pair score and its variance, with empty bins held at a
    /// thousandth of a pair so a run of identical pairs has a variance.
    fn moments(&self) -> (f64, f64, f64) {
        let bins: Vec<f64> = self.pairs.iter().map(|&c| f64::from(c).max(1e-3)).collect();
        let n: f64 = bins.iter().sum();
        let mean = bins.iter().enumerate().map(|(i, c)| c * i as f64 / 4.0).sum::<f64>() / n;
        let var = bins.iter().enumerate().map(|(i, c)| c * (i as f64 / 4.0 - mean).powi(2)).sum::<f64>() / n;
        (n, mean, var)
    }
    /// A's Elo edge over B with its 95% range, from the pair scores.
    pub fn elo(&self) -> (f64, f64, f64) {
        let (n, mean, var) = self.moments();
        let half = 1.96 * (var / n).sqrt();
        let clamp = |s: f64| s.clamp(1e-6, 1.0 - 1e-6);
        (elo_of(clamp(mean)), elo_of(clamp(mean - half)), elo_of(clamp(mean + half)))
    }
    /// The log-likelihood ratio of "A is `elo1` stronger" against "A is
    /// `elo0` stronger", in the normal approximation of the generalized SPRT.
    pub fn llr(&self, elo0: f64, elo1: f64) -> f64 {
        let (n, mean, var) = self.moments();
        let (s0, s1) = (score_of(elo0), score_of(elo1));
        n * (s1 - s0) * (2.0 * mean - s0 - s1) / (2.0 * var)
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Outcome {
    /// A is at least `elo1` stronger (H1 accepted).
    Stronger,
    /// A is at most `elo0` stronger (H0 accepted).
    NotStronger,
    /// The pair limit came first.
    Undecided,
}

pub struct Test {
    pub elo0: f64,
    pub elo1: f64,
    pub alpha: f64,
    pub beta: f64,
    pub max_pairs: usize,
}

impl Test {
    /// The stopping bounds: accept H0 at or below the first, H1 at or above
    /// the second.
    pub fn bounds(&self) -> (f64, f64) {
        ((self.beta / (1.0 - self.alpha)).ln(), ((1.0 - self.beta) / self.alpha).ln())
    }
    fn judge(&self, t: &Tally) -> Option<Outcome> {
        if (t.count() as usize) < MIN_PAIRS {
            return None;
        }
        let (lo, hi) = self.bounds();
        let llr = t.llr(self.elo0, self.elo1);
        if llr >= hi {
            Some(Outcome::Stronger)
        } else if llr <= lo {
            Some(Outcome::NotStronger)
        } else if t.count() as usize >= self.max_pairs {
            Some(Outcome::Undecided)
        } else {
            None
        }
    }
}

/// One pair on board index `map` of `boards` in cycle `cycle`: A as Union,
/// then A as Xenon, with the lab's shared dice seed for the pair.
fn play_pair(d: &Data, a: &str, b: &str, board: usize, seed: &Seed, work: &str, max_rounds: i32) -> [(i32, &'static str, i32); 2] {
    let mut out = [(0, "", 0); 2];
    for (leg, specs) in [[a, b], [b, a]].into_iter().enumerate() {
        let mut players = [lab::make_player(specs[0], work).unwrap(), lab::make_player(specs[1], work).unwrap()];
        let r = play::play_with(d, board, seed, &mut players, max_rounds);
        // A's result: 2 a win, 1 a draw, 0 a loss.
        let a_seat = leg as i32;
        let result = if r.winner < 0 { 1 } else if r.winner == a_seat { 2 } else { 0 };
        out[leg] = (result, r.reason, r.rounds);
    }
    out
}

/// Plays pairs until the test decides, calling `progress` after every batch.
pub fn run(
    d: &Data,
    a: &str,
    b: &str,
    boards: &[usize],
    root: &Seed,
    threads: usize,
    work: &str,
    max_rounds: i32,
    test: &Test,
    mut progress: impl FnMut(&Tally),
) -> Result<(Tally, Outcome), String> {
    lab::make_player(a, work)?;
    lab::make_player(b, work)?;
    if boards.is_empty() {
        return Err("Name at least one board".into());
    }
    let mut tally = Tally::default();
    let mut first = 0usize;
    loop {
        let batch: Vec<usize> = (first..first + BATCH).collect();
        let results = Mutex::new(vec![None; BATCH]);
        let next = AtomicUsize::new(0);
        std::thread::scope(|scope| {
            for _ in 0..threads.clamp(1, BATCH) {
                scope.spawn(|| loop {
                    let i = next.fetch_add(1, Ordering::Relaxed);
                    if i >= BATCH {
                        return;
                    }
                    let n = batch[i];
                    let map = n % boards.len();
                    let cycle = (n / boards.len()) as u32;
                    let seed = tournament::seed_for(root, cycle, map as u32, 0);
                    let pair = play_pair(d, a, b, boards[map], &seed, work, max_rounds);
                    results.lock().unwrap()[i] = Some(pair);
                });
            }
        });
        for pair in results.into_inner().unwrap() {
            let pair = pair.expect("every pair of the batch was played");
            tally.pairs[(pair[0].0 + pair[1].0) as usize] += 1;
            for (leg, &(result, reason, rounds)) in pair.iter().enumerate() {
                let seat = if leg == 0 { &mut tally.union } else { &mut tally.xenon };
                seat[2 - result as usize] += 1;
                tally.ends[match reason {
                    "base" => 0,
                    "elimination" => 1,
                    "turnlimit" => 2,
                    _ => 3,
                }] += 1;
                tally.rounds += rounds as u64;
            }
        }
        progress(&tally);
        if let Some(outcome) = test.judge(&tally) {
            return Ok((tally, outcome));
        }
        first += BATCH;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn elo_and_score_are_inverse() {
        assert!((score_of(0.0) - 0.5).abs() < 1e-12);
        for e in [-300.0, -20.0, 0.0, 35.0, 400.0] {
            assert!((elo_of(score_of(e)) - e).abs() < 1e-9);
        }
    }

    #[test]
    fn llr_leans_with_the_evidence() {
        let even = Tally { pairs: [10, 20, 40, 20, 10], ..Tally::default() };
        let ahead = Tally { pairs: [5, 15, 40, 25, 15], ..Tally::default() };
        assert!(even.llr(0.0, 20.0) < 0.0, "an even result favours no gain");
        assert!(ahead.llr(0.0, 20.0) > 0.0, "a clear lead favours a gain");
        assert!(ahead.llr(0.0, 20.0) > even.llr(0.0, 20.0));
        let (e, lo, hi) = even.elo();
        assert!(e.abs() < 1e-9 && lo < 0.0 && hi > 0.0);
    }

    #[test]
    fn bounds_match_the_error_rates() {
        let t = Test { elo0: 0.0, elo1: 20.0, alpha: 0.05, beta: 0.05, max_pairs: 1000 };
        let (lo, hi) = t.bounds();
        assert!((lo + 2.944).abs() < 1e-3 && (hi - 2.944).abs() < 1e-3);
    }
}
