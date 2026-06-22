// ─── VideoScript — the JSON contract between the CLI and the Remotion template ─
//
// Every automated Clinical Edge video is driven by one of these objects.
// The CLI generates it via Claude; the Remotion composition consumes it.

export type UrgencyLevel = "HIGH" | "MODERATE" | "LOW";
export type CardColor = "green" | "red" | "amber" | "blue" | "teal";
export type ECGType = "complete-heart-block" | "afib" | "vtach" | "generic" | "none";

export interface BreakdownCard {
  label: string;     // short bold title, ~4 words
  detail: string;    // supporting detail, ~10 words
  color: CardColor;
}

export interface VideoScript {
  slug: string;        // kebab-case, used for folder names
  topic: string;       // human-readable, e.g. "Complete Heart Block"
  urgency: UrgencyLevel;

  // ── Scene 1: Hook ──────────────────────────────────────────────────────────
  hookLine: string;    // 1-2 lines separated by \n, ~8 words total — punchy
  hookSub: string;     // category label, e.g. "Cardiac Rhythm Series"
  badgeText?: string;  // optional pulsing badge, e.g. "MEDICAL EMERGENCY"

  // ── Scene 2: Breakdown (pathophysiology / what's happening) ───────────────
  breakdownTitle: string;     // e.g. "Inside the heart"
  breakdownSubtitle: string;  // e.g. "What's happening"
  breakdownCards: BreakdownCard[];  // 3 cards

  // ── Scene 3: Nursing actions ──────────────────────────────────────────────
  nursingTitle: string;      // e.g. "Do this. Now."
  nursingActions: string[];  // 5-7 action items
  closingLine: string;       // italic pull-quote, \n for paragraph break

  // ── Scene 4: CTA ──────────────────────────────────────────────────────────
  ctaHandle: string;   // default "@clinicaledgeco"
  ctaTagline: string;  // default "Daily clinical reasoning for nurses."

  // ── ECG overlay (cardiac topics only) ─────────────────────────────────────
  ecgType: ECGType;

  // ── Footage search terms for Pexels ───────────────────────────────────────
  footageQueries: string[];  // 2-3 search terms, safe/generic medical imagery

  // ── Downloaded footage paths (relative to public/) — populated by CLI ─────
  // Scenes are assigned in order: [hook, breakdown, nursing, cta]
  footageFiles?: string[];

  // ── Social media captions (generated with the script) ─────────────────────
  tiktokCaption: string;
  instagramCaption: string;
  hashtags: string[];
}

// ─── Color map — CardColor → hex values used in components ───────────────────
export const CARD_COLORS: Record<CardColor, { text: string; border: string; bg: string }> = {
  green: { text: "#1FBF75", border: "rgba(31,191,117,0.35)",  bg: "rgba(31,191,117,0.08)" },
  red:   { text: "#e05572", border: "rgba(224,85,114,0.35)", bg: "rgba(224,85,114,0.08)" },
  amber: { text: "#F2B94B", border: "rgba(242,185,75,0.35)", bg: "rgba(242,185,75,0.08)"  },
  blue:  { text: "#4da3ff", border: "rgba(77,163,255,0.35)", bg: "rgba(77,163,255,0.08)"  },
  teal:  { text: "#0ABFBC", border: "rgba(10,191,188,0.35)", bg: "rgba(10,191,188,0.08)"  },
};

// ─── Default script — used as Remotion Studio placeholder ────────────────────
export const DEFAULT_VIDEO_SCRIPT: VideoScript = {
  slug: "example-topic",
  topic: "Example Topic",
  urgency: "HIGH",
  hookLine: "This is what\nyou need to know.",
  hookSub: "Clinical Edge — Nursing Education",
  badgeText: "PRIORITY CONTENT",
  breakdownTitle: "What's happening",
  breakdownSubtitle: "The key concepts",
  breakdownCards: [
    { label: "Step one",  detail: "The first thing to understand about this condition.", color: "green" },
    { label: "Step two",  detail: "The cascade that follows when this occurs.",           color: "red"   },
    { label: "Step three", detail: "The result — what the nurse must recognize.",          color: "amber" },
  ],
  nursingTitle: "Your priority actions",
  nursingActions: [
    "Assess the patient immediately",
    "Notify the provider",
    "Establish IV access",
    "Monitor continuously",
    "Document and escalate as needed",
  ],
  closingLine: "Do not wait for the patient to deteriorate.\n\nAct on the pattern early.",
  ctaHandle: "@clinicaledgeco",
  ctaTagline: "Daily clinical reasoning for nurses.",
  ecgType: "none",
  footageQueries: ["hospital nurse", "medical monitor", "ICU"],
  tiktokCaption: "What every nurse needs to know 🏥 #clinicaledge #nursing",
  instagramCaption: "Clinical Edge — nursing education for the bedside nurse.",
  hashtags: ["#nursing", "#clinicaledge", "#nursingeducation", "#nurses"],
};
