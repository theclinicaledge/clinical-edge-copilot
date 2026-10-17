import { scenario, stages } from '../scenario.js';
import { script, references, scenes } from '../monitor/data.js';
import { readProgress, STORAGE_KEY } from '../progress.js';
import { read, KEY } from '../monitor/progress.js';
import { AUTHORING } from './authoring.js';
import { script as discharge, sources as dischargeSources, scenes as dischargeScenes } from '../discharge/data.js';
import { read as readDischarge, KEY as DISCHARGE_KEY } from '../discharge/progress.js';
import { CONVERSATION_ENABLED } from '../conversation/private.js';
import { conversationEntry } from '../conversation/metadata.js';

const reportedReview = version => ({ status: 'Independent nurse approval reported by founder', independentStatus: 'Founder-reported approval', reviewer: null, reviewDate: null, approvedVersion: version });
const sourceAccess = {
  bts: ['https://doi.org/10.1136/thoraxjnl-2016-209729', 'Section 6.3.2 addresses rebound hypoxaemia after abrupt withdrawal. General guidance is not an individualized oxygen order.'],
  copd: ['https://doi.org/10.1186/cc11475', 'Mechanism review; does not establish the cause of the fictional patient\'s deterioration.'],
  abg: ['https://www.merckmanuals.com/professional/multimedia/table/primary-changes-and-compensations-in-simple-acid-base-disorders', 'Approximate compensation in simple disorders; does not establish chronicity or exclude a mixed disorder in this case.'],
  acidbase: ['https://www.merckmanuals.com/professional/nephrology/acid-base-regulation-and-disorders/acid-base-disorders', 'Acidemia, acidifying processes and compensation must be distinguished. Scenario-package approval is founder-reported; passage-level source verification is not documented.'],
  rrt: ['https://psnet.ahrq.gov/primer/rapid-response-systems', 'General rapid-response principles. Facility criteria and scope vary.'],
  judgment: ['https://openstax.org/books/medical-surgical-nursing/pages/6-1-critical-thinking-in-assessment', 'Educational judgment framework, not validation of this scenario or its decisions.'],
  af: ['https://www.jacc.org/doi/10.1016/j.jacc.2023.08.017', 'Joint 2023 guideline, JACC publication. ECG criteria do not establish an individual cause or management plan.'],
  artifact: ['https://pubmed.ncbi.nlm.nih.gov/10528037/', 'Primary paper metadata and abstract verified. It illustrates consequences of misclassification, not a validated diagnostic rule.'],
  'artifact-case': ['https://www.aafp.org/pubs/afp/issues/2006/0915/p921.html', 'Single published case, not a validated rule. Link only; no copyrighted figure or article passage copied.'],
  monitoring: ['https://pubmed.ncbi.nlm.nih.gov/28974521/', 'Primary statement abstract verified. Specific electrode and alarm-management passages remain for qualified source review.'],
  nursing: ['https://www.merckmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/atrial-fibrillation', 'AF clinical context only. Not verification of every alternative rhythm, local protocol or constructed ECG.'],
};
const sourceTypes = { bts: 'Guideline', copd: 'Peer-reviewed article', abg: 'Clinical reference', acidbase: 'Clinical reference', rrt: 'Government source', judgment: 'Open textbook', af: 'Guideline', artifact: 'Peer-reviewed article', 'artifact-case': 'Case report', monitoring: 'Scientific statement', nursing: 'Clinical reference' };
const sourceYears = { bts: 2017, copd: 2012, af: 2023, artifact: 1999, 'artifact-case': 2006, monitoring: 2017 };
const source = (item, index) => ({ ...item, number: index + 1, type: sourceTypes[item.id], citedYear: sourceYears[item.id] ?? null, openedAndCheckedBy: null, url: sourceAccess[item.id][0], limitation: sourceAccess[item.id][1], applicabilityReviewed: false });

// Metadata and navigation only. Each authored scenario owns its decisions, feedback and debrief.
export const SHIFTS = [
  {
    id: 'drowsy-patient', ...AUTHORING['drowsy-patient'], number: '01', title: scenario.title,
    specialty: 'Med-Surg', difficulty: 'Foundations', duration: 'About 5 minutes',
    description: 'Three patients. One subtle change. Follow the findings beyond the saturation number.',
    objectives: ['Prioritize a change in consciousness.', 'Distinguish oxygenation from ventilation.', 'Escalate deterioration before waiting for labs.', 'Read respiratory acidosis with elevated bicarbonate.', 'Communicate a focused SBAR.'],
    interactions: ['patient-report', 'cue-discovery', 'prioritization', 'abg-interpretation', 'sbar-selection'],
    review: reportedReview('2.1'), sources: scenario.references.map(source),
    storageKey: STORAGE_KEY, readProgress, finalStage: 6, stageTitle: state => stages[state.stage].label,
    image: '../assignment-poster.svg', imageAlt: 'Original fictional illustration of three equally weighted room assignment cards.',
    askQuestion: scenario.ask,
    recommendations: [
      { id: 'abg', title: 'Practice respiratory acidosis', detail: 'Open the existing ABG Lab example, then interpret its values.', path: '/abg-lab/resp-acidosis' },
      { id: 'ask', title: 'Ask why', detail: 'Bring the oxygenation-versus-ventilation question to Ask.', path: '/ask' },
    ],
  },
  {
    id: 'monitor-alarm', ...AUTHORING['monitor-alarm'], number: '02', title: 'The Monitor Alarm',
    specialty: 'Telemetry', difficulty: 'Foundations', duration: 'One short shift',
    description: 'A loud alarm. A quieter change. Look closer, assess the patient and connect the clues.',
    objectives: ['Respond to the patient behind an alarm.', 'Investigate artifact and underlying QRS complexes.', 'Compare sinus rhythm with atrial fibrillation.', 'Connect rhythm findings with patient assessment.', 'Build a focused SBAR.'],
    interactions: ['telemetry-monitor', 'graphical-ecg-examination', 'rhythm-comparison', 'cue-discovery', 'action-selection', 'sbar-construction'],
    review: reportedReview('2.1'), sources: references.map(([id, title, scope], index) => source({ id, title, scope }, index)),
    storageKey: KEY, readProgress: read, finalStage: 7, stageTitle: state => scenes[state.stage][1],
    image: '../monitor/captures/ecg/390-comparison.png', imageAlt: 'Monitor Alarm illustration comparing constructed sinus and atrial fibrillation illustrations.',
    askQuestion: script.ask,
    recommendations: [
      { id: 'potassium', title: 'Potassium reference', detail: 'Existing Reference Hub material.', path: '/reference-hub/potassium' },
      { id: 'magnesium', title: 'Magnesium reference', detail: 'Existing Reference Hub material.', path: '/reference-hub/magnesium' },
      { id: 'ask', title: 'Ask why', detail: 'Bring the rhythm-and-blood-pressure question to Ask.', path: '/ask' },
    ],
  },
  {
    id: 'discharge-puzzle', ...AUTHORING['discharge-puzzle'], number: '03', title: 'The Discharge Puzzle',
    specialty: 'Med-Surg', difficulty: 'Foundations', duration: '5 to 6 minutes',
    description: 'A discharge deadline. Conflicting papers. Two bottles that change the conversation.',
    objectives: ['Compare admission and discharge medication documents.', 'Distinguish a discrepancy from an expected change.', 'Route order conflicts to the prescriber under time pressure.', 'Use open-ended, show-me teach-back.', 'Recognize brand and generic duplication at home.'],
    interactions: ['medication-comparison', 'concern-flagging', 'progress-note', 'action-selection', 'teach-back', 'bottle-investigation'],
    review: reportedReview('0.3'), sources: dischargeSources,
    storageKey: DISCHARGE_KEY, readProgress: readDischarge, finalStage: 6, stageTitle: state => dischargeScenes[state.stage][1],
    image: '../discharge/poster.svg', imageAlt: 'Original fictional illustration of three discharge documents and two medication bottles.',
    askQuestion: discharge.ask, askQuestions: { names: discharge.askNames },
    recommendations: [
      { id: 'ask', title: 'Ask why', detail: discharge.ask, path: '/ask' },
      { id: 'names', title: 'Ask about names', detail: discharge.askNames, path: '/ask?topic=names' },
    ],
  },
];
if (CONVERSATION_ENABLED) SHIFTS.push(conversationEntry);
export const getShift = id => SHIFTS.find(item => item.id === id);
export function progressLabel(item) {
  const state = item.readProgress();
  if (state.stage === item.finalStage) return 'Debrief reached';
  return state.stage > 0 || Object.keys(state.answers).length ? `Continue: ${item.stageTitle(state)}` : 'Not started';
}
export function scenarioLink(path, item) {
  if (path === '/' || path === '/prototypes/the-shift/scenarios.html') return '/shifts';
  if (path === '/abg-lab' && item.id === 'drowsy-patient') return '/abg-lab/resp-acidosis';
  if (path === '/reference-hub' && item.id === 'monitor-alarm') return '/reference-hub/potassium';
  return item.recommendations.some(link => link.path === path) ? path : null;
}
