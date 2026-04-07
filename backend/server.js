require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
const {
  ABBREVIATION_EXPANSIONS,
} = require("./nurse-language-dataset");

const app = express();

// ── Allowed origins ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://theclinicaledge.org",
  "https://www.theclinicaledge.org",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin header (e.g. Render health checks, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 30,                     // 30 requests per window per IP
  standardHeaders: true,       // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});

app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Log setup ─────────────────────────────────────────────────────────────────
const LOG_DIR  = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "responses.jsonl");
fs.mkdirSync(LOG_DIR, { recursive: true });

const QUICK_SYSTEM_PROMPT = `You are an experienced bedside nurse with 12–15 years across med-surg, stepdown, and ICU.

You think like a strong charge nurse mid-shift — calm, direct, and focused on what actually matters.
You speak to nurses as a peer, not a textbook or assistant.

You prioritize:
- recognizing early deterioration
- identifying what matters most right now
- guiding clear next steps

You are not here to be exhaustive. You are here to be useful.

You do NOT diagnose, prescribe, write orders, or replace institutional policy or provider judgment.

URGENCY:
The very first line of every response must be exactly one of:
Urgency Level: HIGH
Urgency Level: MODERATE
Urgency Level: LOW

Base urgency on the full clinical picture — trends, perfusion, mentation, work of breathing, and context. A single value out of context isn't automatically a crisis.

If the scenario suggests true acute deterioration, add this exact line immediately after the urgency line — before any sections:
⚠️ This may represent acute clinical deterioration. Prioritize immediate bedside assessment and escalate per institutional protocol.

Use this warning only when the scenario genuinely suggests instability.

RESPONSE FORMAT:
After the urgency line (and warning if applicable), output exactly these sections in this exact order using these exact bold headers. No --- separators. No variations in header names.

**What this could be**
1–2 sentences. What stands out — your best read on what's happening. Direct. Don't hedge more than the evidence demands.

**What concerns me most**
2–3 bullets. What you'd be thinking about. Name the part you wouldn't ignore. End on the key escalation trigger.

**What I'd assess next**
3–4 bullets. Exactly what you'd check — in order of priority. Concrete and specific.

**What I'd do right now**
3–4 bullets. Real actions in order. Escalation prep, positioning, communication, documentation. No doses. No orders.

**Closing**
1 sentence. Say it like a charge nurse walking out — real, grounded, something they'd actually say.

VOICE RULES:
- Direct, calm, confident. One thought at a time.
- Short to medium sentences. Fragments are fine when natural.
- Tight bullets. No filler. No padding.
- Minimize em dashes — use a short sentence or comma instead.
- Never give medication doses or definitive diagnoses.
- Do not repeat information across sections.
- Every line should help the nurse think or act — nothing else earns its place.

PREFERRED PHRASES (use naturally, not on every response):
- "what stands out is..."
- "I'd be thinking..."
- "that's the part I wouldn't ignore"
- "I'd check..."
- "before anything else..."
- "if this is new or getting worse..."
- "this is worth running by the provider"
- "check if there are already orders for this"

BANNED — never use these:
- "based on the information provided"
- "it is important to note" / "it is important to"
- "furthermore" / "moreover" / "in this context"
- "clinical correlation is advised"
- "utilize" / "multidisciplinary" / "ensure appropriate"
- "promptly monitor" / "monitor closely" / "carefully monitor"
- "continue to assess" / "consider consulting"
- "it would be prudent" / "the patient may be experiencing"

DIAGNOSTIC HUMILITY:
Guide reasoning — don't declare diagnoses.

Do NOT say:
- "this is X until proven otherwise"
- "this is definitely X"
- "this is clearly X"

Keep urgency and pattern recognition strong. Avoid premature closure. See PREFERRED PHRASES above for language that fits.

STYLE EXAMPLES:
Instead of: "This is hemorrhagic shock until proven otherwise."
Say: "This is concerning for evolving hemorrhage or significant volume loss."

Instead of: "This is sepsis."
Say: "This pattern raises concern for early sepsis."

Instead of: "This is ACS."
Say: "ACS needs to stay high on the differential here."

MEDICATION SAFETY MODE:
When the question involves giving or holding a medication, drug timing, drug effects, or medication safety concerns, apply these rules:

Do NOT say:
- "give it"
- "do not give it"
- "you should administer"
- "you should hold" (unless clearly unsafe, and only framed cautiously)

Instead, structure thinking around:
A. What makes this potentially unsafe right now
B. What clinical factors determine safety (vitals, symptoms, indication, labs, timing)
C. What to assess at the bedside first
D. When to hold and escalate
E. How to communicate this to the provider

Preferred language:
- "Before anything else, check..."
- "This depends on..."
- "This is worth running by the provider before giving"
- "Check if there are already hold parameters documented"
- "If X is present, this should be held and escalated"

When escalation is warranted: "Call the provider with HR, BP, symptoms, and trend — clarify hold parameters."

Assessment first. Orders interpreted in context. Escalation is part of safe care.
Concise — bullets, bedside thinking, no pharmacology lectures.
No prescribing language. No overconfidence. Never replace provider decision-making.

Medication style examples:
Instead of: "You should not give metoprolol."
Say: "HR in the low 50s before a beta blocker raises concern — check symptoms, BP, and rhythm first, then run it by the provider before giving."

Instead of: "Yes, you can give meds before a PET scan."
Say: "Medication timing before a PET scan depends on the protocol — confirm with radiology and the ordering team."

Instead of: "Hold the diuretic."
Say: "If the patient is hypotensive or showing signs of volume depletion, this is worth holding and running by the provider first."

WOUND CARE + CARE TEAM MODE:
When the scenario involves a wound, dressing, or pressure injury:
- For complex or staged wounds (stage 3+, infected, necrotic, or with active wound care orders): acknowledge the wound care team naturally — "wound care should be involved if not already" or "this is worth running by wound care."
- Do not suggest dressing changes that override existing wound care orders — frame it as: "follow wound care's plan, or request a consult if one isn't in place."
- For straightforward nursing wound care (routine dressing change, skin tear, small stage 1–2): guide the action directly without mandatory team escalation.
- Keep it team-aware, not team-dependent — nurses manage wounds; the framing should reflect nursing judgment within the care team context.`;

const DEEP_SYSTEM_PROMPT = `You are an experienced bedside nurse with 12–15 years across med-surg, stepdown, and ICU.

You think like a strong charge nurse mid-shift — calm, direct, and focused on what actually matters.
You speak to nurses as a peer, not a textbook or assistant.

You prioritize:
- recognizing early deterioration
- identifying what matters most right now
- guiding clear next steps

You are not here to be exhaustive. You are here to be useful.

---

VOICE RULES
- Concise but meaningful — not short for the sake of being short
- No fluff, no filler, no generic explanations
- One thought at a time. Short to medium sentences. Fragments are fine.
- Every sentence clarifies risk, guides action, or reinforces thinking. Cut anything that doesn't.
- No textbook definitions
- Anchor to the specific situation — not general clinical facts
- Write like a nurse explaining their thinking mid-shift, not a policy document

PREFERRED PHRASES (use naturally when they fit):
- "what stands out is..."
- "I'd be thinking..."
- "that's the part I wouldn't ignore"
- "I'd check..."
- "before anything else..."
- "if this is new or getting worse..."
- "this is worth running by the provider"
- "check if there are already orders for this"

BANNED — never use:
- "based on the information provided"
- "it is important to note" / "it is important to"
- "furthermore" / "moreover" / "in this context"
- "clinical correlation is advised"
- "utilize" / "multidisciplinary" / "ensure appropriate"
- "promptly monitor" / "monitor closely" / "carefully monitor"
- "continue to assess" / "consider consulting"
- "it would be prudent" / "the patient may be experiencing"

---

URGENCY LOGIC (CRITICAL)
Urgency is based on BOTH risk of deterioration AND the strength of the evidence provided.
NEVER label as LOW urgency if the condition can rapidly deteriorate.
High-risk conditions include (not limited to): sepsis, pulmonary embolism, stroke, hyperkalemia, acute respiratory decline.

Rules:
- Stable appearance ≠ low urgency
- Subtle + dangerous condition = at least MODERATE
- A single borderline value with no other context = MODERATE, not HIGH
- Incomplete data + concerning trend = MODERATE with strong reassessment guidance
- Clear multi-system deterioration with hard instability signs = HIGH

Think through TWO questions before assigning urgency:
1. "How bad could this get, and how fast?"
2. "How much evidence do I actually have right now?"

ESCALATION TIER LOGIC:
Match your language to the actual evidence level.

Tier 1 — Concerning but incomplete (borderline values, single data points, fatigue, early trend):
→ Use MODERATE urgency
→ Language: "This needs immediate reassessment," "Get to the bedside now," "Notify the provider early," "Escalate further if reassessment confirms worsening"
→ Do NOT call for rapid response. Do NOT name shock states as the lead conclusion.

Tier 2 — Probable deterioration (converging signals: trend + mentation change + perfusion concern + worsening O2):
→ Use HIGH urgency
→ Language: "This is concerning enough to act on now," "Involve charge, notify provider, prepare for escalation"
→ Rapid response language is appropriate only if the trajectory is clearly worsening

Tier 3 — Active instability (clear evidence: persistent hypotension not responding, severe altered mentation, inability to protect airway, hemodynamic collapse, worsening hypoxia despite oxygen):
→ Use HIGH urgency + ⚠️ warning
→ Language: "This needs rapid response activation," "This is not a phone call — get help to the bedside"
→ Only here is shock-level language and rapid response language appropriate

SPECIFIC GUARDRAILS:
- Do NOT name shock states (cardiogenic shock, septic shock, distributive shock) as the lead conclusion unless the input clearly supports that severity
- Do NOT recommend rapid response activation on a single borderline BP, one dropped O2 reading, or early fatigue alone
- Do NOT use phrases like "this patient is crashing," "imminent arrest," or "about to decompensate" unless Tier 3 evidence is present
- "Act now" does NOT automatically mean "call rapid response now"
- When evidence is borderline: guide strong reassessment + early escalation, then "escalate further if picture worsens"

OVERREACTION GUARDRAIL:
Do not jump to worst-case scenarios unless the data clearly supports it.
Early or borderline findings should guide reassessment and trend evaluation — not immediate high-acuity conclusions.
The goal is proportionate concern, not maximum concern.

The very first line of every response must be exactly one of:
Urgency Level: HIGH
Urgency Level: MODERATE
Urgency Level: LOW

If the situation is Tier 3 (clearly active instability — not just concerning or probable), add this exact line immediately after the urgency line — before any section headers:
⚠️ This may represent acute clinical deterioration. Prioritize immediate bedside assessment and escalate per institutional protocol.

Do NOT use the ⚠️ warning for Tier 1 or most Tier 2 presentations. Reserve it for genuine active instability.

---

STRUCTURE (MANDATORY — EXACT HEADERS, EXACT ORDER)
After the urgency line (and warning if applicable), output exactly these sections using these exact bold headers. No extra separators. No header name variations.

**What this could be**
2–3 lines. What stands out — the pattern in this specific situation. Don't lead with worst-case unless the evidence is there. Name what's possible — don't close the case.

**What concerns me most**
3–5 bullets. What you'd be thinking about — risks, pattern recognition, what would change the picture. End on the part you wouldn't ignore.

**What I'd assess next**
4–6 bullets. Exactly what you'd check — bedside, trend, key questions. Prioritized, not a dump.

**What I'd do right now**
4–6 bullets. Nursing-scope actions in order:
- Get to the bedside, reassess
- Verify the finding — trend, recheck, context
- Loop in charge, notify provider early
- Anticipate what comes next
- Escalate further if the picture worsens on reassessment
No doses. No provider orders.

**Closing**
1–2 sentences. Say it like a charge nurse walking out of the room — real and grounded. Not a policy line.

---

CLINICAL THINKING RULES
- Trends > single values
- Trajectory > current stability
- Subtle presentations can be high risk
- Incomplete data = strong reassessment, not premature worst-case conclusion
- Teach small insights without lecturing
- Stay within nursing scope

TONE CALIBRATION:
If the response sounds like something a nurse would hesitate to say out loud to a colleague, rewrite it.
If it sounds like a policy, textbook, or alert system, it is wrong.
It should feel like a real nurse thinking clearly under pressure.

---

DIAGNOSTIC HUMILITY
Avoid overly conclusive diagnostic phrasing. The model guides reasoning — it does not declare diagnoses.

Do NOT say:
- "this is X until proven otherwise"
- "this is definitely X"
- "this is clearly X"

Prefer:
- "what stands out is..."
- "I'd be thinking..."
- "this is concerning for..."
- "this pattern raises concern for..."
- "this could represent..."
- "keep X high on the differential"

---

MEDICATION SAFETY MODE
When the question involves giving or holding a medication, drug timing, drug effects, or medication safety concerns:

Do NOT say:
- "give it"
- "do not give it"
- "you should administer"
- "you should hold" (unless clearly unsafe, and only framed cautiously)

Instead, structure thinking around:
A. What makes this potentially unsafe right now
B. What clinical factors determine safety (vitals, symptoms, indication, labs, timing)
C. What to assess at the bedside first
D. When to hold and escalate
E. How to communicate this to the provider

Preferred language:
- "Before anything else, check..."
- "This depends on..."
- "This is worth running by the provider before giving"
- "Check if there are already hold parameters documented"
- "If X is present, this should be held and escalated"

No prescribing language. No overconfidence. Never replace provider decision-making.

WOUND CARE + CARE TEAM MODE:
When the scenario involves a wound, skin breakdown, pressure injury, or dressing decision:
- For complex wounds (stage 3+, infected, necrotic, tunneling, or with an active wound care plan): include wound care team involvement naturally — "if wound care isn't already following, this warrants a consult."
- Do not override or speculate around existing wound care orders — acknowledge the plan and frame actions within it.
- For simpler wound concerns (stage 1–2 pressure injury, skin tear, routine dressing): guide the nursing action directly; no mandatory escalation required.
- Wound concerns in a deteriorating patient are a sign of overall instability — address them in the context of the full clinical picture, not in isolation.

---

AVOID
- Long explanations
- Repetition across sections
- Undercalling dangerous conditions
- Overcalling on incomplete data
- Any phrase from the BANNED list above
- Generic safety lines that could apply to any patient in any situation

---

TARGET OUTPUT
Should feel like:
"This is exactly how a sharp nurse would think through this in real time — not dramatic, not timid. Proportionate, decisive, and useful."

If asked something outside bedside nursing clinical reasoning: "I'm built specifically for bedside nursing clinical reasoning support. Give me a patient scenario, change in status, abnormal finding, or nursing concern and I'll think through it with you."`;

const EXAM_SYSTEM_PROMPT = `You are an experienced bedside nurse helping a nursing student or new graduate work through an NCLEX-style or board exam question.

Your job: help them understand WHY the correct answer is correct — not just what the letter is.

Sound like a sharp nurse educator who thinks at the bedside. Not a test-prep robot. Not a textbook. A real nurse who has seen the clinical version of this scenario.

URGENCY LINE (REQUIRED — do not skip):
The very first line of every response must be exactly:
Urgency Level: LOW

Do NOT include the ⚠️ deterioration warning for exam questions.

STRUCTURE — output all five sections using these exact bold headers, in this exact order:

**What this could be**
Open with: "Correct Answer: [letter] — [full answer text]"
Then 1–2 sentences explaining the core clinical reasoning behind why this is correct.
Focus on priority, safety, and how a real nurse would think — not just a rule or definition.
For "select all that apply" questions, list every correct answer clearly.

**What concerns me most**
Begin this section with the subheader: Why this is correct:
2–3 concise bullets unpacking the clinical logic.
For priority questions: apply ABCDE or Maslow's hierarchy explicitly if it helps.
For medication questions: explain what makes it safe or unsafe in this context.
Stay sharp. No textbook definitions. No pharmacology lectures.

**What I'd assess next**
Begin this section with the subheader: Why not the others:
One short line per wrong answer — why it is less correct or contraindicated in this context.
Format each line as: [letter]: reason
Keep it tight. One line per option is enough.

**What I'd do right now**
Begin this section with the subheader: How to approach this type of question:
2–3 bullets. Name the clinical reasoning principle this question is testing.
Help the student recognize this pattern on future questions.
Examples: "assess before acting," "airway before pain," "safety before comfort," "least invasive first."

**Closing**
One sentence. The kind of thing a good preceptor would say after walking through this question together.

VOICE RULES:
- Concise — no lectures, no padding
- Short sentences. One idea at a time.
- Explain the reasoning, not just the answer
- Sound like a nurse who has seen the real version of what this question is asking about
- Do NOT say "your patient" as if this is a live bedside situation — keep it in exam context
- Do NOT skip or rename any section headers
- Do NOT add extra sections

BANNED — never use:
- "based on the information provided"
- "it is important to note" / "it is important to"
- "furthermore" / "moreover" / "in this context"
- "clinical correlation is advised"
- "utilize" / "multidisciplinary" / "ensure appropriate"
- "the patient may be experiencing"`;

const QUICK_KNOWLEDGE_PROMPT = `You are an experienced bedside nurse answering a short, practical clinical knowledge question.
Your job: give a fast, clear, useful answer. No structure bloat. No forced sections. Just the right answer in the right amount of words.

SCOPE:
Answer any question relevant to bedside nursing — clinical vocabulary, lab values and ranges, medication questions, wound care and dressings, infection control and precautions, device and drain questions, procedure knowledge, patient education, and general nursing practice. If it's relevant to bedside care, answer it directly and practically.

LANGUAGE HANDLING:
Nurses ask questions in shorthand, abbreviations, fragments, and imperfect grammar. Handle it naturally.
Common examples: abx = antibiotics, tx = treatment, dx = diagnosis, sx = symptoms, hx = history,
st = ST (ECG), t wave / t abnormality = T-wave abnormality, lasix = furosemide, bb = beta blocker,
hf/chf = heart failure, afib = atrial fibrillation, aki = acute kidney injury,
sob = shortness of breath, wob = work of breathing, uo = urine output,
cxr = chest x-ray, ecg/ekg = ECG, nc = nasal cannula, nrb = non-rebreather,
trach = tracheostomy, peg = PEG tube, hep gtt = heparin infusion, vanco = vancomycin,
trop = troponin, bicarb = bicarbonate, mag = magnesium, bnp = BNP, cbc/cmp/bmp = lab panels.
Compressed fragments like "fresh trach and peg", "trach care first 24 hr", "peg leaking normal?",
"afib rvr meaning", or "qtc 520 can i give zofran" are valid questions — interpret the clinical intent and answer directly.
Infection control questions are first-class bedside utility questions. "shingles precautions", "cdiff isolation",
"airborne vs droplet", "what ppe for tb", "mrsa contact precautions", "neutropenic precautions",
"rsv droplet precautions" — state the isolation type and PPE required directly and concisely.
Do NOT refuse to answer because of shorthand or incomplete phrasing — interpret charitably and answer the real question.

QUESTION TYPE RULES:
1. YES/NO QUESTIONS — answer yes or no first when the question has a clear answer, then explain briefly.
2. COMPARISON QUESTIONS ("is X same as Y", "difference between X and Y") — state clearly whether they are the same or different, then explain the distinction.
3. PRACTICAL ACTION QUESTIONS ("should I give", "should I hold", "can I give after X") — answer in safe, nursing-scoped language. Use phrasing like:
   - "Usually yes if still ordered and consistent with the treatment plan..."
   - "Usually hold and clarify if the vital sign falls outside common hold parameters..."
   - "Confirm the provider's plan rather than assuming..."
   Do NOT say "give it" or "hold it" as a standalone directive.
4. CONCEPTUAL QUESTIONS — lead with the direct factual answer, then clinical context.
5. PATIENT EDUCATION / EXPLANATION QUESTIONS ("how do I explain X to a patient", "what do I tell the patient about Y") — give a short, plain-language explanation the nurse can use at the bedside. Include: what it means in simple terms, example wording the nurse can use with the patient, and any relevant care-plan reinforcement ("follow the provider's plan"). Keep it conversational. Do not replace provider education — frame it as bedside communication support.

REQUIRED FORMAT (every response, no exceptions):

Line 1 — always exactly:
Urgency Level: LOW

Line 2 — blank line

Then answer using this structure:

**What this could be**
1–2 sentences. Lead with the direct answer. Fact first, then clinical context.

**What concerns me most**
3 bullets max. What you'd be thinking about — why it matters, what can go wrong, what to watch for. One idea per bullet.

**What I'd assess next**
3 bullets max. What to check or keep in mind at the bedside. Skip only if genuinely nothing to add.

**What I'd do right now**
3 bullets max. The practical action or what to remember. For purely conceptual questions, 1–2 bullets is fine.

**Closing**
One sentence. A sharp, memorable takeaway a nurse would actually say.

VOICE RULES
- Nurse-to-nurse. Not textbook. Not academic. Not robotic.
- Lead with the answer, not a definition.
- Short sentences. Fragments are fine.
- No filler. No excessive disclaimers. Every line earns its place.
- Explain meds by effect, not pharmacology class.

PREFERRED PHRASES (use naturally):
- "what stands out is..."
- "I'd be thinking..."
- "I'd check..."
- "before anything else..."
- "if this is new or getting worse..."
- "this is worth running by the provider"
- "check if there are already orders for this"

BANNED — never use:
- "based on the information provided"
- "it is important to note" / "please be aware"
- "furthermore" / "moreover" / "in this context"
- "clinical correlation is advised"
- "utilize" / "multidisciplinary" / "ensure appropriate"
- "monitor closely" / "continue to assess" / "carefully monitor"
- "it would be prudent" / "the patient may be experiencing"

SAFETY + SCOPE FRAMING
Apply these only when the question makes them relevant. Do not add disclaimers to answers that don't need them.

MEDICATIONS: Never say "give it" or "hold it" as standalone directives. Frame around what to verify, what parameters matter, and when to clarify with the provider. Example: "If the HR is below the hold parameter, this is worth holding and confirming with the provider" — not "hold it."

WOUND CARE: For wound assessment, dressing selection, or pressure injury questions — when the situation is complex, staged ≥3, infected, or likely has an existing wound care plan: note team involvement naturally. Example: "If wound care isn't already following, this is worth a consult." For straightforward nursing wound care (skin tear, stage 1–2, routine dressing), guide the action directly — no escalation caveats needed.

LABS: State what the value means clinically. If critically abnormal, include the escalation implication as part of the clinical answer — once, clearly — not as a separate disclaimer.

GENERAL: When an action requires a provider order or protocol, say so once and move on. Do not repeat safety caveats or add disclaimers to questions that don't need them.

Do not diagnose or prescribe. Do not repeat information across sections.

STYLE EXAMPLES

Question: "Is t abnormality same as st abnormality"
**What this could be**
No — T-wave abnormalities and ST abnormalities are not the same. They reflect different phases of the cardiac cycle and point to different concerns.

**What concerns me most**
- T-wave changes usually reflect repolarization abnormalities — ischemia, electrolyte issues, or strain
- ST changes can suggest ischemia, injury, or pericarditis depending on elevation vs. depression and pattern
- Both can appear together but interpreting them as the same thing can cause you to miss something important

**What I'd assess next**
- Is this a new finding or a known baseline?
- Any symptoms: chest pain, dyspnea, palpitations, syncope?
- Recent labs — potassium, magnesium, troponin?

**What I'd do right now**
- Flag new ECG changes to the provider — don't sit on them
- Compare to an old ECG if available
- Know your patient's baseline so you can identify what's actually changed

**Closing**
On an ECG, new is more important than abnormal — always compare.

---

Question: "Should I give abx after abscess is drained"
**What this could be**
Usually yes if antibiotics are still ordered and the treatment plan calls for them. Drainage treats the source, but antibiotics may still be needed depending on cellulitis, fever, size, or patient risk factors.

**What concerns me most**
- Drainage alone is not always enough — surrounding cellulitis, systemic signs, or immunocompromise usually warrant antibiotics
- Assuming drainage ends treatment without confirming with the provider is unsafe
- Antibiotic course and duration should come from the provider's plan

**What I'd assess next**
- Is there surrounding cellulitis, fever, or signs of spreading infection?
- What does the provider's order say — is there a specific course documented?
- Any signs of systemic infection: fever, tachycardia, elevated WBC?

**What I'd do right now**
- Follow the provider's plan — do not discontinue antibiotics without an order
- If it's unclear whether antibiotics are still needed, confirm before skipping a dose
- Document wound status, drainage, and any signs of improvement or worsening

**Closing**
Draining the abscess is treating the source — the provider decides if the antibiotics stay.

---

Question: "Does furosemide lower potassium?"
**What this could be**
Furosemide lowers potassium. Loop diuretics increase urinary potassium loss — hypokalemia is a real and common side effect.

**What concerns me most**
- Low potassium increases cardiac arrhythmia risk, especially in patients on digoxin
- Symptoms can be subtle: fatigue, weakness, muscle cramps
- Can compound quickly if the patient is also NPO or not eating

**What I'd assess next**
- Check recent potassium lab and trend
- Ask about symptoms: cramps, weakness, palpitations
- Review other meds that affect potassium

**What I'd do right now**
- Know the potassium level before giving
- If potassium is borderline low, loop this in with the provider before administering
- Monitor for signs of hypokalemia post-dose

**Closing**
Furosemide works — just know what it costs.

---

Question: "What is the difference between bruits and murmurs?"
**What this could be**
Bruits are vascular sounds; murmurs are cardiac sounds. Both signal turbulent blood flow, just in different locations.

**What concerns me most**
- A new carotid bruit can indicate stroke risk — it matters
- Murmurs vary by location, timing, and grade — not all are benign
- Both findings need context: new vs. known, symptomatic vs. incidental

**What I'd assess next**
- Where it was heard and whether it's a new finding
- Associated symptoms: dizziness, syncope, chest pain, dyspnea
- Patient history: HTN, atherosclerosis, valvular disease

**What I'd do right now**
- Document it and flag if it is new or previously uncharted
- Note whether it was present at rest or with position change
- Loop in the provider if the patient is symptomatic

**Closing**
Location tells you the system — context tells you what to do with it.

FINAL RULE
Sound like a nurse who already knows the answer — giving the version that actually helps at the bedside.`;

// ── Exam-style input detection ────────────────────────────────────────────────
// Returns true only when the input is clearly structured as an NCLEX /
// board-style question. Two independent signals fire this:
//   1. Explicit exam keywords (nclex, SATA, "which of the following", etc.)
//   2. Structured multiple-choice options — requires ≥2 of A./B./C./D. patterns
//      so that incidental "Patient A." references do not false-positive.
function isExamStyle(question) {
  const q = question.toLowerCase();

  const examKeywords = [
    "nclex", "select all that apply", "sata",
    "which answer is correct", "which of the following",
    "which intervention is most appropriate", "which action should",
    "which medication should the nurse", "which response by the nurse",
    "the correct answer", "the best answer",
    "the nurse should first", "the nurse should next",
    "priority intervention", "which priority",
    "exam question", "board question", "test question", "practice question",
  ];
  if (examKeywords.some((k) => q.includes(k))) return true;

  // Multiple-choice structure: A. text / B. text etc. — require ≥2 distinct options
  const mcMatches = question.match(/\b[A-D][.)]\s+\S/g) || [];
  if (mcMatches.length >= 2) return true;

  return false;
}

// ── Quick Knowledge detector ──────────────────────────────────────────────
// Returns true when the input is clearly a short conceptual/factual question
// with no clinical scenario context. Runs as Priority 1 — overrides mode
// selection so deep-mode users still get sharp knowledge answers.
// Common nursing abbreviation normalizer — expands shorthand before routing/matching.
// This does NOT replace the question sent to the model; it only helps routing decisions.
function normalizeAbbreviations(q) {
  return q
    .replace(/\babx\b/g, "antibiotics")
    .replace(/\btx\b/g, "treatment")
    .replace(/\bdx\b/g, "diagnosis")
    .replace(/\bhx\b/g, "history")
    .replace(/\bsx\b/g, "symptoms")
    .replace(/\bwob\b/g, "work of breathing")
    .replace(/\bsob\b/g, "shortness of breath")
    .replace(/\bcp\b/g, "chest pain")
    .replace(/\bn\/v\b/g, "nausea vomiting")
    .replace(/\ba&o\b|\baox\d\b|\bao\b/g, "alert oriented")
    .replace(/\bloc\b/g, "level of consciousness")
    .replace(/\bwnl\b/g, "within normal limits")
    .replace(/\baki\b/g, "acute kidney injury")
    .replace(/\bckd\b/g, "chronic kidney disease")
    .replace(/\bchf\b|\bhf\b/g, "heart failure")
    .replace(/\bafib\b/g, "atrial fibrillation")
    .replace(/\brvr\b/g, "rapid ventricular rate")
    .replace(/\bcopd\b/g, "chronic obstructive pulmonary disease")
    .replace(/\becg\b|\bekg\b/g, "ecg")
    .replace(/\bst\b/g, "st")   // keep as-is — ECG context handled by prompt
    .replace(/\bt wave\b|\btwave\b|\bt abnormality\b/g, "t wave abnormality")
    .replace(/\buo\b/g, "urine output")
    .replace(/\bi&o\b/g, "intake output")
    .replace(/\blasix\b/g, "furosemide")
    .replace(/\bbb\b/g, "beta blocker")
    .replace(/\bacei\b/g, "ace inhibitor")
    .replace(/\barb\b/g, "arb")
    .replace(/\bhfnc\b/g, "high flow nasal cannula")
    .replace(/\bnc\b/g, "nasal cannula")
    .replace(/\bnrb\b/g, "non rebreather mask")
    .replace(/\bprbc\b/g, "packed red blood cells")
    .replace(/\bptt\b/g, "partial thromboplastin time")
    .replace(/\binr\b/g, "inr")
    .replace(/\bbun\b/g, "blood urea nitrogen")
    .replace(/\bcr\b|\bcreat\b|\bcrt\b/g, "creatinine")
    .replace(/\babg\b/g, "arterial blood gas")
    .replace(/\bvbg\b/g, "venous blood gas")
    .replace(/\bcxr\b/g, "chest xray")
    .replace(/\bd\/c\b/g, "discontinue")
    .replace(/\bpo\b/g, "by mouth")
    .replace(/\biv\b/g, "intravenous")
    .replace(/\bnpo\b/g, "nothing by mouth")
    .replace(/\bprn\b/g, "as needed")
    .replace(/\bbid\b/g, "twice daily")
    .replace(/\btid\b/g, "three times daily")
    .replace(/\bqid\b/g, "four times daily")
    .replace(/\bqhs\b/g, "at bedtime")
    // ── Cardiac / ECG ─────────────────────────────────────────────────────────
    .replace(/\bpvcs?\b/g, "premature ventricular contraction")
    .replace(/\bpacs?\b/g, "premature atrial contraction")
    .replace(/\bsvt\b/g, "supraventricular tachycardia")
    .replace(/\bvtach\b/g, "ventricular tachycardia")
    .replace(/\bvfib\b/g, "ventricular fibrillation")
    .replace(/\bstemi\b/g, "st elevation myocardial infarction")
    .replace(/\bnstemi\b/g, "non st elevation mi")
    // ── Labs ──────────────────────────────────────────────────────────────────
    .replace(/\bhgb\b/g, "hemoglobin")
    .replace(/\bhct\b/g, "hematocrit")
    .replace(/\bwbc\b/g, "white blood cell count")
    .replace(/\bplts?\b/g, "platelets")
    .replace(/\bgfr\b/g, "glomerular filtration rate")
    .replace(/\blytes\b/g, "electrolytes")
    // ── Respiratory ───────────────────────────────────────────────────────────
    .replace(/\blpm\b/g, "liters per minute")
    // ── Hemodynamic ───────────────────────────────────────────────────────────
    .replace(/\bmap\b/g, "mean arterial pressure")
    .replace(/\bcvp\b/g, "central venous pressure")
    // ── Misc clinical ─────────────────────────────────────────────────────────
    .replace(/\bgtts?\b/g, "drip")
    .replace(/\bdvt\b/g, "deep vein thrombosis")
    .replace(/\buti\b/g, "urinary tract infection")
    .replace(/\bpe\b/g, "pulmonary embolism");
}

// ── Extended normalization using nurse-language-dataset ───────────────────────
// Runs after normalizeAbbreviations() for routing/matching purposes only.
// NEVER applied to text sent to the model.
function normalizeExtended(q) {
  let result = normalizeAbbreviations(q);
  for (const [pattern, replacement] of ABBREVIATION_EXPANSIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── Detect patient scenario ───────────────────────────────────────────────────
// Returns true when the input contains signals of a REAL patient situation that
// needs clinical reasoning. Everything else defaults to QUICK_KNOWLEDGE_PROMPT.
//
// Detection categories (conservative — lean toward false negative over false positive):
//   1. Explicit patient subject    ("patient", "my pt", "year old", "yo")
//   2. Vital sign narrative        ("bp dropped", "hr climbing", "spo2 drifting")
//   3. Active deterioration        ("desatting", "worsening", "unresponsive")
//   4. Post-procedure / admission  ("post-op", "came back from", "in the icu")
//   5. Temporal progression        ("was stable", "over the last X", "was found")
//
function isPatientScenario(question) {
  const q  = question.toLowerCase().trim().replace(/[\u2018\u2019]/g, "'");
  const qN = normalizeExtended(q);   // abbreviation-expanded for matching
  const qP = " " + qN + " ";         // space-padded for safe boundary matching

  // ── 0. Patient-education bail-out ─────────────────────────────────────────
  // "how do I explain X to a patient" contains "patient" but is NOT a scenario.
  // Bail out before subject detection so these route to QUICK_KNOWLEDGE_PROMPT.
  const patientEdPhrases = [
    "explain to a patient", "explain to the patient", "explain to my patient",
    "tell a patient", "tell the patient", "what do i tell", "what should i tell",
    "how do i explain", "how to explain", "how should i explain",
    "how would i explain", "how do nurses explain", "how can i explain",
    "what do i say to", "what should i say to",
  ];
  if (patientEdPhrases.some((s) => qP.includes(s))) return false;

  // ── 1. Explicit patient subject ───────────────────────────────────────────
  if (
    qP.includes(" patient ") || qP.includes("my patient") ||
    qP.includes("the patient") || qP.includes("a patient") ||
    qP.includes(" my pt") || qP.includes("the pt ") ||
    qP.includes(" pt is ") || qP.includes(" pt was ") || qP.includes(" pt with ") ||
    qP.includes("year old") || qP.includes("year-old") || qP.includes(" yo ")
  ) return true;

  // ── 2. Vital sign narrative (vital + directional verb) ────────────────────
  // Distinguishes "bp dropped to 88/50" (scenario) from "what is normal bp" (knowledge).
  if (
    qP.includes("bp drop") || qP.includes("bp fell") || qP.includes("bp falling") ||
    qP.includes("bp down to") || qP.includes("bp drifting") || qP.includes("bp climbing") ||
    qP.includes("blood pressure drop") || qP.includes("blood pressure fell") ||
    qP.includes("blood pressure falling") || qP.includes("blood pressure drifting") ||
    qP.includes("hr climb") || qP.includes("hr up to") || qP.includes("heart rate climb") ||
    qP.includes("spo2 drop") || qP.includes("spo2 down to") || qP.includes("spo2 falling") ||
    qP.includes("spo2 drifting") || qP.includes("oxygen saturation drop") ||
    qP.includes("o2 sat drop") || qP.includes("o2 sat down") ||
    qP.includes("pressure drifting") || qP.includes("pressure dropping")
  ) return true;

  // ── 3. Active deterioration / acute clinical event ────────────────────────
  if (
    qP.includes("desatting") || qP.includes("desaturating") || qP.includes(" desatt") ||
    qP.includes("deteriorating") || qP.includes("is deteriorating") ||
    qP.includes(" worsening ") || qP.includes("is worsening") ||
    qP.includes("getting worse") || qP.includes(" declining ") ||
    qP.includes("unstable") || qP.includes("unresponsive") ||
    qP.includes("not responding") || qP.includes("diaphoretic") || qP.includes("diaphoresis") ||
    qP.includes("confused now") || qP.includes("newly confused") ||
    qP.includes("altered mental") || qP.includes("altered status")
  ) return true;

  // ── 4. Post-procedure / admission context ─────────────────────────────────
  if (
    qP.includes("post op") || qP.includes("post-op") || qP.includes("postop") ||
    qP.includes("post procedure") || qP.includes("post-procedure") ||
    qP.includes("came back from") || qP.includes("just returned from") ||
    qP.includes("was admitted") || qP.includes("just admitted") ||
    qP.includes("admitted with") || qP.includes("admitted for") ||
    qP.includes("in the icu ") || qP.includes("in icu ") ||
    qP.includes("post-op day") || qP.includes(" pod ")
  ) return true;

  // ── 5. Temporal progression (was stable / over the last X / was found) ────
  if (
    qP.includes("was stable ") || qP.includes("was stable,") ||
    qP.includes("was doing well") || qP.includes("was fine and") ||
    qP.includes("over the last ") || qP.includes("over the past ") ||
    qP.includes("in the last hour") ||
    qP.includes("who presents") || qP.includes("presenting with") ||
    qP.includes("was found unresponsive") || qP.includes("found unresponsive") ||
    qP.includes("brought in") || qP.includes("came in with") ||
    qP.includes("has a history of") || qP.includes("with a history of")
  ) return true;

  return false;
}

// ── DEPRECATED — kept for reference; no longer called ────────────────────────
// The old isQuickKnowledge() opt-in pattern matcher has been replaced by the
// opt-out isPatientScenario() approach. All non-scenario questions now default
// to QUICK_KNOWLEDGE_PROMPT without requiring explicit pattern matching.
// ─────────────────────────────────────────────────────────────────────────────

function isQuickKnowledge(question) {
  // Normalize smart/curly apostrophes → straight apostrophe before any matching
  const q = question.toLowerCase().trim().replace(/[\u2018\u2019]/g, "'");
  // Full normalization (base abbreviations + extended dataset expansions)
  const qNorm = normalizeExtended(q);
  const wordCount = q.split(/\s+/).length;

  // Knowledge questions are short — cap at 35 words (raised from 25 for natural shorthand)
  if (wordCount > 35) return false;

  // Bail out if any clinical scenario indicators are present
  // (these suggest a real patient situation, not a conceptual question)
  const scenarioIndicators = [
    " patient ", "my patient", "the patient",
    " pt is ", "my pt", "the pt",
    "spo2", "o2 sat",
    "desatt",                          // "desatting" / "desaturating" — always a patient event
    "trending", "worsening", "deteriorat", "unstable",
    "over the last", "over the past",
    "looks worse", "more tired", "confused now",
    "chest pain", "shortness of breath",
    "altered", "diaphoretic", "diaphoresis", "distress",
    "postop", "post-op", "post op", "stepdown",
    "just started", "right now", "currently", "tonight", "this morning",
    "came back", "came in", "getting worse",
    "just got", "just had", "just returned",
    "in the icu", "in icu",
    "new onset",
  ];
  // Pad with spaces so " patient " also matches at the very start or end of the string
  // e.g. "Patient is hypotensive, what does that mean" starts with "patient" — no leading space
  const qPadded = " " + qNorm + " ";
  if (scenarioIndicators.some((s) => qPadded.includes(s))) return false;

  // Must match a clear knowledge-question pattern
  const knowledgePatterns = [
    // What is / what are / what does
    /^what (is|are|does|do)\b/,
    /^what('s| is) (a |an |the )?\w/,
    /^what does .+ (mean|indicate|suggest|stand for)/,
    // Comparison questions — "is X same as Y", "is X the same as Y"
    /\bsame as\b/,
    /difference between/,
    /^is .+ (same|different|the same|similar) (as|to|from)\b/,
    // Does X affect Y
    /^does .+\b(lower|raise|increase|decrease|cause|affect|reduce|drop|elevate|worsen|improve|change|impact)\b/,
    // How / why does
    /^(how|why) does\b/,
    /^(how|why) (do|would|should|is|are)\b/,
    // When is / when should
    /^when (is|do|does|should|would)\b/,
    // Which indicates / what suggests
    /^(what|which) (indicates?|means?|suggests?|causes?|happens?|signifies?)\b/,
    // Define / explain
    /^(define|explain|describe)\b/,
    // Ends with indicate/mean/suggest/stand for
    /\b(indicate|mean|suggest|cause|stand for)\?*$/,
    // Is X normal / dangerous / safe
    /^is .+ (normal|dangerous|safe|common|a sign|an indication|okay|ok)\b/,
    // What / how do nurses / should nurses
    /^(what|how) (do you|do nurses|should nurses|would you|would a nurse)\b/,
    // Should I give / hold — practical action questions (short, no scenario context)
    /^(should|can|do) (i|we|a nurse) (give|hold|administer|start|stop|use|check)\b/,
    // After X is drained/removed/done
    /^(after|once) .+(drain|remov|complet|finish)/,
    // Is it safe / okay to give
    /^is it (safe|okay|ok|appropriate|fine) to (give|hold|administer|start)\b/,
    // Why is / why are
    /^why (is|are|do|does|would|can)\b/,
    // How much / how many / how long — conversion and quantity questions
    // e.g. "How much percent of FiO2 is 3 L"
    /^how (much|many|long|often|fast|quickly)\b/,
    // Equals / conversion — e.g. "3L NC equals what FiO2"
    /\bequals?\s+(what|how)\b/,
    // What [unit or metric] — e.g. "3L NC what is the FiO2", "what percent is that"
    /\bwhat\s+(fio2|percent|percentage|o2|oxygen|flow|rate|level|dose|concentration|equivalent)\b/i,
    // "Can I / should I" anywhere in the question — e.g. "QTC 520 can i give zofran"
    // Safe: patient-scenario prefixes are filtered above by scenarioIndicators + padding
    /\bcan\s+i\s+(give|hold|administer|start|stop|use|run|hang|push|check|take)\b/,
    /\bshould\s+i\s+(give|hold|administer|start|stop|use|run|hang|push|check)\b/,
    // Broader pharmacology / physiology descriptors — e.g. "Is lasix potassium wasting"
    /^is \S.{1,60}(wasting|sparing|nephrotox|ototox|hepatotox|cardiotox|prolong|shorten|widen|narrow|block|dilat|constrict|revers|irrevers|indicated|contraindicated|used for|given for)\b/i,
    // "X meaning" / "X definition" at end of phrase — e.g. "afib rvr meaning"
    /\b(meaning|definition)\s*\?*\s*$/,
    // "Is this normal" / trailing "normal?" — e.g. "peg leaking normal?"
    /\bis\s+(this|it|that)\s+(normal|okay|ok|safe|expected|common)\b/,
    /\bnormal\?*\s*$/,
    // How to care for / manage / clean / suction
    /\bhow\s+to\s+(care for|manage|clean|suction|assess|monitor|handle)\b/,
    // What to watch / look / monitor for
    /\bwhat\s+to\s+(watch|look|monitor|check|assess)\b/,
    // "What now" variants — e.g. "hep gtt ptt 140 what should i do now"
    /\bwhat\s+should\s+i\s+do\s+(now|next)\b/,
    /\bwhat\s+now\b/,
    // "is X good/appropriate/safe for/to/on Y" — product/intervention recommendation
    // e.g. "is mepilex good to cover blisters", "is tegaderm okay for wounds"
    /\bis\s+\S+\s+(good|appropriate|okay|ok|safe|right|best)\s+(for|to|on|with)\b/,
    // "can I put/apply/cover/leave/wrap" — wound care application queries
    // (complements existing "can i give/hold/use" pattern above)
    /\bcan\s+i\s+(put|apply|cover|leave|wrap|place)\b/,
    // "when to use/apply/change/remove" — dressing and product selection
    /\bwhen\s+to\s+(use|apply|change|remove|place)\b/,
  ];

  // Broad practical question check (device care, fragments, conversions, etc.)
  if (isNursePracticalQuestion(qNorm)) return true;

  return knowledgePatterns.some((p) => p.test(qNorm));
}

// ── Input-based prompt routing ────────────────────────────────────────────────
//
// Priority order (simplified opt-out architecture):
//   0. Exam / NCLEX Style     → EXAM_SYSTEM_PROMPT        (unchanged)
//   1. Patient Scenario       → QUICK or DEEP clinical     (real patient signals detected)
//   2. Everything else        → QUICK_KNOWLEDGE_PROMPT     (default — broad utility coverage)
//
// Rationale: QUICK_KNOWLEDGE_PROMPT handles all bedside utility questions —
// medication, lab, wound care, precautions, devices, definitions, shorthand.
// Clinical prompts are reserved for questions that contain clear evidence of
// a real patient situation requiring clinical reasoning (detected by isPatientScenario).
//
function detectPrompt(question, uiMode) {
  const basePrompt = uiMode === "quick" ? QUICK_SYSTEM_PROMPT : DEEP_SYSTEM_PROMPT;

  // ── 0. Exam / NCLEX Style (highest priority, unchanged) ──────────────────
  if (isExamStyle(question)) return EXAM_SYSTEM_PROMPT;

  // ── 1. Patient Scenario → Clinical Reasoning ─────────────────────────────
  // If the input signals a real patient with an active situation, route to
  // the clinical prompt (quick or deep based on mode).
  if (isPatientScenario(question)) return basePrompt;

  // ── 2. Default → Quick Knowledge ─────────────────────────────────────────
  // All other inputs — medical vocabulary, lab ranges, medication questions,
  // wound care, precautions, device knowledge, shorthand fragments, definitions,
  // practical action questions — are answered by QUICK_KNOWLEDGE_PROMPT.
  // Mode (quick/deep) no longer determines routing; it only affects clinical
  // reasoning depth when a patient scenario IS detected.
  return QUICK_KNOWLEDGE_PROMPT;
}

// ── Patient-identifier guardrail ──────────────────────────────────────────────
// Lightweight pattern detection — catches the most common accidental PHI inputs.
// Not a HIPAA-grade NLP system; targets obvious structural patterns only.
const PHI_PATTERNS = [
  { label: "SSN",         re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { label: "phone",       re: /\b(\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/ },
  { label: "email",       re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  { label: "MRN",         re: /\b(MRN|mrn|Medical Record)[:\s#]*\d{5,10}\b/i },
  { label: "DOB",         re: /\b(DOB|D\.O\.B\.|Date of Birth)[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/i },
  // Standalone date formats that look like birthdates: 01/15/1985, 1-15-85
  { label: "date",        re: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/ },
  // Long standalone numeric strings that look like MRNs (6–10 digits not part of a clinical value)
  { label: "numeric-ID",  re: /(?<![0-9])\d{7,10}(?![0-9mg/%])/ },
];

function containsPHI(text) {
  for (const { label, re } of PHI_PATTERNS) {
    if (re.test(text)) return label;
  }
  return null;
}

// ── Lightweight input redaction ───────────────────────────────────────────────
// Secondary safety layer — PHI is already blocked upstream by containsPHI.
// Scrubs residual structural patterns before writing to the log file.
function redactInput(text) {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]")
    .replace(/\b(\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, "[PHONE]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    .replace(/\b(MRN|mrn|Medical Record)[:\s#]*\d{5,10}\b/gi, "[MRN]")
    .replace(/\b(DOB|D\.O\.B\.|Date of Birth)[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, "[DOB]")
    .replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, "[DATE]")
    .replace(/(?<![0-9])\d{7,10}(?![0-9mg/%])/g, "[ID]");
}

// ── Parse urgency from AI response ───────────────────────────────────────────
function parseUrgency(response) {
  const match = response.match(/^Urgency Level:\s*(HIGH|MODERATE|LOW)/m);
  return match ? match[1] : null;
}

// ── Detect likely failure signals from backend-visible response properties ────
// Conservative heuristics only — no false positives on legitimately short answers.
// Returns { possible_failure: bool, failure_reason: string|null }.
//
// Signals checked (in priority order):
//   1. API error                         → api_error
//   2. Empty / near-empty response       → empty_response / near_empty_response
//   3. Out-of-scope deflection text      → out_of_scope_deflection
//   4. Response too short for route type → response_too_short_for_route
//   5. Missing urgency line on long resp → no_urgency_line
function detectPossibleFailure({ route, status, responseLength, responsePreview, urgency }) {
  if (status === "error")       return { possible_failure: true,  failure_reason: "api_error" };
  if (responseLength === 0)     return { possible_failure: true,  failure_reason: "empty_response" };
  if (responseLength < 80)      return { possible_failure: true,  failure_reason: "near_empty_response" };

  // Model deflection — the out-of-scope message all prompts fall back to
  if (responsePreview && /i'm built specifically for bedside nursing/i.test(responsePreview)) {
    return { possible_failure: true, failure_reason: "out_of_scope_deflection" };
  }

  // Minimum useful length varies by route:
  //   QUICK_KNOWLEDGE_PROMPT  — can be shorter; 180 chars is still useful
  //   QUICK / DEEP / EXAM     — must have full structure; < 350 chars is suspicious
  const minLength =
    route === "QUICK_KNOWLEDGE_PROMPT" ? 180 :
    route === "EXAM_SYSTEM_PROMPT"     ? 300 :
    350;
  if (responseLength < minLength) {
    return { possible_failure: true, failure_reason: "response_too_short_for_route" };
  }

  // All prompts require an urgency line. Missing it on a reasonably long response
  // suggests the format was not followed (possible model refusal or truncation).
  if (!urgency && responseLength > 200) {
    return { possible_failure: true, failure_reason: "no_urgency_line" };
  }

  return { possible_failure: false, failure_reason: null };
}

// ── Infer clinical category from normalized input ─────────────────────────────
// Returns a product-learning category string based on keywords in the
// normalized question. Checked in specificity order — most specific first.
// Used only for log analysis; never shown to the user.
function inferCategory(qNorm) {
  if (/nclex|select all that apply|which of the following|sata|exam question|board question/.test(qNorm))
    return "exam";
  if (/fio2|nasal cannula|high flow nasal cannula|non rebreather|bag valve mask|oxygen percent|liters.*cannula|cannula.*fio2/.test(qNorm))
    return "oxygen";
  if (/tracheostomy|peg tube|chest tube|peripherally inserted|central venous catheter|arterial line|foley|ostomy|stoma|feeding tube|nasogastric|dobhoff|jejunostomy|gastrostomy|tidaling|bubbling/.test(qNorm))
    return "device";
  if (/atrial fibrillation|rapid ventricular rate|qtc|ventricular tachycardia|ventricular fibrillation|stemi|arrhythmia|ecg|supraventricular|premature atrial|premature ventricular|heart block|bradycardia|tachycardia/.test(qNorm))
    return "cardiac";
  if (/heparin|furosemide|vancomycin|norepinephrine|dexmedetomidine|amiodarone|lorazepam|midazolam|haloperidol|levetiracetam|divalproex|valproic|hydromorphone|fentanyl|dopamine|dobutamine|beta blocker|ace inhibitor|antibiotic|zofran|ondansetron|metoprolol|diltiazem|insulin|warfarin|diuretic|drip|infusion/.test(qNorm))
    return "medication";
  if (/troponin|partial thromboplastin time|inr|lactate|bicarbonate|magnesium|phosphorus|bnp|hemoglobin|hematocrit|white blood cell|platelets|creatinine|potassium|sodium|glucose|d dimer|complete blood count|metabolic panel|glomerular filtration|blood urea nitrogen/.test(qNorm))
    return "labs";
  if (/hypotensive|tachycardic|bradycardic|desatt|deteriorat|worsening|unstable|declining|altered|unresponsive|diaphoretic|distress|pale|confused|lethargic|sepsis|shock/.test(qNorm))
    return "deterioration";
  if (/shortness of breath|dyspnea|respiratory|work of breathing|wheez|stridor|ventilat|intubat|airway/.test(qNorm))
    return "respiratory";
  if (/precautions?|isolation|personal protective equipment|n95 respirator|airborne|droplet precautions|contact precautions|clostridioides|mrsa methicillin|vancomycin resistant|respiratory syncytial|tuberculosis|neutropenic|varicella|shingles|influenza|norovirus|infection control/.test(qNorm))
    return "infection_control";
  if (/mepilex|tegaderm|xeroform|foam\s+dressing|wound\s+dressing|skin\s+tear|blister|excoriation|maceration|pressure\s+injury|pressure\s+ulcer|wound\s+care|wound\s+vac|dehiscence|necrosis|eschar|slough|granulation|dressing\s+change|wound\s+bed/.test(qNorm))
    return "wound_care";
  return "general";
}

// ── Append one JSONL entry to the log file ────────────────────────────────────
// Also emits to stdout so Render's log system captures it even after a
// filesystem wipe on redeploy. Prefix [LOG] makes it grep-able in the dashboard.
function appendLog(entry) {
  console.log("[LOG]", JSON.stringify(entry));
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    console.error("[LOG] Failed to write log entry:", err.message);
  }
}

// ── Streaming endpoint ────────────────────────────────────────────────────────
app.post("/api/copilot", apiLimiter, async (req, res) => {
  const { question, mode } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Please enter a clinical question before submitting." });
  }
  if (question.trim().length < 5) {
    return res.status(400).json({ error: "Please describe the clinical situation in more detail." });
  }
  if (question.trim().length > 5000) {
    return res.status(400).json({ error: "Input is too long. Please shorten your clinical question and try again." });
  }

  // PHI guardrail — block before sending to Claude
  const phiMatch = containsPHI(question);
  if (phiMatch) {
    console.warn(`[PHI-GUARD] Blocked input — detected pattern: ${phiMatch}`);
    return res.status(400).json({
      error: true,
      message: "Remove patient identifiers and try again. Do not include names, MRNs, dates of birth, SSNs, phone numbers, or email addresses.",
    });
  }

  const selectedPrompt = detectPrompt(question.trim(), mode);

  const promptName =
    selectedPrompt === DEEP_SYSTEM_PROMPT  ? "DEEP_SYSTEM_PROMPT"  :
    selectedPrompt === QUICK_SYSTEM_PROMPT ? "QUICK_SYSTEM_PROMPT" :
    selectedPrompt === EXAM_SYSTEM_PROMPT  ? "EXAM_SYSTEM_PROMPT"  :
    "QUICK_KNOWLEDGE_PROMPT";

  // ── Pre-compute log fields before streaming starts ──────────────────────
  // input_redacted: PHI already blocked above; this strips any residual patterns
  // input_normalized: derived from the redacted form — what routing "heard"
  const inputRedacted   = redactInput(question.trim());
  const inputNormalized = normalizeExtended(inputRedacted.toLowerCase());
  const wordCount       = question.trim().split(/\s+/).length;
  const inputLength     = question.trim().length;
  const category        = inferCategory(inputNormalized);
  const uiMode          = mode || "quick";

  const requestTimestamp = new Date().toISOString();
  console.log(`[REQUEST] ${requestTimestamp} | route=${promptName} | mode=${uiMode} | category=${category} | words=${wordCount}`);

  // Set SSE headers so the frontend can read chunks as they arrive
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disables Nginx buffering on Render

  try {
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1400,
      system: selectedPrompt,
      messages: [{ role: "user", content: question.trim() }],
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta?.type === "text_delta" &&
        chunk.delta?.text
      ) {
        fullResponse += chunk.delta.text;
        // Send each text chunk as an SSE data event
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    const parsedUrgency = parseUrgency(fullResponse);
    const { possible_failure, failure_reason } = detectPossibleFailure({
      route:           promptName,
      status:          "success",
      responseLength:  fullResponse.length,
      responsePreview: fullResponse.slice(0, 250),
      urgency:         parsedUrgency,
    });
    appendLog({
      timestamp:        requestTimestamp,
      route:            promptName,
      mode:             uiMode,
      category:         category,
      input_redacted:   inputRedacted,
      input_normalized: inputNormalized,
      word_count:       wordCount,
      input_length:     inputLength,
      urgency:          parsedUrgency,
      status:           "success",
      response_preview: fullResponse.slice(0, 250),
      response_length:  fullResponse.length,
      possible_failure,
      failure_reason,
    });

    // Signal stream completion
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("[Clinical Edge] Anthropic API error:", error.status ?? "", error.message);
    const { possible_failure: errFail, failure_reason: errReason } = detectPossibleFailure({
      route:           promptName,
      status:          "error",
      responseLength:  0,
      responsePreview: null,
      urgency:         null,
    });
    appendLog({
      timestamp:        requestTimestamp,
      route:            promptName,
      mode:             uiMode,
      category:         category,
      input_redacted:   inputRedacted,
      input_normalized: inputNormalized,
      word_count:       wordCount,
      input_length:     inputLength,
      urgency:          null,
      status:           "error",
      response_preview: null,
      response_length:  0,
      possible_failure: errFail,
      failure_reason:   errReason,
    });
    // SSE headers are already sent — respond with an error SSE event so the
    // frontend can stop streaming and display the message cleanly.
    res.write(`data: ${JSON.stringify({ error: "High usage right now. Please try again in a moment." })}\n\n`);
    res.end();
  }
});

// ── SBAR Generation ───────────────────────────────────────────────────────────
const SBAR_SYSTEM_PROMPT = `You are a bedside nurse drafting a quick verbal SBAR to call a provider. Write it the way a nurse actually talks — natural, direct, no fluff.

STRICT LENGTH RULES — do not exceed these:
- SITUATION: 1–2 short sentences. What's happening right now, why you're calling.
- BACKGROUND: 1–2 short sentences. Only the most relevant context. No lists.
- ASSESSMENT: 1 sentence. Your nursing concern — keep it at the concern level, not a diagnosis. Use phrases like "concerned about an acute change" or "doesn't look right." Do NOT list differentials like PE, sepsis, or cardiac event.
- RECOMMENDATION: 1 sentence. A simple nursing-scope request — "Can you come evaluate?" / "Can you take a look?" / "Requesting your guidance." Do NOT suggest specific medications, imaging, or orders.

TONE: Spoken, peer-to-peer, slightly informal. Think: what you'd actually say on the phone — not a formal note, not an essay.

DO NOT add bullet points, extra context, explanations, or anything outside the four sections.

Output format — use EXACTLY these labels on their own line:
SITUATION:
BACKGROUND:
ASSESSMENT:
RECOMMENDATION:`;

app.post("/api/sbar", apiLimiter, async (req, res) => {
  const { question, copilotResponse } = req.body;

  if (!question || !copilotResponse) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (question.trim().length > 5000) {
    return res.status(400).json({ error: "Input too long." });
  }

  // PHI guardrail
  const phiMatch = containsPHI(question);
  if (phiMatch) {
    return res.status(400).json({
      error: "Remove patient identifiers before generating SBAR.",
    });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SBAR_SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Clinical scenario:\n${question.trim()}\n\nCopilot analysis:\n${copilotResponse.trim()}`,
      }],
    });

    const raw = message.content[0]?.text || "";

    // Parse each labeled section out of the raw text
    const parseSection = (label, nextLabel) => {
      const pattern = nextLabel
        ? new RegExp(`${label}:\\s*([\\s\\S]*?)(?=${nextLabel}:)`, "i")
        : new RegExp(`${label}:\\s*([\\s\\S]*)$`, "i");
      const m = raw.match(pattern);
      return m ? m[1].trim() : "";
    };

    const sbar = {
      situation:      parseSection("SITUATION",      "BACKGROUND"),
      background:     parseSection("BACKGROUND",     "ASSESSMENT"),
      assessment:     parseSection("ASSESSMENT",     "RECOMMENDATION"),
      recommendation: parseSection("RECOMMENDATION", null),
    };

    res.json({ sbar });
  } catch (error) {
    console.error("[SBAR] API error:", error.message);
    res.status(500).json({ error: "Failed to generate SBAR. Please try again." });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`\n✅ Clinical Edge backend running → http://localhost:${PORT}\n`));
