// ─── Scenario data type ───────────────────────────────────────────────────────

export interface Vital {
  label: string;
  value: string;
  flagged?: boolean; // true = red, draws attention
}

export interface ClinicalScenario {
  slug: string;
  hookLine: string;        // large hook text — one punchy line
  hookSub?: string;        // optional smaller sub-line
  scenarioLabel: string;   // e.g. "Rapid Response Scenario"
  vitals: Vital[];
  copilotPrompt: string;   // the text that appears in the input card
  urgencyLevel: "HIGH" | "MODERATE" | "LOW";
  // Output section cards — matched to real app SECTIONS
  concern: string;         // "Possible concerns" section
  assess: string;          // "What to assess next" section
  actions: string[];       // pulled out as bullet list
  closingLine: string;     // closing italic quote
}

// ─── Scenario 01: Septic shock with new confusion ────────────────────────────

export const septicShockScenario: ClinicalScenario = {
  slug: "septic-shock-confusion",

  hookLine: "He was fine\nan hour ago.",
  scenarioLabel: "Rapid Response Scenario",

  vitals: [
    { label: "68 y/o male",  value: "",          flagged: false },
    { label: "BP",           value: "88 / 52",   flagged: true  },
    { label: "HR",           value: "124",        flagged: true  },
    { label: "Temp",         value: "101.9 °F",  flagged: true  },
    { label: "Status",       value: "New confusion", flagged: true },
  ],

  copilotPrompt:
    "68 y/o male, BP 88/52, HR 124, temp 101.9, newly confused. What should concern me most right now?",

  urgencyLevel: "HIGH",

  concern:
    "Sepsis with early shock until proven otherwise. BP 88/52 and HR 124 together with a new mental status change is not a pattern to watch — it's a pattern to act on.",

  assess:
    "Mentation and perfusion first. Skin temperature, cap refill, and whether they can follow commands. Then lung sounds and work of breathing.",

  actions: [
    "Notify provider now — lead with the trend",
    "Confirm large-bore IV access",
    "Anticipate fluid challenge and stat labs",
    "Do not leave the bedside",
  ],

  closingLine:
    "The hardest patients to catch are the ones who look okay until they don't. You're in the window — use it.",
};

export const scenarios: ClinicalScenario[] = [septicShockScenario];
