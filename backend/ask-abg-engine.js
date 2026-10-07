const registry = require('./ask-source-registry.json');
const rules = registry.sources.find(s => s.id === 'merck-acid-base').facts;
const RULE_SOURCE = 'merck-acid-base', PHYSIOLOGY_SOURCE = 'merck-acid-base-regulation';
const CONSISTENCY_SOURCE = 'bja-henderson-hasselbalch';
const buffer = registry.sources.find(s => s.id === CONSISTENCY_SOURCE).facts;
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
const names = { pH: 'pH', paCO2: 'PaCO2', hco3: 'HCO3' };
const limitations = [
  'Approximate comparison rules, not diagnostic cutoffs. Clinical context and measurement variation matter.',
  'A single gas does not establish duration, baseline, cause, or the sequence of processes. Acute and chronic reference frameworks are alternatives, not a timeline.',
  'Confirm the values belong to the same arterial sample. ABG bicarbonate is generally calculated; serum chemistry bicarbonate is measured.',
  'This interprets acid-base patterns, not the underlying disease, oxygenation, or a treatment plan. Anion gap and delta analysis are not included.',
  'For an actual concerning change, use timely bedside assessment and the local team; do not delay care for an explanation.',
];
// Technical working envelope, deliberately broad; these are NOT clinical normal ranges or treatment thresholds.
const INPUT_ENVELOPE = { pH: [6, 8], paCO2: [5, 200], hco3: [1, 80] };
const CONSISTENCY_TOLERANCE_PH = 0.1; // Loose data-entry/same-sample safeguard, NOT a clinical decision threshold.
function bicarbonateCO2PH(paCO2, hco3) {
  if (![paCO2, hco3].every(Number.isFinite) || paCO2 <= 0 || hco3 <= 0) throw new RangeError('Buffer calculation requires positive explicit-unit values.');
  return buffer.pKa + Math.log10(hco3 / (buffer.CO2SolubilityForMmHg * paCO2));
}
function winterRange(hco3) {
  if (!Number.isFinite(hco3) || hco3 <= 0 || hco3 >= rules.metabolicAcidosisHCO3Below) throw new RangeError('Winter comparison requires a metabolic acidifying bicarbonate value.');
  const center = rules.winter.slope * hco3 + rules.winter.intercept;
  return [center - rules.winter.tolerance, center + rules.winter.tolerance];
}
function metabolicAlkalosisRange(hco3) {
  if (!Number.isFinite(hco3) || hco3 <= rules.metabolicAlkalosisHCO3Above) throw new RangeError('Metabolic alkalosis comparison requires bicarbonate above its source criterion.');
  return rules.metabolicAlkalosis.perHCO3Rise.map(slope => rules.referencePaCO2mmHg + slope * (hco3 - rules.referenceHCO3mmolL));
}
function respiratoryRanges(paCO2, direction) {
  if (!Number.isFinite(paCO2) || paCO2 <= 0 || !['acidosis', 'alkalosis'].includes(direction)
    || (direction === 'acidosis' ? paCO2 <= rules.referencePaCO2mmHg : paCO2 >= rules.respiratoryAlkalosisPaCO2Below)) throw new RangeError('Respiratory comparison requires the supported direction.');
  const spec = direction === 'acidosis' ? rules.respiratoryAcidosis : rules.respiratoryAlkalosis;
  const change = Math.abs(paCO2 - rules.referencePaCO2mmHg) / spec.perPaCO2mmHg;
  const ranges = direction === 'acidosis'
    ? { acute: spec.acuteHCO3Rise.map(n => rules.referenceHCO3mmolL + change * n), chronic: spec.chronicHCO3Rise.map(n => rules.referenceHCO3mmolL + change * n) }
    : { acute: spec.acuteHCO3Fall.map(n => rules.referenceHCO3mmolL - change * n).reverse(), chronic: spec.chronicHCO3Fall.map(n => rules.referenceHCO3mmolL - change * n).reverse() };
  return ranges;
}
function compare(measured, [lower, upper]) {
  // Only floating-point equality tolerance: classification never uses the rounded display interval.
  return measured < lower - 1e-9 ? 'below' : measured > upper + 1e-9 ? 'above' : 'within';
}
function clarification(issues, reported = null) {
  return { version: 'abg-engine-v1', status: 'clarification_required', reported, unitStatus: 'unconfirmed', issues,
    summary: 'Please clarify the arterial sample, labelled values and units before interpretation.', calculated: [], interpretive: null,
    limitations: ['No values or units were inferred. No clinical interpretation or AI explanation was generated.'], sourceIds: [] };
}
function interpretABG(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return clarification(['Provide a labelled arterial sample.']);
  const issues = [];
  for (const key of Object.keys(names)) {
    if (typeof input[key] !== 'number' || !Number.isFinite(input[key])) issues.push(`Provide one numeric ${names[key]} value.`);
    else if (input[key] < INPUT_ENVELOPE[key][0] || input[key] > INPUT_ENVELOPE[key][1]) issues.push(`Verify ${names[key]} with the lab; it is outside this engine's supported input envelope.`);
  }
  if (input.sampleType !== 'arterial') issues.push('Confirm these are arterial ABG values, not a VBG or mixed samples.');
  if (input.units?.paCO2 !== 'mmHg') issues.push('Specify PaCO2 in mmHg. This engine does not convert kPa.');
  if (!['mmol/L', 'mEq/L'].includes(input.units?.hco3)) issues.push('Specify HCO3 in mmol/L or mEq/L.');
  const reported = { values: { pH: input.pH, paCO2: input.paCO2, hco3: input.hco3 }, units: input.units || null, sampleType: input.sampleType || null };
  if (issues.length) return clarification(issues, reported);
  const { pH, paCO2, hco3 } = input;
  const calculatedPH = bicarbonateCO2PH(paCO2, hco3);
  const sampleConsistency = { ruleId: 'henderson_hasselbalch', calculatedPH: round(calculatedPH), absoluteDifference: round(Math.abs(pH - calculatedPH)),
    engineeringTolerancePH: CONSISTENCY_TOLERANCE_PH, sourceIds: [CONSISTENCY_SOURCE] };
  if (Math.abs(pH - calculatedPH) > CONSISTENCY_TOLERANCE_PH + 1e-9) {
    return { ...clarification(['The supplied pH, PaCO2 and HCO3 are not consistent within this engine\'s same-sample check. Verify lab values, units, sample timing and whether bicarbonate came from the ABG or chemistry. No value was corrected.'], reported), sampleConsistency };
  }
  const pHState = pH < rules.acidemiaPHBelow ? 'acidemia' : pH > rules.alkalemiaPHAbove ? 'alkalemia' : 'within_reference_interval';
  let primaryProcess = 'unresolved', summary;
  const calculated = [], additionalPatterns = [];
  function add(ruleId, label, range, measured, unit, formula, framework = null) {
    const item = { ruleId, label, formula, framework, expectedRange: range.map(round), measured, unit, comparison: compare(measured, range), sourceIds: [RULE_SOURCE] };
    calculated.push(item); return item;
  }
  if (pHState === 'acidemia' && hco3 < rules.metabolicAcidosisHCO3Below) {
    primaryProcess = paCO2 > rules.referencePaCO2mmHg ? 'combined_acidifying' : 'metabolic_acidosis';
    summary = primaryProcess === 'combined_acidifying' ? 'Acidemia with metabolic and respiratory acidifying components; their sequence is not established.' : 'Acidemia with a metabolic acidifying pattern.';
    const c = add('winter', 'Expected PaCO2', winterRange(hco3), paCO2, 'mmHg', '1.5 x reported HCO3 + 8, plus or minus 2');
    if (c.comparison === 'above') additionalPatterns.push('Reported PaCO2 is above the expected interval: pattern is consistent with an additional respiratory acidifying process.');
    else if (c.comparison === 'below') additionalPatterns.push('Reported PaCO2 is below the expected interval: pattern is consistent with an additional respiratory alkalinizing process.');
    else additionalPatterns.push('Reported PaCO2 is within the approximate expected compensation interval. This does not exclude every mixed process.');
  } else if (pHState === 'alkalemia' && hco3 > rules.metabolicAlkalosisHCO3Above) {
    primaryProcess = paCO2 < rules.respiratoryAlkalosisPaCO2Below ? 'combined_alkalinizing' : 'metabolic_alkalosis';
    summary = primaryProcess === 'combined_alkalinizing' ? 'Alkalemia with metabolic and respiratory alkalinizing components; their sequence is not established.' : 'Alkalemia with a metabolic alkalinizing pattern.';
    const range = metabolicAlkalosisRange(hco3);
    const c = add('metabolic_alkalosis', 'Expected PaCO2', range, paCO2, 'mmHg', '40 + (0.6 to 0.75) x (reported HCO3 - 24)');
    c.compensationCeiling = rules.metabolicAlkalosis.compensatoryPaCO2CeilingmmHg;
    if (range[1] > c.compensationCeiling) {
      c.comparison = 'outside_linear_model';
      c.label = 'Linear calculation (not an expected compensation interval)';
      additionalPatterns.push('The linear interval reaches beyond the source-described compensation ceiling. Do not use that interval alone to classify compensation.');
      if (paCO2 > c.compensationCeiling) additionalPatterns.push('Reported PaCO2 exceeds the source-described compensatory ceiling; an additional respiratory acidifying process needs consideration.');
    } else if (c.comparison === 'above') additionalPatterns.push('Reported PaCO2 is above the expected interval: pattern is consistent with an additional respiratory acidifying process.');
    else if (c.comparison === 'below') additionalPatterns.push('Reported PaCO2 is below the expected interval: pattern is consistent with an additional respiratory alkalinizing process.');
    else additionalPatterns.push('Reported PaCO2 is within the approximate expected compensation interval.');
  } else if ((pHState === 'acidemia' && paCO2 > rules.referencePaCO2mmHg) || (pHState === 'alkalemia' && paCO2 < rules.respiratoryAlkalosisPaCO2Below)) {
    const direction = pHState === 'acidemia' ? 'acidosis' : 'alkalosis';
    primaryProcess = `respiratory_${direction}`;
    summary = direction === 'acidosis' ? 'Acidemia with a respiratory acidifying pattern.' : 'Alkalemia with a respiratory alkalinizing pattern.';
    const ranges = respiratoryRanges(paCO2, direction);
    for (const framework of ['acute', 'chronic']) add(`respiratory_${direction}`, `${framework === 'acute' ? 'Acute' : 'Chronic'} reference HCO3`, ranges[framework], hco3, input.units.hco3,
      direction === 'acidosis' ? `24 + (${framework === 'acute' ? '1 to 2' : '3 to 4'}) x ((reported PaCO2 - 40) / 10)` : `24 - (${framework === 'acute' ? '1 to 2' : '4 to 5'}) x ((40 - reported PaCO2) / 10)`, framework);
    if (calculated.every(c => c.comparison === 'below')) additionalPatterns.push(direction === 'acidosis'
      ? 'Reported HCO3 is below both reference intervals. An additional metabolic acidifying process or limited adaptation needs consideration; duration is unknown.'
      : 'Reported HCO3 is below both reference intervals: an additional metabolic acidifying process needs consideration.');
    else if (calculated.every(c => c.comparison === 'above')) additionalPatterns.push(direction === 'alkalosis'
      ? 'Reported HCO3 is above both reference intervals. An additional metabolic alkalinizing process or limited adaptation needs consideration; duration is unknown.'
      : 'Reported HCO3 is above both reference intervals: an additional metabolic alkalinizing process needs consideration.');
    else additionalPatterns.push('Compare both reference frameworks without selecting a duration. Timing, baseline and clinical context remain necessary.');
  } else if (pHState === 'within_reference_interval') {
    primaryProcess = paCO2 >= rules.respiratoryAlkalosisPaCO2Below && paCO2 <= rules.referencePaCO2mmHg && hco3 >= rules.metabolicAcidosisHCO3Below && hco3 <= rules.metabolicAlkalosisHCO3Above ? 'no_direction_identified' : 'unresolved';
    summary = primaryProcess === 'no_direction_identified' ? 'pH is within the reference interval; no acidifying or alkalinizing direction is identified by this limited framework.' : 'pH is within the reference interval, but reported CO2 or bicarbonate is outside this framework. A simple primary process cannot be assigned reliably.';
    additionalPatterns.push('A reference-range pH does not exclude a mixed disorder and must not be labelled fully compensated from these values alone.');
  } else summary = 'pH is abnormal, but the supplied CO2 and bicarbonate do not establish a simple primary process in this framework. Verify the sample and assess the wider context.';
  return { version: 'abg-engine-v1', status: 'verified', reported, unitStatus: 'explicit', issues: [],
    interpretive: { pHState, primaryProcess, additionalPatterns }, summary, calculated, sampleConsistency, limitations: [...limitations], sourceIds: [RULE_SOURCE, CONSISTENCY_SOURCE] };
}
function routeABG(question) {
  const text = question.normalize('NFKC').replace(/\bHCO3[−-](?=\s|[:=])/gi, 'HCO3');
  if (/\b(?:urine|urinary|gastric|water) pH\b/i.test(text) && !/\bABG\b|\barterial\b/i.test(text)) return null;
  const hasValue = /\b(?:pH|PaCO2|HCO3)\s*(?:is|of|=|:)?\s*[-+]?\d/i.test(text);
  const requestedInterpretation = /\b(?:ABG|arterial (?:blood )?gas|blood gas)\b/i.test(text) && /\b(?:interpret|mean|pattern|results?|analy[sz]e)|\d/i.test(text);
  if (!hasValue && !requestedInterpretation) return null;
  const patterns = { pH: /\bpH\s*(?:is|of|=|:)?\s*([-+]?\d+(?:\.\d+)?)/gi,
    paCO2: /\bPaCO2\s*(?:is|of|=|:)?\s*([-+]?\d+(?:\.\d+)?)/gi,
    hco3: /\bHCO3\s*(?:is|of|=|:)?\s*([-+]?\d+(?:\.\d+)?)/gi };
  const captures = Object.fromEntries(Object.entries(patterns).map(([k, re]) => [k, [...text.matchAll(re)]]));
  const issues = [];
  if (/\bmm\s*Hg\b/i.test(text) && /\bkPa\b/i.test(text)) issues.push('Use one explicit PaCO2 unit; mixed unit expressions require clarification.');
  if (Object.values(captures).some(a => a.length > 1) || /(?:->|→|\bfrom\b[^.!?]{0,30}\bto\s+\d)/i.test(text)) issues.push('Provide one sample only; multiple values or comparisons require separate interpretation.');
  for (const [k, a] of Object.entries(captures)) {
    if (a.length !== 1) issues.push(`Provide exactly one labelled ${names[k]} value.`);
    else if (/^(?:[eE][-+]?\d|[,/]\d|\s*[-–]\s*\d|\.)/.test(text.slice(a[0].index + a[0][0].length))) issues.push(`Clarify the ${names[k]} value; ranges, shorthand and non-decimal notation are not parsed.`);
  }
  const values = Object.fromEntries(Object.entries(captures).map(([k, a]) => [k, a.length === 1 ? Number(a[0][1]) : undefined]));
  const suffix = key => captures[key].length === 1 ? text.slice(captures[key][0].index + captures[key][0][0].length) : '';
  const units = { paCO2: suffix('paCO2').match(/^\s*(mm\s*Hg|kPa)\b/i)?.[1]?.replace(/\s/g, ''),
    hco3: suffix('hco3').match(/^\s*(mmol\s*\/\s*L|mEq\s*\/\s*L)\b/i)?.[1]?.replace(/\s/g, '') };
  if (units.paCO2?.toLowerCase() === 'mmhg') units.paCO2 = 'mmHg';
  if (units.hco3?.toLowerCase() === 'mmol/l') units.hco3 = 'mmol/L';
  if (units.hco3?.toLowerCase() === 'meq/l') units.hco3 = 'mEq/L';
  const arterial = /\bABG\b|\barterial\b/i.test(text), venous = /\bVBG\b|\bvenous\b/i.test(text);
  if (issues.length) return clarification(issues);
  return interpretABG({ ...values, units, sampleType: arterial && !venous ? 'arterial' : null });
}
function teachingCatalog(result) {
  if (result.status !== 'verified') return [];
  const points = [
    { id: 'buffer_ratio', text: 'Blood pH depends on the relationship between bicarbonate and carbon dioxide, not either measurement alone. CO2 participates in the carbonic-acid buffer; ventilation regulates CO2 and renal handling regulates bicarbonate.', sourceIds: [PHYSIOLOGY_SOURCE] },
    { id: 'sample_context', text: 'Relate this one sample to the clinical assessment and any genuinely supplied prior results. The gas describes a pattern, not its cause or the time it began. Confirm whether bicarbonate is from the ABG calculation or serum chemistry before comparing discrepant results.', sourceIds: [RULE_SOURCE] },
  ];
  if (result.calculated.length) points.push({ id: 'comparison', text: 'The displayed measured-versus-expected comparison is a rule-based approximation. A value outside the expected response can support consideration of another acid-base process; it is not a disease diagnosis or a treatment decision.', sourceIds: [RULE_SOURCE] });
  if (result.calculated.some(c => c.framework)) points.push({ id: 'duration', text: 'Acute and chronic compensation frameworks describe different reference responses. A single bicarbonate result cannot choose the timeline or prove that adaptation is complete.', sourceIds: [RULE_SOURCE] });
  if (['metabolic_acidosis', 'combined_acidifying'].includes(result.interpretive.primaryProcess)) points.push({ id: 'metabolic_response', text: 'In a metabolic acidifying pattern, the expected respiratory response lowers CO2. The comparison asks whether that reported respiratory response fits the expected relationship, rather than assuming that a low CO2 automatically means adequate compensation.', sourceIds: [RULE_SOURCE, PHYSIOLOGY_SOURCE] });
  if (['metabolic_alkalosis', 'combined_alkalinizing'].includes(result.interpretive.primaryProcess)) points.push({ id: 'alkalinizing_response', text: 'In a metabolic alkalinizing pattern, the reference respiratory response raises CO2. Its source-described ceiling limits the linear model; an extreme calculation must not be treated as a target.', sourceIds: [RULE_SOURCE] });
  if (!result.calculated.length) points.push({ id: 'normal_scope', text: 'A pH inside its reference interval is not proof that every acid-base process is absent. Interacting processes can mask one another; this limited gas-only framework does not calculate anion gap or delta analysis.', sourceIds: [RULE_SOURCE] });
  return points;
}
function explanationRequest(result) {
  const catalog = teachingCatalog(result);
  return { catalog, system: 'Explain a VERIFIED rule-based ABG result by selecting useful source-backed teaching points. Return only point IDs from the supplied catalog. Do not generate prose, numbers, classifications, diagnoses, causes or new fields. Do not recalculate or reinterpret. Select one to three distinct points; prefer relevance to the verified comparison over generic readback. The backend owns every rendered word.\n' + JSON.stringify({ verifiedResult: result, catalog }),
    format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['points'], properties: {
      points: { type: 'array', items: { type: 'string', enum: catalog.map(p => p.id) } },
    } } } };
}
function selectExplanation(raw, result) {
  let parsed; try { parsed = JSON.parse(raw); } catch { return { accepted: false, points: [], codes: ['invalid_abg_explanation_selection'] }; }
  const catalog = teachingCatalog(result);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length !== 1 || !Array.isArray(parsed.points)
    || parsed.points.length < 1 || parsed.points.length > 3 || new Set(parsed.points).size !== parsed.points.length
    || parsed.points.some(id => typeof id !== 'string' || !catalog.some(p => p.id === id))) return { accepted: false, points: [], codes: ['invalid_abg_explanation_selection'] };
  return { accepted: true, points: parsed.points.map(id => catalog.find(p => p.id === id)), codes: [] };
}
module.exports = { interpretABG, routeABG, winterRange, metabolicAlkalosisRange, respiratoryRanges, bicarbonateCO2PH, CONSISTENCY_TOLERANCE_PH, compare, round, INPUT_ENVELOPE, teachingCatalog, explanationRequest, selectExplanation };
