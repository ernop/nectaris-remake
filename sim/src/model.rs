//! AI_MODEL (js/ai-model.js): the capability-based action model the search
//! bots share, operation for operation. JavaScript caches the routes, the
//! enemy stopping cells and each position's analysis; every cached value is a
//! pure function of its key, so this port recomputes or caches them as it
//! likes. Float sums keep JavaScript's order, which fixes their rounding.

use crate::data::{MoveType, UnitType};
use crate::game::{atk_stat, can_attack_at, range_band, Game, MoveSearch, CAN_STOP, ENTER, LOAD};
use crate::hex;
use crate::dice::Dice;
use std::cmp::Ordering;
use std::collections::{BTreeMap, BinaryHeap, HashMap};
use std::fmt::Write;
use std::rc::Rc;

/// Numbers the candidate scoring reads, with the shipped bots' values as the
/// default. A search bot never changes them; the laboratory's tuned greedy
/// player (`marshal.rs`) sets its own for the duration of its turn.
#[derive(Clone, Copy, Debug)]
pub struct Weights {
    /// Score for reducing the unit's own danger (`0.6`).
    pub danger: f64,
    /// Expected-loss scale of the threat map (`0.085`).
    pub danger_scale: f64,
    /// Multiplier on the objective-progress change (`1.0`).
    pub advance: f64,
    /// Score per point of terrain defence gained (`0.1`).
    pub terrain: f64,
    /// Multiplier on the support change (`1.0`).
    pub support: f64,
    /// Cost of any move (`0.35`).
    pub move_cost: f64,
    /// Multiplier on the damage dealt in a trade (`1.0`).
    pub trade_out: f64,
    /// Multiplier on the damage taken in a trade (`1.0`).
    pub trade_in: f64,
    /// Multiplier on the kill bonus (`1.0`).
    pub kill: f64,
    /// Multiplier on the death penalty (`1.0`).
    pub death: f64,
    /// Objective worth of the enemy base for a capturer (`160`).
    pub base_worth: f64,
    /// Objective worth of hunting an enemy for a fighter (`65`).
    pub hunt_worth: f64,
}
impl Weights {
    pub const SHIPPED: Weights = Weights {
        danger: 0.6,
        danger_scale: 0.085,
        advance: 1.0,
        terrain: 0.1,
        support: 1.0,
        move_cost: 0.35,
        trade_out: 1.0,
        trade_in: 1.0,
        kill: 1.0,
        death: 1.0,
        base_worth: 160.0,
        hunt_worth: 65.0,
    };
}
thread_local! {
    static WEIGHTS: std::cell::Cell<Weights> = const { std::cell::Cell::new(Weights::SHIPPED) };
}
pub fn weights() -> Weights {
    WEIGHTS.with(|w| w.get())
}
/// Sets this thread's weights; returns the previous ones.
pub fn set_weights(w: Weights) -> Weights {
    WEIGHTS.with(|c| c.replace(w))
}

/// `ENGINE.CostQueue` on float costs: lowest cost first, FIFO among equals.
struct Entry(f64, u64, usize);
impl PartialEq for Entry {
    fn eq(&self, o: &Self) -> bool {
        self.cmp(o) == Ordering::Equal
    }
}
impl Eq for Entry {}
impl PartialOrd for Entry {
    fn partial_cmp(&self, o: &Self) -> Option<Ordering> {
        Some(self.cmp(o))
    }
}
impl Ord for Entry {
    fn cmp(&self, o: &Self) -> Ordering {
        o.0.partial_cmp(&self.0).expect("finite queue costs").then(o.1.cmp(&self.1))
    }
}
#[derive(Default)]
struct CostQueue {
    heap: BinaryHeap<Entry>,
    order: u64,
}
impl CostQueue {
    fn push(&mut self, cost: f64, cell: usize) {
        self.heap.push(Entry(cost, self.order, cell));
        self.order += 1;
    }
    fn pop(&mut self) -> Option<(f64, usize)> {
        self.heap.pop().map(|Entry(c, _, cell)| (c, cell))
    }
}

pub struct Target {
    pub goals: Rc<Vec<(i32, i32)>>,
    pub worth: f64,
    /// `worth / 1.5`: no distance makes the target worth more.
    pub cap: f64,
    pub field: Rc<[f64]>,
}
pub struct Plan {
    field: Rc<[f64]>,
    foot: Rc<[f64]>,
    worth: f64,
}

/// A word-at-a-time hasher for cache keys; the default SipHash costs more
/// than these lookups save. Keys are compared in full on every hit.
#[derive(Default, Clone, Copy)]
pub struct Fnv(u64);
impl Fnv {
    #[inline]
    fn add(&mut self, x: u64) {
        self.0 = (self.0.rotate_left(5) ^ x).wrapping_mul(0x517c_c1b7_2722_0a95);
    }
}
impl std::hash::Hasher for Fnv {
    fn finish(&self) -> u64 {
        self.0
    }
    fn write(&mut self, bytes: &[u8]) {
        let mut bytes = bytes;
        if bytes.len() >= 32 {
            // Four independent chains: one chain's multiply latency would
            // bound hashing of long keys. Folded back in lane order.
            let mut lanes = [self.0, self.0.rotate_left(16), self.0.rotate_left(32), self.0.rotate_left(48)];
            let mut blocks = bytes.chunks_exact(32);
            for b in &mut blocks {
                for (i, lane) in lanes.iter_mut().enumerate() {
                    let x = u64::from_le_bytes(b[8 * i..8 * i + 8].try_into().unwrap());
                    *lane = (lane.rotate_left(5) ^ x).wrapping_mul(0x517c_c1b7_2722_0a95);
                }
            }
            for lane in lanes {
                self.add(lane);
            }
            bytes = blocks.remainder();
        }
        let mut chunks = bytes.chunks_exact(8);
        for c in &mut chunks {
            self.add(u64::from_le_bytes(c.try_into().unwrap()));
        }
        let rest = chunks.remainder();
        if !rest.is_empty() {
            let mut last = [0u8; 8];
            last[..rest.len()].copy_from_slice(rest);
            self.add(u64::from_le_bytes(last) ^ ((rest.len() as u64) << 59));
        }
    }
    fn write_u8(&mut self, x: u8) {
        self.add(u64::from(x));
    }
    fn write_u32(&mut self, x: u32) {
        self.add(u64::from(x));
    }
    fn write_i32(&mut self, x: i32) {
        self.add(x as u32 as u64);
    }
    fn write_u64(&mut self, x: u64) {
        self.add(x);
    }
    fn write_usize(&mut self, x: usize) {
        self.add(x as u64);
    }
}
pub type FastMap<K, V> = HashMap<K, V, std::hash::BuildHasherDefault<Fnv>>;
pub type FastSet<K> = std::collections::HashSet<K, std::hash::BuildHasherDefault<Fnv>>;

/// Recompute every cached stopping-cell list and panic on a difference, as
/// `AI_MODEL.verifyCachedStops` does in the JavaScript tests.
pub static VERIFY_CACHES: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

#[derive(Default)]
pub struct Ctx {
    /// Walking-distance fields by unit type, then goal list.
    routes: FastMap<usize, FastMap<Vec<(i32, i32)>, Rc<[f64]>>>,
    route_count: usize,
    /// Fields to a single cell, by type * cells + cell.
    single_routes: Vec<Option<Rc<[f64]>>>,
    deliveries: FastMap<(usize, usize, Vec<(i32, i32)>), Rc<[f64]>>,
    stops: FastMap<Vec<i32>, Rc<Vec<usize>>>,
    stop_key: Vec<i32>,
    /// Hexes one enemy's weapon band covers from its stopping cells, keyed by
    /// the stop key plus the band's domain.
    covered: FastMap<Vec<i32>, Rc<Vec<u64>>>,
    /// Candidate lists by position signature and request. `candidates` reads
    /// nothing about a position that `signature` leaves out.
    memo: FastMap<Vec<i32>, Rc<Vec<Action>>>,
    /// Movement records by `search_key`.
    searches: FastMap<Vec<i32>, Rc<Vec<Rec>>>,
    /// Reused buffers for `unit_actions`.
    foes: Vec<usize>,
    fire_from: Vec<u64>,
    /// Each unit's last threatened-hex key and result, by unit index and
    /// domain, checked before the map.
    last_covered: Vec<[Option<(Vec<i32>, Rc<Vec<u64>>)>; 2]>,
    /// `evaluationGoals`: each field unit's objectives at the decision's root.
    pub goals: FastMap<usize, Rc<Vec<Target>>>,
}

pub static MEMO_HITS: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
pub static MEMO_MISSES: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Kind {
    Act,
    Deploy,
    End,
}

/// A planner action. Units by index (id - 1).
#[derive(Clone, Debug)]
pub struct Action {
    pub kind: Kind,
    pub unit: usize,
    pub to: Option<(i32, i32)>,
    pub target: Option<usize>,
    pub cargo: Option<usize>,
    pub drop: Option<(i32, i32)>,
    pub before: bool,
    pub into: Option<usize>,
    pub building: Option<(i32, i32)>,
    pub score: f64,
}
impl Action {
    fn act(unit: usize, to: Option<(i32, i32)>) -> Action {
        Action { kind: Kind::Act, unit, to, target: None, cargo: None, drop: None, before: false, into: None, building: None, score: 0.0 }
    }
    pub fn end(score: f64) -> Action {
        Action { kind: Kind::End, unit: usize::MAX, to: None, target: None, cargo: None, drop: None, before: false, into: None, building: None, score }
    }
    /// `AI_MODEL.key`: equal exactly when the action fields are equal.
    pub fn key(&self) -> Key {
        Key(self.kind, self.unit, self.to, self.target, self.cargo, self.drop, self.before, self.into, self.building)
    }
}
#[derive(Clone, PartialEq, Eq, Hash, Debug)]
pub struct Key(Kind, usize, Option<(i32, i32)>, Option<usize>, Option<usize>, Option<(i32, i32)>, bool, Option<usize>, Option<(i32, i32)>);

/// Stable sort by score, highest first (`sort((a, b) => b.score - a.score)`).
pub fn sort_desc<T>(list: &mut [T], score: impl Fn(&T) -> f64) {
    list.sort_by(|a, b| score(b).partial_cmp(&score(a)).unwrap_or(Ordering::Equal));
}

/// The first `limit` actions of the stable highest-score-first sort, without
/// sorting the rest: (score descending, position ascending) is a total order
/// whose first entries are exactly the stable sort's.
pub fn best_actions(list: Vec<Action>, limit: usize) -> Vec<Action> {
    if limit == 0 {
        return Vec::new();
    }
    if limit <= 8 {
        // One pass keeping the best `limit` in order. Entries arrive in
        // position order, so a newcomer displaces only on a higher score and
        // goes after every kept entry that scores at least as much.
        let mut top: Vec<(f64, usize)> = Vec::with_capacity(limit + 1);
        for (i, a) in list.iter().enumerate() {
            let s = a.score;
            assert!(!s.is_nan(), "an action scored NaN");
            if top.len() == limit && s <= top[limit - 1].0 {
                continue;
            }
            let at = top.iter().position(|&(t, _)| s > t).unwrap_or(top.len());
            top.insert(at, (s, i));
            top.truncate(limit);
        }
        return top.into_iter().map(|(_, i)| list[i].clone()).collect();
    }
    let mut order: Vec<(f64, u32)> = list.iter().enumerate().map(|(i, a)| {
        assert!(!a.score.is_nan(), "an action scored NaN");
        (a.score, i as u32)
    }).collect();
    let by = |a: &(f64, u32), b: &(f64, u32)| b.0.partial_cmp(&a.0).unwrap().then(a.1.cmp(&b.1));
    if order.len() > limit {
        order.select_nth_unstable_by(limit, by);
        order.truncate(limit);
    }
    order.sort_unstable_by(by);
    order.into_iter().map(|(_, i)| list[i as usize].clone()).collect()
}

/// `unitActions`' deduplication in full: the first position of each key with
/// its best-scoring action, then the stable sort.
fn dedup_sort(actions: Vec<Action>) -> Vec<Action> {
    let mut unique: Vec<Action> = Vec::with_capacity(actions.len());
    let mut at: FastMap<Key, usize> = FastMap::default();
    for a in actions {
        match at.entry(a.key()) {
            std::collections::hash_map::Entry::Vacant(v) => {
                v.insert(unique.len());
                unique.push(a);
            }
            std::collections::hash_map::Entry::Occupied(o) => {
                let i = *o.get();
                if unique[i].score < a.score {
                    unique[i] = a;
                }
            }
        }
    }
    sort_desc(&mut unique, |a| a.score);
    unique
}

fn is_air_type(t: &UnitType) -> bool {
    t.move_type == MoveType::Air
}

pub fn base_value(t: &UnitType) -> f64 {
    let attack = t.atk_g.max(t.atk_a);
    18.0 + f64::from(attack.min(100)) * 0.7
        + f64::from(t.def.min(100)) * 0.65
        + f64::from(t.atk_g.min(t.atk_a).min(100)) * 0.15
        + f64::from(t.mv) * 2.0
        + f64::from(t.rng_g.max(t.rng_a)) * 7.0
        + if t.capture { 65.0 } else { 0.0 }
        + f64::from(t.cargo) * 25.0
}
fn value_at(g: &Game, t: &UnitType, strength: i32, exp: i32) -> f64 {
    if strength <= 0 {
        return 0.0;
    }
    let c = &g.d.combat;
    t.base_value * (0.2 + 0.8 * f64::from(strength) / f64::from(c.max_strength)) * (0.75 + 0.25 * f64::from(c.exp_damage[exp as usize]) / 100.0)
}
pub fn value(g: &Game, u: usize) -> f64 {
    value_at(g, g.typ(u), g.units[u].strength, g.units[u].exp)
}
fn full_value(g: &Game, u: usize) -> f64 {
    value_at(g, g.typ(u), g.d.combat.max_strength, g.units[u].exp)
}

/// The cell's on-board neighbours in `hex::neighbors` order.
fn neighbor_cells<'a>(g: &'a Game<'_>, cell: usize) -> impl Iterator<Item = usize> + 'a {
    g.tables.neighbors[6 * cell..6 * cell + 6].iter().filter(|&&n| n >= 0).map(|&n| n as usize)
}

thread_local! {
    /// `distances`' working distances and bucket queue, reused between calls.
    static ROUTE_SCRATCH: std::cell::RefCell<(Vec<u32>, Vec<Vec<u32>>)> = const { std::cell::RefCell::new((Vec::new(), Vec::new())) };
}

/// Reverse multi-source walking distances to the goals over chassis terrain,
/// cached per type and goal list. A single on-board goal (a building) has a
/// dense slot per type and cell instead of a keyed entry.
fn distances(g: &Game, t_index: usize, goals: &[(i32, i32)], ctx: &mut Ctx) -> Rc<[f64]> {
    if let [(c, r)] = *goals {
        if g.in_bounds(c, r) {
            let size = g.cells.len();
            if ctx.single_routes.is_empty() {
                ctx.single_routes = vec![None; g.d.types.len() * size];
            }
            let slot = t_index * size + g.cell(c, r);
            if let Some(f) = &ctx.single_routes[slot] {
                return f.clone();
            }
            let field: Rc<[f64]> = Rc::from(walk_distances(g, t_index, goals));
            ctx.single_routes[slot] = Some(field.clone());
            return field;
        }
    }
    if let Some(f) = ctx.routes.get(&t_index).and_then(|m| m.get(goals)) {
        return f.clone();
    }
    let result = walk_distances(g, t_index, goals);
    if ctx.route_count > 4096 {
        ctx.routes.clear();
        ctx.route_count = 0;
    }
    let field: Rc<[f64]> = Rc::from(result);
    ctx.routes.entry(t_index).or_default().insert(goals.to_vec(), field.clone());
    ctx.route_count += 1;
    field
}

/// The distances themselves. JavaScript runs a float cost queue; every step
/// costs a whole number, so the distances are whole numbers, and shortest
/// distances do not depend on the order equal costs leave the queue. A bucket
/// queue on integers gives the same values.
fn walk_distances(g: &Game, t_index: usize, goals: &[(i32, i32)]) -> Vec<f64> {
    let t = &g.d.types[t_index];
    let costs = &g.tables.step[t_index];
    let air = is_air_type(t);
    let drain = t.mv.max(1) as u32;
    ROUTE_SCRATCH.with(|scratch| {
        let (dist, buckets) = &mut *scratch.borrow_mut();
        dist.clear();
        dist.resize(costs.len(), u32::MAX);
        let widest = (g.tables.max_step[t_index] as u32).max(if air { 0 } else { drain });
        let span = widest as usize + 1;
        if buckets.len() < span {
            buckets.resize_with(span, Vec::new);
        }
        let mut pending = 0usize;
        for &(c, r) in goals {
            if !g.in_bounds(c, r) || costs[g.cell(c, r)] < 0 {
                continue;
            }
            let at = g.cell(c, r);
            dist[at] = 0;
            buckets[0].push(at as u32);
            pending += 1;
        }
        let mut cost = 0u32;
        while pending > 0 {
            let bucket = cost as usize % span;
            while let Some(c) = buckets[bucket].pop() {
                pending -= 1;
                let c = c as usize;
                if dist[c] != cost {
                    continue;
                }
                let next = cost + if !air && g.tables.drains[c] { drain } else { costs[c] as u32 };
                for &n in &g.tables.neighbors[6 * c..6 * c + 6] {
                    if n < 0 || costs[n as usize] < 0 || next >= dist[n as usize] {
                        continue;
                    }
                    dist[n as usize] = next;
                    buckets[next as usize % span].push(n as u32);
                    pending += 1;
                }
            }
            cost += 1;
        }
        dist.iter().map(|&d| if d == u32::MAX { f64::INFINITY } else { f64::from(d) }).collect::<Vec<f64>>()
    })
}

pub fn objectives(g: &Game, u: usize, ctx: &mut Ctx) -> Vec<Target> {
    let wt = weights();
    let unit = &g.units[u];
    let t = g.typ(u);
    let player = unit.player;
    let mut targets: Vec<(Vec<(i32, i32)>, f64)> = Vec::new();
    if t.capture {
        for b in &g.buildings {
            if b.owner == player {
                continue;
            }
            let worth = if b.base { wt.base_worth } else { 65.0 + b.stored.iter().fold(0.0, |s, &v| s + value(g, v) * 0.4) };
            targets.push((vec![(b.col, b.row)], worth));
        }
    }
    if t.atk_g != 0 || t.atk_a != 0 {
        let mut enemies: Vec<usize> = g.units_of(1 - player).filter(|&e| range_band(t, g.is_air(e)).is_some()).collect();
        enemies.sort_by_cached_key(|&e| hex::distance(unit.col, unit.row, g.units[e].col, g.units[e].row));
        for &e in enemies.iter().take(3) {
            let (min, max) = range_band(t, g.is_air(e)).unwrap();
            let enemy = &g.units[e];
            let mut goals = Vec::new();
            for r in (enemy.row - max - 1).max(0)..=(enemy.row + max + 1).min(g.h - 1) {
                for c in (enemy.col - max).max(0)..=(enemy.col + max).min(g.w - 1) {
                    let d = hex::distance(c, r, enemy.col, enemy.row);
                    if d >= min && d <= max && g.can_stop_at_building(u, c, r) {
                        goals.push((c, r));
                    }
                }
            }
            targets.push((goals, (if t.capture { 15.0 } else { wt.hunt_worth }) + value(g, e) * 0.08));
        }
    }
    for b in &g.buildings {
        if !b.base || b.owner != player {
            continue;
        }
        let mut urgency: f64 = 0.0;
        for e in g.units_of(1 - player) {
            let et = g.typ(e);
            if !et.capture || et.mv == 0 {
                continue;
            }
            let field = distances(g, g.units[e].t, &[(b.col, b.row)], ctx);
            let turns = field[g.cell(g.units[e].col, g.units[e].row)] / f64::from(et.mv);
            if turns <= 2.0 {
                urgency = urgency.max(180.0 / (0.5 + turns));
            }
        }
        if urgency != 0.0 {
            targets.push((vec![(b.col, b.row)], urgency));
        }
    }
    if targets.is_empty() {
        let allies: Vec<usize> = g.units_of(player).filter(|&a| a != u && g.typ(a).capture).collect();
        for &a in allies.iter().take(2) {
            targets.push((hex::neighbors(g.units[a].col, g.units[a].row).to_vec(), 30.0));
        }
    }
    let mut out: Vec<Target> = targets
        .into_iter()
        .map(|(goals, worth)| {
            let field = distances(g, unit.t, &goals, ctx);
            Target { goals: Rc::new(goals), worth, cap: worth / 1.5, field }
        })
        .collect();
    // Every reader takes a maximum over the targets, which their order cannot
    // change; most valuable first lets `potential` stop early.
    out.sort_by(|a, b| b.worth.partial_cmp(&a.worth).expect("finite target worth"));
    out
}

/// The best `worth / (1.5 + turns)` over the targets. Division and addition
/// are monotone, so a target whose `cap` does not beat the best so far adds
/// nothing, and neither does any later, less valuable one.
fn potential(g: &Game, mv: i32, targets: &[Target], col: i32, row: i32) -> f64 {
    let (mut best, mv, at) = (0.0f64, f64::from(mv.max(1)), g.cell(col, row));
    for t in targets {
        if t.cap <= best {
            break;
        }
        let d = t.field[at];
        if d.is_finite() {
            best = best.max(t.worth / (1.5 + d / mv));
        }
    }
    best
}

fn delivery_plans(g: &Game, carrier: usize, cargo: usize, ctx: &mut Ctx) -> Vec<Plan> {
    let (ct, pt) = (g.typ(carrier), g.typ(cargo));
    objectives(g, cargo, ctx)
        .into_iter()
        .map(|target| {
            let key = (g.units[carrier].t, g.units[cargo].t, target.goals.to_vec());
            let field = match ctx.deliveries.get(&key) {
                Some(f) => f.clone(),
                None => {
                    let mut field = vec![f64::INFINITY; g.cells.len()];
                    let mut queue = CostQueue::default();
                    let speed = f64::from(ct.mv.max(1));
                    for row in 0..g.h {
                        for col in 0..g.w {
                            let at = g.cell(col, row);
                            if g.d.terrain_cost(g.cells[at], ct).is_none() {
                                continue;
                            }
                            let mut best = f64::INFINITY;
                            for (c, r) in hex::neighbors(col, row) {
                                if !g.in_bounds(c, r) || g.building(c, r).is_some() {
                                    continue;
                                }
                                best = best.min(1.0 + target.field[g.cell(c, r)] / f64::from(pt.mv.max(1)));
                            }
                            if best.is_finite() {
                                field[at] = best;
                                queue.push(best, at);
                            }
                        }
                    }
                    while let Some((cost, cur)) = queue.pop() {
                        if cost != field[cur] {
                            continue;
                        }
                        let terrain = &g.d.terrain[g.cells[cur]];
                        let mut step = f64::from(g.d.terrain_cost(g.cells[cur], ct).expect("queued cells are passable"));
                        if terrain.costs_all_movement && !is_air_type(ct) {
                            step = speed;
                        }
                        for n in neighbor_cells(g, cur) {
                            if g.d.terrain_cost(g.cells[n], ct).is_none() {
                                continue;
                            }
                            let next = cost + step / speed;
                            if next < field[n] {
                                field[n] = next;
                                queue.push(next, n);
                            }
                        }
                    }
                    if ctx.deliveries.len() > 4096 {
                        ctx.deliveries.clear();
                    }
                    let field: Rc<[f64]> = Rc::from(field);
                    ctx.deliveries.insert(key, field.clone());
                    field
                }
            };
            Plan { field, foot: target.field, worth: target.worth }
        })
        .collect()
}
fn delivery_value(g: &Game, plans: &[Plan], col: i32, row: i32, landed: Option<i32>) -> f64 {
    let (mut best, at) = (0.0f64, g.cell(col, row));
    for p in plans {
        let turns = match landed {
            Some(mv) => 1.0 + p.foot[at] / f64::from(mv.max(1)),
            None => p.field[at],
        };
        if turns.is_finite() {
            best = best.max(p.worth / (1.5 + turns));
        }
    }
    best
}

/// `analysis`: the threat of the side not to move, the unit on each cell and
/// the mover's bases a capturer can reach this turn.
pub struct Info {
    threat_player: i32,
    threat: [Vec<f64>; 2],
    cells: Vec<i32>,
    emergencies: Vec<usize>,
}

/// Most hexes the chassis crosses on a full budget (`reachOf`).
fn reach_of(g: &Game, t_index: usize) -> i32 {
    let min = g.tables.min_step[t_index];
    if min > 0 {
        g.d.types[t_index].mv / min
    } else {
        i32::MAX / 4
    }
}

/// `stopSignature`: everything `stoppingCells(fresh(enemy))` reads. Terrain
/// never changes within one board.
fn stop_key(g: &Game, e: usize, sig: &mut Vec<i32>) {
    let x = &g.units[e];
    let reach = reach_of(g, x.t);
    sig.clear();
    sig.extend([g.cell(x.col, x.row) as i32, x.t as i32, x.player, x.cargo.len() as i32]);
    neighbourhood(g, e, reach, sig);
}

/// Everything the movement search reads about a unit with this allowance: the
/// same neighbourhood as `stopSignature`, reached with `mp` instead of a full
/// budget.
fn search_key(g: &Game, u: usize, mp: i32, sig: &mut Vec<i32>) {
    let x = &g.units[u];
    let min = g.tables.min_step[x.t];
    let reach = if min > 0 { mp / min } else { i32::MAX / 4 };
    sig.clear();
    sig.extend([g.cell(x.col, x.row) as i32, x.t as i32, x.player, x.cargo.len() as i32, mp, -3]);
    neighbourhood(g, u, reach, sig);
}

/// Field units within reach + 1 of the unit (blocking, boarding and zones of
/// control) and buildings within reach (stopping and entering).
fn neighbourhood(g: &Game, e: usize, reach: i32, sig: &mut Vec<i32>) {
    let x = &g.units[e];
    for &u in &g.field {
        let o = &g.units[u];
        if o.carried_by != 0 || o.in_factory || hex::distance(o.col, o.row, x.col, x.row) > reach + 1 {
            continue;
        }
        sig.push(g.cell(o.col, o.row) as i32);
        sig.push(o.player);
        if o.player == x.player {
            sig.extend([o.t as i32, i32::from(o.transfer_used), o.cargo.len() as i32]);
        }
    }
    sig.push(-1);
    for b in &g.buildings {
        if hex::distance(b.col, b.row, x.col, x.row) <= reach {
            sig.push(g.cell(b.col, b.row) as i32);
            sig.push(b.owner);
        }
    }
}

/// The key of an enemy's covered hexes without the domain: its stop key, or
/// for a unit that moves or fires only its cell and type.
fn cover_key(g: &Game, e: usize, key: &mut Vec<i32>) {
    if g.typ(e).move_or_fire {
        key.clear();
        key.extend([g.cell(g.units[e].col, g.units[e].row) as i32, g.units[e].t as i32, -2]);
    } else {
        stop_key(g, e, key);
    }
}

/// The hexes the enemy's weapon band against `air` targets covers from
/// every cell it could stop on, as a bitset over the board's cells. Each
/// enemy adds its power once to each, so the set's order never mattered.
/// `key` holds `cover_key`; the domain is appended and removed here.
fn covered_cells(g: &Game, e: usize, air: bool, band: (i32, i32), key: &mut Vec<i32>, ctx: &mut Ctx) -> Rc<Vec<u64>> {
    let move_or_fire = g.typ(e).move_or_fire;
    let fresh_positions = |g: &Game| if move_or_fire { vec![g.cell(g.units[e].col, g.units[e].row)] } else { g.stopping_cells(e, true) };
    key.push(i32::from(air));
    if ctx.last_covered.len() <= e {
        ctx.last_covered.resize(e + 1, [None, None]);
    }
    if let Some((last, cells)) = &ctx.last_covered[e][usize::from(air)] {
        if last == key {
            let cells = cells.clone();
            if VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
                assert_eq!(*cells, cover(g, &fresh_positions(g), band), "Remembered threatened hexes differ for unit {} ({})", g.units[e].id, g.typ(e).id);
            }
            key.pop();
            return cells;
        }
    }
    let cells = match ctx.covered.get(key.as_slice()).cloned() {
        Some(cells) => {
            if VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
                assert_eq!(*cells, cover(g, &fresh_positions(g), band), "Cached threatened hexes differ for unit {} ({})", g.units[e].id, g.typ(e).id);
            }
            cells
        }
        None => {
            let cells = if move_or_fire {
                Rc::new(cover(g, &[g.cell(g.units[e].col, g.units[e].row)], band))
            } else {
                let stops = enemy_stops(g, e, &key[..key.len() - 1], ctx);
                Rc::new(cover(g, &stops, band))
            };
            if ctx.covered.len() >= 50000 {
                ctx.covered.clear();
            }
            ctx.covered.insert(key.clone(), cells.clone());
            cells
        }
    };
    ctx.last_covered[e][usize::from(air)] = Some((key.clone(), cells.clone()));
    key.pop();
    cells
}

/// The unit's movement records, shared by every position with the same
/// `search_key`.
fn unit_records(g: &Game, u: usize, ctx: &mut Ctx) -> Rc<Vec<Rec>> {
    let x = &g.units[u];
    if x.shifted || x.mp <= 0 {
        return Rc::new(vec![Rec { col: x.col, row: x.row, cost: 0, flags: CAN_STOP }]);
    }
    let mut key = std::mem::take(&mut ctx.stop_key);
    search_key(g, u, x.mp, &mut key);
    let recs = match ctx.searches.get(key.as_slice()).cloned() {
        Some(recs) => {
            if VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
                let fresh = records(g, &g.search_moves(u, None));
                let view = |l: &[Rec]| l.iter().map(|r| (r.col, r.row, r.cost, r.flags)).collect::<Vec<_>>();
                assert_eq!(view(&recs), view(&fresh), "Cached movement records differ for unit {} ({})", x.id, g.typ(u).id);
            }
            recs
        }
        None => {
            let recs = Rc::new(records(g, &g.search_moves(u, None)));
            if ctx.searches.len() >= 50000 {
                ctx.searches.clear();
            }
            ctx.searches.insert(key.clone(), recs.clone());
            recs
        }
    };
    ctx.stop_key = key;
    recs
}

thread_local! {
    /// Per board size and weapon band: each cell's in-band cells as a bitset,
    /// `words` per cell. Pure geometry: terrain plays no part.
    static BAND_MASKS: std::cell::RefCell<FastMap<(i32, i32, i32, i32), Rc<Vec<u64>>>> = std::cell::RefCell::new(FastMap::default());
}

fn band_masks(g: &Game, (min, max): (i32, i32)) -> Rc<Vec<u64>> {
    BAND_MASKS.with(|m| {
        m.borrow_mut()
            .entry((g.w, g.h, min, max))
            .or_insert_with(|| {
                let size = g.cells.len();
                let words = size.div_ceil(64);
                let mut masks = vec![0u64; size * words];
                for p in 0..size {
                    let (col, row) = (p as i32 % g.w, p as i32 / g.w);
                    let mask = &mut masks[p * words..(p + 1) * words];
                    for r in (row - max - 1).max(0)..=(row + max + 1).min(g.h - 1) {
                        for c in (col - max).max(0)..=(col + max).min(g.w - 1) {
                            let d = hex::distance(col, row, c, r);
                            if d >= min && d <= max {
                                let at = (r * g.w + c) as usize;
                                mask[at / 64] |= 1 << (at % 64);
                            }
                        }
                    }
                }
                Rc::new(masks)
            })
            .clone()
    })
}

/// The hexes within the band of any of the positions, as a bitset.
fn cover(g: &Game, positions: &[usize], band: (i32, i32)) -> Vec<u64> {
    let masks = band_masks(g, band);
    let words = g.cells.len().div_ceil(64);
    let mut out = vec![0u64; words];
    for &p in positions {
        for (o, m) in out.iter_mut().zip(&masks[p * words..(p + 1) * words]) {
            *o |= m;
        }
    }
    out
}

/// `enemyStops`: the enemy's stopping cells, shared by every position with
/// the same stop key (`key`, from `stop_key`).
fn enemy_stops(g: &Game, e: usize, key: &[i32], ctx: &mut Ctx) -> Rc<Vec<usize>> {
    match ctx.stops.get(key).cloned() {
        Some(cells) => {
            if VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
                assert_eq!(*cells, g.stopping_cells(e, true), "Cached stopping cells differ for unit {} ({})", g.units[e].id, g.typ(e).id);
            }
            cells
        }
        None => {
            let cells = Rc::new(g.stopping_cells(e, true));
            if ctx.stops.len() >= 50000 {
                ctx.stops.clear();
            }
            ctx.stops.insert(key.to_vec(), cells.clone());
            cells
        }
    }
}

/// The enemy threat on every hex, each hex summing its enemies in board order.
fn threat_map(g: &Game, ctx: &mut Ctx) -> [Vec<f64>; 2] {
    let size = g.cells.len();
    let player = 1 - g.current;
    let mut threat = [vec![0.0f64; size], vec![0.0f64; size]];
    let mut key = std::mem::take(&mut ctx.stop_key);
    for e in g.units_of(player) {
        let t = g.typ(e);
        if t.atk_g == 0 && t.atk_a == 0 {
            continue;
        }
        let mut keyed = false;
        for air in [false, true] {
            let Some(band) = range_band(t, air) else { continue };
            if !keyed {
                cover_key(g, e, &mut key);
                keyed = true;
            }
            let power = f64::from(atk_stat(t, air).min(100)) * f64::from(g.units[e].strength) / 8.0 * f64::from(g.d.combat.exp_damage[g.units[e].exp as usize]) / 100.0;
            let array = &mut threat[usize::from(air)];
            for (w, &word) in covered_cells(g, e, air, band, &mut key, ctx).iter().enumerate() {
                let mut bits = word;
                while bits != 0 {
                    array[w * 64 + bits.trailing_zeros() as usize] += power;
                    bits &= bits - 1;
                }
            }
        }
    }
    ctx.stop_key = key;
    threat
}

pub fn analysis(g: &Game, ctx: &mut Ctx) -> Info {
    let size = g.cells.len();
    let mut cells = vec![-1i32; size];
    for &u in &g.field {
        let unit = &g.units[u];
        if unit.carried_by == 0 && !unit.in_factory && g.in_bounds(unit.col, unit.row) {
            cells[g.cell(unit.col, unit.row)] = u as i32;
        }
    }
    let player = 1 - g.current;
    let threat = threat_map(g, ctx);
    let mut emergencies = Vec::new();
    for (i, b) in g.buildings.iter().enumerate() {
        if !b.base || b.owner != g.current {
            continue;
        }
        if g.units_of(1 - b.owner).any(|e| g.typ(e).capture && hex::distance(g.units[e].col, g.units[e].row, b.col, b.row) <= g.typ(e).mv) {
            emergencies.push(i);
        }
    }
    Info { threat_player: player, threat, cells, emergencies }
}

fn danger(g: &Game, u: usize, col: i32, row: i32, info: &Info) -> f64 {
    let unit = &g.units[u];
    assert_eq!(1 - unit.player, info.threat_player, "danger is only known for the side to move");
    let t = g.typ(u);
    let air = is_air_type(t);
    let defense = (t.def + if air { 0 } else { g.terrain_at(col, row).def }).min(100);
    let power = info.threat[usize::from(air)][g.cell(col, row)];
    let losses = f64::from(unit.strength).min(power * f64::from(100 - defense) / 100.0 * weights().danger_scale);
    full_value(g, u) * losses / 8.0
}

pub fn base_danger(g: &Game, player: i32) -> f64 {
    let mut result = 0.0;
    for b in &g.buildings {
        if !b.base || b.owner != player || g.unit_at(b.col, b.row).is_some() {
            continue;
        }
        let at = g.cell(b.col, b.row);
        for u in g.units_of(1 - player) {
            let t = g.typ(u);
            if !t.capture || hex::distance(g.units[u].col, g.units[u].row, b.col, b.row) > t.mv {
                continue;
            }
            let s = g.search_moves_as(u, t.mv, false, Some(at));
            if s.find(at).is_some_and(|(_, f)| f & CAN_STOP != 0) {
                result = 1800.0;
            }
        }
    }
    result
}

/// `allUnits`: board order, each unit followed by its cargo, then reserves.
pub fn all_units(g: &Game) -> Vec<usize> {
    fn add(g: &Game, u: usize, seen: &mut [bool], out: &mut Vec<usize>) {
        if seen[u] {
            return;
        }
        seen[u] = true;
        out.push(u);
        for &c in &g.units[u].cargo {
            add(g, c, seen, out);
        }
    }
    let mut seen = vec![false; g.units.len()];
    let mut out = Vec::new();
    for &u in &g.field {
        add(g, u, &mut seen, &mut out);
    }
    for b in &g.buildings {
        for &s in &b.stored {
            add(g, s, &mut seen, &mut out);
        }
    }
    out
}

/// `signature`'s fields in the same order, length-prefixed: two positions get
/// equal vectors exactly when JavaScript gives them equal signatures.
pub fn signature(g: &Game) -> Vec<i32> {
    let units = all_units(g);
    let mut s = Vec::with_capacity(8 + units.len() * 18 + g.buildings.len() * 6);
    s.extend([g.current, g.turn, g.winner, units.len() as i32]);
    for u in units {
        let x = &g.units[u];
        s.extend([
            x.id as i32,
            x.player,
            x.t as i32,
            x.col,
            x.row,
            x.strength,
            x.exp,
            i32::from(x.moved),
            i32::from(x.shifted),
            i32::from(x.attacked),
            i32::from(x.attack_spent),
            x.mp,
            i32::from(x.transfer_used),
            x.carried_by as i32,
            i32::from(x.in_factory),
            x.cargo.len() as i32,
        ]);
        s.extend(x.cargo.iter().map(|&c| g.units[c].id as i32));
    }
    s.push(g.buildings.len() as i32);
    for b in &g.buildings {
        s.extend([b.col, b.row, b.owner, b.stored.len() as i32]);
        for &st in &b.stored {
            let x = &g.units[st];
            s.extend([x.id as i32, x.strength, x.exp, i32::from(x.moved)]);
        }
    }
    s
}

fn json_string(text: &str, out: &mut String) {
    out.push('"');
    for ch in text.chars() {
        match ch {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            c if (c as u32) < 0x20 => panic!("control character in board text {text:?}"),
            c => out.push(c),
        }
    }
    out.push('"');
}

/// `seedFor`: FNV-1a over the UTF-16 of the public position's JSON text.
pub fn seed_for(g: &Game) -> u32 {
    let mut s = String::with_capacity(4096);
    write!(s, "[{},{},[", g.turn, g.current).unwrap();
    for (i, row) in g.d.boards[g.board].grid.iter().enumerate() {
        if i > 0 {
            s.push(',');
        }
        json_string(row, &mut s);
    }
    s.push_str("],[");
    for (i, u) in all_units(g).into_iter().enumerate() {
        let x = &g.units[u];
        if i > 0 {
            s.push(',');
        }
        write!(s, "[{},{},{},{},{},{},{},{},{}]", x.col, x.row, x.player, x.strength, x.exp, x.moved, x.in_factory, x.carried_by != 0, g.typ(u).json).unwrap();
    }
    s.push_str("],[");
    for (i, b) in g.buildings.iter().enumerate() {
        if i > 0 {
            s.push(',');
        }
        write!(s, "{}", b.owner).unwrap();
    }
    s.push_str("]]");
    let mut h: u32 = 2_166_136_261;
    for unit in s.encode_utf16() {
        h = (h ^ u32::from(unit)).wrapping_mul(16_777_619);
    }
    h
}

pub fn prepare_evaluation(g: &Game, ctx: &mut Ctx) {
    ctx.goals.clear();
    for &u in &g.field {
        if !g.units[u].in_factory {
            let goals = objectives(g, u, ctx);
            ctx.goals.insert(u, Rc::new(goals));
        }
    }
}

pub fn evaluate(g: &Game, player: i32, ctx: &mut Ctx) -> f64 {
    if g.winner >= 0 {
        return if g.winner == player { 100000.0 } else { -100000.0 };
    }
    let mut scores = [0.0f64; 2];
    let mut capturers: [Vec<usize>; 2] = [Vec::new(), Vec::new()];
    for u in all_units(g) {
        let x = &g.units[u];
        if x.player < 0 {
            continue;
        }
        let p = x.player as usize;
        let t = g.typ(u);
        scores[p] += value(g, u) * if x.in_factory { 0.86 } else if x.carried_by != 0 { 0.9 } else { 1.0 };
        if t.capture && !x.in_factory && x.carried_by == 0 {
            capturers[p].push(u);
        }
        if !x.in_factory && x.carried_by == 0 && !is_air_type(t) {
            scores[p] += f64::from(g.terrain_at(x.col, x.row).def) * 0.14 * f64::from(x.strength) / 8.0;
        }
        if !x.in_factory && x.carried_by == 0 {
            if let Some(goals) = ctx.goals.get(&u) {
                if !t.capture {
                    scores[p] += potential(g, t.mv, goals, x.col, x.row) * 0.9;
                }
            }
            for &c in &x.cargo {
                if let Some(goals) = ctx.goals.get(&c) {
                    scores[p] += potential(g, g.typ(c).mv, goals, x.col, x.row) * 0.7;
                }
            }
        }
    }
    for b in &g.buildings {
        if !b.base && b.owner >= 0 {
            scores[b.owner as usize] += 45.0;
        }
        for p in 0..2 {
            if b.owner == p as i32 {
                continue;
            }
            let mut best = 0.0f64;
            for &u in &capturers[p] {
                let x = &g.units[u];
                let d = distances(g, x.t, &[(b.col, b.row)], ctx)[g.cell(x.col, x.row)];
                let worth = if b.base { 120.0 } else { 45.0 + b.stored.iter().fold(0.0, |n, &v| n + value(g, v) * 0.35) };
                if d.is_finite() {
                    best = best.max(worth / (2.0 + d / f64::from(g.typ(u).mv.max(1))));
                }
            }
            scores[p] += best;
        }
    }
    scores[0] -= base_danger(g, 0);
    scores[1] -= base_danger(g, 1);
    let left = g.turn_limit - g.turn;
    if left < 8 {
        scores[1] += f64::from((8 - left) * 35);
    }
    scores[player as usize] - scores[1 - player as usize]
}

fn support_score(g: &Game, u: usize, col: i32, row: i32, info: &Info) -> f64 {
    let mut result = 0.0;
    let me = &g.units[u];
    for n in neighbor_cells(g, g.cell(col, row)) {
        let e = info.cells[n];
        if e < 0 || g.units[e as usize].player == me.player {
            continue;
        }
        let e = e as usize;
        for m in neighbor_cells(g, g.cell(g.units[e].col, g.units[e].row)) {
            let ally = info.cells[m];
            if ally >= 0 && g.units[ally as usize].player == me.player && ally as usize != u && !g.units[ally as usize].moved {
                result += (f64::from(atk_stat(g.typ(u), g.is_air(e)) * me.strength) / 80.0).min(12.0);
            }
        }
    }
    result
}

/// A movement-range record: where, at what cost, and its flags.
#[derive(Clone, Copy)]
pub struct Rec {
    pub col: i32,
    pub row: i32,
    pub cost: i32,
    pub flags: u8,
}
impl Rec {
    pub fn can_stop(&self) -> bool {
        self.flags & CAN_STOP != 0
    }
    pub fn load(&self) -> bool {
        self.flags & LOAD != 0
    }
    pub fn enter(&self) -> bool {
        self.flags & ENTER != 0
    }
}
/// `movementRange`'s records in key order: the start, then first-reached order.
pub fn records(g: &Game, s: &MoveSearch) -> Vec<Rec> {
    s.order.iter().enumerate().map(|(i, &c)| Rec { col: g.tables.coords[c].0, row: g.tables.coords[c].1, cost: s.cost[i], flags: s.flags[i] }).collect()
}

/// The mover's own terms at its origin, identical in every `scorePosition`
/// call for one unit and position.
struct Origin {
    potential: f64,
    danger: f64,
    support: f64,
    def: i32,
}
/// One unit's `potential` and `danger` over the many cells it scores, with
/// the unit's full value computed once.
struct Scorer<'t> {
    targets: &'t [Target],
    mv: i32,
    full: f64,
    danger_scale: f64,
    w: Weights,
}
impl<'t> Scorer<'t> {
    fn new(g: &Game, u: usize, targets: &'t [Target]) -> Scorer<'t> {
        let w = weights();
        Scorer { targets, mv: g.typ(u).mv, full: full_value(g, u), danger_scale: w.danger_scale, w }
    }
    fn potential(&self, g: &Game, col: i32, row: i32) -> f64 {
        potential(g, self.mv, self.targets, col, row)
    }
    /// `danger(g, u, col, row, info)`.
    fn danger(&self, g: &Game, u: usize, col: i32, row: i32, info: &Info) -> f64 {
        let unit = &g.units[u];
        assert_eq!(1 - unit.player, info.threat_player, "danger is only known for the side to move");
        let t = g.typ(u);
        let air = is_air_type(t);
        let defense = (t.def + if air { 0 } else { g.terrain_at(col, row).def }).min(100);
        let power = info.threat[usize::from(air)][g.cell(col, row)];
        let losses = f64::from(unit.strength).min(power * f64::from(100 - defense) / 100.0 * self.danger_scale);
        self.full * losses / 8.0
    }
}

fn origin_terms(g: &Game, u: usize, scorer: &Scorer, info: &Info) -> Origin {
    let x = &g.units[u];
    Origin {
        potential: scorer.potential(g, x.col, x.row),
        danger: scorer.danger(g, u, x.col, x.row, info),
        support: support_score(g, u, x.col, x.row, info),
        def: g.terrain_at(x.col, x.row).def,
    }
}

fn score_position(g: &Game, u: usize, rec: &Rec, scorer: &Scorer, info: &Info, o: &Origin) -> f64 {
    let x = &g.units[u];
    let t = g.typ(u);
    let w = &scorer.w;
    let mut score = (scorer.potential(g, rec.col, rec.row) - o.potential) * w.advance;
    score += (o.danger - scorer.danger(g, u, rec.col, rec.row, info)) * w.danger;
    if !is_air_type(t) {
        score += f64::from(g.terrain_at(rec.col, rec.row).def - o.def) * w.terrain;
    }
    score += (support_score(g, u, rec.col, rec.row, info) - o.support) * w.support;
    if rec.cost > 0 {
        score -= w.move_cost;
    }
    if let Some(bi) = g.building(rec.col, rec.row) {
        let b = &g.buildings[bi];
        if t.capture && b.owner != x.player {
            if b.base && g.enemy_base_captured(x.player, bi) {
                return 1000000.0;
            }
            score += 65.0 + b.stored.iter().fold(0.0, |v, &s| v + value(g, s) * 0.9);
        } else if !b.base && b.owner == x.player {
            score += (full_value(g, u) - value(g, u)) * 0.95 - 18.0;
            for &c in &x.cargo {
                score += (full_value(g, c) - value(g, c)) * 0.9;
            }
        }
    }
    for &bi in &info.emergencies {
        let b = &g.buildings[bi];
        if rec.col == b.col && rec.row == b.row && (x.col != b.col || x.row != b.row) {
            score += 800.0;
        }
        if x.col == b.col && x.row == b.row && (rec.col != b.col || rec.row != b.row) {
            score -= 800.0;
        }
    }
    score
}

/// `COMBAT.marginal`: one shot's loss distribution, losses ascending.
fn marginal(g: &Game, shooter: usize, target: usize, ap: i32, da: i32, enabled: bool) -> Vec<(i32, f64)> {
    if !enabled {
        return vec![(0, 1.0)];
    }
    let (s, t, c) = (&g.units[shooter], &g.units[target], &g.d.combat);
    assert!(
        s.exp >= 0 && s.exp <= c.max_exp && s.strength >= 0 && s.strength <= c.max_strength && t.strength >= 0 && t.strength <= c.max_strength && (0..=100).contains(&ap) && (0..=100).contains(&da),
        "Battle values out of range: exp {}, strengths {}/{}, attack {ap}, defense {da}",
        s.exp,
        s.strength,
        t.strength
    );
    let mut losses: BTreeMap<i32, f64> = BTreeMap::new();
    for w in &c.random_weights {
        let loss = g.casualties(shooter, target, ap, da, w[0]);
        let p = losses.entry(loss).or_insert(0.0);
        *p += f64::from(w[1]) / 100.0;
    }
    losses.into_iter().collect()
}
/// `COMBAT.distribution`'s expected losses and kill chances.
fn distribution(g: &Game, a: usize, d: usize) -> (f64, f64, f64, f64) {
    let pv = g.battle_stats(a, d);
    let outgoing = marginal(g, a, d, pv.a_ap, pv.d_da, true);
    let incoming = marginal(g, d, a, pv.d_ap, pv.a_da, pv.counter);
    let (mut out, mut in_, mut kill, mut death) = (0.0, 0.0, 0.0, 0.0);
    for &(loss, p) in &outgoing {
        out += f64::from(loss) * p;
        if loss == g.units[d].strength {
            kill += p;
        }
    }
    for &(loss, p) in &incoming {
        in_ += f64::from(loss) * p;
        if loss == g.units[a].strength {
            death += p;
        }
    }
    (out, in_, kill, death)
}

fn trade_score(g: &Game, u: usize, target: usize) -> f64 {
    let (out, in_, kill, death) = distribution(g, u, target);
    let w = weights();
    let out = full_value(g, target) * out / 8.0 * w.trade_out;
    let incoming = full_value(g, u) * in_ / 8.0 * w.trade_in;
    let kill_value = 25.0 + value(g, target) * 0.2 + g.units[target].cargo.iter().fold(0.0, |v, &c| v + value(g, c));
    let death_value = 20.0 + value(g, u) * 0.2 + g.units[u].cargo.iter().fold(0.0, |v, &c| v + value(g, c));
    let tt = g.typ(target);
    let (tc, tr) = (g.units[target].col, g.units[target].row);
    let emergency = tt.capture && g.buildings.iter().any(|b| b.base && b.owner == g.units[u].player && hex::distance(tc, tr, b.col, b.row) <= tt.mv.max(1));
    out - incoming + kill * (kill_value + if emergency { 500.0 } else { 0.0 }) * w.kill - death * death_value * w.death
}

fn add(actions: &mut Vec<Action>, mut a: Action, score: f64) {
    a.score = score;
    actions.push(a);
}

/// `unitActions`: one unit's best activations, deduplicated by key (first
/// position, best score), highest score first.
pub fn unit_actions(g: &mut Game, u: usize, ctx: &mut Ctx, info: &Info, limit: usize) -> Vec<Action> {
    let targets = objectives(g, u, ctx);
    let origin = (g.units[u].col, g.units[u].row);
    let cargo_plans: Vec<(usize, Vec<Plan>)> = g.units[u].cargo.clone().into_iter().map(|c| (c, delivery_plans(g, u, c, ctx))).collect();
    let ready = !g.units[u].moved;
    // A unit that can move always reaches at least its own hex.
    let recs = if g.can_move_now(u) {
        unit_records(g, u, ctx)
    } else if ready {
        Rc::new(vec![Rec { col: origin.0, row: origin.1, cost: 0, flags: CAN_STOP }])
    } else {
        Rc::new(Vec::new())
    };
    let player = g.units[u].player;
    let mut actions: Vec<Action> = Vec::with_capacity(recs.len() + 16);
    let mut foes = std::mem::take(&mut ctx.foes);
    foes.clear();
    foes.extend(g.field.iter().copied().filter(|&e| {
        let o = &g.units[e];
        o.player != player && o.carried_by == 0 && !o.in_factory
    }));
    // `attackCells`: the hexes within the unit's band around any foe.
    let words = g.cells.len().div_ceil(64);
    let mut fire_from = std::mem::take(&mut ctx.fire_from);
    fire_from.clear();
    fire_from.resize(words, 0);
    let bands = [false, true].map(|air| range_band(g.typ(u), air).map(|band| band_masks(g, band)));
    for &e in &foes {
        if let Some(masks) = &bands[usize::from(g.is_air(e))] {
            let at = g.cell(g.units[e].col, g.units[e].row);
            for (f, m) in fire_from.iter_mut().zip(&masks[at * words..(at + 1) * words]) {
                *f |= m;
            }
        }
    }
    ctx.foes = foes;
    let (mv, move_or_fire) = (g.typ(u).mv, g.typ(u).move_or_fire);
    let scorer = Scorer::new(g, u, &targets);
    let here = origin_terms(g, u, &scorer, info);
    let carried_here: Vec<f64> = cargo_plans.iter().map(|(_, plans)| delivery_value(g, plans, origin.0, origin.1, None)).collect();
    for rec in recs.iter().filter(|r| r.can_stop()) {
        let moved = (rec.col, rec.row) != origin;
        let base = Action::act(u, if moved { Some((rec.col, rec.row)) } else { None });
        if rec.load() {
            let carrier = g.unit_at(rec.col, rec.row).expect("a transport on a load record");
            let speed = g.typ(carrier).mv - mv;
            add(&mut actions, base, f64::from(speed.max(0)) * 1.2 + if here.potential < 1.0 { 12.0 } else { 0.0 } - 5.0);
            continue;
        }
        let mut score = score_position(g, u, rec, &scorer, info, &here);
        for (i, (_, plans)) in cargo_plans.iter().enumerate() {
            score += (delivery_value(g, plans, rec.col, rec.row, None) - carried_here[i]) * 1.4;
        }
        let cell = g.cell(rec.col, rec.row);
        let can_fire = !rec.enter() && fire_from[cell / 64] >> (cell % 64) & 1 == 1;
        if rec.enter() || (!can_fire && cargo_plans.is_empty()) {
            add(&mut actions, base, score);
            continue;
        }
        add(&mut actions, base.clone(), score);
        let spent = g.units[u].attack_spent;
        g.relocate(u, rec.col, rec.row);
        if move_or_fire && moved {
            g.units[u].attack_spent = true;
        }
        if can_fire {
            for enemy in g.legal_attack_targets(u) {
                let mut a = base.clone();
                a.target = Some(enemy);
                let s = score + trade_score(g, u, enemy);
                add(&mut actions, a, s);
            }
        }
        for (cargo, plans) in &cargo_plans {
            for drop in g.unload_targets(u, *cargo) {
                let gain = delivery_value(g, plans, drop.0, drop.1, Some(g.typ(*cargo).mv));
                let carry = delivery_value(g, plans, rec.col, rec.row, None);
                let unload_score = 2.0 + (gain - carry) * 1.4 - danger(g, *cargo, drop.0, drop.1, info) * 0.5;
                let mut action = base.clone();
                action.cargo = Some(*cargo);
                action.drop = Some(drop);
                add(&mut actions, action.clone(), score + unload_score);
                if can_fire {
                    for enemy in g.legal_attack_targets(u) {
                        let mut a = action.clone();
                        a.target = Some(enemy);
                        let s = score + unload_score + trade_score(g, u, enemy);
                        add(&mut actions, a, s);
                    }
                }
            }
        }
        g.relocate(u, origin.0, origin.1);
        g.units[u].attack_spent = spent;
    }
    ctx.fire_from = fire_from;
    // Every action so far has its own destination, target or unload and none
    // unloads first, so only the unload-first section below can repeat a key.
    let section = actions.len();
    if !g.units[u].cargo.is_empty() && !g.units[u].transfer_used {
        let mut prefixes: Vec<Action> = Vec::new();
        for (cargo, plans) in &cargo_plans {
            for drop in g.unload_targets(u, *cargo) {
                let s = 2.0 + (delivery_value(g, plans, drop.0, drop.1, Some(g.typ(*cargo).mv)) - delivery_value(g, plans, origin.0, origin.1, None)) * 1.4
                    - danger(g, *cargo, drop.0, drop.1, info) * 0.5;
                let mut p = Action::act(u, None);
                p.cargo = Some(*cargo);
                p.drop = Some(drop);
                p.before = true;
                p.score = s;
                prefixes.push(p);
            }
        }
        sort_desc(&mut prefixes, |a| a.score);
        for prefix in prefixes.into_iter().take(2) {
            let prefix_score = prefix.score;
            add(&mut actions, prefix.clone(), prefix_score);
            if !ready {
                continue;
            }
            let mut sim = g.sim_clone(Dice::look_ahead(0));
            let (cargo, drop) = (prefix.cargo.unwrap(), prefix.drop.unwrap());
            sim.unload(u, cargo, drop.0, drop.1).expect("a listed unload is legal");
            for next in unit_actions(&mut sim, u, ctx, info, 3).into_iter().take(3) {
                let s = prefix_score + next.score;
                let mut a = next;
                a.cargo = Some(cargo);
                a.drop = Some(drop);
                a.before = true;
                add(&mut actions, a, s);
            }
        }
    }
    let full = VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed).then(|| dedup_sort(actions.clone()));
    let tail = actions.split_off(section);
    for a in tail {
        match actions[section..].iter().position(|b| b.key() == a.key()) {
            None => actions.push(a),
            Some(i) => {
                if actions[section + i].score < a.score {
                    actions[section + i] = a;
                }
            }
        }
    }
    let best = best_actions(actions, limit);
    if let Some(mut full) = full {
        full.truncate(limit);
        let view = |l: &[Action]| l.iter().map(|a| (a.key(), a.score.to_bits())).collect::<Vec<_>>();
        assert_eq!(view(&best), view(&full), "unit actions differ from the full deduplication");
    }
    best
}

pub fn candidates(g: &mut Game, ctx: &mut Ctx, limit: usize, per_unit: usize, unit_limit: usize) -> Vec<Action> {
    if g.winner >= 0 {
        return Vec::new();
    }
    candidates_keyed(g, ctx, signature(g), limit, per_unit, unit_limit)
}

/// `candidates` for a position whose `signature` the caller already built.
pub fn candidates_keyed(g: &mut Game, ctx: &mut Ctx, mut key: Vec<i32>, limit: usize, per_unit: usize, unit_limit: usize) -> Vec<Action> {
    if g.winner >= 0 {
        return Vec::new();
    }
    key.extend([limit as i32, per_unit as i32, unit_limit as i32]);
    if let Some(hit) = ctx.memo.get(key.as_slice()).cloned() {
        MEMO_HITS.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        if VERIFY_CACHES.load(std::sync::atomic::Ordering::Relaxed) {
            let fresh = generate(g, ctx, limit, per_unit, unit_limit);
            let view = |l: &[Action]| l.iter().map(|a| (a.key(), a.score.to_bits())).collect::<Vec<_>>();
            assert_eq!(view(&fresh), view(&hit), "cached candidates differ from a fresh generation");
        }
        return (*hit).clone();
    }
    MEMO_MISSES.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let result = generate(g, ctx, limit, per_unit, unit_limit);
    if ctx.memo.len() >= 8000 {
        ctx.memo.clear();
    }
    ctx.memo.insert(key, Rc::new(result.clone()));
    result
}

fn generate(g: &mut Game, ctx: &mut Ctx, limit: usize, per_unit: usize, unit_limit: usize) -> Vec<Action> {
    let current = g.current;
    let mut units: Vec<usize> = g.units_of(current).filter(|&u| !g.units[u].moved || g.units[u].cargo.iter().any(|&c| !g.unload_targets(u, c).is_empty())).collect();
    if unit_limit > 0 && units.len() > unit_limit {
        // Ranks are computed once each; the comparison is JavaScript's
        // `rank(b) - rank(a)`.
        let mut ranked: Vec<(usize, f64)> = units
            .iter()
            .map(|&u| {
                let x = &g.units[u];
                let mut nearest = f64::INFINITY;
                for &e in &g.field {
                    let y = &g.units[e];
                    if y.player == 1 - x.player && y.carried_by == 0 && !y.in_factory {
                        nearest = nearest.min(f64::from(hex::distance(x.col, x.row, y.col, y.row)));
                    }
                }
                (u, (if g.typ(u).capture { 15.0 } else { 0.0 }) + value(g, u) * 0.06 - nearest + if x.cargo.is_empty() { 0.0 } else { 10.0 })
            })
            .collect();
        ranked.sort_by(|a, b| (b.1 - a.1).partial_cmp(&0.0).unwrap_or(Ordering::Equal));
        units = ranked.into_iter().take(unit_limit).map(|(u, _)| u).collect();
    }
    let info = analysis(g, ctx);
    let mut actions = Vec::new();
    for u in units {
        actions.extend(unit_actions(g, u, ctx, &info, per_unit));
    }
    for b in g.player_factories(current) {
        for s in g.buildings[b].stored.clone() {
            if !g.can_deploy_now(b, s) {
                continue;
            }
            let goals = objectives(g, s, ctx);
            let st = g.typ(s);
            let at = (g.buildings[b].col, g.buildings[b].row);
            for n in g.deploy_targets(b, s) {
                let mut score = 6.0 + value(g, s) * 0.1 + potential(g, st.mv, &goals, n.0, n.1) * 0.2 - danger(g, s, n.0, n.1, &info) * 0.45;
                if st.mv == 0 && (st.atk_g != 0 || st.atk_a != 0) {
                    let firing = g.units_of(1 - g.units[s].player).any(|e| can_attack_at(st, g.is_air(e), hex::distance(n.0, n.1, g.units[e].col, g.units[e].row)));
                    score += if firing { 30.0 } else { -10.0 };
                }
                actions.push(Action { kind: Kind::Deploy, unit: s, to: Some(n), building: Some(at), score, ..Action::end(0.0) });
            }
            for carrier in g.transport_deploy_targets(b, s) {
                let score = 5.0 + value(g, s) * 0.1 + f64::from((g.typ(carrier).mv - st.mv).max(0)) * 1.2;
                actions.push(Action { kind: Kind::Deploy, unit: s, into: Some(carrier), building: Some(at), score, ..Action::end(0.0) });
            }
        }
    }
    if actions.is_empty() {
        return vec![Action::end(0.0)];
    }
    let mut actions = best_actions(actions, limit);
    actions.push(Action::end(-20.0));
    actions
}

fn retreat(g: &Game, u: usize, ctx: &mut Ctx) -> Option<(i32, i32)> {
    if !g.can_move_now(u) || !g.units[u].attacked {
        return None;
    }
    let info = analysis(g, ctx);
    let goals = objectives(g, u, ctx);
    let scorer = Scorer::new(g, u, &goals);
    let here = origin_terms(g, u, &scorer, &info);
    let (mut best, mut score) = (None, 0.0);
    for rec in records(g, &g.search_moves(u, None)) {
        if !rec.can_stop() || rec.load() || rec.cost == 0 {
            continue;
        }
        let s = score_position(g, u, &rec, &scorer, &info, &here);
        if s > score {
            score = s;
            best = Some((rec.col, rec.row));
        }
    }
    best
}

/// `execute`: one action's engine commands, through the recording methods.
pub fn execute(g: &mut Game, action: &Action, ctx: &mut Ctx) {
    if action.kind == Kind::End {
        g.do_end_turn();
        return;
    }
    let u = action.unit;
    if action.kind == Kind::Deploy {
        let (c, r) = action.building.expect("deploy from a building");
        let b = g.building(c, r).expect("a building at the deploy site");
        match action.into {
            Some(t) => g.do_load_from_factory(b, u, t),
            None => {
                let (c, r) = action.to.expect("a deploy exit");
                g.do_deploy(b, u, c, r);
            }
        }
        return;
    }
    let unload = |g: &mut Game| {
        let (c, r) = action.drop.expect("an unload site");
        g.do_unload(u, action.cargo.unwrap(), c, r);
    };
    if action.cargo.is_some() && action.before {
        unload(g);
    }
    if let Some((c, r)) = action.to {
        let loaded = g.do_move(u, c, r);
        if !loaded && g.enters_building(u, c, r) {
            g.do_finish(u);
        }
        if loaded || g.units[u].in_factory || g.winner >= 0 {
            return;
        }
    }
    if action.cargo.is_some() && !action.before {
        unload(g);
    }
    if let Some(enemy) = action.target {
        if g.winner < 0 {
            g.do_attack(u, enemy);
            if g.winner >= 0 || !g.field.contains(&u) {
                return;
            }
            if let Some((c, r)) = retreat(g, u, ctx) {
                g.do_move(u, c, r);
                g.do_finish(u);
            }
        }
    }
    let x = &g.units[u];
    if !x.moved && x.carried_by == 0 && !x.in_factory {
        g.do_finish(u);
    }
}

/// `simulate`: the action applied to a copy with its own dice, or with every
/// roll at 0.5 for a representative outcome.
pub fn simulate<'d>(g: &Game<'d>, action: &Action, ctx: &mut Ctx, seed: u32, representative: bool) -> Game<'d> {
    let mut state = g.sim_clone(if representative { Dice::Half } else { Dice::look_ahead(seed) });
    execute(&mut state, action, ctx);
    state
}
