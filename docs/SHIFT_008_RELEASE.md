# Shift 8 v0.8.1 release candidate

## Approval boundary

Prepared on release/shift8-code-blue-v081 from main 8663fdb9af3474cb9154f0df347eaede1893e33d.
Do not merge, deploy or publicly activate until final founder approval.
The founder-attested confidential educator approval and narrow E-1 amendment are recorded in SHIFT_008_E1_GOVERNANCE.md. No signed verification record or formal validation is claimed.

## Integration

- Permanent route: /learn/shifts/code-blue. Library entry is eighth; normal Show more/filter navigation applies.
- Existing reviewed private v0.8.1 content and gameplay reused, including manual operator Priya, sequential 2c decisions, both shocks, original/prompted credit, recorder receipt, handoff feedback, Replay and Rewind.
- No clinical decision or medication dialogue changes. Reviewed decision-data fingerprint matches the private source exactly.
- Review-status wording reflects the new attestation; a code-record status suffix now says fictional educational values rather than pending review. Values, event times and ownership are unchanged.
- Existing v0.8.1 main/replay and v0.6 Rewind storage identifiers are deliberately retained. v0.7 attempts are not loaded, migrated, overwritten or regraded.
- No new backend, provider calls, analytics, dependency, inputs or accounts. Shift 8 analytics is disabled. Tests use synthetic local fixtures, decline analytics and block external traffic.
- No private HTML entry points, review packets, reviewer identity or provisional illustration assets are bundled. Existing reviewed text-based scene states are retained.
- Shared edits are additive routing, registry and renderer entries, a legacy route-list test expectation, and exact-branch Vercel guards. No Shifts 1-7 or Shift 9 implementation files changed.

## Checks completed locally

- Production build: pass; 9/9 existing prerender routes. Existing main-bundle size warning remains.
- Full frontend lint: pass.
- Frontend logic tests: 107 pass, 1 pre-existing skip, 0 failures.
- Backend tests: 934 pass, 0 failures (local socket permission required outside sandbox).
- Shift 8 browser suite: 38 unique desktop/phone checks passed across the initial run and corrected-fixture reruns. Initial fixture failures were readiness races and a too-short total budget for the exhaustive refresh loop; no assertion was removed.
- Final built-artifact browser checks: 6/6 pass at 1440x1000 and 390x844. Library/direct route/refresh/resume/debrief review, all seven existing scenario routes, unchanged storage sentinels, keyboard feedback, reduced motion, mobile dock clearance, no overflow or page errors.
- Covered all staffing paths, all main choices, safety correction paths, operator attribution, D-1/D-2 timing, record availability/attribution, handoff/read-back pauses, saved drafts, Replay, Rewind and restart.
- Security/scope: no new network collectors or clinical inputs; no credentials/private paths/review packets/provisional assets in the Shift 8 bundle; diff whitespace check passes.

## Source checks and limitations

S11 and S13 official URLs were accessed successfully during this pass:

- S11: https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-advanced-life-support-guidelines
- S13: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support

S11 supports manual-device safety principles, not US medication timing or local nursing privileges. S13 supports single-shock/immediate-CPR principles. Claim 24 is limited to the initial assessment in this case. Claim 25 has indirect ethical support, not evidence of universal hospital policy; this limitation remains visible in source metadata and feedback.
Publisher pages are linked, not reproduced; no publisher figures/PDFs are bundled and no blanket reuse license is claimed.

Physical-iPhone and VoiceOver testing were not performed. Browser keyboard/accessibility basics are not an exhaustive assistive-technology audit. No production synthetic gameplay was generated. Unrelated full-app browser suites were not rerun; existing scenario route access and all frontend logic/backend tests were checked.

## Deployment hold

Both root and frontend vercel.json disable automatic Git deployment for the exact release branch only. Other branches, main build settings and production environment settings are unchanged.
Official behavior: https://vercel.com/docs/project-configuration/git-configuration
Check PR remote status after pushing. Do not override required checks or enable auto-merge.

## Rollback

Last verified production revision: 8663fdb9af3474cb9154f0df347eaede1893e33d.
GitHub production deployment: 7308326626 (success, 2026-10-25T04:00:01Z).
Deployment URL: https://clinical-edge-copilot-ja0yfp74j-theclinicaledges-projects.vercel.app
Production alias: https://theclinicaledge.org

If a later approved release fails, restore/promote the above known-good deployment through the established Vercel process, then revert the approved integration merge through a separate reviewed PR. Do not reset shared history or delete local attempts. Existing private attempts remain independently recoverable.

## Final gate

No local functional/security blocker identified. Founder approval to merge/deploy remains mandatory. Confirm remote PR/check status and production baseline before acting on a later release authorization.
