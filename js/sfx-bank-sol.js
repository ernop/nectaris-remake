/* Soundscape "Selenographic Telemetry" — GPT-5.6 Sol.
 *
 * The player hears a lunar command system rather than an atmospheric
 * battlefield: relay pips, layered propulsion telemetry, encoded weapon
 * releases and structure-borne impacts. Rich wavetable-like stacks keep the
 * command language while giving machinery and combat physical weight.
 */
"use strict";

(function () {
  var register = typeof module !== "undefined" ? require("./sfx.js").registerBank : SFX.registerBank;

  register({
    id: "gpt-5-6-sol",
    creator: "GPT-5.6 Sol",
    title: "Selenographic Telemetry",
    description: "Tactile command signals, layered machine telemetry and weighty structure-borne combat.",
    seed: 56062917,
    scale: [45, 48, 50, 52, 55, 57, 60, 62, 64],
    room: {seconds: 0.68, wetGain: 0.28},
    masterGain: 0.78,
    build: function (d) {
      var tn = d.tn, hs = d.hs, hz = d.hz, SCALE = d.SCALE, pick = d.pick;
      var clamp = d.clamp, pathPan = d.pathPan, rand = d.rand;

      function relay(t, o, midi, dur, vol, wave) {
        tn(t, o, {f: hz(midi), dur: dur, wave: wave || "hollow", vol: vol, a: 0.002, lp: [5200]});
        tn(t + 0.006, o, {f: hz(midi + 24), dur: Math.min(0.025, dur * 0.45),
          wave: "square", vol: vol * 0.16, a: 0.001, hp: [1800]});
      }

      function coded(t, o, notes, gap, dur, vol) {
        notes.forEach(function (midi, i) {
          relay(t + i * gap, o, midi, dur, vol, i % 2 ? "hollow" : "square");
        });
      }

      // A programmable-wavetable-style stack: sub weight, asymmetric body,
      // upper mechanical harmonics and a short broadband contact.
      function machineBody(t, o, spec) {
        tn(t, o, {f: spec.f * 0.5, to: spec.to * 0.5, dur: spec.dur,
          wave: "sine", vol: spec.vol * 0.62, a: spec.a || 0.008,
          hold: spec.hold, lp: [spec.lp * 0.45, spec.lp * 0.7], panTo: spec.panTo, wet: spec.wet || 0});
        tn(t, o, {f: spec.f, to: spec.to, dur: spec.dur,
          wave: "buzz", vol: spec.vol, a: spec.a || 0.006,
          hold: spec.hold, lp: [spec.lp, spec.lp * 1.35], panTo: spec.panTo, wet: spec.wet || 0});
        tn(t, o, {f: spec.f * 1.51, to: spec.to * 1.49, dur: spec.dur,
          wave: "hollow", vol: spec.vol * 0.34, a: (spec.a || 0.006) * 1.3,
          hold: spec.hold, bp: [spec.lp * 1.15, spec.lp * 1.7, 1.4],
          panTo: spec.panTo, wet: (spec.wet || 0) * 1.2});
      }

      function metal(t, o, fundamental, dur, vol, wet) {
        [1, 1.42, 2.17, 3.08].forEach(function (ratio, i) {
          tn(t + i * 0.003, o, {f: fundamental * ratio, to: fundamental * ratio * (0.94 - i * 0.01),
            dur: dur * (1 - i * 0.12), wave: i % 2 ? "sine" : "hollow",
            vol: vol / (1 + i * 0.7), a: 0.0015 + i * 0.001, hp: i > 1 ? [700] : null,
            wet: wet});
        });
      }

      function impact(t, o, power, fundamental, dur) {
        hs(t, o, {dur: 0.018 + power * 0.025, vol: 0.055 + power * 0.085,
          hp: [1800 + power * 900], wet: 0.04});
        hs(t + 0.008, o, {dur: dur, vol: 0.075 + power * 0.15, a: 0.002,
          lp: [2600, 105, 0.8], wet: 0.08 + power * 0.12});
        machineBody(t, o, {f: fundamental, to: Math.max(24, fundamental * 0.28),
          dur: dur * 0.82, vol: 0.11 + power * 0.18, lp: 620, a: 0.002, hold: 0.12,
          wet: 0.06 + power * 0.08});
        metal(t + 0.012, o, fundamental * 5.4, dur * 0.58, 0.026 + power * 0.04, 0.14);
      }

      function statusSweep(t, o, rising) {
        var from = rising ? 128 : 690, to = rising ? 690 : 128;
        machineBody(t, o, {f: from, to: to, dur: 0.52, vol: 0.1, lp: 1500,
          a: 0.014, hold: 0.52, wet: 0.12});
        hs(t + 0.03, o, {dur: 0.42, vol: 0.045, a: 0.04, hold: 0.35,
          bp: [rising ? 520 : 2600, rising ? 2600 : 520, 1.1], wet: 0.08});
        for (var i = 0; i < 4; i++) {
          relay(t + 0.055 + i * 0.08, o, rising ? SCALE[2 + i] : SCALE[5 - i],
            0.035, 0.045, "square");
        }
      }

      var MOVE_SOUND = {
        foot: function (t, o, n, step) {
          for (var i = 0; i < n; i++) {
            var pan = pathPan(o, (i + 0.5) / n), at = t + (i + 0.62) * step;
            impact(at, {pan: pan}, 0.18, i % 2 ? 102 : 116, 0.085);
            metal(at + 0.018, {pan: pan}, 540 + (i % 2) * 90, 0.07, 0.018, 0.04);
          }
        },
        wheels: function (t, o, n, step, dur) {
          machineBody(t, o, {f: 74, to: 146, dur: dur, vol: 0.072, lp: 720,
            a: 0.035, hold: 0.72, panTo: o.panTo, wet: 0.025});
          hs(t, o, {dur: dur, vol: 0.04, a: 0.05, hold: 0.7,
            bp: [420, 1300, 0.75], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.5) * step, pan = pathPan(o, (i + 0.5) / n);
            impact(at, {pan: pan}, 0.12, 132, 0.055);
            relay(at + 0.016, {pan: pan}, SCALE[1] + (i % 2) * 2, 0.025, 0.02, "square");
          }
        },
        treads: function (t, o, n, step, dur) {
          machineBody(t, o, {f: 48, to: 64, dur: dur, vol: 0.11, lp: 390,
            a: 0.05, hold: 0.8, panTo: o.panTo, wet: 0.02});
          hs(t, o, {dur: dur, vol: 0.052, a: 0.06, hold: 0.78,
            bp: [170, 520, 0.8], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.42) * step, pan = pathPan(o, (i + 0.5) / n);
            impact(at, {pan: pan}, 0.32, 118, 0.09);
            metal(at + 0.012, {pan: pan}, 420 + (i % 3) * 55, 0.075, 0.025, 0.035);
          }
        },
        air: function (t, o, n, step, dur) {
          machineBody(t, o, {f: 142, to: 318, dur: dur, vol: 0.062, lp: 1700,
            a: dur * 0.2, hold: 0.5, panTo: o.panTo, wet: 0.05});
          tn(t, o, {f: 410, to: 860, dur: dur, wave: "sine", vol: 0.028,
            a: dur * 0.28, hold: 0.44, vib: [13, 22], panTo: o.panTo, wet: 0.08});
          hs(t, o, {dur: dur, vol: 0.055, a: dur * 0.24, hold: 0.48,
            bp: [700, 3800, 0.8], panTo: o.panTo, wet: 0.04});
        },
      };

      var WEAPONS = {
        rifle: {gap: 0.055, shots: function (n) { return Math.min(4, 2 + Math.floor(n / 3)); }, shot: function (t, o, i) {
          hs(t, o, {dur: 0.035, vol: 0.085, hp: [2200 + i * 170], wet: 0.035});
          machineBody(t, o, {f: 520 + i * 18, to: 165, dur: 0.07, vol: 0.05,
            lp: 1900, a: 0.0015, wet: 0.025});
          tn(t, o, {f: 174, to: 72, dur: 0.06, wave: "triangle", vol: 0.055, lp: [520]});
        }},
        autocannon: {gap: 0.042, shots: function (n) { return Math.min(5, 2 + Math.ceil(n / 2)); }, shot: function (t, o, i) {
          impact(t, o, 0.2, 176 + i * 5, 0.075);
          hs(t, o, {dur: 0.026, vol: 0.065, bp: [1450, 3100, 1.1]});
          metal(t + 0.008, o, 620 + i * 24, 0.07, 0.02, 0.035);
        }},
        cannon: {gap: 0.18, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          impact(t, o, 0.64, 112, 0.34);
          hs(t + 0.018, o, {dur: 0.16, vol: 0.12, bp: [340, 1450, 0.8], wet: 0.11});
          metal(t + 0.026, o, 380, 0.28, 0.045, 0.16);
        }},
        heavyCannon: {gap: 0.22, shots: function (n) { return n > 6 ? 2 : 1; }, shot: function (t, o) {
          impact(t, o, 1, 78, 0.52);
          hs(t + 0.012, o, {dur: 0.34, vol: 0.17, lp: [1250, 92], wet: 0.24});
          metal(t + 0.035, o, 286, 0.46, 0.065, 0.24);
          tn(t + 0.01, o, {f: 52, to: 23, dur: 0.58, wave: "sine", vol: 0.21, wet: 0.12});
        }},
        howitzer: {gap: 0.24, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          impact(t, o, 0.72, 96, 0.36);
          metal(t + 0.025, o, 340, 0.32, 0.048, 0.19);
          tn(t + 0.045, o, {f: 920, to: 1680, dur: 0.3, wave: "hollow",
            vol: 0.032, bp: [800, 2500, 1.8], wet: 0.12});
        }},
        rockets: {gap: 0.075, shots: function (n) { return Math.min(4, 2 + Math.floor(n / 3)); }, shot: function (t, o, i) {
          relay(t, o, SCALE[2 + i % 4] + 12, 0.038, 0.04, "square");
          hs(t + 0.01, o, {dur: 0.28, vol: 0.105, a: 0.008, hold: 0.4,
            bp: [650 + i * 150, 3900, 0.8], wet: 0.08});
          machineBody(t + 0.008, o, {f: 198 + i * 18, to: 980 + i * 72,
            dur: 0.25, vol: 0.045, lp: 2400, a: 0.006, hold: 0.3, wet: 0.07});
          impact(t, o, 0.18, 138, 0.09);
        }},
        missile: {gap: 0.21, shots: function (n) { return n > 6 ? 2 : 1; }, shot: function (t, o) {
          coded(t, o, [SCALE[0] + 24, SCALE[3] + 24, SCALE[6] + 24], 0.035, 0.026, 0.04);
          hs(t + 0.035, o, {dur: 0.42, vol: 0.12, a: 0.02, hold: 0.48,
            hp: [420, 3400], wet: 0.1});
          machineBody(t + 0.035, o, {f: 248, to: 1480, dur: 0.38,
            vol: 0.05, lp: 3000, a: 0.012, hold: 0.36, wet: 0.09});
          impact(t, o, 0.3, 118, 0.13);
        }},
        mortar: {gap: 0.17, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          impact(t, o, 0.42, 148, 0.18);
          metal(t + 0.018, o, 510, 0.16, 0.028, 0.1);
          tn(t + 0.06, o, {f: 760, to: 1380, dur: 0.2, wave: "sine",
            vol: 0.025, bp: [700, 2200, 1.8], wet: 0.08});
        }},
        flak: {gap: 0.085, shots: function (n) { return Math.min(4, 2 + Math.floor(n / 3)); }, shot: function (t, o, i) {
          impact(t, o, 0.3, 154 + i * 7, 0.11);
          hs(t, o, {dur: 0.055, vol: 0.075, bp: [980, 2600, 1.2], wet: 0.05});
          metal(t + 0.01, o, 720 + i * 30, 0.09, 0.024, 0.06);
        }},
        pistol: {gap: 0.09, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          impact(t, o, 0.14, 196, 0.08);
          relay(t + 0.004, o, SCALE[5] + 12, 0.035, 0.04, "square");
        }},
      };

      var WEAPON_BY_TYPE = {GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
        FALCON: "missile", LYNX: "mortar"};
      var WEAPON_BY_CLASS = {infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
        buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol"};
      var SELECT_PITCH = {foot: 0, wheels: 2, treads: -5, air: 7};

      var CUES = {
        switchOn: function (t, o) {
          coded(t, o, [SCALE[0] + 12, SCALE[3] + 12, SCALE[6] + 12], 0.055, 0.07, 0.085);
          machineBody(t, o, {f: 86, to: 132, dur: 0.22, vol: 0.045,
            lp: 540, a: 0.025, hold: 0.42, wet: 0.04});
        },
        switchOff: function (t, o) {
          coded(t, o, [SCALE[6] + 12, SCALE[3] + 12, SCALE[0] + 12], 0.045, 0.055, 0.065);
        },
        select: function (t, o) {
          var shift = pick(SELECT_PITCH, o.moveType, "movement type");
          impact(t, o, 0.06, 168 + shift * 2, 0.045);
          relay(t, o, SCALE[5] + 12 + shift, 0.035, 0.06, "square");
          relay(t + 0.038, o, SCALE[7] + 12 + shift, 0.052, 0.055, "hollow");
        },
        cancel: function (t, o) {
          tn(t, o, {f: hz(SCALE[6] + 12), to: hz(SCALE[2] + 12), dur: 0.075, wave: "hollow", vol: 0.07});
        },
        deny: function (t, o) {
          relay(t, o, SCALE[1], 0.065, 0.085, "square");
          relay(t + 0.09, o, SCALE[1], 0.065, 0.085, "square");
        },
        undo: function (t, o) {
          coded(t, o, [SCALE[6] + 12, SCALE[3] + 12], 0.05, 0.055, 0.065);
        },
        redo: function (t, o) {
          coded(t, o, [SCALE[3] + 12, SCALE[6] + 12], 0.05, 0.055, 0.065);
        },
        target: function (t, o) {
          coded(t, o, [SCALE[0] + 24, SCALE[4] + 24, SCALE[7] + 24], 0.025, 0.026, 0.042);
        },
        factory: function (t, o) {
          coded(t, o, [SCALE[0] + 12, SCALE[4] + 12, SCALE[0] + 24], 0.06, 0.055, 0.07);
        },
        turnEnd: function (t, o) {
          statusSweep(t, o, false);
          impact(t + 0.4, o, 0.34, 92, 0.2);
          relay(t + 0.43, o, SCALE[0], 0.18, 0.08, "hollow");
        },
        turnStart: function (t, o) {
          statusSweep(t, o, true);
          impact(t + 0.36, o, 0.25, 108, 0.15);
          coded(t + 0.4, o, [SCALE[4] + 12, SCALE[7] + 12], 0.085, 0.15, 0.075);
        },
        move: function (t, o) {
          pick(MOVE_SOUND, o.moveType, "movement type")(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) {
          impact(t, o, 0.22, 132, 0.1);
          relay(t + 0.04, o, SCALE[1] + 12, 0.035, 0.04, "square");
        },
        calcMachine: function (t, o) {
          var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
          relay(t, o, degree + (o.attacking ? 24 : 12), 0.024, 0.04, o.attacking ? "square" : "hollow");
        },
        calcSupport: function (t, o) {
          var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
          if (o.side === "attack") coded(t, o, [degree + 19, degree + 24], 0.038, 0.045, 0.075);
          else if (o.side === "defense") {
            tn(t, o, {f: hz(degree + 12), to: hz(degree + 7), dur: 0.105, wave: "hollow", vol: 0.09});
          } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
        },
        calcTerrain: function (t, o) {
          var value = clamp(o.value, 0, 60);
          if (!value) { relay(t, o, SCALE[6] + 12, 0.025, 0.035, "square"); return; }
          tn(t, o, {f: 162 - value, to: 72 - value / 2, dur: 0.13,
            wave: "triangle", vol: 0.085 + value / 650, lp: [820, 240]});
          for (var i = 0; i < Math.ceil(value / 20); i++) {
            relay(t + 0.025 + i * 0.032, o, SCALE[1] + i * 2, 0.025, 0.025, "square");
          }
        },
        calcRing: function (t, o) {
          if (o.controlled) relay(t, o, SCALE[o.index % 6] + 12, 0.042, 0.065, "square");
          else coded(t, o, [SCALE[1] + 12, SCALE[0] + 12], 0.026, 0.032, 0.045);
        },
        surround: function (t, o) {
          for (var i = 0; i < 6; i++) relay(t + i * 0.045, o, SCALE[7 - i] + 12, 0.035, 0.055, "square");
          impact(t + 0.22, o, 0.65, 108, 0.36);
          machineBody(t + 0.22, o, {f: 216, to: 42, dur: 0.34, vol: 0.08,
            lp: 960, a: 0.003, hold: 0.12, wet: 0.13});
        },
        unsurrounded: function (t, o) {
          coded(t, o, [SCALE[2] + 12, SCALE[2] + 12], 0.05, 0.04, 0.05);
        },
        approach: function (t, o) {
          [-0.45, 0.45].forEach(function (pan, i) {
            machineBody(t, {pan: pan}, {f: i ? 86 : 72, to: i ? 154 : 138,
              dur: o.dur, vol: 0.052, lp: 780, a: o.dur * 0.6, hold: 0.22, wet: 0.04});
            hs(t, {pan: pan}, {dur: o.dur, vol: 0.038, a: o.dur * 0.66, hold: 0.2,
              bp: [240, 1180, 0.8], wet: 0.035});
            relay(t + o.dur * 0.72, {pan: pan}, SCALE[i ? 4 : 2], 0.05, 0.035, "square");
          });
        },
        fire: function (t, o) {
          var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
          var weapon = pick(WEAPONS, own ? WEAPON_BY_TYPE[o.typeId] :
            pick(WEAPON_BY_CLASS, o.cls, "unit class"), "weapon");
          var shots = weapon.shots(o.strength), gap = Math.min(weapon.gap, o.span / shots);
          for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * 0.007, o, i);
        },
        explosion: function (t, o) {
          var size = clamp(o.size, 0.15, 1), tail = 0.28 + size * 0.52 + (o.destroyed ? 0.36 : 0);
          impact(t, o, size, 102 - size * 28, tail);
          hs(t + 0.025, o, {dur: tail, vol: 0.1 + size * 0.17, a: 0.002,
            lp: [3200, 88, 0.75], wet: 0.1 + size * 0.16});
          tn(t, o, {f: 66 - size * 14, to: 22, dur: tail * 0.82,
            wave: "sine", vol: 0.13 + size * 0.2, wet: 0.08 + size * 0.08});
          var fragments = 2 + Math.round(size * 6) + (o.destroyed ? 3 : 0);
          for (var i = 0; i < fragments; i++) {
            var at = t + 0.07 + rand() * tail * 0.76;
            metal(at, o, 460 + rand() * 1700, 0.045 + rand() * 0.14,
              0.012 + rand() * 0.026, 0.09 + size * 0.08);
          }
          if (o.destroyed) machineBody(t + 0.08, o, {f: 58, to: 21, dur: tail,
            vol: 0.16, lp: 310, a: 0.005, hold: 0.2, wet: 0.18});
        },
        deflect: function (t, o) {
          impact(t, o, 0.16, 192, 0.11);
          metal(t + 0.004, o, 980, 0.34, 0.062, 0.2);
          hs(t, o, {dur: 0.018, vol: 0.055, hp: [3600]});
        },
        star: function (t, o) {
          var degree = SCALE[clamp(o.rank, 0, SCALE.length - 1)];
          coded(t, o, [degree + 12, degree + 24, degree + 31], 0.065, 0.28, 0.055);
        },
        capture: function (t, o) {
          var notes = o.kind === "base" ?
            [SCALE[0] + 12, SCALE[2] + 12, SCALE[4] + 12, SCALE[7] + 12] :
            [SCALE[2] + 12, SCALE[4] + 12, SCALE[6] + 12];
          coded(t, o, notes, 0.075, 0.085, 0.075);
          impact(t + 0.02, o, o.kind === "base" ? 0.45 : 0.3, 116, 0.2);
          relay(t + notes.length * 0.075, o, SCALE[0] + 24, 0.36, 0.055, "hollow");
        },
        repair: function (t, o) {
          for (var i = 0; i < 6; i++) relay(t + i * 0.045, o, SCALE[i] + 12, 0.09, 0.045, "hollow");
          relay(t + 0.28, o, SCALE[7] + 12, 0.24, 0.05, "hollow");
        },
        deploy: function (t, o) {
          machineBody(t, o, {f: 62, to: 128, dur: 0.28, vol: 0.075,
            lp: 720, a: 0.025, hold: 0.38, wet: 0.045});
          coded(t, o, [SCALE[0], SCALE[0] + 12, SCALE[4] + 12], 0.065, 0.07, 0.07);
          hs(t + 0.12, o, {dur: 0.2, vol: 0.072, hp: [2400, 850], wet: 0.06});
          impact(t + 0.22, o, 0.28, 124, 0.13);
        },
        load: function (t, o) {
          coded(t, o, [SCALE[5] + 12, SCALE[2] + 12], 0.055, 0.065, 0.06);
          tn(t + 0.09, o, {f: 138, to: 69, dur: 0.07, wave: "triangle", vol: 0.07});
        },
        unload: function (t, o) {
          coded(t, o, [SCALE[2] + 12, SCALE[5] + 12], 0.055, 0.065, 0.06);
          tn(t + 0.09, o, {f: 69, to: 138, dur: 0.07, wave: "triangle", vol: 0.07});
        },
        victory: function (t, o) {
          impact(t, o, 0.5, 104, 0.3);
          coded(t, o, [SCALE[0] + 12, SCALE[4] + 12, SCALE[7] + 12,
            SCALE[2] + 24, SCALE[6] + 24], 0.11, 0.16, 0.085);
          [SCALE[0], SCALE[4], SCALE[7]].forEach(function (degree) {
            tn(t + 0.55, o, {f: hz(degree + 12), dur: 1.15, wave: "hollow",
              vol: 0.064, a: 0.006, hold: 0.55, wet: 0.2});
            tn(t + 0.57, o, {f: hz(degree + 24), dur: 0.78, wave: "sine",
              vol: 0.026, a: 0.008, hold: 0.42, wet: 0.24});
          });
        },
        defeat: function (t, o) {
          impact(t, o, 0.48, 92, 0.28);
          coded(t, o, [SCALE[7] + 12, SCALE[4] + 12, SCALE[2] + 12, SCALE[0] + 12],
            0.16, 0.18, 0.07);
          machineBody(t + 0.58, o, {f: 122, to: 29, dur: 0.9, vol: 0.11,
            lp: 620, a: 0.02, hold: 0.45, wet: 0.16});
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS,
        weaponByType: WEAPON_BY_TYPE, weaponByClass: WEAPON_BY_CLASS,
        selectPitch: SELECT_PITCH};
    },
  });
})();
