//! `COMBAT.makeRng`: mulberry32, the bots' own look-ahead generator (imagined
//! battles, search sampling) and the playout player's. Never the match's dice.

#[derive(Clone, Copy, Debug)]
pub struct Rng {
    state: u32,
}

impl Rng {
    pub fn new(seed: u32) -> Rng {
        Rng { state: seed }
    }

    /// A number from 0 up to but not including 1, exactly as JavaScript returns it.
    pub fn next(&mut self) -> f64 {
        self.state = self.state.wrapping_add(0x6D2B_79F5);
        let mut t = self.state;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        f64::from(t ^ (t >> 14)) / 4_294_967_296.0
    }
}
