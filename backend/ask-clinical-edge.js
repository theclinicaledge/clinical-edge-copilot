const { randomUUID } = require('node:crypto');
const { retrieveEvidence, sourceMetadata, groundingContext, GROUNDING_INSTRUCTIONS, groundedFormat, validateGrounded, boundedEvidenceAnswer } = require('./ask-evidence');
const { routeABG, teachingCatalog, explanationRequest, selectExplanation } = require('./ask-abg-engine');

const ASK_PROMPT = `You are Ask Clinical Edge, an educational assistant for bedside nurses. Answer the question directly first, then adapt the explanation to what was asked. A short concept may need only a few sentences; a complex bedside or device question may benefit from physiology, focused assessment, discriminating information and relevant safety considerations. Do not mechanically include every section. Use concise plain-text paragraphs and optional hyphen bullets, not a Priority Map, quiz, urgency label or rigid template. Usually 100-250 words; simpler questions should be shorter.
GENERAL MODE: You have only this question. No Shift Brain Snapshot, case history, records or previous conversation is available. Never imply access to them. Values explicitly in the question may be interpreted as reported information, not verified findings. Do not invent patient facts, baseline, trends, medications, diagnoses or causes. Distinguish general knowledge, hypothetical possibilities and information actually provided.
Discuss diagnoses, physiology, medications, procedures, devices and general treatments as clinical education. Do not refuse safe nursing education. General physiological causation and established medical concepts may be explained clearly; do not turn them into an unsupported diagnosis or cause for an individual. Preserve uncertainty where it changes interpretation, not as boilerplate that replaces an answer.
Give nursing-appropriate assessment and communication considerations when relevant. Acute deterioration warrants timely bedside assessment and local escalation, not reassurance or waiting for the assistant. Device troubleshooting concepts must respect trained personnel, manufacturer instructions and local protocols; never bypass alarms or advise hazardous improvisation. Do not prescribe an individualized dose, bolus, titration, medication hold/start, procedure, or ventilator/pacer setting. Explain principles and what clinicians would need to decide instead. Describe general treatment knowledge without issuing orders.
Never claim a single sign rules out a dangerous condition. Do not fabricate citations, normal findings, policy, targets or device-specific instructions. If required information is missing, explain what it changes; ask a focused clarification only when needed. Avoid repeated disclaimers and always-include consult-provider endings. Patient identifiers are not permitted. Return exactly the schema JSON with answer only.`;
const ASK_SECTIONS = ['Why it matters', 'At the bedside', 'What changes interpretation', 'Common pitfall', 'Safety'];
const ASK_FORMAT = { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['answer', 'details'], properties: {
  answer: { type: 'string', description: 'Direct answer first, usually 1-3 sentences. No opening disclaimer or heading. Maximum 1800 characters.' },
  details: { type: 'array', description: 'Zero to three nonredundant supporting sections, only when useful. A basic concept may need none.', items: { type: 'object', additionalProperties: false, required: ['heading', 'text'], properties: {
    heading: { type: 'string', enum: ASK_SECTIONS }, text: { type: 'string', description: 'Concise supporting explanation; optional hyphen bullets. Maximum 1000 characters.' },
  } } },
} } };
const ASK_PROVIDER_MS = 25000;

const ASK_REASONING_CONTRACT = `ANSWER EXPERIENCE: Put the actual answer in answer, then choose only useful details. Usually 80-180 words total; complex questions may need up to 250. Do not repeat the direct answer in each section. Explain WHICH bedside observation changes interpretation and WHY; do not substitute generic monitoring or disclaimers. Do not force escalation for routine concepts or reported unchanged baseline.
QUESTION CONTEXT: General definitions are not patient cases. For explicitly reported values/context, separate what was supplied from possible interpretations. A newly noticed finding does not establish when it began. Missing history, exposures, examinations, comparisons and measurements remain unknown, never normal or absent. Describe relevant mechanisms without asserting an individual diagnosis or cause. For several interacting findings, connect them, identify competing possibilities and discriminating bedside information. Give a bounded useful explanation now rather than making Snapshot mandatory. Never borrow an active workspace or previous question.
INTERPRETIVE DISCIPLINE: Do not equate a pressure with a volume, a surrogate with the variable it approximates, or samples from different sites with interchangeable values. State measurement/compliance/sampling conditions when they change interpretation. One blood gas does not establish duration, exclude a mixed process or prove renal adaptation. Distinguish a gas relationship from its cause. An elevated marker is not a disease-specific diagnosis. Device pressure names and alarms are model-dependent and not interchangeable; explain concepts, not universal procedures. Medication effects depend on physiology/context; an operation or diagnosis alone does not establish an indication.
EVIDENCE BOUNDARY: No vetted reference passages or live guideline retrieval are supplied. This is generated education, not source-verified guidance. Do not invent citations, links, studies, policies or claims that a reference was checked. Avoid numerical dose menus, device settings, procedural volumes/steps, diagnostic cutoffs, formulas or changing guideline targets without verified source support. Reported question values may be discussed as reported, not prescriptions or universal targets. Explain stable physiology and what must be verified in the applicable approved reference instead of filling evidence gaps with confident specifics.
SAFETY: Do not hide individualized dosing or procedure advice behind 'generally', 'for education', 'ask your provider', or a disclaimer. Do not issue medication holds/starts, titration, bolus or device manipulation. A safe redirect should explain the decision factors, not supply a regimen. For an actual potentially urgent change, advise timely local assessment/team communication proportionately; never wait for chat. Return exactly answer and details, no generated sources or extra fields.`;

// These categories route explanation and verification needs, not diagnoses or urgency.
function questionPolicy(question) {
  const patientContext = /\b(?:my|our|this|a) patient\b|\b(?:pH|PaCO2|HCO3|LVEDP|MAP|CI|BP|glucose|potassium|lactate)\s*(?:is|of|=|:)?\s*\d/i.test(question);
  const categories = [];
  if (/\b(?:medication|dose|dosing|drug|insulin|heparin|epinephrine|norepinephrine|antibiotic|opioid|fentanyl|metoprolol|diuretic)\b/i.test(question)) categories.push('medication');
  if (/\b(?:CRRT|dialysis|filter|pacer|pacemaker|capture|tube|drain|catheter|ventilator|device|suction|alarm)\b/i.test(question)) categories.push('device');
  if (/\d|\b(?:ABG|blood gas|range|threshold|formula|criteria|normal value|LVEDP|SvO2|ScvO2|lactate)\b/i.test(question)) categories.push('interpretation');
  if (/\b(?:guideline|recommendation|protocol|target)\b/i.test(question)) categories.push('guideline');
  const doseSelection = /\b(?:what|which|how much|calculate|choose|recommend|tell me|give me)\b[^?\n]{0,100}\b(?:dose|dosage|bolus|titrate|titration|infusion rate)\b/i.test(question)
    || /\b(?:dose|dosage|bolus|infusion rate)\b[^?\n]{0,70}\b(?:give|start|use|administer|my patient)\b/i.test(question);
  const safetyBypass = /\b(?:disable|bypass|silence|override)\b[^?\n]{0,60}\b(?:alarm|interlock|safety)\b/i.test(question);
  const actionRequested = patientContext || /\b(?:give|start|administer|titrate|calculate|choose|recommend)\b/i.test(question);
  return { questionKind: patientContext ? 'reported_context' : 'education', categories, needsVerification: categories.length > 0, offerSnapshot: patientContext, boundary: safetyBypass ? 'device_safety' : doseSelection && actionRequested ? 'dose_selection' : null };
}

function validateAskAnswer(raw, { requireStructured = false, policy = null } = {}) {
  let value;
  try { value = JSON.parse(raw); } catch { return { answer: null, codes: ['invalid_answer_schema'] }; }
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['answer', 'details'].includes(k))
    || typeof value.answer !== 'string' || value.answer.trim().length < 12 || value.answer.length > (requireStructured ? 1800 : 7000)
    || (requireStructured && !Array.isArray(value.details))) return { answer: null, codes: ['invalid_answer_schema'] };
  const details = value.details ?? [];
  if (!Array.isArray(details) || details.length > 3 || details.some(d => !d || typeof d !== 'object' || Array.isArray(d)
    || Object.keys(d).length !== 2 || !ASK_SECTIONS.includes(d.heading) || typeof d.text !== 'string' || !d.text.trim() || d.text.length > 1000)
    || new Set(details.map(d => d.heading)).size !== details.length) return { answer: null, codes: ['invalid_answer_schema'] };
  const answer = value.answer.trim();
  const content = [answer, ...details.map(d => d.text)].join('\n\n');
  if (content.length > 7000 || /```/.test(content)) return { answer: null, codes: ['invalid_answer_schema'] };
  const codes = [];
  // General disease labels, ranges and physiology are intentionally permitted.
  // These guards target individualized assertions/actions, not educational topics.
  if (/\b(?:your|this) patient\s+(?:has|is|was|received|takes|needs)\b/i.test(content)) codes.push('individualized_patient_assertion');
  if (/\b(?:your Snapshot|the active Snapshot|your case history|your records|your earlier (?:BP|blood pressure|results))\b/i.test(content)) codes.push('unavailable_context_claim');
  const actions = /^(?:[-*]\s*)?(?:(?:you (?:should|must)|now)\s+)?(?:give|administer|start|stop|hold|increase|decrease|titrate|bolus|infuse|intubate|transfuse|set|disconnect)\b[^.!?\n]{0,160}\b(?:dose|drug|medication|fluid|oxygen|insulin|heparin|norepinephrine|epinephrine|antibiotic|sedation|ventilator|pacer|pacemaker|bloodline|catheter|mg|mcg|mL|units)\b/im;
  if (content.split(/(?:\n|[.!?]\s+)/).some(sentence => actions.test(sentence))) codes.push('individualized_treatment_instruction');
  if (/^(?:[-*]\s*)?(?:disable|bypass)\b[^.!?\n]{0,60}\b(?:alarm|interlock|safety)\b/im.test(content)) codes.push('unsafe_device_instruction');
  if (content.split(/(?:\n|[.!?]\s+)/).some(s => /^(?:[-*]\s*)?(?:(?:you|the nurse) (?:should|must|can)\s+)?(?:flush|irrigate|clamp|advance|withdraw|reconnect|reverse|reposition)\b[^.!?\n]{0,100}\b(?:tube|lumen|line|catheter|circuit|lead)\b/i.test(s))) codes.push('unverified_device_procedure');
  if (/\b(?:this (?:proves|definitely means)|definitely caused by|certainly caused by|guarantees? (?:normal|safe)|(?:no need to|do not) (?:escalate|seek help)|always harmless)\b/i.test(content)) codes.push('unsafe_certainty_or_reassurance');
  if (/https?:\/\/|\bdoi\s*:|\b(?:according to|as stated in)\b[^.\n]{0,90}\b(?:guidelines?|stud(?:y|ies)|journal|FDA|AHA)\b/i.test(content)) codes.push('unverified_source_claim');
  if (/\b\d+(?:\.\d+)?\s*(?:[-\u2013]\s*\d+(?:\.\d+)?)?\s*(?:mg|mcg|micrograms?|units?)(?!\s*\/\s*(?:dL|L))\b/i.test(content)
    && (!policy || policy.categories.includes('medication') || /\b(?:dose|bolus|infusion|give|administer|insulin|heparin|epinephrine|norepinephrine)\b/i.test(content))) codes.push('unverified_dose_specifics');
  if (answer.length < 250 && /^(?:I (?:cannot|can't|won't)|I'm unable to) (?:answer|discuss|provide|help with) (?:any |general )?(?:medical|clinical|nursing)/i.test(answer)) codes.push('unhelpful_educational_refusal');
  return { answer: codes.length ? null : answer, details: codes.length ? [] : details, codes };
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
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['question', 'contextMode', 'abgExplanation'].includes(k)) || body.contextMode !== 'general'
      || ('abgExplanation' in body && typeof body.abgExplanation !== 'boolean')) {
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
    const policy = questionPolicy(question);
    const presentation = { contextMode: 'general', questionKind: policy.questionKind, offerSnapshot: policy.offerSnapshot,
      evidence: { status: 'not_source_grounded', requiresVerification: policy.needsVerification, categories: policy.categories } };
    if (policy.boundary) {
      const answer = policy.boundary === 'dose_selection'
        ? 'A dose or titration cannot be selected safely from a chat question. The prescribed indication, formulation, units, patient response and approved local protocol determine the plan.'
        : 'Do not bypass a device alarm or safety interlock. Identify the alarm and the exact device, assess the person and obtain the trained bedside team using the manufacturer instructions and local protocol.';
      const details = [{ heading: 'At the bedside', text: policy.boundary === 'dose_selection'
        ? 'Clarify the existing order and intended physiologic goal with the treating team. Report the relevant response and safety concerns rather than using a suggested dose menu. General questions about how a medication works are welcome.'
        : 'A pressure or alarm name alone does not establish the cause. Device models use different sensors and safety systems; a generic troubleshooting sequence can be unsafe.' }];
      log({ status: 'boundary', provider_status: 'not_called', question_kind: policy.questionKind, verification_required: true, display_resolution: 'safety_boundary', boundary_category: policy.boundary });
      return res.json({ answer, details, ...presentation, requestId });
    }
    const abg = routeABG(question);
    if (abg) {
      const pack = retrieveEvidence('Explain acid-base');
      const initialPoints = abg.status === 'verified' ? teachingCatalog(abg).slice(0, 2) : [];
      const evidenceForABG = ids => ({ ...sourceMetadata(pack, ids), status: 'deterministic_rules' });
      if (!body.abgExplanation || abg.status !== 'verified') {
        log({ status: abg.status === 'verified' ? 'success' : 'boundary', provider_status: 'not_called', display_resolution: abg.status === 'verified' ? 'abg_verified' : 'abg_clarification' });
        return res.json({ ...presentation, answer: abg.summary, details: [], abg, abgTeaching: initialPoints, abgExplanationOptions: teachingCatalog(abg),
          evidence: evidenceForABG([...new Set([...abg.sourceIds, ...initialPoints.flatMap(p => p.sourceIds)])]), requestId });
      }
      const unavailable = () => { if (!disconnected) res.json({ contextMode: 'general', abgExplanation: { status: 'unavailable', points: [] }, requestId }); };
      const abgClient = getClient();
      if (!abgClient) {
        log({ status: 'error', provider_status: 'not_configured', display_resolution: 'abg_preserved', failure_reason: 'provider_not_configured' });
        return unavailable();
      }
      try {
        const contract = explanationRequest(abg);
        providerStart = Date.now();
        const result = await runWithStageTimeout(signal => collectPriorityMapStream(abgClient.messages.stream({
          model: 'claude-sonnet-4-6', max_tokens: 1200, system: contract.system, output_config: { format: contract.format },
          messages: [{ role: 'user', content: question }],
        }, { signal }), Date.now, metadata => { providerMetadata = metadata; }), ASK_PROVIDER_MS, 'provider_timeout', controller.signal);
        const validationStart = Date.now();
        const selected = result.stopReason === 'end_turn' ? selectExplanation(result.text, abg) : { accepted: false, points: [], codes: ['incomplete_abg_explanation'] };
        log({ status: selected.accepted ? 'success' : 'rejected', ...providerMetadata, provider_status: 'success', provider_duration_ms: Date.now() - providerStart,
          provider_first_token_ms: result.firstTokenMs, provider_stop_reason: result.stopReason, provider_input_tokens: result.inputTokens, provider_output_tokens: result.outputTokens,
          validation_status: selected.accepted ? 'accepted' : 'rejected', validation_duration_ms: Date.now() - validationStart,
          rejection_reason_codes: selected.codes, display_resolution: selected.accepted ? 'abg_explanation_selection' : 'abg_preserved', timeout_layer: null });
        if (!selected.accepted) return unavailable();
        if (!disconnected) res.json({ contextMode: 'general', abgExplanation: { status: 'selected', pointIds: selected.points.map(p => p.id) }, requestId });
        return;
      } catch (error) {
        const timeout = error?.code === 'provider_timeout';
        log({ status: disconnected ? 'cancelled' : 'error', ...providerMetadata, provider_status: disconnected ? 'cancelled' : timeout ? 'timeout' : 'error',
          provider_duration_ms: Date.now() - providerStart, timeout_layer: disconnected ? 'client_disconnect' : timeout ? 'provider' : null,
          failure_reason: disconnected ? 'client_disconnect' : timeout ? 'provider_timeout' : classifyProviderError(error).code, display_resolution: 'abg_preserved' });
        return unavailable();
      }
    }
    if (body.abgExplanation) {
      log({ status: 'blocked', provider_status: 'not_called', failure_reason: 'invalid_context_boundary' });
      return fail(400, 'invalid_context_boundary', 'A supported verified ABG is required for this explanation.');
    }
    const evidencePack = retrieveEvidence(question);
    if (evidencePack && evidencePack.coverage !== 'concepts') {
      const bounded = boundedEvidenceAnswer(evidencePack);
      log({ status: 'boundary', provider_status: 'not_called', display_resolution: 'evidence_boundary' });
      return res.json({ ...presentation, ...bounded, requestId });
    }
    const client = getClient();
    if (!client) {
      log({ status: 'error', provider_status: 'not_configured', failure_reason: 'provider_not_configured' });
      return fail(503, 'provider_not_configured', 'The clinical education service is unavailable.');
    }
    try {
      const reasoningContract = evidencePack ? ASK_REASONING_CONTRACT
        .replace(/EVIDENCE BOUNDARY:[\s\S]*?(?=\nSAFETY:)/, GROUNDING_INSTRUCTIONS)
        .replace('Return exactly answer and details, no generated sources or extra fields.', 'Return exactly answer, details and source_ids; no generated source metadata or extra fields.') : ASK_REASONING_CONTRACT;
      const system = `${ASK_PROMPT.replace('Return exactly the schema JSON with answer only.', '')}\n${reasoningContract}\nQuestion type: ${policy.questionKind}. Verification categories: ${policy.categories.join(', ') || 'foundational education'}.${evidencePack ? '\nCURATED REFERENCE CONTEXT (not patient evidence):\n' + groundingContext(evidencePack) : ''}`;
      providerStart = Date.now();
      const result = await runWithStageTimeout(signal => collectPriorityMapStream(client.messages.stream({
        model: 'claude-sonnet-4-6', max_tokens: 1200, system,
        output_config: { format: evidencePack ? groundedFormat(ASK_FORMAT, evidencePack) : ASK_FORMAT }, messages: [{ role: 'user', content: question }],
      }, { signal }), Date.now, metadata => { providerMetadata = metadata; }), ASK_PROVIDER_MS, 'provider_timeout', controller.signal);
      const providerDuration = Date.now() - providerStart;
      const validationStart = Date.now();
      const grounding = evidencePack && result.stopReason === 'end_turn' ? validateGrounded(result.text, evidencePack, question) : null;
      const checked = result.stopReason !== 'end_turn' ? { answer: null, codes: ['incomplete_answer'] }
        : grounding?.codes.length ? { answer: null, codes: grounding.codes }
          : validateAskAnswer(grounding?.plain ?? result.text, { requireStructured: true, policy });
      log({ status: checked.answer ? 'success' : 'rejected', input_length: question.length, response_length: result.text.length, ...providerMetadata,
        provider_status: 'success', provider_duration_ms: providerDuration,
        provider_first_token_ms: result.firstTokenMs, provider_stop_reason: result.stopReason,
        provider_input_tokens: result.inputTokens, provider_output_tokens: result.outputTokens,
        validation_status: checked.answer ? 'accepted' : 'rejected', validation_duration_ms: Date.now() - validationStart,
        rejection_reason_codes: checked.codes, display_resolution: checked.answer ? 'validated_answer' : 'no_answer', timeout_layer: null,
        question_kind: policy.questionKind, verification_required: policy.needsVerification, detail_count: checked.details?.length ?? 0 });
      if (!checked.answer) return fail(422, 'answer_not_accepted', 'An answer could not be safely completed. Your question is unchanged.');
      if (!disconnected) res.json({ answer: checked.answer, details: checked.details, ...presentation,
        ...(evidencePack ? { evidence: sourceMetadata(evidencePack, grounding.sourceIds) } : {}), requestId });
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
module.exports = { ASK_PROMPT, ASK_REASONING_CONTRACT, ASK_FORMAT, ASK_SECTIONS, ASK_PROVIDER_MS, questionPolicy, validateAskAnswer, registerAskRoutes };
