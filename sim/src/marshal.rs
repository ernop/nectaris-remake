//! Marshal: Apex search under evaluation weights tuned by self-play, one set
//! per seat (js/ai-search.js `marshal` mode holds the same numbers). The
//! procedure and measurements are in BOTS.md.

use crate::model::{Profile, Weights};

/// Union (side 0) and Xenon (side 1).
pub const SEAT_PROFILES: [Profile; 2] = [
    Profile::fixed(Weights { danger: 0.54, danger_scale: 0.051, advance: 1.5, terrain: 0.06, base_worth: 240.0, ..Weights::SHIPPED }),
    Profile::fixed(Weights { danger_scale: 0.051, advance: 0.6, move_cost: 0.21, hunt_worth: 39.0, support: 1.5, ..Weights::SHIPPED }),
];
