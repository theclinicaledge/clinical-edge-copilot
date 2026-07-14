// ─── Clinical Edge — Clinical Source Registry ────────────────────────────────
// Shared trust-layer data: authoritative source definitions + per-module
// review metadata. Modules reference sources by stable ID instead of
// duplicating title/organization/url/description in every content object.
//
// Adding a new source: add one entry to SOURCES, then reference its id from
// a module's FOUNDATIONAL / CATEGORY / MEDICATION source-id list below.

export const SOURCES = {
  'dailymed-fda-labeling': {
    id: 'dailymed-fda-labeling',
    organization: 'U.S. National Library of Medicine / FDA',
    title: 'DailyMed — Official FDA Drug Labeling',
    url: 'https://dailymed.nlm.nih.gov/dailymed/',
    sourceType: 'Government drug labeling database',
    description: 'NLM-hosted repository of current FDA-submitted drug labeling (package inserts) for prescription medications.',
  },
  'ismp': {
    id: 'ismp',
    organization: 'Institute for Safe Medication Practices (ISMP)',
    title: 'ISMP Patient Safety Resources',
    url: 'https://home.ecri.org/pages/ismp',
    sourceType: 'Professional medication safety organization',
    description: 'Nonprofit organization focused on medication safety, error prevention, and safe medication-use practices across healthcare settings.',
  },
  'aha-cpr-ecc-guidelines': {
    id: 'aha-cpr-ecc-guidelines',
    organization: 'American Heart Association',
    title: 'AHA Guidelines for CPR and Emergency Cardiovascular Care',
    url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines',
    sourceType: 'Professional society guideline hub',
    description: 'Official AHA hub for current CPR and emergency cardiovascular care (ECC) guidelines. A general access point to resuscitation guidance — not a page that itself details medication-specific recommendations.',
  },
  'sccm-guidelines': {
    id: 'sccm-guidelines',
    organization: 'Society of Critical Care Medicine (SCCM)',
    title: 'SCCM Clinical Practice Guidelines',
    url: 'https://www.sccm.org/clinical-resources/guidelines',
    sourceType: 'Professional society guideline index',
    description: 'Official SCCM index of current critical-care clinical practice guidelines across many topics. A general guideline directory — not a page dedicated to any single medication or clinical topic.',
  },
};

// ─── ICU Drips trust configuration ───────────────────────────────────────────
// Sources apply at three levels so no medication object needs to repeat data:
//   1. Foundational — shown for every drip in the module
//   2. Category      — shown for drips in a matching category
//   3. Medication     — optional per-drip override, empty until individually verified
//
// reviewStatus is intentionally honest rather than aspirational:
//   'framework_added'   — source infrastructure exists; no dated clinical review yet
//   'in_progress'       — a clinical review is actively underway
//   'reviewed'          — a dated clinical review has been completed (requires lastReviewed)
export const ICU_DRIPS_TRUST = {
  module: 'icu_drips',
  reviewStatus: 'framework_added',
  lastReviewed: null,
  reviewScope: 'ICU Drips medication reference content',
  summaryLine: 'Educational content referencing authoritative sources',
  statusLabel: 'Source framework added July 2026 · clinical review date not yet published',
  foundationalSourceIds: ['dailymed-fda-labeling', 'ismp'],
  categorySourceIds: {
    // AHA is intentionally NOT applied category-wide here. Vasopressin and
    // phenylephrine are not ACLS/arrest-algorithm drugs, so a blanket AHA
    // tag across the whole vasopressor category overstated the relationship.
    // See medicationSourceIds below for the conservative, per-drug mapping.
    vasopressor: ['sccm-guidelines'],
    inotrope: ['aha-cpr-ecc-guidelines', 'sccm-guidelines'],
    sedation: ['sccm-guidelines'],
    // TODO(future, verified source): SCCM's PADIS sedation/analgesia
    // guidelines are the natural fit here, but this link only reaches
    // SCCM's general guideline index, not the PADIS document itself.
    // Add a deep link once one can be individually verified as reachable.
    antiarrhythmic: ['aha-cpr-ecc-guidelines'],
    vasodilator: ['sccm-guidelines'],
    diuretic: [],
    anticoagulation: [],
    // TODO(future, verified source): a dedicated antithrombotic/anticoagulation
    // guideline source (e.g. CHEST/ACCP) would be a stronger fit for heparin,
    // argatroban, and bivalirudin than the generic foundational sources alone.
    // Not added — no specific URL has been individually verified.
    glycemic: [],
    // TODO(future, verified source): American Diabetes Association Standards
    // of Care would be the natural addition for glycemic/insulin content, but
    // its official URL could not be verified as reachable in this session —
    // not added.
  },
  medicationSourceIds: {
    // Per-medication overrides. Populated conservatively: only added where
    // the AHA/ACLS relationship is clearly defensible for that specific drug.
    epinephrine: ['aha-cpr-ecc-guidelines'], // core ACLS cardiac-arrest/anaphylaxis agent
    // norepinephrine deliberately omitted — its AHA relevance (post-ROSC
    // hemodynamic support) is real but less direct than epinephrine's, and
    // this feature favors conservative attribution over a borderline call.
  },
};

/**
 * Resolve the deduplicated, ordered list of source objects that apply to a
 * given drip: foundational sources first, then category sources, then any
 * medication-specific overrides.
 */
export function getSourcesForDrip(drip, trustConfig = ICU_DRIPS_TRUST) {
  const ids = [
    ...trustConfig.foundationalSourceIds,
    ...(trustConfig.categorySourceIds[drip.category] ?? []),
    ...(trustConfig.medicationSourceIds[drip.id] ?? []),
  ];
  const seen = new Set();
  const result = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const source = SOURCES[id];
    if (source) {
      result.push(source);
    } else if (import.meta.env.DEV) {
      console.warn(`[clinicalSources] Unresolved source id "${id}" — omitted from display.`);
    }
  }
  return result;
}
