export interface VitalSign {
  label: string;
  value: string;
  flagged?: boolean;
}

export interface ClinicalScenario {
  slug: string;
  hook: string;
  label: string;
  patientSnapshot: VitalSign[];
  copilotPrompt: string;
  urgency: "HIGH" | "MODERATE" | "LOW";
  biggestConcern: string;
  actions: string[];
  cta: string;
}

export const septicShockConfusion: ClinicalScenario = {
  slug: "septic-shock-confusion",
  hook: 'The patient was “fine” 30 minutes ago.',
  label: "Rapid Response Scenario",
  patientSnapshot: [
    { label: "Patient",  value: "68 y/o male" },
    { label: "BP",       value: "88 / 52",   flagged: true },
    { label: "HR",       value: "124 bpm",   flagged: true },
    { label: "Temp",     value: "101.9 °F",  flagged: true },
    { label: "Status",   value: "New confusion", flagged: true },
  ],
  copilotPrompt:
    "68 y/o male, BP 88/52, HR 124, temp 101.9, newly confused. What should concern me most and what should I assess first as the nurse?",
  urgency: "HIGH",
  biggestConcern: "Possible sepsis with shock",
  actions: [
    "Assess mentation and perfusion",
    "Check lung sounds and work of breathing",
    "Notify provider early",
    "Prepare for sepsis workup",
  ],
  cta: 'Comment "copilot"',
};

export const scenarios: ClinicalScenario[] = [septicShockConfusion];
