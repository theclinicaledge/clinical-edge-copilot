const { parseReasoning, REASONING_LIMITS, validateReasoning } = require('./priority-map-intelligence');

function rootFailureCategory(raw) {
  if (typeof raw !== 'string') return 'raw_string_required';
  if (raw.length > 12000) return 'raw_length_ceiling';
  try {
    const parsed = JSON.parse(raw);
    return !parsed || typeof parsed !== 'object' || Array.isArray(parsed) ? 'non_object_root' : 'bounded_json_object';
  } catch {
    if (/^\s*```/.test(raw)) return 'markdown_wrapped_json';
    // Inspect framing only for diagnostics; never extract a draft for acceptance.
    const start = raw.search(/[\[{]/);
    const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'));
    if (start >= 0 && end > start) {
      try {
        JSON.parse(raw.slice(start, end + 1));
        if (raw.slice(0, start).trim() || raw.slice(end + 1).trim()) return 'surrounding_text';
      } catch { /* Malformed embedded JSON remains a parsing failure. */ }
    }
    return 'invalid_json';
  }
}

// Paths and rule names come from code, never provider-authored keys or values.
function reasoningDiagnostics(source, raw, evidence, clinicalValidator, codes) {
  if (!codes.length) return [];
  const value = parseReasoning(raw);
  const findings = [];
  const add = (field_path, reason_category, metadata = {}) => findings.push({
    code: 'invalid_reasoning_schema', field_path, rule: reason_category,
    classification: 'schema', reason_category, ...metadata,
  });
  const keys = (item, expected, path) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return add(path, 'object_required');
    const missing = expected.filter(key => !Object.hasOwn(item, key));
    const unexpected = Object.keys(item).filter(key => !expected.includes(key)).length;
    if (missing.length || unexpected) add(path, 'exact_keys', { missing_keys: missing, unexpected_key_count: unexpected });
  };
  const string = (text, path, maximum) => {
    if (typeof text !== 'string') add(path, 'string_required');
    else if (!text.trim() || /[\n\r#*]/.test(text)) add(path, 'nonempty_plain_text');
    else if (text.length > maximum) add(path, 'hard_length_ceiling', { actual_length: text.length, maximum });
  };
  const array = (items, path, minimum, maximum) => {
    if (!Array.isArray(items)) add(path, 'array_required', { minimum, maximum });
    else if (items.length < minimum || items.length > maximum) add(path, 'array_cardinality', { actual_cardinality: items.length, minimum, maximum });
  };
  const fields = [];
  if (codes.includes('invalid_reasoning_schema')) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      add('$', rootFailureCategory(raw),
        typeof raw === 'string' && raw.length > 12000 ? { actual_length: raw.length, maximum: 12000 } : {});
    } else {
      keys(value, ['synthesis', 'possible_contributors', 'clarify_now', 'reassessment_or_escalation'], '$');
      string(value.synthesis, 'synthesis', REASONING_LIMITS.synthesis);
      for (const [name, minimum, maximum] of [['possible_contributors', 0, 3], ['clarify_now', 1, 3], ['reassessment_or_escalation', 1, 2]]) array(value[name], name, minimum, maximum);
      if (Array.isArray(value.possible_contributors)) value.possible_contributors.forEach((item, index) => {
        const path = `possible_contributors[${index}]`;
        keys(item, ['possibility', 'evidence_ids', 'uncertainty'], path);
        for (const key of ['possibility', 'uncertainty']) string(item?.[key], `${path}.${key}`, REASONING_LIMITS[key]);
        array(item?.evidence_ids, `${path}.evidence_ids`, 1, 3);
        if (Array.isArray(item?.evidence_ids)) {
          const invalid = item.evidence_ids.filter(id => !evidence.evidence.some(fact => fact.id === id)).length;
          if (invalid) add(`${path}.evidence_ids`, 'invalid_evidence_reference', { evidence_references_valid: false, invalid_reference_count: invalid });
        }
      });
      if (Array.isArray(value.clarify_now)) value.clarify_now.forEach((item, index) => {
        keys(item, ['assessment', 'why_it_matters'], `clarify_now[${index}]`);
        for (const key of ['assessment', 'why_it_matters']) string(item?.[key], `clarify_now[${index}].${key}`, REASONING_LIMITS[key]);
      });
      if (Array.isArray(value.reassessment_or_escalation)) value.reassessment_or_escalation.forEach((item, index) => string(item, `reassessment_or_escalation[${index}]`, REASONING_LIMITS.guidance));
    }
  }
  // Re-evaluate existing rules for attribution only; never feed these results into acceptance.
  if (value && !codes.includes('invalid_reasoning_schema')) {
    fields.push(['synthesis', value.synthesis]);
    value.possible_contributors.forEach((item, i) => ['possibility', 'uncertainty'].forEach(key => fields.push([`possible_contributors[${i}].${key}`, item[key]])));
    value.clarify_now.forEach((item, i) => ['assessment', 'why_it_matters'].forEach(key => fields.push([`clarify_now[${i}].${key}`, item[key]])));
    value.reassessment_or_escalation.forEach((text, i) => fields.push([`reassessment_or_escalation[${i}]`, text]));
    for (const [path, text] of fields) {
      const isolated = {
        synthesis: 'Possible contributors remain unknown.', possible_contributors: [],
        clarify_now: [{ assessment: 'Context remains unknown.', why_it_matters: 'Context may clarify possibilities.' }],
        reassessment_or_escalation: ['Consider reassessment under local protocol.'],
      };
      if (path === 'synthesis') isolated.synthesis = text;
      else if (path.startsWith('possible_contributors')) isolated.possible_contributors = [{ possibility: 'Possible contributor', uncertainty: 'Context remains unknown.', evidence_ids: [evidence.evidence[0]?.id], [path.split('.').at(-1)]: text }];
      else if (path.startsWith('clarify_now')) isolated.clarify_now[0][path.split('.').at(-1)] = text;
      else isolated.reassessment_or_escalation = [text];
      const local = validateReasoning(source, JSON.stringify(isolated), evidence, clinicalValidator);
      for (const code of codes.filter(code => local.includes(code))) findings.push({ code, field_path: path, rule: code, classification: 'semantic_safety', reason_category: code });
    }
  }
  for (const code of codes) if (!findings.some(finding => finding.code === code)) findings.push({ code, field_path: '$', rule: code, classification: code === 'invalid_reasoning_schema' ? 'schema' : 'semantic_safety', reason_category: 'aggregate_or_composed_rule' });
  return findings;
}

const SAFE_CODES = new Set(`invalid_reasoning_schema invalid_priority_map_contract incomplete_provider_response contributor_semantic_assertion contributor_missing_uncertainty reasoning_missing_uncertainty reasoning_numeric_repetition_contract reasoning_unsupported_number reasoning_unsupported_negative_finding reasoning_unsupported_diagnosis_label reasoning_treatment_directive reasoning_patient_assertion reasoning_medication_assertion reasoning_certainty_claim reasoning_unsupplied_medication reasoning_unsupported_finding reasoning_unsupported_temporal_claim acid_base_reliability unsupported_causality excluded_alternative unsupported_diagnostic_certainty certainty_overstatement unsupported_numeric_claim temporal_grounding unchanged_value_as_trend unsupported_measurement_trend urgency_underclassified urgency_overclassified urgency_priority_conflict urgency_escalation_conflict`.split(' '));
const SAFE_RULES = new Set([...SAFE_CODES, 'object_required', 'exact_keys', 'string_required', 'nonempty_plain_text', 'hard_length_ceiling', 'array_required', 'array_cardinality', 'invalid_evidence_reference', 'raw_length_ceiling', 'bounded_json_object', 'raw_string_required', 'non_object_root', 'markdown_wrapped_json', 'surrounding_text', 'invalid_json', 'aggregate_or_composed_rule']);
const SAFE_KEYS = new Set(['synthesis', 'possible_contributors', 'clarify_now', 'reassessment_or_escalation', 'possibility', 'uncertainty', 'evidence_ids', 'assessment', 'why_it_matters']);
function sanitizeValidationMetadata(value) {
  if (!value || !['original', 'repair'].includes(value.stage) || typeof value.accepted !== 'boolean') return undefined;
  const findings = (Array.isArray(value.findings) ? value.findings : []).filter(item => item && SAFE_CODES.has(item.code)).map(item => {
    const safe = { code: item.code };
    safe.field_path = typeof item.field_path === 'string' && /^(?:\$|synthesis|(?:possible_contributors|clarify_now|reassessment_or_escalation)(?:\[\d+\])?(?:\.(?:possibility|uncertainty|evidence_ids|assessment|why_it_matters))?)$/.test(item.field_path) ? item.field_path : '$';
    for (const key of ['rule', 'reason_category']) if (SAFE_RULES.has(item[key])) safe[key] = item[key];
    if (['schema', 'semantic_safety'].includes(item.classification)) safe.classification = item.classification;
    for (const key of ['actual_length', 'maximum', 'minimum', 'actual_cardinality', 'unexpected_key_count', 'invalid_reference_count']) if (Number.isFinite(item[key]) && item[key] >= 0) safe[key] = item[key];
    if (typeof item.evidence_references_valid === 'boolean') safe.evidence_references_valid = item.evidence_references_valid;
    if (Array.isArray(item.missing_keys)) safe.missing_keys = item.missing_keys.filter(key => SAFE_KEYS.has(key));
    return safe;
  });
  return { stage: value.stage, accepted: value.accepted,
    validation_duration_ms: Number.isFinite(value.validation_duration_ms) && value.validation_duration_ms >= 0 ? value.validation_duration_ms : 0,
    rejection_codes: (Array.isArray(value.rejection_codes) ? value.rejection_codes : []).filter(code => SAFE_CODES.has(code)),
    ...(findings.length ? { findings } : {}),
  };
}
module.exports = { reasoningDiagnostics, sanitizeValidationMetadata };
