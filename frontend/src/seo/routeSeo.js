import { SITE_NAME } from "./seoTags.js";

// Static per-route metadata for prerendered marketing pages that aren't the
// blog (the blog's SEO data lives alongside its post registry instead).
export const STATIC_ROUTE_SEO = {
  "/landing": {
    title: `${SITE_NAME} — Critical-care nursing practice`,
    description:
      "Understand the why behind critical-care nursing. A nursing-focused learning workspace designed around fictional practice, reasoning, and physiology.",
    path: "/landing",
    ogType: "website",
    robots: "noindex, follow",
  },
  "/": {
    title: `${SITE_NAME} — Clinical tools for real-world nursing`,
    description:
      "Nursing education, reference tools, and fictional scenario practice for nurses developing critical-care reasoning.",
    path: "/",
    ogType: "website",
  },
  "/download": {
    title: `${SITE_NAME} — Clinical Tools for Nurses`,
    description:
      "Access Clinical Edge nursing education and practice tools on the web or iPhone.",
    path: "/download",
    ogType: "website",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "How Clinical Edge processes submitted text, optional device-local saved cases, and aggregate usage analytics. Do not submit patient-identifiable information.",
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
  "/brain-sheets": {
    title: `Brain Sheet Library | ${SITE_NAME}`,
    description:
      "Blank, printable nurse brain sheets for med-surg, ICU, telemetry, ED, and night shift. Print and fill in on paper — nothing is entered or stored in the app.",
    path: "/brain-sheets",
    ogType: "website",
  },
};
