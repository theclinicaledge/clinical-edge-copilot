// ─── App Store Screenshot Config ──────────────────────────────────────────────
//
// Each slide maps to a code-driven mock screen + overlay copy.
// To update copy: change headline, subtext, or eyebrow here.
// To update the screen: edit the corresponding Mock*.tsx in screens/
// To re-render: run ./render-app-store-shots.sh from the my-video/ folder.

export interface ShotConfig {
  slideIndex: number;
  eyebrow?: string;
  headline: string;
  subtext: string;
}

export const SHOTS: ShotConfig[] = [
  {
    slideIndex: 0,
    eyebrow: "CLINICAL SUPPORT FOR NURSES",
    headline: "Clinical reasoning\nsupport for nurses.",
    subtext: "When something feels off. Before you call.",
  },
  {
    slideIndex: 1,
    eyebrow: "WHEN SOMETHING FEELS OFF",
    headline: "Break down what\nmatters. Spot risk early.",
    subtext: "Understand what's happening — and what could go wrong.",
  },
  {
    slideIndex: 2,
    eyebrow: "BEFORE YOU CALL",
    headline: "Know what to assess —\nand what to say.",
    subtext: "Walk into the call with clarity and a plan.",
  },
  {
    slideIndex: 3,
    eyebrow: "QUICK GUIDANCE",
    headline: "Quick answers\nduring your shift.",
    subtext: "Meds, labs, oxygen, precautions — without overthinking.",
  },
  {
    slideIndex: 4,
    eyebrow: "SBAR HANDOFF",
    headline: "Know exactly\nwhat to say.",
    subtext: "Clear, structured communication in seconds.",
  },
];
