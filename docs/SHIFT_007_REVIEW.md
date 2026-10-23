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

- Frontend lint passed.
- 42 scenario/content/release checks passed, including 14 Shift 7 checks. They cover every valid question subset, all 128 opening-action combinations, essential handoff omissions, source availability, draft-vs-confirmed actions, restoration, preview migration and Rewind isolation.
- Vite 8.1.6 production compilation passed using the runner config loader. Bundle scan confirms Shift 7 present and Shift 6 slug absent. Existing large-chunk warning remains.
- Nine marketing routes prerendered successfully using a temporary equivalent script with writable cache/config-loader settings. The unmodified build command hits a permissions error writing through the external node_modules symlink; this is not reported as a clean full-command pass.
- Manual Chrome checks cover the actual self-contained React build: arrival, action confirmation, source-labelled conversations/timeline, separate bedside confirmations, conditional handoff and reflection. Earlier checks covered mobile at 390px, saved progress, Rewinds and library filters. The standalone file does not certify the full application wrapper.
- Playwright suites are supplied and library expectations updated. Browser automation could not run here: writable-cache retry still fails to listen on localhost with EPERM. Rerun on a permitted runner before deployment.
- Backend unchanged: 934 tests, 875 pass, 59 fail in this restricted environment, including forbidden server binding and consequent setup failures. The full suite is not certified passing.
- Isolated branch is based on local main 5f60ede. GitHub retrieval/push currently fails DNS resolution. No remote merge or live deployment is claimed.

## Reproduce and release

From `frontend`, run lint, the Node scenario checks, `npm run build`, and the normal Playwright suite. Run `npm run test:e2e -- --config shift7-playwright.config.ts` for desktop/phone Shift 7 checks with Shift 6 preview enabled only in that test server. Run backend tests in an environment that permits test listeners. The portable review build is regenerated with `node frontend/scripts/build-shift7-preview.mjs` from the repository root.

Fetch current GitHub main, reconcile changes, rerun required checks, then merge/deploy through the existing GitHub/Vercel workflow. Verify `/learn/shifts/missing-time` and specialty filtering live, and verify `/learn/shifts/stable-number` remains unavailable unless separately authorized. User release authorization is already supplied; the remaining limitations are technical verification and connectivity, not another permission request.
