// ─── Clinical Edge — Clinical Source Registry ────────────────────────────────
// Shared trust-layer data: authoritative source definitions + per-module
// review metadata. Modules reference sources by stable ID instead of
// duplicating title/organization/url/description in every content object.
//
// Adding a new source: add one entry to SOURCES, then reference its id from
// a module's FOUNDATIONAL / CATEGORY / MEDICATION source-id list below.

// Product-specific labels checked during the reference audit, 2026-10-20.
// Labels differ by formulation; these links do not replace the exact product label.
const ICU_DRIP_LABELS = {
  "norepinephrine": [
    "Norepinephrine",
    "39cda6c6-3857-4028-80cf-aef135f8c7e6"
  ],
  "vasopressin": [
    "Vasostrict (vasopressin)",
    "b97e5c3e-ca28-4ffa-80af-6c5bdbadaf10"
  ],
  "phenylephrine": [
    "Phenylephrine",
    "f2096e12-cbeb-4084-9132-17c7ef46b7b9"
  ],
  "epinephrine": [
    "Epinephrine",
    "1e8ebac1-5b32-47f9-a930-86a98a24dccc"
  ],
  "dobutamine": [
    "Dobutamine",
    "9794e9d0-c8b7-4d18-8cd1-15cc4f2a9a55"
  ],
  "milrinone": [
    "Milrinone",
    "b3c936b3-5c86-4d87-9544-e94e95d0245f"
  ],
  "propofol": [
    "Diprivan (propofol)",
    "d1ae9e26-ffd6-43df-bbd6-869cdede6afe"
  ],
  "dexmedetomidine": [
    "Precedex (dexmedetomidine)",
    "9eb336de-5fa5-4b46-b40b-a7ca5a0864bd"
  ],
  "midazolam": [
    "Midazolam",
    "d9305142-417d-4d8c-9a23-f9a1b6771cac"
  ],
  "fentanyl": [
    "Fentanyl citrate",
    "1ed25b2c-334e-4021-ada1-3396f07630dc"
  ],
  "ketamine": [
    "Ketalar (ketamine)",
    "14e8f864-8b8a-4e7e-8439-e510d3107063"
  ],
  "amiodarone": [
    "Amiodarone IV",
    "8969aad3-0219-e67f-e053-2995a90aac5a"
  ],
  "diltiazem": [
    "Diltiazem IV",
    "41d75325-d935-ba54-e063-6394a90aade2"
  ],
  "esmolol": [
    "Brevibloc (esmolol)",
    "9c593cdb-cdfe-4492-8862-9b05116aa25e"
  ],
  "nicardipine": [
    "Cardene IV (nicardipine)",
    "a3e33add-0d09-423a-9109-42e5ba7148d5"
  ],
  "nitroprusside": [
    "Sodium nitroprusside",
    "820eadcb-1230-4b17-a652-e69b52b3c12f"
  ],
  "nitroglycerin": [
    "Nitroglycerin in dextrose (IV)",
    "457a026c-ebce-4701-9deb-2d7652759a99"
  ],
  "furosemide": [
    "Furosemide injection",
    "8e0bac29-5a8b-4d4e-93b3-2e21eb3b0650"
  ],
  "bumetanide": [
    "Bumetanide injection",
    "9058fc52-f3f6-4d7f-b2a0-b1e2c714b133"
  ],
  "heparin": [
    "Heparin sodium",
    "6be171fb-c85f-4336-a88d-b4d97bb0fe03"
  ],
  "argatroban": [
    "Argatroban",
    "79eec27d-ac63-4996-8b1a-c2cd52ad2b2c"
  ],
  "bivalirudin": [
    "Bivalirudin",
    "e574d04f-67b4-4a84-9d66-8c2d54f95120"
  ],
  "insulin-infusion": [
    "Humulin R (regular insulin)",
    "81199e55-ade9-46de-a5a3-c0415acee403"
  ],
  "enoxaparin": [
    "Enoxaparin (SQ comparison)",
    "5e7568a6-cf8a-4de2-86ba-b94c8ab4c806"
  ]
};

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
  'sccm-ssc-adults': {
    id: 'sccm-ssc-adults',
    organization: "Society of Critical Care Medicine",
    title: "Surviving Sepsis Campaign: Adult Guidelines (2026)",
    url: "https://sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines",
    sourceType: 'Professional guidance',
    description: "Septic-shock vasopressor and perfusion context; not guidance for every cause of shock.",
  },
  'sccm-padis-2018': {
    id: 'sccm-padis-2018',
    organization: "Society of Critical Care Medicine",
    title: "PADIS Guidelines (2018)",
    url: "https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-prevention-and-management-of-pa",
    sourceType: 'Professional guidance',
    description: "Pain assessment, sedation, delirium, and ICU monitoring context.",
  },
  'sccm-padis-2025': {
    id: 'sccm-padis-2025',
    organization: "Society of Critical Care Medicine",
    title: "PADIS Focused Update (2025)",
    url: "https://www.sccm.org/clinical-resources/guidelines/guidelines/focused-update-padis-guideline",
    sourceType: 'Professional guidance',
    description: "Updated adult ICU sedation and delirium evidence; complements the 2018 guideline.",
  },
  'aha-adult-als-2025': {
    id: 'aha-adult-als-2025',
    organization: "American Heart Association",
    title: "Adult Advanced Life Support (2025)",
    url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support/",
    sourceType: 'Professional guidance',
    description: "Rhythm and resuscitation context. Arrest administration differs from a continuous-infusion reference.",
  },
  'acc-aha-af-2023': {
    id: 'acc-aha-af-2023',
    organization: "ACC / AHA / ACCP / HRS",
    title: "Atrial Fibrillation Guideline (2023)",
    url: "https://www.jacc.org/doi/10.1016/j.jacc.2023.08.017",
    sourceType: 'Professional guidance',
    description: "AF rate/rhythm distinctions, systolic-function limitations, and pre-excitation safety.",
  },
  'ash-hit-2018': {
    id: 'ash-hit-2018',
    organization: "American Society of Hematology",
    title: "Heparin-Induced Thrombocytopenia Guideline (2018)",
    url: "https://www.hematology.org/education/clinicians/guidelines-and-quality-care/clinical-practice-guidelines/venous-thromboembolism-guidelines/heparin-induced-thrombocytopenia",
    sourceType: 'Professional guidance',
    description: "HIT recognition and non-heparin anticoagulant context. Includes uses beyond individual product labeling.",
  },
  'ada-hospital-2026': {
    id: 'ada-hospital-2026',
    organization: "American Diabetes Association",
    title: "Diabetes Care in the Hospital (2026)",
    url: "https://doi.org/10.2337/dc26-s016",
    sourceType: 'Professional guidance',
    description: "Hospital glucose monitoring, nutrition context, and hyperglycemic crises.",
  },
  'ada-crises-2024': {
    id: 'ada-crises-2024',
    organization: "ADA / EASD / JBDS / AACE / DTS",
    title: "Hyperglycemic Crises in Adults: Consensus Report (2024)",
    url: "https://diabetesjournals.org/care/article/47/8/1257/156808/Hyperglycemic-Crises-in-Adults-With-Diabetes-A",
    sourceType: 'Professional guidance',
    description: "DKA/HHS physiology and monitoring, including ketone and acid-base recovery.",
  },
  'ismp-high-alert-2024': {
    id: 'ismp-high-alert-2024',
    organization: "Institute for Safe Medication Practices",
    title: "High-Alert Medications in Acute Care (2024)",
    url: "https://www.ismp.org/system/files/resources/2024-01/ISMP_HighAlert_AcuteCare_List_010924_MS5760.pdf",
    sourceType: 'Professional guidance',
    description: "High-alert medication classes and safeguards adapted to institutional policy.",
  },
  ...Object.fromEntries(Object.entries(ICU_DRIP_LABELS).map(([dripId, [name, setId]]) => {
    const id = `dailymed-${dripId}`;
    return [id, {
      id,
      organization: 'U.S. National Library of Medicine / DailyMed',
      title: `${name}: prescribing information`,
      url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`,
      sourceType: 'Product prescribing information',
      description: 'Mechanism, warnings, adverse effects, and handling for the linked formulation. Exact product labeling and local pharmacy guidance govern administration.',
    }];
  })),
};

// ─── ICU Drips trust configuration ───────────────────────────────────────────
// A source-reference audit is not a clinician validation. Keep the review
// status/date honest until a dated clinician review is actually published.
export const ICU_DRIPS_TRUST = {
  module: 'icu_drips',
  reviewStatus: 'framework_added',
  lastReviewed: null,
  reviewScope: 'ICU Drips educational medication content',
  summaryLine: 'Drug-specific labeling and topic-specific guidelines',
  statusLabel: 'References linked · clinician review date not yet published',
  foundationalSourceIds: ['ismp-high-alert-2024'],
  categorySourceIds: {
    vasopressor: ['sccm-ssc-adults'],
    inotrope: [],
    sedation: ['sccm-padis-2018', 'sccm-padis-2025'],
    antiarrhythmic: ['acc-aha-af-2023'],
    vasodilator: [],
    diuretic: [],
    anticoagulation: ['ash-hit-2018'],
    glycemic: ['ada-hospital-2026', 'ada-crises-2024'],
  },
  medicationSourceIds: Object.fromEntries(Object.keys(ICU_DRIP_LABELS).map(id => [id, [
    `dailymed-${id}`,
    ...(['epinephrine', 'amiodarone'].includes(id) ? ['aha-adult-als-2025'] : []),
  ]])),
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
