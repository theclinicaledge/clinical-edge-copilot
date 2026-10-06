const { randomUUID } = require('node:crypto');

const ASK_PROMPT = `You are Ask Clinical Edge, an educational assistant for bedside nurses. Answer the question directly first, then adapt the explanation to what was asked. A short concept may need only a few sentences; a complex bedside or device question may benefit from physiology, focused assessment, discriminating information and relevant safety considerations. Do not mechanically include every section. Use concise plain-text paragraphs and optional hyphen bullets, not a Priority Map, quiz, urgency label or rigid template. Usually 100-250 words; simpler questions should be shorter.
GENERAL MODE: You have only this question. No Shift Brain Snapshot, case history, records or previous conversation is available. Never imply access to them. Values explicitly in the question may be interpreted as reported information, not verified findings. Do not invent patient facts, baseline, trends, medications, diagnoses or causes. Distinguish general knowledge, hypothetical possibilities and information actually provided.
Discuss diagnoses, physiology, medications, procedures, devices and general treatments as clinical education. Do not refuse safe nursing education. General physiological causation and established medical concepts may be explained clearly; do not turn them into an unsupported diagnosis or cause for an individual. Preserve uncertainty where it changes interpretation, not as boilerplate that replaces an answer.
Give nursing-appropriate assessment and communication considerations when relevant. Acute deterioration warrants timely bedside assessment and local escalation, not reassurance or waiting for the assistant. Device troubleshooting concepts must respect trained personnel, manufacturer instructions and local protocols; never bypass alarms or advise hazardous improvisation. Do not prescribe an individualized dose, bolus, titration, medication hold/start, procedure, or ventilator/pacer setting. Explain principles and what clinicians would need to decide instead. Describe general treatment knowledge without issuing orders.
Never claim a single sign rules out a dangerous condition. Do not fabricate citations, normal findings, policy, targets or device-specific instructions. If required information is missing, explain what it changes; ask a focused clarification only when needed. Avoid repeated disclaimers and always-include consult-provider endings. Patient identifiers are not permitted. Return exactly the schema JSON with answer only.`;
const ASK_FORMAT = { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['answer'], properties: { answer: { type: 'string', description: 'Adaptive, direct nursing education in concise plain-text paragraphs, optionally hyphen bullets. No fixed sections. At most 7000 characters.' } } } };
const ASK_PROVIDER_MS = 25000;

function validateAskAnswer(raw) {
  let value;
  try { value = JSON.parse(raw); } catch { return { answer: null, codes: ['invalid_answer_schema'] }; }
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).join('|') !== 'answer'
    || typeof value.answer !== 'string' || value.answer.trim().length < 12 || value.answer.length > 7000 || /```/.test(value.answer)) return { answer: null, codes: ['invalid_answer_schema'] };
  const answer = value.answer.trim();
  const codes = [];
  // General disease labels, ranges and physiology are intentionally permitted.
  // These guards target individualized assertions/actions, not educational topics.
  if (/\b(?:your|this) patient\s+(?:has|is|was|received|takes|needs)\b/i.test(answer)) codes.push('individualized_patient_assertion');
  if (/\b(?:your Snapshot|the active Snapshot|your case history|your records|your earlier (?:BP|blood pressure|results))\b/i.test(answer)) codes.push('unavailable_context_claim');
  const actions = /^(?:[-*]\s*)?(?:(?:you (?:should|must)|now)\s+)?(?:give|administer|start|stop|hold|increase|decrease|titrate|bolus|infuse|intubate|transfuse|set|disconnect)\b[^.!?\n]{0,160}\b(?:dose|drug|medication|fluid|oxygen|insulin|heparin|norepinephrine|epinephrine|antibiotic|sedation|ventilator|pacer|pacemaker|bloodline|catheter|mg|mcg|mL|units)\b/im;
  if (actions.test(answer)) codes.push('individualized_treatment_instruction');
  if (/^(?:[-*]\s*)?(?:disable|bypass)\b[^.!?\n]{0,60}\b(?:alarm|interlock|safety)\b/im.test(answer)) codes.push('unsafe_device_instruction');
  if (/\b(?:this (?:proves|definitely means)|definitely caused by|certainly caused by|guarantees? (?:normal|safe)|(?:no need to|do not) (?:escalate|seek help)|always harmless)\b/i.test(answer)) codes.push('unsafe_certainty_or_reassurance');
  if (answer.length < 250 && /^(?:I (?:cannot|can't|won't)|I'm unable to) (?:answer|discuss|provide|help with) (?:any |general )?(?:medical|clinical|nursing)/i.test(answer)) codes.push('unhelpful_educational_refusal');
  return { answer: codes.length ? null : answer, codes };
}

function registerAskRoutes(app, dependencies) {
  const { apiLimiter, getClient, containsPHI, runWithStageTimeout, collectPriorityMapStream, appendOperationalLog, classifyProviderError } = dependencies;
  app.post('/api/ask', apiLimiter, async (req, res) => {
    const start = Date.now(), requestId = randomUUID();
    let finished = false, disconnected = false, providerStart = null;
    let providerMetadata = {};
    const controller = new AbortController();
    res.on('finish', () => { finished = true; });
    res.on('close', () => { if (!finished) { disconnected = true; controller.abort(); } });
    const log = fields => appendOperationalLog({ timestamp: new Date().toISOString(), request_id: requestId, route: 'ASK_CLINICAL_EDGE', mode: 'general', category: 'general', total_duration_ms: Date.now() - start, client_disconnected: disconnected, ...fields });
    const fail = (status, code, message) => { if (!disconnected) res.status(status).json({ error: { code, message }, requestId }); };
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['question', 'contextMode'].includes(k)) || body.contextMode !== 'general') {
      log({ status: 'blocked', provider_status: 'not_called', failure_reason: 'invalid_context_boundary' });
      return fail(400, 'invalid_context_boundary', 'General questions cannot include Snapshot or conversation context.');
    }
    if (typeof body.question !== 'string' || body.question.trim().length < 4 || body.question.length > 4000) {
      log({ status: 'blocked', provider_status: 'not_called', failure_reason: 'invalid_question' });
      return fail(400, 'invalid_question', 'Enter a nursing question of 4 to 4000 characters.');
    }
    const question = body.question.trim();
    if (containsPHI(question)) {
      log({ status: 'blocked', provider_status: 'not_called', failure_reason: 'identifier_pattern' });
      return fail(400, 'identifier_pattern', 'Remove patient identifiers before asking. Passing this check does not establish de-identification.');
    }
    const client = getClient();
    if (!client) {
      log({ status: 'error', provider_status: 'not_configured', failure_reason: 'provider_not_configured' });
      return fail(503, 'provider_not_configured', 'The clinical education service is unavailable.');
    }
    try {
      providerStart = Date.now();
      const result = await runWithStageTimeout(signal => collectPriorityMapStream(client.messages.stream({
        model: 'claude-sonnet-4-6', max_tokens: 1200, system: ASK_PROMPT,
        output_config: { format: ASK_FORMAT }, messages: [{ role: 'user', content: question }],
      }, { signal }), Date.now, metadata => { providerMetadata = metadata; }), ASK_PROVIDER_MS, 'provider_timeout', controller.signal);
      const providerDuration = Date.now() - providerStart;
      const validationStart = Date.now();
      const checked = result.stopReason === 'end_turn' ? validateAskAnswer(result.text) : { answer: null, codes: ['incomplete_answer'] };
      log({ status: checked.answer ? 'success' : 'rejected', input_length: question.length, response_length: result.text.length, ...providerMetadata,
        provider_status: 'success', provider_duration_ms: providerDuration,
        provider_first_token_ms: result.firstTokenMs, provider_stop_reason: result.stopReason,
        provider_input_tokens: result.inputTokens, provider_output_tokens: result.outputTokens,
        validation_status: checked.answer ? 'accepted' : 'rejected', validation_duration_ms: Date.now() - validationStart,
        rejection_reason_codes: checked.codes, display_resolution: checked.answer ? 'validated_answer' : 'no_answer', timeout_layer: null });
      if (!checked.answer) return fail(422, 'answer_not_accepted', 'An answer could not be safely completed. Your question is unchanged.');
      if (!disconnected) res.json({ answer: checked.answer, contextMode: 'general', requestId });
    } catch (error) {
      const timeout = error?.code === 'provider_timeout';
      const category = classifyProviderError(error);
      log({ status: disconnected ? 'cancelled' : 'error', ...providerMetadata, provider_status: disconnected ? 'cancelled' : timeout ? 'timeout' : 'error',
        provider_duration_ms: providerStart === null ? 0 : Date.now() - providerStart,
        timeout_layer: disconnected ? 'client_disconnect' : timeout ? 'provider' : null,
        failure_reason: disconnected ? 'client_disconnect' : timeout ? 'provider_timeout' : category.code, display_resolution: 'no_answer' });
      return fail(timeout ? 504 : category.code === 'provider_rate_limit' ? 429 : 502, timeout ? 'provider_timeout' : category.code, timeout ? 'The clinical education service timed out. Your question is unchanged.' : category.message);
    }
  });
}
module.exports = { ASK_PROMPT, ASK_FORMAT, ASK_PROVIDER_MS, validateAskAnswer, registerAskRoutes };
