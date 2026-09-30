//! AI_SEARCH (js/ai-search.js): Tactical, Sequence, Simulation and Apex over
//! the shared action model. Each decision draws from its own generator,
//! seeded from the public position, in exactly JavaScript's order.

use crate::dice::Dice;
use crate::fdlibm;
use crate::game::Game;
use crate::hex;
use crate::model::{self, sort_desc, Action, Ctx, FastMap, FastSet, Key, Kind};
use crate::rng::Rng;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Algorithm {
    Greedy,
    Beam,
    Mcts,
    Hybrid,
}

#[derive(Clone, Debug)]
pub struct Config {
    pub algorithm: Algorithm,
    pub width: usize,
    pub depth: usize,
    pub branches: usize,
    pub iterations: usize,
    pub horizon: usize,
    pub verification: usize,
    /// Scoring weights per seat; `None` is the shipped set.
    pub weights: Option<[model::Profile; 2]>,
}

/// `AI_SEARCH.modes` with the tournament's `searchOptions` for the work level.
pub fn config(id: &str, work: &str) -> Config {
    let base = match id {
        "tactical" => Config { algorithm: Algorithm::Greedy, width: 0, depth: 0, branches: 0, iterations: 0, horizon: 0, verification: 0, weights: None },
        "beam" => Config { algorithm: Algorithm::Beam, width: 4, depth: 3, branches: 5, iterations: 0, horizon: 0, verification: 0, weights: None },
        "monte-carlo" => Config { algorithm: Algorithm::Mcts, width: 0, depth: 0, branches: 10, iterations: 36, horizon: 8, verification: 0, weights: None },
        "apex" => Config { algorithm: Algorithm::Hybrid, width: 5, depth: 3, branches: 12, iterations: 64, horizon: 12, verification: 4, weights: None },
        "marshal" => Config { algorithm: Algorithm::Hybrid, width: 5, depth: 3, branches: 12, iterations: 64, horizon: 12, verification: 4, weights: Some(crate::marshal::SEAT_PROFILES) },
        other => panic!("Unknown AI opponent: {other}"),
    };
    if work == "standard" || id == "tactical" {
        return base;
    }
    let factor = match work {
        "fast" => 0.5,
        "deep" => 2.0,
        other => panic!("Search work must be fast, standard or deep, not {other}"),
    };
    let scale = |v: usize, min: usize| if v == 0 { 0 } else { min.max((v as f64 * factor + 0.5).floor() as usize) };
    Config {
        width: scale(base.width, 4),
        branches: scale(base.branches, 4),
        iterations: scale(base.iterations, 4),
        horizon: scale(base.horizon, 4),
        verification: scale(base.verification, 2),
        depth: if base.depth == 0 { 0 } else if work == "fast" { 2 } else { 4 },
        ..base
    }
}

fn random_seed(rng: &mut Rng) -> u32 {
    (rng.next() * 4_294_967_296.0).floor() as u32
}

fn ready_count(g: &Game) -> usize {
    let field = g.units_of(g.current).filter(|&u| !g.units[u].moved).count();
    let stored: usize = g.player_factories(g.current).into_iter().map(|b| g.buildings[b].stored.iter().filter(|&&u| !g.units[u].moved).count()).sum();
    field + stored
}

fn quiet(g: &Game, roots: &[(Action, f64)]) -> bool {
    if roots.iter().any(|r| r.0.target.is_some()) {
        return false;
    }
    let enemies = g.player_units(1 - g.current);
    let mut units: Vec<(usize, i32, i32)> = g.units_of(g.current).filter(|&u| !g.units[u].moved).map(|u| (u, g.units[u].col, g.units[u].row)).collect();
    for b in g.player_factories(g.current) {
        for &s in &g.buildings[b].stored {
            if !g.units[s].moved {
                units.push((s, g.buildings[b].col, g.buildings[b].row));
            }
        }
    }
    !units.iter().any(|&(u, col, row)| {
        let ut = g.typ(u);
        enemies.iter().any(|&e| {
            let et = g.typ(e);
            let reach = ut.mv.max(et.mv) + ut.rng_g.max(ut.rng_a).max(et.rng_g).max(et.rng_a) + 2;
            hex::distance(col, row, g.units[e].col, g.units[e].row) <= reach
        })
    })
}

fn normalized(score: f64) -> f64 {
    if score.abs() >= 90000.0 {
        score.signum()
    } else {
        fdlibm::tanh(score / 500.0)
    }
}

fn shortlist(g: &mut Game, ctx: &mut Ctx, limit: usize, unit_limit: usize) -> Vec<Action> {
    let actions = model::candidates(g, ctx, limit, 3, unit_limit);
    without_end(actions)
}
/// `shortlist` for a position whose `signature` the caller already built.
fn shortlist_keyed(g: &mut Game, ctx: &mut Ctx, signature: Vec<i32>, limit: usize, unit_limit: usize) -> Vec<Action> {
    without_end(model::candidates_keyed(g, ctx, signature, limit, 3, unit_limit))
}
fn without_end(actions: Vec<Action>) -> Vec<Action> {
    if actions.len() > 1 {
        actions.into_iter().filter(|a| a.kind != Kind::End).collect()
    } else {
        actions
    }
}

fn order_root(g: &Game, actions: Vec<Action>, ctx: &mut Ctx, rng: &mut Rng) -> Vec<(Action, f64)> {
    let before = model::base_danger(g, g.current);
    let mut roots: Vec<(Action, f64)> = actions
        .into_iter()
        .map(|action| {
            if action.target.is_some() {
                let s = action.score;
                return (action, s);
            }
            let child = model::simulate(g, &action, ctx, random_seed(rng), false);
            let safety = before - model::base_danger(&child, g.current);
            let mut score = action.score + safety;
            if child.winner == g.current {
                score += 100000.0;
            }
            if child.winner == 1 - g.current {
                score -= 100000.0;
            }
            (action, score)
        })
        .collect();
    sort_desc(&mut roots, |r| r.1);
    roots
}

fn rollout(g: &mut Game, player: i32, ctx: &mut Ctx, rng: &mut Rng, horizon: usize) -> f64 {
    let mut seen: FastSet<Vec<i32>> = FastSet::default();
    let (start_turn, mut switches, mut previous) = (g.turn, 0, g.current);
    for i in 0..horizon {
        if g.over() {
            break;
        }
        let signature = model::signature(g);
        if !seen.insert(signature.clone()) {
            break;
        }
        let options = shortlist_keyed(g, ctx, signature, 5, 3);
        let mut action = &options[0];
        if options.len() > 1 && options[1].kind != Kind::End && options[0].score - options[1].score < 8.0 && rng.next() < 0.2 {
            action = &options[1];
        }
        model::execute(g, &action.clone(), ctx);
        if g.current != previous {
            switches += 1;
            previous = g.current;
        }
        if switches >= 2 || g.turn > start_turn + 1 {
            break;
        }
        if i + 1 == horizon / 2 && g.current == player && !g.over() {
            g.end_turn();
            previous = g.current;
            switches += 1;
        }
    }
    model::evaluate(g, player, ctx)
}

struct BeamNode<'d> {
    game: Game<'d>,
    root: Action,
    progress: f64,
    score: f64,
}

fn beam(g: &Game, roots: &[(Action, f64)], ctx: &mut Ctx, c: &Config, rng: &mut Rng) -> FastMap<Key, f64> {
    let player = g.current;
    let initial: Vec<&(Action, f64)> = roots.iter().filter(|r| r.0.kind != Kind::End).take(c.branches).collect();
    let mut nodes: Vec<BeamNode> = initial
        .iter()
        .map(|r| {
            let state = model::simulate(g, &r.0, ctx, random_seed(rng), true);
            let score = model::evaluate(&state, player, ctx) + r.1 * 0.15;
            BeamNode { game: state, root: r.0.clone(), progress: r.1, score }
        })
        .collect();
    for _ in 1..c.depth {
        let mut next: Vec<BeamNode> = Vec::new();
        let mut transpositions: Vec<BeamNode> = Vec::new();
        let mut at: FastMap<(Key, Vec<i32>), usize> = FastMap::default();
        for mut node in nodes {
            if node.game.over() || node.game.current != player {
                next.push(node);
                continue;
            }
            let actions: Vec<Action> = shortlist(&mut node.game, ctx, c.branches, 0).into_iter().take(c.branches).collect();
            for action in actions {
                let child = model::simulate(&node.game, &action, ctx, random_seed(rng), true);
                let progress = node.progress + action.score;
                let score = model::evaluate(&child, player, ctx) + progress * 0.15;
                let sig = (node.root.key(), model::signature(&child));
                let entry = BeamNode { game: child, root: node.root.clone(), progress, score };
                match at.get(&sig) {
                    None => {
                        at.insert(sig, transpositions.len());
                        transpositions.push(entry);
                    }
                    Some(&i) => {
                        if score > transpositions[i].score {
                            transpositions[i] = entry;
                        }
                    }
                }
            }
        }
        next.extend(transpositions);
        sort_desc(&mut next, |n| n.score);
        let mut kept_flag = vec![false; next.len()];
        let mut roots_seen: FastSet<Key> = FastSet::default();
        for (i, n) in next.iter().enumerate() {
            if roots_seen.insert(n.root.key()) {
                kept_flag[i] = true;
            }
        }
        let (mut kept, mut rest) = (Vec::new(), Vec::new());
        for (i, n) in next.into_iter().enumerate() {
            if kept_flag[i] {
                kept.push(n);
            } else {
                rest.push(n);
            }
        }
        kept.extend(rest.into_iter().take(c.width));
        kept.truncate(initial.len() + c.width);
        nodes = kept;
    }
    let mut values: FastMap<Key, f64> = FastMap::default();
    for node in &nodes {
        let mut sum = 0.0;
        for _ in 0..2 {
            let _seed = random_seed(rng);
            let mut response = node.game.sim_clone(Dice::Half);
            if !response.over() && response.current == player {
                response.end_turn();
            }
            sum += rollout(&mut response, player, ctx, rng, 3);
        }
        let score = sum / 2.0 + node.progress * 0.12;
        let k = node.root.key();
        match values.get(&k) {
            Some(&v) if score <= v => {}
            _ => {
                values.insert(k, score);
            }
        }
    }
    values
}

struct Choice {
    action: Action,
    visits: u32,
    total: f64,
    prior: f64,
}
struct TreeNode {
    visits: u32,
    choices: Vec<Choice>,
}

fn tree_search(g: &Game, roots: &[(Action, f64)], ctx: &mut Ctx, c: &Config, rng: &mut Rng, beam_values: Option<&FastMap<Key, f64>>) -> Action {
    let player = g.current;
    let mut table: FastMap<Vec<i32>, TreeNode> = FastMap::default();
    let root_key = model::signature(g);
    let root_choices = roots
        .iter()
        .take(c.branches)
        .map(|r| Choice {
            action: r.0.clone(),
            visits: 0,
            total: 0.0,
            prior: beam_values.and_then(|b| b.get(&r.0.key())).map_or(0.0, |&v| normalized(v)),
        })
        .collect();
    table.insert(root_key.clone(), TreeNode { visits: 0, choices: root_choices });
    let tree_depth = if c.algorithm == Algorithm::Hybrid { 6 } else { 4 };
    for _ in 0..c.iterations {
        let mut gg = g.sim_clone(Dice::look_ahead(random_seed(rng)));
        let mut path: Vec<(Vec<i32>, usize)> = Vec::new();
        let mut depth = 0;
        while !gg.over() && depth < tree_depth {
            let sig = model::signature(&gg);
            let mut newly = false;
            if !table.contains_key(&sig) {
                let acts = shortlist(&mut gg, ctx, c.branches, if depth > 1 { 4 } else { 0 });
                table.insert(sig.clone(), TreeNode { visits: 0, choices: acts.into_iter().map(|a| Choice { action: a, visits: 0, total: 0.0, prior: 0.0 }).collect() });
                newly = true;
            }
            let node = &table[&sig];
            if node.choices.is_empty() {
                break;
            }
            let sign = if gg.current == player { 1.0 } else { -1.0 };
            let len = node.choices.len();
            let mut width = len.min(2 + ((f64::from(node.visits) + 1.0).sqrt() * 1.5).floor() as usize);
            if depth == 0 {
                width = len.min(width.max(8.min(len)));
            }
            let (mut best, mut best_score) = (0, f64::NEG_INFINITY);
            for j in 0..width {
                let ch = &node.choices[j];
                let visits = f64::from(ch.visits);
                let mean = if ch.visits > 0 { ch.total / visits } else { ch.prior };
                let explore = if ch.visits > 0 { 0.65 * (fdlibm::log(f64::from(node.visits) + 2.0) / visits).sqrt() } else { 2.0 };
                let prior = 0.18 * ch.prior / (1.0 + visits) + 0.025 * (width - j) as f64 / width as f64;
                let score = sign * mean + explore + prior;
                if score > best_score {
                    best_score = score;
                    best = j;
                }
            }
            let action = node.choices[best].action.clone();
            path.push((sig, best));
            model::execute(&mut gg, &action, ctx);
            depth += 1;
            if newly {
                break;
            }
        }
        let result = normalized(rollout(&mut gg, player, ctx, rng, 2.max(c.horizon.saturating_sub(depth))));
        for (sig, j) in path {
            let node = table.get_mut(&sig).unwrap();
            node.visits += 1;
            let ch = &mut node.choices[j];
            ch.visits += 1;
            ch.total += result;
        }
    }
    let mut scored: Vec<(Action, f64, u32)> = table[&root_key]
        .choices
        .iter()
        .map(|ch| {
            let mean = if ch.visits > 0 { ch.total / f64::from(ch.visits) } else { -2.0 };
            let estimate = if beam_values.is_some() { (ch.total + ch.prior * 16.0) / (f64::from(ch.visits) + 16.0) } else { mean };
            (ch.action.clone(), estimate, ch.visits)
        })
        .collect();
    scored.sort_by(|a, b| {
        let d = b.1 - a.1;
        if d != 0.0 && !d.is_nan() {
            d.partial_cmp(&0.0).unwrap()
        } else {
            b.2.cmp(&a.2)
        }
    });
    scored.swap_remove(0).0
}

fn verify(g: &Game, actions: [Action; 4], ctx: &mut Ctx, c: &Config, rng: &mut Rng) -> Action {
    let mut choices: Vec<Action> = Vec::new();
    let mut at: FastMap<Key, usize> = FastMap::default();
    for a in actions {
        match at.get(&a.key()) {
            Some(&i) => choices[i] = a,
            None => {
                at.insert(a.key(), choices.len());
                choices.push(a);
            }
        }
    }
    let player = g.current;
    let samples = 2.max(if c.verification == 0 { 4 } else { c.verification });
    let seeds: Vec<u32> = (0..samples).map(|_| random_seed(rng)).collect();
    let stored: usize = g.buildings.iter().map(|b| b.stored.len() * 3).sum();
    let cap = 24.max(g.field.len() * 3 + stored);
    let mut values: Vec<(Action, f64)> = Vec::new();
    for choice in choices {
        let (mut total, mut worst) = (0.0, f64::INFINITY);
        for &seed in &seeds {
            let mut gg = g.sim_clone(Dice::look_ahead(seed));
            let (mut start, mut switches) = (gg.current, 0);
            model::execute(&mut gg, &choice, ctx);
            let mut step = 0;
            while step < cap && !gg.over() && switches < 2 {
                let action = shortlist(&mut gg, ctx, 6, 0).swap_remove(0);
                model::execute(&mut gg, &action, ctx);
                if gg.current != start {
                    switches += 1;
                    start = gg.current;
                }
                step += 1;
            }
            let score = model::evaluate(&gg, player, ctx);
            total += score;
            worst = worst.min(score);
        }
        values.push((choice, total / samples as f64 * 0.9 + worst * 0.1));
    }
    sort_desc(&mut values, |v| v.1);
    values.swap_remove(0).0
}

/// `AI_SEARCH.decide`: the next action for the side to move.
pub fn decide(game: &Game, id: &str, work: &str, ctx: &mut Ctx) -> Action {
    decide_with(game, config(id, work), ctx)
}

/// `decide` under an explicit configuration; sets this thread's scoring
/// weights for the side to move, as `AI_SEARCH.decide` does.
pub fn decide_with(game: &Game, mut c: Config, ctx: &mut Ctx) -> Action {
    model::set_weights(c.weights.map_or(model::Weights::SHIPPED, |p| p[game.current as usize].at(model::clock(game.turn, game.d.rules.turn_limit))));
    let mut root = game.sim_clone(Dice::look_ahead(0));
    let mut rng = Rng::new(model::seed_for(game));
    model::prepare_evaluation(&root, ctx);
    let actions = shortlist(&mut root, ctx, if c.algorithm == Algorithm::Greedy { 24 } else { 32 }, 0);
    if actions[0].kind == Kind::End || actions[0].score >= 1000000.0 {
        return actions.into_iter().next().unwrap();
    }
    let mut roots = order_root(&root, actions, ctx, &mut rng);
    let greedy = roots[0].0.clone();
    if c.algorithm == Algorithm::Greedy || roots.len() == 1 {
        return roots.swap_remove(0).0;
    }
    if quiet(&root, &roots) {
        return greedy;
    }
    let mut beam_values = None;
    if c.algorithm == Algorithm::Beam || c.algorithm == Algorithm::Hybrid {
        let values = beam(&root, &roots, ctx, &c, &mut rng);
        roots.retain(|r| values.contains_key(&r.0.key()));
        sort_desc(&mut roots, |r| values[&r.0.key()]);
        if c.algorithm == Algorithm::Beam {
            return roots.swap_remove(0).0;
        }
        beam_values = Some(values);
    }
    let scale = 1f64.max((ready_count(&root) as f64 / 12.0).sqrt());
    c.iterations = (c.branches * 2).max((c.iterations as f64 / scale).floor() as usize);
    let searched = tree_search(&root, &roots, ctx, &c, &mut rng, beam_values.as_ref());
    if c.algorithm == Algorithm::Hybrid {
        let second = roots[1.min(roots.len() - 1)].0.clone();
        return verify(&root, [searched, roots[0].0.clone(), second, greedy], ctx, &c, &mut rng);
    }
    searched
}

/// `AI_SEARCH.createTurn` without a worker: decide and execute until the
/// side has nothing left to do.
pub fn play_turn(g: &mut Game, player: i32, id: &str, work: &str) {
    play_turn_with(g, player, &config(id, work));
}

pub fn play_turn_with(g: &mut Game, player: i32, c: &Config) {
    let mut ctx = Ctx::default();
    while !g.over() && g.current == player {
        let action = decide_with(g, c.clone(), &mut ctx);
        if action.kind == Kind::End {
            return;
        }
        model::execute(g, &action, &mut ctx);
    }
}
