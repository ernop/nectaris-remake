//! `COMBAT.makeRng`: the match's mulberry32-style generator.

#[derive(Clone, Copy, Debug)]
pub struct Rng {
    pub state: u32,
    /// Search's representative simulations replace the generator with one
    /// that always returns 0.5.
    pub half: bool,
}

impl Rng {
    pub fn new(seed: u32) -> Rng {
        Rng { state: seed, half: false }
    }
    pub fn half() -> Rng {
        Rng { state: 0, half: true }
    }

    /// A number from 0 up to but not including 1, exactly as JavaScript returns it.
    pub fn next(&mut self) -> f64 {
        if self.half {
            return 0.5;
        }
        self.state = self.state.wrapping_add(0x6D2B_79F5);
        let mut t = self.state;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        f64::from(t ^ (t >> 14)) / 4_294_967_296.0
    }
}
