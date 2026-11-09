# Rhythm Check V1 clinical review packet

**Version** `rhythm-check-v1.0.0-draft.3` · **Status** pending qualified ECG-content review · **Prepared** 2026-11-09

Private implementation on `feature/rhythm-check-v1`, based on `c6129972825dad867bb250626edf13e9aca8fa46`. Case specifications and exact learner-facing explanations live in `frontend/src/modules/rhythm-lab/rhythm-check/cases.ts`. The review below covers eight originally constructed synthetic signals. No patient recordings, third-party ECG images or source text are embedded.

## Calibration and response rules

All eight cases use a six-second simulated Lead II display at 25 mm/s and 10 mm/mV. The existing 800 × 100 SVG timebase uses 133⅓ coordinate units per second. A small box represents 0.04 s horizontally and 0.10 mV vertically. The markers work in seconds at Fit, 2× and 3×. Their position is rounded to 0.01 s and constrained to the displayed six seconds.

An interval is evaluated on the specified beat. Reversed endpoint order is accepted. Each endpoint must be within ±0.02 s of the reference and the absolute span within ±0.03 s. The thresholds are exercise tolerances for this display, pending review. A correct duration on a different beat does not match the requested evidence. The interpretation and marker-placement results are separate. All measured intervals and one interpretation must be entered before reveal. RC-04 additionally requires an answer about localization. The AV-block cases also require a PR observation, including an unclear option. The reveal compares that observation against the authored pattern separately from marker placement and interpretation. The guided starts are RC-01 and RC-05. The remaining attempts omit coaching before submission. A learner can choose insufficient visible evidence on RC-01–03 and RC-05–08. RC-04 addresses uncertainty in the separate localization question. These eight designed examples contain intended distinguishing evidence, so the reveal explains the evidence when that option is selected. No case assigns a Mobitz subtype to a 2:1 tracing.

## Exact example specifications

Times are seconds from strip start. Each P and Q entry corresponds by index. A dash in the Q list denotes an on-time P with no conducted QRS. The renderer marks these positions and the actual P/QRS durations after submission. The exact feedback and closest alternative are part of the case source fingerprint below.

| ID | Interpretation, alternative and variation | P onsets | QRS onsets | Required evidence |
|---|---|---|---|---|
| RC-01 | Sinus bradycardia; junctional rhythm. Guided. Regular 48/min, upright P before each narrow QRS. | 0.32, 1.57, 2.82, 4.07, 5.32 | 0.48, 1.73, 2.98, 4.23, 5.48 | P 0.32 to QRS 0.48 = **0.16 s**. Inspect upright, repeated P-to-QRS relationship. |
| RC-02 | Junctional rhythm; sinus bradycardia. Same rate as RC-01, with inverted P after QRS. T onset is set apart to show the separate P. | 0.55, 1.80, 3.05, 4.30, 5.55 | 0.43, 1.68, 2.93, 4.18, 5.43 | QRS 0.43 to P 0.55 = **0.12 s QRS-to-P**. This is not a PR interval. |
| RC-03 | Sinus bradycardia; junctional rhythm. Slightly varying slow R-R intervals with a consistent upright atrial relationship. | 0.27, 1.37, 2.52, 3.60, 4.74 | 0.47, 1.57, 2.72, 3.80, 4.94 | P 0.27 to QRS 0.47 = **0.20 s**. The modest R-R variation is not the deciding clue. |
| RC-04 | Junctional rhythm is favored within the offered pair; sinus bradycardia. Inverted P before the QRS with short onset-to-onset span. | 0.38, 1.49, 2.60, 3.71, 4.82 | 0.49, 1.60, 2.71, 3.82, 4.93 | P 0.38 to QRS 0.49 = **0.11 s**. Review specificity of the short inverted P in a single lead. Feedback explicitly limits inference about the precise focus. |
| RC-05 | Mobitz I; Mobitz II pattern. Guided. 4:3 groups, PR progression and reset. | 0.24, 0.99, 1.74, 2.49, 3.24, 3.99, 4.74, 5.49 | 0.40, 1.23, 2.02, –, 3.40, 4.23, 5.02, – | Measured first, pre-pause and post-pause PRs **0.16, 0.28, 0.16 s**. Intermediate PR 0.24 s. Nonconducted P at 2.49 s, then PR 0.16 s. |
| RC-06 | Mobitz II pattern; Mobitz I. Wide QRS example with a steady atrial rhythm and constant PR across a drop. | 0.24, 1.06, 1.88, 2.70, 3.52, 4.34, 5.16 | 0.42, 1.24, 2.06, –, 3.70, 4.52, 5.34 | Measured first, pre-pause and post-pause PRs **0.18, 0.18, 0.18 s**. P at 2.70 s has no QRS. Post-pause PR 0.18 s. QRS width is ancillary evidence. |
| RC-07 | Mobitz I; Mobitz II pattern. 3:2 groups, with shorter visible runs of PR progression. | 0.24, 1.08, 1.92, 2.76, 3.60, 4.44, 5.28 | 0.42, 1.34, –, 2.94, 3.86, –, 5.46 | Measured first, pre-pause and post-pause PRs **0.18, 0.26, 0.18 s**. P at 1.92 s has no QRS. Post-pause PR 0.18 s. |
| RC-08 | Mobitz II pattern; Mobitz I. Narrow QRS example with steady atrial timing, an isolated nonconducted P and unchanged PR. | 0.18, 0.98, 1.78, 2.58, 3.38, 4.18, 4.98 | 0.38, 1.18, 1.98, –, 3.58, 4.38, 5.18 | Measured first, pre-pause and post-pause PRs **0.20, 0.20, 0.20 s**. P at 2.58 s has no QRS. Post-pause PR 0.20 s. Review the sufficiency of the narrow-complex teaching example. |

P duration is 0.10 s for RC-01/03, 0.075 s for RC-02/04 and 0.09 s for RC-05–08. QRS duration is 0.08 s except for RC-06 at 0.16 s. Review P polarity, visible baseline, appropriate T-wave separation and relationships before interpreting width. The explanations address pattern evidence and limitations. Actual patient context, baseline, treating team and local protocol govern bedside interpretation and response.

## Clinical decisions pending ECG reviewer approval

**RC-04.** Review the unchanged 0.38 s inverted atrial onset, 0.49 s QRS onset and 0.11 s interval. The two required answers and marker placement are scored independently.

| Exact prompt | Options | Credit |
|---|---|---|
| Which rhythm better fits this strip: sinus bradycardia or junctional rhythm? | Sinus bradycardia / Junctional rhythm | Junctional rhythm only |
| Can this Lead II strip establish the exact pacemaker origin? | Yes / No | No only |

> The inverted atrial deflection begins at 0.38 s, and the QRS begins at 0.49 s, an interval of 0.11 s. The inverted deflection and short interval make junctional rhythm the better fit of the two choices. An ectopic atrial rhythm can also produce an inverted P wave before the QRS. This Lead II strip does not establish the exact pacemaker origin.

Approve the exact prompts, each credit rule, feedback and strength of the inference. [ECG reporting guideline](https://www.scielo.br/j/abc/a/4QcQvX3T6kZBjNQLzrt5cXj/?lang=en)

**RC-08.** Review the unchanged narrow QRS (0.08 s), steady P–P interval (0.80 s), isolated on-time P at 2.58 s and fixed PR across the pause. Verify P at 1.78 s and QRS at 1.98 s before the drop, and P at 3.38 s and QRS at 3.58 s after it. The accepted label remains “Second-degree AV block, Mobitz II pattern.”

> The P wave at 2.58 s arrives on time and has no following QRS. P waves stay 0.80 s apart, and the conducted PR is 0.20 s immediately before and after the pause. Together, these findings support a Mobitz II pattern on this strip. The narrow QRS does not determine the block type. In classic Wenckebach, the PR lengthens before the dropped beat and shortens on the next conducted beat.

Approve the visible pattern and contrast. This synthetic single-lead strip does not exclude mimics in a real tracing or establish the anatomical block location. [Mobitz II review](https://www.frontiersin.org/journals/cardiovascular-medicine/articles/10.3389/fcvm.2024.1450705/full)

**RC-05–08.** The required observation, “How does PR behave around the pause?”, is evaluated separately from markers and interpretation. The reveal reports “PR observation matches” or “PR observation needs review”, with the learner's selection and the reference.

| Exact option | Credit |
|---|---|
| Lengthens before the pause, then shortens | RC-05 and RC-07 |
| The first, pre-pause and post-pause PR intervals are the same. | RC-06 and RC-08 |
| I cannot tell | Available on all four cases, with reference feedback and no pattern-match credit |

Review the reference intervals, overlay and placement tolerances with the options and feedback. The revised final sentence in RC-06 reads “Classic Wenckebach shows PR prolongation before the dropped beat and a shorter PR on the next conducted beat.”

## Evidence and permissions

- [University of Utah ECG Learning Center, Lesson 5-1](https://ecg.utah.edu/lesson/5-1) supports the sinus timing and rate teaching for RC-01–04.
- [University of Utah ECG Learning Center, Lesson 5-2](https://ecg.utah.edu/lesson/5-2) supports junctional rate and the placement of retrograde atrial activity before, within or after QRS. RC-02 and RC-04 use visibly separate examples.
- [University of Utah ECG Learning Center, Lesson 6](https://ecg.utah.edu/lesson/6) supports the progressive-PR/reset versus constant-PR distinction for RC-05–08. Verify the reviewer’s differential for pseudo-block and how much a single six-second tracing can establish.

Sources are linked as educational references. Waveforms, labels and explanations are authored for this exercise. The references support the teaching concepts and do not attest to these exact assets.

## Reviewer handoff and release gate

For each RC ID, record reviewer name and ECG qualifications, review date, this version and the fingerprints below, and a disposition of approved, revise or insufficient visible evidence. Examine the strip before reading the key. At Fit and zoom, independently mark each required onset, confirm P/QRS durations and PP/PR behavior where relevant, review the tolerance and assess the most plausible competing interpretation. Inspect whether the explanation actually follows the visible trace. Pay particular attention to the limited inference about origin in RC-04 and whether RC-08 adequately demonstrates the intended Mobitz II pattern. Verify the accepted label, permitted alternatives, disclosures and nursing scope for every case. Approval requires a record covering each exact case and its associated feedback. Record any edits with a new fingerprint and obtain review of the changed version.

**Recorded clinical approvals** None. Engineering checks confirm the synthetic timing and interaction, not clinical validation or learner competency.

## Run the beta locally

From `frontend`, run `npm run dev -- --host 127.0.0.1 --port 5196 --strictPort`. Open `/rhythm-lab/check` or choose Rhythm Check Beta in Rhythm Lab. The production integration includes the route and case bank with Clinical Review Pending labels.

Run `node --test tests/rhythm-check.test.mjs` for case and calibration checks. Run `node tests/rhythm-check-browser.cjs 1440 0`, `node tests/rhythm-check-browser.cjs 375 1`, `node tests/rhythm-check-browser.cjs 390 2` `node tests/rhythm-check-browser.cjs 1440 3` and `node tests/rhythm-check-browser.cjs 1440 4` using installed Edge and the running preview. The second argument selects the response variant. Variant 4 repeats the RC-04 answer pair from variant 0 with offset markers. Set `RHYTHM_CHECK_BASE_URL` when using a different preview port. The runner checks all eight cases at each width, complete submission, a wrong interpretation, equal-length markers at the wrong beat location, reveal-only overlays, keyboard focus, exact SVG coordinates and restart. Browser contexts block external requests. The tests use fictional data and do not write practice history.

## Engineering verification

- All seven deterministic tests passed, including calibrated waveform geometry, marker tolerances, AV-block submission gating and byte-identical paths for the existing 36 Library waveforms.
- Five Edge runs completed all eight cases across 1440px desktop and 375px and 390px touch-emulated mobile. They exercised all four RC-04 answer combinations, the same answers with accurate and offset markers, matching and non-matching PR observations on each AV-block case, and the uncertainty choice. Fit, 2× and 3× placement, reveal-only overlays, reference and learner marker alignment, keyboard focus and progression, touch input and restart passed. No page errors or API requests occurred.
- Frontend lint and production build passed. These checks covered the original private draft. The unrelated backend and broad browser suites were not rerun.
- Mobile checks used touch emulation. Physical-device and independent assistive-technology checks remain open. Session attempts reset on reload. Qualified ECG review remains pending.

## Exact source fingerprints

The beta integration changes two status labels in `RhythmCheck.jsx`. The historical private draft.3 component SHA-256 was `a9ec8733881eee29a2d1ca4f809b2e7c917987257c18f6b079986bffa6533a62`. The current component hash below includes those label changes. Case content, scoring, waveform math and calibration are unchanged.

SHA-256 identifies the review candidate’s case content, waveform math, calibration, SVG geometry and interaction source. This is a draft identification record. Any change to the referenced bytes requires a fresh comparison before reusing review sign-off.

```text
65ee6b79fe41537eba0f25fdce8ca8ff336ed9e179346f54ddef94e815618628  frontend/src/modules/rhythm-lab/rhythm-check/cases.ts
d0d75e62bc07559fc6205aa3a2dacac4323abf49f695b77e198c2cb320260c3e  frontend/src/modules/rhythm-lab/utils/waveforms.ts
801ae24ca2e759ca68cc26bdb3c8f3237e6c746a7b1280261b0aa609ac177199  frontend/src/modules/rhythm-lab/utils/calibration.ts
ae23bd1fdcfbbe4501af9855c4d29271d3041f1a4726d0eccfa741b6484b7b02  frontend/src/modules/rhythm-lab/components/RhythmStrip.tsx
4173b216201d8bacf72062cc3231377cd81e7a2eecfa2a61d04f4c733f77eabc  frontend/src/modules/rhythm-lab/rhythm-check/RhythmCheck.jsx
```
