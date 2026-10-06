const { createHash } = require('node:crypto');
const legacy = require('../../priority-map-intelligence');
const p1 = require('../../priority-map-p1');
const { validatePriorityMapReliability, validatePriorityMapContract, assessDeterministicUrgency } = require('../../server');
const { positive, adversaries } = require('./fixtures');
const DIMENSIONS = Object.freeze({ intelligence: ['synthesis', 'mechanism_explanation', 'discriminating_assessment', 'conditional_interpretation'], product: ['prioritization', 'specificity', 'teaching_value', 'bedside_clarity'] });
const signature = item => createHash('sha256').update(JSON.stringify({ snapshot: item.snapshot, reasoning: item.reasoning })).digest('hex');

// Exact authored fixtures only. An arbitrary new/model response cannot inherit
// a score by containing keywords, reusing an ID or attaching its own scorecard.
const reviews = new Map(require('./reviews.json').map(review => [review.id, review]));
const GROUNDING_CODES = /evidence|schema|unsupported_(?:negative|finding|number|temporal|diagnosis|measurement)|numeric_repetition|temporal_grounding|unchanged/;

function qualityGate(review, name) {
  if (!review) return { status: 'NOT_REVIEWED', score: null, reason: 'An output-specific clinical/product review is required.' };
  const scores = review.scores[name];
  if (!review.rationale || !Array.isArray(scores) || scores.length !== 4 || scores.some(x => !Number.isInteger(x) || x < 0 || x > 2)) return { status: 'NOT_REVIEWED', score: null, reason: 'Invalid review scorecard.' };
  const dimensions = Object.fromEntries(DIMENSIONS[name].map((key, i) => [key, scores[i]]));
  const score = scores.reduce((a, b) => a + b, 0);
  const pass = score >= 6 && scores.every(x => x > 0) && (name !== 'product' || review.preferredToReadback);
  return { status: pass ? 'PASS' : 'FAIL', score, dimensions, reviewBasis: 'fixture-author, not live-model or clinician validation', rationale: review.rationale };
}

function evaluate(item) {
  const evidence = legacy.buildEvidence(item.snapshot, assessDeterministicUrgency(item.snapshot).urgency);
  const raw = JSON.stringify(item.reasoning);
  const issues = p1.validateReasoning(item.snapshot, raw, evidence, validatePriorityMapReliability);
  let displayed = null;
  const schemaValid = !issues.includes('invalid_reasoning_schema');
  if (schemaValid) {
    displayed = p1.composePriorityMap(evidence, item.reasoning);
    issues.push(...validatePriorityMapContract(displayed), ...validatePriorityMapReliability(item.snapshot, displayed));
  }
  const review = reviews.get(item.id);
  const exactReview = review?.signature === signature(item) ? review : null;
  const groundingCodes = [...new Set(issues.filter(code => GROUNDING_CODES.test(code)))];
  if (exactReview && !exactReview.evidenceRelevant) groundingCodes.push('irrelevant_evidence_reference');
  const safetyCodes = [...new Set(issues.filter(code => !GROUNDING_CODES.test(code)))];
  if (!schemaValid) safetyCodes.push('unassessed_invalid_schema');
  // Missing human semantic review is not silently converted into a grounding pass.
  const grounding = { status: groundingCodes.length ? 'FAIL' : exactReview ? 'PASS' : 'NOT_REVIEWED', codes: groundingCodes };
  const safety = { status: safetyCodes.length || issues.some(c => /unsupported_negative|unsupported_diagnosis|unsupported_finding|unsupported_number/.test(c)) ? 'FAIL' : 'PASS', codes: [...new Set([...safetyCodes, ...issues.filter(c => /unsupported_negative|unsupported_diagnosis|unsupported_finding|unsupported_number/.test(c))])] };
  const gates = { grounding, safety, clinical_intelligence: qualityGate(exactReview, 'intelligence'), product_value: qualityGate(exactReview, 'product') };
  return { id: item.id, mode: 'offline-authored-fixture', status: Object.values(gates).every(g => g.status === 'PASS') ? 'PASS' : 'FAIL', gates, urgency: evidence.urgency, providerCalls: 0, requiresFutureClinicalReview: true, displayed };
}

function run() {
  return [...positive, ...adversaries()].map(item => {
    const result = evaluate(item);
    // Benchmark output contains scores/metadata, not generated clinical content.
    const { displayed: _displayed, ...metadata } = result;
    return metadata;
  });
}
module.exports = { DIMENSIONS, evaluate, run };
