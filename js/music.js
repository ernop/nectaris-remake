/* Nectaris remake — original procedural soundtrack.
 *
 * A compact military chiptune written for this project: square-wave lead,
 * triangle bass and synthesized drum noise. It evokes late-1980s tactical
 * games without copying any Nectaris melody or audio asset. Web Audio is
 * created only after the Music button is pressed, as browsers require.
 */
"use strict";

var MUSIC = (function () {
  var ctx = null;
  var master = null;
  var loopTimer = null;
  var playing = false;
  var tempo = 148;
  var step = 60 / tempo / 4; // sixteenth note
  var stepsPerLoop = 64;

  // Original E-minor march. MIDI note numbers; null means rest.
  var lead = [
    76, null, 79, 76,  83, null, 81, 79,  76, 74, 71, null,  74, null, 76, null,
    79, null, 83, 81,  79, 76, 74, null,  71, 74, 76, 79,  76, null, null, null,
    76, 79, 83, null,  86, null, 83, 81,  79, 81, 79, 76,  74, null, 71, null,
    69, 71, 74, 76,  79, 76, 74, 71,  69, null, 71, 74,  76, null, null, null,
  ];
  var harmony = [
    64, null, null, null,  67, null, null, null,  64, null, 62, null,  59, null, 64, null,
    67, null, null, null,  64, null, 62, null,  59, null, 62, null,  64, null, null, null,
    64, null, 67, null,  71, null, 67, null,  64, null, 67, null,  62, null, 59, null,
    57, null, 59, null,  62, null, 64, null,  57, null, 59, null,  64, null, null, null,
  ];
  var bassRoots = [40, 40, 43, 43, 38, 38, 35, 35, 40, 40, 43, 43, 38, 35, 40, 40];

  function frequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function tone(midi, at, duration, type, volume) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency(midi), at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
    gain.gain.setValueAtTime(volume, at + Math.max(0.01, duration - 0.035));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + duration + 0.01);
  }

  function drum(at, volume, isSnare) {
    var length = Math.floor(ctx.sampleRate * (isSnare ? 0.11 : 0.06));
    var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    // Deterministic pseudo-noise avoids relying on recorded samples.
    var seed = Math.floor(at * 1000) | 1;
    for (var i = 0; i < length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = ((seed / 2147483647) * 2 - 1) * (1 - i / length);
    }
    var source = ctx.createBufferSource();
    var filter = ctx.createBiquadFilter();
    var gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = isSnare ? "bandpass" : "lowpass";
    filter.frequency.value = isSnare ? 1800 : 180;
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + (isSnare ? 0.11 : 0.06));
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(at);
  }

  function scheduleLoop(start) {
    for (var i = 0; i < stepsPerLoop; i++) {
      var at = start + i * step;
      if (lead[i] !== null) tone(lead[i], at, step * 0.78, "square", 0.045);
      if (harmony[i] !== null) tone(harmony[i], at, step * 1.6, "square", 0.018);
      if (i % 4 === 0) {
        var root = bassRoots[Math.floor(i / 4)];
        tone(root, at, step * 3.5, "triangle", 0.12);
        drum(at, 0.11, false);
      }
      if (i % 8 === 4) drum(at, 0.065, true);
      if (i % 2 === 0) drum(at, 0.012, true);
    }
    var durationMs = stepsPerLoop * step * 1000;
    loopTimer = setTimeout(function () {
      if (playing) scheduleLoop(start + stepsPerLoop * step);
    }, durationMs - 900);
  }

  function updateButton() {
    var button = document.getElementById("btn-music");
    if (!button) return;
    button.textContent = playing ? "Music: On" : "Music: Off";
    button.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  function start() {
    if (playing) return;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error("This browser does not provide the Web Audio API.");
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.65;
    master.connect(ctx.destination);
    playing = true;
    localStorage.setItem("nectaris-music", "on");
    scheduleLoop(ctx.currentTime + 0.06);
    updateButton();
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearTimeout(loopTimer);
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.035);
    setTimeout(function () {
      ctx.close();
      ctx = null;
      master = null;
    }, 180);
    localStorage.setItem("nectaris-music", "off");
    updateButton();
  }

  function init() {
    var button = document.getElementById("btn-music");
    if (!button) return;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      button.disabled = true;
      button.textContent = "Music unavailable";
      button.title = "This browser does not provide the Web Audio API.";
      return;
    }
    button.onclick = function () {
      if (playing) stop();
      else start();
    };
    updateButton();
  }

  return { init: init, start: start, stop: stop, isPlaying: function () { return playing; } };
})();
