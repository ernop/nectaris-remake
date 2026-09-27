//! `AI_TOURNAMENT.play` with normal openings: bots alternate half-turns until
//! a side wins, the board's turn limit passes or the round cap is reached.

use crate::classic;
use crate::data::Data;
use crate::game::{Command, Game};
use crate::search;

pub struct Outcome {
    pub commands: Vec<Command>,
    /// -1 when the round cap ended the game.
    pub winner: i32,
    pub reason: &'static str,
    pub rounds: i32,
    pub half_turns: i32,
}

pub fn play(d: &Data, board: usize, seed: u32, players: [&str; 2], max_rounds: i32, work: &str) -> Outcome {
    let mut g = Game::new(d, board, seed, 0);
    g.log = Some(Vec::new());
    let mut turns = 0;
    while g.winner < 0 {
        let side = g.current;
        match players[side as usize] {
            "classic" => classic::play_turn(&mut g, side),
            id => search::play_turn(&mut g, side, id, work),
        }
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
    }
}
