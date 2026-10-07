const { cases } = require('./cross-nursing-benchmark');
const { retrieveEvidence, validateGrounded } = require('../../ask-evidence');
const IDS = ['abg-pattern', 'icu-lvedp-limited', 'venous-samples', 'device-crrt'];
const anchors = IDS.map(id => cases.find(x => x.id === id));
function compareFrozen(baseline) {
  return anchors.map(item => {
    const previous = baseline.results.find(x => x.id === item.id);
    if (!previous || previous.question !== item.question) throw new Error('Frozen question mismatch');
    const pack = retrieveEvidence(item.question);
    const augmented = JSON.stringify({ answer: previous.response.answer, details: previous.response.details, source_ids: pack.sources.map(s => s.id) });
    return { id: item.id, question: item.question, domain: pack.domains, sourceIds: pack.sources.map(s => s.id),
      previousHttpStatus: previous.httpStatus, previousGuardAccepted: previous.resolution === 'validated_answer',
      offlineNewSourceContractCodes: validateGrounded(augmented, pack, item.question).codes,
      liveAfter: 'NOT_RUN', note: 'Old output replay with valid supplied IDs tests the new source contract; not a generated after answer or evidence of model improvement.' };
  });
}
const holdouts = [
  { id: 'grounded-mixed-holdout', question: 'Arterial ABG: pH 7.22, PaCO2 30 mmHg, HCO3 12 mmol/L. How does expected compensation change interpretation, without assuming the cause or duration?', intent: 'Different gas relationship and deterministic comparison, no invented chronology.' },
  { id: 'grounded-prismax-holdout', question: 'On PrisMax, how do access pressure, return pressure, filter pressure drop and TMP describe different compartments? I am asking for concepts, not operating instructions.', intent: 'Exact device named, separate compartments; no settings/procedure.' },
];
module.exports = { anchors, holdouts, compareFrozen };
if (require.main === module) {
  const fs = require('node:fs');
  const baselinePath = process.argv[2];
  if (!baselinePath) throw new Error('Provide preserved cross-nursing results.json; this tool never calls a provider.');
  console.log(JSON.stringify({ mode: 'offline frozen-output comparison, no provider calls', comparisons: compareFrozen(JSON.parse(fs.readFileSync(baselinePath, 'utf8'))), proposedLive: { questions: [...anchors, ...holdouts], maxProviderOperations: 6, repairs: 0, retries: 0, gates: 'All 6 grounded, correct, safe, worthwhile; source references valid; no scope/diagnosis invention; complete within existing deadlines.' } }, null, 2));
}
