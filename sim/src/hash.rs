//! The state fingerprint of `tools/sim/state-hash.cjs`, byte for byte.

use crate::game::Game;
use std::fmt::Write;

/// The key to a game's dice state. Its field is private, so only this module
/// can make one: bots cannot read the dice.
pub struct DiceAccess(());

fn flag(v: bool) -> u8 {
    u8::from(v)
}

fn unit_text(g: &Game, u: usize, out: &mut String) {
    let unit = &g.units[u];
    write!(
        out,
        "{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},",
        unit.id,
        g.typ(u).id,
        unit.player,
        unit.col,
        unit.row,
        unit.strength,
        unit.exp,
        unit.mp,
        flag(unit.moved),
        flag(unit.shifted),
        flag(unit.attacked),
        flag(unit.attack_spent),
        flag(unit.transfer_used),
        flag(unit.in_factory),
        unit.carried_by
    )
    .unwrap();
    for (i, &c) in unit.cargo.iter().enumerate() {
        if i > 0 {
            out.push('+');
        }
        write!(out, "{}", g.units[c].id).unwrap();
    }
}

fn cargo_text(g: &Game, u: usize, out: &mut String) {
    for &c in &g.units[u].cargo {
        out.push_str(";c");
        unit_text(g, c, out);
        cargo_text(g, c, out);
    }
}

pub fn state_text(g: &Game) -> String {
    let mut out = String::with_capacity(4096);
    write!(out, "T{};P{};F{};L{};W", g.turn, g.current, g.first, g.turn_limit).unwrap();
    if g.winner < 0 {
        out.push('-');
    } else {
        write!(out, "{}", g.winner).unwrap();
    }
    out.push_str(";R");
    out.push_str(if g.reason.is_empty() { "-" } else { g.reason });
    write!(out, ";G{}", g.dice_text(&DiceAccess(()))).unwrap();
    for &u in &g.field {
        out.push_str(";u");
        unit_text(g, u, &mut out);
        cargo_text(g, u, &mut out);
    }
    for b in &g.buildings {
        write!(out, ";b{},{},{},", b.col, b.row, b.owner).unwrap();
        for (i, &s) in b.stored.iter().enumerate() {
            if i > 0 {
                out.push('+');
            }
            write!(out, "{}", g.units[s].id).unwrap();
        }
        for &s in &b.stored {
            out.push_str(";s");
            unit_text(g, s, &mut out);
            cargo_text(g, s, &mut out);
        }
    }
    out
}

/// 32-bit FNV-1a over the text's UTF-16 code units (the text is ASCII).
pub fn state_hash(g: &Game) -> u32 {
    let mut h: u32 = 2_166_136_261;
    for b in state_text(g).bytes() {
        h = (h ^ u32::from(b)).wrapping_mul(16_777_619);
    }
    h
}
