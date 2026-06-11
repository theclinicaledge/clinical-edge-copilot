export const CATEGORIES = [
  { id: 'hemodynamics', label: 'Hemodynamics' },
  { id: 'labs',         label: 'Labs' },
  { id: 'abgs',         label: 'ABGs' },
  { id: 'ventilation',  label: 'Ventilation' },
  { id: 'devices',      label: 'Devices' },
];

export const REFERENCES = [
  // ── Hemodynamics (original 6) ────────────────────────────────────────────────
  {
    id: 'map',
    category: 'hemodynamics',
    title: 'Mean Arterial Pressure (MAP)',
    normalRange: '70 – 100 mmHg',
    nursesCare:
      'MAP reflects the average pressure driving blood to vital organs across the full cardiac cycle. A sustained MAP below 65 mmHg signals inadequate organ perfusion — regardless of how the systolic looks.',
    whenAttentionIncreases:
      'MAP < 65 mmHg sustained beyond a few minutes, especially alongside altered mental status, declining urine output, or a rising lactate.',
    pearl:
      'The top number shows pressure. MAP shows perfusion. Don\'t confuse one for the other.',
  },
  {
    id: 'cvp',
    category: 'hemodynamics',
    title: 'Central Venous Pressure (CVP)',
    normalRange: '2 – 8 mmHg',
    nursesCare:
      'CVP estimates right-sided filling pressure and serves as a trending marker for volume status. It is one data point — not a standalone indicator of fluid need or cardiac function.',
    whenAttentionIncreases:
      'Sudden rise above the patient\'s own baseline (possible tamponade, tension pneumothorax, or RV failure), or a sustained drop in a previously volume-resuscitated patient.',
    pearl:
      'CVP is a trend, not a target. The patient in front of you carries more information than the number on the screen.',
  },
  {
    id: 'cardiac-output',
    category: 'hemodynamics',
    title: 'Cardiac Output / Cardiac Index',
    normalRange: 'CO: 4 – 8 L/min · CI: 2.5 – 4.0 L/min/m²',
    nursesCare:
      'Cardiac output is the volume of blood the heart ejects per minute. Cardiac index adjusts for body size and is the preferred comparison across patients of different builds.',
    whenAttentionIncreases:
      'CI falling below 2.2 L/min/m² (cardiogenic shock range), or an acute unexplained drop from the patient\'s own recent baseline.',
    pearl:
      'You can have a normal blood pressure with a critically failing pump. Pressure and flow are not the same story.',
  },
  {
    id: 'svr',
    category: 'hemodynamics',
    title: 'Systemic Vascular Resistance (SVR)',
    normalRange: '800 – 1200 dynes·sec/cm⁵',
    nursesCare:
      'SVR reflects afterload — the resistance the left ventricle works against with each beat. Low SVR signals vasodilation (sepsis, anaphylaxis); high SVR signals vasoconstriction, often as a compensatory response.',
    whenAttentionIncreases:
      'SVR < 800 in a hypotensive patient suggests vasodilatory shock. SVR > 1400 alongside a low cardiac output may signal the heart is compensating at significant cost.',
    pearl:
      'Low SVR + high CO: distributive shock. High SVR + low CO: cardiogenic shock. Opposite numbers, opposite clinical picture.',
  },
  {
    id: 'pulse-pressure',
    category: 'hemodynamics',
    title: 'Pulse Pressure',
    normalRange: '~40 mmHg (SBP − DBP)',
    nursesCare:
      'Pulse pressure reflects stroke volume and arterial compliance. A narrowing pulse pressure suggests a falling stroke volume; a widening one may indicate high output states or aortic valve pathology.',
    whenAttentionIncreases:
      'Pulse pressure narrowing below 25 mmHg during resuscitation, or an abrupt new widening in a post-cardiac surgery patient.',
    pearl:
      'When the pulse pressure narrows, stroke volume is already falling. The systolic BP often hasn\'t caught up yet.',
  },
  {
    id: 'shock-index',
    category: 'hemodynamics',
    title: 'Shock Index',
    normalRange: '0.5 – 0.7  (HR ÷ SBP)',
    nursesCare:
      'Shock Index is a rapid bedside calculation that surfaces haemodynamic instability when individual vital signs still appear borderline. A value ≥ 1.0 warrants a closer look.',
    whenAttentionIncreases:
      'Shock Index ≥ 1.0, particularly with clinical signs of hypoperfusion: altered mentation, cool or mottled extremities, or declining urine output.',
    pearl:
      'HR 110, SBP 100 → Shock Index 1.1. Neither vital looks alarming alone — the ratio flags the picture earlier.',
  },

  // ── Hemodynamics (new 5) ─────────────────────────────────────────────────────
  {
    id: 'spo2',
    category: 'hemodynamics',
    title: 'SpO₂ (Pulse Oximetry)',
    normalRange: '95 – 100% · ≥ 92% acceptable in some chronic lung disease',
    nursesCare:
      'SpO2 is the continuous bedside estimate of haemoglobin oxygen saturation. It is a trend monitor with real limitations — perfusion, nail polish, motion, and anaemia all affect accuracy.',
    whenAttentionIncreases:
      'SpO2 < 92% in a patient without chronic lung disease, or any acute drop ≥ 3–4% from the patient\'s baseline. Sustained SpO2 < 88% warrants urgent clinical attention.',
    pearl:
      'SpO2 can look normal while perfusion is failing. Cold extremities, vasoconstriction, and poor waveform quality all reduce reliability. When in doubt, pair it with an ABG.',
  },
  {
    id: 'etco2',
    category: 'hemodynamics',
    title: 'EtCO₂ (End-Tidal CO₂)',
    normalRange: '35 – 45 mmHg (capnography)',
    nursesCare:
      'EtCO2 reflects CO2 at the end of exhalation and tracks ventilation adequacy in real time. In intubated patients it confirms air movement and provides a continuous proxy for PaCO2.',
    whenAttentionIncreases:
      'Sudden drop toward zero (displaced tube, circuit disconnect, cardiac arrest). A rising EtCO2 in a sedated patient may signal hypoventilation. A falling EtCO2 in haemodynamic decline may reflect falling cardiac output.',
    pearl:
      'During CPR, a sustained rise in EtCO2 often precedes return of spontaneous circulation. A persistently low EtCO2 despite ongoing resuscitation suggests compressions are not generating adequate flow.',
  },
  {
    id: 'cpp',
    category: 'hemodynamics',
    title: 'Cerebral Perfusion Pressure (CPP)',
    normalRange: '60 – 80 mmHg  (CPP = MAP − ICP)',
    nursesCare:
      'CPP is the driving pressure delivering blood to brain tissue. In patients with elevated intracranial pressure (ICP), maintaining an adequate CPP is a central goal to prevent secondary brain injury.',
    whenAttentionIncreases:
      'CPP < 60 mmHg sustained (risk of cerebral ischaemia). Any acute MAP drop or ICP rise that narrows the CPP below the patient\'s established target.',
    pearl:
      'CPP falls when MAP drops OR when ICP rises. Two different problems — the same clinical consequence.',
  },
  {
    id: 'urine-output',
    category: 'hemodynamics',
    title: 'Urine Output',
    normalRange: '≥ 0.5 mL/kg/hr (adults)',
    nursesCare:
      'Urine output is one of the most sensitive real-time indicators of end-organ perfusion. It is a trend — a single reading carries less weight than the pattern across two to three consecutive hours.',
    whenAttentionIncreases:
      'UO < 0.5 mL/kg/hr for 2 or more consecutive hours, or a sudden drop to near zero (rule out obstruction, kinked catheter, or haemodynamic compromise before any other conclusion).',
    pearl:
      'Urine output reflects what the kidney received — not just what the bladder held. It is perfusion made visible, one hour at a time.',
  },
  {
    id: 'capillary-refill',
    category: 'hemodynamics',
    title: 'Capillary Refill Time (CRT)',
    normalRange: '< 2 seconds',
    nursesCare:
      'Capillary refill is a rapid bedside assessment of peripheral perfusion integrating cardiac output, vascular tone, and tissue delivery in a single observation. Prolongation reflects poor distal perfusion.',
    whenAttentionIncreases:
      'CRT > 3 seconds, especially alongside cool or mottled extremities or haemodynamic changes. Prolonged CRT in a critical patient is a perfusion warning sign — not a normal variant.',
    pearl:
      'Warm hands and brisk refill tell one story. Cold, mottled skin with sluggish refill tell another — even when the vital signs still look acceptable.',
  },

  // ── Labs (original 6) ────────────────────────────────────────────────────────
  {
    id: 'lactate',
    category: 'labs',
    title: 'Serum Lactate',
    normalRange: '< 2.0 mmol/L',
    nursesCare:
      'Lactate reflects cellular oxygen debt. An elevated lactate means tissues are not receiving or extracting oxygen adequately — a systemic signal that matters regardless of the cause.',
    whenAttentionIncreases:
      'Lactate ≥ 2.0 warrants close monitoring; ≥ 4.0 meets septic shock criteria. A lactate that is not falling over time is a signal that the patient has not adequately responded.',
    pearl:
      'The first lactate starts the clock. If it isn\'t falling within 2–4 hours, the picture hasn\'t changed enough — escalate.',
  },
  {
    id: 'troponin',
    category: 'labs',
    title: 'Troponin (High-Sensitivity)',
    normalRange: 'Lab-specific — check your facility\'s reference range',
    nursesCare:
      'Troponin is the primary biomarker for myocardial injury. Any rise above the 99th percentile upper reference limit is clinically significant — even a small delta on serial draws.',
    whenAttentionIncreases:
      'Any rise above the facility\'s URL, especially with chest pain, shortness of breath, new ECG changes, or haemodynamic instability. Serial draws at 0h and 1h or 3h are standard.',
    pearl:
      'A rising troponin means myocardial injury — not necessarily MI. The number opens the conversation; the clinical story shapes it.',
  },
  {
    id: 'bnp',
    category: 'labs',
    title: 'BNP / NT-proBNP',
    normalRange: 'BNP < 100 pg/mL · NT-proBNP < 300 pg/mL (age-adjusted)',
    nursesCare:
      'BNP is released when ventricular walls are under stress. It is the primary lab marker for acute decompensated heart failure but can also rise in PE, renal failure, and systemic illness.',
    whenAttentionIncreases:
      'BNP > 500 pg/mL is strongly associated with acute HF. Trend alongside clinical signs: orthopnoea, new crackles, audible S3, weight gain.',
    pearl:
      'A very low BNP (< 100) makes acute HF as the cause of breathlessness unlikely — useful context at the bedside when the picture is unclear.',
  },
  {
    id: 'sodium',
    category: 'labs',
    title: 'Serum Sodium',
    normalRange: '135 – 145 mEq/L',
    nursesCare:
      'Sodium governs extracellular osmolality and brain function. Both hypo- and hypernatraemia affect neurological status. How fast sodium changes matters as much as the number itself.',
    whenAttentionIncreases:
      'Na < 125 mEq/L with neurological symptoms (confusion, seizure), or sodium shifting faster than 6–8 mEq/L in 24 hours in a chronic hyponatraemia patient.',
    pearl:
      'With chronic hyponatraemia, slow is safe. Correcting faster than 6–8 mEq/L per day risks osmotic demyelination — a devastating and irreversible complication.',
  },
  {
    id: 'potassium',
    category: 'labs',
    title: 'Serum Potassium',
    normalRange: '3.5 – 5.0 mEq/L',
    nursesCare:
      'Potassium is critical for cardiac membrane stability. Both hypokalaemia and hyperkalaemia can produce life-threatening arrhythmias. Pair the lab value with an ECG and the full clinical picture.',
    whenAttentionIncreases:
      'K < 3.0 mEq/L (U-waves, increased ectopy risk) or K > 6.0 mEq/L (peaked T-waves, widening QRS — a cardiac emergency).',
    pearl:
      'K > 6.5 mEq/L with ECG changes is not a routine abnormality — it is a cardiac emergency that warrants immediate provider notification.',
  },
  {
    id: 'creatinine',
    category: 'labs',
    title: 'Serum Creatinine / AKI',
    normalRange: 'Baseline-dependent · AKI = rise ≥ 0.3 mg/dL in 48h, or ≥ 1.5× the patient\'s baseline',
    nursesCare:
      'Creatinine is a marker of kidney filtration. A rising value reflects declining GFR — but always trend from the patient\'s own baseline, not a population normal.',
    whenAttentionIncreases:
      'Any rise meeting AKI criteria, especially alongside oliguria (< 0.5 mL/kg/hr for ≥ 6h), exposure to nephrotoxic agents, or haemodynamic instability.',
    pearl:
      'By the time creatinine rises, the kidney has often been under stress for hours. Urine output is the earlier signal — watch both together.',
  },

  // ── Labs (new 10) ────────────────────────────────────────────────────────────
  {
    id: 'hemoglobin',
    category: 'labs',
    title: 'Hemoglobin (Hgb)',
    normalRange: 'Men: 13.5 – 17.5 g/dL · Women: 12.0 – 15.5 g/dL',
    nursesCare:
      'Hemoglobin carries oxygen to tissues. A low Hgb reduces oxygen-carrying capacity — the clinical impact depends on how quickly it fell and whether the patient is able to compensate.',
    whenAttentionIncreases:
      'Acute Hgb drop > 2 g/dL from baseline, Hgb < 7 g/dL in a symptomatic or haemodynamically unstable patient, or any unexplained downward trend.',
    pearl:
      'A Hgb of 8 in a young, compensating patient tells a different story than Hgb of 8 in an elderly patient with chest pain and a falling MAP. Context is everything.',
  },
  {
    id: 'platelets',
    category: 'labs',
    title: 'Platelet Count',
    normalRange: '150,000 – 400,000 /µL',
    nursesCare:
      'Platelets are essential for primary haemostasis. A falling count raises bleeding risk; a rapid drop from baseline — even within the normal range — may signal HIT, DIC, or drug effect.',
    whenAttentionIncreases:
      'Platelets < 100,000 /µL in a patient on anticoagulation, < 50,000 /µL with active bleeding, or any drop of more than 50% from a prior value.',
    pearl:
      'A platelet count that drops 50% in a heparinised patient — even if still "normal" — is the classic HIT signal. The trend is the warning, not the absolute number.',
  },
  {
    id: 'wbc',
    category: 'labs',
    title: 'WBC (White Blood Cell Count)',
    normalRange: '4,500 – 11,000 /µL',
    nursesCare:
      'WBC reflects immune and inflammatory activity. Both high and low values signal systemic stress — WBC alone does not confirm infection or rule it out.',
    whenAttentionIncreases:
      'WBC > 12,000 or < 4,000 /µL alongside clinical signs of infection (SIRS criteria), or WBC < 1,000 /µL suggesting severe immunosuppression.',
    pearl:
      'A normal WBC does not rule out serious infection — particularly in elderly, immunosuppressed, or early-sepsis patients. Trend the whole picture, not the number alone.',
  },
  {
    id: 'inr',
    category: 'labs',
    title: 'INR',
    normalRange: '0.8 – 1.2 (baseline) · Therapeutic: 2.0 – 3.0 (most indications)',
    nursesCare:
      'INR measures the extrinsic coagulation pathway and reflects warfarin effect. It guides bleeding risk assessment and is the standard monitoring parameter for patients on warfarin.',
    whenAttentionIncreases:
      'INR > 3.5 in a warfarin patient (supratherapeutic, bleeding risk elevated), or an unexpected INR rise in a patient not on anticoagulation (liver dysfunction, DIC, vitamin K deficiency).',
    pearl:
      'A high INR means the clotting pathway is impaired — not just a number to report. In active bleeding, any INR above normal is clinically relevant.',
  },
  {
    id: 'aptt',
    category: 'labs',
    title: 'aPTT',
    normalRange: '25 – 35 seconds (lab-specific) · Therapeutic UFH range: ~60 – 100 seconds',
    nursesCare:
      'aPTT measures the intrinsic coagulation pathway and is the standard parameter for monitoring unfractionated heparin (UFH) infusions. It reflects how long blood takes to begin clotting.',
    whenAttentionIncreases:
      'aPTT > 100 seconds in a heparinised patient (supratherapeutic, bleeding risk), or unexpected prolongation in a patient not on anticoagulation.',
    pearl:
      'aPTT monitors UFH — not LMWH. Enoxaparin and other low-molecular-weight heparins are monitored with anti-Xa. Knowing which anticoagulant determines which lab to follow.',
  },
  {
    id: 'anti-xa',
    category: 'labs',
    title: 'Anti-Xa Level',
    normalRange: 'Therapeutic (BID schedule): 0.5 – 1.0 units/mL · (daily schedule): 1.0 – 2.0 units/mL · varies by protocol',
    nursesCare:
      'Anti-Xa measures the activity of low-molecular-weight heparins (e.g., enoxaparin) and certain factor Xa inhibitors. aPTT does not reflect LMWH effect — anti-Xa is the correct lab.',
    whenAttentionIncreases:
      'Levels outside the therapeutic range in patients with renal impairment, extremes of body weight, or pregnancy. Unexpected bleeding in a patient on LMWH warrants level checking.',
    pearl:
      'Anti-Xa is the right test for LMWH monitoring. Ordering aPTT to follow enoxaparin is a common error — the result will be unreliable.',
  },
  {
    id: 'bun',
    category: 'labs',
    title: 'BUN (Blood Urea Nitrogen)',
    normalRange: '7 – 20 mg/dL',
    nursesCare:
      'BUN reflects protein catabolism and renal nitrogen excretion. It rises in AKI, dehydration, GI bleeding, and high catabolic states — the cause matters as much as the number.',
    whenAttentionIncreases:
      'BUN rising alongside creatinine suggests AKI. BUN rising with a stable creatinine may reflect GI bleeding, dehydration, or high catabolism rather than kidney injury.',
    pearl:
      'BUN:creatinine ratio > 20:1 often points toward a pre-renal cause or upper GI bleed — not intrinsic kidney injury. The ratio narrows the picture.',
  },
  {
    id: 'glucose',
    category: 'labs',
    title: 'Blood Glucose',
    normalRange: '70 – 140 mg/dL (fasting to post-prandial) · ICU target: 140 – 180 mg/dL per local protocol',
    nursesCare:
      'Blood glucose monitoring is a core nursing responsibility. Both hypoglycaemia and sustained hyperglycaemia affect clinical outcomes — each in a different direction.',
    whenAttentionIncreases:
      'Glucose < 70 mg/dL (hypoglycaemia — neurological risk, requires prompt attention) or sustained > 180 mg/dL in a critically ill patient, especially with altered mental status or new infection signs.',
    pearl:
      'Hypoglycaemia is the more immediate danger. A glucose of 50 with altered mentation requires faster action than a glucose of 250.',
  },
  {
    id: 'phosphorus',
    category: 'labs',
    title: 'Serum Phosphorus',
    normalRange: '2.5 – 4.5 mg/dL',
    nursesCare:
      'Phosphorus is essential for cellular energy (ATP), red blood cell function, and respiratory muscle strength. Critically low levels in ventilated patients can impair the ability to wean from the ventilator.',
    whenAttentionIncreases:
      'Phosphorus < 1.0 mg/dL (severe hypophosphataemia — risk of respiratory muscle weakness, haemolysis, cardiac dysfunction), or a downward trend in a patient receiving nutrition support.',
    pearl:
      'Hypophosphataemia is a hidden barrier to ventilator weaning. A patient who fails repeated liberation attempts without a clear reason is worth checking.',
  },
  {
    id: 'albumin',
    category: 'labs',
    title: 'Serum Albumin',
    normalRange: '3.5 – 5.0 g/dL',
    nursesCare:
      'Albumin reflects nutritional status and liver synthetic function. It also affects drug binding and fluid distribution — a low albumin can alter how medications behave and contribute to oedema.',
    whenAttentionIncreases:
      'Albumin < 2.5 g/dL (associated with poor wound healing, dependent oedema, higher free-fraction of protein-bound medications). Trend matters more than a single value.',
    pearl:
      'Albumin is a slow marker — it reflects weeks of nutritional reserve, not yesterday\'s intake. A critically low albumin signals trajectory, not just today.',
  },

  // ── ABGs (original 5) ────────────────────────────────────────────────────────
  {
    id: 'ph',
    category: 'abgs',
    title: 'Arterial pH',
    normalRange: '7.35 – 7.45',
    nursesCare:
      'pH reflects the overall acid-base balance of arterial blood. A value below 7.35 indicates acidosis; above 7.45 indicates alkalosis. Each has distinct systemic effects.',
    whenAttentionIncreases:
      'pH < 7.20 (severe acidosis — cardiac depression, vasodilation risk) or pH > 7.60 (severe alkalosis — tetany, arrhythmia risk).',
    pearl:
      'pH tells you there\'s a problem. PaCO2 and HCO3 tell you where it\'s coming from. Never interpret one without the other two.',
  },
  {
    id: 'paco2',
    category: 'abgs',
    title: 'PaCO₂',
    normalRange: '35 – 45 mmHg',
    nursesCare:
      'PaCO2 is the respiratory component of acid-base balance, determined by how effectively the patient is ventilating. High PaCO2 (hypoventilation) causes respiratory acidosis; low causes respiratory alkalosis.',
    whenAttentionIncreases:
      'PaCO2 > 50 mmHg alongside deteriorating mental status or visible breathing fatigue. An acute rise in a COPD patient with a known baseline is always significant.',
    pearl:
      'A normal PaCO2 in a patient breathing very fast is not reassuring — it may mean they are tiring and about to lose their compensatory effort.',
  },
  {
    id: 'pao2',
    category: 'abgs',
    title: 'PaO₂',
    normalRange: '80 – 100 mmHg (room air)',
    nursesCare:
      'PaO2 measures dissolved oxygen in arterial blood and directly reflects how well the lungs are oxygenating. It is the basis for the P/F ratio used in ARDS classification.',
    whenAttentionIncreases:
      'PaO2 < 60 mmHg on room air meets the threshold for hypoxaemic respiratory failure. Below 55 mmHg, oxygen saturation begins to fall steeply.',
    pearl:
      'SpO2 can look acceptable while PaO2 is marginal. Always interpret the PaO2 against the FiO2 being delivered — the number alone tells only half the story.',
  },
  {
    id: 'hco3',
    category: 'abgs',
    title: 'Bicarbonate (HCO₃⁻)',
    normalRange: '22 – 26 mEq/L',
    nursesCare:
      'HCO3 is the metabolic, kidney-regulated component of acid-base balance. A low value signals metabolic acidosis; a high value signals metabolic alkalosis.',
    whenAttentionIncreases:
      'HCO3 < 15 mEq/L (significant metabolic acidosis — calculate the anion gap). HCO3 > 32 mEq/L (metabolic alkalosis — consider NG losses, over-diuresis, vomiting).',
    pearl:
      'Low HCO3 in a critically ill patient means calculate the anion gap: Na − Cl − HCO3. A high gap points to lactate, ketones, or toxins.',
  },
  {
    id: 'base-excess',
    category: 'abgs',
    title: 'Base Excess / Base Deficit',
    normalRange: '−2 to +2 mEq/L',
    nursesCare:
      'Base excess reflects the pure metabolic component of acid-base status, isolated from the respiratory contribution. A base deficit (negative value) quantifies how much metabolic acidosis is present.',
    whenAttentionIncreases:
      'Base deficit worse than −6 in a trauma or critically ill patient suggests significant tissue acidosis. Serial values track how the patient is responding over time.',
    pearl:
      'A worsening base deficit tells you the underlying problem has not been addressed — not simply that more volume is needed.',
  },

  // ── ABGs (new 5) ─────────────────────────────────────────────────────────────
  {
    id: 'anion-gap',
    category: 'abgs',
    title: 'Anion Gap',
    normalRange: '8 – 12 mEq/L · Correct for low albumin: add 2.5 per 1 g/dL below 4',
    nursesCare:
      'The anion gap identifies unmeasured anions in the blood — primarily organic acids. A high gap in the context of metabolic acidosis significantly narrows the clinical picture.',
    whenAttentionIncreases:
      'Anion gap > 12 mEq/L alongside metabolic acidosis. Common causes: lactate, ketones, uraemia, ingested toxins. A wide gap in a previously normal patient warrants urgent attention.',
    pearl:
      'Always correct the anion gap for albumin in the ICU. A low albumin artificially lowers the gap — a true high-gap acidosis can hide behind a "normal" number.',
  },
  {
    id: 'acid-base-compensation',
    category: 'abgs',
    title: 'Acid-Base Compensation',
    normalRange: 'Varies by primary disturbance — expected ranges below',
    nursesCare:
      'Compensation reveals whether the body is mounting an appropriate response to a primary acid-base disturbance. An inadequate or excessive response signals a second primary disorder layered on top.',
    whenAttentionIncreases:
      'When the compensation appears absent or overshoots the expected range — this signals two primary disturbances, not one. The ABG interpretation changes significantly.',
    pearl:
      'Expected respiratory compensation for metabolic acidosis: PaCO2 ≈ 1.5 × HCO3 + 8 (±2). If the measured PaCO2 doesn\'t match, there are two problems, not one.',
  },
  {
    id: 'mixed-acidosis',
    category: 'abgs',
    title: 'Mixed Acidosis',
    normalRange: 'Not applicable — pH < 7.35 with ↑ PaCO2 and ↓ HCO3 simultaneously',
    nursesCare:
      'Mixed acidosis combines respiratory and metabolic failure at the same time. Both the lungs and the metabolic buffer system are overwhelmed — a pattern seen in cardiac arrest, severe sepsis, and multi-organ failure.',
    whenAttentionIncreases:
      'Any ABG showing low pH alongside elevated PaCO2 and low HCO3 together. This combined failure pattern warrants urgent escalation.',
    pearl:
      'Mixed acidosis is not a complex ABG — it is a patient deteriorating from two directions at once. Escalate before trying to fully explain the gas.',
  },
  {
    id: 'mixed-alkalosis',
    category: 'abgs',
    title: 'Mixed Alkalosis',
    normalRange: 'Not applicable — pH > 7.45 with ↓ PaCO2 and ↑ HCO3 simultaneously',
    nursesCare:
      'Mixed alkalosis occurs when respiratory and metabolic alkalosis are both present. Common in mechanically ventilated patients with concurrent NG losses, prolonged vomiting, or over-diuresis.',
    whenAttentionIncreases:
      'pH > 7.55 with both a low PaCO2 and an elevated HCO3. Severe alkalosis shifts the oxygen-haemoglobin dissociation curve and can suppress the respiratory drive.',
    pearl:
      'Mixed alkalosis is often iatrogenic — ventilator rate too high plus sustained NG suctioning or aggressive diuresis. Look at what is happening to the patient, not just the number.',
  },
  {
    id: 'oxygenation-vs-ventilation',
    category: 'abgs',
    title: 'Oxygenation vs. Ventilation',
    normalRange: 'Oxygenation: SpO2 / PaO2 · Ventilation: PaCO2 / EtCO2',
    nursesCare:
      'Oxygenation and ventilation are distinct physiological functions. A patient can be well-oxygenated but failing to clear CO2 — or vice versa. Confusing the two leads to misreading clinical deterioration.',
    whenAttentionIncreases:
      'SpO2 normal but PaCO2 rising — CO2 is not being cleared despite adequate oxygen. Or PaO2 falling despite a normal or high respiratory rate.',
    pearl:
      'Oxygenation is about getting O2 in. Ventilation is about getting CO2 out. Two different problems — two different monitors.',
  },

  // ── Ventilation (original 4) ─────────────────────────────────────────────────
  {
    id: 'tidal-volume',
    category: 'ventilation',
    title: 'Tidal Volume (Vt)',
    normalRange: '6 – 8 mL/kg ideal body weight (IBW)',
    nursesCare:
      'Tidal volume is the size of each breath the ventilator delivers. Lung-protective ventilation targets 6 mL/kg IBW to limit ventilator-induced lung injury (VILI), particularly in ARDS.',
    whenAttentionIncreases:
      'Delivered Vt consistently exceeding the ordered volume (circuit leak, dynamic hyperinflation), or plateau pressure persistently above 30 cmH2O despite a target Vt.',
    pearl:
      'Always use ideal body weight, not actual weight, for Vt targets. A tall patient and a short patient of the same actual weight have very different lung capacities.',
  },
  {
    id: 'peep',
    category: 'ventilation',
    title: 'PEEP (Positive End-Expiratory Pressure)',
    normalRange: '5 cmH₂O physiologic · therapeutic range varies by clinical context',
    nursesCare:
      'PEEP maintains airway pressure at end-expiration to prevent alveolar collapse, recruit atelectatic lung, and improve oxygenation. Higher levels are used in ARDS for refractory hypoxaemia.',
    whenAttentionIncreases:
      'New hypotension after a PEEP change (compressed venous return), rising plateau pressures, or signs of pneumothorax: sudden drop in compliance or unexpected oxygen desaturation.',
    pearl:
      'PEEP improves oxygenation but compresses venous return. After any PEEP change, watch the blood pressure — especially in a volume-depleted patient.',
  },
  {
    id: 'fio2',
    category: 'ventilation',
    title: 'FiO₂ (Fraction of Inspired Oxygen)',
    normalRange: '0.21 (room air) · 1.0 = 100% oxygen',
    nursesCare:
      'FiO2 is the oxygen concentration being delivered. The clinical goal is the lowest FiO2 that maintains acceptable oxygenation — high FiO2 sustained over time contributes to oxygen toxicity.',
    whenAttentionIncreases:
      'Oxygen requirements rising without a corresponding improvement in SpO2 or PaO2, or FiO2 sustained above 0.60 for more than 24 hours.',
    pearl:
      'Rising FiO2 needs with no SpO2 improvement is a signal the respiratory picture is changing — not just a dial to keep adjusting.',
  },
  {
    id: 'pf-ratio',
    category: 'ventilation',
    title: 'P/F Ratio (PaO₂ ÷ FiO₂)',
    normalRange: '> 300 mmHg · ARDS: mild < 300 · moderate < 200 · severe < 100',
    nursesCare:
      'The P/F ratio standardises oxygenation against the level of oxygen support being provided. It is the core metric for ARDS severity classification and reflects true lung performance.',
    whenAttentionIncreases:
      'A falling P/F ratio despite current ventilator settings — particularly a drop below 200 (moderate ARDS) or below 100 (severe ARDS).',
    pearl:
      'PaO2 of 90 on FiO2 0.60 = P/F ratio of 150. That context tells a different story than the raw number alone.',
  },

  // ── Ventilation (new 5) ──────────────────────────────────────────────────────
  {
    id: 'minute-ventilation',
    category: 'ventilation',
    title: 'Minute Ventilation (Ve)',
    normalRange: '5 – 10 L/min  (Vt × RR)',
    nursesCare:
      'Minute ventilation is the total volume of air moved per minute and is the primary determinant of CO2 clearance. A high RR and a small Vt may maintain Ve — but at the cost of respiratory muscle fatigue.',
    whenAttentionIncreases:
      'Ve > 15 L/min signals very high respiratory demand — the patient is working hard to maintain CO2 clearance. A falling Ve in a spontaneously breathing patient may signal impending fatigue.',
    pearl:
      'A high respiratory rate can sustain minute ventilation — until the patient exhausts. When rate is the only buffer left, the margin is narrowing.',
  },
  {
    id: 'respiratory-rate',
    category: 'ventilation',
    title: 'Respiratory Rate (RR)',
    normalRange: '12 – 20 breaths/min',
    nursesCare:
      'Respiratory rate is one of the most sensitive early indicators of clinical deterioration — and one of the most poorly documented vital signs. A rising RR signals respiratory distress, pain, metabolic acidosis, or sepsis.',
    whenAttentionIncreases:
      'RR > 25/min (respiratory distress range) or < 10/min in an unintubated patient (respiratory depression). Any sustained departure from the patient\'s own baseline deserves attention.',
    pearl:
      'RR is underrated. Studies consistently show it rises before other vitals deteriorate. A patient breathing at 28 is compensating — for something.',
  },
  {
    id: 'ventilator-compliance',
    category: 'ventilation',
    title: 'Ventilator Compliance',
    normalRange: 'Dynamic: 40 – 60 mL/cmH₂O · Static: 60 – 100 mL/cmH₂O',
    nursesCare:
      'Compliance reflects how easily the lungs and chest wall expand with each breath. Falling compliance means the lungs are stiffening — a sign of worsening lung pathology, airway obstruction, or a mechanical problem.',
    whenAttentionIncreases:
      'Acute worsening compliance alongside rising peak or plateau pressures. Possible causes: new pneumothorax, mucus plug, right mainstem intubation, or progressive ARDS.',
    pearl:
      'A sudden drop in compliance is an alarm, not a trend. Sudden stiffening of the ventilated lung warrants immediate assessment — starting with tube position and breath sounds.',
  },
  {
    id: 'dead-space',
    category: 'ventilation',
    title: 'Dead Space (Vd/Vt)',
    normalRange: '~0.3 normal (30% of each breath is dead space) · Elevated: > 0.6',
    nursesCare:
      'Dead space is the portion of each tidal volume that moves air without participating in gas exchange. Elevated dead space is a marker of poor ventilation-perfusion matching — common in PE, ARDS, and haemodynamic compromise.',
    whenAttentionIncreases:
      'Rising CO2 despite stable or rising minute ventilation in a ventilated patient — the lungs are moving air but not exchanging gases effectively.',
    pearl:
      'When EtCO2 is much lower than PaCO2, that gap reflects dead space — a perfusion problem wearing a ventilation mask.',
  },
  {
    id: 'plateau-pressure',
    category: 'ventilation',
    title: 'Plateau Pressure (Pplat)',
    normalRange: '< 30 cmH₂O (lung-protective target)',
    nursesCare:
      'Plateau pressure reflects the end-inspiratory alveolar pressure — the pressure the alveoli actually experience with each breath. Values above 30 cmH₂O are associated with ventilator-induced lung injury.',
    whenAttentionIncreases:
      'Pplat > 30 cmH₂O despite lung-protective Vt settings, or an acute rise from baseline (new pneumothorax, tube displacement, worsening ARDS, mucus plug).',
    pearl:
      'Peak pressure reflects airway resistance. Plateau pressure reflects what the alveoli are experiencing. Only plateau pressure matters for lung injury risk.',
  },

  // ── Devices (original 4) ─────────────────────────────────────────────────────
  {
    id: 'central-line',
    category: 'devices',
    title: 'Central Venous Catheter (CVC)',
    normalRange: null,
    nursesCare:
      'CVCs provide reliable access for vasoactive infusions, hypertonic solutions, TPN, and haemodynamic monitoring. Each lumen carries responsibility — use and maintain every port intentionally.',
    whenAttentionIncreases:
      'New fever in a patient with a CVC, redness or tenderness at the insertion site, sluggish or absent blood return, or blood cultures flagging line-associated organisms.',
    pearl:
      'The line you question every shift is the one that gets removed before it causes harm. Necessity is a daily nursing assessment, not a one-time decision.',
  },
  {
    id: 'arterial-line',
    category: 'devices',
    title: 'Arterial Line (A-Line)',
    normalRange: null,
    nursesCare:
      'Arterial lines provide continuous beat-to-beat blood pressure monitoring and direct arterial access for blood sampling. Essential in haemodynamically unstable patients and those on vasoactive infusions.',
    whenAttentionIncreases:
      'Dampened waveform (air, clot, kinked tubing), sudden loss of waveform, site bleeding, or any sign of distal ischaemia — pallor, coolness, or pain distal to the insertion point.',
    pearl:
      'A dampened waveform gives inaccurate numbers. Troubleshoot the waveform before acting on an unexpected reading.',
  },
  {
    id: 'foley',
    category: 'devices',
    title: 'Foley Catheter (IDC)',
    normalRange: 'Urine output goal: ≥ 0.5 mL/kg/hr',
    nursesCare:
      'Foley catheters allow precise, hourly urine output monitoring and bladder drainage. Critical in haemodynamically unstable and post-operative patients. CAUTI risk rises with every day of dwell time.',
    whenAttentionIncreases:
      'Urine output < 0.5 mL/kg/hr sustained for 2 or more hours, frank haematuria, sudden drop to zero output, or signs of a catheter-associated urinary tract infection.',
    pearl:
      'Before acting on oliguria, rule out obstruction — check for kinks, dependent loops, and position. A 60-second troubleshoot often reveals the cause.',
  },
  {
    id: 'ngt',
    category: 'devices',
    title: 'Nasogastric Tube (NGT)',
    normalRange: null,
    nursesCare:
      'NGTs are used for gastric decompression, enteral feeding, and medication delivery. Placement must be confirmed before any use — aspiration from a misplaced tube is a preventable catastrophe.',
    whenAttentionIncreases:
      'Patient distress or coughing during insertion or feeds, oxygen desaturation during feeding, unexpectedly high gastric residuals, or new respiratory symptoms in a tube-fed patient.',
    pearl:
      'Auscultation alone is not a reliable confirmation method. pH testing of gastric aspirate or X-ray confirmation before first use is the safer standard.',
  },
];
