// Adult educational reference examples. Reporting laboratory intervals and individualized orders take precedence.
// Topic-specific source links and review status are defined in sources.js.

export const CATEGORIES = [
  {
    "id": "hemodynamics",
    "label": "Hemodynamics"
  },
  {
    "id": "labs",
    "label": "Labs"
  },
  {
    "id": "abgs",
    "label": "ABGs"
  },
  {
    "id": "ventilation",
    "label": "Ventilation"
  },
  {
    "id": "devices",
    "label": "Devices"
  },
  {
    "id": "neuro",
    "label": "Neuro Assessment"
  }
];

export const REFERENCES = [
  {
    "id": "map",
    "category": "hemodynamics",
    "title": "Mean Arterial Pressure (MAP)",
    "normalRange": "Often about 70–100 mmHg at rest; the ordered goal is individualized",
    "nursesCare": "MAP is average arterial pressure, not a direct measurement of tissue blood flow. Vascular resistance can preserve pressure even when cardiac output and organ perfusion fall.",
    "nursesNotice": [
      "Read the pressure trend beside mentation, skin findings, and urine output.",
      "Check cuff fit or arterial waveform quality when the number does not fit the patient.",
      "A MAP of 65 mmHg is a common initial septic-shock target, not proof of adequate perfusion."
    ],
    "whenAttentionIncreases": "A new pressure drop, a value outside the patient's ordered goal, or concerning perfusion findings even with an acceptable MAP merits prompt clinical review.",
    "commonMistake": "Calling perfusion adequate because one pressure number meets a target.",
    "pearl": "Pressure helps drive flow. It does not tell you how much flow reached an organ.",
    "relatedRefs": [
      "cardiac-output",
      "svr",
      "urine-output",
      "lactate",
      "shock-index"
    ],
    "rangeSummary": "About 70–100 mmHg at rest; ordered goal varies"
  },
  {
    "id": "cvp",
    "category": "hemodynamics",
    "title": "Central Venous Pressure (CVP)",
    "normalRange": "Often about 2–8 mmHg; measurement conditions matter",
    "nursesCare": "CVP reflects pressure near the right atrium. Right-heart function, venous congestion, intrathoracic pressure, and measurement technique all influence it; it does not reliably predict fluid responsiveness.",
    "nursesNotice": [
      "Position, transducer level, respiratory phase, and PEEP affect the reading.",
      "A rising CVP with falling output can suggest worsening right-heart loading or congestion.",
      "A low CVP does not by itself establish a volume deficit."
    ],
    "whenAttentionIncreases": "An abrupt change with hypotension, new dyspnea, or other perfusion changes needs clinical review alongside measurement quality.",
    "commonMistake": "Treating CVP, even a trend, as a standalone test of fluid need.",
    "pearl": "A filling pressure describes pressure. It does not tell you whether more fluid would improve flow.",
    "relatedRefs": [
      "map",
      "cardiac-output",
      "peep",
      "urine-output"
    ],
    "rangeSummary": "Often 2–8 mmHg; measurement conditions matter"
  },
  {
    "id": "cardiac-output",
    "category": "hemodynamics",
    "title": "Cardiac Output / Cardiac Index",
    "normalRange": "CO: about 4–8 L/min · CI: about 2.5–4.0 L/min/m² at rest",
    "nursesCare": "Cardiac output is heart rate × stroke volume. Cardiac index divides output by body surface area, helping compare flow across body sizes.",
    "nursesNotice": [
      "Cool skin, altered mentation, and falling urine output can accompany low flow.",
      "Blood pressure may remain acceptable because vascular resistance rises.",
      "Interpret measured output with the method, rhythm, and clinical trend."
    ],
    "whenAttentionIncreases": "An acute fall or a low index with organ-perfusion changes merits review. A CI below 2.2 L/min/m² alone does not establish cardiogenic shock.",
    "commonMistake": "Assuming normal blood pressure guarantees adequate cardiac output.",
    "pearl": "CO describes flow per minute. CI puts that flow in the context of body size.",
    "relatedRefs": [
      "map",
      "svr",
      "cvp",
      "urine-output",
      "lactate"
    ],
    "rangeSummary": "CO 4–8 L/min · CI 2.5–4.0 L/min/m² at rest"
  },
  {
    "id": "svr",
    "category": "hemodynamics",
    "title": "Systemic Vascular Resistance (SVR)",
    "normalRange": "Often about 800–1200 dyn·s/cm⁵; calculated, method dependent",
    "nursesCare": "SVR describes systemic resistance to blood flow. Pressure depends on both flow and resistance, so the same MAP can occur with very different cardiac outputs.",
    "nursesNotice": [
      "Low resistance may accompany vasodilation; high resistance may reflect compensation for low flow.",
      "Skin temperature supports the assessment but cannot measure SVR.",
      "Interpret SVR with cardiac output, MAP, CVP, and the measurement method."
    ],
    "whenAttentionIncreases": "Changing resistance alongside hypotension or organ-perfusion changes is more meaningful than a cutoff alone.",
    "commonMistake": "Labeling every high-SVR, low-output pattern cardiogenic shock; hypovolemia and obstruction can share it.",
    "pearl": "Resistance helps explain the pressure. It does not identify the cause by itself.",
    "relatedRefs": [
      "map",
      "cardiac-output",
      "shock-index",
      "lactate",
      "capillary-refill"
    ],
    "rangeSummary": "Often 800–1200 dyn·s/cm⁵; calculated"
  },
  {
    "id": "pulse-pressure",
    "category": "hemodynamics",
    "title": "Pulse Pressure",
    "normalRange": "SBP − DBP; often around 40 mmHg at rest",
    "nursesCare": "Pulse pressure is the gap between systolic and diastolic pressure. Stroke volume, arterial stiffness, and measurement quality all affect that gap.",
    "nursesNotice": [
      "A narrowing trend can accompany falling stroke volume.",
      "A wide pulse pressure can reflect arterial stiffness or other physiology, not simply high output.",
      "Arterial-line damping can distort systolic, diastolic, and pulse pressure."
    ],
    "whenAttentionIncreases": "An abrupt change with tachycardia, bleeding concern, altered mentation, or other perfusion findings merits review.",
    "commonMistake": "Assuming pulse pressure alone proves a change in stroke volume.",
    "pearl": "A changing gap is a clue to connect with the patient and the waveform.",
    "relatedRefs": [
      "map",
      "shock-index",
      "cardiac-output",
      "svr",
      "arterial-line"
    ]
  },
  {
    "id": "shock-index",
    "category": "hemodynamics",
    "title": "Shock Index",
    "normalRange": "HR ÷ SBP; often about 0.5–0.7 in healthy adults",
    "nursesCare": "Shock index combines heart rate and systolic pressure in one ratio. It can highlight a concerning relationship, but it neither diagnoses nor excludes shock.",
    "nursesNotice": [
      "HR 110 and SBP 100 give an index of 1.1.",
      "Beta blockers, pacing, arrhythmias, age, and pregnancy affect interpretation.",
      "A rising ratio adds context to skin, mentation, urine output, and other trends."
    ],
    "whenAttentionIncreases": "An index near or above 1 with new symptoms or poor-perfusion findings is concerning; a lower value does not guarantee stability.",
    "commonMistake": "Using a ratio as a diagnosis or reassurance while ignoring medications and the patient assessment.",
    "pearl": "Combine the vital signs, then reconnect the ratio to the bedside picture.",
    "relatedRefs": [
      "map",
      "pulse-pressure",
      "lactate",
      "urine-output",
      "capillary-refill"
    ],
    "rangeSummary": "HR ÷ SBP; often 0.5–0.7 in healthy adults"
  },
  {
    "id": "spo2",
    "category": "hemodynamics",
    "title": "SpO₂ (Pulse Oximetry)",
    "normalRange": "Often 95–100% in healthy adults at sea level; ordered targets vary",
    "nursesCare": "SpO₂ estimates the percentage of hemoglobin carrying oxygen. It does not measure hemoglobin quantity, blood flow, or CO₂ removal, so normal saturation can coexist with anemia, poor perfusion, or hypercapnia.",
    "nursesNotice": [
      "Assess the patient and signal quality together when a reading changes.",
      "Motion, low perfusion, probe factors, and skin pigmentation can affect accuracy; darker skin may be associated with overestimation.",
      "Standard pulse oximetry can be misleading with abnormal hemoglobins, including carbon monoxide exposure."
    ],
    "whenAttentionIncreases": "An acute fall, a reading outside the ordered range, or respiratory distress despite a reassuring number merits prompt clinical review.",
    "commonMistake": "Equating a normal saturation with adequate oxygen delivery or ventilation.",
    "pearl": "Saturation tells you how full the available oxygen carriers are, not how many carriers there are.",
    "relatedRefs": [
      "pao2",
      "fio2",
      "pf-ratio",
      "etco2",
      "oxygenation-vs-ventilation"
    ],
    "rangeSummary": "Often 95–100% in healthy adults; ordered goal varies"
  },
  {
    "id": "etco2",
    "category": "hemodynamics",
    "title": "EtCO₂ (End-Tidal CO₂)",
    "normalRange": "Often about 35–45 mmHg; not interchangeable with PaCO₂",
    "nursesCare": "EtCO₂ measures CO₂ at the end of exhalation. It reflects ventilation, CO₂ production, pulmonary blood flow, and sampling, so a change may come from the patient or the equipment.",
    "nursesNotice": [
      "Read the capnogram shape and trend with respiratory effort and airway assessment.",
      "Low pulmonary blood flow or increased dead space can widen the PaCO₂-to-EtCO₂ gap.",
      "A rise can accompany reduced ventilation, but does not identify the cause alone."
    ],
    "whenAttentionIncreases": "A lost waveform, an abrupt change, or a trend that conflicts with the patient needs prompt assessment and team review.",
    "commonMistake": "Assuming the displayed end-tidal number equals arterial CO₂ or proves airway position on its own.",
    "pearl": "Exhaled CO₂ needs air movement and blood flow to reach the sensor.",
    "relatedRefs": [
      "paco2",
      "minute-ventilation",
      "respiratory-rate",
      "oxygenation-vs-ventilation",
      "cardiac-output"
    ],
    "rangeSummary": "Often 35–45 mmHg; not interchangeable with PaCO₂"
  },
  {
    "id": "cpp",
    "category": "hemodynamics",
    "title": "Cerebral Perfusion Pressure (CPP)",
    "normalRange": "CPP ≈ MAP − ICP; severe-TBI targets are context specific",
    "nursesCare": "CPP estimates the pressure gradient supporting brain perfusion. The Brain Trauma Foundation's 60–70 mmHg target applies to severe traumatic brain injury; it is not a universal normal range or an independent bedside order.",
    "nursesNotice": [
      "A MAP fall or ICP rise can lower calculated CPP.",
      "Leveling and measurement conditions affect the pressure values.",
      "Follow the neurologic exam and ordered goals; consciousness alone cannot establish CPP."
    ],
    "whenAttentionIncreases": "A value outside the individualized goal or a new neurologic change merits prompt review, even if one pressure appears unchanged.",
    "commonMistake": "Watching MAP while overlooking ICP, or assuming the same CPP goal applies to every neurologic condition.",
    "pearl": "Two pressure measurements contribute to CPP. Neither replaces the neurologic assessment.",
    "relatedRefs": [
      "map",
      "spo2",
      "paco2",
      "urine-output"
    ],
    "rangeSummary": "CPP ≈ MAP − ICP; individualized goal"
  },
  {
    "id": "urine-output",
    "category": "hemodynamics",
    "title": "Urine Output",
    "normalRange": "0.5 mL/kg/hr is a common adult monitoring benchmark, not proof of normal kidney function",
    "nursesCare": "Urine output reflects kidney function, perfusion, hormonal responses, and urinary drainage. Falling output can precede a creatinine rise, but AKI can also occur with preserved output.",
    "nursesNotice": [
      "For a synthetic 70 kg adult, 0.5 mL/kg/hr equals 35 mL/hr.",
      "Assess the patient and drainage system together; obstruction and kidney dysfunction are both possible.",
      "Document the time interval, body weight context, output, and fluid balance."
    ],
    "whenAttentionIncreases": "A sudden stop or a new declining trend deserves review without waiting for diagnostic criteria. KDIGO includes output below 0.5 mL/kg/hr for at least 6 hours as one AKI criterion.",
    "commonMistake": "Waiting six hours to assess a change, or treating one low hour as a diagnosis of AKI.",
    "pearl": "Low output asks why: reduced production, impaired drainage, or both.",
    "relatedRefs": [
      "map",
      "creatinine",
      "foley",
      "lactate",
      "bun"
    ],
    "rangeSummary": "0.5 mL/kg/hr: common adult monitoring benchmark"
  },
  {
    "id": "capillary-refill",
    "category": "hemodynamics",
    "title": "Capillary Refill Time (CRT)",
    "normalRange": "Common bedside reference: under 2 seconds; technique and context matter",
    "nursesCare": "Capillary refill is an observation of peripheral perfusion. Temperature, vascular tone, pressure duration, site, and lighting can change the result.",
    "nursesNotice": [
      "Use a consistent method and document the assessment site.",
      "Pair refill with skin temperature, color, mentation, and other perfusion findings.",
      "Cold exposure or vasoconstriction can prolong refill; those findings still need context."
    ],
    "whenAttentionIncreases": "New or worsening prolongation, especially with mottling, cool skin, hypotension, or altered mentation, merits clinical review.",
    "commonMistake": "Using brisk refill to exclude shock, or dismissing prolonged refill because the patient is cold.",
    "pearl": "A simple observation becomes more useful when measured consistently and read with other clues.",
    "relatedRefs": [
      "map",
      "shock-index",
      "urine-output",
      "lactate",
      "cardiac-output"
    ],
    "rangeSummary": "Common reference: <2 sec; method and context matter"
  },
  {
    "id": "lactate",
    "category": "labs",
    "title": "Serum Lactate",
    "normalRange": "Often about 0.5–2.0 mmol/L; use the reporting laboratory's interval",
    "nursesCare": "Lactate rises when production exceeds clearance. Poor oxygen delivery is one cause; adrenergic stress, seizures, medications, and impaired clearance can also raise it.",
    "nursesNotice": [
      "Connect serial values with perfusion findings and the clinical timeline.",
      "Note collection conditions and the ordered repeat-testing plan.",
      "An improving value does not by itself prove that organ perfusion has recovered."
    ],
    "whenAttentionIncreases": "An unexplained elevation or rising trend with clinical change needs review. Lactate alone, including a value of 4 mmol/L or more, does not establish septic shock.",
    "commonMistake": "Treating every elevated lactate as proof of tissue hypoxia or sepsis.",
    "pearl": "Ask two questions: what is producing lactate, and what is clearing it?",
    "relatedRefs": [
      "map",
      "shock-index",
      "urine-output",
      "base-excess",
      "mixed-acidosis"
    ],
    "rangeSummary": "Often 0.5–2.0 mmol/L; laboratory-specific"
  },
  {
    "id": "troponin",
    "category": "labs",
    "title": "Troponin (High-Sensitivity)",
    "normalRange": "Assay-specific 99th-percentile upper reference limit; units vary",
    "nursesCare": "Troponin above the assay's upper limit indicates myocardial injury. A rise or fall suggests an acute process, but myocardial infarction also requires evidence of ischemia in the clinical context.",
    "nursesNotice": [
      "Compare serial results using the same assay and the actual collection times.",
      "Symptoms, ECG findings, and the clinical situation help explain an elevation.",
      "Kidney disease and other cardiac or systemic illness may accompany elevated values."
    ],
    "whenAttentionIncreases": "New ischemic symptoms, ECG changes, instability, or a significant assay-specific change deserve prompt clinical review.",
    "commonMistake": "Calling every positive troponin a heart attack, or using one universal delta or sampling schedule.",
    "pearl": "Troponin identifies injury. The clinical picture helps explain its cause.",
    "relatedRefs": [
      "bnp",
      "lactate",
      "shock-index",
      "ph"
    ]
  },
  {
    "id": "bnp",
    "category": "labs",
    "title": "BNP / NT-proBNP",
    "normalRange": "BNP and NT-proBNP use different assays and context-specific thresholds",
    "nursesCare": "These peptides reflect myocardial wall stress. They support heart-failure assessment but cannot establish the diagnosis or fluid status by themselves.",
    "nursesNotice": [
      "Age, kidney dysfunction, and atrial fibrillation may raise concentrations.",
      "Obesity can lower concentrations despite clinically important heart failure.",
      "Acute rule-out thresholds are not universal normal ranges or interchangeable BNP/NT-proBNP values."
    ],
    "whenAttentionIncreases": "New dyspnea, congestion findings, worsening perfusion, or a change from the patient's comparable baseline merits review.",
    "commonMistake": "Using one high value to prove acute heart failure or one low value to dismiss the assessment.",
    "pearl": "A wall-stress signal helps explain the picture; it does not replace it.",
    "relatedRefs": [
      "troponin",
      "sodium",
      "albumin",
      "creatinine"
    ],
    "rangeSummary": "BNP / NT-proBNP: assay and context matter"
  },
  {
    "id": "sodium",
    "category": "labs",
    "title": "Serum Sodium",
    "normalRange": "Common adult interval: 135–145 mEq/L",
    "nursesCare": "Sodium concentration reflects water relative to solute, not total body sodium alone. Changes in tonicity move water across brain-cell membranes, so symptoms and the speed of change matter.",
    "nursesNotice": [
      "Connect the trend with neurologic findings, fluid balance, and glucose.",
      "An acute fall can cause cerebral swelling.",
      "An overly rapid rise in chronic hyponatremia can cause osmotic demyelination; the monitoring plan is individualized."
    ],
    "whenAttentionIncreases": "New confusion, seizure, reduced consciousness, or an unexpected rate of change merits prompt clinical review.",
    "commonMistake": "Applying one correction limit or interpreting a sodium result without its timeline and glucose context.",
    "pearl": "The brain adapts over time. That is why both the level and its pace of change matter.",
    "relatedRefs": [
      "glucose",
      "bun",
      "creatinine",
      "albumin",
      "hco3"
    ]
  },
  {
    "id": "potassium",
    "category": "labs",
    "title": "Serum Potassium",
    "normalRange": "Common adult interval: 3.5–5.0 mEq/L",
    "nursesCare": "Potassium influences cardiac and neuromuscular electrical activity. Kidney function, shifts between cells and plasma, medications, and losses all affect the measured level.",
    "nursesNotice": [
      "Connect abnormal values with rhythm, weakness, kidney function, and acid-base findings.",
      "A normal ECG does not exclude dangerous hyperkalemia.",
      "Hemolysis can falsely elevate a result; specimen review and patient assessment belong together."
    ],
    "whenAttentionIncreases": "Critical results, rapid changes, new weakness, or rhythm changes merit prompt review under local policy, even without classic ECG findings.",
    "commonMistake": "Waiting for peaked T waves before taking a high potassium seriously.",
    "pearl": "The ECG shows an electrical response, not a reliable potassium meter.",
    "relatedRefs": [
      "ph",
      "sodium",
      "glucose",
      "creatinine"
    ]
  },
  {
    "id": "creatinine",
    "category": "labs",
    "title": "Serum Creatinine / AKI",
    "normalRange": "Often about 0.6–1.3 mg/dL; muscle mass and laboratory method matter",
    "nursesCare": "Creatinine is a filtration marker influenced by muscle mass and dilution. It can lag behind acute injury, and a value inside the population interval may still represent a major rise from baseline.",
    "nursesNotice": [
      "KDIGO includes a rise of at least 0.3 mg/dL in 48 hours or at least 1.5 times baseline within 7 days.",
      "AKI can occur with normal urine volume; follow both output and creatinine.",
      "Estimated GFR is less reliable while creatinine is changing rapidly."
    ],
    "whenAttentionIncreases": "A new rise, declining output, fluid accumulation, or associated electrolyte changes merits clinical review.",
    "commonMistake": "Calling kidney function stable because creatinine has not crossed the laboratory's upper limit.",
    "pearl": "A synthetic change from 0.6 to 1.0 mg/dL matters even if 1.0 appears in range.",
    "relatedRefs": [
      "urine-output",
      "bun",
      "potassium",
      "albumin",
      "lactate"
    ],
    "rangeSummary": "Often 0.6–1.3 mg/dL; baseline and muscle mass matter"
  },
  {
    "id": "hemoglobin",
    "category": "labs",
    "title": "Hemoglobin (Hgb)",
    "normalRange": "Example adult intervals: female 12–16 g/dL · male 14–18 g/dL; laboratory ranges vary",
    "nursesCare": "Hemoglobin determines much of blood's oxygen-carrying capacity. Saturation can look normal when there are too few oxygen carriers.",
    "nursesNotice": [
      "Read the trend with bleeding signs, perfusion, symptoms, and fluid balance.",
      "Early acute blood loss may not immediately lower the measured concentration.",
      "Dilution and concentration changes can alter hemoglobin without a matching change in red-cell mass."
    ],
    "whenAttentionIncreases": "Bleeding concern, new dyspnea, chest symptoms, instability, or an unexplained decline merits review regardless of one cutoff.",
    "commonMistake": "Using one hemoglobin number as proof of bleeding severity or as a universal transfusion trigger.",
    "pearl": "SpO₂ describes carrier saturation. Hemoglobin describes how many carriers are available.",
    "relatedRefs": [
      "shock-index",
      "lactate",
      "map",
      "inr",
      "platelets"
    ],
    "rangeSummary": "Adult interval varies by laboratory and sex"
  },
  {
    "id": "platelets",
    "category": "labs",
    "title": "Platelet Count",
    "normalRange": "Common adult interval: 150,000–400,000/µL; some laboratories use 450,000 as the upper limit",
    "nursesCare": "Platelets help form the initial clot, but count and function are different. Bleeding risk also depends on medications, coagulation factors, illness, and the clinical situation.",
    "nursesNotice": [
      "Follow the percentage fall as well as the absolute count.",
      "A fall over 50% after heparin exposure can raise concern for HIT even with a count still in range; timing and other causes matter.",
      "HIT can cause thrombosis, not just a low platelet count."
    ],
    "whenAttentionIncreases": "New bleeding, thrombosis signs, a rapid decline, or a critical result merits prompt review.",
    "commonMistake": "Assuming a normal count guarantees normal platelet function or excludes HIT.",
    "pearl": "Count the platelets, then ask how the count changed and how those platelets may function.",
    "relatedRefs": [
      "inr",
      "aptt",
      "hemoglobin",
      "anti-xa"
    ],
    "rangeSummary": "Common adult interval: 150,000–400,000/µL"
  },
  {
    "id": "wbc",
    "category": "labs",
    "title": "WBC (White Blood Cell Count)",
    "normalRange": "Common adult interval: 4,000–11,000/µL; use the laboratory's interval",
    "nursesCare": "WBC reflects circulating white cells, not a direct infection test. Infection, inflammation, physiologic stress, and medications can all change the count.",
    "nursesNotice": [
      "Read the differential and absolute neutrophil count, especially when infection risk is a concern.",
      "A normal WBC does not exclude serious infection; a high WBC does not prove sepsis.",
      "Steroids and stress can raise the count, while marrow suppression can blunt it."
    ],
    "whenAttentionIncreases": "New illness with organ-function changes, fever with neutropenia, or an unexpected count change merits prompt review.",
    "commonMistake": "Using total WBC alone to grade immune protection or diagnose infection.",
    "pearl": "The differential helps explain which cells changed. The bedside assessment explains why that matters.",
    "relatedRefs": [
      "lactate",
      "glucose",
      "albumin"
    ],
    "rangeSummary": "Common adult interval: 4,000–11,000/µL"
  },
  {
    "id": "inr",
    "category": "labs",
    "title": "INR",
    "normalRange": "Often 0.8–1.2 without warfarin; therapeutic goals depend on the indication",
    "nursesCare": "INR standardizes prothrombin time for warfarin monitoring. It is not a universal measure of all anticoagulants or a complete prediction of bleeding risk.",
    "nursesNotice": [
      "Compare with the documented indication and ordered goal.",
      "Liver dysfunction, vitamin K status, and interacting drugs can alter the result.",
      "DOACs and direct thrombin inhibitors may affect results without INR reliably measuring their activity."
    ],
    "whenAttentionIncreases": "Bleeding symptoms, an unexpected change, or a result outside the individualized goal merits review under local policy.",
    "commonMistake": "Calling one INR target correct for every indication, or assuming INR captures all anticoagulant effects.",
    "pearl": "Know the drug and indication before interpreting the number.",
    "relatedRefs": [
      "aptt",
      "anti-xa",
      "platelets",
      "hemoglobin",
      "albumin"
    ],
    "rangeSummary": "Often 0.8–1.2 without warfarin; ordered goal varies"
  },
  {
    "id": "aptt",
    "category": "labs",
    "title": "aPTT",
    "normalRange": "Often about 25–35 seconds without anticoagulation; assay-specific",
    "nursesCare": "aPTT measures part of the clotting pathway. With unfractionated heparin, interpretation uses the institution's assay and protocol; inflammation, factor deficiencies, and inhibitors can also change it.",
    "nursesNotice": [
      "There is no universal therapeutic aPTT range in seconds.",
      "Some UFH protocols use anti-Xa instead; the tests answer related but different questions.",
      "aPTT does not reliably quantify LMWH or most DOAC activity."
    ],
    "whenAttentionIncreases": "New bleeding, thrombosis signs, an unexplained change, or a result outside the applicable protocol range merits review.",
    "commonMistake": "Applying a generic 60–100 second range to every laboratory and patient.",
    "pearl": "The reagent and clinical context help determine what those seconds mean.",
    "relatedRefs": [
      "inr",
      "anti-xa",
      "platelets",
      "hemoglobin"
    ],
    "rangeSummary": "Often 25–35 sec without anticoagulation; assay-specific"
  },
  {
    "id": "anti-xa",
    "category": "labs",
    "title": "Anti-Xa Level",
    "normalRange": "Depends on the drug, assay, indication, and collection time; no universal range",
    "nursesCare": "Anti-Xa assays estimate factor Xa inhibition. UFH, LMWH, and direct Xa-inhibitor tests require appropriate calibration and interpretation; their reported values are not interchangeable.",
    "nursesNotice": [
      "Verify which drug the assay is calibrated for and when the sample was collected.",
      "Recent exposure to another Xa-active anticoagulant can interfere with interpretation.",
      "Routine LMWH monitoring is not required for every patient; use the ordered plan and laboratory guidance."
    ],
    "whenAttentionIncreases": "Bleeding, thrombosis signs, an unexpected result, or a mismatch between the drug, test, and sampling time merits review.",
    "commonMistake": "Applying an LMWH peak range to a UFH result or a drug-specific DOAC level.",
    "pearl": "Before asking whether the level is in range, ask: which drug, which assay, and when was it drawn?",
    "relatedRefs": [
      "aptt",
      "inr",
      "creatinine",
      "platelets"
    ],
    "rangeSummary": "Drug, assay, indication, and sample time matter"
  },
  {
    "id": "bun",
    "category": "labs",
    "title": "BUN (Blood Urea Nitrogen)",
    "normalRange": "Common adult interval: about 8–20 mg/dL",
    "nursesCare": "BUN reflects urea production and kidney clearance. Protein breakdown, GI bleeding, intake, perfusion, and kidney function can all influence it.",
    "nursesNotice": [
      "Read BUN with creatinine, output, fluid balance, and the clinical timeline.",
      "A disproportionately high BUN can occur with GI bleeding or increased protein breakdown.",
      "The BUN-to-creatinine ratio alone cannot distinguish all causes of AKI."
    ],
    "whenAttentionIncreases": "A new rise with output changes, bleeding concern, fluid accumulation, or altered mentation merits clinical review.",
    "commonMistake": "Calling every high BUN dehydration, or using a ratio above 20 to exclude intrinsic kidney injury.",
    "pearl": "BUN has a production side and a clearance side. Either can change the result.",
    "relatedRefs": [
      "creatinine",
      "hemoglobin",
      "albumin",
      "sodium"
    ]
  },
  {
    "id": "glucose",
    "category": "labs",
    "title": "Blood Glucose",
    "normalRange": "Typical fasting plasma interval: about 70–99 mg/dL; inpatient goals are separate",
    "nursesCare": "Glucose fuels the brain and other tissues. Low glucose can cause neurologic symptoms; marked hyperglycemia may accompany dehydration or metabolic illness. An inpatient treatment goal is not a normal fasting interval.",
    "nursesNotice": [
      "Connect values with symptoms, meal or nutrition timing, and the ordered monitoring plan.",
      "Poor peripheral perfusion and device limitations can affect bedside readings.",
      "Hyperglycemia with ketones or acid-base changes needs context; some ketoacidosis occurs without marked glucose elevation."
    ],
    "whenAttentionIncreases": "A value below 70 mg/dL, altered consciousness, a critical result, or hyperglycemia with illness signs merits prompt review under local protocol.",
    "commonMistake": "Judging urgency from the glucose number alone while missing symptoms or metabolic findings.",
    "pearl": "Read the number with the patient, the sample method, and the timing.",
    "relatedRefs": [
      "sodium",
      "phosphorus",
      "albumin",
      "creatinine"
    ],
    "rangeSummary": "Typical fasting plasma interval: 70–99 mg/dL"
  },
  {
    "id": "phosphorus",
    "category": "labs",
    "title": "Serum Phosphorus",
    "normalRange": "Common adult interval: 2.5–4.5 mg/dL",
    "nursesCare": "Phosphate supports ATP production and muscle function. Severe depletion can weaken respiratory muscles and affect cardiac or neurologic function.",
    "nursesNotice": [
      "Low levels can follow nutritional reintroduction in patients at risk for refeeding syndrome.",
      "Read phosphorus with potassium, magnesium, nutrition history, and symptoms.",
      "Kidney dysfunction may cause high rather than low levels."
    ],
    "whenAttentionIncreases": "A marked or rapidly falling value, new weakness, respiratory difficulty, or neurologic change merits review.",
    "commonMistake": "Treating phosphorus as a nutrition-only number and missing its role in muscle energy.",
    "pearl": "A muscle needs energy to work. Phosphate is part of the ATP machinery.",
    "relatedRefs": [
      "albumin",
      "glucose",
      "tidal-volume",
      "minute-ventilation"
    ]
  },
  {
    "id": "albumin",
    "category": "labs",
    "title": "Serum Albumin",
    "normalRange": "Common adult interval: about 3.5–5.0 g/dL",
    "nursesCare": "Albumin contributes to oncotic pressure and transports substances in blood. In illness, inflammation, capillary leak, dilution, impaired synthesis, and protein loss can lower it.",
    "nursesNotice": [
      "Low albumin is not a standalone diagnosis of malnutrition.",
      "Edema has multiple causes; albumin is only one part of that assessment.",
      "Interpret the value with inflammation, liver and kidney findings, fluid balance, and a nutrition assessment."
    ],
    "whenAttentionIncreases": "An unexpected change with edema, protein loss, or other organ-function changes merits review in context.",
    "commonMistake": "Using albumin as a direct measure of protein intake, muscle mass, or a reason for automatic replacement.",
    "pearl": "Albumin often reflects illness and protein distribution more than what the patient ate.",
    "relatedRefs": [
      "anion-gap",
      "bun",
      "creatinine",
      "glucose",
      "sodium"
    ]
  },
  {
    "id": "ph",
    "category": "abgs",
    "title": "Arterial pH",
    "normalRange": "Arterial pH: 7.35–7.45",
    "nursesCare": "pH describes the blood's net acid-base state. Below 7.35 is acidemia; above 7.45 is alkalemia. Acidosis and alkalosis name the processes that push pH, and more than one process can coexist.",
    "nursesNotice": [
      "Read pH with PaCO₂ and HCO₃⁻ from the same gas.",
      "A pH in range can hide opposing primary processes or compensation.",
      "Symptoms and the direction of change matter alongside the number."
    ],
    "whenAttentionIncreases": "A substantial or rapid pH change with respiratory, neurologic, rhythm, or perfusion changes merits prompt clinical review.",
    "commonMistake": "Calling a normal pH a normal ABG, or using pH alone to name the cause.",
    "pearl": "pH shows the net result. CO₂ and bicarbonate help explain how it happened.",
    "relatedRefs": [
      "paco2",
      "hco3",
      "base-excess",
      "lactate",
      "anion-gap"
    ]
  },
  {
    "id": "paco2",
    "category": "abgs",
    "title": "PaCO₂",
    "normalRange": "Typical arterial interval: 35–45 mmHg",
    "nursesCare": "PaCO₂ reflects alveolar ventilation relative to CO₂ production. Less effective ventilation raises CO₂; more effective ventilation lowers it, when production is otherwise similar.",
    "nursesNotice": [
      "Read the value with pH, breathing depth, effort, and consciousness.",
      "A fast respiratory rate does not guarantee adequate alveolar ventilation.",
      "Known chronic hypercapnia changes the baseline; a value in the population interval can still represent a meaningful change."
    ],
    "whenAttentionIncreases": "A new CO₂ change with worsening pH, reduced alertness, increasing effort, or declining respiratory effort merits prompt review.",
    "commonMistake": "Judging ventilation from respiratory rate or saturation alone.",
    "pearl": "Count breaths, but also ask how much fresh air reaches functioning alveoli.",
    "relatedRefs": [
      "ph",
      "hco3",
      "respiratory-rate",
      "minute-ventilation",
      "etco2"
    ]
  },
  {
    "id": "pao2",
    "category": "abgs",
    "title": "PaO₂",
    "normalRange": "Often about 80–100 mmHg on room air in younger adults at sea level; age and altitude matter",
    "nursesCare": "PaO₂ measures oxygen pressure dissolved in arterial blood. Interpret it with inspired oxygen and clinical context; it does not measure total oxygen content or tissue delivery.",
    "nursesNotice": [
      "Record the oxygen device and FiO₂ context at collection.",
      "A PaO₂ that seems acceptable on room air may be concerning with much more oxygen support.",
      "Sample identity, air contamination, and processing delay can distort results."
    ],
    "whenAttentionIncreases": "An unexpected decline, respiratory distress, or poor oxygenation despite support merits prompt clinical review.",
    "commonMistake": "Comparing two PaO₂ values without checking whether inspired oxygen changed.",
    "pearl": "Ask how much oxygen support was present when that PaO₂ was measured.",
    "relatedRefs": [
      "spo2",
      "fio2",
      "pf-ratio",
      "peep",
      "ph"
    ],
    "rangeSummary": "Often 80–100 mmHg on room air; age / altitude matter"
  },
  {
    "id": "hco3",
    "category": "abgs",
    "title": "Bicarbonate (HCO₃⁻)",
    "normalRange": "Common adult interval: 22–26 mEq/L; method and sample matter",
    "nursesCare": "Bicarbonate is a major buffer. A low or high value can reflect a primary metabolic process or compensation for a respiratory process, so it needs pH and PaCO₂ context.",
    "nursesNotice": [
      "Low bicarbonate can accompany acid accumulation or bicarbonate loss.",
      "High bicarbonate can accompany metabolic alkalosis or compensation for chronic CO₂ retention.",
      "ABG bicarbonate is calculated; chemistry total CO₂ is measured and is not exactly the same test."
    ],
    "whenAttentionIncreases": "A new or rapid change with abnormal pH, altered breathing, perfusion changes, or neurologic findings merits review.",
    "commonMistake": "Labeling every low bicarbonate primary metabolic acidosis without the rest of the gas.",
    "pearl": "Bicarbonate may be the primary change or part of the body's response. Read all three values.",
    "relatedRefs": [
      "ph",
      "paco2",
      "anion-gap",
      "base-excess",
      "sodium"
    ],
    "rangeSummary": "Common adult interval: 22–26 mEq/L"
  },
  {
    "id": "base-excess",
    "category": "abgs",
    "title": "Base Excess / Base Deficit",
    "normalRange": "Common reference interval: about −2 to +2 mEq/L",
    "nursesCare": "Base excess is a calculated estimate of the metabolic contribution to an acid-base disturbance under standardized conditions. It does not identify the cause or measure perfusion directly.",
    "nursesNotice": [
      "A negative base excess suggests a base deficit; a positive value suggests excess base.",
      "A reported base deficit may use a positive magnitude, so check the report's sign convention.",
      "Renal compensation for chronic respiratory disease can also affect the value."
    ],
    "whenAttentionIncreases": "A worsening trend with abnormal pH or clinical deterioration merits review alongside lactate, electrolytes, and the full gas.",
    "commonMistake": "Calling every negative base excess lactic acidosis or proof of shock.",
    "pearl": "The sign describes direction. The patient and other tests explain the cause.",
    "relatedRefs": [
      "ph",
      "lactate",
      "hco3",
      "map",
      "mixed-acidosis"
    ],
    "rangeSummary": "Common reference: about −2 to +2 mEq/L"
  },
  {
    "id": "anion-gap",
    "category": "abgs",
    "title": "Anion Gap",
    "normalRange": "Na⁺ − (Cl⁻ + HCO₃⁻); often about 8–12 mEq/L when potassium is excluded",
    "nursesCare": "The anion gap estimates unmeasured anions using electrolytes from the same chemistry sample. The laboratory method and albumin level affect the expected result.",
    "nursesNotice": [
      "A high gap can accompany lactate, ketones, retained acids, or certain toxins.",
      "Low albumin lowers the expected gap and can mask an increase.",
      "A normal gap does not exclude clinically important metabolic acidosis or mixed disorders."
    ],
    "whenAttentionIncreases": "A new gap increase or falling bicarbonate with illness signs merits review, even if pH is near normal.",
    "commonMistake": "Using one universal cutoff or assuming every elevated gap is lactate.",
    "pearl": "The gap tells you something unmeasured may have changed. It does not identify that substance.",
    "relatedRefs": [
      "hco3",
      "lactate",
      "ph",
      "bun",
      "albumin"
    ],
    "rangeSummary": "Na⁺ − (Cl⁻ + HCO₃⁻); laboratory-specific interval"
  },
  {
    "id": "acid-base-compensation",
    "category": "abgs",
    "title": "Acid-Base Compensation",
    "normalRange": "Direction, timing, and clinical context; no single normal range",
    "nursesCare": "Compensation reduces a primary acid-base disturbance's effect on pH. Respiratory responses to metabolic changes are faster than the full renal response to respiratory changes.",
    "nursesNotice": [
      "In metabolic acidosis, a compensatory respiratory response lowers PaCO₂.",
      "In respiratory acidosis, renal compensation raises bicarbonate over time.",
      "The expected direction alone cannot prove adequate compensation or exclude a mixed disorder."
    ],
    "whenAttentionIncreases": "A response in the wrong direction, an unexpected change from baseline, or worsening pH and symptoms merits review for a mixed process or changing physiology.",
    "commonMistake": "Calling a gas fully explained because pH is in range or both other values moved in the expected direction.",
    "pearl": "Ask what started the change, what response is expected, and how long that response has had to develop.",
    "relatedRefs": [
      "ph",
      "paco2",
      "hco3",
      "mixed-acidosis",
      "mixed-alkalosis"
    ],
    "rangeSummary": "Expected direction and timing need context"
  },
  {
    "id": "mixed-acidosis",
    "category": "abgs",
    "title": "Mixed Acidosis",
    "normalRange": "Respiratory and metabolic processes both lower pH",
    "nursesCare": "When CO₂ retention and a metabolic acidifying process coexist, both push pH downward. This is a mixed primary disorder, rather than one process compensating for the other.",
    "nursesNotice": [
      "High PaCO₂ with low HCO₃⁻ and acidemia is a clear example.",
      "Causes and severity vary; the values do not identify a single disease.",
      "Some mixed disorders are less obvious and require comparison with the expected response and baseline."
    ],
    "whenAttentionIncreases": "Worsening acidemia with respiratory, perfusion, neurologic, or rhythm changes merits prompt clinical review.",
    "commonMistake": "Calling two acidifying changes compensation, or assuming every mixed acidosis has the same cause.",
    "pearl": "Compensation opposes the pH change. Two acidifying processes reinforce it.",
    "relatedRefs": [
      "ph",
      "paco2",
      "hco3",
      "lactate",
      "base-excess"
    ]
  },
  {
    "id": "mixed-alkalosis",
    "category": "abgs",
    "title": "Mixed Alkalosis",
    "normalRange": "Respiratory and metabolic processes both raise pH",
    "nursesCare": "A respiratory alkalinizing process lowers PaCO₂ while a metabolic alkalinizing process raises HCO₃⁻. Together they can produce more alkalemia than either process alone.",
    "nursesNotice": [
      "Low PaCO₂ with high HCO₃⁻ and alkalemia is a clear example.",
      "Vomiting or gastric drainage causes acid loss; a separate respiratory process may also be present.",
      "Pain, systemic illness, medications, and the respiratory-support context can contribute in different ways."
    ],
    "whenAttentionIncreases": "Increasing alkalemia with weakness, neurologic symptoms, or rhythm changes merits clinical review.",
    "commonMistake": "Calling the low CO₂ compensation for high bicarbonate; both changes raise pH.",
    "pearl": "Follow each change's effect on pH before deciding whether it is compensation.",
    "relatedRefs": [
      "ph",
      "paco2",
      "hco3",
      "sodium",
      "potassium"
    ]
  },
  {
    "id": "oxygenation-vs-ventilation",
    "category": "abgs",
    "title": "Oxygenation vs. Ventilation",
    "normalRange": "Oxygenation: SpO₂ / PaO₂ · Ventilation: CO₂ removal",
    "nursesCare": "Oxygenation describes oxygen transfer into blood; ventilation describes air exchange and CO₂ removal. They interact, but one can worsen while the other appears acceptable.",
    "nursesNotice": [
      "Supplemental oxygen can preserve SpO₂ while hypoventilation raises PaCO₂.",
      "Breathing depth and dead space help explain why rate alone is insufficient.",
      "Hemoglobin and circulation also matter for oxygen delivery to tissue."
    ],
    "whenAttentionIncreases": "New drowsiness, altered breathing, worsening CO₂ or pH, or respiratory distress deserves review even with a reassuring saturation.",
    "commonMistake": "Calling ventilation adequate because SpO₂ is in the ordered range.",
    "pearl": "Oxygen getting in and CO₂ getting out are two questions. Ask both.",
    "relatedRefs": [
      "spo2",
      "etco2",
      "paco2",
      "pao2",
      "respiratory-rate"
    ],
    "rangeSummary": "Oxygen transfer and CO₂ removal are different questions"
  },
  {
    "id": "tidal-volume",
    "category": "ventilation",
    "title": "Tidal Volume (Vt)",
    "normalRange": "Volume per breath, reported in mL; interpret with predicted body weight and the ordered plan",
    "nursesCare": "Tidal volume describes the size of a breath. Lung size relates more closely to height-based predicted body weight than actual body weight, which is why the weight reference matters in respiratory assessment.",
    "nursesNotice": [
      "Compare delivered and exhaled values with the mode and the patient's effort.",
      "A leak can reduce measured exhaled volume.",
      "Changing resistance, compliance, or effort can change volume, especially in pressure-targeted modes."
    ],
    "whenAttentionIncreases": "An abrupt unexplained change, a mismatch between delivered and exhaled volumes, or new distress merits respiratory-team review.",
    "commonMistake": "Treating one volume as normal for all body sizes or assuming every low exhaled volume means poor effort.",
    "pearl": "Breath size needs body-size and lung-mechanics context, not a universal number.",
    "relatedRefs": [
      "plateau-pressure",
      "peep",
      "ventilator-compliance",
      "pf-ratio",
      "respiratory-rate"
    ],
    "rangeSummary": "Volume per breath; predicted body weight matters"
  },
  {
    "id": "peep",
    "category": "ventilation",
    "title": "PEEP (Positive End-Expiratory Pressure)",
    "normalRange": "End-expiratory airway pressure, reported in cm H₂O; individualized",
    "nursesCare": "PEEP is pressure remaining at the end of expiration during positive-pressure support. It can limit alveolar collapse, but its effects on recruitment, overdistension, and circulation depend on the patient.",
    "nursesNotice": [
      "Higher intrathoracic pressure can reduce venous return and change right-heart loading.",
      "Oxygenation may improve while blood pressure falls, but other causes of hypotension remain possible.",
      "Interpret oxygenation and pressure changes with lung mechanics, perfusion, and the clinical timeline."
    ],
    "whenAttentionIncreases": "New hypotension, respiratory distress, or worsening oxygenation after a support change merits prompt team review.",
    "commonMistake": "Assuming PEEP always recruits lung, always lowers blood pressure, or has one physiologic normal setting.",
    "pearl": "Pressure applied to the lungs can also change how blood moves through the chest.",
    "relatedRefs": [
      "tidal-volume",
      "plateau-pressure",
      "map",
      "fio2",
      "ventilator-compliance"
    ],
    "rangeSummary": "End-expiratory airway pressure; individualized"
  },
  {
    "id": "fio2",
    "category": "ventilation",
    "title": "FiO₂ (Fraction of Inspired Oxygen)",
    "normalRange": "Room air: 0.21 = 21%; record the device and concentration context",
    "nursesCare": "FiO₂ is the inspired oxygen fraction. It supplies the context for interpreting oxygenation; the same PaO₂ means something different at different inspired concentrations.",
    "nursesNotice": [
      "Use a fraction, not a percentage, when calculating a P/F ratio.",
      "FiO₂ on low-flow devices is an estimate affected by breathing and air mixing.",
      "Exposure risk depends on concentration, duration, and illness; there is no single toxicity clock."
    ],
    "whenAttentionIncreases": "Increasing support needs, readings outside the ordered goal, or persistent respiratory distress merits clinical review.",
    "commonMistake": "Interpreting saturation without knowing the support, or treating an estimated device FiO₂ as exact.",
    "pearl": "The oxygen result needs a denominator: how much inspired oxygen was present?",
    "relatedRefs": [
      "peep",
      "pf-ratio",
      "spo2",
      "pao2",
      "plateau-pressure"
    ],
    "rangeSummary": "Room air: 0.21 = 21%; device context matters"
  },
  {
    "id": "pf-ratio",
    "category": "ventilation",
    "title": "P/F Ratio (PaO₂ ÷ FiO₂)",
    "normalRange": "PaO₂ ÷ FiO₂ fraction; ARDS oxygenation bands require the rest of the definition",
    "nursesCare": "The P/F ratio relates arterial oxygen pressure to inspired oxygen. It helps describe oxygenation impairment but cannot diagnose ARDS by itself.",
    "nursesNotice": [
      "Synthetic example: PaO₂ 80 mmHg ÷ FiO₂ 0.40 = 200 mmHg.",
      "For intubated ARDS classification: mild >200 to 300, moderate >100 to 200, severe ≤100 mmHg, when all defining criteria are met.",
      "Timing, bilateral imaging findings, edema origin, and respiratory-support criteria also matter; estimated FiO₂ limits precision."
    ],
    "whenAttentionIncreases": "A falling ratio or worsening respiratory assessment merits review in context, rather than automatic ARDS labeling.",
    "commonMistake": "Dividing by 40 instead of 0.40, or calling any low ratio ARDS.",
    "pearl": "A ratio describes an oxygenation problem. A syndrome requires more than a ratio.",
    "relatedRefs": [
      "pao2",
      "fio2",
      "peep",
      "tidal-volume",
      "oxygenation-vs-ventilation"
    ],
    "rangeSummary": "PaO₂ ÷ FiO₂ fraction; ratio alone cannot diagnose ARDS"
  },
  {
    "id": "minute-ventilation",
    "category": "ventilation",
    "title": "Minute Ventilation (Ve)",
    "normalRange": "Tidal volume × respiratory rate; often about 5–10 L/min at rest",
    "nursesCare": "Minute ventilation is total air moved per minute. Alveolar ventilation subtracts dead-space volume from each breath, so equal minute volumes can remove different amounts of CO₂.",
    "nursesNotice": [
      "Fast shallow breaths can move much of their volume through dead space.",
      "PaCO₂ also depends on CO₂ production, which changes with metabolic demand.",
      "Read rate, breath size, effort, and CO₂ together."
    ],
    "whenAttentionIncreases": "A new change with rising CO₂, worsening pH, altered alertness, or increasing effort merits review.",
    "commonMistake": "Assuming an adequate total minute volume guarantees adequate CO₂ clearance.",
    "pearl": "Air moved per minute is not the same as fresh air reaching gas-exchanging alveoli.",
    "relatedRefs": [
      "respiratory-rate",
      "tidal-volume",
      "etco2",
      "paco2",
      "dead-space"
    ],
    "rangeSummary": "Tidal volume × rate; alveolar ventilation matters"
  },
  {
    "id": "respiratory-rate",
    "category": "ventilation",
    "title": "Respiratory Rate (RR)",
    "normalRange": "Common resting adult interval: 12–20 breaths/min",
    "nursesCare": "Respiratory rate is one part of breathing assessment. Depth, effort, rhythm, and consciousness explain whether those breaths are effective and why the rate may have changed.",
    "nursesNotice": [
      "Pain, fever, acidosis, hypoxemia, and many other processes can raise the rate.",
      "Sedation or neurologic changes may reduce rate or depth.",
      "A falling rate after rapid breathing may reflect recovery or fatigue; the surrounding findings distinguish them."
    ],
    "whenAttentionIncreases": "New slowing, irregularity, increasing effort, reduced alertness, or a significant change from baseline merits prompt review.",
    "commonMistake": "Recording a rate without observing depth, effort, or the patient.",
    "pearl": "The count is the start of the respiratory assessment, not the whole assessment.",
    "relatedRefs": [
      "spo2",
      "etco2",
      "minute-ventilation",
      "paco2",
      "shock-index"
    ]
  },
  {
    "id": "ventilator-compliance",
    "category": "ventilation",
    "title": "Ventilator Compliance",
    "normalRange": "Change in volume ÷ change in pressure, reported in mL/cm H₂O; method dependent",
    "nursesCare": "Compliance describes how easily the respiratory system expands. Static compliance reflects lung and chest-wall elastic properties; dynamic measurements are also influenced by airway resistance and flow.",
    "nursesNotice": [
      "Compare measurements made under comparable volume, pressure, and effort conditions.",
      "Edema, atelectasis, pleural disease, and chest-wall factors can reduce compliance.",
      "Patient effort can make a displayed value difficult to interpret."
    ],
    "whenAttentionIncreases": "A sudden deterioration in mechanics with distress, oxygenation changes, or hypotension merits prompt team review; no single cause is established by the number.",
    "commonMistake": "Calling every pressure rise stiff lungs or diagnosing pneumothorax from compliance alone.",
    "pearl": "Ask whether the pressure reflects resistance to airflow, difficulty expanding the system, or both.",
    "relatedRefs": [
      "plateau-pressure",
      "peep",
      "tidal-volume",
      "pf-ratio",
      "dead-space"
    ],
    "rangeSummary": "Volume change ÷ pressure change; method dependent"
  },
  {
    "id": "dead-space",
    "category": "ventilation",
    "title": "Dead Space (Vd/Vt)",
    "normalRange": "Vᴅ/Vᴛ: dead-space fraction; often around 0.3 at rest, context dependent",
    "nursesCare": "Dead space is ventilation that does not participate in gas exchange. It includes conducting airways and ventilated alveoli with little or no effective perfusion.",
    "nursesNotice": [
      "More wasted ventilation can raise CO₂ despite an unchanged total minute volume.",
      "Reduced pulmonary perfusion can widen the PaCO₂-to-EtCO₂ gap.",
      "That gap is a clue, not a measured dead-space fraction; fraction calculations require the appropriate expired-CO₂ measurement."
    ],
    "whenAttentionIncreases": "A widening gap or worsening CO₂ with perfusion or respiratory changes merits review alongside sampling quality.",
    "commonMistake": "Calculating dead-space fraction from EtCO₂ alone or interpreting a widening gap as one specific diagnosis.",
    "pearl": "A breath can reach an alveolus without finding enough blood flow for useful gas exchange.",
    "relatedRefs": [
      "etco2",
      "paco2",
      "ventilator-compliance",
      "cardiac-output",
      "pf-ratio"
    ],
    "rangeSummary": "Fraction of a breath not used for gas exchange"
  },
  {
    "id": "plateau-pressure",
    "category": "ventilation",
    "title": "Plateau Pressure (Pplat)",
    "normalRange": "End-inspiratory pressure under zero-flow conditions, reported in cm H₂O",
    "nursesCare": "Plateau pressure helps assess elastic loading of the lungs and chest wall when measured under suitable passive, zero-flow conditions. Peak pressure also includes the pressure needed to overcome airflow resistance.",
    "nursesNotice": [
      "Rising peak pressure with stable plateau can suggest increased resistance when flow, volume, and conditions are comparable.",
      "A rise in both may reflect reduced compliance or other changes, including volume or end-expiratory pressure.",
      "Effort and measurement conditions can invalidate the comparison; plateau alone does not describe all lung-injury risk."
    ],
    "whenAttentionIncreases": "New pressure changes with distress, oxygenation changes, or hemodynamic change merit prompt respiratory-team review.",
    "commonMistake": "Calling a narrow peak-to-plateau gap proof of stiff lungs, without pressure trends or measurement context.",
    "pearl": "Compare pressures under comparable conditions before explaining the gap.",
    "relatedRefs": [
      "tidal-volume",
      "peep",
      "ventilator-compliance",
      "pf-ratio",
      "dead-space"
    ],
    "rangeSummary": "Pressure at zero flow; measurement conditions matter"
  },
  {
    "id": "central-line",
    "category": "devices",
    "title": "Central Venous Catheter (CVC)",
    "normalRange": null,
    "nursesCare": "A central venous catheter provides central vascular access for selected clinical needs. Access function and insertion-site findings are separate assessments; a line that works can still have a complication.",
    "nursesNotice": [
      "Observe the site, dressing integrity, tenderness, drainage, and documented external length where applicable.",
      "New fever or rigors need a broader assessment; the line is one possible source, not a proven cause.",
      "Ongoing necessity and catheter-specific care requirements belong in the daily review."
    ],
    "whenAttentionIncreases": "New swelling, pain, leakage, disrupted securement, unexplained line dysfunction, or systemic illness merits review under local policy.",
    "commonMistake": "Assuming easy infusion or blood return excludes infection, thrombosis, or migration.",
    "pearl": "Assess the access, the site, and the patient as three connected pieces.",
    "relatedRefs": [
      "arterial-line",
      "map",
      "cvp"
    ]
  },
  {
    "id": "arterial-line",
    "category": "devices",
    "title": "Arterial Line (A-Line)",
    "normalRange": null,
    "nursesCare": "An arterial line provides continuous pressure waveforms and arterial sampling in selected patients. Leveling, zero reference, and damping influence the displayed pressure, so waveform quality is part of interpreting the number.",
    "nursesNotice": [
      "Compare the waveform and pressure with the patient and other available measurements.",
      "Damping can distort systolic, diastolic, and pulse pressures.",
      "Observe insertion-site bleeding and the limb's color, warmth, sensation, and perfusion."
    ],
    "whenAttentionIncreases": "Bleeding, new distal-perfusion changes, an abrupt waveform change, or hypotension with symptoms merits prompt review; equipment assessment must not delay patient assessment.",
    "commonMistake": "Acting on a number without waveform context, or delaying concern while assuming an abnormal value is artifact.",
    "pearl": "The waveform is part of the measurement, not decoration beside it.",
    "relatedRefs": [
      "map",
      "central-line",
      "cvp",
      "pulse-pressure"
    ]
  },
  {
    "id": "foley",
    "category": "devices",
    "title": "Foley Catheter (IDC)",
    "normalRange": null,
    "nursesCare": "A urinary catheter supports drainage and accurate output measurement when specifically indicated. Catheter duration adds infection risk; routine catheterization is not required for every postoperative or critically ill patient.",
    "nursesNotice": [
      "Read the output with the time interval, fluid balance, and patient assessment.",
      "Kinks, blockage, leakage, or position can affect drainage.",
      "Cloudy or odorous urine alone does not establish a catheter-associated infection."
    ],
    "whenAttentionIncreases": "A sudden output stop, bladder discomfort, visible blood, or systemic illness merits patient and drainage-system review together.",
    "commonMistake": "Diagnosing infection from urine appearance, or assuming no drainage means no urine production.",
    "pearl": "The collection bag shows what drained. It cannot by itself explain what the kidneys produced.",
    "relatedRefs": [
      "urine-output",
      "creatinine",
      "map",
      "bun"
    ]
  },
  {
    "id": "ngt",
    "category": "devices",
    "title": "Nasogastric Tube (NGT)",
    "normalRange": null,
    "nursesCare": "A nasogastric tube may provide enteral access or gastric drainage. The indication and confirmed location determine how it can be used; a tube that looks secure can still migrate.",
    "nursesNotice": [
      "Verify documented placement confirmation and ongoing checks required by local policy.",
      "Air-auscultation sounds do not confirm gastric placement.",
      "Read external markings, securement, respiratory symptoms, abdominal findings, and drainage or feeding tolerance together."
    ],
    "whenAttentionIncreases": "New respiratory symptoms, changed external length, vomiting, distension, bleeding, or unexplained dysfunction merits prompt review.",
    "commonMistake": "Using a whoosh sound, normal breathing, or aspirate appearance alone as proof of correct placement.",
    "pearl": "Position, purpose, and tolerance are separate questions. Each needs an answer.",
    "relatedRefs": [
      "albumin",
      "glucose",
      "phosphorus",
      "sodium"
    ]
  },
  {
    "id": "calcium",
    "category": "labs",
    "title": "Serum Calcium",
    "aliases": [
      "Ca",
      "total calcium",
      "ionized calcium",
      "iCa",
      "corrected calcium",
      "hypocalcemia",
      "hypercalcemia"
    ],
    "normalRange": "Total: about 8.8–10.4 mg/dL · Ionized example: 4.57–5.43 mg/dL (Mayo serum assay, ages 24–97)",
    "nursesCare": "Ionized calcium is the biologically active fraction. Total calcium includes protein-bound calcium, so albumin and pH can change the relationship between the two.",
    "nursesNotice": [
      "Low albumin can lower total calcium without lowering ionized calcium.",
      "Alkalemia increases protein binding and can lower ionized calcium.",
      "Albumin-correction formulas may be unreliable in critical illness; use the ordered assessment and assay context."
    ],
    "whenAttentionIncreases": "New tingling, muscle spasm, weakness, altered consciousness, or rhythm changes with abnormal calcium merits review.",
    "commonMistake": "Assuming a low total calcium proves a low active calcium level.",
    "pearl": "Total calcium counts bound and free calcium. Ionized calcium focuses on the active fraction.",
    "relatedRefs": [
      "phosphorus",
      "albumin",
      "potassium",
      "magnesium"
    ],
    "rangeSummary": "Total vs ionized calcium: different measurements"
  },
  {
    "id": "magnesium",
    "category": "labs",
    "title": "Serum Magnesium",
    "aliases": [
      "Mg",
      "Mg2+",
      "hypomagnesemia",
      "hypermagnesemia"
    ],
    "normalRange": "Example adult interval: 1.6–2.6 mg/dL; use the reporting laboratory's range",
    "nursesCare": "Magnesium supports neuromuscular function and electrical stability. Deficiency can accompany low potassium or calcium, while kidney dysfunction can contribute to excess magnesium.",
    "nursesNotice": [
      "Read the value with rhythm, strength, reflexes, kidney function, potassium, and calcium.",
      "GI losses, poor intake, and some medications can contribute to low levels.",
      "A serum value does not fully describe total body magnesium stores."
    ],
    "whenAttentionIncreases": "A critical result, new rhythm change, marked weakness, reduced reflexes, or respiratory change merits prompt review.",
    "commonMistake": "Reviewing magnesium in isolation when potassium or calcium is also abnormal.",
    "pearl": "Electrolytes interact. A persistent abnormality may make more sense when the neighboring values are reviewed.",
    "relatedRefs": [
      "calcium",
      "potassium",
      "creatinine"
    ],
    "rangeSummary": "Example adult interval: 1.6–2.6 mg/dL"
  },
  {
    "id": "gcs",
    "category": "neuro",
    "title": "Glasgow Coma Scale (GCS)",
    "aliases": [
      "Glasgow",
      "GCS score",
      "level of consciousness",
      "LOC",
      "neuro check",
      "EVM score"
    ],
    "normalRange": "Eye 1–4 · Verbal 1–5 · Motor 1–6; total 3–15 only when all components are testable",
    "nursesCare": "GCS describes observed eye, verbal, and motor responses. Component scores communicate which response changed; the total alone cannot explain the cause of reduced consciousness.",
    "nursesNotice": [
      "Report components and the trend, not only the total.",
      "Intubation, sedation, language barriers, paralysis, and injuries can limit assessment.",
      "Record an untestable component as not testable with the reason rather than assigning 1 for an inability to test."
    ],
    "whenAttentionIncreases": "A new reduction in responsiveness, asymmetry, or other neurologic change merits prompt review with confounders documented.",
    "commonMistake": "Comparing totals as equivalent when the component pattern or testability differs.",
    "pearl": "E, V, and M tell a more useful story than a total by itself.",
    "relatedRefs": [
      "cpp",
      "pupil-assessment"
    ],
    "rangeSummary": "Eye, verbal, and motor components; testability matters"
  },
  {
    "id": "pupil-assessment",
    "category": "neuro",
    "title": "Pupil Assessment (PERRLA)",
    "aliases": [
      "PERRLA",
      "pupils",
      "pupil check",
      "pupillary response",
      "anisocoria",
      "neuro check"
    ],
    "normalRange": "Document size in mm, symmetry, and light response; compare with baseline",
    "nursesCare": "Pupil findings help assess afferent and efferent neurologic pathways. Baseline differences, ocular conditions, medications, and lighting can affect the result.",
    "nursesNotice": [
      "Record each pupil's size and response with the rest of the neurologic exam.",
      "New anisocoria is different from a documented longstanding asymmetry.",
      "Use PERRLA only if each stated component, including accommodation, was actually assessed."
    ],
    "whenAttentionIncreases": "New unequal pupils, a newly reduced light response, or change with reduced consciousness or focal findings merits prompt review.",
    "commonMistake": "Dismissing a new change as medication-related without assessment, or charting an untested component as normal.",
    "pearl": "A precise observation and a known baseline make a pupil change easier to interpret.",
    "relatedRefs": [
      "gcs",
      "cpp"
    ],
    "rangeSummary": "Size, symmetry, light response, and baseline"
  },
  {
    "id": "chest-tube",
    "category": "devices",
    "title": "Chest Tube / Pleural Drainage System",
    "aliases": [
      "CT",
      "pleurovac",
      "pleur-evac",
      "water seal",
      "air leak",
      "thoracostomy tube",
      "tidaling"
    ],
    "normalRange": null,
    "nursesCare": "A chest drain removes air or fluid from the pleural space for a specific indication. Drainage, system behavior, and the patient's respiratory assessment need to be interpreted together.",
    "nursesNotice": [
      "Document drainage amount, character, timing, site, and system integrity.",
      "Absent tidaling can reflect re-expansion or obstruction; tidaling alone does not prove full patency.",
      "Bubbling in a water-seal chamber differs from expected bubbling in some wet-suction systems; device design matters."
    ],
    "whenAttentionIncreases": "New respiratory distress, disconnection or displacement concern, new air-leak findings, fresh bleeding, or abrupt output change merits prompt team review.",
    "commonMistake": "Interpreting every bubble as the same finding, or assuming a quiet chamber proves the problem has resolved.",
    "pearl": "Name the chamber and device before explaining what the movement or bubbles mean.",
    "relatedRefs": [
      "spo2",
      "respiratory-rate"
    ]
  },
  {
    "id": "picc-line",
    "category": "devices",
    "title": "PICC Line / Midline Catheter",
    "aliases": [
      "PICC",
      "peripherally inserted central catheter",
      "midline catheter",
      "midline"
    ],
    "normalRange": null,
    "nursesCare": "A PICC is inserted peripherally but has a central tip. A midline has a peripheral tip. Infusion suitability also depends on the drug, formulation, device labeling, and local policy.",
    "nursesNotice": [
      "Compare the documented external length, dressing, and securement with baseline.",
      "Arm pain, swelling, leakage, or new dysfunction can signal a complication.",
      "A normal-looking insertion site does not exclude thrombosis or bloodstream infection."
    ],
    "whenAttentionIncreases": "New swelling, pain, changed external length, leakage, unexplained dysfunction, or systemic illness merits review.",
    "commonMistake": "Calling a PICC a peripheral IV because it enters through the arm, or assuming every arm catheter has a central tip.",
    "pearl": "The entry site tells you where the catheter starts. The tip location helps define the access.",
    "relatedRefs": [
      "central-line"
    ]
  },
  {
    "id": "wound-drain",
    "category": "devices",
    "title": "Wound Drains (JP / Hemovac)",
    "aliases": [
      "JP drain",
      "Jackson-Pratt",
      "Hemovac",
      "surgical drain",
      "closed suction drain"
    ],
    "normalRange": null,
    "nursesCare": "A wound drain removes fluid from a surgical area. Expected output and reservoir behavior depend on the operation and drain design, so the procedure-specific plan provides the baseline.",
    "nursesNotice": [
      "Trend each drain's amount and character separately.",
      "Read site redness, warmth, swelling, pain, leakage, and systemic findings together.",
      "A sudden stop can reflect obstruction or loss of suction, not simply resolution."
    ],
    "whenAttentionIncreases": "New bright-red output, an abrupt output change, swelling, purulent drainage, systemic illness, or device displacement merits review.",
    "commonMistake": "Using one universal removal threshold or assuming a drain with no output is functioning normally.",
    "pearl": "Output, site findings, and reservoir behavior should tell a consistent story.",
    "relatedRefs": []
  },
  {
    "id": "tracheostomy",
    "category": "devices",
    "title": "Tracheostomy Care Basics",
    "aliases": [
      "trach",
      "trach care",
      "tracheostomy tube",
      "stoma"
    ],
    "normalRange": null,
    "nursesCare": "A tracheostomy provides an airway through the neck. Airway anatomy, tube type, indication, and the documented airway plan determine how assessment findings are interpreted.",
    "nursesNotice": [
      "Assess respiratory effort, airflow, secretions, securement, skin, and the ability to communicate.",
      "New bleeding, displacement concern, or obstructed airflow is clinically important.",
      "A total laryngectomy has no connection between nose or mouth and lungs; it is anatomically different from a tracheostomy."
    ],
    "whenAttentionIncreases": "New distress, reduced airflow, bleeding, or displacement concern merits immediate clinical-team attention under the local airway plan.",
    "commonMistake": "Assuming every neck airway has the same anatomy or that a reassuring saturation excludes an airway problem.",
    "pearl": "Know the airway anatomy and documented plan before interpreting a change.",
    "relatedRefs": [
      "spo2",
      "respiratory-rate"
    ]
  },
  {
    "id": "cam-icu",
    "category": "neuro",
    "title": "CAM-ICU (Delirium Screening)",
    "aliases": [
      "CAM-ICU",
      "delirium screen",
      "confusion assessment method",
      "ICU delirium"
    ],
    "normalRange": "Positive screen: features 1 + 2, plus either 3 or 4; assess arousability first",
    "nursesCare": "CAM-ICU is a validated delirium screen: (1) acute change or fluctuation, (2) inattention, (3) altered consciousness, and (4) disorganized thinking. A positive screen requires 1 and 2, plus either 3 or 4, and prompts clinical evaluation.",
    "nursesNotice": [
      "Use the standardized instrument and training, including its arousability assessment.",
      "Quiet, withdrawn behavior can be delirium; agitation is not required.",
      "Document an unassessable screen when arousability prevents testing, rather than calling it negative."
    ],
    "whenAttentionIncreases": "A new positive screen, fluctuation, or unexplained change in attention or alertness merits review for contributing causes.",
    "commonMistake": "Using orientation questions alone as a CAM-ICU assessment or assuming calm behavior excludes delirium.",
    "pearl": "The rule is 1 and 2, plus 3 or 4. The numbered features matter more than a general impression of confusion.",
    "relatedRefs": [
      "gcs"
    ],
    "rangeSummary": "Features 1 + 2, plus 3 or 4; arousability first"
  },
  {
    "id": "ammonia",
    "category": "labs",
    "title": "Serum Ammonia",
    "aliases": [
      "NH3",
      "ammonia level",
      "hyperammonemia",
      "hepatic encephalopathy"
    ],
    "normalRange": "Assay-, specimen-, and handling-specific; use the laboratory's interval",
    "nursesCare": "Ammonia is part of the physiology of hepatic encephalopathy, but the blood level alone cannot diagnose or grade it. Altered mental status still requires a broader clinical assessment.",
    "nursesNotice": [
      "Collection, transport, processing, and specimen type can affect the result.",
      "An elevated value does not by itself explain a change in consciousness.",
      "A normal value in suspected overt hepatic encephalopathy should prompt diagnostic reconsideration, per AASLD guidance."
    ],
    "whenAttentionIncreases": "New confusion, reduced consciousness, or other neurologic change merits prompt review regardless of whether a result is available.",
    "commonMistake": "Tracking recovery or assigning a cause of confusion from the ammonia number alone.",
    "pearl": "Assess the person, then interpret the ammonia result within that assessment.",
    "relatedRefs": [],
    "rangeSummary": "Laboratory-, specimen-, and handling-specific"
  }
];
