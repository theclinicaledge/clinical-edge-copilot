# Clinical Validation Registry

## Released Shift nursing review history

Attestation recorded 2026-11-03 from Mohamed's explicit "Clinical Review Registry Cleanup + Shift 6/Rewind Educational Improvement" instruction in this project. This is the date of the confirmation, not the date any clinical review occurred.

Mohamed Laayouni confirms personal clinical-content review of the released Shifts. His founder-confirmed qualifications are MSN, California-licensed RN, medical ICU and cardiothoracic nursing experience. Record this as **Founder RN clinical review — founder-attested** for each Shift below. The confirmation does not establish exact-version approval, signed independent validation, or review of every separately authored Rewind variation.

The founder also reports additional practicing-nurse review of relevant content, without newly specifying all scopes. The per-Shift additional-RN entries below therefore retain the narrower existing records rather than extrapolating that statement to every asset, revision or Rewind.

| Shift | Founder clinical review | Additional RN review already reported | Scope/remaining limitation and existing record |
| --- | --- | --- | --- |
| 001 Drowsy Patient | Founder-attested | Founder-reported complete corrected three-scenario package, including answer keys and ECG assets | Shared package report covers 001–003; identity, date and passage-level scope not supplied. `frontend/src/modules/the-shift/integrated/authoring.js` and `registry.js`. |
| 002 Monitor Alarm | Founder-attested | Same founder-reported corrected package | Includes constructed ECG assets in the package report; separate specialist ECG validation not established. Same records as 001. |
| 003 Discharge Puzzle | Founder-attested | Same founder-reported corrected package | Not separate medication-safety certification or approval of later standalone Rewind drafts. Same records as 001. |
| 004 Conversation | Founder-attested | Founder-reported scenario/reference approval; informal practicing psychiatric RN review of revised openings, reactions, feedback and safety pathway | Existing v0.4 and opening-update scope preserved; identity/signature withheld by request; actual review date not supplied. `conversation/metadata.js`. |
| 005 Which Patient First? | Founder-attested | Founder-reported independent nurse review, no material issues | Existing version association retained, no new exact-version approval inferred. `shift5/metadata.js`. |
| 006 Stable Number | Founder-attested | Founder-reported founder-and-another-nurse review | Existing v0.4 association retained. Separate original Rewind review scope was not supplied; the later, version-specific Rewind C Batch 1 founder approval is recorded below. `shift6/metadata.js`, `shift6/data.js`, `shift6/Shift6Rewind.jsx`. |
| 007 Missing Time | Founder-attested | Founder-reported nurse-colleague review | Existing report date 2026-10-23 is not an actual review date. `shift7/metadata.js`. |
| 008 Code Blue | Founder-attested | Founder-attested confidential medical-surgical nurse educator complete-scenario approval including E-1 | Existing narrow v0.8.1 governance and review scope below preserved; no signed record or formal validation inferred. `shift8/metadata.js`, `SHIFT_008_E1_GOVERNANCE.md`. |
| 009 The Loud Distraction | Founder-attested | Independent clinical and psych specialty reviews reported by founder, recorded 2026-10-28 | Actual additional-review dates/credentials not supplied. Founder-attested review of all eleven ECG images recorded 2026-10-29 is preserved below; separate specialist ECG validation remains outstanding. `shift9/metadata.js`. Existing public inclusion and library order are unchanged. |
| 010 Transfer That Isn't Ready | Founder-attested | Founder-reported independent clinical approval of Authoring Draft v0.2 | Existing source applicability limitations and fictional facility-policy boundaries retained. `shift10/metadata.js`. |

Paths in the last seven rows are under `frontend/src/modules/the-shift/` unless stated otherwise. Existing reviewer/version/date fields are not replaced by this cleanup. The library registry adds the general founder review separately, while preserving each prior review-status statement, source-verification limitation and additional reviewer report.

### SHIFT-006 v0.4 Rewind C Batch 1: version-specific founder RN approval

Recorded 2026-11-04 (America/Los_Angeles) from Mohamed Laayouni's explicit "Shift 6/Rewind C: Founder RN Approval Confirmed" instruction in this project. This is the attestation-record date; no separate original review date or signature is asserted. Reviewer qualifications: founder, MSN-prepared, California-licensed RN, as stated in that confirmation.

Status: **Founder-attested, version-specific RN approval** of the complete four-option packet presented immediately before that confirmation. Implementation is private on `improve/shift6-rewind-batch1`, based on `1bf590f4b12832df5a7e677e41c669f6bd47d03f`. The unchanged storage/content version remains v0.4; this approval applies specifically to the Batch 1 wording, not every v0.4 revision.

Approved scope:

- All four Rewind C option titles and the unchanged `notify` / `escalate` / `recheck` / `reassess` result mapping: Correct / Close / Close / No.
- Heading: "Correct call: Notify the provider now, not at end of shift"
- Preferred option: "Notify the provider now, report the findings, ask about labs, and recheck vitals in 30 minutes".
- All four associated feedback explanations, the 30-minute reassessment interval, and the distinction between timely provider notification and urgent bedside escalation.

The approved option set and explanations are in `frontend/src/modules/the-shift/shift6/data.js`, `REWIND.variations` entry `c`. Approved-packet SHA-256: `0247d4f851069b956b7194b85384b14757c7e31ca425cfcb4e2deb6c54d0df92`. Fingerprint input is UTF-8 `JSON.stringify({scenarioId: 'SHIFT-006', contentVersion: VERSION, variation: 'c', heading: c.focus, options: c.options})`, where `c` is that variation; object-key order is as shown.

This is not independent specialist validation, a signed review, approval of other Rewind variations, or evidence of learning effectiveness or assessment validity. Existing additional-RN records, specialist requirements, source-permission issues and other version limitations remain unchanged. The first/latest comparison does not establish feedback reading or independent learning. Rendered-browser verification on desktop, 375px and 390px remains outstanding; no release is authorized by this clinical approval alone.

### Interpretation for future audits

- Do not label these released Shifts generically "unreviewed" merely because a signature, review date or specialist credential is missing. Acknowledge the founder-attested and scope-specific additional-RN reviews above.
- Identify outstanding requirements by exact scope: for example specialist ECG validation, passage-level source verification, reuse permission, separate Rewind review, or review of a changed clinical version.
- General RN review does not establish specialist certification, learning effectiveness, formal assessment validity, or a preserved real-provider AI validation pass.
- Historical drafts and their pending-review statements remain historical records. A later blanket attestation does not retroactively supply a missing specialty approval or approve new clinical changes.
- Changes to clinical facts, accepted answers, distractors, explanations or Rewind teaching require version-specific clinical review before release. Pure review-attribution metadata does not alter those items.

## Shift 8 v0.8.1 founder-attested review

Separate from the real-provider AI validation results below: the founder reports an independent confidential medical-surgical nurse educator approved the entire updated Shift 8 manual-defibrillator scenario, including E-1. No signed reviewer record, identity, review date or independently documented approval is claimed. The founder's explicit narrow amendment accepts this attestation instead of E-1's earlier written-verification condition for the reviewed v0.8.1 dialogue only. See [E-1 governance](SHIFT_008_E1_GOVERNANCE.md). Automated tests do not establish clinical validation. All prior provider results below remain unchanged.

## Shift 9 v0.10 founder-attested ECG review

On 29 Oct 2026 the founder (Mohamed, RN) reported that he reviewed the eleven constructed ECG images in Shift 9 v0.10 and that they pass. Founder-attested in a Claude Code session; no signed record, and no item-by-item answers to the checklist in [SHIFT_009_ECG_VALIDATION.md](SHIFT_009_ECG_VALIDATION.md) section 5 were supplied. This is not the independent telemetry educator or cardiologist validation that checklist describes. The founder authorized public release on this basis. The automated measurements remain a consistency check only. See [Shift 9 release](SHIFT_009_RELEASE.md).

This registry separates preserved real-provider clinical review from deterministic automated validation. Automated tests do not retroactively change a recorded real-provider result.

## Status definitions

- **REAL_PROVIDER_PASS**: One authorized, unmodified provider run passed the documented clinical acceptance criteria across all required outputs.
- **REAL_PROVIDER_FAIL**: One authorized, unmodified provider run failed at least one documented clinical acceptance criterion. Later deterministic remediation does not rewrite this historical result.
- **DETERMINISTIC_PASS**: The saved case and required counterexamples pass the local validators, fallbacks, and automated regression suite without a provider call.
- **LOCKED**: The gold case has a preserved real-provider pass and a passing deterministic regression contract. Its safeguards must remain passing in subsequent work.

## Gold cases

| Case | Latest real-provider result | Deterministic result | Lock state | Notes |
| --- | --- | --- | --- | --- |
| Gold Case #1 | REAL_PROVIDER_PASS | DETERMINISTIC_PASS | LOCKED | Existing perfusion and hemodynamic safeguards remain regression requirements. |
| Gold Case #2 | REAL_PROVIDER_FAIL | DETERMINISTIC_PASS | NOT LOCKED | The authorized final rerun displayed a deterministic fallback whose `MODERATE` urgency conflicted with its high-priority assessment and prompt-escalation language. The local remediation now derives urgency from converging deterioration and validates urgency, priority relevance, and escalation consistency. Teach Me and SBAR passed the preserved real-provider review. |
| Gold Case #3 | REAL_PROVIDER_FAIL | DETERMINISTIC_PASS | NOT LOCKED | The preserved blinded run under-triaged converging focal neurologic deterioration, returned generic teaching that mislabeled unchanged comparisons as changes, and converted recognition time into implied onset timing. The deterministic remediation now recognizes converging focal neurologic patterns, preserves comparison and temporal semantics, and grounds SBAR timing without diagnosing etiology. |
| Gold Case #4 | REAL_PROVIDER_FAIL | DETERMINISTIC_PASS | NOT LOCKED | The preserved blinded run reached the provider timeout and displayed the prior generic deterministic Priority Map fallback. Although urgency was `HIGH`, that historical fallback did not integrate the supplied converging perfusion and end-organ warning signs and made escalation conditional on further deterioration. Deterministic remediation now synthesizes supported multi-domain perfusion and end-organ deterioration, preserves etiologic uncertainty and single-value semantics, and requires present-tense escalation for existing high-concern deterioration. Teach Me and SBAR remain passing. |
| Gold Case #5 | REAL_PROVIDER_FAIL | DETERMINISTIC_PASS | NOT LOCKED | The preserved blinded run reached the provider timeout and displayed a generic `MODERATE` fallback for a new rapid irregular rhythm with concurrent BP/MAP decline, lightheadedness, and cool extremities. Deterministic remediation now integrates rhythm/rate change with hemodynamic, symptom, and perfusion tolerance; produces `HIGH` urgency with present-tense escalation; preserves rhythm, onset, causality, and electrolyte uncertainty; and supplies encounter-specific rhythm teaching. The unsupported-trend rejection was correct because the provider lesson asserted a directional cardiac-output trend absent from the Snapshot. One deliberate Teach Me action is now guarded to one active request and one open event while allowing a later intentional request. SBAR urgency alignment now rejects vague “timely way” language for established `HIGH` urgency. |

Gold Cases #2, #3, #4, and #5 require future explicitly authorized real-provider validation before any can become `REAL_PROVIDER_PASS` or `LOCKED`.

## Initial Discovery Phase: General Reliability Capabilities

The first five gold cases established a deterministic safety and regression framework for observation-versus-inference separation, exact trend fidelity, unsupported numeric threshold protection, etiologic uncertainty, acid-base temporal physiology, and association-versus-causation language. The framework also covers convergence-based urgency, focal neurologic pattern recognition without diagnosis, recognition time versus onset or last-known-well semantics, unchanged-value preservation, multi-system perfusion integration, and present deterioration versus future escalation triggers.

Gold Case #5 extends that deterministic framework to rhythm and hemodynamic tolerance: monitor observations remain distinct from confirmed rhythm diagnoses; rhythm/rate changes are interpreted alongside supported BP/MAP, symptom, mentation, and perfusion findings; single electrolyte values do not become trends or causes; and duplicate Teach Me operations are blocked while a request is active. These are deterministic safeguards, not new real-provider passes. The historical provider outcomes and lock states above remain authoritative.

## Validation Harness

Clinical Validation Harness v1 mirrors Cases #1–#5 as explicitly synthetic regression fixtures under `backend/validation/`. Snapshot inputs, evaluation specifications, and append-only histories are stored separately so answer keys never enter generation. The registry above remains authoritative; harness reports summarize current deterministic runs without rewriting historical provider outcomes or lock states.
