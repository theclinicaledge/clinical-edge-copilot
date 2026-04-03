import { ScenarioData } from "../compositions/CopilotVideo";

export const bpDropScenario: ScenarioData = {
  id: "bp-drop",
  urgency: "HIGH",
  hookLine1: "Something",
  hookLine2: "just changed.",
  hookLabel: "REAL SCENARIO",
  ghostFragments: [
    { text: "BP  88 / 50",   xPct: 7,  yPct: 13 },
    { text: "HR  122",       xPct: 60, yPct: 20 },
    { text: "BP  124 / 78",  xPct: 7,  yPct: 68 },
    { text: "HR  84",        xPct: 58, yPct: 75 },
  ],
  inputText: "BP dropped to 88/50, HR 122, was stable 20 min ago",
  outputSections: [
    {
      label: "WHAT THIS COULD BE",
      content: "Hemodynamic instability — possible shock. BP 88/50 with HR 122 is not a number to watch. It's a number to act on.",
    },
    {
      label: "WHAT MATTERS MOST",
      content: "The trend. Stable 20 min ago means rapid change. Think hemorrhage, PE, septic vasodilation, or cardiac event.",
    },
    {
      label: "ASSESS NEXT",
      content: "Skin temp, color, diaphoresis. Mental status. Last urine output. Recent meds or fluid changes.",
    },
    {
      label: "DO RIGHT NOW",
      content: "Call provider now. Confirm IV access. Anticipate IVF bolus, stat labs, type & screen. Do not leave the bedside.",
    },
  ],
};
