/* Soundscape "Deep orbit" — Composer (Cursor).
 *
 * Cold vacuum telemetry: sine and triangle voices, tight noise bursts, a D
 * Phrygian scale, and short reverb. Same cue names and gameplay roles as the
 * remake default bank; nothing sampled or copied from Hudson audio.
 */
"use strict";

(function () {
  var register = typeof module !== "undefined" ? require("./sfx.js").registerBank : SFX.registerBank;

  register({
    id: "composer",
    creator: "Composer",
    title: "Deep orbit",
    description: "Lunar relay clicks, sonar targeting and restrained vacuum booms for a colder battlefield.",
    seed: 88001123,
    scale: [62, 63, 65, 67, 69, 70, 72, 74, 77],
    room: {seconds: 0.52, wetGain: 0.32},
    masterGain: 0.78,
    build: function (d) {
      var tn = d.tn, hs = d.hs, hz = d.hz, SCALE = d.SCALE, pick = d.pick;
      var clamp = d.clamp, lerp = d.lerp, pathPan = d.pathPan, rand = d.rand;

      function ping(t, o, midi, dur, vol, wet) {
        tn(t, o, {f: hz(midi), dur: dur || 0.07, wave: "sine", vol: vol || 0.11, a: 0.002, wet: wet || 0.12});
        tn(t, o, {f: hz(midi + 19), dur: (dur || 0.07) * 0.55, vol: (vol || 0.11) * 0.22, a: 0.002, wet: wet || 0.1});
      }

      function commsSweep(t, o, rising) {
        var from = rising ? 420 : 920, to = rising ? 980 : 280;
        tn(t, o, {f: from, to: to, dur: rising ? 0.48 : 0.72, wave: "triangle", vol: 0.14, a: 0.02, hold: 0.55,
          bp: [900, 2400, 4], wet: 0.18});
        tn(t, o, {f: from * 1.01, to: to * 1.01, dur: rising ? 0.48 : 0.72, wave: "sine", vol: 0.06, detune: 11,
          bp: [1200, 2800, 3], wet: 0.14});
        hs(t, o, {dur: rising ? 0.35 : 0.5, vol: 0.035, a: 0.04, hold: 0.4, hp: [1800, 4200]});
      }

      var MOVE_SOUND = {
        foot: function (t, o, n, step) {
          for (var i = 0; i < n; i++) {
            var pan = pathPan(o, (i + 0.5) / n), at = t + (i + 0.65) * step;
            ping(at, Object.assign({}, o, {pan: pan}), SCALE[2], 0.04, 0.08, 0.05);
            hs(at, o, {dur: 0.022, vol: 0.045, bp: [2200, 1400, 1.6], pan: pan});
          }
        },
        wheels: function (t, o, n, step, dur) {
          tn(t, o, {f: 88, to: 156, glide: 0.35, dur: dur, wave: "triangle", vol: 0.09, a: 0.04, hold: 0.7,
            vib: [14, 8], lp: [480, 1200], panTo: o.panTo});
          hs(t, o, {dur: dur, vol: 0.045, a: 0.05, hold: 0.75, bp: [600, 1800, 0.9], panTo: o.panTo});
        },
        treads: function (t, o, n, step, dur) {
          tn(t, o, {f: 48, to: 62, dur: dur, wave: "square", vol: 0.11, a: 0.06, hold: 0.82, lp: [140, 220], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.35) * step, pan = pathPan(o, (i + 0.5) / n);
            tn(at, o, {f: 120, to: 55, dur: 0.05, vol: 0.07, wave: "triangle", pan: pan});
          }
        },
        air: function (t, o, n, step, dur) {
          hs(t, o, {dur: dur, vol: 0.11, a: dur * 0.25, hold: 0.55, bp: [520, 3200, 0.9], panTo: o.panTo});
          tn(t, o, {f: 180, to: 320, dur: dur, wave: "sine", vol: 0.045, a: dur * 0.2, hold: 0.5,
            vib: [5, 18], panTo: o.panTo, wet: 0.08});
        },
      };

      var WEAPONS = {
        rifle: {gap: 0.045, shots: function (n) { return 3 + n; }, shot: function (t, o) {
          tn(t, o, {f: 2400, to: 980, dur: 0.045, wave: "sine", vol: 0.05});
          hs(t, o, {dur: 0.018, vol: 0.05, hp: [4200]});
        }},
        autocannon: {gap: 0.036, shots: function (n) { return 5 + Math.round(n * 1.2); }, shot: function (t, o) {
          tn(t, o, {f: 420, to: 180, dur: 0.04, wave: "triangle", vol: 0.055, lp: [1400]});
          hs(t, o, {dur: 0.022, vol: 0.06, bp: [900, 2200, 1.2]});
        }},
        cannon: {gap: 0.19, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          tn(t, o, {f: 120, to: 38, dur: 0.22, vol: 0.22, wet: 0.1});
          hs(t, o, {dur: 0.14, vol: 0.12, lp: [1800, 220]});
          hs(t, o, {dur: 0.008, vol: 0.05, hp: [3400]});
        }},
        heavyCannon: {gap: 0.22, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          tn(t, o, {f: 82, to: 28, dur: 0.36, vol: 0.28, wet: 0.2});
          hs(t, o, {dur: 0.24, vol: 0.15, lp: [1100, 160]});
          tn(t + 0.015, o, {f: 190, to: 70, dur: 0.1, wave: "triangle", vol: 0.06, lp: [600]});
        }},
        howitzer: {gap: 0.27, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          tn(t, o, {f: 78, to: 32, dur: 0.34, vol: 0.24, wet: 0.22});
          hs(t, o, {dur: 0.22, vol: 0.11, lp: [800, 180]});
          tn(t + 0.06, o, {f: 1600, to: 620, dur: 0.28, vol: 0.028, wave: "sine"});
        }},
        rockets: {gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
          hs(t, o, {dur: 0.3, vol: 0.09, a: 0.02, hold: 0.45, bp: [800 + i * 80, 3400, 1]});
          tn(t, o, {f: 260, to: 920, dur: 0.28, wave: "sawtooth", vol: 0.035, lp: [1000, 2600]});
        }},
        missile: {gap: 0.2, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
          hs(t, o, {dur: 0.4, vol: 0.1, a: 0.04, hold: 0.5, hp: [420, 2600]});
          tn(t, o, {f: 280, to: 1400, dur: 0.38, wave: "triangle", vol: 0.045, lp: [1500, 3800], wet: 0.12});
          tn(t, o, {f: 110, to: 55, dur: 0.09, vol: 0.12});
        }},
        mortar: {gap: 0.16, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          tn(t, o, {f: 190, to: 62, dur: 0.12, vol: 0.16});
          tn(t + 0.05, o, {f: 1200, to: 640, dur: 0.18, vol: 0.022, wave: "sine"});
        }},
        flak: {gap: 0.09, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
          tn(t, o, {f: 260, to: 110, dur: 0.07, wave: "square", vol: 0.09, lp: [1600]});
          hs(t, o, {dur: 0.05, vol: 0.07, bp: [1100, null, 1.1]});
        }},
        pistol: {gap: 0.075, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
          tn(t, o, {f: 820, to: 320, dur: 0.028, wave: "sine", vol: 0.03});
          hs(t, o, {dur: 0.02, vol: 0.05, bp: [2100, 1300, 1.3]});
        }},
      };

      var WEAPON_BY_TYPE = {GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
        FALCON: "missile", LYNX: "mortar"};
      var WEAPON_BY_CLASS = {infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
        buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol"};
      var SELECT_PITCH = {foot: 0, wheels: 2, treads: -4, air: 5};

      var CUES = {
        switchOn: function (t, o) {
          [0, 2, 4].forEach(function (degree, i) {
            ping(t + i * 0.06, o, SCALE[degree], 0.09, 0.1, 0.14);
          });
        },
        switchOff: function (t, o) {
          [4, 2, 0].forEach(function (degree, i) {
            ping(t + i * 0.05, o, SCALE[degree], 0.07, 0.08, 0.06);
          });
        },
        select: function (t, o) {
          var shift = pick(SELECT_PITCH, o.moveType, "movement type");
          ping(t, o, SCALE[5] + shift, 0.05, 0.09, 0.06);
          ping(t + 0.04, o, SCALE[7] + shift, 0.07, 0.085, 0.1);
        },
        cancel: function (t, o) {
          tn(t, o, {f: hz(SCALE[6]), to: hz(SCALE[3]), dur: 0.08, wave: "sine", vol: 0.09});
        },
        deny: function (t, o) {
          [0, 0.1].forEach(function (later) {
            tn(t + later, o, {f: 180, to: 150, dur: 0.07, wave: "square", vol: 0.09, lp: [1100]});
          });
        },
        undo: function (t, o) {
          ping(t, o, SCALE[6], 0.05, 0.09);
          ping(t + 0.05, o, SCALE[4], 0.08, 0.09);
        },
        redo: function (t, o) {
          ping(t, o, SCALE[4], 0.05, 0.09);
          ping(t + 0.05, o, SCALE[6], 0.08, 0.09);
        },
        target: function (t, o) {
          tn(t, o, {f: 880, to: 1320, dur: 0.12, wave: "sine", vol: 0.06, a: 0.004, hold: 0.35, vib: [16, 22]});
          hs(t, o, {dur: 0.015, vol: 0.04, hp: [3800]});
        },
        factory: function (t, o) {
          [0, 3, 5].forEach(function (degree, i) {
            ping(t + i * 0.07, o, SCALE[degree], 0.08, 0.09, 0.08);
          });
        },
        turnEnd: function (t, o) { commsSweep(t, o, false); },
        turnStart: function (t, o) {
          commsSweep(t, o, true);
          ping(t + 0.42, o, SCALE[4], 0.12, 0.1, 0.16);
          ping(t + 0.52, o, SCALE[7], 0.28, 0.09, 0.2);
        },
        move: function (t, o) {
          var mover = pick(MOVE_SOUND, o.moveType, "movement type");
          mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) {
          tn(t, o, {f: 140, to: 68, dur: 0.08, vol: 0.12, wave: "triangle"});
          hs(t, o, {dur: 0.03, vol: 0.05, lp: [900]});
        },
        calcMachine: function (t, o) {
          var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
          if (o.attacking) ping(t, o, degree + 12, 0.025, 0.05, 0.04);
          else tn(t, o, {f: hz(degree), dur: 0.028, wave: "triangle", vol: 0.055, lp: [2400]});
        },
        calcSupport: function (t, o) {
          var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
          if (o.side === "attack") {
            ping(t, o, degree + 12, 0.05, 0.095, 0.08);
            ping(t + 0.045, o, degree + 19, 0.08, 0.09, 0.1);
          } else if (o.side === "defense") {
            tn(t, o, {f: hz(degree), to: hz(degree) * 0.92, dur: 0.12, wave: "sine", vol: 0.12, wet: 0.08});
          } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
        },
        calcTerrain: function (t, o) {
          var value = clamp(o.value, 0, 60);
          if (value === 0) { ping(t, o, SCALE[6], 0.025, 0.045); return; }
          var f = 165 - value;
          tn(t, o, {f: f, to: f * 0.48, dur: 0.14, vol: 0.1 + value / 450, wave: "triangle"});
          hs(t, o, {dur: 0.08, vol: 0.05 + value / 550, lp: [1000, 280]});
        },
        calcRing: function (t, o) {
          if (o.controlled) ping(t, o, SCALE[o.index % 6] + 12, 0.05, 0.095, 0.06);
          else tn(t, o, {f: 190, to: 160, dur: 0.06, wave: "sine", vol: 0.08});
        },
        surround: function (t, o) {
          tn(t, o, {f: 1200, to: 80, glide: 0.85, dur: 0.38, wave: "triangle", vol: 0.1, lp: [3200, 200, 2], wet: 0.18});
          hs(t + 0.02, o, {dur: 0.22, vol: 0.07, bp: [2600, 350, 1.1]});
          tn(t + 0.32, o, {f: 68, to: 32, dur: 0.28, vol: 0.24, wet: 0.14});
        },
        unsurrounded: function (t, o) {
          tn(t, o, {f: 310, to: 250, dur: 0.1, wave: "sine", vol: 0.07});
        },
        approach: function (t, o) {
          [-0.55, 0.55].forEach(function (pan) {
            hs(t, o, {dur: o.dur, vol: 0.07, a: o.dur * 0.75, hold: 0.12, bp: [280, 1100, 0.9], pan: pan});
            tn(t, o, {f: 55, to: 120, dur: o.dur, wave: "sine", vol: 0.04, a: o.dur * 0.75, hold: 0.12,
              lp: [280, 620], pan: pan});
          });
        },
        fire: function (t, o) {
          var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
          var weapon = pick(WEAPONS, own ? WEAPON_BY_TYPE[o.typeId] : pick(WEAPON_BY_CLASS, o.cls, "unit class"), "weapon");
          var shots = weapon.shots(o.strength), gap = Math.min(weapon.gap, o.span / shots);
          for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * 0.01, o, i);
        },
        explosion: function (t, o) {
          var size = clamp(o.size, 0.15, 1), tail = 0.18 + 0.42 * size + (o.destroyed ? 0.28 : 0);
          hs(t, o, {dur: tail, vol: 0.1 + 0.16 * size, a: 0.003, lp: [3000, 130, 0.85], wet: 0.12 + 0.18 * size});
          tn(t, o, {f: 95, to: 28, dur: 0.18 + 0.32 * size, vol: 0.12 + 0.2 * size, wave: "triangle"});
          var debris = 1 + Math.round(size * 5 + (o.destroyed ? 2 : 0));
          for (var i = 0; i < debris; i++) {
            hs(t + 0.06 + rand() * tail * 0.85, o, {dur: 0.015 + rand() * 0.03, vol: 0.025 + rand() * 0.035,
              bp: [2000 + rand() * 2800, null, 1.4]});
          }
          if (o.destroyed) tn(t + 0.09, o, {f: 58, to: 24, dur: 0.48, vol: 0.16, wet: 0.22});
        },
        deflect: function (t, o) {
          [1760, 2640, 1980].forEach(function (f, i) {
            tn(t + i * 0.008, o, {f: f, dur: 0.2 - i * 0.04, vol: 0.055 - i * 0.012, a: 0.002, wave: "sine"});
          });
          hs(t, o, {dur: 0.015, vol: 0.05, bp: [3400, null, 2]});
        },
        star: function (t, o) {
          var f = hz(SCALE[clamp(o.rank, 0, SCALE.length - 1)] + 12);
          tn(t, o, {f: f, dur: 0.45, vol: 0.085, a: 0.002, wet: 0.22, wave: "sine", vib: [4.5, 10]});
        },
        capture: function (t, o) {
          var degrees = o.kind === "base" ? [0, 2, 4, 5, 7] : [3, 4, 5, 6];
          hs(t, o, {dur: 0.07, vol: 0.08, bp: [1400, 280, 1]});
          degrees.forEach(function (degree, i) {
            ping(t + 0.04 + i * 0.08, o, SCALE[degree] + 12, i === degrees.length - 1 ? 0.5 : 0.09, 0.095, 0.14);
          });
        },
        repair: function (t, o) {
          for (var i = 0; i < 6; i++) ping(t + i * 0.05, o, SCALE[i] + 12, 0.14, 0.065, 0.14);
        },
        deploy: function (t, o) {
          hs(t, o, {dur: 0.28, vol: 0.08, a: 0.03, hold: 0.35, hp: [3000, 800, 0.85]});
          ping(t + 0.24, o, SCALE[2], 0.1, 0.12, 0.1);
          tn(t + 0.32, o, {f: 380, to: 760, glide: 0.75, dur: 0.12, wave: "sine", vol: 0.05});
        },
        load: function (t, o) {
          hs(t, o, {dur: 0.018, vol: 0.07, bp: [2600, null, 2]});
          ping(t + 0.02, o, SCALE[3], 0.06, 0.08);
          ping(t + 0.07, o, SCALE[5], 0.07, 0.08);
        },
        unload: function (t, o) {
          hs(t, o, {dur: 0.018, vol: 0.07, bp: [2600, null, 2]});
          ping(t + 0.02, o, SCALE[5], 0.06, 0.08);
          ping(t + 0.07, o, SCALE[3], 0.07, 0.08);
        },
        victory: function (t, o) {
          [0, 2, 4, 6].forEach(function (degree, i) {
            ping(t + i * 0.11, o, SCALE[degree] + 12, 0.12, 0.1, 0.16);
          });
          tn(t + 0.46, o, {f: hz(SCALE[7]), dur: 1.1, vol: 0.075, a: 0.008, hold: 0.55, wave: "sine", wet: 0.22, vib: [5, 14]});
        },
        defeat: function (t, o) {
          [6, 4, 2, 0].forEach(function (degree, i) {
            tn(t + i * 0.22, o, {f: hz(SCALE[degree]), dur: 0.26, wave: "sine", vol: 0.1, lp: [2200], wet: 0.16});
          });
          commsSweep(t + 0.88, o, false);
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
        weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
    },
  });
})();
