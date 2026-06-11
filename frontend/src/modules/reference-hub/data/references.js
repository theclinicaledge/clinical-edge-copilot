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
      'MAP reflects the average perfusion pressure driving blood to vital organs. A MAP below 65 signals inadequate organ perfusion regardless of systolic BP.',
    whenAttentionIncreases:
      'MAP < 65 mmHg sustained more than a few minutes, especially with altered mental status, decreased urine output, or rising lactate.',
    pearl:
      'Systolic BP can look acceptable while MAP is critically low. Check MAP directly — do not rely on the top number alone.',
  },
  {
    id: 'cvp',
    category: 'hemodynamics',
    title: 'Central Venous Pressure (CVP)',
    normalRange: '2 – 8 mmHg',
    nursesCare:
      'CVP estimates right-sided filling pressure and is used as a trending tool for volume status. It is one data point — not a standalone guide to resuscitation.',
    whenAttentionIncreases:
      'Sudden rise above baseline (possible tension pneumothorax, cardiac tamponade, RV failure) or sustained drop in a fluid-resuscitated patient.',
    pearl:
      'A single CVP number means little. Trend it alongside MAP, urine output, and clinical exam. CVP does not reliably predict fluid responsiveness.',
  },
  {
    id: 'cardiac-output',
    category: 'hemodynamics',
    title: 'Cardiac Output / Cardiac Index',
    normalRange: 'CO: 4 – 8 L/min · CI: 2.5 – 4.0 L/min/m²',
    nursesCare:
      'CO is the volume of blood the heart pumps per minute. CI normalises it to body surface area and is preferred for comparing patients of different sizes.',
    whenAttentionIncreases:
      'CI < 2.2 L/min/m² (cardiogenic shock range) or an acute unexplained drop from the patient\'s own baseline.',
    pearl:
      'CI < 2.2 with elevated filling pressures and cool, mottled extremities is the classic cardiogenic shock picture. Notify early.',
  },
  {
    id: 'svr',
    category: 'hemodynamics',
    title: 'Systemic Vascular Resistance (SVR)',
    normalRange: '800 – 1200 dynes·sec/cm⁵',
    nursesCare:
      'SVR is afterload — the resistance the left ventricle pumps against. High SVR increases cardiac work; low SVR indicates vasodilation (e.g., sepsis, anaphylaxis).',
    whenAttentionIncreases:
      'SVR < 800 in a hypotensive patient suggests vasodilatory shock. SVR > 1400 in a low-output state may signal the heart is compensating with dangerous vasoconstriction.',
    pearl:
      'Distributive shock (sepsis, anaphylaxis) = low SVR + high CO. Cardiogenic shock = high SVR + low CO. The pattern shapes management.',
  },
  {
    id: 'pulse-pressure',
    category: 'hemodynamics',
    title: 'Pulse Pressure',
    normalRange: '~40 mmHg (SBP − DBP)',
    nursesCare:
      'Pulse pressure reflects stroke volume and arterial compliance. A narrow pulse pressure suggests reduced stroke volume; a widened one may indicate aortic regurgitation or high output states.',
    whenAttentionIncreases:
      'Narrowing pulse pressure (< 25 mmHg) during resuscitation, or a new widening in a post-cardiac surgical patient.',
    pearl:
      'A pulse pressure < 25 mmHg is an early sign of haemodynamic compromise — sometimes visible before the systolic BP drops significantly.',
  },
  {
    id: 'shock-index',
    category: 'hemodynamics',
    title: 'Shock Index',
    normalRange: '0.5 – 0.7 (HR ÷ SBP)',
    nursesCare:
      'Shock Index is a quick bedside calculation. A value ≥ 1.0 suggests haemodynamic instability even when individual vitals appear borderline.',
    whenAttentionIncreases:
      'Shock Index ≥ 1.0, especially with clinical signs of hypoperfusion: altered mentation, cool extremities, or declining urine output.',
    pearl:
      'HR 110, SBP 100 → Shock Index 1.1. Those vitals may not look alarming individually — but the ratio flags the picture early.',
  },

  // ── Labs ─────────────────────────────────────────────────────────────────────
  {
    id: 'lactate',
    category: 'labs',
    title: 'Serum Lactate',
    normalRange: '< 2.0 mmol/L',
    nursesCare:
      'Lactate reflects cellular oxygen debt. Elevated lactate means tissues are not receiving or using oxygen adequately — a systemic warning regardless of the cause.',
    whenAttentionIncreases:
      'Lactate ≥ 2.0 warrants attention; ≥ 4.0 is the threshold for septic shock criteria. Rising lactate in a treated patient signals inadequate resuscitation.',
    pearl:
      'Lactate clearance matters as much as the initial value. A lactate that fails to trend down after 2–4 hours of treatment is a red flag to escalate.',
  },
  {
    id: 'troponin',
    category: 'labs',
    title: 'Troponin (High-Sensitivity)',
    normalRange: 'Lab-specific — check your facility reference range',
    nursesCare:
      'Troponin is the primary biomarker for myocardial injury. Even a small rise above the 99th percentile URL (upper reference limit) is clinically significant.',
    whenAttentionIncreases:
      'Any rise above the facility\'s URL, especially with chest pain, dyspnoea, new ECG changes, or haemodynamic instability. Serial trending (0h, 1h or 0h, 3h) is standard.',
    pearl:
      'Non-cardiac causes — PE, sepsis, renal failure, myocarditis — can also elevate troponin. Always pair the value with the clinical story.',
  },
  {
    id: 'bnp',
    category: 'labs',
    title: 'BNP / NT-proBNP',
    normalRange: 'BNP < 100 pg/mL · NT-proBNP < 300 pg/mL (age-adjusted)',
    nursesCare:
      'BNP is released by ventricular wall stress. It is the primary lab marker for acute decompensated heart failure but is also elevated in PE, renal failure, and critical illness.',
    whenAttentionIncreases:
      'BNP > 500 pg/mL strongly correlates with acute HF. Trend alongside clinical signs: orthopnoea, new crackles, S3, rising weight.',
    pearl:
      'A very low BNP (< 100) makes acute HF as the cause of dyspnoea unlikely — useful for narrowing differentials at the bedside.',
  },
  {
    id: 'sodium',
    category: 'labs',
    title: 'Serum Sodium',
    normalRange: '135 – 145 mEq/L',
    nursesCare:
      'Sodium governs extracellular osmolality and brain function. Both hypo- and hypernatraemia affect neurological status. Correction rate matters as much as the absolute value.',
    whenAttentionIncreases:
      'Na < 125 mEq/L with symptoms (confusion, seizure), or any Na correcting faster than 6–8 mEq/L in 24 hours in a chronic hyponatraemia patient.',
    pearl:
      'Correcting chronic hyponatraemia too fast risks osmotic demyelination syndrome. The target is slow and steady — roughly 6–8 mEq/L per 24 hours.',
  },
  {
    id: 'potassium',
    category: 'labs',
    title: 'Serum Potassium',
    normalRange: '3.5 – 5.0 mEq/L',
    nursesCare:
      'Potassium is critical for cardiac membrane stability. Both hypokalaemia and hyperkalaemia cause potentially fatal arrhythmias. Monitor with ECG correlation in abnormal values.',
    whenAttentionIncreases:
      'K < 3.0 mEq/L (U-waves, risk of ventricular ectopy) or K > 6.0 mEq/L (peaked T-waves, widening QRS — a cardiac emergency).',
    pearl:
      'K > 6.5 mEq/L with ECG changes needs immediate provider notification — this is a life-threatening emergency, not a routine abnormality.',
  },
  {
    id: 'creatinine',
    category: 'labs',
    title: 'Serum Creatinine / AKI',
    normalRange: 'Baseline-dependent; AKI = rise ≥ 0.3 mg/dL in 48h or ≥ 1.5× baseline',
    nursesCare:
      'Creatinine is a marker of kidney filtration. A rising creatinine reflects declining GFR. Context is everything — trend from the patient\'s baseline, not a population normal.',
    whenAttentionIncreases:
      'Any creatinine rise meeting AKI criteria, especially alongside oliguria (< 0.5 mL/kg/hr for ≥ 6h), nephrotoxic medications, or haemodynamic instability.',
    pearl:
      'Urine output is often a faster early warning than creatinine — creatinine can lag hours behind the actual injury. Watch both together.',
  },

  // ── ABGs ──────────────────────────────────────────────────────────────────────
  {
    id: 'ph',
    category: 'abgs',
    title: 'Arterial pH',
    normalRange: '7.35 – 7.45',
    nursesCare:
      'pH reflects the acid-base balance of the blood. Values outside the normal range indicate acidosis (< 7.35) or alkalosis (> 7.45), each with broad systemic implications.',
    whenAttentionIncreases:
      'pH < 7.20 (severe acidosis — cardiac depression, vasodilation risk) or pH > 7.60 (severe alkalosis — tetany, arrhythmia risk).',
    pearl:
      'pH alone does not tell you why it\'s abnormal. Always interpret alongside PaCO2 and HCO3 to determine whether the disturbance is respiratory, metabolic, or mixed.',
  },
  {
    id: 'paco2',
    category: 'abgs',
    title: 'PaCO₂',
    normalRange: '35 – 45 mmHg',
    nursesCare:
      'PaCO2 is the respiratory component of acid-base balance. Controlled by ventilation — high PaCO2 (hypoventilation) causes respiratory acidosis; low causes respiratory alkalosis.',
    whenAttentionIncreases:
      'PaCO2 > 50 with deteriorating mental status or fatigue (impending respiratory failure). Acute rise in a COPD patient on home BiPAP.',
    pearl:
      'A normal PaCO2 in a patient breathing very fast is not reassuring — it may mean they are tiring and losing their compensatory mechanism.',
  },
  {
    id: 'pao2',
    category: 'abgs',
    title: 'PaO₂',
    normalRange: '80 – 100 mmHg (room air)',
    nursesCare:
      'PaO2 measures dissolved oxygen in arterial blood. It directly reflects lung oxygenation function and is the basis for the P/F ratio used in ARDS staging.',
    whenAttentionIncreases:
      'PaO2 < 60 mmHg on room air meets the threshold for hypoxaemic respiratory failure. Below 55 mmHg, O2 saturation drops steeply.',
    pearl:
      'SpO2 can appear normal while PaO2 is marginal. Always interpret PaO2 in the context of the FiO2 being delivered — not in isolation.',
  },
  {
    id: 'hco3',
    category: 'abgs',
    title: 'Bicarbonate (HCO₃⁻)',
    normalRange: '22 – 26 mEq/L',
    nursesCare:
      'HCO3 is the metabolic (kidney-regulated) component of acid-base balance. Low HCO3 signals metabolic acidosis; high signals metabolic alkalosis.',
    whenAttentionIncreases:
      'HCO3 < 15 mEq/L (significant metabolic acidosis — calculate anion gap). HCO3 > 32 mEq/L (metabolic alkalosis — assess for over-diuresis, NG losses).',
    pearl:
      'A low HCO3 in a critically ill patient means calculate the anion gap (Na − Cl − HCO3). An elevated gap points to lactate, ketones, or toxins as the source.',
  },
  {
    id: 'base-excess',
    category: 'abgs',
    title: 'Base Excess / Base Deficit',
    normalRange: '−2 to +2 mEq/L',
    nursesCare:
      'Base excess reflects the total metabolic acid-base status. A base deficit (negative value) quantifies how much metabolic acidosis is present after removing the respiratory component.',
    whenAttentionIncreases:
      'Base deficit worse than −6 in a trauma or resuscitation patient suggests significant tissue acidosis. Serial trending drives decisions about adequacy of resuscitation.',
    pearl:
      'In haemorrhagic shock, base deficit correlates with blood loss severity. A worsening base deficit despite resuscitation means the source has not been controlled.',
  },

  // ── Ventilation ───────────────────────────────────────────────────────────────
  {
    id: 'tidal-volume',
    category: 'ventilation',
    title: 'Tidal Volume (Vt)',
    normalRange: '6 – 8 mL/kg ideal body weight (IBW)',
    nursesCare:
      'Tidal volume is the breath size delivered by the ventilator. Lung-protective ventilation targets 6 mL/kg IBW to reduce ventilator-induced lung injury (VILI) in ARDS.',
    whenAttentionIncreases:
      'Actual delivered Vt consistently higher than ordered (dynamic hyperinflation, air leak), or plateau pressure > 30 cmH2O despite target Vt.',
    pearl:
      'Always use ideal (predicted) body weight — not actual weight — for Vt calculations. A tall patient and a short patient of the same weight have very different lung volumes.',
  },
  {
    id: 'peep',
    category: 'ventilation',
    title: 'PEEP (Positive End-Expiratory Pressure)',
    normalRange: '5 cmH₂O physiologic; therapeutic range varies by clinical context',
    nursesCare:
      'PEEP prevents alveolar collapse between breaths, recruits atelectatic alveoli, and improves oxygenation. Higher PEEP is used in ARDS to support refractory hypoxaemia.',
    whenAttentionIncreases:
      'New hypotension after PEEP increase (reduced venous return), rising plateau pressures, or pneumothorax signs (sudden drop in compliance, oxygen desaturation).',
    pearl:
      'PEEP helps oxygenation but can harm haemodynamics — especially in a hypovolaemic patient. Watch for BP drop after any PEEP titration.',
  },
  {
    id: 'fio2',
    category: 'ventilation',
    title: 'FiO₂ (Fraction of Inspired Oxygen)',
    normalRange: '0.21 (room air) to 1.0 (100%)',
    nursesCare:
      'FiO2 is the concentration of oxygen delivered. The goal is the lowest FiO2 that maintains adequate oxygenation — high FiO2 over time causes oxygen toxicity.',
    whenAttentionIncreases:
      'FiO2 requirements rising despite stable or worsening SpO2/PaO2 suggests worsening lung disease. Sustained FiO2 > 0.60 for > 24h increases toxicity risk.',
    pearl:
      'FiO2 0.60 for 24+ hours carries real toxicity risk. If you need that much, the patient likely needs PEEP optimisation or a provider conversation about respiratory trajectory.',
  },
  {
    id: 'pf-ratio',
    category: 'ventilation',
    title: 'P/F Ratio (PaO₂ / FiO₂)',
    normalRange: '> 300 mmHg normal; ARDS thresholds below',
    nursesCare:
      'The P/F ratio normalises oxygenation to the amount of O2 support being given. It is the cornerstone of ARDS severity staging and ventilator management discussions.',
    whenAttentionIncreases:
      'P/F < 300 = mild ARDS. P/F < 200 = moderate. P/F < 100 = severe ARDS. A falling P/F ratio despite ventilator support is a critical deterioration signal.',
    pearl:
      'A patient on 60% FiO2 with a PaO2 of 90 has a P/F ratio of 150 — moderate ARDS. That context matters far more than the raw PaO2 alone.',
  },

  // ── Devices ────────────────────────────────────────────────────────────────────
  {
    id: 'central-line',
    category: 'devices',
    title: 'Central Venous Catheter (CVC)',
    normalRange: null,
    nursesCare:
      'CVCs provide reliable venous access for vasopressors, hypertonic solutions, TPN, and haemodynamic monitoring. Each lumen must be used and maintained intentionally.',
    whenAttentionIncreases:
      'New fever in a CVC patient, erythema or tenderness at the site, blood cultures positive for line-associated organisms, sluggish or absent blood return.',
    pearl:
      'CLABSI prevention starts at insertion and continues every shift. Maintain a sterile dressing, assess necessity daily, and document site assessment every shift.',
  },
  {
    id: 'arterial-line',
    category: 'devices',
    title: 'Arterial Line (A-Line)',
    normalRange: null,
    nursesCare:
      'Arterial lines provide continuous beat-to-beat BP monitoring and easy arterial blood sampling. Essential in haemodynamically unstable patients or those on vasoactive infusions.',
    whenAttentionIncreases:
      'Dampened waveform (air, clot, position), loss of the waveform, bleeding at the site, signs of distal ischaemia: pallor, coolness, or pain distal to the insertion site.',
    pearl:
      'A dampened waveform overestimates diastolic and underestimates systolic BP. If the waveform looks blunt or flat before acting on an abnormal reading, troubleshoot first.',
  },
  {
    id: 'foley',
    category: 'devices',
    title: 'Foley Catheter (IDC)',
    normalRange: 'Urine output goal: ≥ 0.5 mL/kg/hr',
    nursesCare:
      'Foley catheters allow precise urine output monitoring and bladder drainage. Critical in haemodynamically unstable patients and post-operative care. CAUTI risk increases with dwell time.',
    whenAttentionIncreases:
      'Urine output < 0.5 mL/kg/hr for ≥ 2 hours, frank haematuria, sudden drop to zero output (obstruction vs. true oliguria), or signs of catheter-associated UTI.',
    pearl:
      'First rule out catheter obstruction before treating oliguria — check for kinks, clots, and correct positioning. A 30-second troubleshoot can avoid unnecessary interventions.',
  },
  {
    id: 'ngt',
    category: 'devices',
    title: 'Nasogastric Tube (NGT)',
    normalRange: null,
    nursesCare:
      'NGTs are used for gastric decompression, medication delivery, and enteral feeding. Placement must be confirmed before any use — aspiration of misplaced tube feedings is a never event.',
    whenAttentionIncreases:
      'Resistance during insertion, patient distress, coughing or desaturation with insertion or feed, unexpected high residuals, new respiratory symptoms in a tube-fed patient.',
    pearl:
      'Bedside pH testing or X-ray confirmation before first use remains the safest standard. Auscultation alone is not a reliable confirmation method.',
  },
];
