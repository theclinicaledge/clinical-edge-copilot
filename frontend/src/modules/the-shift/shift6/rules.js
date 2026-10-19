import { d1, d2, d3, d4, d5, d6 } from './data.js';

// Result labels are shown exactly as the spec writes them. Credit is tracked separately:
// Correct earns full credit, Close earns partial credit, every other label earns none.
// No timers and no speed scoring.
export const credit = label => label === 'Correct' ? 'full' : label === 'Close' ? 'partial' : 'none';

const find = (items, id) => items.find(item => item.id === id) || null;
export const d1Choice = id => find(d1.choices, id);
export const d2Choice = id => find(d2.choices, id);
export const d4Choice = id => find(d4.choices, id);
export const d6Choice = id => find(d6.choices, id);
export const d5Recommendation = id => find(d5.recommendations, id);

const tierCount = (items, selected, tier) => items.filter(item => item.tier === tier && selected.includes(item.id)).length;
const essentialTotal = items => items.filter(item => item.tier === 'Essential').length;

// Tiered selections: all Essential items are required for full credit. Supporting items are
// credited but never required, and Not relevant picks carry a gentle note with no penalty.
// The spec has no label for a partial tiered result; Close (some Essential) and No (none) are used.
export function evaluateCues(selected) {
  const essential = tierCount(d3.cues, selected, 'Essential');
  const total = essentialTotal(d3.cues);
  return {
    essential, essentialTotal: total,
    supporting: tierCount(d3.cues, selected, 'Supporting'),
    notRelevant: d3.cues.filter(cue => cue.tier === 'Not relevant' && selected.includes(cue.id)),
    result: essential === total ? 'Correct' : essential > 0 ? 'Close' : 'No',
  };
}

// Full credit needs all three Essential chips plus the Correct recommendation.
export function evaluateSbar({ chips = [], recommendation = null } = {}) {
  const essential = tierCount(d5.chips, chips, 'Essential');
  const total = essentialTotal(d5.chips);
  const recommendationChoice = d5Recommendation(recommendation);
  const recommendationCorrect = recommendationChoice?.result === 'Correct';
  return {
    essential, essentialTotal: total,
    supporting: tierCount(d5.chips, chips, 'Supporting'),
    notRelevant: d5.chips.filter(chip => chip.tier === 'Not relevant' && chips.includes(chip.id)),
    recommendation: recommendationChoice,
    result: essential === total && recommendationCorrect ? 'Correct' : essential > 0 || recommendationCorrect ? 'Close' : 'No',
  };
}

// One result per decision for the personalized review.
export function decisionResults(answers) {
  const results = {
    d1: d1Choice(answers.d1)?.result ?? null,
    d2: d2Choice(answers.d2)?.result ?? null,
    d3: Array.isArray(answers.d3) ? evaluateCues(answers.d3).result : null,
    d4: d4Choice(answers.d4)?.result ?? null,
    d5: answers.d5 ? evaluateSbar(answers.d5).result : null,
    d6: d6Choice(answers.d6)?.result ?? null,
  };
  return Object.fromEntries(Object.entries(results).map(([key, result]) => [key, { result, credit: result ? credit(result) : null }]));
}
