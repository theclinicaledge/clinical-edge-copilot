# Clinical Validation Harness v1

This backend-only harness evaluates explicitly synthetic Patient Snapshots against concept-level clinical reliability expectations. It does not retain production Snapshots and is not part of the consumer UI.

## Separation and blinding

Each case has four independent records:

- `*.case.json`: identity, domain, cohort, capability tags, and file references.
- `snapshots/*.snapshot.txt`: the only clinical input generation receives.
- `answer-keys/*.eval.json`: concepts, uncertainty, prohibited failure classes, urgency, and component requirements. It is never passed into generation.
- `history/*.history.json`: append-only deterministic and live-provider validation events.

Cases that discover or remediate defects are regression cases. They are not unbiased evidence of generalization. New validation rounds must include previously unseen `holdout` cases that are not used for tuning before their first evaluation.

## Commands

From `backend/`:

```bash
npm run validate:clinical
npm run validate:clinical -- --case gold-05
npm run validate:clinical:report
```

Reports are written to `validation/reports/latest.md` and `latest.json` only when the report command is used. A nonzero exit means at least one required component failed or a fixture was malformed.

Deterministic mode is the default and has no provider path. Live-provider mode requires an explicit `authorized: true` option and a production-equivalent `generateLive` adapter supplied through the harness API. The CLI deliberately refuses to improvise an adapter:

```text
node validation/cli.js --mode live-provider --authorize-live-provider --case gold-06
```

That command remains blocked until a separately authorized run supplies and reviews the live adapter. There are no automatic retries for a better clinical answer.

## Adding Gold Case #6

1. Create an explicitly synthetic, no-PHI Snapshot in `cases/snapshots/gold-06.snapshot.txt`.
2. Create `cases/gold-06.case.json`; classify it as `holdout` before its first blinded evaluation, or `regression` only after it has informed remediation.
3. Create a separate `cases/answer-keys/gold-06.eval.json`. Use concepts and failure classes, never exact expected prose.
4. Create `cases/history/gold-06.history.json` with an empty `events` array. Append events; never edit or remove earlier outcomes.
5. Run `npm run validate:clinical -- --case gold-06` and inspect every failed component and code.
6. A future live run must be explicitly authorized. Preserve original/repaired/fallback provenance and append the reviewed outcome to history.

## Locking policy

A deterministic regression pass alone cannot lock a case. Locking requires a deterministic pass, a preserved live-provider pass for the current material behavior, and completed human clinical review. Historical failures remain in the append-only history. Gold Case #1 retains its established lock; Gold Cases #2–#5 remain unlocked.

## Privacy

All fixtures must be explicitly synthetic and contain no PHI. Production patient Snapshots, production logs, and EHR-derived data are prohibited unless a separately approved governed process is established. Validation artifacts may contain only these synthetic fixtures.
