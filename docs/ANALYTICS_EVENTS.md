# Clinical Edge Analytics Events

Analytics are powered by **Vercel Analytics** (frontend-only, no custom backend).
The `<Analytics />` provider in `main.jsx` handles automatic pageview tracking on
URL changes. All custom events go through `trackEvent()` in `src/analytics.ts`.

## Privacy Rules

- **No clinical free text** — user-entered prompt content, clinical questions, and
  reasoning notes are never transmitted.
- **No patient information** — names, MRNs, dates of birth, room numbers, or any
  patient-identifiable data are never included.
- **No user identifiers** — no IP capture, no fingerprinting, no account IDs.
- **Prompt length** is stored only as a bucket (`short` / `medium` / `long`) —
  the actual text is never sent.
- Analytics failures are silently swallowed; they never affect the UI.

---

## Global / Navigation

| Event | When it fires | Payload |
|-------|---------------|---------|
| `copilot_module_opened` | User taps **Copilot** on the home hub | `{ route: "/" }` |
| `rhythm_lab_module_opened` | User taps **Rhythm Lab** on the home hub | `{ route: "/" }` |
| `icu_drips_module_opened` | User taps **ICU Drips** on the home hub | `{ route: "/" }` |
| `reference_hub_opened` | User taps **Reference Hub** on the home hub | `{ route: "/" }` |
| `abg_lab_opened` | User taps **ABG & Oxygenation Lab** on the home hub | `{ route: "/" }` |

> `reference_hub_opened` and `abg_lab_opened` reuse the same event name that
> each module also fires on its own mount (see the Reference Hub and ABG Lab
> sections below) — they are distinguishable only by payload: `{ route: "/" }`
> from the home hub vs. no payload from the module itself. Unlike Copilot and
> Rhythm Lab, Reference Hub and ABG Lab do not have separate `*_module_opened`
> event names.

> Automatic pageview events are also emitted by Vercel Analytics whenever the
> URL changes via `pushState` (handled by the `<Analytics />` component).

---

## Copilot

| Event | When it fires | Payload |
|-------|---------------|---------|
| `copilot_opened` | Copilot module mounts (once per session open) | `{ route: "/copilot" }` |
| `copilot_prompt_submitted` | User submits a query | `{ mode, prompt_length_bucket }` |
| `copilot_response_completed` | Streaming response finishes successfully | `{ mode }` |
| `copilot_response_error` | Any API or network error | `{ reason, status? }` |
| `copilot_offline_blocked` | Submit attempted while offline | _(no payload)_ |
| `copilot_continue_thinking` | User sends a follow-up update | `{ mode }` |
| `copilot_recent_case_used` | User taps a recent case to re-run it | _(no payload)_ |
| `copilot_response_copied` | User copies a response to the clipboard | `{ copy_scope, source }` |

**`prompt_length_bucket` values:** `short` (< 80 chars) · `medium` (< 300 chars) · `long` (≥ 300 chars)

**`reason` values for `copilot_response_error`:** `http_error` · `api_error` · `network_error`

**`copy_scope` values for `copilot_response_copied`:** `full_response` (only shape currently in the UI — there is no per-section or formatted-copy variant)

**`source` values for `copilot_response_copied`:** `copilot` (main response copy button) · `saved_cases` (copy button on a saved case row — same handler, different origin)

> Fired optimistically alongside the `navigator.clipboard.writeText()` call, matching the
> existing UI's own optimistic "copied" feedback state — the app does not currently
> distinguish clipboard success from failure for this action, so no `clipboard_copy_failed`
> event was added (would require changing existing clipboard-handling behavior).

---

## Saved Cases

Saved Cases live inside the Copilot page (`App.jsx`) — a nurse can save a
response, reopen it back into the input, edit a personal note, or delete it.
Storage is `localStorage` only; no case content is ever sent in analytics.

| Event | When it fires | Payload |
|-------|---------------|---------|
| `saved_case_created` | A case is successfully added to saved cases (not a duplicate re-save) | `{ source: "copilot", has_note: false }` |
| `saved_case_reopened` | User taps the reopen icon on a saved case, pulling it back into the input | `{ source: "saved_cases" }` |
| `saved_case_note_edited` | User clicks **Save Note** on a saved case (explicit commit — never fires per keystroke) | `{ has_note }` |
| `saved_case_deleted` | A saved case is removed | `{ source: "saved_cases" }` |

**Privacy note:** never sent — case question, response text, or note content.
There is no "clear all saved cases" action in the current UI, so no
`saved_cases_cleared` event exists.

---

## SBAR

SBAR generation and copy, also inside `App.jsx`.

| Event | When it fires | Payload |
|-------|---------------|---------|
| `sbar_generated` | An SBAR draft is successfully generated and rendered | `{ source: "copilot" }` |
| `sbar_generation_failed` | SBAR generation fails (non-OK response, API error, or network error) | `{ error_type: "request_failed" }` |
| `sbar_copied` | User copies the SBAR draft to the clipboard | `{ source: "copilot", copy_scope: "full_sbar" }` |

**Privacy note:** never sent — SBAR situation/background/assessment/recommendation text, or raw error messages.
The SBAR copy button copies one concatenated block; there is no per-section
copy in the current UI, so `copy_scope` is always `full_sbar`.

---

## QuickStart

| Event | When it fires | Payload |
|-------|---------------|---------|
| `quickstart_opened` | QuickStart page mounts | `{ source: "direct" }` |
| `quickstart_option_selected` | User taps one of the 3 predefined example chips | `{ option_id }` |
| `quickstart_completed` | The typed situation is saved to `copilot_prefill` and the user proceeds into Copilot | `{ destination: "copilot" }` |

**`option_id` values:** `bp_drop` · `confusion` · `chest_pain` (fixed internal ids for the 3 example chips — the visible chip text is never sent)

**Known limitation:** `source` is always `"direct"` — QuickStart's entry point (direct URL vs. the end of the Scenario walkthrough) is not currently threaded through navigation state, so it cannot be distinguished without adding new routing plumbing. Not added in this phase.

---

## Scenario Walkthrough

3 predefined scenarios (stable ids `"01"`, `"02"`, `"03"`), each a 3-step
walkthrough (`scenario` → `thinking` → `analysis`).

| Event | When it fires | Payload |
|-------|---------------|---------|
| `scenario_opened` | The Scenario page mounts, or the user switches to a different scenario | `{ scenario_id }` |
| `scenario_step_viewed` | The active step changes within a scenario (fires once per transition) | `{ scenario_id, step_id }` |
| `scenario_completed` | User taps "Try it on your own patient →" at the end of the last scenario (03), handing off to QuickStart | `{ scenario_id, destination: "quickstart" }` |

**`step_id` values:** `scenario` (step 1) · `thinking` (step 2) · `analysis` (step 3)

**Note:** `scenario_completed` only exists for the destination that actually occurs in the
UI today (QuickStart handoff from the final scenario). The nav bar's persistent
"Open App" shortcut is not treated as scenario completion — it's available on
every step and doesn't represent finishing the walkthrough.

---

## Landing

| Event | When it fires | Payload |
|-------|---------------|---------|
| `landing_primary_cta_clicked` | User taps "Try a real scenario →" (hero) or "Try Clinical Edge Copilot" (closing section) | `{ destination: "scenario", placement }` |
| `landing_secondary_cta_clicked` | User taps "Open App" (nav) or "Open Copilot" (closing section) | `{ destination: "copilot", placement }` |

**`placement` values:** `nav` (nav bar "Open App") · `hero` (hero "Try a real scenario →") · `closing` (closing section, either button)

**Note:** the hero's "See How It Thinks" button only smooth-scrolls to an
in-page demo section — it has no navigation destination and was intentionally
left uninstrumented.

---

## Download

| Event | When it fires | Payload |
|-------|---------------|---------|
| `app_store_click` | User taps the official App Store badge | `{ page: "download", destination: "app_store" }` |

**Note:** this event goes through `trackEvent()` like every other event in this
document — documented here to close a gap that previously existed in this
file, not changed. The Android notice on this page is UA-detected passive
rendering, not a user action, so no `download_android_notice_viewed` event was
added. There is no separate "web app" link on this page.

---

## Rhythm Lab

| Event | When it fires | Payload |
|-------|---------------|---------|
| `rhythm_lab_opened` | Rhythm Lab module mounts | `{ route: "/rhythm-lab" }` |
| `rhythm_selected` | User taps a rhythm card | `{ rhythm_id, urgency }` |
| `rhythm_detail_viewed` | RhythmDetail mounts or rhythm id changes | `{ rhythm_id }` |
| `rhythm_practice_opened` | User opens Practice Mode | _(no payload)_ |
| `rhythm_practice_reveal` | User reveals the rhythm in Practice Mode | `{ rhythm_id, clues_shown }` |
| `rhythm_sprint_opened` | User opens Sprint Mode | _(no payload)_ |
| `rhythm_sprint_reveal` | User reveals a sprint card | `{ rhythm_id, selected_rate, selected_regular }` |
| `rhythm_confusables_opened` | User opens Confusables | _(no payload)_ |
| `rhythm_confusable_pair_selected` | User switches to a different confusable pair | `{ pair_id }` |
| `rhythm_confusable_breakdown_opened` | User expands full A/B comparison | `{ pair_id }` |
| `rhythm_compare_opened` | User opens Compare Mode | _(no payload)_ |

**`urgency` values:** `normal` · `monitor` · `urgent` · `critical`

**`selected_rate` values:** `slow` · `normal` · `fast`

**`selected_regular`:** boolean (`true` = regular, `false` = irregular)

**`clues_shown`:** integer 0–2 (how many clues were shown before reveal)

---

## ICU Drips

| Event | When it fires | Payload |
|-------|---------------|---------|
| `icu_drips_opened` | ICU Drips module mounts | `{ route: "/icu-drips" }` |
| `drip_selected` | User taps a drip from the home list | `{ drip_id, family, category }` |
| `drip_detail_viewed` | Drip detail page is displayed (from list or related-drip navigation) | `{ drip_id }` |
| `drip_compare_opened` | User opens Quick Compare (fires alongside `hemodynamic_compare_opened`, below) | _(no payload)_ |
| `drip_compare_pair_selected` | User selects a specific comparison pair (fires alongside `hemodynamic_compare_pair_selected`, below) | `{ pair_id }` |
| `drip_category_filter_used` | User filters by a category (not "All") | `{ category }` |
| `icu_drips_compare_entry_clicked` | User taps the "Common ICU confusions" home action card | `{ source: "home_action" }` |

The following event groups were implemented but previously undocumented.
Names and payloads below were verified directly against the current code.

**Hemodynamic Compare**

| Event | When it fires | Payload |
|-------|---------------|---------|
| `hemodynamic_compare_opened` | Fires alongside `drip_compare_opened` when Quick Compare is opened | _(no payload)_ |
| `hemodynamic_compare_pair_selected` | Fires alongside `drip_compare_pair_selected` when a comparison pair is selected | `{ pair_id }` |
| `drip_hemodynamic_compare_viewed` | The hemodynamic compare matrix renders for a pair where both drips have hemodynamics data | `{ pair_id }` |
| `hemodynamic_compare_detail_expanded` | User expands the "Detailed comparison" table (fires on open only, not on collapse) | `{ pair_id }` |
| `clinical_scenario_viewed` | A compare pair's Clinical Scenario card is displayed | `{ pair_id }` |

**Practice Mode**

| Event | When it fires | Payload |
|-------|---------------|---------|
| `icu_drips_practice_opened` | Practice Mode is entered (initial open or "Practice again" restart) | _(no payload)_ |
| `icu_drips_practice_answered` | User answers a practice question | `{ question_id, correct }` |
| `icu_drips_practice_completed` | All practice questions are answered | `{ score, total }` |
| `icu_drips_practice_review_drip_clicked` | User taps a "Review [drip]" link (from per-question feedback or the end-of-practice summary) | `{ drip_id }` |

**Shift Challenge**

| Event | When it fires | Payload |
|-------|---------------|---------|
| `icu_drips_shift_challenge_opened` | Shift Challenge is entered (initial open or "Start over" restart) | _(no payload)_ |
| `icu_drips_shift_challenge_answered` | User answers a shift challenge | `{ challenge_id, correct }` |
| `icu_drips_shift_challenge_completed` | All shift challenges are answered | `{ total }` |
| `icu_drips_shift_challenge_review_drip_clicked` | User taps a "Review [drip]" link from challenge feedback | `{ drip_id }` |

**Clinical Pearls**

| Event | When it fires | Payload |
|-------|---------------|---------|
| `icu_drips_pearl_opened` | User taps a pearl to open it (from the home card or a "More pearls" link) | `{ pearl_id }` |
| `icu_drips_pearl_viewed` | The Pearl view renders or the active pearl id changes | `{ pearl_id }` |
| `icu_drips_pearl_related_drip_clicked` | User taps a related-drip link from within a pearl | `{ drip_id }` |

**`correct` values:** boolean — whether the selected answer matched the correct option

---

## Clinical Trust Layer

Shared "Sources & review" disclosure used on content-module detail pages. One
event name is reused across modules (rather than a module-prefixed variant)
so the trust interaction stays comparable as it's extended beyond ICU Drips.

| Event | When it fires | Payload |
|-------|---------------|---------|
| `clinical_sources_opened` | User expands the "View sources and review details" disclosure | `{ module, source_context }` |

**`module` values:** `icu_drips` (currently the only module wired up; `rhythm_lab`,
`reference_hub`, `abg_lab` planned for later phases)

**`source_context` values currently in use:** `medication_detail` (ICU Drips
medication detail page)

---

## Reference Hub

| Event | When it fires | Payload |
|-------|---------------|---------|
| `reference_hub_opened` | The hub (search + browse) view mounts — on initial module entry, and again each time the user navigates back to it from a reference, pathway, or concept detail view | _(no payload)_ |
| `reference_category_selected` | User selects a category filter | `{ category }` |
| `reference_search_used` | User types into the reference search field | `{ query_length }` |
| `reference_viewed` | A reference entry is displayed | `{ reference_id, category }` |
| `reference_related_clicked` | User taps a related reference from a reference entry | `{ from_ref_id, to_ref_id }` |
| `reference_pathway_opened` | User opens a clinical pathway | `{ pathway_id }` |
| `reference_pathway_related_clicked` | User taps a reference linked from a pathway | `{ pathway_id, reference_id }` |
| `reference_concept_opened` | User opens a concept entry | `{ concept_id }` |
| `reference_concept_pathway_clicked` | User taps a pathway linked from a concept | `{ concept_id, pathway_id }` |
| `reference_concept_reference_clicked` | User taps a reference linked from a concept | `{ concept_id, reference_id }` |

**`query_length`:** integer character count of the search query (the query text itself is never sent)

---

## ABG Lab

| Event | When it fires | Payload |
|-------|---------------|---------|
| `abg_lab_opened` | ABG Lab module mounts | _(no payload)_ |
| `abg_interpreted` | An ABG interpretation is generated (manual entry or example) | `{ pattern, has_pao2, has_fio2 }` |
| `abg_example_used` | User loads a preset example case | `{ example_id }` |
| `abg_cleared` | User clears the current ABG entry | _(no payload)_ |

**`pattern`:** the interpreted acid-base disorder label (e.g. `"Respiratory acidosis"`, `"Within normal limits"`) — a fixed classification result, not user-entered text

**`has_pao2` / `has_fio2`:** booleans indicating whether those optional fields were filled in (values themselves are never sent)

---

## Backend Persistence

**Vercel Analytics only.** No custom backend analytics endpoint is used.
Events are visible in the Vercel project dashboard under the Analytics tab.
`trackEvent()` in `src/analytics.ts` routes directly to Vercel's `track()` function.
No additional infrastructure is required.

---

## Development Behaviour

In development (`import.meta.env.DEV === true`), `trackEvent()` logs to
`console.debug` and makes no network requests. All event names and payloads
are visible in the browser console for easy verification.
