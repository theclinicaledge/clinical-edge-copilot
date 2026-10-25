import { d1, d2, d3, d4, d5, TOKENS, TARGETS } from './data.js';

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

// Each D1 rule from the spec table, read against a complete placement { you, tess, marco }.
const RULE_TESTS = {
  rn22: p => p.you === '22' || p.tess === '22',
  noRn22: p => p.you !== '22' && p.tess !== '22',
  rn21: p => (p.you === '22' && p.tess === '21') || (p.tess === '22' && p.you === '21'),
  marcoAlone21: p => p.marco === '21' && p.you !== '21' && p.tess !== '21',
  marco23: p => p.marco === '23',
  marcoBackup21: p => p.marco === '21' && (p.you === '21' || p.tess === '21'),
  noOne21: p => p.you !== '21' && p.tess !== '21' && p.marco !== '21',
};

// Full credit: one RN in 22, the other RN in 21, and Marco in 23 or backing up at 21. The spec gives
// D1 no partial credit, so any other placement earns none. Placements the table doesn't cover
// (for example, Marco at the station) fire no rule for that token and earn no credit.
export function evaluateAssignment(placement) {
  if (!validPlacement(placement)) return null;
  const fired = d1.rules.filter(rule => RULE_TESTS[rule.id](placement));
  const has = id => fired.some(rule => rule.id === id);
  const full = has('rn22') && has('rn21') && (has('marco23') || has('marcoBackup21'));
  const result = full ? 'Correct' : fired.some(rule => rule.result === 'No (unsafe)') ? 'No (unsafe)' : 'No';
  // Path B only when Tess alone took Room 22; every other placement follows Path A.
  const path = placement.tess === '22' && placement.you !== '22' ? 'b' : 'a';
  return { fired, full, result, path, guided: !full, marcoAt21: placement.marco === '21' };
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
