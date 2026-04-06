// Audio synthesis engine for the multi-device choir.
// Depends on: song-data.js (SONG global must be loaded first)
//
// Usage:
//   const engine = new AudioEngine();
//   await engine.init();           // creates AudioContext (call after user gesture)
//   engine.setPart('Soprano');
//   engine.setOffsetMs(offsetMs);  // from clock-sync
//   engine.setGain(0.6);
//   engine.setOctave(0);           // -1, 0, or +1
//   engine.play(playAtServerMs);   // schedule entire part
//   engine.stop();

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.part = 'Soprano';
    this.offsetMs = 0;   // client - server, from clock-sync
    this.gain = 0.8;
    this.octave = 0;     // frequency multiplier: 2^octave
    this.scheduledNodes = [];
    this.masterGain = null;
    this.playing = false;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.gain;
    this.masterGain.connect(this.ctx.destination);

    // Resume if browser started it suspended
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setPart(part) {
    this.part = part;
  }

  setOffsetMs(ms) {
    this.offsetMs = ms;
  }

  setGain(value) {
    this.gain = value;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
    }
  }

  setOctave(octave) {
    this.octave = octave;
  }

  // playAtServerMs: absolute server timestamp (ms) when note 0 should sound
  async play(playAtServerMs) {
    if (!this.ctx) {
      console.warn('[audio-engine] Not initialized — call init() first');
      return;
    }
    // Ensure the AudioContext is running before scheduling — browsers can
    // suspend it when the tab is backgrounded or the screen locks.
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.stop();
    this.playing = true;

    // Convert server timestamp to local AudioContext time
    // clientEquivMs = playAtServerMs + offsetMs  (server→client domain)
    const clientEquivMs = playAtServerMs + this.offsetMs;
    const delayMs = clientEquivMs - Date.now();
    const delaySeconds = delayMs / 1000;

    const notes = SONG.parts[this.part];
    if (!notes) {
      console.warn('[audio-engine] Unknown part:', this.part);
      return;
    }

    const beatDuration = 60 / SONG.bpm;
    const octaveMultiplier = Math.pow(2, this.octave);

    // If delaySeconds is negative, we joined mid-song — calculate which note
    // should be playing now and start scheduling from there
    let cursor; // AudioContext time offset for note 0
    let noteStart = 0; // index of first note to schedule
    let noteTimeOffset = 0; // seconds into the part we've already passed

    if (delaySeconds < 0) {
      const elapsedSeconds = -delaySeconds;
      let accumulated = 0;
      for (let i = 0; i < notes.length; i++) {
        const noteDur = notes[i][1] * beatDuration;
        if (accumulated + noteDur > elapsedSeconds) {
          noteStart = i;
          noteTimeOffset = accumulated;
          break;
        }
        accumulated += noteDur;
        noteStart = i + 1;
        noteTimeOffset = accumulated;
      }
      // Schedule from 50ms from now to give the scheduler headroom
      cursor = this.ctx.currentTime + 0.05 - (elapsedSeconds - noteTimeOffset);
    } else {
      cursor = this.ctx.currentTime + delaySeconds;
      // Pre-roll: advance cursor for notes before noteStart (none in normal case)
    }

    for (let i = noteStart; i < notes.length; i++) {
      const [freq, beats] = notes[i];
      const duration = beats * beatDuration;
      if (freq > 0) {
        this._scheduleNote(freq * octaveMultiplier, cursor, duration);
      }
      cursor += duration;
    }
  }

  _scheduleNote(freq, startTime, duration) {
    const ctx = this.ctx;

    // Two oscillators blended for a warmer, voice-like tone
    const osc1 = ctx.createOscillator(); // sine — fundamental
    const osc2 = ctx.createOscillator(); // triangle — odd harmonics
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq;

    // Mix: 70% sine, 30% triangle
    const mix1 = ctx.createGain();
    const mix2 = ctx.createGain();
    mix1.gain.value = 0.7;
    mix2.gain.value = 0.3;

    // Note envelope gain (ADSR-lite)
    const env = ctx.createGain();
    const atk = Math.min(0.02, duration * 0.1);
    const rel = Math.min(0.08, duration * 0.15);
    const sustain = 0.7;

    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(1.0, startTime + atk);
    env.gain.linearRampToValueAtTime(sustain, startTime + atk + 0.05);
    env.gain.setValueAtTime(sustain, startTime + duration - rel);
    env.gain.linearRampToValueAtTime(0, startTime + duration);

    // Routing: osc → mix → env → masterGain → destination
    osc1.connect(mix1);
    osc2.connect(mix2);
    mix1.connect(env);
    mix2.connect(env);
    env.connect(this.masterGain);

    const stopTime = startTime + duration + 0.05;
    osc1.start(Math.max(startTime, ctx.currentTime));
    osc2.start(Math.max(startTime, ctx.currentTime));
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    this.scheduledNodes.push(osc1, osc2);

    // Clean up references after notes finish
    osc1.onended = () => {
      osc1.disconnect();
      osc2.disconnect();
      mix1.disconnect();
      mix2.disconnect();
      env.disconnect();
    };
  }

  stop() {
    this.playing = false;
    for (const node of this.scheduledNodes) {
      try { node.stop(0); } catch (e) { /* already stopped */ }
    }
    this.scheduledNodes = [];
  }

  // Resume AudioContext if it was suspended (e.g. tab backgrounded)
  async ensureRunning() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }
}
