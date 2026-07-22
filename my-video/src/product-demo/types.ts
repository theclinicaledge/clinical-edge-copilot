export interface AppSection {
  title: string;
  items: string[];
  color?: string; // hex accent color — matches real CE section colors
}

export interface ProductDemoScript {
  slug: string;
  topic: string;

  // Scene 1 — Hook
  hookLine: string;         // 2 lines separated by \n
  hookSub: string;          // clinical subtext shown below hook (e.g. "Vitals looked okay.")

  // Scene 2 — Clinical tension
  tensionTitle: string;
  tensionSubtext?: string;          // italic line shown below cards (e.g. "Small changes. Big story.")
  tensionCards: Array<{ label: string; color: string }>;

  // Scene 3 — App demo
  appPrompt: string;        // the nurse's question shown in the input card
  appUrgency?: string;      // urgency level shown in badge (default: "MODERATE")
  appSections?: AppSection[]; // sectioned CE reasoning output
  appResponseItems: string[]; // fallback flat bullets (3–6 items)

  // Scene 4 — CTA
  ctaLine: string;
  ctaHandle: string;
  ctaTagline: string;

  // Stock footage (portrait clips)
  footageFiles?: string[];
}

export const DEFAULT_PRODUCT_DEMO_SCRIPT: ProductDemoScript = {
  slug: "product-demo-default",
  topic: "Clinical Edge",
  hookLine: "The patient said\nthey feel off.",
  hookSub: "Vitals looked okay.",
  tensionTitle: "That's where nurses get tested.",
  tensionCards: [
    { label: "Something changed",      color: "red"   },
    { label: "Baseline matters",       color: "amber" },
    { label: "Numbers can lag behind", color: "green" },
  ],
  appPrompt:
    "My patient says they feel off. Vitals are mostly stable but they look different from baseline. What should I assess?",
  appUrgency: "MODERATE",
  appSections: [
    { title: "What this could be",    color: "#4da3ff", items: ["Early subtle deterioration", "Pre-symptomatic decline"] },
    { title: "Possible concerns",     color: "#e05572", items: ["Perfusion change", "Baseline shift not captured by vitals"] },
    { title: "What to assess next",   color: "#1FBF75", items: ["Mentation", "Skin signs", "Full vital trend"] },
    { title: "What I'd do right now", color: "#F2B94B", items: ["Reassess at bedside", "Escalate if concerned"] },
  ],
  appResponseItems: [
    "Assess perfusion",
    "Compare to baseline",
    "Recheck full vitals",
    "Check glucose / ECG if indicated",
    "Escalate if anything feels off",
  ],
  ctaLine: "Clinical reasoning for real bedside decisions.",
  ctaHandle: "@clinicaledgeco",
  ctaTagline: "Download Clinical Edge",
  footageFiles: [],
};
