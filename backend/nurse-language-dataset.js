"use strict";

/**
 * nurse-language-dataset.js
 * Clinical Edge Copilot — Nurse Language Pattern Dataset
 *
 * A maintainable rule/pattern library imported by server.js for:
 *   - input normalization (abbreviation/shorthand expansion)
 *   - routing intent detection (practical question recognition)
 *   - fragment interpretation (compressed bedside phrasing)
 *
 * NOT for ML training. Extend these arrays instead of hardcoding in server.js.
 * Patterns are applied for ROUTING DECISIONS only — the original question
 * is always sent to the model unchanged.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ABBREVIATION / SHORTHAND EXPANSIONS
//    Format: [regex, replacement_string]
//    Applied inside normalizeAbbreviations() in server.js.
//    ORDER MATTERS — multi-word forms (e.g. "hep gtt") must appear
//    before their components (e.g. "hep") so the longer match wins first.
// ─────────────────────────────────────────────────────────────────────────────
const ABBREVIATION_EXPANSIONS = [

  // ── Devices & Procedures (multi-word first) ───────────────────────────────
  [/\bart\s*line\b/g,               "arterial line"],
  [/\ba-line\b/g,                   "arterial line"],
  [/\bng\s*tube\b/g,                "nasogastric tube"],
  [/\bj\s*tube\b/g,                 "jejunostomy tube"],
  [/\bg\s*tube\b/g,                 "gastrostomy tube"],
  [/\btrach\b/g,                    "tracheostomy"],
  [/\bpeg\b/g,                      "peg tube"],
  [/\bpicc\b/g,                     "peripherally inserted central catheter"],
  [/\bcvc\b/g,                      "central venous catheter"],
  [/\bett\b/g,                      "endotracheal tube"],
  [/\bdobhoff\b/g,                  "feeding tube"],

  // ── Respiratory / Oxygen ──────────────────────────────────────────────────
  [/\bbvm\b/g,                      "bag valve mask"],
  [/\bnippv\b/g,                    "noninvasive positive pressure ventilation"],
  [/\bpeep\b/g,                     "positive end expiratory pressure"],
  [/\bfio2\b/gi,                    "fio2"],

  // ── Labs (longer forms first) ─────────────────────────────────────────────
  [/\baptt\b/g,                     "activated partial thromboplastin time"],
  [/\bd-dimer\b/g,                  "d dimer"],
  [/\bpro\s*bnp\b/g,                "bnp brain natriuretic peptide"],
  [/\bbnp\b/g,                      "bnp brain natriuretic peptide"],
  [/\bcbc\b/g,                      "complete blood count"],
  [/\bcmp\b/g,                      "comprehensive metabolic panel"],
  [/\bbmp\b/g,                      "basic metabolic panel"],
  [/\blft\b/g,                      "liver function tests"],
  [/\bkcl\b/g,                      "potassium chloride"],
  [/\btrop\b/g,                     "troponin"],
  [/\bbicarb\b/g,                   "bicarbonate"],
  [/\bmag\b/g,                      "magnesium"],
  [/\bphos\b/g,                     "phosphorus"],
  [/\blac\b/g,                      "lactate"],

  // ── Medications / Drips (multi-word / compound forms first) ──────────────
  [/\bhep\s+gtt\b/g,                "heparin infusion"],
  [/\bhep\s+drip\b/g,               "heparin infusion"],
  [/\blevo\s+gtt\b/g,               "norepinephrine infusion"],
  [/\bdex\s+gtt\b/g,                "dexmedetomidine infusion"],
  [/\bamio\s+gtt\b/g,               "amiodarone infusion"],
  [/\bfent\s+gtt\b/g,               "fentanyl infusion"],
  [/\bdopa\s+gtt\b/g,               "dopamine infusion"],
  [/\bdilt\s+gtt\b/g,               "diltiazem infusion"],
  [/\bprecedex\b/g,                 "dexmedetomidine"],
  [/\blevophed\b/g,                 "norepinephrine"],
  [/\bamio\b/g,                     "amiodarone"],
  [/\bvanco\b/g,                    "vancomycin"],
  [/\bzosyn\b/g,                    "piperacillin tazobactam"],
  [/\bdilaudid\b/g,                 "hydromorphone"],
  [/\bativan\b/g,                   "lorazepam"],
  [/\bversed\b/g,                   "midazolam"],
  [/\bhaldol\b/g,                   "haloperidol"],
  [/\bkeppra\b/g,                   "levetiracetam"],
  [/\bdepakote\b/g,                 "divalproex valproic acid"],
  [/\bdivalproex\b/g,               "divalproex valproic acid"],
  [/\bfent\b/g,                     "fentanyl"],
  [/\bdopa\b/g,                     "dopamine"],
  [/\bdobut\b/g,                    "dobutamine"],
  [/\bhep\b/g,                      "heparin"],

  // ── Casual bedside phrasing → matchable form ─────────────────────────────
  [/\bwhat now\b/g,                 "what should i do now"],
  [/\bwhat to watch\b/g,            "what to watch for"],
  [/\bwhat to look out\b/g,         "what to monitor for"],
  [/\bfresh\b/g,                    "new recent"],   // "fresh trach" → "new recent tracheostomy"
  [/\bjust placed\b/g,              "newly placed"],
  [/\bjust inserted\b/g,            "newly placed"],
  [/\bjust put in\b/g,              "newly placed"],
  // Trailing "normal?" / "okay?" → matchable is-normal form
  [/\bnormal\?+\s*$/g,              "is this normal"],
  [/\bokay\?+\s*$/g,                "is this okay"],
  [/\bok\?+\s*$/g,                  "is this okay"],
];


// ─────────────────────────────────────────────────────────────────────────────
// 2. NURSE PRACTICAL QUESTION PATTERNS
//    Regex patterns that identify compressed / imperfect nurse questions.
//    Used in isNursePracticalQuestion().
//    If ANY of these match the normalized input, it is treated as a
//    practical bedside knowledge question → QUICK_KNOWLEDGE_PROMPT.
//    All patterns assume input has already been lowercased and
//    normalizeAbbreviations() has been applied.
// ─────────────────────────────────────────────────────────────────────────────
const NURSE_PRACTICAL_PATTERNS = [

  // ── How to care for / manage a device or procedure ────────────────────────
  /\b(how to|how do (you|i|we)|how should (i|we))\s+(care for|clean|manage|suction|change|assess|monitor|handle)\b/,
  /\b(care for|caring for|care of)\s+(a\s+)?(new|fresh|recent|newly placed)?\s*(tracheostomy|peg tube|chest tube|foley|picc|central venous catheter|arterial line|wound|drain|stoma|ostomy|colostomy|ileostomy)/,

  // ── "What to watch / look / monitor / check for" ─────────────────────────
  /\bwhat\s+(to\s+)?(watch|look|monitor|check|assess)\s*(for|out)?\b/,
  /\bwhat\s+should\s+i\s+(watch|look|monitor|check)\b/,
  /\bwhat\s+do\s+i\s+(watch|look|monitor|check)\b/,

  // ── Is this normal / expected / safe ─────────────────────────────────────
  /\b(is\s+(it|this|that)\s+)?(normal|expected|okay|ok|safe|common|concerning)\?*\s*$/,
  /\bis\s+(this|it)\s+(normal|okay|ok|safe)\b/,

  // ── "What does X mean" / meaning / definition ────────────────────────────
  /\b(meaning|definition)\s*\?*\s*$/,
  /\bwhat\s+does\s+.{1,40}\s+mean\b/,
  /\bwhat\s+does\s+(that|it|this)\s+mean\b/,

  // ── "What now" / what do I do next ───────────────────────────────────────
  /\bwhat\s+(now|should\s+i\s+do\s+(now|next)|next|do\s+i\s+do)\?*\s*$/,
  /\bwhat\s+(happens?\s+next|do\s+(i|we|you)\s+do)\b/,

  // ── Device / procedure noun phrases (fresh|new + device) ─────────────────
  // e.g. "fresh trach and peg", "new chest tube", "recently placed picc"
  /\b(fresh|new|recent|new recent|newly placed|just got|just had)\s+(and\s+)?(tracheostomy|peg tube|chest tube|foley|peripherally inserted central catheter|central venous catheter|arterial line|nasogastric tube|drain|port|stoma|ostomy|feeding tube|jejunostomy tube|gastrostomy tube)/,

  // ── Device care without "how" prefix (e.g. "trach care first 24 hr") ──────
  /\b(tracheostomy|peg tube|chest tube|arterial line)\s+(care|management|monitoring|assessment|troubleshooting|suction|cleaning|output|drainage|position|bleeding|leak)/,

  // ── Chest tube specific observations ─────────────────────────────────────
  /\bchest\s+tube\s+(not\s+)?(tidaling|bubbling|draining|output|suction|fluctuat|clot|clog)/,
  /\b(no|absent|stopped)\s+tidaling\b/,

  // ── FiO2 / O2 conversion questions ───────────────────────────────────────
  /\b\d+\s*(l|lpm|liters?)\s*(nc|nasal\s*cannula|o2|oxygen)?\s*(equals?|is|what|=)\s*(what|how|fio2|percent|%)/i,
  /\b(fio2|oxygen\s*percent(age)?)\s+(for|at|on)\s+\d/i,
  /\b\d+\s*(l|lpm)\s+(nc|nasal\s*cannula)\b/,

  // ── Short med ID questions (e.g. "what's divalproex sodium") ─────────────
  /\bwhat'?s?\s+[a-z]{3,}\s*(sodium|hcl|er|xr|cr|sr|ir|xl|hydrochloride)?\s*\?*\s*$/,

  // ── Lab value + action question (e.g. "ptt 140 what now", "qtc 520 can i give") ─
  /\b(ptt|inr|qtc|map|trop|troponin|lactate|bicarb|magnesium|phosphorus|bnp|hemoglobin|hematocrit|white blood cell count)\s+\d+\.?\d*\s+(what|high|low|elevated|normal|critical|can i|should i|safe to)\b/,
  /\b(qtc|ptt|inr)\s+\d+\.?\d*\s+(can|should)\s+i\b/,

  // ── Practical action (can i / should i give/hold) ─────────────────────────
  /\b(can|should)\s+i\s+(give|hold|administer|start|stop|use|push|run|hang|check)\b/,

  // ── Potassium/electrolyte wasting / sparing ────────────────────────────────
  /\b(furosemide|lasix|hydrochlorothiazide|spironolactone|aldactone)\s+(potassium|sodium|electrolyte)\s*(wasting|sparing|effect|losing|loss)/,
  /\b(potassium|electrolyte)\s*(wasting|sparing)\b/,

  // ── Medication pharmacology / effect questions ─────────────────────────────
  /\bwhat\s+(does|is)\s+[a-z]{3,}\s+(do|used for|for|mean|treat|indicated|used)\b/,
  /\b[a-z]{3,}\s+(mechanism|action|effect|side effect|adverse|indication|contraindication|dose|class)\b/,
];


// ─────────────────────────────────────────────────────────────────────────────
// 3. DEVICE / PROCEDURE TERMS
//    Added to clinicalTriggers in detectPrompt() so questions that contain
//    these terms are never silently dropped — they always get a useful response.
// ─────────────────────────────────────────────────────────────────────────────
const DEVICE_PROCEDURE_TERMS = [
  "tracheostomy", "trach",
  "peg tube", "g tube", "j tube", "ng tube", "nasogastric", "feeding tube",
  "chest tube",
  "picc", "peripherally inserted",
  "central venous", "central line",
  "arterial line", "a-line",
  "foley", "urinary catheter",
  "wound vac", "wound drain",
  "ostomy", "stoma", "colostomy", "ileostomy",
  "port", "port-a-cath",
  "dobhoff", "jejunostomy", "gastrostomy",
  "endotracheal", "ett",
  "tidaling", "bubbling",
];


// ─────────────────────────────────────────────────────────────────────────────
// 4. COMMON REWORDING EQUIVALENTS
//    Reference table for documentation / future use.
//    Maps real user inputs to canonical clinical concepts.
// ─────────────────────────────────────────────────────────────────────────────
const REWORDING_EQUIVALENTS = {
  "fresh trach and peg":                        "new tracheostomy and peg tube — care and monitoring",
  "new trach what to watch":                    "tracheostomy post-placement monitoring priorities",
  "trach care first 24 hr":                     "post-tracheostomy nursing care first 24 hours",
  "pt just got trach":                          "patient with recently placed tracheostomy",
  "hep gtt ptt 140 what now":                   "heparin infusion with supratherapeutic PTT — nursing action",
  "3l nc equals what fio2":                     "FiO2 equivalent for 3L nasal cannula oxygen",
  "qtc 520 can i give zofran":                  "QTc prolongation safety — ondansetron administration",
  "what's divalproex sodium":                   "divalproex sodium — medication identification and use",
  "lasix potassium wasting?":                   "furosemide and hypokalemia risk",
  "afib rvr meaning":                           "atrial fibrillation with rapid ventricular rate — definition and significance",
  "new chest tube no tidaling":                 "absent tidaling in chest tube — causes and nursing response",
  "fresh peg leaking a little normal?":         "peg tube site drainage after placement — expected vs concerning",
};


module.exports = {
  ABBREVIATION_EXPANSIONS,
  NURSE_PRACTICAL_PATTERNS,
  DEVICE_PROCEDURE_TERMS,
  REWORDING_EQUIVALENTS,
};
