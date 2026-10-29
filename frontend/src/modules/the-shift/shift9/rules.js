import { d1, d2, d3, d4, d5, debrief, TOKENS, TARGETS } from './data.js';

// Result labels are shown exactly as the spec writes them. Credit is tracked separately:
// Correct earns full credit, Close earns partial credit, every other label earns none.
// No timers and no speed scoring.
export const credit = label => label === 'Correct' ? 'full' : label === 'Close' ? 'partial' : 'none';

const find = (items, id) => items.find(item => item.id === id) || null;
export const d2Choice = id => find(d2.choices, id);
export const d3Choice = id => find(d3.choices, id);
export const d4Choice = id => find(d4.choices, id);
export const d5Choice = id => find(d5.choices, id);

const TOKEN_IDS = TOKENS.map(token => token.id);
const TARGET_IDS = TARGETS.map(target => target.id);
export const validPlacement = value => Boolean(value) && TOKEN_IDS.every(id => TARGET_IDS.includes(value[id]));

// Each D1 rule (v0.8), read against a complete placement { you, tess, marco }. Every placement fires at least one
// rule about each RN and one about Marco, and every no-credit placement fires at least one No rule.
const rns = p => [p.you, p.tess];
const rnsIn = (p, room) => rns(p).filter(target => target === room).length;
const RULE_TESTS = {
  rn22: p => rnsIn(p, '22') > 0,
  noRn22: p => rnsIn(p, '22') === 0,
  bothRn22: p => rnsIn(p, '22') === 2,
  rn21: p => rnsIn(p, '21') === 1,
  bothRn21: p => rnsIn(p, '21') === 2,
  rnElsewhere: p => rns(p).some(target => target === '23' || target === 'station'),
  marcoAlone21: p => p.marco === '21' && rnsIn(p, '21') === 0,
  noOne21: p => rnsIn(p, '21') === 0 && p.marco !== '21',
  marco23: p => p.marco === '23',
  marcoBackup21: p => p.marco === '21' && rnsIn(p, '21') > 0,
  marco22: p => p.marco === '22' && rnsIn(p, '22') > 0,
  marcoAlone22: p => p.marco === '22' && rnsIn(p, '22') === 0,
  marcoStation: p => p.marco === 'station',
};

// Full credit: one RN in 22, the other RN in 21, and Marco in a room. Partial credit (Close) when the RNs are right
// and Marco stays at the station. Any other RN placement earns none and continues on a guided safer path.
export function evaluateAssignment(placement) {
  if (!validPlacement(placement)) return null;
  const rnsRight = rnsIn(placement, '22') === 1 && rnsIn(placement, '21') === 1;
  // Marco's station line only says both RN patients are covered when they are.
  const fired = d1.rules.filter(rule => RULE_TESTS[rule.id](placement))
    .map(rule => rule.feedbackWhenGap && !rnsRight ? { ...rule, feedback: rule.feedbackWhenGap } : rule);
  const has = id => fired.some(rule => rule.id === id);
  const result = rnsRight ? (placement.marco === 'station' ? 'Close' : 'Correct') : has('noRn22') ? 'No (unsafe)' : 'No';
  // The story follows the RN placement: Path B when Tess alone took Room 22, otherwise Path A.
  const path = placement.tess === '22' && placement.you !== '22' ? 'b' : 'a';
  return { fired, full: result === 'Correct', result, path, guided: !rnsRight, marcoAt: placement.marco, marcoAt21: placement.marco === '21' };
}

// D1 feedback per person (v0.10): each team member's own placement and the rule that explains it, then any room
// left without coverage. Every fired rule appears exactly once.
const RN_RULE = { 22: ['bothRn22', 'rn22'], 21: ['bothRn21', 'rn21'], 23: ['rnElsewhere'], station: ['rnElsewhere'] };
const MARCO_RULE = { 21: ['marcoBackup21', 'marcoAlone21'], 22: ['marco22', 'marcoAlone22'], 23: ['marco23'], station: ['marcoStation'] };
export function assignmentBreakdown(placement) {
  const result = evaluateAssignment(placement);
  if (!result) return null;
  const byId = Object.fromEntries(result.fired.map(rule => [rule.id, rule]));
  const pick = ids => ids.map(id => byId[id]).find(Boolean);
  const staff = TOKENS.map(token => {
    const target = placement[token.id];
    const rule = pick((token.role === 'RN' ? RN_RULE : MARCO_RULE)[target]);
    return { token, target: TARGETS.find(t => t.id === target), rule };
  });
  const used = new Set(staff.map(s => s.rule.id));
  // rn22 is only listed under coverage when both RNs went to Room 22 (each RN then carries the "both" rule).
  const coverage = result.fired.filter(rule => !used.has(rule.id) && rule.id !== 'rn22');
  return { ...result, staff, coverage };
}

// One result per decision for the personalized review.
export function decisionResults(answers) {
  const results = {
    d1: evaluateAssignment(answers.d1)?.result ?? null,
    d2: d2Choice(answers.d2)?.result ?? null,
    d3: d3Choice(answers.d3)?.result ?? null,
    d4: d4Choice(answers.d4)?.result ?? null,
    d5: d5Choice(answers.d5)?.result ?? null,
  };
  return Object.fromEntries(Object.entries(results).map(([key, result]) => [key, { result, credit: result ? credit(result) : null }]));
}

// The review line that matches what the learner actually chose (v0.8). `concept` is shown only when not full credit.
export function reviewLine(decision, answers) {
  const lines = debrief.review[decision];
  const { result, credit: earned } = decisionResults(answers)[decision];
  if (!result) return null;
  const line = (text, concept = lines.concept) => ({ text, concept: earned === 'full' ? null : concept });
  if (earned === 'full') return line(lines.correct);
  if (decision === 'd1') {
    if (result === 'Close') return line(lines.close, lines.closeConcept);
    return line(evaluateAssignment(answers.d1).fired.some(rule => rule.id === 'noRn22') ? lines.missed : lines.room21);
  }
  if (decision === 'd2' && earned === 'partial') return line(lines.close, lines.closeConcept);
  if (decision === 'd4' && answers.d4 === 'agree') return line(lines.agree);
  if (decision === 'd5' && answers.d5 === 'notify') return line(lines.notify);
  // D3's V1 to V4 choice shows the missed line, as the spec directs.
  return line(lines.missed);
}

// Guided safer path after each decision (v0.8), following the Shift 06 pattern: D1 when the RN placement is wrong,
// D2 for anything but Escalate now, D3 to D5 when the choice earns no credit.
export function guidedAfter(decision, answers) {
  if (decision === 'd1') return Boolean(evaluateAssignment(answers.d1)?.guided);
  if (decision === 'd2') return answers.d2 !== undefined && answers.d2 !== 'escalate';
  const { credit: earned } = decisionResults(answers)[decision];
  return earned === 'none';
}
export const anyGuided = answers => ['d1', 'd2', 'd3', 'd4', 'd5'].some(decision => guidedAfter(decision, answers));
