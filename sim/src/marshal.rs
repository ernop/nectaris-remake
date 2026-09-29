//! Marshal: the laboratory's strongest classical planner (design notes in
//! BOTS.md). This first version is the greedy planner under its own weights;
//! later layers are added and measured one at a time.

use crate::game::Game;
use crate::model::{self, Weights};
use crate::play::Player;

pub struct Marshal {
    pub w: [Weights; 2],
}

impl Player for Marshal {
    fn play_turn(&mut self, game: &mut Game, side: i32) {
        let before = model::set_weights(self.w[side as usize]);
        crate::search::play_turn(game, side, "tactical", "standard");
        model::set_weights(before);
    }
}

pub fn player(spec: &str) -> Result<Box<dyn Player>, String> {
    Ok(Box::new(Marshal { w: crate::lab::parse_seat_weights(spec)? }))
}
