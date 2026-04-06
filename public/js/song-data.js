// Multi-song library for the audience choir.
// Each song has: name, bpm, parts: { Soprano, Alto, Tenor, Bass }
// Note format: [frequency_hz, duration_beats]  |  frequency 0 = rest.
// All parts in a song must sum to the same total beats.
//
// Frequencies: equal-temperament, A4 = 440 Hz
//   f(midi) = 440 × 2^((midi - 69) / 12)

// ── Note frequency table ──────────────────────────────────────────────────────
const N = {
  // Octave 2
  D2:   73.42,
  E2:   82.41,
  G2:   98.00,
  A2:  110.00,
  B2:  123.47,

  // Octave 3
  C3:  130.81,
  D3:  146.83,
  Cs3: 138.59,
  Ds3: 155.56,
  E3:  164.81,
  Fs3: 185.00,
  G3:  196.00,
  Gs3: 207.65,
  A3:  220.00,
  B3:  246.94,

  // Octave 4
  C4:  261.63,
  Cs4: 277.18,
  D4:  293.66,
  Ds4: 311.13,
  E4:  329.63,
  Fs4: 369.99,
  G4:  392.00,
  Gs4: 415.30,
  A4:  440.00,
  B4:  493.88,

  // Octave 5
  C5:  523.25,
  D5:  587.33,
  E5:  659.25,
};

// ── Song library ──────────────────────────────────────────────────────────────
const SONGS = {

  // ── Ode to Joy ─────────────────────────────────────────────────────────────
  // Key: E major  |  BPM: 100  |  16-bar phrase, ~38s
  'ode-to-joy': {
    name: 'Ode to Joy',
    bpm: 100,
    parts: {

      // Soprano — Beethoven's melody
      // Scale: E F# G# A B C# D# (every C and D must be sharp)
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

      // Alto — diatonic third below soprano (E→C#  F#→D#  G#→E  D#→B  C#→A  A→F#)
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

      // Tenor — inner voice, E major chord tones (G#3 / F#3 / A3 / B3 / E3)
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

      // Bass — root movement (I  I  IV  V per 4-bar section)
      Bass: [
        [N.E2,  4], [N.E2,  4], [N.A2,  4], [N.B2,  4],  // bars 1–4
        [N.E2,  4], [N.E2,  4], [N.A2,  4], [N.B2,  4],  // bars 5–8
        [N.B2,  4], [N.A2,  4], [N.B2,  4], [N.E2,  4],  // bars 9–12
        [N.E2,  4], [N.E2,  4], [N.A2,  4], [N.B2,  4],  // bars 13–16
      ],
    },
  },

  // ── Happy Birthday ──────────────────────────────────────────────────────────
  // Key: G major  |  BPM: 90  |  4-phrase song, ~17s
  // Written in 3/4 feel; half-beat pickups open each phrase.
  'happy-birthday': {
    name: 'Happy Birthday',
    bpm: 90,
    parts: {

      // Soprano — melody in G major
      Soprano: [
        // Phrase 1: "Happy Birthday to you"
        [N.D4, 0.5], [N.D4, 0.5], [N.E4, 1], [N.D4, 1], [N.G4,  1], [N.Fs4, 2],
        // Phrase 2: "Happy Birthday to you"
        [N.D4, 0.5], [N.D4, 0.5], [N.E4, 1], [N.D4, 1], [N.A4,  1], [N.G4,  2],
        // Phrase 3: "Happy Birthday dear [name]"
        [N.D4, 0.5], [N.D4, 0.5], [N.D5, 1], [N.B4, 1], [N.G4,  1], [N.Fs4, 1], [N.E4, 2],
        // Phrase 4: "Happy Birthday to you"
        [N.C5, 0.5], [N.C5, 0.5], [N.B4, 1], [N.G4, 1], [N.A4,  1], [N.G4,  3],
      ],

      // Alto — diatonic third below soprano in G major
      // D→B  E→C  G→E  F#→D  A→F#  D5→B4  B4→G4  C5→A4
      Alto: [
        // Phrase 1
        [N.B3, 0.5], [N.B3, 0.5], [N.C4, 1], [N.B3, 1], [N.E4,  1], [N.D4,  2],
        // Phrase 2
        [N.B3, 0.5], [N.B3, 0.5], [N.C4, 1], [N.B3, 1], [N.Fs4, 1], [N.E4,  2],
        // Phrase 3
        [N.B3, 0.5], [N.B3, 0.5], [N.B4, 1], [N.G4, 1], [N.E4,  1], [N.D4,  1], [N.C4, 2],
        // Phrase 4
        [N.A4, 0.5], [N.A4, 0.5], [N.G4, 1], [N.E4, 1], [N.Fs4, 1], [N.E4,  3],
      ],

      // Tenor — G major chord tones (G3 / B3 / D4 / A3 / E4)
      Tenor: [
        // Phrase 1
        [N.G3, 0.5], [N.G3, 0.5], [N.G3, 1], [N.G3, 1], [N.B3, 1], [N.A3, 2],
        // Phrase 2
        [N.G3, 0.5], [N.G3, 0.5], [N.G3, 1], [N.G3, 1], [N.D4, 1], [N.B3, 2],
        // Phrase 3
        [N.G3, 0.5], [N.G3, 0.5], [N.G4, 1], [N.D4, 1], [N.B3, 1], [N.A3, 1], [N.G3, 2],
        // Phrase 4
        [N.E4, 0.5], [N.E4, 0.5], [N.D4, 1], [N.B3, 1], [N.D4, 1], [N.B3, 3],
      ],

      // Bass — root movement (G G D | G G D | G D | D G)
      Bass: [
        // Phrase 1  (G → D chord at end)
        [N.G2, 3], [N.D2, 3],
        // Phrase 2
        [N.G2, 3], [N.D2, 3],
        // Phrase 3
        [N.G2, 4], [N.D2, 3],
        // Phrase 4  (D7 → G)
        [N.D2, 4], [N.G2, 3],
      ],
    },
  },
};

// Verify beat totals match within each song
(function verifyBeats() {
  for (const [songKey, song] of Object.entries(SONGS)) {
    const totals = {};
    for (const [part, notes] of Object.entries(song.parts)) {
      totals[part] = notes.reduce((s, n) => s + n[1], 0);
    }
    const values = Object.values(totals);
    const allEqual = values.every(v => Math.abs(v - values[0]) < 0.001);
    if (!allEqual) {
      console.warn(`[song-data] "${songKey}" beat totals do not match:`, totals);
    }
  }
})();
