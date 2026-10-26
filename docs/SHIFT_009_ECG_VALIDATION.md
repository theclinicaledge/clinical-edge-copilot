# SHIFT-009 ECG validation record (v0.9, remediation Part 2)

Automated measurements of the eleven ECG images used by Shift 09. **This is a consistency check, not specialist ECG validation.** A telemetry educator or cardiologist still has to verify the images (checklist below). Nothing here claims clinical validation.

Reproduce from the repo root (Python 3.9+, `pip install -r tools/shift9-ecg/requirements.txt`):

```bash
python tools/shift9-ecg/generate.py && python tools/shift9-ecg/validate.py
```

`generate.py` writes the images, `tools/shift9-ecg/manifest.json` (geometry, seeds, intended values, SHA-256 of each image) and the stored signals. `validate.py` writes `tools/shift9-ecg/validation-report.json`. `frontend/tests/shift9-ecg.test.mjs` holds the committed images to that report and to the clinical bounds below. Two generator runs produce byte-identical images.

## 1. Root cause of the QT/QTc defect (audit H1)

In the v0.7/v0.8 generator (`SHIFT-09-build-package/tools/make_strips.py`, `beat()`, and `make_12lead_v2.py`), the T wave was a Gaussian placed at a fixed `t_mu = 0.26 s` after every R peak (0.24 to 0.25 s on the 12-lead) with `t_sd = 0.055 s`, whatever the heart rate. By the tangent method the T wave ends at `t_mu + 2·t_sd`, about 0.37 s after R, so QT was about 0.40 to 0.41 s on every sinus beat. Bazett divides by √RR, so the faster the rate, the longer the QTc: 463 ms at HR 84 up to 502 ms at HR 94, measured from the image pixels. Room 21 (Curtis: syncope workup, recent antipsychotic) showed an unintended long QT.

The same fixed timing was used for the AF strips. Their R-R intervals were also unconstrained (shortest 0.24 s in Rewind B), so some QRS complexes landed on the previous T wave and looked taller.

**A second defect found during Part 2:** the rhythm-strip figure placed 24 mm of paper in about 35 mm of image height but 150 mm in 172 mm of width. The grid boxes were therefore 1.27 times taller than wide, which exaggerated every amplitude by 27% relative to time. The 12-lead was off by about 1%.

**Fix (not a visual shift).** `tools/shift9-ecg/ecg_model.py` computes each beat's QT from its own preceding R-R with the Framingham (Sagie 1992) linear correction, `QT = QTc − 0.154 × (1 − RR)`. It then places the T wave so its tangent-method end lands at QRS onset + QT. This makes repolarization rate-dependent beat by beat, as it is physiologically, including in AF. The model target is QTc 0.425 s, and the measured QTc comes out about 0.39 to 0.43 s because the measured QRS onset falls slightly after the model's. All figures now use true paper scale: 1 mm is the same size across and up.

Why Framingham: it is linear, well-behaved at the rates used here (84 to 150 per minute), and avoids Bazett's known overcorrection at faster rates. Results are reported by Bazett, Fridericia, Framingham and Hodges so a reviewer can apply their preferred formula. Normal-range targets: QTc under 450 ms (men) and 460 ms (women) by Bazett.

## 2. Method

- **From the signal:** R peaks are detected independently of the model's R times. For each beat (excluding the first and last), the method finds baseline from the PR segment, QRS onset, J point, ST at J+60 ms, T end by the tangent method (steepest descent extended to baseline), and P onset and PR. Each QTc uses that beat's preceding R-R. Medians are reported.
- **From the PNG:** ink pixels are extracted column by column inside the plot box recorded in the manifest. The trace is converted to mV and seconds and compared with the signal (RMS error). R peaks, QT and ST are then re-measured from the pixel trace alone. On the 12-lead and its views, each labeled segment's trace is compared against all twelve leads; it must match its own label best.
- **Paper scale:** pixels per mm across and up (must be equal), and the 1 mV calibration pulse height from pixels.
- **AF-specific:** the 6-second QRS count, R-R coefficient of variation, shortest R-R, runs of three similar intervals, and the share of the previous T wave left under each QRS. "No consistent P waves" is the beat-to-beat correlation of the 230 to 50 ms window before each QRS: a P wave is locked to the QRS, while f-waves aren't. For f-waves: dominant rate, spectral peak share, and the maximum autocorrelation at 0.5 to 1.5 s (flutter stays near 1; AF decorrelates).
- **12-lead:** the derived-lead identities (II = I + III; aVR + aVL + aVF = 0), ST at J+60 ms per lead, QRS size per lead, and frontal axis from the net QRS area in I and aVF.

## 3. Before and after

Before values are measured from the v0.8 image pixels (`validate.py --legacy`), so both columns use the same method.

| Image | Before: 6 s count | Before: QT ms | Before: QTc Bazett / Fridericia ms | After: 6 s count | After: QT ms (signal / pixels) | After: QTc Bazett / Fridericia ms | After: PR / QRS ms | After: ST J+60 mm |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rm21_1430_sinus84.png (HR 84) | 8 | 391 | **463** / 438 | 8 | 347 / 362 | 412 / 389 | 171 / 64 | 0.0 |
| rm22_1430_sinus88.png (HR 88) | 8 | 399 | **484** / 454 | 9 | 341 / 355 | 415 / 389 | 169 / 66 | 0.0 |
| rm22_1508_sinus94_ste.png (HR 94) | 9 | 400 | **502** / 466 | 9 | 341 / 349 | 429 / 397 | 161 / 82 | 2.0 |
| rm22_1513_12lead (lead II, HR 94) | n/a | 394 | **493** / 457 | 15 in 10 s | 336 | 422 / 391 | 162 / 84 | 2.1 |
| rm23_1430_afib110.png | 11 | 329 | 444 / 402 | 11 | 342 / 365 | 470* / 413 | none / 78 | -0.1 |
| rm23_1535_afib110_rewindA.png | 11 | 340 | 458 / 415 | 11 | 327 / 335 | 432 / 396 | none / 65 | 0.0 |
| rm23_rewindB_afib150.png | **13** (two R waves 0.24 s apart) | 340 | 502 / 441 | 15 | 291 / 306 | 453* / 391 | none / 87 | -0.4 |
| rm23_rewindC_afib130.png | 13 | 352 | 520 / 457 | 13 | 296 / 329 | 416 / 368 | none / 65 | 0.1 |

\* Bazett overcorrects at fast, variable rates and isn't recommended for AF; the Fridericia and Framingham values are within normal limits. QT in AF is an average over beats with different preceding R-R intervals.

Paper scale, before and after: rhythm strips went from 1.27 (vertical mm ÷ horizontal mm) to **1.00**, and the 12-lead from 0.99 to **1.00**.

## 4. All eleven images checked

| Image | Used on | Key results (after) |
| --- | --- | --- |
| rm21_1430_sinus84.png | Report card | Sinus 84; P before every QRS (template 0.12 mV, beat-to-beat r = 0.99); PR 171 ms, QRS 64 ms, QTc 412/389 ms; ST 0.0 mm; pixel RMS 0.004 mV |
| rm21_1505_artifact_leadsoff.png | D1 Look closer | 5 regular beats (96 per minute) under motion artifact, then a flat line from 3.3 s (SD 0.002 mV) under the LEADS OFF box. Distinguished from asystole by the message and by beats running into the artifact |
| rm22_1430_sinus88.png | Report card, D1, D2 | Sinus 88; PR 169 ms, QRS 66 ms, QTc 415/389 ms; ST 0.0 mm (at baseline); 6-second count 9 |
| rm22_1508_sinus94_ste.png | D2 | Sinus 94; ST +2.0 mm at J+60 (pixels +2.2 mm), upsloping into the T wave; QTc 429/397 ms |
| rm22_1513_12lead_inferior_stemi.png | D3 | Sinus 94; identities hold; axis +52°. ST at J+60 (mm): I -1.0, II +2.1, III +3.2, aVR -0.4, aVL -2.1, aVF +2.6, V1 0.0, V2 +0.6, V3 +0.4, V4 0.0, V5 0.0, V6 0.0. Fourth Universal Definition thresholds are met in II, III and aVF only (V2-V3 under 1.5 mm). aVL QRS 0.34 mV peak to peak. Every one of the 13 segments matches its label; calibration 1.03 mV (includes line width) |
| rm22_1513_12lead_limb.png | D3 viewer | I, II, III, aVR, aVL, aVF over the same 2.5 s; each row matches its lead; calibration 1.01 mV |
| rm22_1513_12lead_chest.png | D3 viewer | V1 to V6 over the same 2.5 s; each row matches its lead; calibration 1.02 mV |
| rm23_1430_afib110.png | Report card, D1 | 11 QRS in 6 s; R-R CV 0.33, shortest 0.34 s, no regular runs; P correlation -0.02 (none); f-waves 450 per minute, far autocorrelation 0.67, 0.14 mV peak to peak |
| rm23_1535_afib110_rewindA.png | D5, Rewind A | 11 QRS; CV 0.22, shortest 0.35 s; P correlation -0.14; f-waves 370 per minute, far autocorrelation 0.52 |
| rm23_rewindB_afib150.png | Rewind B | 15 QRS; CV 0.23, shortest 0.31 s; at most 14% of a T wave under a QRS; P correlation -0.13; f-waves 420 per minute |
| rm23_rewindC_afib130.png | Rewind C | 13 QRS; CV 0.24, shortest 0.32 s; P correlation -0.12; f-waves 400 per minute, far autocorrelation 0.29 |

Every image's SHA-256 matches the manifest. The asset folder holds exactly these eleven files, and every one is referenced by `shift9/data.js`, so no outdated tracing is bundled.

## 5. Specialist review checklist

To be completed by an independent telemetry educator or cardiologist. Please record the outcome in `docs/CLINICAL_VALIDATION_REGISTRY.md`, not here.

- [ ] **Intervals:** PR, QRS and QT on all sinus tracings look normal, and nothing suggests long or short QT, especially on the Room 21 strip (syncope, recent antipsychotic).
- [ ] **Sinus morphology:** upright P waves in II, normal T waves, isoelectric ST on the 1430 strips.
- [ ] **D2 1508 strip:** about 2 mm of ST elevation in II reads as a new injury pattern compared with 1430, not as early repolarization or pericarditis.
- [ ] **12-lead:** inferior STEMI pattern (II, III, aVF; III > II) with reciprocal depression in I and aVL; no diagnostic elevation in V1 to V6; no posterior or right-ventricular pattern implied; small inferior q waves acceptable at about 33 minutes after symptom onset; axis normal.
- [ ] **12-lead lead relationships** look like a real recording, including that the derived leads are believable.
- [ ] **AF strips:** irregularly irregular; no discrete P waves; fibrillatory waves plausible and not mistakable for atrial flutter, ectopic atrial rhythm or sinus with PACs; rates match the printed counts.
- [ ] **Rewind B (about 150):** an AF rhythm with rapid ventricular response, without a pattern suggesting pre-excitation (WPW) or a wide-complex rhythm.
- [ ] **Leads-off strip:** recognizable as lost signal, not asystole or ventricular fibrillation.
- [ ] **Phone viewing:** on an iPhone-sized screen, the Limb leads view, the 12-lead at 200 to 300%, and the D2 comparison at 200% are adequate for interpretation at this learner level.
- [ ] **Lead II for teaching** (Part F question carried over), and whether a V1 rhythm strip should be offered for AF.

## 6. Remaining uncertainties

- **Constructed, not recorded.** These are sum-of-waves illustrations. The automated checks confirm internal consistency, intended intervals and amplitudes, and image-to-signal fidelity, not that a specialist would accept them as realistic.
- **Bazett in AF.** Room 23 at 1430 measures 470 ms by Bazett (413 ms Fridericia). A reviewer applying Bazett to AF could flag it. Lowering it would mean tuning the AF strips to one formula, so I left the physiology model as is and am flagging it here.
- **Pixel QT runs 8 to 23 ms longer than signal QT**, because line thickness and f-waves blur the T-wave end. The tests allow 20 ms on sinus strips only.
- **Inferior q waves** (0.10 mV in II) are within normal limits, but q waves in an evolving inferior MI are a judgment call for the reviewer.
- **Fibrillatory amplitude** (0.09 to 0.16 mV peak to peak) sits between fine and coarse AF; that's a stylistic choice.
- **The 12-lead viewer** was tested in Chromium at iPhone SE and iPhone 14 sizes, not on a physical iPhone or in the App Store WebView.
