//! The behaviour-lock corpus written by `tools/sim/make-corpus.cjs`.

use crate::game::Game;
use serde::Deserialize;
use serde_json::Value;
use std::io::Read;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CorpusGame {
    pub board: usize,
    pub name: String,
    /// The dice seed, 64 hex digits.
    pub seed: String,
    pub players: Vec<String>,
    pub max_rounds: i32,
    pub work: String,
    pub winner: Option<i32>,
    pub reason: String,
    pub rounds: i32,
    pub commands: Vec<(String, Vec<Value>)>,
    pub hashes: Vec<u32>,
    /// FNV-1a over the legal-command list of every position, joined by
    /// newlines (`legalText` in tools/sim/state-hash.cjs).
    pub legal: u32,
    #[serde(default)]
    pub decide: bool,
}

/// The legal-command list as `legalText` writes it.
pub fn legal_text(g: &Game) -> String {
    let list: Vec<(String, Vec<Value>)> = g.legal_commands().iter().map(|c| c.to_json()).collect();
    serde_json::to_string(&list).expect("serializable commands")
}

/// 32-bit FNV-1a continued over ASCII text.
pub fn fnv(mut h: u32, text: &str) -> u32 {
    for b in text.bytes() {
        h = (h ^ u32::from(b)).wrapping_mul(16_777_619);
    }
    h
}

/// Random games over the legal-command list (tools/sim/playout.cjs), on
/// every built-in board in order.
#[derive(Deserialize)]
pub struct PlayoutCheck {
    pub games: usize,
    pub seed: u32,
    pub fingerprint: u32,
}

#[derive(Deserialize)]
pub struct Corpus {
    pub version: u32,
    pub tournament: String,
    pub games: Vec<CorpusGame>,
    pub playout: PlayoutCheck,
}

pub fn load(path: &str) -> Corpus {
    let file = std::fs::File::open(path).unwrap_or_else(|e| panic!("Cannot open {path}: {e}"));
    let mut text = String::new();
    flate2::read::GzDecoder::new(file).read_to_string(&mut text).unwrap_or_else(|e| panic!("Cannot unpack {path}: {e}"));
    serde_json::from_str(&text).unwrap_or_else(|e| panic!("Invalid corpus {path}: {e}"))
}

fn unit(g: &Game, v: &Value) -> Result<usize, String> {
    let id = v.get("unit").and_then(Value::as_u64).ok_or_else(|| format!("expected a unit, got {v}"))?;
    Ok(g.unit_by_id(id as u32))
}
fn building(g: &Game, v: &Value) -> Result<usize, String> {
    let at = v.get("building").and_then(Value::as_array).ok_or_else(|| format!("expected a building, got {v}"))?;
    let (c, r) = (at[0].as_i64().unwrap_or(-1) as i32, at[1].as_i64().unwrap_or(-1) as i32);
    g.building(c, r).ok_or_else(|| format!("no building at {c},{r}"))
}
fn int(v: &Value) -> Result<i32, String> {
    v.as_i64().map(|n| n as i32).ok_or_else(|| format!("expected a number, got {v}"))
}

/// Apply one recorded engine command (`AI_TOURNAMENT`'s seven methods).
pub fn apply(g: &mut Game, name: &str, args: &[Value]) -> Result<(), String> {
    match (name, args.len()) {
        ("moveUnit", 3) => g.move_unit(unit(g, &args[0])?, int(&args[1])?, int(&args[2])?).map(|_| ()),
        ("finishUnit", 1) => {
            let u = unit(g, &args[0])?;
            g.finish_unit(u);
            Ok(())
        }
        ("attack", 2) => g.attack(unit(g, &args[0])?, unit(g, &args[1])?).map(|_| ()),
        ("unload", 4) => g.unload(unit(g, &args[0])?, unit(g, &args[1])?, int(&args[2])?, int(&args[3])?),
        ("deployFromFactory", 4) => g.deploy_from_factory(building(g, &args[0])?, unit(g, &args[1])?, int(&args[2])?, int(&args[3])?),
        ("loadFromFactory", 3) => g.load_from_factory(building(g, &args[0])?, unit(g, &args[1])?, unit(g, &args[2])?),
        ("endTurn", 0) => {
            g.end_turn();
            Ok(())
        }
        _ => Err(format!("unknown command {name} with {} arguments", args.len())),
    }
}
