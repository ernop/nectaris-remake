/* Soundscape "Field calls" — Grok 4.7.
 *
 * Drums count and bugles announce. The march already playing is square-wave
 * and E minor; these cues are sine harmonics of one fundamental (a bugle has
 * no valves) and noise taps, so they sit beside that march. A recall descends
 * the harmonic series when a turn ends. Nothing here is sampled, and nothing
 * copies the wah, the sonar ping or the relay code.
 *
 * Tick spacing in the combat board is 30 ms for machines, 170 ms for a
 * supporter, 260 ms for terrain and 90 ms for a ring hex, so a counting tap
 * stays under 25 ms and a flam fits inside a supporter step.
 */
"use strict";

(function () {
  var register = typeof module !== "undefined" ? require("./sfx.js").registerBank : SFX.registerBank;

  // F3, not the music's E. Harmonics 2–6 and 8 are the only notes a bugle can play.
  var FUND = 174;

  register({
    id: "grok-4.7",
    creator: "Grok 4.7",
    title: "Field calls",
    description: "Bugle calls for turns and victories, drum taps for the count, chassis sounds for movement.",
    seed: 47474747,
    // Chromatic from E4, so each machine that lights is one semitone higher.
    scale: [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
    room: {seconds: 0.75, wetGain: 0.28},
    masterGain: 0.8,
    build: function (d) {
      var tn = d.tn, hs = d.hs, hz = d.hz, SCALE = d.SCALE, pick = d.pick;
      var clamp = d.clamp, pathPan = d.pathPan, rand = d.rand;

      // Third harmonic loudest, upper partials shorter: brass, not a chime and not a chip wave.
      var BRASS = [[1, 0.55, 0.28], [2, 0.7, 0.62], [3, 1, 1], [4, 0.62, 0.38], [5, 0.4, 0.14]];
      function bugle(t, o, fund, dur, vol) {
        BRASS.forEach(function (partial) {
          tn(t, o, {f: fund * partial[0], dur: dur * partial[1], vol: vol * partial[2],
            a: 0.003, wave: "sine", wet: 0.2});
        });
      }

      function tick(t, o, freq, bright) {
        hs(t, o, {dur: 0.016, vol: bright ? 0.055 : 0.038, a: 0.001,
          bp: [bright ? 2400 : 780, bright ? 1300 : 420, bright ? 1.5 : 0.8]});
        tn(t, o, {f: freq, to: freq * 0.7, dur: 0.022, vol: bright ? 0.05 : 0.036, a: 0.001,
          wave: bright ? "sine" : "triangle"});
      }

      function bass(t, o, vol) {
        tn(t, o, {f: 92, to: 40, dur: 0.14, vol: vol, a: 0.002, wave: "sine"});
        hs(t, o, {dur: 0.07, vol: vol * 0.45, a: 0.002, lp: [420, 140]});
      }

      // Two-note calls. The interval is a bugle interval, the register is the chassis.
      var CALL = {
        foot:   {fund: 220, from: 3, to: 4},
        wheels: {fund: 196, from: 4, to: 5},
        treads: {fund: 146, from: 2, to: 3},
        air:    {fund: 262, from: 5, to: 6},
      };

      function degree(index) { return SCALE[Math.min(index, SCALE.length - 1)]; }

      var MOVE_SOUND = {
        foot: function (t, o, n, step) {
          for (var i = 0; i < n; i++) {
            [0.22, 0.6].forEach(function (fraction, k) {
              var at = t + (i + fraction) * step;
              var pan = pathPan(o, (i + fraction) / n);
              // Shorter than this and the decay is scheduled before the attack.
              var hit = Math.max(0.016, Math.min(0.042, step * 0.28));
              var ear = Object.assign({}, o, {pan: pan});
              hs(at, ear, {dur: hit, vol: 0.05, a: 0.001, bp: [k ? 1100 : 2100, null, 1.3]});
              tn(at, ear, {f: k ? 130 : 175, to: 58, dur: hit, vol: 0.05, a: 0.002, wave: "sine"});
            });
          }
        },
        wheels: function (t, o, n, step, dur) {
          tn(t, o, {f: 168, to: 196, dur: dur, wave: "triangle", vol: 0.06, a: Math.min(0.03, dur * 0.2),
            hold: 0.7, vib: [17, 11], lp: [720], panTo: o.panTo});
          hs(t, o, {dur: dur, vol: 0.035, a: Math.min(0.03, dur * 0.2), hold: 0.7,
            bp: [1400, 2200, 0.7], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.5) * step;
            tick(at, Object.assign({}, o, {pan: pathPan(o, (i + 0.5) / n)}), 640 + (i % 2) * 80, true);
          }
        },
        treads: function (t, o, n, step, dur) {
          tn(t, o, {f: 40, dur: dur, wave: "sine", vol: 0.09, a: Math.min(0.05, dur * 0.25),
            hold: 0.78, lp: [130], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.45) * step;
            var ear = Object.assign({}, o, {pan: pathPan(o, (i + 0.5) / n)});
            tn(at, ear, {f: 110, to: 46, dur: 0.05, vol: 0.07, a: 0.002, wave: "sine"});
            if (i % 2 === 0) hs(at, ear, {dur: 0.014, vol: 0.03, a: 0.001, hp: [2500]});
          }
          hs(t + dur, o, {dur: 0.08, vol: 0.04, a: 0.004, bp: [1800, 700, 1.2], pan: o.panTo});
        },
        air: function (t, o, n, step, dur) {
          var rise = Math.max(0.06, dur * 0.58);
          var fall = dur - rise * 0.82;
          var attack = Math.min(0.04, dur * 0.22);
          tn(t, o, {f: 210, to: 380, dur: rise, vol: 0.045, a: attack, wave: "sine",
            pan: pathPan(o, 0), panTo: pathPan(o, 0.58)});
          hs(t, o, {dur: rise, vol: 0.07, a: attack, hold: 0.3, bp: [500, 2000, 0.85],
            pan: pathPan(o, 0), panTo: pathPan(o, 0.58)});
          if (fall > 0.04) {
            var at = t + rise * 0.82;
            tn(at, o, {f: 380, to: 250, dur: fall, vol: 0.04, a: 0.006, wave: "sine",
              pan: pathPan(o, 0.5), panTo: pathPan(o, 1)});
            hs(at, o, {dur: fall, vol: 0.06, a: 0.006, hold: 0.25, bp: [2000, 700, 0.8],
              pan: pathPan(o, 0.5), panTo: pathPan(o, 1)});
          }
        },
      };

      var WEAPONS = {
        rifle: {gap: 0.04, shots: function (n) { return 3 + n; }, shot: function (t, o) {
          hs(t, o, {dur: 0.03, vol: 0.07, a: 0.001, bp: [3200, 1500, 1.4]});
          tn(t, o, {f: 1500, to: 480, dur: 0.02, vol: 0.03, a: 0.001, wave: "sine", lp: [2400]});
        }},
        pistol: {gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
          hs(t, o, {dur: 0.022, vol: 0.05, a: 0.001, bp: [2600, 1400, 1.5]});
          tn(t, o, {f: 980, to: 360, dur: 0.018, vol: 0.025, a: 0.001, wave: "sine"});
        }},
        autocannon: {gap: 0.03, shots: function (n) { return 6 + n; }, shot: function (t, o) {
          hs(t, o, {dur: 0.014, vol: 0.06, a: 0.001, hp: [1700]});
          tn(t, o, {f: 240, to: 110, dur: 0.02, vol: 0.04, a: 0.001, wave: "sine", lp: [900]});
        }},
        cannon: {gap: 0.17, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          bass(t, o, 0.2);
          hs(t, o, {dur: 0.012, vol: 0.05, a: 0.001, hp: [3000]});
        }},
        heavyCannon: {gap: 0.22, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          tn(t, o, {f: 70, to: 30, dur: 0.28, vol: 0.24, a: 0.003, wave: "sine", wet: 0.12});
          hs(t, o, {dur: 0.2, vol: 0.12, a: 0.003, lp: [1200, 160]});
          tn(t + 0.02, o, {f: 168, to: 60, dur: 0.12, vol: 0.05, a: 0.002, wave: "sine"});
        }},
        howitzer: {gap: 0.24, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          bass(t, o, 0.16);
          tn(t + 0.05, o, {f: 620, to: 1480, dur: 0.14, vol: 0.028, a: 0.004, wave: "sine"});
          tn(t + 0.18, o, {f: 1480, to: 460, dur: 0.13, vol: 0.022, a: 0.003, wave: "sine"});
        }},
        rockets: {gap: 0.065, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
          tick(t, o, 900 + (i % 3) * 70, true);
          hs(t, o, {dur: 0.26, vol: 0.07, a: 0.012, hold: 0.35, bp: [480 + (i % 4) * 70, 2600, 1]});
          tn(t, o, {f: 240, to: 820, dur: 0.24, vol: 0.03, a: 0.01, wave: "sawtooth", lp: [700, 1800]});
        }},
        missile: {gap: 0.2, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
          bass(t, o, 0.12);
          tn(t, o, {f: 262, to: 1044, dur: 0.36, vol: 0.04, a: 0.02, wave: "sine", wet: 0.12});
          hs(t, o, {dur: 0.34, vol: 0.06, a: 0.03, hold: 0.4, hp: [500, 2400]});
        }},
        mortar: {gap: 0.16, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          tn(t, o, {f: 150, to: 55, dur: 0.08, vol: 0.14, a: 0.002, wave: "sine"});
          hs(t, o, {dur: 0.04, vol: 0.05, a: 0.002, lp: [600]});
          tn(t + 0.06, o, {f: 1320, to: 380, dur: 0.18, vol: 0.028, a: 0.004, wave: "sine"});
        }},
        flak: {gap: 0.08, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
          tick(t, o, 880, true);
          tn(t, o, {f: 280, to: 120, dur: 0.05, vol: 0.06, a: 0.002, wave: "sine", lp: [1400]});
        }},
      };

      var WEAPON_BY_TYPE = {GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
        FALCON: "missile", LYNX: "mortar"};
      var WEAPON_BY_CLASS = {infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
        buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol"};
      var SELECT_PITCH = {foot: 0, wheels: 3, treads: -7, air: 7};

      var CUES = {
        switchOn: function (t, o) {
          [3, 4, 5].forEach(function (harmonic, i) { bugle(t + i * 0.09, o, FUND * harmonic / 3, 0.22, 0.055); });
        },
        switchOff: function (t, o) {
          [5, 4, 3].forEach(function (harmonic, i) { bugle(t + i * 0.07, o, FUND * harmonic / 5, 0.12, 0.045); });
          tick(t + 0.22, o, 180, false);
        },
        select: function (t, o) {
          var call = pick(CALL, o.moveType, "movement type");
          bugle(t, o, call.fund * call.from / 2, 0.06, 0.05);
          bugle(t + 0.045, o, call.fund * call.to / 2, 0.09, 0.05);
          if (o.moveType === "air") hs(t, o, {dur: 0.04, vol: 0.03, a: 0.002, bp: [900, 1700, 0.8]});
          if (o.moveType === "treads") tick(t, o, 120, false);
        },
        cancel: function (t, o) {
          tn(t, o, {f: FUND * 4, to: FUND * 3, dur: 0.1, vol: 0.07, a: 0.003, wave: "sine"});
        },
        deny: function (t, o) {
          bass(t, o, 0.1);
          bass(t + 0.1, o, 0.08);
        },
        undo: function (t, o) {
          hs(t, o, {dur: 0.1, vol: 0.04, a: 0.002, bp: [2200, 600, 1]});
          tick(t, o, 520, true);
          tick(t + 0.05, o, 340, false);
        },
        redo: function (t, o) {
          hs(t, o, {dur: 0.1, vol: 0.04, a: 0.002, bp: [600, 2200, 1]});
          tick(t, o, 340, false);
          tick(t + 0.05, o, 520, true);
        },
        target: function (t, o) {
          tick(t, o, 1400, true);
          tn(t, o, {f: 1800, to: 2600, dur: 0.03, vol: 0.03, a: 0.001, wave: "sine"});
        },
        factory: function (t, o) {
          tick(t, o, 400, true);
          tick(t + 0.05, o, 600, true);
          bugle(t + 0.08, o, FUND, 0.12, 0.04);
        },
        turnEnd: function (t, o) {
          [5, 4, 3, 2].forEach(function (harmonic, i) {
            bugle(t + i * 0.15, o, FUND * harmonic / 2, i === 3 ? 0.4 : 0.18, 0.06);
          });
          bass(t + 0.5, o, 0.14);
        },
        turnStart: function (t, o) {
          [2, 3, 4, 5].forEach(function (harmonic, i) {
            bugle(t + i * 0.11, o, FUND * harmonic / 2, 0.16, 0.055);
          });
          tick(t + 0.46, o, 480, true);
        },
        move: function (t, o) {
          if (!(o.hexes >= 1) || !(o.step > 0)) throw new Error("Move cue needs hexes and a step time.");
          var mover = pick(MOVE_SOUND, o.moveType, "movement type");
          mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) { bass(t, o, 0.14); },
        calcMachine: function (t, o) {
          var f = hz(degree(o.index) + (o.attacking ? 12 : 0));
          tick(t, o, f, !!o.attacking);
        },
        calcSupport: function (t, o) {
          var f = hz(degree(o.index) + 12);
          if (o.side === "attack") {
            tick(t, o, f, true);
            tick(t + 0.016, o, f * 1.5, true);
          } else if (o.side === "defense") {
            tick(t, o, f / 2, false);
          } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
        },
        calcTerrain: function (t, o) {
          if (typeof o.value !== "number") throw new Error("Terrain cue needs a defense value.");
          var value = clamp(o.value, 0, 60);
          if (value === 0) { tick(t, o, 980, true); return; }
          var f = Math.max(48, 180 - value * 2.4);
          tn(t, o, {f: f, to: Math.max(36, f * 0.55), dur: 0.08 + value / 200, vol: 0.07 + value / 500, a: 0.002, wave: "sine"});
          hs(t, o, {dur: 0.05 + value / 350, vol: 0.035 + value / 800, a: 0.002, lp: [900, 200]});
          if (value >= 30) bass(t + 0.03, o, 0.06);
        },
        calcRing: function (t, o) {
          if (o.controlled) tick(t, o, hz(SCALE[o.index % 6] + 12), true);
          else tick(t, o, 150, false);
        },
        surround: function (t, o) {
          for (var i = 0; i < 4; i++) tick(t + i * 0.04, o, 280 + i * 50, true);
          tn(t + 0.16, o, {f: FUND * 3, to: FUND, dur: 0.34, vol: 0.07, a: 0.004, wave: "sine", wet: 0.22});
          tn(t + 0.16, o, {f: FUND * 4.5, to: FUND * 1.5, dur: 0.28, vol: 0.04, a: 0.004, wave: "sine", wet: 0.16});
          bass(t + 0.18, o, 0.16);
        },
        unsurrounded: function (t, o) {
          tick(t, o, 240, false);
          bugle(t + 0.02, o, FUND, 0.16, 0.04);
        },
        approach: function (t, o) {
          if (!(o.dur > 0)) throw new Error("Approach cue needs a duration.");
          var attack = Math.min(0.05, o.dur * 0.35);
          [-0.6, 0.6].forEach(function (pan) {
            hs(t, o, {dur: o.dur, vol: 0.045, a: attack, hold: 0.2, bp: [180, 640, 0.7], pan: pan});
            tn(t, o, {f: 46, to: 68, dur: o.dur, vol: 0.035, a: attack, hold: 0.2, wave: "sine", lp: [160, 360], pan: pan});
          });
          var taps = Math.max(2, Math.min(6, Math.round(o.dur / 0.14)));
          for (var i = 0; i < taps; i++) tick(t + (i + 0.5) * (o.dur / taps), o, 420, true);
        },
        fire: function (t, o) {
          if (typeof o.strength !== "number" || typeof o.span !== "number" || !(o.span > 0)) {
            throw new Error("Fire cue needs a strength and a span.");
          }
          var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
          var name = own ? WEAPON_BY_TYPE[o.typeId] : pick(WEAPON_BY_CLASS, o.cls, "unit class");
          var weapon = pick(WEAPONS, name, "weapon");
          var shots = weapon.shots(o.strength);
          if (!(shots >= 1)) throw new Error("Weapon \"" + name + "\" produced no shots.");
          var gap = Math.min(weapon.gap, o.span / shots);
          for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * Math.min(0.008, gap * 0.35), o, i);
        },
        explosion: function (t, o) {
          var size = clamp(o.size, 0.15, 1);
          var tail = 0.2 + 0.45 * size + (o.destroyed ? 0.3 : 0);
          hs(t, o, {dur: tail, vol: 0.1 + 0.16 * size, a: 0.003, lp: [2800, 100, 0.85], wet: 0.1 + 0.16 * size});
          tn(t, o, {f: 100, to: 34, dur: 0.16 + 0.24 * size, vol: 0.12 + 0.16 * size, a: 0.002, wave: "sine"});
          var debris = 2 + Math.round(size * 4);
          for (var i = 0; i < debris; i++) {
            tick(t + 0.04 + rand() * tail * 0.6, o, 600 + rand() * 900, true);
          }
          if (o.destroyed) {
            tn(t + 0.08, o, {f: FUND * 2, to: FUND * 0.5, dur: 0.45, vol: 0.06, a: 0.004, wave: "sine", wet: 0.2});
            bass(t + 0.1, o, 0.14);
          }
        },
        deflect: function (t, o) {
          bugle(t, o, 620, 0.14, 0.04);
          tick(t, o, 1600, true);
        },
        star: function (t, o) {
          bugle(t, o, hz(degree(o.rank) + 12), 0.32, 0.045);
        },
        capture: function (t, o) {
          if (o.kind === "base") {
            bass(t, o, 0.12);
            [2, 3, 4, 5].forEach(function (harmonic, i) {
              bugle(t + 0.06 + i * 0.1, o, 130 * harmonic / 2, i === 3 ? 0.32 : 0.14, 0.055);
            });
          } else if (o.kind === "factory") {
            tick(t, o, 300, true);
            [3, 4, 5].forEach(function (harmonic, i) {
              bugle(t + 0.04 + i * 0.08, o, 196 * harmonic / 3, 0.14, 0.05);
            });
          } else throw new Error("Capture kind must be base or factory, not \"" + o.kind + "\".");
        },
        repair: function (t, o) {
          for (var i = 0; i < 6; i++) tick(t + i * 0.055, o, hz(SCALE[i] + 12), true);
          bugle(t + 0.34, o, hz(SCALE[5]), 0.28, 0.05);
        },
        deploy: function (t, o) {
          hs(t, o, {dur: 0.22, vol: 0.06, a: 0.02, hold: 0.3, hp: [2800, 800]});
          bass(t + 0.18, o, 0.14);
          bugle(t + 0.3, o, FUND * 2, 0.14, 0.045);
        },
        load: function (t, o) {
          bass(t, o, 0.1);
          bugle(t + 0.08, o, FUND * 1.5, 0.08, 0.04);
          bugle(t + 0.14, o, FUND * 2, 0.1, 0.04);
        },
        unload: function (t, o) {
          hs(t, o, {dur: 0.016, vol: 0.05, a: 0.001, bp: [2400, null, 2]});
          bugle(t + 0.02, o, FUND * 2, 0.08, 0.04);
          bugle(t + 0.1, o, FUND * 1.5, 0.1, 0.04);
        },
        victory: function (t, o) {
          [3, 4, 5, 6, 8].forEach(function (harmonic, i) {
            bugle(t + i * 0.1, o, FUND * harmonic / 2, i === 4 ? 0.45 : 0.16, 0.055);
          });
          [0.5, 0.56, 0.61].forEach(function (at) { tick(t + at, o, 500, true); });
          bass(t + 0.58, o, 0.16);
        },
        defeat: function (t, o) {
          [[3, 0.32], [2, 0.4], [1, 0.7]].forEach(function (note, i) {
            bugle(t + i * 0.34, o, FUND * note[0], note[1], 0.05);
          });
          bass(t + 0.7, o, 0.1);
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
        weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
    },
  });
})();
