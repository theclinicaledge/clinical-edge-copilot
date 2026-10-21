// Educational pattern connections, not diagnostic or treatment algorithms.

export const BEDSIDE_PATHWAYS = [
  {
    "id": "rising-lactate",
    "icon": "↗",
    "title": "Rising Lactate",
    "subtitle": "Perfusion, clearance, and trend direction",
    "summaryRefs": "Includes Lactate, MAP, UO",
    "notice": [
      "Lactate is rising across comparable serial samples.",
      "Perfusion changes may be present, but adrenergic stress, seizures, medications, or impaired clearance can also contribute.",
      "Urine output, skin findings, mentation, and the clinical timeline help explain the trend."
    ],
    "lookAt": [
      "MAP trend",
      "Urine output",
      "Shock Index",
      "Base Excess",
      "Skin and mentation"
    ],
    "conceptMap": {
      "nodes": [
        "Production",
        "Clearance",
        "Lactate trend",
        "Bedside findings"
      ],
      "note": "These are connected questions, not a fixed chain proving oxygen debt."
    },
    "commonPattern": "A rising lactate means production is exceeding clearance. The trend deserves an explanation, not an automatic diagnosis of tissue hypoxia or sepsis.",
    "relatedRefs": [
      "lactate",
      "map",
      "urine-output",
      "shock-index",
      "base-excess"
    ],
    "check": {
      "question": "Lactate rises while MAP stays in goal. What does that establish?",
      "options": [
        "Lactate production exceeds clearance; the cause still needs context.",
        "Normal MAP proves perfusion is adequate, so lactate is unimportant."
      ],
      "answer": 0,
      "explanation": "MAP is pressure, not a direct flow measurement. Lactate can rise from impaired delivery, adrenergic production, or reduced clearance. Connect it with the patient and other trends."
    }
  },
  {
    "id": "map-fine-patient-bad",
    "icon": "◉",
    "title": "MAP Looks Fine, Patient Looks Bad",
    "subtitle": "Pressure vs perfusion",
    "summaryRefs": "Includes MAP, Lactate, CO/CI",
    "notice": [
      "MAP meets the ordered goal, but the patient has concerning perfusion findings.",
      "Cool skin, altered mentation, or falling urine output do not match the pressure number.",
      "Cardiac output, hemoglobin, and other trends may help explain the mismatch."
    ],
    "lookAt": [
      "Urine output",
      "Lactate",
      "Capillary refill",
      "Cardiac output / index",
      "SVR"
    ],
    "conceptMap": {
      "nodes": [
        "Pressure",
        "Flow",
        "Oxygen content",
        "Organ findings"
      ],
      "note": "Assess these together. A pressure target alone cannot establish tissue oxygen delivery."
    },
    "commonPattern": "Vascular resistance can preserve pressure while flow falls. Perfusion assessment combines the patient, measurement quality, and multiple trends.",
    "relatedRefs": [
      "map",
      "urine-output",
      "lactate",
      "cardiac-output",
      "svr"
    ],
    "check": {
      "question": "Why can normal MAP coexist with poor perfusion?",
      "options": [
        "A normal pressure always guarantees enough blood flow.",
        "Higher resistance can preserve pressure even when cardiac output falls."
      ],
      "answer": 1,
      "explanation": "Pressure depends on flow and resistance. A reassuring MAP does not erase new mentation, skin, or urine-output findings."
    }
  },
  {
    "id": "peep-hypotension",
    "icon": "⇅",
    "title": "PEEP Causing Hypotension?",
    "subtitle": "Lung pressure and circulation can interact",
    "summaryRefs": "Includes PEEP, MAP, Pplat",
    "notice": [
      "Blood pressure falls after a respiratory-support change.",
      "Higher intrathoracic pressure can reduce venous return or alter right-heart loading.",
      "The timing supports a possible connection, but does not exclude other causes of hypotension."
    ],
    "lookAt": [
      "MAP",
      "CVP",
      "Plateau pressure",
      "Ventilator compliance",
      "SpO₂"
    ],
    "conceptMap": {
      "nodes": [
        "Intrathoracic pressure",
        "Venous return / RV loading",
        "Cardiac output",
        "MAP"
      ],
      "note": "Possible physiologic connections, not a prediction that every patient responds the same way."
    },
    "commonPattern": "PEEP may improve oxygenation while affecting circulation. New hypotension needs patient and team assessment, rather than an assumption about cause or an independent support change.",
    "relatedRefs": [
      "peep",
      "map",
      "cvp",
      "plateau-pressure",
      "ventilator-compliance"
    ],
    "check": {
      "question": "Why might blood pressure fall while oxygenation improves?",
      "options": [
        "Chest pressure can affect venous return and right-heart loading.",
        "Better oxygenation proves circulation has also improved."
      ],
      "answer": 0,
      "explanation": "Positive intrathoracic pressure can help oxygenation and affect circulation differently. Compare the timing, perfusion, and respiratory findings with the team; the association alone does not prove cause."
    }
  },
  {
    "id": "urine-output-falling",
    "icon": "↓",
    "title": "Urine Output Falling",
    "subtitle": "Production, drainage, and kidney-function trends",
    "summaryRefs": "Includes UO, MAP, Creatinine",
    "notice": [
      "Output falls or stops, with or without a creatinine change.",
      "Perfusion, kidney dysfunction, hormonal responses, and impaired drainage are possible contributors.",
      "Creatinine may lag, but AKI can also occur without low output."
    ],
    "lookAt": [
      "Patient and perfusion",
      "Drainage system",
      "Creatinine trend",
      "Fluid balance",
      "Output interval"
    ],
    "conceptMap": {
      "nodes": [
        "Kidney function / perfusion",
        "Urine production",
        "Drainage",
        "Measured output"
      ],
      "note": "The bag measures what drained; it does not establish why production or drainage changed."
    },
    "commonPattern": "Assess the patient and drainage system together. A new change deserves review before a diagnostic time threshold is reached; preserved output does not exclude AKI.",
    "relatedRefs": [
      "urine-output",
      "map",
      "lactate",
      "creatinine",
      "capillary-refill"
    ],
    "check": {
      "question": "A catheter bag suddenly has no new output. What can you conclude?",
      "options": [
        "The kidneys have definitely stopped producing urine.",
        "Output changed; patient findings and drainage need assessment together."
      ],
      "answer": 1,
      "explanation": "A blockage can reduce measured drainage, while perfusion or kidney dysfunction can reduce production. Neither explanation is established by the bag alone, and assessment should not wait for six hours."
    }
  },
  {
    "id": "oxygenation-vs-ventilation",
    "icon": "⇌",
    "title": "Oxygen Looks Fine, CO₂ Doesn't",
    "subtitle": "SpO₂/PaO₂ vs CO₂ clearance",
    "summaryRefs": "Includes SpO₂, PaCO₂, FiO₂",
    "notice": [
      "SpO₂ may remain in goal while PaCO₂ rises.",
      "Supplemental oxygen does not establish adequate CO₂ clearance.",
      "Breath size, rate, dead space, effort, and alertness help explain ventilation."
    ],
    "lookAt": [
      "SpO₂",
      "PaO₂",
      "PaCO₂",
      "FiO₂",
      "Minute ventilation"
    ],
    "conceptMap": {
      "nodes": [
        "SpO₂ / PaO₂",
        "Inspired oxygen context",
        "PaCO₂ / pH",
        "Alveolar ventilation"
      ],
      "note": "Two paired questions: oxygen transfer and effective CO₂ removal. These are not one causal sequence."
    },
    "commonPattern": "A reassuring oxygen saturation can coexist with hypoventilation. Oxygenation, ventilation, and overall tissue oxygen delivery each need their own context.",
    "relatedRefs": [
      "oxygenation-vs-ventilation",
      "spo2",
      "pao2",
      "paco2",
      "minute-ventilation"
    ],
    "check": {
      "question": "SpO₂ is in goal, but the patient is newly drowsy. Does saturation establish adequate ventilation?",
      "options": [
        "No. Oxygen can remain in range while CO₂ rises.",
        "Yes. A normal saturation excludes hypoventilation."
      ],
      "answer": 0,
      "explanation": "SpO₂ estimates hemoglobin saturation, not CO₂ removal. New drowsiness needs clinical assessment even when saturation looks reassuring."
    }
  },
  {
    "id": "high-peak-pressure",
    "icon": "▲",
    "title": "Why Is the Vent Alarming?",
    "subtitle": "Peak vs plateau pressure",
    "summaryRefs": "Includes Peak, Pplat, Compliance",
    "notice": [
      "Peak pressure rises, with or without a plateau-pressure change.",
      "Under comparable passive measurement conditions, the difference helps assess airflow resistance.",
      "Effort, flow, volume, end-expiratory pressure, and chest-wall factors affect interpretation."
    ],
    "lookAt": [
      "Plateau pressure",
      "Ventilator compliance",
      "Tidal volume",
      "Patient-vent synchrony",
      "Breath sounds"
    ],
    "conceptMap": {
      "nodes": [
        "Peak trend",
        "Plateau trend",
        "Measurement conditions",
        "Resistance / elastic loading"
      ],
      "note": "Compare trends under comparable conditions; a gap alone cannot diagnose the cause."
    },
    "commonPattern": "Peak rising while plateau stays stable can suggest increased resistance. Both rising can reflect elastic loading or other changes. The patient assessment and measurement conditions decide how useful the pattern is.",
    "relatedRefs": [
      "plateau-pressure",
      "ventilator-compliance",
      "tidal-volume",
      "respiratory-rate"
    ],
    "check": {
      "question": "With comparable flow and volume and a valid passive measurement, peak rises but plateau stays stable. What does that suggest?",
      "options": [
        "It proves the lungs have become less compliant.",
        "Increased airflow resistance is one possible explanation."
      ],
      "answer": 1,
      "explanation": "Peak includes resistive pressure; plateau is measured when flow has stopped. An increased gap can therefore suggest resistance, but effort and measurement changes can make the comparison misleading."
    }
  }
];

export const CLINICAL_CONCEPTS = [
  {
    "id": "shock",
    "title": "Shock",
    "subtitle": "Perfusion failure patterns",
    "summary": "Shock involves inadequate tissue perfusion or oxygen utilization. Blood pressure alone cannot establish or exclude it.",
    "notice": [
      "Different shock mechanisms can produce similar pressure readings.",
      "Mentation, skin findings, output, lactate, hemoglobin, and measured flow help build the picture.",
      "No single finding identifies the mechanism; mixed physiology is possible."
    ],
    "conceptMap": {
      "nodes": [
        "Pressure and flow",
        "Oxygen content",
        "Tissue use",
        "Organ findings"
      ],
      "note": "These findings support clinical evaluation; they are not a standalone diagnostic rule."
    },
    "connectedPathwayIds": [
      "rising-lactate",
      "map-fine-patient-bad",
      "urine-output-falling"
    ],
    "connectedRefIds": [
      "map",
      "lactate",
      "urine-output",
      "shock-index",
      "base-excess",
      "cardiac-output"
    ],
    "preview": "Pressure, flow, oxygen content, and organ findings belong together."
  },
  {
    "id": "ards",
    "title": "ARDS",
    "subtitle": "Acute lung injury and oxygenation impairment",
    "summary": "ARDS is a clinical syndrome requiring acute timing, compatible bilateral imaging, oxygenation impairment, and an edema explanation not primarily cardiac or fluid overload. A low P/F ratio alone is insufficient.",
    "notice": [
      "Interpret oxygenation with the respiratory-support context.",
      "Compliance may be reduced, but stiff lungs are not required to recognize the syndrome.",
      "Pressure, oxygenation, and circulation can change together; use the full clinical assessment."
    ],
    "conceptMap": {
      "nodes": [
        "Timing / risk context",
        "Imaging / edema origin",
        "Oxygenation",
        "Respiratory support"
      ],
      "note": "The definition combines criteria. It is not a diagnosis from one ratio or pressure."
    },
    "connectedPathwayIds": [
      "peep-hypotension",
      "oxygenation-vs-ventilation",
      "high-peak-pressure"
    ],
    "connectedRefIds": [
      "pf-ratio",
      "peep",
      "plateau-pressure",
      "ventilator-compliance",
      "spo2"
    ],
    "preview": "Acute lung injury needs more context than a low oxygenation ratio."
  },
  {
    "id": "aki",
    "title": "AKI",
    "subtitle": "Kidney signal, perfusion signal, timing signal",
    "summary": "AKI assessment uses changes in creatinine or urine output over defined time intervals. Either may change first, and preserved output does not exclude kidney injury.",
    "notice": [
      "Compare creatinine with the patient's baseline, not just the population range.",
      "Assess kidney function, perfusion, drainage, fluid balance, and medication context together.",
      "A new low-output finding deserves review before a diagnostic duration is reached."
    ],
    "conceptMap": {
      "nodes": [
        "Baseline",
        "Creatinine change",
        "Output / duration",
        "Clinical context"
      ],
      "note": "A change from baseline can matter even while a value remains inside the laboratory interval."
    },
    "connectedPathwayIds": [
      "urine-output-falling",
      "map-fine-patient-bad",
      "rising-lactate"
    ],
    "connectedRefIds": [
      "urine-output",
      "creatinine",
      "bun",
      "map",
      "lactate"
    ],
    "preview": "Baseline, creatinine change, output, and time help explain kidney function."
  },
  {
    "id": "ventilator-trouble",
    "title": "Ventilator Trouble",
    "subtitle": "Oxygenation, ventilation, resistance, compliance",
    "summary": "Separate oxygen transfer, CO₂ removal, airflow resistance, and respiratory-system expansion to explain a changing respiratory assessment.",
    "notice": [
      "SpO₂ and PaCO₂ can move in different directions.",
      "Peak and plateau comparisons require suitable measurement conditions.",
      "Patient effort, synchrony, secretions, circuit findings, and chest-wall factors matter alongside displayed values."
    ],
    "conceptMap": {
      "nodes": [
        "Oxygenation",
        "Ventilation",
        "Resistance",
        "Compliance"
      ],
      "note": "Four connected assessment questions, not instructions to change support independently."
    },
    "connectedPathwayIds": [
      "oxygenation-vs-ventilation",
      "high-peak-pressure",
      "peep-hypotension"
    ],
    "connectedRefIds": [
      "spo2",
      "paco2",
      "minute-ventilation",
      "plateau-pressure",
      "ventilator-compliance"
    ],
    "preview": "Separate oxygenation, CO₂ removal, resistance, and compliance."
  },
  {
    "id": "sepsis-pattern",
    "title": "Sepsis Pattern",
    "subtitle": "Inflammation, perfusion, lactate, organ response",
    "summary": "Sepsis is organ dysfunction from a dysregulated response to infection. Infection concern and new organ-function changes matter together; lactate, WBC, fever, or hypotension alone cannot establish or exclude it.",
    "notice": [
      "Mental-status change, output decline, respiratory changes, and perfusion findings may develop together or separately.",
      "Normal WBC, normal lactate, or an acceptable MAP does not exclude serious illness.",
      "Use the full clinical picture and local evaluation pathway rather than waiting for every finding to align."
    ],
    "conceptMap": {
      "nodes": [
        "Infection concern",
        "Host response",
        "Organ-function change",
        "Clinical evaluation"
      ],
      "note": "Lactate can support assessment but is neither a required finding nor a standalone diagnosis."
    },
    "connectedPathwayIds": [
      "rising-lactate",
      "map-fine-patient-bad",
      "urine-output-falling"
    ],
    "connectedRefIds": [
      "lactate",
      "map",
      "urine-output",
      "wbc",
      "shock-index"
    ],
    "preview": "Infection concern and organ-function changes need assessment together."
  }
];
