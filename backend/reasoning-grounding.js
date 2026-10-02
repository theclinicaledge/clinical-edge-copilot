function assertionClauses(text) {
  return String(text).split(/(?<=[.!?])\s+|[;\n]|\b(?:but|however|yet|whereas|while|and)\b/i).map(part => part.trim()).filter(Boolean);
}

function assertionIsQualified(clause, index) {
  const prefix = clause.slice(0, index).slice(-100);
  if (/\bnot only\s*$|\b(?:cannot|can't)\s+not\s*$/i.test(prefix)) return false;
  return /\b(?:cannot|can't|does not|do not|did not|is not|are not|not|never|unable to|insufficient (?:information|evidence) to|not enough (?:information|evidence) to)\s+(?:\w+\s+){0,3}$/i.test(prefix)
    || /^whether\s+(?:\w+\s+){0,8}$/i.test(prefix.trimStart())
    || /\b(?:cannot|can't|does not|do not|insufficient information to|not enough information to)\s+(?:confirm|determine|conclude|establish)\s+(?:that\s+)?[\w\s]{0,45}$/i.test(prefix)
    || /\b(?:may|might|could|possibly|potentially|possible|potential)\s+(?:\w+\s+){0,3}$/i.test(prefix);
}

function hasAffirmativeCertainty(text, includeCausality = false) {
  const pattern = includeCausality
    ? /\b(?:confirms?|proves?|establish(?:es)? (?:a |the )?(?:diagnosis|cause|causality|shock|sepsis|stroke|pneumonia|infection)|diagnostic of|due to|caused by|causes|explains|rules? out|excludes?|definitely|certainly|classic for|strongly indicates?|(?:this|the pattern|these findings)\s+(?:is|are|represents?)\s+(?!(?:uncertain|unknown|unresolved|not|possibly|potentially|a possible|a potential|consistent with a possible)\b))\b/gi
    : /\b(?:confirms?|proves?|establish(?:es)? (?:a |the )?(?:diagnosis|cause|causality|shock|sepsis|stroke|pneumonia|infection)|diagnostic of|classic for|classic [^.;\n]{0,35} trajectory|strongly indicates?)\b/gi;
  return assertionClauses(text).some(clause => [...clause.matchAll(pattern)].some(match => !assertionIsQualified(clause, match.index)));
}

function numericContractIssues(source, text) {
  const numbers = value => [...String(value).replace(/\b(?:CO2|O2|SpO2|PaCO2|HCO3)\b/gi, '').matchAll(/\d+(?:\.\d+)?s?/gi)].map(match => match[0].toLowerCase());
  const supplied = new Set(numbers(source));
  const generated = numbers(text);
  const issues = [];
  if (generated.some(number => supplied.has(number))) issues.push('reasoning_numeric_repetition_contract');
  if (generated.some(number => !supplied.has(number))) issues.push('reasoning_unsupported_number');
  return issues;
}

function negativeFindings(text) {
  const result = [];
  for (const clause of assertionClauses(text)) {
    // A list of unprovided investigations is missing information, not normal results.
    if (/^(?:no|without)\s+[\w\s,/-]+\b(?:supplied|provided|documented|assessed)\s*[.!]?$/i.test(clause)) continue;
    for (const match of clause.matchAll(/\b(?:no|without|denies?|absent)\s+([^,.:;!?]+)/gi)) {
      const concept = match[1].trim().toLowerCase().replace(/^(?:any|a|an)\s+/, '');
      // Missing documentation is not a negative exam or history finding.
      if (/\b(?:provided|supplied|documented|assessed|established|confirmed)\b/.test(concept)
        || /\b(?:information|data|context|measurements?|readings?)\b/.test(concept)
        || /^(?:establishing|confirming|proving|determining|concluding|assuming|inferring)\b/.test(concept)
        || /\b(?:comparators?|comparisons?)\b/.test(concept)
        || /^(?:baseline BP|exact BP|baseline status)$/i.test(concept)) continue;
      result.push(concept);
    }
    const field = clause.match(/^-?\s*([^:]+):\s*(?:absent|none|denied|negative)\s*$/i);
    if (field) result.push(field[1].trim().toLowerCase());
  }
  return result;
}

function unsupportedNegativeFindings(source, text) {
  const supplied = new Set(negativeFindings(source));
  return negativeFindings(text).filter(finding => !supplied.has(finding));
}

// Labels identify established conditions, not a differential lookup or case template.
const DIAGNOSIS_LABELS = [
  'hypertensive urgency', 'hypertensive emergency', 'hypertensive encephalopathy',
  'cardiogenic shock', 'septic shock', 'hypovolemic shock', 'hemorrhagic shock',
  'sepsis', 'pneumonia', 'meningitis', 'encephalitis', 'stroke', 'intracranial hemorrhage',
  'hypercapnic respiratory failure', 'hypoxemic respiratory failure', 'respiratory failure',
  'atrial fibrillation', 'atrial flutter', 'ventricular tachycardia', 'supraventricular tachycardia',
  'pulmonary embolism', 'myocardial infarction', 'acute kidney injury',
];

function diagnosisIsEstablished(source, label) {
  return assertionClauses(source).some(clause => clause.toLowerCase().includes(label)
    && /\b(?:known|documented|confirmed|diagnosed|established)\b/i.test(clause)
    && !/\b(?:not|no|cannot|unknown|unconfirmed|possible|possibly|suspected|may|could|might)\b/i.test(clause));
}

function unsupportedDiagnosisLabels(source, text) {
  return DIAGNOSIS_LABELS.filter(label => new RegExp(`\\b${label}\\b`, 'i').test(text) && !diagnosisIsEstablished(source, label));
}

module.exports = { assertionClauses, assertionIsQualified, hasAffirmativeCertainty, numericContractIssues, unsupportedNegativeFindings, unsupportedDiagnosisLabels, diagnosisIsEstablished };
