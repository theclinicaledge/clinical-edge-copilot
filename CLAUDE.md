# Clinical Edge Copilot — Claude Code Project Memory

## What This App Is
Clinical Edge is a multi-tool nursing platform centered on Clinical Edge Copilot.
Copilot is an AI-powered clinical reasoning and escalation-awareness aid for bedside nurses — not a diagnostic tool.
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
| Web analytics | Vercel Analytics via `frontend/src/analytics.ts` |
| Persistence | Browser localStorage/sessionStorage only (no database) |

Primary shipped surfaces:
- Home hub
- Copilot
- SBAR draft generation
- Rhythm Lab
- ICU Drips
- Reference Hub
- ABG & Oxygenation Lab
- Brain Sheets
- Scenario walkthrough
- QuickStart
- Blog / SEO pages
- Download, Privacy, and Support pages

---

## Architecture — Non-Negotiable Rules

- **Backend endpoints:** `POST /api/copilot`, `POST /api/sbar`, and `GET /health` — do not add or rename endpoints without explicit instruction
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

## Deployment / Release Setup

- The web app targets `https://theclinicaledge.org`.
- Production Copilot calls default to `https://clinical-edge-backend.onrender.com` unless `VITE_API_BASE_URL` is set.
- Vercel config exists at repo root and in `frontend/`.
- The separate Expo/App Store wrapper repo is `/Users/mohamed/Clinical-Edge-Mobile/clinical-edge-copilot-mobile`; it loads the web app in a native WebView and has App Store ID `id6761643064`.
- Frontend build: `cd frontend && npm run build` (output goes to `frontend/dist/` — do not touch)
- Do not modify deployment-related config (Render, Railway, Vercel, Netlify, etc.) without explicit instruction

---

## Copilot Response Format

Every AI response opens with:
```
Urgency Level: HIGH / MODERATE / LOW
```
HIGH urgency responses also include a `⚠️` urgent deterioration warning.

The current frontend parser expects these six section headers:
1. What this could be
2. Possible concerns
3. What to assess next
4. What to consider next
5. Where this may be heading
6. Closing

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
- **Fonts:** Inter (headings and body), IBM Plex Mono (labels/eyebrows)
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
- Meta Pixel / Meta SDK / App Events integration
- 30-scenario clinical regression test library
- Full Brain Sheets library completion beyond the production sheets already built

---

## Developer Notes

- Run frontend: `cd frontend && npm run dev`
- Run backend: `cd backend && node server.js`
- Both must be running simultaneously for the app to work
- Run frontend lint: `cd frontend && npm run lint`
- Run Playwright smoke tests: `cd frontend && npm run test:e2e`
- Test with realistic, context-rich nursing scenarios and avoid overfitting to minimal inputs
