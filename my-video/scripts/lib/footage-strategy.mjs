// ─── Clinical Edge Footage Strategy ───────────────────────────────────────────
// Maps nursing education topics to specific, lesson-relevant Pexels search
// queries. Each category has keyword matchers and a pool of queries — we
// pick 3 from the pool to maximize scene variety.
//
// Priority order in FOOTAGE_CATEGORIES matters: more specific categories
// (e.g. "ecg-rhythm") should appear before broad ones (e.g. "clinical-general").

// ─── Category definitions ─────────────────────────────────────────────────────
const FOOTAGE_CATEGORIES = [

  // ── ECG / Rhythm / Telemetry ────────────────────────────────────────────────
  {
    id: "ecg-rhythm",
    keywords: [
      "heart block", "complete heart block", "afib", "a-fib", "atrial fibrillation",
      "v-tach", "vtach", "ventricular tachycardia", "v-fib", "vfib", "ventricular fibrillation",
      "svt", "supraventricular", "bradycardia", "tachycardia", "arrhythmia", "dysrhythmia",
      "rhythm", "ecg", "ekg", "telemetry", "cardiac monitor", "heart rate",
      "wpw", "wolff-parkinson-white", "lbbb", "rbbb", "bundle branch", "pvcs",
      "asystole", "pea", "pulseless", "sinus", "junctional", "escape rhythm",
      "pr interval", "qt interval", "qrs", "prolonged qt", "torsades",
    ],
    queries: [
      "telemetry monitor hospital",
      "cardiac monitor screen ICU",
      "ECG monitor bedside",
      "nurse cardiac monitor",
      "ICU heart monitor",
      "bedside cardiac care nurse",
    ],
  },

  // ── Electrolytes / Metabolic / Endocrine ────────────────────────────────────
  {
    id: "electrolytes",
    keywords: [
      "hyperkalemia", "hypokalemia", "potassium",
      "hyponatremia", "hypernatremia", "sodium",
      "hypomagnesemia", "magnesium",
      "hypocalcemia", "hypercalcemia", "calcium",
      "hypophosphatemia", "phosphate",
      "electrolyte",
      // Metabolic / endocrine (share same footage profile as electrolytes)
      "dka", "diabetic ketoacidosis", "hhs", "hyperosmolar",
      "hypoglycemia", "hyperglycemia", "glucose", "diabetes",
      "thyroid storm", "myxedema", "adrenal crisis", "addison",
      "lactic acidosis", "metabolic acidosis", "metabolic alkalosis",
      "anion gap",
    ],
    queries: [
      "cardiac monitor screen hospital",
      "ICU patient monitoring",
      "nurse hospital patient bedside",
      "telemetry station nurse",
      "cardiac monitoring nurse ICU",
    ],
  },

  // ── Sepsis / Infection / Shock ───────────────────────────────────────────────
  {
    id: "sepsis",
    keywords: [
      "sepsis", "septic shock", "sirs", "septicemia", "bacteremia",
      "infection", "meningitis", "cellulitis", "pneumonia sepsis",
      "distributive shock", "warm shock",
    ],
    queries: [
      "nurse assessing patient bedside",
      "IV fluids hospital nurse",
      "nurse checking vitals patient",
      "bedside assessment hospital",
      "deteriorating patient hospital nurse",
    ],
  },

  // ── Vasopressors / Hemodynamics ─────────────────────────────────────────────
  {
    id: "vasopressors",
    keywords: [
      "levophed", "norepinephrine", "vasopressin", "dopamine", "epinephrine",
      "phenylephrine", "dobutamine", "milrinone", "vasopressor",
      "cardiogenic shock", "distributive", "hemodynamic", "map",
      "mean arterial pressure", "hypotension", "pressors",
    ],
    queries: [
      "ICU infusion pump nurse",
      "critical care nurse ICU",
      "IV pump hospital bedside",
      "ICU patient critical nurse",
      "nurse ICU monitoring equipment",
    ],
  },

  // ── Respiratory ─────────────────────────────────────────────────────────────
  {
    id: "respiratory",
    keywords: [
      "abg", "arterial blood gas", "respiratory", "copd", "asthma",
      "pulmonary embolism", "pe ", " pe,", "dvt", "pneumonia",
      "pneumothorax", "chest tube", "intubation", "ventilator", "mechanical ventilation",
      "ards", "hypoxia", "hypoxemia", "oxygen", "breathing",
      "respiratory failure", "non-rebreather", "bipap", "cpap", "high flow",
      "atelectasis", "pleural",
    ],
    queries: [
      "respiratory patient hospital oxygen",
      "nurse oxygen therapy ICU",
      "ICU ventilator patient nurse",
      "nurse monitoring respiratory patient",
      "hospital respiratory care nurse",
    ],
  },

  // ── Cardiac (non-rhythm) ────────────────────────────────────────────────────
  {
    id: "cardiac",
    keywords: [
      "heart failure", "chf", "pulmonary edema", "flash pulmonary",
      "mi ", "stemi", "nstemi", "acs", "acute coronary", "chest pain",
      "troponin", "bnp", "ntprobnp", "cardiac tamponade", "pericardial",
      "aortic dissection", "aortic stenosis", "endocarditis",
      "ejection fraction", "systolic", "diastolic",
    ],
    queries: [
      "nurse cardiac patient bedside",
      "cardiac care ICU nurse",
      "heart monitor hospital nurse",
      "nurse bedside assessment cardiac",
      "hospital cardiac care nurse",
    ],
  },

  // ── Neurological ────────────────────────────────────────────────────────────
  {
    id: "neurological",
    keywords: [
      "stroke", "cva", "tia", "hemorrhage", "subarachnoid", "subdural",
      "seizure", "status epilepticus", "epilepsy", "altered mental status",
      "ams", "encephalopathy", "delirium", "confusion", "confused", "acute confusion",
      "new confusion", "altered", "icp", "intracranial pressure",
      "cushing", "herniation", "gcs", "glasgow", "neuro",
      "spinal", "meningitis", "alcohol withdrawal", "ciwa",
    ],
    queries: [
      "nurse patient neurological assessment",
      "hospital patient bedside nurse",
      "ICU nurse patient monitoring",
      "nurse checking patient hospital",
      "hospital patient care nurse",
    ],
  },

  // ── Renal ───────────────────────────────────────────────────────────────────
  {
    id: "renal",
    keywords: [
      "renal", "kidney", "aki", "acute kidney injury", "ckd",
      "dialysis", "creatinine", "bun", "uremia", "oliguria", "anuria",
      "fluid overload", "diuresis", "lasix", "furosemide",
    ],
    queries: [
      "ICU patient hospital nurse",
      "nurse bedside monitoring hospital",
      "hospital patient care bedside",
      "nurse assessment ICU patient",
      "clinical nurse monitoring patient",
    ],
  },

  // ── Medications / Pharmacology ──────────────────────────────────────────────
  {
    id: "pharmacology",
    keywords: [
      "medication", "drug", "overdose", "toxicity", "pharmacology",
      "anticoagulation", "heparin", "warfarin", "apixaban", "rivaroxaban",
      "insulin", "digoxin", "digoxin toxicity", "lithium", "acetaminophen",
      "antidote", "reversal", "dose", "titrate", "drip",
    ],
    queries: [
      "nurse medication hospital bedside",
      "IV medication infusion pump",
      "nurse preparing medication hospital",
      "bedside medication nurse patient",
      "nurse IV administration hospital",
    ],
  },

  // ── Post-op / Surgical ──────────────────────────────────────────────────────
  {
    id: "surgical",
    keywords: [
      "post-op", "postoperative", "surgical", "surgery",
      "wound", "dehiscence", "evisceration", "anastomosis",
      "ileus", "bowel obstruction", "abdominal",
      "bleeding", "hemorrhage post", "transfusion",
    ],
    queries: [
      "nurse patient post surgery hospital",
      "hospital patient recovery nurse",
      "nurse bedside care hospital",
      "hospital nurse patient monitoring",
      "nurse surgical patient assessment",
    ],
  },

  // ── Clinical Deterioration / Assessment / RRT ───────────────────────────────
  {
    id: "deterioration",
    keywords: [
      "deterioration", "rapid response", "early warning", "news",
      "assessment", "sbar", "handoff", "recognition",
      "clinical judgment", "failure to rescue", "early intervention",
      // Subtle change / gut instinct scenarios
      "feel off", "feels off", "feeling off", "something wrong",
      "something's off", "not right", "doesn't look right",
      "subtle", "gut feeling", "gut instinct", "before the numbers",
      "early signs", "early recognition", "nursing intuition",
      "patient said", "patient reported", "patient concern",
    ],
    queries: [
      "nurse entering room patient assessment",
      "nurse assessing patient bedside",
      "hospital hallway nurse urgency",
      "nurse monitoring patient hospital",
      "bedside assessment patient nurse",
    ],
  },

  // ── FALLBACK — general clinical ─────────────────────────────────────────────
  {
    id: "clinical-general",
    keywords: [], // always matches as fallback
    queries: [
      "nurse patient bedside assessment",
      "ICU patient nurse monitoring",
      "nurse hospital patient care",
      "bedside nurse patient hospital",
      "clinical nurse patient ICU",
    ],
  },
];

// ─── Select 3 footage queries for a given topic ───────────────────────────────
// Matches topic against each category's keywords (case-insensitive).
// Returns exactly 3 queries from the matched category's pool, shuffled
// slightly so successive runs don't always get the same three clips.
export function selectFootageQueries(topic) {
  const lower = topic.toLowerCase();

  // Find the first matching category (categories are ordered specific → general)
  let matched = null;
  for (const cat of FOOTAGE_CATEGORIES) {
    if (cat.keywords.length === 0) {
      // This is the fallback — only use if nothing else matched
      matched = matched ?? cat;
      continue;
    }
    const hit = cat.keywords.some(kw => lower.includes(kw.toLowerCase()));
    if (hit) {
      matched = cat;
      break;
    }
  }

  // Should never be null (fallback always catches), but be safe
  if (!matched) {
    return ["nurse patient hospital", "ICU bedside nurse", "hospital patient care"];
  }

  // Pick 3 from the pool — rotate by topic length to vary across topics
  // without being random (deterministic = reproducible re-runs)
  const pool    = matched.queries;
  const offset  = topic.length % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  return rotated.slice(0, 3);
}

// ─── Get category ID for a topic (for logging/debugging) ─────────────────────
export function detectCategory(topic) {
  const lower = topic.toLowerCase();
  for (const cat of FOOTAGE_CATEGORIES) {
    if (cat.keywords.length === 0) continue;
    if (cat.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return cat.id;
    }
  }
  return "clinical-general";
}
