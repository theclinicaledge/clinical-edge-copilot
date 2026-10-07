const FLOW = 'snapshot-flow-mechanisms';
const MONITOR = 'snapshot-critical-monitoring';
const INDEX = 'snapshot-cardiac-index';
const numeric = text => typeof text === 'string' && /^\d+(?:\.\d+)?$/.test(text) && Number.isFinite(Number(text));
const unavailable = text => /^(?:unknown|not assessed|not reported|not measured)$/i.test(text || '');

// Each proposition has code-owned patient bindings and reference support.
// The model may choose an eligible ID, never rewrite these bindings or words.
function richSynthesis(packet, prepared) {
  if (packet.profile !== 'hemodynamics' || prepared.conflict || !prepared.lowForwardFlow) return null;
  const facts = new Map(packet.facts.map(f => [f.key, f]));
  const measurement = (key, units) => {
    const f = facts.get(key);
    return f && numeric(f.current) && !unavailable(f.state) && units.includes(f.unit) ? f : null;
  };
  const ci = measurement('ci', ['L/min/m2', 'L/min/m^2', 'L/min/m²']);
  if (!ci) return null;
  const co = measurement('co', ['L/min']), map = measurement('map', ['mmHg']);
  const cvp = measurement('cvp', ['mmHg']), svr = measurement('svr', ['dynes-sec/cm5']);
  const hr = measurement('hr', ['bpm']), lactate = measurement('lactate', ['mmol/L']);
  const text = key => facts.get(key)?.text && !unavailable(facts.get(key).text) ? facts.get(key).text : null;
  const reportedRhythm = text('rhythm'), reportedPacing = text('pacing');
  const rhythm = /^(?:paced(?: rhythm)?|sinus(?: rhythm| tachycardia| bradycardia)|(?:new |rapid )?irregular rhythm(?: \(not confirmed\))?)$/i.test(reportedRhythm || '') ? reportedRhythm : null;
  const pacing = ['Temporary pacing', 'Pacemaker'].includes(reportedPacing) ? reportedPacing : null;
  const procedure = text('procedure');
  const reportedUrine = text('urine');
  const urine = /^\d+(?:\.\d+)? mL(?: over \d+(?:\.\d+)? (?:hour|minute)| \(interval not reported\)|\/hr \(documented rate\))$/.test(reportedUrine || '') ? reportedUrine : null;
  const medications = [...(text('drips') || '').matchAll(/(?:^|;\s*)medication=([^,;]+)/g)].map(m => m[1].trim())
    .filter(name => /^(?:epinephrine|norepinephrine|vasopressin)$/i.test(name));
  const perfusion = (text('perfusionFindings') || '').split('; ').filter(value => ['Cool / clammy', 'Weak pulses', 'Delayed capillary refill', 'Mottling'].includes(value));
  const assessment = text('perfusionAssessment') || '';
  const skin = assessment.match(/(?:^|;\s*)skinTemperature=(Warm|Cool|Cold)(?:;|$)/)?.[1];
  const warm = skin === 'Warm', concerningPerfusion = perfusion.length > 0 || ['Cool', 'Cold'].includes(skin);
  const hasComparison = f => f && numeric(f.previous);
  const direction = f => !hasComparison(f) ? null : Number(f.current) > Number(f.previous) ? 'higher' : Number(f.current) < Number(f.previous) ? 'lower' : 'unchanged';
  const show = (name, f) => `${name} ${hasComparison(f) ? `${f.previous} → ` : ''}${f.current} ${f.unit}`;
  const knownCount = [ci, co, map, cvp, svr, hr, lactate, rhythm, pacing, procedure, medications.length, concerningPerfusion || warm, urine].filter(Boolean).length;
  const domains = [map, cvp || svr, rhythm || pacing, lactate || concerningPerfusion || warm, medications.length].filter(Boolean).length;
  if (knownCount < 5 || domains < 2) return null;
  const claims = [], catalog = [];
  const claim = (id, statement, evidenceIds, sourceIds, kind = 'interpretive') => {
    if (!evidenceIds.every(key => facts.has(key))) throw new Error('Invalid synthesis binding');
    claims.push({ id, text: statement, evidenceIds, sourceIds, kind });
  };
  claim('reported-low-flow', `${show('CI', ci)} indicates low forward flow relative to body size if the measurement is valid.`, ['ci'], [INDEX]);
  if (co) claim('output-index-context', `${show('CO', co)} is also reported; CI indexes output to body size, not a separate mechanism.`, ['ci', 'co'], [INDEX]);
  if (medications.length) claim('support-not-cause', `${medications.join(', ')} ${medications.length === 1 ? 'is' : 'are'} reported; infusion names alone neither quantify support intensity nor establish its effect or the cause of low flow.`, ['ci', 'drips'], [FLOW]);
  if (map) claim('pressure-flow', `${show('MAP', map)} is pressure, not proof of adequate flow.${direction(ci) === 'lower' && direction(map) === 'higher' ? ' The reported comparisons run in opposite directions; they do not establish a shared timeline or treatment response.' : ''}`, ['ci', 'map'], [FLOW]);
  if (lactate && direction(lactate) === 'higher' && concerningPerfusion) {
    claim('converging-perfusion', `${show('Lactate', lactate)} with ${perfusion.join(', ') || `${skin.toLowerCase()} skin`} adds concern about tissue perfusion alongside low CI, but does not identify a cause.`, ['ci', 'lactate', perfusion.length ? 'perfusionFindings' : 'perfusionAssessment'], [MONITOR]);
  } else if (lactate && (direction(lactate) === 'lower' || direction(lactate) === 'unchanged') && warm) {
    claim('mixed-perfusion-context', `${show('Lactate', lactate)} is ${direction(lactate)} and skin is reported warm. These observations do not prove adequate flow or establish worsening tissue perfusion.`, ['ci', 'lactate', 'perfusionAssessment'], [MONITOR]);
  } else if (lactate) {
    claim('lactate-context', `${show('Lactate', lactate)} needs clinical and sampling context; it does not establish the mechanism behind low CI.`, ['ci', 'lactate'], [MONITOR]);
  }
  if (prepared.calculated?.status === 'verified') claim('verified-gas-pattern', `The code-verified gas shows: ${prepared.calculated.summary} This separate pattern needs ventilation context; it does not establish why CI is low.`, ['gas', 'ci'], prepared.calculated.sourceIds, 'calculated_context');
  if (rhythm && /irregular/i.test(rhythm) && hr) claim('rhythm-flow-context', `${show('HR', hr)} with reported ${rhythm.toLowerCase()} makes rate/coordination relevant to check alongside flow; it does not establish the rhythm diagnosis or its effect.`, ['ci', 'hr', 'rhythm'], [FLOW]);
  claim('cause-unresolved', 'The cause remains unknown; this is not an established shock subtype. Verify current flow and perfusion at the bedside and communicate concerns promptly.', ['ci'], [INDEX, MONITOR]);

  const add = (id, heading, anchor, discriminator, evidenceIds, sourceIds) => {
    catalog.push({ id, heading, text: `${anchor} ${discriminator}`, evidenceIds, sourceIds, reasonCategory: 'conditional_mechanism_discrimination' });
  };
  add('filling', 'Filling versus pump performance', cvp ? `${show('CVP', cvp)} is a filling-pressure clue, not circulating volume; together with ${show('CI', ci)}, it cannot choose filling or pump impairment by itself.` : facts.has('cvp') ? `Supplied filling-pressure context needs clarification of units, value and measurement state before interpretation alongside ${show('CI', ci)}.` : `Filling-pressure information is not reported alongside ${show('CI', ci)}.`,
    'Team-interpreted ventricular and filling assessment can distinguish the possibilities: impaired contraction with adequate filling would support a pump-performance contributor; limited filling with preserved contraction would support a filling contributor. Neither result is reported here.', ['ci', ...(cvp ? ['cvp'] : [])], [FLOW, MONITOR]);
  if (map || svr || medications.length) add('tone', 'Pressure support versus forward flow', `${[map && show('MAP', map), svr && show('SVR', svr), show('CI', ci)].filter(Boolean).join('; ')} must be interpreted together.`,
    'Confirm measurement timing and the actual infusion doses/response. If resistance is higher while flow remains low, ejection load may be relevant; maintained pressure alone does not prove adequate output. If flow and perfusion improve together, that is more informative than pressure alone. These are conditional comparisons, not a reason to change a dose.', ['ci', ...(map ? ['map'] : []), ...(svr ? ['svr'] : []), ...(medications.length ? ['drips'] : [])], [FLOW, MONITOR]);
  if (rhythm || pacing) add('rhythm', 'Effective rhythm and contraction', `${rhythm ? `Reported rhythm: ${rhythm}.` : ''}${hr ? ` ${show('HR', hr)}.` : ''}${pacing ? ` Reported pacing: ${pacing}.` : ''}`,
    `${pacing || /paced/i.test(rhythm || '') ? 'Confirm electrical capture, a corresponding mechanical pulse and synchrony with the trained team. A confirmed capture/synchrony problem would support ineffective coordinated contraction as a contributor; verified capture with persistent low CI shifts attention to filling, pump performance and load, without proving a cause.' : 'Relate the reported rhythm to mechanical pulse and flow at the same assessment. Ineffective or poorly coordinated contraction would support a rhythm-related contributor; effective contraction with persistent low CI leaves filling, pump performance and load unresolved.'}`, ['ci', ...(rhythm ? ['rhythm'] : []), ...(hr ? ['hr'] : []), ...(pacing ? ['pacing'] : [])], [FLOW, MONITOR]);
  if (lactate || concerningPerfusion || warm || urine) add('delivery', 'Is low flow affecting tissue perfusion?', `${[lactate && show('Lactate', lactate), perfusion.join(', ') || (skin ? `skin ${skin}` : ''), urine && `urine ${urine} (one reported observation, not a trend)`].filter(Boolean).join('; ')}.`,
    'Correlate mentation, peripheral perfusion and comparable timed output with available oxygenation/hemoglobin context. Worsening documented comparisons would strengthen tissue-perfusion concern; more reassuring observations would temper that concern but not validate a low-flow measurement or identify its cause. Unknown observations remain unknown.', ['ci', ...(lactate ? ['lactate'] : []), ...(perfusion.length ? ['perfusionFindings'] : []), ...(skin ? ['perfusionAssessment'] : []), ...(urine ? ['urine'] : [])], [MONITOR]);
  return { answer: claims.map(c => c.text).join(' '), claims, catalog,
    defaultIds: [catalog.find(c => c.id === 'filling')?.id, catalog.find(c => c.id === (pacing || rhythm ? 'rhythm' : 'delivery'))?.id].filter(Boolean) };
}
module.exports = { richSynthesis };
