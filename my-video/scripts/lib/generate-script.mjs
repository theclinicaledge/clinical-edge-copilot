// ─── Generate VideoScript via Claude API ──────────────────────────────────────
// Uses native fetch (Node 18+). No SDK dependency.

import { log, info, C }                    from "./utils.mjs";
import { selectFootageQueries, detectCategory } from "./footage-strategy.mjs";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL         = "claude-sonnet-4-6";

// ─── System prompt — bakes in Clinical Edge voice permanently ─────────────────
const SYSTEM_PROMPT = `You are the voice of Clinical Edge — a nursing education brand trusted by ICU, ED, and critical care nurses.

Your content is NOT textbook nursing. It is what experienced nurses notice early and act on before the patient deteriorates.

CLINICAL EDGE VOICE RULES — follow these exactly:

TONE:
- Confident, direct, and clinical — never alarmist
- Speak like a senior nurse briefing a junior nurse at the bedside
- Short sentences. Active voice. No passive constructions.
- Teach pattern recognition, not memorization

WHAT YOU EMPHASIZE:
- What experienced nurses notice early
- What matters clinically in the first 5 minutes
- Why you do not sit on this finding
- The pattern, not the definition

BANNED PHRASES — never use these:
- "code-level rhythm" (overclaims)
- "call a code" (outside scope of this content)
- "they're going to die" (never say this)
- "textbook presentation"
- "as per protocol"
- "per facility policy"
- Any phrase that implies the nurse should wait for the doctor before assessing

ESCALATION LANGUAGE — use these instead:
- "Escalate immediately"
- "Treat as unstable until proven otherwise"
- "Assess perfusion now"
- "Notify the provider"
- "This cannot wait"

HOOK RULES:
- Max 2 lines separated by \\n
- Max 8 total words
- Must make a nurse stop scrolling
- Use tension, consequence, or what others miss
- Examples of good hooks:
  "This rhythm kills\\nbecause people wait."
  "High potassium.\\nThe ECG tells you first."
  "Missed this once.\\nNever again."

BREAKDOWN CARDS — 3 cards, each must:
- Label: 3-5 words, bold concept name (not a full sentence)
- Detail: 3-6 words, the clinical insight (not a textbook definition)
- Tell a cause → cascade → consequence story
- Good examples:
  Label: "P waves continue" / Detail: "atria still firing"
  Label: "QRS does its own thing" / Detail: "ventricles escape"
  Label: "No relationship" / Detail: "that's complete block"

NURSING ACTIONS — 5 actions, each must:
- Be specific and bedside-actionable
- Start with an action verb (Assess, Check, Escalate, Prepare, Get, Notify)
- NOT be vague ("Monitor the patient")
- First action always focuses on patient assessment, not documentation

BREAKDOWN TITLE — 3 words max, Clinical Edge approved options:
- "What nurses miss"
- "Why this matters"
- "The real danger"
- "What changes fast"
- "The pattern here"
(Do NOT say "Inside the heart" or "What's happening" — too textbook)

CTA TAGLINE — always use a closing line that reinforces pattern recognition, like:
- "Think like the nurse who catches it first."
- "Pattern recognition saves lives."
- "The nurse who acts early changes the outcome."

You must return ONLY a valid JSON object with NO surrounding text, code fences, or explanation.`;

// ─── User prompt — schema + per-topic instructions ────────────────────────────
function buildUserPrompt(topic) {
  return `Create a complete VideoScript JSON object for the nursing education topic: "${topic}"

The JSON object must have ALL of these exact fields:

{
  "slug": "kebab-case-topic-slug",
  "topic": "Human readable topic name",
  "urgency": "HIGH" | "MODERATE" | "LOW",

  "hookLine": "Line one — max 4 words\\nLine two — max 4 words",
  "hookSub": "Series label — e.g. Cardiac Rhythm Series / Electrolyte Series / Pharmacology Series",
  "badgeText": "SHORT BADGE TEXT" or null,

  "breakdownTitle": "What nurses miss",
  "breakdownSubtitle": "The clinical pattern",
  "breakdownCards": [
    { "label": "Short concept", "detail": "brief clinical insight", "color": "green" },
    { "label": "Short concept", "detail": "brief clinical insight", "color": "red" },
    { "label": "Short concept", "detail": "brief clinical insight", "color": "amber" }
  ],

  "nursingTitle": "What matters now",
  "nursingActions": [
    "Assess [something specific] now",
    "Check [specific clinical finding]",
    "Escalate immediately",
    "Prepare [specific equipment or medication]",
    "Get [specific test or consult]"
  ],
  "closingLine": "One sentence — the clinical pearl.\\nOne more sentence — the consequence of missing it.",

  "ctaHandle": "@clinicaledgeco",
  "ctaTagline": "Think like the nurse who catches it first.",

  "ecgType": "complete-heart-block" | "afib" | "vtach" | "generic" | "none",

  "footageQueries": ["medical query 1", "medical query 2", "medical query 3"],

  "tiktokCaption": "Hook sentence that stops scrolling. Clinical insight. CTA. 2-3 inline hashtags.",
  "instagramCaption": "Professional 2-3 sentence caption. Include a question or save prompt.",
  "hashtags": ["#nursing", "#clinicaledgeco", "#nursingeducation", "#topic-specific-tags"]
}

HARD RULES for this generation:
1. hookLine total word count must be 8 or fewer
2. breakdownCards[i].label must be 5 words or fewer
3. breakdownCards[i].detail must be 6 words or fewer
4. nursingActions must have exactly 5 items
5. ctaHandle must be exactly "@clinicaledgeco" — no dots, no variations
6. closingLine must be exactly 2 sentences separated by \\n (single backslash-n)
7. ecgType must be "none" for non-rhythm topics
8. footageQueries must be 3 safe generic medical terms usable on Pexels
9. hashtags must include "#clinicaledgeco" (not "#clinicaledge" or "#clinicaledge.co")
10. Never use: "code-level", "call a code", "per protocol", "per facility policy"

Return ONLY the JSON. No explanation. No code fences.`;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generateScript(topic) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set.\n" +
      "Add it to my-video/.env:\n\n" +
      "  ANTHROPIC_API_KEY=sk-ant-api03-...\n\n" +
      "Get your key at: https://console.anthropic.com/settings/api-keys"
    );
  }

  log("→", C.dim, `Calling Claude (${MODEL}) to generate script for "${topic}"...`);

  const response = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(topic) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let script;
  try {
    script = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Claude returned invalid JSON.\n\nRaw response:\n${text.slice(0, 600)}`
    );
  }

  // Enforce non-negotiable defaults regardless of what Claude returns
  script.ctaHandle  = "@clinicaledgeco";
  script.ctaTagline = script.ctaTagline ?? "Think like the nurse who catches it first.";
  script.ecgType    = script.ecgType    ?? "none";
  script.hashtags   = (script.hashtags ?? []).map(h =>
    h === "#clinicaledge" || h === "#clinicaledge.co" ? "#clinicaledgeco" : h
  );
  if (!script.hashtags.includes("#clinicaledgeco")) {
    script.hashtags.unshift("#clinicaledgeco");
  }

  // Override Claude's generic footage queries with strategy-layer queries.
  // The strategy layer knows the clinical category of the topic and returns
  // Pexels search terms proven to return relevant bedside/clinical footage.
  const category = detectCategory(topic);
  const strategyQueries = selectFootageQueries(topic);
  info(`Footage category: ${C.white}${category}${C.reset} → ${strategyQueries.join(", ")}`);
  script.footageQueries = strategyQueries;

  return script;
}
