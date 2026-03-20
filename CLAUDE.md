# Clinical Edge Copilot — Claude Code Project Memory

## What This App Is
Clinical Edge Copilot is an AI-powered clinical reasoning support tool for bedside nurses.
It is a **reasoning and escalation awareness aid** — not a diagnostic tool.
Built by Mohamed, a master's-prepared RN with critical care experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (runs on localhost:5173) |
| Backend | Node.js + Express (runs on localhost:3001) |
| AI | Anthropic Claude API (model: claude-sonnet-4-6) |
| Persistence | Browser localStorage only (no database) |

---

## Architecture — Non-Negotiable Rules

- **Single backend endpoint:** `POST /api/copilot` — do not add or rename endpoints without explicit instruction
- **API key lives in backend `.env` only** — NEVER expose it to the frontend, NEVER hardcode it anywhere
- **Never use OpenAI** — Anthropic Claude API exclusively
- **Never redesign the UI** — dark navy premium aesthetic with electric blue accents is locked in
- **Never simplify the product** — maintain full feature complexity
- **Never remove previously built features** — every iteration must preserve all existing functionality
- **Do not change the backend unless absolutely necessary**

---

## Response Format — The Nine Sections (in order)

Every AI response opens with:
```
Urgency Level: HIGH / MODERATE / LOW
```
HIGH urgency responses also include a `⚠️` urgent deterioration warning.

Then the nine sections, always in this order:
1. Most Likely Issue
2. Urgency Summary
3. Clinical Pattern Recognition
4. Immediate Nursing Assessments
5. Possible Clinical Causes
6. Common Nursing Actions
7. Notify Provider / Escalate If
8. Clinical Insight
9. Safety Note

`max_tokens` is set to 1400 — do not change this without explicit instruction.

---

## Two Modes

| Mode | Description |
|---|---|
| **Clinical Reasoning** | Deep mode — thorough clinical analysis |
| **Quick Guidance** | Quick mode — fast, focused response |

Each mode has its own distinct system prompt. Keep them separate.

---

## Frontend Parsing

The frontend parser uses a dynamic `ALIAS_MAP` to handle section header variants.
When modifying section headers or adding new ones, update the ALIAS_MAP accordingly.

---

## Saved Cases (Notebook Feature)

Built with `localStorage` only — no backend database.

Each saved case stores:
- Question (the nurse's clinical scenario)
- Mode (Clinical Reasoning or Quick Guidance)
- Raw AI response
- Urgency level
- Timestamp
- Optional note (user-editable)

Supported actions: expand, edit note, reopen, copy, delete.

---

## UI Design — Do Not Change

- **Color scheme:** Dark navy background, electric blue accents
- **Fonts:** Syne (headings), DM Sans (body), DM Mono (labels)
- **Cards:** Color-coded by section
- **Aesthetic:** Premium, clinical, professional

---

## Clinical Logic — Critical Rules

- **Never overcall urgency** on isolated abnormal values
- Urgency must consider: clinical context, trends, and the overall patient picture together
- The AI should reason like a skilled clinician — not trigger alarms on single data points
- Always include a Safety Note reminding nurses this is a support tool, not a replacement for clinical judgment

---

## What's Not Built Yet (Coming Soon)

- Authentication / user accounts
- Deployment (not yet live)
- Payment / subscription layer
- Landing page
- 30-scenario test library

Recommended build sequence: deploy app → launch landing page → collect waitlist signups.

---

## Developer Notes

- Run frontend: `cd frontend && npm run dev`
- Run backend: `cd backend && node server.js` (or `npm start`)
- Both must be running simultaneously for the app to work
- Test with realistic nursing scenarios — vague or single-value inputs often produce better outputs than overly clinical prompts
