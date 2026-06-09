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

**`prompt_length_bucket` values:** `short` (< 80 chars) · `medium` (< 300 chars) · `long` (≥ 300 chars)

**`reason` values for `copilot_response_error`:** `http_error` · `api_error` · `network_error`

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
| `drip_compare_opened` | User opens Quick Compare | _(no payload)_ |
| `drip_compare_pair_selected` | User selects a specific comparison pair | `{ pair_id }` |
| `drip_category_filter_used` | User filters by a category (not "All") | `{ category }` |

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
