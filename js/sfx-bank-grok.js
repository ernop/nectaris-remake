/* Soundscape "Field calls" — Grok 4.7.
 *
 * Drums count and bugles announce. The pitch shapes stay short and readable
 * (the beeps). The weight comes from the PC Engine's HuC6280, which was not a
 * fixed-waveform beep chip: six channels, each a 32-step 5-bit wavetable,
 * independent left and right volume, noise on two channels, and an LFO from
 * one channel into another. A bugle note here is one such wavetable, doubled
 * a few cents apart and leaned left and right, with an octave under it and a
 * noise chiff on the attack. Nothing is sampled, and nothing copies a game's
 * waveform.
 *
 * Tick spacing in the combat board is 30 ms for machines, 170 ms for a
 * supporter, 260 ms for terrain and 90 ms for a ring hex. The pitched beep of
 * a count stays under 30 ms; the low body may tail a little past that.
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
    description: "Bugle calls on a 32-step waveform, doubled and detuned, with a drum body under each counting tap.",
    seed: 47474747,
    // Chromatic from E4, so each machine that lights is one semitone higher.
    scale: [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
    room: {seconds: 1.15, wetGain: 0.4},
    masterGain: 0.82,
    build: function (d) {
      var tn = d.tn, hs = d.hs, hz = d.hz, SCALE = d.SCALE, pick = d.pick;
      var clamp = d.clamp, pathPan = d.pathPan, rand = d.rand;

      // 32 samples, each forced to a 5-bit step, then turned into harmonics.
      // The stair-steps are the grit a HuC6280 waveform has over a pure sine.
      var horn = null;
      function hornWave() {
        if (horn) return horn;
        var audio = d.audio();
        if (!audio.ctx) throw new Error("Field calls played before the audio context exists.");
        var n = 32, time = new Float32Array(n);
        for (var i = 0; i < n; i++) {
          var p = i / n * Math.PI * 2;
          var s = Math.sin(p) * 0.55 + Math.sin(p * 2) * 0.32 + Math.sin(p * 3) * 0.22 + Math.sin(p * 4) * 0.1;
          time[i] = Math.round((s * 0.5 + 0.5) * 31) / 31 * 2 - 1;
        }
        var real = new Float32Array(17), imag = new Float32Array(17);
        for (var k = 1; k <= 16; k++) {
          var re = 0, im = 0;
          for (var s = 0; s < n; s++) {
            var ang = 2 * Math.PI * k * s / n;
            re += time[s] * Math.cos(ang);
            im -= time[s] * Math.sin(ang);
          }
          real[k] = re / n;
          imag[k] = im / n;
        }
        horn = audio.ctx.createPeriodicWave(real, imag);
        return horn;
      }

      function rig() {
        var audio = d.audio();
        if (!audio.ctx || !audio.master || !audio.room) throw new Error("Field calls has no audio context yet.");
        return audio;
      }

      function env(param, t, dur, vol, attack) {
        var a = Math.min(attack, dur * 0.4);
        param.setValueAtTime(0.0001, t);
        param.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + a);
        param.exponentialRampToValueAtTime(0.0001, t + dur);
      }

      function spill(node, o, t, dur, wet) {
        var audio = rig(), end = node;
        if (o.pan !== undefined) {
          var panner = audio.ctx.createStereoPanner();
          panner.pan.setValueAtTime(o.pan, t);
          if (o.panTo !== undefined) panner.pan.linearRampToValueAtTime(o.panTo, t + dur);
          node.connect(panner);
          end = panner;
        }
        end.connect(audio.master);
        if (wet) {
          var send = audio.ctx.createGain();
          send.gain.value = wet;
          end.connect(send);
          send.connect(audio.room);
        }
      }

      // One wavetable channel. `to` glides the pitch. The low-pass opens over
      // the note, which is the brightness a second channel's LFO was used for.
      function hornAt(t, o, freq, dur, vol, detune, to) {
        var audio = rig();
        var osc = audio.ctx.createOscillator(), gain = audio.ctx.createGain(), lp = audio.ctx.createBiquadFilter();
        var shut = Math.max(220, Math.min(freq * 2.1, 2400));
        var open = Math.max(shut, Math.min(freq * 6.5, 4600));
        osc.setPeriodicWave(hornWave());
        osc.frequency.setValueAtTime(freq, t);
        if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
        if (detune) osc.detune.value = detune;
        lp.type = "lowpass";
        lp.Q.value = 0.7;
        lp.frequency.setValueAtTime(shut, t);
        lp.frequency.exponentialRampToValueAtTime(open, t + dur * 0.45);
        env(gain.gain, t, dur, vol, 0.007);
        osc.connect(lp);
        lp.connect(gain);
        spill(gain, o, t, dur, 0.22);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      }

      function lean(o, shift) {
        var pan = o.pan === undefined ? 0 : o.pan;
        return Object.assign({}, o, {pan: Math.max(-1, Math.min(1, pan + shift))});
      }

      // The beep is the chiff and the wavetable pitch. The octave and the
      // second, detuned channel are the weight.
      function bugle(t, o, fund, dur, vol) {
        hornAt(t, lean(o, -0.14), fund, dur, vol * 0.8, -8);
        hornAt(t, lean(o, 0.14), fund, dur, vol * 0.66, 11);
        tn(t, o, {f: fund * 0.5, dur: dur * 0.92, vol: vol * 0.5, a: 0.005, wave: "triangle", lp: [820], wet: 0.14});
        hs(t, o, {dur: Math.min(0.035, dur * 0.28), vol: vol * 0.4, a: 0.001, bp: [1900, 800, 1.1]});
      }

      // Pitched beep stays inside the 30 ms count. The octave and the noise
      // are the drum, and they may ring a little longer.
      function tick(t, o, freq, bright) {
        tn(t, o, {f: freq, to: freq * 0.84, dur: bright ? 0.026 : 0.032, vol: bright ? 0.06 : 0.042,
          a: 0.001, wave: "triangle", lp: [bright ? 3400 : 1500]});
        tn(t, o, {f: Math.max(72, freq * 0.5), to: Math.max(46, freq * 0.34), dur: bright ? 0.05 : 0.06,
          vol: bright ? 0.075 : 0.055, a: 0.002, wave: "sine"});
        hs(t, o, {dur: bright ? 0.036 : 0.048, vol: bright ? 0.07 : 0.05, a: 0.001,
          bp: [bright ? 1400 : 480, bright ? 380 : 160, 0.85]});
      }

      function bass(t, o, vol) {
        tn(t, o, {f: 150, to: 36, dur: 0.24, vol: vol, a: 0.003, wave: "sine", wet: 0.12});
        tn(t, o, {f: 74, to: 30, dur: 0.3, vol: vol * 0.62, a: 0.004, wave: "triangle", lp: [200]});
        hs(t, o, {dur: 0.12, vol: vol * 0.45, a: 0.002, lp: [900, 110]});
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
              var ear = Object.assign({}, o, {pan: pathPan(o, (i + fraction) / n)});
              // Shorter than this and the decay is scheduled before the attack.
              var hit = Math.max(0.028, Math.min(0.07, step * 0.36));
              tn(at, ear, {f: k ? 170 : 220, to: 52, dur: hit, vol: 0.1, a: 0.002, wave: "sine"});
              hs(at, ear, {dur: Math.min(hit, 0.04), vol: 0.055, a: 0.001, bp: [k ? 900 : 1800, 400, 1]});
            });
          }
        },
        wheels: function (t, o, n, step, dur) {
          var a = Math.min(0.04, dur * 0.2);
          tn(t, o, {f: 78, to: 96, dur: dur, wave: "sawtooth", vol: 0.09, a: a, hold: 0.72, lp: [260, 420], panTo: o.panTo});
          tn(t, o, {f: 156, to: 188, dur: dur, wave: "triangle", vol: 0.04, a: a, hold: 0.7, detune: 9, lp: [900], panTo: o.panTo});
          hs(t, o, {dur: dur, vol: 0.04, a: a, hold: 0.7, bp: [500, 1400, 0.6], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            tick(t + (i + 0.5) * step, Object.assign({}, o, {pan: pathPan(o, (i + 0.5) / n)}), 640 + (i % 2) * 80, true);
          }
        },
        treads: function (t, o, n, step, dur) {
          var a = Math.min(0.06, dur * 0.25);
          tn(t, o, {f: 42, dur: dur, wave: "sawtooth", vol: 0.11, a: a, hold: 0.8, lp: [150], panTo: o.panTo});
          tn(t, o, {f: 84, dur: dur, wave: "triangle", vol: 0.045, a: a, hold: 0.75, lp: [320], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.45) * step;
            var ear = Object.assign({}, o, {pan: pathPan(o, (i + 0.5) / n)});
            tn(at, ear, {f: 130, to: 42, dur: 0.07, vol: 0.1, a: 0.002, wave: "sine"});
            hs(at, ear, {dur: 0.03, vol: 0.045, a: 0.001, bp: [700, 220, 0.8]});
          }
          hs(t + dur, o, {dur: 0.1, vol: 0.05, a: 0.004, bp: [1600, 500, 1.1], pan: o.panTo});
        },
        air: function (t, o, n, step, dur) {
          var rise = Math.max(0.06, dur * 0.58);
          var fall = dur - rise * 0.82;
          var attack = Math.min(0.05, dur * 0.22);
          tn(t, o, {f: 96, to: 140, dur: dur, vol: 0.07, a: attack, hold: 0.4, wave: "sine", lp: [240], panTo: o.panTo});
          tn(t, o, {f: 210, to: 390, dur: rise, vol: 0.05, a: attack, wave: "triangle",
            pan: pathPan(o, 0), panTo: pathPan(o, 0.58)});
          hs(t, o, {dur: rise, vol: 0.09, a: attack, hold: 0.35, bp: [280, 1800, 0.7],
            pan: pathPan(o, 0), panTo: pathPan(o, 0.58)});
          if (fall > 0.04) {
            var at = t + rise * 0.82;
            tn(at, o, {f: 390, to: 240, dur: fall, vol: 0.045, a: 0.006, wave: "triangle",
              pan: pathPan(o, 0.5), panTo: pathPan(o, 1)});
            hs(at, o, {dur: fall, vol: 0.07, a: 0.006, hold: 0.25, bp: [1800, 500, 0.75],
              pan: pathPan(o, 0.5), panTo: pathPan(o, 1)});
          }
        },
      };

      var WEAPONS = {
        rifle: {gap: 0.042, shots: function (n) { return 3 + n; }, shot: function (t, o) {
          tn(t, o, {f: 190, to: 70, dur: 0.05, vol: 0.09, a: 0.002, wave: "sine"});
          hs(t, o, {dur: 0.04, vol: 0.08, a: 0.001, bp: [2600, 600, 0.9]});
          tn(t, o, {f: 1500, to: 520, dur: 0.018, vol: 0.035, a: 0.001, wave: "triangle"});
        }},
        pistol: {gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
          tn(t, o, {f: 240, to: 90, dur: 0.04, vol: 0.07, a: 0.002, wave: "sine"});
          hs(t, o, {dur: 0.028, vol: 0.055, a: 0.001, bp: [2400, 900, 1.2]});
        }},
        autocannon: {gap: 0.032, shots: function (n) { return 6 + n; }, shot: function (t, o) {
          tn(t, o, {f: 160, to: 70, dur: 0.04, vol: 0.07, a: 0.001, wave: "sine", lp: [500]});
          hs(t, o, {dur: 0.02, vol: 0.065, a: 0.001, hp: [900]});
          tn(t, o, {f: 480, to: 180, dur: 0.016, vol: 0.03, a: 0.001, wave: "triangle"});
        }},
        cannon: {gap: 0.18, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          bass(t, o, 0.22);
          hs(t, o, {dur: 0.08, vol: 0.1, a: 0.002, lp: [1600, 180]});
          tn(t, o, {f: 420, to: 140, dur: 0.04, vol: 0.04, a: 0.001, wave: "triangle"});
        }},
        heavyCannon: {gap: 0.24, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          tn(t, o, {f: 78, to: 28, dur: 0.4, vol: 0.26, a: 0.004, wave: "sine", wet: 0.16});
          tn(t, o, {f: 40, to: 24, dur: 0.46, vol: 0.14, a: 0.006, wave: "triangle", lp: [120]});
          hs(t, o, {dur: 0.28, vol: 0.14, a: 0.003, lp: [1000, 90]});
          tn(t + 0.02, o, {f: 180, to: 60, dur: 0.14, vol: 0.06, a: 0.002, wave: "sine"});
        }},
        howitzer: {gap: 0.24, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          bass(t, o, 0.18);
          tn(t + 0.05, o, {f: 620, to: 1480, dur: 0.14, vol: 0.03, a: 0.004, wave: "sine"});
          tn(t + 0.18, o, {f: 1480, to: 460, dur: 0.14, vol: 0.024, a: 0.003, wave: "sine"});
        }},
        rockets: {gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
          tn(t, o, {f: 90, to: 50, dur: 0.1, vol: 0.08, a: 0.002, wave: "sine"});
          tick(t, o, 880 + (i % 3) * 70, true);
          hs(t, o, {dur: 0.3, vol: 0.08, a: 0.015, hold: 0.4, bp: [360 + (i % 4) * 60, 2200, 0.8]});
          tn(t, o, {f: 200, to: 740, dur: 0.26, vol: 0.035, a: 0.012, wave: "sawtooth", lp: [600, 1600]});
        }},
        missile: {gap: 0.22, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
          bass(t, o, 0.14);
          hornAt(t, lean(o, -0.1), 210, 0.4, 0.055, -7, 840);
          hornAt(t, lean(o, 0.1), 210, 0.4, 0.045, 9, 840);
          hs(t, o, {dur: 0.38, vol: 0.07, a: 0.03, hold: 0.45, hp: [280, 2000]});
        }},
        mortar: {gap: 0.17, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          tn(t, o, {f: 160, to: 48, dur: 0.1, vol: 0.16, a: 0.002, wave: "sine"});
          hs(t, o, {dur: 0.07, vol: 0.07, a: 0.002, lp: [700, 160]});
          tn(t + 0.06, o, {f: 1320, to: 380, dur: 0.18, vol: 0.03, a: 0.004, wave: "sine"});
        }},
        flak: {gap: 0.085, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
          tn(t, o, {f: 200, to: 80, dur: 0.06, vol: 0.08, a: 0.002, wave: "sine"});
          tick(t, o, 880, true);
        }},
      };

      var WEAPON_BY_TYPE = {GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
        FALCON: "missile", LYNX: "mortar"};
      var WEAPON_BY_CLASS = {infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
        buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol"};
      var SELECT_PITCH = {foot: 0, wheels: 3, treads: -7, air: 7};

      var CUES = {
        switchOn: function (t, o) {
          [3, 4, 5].forEach(function (harmonic, i) { bugle(t + i * 0.11, o, FUND * harmonic / 3, 0.28, 0.06); });
        },
        switchOff: function (t, o) {
          [5, 4, 3].forEach(function (harmonic, i) { bugle(t + i * 0.08, o, FUND * harmonic / 5, 0.16, 0.05); });
          bass(t + 0.22, o, 0.08);
        },
        select: function (t, o) {
          var call = pick(CALL, o.moveType, "movement type");
          bugle(t, o, call.fund * call.from / 2, 0.08, 0.05);
          bugle(t + 0.06, o, call.fund * call.to / 2, 0.12, 0.05);
          if (o.moveType === "air") hs(t, o, {dur: 0.06, vol: 0.04, a: 0.004, bp: [700, 1600, 0.7]});
          if (o.moveType === "treads") bass(t, o, 0.06);
        },
        cancel: function (t, o) {
          hornAt(t, o, FUND * 4, 0.14, 0.07, 0, FUND * 3);
        },
        deny: function (t, o) {
          bass(t, o, 0.12);
          bass(t + 0.12, o, 0.1);
        },
        undo: function (t, o) {
          hs(t, o, {dur: 0.12, vol: 0.05, a: 0.002, bp: [1800, 400, 0.8]});
          tick(t, o, 520, true);
          tick(t + 0.06, o, 300, false);
        },
        redo: function (t, o) {
          hs(t, o, {dur: 0.12, vol: 0.05, a: 0.002, bp: [400, 1800, 0.8]});
          tick(t, o, 300, false);
          tick(t + 0.06, o, 520, true);
        },
        target: function (t, o) {
          tick(t, o, 1200, true);
          tn(t, o, {f: 1600, to: 2400, dur: 0.03, vol: 0.03, a: 0.001, wave: "triangle"});
        },
        factory: function (t, o) {
          tick(t, o, 360, true);
          bass(t, o, 0.08);
          bugle(t + 0.08, o, FUND, 0.16, 0.045);
        },
        turnEnd: function (t, o) {
          [5, 4, 3, 2].forEach(function (harmonic, i) {
            bugle(t + i * 0.16, o, FUND * harmonic / 2, i === 3 ? 0.5 : 0.22, 0.065);
          });
          bass(t + 0.52, o, 0.18);
        },
        turnStart: function (t, o) {
          [2, 3, 4, 5].forEach(function (harmonic, i) {
            bugle(t + i * 0.12, o, FUND * harmonic / 2, 0.2, 0.06);
          });
          bass(t + 0.46, o, 0.1);
        },
        move: function (t, o) {
          if (!(o.hexes >= 1) || !(o.step > 0)) throw new Error("Move cue needs hexes and a step time.");
          var mover = pick(MOVE_SOUND, o.moveType, "movement type");
          mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) { bass(t, o, 0.16); },
        calcMachine: function (t, o) {
          var f = hz(degree(o.index) + (o.attacking ? 12 : 0));
          tick(t, o, f, !!o.attacking);
        },
        calcSupport: function (t, o) {
          var f = hz(degree(o.index) + 12);
          if (o.side === "attack") {
            tick(t, o, f, true);
            tick(t + 0.018, o, f * 1.5, true);
          } else if (o.side === "defense") {
            tick(t, o, f / 2, false);
          } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
        },
        calcTerrain: function (t, o) {
          if (typeof o.value !== "number") throw new Error("Terrain cue needs a defense value.");
          var value = clamp(o.value, 0, 60);
          if (value === 0) { tick(t, o, 980, true); return; }
          var f = Math.max(48, 180 - value * 2.4);
          tn(t, o, {f: f, to: Math.max(36, f * 0.5), dur: 0.1 + value / 180, vol: 0.08 + value / 450, a: 0.003, wave: "sine"});
          hs(t, o, {dur: 0.08 + value / 280, vol: 0.05 + value / 600, a: 0.002, lp: [800, 140]});
          if (value >= 30) bass(t + 0.02, o, 0.08);
        },
        calcRing: function (t, o) {
          if (o.controlled) tick(t, o, hz(SCALE[o.index % 6] + 12), true);
          else tick(t, o, 140, false);
        },
        surround: function (t, o) {
          for (var i = 0; i < 5; i++) tick(t + i * 0.042, o, 240 + i * 40, true);
          hornAt(t + 0.18, lean(o, -0.1), FUND * 3, 0.4, 0.07, -6, FUND);
          hornAt(t + 0.18, lean(o, 0.1), FUND * 4.5, 0.36, 0.05, 8, FUND * 1.5);
          bass(t + 0.2, o, 0.18);
        },
        unsurrounded: function (t, o) {
          tick(t, o, 220, false);
          bugle(t + 0.02, o, FUND, 0.2, 0.045);
        },
        approach: function (t, o) {
          if (!(o.dur > 0)) throw new Error("Approach cue needs a duration.");
          var attack = Math.min(0.06, o.dur * 0.3);
          [-0.62, 0.62].forEach(function (pan) {
            hs(t, o, {dur: o.dur, vol: 0.055, a: attack, hold: 0.25, bp: [140, 700, 0.6], pan: pan});
            tn(t, o, {f: 44, to: 72, dur: o.dur, vol: 0.06, a: attack, hold: 0.25, wave: "sawtooth", lp: [180, 320], pan: pan});
          });
          var taps = Math.max(2, Math.min(6, Math.round(o.dur / 0.16)));
          for (var i = 0; i < taps; i++) tick(t + (i + 0.5) * (o.dur / taps), o, 380, true);
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
          var tail = 0.28 + 0.55 * size + (o.destroyed ? 0.4 : 0);
          hs(t, o, {dur: tail, vol: 0.12 + 0.18 * size, a: 0.004, lp: [2400, 70, 0.7], wet: 0.16 + 0.2 * size});
          tn(t, o, {f: 120, to: 32, dur: 0.22 + 0.3 * size, vol: 0.16 + 0.18 * size, a: 0.003, wave: "sine"});
          tn(t, o, {f: 60, to: 26, dur: 0.3 + 0.35 * size, vol: 0.1 + 0.1 * size, a: 0.005, wave: "triangle", lp: [140]});
          var debris = 2 + Math.round(size * 4);
          for (var i = 0; i < debris; i++) tick(t + 0.05 + rand() * tail * 0.55, o, 500 + rand() * 800, true);
          if (o.destroyed) {
            hornAt(t + 0.08, o, FUND * 2, 0.55, 0.06, -5, FUND * 0.5);
            bass(t + 0.1, o, 0.16);
          }
        },
        deflect: function (t, o) {
          bugle(t, o, 520, 0.16, 0.045);
          tick(t, o, 1400, true);
        },
        star: function (t, o) {
          bugle(t, o, hz(degree(o.rank) + 12), 0.4, 0.05);
        },
        capture: function (t, o) {
          if (o.kind === "base") {
            bass(t, o, 0.14);
            [2, 3, 4, 5].forEach(function (harmonic, i) {
              bugle(t + 0.06 + i * 0.11, o, 130 * harmonic / 2, i === 3 ? 0.38 : 0.18, 0.06);
            });
          } else if (o.kind === "factory") {
            bass(t, o, 0.08);
            [3, 4, 5].forEach(function (harmonic, i) {
              bugle(t + 0.05 + i * 0.09, o, 196 * harmonic / 3, 0.18, 0.05);
            });
          } else throw new Error("Capture kind must be base or factory, not \"" + o.kind + "\".");
        },
        repair: function (t, o) {
          for (var i = 0; i < 6; i++) tick(t + i * 0.06, o, hz(SCALE[i] + 12), true);
          bugle(t + 0.36, o, hz(SCALE[5]), 0.32, 0.05);
        },
        deploy: function (t, o) {
          hs(t, o, {dur: 0.24, vol: 0.07, a: 0.02, hold: 0.3, hp: [2400, 500]});
          bass(t + 0.16, o, 0.16);
          bugle(t + 0.3, o, FUND * 2, 0.18, 0.05);
        },
        load: function (t, o) {
          bass(t, o, 0.12);
          bugle(t + 0.08, o, FUND * 1.5, 0.1, 0.045);
          bugle(t + 0.16, o, FUND * 2, 0.14, 0.045);
        },
        unload: function (t, o) {
          hs(t, o, {dur: 0.03, vol: 0.06, a: 0.001, bp: [1800, 500, 1]});
          bugle(t + 0.03, o, FUND * 2, 0.1, 0.045);
          bugle(t + 0.12, o, FUND * 1.5, 0.14, 0.045);
        },
        victory: function (t, o) {
          [3, 4, 5, 6, 8].forEach(function (harmonic, i) {
            bugle(t + i * 0.11, o, FUND * harmonic / 2, i === 4 ? 0.55 : 0.2, 0.06);
          });
          [0.52, 0.58, 0.63].forEach(function (at) { tick(t + at, o, 420, true); });
          bass(t + 0.6, o, 0.18);
        },
        defeat: function (t, o) {
          [[3, 0.4], [2, 0.5], [1, 0.85]].forEach(function (note, i) {
            bugle(t + i * 0.38, o, FUND * note[0], note[1], 0.055);
          });
          bass(t + 0.8, o, 0.12);
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
        weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
    },
  });
})();
