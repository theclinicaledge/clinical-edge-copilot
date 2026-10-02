# Priority Map Intelligence V2 release candidate

Production predecessor: `a92979bdbdcf39f0cf2dd1fc3e65985670c815ac`.

## Architecture and scope

Initial structured Snapshots use exact deterministic evidence with stable IDs,
comparison/interval/unknown classifications and locally determined urgency. A
compact model JSON object supplies contextual synthesis, candidate contributors,
discriminating assessments and nursing communication/reassessment considerations.
Only a complete, validated result is composed into the existing Priority Map.
No raw partial model response is published. Provider failures, truncation, rejected
repair or exhausted deadlines return deterministic fallback.

The fallback preserves exact supplied observations and additional context without
inventing earlier changes for current-only data. The frontend no longer hides
evidence after the third observation. No native, provider-model, dependency,
hosting, credential, retention or automatic-storage changes are required.

## Contract

Exact JSON keys: synthesis, possible_contributors, clarify_now,
reassessment_or_escalation. Contributors retain possibility, evidence_ids and
uncertainty; assessments retain assessment and why_it_matters.

Candidate membership establishes hypothesis status, not diagnosis or causality.
Labels need no lexical hedge. Each uncertainty field identifies unresolved context
and both fields undergo semantic safety checks. The existing Possible patterns
heading supplies the bedside presentation context. Unsupported named diagnoses,
definitive causal/patient assertions, negative findings invented from omissions,
unsupported values, trends, timing, medications and treatment orders remain blocked.
Contributor labels are included in invented-finding screening.

Patient-specific numbers belong in exact evidence, not AI prose. Supplied numeric
repetition receives a contract code distinct from unsupported numeric invention.
Negation and unresolved questions do not automatically constitute certainty;
definitive assertions elsewhere remain rejected.

Presentation targets are 420 characters for synthesis and 180 for other strings.
Hard ceilings: synthesis 600, contributor label 240, uncertainty/assessment/rationale
300, guidance 320. Raw JSON is bounded at 12,000 characters. Cardinalities remain
zero-to-three contributors, one-to-three assessments, one-to-two guidance items
and one-to-three supplied evidence IDs per contributor. Exact keys/types/nonempty
plain text remain mandatory.

Normalization trims and collapses whitespace only. It never truncates, strips
clinical words, completes sentences, invents hedges or alters evidence. Modest
presentation overflow under the hard ceiling bypasses provider repair. Clinical
validation and displayed-report validation remain mandatory.

Repair receives issue codes, field paths, length bounds, cardinality/reference
requirements and unresolved-context diagnostics. It must preserve valid content
and correct only rejected issues. Every repaired result is fully revalidated;
identical invalid output cannot cause another repair.

## Timing and privacy

Compact initial: original 15s, repair up to 5s, total 23s inclusive of preprocessing,
return reserve 1.5s, minimum remaining repair allowance 2.5s. Legacy noncompact
structured defaults remain 30s original / 8s repair / 40s total. Frontend timeout
65s and SDK timeout 45s remain; stage abort signals enforce the shorter deadlines.
SDK automatic retries remain zero. There is at most one explicit safety repair.

Operational logging uses an allowlist of aggregate metadata: request identity,
stage timing/status, first-token latency, character count, token usage, stop reason,
resolution, issue codes, timeout and disconnect status. Prompts, snapshots, model
response text, field values and credentials must not enter operational logs.
Missing usage after an abort is unknown, not zero or evidence of no billing.

## Evidence and limitations

Preserved synthetic real-provider output completed within the original budget and
passes the final local validation/composition pipeline unchanged. This is replay
evidence, not a new live production success or a changed historical result.
Deterministic Gold and mocked regression tests are separate evidence classes.
The narrowly scoped controlled-candidate gate does not require another paid call.

Natural-language guards remain finite and heuristic. Candidate relevance, missing
discriminators, unfamiliar synonyms, long evidence density, provider latency and
future response variation remain risks. A single scenario does not establish broad
clinical reliability. Existing capture misses and build bundle-size warnings remain.

## Release and rollback (authorization required)

Before release, fetch origin and confirm main still equals the predecessor, inspect
the candidate SHA/tree, and review validation and exclusions. If unexpected remote
commits exist, stop. If clean and explicitly authorized, push the approved candidate
to main exactly once. Main currently is the local branch; no merge is needed if the
remote is still the predecessor. Vercel and Render automatically deploy on commit;
do not manually trigger deployments or change their configuration.

Wait for both providers to confirm the exact revision and healthy status. Verify
the public frontend, intended API, assets, navigation, caching/refresh, mobile flow
and metadata-only logs. Real reasoning smoke operations require separate explicit
authorization and must use synthetic data with minimal operation count.

Rollback on a release-critical failure: stop testing, restore the predecessor
through a history-preserving revert of the release commit and one authorized push
to main, then verify both automatic rollback deployments and public health. Do not
force-push or discard unrelated local changes. Coordinate staging in an isolated
checkout when unrelated local files would interfere.

The hosted-web iOS wrapper should receive frontend/backend changes online without
a native rebuild, subject to cache/reload behavior. No native assets or configuration
change here. Actual build-29 device behavior remains a separate smoke-test limit.
