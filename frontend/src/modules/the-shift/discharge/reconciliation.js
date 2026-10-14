import { documents, script } from './data.js';

const line = id => documents.flatMap(document => document.lines).find(([key]) => key === id)[1];
const cell = (ids, empty = '') => ({ ids, text: ids.map(line), empty });

// One selection represents a concern, not an incorrect order. Retain the existing
// line-ID storage contract so completed first decisions are never regraded.
export const comparisons = [
  {
    id: 'apixaban', title: 'Apixaban', label: 'Blood thinner',
    cells: [cell(['home-apixaban']), cell(['stop-apixaban']), cell(['continue-thinner', 'resume-all'])],
    flags: ['stop-apixaban', 'continue-thinner', 'resume-all'],
    feedbackTitle: 'Conflicting directions',
    feedback: `${script.conflict} The home list records what he previously took; it is not the conflicting discharge instruction.`,
  },
  {
    id: 'water-pill', title: 'Lasix / furosemide', label: 'Water pill',
    cells: [cell(['home-lasix']), cell(['new-furosemide']), cell(['resume-all'])],
    flags: ['home-lasix', 'new-furosemide'], feedbackTitle: 'Patient-education concern', feedback: script.names,
  },
  {
    id: 'metoprolol', title: 'Metoprolol', label: 'Heart medication',
    cells: [cell(['home-metoprolol']), cell(['new-metoprolol']), cell(['resume-all'])],
    flags: ['home-metoprolol', 'new-metoprolol'], feedbackTitle: 'Different wording, same plan', feedback: script.timing,
  },
  {
    id: 'atorvastatin', title: 'Atorvastatin', label: 'Cholesterol medication',
    cells: [cell(['home-atorvastatin']), cell(['new-atorvastatin']), cell(['resume-all'])],
    flags: ['home-atorvastatin', 'new-atorvastatin'], feedbackTitle: 'Matching medication entries', feedback: 'Both medication lists say atorvastatin at bedtime. No discrepancy is shown for this medication.',
  },
  {
    id: 'pantoprazole', title: 'Pantoprazole', label: 'Stomach protection',
    cells: [cell([], 'Not listed in the home document.'), cell(['new-pantoprazole']), cell(['resume-all'])],
    flags: ['new-pantoprazole'], feedbackTitle: 'Expected change', feedback: `New pantoprazole: ${script.expected}`,
  },
  {
    id: 'gi-followup', title: 'GI follow-up', label: 'Discharge follow-up',
    cells: [cell([], 'No follow-up information in the home medication list.'), cell(['stop-apixaban']), cell(['gi-visit'])],
    flags: ['gi-visit'], feedbackTitle: 'Follow-up safety concern', feedback: script.followup,
  },
];
export const selectedComparisons = flags => comparisons.filter(item => item.flags.some(id => flags.includes(id))).map(item => item.id);
export const flagsForComparisons = ids => comparisons.filter(item => ids.includes(item.id)).flatMap(item => item.flags);
export function toggleComparison(flags, id) {
  const selected = selectedComparisons(flags);
  return flagsForComparisons(selected.includes(id) ? selected.filter(key => key !== id) : [...selected, id]);
}
export const concernCount = flags => selectedComparisons(flags).length;
