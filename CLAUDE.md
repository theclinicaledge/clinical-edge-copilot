# Clinical Edge Copilot — Claude Code Project Memory

## What This App Is
Clinical Edge Copilot is an AI-powered clinical reasoning support tool for bedside nurses.
It is a **reasoning and escalation awareness aid** — not a diagnostic tool.
Built by Mohamed, a master's-prepared RN with critical care experience.

---

## Working Environment

- **Safe local path:** `~/Code/clinical-edge-copilot-fixed` (full path: `/Users/mohamed/Code/clinical-edge-copilot-fixed`)
- **Do NOT reference or use** the old Desktop or iCloud copy of this project
- All work in Claude Code sessions must target this repo exclusively
- Repo structure:
  - `frontend/` — Vite/React app
  - `backend/` — Node.js/Express server and prompt routing
  - `content/` — content assets and workflows
  - `my-video/` — Remotion video system

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
- **Backend is considered stable** — do not modify backend logic, routes, or API behavior unless explicitly instructed
- **This document (`CLAUDE.md`) is the source of truth** for architecture, constraints, and behavior

---

## File Hygiene Rules

- **Do not touch generated files** — includes `dist/`, `node_modules/`, and any Remotion render output
- **Do not commit unless explicitly asked** — always wait for explicit commit instruction
- **Do not change deployment config unless asked** — this includes `vite.config.js`, hosting config, environment variables, and any CI/CD files
- **Do not create new files unless explicitly instructed**
- **Do not restructure folders or move files without approval**
- **Never make changes without first explaining what will be changed and why**
- **Wait for explicit approval before modifying any files**
- Before making any changes, always state which files will be modified

---

## Deployment Setup

- Deployment is **not yet live**
- Recommended build sequence: deploy app → launch landing page → collect waitlist signups
- Frontend build: `cd frontend && npm run build` (output goes to `frontend/dist/` — do not touch)
- Do not modify deployment-related config (Render, Railway, Vercel, Netlify, etc.) without explicit instruction

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
- Payment / subscription layer
- Landing page
- 30-scenario test library

---

## Developer Notes

- Run frontend: `cd frontend && npm run dev`
- Run backend: `cd backend && node server.js` (or `npm start`)
- Both must be running simultaneously for the app to work
- Test with realistic, context-rich nursing scenarios and avoid overfitting to minimal inputs
