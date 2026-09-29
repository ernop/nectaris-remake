//! The match's dice (`COMBAT.makeDice`): ChaCha20 (RFC 8439) keyed by the
//! game's 256-bit seed, nonce zero, read as 32-bit words in order, each
//! divided by 2^32. Without the seed the next roll cannot be predicted,
//! however many rolls one has seen. Bots imagine battles with their own
//! generators (`Dice::LookAhead`, `Dice::Half`) and cannot reach a game's
//! match dice: the field is private to `game.rs`, `ChaCha` cannot be copied,
//! and only the state fingerprint can read the dice state.

use crate::rng::Rng;
use std::fmt::Write;
use std::io::Read;

const SHA_K: [u32; 64] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/// SHA-256 of the bytes.
pub fn sha256(message: &[u8]) -> [u8; 32] {
    let mut h: [u32; 8] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    let mut padded = message.to_vec();
    padded.push(0x80);
    while padded.len() % 64 != 56 {
        padded.push(0);
    }
    padded.extend_from_slice(&(message.len() as u64 * 8).to_be_bytes());
    let mut w = [0u32; 64];
    for chunk in padded.chunks_exact(64) {
        for i in 0..16 {
            w[i] = u32::from_be_bytes([chunk[4 * i], chunk[4 * i + 1], chunk[4 * i + 2], chunk[4 * i + 3]]);
        }
        for i in 16..64 {
            let s0 = w[i - 15].rotate_right(7) ^ w[i - 15].rotate_right(18) ^ (w[i - 15] >> 3);
            let s1 = w[i - 2].rotate_right(17) ^ w[i - 2].rotate_right(19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16].wrapping_add(s0).wrapping_add(w[i - 7]).wrapping_add(s1);
        }
        let [mut a, mut b, mut c, mut d, mut e, mut f, mut g, mut k] = h;
        for j in 0..64 {
            let t1 = k
                .wrapping_add(e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25))
                .wrapping_add((e & f) ^ (!e & g))
                .wrapping_add(SHA_K[j])
                .wrapping_add(w[j]);
            let t2 = (a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22)).wrapping_add((a & b) ^ (a & c) ^ (b & c));
            k = g;
            g = f;
            f = e;
            e = d.wrapping_add(t1);
            d = c;
            c = b;
            b = a;
            a = t1.wrapping_add(t2);
        }
        for (x, y) in h.iter_mut().zip([a, b, c, d, e, f, g, k]) {
            *x = x.wrapping_add(y);
        }
    }
    let mut out = [0u8; 32];
    for (i, v) in h.iter().enumerate() {
        out[4 * i..4 * i + 4].copy_from_slice(&v.to_be_bytes());
    }
    out
}

fn hex(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(2 * bytes.len());
    for b in bytes {
        write!(s, "{b:02x}").unwrap();
    }
    s
}

/// `COMBAT.sha256`: lowercase hex of the SHA-256 of the text's UTF-8 bytes.
pub fn sha256_hex(text: &str) -> String {
    hex(&sha256(text.as_bytes()))
}

/// The ChaCha20 block function (RFC 8439) with a key of 8 words.
pub fn block(key: &[u32; 8], counter: u32, nonce: [u32; 3]) -> [u32; 16] {
    let mut s = [0u32; 16];
    s[..4].copy_from_slice(&[0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]);
    s[4..12].copy_from_slice(key);
    s[12] = counter;
    s[13..].copy_from_slice(&nonce);
    let mut x = s;
    fn quarter(x: &mut [u32; 16], a: usize, b: usize, c: usize, d: usize) {
        x[a] = x[a].wrapping_add(x[b]);
        x[d] = (x[d] ^ x[a]).rotate_left(16);
        x[c] = x[c].wrapping_add(x[d]);
        x[b] = (x[b] ^ x[c]).rotate_left(12);
        x[a] = x[a].wrapping_add(x[b]);
        x[d] = (x[d] ^ x[a]).rotate_left(8);
        x[c] = x[c].wrapping_add(x[d]);
        x[b] = (x[b] ^ x[c]).rotate_left(7);
    }
    for _ in 0..10 {
        quarter(&mut x, 0, 4, 8, 12);
        quarter(&mut x, 1, 5, 9, 13);
        quarter(&mut x, 2, 6, 10, 14);
        quarter(&mut x, 3, 7, 11, 15);
        quarter(&mut x, 0, 5, 10, 15);
        quarter(&mut x, 1, 6, 11, 12);
        quarter(&mut x, 2, 7, 8, 13);
        quarter(&mut x, 3, 4, 9, 14);
    }
    for (o, i) in x.iter_mut().zip(s) {
        *o = o.wrapping_add(i);
    }
    x
}

/// A match's 256-bit dice seed (`COMBAT.diceSeed`).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Seed(pub [u8; 32]);

impl Seed {
    /// 64 lowercase hex digits are used as they are; any other text (a
    /// number's digits included) is stretched to SHA-256("nectaris-seed:" +
    /// text), as JavaScript stretches a number or a text.
    pub fn from_text(text: &str) -> Seed {
        if text.len() == 64 && text.bytes().all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b)) {
            let mut out = [0u8; 32];
            for (i, o) in out.iter_mut().enumerate() {
                *o = u8::from_str_radix(&text[2 * i..2 * i + 2], 16).unwrap();
            }
            return Seed(out);
        }
        Seed(sha256(format!("nectaris-seed:{text}").as_bytes()))
    }
    /// 32 fresh bytes from the operating system.
    pub fn fresh() -> Seed {
        let mut out = [0u8; 32];
        std::fs::File::open("/dev/urandom")
            .and_then(|mut f| f.read_exact(&mut out))
            .unwrap_or_else(|e| panic!("cannot read /dev/urandom for a fresh dice seed: {e}"));
        Seed(out)
    }
    pub fn hex(&self) -> String {
        hex(&self.0)
    }
}

/// ChaCha20 read one 32-bit word at a time. Deliberately not `Clone`.
pub struct ChaCha {
    seed: Seed,
    key: [u32; 8],
    counter: u32,
    index: usize,
    block: [u32; 16],
}

impl ChaCha {
    pub fn new(seed: &Seed) -> ChaCha {
        let mut key = [0u32; 8];
        for (i, k) in key.iter_mut().enumerate() {
            *k = u32::from_le_bytes([seed.0[4 * i], seed.0[4 * i + 1], seed.0[4 * i + 2], seed.0[4 * i + 3]]);
        }
        ChaCha { seed: *seed, key, counter: 0, index: 16, block: [0; 16] }
    }
    fn next(&mut self) -> f64 {
        if self.index == 16 {
            self.block = block(&self.key, self.counter, [0; 3]);
            self.counter = self.counter.checked_add(1).expect("the dice ran through 2^32 blocks");
            self.index = 0;
        }
        let w = self.block[self.index];
        self.index += 1;
        f64::from(w) / 4_294_967_296.0
    }
}

/// Where a game's combat rolls come from.
pub enum Dice {
    /// The match's own dice.
    Match(ChaCha),
    /// A bot's imagined battles: its own mulberry32 stream (`COMBAT.makeRng`).
    LookAhead(Rng),
    /// Search's representative outcomes: every roll is 0.5.
    Half,
}

impl Dice {
    pub fn look_ahead(seed: u32) -> Dice {
        Dice::LookAhead(Rng::new(seed))
    }
    pub(crate) fn next(&mut self) -> f64 {
        match self {
            Dice::Match(c) => c.next(),
            Dice::LookAhead(r) => r.next(),
            Dice::Half => 0.5,
        }
    }
    /// `rng.state()`: "<seed>/<block counter>/<next word>".
    pub(crate) fn state_text(&self) -> String {
        match self {
            Dice::Match(c) => format!("{}/{}/{}", c.seed.hex(), c.counter, c.index),
            _ => panic!("a bot's look-ahead copy has no dice state"),
        }
    }
}
