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
  "Insulin drips are really two labs: glucose and potassium.",
  "A sudden pressure change is a line, pump, or patient change until proven otherwise.",
  "Heparin is lab-guided anticoagulation. Bleeding and platelets both matter.",
  "Amiodarone lingers — effects and interactions can outlast the infusion by weeks.",
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

    snapshot:
      "The first-line pressor. Squeezes the vessels to bring MAP up, with a small assist to the heart's squeeze. Less tachycardia than most options.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "↑ MAP" },
      { label: "mild heart support" },
      { label: "watch perfusion" },
    ],

    mentalModel:
      "The vasculature is too relaxed. Norepinephrine helps restore tone. But the MAP number and the patient are both part of the picture — perfusion still has to be assessed at the bedside, not just on the monitor.",

    commonlyUsedFor: [
      "Distributive and vasodilatory shock presentations",
      "Hypotension not adequately responsive to IV fluids",
      "Maintaining a provider-ordered MAP target",
      "Adjunct support in hemodynamically complex presentations",
    ],

    whatItIsDoing: [
      "Tightens peripheral vessel walls, raising resistance and driving MAP up",
      "A mild boost to cardiac contractility comes with it — output usually stays supported",
      "MAP rise is predominantly driven by increased vascular resistance, not heart rate",
      "Less reflex tachycardia than some other vasopressors",
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
      "A different kind of pressor. Works through its own receptor pathway, not the catecholamine route. Usually added alongside another pressor rather than replacing it.",

    effectChips: [
      { label: "↑ SVR" },
      { label: "non-catecholamine" },
      { label: "adjunct pressor" },
      { label: "watch extremities" },
    ],

    mentalModel:
      "Vasopressin takes a different path than norepinephrine. It squeezes the vessels through its own receptor system, not the catecholamine route. It is often added alongside another vasopressor rather than replacing it, and the adjustment patterns differ from what nurses see with standard catecholamine pressors.",

    commonlyUsedFor: [
      "Vasodilatory shock not adequately controlled on catecholamine vasopressors alone",
      "Adjunct vasopressor support alongside norepinephrine or similar agents",
      "Situations where a non-catecholamine mechanism is clinically preferred",
      "Provider-ordered vasopressor combination regimens",
    ],

    whatItIsDoing: [
      "Works through V1 receptors in vessel walls — a different pathway from catecholamine pressors",
      "Raises MAP through vasoconstriction without directly affecting heart rate or contractility",
      "Often used alongside catecholamine vasopressors rather than as a standalone agent",
      "Has an antidiuretic effect that can shift fluid balance; sodium and urine output are both relevant to watch",
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
      "Squeezes the vessels without touching the heart directly. The go-to when the pressure is low and the heart rate is already fast.",

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
    badge: "ACLS agent",
    related: ["norepinephrine", "dobutamine"],

    snapshot:
      "The full-force agent. Rate, squeeze, and vascular tone — all at once. That scope is what makes it essential in arrest and what demands continuous monitoring when it is running as a drip.",

    effectChips: [
      { label: "↑ MAP" },
      { label: "↑ HR" },
      { label: "↑ contractility" },
      { label: "watch ischemia" },
    ],

    mentalModel:
      "Epinephrine hits everything at once — heart rate, contractility, and vascular tone. That broad effect is what makes it essential in cardiac arrest and why its hemodynamic footprint at the bedside requires careful, continuous watching when it is running as an infusion.",

    commonlyUsedFor: [
      "Cardiac arrest per ACLS protocol",
      "Anaphylaxis management",
      "Refractory distributive shock not adequately controlled on other vasopressors",
      "Hemodynamic support where combined vasopressor and inotropic effect is a clinical goal",
    ],

    whatItIsDoing: [
      "Stimulates the heart to beat faster and squeeze harder — more powerfully than most other agents",
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
    ],

    watchOut: [
      "Tachycardia and arrhythmias are expected and can limit ongoing use",
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
      "Central venous access is standard for sustained infusions",
      "Peripheral use is appropriate in acute and arrest situations; central transition planned promptly",
      "Dedicated lumen strongly preferred",
      "Compatibility with all co-infusions: confirm with pharmacy",
    ],

    keySafetyNotes: [
      "High-potency agent: pump programming verified against current order per unit policy",
      "Arrhythmia and ischemia monitoring are continuous responsibilities",
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

    snapshot:
      "The pump booster. Helps a weakened heart push more blood out, but it can soften the blood pressure while it does.",

    effectChips: [
      { label: "↑ inotropy" },
      { label: "↑ HR possible" },
      { label: "↑ CO" },
      { label: "watch arrhythmia" },
    ],

    mentalModel:
      "Dobutamine supports output more than pressure. A falling blood pressure in a patient on dobutamine does not always mean output is worse — these are different signals worth separating at the bedside.",

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

    snapshot:
      "Stronger squeeze, looser vessels. The pressure can drop while the pump gets better. And its effects linger well after any rate change.",

    effectChips: [
      { label: "↑ inotropy" },
      { label: "↓ SVR" },
      { label: "non-catecholamine" },
      { label: "long tail" },
    ],

    mentalModel:
      "Milrinone has a longer tail than dobutamine. Changes in the hemodynamic picture may not feel immediate at the bedside, and the drug's effects continue well after any rate adjustment is made.",

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
      "Longer-acting than dobutamine — effects take time to show and take time to clear after any rate change",
    ],

    whatNursesMonitor: [
      "Blood pressure — hypotension is common and can be significant, especially if the patient is not well-filled",
      "Peripheral perfusion: skin color, temperature, and capillary refill alongside the BP numbers",
      "Heart rate and cardiac rhythm; arrhythmia is a recognized risk throughout the infusion",
      "Urine output as a downstream signal of how perfusion is holding",
      "Renal function on prolonged infusions — the drug clears more slowly when kidneys are impaired",
      "Hemodynamic parameters per provider-ordered monitoring plan",
    ],

    watchOut: [
      "Hypotension is the primary bedside concern — the vessel-relaxing effect can drop BP significantly, particularly in patients who are not volume-replete",
      "Arrhythmias can occur; continuous ECG monitoring is standard",
      "Effects linger — the longer half-life means hemodynamic changes after any rate adjustment take time to stabilize, and the drug stays on board for a while after stopping",
      "Renal function affects how quickly the drug clears; impaired kidneys extend the effect",
    ],

    signalsToEscalate: [
      "Hypotension not responding to clinical management",
      "New or worsening arrhythmia",
      "Hemodynamic deterioration despite ongoing support",
      "Significant changes in renal function",
      "Clinical picture inconsistent with expected response",
    ],

    linesAccessPolicy: [
      "Central venous access is standard for sustained infusions",
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

    snapshot:
      "The on/off sedative. Works fast, clears fast. Does nothing for pain — analgesia needs its own plan alongside it.",

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
      "Quiets CNS activity to produce sedation — adjustable from light to deep",
      "Has no effect on pain pathways — a sedated patient can still be in pain",
      "Clears quickly when the infusion is reduced, giving a manageable and responsive offset",
      "Formulated in a lipid emulsion that contributes to caloric intake on prolonged infusions",
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
    family: "Sedation & Analgesia",
    badge: "Arousable sedation",
    related: ["propofol", "midazolam"],

    snapshot:
      "The shoulder-tap sedative. Calm but usually still rousable and cooperative. Breathing mostly stays intact. Bradycardia is the constant bedside watch.",

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
      "Produces sedation and anxiolysis while leaving patients arousable and often cooperative",
      "Breathing and airway reflexes are largely preserved compared to propofol and benzodiazepines",
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

    snapshot:
      "Sedates and calms, but stacks up quietly on long infusions. Wake-up time runs longer than expected, especially when the liver or kidneys are not clearing it well.",

    effectChips: [
      { label: "sedation" },
      { label: "anxiolysis" },
      { label: "respiratory depression" },
      { label: "accumulates" },
    ],

    mentalModel:
      "Midazolam can accumulate, especially in patients with liver or kidney considerations or on prolonged infusions. What looks like appropriate sedation may be a drug that is building up. Wakeup time is longer than the pharmacology textbook suggests.",

    commonlyUsedFor: [
      "Procedural sedation in monitored settings",
      "Adjunct sedation in mechanically ventilated patients",
      "Anxiolysis in patients where other agents are not appropriate",
      "Acute agitation management in appropriate clinical contexts",
    ],

    whatItIsDoing: [
      "Quiets CNS activity to produce sedation and reduce anxiety",
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
      "Reversal with flumazenil is possible but carries resedation risk; follow provider orders",
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

    snapshot:
      "The pain reliever, not the sedative. Fast onset, relatively gentle on blood pressure. Respiratory monitoring is the constant bedside responsibility.",

    effectChips: [
      { label: "analgesia" },
      { label: "rapid onset" },
      { label: "respiratory depression" },
      { label: "hemodynamically gentle" },
    ],

    mentalModel:
      "Fentanyl is primarily for pain — that matters in the ICU where pain is often undertreated. Sedation without analgesia leaves pain behind. Respiratory monitoring is the constant bedside responsibility; opioid-related respiratory depression can be subtle before it becomes abrupt.",

    commonlyUsedFor: [
      "Analgesia in mechanically ventilated patients",
      "Procedural pain management in the ICU",
      "Adjunct to sedation regimens in patients with pain as a driver of agitation",
      "Patients with hemodynamic sensitivity where other opioids may not be preferred",
    ],

    whatItIsDoing: [
      "Works on opioid receptors to blunt pain — that is the primary purpose",
      "Onset is fast and offset is relatively quick compared to some other opioids",
      "Gentler on blood pressure and less histamine release than some agents in this class",
      "Breathing slows in a dose-related way — this is the main safety concern at the bedside",
    ],

    whatNursesMonitor: [
      "Pain level per validated assessment tool",
      "Respiratory rate and effort — the primary safety monitoring parameter",
      "Oxygen saturation",
      "Level of consciousness and sedation depth",
      "Blood pressure — hemodynamic effects are generally mild but can occur",
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

    snapshot:
      "The pressure-friendly sedative. Blood pressure tends to hold or climb rather than drop. But recovery can be vivid and disorienting — emergence is part of the monitoring plan.",

    effectChips: [
      { label: "dissociative" },
      { label: "hemodynamic support" },
      { label: "bronchodilation" },
      { label: "emergence watch" },
    ],

    mentalModel:
      "Ketamine tends to support blood pressure rather than drop it — that makes it distinct from most sedatives. But the emergence reaction, where patients experience confusion, vivid dreams, or agitation as they wake, is real and needs to be anticipated and managed.",

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
      "Secretions may increase and require suctioning",
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

    snapshot:
      "The rhythm stabilizer with the longest memory. Works on multiple channels at once, and its effects and interactions stay active for weeks after the drip ends.",

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
      "Works across multiple electrical channels in heart tissue to stabilize rhythm and slow conduction",
      "Slows AV node conduction, which brings down the ventricular rate in fast rhythms",
      "Very long half-life — effects and drug interactions persist for weeks after the infusion ends",
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
    related: ["amiodarone", "esmolol"],

    snapshot:
      "The rate brake for AFib and flutter. Slows how fast the ventricles respond, not the underlying rhythm. Rate control and rhythm control are different things.",

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
      "Slows electrical conduction through the AV node, which slows the ventricular rate",
      "Does not correct the underlying rhythm — rate control and rhythm control are not the same thing",
      "Reduces contractility somewhat — relevant in patients with already weakened hearts",
      "Blood pressure can fall as a result of the combined cardiac and vascular effects",
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

    snapshot:
      "The fast-on, fast-off beta-blocker. Rate and pressure respond quickly, and they recover just as fast when the drip stops. Every change deserves close hemodynamic watching.",

    effectChips: [
      { label: "rate control" },
      { label: "↓ BP" },
      { label: "beta-1 selective" },
      { label: "rapid offset" },
    ],

    mentalModel:
      "Esmolol's defining feature is how quickly it wears off — effects resolve in minutes after stopping. That rapid offset is both the advantage (manageable in uncertain situations) and the reason close hemodynamic monitoring matters, because blood pressure and heart rate can shift quickly in either direction.",

    commonlyUsedFor: [
      "Acute rate control in supraventricular tachycardia and atrial fibrillation with rapid ventricular response",
      "Perioperative blood pressure and heart rate management",
      "Hypertensive situations where short-acting beta-blockade is appropriate",
      "Provider-ordered rate or blood pressure control in acute settings",
    ],

    whatItIsDoing: [
      "Blocks the heart's beta-1 receptors to slow rate and reduce the force of contraction",
      "Works and wears off in minutes — that rapid offset is the defining feature and the reason for close watching",
      "Blood pressure falls along with heart rate",
      "Bronchoconstriction is possible even with a selective agent — especially relevant in patients with airway disease",
    ],

    whatNursesMonitor: [
      "Heart rate, per provider-ordered target",
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

    snapshot:
      "The arterial pressure controller. Relaxes vessel walls to bring BP down. Response takes a few minutes to settle after any rate change — worth keeping in mind when reassessing.",

    effectChips: [
      { label: "↓ SVR" },
      { label: "↓ BP" },
      { label: "arterial vasodilation" },
      { label: "reflex HR possible" },
    ],

    mentalModel:
      "Nicardipine works on the arteries to lower resistance and blood pressure. It is adjustable and relatively predictable, but the effect can take several minutes to fully appear after a rate change — worth keeping in mind when assessing the response.",

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
      "Response takes a few minutes to stabilize after a rate change — allow time before reassessing",
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
      "Dedicated lumen preferred",
      "Confirm compatibility with pharmacy for co-infusions",
    ],

    keySafetyNotes: [
      "BP response takes several minutes after a rate change; assess before further adjustments",
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

    snapshot:
      "One of the most powerful BP-lowering drips in the ICU. Fast in, fast out. On long infusions, cyanide buildup is a serious safety concern the whole team needs to know about.",

    effectChips: [
      { label: "↓ SVR" },
      { label: "↓ preload" },
      { label: "rapid onset/offset" },
      { label: "cyanide watch" },
    ],

    mentalModel:
      "Nitroprusside is powerful and fast — it lowers pressure quickly, which can be exactly what is needed. That same speed and potency means the bedside watch is intense, and cyanide toxicity on prolonged infusions is a serious safety concern that requires team awareness.",

    commonlyUsedFor: [
      "Hypertensive emergency with a provider-ordered urgent blood pressure target",
      "Afterload reduction in acute heart failure presentations",
      "Aortic dissection hypertension management",
      "Blood pressure management in perioperative and cardiac surgery settings",
    ],

    whatItIsDoing: [
      "Relaxes both arterial and venous walls very rapidly — blood pressure can drop quickly",
      "Effect reverses just as fast when the infusion stops",
      "Metabolized to cyanide — on prolonged infusions, accumulation is a serious and time-sensitive safety concern",
      "Light-sensitive — the infusion bag and tubing require protection from light throughout",
    ],

    whatNursesMonitor: [
      "Blood pressure, continuously; response is rapid and can be dramatic",
      "Heart rate — reflex tachycardia is common",
      "Signs of cyanide toxicity: altered mental status, lactic acidosis, unexplained hemodynamic deterioration",
      "Light protection of the infusion bag and tubing throughout",
      "Monitoring parameters per provider orders and pharmacy on prolonged infusions",
      "Neurological status",
    ],

    watchOut: [
      "Cyanide accumulation is the most serious toxicity; risk increases with prolonged use",
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
      "Central venous access is standard",
      "Dedicated lumen required",
      "Light protection for infusion bag and tubing per product guidance and unit policy",
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
    brandName: "Tridil / Nitro-Bid",
    category: "vasodilator",
    categoryLabel: "Vasodilator",
    family: "Vasodilators",
    badge: "Nitrate vasodilator",
    related: ["nitroprusside", "nicardipine"],

    snapshot:
      "The preload reliever. Mainly relaxes the veins to reduce the blood returning to the heart. Headache is common and expected. Blood pressure drop is the real watch.",

    effectChips: [
      { label: "↓ preload" },
      { label: "↓ BP" },
      { label: "venous > arterial" },
      { label: "watch headache/BP" },
    ],

    mentalModel:
      "Nitroglycerin primarily relaxes the venous system, reducing how much blood returns to the heart. At higher parameters, it also affects the arteries. The headache it commonly causes is real but not dangerous — the blood pressure drop is the more critical hemodynamic watch.",

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
      "Medication interactions: phosphodiesterase inhibitors are a critical history point",
    ],

    watchOut: [
      "Hypotension can develop rapidly, especially with volume depletion",
      "Headache is very common; comfort measures follow unit practice",
      "Tolerance to vasodilatory effect can develop with prolonged continuous infusions",
      "Phosphodiesterase inhibitors (sildenafil and related agents) represent a serious interaction",
    ],

    signalsToEscalate: [
      "Blood pressure outside provider-ordered target",
      "Symptomatic hypotension: dizziness, syncope, diaphoresis",
      "Persistent chest pain not responding to infusion as expected",
      "Known or suspected phosphodiesterase inhibitor use",
      "Clinical deterioration or new hemodynamic instability",
    ],

    linesAccessPolicy: [
      "Adsorption to standard PVC tubing is a known consideration; follow pharmacy guidance on tubing selection",
      "Peripheral IV is commonly used; central access follows unit practice for sustained infusions",
      "Dedicated lumen preferred",
      "Confirm compatibility with co-infusions via pharmacy",
    ],

    keySafetyNotes: [
      "Phosphodiesterase inhibitor interaction can cause severe hypotension; medication history review is essential",
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

    snapshot:
      "The volume-puller. Signals the kidneys to let go of sodium and water. Output is only half the picture — the potassium and magnesium going with it matter just as much.",

    effectChips: [
      { label: "diuresis" },
      { label: "↓ preload" },
      { label: "electrolyte watch" },
      { label: "renal function" },
    ],

    mentalModel:
      "Furosemide pulls volume out of the body, which is the goal — but the potassium and sodium that go with it matter just as much. The output is only half the picture; the electrolyte trend is the other half.",

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
      "Sodium trends and overall electrolyte balance",
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

    snapshot:
      "Same job as furosemide, different potency per milligram. The monitoring priorities are identical: output, electrolytes, volume status, and kidney function — all watched together.",

    effectChips: [
      { label: "diuresis" },
      { label: "↓ preload" },
      { label: "potent" },
      { label: "electrolyte watch" },
    ],

    mentalModel:
      "Bumetanide is a loop diuretic in the same family as furosemide but with a different potency per milligram. The monitoring priorities are the same: output, electrolytes, volume status, and renal function — all watched together, not in isolation.",

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
      "Sodium and overall electrolyte balance",
      "Renal function: creatinine and BUN trend",
      "Signs of volume depletion",
    ],

    watchOut: [
      "Electrolyte depletion — potassium and magnesium particularly — requires close monitoring",
      "Excessive diuresis can cause volume depletion and impair renal function",
      "Sulfonamide cross-sensitivity is a documented consideration; allergy review follows unit policy",
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

    snapshot:
      "The steering-wheel anticoagulant. Keeps clots from growing, not from dissolving. The lab value is the window into where the patient sits on the anticoagulation spectrum.",

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

    snapshot:
      "The HIT alternative. When heparin has to stop, argatroban takes over. The liver handles most of the clearance, so hepatic function shapes how the drug behaves and how the lab values read.",

    effectChips: [
      { label: "thrombin blocker" },
      { label: "HIT alternative" },
      { label: "lab-guided" },
      { label: "liver-cleared" },
    ],

    mentalModel:
      "Argatroban is the go-to when heparin has to come off. The monitoring still centers on aPTT, but liver function can significantly shape how the drug behaves and how those lab results interpret the anticoagulation level.",

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
      "No reversal agent; stopping the infusion is the primary management step if needed",
    ],

    whatNursesMonitor: [
      "aPTT per protocol and provider orders",
      "Signs of bleeding at all sites",
      "Hepatic function parameters — relevant to drug elimination and clinical response",
      "Platelet count trend in HIT context",
      "IV site and infusion integrity",
      "Hemodynamic status in the context of potential bleeding",
    ],

    watchOut: [
      "Bleeding is the primary risk; any site can be affected",
      "Hepatic impairment can cause drug accumulation and elevated aPTT beyond expected range",
      "No direct reversal agent available; stopping the infusion is the primary management step",
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

    snapshot:
      "Another HIT-safe anticoagulant. Clears through the kidneys and through the bloodstream itself. When kidney function changes, so can the drug's behavior and the lab values.",

    effectChips: [
      { label: "thrombin blocker" },
      { label: "dual-path clearance" },
      { label: "lab-guided" },
      { label: "HIT context" },
    ],

    mentalModel:
      "Bivalirudin works on the same target as argatroban, but clears differently — partly through the kidneys, partly broken down in the bloodstream itself. When kidney function shifts, so can the drug's behavior and the lab values.",

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
      "No reversal agent; stopping the infusion is the primary management step if needed",
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
      "No direct reversal agent; infusion interruption is the primary management step",
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

    snapshot:
      "The glucose drip with a potassium shadow. Watch both numbers, not one. The same mechanism that lowers glucose also pulls potassium into cells.",

    effectChips: [
      { label: "glycemic control" },
      { label: "glucose-guided" },
      { label: "potassium watch" },
      { label: "hypoglycemia risk" },
    ],

    mentalModel:
      "Insulin infusion is really two trends watched in parallel: glucose and potassium. They move together, and missing one while focused on the other is where safety gaps appear.",

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
      "Dextrose-containing co-infusions and their relationship to the overall glucose picture",
    ],

    watchOut: [
      "Hypoglycemia is the primary safety risk; glucose monitoring frequency follows protocol",
      "Potassium and glucose trends move together; electrolyte replacement may be required",
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
      "Rate adjustments follow the ordered protocol; communicate with provider before any change",
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
        a: "Rate follows provider orders in response to MAP target",
        b: "Rate follows provider orders; pattern differs from catecholamine vasopressors",
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
        b: "Moderate elevation possible",
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
    bottomLine:
      "Propofol offers deep, adjustable sedation but suppresses breathing and has no analgesic effect. Dexmedetomidine keeps patients more arousable with preserved breathing — bradycardia monitoring is essential.",
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
        b: "Depression; more pronounced",
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
        b: "Moderate; minutes",
      },
      {
        aspect: "Blood pressure effect",
        a: "Potent; can be dramatic",
        b: "More gradual",
      },
      {
        aspect: "Specific concern",
        a: "Cyanide toxicity on prolonged use",
        b: "Phosphodiesterase inhibitor interaction",
      },
      {
        aspect: "Light sensitivity",
        a: "Required; protect infusion",
        b: "Not required",
      },
    ],
    bottomLine:
      "Nitroprusside is more potent and faster, with both arterial and venous effects. Nitroglycerin works predominantly on the venous system at lower parameters. Cyanide risk makes nitroprusside the more complex agent for prolonged use.",
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
        a: "None; stop infusion",
        b: "None; stop infusion",
      },
    ],
    bottomLine:
      "Both are direct thrombin inhibitors used when heparin is not appropriate. The key distinction is their elimination pathway — hepatic for argatroban, mixed enzymatic-renal for bivalirudin.",
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
        a: "Yes — independent verification required",
        b: "Yes — independent verification required",
      },
      {
        aspect: "Electrolyte consideration",
        a: "Potassium drops with glucose",
        b: "Platelet count (HIT monitoring)",
      },
    ],
    bottomLine:
      "Both are high-alert infusions requiring close laboratory and clinical monitoring. Insulin focuses on glucose and potassium trends; heparin on clotting parameters and bleeding signs. Both carry significant patient safety responsibility.",
  },

];
