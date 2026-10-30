# Shift 9 v0.10 release: The Quiet Complaint

## State

Release branch: release/shift9-quiet-complaint-v010, from GitHub main ca5ad27b3b8dcc9abeb7588ba4c93d1422dde28d (fetched 29 Oct 2026).
Release authorized by the founder on 29 Oct 2026 after his ECG review ("I reviewed the ECG and it passes... I authorize you to check all pending items and complete the release"). Same workflow as Shift 10: GitHub PR, merge, automatic Vercel Git deployment. No Vercel, Render or environment-variable change.

## What changed

- `routing.js`, `integrated/registry.js`, `ShiftExperience.jsx`: the `VITE_SHIFT_009_PREVIEW` gate is removed, so Shift 9 is routable at `/learn/shifts/quiet-complaint` and listed in the Library as 09. It is registered after Shift 10, so every existing Shift keeps its original order.
- Review wording (`shift9/data.js`, `metadata.js`, `Shift9.jsx` footer, `Shift9Rewind.jsx`): "specialist ECG validation pending" becomes the founder ECG review of 29 Oct 2026, stated as founder-attested and not an independent specialist validation.
- Scenario text, choices, scoring, feedback, ECG images and save keys are unchanged. Scenario analytics stay off (`analytics: false`). No new network calls or third parties.
- Tests: the route list assertion now includes `quiet-complaint`; the Shift 9 Playwright config runs on the production flag set, without the preview flag.

## Pending items checked (29 Oct 2026)

| Item | Disposition at release |
| --- | --- |
| Founder sign-off of v0.10 | Done 28 Oct 2026 (founder-attested). |
| Independent clinical review | Founder-reported 28 Oct 2026; reviewer, credentials and date not supplied. |
| Psych specialty review (Room 21, D4) | Founder-reported 28 Oct 2026; scope not supplied. |
| Specialist ECG validation | Founder ECG review passed 29 Oct 2026 (founder-attested). Independent specialist validation is not recorded; the learner-facing footer says "reviewed by the founder". |
| Open reviewer questions (spec Part F: D1 Marco credit, Rewind C Close, alt text, D2, D3, Rewind B and C, D4 psych items, lead II) | Not answered item by item. Covered by the founder-reported reviews and accepted as shipped by the release authorization. Checkboxes left as they were. |
| D5 Marco build note ("Mohamed to confirm") | Shipped as built; the 64-placement check in `docs/shift-009-v0.10/d1-all-64-placements.md` shows the matching D5 opening for every placement. Accepted by the release authorization. |
| Estimated time 10 to 12 minutes | Founder decision 27 Oct 2026, recorded in the sign-off. |
| Two Rhythm Lab Go further buttons | Still hidden; no unverified link ships. |
| Sources 3, 4, 5 (ACC summaries) and 14 (DOI) | Links open (HTTP 200). Full-text passage verification is still not recorded and stays disclosed in Sources & review. |
| Source links, all 16 | 14 returned HTTP 200. Source 12 (AHA PDF) serves the file in a browser; automated fetches get 403. Source 1 (StatPearls Point-of-Care) redirected to the StatPearls search page in a fresh browser session, so it may need sign-in; the citation is unchanged and flagged for a follow-up link check. |
| Facility-variation questions | Left for local practice; the scenario already says escalation names and roles vary by hospital. |

## Checks

- Frontend unit tests: 204 passed, 0 failed, 1 existing skip. ESLint passed.
- Backend `npm test`: 938 passed, 0 failed.
- Production-flag build (`VITE_SHIFT_ENABLED=true vite build`, to a scratch folder): passed; Shift 9 chunks are in the bundle.
- Shift 9 Playwright suite on production flags, desktop and phone: 78 passed, 0 failed.
- Full Playwright suite: results in the PR description. Failures that also fail on main before this change are listed there and not investigated here.
- Not done: physical iPhone, App Store WebView and VoiceOver testing.

## Rollback

Pre-release production: GitHub deployment 7404915416 (success) at main ca5ad27b, artifact https://clinical-edge-copilot-ach31hby0-theclinicaledges-projects.vercel.app.
If post-deployment checks fail, promote that artifact through the established Vercel process, then revert this release through a separate PR. Do not reset shared history or clear saved attempts.
