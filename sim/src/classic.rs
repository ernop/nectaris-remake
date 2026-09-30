//! The Classic opponent (js/ai.js): deploy reserves, board transports, then
//! activate each unit with an evaluate-attacks-else-advance plan. Its queue
//! of pending steps runs in the same order as the JavaScript turn runner.

use crate::data::MoveType;
use crate::game::{can_attack_at, Game, MoveSearch, LOAD};
use crate::hex;
use crate::model::{records, Rec};
use std::cmp::Reverse;
use std::collections::{BinaryHeap, VecDeque};

fn is_ranged(g: &Game, u: usize) -> bool {
    let t = g.typ(u);
    t.rng_g > 1 || t.rng_a > 1
}
fn is_air(g: &Game, u: usize) -> bool {
    g.typ(u).move_type == MoveType::Air
}
fn pos(g: &Game, u: usize) -> (i32, i32) {
    (g.units[u].col, g.units[u].row)
}
fn dist(a: (i32, i32), b: (i32, i32)) -> i32 {
    hex::distance(a.0, a.1, b.0, b.1)
}

fn unit_value(g: &Game, u: usize) -> f64 {
    let t = g.typ(u);
    let mut v = f64::from(t.atk_g + t.atk_a + t.def) / 3.0 + f64::from(t.mv);
    if t.capture {
        v += 25.0;
    }
    if is_ranged(g, u) {
        v += 15.0;
    }
    v * (f64::from(g.units[u].strength) / 8.0)
}

/// `COMBAT.expectedCasualties`.
fn expected_casualties(g: &Game, shooter: usize, target: usize, ap: i32, da: i32) -> f64 {
    let total: i32 = g.d.combat.random_weights.iter().map(|w| g.casualties(shooter, target, ap, da, w[0]) * w[1]).sum();
    f64::from(total) / g.d.buckets.len() as f64
}
fn expected_trade(g: &Game, a: usize, d: usize) -> (f64, f64) {
    let pv = g.battle_stats(a, d);
    let out = expected_casualties(g, a, d, pv.a_ap, pv.d_da);
    let in_ = if pv.counter && pv.d_ap > 0 { expected_casualties(g, d, a, pv.d_ap, pv.a_da) } else { 0.0 };
    (out, in_)
}
fn score_attack(g: &Game, a: usize, d: usize, trade: (f64, f64)) -> f64 {
    let def_val = unit_value(g, d) / f64::from(g.units[d].strength.max(1));
    let atk_val = unit_value(g, a) / f64::from(g.units[a].strength.max(1));
    let mut score = trade.0 * def_val - trade.1 * atk_val;
    if trade.0 >= f64::from(g.units[d].strength) {
        score += def_val * 4.0;
    }
    if g.typ(d).capture {
        score += 10.0;
    }
    if is_ranged(g, d) {
        score += 6.0;
    }
    score
}

fn guarded(g: &Game, b: usize, player: i32) -> bool {
    let at = (g.buildings[b].col, g.buildings[b].row);
    g.player_units(1 - player).into_iter().any(|e| {
        let d = dist(pos(g, e), at);
        d <= 1 || can_attack_at(g.typ(e), false, d)
    })
}

/// `nearestGoal` for the unit standing at `at`.
fn nearest_goal(g: &Game, u: usize, at: (i32, i32)) -> Option<(i32, i32)> {
    let player = g.units[u].player;
    let (mut best, mut best_d) = (None, f64::INFINITY);
    if g.typ(u).capture {
        for (i, b) in g.buildings.iter().enumerate() {
            if b.owner == player {
                continue;
            }
            let d = f64::from(dist(at, (b.col, b.row)));
            let mut weight = if b.base { d * 0.7 } else { d };
            if !b.base && guarded(g, i, player) {
                weight += 20.0;
            }
            if weight < best_d {
                best_d = weight;
                best = Some((b.col, b.row));
            }
        }
        if best.is_some() {
            return best;
        }
    }
    for f in g.player_units(1 - player) {
        let d = f64::from(dist(at, pos(g, f)));
        if d < best_d {
            best_d = d;
            best = Some(pos(g, f));
        }
    }
    if best.is_none() {
        for b in &g.buildings {
            if b.base && b.owner != player {
                return Some((b.col, b.row));
            }
        }
    }
    best
}

fn threatened_base(g: &Game, player: i32) -> Option<(i32, i32)> {
    let enemies = g.player_units(1 - player);
    for b in g.buildings.iter().filter(|b| b.base && b.owner == player) {
        for &carrier in &enemies {
            let t = g.typ(carrier);
            if t.id != "PELICAN" || !g.units[carrier].cargo.iter().any(|&c| g.typ(c).capture) {
                continue;
            }
            if dist(pos(g, carrier), (b.col, b.row)) <= t.mv + 1 {
                return Some((b.col, b.row));
            }
        }
    }
    None
}

/// Terrain-aware walking distance to `goal`, for transport planning only.
fn walking_distances(g: &Game, passenger: usize, goal: (i32, i32)) -> Vec<i32> {
    let t = g.typ(passenger);
    let mut distances = vec![i32::MAX; g.cells.len()];
    let mut open = BinaryHeap::new();
    let mut order = 0u64;
    let start = g.cell(goal.0, goal.1);
    distances[start] = 0;
    open.push(Reverse((0i32, order, start)));
    while let Some(Reverse((cost, _, c))) = open.pop() {
        if cost != distances[c] {
            continue;
        }
        let Some(mut step) = g.d.terrain_cost(g.cells[c], t) else { continue };
        if g.d.terrain[g.cells[c]].costs_all_movement && t.move_type != MoveType::Air {
            step = t.mv.max(1);
        }
        let (col, row) = g.tables.coords[c];
        for (nc, nr) in hex::neighbors(col, row) {
            if !g.in_bounds(nc, nr) || g.d.terrain_cost(g.cells[g.cell(nc, nr)], t).is_none() {
                continue;
            }
            let n = g.cell(nc, nr);
            let next = cost + step;
            if distances[n] == i32::MAX || next < distances[n] {
                distances[n] = next;
                order += 1;
                open.push(Reverse((next, order, n)));
            }
        }
    }
    distances
}

fn wants_transport(g: &Game, passenger: usize, carrier: usize, from_factory: bool, range: Option<&MoveSearch>) -> bool {
    if !g.can_load(carrier, passenger, from_factory) {
        return false;
    }
    let t = g.typ(passenger);
    if t.mv == 0 {
        return from_factory;
    }
    let Some(goal) = nearest_goal(g, passenger, pos(g, passenger)) else { return false };
    if !from_factory {
        let own;
        let range = match range {
            Some(r) => r,
            None => {
                own = g.search_moves(passenger, None);
                &*own
            }
        };
        let at = g.cell(goal.0, goal.1);
        if range.find(at).is_some_and(|(_, f)| f & crate::game::CAN_STOP != 0 && f & LOAD == 0) {
            return false;
        }
    }
    dist(pos(g, passenger), goal) > t.mv + 1
}

fn board_one_passenger(g: &mut Game, player: i32) -> bool {
    let units = g.player_units(player);
    let carriers: Vec<usize> = units.iter().copied().filter(|&u| g.typ(u).cargo > 0 && !g.units[u].moved && (g.units[u].cargo.len() as i32) < g.typ(u).cargo).collect();
    if carriers.is_empty() {
        return false;
    }
    for &passenger in &units {
        let t = g.typ(passenger);
        if g.units[passenger].moved || t.mv == 0 || t.cargo > 0 || t.move_type == MoveType::Air {
            continue;
        }
        let mut range: Option<std::rc::Rc<MoveSearch>> = None;
        for &carrier in &carriers {
            if !g.can_load(carrier, passenger, false) {
                continue;
            }
            if range.is_none() {
                range = Some(g.search_moves(passenger, None));
            }
            let r = range.as_ref().unwrap();
            let at = g.cell(g.units[carrier].col, g.units[carrier].row);
            if !r.find(at).is_some_and(|(_, f)| f & LOAD != 0) {
                continue;
            }
            if !wants_transport(g, passenger, carrier, false, Some(&**r)) {
                continue;
            }
            let (c, row) = pos(g, carrier);
            g.do_move(passenger, c, row);
            return true;
        }
    }
    false
}

enum Plan {
    Move((i32, i32)),
    Finish,
    Attack(Option<(i32, i32)>, usize),
    Transport((i32, i32), usize, Option<(i32, i32)>),
}

fn occupied_by_other(g: &Game, at: (i32, i32), u: usize) -> bool {
    matches!(g.unit_at(at.0, at.1), Some(o) if o != u)
}

fn plan_transport(g: &mut Game, carrier: usize, recs: &[Rec]) -> Option<Plan> {
    let player = g.units[carrier].player;
    if g.units[carrier].cargo.is_empty() {
        let mut candidates: Vec<(usize, (i32, i32))> = g
            .player_units(player)
            .into_iter()
            .filter(|&u| !g.units[u].moved && g.typ(u).cargo == 0 && wants_transport(g, u, carrier, false, None))
            .map(|u| (u, pos(g, u)))
            .collect();
        for b in g.player_factories(player) {
            for &s in &g.buildings[b].stored {
                if !g.units[s].moved && wants_transport(g, s, carrier, true, None) {
                    candidates.push((s, pos(g, s)));
                }
            }
        }
        let here = pos(g, carrier);
        candidates.sort_by(|a, b| (i32::from(g.typ(b.0).capture) - i32::from(g.typ(a.0).capture)).cmp(&0).then((dist(here, a.1) - dist(here, b.1)).cmp(&0)));
        let &(_, target) = candidates.first()?;
        let (mut best, mut distance) = (None, i32::MAX);
        for rec in recs {
            if !rec.can_stop() || rec.load() || rec.enter() || occupied_by_other(g, (rec.col, rec.row), carrier) {
                continue;
            }
            let d = dist((rec.col, rec.row), target);
            if d < distance {
                distance = d;
                best = Some((rec.col, rec.row));
            }
        }
        return Some(match best {
            Some(b) if b != here => Plan::Move(b),
            _ => Plan::Finish,
        });
    }
    let cargo = g.units[carrier].cargo[0];
    let origin = pos(g, carrier);
    let Some(goal) = nearest_goal(g, cargo, origin) else { return Some(Plan::Finish) };
    let distances = walking_distances(g, cargo, goal);
    let ct = g.typ(cargo);
    let (mut chosen, mut score) = (None, f64::INFINITY);
    for rec in recs {
        if !rec.can_stop() || rec.load() || rec.enter() || occupied_by_other(g, (rec.col, rec.row), carrier) {
            continue;
        }
        let (was_moved, transfer_used) = (g.units[cargo].moved, g.units[carrier].transfer_used);
        g.relocate(carrier, rec.col, rec.row);
        g.units[cargo].moved = false;
        g.set_transfer_used(carrier, false);
        for drop in g.unload_targets(carrier, cargo) {
            if g.building(drop.0, drop.1).is_some() {
                continue;
            }
            let mut remaining = distances[g.cell(drop.0, drop.1)];
            if remaining == i32::MAX {
                continue;
            }
            if ct.mv == 0 {
                let d = dist(drop, goal);
                remaining = (d - (if ct.rng_g == 0 { 1 } else { ct.rng_g }).max(1)).abs();
            }
            let mut value = f64::from(remaining * 20) + f64::from(rec.cost) * 0.1;
            if g.in_enemy_zoc(drop.0, drop.1, g.units[cargo].player) {
                value += 5.0;
            }
            if g.building(rec.col, rec.row).is_some() {
                value += 2.0;
            }
            if value < score {
                score = value;
                chosen = Some(((rec.col, rec.row), drop, remaining));
            }
        }
        g.relocate(carrier, origin.0, origin.1);
        g.units[cargo].moved = was_moved;
        g.set_transfer_used(carrier, transfer_used);
    }
    let Some((dest, drop, remaining)) = chosen else { return Some(Plan::Finish) };
    let deliver = !g.units[carrier].transfer_used && !g.units[cargo].moved && remaining <= ct.mv.max(1);
    Some(Plan::Transport(dest, cargo, if deliver { Some(drop) } else { None }))
}

fn nearest_owned_repair(g: &Game, u: usize) -> Option<(i32, i32)> {
    let (mut best, mut best_d) = (None, i32::MAX);
    for b in &g.buildings {
        if b.owner != g.units[u].player || b.base {
            continue;
        }
        let d = dist(pos(g, u), (b.col, b.row));
        if d < best_d {
            best_d = d;
            best = Some((b.col, b.row));
        }
    }
    best
}

fn best_step_toward(g: &Game, u: usize, recs: &[Rec], goal: (i32, i32), avoid_frontline: bool) -> Option<(i32, i32)> {
    let (mut best, mut best_score) = (None, f64::INFINITY);
    for rec in recs {
        let at = (rec.col, rec.row);
        if !rec.can_stop() || rec.load() || at == pos(g, u) || occupied_by_other(g, at, u) {
            continue;
        }
        let d = f64::from(dist(at, goal));
        let mut s = d * 10.0 - if is_air(g, u) { 0.0 } else { f64::from(g.terrain_at(at.0, at.1).def) * 0.05 };
        if avoid_frontline && g.in_enemy_zoc(at.0, at.1, g.units[u].player) {
            s += 30.0;
        }
        if s < best_score {
            best_score = s;
            best = Some(at);
        }
    }
    best
}

fn best_post_attack_step(g: &Game, u: usize, recs: &[Rec]) -> Option<(i32, i32)> {
    let foes = g.player_units(1 - g.units[u].player);
    let (mut best, mut best_score) = (None, f64::NEG_INFINITY);
    for rec in recs {
        let at = (rec.col, rec.row);
        if !rec.can_stop() || rec.load() || at == pos(g, u) || occupied_by_other(g, at, u) {
            continue;
        }
        let nearest = foes.iter().map(|&f| f64::from(dist(at, pos(g, f)))).fold(f64::INFINITY, f64::min);
        let terrain_defense = if is_air(g, u) { 0.0 } else { f64::from(g.terrain_at(at.0, at.1).def) };
        let score = nearest * 10.0 + terrain_defense * 0.05;
        if score > best_score {
            best_score = score;
            best = Some(at);
        }
    }
    best
}

fn best_attack_plan(g: &mut Game, u: usize, recs: &[Rec]) -> Option<(Option<(i32, i32)>, usize, f64)> {
    let t = g.typ(u);
    let mut best: Option<(Option<(i32, i32)>, usize, f64)> = None;
    if t.move_or_fire {
        for target in g.attack_targets(u) {
            let score = score_attack(g, u, target, expected_trade(g, u, target));
            if best.as_ref().is_none_or(|b| score > b.2) {
                best = Some((None, target, score));
            }
        }
    } else if t.rng_g != 0 || t.rng_a != 0 {
        let origin = pos(g, u);
        for rec in recs {
            if !rec.can_stop() || rec.load() || rec.enter() || occupied_by_other(g, (rec.col, rec.row), u) {
                continue;
            }
            g.relocate(u, rec.col, rec.row);
            for target in g.attack_targets(u) {
                let mut sc = score_attack(g, u, target, expected_trade(g, u, target));
                if !is_air(g, u) {
                    sc += f64::from(g.terrain_at(rec.col, rec.row).def) * 0.05;
                }
                if best.as_ref().is_none_or(|b| sc > b.2) {
                    best = Some((Some((rec.col, rec.row)), target, sc));
                }
            }
            g.relocate(u, origin.0, origin.1);
        }
    }
    best
}

fn plan_unit(g: &mut Game, u: usize) -> Plan {
    let range = g.search_moves(u, None);
    let recs = records(g, &range);
    let t = g.typ(u);
    let here = pos(g, u);
    if g.units[u].strength <= 3 && t.mv > 0 {
        if let Some(rb) = nearest_owned_repair(g, u) {
            let at = g.cell(rb.0, rb.1);
            if range.find(at).is_some_and(|(_, f)| f & crate::game::CAN_STOP != 0) && g.unit_at(rb.0, rb.1).is_none() {
                return Plan::Move(rb);
            }
        }
    }
    if t.cargo > 0 {
        if let Some(p) = plan_transport(g, u, &recs) {
            return p;
        }
    }
    let base = if t.capture { None } else { threatened_base(g, g.units[u].player) };
    let plan = best_attack_plan(g, u, &recs);
    let capture_goal = if t.capture { nearest_goal(g, u, here) } else { None };
    if let (Some(goal), Some((Some(dest), _, _))) = (capture_goal, &plan) {
        if dist(*dest, goal) > dist(here, goal) {
            if let Some(step) = best_step_toward(g, u, &recs, goal, false) {
                return Plan::Move(step);
            }
        }
    }
    if let Some(b) = base {
        if t.mv > 0 && plan.as_ref().is_none_or(|p| dist(pos(g, p.1), b) > 4) {
            if let Some(defense) = best_step_toward(g, u, &recs, b, false) {
                if dist(defense, b) < dist(here, b) {
                    return Plan::Move(defense);
                }
            }
        }
    }
    if let Some((dest, target, score)) = plan {
        if score > -2.0 {
            return Plan::Attack(dest, target);
        }
    }
    if let Some(goal) = nearest_goal(g, u, here) {
        if t.mv > 0 {
            if let Some(step) = best_step_toward(g, u, &recs, goal, t.move_or_fire) {
                return Plan::Move(step);
            }
        }
    }
    Plan::Finish
}

fn deploy_one_factory(g: &mut Game, b: usize) -> bool {
    let (bc, br, owner) = (g.buildings[b].col, g.buildings[b].row, g.buildings[b].owner);
    let neighbors = hex::neighbors(bc, br);
    let atlas_default = g.d.types[g.d.type_index["ATLAS"]].ai_deployment_enemies;
    for s in (0..g.buildings[b].stored.len()).rev() {
        let su = g.buildings[b].stored[s];
        if g.units[su].moved {
            continue;
        }
        let carriers = g.transport_deploy_targets(b, su);
        let mut exits = g.deploy_targets(b, su);
        let st = g.typ(su);
        if st.id == "ATLAS" {
            let need = st.ai_deployment_enemies.or(atlas_default).expect("Atlas deployment rule");
            let enemies = g.player_units(1 - owner);
            exits.retain(|&exit| {
                enemies.iter().filter(|&&e| {
                    let d = dist(exit, pos(g, e));
                    d >= 2 && d <= st.rng_g
                }).count() as i32
                    >= need
            });
        }
        for i in [3, 2, 1, 0, 5, 4] {
            let exit = neighbors[i];
            if let Some(carrier) = g.unit_at(exit.0, exit.1) {
                if carriers.contains(&carrier) {
                    g.do_load_from_factory(b, su, carrier);
                    return true;
                }
            }
            if !exits.contains(&exit) {
                continue;
            }
            g.do_deploy(b, su, exit.0, exit.1);
            return true;
        }
    }
    false
}

fn activation_order(g: &Game, player: i32) -> Vec<usize> {
    let rank = |u: usize| {
        let t = g.typ(u);
        if t.cargo > 0 {
            -1
        } else if t.move_or_fire || is_ranged(g, u) {
            0
        } else if t.capture {
            2
        } else {
            1
        }
    };
    let mut units = g.player_units(player);
    units.sort_by(|&a, &b| rank(a).cmp(&rank(b)).then_with(|| unit_value(g, b).partial_cmp(&unit_value(g, a)).unwrap()));
    units
}

enum Step {
    PostAttackMove(usize),
    Finish(usize),
    Move(usize, (i32, i32)),
    AttackMove(usize, (i32, i32)),
    Battle(usize, usize),
    Unload(usize, usize, (i32, i32)),
}

fn queue_plan(g: &Game, u: usize, plan: Plan, pending: &mut VecDeque<Step>) {
    match plan {
        Plan::Transport(dest, cargo, drop) => {
            pending.push_back(if dest != pos(g, u) { Step::Move(u, dest) } else { Step::Finish(u) });
            if let Some(d) = drop {
                pending.push_back(Step::Unload(u, cargo, d));
            }
        }
        Plan::Finish => pending.push_back(Step::Finish(u)),
        Plan::Move(dest) => pending.push_back(Step::Move(u, dest)),
        Plan::Attack(dest, target) => {
            if let Some(d) = dest {
                if d != pos(g, u) {
                    pending.push_back(Step::AttackMove(u, d));
                }
            }
            pending.push_back(Step::Battle(u, target));
        }
    }
}

fn run_step(g: &mut Game, step: Step, pending: &mut VecDeque<Step>) {
    match step {
        Step::PostAttackMove(u) => {
            let recs = records(g, &g.search_moves(u, None));
            match best_post_attack_step(g, u, &recs) {
                None => g.do_finish(u),
                Some((c, r)) => {
                    g.do_move(u, c, r);
                    if !g.units[u].moved {
                        g.do_finish(u);
                    }
                }
            }
        }
        Step::Finish(u) => g.do_finish(u),
        Step::Move(u, (c, r)) => {
            g.do_move(u, c, r);
            if !g.units[u].moved {
                g.do_finish(u);
            }
        }
        Step::AttackMove(u, (c, r)) => {
            g.do_move(u, c, r);
        }
        Step::Battle(u, target) => {
            g.do_attack(u, target);
            if g.field.contains(&u) && !g.units[u].moved {
                if g.typ(u).move_after_attack && g.units[u].mp > 0 && !g.over() {
                    pending.push_back(Step::PostAttackMove(u));
                } else {
                    g.do_finish(u);
                }
            }
        }
        Step::Unload(t, c, (col, row)) => g.do_unload(t, c, col, row),
    }
}

/// One Classic turn for `player`, as `AI.createTurn` plays it.
pub fn play_turn(g: &mut Game, player: i32) {
    let mut factories = g.player_factories(player);
    let mut fi = 0;
    let mut units: Option<Vec<usize>> = None;
    let mut ui = 0;
    let mut pending: VecDeque<Step> = VecDeque::new();
    let (mut boarding_done, mut final_scan) = (false, false);
    loop {
        if g.over() {
            return;
        }
        if let Some(step) = pending.pop_front() {
            run_step(g, step, &mut pending);
            continue;
        }
        if fi < factories.len() {
            if !deploy_one_factory(g, factories[fi]) {
                fi += 1;
            }
            continue;
        }
        if !boarding_done {
            if board_one_passenger(g, player) {
                continue;
            }
            boarding_done = true;
        }
        let list = units.get_or_insert_with(|| activation_order(g, player));
        if ui >= list.len() {
            if !final_scan {
                final_scan = true;
                factories = g.player_factories(player);
                fi = 0;
                continue;
            }
            return;
        }
        let u = list[ui];
        ui += 1;
        if !g.field.contains(&u) || g.units[u].moved || g.units[u].carried_by != 0 {
            continue;
        }
        let plan = plan_unit(g, u);
        queue_plan(g, u, plan, &mut pending);
    }
}
