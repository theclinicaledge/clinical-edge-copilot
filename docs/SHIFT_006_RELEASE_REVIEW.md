# SHIFT-006 release review: The Stable Number

## Authorization and provenance

Founder requested review, refinement and public release of the existing Scenario 6.
Founder reports that he and another nurse reviewed it and found it clinically reasonable.
Reviewer identity, credentials, review date, signatures and separate Rewind scope were not supplied.
This is founder-reported approval, not formal clinical validation. No new independent review
of the release clarifications below is claimed.

Base: f4fef4cc96e7401e18f7832fbc7502866d06eea2 (production before this release).
Isolated branch: release/shift6-stable-number. Existing v0.4 scenario, not a reconstruction.
The six decisions, all vital-sign tables, answer IDs, grading and recommendations are retained.
The existing v0.4 progress and Rewind keys remain compatible; new draft selections are additive.
Other scenarios, Ask, backend, privacy settings and production environment variables are unchanged.

## Focused corrections

- D1, D4 and D6 now select before confirming; unsubmitted choices survive refresh separately
  from immutable answers. D2's selected time also survives refresh.
- Flowsheet earlier/later controls expose the horizontally scrollable columns on phones.
  Native horizontal scrolling and keyboard time-column selection remain available.
- SBAR section names are expanded. Bedside findings can still be opened after submission
  for review, but the submitted cue selection cannot change.
- Unsafe/delayed escalation and incomplete SBAR responses lead through an explicitly labelled
  guided safer path. The ending is labelled as the scripted outcome after corrections when
  needed. Personalized feedback continues to use original answers, not corrected choices.
- Rewind invitation and situation titles no longer reveal the correct calls in advance.
  Full reasoning remains available after submission; all three variants and alternatives remain.
- Source/review records now accurately attribute nurse approval to the founder's report.
- Registration, rendering and direct routes make Scenario 6 public under the existing global
  Shift flag. No preview environment variable is enabled in production.

## Clinical wording changes

These clarify uncertainty and scope, without changing the approved case facts or correct choices:

1. Cool/pale skin previously asserted redistribution as the established cause. It now raises
   concern for reduced peripheral perfusion without independently establishing the cause.
2. The anxiety chip previously said the findings had ruled anxiety out. It now says anxiety
   may coexist but cannot adequately explain away the concerning pattern.
3. Room 16 feedback and its debrief no longer teach that escalation requires sustained change.
   The explanation is limited to this patient's recovery to her baseline/target and explicitly
   permits escalation for concerning symptoms or clinical concern even when brief.
4. Rewind B's feedback likewise describes the observed return to baseline rather than a
   universal escalation rule.

No medication changes, treatment orders, new diagnostic conclusions or clinical-validation
claims were introduced. The original SBAR rubric credits the essential statements and urgent
request even if a nonessential chip is selected; feedback separately identifies distracting
chips. This remains a learning reflection, not a competency assessment.

## Source check

- AHRQ PSNet Rapid Response Systems: the calling criteria expressly include significant staff
  concern about the patient's condition, alongside numeric thresholds:
  https://psnet.ahrq.gov/primer/rapid-response-systems
- IHI SBAR tool: source supports the situation/background/assessment/recommendation structure:
  https://www.ihi.org/library/tools/sbar-tool-situation-background-assessment-recommendation
- NCBI Acute Anemia indexed text supports initially unchanged hemoglobin when red cells and
  plasma are lost together: https://www.ncbi.nlm.nih.gov/books/NBK537232/
- NCBI Hemorrhagic Shock indexed text supports early tachycardia:
  https://www.ncbi.nlm.nih.gov/books/NBK470382/
- NCBI full-page access was intermittently blocked by its browser challenge. The StatPearls
  point-of-care GI source returned a payment/access error. Full passage verification of every
  source and exact citation-update date is not claimed; existing source-access limitations
  remain. None of these references certifies the fictional case or grading.

## Verification and limitations

Release candidate results:
- Frontend lint: passed.
- Production build and prerender: passed, 9/9 routes; existing large-chunk warning remains.
- Frontend Node tests: 91 passed, one older release-specific guard skipped because it applies
  to a different historical release scope.
- Backend tests: 934 passed, no provider calls.
- Scenario 6 compiled-bundle browser checks: 54 passed across desktop and phone projects.
- Existing Home, library, next-step, debrief, Scenario 4/5 and Scenario 7 browser regressions:
  43 passed.
- Initial failures were sandbox socket restrictions and test harness issues (a literal cue
  label treated as a regex, a layout test covering 21 pages exceeding its time limit, and a
  byte-string comparison of normalized saves). Corrected harness assertions now check actual
  saved answers and pass; no grading or clinical behavior was weakened to satisfy a test.
- Diff confirms no changes to Scenarios 1-5 or 7 implementation, Ask, backend or privacy.

The release checks exercise every single-choice response, essential/supporting cue behavior,
SBAR outcomes, all three Rewind situations and responses, correct/missed full playthroughs,
keyboard operation, draft/answer restoration, debrief handoff, restart cancellation, and
other-scenario progress preservation. Responsive checks include 320, 390 and 1440 widths,
enlarged text, horizontal table controls and navigation-dock clearance.

Physical-iPhone/native-wrapper testing and VoiceOver are not performed in this release task.
No real patient content or provider calls are used. Browser tests do not constitute clinical
validation. Scenario 6 does not yet send per-scenario product analytics; the existing analytics
allowlist is unchanged. Local progress still drives resume and library status.

## Release and rollback

Publish only this focused branch through GitHub PR checks and the existing automatic Vercel
production deployment after merge. Do not trigger a second manual deployment.
Verify /learn/shifts/stable-number, library entry, representative completion, saved choices,
Rewind and Ask preparation without submitting an AI question.

Known-good rollback: production SHA f4fef4cc96e7401e18f7832fbc7502866d06eea2,
Vercel deployment dpl_2tmpSigJR78PKErEVbfcteMVTCFT, GitHub deployment 7294065819.
Deployment URL: https://clinical-edge-copilot-ccx7j5wna-theclinicaledges-projects.vercel.app
If release-critical problems occur, restore that deployment through Vercel's production rollback,
then revert this release through a checked PR so repository main matches the rollback.
Never change backend containment or existing consent settings as a workaround.
