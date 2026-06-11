export const CATEGORIES = [
  { id: 'hemodynamics', label: 'Hemodynamics' },
  { id: 'labs',         label: 'Labs' },
  { id: 'abgs',         label: 'ABGs' },
  { id: 'ventilation',  label: 'Ventilation' },
  { id: 'devices',      label: 'Devices' },
];

export const REFERENCES = [
  // ── Hemodynamics ────────────────────────────────────────────────────────────
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

  // ── Labs ─────────────────────────────────────────────────────────────────────
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

  // ── ABGs ──────────────────────────────────────────────────────────────────────
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

  // ── Ventilation ───────────────────────────────────────────────────────────────
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

  // ── Devices ────────────────────────────────────────────────────────────────────
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
