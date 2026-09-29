//! Game data exported from the JavaScript data files by
//! `tools/sim/export-data.cjs` into `sim/data/game-data.json`.

use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct Cost {
    pub foot: Option<i32>,
    pub wheels: Option<i32>,
    pub treads: Option<i32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Terrain {
    pub id: String,
    pub ch: String,
    pub def: i32,
    pub cost: Cost,
    pub deployable: bool,
    pub building: bool,
    pub costs_all_movement: bool,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum MoveType {
    Foot,
    Wheels,
    Treads,
    Air,
}

/// A unit type. Fields JavaScript reads as `field || 0` or `!!field` default
/// the same way; `def`, `move` and `moveType` are required.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnitTypeDef {
    pub id: String,
    #[serde(rename = "move")]
    pub mv: i32,
    pub move_type: String,
    #[serde(default)]
    pub rng_g: i32,
    #[serde(default)]
    pub rng_a: i32,
    #[serde(default)]
    pub atk_g: i32,
    #[serde(default)]
    pub atk_a: i32,
    pub def: i32,
    #[serde(default)]
    pub capture: bool,
    #[serde(default)]
    pub cargo: i32,
    pub cargo_types: Option<Vec<String>>,
    pub cargo_factory_types: Option<Vec<String>>,
    pub cannot_enter: Option<Vec<String>>,
    #[serde(default)]
    pub move_or_fire: bool,
    #[serde(default)]
    pub move_after_attack: bool,
    pub ai_deployment_enemies: Option<i32>,
    /// `JSON.stringify` of the type, which the search seed hashes.
    pub json: String,
}

pub struct UnitType {
    pub id: String,
    pub mv: i32,
    pub move_type: MoveType,
    pub rng_g: i32,
    pub rng_a: i32,
    pub atk_g: i32,
    pub atk_a: i32,
    pub def: i32,
    pub capture: bool,
    pub cargo: i32,
    pub cargo_types: Option<Vec<usize>>,
    pub cargo_factory_types: Option<Vec<usize>>,
    /// Terrain indexes this chassis cannot enter.
    pub cannot_enter: Vec<usize>,
    pub move_or_fire: bool,
    pub move_after_attack: bool,
    pub ai_deployment_enemies: Option<i32>,
    pub json: String,
    /// `AI_MODEL`'s base value of the type (`model::base_value`), computed once.
    pub base_value: f64,
}

#[derive(Deserialize, Clone)]
#[serde(untagged)]
pub enum StoredDef {
    Id(String),
    Full { t: String, str: Option<i32>, exp: Option<i32> },
}

#[derive(Deserialize, Clone)]
pub struct BuildingDef {
    pub col: i32,
    pub row: i32,
    pub owner: Option<i32>,
    #[serde(default)]
    pub stored: Vec<StoredDef>,
}

#[derive(Deserialize, Clone)]
pub struct UnitDef {
    pub t: String,
    pub o: i32,
    pub x: i32,
    pub y: i32,
    pub str: Option<i32>,
    pub exp: Option<i32>,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub name: String,
    pub grid: Vec<String>,
    pub buildings: Vec<BuildingDef>,
    pub units: Vec<UnitDef>,
    pub turn_limit: Option<i32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CombatTables {
    pub exp_damage: Vec<i32>,
    pub max_exp: i32,
    pub max_strength: i32,
    pub random_weights: Vec<[i32; 2]>,
}

/// V8's `Math.log` and `Math.tanh` fingerprinted over generated inputs.
#[derive(Deserialize)]
pub struct MathCheck {
    pub samples: u32,
    pub seed: u32,
    pub log: u32,
    pub tanh: u32,
}

#[derive(Deserialize)]
struct Raw {
    terrain: Vec<Terrain>,
    units: Vec<UnitTypeDef>,
    boards: Vec<Board>,
    combat: CombatTables,
    math: MathCheck,
}

pub struct Data {
    pub terrain: Vec<Terrain>,
    pub terrain_by_char: HashMap<char, usize>,
    pub types: Vec<UnitType>,
    pub type_index: HashMap<String, usize>,
    pub boards: Vec<Board>,
    /// Per-board tables, parallel to `boards`.
    pub tables: Vec<Tables>,
    pub combat: CombatTables,
    /// Damage percentages, one entry per percent of probability.
    pub buckets: Vec<i32>,
    pub math: MathCheck,
}

/// What never changes during a game on one board. Cells are numbered
/// row * width + col.
/// `Tables::move_step`'s mark for terrain that takes all remaining movement.
pub const DRAIN: i32 = -2;

pub struct Tables {
    pub w: i32,
    pub h: i32,
    /// Terrain index of every cell.
    pub cells: Vec<usize>,
    /// The six neighbours of each cell in `hex::neighbors` order, -1 off the board.
    pub neighbors: Vec<i32>,
    /// Index into the game's buildings, -1 where there is none: explicit
    /// buildings in definition order, then the other F/B cells row by row.
    pub building_at: Vec<i32>,
    /// Positions of the buildings in that order.
    pub building_cells: Vec<usize>,
    /// Per unit type: the cost to enter each cell, -1 where it cannot.
    pub step: Vec<Vec<i32>>,
    /// Per unit type: the smallest cost to enter any cell, at most 1
    /// (`reachOf`'s divisor).
    pub min_step: Vec<i32>,
    /// Per unit type: the largest cost to enter any cell, 0 if none can be entered.
    pub max_step: Vec<i32>,
    /// Per unit type, for the movement search: `step`, except `DRAIN` where
    /// the terrain takes all remaining movement from a unit that is not air.
    pub move_step: Vec<Vec<i32>>,
    /// Cells whose terrain takes all remaining movement (valleys).
    pub drains: Vec<bool>,
}

impl Tables {
    fn new(b: &Board, terrain: &[Terrain], by_char: &HashMap<char, usize>, types: &[UnitType]) -> Tables {
        let h = b.grid.len() as i32;
        let w = b.grid[0].chars().count() as i32;
        let mut cells = Vec::with_capacity((w * h) as usize);
        for (r, line) in b.grid.iter().enumerate() {
            assert_eq!(line.chars().count() as i32, w, "{}: row {r} has another width", b.name);
            for ch in line.chars() {
                cells.push(*by_char.get(&ch).unwrap_or_else(|| panic!("{}: bad terrain {ch}", b.name)));
            }
        }
        let mut neighbors = Vec::with_capacity(cells.len() * 6);
        for r in 0..h {
            for c in 0..w {
                for (nc, nr) in crate::hex::neighbors(c, r) {
                    neighbors.push(if nc >= 0 && nc < w && nr >= 0 && nr < h { nr * w + nc } else { -1 });
                }
            }
        }
        let mut building_at = vec![-1; cells.len()];
        let mut building_cells = Vec::new();
        for def in &b.buildings {
            assert!(def.col >= 0 && def.col < w && def.row >= 0 && def.row < h, "{}: building at {},{} is off the board", b.name, def.col, def.row);
            let at = (def.row * w + def.col) as usize;
            assert!(terrain[cells[at]].building, "{}: building at {},{} is not on F/B terrain", b.name, def.col, def.row);
            assert!(building_at[at] < 0, "{}: two buildings at {},{}", b.name, def.col, def.row);
            assert!(terrain[cells[at]].id != "base" || def.stored.is_empty(), "{}: a base stores units", b.name);
            building_at[at] = building_cells.len() as i32;
            building_cells.push(at);
        }
        for at in 0..cells.len() {
            if terrain[cells[at]].building && building_at[at] < 0 {
                building_at[at] = building_cells.len() as i32;
                building_cells.push(at);
            }
        }
        let step: Vec<Vec<i32>> = types.iter().map(|t| cells.iter().map(|&c| terrain_cost_of(terrain, c, t).unwrap_or(-1)).collect()).collect();
        let min_step = step.iter().map(|s| s.iter().copied().filter(|&c| c >= 0).fold(1, i32::min)).collect();
        let max_step = step.iter().map(|s| s.iter().copied().fold(0, i32::max)).collect();
        let drains: Vec<bool> = cells.iter().map(|&c| terrain[c].costs_all_movement).collect();
        let move_step = types
            .iter()
            .zip(&step)
            .map(|(t, s)| s.iter().zip(&drains).map(|(&cost, &drain)| if cost >= 0 && drain && t.move_type != MoveType::Air { DRAIN } else { cost }).collect())
            .collect();
        Tables { w, h, cells, neighbors, building_at, building_cells, step, min_step, max_step, move_step, drains }
    }
}

fn terrain_cost_of(terrain: &[Terrain], index: usize, t: &UnitType) -> Option<i32> {
    if t.cannot_enter.contains(&index) {
        return None;
    }
    let c = &terrain[index].cost;
    match t.move_type {
        MoveType::Air => Some(1),
        MoveType::Foot => c.foot,
        MoveType::Wheels => c.wheels,
        MoveType::Treads => c.treads,
    }
}

fn move_type(name: &str) -> MoveType {
    match name {
        "foot" => MoveType::Foot,
        "wheels" => MoveType::Wheels,
        "treads" => MoveType::Treads,
        "air" => MoveType::Air,
        other => panic!("Unknown movement type {other}"),
    }
}

impl Data {
    pub fn load(path: &str) -> Data {
        let text = std::fs::read_to_string(path).unwrap_or_else(|e| panic!("Cannot read {path}: {e}"));
        let raw: Raw = serde_json::from_str(&text).unwrap_or_else(|e| panic!("Invalid {path}: {e}"));
        let mut terrain_by_char = HashMap::new();
        for (i, t) in raw.terrain.iter().enumerate() {
            terrain_by_char.insert(t.ch.chars().next().expect("terrain letter"), i);
        }
        let terrain_index: HashMap<&str, usize> = raw.terrain.iter().enumerate().map(|(i, t)| (t.id.as_str(), i)).collect();
        let type_index: HashMap<String, usize> = raw.units.iter().enumerate().map(|(i, t)| (t.id.clone(), i)).collect();
        let ids = |list: &Option<Vec<String>>| -> Option<Vec<usize>> {
            list.as_ref().map(|l| l.iter().map(|id| *type_index.get(id).unwrap_or_else(|| panic!("Unknown unit type {id}"))).collect())
        };
        let types: Vec<UnitType> = raw
            .units
            .iter()
            .map(|t| UnitType {
                base_value: 0.0,
                id: t.id.clone(),
                mv: t.mv,
                move_type: move_type(&t.move_type),
                rng_g: t.rng_g,
                rng_a: t.rng_a,
                atk_g: t.atk_g,
                atk_a: t.atk_a,
                def: t.def,
                capture: t.capture,
                cargo: t.cargo,
                cargo_types: ids(&t.cargo_types),
                cargo_factory_types: ids(&t.cargo_factory_types),
                cannot_enter: t
                    .cannot_enter
                    .iter()
                    .flatten()
                    .map(|id| *terrain_index.get(id.as_str()).unwrap_or_else(|| panic!("Unknown terrain {id}")))
                    .collect(),
                move_or_fire: t.move_or_fire,
                move_after_attack: t.move_after_attack,
                ai_deployment_enemies: t.ai_deployment_enemies,
                json: t.json.clone(),
            })
            .map(|mut t| {
                t.base_value = crate::model::base_value(&t);
                t
            })
            .collect();
        let mut buckets = Vec::new();
        for w in &raw.combat.random_weights {
            for _ in 0..w[1] {
                buckets.push(w[0]);
            }
        }
        let tables = raw.boards.iter().map(|b| Tables::new(b, &raw.terrain, &terrain_by_char, &types)).collect();
        Data { terrain: raw.terrain, terrain_by_char, types, type_index, boards: raw.boards, tables, combat: raw.combat, buckets, math: raw.math }
    }

    /// `terrainCost`: the cost for this chassis to enter the terrain, or None.
    pub fn terrain_cost(&self, terrain: usize, t: &UnitType) -> Option<i32> {
        terrain_cost_of(&self.terrain, terrain, t)
    }
}
