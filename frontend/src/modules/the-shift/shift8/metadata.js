import { VERSION, SOURCES } from './data.js';
import { KEYS, fresh, readStore } from './engine.js';

const readProgress = () => {
  const saved = readStore({ getItem: key => localStorage.getItem(key) }, 'main');
  return saved.value || { ...fresh(), blocked: true };
};
export const shift8Entry = {
  id: 'code-blue', scenarioId: 'SHIFT-008', contentVersion: VERSION, number: '08', title: 'Code Blue',
  specialty: 'Med-Surg', difficulty: 'Team coordination', duration: 'About 8–10 minutes', analytics: false,
  description: 'One patient. A growing team. Keep the response coordinated as your role changes.',
  objectives: ['Act early in the fictional opening.', 'Keep requests, acknowledgments and completed tasks distinct.', 'Preserve the clinical story through recording and handoff.'],
  interactions: ['ordered-actions', 'team-delegation', 'clearance-confirmation', 'code-record', 'handoff', 'replay', 'rewind'],
  review: {
    status: 'Founder reports complete-scenario approval, including Exception E-1, by an independent confidential medical-surgical nurse educator.',
    reviewer: 'Confidential nurse educator (founder-attested)', reviewDate: null, approvedVersion: VERSION,
    sourceVerification: 'Approval is founder-attested; no signed reviewer record, independently documented approval or formal clinical validation is claimed. Manual-device claims are mapped to official sources. Claim 25 is a fictional case-specific rationale, not a universal hospital policy.',
  },
  sources: SOURCES.map(([id, title, url]) => ({ id, title, url, scope: 'Educational source; not a clinical endorsement of this fictional case.', limitation: id === 'S11' ? 'ERC supports manual-device principles, not nursing privileges or US medication timing.' : id === 'S14' ? 'Indirect ethical context only; does not establish a universal code-status policy.' : 'Follow local protocol and the treating team in practice.' })),
  storageKey: KEYS.main, readProgress, finalStage: 'debrief', stageTitle: () => 'Code Blue',
  progressLabel: p => p.blocked ? 'Saved progress unavailable' : p.stage === 'debrief' ? 'Debrief reached' : p.stage === 'report' && !Object.keys(p.answers).length ? 'Not started' : 'Continue: Code Blue',
  image: '../assignment-poster.svg', imageAlt: 'Original fictional nursing assignment illustration.', recommendations: [],
};
