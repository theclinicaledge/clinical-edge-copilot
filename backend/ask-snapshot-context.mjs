// Shared, pure selection boundary. Only selected reported fields cross the API.
export const CONTEXT_LIMITS = Object.freeze({ facts: 18, text: 480, bytes: 8000 });
const trends = {
  ci: ['CI', 'L/min/m2'], co: ['CO', 'L/min'], map: ['MAP', 'mmHg'], bp: ['BP', 'mmHg'],
  hr: ['HR', 'bpm'], cvp: ['CVP', 'mmHg'], svr: ['SVR', 'dynes-sec/cm5'],
  svo2: ['SvO2 / ScvO2 (site unspecified)', '%'], lactate: ['Lactate', 'mmol/L'],
  hemoglobin: ['Hemoglobin', 'g/dL'], rr: ['RR', '/min'], spo2: ['SpO2', '%'], oxygen: ['Oxygen support', ''],
};
const texts = { rhythm: 'Rhythm', loc: 'Mental status', perfusionFindings: 'Perfusion',
  urine: 'Urine output', drips: 'Infusions', drains: 'Drains / bleeding', pacing: 'Pacing / support',
  procedure: 'Procedural context', gas: 'Reported gas sample', perfusionAssessment: 'Perfusion assessment' };
const fields = { hemodynamics: ['ci', 'co', 'map', 'bp', 'hr', 'drips', 'cvp', 'svr', 'rhythm', 'procedure', 'lactate', 'perfusionFindings', 'perfusionAssessment', 'urine', 'drains', 'pacing', 'svo2', 'gas'],
  abg: ['gas', 'rr', 'spo2', 'oxygen', 'loc', 'lactate', 'map', 'bp'] };
const clean = value => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
const bounded = value => { const s = Array.isArray(value) ? value.map(clean).filter(Boolean).join('; ') : clean(value); return s.length <= CONTEXT_LIMITS.text ? s : ''; };
const packetSize = packet => new TextEncoder().encode(JSON.stringify(packet)).length;
function reportedGas(snapshot) {
  const structured = bounded(snapshot.optional?.labs?.detail);
  if (structured) return structured;
  // Accept only a complete, explicitly arterial gas-only line. Do not attach
  // surrounding notes or infer a sample type from an "ABG / VBG" category.
  const samples = clean(snapshot.notes).split('\n').map(line => line.trim()).filter(line => /^Arterial ABG:?\s+pH\s*=?\s*\d+(?:\.\d+)?\s*[,;]\s*PaCO2\s*=?\s*\d+(?:\.\d+)?\s*(?:mmHg|kPa)\s*[,;]\s*HCO3\s*=?\s*\d+(?:\.\d+)?\s*(?:mmol\/L|mEq\/L)\.?$/i.test(line));
  return samples.length === 1 ? bounded(samples[0]) : '';
}
export function contextProfile(question) {
  if (/\b(?:ABG|VBG|blood gas|PaCO2|HCO3|acid.base|acidemia|alkalemia|ventilat\w*)\b/i.test(question)) return 'abg';
  if (/\b(?:CI|CO|cardiac index|cardiac output|hemodynamic\w*|perfusion|preload|afterload|MAP|BP|blood pressure|epi|vaso|levo|epinephrine|norepinephrine|vasopressin|CVP|SVR|low flow)\b/i.test(question)) return 'hemodynamics';
  return null;
}
export function selectSnapshotContext(question, snapshot, enabled) {
  const profile = contextProfile(question);
  if (!enabled || !snapshot || !profile) return null;
  const values = snapshot.values || {}, optional = snapshot.optional || {}, facts = [];
  for (const key of fields[profile]) {
    if (trends[key]) {
      const current = bounded(values[`${key}Now`]), previous = bounded(values[`${key}Earlier`]);
      const state = bounded(values[`${key}State`]);
      if (!current && !previous && !state) continue;
      const unit = Object.hasOwn(snapshot.units || {}, key) ? bounded(snapshot.units[key]) : trends[key][1];
      facts.push({ key, current, previous, state, unit });
      continue;
    }
    let text = '';
    if (key === 'urine') {
      const amount = bounded(values.urineAmount), interval = bounded(values.urineIntervalValue), unit = bounded(values.urineIntervalUnit) || 'hour';
      text = amount ? `${amount} mL${interval && unit ? ` over ${interval} ${unit}` : ' (interval not reported)'}`
        : bounded(values.urineRate) ? `${bounded(values.urineRate)} mL/hr (documented rate)` : bounded(values.urineState);
    } else if (key === 'drips' || key === 'drains') {
      const allowed = key === 'drips' ? ['medication', 'currentDose', 'unit', 'previousDose', 'direction', 'time', 'response'] : ['type', 'currentOutput', 'outputTimeframe', 'previousOutput', 'appearance', 'patency', 'bleeding'];
      text = (optional[key]?.items || []).slice(0, 4).map(item => allowed.filter(k => bounded(item[k])).map(k => `${k}=${bounded(item[k])}`).join(', ')).filter(Boolean).join('; ');
    } else if (key === 'procedure') {
      // Only an explicitly affirmative procedural clause, not the rest of notes.
      const clause = clean(snapshot.notes).split(/[.!?\n]/).find(s => /^\s*(?:post[- ]?CABG|s\/p CABG|postoperative CABG)\s*$/i.test(s));
      text = clause ? clause.trim() : (snapshot.contexts || []).includes('Post-op') ? 'Post-op (procedure not specified)' : '';
    } else if (key === 'gas') text = reportedGas(snapshot);
    else if (key === 'pacing') text = (optional.devices?.selected || []).filter(s => /pac/i.test(s)).map(clean).join('; ');
    else if (key === 'perfusionAssessment') text = ['skinTemperature', 'capillaryRefill', 'pulses', 'mottling', 'extremities', 'mentalDetail'].filter(k => bounded(values[k])).map(k => `${k}=${bounded(values[k])}`).join('; ');
    else text = bounded(values[key]);
    if (text && text.length <= CONTEXT_LIMITS.text) facts.push({ key, text });
  }
  while (packetSize({ version: 1, profile, facts }) > CONTEXT_LIMITS.bytes) facts.pop();
  return facts.length ? { version: 1, profile, facts } : null;
}
export function validateSnapshotContext(question, packet) {
  if (!packet || typeof packet !== 'object' || Array.isArray(packet) || Object.keys(packet).sort().join(',') !== 'facts,profile,version'
    || packet.version !== 1 || packet.profile !== contextProfile(question) || !fields[packet.profile]
    || !Array.isArray(packet.facts) || !packet.facts.length || packet.facts.length > CONTEXT_LIMITS.facts
    || packetSize(packet) > CONTEXT_LIMITS.bytes) return false;
  const keys = new Set();
  return packet.facts.every(fact => {
    if (!fact || typeof fact !== 'object' || Array.isArray(fact) || !fields[packet.profile].includes(fact.key) || keys.has(fact.key)) return false;
    keys.add(fact.key);
    const expected = trends[fact.key] ? ['current', 'key', 'previous', 'state', 'unit'] : ['key', 'text'];
    return Object.keys(fact).sort().join(',') === expected.sort().join(',') && expected.filter(k => k !== 'key').every(k => typeof fact[k] === 'string' && fact[k].length <= CONTEXT_LIMITS.text)
      && (trends[fact.key] ? Boolean(fact.current || fact.previous || fact.state) : Boolean(fact.text));
  });
}
export function reportedFacts(packet) {
  return packet.facts.map(fact => ({ id: fact.key, label: (trends[fact.key] || [texts[fact.key]])[0],
    text: trends[fact.key] ? `current ${fact.current || 'unknown'}${fact.unit ? ` ${fact.unit}` : ' (unit not supplied)'}; previous ${fact.previous || 'unknown'}${fact.state ? `; reported description: ${fact.state}` : ''}` : fact.text }));
}
export function contextEvidenceText(packet) {
  return `PATIENT SNAPSHOT — USER-REPORTED / OBSERVED INFORMATION\n${reportedFacts(packet).map(f => `- ${f.label}: ${f.text}`).join('\n')}`;
}
