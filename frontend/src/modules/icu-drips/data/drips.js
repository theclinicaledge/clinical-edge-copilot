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
  { key: "inotrope",        label: "Inotropes" },
  { key: "sedation",        label: "Sedation & Analgesia" },
  { key: "antiarrhythmic",  label: "Rhythm & Rate" },
  { key: "vasodilator",     label: "Vasodilators" },
  { key: "diuretic",        label: "Diuretics" },
  { key: "anticoagulation", label: "Anticoagulation" },
  { key: "glycemic",        label: "Glycemic" },
];

export const FAMILIES = [
  { key: "pressors",        label: "Pressors & Vasoactives", categories: ["vasopressor"] },
  { key: "inotropes",       label: "Inotropes",              categories: ["inotrope"] },
  { key: "sedation",        label: "Sedation & Analgesia",   categories: ["sedation"] },
  { key: "rhythm",          label: "Rhythm & Rate",          categories: ["antiarrhythmic"] },
  { key: "vasodilators",    label: "Vasodilators",           categories: ["vasodilator"] },
  { key: "diuretics",       label: "Diuretics",              categories: ["diuretic"] },
  { key: "anticoagulation", label: "Anticoagulation",        categories: ["anticoagulation"] },
  { key: "glycemic",        label: "Glycemic",               categories: ["glycemic"] },
];

// ─── Clinical Edge Pearls ─────────────────────────────────────────────────────
export const CLINICAL_PEARLS = [
  "Sedation is not analgesia. A still patient can still be in pain.",
  "Norepinephrine squeezes and gives mild heart support. Phenylephrine mostly just squeezes.",
  "Dobutamine and milrinone can improve output while BP still falls.",
  "Insulin can lower glucose and potassium. Each needs its own trend; DKA also has a ketone and acid-base story.",
  "A sudden pressure change needs the patient picture and a check of measurement, line, and pump integrity.",
  "Heparin is lab-guided anticoagulation. Bleeding and platelets both matter.",
  "Amiodarone can persist after the infusion. Duration of effects and interactions depends on exposure and the patient.",
];

// ─── Foundations ──────────────────────────────────────────────────────────────
export const FOUNDATIONS = [
  {
    id: "central-vs-peripheral",
    title: "Central vs peripheral access",
    body: "Access depends on the medication, formulation, anticipated duration, and local policy. Peripheral vasopressors require close site monitoring and an access plan.",
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
    body: "These drips carry higher risk when programmed incorrectly. Independent checks per local policy and pump verification are important safeguards.",
  },
  {
    id: "ordered-targets",
    title: "Provider-ordered targets",
    body: "The goal is the provider-ordered clinical target. Nurses watch the trend and communicate when response falls outside what is expected.",
  },
];

// ─── Drip entries ─────────────────────────────────────────────────────────────
export const DRIPS = [

  // ════════════════════════════════════════════════════════════════════════════
  // PRESSORS & VASOACTIVES
  // ════════════════════════════════════════════════════════════════════════════

  // ── Norepinephrine ──────────────────────────────────────────────────────────
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    brandName: "Levophed",
    category: "vasopressor",
    categoryLabel: "Vasopressor",
    family: "Pressors & Vasoactives",
    badge: "Common ICU pressor",
    related: ["vasopressin", "epinephrine"],
    urgency: "watch",
    leadFinding: "MAP is the target number, but peripheral perfusion — skin, urine, and mentation — tells the fuller clinical story.",
    pearl: "MAP up does not always mean the patient is better. Skin, urine, and mentation tell the rest of the story.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'up' },
        { key: 'SVR', label: 'SVR', direction: 'up' },
        { key: 'CO',  label: 'CO',  direction: 'variable'  },
        { key: 'CI',  label: 'CI',  direction: 'variable'  },
        { key: 'HR',  label: 'HR',  direction: 'variable'  },
      ],
      note: "HR may change little or fall reflexively. Cardiac output is not guaranteed to rise with MAP.",
    },

    snapshot:
      "A first-line pressor in septic shock. Tightens vessels to raise MAP, with some cardiac stimulation. A higher pressure still needs a matching perfusion assessment.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "↑ MAP" },
      { label: "mild heart support" },
      { label: "watch perfusion" },
    ],

    commonlyUsedFor: [
      "Distributive and vasodilatory shock presentations",
      "Hypotension not adequately responsive to IV fluids",
      "Maintaining a provider-ordered MAP target",
      "Adjunct support in hemodynamically complex presentations",
    ],

    whatItIsDoing: [
      "Tightens peripheral vessel walls, raising resistance and driving MAP up",
      "Beta-1 stimulation can support contractility, but increased resistance can also limit cardiac output",
      "MAP rise is predominantly driven by increased vascular resistance, not heart rate",
      "Heart rate may change little or fall through the baroreceptor reflex as pressure rises",
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
      "Central access is often used for sustained support; peripheral options follow product guidance and local policy",
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
    urgency: "watch",
    leadFinding: "Potent vessel squeeze through a non-catecholamine pathway — skin color, warmth, and urine output signal how peripheral perfusion is holding.",
    pearl: "This one does not behave like norepinephrine. Rate adjustment patterns differ, and sodium and urine output trends tell you things the MAP does not.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'up' },
        { key: 'SVR', label: 'SVR', direction: 'up' },
        { key: 'CO',  label: 'CO',  direction: 'variable'  },
        { key: 'CI',  label: 'CI',  direction: 'variable'  },
        { key: 'HR',  label: 'HR',  direction: 'neutral'   },
      ],
      note: "No direct beta stimulation. Bradycardia and reduced cardiac output remain possible.",
    },

    snapshot:
      "A different kind of pressor. Works through its own receptor pathway, not the catecholamine route. Usually added alongside another pressor rather than replacing it.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "non-catecholamine" },
      { label: "adjunct pressor" },
      { label: "watch extremities" },
    ],

    commonlyUsedFor: [
      "Vasodilatory shock not adequately controlled on catecholamine vasopressors alone",
      "Adjunct vasopressor support alongside norepinephrine or similar agents",
      "Situations where a non-catecholamine mechanism is clinically preferred",
      "Provider-ordered vasopressor combination regimens",
    ],

    whatItIsDoing: [
      "Works through V1 receptors in vessel walls — a different pathway from catecholamine pressors",
      "V1-mediated vasoconstriction raises MAP without beta-receptor stimulation; cardiac output and heart rate can still fall",
      "Often used alongside catecholamine vasopressors rather than as a standalone agent",
      "Has an antidiuretic effect that can shift fluid balance; sodium and urine output are both relevant to watch",
    ],

    whatNursesMonitor: [
      "MAP, per provider-ordered target",
      "Heart rate and rhythm",
      "Peripheral perfusion: skin temperature, color, capillary refill",
      "Urine output",
      "IV site, especially with peripheral access",
      "Sodium and fluid balance; hyponatremia can occur during therapy, and increased urine output with hypernatremia can follow withdrawal",
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
    urgency: "watch",
    leadFinding: "Vessel squeeze without direct beta stimulation. Reflex bradycardia can accompany rising BP and can reduce cardiac output.",
    pearl: "Pressure up with heart rate down can reflect a baroreceptor reflex. A known mechanism does not make new bradycardia harmless; symptoms and perfusion still matter.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'up' },
        { key: 'SVR', label: 'SVR', direction: 'up' },
        { key: 'CO',  label: 'CO',  direction: 'variable'  },
        { key: 'CI',  label: 'CI',  direction: 'variable'  },
        { key: 'HR',  label: 'HR',  direction: 'down'      },
      ],
      note: 'Reflex bradycardia can occur. CO may fall as heart rate slows and afterload rises.',
    },

    snapshot:
      "Raises vascular tone without direct beta stimulation. That distinction matters when tachycardia is a concern, but added afterload can reduce cardiac output.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "↑ MAP" },
      { label: "no beta stimulation" },
      { label: "reflex bradycardia" },
    ],

    commonlyUsedFor: [
      "Hypotension in settings where tachycardia is a clinical concern",
      "Vasodilatory hypotension with a provider preference for a pure alpha agent",
      "Anesthesia-related and procedural hypotension management",
      "Short-term MAP support per provider order",
    ],

    whatItIsDoing: [
      "Tightens peripheral blood vessels to raise MAP — purely a vascular effect",
      "No direct effect on heart rate or cardiac contractility",
      "As MAP rises, the body may reflexively slow the heart rate in response",
      "In patients with limited cardiac reserve, the added resistance without inotropic support can reduce output",
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

  // ── Epinephrine ─────────────────────────────────────────────────────────────
  {
    id: "epinephrine",
    name: "Epinephrine",
    brandName: "Adrenalin",
    category: "vasopressor",
    categoryLabel: "Vasopressor",
    family: "Pressors & Vasoactives",
    badge: "Alpha + beta agonist",
    related: ["norepinephrine", "dobutamine"],
    urgency: "watch",
    leadFinding: "Everything moves at once — heart rate, squeeze, and vascular tone — and rhythm can deteriorate quickly.",
    pearl: "Watch the rhythm continuously. Arrhythmia, ischemia, and perfusion changes all need prompt team communication.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'up' },
        { key: 'SVR', label: 'SVR', direction: 'variable'  },
        { key: 'CO',  label: 'CO',  direction: 'up' },
        { key: 'CI',  label: 'CI',  direction: 'up' },
        { key: 'HR',  label: 'HR',  direction: 'up' },
      ],
    },

    snapshot:
      "Acts on the heart and vessels. Rate and contractility usually rise; vascular resistance varies with exposure. This page describes the monitored IV infusion.",

    effectChips: [
      { label: "↑ MAP" },
      { label: "↑ HR" },
      { label: "↑ contractility" },
      { label: "watch ischemia" },
    ],

    commonlyUsedFor: [
      "Provider-ordered IV support in septic shock",
      "Selected refractory anaphylaxis infusions under specialist-directed monitoring",
      "Refractory distributive shock not adequately controlled on other vasopressors",
      "Hemodynamic support where combined vasopressor and inotropic effect is a clinical goal",
    ],

    whatItIsDoing: [
      "Beta-1 stimulation increases heart rate and contractility, which can increase myocardial oxygen demand",
      "Tightens peripheral vessels to raise MAP alongside the cardiac effects",
      "Relaxes airway smooth muscle — bronchodilation is a recognized and clinically useful effect",
      "Blood glucose rises as a metabolic consequence — monitor alongside hemodynamics",
    ],

    whatNursesMonitor: [
      "MAP, per provider-ordered target",
      "Heart rate — tachycardia is expected and common",
      "Cardiac rhythm; arrhythmia risk is clinically significant",
      "Peripheral perfusion: skin color, temperature, capillary refill",
      "Blood glucose — hyperglycemia is a common metabolic effect",
      "IV site, especially with peripheral access; vasoconstriction is potent",
      "Signs of myocardial ischemia",
      "Lactate in context: beta-2 stimulation can raise lactate without proving worsening hypoperfusion",
    ],

    watchOut: [
      "Tachycardia and arrhythmias can occur and can be clinically significant",
      "Peripheral vasoconstriction can compromise limb and splanchnic perfusion",
      "Hyperglycemia is a common metabolic effect requiring monitoring",
      "Peripheral IV extravasation risk: tissue injury is a concern",
      "Very potent: small delivery interruptions can produce significant hemodynamic changes",
    ],

    signalsToEscalate: [
      "Hemodynamically significant arrhythmia",
      "MAP outside provider-ordered target",
      "Signs of limb ischemia: pallor, cyanosis, mottling, pain",
      "IV site changes concerning for extravasation",
      "Signs of myocardial ischemia: chest pain, new ECG changes",
      "Blood glucose trending significantly outside expected range",
    ],

    linesAccessPolicy: [
      "Central access is often used for sustained support; peripheral options follow product guidance and local policy",
      "Peripheral infusion access follows the product guidance and local vasopressor policy, with close site monitoring",
      "Dedicated lumen strongly preferred",
      "Compatibility with all co-infusions: confirm with pharmacy",
    ],

    keySafetyNotes: [
      "High-potency agent: pump programming verified against current order per unit policy",
      "Arrhythmia and ischemia monitoring are continuous responsibilities",
      "Cardiac-arrest administration and initial anaphylaxis administration are separate from this infusion reference",
      "IV site requires vigilant monitoring with peripheral access",
      "Team communication is essential with any hemodynamic change",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INOTROPES
  // ════════════════════════════════════════════════════════════════════════════

  // ── Dobutamine ──────────────────────────────────────────────────────────────
  {
    id: "dobutamine",
    name: "Dobutamine",
    brandName: "Dobutrex",
    category: "inotrope",
    categoryLabel: "Inotrope",
    family: "Inotropes",
    badge: "Cardiac output support",
    related: ["milrinone", "norepinephrine"],
    urgency: "watch",
    leadFinding: "Cardiac output can improve while BP falls from vasodilation. A lower MAP can still compromise perfusion and needs assessment alongside the output trend.",
    pearl: "Better output and softer pressure can coexist. Neither number alone establishes stability; perfusion and the ordered targets complete the picture.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'variable'  },
        { key: 'SVR', label: 'SVR', direction: 'down'      },
        { key: 'CO',  label: 'CO',  direction: 'up' },
        { key: 'CI',  label: 'CI',  direction: 'up' },
        { key: 'HR',  label: 'HR',  direction: 'up'        },
      ],
    },

    snapshot:
      "The pump booster. Helps a weakened heart push more blood out, but it can soften the blood pressure while it does.",

    effectChips: [
      { label: "↑ inotropy" },
      { label: "↑ HR possible" },
      { label: "↑ CO" },
      { label: "watch arrhythmia" },
    ],

    commonlyUsedFor: [
      "Low cardiac output presentations where inotropic support is provider-ordered",
      "Decompensated heart failure with reduced ejection fraction under specialist guidance",
      "Cardiogenic presentations with preserved or borderline MAP",
      "Short-term hemodynamic support during evaluation and management",
    ],

    whatItIsDoing: [
      "Helps the heart push harder and increase the volume of blood pumped with each beat",
      "A mild vessel-relaxing effect can soften blood pressure while output improves",
      "Heart rate commonly rises — this increases the work and oxygen demand of the heart muscle",
      "MAP response is variable: output up, resistance can come down, and the net result depends on the clinical balance",
    ],

    whatNursesMonitor: [
      "Cardiac output parameters per provider-ordered monitoring plan",
      "Heart rate — tachycardia is common and clinically significant",
      "Blood pressure, which may fall or rise depending on the clinical context",
      "Cardiac rhythm and new arrhythmia activity",
      "Signs of myocardial ischemia: chest pain, new ECG changes",
      "Urine output and peripheral perfusion as downstream markers",
    ],

    watchOut: [
      "Tachycardia is common and increases myocardial oxygen demand",
      "May be associated with proarrhythmic effects in patients with underlying arrhythmia risk",
      "Blood pressure response is variable; falling MAP warrants communication with the team",
      "Longer-term infusion considerations require ongoing provider and pharmacy involvement",
    ],

    signalsToEscalate: [
      "New or worsening tachycardia",
      "Hemodynamically significant arrhythmia",
      "Blood pressure outside provider-ordered target",
      "Signs of myocardial ischemia or new ECG changes",
      "Clinical deterioration despite current support",
    ],

    linesAccessPolicy: [
      "Central venous access preferred for sustained infusions",
      "Peripheral use follows unit protocol with close monitoring",
      "Dedicated lumen preferred",
      "Compatibility with co-infusions: confirm with pharmacy",
    ],

    keySafetyNotes: [
      "Tachycardia monitoring is essential; elevated heart rate increases myocardial oxygen demand",
      "Arrhythmia risk: continuous ECG monitoring is standard practice",
      "Pump programming verified against current order per unit policy",
      "Ongoing need and parameters are team-directed",
    ],
  },

  // ── Milrinone ───────────────────────────────────────────────────────────────
  {
    id: "milrinone",
    name: "Milrinone",
    brandName: "Primacor",
    category: "inotrope",
    categoryLabel: "Inotrope",
    family: "Inotropes",
    badge: "PDE-3 inhibitor",
    related: ["dobutamine", "norepinephrine"],
    urgency: "watch",
    leadFinding: "Vessel relaxation alongside inotropic support can drop blood pressure significantly, and effects take time to settle after any rate change.",
    pearl: "Milrinone clears more slowly than dobutamine, especially with renal impairment. Persistent effects are a reason for continued assessment, not delayed reassessment.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'       },
        { key: 'SVR', label: 'SVR', direction: 'down' },
        { key: 'CO',  label: 'CO',  direction: 'up'         },
        { key: 'CI',  label: 'CI',  direction: 'up'         },
        { key: 'HR',  label: 'HR',  direction: 'variable'    },
      ],
      note: "HR may change little or rise. Hypotension and arrhythmia risk remain important, especially with reduced renal clearance.",
    },

    snapshot:
      "Stronger squeeze, looser vessels. The pressure can drop while the pump gets better. And its effects linger well after any rate change.",

    effectChips: [
      { label: "↑ inotropy" },
      { label: "↓ SVR" },
      { label: "non-catecholamine" },
      { label: "long tail" },
    ],

    commonlyUsedFor: [
      "Cardiogenic presentations with low output and elevated filling pressures",
      "Decompensated heart failure where vasodilation alongside inotropic support is a goal",
      "Bridge support in patients awaiting advanced therapy evaluation",
      "Provider-ordered inotropic support where a non-catecholamine mechanism is preferred",
    ],

    whatItIsDoing: [
      "Helps the heart squeeze harder and pump more blood out with each beat",
      "Simultaneously relaxes vascular walls — resistance falls and blood pressure can drop while cardiac output improves",
      "Works through a different pathway than catecholamine inotropes, so response and tolerance patterns differ",
      "Effects can begin promptly, but clearance is slower than dobutamine; impaired kidneys can prolong exposure further",
    ],

    whatNursesMonitor: [
      "Blood pressure — hypotension is common and can be significant, especially if the patient is not well-filled",
      "Peripheral perfusion: skin color, temperature, and capillary refill alongside the BP numbers",
      "Heart rate and cardiac rhythm; arrhythmia is a recognized risk throughout the infusion",
      "Urine output as a downstream signal of how perfusion is holding",
      "Renal function throughout therapy; impaired kidneys can prolong drug exposure",
      "Hemodynamic parameters per provider-ordered monitoring plan",
    ],

    watchOut: [
      "Hypotension is the primary bedside concern — the vessel-relaxing effect can drop BP significantly, particularly in patients who are not volume-replete",
      "Arrhythmias can occur; continuous ECG monitoring is standard",
      "Effects linger — the longer half-life means hemodynamic changes after any rate adjustment take time to stabilize, and the drug stays on board for a while after stopping",
      "Renal function affects how quickly the drug clears; impaired kidneys extend the effect",
    ],

    signalsToEscalate: [
      "New, worsening, or symptomatic hypotension",
      "New or worsening arrhythmia",
      "Hemodynamic deterioration despite ongoing support",
      "Significant changes in renal function",
      "Clinical picture inconsistent with expected response",
    ],

    linesAccessPolicy: [
      "Central access is often used for sustained support; peripheral options follow product guidance and local policy",
      "Peripheral use follows unit protocol",
      "Dedicated lumen preferred",
      "Compatibility with co-infusions: confirm with pharmacy",
    ],

    keySafetyNotes: [
      "Hypotension is a primary safety concern; close BP monitoring throughout",
      "Arrhythmia monitoring: continuous ECG is standard",
      "The longer half-life means adjustments take time to reflect in the clinical picture",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SEDATION & ANALGESIA
  // ════════════════════════════════════════════════════════════════════════════

  // ── Propofol ────────────────────────────────────────────────────────────────
  {
    id: "propofol",
    name: "Propofol",
    brandName: "Diprivan",
    category: "sedation",
    categoryLabel: "Sedation",
    family: "Sedation & Analgesia",
    badge: "Sedation, not analgesia",
    related: ["dexmedetomidine", "midazolam"],
    urgency: "caution",
    leadFinding: "No analgesic effect — a deeply sedated patient can still be in significant pain, and pain assessment runs separately from sedation scoring.",
    pearl: "Sedated does not mean comfortable. Pain assessment and sedation scoring are separate responsibilities running in parallel.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'     },
        { key: 'SVR', label: 'SVR', direction: 'down'     },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'variable' },
      ],
      note: 'Hypotension and bradycardia can occur. Risk is greater with hypovolemia or hemodynamic fragility.',
    },

    snapshot:
      "Rapid-onset sedation without analgesia. Recovery is often prompt after brief exposure, but prolonged infusions can delay awakening. Pain needs a separate assessment.",

    effectChips: [
      { label: "sedation" },
      { label: "no analgesia" },
      { label: "rapid offset" },
      { label: "↓ BP risk" },
    ],

    commonlyUsedFor: [
      "Continuous sedation in intubated, mechanically ventilated patients",
      "Procedural sedation in monitored settings",
      "Peri-intubation management",
      "Refractory seizure activity under specialist guidance",
    ],

    whatItIsDoing: [
      "Quiets CNS activity to produce sedation — adjustable from light to deep",
      "Has no effect on pain pathways — a sedated patient can still be in pain",
      "Redistributes rapidly after brief exposure; prolonged infusions can accumulate and delay recovery",
      "Formulated in a lipid emulsion that contributes to caloric intake on prolonged infusions",
    ],

    whatNursesMonitor: [
      "Sedation level per validated scale (RASS or SAS), per unit protocol",
      "Blood pressure — hypotension is common",
      "Heart rate and cardiac rhythm",
      "Respiratory status, ventilation, and ventilator synchrony",
      "Pain separately from sedation: self-report when possible, or CPOT/BPS per unit practice",
      "Triglyceride levels with prolonged infusion",
      "Signs of PRIS: metabolic acidosis, elevated lactate, rising CK, new arrhythmia, kidney injury",
      "Urine color",
    ],

    watchOut: [
      "Hypotension can be clinically significant, particularly with volume deficit or hemodynamic fragility",
      "No analgesia: pain must be assessed and managed through a separate approach",
      "PRIS is rare but serious; risk is higher with prolonged or high-rate infusions",
      "Lipid emulsion contributes to caloric load, relevant for nutrition planning",
      "Aseptic handling is required; the emulsion supports microbial growth at room temperature",
    ],

    signalsToEscalate: [
      "New, worsening, or symptomatic hypotension",
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
    family: "Sedation & Analgesia",
    badge: "Arousable sedation",
    related: ["propofol", "midazolam"],
    urgency: "reference",
    leadFinding: "Arousable and cooperative is the intended state on this drug — bradycardia is the main hemodynamic watch throughout the infusion.",
    pearl: "Arousability can fit the ordered light-sedation goal. It does not replace pain assessment or checks for bradycardia, hypotension, and respiratory compromise.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'variable' },
        { key: 'SVR', label: 'SVR', direction: 'variable' },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'down'     },
      ],
      note: 'Bradycardia is the most consistent effect. MAP can go either direction depending on the clinical context.',
    },

    snapshot:
      "Often calm and arousable through reduced sympathetic activity. Breathing is relatively preserved, but airway and respiratory monitoring still matter. Bradycardia and hypotension are key risks.",

    effectChips: [
      { label: "sedation" },
      { label: "anxiolysis" },
      { label: "less respiratory suppression" },
      { label: "arousable" },
    ],

    commonlyUsedFor: [
      "ICU sedation when arousability and patient cooperation are clinical goals",
      "Sedation to support ventilator weaning",
      "Procedural sedation and anxiolysis in monitored settings",
      "Agitation management in selected patients",
    ],

    whatItIsDoing: [
      "Produces sedation and anxiolysis while leaving patients arousable and often cooperative",
      "Respiratory suppression is generally less than with many sedatives; airway obstruction, hypoventilation, and additive effects with other sedatives can still occur",
      "Slows the heart rate — bradycardia is a recognized and expected pharmacological response",
      "Has some analgesic-sparing properties, but is not a primary analgesic",
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
      "Bradycardia can be abrupt, including sinus arrest; withdrawal after prolonged exposure can include agitation, tachycardia, and hypertension",
    ],

    signalsToEscalate: [
      "Heart rate falling to a clinically concerning level",
      "New, worsening, or symptomatic hypotension",
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

  // ── Midazolam ───────────────────────────────────────────────────────────────
  {
    id: "midazolam",
    name: "Midazolam",
    brandName: "Versed",
    category: "sedation",
    categoryLabel: "Sedation",
    family: "Sedation & Analgesia",
    badge: "Benzodiazepine",
    related: ["propofol", "dexmedetomidine"],
    urgency: "caution",
    leadFinding: "This drug accumulates on prolonged infusions — wake-up times run longer than expected, especially when organ clearance is impaired.",
    pearl: "Accumulation can delay awakening, especially with impaired clearance. Unexpected failure to arouse still needs assessment for other causes.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'     },
        { key: 'SVR', label: 'SVR', direction: 'down'     },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'neutral'  },
      ],
    },

    snapshot:
      "Sedates and calms, but stacks up quietly on long infusions. Wake-up time runs longer than expected, especially when the liver or kidneys are not clearing it well.",

    effectChips: [
      { label: "sedation" },
      { label: "anxiolysis" },
      { label: "respiratory depression" },
      { label: "accumulates" },
    ],

    commonlyUsedFor: [
      "Procedural sedation in monitored settings",
      "Adjunct sedation in mechanically ventilated patients",
      "Anxiolysis in patients where other agents are not appropriate",
      "Acute agitation management in appropriate clinical contexts",
    ],

    whatItIsDoing: [
      "Enhances GABA-mediated inhibition to produce sedation, anxiolysis, and amnesia; it does not provide analgesia",
      "Builds up with prolonged infusion — the drug and its active metabolites accumulate",
      "Breathing is suppressed in a dose-dependent way",
      "Clears more slowly than expected on extended infusions, especially with renal or hepatic impairment",
    ],

    whatNursesMonitor: [
      "Sedation level per validated scale (RASS or SAS), per unit protocol",
      "Respiratory rate and effort — respiratory depression is common",
      "Oxygen saturation",
      "Blood pressure — hypotension is possible",
      "Emergence and wakeup timing, particularly with prolonged use",
      "Signs of paradoxical agitation (rare but recognized)",
    ],

    watchOut: [
      "Respiratory depression is dose-dependent and can be significant",
      "Accumulation with prolonged infusion can result in extended sedation beyond expectations",
      "Active metabolites in renal or hepatic impairment can prolong effect considerably",
      "Benzodiazepine use is associated with delirium risk in the ICU",
      "Flumazenil has important seizure, withdrawal, and resedation risks; reversal decisions require provider assessment",
    ],

    signalsToEscalate: [
      "Respiratory rate or oxygen saturation outside acceptable range",
      "Blood pressure below provider-ordered target",
      "Sedation significantly above or below provider-ordered target",
      "Prolonged or unexpected failure to arouse",
      "Clinical signs consistent with paradoxical agitation",
    ],

    linesAccessPolicy: [
      "Peripheral or central IV acceptable",
      "Compatible with a range of co-infusions; confirm with pharmacy",
      "Dedicated lumen preferred in complex multi-infusion setups",
    ],

    keySafetyNotes: [
      "Accumulation risk: prolonged infusions require ongoing reassessment of sedation depth",
      "Respiratory monitoring is essential; resuscitation equipment follows unit protocol",
      "Delirium monitoring: benzodiazepine-associated delirium is a recognized concern in the ICU",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Fentanyl ────────────────────────────────────────────────────────────────
  {
    id: "fentanyl",
    name: "Fentanyl",
    brandName: "Sublimaze",
    category: "sedation",
    categoryLabel: "Analgesia",
    family: "Sedation & Analgesia",
    badge: "Opioid analgesic",
    related: ["midazolam", "ketamine"],
    urgency: "reference",
    leadFinding: "Respiratory rate is the leading safety signal — rate and effort often change before oxygen saturation registers a drop.",
    pearl: "Pain and sedation are different things. A patient can be deeply sedated and still in significant pain if no dedicated analgesic is running.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'variable' },
        { key: 'SVR', label: 'SVR', direction: 'variable' },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'variable' },
      ],
      note: 'Hypotension and bradycardia are possible. Stable vital signs do not exclude respiratory depression.',
    },

    snapshot:
      "An opioid for pain that can also cause sedation. Rapid onset does not guarantee rapid recovery after a prolonged infusion. Respiratory depression is a key safety concern.",

    effectChips: [
      { label: "analgesia" },
      { label: "rapid onset" },
      { label: "respiratory depression" },
      { label: "BP / HR watch" },
    ],

    commonlyUsedFor: [
      "Analgesia in mechanically ventilated patients",
      "Procedural pain management in the ICU",
      "Adjunct to sedation regimens in patients with pain as a driver of agitation",
      "Patients with hemodynamic sensitivity where other opioids may not be preferred",
    ],

    whatItIsDoing: [
      "Works on opioid receptors to blunt pain — that is the primary purpose",
      "Onset is rapid; tissue accumulation during prolonged infusion can delay recovery and extend respiratory depression",
      "Gentler on blood pressure and less histamine release than some agents in this class",
      "Breathing slows in a dose-related way — this is the main safety concern at the bedside",
    ],

    whatNursesMonitor: [
      "Pain level per validated assessment tool",
      "Respiratory rate and effort — the primary safety monitoring parameter",
      "Oxygen saturation",
      "Level of consciousness and sedation depth",
      "Blood pressure and heart rate; hypotension and bradycardia can occur",
      "Signs of opioid-related effects: nausea, pruritus, urinary retention",
    ],

    watchOut: [
      "Respiratory depression is the primary risk; continuous monitoring is essential",
      "Accumulation with prolonged infusion — particularly relevant with reduced clearance",
      "Chest wall rigidity is a recognized effect with rapid administration",
      "Tolerance may develop with prolonged use",
    ],

    signalsToEscalate: [
      "Respiratory rate or oxygen saturation outside acceptable range",
      "Unexplained decrease in level of consciousness",
      "Pain not adequately managed despite current plan",
      "Signs of opioid-related adverse effects requiring clinical response",
    ],

    linesAccessPolicy: [
      "Peripheral or central IV acceptable",
      "Compatible with a range of co-infusions; confirm with pharmacy",
      "High-alert medication: independent verification per unit policy",
    ],

    keySafetyNotes: [
      "Opioid safety: resuscitation and reversal resources follow unit protocol",
      "Respiratory monitoring is the continuous nursing responsibility throughout infusion",
      "Pain assessment and analgesic response are documented per unit standards",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Ketamine ────────────────────────────────────────────────────────────────
  {
    id: "ketamine",
    name: "Ketamine",
    brandName: "Ketalar",
    category: "sedation",
    categoryLabel: "Sedation / Analgesia",
    family: "Sedation & Analgesia",
    badge: "Dissociative agent",
    related: ["fentanyl", "midazolam"],
    urgency: "reference",
    leadFinding: "Blood pressure typically holds or rises on this drug — the emergence phase with confusion or agitation on waking is real and needs anticipation.",
    pearl: "Sympathetic stimulation can raise BP and HR, but hypotension and cardiac depression can occur with catecholamine depletion. Emergence and airway risks remain part of the picture.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'up'      },
        { key: 'SVR', label: 'SVR', direction: 'variable' },
        { key: 'CO',  label: 'CO',  direction: 'up'       },
        { key: 'CI',  label: 'CI',  direction: 'up'       },
        { key: 'HR',  label: 'HR',  direction: 'up'       },
      ],
      note: 'Sympathomimetic effect typically supports BP and HR. Paradoxical depression can occur in catecholamine-depleted states.',
    },

    snapshot:
      "Dissociation and analgesia through NMDA receptor blockade. BP and HR often rise, but cardiovascular stability is not guaranteed. Airway changes and emergence reactions still need assessment.",

    effectChips: [
      { label: "dissociative" },
      { label: "BP / HR can rise" },
      { label: "bronchodilation" },
      { label: "emergence watch" },
    ],

    commonlyUsedFor: [
      "Procedural sedation in patients where hemodynamic stability is a priority",
      "Analgesic adjunct in patients with complex pain management needs",
      "Airway management in hemodynamically compromised patients",
      "Bronchospastic presentations under specialist guidance",
    ],

    whatItIsDoing: [
      "Creates a dissociative state where pain and awareness are both blunted",
      "Blood pressure and heart rate tend to hold or rise rather than fall — a key distinction from most sedatives",
      "Relaxes airway smooth muscle — useful in bronchospastic presentations",
      "Emergence is a distinct recovery phase: patients can experience vivid imagery, confusion, or agitation waking up",
    ],

    whatNursesMonitor: [
      "Blood pressure and heart rate — typically supported, but monitoring is essential",
      "Airway and respiratory status; secretions may increase",
      "Level of consciousness and sedation depth",
      "Signs of emergence: confusion, agitation, vivid imagery during recovery",
      "Laryngospasm risk, particularly in airway-sensitive patients",
    ],

    watchOut: [
      "Emergence phenomena can be distressing for patients and families; preparation matters",
      "Secretions, airway obstruction, respiratory depression, and laryngospasm can occur",
      "Hypotension or cardiac depression can occur in catecholamine-depleted patients",
      "Elevated intracranial or intraocular pressure is a consideration in specific populations",
      "In patients with cardiac disease, the sympathomimetic effect may not be beneficial",
    ],

    signalsToEscalate: [
      "Blood pressure or heart rate outside acceptable range",
      "Respiratory difficulty or laryngospasm",
      "Severe emergence phenomena not responding to comfort measures",
      "Clinical response inconsistent with expected pattern",
    ],

    linesAccessPolicy: [
      "Peripheral or central IV acceptable",
      "Compatibility with co-infusions: confirm with pharmacy",
      "Follow unit protocol for preparation, storage, and monitoring during administration",
    ],

    keySafetyNotes: [
      "Emergence phenomena: patient and family preparation follows unit standards",
      "Resuscitation and airway management resources available per unit protocol",
      "Secretion management: suctioning equipment accessible during administration",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RHYTHM & RATE
  // ════════════════════════════════════════════════════════════════════════════

  // ── Amiodarone ──────────────────────────────────────────────────────────────
  {
    id: "amiodarone",
    name: "Amiodarone",
    brandName: "Cordarone / Nexterone",
    category: "antiarrhythmic",
    categoryLabel: "Antiarrhythmic",
    family: "Rhythm & Rate",
    badge: "Rhythm + rate support",
    related: ["diltiazem", "esmolol"],
    urgency: "watch",
    leadFinding: "Hypotension, bradycardia, and conduction changes are key IV concerns. Drug interactions can persist after the infusion; duration depends on exposure and patient factors.",
    pearl: "A better-looking rhythm does not always mean better perfusion. And amiodarone stays in the picture long after the bag is gone.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'     },
        { key: 'SVR', label: 'SVR', direction: 'down'     },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'down'     },
      ],
      note: 'Hypotension is most common during IV loading. Hemodynamic effect depends heavily on baseline rhythm and volume status.',
    },

    snapshot:
      "A multi-channel antiarrhythmic with a long, variable elimination tail. Effects and interactions can persist after the infusion; their duration varies with prior and cumulative exposure.",

    effectChips: [
      { label: "rhythm control" },
      { label: "rate slowing" },
      { label: "long half-life" },
      { label: "watch QT / BP" },
    ],

    commonlyUsedFor: [
      "Monitored infusion support for recurrent ventricular arrhythmias under provider direction",
      "Hemodynamically stable ventricular tachycardia",
      "Selected AF with rapid ventricular response under specialist direction; conversion and thromboembolic context matter",
      "Ventricular arrhythmia suppression in critically ill patients",
    ],

    whatItIsDoing: [
      "Works across multiple electrical channels in heart tissue to stabilize rhythm and slow conduction",
      "Slows AV node conduction, which brings down the ventricular rate in fast rhythms",
      "Long, variable terminal half-life; interactions can persist after discontinuation, especially with prolonged or prior exposure",
      "Contains iodine, which is relevant to thyroid function on longer courses",
    ],

    whatNursesMonitor: [
      "Cardiac rhythm and rate; continuous ECG during infusion is standard",
      "QTc interval; serial monitoring per provider orders or protocol",
      "Blood pressure — hypotension common, especially during loading",
      "IV site for phlebitis, especially with peripheral access",
      "Thyroid function on longer courses — amiodarone contains iodine",
      "Pulmonary symptoms: new cough, dyspnea, or infiltrates",
      "Liver function tests",
      "Potassium and magnesium; electrolyte abnormalities can increase arrhythmia risk",
    ],

    watchOut: [
      "Peripheral IV phlebitis is a significant concern; site requires regular inspection",
      "IV-associated hypotension can be clinically significant, particularly early in the infusion",
      "QTc prolongation adds risk when combined with other QT-prolonging agents",
      "Drug interactions are broad: warfarin, digoxin, statins, and others",
      "Interactions can continue after the infusion; the time course depends on exposure and patient factors",
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
      "Cardiac-arrest administration is a separate context from this monitored infusion reference",
      "The medication review includes prior amiodarone exposure because interactions can persist after discontinuation",
      "Thyroid, pulmonary, and liver follow-up depends on exposure, symptoms, and the provider-directed plan",
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
    related: ["amiodarone", "esmolol"],
    urgency: "watch",
    leadFinding: "In AF/flutter, a slower ventricular rate does not establish sinus rhythm. BP and AV conduction can also worsen.",
    pearl: "Rate control and rhythm control are not the same. The monitor may look calmer while the underlying problem is still there.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'     },
        { key: 'SVR', label: 'SVR', direction: 'down'     },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'down'     },
      ],
      note: 'CO can fall if negative inotropy is significant. Effect depends on baseline cardiac function.',
    },

    snapshot:
      "The rate brake for AFib and flutter. Slows how fast the ventricles respond, not the underlying rhythm. Rate control and rhythm control are different things.",

    effectChips: [
      { label: "rate control" },
      { label: "↓ AV conduction" },
      { label: "↓ BP possible" },
      { label: "watch block" },
    ],

    commonlyUsedFor: [
      "Rate control in atrial fibrillation or flutter with rapid ventricular response",
      "Supraventricular tachycardia management in appropriate clinical situations",
      "Provider-ordered ventricular rate reduction in monitored settings",
    ],

    whatItIsDoing: [
      "Slows electrical conduction through the AV node, which slows the ventricular rate",
      "In AF or flutter, ventricular rate slowing does not establish conversion to sinus rhythm; some AV-node-dependent SVTs can terminate",
      "Reduces contractility somewhat — relevant in patients with already weakened hearts",
      "Blood pressure can fall as a result of the combined cardiac and vascular effects",
    ],

    whatNursesMonitor: [
      "Heart rate and rhythm; continuous ECG during IV infusion is standard",
      "Blood pressure — hypotension is a common and clinically important side effect",
      "AV conduction and pauses; PR interval only when discrete P waves permit measurement, not during AF",
      "Signs of worsening heart failure: dyspnea, edema, volume status changes",
      "Level of consciousness and overall hemodynamic response",
    ],

    watchOut: [
      "Hypotension can be abrupt, especially with IV administration",
      "Excessive AV nodal blockade can cause high-degree heart block",
      "IV diltiazem carries a guideline harm warning in moderate or severe LV systolic dysfunction; negative inotropy can worsen hemodynamics",
      "Pre-excited AF/flutter with an accessory pathway and ventricular tachycardia are contraindicated contexts in IV labeling",
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
      "Reduced systolic function is an important safety context for provider review; negative inotropy can worsen hemodynamics",
      "AV block risk: monitor rhythm and PR interval throughout",
      "Drug interaction review is important; several common agents compound diltiazem's effects",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Esmolol ─────────────────────────────────────────────────────────────────
  {
    id: "esmolol",
    name: "Esmolol",
    brandName: "Brevibloc",
    category: "antiarrhythmic",
    categoryLabel: "Antiarrhythmic",
    family: "Rhythm & Rate",
    badge: "Ultra-short beta-blocker",
    related: ["diltiazem", "amiodarone"],
    urgency: "watch",
    leadFinding: "Fast on, fast off — hemodynamics can shift quickly in either direction, and every rate change deserves close watching.",
    pearl: "The rapid offset is the defining feature. Beta blockade generally recedes over tens of minutes after discontinuation; immediate recovery is not guaranteed.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'       },
        { key: 'SVR', label: 'SVR', direction: 'neutral'    },
        { key: 'CO',  label: 'CO',  direction: 'down'       },
        { key: 'CI',  label: 'CI',  direction: 'down'       },
        { key: 'HR',  label: 'HR',  direction: 'down' },
      ],
    },

    snapshot:
      "The fast-on, fast-off beta-blocker. Rate and pressure can respond quickly. Recovery after discontinuation still depends on the patient and concurrent drugs. Every change deserves close hemodynamic watching.",

    effectChips: [
      { label: "rate control" },
      { label: "↓ BP" },
      { label: "beta-1 selective" },
      { label: "rapid offset" },
    ],

    commonlyUsedFor: [
      "Acute rate control in supraventricular tachycardia and atrial fibrillation with rapid ventricular response",
      "Perioperative blood pressure and heart rate management",
      "Hypertensive situations where short-acting beta-blockade is appropriate",
      "Provider-ordered rate or blood pressure control in acute settings",
    ],

    whatItIsDoing: [
      "Blocks the heart's beta-1 receptors to slow rate and reduce the force of contraction",
      "Works and wears off in minutes — that rapid offset is the defining feature and the reason for close watching",
      "Blood pressure and cardiac output can fall; the response depends on baseline function and the rhythm",
      "Bronchoconstriction is possible even with a selective agent — especially relevant in patients with airway disease",
    ],

    whatNursesMonitor: [
      "Heart rate and rhythm, including pauses or AV block, per provider-ordered monitoring plan",
      "Blood pressure — hypotension is common and clinically significant",
      "Respiratory status — bronchoconstriction is possible even with selective agents",
      "Level of consciousness and hemodynamic response",
      "Signs of decreased cardiac output in patients with compromised function",
    ],

    watchOut: [
      "Hypotension can be abrupt and significant, particularly in volume-depleted patients",
      "Negative inotropy can worsen hemodynamics in patients with systolic dysfunction",
      "Bronchoconstriction, though less likely than with non-selective agents, remains a consideration",
      "Rapid onset means hemodynamic changes can appear quickly after rate changes",
    ],

    signalsToEscalate: [
      "Heart rate outside provider-ordered target",
      "New or worsening hypotension",
      "Signs of decreased cardiac output",
      "Respiratory distress or bronchospasm",
      "Clinical response inconsistent with expected pattern",
    ],

    linesAccessPolicy: [
      "Peripheral or central IV acceptable",
      "Concentration follows pharmacy guidance for preparation",
      "Dedicated lumen preferred; confirm compatibility with pharmacy",
    ],

    keySafetyNotes: [
      "Rapid onset and offset: close hemodynamic monitoring is essential during rate adjustments",
      "Hypotension can occur quickly; resuscitation resources follow unit protocol",
      "Bronchoconstriction risk: respiratory assessment is part of ongoing monitoring",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // VASODILATORS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Nicardipine ─────────────────────────────────────────────────────────────
  {
    id: "nicardipine",
    name: "Nicardipine",
    brandName: "Cardene",
    category: "vasodilator",
    categoryLabel: "Vasodilator",
    family: "Vasodilators",
    badge: "Calcium channel vasodilator",
    related: ["nitroprusside", "nitroglycerin"],
    urgency: "watch",
    leadFinding: "Arterial dilation lowers resistance and afterload. BP can continue changing after an adjustment, so the trend and patient assessment matter together.",
    pearl: "A new rate is not an instant steady state. Ongoing BP and symptom assessment helps explain the response; adjustment timing belongs to the active order and protocol.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down' },
        { key: 'SVR', label: 'SVR', direction: 'down' },
        { key: 'CO',  label: 'CO',  direction: 'variable'     },
        { key: 'CI',  label: 'CI',  direction: 'variable'     },
        { key: 'HR',  label: 'HR',  direction: 'up'          },
      ],
      note: 'Reflex tachycardia may accompany BP reduction. CO may be preserved or rise with afterload reduction; baseline function matters.',
    },

    snapshot:
      "The arterial pressure controller. Relaxes vessel walls to bring BP down. Response takes a few minutes to settle after any rate change — worth keeping in mind when reassessing.",

    effectChips: [
      { label: "↓ SVR" },
      { label: "↓ BP" },
      { label: "arterial vasodilation" },
      { label: "reflex HR possible" },
    ],

    commonlyUsedFor: [
      "Acute hypertensive emergency management per provider-ordered settings",
      "Post-neurosurgical blood pressure control",
      "Hypertensive presentations in patients where oral medication is not appropriate",
      "Blood pressure management per provider-ordered target range",
    ],

    whatItIsDoing: [
      "Relaxes arterial walls to reduce vascular resistance and lower blood pressure",
      "Predominantly an arterial effect — less impact on the venous system than nitrates",
      "Reflex tachycardia may follow as blood pressure falls",
      "Onset and full response have different time courses; ongoing BP assessment follows the ordered monitoring plan",
    ],

    whatNursesMonitor: [
      "Blood pressure, per provider-ordered target",
      "Heart rate — reflex tachycardia is a recognized response",
      "Neurological status in patients with intracranial pathology",
      "IV site — phlebitis with peripheral infusion is a known consideration",
      "Signs of hypotension or excessive blood pressure reduction",
    ],

    watchOut: [
      "Reflex tachycardia can be clinically significant",
      "Excessive blood pressure reduction can compromise cerebral or coronary perfusion",
      "Advanced aortic stenosis is a labeled contraindication; heart failure and hepatic impairment also affect risk",
      "Effect may take several minutes to stabilize after a rate change",
      "Phlebitis risk with peripheral infusion: site monitoring is important",
    ],

    signalsToEscalate: [
      "Blood pressure outside provider-ordered target range",
      "Symptomatic hypotension or hemodynamic decline",
      "New or worsening tachycardia",
      "Neurological changes in patients with intracranial pathology",
      "IV site changes consistent with phlebitis",
    ],

    linesAccessPolicy: [
      "Central venous access preferred for sustained infusions",
      "Peripheral use is associated with phlebitis risk; site monitoring is essential",
      "Line-sharing restrictions vary by formulation; some ready-to-use products prohibit other drugs in the same line",
      "Exact product labeling and pharmacy guidance govern access, compatibility, and peripheral site intervals",
    ],

    keySafetyNotes: [
      "BP response evolves after rate changes; monitoring and adjustments follow the active order and protocol",
      "Phlebitis at peripheral sites is clinically meaningful — inspect regularly",
      "Pump programming verified against current order per unit policy",
      "Hypotension warrants prompt clinical communication",
    ],
  },

  // ── Nitroprusside ───────────────────────────────────────────────────────────
  {
    id: "nitroprusside",
    name: "Nitroprusside",
    brandName: "Nipride / Nitropress",
    category: "vasodilator",
    categoryLabel: "Vasodilator",
    family: "Vasodilators",
    badge: "Potent vasodilator",
    related: ["nitroglycerin", "nicardipine"],
    urgency: "watch",
    leadFinding: "BP can fall abruptly. Cyanide toxicity can occur early, while thiocyanate can accumulate with continued exposure; both need team awareness.",
    pearl: "Two toxicity pathways matter: cyanide can accumulate rapidly, while thiocyanate builds with prolonged exposure, especially with impaired renal clearance.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down' },
        { key: 'SVR', label: 'SVR', direction: 'down' },
        { key: 'CO',  label: 'CO',  direction: 'variable'    },
        { key: 'CI',  label: 'CI',  direction: 'variable'    },
        { key: 'HR',  label: 'HR',  direction: 'up'          },
      ],
      note: 'CO can improve through afterload reduction in patients with elevated SVR. Response is rapid and can be dramatic.',
    },

    snapshot:
      "One of the most powerful BP-lowering drips in the ICU. Fast in, fast out. Cyanide toxicity can occur early; prolonged exposure also brings thiocyanate risk, especially with renal impairment.",

    effectChips: [
      { label: "↓ SVR" },
      { label: "↓ preload" },
      { label: "rapid onset/offset" },
      { label: "cyanide watch" },
    ],

    commonlyUsedFor: [
      "Hypertensive emergency with a provider-ordered urgent blood pressure target",
      "Afterload reduction in acute heart failure presentations",
      "Blood pressure management in perioperative and cardiac surgery settings",
    ],

    whatItIsDoing: [
      "Relaxes both arterial and venous walls very rapidly — blood pressure can drop quickly",
      "Effect reverses just as fast when the infusion stops",
      "Metabolism releases cyanide; toxicity can develop rapidly if production exceeds detoxification. Thiocyanate, a downstream metabolite, is renally cleared",
      "Light-protection requirements depend on the formulation and container; exact product labeling and pharmacy guidance apply",
    ],

    whatNursesMonitor: [
      "Blood pressure, continuously; response is rapid and can be dramatic",
      "Heart rate — reflex tachycardia is common",
      "Signs of cyanide toxicity: altered mental status, lactic acidosis, unexplained hemodynamic deterioration",
      "Product-specific light protection and infusion integrity",
      "Renal and hepatic function; thiocyanate monitoring when indicated by exposure and the ordered plan",
      "New tinnitus, confusion, or hyperreflexia can accompany thiocyanate toxicity",
      "Neurological status",
    ],

    watchOut: [
      "Cyanide toxicity can occur early and is exposure-dependent; acidosis may be a late clue",
      "Very rapid onset and offset: pressure changes can be abrupt",
      "Light-sensitive: infusion requires protection from light per product and pharmacy guidance",
      "Reflex tachycardia is common and can be significant in patients with coronary disease",
      "Renal and hepatic function affect toxicity risk on prolonged infusions",
    ],

    signalsToEscalate: [
      "Blood pressure outside provider-ordered target",
      "Signs consistent with cyanide toxicity: altered mental status, unexplained lactic acidosis",
      "Hemodynamic deterioration despite infusion",
      "Any clinical change that may indicate toxicity on prolonged infusion",
      "Any new neurological change",
    ],

    linesAccessPolicy: [
      "Central or peripheral access follows the exact product guidance and local policy",
      "Dedicated lumen required",
      "Light protection per the exact product label and pharmacy guidance; covering tubing is not a universal requirement",
      "Pharmacy involvement is essential for preparation, concentration, and monitoring parameters",
    ],

    keySafetyNotes: [
      "Cyanide toxicity is a serious and time-sensitive safety concern; team awareness is essential",
      "Light protection is a handling requirement throughout the infusion",
      "Pump programming verified against current order per unit policy",
      "Prolonged infusions require close monitoring and active provider/pharmacy communication",
    ],
  },

  // ── Nitroglycerin ───────────────────────────────────────────────────────────
  {
    id: "nitroglycerin",
    name: "Nitroglycerin",
    brandName: "Nitroglycerin (IV)",
    category: "vasodilator",
    categoryLabel: "Vasodilator",
    family: "Vasodilators",
    badge: "Nitrate vasodilator",
    related: ["nitroprusside", "nicardipine"],
    urgency: "watch",
    leadFinding: "Headache is common, but severe or unusual headache still needs assessment. Hypotension can be abrupt, particularly when preload is limited.",
    pearl: "Venous pooling reduces cardiac filling and workload. That same effect can lower BP sharply, especially with PDE-5 inhibitors or riociguat.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'down'     },
        { key: 'SVR', label: 'SVR', direction: 'down'     },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'up'       },
      ],
      note: 'Predominantly venodilatory at lower parameters; arterial vasodilation becomes more significant at higher parameters.',
    },

    snapshot:
      "The preload reliever. Mainly relaxes the veins to reduce the blood returning to the heart. Headache and BP changes both need context; severe or unusual symptoms cannot automatically be attributed to the drug.",

    effectChips: [
      { label: "↓ preload" },
      { label: "↓ BP" },
      { label: "venous > arterial" },
      { label: "watch headache/BP" },
    ],

    commonlyUsedFor: [
      "Acute coronary syndrome chest pain management",
      "Acute decompensated heart failure with volume overload and hypertension",
      "Hypertensive presentations where nitrate therapy is appropriate",
      "Provider-ordered blood pressure or symptom management",
    ],

    whatItIsDoing: [
      "Relaxes venous walls to reduce how much blood returns to the heart — this is the primary effect",
      "At higher parameters, arterial walls relax too and blood pressure falls more broadly",
      "May improve blood flow distribution to coronary vessels",
      "Tolerance to the vasodilatory effect can develop with continuous infusion over time",
    ],

    whatNursesMonitor: [
      "Blood pressure, per provider-ordered target",
      "Heart rate — reflex tachycardia is possible",
      "Headache is common and expected; severe or new-onset headache warrants team communication",
      "Signs of hypotension: dizziness, altered mental status, symptom change",
      "Medication interactions: PDE-5 inhibitors are a critical history point",
    ],

    watchOut: [
      "Hypotension can develop rapidly, especially with volume depletion or other preload-dependent states",
      "Headache is very common; comfort measures follow unit practice",
      "Tolerance to vasodilatory effect can develop with prolonged continuous infusions",
      "PDE-5 inhibitors (such as sildenafil) and riociguat are contraindicated combinations because profound hypotension can occur",
    ],

    signalsToEscalate: [
      "Blood pressure outside provider-ordered target",
      "Symptomatic hypotension: dizziness, syncope, diaphoresis",
      "Persistent chest pain not responding to infusion as expected",
      "Known or suspected PDE-5 inhibitor or riociguat exposure",
      "Clinical deterioration or new hemodynamic instability",
    ],

    linesAccessPolicy: [
      "Adsorption to standard PVC tubing is a known consideration; follow pharmacy guidance on tubing selection",
      "Peripheral IV is commonly used; central access follows unit practice for sustained infusions",
      "Dedicated lumen preferred",
      "Confirm compatibility with co-infusions via pharmacy",
    ],

    keySafetyNotes: [
      "PDE-5 inhibitors and riociguat can cause profound hypotension with nitrates; medication-history review is essential",
      "Tubing material matters for this drug; follow pharmacy and unit guidance",
      "Pump programming verified against current order per unit policy",
      "Tolerance development on prolonged infusions is a known clinical consideration",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // DIURETICS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Furosemide ──────────────────────────────────────────────────────────────
  {
    id: "furosemide",
    name: "Furosemide",
    brandName: "Lasix",
    category: "diuretic",
    categoryLabel: "Diuretic",
    family: "Diuretics",
    badge: "Loop diuretic",
    related: ["bumetanide"],
    urgency: "reference",
    leadFinding: "Output is only half the picture — potassium and magnesium going out in the urine matter just as much as the volume coming off.",
    pearl: "Watch the electrolytes alongside the output. The volume removal is the goal; the potassium and magnesium depletion is the cost.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'variable' },
        { key: 'SVR', label: 'SVR', direction: 'neutral'  },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'variable' },
      ],
      note: 'Hemodynamic response depends on volume status and cardiac function. Arrows cannot predict an individual response.',
    },

    snapshot:
      "The volume-puller. Signals the kidneys to let go of sodium and water. Output is only half the picture — the potassium and magnesium going with it matter just as much.",

    effectChips: [
      { label: "diuresis" },
      { label: "↓ preload" },
      { label: "electrolyte watch" },
      { label: "renal function" },
    ],

    commonlyUsedFor: [
      "Acute decompensated heart failure with volume overload",
      "Volume management in critically ill patients per provider orders",
      "Pulmonary edema requiring urgent diuresis",
      "Electrolyte-driven conditions where controlled volume removal is part of the plan",
    ],

    whatItIsDoing: [
      "Signals the kidney to stop reabsorbing sodium, chloride, and water — diuresis follows",
      "Potassium and magnesium go out in the urine too — electrolyte monitoring is essential alongside the output goal",
      "IV administration produces a faster response than oral dosing",
      "If renal function is significantly impaired, the diuretic response may be blunted",
    ],

    whatNursesMonitor: [
      "Urine output — volume, color, and timing of diuretic response",
      "Blood pressure — volume removal can cause hypotension",
      "Potassium and magnesium levels per provider-ordered frequency",
      "Sodium, chloride, and bicarbonate trends; loop diuretics can contribute to metabolic alkalosis",
      "Net fluid balance, weight trend, edema, and respiratory findings alongside urine output",
      "Creatinine and BUN — renal function can be affected by volume depletion",
      "Signs of volume depletion: dizziness, lightheadedness, tachycardia",
    ],

    watchOut: [
      "Electrolyte depletion — particularly potassium and magnesium — is a primary monitoring responsibility",
      "Excessive diuresis can cause hypovolemia and impair renal function",
      "Ototoxicity is a recognized risk with rapid IV administration",
      "Diuretic response may be reduced in patients with significantly impaired renal function",
    ],

    signalsToEscalate: [
      "Urine output significantly below expected response",
      "Signs of volume depletion: hypotension, tachycardia, dizziness",
      "Electrolyte values outside expected range",
      "Worsening renal function in the context of diuretic use",
      "New hearing changes or complaints",
    ],

    linesAccessPolicy: [
      "Typically administered via peripheral or central IV",
      "Administration rate follows provider orders and pharmacy guidance",
      "Confirm compatibility with co-infusions via pharmacy",
    ],

    keySafetyNotes: [
      "Electrolyte monitoring is an ongoing nursing responsibility throughout diuretic therapy",
      "Volume depletion is a real risk; clinical signs and lab values should be assessed together",
      "Pump programming verified against current order per unit policy if administered by infusion",
      "Administration rate: follow provider orders; ototoxicity risk is a reason rate matters",
    ],
  },

  // ── Bumetanide ──────────────────────────────────────────────────────────────
  {
    id: "bumetanide",
    name: "Bumetanide",
    brandName: "Bumex",
    category: "diuretic",
    categoryLabel: "Diuretic",
    family: "Diuretics",
    badge: "Potent loop diuretic",
    related: ["furosemide"],
    urgency: "reference",
    leadFinding: "Electrolyte depletion follows the volume — potassium and magnesium monitoring runs alongside urine output tracking.",
    pearl: "Same monitoring priorities as furosemide. Output, electrolytes, volume status, and kidney function are watched as a set, not individually.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'variable' },
        { key: 'SVR', label: 'SVR', direction: 'neutral'  },
        { key: 'CO',  label: 'CO',  direction: 'variable' },
        { key: 'CI',  label: 'CI',  direction: 'variable' },
        { key: 'HR',  label: 'HR',  direction: 'variable' },
      ],
      note: 'Hemodynamic response depends on volume status and cardiac function. Arrows cannot predict an individual response.',
    },

    snapshot:
      "Same job as furosemide, different potency per milligram. The monitoring priorities are identical: output, electrolytes, volume status, and kidney function — all watched together.",

    effectChips: [
      { label: "diuresis" },
      { label: "↓ preload" },
      { label: "potent" },
      { label: "electrolyte watch" },
    ],

    commonlyUsedFor: [
      "Volume overload management where a different loop diuretic profile is clinically indicated",
      "Acute decompensated heart failure under provider direction",
      "Volume removal in critically ill patients per provider orders",
      "Situations where furosemide response has been clinically inadequate",
    ],

    whatItIsDoing: [
      "Works through the same kidney mechanism as furosemide to produce diuresis",
      "More potent per milligram — dose equivalence between loop diuretics is a pharmacy consideration",
      "Potassium, magnesium, and sodium are lost in the urine alongside the excess water",
      "IV administration produces rapid onset of diuresis",
    ],

    whatNursesMonitor: [
      "Urine output — volume and timing of response",
      "Potassium and magnesium levels; electrolyte depletion is a primary monitoring concern",
      "Blood pressure — volume removal can cause hypotension",
      "Sodium, chloride, and bicarbonate trends; loop diuretics can contribute to metabolic alkalosis",
      "Net fluid balance, weight trend, edema, and respiratory findings alongside urine output",
      "Renal function: creatinine and BUN trend",
      "Signs of volume depletion",
    ],

    watchOut: [
      "Electrolyte depletion — potassium and magnesium particularly — requires close monitoring",
      "Excessive diuresis can cause volume depletion and impair renal function",
      "Hypersensitivity history and the type of prior reaction matter; allergy review follows pharmacy and unit policy",
      "Ototoxicity is a recognized risk with rapid IV administration",
    ],

    signalsToEscalate: [
      "Inadequate diuretic response",
      "Electrolyte values outside expected range",
      "Hypotension or signs of volume depletion",
      "Worsening renal function",
      "New hearing changes",
    ],

    linesAccessPolicy: [
      "Typically administered via peripheral or central IV",
      "Administration rate follows provider orders and pharmacy guidance",
      "Confirm compatibility with co-infusions via pharmacy",
    ],

    keySafetyNotes: [
      "Higher milligram potency than furosemide: dose equivalence requires pharmacy awareness",
      "Electrolyte monitoring is essential; potassium and magnesium depletion is the consistent risk",
      "Pump programming verified against current order per unit policy if administered by infusion",
      "Volume depletion monitoring is an ongoing nursing responsibility",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ANTICOAGULATION
  // ════════════════════════════════════════════════════════════════════════════

  // ── Heparin ─────────────────────────────────────────────────────────────────
  {
    id: "heparin",
    name: "Heparin",
    brandName: "Heparin Sodium",
    category: "anticoagulation",
    categoryLabel: "Anticoagulant",
    family: "Anticoagulation",
    badge: "High-alert medication",
    related: ["argatroban", "bivalirudin"],
    urgency: "caution",
    leadFinding: "aPTT or anti-Xa is interpreted against the ordered protocol, alongside bleeding, hemoglobin, and platelet trends. An in-range result does not rule out complications.",
    pearl: "Heparin does two things: prevents clots from growing, and occasionally causes new ones through HIT. Both need to stay on the radar.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'neutral' },
        { key: 'SVR', label: 'SVR', direction: 'neutral' },
        { key: 'CO',  label: 'CO',  direction: 'neutral' },
        { key: 'CI',  label: 'CI',  direction: 'neutral' },
        { key: 'HR',  label: 'HR',  direction: 'neutral' },
      ],
      note: 'No primary direct hemodynamic effect.',
    },

    snapshot:
      "The steering-wheel anticoagulant. Limits new clot formation and extension; it does not dissolve existing clots. The lab value is the window into where the patient sits on the anticoagulation spectrum.",

    effectChips: [
      { label: "anticoagulation" },
      { label: "clot prevention" },
      { label: "lab-guided" },
      { label: "reversible" },
    ],

    commonlyUsedFor: [
      "Therapeutic anticoagulation for venous thromboembolism; routine prophylaxis usually uses a different regimen and route",
      "Acute coronary syndrome management, per cardiology and provider orders",
      "Anticoagulation during procedures requiring systemic anticoagulation",
      "Bridging anticoagulation during clinical transitions",
    ],

    whatItIsDoing: [
      "Amplifies the body's natural clotting inhibitor, slowing clotting factor activity broadly",
      "Prevents existing clots from growing and new clots from forming",
      "Does not dissolve or break down clots that are already present",
      "Effect is monitored via aPTT or anti-Xa level per institutional protocol",
      "Reversible — a reversal agent is available under provider direction if needed",
    ],

    whatNursesMonitor: [
      "aPTT or anti-Xa level per institutional protocol and provider orders",
      "Signs of bleeding: skin, mucous membranes, urine, stool, neurological changes",
      "IV site for infiltration or local bleeding",
      "Hemoglobin/hematocrit and platelet trends; HIT can occur even if the platelet count remains in the normal range",
      "Potassium per the monitoring plan; heparin can cause hyperkalemia",
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
      "Substantial platelet fall or new thrombosis, including after recent heparin exposure; concern for HIT",
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

  // ── Argatroban ──────────────────────────────────────────────────────────────
  {
    id: "argatroban",
    name: "Argatroban",
    brandName: "Argatroban",
    category: "anticoagulation",
    categoryLabel: "Anticoagulant",
    family: "Anticoagulation",
    badge: "Direct thrombin inhibitor",
    related: ["bivalirudin", "heparin"],
    urgency: "caution",
    leadFinding: "No specific antidote is available. Bleeding needs prompt team assessment; hepatic impairment can prolong anticoagulation after the infusion ends.",
    pearl: "No antidote does not mean no options for supportive care. Early bleeding recognition and prompt provider communication matter, particularly with impaired hepatic clearance.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'neutral' },
        { key: 'SVR', label: 'SVR', direction: 'neutral' },
        { key: 'CO',  label: 'CO',  direction: 'neutral' },
        { key: 'CI',  label: 'CI',  direction: 'neutral' },
        { key: 'HR',  label: 'HR',  direction: 'neutral' },
      ],
      note: 'No primary direct hemodynamic effect.',
    },

    snapshot:
      "A non-heparin option in HIT. The liver handles most of the clearance, so hepatic function shapes how the drug behaves and how the lab values read.",

    effectChips: [
      { label: "thrombin blocker" },
      { label: "HIT alternative" },
      { label: "lab-guided" },
      { label: "liver-cleared" },
    ],

    commonlyUsedFor: [
      "Anticoagulation management when HIT is confirmed or clinically suspected",
      "Thrombosis prevention and management in HIT-associated presentations",
      "Anticoagulation during procedures where heparin is contraindicated",
      "Provider-ordered transition from heparin in high-risk clinical situations",
    ],

    whatItIsDoing: [
      "Directly blocks thrombin — the final step in clot formation — without needing a cofactor",
      "Prevents clot extension and new clot formation",
      "Cleared primarily through the liver — hepatic function shapes how the drug behaves and how lab results read",
      "No specific antidote; bleeding management and any infusion changes belong to the treating team and active protocol",
    ],

    whatNursesMonitor: [
      "aPTT for HIT infusions or ACT in procedural settings, per the ordered protocol",
      "INR can also rise with argatroban; during warfarin overlap it does not reflect warfarin alone",
      "Signs of bleeding at all sites",
      "Hepatic function parameters — relevant to drug elimination and clinical response",
      "Platelet count trend in HIT context",
      "IV site and infusion integrity",
      "Hemodynamic status in the context of potential bleeding",
    ],

    watchOut: [
      "Bleeding is the primary risk; any site can be affected",
      "Hepatic impairment can cause drug accumulation and elevated aPTT beyond expected range",
      "No specific antidote; anticoagulant effects may persist longer with hepatic impairment",
      "Drug interactions: antiplatelet agents and other anticoagulants can compound bleeding risk",
    ],

    signalsToEscalate: [
      "Active or new bleeding at any site",
      "aPTT values outside expected range",
      "Signs of hepatic deterioration in the context of argatroban use",
      "Clinical deterioration in a patient receiving anticoagulation",
      "Infusion interruption or access problem",
    ],

    linesAccessPolicy: [
      "Typically infused via central or peripheral IV",
      "Dedicated lumen preferred",
      "High-alert medication: independent double-check per unit policy",
      "Preparation follows pharmacy guidelines for concentration and compatibility",
    ],

    keySafetyNotes: [
      "Argatroban is a high-alert medication; independent verification per unit policy is standard",
      "No reversal agent: bleeding management requires prompt team communication",
      "Hepatic function is a key consideration for dose parameters and laboratory interpretation",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ── Bivalirudin ─────────────────────────────────────────────────────────────
  {
    id: "bivalirudin",
    name: "Bivalirudin",
    brandName: "Angiomax",
    category: "anticoagulation",
    categoryLabel: "Anticoagulant",
    family: "Anticoagulation",
    badge: "Direct thrombin inhibitor",
    related: ["argatroban", "heparin"],
    urgency: "caution",
    leadFinding: "Renal function shapes how this drug clears — when kidney function shifts, so do the drug's behavior and the coagulation values.",
    pearl: "Kidney trends and coagulation monitoring go together here. A creatinine change is a reason to reconsider what the lab values mean.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'neutral' },
        { key: 'SVR', label: 'SVR', direction: 'neutral' },
        { key: 'CO',  label: 'CO',  direction: 'neutral' },
        { key: 'CI',  label: 'CI',  direction: 'neutral' },
        { key: 'HR',  label: 'HR',  direction: 'neutral' },
      ],
      note: 'No primary direct hemodynamic effect.',
    },

    snapshot:
      "A non-heparin anticoagulant used in selected HIT and procedural settings. Clears through the kidneys and through the bloodstream itself. When kidney function changes, so can the drug's behavior and the lab values.",

    effectChips: [
      { label: "thrombin blocker" },
      { label: "dual-path clearance" },
      { label: "lab-guided" },
      { label: "HIT context" },
    ],

    commonlyUsedFor: [
      "Anticoagulation during percutaneous coronary intervention and cardiac catheterization",
      "Anticoagulation management when HIT is a clinical concern",
      "Situations where a direct thrombin inhibitor with a different elimination profile is preferred",
      "Provider-ordered anticoagulation in selected procedural contexts",
    ],

    whatItIsDoing: [
      "Directly blocks thrombin without needing a cofactor — same target as argatroban, different clearance path",
      "Cleared partly through the kidneys and partly broken down in the bloodstream itself",
      "Renal function changes can shift how the drug accumulates and how lab values read",
      "No specific antidote; bleeding management and any infusion changes belong to the treating team and active protocol",
    ],

    whatNursesMonitor: [
      "aPTT or ACT per provider orders and institutional protocol",
      "Renal function parameters — relevant to drug elimination and dose considerations",
      "Signs of bleeding at all sites",
      "Platelet count trend",
      "Hemodynamic stability in the context of anticoagulation",
    ],

    watchOut: [
      "Bleeding is the primary risk",
      "Renal impairment can extend drug effect and alter laboratory monitoring results",
      "No specific antidote; renal impairment can prolong anticoagulant effects",
      "Drug interactions with other anticoagulant or antiplatelet agents compound bleeding risk",
    ],

    signalsToEscalate: [
      "Active or new bleeding at any site",
      "Laboratory values outside expected range",
      "Signs of worsening renal function in the context of bivalirudin use",
      "Any hemodynamic deterioration",
      "Infusion interruption or access problem",
    ],

    linesAccessPolicy: [
      "Typically infused via central or peripheral IV",
      "Dedicated lumen preferred; confirm compatibility with pharmacy",
      "High-alert medication: independent double-check per unit policy",
    ],

    keySafetyNotes: [
      "Bivalirudin is a high-alert medication; independent verification per unit policy is standard",
      "No reversal agent: bleeding management requires prompt communication with the team",
      "Renal function changes can alter drug behavior and laboratory values",
      "Pump programming verified against current order per unit policy",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // GLYCEMIC
  // ════════════════════════════════════════════════════════════════════════════

  // ── Insulin Infusion ────────────────────────────────────────────────────────
  {
    id: "insulin-infusion",
    name: "Insulin Infusion",
    brandName: "Regular Insulin (IV)",
    category: "glycemic",
    categoryLabel: "Glycemic",
    family: "Glycemic",
    badge: "High-alert medication",
    related: ["heparin"],
    urgency: "caution",
    leadFinding: "Insulin can lower both glucose and serum potassium, but the trends are not interchangeable. In DKA, improving glucose alone does not establish resolution.",
    pearl: "Two trends, one drug. Missing the potassium while focused on glucose is where safety gaps appear on insulin infusions.",
    hemodynamics: {
      rows: [
        { key: 'MAP', label: 'MAP', direction: 'neutral' },
        { key: 'SVR', label: 'SVR', direction: 'neutral' },
        { key: 'CO',  label: 'CO',  direction: 'neutral' },
        { key: 'CI',  label: 'CI',  direction: 'neutral' },
        { key: 'HR',  label: 'HR',  direction: 'neutral' },
      ],
      note: 'No primary direct hemodynamic effect.',
    },

    snapshot:
      "The glucose drip with a potassium shadow. Watch both numbers, not one. Insulin promotes glucose uptake and potassium entry into cells through related but distinct actions.",

    effectChips: [
      { label: "glycemic control" },
      { label: "glucose-guided" },
      { label: "potassium watch" },
      { label: "hypoglycemia risk" },
    ],

    commonlyUsedFor: [
      "Hyperglycemia management in critically ill patients per provider-ordered protocols",
      "Diabetic ketoacidosis management under provider and pharmacy direction",
      "Hyperglycemic hyperosmolar state management",
      "Perioperative glycemic control per institutional protocol",
    ],

    whatItIsDoing: [
      "Moves glucose from the bloodstream into cells, lowering blood sugar",
      "Pulls potassium into cells at the same time — potassium can fall as glucose comes down",
      "IV infusion gives precise, rapidly adjustable control of blood glucose",
      "Rate adjustments follow the ordered protocol based on glucose monitoring results",
    ],

    whatNursesMonitor: [
      "Blood glucose per provider-ordered monitoring frequency and protocol",
      "Potassium levels — closely linked to insulin activity and glucose trends",
      "Signs of hypoglycemia: diaphoresis, tremor, tachycardia, altered mental status",
      "Signs of electrolyte disturbance based on potassium trends",
      "Infusion site and pump function — undetected interruptions affect glucose control",
      "Nutrition and dextrose interruptions; intake changes can alter hypoglycemia risk",
      "Ketones and acid-base status in DKA; glucose can improve before ketoacidosis resolves",
      "Renal function; reduced insulin clearance can increase hypoglycemia risk",
    ],

    watchOut: [
      "Hypoglycemia is the primary safety risk; glucose monitoring frequency follows protocol",
      "A glucose result cannot predict the potassium result; electrolyte assessment follows the ordered protocol",
      "Infusion interruptions can cause glucose fluctuations — line problems require prompt communication",
      "Rate adjustments follow the ordered protocol only; changes without provider order are not appropriate",
    ],

    signalsToEscalate: [
      "Glucose below the provider-ordered threshold or symptomatic hypoglycemia",
      "Glucose not responding as expected to current infusion parameters",
      "Potassium values outside acceptable range",
      "Any infusion interruption or access problem",
      "Clinical signs of hypoglycemia in a non-verbal or sedated patient",
    ],

    linesAccessPolicy: [
      "Dedicated lumen preferred to avoid compatibility issues with other infusions",
      "Central or peripheral IV following unit practice",
      "High-alert medication: independent double-check per unit policy before administration",
      "Insulin infusion protocols are pharmacy-reviewed; follow the current protocol exactly",
    ],

    keySafetyNotes: [
      "Insulin is a high-alert medication; independent verification per unit policy is standard",
      "Glucose and potassium are monitored in parallel — both require consistent assessment",
      "Infusion changes follow the active order and protocol; unexpected responses need provider communication",
      "Infusion interruptions require prompt communication; glucose control can shift rapidly",
      "Pump programming: correct concentration verified against current order per unit policy",
    ],
  },

];

// ─── Compare pairs ────────────────────────────────────────────────────────────
export const COMPARE_PAIRS = [

  // ── Pressors ──────────────────────────────────────────────────────────────
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
        a: "Little change or reflex slowing; response varies",
        b: "Reflex bradycardia possible",
      },
      {
        aspect: "Inotropy",
        a: "Mild positive inotropic effect",
        b: "No direct beta stimulation",
      },
      {
        aspect: "Common context",
        a: "Distributive and vasodilatory presentations",
        b: "Hypotension with tachycardia concern",
      },
      {
        aspect: "Access",
        a: "Access follows product and local policy",
        b: "Peripheral use per policy with close site checks",
      },
    ],
    clinicalScenario: {
      title: "When pressure rises but the heart slows",
      setup: "A hypotensive patient is already on the slower side, and the blood pressure improves while the heart rate drifts down.",
      bedsideRead: "Reflex slowing can follow a rise in pressure with either agent. It is particularly recognizable with phenylephrine, which has no direct beta stimulation.",
      whyItMatters: "The hemodynamic difference between these two becomes visible in the heart rate trend, not just the MAP.",
    },
    keyDistinction:
      "Norepinephrine has a mild cardiac component; phenylephrine is pure vasoconstriction. When cardiac support matters alongside pressure, they are not interchangeable.",
    commonConfusion:
      "Nurses sometimes expect phenylephrine to behave like norepinephrine. The reflex bradycardia with phenylephrine catches teams off guard, especially in patients already on the slower side.",
    bedsidePearl:
      "Reflex bradycardia is one explanation for a falling HR on phenylephrine. Rhythm, symptoms, perfusion, and concurrent drugs still need review.",
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
        a: "Little change or reflex slowing; response varies",
        b: "No direct chronotropic effect",
      },
      {
        aspect: "Common use pattern",
        a: "Primary vasopressor in vasodilatory presentations",
        b: "Adjunct alongside catecholamine vasopressors",
      },
      {
        aspect: "Adjustment pattern",
        a: "Rate follows provider orders in response to MAP target",
        b: "Rate follows provider orders; pattern differs from catecholamine vasopressors",
      },
      {
        aspect: "Special monitoring",
        a: "Peripheral perfusion, IV site",
        b: "Peripheral perfusion, sodium, urine output",
      },
    ],
    clinicalScenario: {
      title: "When MAP rises without more heart stimulation",
      setup: "The MAP improves, but the heart rate and rhythm stay mostly unchanged.",
      bedsideRead: "V1-mediated vascular tone support can explain this pattern. A stable HR is not unique to vasopressin; the drug list and patient context still matter.",
      whyItMatters: "It helps separate vessel tone from cardiac stimulation when reading the trend — the monitor tells a different story depending on which pressor is running.",
    },
    keyDistinction:
      "Vasopressin works through a completely different receptor system. It is not a stronger norepinephrine — it is a different class of pressor with a different physiologic role.",
    commonConfusion:
      "Nurses used to norepinephrine sometimes expect the same dose-response pattern from vasopressin. Adjustment patterns and clinical behavior differ meaningfully between the two.",
    bedsidePearl:
      "When both are running simultaneously, peripheral perfusion monitoring becomes especially important — ischemic risk at the extremities compounds when multiple vasoconstrictors are active.",
    bottomLine:
      "Vasopressin works through a different receptor system and is often added alongside norepinephrine rather than replacing it. Adjustment patterns and monitoring priorities differ.",
  },

  // ── Inotropes ──────────────────────────────────────────────────────────────
  {
    id: "dobutamine-vs-milrinone",
    label: "Dobutamine vs Milrinone",
    aId: "dobutamine",
    aLabel: "Dobutamine",
    bId: "milrinone",
    bLabel: "Milrinone",
    rows: [
      {
        aspect: "Mechanism",
        a: "Catecholamine (beta-1 agonist)",
        b: "PDE-3 inhibitor (non-catecholamine)",
      },
      {
        aspect: "Heart rate effect",
        a: "Commonly elevated",
        b: "Small increase possible",
      },
      {
        aspect: "Vasodilation",
        a: "Mild (beta-2 effect)",
        b: "More pronounced (smooth muscle)",
      },
      {
        aspect: "Elimination",
        a: "Short half-life",
        b: "Longer half-life; renal function relevant",
      },
      {
        aspect: "Key monitoring",
        a: "Arrhythmia, BP, tachycardia",
        b: "Hypotension, arrhythmia, renal function",
      },
    ],
    clinicalScenario: {
      title: "When output improves but pressure softens",
      setup: "The cardiac output picture improves, but the blood pressure does not rise the way the team expected.",
      bedsideRead: "That pattern can appear when inotropy and vasodilation are moving in opposite directions at the same time.",
      whyItMatters: "Milrinone's longer tail means the current hemodynamic picture may reflect what was running hours earlier — not just what is happening right now.",
    },
    keyDistinction:
      "Milrinone's longer half-life means hemodynamic changes linger well after any rate adjustment. Earlier exposure can still contribute, especially with impaired renal clearance.",
    commonConfusion:
      "Both support cardiac output, so nurses sometimes think of them as interchangeable. Milrinone's renal elimination makes it behave very differently in patients with impaired kidney function — effects accumulate.",
    bedsidePearl:
      "With milrinone, vasodilatory hypotension can be more pronounced and longer-lasting than expected. Trending BP closely after any rate change is essential — the effect does not resolve quickly.",
    bottomLine:
      "Both support cardiac output in low-output presentations, but through different mechanisms. Milrinone's longer half-life means hemodynamic changes take longer to stabilize after any rate adjustment.",
  },

  // ── Sedation ───────────────────────────────────────────────────────────────
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
    clinicalScenario: {
      title: "When calm looks different on the monitor",
      setup: "Two patients look equally calm, but one has softer blood pressure while the other has a slower heart rate.",
      bedsideRead: "The monitor pattern can help explain whether vasodilation or bradycardia is the dominant bedside signal.",
      whyItMatters: "Sedation depth is not the only story — the hemodynamic pattern helps a nurse anticipate which direction the vital signs are likely to drift.",
    },
    keyDistinction:
      "Propofol can achieve deep sedation and suppresses respiratory drive significantly. Dexmedetomidine keeps patients arousable with relatively preserved breathing — it is not a substitute when deep sedation is the clinical goal.",
    commonConfusion:
      "Dexmedetomidine's bradycardia effect is frequently underestimated. Nurses focused on its arousability benefit are sometimes caught off guard when heart rate trends down significantly over time.",
    bedsidePearl:
      "Dexmedetomidine can cause gradual or abrupt bradycardia, including sinus arrest. Continuous trend assessment follows the ordered monitoring plan; there is no guaranteed warning window.",
    bottomLine:
      "Propofol offers deep, adjustable sedation but suppresses breathing and has no analgesic effect. Dexmedetomidine often permits arousability with less respiratory suppression, but bradycardia, hypotension, and airway compromise remain possible.",
  },
  {
    id: "midazolam-vs-propofol",
    label: "Midazolam vs Propofol",
    aId: "midazolam",
    aLabel: "Midazolam",
    bId: "propofol",
    bLabel: "Propofol",
    rows: [
      {
        aspect: "Drug class",
        a: "Benzodiazepine",
        b: "Sedative-hypnotic (IV lipid emulsion)",
      },
      {
        aspect: "Analgesic properties",
        a: "None",
        b: "None",
      },
      {
        aspect: "Accumulation risk",
        a: "Significant with prolonged infusions",
        b: "Lower, due to rapid redistribution",
      },
      {
        aspect: "Respiratory effect",
        a: "Depression; dose-dependent",
        b: "Depression; additive with other CNS depressants",
      },
      {
        aspect: "Key safety concern",
        a: "Delirium association; prolonged wakeup",
        b: "PRIS (rare); lipid load; aseptic technique",
      },
    ],
    bottomLine:
      "Neither provides analgesia — pain assessment remains separate for both. Propofol offers more manageable, faster-offset sedation. Midazolam accumulates more with prolonged use, extending wakeup time beyond expectations.",
  },

  // ── Rhythm & Rate ──────────────────────────────────────────────────────────
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
        a: "Long, variable elimination; persistence depends on exposure",
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
        b: "Heart rate, BP, AV conduction; PR when measurable",
      },
    ],
    bottomLine:
      "Amiodarone acts across multiple channels; interactions can persist after discontinuation. Diltiazem slows the ventricular response in AF/flutter through the AV node. Both can cause hypotension and conduction changes; reduced systolic function is a key safety context.",
  },
  {
    id: "esmolol-vs-dilt",
    label: "Esmolol vs Diltiazem",
    aId: "esmolol",
    aLabel: "Esmolol",
    bId: "diltiazem",
    bLabel: "Diltiazem",
    rows: [
      {
        aspect: "Mechanism",
        a: "Beta-1 selective blockade",
        b: "Calcium channel blockade (AV node)",
      },
      {
        aspect: "Offset",
        a: "Ultra-short (minutes after stopping)",
        b: "Longer duration of effect",
      },
      {
        aspect: "Blood pressure effect",
        a: "Decreases; can be abrupt",
        b: "Decreases; can be abrupt",
      },
      {
        aspect: "Systolic function concern",
        a: "Negative inotropy; caution in dysfunction",
        b: "Significant concern in reduced EF",
      },
      {
        aspect: "Unique consideration",
        a: "Bronchoconstriction possible",
        b: "AV block risk; drug interactions",
      },
    ],
    bottomLine:
      "Both slow the heart rate and lower blood pressure, but through different mechanisms. Esmolol's rapid offset makes it manageable in uncertain situations. Both require caution in systolic dysfunction.",
  },

  // ── Vasodilators ───────────────────────────────────────────────────────────
  {
    id: "nitroprusside-vs-ntg",
    label: "Nitroprusside vs Nitroglycerin",
    aId: "nitroprusside",
    aLabel: "Nitroprusside",
    bId: "nitroglycerin",
    bLabel: "Nitroglycerin",
    rows: [
      {
        aspect: "Primary effect",
        a: "Arterial + venous vasodilation",
        b: "Predominantly venous (venodilation)",
      },
      {
        aspect: "Onset/offset",
        a: "Very rapid; seconds to minutes",
        b: "Rapid; minutes",
      },
      {
        aspect: "Blood pressure effect",
        a: "Potent; can be dramatic",
        b: "Can be rapid; preload and exposure matter",
      },
      {
        aspect: "Specific concern",
        a: "Cyanide can occur early; thiocyanate with accumulation",
        b: "PDE-5 inhibitor / riociguat interaction",
      },
      {
        aspect: "Light sensitivity",
        a: "Required; protect infusion",
        b: "Not required",
      },
    ],
    bottomLine:
      "Nitroprusside relaxes arteries and veins rapidly. Nitroglycerin predominantly affects veins, with arterial effects as exposure increases. Either can lower BP abruptly. Cyanide and thiocyanate are distinct toxicity concerns for nitroprusside.",
  },

  {
    id: "nicardipine-vs-ntg",
    label: "Nicardipine vs Nitroglycerin",
    aId: "nicardipine",
    aLabel: "Nicardipine",
    bId: "nitroglycerin",
    bLabel: "Nitroglycerin",
    rows: [
      {
        aspect: "Primary vascular effect",
        a: "Arterial vasodilation (afterload reduction)",
        b: "Venodilation (preload reduction)",
      },
      {
        aspect: "MAP lowering profile",
        a: "Reliable, arterial-driven",
        b: "Can be rapid; preload and exposure matter; venous return dependent",
      },
      {
        aspect: "Heart rate pattern",
        a: "Reflex tachycardia can occur",
        b: "Reflex tachycardia can occur",
      },
      {
        aspect: "Clinical role",
        a: "Acute BP control in selected monitored settings",
        b: "Cardiac offloading; elevated filling pressures",
      },
      {
        aspect: "Tubing consideration",
        a: "Standard IV tubing",
        b: "Tubing per product/pharmacy guidance; PVC can bind drug",
      },
    ],
    clinicalScenario: {
      title: "When the number falls, but for different reasons",
      setup: "The blood pressure comes down on both, but one pattern points more toward arterial afterload reduction while the other reflects preload and venous offloading.",
      bedsideRead: "The bedside clue is whether the clinical context is systemic BP control or an ischemic-chest-pain physiology with elevated filling pressures.",
      whyItMatters: "Both can lower the MAP number, but the hemodynamic story each tells — and the monitoring priorities that follow — are not identical.",
    },
    keyDistinction:
      "Nicardipine reduces afterload through arterial vasodilation. Nitroglycerin reduces preload through venodilation. The same MAP number can mask very different mechanisms and clinical pathways.",
    commonConfusion:
      "Both lower MAP, so they can look equivalent at a glance. The distinction matters: Their different arterial and venous effects explain why the same BP result can have a different physiologic basis.",
    bedsidePearl:
      "A faster HR with falling BP can reflect a baroreceptor response to either vasodilator. Rhythm, symptoms, preload, and concurrent drugs help explain the trend.",
    bottomLine:
      "Nicardipine primarily lowers arterial resistance and afterload. Nitroglycerin primarily lowers venous return and preload, with arterial effects as exposure increases. The indication and patient context explain the monitoring priorities; this comparison does not select therapy.",
  },

  // ── Anticoagulation ────────────────────────────────────────────────────────
  {
    id: "argatroban-vs-bival",
    label: "Argatroban vs Bivalirudin",
    aId: "argatroban",
    aLabel: "Argatroban",
    bId: "bivalirudin",
    bLabel: "Bivalirudin",
    rows: [
      {
        aspect: "Mechanism",
        a: "Direct thrombin inhibitor",
        b: "Direct thrombin inhibitor",
      },
      {
        aspect: "Elimination",
        a: "Primarily hepatic",
        b: "Enzymatic + renal",
      },
      {
        aspect: "Monitoring",
        a: "aPTT",
        b: "aPTT or ACT (context-dependent)",
      },
      {
        aspect: "Key organ concern",
        a: "Liver function",
        b: "Renal function",
      },
      {
        aspect: "Reversal",
        a: "No specific antidote; team-directed bleeding care",
        b: "No specific antidote; team-directed bleeding care",
      },
    ],
    bottomLine:
      "Both are direct thrombin inhibitors used when heparin is not appropriate. The key distinction is their elimination pathway — hepatic for argatroban, mixed enzymatic-renal for bivalirudin.",
  },
  {
    id: "heparin-vs-enox",
    additionalSourceIds: ["dailymed-enoxaparin"],
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
      "IV heparin offers continuous, rapidly adjustable anticoagulation with close laboratory monitoring. Subcutaneous enoxaparin has a different monitoring and clearance profile. Renal impairment can prolong its effect, and its lower HIT risk does not make it a non-heparin alternative for acute HIT.",
  },

  // ── Glycemic ───────────────────────────────────────────────────────────────
  {
    id: "insulin-vs-heparin",
    label: "Insulin Infusion vs Heparin Infusion",
    aId: "insulin-infusion",
    aLabel: "Insulin Infusion",
    bId: "heparin",
    bLabel: "Heparin Infusion",
    rows: [
      {
        aspect: "Primary effect",
        a: "Lowers blood glucose",
        b: "Prevents clot extension",
      },
      {
        aspect: "Laboratory monitoring",
        a: "Blood glucose, potassium",
        b: "aPTT or anti-Xa",
      },
      {
        aspect: "Primary risk",
        a: "Hypoglycemia",
        b: "Bleeding",
      },
      {
        aspect: "High-alert status",
        a: "Yes; verification per local policy",
        b: "Yes; verification per local policy",
      },
      {
        aspect: "Additional monitoring",
        a: "Potassium can fall independently of the glucose trend",
        b: "Hemoglobin and platelets (HIT awareness)",
      },
    ],
    bottomLine:
      "Both are high-alert infusions requiring close laboratory and clinical monitoring. Insulin focuses on glucose and potassium trends; heparin on clotting parameters and bleeding signs. Both carry significant patient safety responsibility.",
  },

];
