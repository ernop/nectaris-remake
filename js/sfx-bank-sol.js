/* Soundscape "Selenographic Telemetry" — GPT-5.6 Sol.
 *
 * The player hears a lunar command system rather than an atmospheric
 * battlefield: dry relay pips, propulsion telemetry, encoded weapon releases
 * and structure-borne impacts. Every sound is synthesized at run time.
 */
"use strict";

(function () {
  var register = typeof module !== "undefined" ? require("./sfx.js").registerBank : SFX.registerBank;

  register({
    id: "gpt-5-6-sol",
    creator: "GPT-5.6 Sol",
    title: "Selenographic Telemetry",
    description: "Dry low-bit command signals, sparse machine telemetry and compact structure-borne impacts.",
    seed: 56062917,
    scale: [45, 48, 50, 52, 55, 57, 60, 62, 64],
    room: {seconds: 0.36, wetGain: 0.16},
    masterGain: 0.72,
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

      function statusSweep(t, o, rising) {
        var from = rising ? 185 : 740, to = rising ? 740 : 185;
        tn(t, o, {f: from, to: to, dur: 0.42, wave: "hollow", vol: 0.11,
          a: 0.012, hold: 0.48, bp: [760, 1900, 3.5], wet: 0.08});
        for (var i = 0; i < 4; i++) {
          relay(t + 0.055 + i * 0.08, o, rising ? SCALE[2 + i] : SCALE[5 - i],
            0.035, 0.045, "square");
        }
      }

      var MOVE_SOUND = {
        foot: function (t, o, n, step) {
          for (var i = 0; i < n; i++) {
            var pan = pathPan(o, (i + 0.5) / n), at = t + (i + 0.62) * step;
            tn(at, o, {f: i % 2 ? 92 : 108, to: 58, dur: 0.055, wave: "triangle",
              vol: 0.055, pan: pan, lp: [620]});
            hs(at + 0.012, o, {dur: 0.018, vol: 0.026, bp: [2600, null, 2], pan: pan});
          }
        },
        wheels: function (t, o, n, step, dur) {
          tn(t, o, {f: 76, to: 138, glide: 0.28, dur: dur, wave: "hollow",
            vol: 0.065, a: 0.035, hold: 0.72, lp: [430, 980], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.5) * step, pan = pathPan(o, (i + 0.5) / n);
            relay(at, {pan: pan}, SCALE[1] + (i % 2) * 2, 0.025, 0.025, "square");
          }
        },
        treads: function (t, o, n, step, dur) {
          tn(t, o, {f: 44, to: 58, dur: dur, wave: "square", vol: 0.09,
            a: 0.05, hold: 0.8, lp: [125, 210], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.42) * step, pan = pathPan(o, (i + 0.5) / n);
            tn(at, o, {f: 135, to: 48, dur: 0.052, wave: "hollow", vol: 0.06, pan: pan, lp: [700]});
            if (i % 2 === 0) hs(at, o, {dur: 0.014, vol: 0.025, hp: [2100], pan: pan});
          }
        },
        air: function (t, o, n, step, dur) {
          tn(t, o, {f: 155, to: 290, dur: dur, wave: "hollow", vol: 0.055,
            a: dur * 0.22, hold: 0.52, vib: [11, 13], lp: [720, 1900], panTo: o.panTo});
          tn(t, o, {f: 310, to: 570, dur: dur, wave: "sine", vol: 0.022,
            a: dur * 0.3, hold: 0.45, panTo: o.panTo});
        },
      };

      var WEAPONS = {
        rifle: {gap: 0.055, shots: function (n) { return Math.min(4, 2 + Math.floor(n / 3)); }, shot: function (t, o, i) {
          hs(t, o, {dur: 0.022, vol: 0.062, hp: [2600 + i * 180]});
          tn(t, o, {f: 1180, to: 410, dur: 0.028, wave: "square", vol: 0.032});
        }},
        autocannon: {gap: 0.042, shots: function (n) { return Math.min(5, 2 + Math.ceil(n / 2)); }, shot: function (t, o, i) {
          tn(t, o, {f: 390 + i * 18, to: 145, dur: 0.04, wave: "hollow", vol: 0.052, lp: [1350]});
          hs(t, o, {dur: 0.018, vol: 0.048, bp: [1600, 2600, 1.2]});
        }},
        cannon: {gap: 0.18, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          hs(t, o, {dur: 0.075, vol: 0.105, lp: [1800, 260]});
          tn(t, o, {f: 118, to: 36, dur: 0.22, wave: "triangle", vol: 0.19, wet: 0.06});
          relay(t + 0.018, o, SCALE[2], 0.045, 0.038, "square");
        }},
        heavyCannon: {gap: 0.22, shots: function (n) { return n > 6 ? 2 : 1; }, shot: function (t, o) {
          hs(t, o, {dur: 0.12, vol: 0.14, lp: [1300, 150]});
          tn(t, o, {f: 78, to: 24, dur: 0.36, wave: "triangle", vol: 0.27, wet: 0.09});
          tn(t + 0.025, o, {f: 166, to: 62, dur: 0.11, wave: "square", vol: 0.055, lp: [560]});
        }},
        howitzer: {gap: 0.24, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          tn(t, o, {f: 104, to: 41, dur: 0.18, wave: "triangle", vol: 0.18});
          coded(t + 0.04, o, [SCALE[1] + 12, SCALE[4] + 12], 0.055, 0.035, 0.03);
          hs(t + 0.1, o, {dur: 0.11, vol: 0.07, lp: [720, 180]});
        }},
        rockets: {gap: 0.075, shots: function (n) { return Math.min(4, 2 + Math.floor(n / 3)); }, shot: function (t, o, i) {
          relay(t, o, SCALE[2 + i % 4] + 12, 0.038, 0.04, "square");
          hs(t + 0.012, o, {dur: 0.2, vol: 0.075, a: 0.01, hold: 0.35, bp: [900 + i * 180, 3100, 1]});
          tn(t, o, {f: 230 + i * 22, to: 820 + i * 65, dur: 0.18, wave: "sawtooth", vol: 0.028, lp: [950, 2300]});
        }},
        missile: {gap: 0.21, shots: function (n) { return n > 6 ? 2 : 1; }, shot: function (t, o) {
          coded(t, o, [SCALE[0] + 24, SCALE[3] + 24, SCALE[6] + 24], 0.035, 0.026, 0.04);
          hs(t + 0.04, o, {dur: 0.3, vol: 0.082, a: 0.025, hold: 0.42, hp: [620, 2800]});
          tn(t + 0.04, o, {f: 285, to: 1320, dur: 0.28, wave: "hollow", vol: 0.04, lp: [1400, 3300]});
        }},
        mortar: {gap: 0.17, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          tn(t, o, {f: 178, to: 61, dur: 0.105, wave: "triangle", vol: 0.15});
          relay(t + 0.06, o, SCALE[5] + 12, 0.045, 0.035, "hollow");
        }},
        flak: {gap: 0.085, shots: function (n) { return Math.min(4, 2 + Math.floor(n / 3)); }, shot: function (t, o, i) {
          tn(t, o, {f: 310 + i * 24, to: 112, dur: 0.06, wave: "square", vol: 0.072, lp: [1700]});
          hs(t, o, {dur: 0.035, vol: 0.052, bp: [1050, null, 1.4]});
        }},
        pistol: {gap: 0.09, shots: function (n) { return n > 5 ? 2 : 1; }, shot: function (t, o) {
          relay(t, o, SCALE[5] + 12, 0.035, 0.05, "square");
          hs(t, o, {dur: 0.016, vol: 0.035, hp: [2800]});
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
        },
        switchOff: function (t, o) {
          coded(t, o, [SCALE[6] + 12, SCALE[3] + 12, SCALE[0] + 12], 0.045, 0.055, 0.065);
        },
        select: function (t, o) {
          var shift = pick(SELECT_PITCH, o.moveType, "movement type");
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
          relay(t + 0.38, o, SCALE[0], 0.16, 0.08, "hollow");
        },
        turnStart: function (t, o) {
          statusSweep(t, o, true);
          coded(t + 0.38, o, [SCALE[4] + 12, SCALE[7] + 12], 0.085, 0.13, 0.07);
        },
        move: function (t, o) {
          pick(MOVE_SOUND, o.moveType, "movement type")(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) {
          tn(t, o, {f: 132, to: 62, dur: 0.075, wave: "triangle", vol: 0.1});
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
          tn(t + 0.22, o, {f: 108, to: 31, dur: 0.3, wave: "triangle", vol: 0.19, wet: 0.07});
        },
        unsurrounded: function (t, o) {
          coded(t, o, [SCALE[2] + 12, SCALE[2] + 12], 0.05, 0.04, 0.05);
        },
        approach: function (t, o) {
          [-0.45, 0.45].forEach(function (pan, i) {
            tn(t, o, {f: i ? 86 : 72, to: i ? 142 : 126, dur: o.dur, wave: "hollow",
              vol: 0.038, a: o.dur * 0.68, hold: 0.18, lp: [340, 760], pan: pan});
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
          var size = clamp(o.size, 0.15, 1), tail = 0.16 + size * 0.34 + (o.destroyed ? 0.24 : 0);
          hs(t, o, {dur: tail, vol: 0.09 + size * 0.14, a: 0.002, lp: [2600, 120], wet: 0.06 + size * 0.08});
          tn(t, o, {f: 94, to: 27, dur: 0.14 + size * 0.3, wave: "triangle", vol: 0.11 + size * 0.18});
          var fragments = 1 + Math.round(size * 4) + (o.destroyed ? 2 : 0);
          for (var i = 0; i < fragments; i++) {
            relay(t + 0.055 + rand() * tail * 0.72, o, SCALE[1 + Math.floor(rand() * 6)] + 24,
              0.018 + rand() * 0.018, 0.018 + rand() * 0.022, "square");
          }
        },
        deflect: function (t, o) {
          coded(t, o, [SCALE[7] + 24, SCALE[4] + 24, SCALE[6] + 24], 0.012, 0.12, 0.045);
          hs(t, o, {dur: 0.012, vol: 0.04, hp: [3900]});
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
          relay(t + notes.length * 0.075, o, SCALE[0] + 24, 0.36, 0.055, "hollow");
        },
        repair: function (t, o) {
          for (var i = 0; i < 6; i++) relay(t + i * 0.045, o, SCALE[i] + 12, 0.09, 0.045, "hollow");
          relay(t + 0.28, o, SCALE[7] + 12, 0.24, 0.05, "hollow");
        },
        deploy: function (t, o) {
          coded(t, o, [SCALE[0], SCALE[0] + 12, SCALE[4] + 12], 0.065, 0.07, 0.07);
          hs(t + 0.12, o, {dur: 0.16, vol: 0.055, hp: [2400, 850]});
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
          coded(t, o, [SCALE[0] + 12, SCALE[4] + 12, SCALE[7] + 12,
            SCALE[2] + 24, SCALE[6] + 24], 0.11, 0.16, 0.085);
          [SCALE[0], SCALE[4], SCALE[7]].forEach(function (degree) {
            tn(t + 0.55, o, {f: hz(degree + 12), dur: 0.85, wave: "hollow",
              vol: 0.052, a: 0.006, hold: 0.55, wet: 0.1});
          });
        },
        defeat: function (t, o) {
          coded(t, o, [SCALE[7] + 12, SCALE[4] + 12, SCALE[2] + 12, SCALE[0] + 12],
            0.16, 0.18, 0.07);
          tn(t + 0.58, o, {f: 122, to: 30, dur: 0.72, wave: "hollow",
            vol: 0.11, a: 0.02, hold: 0.45, lp: [520, 130], wet: 0.08});
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS,
        weaponByType: WEAPON_BY_TYPE, weaponByClass: WEAPON_BY_CLASS,
        selectPitch: SELECT_PITCH};
    },
  });
})();
