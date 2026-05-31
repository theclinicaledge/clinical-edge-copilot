// ─── ICU Drips — Educational Reference Data ──────────────────────────────────
// NO dosing, NO concentrations, NO starting/max rates, NO titration steps.
// Observational and educational language only.
// All clinical decisions follow provider orders, unit protocols, and pharmacy.

export const SAFETY_DISCLAIMER =
  "Specific dosing, ranges, and titration steps follow your unit's orders, protocols, and pharmacy. This is educational, not a clinical order.";

export const CATEGORIES = [
  { key: "all",            label: "All drips" },
  { key: "vasopressor",    label: "Vasopressors" },
  { key: "sedation",       label: "Sedation" },
  { key: "antiarrhythmic", label: "Antiarrhythmics" },
];

// ─── Foundations: field-note concept cards (2-3 lines each) ──────────────────
export const FOUNDATIONS = [
  {
    id: "central-vs-peripheral",
    title: "Central vs peripheral access",
    body: "Many critical infusions prefer central access. Peripheral use follows unit policy, with close monitoring and a planned transition.",
  },
  {
    id: "smart-pumps",
    title: "Smart pumps and drug libraries",
    body: "The correct library and concentration selection matter. A wrong pump setting can make a normal-looking rate unsafe.",
  },
  {
    id: "interrupted-infusions",
    title: "Interrupted infusions",
    body: "Some drips are time-sensitive. Bag changes, tubing swaps, and access problems can affect delivery quickly at the bedside.",
  },
  {
    id: "high-alert",
    title: "High-alert medications",
    body: "These drips carry higher risk when programmed incorrectly. Independent checks and pump verification are standard safeguards.",
  },
  {
    id: "titrate-to-effect",
    title: "Titrate to ordered effect",
    body: "The goal is the provider-ordered clinical target. Nurses watch the trend and communicate when the response falls outside what is expected.",
  },
];

// ─── Drip entries ─────────────────────────────────────────────────────────────
export const DRIPS = [

  // ── Norepinephrine ──────────────────────────────────────────────────────────
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    brandName: "Levophed",
    category: "vasopressor",
    categoryLabel: "Vasopressor",
    badge: "Common ICU pressor",
    related: ["propofol", "amiodarone"],

    snapshot:
      "A potent vasopressor that raises MAP primarily through vasoconstriction, with modest inotropic support and less tachycardia than some other agents.",

    effects: [
      { label: "↑ SVR" },
      { label: "↑ MAP" },
      { label: "mild ↑ contractility" },
      { label: "watch perfusion" },
    ],

    pearl:
      "Think: vessels are too relaxed. Norepinephrine helps restore vascular tone, but perfusion still has to be watched at the bedside.",

    clinicalUse: [
      "Commonly used in distributive and septic shock",
      "Hypotension not adequately responsive to IV fluids",
      "Maintaining a provider-ordered MAP target",
      "Adjunct support in selected hemodynamically complex presentations",
    ],

    mechanism: [
      "Alpha-1 receptor stimulation produces systemic vasoconstriction",
      "Modest beta-1 effect adds mild inotropic support",
      "Higher MAP is driven largely by increased vascular resistance",
      "Less reflex tachycardia compared to some other vasopressors",
    ],

    monitoring: [
      "MAP, per provider-ordered target",
      "Heart rate and rhythm",
      "Peripheral perfusion: skin color, temperature, capillary refill",
      "Urine output as a downstream perfusion marker",
      "IV site, especially with peripheral access",
      "Level of consciousness",
    ],

    watchOut: [
      "Peripheral site issues can lead to tissue injury if extravasation occurs",
      "Cold, mottled, or cyanotic extremities suggest perfusion compromise",
      "Volume status still matters alongside vasopressor support",
      "Weaning is gradual, per provider orders, to avoid hemodynamic rebound",
    ],

    escalation: [
      "MAP persistently below provider-ordered target",
      "Signs of limb ischemia: pallor, cyanosis, mottling, or pain",
      "New or worsening cardiac arrhythmia",
      "IV site changes concerning for extravasation",
      "Hemodynamic decline despite current support",
    ],

    linesAccess: [
      "Central venous access is standard for sustained infusions",
      "Peripheral use follows unit protocol, with close site monitoring and a transition plan",
      "Dedicated lumen preferred",
      "Compatibility with other infusions: confirm with pharmacy",
    ],

    safetyFlags: [
      "IV site extravasation requires prompt assessment and team notification",
      "Weaning is provider-ordered and gradual; abrupt changes carry hemodynamic risk",
      "Pump programming verified against the current order per unit policy",
    ],
  },

  // ── Propofol ────────────────────────────────────────────────────────────────
  {
    id: "propofol",
    name: "Propofol",
    brandName: "Diprivan",
    category: "sedation",
    categoryLabel: "Sedation / Hypnotic",
    badge: "Sedation, not analgesia",
    related: ["norepinephrine", "amiodarone"],

    snapshot:
      "A fast-acting IV sedative-hypnotic with no analgesic properties, commonly used for intubated ICU patients and titratable to a provider-ordered sedation depth.",

    effects: [
      { label: "sedation" },
      { label: "no analgesia" },
      { label: "rapid offset" },
      { label: "↓ BP risk" },
    ],

    pearl:
      "Sedated does not mean comfortable. Propofol quiets the brain, but pain must be addressed separately and assessed consistently.",

    clinicalUse: [
      "Continuous sedation in intubated, mechanically ventilated patients",
      "Procedural sedation in monitored settings",
      "Peri-intubation management",
      "Refractory seizure activity under specialist guidance",
    ],

    mechanism: [
      "Enhances GABA-A receptor inhibitory activity, producing CNS depression",
      "Sedation depth ranges from mild to deep, depending on infusion",
      "No effect on pain pathways; analgesia requires a separate agent",
      "Rapid CNS redistribution makes it highly titratable",
    ],

    monitoring: [
      "Sedation level per validated scale (RASS or SAS), per unit protocol",
      "Blood pressure (hypotension is common)",
      "Heart rate and cardiac rhythm",
      "Ventilator synchrony",
      "Triglyceride levels with prolonged infusion",
      "Signs of PRIS: metabolic acidosis, elevated lactate, rising CK, new arrhythmia, kidney injury",
      "Urine color",
    ],

    watchOut: [
      "Hypotension is expected, especially in patients with volume deficit or hemodynamic fragility",
      "No analgesia: pain must be assessed and managed through a separate approach",
      "PRIS is rare but serious; risk is higher with prolonged or high-rate infusions",
      "Lipid emulsion contributes to caloric load, relevant for nutrition planning",
      "Aseptic handling is required; the emulsion supports microbial growth at room temperature",
    ],

    escalation: [
      "Persistent hypotension not responding to clinical management",
      "Unexplained metabolic acidosis or rising creatine kinase (concern for PRIS)",
      "New arrhythmia in the context of propofol infusion",
      "Sedation significantly above or below provider-ordered target",
      "Signs of patient distress or pain not addressed by the current plan",
    ],

    linesAccess: [
      "Dedicated IV line preferred; avoid sharing a lumen without pharmacy-confirmed compatibility",
      "In-line filter per manufacturer guidance",
      "Tubing and vial changes per unit infection control policy",
      "Allergy review (soybean oil, egg lecithin) per unit policy before use",
    ],

    safetyFlags: [
      "PRIS: monitor per unit protocol; early signs include rising CK and unexplained metabolic acidosis",
      "Strict aseptic technique throughout all handling",
      "Follow unit policy for vial and tubing change intervals",
      "Full medication compatibility review before any co-infusion in the same lumen",
    ],
  },

  // ── Amiodarone ──────────────────────────────────────────────────────────────
  {
    id: "amiodarone",
    name: "Amiodarone",
    brandName: "Cordarone / Nexterone",
    category: "antiarrhythmic",
    categoryLabel: "Antiarrhythmic",
    badge: "Rhythm + rate support",
    related: ["norepinephrine", "propofol"],

    snapshot:
      "A broad-spectrum antiarrhythmic with complex multi-channel pharmacology; a very long half-life means effects and drug interactions continue well beyond the infusion.",

    effects: [
      { label: "rhythm control" },
      { label: "rate slowing" },
      { label: "long half-life" },
      { label: "watch QT / BP" },
    ],

    pearl:
      "A better-looking rhythm does not always mean better perfusion. Watch the patient, not only the monitor.",

    clinicalUse: [
      "Ventricular fibrillation and pulseless VT, per ACLS protocol",
      "Hemodynamically stable ventricular tachycardia",
      "Atrial fibrillation with rapid ventricular response",
      "Ventricular arrhythmia suppression in critically ill patients",
    ],

    mechanism: [
      "Primarily blocks potassium channels, prolonging action potential duration",
      "Also has sodium channel, beta-adrenergic, and calcium channel effects",
      "Broad antiarrhythmic spectrum across atrial and ventricular tissue",
      "Very long elimination half-life; effects persist weeks after the infusion ends",
    ],

    monitoring: [
      "Cardiac rhythm and rate; continuous ECG during infusion is standard",
      "QTc interval; serial monitoring per provider orders or protocol",
      "Blood pressure (hypotension common, especially with loading)",
      "IV site for phlebitis, especially with peripheral access",
      "Thyroid function on longer courses (amiodarone contains iodine)",
      "Pulmonary symptoms: new cough, dyspnea, or infiltrates",
      "Liver function tests",
    ],

    watchOut: [
      "Peripheral IV phlebitis is a significant concern; site requires regular inspection",
      "Hypotension during loading is common and expected",
      "QTc prolongation adds risk when combined with other QT-prolonging agents",
      "Drug interactions are broad: affects warfarin, digoxin, statins, and others",
      "Effects and interactions continue for weeks after the infusion ends",
    ],

    escalation: [
      "New or worsening arrhythmia during infusion",
      "Persistent hypotension not responding to current management",
      "IV site changes consistent with phlebitis or extravasation",
      "Significant QTc prolongation or new conduction changes on ECG",
      "Respiratory changes: new hypoxia, worsening dyspnea, or new infiltrates",
      "Unexplained deterioration in any organ system in a patient receiving amiodarone",
    ],

    linesAccess: [
      "Central venous access is preferred for sustained infusions",
      "Peripheral use is appropriate in acute situations; transition to central access planned early",
      "In-line filter recommended",
      "Pharmacy verification required for all co-infusions; known incompatibilities exist",
    ],

    safetyFlags: [
      "Central access is preferred for sustained infusions; peripheral phlebitis risk is clinically meaningful",
      "QTc monitoring is essential; know the current interval and trend",
      "Full medication review needed at the time of use; interactions are extensive",
      "Drug effects outlast the infusion by weeks; this affects all management decisions",
      "Thyroid, pulmonary, and liver monitoring continues beyond the acute infusion period",
    ],
  },
];
