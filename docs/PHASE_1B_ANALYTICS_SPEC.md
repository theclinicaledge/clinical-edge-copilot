# Phase 1B — Privacy-Safe Analytics Gap Cleanup: Planning Spec

**Status:** Approved contract — planning document only. No implementation is authorized
by this file alone; work proceeds via the work packets in §7.

**Owner:** Lead architect / analytics contract owner
**Transport:** Vercel Analytics via `trackEvent()` in `frontend/src/analytics.ts`
**Companion reference:** `docs/ANALYTICS_EVENTS.md` (the living event catalog — updated
by the Documentation Packet after code packets land)

---

## 1. Scope

Phase 1B closes the analytics gaps across the Copilot page (Saved Cases, SBAR,
response copy), QuickStart, Scenario walkthrough, Landing CTAs, the Download page,
and documents previously undocumented ICU Drips events.

**Critical context:** a complete Phase 1B implementation already exists as
**uncommitted working-tree changes** in:

- `frontend/src/App.jsx`
- `frontend/src/QuickStart.jsx`
- `frontend/src/Scenario.jsx`
- `frontend/src/Landing.jsx`
- `docs/ANALYTICS_EVENTS.md`

This spec therefore **ratifies** that implementation, defines a small set of
**amendments** (§7, Packet 2), and scopes the remaining work as audit/verification —
not net-new instrumentation. Nothing is reverted or re-implemented from scratch.

Out of scope for Phase 1B: navigation-state plumbing for QuickStart entry-source
attribution, clipboard success/failure detection, and any backend analytics endpoint.

---

## 2. Privacy rules (non-negotiable)

1. **No clinical free text.** User-entered prompts, questions, notes, responses, and
   SBAR content are never transmitted in any analytics payload.
2. **No patient information** of any kind.
3. **No user identifiers** — no account IDs, fingerprinting, or IP capture beyond
   what Vercel Analytics does natively.
4. **Prompt length only as a bucket** (`short` / `medium` / `long`) via
   `promptLengthBucket()` — never the raw length-plus-text, never the text.
5. **Payload values are restricted** to: fixed event/property names, stable internal
   content IDs, mode labels, urgency levels, booleans, and small integers
   (counts/scores). Type contract: `Record<string, string | number | boolean>`.
6. **Raw error messages are never sent** — only fixed classification values
   (e.g. `error_type: 'request_failed'`).
7. **Analytics must never affect the UX** — `trackEvent()` swallows all failures.
8. **Dev mode is network-silent** — `trackEvent()` logs to `console.debug` only when
   `import.meta.env.DEV` is true.

Audit result at time of writing: **no current event violates these rules.**
One adjacent hygiene item (a non-analytics `console.log` of free text in a
QuickStart catch block) is assigned to Packet 2 for removal.

---

## 3. Approved event table

Shared facts:

- All events route through `trackEvent()` (`frontend/src/analytics.ts`). One legacy
  exception is noted in the Download row.
- `main.jsx` wraps the app in `<StrictMode>`: mount-effect events double-log **in
  development only** and fire once in production. Click-handler events are unaffected.

| # | Event | File | Trigger location | Status |
|---|-------|------|------------------|--------|
| 1 | `saved_case_created` | `App.jsx` | `handleSaveCase` (after duplicate guard) | Ratified |
| 2 | `saved_case_reopened` | `App.jsx` | `handleReopenCase` (reopen icon click) | Ratified |
| 3 | `saved_case_note_edited` | `App.jsx` | `handleSaveNote` (explicit **Save Note** click) | Ratified |
| 4 | `saved_case_deleted` | `App.jsx` | `handleDeleteCase` (delete icon click) | Ratified |
| 5 | `sbar_generated` | `App.jsx` | `handleSbar` success branch | Ratified |
| 6 | `sbar_generation_failed` | `App.jsx` | `handleSbar` both failure paths | Ratified |
| 7 | `sbar_copied` | `App.jsx` | `handleCopySbar` (copy button click) | Ratified |
| 8 | `copilot_response_copied` | `App.jsx` | `handleCopyResponse` (main response or saved-case row) | Ratified |
| 9 | `quickstart_opened` | `QuickStart.jsx` | Mount effect | Ratified |
| 10 | `quickstart_option_selected` | `QuickStart.jsx` | Example chip click | Ratified |
| 11 | `quickstart_completed` | `QuickStart.jsx` | `handleSubmit` after prefill write, before navigation | Ratified |
| 12 | `scenario_opened` | `Scenario.jsx` | Effect on `[scenarioIndex]` (mount + scenario switch) | Ratified |
| 13 | `scenario_step_viewed` | `Scenario.jsx` | Effect on `[scenarioIndex, step]` | Ratified |
| 14 | `scenario_completed` | `Scenario.jsx` | Final CTA on scenario 03, before navigation | Ratified |
| 15 | `landing_primary_cta_clicked` | `Landing.jsx` | Hero + closing primary CTAs | Ratified + amendment (add `placement`) |
| 16 | `landing_secondary_cta_clicked` | `Landing.jsx` | Nav + closing secondary CTAs | Ratified + amendment (add `placement`) |
| 17 | `app_store_click` | `Download.jsx` | App Store badge click | Ratified as legacy (calls Vercel `track()` directly; migration deferred) |
| — | ICU Drips event groups (Hemodynamic Compare, Practice, Shift Challenge, Pearls) | `modules/icu-drips/IcuDripsModule.jsx` | Various (already implemented) | Ratified — gap closes via documentation, no code change |

---

## 4. Exact payload schemas

All properties are required unless marked optional. No other properties are permitted.

### Saved Cases

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `saved_case_created` | `{ source: string, has_note: boolean }` | `source` = `'copilot'`; `has_note` = `false` (cases are created without a note) |
| `saved_case_reopened` | `{ source: string }` | `source` = `'saved_cases'` |
| `saved_case_note_edited` | `{ has_note: boolean }` | `true` = non-empty note after trim; `false` = note cleared |
| `saved_case_deleted` | `{ source: string }` | `source` = `'saved_cases'` |

### SBAR

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `sbar_generated` | `{ source: string }` | `source` = `'copilot'` |
| `sbar_generation_failed` | `{ error_type: string }` | `error_type` = `'request_failed'` (single fixed value; raw error text never sent) |
| `sbar_copied` | `{ source: string, copy_scope: string }` | `source` = `'copilot'`; `copy_scope` = `'full_sbar'` (no per-section copy exists) |

### Copilot response copy

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `copilot_response_copied` | `{ copy_scope: string, source: string }` | `copy_scope` = `'full_response'`; `source` ∈ `'copilot'` \| `'saved_cases'` |

### QuickStart

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `quickstart_opened` | `{ source: string }` | `source` = `'direct'` (constant; entry-source attribution deferred) |
| `quickstart_option_selected` | `{ option_id: string }` | `option_id` ∈ `'bp_drop'` \| `'confusion'` \| `'chest_pain'` — internal IDs, never chip text |
| `quickstart_completed` | `{ destination: string }` | `destination` = `'copilot'` |

### Scenario

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `scenario_opened` | `{ scenario_id: string }` | `scenario_id` ∈ `'01'` \| `'02'` \| `'03'` (hardcoded stable literals) |
| `scenario_step_viewed` | `{ scenario_id: string, step_id: string }` | `step_id` ∈ `'scenario'` \| `'thinking'` \| `'analysis'` (fixed 3-step state machine) |
| `scenario_completed` | `{ scenario_id: string, destination: string }` | `scenario_id` = `'03'`; `destination` = `'quickstart'` |

### Landing (post-amendment schema)

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `landing_primary_cta_clicked` | `{ destination: string, placement: string }` | `destination` = `'scenario'`; `placement` ∈ `'hero'` \| `'closing'` |
| `landing_secondary_cta_clicked` | `{ destination: string, placement: string }` | `destination` = `'copilot'`; `placement` ∈ `'nav'` \| `'closing'` |

`placement` is the Packet 2 amendment. Until Packet 2 lands, the working-tree
implementation sends `{ destination }` only.

### Download

| Event | Schema | Allowed values |
|-------|--------|----------------|
| `app_store_click` | `{ page: string, destination: string }` | `page` = `'download'`; `destination` = `'app_store'` |

### ICU Drips (previously undocumented — ratified as implemented)

Schemas verified against code; see `docs/ANALYTICS_EVENTS.md` for the full tables.
Payloads are limited to stable content IDs (`pair_id`, `question_id`, `challenge_id`,
`pearl_id`, `drip_id`), booleans (`correct`), and integer scores (`score`, `total`).

---

## 5. Exact firing semantics

### Ordering relative to state / localStorage / navigation / network

| Event(s) | Ordering |
|----------|----------|
| `saved_case_created` / `_deleted` / `_note_edited` | Fire **after** `setState` + `lsSet(LS_SAVED, …)` in the same synchronous handler (localStorage failures are swallowed; no async boundary to race) |
| `sbar_generated` | Fires strictly **after network success** (`res.ok && !data.error`) and after `setSbar(data.sbar)` |
| `sbar_generation_failed` | Fires in the non-OK/`data.error` branch or the fetch `catch`; the two sites are mutually exclusive — exactly one generated/failed event per attempt |
| `sbar_copied`, `copilot_response_copied` | **Optimistic** — fire alongside `navigator.clipboard.writeText()` regardless of clipboard success, matching the UI's own optimistic "copied" feedback |
| `quickstart_completed` | Fires **after** `localStorage.setItem('copilot_prefill')` succeeds and **before** `onEnterApp()` navigation. If the write throws (private browsing), the event is skipped but navigation proceeds — accepted fail-safe |
| `scenario_completed`, landing CTA events | Fire synchronously **before** SPA `pushState` navigation (no page unload; safe) |
| `app_store_click` | Fires on click, before the `target="_blank"` external navigation |
| Mount events (`quickstart_opened`, `scenario_opened`, `scenario_step_viewed`) | Fire in `useEffect` after first render |

### Duplicate-event guarantees

- `saved_case_created`: protected by the duplicate guard in `handleSaveCase` —
  re-saving an identical question+response fires **zero** events.
- `saved_case_note_edited`: fires on a no-op save (Save clicked with unchanged text).
  Accepted; Cancel fires nothing.
- Scenario switch: `setScenarioIndex` + `setStep(1)` are batched, so
  `scenario_step_viewed` fires **once** per switch — but a switch intentionally emits
  **both** `scenario_opened` and a step-1 `scenario_step_viewed`. Funnel analysis must
  not read step-1 counts as pure step transitions.
- Copy buttons: rapid re-clicks emit one event per click — faithful click telemetry,
  accepted.
- ICU Drips legacy quirks (documented, not changed): `drip_compare_opened` +
  `hemodynamic_compare_opened` fire as a pair (same for `_pair_selected`);
  practice/shift-challenge `*_opened` re-fire on restart.

### React StrictMode

`main.jsx` renders inside `<StrictMode>`. Effects double-invoke **in development
only**: every mount-effect event logs twice in the dev console and fires **once** in
production. This is expected behavior — do not "fix" it, and do not remove
StrictMode to silence it.

---

## 6. Deferred and rejected events

| Candidate | Verdict | Rationale |
|-----------|---------|-----------|
| `landing_opened`, `download_opened`, other bare page-open events | **Rejected** | Pure duplicates of Vercel automatic pageviews with no payload value. Kept `*_opened` events either carry payload (`scenario_id`) or anchor a custom-event funnel |
| Per-keystroke / blur-based note tracking | **Rejected** | **Save Note** is the real commit boundary; finer granularity is noise and raises free-text proximity risk |
| `saved_cases_cleared` | **Rejected** | No such UI action exists |
| `clipboard_copy_failed` | **Rejected** | Would require changing product clipboard behavior — out of scope |
| `scenario_completed` for scenarios 01/02 | **Rejected** | Would misleadingly inflate completion; only the end-of-walkthrough handoff counts |
| Landing in-page scroll buttons ("See Demo" / "See How It Thinks") | **Rejected** | No navigation destination; low-value engagement noise |
| `download_android_notice_viewed` | **Rejected** | Passive UA-detected render, not a user action — misleading as "engagement" |
| QuickStart entry-source threading (`direct` vs. scenario handoff) | **Deferred** | Requires navigation-state plumbing through `main.jsx`; disproportionate. Constant `source: 'direct'` kept for forward compatibility |
| Migrating `app_store_click` to `trackEvent()` | **Deferred** (optional Packet 2 rider) | Works correctly today; pure consistency cleanup, changes no data |
| Any payload containing prompt/note/SBAR/case text or raw error messages | **Rejected permanently** | Privacy rule (§2). Current audit: no violations |

---

## 7. Work packets and file ownership

Each packet has exactly one worker. **`App.jsx` has a single exclusive owner
(Packet 1) — no other packet may touch it under any circumstances.**

### Packet 1 — App.jsx audit sign-off

- **Files owned (exclusive):** `frontend/src/App.jsx`
- **Work:** No net-new code expected. Verify events #1–8 against §4/§5 in dev
  (duplicate-save guard emits zero events; exactly one SBAR outcome event per
  attempt; `source` differs between main-response and saved-case copy). Fix any
  deviation found. Sign off the existing uncommitted diff.

### Packet 2 — Landing / QuickStart amendments (+ optional Download rider)

- **Files owned:** `frontend/src/Landing.jsx`, `frontend/src/QuickStart.jsx`,
  optionally `frontend/src/Download.jsx`
- **Work:**
  1. Add `placement` to the four Landing CTA call sites: nav secondary → `'nav'`,
     hero primary → `'hero'`, closing primary/secondary → `'closing'`.
  2. Remove the free-text `console.log` in QuickStart's `localStorage.setItem`
     catch block (replace with a content-free message or drop it).
  3. Optional rider: migrate `app_store_click` in `Download.jsx` from raw Vercel
     `track()` to `trackEvent()`.

### Packet 3 — Scenario.jsx verification

- **Files owned:** `frontend/src/Scenario.jsx`
- **Work:** No code changes expected. Verify §5 semantics — especially: switching
  scenarios from step 3 emits exactly one `scenario_step_viewed`, and every switch
  emits the intentional `scenario_opened` + step-1 `scenario_step_viewed` pair.
  Sign off the existing uncommitted diff.

### Documentation Packet (runs after Packets 1–3)

- **Files owned:** `docs/ANALYTICS_EVENTS.md`
- **Work:**
  1. Add `placement` (and its allowed values) to the Landing section.
  2. If the Download rider ran, update the "calls `track()` directly" note.
  3. Add one sentence to the Scenario section documenting the dual event per
     scenario switch.
  4. Add a Development Behaviour note that StrictMode double-logs mount events in
     dev only.

### Parallelization

- **Packets 1, 2, 3 may run fully in parallel** — their file sets are disjoint.
- **The Documentation Packet runs sequentially after Packets 1–3**, since it records
  the amendments and any deviations found during verification.
- **The integration checklist (§8) runs last, in a single session, after the
  Documentation Packet**, as the gate before any commit is requested.

---

## 8. Verification checklist

Run `cd frontend && npm run dev`, open the browser console, filter on `[analytics]`.
Use realistic but **non-identifying** test input — never real patient details.

1. **StrictMode baseline:** every mount event (`copilot_opened`,
   `quickstart_opened`, `scenario_opened`, `scenario_step_viewed`) logs **twice** in
   dev — expected; do not "fix."
2. **Saved case funnel:** submit a prompt → save → one `saved_case_created`;
   re-save the same response → nothing; edit note → Save → one
   `saved_case_note_edited { has_note: true }`; clear note → Save →
   `{ has_note: false }`; Cancel → nothing; reopen and delete → one event each.
3. **SBAR:** backend up → one `sbar_generated`; backend down → one
   `sbar_generation_failed`; copy → one `sbar_copied`. Exactly one generated/failed
   event per attempt.
4. **Copy sources:** copy from the main response (`source: 'copilot'`) and from a
   saved-case row (`source: 'saved_cases'`) — confirm the property differs.
5. **QuickStart → Copilot handoff:** chip click emits the internal `option_id`
   (never chip text); submit emits `quickstart_completed` and the Copilot textarea
   shows the prefill.
6. **Scenario:** full 3-step walk of scenario 01 (one `step_viewed` per
   transition); switch to scenario 02 from step 3 → exactly one
   `scenario_opened('02')` + one `scenario_step_viewed('02', 'scenario')`; complete
   scenario 03 → `scenario_completed` then QuickStart loads.
7. **Landing:** all four CTAs fire with correct `destination` and (post-Packet 2)
   correct `placement`.
8. **Privacy sweep:** search console output for any fragment of the typed test
   text — must appear **zero** times in `[analytics]` lines. Confirm
   `git grep -n "trackEvent" frontend/src` shows no payload sourcing a free-text
   variable (only IDs, modes, buckets, booleans, counts).
9. **Production smoke (post-deploy):** custom events appear in the Vercel
   Analytics dashboard; mount events are **not** doubled in production.

---

## 9. Definition of done

Phase 1B is done when **all** of the following hold:

1. Packets 1–3 are signed off: every event in §3 fires per the §5 semantics, with
   the §4 payloads, and nothing else.
2. The Packet 2 amendments are in place: Landing `placement` property on all four
   CTA call sites, and the QuickStart free-text `console.log` removed.
3. `docs/ANALYTICS_EVENTS.md` matches the shipped code exactly (Documentation
   Packet complete), including the ICU Drips sections previously undocumented.
4. The §8 verification checklist passes in full, including the privacy sweep with
   zero free-text hits.
5. No event outside §3 was added; every §6 rejection stands.
6. `frontend && npm run build` succeeds with no new warnings attributable to
   analytics changes.
7. All changes remain uncommitted until an explicit commit instruction is given
   (per project rules); no deployment config was touched.
