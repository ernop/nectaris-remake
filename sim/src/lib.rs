//! Nectaris rules for fast self-play. Every behaviour matches the JavaScript
//! game exactly; `test/fixtures/sim-corpus.json.gz` and `nectaris-sim replay`
//! check it command by command.

pub mod corpus;
pub mod data;
pub mod game;
pub mod hash;
pub mod hex;
pub mod rng;
