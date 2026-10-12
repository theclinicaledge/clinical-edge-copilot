# Clinical Edge — Agent Project Memory (CLAUDE.md, keep identical to AGENTS.md)

This file is read by Codex (AGENTS.md) and Claude (CLAUDE.md). Keep both files identical
apart from this heading. If code and this file disagree, stop and ask Mohamed which is right,
then update this file in the same change.

## What This App Is

Clinical Edge is a nursing education and clinical-reasoning support platform for bedside
nurses (med-surg, telemetry, PCU, ICU, ED). It supports nursing assessment, reasoning and
communication. It does not diagnose, treat, prescribe, or replace provider orders, local
protocol, or clinical judgment. Built by Mohamed, a master's-prepared RN with critical care
experience.

Shipped as a website (https://theclinicaledge.org) and as an iOS App Store app (App Store ID
id6761643064) that loads the website in a native WebView from a separate Expo wrapper repo.
Every web change therefore ships to the App Store app too.

---

## Compliance Rules — Highest Priority, Non-Negotiable

These protect Mohamed's App Store listing and legal position. They override feature requests,
design preferences and every other rule in this file. If a task would break one, stop and say so
instead of doing it.

### Patient privacy
- Never add a field, prompt, upload, or flow that asks for or encourages patient identifiers
  (names, initials, MRN, DOB, room numbers, dates, contact details, photos of records).
- Keep the identifier warnings next to every free-text clinical input and keep the backend
  `containsPHI` check on every route that reaches the AI provider.
- Never log, store, or send to analytics any clinical text, Snapshot values, AI responses,
  saved-case content, notes, SBAR text, or search text. Server logs are metadata only.
- Never add a server-side database or persistence of clinical content without explicit approval
  and a privacy review.

### Consent (App Store Review Guidelines 5.1.2(i) and 5.1.1(ii))
- Nothing a user enters may be sent to a third-party AI service until they grant explicit
  permission. `frontend/src/components/AIConsentGate.jsx` wraps every AI-backed workspace.
  Any new feature that calls the backend AI routes must sit behind that gate.
- Usage analytics are opt-in. All events go through `frontend/src/analytics.ts`, which drops
  them without consent. Never call `@vercel/analytics` `track` directly.
- Consent state lives in `frontend/src/consent.js`. Bump `CONSENT_VERSION` whenever what is
  sent, who receives it, or the disclosure wording materially changes.
- Users can withdraw both choices on the Privacy page. Do not remove that control.
- Adding any new third party that receives user data (AI provider, analytics, SDK, crash
  reporter, ads, Meta Pixel) requires: consent gating, a Privacy page update, an App Store
  privacy label update, and Mohamed's explicit approval. Never add tracking across apps or
  websites (that would require Apple's App Tracking Transparency prompt).

### Privacy policy and store disclosures
- `frontend/src/Privacy.jsx` must always list every third party that receives data, what it
  receives, retention, and how to withdraw consent. Update its effective date when the policy
  changes. If code changes data flows, update the policy in the same change and tell Mohamed
  the App Store Connect privacy label may need updating.

### Clinical safety and medical-app scrutiny (Guideline 1.4.1, FDA CDS boundaries)
- No dosing, titration, bolus, medication hold/start, device or ventilator settings, or
  treatment commands anywhere: not in prompts, fallbacks, UI copy, marketing, or examples.
- Keep the visible reminder that output is educational support and decisions belong with the
  treating provider and local protocol.
- Always show the basis for a recommendation (the reported findings it came from) so a nurse can
  review it independently. Do not hide reasoning behind a single verdict.
- Do not market or label any feature for time-critical or emergency decision-making
  ("code", "crashing", "rapid response decision"), and do not claim it detects, diagnoses,
  predicts or monitors a condition.
- Never claim accuracy, FDA status, HIPAA compliance, or outcomes that have not actually
  happened. Never claim Clinical Edge or its content is clinically validated or reviewed unless
  that happened. Describing an established clinical tool as validated (CAM-ICU, RASS) is fine.
- Synthetic test cases only. Never use real patient cases, even de-identified, in fixtures,
  prompts, screenshots, marketing, or blog content.
- `ASK_SAFETY_CONTAINMENT=true` on the backend pauses all generative clinical routes. Keep it
  working.

### Apple platform
- The iOS app must stay more than a repackaged website (Guideline 4.2). Do not remove
  app-like features without discussing App Store impact.
- No payments, subscriptions or paid unlocks inside the app without discussing In-App Purchase
  rules first. No accounts without in-app account deletion.

---

## Working Environment

- Local path: `~/Code/clinical-edge-copilot-fixed` (GitHub `theclinicaledge/clinical-edge-copilot`)
- Do not use old Desktop or iCloud copies.
- Mohamed may run Codex and Claude on this repo at the same time. Pull before starting, keep
  changes small and scoped, and work on a branch when touching shared files.
- Structure: `frontend/` (Vite + React), `backend/` (Node + Express), `content/`, `docs/`,
  `my-video/` (Remotion).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite (localhost:5173) |
| Backend | Node.js + Express 5 (localhost:3001), hosted on Render |
| AI | Anthropic Claude API only (model `claude-sonnet-4-6`). Never OpenAI. |
| Web hosting | Vercel |
| Analytics | Vercel Analytics via `frontend/src/analytics.ts`, opt-in only |
| Persistence | Browser localStorage/sessionStorage only. No database. |

## Backend Routes

| Route | Purpose |
|---|---|
| `POST /api/copilot` | Copilot modes, Shift Brain Priority Map, Teach Me, follow-up, reassessment |
| `POST /api/sbar` | SBAR draft |
| `POST /api/ask` | Ask Clinical Edge (general and Snapshot-aware; deterministic ABG engine) |
| `GET /health` | Health check |

Do not add or rename routes without explicit instruction. Every AI route needs the rate
limiter, the identifier check, metadata-only logging, the containment gate and the AI cost
guard (`backend/ai-cost-guard.js`: call `admit` right before a request's first Anthropic call).

AI cost guard variables: `AI_DAILY_BUDGET_USD` (default 5), `FREE_DAILY_QUESTIONS` (default 3
per device per day), `FREE_DAILY_QUESTIONS_PER_IP` (default 50, backstop and the only limit for
requests without a device ID), `AI_INPUT_USD_PER_MTOK` and `AI_OUTPUT_USD_PER_MTOK` (defaults 3
and 15, the `claude-sonnet-4-6` list prices; update them if the model changes). Only new Ask
questions and new Priority Maps count toward the free limits; Teach Me, SBAR, follow-ups and ABG
explanations only need budget. A question that ends in a server error, Anthropic 429 or
deterministic fallback is released (`aiCost.release`); a safety refusal (422) is refunded on the
device count only and still counts toward the per-IP backstop. The device ID is a random UUID from `frontend/src/deviceId.js`,
sent as `X-CE-Device` to AI routes only; never log it or send it to analytics. Limits reset
at midnight Pacific and live in memory, so a restart or deploy resets them.

Backend environment variables: `ANTHROPIC_API_KEY` (backend `.env` only, never in the frontend
or in code), `PORT`, `ASK_SAFETY_CONTAINMENT`, `TRUST_PROXY_HOPS` (default 1, for Render's
proxy so rate limits are per user). Frontend: `VITE_API_BASE_URL` (defaults to
`https://clinical-edge-copilot.onrender.com`, the live Render backend, and is set to it in
Vercel). Ask (`AskClinicalEdge.jsx`) and Shift Brain (`App.jsx`) share this one default.

Token limits and timeouts are set per route in `backend/server.js` and
`backend/ask-clinical-edge.js`; read the code rather than trusting a number written here.

## Surfaces

Home, Shift Brain (Snapshot, Rapid Capture, Priority Map, Teach Me, Reassessment, SBAR),
Ask Clinical Edge, Rhythm Lab, ICU Drips, Reference Hub, ABG & Oxygenation Lab, Brain Sheets,
Scenario, QuickStart, Blog, Landing, Download, Privacy, Support.

Never remove a shipped feature without explicit approval.

## Design

- Ratified specs: `design-system.md` and `motion-system.md` at the repo root. Follow them; if a
  new surface is not covered, ask before inventing a new visual language.
- Current look: navy header, warm light workspace surfaces, teal primary actions, gold accents.
  Fonts: Inter (headings and body), IBM Plex Mono (labels and eyebrows).
- Purple is retired (replaced by gold). Success states use teal plus a non-color signal.
- CSS-only motion. Clinical modules render instantly; no decorative animation on clinical data.

## Content Rules

- No dosing language or treatment commands. No em dashes in user-facing copy.
- Nurse-to-nurse voice. Short bullets over paragraphs. Recognition over memorization.
- No textbook or generic AI phrasing.

## Analytics Rules

Only fixed enums, booleans, safe counts and predefined IDs. Never free text, clinical content,
or anything that could identify a patient or user. Document new events in
`docs/ANALYTICS_EVENTS.md`.

## File Hygiene

- Do not touch generated files: `dist/`, `node_modules/`, Remotion renders, validation outputs.
- Do not commit unless explicitly asked. Explicit file staging only, never `git add -A`.
- Do not change deployment config (Vercel, Render, `vite.config.js`, env vars) unless asked.
- State which files you will change and why before changing them.

## Developer Commands

- Frontend: `cd frontend && npm run dev` · `npm run lint` · `npm run build` · `npm run test:e2e`
  · `npm run validate:rapid-capture`
- Backend: `cd backend && node server.js` · `npm test` · `npm run validate:clinical`
  · `npm run validate:p1` · `npm run validate:ask`
- Run lint, backend tests and the e2e suite before saying work is done.
- Automated validators and authored fixture reviews are not clinical validation. Real-provider
  and clinician review results live in `docs/CLINICAL_VALIDATION_REGISTRY.md`; never rewrite
  a recorded result.

## Not Built Yet

Accounts, payments/subscriptions, Meta Pixel or other ad SDKs. Each one changes App Store and
privacy obligations; see Compliance Rules before starting any of them.
