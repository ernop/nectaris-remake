/* Nectaris remake — original synthesized sound effects.
 *
 * Every sound is built at play time from oscillators, filtered noise and a
 * generated room reverb in Web Audio. No recorded, ripped or sampled audio is
 * used, and nothing copies the original games' sounds; the cues only fill the
 * roles the original's audio filled (a sweep when a turn ends, stepped ticks
 * while a battle is calculated, weapon fire and explosions).
 *
 * More than one soundscape can be registered. This file holds the shared graph
 * and the first set. Another set calls SFX.registerBank({ id, creator, title,
 * description, seed, scale, room, masterGain, build }) from a script loaded
 * after this file and before SFX.init(). build(deps) returns the cues and the
 * movement and weapon tables. The Sound by menu lists creator and title.
 * The choice is kept in localStorage (nectaris-sound-bank).
 *
 * Sound is OFF until the player switches it on with the Sound toggle, and that
 * choice is remembered too. Browsers refuse audio before the first click or
 * key press, so the audio context is created and resumed by that gesture;
 * cues requested earlier are not played, never queued.
 */
"use strict";

var SFX = (function () {
  var KEY = "nectaris-sound";
  var KEY_BANK = "nectaris-sound-bank";
  // The soundscape a player hears until they pick another (user choice, 2026-09-29).
  var DEFAULT_BANK = "fable";
  var enabled = false;
  var held = false;
  var ctx = null, master = null, room = null, roomSend = null, noise = null, waves = null;
  var seed = 20260929;
  var banks = {};
  var bankId = null;
  var bankSpec = null;
  var CUES = null;
  var MOVE_SOUND = null;
  var WEAPONS = null;
  var WEAPON_BY_TYPE = null;
  var WEAPON_BY_CLASS = null;
  var SELECT_PITCH = null;

  // Deterministic noise and jitter: repeated shots differ, but a given
  // session sounds the same on every run.
  function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
  function lerp(a, b, fraction) { return a + (b - a) * fraction; }
  function pick(table, key, what) {
    if (!Object.prototype.hasOwnProperty.call(table, key)) throw new Error("No sound is defined for " + what + " \"" + key + "\".");
    return table[key];
  }

  // Active bank supplies the scale so calculation ticks stay in key.
  var SCALE = [64, 67, 69, 71, 74, 76, 79, 81, 83];

  /* --- audio graph ---------------------------------------------------------- */

  function buildNoise() {
    var length = Math.floor(ctx.sampleRate * 2), buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) data[i] = rand() * 2 - 1;
    return buffer;
  }

  // A decaying noise impulse gives explosions and fanfares a room.
  function buildRoom(options) {
    options = options || {};
    var seconds = options.seconds != null ? options.seconds : 1.3;
    var wetGain = options.wetGain != null ? options.wetGain : 0.55;
    var length = Math.floor(ctx.sampleRate * seconds), impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (var channel = 0; channel < 2; channel++) {
      var data = impulse.getChannelData(channel), smooth = 0;
      for (var i = 0; i < length; i++) {
        smooth += ((rand() * 2 - 1) - smooth) * 0.35;
        data[i] = smooth * Math.pow(1 - i / length, 2.6);
      }
    }
    var convolver = ctx.createConvolver(), wet = ctx.createGain();
    convolver.buffer = impulse;
    wet.gain.value = wetGain;
    convolver.connect(wet);
    // A new bank must replace the previous send. Leaving it connected stacks
    // a reverb on every change of soundscape.
    if (roomSend) roomSend.disconnect();
    wet.connect(master);
    roomSend = wet;
    return convolver;
  }

  // Chip-style wavetables: buzz is a softened sawtooth, hollow keeps only odd
  // harmonics, reed has the strong 2nd to 4th harmonics a wah sweep needs.
  function buildWaves() {
    function wave(amplitudes) {
      var real = new Float32Array(amplitudes.length), imag = new Float32Array(amplitudes.length);
      for (var i = 1; i < amplitudes.length; i++) imag[i] = amplitudes[i];
      return ctx.createPeriodicWave(real, imag);
    }
    var buzz = [0], hollow = [0];
    for (var n = 1; n <= 14; n++) {
      buzz.push(1 / n * (n % 2 ? 1 : 0.5));
      hollow.push(n % 2 ? 1 / Math.pow(n, 1.4) : 0);
    }
    return { buzz: wave(buzz), hollow: wave(hollow), reed: wave([0, 1, 0.7, 0.9, 0.45, 0.3, 0.2, 0.12, 0.08]) };
  }

  function ensure() {
    if (ctx) return;
    var Context = window.AudioContext || window.webkitAudioContext;
    ctx = new Context();
    // Overlapping cues (a volley, three explosions and a chime) share this
    // compressor so the sum cannot clip.
    var limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -16; limiter.knee.value = 10; limiter.ratio.value = 6;
    limiter.attack.value = 0.002; limiter.release.value = 0.2;
    master = ctx.createGain();
    master.connect(limiter);
    limiter.connect(ctx.destination);
    refreshBankAudio();
  }

  var PLAIN_WAVES = { sine: 1, square: 1, sawtooth: 1, triangle: 1 };

  function shape(osc, name) {
    if (Object.prototype.hasOwnProperty.call(waves, name)) osc.setPeriodicWave(waves[name]);
    else if (PLAIN_WAVES[name]) osc.type = name;
    else throw new Error("Unknown waveform \"" + name + "\".");
  }

  // Fast attack, optional flat hold (a fraction of the time after the attack),
  // then an exponential decay to silence at t + dur.
  function envelope(param, t, dur, vol, attack, hold) {
    var end = t + dur;
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + attack);
    if (hold) param.setValueAtTime(Math.max(vol, 0.0002), Math.min(end - 0.005, t + attack + (dur - attack) * hold));
    param.exponentialRampToValueAtTime(0.0001, end);
  }

  // Filters in a fixed order; each spec is [start Hz, optional end Hz, optional Q].
  function chain(node, spec, t, dur) {
    [["hp", "highpass"], ["bp", "bandpass"], ["lp", "lowpass"]].forEach(function (kind) {
      var band = spec[kind[0]];
      if (!band) return;
      var filter = ctx.createBiquadFilter();
      filter.type = kind[1];
      filter.frequency.setValueAtTime(band[0], t);
      if (band[1]) filter.frequency.exponentialRampToValueAtTime(band[1], t + dur);
      filter.Q.value = band[2] || 0.7;
      node.connect(filter);
      node = filter;
    });
    return node;
  }

  // Stereo position (optionally sweeping to panTo) and a reverb send.
  function finish(node, spec, t, dur) {
    var end = node;
    if (spec.pan !== undefined) {
      var panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(spec.pan, t);
      if (spec.panTo !== undefined) panner.pan.linearRampToValueAtTime(spec.panTo, t + dur);
      node.connect(panner);
      end = panner;
    }
    end.connect(master);
    if (spec.wet) {
      var send = ctx.createGain();
      send.gain.value = spec.wet;
      end.connect(send);
      send.connect(room);
    }
  }

  // Pitched voice. spec: t, dur, f (Hz), to (glide target Hz), glide (fraction
  // of dur spent gliding), wave, vol, a (attack s), hold, hp/bp/lp, vib
  // [rate Hz, cents], detune, pan, panTo, wet.
  function tone(spec) {
    var t = spec.t, osc = ctx.createOscillator();
    shape(osc, spec.wave || "sine");
    osc.frequency.setValueAtTime(spec.f, t);
    if (spec.to) osc.frequency.exponentialRampToValueAtTime(spec.to, t + spec.dur * (spec.glide || 1));
    if (spec.detune) osc.detune.value = spec.detune;
    if (spec.vib) {
      var lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = spec.vib[0];
      depth.gain.value = spec.vib[1];
      lfo.connect(depth);
      depth.connect(osc.detune);
      lfo.start(t);
      lfo.stop(t + spec.dur + 0.05);
    }
    var gain = ctx.createGain();
    envelope(gain.gain, t, spec.dur, spec.vol, spec.a || 0.004, spec.hold);
    chain(osc, spec, t, spec.dur).connect(gain);
    finish(gain, spec, t, spec.dur);
    osc.start(t);
    osc.stop(t + spec.dur + 0.05);
  }

  // Filtered noise voice; same spec fields as tone, without pitch.
  function hiss(spec) {
    var t = spec.t, source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    var gain = ctx.createGain();
    envelope(gain.gain, t, spec.dur, spec.vol, spec.a || 0.003, spec.hold);
    chain(source, spec, t, spec.dur).connect(gain);
    finish(gain, spec, t, spec.dur);
    source.start(t, rand() * (noise.duration - 0.05));
    source.stop(t + spec.dur + 0.05);
  }

  // Cue-local shorthands: place a voice at t and inherit the cue's stereo pan.
  function tn(t, o, spec) { spec.t = t; if (spec.pan === undefined) spec.pan = o.pan; tone(spec); }
  function hs(t, o, spec) { spec.t = t; if (spec.pan === undefined) spec.pan = o.pan; hiss(spec); }

  /* --- signature sounds ----------------------------------------------------- */

  // The turn-change wah: two detuned reed voices through a narrow band-pass
  // whose centre swings up and down, over a falling or rising pitch, with a
  // thin wavering whistle above.
  function wah(t, o, spec) {
    [-9, 9].forEach(function (detune) {
      var osc = ctx.createOscillator(), pass = ctx.createBiquadFilter();
      var lfo = ctx.createOscillator(), depth = ctx.createGain(), gain = ctx.createGain();
      osc.setPeriodicWave(waves.reed);
      osc.frequency.setValueAtTime(spec.from, t);
      osc.frequency.exponentialRampToValueAtTime(spec.to, t + spec.dur);
      osc.detune.value = detune;
      pass.type = "bandpass"; pass.Q.value = 6; pass.frequency.value = 1400;
      lfo.frequency.value = spec.cycles / spec.dur;
      depth.gain.value = 1150;
      lfo.connect(depth);
      depth.connect(pass.frequency);
      envelope(gain.gain, t, spec.dur, spec.vol, 0.015, 0.7);
      osc.connect(pass);
      pass.connect(gain);
      finish(gain, { pan: o.pan, wet: 0.22 }, t, spec.dur);
      osc.start(t); lfo.start(t);
      osc.stop(t + spec.dur + 0.05); lfo.stop(t + spec.dur + 0.05);
    });
    tn(t, o, { f: spec.from * 2.7, to: spec.to * 2.7, dur: spec.dur, vol: spec.vol * 0.25,
      vib: [6.5, 35], a: 0.03, hold: 0.6, wet: 0.3 });
  }

  /* --- movement ------------------------------------------------------------- */

  // Each mover: (t, cue options, hexes crossed, seconds per hex, total seconds).
  // The stereo image follows the unit from its first hex to its last.
  function pathPan(o, fraction) { return lerp(o.pan, o.panTo, fraction); }

  function makeDeps() {
    return {tn: tn, hs: hs, tone: tone, hiss: hiss, wah: wah, hz: hz, SCALE: SCALE,
      rand: rand, clamp: clamp, lerp: lerp, pathPan: pathPan, pick: pick,
      // Read at cue time, not build time: a bank may be built before the
      // context exists, and the room is rebuilt when a bank is activated.
      audio: function () { return {ctx: ctx, master: master, room: room}; }};
  }

  function refreshBankAudio() {
    if (!bankSpec) throw new Error("No soundscape is active.");
    seed = bankSpec.seed;
    SCALE = bankSpec.scale.slice();
    if (ctx) {
      noise = buildNoise();
      waves = buildWaves();
      room = buildRoom(bankSpec.room);
      master.gain.value = bankSpec.masterGain != null ? bankSpec.masterGain : 0.85;
    }
    var bundle = bankSpec.build(makeDeps());
    CUES = bundle.cues;
    MOVE_SOUND = bundle.moveSound;
    WEAPONS = bundle.weapons;
    WEAPON_BY_TYPE = bundle.weaponByType;
    WEAPON_BY_CLASS = bundle.weaponByClass;
    SELECT_PITCH = bundle.selectPitch;
  }

  function registerBank(spec) {
    if (!spec || !spec.id || !spec.creator || !spec.build || !spec.scale || spec.seed == null) {
      throw new Error("Soundscape registration requires id, creator, seed, scale and build.");
    }
    banks[spec.id] = spec;
  }

  function activateBank(id) {
    if (!Object.prototype.hasOwnProperty.call(banks, id)) {
      throw new Error("Unknown soundscape \"" + id + "\".");
    }
    bankId = id;
    bankSpec = banks[id];
    refreshBankAudio();
  }

  function buildRemakeBank(d) {
    var tn = d.tn, hs = d.hs, wah = d.wah, hz = d.hz, SCALE = d.SCALE, pick = d.pick;
    var clamp = d.clamp, lerp = d.lerp, pathPan = d.pathPan, rand = d.rand;

  var MOVE_SOUND = {
    foot: function (t, o, n, step) {
      for (var i = 0; i < n; i++) {
        var pan = pathPan(o, (i + 0.5) / n);
        [0.2, 0.7].forEach(function (fraction, k) {
          var at = t + (i + fraction) * step;
          hs(at, o, { dur: 0.045, vol: 0.085, bp: [k ? 750 : 1050, null, 1.3], pan: pan });
          tn(at, o, { f: 95, to: 60, dur: 0.05, vol: 0.05, pan: pan });
        });
      }
    },
    wheels: function (t, o, n, step, dur) {
      tn(t, o, { f: 70, to: 132, glide: 0.4, dur: dur, wave: "sawtooth", vol: 0.1, a: 0.05, hold: 0.75,
        lp: [520, 1100, 1.1], panTo: o.panTo });
      hs(t, o, { dur: dur, vol: 0.06, a: 0.06, hold: 0.75, bp: [700, 1500, 0.8], panTo: o.panTo });
    },
    treads: function (t, o, n, step, dur) {
      tn(t, o, { f: 42, to: 55, glide: 0.5, dur: dur, wave: "sawtooth", vol: 0.16, a: 0.08, hold: 0.8,
        lp: [170, 260, 1], panTo: o.panTo });
      hs(t, o, { dur: dur, vol: 0.05, a: 0.1, hold: 0.8, bp: [220, 300, 0.7], panTo: o.panTo });
      for (var i = 0; i < n; i++) {
        var at = t + (i + 0.5) * step, pan = pathPan(o, (i + 0.5) / n);
        tn(at, o, { f: 100, to: 46, dur: 0.07, vol: 0.09, pan: pan });
        hs(at, o, { dur: 0.03, vol: 0.05, bp: [1500 + (i % 2) * 400, null, 1.4], pan: pan });
      }
      tn(t + dur, o, { f: 90, to: 40, dur: 0.11, vol: 0.14, pan: o.panTo });
    },
    air: function (t, o, n, step, dur) {
      hs(t, o, { dur: dur, vol: 0.13, a: dur * 0.35, hold: 0.5, bp: [380, 2600, 1], panTo: o.panTo });
      tn(t, o, { f: 150, to: 260, dur: dur, wave: "sawtooth", vol: 0.05, a: dur * 0.3, hold: 0.5,
        lp: [600, 1500], panTo: o.panTo, wet: 0.1 });
    },
  };

  /* --- weapons -------------------------------------------------------------- */

  // shots(strength): how many reports one squad fires; gap: longest spacing
  // between them in seconds (tighter when the volley window is short).
  var WEAPONS = {
    rifle: { gap: 0.04, shots: function (n) { return 3 + n; }, shot: function (t, o) {
      hs(t, o, { dur: 0.05, vol: 0.09, bp: [2600, 1600, 1.3] });
      tn(t, o, { f: 1300, to: 380, dur: 0.03, wave: "square", vol: 0.025 });
    } },
    autocannon: { gap: 0.032, shots: function (n) { return 5 + Math.round(n * 1.2); }, shot: function (t, o) {
      hs(t, o, { dur: 0.03, vol: 0.085, hp: [1600] });
      tn(t, o, { f: 340, to: 150, dur: 0.035, wave: "sawtooth", vol: 0.05, lp: [1200] });
    } },
    cannon: { gap: 0.17, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
      tn(t, o, { f: 140, to: 42, dur: 0.2, vol: 0.24, wet: 0.12 });
      hs(t, o, { dur: 0.16, vol: 0.15, lp: [1600, 260] });
      hs(t, o, { dur: 0.012, vol: 0.06, hp: [3000] });
    } },
    heavyCannon: { gap: 0.2, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
      tn(t, o, { f: 100, to: 30, dur: 0.34, vol: 0.3, wet: 0.25 });
      hs(t, o, { dur: 0.28, vol: 0.18, lp: [1200, 180] });
      tn(t + 0.02, o, { f: 210, to: 80, dur: 0.12, wave: "sawtooth", vol: 0.08, lp: [700] });
    } },
    howitzer: { gap: 0.25, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
      tn(t, o, { f: 90, to: 34, dur: 0.32, vol: 0.26, wet: 0.3 });
      hs(t, o, { dur: 0.26, vol: 0.13, lp: [900, 200] });
      tn(t + 0.05, o, { f: 1700, to: 520, dur: 0.34, vol: 0.03 });
    } },
    rockets: { gap: 0.06, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
      hs(t, o, { dur: 0.34, vol: 0.1, a: 0.02, hold: 0.4, bp: [700 + i * 90, 3200, 1.1] });
      tn(t, o, { f: 240, to: 880, dur: 0.3, wave: "sawtooth", vol: 0.04, lp: [900, 2200] });
      hs(t, o, { dur: 0.02, vol: 0.07, bp: [1800, null, 1] });
    } },
    missile: { gap: 0.18, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
      hs(t, o, { dur: 0.44, vol: 0.12, a: 0.05, hold: 0.5, hp: [500, 2800] });
      tn(t, o, { f: 300, to: 1500, dur: 0.4, wave: "buzz", vol: 0.05, lp: [1400, 3500], wet: 0.15 });
      tn(t, o, { f: 120, to: 60, dur: 0.1, vol: 0.14 });
    } },
    mortar: { gap: 0.15, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
      tn(t, o, { f: 210, to: 70, dur: 0.13, vol: 0.18 });
      hs(t, o, { dur: 0.08, vol: 0.08, lp: [600] });
      tn(t + 0.05, o, { f: 1300, to: 700, dur: 0.2, vol: 0.025 });
    } },
    flak: { gap: 0.08, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
      tn(t, o, { f: 240, to: 100, dur: 0.08, wave: "square", vol: 0.1, lp: [1500] });
      hs(t, o, { dur: 0.06, vol: 0.08, bp: [900, null, 1] });
    } },
    pistol: { gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
      hs(t, o, { dur: 0.04, vol: 0.07, bp: [1900, 1200, 1.2] });
      tn(t, o, { f: 700, to: 250, dur: 0.025, wave: "square", vol: 0.02 });
    } },
  };

  // A unit type's own weapon, else its class's. Both tables are exhaustive for
  // the stock roster and for every class a level file may declare.
  var WEAPON_BY_TYPE = { GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
    FALCON: "missile", LYNX: "mortar" };
  var WEAPON_BY_CLASS = { infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
    buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol" };
  var SELECT_PITCH = { foot: 0, wheels: 3, treads: -5, air: 7 };

  /* --- cues ------------------------------------------------------------------ */

  var CUES = {
    // Interface
    switchOn: function (t, o) {
      [5, 6, 8].forEach(function (degree, i) {
        tn(t + i * 0.07, o, { f: hz(SCALE[degree]), dur: 0.11, wave: "buzz", vol: 0.1, wet: 0.15 });
      });
    },
    switchOff: function (t, o) {
      [8, 6, 5].forEach(function (degree, i) {
        tn(t + i * 0.06, o, { f: hz(SCALE[degree]), dur: 0.09, wave: "buzz", vol: 0.08 });
      });
    },
    select: function (t, o) {
      var shift = pick(SELECT_PITCH, o.moveType, "movement type");
      tn(t, o, { f: hz(76 + shift), dur: 0.05, wave: "buzz", vol: 0.09 });
      tn(t + 0.045, o, { f: hz(83 + shift), dur: 0.08, wave: "buzz", vol: 0.09, wet: 0.08 });
    },
    cancel: function (t, o) {
      tn(t, o, { f: hz(79), to: hz(67), dur: 0.09, wave: "triangle", vol: 0.1 });
    },
    deny: function (t, o) {
      [0, 0.11].forEach(function (later) {
        tn(t + later, o, { f: 128, to: 110, dur: 0.08, wave: "square", vol: 0.1, lp: [900] });
      });
    },
    undo: function (t, o) {
      tn(t, o, { f: hz(79), dur: 0.06, wave: "triangle", vol: 0.1 });
      tn(t + 0.06, o, { f: hz(72), dur: 0.09, wave: "triangle", vol: 0.1 });
    },
    redo: function (t, o) {
      tn(t, o, { f: hz(72), dur: 0.06, wave: "triangle", vol: 0.1 });
      tn(t + 0.06, o, { f: hz(79), dur: 0.09, wave: "triangle", vol: 0.1 });
    },
    target: function (t, o) {
      tn(t, o, { f: 1568, dur: 0.035, wave: "buzz", vol: 0.045 });
      hs(t, o, { dur: 0.012, vol: 0.03, hp: [4000] });
    },
    factory: function (t, o) {
      tn(t, o, { f: 220, dur: 0.06, wave: "hollow", vol: 0.1 });
      tn(t + 0.06, o, { f: 330, dur: 0.09, wave: "hollow", vol: 0.1 });
      hs(t, o, { dur: 0.03, vol: 0.05, lp: [900] });
    },

    // Turns: the wah is the signature sound of a turn changing hands.
    turnEnd: function (t, o) { wah(t, o, { dur: 0.95, from: 830, to: 208, cycles: 4.5, vol: 0.3 }); },
    turnStart: function (t, o) {
      wah(t, o, { dur: 0.55, from: 262, to: 740, cycles: 2.5, vol: 0.22 });
      tn(t + 0.5, o, { f: hz(SCALE[5]), dur: 0.14, wave: "buzz", vol: 0.09, wet: 0.2 });
      tn(t + 0.6, o, { f: hz(SCALE[8]), dur: 0.35, wave: "buzz", vol: 0.09, wet: 0.25 });
    },

    // Movement: o.hexes crossed at o.step seconds each, o.pan to o.panTo.
    move: function (t, o) {
      var mover = pick(MOVE_SOUND, o.moveType, "movement type");
      mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
    },
    place: function (t, o) {
      tn(t, o, { f: 130, to: 62, dur: 0.09, vol: 0.13 });
      hs(t, o, { dur: 0.04, vol: 0.06, lp: [800] });
    },

    // The calculation before a battle, in the order the combat board counts it:
    // machines, supporters, terrain, the ring around the target, the verdict.
    // Each machine lighting up ticks one step higher; the attacker's ticks are
    // bright, the defender's hollow, about 30 ms apart.
    calcMachine: function (t, o) {
      var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
      if (o.attacking) tn(t, o, { f: hz(degree + 12), dur: 0.028, wave: "buzz", vol: 0.055 });
      else tn(t, o, { f: hz(degree), dur: 0.03, wave: "hollow", vol: 0.06 });
    },
    calcSupport: function (t, o) {
      var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
      if (o.side === "attack") {
        tn(t, o, { f: hz(degree + 12), dur: 0.05, wave: "buzz", vol: 0.1 });
        tn(t + 0.05, o, { f: hz(degree + 19), dur: 0.09, wave: "buzz", vol: 0.1, wet: 0.1 });
      } else if (o.side === "defense") {
        tn(t, o, { f: hz(degree), to: hz(degree) * 0.94, dur: 0.14, wave: "hollow", vol: 0.14, wet: 0.1 });
      } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
    },
    // o.value is the terrain's defense bonus (0 to 40): bare road ticks, a
    // mountain thuds lower and longer.
    calcTerrain: function (t, o) {
      var value = clamp(o.value, 0, 60);
      if (value === 0) { tn(t, o, { f: 900, dur: 0.03, wave: "triangle", vol: 0.05 }); return; }
      var f = 150 - value;
      tn(t, o, { f: f, to: f * 0.5, dur: 0.16, vol: 0.12 + value / 400 });
      hs(t, o, { dur: 0.09, vol: 0.06 + value / 500, lp: [1100, 300] });
      if (value >= 30) hs(t + 0.05, o, { dur: 0.05, vol: 0.05, bp: [420, null, 2] });
    },
    calcRing: function (t, o) {
      if (o.controlled) {
        tn(t, o, { f: hz(SCALE[o.index % 6] + 12), dur: 0.06, wave: "buzz", vol: 0.1 });
        hs(t, o, { dur: 0.012, vol: 0.035, hp: [3500] });
      } else tn(t, o, { f: 175, to: 150, dur: 0.07, wave: "triangle", vol: 0.09 });
    },
    // Verdicts: a fully controlled ring halves the defender; an open one does not.
    surround: function (t, o) {
      tn(t, o, { f: 1400, to: 90, glide: 0.9, dur: 0.42, wave: "sawtooth", vol: 0.12, lp: [3600, 240, 2], wet: 0.25 });
      tn(t, o, { f: 700, to: 45, dur: 0.42, wave: "square", vol: 0.06, lp: [2000, 200], detune: 14 });
      hs(t + 0.02, o, { dur: 0.3, vol: 0.09, bp: [2800, 300, 1.2] });
      tn(t + 0.36, o, { f: 72, to: 34, dur: 0.35, vol: 0.28, wet: 0.2 });
    },
    unsurrounded: function (t, o) {
      tn(t, o, { f: 330, to: 262, dur: 0.12, wave: "hollow", vol: 0.08 });
    },

    // The battle screen. approach: o.dur seconds of both squads rolling in.
    approach: function (t, o) {
      [-0.55, 0.55].forEach(function (pan) {
        hs(t, o, { dur: o.dur, vol: 0.08, a: o.dur * 0.8, hold: 0.1, bp: [250, 1200, 1], pan: pan });
        tn(t, o, { f: 60, to: 130, dur: o.dur, wave: "sawtooth", vol: 0.05, a: o.dur * 0.8, hold: 0.1,
          lp: [300, 700], pan: pan });
      });
    },
    // One squad's volley: o.typeId, o.cls, o.strength, o.span (seconds), o.pan.
    fire: function (t, o) {
      var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
      var weapon = pick(WEAPONS, own ? WEAPON_BY_TYPE[o.typeId] : pick(WEAPON_BY_CLASS, o.cls, "unit class"), "weapon");
      var shots = weapon.shots(o.strength), gap = Math.min(weapon.gap, o.span / shots);
      for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * 0.012, o, i);
    },
    // o.size is the share of the squad lost (0 to 1); o.destroyed adds a long tail.
    explosion: function (t, o) {
      var size = clamp(o.size, 0.15, 1), tail = 0.25 + 0.55 * size + (o.destroyed ? 0.35 : 0);
      hs(t, o, { dur: tail, vol: 0.12 + 0.2 * size, a: 0.004, lp: [3400, 110, 0.9], wet: 0.2 + 0.25 * size });
      tn(t, o, { f: 110, to: 30, dur: 0.22 + 0.4 * size, vol: 0.14 + 0.24 * size });
      hs(t, o, { dur: 0.05, vol: 0.06 + 0.05 * size, hp: [2500] });
      var debris = 2 + Math.round(size * 7 + (o.destroyed ? 3 : 0));
      for (var i = 0; i < debris; i++) {
        hs(t + 0.08 + rand() * tail * 0.9, o, { dur: 0.02 + rand() * 0.04, vol: 0.03 + rand() * 0.04,
          bp: [1800 + rand() * 3000, null, 1.5] });
      }
      if (o.destroyed) tn(t + 0.11, o, { f: 66, to: 26, dur: 0.6, vol: 0.2, wet: 0.35 });
    },
    // A volley that cost the target nothing rings off its armour.
    deflect: function (t, o) {
      tn(t, o, { f: 1900, dur: 0.26, vol: 0.07, a: 0.002 });
      tn(t, o, { f: 2870, dur: 0.18, vol: 0.045, a: 0.002 });
      tn(t, o, { f: 2140, dur: 0.14, vol: 0.03, a: 0.002 });
      hs(t, o, { dur: 0.02, vol: 0.06, bp: [3200, null, 2] });
      tn(t + 0.01, o, { f: 90, to: 60, dur: 0.08, vol: 0.09 });
    },
    // A newly shown experience star; o.rank is the rank reached.
    star: function (t, o) {
      var f = hz(SCALE[clamp(o.rank, 0, SCALE.length - 1)] + 12);
      tn(t, o, { f: f, dur: 0.55, vol: 0.09, a: 0.002, wet: 0.35 });
      tn(t, o, { f: f * 2.76, dur: 0.3, vol: 0.03, a: 0.002, wet: 0.3 });
    },

    // Map events
    capture: function (t, o) {
      var degrees = o.kind === "base" ? [0, 2, 4, 5, 7] : [3, 4, 5, 6];
      hs(t, o, { dur: 0.09, vol: 0.1, bp: [1500, 300, 1] });
      tn(t, o, { f: 90, to: 50, dur: 0.25, vol: 0.2 });
      degrees.forEach(function (degree, i) {
        tn(t + 0.05 + i * 0.085, o, { f: hz(SCALE[degree] + 12), dur: i === degrees.length - 1 ? 0.6 : 0.11,
          wave: "buzz", vol: 0.1, wet: 0.18 });
      });
    },
    repair: function (t, o) {
      for (var i = 0; i < 6; i++) tn(t + i * 0.055, o, { f: hz(SCALE[i] + 12), dur: 0.16, wave: "triangle", vol: 0.07, wet: 0.2 });
      tn(t + 0.33, o, { f: hz(88), dur: 0.4, vol: 0.04, wet: 0.3 });
    },
    deploy: function (t, o) {
      hs(t, o, { dur: 0.32, vol: 0.09, a: 0.04, hold: 0.3, hp: [3200, 900, 0.9] });
      tn(t + 0.27, o, { f: 105, to: 52, dur: 0.12, vol: 0.2 });
      hs(t + 0.27, o, { dur: 0.03, vol: 0.07, bp: [900, null, 1.5] });
      tn(t + 0.36, o, { f: 440, to: 880, glide: 0.8, dur: 0.14, wave: "buzz", vol: 0.06 });
    },
    load: function (t, o) {
      hs(t, o, { dur: 0.02, vol: 0.08, bp: [2400, null, 2] });
      tn(t, o, { f: 230, to: 110, dur: 0.1, vol: 0.14 });
      tn(t + 0.09, o, { f: hz(72), dur: 0.06, wave: "buzz", vol: 0.07 });
      tn(t + 0.14, o, { f: hz(79), dur: 0.08, wave: "buzz", vol: 0.07 });
    },
    unload: function (t, o) {
      hs(t, o, { dur: 0.02, vol: 0.08, bp: [2400, null, 2] });
      tn(t, o, { f: 110, to: 230, dur: 0.1, vol: 0.14 });
      tn(t + 0.09, o, { f: hz(79), dur: 0.06, wave: "buzz", vol: 0.07 });
      tn(t + 0.14, o, { f: hz(72), dur: 0.08, wave: "buzz", vol: 0.07 });
    },

    // End of the match
    victory: function (t, o) {
      [0, 2, 4, 5].forEach(function (degree, i) {
        tn(t + i * 0.12, o, { f: hz(SCALE[degree] + 12), dur: 0.14, wave: "buzz", vol: 0.11, wet: 0.2 });
      });
      [5, 6, 8].forEach(function (degree) {
        tn(t + 0.5, o, { f: hz(SCALE[degree]), dur: 1.3, wave: "hollow", vol: 0.09, a: 0.01, hold: 0.6,
          wet: 0.3, vib: [5.5, 12] });
      });
      tn(t + 0.48, o, { f: 98, to: 49, dur: 0.4, vol: 0.26 });
      hs(t + 0.48, o, { dur: 0.25, vol: 0.1, lp: [2500, 300] });
    },
    defeat: function (t, o) {
      [5, 4, 2, 0].forEach(function (degree, i) {
        tn(t + i * 0.24, o, { f: hz(SCALE[degree]), dur: 0.3, wave: "hollow", vol: 0.12, lp: [2500], wet: 0.25 });
      });
      wah(t + 0.95, o, { dur: 1.3, from: 330, to: 82, cycles: 3, vol: 0.16 });
      tn(t + 0.95, o, { f: 82.4, dur: 1.4, wave: "sawtooth", vol: 0.07, lp: [240], a: 0.05, hold: 0.6 });
    },
  };

    return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
      weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
  }

  registerBank({
    id: "remake",
    creator: "Remake team",
    title: "Tactical synth",
    description: "Chip-style wah sweeps and pentatonic battle ticks tuned to the procedural soundtrack.",
    seed: 20260929,
    scale: [64, 67, 69, 71, 74, 76, 79, 81, 83],
    room: {seconds: 1.3, wetGain: 0.55},
    masterGain: 0.85,
    build: buildRemakeBank,
  });

  /* --- Opus soundscape: Echoes of Void ---------------------------------------
   *
   * An ethereal, space-atmospheric soundscape. Phrygian mode gives a darker,
   * more mysterious harmonic palette. Longer reverb tails create a sense of
   * vast emptiness. Bell-like interface tones, whooshing movement, and deep
   * sub-bass explosions evoke lunar desolation.
   */
  function buildOpusBank(d) {
    var tn = d.tn, hs = d.hs, tone = d.tone, hiss = d.hiss, hz = d.hz, SCALE = d.SCALE;
    var pick = d.pick, clamp = d.clamp, lerp = d.lerp, pathPan = d.pathPan, rand = d.rand;

    // Bell-like shimmer: two detuned sines with slow attack, long decay
    function bell(t, o, freq, dur, vol) {
      tn(t, o, {f: freq, dur: dur, vol: vol, a: 0.008, wave: "sine", wet: 0.5});
      tn(t, o, {f: freq * 2.0, dur: dur * 0.7, vol: vol * 0.3, a: 0.01, wave: "sine", wet: 0.4});
      tn(t, o, {f: freq * 3.01, dur: dur * 0.5, vol: vol * 0.15, a: 0.015, wave: "sine", wet: 0.35});
    }

    // Ethereal sweep: sine glide with heavy reverb, for turn transitions
    function voidSweep(t, o, spec) {
      tn(t, o, {f: spec.from, to: spec.to, dur: spec.dur, vol: spec.vol * 0.6, a: 0.02, hold: 0.6,
        wave: "sine", wet: 0.6, vib: [3, 20]});
      tn(t, o, {f: spec.from * 1.5, to: spec.to * 1.5, dur: spec.dur * 0.8, vol: spec.vol * 0.25,
        a: 0.03, hold: 0.5, wave: "triangle", wet: 0.5});
      hs(t, o, {dur: spec.dur, vol: spec.vol * 0.15, a: 0.1, hold: 0.5, lp: [1200, 300], wet: 0.4});
    }

    var MOVE_SOUND = {
      foot: function (t, o, n, step) {
        // Soft footfalls with metallic suit clinks
        for (var i = 0; i < n; i++) {
          var pan = pathPan(o, (i + 0.5) / n);
          var at = t + (i + 0.5) * step;
          hs(at, o, {dur: 0.06, vol: 0.06, bp: [600, 400, 1.5], pan: pan});
          tn(at + 0.02, o, {f: 2200 + rand() * 800, dur: 0.03, vol: 0.025, wave: "sine", pan: pan, wet: 0.3});
        }
      },
      wheels: function (t, o, n, step, dur) {
        // Electric hum with tire roll
        tn(t, o, {f: 80, to: 140, glide: 0.5, dur: dur, wave: "sine", vol: 0.08, a: 0.08, hold: 0.7,
          lp: [400], panTo: o.panTo});
        hs(t, o, {dur: dur, vol: 0.05, a: 0.1, hold: 0.7, bp: [400, 900, 0.9], panTo: o.panTo});
      },
      treads: function (t, o, n, step, dur) {
        // Deep rumble with metallic clatter
        tn(t, o, {f: 35, to: 50, dur: dur, wave: "sine", vol: 0.14, a: 0.12, hold: 0.75, panTo: o.panTo});
        hs(t, o, {dur: dur, vol: 0.06, a: 0.15, hold: 0.7, bp: [150, 250, 0.8], panTo: o.panTo});
        for (var i = 0; i < n; i++) {
          var at = t + (i + 0.5) * step, pan = pathPan(o, (i + 0.5) / n);
          tn(at, o, {f: 120, to: 55, dur: 0.08, vol: 0.07, pan: pan});
          hs(at, o, {dur: 0.025, vol: 0.04, hp: [1200], pan: pan});
        }
      },
      air: function (t, o, n, step, dur) {
        // Whooshing wind with engine whine
        hs(t, o, {dur: dur, vol: 0.15, a: dur * 0.4, hold: 0.4, bp: [500, 3000, 0.8], panTo: o.panTo, wet: 0.2});
        tn(t, o, {f: 200, to: 350, dur: dur, wave: "sine", vol: 0.04, a: dur * 0.35, hold: 0.4,
          lp: [800, 1800], panTo: o.panTo, vib: [8, 15]});
      },
    };

    var WEAPONS = {
      rifle: {gap: 0.045, shots: function (n) { return 3 + n; }, shot: function (t, o) {
        // Sharp crack with echo
        hs(t, o, {dur: 0.035, vol: 0.08, bp: [3000, 1800, 1.5]});
        tn(t, o, {f: 1800, to: 500, dur: 0.025, wave: "triangle", vol: 0.03, wet: 0.25});
      }},
      autocannon: {gap: 0.028, shots: function (n) { return 5 + Math.round(n * 1.2); }, shot: function (t, o) {
        hs(t, o, {dur: 0.025, vol: 0.07, hp: [2000]});
        tn(t, o, {f: 400, to: 180, dur: 0.03, wave: "sawtooth", vol: 0.04, lp: [1400]});
      }},
      cannon: {gap: 0.18, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
        // Deep boom with metallic ring
        tn(t, o, {f: 100, to: 32, dur: 0.3, vol: 0.28, wet: 0.2});
        hs(t, o, {dur: 0.2, vol: 0.14, lp: [1800, 200]});
        tn(t + 0.01, o, {f: 800, dur: 0.15, vol: 0.04, wave: "sine", wet: 0.35});
      }},
      heavyCannon: {gap: 0.22, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
        tn(t, o, {f: 70, to: 22, dur: 0.45, vol: 0.35, wet: 0.35});
        hs(t, o, {dur: 0.35, vol: 0.2, lp: [1000, 120]});
        tn(t + 0.03, o, {f: 180, to: 60, dur: 0.2, wave: "sine", vol: 0.1});
      }},
      howitzer: {gap: 0.28, shots: function (n) { return 1 + Math.floor(n / 5); }, shot: function (t, o) {
        // Distant thunder
        tn(t, o, {f: 75, to: 28, dur: 0.4, vol: 0.3, wet: 0.45});
        hs(t, o, {dur: 0.32, vol: 0.12, lp: [700, 150], wet: 0.3});
        tn(t + 0.08, o, {f: 1400, to: 400, dur: 0.4, vol: 0.025, wet: 0.4});
      }},
      rockets: {gap: 0.07, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o, i) {
        // Hissing launch with roar
        hs(t, o, {dur: 0.4, vol: 0.12, a: 0.015, hold: 0.35, bp: [800 + i * 100, 3500, 1.2]});
        tn(t, o, {f: 280, to: 1000, dur: 0.35, wave: "sawtooth", vol: 0.04, lp: [1000, 2400]});
      }},
      missile: {gap: 0.2, shots: function (n) { return 1 + Math.floor(n / 6); }, shot: function (t, o) {
        hs(t, o, {dur: 0.5, vol: 0.13, a: 0.06, hold: 0.45, hp: [600, 3200]});
        tn(t, o, {f: 350, to: 1800, dur: 0.45, wave: "hollow", vol: 0.05, lp: [1600, 4000], wet: 0.2});
        tn(t, o, {f: 100, to: 50, dur: 0.12, vol: 0.15});
      }},
      mortar: {gap: 0.16, shots: function (n) { return 1 + Math.floor(n / 4); }, shot: function (t, o) {
        // Thump and whistle
        tn(t, o, {f: 180, to: 60, dur: 0.15, vol: 0.2});
        hs(t, o, {dur: 0.1, vol: 0.07, lp: [500]});
        tn(t + 0.06, o, {f: 1500, to: 800, dur: 0.25, vol: 0.02, wet: 0.3});
      }},
      flak: {gap: 0.09, shots: function (n) { return 2 + Math.floor(n / 2); }, shot: function (t, o) {
        tn(t, o, {f: 280, to: 120, dur: 0.07, wave: "square", vol: 0.09, lp: [1600]});
        hs(t, o, {dur: 0.05, vol: 0.07, bp: [1100, null, 1.2]});
      }},
      pistol: {gap: 0.08, shots: function (n) { return 2 + Math.floor(n / 3); }, shot: function (t, o) {
        hs(t, o, {dur: 0.035, vol: 0.06, bp: [2200, 1400, 1.3]});
        tn(t, o, {f: 800, to: 300, dur: 0.02, wave: "triangle", vol: 0.02});
      }},
    };

    var WEAPON_BY_TYPE = {GIANT: "heavyCannon", OCTOPUS: "rockets", ATLAS: "missile", HAWKEYE: "missile",
      FALCON: "missile", LYNX: "mortar"};
    var WEAPON_BY_CLASS = {infantry: "rifle", tank: "cannon", air: "autocannon", artillery: "howitzer",
      buggy: "autocannon", antiair: "flak", transport: "pistol", mine: "pistol"};
    var SELECT_PITCH = {foot: 0, wheels: 4, treads: -4, air: 8};

    var CUES = {
      // Interface: crystalline bell tones
      switchOn: function (t, o) {
        [4, 6, 8].forEach(function (degree, i) {
          bell(t + i * 0.09, o, hz(SCALE[degree] + 12), 0.4, 0.08);
        });
      },
      switchOff: function (t, o) {
        [8, 6, 4].forEach(function (degree, i) {
          tn(t + i * 0.07, o, {f: hz(SCALE[degree]), dur: 0.12, wave: "sine", vol: 0.06, wet: 0.3});
        });
      },
      select: function (t, o) {
        var shift = pick(SELECT_PITCH, o.moveType, "movement type");
        bell(t, o, hz(78 + shift), 0.15, 0.08);
        tn(t + 0.06, o, {f: hz(85 + shift), dur: 0.12, wave: "sine", vol: 0.06, wet: 0.25});
      },
      cancel: function (t, o) {
        tn(t, o, {f: hz(77), to: hz(65), dur: 0.12, wave: "sine", vol: 0.09, wet: 0.2});
      },
      deny: function (t, o) {
        [0, 0.12].forEach(function (later) {
          tn(t + later, o, {f: 110, to: 95, dur: 0.1, wave: "triangle", vol: 0.09, lp: [700], wet: 0.15});
        });
      },
      undo: function (t, o) {
        tn(t, o, {f: hz(77), dur: 0.08, wave: "sine", vol: 0.08, wet: 0.2});
        tn(t + 0.07, o, {f: hz(70), dur: 0.12, wave: "sine", vol: 0.08, wet: 0.25});
      },
      redo: function (t, o) {
        tn(t, o, {f: hz(70), dur: 0.08, wave: "sine", vol: 0.08, wet: 0.2});
        tn(t + 0.07, o, {f: hz(77), dur: 0.12, wave: "sine", vol: 0.08, wet: 0.25});
      },
      target: function (t, o) {
        tn(t, o, {f: 1800, dur: 0.04, wave: "sine", vol: 0.04, wet: 0.2});
        hs(t, o, {dur: 0.015, vol: 0.025, hp: [4500]});
      },
      factory: function (t, o) {
        bell(t, o, 260, 0.2, 0.08);
        tn(t + 0.08, o, {f: 390, dur: 0.15, wave: "sine", vol: 0.07, wet: 0.3});
      },

      // Turns: ethereal sweeps
      turnEnd: function (t, o) {
        voidSweep(t, o, {dur: 1.1, from: 700, to: 175, vol: 0.28});
      },
      turnStart: function (t, o) {
        voidSweep(t, o, {dur: 0.65, from: 220, to: 620, vol: 0.22});
        bell(t + 0.55, o, hz(SCALE[5] + 12), 0.5, 0.07);
        bell(t + 0.7, o, hz(SCALE[8] + 12), 0.6, 0.07);
      },

      // Movement
      move: function (t, o) {
        var mover = pick(MOVE_SOUND, o.moveType, "movement type");
        mover(t, o, o.hexes, o.step, Math.max(0.15, o.hexes * o.step));
      },
      place: function (t, o) {
        tn(t, o, {f: 110, to: 55, dur: 0.1, vol: 0.12, wet: 0.2});
        hs(t, o, {dur: 0.05, vol: 0.05, lp: [700]});
      },

      // Calculation: chiming glass tones
      calcMachine: function (t, o) {
        var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
        if (o.attacking) {
          tn(t, o, {f: hz(degree + 12), dur: 0.05, wave: "sine", vol: 0.055, wet: 0.25});
        } else {
          tn(t, o, {f: hz(degree), dur: 0.055, wave: "triangle", vol: 0.05, wet: 0.2});
        }
      },
      calcSupport: function (t, o) {
        var degree = SCALE[Math.min(o.index, SCALE.length - 1)];
        if (o.side === "attack") {
          bell(t, o, hz(degree + 12), 0.15, 0.08);
        } else if (o.side === "defense") {
          tn(t, o, {f: hz(degree), to: hz(degree) * 0.92, dur: 0.18, wave: "triangle", vol: 0.12, wet: 0.2});
        } else throw new Error("Support side must be attack or defense, not \"" + o.side + "\".");
      },
      calcTerrain: function (t, o) {
        var value = clamp(o.value, 0, 60);
        if (value === 0) {
          tn(t, o, {f: 1000, dur: 0.035, wave: "sine", vol: 0.04, wet: 0.15});
          return;
        }
        var f = 140 - value;
        tn(t, o, {f: f, to: f * 0.45, dur: 0.2, vol: 0.11 + value / 450, wet: 0.25});
        hs(t, o, {dur: 0.1, vol: 0.05 + value / 550, lp: [900, 250]});
      },
      calcRing: function (t, o) {
        if (o.controlled) {
          tn(t, o, {f: hz(SCALE[o.index % 6] + 12), dur: 0.08, wave: "sine", vol: 0.08, wet: 0.2});
        } else {
          tn(t, o, {f: 160, to: 140, dur: 0.08, wave: "triangle", vol: 0.07, wet: 0.15});
        }
      },
      surround: function (t, o) {
        // Ominous descending sweep
        tn(t, o, {f: 1200, to: 70, glide: 0.85, dur: 0.5, wave: "sine", vol: 0.14, wet: 0.4});
        tn(t, o, {f: 600, to: 35, dur: 0.5, wave: "triangle", vol: 0.07, detune: 10, wet: 0.35});
        hs(t + 0.03, o, {dur: 0.35, vol: 0.08, bp: [2400, 250, 1.3]});
        tn(t + 0.4, o, {f: 60, to: 28, dur: 0.4, vol: 0.3, wet: 0.3});
      },
      unsurrounded: function (t, o) {
        tn(t, o, {f: 300, to: 240, dur: 0.14, wave: "sine", vol: 0.07, wet: 0.2});
      },

      // Battle screen
      approach: function (t, o) {
        [-0.55, 0.55].forEach(function (pan) {
          hs(t, o, {dur: o.dur, vol: 0.07, a: o.dur * 0.75, hold: 0.15, bp: [200, 1000, 0.9], pan: pan});
          tn(t, o, {f: 50, to: 110, dur: o.dur, wave: "sine", vol: 0.04, a: o.dur * 0.7, hold: 0.15,
            lp: [250, 600], pan: pan});
        });
      },
      fire: function (t, o) {
        var own = Object.prototype.hasOwnProperty.call(WEAPON_BY_TYPE, o.typeId);
        var weapon = pick(WEAPONS, own ? WEAPON_BY_TYPE[o.typeId] : pick(WEAPON_BY_CLASS, o.cls, "unit class"), "weapon");
        var shots = weapon.shots(o.strength), gap = Math.min(weapon.gap, o.span / shots);
        for (var i = 0; i < shots; i++) weapon.shot(t + i * gap + rand() * 0.015, o, i);
      },
      explosion: function (t, o) {
        // Deep sub-bass with debris
        var size = clamp(o.size, 0.15, 1), tail = 0.3 + 0.6 * size + (o.destroyed ? 0.4 : 0);
        hs(t, o, {dur: tail, vol: 0.14 + 0.22 * size, a: 0.005, lp: [2800, 80, 0.85], wet: 0.3 + 0.25 * size});
        tn(t, o, {f: 90, to: 22, dur: 0.28 + 0.45 * size, vol: 0.16 + 0.28 * size});
        hs(t, o, {dur: 0.06, vol: 0.05 + 0.05 * size, hp: [2800]});
        var debris = 2 + Math.round(size * 8 + (o.destroyed ? 4 : 0));
        for (var i = 0; i < debris; i++) {
          hs(t + 0.1 + rand() * tail * 0.85, o, {dur: 0.025 + rand() * 0.05, vol: 0.025 + rand() * 0.035,
            bp: [2000 + rand() * 3500, null, 1.6]});
        }
        if (o.destroyed) tn(t + 0.14, o, {f: 55, to: 20, dur: 0.7, vol: 0.22, wet: 0.45});
      },
      deflect: function (t, o) {
        // Metallic ping
        tn(t, o, {f: 2200, dur: 0.3, vol: 0.06, a: 0.002, wet: 0.35});
        tn(t, o, {f: 3100, dur: 0.2, vol: 0.04, a: 0.002, wet: 0.3});
        tn(t, o, {f: 2500, dur: 0.16, vol: 0.025, a: 0.002, wet: 0.25});
        tn(t + 0.015, o, {f: 80, to: 50, dur: 0.09, vol: 0.08});
      },
      star: function (t, o) {
        var f = hz(SCALE[clamp(o.rank, 0, SCALE.length - 1)] + 12);
        bell(t, o, f, 0.7, 0.08);
        tn(t, o, {f: f * 2.5, dur: 0.4, vol: 0.025, a: 0.002, wet: 0.4});
      },

      // Map events
      capture: function (t, o) {
        var degrees = o.kind === "base" ? [0, 2, 4, 5, 7] : [3, 4, 5, 6];
        hs(t, o, {dur: 0.1, vol: 0.09, bp: [1300, 250, 1], wet: 0.2});
        tn(t, o, {f: 80, to: 40, dur: 0.3, vol: 0.2});
        degrees.forEach(function (degree, i) {
          bell(t + 0.06 + i * 0.1, o, hz(SCALE[degree] + 12), i === degrees.length - 1 ? 0.7 : 0.2, 0.09);
        });
      },
      repair: function (t, o) {
        for (var i = 0; i < 6; i++) {
          tn(t + i * 0.06, o, {f: hz(SCALE[i] + 12), dur: 0.2, wave: "sine", vol: 0.06, wet: 0.3});
        }
        tn(t + 0.36, o, {f: hz(88), dur: 0.5, vol: 0.035, wet: 0.4});
      },
      deploy: function (t, o) {
        hs(t, o, {dur: 0.35, vol: 0.08, a: 0.05, hold: 0.25, hp: [2800, 700, 0.9]});
        tn(t + 0.3, o, {f: 95, to: 45, dur: 0.14, vol: 0.2});
        tn(t + 0.38, o, {f: 400, to: 800, glide: 0.8, dur: 0.16, wave: "sine", vol: 0.05, wet: 0.25});
      },
      load: function (t, o) {
        hs(t, o, {dur: 0.025, vol: 0.07, bp: [2200, null, 2]});
        tn(t, o, {f: 210, to: 100, dur: 0.12, vol: 0.13});
        bell(t + 0.1, o, hz(72), 0.15, 0.06);
      },
      unload: function (t, o) {
        hs(t, o, {dur: 0.025, vol: 0.07, bp: [2200, null, 2]});
        tn(t, o, {f: 100, to: 210, dur: 0.12, vol: 0.13});
        bell(t + 0.1, o, hz(77), 0.15, 0.06);
      },

      // End of match
      victory: function (t, o) {
        [0, 2, 4, 5].forEach(function (degree, i) {
          bell(t + i * 0.14, o, hz(SCALE[degree] + 12), 0.3, 0.1);
        });
        [5, 7, 8].forEach(function (degree) {
          tn(t + 0.6, o, {f: hz(SCALE[degree] + 12), dur: 1.5, wave: "sine", vol: 0.08, a: 0.015, hold: 0.55,
            wet: 0.45, vib: [4.5, 10]});
        });
        tn(t + 0.55, o, {f: 90, to: 45, dur: 0.5, vol: 0.28, wet: 0.3});
        hs(t + 0.55, o, {dur: 0.3, vol: 0.09, lp: [2200, 250]});
      },
      defeat: function (t, o) {
        [5, 4, 2, 0].forEach(function (degree, i) {
          tn(t + i * 0.28, o, {f: hz(SCALE[degree]), dur: 0.4, wave: "sine", vol: 0.1, wet: 0.35});
        });
        voidSweep(t + 1.1, o, {dur: 1.4, from: 280, to: 70, vol: 0.18});
        tn(t + 1.1, o, {f: 70, dur: 1.5, wave: "sine", vol: 0.06, lp: [200], a: 0.06, hold: 0.55, wet: 0.4});
      },
    };

    return {cues: CUES, moveSound: MOVE_SOUND, weapons: WEAPONS, weaponByType: WEAPON_BY_TYPE,
      weaponByClass: WEAPON_BY_CLASS, selectPitch: SELECT_PITCH};
  }

  registerBank({
    id: "opus",
    creator: "Opus",
    title: "Echoes of Void",
    description: "Ethereal, space-atmospheric soundscape: Phrygian bells, deep sub-bass, and vast reverb.",
    seed: 20260929,
    scale: [64, 65, 67, 69, 71, 72, 74, 76],  // E Phrygian
    room: {seconds: 2.0, wetGain: 0.65},
    masterGain: 0.82,
    build: buildOpusBank,
  });

  /* --- control --------------------------------------------------------------- */

  function paint() {
    var button = document.getElementById("btn-sound");
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
  }

  // The first click or key press after page load opens the audio context.
  function unlock() {
    if (!enabled) return;
    ensure();
    if (ctx.state === "suspended" && !held) ctx.resume();
  }

  function setEnabled(on) {
    if (on === enabled) return;
    if (on) {
      enabled = true;
      ensure();
      var ready = ctx.state === "running" ? Promise.resolve() : ctx.resume();
      ready.then(function () { play("switchOn"); });
    } else {
      play("switchOff");
      enabled = false;
    }
    localStorage.setItem(KEY, enabled ? "on" : "off");
    paint();
  }

  function play(name, options) {
    var cue = CUES[name];
    if (!cue) throw new Error("Unknown sound cue \"" + name + "\".");
    if (!enabled || !ctx || ctx.state !== "running") return;
    var o = options || {};
    cue(ctx.currentTime + 0.01 + (o.delay || 0), o);
  }

  // Pausing a battle freezes its sounds in place; resuming continues them.
  function hold(paused) {
    if (paused === held) return;
    held = paused;
    if (!ctx) return;
    if (paused) ctx.suspend(); else ctx.resume();
  }

  function fillBankSelect() {
    var select = document.getElementById("sound-bank-select");
    if (!select) return;
    select.replaceChildren();
    Object.keys(banks).forEach(function (id) {
      var bank = banks[id];
      var option = document.createElement("option");
      option.value = id;
      option.textContent = bank.creator + (bank.title ? " — " + bank.title : "");
      if (bank.description) option.title = bank.description;
      select.appendChild(option);
    });
    select.value = bankId;
    select.onchange = function () {
      activateBank(select.value);
      localStorage.setItem(KEY_BANK, bankId);
      if (enabled && ctx && ctx.state === "running") play("switchOn");
    };
  }

  function init() {
    var button = document.getElementById("btn-sound");
    if (!(window.AudioContext || window.webkitAudioContext)) {
      button.disabled = true;
      button.textContent = "Sound unavailable";
      button.title = "This browser does not provide the Web Audio API.";
      return;
    }
    var savedBank = localStorage.getItem(KEY_BANK) || DEFAULT_BANK;
    if (!Object.prototype.hasOwnProperty.call(banks, savedBank)) savedBank = DEFAULT_BANK;
    activateBank(savedBank);
    fillBankSelect();
    enabled = localStorage.getItem(KEY) === "on";
    button.onclick = function () { setEnabled(!enabled); };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    paint();
  }

  return {init: init, play: play, hold: hold, registerBank: registerBank, activateBank: activateBank,
    isEnabled: function () { return enabled; }, setEnabled: setEnabled,
    listBanks: function () { return Object.keys(banks).map(function (id) {
      var bank = banks[id];
      return {id: id, creator: bank.creator, title: bank.title, description: bank.description};
    }); }};
})();

if (typeof module !== "undefined") module.exports = SFX;
