/* Soundscape "Helmet radio" — Claude Fable 5.1.
 *
 * Nectaris is fought on the Moon in 2089. Vacuum carries no sound, so this
 * bank hears the war the way a crew sealed in a vehicle would:
 *
 * - The low end arrives through the ground and the hull. The hull bus keeps
 *   what is below about 500 Hz, drives it through a saturating stage so its
 *   harmonics reach small speakers, and rings a short convolution (the hull,
 *   not a hall). Every impact stacks a pitched sub drop, a saturated mid
 *   punch and a knock of band-passed noise.
 * - Everything else arrives over the squad radio. A voice-band bus (250 to
 *   3400 Hz) with soft clipping and a fast automatic gain control makes loud
 *   shots pump the channel, and transmissions open and close with a keying
 *   click and a squelch tail of static.
 * - Voices are 32-step, 5-bit wavetables, the PC Engine's own instrument
 *   format, expressed as their 16 harmonics through PeriodicWave; chimes are
 *   two of them detuned, over a wavetable bass on the hull bus.
 * - Turns change hands with keying tones modelled on the Quindar tones of the
 *   Apollo ground network: a 250 ms sine at 2525 Hz keyed the transmitter,
 *   one at 2475 Hz released it. Turn start is the key-down tone, End Turn the
 *   release. The combat board's counting uses 1200 and 2200 Hz data tones,
 *   the Bell 202 modem pair. Deny is the 480 + 620 Hz busy signal.
 *
 * Chimes use E natural minor, the key of the soundtrack. Nothing is sampled;
 * every voice is an oscillator or generated noise, and nothing reproduces the
 * original games' audio.
 */
"use strict";

(function () {
  var register = typeof module !== "undefined" ? require("./sfx.js").registerBank : SFX.registerBank;

  var INTRO_TONE = 2525, OUTRO_TONE = 2475, KEY_TONE_SECONDS = 0.25;
  var DATA_LOW = 1200, DATA_HIGH = 2200;
  var BUSY = [480, 620];

  register({
    id: "fable",
    creator: "Claude Fable 5.1",
    title: "Helmet radio",
    description: "Heard from inside a sealed lunar vehicle: shocks through the hull, everything else over a keyed voice radio with Apollo-style tones.",
    seed: 20890406,
    scale: [64, 66, 67, 69, 71, 72, 74, 76, 79],
    room: {seconds: 0.45, wetGain: 0.32},
    masterGain: 0.9,
    build: function (d) {
      if (typeof d.audio !== "function") {
        throw new Error("Helmet radio needs d.audio() from SFX (audio context, master gain and room).");
      }
      var hz = d.hz, SCALE = d.SCALE, pick = d.pick, clamp = d.clamp, pathPan = d.pathPan, rand = d.rand;

      /* --- wavetables ------------------------------------------------------------ */

      // 32 steps of 0..31, as the HuC6280 stored an instrument. `shape` maps a
      // phase 0..1 to -1..1; the table is quantized to 5 bits before its
      // harmonics are taken, so the steps' grit is part of the voice.
      function table(shape) {
        var steps = new Float32Array(32);
        for (var i = 0; i < 32; i++) steps[i] = Math.round(clamp((shape(i / 32) + 1) * 15.5, 0, 31));
        return steps;
      }
      var TABLES = {
        // Reedy: a rounded saw with a strong 2nd and 3rd harmonic.
        reed: table(function (p) { return 0.55 * (2 * p - 1) + 0.35 * Math.sin(2 * Math.PI * p) + 0.3 * Math.sin(4 * Math.PI * p); }),
        // Quarter pulse: hollow and bright, for alarms and engines.
        pulse: table(function (p) { return p < 0.25 ? 1 : -1; }),
        // Bell: odd partials over a sine.
        bell: table(function (p) { return 0.6 * Math.sin(2 * Math.PI * p) + 0.3 * Math.sin(6 * Math.PI * p) + 0.15 * Math.sin(10 * Math.PI * p); }),
        // Bass: a triangle with a little 3rd harmonic.
        bass: table(function (p) { return 0.8 * (p < 0.5 ? 4 * p - 1 : 3 - 4 * p) + 0.2 * Math.sin(6 * Math.PI * p); }),
      };

      // Discrete Fourier transform of a 32-step table: harmonics 1..16.
      function periodic(ctx, steps) {
        var real = new Float32Array(17), imag = new Float32Array(17);
        for (var k = 1; k <= 16; k++) {
          var re = 0, im = 0;
          for (var n = 0; n < 32; n++) {
            var x = steps[n] - 15.5, angle = 2 * Math.PI * k * n / 32;
            re += x * Math.cos(angle);
            im -= x * Math.sin(angle);
          }
          real[k] = re / 16; imag[k] = im / 16;
        }
        return ctx.createPeriodicWave(real, imag);
      }

      /* --- the two buses ------------------------------------------------------- */

      var g = null;

      function biquad(ctx, type, f, q, gainDb) {
        var node = ctx.createBiquadFilter();
        node.type = type;
        node.frequency.value = f;
        node.Q.value = q;
        if (gainDb) node.gain.value = gainDb;
        return node;
      }

      // tanh saturation; small signals pass with gain drive / tanh(drive).
      function saturate(ctx, drive) {
        var shaper = ctx.createWaveShaper(), curve = new Float32Array(1024), norm = Math.tanh(drive);
        for (var i = 0; i < curve.length; i++) curve[i] = Math.tanh(drive * (i / 511.5 - 1)) / norm;
        shaper.curve = curve;
        shaper.oversample = "2x";
        return shaper;
      }

      function noiseBuffer(ctx, seconds) {
        var length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) data[i] = rand() * 2 - 1;
        return buffer;
      }

      // Sparse impulses: regolith crunch, radio static, falling debris.
      function crackleBuffer(ctx, seconds) {
        var length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) {
          if (rand() < 0.012) {
            var amp = rand() * 2 - 1, span = 2 + Math.floor(rand() * 6);
            for (var k = 0; k < span && i + k < length; k++) data[i + k] = amp * (1 - k / span);
            i += span;
          }
        }
        return buffer;
      }

      // Built on first use and again if the core rebuilds its context or room.
      function graph() {
        var a = d.audio();
        if (!a.ctx || !a.master || !a.room) throw new Error("Helmet radio cue requested before the audio graph exists.");
        if (g && g.ctx === a.ctx && g.room === a.room) return g;
        var ctx = a.ctx;

        var radio = ctx.createGain();
        var hp = biquad(ctx, "highpass", 250, 0.8), lp = biquad(ctx, "lowpass", 3400, 0.8);
        var presence = biquad(ctx, "peaking", 1800, 1.1, 3);
        // The clip's small-signal gain (1.6) and the make-up gain lift quiet
        // cues about 2x while the compressor holds loud ones near -14 dBFS.
        var clip = saturate(ctx, 1.4);
        var agc = ctx.createDynamicsCompressor();
        agc.threshold.value = -20; agc.knee.value = 8; agc.ratio.value = 3;
        agc.attack.value = 0.002; agc.release.value = 0.14;
        var radioOut = ctx.createGain();
        radioOut.gain.value = 1.3;
        radio.connect(hp); hp.connect(lp); lp.connect(presence); presence.connect(clip);
        clip.connect(agc); agc.connect(radioOut); radioOut.connect(a.master);

        // Hull: low-pass, a resonant bump where a vehicle body rings, then
        // saturation so the drops grow harmonics that small speakers can carry.
        var hull = ctx.createGain();
        var low = biquad(ctx, "lowpass", 520, 0.7), body = biquad(ctx, "peaking", 95, 1.2, 4);
        var drive = saturate(ctx, 2.4), hullOut = ctx.createGain(), send = ctx.createGain();
        hullOut.gain.value = 0.8; send.gain.value = 0.45;
        hull.connect(low); low.connect(body); body.connect(drive); drive.connect(hullOut);
        hullOut.connect(a.master); hullOut.connect(send); send.connect(a.room);

        var waves = {};
        Object.keys(TABLES).forEach(function (name) { waves[name] = periodic(ctx, TABLES[name]); });
        g = {ctx: ctx, room: a.room, radio: radio, hull: hull, waves: waves,
          hiss: noiseBuffer(ctx, 1.5), crackle: crackleBuffer(ctx, 2)};
        return g;
      }

      /* --- voices ---------------------------------------------------------------- */

      var PLAIN = {sine: 1, square: 1, sawtooth: 1, triangle: 1};

      // Fast attack, optional hold (fraction of the remaining time), exponential
      // release to silence at t + dur.
      function envelope(param, t, dur, vol, attack, hold) {
        var level = Math.max(vol, 0.0002), end = t + dur;
        param.setValueAtTime(0.0001, t);
        param.exponentialRampToValueAtTime(level, t + attack);
        if (hold) param.setValueAtTime(level, Math.min(end - 0.005, t + attack + (dur - attack) * hold));
        param.exponentialRampToValueAtTime(0.0001, end);
      }

      // Filters in a fixed order; each is [start Hz, optional end Hz, optional Q].
      function filters(ctx, node, s, t) {
        [["hp", "highpass"], ["bp", "bandpass"], ["lp", "lowpass"]].forEach(function (kind) {
          var band = s[kind[0]];
          if (!band) return;
          var filter = biquad(ctx, kind[1], band[0], band[2] || 0.7);
          filter.frequency.setValueAtTime(band[0], t);
          if (band[1]) filter.frequency.exponentialRampToValueAtTime(band[1], t + s.dur);
          node.connect(filter);
          node = filter;
        });
        return node;
      }

      // Envelope, stereo position (s.pan, else the cue's o.pan, else centre,
      // optionally sweeping to s.panTo), then the radio or hull bus.
      function route(node, t, o, s) {
        var G = graph(), ctx = G.ctx, gain = ctx.createGain(), panner = ctx.createStereoPanner();
        envelope(gain.gain, t, s.dur, s.vol, s.a || 0.003, s.hold);
        filters(ctx, node, s, t).connect(gain);
        var at = s.pan !== undefined ? s.pan : (o.pan !== undefined ? o.pan : 0);
        panner.pan.setValueAtTime(at, t);
        if (s.panTo !== undefined) panner.pan.linearRampToValueAtTime(s.panTo, t + s.dur);
        gain.connect(panner);
        if (s.bus === "hull") panner.connect(G.hull);
        else if (s.bus === undefined || s.bus === "radio") panner.connect(G.radio);
        else throw new Error("Unknown bus \"" + s.bus + "\".");
      }

      // Pitched voice: f, to, glide (fraction of dur), wave (plain or a table
      // name), dur, vol, a, hold, detune (cents), vib [rate Hz, cents],
      // hp/bp/lp, pan, panTo, bus.
      function osc(t, o, s) {
        var G = graph(), ctx = G.ctx, node = ctx.createOscillator();
        var wave = s.wave || "sine";
        if (PLAIN[wave]) node.type = wave;
        else if (G.waves[wave]) node.setPeriodicWave(G.waves[wave]);
        else throw new Error("Unknown waveform \"" + wave + "\".");
        node.frequency.setValueAtTime(s.f, t);
        if (s.to) node.frequency.exponentialRampToValueAtTime(s.to, t + s.dur * (s.glide || 1));
        if (s.detune) node.detune.value = s.detune;
        if (s.vib) {
          var lfo = ctx.createOscillator(), depth = ctx.createGain();
          lfo.frequency.value = s.vib[0];
          depth.gain.value = s.vib[1];
          lfo.connect(depth); depth.connect(node.detune);
          lfo.start(t); lfo.stop(t + s.dur + 0.05);
        }
        route(node, t, o, s);
        node.start(t);
        node.stop(t + s.dur + 0.05);
      }

      // Noise voice; s.crackle uses the sparse impulse buffer instead of hiss.
      function burst(t, o, s) {
        var G = graph(), source = G.ctx.createBufferSource();
        source.buffer = s.crackle ? G.crackle : G.hiss;
        source.loop = true;
        route(source, t, o, s);
        source.start(t, rand() * (source.buffer.duration - 0.1));
        source.stop(t + s.dur + 0.05);
      }

      function merge(base, extra) {
        if (extra) Object.keys(extra).forEach(function (k) { base[k] = extra[k]; });
        return base;
      }

      /* --- radio idioms ------------------------------------------------------------ */

      function beep(t, o, f, dur, vol, extra) {
        osc(t, o, merge({f: f, dur: dur, vol: vol, a: 0.004}, extra));
      }

      // A reed note as two voices detuned apart, the bank's melodic voice.
      function chime(t, o, f, dur, vol, extra) {
        [-7, 7].forEach(function (cents) {
          osc(t, o, merge({f: f, dur: dur, vol: vol * 0.55, a: 0.005, wave: "reed", detune: cents}, extra));
        });
      }

      // Push-to-talk: a click and a few milliseconds of static.
      function key(t, o, vol) {
        burst(t, o, {dur: 0.014, vol: vol, hp: [1200], a: 0.001});
        osc(t, o, {f: 700, to: 200, dur: 0.018, vol: vol * 0.7, a: 0.001, wave: "square"});
      }

      // The carrier dropping: a burst of static that dies, then the receiver clicks shut.
      function squelch(t, o, dur, vol) {
        burst(t, o, {dur: dur, vol: vol, hp: [900], a: 0.004});
        key(t + dur, o, vol * 0.6);
      }

      // Open channel hiss under a transmission.
      function carrier(t, o, dur, level) {
        burst(t, o, {dur: dur, vol: level, a: 0.02, hold: 0.85, hp: [1500]});
      }

      // The keying tones stay pure sines, as the originals were.
      function keyTone(t, o, intro, vol) {
        beep(t, o, intro ? INTRO_TONE : OUTRO_TONE, KEY_TONE_SECONDS, vol || 0.16, {a: 0.006, hold: 0.9});
      }

      // Frequency-shift data: one tone per bit at `baud` bits per second.
      function data(t, o, bits, baud, vol) {
        var step = 1 / baud;
        bits.forEach(function (bit, i) {
          beep(t + i * step, o, bit ? DATA_HIGH : DATA_LOW, step * 1.05, vol, {a: 0.002, wave: "reed"});
        });
      }

      function busy(t, o, pulses, vol) {
        for (var i = 0; i < pulses; i++) {
          BUSY.forEach(function (f) { beep(t + i * 0.19, o, f, 0.11, vol, {hold: 0.8, a: 0.005, wave: "pulse"}); });
        }
      }

      // Armour ringing, band-limited by the radio.
      function ring(t, o, vol) {
        [[2100, 0.3], [2830, 0.22], [3960, 0.16]].forEach(function (partial, i) {
          beep(t, o, partial[0], partial[1], vol / (1 + i), {a: 0.002, wave: "bell"});
        });
      }

      /* --- hull idioms ----------------------------------------------------------------- */

      // A pitched sub drop, the weight of every impact.
      function kick(t, o, f, to, dur, vol) {
        osc(t, o, {f: f, to: to, glide: 0.6, dur: dur, vol: vol, a: 0.003, bus: "hull"});
      }

      // Saturated mid growl: a pulse wave dropping through the hull's drive.
      function punch(t, o, f, to, dur, vol, extra) {
        osc(t, o, merge({f: f, to: to, glide: 0.7, dur: dur, vol: vol, a: 0.002, wave: "pulse", bus: "hull"}, extra));
      }

      // A knock of band-passed noise: the hull struck once.
      function knock(t, o, vol, f) {
        burst(t, o, {dur: 0.045, vol: vol, a: 0.001, bp: [f || 320, null, 1.2], bus: "hull"});
      }

      function rumble(t, o, dur, vol, extra) {
        burst(t, o, merge({dur: dur, vol: vol, a: 0.05, hold: 0.8, lp: [180], bus: "hull"}, extra));
      }

      // A bass note under a chime: the wavetable bass on the hull bus.
      function bass(t, o, midi, dur, vol) {
        osc(t, o, {f: hz(midi), dur: dur, vol: vol, a: 0.01, hold: 0.7, wave: "bass", bus: "hull"});
      }

      // Every hit at once: sub drop, mid punch and knock, scaled by `size`.
      function impact(t, o, size) {
        kick(t, o, 150 - 40 * size, 38 - 8 * size, 0.18 + 0.2 * size, 0.28 + 0.14 * size);
        punch(t, o, 260, 55, 0.1 + 0.1 * size, 0.12 + 0.08 * size);
        knock(t, o, 0.1 + 0.06 * size);
      }

      // A stately note run in the scale with a bass root and a knock on each
      // step; the last note is held.
      function call(t, o, degrees, spacing, vol, lastDur) {
        degrees.forEach(function (degree, i) {
          var last = i === degrees.length - 1, at = t + i * spacing;
          chime(at, o, hz(SCALE[degree] + 12), last ? lastDur : spacing * 1.15, vol, {hold: last ? 0.6 : 0.5});
          knock(at, o, 0.05, 260);
          if (i % 2 === 0 || last) bass(at, o, SCALE[degree] - 24, last ? lastDur : spacing * 2, vol * 0.9);
        });
      }

      /* --- movement ------------------------------------------------------------------ */

      var MOVE_SOUND = {
        // Boots on regolith through the suit microphone, each step felt as a small knock.
        foot: function (t, o, n, step) {
          for (var i = 0; i < n; i++) {
            var pan = pathPan(o, (i + 0.5) / n);
            [0.2, 0.7].forEach(function (fraction, k) {
              var at = t + (i + fraction) * step;
              burst(at, o, {dur: 0.045, vol: 0.09, crackle: true, bp: [k ? 900 : 1300, null, 0.9], pan: pan});
              knock(at, o, 0.035, 200);
            });
          }
        },
        // Electric drive: axle hum and its harmonics in the hull, the whine on the radio.
        wheels: function (t, o, n, step, dur) {
          osc(t, o, {f: 58, to: 96, glide: 0.4, dur: dur, wave: "sawtooth", vol: 0.13, a: 0.05, hold: 0.75,
            bus: "hull", panTo: o.panTo});
          osc(t, o, {f: 116, to: 192, glide: 0.4, dur: dur, wave: "pulse", vol: 0.06, a: 0.05, hold: 0.75,
            bus: "hull", panTo: o.panTo, vib: [9, 12]});
          osc(t, o, {f: 520, to: 780, glide: 0.4, dur: dur, wave: "reed", vol: 0.03, a: 0.06, hold: 0.8,
            vib: [11, 18], panTo: o.panTo});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.5) * step, pan = pathPan(o, (i + 0.5) / n);
            burst(at, o, {dur: 0.012, vol: 0.035, crackle: true, hp: [2000], pan: pan});
            knock(at, o, 0.03, 380);
          }
        },
        // Tracks: the engine and ground rumble in the hull, a clank per hex, a settling thud.
        treads: function (t, o, n, step, dur) {
          rumble(t, o, dur, 0.24, {panTo: o.panTo});
          osc(t, o, {f: 36, to: 46, glide: 0.5, dur: dur, wave: "sawtooth", vol: 0.14, a: 0.08, hold: 0.8,
            bus: "hull", panTo: o.panTo});
          osc(t, o, {f: 55, to: 70, glide: 0.5, dur: dur, wave: "pulse", vol: 0.1, a: 0.1, hold: 0.8,
            bus: "hull", panTo: o.panTo, vib: [7, 30]});
          for (var i = 0; i < n; i++) {
            var at = t + (i + 0.5) * step, pan = pathPan(o, (i + 0.5) / n);
            kick(at, {pan: pan}, 120, 55, 0.07, 0.13);
            knock(at, {pan: pan}, 0.06, 300);
            burst(at, o, {dur: 0.02, vol: 0.04, crackle: true, bp: [1400 + (i % 2) * 500, null, 1.2], pan: pan});
          }
          kick(t + dur, {pan: o.panTo}, 95, 38, 0.14, 0.18);
          knock(t + dur, {pan: o.panTo}, 0.08);
        },
        // Thrusters: mostly on the radio; the exhaust hitting the ground reaches the hull faintly.
        air: function (t, o, n, step, dur) {
          burst(t, o, {dur: dur, vol: 0.12, a: dur * 0.3, hold: 0.5, bp: [900, 2200, 0.9], panTo: o.panTo});
          osc(t, o, {f: 240, to: 420, dur: dur, wave: "reed", vol: 0.035, a: dur * 0.3, hold: 0.5,
            lp: [1500], vib: [5, 20], panTo: o.panTo});
          rumble(t, o, dur, 0.05, {a: dur * 0.3, hold: 0.5, lp: [140], panTo: o.panTo});
        },
      };

      /* --- weapons ---------------------------------------------------------------- */

      // shots(strength): reports per volley; gap: longest spacing between them.
      var WEAPONS = {
        rifle: {gap: 0.045, shots: function (n) { return 3 + n; }, shot: function (t, o) {
          burst(t, o, {dur: 0.03, vol: 0.11, hp: [1800], a: 0.001});
          osc(t, o, {f: 900, to: 300, dur: 0.02, wave: "square", vol: 0.03, a: 0.001});
          knock(t, o, 0.04, 420);
        }},
        autocannon: {gap: 0.03, shots: function (n) { return 5 + Math.round(n * 1.2); }, shot: function (t, o) {
          burst(t, o, {dur: 0.025, vol: 0.1, bp: [1300, null, 1], a: 0.001});
          osc(t, o, {f: 260, to: 120, dur: 0.03, wave: "sawtooth", vol: 0.05, a: 0.001});
          punch(t, o, 180, 90, 0.04, 0.06);
        }},
        cannon: {gap: 0.18, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          impact(t, o, 0.5);
          burst(t, o, {dur: 0.14, vol: 0.18, lp: [3000, 500], a: 0.001});
          osc(t, o, {f: 320, to: 90, dur: 0.09, wave: "sawtooth", vol: 0.08, a: 0.001});
        }},
        heavyCannon: {gap: 0.22, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          impact(t, o, 1);
          kick(t + 0.01, o, 90, 28, 0.42, 0.3);
          rumble(t, o, 0.3, 0.15, {a: 0.01, hold: 0.3});
          burst(t, o, {dur: 0.22, vol: 0.2, lp: [2400, 400], a: 0.001});
          osc(t + 0.01, o, {f: 200, to: 70, dur: 0.16, wave: "sawtooth", vol: 0.09, a: 0.001});
        }},
        // The shell's whistle is what the radio catches after the thud.
        howitzer: {gap: 0.26, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
          impact(t, o, 0.8);
          kick(t + 0.01, o, 80, 30, 0.34, 0.24);
          burst(t, o, {dur: 0.16, vol: 0.15, lp: [2000, 500], a: 0.001});
          osc(t + 0.06, o, {f: 2600, to: 900, dur: 0.42, vol: 0.035, a: 0.05, hold: 0.6, wave: "reed", vib: [8, 25]});
        }},
        rockets: {gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
          kick(t, o, 100, 50, 0.09, 0.1);
          punch(t, o, 140, 420, 0.25, 0.05, {glide: 1, a: 0.02, hold: 0.4});
          burst(t, o, {dur: 0.3, vol: 0.12, a: 0.015, hold: 0.4, bp: [800 + i * 80, 2800, 1]});
          osc(t, o, {f: 300, to: 1200, dur: 0.28, wave: "sawtooth", vol: 0.04});
        }},
        missile: {gap: 0.2, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
          kick(t, o, 120, 45, 0.14, 0.22);
          knock(t, o, 0.08);
          punch(t, o, 90, 260, 0.4, 0.07, {glide: 1, a: 0.03, hold: 0.5});
          burst(t, o, {dur: 0.5, vol: 0.14, a: 0.06, hold: 0.5, hp: [600, 2600]});
          osc(t, o, {f: 350, to: 1800, dur: 0.45, wave: "sawtooth", vol: 0.045, a: 0.03});
        }},
        mortar: {gap: 0.16, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
          kick(t, o, 170, 60, 0.14, 0.24);
          knock(t, o, 0.08, 280);
          burst(t, o, {dur: 0.06, vol: 0.09, lp: [1200], a: 0.001});
          osc(t + 0.04, o, {f: 1600, to: 1000, dur: 0.22, vol: 0.03, a: 0.03, wave: "reed"});
        }},
        flak: {gap: 0.085, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
          punch(t, o, 300, 120, 0.08, 0.1);
          osc(t, o, {f: 300, to: 120, dur: 0.07, wave: "square", vol: 0.09, a: 0.001});
          burst(t, o, {dur: 0.05, vol: 0.09, bp: [1100, null, 1], a: 0.001});
        }},
        pistol: {gap: 0.075, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
          burst(t, o, {dur: 0.035, vol: 0.08, bp: [2000, 1300, 1.2], a: 0.001});
          osc(t, o, {f: 800, to: 300, dur: 0.02, wave: "square", vol: 0.02, a: 0.001});
          knock(t, o, 0.03, 450);
        }},
      };

      var WEAPON_BY_TYPE = {GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
        FALCON: "missile", LYNX: "mortar"};
      var WEAPON_BY_CLASS = {infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
        buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol"};
      var SELECT_PITCH = {foot: 0, wheels: 4, treads: -5, air: 9};

      /* --- cues ------------------------------------------------------------------------ */

      var CUES = {
        // Interface: the set opens with the key-down tone and closes with the release tone.
        switchOn: function (t, o) {
          key(t, o, 0.1);
          kick(t, o, 110, 50, 0.12, 0.16);
          keyTone(t + 0.03, o, true);
          carrier(t + 0.03, o, 0.45, 0.02);
        },
        switchOff: function (t, o) {
          keyTone(t, o, false, 0.13);
          squelch(t + KEY_TONE_SECONDS + 0.01, o, 0.1, 0.08);
          kick(t + KEY_TONE_SECONDS + 0.1, o, 90, 40, 0.14, 0.14);
        },
        select: function (t, o) {
          var f = 1400 * Math.pow(2, pick(SELECT_PITCH, o.moveType, "movement type") / 12);
          chime(t, o, f, 0.035, 0.12);
          chime(t + 0.035, o, f * 1.25, 0.06, 0.12);
          knock(t, o, 0.04, 380);
        },
        cancel: function (t, o) {
          osc(t, o, {f: 1400, to: 700, dur: 0.09, vol: 0.1, wave: "reed"});
          squelch(t + 0.06, o, 0.06, 0.05);
        },
        deny: function (t, o) {
          busy(t, o, 2, 0.08);
          knock(t, o, 0.06, 240);
          knock(t + 0.19, o, 0.06, 240);
        },
        undo: function (t, o) {
          osc(t, o, {f: 1900, to: 950, dur: 0.09, vol: 0.1, wave: "reed"});
          knock(t, o, 0.04, 300);
        },
        redo: function (t, o) {
          osc(t, o, {f: 950, to: 1900, dur: 0.09, vol: 0.1, wave: "reed"});
          knock(t, o, 0.04, 300);
        },
        target: function (t, o) {
          beep(t, o, 2200, 0.02, 0.08, {a: 0.002, wave: "bell"});
          burst(t, o, {dur: 0.008, vol: 0.05, crackle: true, hp: [2500], a: 0.001});
          knock(t, o, 0.05, 450);
        },
        factory: function (t, o) {
          kick(t, o, 130, 55, 0.12, 0.22);
          knock(t, o, 0.1, 260);
          burst(t, o, {dur: 0.14, vol: 0.06, bp: [700, 1800, 0.8], a: 0.02});
          chime(t + 0.1, o, 1000, 0.05, 0.08);
          chime(t + 0.15, o, 1500, 0.08, 0.08);
        },

        // Turns: key-down to begin, release and squelch to end; the hull takes the hand-off.
        turnEnd: function (t, o) {
          keyTone(t, o, false, 0.18);
          squelch(t + KEY_TONE_SECONDS + 0.02, o, 0.13, 0.1);
          kick(t + KEY_TONE_SECONDS + 0.03, o, 90, 42, 0.22, 0.16);
          knock(t + KEY_TONE_SECONDS + 0.03, o, 0.07);
        },
        turnStart: function (t, o) {
          key(t, o, 0.12);
          kick(t, o, 120, 55, 0.12, 0.16);
          keyTone(t + 0.02, o, true);
          carrier(t + KEY_TONE_SECONDS + 0.03, o, 0.35, 0.015);
        },

        // Movement: o.hexes crossed at o.step seconds each, o.pan to o.panTo.
        move: function (t, o) {
          var mover = pick(MOVE_SOUND, o.moveType, "movement type");
          mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
        },
        place: function (t, o) {
          kick(t, o, 150, 60, 0.1, 0.18);
          knock(t, o, 0.07);
          burst(t, o, {dur: 0.01, vol: 0.04, crackle: true, hp: [2000], a: 0.001});
        },

        // The calculation before a battle, as telemetry: each machine that
        // lights is a data tone (attacker on the high tone, defender on the
        // low), climbing a little with each one.
        calcMachine: function (t, o) {
          if (o.attacking) beep(t, o, DATA_HIGH + o.index * 40, 0.028, 0.09, {a: 0.002, wave: "reed"});
          else beep(t, o, DATA_LOW + o.index * 30, 0.032, 0.09, {a: 0.002, wave: "reed"});
        },
        calcSupport: function (t, o) {
          if (o.side === "attack") data(t, o, [0, 1, 1], 40, 0.1);
          else if (o.side === "defense") data(t, o, [1, 0, 0], 40, 0.1);
          else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
          knock(t, o, 0.05, 300);
        },
        // o.value is the terrain's defense bonus (0 to 40): bare road ticks,
        // higher ground lands deeper and the confirming tone sits higher.
        calcTerrain: function (t, o) {
          var value = clamp(o.value, 0, 60);
          if (value === 0) { beep(t, o, 900, 0.03, 0.06, {wave: "reed"}); knock(t, o, 0.04, 400); return; }
          var f = 150 - value;
          kick(t, o, f, f * 0.45, 0.2, 0.16 + value / 250);
          knock(t, o, 0.08 + value / 400, 300 - value * 2);
          beep(t + 0.02, o, 700 + value * 25, 0.05, 0.06, {wave: "reed"});
          if (value >= 30) rumble(t, o, 0.14, 0.09, {a: 0.01});
        },
        calcRing: function (t, o) {
          if (o.controlled) {
            beep(t, o, 1800, 0.04, 0.1, {a: 0.002, wave: "bell"});
            knock(t, o, 0.05, 420);
          } else beep(t, o, 480, 0.05, 0.07, {wave: "pulse"});
        },
        // Verdicts: a closed ring sounds the alarm and the hull takes a blow; an open one is a soft pair.
        surround: function (t, o) {
          for (var k = 0; k < 6; k++) beep(t + k * 0.075, o, k % 2 ? 1400 : 1000, 0.07, 0.11, {hold: 0.6, wave: "pulse"});
          impact(t + 0.4, o, 1);
          kick(t + 0.42, o, 70, 26, 0.5, 0.3);
          rumble(t + 0.4, o, 0.4, 0.12, {a: 0.01});
        },
        unsurrounded: function (t, o) {
          chime(t, o, 700, 0.1, 0.07, {hold: 0.5});
          chime(t + 0.1, o, 600, 0.09, 0.05);
        },

        // The battle screen. approach: o.dur seconds of both squads rolling in,
        // engines in the hull first, then on the radio.
        approach: function (t, o) {
          [-0.55, 0.55].forEach(function (pan) {
            rumble(t, o, o.dur, 0.12, {a: o.dur * 0.7, hold: 0.15, pan: pan});
            osc(t, o, {f: 60, to: 110, dur: o.dur, wave: "pulse", vol: 0.07, a: o.dur * 0.7, hold: 0.15,
              bus: "hull", vib: [6, 25], pan: pan});
            osc(t, o, {f: 140, to: 260, dur: o.dur, wave: "sawtooth", vol: 0.05, a: o.dur * 0.7, hold: 0.15,
              lp: [1600], pan: pan});
          });
        },
        // One squad's volley: o.typeId, o.cls, o.strength, o.span (seconds), o.pan.
        fire: function (t, o) {
          var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
          var weapon = pick(WEAPONS, own ? WEAPON_BY_TYPE[o.typeId] : pick(WEAPON_BY_CLASS, o.cls, "unit class"), "weapon");
          var shots = weapon.shots(o.strength), gap = Math.min(weapon.gap, o.span / shots);
          for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * 0.012, o, i);
        },
        // o.size is the share of the squad lost (0 to 1). The hull takes the
        // shock first, the radio picks up the blast a moment later, and a
        // destroyed squad's carrier drops out with a squelch.
        explosion: function (t, o) {
          var size = clamp(o.size, 0.15, 1), tail = 0.3 + 0.5 * size + (o.destroyed ? 0.3 : 0);
          impact(t, o, size);
          kick(t + 0.01, o, 100, 26, 0.3 + 0.45 * size, 0.2 + 0.24 * size);
          punch(t + 0.02, o, 220, 40, 0.2 + 0.3 * size, 0.1 + 0.1 * size, {glide: 0.8});
          rumble(t, o, tail, 0.1 + 0.15 * size, {a: 0.01, hold: 0.3});
          burst(t + 0.05, o, {dur: tail * 0.8, vol: 0.16 + 0.22 * size, lp: [3400, 350], a: 0.003});
          osc(t + 0.05, o, {f: 130, to: 40, dur: 0.25, wave: "sawtooth", vol: 0.08, a: 0.002});
          var debris = 3 + Math.round(size * 6);
          for (var i = 0; i < debris; i++) {
            var at = t + 0.1 + rand() * tail * 0.8;
            burst(at, o, {dur: 0.015 + rand() * 0.03, vol: 0.03 + rand() * 0.03,
              crackle: true, bp: [1500 + rand() * 2000, null, 1.4]});
            if (i % 2) knock(at, o, 0.03 + rand() * 0.03, 250 + rand() * 300);
          }
          if (o.destroyed) {
            kick(t + 0.14, o, 60, 22, 0.8, 0.26);
            rumble(t + 0.14, o, tail, 0.12, {a: 0.05, hold: 0.4});
            squelch(t + tail * 0.6, o, 0.16, 0.1);
          }
        },
        // A volley that cost the target nothing rings off its armour.
        deflect: function (t, o) {
          ring(t, o, 0.08);
          burst(t, o, {dur: 0.015, vol: 0.06, bp: [3000, null, 2], a: 0.001});
          knock(t, o, 0.1, 480);
          punch(t + 0.003, o, 300, 180, 0.05, 0.08);
        },
        // A newly shown experience star; o.rank is the rank reached.
        star: function (t, o) {
          var f = hz(SCALE[clamp(o.rank, 0, SCALE.length - 1)] + 12);
          chime(t, o, f, 0.12, 0.09, {a: 0.002});
          chime(t + 0.1, o, f * 1.5, 0.3, 0.09, {a: 0.002, hold: 0.4});
          bass(t + 0.1, o, SCALE[clamp(o.rank, 0, SCALE.length - 1)] - 24, 0.3, 0.07);
        },

        // Map events
        capture: function (t, o) {
          impact(t, o, 0.5);
          if (o.kind === "base") {
            key(t, o, 0.08);
            call(t + 0.05, o, [0, 2, 4, 7], 0.1, 0.1, 0.5);
            keyTone(t + 0.9, o, false, 0.1);
          } else call(t + 0.05, o, [2, 4, 5], 0.09, 0.09, 0.32);
        },
        repair: function (t, o) {
          burst(t, o, {dur: 0.35, vol: 0.05, bp: [600, 1600, 0.8], a: 0.03, hold: 0.6});
          rumble(t, o, 0.3, 0.05, {a: 0.03, hold: 0.5, lp: [240]});
          call(t, o, [0, 2, 4, 7], 0.07, 0.07, 0.32);
        },
        deploy: function (t, o) {
          kick(t, o, 110, 50, 0.12, 0.22);
          knock(t, o, 0.1, 240);
          burst(t, o, {dur: 0.3, vol: 0.08, hp: [2500, 900], a: 0.03, hold: 0.3});
          osc(t + 0.3, o, {f: 900, to: 1350, glide: 0.8, dur: 0.12, vol: 0.06, wave: "reed"});
        },
        load: function (t, o) {
          key(t, o, 0.06);
          kick(t, o, 200, 100, 0.08, 0.14);
          knock(t, o, 0.07, 360);
          chime(t + 0.08, o, hz(72), 0.05, 0.07);
          chime(t + 0.13, o, hz(79), 0.08, 0.07);
        },
        unload: function (t, o) {
          key(t, o, 0.06);
          kick(t, o, 100, 200, 0.08, 0.14);
          knock(t, o, 0.07, 360);
          chime(t + 0.08, o, hz(79), 0.05, 0.07);
          chime(t + 0.13, o, hz(72), 0.08, 0.07);
        },

        // End of the match: a keyed message from command, or the channel going dead.
        victory: function (t, o) {
          key(t, o, 0.1);
          keyTone(t + 0.02, o, true);
          carrier(t + 0.3, o, 1.6, 0.012);
          impact(t + 0.35, o, 0.8);
          call(t + 0.35, o, [0, 2, 4, 7, 4, 7], 0.13, 0.11, 0.75);
          bass(t + 0.35, o, SCALE[0] - 24, 1.2, 0.12);
          keyTone(t + 1.9, o, false, 0.12);
          squelch(t + 2.16, o, 0.1, 0.06);
        },
        defeat: function (t, o) {
          [4, 2, 1, 0].forEach(function (degree, i) {
            chime(t + i * 0.25, o, hz(SCALE[degree]), 0.3, 0.1, {hold: 0.5});
            bass(t + i * 0.25, o, SCALE[degree] - 24, 0.3, 0.09);
            knock(t + i * 0.25, o, 0.05, 220);
          });
          burst(t + 0.9, o, {dur: 1.2, vol: 0.12, a: 0.4, hold: 0.4, lp: [3400, 600]});
          kick(t + 1.0, o, 70, 24, 1.0, 0.22);
          rumble(t + 1.0, o, 1.0, 0.1, {a: 0.1, hold: 0.5});
          squelch(t + 1.9, o, 0.2, 0.1);
        },
      };

      return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
        weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
    },
  });
})();
