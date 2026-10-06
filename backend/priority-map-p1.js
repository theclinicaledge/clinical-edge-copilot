const legacy = require('./priority-map-intelligence');

const CONTRIBUTOR_FIELDS = ['possibility', 'evidence_ids', 'uncertainty', 'why_relevant', 'would_strengthen', 'would_weaken'];
const ASSESSMENT_FIELDS = ['assessment', 'why_it_matters', 'focus', 'competing_mechanisms', 'conditional_interpretation'];
const PHYSIOLOGY_FIELDS = ['principle', 'application', 'limitation'];
const LIMITS = Object.freeze({ why_relevant: 200, would_strengthen: 160, would_weaken: 160, focus: 160, conditional_interpretation: 220, principle: 240, application: 240, limitation: 200 });
const REASONING_OUTPUT_FORMAT = structuredClone(legacy.REASONING_OUTPUT_FORMAT);
const schema = REASONING_OUTPUT_FORMAT.schema;
schema.required.push('physiology');
schema.properties.physiology = { type: 'object', additionalProperties: false, required: PHYSIOLOGY_FIELDS, properties: Object.fromEntries(PHYSIOLOGY_FIELDS.map(key => [key, { type: 'string', description: `${key}: bounded physiology teaching, not a new patient fact; at most ${LIMITS[key]} characters.` }])) };
for (const key of ['why_relevant', 'would_strengthen', 'would_weaken']) {
  const item = schema.properties.possible_contributors.items;
  item.required.push(key);
  item.properties[key] = { type: 'string', description: `${key}: at most ${LIMITS[key]} characters. ${key === 'why_relevant' ? 'Explain the qualified physiological connection to the cited reported evidence, not merely its presence.' : 'Begin with If; describe unobserved conditional information that could change confidence, never exclude alternatives definitively.'}` };
}
for (const key of ['focus', 'conditional_interpretation', 'competing_mechanisms']) {
  const item = schema.properties.clarify_now.items;
  item.required.push(key);
  item.properties[key] = key === 'competing_mechanisms'
    ? { type: 'array', items: { type: 'string', enum: [...legacy.CONTRIBUTOR_CATEGORIES] }, description: 'One to three relevant alternatives this assessment helps distinguish, not diagnoses.' }
    : { type: 'string', description: `${key}: at most ${LIMITS[key]} characters. ${key === 'focus' ? 'A specific neutral nursing information request within the selected assessment category.' : 'Begin with If; describe how different possible findings could change interpretation, not an examination result.'}` };
}
const COMPACT_REASONING_PROMPT = `${legacy.COMPACT_REASONING_PROMPT}

P1 VALUE CONTRACT: A safe restatement alone is insufficient. Synthesis should connect findings to a qualified physiological concern. Select only relevant mechanisms, usually fewer than the maximum. For each, why_relevant links the supplied evidence IDs to physiological plausibility; nonspecific evidence is not proof. State actual missing context in uncertainty. would_strengthen and would_weaken begin with If and describe conditional corroboration or competing explanations, never findings already present or definitive exclusions.
Keep the existing neutral assessment heading; focus specifies the bedside information sought, competing_mechanisms names relevant categories, why_it_matters explains the discriminator, and conditional_interpretation begins with If and describes how contrasting findings could change interpretation. Do not insert an unsupported negative even inside a hypothetical; describe affirmative assessment alternatives instead.
physiology teaches one useful principle: principle explains physiology with appropriately qualified wording; application connects it to this reported pattern; limitation states what it cannot establish. Do not default to trend-recognition teaching unless temporal reasoning is the actual learning problem. General physiology is NOT exempt from safety validation. Use concise strings, preferably 90 characters, and avoid repeating the Snapshot, disclaimers or the same rationale. Preserve every preceding safety rule.`;

function projectLegacy(value) {
  if (!value || typeof value !== 'object') return value;
  return {
    synthesis: value.synthesis,
    possible_contributors: Array.isArray(value.possible_contributors) ? value.possible_contributors.map(item => ({ possibility: item?.possibility, evidence_ids: item?.evidence_ids, uncertainty: item?.uncertainty })) : value.possible_contributors,
    clarify_now: Array.isArray(value.clarify_now) ? value.clarify_now.map(item => ({ assessment: item?.assessment, why_it_matters: item?.why_it_matters })) : value.clarify_now,
    reassessment_or_escalation: value.reassessment_or_escalation,
  };
}

function schemaFindings(value) {
  const findings = [];
  const add = (field_path, reason_category, meta = {}) => findings.push({ code: 'invalid_reasoning_schema', field_path, rule: reason_category, reason_category, classification: 'schema', ...meta });
  const keys = (item, expected, path) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) { add(path, 'object_required'); return false; }
    const missing = expected.filter(k => !Object.hasOwn(item, k));
    const unexpected = Object.keys(item).filter(k => !expected.includes(k)).length;
    if (missing.length || unexpected) add(path, 'exact_keys', { missing_keys: missing, unexpected_key_count: unexpected });
    return true;
  };
  const string = (text, path, maximum, conditional = false) => {
    if (typeof text !== 'string') add(path, 'string_required');
    else if (!text.trim() || /[\n\r#*]/.test(text)) add(path, 'nonempty_plain_text');
    else if (text.length > maximum) add(path, 'hard_length_ceiling', { actual_length: text.length, maximum });
    else if (conditional && !/^If\b/.test(text)) add(path, 'conditional_required');
  };
  const enumeration = (text, allowed, path) => { if (!allowed.includes(text)) add(path, 'enum_value'); };
  if (!keys(value, ['synthesis', 'possible_contributors', 'clarify_now', 'reassessment_or_escalation', 'physiology'], '$')) return findings;
  if (keys(value.physiology, PHYSIOLOGY_FIELDS, 'physiology')) PHYSIOLOGY_FIELDS.forEach(k => string(value.physiology[k], `physiology.${k}`, LIMITS[k]));
  if (Array.isArray(value.possible_contributors)) value.possible_contributors.forEach((item, i) => {
    const path = `possible_contributors[${i}]`;
    if (!keys(item, CONTRIBUTOR_FIELDS, path)) return;
    enumeration(item.possibility, legacy.CONTRIBUTOR_CATEGORIES, `${path}.possibility`);
    ['why_relevant', 'would_strengthen', 'would_weaken'].forEach(k => string(item[k], `${path}.${k}`, LIMITS[k], k !== 'why_relevant'));
    if (Array.isArray(item.evidence_ids) && new Set(item.evidence_ids).size !== item.evidence_ids.length) add(`${path}.evidence_ids`, 'duplicate_evidence_reference');
  });
  if (Array.isArray(value.clarify_now)) value.clarify_now.forEach((item, i) => {
    const path = `clarify_now[${i}]`;
    if (!keys(item, ASSESSMENT_FIELDS, path)) return;
    enumeration(item.assessment, legacy.ASSESSMENT_REQUESTS, `${path}.assessment`);
    string(item.focus, `${path}.focus`, LIMITS.focus);
    string(item.conditional_interpretation, `${path}.conditional_interpretation`, LIMITS.conditional_interpretation, true);
    if (!Array.isArray(item.competing_mechanisms)) add(`${path}.competing_mechanisms`, 'array_required');
    else if (item.competing_mechanisms.length < 1 || item.competing_mechanisms.length > 3) add(`${path}.competing_mechanisms`, 'array_cardinality', { actual_cardinality: item.competing_mechanisms.length, minimum: 1, maximum: 3 });
    else item.competing_mechanisms.forEach(k => enumeration(k, legacy.CONTRIBUTOR_CATEGORIES, `${path}.competing_mechanisms`));
  });
  return findings;
}

function extraFields(value) {
  const fields = [];
  (value.possible_contributors || []).forEach((item, i) => ['why_relevant', 'would_strengthen', 'would_weaken'].forEach(k => fields.push([`possible_contributors[${i}].${k}`, item[k], 'synthesis'])));
  (value.clarify_now || []).forEach((item, i) => ['focus', 'conditional_interpretation'].forEach(k => fields.push([`clarify_now[${i}].${k}`, item[k], 'assessment'])));
  PHYSIOLOGY_FIELDS.forEach(k => fields.push([`physiology.${k}`, value.physiology?.[k], 'synthesis']));
  return fields;
}

// Every added generated string traverses the unchanged legacy safety rules.
// Nothing is exempted as educational text, nor rewritten to add a hedge.
function isolatedValue(text, role) {
  return { synthesis: role === 'synthesis' ? text : 'Possible contributors remain unknown.', possible_contributors: [], clarify_now: [{ assessment: role === 'assessment' ? text : 'Clarify current context.', why_it_matters: 'Context may distinguish possibilities.' }], reassessment_or_escalation: ['Consider bedside reassessment under local protocol.'] };
}
function validateReasoning(source, raw, evidence, clinicalValidator) {
  const value = legacy.parseReasoning(raw);
  if (schemaFindings(value).length) return ['invalid_reasoning_schema'];
  const issues = legacy.validateReasoning(source, JSON.stringify(projectLegacy(value)), evidence, clinicalValidator);
  if (issues.includes('invalid_reasoning_schema')) return issues;
  for (const [, text, role] of extraFields(value)) issues.push(...legacy.validateReasoning(source, JSON.stringify(isolatedValue(text, role)), evidence, clinicalValidator));
  // Also check cross-field clinical meaning before the normal composed-output gate.
  issues.push(...clinicalValidator(source, [value.synthesis, ...extraFields(value).map(([, text]) => text)].join('\n')));
  return [...new Set(issues)];
}

function composePriorityMap(evidence, value) {
  const core = projectLegacy(value);
  core.clarify_now = value.clarify_now.map(item => ({ assessment: item.focus, why_it_matters: `${item.why_it_matters} Alternatives: ${item.competing_mechanisms.join('; ')}. Conditional interpretation: ${item.conditional_interpretation}` }));
  let map = legacy.composePriorityMap(evidence, core);
  const patterns = value.possible_contributors.map(item => {
    const support = item.evidence_ids.map(id => evidence.evidence.find(e => e.id === id).text).join('; ');
    return `- Possible ${item.possibility}: ${item.why_relevant}\n  Reported support: ${support}\n  Unknown: ${item.uncertainty}\n  Conditional support: ${item.would_strengthen}\n  Conditional competing information: ${item.would_weaken}`;
  });
  map = map.replace(/\*\*Possible patterns\*\*[\s\S]*?(?=\*\*Missing information\*\*)/, `**Possible patterns**\n${patterns.join('\n') || '- The reported evidence does not establish a relevant contributor; clarification may be sufficient.'}\n\n`);
  map = map.replace(/\*\*Assess first\*\*[\s\S]*?(?=\*\*Possible patterns\*\*)/, '**Assess first**\n- Use the focused assessments above; conditional findings are not observed findings.\n\n');
  map = map.replace(/\*\*Teach me why\*\*[\s\S]*?(?=For educational support only\.)/, `**Teach me why**\nPhysiology: ${value.physiology.principle}\nIn this pattern: ${value.physiology.application}\nBoundary: ${value.physiology.limitation}\n\n`);
  return map;
}

function reasoningRepairDetails(raw, codes, evidence) {
  const value = legacy.parseReasoning(raw);
  const base = legacy.reasoningRepairDetails(JSON.stringify(projectLegacy(value)), codes, evidence);
  return { ...base, field_issues: [...base.field_issues, ...schemaFindings(value).map(f => ({ path: f.field_path, rule: f.rule, ...(f.actual_length === undefined ? {} : { actual: f.actual_length, maximum: f.maximum }) }))], hard_limits: { ...legacy.REASONING_LIMITS, ...LIMITS }, instruction: 'Correct rejected fields only in the full P1 schema. Preserve accepted content and evidence. Never add facts, hedges to disguise certainty, diagnosis or treatment. One repair only.' };
}

function teachingFromMap(source, map, clinicalValidator) {
  const match = String(map).match(/\*\*Teach me why\*\*\s*\nPhysiology: ([^\n]+)\nIn this pattern: ([^\n]+)\nBoundary: ([^\n]+)/);
  if (!match) return null;
  if (match.slice(1).some((text, i) => text.length > LIMITS[PHYSIOLOGY_FIELDS[i]])) return null;
  const evidence = legacy.buildEvidence(source, 'MODERATE');
  if (match.slice(1).some(text => legacy.validateReasoning(source, JSON.stringify(isolatedValue(text, 'synthesis')), evidence, clinicalValidator).length)) return null;
  return { principle: match[1], application: match[2], limitation: match[3] };
}

module.exports = { REASONING_OUTPUT_FORMAT, COMPACT_REASONING_PROMPT, LIMITS, PHYSIOLOGY_FIELDS, projectLegacy, schemaFindings, extraFields, isolatedValue, validateReasoning, composePriorityMap, reasoningRepairDetails, teachingFromMap };
