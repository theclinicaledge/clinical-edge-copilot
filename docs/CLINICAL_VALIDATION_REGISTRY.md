# Clinical Validation Registry

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
