//! The rules of `js/engine.js` and the combat of `js/combat.js`, rule for rule.
//! Unit ids are numbered from 1 in creation order (stored reserves first, then
//! field units), as `tools/sim/state-hash.cjs` numbers them. `field` keeps the
//! engine's `units` list in its exact order, because board order decides
//! occupancy ties, iteration and the state fingerprint.

use crate::data::{Board, Data, MoveType, StoredDef, Tables, UnitType, DRAIN};
use crate::dice::{ChaCha, Dice, Seed};
use crate::hex;
use std::rc::Rc;

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
    /// The unit on each cell, -1 for none: every field unit not carried and
    /// not stored. The rules never put two such units on one cell, so this
    /// is `unitAt`'s answer.
    pub occ: Vec<i32>,
    /// Per side, how many of its `occ` units stand next to each cell: zones
    /// of control without scanning neighbours. Kept wherever `occ` changes.
    zoc: [Vec<u8>; 2],
    /// Kept movement searches (`Ranges`), read through `&self` lookups.
    ranges: std::cell::RefCell<Ranges>,
    pub turn: i32,
    /// The last turn in which a unit lost a machine or a factory was captured; 0 before any.
    pub progress_turn: i32,
    pub current: i32,
    pub first: i32,
    /// -1 while the match is undecided and after a draw.
    pub winner: i32,
    /// Empty while the match is being played; see `over`.
    pub reason: &'static str,
    /// Private: only the engine's attack rolls them (see dice.rs).
    dice: Dice,
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
    /// The frontier by cost. Costs never decrease as the search proceeds, so
    /// taking the cheapest bucket in insertion order is exactly the heap order
    /// (cost, then first pushed).
    buckets: Vec<Vec<u32>>,
}
thread_local! {
    static SCRATCH: std::cell::RefCell<Scratch> = std::cell::RefCell::new(Scratch::default());
}

/// A unit's movement search kept with the cells whose state it read and the
/// unit state it started from (cell, movement, shifted, cargo count).
struct Kept {
    search: Rc<MoveSearch>,
    read: Vec<u64>,
    from: (usize, i32, bool, usize),
    /// The unit's move commands from this search, built on first use.
    moves: std::cell::OnceCell<Vec<Command>>,
}

/// Each unit's kept searches: with its current movement, and fresh (full
/// movement, not shifted). A search stays valid while its unit's own state
/// is unchanged and no cell it read has changed as its side sees it. The
/// engine marks, per side, every cell whose state that side's searches read
/// changed: occupants and building owners for both sides, a side's zone for
/// the other side, a transport's load for its own side. A lookup first drops
/// the searches that read a cell marked for their side.
/// Only the game being played keeps searches: the bots' copies for imagined
/// lines search as before, since their own caches answer first. The tables are
/// allocated on the first kept search.
#[derive(Default)]
struct Ranges {
    keeps: bool,
    current: Vec<Option<Rc<Kept>>>,
    fresh: Vec<Option<Rc<Kept>>>,
    /// The side of each unit, by index; shared with copies.
    side: Rc<Vec<u8>>,
    changed: [Vec<u64>; 2],
    pending: bool,
    cells: usize,
}
impl Ranges {
    fn new(sides: Vec<u8>, cells: usize) -> Ranges {
        Ranges { keeps: true, side: Rc::new(sides), cells, ..Ranges::default() }
    }
    /// A copied position's: the same sides, keeping nothing.
    fn for_copy(&self) -> Ranges {
        Ranges { side: self.side.clone(), cells: self.cells, ..Ranges::default() }
    }
    fn keep(&mut self, u: usize, fresh: bool, kept: Rc<Kept>) {
        if self.current.is_empty() {
            let (units, words) = (self.side.len(), self.cells.div_ceil(64));
            self.current = vec![None; units];
            self.fresh = vec![None; units];
            self.changed = [vec![0; words], vec![0; words]];
        }
        if fresh {
            self.fresh[u] = Some(kept);
        } else {
            self.current[u] = Some(kept);
        }
    }
    fn slot(&self, u: usize, fresh: bool) -> Option<&Rc<Kept>> {
        if fresh { self.fresh.get(u) } else { self.current.get(u) }.and_then(|s| s.as_ref())
    }
    fn drop_unit(&mut self, u: usize) {
        if let Some(s) = self.current.get_mut(u) {
            *s = None;
        }
        if let Some(s) = self.fresh.get_mut(u) {
            *s = None;
        }
    }
    fn mark(&mut self, cell: usize, side: usize) {
        if self.current.is_empty() {
            return;
        }
        self.changed[side][cell / 64] |= 1 << (cell % 64);
        self.pending = true;
    }
    fn mark_both(&mut self, cell: usize) {
        self.mark(cell, 0);
        self.mark(cell, 1);
    }
    fn settle(&mut self) {
        if !self.pending {
            return;
        }
        let (changed, side) = (&self.changed, &self.side);
        for slots in [&mut self.current, &mut self.fresh] {
            for (u, slot) in slots.iter_mut().enumerate() {
                // Only a unit on a side (never a neutral reserve) has a search.
                if slot.as_ref().is_some_and(|k| k.read.iter().zip(&changed[side[u] as usize]).any(|(r, c)| r & c != 0)) {
                    *slot = None;
                }
            }
        }
        self.changed[0].fill(0);
        self.changed[1].fill(0);
        self.pending = false;
    }
    fn clear(&mut self) {
        self.current.fill(None);
        self.fresh.fill(None);
        self.changed[0].fill(0);
        self.changed[1].fill(0);
        self.pending = false;
    }
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
    pub fn new(d: &'d Data, board: usize, seed: &Seed, first_player: i32) -> Game<'d> {
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
            occ: vec![-1; tables.cells.len()],
            zoc: [vec![0; tables.cells.len()], vec![0; tables.cells.len()]],
            ranges: std::cell::RefCell::new(Ranges::new(Vec::new(), tables.cells.len())),
            turn: 1,
            progress_turn: 0,
            current: if first_player == 1 { 1 } else { 0 },
            first: if first_player == 1 { 1 } else { 0 },
            winner: -1,
            reason: "",
            dice: Dice::Match(ChaCha::new(seed)),
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
            assert!(g.in_bounds(def.x, def.y), "{}: unit at {},{} is off the board", b.name, def.x, def.y);
            let at = g.cell(def.x, def.y);
            assert!(g.occ[at] < 0, "{}: two units start at {},{}", b.name, def.x, def.y);
            g.occ[at] = u as i32;
            g.mark_zone(at, g.units[u].player, true);
            g.field.push(u);
        }
        g.ranges = std::cell::RefCell::new(Ranges::new(g.units.iter().map(|u| u.player as u8).collect(), g.cells.len()));
        g
    }

    /// Moves a unit that stands on the board, keeping the occupancy grid.
    /// The bots' what-if positions use it too.
    pub fn relocate(&mut self, u: usize, col: i32, row: i32) {
        let (oc, or) = (self.units[u].col, self.units[u].row);
        let old = self.cell(oc, or);
        assert_eq!(self.occ[old], u as i32, "unit {} is not on the board at {oc},{or}", self.units[u].id);
        self.occ[old] = -1;
        self.ranges.get_mut().mark_both(old);
        self.mark_zone(old, self.units[u].player, false);
        let new = self.cell(col, row);
        assert!(self.occ[new] < 0, "{col},{row} is occupied");
        self.occ[new] = u as i32;
        self.ranges.get_mut().mark_both(new);
        self.mark_zone(new, self.units[u].player, true);
        self.units[u].col = col;
        self.units[u].row = row;
    }
    /// Counts a board unit of `player` at `cell` into its neighbours' zones,
    /// or takes it out. A cell whose zone turns on or off is marked changed.
    fn mark_zone(&mut self, cell: usize, player: i32, add: bool) {
        let side = &mut self.zoc[player as usize];
        let ranges = self.ranges.get_mut();
        for &m in &self.tables.neighbors[6 * cell..6 * cell + 6] {
            if m >= 0 {
                let z = &mut side[m as usize];
                if add {
                    *z += 1;
                } else {
                    *z -= 1;
                }
                if *z == u8::from(add) {
                    ranges.mark(m as usize, 1 - player as usize);
                }
            }
        }
    }
    /// Sets a transport's transfer flag, which other units' boarding reads.
    pub fn set_transfer_used(&mut self, u: usize, used: bool) {
        self.units[u].transfer_used = used;
        self.mark_unit(u);
    }
    /// Marks the cell of a board unit whose boarding state changed.
    fn mark_unit(&mut self, u: usize) {
        let x = &self.units[u];
        if x.carried_by == 0 && !x.in_factory {
            let (at, side) = (self.cell(x.col, x.row), x.player as usize);
            self.ranges.get_mut().mark(at, side);
        }
    }
    /// Panics unless the grid holds exactly the field units that are neither
    /// carried nor stored, each on its own cell, and the zone counts match.
    fn verify_grid(&self) {
        let mut expect = vec![-1i32; self.cells.len()];
        let mut zones = [vec![0u8; self.cells.len()], vec![0u8; self.cells.len()]];
        for &i in &self.field {
            let u = &self.units[i];
            if u.carried_by == 0 && !u.in_factory {
                let at = self.cell(u.col, u.row);
                assert!(expect[at] < 0, "units {} and {} share {},{}", self.units[expect[at] as usize].id, u.id, u.col, u.row);
                expect[at] = i as i32;
                for &m in &self.tables.neighbors[6 * at..6 * at + 6] {
                    if m >= 0 {
                        zones[u.player as usize][m as usize] += 1;
                    }
                }
            }
        }
        assert_eq!(expect, self.occ, "the occupancy grid disagrees with the unit list");
        assert_eq!(zones, self.zoc, "the zone-of-control counts disagree with the unit list");
    }
    fn leave_board(&mut self, u: usize) {
        let at = self.cell(self.units[u].col, self.units[u].row);
        assert_eq!(self.occ[at], u as i32, "unit {} is not on the board", self.units[u].id);
        self.occ[at] = -1;
        self.ranges.get_mut().mark_both(at);
        self.mark_zone(at, self.units[u].player, false);
    }
    fn enter_board(&mut self, u: usize) {
        let at = self.cell(self.units[u].col, self.units[u].row);
        assert!(self.occ[at] < 0, "a unit already stands at {},{}", self.units[u].col, self.units[u].row);
        self.occ[at] = u as i32;
        self.ranges.get_mut().mark_both(at);
        self.mark_zone(at, self.units[u].player, true);
    }

    /// The dice state for the state fingerprint, which alone can make the key.
    pub fn dice_text(&self, _: &crate::hash::DiceAccess) -> String {
        self.dice.state_text()
    }

    /// `AI_MODEL.clone`: the same position with a bot's own dice and no log.
    pub fn sim_clone(&self, dice: Dice) -> Game<'d> {
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
            occ: self.occ.clone(),
            zoc: self.zoc.clone(),
            ranges: std::cell::RefCell::new(self.ranges.borrow().for_copy()),
            turn: self.turn,
            progress_turn: self.progress_turn,
            current: self.current,
            first: self.first,
            winner: self.winner,
            reason: self.reason,
            dice,
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
        self.units_of(player).collect()
    }
    /// `player_units` without collecting them.
    pub fn units_of(&self, player: i32) -> impl Iterator<Item = usize> + '_ {
        self.field.iter().copied().filter(move |&i| {
            let u = &self.units[i];
            u.player == player && u.carried_by == 0 && !u.in_factory
        })
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

    /// `unitAt`: the field unit, not carried or stored, on the hex.
    pub fn unit_at(&self, col: i32, row: i32) -> Option<usize> {
        let found = if self.in_bounds(col, row) {
            let o = self.occ[self.cell(col, row)];
            (o >= 0).then_some(o as usize)
        } else {
            None
        };
        if crate::model::VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
            let scan = self.field.iter().copied().find(|&i| {
                let u = &self.units[i];
                u.carried_by == 0 && !u.in_factory && u.col == col && u.row == row
            });
            assert_eq!(found, scan, "the occupancy grid disagrees with the unit list at {col},{row}");
        }
        found
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
        if b.base {
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
    /// rule and FIFO ties, stopping once `dest` is settled. A search without a
    /// destination is kept (`Ranges`). A kept one also answers a destination:
    /// the full search reaches it at the same cost with the same flags.
    pub fn search_moves(&self, u: usize, dest: Option<usize>) -> Rc<MoveSearch> {
        self.kept_search(u, false, dest)
    }
    /// AI_MODEL's `fresh(unit)` search: full movement, not shifted; kept the
    /// same way.
    pub fn fresh_search(&self, u: usize, dest: Option<usize>) -> Rc<MoveSearch> {
        self.kept_search(u, true, dest)
    }
    fn kept_search(&self, u: usize, fresh: bool, dest: Option<usize>) -> Rc<MoveSearch> {
        if let Some(k) = self.kept_lookup(u, fresh) {
            return k.search.clone();
        }
        if dest.is_some() || !self.ranges.borrow().keeps {
            let x = &self.units[u];
            let (mp, shifted) = if fresh { (self.typ(u).mv, false) } else { (x.mp, x.shifted) };
            return Rc::new(self.search::<false>(u, mp, shifted, dest, &mut []));
        }
        self.kept_store(u, fresh).search.clone()
    }
    /// The unit's kept search, computed and kept if it had none.
    fn kept(&self, u: usize, fresh: bool) -> Rc<Kept> {
        self.kept_lookup(u, fresh).unwrap_or_else(|| self.kept_store(u, fresh))
    }
    fn search_start(&self, u: usize, fresh: bool) -> (i32, bool, (usize, i32, bool, usize)) {
        let x = &self.units[u];
        let (mp, shifted) = if fresh { (self.typ(u).mv, false) } else { (x.mp, x.shifted) };
        (mp, shifted, (self.cell(x.col, x.row), mp, shifted, x.cargo.len()))
    }
    fn kept_lookup(&self, u: usize, fresh: bool) -> Option<Rc<Kept>> {
        if !self.ranges.borrow().keeps {
            return None;
        }
        let (mp, shifted, from) = self.search_start(u, fresh);
        let hit = {
            let mut ranges = self.ranges.borrow_mut();
            ranges.settle();
            ranges.slot(u, fresh).filter(|k| k.from == from).cloned()
        };
        if let Some(k) = &hit {
            if crate::model::VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
                let again = self.search::<false>(u, mp, shifted, None, &mut []);
                let s = &k.search;
                assert!(
                    again.order == s.order && again.cost == s.cost && again.flags == s.flags,
                    "a kept movement search differs for unit {} ({})",
                    self.units[u].id,
                    self.typ(u).id
                );
            }
        }
        hit
    }
    fn kept_store(&self, u: usize, fresh: bool) -> Rc<Kept> {
        let (mp, shifted, from) = self.search_start(u, fresh);
        let mut read = vec![0u64; self.cells.len().div_ceil(64)];
        let search = Rc::new(self.search::<true>(u, mp, shifted, None, &mut read));
        let kept = Rc::new(Kept { search, read, from, moves: std::cell::OnceCell::new() });
        let mut ranges = self.ranges.borrow_mut();
        if ranges.keeps {
            ranges.keep(u, fresh, kept.clone());
        }
        kept
    }
    /// The search for the unit with the given movement allowance and shift
    /// flag, not kept.
    pub fn search_moves_as(&self, u: usize, mp: i32, shifted: bool, dest: Option<usize>) -> MoveSearch {
        self.search::<false>(u, mp, shifted, dest, &mut [])
    }
    /// The search itself. With `READ`, it sets in `reads` (a bitset over the
    /// cells) every cell whose state it read: occupant, enemy zone and
    /// building owner, each read only once a step into the cell is cheap
    /// enough to matter.
    fn search<const READ: bool>(&self, u: usize, mp: i32, shifted: bool, dest: Option<usize>, reads: &mut [u64]) -> MoveSearch {
        let unit = &self.units[u];
        assert!(self.in_bounds(unit.col, unit.row), "Unit at {},{} is outside the map", unit.col, unit.row);
        let start = self.cell(unit.col, unit.row);
        if shifted || mp <= 0 {
            return MoveSearch { order: vec![start], cost: vec![0], flags: vec![CAN_STOP] };
        }
        // At most the hexes within reach of the budget: 3r(r+1)+1 for reach r.
        let min_step = self.tables.min_step[unit.t];
        let reach = if min_step > 0 { (mp / min_step) as usize } else { usize::MAX };
        let within = if reach > 64 { usize::MAX } else { 3 * reach * (reach + 1) + 1 };
        let mut order = Vec::with_capacity(within.min(self.cells.len()));
        order.push(start);
        SCRATCH.with(|scratch| {
            let mut guard = scratch.borrow_mut();
            let sc = &mut *guard;
            let size = self.cells.len();
            if sc.best.len() < size {
                sc.best.resize(size, i32::MAX);
                sc.flags.resize(size, 0);
            }
            if crate::model::VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
                self.verify_grid();
            }
            sc.best[start] = 0;
            sc.flags[start] = CAN_STOP;
            let step_cost = &self.tables.move_step[unit.t];
            let nbr = &self.tables.neighbors;
            let enemy_zone = &self.zoc[(1 - unit.player) as usize];
            let budget = mp;
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
                for &n in &nbr[c * 6..c * 6 + 6] {
                    if n < 0 {
                        continue;
                    }
                    let n = n as usize;
                    let mut step = step_cost[n];
                    let drains = step == DRAIN;
                    if step < 0 && !drains {
                        continue;
                    }
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
                    if READ {
                        reads[n / 64] |= 1 << (n % 64);
                    }
                    let occ = self.occ[n];
                    let mut load = false;
                    if occ >= 0 {
                        if self.units[occ as usize].player != unit.player {
                            continue;
                        }
                        if self.can_load(occ as usize, u, false) {
                            load = true;
                        }
                    }
                    let entering_zoc = enemy_zone[n] != 0;
                    let mut can_stop = occ < 0 || load;
                    let mut enters = false;
                    if !load && self.building_at[n] >= 0 {
                        let (nc, nr) = self.tables.coords[n];
                        if !self.can_stop_at_building(u, nc, nr) {
                            can_stop = false;
                        }
                        enters = can_stop && self.enters_building(u, nc, nr);
                    }
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
            }
            MoveSearch { order, cost, flags }
        })
    }

    /// `stoppingCells`: reached cells where the move may end without boarding
    /// or entering a building, in search order; `fresh` searches as
    /// AI_MODEL's `fresh(unit)`.
    pub fn stopping_cells(&self, u: usize, fresh: bool) -> Vec<usize> {
        let s = if fresh { self.fresh_search(u, None) } else { self.search_moves(u, None) };
        let mut cells = Vec::with_capacity(s.order.len());
        cells.extend((0..s.order.len()).filter(|&i| s.flags[i] & CAN_STOP != 0 && s.flags[i] & (LOAD | ENTER) == 0).map(|i| s.order[i]));
        cells
    }

    /// `attackCells`: cells from which the unit could fire on one of `among`.
    pub fn attack_cells(&self, u: usize, among: &[usize]) -> Vec<u8> {
        let (w, h) = (self.w, self.h);
        let mut cells = vec![0; (w * h) as usize];
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
    /// Won or drawn. A draw leaves `winner` at -1, so `winner` alone cannot tell.
    pub fn over(&self) -> bool {
        !self.reason.is_empty()
    }
    pub fn can_move_now(&self, u: usize) -> bool {
        let unit = &self.units[u];
        !self.over()
            && unit.player == self.current
            && !unit.moved
            && !unit.shifted
            && unit.carried_by == 0
            && !unit.in_factory
            && self.unit_at(unit.col, unit.row) == Some(u)
    }
    pub fn can_attack_now(&self, u: usize) -> bool {
        let unit = &self.units[u];
        !self.over()
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
            self.mark_unit(tr);
            self.leave_board(u);
            let unit = &mut self.units[u];
            unit.carried_by = tid;
            unit.col = col;
            unit.row = row;
            unit.moved = true;
            unit.mp = 0;
            return Ok(true);
        }
        self.relocate(u, col, row);
        let unit = &mut self.units[u];
        if flags & STOP != 0 && (!t.move_after_attack || unit.attacked) {
            unit.mp = 0;
        }
        if self.enters_building(u, col, row) {
            self.finish_unit(u);
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
                let at = self.cell(col, row);
                self.ranges.get_mut().mark_both(at);
                for s in self.buildings[b].stored.clone() {
                    self.units[s].player = player;
                    let ranges = self.ranges.get_mut();
                    Rc::make_mut(&mut ranges.side)[s] = player as u8;
                    ranges.drop_unit(s);
                }
                if !self.buildings[b].base {
                    self.units[u].exp = (self.units[u].exp + 4).min(self.d.combat.max_exp);
                    self.progress_turn = self.turn;
                }
                if self.buildings[b].base && self.enemy_base_captured(player, b) {
                    self.winner = player;
                    self.reason = "base";
                }
            }
            if !self.buildings[b].base && self.buildings[b].owner == player && !self.over() {
                let mut storing = vec![u];
                storing.extend(std::mem::take(&mut self.units[u].cargo));
                for s in storing {
                    if self.units[s].carried_by == 0 && !self.units[s].in_factory {
                        self.leave_board(s);
                    }
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
        let roll = self.dice.next();
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
        if to_defender > 0 || to_attacker > 0 {
            self.progress_turn = self.turn;
        }
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
            if self.units[u].carried_by == 0 && !self.units[u].in_factory {
                self.leave_board(u);
            }
            self.field.remove(i);
        }
    }

    fn check_elimination(&mut self) {
        if self.over() {
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
        if self.over()
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
        self.enter_board(cargo);
        let i = self.units[transport].cargo.iter().position(|&x| x == cargo).expect("cargo aboard");
        self.units[transport].cargo.remove(i);
        self.units[transport].transfer_used = true;
        self.mark_unit(transport);
        self.finish_unit(cargo);
        Ok(())
    }

    pub fn can_deploy_now(&self, b: usize, u: usize) -> bool {
        let (bd, unit) = (&self.buildings[b], &self.units[u]);
        !self.over()
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
        self.enter_board(u);
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
        self.mark_unit(transport);
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
        assert!(!self.over(), "The match is over; no side has a turn to end.");
        // Every unit's movement and transfer flags reset.
        self.ranges.get_mut().clear();
        for i in 0..self.field.len() {
            self.refresh(self.field[i]);
        }
        for b in 0..self.buildings.len() {
            for s in 0..self.buildings[b].stored.len() {
                self.refresh(self.buildings[b].stored[s]);
            }
        }
        // A drawn match keeps the number of its last turn.
        if self.current != self.first {
            if self.turn >= self.d.rules.turn_limit {
                self.reason = "turnlimit";
            } else if self.turn - self.progress_turn >= self.d.rules.quiet_turns {
                self.reason = "no-progress";
            } else {
                self.turn += 1;
            }
        }
        self.current = 1 - self.current;
    }

    /// `Game.legalCommands()`: every command the side to move may issue now,
    /// in the same order as JavaScript lists them.
    pub fn legal_commands(&self) -> Vec<Command> {
        if self.over() {
            return Vec::new();
        }
        let mut out = Vec::with_capacity(256);
        for u in self.units_of(self.current) {
            let id = self.units[u].id;
            if self.can_move_now(u) {
                let k = self.kept(u, false);
                let s = &k.search;
                out.extend_from_slice(k.moves.get_or_init(|| {
                    (0..s.order.len())
                        .filter(|&i| s.cost[i] > 0 && s.flags[i] & CAN_STOP != 0)
                        .map(|i| Command::Move(id, self.tables.coords[s.order[i]].0, self.tables.coords[s.order[i]].1))
                        .collect()
                }));
            }
            if self.can_attack_now(u) {
                let (t, unit) = (self.typ(u), &self.units[u]);
                if t.rng_g != 0 || t.rng_a != 0 {
                    for &e in &self.field {
                        let o = &self.units[e];
                        if o.player != unit.player && o.carried_by == 0 && !o.in_factory && can_attack_at(t, self.is_air(e), hex::distance(unit.col, unit.row, o.col, o.row)) {
                            out.push(Command::Attack(id, o.id));
                        }
                    }
                }
            }
            for &c in &self.units[u].cargo {
                for (col, row) in self.unload_targets(u, c) {
                    out.push(Command::Unload(id, self.units[c].id, col, row));
                }
            }
            if !self.units[u].moved {
                out.push(Command::Finish(id));
            }
        }
        for b in self.player_factories(self.current) {
            let at = (self.buildings[b].col, self.buildings[b].row);
            for &s in &self.buildings[b].stored {
                for (col, row) in self.deploy_targets(b, s) {
                    out.push(Command::Deploy(at, self.units[s].id, col, row));
                }
                for t in self.transport_deploy_targets(b, s) {
                    out.push(Command::LoadFromFactory(at, self.units[s].id, self.units[t].id));
                }
            }
        }
        out.push(Command::EndTurn);
        out
    }

    /// Issues a command through the recording methods; panics if the engine
    /// refuses it.
    pub fn do_command(&mut self, c: &Command) {
        let unit = |id: u32| id as usize - 1;
        let building = |g: &Game, at: (i32, i32)| g.building(at.0, at.1).unwrap_or_else(|| panic!("no building at {},{}", at.0, at.1));
        match *c {
            Command::Move(u, col, row) => {
                self.do_move(unit(u), col, row);
            }
            Command::Finish(u) => self.do_finish(unit(u)),
            Command::Attack(a, d) => {
                self.do_attack(unit(a), unit(d));
            }
            Command::Unload(t, u, col, row) => self.do_unload(unit(t), unit(u), col, row),
            Command::Deploy(at, u, col, row) => {
                let b = building(self, at);
                self.do_deploy(b, unit(u), col, row);
            }
            Command::LoadFromFactory(at, u, t) => {
                let b = building(self, at);
                self.do_load_from_factory(b, unit(u), unit(t));
            }
            Command::EndTurn => self.do_end_turn(),
        }
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

#[cfg(test)]
mod tests {
    use super::*;

    fn data() -> Data {
        Data::load(concat!(env!("CARGO_MANIFEST_DIR"), "/data/game-data.json"))
    }

    /// Ends round `turn` on board 0, progress last made in round `progress`.
    fn end_round(d: &Data, turn: i32, progress: i32) -> Game<'_> {
        let mut g = Game::new(d, 0, &Seed::from_text("1"), 0);
        g.turn = turn;
        g.progress_turn = progress;
        g.current = 1 - g.first;
        g.end_turn();
        g
    }

    /// The behaviour lock holds a no-progress draw but no game long enough
    /// for the turn limit.
    #[test]
    fn a_round_that_reaches_a_limit_is_a_draw() {
        let d = data();
        let (quiet, limit) = (d.rules.quiet_turns, d.rules.turn_limit);
        let g = end_round(&d, 150 + quiet - 1, 150);
        assert_eq!((g.winner, g.reason, g.turn), (-1, "", 150 + quiet));
        let g = end_round(&d, 150 + quiet, 150);
        assert_eq!((g.winner, g.reason, g.turn), (-1, "no-progress", 150 + quiet));
        let g = end_round(&d, limit - 1, limit - 1);
        assert_eq!((g.reason, g.turn), ("", limit));
        let g = end_round(&d, limit, limit);
        assert_eq!((g.winner, g.reason, g.turn), (-1, "turnlimit", limit));
    }

    #[test]
    #[should_panic(expected = "The match is over")]
    fn a_finished_match_has_no_turn_to_end() {
        let d = data();
        let mut g = end_round(&d, d.rules.turn_limit, d.rules.turn_limit);
        g.end_turn();
    }
}
