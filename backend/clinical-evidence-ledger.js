function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const UNKNOWN = /\b(?:unknown|not assessed|not supplied|not provided|not known|not available|unspecified|unavailable)\b/i;
const NUM = '-?\\d+(?:\\.\\d+)?';
const unknownValue = value => UNKNOWN.test(String(value).replace(/\(unit not supplied\)/gi, ''));
const AMBIGUOUS = /\?|\b(?:assess|clarify|whether|if|could|would|may|possible|hypothetical|example|target|goal|missing|concern for|rule out|evaluate for|give|administer|start|titrate|hold|order)\b/i;
const AMBIGUOUS_ACTOR = /\b(?:I am|I'm|nurse|visitor|family|mother|father|wife|husband|daughter|son|friend)\b/i;
const CLINICAL_FEATURE_LABEL = /^(?:mental status|mentation|level of consciousness|focal neurologic change|skin|(?:current )?extremities|capillary refill|CRT|chest discomfort|chest pain|symptoms|perfusion|pain or other change|rhythm change|respiratory findings|medication)$/i;
const CLINICAL_CONTEXT_START = /^(?:patient\s+(?:is|has|reports|remains)|(?:more\s+)?(?:drowsy|confused)|new\s+(?:(?:left|right|unilateral)\s+)?(?:slurred speech|speech change|facial|arm|leg|focal|productive cough)|(?:current\s+)?extremities\b|skin\b|capillary refill\b|mental status\s*:|awake\b|reports feeling lightheaded\b|(?:WBC|potassium|magnesium|lactate|creatinine|pH|PaCO2)\s+(?:is\s+)?\d)/i;
const CONCEPTS = [
  ['bp', /\b(?:BP|blood pressure|SBP|systolic)\b/i],
  ['map', /\bMAP\b/i], ['hr', /\b(?:heart rate|HR)\b/i],
  ['rr', /\b(?:respiratory rate|RR)\b/i], ['spo2', /\bSpO2\b/i],
  ['oxygen', /\boxygen support\b/i], ['ph', /\bpH\b/i],
  ['paco2', /\bPaCO2\b/i], ['hco3', /\b(?:HCO3|bicarbonate)\b/i],
  ['lactate', /\blactate\b/i], ['creatinine', /\bcreatinine\b/i],
  ['urine', /\burine output\b/i], ['drain', /\b(?:drain|chest tube)\b/i],
  ['potassium', /\bpotassium\b/i], ['magnesium', /\bmagnesium\b/i],
  ['temperature', /\btemperature\b/i], ['glucose', /\bglucose\b/i],
  ['ci', /\b(?:CI|cardiac index)\b/i], ['svr', /\bSVR\b/i],
];
const LABELS = Object.freeze({ bp: ['bp', 'blood pressure', 'sbp', 'systolic'], map: ['map'], hr: ['heart rate', 'hr'], rr: ['respiratory rate', 'rr'], spo2: ['spo2'], oxygen: ['oxygen support'], ph: ['ph'], paco2: ['paco2'], hco3: ['hco3', 'bicarbonate'], lactate: ['lactate'], creatinine: ['creatinine'], urine: ['urine output'], drain: ['drains / bleeding', 'drain output', 'chest tube output'], potassium: ['potassium'], magnesium: ['magnesium'], temperature: ['temperature'], glucose: ['glucose'], ci: ['ci', 'cardiac index'], svr: ['svr'], wbc: ['wbc'] });
const conceptForLabel = label => Object.keys(LABELS).find(key => LABELS[key].includes(label.toLowerCase().trim()));
const UNIT_RULES = {
  bp: /^(?:mmhg|kpa)$/, map: /^(?:mmhg|kpa)$/, hr: /^(?:bpm|\/min|beats\/min)$/,
  rr: /^(?:\/min|breaths\/min|rpm)$/, spo2: /^%$/, ph: /^dimensionless$/,
  paco2: /^(?:mmhg|kpa)$/, hco3: /^(?:meq\/l|mmol\/l)$/,
  lactate: /^(?:mmol\/l|mg\/dl)$/, creatinine: /^(?:mg\/dl|[u\u00b5]mol\/l)$/,
  urine: /^(?:ml\/(?:hr|h|min)|ml)$/, drain: /^(?:ml\/(?:hr|h|min)|ml)$/,
  potassium: /^(?:mmol\/l|meq\/l)$/, magnesium: /^(?:mg\/dl|mmol\/l|meq\/l)$/,
  temperature: /^(?:c|f)$/, glucose: /^(?:mg\/dl|mmol\/l)$/,
  ci: /^l\/min\/(?:m2|m\^2)$/, svr: /^dynes-sec\/cm5$/,
  oxygen: /^(?:l\/min|l)(?:\s+(?:nasal cannula|nc|mask))?$/,
  wbc: /^x10\^(?:3\/ul|9\/l)$/,
};
function unitKey(concept, unit) {
  const normalized = unit.replace(/\s*\(unit not supplied\)\s*$/i, '').trim();
  // For this monovalent ion these labels express the same concentration;
  // no numeric conversion or rewritten patient value is performed.
  return concept === 'potassium' && /^(?:mmol\/l|meq\/l)$/.test(normalized) ? 'potassium_concentration' : normalized;
}

function scalar(value, concept) {
  const m = String(value).match(new RegExp('^\\s*(' + NUM + ')(?:\\s*([-–/])\\s*(' + NUM + '))?\\s*(.*?)$'));
  if (!m || unknownValue(value)) return null;
  const unit = m[4].trim().toLowerCase();
  const key = unitKey(concept, unit);
  const shape = m[2] === '/' ? 'pair' : m[2] ? 'range' : 'scalar';
  const low = Number(m[1]), high = m[3] === undefined ? low : Number(m[3]);
  const numericShapeValid = (concept === 'temperature' || (low >= 0 && high >= 0))
    && (concept !== 'ph' || (low > 0 && high > 0))
    && (shape !== 'pair' || (concept === 'bp' && low >= high));
  return { low, high, unit,
    shape, classified: (!key || Boolean(UNIT_RULES[concept]?.test(unit.replace(/\s*\(unit not supplied\)\s*$/i, '').trim())))
      && numericShapeValid && (shape !== 'range' || low <= high) };
}
function direction(previous, current, concept) {
  if (unknownValue(previous) || unknownValue(current)) return 'unknown';
  const a = scalar(previous, concept), b = scalar(current, concept);
  if (a && b) {
    if (!a.classified || !b.classified || a.shape !== b.shape) return 'unknown';
    if (unitKey(concept, a.unit) && unitKey(concept, b.unit) && unitKey(concept, a.unit) !== unitKey(concept, b.unit)) return 'unknown';
    if (a.low === b.low && a.high === b.high) return 'unchanged';
    if (b.low > Math.max(a.low, a.high) && b.high >= b.low) return 'increasing';
    if (b.high < Math.min(a.low, a.high) && b.low <= b.high) return 'decreasing';
    // BP is a pair, not a numeric range. Conservatively require both to move.
    if (a.low > a.high && b.low > b.high) {
      if (b.low > a.low && b.high > a.high) return 'increasing';
      if (b.low < a.low && b.high < a.high) return 'decreasing';
    }
    return 'unknown';
  }
  if (concept === 'oxygen' && /^room air$/i.test(previous.trim()) && /^room air$/i.test(current.trim())) return 'unchanged';
  return 'unknown';
}

function buildClinicalEvidenceLedger(input) {
  const source = String(input || '');
  const records = [];
  const atoms = [];
  const comparisons = [];
  let offset = 0, context = false, structured = false;
  function atom(record, concept, text, start, temporal, value = null, negative = false, unknown = false) {
    atoms.push({ id: 'a' + (atoms.length + 1), evidenceId: record.id, concept, text,
      provenance: { start, end: start + text.length }, temporal, value, negative, unknown,
      unclassified: Boolean(value && !value.classified), reportedUnknown: unknownValue(text) && !AMBIGUOUS.test(text) && !AMBIGUOUS_ACTOR.test(text) });
  }
  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (/^PATIENT SNAPSHOT/.test(trimmed)) structured = true;
    if (/^Treat omitted fields/i.test(trimmed)) context = false;
    if (/^Additional user-reported context:/i.test(trimmed)) context = true;
    const eligible = /^[-*]\s/.test(trimmed) || /^(?:What changed|Care setting|Setting|Clinical context):/i.test(trimmed)
      || (context && trimmed && !/^Treat omitted fields/i.test(trimmed));
    if (eligible) {
      const text = trimmed.replace(/^[-*]\s/, '');
      const start = offset + line.indexOf(text);
      const label = text.includes(':') ? text.slice(0, text.indexOf(':')).trim() : 'User-reported context';
      const concept = conceptForLabel(label);
      const pair = text.match(/:\s*(?:previous|earlier)\s+(.+?)\s*(?:->|→)\s*(?:current|now)\s+(.+)$/i);
      const comparison = pair ? { previous: pair[1], current: pair[2],
        status: unknownValue(pair[1]) || unknownValue(pair[2]) ? 'incomplete' : pair[1].trim().toLowerCase() === pair[2].trim().toLowerCase() || direction(pair[1], pair[2], concept) === 'unchanged' ? 'unchanged' : 'reported_comparison',
        direction: direction(pair[1], pair[2], concept) } : null;
      const record = { id: 'e' + (records.length + 1), text, label,
        semanticRole: AMBIGUOUS.test(text) ? 'conditional_context' : /^(?:Baseline|History|Context|Additional user-reported context|What changed|Care setting|Setting|Clinical context)\b/i.test(label) ? 'reported_context' : 'reported_fact',
        provenance: { start, end: start + text.length, source: 'user_report' }, comparison,
        roles: { currentOnly: !comparison, interval: /\b(?:over|during|most recent|last hour)\b/i.test(text),
          explicitlyUnchanged: comparison?.status === 'unchanged' || /\bunchanged\b/i.test(text),
          explicitNegative: /\b(?:no|denies|absent|without)\b/i.test(text), unknown: UNKNOWN.test(text),
          medicationContext: /\b(?:medication|sedation|dose|drip|norepinephrine|fentanyl|propofol|opioid)\b/i.test(text),
          baselineContext: /\b(?:baseline|usual)\b/i.test(text),
          onsetContext: /\b(?:onset|last known well)\b/i.test(text),
          recognitionContext: /\b(?:recogniz\w*|recognition|first noticed)\b/i.test(text),
          previousContext: /\b(?:previous|earlier)\b/i.test(text) },
        numbers: [...text.matchAll(/(?<![A-Za-z])\d+(?:\.\d+)?/g)].map(m => ({ text: m[0], offset: m.index })),
        units: [...text.matchAll(/(?:mmHg|bpm|mmol\/L|mg\/dL|mEq\/L|mL\/hr|mL|L\/min|%)/g)].map(m => ({ text: m[0], offset: m.index })) };
      records.push(record);
      if (pair && concept) {
        const a = scalar(pair[1], concept), b = scalar(pair[2], concept);
        comparisons.push({ evidenceId: record.id, concept, previous: pair[1], current: pair[2], direction: AMBIGUOUS.test(text) ? 'unknown' : comparison.direction });
        atom(record, concept, pair[2], start + text.lastIndexOf(pair[2]), 'current', b, false, unknownValue(pair[2]) || AMBIGUOUS.test(text));
        atom(record, concept, pair[1], start + text.indexOf(pair[1], pair.index + 1), 'earlier', a, false, unknownValue(pair[1]));
      } else if (concept && !/^(?:Labs|Additional|Clinical)/i.test(label)) {
        const value = text.slice(text.indexOf(':') + 1).replace(/^\s*current\s+/i, '').trim();
        const interval = concept === 'urine' && value.match(/^(?:amount\s+)?(\d+(?:\.\d+)?)\s+mL\s+(?:over|during)\s+((?:\d+(?:\.\d+)?\s+(?:hours?|minutes?))|(?:(?:the\s+)?(?:last|most recent)\s+(?:hour|\d+(?:\.\d+)?\s+(?:hours?|minutes?))))$/i);
        atom(record, concept, value, start + text.indexOf(value, text.indexOf(':') + 1), 'current', interval ? null : scalar(value, concept), /\b(?:no|absent)\b/i.test(value), UNKNOWN.test(value) || AMBIGUOUS.test(text));
        if (interval) atoms.at(-1).intervalMeasurement = { amount: interval[1], unit: 'mL', timeframe: interval[2] };
      }
      // Split explicit scopes before extracting features; earlier findings
      // cannot activate current interpretation clauses.
      let temporal = /^Baseline\b/i.test(label) ? 'baseline' : /^History\b/i.test(label) ? 'earlier' : 'current';
      const featureSource = pair ? pair[2] : text;
      const featureStart = pair ? start + text.lastIndexOf(pair[2]) : start;
      if (pair && /^(?:Mental status|Level of consciousness)$/i.test(label) && /^changed$/i.test(pair[2].trim())) atom(record, 'mentation', pair[2], featureStart, 'current');
      if (pair && /^Focal neurologic change$/i.test(label) && /^present$/i.test(pair[2].trim())) atom(record, 'focal', pair[2], featureStart, 'current');
      for (const m of featureSource.matchAll(/[^;\n]+?(?:;|\.(?=\s|$)|$)/g)) {
        const clause = m[0].replace(/[;.]\s*$/, '').trim();
        if (!clause) continue;
        if (/(?:^|:\s*)(?:Earlier|Previous)(?:\s|:)|\bhistory of\b/i.test(clause)) temporal = 'earlier';
        const explicitCurrent = /(?:^|:\s*)(?:Now|Current)(?:\s|:)/i.test(clause);
        if (explicitCurrent) temporal = 'current';
        if (!explicitCurrent && /\b(?:yesterday|last shift|previously|in the past|resolved|ago)\b/i.test(clause)
          && !/\b(?:recogniz\w*|recognition|onset|last known well)\b/i.test(clause)) temporal = 'earlier';
        const negative = /\b(?:no|none|not|denies|denied|without|absent|negative|normal|symmetric|at baseline)\b/i.test(clause);
        const mixedScope = /\b(?:Earlier|Previous)(?: ABG)?\s*:/i.test(clause) && /\b(?:Current|Now)(?: ABG)?\s*:/i.test(clause);
        let clinicalBody = clause.startsWith(label + ':') ? clause.slice(label.length + 1).trim() : clause;
        clinicalBody = clinicalBody.replace(/^(?:Earlier|Previous|Now|Current)\s*:?\s+/i, '');
        const classifiedScope = CLINICAL_FEATURE_LABEL.test(label) || CLINICAL_CONTEXT_START.test(clinicalBody);
        const unknown = UNKNOWN.test(clause) || AMBIGUOUS.test(clause) || AMBIGUOUS_ACTOR.test(clause) || mixedScope
          || !classifiedScope || /\b(?:improved from|recovered from|resolved|no longer)\b/i.test(clause);
        const loc = featureStart + m.index + m[0].indexOf(clause);
        const features = [
          ['mentation', /\b(?:drowsy|confus\w*|slower responses|mental status:\s*changed|level of consciousness:\s*(?:more drowsy|altered))\b/i],
          ['focal', /\b(?:focal neurologic change:\s*present|(?:left|right|unilateral).*(?:weakness|asymmetry)|slurred speech|speech change)\b/i],
          ['cool', /\bcool\b/i], ['clammy', /\bclammy\b/i], ['refill', /\b(?:delayed.*(?:refill|CRT)|(?:refill|CRT).*delayed)\b/i],
          ['symptom', /\b(?:chest (?:pain|discomfort)|lightheaded\w*|palpitations|syncope)\b/i],
          ['rhythm', /\b(?:rhythm change|new.*(?:rhythm|irregular)|current.*irregular)\b/i],
          ['infection', /\b(?:fever|productive cough)\b/i],
        ];
        for (const [key, re] of features) if (re.test(clause)) atom(record, key, clause, loc, temporal, null, negative, unknown);
        const refill = clause.match(/\b(?:capillary refill|CRT)\s*:?\s*(?:is\s+)?(?:approximately\s+)?(\d+(?:\.\d+)?)\s*(?:s|seconds?|sec)\b/i);
        if (refill && Number(refill[1]) > 3 && !/\bdelayed\b/i.test(clause)) atom(record, 'refill', clause, loc, temporal, null, negative, unknown);
        for (const lab of clause.matchAll(/\bCurrent (potassium|magnesium|lactate|creatinine|pH|PaCO2|WBC)\s+(?:is\s+)?(.+?)(?=\s+and\s+current\s+(?:potassium|magnesium|lactate|creatinine|pH|PaCO2|WBC)|$)/gi)) {
          const key = lab[1].toLowerCase();
          const value = lab[2].trim();
          atom(record, key, value, loc + lab.index + lab[0].indexOf(value), temporal, scalar(value, key), negative, unknown);
        }
        const exposureContext = clause.replace(/\b(?:dose|rate)\s+(?:is\s+)?(?:unknown|not supplied|unavailable|not documented)\b/gi, '');
        if (/\b(?:fentanyl|propofol|opioid|sedative|norepinephrine)\b.*\b(?:running|given|administered|received)\b|\b(?:received|given|administered)\s+(?:fentanyl|propofol|opioid|sedative|norepinephrine)\b/i.test(exposureContext)) {
          atom(record, 'medication_exposure', clause, loc, /\b(?:earlier|yesterday|previous|last shift)\b/i.test(exposureContext) ? 'earlier' : temporal, null, /\b(?:no|none|not|without|denies|denied)\b/i.test(exposureContext), UNKNOWN.test(exposureContext) || AMBIGUOUS.test(exposureContext) || AMBIGUOUS_ACTOR.test(exposureContext));
        }
        for (const [key, re] of [['baseline', /\b(?:baseline|usual)\b/i], ['onset', /\b(?:onset|last known well)\b/i], ['recognition', /\b(?:recogniz\w*|recognition|first noticed)\b/i]]) {
          if (re.test(clause)) atom(record, key, clause, loc, temporal, null, negative, UNKNOWN.test(clause) || AMBIGUOUS.test(clause) || AMBIGUOUS_ACTOR.test(clause) || mixedScope);
        }
      }
      // An ABG comparison requires explicit earlier and current scopes and
      // both values. No paired gases are inferred from a category selection.
      const labContext = /^(?:Labs|ABG|VBG)$/i.test(label);
      const gas = labContext && !AMBIGUOUS.test(text) && !AMBIGUOUS_ACTOR.test(text) && (text.match(/Earlier ABG:/gi) || []).length === 1
        && (text.match(/Current ABG:/gi) || []).length === 1
        ? text.match(/Earlier ABG:\s*(.*?)\.\s*Current ABG:\s*(.*?)(?:\.\s*$|$)/i) : null;
      if (gas) for (const key of ['ph', 'paco2', 'hco3']) {
        const name = { ph: 'pH', paco2: 'PaCO2', hco3: 'HCO3' }[key];
        const re = new RegExp('\\b' + name + '\\s+([^,;]+)', 'gi');
        const earlier = [...gas[1].matchAll(re)];
        const current = [...gas[2].matchAll(re)];
        for (const b of current) {
          const currentText = b[1].trim().replace(/\.$/, '');
          const currentStart = start + text.indexOf(gas[2], gas.index + gas[0].indexOf('Current ABG:')) + b.index + b[0].indexOf(b[1]) + b[1].indexOf(currentText);
          atom(record, key, currentText, currentStart, 'current', scalar(currentText, key), false, unknownValue(currentText));
          if (earlier.length === 1 && current.length === 1) {
            const previousText = earlier[0][1].trim().replace(/\.$/, '');
            comparisons.push({ evidenceId: record.id, concept: key, previous: previousText, current: currentText, direction: direction(previousText, currentText, key) });
          }
        }
      }
      if (labContext && !gas && !AMBIGUOUS.test(text) && !AMBIGUOUS_ACTOR.test(text) && !/\b(?:earlier|previous)\b/i.test(text)) {
        for (const [key, name] of [['ph', 'pH'], ['paco2', 'PaCO2'], ['hco3', 'HCO3']]) {
          for (const m of text.matchAll(new RegExp('\\b' + name + '\\s+([^,;]+)', 'gi'))) {
            const value = m[1].trim().replace(/\.$/, '');
            const prefix = text.slice(Math.max(0, m.index - 30), m.index);
            atom(record, key, value, start + m.index + m[0].indexOf(value), 'current', scalar(value, key),
              /\b(?:no|not|without)\b/i.test(prefix), unknownValue(value));
          }
        }
      }
      for (const namedLab of (labContext ? text : '').matchAll(/name=(Potassium|Magnesium),\s*current=([^,;]+),\s*unit=([^,;]+)/gi)) {
        const key = namedLab[1].toLowerCase();
        const value = scalar(namedLab[2] + ' ' + namedLab[3], key);
        atom(record, key, namedLab[2], start + text.indexOf(namedLab[2], namedLab.index), 'current', value, false, unknownValue(namedLab[2]) || AMBIGUOUS.test(text) || AMBIGUOUS_ACTOR.test(text));
      }
    }
    offset += line.length + 1;
  }
  if (!structured && !records.length && source.trim()) {
    const text = source.trim();
    records.push({ id: 'e1', text, label: 'User-reported context', semanticRole: AMBIGUOUS.test(text) ? 'conditional_context' : 'reported_context', provenance: { start: source.indexOf(text), end: source.indexOf(text) + text.length, source: 'user_report' }, comparison: null, numbers: [], units: [], roles: { unstructured: true } });
  }
  const conflicts = [];
  for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) {
    const a = atoms[i], b = atoms[j];
    if (a.concept !== b.concept || a.temporal !== 'current' || b.temporal !== 'current' || a.unknown || b.unknown) continue;
    if ((a.value && b.value && (a.value.low !== b.value.low || a.value.high !== b.value.high))
      || (a.value?.unit && b.value?.unit && unitKey(a.concept, a.value.unit) !== unitKey(b.concept, b.value.unit))
      || a.negative !== b.negative) conflicts.push({ concept: a.concept, evidenceIds: [a.evidenceId, b.evidenceId], status: 'requires_reconciliation' });
  }
  // Retain duplicate-label discrepancies even if a value cannot be parsed.
  for (let i = 0; i < records.length; i++) for (let j = i + 1; j < records.length; j++) {
    const a = records[i], b = records[j];
    if (a.label === b.label && a.label !== 'User-reported context' && a.text !== b.text && !conflicts.some(c => c.evidenceIds.includes(a.id) && c.evidenceIds.includes(b.id)))
      conflicts.push({ concept: CONCEPTS.find(([, re]) => re.test(a.label))?.[0] || 'unresolved', evidenceIds: [a.id, b.id], status: 'requires_reconciliation' });
  }
  return freeze({ version: 2, records, atoms, comparisons, conflicts, omittedInformation: 'unknown' });
}

module.exports = { buildClinicalEvidenceLedger, freeze };
