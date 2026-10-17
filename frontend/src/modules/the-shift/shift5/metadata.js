import { references } from './data.js';
import { STORAGE_KEY, VERSION } from './rules.js';
import { loadProgress } from './progress.js';

const delegationQuestion = 'How do patient stability, staff competence, RN assessment and local policy affect what a nurse can delegate?';
const bleedingQuestion = 'What are early signs of bleeding after surgery?';

export const shift5Entry = {
  id: 'which-patient-first', scenarioId: 'SHIFT-005', contentVersion: VERSION, originalVersion: '0.4', number: '05',
  title: 'Which Patient First?', specialty: 'Med-Surg', difficulty: 'Clinical judgment', duration: 'One short shift',
  description: 'Four rooms, competing needs and a changing patient. Keep the assignment covered as the shift unfolds.',
  learnerLevels: ['Student', 'New grad'], decisionCount: 5,
  objectives: ['Prioritize a four-patient assignment.', 'Delegate within roles and local policy.', 'Respond to a changing patient.', 'Communicate only observed findings.', 'Close named coverage and follow-up loops.'],
  interactions: ['unit-board', 'room-prioritization', 'staff-assignment', 'finding-discovery', 'report-building', 'closed-loop-handoff'],
  review: {
    status: 'Founder reports that an independent nurse reviewed this scenario and found no material issues. Formal clinical validation is not claimed.',
    independentStatus: 'Founder-reported nurse review', reviewer: null, reviewDate: null, approvedVersion: VERSION,
  },
  sources: references.map(([title, url, scope], index) => ({ id: `shift5-${index + 1}`, title, url, scope, limitation: 'General educational reference; it does not establish local delegation policy or validate every scenario choice.' })),
  storageKey: STORAGE_KEY, readProgress: loadProgress, finalStage: 7,
  stageTitle: state => ['Report', 'Plan your round', 'Answer the lights', 'Room 412', 'Cover your rooms', 'Room 414', 'Close the loops', 'Debrief'][state.stage],
  progressLabel: state => state.stage === 7 ? 'Debrief reached' : state.stage > 0 ? `Continue: ${['Report', 'Plan your round', 'Answer the lights', 'Room 412', 'Cover your rooms', 'Room 414', 'Close the loops', 'Debrief'][state.stage]}` : 'Not started',
  imageAlt: 'Original illustration of a four-room fictional nursing assignment board.',
  askQuestion: delegationQuestion, askQuestions: { delegation: delegationQuestion, bleeding: bleedingQuestion },
  recommendations: [
    { id: 'delegation', title: 'Explore delegation', detail: 'Prepare an educational question for Ask; nothing is sent automatically.', path: '/ask?topic=delegation' },
    { id: 'bleeding', title: 'Explore postoperative changes', detail: 'Prepare an educational question for Ask; normal consent and limits apply.', path: '/ask?topic=bleeding' },
  ],
};
