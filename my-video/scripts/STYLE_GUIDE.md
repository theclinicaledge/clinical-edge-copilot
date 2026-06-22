# Clinical Edge Video Style Guide
## The locked default for all future videos

---

## Voice & Tone

Clinical Edge speaks like a **senior nurse briefing a junior at the bedside** — not a textbook, not a lecture, not a warning label.

The content answers one question: **"What does an experienced nurse notice early that others miss?"**

### What we emphasize
- What matters clinically in the first 5 minutes
- Why you do not sit on this finding
- The pattern — not the definition
- What changes fast when missed

### What we never sound like
- A textbook ("Signs and symptoms include...")
- An alarmist ("This will kill your patient!")
- A policy document ("As per protocol...")
- A documentation reminder ("Document and notify per facility policy")

---

## Banned Phrases

Never use these in any script, caption, or visual:

| Banned | Use instead |
|---|---|
| "code-level rhythm" | "Treat as unstable until proven otherwise" |
| "call a code" | "Escalate immediately" |
| "per protocol" / "per facility policy" | (omit entirely or say "per your institution") |
| "textbook presentation" | (describe the actual pattern) |
| "they're going to die" | (never) |
| "@clinicaledge.co" | "@clinicaledgeco" |
| "#clinicaledge" | "#clinicaledgeco" |

---

## Handle & Branding

| Field | Value |
|---|---|
| TikTok/Instagram handle | `@clinicaledgeco` |
| Hashtag | `#clinicaledgeco` |
| Brand name in text | `Clinical Edge` |
| CTA tagline (default) | `Think like the nurse who catches it first.` |

The CTA tagline can vary per topic but must always reinforce **early pattern recognition** — never urgency-shaming or fear.

---

## Typography Rules (Mobile-First)

All content is designed for 1080×1920 (TikTok/Reels vertical).

| Element | Size | Weight |
|---|---|---|
| Hook line | 128px | 900 |
| Section title | 86px | 900 |
| Card label | 44px | 800 |
| Card detail | 30px | 400 |
| Action items | 34–38px | 500–800 |
| Labels/badges | 22–26px | 700 |

**Safe zones (TikTok/Reels UI overlap):**
- Top: 140px padding minimum
- Bottom: 240–320px padding minimum
- Left/Right: 68–80px padding minimum

---

## Scene Structure

Every video uses this 4-scene structure (600 frames = 20s at 30fps):

### Scene 1 — Hook (0–90 frames, 3s)
- **Purpose:** Stop the scroll in 1 second
- Hook line: max 2 lines, max 8 words total
- Second line should be the consequence, not the definition
- Optional pulsing badge (urgency indicator)
- Footage: most cinematic clip (cardiac monitor, ICU wide shot)

**Good hooks:**
```
"This rhythm kills
because people wait."

"High potassium.
The ECG tells you first."

"Sepsis doesn't always
look like sepsis."
```

**Bad hooks:**
```
"Complete heart block is
a medical emergency."       ← textbook, not punchy

"This is what you
need to know about..."      ← too weak
```

---

### Scene 2 — Breakdown (90–300 frames, 7s)
- **Title:** Always from this approved list:
  - "What nurses miss"
  - "Why this matters"
  - "The real danger"
  - "What changes fast"
  - "The pattern here"
- **3 cards:** cause → cascade → consequence
- **Card label:** 3–5 words (concept name only)
- **Card detail:** 3–6 words (clinical insight, not a definition)
- Footage: ICU monitor, vitals screen, clinical environment

**Good card pattern:**
```
Card 1: "P waves continue"    / "atria still firing"
Card 2: "QRS does its own thing" / "ventricles escape"
Card 3: "No relationship"    / "that's complete block"
```

**Bad card pattern:**
```
Card 1: "The sinoatrial node fires at a normal rate"   ← too long, textbook
Card 2: "Atrioventricular node fails to conduct impulses" ← textbook
Card 3: "Ventricular escape rhythm takes over"          ← OK but could be shorter
```

---

### Scene 3 — Nursing Priorities (300–510 frames, 7s)
- **Title:** "What matters now" (default) or short imperative
- **5 actions** — specific and bedside-actionable
- First action: always patient assessment (not documentation)
- Avoid vague actions ("Monitor the patient", "Assess as appropriate")
- **Closing pearl:** 2 sentences, separated by `\n`
  - Sentence 1: the pattern
  - Sentence 2: why it matters

**Good action examples:**
```
✓ "Assess perfusion, not just the rhythm"
✓ "Check BP, mentation, chest pain"
✓ "Escalate immediately"
✓ "Prepare pacing equipment"
✓ "Get a 12-lead ECG"
```

**Bad action examples:**
```
✗ "Monitor the patient closely"          ← vague
✗ "Document findings appropriately"      ← wrong priority
✗ "Notify provider per facility policy"  ← banned phrase
✗ "Call a code if needed"               ← overclaims
```

---

### Scene 4 — CTA (510–600 frames, 3s)
- Handle: `@clinicaledgeco` — always, no exceptions
- Tagline: pattern-recognition focused
- Follow pill: "Follow for more →"
- Footage: same clip as Hook (different time offset) for visual bookending

---

## Footage Rules

- Every major scene must have a real stock video background (from Pexels)
- Overlay opacity: Hook 38%, Breakdown 52%, Nursing 55%, CTA 60%
- Slow zoom applied to every clip (1.0 → 1.06–1.10 scale over scene duration)
- Each scene uses a different clip or different time offset for visual variety
- If no footage available: fall back to dark navy — never fake it

**Preferred footage search terms for medical content:**
- `heart monitor ICU` — cardiac rhythms, arrest scenarios
- `nurse hospital patient` — nursing assessment scenes
- `cardiac monitor screen` — ECG/vitals display
- `doctor nurse hospital` — clinical team scenarios
- `ICU patient medical` — critical care settings
- `blood pressure monitor` — vitals/hemodynamics
- `hospital emergency room` — ED scenarios

---

## Quality Checklist

Run automatically after every script generation. All should pass before rendering:

- [ ] Handle is `@clinicaledgeco` (not @clinicaledge.co or @clinicaledge)
- [ ] Footage files assigned (≥1 clip)
- [ ] Hook ≤ 10 words total
- [ ] Hook ≤ 2 lines
- [ ] Card labels ≤ 5 words each
- [ ] Card details ≤ 8 words each
- [ ] Actions: 3–6 items
- [ ] No banned phrases in any field
- [ ] Closing line: 1–2 sentences separated by `\n`
- [ ] Urgency set: HIGH / MODERATE / LOW

---

## Urgency Language

| Urgency | When to use | Color |
|---|---|---|
| HIGH | Hemodynamic instability risk, rhythm requiring immediate escalation | Red #e05572 |
| MODERATE | Requires timely assessment and provider notification | Amber #F2B94B |
| LOW | Important education, not time-critical at bedside | Green #1FBF75 |

**Never assign HIGH urgency to a condition just because it sounds serious.** The urgency reflects the bedside time pressure, not the educational importance of the topic.

---

## Pexels Footage Guidelines

- Always portrait orientation (for TikTok/Reels native)
- Minimum resolution: 1280×720
- Safe search terms: avoid anything that could return non-medical content
- 3 queries per video — diversify for scene variety
- Credits auto-written to `assets/footage-credits.txt`
