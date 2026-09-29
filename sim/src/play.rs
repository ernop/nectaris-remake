//! Players and the game loop. The engine (`game.rs`) is the platform: any
//! controller drives it through its commands. A `Player` plays whole turns
//! through the recording methods (`Game::do_*`); a `StepPlayer` picks one
//! command at a time from `Game::legal_commands`, the same list JavaScript's
//! `Game.legalCommands()` gives. `play` is `AI_TOURNAMENT.play` with normal
//! openings.
//!
//! Players here must stay in lockstep with the browser game: a bot exists in
//! both languages and decides identically (agents.md, behaviour lock).

use crate::classic;
use crate::data::Data;
use crate::dice::Seed;
use crate::game::{Command, Game};
use crate::hash;
use crate::rng::Rng;
use crate::search;
use std::time::Instant;

/// `AI_TOURNAMENT.version` this port implements. A corpus recorded under
/// another protocol is refused.
pub const PROTOCOL: &str = "2026-09-28.1";

/// A controller for one side: plays a whole turn through the engine's
/// recording commands and returns without ending the turn.
pub trait Player {
    fn play_turn(&mut self, game: &mut Game, side: i32);
}

/// A controller that picks one legal command at a time.
pub trait StepPlayer {
    /// An index into `legal`, every entry of which the engine accepts now.
    /// Choosing `Command::EndTurn` ends the turn.
    fn choose(&mut self, game: &Game, legal: &[Command]) -> usize;
}

/// Runs a step player's turn: ask, apply, until it ends the turn or the game
/// is decided.
pub fn play_steps(player: &mut dyn StepPlayer, game: &mut Game, side: i32) {
    while game.winner < 0 && game.current == side {
        let legal = game.legal_commands();
        let i = player.choose(game, &legal);
        assert!(i < legal.len(), "a step player chose command {i} of {}", legal.len());
        if legal[i] == Command::EndTurn {
            return;
        }
        game.do_command(&legal[i]);
    }
}

/// A step player used as a whole-turn player.
pub struct Steps<T: StepPlayer>(pub T);
impl<T: StepPlayer> Player for Steps<T> {
    fn play_turn(&mut self, game: &mut Game, side: i32) {
        play_steps(&mut self.0, game, side);
    }
}

pub struct Classic;
impl Player for Classic {
    fn play_turn(&mut self, game: &mut Game, side: i32) {
        classic::play_turn(game, side);
    }
}

/// Tactical, Sequence, Simulation or Apex at a work level.
pub struct Search {
    pub id: String,
    pub work: String,
}
impl Player for Search {
    fn play_turn(&mut self, game: &mut Game, side: i32) {
        search::play_turn(game, side, &self.id, &self.work);
    }
}

/// The bots the browser game offers, by tournament id.
pub fn bot(id: &str, work: &str) -> Box<dyn Player> {
    match id {
        "classic" => Box::new(Classic),
        "tactical" | "beam" | "monte-carlo" | "apex" => Box::new(Search { id: id.into(), work: work.into() }),
        other => panic!("Unknown AI opponent: {other}"),
    }
}

/// Uniform choice from the legal list with its own seeded generator; the
/// playout benchmark's player, identical in tools/sim/playout-bench.cjs.
pub struct Random(pub Rng);
impl StepPlayer for Random {
    fn choose(&mut self, _game: &Game, legal: &[Command]) -> usize {
        (self.0.next() * legal.len() as f64).floor() as usize
    }
}

/// One random game (tools/sim/playout.cjs): game `k`'s seed is
/// (k+1) * 0x9e3779b1 XOR `seed`, stretched into the dice's 256-bit seed.
/// Returns the final fingerprint and the number of commands.
pub fn random_game(d: &Data, board: usize, k: usize, seed: u32) -> (u32, usize) {
    let game_seed = (k as u32 + 1).wrapping_mul(0x9e37_79b1) ^ seed;
    let mut g = Game::new(d, board, &Seed::from_text(&game_seed.to_string()), 0);
    let mut player = Random(Rng::new(game_seed ^ 0x9e37_79b9));
    let mut n = 0;
    while g.winner < 0 {
        let legal = g.legal_commands();
        let i = player.choose(&g, &legal);
        g.do_command(&legal[i]);
        n += 1;
    }
    (hash::state_hash(&g), n)
}

/// FNV-1a over "hash,commands\n" per game, in game order.
pub fn playout_fingerprint(results: &[(u32, usize)]) -> u32 {
    let mut h = 2_166_136_261u32;
    for (hash, n) in results {
        for b in format!("{hash},{n}\n").bytes() {
            h = (h ^ u32::from(b)).wrapping_mul(16_777_619);
        }
    }
    h
}

pub struct Outcome {
    pub commands: Vec<Command>,
    /// -1 when the round cap ended the game.
    pub winner: i32,
    pub reason: &'static str,
    pub rounds: i32,
    pub half_turns: i32,
    /// `tools/sim/state-hash.cjs` fingerprint of the final position.
    pub final_hash: u32,
    pub thinking_ms: [f64; 2],
}

/// Plays a game between two players until a side wins, the board's turn
/// limit passes or the round cap (0 for none) is reached.
pub fn play_with(d: &Data, board: usize, seed: &Seed, players: &mut [Box<dyn Player>; 2], max_rounds: i32) -> Outcome {
    let mut g = Game::new(d, board, seed, 0);
    g.log = Some(Vec::new());
    let mut turns = 0;
    let mut thinking = [0.0f64; 2];
    while g.winner < 0 {
        let side = g.current;
        let started = Instant::now();
        players[side as usize].play_turn(&mut g, side);
        thinking[side as usize] += started.elapsed().as_secs_f64() * 1000.0;
        turns += 1;
        if g.winner >= 0 {
            break;
        }
        // The laboratory round cap is a draw, not the board's timeout rule.
        if max_rounds > 0 && g.turn >= max_rounds && side != g.first && g.turn < g.turn_limit {
            break;
        }
        g.do_end_turn();
        assert!(turns <= 2 * g.turn_limit + 2, "Tournament game exceeded the engine turn budget.");
    }
    Outcome {
        commands: g.log.take().unwrap(),
        winner: g.winner,
        reason: if g.winner < 0 { "round-cap" } else { g.reason },
        rounds: g.turn.min(g.turn_limit),
        half_turns: turns,
        final_hash: hash::state_hash(&g),
        thinking_ms: thinking,
    }
}

/// A tournament game between two bots by id.
pub fn play(d: &Data, board: usize, seed: &Seed, players: [&str; 2], max_rounds: i32, work: &str) -> Outcome {
    let mut p = [bot(players[0], work), bot(players[1], work)];
    play_with(d, board, seed, &mut p, max_rounds)
}
