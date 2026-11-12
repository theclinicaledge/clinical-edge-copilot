# RC-01 guided ECG sequence review candidate

Status is private and pending version-specific qualified RN/ECG review. No clinical approval is recorded for this change. Base is production commit `f3fd68c86d06ee3c405eb9fcb2bae993862f965c`. Files are identified by SHA-256 below. Historical [V1.1](RHYTHM_CHECK_V1_1_REVIEW.md), [measurement/workspace](RHYTHM_CHECK_MEASUREMENT_WORKSPACE_REVIEW.md) and [eight-case](RHYTHM_CHECK_V1_REVIEW.md) review records remain intact.

## Exact new RC-01 sequence

The case heading is “Read the strip step by step”. A “Step [number] of 5” label precedes each instruction.

| Step | Heading | Exact instruction |
|---|---|---|
| 1 | Assess ventricular rate | Use Fit to see all six seconds. Count each QRS once, then multiply your count by 10 for an estimated rate. |
| 2 | Assess R–R regularity | Compare the spacing between successive R waves across the full strip. Decide whether the spacing stays even. |
| 3 | Inspect atrial activity and measure | Look before and after each QRS for a separate atrial deflection. Note its direction and relationship to the QRS, then measure the first complete beat. |
| 4 | Commit to an interpretation | Combine your rate estimate, R–R spacing and atrial-to-QRS relationship. A slow rate alone cannot distinguish sinus bradycardia from junctional rhythm. |
| 5 | Review the evidence | Compare your rate estimate, spacing assessment and original markers with the waveform evidence, then review your interpretation. |

The rate field retains “Ventricular rate (bpm)”. Its exact help is “Count QRS complexes on the full six-second strip and multiply by 10. This gives an estimate, not an exact rate.”

The regularity question is “Are the R–R intervals evenly spaced?” Its choices are “Evenly spaced” and “Unevenly spaced”.

The measurement step retains the existing first-complete-beat prompt, approach details, marker controls, timing model and scoring. The interpretation step retains “Which interpretation fits the visible evidence?” with the existing sinus bradycardia, junctional rhythm and insufficient-visible-evidence choices.

Advance buttons are “Continue to regularity”, “Continue to landmarks” and “Continue to interpretation”. Back buttons return to rate, regularity or landmarks. Responses and marker placements are retained while navigating backward. Moving forward requires a complete response, not a correct response. No reference answers, evidence overlays or correctness feedback appear before final submission. Marker placement is enabled during the measurement step only. The final action retains “Submit interpretation”.

## New accepted responses and scoring

| RC-01 component | Rule | Reference |
|---|---|---|
| Ventricular rate | Numeric response of one to three digits required. Only 50 receives “Estimate matches”. Other numeric responses receive “Recheck the QRS count”. | Five visible QRS complexes over six seconds, multiplied by 10 |
| R–R spacing | A selection is required. “Evenly spaced” receives “Spacing matches”; “Unevenly spaced” receives “Recheck the spacing”. | QRS onsets 0.48, 1.73, 2.98, 4.23 and 5.48 s, regular intervals of 1.25 s |
| Duration and landmarks | Existing separate evaluations and combined measurement match | Target 0.32–0.48 s, duration tolerance ±0.03 s and endpoint tolerance ±0.02 s |
| Rhythm interpretation | Existing answer and alternatives | Sinus bradycardia |

Rate, regularity, duration, target landmarks and interpretation remain independent results. Wrong early responses are permitted to reach interpretation and receive corrective feedback after submission. A rate answer of 48 is not credited for the count-specific question, but the reveal explicitly identifies 48 as the valid regular interval-method result. It does not infer which calculation the learner attempted. There is no overall competency or mastery score.

## Exact RC-01 reveal additions

The shared rate reveal shows “Estimate matches” or “Recheck the QRS count”, followed by “You entered [value] bpm. 5 QRS complexes × 10 ≈ 50 bpm.”

It retains “This is an estimate over six seconds. Dividing 60 by one R–R interval gives the rate for that interval.”

The newly applied regularity reveal shows “Spacing matches” or “Recheck the spacing”, followed by “You chose [choice in lowercase]. Ventricular intervals range from 1.25 s to 1.25 s.”

RC-01 adds “The R–R interval is 1.25 s here, giving 48 bpm by the interval method. This question scores the six-second count. Rate alone cannot distinguish sinus bradycardia from junctional rhythm.”

The rhythm feedback adds “Your rate and spacing answers describe the ventricular pattern. Compare the atrial deflections and their relationship to QRS onset to distinguish the two rhythms. Duration and requested landmarks are evaluated separately above.”

The existing case explanation and reference annotations remain available after submission. RC-01 does not receive RC-08's separate atrial-rate explanation.

## Progression and scope

RC-01 teaches the sequence with step-specific instructions. RC-02 continues independent six-second rate estimation and inspection of atrial activity, retaining its QRS-to-P measurement and existing feedback. RC-03 and RC-04 retain their waveform-reasoning tasks without new mandatory rate or regularity questions. RC-05 retains its guided first/pre-pause/post-pause measurement instruction. RC-06 and RC-07 remain independent block exercises. RC-08 retains its existing rate and spacing questions.

This is a scoped single-lead rhythm exercise. It does not replace a complete ECG or patient assessment. The sequence omits assessment components outside the current exercise, such as axis and ST/T interpretation. No treatment guidance is introduced.

All eight case definitions, synthetic signal geometry, calibration, timing, interpretation keys and measurement scoring are preserved. Only the shared rate helper's selected-case list and regularity-question eligibility add RC-01. Desktop workspace and mobile layout are reused. No new persistence, analytics, dependencies or provider calls are included.

## Evidence and source permissions

Method source is Open RN, Nursing Advanced Skills, section 7.3, “A Systematic Approach to Interpreting an ECG”, https://wtcs.pressbooks.pub/nursingadvancedskills/chapter/7-3-a-systematic-approach-to-interpreting-an-ecg/ . It supports six-second ventricular counting, regularity inspection across the strip, and measurement from P onset to QRS onset. The source's method text was consulted for this preparation. New instructions are original paraphrases; no external ECG image or third-party waveform is reproduced. Its book attribution and licensing are available at https://wtcs.pressbooks.pub/nursingadvancedskills/ . This section is also linked in RC-01's post-response educational sources.

The existing sinus-versus-junctional rationale remains tied to the University of Utah references in the eight-case packet. No unrelated clinical statements from the method source are imported. Existing source-permission limitations remain applicable.

## Required qualified review and release limits

A qualified RN/ECG reviewer must approve the exact step prompts, 50-only count scoring, 48 bpm interval-method distinction, even-spacing reference, new combined explanation, and the adequacy of the rendered atrial/QRS landmarks. Confirm that wrong responses do not block formative continuation and that duration credit cannot be mistaken for identification of the requested interval. Review mobile readability with the actual strip.

No founder attestation or independent approval is recorded for these new prompts or questions. Record reviewer qualifications, approval date, fingerprints, scope and limitations before carrying approval forward. Prior founder approval of the workspace does not approve this new content. Existing unresolved RC-04, RC-08 and other V1.1/eight-case sign-offs remain outstanding.

Retain Beta — Clinical Review Pending. Physical iPhone Safari native-keyboard testing remains outstanding. Marketing and the supervised learner pilot remain on hold. Commit, PR and release require separate authorization.

## Focused verification

Nine deterministic tests passed, including landmark alignment, independent duration and endpoint accuracy, AV-block PR rules, and the shared rate helper's new RC-01 eligibility. Frontend lint and production build passed. The existing large-chunk build warning remains.

All eight cases passed in rendered Microsoft Edge at 1440×1000, 1280×650, 375×844 and 390×844. RC-01 checks include empty/malformed rate entry, method-specific 48-versus-50 feedback, wrong rate and regularity answers with a correct rhythm, step gating without answer disclosure, backward navigation retaining responses and markers, numeric input dismissal, keyboard and emulated touch. Existing RC-02/RC-08 rate feedback, RC-04 independent responses and RC-05–08 PR observations also passed. Fit/2×/3×, panning, reference-marker alignment, dock clearance and eight-case progression passed. No page errors or API requests were observed. No physical iPhone or native Safari keyboard verification is claimed.

## Final review preparation

The founder's final-review request approves the instructional direction and authorizes focused PR preparation. This is product-direction approval; it supplies no new founder RN clinical attestation or independent ECG sign-off. All qualified clinical-approval requirements above remain pending. Prepare a draft PR for review. Merge and deployment still require separate authorization.

The implementation and test fingerprints below were rechecked against the frozen six-file candidate. Current main remains `f3fd68c86d06ee3c405eb9fcb2bae993862f965c`. No implementation file changed during this preparation. The only addition is this final-review record in the existing addendum.

A focused rendered RC-01 walkthrough at 390×844 in Microsoft Edge confirmed a full round trip from interpretation back through landmarks and regularity to rate, then forward again. Rate 48, the chosen uneven spacing, interpretation and exact 0.32/0.48 s markers were preserved. Reference evidence and correctness stayed hidden until submission. Final feedback independently identified the count-method and spacing mismatches while retaining duration and interpretation credit. Numeric-input Enter dismissed focus without submitting. This was browser emulation, not native iPhone keyboard verification.

Reuse the recorded nine tests, lint/build and four all-eight-case browser runs above. No broad suites were repeated. Source comparison confirms RC-02–08 behavior, all eight waveform definitions, measurement rules, calibration, renderer and prior review packets are preserved. New helper eligibility is limited to RC-01, and the additional CSS selectors apply only to its guided-step content. Other Rhythm Lab files have no diff.

## Candidate fingerprints

```text
8f9b2aec87ec6d74d9a2b61b7ff2b8b5f4c93e105fea59eb59b5975822fe7b71  frontend/src/modules/rhythm-lab/rhythm-check/RhythmCheck.jsx
b6b66a2b14dd50a18cd52ddb0c744340a56abdfb41ec36658e97b3a4900e8e83  frontend/src/modules/rhythm-lab/rhythm-check/cases.ts
bf093ef54b2b18d4cbcf26551519851859742aa63eef0e2b8b7038d5e66607ec  frontend/src/modules/rhythm-lab/rhythm-check/rhythm-check.css
d065207452cd86afadd572e11c81ce8aa2b4c1686195081fa91a6439fbbb69ce  frontend/tests/rhythm-check-browser.cjs
5e4f438f960987c3de1f37bf22652b9aa260ec8d67128c636779d26c6a6cb841  frontend/tests/rhythm-check.test.mjs
```
