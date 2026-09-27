# Clinical Validation Harness Report

Generated: 2026-09-27T03:09:54.873Z

## Summary

- Total cases: 5
- Passed: 5
- Failed: 0
- Modes: deterministic 5
- Provenance: deterministic_fallback 5
- Locked / not locked: 1 / 4
- Requiring live-provider validation: gold-02, gold-03, gold-04, gold-05

## Cases

| Case | Domain | Version | Mode | Result | Provenance | Component failures | Failure codes | Lock state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gold-01: Postoperative hemodynamic deterioration | hemodynamics-perfusion | 1.0.0 | deterministic | PASS | deterministic_fallback | none | none | LOCKED |
| gold-02: Worsening ventilation with respiratory acidemia | respiratory-acid-base | 1.0.0 | deterministic | PASS | deterministic_fallback | none | none | NOT_LOCKED |
| gold-03: Acute focal neurologic deterioration | neurologic | 1.0.0 | deterministic | PASS | deterministic_fallback | none | none | NOT_LOCKED |
| gold-04: Multi-system perfusion deterioration | systemic-perfusion | 1.0.0 | deterministic | PASS | deterministic_fallback | none | none | NOT_LOCKED |
| gold-05: Rhythm change with hemodynamic intolerance | rhythm-hemodynamics | 1.0.0 | deterministic | PASS | deterministic_fallback | none | none | NOT_LOCKED |

## Clinical Domains

- hemodynamics-perfusion: 1
- neurologic: 1
- respiratory-acid-base: 1
- rhythm-hemodynamics: 1
- systemic-perfusion: 1

## Reliability Coverage

- acid_base_timing: 1 PASS, 0 FAIL, 0 NOT_APPLICABLE (1 tagged cases)
- causality: 4 PASS, 0 FAIL, 0 NOT_APPLICABLE (4 tagged cases)
- current_escalation: 5 PASS, 0 FAIL, 0 NOT_APPLICABLE (5 tagged cases)
- focal_neurologic_recognition: 1 PASS, 0 FAIL, 0 NOT_APPLICABLE (1 tagged cases)
- observation_vs_inference: 4 PASS, 0 FAIL, 0 NOT_APPLICABLE (4 tagged cases)
- perfusion_integration: 2 PASS, 0 FAIL, 0 NOT_APPLICABLE (2 tagged cases)
- rhythm_tolerance: 1 PASS, 0 FAIL, 0 NOT_APPLICABLE (1 tagged cases)
- sbar_grounding: 0 PASS, 0 FAIL, 3 NOT_APPLICABLE (3 tagged cases)
- serialization: 5 PASS, 0 FAIL, 0 NOT_APPLICABLE (5 tagged cases)
- teach_me_grounding: 3 PASS, 0 FAIL, 0 NOT_APPLICABLE (3 tagged cases)
- temporal_grounding: 2 PASS, 0 FAIL, 0 NOT_APPLICABLE (2 tagged cases)
- threshold_grounding: 3 PASS, 0 FAIL, 0 NOT_APPLICABLE (3 tagged cases)
- treatment_boundary: 3 PASS, 0 FAIL, 0 NOT_APPLICABLE (3 tagged cases)
- trend_fidelity: 4 PASS, 0 FAIL, 0 NOT_APPLICABLE (4 tagged cases)
- uncertainty: 5 PASS, 0 FAIL, 0 NOT_APPLICABLE (5 tagged cases)
- unchanged_semantics: 2 PASS, 0 FAIL, 0 NOT_APPLICABLE (2 tagged cases)
- urgency_convergence: 5 PASS, 0 FAIL, 0 NOT_APPLICABLE (5 tagged cases)

## Failure Codes

- None

> Deterministic passes are regression evidence. They do not replace or rewrite preserved real-provider outcomes.
