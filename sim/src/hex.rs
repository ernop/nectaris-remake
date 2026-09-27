//! Flat-top hexes in the odd-q offset layout of `js/hex.js`.

/// Neighbour steps (col, row pairs) in `HEX.neighbors` order, for even and
/// odd columns.
const STEPS: [[i32; 12]; 2] = [[1, 0, 1, -1, 0, -1, -1, -1, -1, 0, 0, 1], [1, 1, 1, 0, 0, -1, -1, 0, -1, 1, 0, 1]];

pub fn neighbors(col: i32, row: i32) -> [(i32, i32); 6] {
    let s = &STEPS[(col & 1) as usize];
    [
        (col + s[0], row + s[1]),
        (col + s[2], row + s[3]),
        (col + s[4], row + s[5]),
        (col + s[6], row + s[7]),
        (col + s[8], row + s[9]),
        (col + s[10], row + s[11]),
    ]
}

pub fn distance(c1: i32, r1: i32, c2: i32, r2: i32) -> i32 {
    let dx = c1 - c2;
    let dz = r1 - ((c1 - (c1 & 1)) >> 1) - (r2 - ((c2 - (c2 & 1)) >> 1));
    dx.abs().max((dx + dz).abs()).max(dz.abs())
}
