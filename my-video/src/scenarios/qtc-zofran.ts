import { ScenarioData } from "../compositions/CopilotVideo";

export const qtcZofranScenario: ScenarioData = {
  id: "qtc-zofran",
  urgency: "MODERATE",
  hookLine1: "Yes.",
  hookLine2: "Here's why.",
  hookLabel: "QT PROLONGATION",
  ghostFragments: [
    { text: "QTc  520 ms",     xPct: 7,  yPct: 13 },
    { text: "Ondansetron 4mg", xPct: 52, yPct: 20 },
    { text: "K+   3.2",        xPct: 7,  yPct: 68 },
    { text: "Mg   1.6",        xPct: 56, yPct: 75 },
  ],
  inputText: "QTc is 520, patient just got zofran. should I be worried?",
  outputSections: [
    {
      label: "WHAT THIS COULD BE",
      content: "QT prolongation with risk of Torsades de Pointes. Ondansetron is a known QT-prolonging agent — this combination matters.",
    },
    {
      label: "WHAT MATTERS MOST",
      content: "QTc 520ms is already elevated. Stacking another QT-prolonging drug raises cumulative risk — especially with low K+ or Mg.",
    },
    {
      label: "ASSESS NEXT",
      content: "K+ and Mg levels. MAR review for other QT-prolonging meds. Any cardiac history or prior long QT syndrome.",
    },
    {
      label: "DO RIGHT NOW",
      content: "Notify provider before the next dose. Hold QT-prolonging meds without a conversation. Replete electrolytes per order. Confirm telemetry.",
    },
  ],
};
