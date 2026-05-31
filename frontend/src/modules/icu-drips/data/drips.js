// ─── ICU Drips — Educational Reference Data ──────────────────────────────────
// NO dosing, NO concentrations, NO starting/max rates, NO titration steps.
// Observational language only. All clinical decisions follow provider orders,
// unit protocols, and pharmacy guidance.

export const SAFETY_DISCLAIMER =
  "Specific dosing, ranges, and titration steps follow your unit's orders, protocols, and pharmacy. This is educational, not a clinical order.";

export const CATEGORIES = [
  { key: "all",             label: "All drips" },
  { key: "vasopressor",     label: "Vasopressors" },
  { key: "sedation",        label: "Sedation" },
  { key: "antiarrhythmic",  label: "Antiarrhythmics" },
];

export const DRIPS = [
  // ── Norepinephrine ──────────────────────────────────────────────────────────
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    brandName: "Levophed",
    category: "vasopressor",
    categoryLabel: "Vasopressor",
    snapshot:
      "The first-line vasopressor in distributive and septic shock. Primarily increases systemic vascular resistance through alpha-1 stimulation, raising MAP without the pronounced tachycardia seen with other agents.",

    clinicalUse: [
      "First-line agent in septic and distributive shock",
      "Hypotension refractory to adequate IV fluid resuscitation",
      "Maintenance of a mean arterial pressure (MAP) target per provider orders",
      "Adjunctive support in selected cardiogenic shock presentations under close monitoring",
    ],

    mechanism:
      "Norepinephrine acts primarily on alpha-1 adrenergic receptors, producing systemic vasoconstriction and raising afterload. It has modest beta-1 activity that provides a mild inotropic effect — enough to prevent the severe reflex bradycardia associated with pure alpha agonists like phenylephrine. The net hemodynamic result is a higher MAP driven largely by increased systemic vascular resistance rather than increased cardiac output.",

    monitoring: [
      "Mean arterial pressure (MAP) — the primary clinical endpoint; target is set by provider order",
      "Heart rate — reflex bradycardia can occur, especially at higher infusion parameters",
      "Peripheral perfusion — skin color, temperature, and capillary refill of the extremities",
      "Urine output — a downstream marker of end-organ perfusion adequacy",
      "IV site (if peripheral access is in use) — inspect frequently for infiltration or extravasation",
      "Level of consciousness and mental status as indirect markers of cerebral perfusion",
      "Extremity pulses and overall limb perfusion at regular intervals",
    ],

    titrationConcept:
      "Titrated to a MAP target defined by provider order — typically individualized to the clinical context and underlying condition. All adjustments follow unit protocol and provider direction. The clinical goal is the lowest effective parameter that maintains adequate perfusion, reassessed continuously against the hemodynamic response.",

    bedsideConcerns: [
      "Extravasation causes severe tissue necrosis — the IV site requires vigilant, frequent inspection, especially on peripheral access",
      "Peripheral vasoconstriction reduces limb perfusion; cold, mottled, or cyanotic extremities signal concern and require prompt provider notification",
      "High parameters may mask concurrent hypovolemia — adequate volume resuscitation is a parallel priority, not a sequential one",
      "Reflex bradycardia can occur; changes in HR in a vasoconstricted patient warrant reassessment",
      "Abrupt discontinuation carries a risk of rebound hypotension — all weaning is a gradual, provider-directed process",
    ],

    linesAccess:
      "Central venous access is strongly preferred and is standard of care for sustained infusions. Peripheral administration may occur in time-critical situations per unit protocol, always with close site monitoring and a clear plan for prompt transition to central access. A dedicated infusion port or lumen is the norm. Compatibility with co-infusing medications requires pharmacy verification.",

    escalationSignals: [
      "MAP persistently below target despite infusion at ordered parameters",
      "Signs of extremity ischemia — pallor, cyanosis, pain, paresthesias, or loss of palpable pulses",
      "Extravasation at the IV site with surrounding tissue changes (blanching, firmness, discoloration)",
      "New or worsening cardiac arrhythmia",
      "Hemodynamic deterioration despite vasopressor support — signals the need for additional clinical intervention",
      "Loss of IV access or inability to maintain adequate infusion",
    ],

    weaningConcepts:
      "Weaning follows provider orders as the underlying cause resolves and hemodynamics stabilize. Reductions are gradual to prevent rebound hypotension, with nursing assessment of MAP and perfusion status at each step. The care team evaluates fluid status, end-organ function, and overall clinical trajectory before and during dose reductions.",

    safetyFlags: [
      "Never continue an infusion through a line with confirmed extravasation or infiltration — stop immediately and notify the provider",
      "Peripheral infusion requires a written escalation plan, defined site check intervals, and a rapid transition pathway to central access",
      "Do not abruptly discontinue — rebound hypotension risk requires a structured weaning plan",
      "All infusion parameter changes follow provider orders; verify pump programming against the order per unit policy",
      "Phentolamine is the antidote for extravasation-associated tissue injury — confirm your unit's protocol and where to locate it",
    ],
  },

  // ── Propofol ────────────────────────────────────────────────────────────────
  {
    id: "propofol",
    name: "Propofol",
    brandName: "Diprivan",
    category: "sedation",
    categoryLabel: "Sedation / Hypnotic",
    snapshot:
      "A short-acting IV sedative-hypnotic widely used for mechanically ventilated ICU patients. Highly titratable due to rapid redistribution, with no analgesic properties — pain management must be addressed separately.",

    clinicalUse: [
      "Continuous sedation for intubated, mechanically ventilated ICU patients",
      "Procedural sedation in appropriately monitored settings",
      "Adjunct management in the peri-intubation period",
      "Refractory status epilepticus under neurology or critical care guidance",
    ],

    mechanism:
      "Propofol potentiates GABA-A receptor inhibitory activity, producing dose-dependent CNS depression that ranges from mild sedation to deep hypnosis. It has no analgesic properties — the mechanism does not address pain pathways, making concurrent analgesia a clinical requirement. The lipid-based formulation enables rapid redistribution from the CNS, giving propofol a short effective duration and making it highly responsive to infusion rate changes. This makes it a favored agent when frequent clinical reassessment and rapid adjustment are priorities.",

    monitoring: [
      "Sedation level using a validated scale (e.g., RASS or SAS) per unit protocol — the primary titration target",
      "Blood pressure — hypotension is common, particularly during initiation or at higher parameters in hemodynamically tenuous patients",
      "Heart rate and cardiac rhythm — continuous ECG monitoring standard during ICU propofol infusion",
      "Respiratory rate and ventilator synchrony in intubated patients",
      "Triglyceride levels with prolonged or high-parameter infusions — propofol is delivered in a lipid emulsion that contributes to caloric and lipid load",
      "Signs consistent with propofol infusion syndrome (PRIS): unexplained metabolic acidosis, elevated lactate, rising creatine kinase, rhabdomyolysis findings, new arrhythmias, or acute kidney injury",
      "IV site — propofol formulation can cause infusion-site pain or phlebitis",
      "Urine color — dark urine may indicate rhabdomyolysis in the setting of PRIS concern",
    ],

    titrationConcept:
      "Titrated to a target sedation depth using a validated scale, per provider orders and the unit's sedation protocol. The clinical principle guiding contemporary ICU sedation is the lightest effective depth consistent with patient safety, comfort, and ventilator synchrony — over-sedation is independently associated with longer mechanical ventilation and ICU stay. All adjustments are provider-ordered.",

    bedsideConcerns: [
      "Hypotension is common, especially in volume-depleted or hemodynamically unstable patients — recognize it as an expected adverse effect requiring a management plan, not a surprise finding",
      "Propofol has no analgesic effect; pain is neither assessed nor treated by the infusion — analgesia-first sedation protocols depend on concurrent pain management",
      "Propofol infusion syndrome (PRIS) is rare but life-threatening; risk increases with high parameters and prolonged duration — know your unit's monitoring triggers and thresholds",
      "The lipid emulsion formulation contributes to total caloric and lipid intake — relevant for nutrition management in patients on enteral or parenteral feeding",
      "The lipid emulsion supports microbial growth; strict aseptic handling and tubing change intervals per unit infection control policy are essential",
      "At light sedation levels, propofol does not reliably produce amnesia — a lightly sedated patient may be aware of their surroundings",
    ],

    linesAccess:
      "A dedicated IV line or port is strongly preferred — propofol should not share a lumen with medications lacking verified compatibility. Central access or a large peripheral vein is preferred given the formulation. Dedicated infusion sets with an in-line 0.2-micron filter are used per manufacturer guidance. Vial and tubing changes follow unit infection control policy — strict intervals are clinically necessary, not administrative preference.",

    escalationSignals: [
      "Persistent hemodynamic instability (hypotension unresponsive to parameter adjustment or fluid)",
      "Unexplained metabolic acidosis, rising lactate, or new creatine kinase elevation — screen for PRIS",
      "New arrhythmia occurring in the context of propofol infusion",
      "Sedation significantly deeper or lighter than target despite infusion, suggesting altered drug effect",
      "Patient agitation, pain behaviors, or distress not controlled by the current analgesic-sedation plan",
      "Loss of IV access or site compromise requiring prompt re-establishment of a secure line",
    ],

    weaningConcepts:
      "Weaning follows structured lightening protocols or daily sedation interruption per the care team's plan, often coordinated with ventilator liberation goals. Abrupt discontinuation is generally tolerated due to rapid redistribution; however, unplanned rapid lightening in a deeply sedated patient requires airway vigilance. Provider-ordered transitions to longer-acting or oral anxiolytic agents may follow as the clinical course allows.",

    safetyFlags: [
      "Propofol infusion syndrome (PRIS): risk is higher with sustained high parameters and prolonged duration — monitor per unit protocol and know the early signs",
      "Strict aseptic technique is a patient safety requirement, not just policy compliance — the lipid emulsion supports bacterial growth",
      "Discard unused propofol per unit policy (typically after 12 hours from spike) — do not extend beyond policy-defined intervals",
      "Verify compatibility before sharing a lumen with any co-infusion; many drug-drug incompatibilities exist in IV form",
      "Propofol contains soybean oil and egg lecithin — allergy history should be confirmed and documented per unit policy",
      "All parameter changes require a provider order and a current sedation scale assessment to guide the change",
    ],
  },

  // ── Amiodarone ──────────────────────────────────────────────────────────────
  {
    id: "amiodarone",
    name: "Amiodarone",
    brandName: "Cordarone / Nexterone",
    category: "antiarrhythmic",
    categoryLabel: "Antiarrhythmic",
    snapshot:
      "A broad-spectrum antiarrhythmic used for ventricular and select supraventricular arrhythmias. Complex multi-channel pharmacology, a very long half-life, and significant drug interactions require sustained monitoring well beyond the infusion itself.",

    clinicalUse: [
      "Ventricular fibrillation and pulseless ventricular tachycardia — ACLS protocol",
      "Hemodynamically stable ventricular tachycardia",
      "Atrial fibrillation with rapid ventricular response (rate control and rhythm stabilization)",
      "Ventricular arrhythmia suppression in the critically ill patient requiring sustained therapy",
    ],

    mechanism:
      "Amiodarone is primarily a Class III antiarrhythmic that blocks potassium channels, prolonging the cardiac action potential and refractory period in both atrial and ventricular tissue. It additionally exhibits Class I (sodium channel blockade), Class II (non-competitive beta-blockade), and Class IV (calcium channel blockade) properties — making it one of the broadest-acting antiarrhythmics available. Its exceptionally long elimination half-life (weeks to months) means pharmacological effects persist long after the IV infusion is discontinued, and drug interactions extend throughout that entire period.",

    monitoring: [
      "Cardiac rhythm and rate — continuous ECG monitoring during IV infusion is standard",
      "QTc interval — amiodarone prolongs the QT interval; serial assessment per protocol or provider order",
      "Blood pressure — hypotension can occur, particularly with the loading infusion, and is related to the vehicle (polysorbate 80) as well as the drug itself",
      "IV site — amiodarone is caustic at higher concentrations and a known cause of phlebitis, particularly with peripheral administration",
      "Thyroid function (TSH, free T4) — amiodarone contains approximately 37% iodine by weight and significantly affects thyroid metabolism; relevant for monitoring on longer courses",
      "Pulmonary symptoms — new cough, dyspnea, or radiographic infiltrates may indicate pulmonary toxicity in patients on sustained therapy",
      "Liver function tests — hepatotoxicity is a recognized adverse effect of longer-term use",
      "Signs of visual changes or corneal microdeposits (relevant for long-term patients, not acute IV use)",
    ],

    titrationConcept:
      "IV amiodarone is typically structured as a loading infusion followed by a maintenance infusion, with the clinical context determining which phase applies — acute resuscitation, short-term stabilization, or longer-term rate/rhythm management. Infusion parameters follow provider orders and unit protocol. Transition to oral amiodarone, when appropriate, is directed and timed by the care team in coordination with pharmacy.",

    bedsideConcerns: [
      "Phlebitis from peripheral IV administration is a significant risk — amiodarone is caustic at higher concentrations and peripheral sites require frequent inspection and prompt response to site changes",
      "Hypotension during the initial loading phase is common — recognize it as an expected adverse effect with a pre-planned response",
      "QTc prolongation increases the risk of torsades de pointes, particularly in combination with other QT-prolonging agents; the cumulative effect requires a current medication review",
      "Drug interactions are extensive and clinically significant — amiodarone alters the metabolism of warfarin, digoxin, statins, and many other medications; a formal review at the time of initiation is essential",
      "The long half-life means that adverse effects and drug interactions continue for weeks to months after the infusion ends — this affects management decisions for the entire hospitalization and beyond",
      "Extravasation of amiodarone causes tissue injury at the site — IV site changes require immediate action",
    ],

    linesAccess:
      "Central venous access is preferred for sustained IV amiodarone infusions due to the known risk of peripheral phlebitis and phlebosclerosis. When peripheral access is used in acute or ACLS situations, transition to central access should occur as soon as clinically feasible. An in-line 0.22-micron filter is recommended. Amiodarone has known incompatibilities with several medications and common IV solutions — pharmacy verification of all co-administered infusions is required before sharing a lumen or admixing.",

    escalationSignals: [
      "New or worsening arrhythmia during infusion — including torsades de pointes, increased ventricular ectopy, or polymorphic VT",
      "Persistent or worsening hypotension not responsive to infusion rate adjustment",
      "Rapid deterioration of IV access, phlebitis, or suspected extravasation at the infusion site",
      "Significant QTc prolongation or new conduction abnormalities (widening QRS, heart block) on ECG",
      "Respiratory deterioration — new hypoxia, worsening dyspnea, or new radiographic infiltrates in a patient on amiodarone",
      "Unexplained clinical deterioration in any system in a patient receiving amiodarone — the broad pharmacology creates diverse adverse effect possibilities",
    ],

    weaningConcepts:
      "Transition from IV to oral amiodarone is directed by the provider when the patient's status allows enteral medication. The pharmacokinetics of amiodarone — its very long half-life and extensive tissue distribution — mean that IV and oral loading strategies overlap in ways that require careful pharmacy-to-provider coordination. Because drug levels persist after IV discontinuation, oral loading schedules are adjusted accordingly. Nursing monitors for arrhythmia recurrence during any transition period.",

    safetyFlags: [
      "Confirm central access is secured before initiating sustained infusions — peripheral amiodarone carries a significant phlebitis and site injury risk that is not acceptable for prolonged use",
      "QTc monitoring is a required, not optional, part of the monitoring plan — know the current interval and trend",
      "Drug interactions are broad and clinically consequential — a pharmacist-assisted medication review at initiation is best practice",
      "The long half-life means the drug and its interactions outlast the infusion by weeks; management decisions during and after the infusion should account for this",
      "Thyroid, pulmonary, and hepatic toxicity monitoring is ongoing, not limited to the ICU stay",
      "All infusion parameters follow provider orders exclusively; rate adjustments are not a nursing-discretion decision",
    ],
  },
];
