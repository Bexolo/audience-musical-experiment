// Ode to Joy — 4-part SATB arrangement
// Key: E major (A4 = 440 Hz, equal temperament)
// BPM: 100  →  1 beat = 0.6 s
// Note format: [frequency_hz, duration_beats]  |  Frequency 0 = rest.
//
// All frequencies computed as: f = 440 × 2^((midi - 69) / 12)

// ── Equal-temperament note frequencies ───────────────────────────────────────
const N = {
  // Octave 2
  E2:   82.41,
  A2:  110.00,
  B2:  123.47,

  // Octave 3
  Cs3: 138.59,
  Ds3: 155.56,
  E3:  164.81,
  Fs3: 185.00,
  Gs3: 207.65,
  A3:  220.00,
  B3:  246.94,

  // Octave 4
  Cs4: 277.18,
  Ds4: 311.13,
  E4:  329.63,
  Fs4: 369.99,
  Gs4: 415.30,
  A4:  440.00,
  B4:  493.88,
};

const SONG = {
  bpm: 100,

  parts: {

    // ── SOPRANO — Beethoven's melody ──────────────────────────────────────────
    // Scale: E F# G# A B C# D# (E major — all sharps must be #, never natural)
    Soprano: [
      // Bars 1–4
      [N.E4,  1], [N.E4,  1], [N.Fs4, 1], [N.Gs4, 1],
      [N.Gs4, 1], [N.Fs4, 1], [N.E4,  1], [N.Ds4, 1],
      [N.Cs4, 1], [N.Cs4, 1], [N.Ds4, 1], [N.E4,  1],
      [N.E4, 1.5], [N.Ds4, 0.5], [N.Ds4, 2],
      // Bars 5–8
      [N.E4,  1], [N.E4,  1], [N.Fs4, 1], [N.Gs4, 1],
      [N.Gs4, 1], [N.Fs4, 1], [N.E4,  1], [N.Ds4, 1],
      [N.Cs4, 1], [N.Cs4, 1], [N.Ds4, 1], [N.E4,  1],
      [N.Ds4, 1.5], [N.Cs4, 0.5], [N.Cs4, 2],
      // Bars 9–12 (bridge)
      [N.Ds4, 1], [N.Ds4, 1], [N.E4,  1], [N.Cs4, 1],
      [N.Ds4, 1], [N.E4, 0.5], [N.Fs4, 0.5], [N.E4, 1], [N.Cs4, 1],
      [N.Ds4, 1], [N.E4, 0.5], [N.Fs4, 0.5], [N.E4, 1], [N.Ds4, 1],
      [N.Cs4, 1], [N.Ds4, 1], [N.A3,  2],
      // Bars 13–16
      [N.E4,  1], [N.E4,  1], [N.Fs4, 1], [N.Gs4, 1],
      [N.Gs4, 1], [N.Fs4, 1], [N.E4,  1], [N.Ds4, 1],
      [N.Cs4, 1], [N.Cs4, 1], [N.Ds4, 1], [N.E4,  1],
      [N.Ds4, 1.5], [N.Cs4, 0.5], [N.Cs4, 2],
    ],

    // ── ALTO — diatonic third below soprano ───────────────────────────────────
    // E→C#  F#→D#  G#→E  D#→B  C#→A  A→F#
    Alto: [
      // Bars 1–4
      [N.Cs4, 1], [N.Cs4, 1], [N.Ds4, 1], [N.E4,  1],
      [N.E4,  1], [N.Ds4, 1], [N.Cs4, 1], [N.B3,  1],
      [N.A3,  1], [N.A3,  1], [N.B3,  1], [N.Cs4, 1],
      [N.Cs4, 1.5], [N.B3, 0.5], [N.B3, 2],
      // Bars 5–8
      [N.Cs4, 1], [N.Cs4, 1], [N.Ds4, 1], [N.E4,  1],
      [N.E4,  1], [N.Ds4, 1], [N.Cs4, 1], [N.B3,  1],
      [N.A3,  1], [N.A3,  1], [N.B3,  1], [N.Cs4, 1],
      [N.B3, 1.5], [N.A3, 0.5], [N.A3, 2],
      // Bars 9–12 (bridge)
      [N.B3,  1], [N.B3,  1], [N.Cs4, 1], [N.A3,  1],
      [N.B3,  1], [N.Cs4, 0.5], [N.Ds4, 0.5], [N.Cs4, 1], [N.A3, 1],
      [N.B3,  1], [N.Cs4, 0.5], [N.Ds4, 0.5], [N.Cs4, 1], [N.B3, 1],
      [N.A3,  1], [N.B3,  1], [N.Fs3, 2],
      // Bars 13–16
      [N.Cs4, 1], [N.Cs4, 1], [N.Ds4, 1], [N.E4,  1],
      [N.E4,  1], [N.Ds4, 1], [N.Cs4, 1], [N.B3,  1],
      [N.A3,  1], [N.A3,  1], [N.B3,  1], [N.Cs4, 1],
      [N.B3, 1.5], [N.A3, 0.5], [N.A3, 2],
    ],

    // ── TENOR — inner voice (chord tones, E3–B3 range) ───────────────────────
    Tenor: [
      // Bars 1–4
      [N.Gs3, 2], [N.Gs3, 2],
      [N.Gs3, 2], [N.Fs3, 2],
      [N.A3,  2], [N.E3,  2],
      [N.Gs3, 1.5], [N.Fs3, 0.5], [N.Fs3, 2],
      // Bars 5–8
      [N.Gs3, 2], [N.Gs3, 2],
      [N.Gs3, 2], [N.Fs3, 2],
      [N.A3,  2], [N.E3,  2],
      [N.Fs3, 1.5], [N.E3,  0.5], [N.E3,  2],
      // Bars 9–12 (bridge)
      [N.B3,  2], [N.B3,  2],
      [N.B3,  2], [N.Gs3, 1], [N.Fs3, 1],
      [N.Fs3, 2], [N.Gs3, 2],
      [N.Gs3, 2], [N.E3,  2],
      // Bars 13–16
      [N.Gs3, 2], [N.Gs3, 2],
      [N.Gs3, 2], [N.Fs3, 2],
      [N.A3,  2], [N.E3,  2],
      [N.Fs3, 1.5], [N.E3,  0.5], [N.E3,  2],
    ],

    // ── BASS — root movement ──────────────────────────────────────────────────
    Bass: [
      // Bars 1–4  (I  I  IV  V)
      [N.E2,  4],
      [N.E2,  4],
      [N.A2,  4],
      [N.B2,  4],
      // Bars 5–8
      [N.E2,  4],
      [N.E2,  4],
      [N.A2,  4],
      [N.B2,  4],
      // Bars 9–12 (bridge: V  IV  V  I)
      [N.B2,  4],
      [N.A2,  4],
      [N.B2,  4],
      [N.E2,  4],
      // Bars 13–16
      [N.E2,  4],
      [N.E2,  4],
      [N.A2,  4],
      [N.B2,  4],
    ],
  },
};

// Verify all parts have equal total beats (logs warning if not)
(function verifyBeats() {
  const totals = {};
  for (const [part, notes] of Object.entries(SONG.parts)) {
    totals[part] = notes.reduce((s, n) => s + n[1], 0);
  }
  const values = Object.values(totals);
  const allEqual = values.every(v => v === values[0]);
  if (!allEqual) {
    console.warn('[song-data] Beat totals do not match:', totals);
  }
})();
