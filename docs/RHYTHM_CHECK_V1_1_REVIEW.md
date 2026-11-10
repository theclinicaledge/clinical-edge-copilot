# Rhythm Check V1.1 review requirements

Status: proposed, pending version-specific ECG review. The V1.0 review packet and its fingerprints remain historical records. This branch is for educational review and does not establish competency.

- **Measurement**: Verify separate duration and target-endpoint feedback against the existing ±0.03 s duration and ±0.02 s endpoint tolerances, including reversed marker order, different beats, ambiguous onsets and both endpoints individually within tolerance but the span outside tolerance. Only infer a beat or landmark from an unambiguous nearby authored onset. The original combined pass condition is preserved.
- **RC-02**: Verify five visible QRS complexes give a six-second estimate of 50 bpm. The regular 1.25 s R–R interval gives 48 bpm by the interval method. The prompt explicitly asks for the count-based estimate and awards a match for 50 only. Review that the reveal distinguishes the methods and does not imply rate establishes rhythm identity.
- **RC-08**: Verify six QRS complexes and seven P waves give six-second estimates of 60 and 70 bpm respectively. The ventricular estimate matches at 60 only. Verify uneven ventricular spacing (0.80–1.60 s) and the explanation of the nonconducted P wave. Atrial rate is teaching feedback only. Review that one R–R interval does not represent the entire irregular strip.
- **Existing questions**: Confirm RC-04 best-fit and localization scores remain independent, and RC-05–08 retain their PR observation answers and feedback. Confirm the eight case definitions, geometry and calibration are preserved.
- **Release review**: Record the exact candidate SHA, reviewer qualifications, date, accepted wording, answer criteria and limitations before controlled release. Verify the exercise on physical iPhone, including native keyboard, safe area, dock and return from zoom. Keep Beta — Clinical Review Pending visible. Marketing and supervised pilot remain pending.

Method reference: [Open RN, Interpret Basic ECG](https://www.ncbi.nlm.nih.gov/books/NBK594493/) describes six-second QRS and P-wave counts and regularity assessment.

## Frozen candidate for reviewer disposition

The private candidate is based on production commit `3196823ca2864333805b31d9ea8c3fa86696fdb0`. It has no candidate commit yet. The hashes below identify the working-tree files for this review. Compare them before carrying any approval into a PR.

### RC-02 and RC-08 exact learner content

The shared field label is **Ventricular rate (bpm)**. The instruction is “Count QRS complexes on the full six-second strip and multiply by 10.” A one-to-three-digit response is required to submit. Only the numeric value listed below earns a match. This is a method-specific question. Rate, spacing, markers, PR observation and rhythm interpretation have separate results.

The reveal shows “Estimate matches” or “Recheck the QRS count”, then “You entered [value] bpm.” and the case calculation below. Both cases show “This is an estimate over six seconds. Dividing 60 by one R–R interval gives the rate for that interval.”

| Case | Accepted rate | Exact calculation shown | Case-specific reveal |
|---|---:|---|---|
| RC-02 | 50 bpm | 5 QRS complexes × 10 ≈ 50 bpm. | “The R–R interval is 1.25 s here, giving 48 bpm by the interval method. Rate alone cannot distinguish sinus bradycardia from junctional rhythm.” |
| RC-08 | 60 bpm | 6 QRS complexes × 10 ≈ 60 bpm. | “Counting P waves separately gives an atrial estimate of 70 bpm. A nonconducted P wave counts toward the atrial estimate only.” |

**RC-02 disposition:** The authored trace supports both calculations. Entering 48 receives “Recheck the QRS count” because the prompt specifies the six-second method. The reveal still identifies 48 as the valid interval-method result. Review this distinction and confirm the separate interpretation rationale for junctional rhythm.

**RC-08 disposition:** The exact question is “Are the R–R intervals evenly spaced?” Choices are “Evenly spaced” and “Unevenly spaced”. Only the latter receives “Spacing matches”. Otherwise the reveal says “Recheck the spacing”. Both show “You chose [choice in lowercase]. Ventricular intervals range from 0.80 s to 1.60 s.” The longer interval spans the nonconducted P wave. The regular P–P interval, single on-time nonconducted P wave, and unchanged PR across the pause support the authored Mobitz II pattern. Uneven R–R spacing and QRS width do not establish the subtype by themselves. Review the rendered P and QRS landmarks, differential and single-lead limitation in the V1.0 packet. See [Barold and Herweg](https://pubmed.ncbi.nlm.nih.gov/39267806/).

### Measurement decision matrix

| Duration within ±0.03 s | Both target endpoints within ±0.02 s | Result heading |
|---|---|---|
| Yes | Yes | Markers match |
| Yes | No | Recheck marker placement |
| No | Yes | Recheck duration |
| No | No | Recheck marker placement |

Every result separately states “Duration · Within tolerance” or “Duration · Outside tolerance” and “Landmarks and beat · Target endpoints match” or “Landmarks and beat · Target endpoints do not match”. The full reference span and marker offsets are available in Marker details. Reversed marker order is accepted. A different-beat claim requires each marker to match exactly one nearby authored onset and the beat indices to differ. The match requires both dimensions. These are exercise tolerances, with no change from the production rule.

Example with RC-01 target 0.32–0.48 s: markers at 0.36 and 0.54 s produce 0.18 s. The duration is within tolerance and both endpoints miss. Markers at 0.30 and 0.50 s produce 0.20 s. Both endpoints are individually within tolerance and the duration is outside tolerance. Neither receives the combined match.

### Sign-off record

The source-and-rubric check above is preparation for clinical approval. No founder attestation or independent approval is recorded. Keep the [eight-case V1.0 packet](RHYTHM_CHECK_V1_REVIEW.md) as the per-case reference. Record a disposition for RC-01–08 and for each V1.1 item above. Pay particular attention to RC-04 best-fit versus localization, RC-08 narrow-QRS pattern versus mimics, and PR observation scoring in RC-05–08.

| Review path | Reviewer and relevant RN/ECG qualifications | Date | Candidate hash or commit | Scope, disposition and limitations |
|---|---|---|---|---|
| Founder attestation, if provided | Pending | — | — | Explicitly record founder role and scope. |
| Independent qualified RN/ECG review | Pending | — | — | Record separate disposition, any requested corrections and unresolved cases. |

Prepare the focused PR only after the required approval records cover the exact candidate. Merge and deployment require separate authorization. After an authorized deployment, prioritize physical iPhone Safari at RC-02 and RC-08: open the numeric keyboard, enter and dismiss without accidental submission, confirm ECG visibility and scrolling with the keyboard open and closed, then submit and verify dock clearance and Next Case. Retain the Beta — Clinical Review Pending label and the marketing and supervised pilot holds.

### Candidate fingerprints

```text
ae8d5a6a19c429b8d49a163d43c54b0c0645098daba9e75cb3eca2e2ccb20039  frontend/src/modules/rhythm-lab/rhythm-check/RhythmCheck.jsx
3db5ef2a4a2699b3034163d6db371b9508cff44314ff3a046ddbf77e1944ed6d  frontend/src/modules/rhythm-lab/rhythm-check/cases.ts
f0bfa5e263dccb56393731f62b4c9e7598656e961e4cec6ac0d490c01b93940d  frontend/src/modules/rhythm-lab/rhythm-check/rhythm-check.css
d0d75e62bc07559fc6205aa3a2dacac4323abf49f695b77e198c2cb320260c3e  frontend/src/modules/rhythm-lab/utils/waveforms.ts
801ae24ca2e759ca68cc26bdb3c8f3237e6c746a7b1280261b0aa609ac177199  frontend/src/modules/rhythm-lab/utils/calibration.ts
ae23bd1fdcfbbe4501af9855c4d29271d3041f1a4726d0eccfa741b6484b7b02  frontend/src/modules/rhythm-lab/components/RhythmStrip.tsx
```
