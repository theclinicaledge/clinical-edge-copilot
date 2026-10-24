# Shift 7: The Missing Time

Content version 1.0.0. Final content, branching and interface check: October 23, 2026.

Mohamed reports that he and a nurse colleague reviewed the scenario together and authorizes release after this final check. The colleague’s identity, specialty and review date were not supplied; none are inferred. This record does not claim external certification or clinical competency validation.

## Release scope

Public route: `/learn/shifts/missing-time`, under the existing Shift feature gate. Shift 6 remains behind its existing preview flag. No content in Shifts 1–6, backend, accounts, gameplay AI or analytics was added or changed. Shift 7 does not emit new scenario analytics.

The library now has populated specialty filters, six cards before Show more, and a continue link for an unfinished shift. Completed cards retain Review debrief. The duplicate standalone debrief section was removed.

## Screen-by-screen review

| Stage | Reviewed behavior |
| --- | --- |
| Arrival | Fictional EMS radio report deliberately mislabels discovery as onset. Original evidence-board illustration establishes the timeline interaction. Three-step instructions explain the task. |
| First response | New focal findings warrant prompt response under the explicitly fictional protocol. Learners select concurrent actions, then confirm. Omitted activation is performed and credited to Ana at 0800. Missing assessment, glucose, NPO and IV selections receive coordination feedback without invented completion. |
| Conversations | Unlimited questions; follow-ups depend on the relevant parent question. Answers appear inline. Only acquired evidence becomes a card. Cards distinguish source, event, classification and limits. No last-known-well lane forces a timestamp. |
| Bedside | Water and contact decisions are independent, with separate confirmation. An unsafe sip is stopped before administration; Ana receives credit for correction. A phone number or an agreed nearby meeting is acceptable. Neither invents the other. |
| Handoff | Only available facts are offered, except the deliberately unqualified radio-report distractor. Most recent obtained baseline, symptom estimate, discovery, findings and uncertainty are required when available. Qualified approximately 0600 per patient is accepted. Optional evidence and actions remain attached. |
| Reflection | Original choices remain intact. A sparse but honest report explicitly identifies history gaps rather than claiming complete success. Missing-history feedback names questions, not undiscovered answers. Collapsible review sections keep the initial view compact. |
| Ending | Team receives the report and accompanies Walter to imaging. Contact follows the selected plan; if none was arranged, successful contact is not asserted. No diagnosis, therapy or recovery is promised. |

## Timeline consistency

All times and findings are authored fictional case facts, not sourced patient data.

| Time | Source and meaning |
| --- | --- |
| 2230 prior night | Linda saw and talked with Walter, reporting normal baseline. |
| Approximately 0300 | Linda heard a clear short conversation and felt him return to bed; face and arm function were not assessed. This remains useful history. |
| Approximately 0600 | Walter reports feeling fine making coffee. If clarified, he describes holding the mug left-handed and pouring right-handed; he had not spoken to anyone. |
| 0605 | Linda reports an appliance-app start record. It does not identify the operator or establish neurological function in this case. |
| Approximately 0630 | Walter estimates noticing his arm symptoms. This is reported symptom timing, not an exact established onset. |
| 0715 | Linda discovered symptoms. EMS later clarifies its earlier label. |
| 0731 | EMS-reported glucose 142 mg/dL, obtained only when that scene question is asked. |
| 0750 / 0758 | Radio report with eight-minute ETA; bedside arrival. |
| 0759 or 0800 | Learner activation or Ana’s activation, respectively. |
| 0801 / 0802 | Current glucose 138 mg/dL only if selected; history screen follows at 0802. |
| 0803 / 0806 / 0812 | Bedside requests, team handoff, transition to imaging. These story times do not impose a real-time countdown. |

No global statement says nobody heard speech after 0300: speech is observed at arrival and described at discovery. Uncertainty is specifically attached to the early-morning account and exact onset.

## Rewinds

Each case provides replacement history and preserves a separate result.

- Breakfast: Linda’s normal-function account through 0650 replaces the older baseline report; 0715 remains discovery.
- Camera: silent footage with explicitly unassessable face/arm function is reported with limits, without becoming confirmed baseline. The 2230 witness report and 0715 discovery remain separate.
- Neighbor: 1900 baseline report, 0900 discovery, 0935 arrival. Activation follows the stated fictional rule; neither unknown onset nor elapsed time becomes an automatic exclusion. Correct action with an incorrect onset label receives corrective feedback.

## References mapped to teaching

1. Ashcraft S, et al. *Care of the Patient With Acute Ischemic Stroke (Prehospital and Acute Phase of Care).* AHA scientific statement, 2021. [DOI](https://doi.org/10.1161/STR.0000000000000356). [AHA full text](https://www.heart.org/-/media/Files/Professional/Quality-Improvement/Stroke-Month-2021/Nursing-Guides/Care-of-the-Patient-With-Acute-Ischemic-Stroke-Prehospital-and-Acute-Phase-of-Care-Update-to-the-200.pdf?sc_lang=en).
2. Prabhakaran S, et al. *2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke.* AHA/ASA. [DOI](https://doi.org/10.1161/STR.0000000000000513). [Official guideline hub](https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke). Publisher access returned 403; relevant passages were checked in this [copy of the original guideline PDF](https://www.stroke-manual.com/wp-content/uploads/2026/01/2026-AHA-ASA-early-management-of-ischemic-stroke.pdf), with identity confirmed against the official hub.

| Teaching claim | Source location |
| --- | --- |
| Baseline and discovery differ; patient and witness accounts matter | 2021 statement, Delivery: EMS Field Assessment |
| Assessment and history can proceed concurrently; obtain reachable contacts | 2021 statement, field-assessment discussion and Tables 6–7 |
| Prompt organized team evaluation | 2026 guideline, section 2.7 |
| Check glucose because derangements can mimic stroke; a reassuring value does not establish absence of stroke | 2026 guideline, sections 4.5 and 4.6.1; 2021 statement Tables 6–7 |
| Screening before oral intake by trained personnel | 2026 guideline, section 5.2; 2021 statement Table 7 |
| Uncertain onset needs team evaluation, not automatic exclusion | 2026 guideline, section 4.6 |

The app includes linked references and scope notes on every stage. The 24-hour activation rule is expressly fictional, not a universal treatment window. Appliance/video interpretation follows the evidence specified in each story; it is not attributed to guideline authors. No medication dosing, blood-pressure treatment target or independent eligibility decision is taught. This is a focused communication exercise, not a complete stroke assessment checklist.

## Validation and remaining release limits

Release verification on October 23, 2026 supersedes the earlier sandbox/network limitations; permitted local listeners and existing GitHub access are now available.

- Frontend lint and the unmodified production build pass, including all nine prerendered routes. Release build uses `VITE_SHIFT_ENABLED=true` and `VITE_SHIFT_006_PREVIEW=false`. Existing large-chunk warning remains.
- All 934 backend tests pass; backend files remain unchanged.
- All 89 frontend Node tests pass, including 14 Shift 7 and 14 conversation/content checks. One older release-scope test is intentionally skipped because it targets a different historical release. A direct Git diff separately verifies no changes to Shifts 1–6 clinical files, Ask, consent, privacy, labs or backend.
- Shift 7: six desktop/phone browser checks pass both in the dedicated preview configuration and against the compiled public configuration. They cover sparse and fuller history, observed-only handoff, unsafe-water correction, original choices, refresh/resume, Rewind isolation, library filters and viewport fit.
- Compiled-app release checks cover existing Shift choices, explicit confirmation, coverage acknowledgment, debrief review, progress labels, keyboard access and ABG/Rhythm return links. Stale five-card counts and pre-confirmation Scenario 4/5 test helpers were corrected; no existing scenario gameplay was changed. The final library/conversation group passes 17/17, the final Shift 5 playthrough passes, and all four progress-label cases pass.
- Home continue-learning checks pass 6/6. ABG dock-clearance and landing checks pass 6/6 in an isolated run. Broad parallel runs expose intermittent dock checks; these are not represented as an entirely green repository suite.
- Existing Home Ask layout assertions and premium navigation assertions also fail on unchanged production base `5f60ede` (obsolete selectors/layout expectations). Those unrelated screens were not changed to satisfy stale tests. Private Med-Surg pilot suites require their separate preview configuration and are excluded from the public release profile.
- Physical-iPhone testing of this release is not claimed. Browser device emulation is not a substitute for that check. No new provider calls or clinical validation were performed. Scenario 7-specific analytics remains disabled as in the reviewed candidate.
- Release follow-up changes are limited to the tests above, this record, and replacing Home's stale five-shift count with "Fictional nursing shifts."

## Reproduce and release

From `frontend`, run lint, the Node scenario checks and `VITE_SHIFT_ENABLED=true VITE_SHIFT_006_PREVIEW=false npm run build`. Use `track-playwright.config.ts` with `CE_TEST_BASE_URL` matching the test server's `http://127.0.0.1:<port>` origin; several suites explicitly reject other hosts or seed progress at that origin. The default runner's `localhost` origin is not interchangeable. Public regression tests exclude the separately configured `med-surg-*` and `standalone-rewind` private-pilot suites. Run `npm run test:e2e -- --config shift7-playwright.config.ts` for the additional desktop/phone checks with Shift 6 preview enabled only on that test server. The portable review build is regenerated with `node frontend/scripts/build-shift7-preview.mjs` from the repository root.

GitHub main was verified at `5f60ede16d745049078b8ab08ae74a724970e200`, matching the candidate base. Publish through a pull request and the existing Vercel Git integration; do not trigger a duplicate manual deployment or change production environment variables. Verify `/learn/shifts/missing-time` and library navigation live, and verify `/learn/shifts/stable-number` remains unavailable.

### Rollback

Known-good production before this release: Vercel deployment `dpl_8vg2QYzazSoRqHVR7uTMiWGWXjit`, revision `5f60ede16d745049078b8ab08ae74a724970e200`, deployment URL `https://clinical-edge-copilot-mfhqasuqc-theclinicaledges-projects.vercel.app`.

For a release-critical regression, use Vercel's rollback/promote action to restore this recorded deployment to production. Do not enable Scenario 6 or alter Ask/backend settings. Preserve device-local progress; rollback must not delete browser storage. Revert the release merge in a separate Git commit afterward if needed to keep subsequent Git deployments aligned.
