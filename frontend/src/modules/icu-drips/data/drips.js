// ─── ICU Drips — Educational Reference Data v2 ───────────────────────────────
// Structure: glance layer / working detail / reference tail
// NO dosing, NO concentrations, NO starting/max rates, NO titration steps.
// Observational and educational language only.
// All clinical decisions follow provider orders, unit protocols, and pharmacy.

export const SAFETY_DISCLAIMER =
  "Specific dosing, ranges, and titration steps follow your unit's orders, protocols, and pharmacy. This is educational, not a clinical order.";

export const CATEGORIES = [
  { key: "all",             label: "All drips" },
  { key: "vasopressor",     label: "Pressors" },
  { key: "sedation",        label: "Sedation" },
  { key: "antiarrhythmic",  label: "Rhythm & Rate" },
  { key: "anticoagulation", label: "Anticoagulation" },
];

export const FAMILIES = [
  { key: "pressors",        label: "Pressors & Vasoactives", categories: ["vasopressor"] },
  { key: "sedation",        label: "Sedation",               categories: ["sedation"] },
  { key: "rhythm",          label: "Rhythm & Rate",          categories: ["antiarrhythmic"] },
  { key: "anticoagulation", label: "Anticoagulation",        categories: ["anticoagulation"] },
];

// ─── Foundations ──────────────────────────────────────────────────────────────
export const FOUNDATIONS = [
  {
    id: "central-vs-peripheral",
    title: "Central vs peripheral access",
    body: "Many critical infusions prefer central access. Peripheral use follows unit policy, with close monitoring and a planned transition.",
  },
  {
    id: "smart-pumps",
    title: "Smart pumps and drug libraries",
    body: "Correct library and concentration selection matter. A wrong pump setting can make a normal-looking rate unsafe.",
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
    id: "ordered-targets",
    title: "Provider-ordered targets",
    body: "The goal is the provider-ordered clinical target. Nurses watch the trend and communicate when response falls outside what is expected.",
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
    family: "Pressors & Vasoactives",
    badge: "Common ICU pressor",
    related: ["vasopressin", "phenylephrine"],

    snapshot:
      "A potent vasopressor that raises MAP primarily through vasoconstriction, with modest inotropic support and less tachycardia than some other agents.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "↑ MAP" },
      { label: "mild ↑ inotropy" },
      { label: "watch perfusion" },
    ],

    mentalModel:
      "The vasculature is too relaxed. Norepinephrine helps restore tone — but the MAP number and the patient are both part of the picture. Perfusion still has to be assessed at the bedside, not just on the monitor.",

    commonlyUsedFor: [
      "Distributive and vasodilatory shock presentations",
      "Hypotension not adequately responsive to IV fluids",
      "Maintaining a provider-ordered MAP target",
      "Adjunct support in hemodynamically complex presentations",
    ],

    whatItIsDoing: [
      "Alpha-1 receptor stimulation causes systemic vasoconstriction",
      "Modest beta-1 effect adds mild inotropic support",
      "Higher MAP is driven largely by increased vascular resistance",
      "Less reflex tachycardia compared to some other vasopressors",
    ],

    whatNursesMonitor: [
      "MAP, per provider-ordered target",
      "Heart rate and rhythm",
      "Peripheral perfusion: skin color, temperature, capillary refill",
      "Urine output as a downstream perfusion marker",
      "IV site, especially with peripheral access",
      "Level of consciousness and mentation",
    ],

    watchOut: [
      "Peripheral site extravasation can lead to tissue injury",
      "Cold, mottled, or cyanotic extremities suggest perfusion compromise",
      "Volume status still matters alongside vasopressor support",
      "Weaning follows provider orders; abrupt changes carry hemodynamic risk",
    ],

    signalsToEscalate: [
      "MAP persistently outside provider-ordered target",
      "Signs of limb ischemia: pallor, cyanosis, mottling, or new pain",
      "New or worsening cardiac arrhythmia",
      "IV site changes concerning for extravasation",
      "Hemodynamic decline despite current support",
    ],

    linesAccessPolicy: [
      "Central venous access is standard for sustained infusions",
      "Peripheral use follows unit protocol, with close site monitoring and a transition plan",
      "Dedicated lumen preferred",
      "Compatibility with co-infusions: confirm with pharmacy",
    ],

    keySafetyNotes: [
      "IV site extravasation requires prompt assessment and team notification",
      "Weaning is provider-ordered and gradual; abrupt changes carry hemodynamic risk",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Vasopressin ─────────────────────────────────────────────────────────────
  {
    id: "vasopressin",
    name: "Vasopressin",
    brandName: "Vasostrict",
    category: "vasopressor",
    categoryLabel: "Vasopressor",
    family: "Pressors & Vasoactives",
    badge: "Non-catecholamine pressor",
    related: ["norepinephrine", "phenylephrine"],

    snapshot:
      "A non-catecholamine vasopressor acting through V1 receptors, commonly used alongside other vasopressors in vasodilatory shock presentations.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "non-catecholamine" },
      { label: "adjunct pressor" },
      { label: "watch extremities" },
    ],

    mentalModel:
      "Vasopressin takes a different path than norepinephrine — V1 receptors rather than adrenergic ones. It is often added alongside another vasopressor rather than replacing it. The monitoring priorities and adjustment patterns shift with the mechanism.",

    commonlyUsedFor: [
      "Vasodilatory shock not adequately controlled on catecholamine vasopressors alone",
      "Adjunct vasopressor support alongside norepinephrine or similar agents",
      "Situations where a non-catecholamine mechanism is clinically preferred",
      "Provider-ordered vasopressor combination regimens",
    ],

    whatItIsDoing: [
      "V1 receptor stimulation in vascular smooth muscle causes vasoconstriction",
      "Non-catecholamine mechanism: does not act on alpha or beta-adrenergic receptors",
      "MAP support without direct cardiac rate or inotropic effects",
      "Often used in combination rather than as a standalone vasopressor",
    ],

    whatNursesMonitor: [
      "MAP, per provider-ordered target",
      "Heart rate and rhythm",
      "Peripheral perfusion: skin temperature, color, capillary refill",
      "Urine output",
      "IV site, especially with peripheral access",
      "Sodium levels on longer infusions — antidiuretic effect is relevant",
    ],

    watchOut: [
      "Potent vasoconstriction can compromise peripheral and splanchnic perfusion",
      "Skin mottling or digital ischemia warrant prompt clinical assessment",
      "Antidiuretic effect can cause fluid shifts; sodium monitoring matters",
      "Follow provider orders closely — adjustment patterns differ from catecholamine vasopressors",
    ],

    signalsToEscalate: [
      "MAP persistently outside provider-ordered target",
      "Signs of digital or limb ischemia: pallor, cyanosis, mottling, pain",
      "Worsening skin mottling or new peripheral perfusion changes",
      "Urine output changes inconsistent with the clinical picture",
      "Sodium trending in an unexpected direction",
    ],

    linesAccessPolicy: [
      "Central venous access strongly preferred for sustained infusions",
      "Peripheral use follows unit policy with close site and perfusion monitoring",
      "Dedicated lumen preferred",
      "Pharmacy verification for all co-infusions",
    ],

    keySafetyNotes: [
      "Rate adjustments follow provider orders — patterns differ from catecholamine vasopressors",
      "Peripheral perfusion monitoring is essential; vasoconstriction is potent",
      "Sodium and fluid balance warrant monitoring on prolonged infusions",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Phenylephrine ───────────────────────────────────────────────────────────
  {
    id: "phenylephrine",
    name: "Phenylephrine",
    brandName: "Neo-Synephrine",
    category: "vasopressor",
    categoryLabel: "Vasopressor",
    family: "Pressors & Vasoactives",
    badge: "Pure alpha agonist",
    related: ["norepinephrine", "vasopressin"],

    snapshot:
      "A pure alpha-1 agonist that raises MAP through vasoconstriction without direct cardiac effects, often considered when tachycardia is a clinical concern.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "↑ MAP" },
      { label: "no cardiac effect" },
      { label: "reflex bradycardia" },
    ],

    mentalModel:
      "Phenylephrine squeezes the vessels without touching the heart directly. If tachycardia is already a problem, that difference matters. The reflex bradycardia it can produce is worth keeping in mind throughout the infusion.",

    commonlyUsedFor: [
      "Hypotension in settings where tachycardia is a clinical concern",
      "Vasodilatory hypotension with a provider preference for a pure alpha agent",
      "Anesthesia-related and procedural hypotension management",
      "Short-term MAP support per provider order",
    ],

    whatItIsDoing: [
      "Selective alpha-1 receptor stimulation causes systemic vasoconstriction",
      "No direct beta-adrenergic effect on heart rate or contractility",
      "MAP rise is driven entirely by increased vascular resistance",
      "Reflex bradycardia can occur as baroreceptors respond to higher MAP",
    ],

    whatNursesMonitor: [
      "MAP, per provider-ordered target",
      "Heart rate — reflex bradycardia is a recognized response",
      "Peripheral perfusion: skin color, temperature, capillary refill",
      "Urine output",
      "IV site for infiltration or phlebitis",
      "Clinical signs of reduced cardiac output in patients with limited cardiac reserve",
    ],

    watchOut: [
      "Reflex bradycardia can be clinically significant, especially with pre-existing conduction issues",
      "In patients with compromised cardiac function, vasoconstriction without inotropic support may reduce output",
      "Peripheral perfusion still has to be assessed alongside the MAP number",
      "Close IV site monitoring required with peripheral access",
    ],

    signalsToEscalate: [
      "MAP persistently outside provider-ordered target",
      "New or worsening bradycardia",
      "Signs of reduced peripheral perfusion",
      "Clinical response inconsistent with expected pattern",
      "IV site changes concerning for infiltration",
    ],

    linesAccessPolicy: [
      "Peripheral IV acceptable in acute situations; central access preferred for sustained infusions",
      "Close site monitoring required with peripheral use",
      "Dedicated lumen preferred",
      "Compatibility with co-infusions: confirm with pharmacy",
    ],

    keySafetyNotes: [
      "Monitor heart rate throughout; reflex bradycardia is a known response",
      "Cardiac output context matters — vasoconstriction alone does not equal improved perfusion",
      "IV site inspection with peripheral use: infiltration carries tissue injury risk",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Propofol ────────────────────────────────────────────────────────────────
  {
    id: "propofol",
    name: "Propofol",
    brandName: "Diprivan",
    category: "sedation",
    categoryLabel: "Sedation",
    family: "Sedation",
    badge: "Sedation, not analgesia",
    related: ["dexmedetomidine"],

    snapshot:
      "A fast-acting IV sedative-hypnotic with no analgesic properties, titratable to a provider-ordered sedation depth in intubated ICU patients.",

    effectChips: [
      { label: "sedation" },
      { label: "no analgesia" },
      { label: "rapid offset" },
      { label: "↓ BP risk" },
    ],

    mentalModel:
      "Propofol quiets the brain but does nothing for pain. A patient who looks sedated may still be uncomfortable. Analgesia needs its own plan — assessed separately and consistently throughout.",

    commonlyUsedFor: [
      "Continuous sedation in intubated, mechanically ventilated patients",
      "Procedural sedation in monitored settings",
      "Peri-intubation management",
      "Refractory seizure activity under specialist guidance",
    ],

    whatItIsDoing: [
      "Enhances GABA-A receptor inhibitory activity, producing CNS depression",
      "Sedation depth ranges from mild to deep depending on infusion",
      "No effect on pain pathways; analgesia requires a separate agent",
      "Rapid CNS redistribution makes it highly titratable",
    ],

    whatNursesMonitor: [
      "Sedation level per validated scale (RASS or SAS), per unit protocol",
      "Blood pressure — hypotension is common",
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

    signalsToEscalate: [
      "Persistent hypotension not responding to clinical management",
      "Unexplained metabolic acidosis or rising creatine kinase — concern for PRIS",
      "New arrhythmia in the context of propofol infusion",
      "Sedation significantly above or below provider-ordered target",
      "Signs of patient distress or pain not addressed by current plan",
    ],

    linesAccessPolicy: [
      "Dedicated IV line preferred; avoid sharing a lumen without pharmacy-confirmed compatibility",
      "In-line filter per manufacturer guidance",
      "Tubing and vial changes per unit infection control policy",
      "Allergy review (soybean oil, egg lecithin) per unit policy before use",
    ],

    keySafetyNotes: [
      "PRIS: monitor per unit protocol; early signs include rising CK and unexplained metabolic acidosis",
      "Strict aseptic technique throughout all handling",
      "Follow unit policy for vial and tubing change intervals",
      "Full medication compatibility review before any co-infusion in the same lumen",
    ],
  },

  // ── Dexmedetomidine ─────────────────────────────────────────────────────────
  {
    id: "dexmedetomidine",
    name: "Dexmedetomidine",
    brandName: "Precedex",
    category: "sedation",
    categoryLabel: "Sedation",
    family: "Sedation",
    badge: "Arousable sedation",
    related: ["propofol"],

    snapshot:
      "An alpha-2 agonist providing light, arousable sedation with relative preservation of respiratory drive, often used when patient cooperation and ventilator weaning are clinical goals.",

    effectChips: [
      { label: "sedation" },
      { label: "anxiolysis" },
      { label: "breathing preserved" },
      { label: "arousable" },
    ],

    mentalModel:
      "Dexmedetomidine works differently from propofol. Patients often stay arousable and can follow commands — that can look lighter than expected, but that is the goal. Bradycardia is the key hemodynamic watch throughout the infusion.",

    commonlyUsedFor: [
      "ICU sedation when arousability and patient cooperation are clinical goals",
      "Sedation to support ventilator weaning",
      "Procedural sedation and anxiolysis in monitored settings",
      "Agitation management in selected patients",
    ],

    whatItIsDoing: [
      "Alpha-2 adrenergic receptor agonism in the locus coeruleus produces sedation and anxiolysis",
      "Sedation quality is distinct: patients are often arousable and cooperative",
      "Relative preservation of respiratory drive compared to propofol or opioids",
      "Some analgesic-sparing properties, though not a primary analgesic",
    ],

    whatNursesMonitor: [
      "Sedation level per validated scale (RASS or SAS), per unit protocol",
      "Heart rate — bradycardia is a common and expected pattern",
      "Blood pressure — both hypotension and transient hypertension can occur",
      "Respiratory rate and oxygen saturation",
      "Patient comfort and signs of pain",
      "Agitation level and response to verbal stimulation",
    ],

    watchOut: [
      "Bradycardia is common; it can be clinically significant at lower heart rates",
      "Both hypotension and transient hypertension can occur — particularly at loading",
      "Arousable sedation may look lighter than expected; verify provider-ordered target",
      "Pain is not addressed by dexmedetomidine alone; separate analgesic assessment is essential",
      "Prolonged infusions: follow unit protocol for monitoring and transitions",
    ],

    signalsToEscalate: [
      "Heart rate falling to a clinically concerning level",
      "Persistent hypotension not responding to clinical management",
      "Significant agitation or distress not controlled despite the infusion",
      "Sedation significantly above or below provider-ordered target",
      "Signs of pain not addressed by the current plan",
    ],

    linesAccessPolicy: [
      "Peripheral IV or central access; follows unit practice",
      "Dedicated lumen preferred where possible",
      "Compatibility with co-infusions: confirm with pharmacy",
      "Loading or transition protocols: follow unit policy closely",
    ],

    keySafetyNotes: [
      "Bradycardia monitoring is essential throughout the infusion",
      "Do not rely on dexmedetomidine for analgesia — pain assessment and management are separate",
      "Arousable sedation is a feature, not a malfunction; verify target RASS with provider orders",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Amiodarone ──────────────────────────────────────────────────────────────
  {
    id: "amiodarone",
    name: "Amiodarone",
    brandName: "Cordarone / Nexterone",
    category: "antiarrhythmic",
    categoryLabel: "Antiarrhythmic",
    family: "Rhythm & Rate",
    badge: "Rhythm + rate support",
    related: ["diltiazem"],

    snapshot:
      "A broad-spectrum antiarrhythmic with complex multi-channel pharmacology; a very long half-life means effects and drug interactions continue well beyond the infusion.",

    effectChips: [
      { label: "rhythm control" },
      { label: "rate slowing" },
      { label: "long half-life" },
      { label: "watch QT / BP" },
    ],

    mentalModel:
      "A better-looking rhythm does not always mean better perfusion — watch the patient, not only the monitor. And amiodarone's effects outlast the infusion by weeks. That shapes medication decisions long after the drip is gone.",

    commonlyUsedFor: [
      "Ventricular fibrillation and pulseless VT, per ACLS protocol",
      "Hemodynamically stable ventricular tachycardia",
      "Atrial fibrillation with rapid ventricular response",
      "Ventricular arrhythmia suppression in critically ill patients",
    ],

    whatItIsDoing: [
      "Primarily blocks potassium channels, prolonging action potential duration",
      "Also has sodium channel, beta-adrenergic, and calcium channel effects",
      "Broad antiarrhythmic spectrum across atrial and ventricular tissue",
      "Very long elimination half-life; effects persist weeks after the infusion ends",
    ],

    whatNursesMonitor: [
      "Cardiac rhythm and rate; continuous ECG during infusion is standard",
      "QTc interval; serial monitoring per provider orders or protocol",
      "Blood pressure — hypotension common, especially during loading",
      "IV site for phlebitis, especially with peripheral access",
      "Thyroid function on longer courses — amiodarone contains iodine",
      "Pulmonary symptoms: new cough, dyspnea, or infiltrates",
      "Liver function tests",
    ],

    watchOut: [
      "Peripheral IV phlebitis is a significant concern; site requires regular inspection",
      "Hypotension during loading is common and expected",
      "QTc prolongation adds risk when combined with other QT-prolonging agents",
      "Drug interactions are broad: warfarin, digoxin, statins, and others",
      "Effects and interactions continue for weeks after the infusion ends",
    ],

    signalsToEscalate: [
      "New or worsening arrhythmia during infusion",
      "Persistent hypotension not responding to current management",
      "IV site changes consistent with phlebitis or extravasation",
      "Significant QTc prolongation or new conduction changes on ECG",
      "Respiratory changes: new hypoxia, worsening dyspnea, or new infiltrates",
      "Unexplained deterioration in any organ system",
    ],

    linesAccessPolicy: [
      "Central venous access is preferred for sustained infusions",
      "Peripheral use is appropriate in acute situations; central transition planned early",
      "In-line filter recommended",
      "Pharmacy verification required for all co-infusions; known incompatibilities exist",
    ],

    keySafetyNotes: [
      "Central access is preferred for sustained infusions; peripheral phlebitis risk is clinically meaningful",
      "QTc monitoring is essential; know the current interval and trend",
      "Full medication review needed; interactions are extensive",
      "Drug effects outlast the infusion by weeks; this affects all management decisions",
      "Thyroid, pulmonary, and liver monitoring continues beyond the acute infusion period",
    ],
  },

  // ── Diltiazem ───────────────────────────────────────────────────────────────
  {
    id: "diltiazem",
    name: "Diltiazem",
    brandName: "Cardizem",
    category: "antiarrhythmic",
    categoryLabel: "Antiarrhythmic",
    family: "Rhythm & Rate",
    badge: "Rate control",
    related: ["amiodarone"],

    snapshot:
      "A calcium channel blocker used for rate control in atrial fibrillation and flutter, slowing AV nodal conduction with meaningful effects on blood pressure.",

    effectChips: [
      { label: "rate control" },
      { label: "↓ AV conduction" },
      { label: "↓ BP possible" },
      { label: "watch block" },
    ],

    mentalModel:
      "Diltiazem puts the brakes on AV nodal conduction to slow the ventricular rate. Rate and rhythm are not the same thing — a controlled rate does not mean sinus rhythm. The two things worth watching most are the heart rate going too low and the blood pressure dropping.",

    commonlyUsedFor: [
      "Rate control in atrial fibrillation or flutter with rapid ventricular response",
      "Supraventricular tachycardia management in appropriate clinical situations",
      "Provider-ordered ventricular rate reduction in monitored settings",
    ],

    whatItIsDoing: [
      "Calcium channel blockade in the AV node slows conduction and ventricular rate",
      "Negative chronotropic effect: slows heart rate",
      "Negative dromotropic effect: slows AV nodal conduction",
      "Negative inotropy: contractility may be reduced, particularly relevant in systolic dysfunction",
    ],

    whatNursesMonitor: [
      "Heart rate and rhythm; continuous ECG during IV infusion is standard",
      "Blood pressure — hypotension is a common and clinically important side effect",
      "PR interval; excessive prolongation warrants clinical attention",
      "Signs of worsening heart failure: dyspnea, edema, volume status changes",
      "Level of consciousness and overall hemodynamic response",
    ],

    watchOut: [
      "Hypotension can be abrupt, especially with IV administration",
      "Excessive AV nodal blockade can cause high-degree heart block",
      "Use in systolic dysfunction or decompensated heart failure carries significant hemodynamic risk",
      "Drug interactions: beta-blockers, digoxin, and others can compound AV nodal effects",
    ],

    signalsToEscalate: [
      "Heart rate falling below provider-ordered target or to a clinically concerning level",
      "New hypotension or hemodynamic decline",
      "High-degree heart block or new conduction changes on ECG",
      "Signs of worsening heart failure or new dyspnea",
      "Clinical response inconsistent with expected effect",
    ],

    linesAccessPolicy: [
      "Peripheral IV generally acceptable; central access follows unit practice for prolonged infusions",
      "Agents with AV nodal effects in the same line require pharmacy confirmation",
      "Transition to oral: follows provider orders and pharmacy guidance",
    ],

    keySafetyNotes: [
      "Hypotension can occur quickly, particularly with IV administration",
      "Avoid or use with caution in systolic dysfunction; clarify with provider if cardiac function is uncertain",
      "AV block risk: monitor rhythm and PR interval throughout",
      "Drug interaction review is important; several common agents compound diltiazem's effects",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Heparin ─────────────────────────────────────────────────────────────────
  {
    id: "heparin",
    name: "Heparin",
    brandName: "Heparin Sodium",
    category: "anticoagulation",
    categoryLabel: "Anticoagulant",
    family: "Anticoagulation",
    badge: "High-alert medication",
    related: [],

    snapshot:
      "An IV anticoagulant that potentiates antithrombin to inhibit clotting factors, used across a range of thrombotic conditions with laboratory monitoring guiding clinical management.",

    effectChips: [
      { label: "anticoagulation" },
      { label: "clot prevention" },
      { label: "lab-guided" },
      { label: "reversible" },
    ],

    mentalModel:
      "Heparin does not dissolve clots — it prevents new clot formation and existing clots from extending. The lab values (aPTT or anti-Xa) are the window into where the patient is in their anticoagulation. Those results, combined with the clinical picture, guide any adjustments the provider orders.",

    commonlyUsedFor: [
      "Venous thromboembolism treatment and prophylaxis",
      "Acute coronary syndrome management, per cardiology and provider orders",
      "Anticoagulation during procedures requiring systemic anticoagulation",
      "Bridging anticoagulation during treatment transitions",
    ],

    whatItIsDoing: [
      "Binds antithrombin, dramatically accelerating its inhibitory effect on clotting factors",
      "Prevents extension of existing thrombus and formation of new clot",
      "Does not directly break down or dissolve existing thrombus",
      "Effect monitored via aPTT or anti-Xa level, per institutional protocol",
      "Reversible: protamine can be used to reverse effect under provider direction",
    ],

    whatNursesMonitor: [
      "aPTT or anti-Xa level per institutional protocol and provider orders",
      "Signs of bleeding: skin, mucous membranes, urine, stool, neurological changes",
      "IV site for infiltration or local bleeding",
      "Platelet count — HIT is a serious complication to watch for",
      "Hemodynamic status in the context of potential bleeding",
      "Any new neurological changes — concern for intracranial bleeding",
    ],

    watchOut: [
      "Bleeding is the primary risk; even minor signs warrant assessment and team communication",
      "HIT can cause paradoxical clotting rather than bleeding; platelet count trend matters",
      "Rate changes follow provider orders and protocol-driven adjustment tables only",
      "Lab results are time-sensitive; delays in checking or acting on values affect safety",
      "Weight-based parameters: confirm correct weight is documented in the chart",
    ],

    signalsToEscalate: [
      "Active or new bleeding at any site",
      "Platelet count dropping significantly — concern for HIT",
      "Laboratory values outside expected range after a dose change",
      "Change in neurological status — concern for intracranial bleeding",
      "Any clinical deterioration in a patient receiving anticoagulation",
    ],

    linesAccessPolicy: [
      "Typically infused via peripheral or central IV",
      "Dedicated lumen preferred; confirm compatibility with co-infusions",
      "High-alert medication: independent double-check per unit policy before administration",
      "Pump library: use the correct heparin channel and concentration entry",
    ],

    keySafetyNotes: [
      "Heparin is a high-alert medication requiring independent verification per unit policy",
      "Any weight-based adjustments follow the ordered protocol; do not adjust without provider order",
      "HIT awareness: new thrombocytopenia in a heparin-exposed patient warrants clinical communication",
      "Bleeding assessment is an ongoing nursing responsibility throughout the infusion",
      "Pump programming: correct concentration and weight verified against current order",
    ],
  },

];

// ─── Compare pairs ────────────────────────────────────────────────────────────
export const COMPARE_PAIRS = [
  {
    id: "norepi-vs-phenyl",
    label: "Norepinephrine vs Phenylephrine",
    aId: "norepinephrine",
    aLabel: "Norepinephrine",
    bId: "phenylephrine",
    bLabel: "Phenylephrine",
    rows: [
      {
        aspect: "Receptor",
        a: "Alpha-1 + beta-1",
        b: "Alpha-1 only",
      },
      {
        aspect: "Heart rate effect",
        a: "Modest increase or neutral",
        b: "Reflex bradycardia possible",
      },
      {
        aspect: "Inotropy",
        a: "Mild positive inotropic effect",
        b: "No direct cardiac effect",
      },
      {
        aspect: "Common context",
        a: "Distributive and vasodilatory presentations",
        b: "Hypotension with tachycardia concern",
      },
      {
        aspect: "Access",
        a: "Central preferred",
        b: "Peripheral acceptable short-term",
      },
    ],
    bottomLine:
      "Both raise MAP through vasoconstriction. Norepinephrine adds a modest cardiac component; phenylephrine acts on vessels only, which can reflexively slow the heart.",
  },
  {
    id: "norepi-vs-vaso",
    label: "Norepinephrine vs Vasopressin",
    aId: "norepinephrine",
    aLabel: "Norepinephrine",
    bId: "vasopressin",
    bLabel: "Vasopressin",
    rows: [
      {
        aspect: "Mechanism",
        a: "Alpha-1 + beta-1 adrenergic",
        b: "V1 receptor (non-catecholamine)",
      },
      {
        aspect: "Heart rate effect",
        a: "Modest increase or neutral",
        b: "No direct chronotropic effect",
      },
      {
        aspect: "Common use pattern",
        a: "Primary vasopressor in vasodilatory presentations",
        b: "Adjunct alongside catecholamine vasopressors",
      },
      {
        aspect: "Adjustment pattern",
        a: "Typically adjusted up or down per orders",
        b: "Often run at a fixed rate per provider order",
      },
      {
        aspect: "Special monitoring",
        a: "Peripheral perfusion, IV site",
        b: "Peripheral perfusion, sodium, urine output",
      },
    ],
    bottomLine:
      "Vasopressin works through a different receptor system and is often added alongside norepinephrine rather than replacing it. Adjustment patterns and monitoring priorities differ.",
  },
  {
    id: "propofol-vs-dex",
    label: "Propofol vs Dexmedetomidine",
    aId: "propofol",
    aLabel: "Propofol",
    bId: "dexmedetomidine",
    bLabel: "Dexmedetomidine",
    rows: [
      {
        aspect: "Sedation depth",
        a: "Deep sedation achievable",
        b: "Lighter, arousable sedation",
      },
      {
        aspect: "Analgesia",
        a: "None",
        b: "Some analgesic-sparing effect; not primary",
      },
      {
        aspect: "Respiratory drive",
        a: "Can suppress significantly",
        b: "Relatively preserved",
      },
      {
        aspect: "Primary hemodynamic watch",
        a: "Hypotension common",
        b: "Bradycardia common",
      },
      {
        aspect: "Distinct concern",
        a: "PRIS with prolonged or high infusions",
        b: "Bradycardia; rebound with abrupt discontinuation",
      },
    ],
    bottomLine:
      "Propofol offers deep, titratable sedation but suppresses breathing and has no analgesic effect. Dexmedetomidine keeps patients more arousable with preserved breathing — bradycardia monitoring is essential.",
  },
  {
    id: "amiodarone-vs-dilt",
    label: "Amiodarone vs Diltiazem",
    aId: "amiodarone",
    aLabel: "Amiodarone",
    bId: "diltiazem",
    bLabel: "Diltiazem",
    rows: [
      {
        aspect: "Primary use",
        a: "Rhythm and rate (broad spectrum)",
        b: "Rate control",
      },
      {
        aspect: "Mechanism",
        a: "Multi-channel: K+, Na+, Ca2+, beta",
        b: "Calcium channel blockade (AV node)",
      },
      {
        aspect: "Duration of effect",
        a: "Very long; effects persist weeks",
        b: "Shorter; manageable with discontinuation",
      },
      {
        aspect: "Systolic function concern",
        a: "Some negative inotropy",
        b: "Significant concern in reduced EF",
      },
      {
        aspect: "Key monitoring",
        a: "QTc, thyroid, liver, lung",
        b: "Heart rate, BP, PR interval",
      },
    ],
    bottomLine:
      "Amiodarone works across multiple channels for broad rhythm control, but its effects outlast the infusion by weeks. Diltiazem is targeted at rate control via the AV node — watch for hypotension and use carefully in systolic dysfunction.",
  },
  {
    id: "heparin-vs-enox",
    label: "IV Heparin vs Enoxaparin (SQ)",
    aId: "heparin",
    aLabel: "Heparin (IV infusion)",
    bId: null,
    bLabel: "Enoxaparin (SQ injection)",
    rows: [
      {
        aspect: "Route",
        a: "Continuous IV infusion",
        b: "Subcutaneous injection",
      },
      {
        aspect: "Monitoring",
        a: "aPTT or anti-Xa per protocol",
        b: "Anti-Xa in selected patients; often clinical",
      },
      {
        aspect: "Reversibility",
        a: "Reverses with protamine",
        b: "Partially reversible with protamine",
      },
      {
        aspect: "Renal consideration",
        a: "Adjustments follow protocol",
        b: "Renal function is a key consideration",
      },
      {
        aspect: "HIT risk",
        a: "Higher relative HIT risk",
        b: "Lower relative HIT risk",
      },
    ],
    bottomLine:
      "IV heparin offers continuous, rapidly adjustable anticoagulation with close laboratory monitoring. Subcutaneous enoxaparin is more predictable in many patients — renal function is a key consideration for both.",
  },
];
