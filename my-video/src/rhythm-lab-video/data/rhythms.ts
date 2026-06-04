// ─── Rhythm Lab video data model ─────────────────────────────────────────────

export interface StripFeature {
  label: string;
  description: string;
  accent: string;  // exact color from CE tokens
}

export interface RhythmData {
  slug: string;
  hookPair1: [string, string];   // [line1, line2] — first statement
  hookPair2: [string, string];   // [line1, line2] — contrasting statement
  stripQuestion: string;         // question shown above the large strip
  rhythmName: string;            // the diagnosis name
  stripFeatures: StripFeature[]; // simple clue cards (4 items)
  revealDiagnosis: string;       // "Atrial flutter"
  revealClues: string[];         // ✓ check items in reveal panel
}

// ─── Atrial Flutter ───────────────────────────────────────────────────────────

export const atrialFlutterRhythm: RhythmData = {
  slug: "atrial-flutter",

  hookPair1: ["Most nurses", "memorize rhythms."],
  hookPair2: ["The best nurses", "learn the pattern."],

  stripQuestion: "Would you call\nthis SVT?",

  rhythmName: "Atrial Flutter",

  stripFeatures: [
    {
      label: "Rate",
      description: "About 150 bpm",
      accent: "#4da3ff",
    },
    {
      label: "Regularity",
      description: "Regular — no variation",
      accent: "#F2B94B",
    },
    {
      label: "P waves",
      description: "Sawtooth flutter waves",
      accent: "#0ABFBC",
    },
    {
      label: "QRS width",
      description: "Narrow — looks normal",
      accent: "#1FBF75",
    },
  ],

  revealDiagnosis: "Atrial flutter",
  revealClues: ["Regular rhythm", "Flutter waves", "Narrow QRS"],
};

export const rhythms: RhythmData[] = [atrialFlutterRhythm];
