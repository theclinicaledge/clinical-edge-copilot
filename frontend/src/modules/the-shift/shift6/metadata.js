import { SCENARIO_ID, VERSION, SOURCES, LICENSING_NOTE, OPEN_ITEMS, title, card, debrief } from './data.js';
import { STORAGE_KEY, FINAL_STAGE, stages, readProgress } from './progress.js';
import { SHIFT6_ID } from './feature.js';

export const shift6Entry = {
  id: SHIFT6_ID, scenarioId: SCENARIO_ID, contentVersion: VERSION, number: '06', title,
  specialty: card.specialty, difficulty: card.reviewStatus, duration: card.estimatedTime,
  description: card.coreLesson,
  learnerLevels: ['Student', 'New grad'], decisionCount: card.decisionCount,
  objectives: card.objectives, concepts: card.concepts, judgmentSteps: card.judgmentSteps,
  interactions: ['patient-assignment', 'prioritize', 'trend-reading', 'reveal-and-select-cues', 'call-choice', 'build-the-call'],
  review: {
    status: 'Draft. Founder review and independent clinical sign-off have not been recorded.',
    independentStatus: 'Not reviewed', reviewer: null, reviewDate: null, approvedVersion: null,
  },
  sources: Object.entries(SOURCES).map(([number, source]) => ({
    id: `shift6-${number}`, title: source.citation, url: source.url, scope: `Source ${number}. Supports ${source.supports}.`,
    limitation: source.licensingOpen ? LICENSING_NOTE : 'Draft source mapping. Passage-level verification has not been recorded.',
  })),
  openItems: OPEN_ITEMS,
  storageKey: STORAGE_KEY, readProgress, finalStage: FINAL_STAGE,
  stageTitle: state => stages[state.stage].label,
  imageAlt: 'Original illustration of a night-shift flowsheet with five time columns.',
  askQuestion: debrief.ask,
  recommendations: [
    { id: 'ask', title: 'Ask why', detail: 'Prepare an educational question for Ask; nothing is sent automatically.', path: '/ask' },
  ],
};
