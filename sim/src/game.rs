//! The rules of `js/engine.js` and the combat of `js/combat.js`, rule for rule.
//! Unit ids are numbered from 1 in creation order (stored reserves first, then
//! field units), as `tools/sim/state-hash.cjs` numbers them. `field` keeps the
//! engine's `units` list in its exact order, because board order decides
//! occupancy ties, iteration and the state fingerprint.

use crate::data::{Board, Data, MoveType, StoredDef, Tables, UnitType};
use crate::hex;
use crate::rng::Rng;

#[derive(Clone, Debug)]
pub struct Unit {
    pub id: u32,
    pub t: usize,
    pub player: i32,
    pub col: i32,
    pub row: i32,
    pub strength: i32,
    pub exp: i32,
    pub moved: bool,
    pub mp: i32,
    pub cargo: Vec<usize>,
    /// Id of the carrying transport, 0 when not carried.
    pub carried_by: u32,
    pub in_factory: bool,
    pub shifted: bool,
    pub attacked: bool,
    pub attack_spent: bool,
    pub transfer_used: bool,
}

#[derive(Clone, Debug)]
pub struct Building {
    pub col: i32,
    pub row: i32,
    pub base: bool,
    pub owner: i32,
    pub stored: Vec<usize>,
}

pub struct Game<'d> {
    pub d: &'d Data,
    pub board: usize,
    pub tables: &'d Tables,
    pub w: i32,
    pub h: i32,
    /// Terrain index of every cell, row * width + col.
    pub cells: &'d [usize],
    /// Every unit ever created, id = index + 1.
    pub units: Vec<Unit>,
    pub field: Vec<usize>,
    pub buildings: Vec<Building>,
    pub building_at: &'d [i32],
    pub turn: i32,
    pub turn_limit: i32,
    pub current: i32,
    pub first: i32,
    /// -1 while the match is undecided.
    pub winner: i32,
    pub reason: &'static str,
    pub rng: Rng,
    /// Commands issued through the `do_` methods, as the tournament records
    /// them: only outermost calls, never the engine's own nested ones.
    pub log: Option<Vec<Command>>,
}

/// One recorded engine command; units by id, buildings by position.
#[derive(Clone, Debug, PartialEq)]
pub enum Command {
    Move(u32, i32, i32),
    Finish(u32),
    Attack(u32, u32),
    Unload(u32, u32, i32, i32),
    Deploy((i32, i32), u32, i32, i32),
    LoadFromFactory((i32, i32), u32, u32),
    EndTurn,
}

pub const STOP: u8 = 1;
pub const CAN_STOP: u8 = 2;
pub const LOAD: u8 = 4;
pub const ENTER: u8 = 8;

/// Result of the movement search: reached cells in first-reached order (the
/// start first), with each one's cheapest cost and record flags in parallel.
pub struct MoveSearch {
    pub order: Vec<usize>,
    pub cost: Vec<i32>,
    pub flags: Vec<u8>,
}
impl MoveSearch {
    /// The cost and flags of a reached cell.
    pub fn find(&self, cell: usize) -> Option<(i32, u8)> {
        self.order.iter().position(|&c| c == cell).map(|i| (self.cost[i], self.flags[i]))
    }
}

/// Per-thread search tables, restored to empty after every search.
#[derive(Default)]
struct Scratch {
    best: Vec<i32>,
    flags: Vec<u8>,
    occupant: Vec<i32>,
    zone: Vec<u8>,
    filled: Vec<usize>,
    /// The frontier by cost. Costs never decrease as the search proceeds, so
    /// taking the cheapest bucket in insertion order is exactly the heap order
    /// (cost, then first pushed).
    buckets: Vec<Vec<u32>>,
}
thread_local! {
    static SCRATCH: std::cell::RefCell<Scratch> = std::cell::RefCell::new(Scratch::default());
}

pub struct Battle {
    pub dmg_to_defender: i32,
    pub dmg_to_attacker: i32,
    pub attacker_dead: bool,
    pub defender_dead: bool,
}

/// Per-machine modified attack and defense of both sides (`battleStats`).
pub struct Stats {
    pub a_ap: i32,
    pub a_da: i32,
    pub d_ap: i32,
    pub d_da: i32,
    pub counter: bool,
}

pub fn atk_stat(t: &UnitType, air_target: bool) -> i32 {
    if air_target {
        t.atk_a
    } else {
        t.atk_g
    }
}

pub fn range_band(t: &UnitType, air_target: bool) -> Option<(i32, i32)> {
    let max = if air_target { t.rng_a } else { t.rng_g };
    if max < 1 || atk_stat(t, air_target) <= 0 {
        None
    } else {
        Some((if max > 1 { 2 } else { 1 }, max))
    }
}

pub fn can_attack_at(t: &UnitType, air_target: bool, dist: i32) -> bool {
    matches!(range_band(t, air_target), Some((min, max)) if dist >= min && dist <= max)
}

fn cap(v: i32) -> i32 {
    v.clamp(0, 100)
}

impl<'d> Game<'d> {
    pub fn new(d: &'d Data, board: usize, seed: u32, first_player: i32) -> Game<'d> {
        let b: &Board = &d.boards[board];
        let tables = &d.tables[board];
        let mut g = Game {
            d,
            board,
            tables,
            w: tables.w,
            h: tables.h,
            cells: &tables.cells,
            units: Vec::new(),
            field: Vec::new(),
            buildings: Vec::new(),
            building_at: &tables.building_at,
            turn: 1,
            turn_limit: b.turn_limit.filter(|&n| n != 0).unwrap_or(50),
            current: if first_player == 1 { 1 } else { 0 },
            first: if first_player == 1 { 1 } else { 0 },
            winner: -1,
            reason: "",
            rng: Rng::new(seed),
            log: None,
        };
        for def in &b.buildings {
            let cell = g.cell(def.col, def.row);
            let terrain = &d.terrain[g.cells[cell]];
            let owner = def.owner.unwrap_or(-1);
            let mut stored = Vec::new();
            for s in &def.stored {
                let (t, str, exp) = match s {
                    StoredDef::Id(t) => (t.as_str(), None, None),
                    StoredDef::Full { t, str, exp } => (t.as_str(), str.filter(|&n| n != 0), *exp),
                };
                let u = g.make_unit(t, owner, def.col, def.row, str, exp);
                g.units[u].in_factory = true;
                stored.push(u);
            }
            g.buildings.push(Building { col: def.col, row: def.row, base: terrain.id == "base", owner, stored });
        }
        for &cell in &tables.building_cells[b.buildings.len()..] {
            let (c, r) = (cell as i32 % g.w, cell as i32 / g.w);
            g.buildings.push(Building { col: c, row: r, base: d.terrain[g.cells[cell]].id == "base", owner: -1, stored: Vec::new() });
        }
        for def in &b.units {
            let u = g.make_unit(&def.t, def.o, def.x, def.y, def.str, def.exp);
            g.field.push(u);
        }
        g
    }

    /// `AI_MODEL.clone`: the same position with its own generator and no log.
    pub fn sim_clone(&self, rng: Rng) -> Game<'d> {
        Game {
            d: self.d,
            board: self.board,
            tables: self.tables,
            w: self.w,
            h: self.h,
            cells: self.cells,
            units: self.units.clone(),
            field: self.field.clone(),
            buildings: self.buildings.clone(),
            building_at: self.building_at,
            turn: self.turn,
            turn_limit: self.turn_limit,
            current: self.current,
            first: self.first,
            winner: self.winner,
            reason: self.reason,
            rng,
            log: None,
        }
    }

    fn make_unit(&mut self, type_id: &str, player: i32, col: i32, row: i32, strength: Option<i32>, exp: Option<i32>) -> usize {
        let t = *self.d.type_index.get(type_id).unwrap_or_else(|| panic!("Unknown unit type: {type_id}"));
        let index = self.units.len();
        self.units.push(Unit {
            id: index as u32 + 1,
            t,
            player,
            col,
            row,
            strength: strength.unwrap_or(self.d.combat.max_strength),
            exp: exp.unwrap_or(0),
            moved: false,
            mp: self.d.types[t].mv,
            cargo: Vec::new(),
            carried_by: 0,
            in_factory: false,
            shifted: false,
            attacked: false,
            attack_spent: false,
            transfer_used: false,
        });
        index
    }

    pub fn typ(&self, u: usize) -> &'d UnitType {
        &self.d.types[self.units[u].t]
    }
    pub fn is_air(&self, u: usize) -> bool {
        self.typ(u).move_type == MoveType::Air
    }
    pub fn cell(&self, col: i32, row: i32) -> usize {
        (row * self.w + col) as usize
    }
    pub fn terrain_at(&self, col: i32, row: i32) -> &'d crate::data::Terrain {
        &self.d.terrain[self.cells[self.cell(col, row)]]
    }
    /// `playerUnits`: field units of the player, not carried, in board order.
    pub fn player_units(&self, player: i32) -> Vec<usize> {
        self.field
            .iter()
            .copied()
            .filter(|&i| {
                let u = &self.units[i];
                u.player == player && u.carried_by == 0 && !u.in_factory
            })
            .collect()
    }
    /// `playerFactories`: every building the player owns, bases included.
    pub fn player_factories(&self, player: i32) -> Vec<usize> {
        (0..self.buildings.len()).filter(|&b| self.buildings[b].owner == player).collect()
    }
    pub fn in_bounds(&self, col: i32, row: i32) -> bool {
        col >= 0 && col < self.w && row >= 0 && row < self.h
    }
    pub fn unit_by_id(&self, id: u32) -> usize {
        assert!(id >= 1 && (id as usize) <= self.units.len(), "No unit {id}");
        id as usize - 1
    }

    /// `unitAt`: the first field unit in board order on the hex.
    pub fn unit_at(&self, col: i32, row: i32) -> Option<usize> {
        self.field.iter().copied().find(|&i| {
            let u = &self.units[i];
            u.carried_by == 0 && !u.in_factory && u.col == col && u.row == row
        })
    }
    pub fn building(&self, col: i32, row: i32) -> Option<usize> {
        if !self.in_bounds(col, row) {
            return None;
        }
        let b = self.building_at[self.cell(col, row)];
        if b < 0 {
            None
        } else {
            Some(b as usize)
        }
    }
    pub fn in_enemy_zoc(&self, col: i32, row: i32, player: i32) -> bool {
        self.in_bounds(col, row)
            && hex::neighbors(col, row).iter().any(|&(c, r)| matches!(self.unit_at(c, r), Some(u) if self.units[u].player != player))
    }
    pub fn is_surrounded(&self, u: usize) -> bool {
        let unit = &self.units[u];
        for (c, r) in hex::neighbors(unit.col, unit.row) {
            if !self.in_bounds(c, r) {
                return false;
            }
            let enemy_there = matches!(self.unit_at(c, r), Some(o) if self.units[o].player != unit.player);
            if !enemy_there && !self.in_enemy_zoc(c, r, unit.player) {
                return false;
            }
        }
        true
    }
    pub fn adjacent_allies(&self, col: i32, row: i32, player: i32, exclude: usize) -> Vec<usize> {
        hex::neighbors(col, row)
            .iter()
            .filter_map(|&(c, r)| self.unit_at(c, r))
            .filter(|&o| self.units[o].player == player && o != exclude)
            .collect()
    }
    pub fn can_stop_at_building(&self, u: usize, col: i32, row: i32) -> bool {
        let Some(b) = self.building(col, row) else { return true };
        let b = &self.buildings[b];
        if b.base || self.typ(u).move_type == MoveType::Air {
            return true;
        }
        if b.owner != self.units[u].player {
            return self.typ(u).capture;
        }
        true
    }
    pub fn can_load(&self, transport: usize, passenger: usize, from_factory: bool) -> bool {
        let (tu, pu) = (&self.units[transport], &self.units[passenger]);
        let (tt, pt) = (self.typ(transport), self.typ(passenger));
        if transport == passenger
            || tu.player != pu.player
            || tt.cargo == 0
            || tu.transfer_used
            || tu.cargo.len() as i32 >= tt.cargo
            || pt.move_type == MoveType::Air
            || !pu.cargo.is_empty()
        {
            return false;
        }
        match &tt.cargo_types {
            None => true,
            Some(allowed) => {
                allowed.contains(&pu.t)
                    || (from_factory && tt.cargo_factory_types.as_ref().is_some_and(|f| f.contains(&pu.t)))
            }
        }
    }
    pub fn enters_building(&self, u: usize, col: i32, row: i32) -> bool {
        let Some(b) = self.building(col, row) else { return false };
        let b = &self.buildings[b];
        let unit = &self.units[u];
        (!b.base && b.owner == unit.player) || (self.typ(u).capture && b.owner != unit.player)
    }

    /// The Dijkstra search behind `movementRange`, with the verified ZOC exit
    /// rule and FIFO ties, stopping once `dest` is settled.
    pub fn search_moves(&self, u: usize, dest: Option<usize>) -> MoveSearch {
        self.search_moves_as(u, self.units[u].mp, self.units[u].shifted, dest)
    }
    /// The search for the unit with the given movement allowance and shift
    /// flag; AI_MODEL's `fresh(unit)` searches with a full, unspent budget.
    pub fn search_moves_as(&self, u: usize, mp: i32, shifted: bool, dest: Option<usize>) -> MoveSearch {
        let unit = &self.units[u];
        assert!(self.in_bounds(unit.col, unit.row), "Unit at {},{} is outside the map", unit.col, unit.row);
        let start = self.cell(unit.col, unit.row);
        let mut order = vec![start];
        if shifted || mp <= 0 {
            return MoveSearch { order, cost: vec![0], flags: vec![CAN_STOP] };
        }
        SCRATCH.with(|scratch| {
            let mut guard = scratch.borrow_mut();
            let sc = &mut *guard;
            let size = self.cells.len();
            if sc.best.len() < size {
                sc.best.resize(size, i32::MAX);
                sc.flags.resize(size, 0);
                sc.occupant.resize(size, -1);
                sc.zone.resize(size, 0);
            }
            sc.best[start] = 0;
            sc.flags[start] = CAN_STOP;
            let t = self.typ(u);
            let step_cost = &self.tables.step[unit.t];
            let nbr = &self.tables.neighbors;
            let air = t.move_type == MoveType::Air;
            let budget = mp;
            for &i in &self.field {
                let o = &self.units[i];
                if o.carried_by != 0 || o.in_factory || !self.in_bounds(o.col, o.row) {
                    continue;
                }
                let at = self.cell(o.col, o.row);
                if sc.occupant[at] < 0 {
                    sc.occupant[at] = i as i32;
                    sc.filled.push(at);
                }
            }
            if sc.buckets.len() <= budget as usize {
                sc.buckets.resize(budget as usize + 1, Vec::new());
            }
            sc.buckets[0].push(start as u32);
            let (mut cur_cost, mut read) = (0i32, 0usize);
            loop {
                while cur_cost <= budget && read >= sc.buckets[cur_cost as usize].len() {
                    sc.buckets[cur_cost as usize].clear();
                    cur_cost += 1;
                    read = 0;
                }
                if cur_cost > budget {
                    break;
                }
                let c = sc.buckets[cur_cost as usize][read] as usize;
                read += 1;
                if cur_cost != sc.best[c] {
                    continue;
                }
                if Some(c) == dest {
                    break;
                }
                if sc.flags[c] & STOP != 0 && c != start {
                    continue;
                }
                for s in c * 6..c * 6 + 6 {
                    let n = nbr[s];
                    if n < 0 {
                        continue;
                    }
                    let n = n as usize;
                    let mut step = step_cost[n];
                    if step < 0 {
                        continue;
                    }
                    let drains = self.tables.drains[n] && !air;
                    if drains {
                        step = budget - cur_cost;
                        if step < 1 {
                            continue;
                        }
                    }
                    let new_cost = cur_cost + step;
                    if new_cost > budget || new_cost >= sc.best[n] {
                        continue;
                    }
                    let occ = sc.occupant[n];
                    let mut load = false;
                    if occ >= 0 {
                        if self.units[occ as usize].player != unit.player {
                            continue;
                        }
                        if self.can_load(occ as usize, u, false) {
                            load = true;
                        }
                    }
                    let entering_zoc = if sc.zone[n] != 0 {
                        sc.zone[n] == 2
                    } else {
                        let hit = nbr[n * 6..n * 6 + 6].iter().any(|&m| m >= 0 && sc.occupant[m as usize] >= 0 && self.units[sc.occupant[m as usize] as usize].player != unit.player);
                        sc.zone[n] = if hit { 2 } else { 1 };
                        hit
                    };
                    let (nc, nr) = (n as i32 % self.w, n as i32 / self.w);
                    let mut can_stop = occ < 0 || load;
                    if !load && self.building_at[n] >= 0 && !self.can_stop_at_building(u, nc, nr) {
                        can_stop = false;
                    }
                    let enters = can_stop && !load && self.building_at[n] >= 0 && self.enters_building(u, nc, nr);
                    if sc.best[n] == i32::MAX {
                        order.push(n);
                    }
                    sc.best[n] = new_cost;
                    sc.flags[n] = (if entering_zoc || drains { STOP } else { 0 })
                        | (if can_stop { CAN_STOP } else { 0 })
                        | (if load { LOAD } else { 0 })
                        | (if enters { ENTER } else { 0 });
                    if !load {
                        sc.buckets[new_cost as usize].push(n as u32);
                    }
                }
            }
            for b in sc.buckets.iter_mut() {
                b.clear();
            }
            let cost = order.iter().map(|&c| sc.best[c]).collect();
            let flags = order.iter().map(|&c| sc.flags[c]).collect();
            for &c in &order {
                sc.best[c] = i32::MAX;
                sc.flags[c] = 0;
                sc.zone[c] = 0;
            }
            for i in 0..sc.filled.len() {
                let at = sc.filled[i];
                sc.occupant[at] = -1;
            }
            sc.filled.clear();
            MoveSearch { order, cost, flags }
        })
    }

    /// `stoppingCells`: reached cells where the move may end without boarding
    /// or entering a building, in search order; `fresh` searches as
    /// AI_MODEL's `fresh(unit)`.
    pub fn stopping_cells(&self, u: usize, fresh: bool) -> Vec<usize> {
        let s = if fresh { self.search_moves_as(u, self.typ(u).mv, false, None) } else { self.search_moves(u, None) };
        (0..s.order.len()).filter(|&i| s.flags[i] & CAN_STOP != 0 && s.flags[i] & (LOAD | ENTER) == 0).map(|i| s.order[i]).collect()
    }

    /// `attackCells`: cells from which the unit could fire on one of `among`.
    pub fn attack_cells(&self, u: usize, among: &[usize]) -> Vec<u8> {
        let (w, h) = (self.w, self.h);
        let mut cells = vec![0u8; (w * h) as usize];
        let t = self.typ(u);
        for &e in among {
            let o = &self.units[e];
            if o.player == self.units[u].player || o.carried_by != 0 || o.in_factory {
                continue;
            }
            let Some((min, max)) = range_band(t, self.is_air(e)) else { continue };
            for r in (o.row - max - 1).max(0)..=(o.row + max + 1).min(h - 1) {
                for c in (o.col - max).max(0)..=(o.col + max).min(w - 1) {
                    let d = hex::distance(c, r, o.col, o.row);
                    if d >= min && d <= max {
                        cells[(r * w + c) as usize] = 1;
                    }
                }
            }
        }
        cells
    }

    pub fn attack_targets(&self, u: usize) -> Vec<usize> {
        let t = self.typ(u);
        let unit = &self.units[u];
        if t.rng_g == 0 && t.rng_a == 0 {
            return Vec::new();
        }
        self.field
            .iter()
            .copied()
            .filter(|&e| {
                let o = &self.units[e];
                o.player != unit.player
                    && o.carried_by == 0
                    && !o.in_factory
                    && can_attack_at(t, self.is_air(e), hex::distance(unit.col, unit.row, o.col, o.row))
            })
            .collect()
    }
    pub fn can_move_now(&self, u: usize) -> bool {
        let unit = &self.units[u];
        self.winner < 0
            && unit.player == self.current
            && !unit.moved
            && !unit.shifted
            && unit.carried_by == 0
            && !unit.in_factory
            && self.unit_at(unit.col, unit.row) == Some(u)
    }
    pub fn can_attack_now(&self, u: usize) -> bool {
        let unit = &self.units[u];
        self.winner < 0
            && unit.player == self.current
            && !unit.moved
            && !unit.attacked
            && unit.carried_by == 0
            && !unit.in_factory
            && unit.cargo.is_empty()
            && !(self.typ(u).move_or_fire && unit.attack_spent)
            && self.unit_at(unit.col, unit.row) == Some(u)
    }
    pub fn legal_attack_targets(&self, u: usize) -> Vec<usize> {
        if self.can_attack_now(u) {
            self.attack_targets(u)
        } else {
            Vec::new()
        }
    }

    /// Returns whether the unit boarded a transport.
    pub fn move_unit(&mut self, u: usize, col: i32, row: i32) -> Result<bool, String> {
        if !self.can_move_now(u) {
            return Err("Unit cannot move now".into());
        }
        if !self.in_bounds(col, row) {
            return Err("Illegal move".into());
        }
        let dest = self.cell(col, row);
        let s = self.search_moves(u, Some(dest));
        let Some((cost, flags)) = s.find(dest).filter(|&(_, f)| f & CAN_STOP != 0) else {
            return Err("Illegal move".into());
        };
        let load = flags & LOAD != 0;
        if !load && !self.can_stop_at_building(u, col, row) {
            return Err("Cannot stop on an unowned factory".into());
        }
        let transport = if load { self.unit_at(col, row) } else { None };
        if load && !transport.is_some_and(|t| self.can_load(t, u, false)) {
            return Err("Cannot board this transport".into());
        }
        let t = self.typ(u);
        if t.move_or_fire && cost > 0 {
            self.units[u].attack_spent = true;
        }
        self.units[u].mp -= cost;
        if let Some(tr) = transport {
            let tid = self.units[tr].id;
            self.units[tr].cargo.push(u);
            self.units[tr].transfer_used = true;
            let unit = &mut self.units[u];
            unit.carried_by = tid;
            unit.col = col;
            unit.row = row;
            unit.moved = true;
            unit.mp = 0;
            return Ok(true);
        }
        let unit = &mut self.units[u];
        unit.col = col;
        unit.row = row;
        if flags & STOP != 0 && (!t.move_after_attack || unit.attacked) {
            unit.mp = 0;
        }
        Ok(false)
    }

    pub fn enemy_base_captured(&self, player: i32, b: usize) -> bool {
        let (col, row) = (self.buildings[b].col, self.buildings[b].row);
        for def in &self.d.boards[self.board].buildings {
            if def.col == col && def.row == row {
                return matches!(def.owner, Some(o) if o != -1 && o != player);
            }
        }
        true
    }

    pub fn finish_unit(&mut self, u: usize) {
        if self.units[u].in_factory {
            return;
        }
        let (col, row, player) = (self.units[u].col, self.units[u].row, self.units[u].player);
        if let Some(b) = self.building(col, row) {
            if self.typ(u).capture && self.buildings[b].owner != player {
                self.buildings[b].owner = player;
                for s in self.buildings[b].stored.clone() {
                    self.units[s].player = player;
                }
                if !self.buildings[b].base {
                    self.units[u].exp = (self.units[u].exp + 4).min(self.d.combat.max_exp);
                }
                if self.buildings[b].base && self.enemy_base_captured(player, b) {
                    self.winner = player;
                    self.reason = "base";
                }
            }
            if !self.buildings[b].base && self.buildings[b].owner == player && self.winner < 0 {
                let mut storing = vec![u];
                storing.extend(std::mem::take(&mut self.units[u].cargo));
                for s in storing {
                    if let Some(i) = self.field.iter().position(|&x| x == s) {
                        self.field.remove(i);
                    }
                    let (bc, br) = (self.buildings[b].col, self.buildings[b].row);
                    let unit = &mut self.units[s];
                    unit.in_factory = true;
                    unit.carried_by = 0;
                    unit.col = bc;
                    unit.row = br;
                    unit.strength = self.d.combat.max_strength;
                    unit.moved = true;
                    unit.mp = 0;
                    self.buildings[b].stored.push(s);
                }
            }
        }
        self.units[u].moved = true;
        self.units[u].mp = 0;
    }

    fn terrain_value(&self, u: usize) -> i32 {
        if self.is_air(u) {
            0
        } else {
            let unit = &self.units[u];
            self.d.terrain[self.cells[self.cell(unit.col, unit.row)]].def
        }
    }

    pub fn battle_stats(&self, a: usize, d: usize) -> Stats {
        let (au, du) = (&self.units[a], &self.units[d]);
        let dist = hex::distance(au.col, au.row, du.col, du.row);
        let ranged = dist > 1;
        let counter = !ranged && can_attack_at(self.typ(d), self.is_air(a), dist);
        let (a_support, d_support) = if ranged {
            (0, 0)
        } else {
            let attack: i32 =
                self.adjacent_allies(du.col, du.row, au.player, a).iter().map(|&o| atk_stat(self.typ(o), self.is_air(d)) * self.units[o].strength).sum();
            let defense: i32 = self.adjacent_allies(au.col, au.row, du.player, d).iter().map(|&o| self.typ(o).def * self.units[o].strength).sum();
            (attack / (au.strength * 2), defense / (au.strength * 2))
        };
        let surrounded = !ranged && self.is_surrounded(d);
        let a_attack = atk_stat(self.typ(a), self.is_air(d)) + a_support;
        let a_defense = self.typ(a).def + self.terrain_value(a);
        let d_base_attack = atk_stat(self.typ(d), self.is_air(a));
        let d_defense = self.typ(d).def + d_support + self.terrain_value(d);
        let (d_attack, d_defense) = if surrounded { (d_base_attack / 2, d_defense / 2) } else { (d_base_attack, d_defense) };
        Stats { a_ap: cap(a_attack), a_da: cap(a_defense), d_ap: if counter { cap(d_attack) } else { 0 }, d_da: cap(d_defense), counter }
    }

    /// Casualties from one shot (`damageResult`).
    pub fn casualties(&self, shooter: usize, target: usize, ap: i32, da: i32, coefficient: i32) -> i32 {
        let unit_damage = ap * (100 - da) / 100;
        let experienced = unit_damage * self.d.combat.exp_damage[self.units[shooter].exp as usize] / 100;
        let total = experienced * self.units[shooter].strength * coefficient / 100;
        let ts = self.units[target].strength;
        let hp = ts * 100 + if ts > 1 { 50 } else { 0 };
        ts - (hp - total).max(0) / 100
    }

    fn random_coefficient(&mut self) -> i32 {
        let roll = self.rng.next();
        self.d.buckets[(roll * self.d.buckets.len() as f64).floor() as usize]
    }

    pub fn attack(&mut self, a: usize, d: usize) -> Result<Battle, String> {
        if !self.legal_attack_targets(a).contains(&d) {
            return Err(if self.units[a].attacked { "Unit already attacked this turn" } else { "Illegal attack target or unit cannot attack now" }.into());
        }
        let pv = self.battle_stats(a, d);
        let (a0, d0) = (self.units[a].strength, self.units[d].strength);
        let attack_coefficient = self.random_coefficient();
        let to_defender = self.casualties(a, d, pv.a_ap, pv.d_da, attack_coefficient);
        let to_attacker = if pv.counter {
            let c = self.random_coefficient();
            self.casualties(d, a, pv.d_ap, pv.a_da, c)
        } else {
            0
        };
        self.units[d].strength = d0 - to_defender;
        self.units[a].strength = a0 - to_attacker;
        let max_exp = self.d.combat.max_exp;
        if self.units[d].strength == 0 {
            self.units[a].exp = (self.units[a].exp + 2).min(max_exp);
        } else if to_defender > 0 {
            self.units[a].exp = (self.units[a].exp + 1).min(max_exp);
            self.units[d].exp = (self.units[d].exp + 1).min(max_exp);
        } else {
            self.units[d].exp = (self.units[d].exp + 2).min(max_exp);
        }
        for (unit, damaged) in [(a, to_attacker > 0), (d, to_defender > 0)] {
            if damaged {
                let strength = self.units[unit].strength;
                for c in self.units[unit].cargo.clone() {
                    self.units[c].strength = self.units[c].strength.min(strength);
                }
            }
        }
        let result = Battle {
            dmg_to_defender: to_defender,
            dmg_to_attacker: to_attacker,
            attacker_dead: self.units[a].strength == 0,
            defender_dead: self.units[d].strength == 0,
        };
        if result.defender_dead {
            self.remove_unit(d);
        }
        if result.attacker_dead {
            self.remove_unit(a);
        }
        if !result.attacker_dead {
            self.units[a].attacked = true;
            if self.typ(a).move_after_attack && self.units[a].mp > 0 {
                self.units[a].shifted = false;
            } else {
                self.finish_unit(a);
            }
        }
        self.check_elimination();
        Ok(result)
    }

    pub fn remove_unit(&mut self, u: usize) {
        for c in self.units[u].cargo.clone() {
            if let Some(i) = self.field.iter().position(|&x| x == c) {
                self.field.remove(i);
            }
        }
        if let Some(i) = self.field.iter().position(|&x| x == u) {
            self.field.remove(i);
        }
    }

    fn check_elimination(&mut self) {
        if self.winner >= 0 {
            return;
        }
        let mut alive = [0; 2];
        for &i in &self.field {
            if self.typ(i).id != "TRIGGER" {
                alive[self.units[i].player as usize] += 1;
            }
        }
        for b in &self.buildings {
            if b.owner == 0 || b.owner == 1 {
                alive[b.owner as usize] += b.stored.iter().filter(|&&s| !matches!(self.typ(s).id.as_str(), "TRIGGER" | "ATLAS")).count();
            }
        }
        if alive[0] == 0 {
            self.winner = 1;
            self.reason = "elimination";
        } else if alive[1] == 0 {
            self.winner = 0;
            self.reason = "elimination";
        }
    }

    pub fn unload_targets(&self, transport: usize, cargo: usize) -> Vec<(i32, i32)> {
        let (tu, cu) = (&self.units[transport], &self.units[cargo]);
        if self.winner >= 0
            || tu.player != self.current
            || tu.transfer_used
            || cu.moved
            || cu.carried_by != tu.id
            || !tu.cargo.contains(&cargo)
            || self.unit_at(tu.col, tu.row) != Some(transport)
        {
            return Vec::new();
        }
        let ct = self.typ(cargo);
        hex::neighbors(tu.col, tu.row)
            .iter()
            .copied()
            .filter(|&(c, r)| {
                if !self.in_bounds(c, r) {
                    return false;
                }
                let terrain = self.cells[self.cell(c, r)];
                self.unit_at(c, r).is_none()
                    && self.d.terrain_cost(terrain, ct).is_some()
                    && self.d.terrain[terrain].deployable
                    && match self.building(c, r) {
                        None => true,
                        Some(b) => !self.buildings[b].base && self.buildings[b].owner == cu.player,
                    }
            })
            .collect()
    }

    pub fn unload(&mut self, transport: usize, cargo: usize, col: i32, row: i32) -> Result<(), String> {
        if !self.unload_targets(transport, cargo).contains(&(col, row)) {
            return Err("Cargo cannot unload here or has already acted this turn".into());
        }
        let unit = &mut self.units[cargo];
        unit.carried_by = 0;
        unit.col = col;
        unit.row = row;
        unit.moved = true;
        unit.mp = 0;
        let i = self.units[transport].cargo.iter().position(|&x| x == cargo).expect("cargo aboard");
        self.units[transport].cargo.remove(i);
        self.units[transport].transfer_used = true;
        self.finish_unit(cargo);
        Ok(())
    }

    pub fn can_deploy_now(&self, b: usize, u: usize) -> bool {
        let (bd, unit) = (&self.buildings[b], &self.units[u]);
        self.winner < 0
            && self.building(bd.col, bd.row) == Some(b)
            && bd.owner == self.current
            && unit.player == bd.owner
            && unit.in_factory
            && unit.carried_by == 0
            && !unit.moved
            && bd.stored.contains(&u)
    }
    pub fn can_deploy_at(&self, b: usize, u: usize, col: i32, row: i32) -> bool {
        let bd = &self.buildings[b];
        if !self.can_deploy_now(b, u) || !self.in_bounds(col, row) || hex::distance(bd.col, bd.row, col, row) != 1 || self.unit_at(col, row).is_some() {
            return false;
        }
        let terrain = self.cells[self.cell(col, row)];
        self.d.terrain[terrain].deployable && self.d.terrain_cost(terrain, self.typ(u)).is_some() && self.can_stop_at_building(u, col, row)
    }
    pub fn can_deploy_into(&self, b: usize, u: usize, transport: usize) -> bool {
        let (bd, tu) = (&self.buildings[b], &self.units[transport]);
        self.can_deploy_now(b, u)
            && self.can_load(transport, u, true)
            && self.unit_at(tu.col, tu.row) == Some(transport)
            && hex::distance(bd.col, bd.row, tu.col, tu.row) == 1
    }
    /// `deployTargets`: open neighbouring hexes, in neighbour order.
    pub fn deploy_targets(&self, b: usize, u: usize) -> Vec<(i32, i32)> {
        if !self.can_deploy_now(b, u) {
            return Vec::new();
        }
        let bd = &self.buildings[b];
        hex::neighbors(bd.col, bd.row).into_iter().filter(|&(c, r)| self.can_deploy_at(b, u, c, r)).collect()
    }
    /// `transportDeployTargets`: neighbouring transports it can board directly.
    pub fn transport_deploy_targets(&self, b: usize, u: usize) -> Vec<usize> {
        if !self.can_deploy_now(b, u) {
            return Vec::new();
        }
        let bd = &self.buildings[b];
        hex::neighbors(bd.col, bd.row)
            .into_iter()
            .filter(|&(c, r)| self.in_bounds(c, r))
            .filter_map(|(c, r)| self.unit_at(c, r))
            .filter(|&t| self.can_deploy_into(b, u, t))
            .collect()
    }

    pub fn deploy_from_factory(&mut self, b: usize, u: usize, col: i32, row: i32) -> Result<(), String> {
        if !self.can_deploy_at(b, u, col, row) {
            return Err("Unit cannot deploy to this hex now".into());
        }
        let i = self.buildings[b].stored.iter().position(|&x| x == u).expect("stored");
        self.buildings[b].stored.remove(i);
        let owner = self.buildings[b].owner;
        let unit = &mut self.units[u];
        unit.in_factory = false;
        unit.player = owner;
        unit.col = col;
        unit.row = row;
        unit.moved = true;
        unit.mp = 0;
        self.field.push(u);
        if self.building(col, row).is_some() {
            self.finish_unit(u);
        }
        Ok(())
    }

    pub fn load_from_factory(&mut self, b: usize, u: usize, transport: usize) -> Result<(), String> {
        if !self.can_deploy_into(b, u, transport) {
            return Err("Unit cannot deploy into this transport now".into());
        }
        let i = self.buildings[b].stored.iter().position(|&x| x == u).expect("stored");
        self.buildings[b].stored.remove(i);
        let owner = self.buildings[b].owner;
        let (tc, tr, tid) = (self.units[transport].col, self.units[transport].row, self.units[transport].id);
        let unit = &mut self.units[u];
        unit.in_factory = false;
        unit.player = owner;
        unit.col = tc;
        unit.row = tr;
        unit.carried_by = tid;
        unit.moved = true;
        unit.mp = 0;
        self.units[transport].cargo.push(u);
        self.units[transport].transfer_used = true;
        self.field.push(u);
        Ok(())
    }

    fn refresh(&mut self, u: usize) {
        let mv = self.typ(u).mv;
        let unit = &mut self.units[u];
        unit.moved = false;
        unit.attacked = false;
        unit.attack_spent = false;
        unit.transfer_used = false;
        unit.shifted = false;
        unit.mp = mv;
    }

    pub fn end_turn(&mut self) {
        for i in 0..self.field.len() {
            self.refresh(self.field[i]);
        }
        for b in 0..self.buildings.len() {
            for s in 0..self.buildings[b].stored.len() {
                self.refresh(self.buildings[b].stored[s]);
            }
        }
        if self.current != self.first {
            self.turn += 1;
            if self.winner < 0 && self.turn > self.turn_limit {
                self.winner = 1;
                self.reason = "turnlimit";
            }
        }
        self.current = 1 - self.current;
    }

    fn record(&mut self, c: Command) {
        if let Some(log) = &mut self.log {
            log.push(c);
        }
    }
    pub fn do_move(&mut self, u: usize, col: i32, row: i32) -> bool {
        let loaded = self.move_unit(u, col, row).unwrap_or_else(|e| panic!("moveUnit {} to {col},{row}: {e}", self.units[u].id));
        self.record(Command::Move(self.units[u].id, col, row));
        loaded
    }
    pub fn do_finish(&mut self, u: usize) {
        self.finish_unit(u);
        self.record(Command::Finish(self.units[u].id));
    }
    pub fn do_attack(&mut self, a: usize, d: usize) -> Battle {
        let result = self.attack(a, d).unwrap_or_else(|e| panic!("attack {} on {}: {e}", self.units[a].id, self.units[d].id));
        self.record(Command::Attack(self.units[a].id, self.units[d].id));
        result
    }
    pub fn do_unload(&mut self, t: usize, c: usize, col: i32, row: i32) {
        self.unload(t, c, col, row).unwrap_or_else(|e| panic!("unload {} to {col},{row}: {e}", self.units[c].id));
        self.record(Command::Unload(self.units[t].id, self.units[c].id, col, row));
    }
    pub fn do_deploy(&mut self, b: usize, u: usize, col: i32, row: i32) {
        self.deploy_from_factory(b, u, col, row).unwrap_or_else(|e| panic!("deploy {} to {col},{row}: {e}", self.units[u].id));
        let at = (self.buildings[b].col, self.buildings[b].row);
        self.record(Command::Deploy(at, self.units[u].id, col, row));
    }
    pub fn do_load_from_factory(&mut self, b: usize, u: usize, t: usize) {
        self.load_from_factory(b, u, t).unwrap_or_else(|e| panic!("loadFromFactory {} into {}: {e}", self.units[u].id, self.units[t].id));
        let at = (self.buildings[b].col, self.buildings[b].row);
        self.record(Command::LoadFromFactory(at, self.units[u].id, self.units[t].id));
    }
    pub fn do_end_turn(&mut self) {
        self.end_turn();
        self.record(Command::EndTurn);
    }
}

impl Command {
    /// The tournament record's form, `[name, args]`.
    pub fn to_json(&self) -> (String, Vec<serde_json::Value>) {
        use serde_json::json;
        let unit = |id: &u32| json!({ "unit": id });
        let building = |at: &(i32, i32)| json!({ "building": [at.0, at.1] });
        match self {
            Command::Move(u, c, r) => ("moveUnit".into(), vec![unit(u), json!(c), json!(r)]),
            Command::Finish(u) => ("finishUnit".into(), vec![unit(u)]),
            Command::Attack(a, d) => ("attack".into(), vec![unit(a), unit(d)]),
            Command::Unload(t, u, c, r) => ("unload".into(), vec![unit(t), unit(u), json!(c), json!(r)]),
            Command::Deploy(b, u, c, r) => ("deployFromFactory".into(), vec![building(b), unit(u), json!(c), json!(r)]),
            Command::LoadFromFactory(b, u, t) => ("loadFromFactory".into(), vec![building(b), unit(u), unit(t)]),
            Command::EndTurn => ("endTurn".into(), vec![]),
        }
    }
}
