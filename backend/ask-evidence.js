const registry = require('./ask-source-registry.json');
const { acidBaseContext } = require('./ask-acid-base');
const normalise = text => text.normalize('NFKC');
const routes = {
  acid_base: /\b(?:ABG|blood gas|acid[- ]base|acidemia|alkalemia|acidosis|alkalosis|bicarbonate|HCO3|PaCO2|Winter'?s)\b/i,
  lvedp: /\b(?:LVEDP|PAOP|PCWP|wedge pressure|preload|filling pressure|left ventricular end[- ]diastolic)\b/i,
  venous_oxygen: /\b(?:SvO2|ScvO2|mixed venous|central venous oxygen)\b/i,
  crrt: /\b(?:CRRT|PrisMax|Prismaflex|transmembrane|TMP|filter pressure|effluent pressure|return pressure|access pressure)\b/i,
};
function retrieveEvidence(question) {
  const text = normalise(question);
  const domains = Object.entries(routes).filter(([,re]) => re.test(text)).map(([domain]) => domain);
  if (!domains.length) return null;
  const sources = registry.sources.filter(s => domains.includes(s.domain));
  const unsupportedAction = /\b(?:give|administer|dose|titrate|bolus|infuse|disconnect|flush|irrigate|change the filter|change a filter|replace the filter|settings?|alarm limits?|threshold for changing|treat(?:ment)?)\b/i.test(text);
  const outsideHemodynamics = domains.includes('lvedp') && /\b(?:lactate|cardiac index|CI\s*\d|MAP\s*\d|shock|CABG)\b/i.test(text);
  const otherMachine = domains.includes('crrt') && /\b(?:Prismaflex|NxStage|Fresenius|multiFiltrate)\b/i.test(text);
  const unsupportedTopic = (domains.includes('acid_base') && /\b(?:anion gap|delta (?:gap|ratio)|albumin|osmolal|strong ion|Stewart|base excess)\b/i.test(text))
    || (domains.includes('crrt') && /\b(?:clearance|dialysate composition|replacement rate|ultrafiltration rate|anticoagulation|citrate|heparin|dose)\b/i.test(text));
  return { registryVersion: registry.version, domains, sources,
    coverage: unsupportedAction ? 'unsupported_action' : outsideHemodynamics ? 'partial_hemodynamics' : otherMachine ? 'other_device' : unsupportedTopic ? 'unsupported_topic' : 'concepts',
    deviceScope: domains.includes('crrt') ? 'PrisMax concepts only; no settings or procedures; other systems require their own IFU.' : null,
    calculations: domains.includes('acid_base') ? acidBaseContext(text) : null };
}
function sourceMetadata(pack, ids = pack.sources.map(s => s.id)) {
  return { status: 'curated_evidence', domains: pack.domains, coverage: pack.coverage, requiresVerification: true,
    registryVersion: pack.registryVersion, deviceScope: pack.deviceScope,
    sources: ids.map(id => pack.sources.find(s => s.id === id)).filter(Boolean).map(({ id, title, publisher, url, domain, updated, version, publication, accessed, doi, device }) =>
      ({ id, title, publisher, url, domain, updated, version, publication, accessed, ...(doi ? { doi } : {}), ...(device ? { device } : {}) })),
  };
}
function groundingContext(pack) {
  return JSON.stringify({ evidenceType: 'GENERAL_CLINICAL_REFERENCES_NOT_PATIENT_OBSERVATIONS',
    sources: pack.sources.map(({ id, domain, locator, excerpts, facts, factProvenance, device }) => ({ id, domain, locator, excerpts, facts, factProvenance, device })),
    calculationType: 'DETERMINISTIC_COMPARISONS_OF_EXPLICITLY_REPORTED_ARTERIAL_VALUES_NOT_DIAGNOSES',
    calculation: pack.calculations, coverage: pack.coverage, deviceScope: pack.deviceScope });
}
const GROUNDING_INSTRUCTIONS = `CURATED EVIDENCE MODE: Only the supplied short source excerpts and provenance-linked structured facts/rules support consequential teaching. These are general references, not patient findings. The sole user message is user-reported context, not verified information. Everything else about the patient is unknown. Do not augment this slice with unsourced model-memory thresholds, formulas, physiology, disease conclusions or operating instructions. Explain supported concepts usefully; state the scope limitation when relevant.
Use only source_ids actually supporting the answer, chosen from the supplied IDs. Do not invent source metadata, URLs, citations or extra fields. Return answer, details and source_ids. Source IDs do not certify your prose correct.
ABG: Treat deterministic arithmetic as approximate comparison under explicitly stated arterial units. Show the gas relationship and relevant uncertainty, not a definitive duration, compensation history or patient diagnosis. Both acute/chronic reference ranges are alternative frameworks, not inferred chronology. If units/sample/comparison are missing, say so; do not silently convert units or select a baseline. Do not calculate formulas yourself. Do not turn normal-looking values into proof that mixed processes are absent. Only the recorded comparison ranges/formulas are supported.
LVEDP: A pressure is not volume, myocardial function or a diagnosis. Use a reference interval only conditionally when mmHg and measurement meaning are established; do not imply LVEDP equals mean LAP/PCWP or determines fluid responsiveness. A single pressure does not establish causality, duration or trend.
VENOUS SATURATION: Confirm sampling site. Do not state a fixed ordering, fixed numeric gap, interchangeable values or universal target. A study population is not every patient.
CRRT: These manufacturer concepts apply to PrisMax; say this explicitly even in generic CRRT education. No assumption that other systems behave identically. Distinguish blood-side access/filter/return from fluid-side effluent/TMP. A pressure alone does not establish clotting; discolored effluent is not proof of clotting. Ask for the exact system/alarm context when needed. No settings, override, line manipulation, anticoagulation or replacement steps.
Do not repeat general reference material as an observed patient finding or established cause. No source-supported education exemption from the existing safety guards.`;
function groundedFormat(base, pack) {
  return { type: 'json_schema', schema: { ...base.schema, required: ['answer', 'details', 'source_ids'],
    properties: { ...base.schema.properties, source_ids: { type: 'array', description: 'One or more unique supplied source IDs actually used; no invented IDs.', items: { type: 'string', enum: pack.sources.map(s => s.id) } } } } };
}
function numbers(text) { return [...text.matchAll(/\b\d+(?:\.\d+)?\b/g)].map(m => Number(m[0])); }
function numericFacts(x) {
  if (typeof x === 'number') return [x];
  if (!x || typeof x !== 'object') return [];
  return Object.values(x).flatMap(numericFacts);
}
function validateGrounded(raw, pack, question) {
  let x; try { x = JSON.parse(raw); } catch { return { codes: ['invalid_grounded_schema'] }; }
  if (!x || typeof x !== 'object' || Array.isArray(x) || Object.keys(x).some(k => !['answer','details','source_ids'].includes(k))
    || !Array.isArray(x.source_ids) || !x.source_ids.length || new Set(x.source_ids).size !== x.source_ids.length
    || x.source_ids.some(id => !pack.sources.some(s => s.id === id))) return { codes: ['invalid_source_reference'] };
  const text = normalise([x.answer, ...(Array.isArray(x.details) ? x.details.map(d => d.text) : [])].join('\n'));
  const codes = [];
  // Narrow source-contract invariants, not a general-purpose clinical fact checker.
  const sentences = text.split(/[.!?]\s+|\n/);
  const conditionalMmHg = /\bif\b[^.!?\n]{0,100}\bmm\s*Hg\b/i.test(text);
  if (pack.domains.includes('lvedp') && /\bLVEDP\s*(?:is|=|:)?\s*\d/i.test(question) && !/\bmm\s*Hg\b/i.test(question)
    && /\b(?:is elevated|is high|above (?:the )?(?:normal|reference)|higher preload)\b/i.test(text) && !conditionalMmHg) codes.push('reported_pressure_units_unestablished');
  if (pack.calculations?.status === 'units_required' && /\b(?:supports|is|indicates)\b.{0,35}\brespiratory (?:acidosis|acidemia|alkalosis)\b/i.test(text)
    && !conditionalMmHg) codes.push('reported_gas_units_unestablished');
  if (sentences.some(s => /\b(?:this|your|the) (?:patient|person)\b.{0,35}\b(?:has|is in|is suffering from)\b/i.test(s)
    || /\b(?:this is|this means|confirms|diagnostic of)\b.{0,25}\b(?:heart failure|shock|respiratory failure|sepsis)\b/i.test(s))) codes.push('source_not_patient_diagnosis');
  if (pack.domains.includes('lvedp') && sentences.some(s =>
    /\bLVEDP\s*(?:=|equals|is identical to|directly measures)\s*(?:the )?(?:PCWP|PAOP|mean LAP|left atrial pressure|fluid volume|ventricular (?:fluid )?volume)/i.test(s)
    || /\bLVEDP\b.{0,30}\b(?:proves|confirms|establishes)\b/i.test(s)
    || /\b(?:high|elevated) LVEDP\b.{0,35}\b(?:means|indicates)\b.{0,40}\b(?:not emptying|heart failure|fluid unresponsive)/i.test(s))) codes.push('filling_pressure_conflation');
  if (pack.domains.includes('acid_base') && sentences.some(s =>
    /\b(?:vomiting|gastric acid loss)\s+(?:causes|lowers|reduces|decreases)\b.{0,30}\b(?:low|lower|loss|bicarbonate|HCO3)\b/i.test(s)
    || /\b(?:compensation|bicarbonate)\b.{0,45}\b(?:lost|reduced|lowered)\b.{0,40}\b(?:vomiting|diuresis)\b/i.test(s)
    || /\b(?:this (?:is|proves|confirms)|there is|has established)\s+(?:an? )?(?:acute|chronic)\s+respiratory/i.test(s)
    || /\b(?:bicarbonate|HCO3)\b.{0,20}\b(?:not yet risen|has risen|has fallen)\b/i.test(s)
    || /\b(?:no mixed (?:process|disorder)|mixed (?:process|disorder) is excluded)\b/i.test(s)
    || /\bmetabolic alkalosis\b.{0,60}\b(?:normalizes|lowers|reduces)\b.{0,20}\b(?:HCO3|bicarbonate)\b/i.test(s)
    || /\b\d+(?:\s*[-–]\s*\d+)?\s*(?:hours?|days?|weeks?)\b/i.test(s))) codes.push('acid_base_source_contradiction');
  if (pack.domains.includes('venous_oxygen') && /\b(?:SvO2|ScvO2)\b.{0,80}\b(?:always|fixed|consistently|typically)\b.{0,40}\b(?:higher|lower|above|below|equal)\b|\b(?:SvO2|ScvO2)\s*(?:=|equals|is interchangeable with)\s*(?:SvO2|ScvO2)\b/i.test(text)) codes.push('venous_equivalence_overstatement');
  if (pack.domains.includes('crrt') && sentences.some(s =>
    /\b(?:access|return|filter) pressure\b.{0,35}\b(?:measures|is|equals)\b.{0,30}\b(?:dialysate|effluent compartment|fluid compartment)\b/i.test(s)
    || /\b(?:TMP|transmembrane pressure)\s*(?:=|equals|is identical to)\s*(?:access|return|filter pressure drop)/i.test(s)
    || (/\b(?:effluent|pressure|TMP|filter)\b/i.test(s) && /\b(?:proves? clotting|will clot|confirms? (?:filter )?clotting|means (?:the filter is )?clotting)\b/i.test(s))
    || /\beffluent\b.{0,160}\b(?:suggests?|indicates?|reflects?|signals?)\b.{0,30}\b(?:filter )?clotting\b/i.test(s))) codes.push('crrt_compartment_or_certainty_error');
  if (pack.domains.includes('crrt') && (!/\bPrisMax\b/i.test(text) || /\b(?:all|every) (?:CRRT|dialysis|machines?|systems?)\b/i.test(text))) codes.push('device_scope_unestablished');
  const allowed = new Set([...numbers(normalise(question)), ...pack.sources.filter(s => x.source_ids.includes(s.id)).flatMap(s => numericFacts(s.facts)),
    ...numericFacts(pack.calculations?.status === 'calculated' ? pack.calculations : null)]);
  if (numbers(text).some(n => !allowed.has(n))) codes.push('unsupported_source_number');
  return { codes: [...new Set(codes)], plain: JSON.stringify({ answer: x.answer, details: x.details }), sourceIds: x.source_ids };
}
function boundedEvidenceAnswer(pack) {
  const reason = pack.coverage === 'other_device'
    ? 'This source set contains PrisMax concepts, not instructions for the other system named. Confirm the exact machine and consult its current IFU and trained team.'
    : pack.coverage === 'unsupported_topic'
      ? 'This small curated source set does not cover the requested calculation or advanced topic. It supports the reference concept below, but cannot supply the missing formula or device-specific detail. Consult the applicable professional reference or current device IFU.'
    : pack.coverage === 'partial_hemodynamics'
      ? 'This small source set explains filling-pressure concepts, not a complete multi-finding hemodynamic diagnosis. It cannot establish the cause of the reported situation. For an actual concerning change, use bedside assessment and the local team rather than waiting for chat.'
      : 'The curated sources support concepts, not treatment selection, device settings or operating steps. Use the prescribed plan, exact-device IFU and trained local team for those decisions.';
  const source = pack.sources[0];
  return { answer: reason, details: [{ heading: 'Why it matters', text: 'Supplied reference excerpt: "' + source.excerpts.join(' ') + '"' },
    { heading: 'What changes interpretation', text: 'The general clinical references are not additional patient findings. Missing measurements, diagnoses, baseline and device context remain unknown.' }],
    evidence: { ...sourceMetadata(pack, [source.id]), status: 'scope_limited' } };
}
module.exports = { retrieveEvidence, sourceMetadata, groundingContext, GROUNDING_INSTRUCTIONS, groundedFormat, validateGrounded, boundedEvidenceAnswer };
