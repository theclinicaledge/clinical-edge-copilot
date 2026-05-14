// ─── App Store Screenshot Config ──────────────────────────────────────────────
//
// Each slide loads a REAL app screenshot from public/screenshots/
// and wraps it in a premium marketing composition.
//
// File placement:
//   my-video/public/screenshots/
//     home.png        ← home / input screen
//     urgency.png     ← urgency badge + "What this could be"
//     assessments.png ← "What to assess next" + possible concerns
//     actions.png     ← actions + "Anything change?" panel
//     sbar.png        ← SBAR handoff draft
//
// To re-render all 5: ./render-app-store-shots.sh

export interface ShotConfig {
  slideIndex: number;
  shotFile:   string;   // path relative to public/ dir
  headline:   string;   // \n creates a line break
  subtext:    string;
}

export const SHOTS: ShotConfig[] = [
  {
    slideIndex: 0,
    shotFile:   "screenshots/home.png",
    headline:   "Think clearly\nbefore you call.",
    subtext:    "Clinical reasoning support for nurses, built for real shift decisions.",
  },
  {
    slideIndex: 1,
    shotFile:   "screenshots/urgency.png",
    headline:   "Know what you're\ndealing with.",
    subtext:    "Urgency level and clinical possibilities — surfaced immediately.",
  },
  {
    slideIndex: 2,
    shotFile:   "screenshots/assessments.png",
    headline:   "Know what to\nassess next.",
    subtext:    "Possible concerns and targeted assessments — structured for the bedside.",
  },
  {
    slideIndex: 3,
    shotFile:   "screenshots/actions.png",
    headline:   "Know when and\nhow to escalate.",
    subtext:    "Next steps, escalation guidance, and follow-up support.",
  },
  {
    slideIndex: 4,
    shotFile:   "screenshots/sbar.png",
    headline:   "SBAR ready\nin seconds.",
    subtext:    "Structured handoffs generated from your clinical scenario.",
  },
];
