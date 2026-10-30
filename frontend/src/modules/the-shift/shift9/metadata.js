import { SCENARIO_ID, VERSION, SOURCES, OPEN_ITEMS, title, card, debrief } from './data.js';
import { STORAGE_KEY, FINAL_STAGE, stages, readProgress } from './progress.js';

export const SHIFT9_ID = 'quiet-complaint';

// Released 29 Oct 2026. Founder sign-off of v0.10 and founder-reported independent and psych reviews recorded 28 Oct 2026; founder ECG review 29 Oct 2026.
export const shift9Entry = {
  id: SHIFT9_ID, scenarioId: SCENARIO_ID, contentVersion: VERSION, number: '09', title,
  specialty: card.specialty, difficulty: 'Clinical judgment', duration: card.estimatedTime, analytics: true,
  description: card.coreLesson,
  learnerLevels: ['Student', 'New grad'], decisionCount: card.decisionCount,
  objectives: card.objectives, concepts: card.concepts, judgmentSteps: card.judgmentSteps,
  interactions: ['patient-assignment', 'look-closer', 'assign-the-team', 'then-vs-now', 'interpret-a-result', 'therapeutic-response'],
  review: {
    status: 'Founder clinical sign-off for v0.10, plus independent clinical review and psych specialty review reported by the founder (28 Oct 2026). Reviewer identity, credentials and review dates were not supplied. ECG images passed founder review (29 Oct 2026); no independent specialist ECG validation is recorded. No formal clinical validation is claimed.',
    independentStatus: 'Founder-reported approval', reviewer: null, reviewDate: null, approvedVersion: VERSION,
    sourceVerification: 'Sources were opened by the AI author while drafting. Human passage-level verification has not been recorded. Sources 3, 4 and 5 were opened through ACC summaries. Source 14 now links to its DOI because the copy first read is no longer available.',
  },
  reviewStatus: card.reviewStatus, specialtyReviewRequired: 'psych', specialtyReview: card.specialtyReview,
  sources: Object.entries(SOURCES).map(([number, source]) => ({
    id: `shift9-${number}`, title: source.citation, url: source.url, scope: `Source ${number} (${source.type}). Supports ${source.supports}.`,
    limitation: 'Passage-level verification by a clinical reviewer has not been recorded.',
  })),
  openItems: OPEN_ITEMS,
  storageKey: STORAGE_KEY, readProgress, finalStage: FINAL_STAGE,
  stageTitle: state => stages[state.stage].label,
  // Library poster: a central monitor and a quiet call light (tools/shift9-ecg/thumbnail.py). Decorative on the card,
  // whose title carries the meaning, so the image itself has empty alt text like the other Shift posters.
  image: new URL('./poster.svg', import.meta.url).href, imageAlt: '',
  askQuestion: debrief.ask,
  recommendations: [
    { id: 'ask', title: 'Ask why', detail: 'Prepare an educational question for Ask; nothing is sent automatically.', path: '/ask' },
  ],
};
