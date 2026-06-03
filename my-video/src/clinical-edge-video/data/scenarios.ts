// ─── Scenario data type ───────────────────────────────────────────────────────

export interface Vital {
  label: string;
  value: string;
  flagged?: boolean; // true = red, draws attention
}

export interface ClinicalScenario {
  slug: string;
  hookLine: string;       // large hook text — 1-2 lines, bold
  scenarioLabel: string;  // small label above hook
  vitals: Vital[];
  copilotPrompt: string;  // text shown in the app input card
  urgencyLevel: "HIGH" | "MODERATE" | "LOW";
  concern: string;        // "Possible concerns" card — safe, observational language
  assess: string;         // "What to assess next" card — multi-line, \n separated
  actions: string[];      // TakeawayScene bullet list
  closingLine: string;    // italic pull-quote at bottom of TakeawayScene
}

// ─── Scenario: Septic shock with new confusion ────────────────────────────────

export const septicShockScenario: ClinicalScenario = {
  slug: "septic-shock-confusion",

  // Scene 1 — Hook
  hookLine: "This is the patient\nthat gets missed.",
  scenarioLabel: "Rapid response scenario",

  // Scene 2 — Patient snapshot vitals
  vitals: [
    { label: "68 y/o male",  value: "",              flagged: false },
    { label: "BP",           value: "88 / 52",       flagged: true  },
    { label: "HR",           value: "124",            flagged: true  },
    { label: "Temp",         value: "101.9 °F",      flagged: true  },
    { label: "Status",       value: "New confusion", flagged: true  },
  ],

  // Scene 3 — Copilot input
  copilotPrompt:
    "68 y/o male, BP 88/52, HR 124, temp 101.9, newly confused. What should concern me most right now?",

  urgencyLevel: "HIGH",

  // Scene 3 — Copilot output card 1 (safe, observational language)
  concern:
    "Sepsis with early shock should be on your radar.",

  // Scene 3 — Copilot output card 2 (multi-line, use \n — rendered with pre-line)
  assess:
    "Mental status trend\nSkin temperature and perfusion\nCap refill\nLung sounds and work of breathing\nProvider notification per facility policy",

  // Scene 4 — TakeawayScene bullet list
  actions: [
    "Mental status trend",
    "Skin temperature and perfusion",
    "Cap refill and lung sounds",
    "Provider notification per facility policy",
  ],

  // Scene 4 — closing italic pull-quote
  closingLine:
    "When hypotension, fever, tachycardia, and new confusion show up together, do not treat them as separate problems.\n\nWatch the pattern.",
};

export const scenarios: ClinicalScenario[] = [septicShockScenario];
