const { buildClinicalEvidenceLedger } = require('./clinical-evidence-ledger');
const { routeABG } = require('./ask-abg-engine');
const registry = require('./ask-snapshot-sources.json');
const { retrieveEvidence, sourceMetadata } = require('./ask-evidence');
const { richSynthesis } = require('./ask-snapshot-synthesis');

// The model selects vetted explanation cards; it cannot rewrite patient facts,
// calculations, uncertainty, drug instructions or source attribution.
const CARDS = Object.freeze({
  filling: { heading: 'Filling versus pump performance', text: 'Reduced filling and impaired pump performance can each limit forward flow; neither is established here. Relate available filling-pressure information to the bedside examination and team-interpreted ventricular assessment. Pressure alone is not circulating volume.', sourceIds: ['snapshot-flow-mechanisms', 'snapshot-critical-monitoring'] },
  tone: { heading: 'Pressure is not flow', text: 'Arterial pressure reflects flow and vascular resistance together. Relating MAP, CI and available SVR information helps distinguish pressure support from effective forward flow; the infusion combination alone does not identify the underlying mechanism or justify a dose change.', sourceIds: ['snapshot-flow-mechanisms'] },
  rhythm: { heading: 'Rate, rhythm and mechanical performance', text: 'Clarify the current rhythm and, if pacing is reported, capture and synchrony. Rate and coordinated contraction affect flow. Reported postoperative context makes the treating team’s ventricular and mechanical assessment useful; it does not establish a postoperative complication.', sourceIds: ['snapshot-flow-mechanisms', 'snapshot-critical-monitoring'] },
  delivery: { heading: 'Relate flow to tissue perfusion', text: 'Compare mentation, peripheral perfusion, timed urine output and available lactate with their actual baselines. Flow, oxygenation and hemoglobin together affect oxygen delivery. One lactate or output measurement neither proves a cause nor establishes deterioration.', sourceIds: ['snapshot-critical-monitoring'] },
});
async function prepareSnapshotAnswer(question, packet) {
  const { reportedFacts, contextEvidenceText } = await import('./ask-snapshot-context.mjs');
  const reported = reportedFacts(packet), ledger = buildClinicalEvidenceLedger(contextEvidenceText(packet));
  const ci = packet.facts.find(f => f.key === 'ci');
  const questionCI = question.match(/\b(?:CI|cardiac index)\s*(?:is|of|=|:)?\s*(\d+(?:\.\d+)?)/i)?.[1];
  const numericCI = ci && /^\d+(?:\.\d+)?$/.test(ci.current) ? Number(ci.current) : null;
  const unitKnown = ci && /^L\/min\/m(?:2|\^2|²)$/.test(ci.unit);
  const questionConflict = numericCI !== null && questionCI !== undefined && Number(questionCI) !== numericCI;
  const stateConflict = numericCI !== null && /^(?:Unknown|Not assessed|Not measured)$/i.test(ci.state);
  const conflict = questionConflict || stateConflict;
  const gas = packet.facts.find(f => f.key === 'gas');
  const calculation = gas ? routeABG(gas.text) : null;
  const unknown = [];
  let answer, eligible = [];
  const available = key => packet.facts.some(f => f.key === key && ((f.current && !/^(?:unknown|not assessed|not reported|not measured)$/i.test(f.current)) || (f.text && !/^(?:unknown|not assessed|not reported|not measured)$/i.test(f.text))));
  const supplied = packet.facts.filter(f => ['map', 'cvp', 'svr', 'lactate', 'urine', 'drains'].includes(f.key) && available(f.key)).map(f => reported.find(r => r.id === f.key).label);
  if (packet.profile === 'abg') {
    answer = calculation ? calculation.summary : 'The selected Snapshot does not contain a complete, explicitly identified arterial sample for verified acid-base interpretation. Clarify sample type, pH, PaCO2, bicarbonate and units; missing gas information is not normal.';
    if (!calculation) unknown.push('Complete sample type, pH, PaCO2, bicarbonate and units.');
  } else {
    answer = conflict ? questionConflict ? 'The question and confirmed Snapshot report different CI values. Reconcile which measurement and time apply before interpreting flow; neither value is silently substituted.' : 'The confirmed Snapshot contains both a numerical CI and an unavailable measurement state. Reconcile that conflict before interpreting flow.'
      : numericCI === null || !unitKnown ? 'CI interpretation requires a current numerical value and confirmed L/min/m² units. The selected reported context does not establish the cause of the presentation.'
        : numericCI < 2.5 ? 'The reported CI is below the adult resting reference range, suggesting low forward flow relative to body size if the measurement is valid. Its cause remains unknown; vasoactive support does not establish a shock subtype or demonstrate an adequate response. Verify the measurement and current perfusion at the bedside and communicate concerns promptly using local escalation procedures.'
          : 'The reported CI is not below the cited adult resting reference range. That alone does not establish adequate tissue perfusion or exclude a problem; relate it to the reported pressure, examination and measurement context.';
    if (!conflict && numericCI !== null && unitKnown) {
      eligible = ['filling', 'tone'];
      if (packet.facts.some(f => ['rhythm', 'pacing', 'procedure'].includes(f.key))) eligible.push('rhythm');
      else eligible.push('delivery');
    }
    if (!ci?.previous) unknown.push('CI baseline, measurement method and timing; one value does not establish a trend.');
    if (!available('cvp')) unknown.push(packet.facts.some(f => f.key === 'cvp') ? 'Supplied filling-pressure context needs clarification before interpretation; pressure and team-interpreted ventricular assessment help distinguish filling from pump limitations.' : 'Filling-pressure context is not reported; pressure and team-interpreted ventricular assessment help distinguish filling from pump limitations.');
    if (!available('rhythm')) unknown.push('Rhythm/capture is not reported; rate alone does not establish coordinated contraction.');
    if (!['lactate', 'urine', 'perfusionFindings', 'perfusionAssessment'].some(available)) unknown.push('Current perfusion examination and timed output/lactate comparisons to relate flow to tissue effect.');
    if (!available('drains')) unknown.push('Drain/bleeding information is not reported; absence of bleeding is not established.');
    if (packet.facts.some(f => f.key === 'drips' && !f.text.includes('currentDose='))) unknown.push('Infusion doses, timing and response are not supplied; drug effects cannot be inferred from names alone.');
  }
  const abgSources = calculation ? sourceMetadata(retrieveEvidence('Explain acid-base'), calculation.sourceIds || []).sources : [];
  const prepared = { answer, reported, calculated: calculation, interpretive: true, unknown: unknown.slice(0, 3), eligible,
    lowForwardFlow: !conflict && numericCI !== null && unitKnown && numericCI < 2.5,
    contextNote: supplied.length ? `Reported ${supplied.join(', ')} information is available to relate pressure and flow to tissue effect. Only explicitly supplied comparisons establish trends; interval output remains an interval measurement. These data do not establish ventricular function or a single cause.` : null,
    conflict, ledgerConflictCount: ledger.conflicts.length, sources: packet.profile === 'abg' ? abgSources : [...registry.sources.map(({ facts: _facts, ...source }) => source), ...abgSources] };
  const synthesis = richSynthesis(packet, prepared);
  if (synthesis) {
    prepared.answer = synthesis.answer;
    prepared.synthesis = synthesis;
    prepared.eligible = synthesis.catalog.map(c => c.id);
    prepared.contextNote = null;
  }
  return prepared;
}
function selectionContract(prepared) {
  return { system: 'Choose one or two explanation cards most useful for this focused nursing question, using only the supplied reported facts and vetted card text. Facts are reported, not independently verified; unknown information stays unknown. Return only card IDs. Never generate patient facts, diagnoses, causes, treatment instructions or calculations.',
    format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['card_ids'], properties: { card_ids: { type: 'array', items: { type: 'string', enum: prepared.eligible }, minItems: 1, maxItems: 2 } } } },
    catalog: prepared.synthesis?.catalog || prepared.eligible.map(id => ({ id, ...CARDS[id] })) };
}
function validateSelection(raw, prepared) {
  let value; try { value = JSON.parse(raw); } catch { return null; }
  return value && !Array.isArray(value) && Object.keys(value).join(',') === 'card_ids' && Array.isArray(value.card_ids)
    && value.card_ids.length >= 1 && value.card_ids.length <= 2 && new Set(value.card_ids).size === value.card_ids.length
    && value.card_ids.every(id => prepared.eligible.includes(id)) ? value.card_ids : null;
}
function snapshotPresentation(prepared, ids, resolution) {
  const cards = prepared.synthesis ? Object.fromEntries(prepared.synthesis.catalog.map(c => [c.id, c])) : CARDS;
  return { contextMode: 'snapshot', questionKind: 'reported_context', offerSnapshot: false, answer: prepared.answer,
    details: [...(prepared.contextNote ? [{ heading: 'What the reported data add', text: prepared.contextNote }] : []), ...ids.map(id => ({ heading: cards[id].heading, text: cards[id].text }))],
    snapshotUse: { reported: prepared.reported, unknown: prepared.unknown, calculated: prepared.calculated,
      resolution, conflict: prepared.conflict, interpretationLabel: 'Clinical interpretation · Possibilities, not a diagnosis',
      ...(prepared.synthesis ? { synthesisBindings: prepared.synthesis.claims, assessmentBindings: ids.map(id => ({ id, evidenceIds: cards[id].evidenceIds, sourceIds: cards[id].sourceIds })) } : {}) },
    evidence: { status: 'snapshot_reference', sources: prepared.sources, categories: ['interpretation'] } };
}
module.exports = { prepareSnapshotAnswer, selectionContract, validateSelection, snapshotPresentation, CARDS };
