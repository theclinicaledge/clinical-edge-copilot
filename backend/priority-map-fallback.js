const { buildClinicalEvidenceLedger, freeze } = require('./clinical-evidence-ledger');

const GENERAL = Object.freeze({
  interpretation: 'Interpretation: Reported observations alone do not establish a diagnosis or cause. Unknown information remains unknown.',
  assess: 'General assessment: Verify measurement reliability and reassess current responsiveness, breathing and circulation under local protocol.',
  patterns: 'General clarification: Distinguish possible contributors using focused assessment; category membership is not an additional patient finding.',
  missing: 'Clarify relevant information not supplied; do not assume normal findings or absent exposures. Baseline, recognition and onset are separate questions.',
  monitor: 'General monitoring: Compare only explicitly comparable measurements. A single value or interval does not establish a trend; unchanged observations do not establish global stability.',
  high: 'The current evidence supports prompt team awareness and bedside evaluation now under local protocol. Further deterioration is not required before escalation.',
  other: 'Conditional guidance: If new or worsening concerns arise, reassess and communicate with the clinical team under local protocol.',
  sbar: 'Communicate the reported evidence, supported interpretations and unresolved context separately. Do not add findings or treatment orders.',
  teaching: 'General physiology: Temporal association does not establish causality. Recognition time is not necessarily onset.',
  empty: 'No structured observations were supplied.',
  conflict: 'Interpretation is limited by a discrepancy in supplied evidence. Preserve both observations and verify their timing and measurement reliability; do not choose one as established current truth.',
  limitation: 'Reasoning could not be safely composed; this recovery output is limited to supplied evidence and general assessment/communication guidance.',
  emergency: 'General emergency guidance: The reported emergency concern supports immediate team-level awareness and assessment through local emergency pathways. If breathing or circulation is absent or ineffective, the facility emergency response pathway applies; those findings are not assumed unless reported.',
  emergencyTeaching: 'General physiology: Effective breathing and circulation support oxygen delivery. Loss of either can compromise organ function; emergency assessment and response follow local protocol.',
  reassessment: 'General reassessment guidance: Supported directions alone do not establish overall recovery or an intervention effect. Verify relevant findings not reassessed rather than assuming they remain unchanged.',
  unclassified: 'Some supplied values could not be reliably classified. Verify units and measurement context before using those values for patient-specific interpretation.',
});

function matches(ledger, concept, test = () => true) {
  if (ledger.conflicts.some(c => c.concept === concept || c.concept === 'unresolved')) return [];
  return ledger.atoms.filter(a => a.concept === concept && a.temporal === 'current' && !a.negative && !a.unknown && !a.unclassified && test(a));
}
function trend(ledger, concept, dir) {
  if (ledger.conflicts.some(c => c.concept === concept || c.concept === 'unresolved')) return [];
  return ledger.comparisons.filter(c => c.concept === concept && c.direction === dir);
}
function refs(...sets) { return [...new Set(sets.flat().map(item => item.evidenceId))]; }
function all(...sets) { return sets.every(set => set.length) ? refs(...sets) : []; }
function extremityCool(ledger, atoms) {
  return atoms.filter(a => /extremit/i.test(a.text) || /extremit/i.test(ledger.records.find(r => r.id === a.evidenceId)?.label || ''));
}
function clinicalContext(ledger) {
  const ph = matches(ledger, 'ph', a => a.value && Math.max(a.value.low, a.value.high) < 7.35);
  const co2 = matches(ledger, 'paco2', a => a.value && Math.min(a.value.low, a.value.high) > 45 && a.value.unit === 'mmhg');
  const mentation = matches(ledger, 'mentation');
  const focal = matches(ledger, 'focal');
  const cool = matches(ledger, 'cool'), refill = matches(ledger, 'refill');
  const peripheral = [...cool, ...matches(ledger, 'clammy'), ...refill];
  const symptoms = matches(ledger, 'symptom');
  const pressure = [...trend(ledger, 'bp', 'decreasing'), ...trend(ledger, 'map', 'decreasing')];
  const renal = [...trend(ledger, 'creatinine', 'increasing'), ...trend(ledger, 'urine', 'decreasing')];
  const metabolic = trend(ledger, 'lactate', 'increasing');
  const output = trend(ledger, 'ci', 'decreasing');
  const organSets = [renal, metabolic, output, mentation, peripheral].filter(set => set.length);
  return { ph, co2, mentation, focal, cool, refill, peripheral, symptoms, pressure, renal, metabolic, output,
    respiratory: all(ph, co2),
    respiratoryWorsening: all(ph, co2, trend(ledger, 'ph', 'decreasing'), trend(ledger, 'paco2', 'increasing')),
    bedside: all(mentation, peripheral, symptoms),
    systemic: pressure.length && organSets.length >= 2 ? refs(pressure, ...organSets) : [],
    rhythm: all(matches(ledger, 'rhythm'), trend(ledger, 'hr', 'increasing'), pressure, [...symptoms, ...peripheral, ...mentation]),
    acuteFocal: focal.some(a => /\bnew\s+(?:(?:left|right|unilateral)\s+)?(?:slurred speech|speech change|facial asymmetry|(?:arm|leg|facial)\s+weakness|focal (?:weakness|deficit|neurologic))/i.test(a.text)) ? refs(focal) : [],
  };
}

// Each rule is a small clinical clause, not a case narrative. Selection returns
// exactly the evidence dependencies that justify the interpretation. Guidance
// and hypothetical findings have separate roles and cannot become observations.
const RULES = [
  { id: 'respiratory', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['ph', 'paco2'],
    select: (l, c) => c.respiratory,
    text: 'Given the reported acidemia and elevated PaCO2 pattern, impaired ventilation is an important physiologic consideration. The pattern supports respiratory acidemia without establishing a definitive diagnosis or cause.' },
  { id: 'respiratory_worsening', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['ph', 'paco2'], temporal: 'ph decreasing; paco2 increasing',
    select: (l, c) => c.respiratoryWorsening,
    text: 'The rising PaCO2 with falling pH supports worsening ventilation with respiratory acidemia. These observations alone do not establish a cause.' },
  { id: 'hypercapnia_mentation', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['ph', 'paco2', 'mentation'],
    select: (l, c) => c.respiratory.length ? all(c.co2, c.mentation.filter(a => /drowsy/i.test(a.text))) : [],
    text: 'Hypercapnia may be contributing to drowsiness. General discrimination: medication or sedation exposure, neurologic and metabolic contributors, fatigue and baseline status may also matter when present; retain supplied known and negative findings rather than assuming those details are unknown.' },
  { id: 'hypercapnia_other_mentation', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['ph', 'paco2', 'mentation'],
    select: (l, c) => c.respiratory.length && !c.mentation.some(a => /drowsy/i.test(a.text)) ? all(c.co2, c.mentation) : [],
    text: 'Hypercapnia may contribute to the reported altered mentation. General discrimination: correlate supplied medication/sedation, neurologic, metabolic and fatigue-related context; do not turn known or negative findings into unknown information.' },
  { id: 'respiratory_assessment', section: 'Assess first', role: 'assessment_guidance', concepts: ['ph', 'paco2'],
    select: (l, c) => c.respiratory,
    text: 'Assess depth and effectiveness of breathing, air movement, work of breathing and ability to sustain effort. Correlate oxygenation with ventilation; saturation alone cannot establish adequate CO2 clearance.' },
  { id: 'respiratory_teaching', section: 'Teach me why', role: 'generic_physiology', concepts: ['ph', 'paco2'],
    select: (l, c) => c.respiratory,
    text: 'General physiology: Tachypnea does not guarantee effective ventilation. Rising PaCO2 with falling pH can indicate that ventilation is not keeping pace with CO2 production. A short-interval bicarbonate change should not automatically be labeled renal compensation; baseline status, timing, measurement variation and mixed processes may matter.' },
  { id: 'respiratory_conditional', section: 'Monitor and trend', role: 'conditional_future', concepts: ['ph', 'paco2'],
    select: (l, c) => c.respiratory,
    text: 'If responsiveness or breathing effectiveness declines alongside worsening ventilation, concern would increase. Those future findings are not assumed present.' },
  { id: 'focal', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['focal'],
    select: (l, c) => refs(c.focal),
    text: 'The reported focal neurologic findings make a localized neurologic process relevant; the etiology is not established by this pattern alone. The supplied clinical context remains important; observation is not a new diagnosis.' },
  { id: 'mentation_changed', section: 'Interpretation', role: 'reported_fact', concepts: ['mentation'],
    select: (l, c) => refs(c.mentation.filter(a => /mental status:\s*changed/i.test(a.text))),
    text: 'Mental status is reported as changed; its significance remains uncertain.' },
  { id: 'focal_assess', section: 'Assess first', role: 'assessment_guidance', concepts: ['focal'],
    select: (l, c) => refs(c.focal),
    text: 'Compare side-to-side strength, facial symmetry, speech/language and responsiveness. Clarify recognition separately from exact symptom onset and last known well; assess glucose context, exposures and available neurologic evaluation without assuming a result.' },
  { id: 'focal_teaching', section: 'Teach me why', role: 'generic_physiology', concepts: ['focal'],
    select: (l, c) => refs(c.focal),
    text: 'General physiology: Focal findings can suggest a localized neurologic process rather than diffuse dysfunction alone. Distribution, progression, onset and bedside metabolic context help distinguish possibilities without establishing a diagnosis.' },
  { id: 'focal_conditional', section: 'Monitor and trend', role: 'conditional_future', concepts: ['focal'],
    select: (l, c) => refs(c.focal),
    text: 'If focal findings progress, additional deficits appear or responsiveness declines, concern would increase; do not document those conditional findings as observed.' },
  { id: 'peripheral', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['cool', 'refill'],
    select: (l, c) => refs(c.peripheral),
    text: 'The reported peripheral finding makes peripheral perfusion assessment relevant, but it does not establish systemic perfusion failure or its cause.' },
  { id: 'both_peripheral', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['cool', 'refill'],
    select: (l, c) => all(extremityCool(l, c.cool), c.refill),
    text: 'The reported findings, interpreted as cool extremities and delayed capillary refill, make peripheral perfusion adequacy an important consideration; context and reassessment remain necessary.' },
  { id: 'cool_extremities', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['cool'],
    select: (l, c) => refs(extremityCool(l, c.cool)),
    text: 'Reported cool extremities warrant focused peripheral perfusion assessment; this finding alone does not establish direction or cause.' },
  { id: 'bedside', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['mentation', 'cool', 'refill', 'symptom'],
    select: (l, c) => c.bedside,
    text: 'The combination of reported mentation, symptoms and peripheral findings may reflect impaired circulation or another systemic process. The cause is not established; single current measurements do not establish trends.' },
  { id: 'systemic', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['bp', 'map', 'creatinine', 'urine', 'lactate', 'ci', 'mentation', 'cool', 'refill'], temporal: 'pressure decreasing; at least two independent warning domains',
    select: (l, c) => c.systemic,
    text: 'The supported hemodynamic change with converging warning domains may reflect worsening systemic perfusion with end-organ warning signs. This does not establish the cause or mechanism.' },
  { id: 'perfusion_assess', section: 'Assess first', role: 'assessment_guidance', concepts: ['cool', 'refill', 'bp', 'map', 'mentation'],
    select: (l, c) => refs(c.peripheral, c.pressure, c.bedside, c.systemic),
    text: 'Reassess measurement reliability, pulses, skin findings, capillary refill and responsiveness. Clarify fluid balance, bleeding assessment, medication exposure and prior interventions; these distinguish circulatory from other contributors without assuming their presence.' },
  { id: 'perfusion_teaching', section: 'Teach me why', role: 'generic_physiology', concepts: ['cool', 'refill', 'bp', 'map'],
    select: (l, c) => refs(c.peripheral, c.pressure, c.bedside, c.systemic),
    text: 'General physiology: Organ perfusion depends on flow as well as pressure. Peripheral findings and organ-function context can help assess adequacy, while an isolated measurement cannot prove the mechanism or causality.' },
  { id: 'renal_both', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['creatinine', 'urine'], temporal: 'creatinine increasing; urine decreasing',
    select: l => all(trend(l, 'creatinine', 'increasing'), trend(l, 'urine', 'decreasing')),
    text: 'The rising creatinine and falling urine output may indicate renal or end-organ deterioration, but do not establish a specific etiology.' },
  { id: 'renal_creatinine', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['creatinine'], temporal: 'creatinine increasing',
    select: l => trend(l, 'urine', 'decreasing').length ? [] : refs(trend(l, 'creatinine', 'increasing')),
    text: 'The rising creatinine may be relevant to renal or end-organ function; the supplied comparison does not establish a cause.' },
  { id: 'urine_decreasing', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['urine'], temporal: 'urine decreasing',
    select: l => refs(trend(l, 'urine', 'decreasing')),
    text: 'The falling urine output warrants renal/perfusion and measurement-interval reassessment; it does not establish a specific cause.' },
  { id: 'urine_interval', section: 'Monitor and trend', role: 'qualified_interpretation', concepts: ['urine'],
    select: l => refs(matches(l, 'urine', a => a.intervalMeasurement && !l.comparisons.some(c => c.evidenceId === a.evidenceId && c.direction !== 'unknown'))),
    text: 'The reported urine amount is a single interval measurement and does not establish direction.' },
  { id: 'rhythm', section: 'Interpretation', role: 'qualified_interpretation', concepts: ['rhythm', 'hr', 'bp', 'map', 'symptom', 'cool', 'mentation'], temporal: 'rate increasing; pressure decreasing',
    select: (l, c) => c.rhythm,
    text: 'The reported rhythm context and rate change with declining pressure and supported tolerance findings may reflect hemodynamic intolerance. A monitor observation alone does not establish the exact rhythm or cause; association does not prove causality.' },
  { id: 'rhythm_assess', section: 'Assess first', role: 'assessment_guidance', concepts: ['rhythm'],
    select: l => refs(matches(l, 'rhythm')),
    text: 'Clarify the rhythm with available clinical assessment and rhythm data rather than assigning a diagnosis. Assess physiologic tolerance through pressure, symptoms, mentation and peripheral perfusion; clarify exposure and device context.' },
  { id: 'rhythm_teaching', section: 'Teach me why', role: 'generic_physiology', concepts: ['rhythm', 'hr', 'bp', 'map', 'symptom', 'cool', 'mentation'],
    select: (l, c) => c.rhythm,
    text: 'General physiology: Rhythm and rate can affect ventricular filling and effective cardiac output. Pressure, symptoms, mentation and peripheral perfusion help assess tolerance; the monitor label alone cannot establish the mechanism or cause.' },
  { id: 'electrolyte_current', section: 'Monitor and trend', role: 'qualified_interpretation', concepts: ['potassium', 'magnesium'],
    select: l => all(matches(l, 'potassium', a => !l.comparisons.some(c => c.concept === a.concept && c.direction !== 'unknown')), matches(l, 'magnesium', a => !l.comparisons.some(c => c.concept === a.concept && c.direction !== 'unknown'))),
    text: 'The current potassium and magnesium are single measurements; they do not establish trends or a causal relationship.' },
  { id: 'oxygen_unchanged', section: 'Monitor and trend', role: 'reported_fact', concepts: ['oxygen'], temporal: 'explicitly unchanged',
    select: l => refs(trend(l, 'oxygen', 'unchanged').filter(c => !/room air/i.test(c.current))),
    text: 'Oxygen support remained unchanged in the supplied comparison.' },
  { id: 'oxygen_room_air', section: 'Monitor and trend', role: 'reported_fact', concepts: ['oxygen'], temporal: 'explicitly unchanged',
    select: l => refs(trend(l, 'oxygen', 'unchanged').filter(c => /^room air$/i.test(c.current.trim()))),
    text: 'Oxygen support remained room air in the supplied comparison. Oxygen support remained unchanged.' },
  { id: 'rhythm_onset_unknown', section: 'Missing information', role: 'missing_information', concepts: ['onset'],
    select: l => l.atoms.some(a => a.concept === 'onset' && a.temporal === 'current' && !a.unknown) || l.conflicts.some(c => c.concept === 'onset' || c.concept === 'unresolved') ? [] : refs(l.atoms.filter(a => a.concept === 'onset' && a.temporal === 'current' && a.reportedUnknown && /exact rhythm onset/i.test(a.text))),
    text: 'Exact rhythm onset is unknown as reported; recognition does not establish onset.' },
  { id: 'wbc_current', section: 'Monitor and trend', role: 'reported_fact', concepts: ['wbc'],
    select: l => l.comparisons.some(c => c.concept === 'wbc' && c.direction !== 'unknown') ? [] : refs(matches(l, 'wbc', a => Boolean(a.value))),
    text: l => 'Current WBC is reported as ' + matches(l, 'wbc', a => Boolean(a.value))[0].text + '; no direction is inferred.' },
  { id: 'infection', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['infection'],
    select: l => refs(matches(l, 'infection')),
    text: 'The supplied systemic/infectious context makes an infectious process a possible contributor. These observations alone do not establish sepsis, septic shock, pneumonia or a confirmed source; supplied diagnoses remain reported context.' },
  { id: 'low_pressure_mentation', section: 'Possible patterns', role: 'qualified_interpretation', concepts: ['bp', 'mentation'],
    select: (l, c) => all(matches(l, 'bp', a => a.value && (a.value.shape === 'pair' ? a.value.low : Math.max(a.value.low, a.value.high)) < 90 && a.value.unit === 'mmhg'), c.mentation),
    text: 'Given reported altered mentation with low pressure, cerebral perfusion adequacy may be relevant. General principle: a single pressure without a baseline cannot establish a trend or prove why mentation changed.' },
  { id: 'low_pressure_teaching', section: 'Teach me why', role: 'generic_physiology', concepts: ['bp', 'mentation'],
    select: (l, c) => all(matches(l, 'bp', a => a.value && (a.value.shape === 'pair' ? a.value.low : Math.max(a.value.low, a.value.high)) < 90 && a.value.unit === 'mmhg'), c.mentation),
    text: 'General physiology: Brain function depends on adequate blood flow and oxygen delivery. Pressure is one part of perfusion assessment; it does not establish the cause of altered mentation. Neurologic findings, ventilation, glucose and reported exposures can help distinguish contributors.' },
];
freeze(RULES);

function nodesFor(ledger, minimal) {
  if (minimal) return [];
  const context = clinicalContext(ledger);
  return RULES.flatMap(rule => {
    const evidenceIds = rule.select(ledger, context);
    return evidenceIds.length ? [{ ruleId: rule.id, section: rule.section, role: rule.role,
      requiredConcepts: rule.concepts, evidenceIds, temporalRequirement: rule.temporal || null,
      incompatibleEvidence: 'conflicting, negative, unknown, or earlier-only dependencies',
      text: typeof rule.text === 'function' ? rule.text(ledger) : rule.text }] : [];
  });
}
function titleFor(ledger, nodes, reassessment) {
  const ids = new Set(nodes.map(n => n.ruleId));
  if (ids.has('focal') && clinicalContext(ledger).acuteFocal.length) return 'Acute focal neurologic deterioration';
  if (ids.has('respiratory_worsening')) return 'Worsening ventilation with respiratory acidemia';
  if (ids.has('respiratory')) return 'Reported respiratory acidemia pattern';
  if (ids.has('bedside')) return 'Converging circulation and bedside warning signs';
  if (ids.has('rhythm')) return matches(ledger, 'rhythm').some(a => /\bnew\s+(?:rapid\s+)?(?:irregular\s+)?rhythm\b/i.test(a.text))
    ? 'New rhythm and rate change with hemodynamic intolerance' : 'Reported rhythm and rate concern with hemodynamic intolerance';
  if (ids.has('systemic')) return 'Worsening systemic perfusion with end-organ warning signs';
  return reassessment ? 'Latest verified bedside findings' : 'Reported findings requiring assessment';
}
function createDocument(ledger, urgency, reassessment, minimal, emergency = false) {
  const nodes = nodesFor(ledger, minimal);
  const title = emergency ? 'Reported emergency concern' : minimal ? 'Reported findings requiring assessment' : titleFor(ledger, nodes, reassessment);
  const titleRule = nodes.find(n => ({ focal: ['Acute focal neurologic deterioration'], respiratory_worsening: ['Worsening ventilation with respiratory acidemia'], respiratory: ['Reported respiratory acidemia pattern'], bedside: ['Converging circulation and bedside warning signs'], rhythm: ['New rhythm and rate change with hemodynamic intolerance', 'Reported rhythm and rate concern with hemodynamic intolerance'], systemic: ['Worsening systemic perfusion with end-organ warning signs'] })[n.ruleId]?.includes(title));
  return freeze({ version: 2, urgency, reassessment: Boolean(reassessment), minimal: Boolean(minimal), emergency: Boolean(emergency),
    title, titleProvenance: { role: titleRule ? 'qualified_interpretation' : 'general_framing', evidenceIds: titleRule?.evidenceIds || [], temporalRequirement: titleRule?.temporalRequirement || null },
    facts: ledger.records.map(record => ({ evidenceId: record.id, role: record.semanticRole, text: record.text })),
    clauses: nodes, conflicts: ledger.conflicts.length, unclassifiedEvidenceCount: ledger.atoms.filter(a => a.unclassified).length,
    comparisonStatus: ledger.comparisons.length || ledger.atoms.some(a => a.concept === 'baseline' && !a.unknown) || ledger.records.some(r => /\b(?:previous|earlier|compared|than|from\b.*\bto)\b/i.test(r.text)) ? 'supplied' : 'none' });
}
function render(document) {
  const sections = ['Assess first', 'Possible patterns', 'Missing information', 'Monitor and trend', 'Escalation triggers', 'SBAR-ready summary', 'Teach me why'];
  const defaults = { 'Assess first': GENERAL.assess, 'Possible patterns': GENERAL.patterns,
    'Missing information': GENERAL.missing, 'Monitor and trend': document.reassessment ? GENERAL.monitor + ' ' + GENERAL.reassessment : GENERAL.monitor, 'Escalation triggers': document.emergency ? GENERAL.high + ' ' + GENERAL.emergency : document.urgency === 'HIGH' ? GENERAL.high : GENERAL.other,
    'SBAR-ready summary': GENERAL.sbar, 'Teach me why': document.emergency ? GENERAL.emergencyTeaching : GENERAL.teaching };
  const interpretations = document.clauses.filter(n => n.section === 'Interpretation').map(n => n.text);
  const observed = document.facts.filter(f => f.role !== 'conditional_context');
  const conditionalContext = document.facts.filter(f => f.role === 'conditional_context');
  return 'Urgency Level: ' + document.urgency + '\n\n**Priorities**\n### 1 · ' + document.title
    + '\nRelevance: ' + (document.urgency === 'HIGH' ? 'High priority' : 'Important')
    + '\nEvidence below is user-reported and unverified.\nObserved:\n'
    + (observed.length ? observed.map(f => f.text.split('\n').map(line => '    - ' + (f.role === 'reported_fact' ? '' : 'User-reported context only: ') + line).join('\n')).join('\n') : document.facts.length ? 'No reliably classified observed findings were supplied.' : GENERAL.empty)
    + '\nInterpretation: ' + interpretations.concat(GENERAL.interpretation.replace(/^Interpretation: /, '')).join(' ')
    + (document.comparisonStatus === 'none' ? ' No earlier comparison is established.' : '')
    + (document.conflicts ? ' ' + GENERAL.conflict : '')
    + (document.unclassifiedEvidenceCount ? ' ' + GENERAL.unclassified : '')
    + (document.minimal ? ' ' + GENERAL.limitation : '')
    + '\nAssess now:\n- ' + GENERAL.assess
    + '\n\n' + sections.map(section => '**' + section + '**\n'
      + document.clauses.filter(n => n.section === section).map(n => n.text).concat(section === 'Missing information' ? conditionalContext.map(f => 'Conditional/inquiry context only: ' + f.text) : []).concat(defaults[section]).map(line => '- ' + line).join('\n')).join('\n\n')
    + '\n\nFor educational support only. Use your clinical judgment and follow local protocol.';
}

// Rebuild independently from original evidence. Neither a caller-supplied
// dependency list nor a conditional node can attest to itself.
function validateFallbackGrounding(source, document, output, expectedUrgency, context = {}) {
  const ledger = buildClinicalEvidenceLedger(source);
  const issues = [];
  if (!['LOW', 'MODERATE', 'HIGH'].includes(expectedUrgency) || document?.urgency !== expectedUrgency) issues.push('fallback_urgency_mismatch');
  if (document?.emergency !== Boolean(context.emergency) || (document?.emergency && expectedUrgency !== 'HIGH')) issues.push('fallback_context_mismatch');
  if (!document || document.version !== 2 || typeof document.reassessment !== 'boolean' || typeof document.minimal !== 'boolean') issues.push('fallback_document_invalid');
  if (!issues.length) {
    const canonical = createDocument(ledger, expectedUrgency, document.reassessment, document.minimal, Boolean(context.emergency));
    if (JSON.stringify(document) !== JSON.stringify(canonical)) issues.push('fallback_provenance_mismatch');
    if (output !== render(canonical)) issues.push('fallback_composition_mismatch');
  }
  return freeze({ accepted: !issues.length, issue_codes: issues, checked_evidence_count: ledger.records.length });
}
function recoverEvidenceFallback(source, urgency, document, output, reassessment = false, emergency = false) {
  let validation = validateFallbackGrounding(source, document, output, urgency, { emergency });
  if (!validation.accepted) {
    const ledger = buildClinicalEvidenceLedger(source);
    document = createDocument(ledger, urgency, reassessment, true, emergency);
    output = render(document);
    validation = validateFallbackGrounding(source, document, output, urgency, { emergency });
  }
  if (!validation.accepted) throw new Error('fallback_grounding_failed');
  return { output, document, metadata: { version: 2, mode: document.minimal ? 'minimal' : 'normal', ...validation } };
}
function composeEvidenceFallback(source, urgency, options = {}) {
  const ledger = buildClinicalEvidenceLedger(source);
  let document;
  try { document = createDocument(ledger, urgency, options.reassessment, false, options.emergency); }
  catch { document = createDocument(ledger, urgency, options.reassessment, true, options.emergency); }
  return { ...recoverEvidenceFallback(source, urgency, document, render(document), options.reassessment, options.emergency), ledger };
}
module.exports = { composeEvidenceFallback, recoverEvidenceFallback, validateFallbackGrounding };
