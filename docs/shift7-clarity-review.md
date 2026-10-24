# Shift 7 clarity review, 2026-10-24

Scope: clarify the timeline classification task and provide an explicit case answer after handoff. No changes to treatment decisions, other Shifts, analytics, or backend behavior.

## Changes

- Three plain-language timeline choices with an expandable definition guide and numbered instructions. Stored classification values remain compatible with released attempts.
- Review shows the supported classification and limit, including unanswered cards.
- A compact, expandable case explanation separates approximately 0600 (patient-reported last known well), approximately 0630 (patient-estimated symptom recognition), and 0715 (wife's discovery). It does not invent an exact onset.
- The full explanation is separate from the original performance record. Undiscovered history does not enter the learner's handoff or earn credit.
- Released 1.0.0 attempts migrate to 1.0.1 without losing choices.

## Clinical basis

The AHA 2021 nursing statement says last known normal should not be confused with discovery and can be obtained from the patient or witnesses, including conversations. The AHA/ASA 2026 guideline supports evaluation of selected unknown-onset patients; unknown onset is not a universal exclusion. All case times remain fictional, source-qualified history.

- https://www.ahajournals.org/doi/10.1161/STR.0000000000000356
- https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know

## Original preparation verification

- Manual live walkthrough: all 11 history questions, opening actions, timeline, water/contact decisions, handoff, all debrief disclosures and all three Rewind cases. All Rewind alternatives were selected; not every alternative was submitted as a separate attempt.
- Manual local walkthrough: missed activation and charge-nurse credit, device-only history, all three new classification labels, unsafe water correction, missing contact plan, sparse honest handoff, full answer disclosure and reload. The full answer did not appear in the original spoken report. Desktop and 390px mobile layout inspected; mobile document width remained 390px.
- Frontend lint passed. Frontend Node suite: 90 passed, 1 skipped, 0 failed. Backend: 934 passed. Production build and 9/9 prerender routes passed. Diff whitespace check passed.
- Added regression coverage for released saved attempts and browser coverage for the explanation/record boundary. Browser test runner was blocked before assertions by macOS Chromium sandbox launch permissions. The new browser test still needs execution in CI; manual browser review is not a substitute for all automated paths.
- Physical iPhone testing was not performed. No claim of exhaustive clinical validation or every possible browser branch.

The entries above describe preparation of commit `2b206e1`, not a production deployment.

## Release source check (2026-10-24 UTC)

- Verified the AHA-hosted full 2021 nursing statement, page 3, last-known-normal discussion: history may come from the patient and witnesses; last known normal is not discovery. The journal HTML returned 403, but the same primary statement was accessible from AHA's official PDF: https://www.heart.org/en/-/media/Files/Professional/Quality-Improvement/Stroke-Month-2021/Nursing-Guides/Care-of-the-Patient-With-Acute-Ischemic-Stroke-Prehospital-and-Acute-Phase-of-Care-Update-to-the-200.pdf?sc_lang=en
- Verified AHA's 2026 guideline summary, item 3, which describes evaluation/treatment of selected unknown-onset patients using advanced imaging criteria. This supports the limited statement that unknown onset is not automatic exclusion; it does not establish eligibility in this fictional case.
- The explanation consistently qualifies 0600 as approximate, reported by Walter, with speech unestablished; 0630 as estimated symptom recognition; 0715 as discovery; and exact onset as uncertain. No clinical wording was changed during release verification. This is source alignment, not independent clinical validation.

## Release preparation scope

- Continued the existing clean checkout and `2b206e1`; production main remained `ae7c82c65b1886c7c675b9527303dd3ad87bbae6`.
- Added browser coverage to the existing Shift 7 suite, not a replacement implementation.
- Fixed a real narrow-phone readability issue: timestamps stack above evidence on mobile. At widths up to 360px, a wrapping selected-value line preserves complete wording when a native select truncates it. Native controls and accessible names remain intact; the redundant visual line is hidden from assistive technology.
- Other scenarios, Scenario 6's preview flag, backend, Ask, analytics, consent and deployment configuration are unchanged.
- Rollback reference before release: Vercel `dpl_7k2jTD2neAj9obXB1RYnFY6vCXkh`, revision `ae7c82c65b1886c7c675b9527303dd3ad87bbae6`, successful GitHub production deployment `7293619462`. Restore that deployment through the existing Vercel rollback workflow; do not clear saved progress or change feature flags.

## Completed release checks

- Lint passed; frontend Node tests: 90 passed, one existing skip; backend: 934 passed. Final production build passed with 9/9 prerenders and the existing large-chunk warning.
- Compiled production configuration (`VITE_SHIFT_ENABLED=true`, `VITE_SHIFT_006_PREVIEW=false`): 34/34 desktop/phone browser checks passed. All 11 questions, all seven timeline cards and their option values, all nine Rewind responses, sparse and complete histories, delayed activation, unsafe water correction, absent contact, original handoff isolation, keyboard type-ahead/buttons/disclosures, restart cancellation, and 1.0.0 migration were exercised. Each Rewind response was submitted in its own isolated attempt.
- Existing Shift continuity/library/progress/review/next-step and production restrictions: 24 passed; 23 Scenario 6 preview-only tests intentionally skipped under production flags. Its public exclusion test passed. Prior broad-suite baseline findings on unchanged main remain separate; this targeted run does not claim a fully green unrelated suite.
- Actual browser screenshots inspected at 320, 390 and 1440px. The narrow selected-value regression passed after the layout fix. No horizontal document overflow; timeline and expanded answer content remained scroll-accessible above the dock.
- Initial newly added desktop keyboard test failed because headless macOS did not drive the native menu popup. Reproduced that limitation with a plain standalone select; keyboard type-ahead works and is asserted instead. No application behavior was weakened to pass a test. An initial temporary runner also loaded a mismatched Playwright installation; corrected its import before the final run.
- Synthetic local saves only; browser tests block analytics and API/provider requests. No paid provider calls. No physical-iPhone/native-wrapper or VoiceOver testing in this release task. Browser checks and source review do not establish exhaustive clinical validation.
- Production deployment and live results will be recorded on the release PR after the authorized GitHub/Vercel workflow completes.
