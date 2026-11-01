// Closed, non-content diagnostics. Never accept raw provider errors or prose.
const STAGES = ['consent', 'input', 'admission', 'generation', 'validation', 'review', 'infrastructure', 'delivery'];
const REASONS = ['admission_accepted', 'consent_required', 'invalid_context_boundary', 'identifier_pattern', 'conversation_busy', 'conversation_limit',
  'provider_not_configured', 'provider_configuration', 'provider_rate_limit', 'provider_timeout', 'provider_error',
  'admission_timeout', 'admission_response_invalid', 'admission_response_incomplete', 'admission_source_invalid',
  'educational_scope_unavailable', 'educational_clarification_required', 'answer_generation_incomplete', 'answer_generation_refused',
  'answer_response_invalid', 'answer_source_invalid', 'answer_validation_unavailable', 'answer_review_unavailable',
  'answer_review_incomplete', 'answer_review_invalid', 'output_safety_withheld', 'educational_beta_disabled',
  'request_cancelled', 'free_daily_limit_reached', 'ai_daily_budget_reached', 'cost_guard_unavailable'];
const ADMISSION_REASONS = ['covered_education', 'patient_care', 'time_critical', 'unsupported_topic', 'insufficient_evidence', 'unclear_scope', 'scope_override'];
const INTENTS = ['general_education', 'contextual_education', 'individualized_decision', 'time_critical', 'unsupported'];
function safeAskDiagnostic(value) {
  if (!value || !STAGES.includes(value.stage) || !REASONS.includes(value.reason)) return null;
  return { stage: value.stage, reason: value.reason,
    ...(['admit','reject','uncertain'].includes(value.decision) ? { decision: value.decision } : {}),
    ...(INTENTS.includes(value.intent) ? { intent: value.intent } : {}),
    ...(ADMISSION_REASONS.includes(value.admission_reason) ? { admission_reason: value.admission_reason } : {}),
    ...(['end_turn','max_tokens','refusal','stop_sequence','pause_turn','tool_use'].includes(value.stop_reason) ? { stop_reason: value.stop_reason } : {}) };
}
function gateFailure(gate) {
  const codes = gate.codes || [];
  const technical = [
    ['unhelpful_educational_refusal', 502, 'answer_generation_refused', 'generation'],
    ['invalid_answer_schema', 502, 'answer_response_invalid', 'validation'],
    ['invalid_grounded_schema', 502, 'answer_response_invalid', 'validation'],
    ['invalid_source_reference', 502, 'answer_source_invalid', 'validation'],
    ['validation_unavailable', 503, 'answer_validation_unavailable', 'validation'],
    ['safety_review_unavailable', 503, 'answer_review_unavailable', 'review'],
    ['safety_review_incomplete', 502, 'answer_review_incomplete', 'review'],
    ['invalid_safety_review', 502, 'answer_review_invalid', 'review'],
    ['client_disconnected', 503, 'request_cancelled', 'review'],
  ].find(([reason]) => codes.includes(reason));
  if (technical) return { status: technical[1], code: technical[2], stage: technical[3] };
  return { status: 422, code: 'output_safety_withheld', stage: gate.safety?.stage === 'semantic_review' ? 'review' : 'validation' };
}
module.exports = { safeAskDiagnostic, gateFailure, ADMISSION_REASONS };
