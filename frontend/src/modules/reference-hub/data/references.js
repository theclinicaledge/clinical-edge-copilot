export const CATEGORIES = [
  { id: 'hemodynamics', label: 'Hemodynamics' },
  { id: 'labs',         label: 'Labs' },
  { id: 'abgs',         label: 'ABGs' },
  { id: 'ventilation',  label: 'Ventilation' },
  { id: 'devices',      label: 'Devices' },
];

export const REFERENCES = [
  // ── Hemodynamics ─────────────────────────────────────────────────────────────
  {
    id: 'map',
    category: 'hemodynamics',
    title: 'Mean Arterial Pressure (MAP)',
    normalRange: '70 – 100 mmHg',
    nursesCare:
      'MAP reflects the average pressure driving blood to vital organs across the full cardiac cycle. A sustained MAP below 65 mmHg signals inadequate organ perfusion — regardless of how the systolic looks.',
    nursesNotice: [
      'MAP may read acceptable while urine output is already falling.',
      'Cool extremities, altered mentation, and rising lactate often precede a MAP change.',
      'The 15–30 minute trend matters more than any single reading.',
    ],
    whenAttentionIncreases:
      'MAP < 65 mmHg sustained beyond a few minutes, especially alongside altered mental status, declining urine output, or a rising lactate.',
    commonMistake:
      'Reading the systolic BP as a reliable proxy for organ perfusion.',
    pearl:
      'The top number shows pressure. MAP shows perfusion. Don\'t confuse one for the other.',
    relatedRefs: ['cardiac-output', 'svr', 'urine-output', 'lactate', 'shock-index'],
  },
  {
    id: 'cvp',
    category: 'hemodynamics',
    title: 'Central Venous Pressure (CVP)',
    normalRange: '2 – 8 mmHg',
    nursesCare:
      'CVP estimates right-sided filling pressure and serves as a trending marker for volume status. It is one data point — not a standalone indicator of fluid need or cardiac function.',
    nursesNotice: [
      'A CVP that jumps suddenly is more meaningful than one that drifts slowly.',
      'Ventilator PEEP and patient position both affect CVP — document conditions alongside the value.',
      'CVP trending down during active volume loading may signal an ongoing deficit.',
    ],
    whenAttentionIncreases:
      'Sudden rise above the patient\'s own baseline (possible tamponade, tension pneumothorax, or RV failure), or a sustained drop in a previously volume-resuscitated patient.',
    commonMistake:
      'Using a single CVP number to judge whether a patient needs volume.',
    pearl:
      'CVP is a trend, not a target. The patient in front of you carries more information than the number on the screen.',
    relatedRefs: ['map', 'cardiac-output', 'peep', 'urine-output'],
  },
  {
    id: 'cardiac-output',
    category: 'hemodynamics',
    title: 'Cardiac Output / Cardiac Index',
    normalRange: 'CO: 4 – 8 L/min · CI: 2.5 – 4.0 L/min/m²',
    nursesCare:
      'Cardiac output is the volume of blood the heart ejects per minute. Cardiac index adjusts for body size and is the preferred comparison across patients of different builds.',
    nursesNotice: [
      'Patients with low CO often present with cool extremities, slow cap refill, and declining mental clarity.',
      'A normal blood pressure can coexist with a critically low cardiac output.',
      'Urine output is often the first clinical signal of a falling CO.',
    ],
    whenAttentionIncreases:
      'CI falling below 2.2 L/min/m² (cardiogenic shock range), or an acute unexplained drop from the patient\'s own recent baseline.',
    commonMistake:
      'Assuming a normal blood pressure means the cardiac output is adequate.',
    pearl:
      'You can have a normal blood pressure with a critically failing pump. Pressure and flow are not the same story.',
    relatedRefs: ['map', 'svr', 'cvp', 'urine-output', 'lactate'],
  },
  {
    id: 'svr',
    category: 'hemodynamics',
    title: 'Systemic Vascular Resistance (SVR)',
    normalRange: '800 – 1200 dynes·sec/cm⁵',
    nursesCare:
      'SVR reflects afterload — the resistance the left ventricle works against with each beat. Low SVR signals vasodilation (sepsis, anaphylaxis); high SVR signals vasoconstriction, often as a compensatory response.',
    nursesNotice: [
      'Warm, flushed skin with a bounding pulse suggests low SVR.',
      'Cold, mottled skin suggests high SVR — the vascular system is clamping down.',
      'Blood pressure may hold temporarily while SVR compensates for a falling cardiac output.',
    ],
    whenAttentionIncreases:
      'SVR < 800 in a hypotensive patient suggests vasodilatory shock. SVR > 1400 alongside a low cardiac output may signal the heart is compensating at significant cost.',
    commonMistake:
      'Reading low SVR and high SVR as versions of the same problem — they reflect opposite physiology.',
    pearl:
      'Low SVR + high CO: distributive shock. High SVR + low CO: cardiogenic shock. Opposite numbers, opposite clinical picture.',
    relatedRefs: ['map', 'cardiac-output', 'shock-index', 'lactate', 'capillary-refill'],
  },
  {
    id: 'pulse-pressure',
    category: 'hemodynamics',
    title: 'Pulse Pressure',
    normalRange: '~40 mmHg (SBP − DBP)',
    nursesCare:
      'Pulse pressure reflects stroke volume and arterial compliance. A narrowing pulse pressure suggests a falling stroke volume; a widening one may indicate high output states or aortic valve pathology.',
    nursesNotice: [
      'A narrowing pulse pressure on the arterial line waveform often precedes systolic BP changes.',
      'Tachycardia with a narrow pulse pressure is an early compensated shock pattern.',
      'A widening pulse pressure with fever and tachycardia may suggest distributive physiology.',
    ],
    whenAttentionIncreases:
      'Pulse pressure narrowing below 25 mmHg during resuscitation, or an abrupt new widening in a post-cardiac surgery patient.',
    commonMistake:
      'Ignoring the pulse pressure because the systolic and diastolic values look individually acceptable.',
    pearl:
      'When the pulse pressure narrows, stroke volume is already falling. The systolic BP often hasn\'t caught up yet.',
    relatedRefs: ['map', 'shock-index', 'cardiac-output', 'svr', 'arterial-line'],
  },
  {
    id: 'shock-index',
    category: 'hemodynamics',
    title: 'Shock Index',
    normalRange: '0.5 – 0.7  (HR ÷ SBP)',
    nursesCare:
      'Shock Index is a rapid bedside calculation that surfaces haemodynamic instability when individual vital signs still appear borderline. A value ≥ 1.0 warrants a closer look.',
    nursesNotice: [
      'Can be calculated instantly from any vital signs display — no extra equipment needed.',
      'HR 95, SBP 90 = Shock Index 1.05 — easy to miss when vitals are reviewed individually.',
      'Most valuable as a trend tool when individual vitals are borderline and clinical concern is rising.',
    ],
    whenAttentionIncreases:
      'Shock Index ≥ 1.0, particularly with clinical signs of hypoperfusion: altered mentation, cool or mottled extremities, or declining urine output.',
    commonMistake:
      'Dismissing the shock index because each individual vital sign still looks acceptable.',
    pearl:
      'HR 110, SBP 100 → Shock Index 1.1. Neither vital looks alarming alone — the ratio flags the picture earlier.',
    relatedRefs: ['map', 'pulse-pressure', 'lactate', 'urine-output', 'capillary-refill'],
  },
  {
    id: 'spo2',
    category: 'hemodynamics',
    title: 'SpO₂ (Pulse Oximetry)',
    normalRange: '95 – 100% · ≥ 92% acceptable in some chronic lung disease',
    nursesCare:
      'SpO2 is the continuous bedside estimate of haemoglobin oxygen saturation. It is a trend monitor with real limitations — perfusion, nail polish, motion, and anaemia all affect accuracy.',
    nursesNotice: [
      'Waveform quality matters as much as the number — a poor tracing makes the reading less reliable.',
      'A sudden SpO2 drop that doesn\'t resolve with probe repositioning warrants an ABG.',
      'SpO2 may hold at 95% while tissue oxygen delivery is critically impaired in shock.',
    ],
    whenAttentionIncreases:
      'SpO2 < 92% in a patient without chronic lung disease, or any acute drop ≥ 3–4% from the patient\'s baseline. Sustained SpO2 < 88% warrants urgent clinical attention.',
    commonMistake:
      'Trusting the SpO2 number without confirming the waveform quality is adequate.',
    pearl:
      'SpO2 can look normal while perfusion is failing. When in doubt, pair it with an ABG.',
    relatedRefs: ['pao2', 'fio2', 'pf-ratio', 'etco2', 'oxygenation-vs-ventilation'],
  },
  {
    id: 'etco2',
    category: 'hemodynamics',
    title: 'EtCO₂ (End-Tidal CO₂)',
    normalRange: '35 – 45 mmHg (capnography)',
    nursesCare:
      'EtCO2 reflects CO2 at the end of exhalation and tracks ventilation adequacy in real time. In intubated patients it confirms air movement and provides a continuous proxy for PaCO2.',
    nursesNotice: [
      'A falling EtCO2 in a ventilated patient may reflect falling cardiac output — not a ventilator problem.',
      'EtCO2 ≥ 20 mmHg during CPR suggests compressions are generating meaningful flow.',
      'A rising EtCO2 in a sedated, spontaneously breathing patient may signal hypoventilation.',
    ],
    whenAttentionIncreases:
      'Sudden drop toward zero (displaced tube, circuit disconnect, cardiac arrest). A rising EtCO2 in a sedated patient may signal hypoventilation. A falling EtCO2 in haemodynamic decline may reflect falling cardiac output.',
    commonMistake:
      'Assuming a ventilator CO2 alarm is always a ventilator problem — it may be a circulation problem.',
    pearl:
      'During CPR, a sustained rise in EtCO2 often precedes return of spontaneous circulation. A persistently low EtCO2 despite ongoing resuscitation suggests compressions are not generating adequate flow.',
    relatedRefs: ['paco2', 'minute-ventilation', 'respiratory-rate', 'oxygenation-vs-ventilation', 'cardiac-output'],
  },
  {
    id: 'cpp',
    category: 'hemodynamics',
    title: 'Cerebral Perfusion Pressure (CPP)',
    normalRange: '60 – 80 mmHg  (CPP = MAP − ICP)',
    nursesCare:
      'CPP is the driving pressure delivering blood to brain tissue. In patients with elevated intracranial pressure (ICP), maintaining an adequate CPP is a central goal to prevent secondary brain injury.',
    nursesNotice: [
      'CPP reflects the balance between MAP and ICP — both must be watched simultaneously.',
      'Nursing activities that affect position, suctioning, or BP can directly shift CPP.',
      'A patient\'s level of consciousness often correlates with CPP trends before the number changes.',
    ],
    whenAttentionIncreases:
      'CPP < 60 mmHg sustained (risk of cerebral ischaemia). Any acute MAP drop or ICP rise that narrows the CPP below the patient\'s established target.',
    commonMistake:
      'Focusing only on MAP without accounting for the ICP component of the CPP equation.',
    pearl:
      'CPP falls when MAP drops OR when ICP rises. Two different problems — the same clinical consequence.',
    relatedRefs: ['map', 'spo2', 'paco2', 'urine-output'],
  },
  {
    id: 'urine-output',
    category: 'hemodynamics',
    title: 'Urine Output',
    normalRange: '≥ 0.5 mL/kg/hr (adults)',
    nursesCare:
      'Urine output is one of the most sensitive real-time indicators of end-organ perfusion. It is a trend — a single reading carries less weight than the pattern across two to three consecutive hours.',
    nursesNotice: [
      'UO of 20–25 mL/hr in a 70 kg patient is below the 0.5 mL/kg/hr threshold — easy to overlook without calculating.',
      'Foley kinks, dependent loops, and clots can mimic oliguria — always assess the catheter first.',
      'A declining trend over 2–3 consecutive hours is more meaningful than one low reading.',
    ],
    whenAttentionIncreases:
      'UO < 0.5 mL/kg/hr for 2 or more consecutive hours, or a sudden drop to near zero (rule out obstruction, kinked catheter, or haemodynamic compromise before any other conclusion).',
    commonMistake:
      'Acting on a single low-output hour without first ruling out a mechanical catheter cause.',
    pearl:
      'Urine output reflects what the kidney received — not just what the bladder held. It is perfusion made visible, one hour at a time.',
    relatedRefs: ['map', 'creatinine', 'foley', 'lactate', 'bun'],
  },
  {
    id: 'capillary-refill',
    category: 'hemodynamics',
    title: 'Capillary Refill Time (CRT)',
    normalRange: '< 2 seconds',
    nursesCare:
      'Capillary refill integrates cardiac output, vascular tone, and tissue delivery in a single bedside observation. Prolongation reflects poor distal perfusion.',
    nursesNotice: [
      'Best assessed on a fingertip at heart level — a cold room or hypothermic patient will falsely prolong refill.',
      'Assess skin temperature and colour simultaneously — together they complete the picture.',
      'Reassess after any haemodynamic change to track perfusion response over time.',
    ],
    whenAttentionIncreases:
      'CRT > 3 seconds, especially alongside cool or mottled extremities or haemodynamic changes. Prolonged CRT in a critical patient is a perfusion warning sign — not a normal variant.',
    commonMistake:
      'Skipping cap refill because it feels informal — it is a validated perfusion indicator.',
    pearl:
      'Warm hands and brisk refill tell one story. Cold, mottled skin with sluggish refill tell another — even when the vital signs still look acceptable.',
    relatedRefs: ['map', 'shock-index', 'urine-output', 'lactate', 'cardiac-output'],
  },

  // ── Labs ─────────────────────────────────────────────────────────────────────
  {
    id: 'lactate',
    category: 'labs',
    title: 'Serum Lactate',
    normalRange: '< 2.0 mmol/L',
    nursesCare:
      'Lactate reflects cellular oxygen debt. An elevated lactate means tissues are not receiving or extracting oxygen adequately — a systemic signal that matters regardless of the cause.',
    nursesNotice: [
      'Lactate may be elevated before vital signs change significantly.',
      'Serial draws at 2-hour intervals are standard for tracking the response.',
      'A sample drawn from a poorly perfused or cold extremity may be less reliable — a central or arterial draw is preferred.',
    ],
    whenAttentionIncreases:
      'Lactate ≥ 2.0 warrants close monitoring; ≥ 4.0 meets septic shock criteria. A lactate that is not falling over time is a signal that the patient has not adequately responded.',
    commonMistake:
      'Watching a single lactate value without tracking the trend direction.',
    pearl:
      'The first lactate starts the clock. If it isn\'t falling within 2–4 hours, the picture hasn\'t changed enough — escalate.',
    relatedRefs: ['map', 'shock-index', 'urine-output', 'base-excess', 'mixed-acidosis'],
  },
  {
    id: 'troponin',
    category: 'labs',
    title: 'Troponin (High-Sensitivity)',
    normalRange: 'Lab-specific — check your facility\'s reference range',
    nursesCare:
      'Troponin is the primary biomarker for myocardial injury. Any rise above the 99th percentile upper reference limit is clinically significant — even a small delta on serial draws.',
    nursesNotice: [
      'Serial draws matter more than any single value — the delta between 0h and 1h or 3h carries the diagnostic weight.',
      'ECG changes alongside a rising troponin significantly escalate clinical urgency.',
      'Any new chest discomfort, dyspnoea, or haemodynamic change should prompt a troponin trend review.',
    ],
    whenAttentionIncreases:
      'Any rise above the facility\'s URL, especially with chest pain, shortness of breath, new ECG changes, or haemodynamic instability. Serial draws at 0h and 1h or 3h are standard.',
    commonMistake:
      'Reading an isolated troponin elevation as automatically confirming MI without considering the full clinical picture.',
    pearl:
      'A rising troponin means myocardial injury — not necessarily MI. The number opens the conversation; the clinical story shapes it.',
    relatedRefs: ['bnp', 'lactate', 'shock-index', 'ph'],
  },
  {
    id: 'bnp',
    category: 'labs',
    title: 'BNP / NT-proBNP',
    normalRange: 'BNP < 100 pg/mL · NT-proBNP < 300 pg/mL (age-adjusted)',
    nursesCare:
      'BNP is released when ventricular walls are under stress. It is the primary lab marker for acute decompensated heart failure but can also rise in PE, renal failure, and systemic illness.',
    nursesNotice: [
      'BNP may rise before oedema and crackles become clinically obvious.',
      'Daily weight alongside BNP trend provides context the lab alone cannot.',
      'Chronic heart failure patients often have an elevated BNP baseline — always compare to their prior values.',
    ],
    whenAttentionIncreases:
      'BNP > 500 pg/mL is strongly associated with acute HF. Trend alongside clinical signs: orthopnoea, new crackles, audible S3, weight gain.',
    commonMistake:
      'Reading a mildly elevated BNP in a chronic HF patient as acute decompensation without comparing to their established baseline.',
    pearl:
      'A very low BNP (< 100) makes acute HF as the cause of breathlessness unlikely — useful context when the picture is unclear.',
    relatedRefs: ['troponin', 'sodium', 'albumin', 'creatinine'],
  },
  {
    id: 'sodium',
    category: 'labs',
    title: 'Serum Sodium',
    normalRange: '135 – 145 mEq/L',
    nursesCare:
      'Sodium governs extracellular osmolality and brain function. Both hypo- and hypernatraemia affect neurological status. How fast sodium changes matters as much as the number itself.',
    nursesNotice: [
      'The patient\'s neurological status — mentation, confusion, seizure risk — is the bedside signal; labs confirm it.',
      'Symptoms often correlate better with the speed of change than the absolute number.',
      'Sodium should be rechecked after any large volume IV fluid administration.',
    ],
    whenAttentionIncreases:
      'Na < 125 mEq/L with neurological symptoms (confusion, seizure), or sodium shifting faster than 6–8 mEq/L in 24 hours in a chronic hyponatraemia patient.',
    commonMistake:
      'Focusing on the absolute sodium value while missing the rate of change — the speed of shift drives the risk.',
    pearl:
      'With chronic hyponatraemia, slow is safe. Correcting faster than 6–8 mEq/L per day risks osmotic demyelination — a devastating and irreversible complication.',
    relatedRefs: ['glucose', 'bun', 'creatinine', 'albumin', 'hco3'],
  },
  {
    id: 'potassium',
    category: 'labs',
    title: 'Serum Potassium',
    normalRange: '3.5 – 5.0 mEq/L',
    nursesCare:
      'Potassium is critical for cardiac membrane stability. Both hypokalaemia and hyperkalaemia can produce life-threatening arrhythmias. Pair the lab value with an ECG and the full clinical picture.',
    nursesNotice: [
      'Always correlate a critically abnormal potassium with the cardiac monitor.',
      'Concurrent low magnesium makes hypokalaemia harder to correct — check both together.',
      'GI losses, loop diuretics, and poor oral intake are common bedside contributors to low potassium.',
    ],
    whenAttentionIncreases:
      'K < 3.0 mEq/L (U-waves, increased ectopy risk) or K > 6.0 mEq/L (peaked T-waves, widening QRS — a cardiac emergency).',
    commonMistake:
      'Reporting a potassium result without correlating it to the patient\'s ECG and haemodynamic status.',
    pearl:
      'K > 6.5 mEq/L with ECG changes is not a routine abnormality — it is a cardiac emergency that warrants immediate provider notification.',
    relatedRefs: ['ph', 'sodium', 'glucose', 'creatinine'],
  },
  {
    id: 'creatinine',
    category: 'labs',
    title: 'Serum Creatinine / AKI',
    normalRange: 'Baseline-dependent · AKI = rise ≥ 0.3 mg/dL in 48h, or ≥ 1.5× the patient\'s baseline',
    nursesCare:
      'Creatinine is a marker of kidney filtration. A rising value reflects declining GFR — but always trend from the patient\'s own baseline, not a population normal.',
    nursesNotice: [
      'Urine output falls before creatinine rises — the kidney signals before the lab catches up.',
      'Nephrotoxic exposures (IV contrast, aminoglycosides, NSAIDs, vancomycin) are common and preventable contributors.',
      'A patient\'s pre-admission creatinine is essential context — without it, the current value can be misleading.',
    ],
    whenAttentionIncreases:
      'Any rise meeting AKI criteria, especially alongside oliguria (< 0.5 mL/kg/hr for ≥ 6h), exposure to nephrotoxic agents, or haemodynamic instability.',
    commonMistake:
      'Accepting a creatinine that looks "normal" without knowing the patient\'s pre-admission baseline.',
    pearl:
      'By the time creatinine rises, the kidney has often been under stress for hours. Urine output is the earlier signal — watch both together.',
    relatedRefs: ['urine-output', 'bun', 'potassium', 'albumin', 'lactate'],
  },
  {
    id: 'hemoglobin',
    category: 'labs',
    title: 'Hemoglobin (Hgb)',
    normalRange: 'Men: 13.5 – 17.5 g/dL · Women: 12.0 – 15.5 g/dL',
    nursesCare:
      'Hemoglobin carries oxygen to tissues. A low Hgb reduces oxygen-carrying capacity — the clinical impact depends on how quickly it fell and whether the patient is able to compensate.',
    nursesNotice: [
      'Rate of fall matters more than the absolute value — a Hgb dropping 2 g/dL over hours is an acute emergency.',
      'Compensatory tachycardia and orthostatic changes often precede a critically low Hgb showing on labs.',
      'Post-procedural and post-operative patients carry the highest acute blood loss risk.',
    ],
    whenAttentionIncreases:
      'Acute Hgb drop > 2 g/dL from baseline, Hgb < 7 g/dL in a symptomatic or haemodynamically unstable patient, or any unexplained downward trend.',
    commonMistake:
      'Anchoring on a single Hgb value without tracking the direction of change.',
    pearl:
      'A Hgb of 8 in a young, compensating patient tells a different story than Hgb of 8 in an elderly patient with chest pain and a falling MAP. Context is everything.',
    relatedRefs: ['shock-index', 'lactate', 'map', 'inr', 'platelets'],
  },
  {
    id: 'platelets',
    category: 'labs',
    title: 'Platelet Count',
    normalRange: '150,000 – 400,000 /µL',
    nursesCare:
      'Platelets are essential for primary haemostasis. A falling count raises bleeding risk; a rapid drop from baseline — even within the normal range — may signal HIT, DIC, or drug effect.',
    nursesNotice: [
      'Any patient on heparin who develops a new thrombosis despite anticoagulation is a HIT concern.',
      'Active bleeding sites should be reassessed when platelets fall below 50,000.',
      'Concurrent low fibrinogen and rising INR alongside falling platelets suggests DIC.',
    ],
    whenAttentionIncreases:
      'Platelets < 100,000 /µL in a patient on anticoagulation, < 50,000 /µL with active bleeding, or any drop of more than 50% from a prior value.',
    commonMistake:
      'Dismissing a 50% platelet drop as "still normal" in a heparinised patient — the trend, not the absolute, is the HIT signal.',
    pearl:
      'A count that drops 50% in a heparinised patient — even if still within range — is the classic HIT pattern. The trend is the warning.',
    relatedRefs: ['inr', 'aptt', 'hemoglobin', 'anti-xa'],
  },
  {
    id: 'wbc',
    category: 'labs',
    title: 'WBC (White Blood Cell Count)',
    normalRange: '4,500 – 11,000 /µL',
    nursesCare:
      'WBC reflects immune and inflammatory activity. Both high and low values signal systemic stress — WBC alone does not confirm infection or rule it out.',
    nursesNotice: [
      'A WBC < 4,000 in a clinically unwell patient may reflect overwhelming infection or bone marrow suppression.',
      'The differential (bands, neutrophils, lymphocytes) provides more clinical context than the total count alone.',
      'New fever with a normal or low WBC in an immunocompromised patient is a high-risk pattern.',
    ],
    whenAttentionIncreases:
      'WBC > 12,000 or < 4,000 /µL alongside clinical signs of infection (SIRS criteria), or WBC < 1,000 /µL suggesting severe immunosuppression.',
    commonMistake:
      'Using a normal WBC to exclude significant infection — particularly in elderly or immunocompromised patients.',
    pearl:
      'A normal WBC does not rule out serious infection. Trend the whole picture, not the number alone.',
    relatedRefs: ['lactate', 'glucose', 'albumin', 'procalcitonin-placeholder'],
  },
  {
    id: 'inr',
    category: 'labs',
    title: 'INR',
    normalRange: '0.8 – 1.2 (baseline) · Therapeutic: 2.0 – 3.0 (most indications)',
    nursesCare:
      'INR measures the extrinsic coagulation pathway and reflects warfarin effect. It guides bleeding risk assessment and is the standard monitoring parameter for patients on warfarin.',
    nursesNotice: [
      'Unexpected bruising, oozing from line sites, or blood in drainage should prompt an INR review in anticoagulated patients.',
      'Liver dysfunction can elevate INR even in patients not on warfarin.',
      'Dietary changes and new antibiotics can significantly shift INR in warfarin patients.',
    ],
    whenAttentionIncreases:
      'INR > 3.5 in a warfarin patient (supratherapeutic, bleeding risk elevated), or an unexpected INR rise in a patient not on anticoagulation (liver dysfunction, DIC, vitamin K deficiency).',
    commonMistake:
      'Overlooking an elevated INR in a patient not on anticoagulation — it may reflect liver failure or DIC, not medication effect.',
    pearl:
      'A high INR means the clotting pathway is impaired — not just a number to report. In active bleeding, any INR above normal is clinically relevant.',
    relatedRefs: ['aptt', 'anti-xa', 'platelets', 'hemoglobin', 'albumin'],
  },
  {
    id: 'aptt',
    category: 'labs',
    title: 'aPTT',
    normalRange: '25 – 35 seconds (lab-specific) · Therapeutic UFH range: ~60 – 100 seconds',
    nursesCare:
      'aPTT measures the intrinsic coagulation pathway and is the standard parameter for monitoring unfractionated heparin (UFH) infusions. It reflects how long blood takes to begin clotting.',
    nursesNotice: [
      'Draw aPTT consistently relative to the last dose — timing variation affects the result.',
      'aPTT > 100 seconds carries meaningfully elevated bleeding risk — correlate with clinical signs.',
      'Sepsis, liver disease, and DIC can all prolong aPTT independent of anticoagulation.',
    ],
    whenAttentionIncreases:
      'aPTT > 100 seconds in a heparinised patient (supratherapeutic, bleeding risk), or unexpected prolongation in a patient not on anticoagulation.',
    commonMistake:
      'Ordering aPTT to follow LMWH (enoxaparin) — aPTT does not reflect low-molecular-weight heparin activity.',
    pearl:
      'aPTT monitors UFH — not LMWH. Enoxaparin and other low-molecular-weight heparins are monitored with anti-Xa. Knowing which anticoagulant determines which lab to follow.',
    relatedRefs: ['inr', 'anti-xa', 'platelets', 'hemoglobin'],
  },
  {
    id: 'anti-xa',
    category: 'labs',
    title: 'Anti-Xa Level',
    normalRange: 'Therapeutic (BID schedule): 0.5 – 1.0 units/mL · (daily schedule): 1.0 – 2.0 units/mL · varies by protocol',
    nursesCare:
      'Anti-Xa measures the activity of low-molecular-weight heparins (e.g., enoxaparin) and certain factor Xa inhibitors. aPTT does not reflect LMWH effect — anti-Xa is the correct lab.',
    nursesNotice: [
      'Draw timing relative to the last dose matters significantly — check your facility protocol.',
      'Renal function directly affects LMWH clearance — a rising creatinine in an LMWH patient warrants clinical attention.',
      'Weight-based protocols are standard — an unexpected anti-Xa result should prompt a weight verification.',
    ],
    whenAttentionIncreases:
      'Levels outside the therapeutic range in patients with renal impairment, extremes of body weight, or pregnancy. Unexpected bleeding in a patient on LMWH warrants level checking.',
    commonMistake:
      'Using aPTT to follow a patient on LMWH — the result will be misleading and may provide false reassurance.',
    pearl:
      'Anti-Xa is the right test for LMWH monitoring. Ordering aPTT for enoxaparin is a common error — the result will be unreliable.',
    relatedRefs: ['aptt', 'inr', 'creatinine', 'platelets'],
  },
  {
    id: 'bun',
    category: 'labs',
    title: 'BUN (Blood Urea Nitrogen)',
    normalRange: '7 – 20 mg/dL',
    nursesCare:
      'BUN reflects protein catabolism and renal nitrogen excretion. It rises in AKI, dehydration, GI bleeding, and high catabolic states — the cause matters as much as the number.',
    nursesNotice: [
      'BUN rising without a proportional creatinine rise often points away from primary kidney injury.',
      'GI bleeding causes BUN to rise as blood proteins are absorbed — watch for this pattern alongside a falling Hgb.',
      'Fever, catabolism, and high protein feeds all elevate BUN without true kidney impairment.',
    ],
    whenAttentionIncreases:
      'BUN rising alongside creatinine suggests AKI. BUN rising with a stable creatinine may reflect GI bleeding, dehydration, or catabolism rather than kidney injury.',
    commonMistake:
      'Interpreting a rising BUN as kidney injury without checking the BUN:creatinine ratio.',
    pearl:
      'BUN:creatinine ratio > 20:1 often points toward a pre-renal cause or upper GI bleed — not intrinsic kidney injury. The ratio narrows the picture.',
    relatedRefs: ['creatinine', 'hemoglobin', 'albumin', 'sodium'],
  },
  {
    id: 'glucose',
    category: 'labs',
    title: 'Blood Glucose',
    normalRange: '70 – 140 mg/dL (fasting to post-prandial) · ICU target: 140 – 180 mg/dL per local protocol',
    nursesCare:
      'Blood glucose monitoring is a core nursing responsibility. Both hypoglycaemia and sustained hyperglycaemia affect clinical outcomes — each in a different direction.',
    nursesNotice: [
      'Altered mental status in any hospitalised patient warrants an immediate glucose check.',
      'Diaphoresis, tremor, and pallor are classic hypoglycaemia signs — but critically ill patients may not display them.',
      'Glucose patterns shift with enteral feed schedules — timing the check relative to feeds matters.',
    ],
    whenAttentionIncreases:
      'Glucose < 70 mg/dL (hypoglycaemia — neurological risk, requires prompt attention) or sustained > 180 mg/dL in a critically ill patient, especially with altered mental status or new infection signs.',
    commonMistake:
      'Over-focusing on elevated glucose while missing a subtler and more immediately dangerous hypoglycaemia.',
    pearl:
      'Hypoglycaemia is the more immediate danger. A glucose of 50 with altered mentation requires faster action than a glucose of 250.',
    relatedRefs: ['sodium', 'phosphorus', 'albumin', 'creatinine'],
  },
  {
    id: 'phosphorus',
    category: 'labs',
    title: 'Serum Phosphorus',
    normalRange: '2.5 – 4.5 mg/dL',
    nursesCare:
      'Phosphorus is essential for cellular energy (ATP), red blood cell function, and respiratory muscle strength. Critically low levels in ventilated patients can impair the ability to wean.',
    nursesNotice: [
      'Refeeding syndrome causes phosphorus to drop precipitously when nutrition is reintroduced in a malnourished patient.',
      'Respiratory muscle weakness from low phosphorus is subtle — watch for changes in ventilator tolerance.',
      'Patients on extended nutrition support are at ongoing risk for phosphorus depletion.',
    ],
    whenAttentionIncreases:
      'Phosphorus < 1.0 mg/dL (severe hypophosphataemia — risk of respiratory muscle weakness, haemolysis, cardiac dysfunction), or a downward trend in a patient on nutrition support.',
    commonMistake:
      'Missing hypophosphataemia as a hidden cause of ventilator weaning failure.',
    pearl:
      'Hypophosphataemia is a hidden barrier to ventilator weaning. A patient who fails repeated liberation attempts without a clear reason is worth checking.',
    relatedRefs: ['albumin', 'glucose', 'tidal-volume', 'minute-ventilation'],
  },
  {
    id: 'albumin',
    category: 'labs',
    title: 'Serum Albumin',
    normalRange: '3.5 – 5.0 g/dL',
    nursesCare:
      'Albumin reflects nutritional status and liver synthetic function. A low albumin can alter how medications behave and contribute to oedema by reducing oncotic pressure.',
    nursesNotice: [
      'Low albumin shifts water out of the vascular space — contributing to oedema that may not respond to diuresis alone.',
      'Pressure injury risk rises significantly with albumin below 3.0 g/dL.',
      'Protein-bound medications may have higher free fractions in a low-albumin patient — an unexpected drug effect may reflect this.',
    ],
    whenAttentionIncreases:
      'Albumin < 2.5 g/dL (associated with poor wound healing, dependent oedema, altered drug binding). Trend matters more than a single value.',
    commonMistake:
      'Reading oedema as a simple fluid problem when the underlying driver may be low oncotic pressure from hypoalbuminaemia.',
    pearl:
      'Albumin is a slow marker — it reflects weeks of nutritional reserve, not yesterday\'s intake. A critically low albumin signals trajectory, not just today.',
    relatedRefs: ['anion-gap', 'bun', 'creatinine', 'glucose', 'sodium'],
  },

  // ── ABGs ─────────────────────────────────────────────────────────────────────
  {
    id: 'ph',
    category: 'abgs',
    title: 'Arterial pH',
    normalRange: '7.35 – 7.45',
    nursesCare:
      'pH reflects the overall acid-base balance of arterial blood. A value below 7.35 indicates acidosis; above 7.45 indicates alkalosis. Each has distinct systemic effects.',
    nursesNotice: [
      'Mentation, respiratory pattern, and skin colour often reflect pH before the blood gas is resulted.',
      'A pH < 7.20 depresses cardiac contractility — the patient may decompensate rapidly.',
      'Serial ABGs are more informative than a single value — always ask when the last one was drawn.',
    ],
    whenAttentionIncreases:
      'pH < 7.20 (severe acidosis — cardiac depression, vasodilation risk) or pH > 7.60 (severe alkalosis — tetany, arrhythmia risk).',
    commonMistake:
      'Interpreting the pH without simultaneously reviewing PaCO2 and HCO3 to identify the source disturbance.',
    pearl:
      'pH tells you there\'s a problem. PaCO2 and HCO3 tell you where it\'s coming from. Never interpret one without the other two.',
    relatedRefs: ['paco2', 'hco3', 'base-excess', 'lactate', 'anion-gap'],
  },
  {
    id: 'paco2',
    category: 'abgs',
    title: 'PaCO₂',
    normalRange: '35 – 45 mmHg',
    nursesCare:
      'PaCO2 is the respiratory component of acid-base balance, determined by how effectively the patient is ventilating. High PaCO2 (hypoventilation) causes respiratory acidosis; low causes respiratory alkalosis.',
    nursesNotice: [
      'A patient breathing rapidly with a normal or low PaCO2 is compensating — but the effort may not be sustainable.',
      'Sedation, opioids, and neuromuscular disease all depress respiratory drive and raise PaCO2.',
      'In COPD, a PaCO2 of 45 may be elevated compared to that patient\'s known chronic baseline.',
    ],
    whenAttentionIncreases:
      'PaCO2 > 50 mmHg alongside deteriorating mental status or visible breathing fatigue. An acute rise in a COPD patient with a known baseline is always significant.',
    commonMistake:
      'Reading a PaCO2 of 45 as normal in a COPD patient who chronically runs 35 — for them, that may represent acute CO2 retention.',
    pearl:
      'A normal PaCO2 in a patient breathing very fast is not reassuring — it may mean they are tiring and about to lose their compensatory effort.',
    relatedRefs: ['ph', 'hco3', 'respiratory-rate', 'minute-ventilation', 'etco2'],
  },
  {
    id: 'pao2',
    category: 'abgs',
    title: 'PaO₂',
    normalRange: '80 – 100 mmHg (room air)',
    nursesCare:
      'PaO2 measures dissolved oxygen in arterial blood and directly reflects how well the lungs are oxygenating. It is the basis for the P/F ratio used in ARDS classification.',
    nursesNotice: [
      'PaO2 < 60 mmHg is where the oxygen-haemoglobin dissociation curve becomes steep — small drops matter more here.',
      'Always interpret PaO2 alongside FiO2 — a PaO2 of 80 on FiO2 1.0 is very different from PaO2 80 on room air.',
      'An ABG drawn from a poorly perfused extremity may underestimate true arterial oxygenation.',
    ],
    whenAttentionIncreases:
      'PaO2 < 60 mmHg on room air meets the threshold for hypoxaemic respiratory failure. Below 55 mmHg, oxygen saturation begins to fall steeply.',
    commonMistake:
      'Interpreting PaO2 in isolation without accounting for the FiO2 being delivered.',
    pearl:
      'SpO2 can look acceptable while PaO2 is marginal. Always interpret the PaO2 against the FiO2 being delivered — the number alone tells only half the story.',
    relatedRefs: ['spo2', 'fio2', 'pf-ratio', 'peep', 'ph'],
  },
  {
    id: 'hco3',
    category: 'abgs',
    title: 'Bicarbonate (HCO₃⁻)',
    normalRange: '22 – 26 mEq/L',
    nursesCare:
      'HCO3 is the metabolic, kidney-regulated component of acid-base balance. A low value signals metabolic acidosis; a high value signals metabolic alkalosis.',
    nursesNotice: [
      'HCO3 changes slowly — a very low value often reflects a process that has been building for hours to days.',
      'NG suctioning, vomiting, and over-diuresis are common bedside causes of metabolic alkalosis.',
      'A "normal" HCO3 alongside a low pH means compensation is incomplete — both numbers together tell the story.',
    ],
    whenAttentionIncreases:
      'HCO3 < 15 mEq/L (significant metabolic acidosis — calculate the anion gap). HCO3 > 32 mEq/L (metabolic alkalosis — consider NG losses, over-diuresis, vomiting).',
    commonMistake:
      'Reading HCO3 without checking whether it represents the primary disturbance or a compensatory response.',
    pearl:
      'Low HCO3 in a critically ill patient means calculate the anion gap: Na − Cl − HCO3. A high gap points to lactate, ketones, or toxins.',
    relatedRefs: ['ph', 'paco2', 'anion-gap', 'base-excess', 'sodium'],
  },
  {
    id: 'base-excess',
    category: 'abgs',
    title: 'Base Excess / Base Deficit',
    normalRange: '−2 to +2 mEq/L',
    nursesCare:
      'Base excess reflects the pure metabolic component of acid-base status, isolated from the respiratory contribution. A base deficit (negative value) quantifies how much metabolic acidosis is present.',
    nursesNotice: [
      'A worsening base deficit in a haemodynamically stable patient signals an ongoing perfusion problem worth finding.',
      'Serial base deficit often moves faster than lactate in traumatically injured patients.',
      'A base deficit shifting from −8 to −4 suggests the patient is responding — even before other signs improve.',
    ],
    whenAttentionIncreases:
      'Base deficit worse than −6 in a trauma or critically ill patient suggests significant tissue acidosis. Serial values track how the patient is responding over time.',
    commonMistake:
      'Reading the base deficit as a static number rather than watching which direction it is moving.',
    pearl:
      'A worsening base deficit tells you the underlying problem has not been addressed — not simply that more volume is needed.',
    relatedRefs: ['ph', 'lactate', 'hco3', 'map', 'mixed-acidosis'],
  },
  {
    id: 'anion-gap',
    category: 'abgs',
    title: 'Anion Gap',
    normalRange: '8 – 12 mEq/L · Correct for low albumin: add 2.5 per 1 g/dL below 4',
    nursesCare:
      'The anion gap identifies unmeasured anions in the blood — primarily organic acids. A high gap alongside metabolic acidosis significantly narrows the clinical picture.',
    nursesNotice: [
      'In the ICU, albumin is almost always low — always apply the albumin correction or the gap may appear falsely normal.',
      'A high anion gap with a low lactate should prompt consideration of ketones, uraemia, or ingested substances.',
      'A normal anion gap metabolic acidosis (non-gap) has a distinct differential — diarrhoea, renal tubular acidosis, bicarbonate loss.',
    ],
    whenAttentionIncreases:
      'Anion gap > 12 mEq/L alongside metabolic acidosis. Common causes: lactate, ketones, uraemia, ingested toxins. A wide gap in a previously normal patient warrants urgent attention.',
    commonMistake:
      'Using the uncorrected anion gap in a critically ill patient with low albumin — a real high-gap acidosis can hide behind a "normal" number.',
    pearl:
      'Always correct the anion gap for albumin in the ICU. A low albumin artificially lowers the gap — a true high-gap acidosis can hide behind a "normal" number.',
    relatedRefs: ['hco3', 'lactate', 'ph', 'bun', 'albumin'],
  },
  {
    id: 'acid-base-compensation',
    category: 'abgs',
    title: 'Acid-Base Compensation',
    normalRange: 'Varies by primary disturbance — expected ranges below',
    nursesCare:
      'Compensation reveals whether the body is mounting an appropriate response to a primary acid-base disturbance. An inadequate or excessive response signals a second primary disorder layered on top.',
    nursesNotice: [
      'Checking compensation takes 30 seconds and significantly changes how the ABG is interpreted.',
      'In complex critically ill patients, mixed disorders are common — a single primary disturbance is not always the rule.',
      'When the calculated and measured compensation don\'t match, there are likely two primary disturbances.',
    ],
    whenAttentionIncreases:
      'When the compensation appears absent or overshoots the expected range — this signals two primary disturbances, not one. The interpretation changes significantly.',
    commonMistake:
      'Stopping at identifying the primary disturbance without checking whether the compensation is appropriate.',
    pearl:
      'Expected respiratory compensation for metabolic acidosis: PaCO2 ≈ 1.5 × HCO3 + 8 (±2). If the measured PaCO2 doesn\'t match, there are two problems, not one.',
    relatedRefs: ['ph', 'paco2', 'hco3', 'mixed-acidosis', 'mixed-alkalosis'],
  },
  {
    id: 'mixed-acidosis',
    category: 'abgs',
    title: 'Mixed Acidosis',
    normalRange: 'Not applicable — pH < 7.35 with ↑ PaCO2 and ↓ HCO3 simultaneously',
    nursesCare:
      'Mixed acidosis combines respiratory and metabolic failure at the same time. Both the lungs and the metabolic buffer system are overwhelmed — a pattern seen in cardiac arrest, severe sepsis, and multi-organ failure.',
    nursesNotice: [
      'Mixed acidosis is often a signal of late-stage decompensation — earlier single-disturbance ABGs frequently precede it.',
      'These patients often appear critically unwell — the ABG confirms what the clinical exam already suggests.',
      'Respiratory rate and mental status are the most visible bedside correlates of a mixed acidosis picture.',
    ],
    whenAttentionIncreases:
      'Any ABG showing low pH alongside elevated PaCO2 and low HCO3 together. This combined failure pattern warrants urgent escalation.',
    commonMistake:
      'Spending time determining which disturbance came first rather than escalating on the combined picture.',
    pearl:
      'Mixed acidosis is not a complex ABG — it is a patient deteriorating from two directions at once. Escalate before trying to fully explain the gas.',
    relatedRefs: ['ph', 'paco2', 'hco3', 'lactate', 'base-excess'],
  },
  {
    id: 'mixed-alkalosis',
    category: 'abgs',
    title: 'Mixed Alkalosis',
    normalRange: 'Not applicable — pH > 7.45 with ↓ PaCO2 and ↑ HCO3 simultaneously',
    nursesCare:
      'Mixed alkalosis occurs when respiratory and metabolic alkalosis are both present. Common in mechanically ventilated patients with concurrent NG losses, prolonged vomiting, or aggressive diuresis.',
    nursesNotice: [
      'Review recent diuretic use, NG output volumes, and ventilator rate when this pattern appears.',
      'pH 7.55 with both low PaCO2 and high HCO3 in a ventilated patient often reflects over-ventilation alongside metabolic loss.',
      'This pattern is often missed because the pH appears less alarming than severe acidosis.',
    ],
    whenAttentionIncreases:
      'pH > 7.55 with both a low PaCO2 and an elevated HCO3. Severe alkalosis shifts the oxygen-haemoglobin dissociation curve and can suppress the respiratory drive.',
    commonMistake:
      'Missing mixed alkalosis because the pH isn\'t dramatically abnormal — pH of 7.55 with combined causes still carries significant risk.',
    pearl:
      'Mixed alkalosis is often iatrogenic — over-ventilation plus sustained NG suctioning or aggressive diuresis. Look at what is happening to the patient, not just the number.',
    relatedRefs: ['ph', 'paco2', 'hco3', 'sodium', 'potassium'],
  },
  {
    id: 'oxygenation-vs-ventilation',
    category: 'abgs',
    title: 'Oxygenation vs. Ventilation',
    normalRange: 'Oxygenation: SpO2 / PaO2 · Ventilation: PaCO2 / EtCO2',
    nursesCare:
      'Oxygenation and ventilation are distinct physiological functions. A patient can be well-oxygenated but failing to clear CO2 — or vice versa. Confusing the two leads to misreading clinical deterioration.',
    nursesNotice: [
      'SpO2 and EtCO2 together provide a rapid bedside picture of both functions without an ABG.',
      'Rising SpO2 with simultaneously rising EtCO2 is a warning — oxygenating but not ventilating.',
      '"Can they move CO2?" is a different question from "are they saturating?" — both matter and each can fail independently.',
    ],
    whenAttentionIncreases:
      'SpO2 normal but PaCO2 rising — CO2 is not being cleared despite adequate oxygen. Or PaO2 falling despite a normal or high respiratory rate.',
    commonMistake:
      'Equating a good SpO2 with good ventilation — a well-oxygenated patient can still be retaining dangerous levels of CO2.',
    pearl:
      'Oxygenation is about getting O2 in. Ventilation is about getting CO2 out. Two different problems — two different monitors.',
    relatedRefs: ['spo2', 'etco2', 'paco2', 'pao2', 'respiratory-rate'],
  },

  // ── Ventilation ──────────────────────────────────────────────────────────────
  {
    id: 'tidal-volume',
    category: 'ventilation',
    title: 'Tidal Volume (Vt)',
    normalRange: '6 – 8 mL/kg ideal body weight (IBW)',
    nursesCare:
      'Tidal volume is the size of each breath the ventilator delivers. Lung-protective ventilation targets 6 mL/kg IBW to limit ventilator-induced lung injury (VILI), particularly in ARDS.',
    nursesNotice: [
      'Verify delivered Vt against the ordered volume each shift — dynamic hyperinflation or a circuit issue can cause drift.',
      'In a spontaneously breathing intubated patient, Vt varying significantly breath-to-breath may signal discomfort or dyssynchrony.',
      'On pressure-control modes, Vt varies with compliance — a falling Vt at the same pressure means the lungs are stiffening.',
    ],
    whenAttentionIncreases:
      'Delivered Vt consistently exceeding the ordered volume (circuit leak, dynamic hyperinflation), or plateau pressure persistently above 30 cmH2O despite a target Vt.',
    commonMistake:
      'Calculating Vt based on actual body weight instead of ideal body weight — this consistently overestimates safe volumes in obese patients.',
    pearl:
      'Always use ideal body weight, not actual weight, for Vt targets. A tall patient and a short patient of the same actual weight have very different lung capacities.',
    relatedRefs: ['plateau-pressure', 'peep', 'ventilator-compliance', 'pf-ratio', 'respiratory-rate'],
  },
  {
    id: 'peep',
    category: 'ventilation',
    title: 'PEEP (Positive End-Expiratory Pressure)',
    normalRange: '5 cmH₂O physiologic · therapeutic range varies by clinical context',
    nursesCare:
      'PEEP maintains airway pressure at end-expiration to prevent alveolar collapse, recruit atelectatic lung, and improve oxygenation. Higher levels are used in ARDS for refractory hypoxaemia.',
    nursesNotice: [
      'Watch the blood pressure closely for 5–10 minutes after any PEEP change.',
      'Suction events transiently drop PEEP — in ARDS patients, this may cause significant desaturation.',
      'High PEEP can mask pneumothorax signs — watch for unequal breath sounds and falling compliance alongside a haemodynamic change.',
    ],
    whenAttentionIncreases:
      'New hypotension after a PEEP change (compressed venous return), rising plateau pressures, or signs of pneumothorax: sudden drop in compliance or unexpected oxygen desaturation.',
    commonMistake:
      'Assuming more PEEP is always better for oxygenation without considering the haemodynamic cost.',
    pearl:
      'PEEP improves oxygenation but compresses venous return. After any PEEP change, watch the blood pressure — especially in a volume-depleted patient.',
    relatedRefs: ['tidal-volume', 'plateau-pressure', 'map', 'fio2', 'ventilator-compliance'],
  },
  {
    id: 'fio2',
    category: 'ventilation',
    title: 'FiO₂ (Fraction of Inspired Oxygen)',
    normalRange: '0.21 (room air) · 1.0 = 100% oxygen',
    nursesCare:
      'FiO2 is the oxygen concentration being delivered. The clinical goal is the lowest FiO2 that maintains acceptable oxygenation — high FiO2 sustained over time contributes to oxygen toxicity.',
    nursesNotice: [
      'FiO2 requirements rising without a clear cause — new secretions, position change, circuit issue — warrant clinical reassessment.',
      'High FiO2 with low PEEP often reflects undertreated alveolar collapse, not just an oxygen deficit.',
      'A rising FiO2 need in a previously stable patient is a clinical signal, not just a ventilator setting to adjust.',
    ],
    whenAttentionIncreases:
      'Oxygen requirements rising without a corresponding improvement in SpO2 or PaO2, or FiO2 sustained above 0.60 for more than 24 hours.',
    commonMistake:
      'Adjusting FiO2 as the first response to a desaturation without checking for a correctable underlying cause.',
    pearl:
      'Rising FiO2 needs with no SpO2 improvement is a signal the respiratory picture is changing — not just a dial to keep adjusting.',
    relatedRefs: ['peep', 'pf-ratio', 'spo2', 'pao2', 'plateau-pressure'],
  },
  {
    id: 'pf-ratio',
    category: 'ventilation',
    title: 'P/F Ratio (PaO₂ ÷ FiO₂)',
    normalRange: '> 300 mmHg · ARDS: mild < 300 · moderate < 200 · severe < 100',
    nursesCare:
      'The P/F ratio standardises oxygenation against the level of oxygen support being provided. It is the core metric for ARDS severity classification and reflects true lung performance.',
    nursesNotice: [
      'Calculate P/F at each ABG draw for any ventilated patient — it provides instant lung function context.',
      'A sudden drop in P/F ratio is more meaningful than a gradual one — it suggests a new acute event.',
      'P/F trending down over 24–48 hours despite stable settings may signal progressive ARDS.',
    ],
    whenAttentionIncreases:
      'A falling P/F ratio despite current ventilator settings — particularly a drop below 200 (moderate ARDS) or below 100 (severe ARDS).',
    commonMistake:
      'Looking at PaO2 without adjusting for the FiO2 — a PaO2 of 100 on FiO2 1.0 is not reassuring.',
    pearl:
      'PaO2 of 90 on FiO2 0.60 = P/F ratio of 150. That context tells a different story than the raw number alone.',
    relatedRefs: ['pao2', 'fio2', 'peep', 'tidal-volume', 'oxygenation-vs-ventilation'],
  },
  {
    id: 'minute-ventilation',
    category: 'ventilation',
    title: 'Minute Ventilation (Ve)',
    normalRange: '5 – 10 L/min  (Vt × RR)',
    nursesCare:
      'Minute ventilation is the total volume of air moved per minute and is the primary determinant of CO2 clearance. A high respiratory rate and small Vt may maintain Ve — but at significant respiratory muscle cost.',
    nursesNotice: [
      'A spontaneously breathing patient with a very high respiratory rate may be maintaining Ve at significant effort cost.',
      'A sudden rise in minute ventilation in a ventilated patient may reflect dyssynchrony or uncontrolled pain.',
      'Falling Ve with a rising CO2 in a spontaneously breathing patient is a pre-failure warning sign.',
    ],
    whenAttentionIncreases:
      'Ve > 15 L/min signals very high respiratory demand. A falling Ve in a spontaneously breathing patient may signal impending fatigue.',
    commonMistake:
      'Focusing on respiratory rate alone without calculating whether the minute ventilation is actually sufficient.',
    pearl:
      'A high respiratory rate can sustain minute ventilation — until the patient exhausts. When rate is the only buffer left, the margin is narrowing.',
    relatedRefs: ['respiratory-rate', 'tidal-volume', 'etco2', 'paco2', 'dead-space'],
  },
  {
    id: 'respiratory-rate',
    category: 'ventilation',
    title: 'Respiratory Rate (RR)',
    normalRange: '12 – 20 breaths/min',
    nursesCare:
      'Respiratory rate is one of the most sensitive early indicators of clinical deterioration — and one of the most poorly documented vital signs. A rising RR signals respiratory distress, pain, metabolic acidosis, or sepsis.',
    nursesNotice: [
      'Count for a full 60 seconds — abbreviated counts significantly underestimate elevated rates.',
      'An RR climbing from 18 to 24 to 30 over 4 hours is a deterioration signal even when individual readings seem acceptable.',
      'Pain, anxiety, and fever all raise RR before hypoxia does — address each systematically.',
    ],
    whenAttentionIncreases:
      'RR > 25/min (respiratory distress range) or < 10/min in an unintubated patient (respiratory depression). Any sustained departure from the patient\'s own baseline deserves attention.',
    commonMistake:
      'Documenting a respiratory rate without actually counting — estimated or guessed rates miss clinically significant tachypnoea.',
    pearl:
      'RR is underrated. Studies consistently show it rises before other vitals deteriorate. A patient breathing at 28 is compensating — for something.',
    relatedRefs: ['spo2', 'etco2', 'minute-ventilation', 'paco2', 'shock-index'],
  },
  {
    id: 'ventilator-compliance',
    category: 'ventilation',
    title: 'Ventilator Compliance',
    normalRange: 'Dynamic: 40 – 60 mL/cmH₂O · Static: 60 – 100 mL/cmH₂O',
    nursesCare:
      'Compliance reflects how easily the lungs and chest wall expand with each breath. Falling compliance means the lungs are stiffening — a sign of worsening pathology, airway obstruction, or a mechanical problem.',
    nursesNotice: [
      'Check compliance after any major position change — particularly prone positioning or Trendelenburg.',
      'New secretions causing airway obstruction lower dynamic compliance but may not significantly affect static compliance.',
      'A sudden compliance drop with haemodynamic change is a tension pneumothorax pattern until confirmed otherwise.',
    ],
    whenAttentionIncreases:
      'Acute worsening compliance alongside rising peak or plateau pressures. Possible causes: new pneumothorax, mucus plug, right mainstem intubation, or progressive ARDS.',
    commonMistake:
      'Attributing falling compliance to disease progression without first ruling out a correctable mechanical cause.',
    pearl:
      'A sudden drop in compliance is an alarm, not a trend. Sudden stiffening of the ventilated lung warrants immediate assessment — starting with tube position and breath sounds.',
    relatedRefs: ['plateau-pressure', 'peep', 'tidal-volume', 'pf-ratio', 'dead-space'],
  },
  {
    id: 'dead-space',
    category: 'ventilation',
    title: 'Dead Space (Vd/Vt)',
    normalRange: '~0.3 normal (30% of each breath is dead space) · Elevated: > 0.6',
    nursesCare:
      'Dead space is the portion of each tidal volume that moves air without participating in gas exchange. Elevated dead space is a marker of poor ventilation-perfusion matching — common in PE, ARDS, and haemodynamic compromise.',
    nursesNotice: [
      'A widening gap between EtCO2 and PaCO2 is the bedside signal for worsening dead space.',
      'Poor cardiac output worsens dead space — a pulmonary problem and a cardiac problem can look similar on ventilator parameters.',
      'Rising CO2 with stable settings often means the clinical picture has changed, not the ventilator.',
    ],
    whenAttentionIncreases:
      'Rising CO2 despite stable or rising minute ventilation in a ventilated patient — the lungs are moving air but not exchanging gases effectively.',
    commonMistake:
      'Attributing a rising PaCO2 to hypoventilation alone without considering whether dead space has worsened.',
    pearl:
      'When EtCO2 is much lower than PaCO2, that gap reflects dead space — a perfusion problem wearing a ventilation mask.',
    relatedRefs: ['etco2', 'paco2', 'ventilator-compliance', 'cardiac-output', 'pf-ratio'],
  },
  {
    id: 'plateau-pressure',
    category: 'ventilation',
    title: 'Plateau Pressure (Pplat)',
    normalRange: '< 30 cmH₂O (lung-protective target)',
    nursesCare:
      'Plateau pressure reflects the end-inspiratory alveolar pressure — the pressure the alveoli actually experience with each breath. Values above 30 cmH₂O are associated with ventilator-induced lung injury.',
    nursesNotice: [
      'Plateau pressure is measured during an inspiratory hold — the patient must be passive for an accurate reading.',
      'A plateau pressure rising over consecutive checks — even within the "safe" range — warrants attention.',
      'Comparing peak and plateau pressure together helps localise the problem: large gap = airway resistance; narrow gap = stiff lung.',
    ],
    whenAttentionIncreases:
      'Pplat > 30 cmH₂O despite lung-protective Vt settings, or an acute rise from baseline (new pneumothorax, tube displacement, worsening ARDS, mucus plug).',
    commonMistake:
      'Relying on peak pressure alone to assess lung injury risk — peak pressure includes airway resistance and overestimates alveolar pressure.',
    pearl:
      'Peak pressure reflects airway resistance. Plateau pressure reflects what the alveoli are experiencing. Only plateau pressure matters for lung injury risk.',
    relatedRefs: ['tidal-volume', 'peep', 'ventilator-compliance', 'pf-ratio', 'dead-space'],
  },

  // ── Devices ──────────────────────────────────────────────────────────────────
  {
    id: 'central-line',
    category: 'devices',
    title: 'Central Venous Catheter (CVC)',
    normalRange: null,
    nursesCare:
      'CVCs provide reliable access for vasoactive infusions, hypertonic solutions, TPN, and haemodynamic monitoring. Each lumen carries responsibility — use and maintain every port intentionally.',
    nursesNotice: [
      'Blood return should be checked at the start of every shift and before any critical infusion.',
      'A new fever without another clear source should prompt line site assessment and clinical discussion.',
      'Occlusion of one lumen while others flush freely may indicate a positional or intraluminal issue.',
    ],
    whenAttentionIncreases:
      'New fever in a patient with a CVC, redness or tenderness at the insertion site, sluggish or absent blood return, or blood cultures flagging line-associated organisms.',
    commonMistake:
      'Assuming a functioning CVC is still clinically necessary without daily reassessment.',
    pearl:
      'The line you question every shift is the one that gets removed before it causes harm. Necessity is a daily nursing assessment, not a one-time decision.',
    relatedRefs: ['arterial-line', 'map', 'cvp'],
  },
  {
    id: 'arterial-line',
    category: 'devices',
    title: 'Arterial Line (A-Line)',
    normalRange: null,
    nursesCare:
      'Arterial lines provide continuous beat-to-beat blood pressure monitoring and direct arterial access for blood sampling. Essential in haemodynamically unstable patients and those on vasoactive infusions.',
    nursesNotice: [
      'The waveform shape carries information — dampening, a pulsus paradoxus pattern, or a poorly defined dicrotic notch each signal something.',
      'Always confirm zero reference and transducer level before interpreting any arterial reading.',
      'Distal hand and finger perfusion should be assessed and documented at every nursing assessment.',
    ],
    whenAttentionIncreases:
      'Dampened waveform (air, clot, kinked tubing), sudden loss of waveform, site bleeding, or any sign of distal ischaemia — pallor, coolness, or pain distal to the insertion point.',
    commonMistake:
      'Acting on an arterial line reading without first confirming the waveform quality and transducer level are correct.',
    pearl:
      'A dampened waveform gives inaccurate numbers. Troubleshoot the waveform before acting on an unexpected reading.',
    relatedRefs: ['map', 'central-line', 'cvp', 'pulse-pressure'],
  },
  {
    id: 'foley',
    category: 'devices',
    title: 'Foley Catheter (IDC)',
    normalRange: 'Urine output goal: ≥ 0.5 mL/kg/hr',
    nursesCare:
      'Foley catheters allow precise, hourly urine output monitoring and bladder drainage. Critical in haemodynamically unstable and post-operative patients. CAUTI risk rises with every day of dwell time.',
    nursesNotice: [
      'Urine colour and character should be assessed and documented alongside the volume.',
      'A catheter that suddenly stops draining needs a patency check before any other conclusion.',
      'CAUTI signs — cloudy urine, new suprapubic tenderness, fever — are a nursing assessment priority.',
    ],
    whenAttentionIncreases:
      'Urine output < 0.5 mL/kg/hr sustained for 2 or more hours, frank haematuria, sudden drop to zero output, or signs of a catheter-associated urinary tract infection.',
    commonMistake:
      'Documenting urine output from a catheter that has not been assessed for patency — kinks and clots are common causes of false oliguria.',
    pearl:
      'Before acting on oliguria, rule out obstruction — check for kinks, dependent loops, and position. A 60-second troubleshoot often reveals the cause.',
    relatedRefs: ['urine-output', 'creatinine', 'map', 'bun'],
  },
  {
    id: 'ngt',
    category: 'devices',
    title: 'Nasogastric Tube (NGT)',
    normalRange: null,
    nursesCare:
      'NGTs are used for gastric decompression, enteral feeding, and medication delivery. Placement must be confirmed before any use — aspiration from a misplaced tube is a preventable catastrophe.',
    nursesNotice: [
      'After any patient repositioning, retching, or coughing, tube position should be reassessed.',
      'Nausea, reflux, and abdominal distension in a tube-fed patient warrant tube position and function review.',
      'Residual volume assessment is part of safe enteral feeding monitoring — follow local protocol.',
    ],
    whenAttentionIncreases:
      'Patient distress or coughing during insertion or feeds, oxygen desaturation during feeding, unexpectedly high gastric residuals, or new respiratory symptoms in a tube-fed patient.',
    commonMistake:
      'Assuming an NGT confirmed by X-ray yesterday is still in the same position today.',
    pearl:
      'Auscultation alone is not a reliable confirmation method. pH testing of gastric aspirate or X-ray confirmation before first use is the safer standard.',
    relatedRefs: ['albumin', 'glucose', 'phosphorus', 'sodium'],
  },
];
