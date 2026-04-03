import { ScenarioData } from "../compositions/CopilotVideo";

export const confusedPatientScenario: ScenarioData = {
  id: "confused-patient",
  urgency: "MODERATE",
  hookLine1: "Vitals are normal.",
  hookLine2: "Something isn't.",
  hookLabel: "REAL SCENARIO",
  ghostFragments: [
    { text: "HR   78",       xPct: 7,  yPct: 13 },
    { text: "BP  118 / 72",  xPct: 56, yPct: 20 },
    { text: "SpO2  97%",     xPct: 7,  yPct: 68 },
    { text: "Temp  98.6",    xPct: 54, yPct: 75 },
  ],
  inputText: "patient suddenly more confused… but vitals are normal. what am I missing?",
  outputSections: [
    {
      label: "WHAT THIS COULD BE",
      content: "Acute altered mental status with a hidden cause. Normal vitals do not rule out stroke, early hypoxia, infection, or medication toxicity.",
    },
    {
      label: "WHAT MATTERS MOST",
      content: "The change, not the snapshot. 'Suddenly' means something shifted. Don't wait for vitals to drift before escalating.",
    },
    {
      label: "ASSESS NEXT",
      content: "SpO2 with a reliable probe. Point-of-care glucose. Focal neuro exam. MAR review — opioids, benzos, anticholinergics. Last known normal.",
    },
    {
      label: "DO RIGHT NOW",
      content: "Notify provider with SBAR now. Full neuro assessment immediately. Low threshold to escalate — AMS can progress fast and silently.",
    },
  ],
};
