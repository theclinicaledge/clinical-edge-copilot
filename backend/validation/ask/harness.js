const { createHash } = require('node:crypto');
const { validateAskAnswer } = require('../../ask-clinical-edge');
const { positive, negative } = require('./fixtures');
const DIMENSIONS = ['factual_relevance', 'nursing_usefulness', 'safety', 'teaching_quality', 'directness', 'uncertainty'];
const signature = item => createHash('sha256').update(JSON.stringify({ question: item.question, answer: item.answer })).digest('hex');
const reviews = new Map(require('./reviews.json').map(item => [item.id, item]));

function evaluate(item) {
  const validation = validateAskAnswer(JSON.stringify({ answer: item.answer }));
  const review = reviews.get(item.id);
  const known = review?.signature === signature(item) && review.rationale && DIMENSIONS.every(d => Number.isInteger(review.scores[d]) && review.scores[d] >= 0 && review.scores[d] <= 2);
  const gates = Object.fromEntries(DIMENSIONS.map(d => [d, { status: !known ? 'NOT_REVIEWED' : review.scores[d] === 0 || (d === 'factual_relevance' && review.scores[d] !== 2) ? 'FAIL' : 'PASS', score: known ? review.scores[d] : null }]));
  if (validation.codes.length) gates.safety.status = 'FAIL';
  const quality = known ? DIMENSIONS.filter(d => d !== 'safety').reduce((n, d) => n + review.scores[d], 0) : null;
  return { id: item.id, family: item.family, level: item.level, mode: 'offline-authored-fixture',
    status: validation.answer && quality >= 8 && Object.values(gates).every(g => g.status === 'PASS') ? 'PASS' : 'FAIL',
    gates, rejectionCodes: validation.codes, providerCalls: 0, reviewBasis: 'Pinned fixture-author judgment, not clinician or live-model validation', requiresFutureClinicalReview: true };
}
function run() { return [...positive, ...negative].map(evaluate); }
module.exports = { DIMENSIONS, signature, evaluate, run };
