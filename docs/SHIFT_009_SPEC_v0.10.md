# SHIFT-009 scenario spec v0.10

This file is the content source of truth for Shift 09 v0.10. It is the v0.7 scenario spec (Part 2 of `SHIFT-09-build-package.md`, which lives outside the repo) with the remediation Part 1 corrections (v0.8) the Part 2 ECG corrections (v0.9) and the delegation, thumbnail and duration edits of 27 Oct 2026 (v0.10) applied in place. Part 1 of that package (the build prompt) is not repeated here.

Review status: **Founder, independent clinical and psych specialty review reported by the founder**. Founder clinical sign-off of v0.10 was given by Mohamed on 28 Oct 2026 (founder-attested; no signed record). On 28 Oct 2026 the founder reported that the independent clinical review and the psych specialty review happened; reviewer roles, credentials, dates and psych review scope were not supplied. On 29 Oct 2026 the founder reported reviewing the ECG images and passing them (founder-attested; independent specialist ECG validation is not recorded), and authorized public release of v0.10 (see `docs/SHIFT_009_RELEASE.md`). Nothing here is formally clinically validated.

# SHIFT-009 "The Quiet Complaint": scenario spec v0.10 (source of truth)

Version 0.8 of a three-patient telemetry Shift on prioritizing and delegating. It was revised after four validation reviews on 24 Oct 2026 (v0.1 rated 8.2/10, v0.2 8.9/10, v0.3 9.0/10, v0.5 9.2/10 for clinical content; ready for independent RN review). It still needs founder review, independent clinical sign-off and psych specialty review before release. Result labels follow the template (Correct, Close, Not first, Not best, No, No (unsafe)). Every rationale cites a source in Part E that was opened while drafting. All nine ECG images are constructed illustrations that need a clinical check before release. **v0.8** applies the corrections from the post-build audit of 25 Oct 2026 (remediation Part 1, 26 Oct 2026). Every v0.8 change is listed in the change log below and in Part F. Text not listed there is unchanged from v0.7.

## v0.8 change log (from v0.7)

| Area | v0.7 | v0.8 | Audit finding | Needs clinical approval? |
| --- | --- | --- | --- | --- |
| D1 scoring | 7 rules; Marco in Room 22 or at the station fired no rule and scored No with only green feedback | 13 rules. Every team member always has a rule. Marco helping the RN in Room 22 is Correct (full credit). Marco at the station, with the RNs right, is Close (partial credit). Any no-credit placement always shows at least one No rule | H3 | **Yes** |
| D1 personalized review | One missed line for every miss | Missed line only when no RN reached Room 22; new lines for "Room 21 lacked the other RN" and for Close | M1 | Yes (wording) |
| D2 personalized review | Close (12-lead first) showed the missed line | New Close line | M2 | Yes (wording) |
| D4 and D5 personalized review | Same missed line for every miss | Choice-specific lines for "agree" (D4) and "notify" (D5) | M1, M2 | Yes (wording) |
| Guided safer paths | D1 only | Also after D2 (anything but Escalate now), and after no-credit D3, D4 and D5 choices; debrief note for any guided correction (Shift 06 pattern) | M3 | Yes (wording) |
| Rewind | Intro listed the three calls; titles "Stable", "Unstable", "In between" | Neutral intro; titles Version A, B and C | H2 | No |
| Rewind C | Escalate now: Not best | Escalate now: call rapid response: **Close**, with feedback on rapid response criteria vs. a provider call; the Correct call explains the distinction | M4 | **Yes** |
| Rewind alternatives | Empty "Reasonable alternatives" paragraph | One line per version | L6 | Yes (wording) |
| Alt text on decision screens | Part E text, which names the interpretation | Objective description (`altBefore`) until the decision is answered, then the Part E text | M7 | **Yes** |
| D1 earlier strips | "Starting strip" | "Earlier strip, 1430", plus a note on Room 22 that her current strip is not shown | M6 | Yes (wording) |
| Rhythm notes | 6-second method only | Adds that the count is an estimate and how to rate a regular rhythm | M8 | Yes (wording) |
| Estimated time | 6 minutes | About 10 to 12 minutes, from the measured text (about 1,950 words shown by default on an all-correct path); v0.10 writes it as 10–12 minutes | M5 | **Yes** (exceeds the template's 7-minute limit) |
| D4 panels | Full lists always open | Key point visible; the lists open from "The five safety steps" and "How to assess capacity and respond to a refusal" | M5 | No (layout) |
| Source 14 | Hosted copy (HTTP 404) | DOI link | M9 | No |
| Drew 2014 wording | "88.8% of sampled arrhythmia alarms" | States the scope: 12,671 annotated alarms for six serious arrhythmias | L4 | Yes (wording) |
| Wording | "From D2 on", "The choice response", antacid feedback mentioning leads | Learner wording; the lead-placement sentence moves to the "keep watching" choice | L2, L3 | Yes (wording) |
| Founder changes of 24 Oct 2026 | Recorded only in the build | Written into this spec: D1 shows all three strips; Lena is introduced as the monitor tech on D1 and D5 | n/a | Founder |
| D5 Marco line | Room 21 only | Adds a line when Marco was in Room 22 | follows H3 | Yes (wording) |

Remediation Part 2 (v0.9, below) covers the ECG items that v0.8 deferred.

## v0.10 change log (from v0.9): D1 delegation feedback, thumbnail, duration

| Area | v0.9 | v0.10 | Needs clinical approval? |
| --- | --- | --- | --- |
| D1 feedback layout | One list of every rule that fired | One line per team member (You, Tess, Marco: their placement, label and explanation), then any room left uncovered. Every fired rule still appears; a No result always shows at least one No line | No (layout) |
| D1 Marco in Room 22 (Correct, unchanged) | "...take her vitals, bring the 12-lead machine, record the 12-lead where CNAs are trained to, or go for more help. The RN still assesses Dolores and decides what the findings mean..." | "Also sound. Under RN direction, Marco can gather equipment such as the 12-lead machine, take her vitals and help with preparations. The RN keeps the assessment and every clinical decision. Ray is stable, and his vitals can wait a few minutes." (founder rationale; recording the ECG removed because it varies by facility) | Yes (wording) |
| D1 Marco at the station (Close, unchanged) | "Not unsafe, but not the best use of him right now. Lena is already watching the monitors..." | When both RN patients are covered: "Defensible if he stays immediately available, and it isn't unsafe: both patients who need an RN have one. An active assignment is a better use of him right now: backing up in Room 21, helping the RN in Room 22, or getting Ray's vitals." When a room is uncovered: "Waiting at the station isn't the main problem here, but it doesn't help either. Marco can't stand in for the missing RN; the RN assignment has to change. Until it does, he helps more by backing up in Room 21, helping the RN in Room 22, or getting Ray's vitals." | Yes (wording) |
| Library thumbnail | A cropped Room 22 rhythm strip (with clipped labels) | Original poster `shift9/poster.svg`: a central telemetry monitor (Room 21 artifact then LEADS OFF under a gold alarm; Room 22 calm sinus with only a slight ST lift; Room 23 irregular) and Room 22's softly lit call light. Generated by `tools/shift9-ecg/thumbnail.py` from the same ECG model. Decorative on the card (empty alt text, like other Shift posters); the SVG carries a title and description | Founder (visual) |
| Estimated time | About 10 to 12 minutes | 10–12 minutes (library card and header). The 1500 to 1600 scenario timeline is unchanged | Founder |
| D4 opening, Dolores handoff (L11, 28 Oct 2026) | "The STEMI team is with Dolores, getting her ready for the cath lab." | Own first paragraph: "Joy, the rapid response nurse, confirms she's taking over Dolores's bedside care with the STEMI team. Dolores stays on the monitor while they reassess her and get her ready for the cath lab. With Dolores safely covered, you return to Curtis." A qualified clinician explicitly accepts Dolores before you leave Room 22. Same on both D1 paths; timeline, choices and scoring unchanged | **Yes** (new learner-facing sentence) |

## v0.9 change log (from v0.8): ECGs and the 12-lead viewer

Learner-facing decision text, choices, scoring and review lines are unchanged from v0.8. Only the ECG images, their labels and screen-reader text, the D2 and D3 tracing display, and one viewer hint changed.

| Area | v0.8 | v0.9 | Audit finding | Needs clinical approval? |
| --- | --- | --- | --- | --- |
| QT on every tracing | T wave fixed 0.26 s after R at every rate; measured QTc (Bazett, from the image pixels) 463 ms (Room 21), 484 and 502 ms (Room 22), 493 ms (12-lead) | Each beat's QT follows its preceding R-R (Framingham formula); measured QTc 412 to 429 ms Bazett, 389 to 397 ms Fridericia on sinus tracings | H1 | Specialist check |
| Paper scale | Rhythm-strip grid boxes 1.27 times taller than wide, so every amplitude looked 27% larger; 12-lead off by 1% | Square grid on every image (verified from pixels) | Found in Part 2 | No |
| AF timing | Shortest R-R 0.24 s in Version B, with QRS complexes landing on the previous T wave | Shortest R-R 0.30 s or more; at most 15% of a T wave under any following QRS; no runs of three similar intervals | M10 | Specialist check |
| Fibrillatory waves | Up to 5.3 Hz (318 per minute) | 6 to 8.5 Hz (360 to 510 per minute), drifting amplitude and phase, checked not to be flutter-like | M10 | Specialist check |
| aVL | Near-isoelectric QRS (about 0.1 mV) | Visible small rS (about 0.34 mV); limb leads share QRS timing, so no derived lead is notched | M10 | Specialist check |
| Inferior q waves | 0.13 to 0.16 mV q waves in II and III | Small q waves (about 0.05 mV in III and 0.10 mV in II, about 30 ms wide), within normal limits | M10 | Specialist check |
| 6-second counts on regular strips | Room 22 1430 counted 8 (80) against HR 88 | Beat phase set so each 6-second count is the closest multiple of 10 to the rate (8, 9, 9). The rhythm-note caveat from v0.8 stays | M8 | No |
| Image labels | D5 image printed "Main script, Rewind A"; Rewind images printed "Rewind B" and "Rewind C" | D5 image shows room, lead and time only; Rewind images say "Version B" and "Version C", matching the v0.8 titles | L1 | No |
| D3 12-lead display | One image; unreadable on phones | Viewer with three views of the same recording: 12-lead, Limb leads (I, II, III, aVR, aVL, aVF) and Chest leads (V1 to V6), each six leads over the same 2.5 seconds; Fit, 150%, 200% and 300% zoom with sideways-only panning; full screen | H4 | No (layout) |
| D2 display | Two separate strips; side by side and small on desktop | One comparison panel: both strips stacked in one scroller that zooms and pans them together; opens at 200% on phones | H4 | No (layout) |
| Screen-reader text | Part E text for B and C said "Rewind B" and "Rewind C" | Says "Version B" and "Version C". New objective and post-answer text for the two 12-lead views (below) | follows L1 | Yes (wording) |
| New learner text | none | D3 viewer hint: "On a phone, the Limb leads and Chest leads views show six leads at a time over the same beats. Turn your phone sideways to see the whole 12-lead." | H4 | Yes (wording) |

Measurement method, results and the before/after table: `docs/SHIFT_009_ECG_VALIDATION.md`. Generator and validator: `tools/shift9-ecg/`. Automated measurement is not specialist ECG validation.

## Part A: Scenario card

The learner's first read ("the yelling room with the flat line is the emergency") is wrong. The quiet "indigestion" call is an inferior STEMI.

| Field | Value |
| --- | --- |
| Scenario ID | SHIFT-009 (Shift 09 in the library) |
| Version | 0.10 (v0.9 plus per-person D1 feedback, a new thumbnail and the duration wording, 27 Oct 2026) |
| Title | The Quiet Complaint |
| Specialty | Telemetry |
| Learner level | Student and new grad |
| Estimated time | 10–12 minutes |
| Decision count | 5 |
| Core lesson | The loudest room is not always the sickest: go where the findings point, and send the right teammate to the rest. |
| Learning objectives | 1. Prioritize three telemetry patients by their findings, not by noise or alarm volume. 2. Assign the charge nurse and CNA within their roles while you take the patient who needs an RN most. 3. Recognize that a heart attack can feel like indigestion, nausea or fatigue, sometimes without chest pain, even though chest discomfort stays common in both women and men. 4. Identify ST elevation in the inferior leads and escalate without delay. 5. Tell a leads-off alarm from a rhythm, and keep the plan for stable AFib. |
| Clinical concepts (tags) | prioritize-by-findings, delegation, anginal-equivalents, stemi-recognition, verbal-deescalation, stable-vs-unstable-afib |
| Clinical judgment steps | Prioritize hypotheses (D1), Recognize cues (D2), Analyze cues (D3), Take action (D1, D3, D4), Evaluate outcomes (D5) |
| Interaction types used | Assign the team (new), Then vs. now, Interpret a result, Therapeutic response (not built yet). Unscored: Patient assignment, Look closer |
| The twist | The loud room has a man who is talking, breathing and pulling off his leads. The quiet call light, which the monitor tech blames on lead placement after a bath, is an inferior STEMI. |
| Specialty reviewer needed? | Yes: psych, for Room 21 and Decision 4 |
| Review status | Founder, independent clinical and psych specialty review reported by the founder (28 Oct 2026); specialist ECG validation pending |
| Content review date | Pending |

## Part B: Interaction types and sequence

This sequence doesn't match any existing Shift. It needs one type not yet in the catalog (Assign the team) and one listed type that isn't built (Therapeutic response).

| Order | Screen | Interaction type | Built yet? |
| --- | --- | --- | --- |
| 1 | Patient assignment, with a starting strip on each card | Patient assignment (unscored) | Yes |
| 2 | D1, three at once | Assign the team, with a Look closer on the Room 21 strip (unscored) | No (new type); Look closer yes |
| 3 | D2, Room 22 then and now | Then vs. now | Yes (S2) |
| 4 | D3, the 12-lead | Interpret a result | Yes (S1, S2) |
| 5 | D4, Room 21 | Therapeutic response | No |
| 6 | D5, Room 23 strip | Interpret a result | Yes |

### Proposed new type for the catalog: Assign the team

| Field | Spec |
| --- | --- |
| What the learner does | Drags team tokens (You, the charge nurse, the CNA) onto room cards or "Stay at the station," then submits. |
| Scoring style | Rule-based. Each rule gives credit or flags a scope or safety problem, and the feedback explains every rule that fired. |
| Why it's new | Prioritize picks one patient. This tests prioritizing and delegating together, which is what a real assignment needs. |
| Reuse | Any multi-patient Shift with a team on screen. |

Build note for Astra: Therapeutic response is already in the Part B catalog with Best, acceptable and harmful tiers. This draft maps those tiers onto the template's result labels (Correct, Not best, No, No (unsafe)).

## Part C: Screen-by-screen script

Afternoon shift, 1500 to 1600, telemetry unit, five decisions. All patients, staff, names and places are fictional.

**Team on screen:** You (RN). Tess, charge nurse (RN). Marco, CNA. Lena, monitor tech. The rapid response team, plus the behavioral response team and security per your hospital's policy.

### Patient assignment (1500)

| Room | Age, setting, reason for admission | Report from the off-going nurse | Starting vitals and strip (1430) |
| --- | --- | --- | --- |
| 21 | Curtis Reed, 52, day 2 of a syncope workup after he fainted at a bus stop. History of schizophrenia. Stopped his antipsychotic two weeks ago. | "He's been suspicious all day, keeps asking who watches the monitor. Quiet, though, and his vitals are fine." | HR 84, BP 138/86, RR 16, SpO2 98% RA. Sinus rhythm. |
| 22 | Dolores Vega, 76, day 2 for a heart failure flare. Type 2 diabetes and hypertension. On 2 L nasal cannula. | "She's doing better, breathing's easier. Had some reflux after lunch and the antacid helped. Bath at 1400, so her leads got moved around." | HR 88, BP 132/74, RR 18, SpO2 95% on 2 L. Sinus rhythm, ST at baseline. |
| 23 | Ray Lindqvist, 68, admitted this morning for palpitations. New AFib found at 0800. | "AFib's been 100s to 110s all day, no symptoms. Provider knows. Rate-control plan is in, recheck at 1600. Call if he stays above 130." | HR about 110, BP 128/76, RR 16, SpO2 97% RA. Atrial fibrillation. |

**Starting strips on the report cards:**

![Room 21, lead II, 1430: sinus rhythm at 84](shift-09-assets/rm21_1430_sinus84.png)

![Room 22, lead II, 1430: sinus rhythm at 88, ST at baseline](shift-09-assets/rm22_1430_sinus88.png)

![Room 23, lead II, 1430: atrial fibrillation, about 110](shift-09-assets/rm23_1430_afib110.png)

Rhythm notes for the learner (tap to open on each card): sinus rhythm has a P wave before every QRS and regular spacing. AFib typically has irregularly irregular spacing without distinct P waves. Fibrillatory waves may be visible along the baseline, but they aren't always clear in every lead. To estimate an irregular rate, count the QRS complexes in 6 seconds and multiply by 10. That count is an estimate: on a 6-second strip it can differ from the monitor's rate by 10 or more. For a regular rhythm, the monitor's rate or the R-R interval (300 divided by the number of large boxes between R waves) is closer.

### Screen 1 (1505): Decision 1, Three at once

**Interaction type:** Assign the team, opening with a Look closer on the Room 21 strip (unscored)

**On screen:** The unit board and central monitor.

- **Room 21:** the monitor shows LEADS OFF. From the hall you hear Curtis yelling, "Get this thing off me! It's sending my thoughts out!"
- **Room 22:** her call light is on. Dolores, over the intercom: "Could someone bring me something for my indigestion?"
- **Lena, the monitor tech, calls:** "Hey, 22's ST in lead II is higher than this morning. Probably her leads after the bath, but I wanted you to know."
- **Room 23:** AFib 104 to 116 on the monitor, no alarms.
- **Staff:** Tess is at the station. Marco is finishing a bed change.

![Room 21, lead II, 1505: artifact, then leads off](shift-09-assets/rm21_1505_artifact_leadsoff.png)

**Strips on D1 (founder change, 24 Oct 2026; labels v0.8):** all three patients' strips show, each with time and a label. Room 21: "Room 21 / Now" (1505 strip above). Room 22: "Room 22 / Earlier strip, 1430" (the 1430 strip), with the note: "This is her 1430 baseline, from before the change Lena is calling about. Her current strip isn't shown here." Room 23: "Room 23 / Earlier strip, 1430".

**Look closer (unscored):** Tapping the Room 21 strip reveals: "Sinus beats march right through the wavy artifact, then the signal stops. LEADS OFF means the monitor can't see him. It isn't asystole, but it does mean he isn't being monitored right now. He's yelling, so he's awake and breathing. Someone needs eyes on him now, and his leads back on or another way to watch him as soon as it's safe."

**Prompt:** "Place yourself, Tess and Marco. Then submit."

**Scoring rules:**

| Rule (v0.8) | Result | Feedback |
| --- | --- | --- |
| An RN (you or Tess) goes to Room 22 now | Correct | New "indigestion" with an ST change must be evaluated as possible cardiac ischemia. Either RN can take her, as long as she's assessed now and escalated fast. You know her baseline; Tess is often better placed to lead the behavioral response. Decide together. |
| No RN goes to Room 22 | No (unsafe) | A CNA can't assess a new cardiac symptom, and an antacid could delay evaluation of a possible ACS. Room 22 needs an RN now. |
| Both RNs go to Room 22 | No | One RN can assess Dolores and get the team moving. The other RN is needed in Room 21, where Curtis is agitated and off the monitor. |
| One RN goes to Room 21 and calls the behavioral team per policy | Correct | A frightened, agitated patient needs an experienced lead. His leads are off, so that RN also watches how he looks and breathes, and calls the provider about the lost monitoring. |
| Both RNs go to Room 21 | No | Curtis needs one RN to lead while the behavioral team comes. Two RNs in Room 21 leaves Dolores without an RN. |
| An RN goes to Room 23 or stays at the station | No | Neither needs an RN right now. Ray is stable with a plan, and Lena is watching the monitors. Each RN is needed in Room 21 or Room 22. |
| Marco goes to Room 21 alone | No | Don't send a CNA alone into a room with an agitated patient. An RN or the behavioral team leads, and Marco backs them up. |
| No one goes to Room 21 | No | His leads are off, so the monitor can't watch him for you. Someone needs eyes on him. |
| Marco takes vitals on Room 23 | Correct | Ray is stable with a plan, so his vitals are a good CNA task. |
| Marco backs up the RN at Room 21 | Correct | Also sound, if Marco gives non-confrontational help under RN direction, like staying by the door or getting more help. He doesn't assess or talk Curtis down himself. Ray is stable, and his vitals can wait a few minutes. |
| Marco helps the RN in Room 22 | Correct | Also sound. Under RN direction, Marco can gather equipment such as the 12-lead machine, take her vitals and help with preparations. The RN keeps the assessment and every clinical decision. Ray is stable, and his vitals can wait a few minutes. |
| Marco goes to Room 22 without an RN | No | Marco can take her vitals, but he can't assess a new cardiac symptom or decide what an ST change means. Room 22 needs an RN with him. |
| Marco stays at the station | Close | With both RN patients covered: "Defensible if he stays immediately available, and it isn't unsafe: both patients who need an RN have one. An active assignment is a better use of him right now: backing up in Room 21, helping the RN in Room 22, or getting Ray's vitals." With a room uncovered (v0.10): "Waiting at the station isn't the main problem here, but it doesn't help either. Marco can't stand in for the missing RN; the RN assignment has to change. Until it does, he helps more by backing up in Room 21, helping the RN in Room 22, or getting Ray's vitals." |

**How the rules fire (v0.8):** every placement fires at least one rule about each RN and one about Marco. "An RN goes to Room 22" fires whenever at least one RN is there; "One RN goes to Room 21" fires when exactly one RN is there. A no-credit placement always fires at least one No rule, so the feedback never shows only Correct rows under a No heading.

**Scoring (v0.8):** Full credit for one RN in Room 22, the other RN in Room 21, and Marco helping in Room 21, Room 22 or Room 23. It doesn't matter which RN takes which room. Partial credit (Close) when the RNs are placed right and Marco stays at the station. No credit if no RN reaches Room 22, if Room 21 doesn't get the other RN, or if Marco is alone in Room 21 or Room 22. No credit continues on a labeled guided safer path: "Guided safer path. This placement doesn't earn credit. The scenario continues on [Path A or Path B]. Your original placement stays recorded." Path B is used only when Tess alone took Room 22. Below a no-credit or Close result, show: "Full credit for one RN in Room 22, the other RN in Room 21, and Marco helping in Room 21, Room 22 or Room 23. It doesn't matter which RN takes which room."

**What happens next (unscored, both correct paths meet at 1508):**

| Time | Path A: you in 22, Tess in 21 | Path B: Tess in 22, you in 21 |
| --- | --- | --- |
| 1506 | Tess calls the provider: Curtis is off telemetry. Interim plan: an RN keeps him in line of sight and reassesses him often until monitoring is back. | You call the provider with the same message and the same interim plan. |
| 1507 | The behavioral response nurse arrives at Room 21 to join Tess. | The behavioral response nurse arrives and takes over watching Curtis from the doorway. You hand off what you've seen. |
| 1508 | You're at Dolores's bedside. | Tess: "She's your patient. Come look at this." You join her in Room 22. Tess goes back to Room 21 once Joy, the rapid response nurse, arrives at 1513. |

From here on, both paths play the same scenes. Room 21 never goes unwatched.

**Teaching line:** The loudest room isn't always the sickest. A quiet call light with an ST change outranks a patient who is yelling.

**Concept tags hit:** prioritize-by-findings, delegation

**Source for this rationale:** 6 (in one ICU study, 88.8% of 12,671 annotated alarms for six serious arrhythmias were false positives, from causes including alarm settings, algorithms and patient rhythms; poor signal quality was less common), 7 (delegate only stable, predictable care; assessment and clinical reasoning stay with the RN), 8 (agitation is a team effort), 1 and 3 (heart attack symptoms can include nausea and upper abdominal discomfort)

### Screen 2 (1508): Decision 2, Room 22 then and now

**Interaction type:** Then vs. now

**On screen:** Dolores is sitting up, pale and a little sweaty, with a hand on her upper belly. "It's just my indigestion again. The antacid worked at lunch." Her 1430 and 1508 lead II strips sit side by side.

![Room 22, lead II, 1430: sinus rhythm at 88, ST at baseline](shift-09-assets/rm22_1430_sinus88.png)

![Room 22, lead II, 1508: sinus rhythm at 94, ST raised about 2 mm](shift-09-assets/rm22_1508_sinus94_ste.png)

**Checklist steps (the learner taps each one to compare):**

| Step | 1430 | 1508 |
| --- | --- | --- |
| Rate and rhythm | Sinus, 88 | Sinus, 94 |
| ST segment, lead II | At baseline | Raised about 2 mm |
| Electrodes | Moved during the 1400 bath | You check: all in the right spots |
| BP | 132/74 | 106/62 |
| RR, SpO2 | 18, 95% on 2 L | 22, 93% on 2 L |
| Symptoms | None | Upper belly burning since about 1440, nausea, sweating, "more tired than this morning." Denies chest pain. |
| Glucose | Not checked | 164 at 1500, so low blood sugar doesn't explain the sweating |

**Prompt:** "What's your call?"

| Choice | Result | Feedback |
| --- | --- | --- |
| Escalate now: get a stat 12-lead and call rapid response, or your hospital's chest pain or STEMI response, per policy | Correct | New ST elevation, a 26-point drop in systolic pressure, sweating and nausea in a 76-year-old with diabetes add up to a possible heart attack. Don't wait for her to call it chest pain. |
| Get specific information: stat 12-lead first, then call based on what it shows | Close | The 12-lead is right, and it's fast. With her pressure down and new symptoms, though, call while it's being done, not after. |
| Notify the provider (non-urgent): page with her symptoms | No | A page that waits in a queue doesn't match these findings. |
| Give the antacid she asked for and recheck in 30 minutes | No (unsafe) | Treating this as reflux could delay evaluation of a possible ACS. Her new ST change, lower BP, sweating and nausea point to her heart. The 12-lead will tell you more. |
| Ask Lena to keep watching and call if it gets worse | No (unsafe) | She's already worse than at 1430. Her electrodes are in the right spots, which makes lead placement a less likely explanation. Watching longer isn't a plan. |

**Scoring:** Escalate now earns full credit. The 12-lead-first choice earns partial credit.

**Guided safer path (v0.8, shown after any choice except Escalate now):** "Guided safer path. The scenario continues with rapid response called at 1508 and the stat 12-lead done at the same time. Your original choice stays recorded."

**Teaching line:** Chest discomfort is common in heart attacks for women and men, but ischemia can also show up as upper abdominal discomfort, nausea, sweating or fatigue, sometimes without chest pain.

**Concept tags hit:** anginal-equivalents, prioritize-by-findings

**Source for this rationale:** 1 (nausea, epigastric pain and fatigue; atypical symptoms more common in women, older adults and people with diabetes), 3 (symptoms can sit in the upper abdomen or jaw; women more often have nausea and shortness of breath), 4 (women more often report associated symptoms), 2 and 14 (acquire and read the 12-lead within 10 minutes), 5 (electrode placement matters), 13 (staff concern alone is enough to call rapid response)

### Screen 3 (1513): Decision 3, Read the 12-lead

**Interaction type:** Interpret a result

**On screen:** "Joy, the rapid response nurse, walks in as the 12-lead prints."

![Room 22, 12-lead ECG, 1513](shift-09-assets/rm22_1513_12lead_inferior_stemi.png)

**Prompt:** "What does this 12-lead show, and what's next?"

| Choice | Result | Feedback |
| --- | --- | --- |
| ST elevation in II, III and aVF, with ST depression in I and aVL. Start your hospital's STEMI escalation pathway and stay with her. | Correct | II, III and aVF look at the bottom (inferior wall) of the heart. ST elevation in two or more neighboring leads, with mirror-image depression in I and aVL, is a STEMI pattern. You don't diagnose it. You recognize it and get the team moving. |
| ST elevation in V1 to V4. Start the STEMI escalation pathway. | Close | Safe action, wrong leads. The elevation is in II, III and aVF, and V1 to V4 don't show diagnostic ST elevation. Look again at which leads sit together. |
| ST elevation in II, III and aVF. Notify the provider and repeat the 12-lead in 30 minutes. | No (unsafe) | A STEMI is time-critical. Repeating the ECG later delays the team. |
| No acute changes. Probably lead placement after her bath. | No (unsafe) | Correct electrode positions make lead placement less likely, and the 12-lead shows a pattern across neighboring leads, not one odd lead. |

**Scoring:** Full credit for the first choice. The V1 to V4 choice earns partial credit for safe escalation, but it doesn't count as correct lead identification, so the debrief shows the D3 "If missed" line.

**Guided safer path (v0.8, after a No (unsafe) reading):** "Guided safer path. The scenario continues with the STEMI escalation pathway started now and you staying with her. Your original choice stays recorded."

**While the team works (unscored, shown after the choice):** Stay with her and keep her in bed. Keep her on the monitor and recheck her vitals and how she feels. Make sure her IV works and the crash cart is close, per policy. Give Joy a quick SBAR: her baseline at 1430, the change at 1508, and the 12-lead. Hand Rooms 21 and 23 to Tess while you stay.

**Teaching note (unscored):** With a suspected inferior STEMI, the team may ask for right-sided leads, such as V4R, to check for right ventricular involvement. Who records them varies, so follow your hospital's process.

**Teaching line:** Find the leads that match. ST elevation in II, III and aVF points to the inferior wall.

**Concept tags hit:** stemi-recognition

**Source for this rationale:** 2 (ST elevation at the J point in 2 contiguous leads, above 0.1 mV outside V2 and V3; ECG immediately and read within 10 minutes; door-to-balloon goal under 90 minutes), 1 (reciprocal ST depression in I and aVL with inferior MI), 14 (in-hospital ECG within 10 minutes; right-sided leads when inferior STEMI is a concern)

### Screen 4 (1525): Decision 4, Room 21

**Interaction type:** Therapeutic response

**On screen:** "Joy, the rapid response nurse, confirms she's taking over Dolores's bedside care with the STEMI team. Dolores stays on the monitor while they reassess her and get her ready for the cath lab. With Dolores safely covered, you return to Curtis.

An RN or the behavioral response nurse has kept eyes on Curtis since 1505, and the provider has known he's off telemetry since 1506. Tess is at the doorway with the behavioral response nurse. Security waits nearby, out of his direct line of sight, per policy." Curtis is pacing by the window with the monitor box in his hand and the leads hanging. He isn't threatening anyone, and both he and staff have a clear path to the door. From the doorway, Tess reports he's pink, breathing easily, steady on his feet and talking in full sentences. Tess: "He's asking for his nurse."

Curtis: "That box sends my thoughts to the government. I know you're all in on it."

**Prompt:** "You stand two arm's lengths away, near the open door. You're the only one talking. What do you say first?"

| Choice | Result | Feedback |
| --- | --- | --- |
| "It sounds like that box is scaring you. Do you want to set it on the table while we talk? Then we'll decide together what to do about the monitor." | Correct | You respond to the fear without contradicting him, and a real choice gives him back some control. He's off the monitor, so this starts the plan; it doesn't finish it. |
| "Curtis, I'm your nurse. That sounds really frightening. The monitor sends information about your heart rhythm to the healthcare team so we can respond if something changes. Can we sit down and talk about what would help?" | Correct | Also sound. A short, truthful explanation, said once without arguing, can help. The first response, which offers a choice, is the preferred example because it's less likely to sound like a correction to someone with persecutory beliefs. |
| "Nobody can read your thoughts. That's your illness talking. Put it back on." | No | Arguing with a delusion and giving orders usually makes things worse. |
| "Okay, I'll make sure the government can't hear anything." | No | Agreeing with the delusion isn't honest and can reinforce it. You can accept that he's having the experience without saying it's true. |
| "If you don't put it back on, security will hold you down." | No (unsafe) | Threats raise agitation and put him and staff at risk. Restraint is a last resort that needs clear clinical and legal justification under your hospital's policy. Restoring telemetry alone doesn't justify it, and it's never a bargaining chip. |

**Scoring:** Either calm, nonconfrontational response earns full credit. The response that offers a choice is the preferred example.

**Guided safer path (v0.8, after a No or No (unsafe) response):** "Guided safer path. The scenario continues as if you had responded to his fear and offered him a choice. Your original response stays recorded."

**Right away, while de-escalation continues (unscored):** He's a syncope patient with no monitoring, so the safety plan can't wait for him to calm down. Watching him is not the same as telemetry: an observer can't catch an arrhythmia. Treat the gap as an ongoing risk, and keep reassessing until he's back on the monitor. *(v0.8 layout: the paragraph stays visible; the five steps below open from a toggle labeled "The five safety steps".)*

- Keep a staff member watching him in person, within line of sight, until monitoring is back. Tell him why, and revisit the plan with him as he calms.
- Every few minutes, check his color, breathing and alertness from where you stand.
- Update the provider, who has known since 1506, and confirm the plan to get him back on the monitor or use another form of monitoring per policy. If he still declines, report it as a refusal.
- Get vitals and a glucose as soon as he allows it.
- Think medical as well as psychiatric. New or different agitation can come from low blood sugar or low oxygen, even in someone with schizophrenia. Then ask about a psychiatry consult per policy.

**Capacity and the right to refuse (unscored teaching panel):** Curtis can say no to telemetry. Schizophrenia, active delusions and stopping his medication don't by themselves mean he can't make this decision. Presume he has capacity unless an assessment shows otherwise. *(v0.8 layout: the paragraph stays visible; the five points below open from a toggle labeled "How to assess capacity and respond to a refusal".)*

- **Decision-specific:** His fear is about the monitor itself, so the question is narrow. Can he understand the risk of going without telemetry during a syncope workup, appreciate that it applies to him, weigh it, and tell you his choice?
- **Your part:** Explain the risk once, calmly, without arguing: "The monitor watches for heart rhythm changes that could explain your fainting. Without it, we could miss one." Listen to his answer and document what he says.
- **Notify the provider** of the refusal. If decision-making capacity is uncertain, notify the treating provider for assessment. Psychiatry may be consulted when indicated, according to facility policy.
- **If he has capacity and still refuses,** respect his decision. Work with him and the provider on an alternative safety plan he agrees to, such as observation, reassessment and standing offers to reconnect.
- **No coercion or restraint just to restore telemetry.** That needs clear clinical and legal justification under your hospital's policy.

**Teaching line:** Don't argue with a delusion and don't agree with it. Respond to the feeling, keep it short, and offer a choice.

**Concept tags hit:** verbal-deescalation

**Source for this rationale:** 8 (two arm's lengths, a clear exit, one person talks, be concise, agree or agree to disagree, offer choices, restraint as a last resort), 9 (agitation can come from a medical cause; suspect one when a known psychiatric illness presents differently), 15 (capacity is decision-specific; understand, appreciate, reason, communicate; a refusal is honored when those are present; the treating physician makes the determination), 16 (adults are presumed to have capacity; a mental disorder doesn't by itself make a person incapable; decisions should be free of coercion)

### Screen 5 (1535): Decision 5, Room 23

**Interaction type:** Interpret a result

**On screen:** Once the behavioral team had Room 21 covered, Tess sent Marco to Room 23. He reports Room 23's vitals from 1530: HR 110, BP 126/78, RR 16, SpO2 97% RA. Marco collects the vitals; reading the rhythm and reassessing Ray stay with you. Ray: "Still a little fluttery, same as this morning. No chest pain. Breathing's fine." Lena, the monitor tech: "23's been 104 to 118 all day." The plan on screen: rate control in progress, recheck at 1600, call the provider if he stays above 130.

**Build note (added in this package):** Show the first sentence ("Once the behavioral team had Room 21 covered, Tess sent Marco to Room 23.") only if Marco was placed at Room 21 in D1. Otherwise the screen starts "Marco reports Room 23's vitals from 1530:" and the rest is unchanged. **v0.8:** if Marco was placed in Room 22 in D1, the screen starts "Once the STEMI team took over in Room 22, Tess sent Marco to Room 23. He reports Room 23's vitals from 1530:".

![Room 23, lead II, 1535: main script and Rewind A](shift-09-assets/rm23_1535_afib110_rewindA.png)

**Prompt:** "Read his strip. What's your call?"

| Choice | Result | Feedback |
| --- | --- | --- |
| Continue and reassess | Correct | Irregularly irregular, no P waves, rate about 110 (11 QRS in 6 seconds). His pressure is normal, and he has no chest pain, shortness of breath or confusion. He remains stable, with no new findings that call for a change from the current plan. |
| Get specific information: ask about dizziness, chest pain and shortness of breath, and confirm the 1600 recheck with Marco | Correct | Also a sound plan. It's continuing and reassessing, done deliberately. |
| Notify the provider (non-urgent) | Not best | The provider already knows, and nothing has changed. Save the call for a change, like a rate above 130. |
| Escalate now | Not best | He's stable and unchanged. Escalation is for change or signs of instability. |

**Scoring:** Either Correct choice earns full credit.

**Guided safer path (v0.8, after a Not best call):** "Guided safer path. The scenario continues with Ray on his current plan and the 1600 recheck. Your original choice stays recorded."

**Teaching line:** Stable AFib with a plan stays on the plan. Watch for what would make it unstable: low BP, new confusion, chest pain, signs of shock or acute heart failure.

**Concept tags hit:** stable-vs-unstable-afib

**Source for this rationale:** 11 (no P waves, fibrillatory waves, irregularly irregular R-R intervals), 10 (many patients with AFib have no symptoms; most stable patients start with rate control), 12 (signs that a fast rhythm is causing instability), 5 (new-onset AFib belongs on continuous monitoring)

### Final screen

"Afternoon challenge complete."

## Rewind set: the Room 23 call, three ways

The Rewind replays Decision 5 with the same patient in three different clinical states. Read each one and decide what it needs now. His history, the 0800 AFib, and the provider's plan (recheck at 1600, call if he stays above 130) stay the same in all three. *(v0.8: this is the learner-facing intro. It no longer lists the calls. The intended calls are Continue and reassess for A, Escalate now for B, and Notify the provider for C.)*

| Finding at 1535 | Version A (the main script) | Version B | Version C |
| --- | --- | --- | --- |
| Strip | AFib, about 110 | AFib, about 150 | AFib, about 130 |
| Lena's trend | 104 to 118 all day | Jumped to the 140s and 150s 10 minutes ago | 132 to 138, sustained for the last 20 minutes |
| BP | 126/78 | 84/50 | 124/76 |
| How he looks and feels | "Fluttery, same as this morning" | Pale, clammy, dizzy. "My chest feels tight." | Fluttery. No chest pain, dizziness or shortness of breath. |
| Mental status | Alert, oriented | Slow to answer | Alert, oriented |
| Correct call | Continue and reassess | Escalate now | Notify the provider, now |

**Titles shown to learners (v0.8):** "Version A", "Version B" and "Version C". Authoring names such as Stable, Unstable, In between and main script are never shown. The strip on each version reads its objective description (Part E, v0.8 alt text), because the strip shows only before the choice.

**Reasonable alternatives and scope (v0.8, shown in each version's feedback):**

- Version A: "Asking about dizziness, chest pain and shortness of breath before you decide is also sound. Call the provider if anything changes or his rate stays above 130."
- Version B: "Who you call first, rapid response or the provider by phone, follows your hospital's process. Either way, he needs the team at the bedside now, and you stay with him."
- Version C: "If your hospital's rapid response criteria include a sustained heart rate above 130, calling them follows your policy. Call the provider either way, and keep rechecking his rate and symptoms."

**Rate note for Variation C:** The 6-second count on the C strip (13 QRS, about 130) is only an estimate. The monitor's 20-minute trend is what shows he has stayed above 130.

![Room 23, lead II, 1535: Rewind A, AFib about 110](shift-09-assets/rm23_1535_afib110_rewindA.png)

![Room 23, lead II, 1535: Rewind B, AFib about 150](shift-09-assets/rm23_rewindB_afib150.png)

![Room 23, lead II, 1535: Rewind C, AFib about 130](shift-09-assets/rm23_rewindC_afib130.png)

Variation A scoring is Decision 5 above.

### Variation B: scoring

| Choice | Result | Feedback |
| --- | --- | --- |
| Escalate now: call rapid response and stay with him | Correct | AFib with a rapid ventricular response near 150, with low BP, chest tightness and slowed thinking, means he's hemodynamically unstable. The team will sort out the cause. He needs them at the bedside now. |
| Notify the provider (non-urgent) | No | A page in a queue doesn't match instability. |
| Get specific information: repeat his BP in 15 minutes, then decide | No (unsafe) | Waiting delays care for a patient who is already unstable. |
| Continue and reassess | No (unsafe) | His findings changed, so the old plan no longer fits. |

### Variation C: scoring

| Choice | Result | Feedback |
| --- | --- | --- |
| Notify the provider: call now with his rate trend, BP and symptoms, since he's past the "call if above 130" line | Correct | His monitor trend has stayed above 130 for 20 minutes, so he's past the line the provider set, even though he's stable. Making that call is part of the plan. It's a provider call, not a rapid response call: he needs his plan changed, and he has no signs of instability. |
| Get specific information: recheck his rate in 15 minutes, then call if he's still high | Close | Not unreasonable, but he's already been above 130 for 20 minutes. Call now, and recheck too. |
| Escalate now: call rapid response | Close | Defensible if your hospital's rapid response criteria include a sustained heart rate above 130, so follow your policy. Here, though, his pressure is normal and he has no signs of instability, so the provider's call parameter is the main trigger. A provider call gets his plan changed; a rapid response call brings a team to the bedside for instability. |
| Continue and reassess | No | He crossed the provider's call parameter. Staying quiet breaks the plan. |

**Teaching line for the Rewind:** Same rhythm, three calls. Stability and the provider's plan set the urgency, not the rhythm's name.

**Sources:** 12 (signs of instability), 10 (unstable AFib needs emergent evaluation and treatment), 11 (AFib ECG features), 13 (rapid response criteria include numeric triggers; added in v0.8)

## Part D: Debrief and connections

### 1. Outcome narration

- **1514** The hospital's STEMI pathway is started. **1540** Dolores leaves for the cath lab with the STEMI team.
- **1540** Curtis sits down with you and the behavioral response nurse and agrees to put the monitor back on, after about 35 minutes off telemetry. The provider orders a psychiatry consult.
- **1600** Ray's recheck shows his rate settling into the 90s. He's still in AFib, on his plan.

### 2. Personalized shift review

| Decision | If correct | If missed | Concept to strengthen (shown only if missed) |
| --- | --- | --- | --- |
| D1 | "You got an RN to the quiet room with the ST change and sent the right teammate to the loud one." | "Room 22 needed an RN first. Curtis's yelling meant he was breathing. Dolores's ST change meant her heart might not be getting enough blood." | prioritize-by-findings, delegation |
| D2 | "You saw her 'indigestion' for what it was: a new ST change, a lower BP, sweating and nausea." | "Upper belly burning, nausea and sweating with a new ST change and a lower BP point to her heart, not her stomach." | anginal-equivalents |
| D3 | "You found the elevation in II, III and aVF and got the team moving." | "Look for ST elevation in leads that sit together. II, III and aVF did, and that called for the STEMI response now." | stemi-recognition |
| D4 | "You calmed Curtis without arguing, agreeing or threatening, and left the decision about the monitor with him." | "With a delusion, respond to the feeling, keep it short and offer a choice. Arguing or threatening raises the risk." | verbal-deescalation |
| D5 | "You kept Ray on his plan because nothing had changed." | "Ray was stable and unchanged with a plan in place. Escalation is for change or instability." | stable-vs-unstable-afib |

**Additional review lines (v0.8).** The line shown always matches the learner's actual choice:

| Decision | When | Line | Concept to strengthen |
| --- | --- | --- | --- |
| D1 | Close (RNs right, Marco at the station) | "You put both RNs where they were needed. Marco would have helped more in a room than at the station." | delegation |
| D1 | No credit, but an RN reached Room 22 | "You got an RN to Room 22. Room 21 needed the other RN: Curtis was agitated and off the monitor, and a CNA can back up but not lead." | prioritize-by-findings, delegation |
| D1 | No RN reached Room 22 | The v0.7 "If missed" line | prioritize-by-findings, delegation |
| D2 | Close (12-lead first) | "You saw it was her heart and got the 12-lead fast. With her pressure down, call the team while it's being done, not after." | prioritize-by-findings |
| D3 | Close (V1 to V4) | The v0.7 "If missed" line, unchanged | stemi-recognition |
| D4 | Agreed with the delusion | "Agreeing with a delusion isn't honest and can reinforce it. Respond to the feeling, keep it short and offer a choice." | verbal-deescalation |
| D5 | Notify the provider (non-urgent) | "Ray was stable and unchanged, and the provider already knew. Save the call for a change, like a rate above 130." | stable-vs-unstable-afib |

**Guided-correction note (v0.8):** if any decision continued on a guided safer path, the outcome narration opens with "Scripted outcome after guided corrections. The story below follows the safer path. Your shift review reflects your original choices, not the corrections."

### 3. Takeaways

**The loudest room is not always the sickest: go where the findings point, and send the right teammate to the rest.**

**Chest discomfort is common in heart attacks for women and men, but a heart attack can also feel like indigestion, especially in women, older adults and people with diabetes.**

### 4. Why it happens

- Chest pain is still the most common heart attack symptom, including in women, but it isn't always there. Symptoms can sit in the upper abdomen or jaw, and women more often have nausea and shortness of breath with it [Sources 1, 3, 4, 14].
- ST elevation in neighboring leads marks injury in the wall those leads face. II, III and aVF face the inferior wall, and I and aVL often show mirror-image depression [Sources 1, 2].
- In one ICU study, 88.8% of 12,671 annotated alarms for six serious arrhythmias, such as asystole and ventricular tachycardia, were false positives. Causes included alarm settings, monitoring algorithms and patient rhythms; poor signal quality was less common. Alarms still require appropriate assessment. A leads-off alert indicates loss of monitoring, not confirmed asystole [Source 6].

### 5. Go further

| Button | Destination in Clinical Edge | Concept tag it serves | Verified to exist? |
| --- | --- | --- | --- |
| ST elevation, explained | Rhythm Lab entry on ST elevation or the 12-lead | stemi-recognition | Not yet: Mohamed to confirm (hide until verified) |
| AFib: stable or unstable? | Rhythm Lab entry on atrial fibrillation | stable-vs-unstable-afib | Not yet: Mohamed to confirm (hide until verified) |
| Ask why | Ask, prefilled: "Why can a heart attack feel like indigestion?" The learner chooses to send. | anginal-equivalents | Always available |
| Play again | Restart this scenario | none | Always available |

No ICU Drips or advanced references: the learner level and objectives don't call for them.

### 6. Share card

"The loudest room on the unit wasn't the sickest one."

### 7. Test question

"Want another shift tomorrow?" Yes / Maybe / No

## Part E: Sources, assets and rights

This draft uses 16 sources, all opened while drafting (12 on 23 Oct 2026, three on 24 Oct 2026, one on 18 Oct 2026). No rationale rests on a search snippet, and no OpenStax sources are used. Three guideline claims rest on the American College of Cardiology's official summaries, because the journal pages blocked access. Part F flags those for a human to check against the full text.

### Sources

| # | Full citation with link | Type | Exact claim it supports | Supports | Opened and checked by |
| --- | --- | --- | --- | --- | --- |
| 1 | Rout P, editor. [Inferior Myocardial Infarction](https://www.statpearls.com/point-of-care/23500). StatPearls Point-of-Care; updated 7 Nov 2025. | Peer-reviewed review | Inferior MI shows reciprocal ST depression in I and aVL. Ischemia can cause nausea, vomiting, epigastric pain and fatigue. Atypical symptoms are more common in women, older adults and people with diabetes. | D1, D2, D3, Debrief bullets 1 and 2 | Claude (AI), 23 Oct 2026 |
| 2 | Akbar H, Sharma S. [Acute ST-Segment Elevation Myocardial Infarction (STEMI)](https://www.ncbi.nlm.nih.gov/books/NBK532281/). StatPearls; updated 6 Oct 2024. | Peer-reviewed review | New ST elevation at the J point in 2 contiguous leads, above 0.1 mV outside V2 and V3 (citing the 2018 Fourth Universal Definition of MI). Get an ECG immediately and have it read within 10 minutes. Door-to-balloon goal under 90 minutes. | D2, D3, Debrief bullet 2 | Claude (AI), 23 Oct 2026 |
| 3 | Gulati M, Levy PD, Mukherjee D, et al. 2021 AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR Guideline for the Evaluation and Diagnosis of Chest Pain. J Am Coll Cardiol. 2021. Opened via [ACC Ten Points to Remember](https://acc.org/latest-in-cardiology/ten-points-to-remember/2021/10/27/14/06/2021-guideline-for-chest-pain-gl_chestpain). | Guideline (2021), via ACC summary | Chest pain can be felt in the shoulder, arm, neck, upper abdomen or jaw. Women more commonly have accompanying nausea, palpitations and shortness of breath. Describe chest pain as cardiac, possibly cardiac or noncardiac, not typical or atypical. | D1, D2, Debrief bullet 1 | Claude (AI), 23 Oct 2026 |
| 4 | Mehta LS, Beckie TM, DeVon HA, et al. Acute Myocardial Infarction in Women: A Scientific Statement From the AHA. Circulation. 2016. Opened via [ACC Ten Points to Remember](https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2016/01/26/15/08/Acute-Myocardial-Infarction-in-Women). | Scientific statement (2016), via ACC summary | Most women have chest pain, but women more often report associated symptoms (dyspnea, fatigue, weakness), which may add to treatment delays. Diabetes raises a woman's MI risk. | D2, Debrief bullet 1 | Claude (AI), 23 Oct 2026 |
| 5 | Sandau KE, Funk M, Auerbach A, et al. Update to Practice Standards for Electrocardiographic Monitoring in Hospital Settings: A Scientific Statement From the AHA. Circulation. 2017. Opened via [ACC Ten Points to Remember](https://acc.org/latest-in-cardiology/ten-points-to-remember/2017/10/04/12/26/update-to-practice-standards-for-electrocardiographic-monitoring). | Scientific statement (2017), via ACC summary | Electrode placement and lead selection are paramount. ST-segment monitoring is reasonable early in ACS. New-onset atrial arrhythmias belong on continuous monitoring. Alarm management is part of monitoring. | D2, D5 | Claude (AI), 23 Oct 2026 |
| 6 | Drew BJ, Harris P, Zègre-Hemsey JK, et al. [Insights into the Problem of Alarm Fatigue with Physiologic Monitor Devices](https://pmc.ncbi.nlm.nih.gov/articles/PMC4206416). PLoS One. 2014;9(10):e110274. | Peer-reviewed study | 88.8% of 12,671 annotated arrhythmia alarms were false positives. Causes included alarm settings, persistent AFib, low-amplitude or wide QRS complexes and algorithm limits. Only 8.5% of alarms had poor signal quality, and clear-cut electrode problems were rare. | D1, Debrief bullet 3 | Claude (AI), 23 Oct 2026 |
| 7 | American Nurses Association, National Council of State Boards of Nursing. [National Guidelines for Nursing Delegation](https://www.nursingworld.org/globalassets/practiceandpolicy/nursing-excellence/ana-position-statements/nursing-practice/ana-ncsbn-joint-statement-on-delegation.pdf). Effective 1 Apr 2019. | Professional society | Clinical reasoning and nursing judgment can't be delegated. The "right circumstance" requires a stable patient. The delegating nurse stays accountable. State laws and employer policies vary. | D1 | Claude (AI), 23 Oct 2026 |
| 8 | Richmond JS, Berlin JS, Fishkind AB, et al. [Verbal De-escalation of the Agitated Patient: Consensus Statement of the AAEP Project BETA De-escalation Workgroup](https://www.health.mn.gov/facilities/patientsafety/preventionofviolence/docs/verbdeescalagitatedpatientarticle.pdf). West J Emerg Med. 2012;13(1):17-25. | Peer-reviewed consensus | Keep 2 arm's lengths and a clear exit for both people. Only one person talks. Be concise. Agree or agree to disagree with delusions. Offer realistic choices. Agitation care is a team effort. Restraint only as a last resort. | D1, D4 | Claude (AI), 23 Oct 2026 |
| 9 | Nordstrom K, Zun LS, Wilson MP, et al. [Medical Evaluation and Triage of the Agitated Patient: Consensus Statement of the AAEP Project BETA Medical Evaluation Workgroup](https://pmc.ncbi.nlm.nih.gov/articles/PMC3298208). West J Emerg Med. 2012;13(1):3-10. | Peer-reviewed consensus | Agitation can come from a medical condition, intoxication or withdrawal, or psychiatric illness. Suspect a medical cause when a known psychiatric illness presents differently than before. | D4 | Claude (AI), 23 Oct 2026 |
| 10 | Holder S, Amin P. [Atrial Fibrillation: Common Questions and Answers About Diagnosis and Treatment](https://www.aafp.org/afp/2024/0500/atrial-fibrillation). Am Fam Physician. 2024;109(5):398-404. | Peer-reviewed review | Many patients with AFib are asymptomatic. Hemodynamically unstable patients should be evaluated and treated emergently. Most stable patients start with rate control. Cites the 2023 ACC/AHA/ACCP/HRS AF guideline. | D5, Rewind | Claude (AI), 23 Oct 2026 |
| 11 | Mitchell LB. [Atrial Fibrillation](https://www.merckmanuals.com/professional/cardiovascular-disorders/arrhythmias-and-conduction-disorders/atrial-fibrillation). Merck Manual Professional Version; fully reviewed Sep 2024, peer reviewed by Howlett JG. | Professional reference | AFib ECG: no P waves, fibrillatory waves between QRS complexes (best seen in V1 and not always apparent in all leads), irregularly irregular R-R intervals. Often asymptomatic. | D5, Rewind, rhythm notes | Claude (AI), 23 Oct 2026 |
| 12 | American Heart Association. [Adult Tachyarrhythmia With a Pulse Algorithm](https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Tachyarrhythmia-LngDscrp-250726-Ed.pdf?sc_lang=en). 2025 Guidelines for CPR and ECC. | Guideline (2025) | A tachyarrhythmia is causing instability when it brings hypotension, acutely altered mental status, signs of shock, ischemic chest discomfort or acute heart failure. | D5, Rewind B | Claude (AI), 23 Oct 2026 |
| 13 | UC Davis PSNet Editorial Team. [Rapid Response Systems](https://psnet.ahrq.gov/primer/rapid-response-systems). AHRQ PSNet; last reviewed 2024. | Government source | Any staff member may call. Typical criteria include significant staff concern alongside numeric triggers. | D2 | Claude (AI), 18 Oct 2026 |
| 14 | Rao SV, O'Donoghue ML, Ruel M, et al. 2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes. J Am Coll Cardiol. 2025. doi:10.1016/j.jacc.2024.11.009. Link (v0.8): https://doi.org/10.1016/j.jacc.2024.11.009. The hosted copy first read (sections 1 to 4.3) returned HTTP 404 on 25 Oct 2026. | Guideline (2025) | In the hospital, acquire and interpret an ECG within 10 minutes for suspected ACS (COR 1). Obtain right-sided leads when inferior STEMI is a concern, to check for RV involvement. Women are more likely to present with accompanying non-chest pain symptoms. | D2, D3, Debrief bullet 1 | Claude (AI), 24 Oct 2026 |
| 15 | Barstow C, Shahan B, Roberts M. Evaluating Medical Decision-Making Capacity in Practice. Am Fam Physician. 2018;98(1):40-46. https://www.aafp.org/afp/2018/0701/p40.html | Peer-reviewed review (free access) | Capacity can vary with circumstance (decision-specific). Its elements are understanding, appreciation, reasoning and communicating a choice. A refusal should be honored when the patient shows those elements; patients don't have to make the "right" choice. The treating physician makes the final determination. | D4 capacity panel | Claude (AI), 24 Oct 2026 |
| 16 | Sorrentino R. Performing capacity evaluations: what's expected from your consult. Current Psychiatry. 2014;13(1):41-44. https://cdn.mdedge.com/files/s3fs-public/Document/September-2017/041_0114CP_Sorrentino_FINAL.pdf | Peer-reviewed clinical review (free access) | Adults are presumed to have capacity unless determined otherwise. The presence of a mental disorder doesn't render a person incapable of making decisions. A person can be competent in one area and not another. Treatment decisions should be voluntary and free of coercion. | D4 capacity panel | Claude (AI), 24 Oct 2026 |

### Visual assets

All nine images are constructed with `tools/shift9-ecg/generate.py` (v0.9: per-beat QT from the preceding R-R, square 25 mm/s by 10 mm/mV paper), plus two focused views of the 12-lead. Each is labeled on the image as an illustration, not a patient recording. Decision strips carry only room, lead, time and rate, so the image doesn't give away the answer.

| Asset | Used on | Required characteristics | Source option | Rights status | Clinically checked? | Screen-reader text |
| --- | --- | --- | --- | --- | --- | --- |
| Room 21, lead II, 1430 | Assignment card | Sinus rhythm, rate 84 | Constructed tracing; swap for a Rhythm Lab asset if one exists | Owned | No | "Room 21, lead II, 1430. Regular rhythm at 84 with a P wave before every QRS. Sinus rhythm." |
| Room 21, lead II, 1505 | D1 Look closer | Sinus beats under motion artifact for about 3 seconds, then a flat line with a LEADS OFF message | Constructed tracing | Owned | No | "Room 21, lead II, 1505. Regular beats under heavy wavy artifact for about three seconds, then a flat line with a LEADS OFF message. The monitor has lost the signal. This is not asystole." |
| Room 22, lead II, 1430 | Assignment card, D2 | Sinus rhythm 88, ST at baseline | Constructed tracing | Owned | No | "Room 22, lead II, 1430. Sinus rhythm at 88. The ST segment sits on the baseline." |
| Room 22, lead II, 1508 | D2 | Sinus rhythm 94, ST raised about 2 mm | Constructed tracing | Owned | No | "Room 22, lead II, 1508. Sinus rhythm at 94. The ST segment is raised about 2 millimeters and runs into a tall T wave." |
| Room 22, 12-lead, 1513 | D3 | Sinus 94. Limb leads derived from I and III (II = I + III; aVR, aVL and aVF by the augmented-lead formulas). ST at J+60 ms: II +2.3, III +3.3, aVF +2.8, I -1.0, aVL -2.2 mm. V1 to V6 without diagnostic ST elevation. 1 mV calibration pulse on every row. | Constructed tracing; a licensed or Rhythm Lab 12-lead is preferred | Owned | No | "Room 22, 12-lead ECG, 1513. Sinus rhythm at 94. ST elevation of about 2 to 3 millimeters in leads II, III and aVF. ST depression in leads I and aVL. The chest leads show no ST elevation." |
| Room 23, lead II, 1430 | Assignment card | AFib, 11 QRS in 6 seconds (about 110) | Constructed tracing | Owned | No | "Room 23, lead II, 1430. Irregularly irregular rhythm with no P waves and a wavy baseline. 11 QRS complexes in 6 seconds, about 110. Atrial fibrillation." |
| Room 23, lead II, 1535 (A) | D5, Rewind A | AFib, 11 QRS in 6 seconds (about 110) | Constructed tracing | Owned | No | "Room 23, lead II, 1535. Irregularly irregular rhythm with no P waves. 11 QRS complexes in 6 seconds, about 110." |
| Room 23, lead II, 1535 (B) | Rewind B | AFib, 15 QRS in 6 seconds (about 150) | Constructed tracing | Owned | No | "Room 23, lead II, 1535, Version B. Irregularly irregular rhythm with no P waves. 15 QRS complexes in 6 seconds, about 150." |
| Room 23, lead II, 1535 (C) | Rewind C | AFib, 13 QRS in 6 seconds (about 130, an estimate; the script's monitor trend is 132 to 138) | Constructed tracing | Owned | No | "Room 23, lead II, 1535, Version C. Irregularly irregular rhythm with no P waves. 13 QRS complexes in 6 seconds, about 130." |

**Decision-screen alt text (v0.8).** These strips read an objective description until the decision is answered, then the Part E text above:

| Asset | Read until the decision is answered |
| --- | --- |
| Room 21, lead II, 1505 (D1; until Look closer or the D1 answer) | "Room 21, lead II, 1505. Regular beats under heavy wavy artifact for about three seconds, then a flat line with a LEADS OFF message." |
| Room 22, 12-lead, 1513 (D3) | "Room 22, 12-lead ECG, 1513. Regular rhythm at 94 with a P wave before every QRS. ST segment in each lead, compared with the baseline: lead I about 1 millimeter below. Lead II about 2 millimeters above. Lead III about 3 millimeters above. aVR about half a millimeter below. aVL about 2 millimeters below. aVF about 3 millimeters above. V1 on the baseline. V2 about half a millimeter above. V3 less than half a millimeter above. V4, V5 and V6 on the baseline." |
| Room 23, lead II, 1535, A (D5 and Rewind) | "Room 23, lead II, 1535. Narrow QRS complexes at uneven intervals with no repeating pattern. No distinct wave comes before each QRS, and the baseline between them is wavy. 11 QRS complexes in 6 seconds." |
| Room 23, lead II, 1535, B (Rewind) | Same as A, with "15 QRS complexes in 6 seconds." |
| Room 23, lead II, 1535, C (Rewind) | Same as A, with "13 QRS complexes in 6 seconds." |

The 12-lead ST values are the v0.9 generator's measured J+60 ms levels: I -1.0, II +2.1, III +3.2, aVR -0.4, aVL -2.1, aVF +2.6, V1 0.0, V2 +0.6, V3 +0.4, V4 to V6 0.0 mm. They match the wording above, which is unchanged.

**12-lead views (v0.9).** Same recording as the 12-lead, six leads over the same 2.5 seconds, each row with its own 1 mV calibration pulse:

| View | File | Read until D3 is answered | Read after |
| --- | --- | --- | --- |
| Limb leads | rm22_1513_12lead_limb.png | "Room 22, 12-lead ECG, 1513, limb leads I, II, III, aVR, aVL and aVF, all over the same 2.5 seconds. Regular rhythm at 94 with a P wave before every QRS. ST segment in each lead, compared with the baseline: lead I about 1 millimeter below. Lead II about 2 millimeters above. Lead III about 3 millimeters above. aVR about half a millimeter below. aVL about 2 millimeters below. aVF about 3 millimeters above." | "Room 22, 12-lead ECG, 1513, limb leads over the same 2.5 seconds. Sinus rhythm at 94. ST elevation of about 2 to 3 millimeters in leads II, III and aVF. ST depression in leads I and aVL." |
| Chest leads | rm22_1513_12lead_chest.png | "Room 22, 12-lead ECG, 1513, chest leads V1 to V6, all over the same 2.5 seconds. Regular rhythm at 94. ST segment in each lead, compared with the baseline: V1 on the baseline. V2 about half a millimeter above. V3 less than half a millimeter above. V4, V5 and V6 on the baseline." | "Room 22, 12-lead ECG, 1513, chest leads V1 to V6 over the same 2.5 seconds. Sinus rhythm at 94. The chest leads show no ST elevation." |

On-screen values match the images: every rate shown in the script equals the rate on its strip.

**Asset files (in `shift-09-assets/`):**

| File | Asset | Used on |
| --- | --- | --- |
| rm21_1430_sinus84.png | Room 21, lead II, 1430 | Assignment card |
| rm21_1505_artifact_leadsoff.png | Room 21, lead II, 1505 | D1 Look closer |
| rm22_1430_sinus88.png | Room 22, lead II, 1430 | Assignment card, D2 |
| rm22_1508_sinus94_ste.png | Room 22, lead II, 1508 | D2 |
| rm22_1513_12lead_inferior_stemi.png | Room 22, 12-lead, 1513 (v0.9 regeneration: derived limb leads, calibration pulses, rate-correct QT, square grid) | D3 |
| rm22_1513_12lead_limb.png | Room 22, 12-lead, 1513: limb leads view (v0.9) | D3 viewer |
| rm22_1513_12lead_chest.png | Room 22, 12-lead, 1513: chest leads view (v0.9) | D3 viewer |
| rm23_1430_afib110.png | Room 23, lead II, 1430 | Assignment card |
| rm23_1535_afib110_rewindA.png | Room 23, lead II, 1535 (A) | D5, Rewind A |
| rm23_rewindB_afib150.png | Room 23, lead II, 1535 (B) | Rewind B |
| rm23_rewindC_afib130.png | Room 23, lead II, 1535 (C) | Rewind C |

## Part F: Review and sign-off

The AI validation reviews don't replace stage 3. The template rule applies (AI agreement is not review), so an independent RN and a psych specialty reviewer still have to sign below.

### Revision history

| Version | Date | Summary |
| --- | --- | --- |
| 0.1 | 23 Oct 2026 | First Claude draft. |
| 0.2 | 24 Oct 2026 | After review 1 (8.2/10): Rewind C threshold fixed, Room 21 safety plan, either RN can take Room 22, right-sided leads note, 2025 ACS guideline added, terminology updated. |
| 0.3 | 24 Oct 2026 | After review 2 (8.9/10): two D1 paths meet at 1508, provider called at 1506, Marco's role limited, STEMI pathway wording. |
| 0.4 | 24 Oct 2026 | After review 3 (9.0/10): 12-lead rebuilt with derived limb leads and calibration pulses, lead-placement wording, D3 localization scoring, monitoring-gap wording, Marco's move stated. |
| 0.5 | 24 Oct 2026 | D4 capacity and informed-refusal panel, with two capacity sources. |
| 0.6 | 24 Oct 2026 | After review 4 (9.2/10 content): alarm evidence corrected, AFib wording, refusal plan agreed with the patient, both calm D4 responses full credit, chest pain nuance. |
| 0.7 | 24 Oct 2026 | D4 monitor explanation reworded; capacity assessment wording no longer implies psychiatry is always needed. |
| 0.8 | 26 Oct 2026 | Post-build audit corrections (remediation Part 1). See the change log at the top. ECG assets unchanged; ECG work deferred to Part 2. |
| 0.9 | 26 Oct 2026 | ECG remediation (Part 2): all images regenerated with rate-correct QT and square paper; AF timing and fibrillatory waves constrained; aVL and q waves corrected; labels fixed; 12-lead viewer with limb and chest views; D2 comparison panel. Decision text and scoring unchanged. |
| 0.10 | 27 Oct 2026 | Per-person D1 feedback; Marco Room 22 and station wording to the founder's rationale (station wording no longer claims coverage when a room is uncovered); new library thumbnail; duration 10–12 minutes. Scoring unchanged. |

### Open questions for the reviewer

**v0.10 items (added 27 Oct 2026).** Confirm the reworded Marco Room 22 and station feedback (both versions), and that the library thumbnail's simplified traces aren't clinically misleading.

**v0.9 ECG items for the specialist reviewer (added 26 Oct 2026).** The full checklist is in `docs/SHIFT_009_ECG_VALIDATION.md`. In short, confirm morphology and intervals on all eleven images, that no strip shows an unintended finding (long or short QT, flutter, pre-excitation, Q waves, fragmented QRS), and that the D3 views and the D2 comparison are interpretable on a phone.

**v0.8 decisions that need clinical approval (added 26 Oct 2026)**

- [ ] D1: Marco helping the RN in Room 22 earns full credit, the same as Room 23 vitals or backing up at Room 21. Confirm, including the delegated tasks named in the feedback (vitals, 12-lead machine, recording the 12-lead where CNAs are trained to, getting help).
- [ ] D1: Marco staying at the station, with the RNs placed right, earns partial credit (Close). Confirm Close rather than full or no credit.
- [ ] D1: New No rules ("Both RNs go to Room 22", "Both RNs go to Room 21", "An RN goes to Room 23 or stays at the station", "Marco goes to Room 22 without an RN") and their feedback.
- [ ] Rewind C: Escalate now is Close (was Not best), with the rapid-response-criteria feedback. Confirm.
- [ ] Alt text: decision strips read the objective descriptions above until answered. This replaces the Part E text on those screens until the answer. Confirm the 12-lead per-lead wording.
- [x] Estimated time: 10–12 minutes, above the template's 7-minute maximum (founder chose 10–12 minutes on 27 Oct 2026; recorded in the founder sign-off, 28 Oct 2026).
- [ ] All new learner wording in the change log (review lines, guided paths, Rewind alternatives, rhythm-note caveat, D1 strip labels, Drew wording, D2 feedback move).

**Clinical judgment calls**

- [ ] D2: "Stat 12-lead first, then call" stays Close. The validation review agreed, because escalation should run alongside the ECG. Confirm.
- [ ] D1: Either RN taking Room 22 now earns full credit, per the validation review. Confirm.
- [ ] D1: Marco backing up Tess at Room 21 is scored Correct, the same as Marco taking Room 23's vitals. Should one be preferred?
- [ ] D3: The correct choice now says "Start your hospital's STEMI escalation pathway," since not every RN can activate a STEMI response directly. Confirm.
- [ ] D3: An inferior STEMI can involve the right ventricle and cause hypotension and bradycardia (Source 1). The script leaves treatment to the team. v0.2 adds an unscored note on right-sided leads, with no medication content. Confirm the wording.
- [ ] Rewind B: rate about 150, BP 84/50, chest tightness and slowed thinking are written as unstable. Confirm.
- [ ] Rewind C: the provider's "call if he stays above 130" line is a fictional order. Confirm it's realistic for a rate-control plan.

**Psych specialty review (required)**

- [ ] D4: Both calm responses now earn full credit, with the choice response as the preferred example, per the v0.5 review. Confirm, and confirm the feedback wording.
- [ ] D4: The second Correct line lets him set the monitor down during a syncope workup. Is that acceptable if the provider is told?
- [ ] D4: Security now waits out of his direct line of sight, per policy. Confirm. Also confirm the in-person observation plan while he's off telemetry, the wording of the v0.5 capacity panel, and who formally assesses capacity at your hospital.

**Sources and assets**

- [ ] Sources 3, 4 and 5 (Gulati 2021, Mehta 2016, Sandau 2017) were opened through ACC's official summaries, because the AHA and JACC journal pages blocked access. A human should check each claim against the full text.
- [ ] The 2023 ACC/AHA/ACCP/HRS AF guideline (Joglar et al.) couldn't be opened. The AF claims rest on Sources 10, 11 and 12 instead. Is Merck (Source 11), a peer-reviewed professional reference rather than a journal, acceptable?
- [ ] All nine ECG images are constructed illustrations. They need a clinical check of morphology: the ST elevation shape, f waves, 12-lead amplitudes, and the reciprocal changes in I and aVL. Replace them with Rhythm Lab or licensed assets if those exist. v0.4 rebuilt the 12-lead with derived limb leads and calibration pulses, but signal-level validation by a telemetry educator or cardiologist (J points, QRS timing, f waves, lead relationships) is still the main blocker for publishing the images. The reviewer also asked that someone confirm no AFib strip could be mistaken for atrial flutter. **v0.9:** images regenerated and measured by `tools/shift9-ecg/validate.py` (see `docs/SHIFT_009_ECG_VALIDATION.md`); specialist validation still required.
- [ ] The strips use lead II. Source 5 notes V1 is common for adult rhythm monitoring, and the best ST-monitoring lead depends on the patient. Is lead II fine for teaching?

**Facility variation**

- [ ] Check what varies by hospital: who obtains a stat 12-lead (RN, ECG tech or CNA), the name of the STEMI or chest pain alert, and how the behavioral response team is called.

**Product**

- [ ] Assign the team is a new interaction type, and Therapeutic response isn't built yet. Astra to confirm effort, and Mohamed to approve adding Assign the team to the Part B catalog.
- [ ] The two Rhythm Lab Go further buttons need verified entries, or they stay hidden.
- [ ] D1: Placements the rules table doesn't fully cover (for example, Marco at the station) and the storyline after a no-credit placement still need a decision from Mohamed.
- [ ] D5: The Marco build note was added in this package so the D5 screen matches either D1 placement. Mohamed to confirm.

### Sign-off

| Stage | Name and credentials | Date | Version reviewed | Notes |
| --- | --- | --- | --- | --- |
| Founder review | Mohamed, RN (founder) | 28 Oct 2026 | 0.10 | Founder-attested clinical sign-off of the v0.10 spec, including every v0.10 change-log item (D1 per-person feedback, Marco Room 22 and station wording, library thumbnail, 10–12 minutes, the Joy handoff at 1525). Given in a Claude Code session; no signed record. Does not replace the independent clinical, psych specialty or specialist ECG reviews, which are still required before release. |
| Independent clinical review | Not supplied (anonymous) | Not supplied | Not supplied | Reported by the founder on 28 Oct 2026 as completed. Reviewer role, credentials and date not supplied; no signed record. |
| Specialty review (psych) | Not supplied (anonymous) | Not supplied | Not supplied | Required for Room 21 and D4. Reported by the founder on 28 Oct 2026 as completed; reviewer role, date and whether it covered Room 21 and D4 not supplied; no signed record. |
| ECG review | Mohamed, RN (founder) | 29 Oct 2026 | 0.10 | Founder reported reviewing the eleven ECG images and that they pass. Given in a Claude Code session; no signed record; checklist items not answered individually. Not an independent specialist validation. |
| Release authorization | Mohamed, RN (founder) | 29 Oct 2026 | 0.10 | Authorized public release after checking pending items. Open reviewer questions above were not answered item by item; the founder accepted the reviewed v0.10 content as shipped. See `docs/SHIFT_009_RELEASE.md`. |

### Pre-submission checklist

- [x] Part A is complete; core lesson is one sentence.
- [ ] 4 to 6 decisions; total time 5 minutes, 7 at most. (5 decisions; v0.8 measures about 10 to 12 minutes. Needs a decision.)
- [x] Interaction sequence differs from every existing scenario.
- [x] At least one twist where the first read is wrong or incomplete.
- [x] Every choice has feedback; reasonable alternatives earn credit.
- [x] Urgent findings lead to timely escalation; no waiting on tests; no permission needed for rapid response.
- [x] No medication doses, treatment protocols or order changes as correct answers.
- [x] Timeline moves forward; final screen says "challenge complete."
- [x] Personalized review lines written for every decision.
- [ ] Every Go further button points to something verified to exist. (Two Rhythm Lab buttons unverified.)
- [x] Every rationale cites a numbered source the author opened.
- [x] Every visual asset has a source option, rights status and screen-reader text.
- [x] Open questions for the reviewer are listed.
- [x] No em dashes; nurse-to-nurse voice.
