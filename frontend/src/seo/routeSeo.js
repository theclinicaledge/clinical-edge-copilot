import { SITE_NAME } from "./seoTags.js";

// Static per-route metadata for prerendered marketing pages that aren't the
// blog (the blog's SEO data lives alongside its post registry instead).
export const STATIC_ROUTE_SEO = {
  "/": {
    title: `${SITE_NAME} — Clinical tools for real-world nursing`,
    description:
      "Think through clinical situations, practice rhythm recognition, and build bedside confidence with Copilot, Rhythm Lab, ICU Drips, Reference Hub, and ABG Lab.",
    path: "/",
    ogType: "website",
  },
  "/download": {
    title: `${SITE_NAME} — Clinical Tools for Nurses`,
    description:
      "Explore Clinical Edge's tools for nurses: Copilot for bedside clinical reasoning, Rhythm Lab, ICU Drip Lab, ABG Lab, and Reference Hub — plus the Clinical Edge Copilot app on the App Store.",
    path: "/download",
    ogType: "website",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "How Clinical Edge Copilot handles data: no patient information, no PHI, local-only saved cases, and anonymized usage analytics.",
    path: "/privacy",
    ogType: "website",
  },
  "/support": {
    title: `Support | ${SITE_NAME}`,
    description:
      "Contact Clinical Edge for questions, feedback, or issues with Clinical Edge Copilot, plus answers to common questions.",
    path: "/support",
    ogType: "website",
  },
};
