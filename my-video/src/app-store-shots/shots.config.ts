// ─── App Store Screenshot Config ──────────────────────────────────────────────
//
// Each slide maps to a real screenshot + overlay copy.
// To update a slide: change headline, subtext, eyebrow, or screenshotFile here.
// To re-render: run ./render-app-store-shots.sh from the my-video/ folder.
//
// screenshotFile → place source JPGs in public/screenshots/
// scrollY        → px to shift the screenshot upward (0 = show from top)

export interface ShotConfig {
  slideIndex: number;
  eyebrow?: string;
  headline: string;
  subtext: string;
  screenshotFile: string;
  scrollY: number;
}

export const SHOTS: ShotConfig[] = [
  {
    slideIndex: 0,
    eyebrow: "For nurses, on shift",
    headline: "Clinical support\nthat thinks\nlike a nurse.",
    subtext: "When something feels off, Copilot helps you think it through.",
    screenshotFile: "screen-01-home-input.jpg",
    scrollY: 0,
  },
  {
    slideIndex: 1,
    eyebrow: "Clinical reasoning",
    headline: "When something\ndoesn't feel right.",
    subtext: "Break down what matters. Spot risk early.",
    screenshotFile: "screen-02-urgency-high.jpg",
    scrollY: 0,
  },
  {
    slideIndex: 2,
    eyebrow: "Before you call",
    headline: "Think before\nyou call.",
    subtext: "Know what to assess, what matters, and what to say.",
    screenshotFile: "screen-03-response-actions.jpg",
    scrollY: 0,
  },
  {
    slideIndex: 3,
    eyebrow: "Practical support",
    headline: "Quick questions.\nReal answers.",
    subtext: "Meds, labs, oxygen, precautions — without overthinking.",
    screenshotFile: "screen-04-quick-questions.jpg",
    scrollY: 0,
  },
  {
    slideIndex: 4,
    eyebrow: "Real shift thinking",
    headline: "Built for real\nshift thinking.",
    subtext: "Not perfect inputs. Not textbook scenarios. Real nursing.",
    screenshotFile: "screen-05-sbar.jpg",
    scrollY: 0,
  },
];
