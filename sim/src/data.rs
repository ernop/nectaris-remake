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
    pub json: String,
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

#[derive(Deserialize)]
struct Raw {
    terrain: Vec<Terrain>,
    units: Vec<UnitTypeDef>,
    boards: Vec<Board>,
    combat: CombatTables,
}

pub struct Data {
    pub terrain: Vec<Terrain>,
    pub terrain_by_char: HashMap<char, usize>,
    pub types: Vec<UnitType>,
    pub type_index: HashMap<String, usize>,
    pub boards: Vec<Board>,
    pub combat: CombatTables,
    /// Damage percentages, one entry per percent of probability.
    pub buckets: Vec<i32>,
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
        let types = raw
            .units
            .iter()
            .map(|t| UnitType {
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
                json: t.json.clone(),
            })
            .collect();
        let mut buckets = Vec::new();
        for w in &raw.combat.random_weights {
            for _ in 0..w[1] {
                buckets.push(w[0]);
            }
        }
        Data { terrain: raw.terrain, terrain_by_char, types, type_index, boards: raw.boards, combat: raw.combat, buckets }
    }

    /// `terrainCost`: the cost for this chassis to enter the terrain, or None.
    pub fn terrain_cost(&self, terrain: usize, t: &UnitType) -> Option<i32> {
        if t.cannot_enter.contains(&terrain) {
            return None;
        }
        let c = &self.terrain[terrain].cost;
        match t.move_type {
            MoveType::Air => Some(1),
            MoveType::Foot => c.foot,
            MoveType::Wheels => c.wheels,
            MoveType::Treads => c.treads,
        }
    }
}
