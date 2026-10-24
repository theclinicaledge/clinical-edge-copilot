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

## Verification

- Manual live walkthrough: all 11 history questions, opening actions, timeline, water/contact decisions, handoff, all debrief disclosures and all three Rewind cases. All Rewind alternatives were selected; not every alternative was submitted as a separate attempt.
- Manual local walkthrough: missed activation and charge-nurse credit, device-only history, all three new classification labels, unsafe water correction, missing contact plan, sparse honest handoff, full answer disclosure and reload. The full answer did not appear in the original spoken report. Desktop and 390px mobile layout inspected; mobile document width remained 390px.
- Frontend lint passed. Frontend Node suite: 90 passed, 1 skipped, 0 failed. Backend: 934 passed. Production build and 9/9 prerender routes passed. Diff whitespace check passed.
- Added regression coverage for released saved attempts and browser coverage for the explanation/record boundary. Browser test runner was blocked before assertions by macOS Chromium sandbox launch permissions. The new browser test still needs execution in CI; manual browser review is not a substitute for all automated paths.
- Physical iPhone testing was not performed. No claim of exhaustive clinical validation or every possible browser branch.

This report describes the local clarity patch, not a production deployment.
