/* Soundscape "Deep orbit" — Composer (Cursor).
 *
 * Lunar telemetry built like late-80s wavetable hardware: stacked channels
 * (lead buzz, triangle body, hollow fifth, sub octave), not bare sine blips.
 * D Phrygian scale; same cue roles as other banks; no sampled Hudson audio.
 */
"use strict";

(function () {
  var register = typeof module !== "undefined" ? require("./sfx.js").registerBank : SFX.registerBank;

  register({
    id: "composer",
    creator: "Composer",
    title: "Deep orbit",
    description: "Relay beeps with HuC6280-style layering: detuned wavetable leads, sub weight and punchy transients.",
    seed: 88001123,
    scale: [62, 63, 65, 67, 69, 70, 72, 74, 77],
    room: {seconds: 0.78, wetGain: 0.42},
    masterGain: 0.84,
    build: function (d) {
      var tn = d.tn, hs = d.hs, hz = d.hz, SCALE = d.SCALE, pick = d.pick;
      var clamp = d.clamp, lerp = d.lerp, pathPan = d.pathPan, rand = d.rand;

      // Three-channel stack: bright wavetable lead, warm body, optional sub.
      function stack(t, o, midi, dur, vol, wet) {
        var f = hz(midi), body = vol || 0.11, send = wet != null ? wet : 0.14;
        tn(t, o, {f: f, dur: dur || 0.09, wave: "buzz", vol: body, a: 0.003, hold: 0.45, wet: send});
        tn(t, o, {f: f, dur: (dur || 0.09) * 1.05, wave: "triangle", vol: body * 0.55, detune: -7, a: 0.004, wet: send * 0.7});
        tn(t, o, {f: f * 2.01, dur: (dur || 0.09) * 0.65, wave: "hollow", vol: body * 0.28, a: 0.002, wet: send * 0.85});
      }

      function ping(t, o, midi, dur, vol, wet) {
        stack(t, o, midi, dur, vol, wet);
        tn(t, o, {f: hz(midi - 12), dur: (dur || 0.09) * 1.1, wave: "sawtooth", vol: (vol || 0.11) * 0.35,
          a: 0.006, hold: 0.5, lp: [420, 180], wet: (wet || 0.14) * 0.6});
      }

      function thump(t, o, f, dur, vol, wet) {
        tn(t, o, {f: f, to: f * 0.42, dur: dur, vol: vol, a: 0.003, hold: 0.35, wet: wet || 0.15});
        tn(t, o, {f: f * 0.5, to: f * 0.28, dur: dur * 1.05, wave: "sawtooth", vol: vol * 0.65, lp: [260, 90]});
        hs(t, o, {dur: dur * 0.7, vol: vol * 0.45, a: 0.002, lp: [2200, 320]});
      }

      function commsSweep(t, o, rising) {
        var from = rising ? 380 : 880, to = rising ? 920 : 240, dur = rising ? 0.52 : 0.82;
        [-11, 11].forEach(function (detune) {
          tn(t, o, {f: from, to: to, dur: dur, wave: "reed", vol: 0.16, detune: detune, a: 0.018, hold: 0.6,
            bp: [780, 2200, 5], wet: 0.22});
        });
        tn(t, o, {f: from * 0.49, to: to * 0.49, dur: dur, wave: "buzz", vol: 0.12, a: 0.02, hold: 0.65, lp: [380, 120]});
        tn(t, o, {f: from * 2.4, to: to * 2.4, dur: dur * 0.9, wave: "hollow", vol: 0.05, vib: [5.5, 28], wet: 0.25});
        hs(t, o, {dur: dur * 0.65, vol: 0.055, a: 0.03, hold: 0.45, hp: [1600, 4000]});
      }

      var MOVE_SOUND = {
        foot: function (t, o, n, step) {
          for (var i = 0; i < n; i++) {
            var pan = pathPan(o, (i + 0.5) / n), at = t + (i + 0.55) * step;
            ping(at, Object.assign({}, o, {pan: pan}), SCALE[2], 0.045, 0.085, 0.08);
            thump(at + 0.008, Object.assign({}, o, {pan: pan}), 105, 0.05, 0.06, 0.05);
          }
        },
        wheels: function (t, o, n, step, dur) {
          tn(t, o, {f: 72, to: 148, glide: 0.38, dur: dur, wave: "buzz", vol: 0.11, a: 0.035, hold: 0.72,
            vib: [11, 14], lp: [420, 1100], panTo: o.panTo});
          tn(t, o, {f: 36, to: 74, dur: dur, wave: "sawtooth", vol: 0.08, a: 0.05, hold: 0.75, lp: [180, 420], panTo: o.panTo});
          hs(t, o, {dur: dur, vol: 0.07, a: 0.04, hold: 0.78, bp: [550, 1900, 0.85], panTo: o.panTo});
        },
        treads: function (t, o, n, step, dur) {
          tn(t, o, {f: 44, to: 58, dur: dur, wave: "sawtooth", vol: 0.15, a: 0.06, hold: 0.8, lp: [130, 240], panTo: o.panTo});
          hs(t, o, {dur: dur, vol: 0.065, a: 0.08, hold: 0.82, bp: [200, 320, 0.75], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.4) * step, pan = pathPan(o, (i + 0.5) / n);
            thump(at, o, 98, 0.065, 0.09, 0.06);
            hs(at, o, {dur: 0.028, vol: 0.05, bp: [1400 + (i % 2) * 350, null, 1.3], pan: pan});
          }
        },
        air: function (t, o, n, step, dur) {
          hs(t, o, {dur: dur, vol: 0.13, a: dur * 0.22, hold: 0.52, bp: [480, 3400, 1], panTo: o.panTo});
          tn(t, o, {f: 165, to: 290, dur: dur, wave: "buzz", vol: 0.07, a: dur * 0.18, hold: 0.5,
            vib: [4.5, 22], panTo: o.panTo, wet: 0.12});
          tn(t, o, {f: 82, to: 145, dur: dur, wave: "triangle", vol: 0.05, lp: [400, 900], panTo: o.panTo});
        },
      };

      var WEAPONS = {
        rifle: {gap: 0.042, shots: function (n) { return 3 + n; }, shot: function (t, o) {
          tn(t, o, {f: 2200, to: 860, dur: 0.04, wave: "buzz", vol: 0.055});
          tn(t, o, {f: 520, to: 220, dur: 0.035, wave: "square", vol: 0.035, lp: [1400]});
          hs(t, o, {dur: 0.022, vol: 0.07, bp: [2800, 1400, 1.4]});
        }},
        autocannon: {gap: 0.034, shots: function (n) { return 5 + Math.round(n * 1.2); }, shot: function (t, o) {
          tn(t, o, {f: 360, to: 150, dur: 0.038, wave: "buzz", vol: 0.065, lp: [1300]});
          thump(t, o, 130, 0.045, 0.05, 0.04);
          hs(t, o, {dur: 0.025, vol: 0.065, hp: [1500]});
        }},
        cannon: {gap: 0.18, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          thump(t, o, 128, 0.24, 0.26, 0.14);
          hs(t, o, {dur: 0.17, vol: 0.14, lp: [1700, 240]});
          hs(t, o, {dur: 0.012, vol: 0.07, hp: [3200]});
        }},
        heavyCannon: {gap: 0.21, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          thump(t, o, 92, 0.38, 0.32, 0.22);
          hs(t, o, {dur: 0.28, vol: 0.17, lp: [1100, 170]});
          tn(t + 0.018, o, {f: 200, to: 75, dur: 0.12, wave: "reed", vol: 0.09, lp: [650]});
        }},
        howitzer: {gap: 0.26, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          thump(t, o, 84, 0.36, 0.28, 0.24);
          hs(t, o, {dur: 0.24, vol: 0.13, lp: [850, 190]});
          tn(t + 0.05, o, {f: 1500, to: 540, dur: 0.32, vol: 0.04, wave: "hollow", wet: 0.1});
        }},
        rockets: {gap: 0.065, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
          hs(t, o, {dur: 0.32, vol: 0.11, a: 0.018, hold: 0.42, bp: [720 + i * 85, 3300, 1.05]});
          tn(t, o, {f: 230, to: 900, dur: 0.3, wave: "buzz", vol: 0.05, lp: [950, 2500]});
          tn(t, o, {f: 115, to: 440, dur: 0.28, wave: "sawtooth", vol: 0.035, lp: [600, 1800]});
        }},
        missile: {gap: 0.19, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
          hs(t, o, {dur: 0.42, vol: 0.12, a: 0.04, hold: 0.48, hp: [400, 2700]});
          tn(t, o, {f: 270, to: 1450, dur: 0.4, wave: "buzz", vol: 0.055, lp: [1400, 3600], wet: 0.14});
          thump(t, o, 108, 0.12, 0.15, 0.1);
        }},
        mortar: {gap: 0.15, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          thump(t, o, 195, 0.14, 0.19, 0.08);
          hs(t, o, {dur: 0.07, vol: 0.07, lp: [650]});
          tn(t + 0.045, o, {f: 1250, to: 680, dur: 0.2, vol: 0.03, wave: "hollow"});
        }},
        flak: {gap: 0.085, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
          tn(t, o, {f: 250, to: 105, dur: 0.075, wave: "square", vol: 0.1, lp: [1550]});
          tn(t, o, {f: 780, to: 420, dur: 0.05, wave: "buzz", vol: 0.04});
          hs(t, o, {dur: 0.055, vol: 0.075, bp: [950, null, 1]});
        }},
        pistol: {gap: 0.072, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
          tn(t, o, {f: 760, to: 280, dur: 0.03, wave: "buzz", vol: 0.035});
          thump(t, o, 165, 0.04, 0.045, 0.03);
          hs(t, o, {dur: 0.022, vol: 0.055, bp: [2000, 1200, 1.25]});
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
            ping(t + i * 0.065, o, SCALE[degree], 0.1, 0.105, 0.16);
          });
        },
        switchOff: function (t, o) {
          [4, 2, 0].forEach(function (degree, i) {
            stack(t + i * 0.055, o, SCALE[degree], 0.08, 0.085, 0.08);
          });
        },
        select: function (t, o) {
          var shift = pick(SELECT_PITCH, o.moveType, "movement type");
          ping(t, o, SCALE[5] + shift, 0.055, 0.095, 0.1);
          ping(t + 0.042, o, SCALE[7] + shift, 0.075, 0.09, 0.12);
        },
        cancel: function (t, o) {
          tn(t, o, {f: hz(SCALE[6]), to: hz(SCALE[3]), dur: 0.09, wave: "hollow", vol: 0.11});
          tn(t, o, {f: hz(SCALE[6]) * 0.5, to: hz(SCALE[3]) * 0.5, dur: 0.1, wave: "triangle", vol: 0.06});
        },
        deny: function (t, o) {
          [0, 0.11].forEach(function (later) {
            tn(t + later, o, {f: 165, to: 135, dur: 0.08, wave: "square", vol: 0.1, lp: [1000]});
            tn(t + later + 0.01, o, {f: 330, to: 270, dur: 0.06, wave: "buzz", vol: 0.045});
          });
        },
        undo: function (t, o) {
          ping(t, o, SCALE[6], 0.055, 0.095);
          ping(t + 0.055, o, SCALE[4], 0.085, 0.095);
        },
        redo: function (t, o) {
          ping(t, o, SCALE[4], 0.055, 0.095);
          ping(t + 0.055, o, SCALE[6], 0.085, 0.095);
        },
        target: function (t, o) {
          tn(t, o, {f: 820, to: 1280, dur: 0.14, wave: "buzz", vol: 0.07, a: 0.003, hold: 0.4, vib: [14, 26], wet: 0.1});
          tn(t, o, {f: 410, to: 640, dur: 0.14, wave: "triangle", vol: 0.05, detune: 8});
          hs(t, o, {dur: 0.018, vol: 0.05, hp: [3600]});
        },
        factory: function (t, o) {
          [0, 3, 5].forEach(function (degree, i) {
            ping(t + i * 0.075, o, SCALE[degree], 0.085, 0.095, 0.1);
          });
          thump(t + 0.22, o, 95, 0.08, 0.08, 0.08);
        },
        turnEnd: function (t, o) { commsSweep(t, o, false); },
        turnStart: function (t, o) {
          commsSweep(t, o, true);
          ping(t + 0.44, o, SCALE[4], 0.13, 0.105, 0.18);
          stack(t + 0.54, o, SCALE[7], 0.32, 0.1, 0.22);
        },
        move: function (t, o) {
          var mover = pick(MOVE_SOUND, o.moveType, "movement type");
          mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) {
          thump(t, o, 135, 0.1, 0.14, 0.08);
          hs(t, o, {dur: 0.035, vol: 0.06, lp: [850]});
        },
        calcMachine: function (t, o) {
          var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
          if (o.attacking) stack(t, o, degree + 12, 0.03, 0.058, 0.05);
          else tn(t, o, {f: hz(degree), dur: 0.032, wave: "hollow", vol: 0.065, lp: [2300]});
        },
        calcSupport: function (t, o) {
          var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
          if (o.side === "attack") {
            ping(t, o, degree + 12, 0.055, 0.1, 0.1);
            stack(t + 0.048, o, degree + 19, 0.085, 0.095, 0.12);
          } else if (o.side === "defense") {
            tn(t, o, {f: hz(degree), to: hz(degree) * 0.91, dur: 0.14, wave: "hollow", vol: 0.13, wet: 0.1});
            tn(t, o, {f: hz(degree) * 0.5, dur: 0.16, wave: "triangle", vol: 0.07, lp: [500]});
          } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
        },
        calcTerrain: function (t, o) {
          var value = clamp(o.value, 0, 60);
          if (value === 0) { ping(t, o, SCALE[6], 0.028, 0.05); return; }
          var f = 158 - value;
          thump(t, o, f, 0.16, 0.11 + value / 400, 0.08);
          hs(t, o, {dur: 0.09, vol: 0.06 + value / 500, lp: [1050, 260]});
          if (value >= 30) hs(t + 0.04, o, {dur: 0.055, vol: 0.055, bp: [400, null, 2]});
        },
        calcRing: function (t, o) {
          if (o.controlled) ping(t, o, SCALE[o.index % 6] + 12, 0.055, 0.1, 0.08);
          else {
            tn(t, o, {f: 185, to: 155, dur: 0.07, wave: "buzz", vol: 0.085});
            tn(t, o, {f: 92, dur: 0.08, wave: "triangle", vol: 0.05});
          }
        },
        surround: function (t, o) {
          tn(t, o, {f: 1150, to: 75, glide: 0.88, dur: 0.4, wave: "buzz", vol: 0.12, lp: [3400, 190, 2], wet: 0.22});
          tn(t, o, {f: 575, to: 38, dur: 0.4, wave: "square", vol: 0.07, lp: [2000, 180], detune: 12});
          hs(t + 0.02, o, {dur: 0.28, vol: 0.085, bp: [2700, 320, 1.15]});
          thump(t + 0.34, o, 70, 0.32, 0.26, 0.18);
        },
        unsurrounded: function (t, o) {
          tn(t, o, {f: 305, to: 245, dur: 0.11, wave: "hollow", vol: 0.085});
        },
        approach: function (t, o) {
          [-0.55, 0.55].forEach(function (pan) {
            hs(t, o, {dur: o.dur, vol: 0.085, a: o.dur * 0.72, hold: 0.14, bp: [260, 1250, 1], pan: pan});
            tn(t, o, {f: 52, to: 125, dur: o.dur, wave: "buzz", vol: 0.055, a: o.dur * 0.72, hold: 0.14,
              lp: [260, 680], pan: pan});
            tn(t, o, {f: 26, to: 62, dur: o.dur, wave: "sawtooth", vol: 0.04, lp: [120, 320], pan: pan});
          });
        },
        fire: function (t, o) {
          var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
          var weapon = pick(WEAPONS, own ? WEAPON_BY_TYPE[o.typeId] : pick(WEAPON_BY_CLASS, o.cls, "unit class"), "weapon");
          var shots = weapon.shots(o.strength), gap = Math.min(weapon.gap, o.span / shots);
          for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * 0.012, o, i);
        },
        explosion: function (t, o) {
          var size = clamp(o.size, 0.15, 1), tail = 0.22 + 0.48 * size + (o.destroyed ? 0.32 : 0);
          hs(t, o, {dur: tail, vol: 0.12 + 0.18 * size, a: 0.003, lp: [3200, 100, 0.9], wet: 0.16 + 0.2 * size});
          thump(t, o, 102, 0.2 + 0.38 * size, 0.14 + 0.22 * size, 0.14 + 0.12 * size);
          hs(t, o, {dur: 0.045, vol: 0.06 + 0.05 * size, hp: [2400]});
          var debris = 2 + Math.round(size * 6 + (o.destroyed ? 3 : 0));
          for (var i = 0; i < debris; i++) {
            hs(t + 0.07 + rand() * tail * 0.88, o, {dur: 0.018 + rand() * 0.035, vol: 0.03 + rand() * 0.04,
              bp: [1700 + rand() * 2900, null, 1.45]});
          }
          if (o.destroyed) thump(t + 0.1, o, 62, 0.58, 0.2, 0.28);
        },
        deflect: function (t, o) {
          [1720, 2580, 1935].forEach(function (f, i) {
            tn(t + i * 0.009, o, {f: f, dur: 0.22 - i * 0.04, vol: 0.06 - i * 0.012, a: 0.002, wave: "hollow"});
            tn(t + i * 0.009, o, {f: f * 0.5, dur: 0.15, vol: 0.035, wave: "triangle", a: 0.003});
          });
          hs(t, o, {dur: 0.02, vol: 0.065, bp: [3300, null, 2]});
          thump(t + 0.012, o, 88, 0.07, 0.08, 0.05);
        },
        star: function (t, o) {
          var midi = SCALE[clamp(o.rank, 0, SCALE.length - 1)] + 12;
          stack(t, o, midi, 0.5, 0.095, 0.28);
          tn(t, o, {f: hz(midi) * 3.02, dur: 0.35, vol: 0.035, wave: "hollow", a: 0.002, wet: 0.25, vib: [4, 12]});
        },
        capture: function (t, o) {
          thump(t, o, 88, 0.22, 0.18, 0.12);
          var degrees = o.kind === "base" ? [0, 2, 4, 5, 7] : [3, 4, 5, 6];
          degrees.forEach(function (degree, i) {
            ping(t + 0.05 + i * 0.082, o, SCALE[degree] + 12, i === degrees.length - 1 ? 0.55 : 0.095, 0.1, 0.16);
          });
        },
        repair: function (t, o) {
          for (var i = 0; i < 6; i++) stack(t + i * 0.052, o, SCALE[i] + 12, 0.15, 0.07, 0.16);
          tn(t + 0.32, o, {f: hz(SCALE[7]), dur: 0.35, vol: 0.045, wave: "hollow", wet: 0.2});
        },
        deploy: function (t, o) {
          hs(t, o, {dur: 0.3, vol: 0.095, a: 0.035, hold: 0.32, hp: [3100, 850, 0.9]});
          thump(t + 0.26, o, 102, 0.12, 0.18, 0.1);
          tn(t + 0.34, o, {f: 400, to: 820, glide: 0.78, dur: 0.14, wave: "buzz", vol: 0.065, wet: 0.08});
        },
        load: function (t, o) {
          hs(t, o, {dur: 0.02, vol: 0.075, bp: [2500, null, 2]});
          thump(t, o, 200, 0.08, 0.1, 0.05);
          ping(t + 0.04, o, SCALE[3], 0.065, 0.085);
          ping(t + 0.09, o, SCALE[5], 0.075, 0.085);
        },
        unload: function (t, o) {
          hs(t, o, {dur: 0.02, vol: 0.075, bp: [2500, null, 2]});
          thump(t, o, 200, 0.08, 0.1, 0.05);
          ping(t + 0.04, o, SCALE[5], 0.065, 0.085);
          ping(t + 0.09, o, SCALE[3], 0.075, 0.085);
        },
        victory: function (t, o) {
          [0, 2, 4, 6].forEach(function (degree, i) {
            ping(t + i * 0.115, o, SCALE[degree] + 12, 0.13, 0.105, 0.18);
          });
          stack(t + 0.48, o, SCALE[7] + 12, 1.25, 0.085, 0.28);
          tn(t + 0.48, o, {f: 92, to: 46, dur: 0.35, vol: 0.22, wet: 0.15});
          hs(t + 0.48, o, {dur: 0.22, vol: 0.09, lp: [2400, 280]});
        },
        defeat: function (t, o) {
          [6, 4, 2, 0].forEach(function (degree, i) {
            tn(t + i * 0.23, o, {f: hz(SCALE[degree]), dur: 0.28, wave: "hollow", vol: 0.11, lp: [2100], wet: 0.18});
            tn(t + i * 0.23, o, {f: hz(SCALE[degree]) * 0.5, dur: 0.32, wave: "sawtooth", vol: 0.06, lp: [400]});
          });
          commsSweep(t + 0.9, o, false);
          thump(t + 0.9, o, 78, 0.55, 0.12, 0.2);
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
        weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
    },
  });
})();
