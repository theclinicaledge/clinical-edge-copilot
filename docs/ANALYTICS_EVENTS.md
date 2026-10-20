# Opt-in product analytics release plan

This candidate replaces the Vercel Analytics frontend collector with one manual PostHog capture integration. It has no PostHog SDK, automatic pageviews, click capture, session replay, input capture or backend analytics endpoint. The public project token and regional capture host must both be configured before events can be sent. Never use a personal API key in the frontend.

## Release configuration

1. The intended PostHog project is **671008 (US Cloud)**, with capture host `https://us.i.posthog.com`. The public project token is configured only in the ignored local `frontend/.env` for development; it is not committed. Review residency, retention, IP/geolocation settings, access controls and any required contractual terms before activation.
2. After founder approval, set `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` for the production frontend build in Vercel. These are public build-time settings, not secrets. Do not put a private PostHog API key in the client. Redeploy through the approved release process.
3. Update App Store privacy disclosures and review notes for the new analytics recipient and pseudonymous device identifier before releasing to the iOS wrapper. The app privacy page and versioned consent are updated here. Stored consent v3 is invalidated; users must opt in again.
4. Designated founder testers can visit with `?ce_analytics=exclude` once to save a device-local exclusion. Remove `ce_product_analytics_exclude` in localStorage when testing ends. Local Vite builds and automated browsers are excluded. This is device-specific and does not retroactively remove earlier events.
   Approved attribution tokens are source `instagram`, `tiktok`, `youtube`, `reddit`, `facebook`, `email`, `friend`, `community`, `student_group`, `qr`; medium `social`, `email`, `referral`, `community`, `qr`; campaign `fl04`, `student_feedback`, `public_beta`. Other values are discarded, not transmitted.
5. With no token, analytics stays off. An empty dashboard does not mean zero usage.

## Strict event contract

All event names and properties are allowlisted in `frontend/src/productAnalytics.js`. PostHog timestamps events on ingestion; the client sends a random event UUID and a device-local random distinct ID only after opt-in. It never sends Ask text, answers, clinical values, Shift choices, names, email, form input, raw error text, clipboard content or query strings. Campaign attribution accepts only enumerated category tokens; arbitrary URL values are discarded. Requests send no browser cookies or referrer. The analytics ID is separate from the Ask quota ID. The recipient still sees network metadata such as IP address when receiving an event.

| Event | Properties | Meaning |
| --- | --- | --- |
| `page_viewed` | `route`, validated `utm_source`, `utm_medium`, `utm_campaign` | One route view, not every rerender |
| `feature_opened` | `feature` | Major feature mount; do not add to page views when counting visits |
| `core_task_failed` | Fixed `feature` and `failure` category | Core screen unavailable, without raw error text |
| `ask_submitted`, `ask_succeeded`, `ask_failed` | `kind` (`question` or `followup`), fixed failure category where applicable | Submitted turn, delivered answer, or withheld/error result |
| `tool_started`, `tool_completed`, `tool_failed` | Fixed tool, fixed failure category | Explicit action where defined; not a claim of clinical competence |
| `shift_started` | `scenario`, `version`, `play_id` | New play leaving the initial screen |
| `shift_resumed` | `scenario`, `version`, `play_id`, `step` | Returning to unfinished saved play |
| `shift_step_reached` | `scenario`, `version`, `play_id`, `step` | Reached a scenario step; not an answer or score |
| `shift_decision_reached` | `scenario`, `version`, `play_id`, `step` | Reached an authored decision screen, without recording the choice |
| `shift_completed` | `scenario`, `version`, `play_id` | Debrief reached; not evidence of clinical skill |
| `app_store_badge_clicked` | `placement` (`landing`, `download`, `footer`, `learn`) | Existing App Store badge interest; not a confirmed installation |

`play_id` is random per local play and is used to deduplicate the funnel. It is cleared on restart or analytics withdrawal. Saved progress remains separate and device-local. If storage is cleared, a device changes, or consent is declined, identity and retention cannot be reconciled. Native iPhone WebView versus mobile Safari is not labeled because the wrapper does not supply a reliable explicit marker.

## Prepared PostHog dashboard

The [Clinical Edge - Opted-in product use dashboard](https://us.posthog.com/project/671008/dashboard/2224007) is saved in project 671008. It is labeled **opted-in tracked devices and plays**, not all users. Do not backfill or fabricate historical data. Every real-app capture sets fixed `analytics_origin=app`; synthetic setup events use `analytics_origin=test` and `is_test=true`. The saved dashboard default and the saved insights positively filter to `analytics_origin=app`. The dedicated `ce_analytics_ingestion_test` event is never a usage metric. The dashboard currently has no real-app data because this candidate has not been released.

PostHog ingestion returned HTTP 200 for clearly labeled setup events, and those events appeared in Activity while the real-use dashboard showed no matching events. The setup events contain no clinical or Ask content. Project settings were inspected in the authenticated US Cloud UI: **Discard client IP data ON**, **web autocapture OFF**, **web-vitals autocapture OFF**, **session replay OFF**, and **person last-seen tracking OFF**. IP discard was enabled after the first setup events, so do not claim it applied retroactively.

Saved dashboard views:

1. Daily active opted-in devices, unique `page_viewed` distinct IDs.
2. Shift start-to-completion funnel, aggregated by `properties.play_id` and broken down by scenario.
3. Feature opens, broken down by the fixed `feature` property; these are opens, not unique people or completed tasks.
4. Ask turns submitted, delivered, and failed/withheld, as separate event counts. Do not interpret these as clinical accuracy or a matched-turn conversion rate.
5. Return visits on days 1-7, `page_viewed` to a later `page_viewed` by the same opted-in device ID.
6. Campaign-tagged pageviews, broken down by allowlisted event `utm_source` or `unknown`.

The dashboard does **not yet** show an exact last-decision distribution for incomplete Shift plays or a tool start-to-completion rate. Both event types are captured by the candidate, but those analyses should be configured and checked against actual opted-in data after release; do not infer abandonment from a still-open play or compare unmatched raw tool event totals as a success rate. The saved Ask view likewise shows counts, not a verified per-turn success rate. No historical app usage is represented by the setup events.

## Analysis definitions

1. **Active users and feature usage:** unique `distinct_id` on `page_viewed` by day. A route breakdown can be added separately; the saved daily-active chart has no route breakdown. Keep `feature_opened` as a separate chart, never sum both.
2. **Shift start-to-completion:** funnel `shift_started` to `shift_completed`, holding `scenario` and `play_id` constant; filter or break down by `scenario` and `version`. Count unique plays, not raw events.
3. **Last step before leaving:** for `play_id`s with `shift_started` but no `shift_completed` in the observation window, show maximum `shift_step_reached.step`. Treat open or recently resumed plays as incomplete, not definitively abandoned.
4. **Ask and tools:** `ask_succeeded` / `ask_submitted` and `ask_failed` by fixed failure category; tool completion/start by tool. Pending turns are neither success nor failure.
5. **Seven-day return:** retention of `page_viewed` users on a later calendar day within seven days, using the opt-in distinct ID. This is device-level return, not person-level retention.
6. **Acquisition:** the saved chart counts all `page_viewed` events by validated UTM source, labeling missing UTM as unknown. It is not a first-touch attribution chart. Do not imply cross-device attribution.

Use PostHog's dashboard, funnel and retention builders; do not configure automatic capture. Check the actual account's billing and retention controls before activation. The free product-analytics allowance is currently advertised as 1 million events per month; verify the account's current plan at activation. Vercel Hobby analytics remains available for historical pageview context but is no longer emitted by this frontend candidate; its old counts are not directly comparable with opt-in PostHog data.

Med-Surg Clinical private pilot: `/learn/med-surg` and its assignment paths exclude
all capture events. No new lifecycle events were added to the existing allowlist.
Autocapture/session recording SDKs are not introduced. Choices, reasoning, chart
inspection, findings, outcome labels, feedback and local reports stay on-device.
Consent and withdrawal are unchanged; no record is submitted to an AI route.
